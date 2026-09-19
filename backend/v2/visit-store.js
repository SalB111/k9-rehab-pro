/**
 * K9 Clinical Workflow V2 — Visit Store
 *
 * The longitudinal clinical spine:
 *
 *   Patient -> Visit -> Assessment + Measurements -> Clinical Snapshot
 *                                                 -> Engine -> Protocol Version
 *
 * WHY THIS EXISTS
 * ---------------
 * K9's PATCH /api/patients/:id/measures writes ROM, HCPI, CBPI and LOAD onto the
 * `patients` row, so each measurement overwrites the last and no history
 * survives. Rehabilitation is longitudinal: the clinical question is rarely
 * "what is the pain score" but "what is it compared with three weeks ago".
 * Without history there is no change-since-last-visit, no ROM trend, and no
 * clinical snapshot to open a patient with.
 *
 * This module records visits and measurements append-only, and assembles the
 * snapshot a clinician sees.
 *
 * IT MAKES NO CLINICAL DECISIONS. It records what was observed and computes
 * arithmetic deltas between observations. Interpretation — whether a delta is
 * good, whether to progress, what to prescribe — stays in the K9 engine and
 * with the clinician. `overall_change` is stated by the clinician, never
 * inferred from the numbers here.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VISIT_TYPE = {
  INITIAL: 'INITIAL',
  RECHECK: 'RECHECK',
  REASSESSMENT: 'REASSESSMENT',
  DISCHARGE: 'DISCHARGE',
};

const VISIT_STATUS = { OPEN: 'OPEN', COMPLETED: 'COMPLETED' };

const OVERALL_CHANGE = ['IMPROVED', 'STABLE', 'WORSE', 'NO_SIGNIFICANT_CHANGE'];

/**
 * Assessment columns, in engine-input order.
 *
 * Kept as an explicit list so the same completeness discipline that applies to
 * the engine contract applies here: a field is either recorded or explicitly
 * null, never silently absent.
 */
const ASSESSMENT_FIELDS = [
  'pain_score', 'lameness_grade', 'weight_bearing_status', 'mobility_level', 'gait_quality',
  // Surgical | Conservative | Palliative. Recorded per visit because a
  // conservative trial can convert to surgical mid-course.
  'treatment_approach',
  'mmt_grade', 'ivdd_grade', 'oa_stage',
  'neuro_proprioception', 'neuro_withdrawal', 'neuro_deep_pain', 'neuro_motor_grade',
  'incision_status', 'complications_noted',
  'crate_rest_required', 'e_collar_required',
  'overall_change', 'clinical_observation',
];

/** Measures where a LOWER value is the improving direction. */
const LOWER_IS_BETTER = new Set(['PAIN', 'LAMENESS', 'HCPI', 'CBPI_PSS', 'CBPI_PIS', 'LOAD']);

// ---------------------------------------------------------------------------
// Visits
// ---------------------------------------------------------------------------

function requireActor(actor) {
  if (!actor || actor.id === undefined || actor.id === null || !actor.username) {
    throw new ProtocolStoreError('An identified actor is required for every clinical write', ERR.INVALID);
  }
}

async function createVisit(db, { patientId, visitDate, visitType, actor, notes }) {
  requireActor(actor);
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!visitDate) throw new ProtocolStoreError('visitDate is required', ERR.INVALID);

  const type = visitType || VISIT_TYPE.RECHECK;
  if (!VISIT_TYPE[type]) {
    throw new ProtocolStoreError(`Unknown visit type '${type}'`, ERR.INVALID);
  }

  const result = await db.run(
    `INSERT INTO visits (patient_id, visit_date, visit_type, status, clinician_id, clinician_username, clinician_role, visit_notes)
     VALUES (?, ?, ?, 'OPEN', ?, ?, ?, ?)`,
    [patientId, visitDate, type, actor.id, actor.username, actor.role ?? null, notes ?? null]
  );
  return getVisit(db, result.lastID);
}

async function getVisit(db, visitId) {
  const visit = await db.get(`SELECT * FROM visits WHERE id = ?`, [visitId]);
  if (!visit) throw new ProtocolStoreError(`Visit ${visitId} not found`, ERR.NOT_FOUND);

  const assessment = await db.get(`SELECT * FROM visit_assessments WHERE visit_id = ?`, [visitId]);
  const measurements = await db.all(
    `SELECT * FROM visit_measurements WHERE visit_id = ? ORDER BY recorded_at, id`,
    [visitId]
  );
  return { ...visit, assessment: assessment || null, measurements };
}

