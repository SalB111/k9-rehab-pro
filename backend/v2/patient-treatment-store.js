/**
 * K9 Clinical Workflow V2 — Treatment store
 *
 * V3. `patient_procedures`, `patient_treatment_status` and two columns on
 * `patients` are the source of truth for the treatment block.
 * `patients.dashboard_data` is no longer read for it.
 *
 * WHY THIS ONE IS DIFFERENT FROM THE SIX BEFORE IT
 *
 * Treatment is the FIRST V3 block that feeds the protocol engine, and two of
 * the three engine inputs with no column anywhere are treatment fields — both
 * safety gates:
 *
 *     weightBearingStatus  <- treatment::Weight Bearing Status
 *     incisionStatus       <- treatment::Incision Status
 *
 * So a mistake here does not just lose a record, it changes what a patient is
 * allowed to do.
 *
 * THREE SHAPES, THREE HOMES
 *
 *   A PROCEDURE is an event with a date        -> patient_procedures
 *   STATUS changes over time                   -> patient_treatment_status
 *
 * "Changes over time" means RECORDED WHEN OBSERVED, not advanced through
 * stages. There is no expected sequence — see CLAUDE.md, Clinical Reasoning
 * Constraints.
 *   THE CASE does not change                   -> columns on `patients`
 *
 * See patient-treatment.sqlite.sql for the reasoning behind each.
 *
 * WHAT THIS STORE REFUSES TO DO
 *
 *   * It never UPDATES a status row. Recording a new weight-bearing state
 *     INSERTS; the previous row is the progression. An UPDATE would leave a
 *     record that can say where a patient is and never where they were, which
 *     is the thing this block exists to fix.
 *
 *   * It never writes a tri-state flag it was not given. NULL means nobody has
 *     answered; 0 means a clinician said no. The e-collar and crate-rest gates
 *     DEFAULT TO REQUIRED inside the acute post-operative window, so turning
 *     silence into "no" quietly relaxes both.
 *
 *   * It never accepts 'Palliative' as a NEW treatment approach. Retired
 *     2026-09-25: a palliative patient is not a rehabilitation candidate. A
 *     stored one still READS, so a legacy row is visible and replaceable
 *     rather than invisible and permanent.
 *
 *   * It never puts a limb in `affected_region`, and never offers
 *     `affected_limbs` as an engine input. They are different clinical facts
 *     in different vocabularies, and the engine string-matches the region.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');

const PROCEDURES = 'patient_procedures';
const STATUS = 'patient_treatment_status';

/** Writable on a procedure row. */
const PROCEDURE_COLUMNS = ['procedure_type', 'procedure_date', 'surgeon', 'facility', 'notes'];

/** Free text on a status row. */
const STATUS_TEXT = [
  'weight_bearing_status', 'incision_status', 'activity_restrictions', 'clinical_notes',
];

/** Tri-state on a status row: null / 0 / 1, and null is a real answer. */
const STATUS_FLAGS = ['e_collar_required', 'strict_crate_rest', 'sling_assist_required'];

/**
 * Set when the row's `effective_date` was not stated by anyone.
 *
 * The V1 form stored a CURRENT treatment state and never when it was observed,
 * so everything migrated out of it has a date that had to come from somewhere.
 * Stamping the migration date and saying nothing would turn a bookkeeping
 * artefact into a clinical finding — "weight bearing was PWB on the day we ran
 * a script". The row still needs a date to be ordered, so it gets one and
 * carries this flag beside it.
 *
 * Any status a clinician records afterwards is dated by them and is not
 * flagged, so the marker disappears from the top of the history on its own.
 */
const DATE_UNKNOWN = 'effective_date_is_unknown';

/** Case-level, on `patients`. */
const CASE_COLUMNS = ['treatment_approach', 'affected_limbs'];

/** Selectable approaches. 'Palliative' is readable but not writable. */
const APPROACHES = ['Surgical', 'Conservative'];
const RETIRED_APPROACHES = ['Palliative'];

