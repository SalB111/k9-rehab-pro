/**
 * K9 Clinical Workflow V2 — in-clinic session tests
 *
 * The third stream: the veterinarian prescribes, the CCRT/CCRP delivers in
 * practice and records how the patient did, the veterinarian reviews, and a
 * concern becomes a recheck request rather than a line of free text.
 *
 * Run:  node tests/session-store.test.js
 */

'use strict';

const assert = require('assert');
const path = require('path');

const V2_ROOT = process.env.V2_ROOT || path.join(__dirname, '..');

const schema = require(path.join(V2_ROOT, 'schema'));
const store = require(path.join(V2_ROOT, 'protocol-store'));
const { approveWithGates } = require('./approve-helper');
const visits = require(path.join(V2_ROOT, 'visit-store'));
const sessions = require(path.join(V2_ROOT, 'session-store'));
const authority = require(path.join(V2_ROOT, 'authority'));
const adapter = require(path.join(V2_ROOT, 'engine-adapter'));
const clinicStore = require(path.join(V2_ROOT, 'clinic-store'));
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
const CCRT = { id: 2, username: 'jane.ccrt', role: 'rehab_practitioner' };
const TECH = { id: 3, username: 'tech.sam', role: 'technician' };

const PATIENT = {
  id: 100, name: 'Rex', client_name: 'David Chen',
  condition: 'TPLO', affected_region: 'Stifle', treatment_approach: 'Surgical',
};

