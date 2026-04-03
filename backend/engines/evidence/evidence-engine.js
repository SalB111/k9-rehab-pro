// ============================================================================
// EVIDENCE ENGINE — Orchestrator (Consensus AI Clone)
// Searches PubMed, grades evidence, formats citations, feeds Knowledge Engine
// ============================================================================

const { searchPubMed } = require("./pubmed-client");
const { gradeEvidence } = require("./evidence-grader");
const { formatEvidenceContext } = require("./citation-formatter");

// In-memory cache with 1-hour TTL
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Research keywords that trigger PubMed search
const RESEARCH_KEYWORDS = [
  "research", "studies", "study", "evidence", "literature",
  "published", "rct", "trial", "peer-reviewed", "pubmed",
  "journal", "citation", "reference", "meta-analysis",
  "systematic review", "what does the research say",
  "is there evidence", "latest findings",
];

/**
 * Search PubMed for evidence related to a query.
 * Results are graded, formatted, and cached.
 * @param {string} query
 * @param {number} maxResults
 * @returns {Promise<{ articles: Array, context: string }>}
 */
async function searchEvidence(query, maxResults = 5) {
  // Check cache
  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Add veterinary context to improve result relevance
  const vetQuery = query.includes("canine") || query.includes("dog") || query.includes("veterinary")
    ? query
    : `${query} canine veterinary`;

  const articles = await searchPubMed(vetQuery, maxResults);

  // Grade each article
  const gradedArticles = articles.map(article => ({
    article,
    grading: gradeEvidence(article),
  }));

  // Sort by evidence grade (A > B > C > EO)
  const gradeOrder = { A: 0, B: 1, C: 2, EO: 3 };
  gradedArticles.sort((a, b) =>
    (gradeOrder[a.grading.grade] || 4) - (gradeOrder[b.grading.grade] || 4)
  );

  // Format context for B.E.A.U. prompt injection
  const context = formatEvidenceContext(gradedArticles);

  const result = { articles: gradedArticles, context };

  // Cache result
  cache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

/**
 * Chat pipeline hook — triggered when the user's query contains research keywords.
 * Returns formatted evidence context for injection into B.E.A.U.'s system prompt.
 * @param {string} query — User's message
 * @param {Object|null} patient — Patient context
 * @returns {Promise<string|null>}
 */
async function evidenceHook(query, patient) {
  const queryLower = query.toLowerCase();

  // Only trigger for research-related queries
  const isResearchQuery = RESEARCH_KEYWORDS.some(kw => queryLower.includes(kw));
  if (!isResearchQuery) return null;

  try {
    // Extract the clinical topic from the query
    const cleanQuery = query
      .replace(/what does the research say about/i, "")
      .replace(/is there evidence for/i, "")
      .replace(/what are the latest findings on/i, "")
      .replace(/show me studies on/i, "")
      .trim();

    // Add patient context if available
    let searchQuery = cleanQuery;
    if (patient) {
      const condition = patient.condition || patient.diagnosis;
      if (condition && !cleanQuery.toLowerCase().includes(condition.toLowerCase())) {
        searchQuery += ` ${condition}`;
      }
    }

    const { context } = await searchEvidence(searchQuery, 4);
    return context || null;
  } catch (err) {
    console.error("[Evidence Engine] Hook error:", err.message);
    return null;
  }
}

/**
 * Feed PubMed results back into the Knowledge Engine.
 * @param {Array<{ article: Object, grading: Object }>} gradedArticles
 * @param {Function} addChunksFn — knowledgeEngine.addChunks
 */
function injectIntoKnowledge(gradedArticles, addChunksFn) {
  if (!addChunksFn || gradedArticles.length === 0) return;

  const chunks = gradedArticles.map(({ article, grading }) => ({
    id: `pubmed_${article.pmid}`,
    source: "pubmed",
    section: `${grading.grade}: ${article.journal || "PubMed"}`,
    text: [
      `PubMed PMID: ${article.pmid}`,
      `Title: ${article.title}`,
      `Authors: ${article.authors}`,
      `Journal: ${article.journal} (${article.year})`,
      `Evidence Grade: ${grading.grade} (${grading.label})`,
      article.abstract ? `Abstract: ${article.abstract.slice(0, 500)}` : "",
    ].filter(Boolean).join("\n"),
  }));

  addChunksFn(chunks);
}

/**
 * Check if the Evidence Engine is ready (always ready — no init needed).
 */
function isReady() {
  return true;
}

/**
 * Get engine status.
 */
function getStatus() {
  return {
    ready: true,
    cached_queries: cache.size,
    research_keywords: RESEARCH_KEYWORDS.length,
  };
}

module.exports = {
  searchEvidence,
  evidenceHook,
  injectIntoKnowledge,
  isReady,
  getStatus,
};
