/**
 * V1 -> V2 bridge — tests
 *
 * WHAT THIS PROTECTS
 *
 * The bridge reads the V1 clinical record and offers it to the engine. Every
 * value it maps is a value a protocol may be built on, so the tests below do
 * two things no fixture can:
 *
 *   1. They read the OPTION LISTS out of DashboardView.jsx and put every one
 *      through the mapper. A map fitted to the values that happen to be stored
 *      today would pass while failing on the first patient who picks an option
 *      nobody has picked yet — and one of those options is "Absent — bilateral"
 *      deep pain, which must lock the protocol to passive supportive care.
 *
 *   2. They put the mapped result through the REAL engine and assert the gate
 *      actually fires. A mapping that produces a plausible-looking string the
 *      engine does not match is the defect this whole codebase keeps having.
 *
 *   node v2/dashboard-bridge.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const bridge = require('./dashboard-bridge');
const { validateIntake, getExcludedCodes } = require('../protocol-generator');

const DASHBOARD = path.join(
  __dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx'
);

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

/**
 * Every option the V1 dashboard offers for a given field label.
 *
 * Read from the source rather than listed here, so a new option added to the
 * dashboard arrives in these tests automatically instead of quietly bypassing
 * the mapper.
 */
function optionsFor(label) {
  const src = fs.readFileSync(DASHBOARD, 'utf8');
  const found = [];
  const block = new RegExp(
    'label=\\{?"' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"\\}?([\\s\\S]{0,1200}?)(?:\\/>|<\\/F>)',
    'g'
  );
  let m;
  while ((m = block.exec(src))) {
    const opts = /options=\{\[([\s\S]*?)\]\}/.exec(m[1]);
    if (!opts) continue;
    for (const s of opts[1].match(/"(?:[^"\\]|\\.)*"/g) || []) {
      found.push(JSON.parse(s));
    }
  }
  return found;
}

const intake = (over) => Object.assign({
  patientName: 'Test', clientLastName: 'Owner',
  diagnosis: 'TPLO Post-Op', treatmentApproach: 'Surgical',
}, over);

// ---------------------------------------------------------------------------
// The option lists are actually reachable
// ---------------------------------------------------------------------------

test('the dashboard option lists can still be read from source', () => {
  // If DashboardView is refactored so these cannot be extracted, every test
  // below would silently pass over an empty list. Fail loudly instead.
  for (const label of ['Deep Pain Perception', 'Incision Status', 'Lameness Grade']) {
    assert.ok(
      optionsFor(label).length > 0,
      `no options found for "${label}" — the extractor no longer matches ` +
      `DashboardView.jsx, so these tests would be checking nothing`
    );
  }
});

// ---------------------------------------------------------------------------
// Deep pain — the gate that matters most
// ---------------------------------------------------------------------------

test('every "Absent" deep pain option locks the protocol to Grade V support', () => {
  const opts = optionsFor('Deep Pain Perception').filter((o) => /absent/i.test(o));
  assert.ok(opts.length > 0, 'the dashboard no longer offers an absent deep pain option');
  for (const raw of opts) {
    const mapped = bridge.deepPain(raw);
    assert.strictEqual(mapped, 'Absent', `"${raw}" mapped to ${JSON.stringify(mapped)}`);
    const fd = intake({ neuroDeepPain: mapped });
    validateIntake(fd);
    assert.strictEqual(
      fd._gradeVSupport, true,
      `"${raw}" did not set _gradeVSupport through the engine`
    );
  }
});

test('"Not tested" deep pain is never read as absent', () => {
  // The most dangerous possible mapping error in this module: an untested
  // reflex becoming a recorded absence would lock a walking dog into passive
  // care, and — far worse in the other direction — a mapper that treated
  // anything unrecognised as "Present" would hide a real Grade V.
  const notTested = optionsFor('Deep Pain Perception').filter((o) => /not tested/i.test(o));
  assert.ok(notTested.length > 0, 'expected a "Not tested" option');
  for (const raw of notTested) {
    assert.strictEqual(
      bridge.deepPain(raw), null,
      `"${raw}" must map to null — it is neither presence nor absence`
    );
  }
});

