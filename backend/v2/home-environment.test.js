/**
 * home-environment — tests
 *
 * The option lists are read out of the real DashboardView.jsx and the values
 * out of the real database. A hand-written fixture would only ever contain the
 * phrases I already thought of, and the defect these tests exist to catch is a
 * phrase I did not think of being read as something it is not.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const home = require('./home-environment');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (err) { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); }
}

const UI_PATH = path.join(__dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx');
const DB_PATH = path.join(__dirname, '..', 'k9rehab.db');

/**
 * label -> options, from the MODULE.
 *
 * Before V3 these were parsed out of DashboardView.jsx, because that was where
 * the lists lived and the risk was the module falling behind the screen. Now
 * the module owns them and the API serves them to the screen, so the screen has
 * no list to fall behind — and parsing the JSX would find nothing at all.
 */
function optionsFromUI() {
  const out = {};
  for (const f of home.FIELDS) {
    if (f.options) out[f.keys[0].slice(6)] = f.options;
  }
  return out;
}

/** label -> Set of values actually stored, which may predate the option list. */
function valuesFromDb() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const out = {};
  for (const r of db.prepare('SELECT dashboard_data FROM patients').all()) {
    let d = {};
    try { d = JSON.parse(r.dashboard_data || '{}'); } catch { continue; }
    for (const [k, v] of Object.entries(d)) {
      if (!k.startsWith('home::') || !v) continue;
      (out[k.slice(6)] = out[k.slice(6)] || new Set()).add(String(v));
    }
  }
  return out;
}

console.log('\nhome-environment\n');

// ---------------------------------------------------------------- the domain

/**
 * Only these two may be unreadable, and both because they state no quantity —
 * an owner whose time is "Variable" has genuinely not given a number. Any
 * OTHER unreadable value is a phrase the normalizers do not cover, and this
 * test names it rather than letting it pass as an acceptable null.
 */
const KNOWINGLY_UNQUANTIFIED = new Set(['Variable', 'As tolerated']);

test('every option the UI offers, and every value stored, is read or knowingly unquantified', () => {
  const ui = optionsFromUI();
  const stored = valuesFromDb();
  const unread = [];
  let swept = 0;

  for (const field of home.FIELDS) {
    if (!field.normalize) continue;
    const label = field.keys[0].slice(6);
    for (const value of new Set([...(ui[label] || []), ...(stored[label] || [])])) {
      swept++;
      const readings = field.normalize(value);
      if (Object.values(readings).every((v) => v === null) && !KNOWINGLY_UNQUANTIFIED.has(value)) {
        unread.push(`${label} = "${value}"`);
      }
    }
  }

  assert.ok(swept >= 55, `expected to sweep the whole vocabulary, swept only ${swept}`);
  assert.deepStrictEqual(unread, [], `unreadable values:\n      ${unread.join('\n      ')}`);
});

test('the option lists are actually populated (not silently empty)', () => {
  const ui = optionsFromUI();
  assert.ok(ui['Indoor Stairs'], 'Indoor Stairs has no option list');
  assert.ok(ui['Indoor Stairs'].includes('Has ramp available'));
  assert.ok(Object.keys(ui).length >= 12, `only ${Object.keys(ui).length} fields carry options`);
});

// ------------------------------------------------------------- the substring
// traps. This is the defect class that produced every prior finding in this
// codebase: a value that reads correctly to a person matching the wrong rule.

test('"unavoidable" is not read as "avoidable"', () => {
  const f = home.BY_KEY.stairs_indoor;
  assert.strictEqual(f.normalize('Full staircase — must use').stairs_avoidable, false);
  assert.strictEqual(f.normalize('Stairs unavoidable').stairs_avoidable, false);
  assert.strictEqual(f.normalize('Full staircase — avoidable').stairs_avoidable, true);
});

test('"not fenced" is not read as "fenced"', () => {
  const f = home.BY_KEY.outdoor_space;
  assert.strictEqual(f.normalize('Large yard — not fenced').outdoor_fenced, false);
  assert.strictEqual(f.normalize('Large unfenced yard').outdoor_fenced, false);
  assert.strictEqual(f.normalize('Medium yard — fenced').outdoor_fenced, true);
});

test('a mixed floor is not read as uniformly non-slip', () => {
  const f = home.BY_KEY.flooring_indoor;
  assert.strictEqual(f.normalize('Mixed — mostly carpet').traction, 'MIXED');
  assert.strictEqual(f.normalize('Mixed — mostly hard floors').traction, 'MIXED');
  assert.strictEqual(f.normalize('Non-slip carpet — all areas').traction, 'NON_SLIP');
});

test('"Multiple times daily" is not read as once daily', () => {
  const f = home.BY_KEY.stair_frequency;
  assert.strictEqual(f.normalize('Multiple times daily').stair_frequency, 'FREQUENT');
  assert.strictEqual(f.normalize('Once daily').stair_frequency, 'DAILY');
});

test('"Three times daily (TID)" is not read as once daily', () => {
  const f = home.BY_KEY.sessions_per_day;
  assert.strictEqual(f.normalize('Three times daily (TID)').sessions_per_day, 3);
  assert.strictEqual(f.normalize('Twice daily (BID)').sessions_per_day, 2);
  assert.strictEqual(f.normalize('Once daily (SID)').sessions_per_day, 1);
});

