/**
 * K9 Clinical Workflow V2 — Protocol Persistence Tests
 *
 * Exercises the full clinical decision chain against a real in-memory SQLite
 * database and the REAL production K9 engine:
 *
 *   Protocol -> Version -> Review -> Approval -> Supersession -> B.E.A.U. Handoff
 *
 * Every test asserts one of the six invariants documented in
 * backend/protocol-store.js, or the lifecycle that connects them.
 *
 * Run:  node tests/protocol-store.test.js
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

// ---------------------------------------------------------------------------
// Load the production engine + sqlite3 driver (both read-only from K9)
// ---------------------------------------------------------------------------

const K9_BACKEND = process.env.K9_BACKEND || path.join(__dirname, '..', '..');

if (!fs.existsSync(path.join(K9_BACKEND, 'protocol-generator.js'))) {
  console.error(`\nCannot find the K9 engine at: ${K9_BACKEND}\n`);
  process.exit(2);
}

const engine = require(path.join(K9_BACKEND, 'protocol-generator.js'));
const { ALL_EXERCISES } = require(path.join(K9_BACKEND, 'all-exercises.js'));
const sqlite3 = require(path.join(K9_BACKEND, 'node_modules', 'sqlite3'));

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];
const queue = [];

function test(name, fn) {
  queue.push({ name, fn });
}
function section(title) {
  queue.push({ section: title });
}

async function runAll() {
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
      console.log(`        ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLINICIAN = { id: 1, username: 'dr.zaslow', role: 'veterinarian' };
const TECHNICIAN = { id: 2, username: 'tech.jamie', role: 'technician' };
const OWNER = { id: 3, username: 'pet.owner', role: 'user' };
const ADMIN = { id: 4, username: 'admin', role: 'admin' };

const FULL_CLINIC = {
  aquatic_access: true, modality_uwtm: true, modality_laser: true, modality_tens: true,
  modality_nmes: true, modality_therapeutic_us: true, modality_pulsed_emf: true,
  modality_shockwave: true, modality_cryotherapy: true, modality_heat_therapy: true,
};

function baseState(overrides = {}) {
  return {
    patient: {
      name: 'Rex', client_first_name: 'Test', client_last_name: 'Owner',
      species: 'canine', breed: 'Labrador', age: 5, weight: 32,
      condition: 'TPLO', affected_region: 'Stifle', treatment_approach: 'Surgical',
      surgery_date: '2026-09-01',
      ...(overrides.patient || {}),
    },
    visit: {
      pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB',
      mobility_level: 'Ambulatory',
      ...(overrides.visit || {}),
    },
    clinic: { ...FULL_CLINIC, ...(overrides.clinic || {}) },
    protocol: { length_weeks: 8, frequency: '2x/week', ...(overrides.protocol || {}) },
  };
}

/** Fresh in-memory DB with the V2 schema plus minimal FK targets. */
async function freshDb() {
  const db = wrap(new sqlite3.Database(':memory:'));
  // Production enables this (sqlite-provider.js). Without it a foreign-key
  // violation passes in tests and fails live — which is exactly how an
  // owner-reported red flag reached production broken.
  await db.run(`PRAGMA foreign_keys = ON`);
  await db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT)`);
  await db.run(`CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT)`);
  await db.run(`INSERT INTO patients (id, name) VALUES (100, 'Rex')`);
  for (const u of [CLINICIAN, TECHNICIAN, OWNER, ADMIN]) {
    await db.run(`INSERT INTO users (id, username, role) VALUES (?, ?, ?)`, [u.id, u.username, u.role]);
  }
  await store.createTables(db);
  return db;
}

/** Run the real engine and persist the result as a new version. */
async function generateVersion(db, protocolId, state = baseState(), actor = TECHNICIAN) {
  const engineInput = adapter.toEngineFormData(state);
  const engineResult = adapter.runEngine(engineInput, engine, ALL_EXERCISES);
  return store.createVersion(db, { protocolId, engineInput, engineResult, actor });
}

async function newProtocol(db) {
  return store.createProtocol(db, { patientId: 100, patientName: 'Rex', actor: CLINICIAN });
}

/** Drive a version all the way to APPROVED. */
async function approved(db, protocolId, state = baseState()) {
  const version = await generateVersion(db, protocolId, state);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);
  return approveWithGates(store, db, { versionId: version.id, actor: CLINICIAN, note: 'Reviewed' });
}

// ===========================================================================
section('Schema + lifecycle');
// ===========================================================================

test('schema applies cleanly and is idempotent', async () => {
  const db = await freshDb();
  await store.createTables(db); // second application must not throw
  const tables = await db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
  const names = tables.map((t) => t.name);
  for (const expected of [
    'protocols', 'protocol_versions', 'protocol_version_exercises',
    'protocol_version_restrictions', 'protocol_approvals', 'beau_handoffs',
    'protocol_audit_events',
  ]) {
    assert.ok(names.includes(expected), `missing table ${expected}`);
  }
});

test('full lifecycle: generate -> review -> approve -> handoff', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);

  assert.strictEqual(version.version_number, 1);
  assert.strictEqual(version.status, 'GENERATED');
  assert.ok(version.exercises.length > 0, 'engine produced no exercises');

  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);
  const approvedVersion = await approveWithGates(store, db, {
    versionId: version.id, actor: CLINICIAN, note: 'Looks good',
  });
  assert.strictEqual(approvedVersion.status, 'APPROVED');
  assert.strictEqual(approvedVersion.approval.approver_username, 'dr.zaslow');

  const handoff = await store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN });
  assert.strictEqual(handoff.status, 'ACTIVE');
  assert.strictEqual((await store.getVersion(db, version.id)).status, 'HANDED_OFF');
});

test('engine provenance is persisted, not just the output', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  // Severe OA — a gate that must be explainable years later.
  const version = await generateVersion(db, protocol.id, baseState({ visit: { oa_stage: 4 } }));

  assert.strictEqual(version.derived_flags._severeOA, true, 'fired gate not recorded');
  assert.strictEqual(version.engine_input.oaStage, 4, 'engine input not recorded');
  assert.ok(version.engine_warnings.length > 0, 'engine warnings not recorded');
});

test('version numbers increment per protocol', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const v1 = await generateVersion(db, protocol.id);
  const v2 = await generateVersion(db, protocol.id);
  const v3 = await generateVersion(db, protocol.id);
  assert.deepStrictEqual(
    [v1.version_number, v2.version_number, v3.version_number], [1, 2, 3]
  );
  assert.strictEqual((await store.listVersions(db, protocol.id)).length, 3);
});

// ===========================================================================
section('I1 — an APPROVED version is immutable');
// ===========================================================================

test('cannot add an exercise to an approved version', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id);

  await assert.rejects(
    () => store.addExercise(db, {
      versionId: version.id, exercise: { exercise_code: 'SIT_STAND' }, actor: CLINICIAN,
    }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
});

test('cannot remove an exercise from an approved version', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id);

  await assert.rejects(
    () => store.removeExercise(db, {
      versionId: version.id, exerciseRowId: version.exercises[0].id, actor: CLINICIAN,
    }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
});

test('revising an approved version clones it and leaves the original intact', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const v1 = await approved(db, protocol.id);
  const originalExerciseCount = v1.exercises.length;

  const v2 = await store.reviseApprovedVersion(db, { versionId: v1.id, actor: CLINICIAN });
  assert.strictEqual(v2.version_number, 2);
  assert.strictEqual(v2.status, 'DRAFT');
  assert.strictEqual(v2.exercises.length, originalExerciseCount);

  // The draft is editable...
  await store.addExercise(db, {
    versionId: v2.id, exercise: { exercise_code: 'SIT_STAND', week_number: 1 }, actor: CLINICIAN,
  });

  // ...and the approved original is untouched.
  const v1After = await store.getVersion(db, v1.id);
  assert.strictEqual(v1After.exercises.length, originalExerciseCount);
  assert.strictEqual(v1After.status, 'APPROVED');
});

test('a SUPERSEDED version cannot be modified', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const v1 = await approved(db, protocol.id);
  await approved(db, protocol.id); // approving v2 supersedes v1

  await assert.rejects(
    () => store.addRestriction(db, {
      versionId: v1.id, restrictionType: 'WARNING', detail: 'late edit', actor: CLINICIAN,
    }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
});

// ===========================================================================
section('I2 — only an authorized clinician may approve');
// ===========================================================================

test('a technician cannot approve', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', TECHNICIAN);

  await assert.rejects(
    () => approveWithGates(store, db, { versionId: version.id, actor: TECHNICIAN }),
    (err) => err.code === store.ERR.FORBIDDEN
  );
  assert.strictEqual((await store.getVersion(db, version.id)).status, 'REVIEW');
});

test('an owner cannot approve', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);

  await assert.rejects(
    () => approveWithGates(store, db, { versionId: version.id, actor: OWNER }),
    (err) => err.code === store.ERR.FORBIDDEN
  );
});

test('a rejected approval attempt is itself audited', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', TECHNICIAN);
  await approveWithGates(store, db, { versionId: version.id, actor: TECHNICIAN }).catch(() => {});

  const trail = await store.getAuditTrail(db, protocol.id);
  const rejection = trail.find((e) => e.action === store.AUDIT.APPROVAL_REJECTED);
  assert.ok(rejection, 'unauthorized approval attempt was not audited');
  assert.strictEqual(rejection.actor_username, 'tech.jamie');
});

test('a veterinarian approves by licensure, recorded as such', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);
  const result = await approveWithGates(store, db, { versionId: version.id, actor: CLINICIAN });

  assert.strictEqual(result.status, 'APPROVED');
  assert.strictEqual(result.approval.approval_basis, 'LICENSURE');
});

test('a rehab practitioner with a current CCRP approves, recorded as CREDENTIAL', async () => {
  const db = await freshDb();
  await db.run(`INSERT INTO users (id, username, role) VALUES (7, 'jane.ccrp', 'rehab_practitioner')`);
  await store.authority.addCredential(db, {
    userId: 7, credential: 'CCRP', licenseNumber: '12345',
    issuingBody: 'UTCVM', validFrom: '2025-01-01', validUntil: '2030-01-01', verifiedBy: ADMIN.id,
  });
  const actor = { id: 7, username: 'jane.ccrp', role: 'rehab_practitioner' };

  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);
  const result = await approveWithGates(store, db, { versionId: version.id, actor });

  assert.strictEqual(result.status, 'APPROVED');
  assert.strictEqual(result.approval.approval_basis, 'CREDENTIAL');
  // The record states the qualification, not merely the job title.
  assert.strictEqual(result.approval.approver_credential, 'CCRP');
  assert.ok(result.approval.credential_id);
});

test('a rehab practitioner with NO credential cannot approve', async () => {
  const db = await freshDb();
  await db.run(`INSERT INTO users (id, username, role) VALUES (8, 'sam.rehab', 'rehab_practitioner')`);
  const actor = { id: 8, username: 'sam.rehab', role: 'rehab_practitioner' };

  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);

  await assert.rejects(
    () => approveWithGates(store, db, { versionId: version.id, actor }),
    (err) => err.code === store.ERR.FORBIDDEN && err.reason === 'NO_CREDENTIAL'
  );
});

test('an EXPIRED CCRP cannot approve', async () => {
  const db = await freshDb();
  await db.run(`INSERT INTO users (id, username, role) VALUES (9, 'lapsed.ccrp', 'rehab_practitioner')`);
  await store.authority.addCredential(db, {
    userId: 9, credential: 'CCRP', licenseNumber: '999',
    validFrom: '2019-01-01', validUntil: '2024-06-30', verifiedBy: ADMIN.id,
  });
  const actor = { id: 9, username: 'lapsed.ccrp', role: 'rehab_practitioner' };

  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);

  // A lapsed certificate is not an authorization to prescribe.
  await assert.rejects(
    () => approveWithGates(store, db, { versionId: version.id, actor }),
    (err) => err.code === store.ERR.FORBIDDEN && err.reason === 'CREDENTIAL_EXPIRED'
  );
});

test('a REVOKED credential cannot approve even while unexpired', async () => {
  const db = await freshDb();
  await db.run(`INSERT INTO users (id, username, role) VALUES (10, 'revoked.ccrp', 'rehab_practitioner')`);
  const cred = await store.authority.addCredential(db, {
    userId: 10, credential: 'CCRP', validFrom: '2025-01-01', validUntil: '2030-01-01',
  });
  await db.run(`UPDATE clinician_credentials SET status = 'REVOKED' WHERE id = ?`, [cred.id]);
  const actor = { id: 10, username: 'revoked.ccrp', role: 'rehab_practitioner' };

  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);

  await assert.rejects(
    () => approveWithGates(store, db, { versionId: version.id, actor }),
    (err) => err.code === store.ERR.FORBIDDEN
  );
});

test('a later expiry does not invalidate an approval that was valid when made', async () => {
  const db = await freshDb();
  await db.run(`INSERT INTO users (id, username, role) VALUES (11, 'jo.ccrp', 'rehab_practitioner')`);
  const cred = await store.authority.addCredential(db, {
    userId: 11, credential: 'CCRT', validFrom: '2025-01-01', validUntil: '2030-01-01',
  });
  const actor = { id: 11, username: 'jo.ccrp', role: 'rehab_practitioner' };

  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);
  await approveWithGates(store, db, { versionId: version.id, actor });

  // The certificate lapses afterwards.
  await db.run(`UPDATE clinician_credentials SET status = 'EXPIRED' WHERE id = ?`, [cred.id]);

  const stored = await store.getVersion(db, version.id);
  assert.strictEqual(stored.status, 'APPROVED', 'a past approval was retroactively voided');
  assert.strictEqual(stored.approval.approver_credential, 'CCRT');
  // And the content binding still verifies.
  const integrity = await store.verifyApprovalIntegrity(db, version.id);
  assert.strictEqual(integrity.verified, true);
});

test('admin approval is recorded as ADMINISTRATIVE, not clinical', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);
  const result = await approveWithGates(store, db, { versionId: version.id, actor: ADMIN });

  // Break-glass must stay distinguishable from a clinician's signature.
  assert.strictEqual(result.approval.approval_basis, 'ADMINISTRATIVE');
});

// ===========================================================================
section('I3 — only an APPROVED version reaches B.E.A.U.');
// ===========================================================================

test('handing off a GENERATED version is refused', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);

  await assert.rejects(
    () => store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN }),
    (err) => err.code === store.ERR.NOT_APPROVED
  );
});

test('handing off a version still in REVIEW is refused', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);

  await assert.rejects(
    () => store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN }),
    (err) => err.code === store.ERR.NOT_APPROVED
  );
});

test('the HEP payload denies B.E.A.U. every clinical mutation', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id, baseState({ visit: { oa_stage: 4 } }));
  const handoff = await store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN });

  const p = handoff.payload.beau_permissions;
  assert.strictEqual(p.may_modify_prescription, false);
  assert.strictEqual(p.may_change_dosage, false);
  assert.strictEqual(p.may_change_frequency, false);
  assert.strictEqual(p.may_add_or_remove_exercises, false);
  assert.strictEqual(p.may_override_restrictions, false);
  // ...while permitting what B.E.A.U. legitimately owns.
  assert.strictEqual(p.may_adapt_execution_to_home_environment, true);
  assert.strictEqual(p.may_substitute_household_equipment, true);
});

test('the HEP payload carries the fired safety gates to B.E.A.U.', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id, baseState({ visit: { oa_stage: 4 } }));
  const handoff = await store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN });

  // B.E.A.U. must not re-derive gates, but needs them to refuse unsafe
  // household substitutions.
  assert.ok(
    handoff.payload.active_safety_gates.includes('_severeOA'),
    'severe-OA gate did not travel to B.E.A.U.'
  );
  assert.ok(handoff.payload.approval.content_hash);
  assert.strictEqual(handoff.payload.protocol_version_number, version.version_number);
});

test('engine dosage is persisted field by field, not collapsed', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  const ex = version.exercises.find((e) => e.exercise_code === 'PROM_STIFLE') || version.exercises[0];

  assert.ok(ex.sets, 'sets not persisted');
  assert.ok(ex.reps, 'reps not persisted');
  // Exercise frequency ("2-3x/day") is NOT the protocol frequency ("2x/week").
  assert.ok(ex.frequency, 'per-exercise frequency not persisted');
  assert.notStrictEqual(ex.frequency, version.frequency);
});

test('the home-execution payload reaches B.E.A.U.', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id);
  const handoff = await store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN });

  // Without `equipment` B.E.A.U. cannot compute household substitutions;
  // without `red_flags` an owner has no stop condition.
  const withEquipment = handoff.payload.exercises.filter((e) => e.equipment);
  const withRedFlags = handoff.payload.exercises.filter((e) => e.red_flags);
  assert.ok(withEquipment.length > 0, 'no exercise carried equipment to B.E.A.U.');
  assert.ok(withRedFlags.length > 0, 'no exercise carried red flags to B.E.A.U.');

  const dosed = handoff.payload.exercises.filter((e) => e.sets || e.reps);
  assert.strictEqual(dosed.length, handoff.payload.exercises.length, 'an exercise shipped with no dosage');
});

test('array-valued engine fields survive the round trip as arrays', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);

  const arrayValued = version.exercises.find((e) => Array.isArray(e.equipment) || Array.isArray(e.red_flags));
  assert.ok(arrayValued, 'expected at least one array-valued engine field to round trip as an array');
});

test('a clinician dosage override is recorded without erasing the engine dosage', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.addExercise(db, {
    versionId: version.id,
    exercise: { exercise_code: 'SIT_STAND', week_number: 1, sets: '3', reps: '8', dosage_override: '3 sets of 8, slow' },
    actor: CLINICIAN,
  });

  const stored = await store.getVersion(db, version.id);
  // The engine may already have selected this code, so disambiguate by origin.
  const manual = stored.exercises.find(
    (e) => e.exercise_code === 'SIT_STAND' && e.origin === 'CLINICIAN'
  );
  assert.ok(manual, 'clinician-added exercise not found');
  assert.strictEqual(manual.dosage_override, '3 sets of 8, slow');
  assert.strictEqual(manual.sets, '3');

  // The engine's own row for the same code is untouched alongside it.
  const engineRow = stored.exercises.find(
    (e) => e.exercise_code === 'SIT_STAND' && e.origin === 'ENGINE'
  );
  if (engineRow) assert.strictEqual(engineRow.dosage_override, null);
});

// ===========================================================================
section('I4 — an approval is bound to specific content');
// ===========================================================================

test('an untampered approval verifies', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id);
  const integrity = await store.verifyApprovalIntegrity(db, version.id);
  assert.strictEqual(integrity.verified, true);
});

test('tampering with an approved version is detected', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id);

  // Simulate an out-of-band write that bypasses the store's guards entirely —
  // a direct SQL edit, a legacy code path, a bad migration.
  await db.run(`UPDATE protocol_version_exercises SET sets = '99 reps' WHERE version_id = ?`,
    [version.id]);

  const integrity = await store.verifyApprovalIntegrity(db, version.id);
  assert.strictEqual(integrity.verified, false);
  assert.strictEqual(integrity.reason, 'CONTENT_HASH_MISMATCH');
});

test('a tampered version cannot be handed off to B.E.A.U.', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id);
  await db.run(`UPDATE protocol_version_exercises SET sets = '99 reps' WHERE version_id = ?`,
    [version.id]);

  await assert.rejects(
    () => store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN }),
    (err) => err.code === store.ERR.INTEGRITY
  );

  const trail = await store.getAuditTrail(db, protocol.id);
  assert.ok(trail.some((e) => e.action === store.AUDIT.INTEGRITY_FAILURE));
});

test('key order does not affect the content hash', async () => {
  const a = store.hashContent({ x: 1, y: [1, 2], z: { b: 2, a: 1 } });
  const b = store.hashContent({ z: { a: 1, b: 2 }, y: [1, 2], x: 1 });
  assert.strictEqual(a, b);
});

// ===========================================================================
section('I5 — a new approval supersedes the old prescription');
// ===========================================================================

test('approving a new version supersedes the previous approved one', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const v1 = await approved(db, protocol.id);
  const v2 = await approved(db, protocol.id);

  const v1After = await store.getVersion(db, v1.id);
  assert.strictEqual(v1After.status, 'SUPERSEDED');
  assert.strictEqual(v1After.superseded_by_version_id, v2.id);
  assert.ok(v1After.superseded_at);
  assert.strictEqual((await store.getVersion(db, v2.id)).status, 'APPROVED');
});

test('a new approval revokes the old live B.E.A.U. handoff', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const v1 = await approved(db, protocol.id);
  await store.handoffToBeau(db, { versionId: v1.id, actor: CLINICIAN });

  let active = await store.getActiveHandoff(db, 100);
  assert.strictEqual(active.version_id, v1.id, 'v1 handoff should be live');

  // A new clinical decision lands.
  await approved(db, protocol.id);

  active = await store.getActiveHandoff(db, 100);
  assert.strictEqual(active, null, 'the withdrawn home prescription was left live');
});

test('a patient never holds two ACTIVE handoffs', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const v1 = await approved(db, protocol.id);
  await store.handoffToBeau(db, { versionId: v1.id, actor: CLINICIAN });
  const v2 = await approved(db, protocol.id);
  await store.handoffToBeau(db, { versionId: v2.id, actor: CLINICIAN });

  const activeCount = await db.get(
    `SELECT COUNT(*) AS n FROM beau_handoffs WHERE patient_id = 100 AND status = 'ACTIVE'`
  );
  assert.strictEqual(activeCount.n, 1);
});

test('the superseded version remains fully readable as historical record', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const v1 = await approved(db, protocol.id);
  const originalCount = v1.exercises.length;
  await approved(db, protocol.id);

  const historical = await store.getVersion(db, v1.id);
  assert.strictEqual(historical.exercises.length, originalCount);
  assert.ok(historical.approval, 'the original approval record was lost');
  assert.strictEqual(historical.approval.approver_username, 'dr.zaslow');
});

// ===========================================================================
section('State machine');
// ===========================================================================

test('illegal transitions are rejected', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);

  // GENERATED -> HANDED_OFF skips review and approval entirely.
  await assert.rejects(
    () => store.setStatus(db, version.id, 'HANDED_OFF', CLINICIAN),
    (err) => err.code === store.ERR.ILLEGAL_TRANSITION
  );
});

test('approving straight from GENERATED is refused', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);

  await assert.rejects(
    () => approveWithGates(store, db, { versionId: version.id, actor: CLINICIAN }),
    (err) => err.code === store.ERR.ILLEGAL_TRANSITION
  );
});

test('a version cannot be approved twice', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id);

  await assert.rejects(
    () => approveWithGates(store, db, { versionId: version.id, actor: CLINICIAN }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
});

// ===========================================================================
section('I6 — audit trail');
// ===========================================================================

test('the full lifecycle is auditable end to end', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.setStatus(db, version.id, 'REVIEW', CLINICIAN);
  await approveWithGates(store, db, { versionId: version.id, actor: CLINICIAN });
  await store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN });

  const actions = (await store.getAuditTrail(db, protocol.id)).map((e) => e.action);
  for (const expected of [
    store.AUDIT.PROTOCOL_CREATED, store.AUDIT.VERSION_CREATED,
    store.AUDIT.STATUS_CHANGED, store.AUDIT.PROTOCOL_APPROVED, store.AUDIT.HEP_HANDED_OFF,
  ]) {
    assert.ok(actions.includes(expected), `missing audit action ${expected}`);
  }
});

test('every audit entry records actor identity and role', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await approved(db, protocol.id);
  await store.handoffToBeau(db, { versionId: version.id, actor: CLINICIAN });

  const trail = await store.getAuditTrail(db, protocol.id);
  assert.ok(trail.length > 0);
  for (const entry of trail) {
    assert.ok(entry.actor_username, `audit entry ${entry.action} has no actor`);
    assert.ok(entry.actor_role, `audit entry ${entry.action} has no role`);
    assert.ok(entry.created_at);
    assert.strictEqual(entry.source_system, 'K9');
  }
});

test('a clinician-added exercise is flagged as having bypassed the engine gates', async () => {
  const db = await freshDb();
  const protocol = await newProtocol(db);
  const version = await generateVersion(db, protocol.id);
  await store.addExercise(db, {
    versionId: version.id,
    exercise: { exercise_code: 'HILL_CLIMB', week_number: 1 },
    actor: CLINICIAN,
  });

  const trail = await store.getAuditTrail(db, protocol.id);
  const added = trail.find((e) => e.action === store.AUDIT.EXERCISE_ADDED);
  assert.ok(added);
  assert.strictEqual(JSON.parse(added.detail_json).bypassed_engine_gates, true);

  const stored = await store.getVersion(db, version.id);
  const manual = stored.exercises.find((e) => e.exercise_code === 'HILL_CLIMB');
  assert.strictEqual(manual.origin, 'CLINICIAN');
});

test('an anonymous write is refused', async () => {
  const db = await freshDb();
  await assert.rejects(
    () => store.createProtocol(db, { patientId: 100, patientName: 'Rex', actor: null }),
    (err) => err.code === store.ERR.INVALID
  );
});

// ---------------------------------------------------------------------------

runAll().then(() => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PASSED: ${passed}    FAILED: ${failures.length}`);
  console.log('='.repeat(60));
  if (failures.length) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  - ${f.name}\n    ${f.err.stack.split('\n')[0]}`);
    process.exit(1);
  }
  process.exit(0);
});