async function listVisits(db, patientId) {
  return db.all(
    `SELECT * FROM visits WHERE patient_id = ? ORDER BY visit_date DESC, id DESC`,
    [patientId]
  );
}

function assertOpen(visit) {
  if (visit.status !== VISIT_STATUS.OPEN) {
    throw new ProtocolStoreError(
      `Visit ${visit.id} is ${visit.status} and cannot be edited. ` +
        `Record a new visit rather than rewriting a completed clinical record.`,
      ERR.IMMUTABLE
    );
  }
}

async function completeVisit(db, { visitId, actor }) {
  requireActor(actor);
  const visit = await getVisit(db, visitId);
  assertOpen(visit);
  await db.run(
    `UPDATE visits SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [visitId]
  );
  return getVisit(db, visitId);
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

function normalizeBool(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value === true || value === 'true' || value === 1 || value === '1') return 1;
  if (value === false || value === 'false' || value === 0 || value === '0') return 0;
  return null;
}

/**
 * Record (or amend, while the visit is OPEN) today's structured assessment.
 *
 * Every assessment field is written explicitly — an omitted field is stored as
 * NULL rather than left absent, so "not assessed today" is visible in the record
 * instead of being indistinguishable from a dropped value.
 */
async function recordAssessment(db, { visitId, assessment, actor }) {
  requireActor(actor);
  const visit = await getVisit(db, visitId);
  assertOpen(visit);

  const input = assessment || {};
  if (input.overall_change && !OVERALL_CHANGE.includes(input.overall_change)) {
    throw new ProtocolStoreError(
      `overall_change must be one of ${OVERALL_CHANGE.join(', ')}`,
      ERR.INVALID
    );
  }

  const values = ASSESSMENT_FIELDS.map((field) => {
    const raw = input[field];
    if (field === 'crate_rest_required' || field === 'e_collar_required') return normalizeBool(raw);
    return raw === undefined || raw === '' ? null : raw;
  });

  if (visit.assessment) {
    await db.run(
      `UPDATE visit_assessments
          SET ${ASSESSMENT_FIELDS.map((f) => `${f} = ?`).join(', ')},
              updated_at = CURRENT_TIMESTAMP
        WHERE visit_id = ?`,
      [...values, visitId]
    );
  } else {
    await db.run(
      `INSERT INTO visit_assessments (visit_id, patient_id, ${ASSESSMENT_FIELDS.join(', ')}, recorded_by)
       VALUES (?, ?, ${ASSESSMENT_FIELDS.map(() => '?').join(', ')}, ?)`,
      [visitId, visit.patient_id, ...values, actor.id]
    );
  }

  return getVisit(db, visitId);
}

// ---------------------------------------------------------------------------
// Measurements — append only
// ---------------------------------------------------------------------------

async function recordMeasurement(db, { visitId, measurement, actor }) {
  requireActor(actor);
  const visit = await getVisit(db, visitId);
  assertOpen(visit);

  const m = measurement || {};
  if (!m.measure_key) throw new ProtocolStoreError('measure_key is required', ERR.INVALID);
  if (m.value_numeric === undefined && m.value_text === undefined) {
    throw new ProtocolStoreError('a measurement needs value_numeric or value_text', ERR.INVALID);
  }

  const result = await db.run(
    `INSERT INTO visit_measurements
       (visit_id, patient_id, measure_key, site, side, value_numeric, value_text, unit, supersedes_id, recorded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      visitId,
      visit.patient_id,
      m.measure_key,
      m.site ?? null,
      m.side ?? null,
      m.value_numeric ?? null,
      m.value_text ?? null,
      m.unit ?? null,
      m.supersedes_id ?? null,
      actor.id,
    ]
  );
  return db.get(`SELECT * FROM visit_measurements WHERE id = ?`, [result.lastID]);
}

/**
 * Correct a previous reading.
 *
 * Inserts a NEW row pointing at the one it replaces rather than updating in
 * place. The original stays readable, because a protocol approved on the basis
 * of the original reading must remain explainable by it.
 */
async function correctMeasurement(db, { measurementId, value, actor, note }) {
  requireActor(actor);
  const original = await db.get(`SELECT * FROM visit_measurements WHERE id = ?`, [measurementId]);
  if (!original) throw new ProtocolStoreError(`Measurement ${measurementId} not found`, ERR.NOT_FOUND);

  return recordMeasurement(db, {
    visitId: original.visit_id,
    actor,
    measurement: {
      measure_key: original.measure_key,
      site: original.site,
      side: original.side,
      unit: original.unit,
      value_numeric: typeof value === 'number' ? value : null,
      value_text: typeof value === 'number' ? note ?? null : String(value),
      supersedes_id: measurementId,
    },
  });
}

