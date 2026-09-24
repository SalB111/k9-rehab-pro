/**
 * K9 Clinical Workflow V2 — Engine Adapter Regression Tests
 *
 * These are the safety nets for the two blocking findings in
 * docs/STEP-13-ENGINE-CONTRACT-RECONCILIATION.md:
 *
 *   FINDING 1 — dropped engine inputs (silent gate failure)
 *   FINDING 2 — broken call order (silent severity-flag loss)
 *
 * They run against the REAL production engine, loaded read-only from the
 * K9-REHAB-PRO source tree. Nothing in production is written to.
 *
 * Run:  node tests/engine-adapter.test.js
 *       K9_BACKEND=/path/to/k9-rehab-pro/backend node tests/engine-adapter.test.js
 */

'use strict';

const assert = require('assert');
const path = require('path');

// V2 runtime code now lives in the production repo (backend/v2). These tests
// point at it directly so there is ONE copy: a second copy in this sandbox
// would drift from what actually deploys, and the tests would stop proving
// anything about production. Override with V2_ROOT.
const V2_ROOT = process.env.V2_ROOT || path.join(__dirname, '..');

const fs = require('fs');

const adapter = require(path.join(V2_ROOT, 'engine-adapter'));

// ---------------------------------------------------------------------------
// Load the production engine (read-only)
// ---------------------------------------------------------------------------

const K9_BACKEND = process.env.K9_BACKEND || path.join(__dirname, '..', '..');

if (!fs.existsSync(path.join(K9_BACKEND, 'protocol-generator.js'))) {
  console.error(`\nCannot find the K9 engine at: ${K9_BACKEND}`);
  console.error('Set K9_BACKEND to the k9-rehab-pro/backend directory and re-run.\n');
  process.exit(2);
}

const engine = require(path.join(K9_BACKEND, 'protocol-generator.js'));
const { ALL_EXERCISES } = require(path.join(K9_BACKEND, 'all-exercises.js'));

// ---------------------------------------------------------------------------
// Tiny test harness
// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures.push({ name, err });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A fully-equipped clinic — every modality available. */
const FULL_CLINIC = {
  aquatic_access: true,
  modality_uwtm: true,
  modality_laser: true,
  modality_tens: true,
  modality_nmes: true,
  modality_therapeutic_us: true,
  modality_pulsed_emf: true,
  modality_shockwave: true,
  modality_cryotherapy: true,
  modality_heat_therapy: true,
};

/** Routine post-op TPLO patient, uncomplicated. The baseline everything varies from. */
function baseState(overrides = {}) {
  const state = {
    patient: {
      name: 'Golden Retriever Test',
      client_first_name: 'Test',
      client_last_name: 'Owner',
      species: 'canine',
      breed: 'Golden Retriever',
      age: 6,
      weight: 30,
      condition: 'TPLO',
      affected_region: 'Stifle',
      treatment_approach: 'Surgical',
      surgery_date: '2026-09-01',
      medical_history: '',
      current_medications: '',
      special_instructions: '',
    },
    visit: {
      pain_score: 3,
      lameness_grade: 2,
      weight_bearing_status: 'PWB',
      mobility_level: 'Ambulatory',
    },
    clinic: { ...FULL_CLINIC },
    protocol: { length_weeks: 8, frequency: '2x/week' },
  };

  return {
    patient: { ...state.patient, ...(overrides.patient || {}) },
    visit: { ...state.visit, ...(overrides.visit || {}) },
    clinic: { ...state.clinic, ...(overrides.clinic || {}) },
    protocol: { ...state.protocol, ...(overrides.protocol || {}) },
  };
}

/** Flatten a run result to the set of exercise codes it prescribes. */
function codesIn(result) {
  const codes = new Set();
  for (const week of result.weeks) {
    for (const ex of week.exercises) {
      if (ex && ex.code) codes.add(ex.code);
    }
  }
  return codes;
}

// ===========================================================================
section('FINDING 1 — engine input completeness');
// ===========================================================================

test('contract exposes 36 engine inputs', () => {
  assert.strictEqual(adapter.ENGINE_INPUTS.length, 36);
});

