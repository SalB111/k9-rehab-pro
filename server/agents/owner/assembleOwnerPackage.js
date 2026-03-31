function assembleOwnerPackage({ ownerData, gateResult, homeExercisePlan, videoRecommendations, progressTracker }) {
  const safetyMessage =
    ownerData.species === "feline"
      ? "Stop exercises if your cat hides, withdraws, stops engaging, or shows irritability."
      : "Stop exercises if you see increased limping, swelling, or pain.";

  return {
    type: "OWNER_PLAN",
    species: ownerData.species,
    condition: ownerData.condition,
    phase: gateResult.phaseKey,
    phaseLabel: gateResult.phaseLabel,
    homeExercisePlan,
    videoRecommendations,
    progressTracker,
    safety: { message: safetyMessage },
    meta: {
      vetApprovedProtocol: true,
      protocolId: gateResult.protocolId
    }
  };
}

module.exports = assembleOwnerPackage;