/**
 * Activity restrictions have ONE home — tests
 *
 * WHAT THIS PROTECTS
 *
 * Until 2026-09-26 a patient's activity orders lived in two places:
 *
 *   patients.special_instructions                  what the engine read
 *   patient_treatment_status.activity_restrictions what the panel wrote
 *
 * Nothing kept them in step, so they drifted — and not as copies of each
 * other going stale, but as two half-records. Winston, Charlie and Luna each
 * held orders on one side that the other was missing: Charlie's heated
 * orthopedic bedding and 4-weekly HCPI reassessment existed only in the
 * column, his walk dosing only in the store. Haley's column was empty
 * outright, so the engine had never seen her restrictions at all.
 *
 * Sal's decision: one fact, owned by the Treatment block. So now
 *
 *   - the STORE is the home; the engine reads it
 *   - the COLUMN is a mirror, written by recordStatus and by nothing else
 *   - the New/Edit Patient form no longer offers a box that writes it
 *
 * The third is the one that would quietly undo the others. With the engine
 * reading the store, a form field still writing the column does not
 * re-create the old drift — it makes what a clinician types reach nothing.
 *
 * SCOPE NOTE, so nobody reads more into this than it says: activity
 * restrictions drive NO exercise exclusion, and did not before this change
 * either. All 18 CONTRAINDICATION_MAP keywords are comorbidity terms
 * (cardiac, seizure, cancer, pregnant, implant...) and none is an activity
 * order — "no stairs", "no jumping", "crate rest" and "no impact exercises"
 * match nothing. These tests guard WHERE THE FACT LIVES, not what it causes.
 *
 *   node v2/activity-restrictions-home.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const store = require('./patient-treatment-store');
const ip = require('./intake-proposal');
const recordSync = require('./record-sync');
const schema = require('./schema');

const ROOT = path.join(__dirname, '..', '..');
const REAL_DB = path.join(__dirname, '..', 'k9rehab.db');
const FORM = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'clinical', 'PatientForm.jsx');
const EDIT = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'clinical', 'EditPatient.jsx');
const SCHEMA_SQL = path.join(__dirname, 'schema', 'patient-treatment.sqlite.sql');

const ACTOR = { id: 1, username: 'sal', role: 'admin' };

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve().then(fn)
    .then(() => { passed += 1; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

/** Production db contract: { lastID, changes }, not node:sqlite's raw shape. */
function wrap(raw) {
  return {
    get: async (sql, p = []) => raw.prepare(sql).get(...p),
    all: async (sql, p = []) => raw.prepare(sql).all(...p),
    run: async (sql, p = []) => {
      const r = raw.prepare(sql).run(...p);
      return { lastID: Number(r.lastInsertRowid), changes: r.changes };
    },
  };
}

/** A throwaway database with the real treatment schema and one patient. */
function freshDb() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)');
  raw.exec('CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT,'
    + ' special_instructions TEXT, treatment_approach TEXT, affected_limbs TEXT,'
    + ' affected_region TEXT, condition TEXT, client_name TEXT, dashboard_data TEXT)');
  raw.exec("INSERT INTO users (id, username) VALUES (1, 'sal')");
  raw.exec("INSERT INTO patients (id, name, client_name, condition, special_instructions)"
    + " VALUES (1, 'Testdog', 'Owner', 'Osteoarthritis', '')");
  for (const st of schema.toStatements(fs.readFileSync(SCHEMA_SQL, 'utf8'))) raw.exec(st);
  return { raw, db: wrap(raw) };
}

