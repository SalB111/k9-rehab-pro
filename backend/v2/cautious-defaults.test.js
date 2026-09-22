/**
 * Safety-gate cautious defaults — tests
 *
 * WHAT THIS PROTECTS
 *
 * intake-proposal.js promises that every safety gate it cannot settle from
 * the record is "proposed at its most cautious value AND flagged for
 * confirmation". On 22 Sep 2026 those values were run through the real engine
 * for the first time and four of the twelve did nothing whatsoever:
 *
 *   weightBearingStatus  "Non-weight-bearing"   NO EFFECT  (the key is 'NWB')
 *   incisionStatus       "Not healed"           NO EFFECT  (not a key, not a scan match)
 *   neuroMotorGrade      "Non-ambulatory"       NO EFFECT  (matches no neuro token)
 *   complicationsNoted   true                   THROWS     (boolean -> .toLowerCase())
 *
 * Every one of them read correctly to a clinician. The most restricted
 * weight-bearing state a patient can be in was applying zero exclusions, and
 * the screen said "proposed at its most cautious value" while it did so.
 *
 * The existing suites could not catch this. intake-proposal.test.js checks
 * WHICH gates are raised; clinical-vocabulary.test.js checks the values the
 * FORM offers. Nothing checked the values the PROPOSAL supplies — which are a
 * separate list, in a separate file, feeding the same matchers.
 *
 * So: no fixtures. Each value goes to the real validateIntake and
 * getExcludedCodes, and a value that changes nothing is a failure.
 *
 *   node v2/cautious-defaults.test.js
 */

'use strict';

const assert = require('assert');
const { validateIntake, getExcludedCodes } = require('../protocol-generator');
const { SAFETY_GATES } = require('./intake-proposal');

let passed = 0;
const failures = [];

function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

/** Minimum intake the engine accepts, so a test isolates one gate. */
const intake = (overrides) => Object.assign({
  patientName: 'Test',
  clientLastName: 'Owner',
  diagnosis: 'TPLO Post-Op',
  treatmentApproach: 'Surgical',
}, overrides);

/**
 * What the engine actually does when this gate carries this value.
 *
 * Deliberately broad: a cautious value may restrict by raising a hard error,
 * by setting a severity flag, by excluding exercise codes, or by raising a
 * red-flag warning. Any one of those is the proposal doing its job. None of
 * them is the bug this file exists to catch.
 */
function engineEffect(field, value) {
  const fd = intake({ [field]: value });
  const { errors, warnings } = validateIntake(fd);
  const flags = Object.keys(fd).filter((k) => k.startsWith('_') && fd[k] === true);
  const excluded = getExcludedCodes(intake({ [field]: value }));
  return {
    blocks: errors.length > 0,
    flags,
    exclusions: excluded.size,
    redFlag: warnings.some((w) => /RED FLAG|CRITICAL/.test(w)),
    restrictsSomething:
      errors.length > 0 || flags.length > 0 || excluded.size > 0 ||
      warnings.some((w) => /RED FLAG|CRITICAL/.test(w)),
  };
}

const proposed = SAFETY_GATES.filter((g) => g.cautious !== null && g.cautious !== undefined);

// ---------------------------------------------------------------------------
// The invariant
// ---------------------------------------------------------------------------

test('every proposed cautious value actually restricts something', () => {
  const inert = [];
  for (const gate of proposed) {
    let effect;
    try {
      effect = engineEffect(gate.field, gate.cautious);
    } catch (err) {
      inert.push(`${gate.field}=${JSON.stringify(gate.cautious)} THREW: ${err.message}`);
      continue;
    }
    if (!effect.restrictsSomething) {
      inert.push(`${gate.field}=${JSON.stringify(gate.cautious)} had no effect`);
    }
  }
  assert.deepStrictEqual(
    inert, [],
    'These "most cautious" values change nothing in the engine:\n    ' +
    inert.join('\n    ') +
    '\n  A cautious default is a token the engine MATCHES, not a phrase that ' +
    'describes the state. Take the value from the form vocabularies in v2api.js.'
  );
});

