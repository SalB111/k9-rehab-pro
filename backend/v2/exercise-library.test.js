/**
 * The exercise library — one library, one identifier, one stated size
 *
 * WHAT THIS PROTECTS
 *
 * There are two things in this repository that look like an exercise library:
 *
 *   all-exercises.js      260 entries, identified by `code` ("PROM_STIFLE").
 *                         The protocol engine selects from it and B.E.A.U.
 *                         validates against it. This is THE library.
 *
 *   exercises_v2 table     48 rows, identified by `id` ("MOB-P1-01"). Seeded
 *                         by the sqlite provider, read by nothing that
 *                         generates or validates clinical content.
 *
 * The two identifier sets share NOTHING — measured, zero overlap. Until
 * 2026-09-24 `GET /api/exercises` served the 260 while `GET /api/exercises/:id`
 * queried the 48, so following a code from the list was a guaranteed 404 and
 * any lookup that did succeed returned a row from a library the engine does
 * not use. Nothing called it, which is why nobody noticed.
 *
 * Anti-hallucination rule 1 in CLAUDE.md turns on the library's size, and it
 * said 223 while the library held 260. A rule that cites the wrong library is
 * a rule nobody can check, so the count is asserted here rather than trusted.
 *
 *   node v2/exercise-library.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { ALL_EXERCISES } = require('../all-exercises');
const { PROTOCOL_DEFINITIONS } = require('../protocol-generator');

const ROOT = path.join(__dirname, '..', '..');
const CURATED = require('../curated-codes.json');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

const CODES = new Set(ALL_EXERCISES.map((e) => e.code));

test('the library has a code for every entry, and no duplicates', () => {
  assert.strictEqual(CODES.size, ALL_EXERCISES.length,
    'two entries share a code, so one of them is unreachable by code');
  for (const e of ALL_EXERCISES) {
    assert.ok(e.code && typeof e.code === 'string', `an entry has no code: ${e.name || '(unnamed)'}`);
  }
});

test('CLAUDE.md states the size the library actually has', () => {
  // Anti-hallucination rule 1 turns on this number. It read 223 against a
  // library of 260 until 2026-09-24.
  const md = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');
  const stated = [...md.matchAll(/(\d+)-exercise library/g)].map((m) => Number(m[1]));
  assert.ok(stated.length, 'CLAUDE.md no longer states a library size — rule 1 cannot be checked');
  for (const n of stated) {
    assert.strictEqual(n, ALL_EXERCISES.length,
      `CLAUDE.md says a ${n}-exercise library; all-exercises.js holds `
      + `${ALL_EXERCISES.length}. A rule that cites the wrong library is a rule `
      + 'nobody can check against.');
  }
});

test('every protocol exercise code exists in the library', () => {
  // Anti-hallucination rule 1, enforced rather than stated.
  const missing = [];
  for (const [type, def] of Object.entries(PROTOCOL_DEFINITIONS)) {
    for (const phase of def.phases) {
      for (const ex of phase.exercises) {
        if (!CODES.has(ex.code)) missing.push(`${type}/phase${phase.number}: ${ex.code}`);
      }
    }
  }
  assert.strictEqual(missing.length, 0,
    'a protocol prescribes exercises that do not exist:\n  ' + missing.join('\n  '));
});

test('every curated code exists in the library', () => {
  // The curated set is what B.E.A.U. is shown. A code in it that the library
  // does not have is one the model can cite and nothing can resolve.
  const missing = CURATED.filter((c) => !CODES.has(c));
  assert.strictEqual(missing.length, 0,
    'curated-codes.json names exercises the library does not have: ' + missing.join(', '));
});

test('a library code is never a valid exercises_v2 id, and vice versa', () => {
  // The two identifier schemes must stay disjoint, because code that confuses
  // them fails by returning the WRONG exercise rather than by erroring. If
  // they ever overlap, a lookup against the wrong table starts succeeding.
  let ids = [];
  try {
    const { DatabaseSync } = require('node:sqlite');
    const dbPath = process.env.K9_DB || path.join(__dirname, '..', 'k9rehab.db');
    if (!fs.existsSync(dbPath)) return;            // no database here; nothing to compare
    const db = new DatabaseSync(dbPath, { readOnly: true });
    ids = db.prepare('SELECT id FROM exercises_v2').all().map((r) => r.id);
  } catch {
    return;                                        // table absent — not a failure
  }
  if (!ids.length) return;
  const overlap = ids.filter((id) => CODES.has(id));
  assert.strictEqual(overlap.length, 0,
    'exercises_v2 ids now collide with library codes: ' + overlap.join(', ')
    + '. Any endpoint keying one by the other will silently return the wrong '
    + 'exercise instead of 404ing.');
});

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`exercise-library: ${passed} passed`);
