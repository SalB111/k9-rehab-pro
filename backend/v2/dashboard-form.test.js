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
const gaps = require('./patient-gaps');
const { getProtocolType, diagnosisRecognised } = require('../protocol-generator');
const { DatabaseSync } = require('node:sqlite');

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

test('every tel field goes through the formatter', () => {
  // Keyed off type="tel", so a phone field added as type="text" silently
  // opts out.
  assert.ok(src.includes('update(key, type === "tel" ? formatPhone(val) : val)'),
    'F no longer routes tel fields through formatPhone');
  const telFields = (src.match(/type="tel"/g) || []).length;
  assert.ok(telFields > 0, 'no type="tel" field found — has the phone field been renamed?');
});

// ── 3. functions that are called but never defined ─────────────────────────
//
// `callBeau` was awaited at FIVE call sites in DashboardView.jsx and declared
// nowhere — not defined, not imported. Every one threw "callBeau is not
// defined" the moment it ran, and each call site caught the error and printed
// it into its own output box, so it read as B.E.A.U. failing rather than as a
// missing function. It reached Sal as "BEAU analyze assessment not
// functioning" on 2026-09-25.
//
// There is no linter in this project (CLAUDE.md, Tech Stack: "No linter
// configured"), so nothing else would have caught it. This is the cheap
// version of the check that matters: anything AWAITED must exist.

test('every awaited helper in DashboardView is actually defined', () => {
  // Globals and browser APIs that are legitimately awaited without a local
  // declaration. Anything else must be declared or imported in the file.
  const AMBIENT = new Set([
    'fetch', 'import', 'Promise', 'navigator', 'caches', 'queueMicrotask',
    'structuredClone', 'requestAnimationFrame', 'setTimeout',
  ]);

  const called = new Set();
  for (const m of src.matchAll(/await\s+([A-Za-z_$][\w$]*)\s*\(/g)) called.add(m[1]);

  const declared = new Set();
  for (const re of [
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g,
    /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /\basync\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /\bimport\s+([A-Za-z_$][\w$]*)\s*(?:,|from)/g,
    /\bimport\s*\{([^}]*)\}/g,
  ]) {
    for (const m of src.matchAll(re)) {
      for (const name of m[1].split(',')) {
        const clean = name.trim().split(/\s+as\s+/).pop().trim();
        if (clean) declared.add(clean);
      }
    }
  }

  const missing = [...called].filter((n) => !declared.has(n) && !AMBIENT.has(n));
  assert.deepStrictEqual(missing, [],
    'These are awaited in DashboardView.jsx and defined nowhere, so every call '
    + 'site throws "X is not defined" at runtime:\n    ' + missing.join('\n    ')
    + '\n  There is no linter in this project — this test is the check.');
});

