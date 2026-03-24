// ============================================================================
// EXERCISE ENHANCER - MIGRATION UTILITY
// K9-REHAB-PRO - Systematically add medical-grade metadata to existing exercises
// ============================================================================

const {
  INTERVENTION_TYPES,
  REHAB_PHASES,
  BODY_SYSTEMS,
  EVIDENCE_GRADES,
  CERTIFICATION_LEVELS,
  PRIMARY_INDICATIONS
} = require('./exercise-taxonomy');

const { EXERCISE_EVIDENCE_MAP, CORE_REFERENCES } = require('./evidence-references');

const { getVideosByExerciseCode } = require('./video-references');
const { getStoryboardByCode, getOrGenerateStoryboard } = require('./storyboard-references');

// ============================================================================
// CATEGORY TO INTERVENTION TYPE MAPPING
// ============================================================================
const CATEGORY_TO_INTERVENTION = {
  'Passive Therapy': INTERVENTION_TYPES.PASSIVE_MODALITY.code,
  'Active Assisted': INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code,
  'Strengthening': INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code,
  'Balance & Proprioception': INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code,
  'Aquatic Therapy': INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code,
  'Hydrotherapy': INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code,
  'Manual Therapy': INTERVENTION_TYPES.MANUAL_THERAPY.code,
  'Therapeutic Modalities': INTERVENTION_TYPES.THERAPEUTIC_MODALITIES.code,
  'Functional Training': INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code,
  'Sport Conditioning': INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code,
  'Canine Strength (Zink)': INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code,

  // Population-specific get mapped by content
  'Geriatric Care': null,  // Will auto-assign based on exercise type
  'Neurological Rehab': null,
  'Post-Surgical': null,
  'Pediatric Rehabilitation': null,
  'Palliative Care': INTERVENTION_TYPES.PASSIVE_MODALITY.code,
  'Complementary Therapy': INTERVENTION_TYPES.MANUAL_THERAPY.code,
  'Breed-Specific': null
};

// ============================================================================
// DIFFICULTY TO CERTIFICATION MAPPING
// ============================================================================
const DIFFICULTY_TO_CERT = {
  'Easy': CERTIFICATION_LEVELS.BASIC.code,
  'Moderate': CERTIFICATION_LEVELS.ADVANCED.code,
  'Advanced': CERTIFICATION_LEVELS.SPECIALIST.code
};

// ============================================================================
// INTERVENTION TYPE TO CPT CODE
// ============================================================================
const INTERVENTION_TO_CPT = {
  [INTERVENTION_TYPES.PASSIVE_MODALITY.code]: '97140',
  [INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code]: '97110',
  [INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code]: '97110',
  [INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code]: '97112',
  [INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code]: '97530',
  [INTERVENTION_TYPES.MANUAL_THERAPY.code]: '97140',
  [INTERVENTION_TYPES.THERAPEUTIC_MODALITIES.code]: '97032',
  [INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code]: '97530'
};

