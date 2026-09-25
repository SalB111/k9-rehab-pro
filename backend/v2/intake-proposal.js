/**
 * K9 Clinical Workflow V2 — intake proposal
 *
 * Builds the engine's 40 inputs from what the system already knows, so a
 * clinician verifies a clinical picture instead of typing one.
 *
 * WHAT THIS REPLACES
 * A seven-step wizard asking 186 fields before a protocol appeared. Roughly
 * 150 of those the engine never read. Of the 40 it does read, 15 already sit
 * on the patient record, 10 are properties of the clinic rather than the
 * animal, and 3 follow from a stated rule. That leaves 12 — the safety gates —
 * and a clinician only ever sees the ones relevant to the case in front of
 * them.
 *
 * Those counts read 14 and 4 until 2026-09-24 while the code built 15 and 3.
 * They are no longer written down here as constants: `summary` COUNTS what a
 * given run actually did, and `summary.fromRecord`, `.fromClinic`, `.derived`,
 * `.gatesApplicable` and `.gatesSkipped` are the checkable version of the
 * sentence above.
 *
 * The SPLIT moves between runs and that is not a defect. Treatment approach is
 * derived only when the record does not state it, so for a patient who states
 * it the field leaves `derived` and is reported in `fromClinicalRecord`
 * instead. All five current patients state it, so `derived` reads 2, not 3.
 * What is stable is the 40 inputs the engine reads; how they were answered is
 * exactly what `summary` exists to report.
 *
 * WHY THIS IS RULES AND NOT A LANGUAGE MODEL
 * ------------------------------------------
 * "AI does the work" here means the protocol engine — 260 exercises and an
 * exclusion table a clinician can read line by line. That is the intelligence,
 * and it already exists. This module's job is only to assemble its inputs.
 *
 * An earlier version of this line said "33 safety gates". Nothing in the
 * engine produces that number and it is not derivable from the source, so it
 * is gone rather than carried. What IS there, counted 2026-09-24:
 * `CONTRAINDICATION_MAP` (18 keywords), `WEIGHT_BEARING_EXCLUSIONS` (3),
 * `INCISION_EXCLUSIONS` (4), `ACTIVITY_RESTRICTION_EXCLUSIONS` (2), and three
 * further rules in `getExcludedCodes` with no table of their own — lameness
 * grade 5, severe OA, severe weakness. The exercise count is real:
 *
 *   node -e "require('./all-exercises')"   # prints the library summary
 *
 * A language model must not propose a value for a safety gate. Asked whether a
 * dog has deep pain sensation, a model will produce a confident, plausible,
 * unfounded answer — and deep pain is the finding that separates a Grade IV
 * disc from a Grade V. Nobody examined the animal, so the honest value is "not
 * assessed", and the honest behaviour is to ask. Every rule below is one a
 * clinician can read, check, and disagree with.
 *
 * THE TWO FAILURE DIRECTIONS
 * --------------------------
 * From the engine contract: restriction fields fail UNSAFE — omit them and the
 * restriction never fires. Enablement fields fail RESTRICTIVE — omit them and
 * therapy the clinic could deliver is withheld.
 *
 * So the rules differ by direction. A restriction we cannot derive is proposed
 * at its most cautious value AND flagged for confirmation; it is never quietly
 * assumed away. An enablement we cannot derive is simply read from the clinic's
 * equipment profile, because being wrong there costs a modality, not a joint.
 *
 * WHEN IN DOUBT, ASK. Applicability rules below resolve toward "this gate is
 * relevant" — a gate shown unnecessarily costs a clinician two seconds; a gate
 * hidden wrongly costs them the restriction.
 */

'use strict';

const dashboardBridge = require('./dashboard-bridge');

/** How a proposed value got its value. Shown to the clinician, not decorative. */
const SOURCE = {
  RECORD: 'RECORD',   // read from the patient record
  CLINIC: 'CLINIC',   // a property of the practice, not the animal
  DERIVED: 'DERIVED', // followed from a stated rule
  GATE: 'GATE',       // a safety gate — proposed cautiously, must be confirmed
};