test('callBeau exists and surfaces the exercise-validation warnings', () => {
  // The server streams a "validation" event when B.E.A.U. names an exercise
  // code that is not in the library, or one that was not supplied for that
  // answer. beau-chat-handler.js sends it to the CLIENT deliberately: "the
  // clinician is the person who can act on it, and they cannot act on what
  // they are not told." A client that drops it silently undoes the
  // anti-hallucination check CLAUDE.md calls non-negotiable.
  assert.ok(/async function callBeau\(/.test(src), 'callBeau is not defined');
  assert.ok(/evt\.type === "validation"/.test(src),
    'callBeau ignores the validation event, so a fabricated exercise code '
    + 'would reach the clinician unflagged');
  assert.ok(/NOT IN THE EXERCISE LIBRARY/.test(src),
    'the validation notice is collected but never shown to anyone');
  assert.ok(/evt\.type === "error"/.test(src),
    'callBeau ignores the error event, so a failed request would look like an '
    + 'empty answer rather than a failure');
});

// ── 3. the dashboard save inventing clinical values ────────────────────────
//
// handleSave built the CREATE body with four literal fallbacks:
//
//   parseFloat(...) || 0        weight
//   parseInt(...) || 0          age
//   || "Mixed Breed"            breed
//   || "Rehabilitation"         condition
//
// Each writes a value nobody entered into a column the engine reads. The
// condition is the one that does real damage AND hides itself, so it gets a
// test of its own that runs the engine rather than asserting a shape.

const HANDLE_SAVE = (() => {
  const i = src.indexOf('const handleSave = async () => {');
  assert.ok(i > 0, 'handleSave could not be found — has it been renamed?');
  // COMMENTS STRIPPED. The comment above these fallbacks names the literals it
  // removed, and the first run of this test failed on its own prose. A test
  // for what the code DOES must not read what the code SAYS.
  return src.slice(i, i + 6000)
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
})();

test('the dashboard save invents no condition', () => {
  assert.ok(
    !/\|\|\s*"Rehabilitation"/.test(HANDLE_SAVE),
    'handleSave writes the literal "Rehabilitation" when no diagnosis was '
    + 'entered. That is not a diagnosis, and it is worse than an empty '
    + 'column — see the next test.'
  );
  assert.ok(
    /condition:\s*resolveDiagnosis\([^)]*\)\s*\|\|\s*""/.test(HANDLE_SAVE),
    'the condition must come from resolveDiagnosis and fall through to the '
    + 'empty string — see the NOT NULL test below for why it is not null'
  );
});

test('an invented condition is worse than an empty one — run the engine', () => {
  // Not asserted from memory. This is what the two values actually do.
  assert.strictEqual(
    diagnosisRecognised('Rehabilitation'), false,
    'the whole problem: it matches no routing rule'
  );
  assert.strictEqual(
    getProtocolType('Rehabilitation', ''), 'oa',
    'so the protocol is chosen by FALLTHROUGH, not by match — an '
    + 'osteoarthritis protocol for a dog whose diagnosis nobody recorded'
  );

  // And the check that should catch it cannot, because a FILLED column is not
  // a gap. That is why the literal had to go rather than be reported.
  const withLiteral = gaps.findGaps(
    { id: 1, name: 'X', client_name: 'Y', condition: 'Rehabilitation' }, { unstated: [] }
  );
  assert.ok(
    !withLiteral.gaps.some((g) => g.label === 'Condition'),
    'if patient-gaps ever learns to report this, the assertion above can relax'
  );
  const empty = gaps.findGaps(
    { id: 1, name: 'X', client_name: 'Y', condition: null }, { unstated: [] }
  );
  assert.strictEqual(
    empty.gaps.find((g) => g.label === 'Condition').severity, 'BLOCKS',
    'an empty condition is reported to the clinician and blocks generation. '
    + 'That is the behaviour the literal was suppressing.'
  );
});

test('the dashboard save invents no breed, age or weight', () => {
  assert.ok(
    !/\|\|\s*"Mixed Breed"/.test(HANDLE_SAVE) && /const breed = dashData\["client::Breed"\] \|\| ""/.test(HANDLE_SAVE),
    'handleSave writes "Mixed Breed" for a blank breed. It is also a real '
    + 'option in the dropdown, so the record cannot be told apart from an '
    + 'answer a clinician chose.'
  );
  assert.ok(
    /const weight = Number\.isFinite\(weightRaw\) \? weightRaw : 0/.test(HANDLE_SAVE),
    'a blank weight must be 0, which patient-gaps reports as missing — NOT a '
    + 'parsed NaN and not a number carried over from somewhere else'
  );
  assert.ok(
    /const age = Number\.isFinite\(ageRaw\) \? ageRaw : 0/.test(HANDLE_SAVE),
    'a blank age must be 0, which patient-gaps reports as missing. A live '
    + 'record held age 0 on a ten-year-old Australian Shepherd — the defect '
    + 'there was the WRONG value going unreported, not the 0 itself'
  );

  // 0 is not a neutral placeholder for either. patient-gaps reports both as
  // missing, which is only reachable once the save stops writing them.
  const r = gaps.findGaps(
    { id: 1, name: 'X', client_name: 'Y', condition: 'OA', age: 0, weight: 0 },
    { unstated: [] }
  );
  assert.ok(r.gaps.some((g) => g.label === 'Age'), 'age 0 must be a gap');
  assert.ok(r.gaps.some((g) => g.label === 'Weight'), 'weight 0 must be a gap');
});

