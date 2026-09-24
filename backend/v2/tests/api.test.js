/**
 * K9 Clinical Workflow V2 — API tests
 *
 * Boots the real V2 router on a real Express server over a real HTTP port, with
 * a real in-memory SQLite database and the real production K9 engine. No mocks
 * in the request path — the point is to prove the wiring, and a mocked store
 * would prove nothing about it.
 *
 * Run:  node tests/api.test.js
 */

'use strict';

const assert = require('assert');
const path = require('path');

// V2 runtime code now lives in the production repo (backend/v2). These tests
// point at it directly so there is ONE copy: a second copy in this sandbox
// would drift from what actually deploys, and the tests would stop proving
// anything about production. Override with V2_ROOT.
const V2_ROOT = process.env.V2_ROOT || path.join(__dirname, '..');

const http = require('http');

const schema = require(path.join(V2_ROOT, 'schema'));
const clinicStore = require(path.join(V2_ROOT, 'clinic-store'));
const authority = require(path.join(V2_ROOT, 'authority'));
const { wrap } = require(path.join(V2_ROOT, 'sqlite-adapter'));
const { createV2Router } = require(path.join(V2_ROOT, 'routes/v2-router'));
const { errorHandler } = require(path.join(V2_ROOT, 'http-errors'));

const K9_BACKEND = process.env.K9_BACKEND || path.join(__dirname, '..', '..');
const engine = require(path.join(K9_BACKEND, 'protocol-generator.js'));
const { ALL_EXERCISES } = require(path.join(K9_BACKEND, 'all-exercises.js'));
const sqlite3 = require(path.join(K9_BACKEND, 'node_modules', 'sqlite3'));
const express = require(path.join(K9_BACKEND, 'node_modules', 'express'));

// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];
const queue = [];
const test = (name, fn) => queue.push({ name, fn });
const section = (title) => queue.push({ section: title });

const VET = { id: 1, username: 'dr.zaslow', role: 'veterinarian' };
const TECH = { id: 2, username: 'tech.jamie', role: 'technician' };
const REHAB = { id: 3, username: 'jane.ccrp', role: 'rehab_practitioner' };
const ADMIN = { id: 4, username: 'admin', role: 'admin' };

const FULL_CAPABILITIES = Object.fromEntries(clinicStore.CAPABILITY_KEYS.map((k) => [k, true]));

/**
 * Boot an app. `actAs` stands in for K9's requireAuth — the real middleware is
 * injected in production; here we control identity directly so authorization
 * can be tested independently of JWT handling.
 */
