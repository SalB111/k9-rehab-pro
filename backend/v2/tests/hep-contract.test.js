/**
 * K9 Clinical Workflow V2 — Approved HEP Contract Conformance
 *
 * Validates a REAL handoff payload — produced by driving the production engine
 * through the adapter, the store, approval and handoff — against
 * contracts/approved-hep.schema.json.
 *
 * Purpose: keep the published contract and the implementation from drifting.
 * B.E.A.U. codes against the schema; if the store stops matching it, that is a
 * broken integration boundary, not a documentation nit.
 *
 * Uses a small JSON-Schema subset validator (required / type / enum / const /
 * additionalProperties / items / properties / pattern / minimum) rather than a
 * dependency, since the V2 sandbox has no package.json yet.
 *
 * Run:  node tests/hep-contract.test.js
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

const store = require(path.join(V2_ROOT, 'protocol-store'));
const { approveWithGates } = require('./approve-helper');
const { wrap } = require(path.join(V2_ROOT, 'sqlite-adapter'));
const adapter = require(path.join(V2_ROOT, 'engine-adapter'));

const K9_BACKEND = process.env.K9_BACKEND || path.join(__dirname, '..', '..');
const engine = require(path.join(K9_BACKEND, 'protocol-generator.js'));
const { ALL_EXERCISES } = require(path.join(K9_BACKEND, 'all-exercises.js'));
const sqlite3 = require(path.join(K9_BACKEND, 'node_modules', 'sqlite3'));

const SCHEMA = JSON.parse(
  fs.readFileSync(path.join(V2_ROOT, 'contracts', 'approved-hep.schema.json'), 'utf8')
);

// ---------------------------------------------------------------------------
// Minimal JSON-Schema (draft-07 subset) validator
// ---------------------------------------------------------------------------

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function matchesType(value, expected) {
  const types = Array.isArray(expected) ? expected : [expected];
  const actual = typeOf(value);
  return types.some((t) => t === actual || (t === 'number' && actual === 'integer'));
}

function validate(value, schema, pathStr, errors) {
  if (!schema) return;

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${pathStr}: expected type ${JSON.stringify(schema.type)}, got ${typeOf(value)}`);
    return;
  }
  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${pathStr}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pathStr}: ${JSON.stringify(value)} not in enum ${JSON.stringify(schema.enum)}`);
  }
  if (schema.pattern && typeof value === 'string' && !new RegExp(schema.pattern).test(value)) {
    errors.push(`${pathStr}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
  }
  if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
    errors.push(`${pathStr}: ${value} below minimum ${schema.minimum}`);
  }

  if (typeOf(value) === 'array' && schema.items) {
    value.forEach((item, i) => validate(item, schema.items, `${pathStr}[${i}]`, errors));
  }

  if (typeOf(value) === 'object') {
    for (const req of schema.required || []) {
      if (!(req in value)) errors.push(`${pathStr}: missing required property '${req}'`);
    }
    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) {
          errors.push(`${pathStr}: unexpected property '${key}' (additionalProperties is false)`);
        }
      }
    }
    for (const [key, sub] of Object.entries(schema.properties || {})) {
      if (key in value) validate(value[key], sub, `${pathStr}.${key}`, errors);
    }
  }
}

function validateAgainstSchema(payload) {
  const errors = [];
  validate(payload, SCHEMA, '$', errors);
  return errors;
}

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];
const queue = [];
const test = (name, fn) => queue.push({ name, fn });

// ---------------------------------------------------------------------------
// Build a real handoff
// ---------------------------------------------------------------------------

const CLINICIAN = { id: 1, username: 'dr.zaslow', role: 'veterinarian' };

async function realHandoff(stateOverrides = {}) {
  const db = wrap(new sqlite3.Database(':memory:'));
  // Production enables this (sqlite-provider.js). Without it a foreign-key
  // violation passes in tests and fails live — which is exactly how an
  // owner-reported red flag reached production broken.
  await db.run(`PRAGMA foreign_keys = ON`);
  await db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT)`);
  await db.run(`CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT)`);
  await db.run(`INSERT INTO users (id, username, role) VALUES (1, 'dr.zaslow', 'veterinarian')`);
  // With foreign keys enforced (as in production) a protocol cannot be created
  // for a patient row that does not exist.
  await db.run(`INSERT INTO patients (id, name) VALUES (100, 'Rex')`);
  await store.createTables(db);

  const protocol = await store.createProtocol(db, {
    patientId: 100, patientName: 'Rex', actor: CLINICIAN,
  });

  const engineInput = adapter.toEngineFormData({
    patient: {
      name: 'Rex', client_first_name: 'Test', client_last_name: 'Owner',
      condition: 'TPLO', affected_region: 'Stifle', treatment_approach: 'Surgical',
      ...(stateOverrides.patient || {}),
    },
    visit: { pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB', ...(stateOverrides.visit || {}) },
    clinic: { aquatic_access: true, modality_laser: true, ...(stateOverrides.clinic || {}) },
    protocol: { length_weeks: 6, frequency: '2x/week' },
  });
  const engineResult = adapter.runEngine(engineInput, engine, ALL_EXERCISES);

  const version = await store.createVersion(db, {
    protocolId: protocol.id, engineInput, engineResult, actor: CLINICIAN,
  });
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);
  await approveWithGates(store, db, { versionId: version.id, actor: CLINICIAN, note: 'Approved' });
  const handoff = await store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN });

  return { db, protocol, version, handoff };
}

// ---------------------------------------------------------------------------

test('a real handoff payload conforms to the published contract', async () => {
  const { handoff } = await realHandoff();
  const errors = validateAgainstSchema(handoff.payload);
  assert.deepStrictEqual(errors, [], `contract violations:\n  ${errors.join('\n  ')}`);
});

test('a severe-OA handoff conforms and carries its gate', async () => {
  const { handoff } = await realHandoff({ visit: { oa_stage: 4 } });
  const errors = validateAgainstSchema(handoff.payload);
  assert.deepStrictEqual(errors, [], `contract violations:\n  ${errors.join('\n  ')}`);
  assert.ok(handoff.payload.active_safety_gates.includes('_severeOA'));
});

test('a neurological handoff conforms and carries its gate', async () => {
  const { handoff } = await realHandoff({
    patient: { condition: 'IVDD' },
    visit: { ivdd_grade: 'V', neuro_deep_pain: 'Absent' },
  });
  const errors = validateAgainstSchema(handoff.payload);
  assert.deepStrictEqual(errors, [], `contract violations:\n  ${errors.join('\n  ')}`);
  assert.ok(handoff.payload.active_safety_gates.includes('_gradeVSupport'));
  assert.ok(handoff.payload.active_safety_gates.includes('_ivddSevere'));
});

test('the validator actually rejects a malformed payload', async () => {
  // Guard against a vacuous validator: if this passes cleanly, the conformance
  // tests above prove nothing.
  const { handoff } = await realHandoff();
  const broken = JSON.parse(JSON.stringify(handoff.payload));
  broken.beau_permissions.may_change_dosage = true;   // violates const false
  delete broken.approval.content_hash;                // violates required
  broken.exercises[0].origin = 'BEAU';                // violates enum
  broken.unexpected_field = 'x';                      // violates additionalProperties

  const errors = validateAgainstSchema(broken);
  assert.ok(errors.length >= 4, `validator too permissive, found: ${JSON.stringify(errors)}`);
  assert.ok(errors.some((e) => e.includes('may_change_dosage')));
  assert.ok(errors.some((e) => e.includes('content_hash')));
  assert.ok(errors.some((e) => e.includes('origin')));
  assert.ok(errors.some((e) => e.includes('unexpected_field')));
});

test('NO clinic-only modality can reach the owner', async () => {
  // The defect this prevents: LASER_IV and NMES_QUAD were being handed to pet
  // owners. A Class IV therapeutic laser needs eye protection and a trained
  // operator; NMES needs electrode placement and intensity titration. Neither
  // is a usability problem — it is a safety one.
  const { handoff } = await realHandoff({ clinic: { modality_laser: true, modality_nmes: true } });

  const FORBIDDEN = ['LASER', 'NMES', 'ESTIM', 'TENS', 'ULTRASOUND', 'US_PULSED',
    'US_CONTINUOUS', 'SHOCKWAVE', 'ESWT', 'PEMF', 'UWTM', 'WATER_TREADMILL'];

  const leaked = handoff.payload.exercises.filter((e) =>
    FORBIDDEN.some((term) => String(e.exercise_code).toUpperCase().includes(term)));

  assert.deepStrictEqual(
    leaked.map((e) => e.exercise_code), [],
    'clinic-delivered modality sent to a pet owner'
  );
});

test('clinic-delivered work travels separately, for the CCRT', async () => {
  const { handoff } = await realHandoff({ clinic: { modality_laser: true, modality_nmes: true } });
  const clinic = handoff.payload.clinic_protocol || [];

  assert.ok(clinic.length > 0, 'an equipped clinic produced no in-clinic protocol');
  for (const item of clinic) {
    assert.ok(item.venue_reason, `${item.exercise_code} excluded from home with no stated reason`);
  }
  // It is carried so the owner can see what happens at their appointment —
  // never offered as something to attempt.
  const homeCodes = new Set(handoff.payload.exercises.map((e) => e.exercise_code));
  for (const item of clinic) {
    assert.ok(!homeCodes.has(item.exercise_code), `${item.exercise_code} is in both streams`);
  }
});

test('the home program is a realistic size, not the full protocol', async () => {
  const { handoff, version } = await realHandoff();
  const weeks = new Set(handoff.payload.exercises.map((e) => e.week_number));

  for (const week of weeks) {
    const perWeek = handoff.payload.exercises.filter((e) => e.week_number === week);
    assert.ok(
      perWeek.length <= 6,
      `week ${week} sends ${perWeek.length} exercises home — an owner will not complete that`
    );
  }
  // The full clinically-relevant set is still stored and reviewable; only the
  // shortlist is sent. Depth is retained, not discarded.
  assert.ok(
    version.exercises.length > handoff.payload.exercises.length,
    'nothing was narrowed — the clinician lost the shortlist step'
  );
});

test('every exercise sent home states why it was chosen', async () => {
  const { handoff } = await realHandoff();
  for (const ex of handoff.payload.exercises) {
    if (ex.origin === 'CLINICIAN') continue; // a clinician needs no algorithmic reason
    assert.ok(ex.selection_reason, `${ex.exercise_code} was shortlisted with no stated reason`);
  }
});

test('every exercise reaching B.E.A.U. carries dosage', async () => {
  const { handoff } = await realHandoff();
  for (const ex of handoff.payload.exercises) {
    assert.ok(
      ex.sets || ex.reps || ex.duration_minutes || ex.dosage_override,
      `${ex.exercise_code} shipped to B.E.A.U. with no dosage at all`
    );
  }
});

// ---------------------------------------------------------------------------

(async () => {
  console.log('\nApproved HEP contract conformance');
  console.log('---------------------------------');
  for (const item of queue) {
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
  process.exit(failures.length ? 1 : 0);
})();
