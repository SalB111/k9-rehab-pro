// ============================================================================
// K9-REHAB-PRO â€” BACKEND SERVER (PRODUCTION READY)
// ============================================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = require("./db-providers/sqlite-provider");
const { all, get, run } = require("./db-providers/sqlite-provider");
const authRoutes = require("./auth-routes");

const app = express();
const PORT = process.env.PORT || 10000;

// ---------------------------------------------------------------------------
// SECURITY MIDDLEWARE
// ---------------------------------------------------------------------------

// Helmet — security headers (XSS, clickjacking, MIME sniffing protection)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disabled for SPA compatibility
}));

// Rate limiting — general API (10000 req/15min — LEAP-proof)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Rate limiting — auth endpoints (1000 req/15min — LEAP-proof)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
});

// Rate limiting — B.E.A.U. chat (10000 req/15min — LEAP-proof)
const beauLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Chat rate limit reached, please wait a moment" },
});

// ---------------------------------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------------------------------

app.use(cors({
  origin: [
    "https://k9-rehab-pro.vercel.app",
    "https://k9-rehab-pro-gcnl.vercel.app",
    "https://k9-rehab-pro-frontend.onrender.com",
    "https://k9-rehab-pro.onrender.com",
    "https://beau-ai-lime.vercel.app",
    "https://beauaihome.vercel.app",
    "https://beauaihome-salb111s-projects.vercel.app",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json());
app.use("/api", generalLimiter);

// ---------------------------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------------------------

// Redirect non-prefixed routes to /api/* (handles VITE_API_URL without /api suffix)
app.use((req, res, next) => {
  if (!req.path.startsWith("/api") && !req.path.startsWith("/assets") && req.path !== "/") {
    const apiPath = `/api${req.path}`;
    req.url = apiPath;
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "K9 Rehab Pro backend running" });
});

// ---------------------------------------------------------------------------
// AUTH ROUTES
// ---------------------------------------------------------------------------

app.use("/api/auth", authLimiter, authRoutes);

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
      name, species, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score, pain_level,
      mobility_level, current_medications, medical_history,
      special_instructions, client_name, client_email, client_phone, referring_vet
    } = req.body;
    const result = await run(
      `INSERT INTO patients (
        name, species, breed, age, weight, sex, condition, affected_region,
        surgery_date, lameness_grade, body_condition_score, pain_level,
        mobility_level, current_medications, medical_history,
        special_instructions, client_name, client_email, client_phone, referring_vet
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name, species || "canine", breed, age, weight, sex, condition, affected_region,
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
      name, species, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score, pain_level,
      mobility_level, current_medications, medical_history,
      special_instructions, client_name, client_email, client_phone, referring_vet
    } = req.body;
    await run(
      `UPDATE patients SET
        name=?, species=?, breed=?, age=?, weight=?, sex=?, condition=?,
        affected_region=?, surgery_date=?, lameness_grade=?,
        body_condition_score=?, pain_level=?, mobility_level=?,
        current_medications=?, medical_history=?, special_instructions=?,
        client_name=?, client_email=?, client_phone=?, referring_vet=?
      WHERE id=?`,
      [
        name, species || "canine", breed, age, weight, sex, condition, affected_region,
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

// Full exercise library — all 260 exercises with species tagging
const { ALL_EXERCISES } = require("./all-exercises");

// Apply species tagging to full library
const TAGGED_EXERCISES = ALL_EXERCISES.map(ex => {
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

// Protocol generator
const { selectExercisesForWeek, getProtocolType, validateIntake } = require("./protocol-generator");

// Exercise library — serves full 260-exercise library (consistent with engines)
app.get("/api/exercises", (req, res) => {
  try {
    res.json({ success: true, data: TAGGED_EXERCISES, total: TAGGED_EXERCISES.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

console.log(`📚 Exercise library: ${TAGGED_EXERCISES.length} exercises (${TAGGED_EXERCISES.filter(e=>e.code.startsWith('FELINE')).length} feline, ${TAGGED_EXERCISES.filter(e=>!e.code.startsWith('FELINE')).length} canine)`);

app.get("/api/v2/exercises", (req, res) => {
  try {
    const { species, category, difficulty } = req.query;
    let exercises = TAGGED_EXERCISES;

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
// PROTOCOL GENERATION
// ---------------------------------------------------------------------------

app.post("/api/generate-protocol", (req, res) => {
  try {
    const formData = req.body;

    // Validate intake
    const { errors, warnings } = validateIntake(formData);
    if (errors && errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join("; "), warnings });
    }

    // Generate week-by-week protocol
    const totalWeeks = parseInt(formData.protocolLength, 10) || 8;
    const weeks = [];

    for (let w = 1; w <= totalWeeks; w++) {
      const exercises = selectExercisesForWeek(w, totalWeeks, ALL_EXERCISES, formData);
      weeks.push({
        week: w,
        exercises,
        phaseInfo: exercises[0]?._phaseInfo || null,
      });
    }

    // Protocol metadata
    const protocolType = getProtocolType(
      formData.diagnosis,
      formData.affectedRegion,
      formData._highPainOverride ? "palliative" : formData.treatmentApproach
    );

    res.json({
      success: true,
      data: {
        protocolType,
        totalWeeks,
        frequency: formData.frequency || "2x/week",
        weeks,
        warnings: warnings || [],
        patient: {
          name: formData.patientName,
          species: formData.species || "canine",
          breed: formData.breed,
          age: formData.age,
          weight: formData.weight || formData.weightLbs,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[Protocol Generation Error]", err);
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
// B.E.A.U. AI ENGINE
// ---------------------------------------------------------------------------

const beauRouter = require("./beau/beau-router");
const { registerEngineHook } = require("./beau/beau-chat-handler");
const knowledgeEngine = require("./engines/knowledge/knowledge-engine");
const evidenceEngine = require("./engines/evidence/evidence-engine");
const narrativeEngine = require("./engines/narrative/narrative-engine");
const presentationEngine = require("./engines/presentation/presentation-engine");
const visualEngine = require("./engines/visual/visual-engine");
app.use("/api/beau", beauLimiter, beauRouter);

// Knowledge Engine search endpoint
app.get("/api/beau/knowledge/search", (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });
  const results = knowledgeEngine.search(q, 10);
  res.json({ success: true, data: results.map(r => ({ ...r.chunk, score: r.score })), status: knowledgeEngine.getStatus() });
});

app.get("/api/beau/knowledge/status", (req, res) => {
  res.json({ success: true, data: knowledgeEngine.getStatus() });
});

// Evidence Engine search endpoint
app.post("/api/beau/evidence/search", async (req, res) => {
  try {
    const { query, maxResults } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });
    const result = await evidenceEngine.searchEvidence(query, maxResults || 5);
    // Feed results into Knowledge Engine
    evidenceEngine.injectIntoKnowledge(result.articles, knowledgeEngine.addChunks);
    res.json({ success: true, data: result.articles, context: result.context });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/beau/evidence/status", (req, res) => {
  res.json({ success: true, data: evidenceEngine.getStatus() });
});

// Narrative Engine endpoints
app.post("/api/beau/narrative/generate", async (req, res) => {
  try {
    const { type, patient, instructions } = req.body;
    if (!type) return res.status(400).json({ error: "Document type is required" });
    const result = await narrativeEngine.generateDocument(type, patient, instructions);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/beau/narrative/templates", (req, res) => {
  res.json({ success: true, data: narrativeEngine.getTemplateList() });
});

app.get("/api/beau/narrative/status", (req, res) => {
  res.json({ success: true, data: narrativeEngine.getStatus() });
});

// Presentation Engine endpoints
app.post("/api/beau/presentation/generate", async (req, res) => {
  try {
    const { prompt, patient } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const result = await presentationEngine.generatePresentation(prompt, patient);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/beau/presentation/status", (req, res) => {
  res.json({ success: true, data: presentationEngine.getStatus() });
});

// Visual Engine endpoints
app.post("/api/beau/visual/generate", (req, res) => {
  try {
    const { type, ...params } = req.body;
    if (!type) return res.status(400).json({ error: "Card type is required" });
    const result = visualEngine.generateCard(type, params);
    if (!result.valid) return res.status(400).json({ error: result.errors.join("; ") });
    res.json({ success: true, data: result.card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/beau/visual/status", (req, res) => {
  res.json({ success: true, data: visualEngine.getStatus() });
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

    // Initialize Knowledge Engine (RAG — source document grounding)
    await knowledgeEngine.initialize();
    registerEngineHook("knowledge", async (query, patient) => {
      return knowledgeEngine.getRelevantContext(query, patient);
    });

    // Register Evidence Engine hook (PubMed — triggered by research keywords)
    registerEngineHook("evidence", evidenceEngine.evidenceHook);

    // Initialize Narrative Engine with Knowledge + Evidence references
    narrativeEngine.initialize(knowledgeEngine, evidenceEngine);

    // Initialize Presentation Engine
    presentationEngine.initialize(knowledgeEngine);

    const existingAdmin = await db.findUserByUsername("admin");
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
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

