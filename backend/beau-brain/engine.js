// ============================================================================
// BEAU'S BRAIN — Engine
// © 2026 Salvatore Bonanno. All rights reserved.
//
// Produces ONE grounded "BrainPlan" from the verified source of truth, then
// hands it to the voice layer. ZERO HALLUCINATION: every exercise, dose,
// citation, contraindication and red flag comes from protocol-generator.js +
// all-exercises.js. The engine never invents clinical content — if a code is
// not in the exercise database it is dropped by the generator, never fabricated.
//
// Deterministic: same intake → same plan. No LLM in the generation path.
// ============================================================================

const {
  selectExercisesForWeek,
  getProtocolType,
  getPhaseForWeek,
  validateIntake,
  PROTOCOL_DEFINITIONS,
} = require("../protocol-generator");
const { ALL_EXERCISES } = require("../all-exercises");
const { DOCTRINE_TEXT, EVIDENCE_ANCHORS } = require("./doctrine");

// Default week-count per protocol when the caller doesn't specify one.
const DEFAULT_WEEKS = {
  tplo: 16, ivdd: 12, oa: 16, geriatric: 16,
};

// Build the formData shape the deterministic generator expects from a friendlier
// intake. Passes clinic-equipment + clinical-flag fields straight through.
function toFormData(intake) {
  return {
    patientName: intake.patientName || intake.patient_name || "Patient",
    clientFirstName: intake.clientFirstName || "Client",
    clientLastName: intake.clientLastName || "",
    diagnosis: intake.diagnosis || "",
    affectedRegion: intake.affectedRegion || intake.affected_region || "",
    treatmentApproach: intake.treatmentApproach || intake.treatment_approach || "Conservative",
    // clinical grading / flags (optional — drive safety locks)
    painScore: intake.painScore, painLevel: intake.painLevel,
    mmtGrade: intake.mmtGrade, ivddGrade: intake.ivddGrade, oaStage: intake.oaStage,
    lamenessGrade: intake.lamenessGrade,
    weightBearingStatus: intake.weightBearingStatus,
    incisionStatus: intake.incisionStatus,
    crateRestRequired: intake.crateRestRequired,
    eCollarRequired: intake.eCollarRequired,
    neuroDeepPain: intake.neuroDeepPain,
    medicalHistory: intake.medicalHistory,
    surgeryDate: intake.surgeryDate,
    // clinic equipment gates (so modality/aquatic exercises appear when available)
    aquaticAccess: intake.aquaticAccess, modalityUWTM: intake.modalityUWTM,
    modalityLaser: intake.modalityLaser, modalityTENS: intake.modalityTENS,
    modalityNMES: intake.modalityNMES, modalityTherapeuticUS: intake.modalityTherapeuticUS,
    modalityPulsedEMF: intake.modalityPulsedEMF, modalityShockwave: intake.modalityShockwave,
    modalityCryotherapy: intake.modalityCryotherapy, modalityHeatTherapy: intake.modalityHeatTherapy,
  };
}

// Resolve the phase actually used (the generator may phase-lock or fall back on
// safety flags; that truth is stamped onto exercises[0]._phaseInfo). Fall back to
// the timeline phase when no exercises landed.
function resolvePhase(exercises, protocolType, week, totalWeeks) {
  const info = exercises[0]?._phaseInfo;
  if (info) {
    return {
      number: info.number,
      name: info.name,
      goal: info.goal,
      contraindications: info.contraindications,
      progressionCriteria: info.progressionCriteria,
      weekRange: PROTOCOL_DEFINITIONS[protocolType]?.phases?.[info.number - 1]?.weekRange || null,
    };
  }
  const idx = getPhaseForWeek(week, totalWeeks, protocolType);
  const p = PROTOCOL_DEFINITIONS[protocolType]?.phases?.[idx];
  return p
    ? { number: p.number, name: p.name, goal: p.goal, contraindications: p.contraindications, progressionCriteria: p.progressionCriteria, weekRange: p.weekRange }
    : null;
}

/**
 * generateProtocolPlan(intake) → grounded BrainPlan (voice-agnostic).
 * intake: { patientName, species, diagnosis, affectedRegion, treatmentApproach,
 *           week, totalWeeks, ...clinical flags, ...clinic equipment flags }
 */
function generateProtocolPlan(intake = {}) {
  const formData = toFormData(intake);

  // Gate 1 — intake validation surfaces red flags / clinical warnings and sets
  // the safety-lock flags on formData (high pain, IVDD grade IV/V, MMT 0-1, etc.).
  const validation = validateIntake(formData);

  const species = (intake.species || "Canine");
  const protocolType = getProtocolType(formData.diagnosis, formData.affectedRegion, formData.treatmentApproach);
  const totalWeeks = Number(intake.totalWeeks) || DEFAULT_WEEKS[protocolType] || 16;
  const week = Number.isFinite(Number(intake.week)) ? Number(intake.week) : 1;

  // Gate 2 — deterministic, contraindication-filtered, evidence-cited selection
  // straight from the verified protocol + exercise database.
  const selected = selectExercisesForWeek(week, totalWeeks, ALL_EXERCISES, formData);

  const phase = resolvePhase(selected, protocolType, week, totalWeeks);

  // Strip the internal _phaseInfo marker; keep the grounded clinical fields.
  const exercises = selected.map((e) => {
    const { _phaseInfo, ...rest } = e;
    return rest;
  });

  // Aggregate the safety surface (both voices must show this).
  const perExerciseRedFlags = [];
  for (const e of exercises) {
    const flags = Array.isArray(e.red_flags) ? e.red_flags : (e.red_flags ? [e.red_flags] : []);
    for (const f of flags) if (f && !perExerciseRedFlags.includes(f)) perExerciseRedFlags.push(f);
  }

  return {
    meta: {
      patientName: formData.patientName,
      species,
      condition: formData.diagnosis || "General Conditioning",
      protocolType,
      protocolName: PROTOCOL_DEFINITIONS[protocolType]?.name || protocolType,
      week,
      totalWeeks,
      generated_deterministically: true,
    },
    phase,
    exercises,
    safety: {
      intakeWarnings: validation.warnings || [],
      intakeBlocking: validation.errors || [],
      phaseContraindications: phase?.contraindications || null,
      perExerciseRedFlags,
    },
    evidence_anchors: EVIDENCE_ANCHORS,
    doctrine_text: DOCTRINE_TEXT,
    audit: {
      source_files: ["protocol-generator.js", "all-exercises.js"],
      exercise_count: exercises.length,
      deterministic: true,
      zero_hallucination: true,
    },
  };
}

module.exports = { generateProtocolPlan, DEFAULT_WEEKS };
