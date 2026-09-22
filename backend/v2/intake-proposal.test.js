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
  assert.equal(proposed.weightBearingStatus, 'Non-weight-bearing');
  assert.equal(proposed.incisionStatus, 'Not healed');
  assert.equal(proposed.complicationsNoted, true);
  assert.equal(proposed.crateRestRequired, true);
  assert.ok(gates.every((g) => g.mustConfirm), 'every returned gate requires confirmation');
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
    priorInputs: { weightBearingStatus: 'Partial weight-bearing' },
  });
  assert.equal(proposed.weightBearingStatus, 'Partial weight-bearing');
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

// ── Report ─────────────────────────────────────────────────────────────────
for (const { name, err } of failures) {
  console.error(`\n  FAIL  ${name}`);
  console.error(`        ${String(err && err.message).split('\n').join('\n        ')}`);
}
const total = passed + failures.length;
console.log(`\n${failures.length ? 'FAILED' : 'ok'}  ${passed}/${total} passed`);
process.exit(failures.length ? 1 : 0);
