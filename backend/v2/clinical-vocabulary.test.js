/**
 * Controlled clinical vocabularies — tests
 *
 * WHAT THIS PROTECTS
 *
 * The clinical form used to take free text for the neurological exam and
 * incision status. That was unsafe in a way nothing reported, because the
 * engine does not INTERPRET those fields — it matches them literally:
 *
 *   protocol-generator.js:596
 *     if (formData.neuroDeepPain.toLowerCase().includes('absent'))
 *       formData._gradeVSupport = true;
 *
 * "Negative", "No DPP", "0", "abs." and "not present" all mean absent deep
 * pain to a clinician and none of them set the Grade V lock. The safety gate
 * confirmed the clinician had STATED a value; nothing confirmed the engine
 * had PARSED it.
 *
 * The fix was to replace the inputs with controlled vocabularies whose values
 * are chosen to satisfy the matcher. That fix is only worth anything while the
 * values keep matching — and a `value` is one careless edit away from a label
 * at any time. Someone tidying "Absent" to "Absent (0/5)" or translating the
 * list would break the Grade V lock and every existing test would still pass.
 *
 * So this file does not test a copy of the vocabulary. It reads the ACTUAL
 * array out of the UI source, feeds each value to the ACTUAL engine, and
 * asserts what fires. If the two drift apart, this fails.
 *
 *   node v2/clinical-vocabulary.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { validateIntake, getExcludedCodes } = require('../protocol-generator');

const V2API = path.join(
  __dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'clinical', 'v2api.js'
);

/**
 * Pull one exported vocabulary out of the UI source and evaluate it.
 *
 * Read rather than imported because v2api.js is browser ESM that imports the
 * axios client — importing it here would need a bundler. The arrays are pure
 * data literals with no identifiers, so evaluating one in a bare context gives
 * exactly what the UI will render, with no second copy to drift.
 */
