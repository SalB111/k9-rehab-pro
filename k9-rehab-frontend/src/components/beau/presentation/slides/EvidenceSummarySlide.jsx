import React from "react";

const GRADE_COLORS = { A: "#1D9E75", B: "#0EA5E9", C: "#BA7517", EO: "#8B5CF6" };

export default function EvidenceSummarySlide({ slide }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", padding: 40 }}>
      <div style={{ fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
        Evidence Summary
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#0F4C81", marginBottom: 16 }}>{slide.title}</div>
      {slide.summary && <div style={{ fontSize: 13, color: "#555", marginBottom: 16, lineHeight: 1.6 }}>{slide.summary}</div>}
      <div style={{ flex: 1, overflow: "auto" }}>
        {(slide.citations || []).map((c, i) => (
          <div key={i} style={{ padding: "8px 12px", marginBottom: 8, background: "#F4F8FD", borderRadius: 6, borderLeft: `3px solid ${GRADE_COLORS[c.grade] || "#999"}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: GRADE_COLORS[c.grade] || "#999", background: `${GRADE_COLORS[c.grade] || "#999"}15`, padding: "1px 6px", borderRadius: 3 }}>
                Grade {c.grade}
              </span>
              <span style={{ fontSize: 10, color: "#888" }}>{c.year}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0C2340", lineHeight: 1.4 }}>{c.title}</div>
            <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{c.authors} — {c.journal}</div>
            {c.finding && <div style={{ fontSize: 11, color: "#555", marginTop: 4, fontStyle: "italic" }}>{c.finding}</div>}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 8, color: "#bbb", textAlign: "right", marginTop: 8 }}>K9 Rehab Pro CDSS</div>
    </div>
  );
}