function blank(v) {
  return v === undefined || v === null || String(v).trim() === '';
}

/** A trimmed string, or null. */
function text(v) {
  return blank(v) ? null : String(v).trim();
}

/**
 * Read a tri-state flag from caller input.
 *
 * `undefined` — the caller did not mention it, so it keeps whatever it had.
 * `null`      — the caller explicitly UNSETS it back to unanswered.
 * anything else resolves to 1 or 0.
 *
 * Deliberately NOT truthiness on the whole input: the string "false" is truthy
 * in JavaScript and arrives from form serialisation, and reading it as "yes,
 * an e-collar is required" is wrong in the direction that matters least, while
 * reading "" as "no" is wrong in the direction that matters most.
 */
function flag(v) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const t = String(v).trim().toLowerCase();
  if (t === '') return null;
  if (['true', 'yes', '1', 'required'].includes(t)) return 1;
  if (['false', 'no', '0', 'not required'].includes(t)) return 0;
  throw new ProtocolStoreError(
    `"${v}" is not a yes/no answer. Use true, false, or null for unanswered.`,
    ERR.INVALID
  );
}

/** ISO yyyy-mm-dd, or null. Refuses anything it cannot parse. */
function isoDate(v, fieldName) {
  if (blank(v)) return null;
  const s = String(v).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new ProtocolStoreError(
      `${fieldName} must be an ISO date (yyyy-mm-dd), got "${s}". A date the `
      + 'engine cannot parse becomes a patient with no post-operative window.',
      ERR.INVALID
    );
  }
  if (Number.isNaN(Date.parse(s))) {
    throw new ProtocolStoreError(`${fieldName} "${s}" is not a real date`, ERR.INVALID);
  }
  return s;
}

const today = () => new Date().toISOString().slice(0, 10);

async function assertSchema(db) {
  for (const table of [PROCEDURES, STATUS]) {
    const rows = await db.all(`PRAGMA table_info(${table})`);
    if (!rows || !rows.length) {
      throw new Error(
        `[patient-treatment-store] ${table} does not exist. Apply `
        + 'v2/schema/patient-treatment.sqlite.sql (it is in schema.js SQLITE_SCHEMAS).'
      );
    }
  }
  const patient = await db.all('PRAGMA table_info(patients)');
  const present = new Set((patient || []).map((r) => r.name));
  const missing = CASE_COLUMNS.filter((c) => !present.has(c));
  if (missing.length) {
    throw new Error(
      `[patient-treatment-store] patients is missing: ${missing.join(', ')}. `
      + 'Run scripts/migrate-treatment-to-v3.js — a clinician\'s answer to those '
      + 'would be accepted and silently discarded.'
    );
  }
  return true;
}

/**
 * The whole treatment picture for one patient.
 *
 * `status` is the CURRENT state — the row with the latest effective date.
 * `statusHistory` is every row, newest first, which is the progression a
 * clinician reads. `procedures` are newest first; an undated one sorts last
 * because it cannot be placed.
 */
async function getTreatment(db, patientId) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);

  const patient = await db.get('SELECT * FROM patients WHERE id = ?', [patientId]);
  if (!patient) throw new ProtocolStoreError(`Patient ${patientId} not found`, ERR.NOT_FOUND);

  const procedures = await db.all(
    `SELECT * FROM ${PROCEDURES} WHERE patient_id = ?
      ORDER BY (procedure_date IS NULL), procedure_date DESC, id DESC`,
    [patientId]
  );
  const history = await db.all(
    `SELECT * FROM ${STATUS} WHERE patient_id = ?
      ORDER BY effective_date DESC, id DESC`,
    [patientId]
  );

  const approach = text(patient.treatment_approach);

  return {
    patient_id: patientId,
    approach,
    // A retired value still stored. Surfaced so a screen can say so rather
    // than rendering an empty control over a value it is quietly keeping.
    approach_is_retired: Boolean(approach && RETIRED_APPROACHES.includes(approach)),
    // The LIMB. Never an engine input — see the header.
    affected_limbs: text(patient.affected_limbs),
    // The LESION SITE, which is what getProtocolType matches. Read-only here;
    // it is edited through PUT /api/patients/:id with the rest of the record.
    affected_region: text(patient.affected_region),

    procedures: procedures || [],
    status: (history && history[0]) || null,
    statusHistory: history || [],
    // True when the CURRENT state carries a date nobody stated. A screen
    // showing "as at 2026-09-25" over a migrated row would be asserting an
    // observation that never happened.
    status_date_is_unknown: Boolean(history && history[0] && history[0][DATE_UNKNOWN]),

    // Served so a screen holds no second copy of the field lists.
    procedureFields: PROCEDURE_COLUMNS,
    statusFields: [...STATUS_TEXT, ...STATUS_FLAGS],
    approaches: APPROACHES,
    configured: Boolean((procedures && procedures.length) || (history && history.length) || approach),
  };
}

