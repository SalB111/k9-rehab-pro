/**
 * Patient weight — units and conversion — tests
 *
 * WHAT THIS PROTECTS
 *
 * `patients.weight` holds POUNDS. Every record was written that way, and two
 * V2 screens disagreed with it: the registration form hinted "Kilograms." and
 * the snapshot rendered a 68 lb Labrador as "68kg". Anyone who believed the
 * hint and typed 31 created a record meaning 31 lbs.
 *
 * The product now enters weight in either unit and converts, so nobody does
 * the arithmetic. That only stays safe while three things hold:
 *
 *   1. The conversion is correct in both directions.
 *   2. A non-weight — blank, zero, negative, text — converts to nothing at
 *      all, rather than to a stale or nonsense number sitting in the other
 *      box next to a real one.
 *   3. There is exactly ONE definition of the factor. A second copy is how
 *      the two boxes come to disagree by a rounding step.
 *
 *   node v2/weight-units.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FRONTEND = path.join(__dirname, '..', '..', 'k9-rehab-frontend', 'src');
const WEIGHT_MODULE = path.join(FRONTEND, 'constants', 'weight.js');

/**
 * Load the real UI module.
 *
 * Read and evaluated rather than imported because it is browser ESM and this
 * suite is CommonJS. It has no imports of its own, so stripping the `export`
 * keyword leaves a module that runs as-is — and this tests the actual file the
 * form uses, with no second copy to drift from it.
 */
function loadWeightModule() {
  const src = fs.readFileSync(WEIGHT_MODULE, 'utf8');
  return vm.runInNewContext(
    src.replace(/^export /gm, '') +
    ';({ LB_PER_KG, lbsToKg, kgToLbs, formatWeight })'
  );
}

const { LB_PER_KG, lbsToKg, kgToLbs, formatWeight } = loadWeightModule();

let passed = 0;
const failures = [];

function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

// ---------------------------------------------------------------------------
// The conversion itself
// ---------------------------------------------------------------------------

test('the factor is the published one', () => {
  assert.strictEqual(LB_PER_KG, 2.20462);
});

test('Bella converts correctly — 68 lbs is a normal Labrador, not a giant one', () => {
  // The record that exposed this. 68 lbs is 30.8 kg; the snapshot was calling
  // it 68 kg, which would be a morbidly obese dog and a different protocol.
  assert.strictEqual(lbsToKg(68), 30.8);
});

test('kg to lbs converts correctly', () => {
  assert.strictEqual(kgToLbs(30.8), 67.9);
});

test('round-tripping stays within one decimal place', () => {
  // Deliberately asserted rather than assumed. Both boxes round to 0.1, so a
  // round trip can move by up to that much — which is correct and must not be
  // "fixed" by storing more precision than a scale gives.
  for (const lbs of [5, 12.4, 45, 68, 130.6, 200]) {
    const back = kgToLbs(lbsToKg(lbs));
    assert.ok(
      Math.abs(back - lbs) <= 0.1,
      `${lbs} lbs round-tripped to ${back} lbs, a drift of ${Math.abs(back - lbs).toFixed(2)}`
    );
  }
});

test('both conversions round to one decimal place', () => {
  const decimals = (n) => (String(n).split('.')[1] || '').length;
  assert.ok(decimals(lbsToKg(68)) <= 1, 'lbsToKg returned more than one decimal');
  assert.ok(decimals(kgToLbs(31)) <= 1, 'kgToLbs returned more than one decimal');
});

// ---------------------------------------------------------------------------
// Non-weights convert to nothing — the invariant that keeps the boxes honest
// ---------------------------------------------------------------------------

test('a non-weight converts to null rather than to a number', () => {
  for (const bad of ['', '   ', 'abc', null, undefined, NaN, 0, '0', -5, '-5', Infinity]) {
    assert.strictEqual(
      lbsToKg(bad), null,
      `lbsToKg(${JSON.stringify(bad)}) returned a value. The form renders whatever ` +
      `comes back, so anything but null puts a fabricated weight on screen`
    );
    assert.strictEqual(kgToLbs(bad), null, `kgToLbs(${JSON.stringify(bad)}) returned a value`);
  }
});

test('numeric strings convert — a form field hands over text', () => {
  assert.strictEqual(lbsToKg('68'), 30.8);
  assert.strictEqual(lbsToKg('68.0'), 30.8);
});

// ---------------------------------------------------------------------------
// Display — a weight on screen always carries its unit
// ---------------------------------------------------------------------------

test('formatWeight shows both units', () => {
  assert.strictEqual(formatWeight(68), '68 lbs (30.8 kg)');
});

test('formatWeight returns empty for an absent weight, never a bare unit', () => {
  for (const bad of ['', null, undefined, 0, 'abc']) {
    assert.strictEqual(
      formatWeight(bad), '',
      `formatWeight(${JSON.stringify(bad)}) produced text. The snapshot joins on " · " ` +
      `and filters falsy values, so anything non-empty renders as a real weight`
    );
  }
});

// ---------------------------------------------------------------------------
// One definition of the factor
// ---------------------------------------------------------------------------

test('nothing in the V2 clinical UI inlines the conversion factor', () => {
  // The V1 dashboard (DashboardView.jsx) still carries its own copy in
  // WeightPair. That is known and deliberately left alone — it is a live
  // 4,000-line file and the duplication is recorded rather than risked. This
  // guard keeps the NEW surface from growing a third copy.
  const dir = path.join(FRONTEND, 'pages', 'clinical');
  const offenders = [];
  for (const name of fs.readdirSync(dir)) {
    if (!/\.jsx?$/.test(name)) continue;
    const body = fs.readFileSync(path.join(dir, name), 'utf8');
    if (/2\.2046/.test(body)) offenders.push(name);
  }
  assert.deepStrictEqual(
    offenders, [],
    `${offenders.join(', ')} inline the lbs/kg factor. Import it from ` +
    `constants/weight.js — two copies is how the two boxes come to disagree`
  );
});

test('the registration form does not submit the converted kilogram value', () => {
  // weight_kg is a display field. If it ever reaches onCreate, the record gains
  // a second weight in a different unit and nothing downstream knows which is
  // authoritative.
  const form = fs.readFileSync(path.join(FRONTEND, 'pages', 'clinical', 'NewPatient.jsx'), 'utf8');
  assert.ok(
    /const \{ weight_kg, \.\.\.record \} = f;/.test(form),
    'NewPatient.jsx no longer strips weight_kg before submit — pounds must be the only stored unit'
  );
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`weight-units: ${passed} passed`);
