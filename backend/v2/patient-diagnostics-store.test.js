/**
 * patient-diagnostics-store — tests
 *
 * V3 made a diagnostic study a ROW WITH A DATE rather than a checkbox with one
 * findings box, so these tests pin the two refusals that matter: a findings
 * text is never split into several studies, and `performed_on` is never
 * inferred from that text. Both are reported instead.
 *
 * Writes go to an in-memory database built from the REAL schema file.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const store = require('./patient-diagnostics-store');
const diagnostics = require('./diagnostics');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

const SCHEMA = path.join(__dirname, 'schema', 'patient-diagnostics.sqlite.sql');
const REAL_DB = path.join(__dirname, '..', 'k9rehab.db');
const ACTOR = { id: 1, username: 'sal', role: 'admin' };

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

function freshDb() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)');
  raw.exec('CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT)');
  raw.exec("INSERT INTO users (id, username) VALUES (1, 'sal')");
  for (const id of [1, 2, 42]) raw.prepare('INSERT INTO patients (id,name) VALUES (?,?)').run(id, `p${id}`);
  const schema = require('./schema');
  for (const st of schema.toStatements(fs.readFileSync(SCHEMA, 'utf8'))) raw.exec(st);
  return wrap(raw);
}

const IMG = (over = {}) => ({
  patientId: 1, category: 'IMAGING', modality: 'MRI', actor: ACTOR, ...over,
});

(async () => {
  console.log('\npatient-diagnostics-store\n');

  await test('the real table has the columns the store writes', async () => {
    await store.assertSchema(wrap(new DatabaseSync(REAL_DB, { readOnly: true })));
  });

  await test('a missing table names the schema file to apply', async () => {
    await assert.rejects(() => store.assertSchema(wrap(new DatabaseSync(':memory:'))),
      /patient-diagnostics\.sqlite\.sql/);
  });

  // ------------------------------------- a study is a row; repeats are rows

  await test('the same modality can be recorded twice — that is the point', async () => {
    // One box per modality cannot hold a pre-op and a post-op MRI, which is
    // exactly how four records in this database ended up with two studies
    // compressed into one findings text.
    const db = freshDb();
    await store.addStudy(db, IMG({ performedOn: '2026-03-01', findings: 'pre-op' }));
    await store.addStudy(db, IMG({ performedOn: '2026-05-01', findings: 'post-op' }));
    const r = await store.getStudies(db, 1);
    assert.strictEqual(r.studies.length, 2, 'a repeat study is a second row');
    assert.strictEqual(r.studies[0].performed_on, '2026-05-01', 'newest first');
  });

  await test('undated studies sort after dated ones, not among them', async () => {
    const db = freshDb();
    await store.addStudy(db, IMG({ findings: 'no date' }));
    await store.addStudy(db, IMG({ performedOn: '2020-01-01', findings: 'old but dated' }));
    const r = await store.getStudies(db, 1);
    assert.strictEqual(r.studies[0].performed_on, '2020-01-01');
    assert.strictEqual(r.studies[1].performed_on, null,
      'undated studies are the ones that most need a date — they are not buried');
  });

  // ---------------------------------------------- the two refusals, reported

  await test('a findings text describing two studies is kept WHOLE and flagged', async () => {
    const db = freshDb();
    await store.addStudy(db, IMG({
      findings: 'T13-L1 disc extrusion, 60% compression. Post-op MRI at 8w showed decompression.',
    }));
    const r = await store.getStudies(db, 1);
    assert.strictEqual(r.studies.length, 1, 'the text is never split into two rows');
    assert.strictEqual(r.studies[0].describes_multiple_studies, true, 'but it is reported');
    assert.strictEqual(r.summary.describing_multiple_studies, 1);
  });

  await test('one study is not flagged as several', async () => {
    assert.strictEqual(
      diagnostics.describesMultipleStudies('Bilateral coxofemoral OA. R hip: severe degenerative changes.'),
      false
    );
    assert.strictEqual(
      diagnostics.describesMultipleStudies('Partial CCL tear confirmed on stifle ultrasound.'),
      false
    );
    // Two markers are required; one on its own is just describing a timepoint.
    assert.strictEqual(diagnostics.describesMultipleStudies('Post-op radiograph.'), false);
    assert.strictEqual(diagnostics.describesMultipleStudies('Pre-op and post-op labs WNL.'), true);
  });

  await test('a date is never inferred from the findings text', async () => {
    const db = freshDb();
    await store.addStudy(db, IMG({ findings: 'Post-op MRI at 8w showed decompression.' }));
    const s = (await store.getStudies(db, 1)).studies[0];
    assert.strictEqual(s.performed_on, null,
      '"at 8w" is a point in a recovery, not a date — it depends on a surgery date this table does not own');
    assert.strictEqual(s.needs_a_date, true);
  });

  await test('a date a clinician sets is kept', async () => {
    const db = freshDb();
    const id = await store.addStudy(db, IMG({}));
    await store.updateStudy(db, { studyId: id, performedOn: '2026-09-24', actor: ACTOR });
    assert.strictEqual((await store.getStudies(db, 1)).studies[0].performed_on, '2026-09-24');
  });

  // ------------------------------------------------------------- validation

  await test('an unknown category is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => store.addStudy(db, IMG({ category: 'SCAN' })), /category must be one of/);
  });

  await test('an imaging study without a modality is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => store.addStudy(db, IMG({ modality: '' })), /needs a modality/);
  });

  await test('a laboratory study with no panels is refused', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.addStudy(db, { patientId: 1, category: 'LAB', actor: ACTOR }),
      /needs at least one panel/
    );
  });

  await test('a write without an identified actor is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => store.addStudy(db, IMG({ actor: null })), /actor/i);
  });

  await test('lab panels round-trip as a list', async () => {
    const db = freshDb();
    await store.addStudy(db, {
      patientId: 1, category: 'LAB', panels: ['CBC', 'Chemistry Panel'], actor: ACTOR,
    });
    assert.deepStrictEqual((await store.getStudies(db, 1)).studies[0].panels, ['CBC', 'Chemistry Panel']);
  });

  await test('re-migrating the same source field does not duplicate the study', async () => {
    const db = freshDb();
    await store.addStudy(db, IMG({ sourceField: 'imaging:MRI' }));
    await assert.rejects(() => store.addStudy(db, IMG({ sourceField: 'imaging:MRI' })), /UNIQUE|constraint/i);
  });

  await test('nothing on record yields null, not an empty shell', async () => {
    const db = freshDb();
    assert.strictEqual(await store.toSnapshot(db, 42), null);
  });

  // ------------------------------------------------------- the real records

  await test('all thirteen migrated studies read from the table', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = wrap(raw);
    // SCOPED TO THE MIGRATED RECORDS — see home-environment.test.js for the
    // reasoning. A patient registered after the migration has no studies to
    // have migrated, and asserting over every row turned this red when Sal
    // registered one mid-intake on 2026-09-25.
    const patients = raw.prepare(
      "SELECT id, name FROM patients WHERE dashboard_data LIKE '%\"diagnostics::%' ORDER BY id"
    ).all();

    let total = 0;
    let withStudies = 0;
    for (const p of patients) {
      const r = await store.getStudies(db, p.id);
      if (!r.configured) continue;
      withStudies += 1;
      total += r.studies.length;
      for (const s of r.studies) {
        assert.ok(diagnostics.CATEGORIES.includes(s.category), `${p.name}: bad category ${s.category}`);
        assert.ok(s.source_field, `${p.name}: a migrated study must say which field it came from`);
      }
    }
    assert.strictEqual(withStudies, 5, `expected 5 patients with studies, found ${withStudies}`);
    assert.strictEqual(total, 13, `expected 13 migrated studies, found ${total}`);
  });

  await test('the four records needing a split are flagged, and only those four', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = wrap(raw);
    let flagged = 0;
    for (const p of raw.prepare(
      "SELECT id FROM patients WHERE dashboard_data LIKE '%\"diagnostics::%'"
    ).all()) {
      const r = await store.getStudies(db, p.id);
      flagged += r.summary.describing_multiple_studies;
    }
    assert.strictEqual(flagged, 4,
      `expected exactly the 4 records that describe two studies, found ${flagged}`);
  });

  await test('the one stated lab date survived the migration', async () => {
    // V1 recorded exactly one real date. It was carried because it was STATED,
    // not read out of prose.
    // SCOPED TO THE MIGRATED RECORDS. Counting every row in the table meant
    // this asserted something about the whole database rather than about the
    // migration, so the first study a clinician recorded through the V3 screen
    // broke it — which happened while Sal was driving an intake on 2026-09-25.
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const dated = raw.prepare(
      "SELECT s.performed_on FROM patient_diagnostic_studies s"
      + " JOIN patients p ON p.id = s.patient_id"
      + " WHERE s.performed_on IS NOT NULL"
      + " AND p.dashboard_data LIKE '%\"diagnostics::%'"
    ).all();
    assert.strictEqual(dated.length, 1,
      `exactly one MIGRATED study had a stated date, found ${dated.length}`);
    assert.strictEqual(dated[0].performed_on, '2026-04-15');
  });

  console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
  if (failures.length) { console.log('FAILED'); process.exit(1); }
})();
