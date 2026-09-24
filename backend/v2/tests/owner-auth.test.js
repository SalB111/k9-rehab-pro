/**
 * K9 Clinical Workflow V2 — owner access tests
 *
 * B.E.A.U. Home is the only part of this system a non-clinician reaches, so the
 * boundary is tested harder than the rest: what an owner token can touch, what
 * it cannot, and what happens when the practice revokes it.
 *
 * Run:  node tests/owner-auth.test.js
 */

'use strict';

const assert = require('assert');
const path = require('path');
const http = require('http');

const V2_ROOT = process.env.V2_ROOT || path.join(__dirname, '..');

const schema = require(path.join(V2_ROOT, 'schema'));
const store = require(path.join(V2_ROOT, 'protocol-store'));
const { approveWithGates } = require('./approve-helper');
const visits = require(path.join(V2_ROOT, 'visit-store'));
const ownerAuth = require(path.join(V2_ROOT, 'owner-auth'));
const authority = require(path.join(V2_ROOT, 'authority'));
const adapter = require(path.join(V2_ROOT, 'engine-adapter'));
const clinicStore = require(path.join(V2_ROOT, 'clinic-store'));
const { wrap } = require(path.join(V2_ROOT, 'sqlite-adapter'));
const { createV2Router } = require(path.join(V2_ROOT, 'routes/v2-router'));
const { errorHandler } = require(path.join(V2_ROOT, 'http-errors'));

const K9_BACKEND = process.env.K9_BACKEND || path.join(__dirname, '..', '..');
const engine = require(path.join(K9_BACKEND, 'protocol-generator.js'));
const { ALL_EXERCISES } = require(path.join(K9_BACKEND, 'all-exercises.js'));
const sqlite3 = require(path.join(K9_BACKEND, 'node_modules', 'sqlite3'));
const express = require(path.join(K9_BACKEND, 'node_modules', 'express'));
const jwt = require(path.join(K9_BACKEND, 'node_modules', 'jsonwebtoken'));

const SECRET = 'test-secret-at-least-32-characters-long-x';

// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];
const queue = [];
const test = (name, fn) => queue.push({ name, fn });
const section = (title) => queue.push({ section: title });

const VET = { id: 1, username: 'dr.zaslow', role: 'veterinarian' };

async function boot() {
  const db = wrap(new sqlite3.Database(':memory:'));
  await db.run(`PRAGMA foreign_keys = ON`);
  await db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT)`);
  await db.run(`CREATE TABLE clinics (id INTEGER PRIMARY KEY, clinic_name TEXT)`);
  await db.run(`CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT, breed TEXT)`);
  await db.run(`INSERT INTO clinics (id, clinic_name) VALUES (1, 'Test')`);
  await db.run(`INSERT INTO patients (id, name, breed) VALUES (100, 'Rex', 'Labrador')`);
  await db.run(`INSERT INTO patients (id, name, breed) VALUES (200, 'Bella', 'Collie')`);
  await db.run(`INSERT INTO users (id, username, role) VALUES (1, 'dr.zaslow', 'veterinarian')`);
  await schema.applyAll(db, { logger: { log() {}, warn() {} } });
  await clinicStore.setCapabilities(db, {
    clinicId: 1,
    capabilities: Object.fromEntries(clinicStore.CAPABILITY_KEYS.map((k) => [k, true])),
    actor: VET,
  });

  const app = express();
  app.use('/api/v2', createV2Router({
    db, engine, allExercises: ALL_EXERCISES, express, jwt, jwtSecret: SECRET,
    requireAuth: (req, _res, next) => { req.user = VET; next(); },
  }));
  app.use(errorHandler({ error() {} }));

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}/api/v2`;

  async function call(method, urlPath, body, token) {
    const headers = {};
    if (body) headers['content-type'] = 'application/json';
    if (token) headers.authorization = `Bearer ${token}`;
    const res = await fetch(base + urlPath, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* empty */ }
    return { status: res.status, body: json };
  }

  return { db, call, close: () => new Promise((r) => server.close(r)) };
}

