// ============================================================================
// K9-REHAB-PRO — AUTH ROUTES (CLEAN, MODERN, FULLY COMPATIBLE WITH SQLITE PROVIDER)
// ============================================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const db = require("./db-providers/sqlite-provider");

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "24h";

// ============================================================================
// REGISTER
// ============================================================================

router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Check if user exists
    const existing = await db.findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.createUser(username, passwordHash, role || "user");

    return res.json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ============================================================================
// LOGIN
// ============================================================================

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.findUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ============================================================================
// AUTH STATUS
// ============================================================================

router.get("/status", (req, res) => {
  return res.json({ status: "ok" });
});

module.exports = router;