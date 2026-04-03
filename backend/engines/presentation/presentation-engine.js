// ============================================================================
// PRESENTATION ENGINE — Orchestrator (Gamma AI Clone)
// Generates slide decks from natural language with patient data binding
// ============================================================================

const Anthropic = require("@anthropic-ai/sdk");
const { SLIDE_TYPES } = require("./slide-schemas");

const client = new Anthropic();

let knowledgeEngine = null;

function initialize(knowledge) {
  knowledgeEngine = knowledge;
  console.log("[Presentation Engine] Initialized");
}

/**
 * Generate a slide deck from a natural language prompt.
 * @param {string} prompt — User's request (e.g., "Create a case presentation for Patron")
 * @param {Object} patient — Patient data
 * @returns {Promise<{ title: string, slides: Array<Object> }>}
 */
async function generatePresentation(prompt, patient) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("B.E.A.U. is not configured. Set ANTHROPIC_API_KEY.");
  }

  let context = "";
  if (knowledgeEngine?.isReady() && patient) {
    const condition = patient.condition || patient.diagnosis || "";
    const results = knowledgeEngine.search(condition, 4);
    if (results.length > 0) {
      context = "\n\nSource context:\n" + results.map(r => r.chunk.text.slice(0, 300)).join("\n---\n");
    }
  }

  const patientBlock = patient ? `
Patient: ${patient.name || "Unknown"}, ${patient.breed || ""}, ${patient.age || ""} years, ${patient.weight || ""} lbs
Diagnosis: ${patient.diagnosis || patient.condition || "Not specified"}
Pain: ${patient.pain_level || patient.painLevel || "N/A"}/10
Mobility: ${patient.mobility_level || patient.mobilityLevel || "N/A"}
Surgery: ${patient.surgery_date || patient.surgeryDate || "N/A"}` : "";

  const slideTypeList = Object.entries(SLIDE_TYPES)
    .map(([key, s]) => `- ${key}: ${s.description} (required: ${s.required.join(", ")})`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `You are B.E.A.U. generating a clinical presentation for K9 Rehab Pro.
No hallucinated exercises. Only reference exercises from the K9 Rehab Pro library.
End with CDSS disclaimer.${context}${patientBlock}`,
    messages: [{
      role: "user",
      content: `Generate a slide deck for: "${prompt}"

Output ONLY valid JSON with this structure:
{
  "title": "Presentation Title",
  "slides": [
    { "type": "slide_type", ...fields }
  ]
}

Available slide types:
${slideTypeList}

Generate 6-12 slides. Use real exercise codes, evidence citations, and patient data. Include a title slide and conclusion slide.`,
    }],
  });

  const text = response.content[0]?.text || "";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to generate presentation structure");

  const deck = JSON.parse(jsonMatch[0]);
  return deck;
}

/**
 * Get presentation instructions for the system prompt.
 */
function getPresentationInstructions() {
  return `## PRESENTATION GENERATION CAPABILITY
When the user asks to create a presentation, slide deck, or slides, you can emit a presentation block.

Format: Wrap the JSON in :::presentation and ::: markers. Example:

:::presentation
{"title":"TPLO Recovery — Bo","slides":[{"type":"title","title":"TPLO Post-Op Recovery","subtitle":"Bo — Golden Retriever, 5 yr","date":"2026-04-02"},{"type":"patient_overview","patientName":"Bo","diagnosis":"TPLO Left Stifle","breed":"Golden Retriever","age":"5","weight":"75","painScore":"3/10","phase":"Phase 2"},{"type":"conclusion","title":"Summary","recommendations":["Continue Phase 2 exercises","Reassess at week 6","Progress to Phase 3 if gates met"]}]}
:::

Available slide types: ${Object.keys(SLIDE_TYPES).join(", ")}

Trigger phrases: "create a presentation", "make slides", "slide deck", "case presentation slides"`;
}

function isReady() { return !!process.env.ANTHROPIC_API_KEY; }
function getStatus() { return { ready: isReady(), slideTypes: Object.keys(SLIDE_TYPES) }; }

module.exports = { initialize, generatePresentation, getPresentationInstructions, isReady, getStatus };