// ============================================================================
// ENHANCE SINGLE EXERCISE
// ============================================================================
function enhanceExercise(exercise) {
  // Start with existing exercise data
  const enhanced = { ...exercise };

  // Determine intervention type
  const interventionType = CATEGORY_TO_INTERVENTION[exercise.category] ||
    inferInterventionType(exercise);

  // Build clinical classification
  enhanced.clinical_classification = {
    intervention_type: interventionType,
    intervention_subcategory: exercise.category,
    rehab_phases: inferRehabPhases(exercise),
    body_systems: inferBodySystems(exercise),
    primary_indications: inferPrimaryIndications(exercise),
    secondary_indications: []
  };

  // Build evidence base
  enhanced.evidence_base = {
    grade: inferEvidenceGrade(exercise),
    references: getReferences(exercise.code),
    key_findings: getKeyFindings(exercise),
    certification_required: DIFFICULTY_TO_CERT[exercise.difficulty_level] || CERTIFICATION_LEVELS.BASIC.code
  };

  // 3-tier evidence classification (additive — does not replace grade)
  enhanced.evidence_tier = mapGradeToTier(enhanced.evidence_base.grade);

  // Clinical tag set (inferred from exercise content)
  enhanced.clinical_tags = inferClinicalTags(exercise);

  // Build clinical parameters
  enhanced.clinical_parameters = {
    dosage: inferDosage(exercise),
    post_surgical_timing: inferPostSurgicalTiming(exercise),
    contraindications_absolute: parseContraindications(exercise.contraindications, 'absolute'),
    contraindications_relative: parseContraindications(exercise.contraindications, 'relative'),
    precautions: inferPrecautions(exercise),
    monitoring_requirements: inferMonitoring(exercise),
    expected_outcomes: {
      short_term: 'Improvement in targeted function within 1-2 weeks',
      long_term: 'Significant functional gains within 4-6 weeks',
      functional: 'Enhanced mobility and quality of life'
    }
  };

  // Build billing codes
  enhanced.billing_codes = {
    cpt_code: INTERVENTION_TO_CPT[interventionType] || '97110',
    description: getCPTDescription(interventionType),
    time_units: 1,
    icd10_codes: inferICD10Codes(exercise),
    documentation_requirements: [
      'Initial assessment and measurements',
      'Treatment time and technique',
      'Patient response and tolerance',
      'Progress toward goals'
    ]
  };

  // Build safety classification
  enhanced.safety = {
    risk_level: inferRiskLevel(exercise),
    supervision_required: inferSupervisionRequirement(exercise),
    patient_positioning: exercise.setup || 'As clinically appropriate',
    handler_safety: 'Monitor patient response; use appropriate restraint if needed',
    adverse_events: {
      common: ['Temporary soreness', 'Mild fatigue'],
      uncommon: ['Pain exacerbation', 'Increased inflammation'],
      rare: ['Injury if performed incorrectly']
    }
  };

  // Build special populations
  enhanced.special_populations = {
    geriatric: inferGeriatricGuidance(exercise),
    pediatric: inferPediatricGuidance(exercise),
    neurological: inferNeuroGuidance(exercise),
    giant_breed: {
      applicable: true,
      modifications: 'May require additional handler support',
      precautions: 'Consider joint stress with heavy body weight'
    },
    toy_breed: {
      applicable: true,
      modifications: 'Gentler handling, scaled equipment',
      precautions: 'Patellar luxation considerations'
    }
  };

  // Build multimodal integration
  enhanced.multimodal_integration = {
    combines_well_with: inferComplementaryTherapies(exercise),
    contraindicated_combinations: [],
    recommended_sequence: []
  };

  // Build client education
  const videoMetadata = getVideosByExerciseCode(exercise.code);
  enhanced.client_education = {
    home_program_suitable: inferHomeProgramSuitability(exercise),
    teaching_time: '15-20 minutes',
    video_available: videoMetadata !== null && videoMetadata.angles && videoMetadata.angles.length > 0,
    video_metadata: videoMetadata, // Full video metadata including angles, annotations, transcripts
    storyboard_available: !!getOrGenerateStoryboard(exercise.code, exercise),
    storyboard_metadata: (() => {
      const sb = getOrGenerateStoryboard(exercise.code, exercise);
      if (!sb) return null;
      return {
        frame_count: sb.frames.length,
        has_client_script: !!sb.client_script,
        has_clinician_script: !!sb.clinician_script,
        version: sb.version,
        auto_generated: !!sb.auto_generated,
      };
    })(),
    handout_available: false,
    key_teaching_points: [
      'Always warm up before starting',
      'Stop if patient shows signs of pain or distress',
      'Maintain consistent technique',
      'Contact veterinarian if concerns arise'
    ],
    common_client_questions: []
  };

  return enhanced;
}

// ============================================================================
// INFERENCE FUNCTIONS
// ============================================================================

