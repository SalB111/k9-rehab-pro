// ============================================================================
// SMART PROTOCOL GENERATION - CONDITION-SPECIFIC, PROGRESSIVE
// ============================================================================

// Condition-to-Exercise Mapping
const CONDITION_EXERCISE_MAP = {
  // STIFLE CONDITIONS (CCL, TPLO, TTA, etc.)
  'stifle': {
    passive: ['PROM_STIFLE', 'COLD_THERAPY', 'HEAT_THERAPY', 'STRETCH_QUAD', 'STRETCH_HAMS'],
    active: ['SIT_STAND', 'WEIGHT_SHIFT', 'SLOW_WALK', 'BACKING_UP', 'CURB_WALK'],
    strengthening: ['THREE_LEG_STAND', 'SIT_STAND_WALL', 'HILL_CLIMB', 'CAVALETTI_RAILS', 'STAIR_CLIMB'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'UNEVEN_TERRAIN', 'SURFACE_CHANGE', 'SLOW_PIVOT'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'GREETING_SIT']
  },

  // HIP CONDITIONS (Dysplasia, FHO, THR)
  'hip': {
    passive: ['PROM_HIP', 'MASSAGE_THERA', 'COLD_THERAPY', 'STRETCH_HAMS', 'EFFLEURAGE'],
    active: ['SIT_STAND', 'WEIGHT_SHIFT', 'SLOW_WALK', 'FIGURE_8', 'SIDE_STEP'],
    strengthening: ['HILL_CLIMB', 'CAVALETTI_RAILS', 'DOWN_STAND', 'BACKWARD_HILL', 'TROT_CIRCLES'],
    balance: ['WOBBLE_BOARD', 'PHYSIO_BALL', 'BALANCE_PAD', 'PERTURBATION', 'BALL_NUDGE'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'PLAY_BOW', 'DOOR_THRESHOLD']
  },

  // ELBOW/SHOULDER CONDITIONS
  'forelimb': {
    passive: ['MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY', 'EFFLEURAGE'],
    active: ['WEIGHT_SHIFT', 'SLOW_WALK', 'STAND_TALL', 'FIGURE_8'],
    strengthening: ['WHEEL_BARREL', 'CAVALETTI_RAILS', 'DOWN_STAND', 'POLE_WEAVE'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'BALL_NUDGE', 'PERTURBATION'],
    functional: ['CAR_ENTRY', 'DOOR_THRESHOLD', 'GREETING_SIT']
  },

  // SPINE/NEURO CONDITIONS (IVDD, FCE, DM)
  'spine': {
    passive: ['MASSAGE_THERA', 'HEAT_THERAPY', 'EFFLEURAGE'],
    active: ['WEIGHT_SHIFT', 'SLOW_WALK', 'BACKING_UP', 'STAND_TALL'],
    strengthening: ['SIT_STAND', 'CAVALETTI_RAILS', 'HILL_CLIMB', 'THREE_LEG_STAND'],
    balance: ['WOBBLE_BOARD', 'PHYSIO_BALL', 'UNEVEN_TERRAIN', 'PERTURBATION', 'SLOW_PIVOT'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'PLAY_BOW']
  },

  // MULTI-JOINT / GERIATRIC
  'multiJoint': {
    passive: ['MASSAGE_THERA', 'HEAT_THERAPY', 'PROM_STIFLE', 'PROM_HIP', 'EFFLEURAGE'],
    active: ['SLOW_WALK', 'WEIGHT_SHIFT', 'SIT_STAND', 'FIGURE_8'],
    strengthening: ['CAVALETTI_RAILS', 'HILL_CLIMB', 'SIT_STAND_WALL'],
    balance: ['BALANCE_PAD', 'UNEVEN_TERRAIN', 'SURFACE_CHANGE'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'GREETING_SIT']
  },

  // CONSERVATIVE REHABILITATION (Client Elected Non-Surgical)
  // Based on Millis & Levine evidence-based conservative management:
  // Emphasizes pain control, controlled therapeutic exercise, manual therapy,
  // proprioceptive retraining, and progressive functional restoration
  'conservative': {
    passive: [
      'MASSAGE_THERA', 'HEAT_THERAPY', 'COLD_THERAPY', 'EFFLEURAGE',
      'PROM_STIFLE', 'PROM_HIP', 'STRETCH_QUAD', 'STRETCH_HAMS',
      'JOINT_MOB_G1', 'JOINT_MOB_G2', 'MYOFASC_ILIO', 'MYOFASC_BF',
      'TENS_THERAPY', 'LASER_IV', 'PEMF_THERAPY', 'ICE_MASSAGE',
      'COMPRESSION_TX'
    ],
    active: [
      'SLOW_WALK', 'WEIGHT_SHIFT', 'SIT_STAND', 'BACKING_UP',
      'FIGURE_8', 'SIDE_STEP', 'CURB_WALK', 'STAND_TALL',
      'SENIOR_WALK', 'SIT_STAND_SENIOR'
    ],
    strengthening: [
      'CAVALETTI_RAILS', 'CAVALETTI_VAR', 'HILL_CLIMB', 'SIT_STAND_WALL',
      'THREE_LEG_STAND', 'DOWN_STAND', 'BACKWARD_HILL', 'POLE_WEAVE',
      'TROT_CIRCLES', 'RESIST_WALK', 'THERABAND_WTS', 'DIAGONAL_LIFT'
    ],
    balance: [
      'WOBBLE_BOARD', 'BALANCE_PAD', 'PHYSIO_BALL', 'UNEVEN_TERRAIN',
      'PERTURBATION', 'SURFACE_CHANGE', 'SLOW_PIVOT', 'BALL_NUDGE',
      'BOSU_STAND', 'FOAM_PAD_STAND', 'PLATFORM_TRANS',
      'PERTURBATION_ADV', 'FIGURE8_CONE'
    ],
    functional: [
      'CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'PLAY_BOW',
      'GREETING_SIT', 'RAMP_TRAINING'
    ]
  },

  // CONSERVATIVE STIFLE (CCL without surgery)
  'conservative_stifle': {
    passive: [
      'PROM_STIFLE', 'MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY',
      'STRETCH_QUAD', 'STRETCH_HAMS', 'EFFLEURAGE',
      'JOINT_MOB_G1', 'JOINT_MOB_G2', 'TENS_THERAPY', 'LASER_IV',
      'ICE_MASSAGE', 'COMPRESSION_TX'
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

  // CONSERVATIVE HIP (Dysplasia without surgery)
  'conservative_hip': {
    passive: [
      'PROM_HIP', 'MASSAGE_THERA', 'HEAT_THERAPY', 'COLD_THERAPY',
      'STRETCH_HAMS', 'EFFLEURAGE', 'MYOFASC_ILIO', 'MYOFASC_BF',
      'TENS_THERAPY', 'LASER_IV', 'PEMF_THERAPY', 'ICE_MASSAGE'
    ],
    active: [
      'SLOW_WALK', 'WEIGHT_SHIFT', 'SIT_STAND', 'FIGURE_8',
      'SIDE_STEP', 'BACKING_UP', 'STAND_TALL'
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

  // CONSERVATIVE SPINE (IVDD / DM without surgery)
  'conservative_spine': {
    passive: [
      'MASSAGE_THERA', 'HEAT_THERAPY', 'EFFLEURAGE',
      'MYOFASC_ILIO', 'MYOFASC_BF', 'TENS_THERAPY', 'LASER_IV',
      'PEMF_THERAPY', 'ICE_MASSAGE', 'COMPRESSION_TX',
      'NEURO_PROM', 'NEURO_MASSAGE', 'BICYCLING'
    ],
    active: [
      'SLOW_WALK', 'WEIGHT_SHIFT', 'BACKING_UP', 'STAND_TALL',
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
      'CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD', 'PLAY_BOW',
      'RAMP_TRAINING'
    ]
  },

  // DEFAULT (if no specific match)
  'default': {
    passive: ['MASSAGE_THERA', 'COLD_THERAPY', 'HEAT_THERAPY', 'PROM_STIFLE'],
    active: ['SIT_STAND', 'WEIGHT_SHIFT', 'SLOW_WALK', 'FIGURE_8'],
    strengthening: ['CAVALETTI_RAILS', 'HILL_CLIMB', 'THREE_LEG_STAND', 'SIT_STAND_WALL'],
    balance: ['WOBBLE_BOARD', 'BALANCE_PAD', 'UNEVEN_TERRAIN'],
    functional: ['CAR_ENTRY', 'COUCH_ON_OFF', 'DOOR_THRESHOLD']
  }
};

// Determine condition category
function getConditionCategory(diagnosis, affectedRegion) {
  const diagnosisLower = (diagnosis || '').toLowerCase();
  const regionLower = (affectedRegion || '').toLowerCase();

  // STIFLE conditions
  if (diagnosisLower.includes('ccl') || 
      diagnosisLower.includes('tplo') || 
      diagnosisLower.includes('tta') ||
      diagnosisLower.includes('stifle') ||
      diagnosisLower.includes('patella') ||
      regionLower.includes('stifle') ||
      regionLower.includes('knee')) {
    return 'stifle';
  }

  // HIP conditions
  if (diagnosisLower.includes('hip') ||
      diagnosisLower.includes('fho') ||
      diagnosisLower.includes('thr') ||
      diagnosisLower.includes('dysplasia') ||
      regionLower.includes('hip')) {
    return 'hip';
  }

  // ELBOW/SHOULDER conditions
  if (diagnosisLower.includes('elbow') ||
      diagnosisLower.includes('shoulder') ||
      diagnosisLower.includes('forelimb') ||
      regionLower.includes('elbow') ||
      regionLower.includes('shoulder')) {
    return 'forelimb';
  }

  // SPINE/NEURO conditions
  if (diagnosisLower.includes('ivdd') ||
      diagnosisLower.includes('fce') ||
      diagnosisLower.includes('spine') ||
      diagnosisLower.includes('wobbler') ||
      diagnosisLower.includes('dm') ||
      regionLower.includes('spine') ||
      regionLower.includes('neuro')) {
    return 'spine';
  }

  // MULTI-JOINT
  if (diagnosisLower.includes('osteoarthritis') ||
      diagnosisLower.includes('geriatric') ||
      diagnosisLower.includes('multi')) {
    return 'multiJoint';
  }

  return 'default';
}

// Phase-based progression
function getPhaseForWeek(weekNum, totalWeeks) {
  const progress = weekNum / totalWeeks;

  if (progress <= 0.25) {
    return 'passive'; // Weeks 1-2 (of 8)
  } else if (progress <= 0.40) {
    return 'active'; // Weeks 3-3 (of 8)
  } else if (progress <= 0.625) {
    return 'strengthening'; // Weeks 4-5 (of 8)
  } else if (progress <= 0.875) {
    return 'balance'; // Weeks 6-7 (of 8)
  } else {
    return 'functional'; // Week 8
  }
}

// Select exercises for specific week
function selectExercisesForWeek(weekNum, totalWeeks, allExercises, formData) {
  const conditionCategory = getConditionCategory(formData.diagnosis, formData.affectedRegion);
  const exerciseMap = CONDITION_EXERCISE_MAP[conditionCategory];
  
  const phase = getPhaseForWeek(weekNum, totalWeeks);
  const availableCodes = exerciseMap[phase] || [];

  // Get exercises by code
  const phaseExercises = allExercises.filter(ex => availableCodes.includes(ex.code));

  // Select 3-5 exercises per week (rotate through available exercises)
  const exercisesPerWeek = Math.min(4, phaseExercises.length);
  const startIndex = ((weekNum - 1) * 2) % phaseExercises.length; // Rotate selection
  
  let selectedExercises = [];
  for (let i = 0; i < exercisesPerWeek; i++) {
    const index = (startIndex + i) % phaseExercises.length;
    selectedExercises.push(phaseExercises[index]);
  }

  // Add aquatic if available and past week 2
  if (weekNum > 2 && weekNum < totalWeeks - 1) {
    const aquaticExercises = allExercises.filter(ex => ex.category === 'Aquatic Therapy');
    if (aquaticExercises.length > 0) {
      const aquaIndex = (weekNum - 3) % aquaticExercises.length;
      selectedExercises.push(aquaticExercises[aquaIndex]);
    }
  }

  // Map to protocol format with progressive intensity
  const intensityMultiplier = 1 + (weekNum / totalWeeks) * 0.5; // Increases over time

  return selectedExercises.map(ex => ({
    code: ex.code,
    name: ex.name,
    category: ex.category,
    sets: Math.min(Math.ceil(2 + (weekNum / totalWeeks) * 2), 4), // 2-4 sets
    reps: Math.ceil((8 + weekNum) * intensityMultiplier), // Progressive reps
    frequency: getFrequencyForPhase(phase),
    duration_minutes: getDurationForExercise(ex.category, weekNum),
    equipment: ex.equipment,
    setup: ex.setup,
    steps: ex.steps,
    good_form: ex.good_form,
    common_mistakes: ex.common_mistakes,
    red_flags: ex.red_flags,
    progression: ex.progression,
    contraindications: ex.contraindications
  }));
}

// Frequency based on phase
function getFrequencyForPhase(phase) {
  switch(phase) {
    case 'passive': return '3x daily';
    case 'active': return '2x daily';
    case 'strengthening': return '1-2x daily';
    case 'balance': return '1x daily';
    case 'functional': return 'Throughout the day';
    default: return '2x daily';
  }
}

// Duration based on exercise type
function getDurationForExercise(category, weekNum) {
  const baseMinutes = {
    'Passive Therapy': 10,
    'Active Assisted': 10,
    'Strengthening': 15,
    'Balance & Proprioception': 10,
    'Aquatic Therapy': 15,
    'Functional Training': 5
  };

  const base = baseMinutes[category] || 10;
  return Math.min(base + Math.floor(weekNum / 2), base * 2); // Increase duration over time
}

module.exports = {
  selectExercisesForWeek,
  getConditionCategory,
  getPhaseForWeek
};
