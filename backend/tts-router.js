// ============================================================================
// B.E.A.U. TTS — OpenAI Text-to-Speech endpoint
// ============================================================================
// POST /api/tts { text, voice?, language? }
// Returns audio/mpeg binary stream
// Voice: "onyx" (deep male) default — matches B.E.A.U.'s character
// ============================================================================

const express = require("express");
const OpenAI = require("openai");
const router = express.Router();

// Voice map — OpenAI TTS supports these voices:
// alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
// "onyx" = deep male, authoritative — perfect for B.E.A.U.
const VOICE_MAP = {
  en: "onyx", es: "onyx", fr: "onyx", de: "onyx",
  "pt-BR": "onyx", pt: "onyx", it: "onyx",
  ja: "onyx", ko: "onyx", "zh-CN": "onyx", zh: "onyx", nl: "onyx",
};

// Language names for translation prompt
const LANG_NAMES = {
  en: null,  // No translation needed
  es: "Spanish", fr: "French", de: "German",
  "pt-BR": "Brazilian Portuguese", pt: "Portuguese",
  it: "Italian", ja: "Japanese", ko: "Korean",
  "zh-CN": "Mandarin Chinese", zh: "Mandarin Chinese", nl: "Dutch",
};

router.post("/", async (req, res) => {
  const { text, voice, language } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "TTS not configured. Set OPENAI_API_KEY." });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Truncate very long text (OpenAI TTS max is 4096 chars)
    let cleaned = text.slice(0, 4096);

    // Translate to target language if not English
    const targetLang = LANG_NAMES[language];
    if (targetLang && process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = require("@anthropic-ai/sdk");
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const translation = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          messages: [{ role: "user", content: `Translate the following clinical text to ${targetLang}. Keep medical terminology accurate. Return ONLY the translation, no explanation:\n\n${cleaned}` }],
        });
        cleaned = translation.content[0]?.text || cleaned;
      } catch (err) {
        console.warn("[TTS] Translation failed, using English:", err.message);
      }
    }

    const selectedVoice = voice || VOICE_MAP[language] || "onyx";

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice,
      input: cleaned,
      response_format: "mp3",
      speed: 1.0,
    });

    // Stream the audio back
    res.set({
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("[TTS] Error:", err.message);
    res.status(500).json({ error: "TTS generation failed: " + err.message });
  }
});

// GET /api/tts/status — check if TTS is configured
router.get("/status", (req, res) => {
  res.json({
    configured: !!process.env.OPENAI_API_KEY,
    engine: "openai-tts-1",
    voice: "onyx",
  });
});

module.exports = router;
