/**
 * intake-proposal — tests
 *
 * This module decides which safety gates a clinician is asked to confirm. A
 * gate wrongly marked irrelevant is a restriction that never fires, so the
 * tests below care most about the cases where a gate should appear and might
 * not.
 *
 *   node v2/intake-proposal.test.js
 */

'use strict';

const assert = require('assert');
const {
  SAFETY_GATES, applicableGates, proposeEngineInputs, unconfirmedGates,
  splitClientName, daysSince,
} = require('./intake-proposal');

let passed = 0;
const failures = [];
function t(name, fn) {
  try { fn(); passed++; }
  catch (err) { failures.push({ name, err }); }
}

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

function patient(over = {}) {
  return {
    id: 1, name: 'Winston', breed: 'Dachshund', age: 6, weight: 9.2,
    species: 'Canine', condition: 'Cruciate disease, left stifle',
    client_name: 'Sal Bonanno', pain_level: 4, lameness_grade: 2,
    mobility_level: 'Moderate', ...over,
  };
}

// ── Name splitting ─────────────────────────────────────────────────────────
t('splitClientName handles one, two and many words', () => {
  assert.deepEqual(splitClientName('Sal Bonanno'), { first: 'Sal', last: 'Bonanno' });
  assert.deepEqual(splitClientName('Cher'), { first: 'Cher', last: '' });
  assert.deepEqual(splitClientName('Maria del Carmen Ruiz'), { first: 'Maria', last: 'del Carmen Ruiz' });
  assert.deepEqual(splitClientName(''), { first: '', last: '' });
  assert.deepEqual(splitClientName(null), { first: '', last: '' });
});

t('daysSince tolerates missing and malformed dates', () => {
  assert.equal(daysSince(null), null);
  assert.equal(daysSince('not-a-date'), null);
  assert.equal(daysSince(daysAgo(10)), 10);
});

// ── Applicability: the gates a clinician actually sees ─────────────────────
t('a fresh TPLO asks post-operative gates, not IVDD', () => {
  const g = applicableGates(patient({ condition: 'TPLO, left stifle', surgery_date: daysAgo(4) }));
  for (const f of ['weightBearingStatus', 'incisionStatus', 'complicationsNoted',
                   'eCollarRequired', 'crateRestRequired']) {
    assert.ok(g.has(f), `TPLO should ask ${f}`);
  }
  assert.ok(!g.has('ivddGrade'), 'a TPLO is not a disc case');
  assert.ok(!g.has('neuroDeepPain'), 'a TPLO is not a neurological case');
});

t('an IVDD case asks the neurological set and the grade', () => {
  const g = applicableGates(patient({ condition: 'IVDD Hansen Type I, T12-T13' }));
  for (const f of ['ivddGrade', 'neuroProprioception', 'neuroWithdrawal',
                   'neuroDeepPain', 'neuroMotorGrade', 'mmtGrade', 'crateRestRequired']) {
    assert.ok(g.has(f), `IVDD should ask ${f}`);
  }
});

t('lumbosacral disease and spondylosis reach the neurological gates', () => {
  // Sal's clinical call: lumbosacral spondylosis compresses the cauda equina,
  // so the neuro findings are live questions even when the record reads as a
  // degenerative or orthopaedic problem.
  for (const dx of ['Lumbosacral Spondylosis with Mobility Deficit',
                    'Lumbosacral stenosis',
                    'Spondylosis deformans, caudal lumbar spine']) {
    const g = applicableGates(patient({ condition: dx, surgery_date: null }));
    for (const f of ['neuroProprioception', 'neuroWithdrawal', 'neuroDeepPain',
                     'neuroMotorGrade', 'mmtGrade']) {
      assert.ok(g.has(f), `"${dx}" should ask ${f}`);
    }
    assert.ok(!g.has('incisionStatus'), `"${dx}" is not post-operative`);
  }
});

