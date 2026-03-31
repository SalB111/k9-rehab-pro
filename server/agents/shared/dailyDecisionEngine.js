// Simple thresholds – you can tune these per condition later
const RULES = {
  default: {
    advanceCleanDays: 5,      // days with no flags to consider advancing
    holdPainDays: 2,          // consecutive pain days to hold
    regressRegressionDays: 1, // any regression → regress
    holdSwellingDays: 1       // any swelling → hard hold
  }
};

function updateFlagsHistory(flagsHistory, todayFlags, maxDays = 7) {
  const updated = [...flagsHistory, { date: new Date().toISOString(), flags: todayFlags }];
  if (updated.length > maxDays) updated.shift();
  return updated;
}

function countRecentFlag(flagsHistory, flag, daysBack) {
  const recent = flagsHistory.slice(-daysBack);
  return recent.filter(entry => entry.flags.includes(flag)).length;
}

function evaluateDailyProgress(state, todayFlags, condition = "default") {
  const rules = RULES[condition] || RULES.default;

  const updatedFlagsHistory = updateFlagsHistory(state.flagsHistory || [], todayFlags);

  const painCount = countRecentFlag(updatedFlagsHistory, "pain", rules.holdPainDays);
  const swellingCount = countRecentFlag(updatedFlagsHistory, "swelling", rules.holdSwellingDays);
  const regressionCount = countRecentFlag(updatedFlagsHistory, "regression", rules.regressRegressionDays);

  const cleanDays = updatedFlagsHistory.filter(e => e.flags.length === 0).length;

  let action = "hold";
  let reason = "Default hold for safety.";
  let newPhaseIndex = state.currentPhaseIndex || 0;

  if (swellingCount > 0) {
    action = "hold";
    reason = "Swelling detected – holding phase.";
  } else if (regressionCount > 0) {
    action = "regress";
    newPhaseIndex = Math.max(0, newPhaseIndex - 1);
    reason = "Regression detected – regressing one phase.";
  } else if (painCount >= rules.holdPainDays) {
    action = "hold";
    reason = "Repeated pain – holding phase.";
  } else if (cleanDays >= rules.advanceCleanDays) {
    action = "advance";
    newPhaseIndex = newPhaseIndex + 1;
    reason = "Sustained clean days – advancing phase.";
  } else {
    action = "hold";
    reason = "Insufficient clean days to advance – holding.";
  }

  return {
    action,
    reason,
    newState: {
      ...state,
      currentPhaseIndex: newPhaseIndex,
      flagsHistory: updatedFlagsHistory,
      lastDecision: {
        at: new Date().toISOString(),
        action,
        reason,
        todayFlags
      }
    }
  };
}

module.exports = {
  evaluateDailyProgress
};