function vocabulary(name) {
  const src = fs.readFileSync(V2API, 'utf8');
  const match = new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\n\\]);`).exec(src);
  assert.ok(match, `vocabulary ${name} not found in v2api.js — was it renamed or deleted?`);
  return vm.runInNewContext(match[1]);
}

const NEURO_RESPONSE   = vocabulary('NEURO_RESPONSE');
const DEEP_PAIN        = vocabulary('DEEP_PAIN');
const NEURO_MOTOR      = vocabulary('NEURO_MOTOR');
const TRISTATE         = vocabulary('TRISTATE');
const WEIGHT_BEARING   = vocabulary('WEIGHT_BEARING');
const INCISION_STATUS  = vocabulary('INCISION_STATUS');

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (err) {
    failures.push({ name, message: err.message });
  }
}

/** Minimum formData the engine accepts, so a test isolates one field. */
function intake(overrides) {
  return Object.assign({
    patientName: 'Test',
    clientLastName: 'Owner',
    diagnosis: 'TPLO Post-Op',
    treatmentApproach: 'Surgical',
  }, overrides);
}

/**
 * Values only — the labels are free text and deliberately untested.
 *
 * Array.from re-homes the result into this realm. The vocabularies come back
 * from vm.runInNewContext, so their arrays carry that context's
 * Array.prototype and assert.deepStrictEqual — which compares prototypes —
 * rejects them against an ordinary literal.
 */
const valuesOf = (list) =>
  Array.from(list).map((o) => o.value).filter((v) => v !== '');

// ---------------------------------------------------------------------------
// Deep pain — the single most consequential string in the product
// ---------------------------------------------------------------------------

test('DEEP_PAIN offers exactly one value that sets the Grade V lock', () => {
  const locking = valuesOf(DEEP_PAIN).filter((value) => {
    const fd = intake({ neuroDeepPain: value });
    validateIntake(fd);
    return fd._gradeVSupport === true;
  });
  assert.deepStrictEqual(
    locking.length, 1,
    `expected exactly one locking value, got ${locking.length}: ${JSON.stringify(locking)}`
  );
});

test('the DEEP_PAIN value labelled absent is the one that locks', () => {
  const absent = DEEP_PAIN.find((o) => /absent/i.test(o.label));
  assert.ok(absent, 'no DEEP_PAIN option is labelled absent');
  const fd = intake({ neuroDeepPain: absent.value });
  validateIntake(fd);
  assert.strictEqual(
    fd._gradeVSupport, true,
    `"${absent.label}" (value "${absent.value}") does not set _gradeVSupport — ` +
    `the engine matches the substring 'absent' and this value does not contain it`
  );
});

test('DEEP_PAIN "Present" does not set the Grade V lock', () => {
  const present = DEEP_PAIN.find((o) => o.value === 'Present');
  assert.ok(present, 'DEEP_PAIN no longer offers "Present"');
  const fd = intake({ neuroDeepPain: present.value });
  validateIntake(fd);
  assert.notStrictEqual(fd._gradeVSupport, true, 'present deep pain must not lock to Grade V');
});

test('an unassessed deep pain does not set the Grade V lock', () => {
  const fd = intake({ neuroDeepPain: null });
  validateIntake(fd);
  assert.notStrictEqual(fd._gradeVSupport, true);
});

// ---------------------------------------------------------------------------
// The neuro red flag — absent / none / 0/5 / grade 0
// ---------------------------------------------------------------------------

const RED_FLAG = /RED FLAG: Absent neurological function/;

test('NEURO_RESPONSE "Absent" raises the neurological red flag', () => {
  const fd = intake({ neuroProprioception: 'Absent' });
  const { warnings } = validateIntake(fd);
  assert.ok(
    warnings.some((w) => RED_FLAG.test(w)),
    'absent proprioception did not raise the red flag'
  );
});

test('NEURO_RESPONSE non-absent values do not raise the red flag', () => {
  for (const value of valuesOf(NEURO_RESPONSE).filter((v) => v !== 'Absent')) {
    const fd = intake({ neuroProprioception: value });
    const { warnings } = validateIntake(fd);
    assert.ok(
      !warnings.some((w) => RED_FLAG.test(w)),
      `"${value}" raised the absent-function red flag. A finding is not an absence — ` +
      `check the value for the substrings 'absent', 'none', '0/5' or 'grade 0'`
    );
  }
});

test('NEURO_MOTOR 0/5 raises the neurological red flag', () => {
  const zero = NEURO_MOTOR.find((o) => /0\/5/.test(o.value));
  assert.ok(zero, 'NEURO_MOTOR no longer offers a 0/5 option');
  const fd = intake({ neuroMotorGrade: zero.value });
  const { warnings } = validateIntake(fd);
  assert.ok(
    warnings.some((w) => RED_FLAG.test(w)),
    `"${zero.value}" did not raise the red flag despite reporting no voluntary motor`
  );
});

test('NEURO_MOTOR values reporting present motor do not raise the red flag', () => {
  for (const value of valuesOf(NEURO_MOTOR).filter((v) => !/0\/5/.test(v))) {
    const fd = intake({ neuroMotorGrade: value });
    const { warnings } = validateIntake(fd);
    assert.ok(
      !warnings.some((w) => RED_FLAG.test(w)),
      `"${value}" raised the absent-function red flag but reports motor present`
    );
  }
});

test('no NEURO_MOTOR value accidentally sets the Grade V lock', () => {
  // neuroMotorGrade must never reach _gradeVSupport — only neuroDeepPain does.
  // A motor value containing the word "absent" would still be safe today, but
  // it would mean two fields share one matcher, which is how this class of bug
  // returns.
  for (const value of valuesOf(NEURO_MOTOR)) {
    const fd = intake({ neuroMotorGrade: value });
    validateIntake(fd);
    assert.notStrictEqual(
      fd._gradeVSupport, true,
      `motor grade "${value}" set the deep-pain lock`
    );
  }
});

// ---------------------------------------------------------------------------
// Weight bearing — the form's values must be the engine's exclusion keys
// ---------------------------------------------------------------------------

test('every restrictive WEIGHT_BEARING value excludes exercises', () => {
  for (const value of valuesOf(WEIGHT_BEARING).filter((v) => v !== 'FWB')) {
    const excluded = getExcludedCodes(intake({ weightBearingStatus: value }));
    assert.ok(
      excluded.size > 0,
      `"${value}" excluded nothing. The engine looks this up as an exact key — ` +
      `a value that is not a key silently withholds no exercises at all`
    );
  }
});

test('NWB is at least as restrictive as PWB', () => {
  const nwb = getExcludedCodes(intake({ weightBearingStatus: 'NWB' }));
  const pwb = getExcludedCodes(intake({ weightBearingStatus: 'PWB' }));
  assert.ok(
    nwb.size > pwb.size,
    `NWB excluded ${nwb.size} and PWB excluded ${pwb.size} — a non-weight-bearing ` +
    `patient must not be permitted more than a partially weight-bearing one`
  );
});

test('FWB is offered and excludes nothing on weight-bearing grounds', () => {
  assert.ok(
    valuesOf(WEIGHT_BEARING).includes('FWB'),
    'FWB must remain selectable — without it a fully weight-bearing patient ' +
    'can only be recorded as "Not assessed", which fails unsafe'
  );
});

// ---------------------------------------------------------------------------
// Incision status — one field, two consumers, and they must agree
//
// validateIntake() substring-scans it to hard-block generation.
// getExcludedCodes() looks the SAME string up as an exact key.
//
// Until 22 Sep 2026 they disagreed: the scan matched 'infected' and the key
// was 'Infection'. These tests exist so that never silently returns.
// ---------------------------------------------------------------------------

const blocksGeneration = (value) =>
  validateIntake(intake({ incisionStatus: value }))
    .errors.some((e) => /Post-operative complication detected/.test(e));

test('a compromised incision stops generation outright', () => {
  for (const value of ['Dehiscence', 'Infection']) {
    assert.ok(
      valuesOf(INCISION_STATUS).includes(value),
      `INCISION_STATUS no longer offers "${value}"`
    );
    assert.ok(
      blocksGeneration(value),
      `"${value}" did not raise the hard block. The engine matches the substrings ` +
      `'dehisc', 'infect', 'open' and 'draining' — check this value against them`
    );
  }
});

test('Infection and Infected both block — the two spellings must not diverge again', () => {
  // The exact regression. "Infection" is the exclusion key the form now sends;
  // "Infected" is what a clinician typed into the free-text field it replaced,
  // and may still sit in older records.
  assert.ok(blocksGeneration('Infection'), '"Infection" (the dropdown value) did not block');
  assert.ok(blocksGeneration('Infected'), '"Infected" (legacy free text) did not block');
});

test('an intact incision does not stop generation', () => {
  for (const value of ['Healing normally', 'Mild Swelling', 'Seroma']) {
    assert.ok(
      valuesOf(INCISION_STATUS).includes(value),
      `INCISION_STATUS no longer offers "${value}"`
    );
    assert.ok(
      !blocksGeneration(value),
      `"${value}" blocked generation. Check it against the substrings ` +
      `'dehisc', 'infect', 'open' and 'draining'`
    );
  }
});

test('every non-blocking incision value is a real exclusion key', () => {
  // A value that is not a key withholds nothing at all. For "Healing normally"
  // that is correct; for a seroma it would be a silent safety hole, since the
  // engine would permit the aquatic work a seroma contraindicates.
  const seroma = getExcludedCodes(intake({ incisionStatus: 'Seroma' }));
  assert.ok(
    seroma.size > 0,
    '"Seroma" excluded nothing — it is looked up as an exact key in ' +
    'INCISION_EXCLUSIONS and must match one'
  );
  const healing = getExcludedCodes(intake({ incisionStatus: 'Healing normally' }));
  assert.strictEqual(
    healing.size, 0,
    '"Healing normally" excluded exercises. A normal incision restricts nothing'
  );
});

// ---------------------------------------------------------------------------
// Tri-state — the third state is the whole point
// ---------------------------------------------------------------------------

test('TRISTATE offers exactly three options', () => {
  assert.strictEqual(TRISTATE.length, 3, 'crate rest and e-collar have three states');
});

test('TRISTATE carries an empty value for "not assessed"', () => {
  const unassessed = TRISTATE.find((o) => o.value === '');
  assert.ok(
    unassessed,
    'without an empty value the control cannot express "nobody has looked at this", ' +
    'which is the state a checkbox silently reported as "no"'
  );
});

test('TRISTATE true and false are both selectable and distinct', () => {
  assert.deepStrictEqual(
    valuesOf(TRISTATE).sort(), ['false', 'true'],
    'the two answered states must be "true" and "false" — the form converts these ' +
    'to booleans and anything else becomes a truthy string'
  );
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`clinical-vocabulary: ${passed} passed`);