t('an arthritic case asks OA stage and nothing post-operative', () => {
  const g = applicableGates(patient({ condition: 'Bilateral hip osteoarthritis', lameness_grade: 1 }));
  assert.ok(g.has('oaStage'));
  assert.ok(!g.has('incisionStatus'), 'no surgery, no incision');
  assert.ok(!g.has('eCollarRequired'));
});

t('a non-ambulatory patient asks the neuro set even with a bland diagnosis', () => {
  // The diagnosis text says nothing neurological; the mobility finding does.
  const g = applicableGates(patient({ condition: 'Generalised weakness', mobility_level: 'Non-ambulatory' }));
  assert.ok(g.has('neuroDeepPain'), 'non-ambulatory must reach the neuro gates');
  assert.ok(g.has('mmtGrade'));
});

t('an unrecognised diagnosis still asks the gates that govern loading', () => {
  // The dangerous case: nothing matches, so nothing is asked, so no
  // restriction fires. Must never happen.
  const g = applicableGates(patient({ condition: 'Zzz unknown presentation', lameness_grade: 0, mobility_level: '' }));
  assert.ok(g.size > 0, 'an unrecognised diagnosis must not produce zero gates');
  assert.ok(g.has('weightBearingStatus'));
  assert.ok(g.has('mmtGrade'));
});

t('a post-operative record with NO surgery date still asks the post-op gates', () => {
  // Found on a live test patient: condition "TPLO Post-Op", surgery_date null.
  // Keying the post-operative gates off the date alone skipped incision
  // status, complications, e-collar and crate rest - all fail UNSAFE.
  const g = applicableGates(patient({ condition: 'TPLO Post-Op', surgery_date: null, lameness_grade: 0 }));
  for (const f of ['weightBearingStatus', 'incisionStatus', 'complicationsNoted',
                   'eCollarRequired', 'crateRestRequired']) {
    assert.ok(g.has(f), `an undated post-op record must still ask ${f}`);
  }
});

t('"No surgical candidate" in the history does NOT make a patient post-operative', () => {
  // Found on a live test patient. The history read "Managed medically ...
  // No surgical candidate", the word "surgical" matched, and a conservatively
  // managed OA dog was asked for incision status and an e-collar.
  const g = applicableGates(patient({
    condition: 'Bilateral Hip Osteoarthritis (moderate-severe)',
    medical_history: 'Progressive bilateral coxofemoral OA diagnosed 2024. Managed medically. No surgical candidate.',
    surgery_date: null,
  }));
  assert.ok(!g.has('incisionStatus'), 'a medically managed dog has no incision');
  assert.ok(!g.has('eCollarRequired'));
  assert.ok(!g.has('complicationsNoted'));
  assert.ok(g.has('oaStage'), 'but the OA gate must still fire');
});

t('a past surgery in the history does not reopen post-operative gates', () => {
  // History records what happened; `condition` records what is being treated.
  const g = applicableGates(patient({
    condition: 'Bilateral Hip Osteoarthritis',
    medical_history: 'FHO right hip 2019. TPLO left stifle 2021.',
    surgery_date: null,
  }));
  assert.ok(!g.has('incisionStatus'), 'a 2019 incision is not an open question');
  assert.ok(g.has('oaStage'));
});

t('an undated surgical case is reported, not silently phase-guessed', () => {
  const { summary } = proposeEngineInputs({ patient: patient({ condition: 'TPLO Post-Op', surgery_date: null }) });
  assert.equal(summary.undatedSurgery, true);
  assert.match(summary.why.surgeryDate, /no surgery date/i);
});

t('a year-old surgery stops being treated as an active restriction', () => {
  const g = applicableGates(patient({ condition: 'TPLO, left stifle', surgery_date: daysAgo(400) }));
  assert.ok(!g.has('incisionStatus'), 'an incision from last year is not an open question');
  assert.ok(g.has('weightBearingStatus'), 'but loading still matters');
});

