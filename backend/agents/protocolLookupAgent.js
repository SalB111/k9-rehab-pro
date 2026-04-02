/**
 * protocolLookupAgent.js
 * K9 Rehab Pro — Sub-Agent 2: Evidence-Based Protocol Lookup
 *
 * Matches patient presentation to evidence-based rehabilitation protocols.
 * References canine rehab literature standards (CCRP, IVRRA guidelines).
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

export async function runProtocolLookupAgent(patient, contextBrief) {
  console.log(`[ProtocolLookupAgent] Matching protocols for ${contextBrief.primaryCondition}`);

  // Pre-filter protocols by condition match before sending to Claude
  const candidateProtocols = APPROVED_PROTOCOLS.protocols.filter((p) =>
    p.targetConditions.some(
      (c) =>
        patient.diagnoses.includes(c) ||
        patient.surgeries.some((s) => s.toLowerCase().includes(c.toLowerCase()))
    )
  );

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: `You are a canine rehabilitation specialist trained in CCRP protocols.
Given a patient presentation and candidate protocols, select and rank the most
appropriate evidence-based protocols, adapting parameters for this specific patient.
Respond with valid JSON only — no prose, no markdown fences.`,
    messages: [
      {
        role: "user",
        content: `Select and rank rehab protocols for this patient.

PATIENT CONTEXT:
${JSON.stringify(contextBrief, null, 2)}

PATIENT SPECIFICS:
- Weeks post-op: ${patient.weeksPostOp}
- Mobility score: ${patient.mobilityScore}/5
- Comorbidities: ${patient.comorbidities?.join(", ") || "none"}

CANDIDATE PROTOCOLS FROM APPROVED LIST:
${JSON.stringify(candidateProtocols.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  allowedCategories: p.allowedCategories,
  exerciseCount: p.exercises.length,
})), null, 2)}

Respond with:
{
  "matchedProtocols": [
    {
      "protocolId": "PROT-XXX",
      "protocolName": "...",
      "relevanceScore": 0.0-1.0,
      "rationale": "why this protocol fits",
      "phaseApplicability": "which recovery phase this covers",
      "parameterAdjustments": ["any adjustments for this patient's specifics"]
    }
  ],
  "evidenceLevel": "high | moderate | low",
  "protocolGaps": ["areas not covered by available protocols"],
  "recommendedSequence": ["PROT-XXX", "PROT-YYY"],
  "clinicalNotes": "overall protocol strategy for this patient"
}`,
      },
    ],
  });

  return JSON.parse(response.content[0]?.text ?? "{}");
}
