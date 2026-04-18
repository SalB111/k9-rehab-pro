// ============================================================================
// K9-REHAB-PRO â€” BACKEND SERVER (PRODUCTION READY)
// ============================================================================

require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = require("./db-provider");
const { all, get, run } = require("./db-provider");
const authRoutes = require("./auth-routes");
const requireAuth = require("./middleware/requireAuth");
const { announceIfDemoMode } = require("./demo-mode");

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 10000;

// ---------------------------------------------------------------------------
// SECURITY MIDDLEWARE
// ---------------------------------------------------------------------------

// Helmet — security headers (XSS, clickjacking, MIME sniffing protection)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disabled for SPA compatibility
}));

// Rate limiting — per IP. Thresholds tightened after the pre-demo audit.
// Previous values (10000 / 1000 / 10000 per 15min) left the auth endpoint
// wide open to brute-force and the B.E.A.U. endpoint wide open to
// Anthropic-spend abuse. Env overrides available for load-testing.
const num = (v, def) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : def; };

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: num(process.env.RATE_LIMIT_GENERAL, 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Auth brute-force protection — 20 attempts per IP per 15 min is enough
// for a careful typist, tight enough to stop password-spraying.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: num(process.env.RATE_LIMIT_AUTH, 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
});

// B.E.A.U. limiter — each request hits Anthropic/OpenAI and incurs real cost.
// 60 per IP per 15 min is plenty for a 10-patient clinic day.
const beauLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: num(process.env.RATE_LIMIT_BEAU, 60),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Chat rate limit reached, please wait a moment" },
});

// ---------------------------------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------------------------------

// CORS origins — read from CORS_ORIGINS env var (comma-separated) with fallback
const DEFAULT_CORS_ORIGINS = [
  "https://k9-rehab-pro.vercel.app",
  "https://k9-rehab-pro-gcnl.vercel.app",
  "https://k9-rehab-pro-gcnl-salb111s-projects.vercel.app",
  "https://beau-ai-lime.vercel.app",
  "https://beauaihome.vercel.app",
  "https://beauaihome-salb111s-projects.vercel.app",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173"
];
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(s => s.trim()).filter(Boolean)
  : DEFAULT_CORS_ORIGINS;