// ── The proposal itself ────────────────────────────────────────────────────
t('record fields are carried without asking', () => {
  const { proposed } = proposeEngineInputs({ patient: patient() });
  assert.equal(proposed.patientName, 'Winston');
  assert.equal(proposed.clientFirstName, 'Sal');
  assert.equal(proposed.clientLastName, 'Bonanno');
  assert.equal(proposed.diagnosis, 'Cruciate disease, left stifle');
  assert.equal(proposed.breed, 'Dachshund');
  assert.equal(proposed.painScore, 4);
  assert.equal(proposed.lamenessGrade, 2);
});

t('treatment approach follows the surgery date, and says why', () => {
  const a = proposeEngineInputs({ patient: patient({ surgery_date: daysAgo(5) }) });
  assert.equal(a.proposed.treatmentApproach, 'Surgical');
  assert.match(a.summary.why.treatmentApproach, /surgery date/i);

  const b = proposeEngineInputs({ patient: patient({ surgery_date: null }) });
  assert.equal(b.proposed.treatmentApproach, 'Conservative');
});

t('an undated surgical presentation is Surgical, not Conservative', () => {
  // Found in the UI: "TPLO Post-Op" with surgery_date NULL pre-filled the
  // assessment as Conservative, which routes the engine down a different
  // protocol path. Same root cause as the missing post-operative gates.
  const a = proposeEngineInputs({ patient: patient({ condition: 'TPLO Post-Op', surgery_date: null }) });
  assert.equal(a.proposed.treatmentApproach, 'Surgical');
  assert.match(a.summary.why.treatmentApproach, /names a surgical procedure/i);

  const b = proposeEngineInputs({ patient: patient({ condition: 'Bilateral Hip Osteoarthritis', surgery_date: null }) });
  assert.equal(b.proposed.treatmentApproach, 'Conservative');
});

t('clinic capabilities pass through, tri-state intact', () => {
  const { proposed } = proposeEngineInputs({
    patient: patient(),
    clinicInputs: { modalityLaser: true, modalityShockwave: false, aquaticAccess: null },
  });
  assert.equal(proposed.modalityLaser, true);
  assert.equal(proposed.modalityShockwave, false);
  assert.equal(proposed.aquaticAccess, null, 'unstated must stay null, never become false');
});

t('clinic capabilities arrive from the REAL clinic-store, not a hand-shaped fixture', () => {
  // Found in live testing: toClinicState() returns capability keys
  // (modality_laser) while the engine wants engine keys (modalityLaser), so
  // every modality silently arrived as undefined and the engine would have
  // withheld all of them. The earlier test passed because its fixture was
  // already engine-shaped - kinder than reality, and blind to the mismatch.
  const clinicStore = require('./clinic-store');
  const record = { capabilities: { modality_laser: true, modality_shockwave: false } };
  const { proposed } = proposeEngineInputs({
    patient: patient(),
    clinicInputs: clinicStore.toEngineInputs(record),
  });
  assert.equal(proposed.modalityLaser, true, 'an available modality must reach the engine');
  assert.equal(proposed.modalityShockwave, false);
  assert.equal(proposed.aquaticAccess, null, 'unstated stays unstated');
  assert.ok(!('modality_laser' in proposed), 'capability-shaped keys must not leak through');
});

t('every applicable gate is proposed at its most cautious value', () => {
  const { proposed, gates } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO, left stifle', surgery_date: daysAgo(3) }),
  });
  // Engine TOKENS, not descriptions. These assertions read worse than the
  // ones they replaced — 'Non-weight-bearing' and 'Not healed' were plain
  // English — and that was exactly the problem: neither was a value the
  // engine matched, so the most cautious state a patient could be in applied
  // no restriction at all. See the note above SAFETY_GATES, and
  // cautious-defaults.test.js, which runs each of these through the engine.
  assert.equal(proposed.weightBearingStatus, 'NWB');
  assert.equal(proposed.crateRestRequired, true);
  assert.ok(gates.every((g) => g.mustConfirm), 'every returned gate requires confirmation');
});