/**
 * How long a post-operative restriction is plausibly still in force.
 *
 * Crate rest and an e-collar are ordinary for the fortnight after surgery and
 * implausible months later. Proposing them regardless of time was not merely
 * over-cautious, it was degenerate: measured on 22 Sep 2026, a TPLO patient
 * 26 weeks post-op received the same five passive exercises every week for
 * eight weeks, and another protocol's final week contained a single modality.
 * Answering both gates "no" turned those into 27 distinct exercises with real
 * progression.
 *
 * A default that is obviously wrong every time is a default people learn to
 * accept without reading, which costs more than it protects.
 */
const ACUTE_POST_OP_DAYS = 14;

/**
 * The gates that fail UNSAFE. A clinician confirms each one that applies
 * before a protocol built on them can be approved.
 *
 * `cautious` is what the field is proposed as when nothing in the record
 * settles it — always the value that restricts most, never the permissive one.
 *
 * TWO RULES, both learned the hard way on 22 Sep 2026 when every value here
 * was run through the real engine for the first time:
 *
 *   1. A `cautious` value is a TOKEN THE ENGINE MATCHES, not a description.
 *      Four of the twelve read perfectly to a clinician and did nothing at
 *      all. 'Non-weight-bearing' is not the key — 'NWB' is — so the most
 *      restricted weight-bearing state a patient can be in applied zero
 *      exclusions. 'Not healed' matched neither the block scan nor an
 *      exclusion key. 'Non-ambulatory' matched none of the neuro tokens. And
 *      `complicationsNoted: true` is a boolean handed to `.toLowerCase()`,
 *      which throws.
 *
 *      Anything non-null here must come from the same vocabularies the form
 *      offers (k9-rehab-frontend/src/pages/clinical/v2api.js). The test
 *      v2/cautious-defaults.test.js fails if one of them is inert.
 *
 *   2. WHERE NO HONEST CAUTIOUS VALUE EXISTS, PROPOSE NOTHING.
 *      `complicationsNoted` and `incisionStatus` are null for that reason,
 *      not by oversight. Any value that trips the complication scan asserts a
 *      complication that may not exist, and the only genuinely cautious
 *      incision values — Dehiscence, Infection — hard-block generation, so
 *      proposing one would stop every post-operative patient before the
 *      clinician had looked. mmtGrade, ivddGrade and oaStage already work
 *      this way: the gate is shown, nothing is filled in, and the clinician
 *      states it.
 *
 *      A blank a clinician must fill is safer than a fabricated value that
 *      looks answered. "true" sitting in a complications box is not caution;
 *      it is a field nobody will look at twice.
 */
const SAFETY_GATES = [
  { field: 'weightBearingStatus', label: 'Weight-bearing status',   cautious: 'NWB' },
  { field: 'incisionStatus',      label: 'Incision status',          cautious: null },
  { field: 'complicationsNoted',  label: 'Post-operative complications', cautious: null },
  // Beyond the acute window these propose NOTHING rather than "no". The gate is
  // still raised and still confirmed; it simply arrives empty, because "this
  // dog is not crated six months after surgery" is a clinician's statement to
  // make and not a default to assume in either direction.
  { field: 'crateRestRequired',   label: 'Crate rest required',
    cautious: ({ postOpDays }) =>
      (postOpDays !== null && postOpDays > ACUTE_POST_OP_DAYS ? null : true) },
  { field: 'eCollarRequired',     label: 'E-collar required',
    cautious: ({ postOpDays }) =>
      (postOpDays !== null && postOpDays > ACUTE_POST_OP_DAYS ? null : true) },
  { field: 'mmtGrade',            label: 'Muscle strength (MMT)',    cautious: null },
  { field: 'ivddGrade',           label: 'IVDD grade',               cautious: null },
  { field: 'oaStage',             label: 'Osteoarthritis stage',     cautious: null },
  { field: 'neuroProprioception', label: 'Proprioception',           cautious: 'Absent' },
  { field: 'neuroWithdrawal',     label: 'Withdrawal reflex',        cautious: 'Absent' },
  { field: 'neuroDeepPain',       label: 'Deep pain sensation',      cautious: 'Absent' },
  { field: 'neuroMotorGrade',     label: 'Motor function',           cautious: '0/5 — no voluntary motor' },
];

const has = (text, ...words) => {
  const t = String(text || '').toLowerCase();
  return words.some((w) => t.includes(w));
};