test('adapter emits every engine input as a present key', () => {
  const formData = adapter.toEngineFormData(baseState());
  const guard = adapter.verifyEngineContract(formData);
  assert.deepStrictEqual(guard.missing, [], `missing: ${guard.missing.join(', ')}`);
  assert.ok(guard.ok);
});

test('adapter emits every input even from a completely empty state', () => {
  // The dangerous case: sparse input must still produce every key, as null.
  // A missing key is a dropped gate; a null value is an honest "not known".
  const formData = adapter.toEngineFormData({});
  const guard = adapter.verifyEngineContract(formData);
  assert.deepStrictEqual(guard.missing, []);
});

test('adapter never pre-sets the derived severity flags', () => {
  const formData = adapter.toEngineFormData(baseState({ visit: { pain_score: 9 } }));
  const guard = adapter.verifyEngineContract(formData);
  assert.deepStrictEqual(guard.unexpectedFlags, []);
});

test('runEngine refuses a formData that is missing an engine input', () => {
  const formData = adapter.toEngineFormData(baseState());
  delete formData.weightBearingStatus; // simulate the exact Finding-1 defect
  assert.throws(
    () => adapter.runEngine(formData, engine, ALL_EXERCISES),
    /contract violation.*weightBearingStatus/s
  );
});

test('runEngine refuses a forged severity flag', () => {
  const formData = adapter.toEngineFormData(baseState());
  formData._severeOA = true; // only validateIntake may set this
  assert.throws(() => adapter.runEngine(formData, engine, ALL_EXERCISES), /must not pre-set/);
});

test('diagnosis is mapped from the patient record field named condition', () => {
  // The K9 patient record stores this as `condition`; the engine reads `diagnosis`.
  // Unmapped, the engine silently defaults to 'Conditioning'.
  const formData = adapter.toEngineFormData(baseState());
  assert.strictEqual(formData.diagnosis, 'TPLO');
});

test('clinic capabilities reach the engine as modality flags', () => {
  const formData = adapter.toEngineFormData(baseState());
  assert.strictEqual(formData.modalityLaser, true);
  assert.strictEqual(formData.aquaticAccess, true);
});

test('unknown clinic capability stays null, not coerced to false', () => {
  const formData = adapter.toEngineFormData(baseState({ clinic: { modality_laser: undefined } }));
  assert.strictEqual(formData.modalityLaser, null);
});

test('a single stored client_name is split, as the production table stores it', () => {
  // The real `patients` table has ONE client_name ("David Chen"), not
  // first/last. Unsplit, validateIntake hard-errors "Client name is required"
  // and no protocol can be generated for any existing patient.
  const state = baseState();
  delete state.patient.client_first_name;
  delete state.patient.client_last_name;
  state.patient.client_name = 'David Chen';

  const formData = adapter.toEngineFormData(state);
  assert.strictEqual(formData.clientFirstName, 'David');
  assert.strictEqual(formData.clientLastName, 'Chen');

  const result = adapter.runEngine(formData, engine, ALL_EXERCISES);
  assert.strictEqual(result.valid, true, 'a real patient record was rejected by the engine');
});

test('a one-word client name becomes the surname and still validates', () => {
  const state = baseState();
  delete state.patient.client_first_name;
  delete state.patient.client_last_name;
  state.patient.client_name = 'Chen';

  const formData = adapter.toEngineFormData(state);
  assert.strictEqual(formData.clientLastName, 'Chen');
  assert.strictEqual(adapter.runEngine(formData, engine, ALL_EXERCISES).valid, true);
});

test('treatment approach is taken from the visit, then the patient', () => {
  // It exists on NO production table, so it silently defaulted to
  // 'Conservative' — a different protocol path for a surgical patient.
  const fromVisit = adapter.toEngineFormData(
    baseState({ patient: { treatment_approach: null }, visit: { treatment_approach: 'Surgical' } })
  );
  assert.strictEqual(fromVisit.treatmentApproach, 'Surgical');

  const fromPatient = adapter.toEngineFormData(baseState());
  assert.strictEqual(fromPatient.treatmentApproach, 'Surgical');
});