(async () => {
  console.log('\nactivity-restrictions-home\n');

  // ── the store is the home ────────────────────────────────────────────────

  await test('the engine reads the STORE, not the column', async () => {
    const { raw, db } = freshDb();
    await store.recordStatus(db, {
      patientId: 1, effectiveDate: '2026-09-26', actor: ACTOR,
      status: { activity_restrictions: 'Leash only. No stairs.' },
    });
    // AFTER recordStatus, on purpose. The mirror write means the column
    // already equals the store by now, so setting the stale value first made
    // the two identical and this test could not tell which one was read —
    // it passed against a mutation that put the engine back on the column.
    // Found by mutation testing, 2026-09-26.
    raw.prepare('UPDATE patients SET special_instructions = ? WHERE id = 1')
      .run('STALE COLUMN VALUE — must not be used');

    const patient = raw.prepare('SELECT * FROM patients WHERE id = 1').get();
    const treatment = await store.getTreatment(db, 1);
    const out = ip.proposeEngineInputs({ patient, treatment }).proposed;
    raw.close();

    assert.strictEqual(
      out.specialInstructions, 'Leash only. No stairs.',
      'the proposal must take activity orders from the treatment store'
    );
  });

  await test('the column is a mirror kept in step by recordStatus', async () => {
    const { raw, db } = freshDb();
    await store.recordStatus(db, {
      patientId: 1, effectiveDate: '2026-09-26', actor: ACTOR,
      status: { activity_restrictions: 'Harness only. Ramps not stairs.' },
    });
    const col = raw.prepare('SELECT special_instructions s FROM patients WHERE id = 1').get().s;
    raw.close();
    assert.strictEqual(
      col, 'Harness only. Ramps not stairs.',
      'PatientDetailView, engine-adapter and patient-gaps all read this column — '
      + 'if recordStatus stops writing it they go stale'
    );
  });

  await test('BACKDATING does not stamp a superseded value over the mirror', async () => {
    // The reason the mirror reads getTreatment().status rather than the local
    // `merged`. A status recorded for an EARLIER date is a real row but is
    // not the one that governs.
    const { raw, db } = freshDb();
    await store.recordStatus(db, {
      patientId: 1, effectiveDate: '2026-09-26', actor: ACTOR,
      status: { activity_restrictions: 'CURRENT — full weight bearing, free exercise' },
    });
    await store.recordStatus(db, {
      patientId: 1, effectiveDate: '2026-09-01', actor: ACTOR,
      status: { activity_restrictions: 'OLD — strict crate rest' },
    });
    const col = raw.prepare('SELECT special_instructions s FROM patients WHERE id = 1').get().s;
    raw.close();
    assert.strictEqual(
      col, 'CURRENT — full weight bearing, free exercise',
      'writing a backdated status must not resurrect its orders as current — '
      + 'that would put a crate-rest order back on a freely exercising dog'
    );
  });

  await test('an empty restriction clears the mirror rather than leaving it stale', async () => {
    const { raw, db } = freshDb();
    await store.recordStatus(db, {
      patientId: 1, effectiveDate: '2026-09-26', actor: ACTOR,
      status: { activity_restrictions: 'No stairs' },
    });
    await store.recordStatus(db, {
      patientId: 1, effectiveDate: '2026-09-27', actor: ACTOR,
      status: { activity_restrictions: '' },
    });
    const col = raw.prepare('SELECT special_instructions s FROM patients WHERE id = 1').get().s;
    raw.close();
    assert.strictEqual(col, '', 'lifting a restriction must lift it everywhere');
  });

  // ── no second writer ─────────────────────────────────────────────────────

  await test('record-sync no longer writes the mirror from the blob', () => {
    const existing = {
      id: 1, special_instructions: '',
      dashboard_data: JSON.stringify({ 'treatment::Activity Restrictions': 'FROM THE BLOB' }),
    };
    const r = recordSync.reconcile({
      existing, updates: {}, incomingBlob: existing.dashboard_data,
    });
    assert.strictEqual(
      r.columns.special_instructions, undefined,
      'the blob must not fill this column — it is a mirror of the store, and a '
      + 'second writer is the two-copies problem this change exists to end'
    );
  });

  await test('the New/Edit Patient form offers no box that writes it', () => {
    const form = fs.readFileSync(FORM, 'utf8');
    const live = form.split('\n').filter((l) => {
      const t = l.trim();
      return !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('{/*') && !t.startsWith('/*');
    }).join('\n');
    assert.ok(
      !/set\(\s*["']special_instructions["']\s*\)/.test(live),
      'a control on this form writes special_instructions. With the engine now '
      + 'reading the store, what a clinician types here reaches NOTHING.'
    );
    assert.ok(
      /Treatment block/i.test(form),
      'the field should read as MOVED, not missing — point at the Treatment block'
    );
  });

  await test('EditPatient cannot send it either', () => {
    const edit = fs.readFileSync(EDIT, 'utf8');
    const live = edit.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    assert.ok(
      !/special_instructions:\s*str\(/.test(live),
      'EditPatient still puts special_instructions in its diff map, so an open '
      + 'form would stamp a stale mirror value over the store'
    );
  });

  // ── the invariant, on live data ──────────────────────────────────────────

  await test('every real patient has column == current store row', async () => {
    // A floor-style live check: no exact counts, no pinned patient list. The
    // three suites that broke this morning all asserted "exactly five".
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const rows = raw.prepare('SELECT id, name, special_instructions FROM patients ORDER BY id').all();
    assert.ok(rows.length >= 1, 'no patients to check');

    let checked = 0;
    const off = [];
    for (const p of rows) {
      const cur = raw.prepare(
        'SELECT activity_restrictions a FROM patient_treatment_status'
        + ' WHERE patient_id = ? ORDER BY effective_date DESC, id DESC LIMIT 1'
      ).get(p.id);
      if (!cur) continue; // nothing to mirror from; the column is left alone
      checked += 1;
      if ((p.special_instructions || '') !== (cur.a || '')) {
        off.push(`${p.name}: column ${JSON.stringify(p.special_instructions)} `
          + `vs store ${JSON.stringify(cur.a)}`);
      }
    }
    raw.close();
    assert.deepStrictEqual(off, [], `the mirror is out of step:\n      ${off.join('\n      ')}`);
    assert.ok(checked >= 1, 'no patient had a status row — the check proved nothing');
  });

  if (failures.length) {
    console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
    process.exit(1);
  }
  console.log(`\nactivity-restrictions-home: ${passed} passed\n`);
})();
