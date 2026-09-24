/**
 * K9 Clinical Workflow V2 — Visit / longitudinal record tests
 *
 * The centrepiece is `a full course of treatment`: three visits across six
 * weeks, with reassessment, protocol supersession and a live handoff — the
 * clinical workflow end to end, driven through the real production engine.
 *
 * Run:  node tests/visit-store.test.js
 */

'use strict';

const assert = require('assert');
const path = require('path');

// V2 runtime code now lives in the production repo (backend/v2). These tests
// point at it directly so there is ONE copy: a second copy in this sandbox
// would drift from what actually deploys, and the tests would stop proving
// anything about production. Override with V2_ROOT.
const V2_ROOT = process.env.V2_ROOT || path.join(__dirname, '..');


const schema = require(path.join(V2_ROOT, 'schema'));
const store = require(path.join(V2_ROOT, 'protocol-store'));
const { approveWithGates } = require('./approve-helper');
const visits = require(path.join(V2_ROOT, 'visit-store'));
const adapter = require(path.join(V2_ROOT, 'engine-adapter'));
const { wrap } = require(path.join(V2_ROOT, 'sqlite-adapter'));

const K9_BACKEND = process.env.K9_BACKEND || path.join(__dirname, '..', '..');
const engine = require(path.join(K9_BACKEND, 'protocol-generator.js'));
const { ALL_EXERCISES } = require(path.join(K9_BACKEND, 'all-exercises.js'));
const sqlite3 = require(path.join(K9_BACKEND, 'node_modules', 'sqlite3'));

// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];
const queue = [];
const test = (name, fn) => queue.push({ name, fn });
const section = (title) => queue.push({ section: title });

const VET = { id: 1, username: 'dr.zaslow', role: 'veterinarian' };
const TECH = { id: 2, username: 'tech.jamie', role: 'technician' };

const PATIENT = {
  id: 100,
  name: 'Rex',
  client_first_name: 'Test',
  client_last_name: 'Owner',
  species: 'canine',
  breed: 'Labrador',
  age: 5,
  weight: 32,
  condition: 'TPLO',
  affected_region: 'Stifle',
  treatment_approach: 'Surgical',
  surgery_date: '2026-08-15',
};

const CLINIC = { aquatic_access: true, modality_laser: true, modality_nmes: true };

