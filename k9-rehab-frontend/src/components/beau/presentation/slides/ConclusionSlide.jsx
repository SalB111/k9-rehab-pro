import React from "react";

export default function ConclusionSlide({ slide }) {
  return (
    <div style={{
      width: "100%", height: "100%", background: "linear-gradient(135deg, #0C2340, #0F4C81)",
      display: "flex", flexDirection: "column", justifyContent: "center", padding: 60, color: "#fff",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#1D9E75", marginBottom: 16, fontWeight: 600 }}>
        Summary & Recommendations
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>{slide.title}</div>
      {slide.recommendations && (
        <div style={{ marginBottom: 20 }}>
          {(Array.isArray(slide.recommendations) ? slide.recommendations : [slide.recommendations]).map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#1D9E75", fontWeight: 700, fontSize: 14, marginTop: 1 }}>+</span>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: "#D0E4F5" }}>{r}</span>
            </div>
          ))}
        </div>
      )}
      {slide.nextSteps && (
        <div style={{ padding: "12px 16px", background: "rgba(29,158,117,0.15)", borderRadius: 8, border: "1px solid rgba(29,158,117,0.3)" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#1D9E75", marginBottom: 6, textTransform: "uppercase" }}>Next Steps</div>
          <div style={{ fontSize: 13, color: "#B8D4E8", lineHeight: 1.6 }}>
            {Array.isArray(slide.nextSteps) ? slide.nextSteps.join(" | ") : slide.nextSteps}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 16, left: 60, right: 60, fontSize: 9, color: "#3A6A8A", textAlign: "center" }}>
        {slide.disclaimer || "This protocol must be reviewed and approved by a licensed veterinarian. K9 Rehab Pro CDSS."}
      </div>
    </div>
  );
}
