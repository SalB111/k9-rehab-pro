/**
 * safetyGateAgent.js
 * K9 Rehab Pro — Safety Gate Agent
 *
 * Sits between the owner-triggered home exercise pipeline and protocol delivery.
 * Only outputs protocols that have been vet-approved and locked in approvedProtocols.json.
 *
 * Two modes:
 *   1. VET PIPELINE  — vet triggers → full agent pipeline → assembler → delivery
 *   2. OWNER PIPELINE — owner triggers → safety gate checks → ONLY approved protocols pass
 *
 * The safety gate NEVER generates novel protocols. It validates that every exercise
 * in an owner-requested plan exists in the approved library and passes contraindication checks.
 *
 * Called by: ownerPipelineWorker (BullMQ) or direct API call
 * References: approvedProtocols.json (source of truth)
 */

const Anthropic = require("@anthropic-ai/sdk");
const { readFileSync } = require("fs");
const { join } = require("path");

const APPROVED_PROTOCOLS = JSON.parse(
  readFileSync(join(__dirname, "approvedProtocols.json"), "utf8")
);

const client = new Anthropic();

/**
 * @typedef {Object} OwnerRequest
 * @property {string}   patientId
 * @property {string}   patientName
 * @property {string}   breed
 * @property {number}   ageMonths
 * @property {number}   weightKg
 * @property {string[]} diagnoses
 * @property {string[]} currentMedications
 * @property {number}   painScore          — 0-10
 * @property {string}   mobilityLevel      — independent | assisted | non-ambulatory
 * @property {number}   weeksPostOp
 * @property {string}   homeEnvironment    — house | apartment | condo
 * @property {string}   floorType          — carpet | hardwood | tile | mixed
 * @property {boolean}  hasStairs
 * @property {boolean}  hasYard
 * @property {string}   ownerCapability    — high | moderate | limited
 * @property {string}   requestedExerciseType — optional, e.g. "strengthening", "gentle walk"
 */

/**
 * Validates an owner-triggered exercise request against approved protocols.
 * Returns ONLY vet-approved exercises that are safe for this patient.
 *
 * @param {OwnerRequest} request
 * @returns {Promise<SafetyGateResult>}
 */
