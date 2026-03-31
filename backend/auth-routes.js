const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("./db-providers/sqlite-provider");

const router = express.Router();

// ---------------------------------------------------------------------------
// REGISTER
// ---------------------------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Hash password correctly
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with correct argument order
    await db.createUser(username, passwordHash, role || "user");

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

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;