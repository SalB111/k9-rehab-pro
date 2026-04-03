// ============================================================================
// PRESENTATION ENGINE — Slide Schemas
// 8 slide types for clinical presentation generation
// ============================================================================

const SLIDE_TYPES = {
  title: {
    required: ["title"],
    optional: ["subtitle", "date", "author", "logo"],
    description: "Title slide with presentation name, subtitle, date",
  },
  patient_overview: {
    required: ["patientName", "diagnosis"],
    optional: ["breed", "age", "weight", "painScore", "mobility", "surgeryDate", "phase"],
    description: "Patient demographics and clinical status",
  },
  exercise_card: {
    required: ["exerciseName", "code"],
    optional: ["category", "sets", "frequency", "progression", "evidenceGrade", "contraindications"],
    description: "Single exercise detail card with dosing and evidence",
  },
  progress_chart: {
    required: ["title", "chartType"],
    optional: ["data", "xAxis", "series"],
    description: "Embeds a chart (pain scores, ROM, lameness over time)",
  },
  evidence_summary: {
    required: ["title", "citations"],
    optional: ["summary"],
    description: "Evidence citations with grades and key findings",
  },
  phase_comparison: {
    required: ["title", "phases"],
    optional: ["protocol"],
    description: "Side-by-side phase comparison with exercises and criteria",
  },
  before_after: {
    required: ["title", "before", "after"],
    optional: ["metrics"],
    description: "Two-column before/after metric comparison",
  },
  conclusion: {
    required: ["title"],
    optional: ["recommendations", "nextSteps", "disclaimer"],
    description: "Summary slide with recommendations and next steps",
  },
};

function validateSlide(slide) {
  const schema = SLIDE_TYPES[slide?.type];
  if (!schema) return { valid: false, errors: [`Unknown slide type: ${slide?.type}`] };
  const errors = schema.required.filter(f => !slide[f]).map(f => `Missing: ${f}`);
  return { valid: errors.length === 0, errors };
}

module.exports = { SLIDE_TYPES, validateSlide };
