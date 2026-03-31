const safetyGateAgent = require("./safetyGateAgent");
const homeExerciseAgent = require("./homeExerciseAgent");
const videoAgent = require("./videoAgent");
const progressTrackerAgent = require("./progressTrackerAgent");
const assembleOwnerPackage = require("./assembleOwnerPackage");

async function runOwnerPipeline(ownerData) {
  const gateResult = await safetyGateAgent(ownerData);

  if (!gateResult.allowed) {
    return {
      type: "REFER_TO_VET",
      reason: gateResult.reason,
      cta: gateResult.cta
    };
  }

  const homeExercisePlan = await homeExerciseAgent({
    ownerData,
    approvedPhase: gateResult.phaseKey,
    approvedExercises: gateResult.exercises
  });

  const videoRecommendations = await videoAgent({
    condition: ownerData.condition,
    phaseKey: gateResult.phaseKey,
    species: ownerData.species,
    approvedExercises: gateResult.exercises
  });

  const progressTracker = await progressTrackerAgent({
    species: ownerData.species,
    dogName: ownerData.dogName,
    catName: ownerData.catName,
    weeksPostSurgery: ownerData.weeksPostSurgery
  });

  return assembleOwnerPackage({
    ownerData,
    gateResult,
    homeExercisePlan,
    videoRecommendations,
    progressTracker
  });
}

module.exports = runOwnerPipeline;