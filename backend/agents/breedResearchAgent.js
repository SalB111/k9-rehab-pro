/**
 * breedResearchAgent.js
 * K9 Rehab Pro — Sub-Agent 1: Breed-Specific Biomechanics
 *
 * Looks up breed-specific musculoskeletal traits, common injury patterns,
 * and biomechanical considerations that should influence the rehab plan.
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

/**
 * @param {import('../orchestratorAgent.js').PatientIntake} patient
 * @param {Object} contextBrief
 * @returns {Promise<BreedInsights>}
 */
export async function runBreedResearchAgent(patient, contextBrief) {
  console.log(`[BreedResearchAgent] Researching ${patient.breed}`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are a veterinary orthopaedic specialist with deep knowledge of
breed-specific musculoskeletal anatomy, common breed predispositions, and
how breed traits affect rehabilitation outcomes.
Respond with valid JSON only — no prose, no markdown fences.`,
    messages: [
      {
        role: "user",
        content: `Provide breed-specific rehabilitation insights for this patient.

BREED: ${patient.breed}
AGE: ${patient.ageMonths} months
WEIGHT: ${patient.weightKg} kg
PRIMARY CONDITION: ${contextBrief.primaryCondition}
CLINICAL BRIEF: ${contextBrief.summary}

Respond with:
{
  "breedTraits": ["key musculoskeletal traits relevant to rehab"],
  "commonPredispositions": ["conditions this breed is prone to"],
  "biomechanicsNotes": "paragraph on how breed anatomy affects this rehab",
  "weightConsideration": "assessment of weight relative to breed standard",
  "gaitConsiderations": ["breed-specific gait or movement notes"],
  "recoveryFactors": {
    "typicalRecoveryModifier": "faster | standard | slower",
    "rationale": "why"
  },
  "watchFor": ["breed-specific complications to monitor during rehab"]
}`,
      },
    ],
  });

  return JSON.parse(response.content[0]?.text ?? "{}");
}
