/**
 * Feline generation gate — tests
 *
 * WHAT THIS PROTECTS
 *
 * The protocol engine has no feline path. `protocol-generator.js` contains
 * ZERO references to species and can select none of the fifteen FELINE_*
 * exercises in the library; the engine contract lists species as
 * `{ role: "echoed", default: "canine" }`.
 *
 * Run a cat through it and it produces a dog's protocol. An acceptance pass on
 * 22 Sep 2026 did exactly that: a domestic shorthair with lumbosacral
 * spondylosis was prescribed hill walking, a wobble board, cavaletti rails and
 * slow pivot turns, and nothing anywhere said a word about it.
 *
 * So generation refuses for a cat until the feline path exists. These tests
 * exist to keep the refusal honest in both directions: it must never let a cat
 * through, and it must never start blocking dogs.
 *
 *   node v2/feline-gate.test.js
 */

'use strict';

const assert = require('assert');
const adapter = require('./engine-adapter');
const engine = require('../protocol-generator');
const { ALL_EXERCISES } = require('../all-exercises');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

/** A state good enough to generate from, so species is the only variable. */
const state = (species) => ({
  patient: {
    name: 'Test', client_name: 'A Owner', species,
    condition: 'Lumbosacral Spondylosis', affected_region: 'Lumbosacral Spine',
    age: 6, weight: 11,
  },
  visit: { treatment_approach: 'Conservative', weight_bearing_status: 'FWB' },
  clinic: { modality_laser: true, modality_heat_therapy: true },
  protocol: { length_weeks: 8, frequency: '2x/week' },
});

const run = (species) =>
  adapter.runEngine(adapter.toEngineFormData(state(species)), engine, ALL_EXERCISES);

// ---------------------------------------------------------------------------

test('a cat is refused, and told why', () => {
  const r = run('feline');
  assert.strictEqual(r.valid, false, 'generation must refuse for a feline patient');
  assert.strictEqual(r.blockedReason, 'FELINE_UNSUPPORTED');
  assert.ok(r.errors.length > 0, 'a refusal with no reason is not a refusal');
  assert.match(
    r.errors.join(' '), /canine exercise set|not available/i,
    'the message must say WHY — that the engine only holds canine selection'
  );
});

test('no exercises come back with the refusal', () => {
  // A refusal that still carries a protocol is one somebody will use.
  const r = run('feline');
  assert.deepStrictEqual(r.weeks, []);
  assert.strictEqual(r.protocolType, null);
  assert.strictEqual(r.totalWeeks, 0);
});

test('every spelling of cat in the database is caught', () => {
  // The column holds "feline", "Feline" and "cat" across the product.
  for (const s of ['feline', 'Feline', 'FELINE', 'cat', 'Cat', 'Domestic Shorthair cat']) {
    const r = run(s);
    assert.strictEqual(r.valid, false, `"${s}" was not recognised as a cat`);
  }
});

test('dogs still generate', () => {
  // The other direction. A gate that blocks everything is not a gate.
  for (const s of ['canine', 'Canine', 'dog', 'Dog', '', null, undefined]) {
    const r = run(s);
    assert.notStrictEqual(
      r.blockedReason, 'FELINE_UNSUPPORTED',
      `"${s}" was blocked as feline. Species defaults to canine in the contract, ` +
      `so an absent species must generate`
    );
  }
});

test('an unstated species is treated as canine, not blocked', () => {
  const r = run(undefined);
  assert.ok(r.valid, 'a patient with no species recorded must still generate');
  assert.ok(r.weeks.length > 0);
});

test('the refusal happens before any clinical validation', () => {
  // It must not depend on the rest of the record being complete: a cat with a
  // half-filled record should get the species answer, not a list of missing
  // fields that implies filling them in would help.
  const bare = {
    patient: { species: 'feline' },
    visit: {},
    clinic: {},
    protocol: {},
  };
  const r = adapter.runEngine(adapter.toEngineFormData(bare), engine, ALL_EXERCISES);
  assert.strictEqual(r.blockedReason, 'FELINE_UNSUPPORTED');
  assert.ok(
    !r.errors.some((e) => /required/i.test(e)),
    'a cat must be told about the feline path, not about missing fields'
  );
});

// ---------------------------------------------------------------------------
// The reason the gate exists, asserted so it cannot quietly stop being true
// ---------------------------------------------------------------------------

test('the engine still has no feline path', () => {
  // The day this fails is the day the gate can come out. Until then it is the
  // justification for refusing, kept next to the refusal.
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'protocol-generator.js'), 'utf8');
  assert.ok(
    !/species/i.test(src),
    'protocol-generator.js now mentions species. If it can select feline ' +
    'exercises, remove the gate in engine-adapter.js and delete this test'
  );
  const feline = ALL_EXERCISES.filter((e) => /^FELINE/.test(e.code));
  assert.ok(
    feline.length > 0,
    'the library holds feline exercises the generator cannot reach — that is ' +
    'the whole point of the gate'
  );
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`feline-gate: ${passed} passed`);
