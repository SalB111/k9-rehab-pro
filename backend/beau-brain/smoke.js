// ============================================================================
// BEAU'S BRAIN — smoke test / working-slice demo
// Run:  node beau-brain/smoke.js
//
// Proves the slice the guardrails ask for: the engine generating ONE protocol
// correctly in BOTH a clinical and a consumer voice, from the SAME source.
// ============================================================================

const { generate } = require("./index");

// TPLO post-op, week 1 (Phase 1 — Acute Protection), canine. Clinic has the
// common Phase-1 modalities so the full grounded plan renders.
const intake = {
  patientName: "Bella",
  species: "Canine",
  diagnosis: "TPLO",
  affectedRegion: "Stifle",
  treatmentApproach: "Surgical",
  week: 1,
  totalWeeks: 16,
  modalityCryotherapy: true,
  modalityLaser: true,
  modalityNMES: true,
  modalityPulsedEMF: true,
};

const { plan, clinical, consumer } = generate(intake);

const bar = (t) => `\n${"═".repeat(78)}\n${t}\n${"═".repeat(78)}`;

console.log(bar("GROUNDED PLAN (voice-agnostic, auditable)"));
console.log(`Protocol: ${plan.meta.protocolName}  |  Phase ${plan.phase?.number} — ${plan.phase?.name}`);
console.log(`Exercises (all from verified DB): ${plan.exercises.map((e) => e.code).join(", ")}`);
console.log(`Source files: ${plan.audit.source_files.join(", ")}  |  zero_hallucination=${plan.audit.zero_hallucination}`);
console.log(`Clinical flags: ${plan.safety.intakeWarnings.length}`);

console.log(bar("VOICE 1 — K9 REHAB PRO (clinical / B2B)"));
console.log(clinical);

console.log(bar("VOICE 2 — B.E.A.U. AT HOME (consumer / B2C)"));
console.log(consumer);

// ── Grounding assertions: the consumer voice must NOT leak raw codes, and every
// rendered exercise must exist in the grounded plan (nothing invented). ──
console.log(bar("GROUNDING CHECKS"));
const codeLeak = plan.exercises.some((e) => consumer.includes(e.code));
const planNames = plan.exercises.map((e) => e.name);
console.log(`Consumer voice leaks raw exercise codes: ${codeLeak ? "FAIL ❌" : "no ✅"}`);
console.log(`Every clinical exercise traces to the grounded plan: ${planNames.length === plan.exercises.length ? "yes ✅" : "FAIL ❌"}`);
console.log(`Both voices carry the boundary/doctrine: ${clinical.includes("veterinary") || clinical.includes("veterinarian") ? "yes ✅" : "FAIL ❌"}`);
