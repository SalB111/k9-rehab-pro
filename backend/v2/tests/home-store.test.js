/**
 * K9 Clinical Workflow V2 — client feedback loop tests
 *
 * The return path: the owner performs the approved HEP, answers a few short
 * questions, optionally submits a requested video, and it lands on the chart
 * for a clinician to read.
 *
 * Run:  node tests/home-store.test.js
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
const home = require(path.join(V2_ROOT, 'home-store'));
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
  await authority.addCredential(db, { userId: CCRT.id, credential: 'CCRP', validUntil: '2030-01-01' });
  await clinicStore.setCapabilities(db, {
    clinicId: 1,
    capabilities: Object.fromEntries(clinicStore.CAPABILITY_KEYS.map((k) => [k, true])),
    actor: VET,
  });
  return db;
}

/** An approved, handed-off protocol — the owner has a live HEP. */
async function liveHandoff(db) {
  const protocol = await store.createProtocol(db, { patientId: 100, patientName: 'Rex', actor: VET });
  const visit = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-01', actor: CCRT });
  await visits.recordAssessment(db, {
    visitId: visit.id, actor: CCRT,
    assessment: { pain_score: 3, lameness_grade: 2, weight_bearing_status: 'PWB', treatment_approach: 'Surgical' },
  });
  const loaded = await visits.getVisit(db, visit.id);
  const input = adapter.toEngineFormData(visits.toV2State(db, {
    patient: PATIENT, visit: loaded,
    clinic: clinicStore.toClinicState(await clinicStore.getCapabilities(db, 1)),
    protocolParams: { length_weeks: 4, frequency: '2x/week' },
  }));
  const result = adapter.runEngine(input, engine, ALL_EXERCISES);
  const version = await store.createVersion(db, {
    protocolId: protocol.id, engineInput: input, engineResult: result, actor: CCRT,
  });
  await store.setStatus(db, version.id, 'REVIEW', VET);
  await approveWithGates(store, db, { versionId: version.id, actor: VET });
  const handoff = await store.handoffToBeau(db, { versionId: version.id, actor: VET });
  return { version, handoff };
}

// ===========================================================================
section('H1 — home sessions run against the live prescription');
// ===========================================================================

test('a home session loads the approved home exercises', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10', weekNumber: 1 });

  assert.strictEqual(session.status, 'STARTED');
  assert.ok(session.exercises.length > 0, 'no exercises loaded');
  assert.ok(session.exercises.length <= 6, 'more than a realistic home program was loaded');
});

test('no home session without an approved program', async () => {
  const db = await freshDb();
  // Nothing has been approved or sent — there is nothing to perform.
  await assert.rejects(
    () => home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10' }),
    (err) => err.code === store.ERR.NOT_APPROVED
  );
});

test('the owner never receives clinic-delivered work', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10', weekNumber: 1 });

  const FORBIDDEN = ['LASER', 'NMES', 'SHOCKWAVE', 'UWTM', 'TREADMILL', 'ULTRASOUND'];
  const leaked = session.exercises.filter((e) =>
    FORBIDDEN.some((t) => String(e.exercise_code).toUpperCase().includes(t)));
  assert.deepStrictEqual(leaked.map((e) => e.exercise_code), []);
});

// ===========================================================================
section('H2 — owner-reported stays owner-reported');
// ===========================================================================

test('an owner pain rating never enters the clinical measurement trend', async () => {
  const db = await freshDb();
  await liveHandoff(db);

  // A clinician-measured value on the record.
  const visit = await visits.createVisit(db, { patientId: 100, visitDate: '2026-09-09', actor: CCRT });
  await visits.recordMeasurement(db, {
    visitId: visit.id, actor: CCRT,
    measurement: { measure_key: 'ROM_FLEXION', site: 'STIFLE', side: 'LEFT', value_numeric: 100, unit: 'degrees' },
  });

  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10' });
  await home.completeHomeSession(db, {
    sessionId: session.id, summary: { owner_pain_rating: 8, overall_difficulty: 'HARD' },
  });

  // The owner's 8 must not appear as a clinical measurement.
  const measurements = await db.all(`SELECT * FROM visit_measurements WHERE patient_id = 100`);
  assert.strictEqual(measurements.length, 1, 'home data leaked into clinical measurements');
  assert.strictEqual(measurements[0].measure_key, 'ROM_FLEXION');

  const snapshot = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  // It is present, but in its own labelled branch.
  assert.strictEqual(snapshot.home.source, 'OWNER_REPORTED');
  assert.strictEqual(snapshot.home.adherence.owner_reported_pain.latest, 8);
  assert.strictEqual(snapshot.home.adherence.owner_reported_pain.source, 'OWNER_REPORTED');
  // And not in the clinical trends.
  assert.ok(!snapshot.measurement_trends.some((t) => t.measure_key === 'PAIN'));
});

