import React from "react";

const DEFAULT_COLORS = ["#0EA5E9", "#1D9E75", "#BA7517", "#8B5CF6", "#A32D2D", "#1A5F8A"];

export default function TimelineView({ diagram }) {
  const { title, events = [] } = diagram;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--k9-text)", marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 9, top: 6, bottom: 6, width: 2,
          background: "var(--k9-border)", borderRadius: 1,
        }} />

        {events.map((evt, i) => {
          const color = evt.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <div key={i} style={{ position: "relative", marginBottom: 16 }}>
              {/* Dot */}
              <div style={{
                position: "absolute", left: -23, top: 4,
                width: 12, height: 12, borderRadius: "50%",
                background: color, border: "2px solid var(--k9-surface)",
                boxShadow: `0 0 0 2px ${color}40`,
              }} />
              {/* Content */}
              <div style={{
                background: `${color}08`, border: `1px solid ${color}30`,
                borderRadius: 8, padding: "8px 12px",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color }}>
                  {evt.label}
                </div>
                {(evt.start || evt.end) && (
                  <div style={{ fontSize: 11, color: "var(--k9-text-light)", marginTop: 2 }}>
                    {evt.start}{evt.end ? ` \u2192 ${evt.end}` : ""}
                  </div>
                )}
                {evt.description && (
                  <div style={{ fontSize: 11, color: "var(--k9-text)", marginTop: 4, lineHeight: 1.5 }}>
                    {evt.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
