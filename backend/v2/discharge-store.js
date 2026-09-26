/**
 * K9 Clinical Workflow V2 — Discharge store
 *
 * The end of an episode of care, and WHY it ended.
 *
 * THE DEFECT THIS REPLACES
 *
 * Until 2026-09-26 nothing recorded that care had ended. `handleDischarge` in
 * DashboardView PUT `{ status: "discharged" }` to `PUT /api/patients/:id` — a
 * route that does not destructure `status`, onto a `patients` table with no
 * such column — and never read the response:
 *
 *     await fetch(..., { method: "PUT", body: JSON.stringify({ status: "discharged" }) });
 *     setDischarged(true);
 *
 * So the screen said PATIENT DISCHARGED and the claim survived until the next
 * page load. `VISIT_TYPE.DISCHARGE` had existed since the visit store was
 * written and nothing had ever created one.
 *
 * WHY THE REASON IS THE POINT
 *
 * Sal, 2026-09-26: "in real life situation, a client may decide to stop after
 * 1 session 3,3 or even 4 sessions, because may be financial constraints or
 * has improved doing home exercises may be swants to continue with BEAU".
 *
 * Those endings are clinically different. CLAUDE.md's Outcome Monitoring
 * section wants outcome data feeding the audit trail for efficacy tracking,
 * and efficacy cannot be read from a record in which "improved and went home"
 * and "could not afford to continue" are the same row.
 *
 * WHAT THIS STORE REFUSES TO DO
 *
 *   * It never records a discontinuation as a completion, or the reverse.
 *     COMPLETED and DISCONTINUED are separate outcomes (Sal's decision), and
 *     each reason belongs to exactly one of them.
 *
 *   * It never accepts a stated clinical outcome with no measure behind it.
 *     "IMPROVED" with nothing to say what improved is an unsourced clinical
 *     claim, which is what the Anti-Hallucination Rules exist to stop.
 *
 *   * It never lets anyone TYPE that a patient was handed off to B.E.A.U.
 *     `handoff_id` is read from `beau_handoffs`. A handoff that did not happen
 *     cannot be claimed.
 *
 *   * It never writes a `patients.status` flag. A discharged patient can come
 *     back, and the flag would then be a stale lie on the record. Active vs
 *     discharged is DERIVED — see `isDischarged`.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');
const visitStore = require('./visit-store');
const { resolveClinicId } = require('./resolve-clinic');

// ---------------------------------------------------------------------------
// Vocabulary
//
// Sal's list, confirmed verbatim 2026-09-26: "THE REASON LIST IS CORRECT".
// It is CLINICAL vocabulary and therefore his to change, not this file's.
// ---------------------------------------------------------------------------

const OUTCOME = {
  /** The protocol ran its course. A clinical endpoint. */
  COMPLETED: 'COMPLETED',
  /** Care stopped before the protocol finished. An interruption, not a failure. */
  DISCONTINUED: 'DISCONTINUED',
};

const REASON_STATUS = {
  KNOWN: 'KNOWN',
  /** Sal: "THEN WE CONTACT THE OWNER TO FIND OUT WHY?" */
  PENDING_OWNER_CONTACT: 'PENDING_OWNER_CONTACT',
  OWNER_UNREACHABLE: 'OWNER_UNREACHABLE',
};

const CLINICAL_OUTCOME = {
  IMPROVED: 'IMPROVED',
  UNCHANGED: 'UNCHANGED',
  WORSE: 'WORSE',
  /** Nobody judged it. Distinct from "unchanged", which is a judgement. */
  NOT_ASSESSED: 'NOT_ASSESSED',
};

/**
 * Every legal reason, and which outcome it belongs to.
 *
 * A reason belongs to exactly ONE outcome. That is what stops a dog that
 * stopped at week 2 from being counted among the completions.
 */