// ===========================================================================
section('H3 — a reported red flag escalates, it does not queue');
// ===========================================================================

test('a red flag raises a recheck request automatically', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10', weekNumber: 1 });

  await home.logExercise(db, {
    sessionId: session.id, exerciseRowId: session.exercises[0].id,
    log: { completed: false, red_flag_observed: 'Cried out and would not put weight on the leg',
           red_flag_severity: 'SEVERE', skipped_reason: 'stopped immediately' },
  });

  // It lands in the same queue a CCRT concern does.
  const open = await sessions.listOpenRechecks(db, 100);
  assert.strictEqual(open.length, 1);
  assert.strictEqual(open[0].urgency, 'URGENT', 'a severe owner report was not urgent');
  assert.match(open[0].reason, /stop condition at home/);
  assert.match(open[0].raised_by_username, /owner/);
});

test('a moderate red flag is raised as SOON, not URGENT', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10', weekNumber: 1 });
  await home.logExercise(db, {
    sessionId: session.id, exerciseRowId: session.exercises[0].id,
    log: { completed: false, red_flag_observed: 'Some reluctance', red_flag_severity: 'MILD' },
  });
  const open = await sessions.listOpenRechecks(db, 100);
  assert.strictEqual(open[0].urgency, 'SOON');
});

test('the escalated concern is linked back to the observation', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10', weekNumber: 1 });
  await home.logExercise(db, {
    sessionId: session.id, exerciseRowId: session.exercises[0].id,
    log: { completed: false, red_flag_observed: 'Swelling after the session', red_flag_severity: 'MODERATE' },
  });

  const observations = await home.listNewObservations(db, 100);
  const redFlag = observations.find((o) => o.observation_type === 'RED_FLAG');
  assert.ok(redFlag.recheck_request_id, 'red flag was recorded without escalating');

  const flagged = await db.get(`SELECT red_flag_reported FROM home_sessions WHERE id = ?`, [session.id]);
  assert.strictEqual(flagged.red_flag_reported, 1);
});

// ===========================================================================
section('Adherence and engagement are separate signals');
// ===========================================================================

test('opening the app without starting is distinguishable from never opening', async () => {
  const db = await freshDb();
  await liveHandoff(db);

  let summary = await home.getEngagementSummary(db, 100);
  assert.strictEqual(summary.ever_opened, false);

  await home.recordEngagement(db, { patientId: 100, event: 'APP_OPENED' });
  await home.recordEngagement(db, { patientId: 100, event: 'HEP_VIEWED' });

  summary = await home.getEngagementSummary(db, 100);
  assert.strictEqual(summary.ever_opened, true);
  // Opened and looked, but never began — a different problem from never opening.
  const adherence = await home.getAdherenceSummary(db, 100);
  assert.strictEqual(adherence.session_count, 0);
});

test('a session where nothing was done is abandoned, not completed', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10', weekNumber: 1 });
  const done = await home.completeHomeSession(db, { sessionId: session.id, summary: {} });

  // Adherence must not count a session in which nothing happened.
  assert.strictEqual(done.status, 'ABANDONED');
  const adherence = await home.getAdherenceSummary(db, 100);
  assert.strictEqual(adherence.completed, 0);
  assert.strictEqual(adherence.abandoned, 1);
});

