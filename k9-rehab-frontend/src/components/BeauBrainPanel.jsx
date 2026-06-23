// ============================================================================
// BEAU'S BRAIN PANEL — the shared clinical engine, two voices, side by toggle.
// ONE verified evidence base → Clinical (K9 Rehab Pro / B2B) and
// Consumer (B.E.A.U. at Home / B2C). Calls POST /api/beau-brain/protocol.
// ============================================================================
import React, { useEffect, useState } from "react";
import api from "../api/axios";

function btn(bg, color = "#fff", border) {
  return { padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: bg, color, border: border ? `1px solid ${border}` : "none" };
}

// Tiny markdown-lite renderer: headers, rule, bold, code, italic. Keeps the two
// voices readable without pulling in a markdown dependency.
function inline(text) {
  const parts = [];
  let rest = text;
  const re = /(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/;
  let key = 0;
  while (rest.length) {
    const m = rest.match(re);
    if (!m) { parts.push(rest); break; }
    if (m.index > 0) parts.push(rest.slice(0, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) parts.push(<code key={key++} style={{ background: "#eef2f7", padding: "1px 5px", borderRadius: 4, fontSize: 11, color: "#0c4a6e" }}>{tok.slice(1, -1)}</code>);
    else parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    rest = rest.slice(m.index + tok.length);
  }
  return parts;
}

function Markdownish({ text }) {
  const lines = (text || "").split("\n");
  return (
    <div style={{ fontSize: 13, lineHeight: 1.6, color: "#0f172a" }}>
      {lines.map((ln, i) => {
        if (ln.startsWith("## ")) return <h3 key={i} style={{ margin: "14px 0 4px", fontSize: 15, color: "#0c4a6e" }}>{inline(ln.slice(3))}</h3>;
        if (ln.startsWith("# ")) return <h2 key={i} style={{ margin: "4px 0 6px", fontSize: 18, color: "#0f172a" }}>{inline(ln.slice(2))}</h2>;
        if (ln.startsWith("### ")) return <h4 key={i} style={{ margin: "10px 0 3px", fontSize: 13, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5 }}>{inline(ln.slice(4))}</h4>;
        if (ln.trim() === "---") return <hr key={i} style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />;
        if (ln.trim() === "") return <div key={i} style={{ height: 7 }} />;
        return <div key={i} style={{ margin: "2px 0" }}>{inline(ln)}</div>;
      })}
    </div>
  );
}

export default function BeauBrainPanel({ patientName, species = "Canine", diagnosis, affectedRegion, treatmentApproach, week = 1, totalWeeks, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voice, setVoice] = useState("clinical");

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    api.post("/beau-brain/protocol", { patientName, species, diagnosis, affectedRegion, treatmentApproach, week, totalWeeks, voice: "both" })
      .then(r => { if (!cancelled) { setData(r.data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError("Beau's Brain is temporarily unavailable."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [patientName, species, diagnosis, affectedRegion, treatmentApproach, week, totalWeeks]);

  const isClinical = voice === "clinical";
  const body = data ? (isClinical ? data.clinical : data.consumer) : "";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,15,30,0.6)", zIndex: 1200, overflow: "auto", padding: "24px 0" }}
      onClick={e => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div style={{ background: "#fff", maxWidth: 820, margin: "0 auto", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "22px 26px" }}>

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#0c4a6e", letterSpacing: 1, textTransform: "uppercase" }}>🧠 Beau's Brain</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>One verified evidence base · two voices</div>
          </div>
          <button onClick={onClose} style={btn("#fff", "#475569", "#cbd5e1")}>Close</button>
        </div>

        {/* voice toggle */}
        <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: 10, padding: 3, marginBottom: 16 }}>
          <button onClick={() => setVoice("clinical")} style={{ ...btn(isClinical ? "#0c4a6e" : "transparent", isClinical ? "#fff" : "#475569"), borderRadius: 8 }}>
            Clinical · K9 Rehab Pro
          </button>
          <button onClick={() => setVoice("consumer")} style={{ ...btn(!isClinical ? "#14b8a6" : "transparent", !isClinical ? "#fff" : "#475569"), borderRadius: 8 }}>
            Consumer · B.E.A.U. at Home
          </button>
        </div>

        {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Analyzing evidence-based protocols…</div>}
        {error && <div style={{ padding: 30, textAlign: "center", color: "#b91c1c" }}>{error}</div>}

        {data && !loading && (
          <>
            {/* grounding banner */}
            <div style={{ fontSize: 11, color: "#64748b", background: isClinical ? "#f0f9ff" : "#f0fdfa", border: `1px solid ${isClinical ? "#bae6fd" : "#99f6e4"}`, borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
              {isClinical
                ? "Peer-to-peer clinical view — full terminology, dosing, evidence citations, and contraindications for veterinary review."
                : "Owner-friendly view — plain English that supports (never replaces) the veterinarian's care plan."}
              {data.plan?.audit && <span> · <b>{data.plan.audit.exercise_count}</b> exercises, all source-traced · deterministic</span>}
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px", background: "#fff", maxHeight: "60vh", overflow: "auto" }}>
              <Markdownish text={body} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
