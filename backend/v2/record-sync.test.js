/**
 * Record sync — tests
 *
 * WHAT THIS PROTECTS
 *
 * Two screens record the same animal in two places, and nothing kept them in
 * step. One record said Bella was six years old and 68 lbs while the other
 * said two and 64, with a date of birth that agreed with the two. Another said
 * a ten-year-old Australian Shepherd was aged 0. Both screens were right; they
 * were answering from different places.
 *
 * The reconciler runs on every write through PUT /api/patients/:id. Three
 * things must hold, and the third is the one that would break the V1 screens
 * if it were got wrong:
 *
 *   1. The REQUEST always wins. Sync fills gaps and propagates the edit that
 *      was just made. It never overrules two values that are both filled in,
 *      because choosing between them is a clinical judgement.
 *
 *   2. Plain facts sync BOTH ways. Correct an age in either screen and the
 *      other agrees, or the next save from the other side pushes the stale
 *      value straight back.
 *
 *   3. Clinical vocabularies sync ONE way, V1 into the columns. The V1
 *      controls are dropdowns, and a select whose value matches none of its
 *      options renders BLANK — which is exactly what four spellings of
 *      "Female — Spayed" did to every patient's sex field. Writing a column
 *      value into a V1 dropdown would do it again, deliberately.
 *
 *   node v2/record-sync.test.js
 */

'use strict';

const assert = require('assert');
const sync = require('./record-sync');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

const BLOB = (extra = {}) => JSON.stringify({
  'client::Patient Name': 'Bella',
  'client::Age (years)': '2',
  'client::Weight (lbs)': '64',
  'client::Weight (kg)': '29.0',
  'client::Breed': 'Labrador Retriever',
  'treatment::Surgery Date': '2026-03-21',
  'treatment::Weight Bearing Status': 'Partial weight bearing (PWB)',
  'treatment::Affected Limb(s)': 'Right hindlimb (RH)',
  'assessment::Relevant Medical & Surgical History': 'TPLO, uneventful.',
  ...extra,
});

// ---------------------------------------------------------------------------
// The request always wins
// ---------------------------------------------------------------------------

test('a value in the request is never overwritten by the clinical record', () => {
  const r = sync.reconcile({
    existing: { id: 1, age: null, dashboard_data: BLOB() },
    updates: { age: 7 },
  });
  assert.strictEqual(r.columns.age, undefined, 'the request set age; sync must not touch it');
});

test('a column that is already filled is left alone', () => {
  // Two filled values that disagree is a clinical question, not a merge.
  const r = sync.reconcile({
    existing: { id: 1, age: 6, dashboard_data: BLOB() },
    updates: {},
  });
  assert.strictEqual(r.columns.age, undefined, 'six against two is for a clinician to settle');
});

test('an empty column is filled from the clinical record', () => {
  const r = sync.reconcile({
    existing: { id: 1, age: null, weight: null, dashboard_data: BLOB() },
    updates: {},
  });
  assert.strictEqual(r.columns.age, 2);
  assert.strictEqual(r.columns.weight, 64);
});

test('a stored zero counts as empty', () => {
  // The ten-year-old recorded as aged 0.
  const r = sync.reconcile({
    existing: { id: 11, age: 0, dashboard_data: JSON.stringify({ 'client::Age (years)': '10' }) },
    updates: {},
  });
  assert.strictEqual(r.columns.age, 10);
});

// ---------------------------------------------------------------------------
// Plain facts go both ways
// ---------------------------------------------------------------------------

test('correcting an age in the workflow updates the clinical record too', () => {
  // Without this the V1 dashboard keeps showing the old age, and its next save
  // pushes the stale value straight back into the column.
  const r = sync.reconcile({
    existing: { id: 1, age: 6, dashboard_data: BLOB({ 'client::Age (years)': '6' }) },
    updates: { age: 2 },
  });
  assert.ok(r.dashboardData, 'the clinical record must be rewritten');
  assert.strictEqual(r.dashboardData['client::Age (years)'], '2');
});

test('correcting a weight keeps the record’s kilograms honest', () => {
  // The V1 record stores pounds AND kilograms. Two renderings of one fact that
  // disagree is the whole problem this module exists for.
  const r = sync.reconcile({
    existing: { id: 1, weight: 68, dashboard_data: BLOB({ 'client::Weight (lbs)': '68', 'client::Weight (kg)': '30.8' }) },
    updates: { weight: 64 },
  });
  assert.strictEqual(r.dashboardData['client::Weight (lbs)'], '64');
  assert.strictEqual(r.dashboardData['client::Weight (kg)'], '29');
});

