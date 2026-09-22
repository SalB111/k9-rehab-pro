/**
 * Patient record correction — tests
 *
 * WHAT THIS PROTECTS
 *
 * `PUT /api/patients/:id` existed from V1 and NOTHING in the app called it —
 * I grepped the whole of src/ to be sure. A record was written once at
 * registration and frozen: a wrong weight stayed wrong, newly started
 * medications never reached the contraindication scan, and a missing surgery
 * date could never be supplied, so a post-operative patient could not have a
 * recovery phase calculated at all. That is the state the only real
 * post-operative record in the database is in.
 *
 * The edit surface added 22 Sep 2026 calls that route. Three things have to
 * stay true for it to be safe:
 *
 *   1. Only CHANGED fields are sent. The route builds its UPDATE from the keys
 *      it receives, so sending everything would stamp over columns another
 *      screen may have written while the form sat open.
 *   2. Weight stays POUNDS. The form shows kilograms beside it, and that
 *      display field must never reach the record as a second weight.
 *   3. Clinical scales are bounded. The validator applied one blanket 0-1000
 *      to every number, which accepted a body condition score of 40 and a pain
 *      score of 87 — values no chart can be read against.
 *
 *   node v2/patient-edit.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');
const EDIT_FORM = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'clinical', 'EditPatient.jsx');
const SHARED = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'clinical', 'PatientForm.jsx');
const V2API = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'clinical', 'v2api.js');
const SERVER = path.join(ROOT, 'backend', 'server.js');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (err) { failures.push({ name, message: err.message }); }
}

const read = (p) => fs.readFileSync(p, 'utf8');

// ---------------------------------------------------------------------------
// Only what changed is sent
// ---------------------------------------------------------------------------

test('the edit form sends only fields that actually changed', () => {
  const src = read(EDIT_FORM);
  assert.ok(
    /if \(now === String\(was\)\.trim\(\)\) continue;/.test(src),
    'EditPatient no longer skips unchanged fields. Sending every field on every ' +
    'save rewrites columns the clinician did not touch'
  );
  assert.ok(
    /onSave\(pending\)/.test(src),
    'EditPatient must submit the computed diff, not the whole form'
  );
});

test('saving with nothing changed is not possible', () => {
  const src = read(EDIT_FORM);
  assert.ok(
    /changedCount > 0/.test(src),
    'the save button must be disabled when nothing changed — an empty PUT is a ' +
    'write with no intent behind it'
  );
});

test('an emptied field is sent as null, never as an empty string', () => {
  // The intake proposal reads a missing surgery date as "no surgery". An empty
  // string is neither a date nor an absence, and it reaches applicableGates()
  // as a truthy-ish value nobody planned for.
  const src = read(EDIT_FORM);
  assert.ok(
    /out\[k\] = now === "" \? null : now;/.test(src),
    'EditPatient must convert cleared text fields to null'
  );
});

test('opening the form reports no changes until the clinician makes one', () => {
  // The database stores species as "canine"; the select offers "Canine". With
  // the raw stored value on one side of the diff and the normalised one on the
  // other, every record reported species as changed the instant the form
  // opened — the button read "3 fields changed" after two edits, and saving
  // would have rewritten the casing on every patient as a side effect of
  // correcting something unrelated.
  //
  // Found in the browser on a real record, not by a test. The rule it stands
  // for: any value the form normalises for display must be normalised on BOTH
  // sides of the comparison, or the diff reports the normalisation as an edit.
  const src = read(EDIT_FORM);
  assert.ok(
    /const speciesOf = /.test(src),
    'EditPatient must normalise species through one function'
  );
  const compare = src.slice(src.indexOf('const compare = {'), src.indexOf('};', src.indexOf('const compare = {')));
  assert.ok(
    /species: speciesOf\(patient\.species\)/.test(compare),
    'the diff compares the RAW stored species against the normalised form value, ' +
    'so every record opens already "changed"'
  );
  const initial = src.slice(src.indexOf('useState(() => ({'), src.indexOf('}));'));
  assert.ok(
    /species: speciesOf\(patient\.species\)/.test(initial),
    'the initial form value must come from the same normaliser as the comparison'
  );
});

// ---------------------------------------------------------------------------
// Sex — the vocabulary has to read what is already stored
// ---------------------------------------------------------------------------

/** Load sexOf out of the real UI module and run it here. */
function loadSexOf() {
  const src = read(SHARED);
  const m = /export function sexOf\(stored\) \{[\s\S]*?\n\}/.exec(src);
  assert.ok(m, 'sexOf not found in PatientForm.jsx');
  return vm.runInNewContext(m[0].replace('export ', '') + ';sexOf');
}

