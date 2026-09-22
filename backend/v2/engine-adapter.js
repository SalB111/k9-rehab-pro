/**
 * K9 Clinical Workflow V2 — Engine Adapter
 *
 * Converts V2 clinical state into the exact flat `formData` object the existing
 * K9 clinical engine (backend/protocol-generator.js) expects, and drives that
 * engine in the one call order its safety gates require.
 *
 * This module does NOT:
 *   - reimplement any clinical logic
 *   - decide exercise eligibility, dosage, phase, or contraindication
 *   - modify the source patient record
 *   - approve anything
 *
 * It is a translation + invocation boundary. All clinical reasoning stays in
 * the existing engine.
 *
 * TWO CONTRACTS THIS FILE EXISTS TO ENFORCE
 * ----------------------------------------
 * 1. COMPLETENESS. Every input listed in contracts/k9-engine-input-contract.json
 *    must be carried through. 33 of the 36 are safety gates. A dropped field is
 *    not a neutral omission:
 *      - restriction fields (weightBearingStatus, incisionStatus, mmtGrade,
 *        ivddGrade, oaStage, neuro*, complicationsNoted, crateRest, eCollar)
 *        fail UNSAFE — the restriction never fires.
 *      - enablement fields (aquaticAccess, modality*) fail RESTRICTIVE — therapy
 *        the clinic can deliver is silently withheld.
 *    `toEngineFormData` therefore emits every key explicitly, using null for
 *    genuinely-unknown rather than letting a key go missing.
 *
 * 2. CALL ORDER. validateIntake() MUTATES formData in place, setting five
 *    private severity flags (_highPainOverride, _severeWeakness, _ivddSevere,
 *    _severeOA, _gradeVSupport) that getExcludedCodes() and
 *    selectExercisesForWeek() later read off the SAME OBJECT.
 *
 *    Verified by mutation test: a copy taken AFTER validateIntake keeps the
 *    flags (they are plain enumerable props). What breaks the gates is
 *    generating from an object that never went through validateIntake --
 *    validating one object and building from another, or skipping validation
 *    because the caller believes the input is already well-formed. In that case
 *    a Kellgren-Lawrence Grade 4 patient receives HILL_CLIMB and BACKWARD_HILL.
 *    No error is raised; the protocol generates and looks normal.
 *
 *    `runEngine` is the only supported way to invoke the engine from V2. Do not
 *    call selectExercisesForWeek directly from V2 code.
 */

'use strict';

const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Engine input contract — loaded from the contract file so the adapter and the
// contract cannot drift apart silently.
// ---------------------------------------------------------------------------

const CONTRACT_PATH = path.join(__dirname, 'contracts', 'k9-engine-input-contract.json');

const CONTRACT = JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));

/** All 36 engine inputs, in contract order. */
const ENGINE_INPUTS = Object.keys(CONTRACT.engine_inputs);

/** The five flags validateIntake sets by mutation. Never set these by hand. */
const DERIVED_FLAGS = Object.keys(
  CONTRACT.CRITICAL_call_order_dependency.derived_flags_set_by_validateIntake
);

// ---------------------------------------------------------------------------
// Value helpers
// ---------------------------------------------------------------------------

/**
 * Explicit-null pick. Returns null (not undefined) for absent values so the key
 * is always present on the emitted object and a dropped field is detectable.
 */