test('adherence reports the numbers and draws no conclusion', async () => {
  const db = await freshDb();
  await liveHandoff(db);

  for (const [date, doIt] of [['2026-09-10', true], ['2026-09-11', false], ['2026-09-12', true]]) {
    const s = await home.startHomeSession(db, { patientId: 100, sessionDate: date, weekNumber: 1 });
    if (doIt) {
      for (const ex of s.exercises) {
        await home.logExercise(db, {
          sessionId: s.id, exerciseRowId: ex.id, log: { completed: true, difficulty: 'JUST_RIGHT' },
        });
      }
    }
    await home.completeHomeSession(db, {
      sessionId: s.id, summary: { owner_pain_rating: doIt ? 3 : 5, overall_difficulty: doIt ? 'JUST_RIGHT' : 'TOO_HARD' },
    });
  }

  const adherence = await home.getAdherenceSummary(db, 100);
  assert.strictEqual(adherence.session_count, 3);
  assert.strictEqual(adherence.completed, 2);
  assert.strictEqual(adherence.abandoned, 1);
  assert.strictEqual(adherence.sessions_rated_too_hard, 1);
  assert.ok(adherence.exercise_completion_rate > 0 && adherence.exercise_completion_rate < 1);
});

// ===========================================================================
section('Video is requested, not always-on');
// ===========================================================================

test('a clinician requests a video of one specific exercise', async () => {
  const db = await freshDb();
  const { version } = await liveHandoff(db);
  const request = await home.requestVideo(db, {
    patientId: 100, versionId: version.id, exerciseCode: 'SIT_STAND',
    note: 'Please film one set — I want to see the hind limb loading.', actor: VET,
  });

  assert.strictEqual(request.status, 'REQUESTED');
  assert.strictEqual(request.exercise_code, 'SIT_STAND');
  assert.strictEqual(request.requested_by_username, 'dr.zaslow');
});

test('the owner submits against the request, and only once', async () => {
  const db = await freshDb();
  const { version } = await liveHandoff(db);
  const request = await home.requestVideo(db, {
    patientId: 100, versionId: version.id, exerciseCode: 'SIT_STAND', actor: VET,
  });

  const submitted = await home.submitVideo(db, {
    requestId: request.id, mediaRef: 'storage://clip-123', ownerNote: 'He seems stiff on the left.',
  });
  assert.strictEqual(submitted.status, 'SUBMITTED');
  assert.strictEqual(submitted.media_ref, 'storage://clip-123');

  await assert.rejects(
    () => home.submitVideo(db, { requestId: request.id, mediaRef: 'storage://clip-456' }),
    (err) => err.code === store.ERR.IMMUTABLE
  );
});

// ===========================================================================
section('H5 — a clinician reading it is what advances the record');
// ===========================================================================

test('home reports stay unreviewed until a clinician reads them', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10', weekNumber: 1 });
  await home.logExercise(db, {
    sessionId: session.id, exerciseRowId: session.exercises[0].id, log: { completed: true },
  });
  await home.completeHomeSession(db, {
    sessionId: session.id, summary: { owner_pain_rating: 3, owner_notes: 'He did well today.' },
  });

  let pending = await home.listUnreviewedHomeSessions(db, 100);
  assert.strictEqual(pending.length, 1);

  const reviewed = await home.reviewHomeSession(db, {
    sessionId: session.id, actor: VET, note: 'Good adherence, continue as prescribed.',
  });
  assert.strictEqual(reviewed.reviewed_by_username, 'dr.zaslow');

  pending = await home.listUnreviewedHomeSessions(db, 100);
  assert.strictEqual(pending.length, 0);

  // Reading the session marks the owner's message as seen too.
  const stillNew = await home.listNewObservations(db, 100);
  assert.strictEqual(stillNew.length, 0);
});

test('a technician cannot sign off home-reported data', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10' });
  await home.completeHomeSession(db, { sessionId: session.id, summary: {} });

  await assert.rejects(
    () => home.reviewHomeSession(db, { sessionId: session.id, actor: TECH }),
    (err) => err.code === store.ERR.FORBIDDEN
  );
});

test('home reporting is stamped as coming from B.E.A.U., not the clinic', async () => {
  const db = await freshDb();
  await liveHandoff(db);
  const session = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-10' });
  await home.completeHomeSession(db, { sessionId: session.id, summary: { owner_pain_rating: 4 } });

  const beauEvents = await db.all(
    `SELECT * FROM protocol_audit_events WHERE patient_id = 100 AND source_system = 'BEAU'`);
  assert.ok(beauEvents.length > 0, 'home reporting was not attributed to B.E.A.U.');
  assert.ok(beauEvents.every((e) => e.actor_role === 'owner'));
});

