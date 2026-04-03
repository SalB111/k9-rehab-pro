// ============================================================================
// KNOWLEDGE ENGINE — Orchestrator (NotebookLM Clone)
// Grounds B.E.A.U. in source documents via TF-IDF RAG
// ============================================================================

const { ingestAllDocuments } = require("./document-ingestor");
const ChunkStore = require("./chunk-store");

const store = new ChunkStore();
let initialized = false;

/**
 * Initialize the Knowledge Engine — ingest all documents and build the search index.
 * Called once on server startup.
 */
async function initialize() {
  if (initialized) return;

  try {
    console.log("[Knowledge Engine] Initializing...");
    const chunks = await ingestAllDocuments();
    store.buildIndex(chunks);
    initialized = true;
    console.log(`[Knowledge Engine] Ready — ${store.getStatus().chunks} chunks indexed`);
  } catch (err) {
    console.error("[Knowledge Engine] Initialization failed:", err.message);
  }
}

/**
 * Get relevant context for a user query.
 * Returns a formatted string to inject into B.E.A.U.'s system prompt.
 * @param {string} query — The user's message
 * @param {Object|null} patient — Patient context (used for additional search terms)
 * @returns {string|null} — Formatted context block or null if nothing relevant
 */
function getRelevantContext(query, patient = null) {
  if (!initialized || !store.ready) return null;

  // Enhance query with patient context for better matching
  let searchQuery = query;
  if (patient) {
    const extras = [
      patient.condition || patient.diagnosis,
      patient.affected_region || patient.affectedRegion,
      patient.breed,
    ].filter(Boolean);
    if (extras.length > 0) {
      searchQuery += " " + extras.join(" ");
    }
  }

  const results = store.search(searchQuery, 6);
  if (results.length === 0) return null;

  // Format results into a context block
  const contextLines = results.map((r, i) => {
    const src = r.chunk.source === "exercise_library" ? "Exercise Library"
      : r.chunk.source === "evidence_references" ? "Evidence Reference"
      : r.chunk.source === "protocol_definitions" ? "Protocol Definition"
      : r.chunk.source === "exercise_taxonomy" ? "Exercise Taxonomy"
      : r.chunk.source;

    return `### Source ${i + 1} [${src}] (relevance: ${(r.score * 100).toFixed(0)}%)
${r.chunk.text.slice(0, 600)}${r.chunk.text.length > 600 ? "..." : ""}`;
  });

  return `## Relevant Clinical Context (from K9 Rehab Pro knowledge base)
The following information was retrieved from verified source documents. Use this to ground your response. Cite these sources when applicable.

${contextLines.join("\n\n")}`;
}

/**
 * Add new chunks to the knowledge base (e.g., from Evidence Engine).
 * @param {Array<{ id: string, source: string, section: string, text: string }>} newChunks
 */
function addChunks(newChunks) {
  if (!initialized) return;
  store.addChunks(newChunks);
}

/**
 * Direct search (for API endpoint or debugging).
 * @param {string} query
 * @param {number} topK
 * @returns {Array<{ chunk: Object, score: number }>}
 */
function search(query, topK = 10) {
  if (!initialized) return [];
  return store.search(query, topK);
}

/**
 * Check if the Knowledge Engine is ready.
 */
function isReady() {
  return initialized && store.ready;
}

/**
 * Get engine status.
 */
function getStatus() {
  return {
    ready: isReady(),
    ...store.getStatus(),
  };
}

module.exports = {
  initialize,
  getRelevantContext,
  addChunks,
  search,
  isReady,
  getStatus,
};
