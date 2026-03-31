const loadBEAUBrain = require("./beauBrain");

// Hard-coded safety rules for now — later these can be JSON files
const SAFETY_RULES = {
  species: {
    canine: {
      forbiddenExercises: ["FELINE-PROM", "FELINE-PAW-REACH"]
    },
    feline: {
      forbiddenExercises: ["SIT-TO-STAND", "CAVALETTI", "STAIRS-RAMP"]
    }
  },

  conditions: {
    "post-tplo": {
      forbidden: ["STAIRS-RAMP", "CAVALETTI"],
      redFlags: [
        "Non-weight-bearing lameness",
        "Incision swelling or discharge",
        "Acute yelping during movement"
      ]
    },
    "ivdd-conservative": {
      forbidden: ["STAIRS-RAMP", "CAVALETTI", "SIT-TO-STAND"],
      redFlags: [
        "Loss of bladder control",
        "Dragging limbs",
        "Sudden worsening of pain"
      ]
    }
  },

  phases: {
    "week1-2": {
      forbidden: ["CAVALETTI", "STAIRS-RAMP", "HYDRO-LIGHT"]
    },
    "week3-6": {
      forbidden: ["HYDRO-LIGHT"]
    }
  }
};

function applySafety(protocol, BEAU) {
  const speciesRules = SAFETY_RULES.species[protocol.species] || {};
  const conditionRules = SAFETY_RULES.conditions[protocol.condition] || {};
  const phaseRules = SAFETY_RULES.phases;

  const safePhases = {};
  const removed = [];

  for (const [phaseKey, phase] of Object.entries(protocol.phases)) {
    const forbiddenForPhase = phaseRules[phaseKey]?.forbidden || [];
    const forbiddenForSpecies = speciesRules.forbiddenExercises || [];
    const forbiddenForCondition = conditionRules.forbidden || [];

    const forbidden = new Set([
      ...forbiddenForPhase,
      ...forbiddenForSpecies,
      ...forbiddenForCondition
    ]);

    const safeExercises = [];
    const removedExercises = [];

    for (const ex of phase.exercises) {
      if (forbidden.has(ex.id)) {
        removedExercises.push({
          id: ex.id,
          reason: determineReason(ex.id, {
            forbiddenForPhase,
            forbiddenForSpecies,
            forbiddenForCondition
          })
        });
      } else {
        safeExercises.push(ex);
      }
    }

    safePhases[phaseKey] = {
      label: phase.label,
      exercises: safeExercises
    };

    if (removedExercises.length > 0) {
      removed.push({
        phase: phaseKey,
        removed: removedExercises
      });
    }
  }

  return {
    protocolId: protocol.protocolId,
    species: protocol.species,
    condition: protocol.condition,
    version: protocol.version,
    hash: protocol.hash,
    safePhases,
    removed,
    redFlags: conditionRules.redFlags || []
  };
}

function determineReason(exId, ruleSets) {
  if (ruleSets.forbiddenForPhase.includes(exId)) return "Unsafe for this phase";
  if (ruleSets.forbiddenForSpecies.includes(exId)) return "Not appropriate for this species";
  if (ruleSets.forbiddenForCondition.includes(exId)) return "Contraindicated for this condition";
  return "Removed by safety rules";
}

function getSafeProtocol(protocolId) {
  const BEAU = loadBEAUBrain();
  const protocol = BEAU.getProtocol(protocolId);

  if (!protocol) {
    return {
      error: `Protocol ${protocolId} not found`
    };
  }

  return applySafety(protocol, BEAU);
}

module.exports = {
  getSafeProtocol
};