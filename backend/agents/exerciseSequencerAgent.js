/**
 * exerciseSequencerAgent.js
 * K9 Rehab Pro — Sub-Agent 4: Exercise Sequencer
 *
 * Takes matched protocols and outputs a week-by-week phased exercise sequence
 * with frequency, progression criteria, and home-owner instructions.
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

export async function runExerciseSequencerAgent(patient, contextBrief) {
  console.log(`[ExerciseSequencerAgent] Building sequence from week ${patient.weeksPostOp}`);

  // Pull exercises from all protocols relevant to this patient
  const relevantExercises = APPROVED_PROTOCOLS.protocols
    .filter((p) =>
      p.targetConditions.some(
        (c) =>
          patient.diagnoses?.includes(c) ||
          patient.surgeries?.some((s) => s.toLowerCase().includes(c.toLowerCase()))
      )
    )
    .flatMap((p) =>
      p.exercises.map((e) => ({ ...e, protocolId: p.id, protocolName: p.name }))
    );

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `You are a certified canine rehabilitation therapist (CCRP).
Design a phased, progressive exercise sequence starting from the patient's
current recovery week. Each phase must have clear progression criteria.
Owner-facing instructions must be plain language, warm, and actionable.
Respond with valid JSON only — no prose, no markdown fences.`,
    messages: [
      {
        role: "user",
        content: `Design a phased rehab exercise sequence for this patient.

PATIENT CONTEXT: ${JSON.stringify(contextBrief, null, 2)}
CURRENT WEEK POST-OP: ${patient.weeksPostOp}
MOBILITY SCORE: ${patient.mobilityScore}/5
BREED RECOVERY MODIFIER: use standard unless breed notes suggest otherwise

AVAILABLE EXERCISES:
${JSON.stringify(relevantExercises.map((e) => ({
  name: e.name,
  category: e.category,
  intensityLevel: e.intensityLevel,
  durationSeconds: e.durationSeconds,
  reps: e.reps,
  sets: e.sets,
  protocolId: e.protocolId,
})), null, 2)}

Build a phased plan starting at week ${patient.weeksPostOp}. Respond with:
{
  "totalWeeks": 12,
  "startingWeek": ${patient.weeksPostOp},
  "phases": [
    {
      "phaseName": "Phase 1 — Early Recovery",
      "weekRange": "1–4",
      "goals": ["goal 1", "goal 2"],
      "frequencyPerDay": 2,
      "daysPerWeek": 7,
      "exercises": [
        {
          "name": "exercise name",
          "protocolId": "PROT-XXX",
          "category": "range_of_motion",
          "durationSeconds": 300,
          "reps": 10,
          "sets": 3,
          "ownerInstruction": "plain language instruction for home use",
          "warningSign": "stop if..."
        }
      ],
      "progressionCriteria": ["criteria to advance to next phase"],
      "vetCheckpoint": true
    }
  ],
  "homeSafetyReminders": ["reminder 1", "reminder 2"],
  "emergencyStopCriteria": ["criteria that require immediate vet contact"]
}`,
      },
    ],
  });

  return JSON.parse(response.content[0]?.text ?? "{}");
}