async function boot({ seedCapabilities = true, seedClinic = true } = {}) {
  const db = wrap(new sqlite3.Database(':memory:'));
  // Production enables this (sqlite-provider.js). Without it a foreign-key
  // violation passes in tests and fails live — which is exactly how an
  // owner-reported red flag reached production broken.
  await db.run(`PRAGMA foreign_keys = ON`);
  await db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT)`);
  await db.run(`CREATE TABLE clinics (id INTEGER PRIMARY KEY, clinic_name TEXT)`);
  await db.run(`CREATE TABLE patients (
    id INTEGER PRIMARY KEY, name TEXT, client_first_name TEXT, client_last_name TEXT,
    species TEXT, breed TEXT, age REAL, weight REAL, condition TEXT,
    affected_region TEXT, treatment_approach TEXT, surgery_date TEXT,
    medical_history TEXT, current_medications TEXT, special_instructions TEXT
  )`);
  if (seedClinic) {
    await db.run(`INSERT INTO clinics (id, clinic_name) VALUES (1, 'Founding Clinic')`);
  }
  await db.run(
    `INSERT INTO patients (id, name, client_first_name, client_last_name, species, breed, age, weight,
                           condition, affected_region, treatment_approach, surgery_date)
     VALUES (100, 'Rex', 'Test', 'Owner', 'canine', 'Labrador', 5, 32, 'TPLO', 'Stifle', 'Surgical', '2026-08-15')`
  );
  for (const u of [VET, TECH, REHAB, ADMIN]) {
    await db.run(`INSERT INTO users (id, username, role) VALUES (?, ?, ?)`, [u.id, u.username, u.role]);
  }
  await schema.applyAll(db);

  if (seedCapabilities) {
    await clinicStore.setCapabilities(db, { clinicId: 1, capabilities: FULL_CAPABILITIES, actor: ADMIN });
  }

  let current = VET;
  const app = express();
  app.use('/api/v2', createV2Router({
    db, engine, allExercises: ALL_EXERCISES, express,
    requireAuth: (req, _res, next) => { req.user = current; next(); },
  }));
  app.use(errorHandler({ error() {} })); // silence expected 500s in test output

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v2`;

  async function call(method, urlPath, body) {
    const res = await fetch(base + urlPath, {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* empty body */ }
    return { status: res.status, body: json };
  }

  return {
    db, call,
    actAs(user) { current = user; },
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

/** Drive the workflow to an approved, handed-off version. */
async function runWorkflow(api, { assessment = { pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB' } } = {}) {
  api.actAs(TECH);
  const visit = await api.call('POST', '/patients/100/visits', {
    visit_date: '2026-09-01', visit_type: 'INITIAL',
  });
  await api.call('POST', `/visits/${visit.body.data.id}/assessment`, assessment);
  const rec = await api.call('POST', `/visits/${visit.body.data.id}/recommendation`, {
    protocol_length_weeks: 6, frequency: '2x/week',
  });

  api.actAs(VET);
  await api.call('POST', `/versions/${rec.body.data.id}/status`, { status: 'REVIEW' });

  // Approval refuses until every applicable safety gate carries a clinician's
  // confirmation. This suite approves as scaffolding, so confirm whatever the
  // version recorded - the gate behaviour itself is asserted separately.
  const gateRes = await api.call('GET', `/versions/${rec.body.data.id}`);
  const gate_confirmations = {};
  for (const f of (gateRes.body?.data?.safety_gates || [])) gate_confirmations[f] = true;

  const approved = await api.call('POST', `/versions/${rec.body.data.id}/approve`,
    { note: 'ok', gate_confirmations });
  return { visit: visit.body.data, version: rec.body.data, approved };
}

// ===========================================================================
section('Workflow over HTTP');
// ===========================================================================

test('snapshot -> visit -> assessment -> recommendation -> review -> approve -> handoff', async () => {
  const api = await boot();
  try {
    const snapshot = await api.call('GET', '/patients/100/snapshot');
    assert.strictEqual(snapshot.status, 200);
    assert.strictEqual(snapshot.body.data.has_baseline, false);
    assert.strictEqual(snapshot.body.data.visit_count, 0);

    const { version, approved } = await runWorkflow(api);
    assert.strictEqual(approved.status, 200);
    assert.strictEqual(approved.body.data.status, 'APPROVED');
    assert.strictEqual(approved.body.data.approval.approval_basis, 'LICENSURE');

    const handoff = await api.call('POST', `/versions/${version.id}/handoff`);
    assert.strictEqual(handoff.status, 201);
    assert.strictEqual(handoff.body.data.status, 'ACTIVE');

    const beau = await api.call('GET', '/beau/handoffs/100');
    assert.strictEqual(beau.status, 200);
    assert.strictEqual(beau.body.data.payload.beau_permissions.may_change_dosage, false);
  } finally { await api.close(); }
});

test('the snapshot reflects the visit once one exists', async () => {
  const api = await boot();
  try {
    await runWorkflow(api);
    const snapshot = await api.call('GET', '/patients/100/snapshot');
    assert.strictEqual(snapshot.body.data.visit_count, 1);
    assert.strictEqual(snapshot.body.data.current_state.pain_score, 3);
    assert.ok(snapshot.body.data.active_protocol, 'approved protocol not surfaced');
  } finally { await api.close(); }
});

test('measurement history is served as a trend', async () => {
  const api = await boot();
  try {
    api.actAs(TECH);
    for (const [date, rom] of [['2026-08-20', 95], ['2026-09-03', 115]]) {
      const v = await api.call('POST', '/patients/100/visits', { visit_date: date });
      await api.call('POST', `/visits/${v.body.data.id}/measurements`, {
        measure_key: 'ROM_FLEXION', site: 'STIFLE', side: 'LEFT', value_numeric: rom, unit: 'degrees',
      });
    }
    const history = await api.call('GET', '/patients/100/measurements/ROM_FLEXION?site=STIFLE&side=LEFT');
    assert.strictEqual(history.status, 200);
    assert.strictEqual(history.body.data.length, 2);
  } finally { await api.close(); }
});

test('an unknown patient is 404, not 500', async () => {
  const api = await boot();
  try {
    assert.strictEqual((await api.call('GET', '/patients/9999/snapshot')).status, 404);
    assert.strictEqual((await api.call('GET', '/visits/9999')).status, 404);
  } finally { await api.close(); }
});

// ===========================================================================
section('Authorization at the edge');
// ===========================================================================

test('a technician cannot approve (403)', async () => {
  const api = await boot();
  try {
    const { version } = await runWorkflow(api);
    api.actAs(TECH);
    const res = await api.call('POST', `/versions/${version.id}/approve`);
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.code, 'FORBIDDEN');
  } finally { await api.close(); }
});

test('a rehab practitioner without a credential cannot approve (403), and is told why', async () => {
  const api = await boot();
  try {
    api.actAs(TECH);
    const visit = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
    await api.call('POST', `/visits/${visit.body.data.id}/assessment`, { pain_score: 3 });
    const rec = await api.call('POST', `/visits/${visit.body.data.id}/recommendation`, {});
    api.actAs(VET);
    await api.call('POST', `/versions/${rec.body.data.id}/status`, { status: 'REVIEW' });

    api.actAs(REHAB);
    const res = await api.call('POST', `/versions/${rec.body.data.id}/approve`);
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.reason, 'NO_CREDENTIAL');
    assert.match(res.body.error, /CCRP\/CCRT/);
  } finally { await api.close(); }
});

test('a rehab practitioner WITH a current CCRP can approve, recorded as CREDENTIAL', async () => {
  const api = await boot();
  try {
    await authority.addCredential(api.db, {
      userId: REHAB.id, credential: 'CCRP', licenseNumber: '12345',
      validFrom: '2025-01-01', validUntil: '2030-01-01', verifiedBy: ADMIN.id,
    });

    api.actAs(TECH);
    const visit = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
    await api.call('POST', `/visits/${visit.body.data.id}/assessment`, { pain_score: 3 });
    const rec = await api.call('POST', `/visits/${visit.body.data.id}/recommendation`, {});
    api.actAs(VET);
    await api.call('POST', `/versions/${rec.body.data.id}/status`, { status: 'REVIEW' });

    api.actAs(REHAB);
    // Scaffolding: this test is about credential-based authority, not gates.
    const gv = await api.call('GET', `/versions/${rec.body.data.id}`);
    const gate_confirmations = {};
    for (const f of (gv.body?.data?.safety_gates || [])) gate_confirmations[f] = true;

    const res = await api.call('POST', `/versions/${rec.body.data.id}/approve`, { gate_confirmations });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.approval.approval_basis, 'CREDENTIAL');
    assert.strictEqual(res.body.data.approval.approver_credential, 'CCRP');
  } finally { await api.close(); }
});

test('only an admin may record a credential (403 otherwise)', async () => {
  const api = await boot();
  try {
    api.actAs(REHAB);
    const selfGrant = await api.call('POST', '/credentials', {
      user_id: REHAB.id, credential: 'CCRP', valid_until: '2030-01-01',
    });
    // A practitioner must not be able to grant themselves approval authority.
    assert.strictEqual(selfGrant.status, 403);

    api.actAs(ADMIN);
    const byAdmin = await api.call('POST', '/credentials', {
      user_id: REHAB.id, credential: 'CCRP', valid_until: '2030-01-01',
    });
    assert.strictEqual(byAdmin.status, 201);
  } finally { await api.close(); }
});

test('/me/approval-authority tells a user whether they can sign', async () => {
  const api = await boot();
  try {
    api.actAs(VET);
    const vet = await api.call('GET', '/me/approval-authority');
    assert.strictEqual(vet.body.data.allowed, true);
    assert.strictEqual(vet.body.data.basis, 'LICENSURE');

    api.actAs(TECH);
    const tech = await api.call('GET', '/me/approval-authority');
    assert.strictEqual(tech.body.data.allowed, false);
    assert.ok(tech.body.data.explanation);
  } finally { await api.close(); }
});

test('a technician cannot change clinic capabilities (403)', async () => {
  const api = await boot();
  try {
    api.actAs(TECH);
    const res = await api.call('PUT', '/clinic/capabilities', { modality_laser: false });
    assert.strictEqual(res.status, 403);
  } finally { await api.close(); }
});

test('another admin cannot demote the system owner', async () => {
  // The lockout this prevents: the owner grants a hospital administrator
  // access, and that administrator demotes them out of their own installation.
  const api = await boot();
  try {
    await authority.setSystemOwner(api.db, { userId: VET.id, note: 'creator' });
    await api.db.run(`UPDATE users SET role = 'admin' WHERE id = ?`, [VET.id]);

    api.actAs(ADMIN); // a different administrator
    const res = await api.call('POST', `/users/${VET.id}/role`, { role: 'technician' });
    assert.strictEqual(res.status, 403);
    assert.match(res.body.error, /owns this installation/);

    const after = await api.db.get(`SELECT role FROM users WHERE id = ?`, [VET.id]);
    assert.strictEqual(after.role, 'admin', 'the owner was demoted');
  } finally { await api.close(); }
});

test('the owner can change their own role', async () => {
  // Protection, not a cage: ownership must not trap its holder.
  const api = await boot();
  try {
    await authority.setSystemOwner(api.db, { userId: VET.id });
    await api.db.run(`UPDATE users SET role = 'admin' WHERE id = ?`, [VET.id]);

    api.actAs({ ...VET, role: 'admin' });
    const res = await api.call('POST', `/users/${VET.id}/role`, { role: 'veterinarian' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.role, 'veterinarian');
  } finally { await api.close(); }
});

test('only the owner can transfer or release ownership', async () => {
  const api = await boot();
  try {
    await authority.setSystemOwner(api.db, { userId: VET.id });

    api.actAs(ADMIN);
    const seize = await api.call('POST', '/system-owner', { user_id: ADMIN.id });
    assert.strictEqual(seize.status, 403, 'another admin seized ownership');

    api.actAs({ ...VET, role: 'admin' });
    const transfer = await api.call('POST', '/system-owner', { user_id: ADMIN.id });
    assert.strictEqual(transfer.status, 200);
    assert.strictEqual(Number(transfer.body.data.user_id), ADMIN.id);
  } finally { await api.close(); }
});

test('ownership is visible, not hidden', async () => {
  // A protection nobody can see is indistinguishable from a backdoor.
  const api = await boot();
  try {
    await authority.setSystemOwner(api.db, { userId: VET.id });
    api.actAs(ADMIN);

    const owner = await api.call('GET', '/system-owner');
    assert.strictEqual(owner.status, 200);
    assert.strictEqual(owner.body.data.user.username, VET.username);

    const users = await api.call('GET', '/users');
    const flagged = users.body.data.find((u) => u.id === VET.id);
    assert.strictEqual(flagged.is_system_owner, true);
  } finally { await api.close(); }
});

// ===========================================================================
section('Clinical state conflicts are 409, not 400 or 500');
// ===========================================================================

test('approving with an unconfirmed safety gate is 409, and names the gates', async () => {
  // Deliberately NOT using the scaffolding helper: this is the test that
  // pins the enforcement down, so the confirmation must be visible here and
  // an accidental change to the helper must not be able to mask a regression.
  const api = await boot();
  try {
    api.actAs(TECH);
    const visit = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
    await api.call('POST', `/visits/${visit.body.data.id}/assessment`, { pain_score: 3 });
    const rec = await api.call('POST', `/visits/${visit.body.data.id}/recommendation`, {});

    api.actAs(VET);
    await api.call('POST', `/versions/${rec.body.data.id}/status`, { status: 'REVIEW' });

    const gv = await api.call('GET', `/versions/${rec.body.data.id}`);
    const gates = gv.body?.data?.safety_gates || [];
    assert.ok(gates.length > 0, 'the version must record which gates applied');

    // Nothing confirmed.
    const none = await api.call('POST', `/versions/${rec.body.data.id}/approve`, { note: 'ok' });
    assert.strictEqual(none.status, 409);
    assert.strictEqual(none.body.code, 'GATES_UNCONFIRMED');

    // All but one confirmed - still refused.
    const partial = {};
    gates.slice(1).forEach((f) => { partial[f] = true; });
    const short = await api.call('POST', `/versions/${rec.body.data.id}/approve`,
      { note: 'ok', gate_confirmations: partial });
    assert.strictEqual(short.status, 409, 'one outstanding gate must still refuse');

    // Truthy is not confirmed. A client sending "yes" or 1 has not had a
    // clinician tick anything; only a literal true counts.
    for (const sloppyValue of ['yes', 1, 'true', {}]) {
      const sloppy = {};
      gates.forEach((f) => { sloppy[f] = sloppyValue; });
      const res = await api.call('POST', `/versions/${rec.body.data.id}/approve`,
        { note: 'ok', gate_confirmations: sloppy });
      assert.strictEqual(res.status, 409,
        `${JSON.stringify(sloppyValue)} must not count as a confirmation`);
    }

    // All confirmed - approval proceeds.
    const all = {};
    gates.forEach((f) => { all[f] = true; });
    const ok = await api.call('POST', `/versions/${rec.body.data.id}/approve`,
      { note: 'ok', gate_confirmations: all });
    assert.strictEqual(ok.status, 200);
    assert.strictEqual(ok.body.data.status, 'APPROVED');
  } finally { await api.close(); }
});

test('approving without review is 409', async () => {
  const api = await boot();
  try {
    api.actAs(TECH);
    const visit = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
    await api.call('POST', `/visits/${visit.body.data.id}/assessment`, { pain_score: 3 });
    const rec = await api.call('POST', `/visits/${visit.body.data.id}/recommendation`, {});

    api.actAs(VET);
    const res = await api.call('POST', `/versions/${rec.body.data.id}/approve`);
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.code, 'ILLEGAL_TRANSITION');
  } finally { await api.close(); }
});

test('editing an approved version is 409', async () => {
  const api = await boot();
  try {
    const { version } = await runWorkflow(api);
    const res = await api.call('POST', `/versions/${version.id}/exercises`, { exercise_code: 'SIT_STAND' });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.code, 'IMMUTABLE');
  } finally { await api.close(); }
});