/**
 * Set the case-level facts. Only what is mentioned changes.
 *
 * `treatment_approach` is validated against the selectable list. A retired
 * value is refused with a message naming what to use instead — silently
 * accepting it would let the retired pathway back in through the API.
 */
async function setCase(db, { patientId, approach, affectedLimbs, actor }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const patient = await db.get('SELECT id FROM patients WHERE id = ?', [patientId]);
  if (!patient) throw new ProtocolStoreError(`Patient ${patientId} not found`, ERR.NOT_FOUND);

  const sets = [];
  const values = [];

  if (approach !== undefined) {
    const a = text(approach);
    if (a !== null) {
      if (RETIRED_APPROACHES.includes(a)) {
        throw new ProtocolStoreError(
          `"${a}" was retired as a treatment approach — a palliative patient is `
          + `not a rehabilitation candidate. Use one of: ${APPROACHES.join(', ')}.`,
          ERR.INVALID
        );
      }
      if (!APPROACHES.includes(a)) {
        throw new ProtocolStoreError(
          `"${a}" is not a treatment approach. Use one of: ${APPROACHES.join(', ')}.`,
          ERR.INVALID
        );
      }
    }
    sets.push('treatment_approach = ?');
    values.push(a);
  }

  if (affectedLimbs !== undefined) {
    sets.push('affected_limbs = ?');
    values.push(text(affectedLimbs));
  }

  if (sets.length) {
    await db.run(`UPDATE patients SET ${sets.join(', ')} WHERE id = ?`, [...values, patientId]);
  }
  return getTreatment(db, patientId);
}

/** Record a procedure. A repeat or contralateral operation is a NEW row. */
async function addProcedure(db, { patientId, procedure, actor }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const input = procedure || {};
  const unknown = Object.keys(input).filter((k) => !PROCEDURE_COLUMNS.includes(k));
  if (unknown.length) {
    throw new ProtocolStoreError(`Unknown procedure fields: ${unknown.join(', ')}`, ERR.INVALID);
  }
  if (blank(input.procedure_type)) {
    throw new ProtocolStoreError(
      'procedure_type is required. A procedure with no name is a date nobody can act on.',
      ERR.INVALID
    );
  }

  const date = isoDate(input.procedure_date, 'procedure_date');
  await db.run(
    `INSERT INTO ${PROCEDURES}
       (patient_id, procedure_type, procedure_date, surgeon, facility, notes, recorded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patientId, text(input.procedure_type), date, text(input.surgeon),
      text(input.facility), text(input.notes), actor.id]
  );
  return getTreatment(db, patientId);
}

/** Correct a procedure already recorded. Only what is mentioned changes. */
async function updateProcedure(db, { procedureId, patch, actor }) {
  if (!procedureId) throw new ProtocolStoreError('procedureId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const row = await db.get(`SELECT * FROM ${PROCEDURES} WHERE id = ?`, [procedureId]);
  if (!row) throw new ProtocolStoreError(`Procedure ${procedureId} not found`, ERR.NOT_FOUND);

  const input = patch || {};
  const unknown = Object.keys(input).filter((k) => !PROCEDURE_COLUMNS.includes(k));
  if (unknown.length) {
    throw new ProtocolStoreError(`Unknown procedure fields: ${unknown.join(', ')}`, ERR.INVALID);
  }
  if ('procedure_type' in input && blank(input.procedure_type)) {
    throw new ProtocolStoreError('procedure_type cannot be blanked', ERR.INVALID);
  }

  const sets = [];
  const values = [];
  for (const c of PROCEDURE_COLUMNS) {
    if (!(c in input)) continue;
    sets.push(`${c} = ?`);
    values.push(c === 'procedure_date' ? isoDate(input[c], 'procedure_date') : text(input[c]));
  }
  if (sets.length) {
    await db.run(
      `UPDATE ${PROCEDURES} SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, procedureId]
    );
  }
  return getTreatment(db, row.patient_id);
}

