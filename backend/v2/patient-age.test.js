/**
 * patient-age — tests
 *
 * Every case is pinned to a fixed `asOf`. A test that reads the clock passes
 * today and fails on a birthday, which is precisely the drift this module
 * exists to remove.
 */

'use strict';

const assert = require('assert');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const age = require('./patient-age');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (err) { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); }
}

const DB_PATH = path.join(__dirname, '..', 'k9rehab.db');
const ASOF = '2026-09-24';

console.log('\npatient-age\n');

// ------------------------------------------------------------- the arithmetic

test('age is completed years, which is the age a person would say', () => {
  // 2 years and 8 months old is "2", not 3. Completed years is already the
  // floor, so a stored age should equal it exactly rather than be rounded.
  assert.strictEqual(age.ageFrom('2024-01-15', ASOF).years, 2);
  assert.strictEqual(age.ageFrom('2024-01-15', ASOF).months, 8);
});

test('the day before a birthday is still the younger age', () => {
  assert.strictEqual(age.ageFrom('2024-09-25', '2026-09-24').years, 1, 'a day early is still 1');
  assert.strictEqual(age.ageFrom('2024-09-24', '2026-09-24').years, 2, 'on the day it is 2');
});

test('a leap-day birth does not gain a year early', () => {
  // The millisecond approximation gets this wrong: 365.25 days a year drifts
  // a dog over its birthday on the wrong side of 29 February.
  assert.strictEqual(age.ageFrom('2024-02-29', '2025-02-28').years, 0, 'birthday not yet reached');
  assert.strictEqual(age.ageFrom('2024-02-29', '2025-03-01').years, 1);
});

test('a puppy has months even when it has no years', () => {
  const p = age.ageFrom('2026-04-24', ASOF);
  assert.strictEqual(p.years, 0);
  assert.strictEqual(p.totalMonths, 5, 'five months old must not read as simply "0"');
});

// -------------------------------------------------------------- the refusals

test('an ambiguous date is refused, never guessed', () => {
  // "03/04/2024" is 3 April or 4 March depending on who typed it. A guess is
  // wrong by up to a year and looks exactly as authoritative as a right one.
  const r = age.ageFrom('03/04/2024', ASOF);
  assert.strictEqual(r.years, null);
  assert.strictEqual(r.problem, age.PROBLEM.NOT_ISO);
});

test('a date that never existed is refused', () => {
  // Date.UTC rolls 30 February forward into March rather than rejecting it.
  assert.strictEqual(age.ageFrom('2025-02-30', ASOF).problem, age.PROBLEM.INVALID_DATE);
  assert.strictEqual(age.ageFrom('2025-13-01', ASOF).problem, age.PROBLEM.INVALID_DATE);
  assert.strictEqual(age.parseDob('2024-02-29').iso, '2024-02-29', 'a real leap day is not refused');
});

test('a birth date in the future is refused rather than read as a negative age', () => {
  const r = age.ageFrom('2030-01-01', ASOF);
  assert.strictEqual(r.years, null);
  assert.strictEqual(r.problem, age.PROBLEM.FUTURE);
});

test('an impossible age is REPORTED, not discarded', () => {
  // A mistyped year is still what somebody entered, and a record showing an
  // impossible age needs a person to see it — a silent null hides it.
  const r = age.ageFrom('1900-01-01', ASOF);
  assert.strictEqual(r.problem, age.PROBLEM.IMPLAUSIBLE);
  assert.ok(r.years > age.MAX_PLAUSIBLE_YEARS, 'the value must still be reported');
});

test('a blank date of birth is absence, not an error', () => {
  for (const v of ['', '   ', null, undefined]) {
    const r = age.ageFrom(v, ASOF);
    assert.strictEqual(r.years, null, `${JSON.stringify(v)} should have no age`);
    assert.strictEqual(r.problem, null, `${JSON.stringify(v)} is not a malformed date`);
  }
});

// ------------------------------------------------------------- the comparison

test('agreement is exact against completed years', () => {
  assert.strictEqual(age.agreesWithStated('2024-01-15', 2, ASOF), true);
  assert.strictEqual(age.agreesWithStated('2024-01-15', 3, ASOF), false);
});

test('an unreadable side yields null — neither agreement nor disagreement', () => {
  // A caller treating null as "fine" makes the same mistake as one treating an
  // unstated capability as absent.
  assert.strictEqual(age.agreesWithStated('03/04/2024', 2, ASOF), null, 'unreadable date');
  assert.strictEqual(age.agreesWithStated('2024-01-15', null, ASOF), null, 'no stated age');
  assert.strictEqual(age.agreesWithStated('2024-01-15', undefined, ASOF), null, 'undefined age');
  assert.strictEqual(age.agreesWithStated('2024-01-15', '', ASOF), null, 'empty stated age');
  assert.strictEqual(age.agreesWithStated('2024-01-15', '   ', ASOF), null, 'blank stated age');
  // Number(null), Number(undefined) and Number('') are all 0, and 0 is finite.
  // A patient with a date of birth and no age must read as unknown, not as a
  // dog that disagrees with its own record by being zero years old.
  assert.strictEqual(age.agreesWithStated('2026-09-24', null, ASOF), null,
    'a newborn with no stated age must still be unknown, not a match against 0');
  assert.strictEqual(age.agreesWithStated('2024-01-15', 'two', ASOF), null, 'unparseable age');
  assert.strictEqual(age.agreesWithStated('', 2, ASOF), null, 'no date of birth');
});

test('a fractional stored age compares on its whole years', () => {
  assert.strictEqual(age.agreesWithStated('2024-01-15', 2.7, ASOF), true);
});

// -------------------------------------------------------------- real records

test('the column exists, so a record-sync write cannot fail on it', () => {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const columns = db.prepare('PRAGMA table_info(patients)').all().map((c) => c.name);
  assert.ok(columns.includes('date_of_birth'),
    'patients.date_of_birth is missing — record-sync writes it and the save would fail');
});

test('every real date of birth is readable and agrees with the stored age', () => {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const rows = db.prepare('SELECT name, age, dashboard_data FROM patients ORDER BY id').all();
  assert.ok(rows.length >= 5, `expected the real patient set, got ${rows.length}`);

  for (const row of rows) {
    let blob = {};
    try { blob = JSON.parse(row.dashboard_data || '{}'); } catch { /* handled below */ }
    const dob = blob['client::Date of Birth'];
    assert.ok(dob, `${row.name}: no date of birth recorded`);

    const derived = age.ageFrom(dob, ASOF);
    assert.strictEqual(derived.problem, null, `${row.name}: ${dob} -> ${derived.problem}`);
    assert.strictEqual(age.agreesWithStated(dob, row.age, ASOF), true,
      `${row.name}: stored age ${row.age} against ${dob} (${derived.years}y ${derived.months}m)`);
  }
});

console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
if (failures.length) { console.log('FAILED'); process.exit(1); }