test('sexOf reads every spelling already in the database', () => {
  // Four spellings of two states are stored, written by different entry points
  // over time: a hyphen, an em dash, and plain forms. Before this, NEITHER
  // patient form offered any of them, so every existing patient displayed as
  // "Not stated" while the record plainly said otherwise.
  const sexOf = loadSexOf();
  const cases = [
    ['Female - Spayed', 'Female spayed'],
    ['Female — Spayed', 'Female spayed'],
    ['Male — Neutered', 'Male neutered'],
    ['Male Neutered', 'Male neutered'],
    ['FEMALE SPAYED', 'Female spayed'],
    ['Male', 'Male'],
    ['Female', 'Female'],
    [null, ''],
    ['', ''],
  ];
  for (const [stored, expected] of cases) {
    assert.strictEqual(
      sexOf(stored), expected,
      `sexOf(${JSON.stringify(stored)}) returned ${JSON.stringify(sexOf(stored))}. ` +
      `A stored value the control cannot display reads as "Not stated" on a ` +
      `medical record that says otherwise`
    );
  }
});

test('every sexOf result is selectable in the shared vocabulary', () => {
  // The normaliser and the option list must agree, or a normalised value still
  // has no option to land on and the field goes blank anyway.
  const sexOf = loadSexOf();
  const src = read(SHARED);
  const m = /export const SEX = (\[[\s\S]*?\n\]);/.exec(src);
  assert.ok(m, 'SEX not found in PatientForm.jsx');
  const values = new Set(Array.from(vm.runInNewContext(m[1])).map((o) => o.value));
  for (const stored of ['Female - Spayed', 'Male — Neutered', 'Male', 'Female', null]) {
    const normalised = sexOf(stored);
    assert.ok(
      values.has(normalised),
      `sexOf(${JSON.stringify(stored)}) produced "${normalised}", which is not an option`
    );
  }
});

