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
    try {
      await db.createUser(username, passwordHash, "user");
    } catch (err) {
      // A duplicate username is a client error, not a server failure. It used
      // to surface as a 500, which both misreported the cause and made this a
      // second enumeration oracle alongside /login.
      if (/UNIQUE|duplicate/i.test(String(err && err.message))) {
        return res.status(409).json({ error: "That username is taken" });
      }
      throw err;
    }

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------
// A bcrypt hash of nothing in particular, compared against when the username
// does not exist so that a failed login costs the same time either way.
// Without it, "no such user" returns immediately while a real username pays
// for a hash comparison, and that difference is measurable over enough
// requests. Generated once at module load; the value is never used.
const DUMMY_HASH = bcrypt.hashSync("no-such-user", 10);

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // SECURITY: validated BEFORE the lookup, and the same response either way.
    //
    // This previously fell through to bcrypt.compare(undefined, hash), which
    // throws and was caught as a 500. A real username therefore answered 500
    // and an unknown one answered 401, so anyone could enumerate every account
    // on this system by POSTing a username with no password. On a clinical
    // record system that is the first half of a credential handed out for
    // free. Rejecting here, before any database access, means the response
    // cannot depend on whether the account exists.
    if (typeof username !== "string" || typeof password !== "string" ||
        !username.trim() || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await db.findUserByUsername(username);

    // Always compare. For an unknown user the comparison is against a dummy
    // hash and can only fail, but it costs the same as a real one.
    const valid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !valid) return res.status(401).json({ error: "Invalid credentials" });

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