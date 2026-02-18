// ============================================================================
// SMART PROTOCOL GENERATION - CONDITION-SPECIFIC, PROGRESSIVE
// Evidence-Based per Millis & Levine "Canine Rehabilitation and Physical Therapy"
// All exercise-to-condition mappings clinically verified
// ============================================================================

// ============================================================================
// CONDITION-TO-EXERCISE MAPPING
// Each condition category maps to 5 progressive phases:
//   passive → active → strengthening → balance → functional
// Exercise codes correspond to entries in the exercise database
// ============================================================================

const CONDITION_EXERCISE_MAP = {

  // ═══════════════════════════════════════════════════════════════
  // STIFLE (KNEE) — TPLO, TTA, Lateral Suture, Meniscal, Patellar
  // Post-surgical stifle rehab per Millis Ch. 25-26
  // ═══════════════════════════════════════════════════════════════
  'stifle': {
    passive: ['PROM_STIFLE', 'COLD_THERAPY', 'HEAT_THERAPY', 'STRETCH_QUAD', 'STRETCH_HAMS', 'EFFLEURAGE', 'ICE_MASSAGE'],
    active: ['SIT_STAND', 'WEIGHT_SHIFT', 'SLOW_WALK', 'BACKING_UP', 'CURB_WALK', 'FIGURE_8'],
    strengthening: ['SIT_STAND_WALL', 'THREE_LEG_STAND', 'HILL_CLIMB', 'CAVALETTI_RAILS', 'CAVALETTI_VAR', 'BACKWARD_HILL'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'UNEVEN_TERRAIN', 'SURFACE_CHANGE', 'SLOW_PIVOT', 'FOAM_PAD_STAND'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'GREETING_SIT', 'RAMP_TRAINING']
  },

  // ═══════════════════════════════════════════════════════════════
  // HIP — FHO, THR, Dysplasia, Luxation, Legg-Calvé-Perthes
  // Per Millis Ch. 27
  // ═══════════════════════════════════════════════════════════════
  'hip': {
    passive: ['PROM_HIP', 'MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY', 'STRETCH_HAMS', 'EFFLEURAGE', 'MYOFASC_ILIO'],
    active: ['SIT_STAND', 'WEIGHT_SHIFT', 'SLOW_WALK', 'FIGURE_8', 'SIDE_STEP', 'BACKING_UP'],
    strengthening: ['HILL_CLIMB', 'CAVALETTI_RAILS', 'DOWN_STAND', 'BACKWARD_HILL', 'TROT_CIRCLES', 'SIT_STAND_WALL'],
    balance: ['WOBBLE_BOARD', 'PHYSIO_BALL', 'BALANCE_PAD', 'PERTURBATION', 'BALL_NUDGE', 'UNEVEN_TERRAIN'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'PLAY_BOW', 'DOOR_THRESHOLD', 'RAMP_TRAINING']
  },

  // ═══════════════════════════════════════════════════════════════
  // ELBOW & SHOULDER — Dysplasia, FCP, UAP, OCD, Biceps, Luxation
  // Per Millis Ch. 28
  // ═══════════════════════════════════════════════════════════════
  'forelimb': {
    passive: ['MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY', 'EFFLEURAGE', 'ICE_MASSAGE', 'MYOFASC_BF'],
    active: ['WEIGHT_SHIFT', 'SLOW_WALK', 'FIGURE_8', 'BACKING_UP', 'SIDE_STEP'],
    strengthening: ['WHEEL_BARREL', 'CAVALETTI_RAILS', 'DOWN_STAND', 'POLE_WEAVE', 'CAVALETTI_VAR'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'BALL_NUDGE', 'PERTURBATION', 'SURFACE_CHANGE'],
    functional: ['CAR_ENTRY', 'DOOR_THRESHOLD', 'GREETING_SIT', 'RAMP_TRAINING']
  },

  // ═══════════════════════════════════════════════════════════════
  // SPINE & NEUROLOGICAL — IVDD, FCE, DM, Lumbosacral, Wobbler,
  //   Vestibular, Peripheral Neuropathy, Spinal Fracture
  // Per Millis Ch. 29-30
  // NOTE: STAND_TALL removed (spinal extension stress)
  // NOTE: PLAY_BOW removed (spinal extension contraindicated for disc disease)
  // Neurological exercises (NEURO_*) added for proprioceptive retraining
  // ═══════════════════════════════════════════════════════════════
  'spine': {
    passive: ['MASSAGE_THERA', 'HEAT_THERAPY', 'EFFLEURAGE', 'NEURO_PROM', 'NEURO_MASSAGE', 'BICYCLING', 'ICE_MASSAGE'],
    active: ['WEIGHT_SHIFT', 'SLOW_WALK', 'BACKING_UP', 'ASSISTED_STANDING', 'LIMB_PLACEMENT', 'NEURO_STIM', 'POSITIONAL_ROTATION'],
    strengthening: ['SIT_STAND', 'CAVALETTI_RAILS', 'HILL_CLIMB', 'THREE_LEG_STAND', 'STEP_OVER', 'CAVALETTI_VAR'],
    balance: ['WOBBLE_BOARD', 'PHYSIO_BALL', 'UNEVEN_TERRAIN', 'PERTURBATION', 'SLOW_PIVOT', 'NEURO_BALANCE', 'FOAM_PAD_STAND'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'RAMP_TRAINING']
  },

  // ═══════════════════════════════════════════════════════════════
  // FRACTURES — Femoral, Tibial, Humeral, Radial, Pelvic, Carpal/Tarsal
  // Per Millis Ch. 24: Slow progression, protect fixation, progressive WB
  // Early phases focus on pain management and gentle ROM
  // Strengthening delayed until radiographic healing confirmed
  // ═══════════════════════════════════════════════════════════════
  'fracture': {
    passive: ['MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY', 'EFFLEURAGE', 'ICE_MASSAGE', 'COMPRESSION_TX'],
    active: ['WEIGHT_SHIFT', 'SLOW_WALK', 'SIT_STAND', 'BACKING_UP'],
    strengthening: ['CAVALETTI_RAILS', 'HILL_CLIMB', 'SIT_STAND_WALL', 'DOWN_STAND', 'THREE_LEG_STAND'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'UNEVEN_TERRAIN', 'SURFACE_CHANGE', 'SLOW_PIVOT'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'RAMP_TRAINING']
  },

  // ═══════════════════════════════════════════════════════════════
  // SOFT TISSUE & TENDON — Achilles, Iliopsoas, Gracilis, Muscle Strain
  // Per Millis Ch. 23: Protect healing tissue, controlled loading
  // Progressive tensile loading per tissue healing timelines
  // ═══════════════════════════════════════════════════════════════
  'soft_tissue': {
    passive: ['MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY', 'EFFLEURAGE', 'MYOFASC_ILIO', 'MYOFASC_BF', 'ICE_MASSAGE', 'COMPRESSION_TX'],
    active: ['SLOW_WALK', 'WEIGHT_SHIFT', 'FIGURE_8', 'SIDE_STEP', 'BACKING_UP'],
    strengthening: ['CAVALETTI_RAILS', 'HILL_CLIMB', 'RESIST_WALK', 'CAVALETTI_VAR', 'TROT_CIRCLES', 'THERABAND_WTS'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'UNEVEN_TERRAIN', 'PERTURBATION', 'FOAM_PAD_STAND'],
    functional: ['CAR_ENTRY', 'DOOR_THRESHOLD', 'COUCH_ON_OFF', 'RAMP_TRAINING']
  },

  // ═══════════════════════════════════════════════════════════════
  // POST-AMPUTATION — Forelimb or Hindlimb
  // Per Millis Ch. 31: Core strengthening, 3-legged balance,
  // compensatory muscle strengthening, weight management
  // ═══════════════════════════════════════════════════════════════
  'amputation': {
    passive: ['MASSAGE_THERA', 'HEAT_THERAPY', 'COLD_THERAPY', 'EFFLEURAGE', 'STRETCH_QUAD', 'STRETCH_HAMS'],
    active: ['SLOW_WALK', 'WEIGHT_SHIFT', 'SIT_STAND', 'FIGURE_8', 'SIDE_STEP'],
    strengthening: ['THREE_LEG_STAND', 'CAVALETTI_RAILS', 'HILL_CLIMB', 'SIT_STAND_WALL', 'DOWN_STAND', 'DIAGONAL_LIFT'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'PHYSIO_BALL', 'PERTURBATION', 'UNEVEN_TERRAIN', 'BOSU_STAND', 'PLATFORM_TRANS'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'RAMP_TRAINING', 'GREETING_SIT']
  },

  // ═══════════════════════════════════════════════════════════════
  // MULTI-JOINT / GERIATRIC / OA
  // Per Millis Ch. 32: Low-impact, maintain mobility, pain management
  // ═══════════════════════════════════════════════════════════════
  'multiJoint': {
    passive: ['MASSAGE_THERA', 'HEAT_THERAPY', 'PROM_STIFLE', 'PROM_HIP', 'EFFLEURAGE', 'GENTLE_PROM', 'MASSAGE_SENIOR'],
    active: ['SLOW_WALK', 'WEIGHT_SHIFT', 'SIT_STAND', 'FIGURE_8', 'SENIOR_WALK', 'SIT_STAND_SENIOR'],
    strengthening: ['CAVALETTI_RAILS', 'HILL_CLIMB', 'SIT_STAND_WALL', 'DOWN_STAND', 'CAVALETTI_VAR'],
    balance: ['BALANCE_PAD', 'UNEVEN_TERRAIN', 'SURFACE_CHANGE', 'WOBBLE_BOARD', 'SENIOR_BALANCE', 'FOAM_PAD_STAND'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'GREETING_SIT', 'RAMP_TRAINING']
  },

  // ═══════════════════════════════════════════════════════════════
  // OBESITY / WEIGHT MANAGEMENT / FITNESS CONDITIONING
  // Per Millis Ch. 33: Low-impact cardio, progressive endurance
  // Focus on caloric expenditure with joint protection
  // ═══════════════════════════════════════════════════════════════
  'obesity': {
    passive: ['MASSAGE_THERA', 'HEAT_THERAPY', 'STRETCH_QUAD', 'STRETCH_HAMS', 'EFFLEURAGE'],
    active: ['SLOW_WALK', 'FIGURE_8', 'WEIGHT_SHIFT', 'SIDE_STEP', 'SIT_STAND', 'BACKING_UP'],
    strengthening: ['CAVALETTI_RAILS', 'HILL_CLIMB', 'SIT_STAND_WALL', 'DOWN_STAND', 'CAVALETTI_VAR', 'TROT_CIRCLES', 'RESIST_WALK'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'UNEVEN_TERRAIN', 'SURFACE_CHANGE', 'SLOW_PIVOT'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'PLAY_BOW', 'RAMP_TRAINING']
  },

  // ═══════════════════════════════════════════════════════════════
  // PALLIATIVE / COMFORT CARE
  // Per Millis Ch. 34: Quality of life, gentle mobility, pain management
  // Low intensity, short duration, comfort-focused
  // ═══════════════════════════════════════════════════════════════
  'palliative': {
    passive: ['MASSAGE_THERA', 'HEAT_THERAPY', 'EFFLEURAGE', 'GENTLE_PROM', 'MASSAGE_SENIOR', 'NEURO_MASSAGE'],
    active: ['SLOW_WALK', 'SENIOR_WALK', 'WEIGHT_SHIFT', 'POSITIONAL_ROTATION'],
    strengthening: ['SIT_STAND_SENIOR', 'CAVALETTI_RAILS', 'SIT_STAND'],
    balance: ['BALANCE_PAD', 'SENIOR_BALANCE', 'SURFACE_CHANGE'],
    functional: ['RAMP_TRAINING', 'CAR_ENTRY', 'DOOR_THRESHOLD']
  },

  // ═══════════════════════════════════════════════════════════════
  // CONSERVATIVE STIFLE (CCL without surgery)
  // Per Millis & Levine: Fibrosis-based stabilization, progressive loading
  // Slower progression than post-surgical, emphasis on manual therapy
  // ═══════════════════════════════════════════════════════════════
  'conservative_stifle': {
    passive: [
      'PROM_STIFLE', 'MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY',
      'STRETCH_QUAD', 'STRETCH_HAMS', 'EFFLEURAGE',
      'JOINT_MOB_G1', 'JOINT_MOB_G2', 'ICE_MASSAGE', 'COMPRESSION_TX'
    ],
    active: [
      'SLOW_WALK', 'WEIGHT_SHIFT', 'SIT_STAND', 'BACKING_UP',
      'CURB_WALK', 'FIGURE_8', 'SIDE_STEP'
    ],
    strengthening: [
      'SIT_STAND_WALL', 'THREE_LEG_STAND', 'CAVALETTI_RAILS',
      'CAVALETTI_VAR', 'HILL_CLIMB', 'BACKWARD_HILL',
      'THERABAND_WTS', 'DIAGONAL_LIFT', 'RESIST_WALK'
    ],
    balance: [
      'WOBBLE_BOARD', 'BALANCE_PAD', 'UNEVEN_TERRAIN', 'PERTURBATION',
      'SURFACE_CHANGE', 'SLOW_PIVOT', 'BOSU_STAND', 'FOAM_PAD_STAND'
    ],
    functional: [
      'CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'GREETING_SIT',
      'RAMP_TRAINING'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CONSERVATIVE HIP (Dysplasia without surgery)
  // Per Millis & Levine: Weight management + strengthening + pain control
  // ═══════════════════════════════════════════════════════════════
  'conservative_hip': {
    passive: [
      'PROM_HIP', 'MASSAGE_THERA', 'HEAT_THERAPY', 'COLD_THERAPY',
      'STRETCH_HAMS', 'EFFLEURAGE', 'MYOFASC_ILIO', 'MYOFASC_BF',
      'ICE_MASSAGE'
    ],
    active: [
      'SLOW_WALK', 'WEIGHT_SHIFT', 'SIT_STAND', 'FIGURE_8',
      'SIDE_STEP', 'BACKING_UP'
    ],
    strengthening: [
      'CAVALETTI_RAILS', 'CAVALETTI_VAR', 'HILL_CLIMB', 'DOWN_STAND',
      'BACKWARD_HILL', 'TROT_CIRCLES', 'SIT_STAND_WALL',
      'THERABAND_WTS', 'DIAGONAL_LIFT'
    ],
    balance: [
      'WOBBLE_BOARD', 'PHYSIO_BALL', 'BALANCE_PAD', 'PERTURBATION',
      'BALL_NUDGE', 'UNEVEN_TERRAIN', 'BOSU_STAND', 'PLATFORM_TRANS'
    ],
    functional: [
      'CAR_ENTRY', 'COUCH_ON_OFF', 'PLAY_BOW', 'DOOR_THRESHOLD',
      'RAMP_TRAINING'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CONSERVATIVE SPINE (IVDD / DM without surgery)
  // Per Millis & Levine: Strict rest initially, progressive neuro rehab
  // NOTE: STAND_TALL removed — spinal extension stress
  // NOTE: PLAY_BOW removed — spinal extension contraindicated
  // ═══════════════════════════════════════════════════════════════
  'conservative_spine': {
    passive: [
      'MASSAGE_THERA', 'HEAT_THERAPY', 'EFFLEURAGE',
      'MYOFASC_ILIO', 'MYOFASC_BF', 'ICE_MASSAGE', 'COMPRESSION_TX',
      'NEURO_PROM', 'NEURO_MASSAGE', 'BICYCLING'
    ],
    active: [
      'SLOW_WALK', 'WEIGHT_SHIFT', 'BACKING_UP',
      'ASSISTED_STANDING', 'LIMB_PLACEMENT', 'NEURO_STIM',
      'POSITIONAL_ROTATION'
    ],
    strengthening: [
      'SIT_STAND', 'CAVALETTI_RAILS', 'HILL_CLIMB', 'THREE_LEG_STAND',
      'CAVALETTI_VAR', 'STEP_OVER', 'THERABAND_WTS', 'DIAGONAL_LIFT'
    ],
    balance: [
      'WOBBLE_BOARD', 'PHYSIO_BALL', 'UNEVEN_TERRAIN', 'PERTURBATION',
      'SLOW_PIVOT', 'NEURO_BALANCE', 'BOSU_STAND', 'FOAM_PAD_STAND'
    ],
    functional: [
      'CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'RAMP_TRAINING'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CONSERVATIVE FORELIMB (Elbow/Shoulder without surgery)
  // ═══════════════════════════════════════════════════════════════
  'conservative_forelimb': {
    passive: [
      'MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY', 'EFFLEURAGE',
      'MYOFASC_BF', 'ICE_MASSAGE', 'JOINT_MOB_G1', 'JOINT_MOB_G2'
    ],
    active: [
      'WEIGHT_SHIFT', 'SLOW_WALK', 'FIGURE_8', 'BACKING_UP',
      'SIDE_STEP'
    ],
    strengthening: [
      'WHEEL_BARREL', 'CAVALETTI_RAILS', 'DOWN_STAND', 'POLE_WEAVE',
      'CAVALETTI_VAR', 'THERABAND_WTS', 'RESIST_WALK'
    ],
    balance: [
      'WOBBLE_BOARD', 'BALANCE_PAD', 'BALL_NUDGE', 'PERTURBATION',
      'SURFACE_CHANGE', 'FOAM_PAD_STAND', 'BOSU_STAND'
    ],
    functional: [
      'CAR_ENTRY', 'DOOR_THRESHOLD', 'GREETING_SIT', 'RAMP_TRAINING'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // DEFAULT (fallback — should rarely be reached now)
  // General safe protocol for unclassified conditions
  // ═══════════════════════════════════════════════════════════════
  'default': {
    passive: ['MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY', 'EFFLEURAGE', 'ICE_MASSAGE'],
    active: ['SIT_STAND', 'WEIGHT_SHIFT', 'SLOW_WALK', 'FIGURE_8', 'BACKING_UP'],
    strengthening: ['CAVALETTI_RAILS', 'HILL_CLIMB', 'THREE_LEG_STAND', 'SIT_STAND_WALL', 'DOWN_STAND'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'UNEVEN_TERRAIN', 'SURFACE_CHANGE'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'RAMP_TRAINING']
  }
};


// ============================================================================
// CONDITION CATEGORY ROUTING
// Maps frontend diagnosis values to the correct exercise map
// ============================================================================
function getConditionCategory(diagnosis, affectedRegion, treatmentApproach) {
  const d = (diagnosis || '').toLowerCase();
  const r = (affectedRegion || '').toLowerCase();
  const isConservative = treatmentApproach === 'conservative';

  // ── STIFLE CONDITIONS ──
  if (d.includes('tplo') || d.includes('tta') ||
      d.includes('ccl') || d === 'ccl conservative' ||
      d.includes('lateral suture') || d.includes('meniscal') ||
      d.includes('patella') || d.includes('stifle') ||
      r.includes('stifle') || r.includes('knee')) {
    return isConservative ? 'conservative_stifle' : 'stifle';
  }

  // ── HIP CONDITIONS ──
  if (d.includes('hip') || d.includes('fho') || /\bthr\b/.test(d) ||
      d.includes('total hip') || d.includes('dysplasia') ||
      d.includes('legg') || d.includes('perthes') ||
      r.includes('hip')) {
    return isConservative ? 'conservative_hip' : 'hip';
  }

  // ── ELBOW / SHOULDER CONDITIONS ──
  if (d.includes('elbow') || d.includes('shoulder') ||
      d.includes('fcp') || d.includes('uap') ||
      d.includes('biceps') || d.includes('infraspinatus') ||
      d.includes('ocd') ||
      r.includes('elbow') || r.includes('shoulder')) {
    return isConservative ? 'conservative_forelimb' : 'forelimb';
  }

  // ── SPINE / NEUROLOGICAL CONDITIONS ──
  if (d.includes('ivdd') || d.includes('fce') ||
      d.includes('myelopathy') || d.includes('degenerative m') ||
      d.includes('lumbosacral') || d.includes('cauda equina') ||
      d.includes('spondylomyelopathy') || d.includes('wobbler') ||
      d.includes('vestibular') || d.includes('neuropathy') ||
      d.includes('spinal') ||
      r.includes('spine') || r.includes('cervical') ||
      r.includes('thoracolumbar') || r.includes('lumbosacral')) {
    return isConservative ? 'conservative_spine' : 'spine';
  }

  // ── FRACTURES ──
  if (d.includes('fracture') || d.includes('polytrauma') ||
      d.includes('carpal') || d.includes('tarsal')) {
    return 'fracture';
  }

  // ── SOFT TISSUE / TENDON ──
  if (d.includes('achilles') || d.includes('iliopsoas') ||
      d.includes('gracilis') || d.includes('contracture') ||
      d.includes('strain') || d.includes('sprain') ||
      d.includes('rupture') || d.includes('fibrotic') ||
      d.includes('tendon') || d.includes('ligament sprain')) {
    return 'soft_tissue';
  }

  // ── POST-AMPUTATION ──
  if (d.includes('amputation')) {
    return 'amputation';
  }

  // ── PALLIATIVE / COMFORT ──
  if (d.includes('palliative') || d.includes('comfort') ||
      d.includes('immune-mediated')) {
    return 'palliative';
  }

  // ── OBESITY / CONDITIONING ──
  if (d.includes('obesity') || d.includes('weight') ||
      d.includes('conditioning') || d.includes('fitness')) {
    return 'obesity';
  }

  // ── MULTI-JOINT / GERIATRIC ──
  if (d.includes('osteoarthritis') || d.includes('geriatric') ||
      d.includes('multi') || d.includes('arthritis')) {
    return 'multiJoint';
  }

  return 'default';
}


// ============================================================================
// PHASE PROGRESSION
// Progressive rehabilitation phases based on week number / total weeks
// Conservative protocols use slower progression (extended passive/active phases)
// ============================================================================
function getPhaseForWeek(weekNum, totalWeeks, isConservative) {
  const progress = weekNum / totalWeeks;

  if (isConservative) {
    // Conservative: extended passive + active phases, delayed strengthening
    if (progress <= 0.30)      return 'passive';        // ~Weeks 1-2.5 of 8
    else if (progress <= 0.50) return 'active';          // ~Weeks 2.5-4
    else if (progress <= 0.70) return 'strengthening';   // ~Weeks 4-5.5
    else if (progress <= 0.90) return 'balance';         // ~Weeks 5.5-7
    else                       return 'functional';      // ~Weeks 7-8
  }

  // Standard post-surgical progression
  if (progress <= 0.25)      return 'passive';        // Weeks 1-2 of 8
  else if (progress <= 0.40) return 'active';          // Weeks 3-3.5
  else if (progress <= 0.625) return 'strengthening';  // Weeks 4-5
  else if (progress <= 0.875) return 'balance';        // Weeks 6-7
  else                        return 'functional';     // Week 8
}


// ============================================================================
// EXERCISE SELECTION FOR EACH WEEK
// Selects appropriate exercises based on condition, phase, and clinical context
// ============================================================================
function selectExercisesForWeek(weekNum, totalWeeks, allExercises, formData) {
  const treatmentApproach = formData.treatmentApproach || '';
  const isConservative = treatmentApproach === 'conservative';
  const isPalliative = treatmentApproach === 'palliative';

  // Route to correct condition category (now considers treatment approach)
  const conditionCategory = getConditionCategory(
    formData.diagnosis,
    formData.affectedRegion,
    treatmentApproach
  );

  const exerciseMap = CONDITION_EXERCISE_MAP[conditionCategory] || CONDITION_EXERCISE_MAP['default'];
  const phase = getPhaseForWeek(weekNum, totalWeeks, isConservative || isPalliative);
  const availableCodes = exerciseMap[phase] || [];

  // Get exercises by code from the database
  const phaseExercises = allExercises.filter(ex => availableCodes.includes(ex.code));

  // Select 3-5 exercises per week (rotate through available pool)
  const maxPerWeek = isPalliative ? 3 : 4;
  const exercisesPerWeek = Math.min(maxPerWeek, phaseExercises.length);
  const startIndex = ((weekNum - 1) * 2) % Math.max(phaseExercises.length, 1);

  let selectedExercises = [];
  for (let i = 0; i < exercisesPerWeek; i++) {
    const index = (startIndex + i) % phaseExercises.length;
    if (phaseExercises[index]) {
      selectedExercises.push(phaseExercises[index]);
    }
  }

  // ── AQUATIC THERAPY ──
  // Only add if clinic has aquatic access AND past initial healing phase (week 2+)
  const hasAquatic = formData.aquaticAccess === true || formData.aquaticAccess === 'true';
  if (hasAquatic && weekNum > 2 && weekNum < totalWeeks - 1) {
    const aquaticExercises = allExercises.filter(ex =>
      ex.category === 'Aquatic Therapy' || ex.category === 'Hydrotherapy'
    );
    if (aquaticExercises.length > 0) {
      const aquaIndex = (weekNum - 3) % aquaticExercises.length;
      selectedExercises.push(aquaticExercises[aquaIndex]);
    }
  }

  // ── THERAPEUTIC MODALITIES ──
  // Add modality exercises if the clinic has the equipment and we're in passive/active phase
  if (phase === 'passive' || phase === 'active') {
    const modalityMap = {
      'modalityLaser': 'LASER_IV',
      'modalityTENS': 'TENS_THERAPY',
      'modalityNMES': 'NMES_QUAD',
      'modalityTherapeuticUS': 'US_PULSED',
      'modalityShockwave': 'SHOCKWAVE',
      'modalityPulsedEMF': 'PEMF_THERAPY',
    };

    let modalitiesAdded = 0;
    for (const [formKey, exCode] of Object.entries(modalityMap)) {
      if (modalitiesAdded >= 2) break; // Max 2 modalities per week
      if (formData[formKey] === true || formData[formKey] === 'true') {
        const modEx = allExercises.find(ex => ex.code === exCode);
        if (modEx && !selectedExercises.find(e => e.code === exCode)) {
          selectedExercises.push(modEx);
          modalitiesAdded++;
        }
      }
    }
  }

  // Map to protocol output format with progressive intensity
  const intensityMultiplier = 1 + (weekNum / totalWeeks) * 0.5;

  return selectedExercises.map(ex => ({
    code: ex.code,
    name: ex.name,
    category: ex.category,
    description: ex.description,
    sets: isPalliative
      ? Math.min(2, Math.ceil(1 + (weekNum / totalWeeks)))
      : Math.min(Math.ceil(2 + (weekNum / totalWeeks) * 2), 4),
    reps: isPalliative
      ? Math.ceil(5 + weekNum)
      : Math.ceil((8 + weekNum) * intensityMultiplier),
    frequency: getFrequencyForPhase(phase, isPalliative),
    duration_minutes: getDurationForExercise(ex.category, weekNum, isPalliative),
    equipment: ex.equipment,
    setup: ex.setup,
    steps: ex.steps,
    good_form: ex.good_form,
    common_mistakes: ex.common_mistakes,
    red_flags: ex.red_flags,
    progression: ex.progression,
    contraindications: ex.contraindications,
    notes: ex.notes || null
  }));
}


// ============================================================================
// FREQUENCY & DURATION HELPERS
// ============================================================================
function getFrequencyForPhase(phase, isPalliative) {
  if (isPalliative) {
    return phase === 'passive' ? '2x daily' : '1x daily';
  }
  switch (phase) {
    case 'passive':       return '3x daily';
    case 'active':        return '2x daily';
    case 'strengthening': return '1-2x daily';
    case 'balance':       return '1x daily';
    case 'functional':    return 'Throughout the day';
    default:              return '2x daily';
  }
}

function getDurationForExercise(category, weekNum, isPalliative) {
  const baseMinutes = {
    'Passive Therapy': 10,
    'Manual Therapy': 10,
    'Therapeutic Modalities': 10,
    'Complementary Therapy': 10,
    'Active Assisted': 10,
    'Strengthening': 15,
    'Balance & Proprioception': 10,
    'Aquatic Therapy': 15,
    'Hydrotherapy': 15,
    'Neurological Rehab': 10,
    'Geriatric Care': 10,
    'Functional Training': 5,
    'Palliative Care': 5
  };

  const base = baseMinutes[category] || 10;
  if (isPalliative) return Math.min(base, 10); // Cap palliative at 10 min
  return Math.min(base + Math.floor(weekNum / 2), base * 2);
}


// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  selectExercisesForWeek,
  getConditionCategory,
  getPhaseForWeek
};
