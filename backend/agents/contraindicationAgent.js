/**
 * contraindicationAgent.js
 * K9 Rehab Pro — Sub-Agent 3: Contraindication Check
 *
 * Cross-references all diagnoses, comorbidities, medications (if provided),
 * and post-op status against known contraindications for rehab exercises.
 * This agent's `safe` flag gates the assembler — if false, plan requires vet review.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const APPROVED_PROTOCOLS = JSON.parse(
  readFileSync(join(__dirname, "../../approvedProtocols.json"), "utf8")
);

const client = new Anthropic();

export async function runContraindicationAgent(patient, contextBrief) {
  console.log(`[ContraindicationAgent] Checking ${patient.diagnoses?.length ?? 0} diagnoses + ${patient.comorbidities?.length ?? 0} comorbidities`);

  // Collect all contraindicated conditions from every exercise in every protocol
  const allContraindications = new Set();
  APPROVED_PROTOCOLS.protocols.forEach((p) =>
    p.exercises.forEach((e) =>
      e.contraindicatedConditions?.forEach((c) => allContraindications.add(c))
    )
  );

  // Hard check: any overlap between patient conditions and known contraindications?
  const patientConditions = [
    ...(patient.diagnoses ?? []),
    ...(patient.comorbidities ?? []),
  ];
  const hardFlags = patientConditions.filter((c) => allContraindications.has(c));

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are a veterinary rehabilitation safety officer.
Your role is to identify ALL contraindications, drug interactions, and risk factors
that should constrain or modify a rehabilitation plan for this patient.
Be thorough and conservative — patient safety is the only priority.
Respond with valid JSON only — no prose, no markdown fences.`,
    messages: [
      {
        role: "user",
        content: `Perform a comprehensive contraindication assessment.

PATIENT:
- Breed: ${patient.breed}, Age: ${patient.ageMonths}mo, Weight: ${patient.weightKg}kg
- Diagnoses: ${patient.diagnoses?.join(", ") || "none"}
- Surgeries: ${patient.surgeries?.join(", ") || "none"}
- Comorbidities: ${patient.comorbidities?.join(", ") || "none"}
- Weeks post-op: ${patient.weeksPostOp}
- Mobility score: ${patient.mobilityScore}/5

HARD FLAGS DETECTED BY RULE ENGINE: ${hardFlags.length > 0 ? hardFlags.join(", ") : "none"}

RISK LEVEL FROM ORCHESTRATOR: ${contextBrief.riskLevel}

Assess and respond with:
{
  "safe": true | false,
  "flags": [
    {
      "condition": "condition name",
      "severity": "absolute | relative | precaution",
      "affectedExerciseCategories": ["categories to avoid or modify"],
      "recommendation": "what to do instead or what to monitor"
    }
  ],
  "absoluteContraindications": ["exercise categories that must be excluded entirely"],
  "modificationRequired": ["categories that can proceed with modifications"],
  "safeCategories": ["exercise categories fully safe for this patient"],
  "overallRiskAssessment": "narrative risk summary for the vet",
  "requiresVetReviewBeforeDelivery": true | false
}`,
      },
    ],
  });

  const result = JSON.parse(response.content[0]?.text ?? "{}");

  // Merge hard rule flags into LLM result — hard flags always win
  if (hardFlags.length > 0 && result.safe !== false) {
    result.safe = false;
    result.flags = result.flags ?? [];
    hardFlags.forEach((flag) => {
      result.flags.unshift({
        condition: flag,
        severity: "absolute",
        affectedExerciseCategories: ["all"],
        recommendation: "Detected by hard rule engine — vet must review",
      });
    });
  }

  return result;
}
