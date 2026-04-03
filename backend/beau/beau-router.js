// ============================================================================
// B.E.A.U. ROUTER — /api/beau/*
// Biomedical Evidence-Based Analytical Unit — API Endpoints
// ============================================================================

const express = require("express");
const router = express.Router();
const { handleChat } = require("./beau-chat-handler");
const { all, get, run } = require("../db-providers/sqlite-provider");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/beau/chat — Streaming SSE chat endpoint
// ─────────────────────────────────────────────────────────────────────────────
router.post("/chat", handleChat);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/beau/status — Check if B.E.A.U. is configured
// ─────────────────────────────────────────────────────────────────────────────
router.get("/status", (req, res) => {
  const configured = !!process.env.ANTHROPIC_API_KEY;

  // Dynamically check each engine's actual status
  let engines = { clinical: true };
  try { engines.knowledge = require("../engines/knowledge/knowledge-engine").isReady(); } catch { engines.knowledge = false; }
  try { engines.evidence = require("../engines/evidence/evidence-engine").isReady(); } catch { engines.evidence = false; }
  try { engines.diagram = require("../engines/diagram/diagram-engine").isReady(); } catch { engines.diagram = false; }
  try { engines.narrative = require("../engines/narrative/narrative-engine").isReady(); } catch { engines.narrative = false; }
  try { engines.presentation = require("../engines/presentation/presentation-engine").isReady(); } catch { engines.presentation = false; }
  try { engines.visual = require("../engines/visual/visual-engine").isReady(); } catch { engines.visual = false; }

  res.json({ configured, model: "claude-sonnet-4-20250514", engines });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/beau/sessions — Save a chat session
// ─────────────────────────────────────────────────────────────────────────────
router.post("/sessions", async (req, res) => {
  try {
    const { messages, patient_id, session_id } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const messagesJson = JSON.stringify(messages);
    // Generate title from first user message
    const firstUserMsg = messages.find(m => m.role === "user");
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 80) + (firstUserMsg.content.length > 80 ? "..." : "")
      : "New conversation";

    // Get patient name if available
    let patientName = null;
    if (patient_id) {
      const patient = await get("SELECT name FROM patients WHERE id = ?", [patient_id]);
      patientName = patient?.name || null;
    }

    if (session_id) {
      // Update existing session
      await run(
        `UPDATE beau_sessions SET messages = ?, title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [messagesJson, title, session_id]
      );
      res.json({ success: true, data: { id: session_id } });
    } else {
      // Create new session
      const result = await run(
        `INSERT INTO beau_sessions (title, messages, patient_id, patient_name) VALUES (?, ?, ?, ?)`,
        [title, messagesJson, patient_id || null, patientName]
      );
      res.json({ success: true, data: { id: result.lastID } });
    }
  } catch (err) {
    console.error("[B.E.A.U. Sessions] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/beau/sessions — List all chat sessions
// ─────────────────────────────────────────────────────────────────────────────
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await all(
      `SELECT id, title, patient_id, patient_name, created_at, updated_at
       FROM beau_sessions ORDER BY updated_at DESC LIMIT 50`
    );
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error("[B.E.A.U. Sessions] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/beau/sessions/:id — Get a specific session with messages
// ─────────────────────────────────────────────────────────────────────────────
router.get("/sessions/:id", async (req, res) => {
  try {
    const session = await get("SELECT * FROM beau_sessions WHERE id = ?", [req.params.id]);
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Parse messages JSON
    session.messages = JSON.parse(session.messages || "[]");
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/beau/sessions/patient/:patientId — Sessions for a specific patient
// ─────────────────────────────────────────────────────────────────────────────
router.get("/sessions/patient/:patientId", async (req, res) => {
  try {
    const sessions = await all(
      `SELECT id, title, patient_name, created_at, updated_at
       FROM beau_sessions WHERE patient_id = ? ORDER BY updated_at DESC`,
      [req.params.patientId]
    );
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/beau/intelligence — Aggregate case intelligence stats
// ─────────────────────────────────────────────────────────────────────────────
router.get("/intelligence", async (req, res) => {
  try {
    const totalSessions = await get("SELECT COUNT(*) as count FROM beau_sessions");
    const totalPatients = await get("SELECT COUNT(DISTINCT patient_id) as count FROM beau_sessions WHERE patient_id IS NOT NULL");
    res.json({
      success: true,
      data: {
        total_cases: totalSessions?.count || 0,
        patients_consulted: totalPatients?.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