function inferInterventionType(exercise) {
  const name = exercise.name.toLowerCase();
  const description = (exercise.description || '').toLowerCase();
  const combined = name + ' ' + description;

  if (combined.includes('massage') || combined.includes('manual')) return INTERVENTION_TYPES.MANUAL_THERAPY.code;
  if (combined.includes('water') || combined.includes('swim') || combined.includes('underwater')) return INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code;
  if (combined.includes('balance') || combined.includes('proprioception')) return INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code;
  if (combined.includes('strengthen') || combined.includes('resistance')) return INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code;
  if (combined.includes('prom') || combined.includes('passive range')) return INTERVENTION_TYPES.PASSIVE_MODALITY.code;
  if (combined.includes('laser') || combined.includes('tens') || combined.includes('ultrasound')) return INTERVENTION_TYPES.THERAPEUTIC_MODALITIES.code;

  return INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code;  // Default
}

function inferRehabPhases(exercise) {
  const phases = [];
  const category = exercise.category.toLowerCase();
  const difficulty = exercise.difficulty_level.toLowerCase();

  // Passive therapies good for acute/subacute
  if (category.includes('passive') || category.includes('manual') || category.includes('modalities')) {
    phases.push(REHAB_PHASES.ACUTE.code, REHAB_PHASES.SUBACUTE.code);
  }

  // Active assisted good for subacute/chronic
  if (category.includes('active assisted') || category.includes('aquatic')) {
    phases.push(REHAB_PHASES.SUBACUTE.code, REHAB_PHASES.CHRONIC.code);
  }

  // Strengthening and functional for chronic/maintenance
  if (category.includes('strengthening') || category.includes('functional') || category.includes('sport')) {
    phases.push(REHAB_PHASES.CHRONIC.code, REHAB_PHASES.MAINTENANCE.code);
  }

  // Balance/proprioception spans subacute through maintenance
  if (category.includes('balance') || category.includes('proprioception')) {
    phases.push(REHAB_PHASES.SUBACUTE.code, REHAB_PHASES.CHRONIC.code, REHAB_PHASES.MAINTENANCE.code);
  }

  // Geriatric/palliative primarily maintenance
  if (category.includes('geriatric') || category.includes('palliative')) {
    phases.push(REHAB_PHASES.MAINTENANCE.code);
  }

  // Post-surgical typically starts subacute
  if (category.includes('post-surgical')) {
    phases.push(REHAB_PHASES.SUBACUTE.code, REHAB_PHASES.CHRONIC.code);
  }

  return phases.length > 0 ? phases : [REHAB_PHASES.CHRONIC.code];
}

function inferBodySystems(exercise) {
  const systems = [BODY_SYSTEMS.MUSCULOSKELETAL.code];  // Most exercises are MSK

  if (exercise.category.toLowerCase().includes('neurological')) {
    systems.push(BODY_SYSTEMS.NEUROLOGICAL.code);
  }

  if (exercise.category.toLowerCase().includes('cardiovascular') ||
      exercise.name.toLowerCase().includes('endurance')) {
    systems.push(BODY_SYSTEMS.CARDIOVASCULAR.code);
  }

  return systems;
}

