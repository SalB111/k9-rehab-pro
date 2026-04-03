// ============================================================================
// B.E.A.U. CHAT HANDLER — Core Streaming Pipeline
// Handles: system prompt assembly, engine context injection, Anthropic streaming
// ============================================================================

const Anthropic = require("@anthropic-ai/sdk");
const { buildSystemPrompt, validateExerciseReferences } = require("./beau-system-prompt");

const client = new Anthropic();

// Engine hooks — populated by engines as they initialize
// Each hook: async (query, patient) => string (context to inject) or null
const engineHooks = {
  knowledge: null,   // Engine 1: RAG context from source documents
  evidence: null,    // Engine 2: PubMed citations when research keywords detected
};

/**
 * Register an engine hook into the chat pipeline.
 * @param {string} name — Engine name (knowledge, evidence, etc.)
 * @param {Function} hook — async (query, patient) => string|null
 */
function registerEngineHook(name, hook) {
  engineHooks[name] = hook;
  console.log(`[B.E.A.U.] Engine registered: ${name}`);
}

/**
 * Stream a B.E.A.U. chat response via SSE.
 * @param {Object} req — Express request (body: { messages, patient })
 * @param {Object} res — Express response (SSE stream)
 */
async function handleChat(req, res) {
  const { messages, patient } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "B.E.A.U. is not configured. Set ANTHROPIC_API_KEY." });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

  try {
    // ── Pipeline Step 1: Gather engine context ──
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    let additionalContext = "";

    // Knowledge Engine hook (RAG — source document grounding)
    if (engineHooks.knowledge) {
      try {
        const knowledgeContext = await engineHooks.knowledge(lastUserMessage, patient);
        if (knowledgeContext) additionalContext += knowledgeContext + "\n\n";
      } catch (err) {
        console.error("[B.E.A.U.] Knowledge engine error:", err.message);
      }
    }

    // Evidence Engine hook (PubMed — triggered by research keywords)
    if (engineHooks.evidence) {
      try {
        const evidenceContext = await engineHooks.evidence(lastUserMessage, patient);
        if (evidenceContext) additionalContext += evidenceContext + "\n\n";
      } catch (err) {
        console.error("[B.E.A.U.] Evidence engine error:", err.message);
      }
    }

    // ── Pipeline Step 2: Build system prompt ──
    const systemPrompt = buildSystemPrompt(patient, additionalContext);

    // ── Pipeline Step 3: Clean messages for Anthropic API ──
    // Anthropic expects alternating user/assistant messages
    const cleanMessages = messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role, content: m.content }));

    // Ensure first message is from user
    if (cleanMessages.length > 0 && cleanMessages[0].role !== "user") {
      cleanMessages.shift();
    }

    // Ensure alternating roles
    const validMessages = [];
    let lastRole = null;
    for (const msg of cleanMessages) {
      if (msg.role === lastRole) continue; // Skip duplicates
      validMessages.push(msg);
      lastRole = msg.role;
    }

    // Must end with user message
    if (validMessages.length === 0 || validMessages[validMessages.length - 1].role !== "user") {
      res.write(`data: ${JSON.stringify({ type: "error", text: "Invalid message sequence" })}\n\n`);
      return res.end();
    }

    // ── Pipeline Step 4: Stream from Anthropic ──
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: validMessages,
    });

    let fullText = "";

    stream.on("text", (text) => {
      fullText += text;
      res.write(`data: ${JSON.stringify({ type: "delta", text })}\n\n`);
    });

    stream.on("error", (err) => {
      console.error("[B.E.A.U.] Stream error:", err.message);
      res.write(`data: ${JSON.stringify({ type: "error", text: err.message })}\n\n`);
      res.end();
    });

    stream.on("end", () => {
      // ── Pipeline Step 5: Post-generation validation ──
      const { unknown } = validateExerciseReferences(fullText);
      if (unknown.length > 0) {
        console.warn(`[B.E.A.U.] Unknown exercise codes in response: ${unknown.join(", ")}`);
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    });

  } catch (err) {
    console.error("[B.E.A.U.] Chat handler error:", err);
    // Only send error if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", text: err.message })}\n\n`);
      res.end();
    }
  }
}

module.exports = {
  handleChat,
  registerEngineHook,
};
