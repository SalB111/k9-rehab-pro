/**
 * assemblerAgent.js
 * K9 Rehab Pro — Assembler Agent
 *
 * Takes the merged outputs of all 4 sub-agents and produces:
 *   1. A structured rehab plan (JSON) — source of truth for PDF + progress tracker
 *   2. A client summary (plain English) — sent to owner via Resend
 *   3. A vet summary (clinical) — stored in the patient record
 *
 * Called by: orchestratorAgent (after all sub-agents complete)
 * Passes result to: pdfGenerator, progressTrackerService, notificationService
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function runAssemblerAgent(intermediateResult, contextBrief) {
  const { patient, breedInsights, protocols, contraindications, exerciseSequence, warnings } =
    intermediateResult;

  console.log(`[AssemblerAgent] Assembling final plan for ${patient.patientId}`);

  // If contraindication agent flagged unsafe + requiresVetReview, short-circuit
  // with a draft plan marked for review — do not send to owner automatically
  const requiresVetReview =
    contraindications?.requiresVetReviewBeforeDelivery === true ||
    (contraindications?.safe === false && contraindications?.flags?.length > 0);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    system: `You are a senior veterinary rehabilitation specialist assembling
a complete, owner-ready rehabilitation plan from structured sub-agent outputs.
The plan must be clinically sound, warm in tone for the owner summary,
and precisely structured for the progress tracker.
Respond with valid JSON only — no prose, no markdown fences.`,
    messages: [
      {
        role: "user",
        content: `Assemble the final rehabilitation plan from these sub-agent outputs.

PATIENT: ${patient.patientName} (${patient.breed}, ${patient.ageMonths}mo)
OWNER: ${patient.ownerName}
CLINICAL BRIEF: ${JSON.stringify(contextBrief, null, 2)}

BREED INSIGHTS:
${JSON.stringify(breedInsights, null, 2)}

MATCHED PROTOCOLS:
${JSON.stringify(protocols?.matchedProtocols?.slice(0, 3) ?? [], null, 2)}

CONTRAINDICATIONS:
${JSON.stringify({
  safe: contraindications?.safe,
  absoluteContraindications: contraindications?.absoluteContraindications,
  safeCategories: contraindications?.safeCategories,
  flags: contraindications?.flags?.slice(0, 5),
}, null, 2)}

EXERCISE SEQUENCE (phases):
${JSON.stringify(exerciseSequence?.phases ?? [], null, 2)}

PIPELINE WARNINGS: ${warnings?.join("; ") || "none"}
REQUIRES VET REVIEW: ${requiresVetReview}

Produce the final plan:
{
  "planId": "auto",
  "status": "${requiresVetReview ? "pending_vet_review" : "approved"}",
  "createdAt": "ISO timestamp",

  "vetSummary": {
    "clinicalOverview": "2-3 sentence clinical summary for vet records",
    "keyFindings": ["finding 1", "finding 2"],
    "contraindicationNotes": "brief contraindication summary",
    "approvedProtocolIds": ["PROT-XXX"],
    "reviewRequired": ${requiresVetReview}
  },

  "clientSummary": {
    "headline": "warm 1-sentence headline for owner",
    "intro": "2-3 sentence warm intro explaining what this plan is",
    "whatToExpect": "paragraph describing the recovery journey in plain language",
    "yourRoleAsOwner": "paragraph explaining owner's role",
    "keyReminders": ["reminder 1", "reminder 2", "reminder 3"]
  },

  "progressTracker": {
    "totalWeeks": ${exerciseSequence?.totalWeeks ?? 12},
    "phases": [
      {
        "phaseNumber": 1,
        "phaseName": "phase name",
        "weekRange": "1-4",
        "milestones": ["milestone 1"],
        "checklistItems": [
          {
            "day": 1,
            "exerciseName": "name",
            "completed": false,
            "notes": ""
          }
        ]
      }
    ]
  },

  "pdfSections": {
    "coverTitle": "${patient.patientName}'s Rehabilitation Plan",
    "sections": [
      {
        "title": "section title",
        "content": "section content for PDF rendering"
      }
    ]
  },

  "pushNotification": {
    "title": "Your plan is ready 🐾",
    "body": "personalised 1-sentence push notification body for ${patient.ownerName}",
    "deepLink": "/plans/${patient.patientId}"
  }
}`,
      },
    ],
  });

  const raw = response.content[0]?.text ?? "{}";
  const plan = JSON.parse(raw);

  // Always stamp real timestamps — don't trust LLM-generated ones
  plan.createdAt = new Date().toISOString();
  plan.planId = `PLAN-${patient.patientId}-${Date.now()}`;

  return plan;
}