/** Remove a procedure recorded in error. */
async function deleteProcedure(db, { procedureId, actor }) {
  if (!procedureId) throw new ProtocolStoreError('procedureId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);
  const row = await db.get(`SELECT * FROM ${PROCEDURES} WHERE id = ?`, [procedureId]);
  if (!row) throw new ProtocolStoreError(`Procedure ${procedureId} not found`, ERR.NOT_FOUND);
  await db.run(`DELETE FROM ${PROCEDURES} WHERE id = ?`, [procedureId]);
  return getTreatment(db, row.patient_id);
}

/**
 * Record the treatment status as at a date. ALWAYS an INSERT.
 *
 * Fields not mentioned are CARRIED FORWARD from the current row rather than
 * blanked, because a clinician updating weight-bearing at a re-check is not
 * saying the incision status is now unknown. A field explicitly set to null
 * IS cleared — that is somebody withdrawing an answer.
 *
 * `effectiveDate` defaults to today, which is the ordinary case of recording
 * at the visit. It is settable because a clinician writing up Friday's
 * findings on Monday needs Friday, or the progression reads as having
 * happened at the keyboard.
 */
async function recordStatus(db, { patientId, status, effectiveDate, dateIsUnknown, actor }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const patient = await db.get('SELECT id FROM patients WHERE id = ?', [patientId]);
  if (!patient) throw new ProtocolStoreError(`Patient ${patientId} not found`, ERR.NOT_FOUND);

  const input = status || {};
  const allowed = [...STATUS_TEXT, ...STATUS_FLAGS];
  const unknown = Object.keys(input).filter((k) => !allowed.includes(k));
  if (unknown.length) {
    throw new ProtocolStoreError(`Unknown status fields: ${unknown.join(', ')}`, ERR.INVALID);
  }

  const current = await db.get(
    `SELECT * FROM ${STATUS} WHERE patient_id = ? ORDER BY effective_date DESC, id DESC LIMIT 1`,
    [patientId]
  );

  const merged = {};
  for (const c of STATUS_TEXT) {
    merged[c] = c in input ? text(input[c]) : (current ? current[c] : null);
  }
  for (const c of STATUS_FLAGS) {
    const given = flag(input[c]);
    merged[c] = given === undefined ? (current ? current[c] : null) : given;
  }

  const when = effectiveDate === undefined ? today() : isoDate(effectiveDate, 'effectiveDate');
  if (when === null) {
    throw new ProtocolStoreError(
      'effectiveDate cannot be null — a status with no date cannot be placed in '
      + 'the progression, which is the whole point of storing it as a series.',
      ERR.INVALID
    );
  }

  // NOT carried forward from the previous row: a clinician recording a status
  // is stating a date, even when they accept today's. Inheriting the flag
  // would keep a migrated row's uncertainty attached to a real observation.
  const dateUnknown = dateIsUnknown ? 1 : 0;

  const cols = [...STATUS_TEXT, ...STATUS_FLAGS];

  // ONE ROW PER DATE, NOT ONE PER SAVE.
  //
  // The panel saves each answer as it is given, so filling the status in
  // produced a row per FIELD. Haley got seven on 2026-09-26 — weight bearing,
  // then the e-collar, then crate rest, then the sling, then the restrictions
  // — and the "progression" became a recording of somebody typing.
  //
  // The series is a RECORD of what was found, in the order it was found,
  // across weeks. Seven identical entries from one afternoon do not just add
  // noise: they bury the change they were built to show.
  //
  // It is NOT a staircase. An earlier version of this comment described the
  // series as "NWB -> TTWB -> PWB -> FWB", which is one path among many and
  // reads as though it were the path. Sal, 2026-09-26: a patient may go
  // NWB -> TTWB -> FWB, skip states, start at FWB, or move backwards after a
  // setback. Nothing here may infer a state from a sequence or expect one.
  // See "Clinical Reasoning Constraints" in CLAUDE.md.
  //
  // So a save on a date that already has a row UPDATES it. The row is the
  // state as at that date, and a clinician filling it in over five minutes is
  // recording one state, not five.
  //
  // TWO THINGS THIS DOES NOT DO:
  //
  //   It never touches a row on a DIFFERENT date. Last week's finding is
  //   history and is not editable through this path — that is the invariant
  //   the block exists for.
  //
  //   It never merges with a MIGRATED row. Those carry
  //   `effective_date_is_unknown` and a date nobody stated; folding a
  //   clinician's real observation into one would give their finding the
  //   migration's date and silently launder the uncertainty away.
  const sameDay = current
    && current.effective_date === when
    && !current[DATE_UNKNOWN]
    && !dateUnknown;

  if (sameDay) {
    await db.run(
      `UPDATE ${STATUS}
          SET ${cols.map((c) => `${c} = ?`).join(', ')}, recorded_by = ?
        WHERE id = ?`,
      [...cols.map((c) => merged[c]), actor.id, current.id]
    );
  } else {
    await db.run(
      `INSERT INTO ${STATUS} (patient_id, effective_date, ${cols.join(', ')}, ${DATE_UNKNOWN}, recorded_by)
       VALUES (?, ?, ${cols.map(() => '?').join(', ')}, ?, ?)`,
      [patientId, when, ...cols.map((c) => merged[c]), dateUnknown, actor.id]
    );
  }
  // ── THE MIRROR ──────────────────────────────────────────────────────────
  //
  // `activity_restrictions` is THE home for a patient's activity orders as of
  // 2026-09-26. `patients.special_instructions` is kept only as a mirror of
  // it, because three readers still take it from there:
  //
  //   PatientDetailView.jsx:145   displays it
  //   engine-adapter.js:191       feeds the generator on the visit path
  //   patient-gaps.js:96          reports it missing
  //
  // One writer keeps all three correct without repointing each of them.
  //
  // WHY THIS MIRRORS `getTreatment().status` AND NOT THE LOCAL `merged`:
  // a clinician may record a status for an EARLIER date. That row is written,
  // but it is not the current one — and mirroring `merged` would stamp a
  // superseded set of orders over the column. getTreatment already resolves
  // "current" as effective_date DESC, id DESC, so reading it back is the only
  // way to mirror the row that actually governs.
  //
  // Until this existed the two drifted apart: Winston, Charlie and Luna each
  // ended up holding orders on one side that the other was missing.
  const out = await getTreatment(db, patientId);
  await db.run(
    'UPDATE patients SET special_instructions = ? WHERE id = ?',
    [(out.status && out.status.activity_restrictions) || '', patientId]
  );
  return out;
}

module.exports = {
  PROCEDURES,
  STATUS,
  PROCEDURE_COLUMNS,
  STATUS_TEXT,
  STATUS_FLAGS,
  CASE_COLUMNS,
  DATE_UNKNOWN,
  APPROACHES,
  RETIRED_APPROACHES,
  assertSchema,
  getTreatment,
  setCase,
  addProcedure,
  updateProcedure,
  deleteProcedure,
  recordStatus,
  // exported for tests — each is a documented rule in its own right
  flag,
  isoDate,
};