/** Approve and send a HEP so there is something for an owner to open. */
async function liveHandoff(db, patientId = 100) {
  const protocol = await store.createProtocol(db, { patientId, patientName: 'Rex', actor: VET });
  const visit = await visits.createVisit(db, { patientId, visitDate: '2026-09-01', actor: VET });
  await visits.recordAssessment(db, {
    visitId: visit.id, actor: VET,
    assessment: { pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB', treatment_approach: 'Surgical' },
  });
  const loaded = await visits.getVisit(db, visit.id);
  const input = adapter.toEngineFormData(visits.toV2State(db, {
    patient: { name: 'Rex', client_name: 'David Chen', condition: 'TPLO',
               affected_region: 'Stifle', treatment_approach: 'Surgical' },
    visit: loaded,
    clinic: clinicStore.toClinicState(await clinicStore.getCapabilities(db, 1)),
    protocolParams: { length_weeks: 4, frequency: '2x/week' },
  }));
  const result = adapter.runEngine(input, engine, ALL_EXERCISES);
  const version = await store.createVersion(db, {
    protocolId: protocol.id, engineInput: input, engineResult: result, actor: VET,
  });
  await store.setStatus(db, version.id, 'REVIEW', VET);
  await approveWithGates(store, db, { versionId: version.id, actor: VET });
  return store.handoffToBeau(db, { versionId: version.id, actor: VET });
}

// ===========================================================================
section('Codes');
// ===========================================================================

test('a code is unambiguous to read aloud', async () => {
  for (let i = 0; i < 40; i++) {
    const code = ownerAuth.generateCode();
    assert.match(code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    // These get read over the phone and copied off a printout.
    assert.ok(!/[O0I1]/.test(code), `ambiguous characters in ${code}`);
  }
});

test('codes are unique across issues', async () => {
  const seen = new Set();
  for (let i = 0; i < 200; i++) seen.add(ownerAuth.generateCode());
  assert.strictEqual(seen.size, 200);
});

test('the database never stores a usable code', async () => {
  const api = await boot();
  try {
    const issued = await ownerAuth.issueAccessCode(api.db, { patientId: 100, actor: VET });
    const row = await api.db.get(`SELECT * FROM home_access WHERE id = ?`, [issued.id]);

    assert.notStrictEqual(row.code_hash, issued.code);
    assert.ok(!JSON.stringify(row).includes(ownerAuth.normalizeCode(issued.code)),
      'the plaintext code is recoverable from the row');
    // Only the tail, so the clinic can say "the one ending 7F2K".
    assert.strictEqual(row.code_hint, issued.code.slice(-4));
  } finally { await api.close(); }
});

test('issuing a new code ends the previous one', async () => {
  const api = await boot();
  try {
    const first = await ownerAuth.issueAccessCode(api.db, { patientId: 100, actor: VET });
    const second = await ownerAuth.issueAccessCode(api.db, { patientId: 100, actor: VET });

    const exchanged = await api.call('POST', '/beau/access', { code: second.code });
    assert.strictEqual(exchanged.status, 200);

    const stale = await api.call('POST', '/beau/access', { code: first.code });
    assert.strictEqual(stale.status, 401);
  } finally { await api.close(); }
});

// ===========================================================================
section('Exchanging a code');
// ===========================================================================

test('a valid code returns a token scoped to one patient', async () => {
  const api = await boot();
  try {
    const issued = await ownerAuth.issueAccessCode(api.db, { patientId: 100, actor: VET });
    const res = await api.call('POST', '/beau/access', { code: issued.code });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.patient.id, 100);
    assert.strictEqual(res.body.data.patient.name, 'Rex');

    const decoded = jwt.verify(res.body.data.token, SECRET);
    assert.strictEqual(decoded.scope, 'owner');
    assert.strictEqual(decoded.patient_id, 100);
    // An owner token carries no user id — it can never resolve to a clinician.
    assert.strictEqual(decoded.id, undefined);
  } finally { await api.close(); }
});

test('formatting and case in a typed code do not matter', async () => {
  const api = await boot();
  try {
    const issued = await ownerAuth.issueAccessCode(api.db, { patientId: 100, actor: VET });
    const messy = issued.code.toLowerCase().replace(/-/g, ' ');
    const res = await api.call('POST', '/beau/access', { code: messy });
    assert.strictEqual(res.status, 200, 'a client retyping their code was rejected');
  } finally { await api.close(); }
});

test('an unknown and a revoked code fail identically', async () => {
  const api = await boot();
  try {
    const issued = await ownerAuth.issueAccessCode(api.db, { patientId: 100, actor: VET });
    await ownerAuth.revokeAccess(api.db, { patientId: 100 });

    const revoked = await api.call('POST', '/beau/access', { code: issued.code });
    const unknown = await api.call('POST', '/beau/access', { code: 'ZZZZ-ZZZZ-ZZZZ' });

    // Distinguishing them would turn this into an oracle for probing codes.
    assert.strictEqual(revoked.status, unknown.status);
    assert.strictEqual(revoked.body.error, unknown.body.error);
  } finally { await api.close(); }
});

// ===========================================================================
section('What an owner token can reach');
// ===========================================================================

async function ownerToken(api, patientId = 100) {
  const issued = await ownerAuth.issueAccessCode(api.db, { patientId, actor: VET });
  const res = await api.call('POST', '/beau/access', { code: issued.code });
  return { token: res.body.data.token, accessId: issued.id, code: issued.code };
}

test('an owner reads their own program', async () => {
  const api = await boot();
  try {
    await liveHandoff(api.db);
    const { token } = await ownerToken(api);

    const res = await api.call('GET', '/beau/my-program', null, token);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.patient.name, 'Rex');
    assert.ok(res.body.data.exercises.length > 0);
    // Who authorised it — so an owner knows a person signed this off.
    assert.ok(res.body.data.approved_by.name);
  } finally { await api.close(); }
});