const REASONS = [
  // ── COMPLETED ────────────────────────────────────────────────────────────
  { code: 'PROTOCOL_COMPLETED', outcome: OUTCOME.COMPLETED, label: 'Completed the full protocol' },
  { code: 'GOALS_MET_EARLY', outcome: OUTCOME.COMPLETED, label: 'Goals met — discharged early by clinician' },

  // ── DISCONTINUED ─────────────────────────────────────────────────────────
  // This is the one Sal named first, and it is the reason B.E.A.U. at Home
  // exists. It is a DISCONTINUATION because the protocol did not finish — and
  // `handoff_id` on the same row is what distinguishes it from giving up.
  { code: 'IMPROVED_CONTINUING_AT_HOME', outcome: OUTCOME.DISCONTINUED, label: 'Improved — owner continuing at home with B.E.A.U.' },
  { code: 'FINANCIAL', outcome: OUTCOME.DISCONTINUED, label: 'Financial constraint' },
  { code: 'OWNER_CHOSE_TO_STOP', outcome: OUTCOME.DISCONTINUED, label: 'Owner chose to stop' },
  { code: 'TRANSPORT_SCHEDULING', outcome: OUTCOME.DISCONTINUED, label: 'Transport / scheduling' },
  { code: 'REFERRED_OUT', outcome: OUTCOME.DISCONTINUED, label: 'Referred to another provider' },
  { code: 'MEDICAL_COMPLICATION', outcome: OUTCOME.DISCONTINUED, label: 'Medical — complication or new diagnosis' },
  { code: 'PATIENT_DIED', outcome: OUTCOME.DISCONTINUED, label: 'Patient died' },
  { code: 'LOST_TO_FOLLOW_UP', outcome: OUTCOME.DISCONTINUED, label: 'Lost to follow-up' },

  // The honest blank. Legal ONLY with a reason_status that says so, which is
  // enforced both here and by a CHECK constraint in the schema.
  { code: 'NOT_YET_KNOWN', outcome: OUTCOME.DISCONTINUED, label: 'Not yet known — contacting owner' },
];

const REASON_BY_CODE = new Map(REASONS.map((r) => [r.code, r]));

const UNKNOWN_REASON = 'NOT_YET_KNOWN';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function requireActor(actor) {
  if (!actor || actor.id === undefined || actor.id === null || !actor.username) {
    throw new ProtocolStoreError(
      'An identified actor is required for every clinical write',
      ERR.INVALID
    );
  }
}

/**
 * Check the outcome/reason/reason_status triple.
 *
 * Exported because the route, the tests and the mutation suite all need the
 * same answer, and a second copy of a rule is a second rule.
 */
function validateOutcome({ outcome, reason, reasonStatus }) {
  if (!OUTCOME[outcome]) {
    throw new ProtocolStoreError(
      `Unknown outcome '${outcome}'. Care ends as ${Object.keys(OUTCOME).join(' or ')} — `
      + 'completing the protocol and stopping early are different clinical events.',
      ERR.INVALID
    );
  }

  const entry = REASON_BY_CODE.get(reason);
  if (!entry) {
    throw new ProtocolStoreError(
      `Unknown discharge reason '${reason}'. Legal reasons: `
      + `${REASONS.map((r) => r.code).join(', ')}`,
      ERR.INVALID
    );
  }

  if (entry.outcome !== outcome) {
    throw new ProtocolStoreError(
      `'${reason}' is a ${entry.outcome} reason and cannot be recorded against a `
      + `${outcome} discharge. Counting one as the other is exactly what keeping `
      + 'the two outcomes apart is for.',
      ERR.INVALID
    );
  }

  const status = reasonStatus || REASON_STATUS.KNOWN;
  if (!REASON_STATUS[status]) {
    throw new ProtocolStoreError(
      `Unknown reason status '${status}'. One of ${Object.keys(REASON_STATUS).join(', ')}.`,
      ERR.INVALID
    );
  }

  if (outcome === OUTCOME.COMPLETED && status !== REASON_STATUS.KNOWN) {
    throw new ProtocolStoreError(
      'A completed course of care has a known reason by definition — there is '
      + 'nothing to ask the owner. Record it as DISCONTINUED if care stopped for '
      + 'a reason nobody has established yet.',
      ERR.INVALID
    );
  }

  const isUnknown = reason === UNKNOWN_REASON;
  if (isUnknown && status === REASON_STATUS.KNOWN) {
    throw new ProtocolStoreError(
      `'${UNKNOWN_REASON}' contradicts a reason status of KNOWN. Either name the `
      + 'reason, or say it is pending owner contact.',
      ERR.INVALID
    );
  }
  if (!isUnknown && status !== REASON_STATUS.KNOWN) {
    throw new ProtocolStoreError(
      `A reason status of ${status} means nobody has established why care ended, `
      + `so the reason must be '${UNKNOWN_REASON}' rather than '${reason}'. A `
      + 'guess recorded as a finding is the thing this record exists to prevent.',
      ERR.INVALID
    );
  }

  return { outcome, reason, reasonStatus: status };
}

