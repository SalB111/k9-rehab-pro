/**
 * Record gaps — tests
 *
 * WHAT THIS PROTECTS
 *
 * The generator does not refuse an incomplete record. It reasons from whatever
 * it is given, so every one of these produces a protocol that looks finished:
 *
 *   no condition        -> a general conditioning protocol, and the safety
 *                          gates for the real presentation never fire
 *   no surgery date     -> no recovery phase, nothing can be staged
 *   no medical history  -> the contraindication scan runs over an empty string
 *                          and finds nothing, which is exactly what "no
 *                          contraindications" looks like
 *   unstated equipment  -> that therapy is withheld from every protocol in the
 *                          practice
 *
 * So the severity attached to each gap is not decoration. It is the difference
 * between "this will not generate" and "this will generate and be wrong", and
 * a clinician deciding what to fix before a visit is reading it.
 *
 *   node v2/patient-gaps.test.js
 */

'use strict';

const assert = require('assert');
const gaps = require('./patient-gaps');
const { validateIntake } = require('../protocol-generator');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

const find = (r, label) => r.gaps.find((g) => g.label === label);

/** A record with everything the generator reads from it. */
const COMPLETE = {
  id: 1, name: 'Bella', client_name: 'Sarah Thompson',
  condition: 'TPLO Post-Op', affected_region: 'Right stifle',
  surgery_date: '2026-03-21', age: 2, weight: 64,
  medical_history: 'R CCL rupture, TPLO 2026-03-21.',
  current_medications: 'None',
  special_instructions: 'Leash-only x 8 weeks.',
  // Added 2026-09-26. These four became reportable gaps when patient
  // registration stopped inventing them (lameness 0, BCS 5, pain 5/10,
  // mobility "Moderate"), so a record without them is no longer complete —
  // which is the point of the change. A fixture may carry invented values; a
  // patient record may not.
  pain_level: 3, lameness_grade: 2,
  mobility_level: 'Moderate', body_condition_score: 5,
};

// ---------------------------------------------------------------------------
// Severity means something
// ---------------------------------------------------------------------------

test('a complete record has no gaps and is ready', () => {
  const r = gaps.findGaps(COMPLETE, { unstated: [] });
  assert.deepStrictEqual(r.gaps, [], `unexpected gaps: ${JSON.stringify(r.gaps.map((g) => g.label))}`);
  assert.strictEqual(r.ready, true);
  assert.strictEqual(r.blocking, 0);
});

test('the fields the engine hard-errors on are marked BLOCKS', () => {
  // Verified against the engine rather than asserted: these are the two it
  // refuses on, and a third field marked BLOCKS that the engine tolerates
  // would send a clinician chasing something that is not stopping them.
  const { errors } = validateIntake({ diagnosis: 'x' });
  assert.ok(errors.some((e) => /Patient name is required/i.test(e)));
  assert.ok(errors.some((e) => /Client name is required/i.test(e)));

  const r = gaps.findGaps({ id: 1 }, { unstated: [] });
  assert.strictEqual(find(r, 'Patient name').severity, 'BLOCKS');
  assert.strictEqual(find(r, 'Client name').severity, 'BLOCKS');
  assert.strictEqual(r.ready, false);
  assert.ok(r.blocking >= 2);
});

test('a missing condition blocks, because everything is reasoned from it', () => {
  const r = gaps.findGaps({ ...COMPLETE, condition: null }, { unstated: [] });
  assert.strictEqual(find(r, 'Condition').severity, 'BLOCKS');
  assert.strictEqual(r.ready, false);
});

test('a missing history degrades rather than blocks', () => {
  const r = gaps.findGaps({ ...COMPLETE, medical_history: null }, { unstated: [] });
  assert.strictEqual(find(r, 'Medical history').severity, 'DEGRADES');
  assert.strictEqual(r.ready, true, 'it must not claim generation is blocked when it is not');
});

test('gaps come back worst-first', () => {
  // Weak by construction, and worth saying so: FIELDS is currently DECLARED in
  // severity order and clinic gaps are appended last, so the sort in findGaps
  // is a no-op today and removing it does not fail this. It earns its place the
  // first time someone adds a BLOCKS field to the end of FIELDS — which is
  // exactly when a clinician would otherwise find "generation is blocked"
  // below three things that merely weaken the protocol.
  const r = gaps.findGaps({ id: 1, condition: null, medical_history: null }, {
    unstated: ['modality_laser'],
  });
  const rank = { BLOCKS: 0, DEGRADES: 1, WITHHOLDS: 2 };
  const order = r.gaps.map((g) => g.severity);
  for (let i = 1; i < order.length; i += 1) {
    assert.ok(rank[order[i]] >= rank[order[i - 1]], `out of order at ${i}: ${JSON.stringify(order)}`);
  }
});

test('every severity a field can carry has a rank to sort by', () => {
  // This is the part that would actually break. A new severity added to
  // SEVERITY without a rank sorts as undefined, which puts it in an arbitrary
  // place rather than an obviously wrong one.
  const ranked = { BLOCKS: 0, DEGRADES: 1, WITHHOLDS: 2 };
  for (const name of Object.keys(gaps.SEVERITY)) {
    assert.ok(
      ranked[name] !== undefined,
      `severity "${name}" has no sort rank — it would order unpredictably`
    );
  }
  for (const f of gaps.FIELDS) {
    assert.ok(
      gaps.SEVERITY[f.severity],
      `${f.label} carries severity "${f.severity}", which is not one of ${Object.keys(gaps.SEVERITY)}`
    );
  }
});

