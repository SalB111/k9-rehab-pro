import React from "react";

export default function BeforeAfterSlide({ slide }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", padding: 40 }}>
      <div style={{ fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
        Progress Comparison
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#0F4C81", marginBottom: 20 }}>{slide.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flex: 1 }}>
        <Column label="Before" data={slide.before} color="#A32D2D" />
        <Column label="After" data={slide.after} color="#1D9E75" />
      </div>
      {slide.metrics && (
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {(Array.isArray(slide.metrics) ? slide.metrics : []).map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px 0", background: "#F4F8FD", borderRadius: 6 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1D9E75" }}>{m.value}</div>
              <div style={{ fontSize: 10, color: "#888" }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 8, color: "#bbb", textAlign: "right", marginTop: 8 }}>K9 Rehab Pro CDSS</div>
    </div>
  );
}

function Column({ label, data, color }) {
  const items = typeof data === "string" ? [data] : Array.isArray(data) ? data : Object.entries(data || {}).map(([k, v]) => `${k}: ${v}`);
  return (
    <div style={{ background: `${color}08`, borderRadius: 8, padding: 16, border: `1px solid ${color}30` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 10, textTransform: "uppercase" }}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 13, color: "#333", marginBottom: 6, paddingLeft: 10, borderLeft: `2px solid ${color}40`, lineHeight: 1.5 }}>
          {item}
        </div>
      ))}
    </div>
  );
}
