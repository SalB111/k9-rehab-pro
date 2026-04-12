// ============================================================================
// B.E.A.U. VOICE — OpenAI TTS for the Clinical AI Assistant
// ============================================================================
// Deep, charismatic "onyx" voice via OpenAI TTS-1 API.
// Auto-speaks by default with toggle for click-only mode.
// Supports all 10 platform languages natively.
// Falls back to browser speechSynthesis if OpenAI TTS is unavailable.
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ============================================================================
// HOOK: useBeauVoice
// ============================================================================
export default function useBeauVoice(locale = "en") {
  const [autoSpeak, setAutoSpeak] = useState(() => {
    try { return localStorage.getItem("k9_beau_autospeak") !== "false"; } catch { return true; }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState("BEAU (Onyx)");
  const audioRef = useRef(null);
  const abortRef = useRef(null);

  // Persist auto-speak preference
  useEffect(() => {
    try { localStorage.setItem("k9_beau_autospeak", autoSpeak ? "true" : "false"); } catch {}
  }, [autoSpeak]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text) => {
    if (!text?.trim()) return;

    // Stop any current speech
    stop();

    // Clean text for speech
    const cleaned = text
      .replace(/```[\s\S]*?```/g, "")       // code blocks
      .replace(/\*\*([^*]+)\*\*/g, "$1")    // bold
      .replace(/\*([^*]+)\*/g, "$1")        // italic
      .replace(/#+\s/g, "")                 // headers
      .replace(/[-\u2022\u00b7]\s/g, "")    // bullets
      .replace(/\n{2,}/g, ". ")             // paragraph breaks
      .replace(/\n/g, " ")                  // newlines
      .replace(/\s{2,}/g, " ")              // collapse spaces
      .trim()
      .slice(0, 4096);                      // OpenAI TTS max

    if (!cleaned) return;

    setIsSpeaking(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: cleaned, language: locale }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // Fallback to browser TTS if OpenAI fails
        console.warn("[B.E.A.U. Voice] OpenAI TTS failed, falling back to browser TTS");
        fallbackSpeak(cleaned, locale);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = 1.0;
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      if (err.name === "AbortError") return;
      console.warn("[B.E.A.U. Voice] TTS error, falling back:", err.message);
      fallbackSpeak(cleaned, locale);
    }
  }, [locale, stop]);

  return { speak, stop, isSpeaking, autoSpeak, setAutoSpeak, voiceName, voicesLoaded: true };
}

// ── Browser TTS fallback ──
function fallbackSpeak(text, locale) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
  utt.rate = 1.0;
  utt.pitch = 0.85;
  utt.volume = 1.0;
  synth.speak(utt);
}
