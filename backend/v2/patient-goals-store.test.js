/**
 * patient-goals-store — tests
 *
 * V3 made goals a rehabilitation workflow rather than four boxes of text, so
 * these tests pin the WORKFLOW semantics, not just that rows round-trip:
 * unreviewed is not "in progress", a target date is never inferred from the
 * goal's wording, and overdue is computed rather than stored.
 *
 * Writes go to an in-memory database built from the REAL schema file so they
 * cannot touch patient records. Reads are checked against the real database
 * too, because the migration is only proved by what is in it.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const store = require('./patient-goals-store');
const goals = require('./goals');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

const SCHEMA = path.join(__dirname, 'schema', 'patient-goals.sqlite.sql');
const REAL_DB = path.join(__dirname, '..', 'k9rehab.db');
const ACTOR = { id: 1, username: 'sal', role: 'admin' };
const NOW = '2026-09-24T00:00:00Z';

function wrap(raw) {
  return {
    get: async (sql, p = []) => raw.prepare(sql).get(...p),
    all: async (sql, p = []) => raw.prepare(sql).all(...p),
    // Match the PRODUCTION contract, not node:sqlite's raw shape.
    // db-providers/sqlite-provider.js resolves { lastID, changes }; node:sqlite
    // returns { lastInsertRowid, changes }. A wrapper that differs makes these
    // tests prove something production never does.
    run: async (sql, p = []) => {
      const r = raw.prepare(sql).run(...p);
      return { lastID: Number(r.lastInsertRowid), changes: r.changes };
    },
  };
}

function freshDb() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)');
  raw.exec('CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT)');
  raw.exec('CREATE TABLE visits (id INTEGER PRIMARY KEY, patient_id INTEGER)');
  raw.exec("INSERT INTO users (id, username) VALUES (1, 'sal')");
  raw.exec('INSERT INTO visits (id, patient_id) VALUES (77, 1)');
  for (const id of [1, 2, 3, 42]) {
    raw.prepare('INSERT INTO patients (id, name) VALUES (?, ?)').run(id, `patient-${id}`);
  }
  const schema = require('./schema');
  for (const st of schema.toStatements(fs.readFileSync(SCHEMA, 'utf8'))) raw.exec(st);
  return wrap(raw);
}

const addGoal = (db, over = {}) => store.addGoalItem(db, {
  patientId: 1, horizon: 'SHORT', kind: 'CLINICAL', goalText: 'HCPI < 12', actor: ACTOR, ...over,
});

(async () => {
  console.log('\npatient-goals-store\n');

  await test('the real tables have the columns goals.js expects', async () => {
    await store.assertSchema(wrap(new DatabaseSync(REAL_DB, { readOnly: true })));
  });

  await test('a missing table names the schema file to apply', async () => {
    await assert.rejects(() => store.assertSchema(wrap(new DatabaseSync(':memory:'))),
      /patient-goals\.sqlite\.sql/);
  });

  // ------------------------------------------ unreviewed is NOT "in progress"

  await test('a new goal is UNREVIEWED, with a null status', async () => {
    const db = freshDb();
    await addGoal(db);
    const r = await store.getGoals(db, 1);
    assert.strictEqual(r.items[0].status, null, 'a goal nobody has reviewed has no status');
    assert.strictEqual(r.items[0].reviewed, false);
    assert.strictEqual(r.review.unreviewed, 1, 'and it counts as unreviewed');
  });

  await test('the review summary leads with what nobody has looked at', async () => {
    const db = freshDb();
    await addGoal(db, { goalText: 'a' });
    await addGoal(db, { goalText: 'b' });
    const id = await addGoal(db, { goalText: 'c' });
    await store.reviewGoalItem(db, { itemId: id, status: 'MET', actor: ACTOR });
    const r = await store.getGoals(db, 1);
    assert.strictEqual(r.review.total, 3);
    assert.strictEqual(r.review.unreviewed, 2);
    assert.strictEqual(r.review.met, 1);
  });

  // ----------------------------------------------------------- the review act

  await test('a review records the outcome, who, when and at which visit', async () => {
    const db = freshDb();
    const id = await addGoal(db);
    await store.reviewGoalItem(db, {
      itemId: id, status: 'PARTIALLY_MET', note: 'HCPI 14, improving', visitId: 77, actor: ACTOR,
    });
    const r = await store.getGoals(db, 1);
    const g = r.items[0];
    assert.strictEqual(g.status, 'PARTIALLY_MET');
    assert.strictEqual(g.status_note, 'HCPI 14, improving');
    assert.strictEqual(g.reviewed_by, 1);
    assert.strictEqual(g.reviewed_visit_id, 77, 'a status floats free of the record without its visit');
    assert.ok(g.reviewed_at, 'a review must record when');
  });

  await test('an unknown status is refused', async () => {
    const db = freshDb();
    const id = await addGoal(db);
    await assert.rejects(
      () => store.reviewGoalItem(db, { itemId: id, status: 'NEARLY', actor: ACTOR }),
      /status must be one of/
    );
  });

  await test('clearing a review clears the reviewer with it', async () => {
    // A record showing who reviewed a goal that has no review is a lie about
    // the chart, so the whole review is cleared together.
    const db = freshDb();
    const id = await addGoal(db);
    await store.reviewGoalItem(db, { itemId: id, status: 'MET', note: 'n', visitId: 77, actor: ACTOR });
    await store.reviewGoalItem(db, { itemId: id, status: null, actor: ACTOR });
    const g = (await store.getGoals(db, 1)).items[0];
    assert.strictEqual(g.status, null);
    assert.strictEqual(g.reviewed_by, null);
    assert.strictEqual(g.reviewed_at, null);
    assert.strictEqual(g.reviewed_visit_id, null);
    assert.strictEqual(g.status_note, null);
  });

  // -------------------------------------------------------------- overdue

  await test('a goal past its target with no review is OVERDUE', async () => {
    const db = freshDb();
    await addGoal(db, { targetDate: '2026-09-01' });
    const r = await store.getGoals(db, 1, { asOf: NOW });
    assert.strictEqual(r.items[0].overdue, true);
    assert.strictEqual(r.review.overdue, 1);
  });

  await test('a goal that was MET is not overdue, however late', async () => {
    const db = freshDb();
    const id = await addGoal(db, { targetDate: '2020-01-01' });
    await store.reviewGoalItem(db, { itemId: id, status: 'MET', actor: ACTOR });
    assert.strictEqual((await store.getGoals(db, 1, { asOf: NOW })).items[0].overdue, false);
  });

  await test('NOT_MET past its date is still overdue — it is not closed', async () => {
    const db = freshDb();
    const id = await addGoal(db, { targetDate: '2026-09-01' });
    await store.reviewGoalItem(db, { itemId: id, status: 'NOT_MET', actor: ACTOR });
    assert.strictEqual((await store.getGoals(db, 1, { asOf: NOW })).items[0].overdue, true);
  });

  await test('no target date means overdue is null — not "on time"', async () => {
    // A caller treating null as fine makes the same mistake as one reading an
    // unstated capability as absent.
    const db = freshDb();
    await addGoal(db);
    assert.strictEqual((await store.getGoals(db, 1, { asOf: NOW })).items[0].overdue, null);
  });

  await test('overdue is not a column — it is computed on read', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const cols = raw.prepare('PRAGMA table_info(patient_goal_items)').all().map((c) => c.name);
    assert.ok(!cols.includes('overdue'), 'a stored overdue flag is wrong the day after it is written');
  });

  // ------------------------------------------ target dates are never inferred

  await test('a goal mentioning a period gets NO target date, only a prompt', async () => {
    const db = freshDb();
    await addGoal(db, { goalText: 'Achieve 4/5 weight-bearing at trot within 2 weeks.' });
    const g = (await store.getGoals(db, 1)).items[0];
    assert.strictEqual(g.target_date, null, 'a date must never be parsed out of the wording');
    assert.strictEqual(g.mentions_timeframe_without_target, true, 'but the screen is prompted');
  });

  await test('a measurement tolerance is NOT read as a deadline', async () => {
    // The two real false positives that killed the parsing idea: a 1 cm
    // tolerance and a 12-inch jump height, both matched by "within N units".
    assert.strictEqual(goals.mentionsTimeframe('thigh circumference within 1 cm bilaterally'), false);
    assert.strictEqual(goals.mentionsTimeframe('Weave poles, jump grids (12 in), A-frame'), false);
    assert.strictEqual(goals.mentionsTimeframe('Jump onto bed (14-inch) independently'), false);
    // And the real ones are still caught.
    assert.strictEqual(goals.mentionsTimeframe('sound at trot within 2 weeks'), true);
    assert.strictEqual(goals.mentionsTimeframe('Weight loss 3 lbs in 4 weeks'), true);
    assert.strictEqual(goals.mentionsTimeframe('AKC agility with sign-off (6 months)'), true);
  });

  await test('a target date set by a clinician is kept', async () => {
    const db = freshDb();
    const id = await addGoal(db);
    await store.updateGoalItem(db, { itemId: id, targetDate: '2026-10-08', actor: ACTOR });
    assert.strictEqual((await store.getGoals(db, 1)).items[0].target_date, '2026-10-08');
  });

  // ------------------------------------------------------------- validation

  await test('an invalid horizon or kind is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => addGoal(db, { horizon: 'MEDIUM' }), /horizon must be one of/);
    await assert.rejects(() => addGoal(db, { kind: 'VIBES' }), /kind must be one of/);
  });

  await test('a goal with no text is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => addGoal(db, { goalText: '   ' }), /needs text/);
  });

  await test('a write without an identified actor is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => addGoal(db, { actor: null }), /actor/i);
  });

  // ---------------------------------------------------------------- the set

  await test('a partial set write does not blank the fields it did not name', async () => {
    const db = freshDb();
    await store.setGoalSet(db, {
      patientId: 1, set: { primary_goals: 'Other', owner_priority: 'Pain relief above all' }, actor: ACTOR,
    });
    await store.setGoalSet(db, { patientId: 1, set: { owner_priority: 'Independence at home' }, actor: ACTOR });
    const r = await store.getGoals(db, 1);
    assert.strictEqual(r.set.owner_priority, 'Independence at home');
    assert.strictEqual(r.set.primary_goals, 'Other', 'an unnamed field must survive');
  });

  await test('a trackable goal cannot be smuggled in as a set field', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.setGoalSet(db, { patientId: 1, set: { short_term_clinical: 'x' }, actor: ACTOR }),
      /Unknown goal fields/
    );
  });

  await test('re-migrating the same source field does not duplicate the goal', async () => {
    const db = freshDb();
    await addGoal(db, { sourceField: 'short_term_clinical' });
    await assert.rejects(() => addGoal(db, { sourceField: 'short_term_clinical' }),
      /UNIQUE|constraint/i, 'the source_field index must stop a second copy');
  });

  // ------------------------------------------------------------ HEP payload

  await test('the payload splits goals by audience and carries their status', async () => {
    const db = freshDb();
    const c = await addGoal(db, { kind: 'CLINICAL', goalText: 'HCPI < 12' });
    await addGoal(db, { kind: 'FUNCTIONAL', goalText: 'Navigate 3 steps' });
    await addGoal(db, { kind: 'OWNER', goalText: 'back to running fast', horizon: 'LONG' });
    await store.reviewGoalItem(db, { itemId: c, status: 'MET', actor: ACTOR });

    const p = await store.toHepPayload(db, 1, { asOf: NOW });
    assert.strictEqual(p.clinical.goals.length, 1);
    assert.strictEqual(p.clinical.goals[0].status, 'MET', 'status travels');
    assert.strictEqual(p.owner_facing.goals.length, 2, 'functional and owner goals go to the owner');
    assert.ok(!JSON.stringify(p.owner_facing).includes('HCPI'), 'a clinical measure is not owner-facing');
  });

  await test('practice admin is kept out of the handoff', async () => {
    const db = freshDb();
    await store.setGoalSet(db, {
      patientId: 1, set: { communication_preference: 'Email — protocol PDF' }, actor: ACTOR,
    });
    const p = await store.toHepPayload(db, 1);
    assert.ok(!JSON.stringify(p).includes('protocol PDF'));
  });

  await test('no goals at all yields null, not an empty shell', async () => {
    const db = freshDb();
    assert.strictEqual(await store.toHepPayload(db, 42), null);
  });

  // ------------------------------------------------------- the real records

  await test('all five migrated patients have goals, and none is reviewed yet', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = wrap(raw);
    const patients = raw.prepare('SELECT id, name FROM patients ORDER BY id').all();

    let withGoals = 0;
    let items = 0;
    for (const p of patients) {
      const r = await store.getGoals(db, p.id, { asOf: NOW });
      if (!r.configured) continue;
      withGoals += 1;
      items += r.items.length;
      assert.deepStrictEqual(r.uninterpreted, [],
        `${p.name}: ${r.uninterpreted.map((u) => u.stated).join(', ')}`);
      assert.strictEqual(r.review.unreviewed, r.items.length,
        `${p.name}: a goal is marked reviewed but nobody has reviewed one yet`);
    }
    assert.strictEqual(withGoals, 5, `expected 5 migrated goal sets, found ${withGoals}`);
    assert.strictEqual(items, 16, `expected 16 migrated goals, found ${items}`);
  });

  await test('every migrated goal kept its horizon and kind', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const rows = raw.prepare('SELECT horizon, kind, source_field FROM patient_goal_items').all();
    for (const r of rows) {
      assert.ok(['SHORT', 'LONG'].includes(r.horizon), `bad horizon ${r.horizon}`);
      assert.ok(['CLINICAL', 'FUNCTIONAL', 'OWNER'].includes(r.kind), `bad kind ${r.kind}`);
      assert.ok(r.source_field, 'a migrated goal must say which field it came from');
    }
  });

  console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
  if (failures.length) { console.log('FAILED'); process.exit(1); }
})();