t('a gate with no honest cautious value is raised empty, not skipped', () => {
  // incisionStatus and complicationsNoted propose nothing on purpose: any
  // complications string asserts a complication that may not exist, and the
  // only cautious incision values hard-block generation outright.
  //
  // The risk of that decision is the gate quietly disappearing along with its
  // value, which would turn "we did not fill this in" into "we did not ask".
  // This is the test that stops it.
  const { proposed, gates } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO, left stifle', surgery_date: daysAgo(3) }),
  });
  for (const field of ['incisionStatus', 'complicationsNoted']) {
    assert.equal(proposed[field], null, `${field} must arrive empty, not fabricated`);
    const gate = gates.find((g) => g.field === field);
    assert.ok(gate, `${field} proposes no value and MUST still be raised as a gate`);
    assert.ok(gate.mustConfirm, `${field} must still require confirmation`);
  }
});

t('gates that do not apply are nulled, not left at a cautious value', () => {
  // A stale cautious value on an irrelevant field would feed the engine a
  // restriction for a condition the animal does not have.
  const { proposed } = proposeEngineInputs({ patient: patient({ condition: 'TPLO, left stifle', surgery_date: daysAgo(3) }) });
  assert.equal(proposed.ivddGrade, null);
  assert.equal(proposed.neuroDeepPain, null);
});

t('a prior protocol seeds the gate but does not excuse confirming it', () => {
  const { proposed, gates } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO, left stifle', surgery_date: daysAgo(30) }),
    // 'PWB', not 'Partial weight-bearing'. Prior inputs come from an
    // APPROVED protocol, which came from the form — so they are engine
    // tokens. A fixture carrying prose here would pass while the real value
    // it stands in for behaves completely differently in the engine.
    priorInputs: { weightBearingStatus: 'PWB' },
  });
  assert.equal(proposed.weightBearingStatus, 'PWB');
  const wb = gates.find((g) => g.field === 'weightBearingStatus');
  assert.equal(wb.carriedForward, true);
  assert.equal(wb.mustConfirm, true, 'a carried value still needs confirming — the animal may have changed');
  assert.match(wb.why, /still holds/i);
});

t('a patient without an id is refused', () => {
  assert.throws(() => proposeEngineInputs({ patient: {} }), /patient record is required/i);
  assert.throws(() => proposeEngineInputs({}), /patient record is required/i);
});

// ── Confirmation enforcement ───────────────────────────────────────────────
t('unconfirmedGates lists every gate nobody ticked', () => {
  const { gates } = proposeEngineInputs({
    patient: patient({ condition: 'IVDD Hansen Type I' }),
  });
  assert.ok(unconfirmedGates(gates, {}).length === gates.length, 'nothing confirmed -> all outstanding');

  const all = {};
  gates.forEach((g) => { all[g.field] = true; });
  assert.deepEqual(unconfirmedGates(gates, all), [], 'all confirmed -> none outstanding');
});

t('a falsy or missing confirmation does not count as confirmed', () => {
  const { gates } = proposeEngineInputs({ patient: patient({ condition: 'IVDD Hansen Type I' }) });
  const sloppy = {};
  gates.forEach((g, i) => { sloppy[g.field] = i === 0 ? true : (i === 1 ? 'yes' : 1); });
  const outstanding = unconfirmedGates(gates, sloppy);
  assert.equal(outstanding.length, gates.length - 1,
    'only a literal true confirms — "yes" and 1 must not pass');
});

// ── The property that matters ──────────────────────────────────────────────
t('no proposal ever leaves an applicable restriction permissive', () => {
  // Across a spread of real presentations, every gate that is shown must be
  // proposed at a value that restricts rather than permits.
  const permissive = new Set([
    'Full weight-bearing', 'Healed', 'Ambulatory', 'Present', 'Normal', false,
  ]);
  const cases = [
    { condition: 'TPLO, left stifle', surgery_date: daysAgo(2) },
    { condition: 'IVDD Hansen Type I, T12-T13' },
    { condition: 'Bilateral hip osteoarthritis' },
    { condition: 'Conservative CCL management' },
    { condition: 'Feline lumbosacral pain', species: 'Feline' },
    { condition: 'Unknown', mobility_level: 'Non-ambulatory' },
  ];
  for (const over of cases) {
    const { proposed, gates } = proposeEngineInputs({ patient: patient(over) });
    for (const g of gates) {
      assert.ok(!permissive.has(proposed[g.field]),
        `${over.condition}: ${g.field} was proposed permissively as ${proposed[g.field]}`);
    }
  }
});