function inferPrimaryIndications(exercise) {
  const indications = [];
  const text = (exercise.name + ' ' + exercise.description + ' ' + exercise.category).toLowerCase();

  if (text.includes('ccl') || text.includes('cruciate') || text.includes('stifle surgery')) {
    indications.push(PRIMARY_INDICATIONS.CCL_REPAIR);
  }
  if (text.includes('hip') || text.includes('thr') || text.includes('hip dysplasia')) {
    indications.push(PRIMARY_INDICATIONS.HIP_DYSPLASIA);
  }
  if (text.includes('patellar luxation') || text.includes('patella')) {
    indications.push(PRIMARY_INDICATIONS.PATELLAR_LUXATION);
  }
  if (text.includes('fracture')) {
    indications.push(PRIMARY_INDICATIONS.FRACTURE);
  }
  if (text.includes('osteoarthritis') || text.includes(' oa ') || text.includes('arthritis')) {
    indications.push(PRIMARY_INDICATIONS.OSTEOARTHRITIS);
  }
  if (text.includes('ivdd') || text.includes('disc disease') || text.includes('intervertebral')) {
    indications.push(PRIMARY_INDICATIONS.IVDD);
  }
  if (text.includes('fce') || text.includes('embolism')) {
    indications.push(PRIMARY_INDICATIONS.FCE);
  }
  if (text.includes('degenerative myelopathy') || text.includes('dm')) {
    indications.push(PRIMARY_INDICATIONS.DEGENERATIVE_MYELO);
  }
  if (text.includes('geriatric') || text.includes('senior')) {
    indications.push(PRIMARY_INDICATIONS.GERIATRIC);
  }
  if (text.includes('sport') || text.includes('agility') || text.includes('conditioning')) {
    indications.push(PRIMARY_INDICATIONS.SPORT);
  }
  if (text.includes('obesity') || text.includes('weight')) {
    indications.push(PRIMARY_INDICATIONS.OBESITY);
  }
  if (text.includes('palliative') || text.includes('end of life')) {
    indications.push(PRIMARY_INDICATIONS.PALLIATIVE);
  }

  return indications.length > 0 ? indications : [PRIMARY_INDICATIONS.OSTEOARTHRITIS];  // Default
}

function inferEvidenceGrade(exercise) {
  // ========================================================================
  // Reference-derived evidence grading (v2 — category-aware)
  // Algorithm: exercise → references → individual grades → composite grade
  //            with category-based modulation for textbook-only exercises
  //
  // Grade A: Has ≥1 A-grade journal article (RCT, systematic review,
  //          kinematic study) that directly studies this intervention
  // Grade B: Has B-grade journal evidence, OR textbook-only support in
  //          core rehabilitation categories (well-established modalities)
  // Grade C: Only C-grade journals, OR textbook-only references in
  //          specialized/limited-evidence categories (sport conditioning,
  //          complementary therapy, breed-specific, palliative, pediatric)
  // Expert Opinion: No mapped references at all — category-based fallback
  // ========================================================================

  const refKeys = EXERCISE_EVIDENCE_MAP[exercise.code];

  // No mapped references — fall back to category-based inference
  if (!refKeys || refKeys.length === 0) {
    return inferGradeByCategory(exercise.category);
  }

  // Resolve reference objects and count grade types
  let hasJournalA = false;   // Journal/review/meta-analysis graded A
  let hasJournalB = false;   // Journal graded B
  let hasJournalC = false;   // Journal graded C
  let hasTextbookA = false;  // Gold-standard textbook (A-grade)
  let hasTextbookB = false;  // Other textbook (B-grade)
  let hasAnyJournal = false; // Any journal/review at all
  let refCount = 0;

  for (const key of refKeys) {
    const ref = CORE_REFERENCES[key];
    if (!ref) continue;
    refCount++;

    const isJournal = ref.type === 'Journal' || ref.type === 'Review' || ref.type === 'Meta-Analysis';
    const isTextbook = ref.type === 'Textbook';

    if (isJournal) {
      hasAnyJournal = true;
      if (ref.evidence_grade === 'A') hasJournalA = true;
      else if (ref.evidence_grade === 'B') hasJournalB = true;
      else if (ref.evidence_grade === 'C') hasJournalC = true;
    } else if (isTextbook) {
      if (ref.evidence_grade === 'A') hasTextbookA = true;
      else hasTextbookB = true;
    }
  }

  // No valid references resolved
  if (refCount === 0) {
    return inferGradeByCategory(exercise.category);
  }

  // Categories where textbook-only citations yield limited evidence (Grade C)
  // Rationale: textbook mention ≠ primary evidence for specialized areas
  const LIMITED_EVIDENCE_CATEGORIES = [
    'Sport Conditioning', 'Breed-Specific', 'Complementary Therapy',
    'Geriatric Care', 'Palliative Care', 'Pediatric Rehabilitation'
  ];

  // Grade A: At least one A-rated journal article (RCT, systematic review)
  if (hasJournalA) {
    return EVIDENCE_GRADES.GRADE_A.code;
  }

  // Grade B: Has B-rated journal evidence
  if (hasJournalB) {
    return EVIDENCE_GRADES.GRADE_B.code;
  }

  // Textbook-only exercises: modulate by category
  if (!hasAnyJournal) {
    // Limited-evidence categories with only textbook mentions → Grade C
    if (LIMITED_EVIDENCE_CATEGORIES.includes(exercise.category)) {
      return EVIDENCE_GRADES.GRADE_C.code;
    }
    // Core rehabilitation categories with gold-standard textbook → Grade B
    return EVIDENCE_GRADES.GRADE_B.code;
  }

  // Has journal C evidence only (no A or B journals)
  if (hasJournalC) {
    return EVIDENCE_GRADES.GRADE_C.code;
  }

  // Fallback: has references but couldn't classify
  return EVIDENCE_GRADES.GRADE_B.code;
}

