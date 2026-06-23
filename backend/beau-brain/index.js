// ============================================================================
// BEAU'S BRAIN — Public API
// © 2026 Salvatore Bonanno. All rights reserved.
//
// The shared clinical engine: ONE verified evidence base, TWO voices.
//   generate(intake) → { plan, clinical, consumer }
//     • plan     — the grounded, voice-agnostic BrainPlan (auditable)
//     • clinical — K9 Rehab Pro (B2B) presentation
//     • consumer — B.E.A.U. at Home (B2C) presentation
// ============================================================================

const { generateProtocolPlan } = require("./engine");
const { renderClinical, renderConsumer } = require("./voices");
const { IDENTITY, DOCTRINE_TEXT } = require("./doctrine");

/**
 * Generate a protocol in both voices from one grounded plan.
 * @param {Object} intake
 * @param {Object} [opts] - { voice?: "clinical" | "consumer" | "both" }
 */
function generate(intake = {}, opts = {}) {
  const plan = generateProtocolPlan(intake);
  const voice = opts.voice || "both";

  const out = { plan };
  if (voice === "clinical" || voice === "both") out.clinical = renderClinical(plan);
  if (voice === "consumer" || voice === "both") out.consumer = renderConsumer(plan);
  return out;
}

module.exports = {
  generate,
  generateProtocolPlan,
  renderClinical,
  renderConsumer,
  IDENTITY,
  DOCTRINE_TEXT,
};
