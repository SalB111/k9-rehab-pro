// ============================================================================
// K9-REHAB-PRO â€” BACKEND SERVER (PRODUCTION READY)
// ============================================================================

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = require("./db-providers/sqlite-provider");
const { all, get, run } = require("./db-providers/sqlite-provider");
const authRoutes = require("./auth-routes");

const app = express();
const PORT = process.env.PORT || 10000;

// ---------------------------------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------------------------------

app.use(cors({
  origin: [
    "https://k9-rehab-pro.vercel.app",
    "https://k9-rehab-pro-gcnl.vercel.app",
    "https://k9-rehab-pro-frontend.onrender.com",
    "https://k9-rehab-pro.onrender.com",
    "http://localhost:3001",
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json());

// ---------------------------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "K9 Rehab Pro backend running" });
});

// ---------------------------------------------------------------------------
// AUTH ROUTES
// ---------------------------------------------------------------------------

app.use("/api/auth", authRoutes);

// ---------------------------------------------------------------------------
// PATIENTS
// ---------------------------------------------------------------------------

app.get("/api/patients", async (req, res) => {
  try {
    const patients = await all("SELECT * FROM patients ORDER BY created_at DESC");
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/patients/:id", async (req, res) => {
  try {
    const patient = await get("SELECT * FROM patients WHERE id = ?", [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/patients", async (req, res) => {
  try {
    const {
      name, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score, pain_level,
      mobility_level, current_medications, medical_history,
      special_instructions, client_name, client_email, client_phone, referring_vet
    } = req.body;
    const result = await run(
      `INSERT INTO patients (
        name, breed, age, weight, sex, condition, affected_region,
        surgery_date, lameness_grade, body_condition_score, pain_level,
        mobility_level, current_medications, medical_history,
        special_instructions, client_name, client_email, client_phone, referring_vet
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name, breed, age, weight, sex, condition, affected_region,
        surgery_date, lameness_grade || 0, body_condition_score || 5,
        pain_level || 5, mobility_level || "Moderate", current_medications,
        medical_history, special_instructions, client_name,
        client_email, client_phone, referring_vet
      ]
    );
    const patient = await get("SELECT * FROM patients WHERE id = ?", [result.lastID]);
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  try {
    const {
      name, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score, pain_level,
      mobility_level, current_medications, medical_history,
      special_instructions, client_name, client_email, client_phone, referring_vet
    } = req.body;
    await run(
      `UPDATE patients SET
        name=?, breed=?, age=?, weight=?, sex=?, condition=?,
        affected_region=?, surgery_date=?, lameness_grade=?,
        body_condition_score=?, pain_level=?, mobility_level=?,
        current_medications=?, medical_history=?, special_instructions=?,
        client_name=?, client_email=?, client_phone=?, referring_vet=?
      WHERE id=?`,
      [
        name, breed, age, weight, sex, condition, affected_region,
        surgery_date, lameness_grade, body_condition_score, pain_level,
        mobility_level, current_medications, medical_history,
        special_instructions, client_name, client_email, client_phone,
        referring_vet, req.params.id
      ]
    );
    const patient = await get("SELECT * FROM patients WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  try {
    await run("DELETE FROM patients WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// EXERCISES
// ---------------------------------------------------------------------------

// Database-backed exercises
app.get("/api/exercises", async (req, res) => {
  try {
    const exercises = await all("SELECT * FROM exercises_v2 ORDER BY name ASC");
    res.json({ success: true, data: exercises });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full exercise library — curated 125 exercises with species separation
const { ALL_EXERCISES } = require("./all-exercises");
const CURATED_CODES = new Set(require("./curated-codes.json"));

// Build curated library with proper species tagging
const CURATED_EXERCISES = ALL_EXERCISES
  .filter(ex => CURATED_CODES.has(ex.code))
  .map(ex => {
    const isFeline = ex.code.startsWith("FELINE");
    return {
      ...ex,
      category: isFeline ? "Feline Rehabilitation" : ex.category,
      clinical_classification: {
        ...ex.clinical_classification,
        species: isFeline ? "FELINE" : "CANINE",
      },
    };
  });

console.log(`📚 Curated library: ${CURATED_EXERCISES.length} exercises (${CURATED_EXERCISES.filter(e=>e.code.startsWith('FELINE')).length} feline, ${CURATED_EXERCISES.filter(e=>!e.code.startsWith('FELINE')).length} canine)`);

app.get("/api/v2/exercises", (req, res) => {
  try {
    const { species, category, difficulty } = req.query;
    let exercises = CURATED_EXERCISES;

    // Species filter
    if (species) {
      exercises = exercises.filter(ex =>
        ex.clinical_classification?.species?.toLowerCase() === species.toLowerCase()
      );
    }

    // Category filter
    if (category) {
      exercises = exercises.filter(ex =>
        ex.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficulty) {
      exercises = exercises.filter(ex =>
        ex.difficulty_level?.toLowerCase() === difficulty.toLowerCase()
      );
    }

    res.json({ success: true, data: exercises, total: exercises.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/exercises/:id", async (req, res) => {
  try {
    const exercise = await get("SELECT * FROM exercises_v2 WHERE id = ?", [req.params.id]);
    if (!exercise) return res.status(404).json({ success: false, error: "Exercise not found" });
    res.json({ success: true, data: exercise });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// SESSIONS
// ---------------------------------------------------------------------------

app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await all(`
      SELECT s.*, p.name as patient_name, p.breed as patient_breed
      FROM sessions s
      LEFT JOIN patients p ON s.patient_id = p.id
      ORDER BY s.session_date DESC
    `);
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/sessions/:id", async (req, res) => {
  try {
    const session = await get(`
      SELECT s.*, p.name as patient_name, p.breed as patient_breed
      FROM sessions s
      LEFT JOIN patients p ON s.patient_id = p.id
      WHERE s.session_id = ?
    `, [req.params.id]);
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/sessions", async (req, res) => {
  try {
    const {
      patient_id, protocol_id, session_date, therapist_name,
      pre_session_pain, post_session_pain,
      pre_session_lameness, post_session_lameness, session_notes
    } = req.body;
    const result = await run(
      `INSERT INTO sessions (
        patient_id, protocol_id, session_date, therapist_name,
        pre_session_pain, post_session_pain,
        pre_session_lameness, post_session_lameness, session_notes
      ) VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        patient_id, protocol_id, session_date, therapist_name,
        pre_session_pain, post_session_pain,
        pre_session_lameness, post_session_lameness, session_notes
      ]
    );
    const session = await get("SELECT * FROM sessions WHERE session_id = ?", [result.lastID]);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// CLINICS
// ---------------------------------------------------------------------------

app.get("/api/clinics", async (req, res) => {
  try {
    const clinics = await all("SELECT * FROM clinics");
    res.json({ success: true, data: clinics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/clinics", async (req, res) => {
  try {
    const {
      clinic_name, contact_email, phone, address,
      website, license_number, primary_color, secondary_color
    } = req.body;
    const result = await run(
      `INSERT INTO clinics (
        clinic_name, contact_email, phone, address,
        website, license_number, primary_color, secondary_color
      ) VALUES (?,?,?,?,?,?,?,?)`,
      [clinic_name, contact_email, phone, address,
       website, license_number, primary_color, secondary_color]
    );
    const clinic = await get("SELECT * FROM clinics WHERE id = ?", [result.lastID]);
    res.status(201).json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/clinics/:id", async (req, res) => {
  try {
    const {
      clinic_name, contact_email, phone, address,
      website, license_number, primary_color, secondary_color
    } = req.body;
    await run(
      `UPDATE clinics SET
        clinic_name=?, contact_email=?, phone=?, address=?,
        website=?, license_number=?, primary_color=?, secondary_color=?,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=?`,
      [clinic_name, contact_email, phone, address,
       website, license_number, primary_color, secondary_color, req.params.id]
    );
    const clinic = await get("SELECT * FROM clinics WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AGENT PIPELINE ROUTES
// ---------------------------------------------------------------------------

const { runSafetyGateAgent } = require("./agents/safetyGateAgent");

// Owner-triggered home exercise session (safety-gated)
app.post("/api/pipeline/home-session", async (req, res) => {
  try {
    console.log("[Pipeline] Owner home-session request received");
    const result = await runSafetyGateAgent(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[Pipeline] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Pipeline health check
app.get("/api/pipeline/status", (req, res) => {
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    status: "ok",
    agents: [
      "orchestratorAgent",
      "breedResearchAgent",
      "protocolLookupAgent",
      "contraindicationAgent",
      "exerciseSequencerAgent",
      "assemblerAgent",
      "safetyGateAgent",
    ],
    approvedProtocols: 4,
    aiConfigured: hasAnthropicKey,
  });
});

// ---------------------------------------------------------------------------
// INITIALIZATION SEQUENCE
// ---------------------------------------------------------------------------

(async () => {
  try {
    console.log("K9 Rehab Pro backend starting...");
    await db.initialize();
    await db.createTables();
    await db.seedV2Library();

    const existingAdmin = await db.findUserByUsername("admin");
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("Rehab2026!", 10);
      await db.createUser("admin", passwordHash, "admin");
      console.log("âœ… Default admin user created");
    } else {
      console.log("âœ… Admin user exists");
    }

    app.listen(PORT, () => {
      console.log(`K9 Rehab Pro backend running on port ${PORT}`);
    });

  } catch (err) {
    console.error("âŒ Fatal startup error:", err);
    process.exit(1);
  }
})();
// deploy trigger

