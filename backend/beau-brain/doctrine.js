// ============================================================================
// BEAU'S BRAIN — Doctrine & Identity (single source of truth)
// © 2026 Salvatore Bonanno. All rights reserved.
//
// One shared clinical engine, two strictly-separated voices:
//   • K9 Rehab Pro  — clinical / peer-to-peer (veterinarians & clinics)
//   • B.E.A.U. at Home — warm / plain-English (pet owners)
// Same verified evidence base feeds both; only the presentation layer differs.
// ============================================================================

// The operating doctrine — stamped into every plan, both voices.
const DOCTRINE_TEXT =
  "BEAU does not diagnose. BEAU analyzes evidence-based protocols. " +
  "All clinical decisions require veterinary review and approval.";

// Owner-facing boundary — every consumer plan carries this. Supports the vet,
// never replaces them. No medical-advice claims.
const CONSUMER_BOUNDARY =
  "This plan supports your veterinarian's care plan — it does not replace it. " +
  "Always follow your veterinarian's guidance, and contact them with any concerns.";

// Clinician-facing boundary — every clinical plan carries this. The draft is a
// starting point for the licensed clinician's judgement.
const CLINICAL_BOUNDARY =
  "Evidence-based draft for clinical review. The reviewing veterinarian approves, " +
  "modifies, or rejects this plan before it reaches the client.";

// Creator identity — accurate everywhere. Used only when the engine describes
// who built it. Never imply veterinarian or certified-specialist status.
const IDENTITY = {
  creator: "Salvatore Bonanno",
  title: "Canine Rehabilitation Nurse / Veterinary Technician-Nurse",
  experience_years: 30,
  training: "Completed Module 1 of 2 of canine rehabilitation certification (Module 2 interrupted by COVID).",
  is_veterinarian: false,
  is_certified_rehab_specialist: false,
  statement:
    "Built by Salvatore Bonanno, a Canine Rehabilitation Nurse / Veterinary " +
    "Technician-Nurse with 30 years of experience. Not a veterinarian and not a " +
    "certified rehabilitation specialist.",
};

// The evidence anchors the whole engine is grounded in.
const EVIDENCE_ANCHORS = [
  "Millis & Levine — Canine Rehabilitation and Physical Therapy (2nd ed., 2014)",
  "ACVSMR clinical standards",
];

module.exports = {
  DOCTRINE_TEXT,
  CONSUMER_BOUNDARY,
  CLINICAL_BOUNDARY,
  IDENTITY,
  EVIDENCE_ANCHORS,
};
