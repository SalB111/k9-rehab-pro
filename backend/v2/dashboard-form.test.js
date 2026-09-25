/**
 * Dashboard form behaviour — tests
 *
 * WHAT THIS PROTECTS
 *
 * Two defects Sal hit within minutes of driving a real intake on 2026-09-25.
 * Neither was caught by any existing test, because every existing test looks
 * at what the app STORES and these are about what it lets a clinician TYPE.
 *
 * 1. NO TEXT FIELD IN ANY BLOCK COULD ACCEPT A SPACE.
 *
 *    The modal backdrop is `position:fixed; inset:0` with the whole dialog
 *    rendered inside it, and it carried:
 *
 *      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") {
 *        e.preventDefault();
 *        (e => { if (e.target === e.currentTarget) onClose(); })(e);
 *      }}}
 *
 *    The target check guards the CLOSE, but `preventDefault()` runs before it
 *    — on every Enter and Space bubbling up from any field in the dialog. Sal
 *    found it typing a street address. It was never the address field: it was
 *    every field, in every block, behind every modal, and it presented as a
 *    stuck keyboard rather than as a bug.
 *
 * 2. Phone numbers were stored however they were typed, so one record read
 *    `9545550142` and another `(954) 555-0142`.
 *
 * These read the REAL DashboardView.jsx. `formatPhone` is pure, so it is
 * extracted and run; the modal handler is JSX, so its SHAPE is asserted —
 * that the target check comes before any call to preventDefault.
 *
 *   node v2/dashboard-form.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DASHBOARD = path.join(
  __dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx'
);
const src = fs.readFileSync(DASHBOARD, 'utf8');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

// ── 1. the space bug ───────────────────────────────────────────────────────

/** The modal backdrop's onKeyDown, as written in the source. */
function backdropHandler() {
  const i = src.indexOf('position:"fixed", inset:0, zIndex:200');
  assert.ok(i > 0, 'the modal backdrop could not be found — has it been restyled?');
  // The handler is the nearest onKeyDown above that style.
  const before = src.slice(Math.max(0, i - 1500), i);
  const k = before.lastIndexOf('onKeyDown');
  assert.ok(k >= 0, 'the modal backdrop has no onKeyDown at all');
  return before.slice(k);
}

test('the modal backdrop checks the target BEFORE preventDefault', () => {
  const h = backdropHandler();
  const guard = h.search(/e\.target\s*!==\s*e\.currentTarget|e\.target\s*===\s*e\.currentTarget/);
  const prevent = h.indexOf('preventDefault');
  assert.ok(guard >= 0, 'the backdrop handler no longer checks where the key came from');
  assert.ok(prevent >= 0, 'the backdrop handler no longer calls preventDefault at all');
  assert.ok(guard < prevent,
    'preventDefault() runs before the target check, so a space typed in ANY '
    + 'field inside ANY modal is swallowed. This is the bug Sal found typing '
    + 'an address on 2026-09-25 — it is not specific to that field.');
});

test('the backdrop returns early rather than swallowing inner keys', () => {
  const h = backdropHandler();
  assert.match(h, /if\s*\(\s*e\.target\s*!==\s*e\.currentTarget\s*\)\s*return/,
    'the guard must RETURN for a key from inside the dialog. Wrapping the '
    + 'close in an if is not enough — preventDefault must not be reached.');
});

// ── 2. phone formatting ────────────────────────────────────────────────────

/** Pull the pure formatter out of the UI source and run the real thing. */
function loadFormatPhone() {
  const m = /function formatPhone\(input\) \{[\s\S]*?\n\}/.exec(src);
  assert.ok(m, 'formatPhone is no longer in DashboardView.jsx');
  const ctx = {};
  vm.runInNewContext(m[0] + '\nthis.fn = formatPhone;', ctx);
  return ctx.fn;
}
const formatPhone = loadFormatPhone();

test('a plain ten-digit number formats as it is typed', () => {
  assert.strictEqual(formatPhone('9'), '9');
  assert.strictEqual(formatPhone('954'), '954');
  assert.strictEqual(formatPhone('9545'), '(954) 5');
  assert.strictEqual(formatPhone('954555'), '(954) 555');
  assert.strictEqual(formatPhone('9545550142'), '(954) 555-0142');
});

test('an already-formatted number is stable', () => {
  // Re-running the formatter on its own output must not drift, because it
  // runs on every keystroke.
  const once = formatPhone('9545550142');
  assert.strictEqual(formatPhone(once), once);
});

test('a US number with its country code keeps it', () => {
  assert.strictEqual(formatPhone('19545550142'), '1 (954) 555-0142');
});

test('anything it is not sure about is left EXACTLY alone', () => {
  // The important half. A formatter that "corrects" these would silently
  // mangle a number somebody needs to ring.
  for (const raw of [
    '+44 20 7946 0958',        // international
    '(954) 555-0142 x231',     // extension
    '555-0142 (mobile)',       // a note beside the number
    'ask reception',           // not a number at all
    '954555014299',            // longer than a US number
  ]) {
    assert.strictEqual(formatPhone(raw), raw, `"${raw}" was altered`);
  }
});

test('empty and nullish input do not throw or invent characters', () => {
  assert.strictEqual(formatPhone(''), '');
  assert.strictEqual(formatPhone(null), '');
  assert.strictEqual(formatPhone(undefined), '');
});

test('deleting backwards through a formatted number works', () => {
  // Backspace hands the formatter the string minus its last character. If any
  // step returned something longer, the caret would fight the clinician.
  let v = '(954) 555-0142';
  for (let i = 0; i < 14; i++) {
    const next = formatPhone(v.slice(0, -1));
    assert.ok(next.length < v.length || next === v.slice(0, -1),
      `deleting from "${v}" produced "${next}", which does not shrink`);
    v = next;
    if (!v) break;
  }
  assert.strictEqual(v, '', 'the field could not be cleared by backspacing');
});

test('every tel field goes through the formatter, ON BLUR', () => {
  // Keyed off type="tel", so a phone field added as type="text" silently
  // opts out.
  assert.ok(/type !== "tel"\) return;[\s\S]{0,200}formatPhone\(val\)/.test(src),
    'F no longer tidies tel fields through formatPhone');
  assert.ok(/onBlur=\{e => onBlur\(e\.target\.value\)\}/.test(src),
    'the input no longer calls onBlur, so the formatter never runs');
  const telFields = (src.match(/type="tel"/g) || []).length;
  assert.ok(telFields > 0, 'no type="tel" field found — has the phone field been renamed?');
});

test('the formatter is NOT wired into onChange', () => {
  // This is the regression that cost a digit. Reformatting a controlled React
  // input on every keystroke changes the value's length, React re-renders and
  // moves the caret to the end, and a character typed before that render is
  // lost. Typing 9545550142 produced "(954) 555-014" — silently one short.
  assert.ok(!/update\(key, type === "tel" \? formatPhone/.test(src),
    'formatting is back in onChange, where it fights the caret and drops digits');
});

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`dashboard-form: ${passed} passed`);
