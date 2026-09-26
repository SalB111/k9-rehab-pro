/**
 * Discharge — tests
 *
 * THE DEFECT THESE EXIST FOR
 *
 * Until 2026-09-26 nothing recorded that care had ended. The dashboard's
 * DISCHARGE PATIENT button PUT `{ status: "discharged" }` to
 * `PUT /api/patients/:id` — a route that does not destructure `status`, onto
 * a `patients` table with no such column — and never read the response:
 *
 *     await fetch(..., { body: JSON.stringify({ status: "discharged" }) });
 *     setDischarged(true);
 *
 * So the screen said PATIENT DISCHARGED and the claim survived exactly until
 * a page reload. `VISIT_TYPE.DISCHARGE` had existed all along and nothing had
 * ever created one.
 *
 * WHAT THESE PROTECT, in order of how much it would cost to lose it
 *
 *   1. COMPLETED AND DISCONTINUED STAY APART. Sal's decision, 2026-09-26.
 *      A dog that stopped at week 2 must never be countable among the
 *      completions. Each reason belongs to exactly one outcome and the store
 *      refuses the cross product.
 *
 *   2. "WE DON'T KNOW YET" IS A RECORDABLE ANSWER. Sal: "THEN WE CONTACT THE
 *      OWNER TO FIND OUT WHY?" A blank reason and an unestablished one look
 *      identical on a screen and mean different things in a record.
 *
 *   3. A CLINICAL OUTCOME MUST NAME ITS MEASURE. "IMPROVED" with nothing
 *      behind it is an opinion wearing the clothes of a measurement, which is
 *      what the Anti-Hallucination Rules exist to stop.
 *
 *   4. THE HANDOFF CANNOT BE CLAIMED. "Went home with B.E.A.U." is read from
 *      `beau_handoffs`, never typed, so it cannot be true of a handoff that
 *      never happened.
 *
 *   5. EVERY RECORD NAMES ITS CLINIC. Sal: "WE SHOULD ALSO IDENTIFY WHICH
 *      CLINIC WE ARE IN SO IF WE DRIFT WE DONT HAVE TO HUNT LOCATION".
 *
 *   6. THE BUTTON DOES NOT LIE. The last two read the real JSX and fail if
 *      the screen goes back to announcing a discharge it did not check.
 *
 *   node v2/discharge.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const { toStatements } = require('./schema');
const store = require('./discharge-store');
const visitStore = require('./visit-store');

const ROOT = path.join(__dirname, '..', '..');
const DASHBOARD = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed += 1; console.log(`  ok    ${name}`); })
    .catch((err) => { failures.push({ name, message: err.message }); console.log(`  FAIL  ${name}\n          ${err.message.split('\n')[0]}`); });
}

function wrap(raw) {
  return {
    get: async (sql, p = []) => raw.prepare(sql).get(...p),
    all: async (sql, p = []) => raw.prepare(sql).all(...p),
    // The PRODUCTION contract: sqlite-provider resolves { lastID, changes }.
    run: async (sql, p = []) => {
      const r = raw.prepare(sql).run(...p);
      return { lastID: Number(r.lastInsertRowid), changes: r.changes };
    },
  };
}

/** The REAL schema files, so a column added there and not here cannot pass. */
function schemaOf(file) {
  return fs.readFileSync(path.join(__dirname, 'schema', file), 'utf8');
}

/**
 * Split with the REAL splitter, not a naive split(';').
 *
 * The first version of this fixture dropped whole-line comments and split on
 * ';', and every test failed with "incomplete input": clinical-visits has a
 * TRAILING comment reading `-- 0-5;  <=1 restricts to passive/NMES`, whose
 * semicolon cut a CREATE TABLE in half. schema.js solved that when it was
 * written. A second, worse copy of the rule inside a test fixture is how a
 * suite ends up proving something about a schema production never applies.
 */
function apply(raw, sql) {
  for (const stmt of toStatements(sql)) raw.exec(stmt);
}

function freshDb() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON');
  raw.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)');
  raw.exec('CREATE TABLE clinics (id INTEGER PRIMARY KEY, clinic_name TEXT)');
  raw.exec('CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT, clinic_id INTEGER)');
  apply(raw, schemaOf('protocol-persistence.sqlite.sql'));
  apply(raw, schemaOf('clinical-visits.sqlite.sql'));
  apply(raw, schemaOf('patient-discharge.sqlite.sql'));

  raw.prepare('INSERT INTO users (id, username) VALUES (1, ?)').run('sal');
  raw.prepare('INSERT INTO clinics (id, clinic_name) VALUES (3, ?)').run('TEST Clinic 3');
  raw.prepare('INSERT INTO patients (id, name, clinic_id) VALUES (7, ?, 3)').run('Scout');
  return wrap(raw);
}