// ===========================================================================
section('A fortnight at home');
// ===========================================================================

test('owner works the program, struggles, reports, vet responds', async () => {
  const db = await freshDb();
  const { version } = await liveHandoff(db);

  await home.recordEngagement(db, { patientId: 100, event: 'APP_OPENED' });

  // ── Week 1: goes well ────────────────────────────────────────────────────
  for (const date of ['2026-09-10', '2026-09-12']) {
    const s = await home.startHomeSession(db, { patientId: 100, sessionDate: date, weekNumber: 1 });
    for (const ex of s.exercises) {
      await home.logExercise(db, {
        sessionId: s.id, exerciseRowId: ex.id, log: { completed: true, difficulty: 'JUST_RIGHT' },
      });
    }
    await home.completeHomeSession(db, {
      sessionId: s.id, summary: { owner_pain_rating: 3, overall_difficulty: 'JUST_RIGHT' },
    });
  }

  // ── Week 2: the dog struggles and the owner sees a stop condition ────────
  const bad = await home.startHomeSession(db, { patientId: 100, sessionDate: '2026-09-17', weekNumber: 1 });
  await home.logExercise(db, {
    sessionId: bad.id, exerciseRowId: bad.exercises[0].id,
    log: {
      completed: false, partial: true, difficulty: 'TOO_HARD',
      red_flag_observed: 'Yelped and held the leg up afterwards', red_flag_severity: 'SEVERE',
      owner_note: 'Stopped straight away.',
    },
  });
  await home.completeHomeSession(db, {
    sessionId: bad.id,
    summary: { owner_pain_rating: 8, overall_difficulty: 'TOO_HARD',
               owner_notes: 'He seems much worse today, should we keep going?' },
  });

  // ── What the clinician sees ──────────────────────────────────────────────
  const snapshot = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });

  assert.strictEqual(snapshot.home.adherence.session_count, 3);
  assert.strictEqual(snapshot.home.adherence.sessions_rated_too_hard, 1);
  assert.strictEqual(snapshot.home.adherence.red_flag_sessions, 1);
  assert.strictEqual(snapshot.home.engagement.ever_opened, true);
  assert.strictEqual(snapshot.home.unreviewed_session_count, 3);

  // The stop condition escalated into the clinical queue — the vet does not
  // have to open the chart to find out.
  assert.strictEqual(snapshot.open_recheck_requests.length, 1);
  assert.strictEqual(snapshot.open_recheck_requests[0].urgency, 'URGENT');

  // The owner's question is waiting, and their pain rating is labelled.
  assert.ok(snapshot.home.new_observations.some((o) => o.type === 'FEEDBACK'));
  assert.strictEqual(snapshot.home.adherence.owner_reported_pain.latest, 8);
  assert.strictEqual(snapshot.home.source, 'OWNER_REPORTED');

  // ── The vet responds ─────────────────────────────────────────────────────
  const openConcern = (await sessions.listOpenRechecks(db, 100))[0];
  await sessions.respondToRecheck(db, {
    recheckId: openConcern.id, status: 'SCHEDULED',
    response: 'Seeing him tomorrow. Stop the home program until then.', actor: VET,
  });
  await home.reviewHomeSession(db, { sessionId: bad.id, actor: VET, note: 'Reviewed, recalled.' });

  const after = await visits.buildClinicalSnapshot(db, { patientId: 100, patient: PATIENT });
  assert.strictEqual(after.home.unreviewed_session_count, 2, 'only the flagged session was read');

  // ── And the whole loop is attributable ───────────────────────────────────
  const trail = await db.all(`SELECT action, source_system FROM protocol_audit_events WHERE patient_id = 100`);
  assert.ok(trail.some((e) => e.action === home.HOME_AUDIT.RED_FLAG_ESCALATED && e.source_system === 'BEAU'));
  assert.ok(trail.some((e) => e.action === home.HOME_AUDIT.SESSION_REVIEWED && e.source_system === 'K9'));
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
