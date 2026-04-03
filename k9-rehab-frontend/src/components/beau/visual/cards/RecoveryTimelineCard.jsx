import React from "react";

const DEFAULT_COLORS = ["#0EA5E9", "#1D9E75", "#BA7517", "#8B5CF6"];

export default function RecoveryTimelineCard({ card }) {
  const phases = card.phases || [];
  const totalWeeks = card.totalWeeks || 16;
  const currentPhase = card.currentPhase ?? -1;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 10, color: "var(--k9-teal)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
        Recovery Timeline
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--k9-text)", marginBottom: 4 }}>
        {card.title}
      </div>
      {card.patient && <div style={{ fontSize: 11, color: "var(--k9-text-light)", marginBottom: 12 }}>Patient: {card.patient}</div>}

      {/* Timeline bar */}
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 28, marginBottom: 16, border: "1px solid var(--k9-border)" }}>
        {phases.map((phase, i) => {
          const color = phase.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const isCurrent = i + 1 === currentPhase;
          return (
            <div key={i} style={{
              flex: 1, background: isCurrent ? color : `${color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: isCurrent ? "#fff" : color,
              borderRight: i < phases.length - 1 ? "1px solid var(--k9-surface)" : "none",
              position: "relative",
            }}>
              {phase.name || `Phase ${i + 1}`}
              {isCurrent && <span style={{ position: "absolute", bottom: -8, fontSize: 14, lineHeight: 1 }}>&#9650;</span>}
            </div>
          );
        })}
      </div>

      {/* Phase details */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(phases.length, 4)}, 1fr)`, gap: 8 }}>
        {phases.map((phase, i) => {
          const color = phase.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const isCurrent = i + 1 === currentPhase;
          return (
            <div key={i} style={{
              padding: "8px 10px", borderRadius: 6,
              background: isCurrent ? `${color}15` : "var(--k9-bg)",
              border: isCurrent ? `2px solid ${color}` : "1px solid var(--k9-border)",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color }}>{phase.name}</div>
              <div style={{ fontSize: 10, color: "var(--k9-text-light)", marginTop: 2 }}>{phase.weeks}</div>
              {phase.goal && <div style={{ fontSize: 10, color: "var(--k9-text)", marginTop: 4, lineHeight: 1.4 }}>{phase.goal}</div>}
              {phase.exercises && (
                <div style={{ fontSize: 9, color: "var(--k9-text-light)", marginTop: 4 }}>
                  {Array.isArray(phase.exercises) ? phase.exercises.join(", ") : phase.exercises}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10, color: "var(--k9-text-light)", marginTop: 10, textAlign: "center" }}>
        Total Duration: {totalWeeks} weeks | Phase progression is gated by clinical assessment
      </div>
      <div style={{ fontSize: 8, color: "var(--k9-text-light)", textAlign: "right", marginTop: 4 }}>K9 Rehab Pro CDSS</div>
    </div>
  );
}