test('every deep pain option maps to Present, Absent, or nothing', () => {
  for (const raw of optionsFor('Deep Pain Perception')) {
    const mapped = bridge.deepPain(raw);
    assert.ok(
      mapped === 'Present' || mapped === 'Absent' || mapped === null,
      `"${raw}" mapped to ${JSON.stringify(mapped)}`
    );
  }
});

test('a unilateral deep pain finding is not reported as present', () => {
  // "Present — right only" means deep pain is ABSENT ON THE LEFT. The engine
  // has one neuroDeepPain input, so mapping this to "Present" reports the
  // better side and hides a deficit that in a spinal patient is serious.
  //
  // Only "bilateral" presence may be read as present. Anything unilateral
  // comes back null and the clinician states it.
  const unilateral = optionsFor('Deep Pain Perception')
    .filter((o) => /only|unilateral/i.test(o));
  assert.ok(unilateral.length >= 2, 'the dashboard offers one-sided deep pain options');
  for (const raw of unilateral) {
    assert.strictEqual(
      bridge.deepPain(raw), null,
      `"${raw}" mapped to ${JSON.stringify(bridge.deepPain(raw))}. A one-sided ` +
      `finding is neither of the two things this field can say`
    );
  }
});

test('bilateral presence is still read as present', () => {
  assert.strictEqual(bridge.deepPain('Present — bilateral'), 'Present');
});

// ---------------------------------------------------------------------------
// Incision status — two options must hard-block generation
// ---------------------------------------------------------------------------

const blocks = (value) =>
  validateIntake(intake({ incisionStatus: value }))
    .errors.some((e) => /Post-operative complication detected/.test(e));

test('dehiscence and suspected infection both stop generation', () => {
  const opts = optionsFor('Incision Status');
  const dangerous = opts.filter((o) => /dehisc|infect/i.test(o));
  assert.ok(
    dangerous.length >= 2,
    `expected the dashboard to offer dehiscence AND infection; found ${JSON.stringify(dangerous)}`
  );
  for (const raw of dangerous) {
    const mapped = bridge.incisionStatus(raw);
    assert.ok(mapped, `"${raw}" mapped to nothing — a compromised incision must not read as absent`);
    assert.ok(
      blocks(mapped),
      `"${raw}" mapped to "${mapped}", which does not hard-block generation`
    );
  }
});

test('a healed incision does not block, and is not invented as healthy either', () => {
  const healed = optionsFor('Incision Status').filter((o) => /healed|healing well/i.test(o));
  assert.ok(healed.length > 0, 'expected a healed option');
  for (const raw of healed) {
    assert.strictEqual(bridge.incisionStatus(raw), 'Healing normally');
    assert.ok(!blocks('Healing normally'), 'a healed incision must not block generation');
  }
});

test('an incision finding with no engine equivalent maps to nothing, not to healthy', () => {
  // "Mild erythema", "Serosanguinous discharge", "Not yet evaluated" are real
  // findings the engine has no key for. Mapping them to "Healing normally"
  // would assert something clinically untrue to make the form look complete.
  for (const raw of ['Mild erythema', 'Serosanguinous discharge', 'Not yet evaluated']) {
    assert.strictEqual(
      bridge.incisionStatus(raw), null,
      `"${raw}" must map to null rather than be rounded to a value the engine likes`
    );
  }
});

// ---------------------------------------------------------------------------
// Weight bearing — three controls, four vocabularies, one engine token
// ---------------------------------------------------------------------------