/** A trimmed non-empty string, or null. */
function text(v) {
  const s = String(v === null || v === undefined ? '' : v).trim();
  return s || null;
}

/**
 * The treatment record as engine inputs.
 *
 * V3, 2026-09-25. Before this, weight-bearing status, incision status, the
 * e-collar and crate-rest gates, the surgery date and the treatment approach
 * all came out of `patients.dashboard_data` through dashboard-bridge. They now
 * come from `patient_treatment_status`, `patient_procedures` and the two
 * columns on `patients`, and the bridge no longer maps those keys at all.
 *
 * THE RANKING, AND WHY THE BLOB IS NOT IN IT
 *
 * A caller that does not pass `treatment` gets NOTHING from here, and the
 * gates fall to their own cautious defaults. That is deliberate and it is the
 * safe direction: the alternative is to quietly read the blob as a fallback,
 * which leaves two sources for one fact and is exactly what V3 exists to end.
 * A forgotten parameter now produces a visibly over-cautious proposal rather
 * than a confident stale one.
 *
 * NORMALISERS ARE SHARED WITH THE BRIDGE ON PURPOSE. The store keeps the
 * FORM's wording — "Non-weight bearing (NWB)" — because that is what the
 * clinician chose and what the screen must show. The engine matches 'NWB'.
 * Reusing `dashboardBridge.weightBearing` and `.incisionStatus` means there is
 * one place that knows how the two vocabularies line up, rather than a second
 * copy here that can drift from it silently.
 */
function readTreatment(treatment) {
  const out = { values: {}, provenance: {} };
  if (!treatment) return out;

  const put = (field, value, from) => {
    if (value === null || value === undefined) return;
    out.values[field] = value;
    out.provenance[field] = { key: from, raw: String(value) };
  };

  const s = treatment.status;
  if (s) {
    put('weightBearingStatus', dashboardBridge.weightBearing(s.weight_bearing_status),
      'treatment status: weight bearing');
    put('incisionStatus', dashboardBridge.incisionStatus(s.incision_status),
      'treatment status: incision');
    // Tri-state. NULL means nobody answered, and an unanswered gate must stay
    // unproposed so it falls to its cautious default — which for both of these
    // is REQUIRED inside the acute window.
    if (s.e_collar_required !== null && s.e_collar_required !== undefined) {
      put('eCollarRequired', Boolean(s.e_collar_required), 'treatment status: e-collar');
    }
    if (s.strict_crate_rest !== null && s.strict_crate_rest !== undefined) {
      put('crateRestRequired', Boolean(s.strict_crate_rest), 'treatment status: crate rest');
    }
  }

  // The most recent DATED procedure. An undated one cannot place a patient in
  // a post-operative window, and guessing would close the acute gates.
  const dated = (treatment.procedures || []).filter((p) => p.procedure_date);
  if (dated.length) {
    const latest = dated.reduce((a, b) => (a.procedure_date >= b.procedure_date ? a : b));
    put('surgeryDate', latest.procedure_date, `procedure: ${latest.procedure_type}`);
  }

  if (treatment.approach) put('treatmentApproach', treatment.approach, 'treatment: approach');

  return out;
}