async function freshDb() {
  const db = wrap(new sqlite3.Database(':memory:'));
  // Production enables this (sqlite-provider.js). Without it a foreign-key
  // violation passes in tests and fails live — which is exactly how an
  // owner-reported red flag reached production broken.
  await db.run(`PRAGMA foreign_keys = ON`);
  await db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT)`);
  await db.run(`CREATE TABLE clinics (id INTEGER PRIMARY KEY, clinic_name TEXT)`);
  await db.run(`CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT)`);
  await db.run(`INSERT INTO clinics (id, clinic_name) VALUES (1, 'Test')`);
  await db.run(`INSERT INTO patients (id, name) VALUES (100, 'Rex')`);
  for (const u of [VET, CCRT, TECH]) {
    await db.run(`INSERT INTO users (id, username, role) VALUES (?, ?, ?)`, [u.id, u.username, u.role]);
  }
  await schema.applyAll(db, { logger: { log() {}, warn() {} } });

  // A CCRT approves only on a current credential.
  await authority.addCredential(db, {
    userId: CCRT.id, credential: 'CCRP', validUntil: '2030-01-01', verifiedBy: VET.id,
  });
  // An equipped clinic, so clinic-venue exercises exist to deliver.
  await clinicStore.setCapabilities(db, {
    clinicId: 1,
    capabilities: Object.fromEntries(clinicStore.CAPABILITY_KEYS.map((k) => [k, true])),
    actor: VET,
  });
  return db;
}

/** An approved protocol with clinic-venue work in it. */
async function approvedVersion(db) {
  const protocol = await store.createProtocol(db, { patientId: 100, patientName: 'Rex', actor: VET });
  const visit = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: CCRT });
  await visits.recordAssessment(db, {
    visitId: visit.id, actor: CCRT,
    assessment: { pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB', treatment_approach: 'Surgical' },
  });
  const loaded = await visits.getVisit(db, visit.id);
  const state = visits.toV2State(db, {
    patient: PATIENT, visit: loaded,
    clinic: clinicStore.toClinicState(await clinicStore.getCapabilities(db, 1)),
    protocolParams: { length_weeks: 4, frequency: '2x/week' },
  });
  const engineInput = adapter.toEngineFormData(state);
  const engineResult = adapter.runEngine(engineInput, engine, ALL_EXERCISES);
  const version = await store.createVersion(db, {
    protocolId: protocol.id, engineInput, engineResult, actor: CCRT,
  });
  await store.setStatus(db, version.id, 'REVIEW', VET);
  await approveWithGates(store, db, { versionId: version.id, actor: VET });
  return store.getVersion(db, version.id);
}

// ===========================================================================
section('C1 — a session delivers an approved protocol, never a draft');
// ===========================================================================

test('starting a session loads the prescribed in-clinic work', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });

  assert.strictEqual(session.status, 'IN_PROGRESS');
  assert.strictEqual(session.session_number, 1);
  assert.ok(session.exercises.length > 0, 'no in-clinic work loaded');
  // Only clinic-venue exercises belong in a practice session; home work is the
  // owner's program.
  for (const ex of session.exercises) {
    assert.ok(ex.prescribed_sets || ex.prescribed_reps || ex.prescribed_duration,
      `${ex.exercise_code} loaded with no prescribed dosage`);
  }
});

test('a session cannot deliver an unapproved protocol', async () => {
  const db = await freshDb();
  const protocol = await store.createProtocol(db, { patientId: 100, patientName: 'Rex', actor: VET });
  const visit = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: CCRT });
  await visits.recordAssessment(db, { visitId: visit.id, assessment: { pain_score: 3 }, actor: CCRT });
  const loaded = await visits.getVisit(db, visit.id);
  const input = adapter.toEngineFormData(visits.toV2State(db, {
    patient: PATIENT, visit: loaded, clinic: {}, protocolParams: { length_weeks: 4 },
  }));
  const result = adapter.runEngine(input, engine, ALL_EXERCISES);
  const draft = await store.createVersion(db, {
    protocolId: protocol.id, engineInput: input, engineResult: result, actor: CCRT,
  });

  // Treatment is delivered from an authorisation.
  await assert.rejects(
    () => sessions.startSession(db, {
      patientId: 100, versionId: draft.id, sessionDate: '2026-09-02', actor: CCRT,
    }),
    (err) => err.code === store.ERR.NOT_APPROVED
  );
});

// ===========================================================================
section('C2 — delivered is recorded separately from prescribed');
// ===========================================================================

test('a deviation keeps the prescribed dosage intact beside it', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });
  const target = session.exercises[0];
  const prescribedSets = target.prescribed_sets;

  const after = await sessions.recordDelivery(db, {
    sessionId: session.id, exerciseRowId: target.id, actor: CCRT,
    delivery: {
      completed: false, performed_sets: '1',
      deviation_reason: 'Patient guarded after two repetitions; stopped early.',
      assistance_level: 'MODERATE',
    },
  });

  const row = after.exercises.find((e) => e.id === target.id);
  assert.strictEqual(row.performed_sets, '1');
  // The prescription is untouched — a practitioner delivered less of it, they
  // did not change it.
  assert.strictEqual(row.prescribed_sets, prescribedSets);
  assert.strictEqual(row.completed, 0);
  assert.match(row.deviation_reason, /guarded/);
});

test('an incomplete delivery without a reason is refused', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });

  // "Why not" is the clinically interesting part; a bare shortfall cannot be
  // interpreted at review.
  await assert.rejects(
    () => sessions.recordDelivery(db, {
      sessionId: session.id, exerciseRowId: session.exercises[0].id, actor: CCRT,
      delivery: { completed: false, performed_sets: '1' },
    }),
    (err) => err.code === store.ERR.INVALID
  );
});

test('an unknown assistance level is refused', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });
  await assert.rejects(
    () => sessions.recordDelivery(db, {
      sessionId: session.id, exerciseRowId: session.exercises[0].id, actor: CCRT,
      delivery: { completed: true, assistance_level: 'a bit of help' },
    }),
    (err) => err.code === store.ERR.INVALID
  );
});

// ===========================================================================
section('C3 — a completed session is a record, not a document');
// ===========================================================================

test('a completed session cannot be edited', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });
  await sessions.recordSessionMeasures(db, {
    sessionId: session.id, actor: CCRT,
    measures: { pre_session_pain: 3, post_session_pain: 2, tolerance: 'WELL' },
  });
  await sessions.completeSession(db, { sessionId: session.id, actor: CCRT });

  await assert.rejects(
    () => sessions.recordSessionMeasures(db, {
      sessionId: session.id, measures: { post_session_pain: 1 }, actor: CCRT,
    }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
  await assert.rejects(
    () => sessions.recordDelivery(db, {
      sessionId: session.id, exerciseRowId: session.exercises[0].id, actor: CCRT,
      delivery: { completed: true },
    }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
});

test('an invalid tolerance is refused', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });
  await assert.rejects(
    () => sessions.recordSessionMeasures(db, {
      sessionId: session.id, measures: { tolerance: 'ok-ish' }, actor: CCRT,
    }),
    (err) => err.code === store.ERR.INVALID
  );
});

// ===========================================================================
section('Veterinary review');
// ===========================================================================

test('a completed session is unreviewed until a clinician reads it', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });
  await sessions.completeSession(db, { sessionId: session.id, actor: CCRT });

  let pending = await sessions.listUnreviewedSessions(db, 100);
  assert.strictEqual(pending.length, 1);

  const reviewed = await sessions.reviewSession(db, {
    sessionId: session.id, actor: VET, note: 'Progressing well, continue.',
  });
  assert.strictEqual(reviewed.reviewed_by_username, 'dr.zaslow');
  assert.ok(reviewed.reviewed_at);

  pending = await sessions.listUnreviewedSessions(db, 100);
  assert.strictEqual(pending.length, 0);
});

test('a technician cannot sign off a session', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });
  await sessions.completeSession(db, { sessionId: session.id, actor: CCRT });

  await assert.rejects(
    () => sessions.reviewSession(db, { sessionId: session.id, actor: TECH }),
    (err) => err.code === store.ERR.FORBIDDEN
  );
});

// ===========================================================================
section('C4 — a concern is a state, not a note');
// ===========================================================================

test('the CCRT raises a recheck and the vet answers it', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });

  const recheck = await sessions.requestRecheck(db, {
    patientId: 100, sessionId: session.id, versionId: version.id,
    urgency: 'SOON', reason: 'Pain increased from 3 to 6 across two sessions',
    findings: 'Reluctant to load the operated limb; new intermittent lameness at walk.',
    actor: CCRT,
  });
  assert.strictEqual(recheck.status, 'OPEN');
  assert.strictEqual(recheck.raised_by_username, 'jane.ccrt');

  const open = await sessions.listOpenRechecks(db, 100);
  assert.strictEqual(open.length, 1);

  const answered = await sessions.respondToRecheck(db, {
    recheckId: recheck.id, status: 'SCHEDULED',
    response: 'Booked for Thursday. Hold loading exercises until seen.', actor: VET,
  });
  assert.strictEqual(answered.status, 'SCHEDULED');
  assert.strictEqual(answered.acknowledged_by_username, 'dr.zaslow');
});

test('a technician cannot answer a recheck request', async () => {
  const db = await freshDb();
  const recheck = await sessions.requestRecheck(db, {
    patientId: 100, urgency: 'ROUTINE', reason: 'Plateau in ROM', actor: CCRT,
  });
  // A concern must not be closed by someone without clinical authority.
  await assert.rejects(
    () => sessions.respondToRecheck(db, { recheckId: recheck.id, status: 'RESOLVED', actor: TECH }),
    (err) => err.code === store.ERR.FORBIDDEN
  );
});

test('declining a concern requires a reason', async () => {
  const db = await freshDb();
  const recheck = await sessions.requestRecheck(db, {
    patientId: 100, urgency: 'ROUTINE', reason: 'Owner reports stiffness', actor: CCRT,
  });
  await assert.rejects(
    () => sessions.respondToRecheck(db, { recheckId: recheck.id, status: 'DECLINED', actor: VET }),
    (err) => err.code === store.ERR.INVALID
  );
});

test('only the practitioner who raised a concern may withdraw it', async () => {
  const db = await freshDb();
  const recheck = await sessions.requestRecheck(db, {
    patientId: 100, urgency: 'ROUTINE', reason: 'Possible discomfort', actor: CCRT,
  });

  await assert.rejects(
    () => sessions.withdrawRecheck(db, { recheckId: recheck.id, actor: TECH }),
    (err) => err.code === store.ERR.FORBIDDEN
  );

  const withdrawn = await sessions.withdrawRecheck(db, {
    recheckId: recheck.id, actor: CCRT, reason: 'Resolved on its own by the next session',
  });
  assert.strictEqual(withdrawn.status, 'WITHDRAWN');
});

test('a concern already answered cannot be quietly withdrawn', async () => {
  const db = await freshDb();
  const recheck = await sessions.requestRecheck(db, {
    patientId: 100, urgency: 'URGENT', reason: 'Acute non-weight-bearing lameness', actor: CCRT,
  });
  await sessions.respondToRecheck(db, {
    recheckId: recheck.id, status: 'ACKNOWLEDGED', response: 'Seeing today', actor: VET,
  });

  await assert.rejects(
    () => sessions.withdrawRecheck(db, { recheckId: recheck.id, actor: CCRT }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
});

test('urgent concerns sort ahead of routine ones', async () => {
  const db = await freshDb();
  await sessions.requestRecheck(db, { patientId: 100, urgency: 'ROUTINE', reason: 'ROM plateau', actor: CCRT });
  await sessions.requestRecheck(db, { patientId: 100, urgency: 'URGENT', reason: 'Non-weight-bearing', actor: CCRT });
  await sessions.requestRecheck(db, { patientId: 100, urgency: 'SOON', reason: 'Rising pain', actor: CCRT });

  const open = await sessions.listOpenRechecks(db, 100);
  assert.deepStrictEqual(open.map((r) => r.urgency), ['URGENT', 'SOON', 'ROUTINE']);
});

// ===========================================================================
section('The vet is made aware without opening the chart');
// ===========================================================================

test('open concerns and unread sessions surface on the patient snapshot', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);
  const session = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });
  await sessions.completeSession(db, { sessionId: session.id, actor: CCRT });
  await sessions.requestRecheck(db, {
    patientId: 100, sessionId: session.id, urgency: 'URGENT',
    reason: 'Pain up sharply after loading work', actor: CCRT,
  });

  const snapshot = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(snapshot.unreviewed_session_count, 1);
  assert.strictEqual(snapshot.open_recheck_requests.length, 1);
  assert.strictEqual(snapshot.open_recheck_requests[0].urgency, 'URGENT');
  assert.strictEqual(snapshot.open_recheck_requests[0].raised_by, 'jane.ccrt');
});

test('an answered concern stops showing as outstanding', async () => {
  const db = await freshDb();
  const recheck = await sessions.requestRecheck(db, {
    patientId: 100, urgency: 'SOON', reason: 'Rising pain', actor: CCRT,
  });
  await sessions.respondToRecheck(db, {
    recheckId: recheck.id, status: 'RESOLVED', response: 'Reviewed, no change needed', actor: VET,
  });

  const snapshot = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(snapshot.open_recheck_requests.length, 0);
});

// ===========================================================================
section('A week in the clinic');
// ===========================================================================

test('vet prescribes, CCRT delivers twice, concern raised, vet responds', async () => {
  const db = await freshDb();
  const version = await approvedVersion(db);

  // ── Session 1: goes well ────────────────────────────────────────────────
  const s1 = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-02', actor: CCRT,
  });
  for (const ex of s1.exercises) {
    await sessions.recordDelivery(db, {
      sessionId: s1.id, exerciseRowId: ex.id, actor: CCRT,
      delivery: { completed: true, performed_sets: ex.prescribed_sets, assistance_level: 'MINIMAL' },
    });
  }
  await sessions.recordSessionMeasures(db, {
    sessionId: s1.id, actor: CCRT,
    measures: { pre_session_pain: 3, post_session_pain: 2, tolerance: 'WELL' },
  });
  await sessions.completeSession(db, { sessionId: s1.id, actor: CCRT });

  // ── Session 2: the patient is worse ─────────────────────────────────────
  const s2 = await sessions.startSession(db, {
    patientId: 100, versionId: version.id, sessionDate: '2026-09-05', actor: CCRT,
  });
  await sessions.recordDelivery(db, {
    sessionId: s2.id, exerciseRowId: s2.exercises[0].id, actor: CCRT,
    delivery: {
      completed: false, performed_sets: '1',
      deviation_reason: 'Stopped early — guarding and reluctance to load',
      assistance_level: 'MAXIMAL', observed_compensations: 'Weight shifted off the operated limb',
    },
  });
  await sessions.recordSessionMeasures(db, {
    sessionId: s2.id, actor: CCRT,
    measures: { pre_session_pain: 5, post_session_pain: 7, tolerance: 'POORLY',
                session_notes: 'Marked deterioration since Tuesday.' },
  });
  await sessions.completeSession(db, { sessionId: s2.id, actor: CCRT });

  const recheck = await sessions.requestRecheck(db, {
    patientId: 100, sessionId: s2.id, versionId: version.id, urgency: 'URGENT',
    reason: 'Pain rose 5 to 7 within a session; tolerated poorly',
    findings: 'Guarding, maximal assistance required, weight shifted off the operated limb',
    actor: CCRT,
  });
  assert.strictEqual(s2.session_number, 2);

  // ── What the vet sees before opening anything ───────────────────────────
  const snapshot = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(snapshot.unreviewed_session_count, 2);
  assert.strictEqual(snapshot.open_recheck_requests[0].urgency, 'URGENT');

  // ── Vet reviews and responds ────────────────────────────────────────────
  await sessions.reviewSession(db, { sessionId: s2.id, actor: VET, note: 'Agreed, seeing today.' });
  await sessions.respondToRecheck(db, {
    recheckId: recheck.id, status: 'SCHEDULED',
    response: 'Examining today. Hold all loading work until seen.', actor: VET,
  });

  const after = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  // Booking a recheck does not close the concern. The patient has not been seen
  // yet, so it stays outstanding — it clears when the veterinarian resolves it.
  assert.strictEqual(after.open_recheck_requests.length, 1);
  assert.strictEqual(after.open_recheck_requests[0].status, 'SCHEDULED');
  assert.strictEqual(after.unreviewed_session_count, 1, 'session 1 is still unread');

  await sessions.respondToRecheck(db, {
    recheckId: recheck.id, status: 'RESOLVED',
    response: 'Examined. Implant stable; regressed to phase 1 loading.', actor: VET,
  });
  const closed = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(closed.open_recheck_requests.length, 0);

  // ── The whole week is auditable ─────────────────────────────────────────
  const trail = await db.all(
    `SELECT action FROM protocol_audit_events WHERE patient_id = 100 ORDER BY id`);
  const actions = trail.map((e) => e.action);
  for (const expected of [
    sessions.SESSION_AUDIT.SESSION_STARTED, sessions.SESSION_AUDIT.EXERCISE_DELIVERED,
    sessions.SESSION_AUDIT.SESSION_COMPLETED, sessions.SESSION_AUDIT.RECHECK_REQUESTED,
    sessions.SESSION_AUDIT.SESSION_REVIEWED, sessions.SESSION_AUDIT.RECHECK_ANSWERED,
  ]) {
    assert.ok(actions.includes(expected), `missing audit action ${expected}`);
  }
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