test('every weight-bearing option from every control maps to an engine key', () => {
  const opts = [
    ...optionsFor('Weight Bearing Status'),
    ...optionsFor('Current Mobility Level'),
    // Values found in production that match none of the current option lists —
    // written by an older version of the control. Keys are labels, so old
    // values outlive the lists that produced them.
    'Full weight bearing — intermittent lameness',
    'Full weight bearing — no lameness',
  ];
  assert.ok(opts.length >= 10, `expected options from several controls, got ${opts.length}`);
  for (const raw of opts) {
    const mapped = bridge.weightBearing(raw);
    assert.ok(
      ['NWB', 'TTWB', 'PWB', 'FWB'].includes(mapped),
      `"${raw}" mapped to ${JSON.stringify(mapped)}, which is not an engine key`
    );
  }
});

test('"Non-weight bearing" is never read as full weight bearing', () => {
  // It contains the words "weight bearing". Getting the order of these tests
  // wrong turns the most restricted patient into the least restricted one.
  for (const raw of ['Non-weight bearing (NWB)', 'NWB', 'Grade 5 — Non-weight bearing']) {
    assert.strictEqual(bridge.weightBearing(raw), 'NWB', `"${raw}" misread`);
  }
});

test('each weight-bearing option maps to its OWN key, not merely to some key', () => {
  // A weaker version of this test — "maps to one of the four" — passed while
  // toe-touching was collapsed into partial. That is not a cosmetic error:
  // TTWB withholds 30 exercises and PWB withholds 11, so the mistake hands a
  // toe-touching patient nineteen exercises their limb cannot take.
  //
  // Every string the three controls can produce, and every string found in
  // production, with the key it must produce.
  const EXPECTED = [
    ['NWB', 'NWB'],
    ['Non-weight bearing (NWB)', 'NWB'],
    ['Grade 5 — Non-weight bearing', 'NWB'],
    ['Toe-touching', 'TTWB'],
    ['Toe-touching (TTWB)', 'TTWB'],
    ['Toe-touching weight bearing (TTWB)', 'TTWB'],
    ['Partial', 'PWB'],
    ['Partial weight bearing (PWB)', 'PWB'],
    ['Full', 'FWB'],
    ['Full weight bearing (FWB)', 'FWB'],
    ['Full weight bearing with lameness (FWBL)', 'FWB'],
    ['Weight bearing — subtle lameness', 'FWB'],
    ['Normal — no lameness', 'FWB'],
    // Written by an older version of the control; still in production.
    ['Full weight bearing — intermittent lameness', 'FWB'],
    ['Full weight bearing — no lameness', 'FWB'],
  ];
  for (const [raw, expected] of EXPECTED) {
    assert.strictEqual(
      bridge.weightBearing(raw), expected,
      `"${raw}" must map to ${expected}, got ${JSON.stringify(bridge.weightBearing(raw))}`
    );
  }
});

test('the restriction ladder is intact between adjacent weight-bearing states', () => {
  // Adjacent states, not just the extremes: collapsing TTWB into PWB kept the
  // NWB > PWB > FWB ordering true while losing a whole tier of restriction.
  const n = (k) => getExcludedCodes(intake({ weightBearingStatus: k })).size;
  assert.ok(n('NWB') > n('TTWB'), `NWB (${n('NWB')}) must exclude more than TTWB (${n('TTWB')})`);
  assert.ok(n('TTWB') > n('PWB'), `TTWB (${n('TTWB')}) must exclude more than PWB (${n('PWB')})`);
  assert.ok(n('PWB') > n('FWB'), `PWB (${n('PWB')}) must exclude more than FWB (${n('FWB')})`);
});

test('each mapped weight-bearing value restricts as much as it should', () => {
  const sizes = {};
  for (const key of ['FWB', 'PWB', 'TTWB', 'NWB']) {
    sizes[key] = getExcludedCodes(intake({ weightBearingStatus: key })).size;
  }
  assert.ok(
    sizes.NWB > sizes.TTWB && sizes.TTWB > sizes.PWB && sizes.PWB > sizes.FWB,
    `exclusions must increase as weight bearing decreases, got ${JSON.stringify(sizes)}`
  );
});

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

