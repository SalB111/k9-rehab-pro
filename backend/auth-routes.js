// ============================================================================
// K9-REHAB-PRO — AUTH ROUTES (Login + Register)
// Uses bcrypt, JWT, and db-provider
// ============================================================================

const express = require("express");
const router = express.Router();
const db = require("./db-provider");
const { verifyPassword, generateToken } = require("./auth");

// ============================================================================
// POST /api/auth/register
// ============================================================================

router.post("/register", async (req, res) => {
  try {
    const { username, password, display_name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existing = await db.findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // db-provider handles hashing internally
    const user = await db.createUser({
      username,
      password,
      display_name,
      role: "clinician"
    });

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        display_name: user.display_name
      }
    });

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ============================================================================
// POST /api/auth/login
// ============================================================================

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        display_name: user.display_name
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;