/**
 * patient-home-store — tests
 *
 * V3: this table is the source of truth for the home block, so these tests
 * assert the things that would silently lose a clinician's answer — a partial
 * write blanking fields it did not name, a field with no column, a normalised
 * reading being frozen into storage.
 *
 * Writes go to an in-memory database built from the REAL schema file, so they
 * cannot touch patient records. Reads are checked against the real database
 * too, because the migration is only proved by what is actually in it.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const store = require('./patient-home-store');
const homeEnvironment = require('./home-environment');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

const SCHEMA = path.join(__dirname, 'schema', 'patient-home.sqlite.sql');
const REAL_DB = path.join(__dirname, '..', 'k9rehab.db');
const UI_PATH = path.join(__dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx');

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

/**
 * A fresh in-memory database with the REAL schema file applied.
 *
 * The two referenced tables are created first because the schema declares
 * foreign keys against them and node:sqlite enforces those. They are stubs on
 * purpose — this suite tests the home store, and a fuller fixture would only
 * be more code that can disagree with production.
 */
function freshDb() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)');
  raw.exec('CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT)');
  raw.exec('INSERT INTO users (id, username) VALUES (1, \'sal\')');
  for (const id of [1, 3, 5, 7, 42, 99]) {
    raw.prepare('INSERT INTO patients (id, name) VALUES (?, ?)').run(id, `patient-${id}`);
  }
  raw.exec(fs.readFileSync(SCHEMA, 'utf8'));
  return wrap(raw);
}

const ACTOR = { id: 1, username: 'sal', role: 'admin' };