test('every lameness grade option yields its number', () => {
  const opts = optionsFor('Lameness Grade');
  assert.ok(opts.length >= 5, 'expected the full lameness scale');
  for (const raw of opts) {
    const n = bridge.gradeNumber(raw);
    assert.ok(
      Number.isInteger(n) && n >= 0 && n <= 5,
      `"${raw}" produced ${JSON.stringify(n)}`
    );
  }
});

test('a pain range is read at its upper bound', () => {
  // "4-5" is in production. Pain drives restriction — 8 or more forces
  // palliative — so the higher number is the cautious read of a range.
  assert.strictEqual(bridge.painScore('4-5'), 5);
  assert.strictEqual(bridge.painScore('3'), 3);
  assert.strictEqual(bridge.painScore(''), null);
  assert.strictEqual(bridge.painScore('none recorded'), null);
  assert.strictEqual(bridge.painScore('99'), null, 'out of scale must not be accepted');
});

// ---------------------------------------------------------------------------
// Reading a whole record
// ---------------------------------------------------------------------------

const BELLA = {
  id: 1, name: 'Bella', age: 6, weight: 68,
  dashboard_data: JSON.stringify({
    'client::Patient Name': 'Bella',
    'client::Age (years)': '2',
    'client::Weight (lbs)': '64',
    'assessment::Primary Diagnosis': 'Right cranial cruciate ligament (CCL) rupture s/p TPLO',
    'assessment::Relevant Medical & Surgical History': 'R CCL rupture diagnosed 2026-03-10. TPLO performed 2026-03-21.',
    'assessment::Numeric Rating Scale (NRS 0–10)': '3',
    'assessment::Lameness Grade': 'Grade 2 — Mild, consistent',
    'assessment::Deep Pain Perception': 'Present — bilateral',
    'assessment::Neurological Grade (Frankel Modified)': 'Grade 0 — No pain, no deficits',
    'treatment::Approach': 'Surgical',
    'treatment::Surgery Date': '2026-03-21',
    'treatment::Affected Limb(s)': 'Right hindlimb (RH)',
    'treatment::Weight Bearing Status': 'Partial weight bearing (PWB)',
    'treatment::Incision Status': 'Fully healed / staples removed',
    'treatment::Activity Restrictions': 'Leash-only x 8 weeks post-op.',
  }),
};

test('a real V1 record produces the engine inputs it should', () => {
  const r = bridge.readDashboard(BELLA);
  assert.strictEqual(r.present, true);
  assert.strictEqual(r.values.weightBearingStatus, 'PWB');
  assert.strictEqual(r.values.incisionStatus, 'Healing normally');
  assert.strictEqual(r.values.neuroDeepPain, 'Present');
  assert.strictEqual(r.values.painScore, 3);
  assert.strictEqual(r.values.lamenessGrade, 2);
  assert.strictEqual(r.values.surgeryDate, '2026-03-21');
  assert.strictEqual(r.values.affectedRegion, 'Right hindlimb (RH)');
  assert.strictEqual(r.values.treatmentApproach, 'Surgical');
  assert.ok(/CCL rupture diagnosed/.test(r.values.medicalHistory));
});

test('every value read carries where it came from', () => {
  const r = bridge.readDashboard(BELLA);
  for (const field of Object.keys(r.values)) {
    const p = r.provenance[field];
    assert.ok(p && p.key, `${field} has no provenance`);
    assert.ok(
      p.raw !== undefined,
      `${field} does not carry the raw V1 value — a clinician checking a ` +
      `proposed value must be able to see what it was read from`
    );
  }
});

test('safety gates read from the V1 record are still marked as gates', () => {
  const r = bridge.readDashboard(BELLA);
  for (const field of ['weightBearingStatus', 'incisionStatus', 'neuroDeepPain']) {
    assert.strictEqual(
      r.provenance[field].gate, true,
      `${field} must be marked a gate. Reading a value from the V1 record is ` +
      `evidence, never confirmation — the clinician still ticks it`
    );
  }
});