// ---------------------------------------------------------------------------
// Zero is missing for the fields where zero is impossible
// ---------------------------------------------------------------------------

test('an age of zero is a gap, not a value', () => {
  // A live record held age 0 on a ten-year-old Australian Shepherd. Treating 0
  // as "filled in" is how it stayed that way.
  const r = gaps.findGaps({ ...COMPLETE, age: 0 }, { unstated: [] });
  assert.ok(find(r, 'Age'), 'an age of 0 must be reported as missing');
});

test('a weight of zero is a gap', () => {
  const r = gaps.findGaps({ ...COMPLETE, weight: 0 }, { unstated: [] });
  assert.ok(find(r, 'Weight'), 'a weight of 0 must be reported as missing');
});

// ---------------------------------------------------------------------------
// Surgery date is only asked of surgical cases
// ---------------------------------------------------------------------------

test('a surgical presentation with no date is a gap', () => {
  const r = gaps.findGaps({ ...COMPLETE, surgery_date: null }, { unstated: [] });
  assert.ok(find(r, 'Surgery date'), 'a TPLO with no date must be reported');
});

test('a medically managed patient is not asked for a surgery date', () => {
  const r = gaps.findGaps({
    ...COMPLETE, condition: 'Bilateral hip osteoarthritis',
    affected_region: 'Both hips', surgery_date: null,
  }, { unstated: [] });
  assert.ok(
    !find(r, 'Surgery date'),
    'asking a conservatively managed dog for a surgery date sends a clinician ' +
    'looking for something that does not exist'
  );
});

// ---------------------------------------------------------------------------
// Equipment is a practice-wide gap, not a patient one
// ---------------------------------------------------------------------------

test('unstated equipment is reported as withholding therapy', () => {
  const r = gaps.findGaps(COMPLETE, { unstated: ['modality_laser', 'modality_shockwave'] });
  const laser = r.gaps.find((g) => g.engine === 'modality_laser');
  assert.ok(laser, 'an unanswered capability must be reported');
  assert.strictEqual(laser.severity, 'WITHHOLDS');
  assert.strictEqual(laser.clinic, true, 'it must be marked clinic-wide, not per patient');
  assert.strictEqual(laser.column, null, 'there is no patient column to write it to');
  assert.strictEqual(r.ready, true, 'missing equipment does not block generation');
});

test('a fully answered equipment profile produces no equipment gaps', () => {
  const r = gaps.findGaps(COMPLETE, { unstated: [] });
  assert.ok(!r.gaps.some((g) => g.clinic), 'nothing unanswered, nothing to report');
});

// ---------------------------------------------------------------------------
// The V1 record answers what it can
// ---------------------------------------------------------------------------

const WITH_V1 = {
  id: 11, name: 'Louie', client_name: 'Owner',
  condition: 'Hip dysplasia', age: 0, weight: 48,
  dashboard_data: JSON.stringify({
    'client::Age (years)': '10',
    'treatment::Affected Limb(s)': 'Left hindlimb (LH)',
    'assessment::Current Pain Medications': 'Gabapentin and Carprofen',
    'assessment::Relevant Medical & Surgical History': 'no previous injury',
  }),
};

test('a gap the V1 record can answer comes with the answer', () => {
  const r = gaps.findGaps(WITH_V1, { unstated: [] });
  const meds = find(r, 'Current medications');
  assert.ok(meds, 'medications are missing from the columns');
  assert.ok(meds.suggestion, 'the V1 record holds them and must offer them');
  assert.strictEqual(meds.suggestion.value, 'Gabapentin and Carprofen');
});

test('a suggestion says where it came from', () => {
  // Nobody should accept a value into a clinical record without being able to
  // see what it was read from.
  const r = gaps.findGaps(WITH_V1, { unstated: [] });
  for (const g of r.gaps.filter((x) => x.suggestion)) {
    assert.ok(g.suggestion.source, `${g.label} offers a value with no source`);
    assert.ok(g.suggestion.raw !== undefined, `${g.label} does not carry the original text`);
  }
});

test('an age of zero is answered from the V1 record', () => {
  const r = gaps.findGaps(WITH_V1, { unstated: [] });
  const age = find(r, 'Age');
  assert.ok(age && age.suggestion, 'the V1 record holds the age and must offer it');
  assert.strictEqual(age.suggestion.value, 10);
});

test('nothing is suggested when the V1 record is silent', () => {
  const r = gaps.findGaps({ id: 3, name: 'X', client_name: 'Y', condition: 'OA' }, { unstated: [] });
  for (const g of r.gaps) {
    assert.strictEqual(g.suggestion, null, `${g.label} invented a suggestion from nowhere`);
  }
});

test('a suggestion is never counted as filled in', () => {
  // The whole point. A value offered from the V1 record is still a gap until a
  // person accepts it — findGaps reports it as missing AND offers the answer.
  const r = gaps.findGaps(WITH_V1, { unstated: [] });
  assert.ok(r.gaps.length > 0, 'offering answers must not make the gaps disappear');
  assert.ok(r.fromRecord > 0, 'and the count of answerable ones must be reported');
});

// ---------------------------------------------------------------------------
// Disagreements travel with the gaps
// ---------------------------------------------------------------------------

test('a column that disagrees with the V1 record is surfaced', () => {
  const r = gaps.findGaps(WITH_V1, { unstated: [] });
  assert.ok(
    r.conflicts.some((c) => c.field === 'Age'),
    'age 0 against a V1 record of 10 must be reported as a disagreement'
  );
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`patient-gaps: ${passed} passed`);
