import React from "react";
import { FiAward } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";

export default function Step4RehabGoals({ form, setField, goToStep }) {
  return (
    <>
      {/* -- Section Header + Problem List -- */}
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 10, color: "#fff" }}>
        <SectionHead icon={FiAward} title="Rehabilitation Goals & Prognosis" />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, marginTop: 14 }}>
          Problem List
        </div>
        <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
          Identify all functional deficits and impairments (select all that apply)
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Decreased ROM", "Muscle atrophy", "Pain / nociception", "Abnormal gait pattern",
            "Edema / swelling", "Joint stiffness", "Muscle weakness", "Reduced weight bearing",
            "Proprioceptive deficit", "Neurological deficit", "Post-surgical inflammation",
            "Decreased endurance", "Balance / coordination deficit", "Soft tissue restriction",
            "Compensatory movement pattern", "Decreased functional mobility"].map(item => (
            <label key={item} style={{
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
              background: (form.problems || []).includes(item) ? "rgba(14,165,233,0.15)" : C.bg,
              border: (form.problems || []).includes(item) ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
              transition: "all 0.2s",
            }}>
              <input type="checkbox" checked={(form.problems || []).includes(item)}
                onChange={e => {
                  const arr = [...(form.problems || [])];
                  if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                  setField("problems", arr);
                }}
                style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* -- Short-Term Goals -- */}
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 10, color: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
          Short-Term Goals (STG) — 2-4 Weeks
        </div>
        <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
          Measurable objectives for the first rehabilitation phase (select all that apply)
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Reduce pain to \u22643/10", "Progress weight bearing", "Increase ROM 15\u00B0+",
            "Reduce swelling/edema", "Begin controlled leash walks", "Improve proprioception",
            "Initiate muscle activation", "Protect surgical repair", "Establish HEP routine",
            "Restore basic mobility", "Normalize gait at walk", "Owner education complete"].map(item => (
            <label key={item} style={{
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
              background: (form.stGoals || []).includes(item) ? "rgba(14,165,233,0.15)" : C.bg,
              border: (form.stGoals || []).includes(item) ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
              transition: "all 0.2s",
            }}>
              <input type="checkbox" checked={(form.stGoals || []).includes(item)}
                onChange={e => {
                  const arr = [...(form.stGoals || [])];
                  if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                  setField("stGoals", arr);
                }}
                style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* -- Long-Term Goals -- */}
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 10, color: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
          Long-Term Goals (LTG) — 8-16 Weeks
        </div>
        <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
          Functional outcomes expected at discharge (select all that apply)
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Full weight bearing", "Normal gait pattern", "ROM within 10\u00B0 of contralateral",
            "Muscle symmetry \u22641cm difference", "Return to off-leash activity",
            "Return to sport/work function", "Independent stair navigation",
            "Pain-free with activity", "Owner independent with HEP",
            "Maintain/improve body condition", "Sustained comfort & QoL"].map(item => (
            <label key={item} style={{
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
              background: (form.ltGoals || []).includes(item) ? "rgba(14,165,233,0.15)" : C.bg,
              border: (form.ltGoals || []).includes(item) ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
              transition: "all 0.2s",
            }}>
              <input type="checkbox" checked={(form.ltGoals || []).includes(item)}
                onChange={e => {
                  const arr = [...(form.ltGoals || [])];
                  if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                  setField("ltGoals", arr);
                }}
                style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* -- Outcome Measures & Prognosis -- side by side -- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Functional Outcome Measures
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
            Validated instruments for tracking progress (select all that apply)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["CBPI (Canine Brief Pain Inventory)", "HCPI (Helsinki Chronic Pain Index)",
              "LOAD (Liverpool OA in Dogs)", "CSU Acute Pain Scale",
              "Goniometry (ROM)", "Thigh circumference", "Video gait analysis",
              "Force plate analysis", "Stance analyzer", "Timed functional tests",
              "Owner questionnaire (QoL)"].map(item => (
              <label key={item} style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
                background: (form.outcomeMeasures || []).includes(item) ? "rgba(14,165,233,0.15)" : C.bg,
                border: (form.outcomeMeasures || []).includes(item) ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
                transition: "all 0.2s",
              }}>
                <input type="checkbox" checked={(form.outcomeMeasures || []).includes(item)}
                  onChange={e => {
                    const arr = [...(form.outcomeMeasures || [])];
                    if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                    setField("outcomeMeasures", arr);
                  }}
                  style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
                {item}
              </label>
            ))}
          </div>
        </div>
        <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Prognosis
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
            Expected recovery outcome based on clinical findings
          </div>
          <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}`, marginBottom: 12 }}
            value={form.prognosisRating} onChange={e => setField("prognosisRating", e.target.value)}>
            <option value="">--- Select ---</option>
            <option value="Excellent">Excellent — Full return to prior function expected</option>
            <option value="Good">Good — Significant improvement expected, minor residual deficits</option>
            <option value="Fair">Fair — Moderate improvement expected, functional limitations likely</option>
            <option value="Guarded">Guarded — Uncertain outcome, dependent on response to therapy</option>
            <option value="Poor">Poor — Limited improvement expected, focus on comfort/QoL</option>
          </select>
          <label style={S.label}>Estimated Timeline to Discharge</label>
          <input style={{ ...S.input, border: `1.5px solid ${C.border}` }}
            value={form.estimatedTimeline} onChange={e => setField("estimatedTimeline", e.target.value)}
            placeholder="e.g. 12-16 weeks with good compliance" />
        </div>
      </div>

      {/* -- Discharge Criteria & Precautions -- side by side -- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Discharge Criteria
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
            Objective benchmarks for protocol completion (select all that apply)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Pain-free at rest and activity", "Full ROM or within 10\u00B0 contralateral",
              "Symmetrical muscle mass", "Normal gait at walk & trot",
              "Independent stair use", "Owner competent with HEP",
              "Functional activity tolerance", "Stable on all validated measures",
              "No exercise-induced lameness", "Vet clearance obtained"].map(item => (
              <label key={item} style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
                background: (form.dischargeCriteria || []).includes(item) ? "rgba(14,165,233,0.15)" : C.bg,
                border: (form.dischargeCriteria || []).includes(item) ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
                transition: "all 0.2s",
              }}>
                <input type="checkbox" checked={(form.dischargeCriteria || []).includes(item)}
                  onChange={e => {
                    const arr = [...(form.dischargeCriteria || [])];
                    if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                    setField("dischargeCriteria", arr);
                  }}
                  style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
                {item}
              </label>
            ))}
          </div>
        </div>
        <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Precautions & Contraindications
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
            Activity restrictions and safety considerations (select all that apply)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["No off-leash activity", "No jumping", "No stairs unsupervised",
              "No rough play / wrestling", "Leash walks only", "Monitor incision",
              "Stop if acute pain increase", "No slippery surfaces",
              "No swimming until cleared", "Weight restriction in effect",
              "Muzzle for manual therapy", "Sedation may be required"].map(item => (
              <label key={item} style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
                background: (form.precautions || []).includes(item) ? "rgba(14,165,233,0.15)" : C.bg,
                border: (form.precautions || []).includes(item) ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
                transition: "all 0.2s",
              }}>
                <input type="checkbox" checked={(form.precautions || []).includes(item)}
                  onChange={e => {
                    const arr = [...(form.precautions || [])];
                    if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                    setField("precautions", arr);
                  }}
                  style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
                {item}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Step 4 navigation */}
      <StepNavButtons
        onBack={() => goToStep(3)}
        backLabel={"← Back to Treatment Plan"}
        onNext={() => goToStep(5)}
        nextLabel="Next: Protocol Parameters"
      />
    </>
  );
}
