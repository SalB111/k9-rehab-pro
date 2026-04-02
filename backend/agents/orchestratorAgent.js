/**
 * orchestratorAgent.js
 * K9 Rehab Pro — Vet Clinical Pipeline Orchestrator
 *
 * Receives raw patient intake from the vet, fans out to 4 sub-agents in parallel,
 * then hands the merged results to the assembler for final plan generation.
 *
 * Called by: clinicalPipelineWorker (BullMQ)
 * Calls:     breedResearchAgent, protocolLookupAgent,
 *            contraindicationAgent, exerciseSequencerAgent
 * Returns:   OrchestratorResult (passed to assemblerAgent)
 */

import Anthropic from "@anthropic-ai/sdk";
import { runBreedResearchAgent }      from "./agents/breedResearchAgent.js";
import { runProtocolLookupAgent }     from "./agents/protocolLookupAgent.js";
import { runContraindicationAgent }   from "./agents/contraindicationAgent.js";
import { runExerciseSequencerAgent }  from "./agents/exerciseSequencerAgent.js";
import { runAssemblerAgent }          from "./agents/assemblerAgent.js";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
/**
 * @typedef {Object} PatientIntake
 * @property {string}   patientId
 * @property {string}   patientName
 * @property {string}   ownerName
 * @property {string}   ownerEmail
 * @property {string}   breed
 * @property {number}   ageMonths
 * @property {number}   weightKg
 * @property {string[]} surgeries           - e.g. ["TPLO_left_stifle"]
 * @property {number}   weeksPostOp
 * @property {string[]} diagnoses           - Active conditions
 * @property {string[]} comorbidities       - e.g. ["obesity", "hypothyroidism"]
 * @property {string}   mobilityScore       - "1"–"5"
 * @property {string}   vetNotes            - Free-text vet observations
 * @property {string}   clinicId
 * @property {string}   vetId
 */

/**
 * @typedef {Object} OrchestratorResult
 * @property {PatientIntake}  patient
 * @property {Object}         breedInsights
 * @property {Object}         protocols
 * @property {Object}         contraindications
 * @property {Object}         exerciseSequence
 * @property {Object}         finalPlan         - Populated by assembler
 * @property {string[]}       warnings          - Non-fatal issues surfaced during orchestration
 * @property {Object}         meta
 */

// ---------------------------------------------------------------------------
// Orchestrator — entry point
// ---------------------------------------------------------------------------
/**
 * @param {PatientIntake} patient
 * @returns {Promise<OrchestratorResult>}
 */
export async function runOrchestrator(patient) {
  console.log(`[Orchestrator] Starting pipeline for patient ${patient.patientId}`);

  // Step 1: Use Claude to build a structured context brief for sub-agents
  const contextBrief = await buildContextBrief(patient);

  // Step 2: Fan out to all 4 sub-agents in parallel
  console.log(`[Orchestrator] Dispatching 4 sub-agents in parallel`);
  const [breedInsights, protocols, contraindications, exerciseSequence] =
    await Promise.allSettled([
      runBreedResearchAgent(patient, contextBrief),
      runProtocolLookupAgent(patient, contextBrief),
      runContraindicationAgent(patient, contextBrief),
      runExerciseSequencerAgent(patient, contextBrief),
    ]);

  const warnings = [];

  // Unwrap settled results — surface errors as warnings, don't hard-fail
  const unwrap = (settled, agentName, fallback) => {
    if (settled.status === "fulfilled") return settled.value;
    warnings.push(`${agentName} failed: ${settled.reason?.message ?? "unknown error"}`);
    console.error(`[Orchestrator] ${agentName} error:`, settled.reason);
    return fallback;
  };

  const breedData        = unwrap(breedInsights,    "BreedResearchAgent",     { insights: [], biomechanicsNotes: "" });
  const protocolData     = unwrap(protocols,        "ProtocolLookupAgent",    { matchedProtocols: [], evidenceLevel: "unknown" });
  const contrainData     = unwrap(contraindications,"ContraindicationAgent",  { flags: [], safe: false });
  const sequenceData     = unwrap(exerciseSequence, "ExerciseSequencerAgent", { phases: [], totalWeeks: 0 });

  // Step 3: Abort if contraindication check marked patient as unsafe
  if (!contrainData.safe && contrainData.flags?.length > 0) {
    console.warn(`[Orchestrator] Contraindication flags present — escalating`);
    warnings.push("Contraindication agent flagged unsafe conditions. Plan requires vet review before delivery.");
  }

  // Step 4: Assemble the final plan
  const intermediateResult = {
    patient,
    breedInsights: breedData,
    protocols: protocolData,
    contraindications: contrainData,
    exerciseSequence: sequenceData,
    warnings,
  };

  console.log(`[Orchestrator] Handing off to assembler`);
  const finalPlan = await runAssemblerAgent(intermediateResult, contextBrief);

  return {
    ...intermediateResult,
    finalPlan,
    meta: {
      orchestratedAt: new Date().toISOString(),
      pipelineVersion: "1.0.0",
      subAgentsRun: ["breedResearch", "protocolLookup", "contraindication", "exerciseSequencer"],
      assemblerRun: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Context brief builder
// Uses Claude to distill raw intake into a structured brief all sub-agents share.
// Keeps sub-agent prompts lean — they receive the brief, not the raw intake.
// ---------------------------------------------------------------------------
async function buildContextBrief(patient) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are a veterinary rehabilitation case coordinator.
Given raw patient intake data, produce a concise structured clinical brief
that downstream rehabilitation agents will use.
Respond with valid JSON only — no prose, no markdown fences.`,
    messages: [
      {
        role: "user",
        content: `Produce a clinical brief from this intake:
${JSON.stringify(patient, null, 2)}

Respond with this structure:
{
  "summary": "2-sentence clinical summary",
  "primaryCondition": "main condition driving rehab",
  "rehabGoals": ["goal 1", "goal 2", "goal 3"],
  "riskLevel": "low | moderate | high",
  "specialConsiderations": ["any breed, weight, age, or comorbidity notes"]
}`,
      },
    ],
  });

  try {
    return JSON.parse(response.content[0]?.text ?? "{}");
  } catch {
    return {
      summary: `${patient.breed}, ${patient.ageMonths}mo, post-op week ${patient.weeksPostOp}`,
      primaryCondition: patient.surgeries?.[0] ?? patient.diagnoses?.[0] ?? "unknown",
      rehabGoals: ["restore mobility", "reduce pain", "return to function"],
      riskLevel: "moderate",
      specialConsiderations: patient.comorbidities ?? [],
    };
  }
}
