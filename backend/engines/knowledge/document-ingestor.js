// ============================================================================
// KNOWLEDGE ENGINE — Document Ingestor
// Parses all clinical source documents into searchable text chunks
// ============================================================================

const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs");

/**
 * Ingest all clinical source documents into text chunks.
 * Sources: canine_rehab_protocols.docx, ALL_EXERCISES, CORE_REFERENCES, exercise-taxonomy, protocol-generator
 * @returns {Array<{ id: string, source: string, section: string, text: string }>}
 */
async function ingestAllDocuments() {
  const chunks = [];

  // ── 1. Source-of-truth DOCX ──
  const docxChunks = await ingestDocx();
  chunks.push(...docxChunks);

  // ── 2. Exercise library ──
  const exerciseChunks = ingestExercises();
  chunks.push(...exerciseChunks);

  // ── 3. Evidence references ──
  const evidenceChunks = ingestEvidenceReferences();
  chunks.push(...evidenceChunks);

  // ── 4. Protocol definitions ──
  const protocolChunks = ingestProtocols();
  chunks.push(...protocolChunks);

  // ── 5. Exercise taxonomy ──
  const taxonomyChunks = ingestTaxonomy();
  chunks.push(...taxonomyChunks);

  console.log(`[Knowledge Engine] Ingested ${chunks.length} chunks from ${new Set(chunks.map(c => c.source)).size} sources`);
  return chunks;
}

/**
 * Parse canine_rehab_protocols.docx into section-based chunks.
 */
async function ingestDocx() {
  const chunks = [];
  const docxPaths = [
    path.join(__dirname, "..", "..", "CanineRehabProtocols", "canine_rehab_protocols.docx"),
    path.join(__dirname, "..", "..", "export", "clinical-source", "canine_rehab_protocols.docx"),
  ];

  let docxPath = null;
  for (const p of docxPaths) {
    if (fs.existsSync(p)) { docxPath = p; break; }
  }

  if (!docxPath) {
    console.warn("[Knowledge Engine] canine_rehab_protocols.docx not found — skipping DOCX ingestion");
    return chunks;
  }

  try {
    const result = await mammoth.extractRawText({ path: docxPath });
    const fullText = result.value;

    // Split by double newlines into paragraphs, then group into ~500 char chunks
    const paragraphs = fullText.split(/\n{2,}/).filter(p => p.trim().length > 20);
    let currentChunk = "";
    let chunkIdx = 0;

    for (const para of paragraphs) {
      if (currentChunk.length + para.length > 800 && currentChunk.length > 100) {
        chunks.push({
          id: `docx_${chunkIdx}`,
          source: "canine_rehab_protocols.docx",
          section: extractSectionTitle(currentChunk),
          text: currentChunk.trim(),
        });
        chunkIdx++;
        currentChunk = "";
      }
      currentChunk += para + "\n\n";
    }

    // Final chunk
    if (currentChunk.trim().length > 20) {
      chunks.push({
        id: `docx_${chunkIdx}`,
        source: "canine_rehab_protocols.docx",
        section: extractSectionTitle(currentChunk),
        text: currentChunk.trim(),
      });
    }

    console.log(`[Knowledge Engine] DOCX: ${chunks.length} chunks from ${docxPath}`);
  } catch (err) {
    console.error("[Knowledge Engine] DOCX parse error:", err.message);
  }

  return chunks;
}

/**
 * Convert each exercise in ALL_EXERCISES into a searchable chunk.
 */
function ingestExercises() {
  const { ALL_EXERCISES } = require("../../all-exercises");
  const chunks = [];

  for (const ex of ALL_EXERCISES) {
    const parts = [
      `Exercise: ${ex.name} (Code: ${ex.code})`,
      `Category: ${ex.category}`,
      `Difficulty: ${ex.difficulty_level || "Moderate"}`,
      ex.description ? `Description: ${ex.description}` : "",
      ex.equipment ? `Equipment: ${Array.isArray(ex.equipment) ? ex.equipment.join(", ") : ex.equipment}` : "",
      ex.contraindications ? `Contraindications: ${ex.contraindications}` : "",
      ex.progression ? `Progression: ${ex.progression}` : "",
      ex.steps ? `Steps: ${Array.isArray(ex.steps) ? ex.steps.join(" → ") : ex.steps}` : "",
      ex.red_flags ? `Red Flags: ${Array.isArray(ex.red_flags) ? ex.red_flags.join("; ") : ex.red_flags}` : "",
      ex.clinical_classification?.intervention_type ? `Intervention: ${ex.clinical_classification.intervention_type}` : "",
      ex.evidence_base?.grade ? `Evidence Grade: ${ex.evidence_base.grade}` : "",
      ex.evidence_base?.references ? `References: ${Array.isArray(ex.evidence_base.references) ? ex.evidence_base.references.join("; ") : ex.evidence_base.references}` : "",
    ].filter(Boolean);

    chunks.push({
      id: `exercise_${ex.code}`,
      source: "exercise_library",
      section: ex.category,
      text: parts.join("\n"),
    });
  }

  console.log(`[Knowledge Engine] Exercises: ${chunks.length} chunks`);
  return chunks;
}

/**
 * Convert evidence references into searchable chunks.
 */
