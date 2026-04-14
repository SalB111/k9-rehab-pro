// src/pages/BeauMetricsView.jsx
// BEAU Metrics — AI Nutrition + Rehabilitation Protocol Generator
// Uses 12 Mars PetCare / Waltham knowledge nodes via beauService

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import C from "../constants/colors";
import { generateBeauProtocol } from "../services/beauService";
import useBeauVoice from "../hooks/useBeauVoice";
import BeauVoiceControl from "../components/BeauVoiceControl";

const SPECIES = ["Canine", "Feline"];
const LIFE_STAGES = ["Puppy/Kitten", "Adult", "Senior"];
const BCS_OPTIONS = ["1","2","3","4","5","6","7","8","9"];
const CONDITIONS = [
  "Osteoarthritis", "TPLO Post-Op", "CCL Rupture", "IVDD",
  "Hip Dysplasia", "Obesity", "Diabetes", "Renal Disease",
  "Dental Disease", "Geriatric Mobility Decline", "Post-Surgical Recovery",
  "Dermatologic (Atopic)", "Cardiac", "GI Sensitivity", "Urinary",
  "Healthy / Wellness", "Other"
];

export default function BeauMetricsView({ authToken, setView }) {
  const { i18n: i18nInst } = useTranslation();
  const beauVoice = useBeauVoice(i18nInst.language || "en");

  // Patient form
  const [form, setForm] = useState({
    name: "", species: "Canine", breed: "", age: "",
    weightKg: "", bcs: "5", lifeStage: "Adult",
    conditions: [], notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const updateForm = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleCondition = (c) => setForm(prev => ({
    ...prev,
    conditions: prev.conditions.includes(c)
      ? prev.conditions.filter(x => x !== c)
      : [...prev.conditions, c],
  }));

  const generate = async () => {
    if (!form.name.trim()) { setError("Patient name is required"); return; }
    if (form.conditions.length === 0) { setError("Select at least one condition"); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await generateBeauProtocol(form, authToken, i18nInst.language || "en");
      if (data.error) { setError(data.error); setResult(null); }
      else {
        setResult(data);
        if (beauVoice.autoSpeak && data.patient_summary) beauVoice.speak(data.patient_summary);
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const S = {
    page: { padding: 24, maxWidth: 1100, margin: "0 auto" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: C.text },
    subtitle: { fontSize: 12, color: C.textMid, marginTop: 2 },
    card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
    cardTitle: { fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
    label: { fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, marginTop: 12 },
    input: { width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.text, background: C.surface },
    select: { width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.text, background: C.surface, cursor: "pointer" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
    chip: (active) => ({
      display: "inline-block", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
      border: `1px solid ${active ? C.teal : C.border}`,
      background: active ? `${C.teal}15` : C.surface,
      color: active ? C.teal : C.textMid,
      transition: "all 0.15s",
    }),
    btn: (disabled) => ({
      width: "100%", padding: "14px", border: "none", borderRadius: 8,
      background: disabled ? C.border : C.teal, color: "#fff",
      fontSize: 15, fontWeight: 700, letterSpacing: "0.5px",
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    }),
    flag: (level) => ({
      padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
      background: level === "high" ? "#fef2f2" : level === "moderate" ? "#fff7ed" : "#f0fdf4",
      border: `1px solid ${level === "high" ? "#fecaca" : level === "moderate" ? "#fed7aa" : "#bbf7d0"}`,
      color: level === "high" ? "#dc2626" : level === "moderate" ? "#ea580c" : "#16a34a",
    }),
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.title}>BEAU Metrics</div>
          <div style={S.subtitle}>AI Nutrition + Rehabilitation Protocol Engine \u2014 Mars PetCare / Waltham Science</div>
        </div>
        <BeauVoiceControl
          isSpeaking={beauVoice.isSpeaking}
          autoSpeak={beauVoice.autoSpeak}
          setAutoSpeak={beauVoice.setAutoSpeak}
          onStop={beauVoice.stop}
          voiceName={beauVoice.voiceName}
        />
      </div>

      {/* Patient Form */}
      <div style={S.card}>
        <div style={S.cardTitle}>{"\ud83d\udc3e"} Patient Information</div>
        <div style={S.grid2}>
          <div>
            <div style={S.label}>Patient Name *</div>
            <input style={S.input} value={form.name} onChange={e => updateForm("name", e.target.value)} placeholder="e.g. Bella" />
          </div>
          <div>
            <div style={S.label}>Species</div>
            <select style={S.select} value={form.species} onChange={e => updateForm("species", e.target.value)}>
              {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={S.grid3}>
          <div>
            <div style={S.label}>Breed</div>
            <input style={S.input} value={form.breed} onChange={e => updateForm("breed", e.target.value)} placeholder="e.g. Labrador Retriever" />
          </div>
          <div>
            <div style={S.label}>Age</div>
            <input style={S.input} value={form.age} onChange={e => updateForm("age", e.target.value)} placeholder="e.g. 6 years" />
          </div>
          <div>
            <div style={S.label}>Weight (kg)</div>
            <input style={S.input} type="number" value={form.weightKg} onChange={e => updateForm("weightKg", e.target.value)} placeholder="e.g. 30" />
          </div>
        </div>
        <div style={S.grid3}>
          <div>
            <div style={S.label}>Body Condition Score (1-9)</div>
            <select style={S.select} value={form.bcs} onChange={e => updateForm("bcs", e.target.value)}>
              {BCS_OPTIONS.map(b => <option key={b} value={b}>{b}/9{b === "5" ? " (Ideal)" : b <= "3" ? " (Underweight)" : b >= "7" ? " (Overweight)" : ""}</option>)}
            </select>
          </div>
          <div>
            <div style={S.label}>Life Stage</div>
            <select style={S.select} value={form.lifeStage} onChange={e => updateForm("lifeStage", e.target.value)}>
              {LIFE_STAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <div style={S.label}>Notes</div>
            <input style={S.input} value={form.notes} onChange={e => updateForm("notes", e.target.value)} placeholder="Additional clinical notes..." />
          </div>
        </div>

        {/* Conditions */}
        <div style={S.label}>Health Conditions *</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {CONDITIONS.map(c => (
            <span key={c} style={S.chip(form.conditions.includes(c))} onClick={() => toggleCondition(c)}>{c}</span>
          ))}
        </div>

        {/* Generate */}
        <div style={{ marginTop: 20 }}>
          {error && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#dc2626", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <button style={S.btn(loading)} onClick={generate} disabled={loading}>
            {loading ? <><div style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Generating BEAU Protocol...</> : "\u26a1 Generate BEAU Protocol"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Patient Summary */}
          <div style={{ ...S.card, borderLeft: `4px solid ${C.teal}` }}>
            <div style={S.cardTitle}>{"\ud83d\udccb"} Patient Summary</div>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0 }}>{result.patient_summary}</p>
          </div>

          {/* Diet Protocol */}
          {result.diet_protocol && (
            <div style={{ ...S.card, borderLeft: "4px solid #16a34a" }}>
              <div style={S.cardTitle}>{"\ud83c\udf56"} Diet Protocol \u2014 {result.diet_protocol.tier}</div>
              <div style={S.grid2}>
                <div>
                  <div style={S.label}>Primary Product</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{result.diet_protocol.primary_product}</div>
                </div>
                <div>
                  <div style={S.label}>Feeding Format</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{result.diet_protocol.feeding_format}</div>
                </div>
              </div>
              {result.diet_protocol.secondary_product && (
                <div style={{ marginTop: 8 }}>
                  <div style={S.label}>Secondary Product</div>
                  <div style={{ fontSize: 13, color: C.text }}>{result.diet_protocol.secondary_product}</div>
                </div>
              )}
              <div style={S.label}>Daily Calories</div>
              <div style={{ fontSize: 13, color: C.text }}>{result.diet_protocol.daily_calories_note}</div>
              <div style={S.label}>Key Nutrients</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.diet_protocol.key_nutrients?.map((n, i) => <span key={i} style={{ padding: "3px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, fontSize: 11, color: "#16a34a", fontWeight: 600 }}>{n}</span>)}
              </div>
              <div style={S.label}>Feeding Schedule</div>
              {result.diet_protocol.feeding_schedule?.map((m, i) => <div key={i} style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>{m}</div>)}
              <div style={S.label}>Hydration</div>
              <div style={{ fontSize: 13, color: C.text }}>{result.diet_protocol.hydration_note}</div>
              {result.diet_protocol.supplements?.length > 0 && result.diet_protocol.supplements[0] !== "none" && (
                <><div style={S.label}>Supplements</div>
                <div style={{ fontSize: 13, color: C.text }}>{result.diet_protocol.supplements.join(", ")}</div></>
              )}
              {result.diet_protocol.vet_consult_required && (
                <div style={{ marginTop: 12, padding: "8px 12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, fontSize: 11, color: "#ea580c", fontWeight: 600 }}>{"\u26a0\ufe0f"} Veterinary consultation required for this diet protocol</div>
              )}
              <div style={S.label}>Evidence Basis</div>
              <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic", lineHeight: 1.6 }}>{result.diet_protocol.reasoning}</div>
            </div>
          )}

          {/* Rehab Protocol */}
          {result.rehab_protocol && (
            <div style={{ ...S.card, borderLeft: "4px solid #0ea5e9" }}>
              <div style={S.cardTitle}>{"\ud83c\udfcb\ufe0f"} Rehab Protocol \u2014 {result.rehab_protocol.phase}</div>
              <div style={S.grid3}>
                <div><div style={S.label}>Frequency</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{result.rehab_protocol.frequency}</div></div>
                <div><div style={S.label}>Session Duration</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{result.rehab_protocol.session_duration}</div></div>
                <div><div style={S.label}>Reassessment</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{result.rehab_protocol.reassessment_interval}</div></div>
              </div>
              <div style={S.label}>Exercises</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.rehab_protocol.exercises?.map((ex, i) => (
                  <div key={i} style={{ padding: "10px 14px", background: C.bg, borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>
                      {ex.sets} sets \u00d7 {ex.reps_or_duration} \u2014 Goal: {ex.goal}
                    </div>
                    {ex.progression_note && <div style={{ fontSize: 11, color: C.teal, marginTop: 2 }}>Progression: {ex.progression_note}</div>}
                  </div>
                ))}
              </div>
              {result.rehab_protocol.cognitive_enrichment?.length > 0 && (
                <><div style={S.label}>Cognitive Enrichment</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {result.rehab_protocol.cognitive_enrichment.map((a, i) => <span key={i} style={{ padding: "3px 10px", background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 20, fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>{a}</span>)}
                </div></>
              )}
              {result.rehab_protocol.contraindications?.length > 0 && (
                <><div style={S.label}>Contraindications</div>
                <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#dc2626" }}>
                  {result.rehab_protocol.contraindications.join(" \u2022 ")}
                </div></>
              )}
            </div>
          )}

          {/* Active Flags */}
          {result.active_flags && (
            <div style={S.card}>
              <div style={S.cardTitle}>{"\u26a0\ufe0f"} Active Clinical Flags</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {Object.entries(result.active_flags).map(([key, val]) => {
                  const level = typeof val === "string" && (val.toLowerCase().includes("high") || val.toLowerCase().includes("deficient")) ? "high"
                    : typeof val === "string" && val.toLowerCase().includes("moderate") ? "moderate" : "low";
                  return (
                    <div key={key} style={S.flag(level)}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{key.replace(/_/g, " ")}</div>
                      <div style={{ fontSize: 12 }}>{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinical Alerts */}
          {result.clinical_alerts?.length > 0 && (
            <div style={{ ...S.card, background: "#fef2f2", borderLeft: "4px solid #dc2626" }}>
              <div style={{ ...S.cardTitle, color: "#dc2626" }}>{"\ud83d\udea8"} Clinical Alerts</div>
              {result.clinical_alerts.map((a, i) => <div key={i} style={{ fontSize: 13, color: "#111", marginBottom: 6 }}>\u2022 {a}</div>)}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11, color: C.textMid, textAlign: "center", marginTop: 8 }}>
            {result.disclaimer || "Always consult your veterinarian before implementing any dietary or rehabilitation changes."}
            <br /><span style={{ fontSize: 10, color: C.textLight }}>CDSS \u2014 Clinical Decision-Support System. Does not diagnose, prescribe, or replace licensed veterinary judgment.</span>
          </div>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
