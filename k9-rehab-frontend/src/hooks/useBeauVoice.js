// ============================================================================
// B.E.A.U. VOICE — Text-to-Speech for the Clinical AI Assistant
// ============================================================================
// Deep, charismatic, authoritative voice — like a seasoned clinical colleague.
// Auto-speaks by default with toggle for click-only mode.
// Supports all 10 platform languages via browser speechSynthesis API.
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react";

// ── Locale → speechSynthesis language code mapping ──
const LOCALE_VOICE_MAP = {
  en:      "en-US",
  es:      "es-ES",
  fr:      "fr-FR",
  de:      "de-DE",
  "pt-BR": "pt-BR",
  pt:      "pt-BR",
  it:      "it-IT",
  ja:      "ja-JP",
  ko:      "ko-KR",
  "zh-CN": "zh-CN",
  zh:      "zh-CN",
  nl:      "nl-NL",
};

// ── Voice preference scoring — prefer deeper male voices ──
function scoreVoice(voice, langCode) {
  let score = 0;
  const name = voice.name.toLowerCase();
  const lang = voice.lang?.toLowerCase() || "";

  // Must match language
  if (!lang.startsWith(langCode.slice(0, 2).toLowerCase())) return -1;

  // Prefer online/cloud voices — they are LOUDER and higher quality on Windows
  if (!voice.localService) score += 8;

  // Prefer male voices (deeper, matches B.E.A.U.'s character)
  if (name.includes("male") && !name.includes("female")) score += 10;
  if (name.includes("google")) score += 9;   // Google voices are louder on Chrome
  if (name.includes("david")) score += 7;    // Windows deep male
  if (name.includes("mark")) score += 7;     // Windows male
  if (name.includes("daniel")) score += 6;   // macOS male
  if (name.includes("alex")) score += 6;     // macOS male
  if (name.includes("jorge")) score += 6;    // Spanish male
  if (name.includes("thomas")) score += 6;   // French/German male

  // Deprioritize female voices slightly (B.E.A.U. is envisioned as deep male)
  if (name.includes("female") || name.includes("zira") || name.includes("hazel")) score -= 3;

  // Prefer "enhanced" or "premium" quality — typically louder
  if (name.includes("enhanced") || name.includes("premium") || name.includes("neural")) score += 6;

  // Microsoft Online voices are louder than local ones on Windows
  if (name.includes("online") || name.includes("natural")) score += 7;

  return score;
}

function getBestVoice(locale) {
  const synth = window.speechSynthesis;
  if (!synth) return null;

  const voices = synth.getVoices();
  if (!voices.length) return null;

  const langCode = LOCALE_VOICE_MAP[locale] || LOCALE_VOICE_MAP.en;

  // Score and sort voices for the target language
  const scored = voices
    .map(v => ({ voice: v, score: scoreVoice(v, langCode) }))
    .filter(v => v.score >= 0)
    .sort((a, b) => b.score - a.score);

  // Fallback: try base language code (e.g., "en" from "en-US")
  if (scored.length === 0) {
    const base = langCode.slice(0, 2);
    const fallback = voices
      .map(v => ({ voice: v, score: scoreVoice(v, base) }))
      .filter(v => v.score >= 0)
      .sort((a, b) => b.score - a.score);
    return fallback[0]?.voice || voices[0] || null;
  }

  return scored[0]?.voice || null;
}

// ============================================================================
// HOOK: useBeauVoice
// ============================================================================
// Returns: { speak, stop, isSpeaking, autoSpeak, setAutoSpeak, voiceName }
//
// speak(text)  — reads text aloud using B.E.A.U.'s voice
// stop()       — stops current speech
// isSpeaking   — boolean, true while voice is active
// autoSpeak    — boolean, true = auto-speak new responses
// setAutoSpeak — toggle auto-speak on/off
// voiceName    — name of the selected voice (for UI display)
// ============================================================================

export default function useBeauVoice(locale = "en") {
  const [autoSpeak, setAutoSpeak] = useState(() => {
    try { return localStorage.getItem("k9_beau_autospeak") !== "false"; } catch { return true; }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef(null);

  // Persist auto-speak preference
  useEffect(() => {
    try { localStorage.setItem("k9_beau_autospeak", autoSpeak ? "true" : "false"); } catch {}
  }, [autoSpeak]);

  // Load voices (they load async in some browsers)
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const loadVoices = () => {
      const v = synth.getVoices();
      if (v.length > 0) {
        setVoicesLoaded(true);
        const best = getBestVoice(locale);
        setVoiceName(best?.name || "Default");
      }
    };

    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, [locale]);

  const stop = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text) => {
    const synth = window.speechSynthesis;
    if (!synth || !text?.trim()) return;

    // Stop any current speech
    synth.cancel();

    // Clean text for speech — remove markdown, code blocks, excess whitespace
    const cleaned = text
      .replace(/```[\s\S]*?```/g, "")       // code blocks
      .replace(/\*\*([^*]+)\*\*/g, "$1")    // bold
      .replace(/\*([^*]+)\*/g, "$1")        // italic
      .replace(/#+\s/g, "")                 // headers
      .replace(/[-•·]\s/g, "")              // bullets
      .replace(/\n{2,}/g, ". ")             // paragraph breaks → pause
      .replace(/\n/g, " ")                  // newlines → space
      .replace(/\s{2,}/g, " ")              // collapse spaces
      .trim();

    if (!cleaned) return;

    // Chunk long text (speechSynthesis has a ~200-300 char limit in some browsers)
    const MAX_CHUNK = 250;
    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
    const chunks = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > MAX_CHUNK && current) {
        chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    const voice = getBestVoice(locale);
    setIsSpeaking(true);

    let chunkIndex = 0;
    const speakNext = () => {
      if (chunkIndex >= chunks.length) {
        setIsSpeaking(false);
        return;
      }
      const utt = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      if (voice) utt.voice = voice;
      utt.lang = LOCALE_VOICE_MAP[locale] || "en-US";
      utt.rate = 1.0;      // Clear, confident pace
      utt.pitch = 0.85;    // Deep, charismatic voice
      utt.volume = 1.0;    // Max browser volume
      utt.onend = () => { chunkIndex++; speakNext(); };
      utt.onerror = () => { chunkIndex++; speakNext(); };
      utteranceRef.current = utt;
      synth.speak(utt);
    };

    speakNext();
  }, [locale]);

  return { speak, stop, isSpeaking, autoSpeak, setAutoSpeak, voiceName, voicesLoaded };
}
