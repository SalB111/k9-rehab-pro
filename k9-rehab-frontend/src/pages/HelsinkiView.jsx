// ──────────────────────────────────────────────────────────────────────────────
// HELSINKI CHRONIC PAIN INDEX — Standalone Page
// Hielm-Björkman et al. (2003) — Owner-completed 11-item questionnaire for
// canine chronic musculoskeletal pain. 11 items × 0–4 points = 0–44 total.
// Printable client handout with auto-scoring and interpretation banner.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import C from "../constants/colors";
import { useTr } from "../i18n/useTr";

const HELSINKI_QUESTIONS = [
  { n: 1,  text: "General mood / vitality" },
  { n: 2,  text: "Willingness to play" },
  { n: 3,  text: "Vocalization when moving (whining, whimpering)" },
  { n: 4,  text: "Manner of walking (trot)" },
  { n: 5,  text: "Manner of walking (gallop)" },
  { n: 6,  text: "Manner of jumping (e.g. into car, on couch)" },
  { n: 7,  text: "Manner of lying down" },
  { n: 8,  text: "Manner of rising from rest" },
  { n: 9,  text: "Ease of movement after resting" },
  { n: 10, text: "Ease of movement after heavy exercise" },
  { n: 11, text: "Ease of movement in cold weather" },
];

const HELSINKI_OPTIONS = [
  { v: "0", label: "0 — Normal / no difficulty" },
  { v: "1", label: "1 — Slightly altered" },
  { v: "2", label: "2 — Moderately altered" },
  { v: "3", label: "3 — Severely altered" },
  { v: "4", label: "4 — Cannot perform / severe distress" },
];

const STORAGE_KEY = "k9rp_helsinki_last";

