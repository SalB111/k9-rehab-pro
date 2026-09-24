/**
 * K9 Clinical Workflow V2 — Patient Home Environment store
 *
 * V3. This is the SOURCE OF TRUTH for the home block.
 *
 * `patients.dashboard_data` is no longer read for it. Both screens go through
 * these rows, so there is one record of where a dog lives instead of one in a
 * label-keyed blob and another nowhere.
 *
 * WHAT IS STORED AND WHAT IS NOT
 *
 * Stored: the clinician's own words, one column per question.
 * Not stored: the normalised reading of those words. `home-environment.js`
 * derives traction, stairs, session minutes and the rest on every read,
 * because they are an INTERPRETATION and not the record. The normalisers were
 * corrected five times in a single day; a stored reading would have frozen
 * each of those mistakes into the database.
 *
 * The field list, the option lists and the normalisers all live in
 * `home-environment.js`. This module only persists. `assertColumnsMatchFields`
 * fails at boot if the two ever disagree, so a field added there without a
 * migration here is loud rather than silently unsaveable.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');
const homeEnvironment = require('./home-environment');

/** One column per stated field. Derived, so it cannot drift from the fields. */
const COLUMNS = homeEnvironment.FIELDS.map((f) => f.key);

const TABLE = 'patient_home_environment';

/**
 * Fail loudly if the table and the field list disagree.
 *
 * A field added to home-environment.js without a column here would be accepted
 * by the API, silently dropped on write, and come back empty on read — a
 * clinician would answer a question and the answer would vanish. That is the
 * fails-silent direction, so it is checked at boot instead.
 */
async function assertColumnsMatchFields(db) {
  const rows = await db.all(`PRAGMA table_info(${TABLE})`);
  if (!rows || !rows.length) {
    throw new Error(
      `[patient-home-store] ${TABLE} does not exist. Apply v2/schema/patient-home.sqlite.sql `
      + `(it is in schema.js SQLITE_SCHEMAS) before serving the home block.`
    );
  }
  const present = new Set(rows.map((r) => r.name));
  const missing = COLUMNS.filter((c) => !present.has(c));
  if (missing.length) {
    throw new Error(
      `[patient-home-store] home-environment.js defines fields with no column in ${TABLE}: `
      + `${missing.join(', ')}. A clinician's answer to those would be accepted and silently `
      + `discarded. Add the columns to BOTH schema dialects and re-run schema-parity.`
    );
  }
  return true;
}

function blank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * The home on record for a patient.
 *
 * Always returns the full shape — every field present, `null` where unanswered
 * — so a caller can tell "nobody has said" from "there is no record", and the
 * screen can render every question without holding its own copy of the list.
 */
async function getHome(db, patientId) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);

  const row = await db.get(`SELECT * FROM ${TABLE} WHERE patient_id = ?`, [patientId]);

  const stated = {};
  for (const key of COLUMNS) {
    if (row && !blank(row[key])) stated[key] = String(row[key]).trim();
  }

  const { normalized, uninterpreted } = homeEnvironment.interpret(stated);

  return {
    patient_id: patientId,
    stated,
    normalized,
    uninterpreted,
    // Served rather than duplicated in the screen: label, options and which
    // section a field belongs to. One definition, so a renamed option cannot
    // leave the form and the normalisers reading different vocabularies.
    fieldShape: homeEnvironment.FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      options: f.options || null,
      freeText: !f.options,
    })),
    // How the questions group, and which groups the location answer hides.
    // Served for the same reason as the options: the screen holding its own
    // copy is how the form and the readings drifted apart in the first place.
    sections: homeEnvironment.SECTIONS,
    unanswered: COLUMNS.filter((c) => stated[c] === undefined),
    configured: Boolean(row),
    updated_at: row ? row.updated_at : null,
    updated_by: row ? row.updated_by : null,
  };
}

/**
 * Upsert the home. Only what is mentioned changes.
 *
 * A partial write never blanks a field it did not name — the form saves one
 * answer at a time, and a payload carrying one key must not erase the other
 * sixteen. Passing an explicit empty string DOES clear a field, because that is
 * somebody deliberately removing an answer.
 */
async function setHome(db, { patientId, stated, actor }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!actor || !actor.id) {
    throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);
  }
  const input = stated || {};

  const unknown = Object.keys(input).filter((k) => !COLUMNS.includes(k));
  if (unknown.length) {
    throw new ProtocolStoreError(
      `Unknown home fields: ${unknown.join(', ')}. The field list is home-environment.js FIELDS; `
      + `a new question needs a column in both schema dialects, not a stray key.`,
      ERR.INVALID
    );
  }

  const existing = await db.get(`SELECT * FROM ${TABLE} WHERE patient_id = ?`, [patientId]);

  const merged = {};
  for (const key of COLUMNS) {
    merged[key] = key in input
      ? (blank(input[key]) ? null : String(input[key]).trim())
      : (existing ? existing[key] : null);
  }

  const values = COLUMNS.map((k) => merged[k]);

  if (existing) {
    await db.run(
      `UPDATE ${TABLE}
          SET ${COLUMNS.map((k) => `${k} = ?`).join(', ')},
              updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?`,
      [...values, actor.id, patientId]
    );
  } else {
    await db.run(
      `INSERT INTO ${TABLE} (patient_id, ${COLUMNS.join(', ')}, updated_by)
       VALUES (?, ${COLUMNS.map(() => '?').join(', ')}, ?)`,
      [patientId, ...values, actor.id]
    );
  }

  return getHome(db, patientId);
}

/**
 * The shape the HEP payload carries, from the TABLE rather than the blob.
 *
 * Returns null when nothing is on record — not an empty shell — so B.E.A.U.
 * can tell "no home recorded" from "home recorded with gaps".
 */
async function toHepPayload(db, patientId) {
  const record = await getHome(db, patientId);
  if (!Object.keys(record.stated).length) return null;
  return {
    stated: record.stated,
    normalized: record.normalized,
    uninterpreted: record.uninterpreted,
    recorded_at: record.updated_at,
    recorded_by: record.updated_by,
  };
}

module.exports = {
  TABLE,
  COLUMNS,
  assertColumnsMatchFields,
  getHome,
  setHome,
  toHepPayload,
};