// ── 4. the diagnosis the clinician actually recorded ───────────────────────
//
// The form has TWO "Primary Diagnosis" controls — free text in
// AssessmentPanel, a dropdown in TreatmentPanel — and three readers disagreed
// about which keys to look at. handleSave read `client::Diagnosis`, which no
// control writes, and `assessment::Primary Diagnosis`. It never read the
// dropdown.
//
// Haley, id 33, 2026-09-25: Sal chose "Geriatric Mobility Decline" from that
// dropdown. handleSave found nothing and wrote "Rehabilitation".

/** resolveDiagnosis, extracted from the real file and run. */
const resolveDiagnosis = (() => {
  const i = src.indexOf('function resolveDiagnosis(');
  assert.ok(i > 0, 'resolveDiagnosis is gone — the three readers have diverged again');
  const end = src.indexOf('\n}', i);
  assert.ok(end > i, 'resolveDiagnosis could not be delimited');
  const ctx = { module: { exports: {} } };
  vm.createContext(ctx);
  vm.runInContext(src.slice(i, end + 2) + '\nmodule.exports = resolveDiagnosis;', ctx);
  return ctx.module.exports;
})();

test('the treatment dropdown is a place a diagnosis can be recorded', () => {
  // The exact keys off Haley's record. The assessment field is empty; the
  // dropdown holds her answer.
  const haley = {
    'treatment::Primary Diagnosis': 'Geriatric Mobility Decline',
    'assessment::Chief Complaint': 'hard time to get up fromm laying position. hind limb weakness',
  };
  assert.strictEqual(
    resolveDiagnosis(haley, null), 'Geriatric Mobility Decline',
    'the dropdown answer must be found — it was the only diagnosis she had'
  );
});

test('the assessment free text wins when both are filled', () => {
  const both = {
    'assessment::Primary Diagnosis': 'L stifle partial CCL tear',
    'treatment::Primary Diagnosis': 'Osteoarthritis — Mild',
  };
  assert.strictEqual(
    resolveDiagnosis(both, null), 'L stifle partial CCL tear',
    'free text typed for this patient beats the controlled fallback'
  );
});

test('the stored column is the last resort, never the first', () => {
  assert.strictEqual(
    resolveDiagnosis({ 'treatment::Primary Diagnosis': 'Spondylosis' }, { condition: 'stale' }),
    'Spondylosis',
    'what is on screen now beats what was saved before'
  );
  assert.strictEqual(
    resolveDiagnosis({}, { condition: 'Hip Dysplasia — Moderate' }),
    'Hip Dysplasia — Moderate',
    'and with nothing on screen the column answers'
  );
  assert.strictEqual(resolveDiagnosis({}, null), '', 'nothing anywhere is empty, not invented');
});

