// ============================================================================
// B.E.A.U. Voice Control — Mute · Pause/Resume · Stop
// ============================================================================
// Four buttons:
//   1. Voice ON/OFF (mute) — toggles autoSpeak AND cancels current playback
//      when muting (fix for "mute button not working").
//   2. PAUSE/RESUME — yellow/amber; freezes current audio without clearing
//      the queue. Click again to resume from where it stopped.
//   3. STOP — red; cancels current speech + clears the queue. Always visible
//      (greyed out when idle). Does not resume until next Generate click.
// ============================================================================

import React from "react";

export default function BeauVoiceControl({
  isSpeaking,
  isPaused,
  autoSpeak,
  setAutoSpeak,
  onStop,
  onPause,
  onResume,
  voiceName,
  compact = false,
}) {
  // Fix for Issue 1 — muting must ALSO stop currently-playing audio.
  // The original bug: onClick only flipped the autoSpeak flag, which only
  // affected FUTURE speech. Current audio kept playing, so the user
  // perceived the mute button as broken.
  const toggleMute = () => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    if (!next && onStop) onStop(); // muting → halt playback immediately
  };

  const handlePauseResume = () => {
    if (isPaused) { onResume?.(); }
    else          { onPause?.(); }
  };

  const pad = compact ? "4px 8px" : "5px 12px";
  const fs = 11;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {/* ── Voice ON / OFF (mute) ── */}
      <button
        onClick={toggleMute}
        title={autoSpeak ? "Auto-speak ON — click to mute and stop current playback" : "Auto-speak OFF — click to enable"}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: pad,
          borderRadius: 6,
          background: autoSpeak ? "rgba(14,165,233,0.12)" : "transparent",
          border: `1px solid ${autoSpeak ? "#0EA5E9" : "rgba(100,116,139,0.3)"}`,
          color: autoSpeak ? "#0EA5E9" : "#94a3b8",
          fontSize: fs, fontWeight: 600, cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {autoSpeak ? "\u{1F50A}" : "\u{1F507}"}
        {!compact && (autoSpeak ? " Voice ON" : " Voice OFF")}
      </button>

      {/* ── PAUSE / RESUME — amber ── */}
      <button
        onClick={handlePauseResume}
        disabled={!isSpeaking && !isPaused}
        title={isPaused ? "Resume playback" : "Pause playback"}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: pad,
          borderRadius: 6,
          background: (isSpeaking || isPaused) ? "rgba(245,158,11,0.12)" : "rgba(100,116,139,0.06)",
          border: `1px solid ${(isSpeaking || isPaused) ? "#F59E0B" : "rgba(100,116,139,0.25)"}`,
          color: (isSpeaking || isPaused) ? "#F59E0B" : "#cbd5e1",
          fontSize: fs, fontWeight: 600,
          cursor: (isSpeaking || isPaused) ? "pointer" : "not-allowed",
          opacity: (isSpeaking || isPaused) ? 1 : 0.55,
          transition: "all 0.15s",
        }}
      >
        {isPaused ? "\u25B6" : "\u23F8"}
        {!compact && (isPaused ? " Resume" : " Pause")}
      </button>

      {/* ── STOP — red, always visible ── */}
      <button
        onClick={onStop}
        disabled={!isSpeaking && !isPaused}
        title="Stop speaking and clear the queue"
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: pad,
          borderRadius: 6,
          background: (isSpeaking || isPaused) ? "rgba(239,68,68,0.12)" : "rgba(100,116,139,0.06)",
          border: `1px solid ${(isSpeaking || isPaused) ? "#ef4444" : "rgba(100,116,139,0.25)"}`,
          color: (isSpeaking || isPaused) ? "#ef4444" : "#cbd5e1",
          fontSize: fs, fontWeight: 600,
          cursor: (isSpeaking || isPaused) ? "pointer" : "not-allowed",
          opacity: (isSpeaking || isPaused) ? 1 : 0.55,
          animation: (isSpeaking && !isPaused) ? "pulseK9 1.2s ease-in-out infinite" : "none",
          transition: "all 0.15s",
        }}
      >
        {"\u23F9"}
        {!compact && " Stop"}
      </button>
    </div>
  );
}

// Inline speaker button for individual messages
export function SpeakButton({ onClick, isSpeaking }) {
  return (
    <button
      onClick={onClick}
      title={isSpeaking ? "Speaking..." : "Read aloud"}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: "50%",
        background: isSpeaking ? "rgba(14,165,233,0.15)" : "transparent",
        border: `1px solid ${isSpeaking ? "#0EA5E9" : "rgba(100,116,139,0.2)"}`,
        color: isSpeaking ? "#0EA5E9" : "#94a3b8",
        fontSize: 14, cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {isSpeaking ? "\u{1F50A}" : "\u{1F508}"}
    </button>
  );
}