// Category-based fallback for exercises without mapped references
function inferGradeByCategory(category) {
  // Core rehabilitation categories — strong textbook support at minimum
  if (category === 'Passive Therapy' ||
      category === 'Active Assisted' ||
      category === 'Strengthening' ||
      category === 'Aquatic Therapy' ||
      category === 'Hydrotherapy' ||
      category === 'Balance & Proprioception' ||
      category === 'Manual Therapy' ||
      category === 'Therapeutic Modalities' ||
      category === 'Canine Strength (Zink)') {
    return EVIDENCE_GRADES.GRADE_B.code;
  }

  // Specialized categories — limited primary evidence
  if (category === 'Sport Conditioning' ||
      category === 'Breed-Specific' ||
      category === 'Complementary Therapy') {
    return EVIDENCE_GRADES.GRADE_C.code;
  }

  // Population-specific — expert consensus
  if (category === 'Geriatric Care' ||
      category === 'Palliative Care' ||
      category === 'Pediatric Rehabilitation') {
    return EVIDENCE_GRADES.EXPERT_OPINION.code;
  }

  return EVIDENCE_GRADES.GRADE_B.code;
}

function getReferences(exerciseCode) {
  const refIds = EXERCISE_EVIDENCE_MAP[exerciseCode] || [];
  return refIds.map(id => CORE_REFERENCES[id]).filter(Boolean);
}

function getKeyFindings(exercise) {
  const refs = getReferences(exercise.code);
  if (refs.length > 0 && refs[0].key_findings) {
    return refs[0].key_findings;
  }
  return 'Evidence-based intervention following Millis & Levine rehabilitation protocols';
}

function inferDosage(exercise) {
  const category = exercise.category.toLowerCase();

  // Check if steps mention reps
  const stepsText = (exercise.steps || []).join(' ').toLowerCase();
  const repsMatch = stepsText.match(/(\d+)-?(\d+)?\s*(repetitions|reps)/i);
  const setsMatch = stepsText.match(/(\d+)-?(\d+)?\s*sets?/i);

  if (category.includes('passive') || category.includes('stretching')) {
    return {
      sets: setsMatch ? setsMatch[1] + (setsMatch[2] ? '-' + setsMatch[2] : '') : '2-3',
      repetitions: repsMatch ? repsMatch[1] + (repsMatch[2] ? '-' + repsMatch[2] : '') : '10-15',
      hold_time: '10-30 seconds',
      frequency: '2-3x daily',
      duration: '10-15 minutes per session'
    };
  }

  if (category.includes('strengthening')) {
    return {
      sets: '3-4',
      repetitions: '8-12',
      hold_time: 'N/A',
      frequency: '3-5x weekly',
      duration: '15-20 minutes per session'
    };
  }

  if (category.includes('balance') || category.includes('proprioception')) {
    return {
      sets: '2-3',
      repetitions: '5-10',
      hold_time: '10-30 seconds',
      frequency: 'Daily',
      duration: '10-15 minutes per session'
    };
  }

  // Default
  return {
    sets: '2-3',
    repetitions: '10-15',
    hold_time: 'As tolerated',
    frequency: 'Daily to 3x weekly',
    duration: '10-20 minutes per session'
  };
}