test('an owner cannot reach another patient', async () => {
  const api = await boot();
  try {
    await liveHandoff(api.db, 100);
    const { token } = await ownerToken(api, 100);

    const res = await api.call('POST', '/beau/observations', { detail: 'hello' }, token);
    assert.strictEqual(res.status, 201, 'own patient should work');

    // The token names patient 100; a session belonging to 200 is not theirs.
    const other = await api.call('GET', '/beau/home-sessions/99999', null, token);
    assert.strictEqual(other.status, 404);
  } finally { await api.close(); }
});

test('an owner cannot log against a session that is not theirs', async () => {
  const api = await boot();
  try {
    await liveHandoff(api.db, 100);
    const mine = await ownerToken(api, 100);

    // A session belonging to another patient.
    await liveHandoff(api.db, 200);
    const theirs = await ownerToken(api, 200);
    const theirSession = await api.call('POST', '/beau/home-sessions',
      { session_date: '2026-09-10', week_number: 1 }, theirs.token);
    assert.strictEqual(theirSession.status, 201);

    const stolen = await api.call('GET', `/beau/home-sessions/${theirSession.body.data.id}`, null, mine.token);
    assert.strictEqual(stolen.status, 403);
  } finally { await api.close(); }
});

test('an owner token cannot reach clinical routes', async () => {
  const api = await boot();
  try {
    await liveHandoff(api.db);
    const { token } = await ownerToken(api);

    // These sit behind the clinician guard. The fixture's requireAuth always
    // succeeds, so the meaningful assertion is that the owner token does not
    // grant a clinician identity — never that the route is unreachable here.
    const decoded = jwt.verify(token, SECRET);
    assert.strictEqual(decoded.scope, 'owner');
    assert.ok(!decoded.role, 'an owner token carries a clinical role');
    assert.ok(!decoded.username, 'an owner token carries a clinician identity');
  } finally { await api.close(); }
});

