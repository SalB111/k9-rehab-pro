import React from "react";

const PHASE_COLORS = ["#0EA5E9", "#1D9E75", "#BA7517", "#8B5CF6"];

export default function PhaseComparisonSlide({ slide }) {
  const phases = slide.phases || [];
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", padding: 40 }}>
      <div style={{ fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
        {slide.protocol || "Protocol"} Phases
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#0F4C81", marginBottom: 20 }}>{slide.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(phases.length, 4)}, 1fr)`, gap: 12, flex: 1 }}>
        {phases.map((phase, i) => (
          <div key={i} style={{
            background: "#F4F8FD", borderRadius: 8, padding: 14,
            borderTop: `3px solid ${PHASE_COLORS[i % PHASE_COLORS.length]}`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: PHASE_COLORS[i % PHASE_COLORS.length], marginBottom: 4 }}>
              {phase.label || `Phase ${i + 1}`}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0C2340", marginBottom: 6 }}>{phase.name}</div>
            {phase.weeks && <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>{phase.weeks}</div>}
            {phase.exercises && (
              <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>
                {Array.isArray(phase.exercises) ? phase.exercises.join(", ") : phase.exercises}
              </div>
            )}
            {phase.criteria && (
              <div style={{ fontSize: 10, color: "#1D9E75", marginTop: 6, fontStyle: "italic" }}>{phase.criteria}</div>
            )}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 8, color: "#bbb", textAlign: "right", marginTop: 8 }}>K9 Rehab Pro CDSS</div>
    </div>
  );
}