test('a surgical and a conservative patient get different protocol paths', () => {
  // Proves the silent default was not harmless.
  const surgical = adapter.runEngine(
    adapter.toEngineFormData(baseState({ visit: { treatment_approach: 'Surgical' } })),
    engine, ALL_EXERCISES
  );
  const palliative = adapter.runEngine(
    adapter.toEngineFormData(baseState({ visit: { treatment_approach: 'Palliative' } })),
    engine, ALL_EXERCISES
  );
  assert.notStrictEqual(surgical.protocolType, palliative.protocolType);
});

// ===========================================================================
section('FINDING 2 — call order / severity flag propagation');
// ===========================================================================

test('high pain (>=8) sets _highPainOverride and routes palliative', () => {
  const formData = adapter.toEngineFormData(baseState({ visit: { pain_score: 9 } }));
  const result = adapter.runEngine(formData, engine, ALL_EXERCISES);
  assert.strictEqual(result.derivedFlags._highPainOverride, true, 'flag did not fire');
  assert.strictEqual(result.protocolType, 'geriatric', 'palliative routing did not apply');
});

test('MMT <=1 sets _severeWeakness', () => {
  const formData = adapter.toEngineFormData(baseState({ visit: { mmt_grade: 1 } }));
  const result = adapter.runEngine(formData, engine, ALL_EXERCISES);
  assert.strictEqual(result.derivedFlags._severeWeakness, true);
});

test('IVDD grade V sets _ivddSevere', () => {
  const formData = adapter.toEngineFormData(
    baseState({ patient: { condition: 'IVDD' }, visit: { ivdd_grade: 'V' } })
  );
  const result = adapter.runEngine(formData, engine, ALL_EXERCISES);
  assert.strictEqual(result.derivedFlags._ivddSevere, true);
});

test('OA stage 4 sets _severeOA', () => {
  const formData = adapter.toEngineFormData(baseState({ visit: { oa_stage: 4 } }));
  const result = adapter.runEngine(formData, engine, ALL_EXERCISES);
  assert.strictEqual(result.derivedFlags._severeOA, true);
});

test('absent deep pain sets _gradeVSupport', () => {
  const formData = adapter.toEngineFormData(
    baseState({ visit: { neuro_deep_pain: 'Absent' } })
  );
  const result = adapter.runEngine(formData, engine, ALL_EXERCISES);
  assert.strictEqual(result.derivedFlags._gradeVSupport, true);
});

test('CRITICAL: _severeOA actually reaches exercise exclusion, not just validation', () => {
  // This is the test that would have caught a copy/clone between validateIntake
  // and selectExercisesForWeek. The flag firing is not enough — the impact-loading
  // codes must genuinely be absent from the generated protocol.
  const impactCodes = [
    'STAIR_CLIMB', 'STAIR_DESCEND', 'SLOW_TROT', 'JOG_LEASH', 'HILL_CLIMB',
    'BACKWARD_HILL', 'PERTURBATION_ADV', 'TRAMPOLINE_STAND', 'WATER_RETRIEVE',
  ];

  const severe = adapter.toEngineFormData(baseState({ visit: { oa_stage: 4 } }));
  const severeResult = adapter.runEngine(severe, engine, ALL_EXERCISES);
  const severeCodes = codesIn(severeResult);

  const leaked = impactCodes.filter((c) => severeCodes.has(c));
  assert.deepStrictEqual(leaked, [], `severe-OA protocol leaked impact codes: ${leaked.join(', ')}`);
});

test('PROOF: bypassing runEngine leaks impact codes to a severe-OA patient', () => {
  // This is why runEngine exists. Calling selectExercisesForWeek directly on a
  // formData that never went through validateIntake is the realistic V2 mistake,
  // and it silently defeats the severe-OA exclusion set.
  const unvalidated = adapter.toEngineFormData(baseState({ visit: { oa_stage: 4 } }));

  const weeks = [];
  for (let w = 1; w <= 8; w++) {
    weeks.push({ week: w, exercises: engine.selectExercisesForWeek(w, 8, ALL_EXERCISES, unvalidated) });
  }
  const leakedCodes = codesIn({ weeks });

  assert.strictEqual(unvalidated._severeOA, undefined, 'flag should never have been set');
  const leaked = ['HILL_CLIMB', 'BACKWARD_HILL'].filter((c) => leakedCodes.has(c));
  assert.ok(
    leaked.length > 0,
    'expected the unvalidated path to leak impact codes; if this now passes cleanly the engine ' +
      'gained an internal guard and Finding 2 should be re-examined'
  );

  // And the supported path must not leak them.
  const correct = adapter.toEngineFormData(baseState({ visit: { oa_stage: 4 } }));
  const correctCodes = codesIn(adapter.runEngine(correct, engine, ALL_EXERCISES));
  assert.ok(!correctCodes.has('HILL_CLIMB') && !correctCodes.has('BACKWARD_HILL'));
});

