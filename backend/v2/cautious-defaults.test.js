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
const {
  validateIntake, getExcludedCodes, diagnosisRecognised,
  getProtocolType, selectExercisesForWeek, PROTOCOL_DEFINITIONS,
} = require('../protocol-generator');
const { ALL_EXERCISES } = require('../all-exercises');
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

/**
 * Resolve a gate's cautious value for a given case.
 *
 * Some are conditional: crate rest and an e-collar are ordinary in the
 * fortnight after surgery and implausible months later, so they are functions
 * of how far post-op the patient is. Both branches have to be exercised — a
 * conditional default is two defaults, and a test that only reads one of them
 * is testing half the behaviour.
 */
const cautiousFor = (gate, postOpDays) =>
  (typeof gate.cautious === 'function'
    ? gate.cautious({ postOpDays, patient: {} })
    : gate.cautious);

/** Gates proposing a value for a patient three days after surgery. */
const proposed = SAFETY_GATES
  .map((g) => ({ ...g, cautious: cautiousFor(g, 3) }))
  .filter((g) => g.cautious !== null && g.cautious !== undefined);

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

// ---------------------------------------------------------------------------
// Post-operative restrictions expire
// ---------------------------------------------------------------------------

test('crate rest and an e-collar are proposed in the days after surgery', () => {
  for (const field of ['crateRestRequired', 'eCollarRequired']) {
    const gate = SAFETY_GATES.find((g) => g.field === field);
    assert.strictEqual(
      cautiousFor(gate, 3), true,
      `${field} must still be proposed three days post-operatively`
    );
  }
});

test('they stop being proposed once the acute window has passed', () => {
  // Proposing them regardless of time was degenerate, not merely cautious: a
  // TPLO patient 26 weeks post-op received the same five passive exercises
  // every week for eight weeks, and another protocol's last week held a single
  // modality. Answered "no", the same patients got 27 distinct exercises with
  // real progression.
  for (const field of ['crateRestRequired', 'eCollarRequired']) {
    const gate = SAFETY_GATES.find((g) => g.field === field);
    assert.strictEqual(
      cautiousFor(gate, 180), null,
      `${field} is still proposed six months post-operatively. A default that is ` +
      `obviously wrong every time is one people learn to accept without reading`
    );
  }
});

test('the boundary is 14 days, and day 14 is still acute', () => {
  for (const field of ['crateRestRequired', 'eCollarRequired']) {
    const gate = SAFETY_GATES.find((g) => g.field === field);
    assert.strictEqual(cautiousFor(gate, 14), true, `${field} on day 14`);
    assert.strictEqual(cautiousFor(gate, 15), null, `${field} on day 15`);
  }
});

