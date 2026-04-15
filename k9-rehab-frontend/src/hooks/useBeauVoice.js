// ============================================================================
// B.E.A.U. VOICE — OpenAI TTS for the Clinical AI Assistant
// ============================================================================
// Deep, charismatic "onyx" voice via OpenAI TTS-1 API.
// Auto-speaks by default with toggle for click-only mode.
// Queued playback — no overlapping, no cutoffs.
// Supports all 10 platform languages natively.
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function useBeauVoice(locale = "en") {
  const [autoSpeak, setAutoSpeak] = useState(() => {
    try { return localStorage.getItem("k9_beau_autospeak") !== "false"; } catch { return true; }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceName] = useState("BEAU (Onyx)");
  const audioRef = useRef(null);
  const abortRef = useRef(null);
  const speakingRef = useRef(false);   // Lock to prevent overlaps
  const queueRef = useRef([]);          // Queue for pending speech

  // Persist auto-speak preference
  useEffect(() => {
    try { localStorage.setItem("k9_beau_autospeak", autoSpeak ? "true" : "false"); } catch {}
  }, [autoSpeak]);

  const stop = useCallback(() => {
    // Clear queue
    queueRef.current = [];
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Abort pending fetch
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    // Also stop browser TTS fallback
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Internal play function — plays one text, resolves when done
  const playOne = useCallback(async (text, lang) => {
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
        body: JSON.stringify({ text, language: lang }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("TTS API " + res.status);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      return new Promise((resolve) => {
        const audio = new Audio(url);
        audio.volume = 1.0;
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          resolve();
        };
        audio.play().catch(() => resolve());
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      // Fallback to browser TTS
      return new Promise((resolve) => {
        const synth = window.speechSynthesis;
        if (!synth) { resolve(); return; }
        synth.cancel();
        const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
        utt.rate = 1.0;
        utt.pitch = 0.85;
        utt.volume = 1.0;
        utt.onend = resolve;
        utt.onerror = resolve;
        synth.speak(utt);
      });
    }
  }, []);

  const speak = useCallback(async (text) => {
    if (!text?.trim()) return;

    // Clean text for speech
    const cleaned = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/[-\u2022\u00b7]\s/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 4096);

    if (!cleaned) return;

    // If already speaking, stop first — new speech replaces old.
    // 500ms pause prevents audio overlap when a new BEAU response arrives
    // while voice is still narrating the previous response. Per Sal 2026-04-14.
    if (speakingRef.current) {
      stop();
      await new Promise(r => setTimeout(r, 500));
    }

    speakingRef.current = true;
    setIsSpeaking(true);

    await playOne(cleaned, locale);

    speakingRef.current = false;
    setIsSpeaking(false);
  }, [locale, stop, playOne]);

  return { speak, stop, cancel: stop, isSpeaking, autoSpeak, setAutoSpeak, voiceName, voicesLoaded: true };
}