/**
 * Measurement history for one measure, oldest first, superseded rows removed.
 *
 * Returns the trend a clinician reads: the same measure at the same site on the
 * same side, over time.
 */
async function getMeasurementHistory(db, { patientId, measureKey, site, side }) {
  const params = [patientId, measureKey];
  let sql = `SELECT m.*, v.visit_date
               FROM visit_measurements m
               JOIN visits v ON v.id = m.visit_id
              WHERE m.patient_id = ? AND m.measure_key = ?`;
  if (site) { sql += ` AND m.site = ?`; params.push(site); }
  if (side) { sql += ` AND m.side = ?`; params.push(side); }
  sql += ` ORDER BY v.visit_date, m.id`;

  const rows = await db.all(sql, params);

  // Drop any reading that a later correction supersedes.
  const superseded = new Set(rows.map((r) => r.supersedes_id).filter(Boolean));
  return rows.filter((r) => !superseded.has(r.id));
}

// ---------------------------------------------------------------------------
// Clinical snapshot
// ---------------------------------------------------------------------------

function delta(current, previous) {
  if (current === null || current === undefined || previous === null || previous === undefined) {
    return null;
  }
  const a = Number(current);
  const b = Number(previous);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Number((a - b).toFixed(2));
}

/**
 * Describe a change in plain direction terms.
 *
 * This is arithmetic, not clinical judgement: it says a number moved and in
 * which direction for that measure. It deliberately does not say whether the
 * patient is doing well — the clinician's `overall_change` field is the only
 * clinical verdict in the record.
 */
function describeChange(measureKey, change) {
  if (change === null || change === 0) return 'unchanged';
  const lowerIsBetter = LOWER_IS_BETTER.has(measureKey);
  const improving = lowerIsBetter ? change < 0 : change > 0;
  return improving ? 'moved in the improving direction' : 'moved in the worsening direction';
}

/**
 * Build what a clinician sees when opening a patient.
 *
 * Answers, in order: who is this, what is their current clinical state, what
 * changed since last time, and what is currently prescribed.
 */
async function buildClinicalSnapshot(db, { patientId, patient }) {
  const visits = await listVisits(db, patientId);
  const lastVisit = visits[0] ? await getVisit(db, visits[0].id) : null;
  const priorVisit = visits[1] ? await getVisit(db, visits[1].id) : null;

  // Assessment deltas between the two most recent visits.
  const assessmentChanges = {};
  if (lastVisit?.assessment && priorVisit?.assessment) {
    for (const field of ['pain_score', 'lameness_grade', 'mmt_grade', 'oa_stage']) {
      const change = delta(lastVisit.assessment[field], priorVisit.assessment[field]);
      if (change !== null) {
        const key = field.replace(/_score|_grade|_stage/, '').toUpperCase();
        assessmentChanges[field] = {
          current: lastVisit.assessment[field],
          previous: priorVisit.assessment[field],
          change,
          direction: describeChange(key === 'PAIN' ? 'PAIN' : key, change),
        };
      }
    }
  }

  // Measurement trends: latest reading per measure/site/side, with its delta.
  const allMeasures = await db.all(
    `SELECT DISTINCT measure_key, site, side FROM visit_measurements WHERE patient_id = ?`,
    [patientId]
  );
  const trends = [];
  for (const m of allMeasures) {
    const history = await getMeasurementHistory(db, {
      patientId, measureKey: m.measure_key, site: m.site, side: m.side,
    });
    if (!history.length) continue;
    const latest = history[history.length - 1];
    const previous = history.length > 1 ? history[history.length - 2] : null;
    const change = previous ? delta(latest.value_numeric, previous.value_numeric) : null;
    trends.push({
      measure_key: m.measure_key,
      site: m.site,
      side: m.side,
      unit: latest.unit,
      latest_value: latest.value_numeric ?? latest.value_text,
      latest_date: latest.visit_date,
      previous_value: previous ? (previous.value_numeric ?? previous.value_text) : null,
      change,
      direction: change === null ? null : describeChange(m.measure_key, change),
      reading_count: history.length,
    });
  }

  // Current prescription: the live approved or handed-off version.
  const activeVersion = await db.get(
    `SELECT pv.*, p.id AS protocol_id
       FROM protocol_versions pv
       JOIN protocols p ON p.id = pv.protocol_id
      WHERE p.patient_id = ? AND pv.status IN ('APPROVED','HANDED_OFF')
      ORDER BY pv.version_number DESC LIMIT 1`,
    [patientId]
  );

  let activeProtocol = null;
  if (activeVersion) {
    const restrictions = await db.all(
      `SELECT restriction_type, detail, source FROM protocol_version_restrictions WHERE version_id = ?`,
      [activeVersion.id]
    );
    const flags = JSON.parse(activeVersion.derived_flags_json || '{}');
    activeProtocol = {
      protocol_id: activeVersion.protocol_id,
      version_id: activeVersion.id,
      version_number: activeVersion.version_number,
      status: activeVersion.status,
      protocol_type: activeVersion.protocol_type,
      total_weeks: activeVersion.total_weeks,
      frequency: activeVersion.frequency,
      restrictions,
      // Which safety gates were in force when this was approved. The clinician
      // needs these visible at reassessment: a gate that fired last time is a
      // question to re-ask, not a setting to inherit silently.
      active_safety_gates: Object.entries(flags).filter(([, v]) => v === true).map(([k]) => k),
    };
  }

  return {
    patient: patient || { id: patientId },
    visit_count: visits.length,
    last_visit: lastVisit
      ? {
          id: lastVisit.id,
          visit_date: lastVisit.visit_date,
          visit_type: lastVisit.visit_type,
          status: lastVisit.status,
          clinician: lastVisit.clinician_username,
          overall_change: lastVisit.assessment?.overall_change ?? null,
          clinical_observation: lastVisit.assessment?.clinical_observation ?? null,
        }
      : null,
    current_state: lastVisit?.assessment
      ? Object.fromEntries(ASSESSMENT_FIELDS.map((f) => [f, lastVisit.assessment[f]]))
      : null,
    changes_since_previous_visit: assessmentChanges,
    measurement_trends: trends,
    active_protocol: activeProtocol,
    // Explicit rather than implied: a patient with no prior visit has no
    // baseline, and the clinician should see that stated.
    has_baseline: visits.length > 1,
  };
}

