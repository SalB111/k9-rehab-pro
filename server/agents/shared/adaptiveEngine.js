const loadBEAUBrain = require("./beauBrain");

/**
 * Adaptive Engine
 * ----------------
 * This engine NEVER invents exercises or protocol structure.
 * It ONLY adjusts:
 *   - phase progression
 *   - intensity scaling
 *   - holds/regressions
 *   - safety halts
 * based on red flags and predefined rules.
 */

function evaluateFlags(flags, redFlags) {
  const { hardStops, softFlags } = redFlags;

  const triggeredHard = [];
  const triggeredSoft = [];

  for (const f of flags || []) {
    if (hardStops.includes(f)) triggeredHard.push(f);
    if (softFlags.includes(f)) triggeredSoft.push(f);
  }

  return { triggeredHard, triggeredSoft };
}

function computeIntensity(baseIntensity, softCount) {
  // Intensity is a simple deterministic scale:
  // 0 soft flags → 100%
  // 1 soft flag  → 80%
  // 2 soft flags → 60%
  // 3+ soft flags → 40%
  const scale = [1.0, 0.8, 0.6, 0.4];
  const index = Math.min(softCount, 3);
  return baseIntensity * scale[index];
}

function nextPhase(protocol, currentPhaseKey) {
  const keys = Object.keys(protocol.phases || {});
  const idx = keys.indexOf(currentPhaseKey);
  if (idx === -1 || idx === keys.length - 1) return currentPhaseKey;
  return keys[idx + 1];
}

function adaptiveDecision(protocolId, currentPhaseKey, flags = []) {
  const BEAU = loadBEAUBrain();

  const protocol = BEAU.getProtocol(protocolId);
  if (!protocol) {
    return {
      status: "error",
      message: `Protocol '${protocolId}' not found.`,
      decision: null
    };
  }

  const redFlags = BEAU.listRedFlags();
  const { triggeredHard, triggeredSoft } = evaluateFlags(flags, redFlags);

  // HARD STOP → immediate halt
  if (triggeredHard.length > 0) {
    return {
      status: "halt",
      message: "Hard clinical stop triggered.",
      decision: {
        action: "halt",
        reason: triggeredHard,
        phase: currentPhaseKey,
        intensity: 0
      }
    };
  }

  // SOFT FLAGS → reduce intensity, hold phase
  if (triggeredSoft.length > 0) {
    const intensity = computeIntensity(1.0, triggeredSoft.length);

    return {
      status: "soft-flag",
      message: "Soft flags detected. Holding phase and reducing intensity.",
      decision: {
        action: "hold",
        reason: triggeredSoft,
        phase: currentPhaseKey,
        intensity
      }
    };
  }

  // NO FLAGS → progress if possible
  const next = nextPhase(protocol, currentPhaseKey);

  if (next !== currentPhaseKey) {
    return {
      status: "advance",
      message: "No flags detected. Advancing to next phase.",
      decision: {
        action: "advance",
        from: currentPhaseKey,
        to: next,
        intensity: 1.0
      }
    };
  }

  // Already at final phase → maintain
  return {
    status: "maintain",
    message: "No flags detected. Maintaining current phase.",
    decision: {
      action: "maintain",
      phase: currentPhaseKey,
      intensity: 1.0
    }
  };
}

module.exports = {
  adaptiveDecision
};