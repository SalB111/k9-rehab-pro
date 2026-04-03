import React from "react";

export default function PatientOverviewSlide({ slide }) {
  const fields = [
    ["Breed", slide.breed],
    ["Age", slide.age],
    ["Weight", slide.weight ? `${slide.weight} lbs` : null],
    ["Pain Score", slide.painScore],
    ["Mobility", slide.mobility],
    ["Surgery Date", slide.surgeryDate],
    ["Current Phase", slide.phase],
  ].filter(([, v]) => v);

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", padding: 40 }}>
      <div style={{ fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
        Patient Overview
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#0F4C81", marginBottom: 4 }}>
        {slide.patientName}
      </div>
      <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
        {slide.diagnosis}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
        {fields.map(([label, value]) => (
          <div key={label} style={{ padding: "10px 14px", background: "#F4F8FD", borderRadius: 8, borderLeft: "3px solid #0EA5E9" }}>
            <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0C2340", marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 8, color: "#bbb", textAlign: "right", marginTop: 8 }}>K9 Rehab Pro CDSS</div>
    </div>
  );
}
