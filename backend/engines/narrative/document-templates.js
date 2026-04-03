// ============================================================================
// NARRATIVE ENGINE — Document Templates
// 5 clinical document types with section definitions and prompt instructions
// ============================================================================

const TEMPLATES = {
  progress_report: {
    name: "Progress Report",
    description: "Clinical progress report for a patient's rehabilitation course",
    sections: ["Patient Summary", "Current Phase", "Objective Measures", "Exercise Performance", "Clinical Assessment", "Recommendations", "Next Steps"],
    prompt: `Generate a clinical progress report for the patient. Include:
- Patient demographics and diagnosis summary
- Current rehabilitation phase and week
- Objective measures: pain score, ROM, lameness grade, girth measurements
- Exercise performance: adherence, tolerance, compensations observed
- Clinical assessment: progress toward phase goals
- Recommendations: modifications, progressions, or regressions needed
- Next steps: upcoming milestones, reassessment timeline

Use professional clinical language. Include specific exercise codes from the K9 Rehab Pro library when referencing exercises. Cite evidence where applicable.`,
  },

  case_narrative: {
    name: "Case Narrative",
    description: "Full clinical case presentation for teaching rounds or CE lectures",
    sections: ["Patient History", "Clinical Presentation", "Diagnostic Findings", "Assessment", "Treatment Plan", "Protocol Details", "Outcomes", "Discussion"],
    prompt: `Generate a complete clinical case narrative suitable for teaching rounds or continuing education. Include:
- Signalment and relevant history
- Clinical presentation at initial evaluation
- Diagnostic findings and classification
- Assessment with differential considerations
- Rehabilitation treatment plan with rationale
- Protocol details: phases, exercises (with codes), dosing, progression criteria
- Outcomes: measured improvements, timeline
- Discussion: evidence supporting the approach, lessons learned

Write in formal clinical case presentation style. Reference Millis & Levine, ACVSMR standards.`,
  },

  referral_letter: {
    name: "Referral Letter",
    description: "Professional referral letter to a veterinary specialist",
    sections: ["Addressee", "Patient Summary", "Clinical Findings", "Current Protocol", "Reason for Referral", "Requested Services"],
    prompt: `Generate a professional veterinary referral letter. Include:
- Formal greeting and referring clinician identification
- Patient signalment and owner information
- Clinical findings: diagnosis, stage, pain score, functional status
- Current rehabilitation protocol summary (phase, key exercises, duration)
- Specific reason for referral (e.g., pain management, neurology consult, surgical re-evaluation)
- Requested services or consultation

Use formal professional letter format. Be concise but thorough.`,
  },

  ce_lecture: {
    name: "CE Lecture Outline",
    description: "Continuing education lecture content with evidence citations",
    sections: ["Title & Learning Objectives", "Background & Epidemiology", "Pathophysiology", "Clinical Assessment", "Rehabilitation Protocol", "Evidence Review", "Case Examples", "Summary & Key Takeaways", "References"],
    prompt: `Generate a continuing education lecture outline on the rehabilitation topic. Include:
- Title and 3-4 specific learning objectives
- Background: epidemiology, prevalence, clinical significance
- Pathophysiology relevant to rehabilitation
- Clinical assessment: examination techniques, grading scales, outcome measures
- Rehabilitation protocol: phase-gated approach with specific exercises (codes from library)
- Evidence review: cite PubMed studies and textbook references
- Case examples: 1-2 brief illustrative cases
- Summary with key clinical takeaways
- Reference list

Target audience: veterinary rehabilitation professionals (CCRP/CCRT level).`,
  },

  client_handout: {
    name: "Client Handout",
    description: "Owner-friendly take-home exercise instructions",
    sections: ["Patient Name & Diagnosis", "What This Means", "Your Dog's Current Phase", "Home Exercises", "What to Watch For", "When to Contact Your Veterinarian", "Next Appointment"],
    prompt: `Generate a client-friendly take-home handout. Include:
- Patient name and diagnosis in plain language (avoid jargon)
- Simple explanation of the condition and recovery process
- Current rehabilitation phase with goals explained simply
- Home exercises: name, step-by-step instructions, frequency, duration (use simple language)
- Warning signs to watch for (pain, swelling, limping, behavioral changes)
- When to contact the veterinarian immediately
- Next appointment date/timeline

Use warm, reassuring, owner-friendly language. Avoid clinical jargon — explain medical terms when used. Keep instructions clear and actionable.`,
  },
};

/**
 * Get a template by type key.
 */
function getTemplate(type) {
  return TEMPLATES[type] || null;
}

/**
 * Get all available template summaries.
 */
function getTemplateList() {
  return Object.entries(TEMPLATES).map(([key, t]) => ({
    key,
    name: t.name,
    description: t.description,
    sections: t.sections,
  }));
}

module.exports = { TEMPLATES, getTemplate, getTemplateList };
