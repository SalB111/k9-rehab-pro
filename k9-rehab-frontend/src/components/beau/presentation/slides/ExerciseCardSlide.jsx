import React from "react";

export default function ExerciseCardSlide({ slide }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", padding: 40 }}>
      <div style={{ fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
        Exercise Protocol
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#0F4C81" }}>{slide.exerciseName}</div>
        <div style={{ fontSize: 12, color: "#fff", background: "#1D9E75", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
          {slide.code}
        </div>
        {slide.evidenceGrade && (
          <div style={{ fontSize: 11, color: "#BA7517", fontWeight: 600 }}>Grade {slide.evidenceGrade}</div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
        {slide.category && <Field label="Category" value={slide.category} />}
        {slide.sets && <Field label="Dosing" value={slide.sets} />}
        {slide.frequency && <Field label="Frequency" value={slide.frequency} />}
        {slide.progression && <Field label="Progression" value={slide.progression} />}
        {slide.contraindications && (
          <div style={{ gridColumn: "1/3" }}>
            <Field label="Contraindications" value={slide.contraindications} color="#A32D2D" />
          </div>
        )}
      </div>
      <div style={{ fontSize: 8, color: "#bbb", textAlign: "right", marginTop: 8 }}>K9 Rehab Pro CDSS</div>
    </div>
  );
}

function Field({ label, value, color }) {
  return (
    <div style={{ padding: "8px 12px", background: "#F4F8FD", borderRadius: 6 }}>
      <div style={{ fontSize: 9, color: "#888", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, color: color || "#0C2340", marginTop: 2, lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}