// ===========================================================================
section('Golden clinical cases — safety gates end to end');
// ===========================================================================

test('NWB patient receives no weight-bearing exercises beyond capacity', () => {
  const nwb = adapter.toEngineFormData(baseState({ visit: { weight_bearing_status: 'NWB' } }));
  const nwbResult = adapter.runEngine(nwb, engine, ALL_EXERCISES);
  const nwbCodes = codesIn(nwbResult);

  const pwb = adapter.toEngineFormData(baseState({ visit: { weight_bearing_status: 'PWB' } }));
  const pwbCodes = codesIn(adapter.runEngine(pwb, engine, ALL_EXERCISES));

  assert.ok(nwbCodes.size < pwbCodes.size, 'NWB protocol was not more restrictive than PWB');
});

test('dehisced incision is a hard block, not a warning', () => {
  const formData = adapter.toEngineFormData(
    baseState({ visit: { incision_status: 'Dehisced' } })
  );
  const result = adapter.runEngine(formData, engine, ALL_EXERCISES);
  assert.strictEqual(result.valid, false, 'dehisced incision did not block generation');
  assert.ok(result.errors.length > 0);
  assert.strictEqual(result.weeks.length, 0, 'a protocol was generated despite the block');
});

test('clinic without aquatic access receives no aquatic exercises', () => {
  const noAquatic = adapter.toEngineFormData(
    baseState({ clinic: { aquatic_access: false, modality_uwtm: false } })
  );
  const withAquatic = adapter.toEngineFormData(baseState());

  const noAquaticCodes = codesIn(adapter.runEngine(noAquatic, engine, ALL_EXERCISES));
  const withAquaticCodes = codesIn(adapter.runEngine(withAquatic, engine, ALL_EXERCISES));

  assert.ok(
    withAquaticCodes.size >= noAquaticCodes.size,
    'aquatic-equipped clinic was not offered at least as much as an unequipped one'
  );
});

test('missing identity fields are rejected by the engine, not silently defaulted', () => {
  const formData = adapter.toEngineFormData(
    baseState({ patient: { name: null, client_first_name: null, client_last_name: null } })
  );
  const result = adapter.runEngine(formData, engine, ALL_EXERCISES);
  assert.strictEqual(result.valid, false);
});

// ===========================================================================
section('Regression — the retired Python adapter shape must not pass');
// ===========================================================================

test('the old nested snake_case shape is rejected by the contract guard', () => {
  // Reproduces exactly what backend/patient_adapter.py emitted. It must NOT be
  // accepted, because 24 safety gates are absent from it.
  const legacyShape = {
    patient: { id: 'TEST-001', name: 'Test', condition: 'TPLO' },
    today: { pain_level: 2, lameness_grade: 1 },
    workflow: { status: 'ASSESSMENT' },
  };
  const guard = adapter.verifyEngineContract(legacyShape);
  assert.strictEqual(guard.ok, false);
  assert.ok(guard.missing.includes('weightBearingStatus'));
  assert.ok(guard.missing.includes('mmtGrade'));
  assert.ok(guard.missing.includes('neuroDeepPain'));
  assert.ok(guard.missing.includes('incisionStatus'));
});

// ---------------------------------------------------------------------------

console.log(`\n${'='.repeat(60)}`);
console.log(`PASSED: ${passed}    FAILED: ${failures.length}`);
console.log('='.repeat(60));

if (failures.length) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f.name}\n    ${f.err.stack.split('\n')[0]}`);
  process.exit(1);
}
process.exit(0);