test('a patient with no V1 record reads as absent, not as empty values', () => {
  const r = bridge.readDashboard({ id: 2, name: 'Nobody' });
  assert.strictEqual(r.present, false);
  assert.deepStrictEqual(r.values, {});
  assert.deepStrictEqual(r.unmapped, []);
});

test('a corrupt blob reads as absent rather than throwing', () => {
  for (const bad of ['{not json', '[]', 'null', '', 12345]) {
    const r = bridge.readDashboard({ dashboard_data: bad });
    assert.strictEqual(r.present, false, `${JSON.stringify(bad)} should read as absent`);
  }
});

test('a value the map cannot interpret is reported, not dropped', () => {
  const r = bridge.readDashboard({
    dashboard_data: JSON.stringify({ 'treatment::Incision Status': 'Mild erythema' }),
  });
  assert.strictEqual(r.values.incisionStatus, undefined, 'it must not be guessed at');
  assert.ok(
    r.unmapped.some((u) => u.value === 'Mild erythema'),
    'an uninterpretable clinical finding must come back in `unmapped` so it can ' +
    'be seen and the map extended'
  );
});

// ---------------------------------------------------------------------------
// Renamed labels
// ---------------------------------------------------------------------------

test('a field stored under an older label is still found', () => {
  // `key = blockId::label`, so renaming a field in the dashboard orphans every
  // value stored under the old name. Live example: 10 patients hold
  // "Neurological Grade (Frankel Modified)" and 2 hold the earlier
  // "(Frankel / ASIA Modified)".
  const older = bridge.CONTEXT_KEYS.filter((k) => /Frankel/.test(k));
  assert.ok(
    older.length >= 2,
    'both spellings of the neurological grade key must be listed, or the two ' +
    'patients holding the older one lose it'
  );
});

test('every mapped field lists its keys newest-first and none is empty', () => {
  for (const entry of bridge.MAP) {
    assert.ok(Array.isArray(entry.keys) && entry.keys.length > 0, `${entry.to} has no keys`);
    for (const k of entry.keys) {
      assert.ok(/^[a-z]+::/.test(k), `"${k}" is not a BLOCK::LABEL key`);
    }
    assert.strictEqual(typeof entry.via, 'function', `${entry.to} has no normaliser`);
  }
});

test('fields recorded under more than one key keep every one of them', () => {
  // Dropping an alias loses every patient whose value is stored under it, and
  // loses them silently — the field simply reads as unfilled. A weaker version
  // of this test passed while an alias was deleted.
  //
  // Each of these is a key the dashboard has actually written at some point:
  // a renamed label, or a second control for the same fact in another block.
  const REQUIRED = {
    diagnosis: ['assessment::Primary Diagnosis', 'treatment::Primary Diagnosis'],
    weightBearingStatus: [
      'treatment::Weight Bearing Status',
      'assessment::Weight Bearing Status',
      'assessment::Current Mobility Level',
    ],
    affectedRegion: ['treatment::Affected Limb(s)', 'treatment::Affected Area'],
    currentMedications: ['assessment::Current Pain Medications', 'treatment::Current Medications'],
    surgeryDate: ['treatment::Surgery Date', 'assessment::Date of Diagnosis / Surgery'],
  };
  for (const [field, keys] of Object.entries(REQUIRED)) {
    const entry = bridge.MAP.find((e) => e.to === field);
    assert.ok(entry, `${field} is no longer mapped at all`);
    for (const k of keys) {
      assert.ok(
        entry.keys.includes(k),
        `${field} no longer reads "${k}". Keys are LABELS — renaming a field in ` +
        `DashboardView orphans everything stored under the old name, and a ` +
        `dropped alias reads as an empty field rather than an error`
      );
    }
  }
});

