// ============================================================================
// B.E.A.U. VOICE — OpenAI TTS for the Clinical AI Assistant
// ============================================================================
// Configurable OpenAI voice (default "onyx") via /api/tts.
// Auto-speaks by default with toggle for click-only mode.
// QUEUED PLAYBACK — enqueue() appends to the speech queue so multiple
// sentences arriving from a streaming BEAU response play in order without
// overlap. speak() = legacy one-shot replace-current behaviour.
// stopAll() / cancel() drains the queue and aborts in-flight requests.
// Supports all 10 platform languages natively.
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Available OpenAI TTS voices — surfaced in Settings → Appearance → BEAU Voice
export const BEAU_VOICES = [
  { id: "onyx",    name: "Onyx",    desc: "Deep, authoritative male (default)" },
  { id: "alloy",   name: "Alloy",   desc: "Neutral, balanced" },
  { id: "echo",    name: "Echo",    desc: "Male" },
  { id: "fable",   name: "Fable",   desc: "Expressive, storyteller" },
  { id: "nova",    name: "Nova",    desc: "Female" },
  { id: "shimmer", name: "Shimmer", desc: "Female, soft" },
];

const VOICE_STORAGE_KEY = "beau_voice_preference";
const getStoredVoice = () => {
  try {
    const v = localStorage.getItem(VOICE_STORAGE_KEY);
    return BEAU_VOICES.find(x => x.id === v)?.id || "onyx";
  } catch { return "onyx"; }
};

export default function useBeauVoice(locale = "en") {
  const [autoSpeak, setAutoSpeak] = useState(() => {
    try { return localStorage.getItem("k9_beau_autospeak") !== "false"; } catch { return true; }
  });
  const [voicePref, setVoicePrefState] = useState(getStoredVoice);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceName] = useState("BEAU");
  const audioRef = useRef(null);
  const abortRef = useRef(null);
  const speakingRef = useRef(false);
  const queueRef = useRef([]);          // FIFO queue of cleaned text segments
  const processingRef = useRef(false);   // True while the queue processor loop is active
  const voicePrefRef = useRef(voicePref);
  const localeRef = useRef(locale);

  // Keep refs in sync so the queue processor (a long-lived async loop) always
  // reads the latest values without needing to re-create on every render.
  useEffect(() => { voicePrefRef.current = voicePref; }, [voicePref]);
  useEffect(() => { localeRef.current = locale; }, [locale]);

  // Persist auto-speak preference
  useEffect(() => {
    try { localStorage.setItem("k9_beau_autospeak", autoSpeak ? "true" : "false"); } catch {}
  }, [autoSpeak]);

  const setVoicePref = useCallback((id) => {
    if (!BEAU_VOICES.find(v => v.id === id)) return;
    setVoicePrefState(id);
    try { localStorage.setItem(VOICE_STORAGE_KEY, id); } catch {}
  }, []);

  // Hard stop — drain queue, abort fetch, pause audio. Used when the user
  // clicks Stop, switches patients, closes a modal, or starts a brand-new
  // generation that should replace the in-flight one.
  const stop = useCallback(() => {
    queueRef.current = [];
    processingRef.current = false;
    if (audioRef.current) {
      try { audioRef.current.pause(); audioRef.current.currentTime = 0; } catch {}
      audioRef.current = null;
    }
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch {}
      abortRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    speakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Clean text for speech (strip markdown, normalize whitespace, cap at 4096)
  const cleanForSpeech = (text) => {
    if (!text) return "";
    return text
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
  };

  // Internal: synthesize ONE segment via the backend and play it.
  // Resolves when audio finishes (or errors / is aborted).
  const playOne = useCallback(async (text) => {
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
        body: JSON.stringify({
          text,
          language: localeRef.current,
          voice: voicePrefRef.current,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("TTS API " + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      return new Promise((resolve) => {
        const audio = new Audio(url);
        audio.volume = 1.0;
        audioRef.current = audio;
        audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; resolve(); };
        audio.play().catch(() => resolve());
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      // Browser TTS fallback
      return new Promise((resolve) => {
        const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
        if (!synth) { resolve(); return; }
        synth.cancel();
        const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
        utt.rate = 1.0; utt.pitch = 0.85; utt.volume = 1.0;
        utt.onend = resolve;
        utt.onerror = resolve;
        synth.speak(utt);
      });
    }
  }, []);

  // Queue processor — runs as a single async loop that drains queueRef
  // until empty, then exits. Re-entering enqueue() while running just
  // appends; the loop picks the next item up automatically.
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    speakingRef.current = true;
    setIsSpeaking(true);
    try {
      while (queueRef.current.length > 0 && processingRef.current) {
        const next = queueRef.current.shift();
        if (!next) continue;
        await playOne(next);
      }
    } finally {
      processingRef.current = false;
      speakingRef.current = false;
      setIsSpeaking(false);
    }
  }, [playOne]);

  // STREAMING API — append a text segment to the queue and start playback
  // if it isn't already running. Used by streaming generators (Conditioning,
  // Protocol) to feed first sentence ASAP and continue feeding as deltas
  // arrive. No interruption of current playback.
  const enqueue = useCallback((text) => {
    const cleaned = cleanForSpeech(text);
    if (!cleaned) return;
    queueRef.current.push(cleaned);
    if (!processingRef.current) {
      // Fire-and-forget — processQueue is async but we don't await it
      processQueue();
    }
  }, [processQueue]);

  // LEGACY ONE-SHOT API — replaces any in-flight speech with `text`.
  // Used by callers that hand over a fully-built string at the end of
  // a generation (e.g. the BEAU main view).
  // Keeps the 500ms overlap-prevention pause from the Issue 3 fix.
  const speak = useCallback(async (text) => {
    const cleaned = cleanForSpeech(text);
    if (!cleaned) return;
    if (speakingRef.current || processingRef.current) {
      stop();
      await new Promise(r => setTimeout(r, 500));
    }
    queueRef.current = [cleaned];
    if (!processingRef.current) processQueue();
  }, [stop, processQueue]);

  return {
    speak,
    enqueue,
    stop,
    cancel: stop,
    isSpeaking,
    autoSpeak,
    setAutoSpeak,
    voicePref,
    setVoicePref,
    voiceName,
    voicesLoaded: true,
  };
}