// ── The V1 clinical record, wired in ───────────────────────────────────────
//
// The practice keeps a fuller record of the same patient in `dashboard_data`
// and nothing read it until 22 Sep 2026. It now fills gaps in the proposal.
// The rules it must obey are all one rule: filling a gap may make the picture
// MORE complete and may make the gate list LONGER, and may never do either in
// reverse.

/**
 * A treatment record shaped as `patient-treatment-store.getTreatment` returns
 * one. Since 2026-09-25 this — not the blob — is where the weight-bearing and
 * incision gates, the e-collar and crate-rest flags, the surgery date and the
 * treatment approach come from.
 */
const TX = ({ status = null, procedures = [], approach = null } = {}) => ({
  patient_id: 1, approach, approach_is_retired: false,
  affected_limbs: null, affected_region: null,
  procedures, status, statusHistory: status ? [status] : [],
  configured: true,
});

const V1 = (extra = {}) => JSON.stringify({
  'treatment::Weight Bearing Status': 'Partial weight bearing (PWB)',
  'treatment::Incision Status': 'Fully healed / staples removed',
  'assessment::Deep Pain Perception': 'Present — bilateral',
  'assessment::Relevant Medical & Surgical History': 'TPLO 2026-03-21, uneventful.',
  'assessment::Current Pain Medications': 'Gabapentin and Carprofen',
  'client::Age (years)': '10',
  'treatment::Surgery Date': '2026-03-21',
  ...extra,
});

t('a gap in the columns is filled from the clinical record', () => {
  const { proposed, summary } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO Post-Op', medical_history: null, current_medications: null }),
  });
  assert.equal(proposed.medicalHistory, '');
  const withV1 = proposeEngineInputs({
    patient: patient({
      condition: 'TPLO Post-Op', medical_history: null, current_medications: null,
      dashboard_data: V1(),
    }),
  });
  assert.match(withV1.proposed.medicalHistory, /TPLO 2026-03-21/);
  assert.equal(withV1.proposed.currentMedications, 'Gabapentin and Carprofen');
  assert.ok(summary.fromClinicalRecord.length === 0, 'no record, nothing recovered');
  assert.ok(withV1.summary.fromClinicalRecord.includes('medicalHistory'));
});

t('a column that holds a value is never overwritten by the clinical record', () => {
  // Gaps only. The column is what somebody most recently entered in this
  // workflow, and the V1 record may be older.
  const { proposed } = proposeEngineInputs({
    patient: patient({
      condition: 'TPLO Post-Op',
      medical_history: 'What the clinician typed here today.',
      dashboard_data: V1(),
    }),
  });
  assert.equal(proposed.medicalHistory, 'What the clinician typed here today.');
});

t('a stored zero is a gap, not a value', () => {
  // A live record held age 0 on a ten-year-old dog whose chart said 10.
  const { proposed, summary } = proposeEngineInputs({
    patient: patient({ age: 0, dashboard_data: V1() }),
  });
  assert.equal(proposed.age ?? null, null, 'age is echoed, not proposed — but the record is filled');
  assert.ok(summary.fromClinicalRecord.includes('age'), 'an age of 0 must be recovered');
});

t('every value recovered from the clinical record says so', () => {
  const { summary } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO Post-Op', medical_history: null, dashboard_data: V1() }),
  });
  for (const field of summary.fromClinicalRecord) {
    assert.ok(
      summary.why[field] && /clinical record/i.test(summary.why[field]),
      `${field} was recovered without saying where from`
    );
  }
});

