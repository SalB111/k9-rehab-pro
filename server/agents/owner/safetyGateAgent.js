const approvedProtocols = require("../shared/approvedProtocols.json");

function selectPhaseKey(protocol, weeks) {
  if (!weeks || weeks <= 2) return "week1-2";
  if (weeks <= 6) return "week3-6";
  const keys = Object.keys(protocol.phases);
  return keys[keys.length - 1];
}

async function safetyGateAgent(ownerData) {
  const { species, condition, weeksPostSurgery } = ownerData;

  const protocol = approvedProtocols.protocols.find(
    p => p.species === species && p.condition === condition
  );

  if (!protocol) {
    return {
      allowed: false,
      reason: "No vet-approved home exercise protocol exists for this condition.",
      cta: {
        text: "Find a certified rehab veterinarian",
        url: "https://www.rehabvets.org/directory"
      }
    };
  }

  const phaseKey = selectPhaseKey(protocol, weeksPostSurgery);
  const phase = protocol.phases[phaseKey];

  return {
    allowed: true,
    species,
    protocolId: protocol.protocolId,
    phaseKey,
    phaseLabel: phase.label,
    exercises: phase.exercises
  };
}

module.exports = safetyGateAgent;