const loadBEAUBrain = require("./beauBrain");

function crossValidate() {
  const BEAU = loadBEAUBrain();

  const protocols = BEAU.protocols || [];
  const exercises = BEAU.exercises || {};
  const videos = BEAU.listVideos() || {};
  const approved = BEAU.approvedProtocols || [];

  const errors = {
    missingExercises: [],
    missingVideos: [],
    unapprovedProtocols: [],
    mismatchedSpecies: [],
    emptyPhases: [],
    duplicateExercises: []
  };

  for (const p of protocols) {
    const { protocolId, species, phases } = p;

    // 1) Approved?
    if (!approved.includes(protocolId)) {
      errors.unapprovedProtocols.push(protocolId);
    }

    // 2) Phases
    for (const [phaseKey, phase] of Object.entries(phases || {})) {
      const exList = phase.exercises || [];

      if (exList.length === 0) {
        errors.emptyPhases.push({ protocolId, phaseKey });
        continue;
      }

      const seen = new Set();

      for (const ex of exList) {
        // Duplicate within phase
        if (seen.has(ex.id)) {
          errors.duplicateExercises.push({ protocolId, phaseKey, exerciseId: ex.id });
        }
        seen.add(ex.id);

        // Exercise exists
        const exObj = exercises[species]?.[ex.id];
        if (!exObj) {
          errors.missingExercises.push({ protocolId, phaseKey, exerciseId: ex.id });
          continue;
        }

        // Species mismatch (if exercise declares species)
        if (exObj.species && exObj.species !== species) {
          errors.mismatchedSpecies.push({
            protocolId,
            phaseKey,
            exerciseId: ex.id,
            expected: species,
            found: exObj.species
          });
        }

        // Video exists (if required)
        if (!videos[ex.id]) {
          errors.missingVideos.push({ protocolId, phaseKey, exerciseId: ex.id });
        }
      }
    }
  }

  const hasErrors = Object.values(errors).some(arr => arr.length > 0);

  return {
    status: hasErrors ? "fail" : "ok",
    errors
  };
}

if (require.main === module) {
  console.log(JSON.stringify(crossValidate(), null, 2));
}

module.exports = { crossValidate };