test('the alias order puts the most specific key first', () => {
  // weightBearingStatus falls back to Current Mobility Level, which is a
  // mobility control rather than a weight-bearing one. It must be the LAST
  // resort, or it shadows the dedicated field.
  const entry = bridge.MAP.find((e) => e.to === 'weightBearingStatus');
  const mobilityAt = entry.keys.indexOf('assessment::Current Mobility Level');
  assert.strictEqual(
    mobilityAt, entry.keys.length - 1,
    'Current Mobility Level must be the last fallback for weight bearing'
  );
});

// ---------------------------------------------------------------------------
// Disagreements are surfaced, never resolved
// ---------------------------------------------------------------------------

test('a column and a V1 record that disagree are reported', () => {
  // Bella is 6 in the column and 2 in the V1 record, and her date of birth
  // agrees with the 2. Which is right is a clinical question; this module only
  // has to make sure nobody has to notice it by accident.
  const d = bridge.disagreements(BELLA, bridge.COMPARABLE);
  const age = d.find((x) => x.field === 'Age');
  assert.ok(age, 'the age disagreement must be reported');
  assert.strictEqual(age.column, '6');
  assert.strictEqual(age.v1Record, '2');
  const weight = d.find((x) => x.field === 'Weight (lbs)');
  assert.ok(weight, 'the weight disagreement must be reported');
});

test('a difference in spelling is not reported as a disagreement', () => {
  // Run over production this flagged 24 differences, of which 16 were
  // punctuation or granularity: "Female - Spayed" against "Female — Spayed",
  // and the column's joint ("Right stifle") against V1's limb ("Right hindlimb
  // (RH)"). A report that is two-thirds noise is a report nobody reads, and
  // then the six wrong ages in it go unnoticed.
  const d = bridge.disagreements({
    sex: 'Female - Spayed',
    age: 2,
    dashboard_data: JSON.stringify({
      'client::Sex': 'Female — Spayed',
      'client::Age (years)': '2.0',
    }),
  }, bridge.COMPARABLE);
  assert.deepStrictEqual(
    d, [],
    'an em dash and a trailing zero are not clinical disagreements'
  );
});

test('the noisy fields stay out of the comparison', () => {
  const compared = bridge.COMPARABLE.map((f) => f.column);
  for (const noisy of ['name', 'affected_region', 'breed']) {
    assert.ok(
      !compared.includes(noisy),
      `${noisy} is being compared again. The columns carry a "TEST — " prefix ` +
      `and a joint-level region; V1 carries the plain name and the limb. Both ` +
      `are true, and flagging them buried the differences that were not`
    );
  }
});

test('a real numeric difference is still caught', () => {
  const d = bridge.disagreements({
    age: 0,
    dashboard_data: JSON.stringify({ 'client::Age (years)': '14' }),
  }, bridge.COMPARABLE);
  assert.strictEqual(d.length, 1, 'a stored age of 0 against a V1 record of 14 must be reported');
  assert.strictEqual(d[0].field, 'Age');
});

test('nothing is reported when either side is empty', () => {
  const d = bridge.disagreements(
    { age: 6, dashboard_data: '{}' },
    bridge.COMPARABLE
  );
  assert.deepStrictEqual(d, [], 'a missing V1 value is not a disagreement');
});

// ---------------------------------------------------------------------------

// ── contact fields ───────────────────────────────────────────────────────────
// Added with the client block. These are about the OWNER rather than the
// animal, but a practice that rings the wrong number after a post-operative
// complication reaches nobody.

test('a placeholder left in a column is reported against the real V1 value', () => {
  const d = bridge.disagreements({
    client_email: 'sarah@example.com',
    client_phone: '(555) 123-4567',
    dashboard_data: JSON.stringify({
      'client::Email': 'sarah.thompson@gmail.com',
      'client::Phone': '(954) 555-0142',
    }),
  }, bridge.COMPARABLE);
  assert.ok(d.find((x) => x.field === 'Client email'), 'a seed email must be reported');
  assert.ok(d.find((x) => x.field === 'Client phone'), 'a seed phone must be reported');
});

