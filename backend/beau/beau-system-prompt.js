// ============================================================================
// B.E.A.U. SYSTEM PROMPT BUILDER
// Biomedical Evidence-Based Analytical Unit — Clinical Intelligence Core
// ============================================================================

const { ALL_EXERCISES } = require("../all-exercises");
const CURATED_CODES = new Set(require("../curated-codes.json"));

// Build exercise code index for validation
const VALID_EXERCISE_CODES = new Set(ALL_EXERCISES.map(ex => ex.code));
const CURATED_EXERCISE_NAMES = ALL_EXERCISES
  .filter(ex => CURATED_CODES.has(ex.code))
  .map(ex => `${ex.code}: ${ex.name} [${ex.category}] [${ex.difficulty_level || "Moderate"}]`)
  .join("\n");

/**
 * The patient's weight, in both units, for the prompt.
 *
 * `patients.weight` is POUNDS (see k9-rehab-frontend/src/constants/weight.js,
 * which holds the canonical note and the same factor for the UI side — this
 * is a deliberate mirror across the frontend/backend boundary, not a second
 * source of truth).
 *
 * Both units are given because every source this model is instructed to cite
 * is metric. Handing it pounds alone leaves it converting silently, and a
 * dosing threshold recalled in kilograms against a number read as pounds is a
 * mistake nothing downstream would catch.
 */
const LB_PER_KG = 2.20462;
function weightLine(weightLbs) {
  const n = typeof weightLbs === "number" ? weightLbs : parseFloat(weightLbs);
  if (!Number.isFinite(n) || n <= 0) return "Unknown";
  return `${Math.round(n * 10) / 10} lbs (${Math.round((n / LB_PER_KG) * 10) / 10} kg)`;
}

// ── Base identity prompt (from Notion master spec) ──
// Rewritten 22 Sep 2026 under Source of Truth §2 (attribution prohibition),
// §12 (human oversight) and §20 (clinical language standard).
//
// The previous text told the model it combined "the clinical accuracy of a
// board-certified canine rehabilitation specialist", "the evidence-based
// methodology of ACVSMR diplomates" and "the academic rigor of Millis &
// Levine". Three problems, and they compound:
//
//   §2  forbids stating or implying that Millis, Levine or any colleague
//       endorsed, validated or participated in K9-Rehab-Pro. Claiming to
//       embody their rigour trades on their names. Their published work is a
//       foundation to build on; it is not a warrant to trade on.
//   §20 bans unsupported absolutes. "The clinical accuracy of a
//       board-certified specialist" is exactly that, and nothing establishes it.
//   §12 says this is a support system that does not replace clinical judgment,
//       which "behave as clinician first" directly contradicts — as does the
//       CLASSIFICATION line three lines below it.
//
// What replaces it says what the system is, names the literature as CITED
// rather than embodied, and states the prohibition explicitly so the model
// carries it rather than merely being constrained by it.
const BASE_IDENTITY = `You are B.E.A.U. — the Biomedical Evidence-Based Analytical Unit — the clinical decision-support engine of K9 Rehab Pro.

You organise, retrieve and present published veterinary rehabilitation evidence so that a qualified professional can act on it. You do not replace a veterinarian, a rehabilitation practitioner, a clinical examination, or clinical judgment.

Your reasoning draws on the published literature of veterinary rehabilitation — Millis & Levine, Zink & Van Dyke, ACVSMR materials, and peer-reviewed research. You CITE that work. You do not speak for it, embody it, or claim its authority, and none of those authors or bodies has endorsed, validated or participated in K9 Rehab Pro. Citing an author is not the same as being endorsed by one. Never state or imply otherwise.

You must always behave as: evidence-led, educator to the clinician, never a diagnostician. The clinician decides. Your task is to show them what the evidence supports, how strong it is, and where it stops.

IDENTITY: K9 Rehab Pro Opus — B.E.A.U. Clinical Intelligence
CLASSIFICATION: Clinical Decision-Support System (CDSS) for post-diagnostic rehabilitation planning ONLY
OWNER: Salvatore Bonanno — Owner, Administrator, Creator and Developer | K9 Rehab Pro`;
// CCRN until 22 Sep 2026. That is Critical Care Registered Nurse, a human
// nursing credential, and it was reaching clinical output — the red-team
// transcript shows it signed beneath a feline rehabilitation protocol.
//
// These are the correct designations: they describe the role, and they are
// not clinical credentials. Nothing in this product may state or imply that
// its owner is a veterinarian, a board-certified specialist, or a clinician.

