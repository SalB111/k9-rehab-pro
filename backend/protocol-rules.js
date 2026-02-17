// ============================================================================
// PROTOCOL RULES ENGINE
// Condition + Phase → Exercise slug selection
// Add new conditions by following the TPLO pattern below
// ============================================================================

const PROTOCOL_RULES = {

  // --------------------------------------------------------------------------
  // TPLO — Tibial Plateau Leveling Osteotomy
  // --------------------------------------------------------------------------
  TPLO: {
    early: {
      label: 'Early Recovery (Weeks 1–4)',
      goals: 'Reduce swelling, restore passive ROM, initiate controlled weight bearing',
      exercises: ['prom', 'leash-walking', 'weight-shifting']
    },
    mid: {
      label: 'Mid Recovery (Weeks 5–8)',
      goals: 'Build functional strength, improve gait pattern, increase load tolerance',
      exercises: ['sit-to-stand', 'cavaletti-rails', 'incline-walking']
    },
    late: {
      label: 'Late Recovery (Weeks 9–12)',
      goals: 'Return to full function, improve neuromuscular control, sport readiness',
      exercises: ['step-ups', 'figure-8-walking', 'balance-disc']
    }
  },

  // --------------------------------------------------------------------------
  // TTA — Tibial Tuberosity Advancement
  // --------------------------------------------------------------------------
  TTA: {
    early: {
      label: 'Early Recovery (Weeks 1–4)',
      goals: 'Protect surgical repair, restore passive mobility, initiate stance',
      exercises: ['prom', 'leash-walking', 'weight-shifting']
    },
    mid: {
      label: 'Mid Recovery (Weeks 5–8)',
      goals: 'Progressive loading, improve gait symmetry',
      exercises: ['sit-to-stand', 'treadmill-walking', 'incline-walking']
    },
    late: {
      label: 'Late Recovery (Weeks 9–12)',
      goals: 'Functional reintegration, advanced proprioception',
      exercises: ['step-ups', 'figure-8-walking', 'wobble-board']
    }
  },

  // --------------------------------------------------------------------------
  // FHO — Femoral Head Ostectomy
  // --------------------------------------------------------------------------
  FHO: {
    early: {
      label: 'Early Recovery (Weeks 1–3)',
      goals: 'Encourage early weight bearing, reduce disuse atrophy',
      exercises: ['leash-walking', 'weight-shifting', 'prom']
    },
    mid: {
      label: 'Mid Recovery (Weeks 4–8)',
      goals: 'Build hip musculature, improve limb use',
      exercises: ['sit-to-stand', 'incline-walking', 'hip-extension']
    },
    late: {
      label: 'Late Recovery (Weeks 9–12)',
      goals: 'Full functional return, endurance building',
      exercises: ['stair-climbing', 'hill-climbing', 'cavaletti-rails']
    }
  },

  // --------------------------------------------------------------------------
  // IVDD — Intervertebral Disc Disease
  // --------------------------------------------------------------------------
  IVDD: {
    early: {
      label: 'Acute Phase (Weeks 1–3)',
      goals: 'Neurological recovery support, controlled passive movement',
      exercises: ['prom', 'arom', 'leash-walking']
    },
    mid: {
      label: 'Subacute Phase (Weeks 4–7)',
      goals: 'Core stability, proprioception retraining, gait improvement',
      exercises: ['cookie-stretches', 'diagonal-leg-lifts', 'treadmill-walking']
    },
    late: {
      label: 'Chronic/Maintenance Phase (Weeks 8+)',
      goals: 'Core endurance, balance, functional movement',
      exercises: ['sit-pretty', 'wobble-board', 'cavaletti-rails']
    }
  },

  // --------------------------------------------------------------------------
  // HIP_DYSPLASIA — Canine Hip Dysplasia
  // --------------------------------------------------------------------------
  HIP_DYSPLASIA: {
    early: {
      label: 'Initial Phase (Weeks 1–4)',
      goals: 'Pain reduction, improve hip mobility, gentle conditioning',
      exercises: ['underwater-treadmill', 'prom', 'leash-walking']
    },
    mid: {
      label: 'Strengthening Phase (Weeks 5–10)',
      goals: 'Hip stabilizer strengthening, weight distribution',
      exercises: ['sit-to-stand', 'incline-walking', 'hip-extension']
    },
    late: {
      label: 'Maintenance Phase (Ongoing)',
      goals: 'Maintain function, reduce arthritis progression',
      exercises: ['swimming', 'hill-climbing', 'balance-disc']
    }
  },

  // --------------------------------------------------------------------------
  // ELBOW_DYSPLASIA — Elbow Dysplasia / FCP / OCD
  // --------------------------------------------------------------------------
  ELBOW_DYSPLASIA: {
    early: {
      label: 'Post-Op / Early Conservative (Weeks 1–4)',
      goals: 'Restore elbow ROM, reduce swelling, controlled weight bearing',
      exercises: ['prom', 'leash-walking', 'weight-shifting']
    },
    mid: {
      label: 'Strengthening Phase (Weeks 5–8)',
      goals: 'Forelimb load tolerance, proprioception',
      exercises: ['treadmill-walking', 'front-step-ups', 'foam-pad']
    },
    late: {
      label: 'Return to Function (Weeks 9–12)',
      goals: 'Full forelimb use, coordination, endurance',
      exercises: ['wheelbarrow', 'cavaletti-rails', 'obstacle-course']
    }
  }

};

// ============================================================================
// RULE LOOKUP FUNCTION
// Returns the exercise slugs for a given condition + phase
// ============================================================================

function getExerciseSlugsForPhase(condition, phase) {
  const conditionKey = condition.toUpperCase().replace(/[- ]/g, '_');
  const phaseKey = phase.toLowerCase();

  const conditionRules = PROTOCOL_RULES[conditionKey];
  if (!conditionRules) return null;

  const phaseRules = conditionRules[phaseKey];
  if (!phaseRules) return null;

  return {
    condition: conditionKey,
    phase: phaseKey,
    label: phaseRules.label,
    goals: phaseRules.goals,
    slugs: phaseRules.exercises
  };
}

// List all available conditions
function getAvailableConditions() {
  return Object.keys(PROTOCOL_RULES);
}

// List all phases for a condition
function getPhasesForCondition(condition) {
  const conditionKey = condition.toUpperCase().replace(/[- ]/g, '_');
  const rules = PROTOCOL_RULES[conditionKey];
  if (!rules) return null;
  return Object.keys(rules).map(phase => ({
    phase,
    label: rules[phase].label,
    goals: rules[phase].goals
  }));
}

module.exports = {
  PROTOCOL_RULES,
  getExerciseSlugsForPhase,
  getAvailableConditions,
  getPhasesForCondition
};
