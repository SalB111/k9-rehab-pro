import React from "react";
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiMove, FiBarChart2, FiThermometer, FiTarget } from "react-icons/fi";
import { TbCat } from "react-icons/tb";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import {
  CONDITIONS, REGIONS, NEURO_DIAGNOSES, GAIT_DESCRIPTORS,
  POSTURE_FINDINGS, FELINE_DIAGNOSES,
} from "./constants";

// ── Reusable Section wrapper (color-coded left border, white background) ──
function Section({ title, subtitle, icon: Icon, color, children, badge }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 12, padding: "20px 24px", marginBottom: 16,
      border: `1px solid ${C.border}`, borderLeft: `4px solid ${color}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: subtitle ? 4 : 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon size={18} style={{ color, flexShrink: 0 }} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</div>
        </div>
        {badge && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${color}15`, color, fontWeight: 600 }}>{badge}</span>}
      </div>
      {subtitle && <div style={{ fontSize: 11, color: C.textLight, marginBottom: 14, paddingLeft: 28 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

// ── Reusable checkbox group (2-column grid) ──
function CheckGroup({ items, selected, onChange, columns = 2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
      {items.map(item => {
        const checked = (selected || []).includes(item);
        return (
          <label key={item} style={{
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.text,
            background: checked ? `${C.teal}12` : C.surface, border: checked ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
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

// ── Color-coded score badge ──
function ScoreBadge({ value, max, thresholds }) {
  const v = +value;
  let color = C.green, label = "";
  for (const t of thresholds) {
    if (v >= t.min && v <= t.max) { color = t.color; label = t.label; break; }
  }
  return (
    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 40, textAlign: "center", padding: "3px 10px", borderRadius: 6, background: `${color}15`, color }}>
      {value}/{max} {label && `— ${label}`}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
// STEP 2: CLINICAL ASSESSMENT (Millis & Levine Standard)
// ══════════════════════════════════════════════════════════════
export default function Step2ClinicalAssessment({ form, setField, goToStep }) {
  const isFeline = form.species === "Feline";
  const isNeuro = NEURO_DIAGNOSES.includes(form.diagnosis);
  const isOA = ["Hip Dysplasia", "Elbow Dysplasia", "Osteoarthritis", "Stifle OA", "Hip OA", "Elbow OA", "FELINE_OA", "FELINE_OA_AXIAL"].includes(form.diagnosis) || (form.diagnosis || "").toLowerCase().includes("arthrit");

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <SectionHead icon={FiActivity} title="Clinical Assessment" />
      </div>

      {/* ═══ 1. PRIMARY DIAGNOSIS & REGION ═══ */}
      <Section title="Primary Diagnosis & Region" subtitle="Select the patient's primary condition and affected anatomical region" icon={FiTarget} color="#0EA5E9">
        {isFeline && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: "#8B5CF615", border: "1px solid #8B5CF630" }}>
            <TbCat size={14} style={{ color: "#8B5CF6" }} />
            <span style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 600 }}>Feline diagnoses shown. To switch to canine, update species in Step 1.</span>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Primary Diagnosis *</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${isFeline ? "#8B5CF6" : C.border}` }}
              value={form.diagnosis} onChange={e => setField("diagnosis", e.target.value)}>
              <option value="">--- Select Diagnosis ---</option>
              {Object.entries(isFeline ? FELINE_DIAGNOSES : CONDITIONS).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Affected Region *</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.affectedRegion} onChange={e => setField("affectedRegion", e.target.value)}>
              <option value="">--- Select Region ---</option>
              <optgroup label="Hind Limb">{REGIONS.filter(r => r.includes("Stifle") || r.includes("Hip") || r.includes("Tarsus")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Forelimb">{REGIONS.filter(r => r.includes("Elbow") || r.includes("Shoulder") || r.includes("Carpus")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Spine">{REGIONS.filter(r => r.includes("Spine")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Other">{REGIONS.filter(r => r === "Multiple Joints" || r === "Generalized").map(r => <option key={r}>{r}</option>)}</optgroup>
            </select>
          </div>
        </div>
      </Section>

      {/* ═══ 2. PAIN, LAMENESS & MOBILITY ═══ */}
      <Section title="Pain, Lameness & Mobility" subtitle="Standardized clinical scoring — informs protocol intensity and phase assignment" icon={FiAlertTriangle} color="#A32D2D">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Pain */}
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Pain Level (0-10 VAS) *</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.painLevel} onChange={e => setField("painLevel", e.target.value)}>
              <option value="">--- Select ---</option>
              {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={String(n)}>{n} — {n === 0 ? "No pain" : n <= 3 ? "Mild" : n <= 6 ? "Moderate" : n <= 8 ? "Severe" : "Extreme"}</option>)}
            </select>
            {form.painLevel !== "" && (
              <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: +form.painLevel <= 3 ? `${C.green}12` : +form.painLevel <= 6 ? `${C.amber}15` : `${C.red}15`,
                color: +form.painLevel <= 3 ? C.green : +form.painLevel <= 6 ? C.amber : C.red,
                border: `1px solid ${+form.painLevel <= 3 ? C.green : +form.painLevel <= 6 ? C.amber : C.red}30`,
              }}>
                {+form.painLevel <= 3 ? "Mild — full exercise progression appropriate" :
                 +form.painLevel <= 6 ? "Moderate — exercise intensity adjusted, monitor closely" :
                 +form.painLevel <= 8 ? "Severe — pain management consult recommended" :
                 "Extreme — protocol restricted to passive/palliative only"}
              </div>
            )}
          </div>
          {/* Lameness */}
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Lameness Grade (0-5) *</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.lamenessGrade} onChange={e => setField("lamenessGrade", e.target.value)}>
              <option value="">--- Select ---</option>
              {[0,1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n} — {n === 0 ? "Sound" : n === 1 ? "Subtle" : n === 2 ? "Mild" : n === 3 ? "Moderate" : n === 4 ? "Severe" : "Non-weight-bearing"}</option>)}
            </select>
            {form.lamenessGrade !== "" && +form.lamenessGrade >= 4 && (
              <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>
                {+form.lamenessGrade === 5 ? "Non-weight-bearing — passive exercises only" : "Severe lameness — restrict to Phase 1 exercises"}
              </div>
            )}
          </div>
          {/* Mobility */}
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Mobility Status *</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.mobilityLevel} onChange={e => setField("mobilityLevel", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="Non-ambulatory">Non-ambulatory (no voluntary movement)</option>
              <option value="Limited">Limited (assisted standing/stepping)</option>
              <option value="Moderate">Moderate (ambulatory with deficits)</option>
              <option value="Good">Good (ambulatory, mild impairment)</option>
              <option value="Full">Full (normal gait, conditioning focus)</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ═══ 3. BODY CONDITION ═══ */}
      <Section title="Body Condition Score" subtitle="WSAVA 9-point scale — affects exercise selection and joint loading" icon={FiBarChart2} color="#BA7517"
        badge={`BCS ${form.bodyConditionScore}/9`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>BCS (1-9 WSAVA Scale)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input style={{ flex: 1, accentColor: C.teal }} type="range" min="1" max="9" value={form.bodyConditionScore}
                onChange={e => setField("bodyConditionScore", e.target.value)} />
              <ScoreBadge value={form.bodyConditionScore} max="9" thresholds={[
                { min: 1, max: 2, color: C.red, label: "Emaciated" },
                { min: 3, max: 3, color: C.amber, label: "Underweight" },
                { min: 4, max: 5, color: C.green, label: "Ideal" },
                { min: 6, max: 7, color: C.amber, label: "Overweight" },
                { min: 8, max: 9, color: C.red, label: "Obese" },
              ]} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ padding: "10px 14px", borderRadius: 8, width: "100%", fontSize: 12, lineHeight: 1.6,
              background: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? `${C.green}08` : `${C.amber}08`,
              border: `1px solid ${(+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? C.green : C.amber}30`,
              color: C.text,
            }}>
              {+form.bodyConditionScore <= 2 ? "Emaciated — nutritional assessment before rehab" :
               +form.bodyConditionScore === 3 ? "Underweight — adjust caloric intake" :
               +form.bodyConditionScore <= 5 ? "Ideal body condition — maintain current nutrition" :
               +form.bodyConditionScore <= 7 ? "Overweight — weight management recommended, aquatic therapy preferred" :
               "Obese — formal weight loss protocol required, avoid impact loading"}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 4. GAIT & POSTURE ASSESSMENT ═══ */}
      <Section title="Gait & Posture Assessment" subtitle="Observational findings — select all that apply" icon={FiMove} color="#8B5CF6"
        badge={`${(form.gaitDescriptors || []).length + (form.postureFindings || []).length} selected`}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ ...S.label, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Gait Pattern Descriptors</label>
          <CheckGroup items={GAIT_DESCRIPTORS} selected={form.gaitDescriptors} onChange={v => setField("gaitDescriptors", v)} columns={3} />
        </div>
        <div>
          <label style={{ ...S.label, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Postural Assessment</label>
          <CheckGroup items={POSTURE_FINDINGS} selected={form.postureFindings} onChange={v => setField("postureFindings", v)} columns={3} />
        </div>
      </Section>

      {/* ═══ 5. OBJECTIVE MEASUREMENTS ═══ */}
      <Section title="Objective Measurements" subtitle="Goniometry, circumference, muscle testing — Millis & Levine standard" icon={FiThermometer} color="#1D9E75">
        {/* Limb Circumference */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...S.label, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Limb Circumference (cm) — bilateral measurement</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={S.label}>Measurement Site</label>
              <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.circumferenceSite} onChange={e => setField("circumferenceSite", e.target.value)}>
                <option value="">--- Select ---</option>
                <option value="15cm proximal to patella">15cm proximal to patella</option>
                <option value="10cm proximal to patella">10cm proximal to patella</option>
                <option value="Mid-thigh">Mid-thigh</option>
                <option value="Mid-antebrachium">Mid-antebrachium</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Affected Limb (cm)</label>
              <input style={{ ...S.input, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} type="number" step="0.1"
                value={form.circumferenceAffected} onChange={e => setField("circumferenceAffected", e.target.value)} placeholder="e.g. 32.5" />
            </div>
            <div>
              <label style={S.label}>Contralateral (cm)</label>
              <input style={{ ...S.input, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} type="number" step="0.1"
                value={form.circumferenceContralateral} onChange={e => setField("circumferenceContralateral", e.target.value)} placeholder="e.g. 36.0" />
            </div>
          </div>
          {form.circumferenceAffected && form.circumferenceContralateral && (() => {
            const diff = Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral));
            const color = diff > 2 ? C.red : diff > 1 ? C.amber : C.green;
            return (
              <div style={{ marginTop: 8, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}12`, color, border: `1px solid ${color}30` }}>
                Difference: {diff.toFixed(1)} cm ({((diff / parseFloat(form.circumferenceContralateral)) * 100).toFixed(1)}% asymmetry)
                {diff > 2 && " — significant muscle atrophy"}
              </div>
            );
          })()}
        </div>

        {/* ROM */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...S.label, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Joint Range of Motion (Goniometry)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={S.label}>Joint</label>
              <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.romJoint} onChange={e => setField("romJoint", e.target.value)}>
                <option value="">--- Select ---</option>
                {["Stifle", "Hip", "Elbow", "Shoulder", "Hock/Tarsus", "Carpus"].map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Flexion (degrees)</label>
              <input style={{ ...S.input, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} type="number" min="0" max="180"
                value={form.romFlexion} onChange={e => setField("romFlexion", e.target.value)} placeholder="e.g. 42" />
            </div>
            <div>
              <label style={S.label}>Extension (degrees)</label>
              <input style={{ ...S.input, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} type="number" min="0" max="180"
                value={form.romExtension} onChange={e => setField("romExtension", e.target.value)} placeholder="e.g. 162" />
            </div>
          </div>
          {form.romJoint && (
            <div style={{ marginTop: 6, fontSize: 10, color: C.textLight, padding: "4px 8px", background: C.bg, borderRadius: 4, display: "inline-block" }}>
              Normal reference ({form.romJoint}): {form.romJoint === "Stifle" ? "Flex 42° / Ext 162°" :
               form.romJoint === "Hip" ? "Flex 50° / Ext 162°" :
               form.romJoint === "Elbow" ? "Flex 36° / Ext 165°" :
               form.romJoint === "Shoulder" ? "Flex 57° / Ext 165°" :
               form.romJoint === "Hock/Tarsus" ? "Flex 39° / Ext 164°" :
               "Flex 32° / Ext 196°"}
            </div>
          )}
        </div>

        {/* MMT + Muscle Condition + Effusion */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>MMT Grade (0-5)</label>
            <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.mmtGrade} onChange={e => setField("mmtGrade", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="0">0 — No contraction (Paralysis)</option>
              <option value="1">1 — Trace contraction only</option>
              <option value="2">2 — Movement, gravity eliminated</option>
              <option value="3">3 — Against gravity, not resistance</option>
              <option value="4">4 — Against moderate resistance</option>
              <option value="5">5 — Normal strength</option>
            </select>
          </div>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Muscle Condition</label>
            <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.muscleCondition} onChange={e => setField("muscleCondition", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="Normal">Normal — symmetric</option>
              <option value="Mild Atrophy">Mild Atrophy</option>
              <option value="Moderate Atrophy">Moderate Atrophy</option>
              <option value="Severe Atrophy">Severe Atrophy</option>
              <option value="Fibrosis">Fibrosis</option>
            </select>
          </div>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Joint Effusion (0-3)</label>
            <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.jointEffusion} onChange={e => setField("jointEffusion", e.target.value)}>
              <option value="0">0 — None</option>
              <option value="1">1 — Mild (palpable)</option>
              <option value="2">2 — Moderate (visible)</option>
              <option value="3">3 — Severe (tense)</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ═══ 6. NEUROLOGICAL ASSESSMENT (conditional) ═══ */}
      {isNeuro && (
        <Section title="Neurological Assessment" subtitle="Required for neurological diagnoses — informs phase restrictions" icon={FiAlertTriangle} color="#A32D2D">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={S.label}>Proprioception</label>
              <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.neuroProprioception} onChange={e => setField("neuroProprioception", e.target.value)}>
                <option value="">---</option>
                <option value="Normal">Normal</option>
                <option value="Delayed">Delayed</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Withdrawal Reflex</label>
              <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.neuroWithdrawal} onChange={e => setField("neuroWithdrawal", e.target.value)}>
                <option value="">---</option>
                <option value="Normal">Normal</option>
                <option value="Reduced">Reduced</option>
                <option value="Absent">Absent</option>
                <option value="Exaggerated">Exaggerated (UMN)</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Deep Pain Sensation</label>
              <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.neuroDeepPain} onChange={e => setField("neuroDeepPain", e.target.value)}>
                <option value="">---</option>
                <option value="Present">Present</option>
                <option value="Diminished">Diminished</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Motor Grade (0-5)</label>
              <select style={{ ...S.select, width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }} value={form.neuroMotorGrade} onChange={e => setField("neuroMotorGrade", e.target.value)}>
                <option value="">---</option>
                {[0,1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n}</option>)}
              </select>
            </div>
          </div>
          {form.neuroDeepPain === "Absent" && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: `${C.red}12`, border: `2px solid ${C.red}40`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <FiAlertTriangle size={16} style={{ color: C.red, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>Absent deep pain — guarded to poor prognosis. Document owner discussion.</span>
            </div>
          )}

          {/* IVDD Grade */}
          {form.diagnosis === "IVDD" && (
            <div style={{ marginTop: 14 }}>
              <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>IVDD Grade (I-V)</label>
              <select style={{ ...S.select, width: "100%", padding: "10px 12px", borderRadius: 8, border: `2px solid ${C.border}` }}
                value={form.ivddGrade} onChange={e => setField("ivddGrade", e.target.value)}>
                <option value="">--- Select ---</option>
                <option value="I">Grade I — Pain only, no neuro deficits</option>
                <option value="II">Grade II — Ambulatory paraparesis, ataxia</option>
                <option value="III">Grade III — Non-ambulatory paraparesis</option>
                <option value="IV">Grade IV — Paraplegia, deep pain intact</option>
                <option value="V">Grade V — Paraplegia, absent deep pain</option>
              </select>
            </div>
          )}
        </Section>
      )}

      {/* ═══ 7. OA STAGING (conditional) ═══ */}
      {isOA && (
        <Section title="OA Staging — Kellgren-Lawrence" subtitle="Radiographic classification — informs exercise intensity" icon={FiBarChart2} color="#BA7517">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>K-L Grade (0-4)</label>
              <select style={{ ...S.select, width: "100%", padding: "10px 12px", borderRadius: 8, border: `2px solid ${C.border}` }}
                value={form.oaStage} onChange={e => setField("oaStage", e.target.value)}>
                <option value="">--- Select ---</option>
                <option value="0">Grade 0 — No OA features</option>
                <option value="1">Grade 1 — Doubtful (minute osteophytes)</option>
                <option value="2">Grade 2 — Minimal (definite osteophytes)</option>
                <option value="3">Grade 3 — Moderate (joint space narrowing)</option>
                <option value="4">Grade 4 — Severe (large osteophytes, deformity)</option>
              </select>
            </div>
            {form.oaStage && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ padding: "10px 14px", borderRadius: 8, width: "100%", fontSize: 12,
                  background: +form.oaStage <= 1 ? `${C.green}08` : +form.oaStage <= 2 ? `${C.amber}08` : `${C.red}08`,
                  border: `1px solid ${+form.oaStage <= 1 ? C.green : +form.oaStage <= 2 ? C.amber : C.red}30`,
                  color: +form.oaStage <= 1 ? C.green : +form.oaStage <= 2 ? C.amber : C.red, fontWeight: 600,
                }}>
                  {+form.oaStage <= 1 ? "Early OA — full exercise progression" :
                   +form.oaStage === 2 ? "Mild-Moderate — low-impact focus" :
                   +form.oaStage === 3 ? "Moderate — aquatic therapy recommended" :
                   "Severe — comfort protocol, avoid impact"}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Navigation */}
      <StepNavButtons
        onBack={() => goToStep(1)}
        backLabel="← Back to Patient Info"
        onNext={() => goToStep(3)}
        nextLabel="Next: Treatment Plan →"
      />
    </>
  );
}