test('handing off an unapproved version is 409', async () => {
  const api = await boot();
  try {
    api.actAs(TECH);
    const visit = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
    await api.call('POST', `/visits/${visit.body.data.id}/assessment`, { pain_score: 3 });
    const rec = await api.call('POST', `/visits/${visit.body.data.id}/recommendation`, {});

    api.actAs(VET);
    const res = await api.call('POST', `/versions/${rec.body.data.id}/handoff`);
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.code, 'NOT_APPROVED');
  } finally { await api.close(); }
});

test('a dehisced incision blocks generation as a clinical refusal, not a crash', async () => {
  const api = await boot();
  try {
    api.actAs(TECH);
    const visit = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
    await api.call('POST', `/visits/${visit.body.data.id}/assessment`, {
      pain_score: 3, incision_status: 'Dehisced',
    });
    const res = await api.call('POST', `/visits/${visit.body.data.id}/recommendation`, {});
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.code, 'CLINICAL_BLOCK');
    assert.match(res.body.error, /incision/i);
  } finally { await api.close(); }
});

test('an invalid overall_change is 400', async () => {
  const api = await boot();
  try {
    api.actAs(TECH);
    const visit = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
    const res = await api.call('POST', `/visits/${visit.body.data.id}/assessment`, {
      overall_change: 'better-ish',
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID');
  } finally { await api.close(); }
});

// ===========================================================================
section('Clinic capabilities reach the engine');
// ===========================================================================

test('unstated capabilities are surfaced, not silently swallowed', async () => {
  const api = await boot({ seedCapabilities: false });
  try {
    const snapshot = await api.call('GET', '/patients/100/snapshot');
    assert.strictEqual(snapshot.body.data.clinic.configured, false);
    // All ten unstated. Every one silently WITHHOLDS therapy, so the clinician
    // must be told before generating rather than left to wonder.
    assert.strictEqual(
      snapshot.body.data.clinic.unstated_capabilities.length,
      clinicStore.CAPABILITY_KEYS.length
    );

    api.actAs(TECH);
    const visit = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
    await api.call('POST', `/visits/${visit.body.data.id}/assessment`, { pain_score: 3 });
    const rec = await api.call('POST', `/visits/${visit.body.data.id}/recommendation`, {});
    assert.strictEqual(rec.body.data.unstated_clinic_capabilities.length, clinicStore.CAPABILITY_KEYS.length);
  } finally { await api.close(); }
});

test('a clinic with a laser gets laser work; one without does not', async () => {
  const withLaser = await boot();
  const withoutLaser = await boot({ seedCapabilities: false });
  try {
    await clinicStore.setCapabilities(withoutLaser.db, {
      clinicId: 1,
      capabilities: Object.fromEntries(clinicStore.CAPABILITY_KEYS.map((k) => [k, false])),
      actor: ADMIN,
    });

    async function codesFor(api) {
      api.actAs(TECH);
      const v = await api.call('POST', '/patients/100/visits', { visit_date: '2026-09-01' });
      await api.call('POST', `/visits/${v.body.data.id}/assessment`, {
        pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB',
      });
      const rec = await api.call('POST', `/visits/${v.body.data.id}/recommendation`, {});
      return new Set(rec.body.data.exercises.map((e) => e.exercise_code));
    }

    const equipped = await codesFor(withLaser);
    const bare = await codesFor(withoutLaser);

    // Assert BOTH directions. Checking only that the bare clinic lacks laser
    // would pass vacuously if the equipped one never received it either.
    const MODALITY_CODES = ['LASER_IV', 'TENS_THERAPY', 'NMES_QUAD', 'US_PULSED',
      'US_CONTINUOUS', 'PEMF_THERAPY', 'SHOCKWAVE', 'COLD_THERAPY', 'HEAT_THERAPY'];

    const equippedModalities = MODALITY_CODES.filter((c) => equipped.has(c));
    const bareModalities = MODALITY_CODES.filter((c) => bare.has(c));

    assert.ok(
      equippedModalities.length > 0,
      'equipped clinic received no modality work at all — the positive direction is untested'
    );
    assert.deepStrictEqual(
      bareModalities, [],
      `modalities prescribed to a clinic that owns none: ${bareModalities.join(', ')}`
    );
    assert.ok(equipped.size > bare.size, 'equipped clinic offered no more than an unequipped one');
  } finally {
    await withLaser.close();
    await withoutLaser.close();
  }
});

test('capabilities survive as a tri-state: set, unset, and never stated differ', async () => {
  const api = await boot({ seedCapabilities: false });
  try {
    api.actAs(ADMIN);
    await api.call('PUT', '/clinic/capabilities', { modality_laser: true, modality_tens: false });
    const res = await api.call('GET', '/clinic/capabilities');

    assert.strictEqual(res.body.data.capabilities.modality_laser, true);
    assert.strictEqual(res.body.data.capabilities.modality_tens, false);
    assert.strictEqual(res.body.data.capabilities.modality_shockwave, null);
    // "we don't have TENS" is answered; "nobody ever said" is still a gap.
    assert.ok(res.body.data.unstated.includes('modality_shockwave'));
    assert.ok(!res.body.data.unstated.includes('modality_tens'));
  } finally { await api.close(); }
});

test('a partial capability update does not un-state the others', async () => {
  const api = await boot();
  try {
    api.actAs(ADMIN);
    await api.call('PUT', '/clinic/capabilities', { modality_laser: false });
    const res = await api.call('GET', '/clinic/capabilities');
    assert.strictEqual(res.body.data.capabilities.modality_laser, false);
    assert.strictEqual(res.body.data.capabilities.modality_nmes, true, 'an unmentioned capability was reset');
  } finally { await api.close(); }
});

test('equipment can be recorded on an installation with no clinics row', async () => {
  // The real database had zero rows in `clinics`. Falling back to a fabricated
  // clinic_id of 1 satisfied the type but violated the clinic_capabilities
  // foreign key, so recording equipment failed with an opaque
  // SQLITE_CONSTRAINT. Every earlier test passed only because the fixture
  // seeded a clinic the real installation did not have.
  const api = await boot({ seedClinic: false, seedCapabilities: false });
  try {
    api.actAs(ADMIN);
    const res = await api.call('PUT', '/clinic/capabilities', { modality_laser: true });
    assert.strictEqual(res.status, 200, `expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.strictEqual(res.body.data.capabilities.modality_laser, true);

    const clinics = await api.db.all(`SELECT * FROM clinics`);
    assert.strictEqual(clinics.length, 1, 'a clinic should have been created');
  } finally { await api.close(); }
});

test('a snapshot works with no clinics row', async () => {
  const api = await boot({ seedClinic: false, seedCapabilities: false });
  try {
    const res = await api.call('GET', '/patients/100/snapshot');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.clinic.configured, false);
  } finally { await api.close(); }
});

test('the capability set covers every engine enablement gate', async () => {
  // If the engine gains a modality and the capability map is not updated, that
  // therapy becomes permanently unavailable to every clinic with no error.
  const contract = require(path.join(V2_ROOT, 'contracts', 'k9-engine-input-contract.json'));
  assert.strictEqual(clinicStore.assertCoversEngineGates(contract), true);
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