function ingestEvidenceReferences() {
  const chunks = [];

  try {
    const { CORE_REFERENCES } = require("../../evidence-references");
    if (!CORE_REFERENCES) return chunks;

    for (const [key, ref] of Object.entries(CORE_REFERENCES)) {
      const parts = [
        `Reference: ${ref.citation || key}`,
        ref.type ? `Type: ${ref.type}` : "",
        ref.evidence_grade ? `Evidence Grade: ${ref.evidence_grade}` : "",
        ref.topics ? `Topics: ${Array.isArray(ref.topics) ? ref.topics.join(", ") : ref.topics}` : "",
        ref.key_findings ? `Key Findings: ${ref.key_findings}` : "",
        ref.url ? `URL: ${ref.url}` : "",
      ].filter(Boolean);

      chunks.push({
        id: `ref_${key}`,
        source: "evidence_references",
        section: ref.type || "Reference",
        text: parts.join("\n"),
      });
    }

    console.log(`[Knowledge Engine] Evidence refs: ${chunks.length} chunks`);
  } catch (err) {
    console.warn("[Knowledge Engine] Evidence references not loaded:", err.message);
  }

  return chunks;
}

/**
 * Convert protocol definitions into searchable chunks (one per phase).
 */
function ingestProtocols() {
  const chunks = [];

  try {
    const { PROTOCOL_DEFINITIONS } = require("../../protocol-generator");
    if (!PROTOCOL_DEFINITIONS) return chunks;

    for (const [protocolKey, protocol] of Object.entries(PROTOCOL_DEFINITIONS)) {
      // Protocol overview chunk
      chunks.push({
        id: `protocol_${protocolKey}_overview`,
        source: "protocol_definitions",
        section: protocol.name,
        text: `Protocol: ${protocol.name}\nDefault Duration: ${protocol.defaultWeeks} weeks\nPhases: ${protocol.phases.length}\nKey: ${protocolKey}`,
      });

      // One chunk per phase
      for (const phase of protocol.phases) {
        const exerciseCodes = phase.exercises.map(e => `${e.code} (${e.sets}, ${e.frequency})`).join("\n  ");
        chunks.push({
          id: `protocol_${protocolKey}_phase${phase.number}`,
          source: "protocol_definitions",
          section: `${protocol.name} — Phase ${phase.number}`,
          text: [
            `Protocol: ${protocol.name}`,
            `Phase ${phase.number}: ${phase.name} (${phase.weekRange})`,
            `Goal: ${phase.goal}`,
            `Exercises:\n  ${exerciseCodes}`,
            phase.contraindications ? `Contraindications: ${phase.contraindications}` : "",
            phase.progressionCriteria ? `Progression Criteria: ${phase.progressionCriteria}` : "",
          ].filter(Boolean).join("\n"),
        });
      }
    }

    console.log(`[Knowledge Engine] Protocols: ${chunks.length} chunks`);
  } catch (err) {
    console.warn("[Knowledge Engine] Protocol definitions not loaded:", err.message);
  }

  return chunks;
}

/**
 * Convert exercise taxonomy into searchable chunks.
 */
function ingestTaxonomy() {
  const chunks = [];

  try {
    const taxonomy = require("../../exercise-taxonomy");
    if (!taxonomy) return chunks;

    // Intervention types
    if (taxonomy.INTERVENTION_TYPES) {
      for (const [key, val] of Object.entries(taxonomy.INTERVENTION_TYPES)) {
        chunks.push({
          id: `taxonomy_intervention_${key}`,
          source: "exercise_taxonomy",
          section: "Intervention Types",
          text: `Intervention Type: ${val.name || key}\nDescription: ${val.description || ""}\nCPT Code: ${val.cpt_code || "N/A"}\nSubcategories: ${val.subcategories ? val.subcategories.join(", ") : "N/A"}`,
        });
      }
    }

    // Rehab phases
    if (taxonomy.REHAB_PHASES) {
      for (const [key, val] of Object.entries(taxonomy.REHAB_PHASES)) {
        chunks.push({
          id: `taxonomy_phase_${key}`,
          source: "exercise_taxonomy",
          section: "Rehabilitation Phases",
          text: `Rehab Phase: ${val.name || key}\nTimeframe: ${val.timeframe || "N/A"}\nGoals: ${val.goals || "N/A"}\nContraindications: ${val.contraindications || "N/A"}`,
        });
      }
    }

    // Evidence grades
    if (taxonomy.EVIDENCE_GRADES) {
      for (const [key, val] of Object.entries(taxonomy.EVIDENCE_GRADES)) {
        chunks.push({
          id: `taxonomy_evidence_${key}`,
          source: "exercise_taxonomy",
          section: "Evidence Grades",
          text: `Evidence Grade ${key}: ${val.name || ""}\nDefinition: ${val.definition || ""}\nConfidence: ${val.confidence || ""}\nRecommendation: ${val.recommendation || ""}`,
        });
      }
    }

    console.log(`[Knowledge Engine] Taxonomy: ${chunks.length} chunks`);
  } catch (err) {
    console.warn("[Knowledge Engine] Taxonomy not loaded:", err.message);
  }

  return chunks;
}

/**
 * Extract a rough section title from the first line of a chunk.
 */
function extractSectionTitle(text) {
  const firstLine = text.trim().split("\n")[0].trim();
  return firstLine.length > 80 ? firstLine.slice(0, 80) + "..." : firstLine;
}

module.exports = { ingestAllDocuments };