test('a phone number is compared on its digits, not its punctuation', () => {
  const d = bridge.disagreements({
    client_phone: '(954) 555-0142',
    dashboard_data: JSON.stringify({ 'client::Phone': '954-555-0142' }),
  }, bridge.COMPARABLE);
  assert.deepStrictEqual(d, [], 'brackets and dashes are not a disagreement');
});

test('a country code is left as a difference rather than guessed away', () => {
  // Stripping a leading 1 would also strip an area code on a ten-digit number,
  // which is how a comparison quietly stops catching real mismatches.
  const d = bridge.disagreements({
    client_phone: '+1 954 555 0142',
    dashboard_data: JSON.stringify({ 'client::Phone': '954 555 0142' }),
  }, bridge.COMPARABLE);
  assert.strictEqual(d.length, 1, 'an unexplained extra digit is worth a human look');
});

test('an email differs only by case is not a disagreement', () => {
  const d = bridge.disagreements({
    client_email: 'Sarah.Thompson@Gmail.com',
    dashboard_data: JSON.stringify({ 'client::Email': 'sarah.thompson@gmail.com' }),
  }, bridge.COMPARABLE);
  assert.deepStrictEqual(d, []);
});

test("the owner's name is compared across both V1 fields, not one of them", () => {
  // The column holds one name; the V1 record holds a first and a last. Reading
  // only the first would miss a changed surname entirely.
  const d = bridge.disagreements({
    client_name: 'Sarah Thompson',
    dashboard_data: JSON.stringify({
      'client::Client First Name': 'Sarah',
      'client::Client Last Name': 'Thompson',
    }),
  }, bridge.COMPARABLE);
  assert.deepStrictEqual(d, [], 'the joined name matches');

  const changed = bridge.disagreements({
    client_name: 'Sarah Martinez',
    dashboard_data: JSON.stringify({
      'client::Client First Name': 'Sarah',
      'client::Client Last Name': 'Thompson',
    }),
  }, bridge.COMPARABLE);
  assert.strictEqual(changed.length, 1, 'a different surname must be caught');
});

test("a veterinarian's name sitting in the client column is reported", () => {
  // The defect this comparison was added for. A title is NOT stripped: a rule
  // that removed "Dr." would equate a vet with a client of the same name.
  const d = bridge.disagreements({
    client_name: 'Dr. Sarah Martinez',
    dashboard_data: JSON.stringify({
      'client::Client First Name': 'Sarah',
      'client::Client Last Name': 'Thompson',
    }),
  }, bridge.COMPARABLE);
  const hit = d.find((x) => x.field === 'Client name');
  assert.ok(hit, 'the client column holding a vet name must be reported');
  assert.strictEqual(hit.column, 'Dr. Sarah Martinez');
  assert.strictEqual(hit.v1Record, 'Sarah Thompson');
});

test('a title alone IS reported — accepted noise, pinned so the trade is visible', () => {
  // Not a safety property. The vet-in-the-client-column defect is caught on
  // the surname either way; what this pins is the everyday case where the
  // owner is themselves a doctor. If titles ever outnumber real mismatches,
  // strip them in sameName and change this test deliberately.
  const d = bridge.disagreements({
    client_name: 'Dr. Sarah Thompson',
    dashboard_data: JSON.stringify({
      'client::Client First Name': 'Sarah',
      'client::Client Last Name': 'Thompson',
    }),
  }, bridge.COMPARABLE);
  assert.strictEqual(d.length, 1, 'a title difference is currently reported');
});

test('a composite field still reports which V1 keys it read', () => {
  const [hit] = bridge.disagreements({
    client_name: 'Someone Else',
    dashboard_data: JSON.stringify({
      'client::Client First Name': 'Sarah',
      'client::Client Last Name': 'Thompson',
    }),
  }, bridge.COMPARABLE);
  assert.ok(hit.key && hit.key.includes('Client First Name'),
    'a report with no key tells nobody where to go and fix it');
});

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`dashboard-bridge: ${passed} passed`);