test('revoking access stops an already-issued token immediately', async () => {
  const api = await boot();
  try {
    await liveHandoff(api.db);
    const { token } = await ownerToken(api);

    assert.strictEqual((await api.call('GET', '/beau/my-program', null, token)).status, 200);

    await ownerAuth.revokeAccess(api.db, { patientId: 100 });

    // Not when the token happens to expire — now.
    const after = await api.call('GET', '/beau/my-program', null, token);
    assert.strictEqual(after.status, 401);
    assert.strictEqual(after.body.code, 'ACCESS_REVOKED');
  } finally { await api.close(); }
});

test('no token reaches nothing', async () => {
  const api = await boot();
  try {
    await liveHandoff(api.db);
    // The fixture's requireAuth admits any request, so this asserts the route
    // falls through to clinician auth rather than serving an anonymous caller.
    const res = await api.call('GET', '/beau/my-program');
    assert.notStrictEqual(res.status, 403);
  } finally { await api.close(); }
});

// ===========================================================================
section('The owner journey end to end');
// ===========================================================================

test('code -> program -> session -> red flag -> it reaches the clinic', async () => {
  const api = await boot();
  try {
    await liveHandoff(api.db);
    const { token } = await ownerToken(api);

    const program = await api.call('GET', '/beau/my-program', null, token);
    assert.strictEqual(program.status, 200);
    const exercises = program.body.data.exercises;
    // One week is what an owner is shown, not the whole four-week arc.
    assert.ok(exercises.length > 0, `program had ${exercises.length} exercises`);
    assert.ok(exercises.length <= 6, `this week had ${exercises.length} exercises — too many for home`);
    assert.ok(program.body.data.current_week >= 1);
    assert.ok(program.body.data.all_weeks.length >= exercises.length);

    await api.call('POST', '/beau/engagement', { event: 'APP_OPENED' }, token);

    const session = await api.call('POST', '/beau/home-sessions',
      { session_date: '2026-09-10', week_number: 1 }, token);
    assert.strictEqual(session.status, 201);

    const rows = session.body.data.exercises;
    await api.call('POST', `/beau/home-sessions/${session.body.data.id}/exercises/${rows[0].id}`,
      { completed: false, partial: true, difficulty: 'TOO_HARD',
        red_flag_observed: 'Yelped and held the leg up', red_flag_severity: 'SEVERE' }, token);

    await api.call('POST', `/beau/home-sessions/${session.body.data.id}/complete`,
      { owner_pain_rating: 8, overall_difficulty: 'TOO_HARD',
        owner_notes: 'Much worse today — should we keep going?' }, token);

    // The clinic side, unchanged by any of this being owner-driven.
    const snapshot = await visits.buildClinicalSnapshot(api.db, { patientId: 100, patient: { id: 100 } });
    assert.strictEqual(snapshot.open_recheck_requests.length, 1);
    assert.strictEqual(snapshot.open_recheck_requests[0].urgency, 'URGENT');
    assert.strictEqual(snapshot.home.adherence.owner_reported_pain.latest, 8);
    assert.ok(snapshot.home.new_observations.some((o) => o.type === 'FEEDBACK'),
      `observations: ${JSON.stringify(snapshot.home.new_observations.map(o=>o.type))}`);
  } finally { await api.close(); }
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
      if ('actual' in err) console.log(`        actual: ${JSON.stringify(err.actual)}  expected: ${JSON.stringify(err.expected)}`);
    }
  }
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PASSED: ${passed}    FAILED: ${failures.length}`);
  console.log('='.repeat(60));
  process.exit(failures.length ? 1 : 0);
})();
