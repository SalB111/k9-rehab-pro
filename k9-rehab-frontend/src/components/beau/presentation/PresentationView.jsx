import React, { useState, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiX, FiDownload, FiGrid } from "react-icons/fi";
import TitleSlide from "./slides/TitleSlide";
import PatientOverviewSlide from "./slides/PatientOverviewSlide";
import ExerciseCardSlide from "./slides/ExerciseCardSlide";
import EvidenceSummarySlide from "./slides/EvidenceSummarySlide";
import PhaseComparisonSlide from "./slides/PhaseComparisonSlide";
import BeforeAfterSlide from "./slides/BeforeAfterSlide";
import ConclusionSlide from "./slides/ConclusionSlide";
import GenericSlide from "./slides/GenericSlide";

const SLIDE_MAP = {
  title: TitleSlide,
  patient_overview: PatientOverviewSlide,
  exercise_card: ExerciseCardSlide,
  evidence_summary: EvidenceSummarySlide,
  phase_comparison: PhaseComparisonSlide,
  before_after: BeforeAfterSlide,
  conclusion: ConclusionSlide,
};

export default function PresentationView({ deck, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const slideRef = useRef(null);

  if (!deck || !deck.slides || deck.slides.length === 0) return null;

  const slides = deck.slides;
  const total = slides.length;

  const prev = () => setCurrentSlide(i => Math.max(0, i - 1));
  const next = () => setCurrentSlide(i => Math.min(total - 1, i + 1));

  const exportPdf = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [960, 540] });

      for (let i = 0; i < total; i++) {
        setCurrentSlide(i);
        await new Promise(r => setTimeout(r, 200));
        const canvas = await html2canvas(slideRef.current, { scale: 2, backgroundColor: "#fff" });
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 960, 540);
      }

      pdf.save(`${deck.title || "presentation"}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  const SlideComponent = SLIDE_MAP[slides[currentSlide]?.type] || GenericSlide;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 16px", background: "rgba(0,0,0,0.6)",
      }}>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
          {deck.title} — {currentSlide + 1}/{total}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowGrid(g => !g)} style={btnStyle}>
            <FiGrid size={14} />
          </button>
          <button onClick={exportPdf} style={btnStyle}>
            <FiDownload size={14} /> PDF
          </button>
          <button onClick={onClose} style={btnStyle}>
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Slide area */}
      {showGrid ? (
        <div style={{
          flex: 1, overflow: "auto", padding: 20,
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12,
        }}>
          {slides.map((slide, i) => {
            const Comp = SLIDE_MAP[slide.type] || GenericSlide;
            return (
              <div key={i} onClick={() => { setCurrentSlide(i); setShowGrid(false); }}
                style={{
                  cursor: "pointer", borderRadius: 8, overflow: "hidden",
                  border: i === currentSlide ? "2px solid #1D9E75" : "2px solid transparent",
                  transform: "scale(1)", transition: "transform 0.15s",
                }}>
                <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
                  <div style={{ transform: "scale(0.3)", transformOrigin: "top left", width: "333%", height: "333%" }}>
                    <Comp slide={slide} />
                  </div>
                </div>
                <div style={{ padding: "4px 8px", background: "#111", color: "#aaa", fontSize: 10 }}>
                  {i + 1}. {slide.title || slide.type}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <button onClick={prev} disabled={currentSlide === 0} style={{ ...navBtn, opacity: currentSlide === 0 ? 0.3 : 1 }}>
            <FiChevronLeft size={24} />
          </button>
          <div ref={slideRef} style={{
            width: 960, maxWidth: "calc(100vw - 120px)", aspectRatio: "16/9",
            borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}>
            <SlideComponent slide={slides[currentSlide]} />
          </div>
          <button onClick={next} disabled={currentSlide === total - 1} style={{ ...navBtn, opacity: currentSlide === total - 1 ? 0.3 : 1 }}>
            <FiChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height: 3, background: "#333" }}>
        <div style={{ height: 3, background: "#1D9E75", width: `${((currentSlide + 1) / total) * 100}%`, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "4px 10px", borderRadius: 4, border: "1px solid #555",
  background: "transparent", color: "#ccc", fontSize: 12,
  cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
};

const navBtn = {
  background: "transparent", border: "none", color: "#fff",
  cursor: "pointer", padding: 12,
};
