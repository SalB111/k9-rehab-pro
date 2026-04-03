import React from "react";
import { FiAward, FiTarget, FiFlag, FiActivity, FiAlertTriangle, FiCheckCircle, FiClipboard } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";

// Reusable checkbox group with column layout
function CheckGroup({ items, selected, onChange, columns = 2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
      {items.map(item => {
        const checked = (selected || []).includes(item);
        return (
          <label key={item} style={{
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.text,
            background: checked ? `${C.teal}12` : C.surface,
            border: checked ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
            transition: "all 0.15s",
          }}>
            <input type="checkbox" checked={checked}
              onChange={e => {
                const arr = [...(selected || [])];
                if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                onChange(arr);
              }}
              style={{ accentColor: C.teal, width: 15, height: 15, cursor: "pointer", flexShrink: 0 }} />
            {item}
          </label>
        );
      })}
    </div>
  );
}

// Section wrapper with colored left border
function Section({ title, subtitle, icon: Icon, color, children }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 12, padding: "20px 24px", marginBottom: 16,
      border: `1px solid ${C.border}`, borderLeft: `4px solid ${color}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Icon size={18} style={{ color, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: 0.3 }}>{title}</div>
      </div>
      {subtitle && <div style={{ fontSize: 11, color: C.textLight, marginBottom: 14, paddingLeft: 28 }}>{subtitle}</div>}
      <div style={{ paddingLeft: 0 }}>{children}</div>
    </div>
  );
}

export default function Step4RehabGoals({ form, setField, goToStep }) {
  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <SectionHead icon={FiAward} title="Rehabilitation Goals & Prognosis" />
      </div>

      {/* Problem List */}
      <Section title="Problem List" subtitle="Identify all functional deficits and impairments" icon={FiClipboard} color="#A32D2D">
        <CheckGroup columns={2}
          items={["Decreased ROM", "Muscle atrophy", "Pain", "Abnormal gait pattern",
            "Edema / swelling", "Joint stiffness", "Muscle weakness", "Reduced weight bearing",
            "Proprioceptive deficit", "Neurological deficit", "Post-surgical inflammation",
            "Decreased endurance", "Balance / coordination deficit", "Soft tissue restriction",
            "Compensatory movement pattern", "Decreased functional mobility"]}
          selected={form.problems}
          onChange={v => setField("problems", v)}
        />
      </Section>

      {/* Short-Term Goals */}
      <Section title="Short-Term Goals (STG) — 2-4 Weeks" subtitle="Measurable objectives for the first rehabilitation phase" icon={FiTarget} color="#0EA5E9">
        <CheckGroup columns={2}
          items={["Reduce pain to \u22643/10", "Progress weight bearing", "Increase ROM 15\u00B0+",
            "Reduce swelling/edema", "Begin controlled leash walks", "Improve proprioception",
            "Initiate muscle activation", "Protect surgical repair", "Establish HEP routine",
            "Restore basic mobility", "Normalize gait at walk", "Owner education complete"]}
          selected={form.stGoals}
          onChange={v => setField("stGoals", v)}
        />
      </Section>

      {/* Long-Term Goals */}
      <Section title="Long-Term Goals (LTG) — 8-16 Weeks" subtitle="Functional outcomes expected at discharge" icon={FiFlag} color="#1D9E75">
        <CheckGroup columns={2}
          items={["Full weight bearing", "Normal gait pattern", "ROM within 10\u00B0 of contralateral",
            "Muscle symmetry \u22641cm difference", "Return to off-leash activity",
            "Return to sport/work function", "Independent stair navigation",
            "Pain-free with activity", "Owner independent with HEP",
            "Maintain/improve body condition", "Sustained comfort & QoL"]}
          selected={form.ltGoals}
          onChange={v => setField("ltGoals", v)}
        />
      </Section>

      {/* Outcome Measures & Prognosis — side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Section title="Functional Outcome Measures" subtitle="Validated instruments for tracking progress" icon={FiActivity} color="#8B5CF6">
          <CheckGroup columns={1}
            items={["CBPI (Canine Brief Pain Inventory)", "HCPI (Helsinki Chronic Pain Index)",
              "LOAD (Liverpool OA in Dogs)", "CSU Acute Pain Scale",
              "Goniometry (ROM)", "Thigh circumference", "Video gait analysis",
              "Force plate analysis", "Stance analyzer", "Timed functional tests",
              "Owner questionnaire (QoL)"]}
            selected={form.outcomeMeasures}
            onChange={v => setField("outcomeMeasures", v)}
          />
        </Section>

        <Section title="Prognosis" subtitle="Expected recovery outcome based on clinical findings" icon={FiAward} color="#BA7517">
          <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `1.5px solid ${C.border}`, marginBottom: 16 }}
            value={form.prognosisRating} onChange={e => setField("prognosisRating", e.target.value)}>
            <option value="">--- Select Prognosis ---</option>
            <option value="Excellent">Excellent — Full return to prior function</option>
            <option value="Good">Good — Significant improvement, minor deficits</option>
            <option value="Fair">Fair — Moderate improvement, limitations likely</option>
            <option value="Guarded">Guarded — Uncertain, depends on therapy response</option>
            <option value="Poor">Poor — Limited improvement, comfort/QoL focus</option>
          </select>
          <label style={{ ...S.label, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Estimated Timeline to Discharge</label>
          <input style={{ ...S.input, padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `1.5px solid ${C.border}` }}
            value={form.estimatedTimeline} onChange={e => setField("estimatedTimeline", e.target.value)}
            placeholder="e.g. 12-16 weeks with good compliance" />
        </Section>
      </div>

      {/* Discharge Criteria & Precautions — side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Section title="Discharge Criteria" subtitle="Objective benchmarks for protocol completion" icon={FiCheckCircle} color="#1D9E75">
          <CheckGroup columns={1}
            items={["Pain-free at rest and activity", "Full ROM or within 10\u00B0 contralateral",
              "Symmetrical muscle mass", "Normal gait at walk & trot",
              "Independent stair use", "Owner competent with HEP",
              "Functional activity tolerance", "Stable on all validated measures",
              "No exercise-induced lameness", "Vet clearance obtained"]}
            selected={form.dischargeCriteria}
            onChange={v => setField("dischargeCriteria", v)}
          />
        </Section>

        <Section title="Precautions & Contraindications" subtitle="Activity restrictions and safety considerations" icon={FiAlertTriangle} color="#A32D2D">
          <CheckGroup columns={1}
            items={["No off-leash activity", "No jumping", "No stairs unsupervised",
              "No rough play / wrestling", "Leash walks only", "Monitor incision",
              "Stop if acute pain increase", "No slippery surfaces",
              "No swimming until cleared", "Weight restriction in effect",
              "Muzzle for manual therapy", "Sedation may be required"]}
            selected={form.precautions}
            onChange={v => setField("precautions", v)}
          />
        </Section>
      </div>

      <StepNavButtons
        onBack={() => goToStep(3)}
        backLabel={"← Back to Treatment Plan"}
        onNext={() => goToStep(5)}
        nextLabel="Next: Protocol Parameters"
      />
    </>
  );
}