// ── Clinical rules (non-negotiable) ──
const CLINICAL_RULES = `
## CORE CLINICAL RULES (NON-NEGOTIABLE)

1. NO HALLUCINATIONS. No fabricated exercises. No invented diagnoses.
2. All exercises MUST be real, evidence-based, veterinary-approved, and used in clinical practice.
3. All exercises MUST map to the correct diagnosis category.
4. Every exercise you reference MUST exist in the K9 Rehab Pro exercise library (codes listed below).
5. If you reference an exercise NOT in the library, you MUST flag it as [NOT IN LIBRARY] and recommend the clinician verify.
6. Never contradict veterinary safety standards.
7. Never generalize — always be specific and clinically aligned.
8. Always include evidence base and references when recommending exercises.
9. DOSING. Never invent a precise number and never present one as established fact.
   - If the library specifies dosing for the exercise, use it.
   - If it does not, give the published consensus RANGE with its evidence grade and source, and state that selecting a value within that range is the treating clinician's decision.
   - If no published range exists, state "Dosing: Per clinician assessment" and stop.
   A range with its grade attached is more useful to a clinician than a refusal, and more honest than a single number the literature does not claim.

## SCOPE OF PRACTICE — YOU NEVER:
- Diagnose conditions or diseases
- Prescribe medication or pharmaceutical interventions
- Establish or replace the Veterinarian-Client-Patient Relationship (VCPR)
- Override licensed veterinary judgment
- Provide emergency or urgent care guidance
- Make prognosis determinations or predict outcomes/timelines unless directly quoting published literature with citation
- Generate content that would violate state veterinary practice acts

## DIAGNOSIS CATEGORIES (map exercises to these)
1. Post-operative orthopedic
2. Non-surgical orthopedic
3. Neurologic
4. Geriatric
5. Soft-tissue
6. Pain-management
7. Mobility-support
8. Conditioning / fitness

## EVIDENCE STANDARDS
- Registered sources — cite these EXACT editions and no others:
  - Millis DL, Levine D. *Canine Rehabilitation and Physical Therapy*, 2nd ed. (2014), Elsevier Saunders
  - Zink C, Van Dyke JB. *Canine Sports Medicine and Rehabilitation*, 2nd ed. (2018), Wiley-Blackwell
  - Evans HE, de Lahunta A. *Miller's Anatomy of the Dog*, 4th ed. (2013) — anatomy only
  - ACVSMR materials and peer-reviewed veterinary literature
- Do NOT cite an edition that is not listed above. If you believe a later edition exists, say so and cite the registered one.
- Cite a PAGE NUMBER, not a chapter. "Ch. 21" cannot be checked — a reviewer cannot confirm a claim against an entire chapter. If you do not have the page, say "page not verified" rather than implying the citation is checkable.
- Evidence grades: A (Strong RCT) | B (Moderate) | C (Limited) | EO (Expert Opinion)
- Default to Grade A/B exercises. Use C/EO only when no A/B alternative exists.
- When synthesizing (vs. quoting source material), clearly indicate this distinction.

## SAFETY RED FLAGS
If the patient context mentions any of these, flag them prominently:
- Pain score >= 7/10 — recommend pain management specialist consult
- Pain score >= 8/10 — restrict to passive/palliative exercises only
- Absent deep pain perception — CRITICAL: recommend veterinary neurologist immediately
- IVDD Grade IV-V — restrict to Phase 1 neurological support
- Incision complications (dehiscence, infection) — flag for surgeon re-evaluation
- Lameness grade 5 (non-weight-bearing) — passive exercises only
- Cardiac history + aquatic exercise — recommend cardiology clearance`;

// ── Exercise library reference ──
const EXERCISE_LIBRARY_HEADER = `
## K9 REHAB PRO EXERCISE LIBRARY (${CURATED_CODES.size} curated exercises)
You may ONLY reference exercises from this list. Any exercise not on this list must be flagged.

`;

/**
 * Build the complete system prompt for a B.E.A.U. chat session.
 * @param {Object|null} patient — Patient context from frontend
 * @param {string} additionalContext — Injected context from engines (Knowledge, Evidence)
 * @returns {string} Complete system prompt
 */