function pick(...candidates) {
  for (const value of candidates) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

/**
 * Normalize a tri-state capability flag.
 *
 * The engine accepts boolean true or the string 'true' and treats everything
 * else as "not available". We preserve unknown as null rather than coercing it
 * to false, so a clinic profile that was never filled in is distinguishable
 * from one that explicitly says "we do not have this". Both withhold the
 * exercise in the engine, but only one of them is a data-entry gap worth
 * surfacing to the clinician.
 */
function capability(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return Boolean(value);
}

/**
 * Is this a cat?
 *
 * Deliberately generous. The species column holds "feline", "Feline" and
 * "cat" across the database, and the cost of the two answers is not
 * symmetrical: reading a dog as a cat withholds a protocol somebody can ask
 * about, while reading a cat as a dog prescribes hill walking to a cat.
 */
function isFeline(species) {
  return /fel|cat/i.test(String(species || ''));
}

/**
 * Split a single stored client name into first and last.
 *
 * The K9 `patients` table has one `client_name` column; the engine wants first
 * and last and rejects the request outright when neither is present. Everything
 * before the final space is the forename, the remainder the surname. A single
 * token is treated as a surname.
 */
function splitClientName(value) {
  if (!value || typeof value !== 'string') return { first: null, last: null };
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: null, last: null };
  if (parts.length === 1) return { first: null, last: parts[0] };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

// ---------------------------------------------------------------------------
// V2 clinical state -> engine formData
// ---------------------------------------------------------------------------

/**
 * Build the engine's flat formData from V2 clinical state.
 *
 * @param {object} state
 * @param {object} state.patient  Longitudinal patient record (persists across visits).
 * @param {object} state.visit    Today's assessment (changes every visit).
 * @param {object} state.clinic   Clinic capabilities — aquatic + modality equipment.
 *                                These are properties of the FACILITY, not the patient,
 *                                which is why they are a separate branch of V2 state.
 * @param {object} [state.protocol] Protocol parameters (length, frequency).
 * @returns {object} flat camelCase formData carrying all 36 engine inputs.
 */
function toEngineFormData(state) {
  const patient = (state && state.patient) || {};
  const visit = (state && state.visit) || {};
  const clinic = (state && state.clinic) || {};
  const protocol = (state && state.protocol) || {};

  const formData = {
    // ── Identity (hard validation requirements) ──────────────────────────────
    patientName: pick(patient.name, patient.patientName),
    // The production `patients` table stores ONE `client_name` ("David Chen").
    // The engine requires clientFirstName or clientLastName and hard-errors on
    // "Client name is required" if both are absent, so a single stored name is
    // split here. A one-word name becomes the surname, which is how a client
    // would be addressed on a record.
    clientFirstName: pick(
      patient.client_first_name,
      patient.clientFirstName,
      splitClientName(patient.client_name).first
    ),
    clientLastName: pick(
      patient.client_last_name,
      patient.clientLastName,
      splitClientName(patient.client_name).last
    ),

    // ── Clinical context (longitudinal, from the patient record) ─────────────
    // NOTE: the engine's field is `diagnosis`. The K9 patient record stores this
    // as `condition`. Mapping them is required — leaving `condition` unmapped
    // makes the engine silently default to 'Conditioning'.
    diagnosis: pick(patient.diagnosis, patient.condition),
    affectedRegion: pick(patient.affected_region, patient.affectedRegion),
    // Treatment approach exists NOWHERE in the production patients table, so it
    // silently defaulted to 'Conservative' — which for an IVDD Hansen Type I
    // patient is a different protocol path entirely. It is a decision made at a
    // visit (a conservative trial can convert to surgical), so the visit is
    // consulted first, then the patient record, then an explicit override.
    treatmentApproach: pick(
      visit.treatment_approach,
      visit.treatmentApproach,
      patient.treatment_approach,
      patient.treatmentApproach,
      protocol.treatment_approach
    ),
    surgeryDate: pick(patient.surgery_date, patient.surgeryDate),
    medicalHistory: pick(patient.medical_history, patient.medicalHistory),
    currentMedications: pick(patient.current_medications, patient.currentMedications),
    specialInstructions: pick(patient.special_instructions, patient.specialInstructions),

    // ── Today's assessment (from the visit, falling back to patient baseline) ─
    painScore: pick(visit.pain_score, visit.painScore, visit.pain_level, patient.pain_level),
    painLevel: pick(visit.pain_level, visit.painLevel, visit.pain_score, patient.pain_level),
    lamenessGrade: pick(visit.lameness_grade, visit.lamenessGrade, patient.lameness_grade),
    weightBearingStatus: pick(
      visit.weight_bearing_status,
      visit.weightBearingStatus,
      visit.weight_bearing
    ),
    mobilityLevel: pick(visit.mobility_level, visit.mobilityLevel, patient.mobility_level),

    // ── Clinical grading scales (drive phase locks via validateIntake) ───────
    mmtGrade: pick(visit.mmt_grade, visit.mmtGrade),
    ivddGrade: pick(visit.ivdd_grade, visit.ivddGrade, patient.ivdd_grade),
    oaStage: pick(visit.oa_stage, visit.oaStage, patient.oa_stage),

    // ── Neurological examination (Grade V detection) ─────────────────────────
    neuroProprioception: pick(visit.neuro_proprioception, visit.neuroProprioception),
    neuroWithdrawal: pick(visit.neuro_withdrawal, visit.neuroWithdrawal),
    neuroDeepPain: pick(visit.neuro_deep_pain, visit.neuroDeepPain),
    neuroMotorGrade: pick(visit.neuro_motor_grade, visit.neuroMotorGrade),

    // ── Post-operative status ────────────────────────────────────────────────
    incisionStatus: pick(visit.incision_status, visit.incisionStatus),
    complicationsNoted: pick(visit.complications_noted, visit.complicationsNoted),

    // ── Activity restrictions ────────────────────────────────────────────────
    crateRestRequired: capability(pick(visit.crate_rest_required, visit.crateRestRequired)),
    eCollarRequired: capability(pick(visit.e_collar_required, visit.eCollarRequired)),

    // ── Clinic capabilities (ENABLEMENT gates — absence withholds therapy) ───
    aquaticAccess: capability(pick(clinic.aquatic_access, clinic.aquaticAccess)),
    modalityUWTM: capability(pick(clinic.modality_uwtm, clinic.modalityUWTM)),
    modalityLaser: capability(pick(clinic.modality_laser, clinic.modalityLaser)),
    modalityTENS: capability(pick(clinic.modality_tens, clinic.modalityTENS)),
    modalityNMES: capability(pick(clinic.modality_nmes, clinic.modalityNMES)),
    modalityTherapeuticUS: capability(
      pick(clinic.modality_therapeutic_us, clinic.modalityTherapeuticUS)
    ),
    modalityPulsedEMF: capability(pick(clinic.modality_pulsed_emf, clinic.modalityPulsedEMF)),
    modalityShockwave: capability(pick(clinic.modality_shockwave, clinic.modalityShockwave)),
    modalityCryotherapy: capability(pick(clinic.modality_cryotherapy, clinic.modalityCryotherapy)),
    modalityHeatTherapy: capability(pick(clinic.modality_heat_therapy, clinic.modalityHeatTherapy)),

    // ── Route-level inputs (consumed by the generation loop, not the engine) ─
    protocolLength: pick(protocol.length_weeks, protocol.protocolLength),
    frequency: pick(protocol.frequency),
    species: pick(patient.species),
    breed: pick(patient.breed),
    age: pick(patient.age),
    weight: pick(patient.weight, patient.weight_lbs, patient.weightLbs),
  };

  return formData;
}

// ---------------------------------------------------------------------------
// Contract guard
// ---------------------------------------------------------------------------

/**
 * Assert that a formData object carries every engine input.
 *
 * This is the regression net for the dropped-field class of defect. It checks
 * that the KEY is present — a null value is a legitimate "not known", but a
 * missing key means the adapter forgot the field entirely.
 *
 * @returns {{ok: boolean, missing: string[], unexpectedFlags: string[]}}
 */
function verifyEngineContract(formData) {
  const missing = ENGINE_INPUTS.filter((key) => !(key in formData));

  // Derived flags must never be pre-set by the adapter — only validateIntake
  // may set them. A pre-set flag would forge a severity state the clinical
  // assessment did not actually establish.
  const unexpectedFlags = DERIVED_FLAGS.filter((flag) => flag in formData);

  return { ok: missing.length === 0 && unexpectedFlags.length === 0, missing, unexpectedFlags };
}

// ---------------------------------------------------------------------------
// Engine invocation — the ONLY supported entry point
// ---------------------------------------------------------------------------

/**
 * Run the existing K9 clinical engine against V2-supplied formData.
 *
 * Enforces the mutation contract: validateIntake is called first, on the exact
 * object subsequently handed to selectExercisesForWeek, so the severity flags
 * it sets are guaranteed to reach the exclusion logic.
 *
 * @param {object} formData  Output of toEngineFormData. MUTATED in place by the engine.
 * @param {object} engine    Injected engine module (backend/protocol-generator.js).
 * @param {Array}  allExercises  The canonical exercise library (ALL_EXERCISES).
 * @returns {object} { valid, errors, warnings, derivedFlags, protocolType, totalWeeks, weeks }
 */
function runEngine(formData, engine, allExercises) {
  const guard = verifyEngineContract(formData);
  if (!guard.ok) {
    const problems = [];
    if (guard.missing.length) {
      problems.push(`missing engine inputs: ${guard.missing.join(', ')}`);
    }
    if (guard.unexpectedFlags.length) {
      problems.push(`adapter must not pre-set derived flags: ${guard.unexpectedFlags.join(', ')}`);
    }
    throw new Error(`[engine-adapter] contract violation — ${problems.join('; ')}`);
  }

  // STEP 0 — species.
  //
  // THE PROTOCOL ENGINE HAS NO FELINE PATH. `protocol-generator.js` contains
  // zero references to species and can select none of the fifteen FELINE_*
  // exercises in the library; the engine contract lists species as
  // `{ role: "echoed", default: "canine" }`. A cat run through it is handed a
  // dog's protocol — an acceptance run on 22 Sep 2026 produced hill walking, a
  // wobble board and cavaletti rails for a domestic shorthair with lumbosacral
  // spondylosis.
  //
  // So it refuses. This is a PRODUCT GATE, not an engine rule, and it sits here
  // rather than in the route so no caller can route around it.
  //
  // The honest position is that the feline path is not built. Generating a
  // canine protocol and calling it feline would be worse than generating
  // nothing, and Source of Truth §9-11 forbids exactly that transfer.
  //
  // Remove this the day the engine can select feline exercises. Not before.
  if (isFeline(formData.species)) {
    return {
      valid: false,
      blockedReason: 'FELINE_UNSUPPORTED',
      errors: [
        'Feline protocol generation is not available yet. The protocol engine '
        + 'selects from the canine exercise set only, so generating for a cat '
        + 'would prescribe canine exercises. The feline exercises in the library '
        + 'cannot be reached by the generator.',
      ],
      warnings: [],
      derivedFlags: {},
      protocolType: null,
      totalWeeks: 0,
      weeks: [],
    };
  }

  // STEP 1 — validate. This MUTATES formData, setting the severity flags.
  const { valid, errors, warnings } = engine.validateIntake(formData);

  // Capture which gates actually fired, so the clinician review layer can show
  // the reasoning and so tests can assert the flags propagated.
  const derivedFlags = {};
  for (const flag of DERIVED_FLAGS) {
    derivedFlags[flag] = formData[flag] === true;
  }

  if (!valid) {
    return { valid: false, errors, warnings, derivedFlags, protocolType: null, totalWeeks: 0, weeks: [] };
  }

  // STEP 2 — generate, passing THE SAME object reference. Do not clone.
  const totalWeeks = parseInt(formData.protocolLength, 10) || 8;
  const weeks = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const exercises = engine.selectExercisesForWeek(w, totalWeeks, allExercises, formData);
    weeks.push({
      week: w,
      exercises,
      phaseInfo: (exercises[0] && exercises[0]._phaseInfo) || null,
    });
  }

  const protocolType = engine.getProtocolType(
    formData.diagnosis,
    formData.affectedRegion,
    formData._highPainOverride ? 'palliative' : formData.treatmentApproach
  );

  return { valid: true, errors, warnings, derivedFlags, protocolType, totalWeeks, weeks };
}

module.exports = {
  ENGINE_INPUTS,
  splitClientName,
  DERIVED_FLAGS,
  toEngineFormData,
  verifyEngineContract,
  runEngine,
};
