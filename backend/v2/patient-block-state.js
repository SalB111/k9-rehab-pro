'use strict';

/**
 * DOES THIS BLOCK HOLD ANYTHING? — per patient, per block.
 *
 * WHY THIS EXISTS
 *
 * The dashboard draws a dot on every block card: green for complete, amber
 * for partial, nothing for empty. It computed that dot by counting keys in
 * `patients.dashboard_data`:
 *
 *     const blockKeys = Object.keys(dashData).filter(k => k.startsWith(b.id + "::") ...)
 *     const dataStatus = blockKeys.length >= 3 ? "complete" : ...
 *
 * Six blocks have since moved to their own tables, and the dot never
 * followed. Measured on Haley, 2026-09-26: her Home and Goals blocks showed
 * NO DOT AT ALL — the card read as untouched — while `patient_home_environment`
 * held her home and `patient_goal_items` held "able to hike in the mountains
 * within the next 6 months". A clinician looking at that dashboard cannot
 * answer "what still needs doing", which is the one question the dots exist
 * to answer.
 *
 * Same root cause as the Protocol Summary reading a blob two blocks had left,
 * and as activity restrictions living in two places. A reader was not moved
 * when its fact was.
 *
 * WHAT THIS IS NOT
 *
 * It is not a judgement about whether a block is CLINICALLY complete. It
 * answers "is there anything here", and nothing more. What a block needs
 * before a patient can be admitted is a clinical question and belongs to a
 * clinician — see STAGE_REQUIREMENTS in this file, which is deliberately
 * empty and waiting for Sal.
 */

const patientHomeStore = require('./patient-home-store');
const patientGoalsStore = require('./patient-goals-store');
const patientTreatmentStore = require('./patient-treatment-store');
const patientDiagnosticsStore = require('./patient-diagnostics-store');
const patientClientStore = require('./patient-client-store');

/**
 * Where each block's truth lives.
 *
 * `store` blocks answer from their own table. `blob` blocks have no table
 * yet, so `dashboard_data` IS their correct source and counting keys is the
 * right answer for them — that part of the old logic was never wrong, it was
 * just applied to blocks it had stopped being true for.
 */
const BLOCK_SOURCE = {
  client: 'store',
  diagnostics: 'store',
  treatment: 'store',
  metrics: 'store',
  home: 'store',
  goals: 'store',
  equipment: 'clinic',
  assessment: 'blob',
  conditioning: 'blob',
  protocol: 'blob',
  nutrition: 'blob',
  library: 'none',
  'coming-soon': 'none',
};

/** How many blob keys count as "more than a toe in the water". */
const PARTIAL_THRESHOLD = 3;

/**
 * WHAT EACH STAGE ACTUALLY REQUIRES — NOT FILLED IN.
 *
 * Sal's flow, in his words: a client comes in saying the dog is getting
 * older; the vet examines; the nurse takes vitals; the vet diagnoses and
 * calls surgical or non-surgical. The patient may not be ADMITTED until the
 * following week, and B.E.A.U. metrics are added then.
 *
 * So most blocks are not expected at intake, and a dashboard that flags them
 * amber is reporting the workflow as an error. Fixing that needs a list of
 * which blocks are expected at which stage — and that is a CLINICAL
 * judgement about what a rehab intake must capture before an animal can be
 * admitted. It is not mine to write.
 *
 * Left empty deliberately. While it is empty, `stageOf()` reports the stage
 * and expects nothing, so nothing is wrongly flagged.
 */
const STAGE_REQUIREMENTS = {
  INTAKE: { required: [], optional: [] },
  ADMISSION: { required: [], optional: [] },
};

function blobCounts(patient) {
  const out = {};
  let blob = {};
  try { blob = JSON.parse((patient && patient.dashboard_data) || '{}'); } catch { blob = {}; }
  for (const key of Object.keys(blob)) {
    const value = blob[key];
    if (value === null || value === undefined || String(value).trim() === '') continue;
    const block = key.split('::')[0];
    out[block] = (out[block] || 0) + 1;
  }
  return out;
}

function describe(source, filled, count) {
  if (!filled) return { source, status: 'empty', filled: false, count };
  if (source === 'blob' && count < PARTIAL_THRESHOLD) {
    return { source, status: 'partial', filled: true, count };
  }
  return { source, status: 'complete', filled: true, count };
}

/**
 * The state of every block for one patient.
 *
 * @param {object} db        the app's { run, get, all } wrapper
 * @param {number} patientId
 * @param {object} patient   the row, for its dashboard_data
 * @param {object} [clinic]  capabilities from clinicStore.getCapabilities
 * @returns {Promise<object>} block id -> { source, status, filled, count }
 */
