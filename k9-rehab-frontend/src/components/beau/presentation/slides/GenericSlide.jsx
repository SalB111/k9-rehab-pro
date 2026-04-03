import React from "react";

export default function GenericSlide({ slide }) {
  const entries = Object.entries(slide || {}).filter(([k]) => k !== "type");
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", padding: 40 }}>
      <div style={{ fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
        {slide?.type || "Slide"}
      </div>
      {slide?.title && <div style={{ fontSize: 22, fontWeight: 700, color: "#0F4C81", marginBottom: 16 }}>{slide.title}</div>}
      <div style={{ flex: 1, overflow: "auto" }}>
        {entries.filter(([k]) => k !== "title").map(([key, value]) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase" }}>{key.replace(/_/g, " ")}</div>
            <div style={{ fontSize: 13, color: "#333", lineHeight: 1.5, marginTop: 2 }}>
              {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 8, color: "#bbb", textAlign: "right" }}>K9 Rehab Pro CDSS</div>
    </div>
  );
}
