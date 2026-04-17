// ============================================================================
// requireAuth — JWT authentication middleware for K9 Rehab Pro
// ============================================================================
// Verifies JWT token from Authorization: Bearer <token> header.
// Attaches decoded user object to req.user on success.
// Returns 401 if token is missing, invalid, or expired.
// ============================================================================

const jwt = require("jsonwebtoken");
const db = require("../db-providers/sqlite-provider");

const JWT_SECRET = process.env.JWT_SECRET || require("crypto").randomBytes(64).toString("hex");

async function requireAuth(req, res, next) {
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
