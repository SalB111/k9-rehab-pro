/**
 * patient-client-store — tests
 *
 * V3. The client block splits in two: `patients` columns own the clinical
 * identity, this table owns the address, contacts, cover and identification.
 *
 * These pin the split — a demographic field passed here is REFUSED, not
 * quietly ignored — and the PII segregation the HEP contract test depends on.
 *
 * Writes go to an in-memory database built from the REAL schema file.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const store = require('./patient-client-store');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

const SCHEMA = path.join(__dirname, 'schema', 'patient-client-details.sqlite.sql');
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
  raw.exec(`CREATE TABLE patients (
    id INTEGER PRIMARY KEY, name TEXT, species TEXT, breed TEXT, age REAL, weight REAL,
    sex TEXT, date_of_birth TEXT, client_name TEXT, client_email TEXT, client_phone TEXT,
    referring_vet TEXT)`);
  raw.exec("INSERT INTO users (id, username) VALUES (1, 'sal')");
  raw.prepare('INSERT INTO patients (id,name,breed,age,client_email) VALUES (?,?,?,?,?)')
    .run(1, 'Testy', 'Labrador', 3, 'owner@example.com');
  raw.prepare('INSERT INTO patients (id,name) VALUES (?,?)').run(2, 'Other');
  const schema = require('./schema');
  for (const st of schema.toStatements(fs.readFileSync(SCHEMA, 'utf8'))) raw.exec(st);
  return wrap(raw);
}

(async () => {
  console.log('\npatient-client-store\n');

  await test('the real table has the columns the store writes', async () => {
    await store.assertSchema(wrap(new DatabaseSync(REAL_DB, { readOnly: true })));
  });

  await test('a missing table names the schema file to apply', async () => {
    await assert.rejects(() => store.assertSchema(wrap(new DatabaseSync(':memory:'))),
      /patient-client-details\.sqlite\.sql/);
  });

  // ------------------------------------------------------------- the split

  await test('a demographic field is REFUSED here, not quietly ignored', async () => {
    // It has its own endpoint with its own validation. Silently dropping it
    // would let a clinician change an age that never changed.
    const db = freshDb();
    for (const field of ['age', 'weight', 'breed', 'sex', 'client_email']) {
      await assert.rejects(
        () => store.setClient(db, { patientId: 1, details: { [field]: 'x' }, actor: ACTOR }),
        /belong to the patient record/,
        `${field} must be refused`
      );
    }
  });

  await test('demographics are readable, so one form can render the whole record', async () => {
    const db = freshDb();
    const r = await store.getClient(db, 1);
    assert.strictEqual(r.demographics.name, 'Testy');
    assert.strictEqual(r.demographics.breed, 'Labrador');
    assert.strictEqual(r.demographics.client_email, 'owner@example.com');
    assert.ok(r.demographicFields.includes('age'), 'the field list is served');
  });

  await test('an unknown field is refused', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.setClient(db, { patientId: 1, details: { favourite_colour: 'blue' }, actor: ACTOR }),
      /Unknown client detail fields/
    );
  });

  await test('a write without an identified actor is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => store.setClient(db, { patientId: 1, details: {}, actor: null }), /actor/i);
  });

  await test('a missing patient is refused rather than silently creating a row', async () => {
    const db = freshDb();
    await assert.rejects(() => store.getClient(db, 999), /not found/i);
  });

  // ------------------------------------------------------------- writing

  await test('a partial write does not blank the fields it did not name', async () => {
    const db = freshDb();
    await store.setClient(db, {
      patientId: 1,
      details: { street_address: '2847 NE 14th Avenue', city: 'Fort Lauderdale', microchip: '985112006847293' },
      actor: ACTOR,
    });
    await store.setClient(db, { patientId: 1, details: { city: 'Miami' }, actor: ACTOR });

    const r = await store.getClient(db, 1);
    assert.strictEqual(r.details.city, 'Miami', 'the named field changed');
    assert.strictEqual(r.details.street_address, '2847 NE 14th Avenue', 'an unnamed field must survive');
    assert.strictEqual(r.details.microchip, '985112006847293');
  });

  await test('an explicit empty string DOES clear a field', async () => {
    const db = freshDb();
    await store.setClient(db, { patientId: 1, details: { microchip: '985112006847293' }, actor: ACTOR });
    await store.setClient(db, { patientId: 1, details: { microchip: '' }, actor: ACTOR });
    assert.ok(!('microchip' in (await store.getClient(db, 1)).details));
  });

  await test('the round trip is byte-identical across every detail field', async () => {
    const db = freshDb();
    const details = {};
    for (const c of store.DETAIL_COLUMNS) details[c] = `value for ${c}`;
    await store.setClient(db, { patientId: 1, details, actor: ACTOR });
    assert.deepStrictEqual((await store.getClient(db, 1)).details, details);
  });

  await test('a patient with no details returns every field unanswered', async () => {
    const db = freshDb();
    const r = await store.getClient(db, 2);
    assert.strictEqual(r.configured, false);
    assert.deepStrictEqual(r.details, {});
    assert.strictEqual(r.unanswered.length, store.DETAIL_COLUMNS.length);
  });

  // ------------------------------------------------- the unstructured address

  await test('an unseparated address is flagged, and the flag survives a later write', async () => {
    // Splitting "1111 11th street Fort Lauderdale FL 33309" would mean deciding
    // where the street ends — a parse of somebody's address. The flag is how a
    // clinician knows to separate it.
    const db = freshDb();
    await store.setClient(db, {
      patientId: 1,
      details: { street_address: '1111 11th street Fort Lauderdale FL 33309' },
      addressIsUnstructured: true,
      actor: ACTOR,
    });
    assert.strictEqual((await store.getClient(db, 1)).address_is_unstructured, true);

    // A write that does not mention the flag must not clear it.
    await store.setClient(db, { patientId: 1, details: { microchip: '123' }, actor: ACTOR });
    assert.strictEqual((await store.getClient(db, 1)).address_is_unstructured, true);

    // Separating the address clears it deliberately.
    await store.setClient(db, {
      patientId: 1,
      details: { street_address: '1111 11th Street', city: 'Fort Lauderdale' },
      addressIsUnstructured: false,
      actor: ACTOR,
    });
    assert.strictEqual((await store.getClient(db, 1)).address_is_unstructured, false);
  });

  // ------------------------------------------------------ PII segregation

  await test('no client PII column exists on the patients table', async () => {
    // The structural half of the guarantee the HEP contract test asserts: a
    // payload built from a patient row cannot leak a microchip it never held.
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const patientCols = new Set(raw.prepare('PRAGMA table_info(patients)').all().map((c) => c.name));
    for (const c of ['microchip', 'street_address', 'emergency_contact', 'insurance_provider', 'postal_code']) {
      assert.ok(!patientCols.has(c), `${c} must not be a column on patients`);
    }
  });

  // ------------------------------------------------------- the real records

  await test('all five patients migrated, with their details readable', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = wrap(raw);
    let withDetails = 0;
    let fields = 0;
    for (const p of raw.prepare('SELECT id, name FROM patients ORDER BY id').all()) {
      const r = await store.getClient(db, p.id);
      if (!r.configured) continue;
      withDetails += 1;
      fields += Object.keys(r.details).length;
    }
    assert.strictEqual(withDetails, 5, `expected 5 migrated client records, found ${withDetails}`);
    assert.ok(fields >= 40, `expected the migrated fields, found ${fields}`);
  });

  await test('the insurance and markings values came across', async () => {
    // These are stored under "Pet Insurance Provider" and "Color / Markings",
    // which is what the panel's dropdown and multi-select actually write.
    //
    // (An earlier reading of this called it label rot, because the panel ALSO
    // has "Other Insurance Provider" and "Additional Markings" fields that are
    // always empty. They are not renames — they are conditional free-text
    // fields shown only when the dropdown is set to "Other". Nothing was
    // stranded. The migration read the right keys either way.)
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = wrap(raw);
    let insurance = 0;
    let markings = 0;
    for (const p of raw.prepare('SELECT id FROM patients').all()) {
      const r = await store.getClient(db, p.id);
      if (r.details.insurance_provider) insurance += 1;
      if (r.details.colour_markings) markings += 1;
    }
    assert.ok(insurance >= 3, `expected rescued insurance values, found ${insurance}`);
    assert.ok(markings >= 3, `expected rescued markings values, found ${markings}`);
  });

  await test('exactly one real address is recorded as unseparated', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const n = raw.prepare(
      `SELECT COUNT(*) c FROM ${store.TABLE} WHERE ${store.ADDRESS_FLAG} = 1`
    ).get().c;
    assert.strictEqual(n, 1, `expected the one one-line address, found ${n}`);
  });

  console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
  if (failures.length) { console.log('FAILED'); process.exit(1); }
})();
