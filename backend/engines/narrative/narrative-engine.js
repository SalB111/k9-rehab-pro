// ============================================================================
// NARRATIVE ENGINE — Orchestrator (Tome AI Clone)
// Generates structured clinical documents grounded in Knowledge + Evidence
// ============================================================================

const Anthropic = require("@anthropic-ai/sdk");
const { getTemplate, getTemplateList } = require("./document-templates");

const client = new Anthropic();

// Engine references — set during initialization
let knowledgeEngine = null;
let evidenceEngine = null;

/**
 * Initialize with references to other engines.
 */
function initialize(knowledge, evidence) {
  knowledgeEngine = knowledge;
  evidenceEngine = evidence;
  console.log("[Narrative Engine] Initialized with Knowledge + Evidence engine references");
}

/**
 * Generate a structured clinical document.
 * @param {string} templateType — Template key (progress_report, case_narrative, etc.)
 * @param {Object} patient — Patient data
 * @param {string} additionalInstructions — Optional user instructions
 * @returns {Promise<{ type: string, title: string, sections: Array<{ heading: string, content: string }>, metadata: Object }>}
 */
async function generateDocument(templateType, patient, additionalInstructions = "") {
  const template = getTemplate(templateType);
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}. Available: ${getTemplateList().map(t => t.key).join(", ")}`);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("B.E.A.U. is not configured. Set ANTHROPIC_API_KEY.");
  }

  // Gather context from Knowledge Engine
  let knowledgeContext = "";
  if (knowledgeEngine?.isReady()) {
    const condition = patient?.condition || patient?.diagnosis || templateType;
    const results = knowledgeEngine.search(condition, 5);
    if (results.length > 0) {
      knowledgeContext = "\n\n## Source Context (from K9 Rehab Pro knowledge base)\n" +
        results.map(r => r.chunk.text.slice(0, 400)).join("\n---\n");
    }
  }

  // Build patient context
  const patientContext = patient ? `
## Patient Data
- Name: ${patient.name || "Unknown"}
- Breed: ${patient.breed || "Not specified"}
- Age: ${patient.age || "Unknown"}
- Weight: ${patient.weight || "Unknown"} lbs
- Diagnosis: ${patient.diagnosis || patient.condition || "Not specified"}
- Affected Region: ${patient.affected_region || patient.affectedRegion || "Not specified"}
- Pain Level: ${patient.pain_level || patient.painLevel || "Not assessed"}
- Mobility: ${patient.mobility_level || patient.mobilityLevel || "Not assessed"}
- Surgery Date: ${patient.surgery_date || patient.surgeryDate || "N/A"}
- Medications: ${patient.current_medications || patient.medications || "None"}
- Notes: ${patient.notes || patient.special_instructions || "None"}` : "";

  // Build the generation prompt
  const systemPrompt = `You are B.E.A.U. — the Biomedical Evidence-Based Assessment Utility — generating a ${template.name} for K9 Rehab Pro.

You must follow these rules:
- No hallucinated exercises. Only reference exercises from the K9 Rehab Pro library.
- No fabricated clinical data. Use only what is provided in patient data and source context.
- All evidence citations must reference real sources (Millis & Levine, Zink & Van Dyke, or PubMed).
- Never diagnose, prescribe medication, or make prognosis predictions.
- End clinical documents with: "This document must be reviewed and approved by a licensed veterinarian."
${knowledgeContext}${patientContext}`;

  const userPrompt = `${template.prompt}

${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ""}

Output the document as structured markdown with clear section headings matching these sections: ${template.sections.join(", ")}.

After the document content, output a JSON metadata block wrapped in :::metadata and ::: markers:
:::metadata
{"type":"${templateType}","title":"[document title]","sections":[${template.sections.map(s => `"${s}"`).join(",")}],"generated_at":"${new Date().toISOString()}"}
:::`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = response.content[0]?.text || "";

  // Parse sections from markdown
  const sections = parseSections(responseText, template.sections);

  return {
    type: templateType,
    templateName: template.name,
    title: `${template.name} — ${patient?.name || "Patient"}`,
    sections,
    rawMarkdown: responseText,
    metadata: {
      type: templateType,
      patient: patient?.name,
      generated_at: new Date().toISOString(),
    },
  };
}

/**
 * Parse markdown response into structured sections.
 */
function parseSections(markdown, expectedSections) {
  const sections = [];
  const lines = markdown.split("\n");
  let currentHeading = null;
  let currentContent = [];

  for (const line of lines) {
    // Stop at metadata block
    if (line.trim() === ":::metadata") break;

    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      // Save previous section
      if (currentHeading) {
        sections.push({ heading: currentHeading, content: currentContent.join("\n").trim() });
      }
      currentHeading = headingMatch[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentHeading) {
    sections.push({ heading: currentHeading, content: currentContent.join("\n").trim() });
  }

  return sections;
}

/**
 * Get narrative generation instructions for the system prompt.
 */
function getNarrativeInstructions() {
  return `## DOCUMENT GENERATION CAPABILITY
When the user asks you to write a report, letter, handout, case narrative, or lecture outline, you can generate a structured clinical document.

Format: Wrap the document in :::document and ::: markers. Example:

:::document
{"type":"progress_report","title":"Progress Report — Bo","sections":[{"heading":"Patient Summary","content":"Bo is a 5-year-old..."},{"heading":"Current Phase","content":"Phase 2: Early Mobilization..."}]}
:::

Available document types:
${getTemplateList().map(t => `- **${t.key}**: ${t.description}`).join("\n")}

Trigger phrases: "write a report", "generate a referral", "create a handout", "case presentation", "progress report", "lecture outline"

When generating documents, include real exercise codes, evidence citations, and patient-specific data. End with the veterinary review disclaimer.`;
}

function isReady() { return !!process.env.ANTHROPIC_API_KEY; }

function getStatus() {
  return {
    ready: isReady(),
    templates: getTemplateList().map(t => t.key),
    has_knowledge: !!knowledgeEngine?.isReady(),
    has_evidence: !!evidenceEngine?.isReady(),
  };
}

module.exports = {
  initialize,
  generateDocument,
  getNarrativeInstructions,
  getTemplateList,
  isReady,
  getStatus,
};
