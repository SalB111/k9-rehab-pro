import React from "react";

const STATUS_COLORS = {
  affected: "#A32D2D",
  surgical: "#BA7517",
  "surgical site": "#BA7517",
  normal: "#1D9E75",
  inflamed: "#A32D2D",
  healing: "#0EA5E9",
};

export default function AnatomyDiagramCard({ card }) {
  const structures = card.structures || [];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 10, color: "var(--k9-teal)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
        Anatomy Reference
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--k9-text)", marginBottom: 4 }}>
        {card.title}
      </div>
      {card.region && <div style={{ fontSize: 11, color: "var(--k9-text-light)", marginBottom: 12 }}>Region: {card.region}</div>}
      {card.condition && <div style={{ fontSize: 11, color: "var(--k9-text-light)", marginBottom: 12 }}>Condition: {card.condition}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {structures.map((s, i) => {
          const color = STATUS_COLORS[s.status?.toLowerCase()] || "#888";
          return (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 6,
              background: `${color}08`, border: `1px solid ${color}30`,
              borderLeft: `3px solid ${color}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--k9-text)" }}>{s.name}</div>
              <div style={{ fontSize: 10, color, fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>
                {s.status || "Normal"}
              </div>
              {s.notes && <div style={{ fontSize: 10, color: "var(--k9-text-light)", marginTop: 2 }}>{s.notes}</div>}
            </div>
          );
        })}
      </div>

      {card.labels && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--k9-text-light)", lineHeight: 1.6 }}>
          {Array.isArray(card.labels) ? card.labels.join(" | ") : card.labels}
        </div>
      )}

      <div style={{ fontSize: 8, color: "var(--k9-text-light)", textAlign: "right", marginTop: 8 }}>K9 Rehab Pro Anatomy Reference</div>
    </div>
  );
}
