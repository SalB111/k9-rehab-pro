// ============================================================================
// K9-REHAB-PRO — MAIN BACKEND SERVER (CLEAN, MODERN, PRODUCTION READY)
// ============================================================================

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = require("./db-providers/sqlite-provider");
const authRoutes = require("./auth-routes");

const app = express();
const PORT = process.env.PORT || 10000;

// ---------------------------------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------------------------------

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running" });
});

// ---------------------------------------------------------------------------
// AUTH ROUTES
// ---------------------------------------------------------------------------

app.use("/api/auth", authRoutes);

// ---------------------------------------------------------------------------
// INITIALIZATION SEQUENCE (CRITICAL ORDER)
// ---------------------------------------------------------------------------

(async () => {
  try {
    console.log("K9 Rehab Pro backend starting…");

    // 1. Connect to SQLite
    await db.initialize();

    // 2. Create all tables (including USERS)
    await db.createTables();

    // 3. Seed V2 exercise library
    await db.seedV2Library();

    // 4. Create default admin ONLY AFTER tables exist
    const existingAdmin = await db.findUserByUsername("admin");

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("Rehab2026!", 10);
      await db.createUser("admin", passwordHash, "admin");
      console.log("✅ Default admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // 5. Start server
    app.listen(PORT, () => {
      console.log(`K9 Rehab Pro backend running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Fatal startup error:", err);
    process.exit(1);
  }
})();