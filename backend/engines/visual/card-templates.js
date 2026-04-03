// ============================================================================
// VISUAL ENGINE — Card Templates
// 4 card types for exercise instructions, anatomy, timelines, progressions
// ============================================================================

const CARD_TYPES = {
  exercise_instruction: {
    required: ["exerciseName", "code"],
    optional: ["steps", "equipment", "formCues", "redFlags", "sets", "frequency", "difficulty", "category"],
    description: "Exercise instruction card with steps, equipment, and form cues",
  },
  anatomy_diagram: {
    required: ["title", "structures"],
    optional: ["region", "condition", "labels", "highlights"],
    description: "Anatomical diagram with labeled structures and affected regions",
  },
  recovery_timeline: {
    required: ["title", "phases"],
    optional: ["patient", "totalWeeks", "currentPhase"],
    description: "Visual recovery timeline infographic showing all phases",
  },
  exercise_progression: {
    required: ["title", "exercises"],
    optional: ["currentLevel", "condition"],
    description: "Progression path showing current to advanced exercises",
  },
};

function validateCard(card) {
  const schema = CARD_TYPES[card?.type];
  if (!schema) return { valid: false, errors: [`Unknown card type: ${card?.type}`] };
  const errors = schema.required.filter(f => !card[f]).map(f => `Missing: ${f}`);
  return { valid: errors.length === 0, errors };
}

module.exports = { CARD_TYPES, validateCard };