/**
 * A stated clinical outcome must say what it was judged against.
 *
 * CLAUDE.md, Anti-Hallucination Rules: a value that cannot be sourced is
 * flagged, not asserted. "IMPROVED" with nothing behind it is an opinion
 * wearing the clothes of a measurement.
 */
function validateClinicalOutcome({ clinicalOutcome, outcomeMeasuredBy }) {
  const value = clinicalOutcome || CLINICAL_OUTCOME.NOT_ASSESSED;
  if (!CLINICAL_OUTCOME[value]) {
    throw new ProtocolStoreError(
      `Unknown clinical outcome '${value}'. One of ${Object.keys(CLINICAL_OUTCOME).join(', ')}.`,
      ERR.INVALID
    );
  }
  const measure = outcomeMeasuredBy == null ? null : String(outcomeMeasuredBy).trim() || null;
  if (value !== CLINICAL_OUTCOME.NOT_ASSESSED && !measure) {
    throw new ProtocolStoreError(
      `A clinical outcome of ${value} must name what it was measured against `
      + '(HCPI, lameness grade, goniometric ROM, clinician observation...). '
      + 'Record NOT_ASSESSED rather than stating an outcome nothing supports.',
      ERR.INVALID
    );
  }
  return { clinicalOutcome: value, outcomeMeasuredBy: measure };
}

function asPositiveInt(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new ProtocolStoreError(`${fieldName} must be a whole number of weeks`, ERR.INVALID);
  }
  return n;
}

async function assertSchema(db) {
  const cols = await db.all('PRAGMA table_info(patient_discharges)');
  if (!cols || !cols.length) {
    throw new ProtocolStoreError(
      'patient_discharges does not exist. Restart the backend so v2/schema.js '
      + 'applies patient-discharge.sqlite.sql.',
      ERR.INTEGRITY
    );
  }
}

// ---------------------------------------------------------------------------
// What the record already knows — derived, never typed
// ---------------------------------------------------------------------------

/**
 * The live B.E.A.U. handoff for this patient, if there is one.
 *
 * This is why "went home with B.E.A.U." is not a checkbox. It is the presence
 * of a real handoff row or it is nothing.
 */
async function activeHandoff(db, patientId) {
  return db.get(
    `SELECT * FROM beau_handoffs
      WHERE patient_id = ? AND status = 'ACTIVE'
      ORDER BY handed_off_at DESC, id DESC
      LIMIT 1`,
    [patientId]
  );
}

/** How long the protocol they were on was meant to run. */
async function currentProtocolWeeks(db, patientId) {
  const row = await db.get(
    `SELECT pv.total_weeks AS total_weeks
       FROM protocol_versions pv
       JOIN protocols p ON p.id = pv.protocol_id
      WHERE p.patient_id = ?
        AND pv.status IN ('APPROVED', 'HANDED_OFF')
      ORDER BY pv.created_at DESC, pv.id DESC
      LIMIT 1`,
    [patientId]
  );
  return row && row.total_weeks != null ? row.total_weeks : null;
}

