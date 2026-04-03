// ============================================================================
// DIAGRAM ENGINE — Orchestrator (Napkin AI Clone)
// Validates diagram JSON from B.E.A.U. responses before frontend rendering
// ============================================================================

const { validateDiagram, DIAGRAM_TYPES } = require("./diagram-schemas");

/**
 * Validate a diagram object and return it if valid.
 * @param {Object} diagram
 * @returns {{ valid: boolean, diagram?: Object, errors?: string[] }}
 */
function processDiagram(diagram) {
  const { valid, errors } = validateDiagram(diagram);
  if (!valid) {
    console.warn("[Diagram Engine] Invalid diagram:", errors);
    return { valid: false, errors };
  }
  return { valid: true, diagram };
}

/**
 * Get available diagram types for the system prompt.
 */
function getDiagramInstructions() {
  return `## DIAGRAM OUTPUT CAPABILITY
When the user asks for a visual comparison, timeline, chart, flowchart, or decision tree, you can emit a diagram block.

Format: Wrap the JSON in :::diagram and ::: markers within your response. Example:

:::diagram
{"type":"timeline","title":"TPLO Recovery Timeline","events":[...]}
:::

Available diagram types:
${Object.entries(DIAGRAM_TYPES).map(([key, val]) => `- **${key}**: ${val.description}. Required fields: ${val.required.join(", ")}`).join("\n")}

### Schema Examples:

**line_chart**: {"type":"line_chart","title":"Pain Score Progress","xAxis":["Week 1","Week 2","Week 3","Week 4"],"series":[{"name":"Pain","data":[7,5,4,3],"color":"#A32D2D"}]}

**bar_chart**: {"type":"bar_chart","title":"Exercise Distribution","categories":["Passive","Active","Strength","Aquatic"],"series":[{"name":"Count","data":[5,8,6,3]}]}

**comparison_table**: {"type":"comparison_table","title":"TPLO vs OA Protocol","columns":["Feature","TPLO","OA"],"rows":[["Duration","16 weeks","16 weeks"],["Phases","4","4"],["Aquatic Start","Phase 3","Phase 2"]]}

**gauge**: {"type":"gauge","title":"Pain Score","value":3,"max":10,"thresholds":[{"value":3,"color":"#1D9E75","label":"Mild"},{"value":6,"color":"#BA7517","label":"Moderate"},{"value":10,"color":"#A32D2D","label":"Severe"}]}

**timeline**: {"type":"timeline","title":"TPLO Recovery Phases","events":[{"label":"Phase 1: Acute Protection","start":"Week 0","end":"Week 2","description":"Pain control, passive ROM","color":"#0EA5E9"},{"label":"Phase 2: Early Mobilization","start":"Week 2","end":"Week 6","description":"Weight bearing, active ROM","color":"#1D9E75"}]}

**flowchart**: {"type":"flowchart","title":"Pain Assessment Pathway","nodes":[{"id":"1","label":"Pain Score","type":"decision"},{"id":"2","label":"< 3: Continue Protocol","type":"action"},{"id":"3","label":">= 7: Specialist Consult","type":"alert"},{"id":"4","label":"3-6: Modify Intensity","type":"action"}],"edges":[{"from":"1","to":"2","label":"Low"},{"from":"1","to":"3","label":"High"},{"from":"1","to":"4","label":"Moderate"}]}

Only emit diagrams when they add clinical value. Do not force diagrams into every response.`;
}

function isReady() { return true; }
function getStatus() { return { ready: true, types: Object.keys(DIAGRAM_TYPES) }; }

module.exports = { processDiagram, getDiagramInstructions, isReady, getStatus };
