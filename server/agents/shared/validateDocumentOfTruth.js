const loadBEAUBrain = require("./beauBrain");

function validateDocumentOfTruth() {
  const BEAU = loadBEAUBrain();

  const protocols = BEAU.protocols || [];
  const exercises = BEAU.exercises || {};
  const approved = BEAU.approvedProtocols || [];
  const constraints = BEAU.getConstraints();
  const redFlags = BEAU.listRedFlags();

  const errors = [];

  // 1) Approved protocol check
  for (const p of protocols) {
    if (!approved.includes(p.protocolId)) {
      errors.push({
        type: "unapproved-protocol",
        protocolId: p.protocolId
      });
    }
  }

  // 2) Condition must be in constraints
  for (const p of protocols) {
    if (!constraints.conditions.includes(p.condition)) {
      errors.push({
        type: "unknown-condition",
        protocolId: p.protocolId,
        condition: p.condition
      });
    }
  }

  // 3) Species must be allowed
  for (const p of protocols) {
    if (!constraints.species.includes(p.species)) {
      errors.push({
        type: "unknown-species",
        protocolId: p.protocolId,
        species: p.species
      });
    }
  }

  // 4) Validate each phase
  for (const p of protocols) {
    for (const [phaseKey, phase] of Object.entries(p.phases || {})) {
      const count = (phase.exercises || []).length;

      // min/max exercise count
      if (count < constraints.minExercisesPerPhase) {
        errors.push({
          type: "too-few-exercises",
          protocolId: p.protocolId,
          phaseKey,
          count
        });
      }

      if (count > constraints.maxExercisesPerPhase) {
        errors.push({
          type: "too-many-exercises",
          protocolId: p.protocolId,
          phaseKey,
          count
        });
      }

      // exercise existence + species match
      for (const ex of phase.exercises) {
        const exObj = exercises[p.species]?.[ex.id];

        if (!exObj) {
          errors.push({
            type: "missing-exercise",
            protocolId: p.protocolId,
            phaseKey,
            exerciseId: ex.id
          });
        }
      }
    }
  }

  // 5) Red flags must exist
  if (!redFlags.hardStops || redFlags.hardStops.length === 0) {
    errors.push({ type: "no-hard-stops-defined" });
  }

  // 6) Soft flags must exist
  if (!redFlags.softFlags || redFlags.softFlags.length === 0) {
    errors.push({ type: "no-soft-flags-defined" });
  }

  return {
    status: errors.length === 0 ? "ok" : "fail",
    errors
  };
}

if (require.main === module) {
  console.log(JSON.stringify(validateDocumentOfTruth(), null, 2));
}

module.exports = { validateDocumentOfTruth };