// ---------------------------------------------------------------------------
// Bridge to the engine adapter
// ---------------------------------------------------------------------------

/**
 * Assemble the {patient, visit, clinic, protocol} state that engine-adapter
 * consumes, from the persisted patient record and a visit's assessment.
 *
 * This is the join between the longitudinal record and the clinical engine.
 * Every engine visit-level input is mapped explicitly; the adapter's contract
 * guard will reject the result if any is missing, which is the regression net
 * for the dropped-field defect class.
 */
function toV2State(db, { patient, visit, clinic, protocolParams }) {
  const a = visit?.assessment || {};
  return {
    patient: patient || {},
    visit: {
      treatment_approach: a.treatment_approach,
      pain_score: a.pain_score,
      lameness_grade: a.lameness_grade,
      weight_bearing_status: a.weight_bearing_status,
      mobility_level: a.mobility_level,
      mmt_grade: a.mmt_grade,
      ivdd_grade: a.ivdd_grade,
      oa_stage: a.oa_stage,
      neuro_proprioception: a.neuro_proprioception,
      neuro_withdrawal: a.neuro_withdrawal,
      neuro_deep_pain: a.neuro_deep_pain,
      neuro_motor_grade: a.neuro_motor_grade,
      incision_status: a.incision_status,
      complications_noted: a.complications_noted,
      // Stored as 0/1 integers; the engine reads truthy booleans.
      crate_rest_required: a.crate_rest_required === 1 ? true : a.crate_rest_required === 0 ? false : null,
      e_collar_required: a.e_collar_required === 1 ? true : a.e_collar_required === 0 ? false : null,
    },
    clinic: clinic || {},
    protocol: protocolParams || {},
  };
}

/** Record that a protocol version was generated from a given visit. */
async function linkVersionToVisit(db, { visitId, versionId }) {
  await db.run(
    `INSERT INTO visit_protocol_versions (visit_id, version_id) VALUES (?, ?)`,
    [visitId, versionId]
  );
  return db.get(`SELECT * FROM visit_protocol_versions WHERE version_id = ?`, [versionId]);
}

async function getVisitForVersion(db, versionId) {
  const link = await db.get(
    `SELECT visit_id FROM visit_protocol_versions WHERE version_id = ?`,
    [versionId]
  );
  return link ? getVisit(db, link.visit_id) : null;
}

module.exports = {
  VISIT_TYPE,
  VISIT_STATUS,
  OVERALL_CHANGE,
  ASSESSMENT_FIELDS,

  createVisit,
  getVisit,
  listVisits,
  completeVisit,

  recordAssessment,
  recordMeasurement,
  correctMeasurement,
  getMeasurementHistory,

  buildClinicalSnapshot,
  toV2State,
  linkVersionToVisit,
  getVisitForVersion,
};