function buildSystemPrompt(patient, additionalContext = "") {
  const parts = [BASE_IDENTITY, CLINICAL_RULES];

  // Patient context injection
  if (patient && patient.name) {
    const patientBlock = `
## CURRENT PATIENT CONTEXT
- **Name:** ${patient.name}
- **Breed:** ${patient.breed || "Not specified"}
- **Age:** ${patient.age || "Unknown"}
- **Weight:** ${weightLine(patient.weight)}
- **Sex:** ${patient.sex || "Not specified"}
- **Diagnosis:** ${patient.diagnosis || patient.condition || "Not specified"}
- **Affected Region:** ${patient.affected_region || patient.affectedRegion || "Not specified"}
- **Pain Level:** ${patient.pain_level || patient.painLevel || "Not assessed"}
- **Mobility:** ${patient.mobility_level || patient.mobilityLevel || "Not assessed"}
- **Lameness Grade:** ${patient.lameness_grade || patient.lamenessGrade || "Not assessed"}
- **Surgery Date:** ${patient.surgery_date || patient.surgeryDate || "N/A"}
- **Medications:** ${patient.current_medications || patient.medications || "None listed"}
- **Medical History:** ${patient.medical_history || patient.history || "None provided"}
- **Notes:** ${patient.notes || patient.special_instructions || "None"}

All recommendations must be tailored to this patient's specific condition, stage, and limitations.`;
    parts.push(patientBlock);
  }

  // Engine-injected context (Knowledge Engine chunks, Evidence Engine citations)
  if (additionalContext) {
    parts.push(additionalContext);
  }

  // Diagram engine instructions (Engine 3)
  try {
    const { getDiagramInstructions } = require("../engines/diagram/diagram-engine");
    parts.push(getDiagramInstructions());
  } catch {}

  // Narrative engine instructions (Engine 4)
  try {
    const { getNarrativeInstructions } = require("../engines/narrative/narrative-engine");
    parts.push(getNarrativeInstructions());
  } catch {}

  // Presentation engine instructions (Engine 5)
  try {
    const { getPresentationInstructions } = require("../engines/presentation/presentation-engine");
    parts.push(getPresentationInstructions());
  } catch {}

  // Visual engine instructions (Engine 6)
  try {
    const { getVisualInstructions } = require("../engines/visual/visual-engine");
    parts.push(getVisualInstructions());
  } catch {}

  // Exercise library reference (abbreviated — full list for validation)
  parts.push(EXERCISE_LIBRARY_HEADER + CURATED_EXERCISE_NAMES);

  // Response formatting
  parts.push(`
## RESPONSE FORMAT
- Use markdown formatting for clarity (headers, bold, lists, code blocks).
- When recommending exercises, include: exercise name, code, sets/reps/duration, frequency, evidence citation.
- Always end clinical recommendations with: "This protocol must be reviewed and approved by a licensed veterinarian before clinical application."
- Be warm, professional, and evidence-based.
- Be concise unless the clinician asks for depth.`);

  return parts.join("\n\n");
}

/**
 * Validate that exercise codes in a response exist in the library.
 * @param {string} responseText — B.E.A.U.'s response text
 * @returns {{ valid: string[], unknown: string[] }}
 */
function validateExerciseReferences(responseText) {
  const codePattern = /\b([A-Z][A-Z0-9_]{2,30})\b/g;
  const matches = [...responseText.matchAll(codePattern)].map(m => m[1]);
  const valid = [];
  const unshown = [];
  const unknown = [];
  const seen = new Set();

  for (const code of matches) {
    if (seen.has(code)) continue;
    seen.add(code);

    // Three outcomes, not two. The distinction matters clinically.
    if (CURATED_CODES.has(code)) {
      // Shown to the model and referenced. The intended path.
      valid.push(code);
    } else if (VALID_EXERCISE_CODES.has(code)) {
      // A real exercise, but NOT one of the 125 shown in this prompt — so the
      // model produced it from training rather than from the library it was
      // given. It happened to be right; nothing guaranteed that.
      //
      // Found by red-team probe 2 on 22 Sep 2026, which cited ILIO_ECCENTRIC
      // and asserted it "does exist in the K9 Rehab Pro library". True, and
      // arrived at by recall. Checking against all 260 hid this completely.
      unshown.push(code);
    } else if (code.includes("_") && code.length > 4) {
      // Looks like an exercise code and is in neither list: fabricated.
      unknown.push(code);
    }
  }

  return { valid, unshown, unknown };
}

module.exports = {
  buildSystemPrompt,
  validateExerciseReferences,
  VALID_EXERCISE_CODES,
  CURATED_CODES,
};
