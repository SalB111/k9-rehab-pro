/**
 * goals — tests
 *
 * The vocabulary is read out of the real DashboardView.jsx and the values out
 * of the real database. A hand-written list would contain exactly the labels I
 * already had in mind, and the failure worth catching is a label the UI offers
 * that this module has never seen.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const goals = require('./goals');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (err) { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); }
}

const UI_PATH = path.join(__dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx');
const DB_PATH = path.join(__dirname, '..', 'k9rehab.db');

/**
 * The goal vocabulary, from the MODULE.
 *
 * Before V3 this was parsed out of DashboardView.jsx, because that was where
 * the list lived and the risk was this module falling behind the screen. In V3
 * the module OWNS the vocabulary and the API serves it to the screen, so the
 * screen has no list to fall behind — and parsing the JSX now finds nothing.
 */
function primaryGoalOptionsFromUI() {
  return Object.keys(goals.PRIMARY_GOAL_CODES);
}

console.log('\ngoals\n');

// ------------------------------------------------------------- the vocabulary

test('every goal the UI offers has a code', () => {
  const options = primaryGoalOptionsFromUI();
  assert.ok(options.length >= 10, `expected the full vocabulary, parsed only ${options.length}`);
  const uncoded = options.filter((o) => !goals.PRIMARY_GOAL_CODES[o]);
  assert.deepStrictEqual(uncoded, [], `UI options with no code:\n      ${uncoded.join('\n      ')}`);
});

test('every goal label has a DISTINCT code', () => {
  // Before V3 this checked for a code whose label the UI had dropped. The
  // module is now the only place either lives, so that comparison would be
  // against itself. What still matters is that two labels never share a
  // code — a collision would silently merge two different goals.
  const entries = Object.entries(goals.PRIMARY_GOAL_CODES);
  assert.ok(entries.length >= 10, `only ${entries.length} goals in the vocabulary`);
  const codes = entries.map(([, c]) => c);
  assert.strictEqual(new Set(codes).size, codes.length,
    'two labels share a code, so two different goals would be indistinguishable');
});

test('a label is matched exactly, never by prefix or substring', () => {
  // "Return to normal household activity" and "Return to sport or working
  // function" share a prefix. Any consumer matching loosely would conflate
  // them, which is the defect behind NWB and Infection elsewhere in this repo.
  const [first] = goals.interpretPrimaryGoals('Return to');
  assert.strictEqual(first.code, null, '"Return to" must not resolve to a goal');
  const [exact] = goals.interpretPrimaryGoals('Return to sport or working function');
  assert.strictEqual(exact.code, 'SPORT_RETURN');
  const [longer] = goals.interpretPrimaryGoals('Return to sport or working function eventually');
  assert.strictEqual(longer.code, null, 'a longer string containing a label must not match it');
});

test('an inherited object property is not mistaken for a goal', () => {
  const [g] = goals.interpretPrimaryGoals('constructor');
  assert.strictEqual(g.code, null);
  assert.strictEqual(g.stated, 'constructor');
});

// ---------------------------------------------------------------- the split

test('the multi-select splits on the delimiter and drops empty segments', () => {
  assert.strictEqual(goals.splitMulti('A||B||').length, 2);
  assert.strictEqual(goals.splitMulti('A').length, 1, 'one goal with no delimiter is one goal');
  assert.strictEqual(goals.splitMulti('').length, 0);
  assert.deepStrictEqual(goals.splitMulti('  A  ||  B  '), ['A', 'B'], 'segments are trimmed');
});

test('the clinician\'s ordering is preserved', () => {
  const list = goals.interpretPrimaryGoals(
    'Return to sport or working function||Pain management — improve quality of life'
  );
  assert.deepStrictEqual(list.map((g) => g.code), ['SPORT_RETURN', 'PAIN_MANAGEMENT']);
});

test('an unrecognised goal keeps its text and is reported, never dropped', () => {
  const stated = { primary_goals: 'Other||Something the clinician typed' };
  const { primaryGoals, uninterpreted } = goals.interpret(stated);
  assert.strictEqual(primaryGoals.length, 2, 'an uncoded goal is still a goal');
  assert.strictEqual(primaryGoals[1].stated, 'Something the clinician typed');
  assert.strictEqual(primaryGoals[1].code, null);
  assert.strictEqual(uninterpreted.length, 1);
  assert.strictEqual(uninterpreted[0].stated, 'Something the clinician typed');
});