async function getBlockState(db, patientId, patient, clinic) {
  const counts = blobCounts(patient);

  // Every store is asked the same question and answers with the same flag.
  // A store that throws must not take the dashboard down with it — an
  // unreadable block is reported as unknown, not as empty, because "empty"
  // is a claim about the record and this would be a claim about the code.
  const ask = async (fn) => {
    try { const r = await fn(); return { ok: true, configured: Boolean(r && r.configured) }; }
    catch (err) { return { ok: false, error: err.message }; }
  };

  const [home, goals, treatment, diagnostics, client] = await Promise.all([
    ask(() => patientHomeStore.getHome(db, patientId)),
    ask(() => patientGoalsStore.getGoals(db, patientId)),
    ask(() => patientTreatmentStore.getTreatment(db, patientId)),
    ask(() => patientDiagnosticsStore.getStudies(db, patientId)),
    ask(() => patientClientStore.getClient(db, patientId)),
  ]);

  let measurements = 0;
  try {
    const row = await db.get(
      'SELECT COUNT(*) c FROM visit_measurements WHERE patient_id = ?', [patientId]
    );
    measurements = (row && row.c) || 0;
  } catch { measurements = 0; }

  const fromStore = { home, goals, treatment, diagnostics, client };
  const out = {};

  for (const [block, source] of Object.entries(BLOCK_SOURCE)) {
    if (source === 'none') continue;

    if (source === 'store') {
      if (block === 'metrics') {
        out[block] = describe('store', measurements > 0, measurements);
        continue;
      }
      const r = fromStore[block];
      if (r && !r.ok) { out[block] = { source: 'store', status: 'unknown', filled: null, error: r.error }; continue; }
      out[block] = describe('store', Boolean(r && r.configured), r && r.configured ? 1 : 0);
      continue;
    }

    if (source === 'clinic') {
      const configured = Boolean(clinic && clinic.configured);
      out[block] = describe('clinic', configured, configured ? 1 : 0);
      continue;
    }

    const n = counts[block] || 0;
    out[block] = describe('blob', n > 0, n);
  }

  return out;
}

/**
 * Which stage this patient is at, from their visits.
 *
 * INITIAL is treated as INTAKE: it is what the first visit was called before
 * the vocabulary grew, and the five legacy visits still carry it. Renaming
 * stored rows to make a label prettier is not worth the risk.
 */
const STAGE = {
  NONE: 'NONE',                 // no visit has ever been opened
  INTAKE: 'INTAKE',             // the only visits so far are first visits
  ADMISSION: 'ADMISSION',       // an ADMISSION visit exists
  IN_PROGRAMME: 'IN_PROGRAMME', // past intake, but nobody recorded an admission
};

async function stageOf(db, patientId) {
  let visits = [];
  try {
    visits = await db.all(
      'SELECT visit_type, visit_date, status FROM visits WHERE patient_id = ?'
      + ' ORDER BY visit_date DESC, id DESC', [patientId]
    );
  } catch { visits = []; }

  if (!visits.length) {
    // Not an error. Every current patient is in this state: the dashboard
    // has never opened a visit, which is the gap the staging work closes.
    return { stage: STAGE.NONE, why: 'no visit has been opened for this patient', visits: 0 };
  }
  const types = visits.map((v) => String(v.visit_type || '').toUpperCase());

  if (types.includes('ADMISSION')) {
    return { stage: STAGE.ADMISSION, why: 'an admission visit exists', visits: visits.length };
  }

  // A recheck or a reassessment means the animal is already IN the programme.
  // Calling that "intake" would be wrong, and calling it "admission" would be
  // asserting an admission nobody recorded. It gets its own honest name: this
  // is the legacy state of every patient registered before the stage existed.
  const PAST_INTAKE = ['RECHECK', 'REASSESSMENT', 'DISCHARGE'];
  if (types.some((t) => PAST_INTAKE.includes(t))) {
    return {
      stage: STAGE.IN_PROGRAMME,
      why: `has ${types.filter((t) => PAST_INTAKE.includes(t)).length} post-intake visit(s) but no recorded admission`,
      visits: visits.length,
    };
  }

  return { stage: STAGE.INTAKE, why: `latest visit is ${visits[0].visit_type}`, visits: visits.length };
}

module.exports = {
  BLOCK_SOURCE,
  PARTIAL_THRESHOLD,
  STAGE,
  STAGE_REQUIREMENTS,
  getBlockState,
  stageOf,
};