(async () => {
  console.log('\npatient-home-store\n');

  // ------------------------------------------------------- schema agreement

  await test('every field has a column in the real table', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    await store.assertColumnsMatchFields(wrap(raw));
  });

  await test('a field with no column fails LOUDLY rather than vanishing on write', async () => {
    // The fails-silent direction: a clinician answers a question, the API
    // accepts it, the column does not exist, and the answer is gone.
    const raw = new DatabaseSync(':memory:');
    raw.exec('CREATE TABLE patient_home_environment (id INTEGER PRIMARY KEY, patient_id INTEGER)');
    await assert.rejects(
      () => store.assertColumnsMatchFields(wrap(raw)),
      /defines fields with no column/,
      'a missing column must be an error, not a silent drop'
    );
  });

  await test('a missing table names the schema file to apply', async () => {
    const raw = new DatabaseSync(':memory:');
    await assert.rejects(() => store.assertColumnsMatchFields(wrap(raw)), /patient-home\.sqlite\.sql/);
  });

  // -------------------------------------------------------------- the shape

  await test('a patient with no record returns every field, unanswered', async () => {
    const db = freshDb();
    const r = await store.getHome(db, 99);
    assert.strictEqual(r.configured, false, 'no row means not configured');
    assert.deepStrictEqual(r.stated, {}, 'nothing stated');
    assert.strictEqual(r.unanswered.length, store.COLUMNS.length, 'every field is unanswered');
    assert.ok(r.fieldShape.length >= 16, 'the screen still gets the whole question list');
  });

  await test('the field shape carries the options, so the screen holds no copy', async () => {
    const db = freshDb();
    const r = await store.getHome(db, 99);
    const flooring = r.fieldShape.find((f) => f.key === 'flooring_indoor');
    assert.ok(flooring.options && flooring.options.length >= 5, 'options are served');
    const notes = r.fieldShape.find((f) => f.key === 'owner_notes');
    assert.strictEqual(notes.options, null);
    assert.strictEqual(notes.freeText, true, 'free text is marked as such');
  });

  // --------------------------------------------------------------- writing

  await test('a partial write does not blank the fields it did not name', async () => {
    // The form saves one answer at a time. This is the defect that would lose
    // an entire home record on a single edit.
    const db = freshDb();
    await store.setHome(db, {
      patientId: 1,
      stated: { flooring_indoor: 'Mixed — mostly carpet', session_minutes: '20' },
      actor: ACTOR,
    });
    await store.setHome(db, { patientId: 1, stated: { session_minutes: '30' }, actor: ACTOR });

    const r = await store.getHome(db, 1);
    assert.strictEqual(r.stated.session_minutes, '30', 'the named field changed');
    assert.strictEqual(r.stated.flooring_indoor, 'Mixed — mostly carpet',
      'an unnamed field must survive the write');
  });

  await test('an explicit empty string DOES clear a field', async () => {
    // Deliberately removing an answer is different from not mentioning it.
    const db = freshDb();
    await store.setHome(db, { patientId: 1, stated: { stairs_indoor: 'No stairs' }, actor: ACTOR });
    await store.setHome(db, { patientId: 1, stated: { stairs_indoor: '' }, actor: ACTOR });
    const r = await store.getHome(db, 1);
    assert.ok(!('stairs_indoor' in r.stated), 'the field is cleared, not left set');
  });

  await test('an unknown field is refused, not silently ignored', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.setHome(db, { patientId: 1, stated: { made_up: 'x' }, actor: ACTOR }),
      /Unknown home fields/
    );
  });

  await test('a write without an identified actor is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => store.setHome(db, { patientId: 1, stated: {}, actor: null }), /actor/i);
  });

  await test('the round trip is byte-identical', async () => {
    const db = freshDb();
    const stated = {};
    for (const f of homeEnvironment.FIELDS) stated[f.key] = `value for ${f.key}`;
    await store.setHome(db, { patientId: 7, stated, actor: ACTOR });
    const r = await store.getHome(db, 7);
    assert.deepStrictEqual(r.stated, stated, 'every field survives the round trip');
  });

  // ------------------------------------------------- derived, never stored

  await test('the normalised reading is derived, NOT a column', async () => {
    // Storing a reading freezes today's interpretation into the database. The
    // normalisers were corrected five times in one day; each correction would
    // have needed a data migration instead of a code change.
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const columns = raw.prepare('PRAGMA table_info(patient_home_environment)').all().map((c) => c.name);
    for (const derived of ['traction', 'stairs', 'outdoor_fenced', 'indoor_space', 'stair_frequency_code']) {
      assert.ok(!columns.includes(derived), `${derived} must not be stored — it is a reading`);
    }
  });

  await test('reading a stored record produces the normalised values', async () => {
    const db = freshDb();
    await store.setHome(db, {
      patientId: 3,
      stated: { flooring_indoor: 'Mixed — mostly carpet', session_minutes: '20–30 minutes' },
      actor: ACTOR,
    });
    const r = await store.getHome(db, 3);
    assert.strictEqual(r.normalized.traction, 'MIXED');
    assert.strictEqual(r.normalized.session_minutes, 20, 'capacity reads to its lower bound');
  });

  // --------------------------------------------------------- the HEP payload

  await test('no record yields null, not an empty shell', async () => {
    const db = freshDb();
    assert.strictEqual(await store.toHepPayload(db, 42), null);
  });

  await test('a record yields the payload from the TABLE', async () => {
    const db = freshDb();
    await store.setHome(db, { patientId: 5, stated: { flooring_indoor: 'Laminate' }, actor: ACTOR });
    const p = await store.toHepPayload(db, 5);
    assert.strictEqual(p.stated.flooring_indoor, 'Laminate');
    assert.strictEqual(p.normalized.traction, 'SLIPPERY');
    assert.ok(p.recorded_at, 'the payload says when it was recorded');
  });

  // ------------------------------------------------------- the real records

  await test('all five migrated patients read from the table', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = wrap(raw);
    const patients = raw.prepare('SELECT id, name FROM patients ORDER BY id').all();
    assert.ok(patients.length >= 5, `expected the real patient set, got ${patients.length}`);

    let withHome = 0;
    for (const p of patients) {
      const r = await store.getHome(db, p.id);
      if (!r.configured) continue;
      withHome += 1;
      assert.ok(Object.keys(r.stated).length >= 7,
        `${p.name}: only ${Object.keys(r.stated).length} fields in the table`);
      assert.deepStrictEqual(r.uninterpreted, [],
        `${p.name}: ${r.uninterpreted.map((u) => u.stated).join(', ')}`);
    }
    assert.strictEqual(withHome, 5, `expected 5 migrated home records, found ${withHome}`);
  });

  await test('the Home panel renders what the API serves, and hardcodes no field', async () => {
    // V3 replaced the check that every panel field had somewhere to be stored.
    // That check existed because the panel declared its own fields and four of
    // them had no column; now the module defines the fields and the API serves
    // them, so the comparison would be against itself.
    //
    // The remaining risk is the opposite one: somebody adding a field straight
    // into the panel again, which would write nowhere and be lost on reload.
    const src = fs.readFileSync(UI_PATH, 'utf8');
    const lines = src.split(/\r?\n/);
    const start = lines.findIndex((l) => /^function HomePanel/.test(l));
    assert.ok(start > 0, 'HomePanel not found in the dashboard source');
    let end = start + 1;
    while (end < lines.length && !/^function /.test(lines[end])) end++;
    const body = lines.slice(start, end).join('\n');

    const hardcoded = [...body.matchAll(/<F\s+label="([^"]+)"/g)].map((m) => m[1]);
    assert.deepStrictEqual(hardcoded, [],
      `the panel declares its own fields again — they would save nowhere:\n      ${hardcoded.join('\n      ')}`);

    assert.ok(/fieldShape|sections/.test(body), 'the panel no longer renders from the served shape');
    assert.ok(/patients\/\$\{patientId\}\/home/.test(body), 'the panel no longer calls the home endpoint');
    assert.ok(!/useState\(""\)[\s\S]{0,80}location/i.test(body),
      'the unsaved location state is back');
  });

  console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
  if (failures.length) { console.log('FAILED'); process.exit(1); }
})();