async function freshDb() {
  const db = wrap(new sqlite3.Database(':memory:'));
  // Production enables this (sqlite-provider.js). Without it a foreign-key
  // violation passes in tests and fails live — which is exactly how an
  // owner-reported red flag reached production broken.
  await db.run(`PRAGMA foreign_keys = ON`);
  await db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT)`);
  await db.run(`CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT)`);
  await db.run(`INSERT INTO patients (id, name) VALUES (100, 'Rex')`);
  for (const u of [VET, TECH]) {
    await db.run(`INSERT INTO users (id, username, role) VALUES (?, ?, ?)`, [u.id, u.username, u.role]);
  }
  await schema.applyAll(db);
  return db;
}

/** Visit -> assessment -> engine -> persisted version, linked back to the visit. */
async function visitToVersion(db, { protocolId, visitDate, visitType, assessment, actor = TECH }) {
  const visit = await visits.createVisit(db, {
    patientId: 100, visitDate, visitType, actor,
  });
  await visits.recordAssessment(db, { visitId: visit.id, assessment, actor });
  const loaded = await visits.getVisit(db, visit.id);

  const state = visits.toV2State(db, {
    patient: PATIENT,
    visit: loaded,
    clinic: CLINIC,
    protocolParams: { length_weeks: 6, frequency: '2x/week' },
  });
  const engineInput = adapter.toEngineFormData(state);
  const engineResult = adapter.runEngine(engineInput, engine, ALL_EXERCISES);

  const version = await store.createVersion(db, {
    protocolId, engineInput, engineResult, actor,
  });
  await visits.linkVersionToVisit(db, { visitId: visit.id, versionId: version.id });
  return { visit: loaded, version, engineResult };
}

// ===========================================================================
section('Schema');
// ===========================================================================

test('all V2 schemas apply together and are idempotent', async () => {
  const db = await freshDb();
  await schema.applyAll(db);
  const tables = (await db.all(`SELECT name FROM sqlite_master WHERE type='table'`)).map((t) => t.name);
  for (const expected of [
    'protocols', 'protocol_versions', 'visits', 'visit_assessments',
    'visit_measurements', 'visit_protocol_versions',
  ]) {
    assert.ok(tables.includes(expected), `missing ${expected}`);
  }
});

// ===========================================================================
section('Longitudinal record — the gap this closes');
// ===========================================================================

test('measurements accumulate instead of overwriting', async () => {
  const db = await freshDb();
  for (const [date, value] of [['2026-08-20', 95], ['2026-09-03', 108], ['2026-09-17', 120]]) {
    const v = await visits.createVisit(db, { patientId: 100, visitDate: date, actor: TECH });
    await visits.recordMeasurement(db, {
      visitId: v.id, actor: TECH,
      measurement: { measure_key: 'ROM_FLEXION', site: 'STIFLE', side: 'LEFT', value_numeric: value, unit: 'degrees' },
    });
  }

  const history = await visits.getMeasurementHistory(db, {
    patientId: 100, measureKey: 'ROM_FLEXION', site: 'STIFLE', side: 'LEFT',
  });
  // The behaviour PATCH /api/patients/:id/measures cannot provide: three
  // readings, not one surviving value.
  assert.strictEqual(history.length, 3);
  assert.deepStrictEqual(history.map((h) => h.value_numeric), [95, 108, 120]);
});

test('left and right stifle are tracked as separate trends', async () => {
  const db = await freshDb();
  const v = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: TECH });
  for (const [side, value] of [['LEFT', 100], ['RIGHT', 135]]) {
    await visits.recordMeasurement(db, {
      visitId: v.id, actor: TECH,
      measurement: { measure_key: 'ROM_FLEXION', site: 'STIFLE', side, value_numeric: value, unit: 'degrees' },
    });
  }

  const left = await visits.getMeasurementHistory(db, {
    patientId: 100, measureKey: 'ROM_FLEXION', site: 'STIFLE', side: 'LEFT',
  });
  const right = await visits.getMeasurementHistory(db, {
    patientId: 100, measureKey: 'ROM_FLEXION', site: 'STIFLE', side: 'RIGHT',
  });
  // Operated vs contralateral limb is how symmetry is judged; collapsing them
  // into one trend would make the comparison impossible.
  assert.strictEqual(left[0].value_numeric, 100);
  assert.strictEqual(right[0].value_numeric, 135);
});

test('a correction supersedes without destroying the original', async () => {
  const db = await freshDb();
  const v = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: TECH });
  const original = await visits.recordMeasurement(db, {
    visitId: v.id, actor: TECH,
    measurement: { measure_key: 'GIRTH', site: 'THIGH', side: 'LEFT', value_numeric: 38, unit: 'cm' },
  });
  await visits.correctMeasurement(db, {
    measurementId: original.id, value: 34, actor: VET, note: 'transcription error',
  });

  const history = await visits.getMeasurementHistory(db, {
    patientId: 100, measureKey: 'GIRTH', site: 'THIGH', side: 'LEFT',
  });
  assert.strictEqual(history.length, 1, 'superseded reading still showing in the trend');
  assert.strictEqual(history[0].value_numeric, 34);

  const allRows = await db.all(`SELECT * FROM visit_measurements WHERE patient_id = 100`);
  assert.strictEqual(allRows.length, 2, 'the original reading was destroyed');
});

test('a completed visit cannot be rewritten', async () => {
  const db = await freshDb();
  const v = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: TECH });
  await visits.recordAssessment(db, { visitId: v.id, assessment: { pain_score: 4 }, actor: TECH });
  await visits.completeVisit(db, { visitId: v.id, actor: VET });

  await assert.rejects(
    () => visits.recordAssessment(db, { visitId: v.id, assessment: { pain_score: 1 }, actor: TECH }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
  await assert.rejects(
    () => visits.recordMeasurement(db, {
      visitId: v.id, actor: TECH,
      measurement: { measure_key: 'GIRTH', value_numeric: 1 },
    }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
});

test('an assessment records every field, absent ones as explicit null', async () => {
  const db = await freshDb();
  const v = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: TECH });
  await visits.recordAssessment(db, { visitId: v.id, assessment: { pain_score: 3 }, actor: TECH });

  const loaded = await visits.getVisit(db, v.id);
  for (const field of visits.ASSESSMENT_FIELDS) {
    assert.ok(field in loaded.assessment, `assessment dropped the column ${field}`);
  }
  assert.strictEqual(loaded.assessment.pain_score, 3);
  assert.strictEqual(loaded.assessment.mmt_grade, null);
});

test('overall_change is validated against the permitted verdicts', async () => {
  const db = await freshDb();
  const v = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: TECH });
  await assert.rejects(
    () => visits.recordAssessment(db, {
      visitId: v.id, assessment: { overall_change: 'better-ish' }, actor: TECH,
    }),
    (err) => err.code === store.ERR.INVALID
  );
});

test('treatment approach is recorded on the visit and reaches the engine', async () => {
  const db = await freshDb();
  const v = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: TECH });
  await visits.recordAssessment(db, {
    visitId: v.id, actor: TECH,
    assessment: { pain_score: 3, treatment_approach: 'Surgical' },
  });
  const loaded = await visits.getVisit(db, v.id);
  assert.strictEqual(loaded.assessment.treatment_approach, 'Surgical');

  // A patient record with no treatment_approach column must still reach the
  // engine with the visit's answer rather than defaulting to Conservative.
  const state = visits.toV2State(db, {
    patient: { name: 'Rex', client_name: 'David Chen', condition: 'TPLO' },
    visit: loaded, clinic: {}, protocolParams: {},
  });
  assert.strictEqual(adapter.toEngineFormData(state).treatmentApproach, 'Surgical');
});

test('a column added after first boot is reconciled onto an existing table', async () => {
  // CREATE TABLE IF NOT EXISTS is a no-op on an existing table, so without
  // column reconciliation a newly added clinical field would never appear and
  // every INSERT naming it would fail.
  const db = await freshDb();
  await db.run(`ALTER TABLE visits ADD COLUMN probe_column TEXT`).catch(() => {});

  const before = await db.all(`PRAGMA table_info(visit_assessments)`);
  assert.ok(before.some((c) => c.name === 'treatment_approach'),
    'treatment_approach missing from a freshly created table');

  // Simulate a pre-existing database that lacks the column.
  await db.run(`CREATE TABLE IF NOT EXISTS legacy_probe (id INTEGER PRIMARY KEY)`);
  const result = await schema.ensureColumns(
    db,
    [`CREATE TABLE IF NOT EXISTS legacy_probe (
  id INTEGER PRIMARY KEY,
  added_later TEXT
)`],
    { logger: { log() {}, warn() {} } }
  );
  assert.ok(result.added.includes('legacy_probe.added_later'), 'column was not added');

  const after = await db.all(`PRAGMA table_info(legacy_probe)`);
  assert.ok(after.some((c) => c.name === 'added_later'));
});

test('an unsafe column is reported rather than half-migrated', async () => {
  const db = await freshDb();
  await db.run(`CREATE TABLE IF NOT EXISTS unsafe_probe (id INTEGER PRIMARY KEY)`);
  const result = await schema.ensureColumns(
    db,
    [`CREATE TABLE IF NOT EXISTS unsafe_probe (
  id INTEGER PRIMARY KEY,
  must_exist TEXT NOT NULL
)`],
    { logger: { log() {}, warn() {} } }
  );
  // SQLite cannot ADD COLUMN ... NOT NULL without a default. A silent partial
  // migration is worse than a loud refusal.
  assert.deepStrictEqual(result.added, []);
  assert.ok(result.needsManualMigration.some((c) => c.includes('unsafe_probe.must_exist')));
});

// ===========================================================================
section('Clinical snapshot');
// ===========================================================================

test('a first-visit patient is shown as having no baseline', async () => {
  const db = await freshDb();
  const v = await visits.createVisit(db, {
    patientId: 100, visitDate: '2026-08-20', visitType: 'INITIAL', actor: TECH,
  });
  await visits.recordAssessment(db, { visitId: v.id, assessment: { pain_score: 6 }, actor: TECH });

  const snap = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(snap.has_baseline, false);
  assert.deepStrictEqual(snap.changes_since_previous_visit, {});
  assert.strictEqual(snap.current_state.pain_score, 6);
});

test('the snapshot reports change since the previous visit', async () => {
  const db = await freshDb();
  const v1 = await visits.createVisit(db, { patientId: 100, visitDate: '2026-08-20', actor: TECH });
  await visits.recordAssessment(db, {
    visitId: v1.id, assessment: { pain_score: 6, lameness_grade: 4 }, actor: TECH,
  });
  const v2 = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-03', actor: TECH });
  await visits.recordAssessment(db, {
    visitId: v2.id, assessment: { pain_score: 3, lameness_grade: 2, overall_change: 'IMPROVED' }, actor: VET,
  });

  const snap = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(snap.has_baseline, true);
  assert.strictEqual(snap.changes_since_previous_visit.pain_score.change, -3);
  assert.strictEqual(
    snap.changes_since_previous_visit.pain_score.direction,
    'moved in the improving direction'
  );
  // The clinical verdict is the clinician's, not computed from the numbers.
  assert.strictEqual(snap.last_visit.overall_change, 'IMPROVED');
});

test('rising pain is reported as moving in the worsening direction', async () => {
  const db = await freshDb();
  const v1 = await visits.createVisit(db, { patientId: 100, visitDate: '2026-08-20', actor: TECH });
  await visits.recordAssessment(db, { visitId: v1.id, assessment: { pain_score: 2 }, actor: TECH });
  const v2 = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-03', actor: TECH });
  await visits.recordAssessment(db, { visitId: v2.id, assessment: { pain_score: 7 }, actor: TECH });

  const snap = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(snap.changes_since_previous_visit.pain_score.change, 5);
  assert.strictEqual(
    snap.changes_since_previous_visit.pain_score.direction,
    'moved in the worsening direction'
  );
});

test('ROM gain is reported as improving, pain rise as worsening, from the same delta sign', async () => {
  const db = await freshDb();
  for (const [date, rom] of [['2026-08-20', 95], ['2026-09-03', 115]]) {
    const v = await visits.createVisit(db, { patientId: 100, visitDate: date, actor: TECH });
    await visits.recordMeasurement(db, {
      visitId: v.id, actor: TECH,
      measurement: { measure_key: 'ROM_FLEXION', site: 'STIFLE', side: 'LEFT', value_numeric: rom, unit: 'degrees' },
    });
  }

  const snap = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  const rom = snap.measurement_trends.find((t) => t.measure_key === 'ROM_FLEXION');
  // +20 degrees of ROM is improvement; +20 on a pain score would not be.
  assert.strictEqual(rom.change, 20);
  assert.strictEqual(rom.direction, 'moved in the improving direction');
  assert.strictEqual(rom.reading_count, 2);
});

test('the snapshot surfaces the live prescription and its active safety gates', async () => {
  const db = await freshDb();
  const protocol = await store.createProtocol(db, { patientId: 100, patientName: 'Rex', actor: VET });
  const { version } = await visitToVersion(db, {
    protocolId: protocol.id, visitDate: '2026-08-20', visitType: 'INITIAL',
    assessment: { pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB', oa_stage: 4 },
  });
  await store.setStatus(db, version.id, 'REVIEW', VET);
  await approveWithGates(store, db, { versionId: version.id, actor: VET });

  const snap = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.ok(snap.active_protocol, 'live prescription not surfaced');
  assert.strictEqual(snap.active_protocol.status, 'APPROVED');
  // A gate that fired last time is a question to re-ask at reassessment.
  assert.ok(snap.active_protocol.active_safety_gates.includes('_severeOA'));
  assert.ok(snap.active_protocol.restrictions.length > 0);
});

// ===========================================================================
section('Visit -> engine bridge');
// ===========================================================================

test('every engine visit-input reaches the engine from a stored assessment', async () => {
  const db = await freshDb();
  const v = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: TECH });
  await visits.recordAssessment(db, {
    visitId: v.id, actor: TECH,
    assessment: {
      pain_score: 4, lameness_grade: 3, weight_bearing_status: 'TTWB', mobility_level: 'Assisted',
      mmt_grade: 3, ivdd_grade: 'II', oa_stage: 2,
      neuro_proprioception: 'Delayed', neuro_withdrawal: 'Present',
      neuro_deep_pain: 'Present', neuro_motor_grade: '3/5',
      incision_status: 'Healed', complications_noted: 'none',
      crate_rest_required: true, e_collar_required: false,
    },
  });
  const loaded = await visits.getVisit(db, v.id);
  const state = visits.toV2State(db, { patient: PATIENT, visit: loaded, clinic: CLINIC, protocolParams: {} });
  const formData = adapter.toEngineFormData(state);

  // The Finding-1 net, now applied to the visit->engine hop.
  const guard = adapter.verifyEngineContract(formData);
  assert.deepStrictEqual(guard.missing, []);

  assert.strictEqual(formData.weightBearingStatus, 'TTWB');
  assert.strictEqual(formData.mmtGrade, 3);
  assert.strictEqual(formData.ivddGrade, 'II');
  assert.strictEqual(formData.neuroDeepPain, 'Present');
  assert.strictEqual(formData.incisionStatus, 'Healed');
  // Stored 0/1 must reach the engine as booleans, or the restriction misfires.
  assert.strictEqual(formData.crateRestRequired, true);
  assert.strictEqual(formData.eCollarRequired, false);
});

test('a protocol version is traceable back to the visit that produced it', async () => {
  const db = await freshDb();
  const protocol = await store.createProtocol(db, { patientId: 100, patientName: 'Rex', actor: VET });
  const { visit, version } = await visitToVersion(db, {
    protocolId: protocol.id, visitDate: '2026-08-20', visitType: 'INITIAL',
    assessment: { pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB' },
  });

  const traced = await visits.getVisitForVersion(db, version.id);
  assert.strictEqual(traced.id, visit.id);
  assert.strictEqual(traced.visit_date, '2026-08-20');
});

// ===========================================================================
section('A full course of treatment');
// ===========================================================================

test('three visits: initial -> reassessment -> supersession, end to end', async () => {
  const db = await freshDb();
  const protocol = await store.createProtocol(db, { patientId: 100, patientName: 'Rex', actor: VET });

  // ---- Visit 1, week 1 post-op. Painful, partial weight bearing. ----------
  const v1 = await visitToVersion(db, {
    protocolId: protocol.id, visitDate: '2026-08-20', visitType: 'INITIAL',
    assessment: {
      pain_score: 6, lameness_grade: 4, weight_bearing_status: 'TTWB',
      mobility_level: 'Assisted', incision_status: 'Healing',
    },
  });
  await visits.recordMeasurement(db, {
    visitId: v1.visit.id, actor: TECH,
    measurement: { measure_key: 'ROM_FLEXION', site: 'STIFLE', side: 'LEFT', value_numeric: 95, unit: 'degrees' },
  });
  await store.setStatus(db, v1.version.id, 'REVIEW', VET);
  await approveWithGates(store, db, { versionId: v1.version.id, actor: VET, note: 'Initial post-op HEP' });
  await store.handoffToBeau(db, { versionId: v1.version.id, actor: VET });
  await visits.completeVisit(db, { visitId: v1.visit.id, actor: VET });

  let active = await store.getActiveHandoff(db, 100);
  assert.strictEqual(active.version_id, v1.version.id, 'first HEP not live at home');

  // ---- Visit 2, week 3. Improving. Clinician reassesses. -----------------
  const v2 = await visitToVersion(db, {
    protocolId: protocol.id, visitDate: '2026-09-03', visitType: 'RECHECK',
    assessment: {
      pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB',
      mobility_level: 'Ambulatory', incision_status: 'Healed',
      overall_change: 'IMPROVED',
    },
  });
  await visits.recordMeasurement(db, {
    visitId: v2.visit.id, actor: TECH,
    measurement: { measure_key: 'ROM_FLEXION', site: 'STIFLE', side: 'LEFT', value_numeric: 112, unit: 'degrees' },
  });

  // The snapshot the clinician reads before deciding.
  const snapAtV2 = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(snapAtV2.changes_since_previous_visit.pain_score.change, -3);
  assert.strictEqual(snapAtV2.active_protocol.version_number, 1);

  await store.setStatus(db, v2.version.id, 'REVIEW', VET);
  await approveWithGates(store, db, { versionId: v2.version.id, actor: VET, note: 'Progressed to PWB loading' });
  await store.handoffToBeau(db, { versionId: v2.version.id, actor: VET });
  await visits.completeVisit(db, { visitId: v2.visit.id, actor: VET });

  // Version 1 superseded; only the new HEP is live at home.
  assert.strictEqual((await store.getVersion(db, v1.version.id)).status, 'SUPERSEDED');
  active = await store.getActiveHandoff(db, 100);
  assert.strictEqual(active.version_id, v2.version.id);
  const activeCount = await db.get(
    `SELECT COUNT(*) AS n FROM beau_handoffs WHERE patient_id = 100 AND status = 'ACTIVE'`
  );
  assert.strictEqual(activeCount.n, 1, 'patient holds more than one live prescription');

  // ---- Visit 3, week 6. Flare: pain up, clinician regresses the plan. ----
  const v3 = await visitToVersion(db, {
    protocolId: protocol.id, visitDate: '2026-09-17', visitType: 'REASSESSMENT',
    assessment: {
      pain_score: 8, lameness_grade: 4, weight_bearing_status: 'TTWB',
      mobility_level: 'Assisted', overall_change: 'WORSE',
    },
  });
  // Pain >= 8 must have re-fired the high-pain gate on this new assessment.
  assert.strictEqual(v3.engineResult.derivedFlags._highPainOverride, true,
    'high-pain gate did not fire on reassessment');
  assert.strictEqual(v3.engineResult.protocolType, 'geriatric',
    'palliative routing did not apply to the flare');

  await store.setStatus(db, v3.version.id, 'REVIEW', VET);
  await approveWithGates(store, db, { versionId: v3.version.id, actor: VET, note: 'Flare — regressed to comfort care' });
  await store.handoffToBeau(db, { versionId: v3.version.id, actor: VET });
  await visits.completeVisit(db, { visitId: v3.visit.id, actor: VET });

  // ---- The record that remains ------------------------------------------
  const finalSnap = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(finalSnap.visit_count, 3);
  assert.strictEqual(finalSnap.active_protocol.version_number, 3);
  assert.strictEqual(finalSnap.changes_since_previous_visit.pain_score.change, 5);
  assert.strictEqual(
    finalSnap.changes_since_previous_visit.pain_score.direction,
    'moved in the worsening direction'
  );

  const romTrend = finalSnap.measurement_trends.find((t) => t.measure_key === 'ROM_FLEXION');
  assert.strictEqual(romTrend.reading_count, 2);
  assert.strictEqual(romTrend.latest_value, 112);

  // Three versions, every one still explainable by its own visit.
  const allVersions = await store.listVersions(db, protocol.id);
  assert.strictEqual(allVersions.length, 3);
  for (const version of allVersions) {
    const visit = await visits.getVisitForVersion(db, version.id);
    assert.ok(visit, `version ${version.version_number} has no originating visit`);
  }

  // And the audit trail covers the whole course.
  const trail = await store.getAuditTrail(db, protocol.id);
  const approvals = trail.filter((e) => e.action === store.AUDIT.PROTOCOL_APPROVED);
  const supersessions = trail.filter((e) => e.action === store.AUDIT.PROTOCOL_SUPERSEDED);
  assert.strictEqual(approvals.length, 3);
  assert.strictEqual(supersessions.length, 2);
});

// ---------------------------------------------------------------------------

(async () => {
  for (const item of queue) {
    if (item.section) {
      console.log(`\n${item.section}`);
      console.log('-'.repeat(item.section.length));
      continue;
    }
    try {
      await item.fn();
      passed++;
      console.log(`  PASS  ${item.name}`);
    } catch (err) {
      failures.push({ name: item.name, err });
      console.log(`  FAIL  ${item.name}`);
      console.log(`        ${err.message.split('\n')[0]}`);
    }
  }
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PASSED: ${passed}    FAILED: ${failures.length}`);
  console.log('='.repeat(60));
  if (failures.length) {
    for (const f of failures) console.log(`  - ${f.name}\n    ${f.err.stack.split('\n')[0]}`);
    process.exit(1);
  }
  process.exit(0);
})();
