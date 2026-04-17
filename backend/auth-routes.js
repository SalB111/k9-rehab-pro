const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db-provider");

const router = express.Router();

// Fail loud at boot — a missing JWT_SECRET silently destabilizes auth
// because each import creates its own random fallback, so signed tokens
// verify against a different key and every user is logged out on restart.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is required and must be at least 32 chars. " +
    "Generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
  );
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// ---------------------------------------------------------------------------
// REGISTER
// ---------------------------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    // SECURITY: do NOT accept `role` from the request body. Anonymous
    // registration would allow trivial privilege escalation to admin
    // via `POST /api/auth/register { role: "admin" }`. Every self-service
    // registration creates a "user"; admin roles are provisioned separately.
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }
    if (username.length < 3 || username.length > 64) {
      return res.status(400).json({ error: "Username must be 3–64 characters" });
    }
    if (password.length < 8 || password.length > 200) {
      return res.status(400).json({ error: "Password must be 8–200 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.createUser(username, passwordHash, "user");

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.findUserByUsername(username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;