t('a safety gate answered by the TREATMENT RECORD still requires confirmation', () => {
  // The whole justification for using a recorded value rather than the
  // cautious default. If this ever stops being true, the store has to be
  // unwired from the proposal.
  const { gates } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO Post-Op', surgery_date: daysAgo(30) }),
    treatment: TX({ status: { weight_bearing_status: 'Partial weight bearing (PWB)' } }),
  });
  const wb = gates.find((g) => g.field === 'weightBearingStatus');
  assert.ok(wb, 'weight bearing must be asked for a post-operative patient');
  assert.equal(wb.proposed, 'PWB', 'the recorded value is proposed, normalised to the engine token');
  assert.equal(wb.fromTreatmentRecord, true, 'and it is labelled as coming from the record');
  assert.equal(wb.mustConfirm, true, 'and it is still confirmed by a person');
  assert.match(wb.why, /not today's examination/i,
    'the wording must not let a previous finding read as an examination today');
});

t('a gate the store does NOT answer falls to its cautious default', () => {
  // The safe failure. A caller that does not pass `treatment` — or a patient
  // with no treatment record — must get the cautious value, never a stale one
  // recovered from the blob, which no longer maps these keys at all.
  const { gates } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO Post-Op', surgery_date: daysAgo(3), dashboard_data: V1() }),
  });
  const wb = gates.find((g) => g.field === 'weightBearingStatus');
  assert.equal(wb.proposed, 'NWB', 'the blob answered a gate it is no longer the source for');
  assert.equal(wb.fromTreatmentRecord, false);
  assert.equal(wb.fromClinicalRecord, false);
});

t('the last approved protocol outranks the clinical record', () => {
  const { gates } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO Post-Op', surgery_date: daysAgo(30), dashboard_data: V1() }),
    priorInputs: { weightBearingStatus: 'TTWB' },
  });
  const wb = gates.find((g) => g.field === 'weightBearingStatus');
  assert.equal(wb.proposed, 'TTWB', 'the last approved value is the more recent clinical decision');
  assert.equal(wb.carriedForward, true);
  assert.ok(!wb.fromClinicalRecord, 'and it is not mislabelled as coming from the chart');
});

t('filling a gap never removes a safety gate', () => {
  // Recovering a surgery date RECLASSIFIES a patient — one live record went
  // from Conservative to Surgical, correctly gaining four post-operative gates
  // and silently dropping the muscle-strength gate, because that
  // classification does not ask for it. Losing a gate is the fails-unsafe
  // direction, so the applicable set is the UNION of both readings.
  // Modelled exactly on the record that exposed this. The V1 blob supplies ONLY
  // a surgery date and a history that names no procedure — an earlier version of
  // this test handed over a history reading "TPLO 2026-03-21", which kept the
  // muscle-strength gate alive through the diagnosis text and hid the drop.
  const raw = patient({
    condition: 'Rehabilitation', affected_region: null, surgery_date: null,
    mobility_level: '', medical_history: null, lameness_grade: 0,
  });
  const before = proposeEngineInputs({ patient: raw });
  // The surgery date now arrives as a recorded PROCEDURE rather than a blob
  // key — same reclassification, same union rule, different source.
  const after = proposeEngineInputs({
    patient: {
      ...raw,
      dashboard_data: JSON.stringify({
        'assessment::Relevant Medical & Surgical History': 'no previous injury',
      }),
    },
    treatment: TX({ procedures: [{ procedure_type: 'TPLO', procedure_date: daysAgo(30) }] }),
  });
  assert.ok(
    before.gates.some((g) => g.field === 'mmtGrade'),
    'the fixture must ask mmtGrade before the record is read, or this tests nothing'
  );
  const beforeFields = before.gates.map((g) => g.field);
  const afterFields = new Set(after.gates.map((g) => g.field));
  for (const f of beforeFields) {
    assert.ok(
      afterFields.has(f),
      `${f} stopped being asked once the clinical record was read. Filling a gap ` +
      `may only ADD questions`
    );
  }
  assert.ok(after.gates.length > before.gates.length, 'and it should have added some');
});