test('an absence stated alongside a presence does not read as absence', () => {
  const f = home.BY_KEY.outdoor_space;
  assert.strictEqual(f.normalize('No yard — park access only').outdoor_space, 'OFFSITE');
});

// -------------------------------------------------------------------- bounds

test('a range of capacity resolves to its LOWER bound', () => {
  assert.strictEqual(home.BY_KEY.session_minutes.normalize('20–30 minutes').session_minutes, 20);
  assert.strictEqual(home.BY_KEY.session_minutes.normalize('10–15 minutes').session_minutes, 10);
  assert.strictEqual(home.BY_KEY.session_minutes.normalize('30+ minutes').session_minutes, 30);
});

test('"Every other day" keeps its sub-daily frequency rather than vanishing', () => {
  assert.strictEqual(home.BY_KEY.sessions_per_day.normalize('Every other day').sessions_per_day, 0.5);
});

// ----------------------------------------------------------------- tri-state

test('a field nobody answered is absent, not false and not zero', () => {
  const stated = home.readFromDashboard({ 'home::Indoor Stairs': 'No stairs' });
  assert.ok(!('session_minutes' in stated), 'unanswered field must not appear in stated');
  const { normalized } = home.interpret(stated);
  assert.ok(!('session_minutes' in normalized), 'unanswered field must not be given a reading');
  assert.strictEqual(normalized.stairs, 'NONE');
});

test('an empty string is not an answer', () => {
  const stated = home.readFromDashboard({ 'home::Indoor Stairs': '   ' });
  assert.deepStrictEqual(stated, {});
});

test('"N/A" IS an answer, and is distinguishable from unanswered', () => {
  const answered = home.interpret(home.readFromDashboard({ 'home::Stair Frequency': 'N/A' }));
  assert.strictEqual(answered.normalized.stair_frequency, 'NOT_APPLICABLE');
  const unanswered = home.interpret(home.readFromDashboard({}));
  assert.ok(!('stair_frequency' in unanswered.normalized));
});

test('an unreadable value is reported, never silently dropped', () => {
  const { normalized, uninterpreted } = home.interpret({ session_minutes: 'whenever we can' });
  assert.strictEqual(normalized.session_minutes, null);
  assert.strictEqual(uninterpreted.length, 1);
  assert.strictEqual(uninterpreted[0].field, 'session_minutes');
  assert.strictEqual(uninterpreted[0].stated, 'whenever we can');
});

test('a partly-read value is not reported as unreadable', () => {
  // stairs reads, avoidability does not — the field is not a gap.
  const { uninterpreted } = home.interpret({ stairs_indoor: 'No stairs' });
  assert.deepStrictEqual(uninterpreted, []);
});

// ------------------------------------------------------------------- payload

test('no record at all is null, distinguishable from a record with gaps', () => {
  assert.strictEqual(home.toPayload({}), null);
  assert.strictEqual(home.toPayload(null), null);
  const sparse = home.toPayload({ session_minutes: '20' });
  assert.ok(sparse, 'a partial record is a record');
  assert.strictEqual(sparse.normalized.session_minutes, 20);
});

test('the payload carries the clinician\'s own words alongside the reading', () => {
  const p = home.toPayload({ flooring_indoor: 'Mixed — mostly carpet' });
  assert.strictEqual(p.stated.flooring_indoor, 'Mixed — mostly carpet');
  assert.strictEqual(p.normalized.traction, 'MIXED');
});

test('owner confidence travels as prose and is never reduced to an enum', () => {
  const note = 'Moderate — retired, highly compliant, very attentive';
  const p = home.toPayload({ owner_confidence: note });
  assert.strictEqual(p.stated.owner_confidence, note);
  assert.strictEqual(home.BY_KEY.owner_confidence.normalize, null);
  assert.deepStrictEqual(p.uninterpreted, [], 'prose is not a gap in the record');
});

// --------------------------------------------------------------- real record

test('the migration reader still reads all five blobs with no unreadable value', () => {
  // V3: the blob is NO LONGER the source for this block — patient_home_environment
  // is, and patient-home-store.test.js covers it. This test keeps the MIGRATION
  // path honest, because the blob is still what a pre-V3 record has to be
  // recovered from if one ever needs checking by hand.
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const rows = db.prepare('SELECT name, dashboard_data FROM patients ORDER BY id').all();
  assert.ok(rows.length >= 5, `expected the real patient set, got ${rows.length}`);
  for (const row of rows) {
    const stated = home.readFromDashboard(row.dashboard_data);
    assert.ok(Object.keys(stated).length >= 7,
      `${row.name}: expected the home block to be filled, read ${Object.keys(stated).length} fields`);
    const { uninterpreted } = home.interpret(stated);
    assert.deepStrictEqual(uninterpreted, [],
      `${row.name}: ${uninterpreted.map((u) => u.stated).join(', ')}`);
  }
});

test('a dashboard_data string parses the same as the object', () => {
  const blob = { 'home::Indoor Stairs': 'Has ramp available' };
  assert.deepStrictEqual(
    home.readFromDashboard(JSON.stringify(blob)),
    home.readFromDashboard(blob)
  );
});

test('malformed dashboard_data yields no record rather than throwing', () => {
  assert.deepStrictEqual(home.readFromDashboard('{not json'), {});
  assert.deepStrictEqual(home.readFromDashboard(undefined), {});
});

console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
if (failures.length) { console.log('FAILED'); process.exit(1); }
