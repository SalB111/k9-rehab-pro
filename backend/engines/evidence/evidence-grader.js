// ============================================================================
// EVIDENCE ENGINE — Evidence Grader
// Heuristic classification of study type → evidence grade (A/B/C/EO)
// Aligned with K9 Rehab Pro evidence grading system
// ============================================================================

/**
 * Grade a PubMed article based on study type keywords in title/abstract.
 * @param {{ title: string, abstract: string }} article
 * @returns {{ grade: string, label: string, confidence: string }}
 */
function gradeEvidence(article) {
  const text = `${article.title} ${article.abstract}`.toLowerCase();

  // Grade A: Strong RCT evidence
  if (
    text.includes("randomized controlled trial") ||
    text.includes("randomised controlled trial") ||
    text.includes("double-blind") ||
    text.includes("double blind") ||
    text.includes("placebo-controlled") ||
    (text.includes("rct") && text.includes("trial"))
  ) {
    return { grade: "A", label: "Strong RCT", confidence: "High" };
  }

  // Grade A: Meta-analysis / systematic review
  if (
    text.includes("meta-analysis") ||
    text.includes("meta analysis") ||
    text.includes("systematic review")
  ) {
    return { grade: "A", label: "Systematic Review/Meta-Analysis", confidence: "High" };
  }

  // Grade B: Moderate evidence (cohort, prospective, comparative)
  if (
    text.includes("cohort study") ||
    text.includes("prospective study") ||
    text.includes("prospective evaluation") ||
    text.includes("longitudinal study") ||
    text.includes("comparative study") ||
    text.includes("controlled study") ||
    text.includes("clinical trial") ||
    text.includes("controlled clinical")
  ) {
    return { grade: "B", label: "Moderate Evidence", confidence: "Moderate" };
  }

  // Grade C: Limited evidence (case series, observational, pilot, retrospective)
  if (
    text.includes("case report") ||
    text.includes("case series") ||
    text.includes("pilot study") ||
    text.includes("preliminary study") ||
    text.includes("retrospective") ||
    text.includes("observational study") ||
    text.includes("cross-sectional")
  ) {
    return { grade: "C", label: "Limited Evidence", confidence: "Low" };
  }

  // EO: Expert opinion (review, editorial, commentary, consensus)
  if (
    text.includes("review article") ||
    text.includes("literature review") ||
    text.includes("editorial") ||
    text.includes("commentary") ||
    text.includes("expert opinion") ||
    text.includes("consensus statement") ||
    text.includes("clinical guideline") ||
    text.includes("practice guideline")
  ) {
    return { grade: "EO", label: "Expert Opinion/Review", confidence: "Expert Consensus" };
  }

  // Default: Grade B if it's a research article, C if unclear
  if (
    text.includes("study") ||
    text.includes("evaluation") ||
    text.includes("investigation") ||
    text.includes("analysis") ||
    text.includes("outcome")
  ) {
    return { grade: "B", label: "Research Study", confidence: "Moderate" };
  }

  return { grade: "C", label: "Unclassified", confidence: "Low" };
}

module.exports = { gradeEvidence };
