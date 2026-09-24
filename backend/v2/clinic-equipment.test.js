/**
 * The clinic equipment record — tests
 *
 * WHAT THIS PROTECTS
 *
 * Equipment is a property of the practice, and both apps asked about it
 * separately. The V1 panel wrote through the patient form context, so it
 * landed in `patients.dashboard_data` and EVERY PATIENT CARRIED A PRIVATE
 * PARTIAL COPY of the clinic's list — 9, 19, 14, 13 and 12 of 43 items
 * answered across five patients. V2 kept one row per clinic and the engine
 * read only that. Neither could see the other.
 *
 * They are one record now, and these tests hold the two properties that make
 * that safe:
 *
 *   1. The ten engine booleans are DERIVED from the checklist, never stored
 *      independently. Two fields for one fact is how they drifted.
 *   2. Unanswered stays unanswered. The engine treats null differently from
 *      false, and collapsing them means a clinic that has not finished the
 *      form silently loses therapies it owns.
 *
 *   node v2/clinic-equipment.test.js
 */

'use strict';

const assert = require('assert');
const eq = require('./clinic-equipment');
const contract = require('./contracts/k9-engine-input-contract.json');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

// ---------------------------------------------------------------------------
// The checklist, and what it gates
// ---------------------------------------------------------------------------

test('every engine enablement gate has an item behind it', () => {
  // The fails-restrictive direction is silent by definition: a modality the
  // engine gains with no item to enable it becomes permanently unavailable to
  // every clinic and nothing errors. Raised at boot instead.
  assert.doesNotThrow(() => eq.assertCoversEngineGates(contract));
});

test('the coverage guard actually fails when a gate loses its item', () => {
  // The guard is worthless if it cannot fail. This is also how the guard caught
  // a real bug on first run: a naive camelCase-to-snake_case turned
  // modalityUWTM into modality_u_w_t_m and reported five false gaps.
  const fake = {
    omission_semantics: { fails_restrictive_if_omitted: ['modalityUnicorn'] },
  };
  assert.throws(() => eq.assertCoversEngineGates(fake), /modalityUnicorn/);
});

test('each capability is enabled by exactly one item', () => {
  // A capability fed by two items needs a rule for when they disagree, and the
  // honest rule is the 1:1 map itself.
  const counts = {};
  for (const cap of Object.values(eq.TO_CAPABILITY)) counts[cap] = (counts[cap] || 0) + 1;
  for (const [cap, n] of Object.entries(counts)) {
    assert.strictEqual(n, 1, `${cap} is enabled by ${n} items`);
  }
});

test('every gating item is a real item on the checklist', () => {
  for (const item of Object.keys(eq.TO_CAPABILITY)) {
    assert.ok(eq.ALL_ITEMS.includes(item), `"${item}" gates a capability but is not on the checklist`);
  }
});

test('the three deliberate non-mappings stay unmapped', () => {
  // Each is a clinical judgement recorded in the module, not an oversight:
  //   Class IIIb Laser  — the engine's exercise is LASER_IV, a Class IV
  //     protocol a IIIb device cannot deliver.
  //   Infrared Therapy  — heating, but not the moist-heat thermotherapy the
  //     engine's HEAT_THERAPY describes.
  //   Cold Water Spa    — aquatic, but not a pool a dog is walked in, and not
  //     a cryotherapy unit.
  for (const item of ['Class IIIb Laser', 'Infrared Therapy', 'Cold Water Spa / Whirlpool']) {
    assert.ok(eq.ALL_ITEMS.includes(item), `"${item}" is no longer on the checklist`);
    assert.strictEqual(
      eq.TO_CAPABILITY[item], undefined,
      `"${item}" now enables ${eq.TO_CAPABILITY[item]}. Read the note above ` +
      `TO_CAPABILITY before changing this — it prescribes a therapy on equipment ` +
      `that cannot deliver it`
    );
  }
});

// ---------------------------------------------------------------------------
// Derivation — the reason the two records can no longer drift
// ---------------------------------------------------------------------------

test('a ticked item makes its capability available', () => {
  const d = eq.deriveCapabilities({ 'Shockwave Therapy': true });
  assert.strictEqual(d.modality_shockwave, true);
});

test('an unticked item makes its capability unavailable', () => {
  const d = eq.deriveCapabilities({ 'Shockwave Therapy': false });
  assert.strictEqual(d.modality_shockwave, false);
});