test('with no surgery date at all they are still proposed', () => {
  // An undated post-operative record is treated as ACTIVE everywhere else in
  // this module, because we cannot know it has healed. Same here.
  for (const field of ['crateRestRequired', 'eCollarRequired']) {
    const gate = SAFETY_GATES.find((g) => g.field === field);
    assert.strictEqual(
      cautiousFor(gate, null), true,
      `${field} must stay cautious when nobody knows how far post-op this is`
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
// AN UNDESCRIBED PATIENT MUST NOT GENERATE
//
// The same defect this file exists for, one level up. Until 2026-09-24
// validateIntake DEFAULTED a missing diagnosis to 'Conditioning' and a missing
// region to 'Generalized'. Measured that day, a patient with no diagnosis, no
// region and no approach produced zero errors, routed to the OA protocol, and
// had ZERO exclusions applied. Every individual gate in this file was working;
// the patient simply had no findings for any of them to act on.
//
// A gate that restricts nothing because the value is inert is what the tests
// above catch. A whole protocol that restricts nothing because nobody said
// what was wrong with the animal is this one.
// ---------------------------------------------------------------------------

test('a patient with no diagnosis does not generate at all', () => {
  const fd = { patientName: 'Test', clientLastName: 'Owner' };
  const { valid, errors } = validateIntake(fd);
  assert.strictEqual(valid, false,
    'an undescribed patient validated. It used to receive a full OA protocol '
    + 'with no exclusions, and the only signal was a warning');
  assert.ok(errors.some((e) => /diagnosis/i.test(e)),
    'it must say which field is missing, not just refuse');
});

test('and the diagnosis is not fabricated on the way out', () => {
  const fd = { patientName: 'Test', clientLastName: 'Owner' };
  validateIntake(fd);
  assert.ok(!fd.diagnosis,
    'validateIntake mutates formData by design, but inventing a DIAGNOSIS is '
    + 'not a derived severity flag - it chooses the protocol');
});

test('a described patient is unaffected', () => {
  // The change must block the undescribed case and nothing else. Every
  // patient in the live database carries a condition.
  const { valid } = validateIntake(intake());
  assert.strictEqual(valid, true, 'an ordinary intake stopped validating');
});

test('region and approach still default, and still say so', () => {
  // These two remain fabrications presented as answers. That is tolerable only
  // because diagnosis - the field that routes - is now required. If they ever
  // stop warning, they become silent.
  const fd = intake({ affectedRegion: '', treatmentApproach: '' });
  const { valid, warnings } = validateIntake(fd);
  assert.strictEqual(valid, true);
  assert.strictEqual(fd.affectedRegion, 'Generalized');
  assert.strictEqual(fd.treatmentApproach, 'Conservative');
  assert.ok(warnings.some((w) => /affected region/i.test(w)), 'assumed a region silently');
  assert.ok(warnings.some((w) => /treatment approach/i.test(w)), 'assumed an approach silently');
});

// ---------------------------------------------------------------------------
// "WE CHOSE THIS" vs "NOTHING MATCHED"
//
// getProtocolType returns 'oa' both for a genuine OA-class condition and for
// text it does not understand at all. The catch-all is deliberate; being
// unable to tell the two apart was not.
// ---------------------------------------------------------------------------

test('an unrecognised diagnosis is reported, not silently routed', () => {
  const fd = intake({ diagnosis: 'Rehabilitation' });
  const { valid, warnings } = validateIntake(fd);
  assert.strictEqual(valid, true,
    'the OA catch-all is deliberate - this must warn, not block');
  assert.ok(warnings.some((w) => /matches no routing rule/i.test(w)),
    'a live patient was routed to the osteoarthritis protocol by fallthrough '
    + 'with nothing said about it');
});

test('a real OA-class diagnosis does NOT warn', () => {
  // The warning is worthless if it fires on the conditions the catch-all was
  // written for.
  for (const dx of ['Bilateral Hip Osteoarthritis', 'Elbow Dysplasia',
                    'Pelvic Fracture', 'Iliopsoas Strain', 'Obesity']) {
    const { warnings } = validateIntake(intake({ diagnosis: dx }));
    assert.ok(!warnings.some((w) => /matches no routing rule/i.test(w)),
      `"${dx}" is exactly what the OA protocol is for, and it was flagged`);
  }
});

test('a diagnosis that routes elsewhere is recognised by definition', () => {
  for (const dx of ['TPLO Post-Op', 'IVDD Hansen Type I', 'Degenerative Myelopathy']) {
    assert.ok(diagnosisRecognised(dx, '', ''), `${dx} reported as unrecognised`);
  }
});

test('gibberish is not recognised', () => {
  assert.strictEqual(diagnosisRecognised('zzz nonsense', '', ''), false,
    'if this passes, the recogniser recognises everything and reports nothing');
});

// ---------------------------------------------------------------------------
// THE PAIN >= 8 LOCK RIDES ON THE PALLIATIVE TOKEN
//
// PALLIATIVE was retired as a selectable approach on 2026-09-25 — a palliative
// patient is not a rehabilitation candidate, and the card is gone from the
// Treatment panel.
//
// The ENGINE still understands the token, and that is not leftover code:
//
//   selectExercisesForWeek:
//     const effectiveApproach =
//       formData._highPainOverride ? 'palliative' : formData.treatmentApproach;
//
// A patient at pain >= 8/10 is force-routed THROUGH 'palliative' into the
// comfort protocol and locked to Phase 1. Deleting the palliative branch in
// getProtocolType as "dead code now that the option is gone" would silently
// disable the severe-pain restriction, and the protocol would still generate
// and still look normal.
//
// These tests exist so that deletion fails loudly instead.
// ---------------------------------------------------------------------------

test('the token the high-pain override uses still routes to comfort care', () => {
  assert.strictEqual(getProtocolType('TPLO Post-Op', 'Left Stifle', 'palliative'), 'geriatric',
    "selectExercisesForWeek routes severe pain through the literal string "
    + "'palliative'. If this branch is gone, a dog at 9/10 gets the TPLO "
    + 'protocol instead of comfort care.');
});

test('pain >= 8 sets the override flag', () => {
  const fd = intake({ painScore: 9 });
  validateIntake(fd);
  assert.strictEqual(fd._highPainOverride, true,
    'the flag selectExercisesForWeek reads is not being set');
});

test('severe pain changes what a patient is actually prescribed', () => {
  // End to end, through the real selector. The two runs differ only in pain.
  const severe = intake({ painScore: 9, diagnosis: 'TPLO Post-Op', affectedRegion: 'Left Stifle' });
  const ordinary = intake({ painScore: 3, diagnosis: 'TPLO Post-Op', affectedRegion: 'Left Stifle' });
  validateIntake(severe);
  validateIntake(ordinary);

  const a = selectExercisesForWeek(1, 8, ALL_EXERCISES, severe).map((e) => e.code).sort();
  const b = selectExercisesForWeek(1, 8, ALL_EXERCISES, ordinary).map((e) => e.code).sort();

  assert.ok(a.length, 'the severe-pain patient received no exercises at all');
  assert.notDeepStrictEqual(a, b,
    'a dog at 9/10 was prescribed exactly what a dog at 3/10 was prescribed. '
    + 'The high-pain override is not reaching the selector.');

  // "Different" is not enough, and the first draft of this test stopped there.
  // With the palliative branch deleted the sets STILL differ, because the
  // Phase 1 lock fires on _highPainOverride independently of routing — so the
  // test passed while a severe-pain dog was being given the TPLO protocol's
  // first phase instead of the comfort protocol's. Assert WHICH protocol.
  const comfort = new Set(
    PROTOCOL_DEFINITIONS.geriatric.phases[0].exercises.map((e) => e.code)
  );
  const strays = a.filter((code) => !comfort.has(code));
  assert.deepStrictEqual(strays, [],
    'a dog at 9/10 was prescribed exercises that are not in the comfort '
    + `protocol's first phase: ${strays.join(', ')}. Severe pain must route `
    + 'through the palliative token into `geriatric`, not merely lock the phase.');
});

test('a palliative value arriving from anywhere is still honoured', () => {
  // The panel can no longer produce it, but the override does, and a legacy
  // or imported record may hold it. It must not be quietly reinterpreted.
  assert.strictEqual(getProtocolType('Bilateral Hip Osteoarthritis', 'Bilateral Hip', 'Palliative'),
    'geriatric', 'capitalised Palliative from a stored record stopped routing');
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`cautious-defaults: ${passed} passed`);
