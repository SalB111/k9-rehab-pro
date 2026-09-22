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
  const { messages, patient, language, system: customSystem } = req.body;

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
    // If the caller provided a custom `system` prompt in the request body,
    // use it VERBATIM — this bypasses the default engine injection (visual,
    // narrative, presentation) so callers like ConditioningPanel can enforce
    // strict plain-text or custom formats. Opt-in: callers that omit `system`
    // still get the full B.E.A.U. brain + engine stack.
    let systemPrompt = customSystem
      ? customSystem
      : buildSystemPrompt(patient, additionalContext);
    if (customSystem) {
      console.log("[B.E.A.U.] Using caller-provided custom system prompt (engine injection bypassed)");
    }

    // ── Language instruction — respond in the user's selected language ──
    const LANG_NAMES = { es:"Spanish", fr:"French", de:"German", "pt-BR":"Brazilian Portuguese", pt:"Portuguese", it:"Italian", ja:"Japanese", ko:"Korean", "zh-CN":"Mandarin Chinese", zh:"Mandarin Chinese", nl:"Dutch" };
    const targetLang = LANG_NAMES[language];
    if (targetLang) {
      systemPrompt += `\n\nIMPORTANT: The user's interface is set to ${targetLang}. You MUST respond entirely in ${targetLang}. Keep medical terminology accurate but translate all explanations, instructions, and clinical guidance into ${targetLang}. Exercise names may remain in English with ${targetLang} translation in parentheses.`;
    }

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
    //
    // DELIBERATELY NOT PROMPT-CACHED. This looks like an obvious saving and it
    // is not. Investigated 22 Sep 2026; leaving this note so the same proposal
    // is not made again.
    //
    // Two placements were possible and both were rejected:
    //
    //   1. A breakpoint above the patient block caches only BASE_IDENTITY and
    //      CLINICAL_RULES. Measured at 841 tokens via count_tokens, and tested
    //      against claude-sonnet-4-6: two identical calls both returned
    //      cache_creation=0, cache_read=0. It is under the model's minimum
    //      cacheable prefix, so a breakpoint there does nothing at all.
    //
    //   2. Reordering so the stable blocks come first would cache ~5,500
    //      tokens — but it puts the exercise library ahead of the patient.
    //      That inverts the clinical reasoning sequence in the Source of
    //      Truth §10 (patient -> assessment -> ... -> exercise selection).
    //      Rejected by Sal on exactly that ground.
    //
    // What actually prevents caching is neither of those: `additionalContext`
    // is RAG retrieved against the LAST USER MESSAGE, so the system prompt
    // differs on every turn even within one consult. Moving it into `messages`
    // would cache the full ~6,800-token prompt per patient (verified: turn 1
    // write=6790, turn 2 read=6790, a 90% saving from turn 2 onward).
    //
    // That was rejected too, and for the better reason: retrieved evidence
    // delivered as conversation content does not carry the same weight as
    // evidence delivered as system instruction. The wording would be
    // identical; its standing would not. Grounding quality outranks input
    // cost, so this call pays full price on purpose.
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: validMessages,
    });

    let fullText = "";
    let clientGone = false;

    // Detect client disconnect (browser navigates away, reloads, or the
    // ReadableStream reader on the frontend is cancelled mid-response).
    // When this fires we stop writing to the dead socket and abort the
    // Anthropic stream so we don't burn tokens on a dead request.
    req.on("close", () => {
      if (!res.writableEnded) {
        clientGone = true;
        try { stream.abort?.(); } catch { /* noop */ }
      }
    });

    // Safe write helper — guards against ERR_STREAM_WRITE_AFTER_END when
    // the Anthropic SDK keeps firing events after the client has disconnected.
    const safeWrite = (payload) => {
      if (clientGone || res.writableEnded) return false;
      try { res.write(payload); return true; }
      catch (e) { clientGone = true; return false; }
    };
    const safeEnd = () => {
      if (clientGone || res.writableEnded) return;
      try { res.end(); } catch { /* noop */ }
    };

    stream.on("text", (text) => {
      fullText += text;
      safeWrite(`data: ${JSON.stringify({ type: "delta", text })}\n\n`);
    });

    stream.on("error", (err) => {
      console.error("[B.E.A.U.] Stream error:", err.message);
      safeWrite(`data: ${JSON.stringify({ type: "error", text: err.message })}\n\n`);
      safeEnd();
    });

    stream.on("end", () => {
      // ── Pipeline Step 5: Post-generation validation ──
      const { unknown } = validateExerciseReferences(fullText);
      if (unknown.length > 0) {
        console.warn(`[B.E.A.U.] Unknown exercise codes in response: ${unknown.join(", ")}`);
      }

      safeWrite(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      safeEnd();
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