test('a write that changes nothing does not rewrite the clinical record', () => {
  const r = sync.reconcile({
    existing: { id: 1, age: 2, dashboard_data: BLOB() },
    updates: { age: 2 },
  });
  assert.strictEqual(r.dashboardData, null, 'an unchanged value is not an edit');
});

// ---------------------------------------------------------------------------
// Clinical vocabularies go ONE way only
// ---------------------------------------------------------------------------

test('a column value is never written into a V1 dropdown', () => {
  // The V1 controls are selects. "Right stifle" is not one of the options in
  // Affected Limb(s) — writing it there makes the field render blank, which is
  // exactly what happened to every patient's sex until 22 Sep 2026.
  const r = sync.reconcile({
    existing: { id: 1, dashboard_data: BLOB() },
    updates: { affected_region: 'Right stifle', condition: 'TPLO Post-Op' },
  });
  if (r.dashboardData) {
    assert.strictEqual(
      r.dashboardData['treatment::Affected Limb(s)'], 'Right hindlimb (RH)',
      'the V1 limb field must keep its own vocabulary'
    );
  }
});

test('no clinical-vocabulary key is ever in the two-way set', () => {
  const twoWayKeys = sync.TWO_WAY.map((f) => f.key);
  const dropdowns = [
    'treatment::Weight Bearing Status',
    'treatment::Incision Status',
    'treatment::Affected Limb(s)',
    'assessment::Deep Pain Perception',
    'assessment::Lameness Grade',
    'client::Sex',
  ];
  for (const k of dropdowns) {
    assert.ok(
      !twoWayKeys.includes(k),
      `"${k}" is a dropdown in the V1 dashboard. Writing a column value back ` +
      `into it renders the field blank when the value is not one of its options`
    );
  }
});

test('the clinical vocabulary still reaches the columns', () => {
  const r = sync.reconcile({
    existing: {
      id: 1, affected_region: null, medical_history: null,
      dashboard_data: BLOB({ 'treatment::Affected Area': 'Stifle - right' }),
    },
    updates: {},
  });
  assert.strictEqual(r.columns.affected_region, 'Stifle - right');
  assert.match(r.columns.medical_history, /TPLO, uneventful/);
});

test('a LIMB never gets written into the affected_region column', () => {
  // This direction matters more than the read does. The bridge offering a
  // wrong-vocabulary value to a proposal is something a clinician confirms;
  // record-sync WRITES it into the column, where it becomes the stored answer
  // and every later read takes it as fact. `getProtocolType` string-matches
  // that column against an anatomical vocabulary, so a limb sitting in it
  // routes a different protocol - silently, and permanently.
  //
  // The fixture has a limb and no Affected Area, which is the ordinary case.
  // The column must stay EMPTY: an unanswered region is a gap the record-gap
  // check reports, and a wrong region is not.
  const r = sync.reconcile({
    existing: { id: 1, affected_region: null, dashboard_data: BLOB() },
    updates: {},
  });
  assert.strictEqual(r.columns.affected_region, undefined,
    'a limb was written into the region column - see rule 3 in dashboard-bridge.js');
  assert.ok(
    !r.notes.some((n) => /affected_region/.test(n)),
    'it must not report having filled a column it did not fill'
  );
});

// ---------------------------------------------------------------------------
// Robustness — this runs on every patient write
// ---------------------------------------------------------------------------

test('a patient with no clinical record is left entirely alone', () => {
  const r = sync.reconcile({ existing: { id: 5, age: null }, updates: { name: 'X' } });
  assert.deepStrictEqual(r.columns, {});
  assert.strictEqual(r.dashboardData, null);
});

test('a corrupt clinical record does not break a write', () => {
  for (const bad of ['{not json', 'null', '', '[]', 42]) {
    const r = sync.reconcile({ existing: { id: 1, dashboard_data: bad }, updates: { age: 3 } });
    assert.ok(r && typeof r === 'object', `${JSON.stringify(bad)} broke the reconciler`);
  }
});

test('a V1 save carries its own blob through', () => {
  const incoming = { 'client::Age (years)': '4' };
  const r = sync.reconcile({
    existing: { id: 1, age: null, dashboard_data: BLOB() },
    updates: {},
    incomingBlob: incoming,
  });
  assert.strictEqual(r.dashboardData['client::Age (years)'], '4', 'the incoming blob is what gets stored');
  assert.strictEqual(r.columns.age, 4, 'and the column follows the blob being saved, not the old one');
});

test('every reconciliation says what it did', () => {
  const r = sync.reconcile({
    existing: { id: 1, age: null, weight: 68, dashboard_data: BLOB() },
    updates: { weight: 64 },
  });
  assert.ok(r.notes.length > 0, 'a silent reconciliation is one nobody can audit');
  assert.ok(r.notes.some((n) => /age/.test(n)));
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`record-sync: ${passed} passed`);