app.use(cors({
  origin: corsOrigins,
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

app.get("/api/patients", requireAuth, async (req, res) => {
  try {
    const patients = await all("SELECT * FROM patients ORDER BY created_at DESC");
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/patients/:id", requireAuth, async (req, res) => {
  try {
    const patient = await get("SELECT * FROM patients WHERE id = ?", [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Patient payload validation ────────────────────────────────────────────
// Lightweight validator: caps string lengths (DoS via DB-bloat) and rejects
// garbage types up front. Keeps schemas in one place so POST and PUT stay
// in sync. Returns null on success or an error-message string on failure.
const STR_CAPS = {
  name: 200, breed: 200, sex: 64, condition: 500, affected_region: 200,
  surgery_date: 32, mobility_level: 100,
  current_medications: 4000, medical_history: 10000,
  special_instructions: 4000,
  client_name: 200, client_email: 200, client_phone: 64, referring_vet: 500,
};
const DASHBOARD_DATA_MAX_BYTES = 64 * 1024; // 64 KB per patient blob

function validatePatientPayload(body, { requireName = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object";
  }
  if (requireName && (!body.name || typeof body.name !== "string" || !body.name.trim())) {
    return "name is required";
  }
  for (const [k, cap] of Object.entries(STR_CAPS)) {
    const v = body[k];
    if (v === undefined || v === null) continue;
    if (typeof v !== "string") return `${k} must be a string`;
    if (v.length > cap) return `${k} exceeds max length (${cap})`;
  }
  for (const k of ["age", "weight", "lameness_grade", "body_condition_score", "pain_level"]) {
    const v = body[k];
    if (v === undefined || v === null || v === "") continue;
    const n = Number(v);
    if (!Number.isFinite(n)) return `${k} must be a number`;
    if (n < 0 || n > 1000) return `${k} out of range`;
  }
  const dd = body.dashboard_data;
  if (dd !== undefined) {
    const asString = typeof dd === "string" ? dd : (() => { try { return JSON.stringify(dd); } catch { return null; } })();
    if (asString === null) return "dashboard_data is not serializable";
    if (asString.length > DASHBOARD_DATA_MAX_BYTES) return "dashboard_data exceeds 64KB";
  }
  return null;
}

app.post("/api/patients", requireAuth, async (req, res) => {
  try {
    const err = validatePatientPayload(req.body, { requireName: true });
    if (err) return res.status(400).json({ success: false, error: err });
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

app.put("/api/patients/:id", requireAuth, async (req, res) => {
  try {
    const err = validatePatientPayload(req.body);
    if (err) return res.status(400).json({ success: false, error: err });
    const {
      name, species, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score, pain_level,
      mobility_level, current_medications, medical_history,
      special_instructions, client_name, client_email, client_phone, referring_vet,
      dashboard_data
    } = req.body;

    // Build update dynamically — only include fields that were provided
    const fields = [];
    const values = [];
    const optional = {
      name, species: species || "canine", breed, age, weight, sex, condition,
      affected_region, surgery_date, lameness_grade, body_condition_score,
      pain_level, mobility_level, current_medications, medical_history,
      special_instructions, client_name, client_email, client_phone, referring_vet,
    };
    for (const [k, v] of Object.entries(optional)) {
      if (v !== undefined) { fields.push(`${k}=?`); values.push(v); }
    }
    // Dashboard data — JSON blob of all block form fields
    if (dashboard_data !== undefined) {
      fields.push("dashboard_data=?");
      values.push(typeof dashboard_data === "string" ? dashboard_data : JSON.stringify(dashboard_data));
      // Increment visit count and update last visit date
      fields.push("visit_count = COALESCE(visit_count, 0) + 1");
      fields.push("last_visit_date = datetime('now')");
    }

    if (fields.length > 0) {
      values.push(req.params.id);
      await run(`UPDATE patients SET ${fields.join(", ")} WHERE id=?`, values);
    }

    const patient = await get("SELECT * FROM patients WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/patients/:id", requireAuth, async (req, res) => {
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

app.post("/api/generate-protocol", requireAuth, (req, res) => {
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

app.get("/api/sessions", requireAuth, async (req, res) => {
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

app.get("/api/sessions/:id", requireAuth, async (req, res) => {
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

app.post("/api/sessions", requireAuth, async (req, res) => {
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

app.get("/api/clinics", requireAuth, async (req, res) => {
  try {
    const clinics = await all("SELECT * FROM clinics");
    res.json({ success: true, data: clinics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/clinics", requireAuth, async (req, res) => {
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

app.put("/api/clinics/:id", requireAuth, async (req, res) => {
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

// Public health-style check — no PHI, no AI spend. Registered BEFORE the
// authed mount so Express matches this first. The frontend calls this at
// startup to decide whether to show "B.E.A.U. is not configured" — we
// don't want that banner for unauthenticated users during login either.
app.get("/api/beau/status", (req, res) => {
  const configured = !!process.env.ANTHROPIC_API_KEY;
  let engines = { clinical: true };
  try { engines.knowledge = require("./engines/knowledge/knowledge-engine").isReady(); } catch { engines.knowledge = false; }
  try { engines.evidence = require("./engines/evidence/evidence-engine").isReady(); } catch { engines.evidence = false; }
  try { engines.diagram = require("./engines/diagram/diagram-engine").isReady(); } catch { engines.diagram = false; }
  try { engines.narrative = require("./engines/narrative/narrative-engine").isReady(); } catch { engines.narrative = false; }
  try { engines.presentation = require("./engines/presentation/presentation-engine").isReady(); } catch { engines.presentation = false; }
  try { engines.visual = require("./engines/visual/visual-engine").isReady(); } catch { engines.visual = false; }
  res.json({ configured, model: "claude-sonnet-4-20250514", engines });
});

// Auth-gated — prevents anonymous patient-name disclosure via
// GET /api/beau/sessions and prevents anonymous spend on
// POST /api/beau/chat / POST /api/tts (Anthropic + OpenAI cost).
app.use("/api/beau", beauLimiter, requireAuth, beauRouter);
app.use("/api/tts", requireAuth, require("./tts-router"));

// Knowledge Engine search endpoint
app.get("/api/beau/knowledge/search", requireAuth, (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });
  const results = knowledgeEngine.search(q, 10);
  res.json({ success: true, data: results.map(r => ({ ...r.chunk, score: r.score })), status: knowledgeEngine.getStatus() });
});

app.get("/api/beau/knowledge/status", (req, res) => {
  res.json({ success: true, data: knowledgeEngine.getStatus() });
});

// Evidence Engine search endpoint
app.post("/api/beau/evidence/search", requireAuth, async (req, res) => {
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
app.post("/api/beau/narrative/generate", requireAuth, async (req, res) => {
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
app.post("/api/beau/presentation/generate", requireAuth, async (req, res) => {
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
app.post("/api/beau/visual/generate", requireAuth, (req, res) => {
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
app.post("/api/pipeline/home-session", requireAuth, async (req, res) => {
  try {
    console.log("[Pipeline] Owner home-session request received");
    const result = await runSafetyGateAgent(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[Pipeline] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// ADMIN SEED ROUTE — protected by SEED_ADMIN_TOKEN env var
// ---------------------------------------------------------------------------
// One-shot endpoint to populate the 5 demo patients on prod (Railway) without
// requiring Railway CLI / shell access. Call once:
//
//   curl -X POST https://<host>/api/admin/seed-demo -H "X-Seed-Token: $TOKEN"
//
// Idempotent — re-running updates dashboard_data in-place rather than
// duplicating rows. Token must be set as SEED_ADMIN_TOKEN env var; if the
// env var is missing or the header doesn't match, we 404 (not 401) to avoid
// advertising the endpoint's existence.
app.post("/api/admin/seed-demo", async (req, res) => {
  const expected = (process.env.SEED_ADMIN_TOKEN || "").trim();
  const provided = (req.headers["x-seed-token"] || "").toString().trim();
  if (!expected || !provided || provided !== expected) {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    const { seed } = require("./seed-demo-patients");
    // DB already initialized at server boot — don't reopen from the handler.
    await seed({ init: false });
    const rows = await db.all("SELECT id, name, breed FROM patients ORDER BY id");
    res.json({ success: true, total: rows.length, patients: rows });
  } catch (err) {
    console.error("[Admin Seed] error:", err);
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
    announceIfDemoMode();
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
      // SECURITY: never ship a default admin password. ADMIN_PASSWORD must
      // be supplied via env (Railway → Variables). If missing on first boot,
      // we skip admin creation and log a loud warning — the operator can
      // set the env var and restart, or create the admin manually via
      // /api/auth/register then promote in the DB.
      const adminPwd = (process.env.ADMIN_PASSWORD || "").trim();
      if (!adminPwd || adminPwd.length < 12) {
        console.warn(
          "⚠  ADMIN_PASSWORD env var missing or < 12 chars — skipping default admin creation. " +
          "Set ADMIN_PASSWORD (≥ 12 chars) in Railway env to provision the 'admin' user on next boot."
        );
      } else {
        const passwordHash = await bcrypt.hash(adminPwd, 10);
        await db.createUser("admin", passwordHash, "admin");
        console.log("✅ Default admin user created from ADMIN_PASSWORD env");
      }
    } else {
      console.log("✅ Admin user exists");
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

