const loadBEAUBrain = require("./beauBrain");

/**
 * Build an owner-safe plan from a protocol.
 * This function NEVER invents exercises, parameters, or phases.
 * It ONLY transforms the Document of Truth into an owner-facing structure.
 */
function buildOwnerPlan(protocolId) {
  const BEAU = loadBEAUBrain();

  const protocol = BEAU.getProtocol(protocolId);
  if (!protocol) {
    return {
      status: "error",
      message: `Protocol '${protocolId}' not found in BEAU Brain.`,
      plan: null
    };
  }

  // Ensure protocol is approved
  if (!BEAU.isProtocolApproved(protocolId)) {
    return {
      status: "error",
      message: `Protocol '${protocolId}' is not approved.`,
      plan: null
    };
  }

  const constraints = BEAU.getConstraints();
  const redFlags = BEAU.listRedFlags();
  const exercisesBySpecies = BEAU.listExercisesBySpecies(protocol.species);
  const videos = BEAU.listVideos();

  const ownerPlan = {
    protocolId: protocol.protocolId,
    species: protocol.species,
    condition: protocol.condition,
    version: protocol.version || null,
    hash: protocol.hash || null,
    phases: {},
    redFlags: {
      hardStops: redFlags.hardStops,
      softFlags: redFlags.softFlags
    }
  };

  // Transform each phase into an owner-safe structure
  for (const [phaseKey, phase] of Object.entries(protocol.phases || {})) {
    const phaseExercises = [];

    for (const ex of phase.exercises || []) {
      const exObj = exercisesBySpecies[ex.id];

      // Skip exercises missing from the library (BEAU Brain validation will catch this)
      if (!exObj) continue;

      // Skip exercises not marked homeSafe
      if (!ex.homeSafe) continue;

      phaseExercises.push({
        id: ex.id,
        name: exObj.name || ex.id,
        description: exObj.description || "",
        frequency: exObj.frequency || "as directed",
        duration: exObj.duration || "as directed",
        notes: exObj.notes || "",
        video: videos[ex.id] || null
      });
    }

    ownerPlan.phases[phaseKey] = {
      label: phase.label || phaseKey,
      exercises: phaseExercises
    };
  }

  return {
    status: "ok",
    message: "Owner plan generated successfully.",
    plan: ownerPlan
  };
}

/**
 * Build a single-day plan from a protocol phase.
 * This is a pure transform — no hallucination, no new exercises.
 */
function buildDailyPlan(protocolId, phaseKey) {
  const BEAU = loadBEAUBrain();

  const protocol = BEAU.getProtocol(protocolId);
  if (!protocol) {
    return {
      status: "error",
      message: `Protocol '${protocolId}' not found.`,
      plan: null
    };
  }

  const phase = protocol.phases?.[phaseKey];
  if (!phase) {
    return {
      status: "error",
      message: `Phase '${phaseKey}' not found in protocol '${protocolId}'.`,
      plan: null
    };
  }

  const exercisesBySpecies = BEAU.listExercisesBySpecies(protocol.species);
  const videos = BEAU.listVideos();

  const dailyExercises = [];

  for (const ex of phase.exercises || []) {
    const exObj = exercisesBySpecies[ex.id];
    if (!exObj) continue;
    if (!ex.homeSafe) continue;

    dailyExercises.push({
      id: ex.id,
      name: exObj.name || ex.id,
      description: exObj.description || "",
      frequency: exObj.frequency || "as directed",
      duration: exObj.duration || "as directed",
      notes: exObj.notes || "",
      video: videos[ex.id] || null
    });
  }

  return {
    status: "ok",
    message: "Daily plan generated.",
    plan: {
      protocolId,
      phaseKey,
      exercises: dailyExercises
    }
  };
}

module.exports = {
  buildOwnerPlan,
  buildDailyPlan
};