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
const SPEED_STORAGE_KEY = "beau_voice_speed";

// Allowed OpenAI TTS speed range is 0.25–4.0. We expose 4 clinical presets.
export const BEAU_SPEEDS = [
  { value: 0.75, label: "Slow" },
  { value: 1.0,  label: "Normal" },
  { value: 1.25, label: "Fast" },
  { value: 1.5,  label: "Very Fast" },
];

const getStoredVoice = () => {
  try {
    const v = localStorage.getItem(VOICE_STORAGE_KEY);
    return BEAU_VOICES.find(x => x.id === v)?.id || "onyx";
  } catch { return "onyx"; }
};
const getStoredSpeed = () => {
  try {
    const raw = parseFloat(localStorage.getItem(SPEED_STORAGE_KEY));
    if (!isNaN(raw) && raw >= 0.25 && raw <= 4.0) return raw;
  } catch {}
  return 1.0;
};

export default function useBeauVoice(locale = "en") {
  // DEMO-READY DEFAULT (Dr. Bibevski 7pm): autoSpeak defaults to TRUE so
  // B.E.A.U. speaks every response out loud without any user action. A user
  // can still opt out via the BeauVoiceControl toggle; their preference is
  // persisted in localStorage and respected on reload.
  const [autoSpeak, setAutoSpeak] = useState(() => {
    try {
      const v = localStorage.getItem("k9_beau_autospeak");
      if (v === "false") return false;
      if (v === "true")  return true;
      return true; // default ON for new visitors
    } catch { return true; }
  });
  const [voicePref, setVoicePrefState] = useState(getStoredVoice);
  const [speedPref, setSpeedPrefState] = useState(getStoredSpeed);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceName] = useState("BEAU");
  const audioRef = useRef(null);
  const abortRef = useRef(null);
  const speakingRef = useRef(false);
  const pausedRef = useRef(false);
  const queueRef = useRef([]);          // FIFO queue of cleaned text segments
  const processingRef = useRef(false);   // True while the queue processor loop is active
  const voicePrefRef = useRef(voicePref);
  const speedPrefRef = useRef(speedPref);
  const localeRef = useRef(locale);

  // Keep refs in sync so the queue processor (a long-lived async loop) always
  // reads the latest values without needing to re-create on every render.
  useEffect(() => { voicePrefRef.current = voicePref; }, [voicePref]);
  useEffect(() => { speedPrefRef.current = speedPref; }, [speedPref]);
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

  const setSpeedPref = useCallback((val) => {
    const n = parseFloat(val);
    if (isNaN(n) || n < 0.25 || n > 4.0) return;
    setSpeedPrefState(n);
    try { localStorage.setItem(SPEED_STORAGE_KEY, String(n)); } catch {}
  }, []);

  // Hard stop — drain queue, abort fetch, pause audio. Used when the user
  // clicks Stop, switches patients, closes a modal, or starts a brand-new
  // generation that should replace the in-flight one.
  const stop = useCallback(() => {
    queueRef.current = [];
    processingRef.current = false;
    pausedRef.current = false;
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
    setIsPaused(false);
  }, []);

  // PAUSE — holds current audio playback without clearing the queue.
  // The audio element's .pause() freezes playback; because the audio's
  // onended handler never fires while paused, the queue processor's
  // await on playOne() stays awaited and no new segment starts.
  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      try { audioRef.current.pause(); } catch {}
      pausedRef.current = true;
      setIsPaused(true);
    }
  }, []);

  // RESUME — un-pauses the currently-held audio. When it finishes,
  // onended fires normally and the queue processor proceeds to the
  // next queued segment.
  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      try { audioRef.current.play().catch(() => {}); } catch {}
      pausedRef.current = false;
      setIsPaused(false);
    }
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
          speed: speedPrefRef.current,
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

  // ── playText — one-shot play of arbitrary text (user presses Play) ──
  const playText = useCallback((text) => {
    const cleaned = cleanForSpeech(text);
    if (!cleaned) return;
    stop();
    queueRef.current = [cleaned];
    processQueue();
  }, [stop, processQueue]);

  // ── Sentence splitting helper for rewind / fast-forward ──
  const splitSentences = useCallback((text) => {
    if (!text) return [];
    const cleaned = cleanForSpeech(text);
    return cleaned.match(/[^.!?]+[.!?]+[\s]*/g) || [cleaned];
  }, []);

  // Track spoken sentences for rewind/ff — callers set this via setSentences
  const sentencesRef = useRef([]);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const sentenceIndexRef = useRef(0);
  useEffect(() => { sentenceIndexRef.current = sentenceIndex; }, [sentenceIndex]);

  const setSentences = useCallback((text) => {
    sentencesRef.current = splitSentences(text);
    sentenceIndexRef.current = 0;
    setSentenceIndex(0);
  }, [splitSentences]);

  // ── rewind(n) — go back n sentences and replay from there ──
  const rewind = useCallback((n = 2) => {
    const sents = sentencesRef.current;
    if (!sents.length) return;
    stop();
    const newIdx = Math.max(0, sentenceIndexRef.current - n);
    sentenceIndexRef.current = newIdx;
    setSentenceIndex(newIdx);
    const remaining = sents.slice(newIdx);
    if (remaining.length > 0) {
      queueRef.current = [...remaining];
      processQueue();
    }
  }, [stop, processQueue]);

  // ── fastForward(n) — skip ahead n sentences (blocked while generating) ──
  const [isGenerating, setIsGenerating] = useState(false);

  const fastForward = useCallback((n = 2) => {
    if (isGenerating) return; // blocked while B.E.A.U. is still outputting
    const sents = sentencesRef.current;
    if (!sents.length) return;
    stop();
    const newIdx = Math.min(sents.length - 1, sentenceIndexRef.current + n);
    sentenceIndexRef.current = newIdx;
    setSentenceIndex(newIdx);
    const remaining = sents.slice(newIdx);
    if (remaining.length > 0) {
      queueRef.current = [...remaining];
      processQueue();
    }
  }, [isGenerating, stop, processQueue]);

  return {
    speak,
    enqueue,
    stop,
    cancel: stop,
    pause,
    resume,
    playText,
    rewind,
    fastForward,
    setSentences,
    isGenerating,
    setIsGenerating,
    isSpeaking,
    isPaused,
    autoSpeak,
    setAutoSpeak,
    voicePref,
    setVoicePref,
    speedPref,
    setSpeedPref,
    voiceName,
    voicesLoaded: true,
  };
}
