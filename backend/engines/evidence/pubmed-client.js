// ============================================================================
// EVIDENCE ENGINE — PubMed E-utilities Client
// Searches PubMed for peer-reviewed veterinary rehabilitation literature
// Free API — no key required. Rate limit: 3 requests/second.
// ============================================================================

const https = require("https");

const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// Rate limiter — 3 req/sec per NCBI policy
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 350;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
  return httpGet(url);
}

/**
 * Search PubMed for articles matching a query.
 * @param {string} query — Search terms (e.g., "canine TPLO rehabilitation")
 * @param {number} maxResults — Max articles to return (default 5)
 * @returns {Promise<Array<{ pmid: string, title: string, authors: string, journal: string, year: string, abstract: string }>>}
 */
async function searchPubMed(query, maxResults = 5) {
  // Step 1: Search for PMIDs
  const searchUrl = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance`;
  const searchResult = await rateLimitedFetch(searchUrl);

  let searchData;
  try {
    searchData = JSON.parse(searchResult);
  } catch {
    console.error("[PubMed] Failed to parse search response");
    return [];
  }

  const pmids = searchData?.esearchresult?.idlist;
  if (!pmids || pmids.length === 0) return [];

  // Step 2: Fetch article summaries
  const summaryUrl = `${BASE_URL}/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json`;
  const summaryResult = await rateLimitedFetch(summaryUrl);

  let summaryData;
  try {
    summaryData = JSON.parse(summaryResult);
  } catch {
    console.error("[PubMed] Failed to parse summary response");
    return [];
  }

  const results = summaryData?.result;
  if (!results) return [];

  // Step 3: Fetch abstracts via efetch XML
  const abstractUrl = `${BASE_URL}/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&rettype=abstract&retmode=xml`;
  const abstractXml = await rateLimitedFetch(abstractUrl);
  const abstracts = parseAbstractsFromXml(abstractXml);

  // Build article objects
  const articles = [];
  for (const pmid of pmids) {
    const summary = results[pmid];
    if (!summary || !summary.title) continue;

    const authors = (summary.authors || [])
      .slice(0, 3)
      .map(a => a.name)
      .join(", ");

    articles.push({
      pmid,
      title: cleanHtml(summary.title),
      authors: authors + (summary.authors?.length > 3 ? " et al." : ""),
      journal: summary.source || "",
      year: summary.pubdate ? summary.pubdate.split(" ")[0] : "",
      abstract: abstracts[pmid] || "",
    });
  }

  return articles;
}

/**
 * Parse abstracts from PubMed efetch XML response.
 * Simple regex-based parser (no XML library dependency).
 */
function parseAbstractsFromXml(xml) {
  const abstracts = {};
  if (!xml) return abstracts;

  // Match each PubmedArticle block
  const articlePattern = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let match;

  while ((match = articlePattern.exec(xml)) !== null) {
    const block = match[1];

    // Extract PMID
    const pmidMatch = block.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    if (!pmidMatch) continue;
    const pmid = pmidMatch[1];

    // Extract abstract text
    const abstractMatch = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
    if (abstractMatch) {
      const abstractParts = abstractMatch.map(a =>
        a.replace(/<[^>]+>/g, "").trim()
      );
      abstracts[pmid] = abstractParts.join(" ").slice(0, 1000);
    }
  }

  return abstracts;
}

/**
 * Clean HTML entities from PubMed titles.
 */
function cleanHtml(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Simple HTTPS GET returning a string.
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

module.exports = { searchPubMed };
