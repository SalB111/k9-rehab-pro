// ============================================================================
// EVIDENCE ENGINE — Citation Formatter
// Formats PubMed results into the citation style used by K9 Rehab Pro
// ============================================================================

/**
 * Format a PubMed article into a clinical citation string.
 * @param {{ pmid: string, title: string, authors: string, journal: string, year: string }} article
 * @returns {string} Formatted citation
 */
function formatCitation(article) {
  const parts = [];
  if (article.authors) parts.push(article.authors);
  if (article.title) parts.push(`"${article.title}"`);
  if (article.journal) parts.push(article.journal);
  if (article.year) parts.push(article.year);
  return parts.join(". ") + ".";
}

/**
 * Format a PubMed article into a markdown citation with link.
 * @param {{ pmid: string, title: string, authors: string, journal: string, year: string }} article
 * @param {{ grade: string, label: string }} grading
 * @returns {string} Markdown-formatted citation
 */
function formatMarkdownCitation(article, grading) {
  const link = `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`;
  const authorLine = article.authors || "Unknown";
  const journalLine = article.journal ? `*${article.journal}*` : "";
  const yearLine = article.year || "";
  const gradeBadge = `[Grade ${grading.grade}: ${grading.label}]`;

  return `- **${article.title}** ${gradeBadge}\n  ${authorLine}. ${journalLine} ${yearLine}. [PubMed](${link})`;
}

/**
 * Format multiple articles into a context block for B.E.A.U.'s system prompt.
 * @param {Array<{ article: Object, grading: Object }>} gradedArticles
 * @returns {string}
 */
function formatEvidenceContext(gradedArticles) {
  if (gradedArticles.length === 0) return "";

  const citations = gradedArticles.map(({ article, grading }) =>
    formatMarkdownCitation(article, grading)
  );

  return `## PubMed Evidence (live search results)
The following peer-reviewed articles were retrieved from PubMed. Cite these when relevant. Include the evidence grade.

${citations.join("\n\n")}`;
}

module.exports = { formatCitation, formatMarkdownCitation, formatEvidenceContext };