function inferPostSurgicalTiming(exercise) {
  const category = exercise.category.toLowerCase();

  if (category.includes('passive')) {
    return {
      earliest_start: '24-48 hours',
      optimal_start: '3-5 days',
      phase: 'Acute-Subacute'
    };
  }

  if (category.includes('active assisted')) {
    return {
      earliest_start: '5-7 days',
      optimal_start: '1-2 weeks',
      phase: 'Subacute'
    };
  }

  if (category.includes('strengthening')) {
    return {
      earliest_start: '2-3 weeks',
      optimal_start: '3-4 weeks',
      phase: 'Chronic'
    };
  }

  return {
    earliest_start: '1-2 weeks',
    optimal_start: '2-4 weeks',
    phase: 'Subacute-Chronic'
  };
}

function parseContraindications(contraindicationsText, type) {
  if (!contraindicationsText) return [];

  const text = contraindicationsText.toLowerCase();
  const absolute = [];
  const relative = [];

  // Absolute contraindications
  if (text.includes('acute fracture')) absolute.push('Acute non-stabilized fracture');
  if (text.includes('unstable joint')) absolute.push('Unstable joint requiring surgical stabilization');
  if (text.includes('infection')) absolute.push('Acute septic arthritis or osteomyelitis');
  if (text.includes('malignancy')) absolute.push('Malignancy at or near treatment site');

  // Relative contraindications
  if (text.includes('severe pain')) relative.push('Severe pain (>7/10 on pain scale)');
  if (text.includes('inflammation')) relative.push('Acute inflammatory flare-up');
  if (text.includes('osteoarthritis')) relative.push('Advanced osteoarthritis with significant crepitus');

  return type === 'absolute' ? absolute : relative;
}

function inferPrecautions(exercise) {
  const precautions = ['Monitor pain response continuously', 'Stop if patient shows distress'];

  if (exercise.red_flags && exercise.red_flags.length > 0) {
    precautions.push('Watch for: ' + exercise.red_flags.slice(0, 2).join(', '));
  }

  return precautions;
}

function inferMonitoring(exercise) {
  const monitoring = ['Pain assessment (pre/post session)', 'Patient tolerance and compliance'];

  if (exercise.category.toLowerCase().includes('rom') || exercise.name.toLowerCase().includes('range')) {
    monitoring.push('ROM measurements (goniometry)');
  }

  if (exercise.category.toLowerCase().includes('strengthening')) {
    monitoring.push('Muscle girth measurements');
  }

  if (exercise.category.toLowerCase().includes('gait') || exercise.name.toLowerCase().includes('walk')) {
    monitoring.push('Gait analysis', 'Lameness scoring');
  }

  return monitoring;
}

function getCPTDescription(interventionType) {
  const descriptions = {
    [INTERVENTION_TYPES.PASSIVE_MODALITY.code]: 'Manual therapy techniques, 1 or more regions',
    [INTERVENTION_TYPES.ACTIVE_THERAPEUTIC.code]: 'Therapeutic exercise to develop strength, endurance, ROM',
    [INTERVENTION_TYPES.STRENGTHENING_RESISTANCE.code]: 'Therapeutic exercise to develop strength, endurance, ROM',
    [INTERVENTION_TYPES.NEUROMUSCULAR_RETRAINING.code]: 'Neuromuscular re-education of movement, balance, coordination',
    [INTERVENTION_TYPES.AQUATIC_HYDROTHERAPY.code]: 'Therapeutic activities for functional performance',
    [INTERVENTION_TYPES.MANUAL_THERAPY.code]: 'Manual therapy techniques, 1 or more regions',
    [INTERVENTION_TYPES.THERAPEUTIC_MODALITIES.code]: 'Application of physical agent modality',
    [INTERVENTION_TYPES.FUNCTIONAL_REHABILITATION.code]: 'Therapeutic activities for functional performance'
  };

  return descriptions[interventionType] || 'Physical therapy intervention';
}