t('a patient with no clinical record behaves exactly as before', () => {
  const over = { condition: 'TPLO Post-Op', surgery_date: daysAgo(10) };
  const a = proposeEngineInputs({ patient: patient(over) });
  const b = proposeEngineInputs({ patient: patient({ ...over, dashboard_data: '{}' }) });
  assert.deepEqual(a.proposed, b.proposed, 'an empty record must change nothing');
  assert.deepEqual(a.gates.map((g) => g.field), b.gates.map((g) => g.field));
  assert.equal(b.summary.clinicalRecordPresent, false);
});

t('a corrupt clinical record does not break the proposal', () => {
  for (const bad of ['{not json', 'null', '', '[]']) {
    const { proposed, gates } = proposeEngineInputs({
      patient: patient({ condition: 'TPLO Post-Op', dashboard_data: bad }),
    });
    assert.ok(proposed.patientName, `${JSON.stringify(bad)} broke the proposal`);
    assert.ok(Array.isArray(gates));
  }
});

t('a disagreement between the two records is reported, not resolved', () => {
  const { proposed, summary } = proposeEngineInputs({
    patient: patient({ age: 6, dashboard_data: V1() }),
  });
  const age = summary.conflicts.find((c) => c.field === 'Age');
  assert.ok(age, 'a column of 6 against a record of 10 must be reported');
  assert.equal(age.column, '6');
  assert.equal(age.v1Record, '10');
});


// ── Treatment approach: stated beats inferred ──────────────────────────────
//
// The Treatment panel offers SURGICAL, CONSERVATIVE and PALLIATIVE, and
// getProtocolType routes 'palliative' to the comfort-care protocol AHEAD of
// diagnosis. The derivation can only ever produce the first two, so while it
// ran unconditionally a patient placed on comfort care was handed a
// rehabilitation protocol. That is what these protect.

const withBlob = (blob, over = {}) => patient({ dashboard_data: JSON.stringify(blob), ...over });

t('a stated PALLIATIVE approach survives to the engine', () => {
  // Retired from the panel on 2026-09-25 and still honoured wherever it is
  // already stored — a legacy row, an import, the pain >= 8 override.
  const { proposed } = proposeEngineInputs({
    patient: patient({ treatment_approach: 'Palliative', surgery_date: daysAgo(10) }),
  });
  assert.equal(proposed.treatmentApproach, 'Palliative',
    'comfort care was overwritten by the surgery-date derivation, which is how '
    + 'a palliative patient gets a rehabilitation protocol');
});

t('and it actually routes the comfort-care protocol', () => {
  const { getProtocolType } = require('../protocol-generator');
  assert.equal(getProtocolType('TPLO Post-Op', 'Left Stifle', 'Palliative'), 'geriatric',
    'if this stops being true the reason for preferring the stated approach is gone');
});

t('a stated approach beats a contradicting surgery date', () => {
  const { proposed, summary } = proposeEngineInputs({
    patient: patient({ surgery_date: daysAgo(10) }),
    treatment: TX({ approach: 'Conservative' }),
  });
  assert.equal(proposed.treatmentApproach, 'Conservative');
  assert.equal(summary.treatmentApproachSource, 'RECORD');
});

t('with nothing stated, the derivation still runs', () => {
  const { proposed, summary } = proposeEngineInputs({
    patient: patient({ condition: 'TPLO Post-Op', surgery_date: null }),
  });
  assert.equal(proposed.treatmentApproach, 'Surgical',
    'the derivation was written for exactly this record and must not be lost');
  assert.equal(summary.treatmentApproachSource, 'DERIVED');
});

// ── The summary counts are COUNTED, not constants ──────────────────────────

t('summary.derived reflects what this run derived', () => {
  // The proof that these are computed: the same patient, differing only in
  // whether the approach is stated, must report different counts. Both were
  // hardcoded literals until 2026-09-24, and the header said different numbers
  // again.
  const stated = proposeEngineInputs({
    patient: patient(), treatment: TX({ approach: 'Conservative' }),
  }).summary;
  const inferred = proposeEngineInputs({ patient: patient() }).summary;

  assert.equal(inferred.derived, stated.derived + 1,
    'deriving one more field did not change the count, so it is not a count');
  assert.equal(stated.treatmentApproachSource, 'RECORD');
  assert.equal(inferred.treatmentApproachSource, 'DERIVED');
});

