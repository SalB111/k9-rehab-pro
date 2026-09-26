/**
 * How long is a protocol? — tests
 *
 * THE DEFECT THIS EXISTS FOR
 *
 * Until 2026-09-26 every protocol was generated at EIGHT WEEKS. The adapter
 * fell back to `parseInt(formData.protocolLength, 10) || 8` and the intake
 * form hardcoded `protocolLength: "8"`.
 *
 * Meanwhile each protocol had declared its own length all along —
 * `PROTOCOL_DEFINITIONS[type].defaultWeeks`: tplo 16, ivdd 12, oa 16,
 * geriatric 16, exactly as CLAUDE.md documents — read by NOTHING except the
 * knowledge engine's text ingestor, which merely described it to B.E.A.U. in
 * prose.
 *
 * So a sixteen-week TPLO was built as eight, with the whole progression
 * compressed into half its time: a dog reached "Return to Function" around
 * week six instead of week twelve. And SessionsView fell back to `|| 16` for
 * its own display, so three places held three different answers about the
 * length of the same protocol.
 *
 * Sal's decision: a real clinic default, falling back to the protocol's own
 * length when the practice has not set one.
 *
 *   node v2/protocol-length.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const adapter = require('./engine-adapter');
const generator = require('../protocol-generator');

const ROOT = path.join(__dirname, '..', '..');
const INTAKE_CONSTANTS = path.join(ROOT, 'k9-rehab-frontend', 'src', 'constants', 'clinical.js');
const SESSIONS = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'SessionsView.jsx');

const live = (p) => fs.readFileSync(p, 'utf8')
  .split('\n')
  .filter((l) => {
    const t = l.trim();
    return !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
  })
  .join('\n');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`); }
  catch (err) { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); }
}

const TPLO = { diagnosis: 'TPLO Post-Op', affectedRegion: 'Right Stifle' };
const IVDD = { diagnosis: 'IVDD Hansen Type I', affectedRegion: 'Thoracolumbar' };

console.log('\nprotocol-length\n');

// ── the chain, in order ────────────────────────────────────────────────────

test('a length chosen for THIS PATIENT wins over everything', () => {
  const r = adapter.resolveProtocolWeeks(
    { ...TPLO, protocolLength: '10', clinicDefaultProtocolWeeks: 12 }, generator
  );
  assert.strictEqual(r.weeks, 10, 'a clinician\'s choice for this animal must win');
  assert.strictEqual(r.source, 'this patient');
});

test('the clinic default wins over the protocol definition', () => {
  const r = adapter.resolveProtocolWeeks({ ...TPLO, clinicDefaultProtocolWeeks: 12 }, generator);
  assert.strictEqual(r.weeks, 12);
  assert.strictEqual(r.source, 'clinic default');
});

test('THE DEFECT — a TPLO with nothing set is 16 weeks, not 8', () => {
  const r = adapter.resolveProtocolWeeks(TPLO, generator);
  assert.strictEqual(
    r.weeks, 16,
    'a TPLO is documented as a sixteen-week protocol and was being generated '
    + 'as eight, compressing the whole progression into half its time'
  );
});

test('and an IVDD is 12 — this is not one number for everything', () => {
  const r = adapter.resolveProtocolWeeks(IVDD, generator);
  assert.strictEqual(r.weeks, 12, 'IVDD is a twelve-week protocol');
});

test('every protocol gets the length IT declares', () => {
  // `defaultWeeks` was declared for all four and read by nothing. This is the
  // assertion that it is now actually used.
  const byType = {
    tplo: TPLO,
    ivdd: IVDD,
    oa: { diagnosis: 'Osteoarthritis', affectedRegion: 'Both hips' },
    geriatric: { diagnosis: 'Geriatric Mobility Decline', affectedRegion: '' },
  };
  for (const [type, formData] of Object.entries(byType)) {
    const declared = generator.PROTOCOL_DEFINITIONS[type].defaultWeeks;
    const routed = generator.getProtocolType(formData.diagnosis, formData.affectedRegion);
    if (routed !== type) continue; // routing is tested elsewhere
    const r = adapter.resolveProtocolWeeks(formData, generator);
    assert.strictEqual(
      r.weeks, declared,
      `${type} declares ${declared} weeks and the adapter chose ${r.weeks}`
    );
  }
});

test('the bare 8 is a floor, not a default, and it says so', () => {
  // It may only fire when nothing routes and nobody chose. Reaching it should
  // be visible — a protocol whose length nobody chose is worth noticing.
  const r = adapter.resolveProtocolWeeks({ diagnosis: '', affectedRegion: '' }, generator);
  assert.ok(r.weeks >= 1, 'there must always be some length');
  if (r.weeks === 8) {
    assert.ok(
      /nobody chose|fallback/i.test(r.source),
      'the 8-week floor does not identify itself, so a protocol nobody sized '
      + 'looks the same as one that was chosen'
    );
  }
});

test('a nonsense length is ignored rather than used', () => {
  for (const bad of ['0', '-4', '999', 'abc', '']) {
    const r = adapter.resolveProtocolWeeks({ ...TPLO, protocolLength: bad }, generator);
    assert.strictEqual(
      r.weeks, 16,
      `protocolLength ${JSON.stringify(bad)} was accepted instead of falling through`
    );
  }
});

// ── and the ENGINE must actually use it ────────────────────────────────────

test('THE ENGINE BUILDS 16 WEEKS FOR A TPLO, not just the resolver', () => {
  // WRITTEN BECAUSE MUTATION TESTING CAUGHT THE GAP. Every test above calls
  // resolveProtocolWeeks directly, so putting the bare `|| 8` back inside
  // runEngine passed all of them — the resolver was right and nothing used
  // it. A chain nothing consumes is the defect wearing a different hat.
  const allExercises = require('../all-exercises');
  const list = allExercises.ALL_EXERCISES || allExercises.allExercises || allExercises;

  const formData = adapter.toEngineFormData({
    patient: {
      name: 'Testdog', client_name: 'Owner',
      condition: 'TPLO Post-Op', affected_region: 'Right Stifle',
      treatment_approach: 'Surgical',
    },
    visit: {},
    clinic: {},
    protocol: {},   // no length anywhere: the protocol's own must decide
  });

  const result = adapter.runEngine(formData, generator, list);
  assert.ok(result && Array.isArray(result.weeks), 'the engine returned no weeks');
  assert.strictEqual(
    result.weeks.length, 16,
    `the engine built a ${result.weeks.length}-week TPLO. It is documented as `
    + 'sixteen, the protocol declares sixteen, and the resolver returns sixteen '
    + '— so the engine is not using the resolver.'
  );
});

test('the engine honours a clinic default end to end', () => {
  const allExercises = require('../all-exercises');
  const list = allExercises.ALL_EXERCISES || allExercises.allExercises || allExercises;
  const formData = adapter.toEngineFormData({
    patient: {
      name: 'Testdog', client_name: 'Owner',
      condition: 'TPLO Post-Op', affected_region: 'Right Stifle',
      treatment_approach: 'Surgical',
    },
    visit: {},
    clinic: { default_protocol_weeks: 12 },
    protocol: {},
  });
  const result = adapter.runEngine(formData, generator, list);
  assert.strictEqual(
    result.weeks.length, 12,
    'the clinic default did not reach the engine, so a practice cannot set its '
    + 'own house standard'
  );
});

// ── no screen invents a length ─────────────────────────────────────────────

test('the intake form no longer hardcodes 8 weeks', () => {
  const src = live(INTAKE_CONSTANTS);
  assert.ok(
    !/protocolLength:\s*"8"/.test(src),
    'clinical.js hardcodes an 8-week protocol again, which overrides the '
    + 'condition\'s own documented length for every patient'
  );
});

test('the sessions screen does not invent its own length', () => {
  const src = live(SESSIONS);
  assert.ok(
    !/protocol_length_weeks \|\| 16/.test(src),
    'SessionsView falls back to 16 again. Three places held three different '
    + 'answers about the same protocol; a screen reads the length that was '
    + 'generated or says it does not know.'
  );
});

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  process.exit(1);
}
console.log(`\nprotocol-length: ${passed} passed\n`);
