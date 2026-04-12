// ============================================================================
// B.E.A.U. Voice Control — Speaker button + auto-speak toggle
// ============================================================================

import React from "react";

export default function BeauVoiceControl({ isSpeaking, autoSpeak, setAutoSpeak, onStop, voiceName, compact = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {/* Auto-speak toggle */}
      <button
        onClick={() => setAutoSpeak(!autoSpeak)}
        title={autoSpeak ? "Auto-speak ON — click to mute" : "Auto-speak OFF — click to enable"}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: compact ? "4px 8px" : "5px 12px",
          borderRadius: 6,
          background: autoSpeak ? "rgba(14,165,233,0.12)" : "transparent",
          border: `1px solid ${autoSpeak ? "#0EA5E9" : "rgba(100,116,139,0.3)"}`,
          color: autoSpeak ? "#0EA5E9" : "#94a3b8",
          fontSize: 11, fontWeight: 600, cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {autoSpeak ? "\u{1F50A}" : "\u{1F507}"}
        {!compact && (autoSpeak ? " Voice ON" : " Voice OFF")}
      </button>

      {/* Stop speaking button — only visible when speaking */}
      {isSpeaking && (
        <button
          onClick={onStop}
          title="Stop speaking"
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: compact ? "4px 8px" : "5px 10px",
            borderRadius: 6,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "#ef4444",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            animation: "pulseK9 1.2s ease-in-out infinite",
          }}
        >
          \u{23F9} Stop
        </button>
      )}
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