/** Completed visits on the record. Sal counts endings in sessions. */
async function visitsAttended(db, patientId) {
  const row = await db.get(
    `SELECT COUNT(*) AS n FROM visits WHERE patient_id = ? AND status = 'COMPLETED'`,
    [patientId]
  );
  return row ? row.n : 0;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The most recent discharge on this patient, or null. */
async function getDischarge(db, patientId) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  await assertSchema(db);
  const row = await db.get(
    `SELECT d.*, v.visit_date AS discharge_date, c.clinic_name AS clinic_name
       FROM patient_discharges d
       LEFT JOIN visits  v ON v.id = d.visit_id
       LEFT JOIN clinics c ON c.id = d.clinic_id
      WHERE d.patient_id = ?
      ORDER BY d.discharged_at DESC, d.id DESC
      LIMIT 1`,
    [patientId]
  );
  return row || null;
}

/**
 * Is this patient currently discharged?
 *
 * DERIVED, because a stored flag would be wrong the moment a discharged
 * patient comes back and nobody remembered to clear it. A discharge ends an
 * EPISODE; a visit after it starts a new one.
 */
async function isDischarged(db, patientId) {
  const discharge = await getDischarge(db, patientId);
  if (!discharge) return { discharged: false, discharge: null };

  const later = await db.get(
    `SELECT id FROM visits
      WHERE patient_id = ? AND id <> ? AND created_at > ?
      LIMIT 1`,
    [patientId, discharge.visit_id, discharge.discharged_at]
  );
  return { discharged: !later, discharge, reopenedBy: later ? later.id : null };
}

/** Every discharge, newest first. For outcome reporting. */
async function listDischarges(db, { clinicId, limit = 100, offset = 0 } = {}) {
  await assertSchema(db);
  const where = clinicId ? 'WHERE d.clinic_id = ?' : '';
  const params = clinicId ? [clinicId, limit, offset] : [limit, offset];
  return db.all(
    `SELECT d.*, p.name AS patient_name, v.visit_date AS discharge_date,
            c.clinic_name AS clinic_name
       FROM patient_discharges d
       LEFT JOIN patients p ON p.id = d.patient_id
       LEFT JOIN visits   v ON v.id = d.visit_id
       LEFT JOIN clinics  c ON c.id = d.clinic_id
       ${where}
      ORDER BY d.discharged_at DESC, d.id DESC
      LIMIT ? OFFSET ?`,
    params
  );
}

// ---------------------------------------------------------------------------
// The write
// ---------------------------------------------------------------------------

/**
 * End an episode of care.
 *
 * Creates a DISCHARGE visit — care ending is a clinical event on a date with a
 * clinician's name on it, which is what a visit is — and records the outcome
 * against it.
 */
