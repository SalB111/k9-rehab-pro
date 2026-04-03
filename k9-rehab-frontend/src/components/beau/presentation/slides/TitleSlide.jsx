import React from "react";

export default function TitleSlide({ slide }) {
  return (
    <div style={{
      width: "100%", height: "100%", background: "linear-gradient(135deg, #0F4C81, #0C2340)",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      padding: 60, color: "#fff", textAlign: "center",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#1D9E75", marginBottom: 16, fontWeight: 600 }}>
        K9 Rehab Pro Clinical Presentation
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.3, maxWidth: 700 }}>
        {slide.title}
      </div>
      {slide.subtitle && (
        <div style={{ fontSize: 16, color: "#8BB8D9", marginTop: 12 }}>{slide.subtitle}</div>
      )}
      {(slide.date || slide.author) && (
        <div style={{ fontSize: 12, color: "#5A8FB4", marginTop: 24 }}>
          {slide.author}{slide.author && slide.date ? " | " : ""}{slide.date}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 16, fontSize: 9, color: "#3A6A8A" }}>
        CDSS — Clinical Decision-Support System
      </div>
    </div>
  );
}
