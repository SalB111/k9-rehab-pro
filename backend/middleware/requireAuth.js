// ============================================================================
// requireAuth — JWT authentication middleware for K9 Rehab Pro
// ============================================================================
// Verifies JWT token from Authorization: Bearer <token> header.
// Attaches decoded user object to req.user on success.
// Returns 401 if token is missing, invalid, or expired.
// ============================================================================

const jwt = require("jsonwebtoken");
const db = require("../db-provider");

// Must match the secret used by auth-routes.js to sign. If JWT_SECRET is
// missing, auth-routes.js already throws at boot — this file will never
// load with a broken env. Splitting previously used two different random
// fallbacks (sign-with-A, verify-with-B → every token invalid).
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("FATAL: JWT_SECRET environment variable is required and must be at least 32 chars.");
}
const JWT_SECRET = process.env.JWT_SECRET;

// ── DEV-ONLY AUTH BYPASS ────────────────────────────────────────────────────
// Enabled ONLY when DEV_AUTH_BYPASS=true AND NODE_ENV is not "production".
// Off unless both hold — a clinical product must never ship an auth hole that
// a single stray env var can open in prod. Delete the env line to restore
// normal login; no code change needed.
const BYPASS =
  String(process.env.DEV_AUTH_BYPASS || "").toLowerCase() === "true" &&
  process.env.NODE_ENV !== "production";

if (BYPASS) {
  console.warn("");
  console.warn("  ****************************************************************");
  console.warn("  *  AUTHENTICATION IS DISABLED (DEV_AUTH_BYPASS=true)           *");
  console.warn("  *  Every request runs as the dev user. Do NOT expose this port.*");
  console.warn("  *  Remove DEV_AUTH_BYPASS from backend/.env to restore login.  *");
  console.warn("  ****************************************************************");
  console.warn("");
} else if (String(process.env.DEV_AUTH_BYPASS || "").toLowerCase() === "true") {
  console.error("DEV_AUTH_BYPASS was set but NODE_ENV=production — bypass REFUSED.");
}

// Identity used while the bypass is active. Real row if one exists, so
// anything joining on user id still works; otherwise a synthetic admin.
async function devUser() {
  try {
    if (typeof db.findUserById === "function") {
      const u = await db.findUserById(1);
      if (u) return { id: u.id, username: u.username, role: u.role };
    }
  } catch { /* fall through to synthetic */ }
  return { id: 1, username: "dev-bypass", role: "admin" };
}

async function requireAuth(req, res, next) {
  if (BYPASS) {
    req.user = await devUser();
    res.set("X-Auth-Bypass", "1");
    return next();
  }
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in database
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    // Attach user to request for downstream use
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired — please log in again" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }
    return res.status(401).json({ success: false, error: "Authentication failed" });
  }
}

module.exports = requireAuth;