async function dischargePatient(db, {
  patientId,
  outcome,
  reason,
  reasonStatus,
  reasonNote,
  clinicalOutcome,
  outcomeMeasuredBy,
  weekReached,
  phaseReached,
  dischargeSummary,
  dischargeDate,
  clinicId: givenClinicId,
  actor,
} = {}) {
  requireActor(actor);
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  await assertSchema(db);

  const patient = await db.get('SELECT id, name FROM patients WHERE id = ?', [patientId]);
  if (!patient) throw new ProtocolStoreError(`Patient ${patientId} not found`, ERR.NOT_FOUND);

  const checked = validateOutcome({ outcome, reason, reasonStatus });
  const judged = validateClinicalOutcome({ clinicalOutcome, outcomeMeasuredBy });

  const existing = await isDischarged(db, patientId);
  if (existing.discharged) {
    throw new ProtocolStoreError(
      `${patient.name} was already discharged on ${existing.discharge.discharge_date}. `
      + 'Record a visit to reopen the episode before discharging again.',
      ERR.IMMUTABLE
    );
  }

  // The route hands this down from its own injectable resolver so a discharge
  // is attributed by the same rule as every other write. Scripts and tests
  // that have no request fall back to the same rule directly.
  const clinicId = givenClinicId != null ? givenClinicId : await resolveClinicId(db, actor);
  const handoff = await activeHandoff(db, patientId);
  const totalWeeks = await currentProtocolWeeks(db, patientId);
  const attended = await visitsAttended(db, patientId);

  const date = dischargeDate || new Date().toISOString().slice(0, 10);

  // The visit first: a discharge with no encounter behind it is a database row
  // pretending to be a clinical event.
  const visit = await visitStore.createVisit(db, {
    patientId,
    visitDate: date,
    visitType: visitStore.VISIT_TYPE.DISCHARGE,
    clinicId,
    actor,
    notes: dischargeSummary || null,
  });

  const result = await db.run(
    `INSERT INTO patient_discharges (
       patient_id, visit_id, clinic_id,
       outcome, reason, reason_status, reason_note,
       week_reached, total_weeks, phase_reached, visits_attended,
       clinical_outcome, outcome_measured_by,
       handoff_id, discharge_summary, discharged_by
     ) VALUES (?, ?, ?,  ?, ?, ?, ?,  ?, ?, ?, ?,  ?, ?,  ?, ?, ?)`,
    [
      patientId, visit.id, clinicId,
      checked.outcome, checked.reason, checked.reasonStatus,
      reasonNote == null ? null : String(reasonNote).trim() || null,
      asPositiveInt(weekReached, 'weekReached'), totalWeeks,
      phaseReached == null ? null : String(phaseReached).trim() || null,
      attended,
      judged.clinicalOutcome, judged.outcomeMeasuredBy,
      handoff ? handoff.id : null,
      dischargeSummary == null ? null : String(dischargeSummary).trim() || null,
      actor.id,
    ]
  );

  await visitStore.completeVisit(db, { visitId: visit.id, actor });

  return getDischarge(db, patientId);
}

/**
 * Fill in the reason after the owner has been reached.
 *
 * Sal, 2026-09-26: "THEN WE CONTACT THE OWNER TO FIND OUT WHY?". The answer
 * arrives days later, and the record must be able to say both that it did and
 * that it was not known on the day — hence `reason_updated_at` rather than
 * quietly overwriting as though it had always been there.
 *
 * Only the reason can be amended. The outcome, the dates and the clinical
 * findings are the clinical record and stay as recorded.
 */
async function updateReason(db, { dischargeId, reason, reasonStatus, reasonNote, actor } = {}) {
  requireActor(actor);
  if (!dischargeId) throw new ProtocolStoreError('dischargeId is required', ERR.INVALID);
  await assertSchema(db);

  const row = await db.get('SELECT * FROM patient_discharges WHERE id = ?', [dischargeId]);
  if (!row) throw new ProtocolStoreError(`Discharge ${dischargeId} not found`, ERR.NOT_FOUND);

  const checked = validateOutcome({
    outcome: row.outcome,
    reason,
    reasonStatus: reasonStatus || REASON_STATUS.KNOWN,
  });

  await db.run(
    `UPDATE patient_discharges
        SET reason = ?, reason_status = ?, reason_note = ?,
            reason_updated_at = CURRENT_TIMESTAMP, reason_updated_by = ?
      WHERE id = ?`,
    [
      checked.reason, checked.reasonStatus,
      reasonNote == null ? row.reason_note : String(reasonNote).trim() || null,
      actor.id, dischargeId,
    ]
  );

  return db.get('SELECT * FROM patient_discharges WHERE id = ?', [dischargeId]);
}

module.exports = {
  OUTCOME,
  REASON_STATUS,
  CLINICAL_OUTCOME,
  REASONS,
  UNKNOWN_REASON,

  validateOutcome,
  validateClinicalOutcome,

  dischargePatient,
  updateReason,
  getDischarge,
  isDischarged,
  listDischarges,
};