test('both patient forms use the one shared sex vocabulary', () => {
  // They disagreed: registration wrote "Female Spayed", the edit form offered
  // "Female spayed", and the records held a third spelling.
  for (const p of [EDIT_FORM, path.join(path.dirname(EDIT_FORM), 'NewPatient.jsx')]) {
    const src = read(p);
    assert.ok(
      /SEX\.map\(/.test(src),
      `${path.basename(p)} does not render the shared SEX list`
    );
    assert.ok(
      !/<option value="Male Neutered"|const SEX = \[/.test(src),
      `${path.basename(p)} still carries its own sex options`
    );
  }
});

test('opening a record never reports sex as changed', () => {
  const src = read(EDIT_FORM);
  const compare = src.slice(src.indexOf('const compare = {'), src.indexOf('};', src.indexOf('const compare = {')));
  assert.ok(
    /sex: sexOf\(patient\.sex\)/.test(compare),
    'the diff must normalise the stored sex, or every record opens already ' +
    '"changed" and saving rewrites the stored spelling as a side effect'
  );
});

// ---------------------------------------------------------------------------
// Pounds stay the stored unit
// ---------------------------------------------------------------------------

test('the kilogram display field is never part of the saved diff', () => {
  const src = read(EDIT_FORM);
  const compareBlock = src.slice(src.indexOf('const compare = {'), src.indexOf('};', src.indexOf('const compare = {')));
  assert.ok(
    !/weight_kg/.test(compareBlock),
    'weight_kg appears in the diff comparison. It is a display field — if it ' +
    'reaches the record the patient has two weights in two units and nothing ' +
    'downstream knows which is authoritative'
  );
});

test('neither patient form inlines the lbs/kg factor', () => {
  for (const file of [EDIT_FORM, SHARED]) {
    assert.ok(
      !/2\.2046/.test(read(file)),
      `${path.basename(file)} inlines the conversion factor. Import it from ` +
      `constants/weight.js — the two boxes drift the moment there are two copies`
    );
  }
});

test('the weight pair has exactly one implementation', () => {
  // NewPatient and EditPatient both show it. A second copy of the coordination
  // logic is how one form starts rounding differently from the other.
  const shared = read(SHARED);
  assert.ok(/export function weightPatch/.test(shared), 'weightPatch must live in PatientForm.jsx');
  const newPatient = read(path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'clinical', 'NewPatient.jsx'));
  for (const [name, src] of [['NewPatient.jsx', newPatient], ['EditPatient.jsx', read(EDIT_FORM)]]) {
    assert.ok(
      /<WeightPair/.test(src),
      `${name} does not use the shared <WeightPair> — it has its own weight boxes`
    );
  }
});

// ---------------------------------------------------------------------------
// The three engine inputs nothing ever collected
// ---------------------------------------------------------------------------

test('both forms offer the three fields the engine reads', () => {
  // currentMedications, medicalHistory and specialInstructions all feed the
  // contraindication keyword scan in protocol-generator.js, and no V2 screen
  // wrote to them — so the scan ran over three empty strings for every patient
  // registered through this workflow.
  const shared = read(SHARED);
  for (const f of ['current_medications', 'medical_history', 'special_instructions']) {
    assert.ok(
      shared.includes(f),
      `ClinicalBackground no longer collects ${f}, which is an engine input`
    );
  }
  for (const [name, p] of [['NewPatient.jsx', path.join(path.dirname(EDIT_FORM), 'NewPatient.jsx')],
                           ['EditPatient.jsx', EDIT_FORM]]) {
    assert.ok(
      /<ClinicalBackground/.test(read(p)),
      `${name} does not render <ClinicalBackground>`
    );
  }
});

// ---------------------------------------------------------------------------
// Clinical scales are bounded
// ---------------------------------------------------------------------------

/** Pull the RANGES table out of server.js and evaluate it. */
function serverRanges() {
  const src = read(SERVER);
  const m = /const RANGES = (\{[\s\S]*?\n  \});/.exec(src);
  assert.ok(m, 'server.js no longer defines a RANGES table for patient numbers');
  return vm.runInNewContext('(' + m[1] + ')');
}

test('every clinical scale is bounded to its published range', () => {
  const R = serverRanges();
  const expected = {
    body_condition_score: [1, 9],   // WSAVA
    lameness_grade: [0, 5],
    pain_level: [0, 10],
  };
  for (const [field, [lo, hi]] of Object.entries(expected)) {
    assert.ok(R[field], `${field} has no range — it would fall back to accepting anything`);
    assert.deepStrictEqual(
      Array.from(R[field]), [lo, hi],
      `${field} is bounded ${JSON.stringify(R[field])}, expected [${lo}, ${hi}]`
    );
  }
});

test('no clinical scale is left on the old blanket 0-1000 bound', () => {
  const R = serverRanges();
  for (const [field, range] of Object.entries(R)) {
    assert.ok(
      range[1] <= 400,
      `${field} still allows up to ${range[1]}. A body condition score of 40 or ` +
      `a pain score of 87 is a typo, and storing it puts a number in the chart ` +
      `that cannot be read against any scale`
    );
  }
});

test('the weight bound is stated in pounds', () => {
  const R = serverRanges();
  // 400 lbs is roughly an English Mastiff at the outer limit and comfortably
  // above any real patient; 400 KG would be nonsense for either species, so
  // this bound also documents the unit.
  assert.deepStrictEqual(Array.from(R.weight), [0, 400]);
});

// ---------------------------------------------------------------------------
// Body condition score
// ---------------------------------------------------------------------------

test('the BCS vocabulary is the nine WSAVA points, plus "not recorded"', () => {
  const src = read(V2API);
  const m = /export const BODY_CONDITION_SCORE = (\[[\s\S]*?\n\]);/.exec(src);
  assert.ok(m, 'BODY_CONDITION_SCORE not found in v2api.js');
  const list = vm.runInNewContext(m[1]);
  const values = Array.from(list).map((o) => o.value).filter((v) => v !== '');
  assert.deepStrictEqual(
    values, ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'BCS must offer exactly 1-9. The product uses the WSAVA nine-point scale ' +
    'everywhere else, and a 1-5 control here would silently mean something different'
  );
  assert.ok(
    Array.from(list).some((o) => o.value === '' && /not recorded/i.test(o.label)),
    'BCS must be clearable — it is not known for every patient, and the column ' +
    'defaults to 5, which is "ideal" and would otherwise be asserted about ' +
    'animals nobody has scored'
  );
});

// ---------------------------------------------------------------------------
// A correction must refresh what was derived from the record
// ---------------------------------------------------------------------------

test('saving a correction reloads the intake proposal, not just the snapshot', () => {
  // The proposal is DERIVED from the patient record: applicableGates() reads
  // the condition and the surgery date to decide which safety gates a
  // clinician is asked to confirm. Correcting a surgery date therefore changes
  // the gate list.
  //
  // The first version of savePatient reloaded the snapshot and not the
  // proposal, so after a correction the form showed the gates for the record
  // as it had been. The comment above it even claimed it refreshed the
  // proposal. Caught in the browser: the assessment form came up completely
  // empty after a save.
  const wf = read(path.join(path.dirname(EDIT_FORM), 'ClinicalWorkflowView.jsx'));
  const body = wf.slice(wf.indexOf('const savePatient'), wf.indexOf('const generate'));
  assert.ok(
    /loadSnapshot\(/.test(body),
    'savePatient must refresh the snapshot the clinician reads'
  );
  assert.ok(
    /loadProposal\(/.test(body),
    'savePatient must refresh the PROPOSAL too — it is derived from the record ' +
    'that was just corrected, and a stale one describes the old gate list'
  );
});

test('the proposal is fetched through one function, used by both callers', () => {
  const wf = read(path.join(path.dirname(EDIT_FORM), 'ClinicalWorkflowView.jsx'));
  assert.ok(
    /const loadProposal = /.test(wf),
    'proposal loading must live in one place — two copies drift, and the copy ' +
    'that gets forgotten is the one after a correction'
  );
  const direct = wf.split('v2.getIntakeProposal').length - 1;
  assert.strictEqual(
    direct, 1,
    `v2.getIntakeProposal is called ${direct} times. It should be called once, ` +
    `inside loadProposal`
  );
});

test('a correction clears stale gate confirmations', () => {
  // A gate ticked against the old record is not a confirmation of the new one.
  const wf = read(path.join(path.dirname(EDIT_FORM), 'ClinicalWorkflowView.jsx'));
  const body = wf.slice(wf.indexOf('const savePatient'), wf.indexOf('const generate'));
  assert.ok(
    /setGateConfirmations\(\{\}\)/.test(body),
    'savePatient must clear gate confirmations — a gate confirmed against the ' +
    'record before the correction says nothing about the record after it'
  );
});

// ---------------------------------------------------------------------------
// Corrections do not rewrite approved protocols
// ---------------------------------------------------------------------------

test('the form tells the clinician when an approved protocol exists', () => {
  // An approved version stores engine_input_json and its content is hashed at
  // approval, so this edit genuinely cannot change it. That is correct — and
  // it is exactly why the clinician has to be told, or a correction looks like
  // it updated the prescription when it did not.
  const src = read(EDIT_FORM);
  assert.ok(/activeProtocol &&/.test(src), 'EditPatient does not check for an active protocol');
  assert.ok(
    /does not\s*\n?\s*change it|does not change it/.test(src),
    'the notice must say plainly that the approved protocol is unchanged'
  );
});

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
  for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`patient-edit: ${passed} passed`);