/** Days since a date, or null if we cannot tell. */
function daysSince(value) {
  if (!value) return null;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

/**
 * Which safety gates matter for THIS patient.
 *
 * A TPLO four days post-op needs incision status and weight-bearing; it does
 * not need an IVDD grade. Showing a clinician twelve gates when five apply is
 * how a verification step turns back into a form.
 */
function applicableGates(patient) {
  const dx = `${patient.condition || ''} ${patient.affected_region || ''} ${patient.medical_history || ''}`;
  const postOpDays = daysSince(patient.surgery_date);
  const datedRecent = postOpDays !== null && postOpDays >= 0 && postOpDays <= 365;

  // A record can say "TPLO Post-Op" and carry no surgery date at all - found
  // on a real patient, where keying post-operative gates purely off the date
  // meant incision status, complications, e-collar and crate rest were never
  // asked. All four fail UNSAFE. So the text counts as evidence too, and an
  // undated post-operative description is treated as ACTIVE rather than old:
  // we cannot know it has healed, so we ask.
  // Read the CURRENT PRESENTATION, not the background. A history saying
  // "No surgical candidate" contains the word "surgical" and was matching -
  // so a patient explicitly ruled out for surgery was asked post-operative
  // gates. History says what happened; `condition` says what is being treated
  // today, and only today's presentation makes an incision an open question.
  //
  // The generic words "surgery" and "surgical" are deliberately absent: they
  // appear as often in a negation as in a diagnosis. The markers below name
  // an actual procedure.
  const presentation = `${patient.condition || ''} ${patient.affected_region || ''}`;
  const surgicalText = has(presentation, 'post-op', 'postop', 'post op', 'tplo', 'tta',
                               'repair', 'osteotomy', 'ectomy', 'otomy',
                               'arthrodesis', 'amputation', 'stabilisation', 'stabilization');
  const recentSurgery = datedRecent || (surgicalText && postOpDays === null);

  // Lumbosacral disease and spondylosis are here on Sal's call: lumbosacral
  // spondylosis compresses the cauda equina, so proprioceptive deficit, a lost
  // withdrawal reflex and motor weakness are all live questions even when the
  // record describes it as an orthopaedic or degenerative problem.
  const neuro = has(dx, 'ivdd', 'disc', 'myelopath', 'neuro', 'paresis', 'paralys',
                        'fce', 'wobbler', 'cauda equina', 'nerve', 'spinal',
                        'lumbosacral', 'spondylosis', 'radiculopath');
  const ivdd = has(dx, 'ivdd', 'disc', 'hansen');
  const arthritic = has(dx, 'arthr', 'oa ', 'osteoarth', 'djd', 'degenerative joint');
  const ortho = has(dx, 'ccl', 'cruciate', 'tplo', 'tta', 'patell', 'hip', 'elbow',
                        'fracture', 'luxation', 'dysplasia', 'tendon', 'ligament');

  const nonAmbulatory = has(patient.mobility_level, 'non-ambulatory', 'non ambulatory', 'unable');
  const lame = Number(patient.lameness_grade) > 0;

  const on = new Set();
  // Weight-bearing governs loading. Relevant to anything orthopaedic, lame,
  // post-operative or neurological — which is nearly every rehab patient, and
  // that is the correct breadth for the field that gates loading work.
  if (ortho || lame || recentSurgery || neuro || nonAmbulatory) on.add('weightBearingStatus');
  if (recentSurgery) { on.add('incisionStatus'); on.add('complicationsNoted'); on.add('eCollarRequired'); }
  if (recentSurgery || ivdd) on.add('crateRestRequired');
  if (neuro || nonAmbulatory) {
    on.add('mmtGrade');
    on.add('neuroProprioception'); on.add('neuroWithdrawal');
    on.add('neuroDeepPain'); on.add('neuroMotorGrade');
  }
  if (ivdd) on.add('ivddGrade');
  if (arthritic) on.add('oaStage');

  // Nothing matched — an unusual or sparsely described case. Ask for the two
  // that gate loading rather than letting an unrecognised diagnosis through
  // with no restriction at all.
  if (on.size === 0) { on.add('weightBearingStatus'); on.add('mmtGrade'); }
  return on;
}

/** Split a single stored client name into the two the engine expects. */
function splitClientName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

/**
 * Build the proposal.
 *
 * @param {object}  patient       the patient row
 * @param {object}  clinicInputs  engine-shaped capability values from clinic-store
 * @param {object} [priorInputs]  the previous protocol version's inputs, if any
 * @returns {{ proposed: object, gates: Array, summary: object }}
 */
function proposeEngineInputs({
  patient, clinicInputs = {}, priorInputs = null, treatment = null,
} = {}) {
  if (!patient || !patient.id) {
    const err = new Error('A patient record is required to propose engine inputs');
    err.code = 'NO_PATIENT';
    throw err;
  }

  // ── The V1 clinical record ───────────────────────────────────────────────
  //
  // The practice keeps a second, fuller record of the same patient in
  // `dashboard_data`, and until 22 Sep 2026 nothing read it. See
  // dashboard-bridge.js for what it holds and how it is mapped.
  //
  // It FILLS GAPS ONLY. A column that holds a real value wins, because it is
  // what somebody most recently entered in this workflow. Where the column is
  // empty the V1 record answers, and every value it answers with is recorded
  // in `why` so the clinician can see it came from the chart rather than from
  // today's examination.
  //
  // Zero is not a real value for age or weight. A live record held age 0 on a
  // ten-year-old dog while the chart said 10, and treating 0 as "filled in" is
  // how it stayed that way.
  const v1 = dashboardBridge.readDashboard(patient);
  // V3: the treatment block's own store. Ranks ABOVE the V1 record for every
  // field it answers, because it IS the record for those fields now.
  const tx = readTreatment(treatment);
  const why = {};

  const filled = (columnValue, isNumeric) => {
    if (columnValue === null || columnValue === undefined) return false;
    if (String(columnValue).trim() === '') return false;
    if (isNumeric && Number(columnValue) === 0) return false;
    return true;
  };

  // The patient row as the proposal should read it: the columns, with the V1
  // record answering where they are silent. Everything below — the derived
  // treatment approach, the phase calculation, which safety gates apply —
  // reads THIS rather than the raw row, because a surgery date recovered from
  // the chart has to raise the post-operative gates too.
  const effective = { ...patient };
  const FILL = [
    ['condition', 'diagnosis'], ['affected_region', 'affectedRegion'],
    ['surgery_date', 'surgeryDate'], ['medical_history', 'medicalHistory'],
    ['current_medications', 'currentMedications'],
    ['special_instructions', 'specialInstructions'],
    ['pain_level', 'painScore', true], ['lameness_grade', 'lamenessGrade', true],
    ['mobility_level', 'mobilityLevel'], ['breed', 'breed'],
    ['age', 'age', true], ['weight', 'weight', true],
  ];
  const recovered = [];
  for (const [column, engineKey, numeric] of FILL) {
    if (filled(patient[column], numeric)) continue;
    const value = v1.values[engineKey];
    if (value === undefined || value === null) continue;
    effective[column] = value;
    recovered.push(engineKey);
    const prov = v1.provenance[engineKey];
    why[engineKey] = `Not in the patient record. Read from this practice's clinical `
      + `record — ${prov ? prov.key : 'V1'}.`;
  }

  // A recorded PROCEDURE outranks the legacy `surgery_date` column: the
  // column holds one date and a patient can have several operations, which is
  // why patient_procedures exists. Verified against all five patients on
  // 2026-09-25 — the two agree everywhere, so this changes no current case.
  if (tx.values.surgeryDate) {
    effective.surgery_date = tx.values.surgeryDate;
    why.surgeryDate = `From the recorded ${tx.provenance.surgeryDate.key}.`;
  }

  const { first, last } = splitClientName(effective.client_name);
  const postOpDays = daysSince(effective.surgery_date);

  // ── From the record. No clinician action. ────────────────────────────────
  const proposed = {
    patientName: effective.name || '',
    clientFirstName: first,
    clientLastName: last,
    diagnosis: effective.condition || '',
    affectedRegion: effective.affected_region || null,
    surgeryDate: effective.surgery_date || null,
    medicalHistory: effective.medical_history || '',
    currentMedications: effective.current_medications || '',
    specialInstructions: effective.special_instructions || '',
    painScore: effective.pain_level ?? null,
    painLevel: effective.pain_level ?? null,
    lamenessGrade: effective.lameness_grade ?? null,
    mobilityLevel: effective.mobility_level || null,
    species: effective.species || 'Canine',
    breed: effective.breed || '',
  };

  // COUNTED, not stated. `summary.fromRecord` was the literal 15 while the
  // header said 14; a hardcoded count and the object above it drift apart the
  // first time somebody adds a field to one of them.
  const fromRecordCount = Object.keys(proposed).length;

  // Each field this run DERIVES from a rule, as it derives it. Treatment
  // approach is only derived when the record does not state it, so this is a
  // property of the run and not a constant.
  const derivedFields = new Set();

  // ── From the clinic. A property of the practice, not the animal. ─────────
  // Tri-state is preserved: null means "unstated", which the engine treats
  // differently from "unavailable". Never coerce it here.
  for (const [key, value] of Object.entries(clinicInputs)) proposed[key] = value;

  // ── Derived, each from a rule a clinician can check. ─────────────────────
  // Same evidence as the gates, and for the same reason. Keying this off the
  // surgery date alone called a record reading "TPLO Post-Op" Conservative,
  // because the date field was empty - and treatment approach routes the
  // engine down a different protocol path, so that is not a cosmetic miss.
  const surgicalPresentation = has(
    `${effective.condition || ''} ${effective.affected_region || ''}`,
    'post-op', 'postop', 'post op', 'tplo', 'tta', 'repair', 'osteotomy',
    'ectomy', 'otomy', 'arthrodesis', 'amputation', 'stabilisation', 'stabilization'
  );
  // AN EXPLICIT ANSWER BEATS AN INFERENCE.
  //
  // Until 2026-09-24 the derivation below ran unconditionally, so the
  // clinician's own selection in the Treatment panel was read by
  // dashboard-bridge and then immediately overwritten. Two consequences:
  //
  //   * The panel offers SURGICAL, CONSERVATIVE and PALLIATIVE. The derivation
  //     can only ever produce the first two. `getProtocolType` routes
  //     'palliative' to the comfort-care protocol AHEAD of diagnosis, so a
  //     patient placed on comfort care was silently given a rehabilitation
  //     protocol instead. That is the reason this changed.
  //
  //   * Checked against all five current patients on 2026-09-24, the
  //     derivation agreed with the recorded answer every time. So this changes
  //     no present case; it changes the case where they disagree, and there
  //     the clinician wins.
  //
  // The derivation is NOT deleted. It still runs whenever nothing is recorded,
  // which is what it was written for: a record reading "TPLO Post-Op" with an
  // empty surgery date was being called Conservative.
  // V3 order: the treatment store, then the patient column, then the V1
  // record, then the derivation. The first three are all somebody STATING the
  // approach; only the last is an inference.
  const recordedApproach = tx.values.treatmentApproach
    || text(effective.treatment_approach)
    || v1.values.treatmentApproach;
  if (recordedApproach) {
    // Not added to derivedFields: this one was READ, not inferred.
    const prov = v1.provenance.treatmentApproach;
    proposed.treatmentApproach = recordedApproach;
    why.treatmentApproach = `Recorded in this practice's clinical record as `
      + `"${prov ? prov.raw : recordedApproach}". A stated approach is used as `
      + `stated rather than inferred from the surgery date.`;
  } else if (effective.surgery_date) {
    derivedFields.add('treatmentApproach');
    proposed.treatmentApproach = 'Surgical';
    why.treatmentApproach = `A surgery date of ${effective.surgery_date} is on the record.`;
  } else if (surgicalPresentation) {
    derivedFields.add('treatmentApproach');
    proposed.treatmentApproach = 'Surgical';
    why.treatmentApproach = 'The presentation names a surgical procedure, though no date is recorded.';
  } else {
    derivedFields.add('treatmentApproach');
    proposed.treatmentApproach = 'Conservative';
    why.treatmentApproach = 'No surgery date, and the presentation names no procedure.';
  }

  // Protocol shape follows how far into recovery the animal is. These are
  // starting points the clinician adjusts, not restrictions, so a wrong guess
  // is visible and harmless.
  derivedFields.add('protocolLength');
  derivedFields.add('frequency');
  if (postOpDays !== null && postOpDays >= 0 && postOpDays <= 14) {
    proposed.protocolLength = 4;  proposed.frequency = 'Every other day';
    why.protocolLength = `${postOpDays} days post-operative — acute phase.`;
  } else if (postOpDays !== null && postOpDays > 14 && postOpDays <= 42) {
    proposed.protocolLength = 6;  proposed.frequency = 'Every other day';
    why.protocolLength = `${postOpDays} days post-operative — subacute phase.`;
  } else {
    proposed.protocolLength = 8;  proposed.frequency = 'Every other day';
    why.protocolLength = postOpDays === null
      ? 'No surgery date — a conservative eight-week block.'
      : `${postOpDays} days post-operative — remodelling phase.`;
  }

  // ── Safety gates. Proposed cautiously, confirmed by a person. ────────────
  // THE UNION IS DELIBERATE, AND IT IS A SAFETY RULE.
  //
  // Recovering data from the V1 record can RECLASSIFY a patient: finding a
  // surgery date turned one live record from Conservative to Surgical, which
  // correctly gained four post-operative gates — and silently dropped the
  // muscle-strength gate, because that classification does not ask for it.
  //
  // Losing a gate is the fails-unsafe direction, and this module's own rule is
  // that a gate shown unnecessarily costs a clinician two seconds while a gate
  // hidden wrongly costs them the restriction. So filling a gap may only ADD
  // questions. Anything the raw record would have asked is still asked.
  const applicable = new Set([
    ...applicableGates(patient),
    ...applicableGates(effective),
    // THIRD READING: the clinical record's OWN WORDS, even where a column
    // already answered.
    //
    // `effective` only takes the record's diagnosis when the column is EMPTY,
    // and a column is usually a short label while the record is a full
    // statement. Charlie, 2026-09-24:
    //
    //   condition column  "Bilateral Hip Osteoarthritis (moderate-severe)"
    //   clinical record   "Bilateral coxofemoral osteoarthritis (R>L),
    //                      spondylosis L7-S1"
    //
    // The column is not wrong, it is shorter — and the word it drops is the
    // one `applicableGates` looks for. Lumbosacral spondylosis is in the neuro
    // list deliberately, because it compresses the cauda equina. Reading only
    // the column, Charlie was asked 2 gates. Reading the record too, he is
    // asked 7, the extra five being muscle strength and all four neurological
    // findings.
    //
    // This is safe for the same reason the union above is: applicability may
    // only ADD questions. A gate shown unnecessarily costs a clinician two
    // seconds; a gate hidden wrongly costs them the restriction. Post-op
    // timing is deliberately NOT re-read here — `surgery_date` is carried from
    // `effective` so this adds a text dimension and changes no date logic.
    ...applicableGates({
      id: patient.id,
      condition: [
        v1.values.diagnosis,
        v1.context['assessment::Comorbidities / Secondary Diagnoses'],
        v1.context['assessment::Chief Complaint'],
      ].filter(Boolean).join(' '),
      affected_region: v1.values.affectedRegion || '',
      medical_history: v1.values.medicalHistory || '',
      surgery_date: effective.surgery_date || null,
      mobility_level: v1.values.mobilityLevel || '',
      lameness_grade: v1.values.lamenessGrade ?? null,
    }),
  ]);
  const gates = [];

  for (const gate of SAFETY_GATES) {
    const relevant = applicable.has(gate.field);

    // A previous approved protocol is evidence, not authority. It is offered
    // as the starting value and still requires confirmation, because the
    // animal may have changed since — which is the entire reason for a recheck.
    const carried = priorInputs && priorInputs[gate.field] !== undefined
      ? priorInputs[gate.field] : undefined;

    // The V1 clinical record is the same class of evidence, one rank below.
    //
    // THIS IS THE CONSEQUENTIAL LINE IN THE WHOLE BRIDGE, so it is worth being
    // plain about what it does. For a gate the record answers, the clinician is
    // now shown the CHART VALUE instead of the most cautious one. That is
    // sometimes less restrictive: a chart reading "Full weight bearing" is
    // proposed as FWB where the cautious default was NWB.
    //
    // It is justified on the same ground as `carried`, and on no other: it is a
    // finding a clinician recorded, it is labelled with where it came from, and
    // it STILL REQUIRES CONFIRMATION before anything can be approved. What it is
    // not is an examination of the animal today, and the wording says so.
    //
    // The alternative — always showing the cautious default even when the chart
    // answers — was rejected because a gate that is obviously wrong every time
    // is a gate people learn to click through, and that costs more safety than
    // it buys.
    // V3: the treatment store answers first among the record-derived sources.
    // It is not "another record" — for these fields it is THE record, and the
    // blob copies are inert.
    const fromStore = carried === undefined && tx.values[gate.field] !== undefined
      ? tx.values[gate.field] : undefined;

    const fromV1 = carried === undefined && fromStore === undefined
      && v1.values[gate.field] !== undefined
      ? v1.values[gate.field] : undefined;

    // A cautious value may depend on the case — crate rest is ordinary two days
    // after surgery and implausible six months after it.
    const cautious = typeof gate.cautious === 'function'
      ? gate.cautious({ postOpDays, patient: effective })
      : gate.cautious;

    const value = carried !== undefined ? carried
      : fromStore !== undefined ? fromStore
        : fromV1 !== undefined ? fromV1
          : cautious;
    proposed[gate.field] = relevant ? value : null;

    if (relevant) {
      const prov = fromStore !== undefined ? tx.provenance[gate.field]
        : fromV1 !== undefined ? v1.provenance[gate.field] : null;
      gates.push({
        field: gate.field,
        label: gate.label,
        proposed: value,
        source: SOURCE.GATE,
        carriedForward: carried !== undefined,
        fromTreatmentRecord: fromStore !== undefined,
        fromClinicalRecord: fromV1 !== undefined,
        mustConfirm: true,
        why: carried !== undefined
          ? 'Carried from the last approved protocol. Confirm it still holds.'
          : fromStore !== undefined
            ? `Recorded in the treatment record as "${prov ? prov.raw : value}". `
              + 'That is a previous finding, not today\'s examination — confirm it still holds.'
            : fromV1 !== undefined
            ? `Recorded in this practice's clinical record as "${prov ? prov.raw : value}". `
              + 'That is a previous finding, not today\'s examination — confirm it still holds.'
              : 'Not derivable from the record — proposed at its most cautious value.',
      });
    }
  }

  // A post-operative description with no date: the phase calculation has
  // nothing to work from, so say so rather than quietly assuming remodelling.
  const undatedSurgery = postOpDays === null && has(
    `${effective.condition || ''} ${effective.affected_region || ''}`,
    'post-op', 'postop', 'post op', 'tplo', 'tta', 'repair', 'osteotomy',
    'ectomy', 'otomy', 'arthrodesis', 'amputation'
  );
  if (undatedSurgery) {
    why.surgeryDate = 'The record describes a surgical case but carries no surgery date. '
      + 'Phase cannot be calculated, and post-operative restrictions are being asked as if active.';
  }

  const summary = {
    undatedSurgery,
    fromRecord: fromRecordCount,
    fromClinic: Object.keys(clinicInputs).length,
    derived: derivedFields.size,
    // Which way the approach was settled. It routes the engine down a
    // different protocol path, so "who decided this" is worth surfacing.
    treatmentApproachSource: derivedFields.has('treatmentApproach') ? 'DERIVED' : 'RECORD',
    gatesApplicable: gates.length,
    gatesSkipped: SAFETY_GATES.length - gates.length,
    // What the patient columns did not hold and the V1 clinical record did.
    // Reported so the count is visible rather than inferred from the `why`
    // entries, and so a clinic can see how much of its record was stranded.
    fromClinicalRecord: recovered,
    clinicalRecordPresent: v1.present,
    // Where the two records disagree. Surfaced, never resolved: which is right
    // is a clinical question, and a precedence rule buried in a mapper is not
    // the place to answer it.
    conflicts: dashboardBridge.disagreements(patient, dashboardBridge.COMPARABLE),
    why,
  };

  return { proposed, gates, summary };
}

/**
 * The applicable gates for a protocol version, derived from the engine input
 * that produced it.
 *
 * `applicableGates` reads a patient row; a stored version holds engine-shaped
 * input. Same facts, different key names, so this translates rather than
 * duplicating the rules — one place decides what applies.
 */
function gatesFromEngineInput(engineInput = {}) {
  return applicableGates({
    id: 1,
    condition: engineInput.diagnosis || '',
    affected_region: engineInput.affectedRegion || '',
    medical_history: engineInput.medicalHistory || '',
    surgery_date: engineInput.surgeryDate || null,
    mobility_level: engineInput.mobilityLevel || '',
    lameness_grade: engineInput.lamenessGrade ?? null,
  });
}

/**
 * Has every applicable gate been confirmed?
 *
 * The UI shows the gates; this decides. A protocol must not reach approval on
 * values nobody looked at, and "the screen showed them" is not the same as "a
 * clinician confirmed them".
 */
function unconfirmedGates(gates, confirmations = {}) {
  return gates
    .filter((g) => g.mustConfirm)
    .filter((g) => confirmations[g.field] !== true)
    .map((g) => g.field);
}

module.exports = {
  SOURCE,
  SAFETY_GATES,
  applicableGates,
  gatesFromEngineInput,
  proposeEngineInputs,
  unconfirmedGates,
  splitClientName,
  daysSince,
  readTreatment,
};