function inferICD10Codes(exercise) {
  const codes = [];
  const indications = inferPrimaryIndications(exercise);

  if (indications.includes(PRIMARY_INDICATIONS.CCL_REPAIR)) {
    codes.push('M23.619 - Other spontaneous disruption of ligament(s) of knee');
  }
  if (indications.includes(PRIMARY_INDICATIONS.HIP_DYSPLASIA)) {
    codes.push('M24.859 - Other specific joint derangements of hip');
  }
  if (indications.includes(PRIMARY_INDICATIONS.OSTEOARTHRITIS)) {
    codes.push('M19.90 - Unspecified osteoarthritis, unspecified site');
  }
  if (indications.includes(PRIMARY_INDICATIONS.IVDD)) {
    codes.push('M51.36 - Other intervertebral disc degeneration');
  }

  if (codes.length === 0) {
    codes.push('M25.50 - Pain in unspecified joint');
  }

  return codes;
}

function inferRiskLevel(exercise) {
  if (exercise.category === 'Passive Therapy' || exercise.category === 'Manual Therapy') {
    return 'Low';
  }
  if (exercise.category === 'Strengthening' || exercise.category === 'Sport Conditioning') {
    return 'Moderate';
  }
  if (exercise.category === 'Therapeutic Modalities') {
    return 'Low';
  }
  return 'Low-Moderate';
}

function inferSupervisionRequirement(exercise) {
  if (exercise.difficulty_level === 'Advanced') {
    return 'Direct supervision required for all sessions';
  }
  if (exercise.difficulty_level === 'Moderate') {
    return 'Direct supervision recommended for first 3-5 sessions';
  }
  return 'Initial training, then home program suitable with periodic check-ins';
}

function inferGeriatricGuidance(exercise) {
  return {
    applicable: exercise.category !== 'Sport Conditioning',
    modifications: 'Reduce intensity by 20-30%, shorter sessions, more frequent rest breaks',
    precautions: 'Monitor for arthritis flare-ups, adjust for reduced stamina'
  };
}

function inferPediatricGuidance(exercise) {
  return {
    applicable: exercise.category !== 'Geriatric Care' && exercise.category !== 'Palliative Care',
    modifications: 'Gentler handling, use of positive reinforcement, shorter attention span',
    precautions: 'Growth plate considerations in young dogs'
  };
}

function inferNeuroGuidance(exercise) {
  const applicable = exercise.category === 'Neurological Rehab' ||
                     exercise.category === 'Balance & Proprioception' ||
                     exercise.category === 'Passive Therapy';

  return {
    applicable: applicable,
    modifications: applicable ? 'May have reduced sensation; provide additional support, use slings if needed' : 'Not typically applicable',
    precautions: applicable ? 'Monitor for spasticity, ensure no pressure sores from positioning' : 'Assess neurological stability first'
  };
}

function inferComplementaryTherapies(exercise) {
  const complements = [];
  const category = exercise.category.toLowerCase();

  if (category.includes('passive') || category.includes('rom')) {
    complements.push('Thermotherapy before ROM', 'Cryotherapy after ROM', 'Massage before ROM');
  }

  if (category.includes('strengthening')) {
    complements.push('Warm-up exercises', 'Stretching before/after', 'Cryotherapy if inflammation');
  }

  if (category.includes('balance')) {
    complements.push('Proprioceptive exercises', 'Core strengthening', 'Gait training');
  }

  if (category.includes('aquatic')) {
    complements.push('Land-based exercises', 'Stretching post-session');
  }

  return complements.length > 0 ? complements : ['Multimodal approach recommended'];
}

function inferHomeProgramSuitability(exercise) {
  const notSuitable = ['Therapeutic Modalities', 'Neurological Rehab'];
  return !notSuitable.includes(exercise.category);
}