export default function HelsinkiView({ setView }) {
  const tr = useTr();
  // Local state — loaded from localStorage so clinician can resume between pages
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  });

  const update = (key, val) => {
    setData(prev => {
      const next = { ...prev, [key]: val };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Auto-calculate total
  const total = HELSINKI_QUESTIONS.reduce((sum, q) => {
    const v = parseInt(data[`Q${q.n}`], 10);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  useEffect(() => {
    if (total > 0) update("Total Score", String(total));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const interpretation =
    total === 0 ? { label: tr("Not scored"), color: "#64748b", bg: "#f1f5f9" } :
    total <= 11 ? { label: tr("Minimal pain — routine monitoring"), color: "#16a34a", bg: "#f0fdf4" } :
    total <= 22 ? { label: tr("Mild pain — consider NSAIDs + rehab"), color: "#b45309", bg: "#fef3c7" } :
    total <= 33 ? { label: tr("Moderate pain — multimodal analgesia indicated"), color: "#ea580c", bg: "#fff7ed" } :
                  { label: tr("Severe pain — aggressive multimodal therapy + reassessment"), color: "#dc2626", bg: "#fef2f2" };

  const handlePrint = () => window.print();

  const clearForm = () => {
    if (!confirm(tr("Clear all Helsinki answers and start over?"))) return;
    setData({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const S = {
    page: { padding: 32, maxWidth: 960, margin: "0 auto", background: "#ffffff", minHeight: "100vh" },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 800, color: "#0c4a6e", marginBottom: 6 },
    subtitle: { fontSize: 12, color: "#64748b", lineHeight: 1.7, marginBottom: 16 },
    btnRow: { display: "flex", gap: 10, marginBottom: 20 },
    btn: (bg, color) => ({
      padding: "10px 18px", background: bg, border: "none", color,
      borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700,
      letterSpacing: ".06em", display: "inline-flex", alignItems: "center", gap: 8,
    }),
    card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 14 },
    cardActive: { background: "#eff6ff", border: "1px solid #3b82f6", borderRadius: 8, padding: 16, marginBottom: 14 },
    qText: { fontSize: 13, fontWeight: 700, color: "#0c4a6e", marginBottom: 10 },
    optGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 },
    opt: (selected) => ({
      padding: "8px 10px", textAlign: "center",
      border: `1.5px solid ${selected ? "#3b82f6" : "#cbd5e1"}`,
      background: selected ? "#3b82f6" : "#fff",
      color: selected ? "#fff" : "#334155",
      borderRadius: 5, cursor: "pointer",
      fontSize: 10, fontWeight: 600, lineHeight: 1.3,
      transition: "all .12s",
    }),
    field: { width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 5, fontSize: 13, color: "#0f172a", background: "#fff" },
    label: { fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>📝</span>
          <h1 style={S.title}>{tr("Helsinki Chronic Pain Index")}</h1>
        </div>
        <p style={S.subtitle}>
          {tr("Validated 11-item owner-completed questionnaire for canine chronic musculoskeletal pain.")}
          {" "}{tr("Reference")}: <em>Hielm-Björkman AK et al (2003), Am J Vet Res</em>. {tr("Each item scored 0–4; total score 0–44. Print this page for the client to complete at home, then enter results when they return.")}
        </p>

        <div style={S.btnRow}>
          <button onClick={handlePrint} style={S.btn("#0c4a6e", "#fff")}>
            🖨️ {tr("PRINT FOR CLIENT")}
          </button>
          <button onClick={clearForm} style={S.btn("#fff", "#dc2626")}>
            ✕ {tr("CLEAR FORM")}
          </button>
          {setView && (
            <button onClick={() => setView("dashboard")} style={S.btn("#fff", "#64748b")}>
              ← {tr("BACK TO DASHBOARD")}
            </button>
          )}
        </div>
      </div>

      {/* Patient + Date */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, padding: "14px 16px", border: "1px dashed #cbd5e1", borderRadius: 6, background: "#fafbfc" }}>
        <div>
          <label style={S.label}>{tr("Patient Name")}</label>
          <input style={S.field} placeholder={tr("Patient")}
            value={data["Patient Name"] || ""}
            onChange={e => update("Patient Name", e.target.value)}/>
        </div>
        <div>
          <label style={S.label}>{tr("Assessment Date")}</label>
          <input style={S.field} type="date"
            value={data["Date"] || ""}
            onChange={e => update("Date", e.target.value)}/>
        </div>
      </div>

      {/* 11 Questions */}
      {HELSINKI_QUESTIONS.map(q => {
        const val = data[`Q${q.n}`] || "";
        return (
          <div key={q.n} style={val ? S.cardActive : S.card}>
            <div style={S.qText}>{q.n}. {tr(q.text)}</div>
            <div style={S.optGrid}>
              {HELSINKI_OPTIONS.map(opt => (
                <div key={opt.v}
                  onClick={() => update(`Q${q.n}`, opt.v)}
                  style={S.opt(val === opt.v)}>
                  {tr(opt.label)}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Total Score + Interpretation */}
      <div style={{
        marginTop: 18, padding: "18px 22px",
        background: interpretation.bg,
        border: `1.5px solid ${interpretation.color}`,
        borderRadius: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: interpretation.color, letterSpacing: ".08em", textTransform: "uppercase" }}>
            {tr("Total Score")}
          </span>
          <span style={{ fontSize: 32, fontWeight: 900, color: interpretation.color }}>
            {total} <span style={{ fontSize: 16, fontWeight: 600 }}>/ 44</span>
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: interpretation.color }}>
          {interpretation.label}
        </div>
      </div>

      {/* Clinician notes */}
      <div style={{ marginTop: 16 }}>
        <label style={S.label}>{tr("Clinician Notes")}</label>
        <textarea style={{ ...S.field, minHeight: 80, resize: "vertical" }} rows={3}
          placeholder={tr("Clinical interpretation, treatment plan, reassessment interval…")}
          value={data["Clinician Notes"] || ""}
          onChange={e => update("Clinician Notes", e.target.value)}/>
      </div>

      {/* Footer guide */}
      <div style={{ marginTop: 18, padding: "12px 16px", background: "#f1f5f9", border: "1px dashed #cbd5e1", borderRadius: 6, fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
        <b>{tr("Clinical scoring guide")}:</b> 0–11 {tr("Minimal")} · 12–22 {tr("Mild")} · 23–33 {tr("Moderate")} · 34–44 {tr("Severe")}.
        {" "}{tr("HCPI responsiveness validated against force-plate analysis (Hielm-Björkman 2009).")}
        {" "}{tr("Reassess at 4–6 week intervals or after therapy changes.")}
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
