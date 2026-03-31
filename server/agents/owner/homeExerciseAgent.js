const exerciseLibrary = require("../shared/exerciseLibrary.json");

async function homeExerciseAgent({ ownerData, approvedPhase, approvedExercises }) {
  const speciesKey = ownerData.species === "feline" ? "FELINE" : "TPLO";
  const lib = exerciseLibrary[speciesKey] || {};

  const formatted = approvedExercises.map(ex => {
    const meta = lib[ex.id] || {};
    return {
      id: ex.id,
      name: meta.name || ex.id,
      frequency: meta.defaultFrequency || "1x/day",
      duration: meta.defaultDuration || "3–5 minutes",
      instructions: `${meta.name || ex.id} for ${ownerData.catName || ownerData.dogName || "your pet"}.`
    };
  });

  return {
    species: ownerData.species,
    phase: approvedPhase,
    exercises: formatted
  };
}

module.exports = homeExerciseAgent;