// ============================================================================
// BATCH ENHANCEMENT
// ============================================================================
function enhanceAllExercises(exercises) {
  return exercises.map(exercise => enhanceExercise(exercise));
}

// ============================================================================
// 3-TIER EVIDENCE CLASSIFICATION
// ============================================================================
function mapGradeToTier(grade) {
  if (grade === 'A') return 'Evidence-Based';
  if (grade === 'B') return 'Evidence-Adjacent';
  return 'Consensus-Only'; // C and Expert Opinion
}

// ============================================================================
// CLINICAL TAG INFERENCE
// ============================================================================
const CLINICAL_TAG_VOCABULARY = [
  'strength', 'ROM', 'proprioception', 'neuromuscular', 'endurance',
  'flexibility', 'coordination', 'pain_management', 'gait_training',
  'weight_bearing', 'core_stability', 'joint_protection', 'edema_management',
  'scar_mobilization', 'cardiovascular', 'balance', 'functional_mobility',
  'sensory_integration'
];

function inferClinicalTags(exercise) {
  const tags = new Set();
  const text = [
    exercise.name || '',
    exercise.description || '',
    exercise.category || '',
    ...(exercise.steps || []),
    exercise.progression || '',
    exercise.contraindications || ''
  ].join(' ').toLowerCase();

  if (/strengthen|resistance|muscle|squat|sit.?stand|down.?stand|hill|incline|eccentric|concentric/.test(text)) tags.add('strength');
  if (/range of motion|rom\b|flexion|extension|stretch|flexibility|prom\b|arom\b/.test(text)) tags.add('ROM');
  if (/propriocep|wobble|bosu|balance.*pad|foam.*pad|rocker|unstable.*surface/.test(text)) tags.add('proprioception');
  if (/neuromuscular|neuro|nerve|reflex|spinal|ivdd|myelopathy|atax/.test(text)) tags.add('neuromuscular');
  if (/endurance|cardio|treadmill|jog|trot|swim|aerobic/.test(text)) tags.add('endurance');
  if (/stretch|flexibility|lengthen|elongat/.test(text)) tags.add('flexibility');
  if (/coordinat|diagonal|weave|figure.?8|lateral.*step|side.*step|cavaletti/.test(text)) tags.add('coordination');
  if (/pain|analges|tens\b|laser|cryotherapy|cold.*therapy|heat.*therapy|modality|ultrasound|shockwave/.test(text)) tags.add('pain_management');
  if (/gait|walk|treadmill|leash.*walk|slow.*walk|stride/.test(text)) tags.add('gait_training');
  if (/weight.?bear|weight.?shift|load|stand|three.*leg|single.*limb/.test(text)) tags.add('weight_bearing');
  if (/core|trunk|spinal.*stabiliz|physio.*ball|plank/.test(text)) tags.add('core_stability');
  if (/joint.*protect|joint.*mob|mobiliz|splint|brace|support/.test(text)) tags.add('joint_protection');
  if (/edema|swelling|lymph|compress/.test(text)) tags.add('edema_management');
  if (/scar|adhesion|myofasc|fascial|tissue.*mobil/.test(text)) tags.add('scar_mobilization');
  if (/cardio|heart|aerobic|swim|jog|trot/.test(text)) tags.add('cardiovascular');
  if (/balance|equilibrium|wobble|bosu|rocker|foam.*pad|perturbat/.test(text)) tags.add('balance');
  if (/functional|stair|ramp|platform|fetch|retrieve|obstacle|daily.*living/.test(text)) tags.add('functional_mobility');
  if (/sensor|texture|surface.*vari|tactile|different.*surface/.test(text)) tags.add('sensory_integration');

  return Array.from(tags).sort();
}

// ============================================================================
// EXPORT
// ============================================================================
module.exports = {
  enhanceExercise,
  enhanceAllExercises,
  CLINICAL_TAG_VOCABULARY
};