async function runSafetyGateAgent(request) {
  console.log(`[SafetyGateAgent] Validating request for patient ${request.patientId}`);

  // ──────────────────────────────────────────
  // HARD RULE CHECKS — no LLM needed
  // ──────────────────────────────────────────

  const hardBlocks = [];

  // Block 1: Pain score >= 8 → STOP
  if (request.painScore >= 8) {
    hardBlocks.push({
      rule: "PAIN_SCORE_CRITICAL",
      message: "Pain score is 8 or above. Exercise is contraindicated. Contact your veterinarian immediately.",
      severity: "absolute",
    });
  }

  // Block 2: Non-ambulatory → passive only
  if (request.mobilityLevel === "non-ambulatory") {
    hardBlocks.push({
      rule: "NON_AMBULATORY",
      message: "Patient is non-ambulatory. Only passive exercises under veterinary supervision are appropriate.",
      severity: "absolute",
    });
  }

  // Block 3: No matching approved protocol
  const matchedProtocols = APPROVED_PROTOCOLS.protocols.filter((p) =>
    p.targetConditions.some(
      (c) => request.diagnoses?.some((d) => d.toLowerCase().includes(c.toLowerCase()))
    )
  );

  if (matchedProtocols.length === 0) {
    hardBlocks.push({
      rule: "NO_APPROVED_PROTOCOL",
      message: "No approved rehabilitation protocol found for this patient's conditions. A veterinarian must create a custom protocol.",
      severity: "absolute",
    });
  }

  // If hard blocks exist, return immediately — no LLM call
  if (hardBlocks.length > 0) {
    return {
      approved: false,
      hardBlocks,
      exercises: [],
      ownerMessage: hardBlocks[0].message,
      vetAlert: {
        required: true,
        reason: hardBlocks.map((b) => b.rule).join(", "),
        patientId: request.patientId,
      },
    };
  }

  // ──────────────────────────────────────────
  // COLLECT SAFE EXERCISES from approved protocols
  // ──────────────────────────────────────────

  // Determine current phase based on weeks post-op
  const currentPhase = request.weeksPostOp <= 4 ? 1
    : request.weeksPostOp <= 8 ? 2
    : request.weeksPostOp <= 12 ? 3
    : 4;

  // Filter to exercises appropriate for this phase
  const candidateExercises = matchedProtocols.flatMap((p) =>
    p.exercises
      .filter((e) => e.phase <= currentPhase)
      .filter((e) => {
        // Remove exercises contraindicated for this patient
        const patientConditions = [
          ...(request.diagnoses || []),
          ...(request.currentMedications || []),
        ].map((c) => c.toLowerCase());

        return !e.contraindicatedConditions?.some((cc) =>
          patientConditions.some((pc) => pc.includes(cc.toLowerCase()))
        );
      })
      .map((e) => ({ ...e, protocolId: p.id, protocolName: p.name }))
  );

  // If pain score is elevated (5-7), filter to low intensity only
  const safeExercises = request.painScore >= 5
    ? candidateExercises.filter((e) => e.intensityLevel === "low")
    : candidateExercises;

  // ──────────────────────────────────────────
  // LLM PERSONALIZATION — warm owner-facing instructions
  // ──────────────────────────────────────────

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: `You are B.E.A.U. — the Biomedical Evidence-Based Analytical Unit.
You are speaking directly to a pet owner. Be warm, clear, and reassuring.
You may ONLY recommend exercises from the approved list provided.
You must NEVER invent new exercises or modify dosing.
Respond with valid JSON only — no prose, no markdown fences.`,
    messages: [
      {
        role: "user",
        content: `Create a home exercise session for today from these approved exercises.

PATIENT: ${request.patientName} (${request.breed}, ${request.ageMonths}mo, ${request.weightKg}kg)
PAIN SCORE: ${request.painScore}/10
MOBILITY: ${request.mobilityLevel}
WEEKS POST-OP: ${request.weeksPostOp}
HOME: ${request.homeEnvironment}, ${request.floorType} floors, stairs: ${request.hasStairs}, yard: ${request.hasYard}
OWNER CAPABILITY: ${request.ownerCapability}

APPROVED EXERCISES FOR TODAY (do NOT add any others):
${JSON.stringify(safeExercises.map((e) => ({
  name: e.name,
  code: e.code,
  category: e.category,
  intensityLevel: e.intensityLevel,
  durationSeconds: e.durationSeconds,
  reps: e.reps,
  sets: e.sets,
})), null, 2)}

Select 3-6 exercises appropriate for a home session. Respond with:
{
  "sessionTitle": "Today's Exercise Session for [patient name]",
  "exercises": [
    {
      "name": "exact exercise name from list",
      "code": "exact code from list",
      "ownerInstruction": "warm, plain-language step-by-step for the owner",
      "duration": "e.g. 5 minutes",
      "safetyNote": "when to stop or what to watch for"
    }
  ],
  "warmUpReminder": "brief warm-up instruction",
  "coolDownReminder": "brief cool-down instruction",
  "redFlagWarning": "when to stop and call the vet",
  "encouragement": "warm closing message for the owner"
}`,
      },
    ],
  });

  let session;
  try {
    session = JSON.parse(response.content[0]?.text ?? "{}");
  } catch {
    session = { exercises: [], error: "Failed to parse session" };
  }

  // ──────────────────────────────────────────
  // FINAL VALIDATION — every exercise must exist in approved list
  // ──────────────────────────────────────────
  const approvedCodes = new Set(safeExercises.map((e) => e.code));
  const validatedExercises = (session.exercises || []).filter((e) =>
    approvedCodes.has(e.code)
  );

  // Flag any hallucinated exercises
  const hallucinated = (session.exercises || []).filter((e) =>
    !approvedCodes.has(e.code)
  );

  if (hallucinated.length > 0) {
    console.warn(`[SafetyGateAgent] BLOCKED ${hallucinated.length} hallucinated exercises:`,
      hallucinated.map((e) => e.name)
    );
  }

  return {
    approved: true,
    hardBlocks: [],
    session: {
      ...session,
      exercises: validatedExercises,
    },
    meta: {
      totalCandidates: candidateExercises.length,
      painFiltered: request.painScore >= 5,
      hallucinationsBlocked: hallucinated.length,
      protocolsUsed: matchedProtocols.map((p) => p.id),
      currentPhase,
    },
    vetAlert: {
      required: false,
      reason: null,
      patientId: request.patientId,
    },
  };
}

module.exports = { runSafetyGateAgent };