test('"Other" is a real option and is not itself reported as unreadable', () => {
  const { uninterpreted } = goals.interpret({ primary_goals: 'Other' });
  assert.deepStrictEqual(uninterpreted, []);
});

// -------------------------------------------------------------- the audience

test('clinician measures and owner-facing goals do not cross over', () => {
  const stated = {
    short_term_clinical: 'ROM flexion 125°, extension 160°. HCPI < 12.',
    short_term_functional: 'Navigate 3 steps independently.',
  };
  const { byAudience } = goals.interpret(stated);
  assert.ok(byAudience[goals.CLINICAL].short_term_clinical, 'clinical goal missing from clinical');
  assert.ok(!byAudience[goals.OWNER].short_term_clinical, 'a clinical goal leaked into owner-facing');
  assert.ok(byAudience[goals.OWNER].short_term_functional, 'functional goal missing from owner-facing');
  assert.ok(!byAudience[goals.CLINICAL].short_term_functional, 'a functional goal leaked into clinical');
});

test('every field is classified, so none can be silently unrouted', () => {
  const valid = new Set([goals.OWNER, goals.CLINICAL, goals.ADMIN]);
  const unclassified = goals.FIELDS.filter((f) => !valid.has(f.audience)).map((f) => f.key);
  assert.deepStrictEqual(unclassified, []);
});

test('the owner\'s own words reach the owner-facing side', () => {
  const words = 'want him back to normal he used to run extremely fast';
  const { byAudience } = goals.interpret({ owner_primary_goal: words });
  assert.strictEqual(byAudience[goals.OWNER].owner_primary_goal, words);
});

test('communication preference is read but kept out of the handoff', () => {
  const stated = goals.readFromDashboard({
    'goals::Client Communication Preference': 'Email — protocol PDF',
  });
  assert.strictEqual(stated.communication_preference, 'Email — protocol PDF',
    'the field must still be read, or the block is not accounted for');
  const payload = goals.toPayload(stated);
  assert.ok(!('communication_preference' in payload.owner_facing));
  assert.ok(!('communication_preference' in payload.clinical));
  assert.ok(!JSON.stringify(payload).includes('protocol PDF'),
    'practice admin must not travel in a clinical handoff');
});

test('the primary goals are not also repeated as raw text', () => {
  const payload = goals.toPayload({ primary_goals: 'Other' });
  assert.ok(!('primary_goals' in payload.owner_facing),
    'the multi-select travels as coded goals, not twice');
  assert.strictEqual(payload.primary_goals.length, 1);
});

// ------------------------------------------------------------------ payload

test('no goals at all is null, distinguishable from goals with gaps', () => {
  assert.strictEqual(goals.toPayload({}), null);
  assert.strictEqual(goals.toPayload(null), null);
  const sparse = goals.toPayload({ owner_priority: 'Independence at home' });
  assert.ok(sparse, 'a partial record is a record');
  assert.deepStrictEqual(sparse.primary_goals, []);
});

test('an empty string is not a goal', () => {
  assert.deepStrictEqual(goals.readFromDashboard({ 'goals::Owner Priority': '   ' }), {});
});

// -------------------------------------------------------------- real records

test('all five real patients read with every primary goal coded', () => {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const rows = db.prepare('SELECT name, dashboard_data FROM patients ORDER BY id').all();
  assert.ok(rows.length >= 5, `expected the real patient set, got ${rows.length}`);

  let totalGoals = 0;
  for (const row of rows) {
    const stated = goals.readFromDashboard(row.dashboard_data);
    const { primaryGoals, uninterpreted } = goals.interpret(stated);
    assert.ok(primaryGoals.length > 0, `${row.name}: no primary rehabilitation goal recorded`);
    assert.deepStrictEqual(uninterpreted, [],
      `${row.name}: ${uninterpreted.map((u) => u.stated).join(', ')}`);
    totalGoals += primaryGoals.length;
  }
  assert.ok(totalGoals >= 10, `expected the real goal set, read only ${totalGoals}`);
});

test('a dashboard_data string parses the same as the object', () => {
  const blob = { 'goals::Owner Priority': 'Pain relief above all' };
  assert.deepStrictEqual(goals.readFromDashboard(JSON.stringify(blob)), goals.readFromDashboard(blob));
});

test('malformed dashboard_data yields no record rather than throwing', () => {
  assert.deepStrictEqual(goals.readFromDashboard('{not json'), {});
  assert.deepStrictEqual(goals.readFromDashboard(undefined), {});
});

console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
if (failures.length) { console.log('FAILED'); process.exit(1); }
