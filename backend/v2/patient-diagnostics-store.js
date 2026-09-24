/**
 * K9 Clinical Workflow V2 — Patient Diagnostic Studies store
 *
 * V3. `patient_diagnostic_studies` is the SOURCE OF TRUTH for the diagnostics
 * block. `patients.dashboard_data` is no longer read for it.
 *
 * A STUDY IS A ROW WITH A DATE.
 *
 * V1 recorded whether a modality had ever been performed and gave it one
 * findings box. A rehabilitation patient is imaged before surgery, after it,
 * and at recheck, and the clinical value of the second study is the comparison
 * with the first — which a single box cannot hold, so the second gets appended
 * to the first and they stop being separable. Four fields in this database are
 * already in that state.
 *
 * TWO THINGS THIS MODULE REFUSES TO DO
 *
 *   1. It never SPLITS a findings text into several studies. Which finding
 *      belongs to which study is a clinical reading, not a parse.
 *   2. It never INFERS `performed_on`. "at 8w" is a point in a recovery, not a
 *      date — it depends on a surgery date this table does not own. NULL means
 *      nobody has said when.
 *
 * Both are REPORTED instead, so a clinician can act on them.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');
const diagnostics = require('./diagnostics');

const TABLE = 'patient_diagnostic_studies';

function blank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

async function assertSchema(db) {
  const rows = await db.all(`PRAGMA table_info(${TABLE})`);
  if (!rows || !rows.length) {
    throw new Error(
      `[patient-diagnostics-store] ${TABLE} does not exist. Apply `
      + `v2/schema/patient-diagnostics.sqlite.sql (it is in schema.js SQLITE_SCHEMAS).`
    );
  }
  const present = new Set(rows.map((r) => r.name));
  const missing = ['category', 'modality', 'panels', 'performed_on', 'findings', 'source_field']
    .filter((c) => !present.has(c));
  if (missing.length) {
    throw new Error(`[patient-diagnostics-store] ${TABLE} is missing columns: ${missing.join(', ')}`);
  }
  return true;
}

function shapeStudy(row) {
  return {
    id: row.id,
    category: row.category,
    modality: row.modality,
    panels: row.panels ? diagnostics.splitMulti(row.panels) : [],
    performed_on: row.performed_on,
    findings: row.findings,
    source_field: row.source_field,
    // Reported, never acted on. See the header.
    describes_multiple_studies: diagnostics.describesMultipleStudies(row.findings),
    needs_a_date: !row.performed_on,
  };
}

/**
 * A patient's diagnostic history.
 *
 * Dated studies come first, newest first — a clinician opening a patient wants
 * the most recent imaging. Undated studies follow: they are the migrated
 * records, and burying them under dated ones would hide the ones that most
 * need a date.
 */
async function getStudies(db, patientId) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);

  const rows = await db.all(
    `SELECT * FROM ${TABLE} WHERE patient_id = ?
      ORDER BY CASE WHEN performed_on IS NULL THEN 1 ELSE 0 END,
               performed_on DESC, id`,
    [patientId]
  );
  const studies = rows.map(shapeStudy);

  return {
    patient_id: patientId,
    studies,
    imaging: studies.filter((s) => s.category === diagnostics.CATEGORY.IMAGING),
    labs: studies.filter((s) => s.category === diagnostics.CATEGORY.LAB),
    summary: {
      total: studies.length,
      undated: studies.filter((s) => s.needs_a_date).length,
      // The ones a clinician should split into separate studies. Surfacing
      // this is the whole reason the block was restructured.
      describing_multiple_studies: studies.filter((s) => s.describes_multiple_studies).length,
    },
    vocabulary: {
      categories: diagnostics.CATEGORIES,
      modalities: diagnostics.IMAGING_MODALITIES,
      panels: diagnostics.LAB_PANELS,
    },
    configured: studies.length > 0,
  };
}

function validateCategory(category, modality, panels) {
  if (!diagnostics.CATEGORIES.includes(category)) {
    throw new ProtocolStoreError(
      `category must be one of ${diagnostics.CATEGORIES.join(', ')} — got ${JSON.stringify(category)}`,
      ERR.INVALID
    );
  }
  if (category === diagnostics.CATEGORY.IMAGING && blank(modality)) {
    throw new ProtocolStoreError('an imaging study needs a modality', ERR.INVALID);
  }
  if (category === diagnostics.CATEGORY.LAB && blank(panels) && blank(modality)) {
    throw new ProtocolStoreError('a laboratory study needs at least one panel', ERR.INVALID);
  }
}

/** Record a study. `performedOn` is optional and NEVER inferred from findings. */
async function addStudy(db, { patientId, category, modality, panels, performedOn, findings, sourceField, actor }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);
  validateCategory(category, modality, panels);

  const panelText = Array.isArray(panels)
    ? panels.filter(Boolean).join(diagnostics.MULTI_DELIMITER)
    : (blank(panels) ? null : String(panels).trim());

  const result = await db.run(
    `INSERT INTO ${TABLE}
       (patient_id, category, modality, panels, performed_on, findings, source_field, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      patientId, category,
      blank(modality) ? null : String(modality).trim(),
      panelText,
      blank(performedOn) ? null : String(performedOn).slice(0, 10),
      blank(findings) ? null : String(findings).trim(),
      sourceField || null,
      actor.id,
    ]
  );
  return result && result.lastID;
}

/** Amend a study — its date, its findings, or the panels it covered. */
async function updateStudy(db, { studyId, performedOn, findings, panels, modality, actor }) {
  if (!studyId) throw new ProtocolStoreError('studyId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const row = await db.get(`SELECT * FROM ${TABLE} WHERE id = ?`, [studyId]);
  if (!row) throw new ProtocolStoreError(`Study ${studyId} not found`, ERR.NOT_FOUND);

  const panelText = panels === undefined
    ? row.panels
    : (Array.isArray(panels)
      ? panels.filter(Boolean).join(diagnostics.MULTI_DELIMITER)
      : (blank(panels) ? null : String(panels).trim()));

  await db.run(
    `UPDATE ${TABLE}
        SET performed_on = ?, findings = ?, panels = ?, modality = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [
      performedOn === undefined ? row.performed_on : (blank(performedOn) ? null : String(performedOn).slice(0, 10)),
      findings === undefined ? row.findings : (blank(findings) ? null : String(findings).trim()),
      panelText,
      modality === undefined ? row.modality : (blank(modality) ? null : String(modality).trim()),
      studyId,
    ]
  );
  return db.get(`SELECT * FROM ${TABLE} WHERE id = ?`, [studyId]);
}

/**
 * The shape the clinical snapshot carries.
 *
 * Surfaced to the CLINICIAN, not to B.E.A.U. A pelvic fracture on a radiograph
 * explains why the programme is what it is, and the person who needs it is
 * whoever opens the patient. Inventing an owner-facing use for imaging
 * findings would be inventing a requirement.
 *
 * Returns null when nothing is on record, not an empty shell.
 */
async function toSnapshot(db, patientId) {
  const record = await getStudies(db, patientId);
  if (!record.configured) return null;
  return {
    studies: record.studies,
    summary: record.summary,
  };
}

module.exports = {
  TABLE,
  assertSchema,
  getStudies,
  addStudy,
  updateStudy,
  toSnapshot,
};