test('every reader resolves the diagnosis the same way', () => {
  // The defect was three call sites with three different key lists. This fails
  // if a fourth reader starts reading the keys directly again.
  const calls = (src.match(/resolveDiagnosis\(/g) || []).length;
  assert.ok(calls >= 4, `expected the definition plus 3 call sites, found ${calls}`);

  for (const dead of ['client::Diagnosis', 'assessment::Diagnosis']) {
    assert.ok(
      !src.includes(`"${dead}"`),
      `${dead} is read somewhere but no control in this form writes it — `
      + 'that is how the treatment dropdown got missed'
    );
  }
});

test('his answer and the invented one are different protocols — run the engine', () => {
  assert.strictEqual(
    diagnosisRecognised('Geriatric Mobility Decline'), true,
    'the dropdown offers it, so the engine had better know it'
  );
  assert.strictEqual(
    getProtocolType('Geriatric Mobility Decline', 'Both hindlimbs'), 'geriatric'
  );
  assert.strictEqual(
    getProtocolType('Rehabilitation', 'Both hindlimbs'), 'oa',
    'which is what she was getting: a different protocol, from a string '
    + 'nobody entered, because her real answer was never read'
  );
});

// ── 5. the empty form must actually INSERT ─────────────────────────────────
//
// THE TEST THAT WAS MISSING. Commit 5855174 changed all four fallbacks to
// `null` and shipped: the JSX assertions passed, the frontend build passed,
// and nothing anywhere ran the INSERT. name, breed, age, weight and condition
// are ALL `NOT NULL` in the patients table, so saving a form with a blank
// breed would have failed patient creation outright with a 500.
//
// So this does not assert a shape. It takes the real expressions out of
// handleSave, evaluates them against an EMPTY form, and puts the result
// through the real schema.

test('an empty form produces values the patients table accepts', () => {
  // The real DDL, from the provider that creates it.
  const providerSrc = fs.readFileSync(
    path.join(__dirname, '..', 'db-providers', 'sqlite-provider.js'), 'utf8'
  );
  const ddl = /CREATE TABLE IF NOT EXISTS patients \([\s\S]*?\n    \)/.exec(providerSrc);
  assert.ok(ddl, 'the patients DDL could not be found in sqlite-provider.js');
  assert.ok(/condition TEXT NOT NULL/.test(ddl[0]),
    'condition is no longer NOT NULL — if the schema was deliberately relaxed, '
    + 'this test and the encoding in handleSave can both move to null');

  // The real expressions, from the real file, run against an empty form.
  const vars = /const weightRaw = parseFloat[\s\S]*?const breed = dashData\["client::Breed"\][^;]*;/
    .exec(src);
  assert.ok(vars, 'the weight/age/breed block could not be found in handleSave');
  const condExpr = /condition:\s*(resolveDiagnosis\([^)]*\)\s*\|\|\s*[^,]+),/.exec(HANDLE_SAVE);
  assert.ok(condExpr, 'the condition expression could not be found in the create body');

  const ctx = { dashData: {}, resolveDiagnosis, module: { exports: {} } };
  vm.createContext(ctx);
  vm.runInContext(
    vars[0] + '\nmodule.exports = { breed, age, weight, condition: ' + condExpr[1] + ' };',
    ctx
  );
  const v = ctx.module.exports;

  const db = new DatabaseSync(':memory:');
  db.exec(ddl[0] + ';');
  db.prepare(
    'INSERT INTO patients (name, species, breed, age, weight, condition) VALUES (?,?,?,?,?,?)'
  ).run('Unnamed', 'canine', v.breed, v.age, v.weight, v.condition);

  const row = db.prepare('SELECT * FROM patients WHERE id = 1').get();
  db.close();

  // It inserted. Now the values must still read as unstated to the gap check,
  // or the insert has simply moved the fabrication somewhere quieter.
  const r = gaps.findGaps(
    { id: 1, name: 'Unnamed', client_name: 'Owner', ...row }, { unstated: [] }
  );
  const labels = r.gaps.map((g) => g.label);
  for (const label of ['Condition', 'Age', 'Weight']) {
    assert.ok(
      labels.includes(label),
      `${label} inserted as ${JSON.stringify(row[label.toLowerCase()])} and `
      + 'patient-gaps did NOT report it — an empty value that reads as an '
      + 'answer is the whole defect this file is about'
    );
  }
  assert.strictEqual(
    r.gaps.find((g) => g.label === 'Condition').severity, 'BLOCKS',
    'and an unnamed diagnosis must still stop generation'
  );
});

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`dashboard-form: ${passed} passed`);