test('no cautious value throws when the engine reads it', () => {
  // complicationsNoted was `true`, and validateIntake does
  // (formData.complicationsNoted || '').toLowerCase(). A boolean reaches that
  // as a boolean and the whole generation 500s.
  for (const gate of proposed) {
    assert.doesNotThrow(
      () => engineEffect(gate.field, gate.cautious),
      `${gate.field}=${JSON.stringify(gate.cautious)} threw. Check the type the ` +
      `engine expects — several of these fields are string-scanned`
    );
  }
});

test('a cautious value is a string or a boolean, never anything else', () => {
  for (const gate of proposed) {
    const t = typeof gate.cautious;
    assert.ok(
      t === 'string' || t === 'boolean',
      `${gate.field} proposes a ${t}. The engine either keyword-scans this field ` +
      `(string) or reads it as a flag (boolean); nothing else survives the trip`
    );
  }
});

// ---------------------------------------------------------------------------
// The specific regressions, named so they cannot come back quietly
// ---------------------------------------------------------------------------

test('the cautious weight-bearing state applies the NWB exclusion set', () => {
  const gate = SAFETY_GATES.find((g) => g.field === 'weightBearingStatus');
  const effect = engineEffect('weightBearingStatus', gate.cautious);
  assert.ok(
    effect.exclusions > 0,
    `weightBearingStatus proposes ${JSON.stringify(gate.cautious)}, which excluded ` +
    `nothing. The engine looks this up as an exact key in WEIGHT_BEARING_EXCLUSIONS`
  );
});

test('the cautious motor grade raises the neurological red flag', () => {
  const gate = SAFETY_GATES.find((g) => g.field === 'neuroMotorGrade');
  const effect = engineEffect('neuroMotorGrade', gate.cautious);
  assert.ok(
    effect.redFlag,
    `neuroMotorGrade proposes ${JSON.stringify(gate.cautious)}, which raised no flag. ` +
    `The engine scans for 'absent', 'none', '0/5' and 'grade 0'`
  );
});

test('the cautious deep pain value locks the protocol to Grade V support', () => {
  const gate = SAFETY_GATES.find((g) => g.field === 'neuroDeepPain');
  const effect = engineEffect('neuroDeepPain', gate.cautious);
  assert.ok(
    effect.flags.includes('_gradeVSupport'),
    'the most cautious deep pain value must set _gradeVSupport'
  );
});

// ---------------------------------------------------------------------------
// Where nothing honest exists, nothing is proposed
// ---------------------------------------------------------------------------

test('complications and incision status propose nothing, on purpose', () => {
  // Not an oversight, and not to be "fixed" by inventing a value.
  //
  // Any complications string that trips the scan asserts a complication that
  // may not exist. The only genuinely cautious incision values — Dehiscence,
  // Infection — hard-block generation, so proposing one would stop every
  // post-operative patient before a clinician had looked at them.
  //
  // Both gates are still RAISED and still must be confirmed; they simply
  // arrive empty. A blank a clinician must fill beats a fabricated value that
  // looks answered.
  for (const field of ['complicationsNoted', 'incisionStatus']) {
    const gate = SAFETY_GATES.find((g) => g.field === field);
    assert.ok(gate, `${field} is no longer a safety gate`);
    assert.strictEqual(
      gate.cautious, null,
      `${field} proposes ${JSON.stringify(gate.cautious)}. Read the note above ` +
      `SAFETY_GATES before changing this — there is no honest cautious value here`
    );
  }
});

test('a gate proposing nothing is still a gate', () => {
  // The whole point: null means "we did not fill this in", not "we dropped it".
  const nullGates = SAFETY_GATES.filter((g) => g.cautious === null);
  assert.ok(nullGates.length > 0, 'expected some gates to propose nothing');
  for (const gate of nullGates) {
    assert.ok(
      gate.field && gate.label,
      'a gate proposing no value must still carry the field and label it is asked by'
    );
  }
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`cautious-defaults: ${passed} passed`);
