// ============================================================================
// KNOWLEDGE ENGINE — TF-IDF Chunk Store
// In-memory search index for clinical document chunks
// ============================================================================

/**
 * TF-IDF search index for text chunks.
 * Supports: buildIndex, search (cosine similarity), addChunks
 */
class ChunkStore {
  constructor() {
    this.chunks = [];          // Array of { id, source, section, text }
    this.termFreqs = [];       // Per-document term frequency vectors
    this.idf = {};             // Inverse document frequency per term
    this.terms = new Set();    // All unique terms
    this.ready = false;
  }

  /**
   * Build the TF-IDF index from an array of chunks.
   * @param {Array<{ id: string, source: string, section: string, text: string }>} chunks
   */
  buildIndex(chunks) {
    this.chunks = chunks;
    this.termFreqs = [];
    this.idf = {};
    this.terms = new Set();

    // Compute term frequencies per document
    const docCount = chunks.length;
    const docFreq = {}; // How many docs contain each term

    for (const chunk of chunks) {
      const tokens = tokenize(chunk.text);
      const tf = {};

      for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
        this.terms.add(token);
      }

      // Normalize TF by document length
      const maxFreq = Math.max(...Object.values(tf), 1);
      const normalizedTf = {};
      for (const [term, count] of Object.entries(tf)) {
        normalizedTf[term] = count / maxFreq;
      }

      this.termFreqs.push(normalizedTf);

      // Track document frequency
      for (const term of Object.keys(tf)) {
        docFreq[term] = (docFreq[term] || 0) + 1;
      }
    }

    // Compute IDF
    for (const [term, df] of Object.entries(docFreq)) {
      this.idf[term] = Math.log(docCount / (1 + df));
    }

    this.ready = true;
    console.log(`[Knowledge Engine] Index built: ${chunks.length} chunks, ${this.terms.size} unique terms`);
  }

  /**
   * Search the index for the most relevant chunks.
   * @param {string} query — Search query text
   * @param {number} topK — Number of results to return (default 5)
   * @returns {Array<{ chunk: Object, score: number }>}
   */
  search(query, topK = 5) {
    if (!this.ready || this.chunks.length === 0) return [];

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    // Build query TF-IDF vector
    const queryTf = {};
    for (const token of queryTokens) {
      queryTf[token] = (queryTf[token] || 0) + 1;
    }
    const maxQueryFreq = Math.max(...Object.values(queryTf), 1);
    const queryVector = {};
    for (const [term, count] of Object.entries(queryTf)) {
      queryVector[term] = (count / maxQueryFreq) * (this.idf[term] || 0);
    }

    // Score each document via cosine similarity
    const scores = [];

    for (let i = 0; i < this.chunks.length; i++) {
      const docTf = this.termFreqs[i];

      // Build doc TF-IDF vector (only for query terms — sparse computation)
      let dotProduct = 0;
      let docMagnitude = 0;
      let queryMagnitude = 0;

      for (const term of Object.keys(queryVector)) {
        const qVal = queryVector[term];
        const dVal = (docTf[term] || 0) * (this.idf[term] || 0);
        dotProduct += qVal * dVal;
        queryMagnitude += qVal * qVal;
      }

      // Only compute doc magnitude for matched terms
      for (const term of Object.keys(docTf)) {
        const dVal = docTf[term] * (this.idf[term] || 0);
        docMagnitude += dVal * dVal;
      }

      queryMagnitude = Math.sqrt(queryMagnitude);
      docMagnitude = Math.sqrt(docMagnitude);

      const similarity = (queryMagnitude > 0 && docMagnitude > 0)
        ? dotProduct / (queryMagnitude * docMagnitude)
        : 0;

      if (similarity > 0.01) {
        scores.push({ chunk: this.chunks[i], score: similarity });
      }
    }

    // Sort by score descending, return top K
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }

  /**
   * Add new chunks to the index (e.g., from Evidence Engine PubMed results).
   * Rebuilds the index incrementally.
   * @param {Array<{ id: string, source: string, section: string, text: string }>} newChunks
   */
  addChunks(newChunks) {
    const existingIds = new Set(this.chunks.map(c => c.id));
    const deduped = newChunks.filter(c => !existingIds.has(c.id));
    if (deduped.length === 0) return;

    this.chunks.push(...deduped);
    this.buildIndex(this.chunks); // Rebuild (fast for ~500-1000 chunks)
  }

  /**
   * Get index stats.
   */
  getStatus() {
    return {
      ready: this.ready,
      chunks: this.chunks.length,
      terms: this.terms.size,
      sources: [...new Set(this.chunks.map(c => c.source))],
    };
  }
}

// ── Tokenizer ──

// Common English stop words to filter out
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "or", "she",
  "that", "the", "to", "was", "were", "will", "with", "this",
  "but", "they", "have", "had", "not", "been", "can", "do", "does",
  "did", "would", "could", "should", "may", "might", "shall",
  "which", "who", "whom", "what", "when", "where", "how", "if",
  "than", "then", "so", "no", "nor", "each", "every", "all", "any",
  "both", "few", "more", "most", "other", "some", "such", "own",
  "same", "about", "above", "after", "again", "also", "into",
  "only", "very", "just", "over", "also", "between", "through",
]);

/**
 * Tokenize text into lowercase terms, removing stop words and short tokens.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_\-]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

module.exports = ChunkStore;
