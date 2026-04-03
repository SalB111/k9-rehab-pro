// ============================================================================
// DIAGRAM ENGINE — Schema Definitions
// Validates structured JSON that B.E.A.U. emits for frontend rendering
// ============================================================================

const DIAGRAM_TYPES = {
  line_chart: {
    required: ["title", "xAxis", "series"],
    description: "Line chart for tracking metrics over time (pain, ROM, lameness)",
  },
  bar_chart: {
    required: ["title", "categories", "series"],
    description: "Bar chart for comparing values across categories",
  },
  comparison_table: {
    required: ["title", "columns", "rows"],
    description: "Structured table for phase/protocol comparison",
  },
  gauge: {
    required: ["title", "value", "max"],
    description: "Single-metric gauge (pain score, ROM percentage)",
  },
  timeline: {
    required: ["title", "events"],
    description: "Vertical timeline for rehab phase progression",
  },
  flowchart: {
    required: ["title", "nodes", "edges"],
    description: "Decision tree or clinical pathway flowchart",
  },
  decision_tree: {
    required: ["title", "nodes", "edges"],
    description: "Clinical decision tree with condition branching",
  },
};

/**
 * Validate a diagram JSON object against its schema.
 * @param {Object} diagram — { type, ...data }
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateDiagram(diagram) {
  const errors = [];

  if (!diagram || typeof diagram !== "object") {
    return { valid: false, errors: ["Diagram must be an object"] };
  }

  if (!diagram.type || !DIAGRAM_TYPES[diagram.type]) {
    return { valid: false, errors: [`Unknown diagram type: ${diagram.type}. Valid: ${Object.keys(DIAGRAM_TYPES).join(", ")}`] };
  }

  const schema = DIAGRAM_TYPES[diagram.type];
  for (const field of schema.required) {
    if (diagram[field] === undefined || diagram[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { DIAGRAM_TYPES, validateDiagram };
