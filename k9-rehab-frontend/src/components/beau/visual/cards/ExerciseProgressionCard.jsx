import React from "react";

const LEVEL_COLORS = ["#1D9E75", "#0EA5E9", "#BA7517", "#8B5CF6", "#A32D2D"];

export default function ExerciseProgressionCard({ card }) {
  const exercises = card.exercises || [];
  const currentLevel = card.currentLevel ?? 0;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 10, color: "var(--k9-teal)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
        Exercise Progression
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--k9-text)", marginBottom: 4 }}>
        {card.title}
      </div>
      {card.condition && <div style={{ fontSize: 11, color: "var(--k9-text-light)", marginBottom: 12 }}>Condition: {card.condition}</div>}

      <div style={{ position: "relative", paddingLeft: 30 }}>
        {/* Vertical progress line */}
        <div style={{
          position: "absolute", left: 11, top: 8, bottom: 8, width: 2,
          background: "var(--k9-border)", borderRadius: 1,
        }} />

        {exercises.map((ex, i) => {
          const level = ex.level ?? i + 1;
          const isCurrent = level === currentLevel;
          const isPast = level < currentLevel;
          const color = LEVEL_COLORS[i % LEVEL_COLORS.length];

          return (
            <div key={i} style={{ position: "relative", marginBottom: 12 }}>
              {/* Level dot */}
              <div style={{
                position: "absolute", left: -24, top: 6,
                width: 14, height: 14, borderRadius: "50%",
                background: isCurrent ? color : isPast ? `${color}60` : "var(--k9-border)",
                border: isCurrent ? `3px solid ${color}40` : "2px solid var(--k9-surface)",
                boxShadow: isCurrent ? `0 0 8px ${color}40` : "none",
              }} />

              {/* Exercise card */}
              <div style={{
                padding: "8px 12px", borderRadius: 8,
                background: isCurrent ? `${color}10` : "var(--k9-bg)",
                border: isCurrent ? `2px solid ${color}` : "1px solid var(--k9-border)",
                opacity: isPast ? 0.6 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? color : "var(--k9-text)" }}>
                      {ex.name}
                    </div>
                    {ex.code && (
                      <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: `${color}15`, color, fontWeight: 600 }}>
                        {ex.code}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--k9-text-light)" }}>
                    Level {level}
                  </div>
                </div>
                {ex.criteria && (
                  <div style={{ fontSize: 10, color: "var(--k9-text-light)", marginTop: 4, fontStyle: "italic" }}>
                    Advance when: {ex.criteria}
                  </div>
                )}
                {isCurrent && (
                  <div style={{ fontSize: 9, color, fontWeight: 700, marginTop: 4, textTransform: "uppercase" }}>
                    Current Level
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 8, color: "var(--k9-text-light)", textAlign: "right", marginTop: 8 }}>K9 Rehab Pro Exercise Library</div>
    </div>
  );
}
