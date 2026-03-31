#!/usr/bin/env node

/**
 * BEAU Daily Decision Demo
 * ------------------------
 * Usage:
 *   node demoDaily.js <protocolId> <phaseKey> <flag1,flag2,...>
 *
 * Example:
 *   node demoDaily.js TPLO-8WK week3-6 "mild fatigue"
 */

const { buildDailyDecisionAndPlan } = require("./dailyPlanEngine");
const loadBEAUBrain = require("./beauBrain");

function parseFlags(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return input.split(",").map(f => f.trim()).filter(Boolean);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Usage: node demoDaily.js <protocolId> <phaseKey> <flags>");
    process.exit(1);
  }

  const protocolId = args[0];
  const phaseKey = args[1];
  const flags = parseFlags(args[2] || "");

  console.log("🔍 Loading BEAU Brain...");
  const BEAU = loadBEAUBrain();

  if (!BEAU.getProtocol(protocolId)) {
    console.log(`❌ Protocol '${protocolId}' not found.`);
    process.exit(1);
  }

  console.log(`\n🐾 Running BEAU Daily Decision Engine`);
  console.log(`Protocol: ${protocolId}`);
  console.log(`Phase: ${phaseKey}`);
  console.log(`Flags: ${flags.length ? flags.join(", ") : "none"}`);

  const result = buildDailyDecisionAndPlan(protocolId, phaseKey, flags);

  console.log("\n📘 Decision:");
  console.log(JSON.stringify(result.decision, null, 2));

  if (result.status === "halt") {
    console.log("\n🛑 HARD STOP — No plan generated.");
    return;
  }

  console.log("\n📗 Daily Plan:");
  console.log(JSON.stringify(result.dailyPlan, null, 2));

  console.log("\n✨ Done.");
}

main();