test('an unanswered item leaves its capability UNSTATED, not false', () => {
  // The whole point. A brand-new hospital has answered nothing, and the engine
  // treats null as "unavailable" — so every modality is withheld until someone
  // finds the form. That silence has to stay visible as silence.
  const d = eq.deriveCapabilities({});
  for (const cap of Object.values(eq.TO_CAPABILITY)) {
    assert.strictEqual(d[cap], null, `${cap} should be unstated, got ${JSON.stringify(d[cap])}`);
  }
});

test('deriving returns every capability, always', () => {
  // A missing key is a dropped enablement gate, which withholds therapy with
  // no error anywhere.
  const d = eq.deriveCapabilities({ 'TENS Unit': true });
  assert.deepStrictEqual(
    Object.keys(d).sort(), Object.values(eq.TO_CAPABILITY).sort()
  );
});

test('checklist and capabilities round-trip without losing a state', () => {
  for (const value of [true, false, null]) {
    const checklist = Object.fromEntries(Object.keys(eq.TO_CAPABILITY).map((i) => [i, value]));
    const caps = eq.deriveCapabilities(checklist);
    const back = eq.capabilitiesToChecklist(caps);
    for (const item of Object.keys(eq.TO_CAPABILITY)) {
      assert.strictEqual(back[item], value, `${item} lost ${JSON.stringify(value)} on the round trip`);
    }
  }
});

// ---------------------------------------------------------------------------
// Reading the five per-patient copies
// ---------------------------------------------------------------------------

test('a V1 per-patient answer set reads into checklist form', () => {
  const { checked } = eq.readLegacy({
    'equipment::Hydrotherapy::Underwater Treadmill (UWTM)': 'true',
    'equipment::Electrotherapy & Modalities::Shockwave Therapy': '',
    'assessment::Lameness Grade': 'Grade 2 — Mild, consistent',
  });
  assert.strictEqual(checked['Underwater Treadmill (UWTM)'], true);
  assert.strictEqual(checked['Shockwave Therapy'], null, 'an empty string is unanswered, not "no"');
  assert.ok(!('Lameness Grade' in checked), 'only equipment:: keys are read');
});

test('an item the checklist no longer recognises is reported, not dropped', () => {
  // Keys are labels, so renaming an item in the V1 panel orphans everything
  // stored under the old name. Reporting it is how that becomes visible.
  const { checked, unknown } = eq.readLegacy({
    'equipment::Hydrotherapy::Hydro Treadmill (old name)': 'true',
  });
  assert.deepStrictEqual(checked, {});
  assert.strictEqual(unknown.length, 1);
  assert.match(unknown[0].key, /Hydro Treadmill/);
});

test('an empty or malformed blob reads as nothing, not as denial', () => {
  for (const blob of [{}, null, undefined]) {
    const { checked, unknown } = eq.readLegacy(blob || {});
    assert.deepStrictEqual(checked, {});
    assert.deepStrictEqual(unknown, []);
  }
});

test('the union of partial copies loses nothing', () => {
  // Five patients answered 9, 19, 14, 13 and 12 of 43 and contradicted each
  // other on nothing. Folding them is addition, not arbitration.
  const a = eq.readLegacy({ 'equipment::Hydrotherapy::Underwater Treadmill (UWTM)': 'true' }).checked;
  const b = eq.readLegacy({ 'equipment::Electrotherapy & Modalities::TENS Unit': 'true' }).checked;
  const union = { ...a, ...b };
  const caps = eq.deriveCapabilities(union);
  assert.strictEqual(caps.modality_uwtm, true);
  assert.strictEqual(caps.modality_tens, true);
  assert.strictEqual(caps.modality_shockwave, null, 'what neither answered stays unanswered');
});

// ---------------------------------------------------------------------------
// The checklist itself
// ---------------------------------------------------------------------------

test('every item belongs to exactly one category', () => {
  const seen = new Set();
  for (const item of eq.ALL_ITEMS) {
    assert.ok(!seen.has(item), `"${item}" appears twice on the checklist`);
    seen.add(item);
    assert.ok(eq.categoryOf(item), `"${item}" has no category`);
  }
});

test('gating and inventory together account for the whole checklist', () => {
  const gating = Object.keys(eq.TO_CAPABILITY).length;
  assert.strictEqual(
    gating + eq.INVENTORY_ONLY.length, eq.ALL_ITEMS.length,
    'an item is either a gate or inventory; it cannot be neither or both'
  );
});

test('the legacy storage key is the one the V1 panel writes', () => {
  assert.strictEqual(
    eq.legacyKey('Hydrotherapy', 'Underwater Treadmill (UWTM)'),
    'equipment::Hydrotherapy::Underwater Treadmill (UWTM)'
  );
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`clinic-equipment: ${passed} passed`);
