/**
 * K9 Clinical Workflow V2 — intake proposal
 *
 * Builds the engine's 40 inputs from what the system already knows, so a
 * clinician verifies a clinical picture instead of typing one.
 *
 * WHAT THIS REPLACES
 * A seven-step wizard asking 186 fields before a protocol appeared. Roughly
 * 150 of those the engine never read. Of the 40 it does read, 14 already sit
 * on the patient record, 10 are properties of the clinic rather than the
 * animal, and 4 follow from a stated rule. That leaves 12 — the safety gates —
 * and a clinician only ever sees the ones relevant to the case in front of
 * them.
 *
 * WHY THIS IS RULES AND NOT A LANGUAGE MODEL
 * ------------------------------------------
 * "AI does the work" here means the protocol engine — 260 exercises, 33 safety
 * gates, evidence-graded selection. That is the intelligence, and it already
 * exists. This module's job is only to assemble its inputs.
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
  { field: 'crateRestRequired',   label: 'Crate rest required',      cautious: true },
  { field: 'eCollarRequired',     label: 'E-collar required',        cautious: true },
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
function proposeEngineInputs({ patient, clinicInputs = {}, priorInputs = null } = {}) {
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
  if (effective.surgery_date) {
    proposed.treatmentApproach = 'Surgical';
    why.treatmentApproach = `A surgery date of ${effective.surgery_date} is on the record.`;
  } else if (surgicalPresentation) {
    proposed.treatmentApproach = 'Surgical';
    why.treatmentApproach = 'The presentation names a surgical procedure, though no date is recorded.';
  } else {
    proposed.treatmentApproach = 'Conservative';
    why.treatmentApproach = 'No surgery date, and the presentation names no procedure.';
  }

  // Protocol shape follows how far into recovery the animal is. These are
  // starting points the clinician adjusts, not restrictions, so a wrong guess
  // is visible and harmless.
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
    const fromV1 = carried === undefined && v1.values[gate.field] !== undefined
      ? v1.values[gate.field] : undefined;

    const value = carried !== undefined ? carried
      : fromV1 !== undefined ? fromV1
        : gate.cautious;
    proposed[gate.field] = relevant ? value : null;

    if (relevant) {
      const prov = fromV1 !== undefined ? v1.provenance[gate.field] : null;
      gates.push({
        field: gate.field,
        label: gate.label,
        proposed: value,
        source: SOURCE.GATE,
        carriedForward: carried !== undefined,
        fromClinicalRecord: fromV1 !== undefined,
        mustConfirm: true,
        why: carried !== undefined
          ? 'Carried from the last approved protocol. Confirm it still holds.'
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
    fromRecord: 15,
    fromClinic: Object.keys(clinicInputs).length,
    derived: 3,
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
};
