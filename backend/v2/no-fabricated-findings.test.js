/**
 * A clinical finding is never fabricated — tests
 *
 * WHAT THIS PROTECTS
 *
 * Four columns describe what somebody found when they examined an animal:
 *
 *   lameness_grade        0 is "sound"
 *   body_condition_score  5 is "ideal"
 *   pain_level            5 is moderate pain
 *   mobility_level        "Moderate"
 *
 * All four are ENGINE INPUTS. A value nobody produced does not sit harmlessly
 * in a chart — it is read, reasoned from, and silently defeats the three
 * mechanisms built to catch a missing one: patient-gaps stops reporting it,
 * intake-proposal stops recovering it from the clinical record (it only fills
 * an EMPTY column), and the safety gates stop falling to their cautious
 * defaults.
 *
 * This has now been fixed TWICE, in two different places, which is why it has
 * a test of its own rather than a comment:
 *
 *   3516874   removed `lameness_grade || 0, body_condition_score || 5,
 *             pain_level || 5, mobility_level || "Moderate"` from the INSERT
 *             in server.js. Found because Sal recorded NRS 2 for Haley and
 *             the engine went on reading 5.
 *
 *   2026-09-26  removed `DEFAULT 0 / 5 / 5 / 'Moderate'` from the patients
 *             DDL itself. The first fix left these in place, so the
 *             fabrication survived one layer down: any insert that merely
 *             OMITS the columns gets them back. Found by
 *             scripts/drive-flow.js, whose registration step names only the
 *             columns it means to set.
 *
 * So there are two rules, and both are checked below: the schema must not
 * supply these, and no insert path may leave them to the schema.
 *
 *   node v2/no-fabricated-findings.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const BACKEND = path.join(__dirname, '..');
const PROVIDER = path.join(BACKEND, 'db-providers', 'sqlite-provider.js');
const SERVER = path.join(BACKEND, 'server.js');
const REAL_DB = path.join(BACKEND, 'k9rehab.db');

/** The four. Named once. */
const FINDINGS = ['lameness_grade', 'body_condition_score', 'pain_level', 'mobility_level'];

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`); }
  catch (err) { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); }
}

/** The real patients DDL, out of the provider that creates it. */
function patientsDdl() {
  const src = fs.readFileSync(PROVIDER, 'utf8');
  const m = /CREATE TABLE IF NOT EXISTS patients \([\s\S]*?\n {4}\)/.exec(src);
  assert.ok(m, 'the patients DDL could not be found in sqlite-provider.js');
  return m[0];
}

console.log('\nno-fabricated-findings\n');

// ── 1. the schema must not supply a finding ────────────────────────────────

test('the patients DDL defaults none of the four findings', () => {
  const ddl = patientsDdl();
  const offenders = [];
  for (const col of FINDINGS) {
    // The column's own line, comments stripped so prose naming the old
    // defaults cannot fail this.
    const line = ddl.split('\n')
      .filter((l) => !l.trim().startsWith('--'))
      .find((l) => new RegExp(`^\\s*${col}\\s`).test(l));
    assert.ok(line, `${col} is not in the patients DDL at all`);
    if (/DEFAULT/i.test(line)) offenders.push(`${col}:${line.trim()}`);
  }
  assert.deepStrictEqual(
    offenders, [],
    'the schema fabricates a clinical finding for any insert that omits the '
    + `column:\n      ${offenders.join('\n      ')}`
  );
});

test('a fresh install records nothing for an unexamined patient', () => {
  // Not the shape of the DDL — what it DOES. Build it and insert.
  const db = new DatabaseSync(':memory:');
  db.exec(patientsDdl() + ';');
  db.prepare('INSERT INTO patients (name, species, breed, age, weight, condition)'
    + ' VALUES (?,?,?,?,?,?)').run('X', 'canine', 'Mixed Breed', 5, 40, 'Osteoarthritis');
  const row = db.prepare(`SELECT ${FINDINGS.join(', ')} FROM patients WHERE id = 1`).get();
  db.close();

  const invented = FINDINGS.filter((c) => row[c] !== null);
  assert.deepStrictEqual(
    invented, [],
    'registering a patient invented a clinical picture for an animal nobody '
    + `has examined: ${invented.map((c) => `${c}=${JSON.stringify(row[c])}`).join(', ')}`
  );
});

// ── 2. no insert path may leave them to the schema ─────────────────────────

test('the patient INSERT in server.js names all four explicitly', () => {
  const src = fs.readFileSync(SERVER, 'utf8');
  const m = /INSERT INTO patients \(([\s\S]*?)\)\s*VALUES/.exec(src);
  assert.ok(m, 'the patient INSERT could not be found in server.js');
  const named = m[1];
  const missing = FINDINGS.filter((c) => !new RegExp(`\\b${c}\\b`).test(named));
  assert.deepStrictEqual(
    missing, [],
    `server.js inserts a patient without naming ${missing.join(', ')}. Even with `
    + 'the schema defaults gone that is a column left to whatever the schema '
    + 'says, which is how this came back the first time.'
  );
});

test('server.js passes them through rather than coercing them', () => {
  const src = fs.readFileSync(SERVER, 'utf8');
  const live = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  for (const [pattern, why] of [
    [/lameness_grade\s*\|\|\s*0/, 'lameness 0 is "sound", not "unknown"'],
    [/body_condition_score\s*\|\|\s*5/, 'BCS 5 is "ideal", not "unknown"'],
    [/pain_level\s*\|\|\s*5/, 'pain 5/10 is moderate pain, not "unknown"'],
    [/mobility_level\s*\|\|\s*["']Moderate["']/, '"Moderate" is a finding, not "unknown"'],
  ]) {
    assert.ok(!pattern.test(live), `server.js is back to coercing: ${why}`);
  }
});

// ── 3. the live database ───────────────────────────────────────────────────

test('[KNOWN] the LIVE patients table still carries the old defaults', () => {
  // Deliberately asserted as the CURRENT state rather than the desired one.
  //
  // Removing them from the live table means rebuilding it, and 19 foreign
  // keys point INTO `patients`. That is not a change to make unattended, so
  // it is queued for Sal with scripts/migrate-drop-finding-defaults.js ready
  // to run. No live code path omits these columns today, so nothing is being
  // fabricated in practice — the exposure is a FUTURE insert path.
  //
  // WHEN THE MIGRATION RUNS THIS TEST WILL FAIL. That is the point: flip it
  // to assert `defaults === []` and delete this comment.
  if (!fs.existsSync(REAL_DB)) { console.log('      (no live database — skipped)'); return; }
  const db = new DatabaseSync(REAL_DB, { readOnly: true });
  const cols = db.prepare('PRAGMA table_info(patients)').all();
  db.close();
  const defaults = cols
    .filter((c) => FINDINGS.includes(c.name) && c.dflt_value !== null)
    .map((c) => `${c.name}=${c.dflt_value}`);
  assert.ok(
    defaults.length > 0,
    'the live table no longer has the fabricating defaults — the migration has '
    + 'been run. Flip this test to assert defaults.length === 0.'
  );
  console.log(`      still to migrate: ${defaults.join(', ')}`);
});

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  process.exit(1);
}
console.log(`\nno-fabricated-findings: ${passed} passed\n`);
