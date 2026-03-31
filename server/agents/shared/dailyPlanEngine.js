const loadBEAUBrain = require("./beauBrain");
const { buildDailyPlan } = require("./ownerPlanGenerator");
const { adaptiveDecision } = require("./adaptiveEngine");

/**
 * Apply intensity scaling to a daily plan.
 * This NEVER changes which exercises are present.
 * It ONLY annotates intensity for the UI/owner.
 */
function applyIntensityScaling(dailyPlan, intensity) {
  if (!dailyPlan || !dailyPlan.plan) return dailyPlan;

  const scaledExercises = (dailyPlan.plan.exercises || []).map(ex => {
    return {
      ...ex,
      intensity,
      intensityLabel:
        intensity === 1.0
          ? "full"
          : intensity >= 0.8
          ? "moderate"
          : intensity >= 0.6
          ? "reduced"
          : "light"
    };
  });

  return {
    ...dailyPlan,
    plan: {
      ...dailyPlan.plan,
      exercises: scaledExercises
    }
  };
}

/**
 * Build a full daily decision + plan bundle.
 *
 * Inputs:
 *   - protocolId: string
 *   - currentPhaseKey: string (e.g., "week1-2")
 *   - flags: string[] (owner/vet reported flags)
 *
 * Outputs:
 *   {
 *     status: "ok" | "halt" | "error",
 *     message: string,
 *     decision: { ...adaptiveDecision },
 *     dailyPlan: { ...ownerDailyPlan or null }
 *   }
 */
function buildDailyDecisionAndPlan(protocolId, currentPhaseKey, flags = []) {
  const BEAU = loadBEAUBrain();

  // Ensure protocol exists and is approved
  const protocol = BEAU.getProtocol(protocolId);
  if (!protocol) {
    return {
      status: "error",
      message: `Protocol '${protocolId}' not found.`,
      decision: null,
      dailyPlan: null
    };
  }

  if (!BEAU.isProtocolApproved(protocolId)) {
    return {
      status: "error",
      message: `Protocol '${protocolId}' is not approved.`,
      decision: null,
      dailyPlan: null
    };
  }

  // 1) Get adaptive decision (halt / hold / advance / maintain)
  const decisionResult = adaptiveDecision(protocolId, currentPhaseKey, flags);

  // If hard halt → no plan
  if (decisionResult.status === "halt") {
    return {
      status: "halt",
      message: decisionResult.message,
      decision: decisionResult.decision,
      dailyPlan: null
    };
  }

  // Determine which phase to build the plan from
  let targetPhaseKey = currentPhaseKey;

  if (decisionResult.status === "advance" && decisionResult.decision?.to) {
    targetPhaseKey = decisionResult.decision.to;
  } else if (
    (decisionResult.status === "maintain" || decisionResult.status === "soft-flag") &&
    decisionResult.decision?.phase
  ) {
    targetPhaseKey = decisionResult.decision.phase;
  }

  // 2) Build the daily plan for the target phase
  const dailyPlan = buildDailyPlan(protocolId, targetPhaseKey);
  if (dailyPlan.status !== "ok") {
    return {
      status: "error",
      message: dailyPlan.message,
      decision: decisionResult.decision,
      dailyPlan: null
    };
  }

  // 3) Apply intensity scaling based on decision
  let intensity = 1.0;

  if (decisionResult.status === "soft-flag" && decisionResult.decision?.intensity != null) {
    intensity = decisionResult.decision.intensity;
  } else if (decisionResult.status === "advance" || decisionResult.status === "maintain") {
    intensity = 1.0;
  }

  const scaledDailyPlan = applyIntensityScaling(dailyPlan, intensity);

  return {
    status: "ok",
    message: "Daily decision and plan generated.",
    decision: {
      ...decisionResult.decision,
      protocolId,
      phaseKey: targetPhaseKey
    },
    dailyPlan: scaledDailyPlan.plan
  };
}

module.exports = {
  buildDailyDecisionAndPlan
};