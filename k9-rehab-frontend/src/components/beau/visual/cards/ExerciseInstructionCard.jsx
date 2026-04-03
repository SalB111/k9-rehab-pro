import React from "react";
import { FiAlertTriangle, FiCheckCircle, FiTool } from "react-icons/fi";

const DIFFICULTY_COLORS = { Easy: "#1D9E75", Moderate: "#0EA5E9", Advanced: "#BA7517" };

export default function ExerciseInstructionCard({ card }) {
  const diffColor = DIFFICULTY_COLORS[card.difficulty] || "#888";

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--k9-text)" }}>{card.exerciseName}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--k9-teal)", color: "#fff", fontWeight: 600 }}>{card.code}</span>
            {card.category && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--k9-bg)", color: "var(--k9-text-light)", fontWeight: 500 }}>{card.category}</span>}
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${diffColor}15`, color: diffColor, fontWeight: 600 }}>{card.difficulty}</span>
            {card.evidenceGrade && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#BA751715", color: "#BA7517", fontWeight: 600 }}>Grade {card.evidenceGrade}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Steps */}
        {card.steps?.length > 0 && (
          <div style={{ gridColumn: "1/3" }}>
            <SectionLabel icon={<FiCheckCircle size={11} />} color="#1D9E75">Steps</SectionLabel>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--k9-text)", lineHeight: 1.7 }}>
              {card.steps.map((step, i) => <li key={i} style={{ marginBottom: 2 }}>{step}</li>)}
            </ol>
          </div>
        )}

        {/* Equipment */}
        {card.equipment?.length > 0 && (
          <div>
            <SectionLabel icon={<FiTool size={11} />} color="#0EA5E9">Equipment</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {card.equipment.map((e, i) => (
                <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--k9-bg)", color: "var(--k9-text)", border: "1px solid var(--k9-border)" }}>{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* Dosing */}
        {(card.sets || card.frequency) && (
          <div>
            <SectionLabel color="#8B5CF6">Dosing</SectionLabel>
            {card.sets && <div style={{ fontSize: 12, color: "var(--k9-text)" }}>{card.sets}</div>}
            {card.frequency && <div style={{ fontSize: 11, color: "var(--k9-text-light)" }}>{card.frequency}</div>}
          </div>
        )}

        {/* Form Cues */}
        {card.formCues?.length > 0 && (
          <div>
            <SectionLabel icon={<FiCheckCircle size={11} />} color="#1D9E75">Good Form</SectionLabel>
            <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11, color: "#1D9E75", lineHeight: 1.6 }}>
              {card.formCues.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {/* Red Flags */}
        {card.redFlags?.length > 0 && (
          <div>
            <SectionLabel icon={<FiAlertTriangle size={11} />} color="#A32D2D">Red Flags</SectionLabel>
            <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11, color: "#A32D2D", lineHeight: 1.6 }}>
              {card.redFlags.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Contraindications */}
      {card.contraindications && (
        <div style={{ marginTop: 10, padding: "6px 10px", background: "#A32D2D08", borderRadius: 6, border: "1px solid #A32D2D20", fontSize: 11, color: "#A32D2D" }}>
          <strong>Contraindications:</strong> {card.contraindications}
        </div>
      )}

      <div style={{ fontSize: 8, color: "var(--k9-text-light)", textAlign: "right", marginTop: 8 }}>K9 Rehab Pro Exercise Library</div>
    </div>
  );
}

function SectionLabel({ children, icon, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: color || "var(--k9-text)", textTransform: "uppercase", marginBottom: 4 }}>
      {icon} {children}
    </div>
  );
}
