// ============================================================================
// EVIDENCE-BASED PROTOCOL GENERATION
// Following Dr. Millis & Levine: Canine Rehabilitation and Physical Therapy
// ============================================================================
// Uses medical-grade exercise library with clinical taxonomy for
// intelligent, evidence-based exercise selection
// ============================================================================

const { ALL_EXERCISES } = require('./all-exercises');
const { PRIMARY_INDICATIONS, REHAB_PHASES, INTERVENTION_TYPES } = require('./exercise-taxonomy');

// ============================================================================
// CONDITION CODE TO PRIMARY INDICATION MAPPING
// Maps clinical intake diagnosis codes to exercise primary_indications
// ============================================================================
const DIAGNOSIS_TO_INDICATION_MAP = {
  // Stifle (Knee) Conditions
  'CCL_CONSERV': [PRIMARY_INDICATIONS.CCL_REPAIR, PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'POST_TPLO': [PRIMARY_INDICATIONS.CCL_REPAIR],
  'POST_TTA': [PRIMARY_INDICATIONS.CCL_REPAIR],
  'POST_LATERAL': [PRIMARY_INDICATIONS.CCL_REPAIR],
  'PATELLA_LUX': [PRIMARY_INDICATIONS.PATELLAR_LUXATION],
  'POST_PATELLA': [PRIMARY_INDICATIONS.PATELLAR_LUXATION],

  // Hip Conditions
  'HIP_DYSPLASIA': [PRIMARY_INDICATIONS.HIP_DYSPLASIA, PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'POST_FHO': [PRIMARY_INDICATIONS.HIP_DYSPLASIA],
  'POST_THR': [PRIMARY_INDICATIONS.HIP_DYSPLASIA],
  'HIP_OA': [PRIMARY_INDICATIONS.HIP_DYSPLASIA, PRIMARY_INDICATIONS.OSTEOARTHRITIS],

  // Elbow & Shoulder
  'ELBOW_DYSPLASIA': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'OCD_SHOULDER': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'BICEPS_TENDON': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'SHOULDER_INSTAB': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],

  // Spine & Neuro
  'IVDD_CONSERV': [PRIMARY_INDICATIONS.IVDD],
  'IVDD_POSTOP': [PRIMARY_INDICATIONS.IVDD],
  'FCE': [PRIMARY_INDICATIONS.FCE],
  'DM': [PRIMARY_INDICATIONS.DEGENERATIVE_MYELO],
  'WOBBLER': [PRIMARY_INDICATIONS.IVDD],

  // Multi-Joint OA
  'OA_MULTI': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'GERIATRIC': [PRIMARY_INDICATIONS.GERIATRIC, PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'CHRONIC_PAIN': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],

  // Soft Tissue
  'MUSCLE_STRAIN': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'ILIOPSOAS': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'ACHILLES': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'GRACILIS': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],

  // Fractures & Trauma
  'FRACTURE': [PRIMARY_INDICATIONS.FRACTURE],
  'PELVIC_FX': [PRIMARY_INDICATIONS.FRACTURE],
  'POLYTRAUMA': [PRIMARY_INDICATIONS.FRACTURE],
  'POST_FRACTURE': [PRIMARY_INDICATIONS.FRACTURE],

  // Amputation & Special
  'FORELIMB_AMP': [PRIMARY_INDICATIONS.GERIATRIC],
  'HINDLIMB_AMP': [PRIMARY_INDICATIONS.GERIATRIC],
  'OBESITY': [PRIMARY_INDICATIONS.OBESITY, PRIMARY_INDICATIONS.GERIATRIC],

  // Newly added conditions (Block 5 / protocol-rules.js v2)
  'DEGENERATIVE_MYELOPATHY': [PRIMARY_INDICATIONS.DEGENERATIVE_MYELO],
  'DM_STAGE1': [PRIMARY_INDICATIONS.DEGENERATIVE_MYELO],
  'DM_STAGE2': [PRIMARY_INDICATIONS.DEGENERATIVE_MYELO],
  'DM_STAGE3': [PRIMARY_INDICATIONS.DEGENERATIVE_MYELO],

  'LUMBOSACRAL': [PRIMARY_INDICATIONS.IVDD, PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'CAUDA_EQUINA': [PRIMARY_INDICATIONS.IVDD],
  'LS_DISEASE': [PRIMARY_INDICATIONS.IVDD, PRIMARY_INDICATIONS.OSTEOARTHRITIS],

  'POST_THR': [PRIMARY_INDICATIONS.HIP_DYSPLASIA],
  'THR': [PRIMARY_INDICATIONS.HIP_DYSPLASIA],

  'LUXATING_PATELLA': [PRIMARY_INDICATIONS.PATELLAR_LUXATION],
  'POST_LUXATING_PATELLA': [PRIMARY_INDICATIONS.PATELLAR_LUXATION],
  'MPL': [PRIMARY_INDICATIONS.PATELLAR_LUXATION],
  'LPL': [PRIMARY_INDICATIONS.PATELLAR_LUXATION],

  'OCD_SHOULDER': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'POST_OCD_SHOULDER': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],

  'OA_GENERAL': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'OA_BILATERAL': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'DJD': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'DJD_HIP': [PRIMARY_INDICATIONS.HIP_DYSPLASIA, PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'DJD_STIFLE': [PRIMARY_INDICATIONS.CCL_REPAIR, PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'DJD_ELBOW': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'DJD_SHOULDER': [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'DJD_SPINE': [PRIMARY_INDICATIONS.IVDD, PRIMARY_INDICATIONS.OSTEOARTHRITIS],

  'FCE': [PRIMARY_INDICATIONS.FCE],
  'FIBROCARTILAGINOUS_EMBOLISM': [PRIMARY_INDICATIONS.FCE],

  // Feline conditions (species expansion)
  'FELINE_OA':              [PRIMARY_INDICATIONS.OSTEOARTHRITIS],
  'FELINE_OA_AXIAL':        [PRIMARY_INDICATIONS.OSTEOARTHRITIS, PRIMARY_INDICATIONS.IVDD],
  'FELINE_IVDD_CAT':        [PRIMARY_INDICATIONS.IVDD],
  'FELINE_FATE_RECOVERY':   [PRIMARY_INDICATIONS.FCE],
  'FELINE_HCM_SUBCLINICAL': [PRIMARY_INDICATIONS.GERIATRIC],
  'FELINE_POST_FRACTURE_CAT': [PRIMARY_INDICATIONS.FRACTURE],
  'FELINE_NEURO_CAT':       [PRIMARY_INDICATIONS.IVDD, PRIMARY_INDICATIONS.FCE]
};

// ============================================================================
// MILLIS & LEVINE 5-PHASE PROGRESSIVE REHABILITATION MODEL
// ============================================================================
// Phase progression based on post-surgical/injury timeline:
// Weeks 1-2:   ACUTE phase - Pain control, inflammation management
// Weeks 3-6:   SUBACUTE phase - ROM restoration, gentle mobilization
// Weeks 7-10:  CHRONIC phase - Strengthening, functional restoration
// Weeks 11-12: MAINTENANCE phase - Return to function, conditioning

const PHASE_DISTRIBUTION_BY_WEEK = {
  // Week 1-2: Acute Phase - Heavy on passive/pain management
  1: {
    phases: [REHAB_PHASES.ACUTE.code, REHAB_PHASES.SUBACUTE.code],
    interventionPriority: [
      INTERVENTION_TYPES.PASSIVE_MODALITY.code,
      INTERVENTION_TYPES.THERAPEUTIC_MODALITIES.code,
      INTERVENTION_TYPES.MANUAL_THERAPY.code
    ],
    exercisesCount: 3
  },
  2: {
    phases: [REHAB_PHASES.ACUTE.code, REHAB_PHASES.SUBACUTE.code],
    interventionPriority: [
      INTERVENTION_TYPES.PASSIVE_MODALITY.code,
      INTERVENTION_TYPES.MANUAL_THERAPY.code,
      INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code
    ],
    exercisesCount: 4
  },

  // Week 3-6: Subacute Phase - Introduce active assisted and gentle strengthening
  3: {
    phases: [REHAB_PHASES.SUBACUTE.code],
    interventionPriority: [
      INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code,
      INTERVENTION_TYPES.PASSIVE_MODALITY.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code
    ],
    exercisesCount: 4
  },
  4: {
    phases: [REHAB_PHASES.SUBACUTE.code],
    interventionPriority: [
      INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code,
      INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code
    ],
    exercisesCount: 5
  },
  5: {
    phases: [REHAB_PHASES.SUBACUTE.code, REHAB_PHASES.CHRONIC.code],
    interventionPriority: [
      INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code,
      INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
      INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code
    ],
    exercisesCount: 5
  },
  6: {
    phases: [REHAB_PHASES.SUBACUTE.code, REHAB_PHASES.CHRONIC.code],
    interventionPriority: [
      INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code,
      INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code
    ],
    exercisesCount: 5
  },

  // Week 7-10: Chronic Phase - Emphasis on strengthening and balance
  7: {
    phases: [REHAB_PHASES.CHRONIC.code],
    interventionPriority: [
      INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code,
      INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code
    ],
    exercisesCount: 5
  },
  8: {
    phases: [REHAB_PHASES.CHRONIC.code],
    interventionPriority: [
      INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code,
      INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code
    ],
    exercisesCount: 6
  },
  9: {
    phases: [REHAB_PHASES.CHRONIC.code, REHAB_PHASES.MAINTENANCE.code],
    interventionPriority: [
      INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
      INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code
    ],
    exercisesCount: 6
  },
  10: {
    phases: [REHAB_PHASES.CHRONIC.code, REHAB_PHASES.MAINTENANCE.code],
    interventionPriority: [
      INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code,
      INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code
    ],
    exercisesCount: 6
  },

  // Week 11-12: Maintenance Phase - Functional activities and conditioning
  11: {
    phases: [REHAB_PHASES.MAINTENANCE.code],
    interventionPriority: [
      INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code,
      INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code
    ],
    exercisesCount: 6
  },
  12: {
    phases: [REHAB_PHASES.MAINTENANCE.code],
    interventionPriority: [
      INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code,
      INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
      INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code
    ],
    exercisesCount: 6
  }
};

// ============================================================================
// INTELLIGENT EXERCISE SELECTION
// ============================================================================

function selectExercisesForWeek(weekNum, totalWeeks, allExercises, formData) {
  console.log(`\n📋 Selecting exercises for Week ${weekNum} (Total: ${totalWeeks} weeks)`);
  console.log(`   Diagnosis: ${formData.diagnosis}`);

  // Get primary indications for this diagnosis
  const primaryIndications = DIAGNOSIS_TO_INDICATION_MAP[formData.diagnosis] || [PRIMARY_INDICATIONS.OSTEOARTHRITIS];
  console.log(`   Primary Indications: ${primaryIndications.join(', ')}`);

  // Get week configuration
  const weekConfig = PHASE_DISTRIBUTION_BY_WEEK[weekNum] || PHASE_DISTRIBUTION_BY_WEEK[12];
  console.log(`   Rehab Phases: ${weekConfig.phases.join(', ')}`);
  console.log(`   Target exercises: ${weekConfig.exercisesCount}`);

  // Filter exercises by indication and phase
  let candidateExercises = ALL_EXERCISES.filter(ex => {
    // Must have clinical classification
    if (!ex.clinical_classification) return false;

    // Must match at least one primary indication
    const matchesIndication = ex.clinical_classification.primary_indications &&
      ex.clinical_classification.primary_indications.some(ind => primaryIndications.includes(ind));

    // Must match at least one target rehab phase
    const matchesPhase = ex.clinical_classification.rehab_phases &&
      ex.clinical_classification.rehab_phases.some(phase => weekConfig.phases.includes(phase));

    return matchesIndication && matchesPhase;
  });

  console.log(`   ✓ Found ${candidateExercises.length} candidate exercises matching indication & phase`);

  // If not enough candidates, broaden to just phase-appropriate exercises
  if (candidateExercises.length < weekConfig.exercisesCount) {
    console.log(`   ⚠️  Insufficient candidates, broadening to phase-appropriate exercises`);
    candidateExercises = ALL_EXERCISES.filter(ex =>
      ex.clinical_classification &&
      ex.clinical_classification.rehab_phases &&
      ex.clinical_classification.rehab_phases.some(phase => weekConfig.phases.includes(phase))
    );
  }

  // Sort by evidence grade (A > B > C > EO) and intervention priority
  candidateExercises.sort((a, b) => {
    // Evidence grade priority
    const gradeValue = { 'A': 4, 'B': 3, 'C': 2, 'EO': 1 };
    const gradeA = gradeValue[a.evidence_base?.grade] || 0;
    const gradeB = gradeValue[b.evidence_base?.grade] || 0;
    if (gradeA !== gradeB) return gradeB - gradeA;

    // Intervention type priority
    const interventionA = weekConfig.interventionPriority.indexOf(a.clinical_classification?.intervention_type) || 999;
    const interventionB = weekConfig.interventionPriority.indexOf(b.clinical_classification?.intervention_type) || 999;
    return interventionA - interventionB;
  });

  // Select diverse exercises from different intervention types
  const selectedExercises = [];
  const usedInterventions = new Set();

  // First pass: select one from each priority intervention type
  for (const interventionType of weekConfig.interventionPriority) {
    const exercise = candidateExercises.find(ex =>
      ex.clinical_classification?.intervention_type === interventionType &&
      !selectedExercises.includes(ex)
    );
    if (exercise) {
      selectedExercises.push(exercise);
      usedInterventions.add(interventionType);
    }
    if (selectedExercises.length >= weekConfig.exercisesCount) break;
  }

  // Second pass: fill remaining slots with highest evidence grade exercises
  for (const exercise of candidateExercises) {
    if (selectedExercises.length >= weekConfig.exercisesCount) break;
    if (!selectedExercises.includes(exercise)) {
      selectedExercises.push(exercise);
    }
  }

  console.log(`   ✅ Selected ${selectedExercises.length} exercises:`);
  selectedExercises.forEach((ex, idx) => {
    console.log(`      ${idx + 1}. ${ex.name} (${ex.clinical_classification?.intervention_type}, Grade ${ex.evidence_base?.grade})`);
  });

  // Map to protocol format with progressive dosage
  return selectedExercises.map(ex => {
    const dosage = calculateProgressiveDosage(ex, weekNum, totalWeeks);

    return {
      code: ex.code,
      name: ex.name,
      category: ex.category,
      description: ex.description,
      sets: dosage.sets,
      reps: dosage.reps,
      frequency: dosage.frequency,
      duration_minutes: dosage.duration,

      // Include all enhanced metadata
      equipment: ex.equipment,
      setup: ex.setup,
      steps: ex.steps,
      good_form: ex.good_form,
      common_mistakes: ex.common_mistakes,
      red_flags: ex.red_flags,
      progression: ex.progression,
      contraindications: ex.contraindications,
      difficulty_level: ex.difficulty_level,

      // Clinical metadata
      clinical_classification: ex.clinical_classification,
      evidence_base: ex.evidence_base,
      billing_codes: ex.billing_codes,
      safety: ex.safety,
      special_populations: ex.special_populations
    };
  });
}

// ============================================================================
// PROGRESSIVE DOSAGE CALCULATION
// Based on Millis & Levine progressive loading principles
// ============================================================================

function calculateProgressiveDosage(exercise, weekNum, totalWeeks) {
  const interventionType = exercise.clinical_classification?.intervention_type;
  const baselineDosage = exercise.clinical_parameters?.dosage || {};

  // Progressive multiplier (1.0 early weeks, up to 1.5 late weeks)
  const progressMultiplier = 1.0 + (weekNum / totalWeeks) * 0.5;

  // Dosage by intervention type
  let sets, reps, frequency, duration;

  switch (interventionType) {
    case INTERVENTION_TYPES.PASSIVE_MODALITY.code:
      sets = 2 + Math.floor(weekNum / 4); // 2-4 sets
      reps = 10 + Math.floor(weekNum / 2); // 10-16 reps
      frequency = weekNum < 3 ? '2-3x daily' : '1-2x daily';
      duration = 10;
      break;

    case INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code:
      sets = 2 + Math.floor(weekNum / 3); // 2-5 sets
      reps = Math.ceil((8 + weekNum) * progressMultiplier); // Progressive
      frequency = weekNum < 4 ? '2x daily' : '1x daily';
      duration = 15;
      break;

    case INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code:
      sets = 3 + Math.floor(weekNum / 4); // 3-5 sets
      reps = Math.ceil((6 + weekNum * 0.5) * progressMultiplier); // 6-12 reps
      frequency = '3-5x weekly';
      duration = 20;
      break;

    case INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code:
      sets = 2 + Math.floor(weekNum / 3); // 2-5 sets
      reps = Math.ceil((5 + weekNum * 0.7) * progressMultiplier); // 5-15 reps
      frequency = 'Daily';
      duration = 15;
      break;

    case INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code:
      sets = 1;
      reps = Math.ceil((10 + weekNum) * progressMultiplier); // 10-25 minutes
      frequency = '2-3x weekly';
      duration = 20 + weekNum; // 20-32 minutes
      break;

    case INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code:
      sets = 2 + Math.floor(weekNum / 4);
      reps = Math.ceil((8 + weekNum) * progressMultiplier);
      frequency = '3-5x weekly';
      duration = 15;
      break;

    case INTERVENTION_TYPES.MANUAL_THERAPY.code:
    case INTERVENTION_TYPES.THERAPEUTIC_MODALITIES.code:
      sets = 1;
      reps = 1; // Sessions
      frequency = weekNum < 3 ? '2-3x weekly' : '1-2x weekly';
      duration = 15;
      break;

    default:
      // Use base dosage from exercise metadata if available
      sets = parseInt(baselineDosage.sets) || 3;
      reps = parseInt(baselineDosage.repetitions) || 10;
      frequency = baselineDosage.frequency || 'Daily';
      duration = 15;
  }

  return {
    sets: Math.min(sets, 5), // Cap at 5 sets
    reps: Math.min(reps, 25), // Cap at 25 reps
    frequency,
    duration: Math.min(duration, 30) // Cap at 30 minutes
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  selectExercisesForWeek
};