/**
 * The same patient, with a 16-week protocol they were actually on.
 *
 * Separate from freshDb because the ABSENCE of a protocol is itself the
 * subject of two tests — "you cannot complete a protocol that does not
 * exist". A fixture that always seeded one would make those two unwritable.
 */
async function dbWithApprovedProtocol(status = 'APPROVED') {
  const db = freshDb();
  await db.run(
    `INSERT INTO protocols (id, patient_id, status, created_by) VALUES (1, 7, ?, 1)`,
    [status]
  );
  await db.run(
    `INSERT INTO protocol_versions (id, protocol_id, version_number, status, engine_input_json, derived_flags_json, total_weeks)
     VALUES (1, 1, 1, ?, '{}', '{}', 16)`,
    [status]
  );
  return db;
}

const ACTOR = { id: 1, username: 'sal', role: 'admin' };

/** A minimal valid discharge, for tests that vary one field. */
const COMPLETION = {
  patientId: 7,
  outcome: 'COMPLETED',
  reason: 'PROTOCOL_COMPLETED',
  actor: ACTOR,
};

(async () => {
  console.log('\ndischarge\n');

  // ── the two outcomes stay apart ─────────────────────────────────────────

  await test('a completion is recorded as COMPLETED', async () => {
    const db = await dbWithApprovedProtocol();
    const d = await store.dischargePatient(db, COMPLETION);
    assert.strictEqual(d.outcome, 'COMPLETED');
    assert.strictEqual(d.reason, 'PROTOCOL_COMPLETED');
  });

  await test('THE LOAD-BEARING ONE — a DISCONTINUED reason cannot be filed as COMPLETED', async () => {
    // Sal chose to keep the two apart precisely so that a query for "how many
    // completed" cannot pick up a dog that stopped at week 2. If the store
    // accepts this pairing, that separation is decoration.
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, { ...COMPLETION, reason: 'FINANCIAL' }),
      /DISCONTINUED reason/,
      'a dog whose owner ran out of money was accepted as having completed the protocol'
    );
  });

  await test('and a COMPLETED reason cannot be filed as DISCONTINUED', async () => {
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, {
        ...COMPLETION, outcome: 'DISCONTINUED', reason: 'PROTOCOL_COMPLETED',
      }),
      /COMPLETED reason/
    );
  });

  // ── a completion must have a protocol behind it ─────────────────────────

  await test('SAL: you cannot complete a protocol that does not exist', async () => {
    // Haley, 2026-09-26 23:03, discharged as "Completed the full protocol"
    // with no protocols row, no version and total_weeks NULL. The dashboard's
    // Generate produces text and stores nothing, so the protocol was real on
    // screen and absent from the record.
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, COMPLETION),
      /no approved protocol/,
      'a completion was recorded against a protocol that does not exist — the '
      + 'one outcome that feeds efficacy tracking, and unfalsifiable'
    );
  });

  await test('a DRAFT protocol is not something you can have completed', async () => {
    // CLAUDE.md: no protocol output is valid without veterinarian approval.
    const db = await dbWithApprovedProtocol('DRAFT');
    await assert.rejects(store.dischargePatient(db, COMPLETION), /no approved protocol/);
  });

  await test('with an APPROVED protocol, a completion is recorded', async () => {
    const db = await dbWithApprovedProtocol();
    const d = await store.dischargePatient(db, COMPLETION);
    assert.strictEqual(d.outcome, 'COMPLETED');
    assert.strictEqual(d.total_weeks, 16, 'the protocol length was not read from the record');
  });

  await test('DISCONTINUED is NOT gated — most reasons precede any protocol', async () => {
    // A dog can stop after one session, before anything was generated. Gating
    // this would make the honest answer unrecordable.
    const db = freshDb();
    const d = await store.dischargePatient(db, {
      patientId: 7, outcome: 'DISCONTINUED', reason: 'FINANCIAL', actor: ACTOR,
    });
    assert.strictEqual(d.outcome, 'DISCONTINUED');
  });

  await test('every reason in the list belongs to exactly one outcome', async () => {
    const seen = new Map();
    for (const r of store.REASONS) {
      assert.ok(
        r.outcome === store.OUTCOME.COMPLETED || r.outcome === store.OUTCOME.DISCONTINUED,
        `${r.code} belongs to no outcome`
      );
      assert.ok(!seen.has(r.code), `${r.code} appears twice`);
      seen.set(r.code, r.outcome);
    }
    assert.ok(seen.size >= 10, 'the reason list lost entries');
  });

  await test('an invented reason is refused', async () => {
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, { ...COMPLETION, reason: 'GOT_BORED' }),
      /Unknown discharge reason/
    );
  });

  // ── "we don't know yet" is a real answer ────────────────────────────────

  await test('SAL\'S CASE — care can stop with the reason pending owner contact', async () => {
    // "THEN WE CONTACT THE OWNER TO FIND OUT WHY?" — 2026-09-26.
    const db = freshDb();
    const d = await store.dischargePatient(db, {
      patientId: 7, outcome: 'DISCONTINUED',
      reason: 'NOT_YET_KNOWN', reasonStatus: 'PENDING_OWNER_CONTACT', actor: ACTOR,
    });
    assert.strictEqual(d.reason_status, 'PENDING_OWNER_CONTACT');
    assert.strictEqual(d.reason, 'NOT_YET_KNOWN');
  });

  await test('and the answer can be filled in later, marked as having arrived later', async () => {
    const db = freshDb();
    const d = await store.dischargePatient(db, {
      patientId: 7, outcome: 'DISCONTINUED',
      reason: 'NOT_YET_KNOWN', reasonStatus: 'PENDING_OWNER_CONTACT', actor: ACTOR,
    });
    assert.strictEqual(d.reason_updated_at, null, 'nothing was amended yet');

    const after = await store.updateReason(db, {
      dischargeId: d.id, reason: 'FINANCIAL', reasonStatus: 'KNOWN', actor: ACTOR,
    });
    assert.strictEqual(after.reason, 'FINANCIAL');
    assert.ok(
      after.reason_updated_at,
      'the record does not show that the reason arrived after the discharge, so a '
      + 'later answer is indistinguishable from one known on the day'
    );
  });

  await test('NOT_YET_KNOWN contradicts a status of KNOWN and is refused', async () => {
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, {
        patientId: 7, outcome: 'DISCONTINUED', reason: 'NOT_YET_KNOWN',
        reasonStatus: 'KNOWN', actor: ACTOR,
      }),
      /contradicts/
    );
  });

  await test('a NAMED reason with an unresolved status is refused — that would be a guess', async () => {
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, {
        patientId: 7, outcome: 'DISCONTINUED', reason: 'FINANCIAL',
        reasonStatus: 'PENDING_OWNER_CONTACT', actor: ACTOR,
      }),
      /must be 'NOT_YET_KNOWN'/
    );
  });

  await test('a COMPLETED course cannot be pending an owner call', async () => {
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, {
        ...COMPLETION, reasonStatus: 'PENDING_OWNER_CONTACT',
      }),
      /known reason by definition/
    );
  });

  // ── a clinical outcome must name its measure ────────────────────────────

  await test('THE ANTI-HALLUCINATION ONE — "IMPROVED" with no measure is refused', async () => {
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, { ...COMPLETION, clinicalOutcome: 'IMPROVED' }),
      /must name what it was measured against/,
      'an unsourced clinical claim was accepted into the record'
    );
  });

  await test('"IMPROVED" with a measure is recorded', async () => {
    const db = await dbWithApprovedProtocol();
    const d = await store.dischargePatient(db, {
      ...COMPLETION, clinicalOutcome: 'IMPROVED', outcomeMeasuredBy: 'HCPI 28 -> 11',
    });
    assert.strictEqual(d.clinical_outcome, 'IMPROVED');
    assert.strictEqual(d.outcome_measured_by, 'HCPI 28 -> 11');
  });

  await test('an unjudged outcome defaults to NOT_ASSESSED, not to "unchanged"', async () => {
    // "Unchanged" is a judgement. Defaulting to it would invent one.
    const db = await dbWithApprovedProtocol();
    const d = await store.dischargePatient(db, COMPLETION);
    assert.strictEqual(d.clinical_outcome, 'NOT_ASSESSED');
  });

  // ── the handoff is derived, never typed ─────────────────────────────────

  await test('handoff_id is NULL when no handoff exists, whatever the caller passes', async () => {
    const db = freshDb();
    const d = await store.dischargePatient(db, {
      patientId: 7, outcome: 'DISCONTINUED', reason: 'IMPROVED_CONTINUING_AT_HOME',
      actor: ACTOR,
      // a caller trying to claim one
      handoffId: 99, handed_off_to_beau: true,
    });
    assert.strictEqual(
      d.handoff_id, null,
      'a handoff to B.E.A.U. was recorded for a patient who never had one'
    );
  });

  await test('SAL\'S OTHER CASE — improved, went home with B.E.A.U., handoff found on the record', async () => {
    const db = freshDb();
    await db.run(
      `INSERT INTO protocols (id, patient_id, status, created_by) VALUES (1, 7, 'APPROVED', 1)`
    );
    await db.run(
      `INSERT INTO protocol_versions (id, protocol_id, version_number, status, engine_input_json, derived_flags_json, total_weeks)
       VALUES (1, 1, 1, 'HANDED_OFF', '{}', '{}', 16)`
    );
    await db.run(
      `INSERT INTO beau_handoffs (id, protocol_id, version_id, patient_id, handoff_payload_json, payload_hash, status, handed_off_by)
       VALUES (1, 1, 1, 7, '{}', 'abc', 'ACTIVE', 1)`
    );

    const d = await store.dischargePatient(db, {
      patientId: 7, outcome: 'DISCONTINUED', reason: 'IMPROVED_CONTINUING_AT_HOME',
      weekReached: 5, actor: ACTOR,
    });

    // This exact row is the case Sal described: not a failure, not a
    // completion — stopped at week 5 of 16 and continuing at home.
    assert.strictEqual(d.outcome, 'DISCONTINUED');
    assert.strictEqual(d.handoff_id, 1, 'the real handoff was not found');
    assert.strictEqual(d.week_reached, 5);
    assert.strictEqual(d.total_weeks, 16, 'the protocol length was not read from the record');
  });

  // ── where they got to ───────────────────────────────────────────────────

  await test('visits_attended is counted from the record, not typed', async () => {
    const db = await dbWithApprovedProtocol();
    for (const date of ['2026-09-01', '2026-09-08', '2026-09-15']) {
      const v = await visitStore.createVisit(db, {
        patientId: 7, visitDate: date, visitType: 'RECHECK', actor: ACTOR,
      });
      await visitStore.completeVisit(db, { visitId: v.id, actor: ACTOR });
    }
    const d = await store.dischargePatient(db, {
      ...COMPLETION, visitsAttended: 99,   // a caller trying to state it
    });
    assert.strictEqual(
      d.visits_attended, 3,
      'the session count was taken from the caller rather than from the visits'
    );
  });

  // ── the clinic is on the record ─────────────────────────────────────────

  await test('SAL\'S POINT — the discharge names the clinic it happened in', async () => {
    const db = await dbWithApprovedProtocol();
    const d = await store.dischargePatient(db, COMPLETION);
    assert.strictEqual(d.clinic_id, 3, 'the discharge does not name its clinic');
    assert.strictEqual(d.clinic_name, 'TEST Clinic 3');
  });

  await test('the DISCHARGE visit it creates names the clinic too', async () => {
    const db = await dbWithApprovedProtocol();
    await store.dischargePatient(db, COMPLETION);
    const v = await db.get(`SELECT * FROM visits WHERE visit_type = 'DISCHARGE'`);
    assert.ok(v, 'no DISCHARGE visit was created — VISIT_TYPE.DISCHARGE is unused again');
    assert.strictEqual(v.clinic_id, 3);
    assert.strictEqual(v.status, 'COMPLETED');
  });

  await test('a visit inherits the clinic from its patient', async () => {
    const db = freshDb();
    const v = await visitStore.createVisit(db, {
      patientId: 7, visitDate: '2026-09-26', visitType: 'RECHECK', actor: ACTOR,
    });
    assert.strictEqual(
      v.clinic_id, 3,
      'a new visit does not name its clinic, so the answer is back to being '
      + 'recomputed at read time from whoever is logged in'
    );
  });

  // ── discharged is derived, not flagged ──────────────────────────────────

  await test('a discharged patient reads as discharged', async () => {
    const db = await dbWithApprovedProtocol();
    await store.dischargePatient(db, COMPLETION);
    const state = await store.isDischarged(db, 7);
    assert.strictEqual(state.discharged, true);
  });

  await test('THE STALE-FLAG ONE — a patient who comes back reads as active again', async () => {
    // There is deliberately no patients.status column. A stored flag would be
    // a lie the moment a discharged patient returns and nobody cleared it.
    const db = await dbWithApprovedProtocol();
    await store.dischargePatient(db, COMPLETION);
    await new Promise((r) => setTimeout(r, 1100)); // CURRENT_TIMESTAMP is 1s resolution
    await visitStore.createVisit(db, {
      patientId: 7, visitDate: '2026-10-01', visitType: 'RECHECK', actor: ACTOR,
    });
    const state = await store.isDischarged(db, 7);
    assert.strictEqual(
      state.discharged, false,
      'a patient who came back for another visit still reads as discharged'
    );
    assert.ok(state.discharge, 'the historical discharge is still on the record');
  });

  await test('discharging twice without a visit in between is refused', async () => {
    const db = await dbWithApprovedProtocol();
    await store.dischargePatient(db, COMPLETION);
    await assert.rejects(
      store.dischargePatient(db, COMPLETION),
      /already discharged/
    );
  });

  await test('an unidentified actor cannot end a course of care', async () => {
    const db = freshDb();
    await assert.rejects(
      store.dischargePatient(db, { ...COMPLETION, actor: null }),
      /identified actor/
    );
  });

  // ── the screen ──────────────────────────────────────────────────────────

  const jsx = fs.readFileSync(DASHBOARD, 'utf8');

  await test('THE BUTTON NO LONGER LIES — the discharge handler checks the response', async () => {
    // The whole defect in one line: `setDischarged(true)` ran whether or not
    // the server had recorded anything, and the route it called ignored the
    // body entirely.
    //
    // THE SLICE IS BOUNDED AT saveReason, AND THAT MATTERS. The first version
    // took a flat 3000 characters from `const handleDischarge`, which ran
    // past the end of the function and into saveReason — whose guard on the
    // response is identical. Mutation testing caught it: replacing this
    // handler's check with `if (false)` left the suite GREEN, because the
    // assertion was reading the NEXT function's guard. An assertion that can
    // be satisfied by code it is not about is not an assertion.
    const from = jsx.indexOf('const handleDischarge');
    const to = jsx.indexOf('const saveReason', from);
    assert.ok(from !== -1, 'handleDischarge is gone — has it been renamed?');
    assert.ok(to > from, 'saveReason no longer follows handleDischarge; re-anchor this slice');
    const handler = jsx.slice(from, to);

    assert.ok(
      !/body: JSON\.stringify\(\{ status: "discharged" \}\)/.test(handler),
      'the handler PUTs {status:"discharged"} again, at a route that ignores it'
    );
    // The EXPRESSION, not its vocabulary. `/\.ok\b/` passes on any mention of
    // res.ok anywhere, including one inside a comment saying it was removed.
    assert.ok(
      /if\s*\(\s*!res\.ok\s*\|\|/.test(handler),
      'the handler does not check whether the server accepted the discharge, so '
      + 'the screen can announce one that was never recorded'
    );
    assert.ok(
      /setOpen\(false\);?\s*\n?\s*load\(\);/.test(handler),
      'the handler no longer re-reads the record after posting, so the screen '
      + 'shows what it hoped happened rather than what was stored'
    );
  });

  await test('the discharge screen posts to the endpoint that records it', async () => {
    assert.ok(
      /\/patients\/\$\{[^}]+\}\/discharge/.test(jsx) || /patients\/.+\/discharge/.test(jsx),
      'nothing on the dashboard calls POST /v2/patients/:id/discharge'
    );
  });

  await test('the stage banner names the clinic, and does not invent one', async () => {
    // Sal: "WE SHOULD ALSO IDENTIFY WHICH CLINIC WE ARE IN SO IF WE DRIFT WE
    // DONT HAVE TO HUNT LOCATION." The banner must read the served clinic,
    // and must say so when the record names none — a placeholder name is how
    // the wrong location gets trusted.
    assert.ok(
      /blockState\.clinic\s*\?\s*blockState\.clinic\.name/.test(jsx),
      'the banner does not render the clinic served by block-state'
    );
    assert.ok(
      /not set on this record/.test(jsx),
      'the banner has no honest answer for a record with no clinic, so it will '
      + 'either render nothing or invent a name'
    );
  });

  await test('block-state serves the PATIENT clinic, not the reader one', async () => {
    const router = fs.readFileSync(
      path.join(__dirname, 'routes', 'v2-router.js'), 'utf8'
    );
    assert.ok(
      /patient\.clinic_id\s*!=\s*null\s*\?\s*patient\.clinic_id/.test(router),
      'block-state resolves the clinic from the request rather than from the '
      + 'patient, so the banner would name where the reader is sitting instead '
      + 'of where the record lives'
    );
  });

  console.log('');
  if (failures.length) {
    console.error(`FAILED ${failures.length} of ${passed + failures.length}\n`);
    process.exit(1);
  }
  console.log(`discharge: ${passed} passed\n`);
})();