t('summary.fromRecord matches the record block it describes', () => {
  // `proposed` holds four kinds of field: the record block, the clinic's
  // capabilities, the derived three, and every safety gate (null when the gate
  // does not apply). Strip the last three and what remains is what
  // summary.fromRecord claims to count.
  const { proposed, summary } = proposeEngineInputs({ patient: patient() });
  const notFromRecord = new Set([
    ...SAFETY_GATES.map((g) => g.field),
    'treatmentApproach', 'protocolLength', 'frequency',
  ]);
  const fromRecord = Object.keys(proposed).filter((k) => !notFromRecord.has(k));
  assert.equal(summary.fromRecord, fromRecord.length,
    'the reported count and the fields it counts have drifted apart');
});

// ── A short column does not hide what the record says ───────────────────────
//
// Charlie, 2026-09-24:
//   condition column  "Bilateral Hip Osteoarthritis (moderate-severe)"
//   clinical record   "Bilateral coxofemoral osteoarthritis (R>L),
//                      spondylosis L7-S1"
//
// The column is not wrong, it is SHORTER, and the word it drops is the one the
// gate rules look for. `effective` takes the record's diagnosis only when the
// column is empty, so the spondylosis never reached applicableGates and four
// neurological gates were never asked on a patient with L7-S1 disease.

t('a diagnosis the column omits still raises its gates', () => {
  const columnOnly = patient({
    condition: 'Bilateral Hip Osteoarthritis (moderate-severe)',
    lameness_grade: 2,
  });
  const withRecord = patient({
    condition: 'Bilateral Hip Osteoarthritis (moderate-severe)',
    lameness_grade: 2,
    dashboard_data: JSON.stringify({
      'assessment::Primary Diagnosis':
        'Bilateral coxofemoral osteoarthritis (R>L), spondylosis L7-S1',
    }),
  });

  const before = proposeEngineInputs({ patient: columnOnly }).gates.map((g) => g.field);
  const after = proposeEngineInputs({ patient: withRecord }).gates.map((g) => g.field);

  assert.ok(!before.includes('neuroDeepPain'),
    'the fixture is wrong: the column alone already raises the neuro gates, '
    + 'so this test would pass without reading the record at all');

  for (const gate of ['neuroProprioception', 'neuroWithdrawal', 'neuroDeepPain',
                      'neuroMotorGrade', 'mmtGrade']) {
    assert.ok(after.includes(gate),
      `${gate} was not asked. Lumbosacral spondylosis compresses the cauda `
      + 'equina, and the record says it is there');
  }
});

t('reading the record can only ADD gates, never remove them', () => {
  // The safety rule the union exists for. A record that reclassifies a patient
  // must not drop a question the raw row would have asked.
  const raw = patient({ condition: 'TPLO Post-Op', surgery_date: daysAgo(5) });
  const withRecord = patient({
    condition: 'TPLO Post-Op', surgery_date: daysAgo(5),
    dashboard_data: JSON.stringify({ 'assessment::Primary Diagnosis': 'Conditioning' }),
  });
  const before = proposeEngineInputs({ patient: raw }).gates.map((g) => g.field);
  const after = proposeEngineInputs({ patient: withRecord }).gates.map((g) => g.field);
  for (const g of before) {
    assert.ok(after.includes(g), `${g} disappeared once the record was read`);
  }
});

// ── Report ─────────────────────────────────────────────────────────────────
for (const { name, err } of failures) {
  console.error(`\n  FAIL  ${name}`);
  console.error(`        ${String(err && err.message).split('\n').join('\n        ')}`);
}
const total = passed + failures.length;
console.log(`\n${failures.length ? 'FAILED' : 'ok'}  ${passed}/${total} passed`);
process.exit(failures.length ? 1 : 0);
