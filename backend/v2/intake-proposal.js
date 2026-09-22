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

  const { first, last } = splitClientName(patient.client_name);
  const postOpDays = daysSince(patient.surgery_date);
  const why = {};

  // ── From the record. No clinician action. ────────────────────────────────
  const proposed = {
    patientName: patient.name || '',
    clientFirstName: first,
    clientLastName: last,
    diagnosis: patient.condition || '',
    affectedRegion: patient.affected_region || null,
    surgeryDate: patient.surgery_date || null,
    medicalHistory: patient.medical_history || '',
    currentMedications: patient.current_medications || '',
    specialInstructions: patient.special_instructions || '',
    painScore: patient.pain_level ?? null,
    painLevel: patient.pain_level ?? null,
    lamenessGrade: patient.lameness_grade ?? null,
    mobilityLevel: patient.mobility_level || null,
    species: patient.species || 'Canine',
    breed: patient.breed || '',
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
    `${patient.condition || ''} ${patient.affected_region || ''}`,
    'post-op', 'postop', 'post op', 'tplo', 'tta', 'repair', 'osteotomy',
    'ectomy', 'otomy', 'arthrodesis', 'amputation', 'stabilisation', 'stabilization'
  );
  if (patient.surgery_date) {
    proposed.treatmentApproach = 'Surgical';
    why.treatmentApproach = `A surgery date of ${patient.surgery_date} is on the record.`;
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
  const applicable = applicableGates(patient);
  const gates = [];

  for (const gate of SAFETY_GATES) {
    const relevant = applicable.has(gate.field);

    // A previous approved protocol is evidence, not authority. It is offered
    // as the starting value and still requires confirmation, because the
    // animal may have changed since — which is the entire reason for a recheck.
    const carried = priorInputs && priorInputs[gate.field] !== undefined
      ? priorInputs[gate.field] : undefined;

    const value = carried !== undefined ? carried : gate.cautious;
    proposed[gate.field] = relevant ? value : null;

    if (relevant) {
      gates.push({
        field: gate.field,
        label: gate.label,
        proposed: value,
        source: SOURCE.GATE,
        carriedForward: carried !== undefined,
        mustConfirm: true,
        why: carried !== undefined
          ? 'Carried from the last approved protocol. Confirm it still holds.'
          : 'Not derivable from the record — proposed at its most cautious value.',
      });
    }
  }

  // A post-operative description with no date: the phase calculation has
  // nothing to work from, so say so rather than quietly assuming remodelling.
  const undatedSurgery = postOpDays === null && has(
    `${patient.condition || ''} ${patient.affected_region || ''}`,
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
