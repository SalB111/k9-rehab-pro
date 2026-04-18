// Single source of truth for "is this host in demo mode?" and a middleware
// that hides any route it wraps unless DEMO_MODE=true. Wrap any temporary
// hot-patch with requireDemoMode so it can never accidentally reach prod.

function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

function requireDemoMode(req, res, next) {
  if (!isDemoMode()) return res.status(404).send("Not Found");
  return next();
}

function announceIfDemoMode(logger = console) {
  if (!isDemoMode()) return;
  const bar = "=".repeat(70);
  logger.warn(bar);
  logger.warn("  DEMO_MODE=true — demo-only routes are LIVE on this host.");
  logger.warn("  This must never be set in production.");
  logger.warn(bar);
}

module.exports = { isDemoMode, requireDemoMode, announceIfDemoMode };
