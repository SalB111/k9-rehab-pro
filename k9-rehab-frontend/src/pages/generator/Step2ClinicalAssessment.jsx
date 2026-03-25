import React from "react";
import { FiActivity, FiClipboard, FiAlertTriangle, FiCheckCircle, FiMove, FiBarChart2, FiThermometer } from "react-icons/fi";
import { TbCat } from "react-icons/tb";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import CollapsibleSection from "../../components/CollapsibleSection";
import {
  CONDITIONS, REGIONS, NEURO_DIAGNOSES, GAIT_DESCRIPTORS,
  POSTURE_FINDINGS, DIAGNOSTIC_SECTIONS, FELINE_DIAGNOSES,
} from "./constants";

export default function Step2ClinicalAssessment({ form, setField, goToStep }) {
  return (
    <>
      {/* ═══════════ SECTION 2: CLINICAL ASSESSMENT ═══════════ */}
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" }}>
        <SectionHead icon={FiActivity} title="Clinical Assessment" />
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>Primary Diagnosis *</label>
            {form.species === "Feline" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "4px 10px", borderRadius: 6, background: "#7c3aed22", border: "1px solid #7c3aed" }}>
                <TbCat size={13} style={{ color: "#a78bfa" }} />
                <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>Feline diagnoses shown. To switch to canine, update the species selection in Step 1.</span>
              </div>
            )}
            <select style={{ ...S.select, width: "100%", fontWeight: 600, border: `1.5px solid ${form.species === "Feline" ? "#7c3aed" : C.border}` }} value={form.diagnosis} onChange={e => setField("diagnosis", e.target.value)}>
              <option value="">--- Select ---</option>
              {form.species === "Feline"
                ? Object.entries(FELINE_DIAGNOSES).map(([group, items]) => (
                    <optgroup key={group} label={group}>
                      {items.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </optgroup>
                  ))
                : Object.entries(CONDITIONS).map(([group, items]) => (
                    <optgroup key={group} label={group}>
                      {items.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </optgroup>
                  ))
              }
            </select>
          </div>
          <div>
            <label style={S.label}>Affected Region <span style={{color:C.red}}>*</span></label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.affectedRegion} onChange={e => setField("affectedRegion", e.target.value)}>
              <option value="">--- Select ---</option>
              <optgroup label="Hind Limb">{REGIONS.filter(r => r.includes("Stifle") || r.includes("Hip") || r.includes("Tarsus")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Forelimb">{REGIONS.filter(r => r.includes("Elbow") || r.includes("Shoulder") || r.includes("Carpus")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Spine">{REGIONS.filter(r => r.includes("Spine")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Other">{REGIONS.filter(r => r === "Multiple Joints" || r === "Generalized").map(r => <option key={r}>{r}</option>)}</optgroup>
            </select>
          </div>
        </div>

        {/* Scoring row — visual scales */}
        <div style={{ ...S.grid(3), marginTop: 16 }}>
          <div>
            <label style={S.label}>Pain Level (0-10 VAS) <span style={{color:C.red}}>*</span></label>
            {form.painLevel === "" ? (
              <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}`, color: C.textLight }} value="" onChange={e => setField("painLevel", e.target.value)}>
                <option value="" disabled>--- Select ---</option>
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={String(n)}>{n} — {n === 0 ? "No pain" : n <= 3 ? "Mild" : n <= 6 ? "Moderate" : n <= 8 ? "Severe" : "Extreme"}</option>)}
              </select>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input style={{ ...S.input, flex: 1, border: `1.5px solid ${C.border}` }} type="range" min="0" max="10" value={form.painLevel}
                  onChange={e => setField("painLevel", e.target.value)} />
                <span style={{
                  fontSize: 14, fontWeight: 700, minWidth: 38, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                  background: +form.painLevel <= 3 ? C.greenBg : +form.painLevel <= 6 ? C.amberBg : C.redBg,
                  color: +form.painLevel <= 3 ? C.green : +form.painLevel <= 6 ? C.amber : C.red,
                }}>
                  {form.painLevel}/10
                </span>
              </div>
            )}
          </div>
          <div>
            <label style={S.label}>Lameness Grade (0-5) <span style={{color:C.red}}>*</span></label>
            {form.lamenessGrade === "" ? (
              <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}`, color: C.textLight }} value="" onChange={e => setField("lamenessGrade", e.target.value)}>
                <option value="" disabled>--- Select ---</option>
                {[0,1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n} — {n === 0 ? "Sound" : n === 1 ? "Subtle" : n === 2 ? "Mild" : n === 3 ? "Moderate" : n === 4 ? "Severe" : "Non-weight-bearing"}</option>)}
              </select>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input style={{ ...S.input, flex: 1, border: `1.5px solid ${C.border}` }} type="range" min="0" max="5" value={form.lamenessGrade}
                  onChange={e => setField("lamenessGrade", e.target.value)} />
                <span style={{
                  fontSize: 14, fontWeight: 700, minWidth: 32, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                  background: +form.lamenessGrade <= 1 ? C.greenBg : +form.lamenessGrade <= 3 ? C.amberBg : C.redBg,
                  color: +form.lamenessGrade <= 1 ? C.green : +form.lamenessGrade <= 3 ? C.amber : C.red,
                }}>
                  {form.lamenessGrade}/5
                </span>
              </div>
            )}
          </div>
          <div>
            <label style={S.label}>Mobility Status <span style={{color:C.red}}>*</span></label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.mobilityLevel} onChange={e => setField("mobilityLevel", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="Non-ambulatory">Non-ambulatory (0 — no voluntary movement)</option>
              <option value="Limited">Limited (1 — assisted standing/stepping)</option>
              <option value="Moderate">Moderate (2 — ambulatory with deficits)</option>
              <option value="Good">Good (3 — ambulatory, mild impairment)</option>
              <option value="Full">Full (4 — normal gait, conditioning focus)</option>
            </select>
          </div>
        </div>

        {/* ── Gait & Posture Assessment (Collapsible) ── */}
        <CollapsibleSection
          title="Gait & Posture Assessment"
          icon={FiMove}
          badge={`${(form.gaitDescriptors || []).length + (form.postureFindings || []).length} selected`}
          badgeColor={(form.gaitDescriptors || []).length + (form.postureFindings || []).length > 0 ? C.green : C.textLight}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Gait Pattern Descriptors (select all that apply)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {GAIT_DESCRIPTORS.map(desc => (
                <label key={desc} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
                  background: (form.gaitDescriptors || []).includes(desc) ? "rgba(14,165,233,0.15)" : C.bg,
                  border: (form.gaitDescriptors || []).includes(desc) ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
                  transition: "all 0.2s",
                }}>
                  <input type="checkbox" checked={(form.gaitDescriptors || []).includes(desc)}
                    onChange={e => {
                      const arr = [...(form.gaitDescriptors || [])];
                      if (e.target.checked) arr.push(desc); else arr.splice(arr.indexOf(desc), 1);
                      setField("gaitDescriptors", arr);
                    }}
                    style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
                  {desc}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={S.label}>Postural Assessment (select all that apply)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {POSTURE_FINDINGS.map(desc => (
                <label key={desc} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
                  background: (form.postureFindings || []).includes(desc) ? "rgba(14,165,233,0.15)" : C.bg,
                  border: (form.postureFindings || []).includes(desc) ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
                  transition: "all 0.2s",
                }}>
                  <input type="checkbox" checked={(form.postureFindings || []).includes(desc)}
                    onChange={e => {
                      const arr = [...(form.postureFindings || [])];
                      if (e.target.checked) arr.push(desc); else arr.splice(arr.indexOf(desc), 1);
                      setField("postureFindings", arr);
                    }}
                    style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
                  {desc}
                </label>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Body Condition & Measurements"
          icon={FiBarChart2}
          badge={`BCS ${form.bodyConditionScore}/9`}
          badgeColor={(+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? C.green : C.amber}
        >
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>Body Condition Score (1-9 WSAVA Scale)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input style={{ ...S.input, flex: 1, border: `1.5px solid ${C.border}` }} type="range" min="1" max="9" value={form.bodyConditionScore}
                onChange={e => setField("bodyConditionScore", e.target.value)} />
              <span style={{
                fontSize: 14, fontWeight: 700, minWidth: 40, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                background: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? "rgba(16,185,129,0.15)" : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)",
                color: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? C.green : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? C.amber : C.red,
              }}>{form.bodyConditionScore}/9</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              padding: "10px 14px", borderRadius: 8, width: "100%",
              background: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? "rgba(16,185,129,0.12)" : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
              border: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? "1px solid rgba(16,185,129,0.3)" : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? C.green : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? C.amber : C.red }}>
                {+form.bodyConditionScore <= 2 ? "Emaciated — Rule out chronic disease, caloric supplementation required" :
                 +form.bodyConditionScore === 3 ? "Underweight — Nutritional assessment recommended, adjust caloric intake" :
                 +form.bodyConditionScore <= 5 ? "Ideal Body Condition — Maintain current nutrition plan" :
                 +form.bodyConditionScore <= 7 ? "Overweight — Weight management recommended, joint protection priority" :
                 "Obese — Formal weight loss protocol required, avoid impact loading"}
              </div>
              <div style={{ fontSize: 9, color: C.text, marginTop: 4 }}>
                {+form.bodyConditionScore <= 3 ? "Consider metabolic workup if weight loss is unexplained" :
                 +form.bodyConditionScore <= 5 ? "Optimal for rehabilitation progression" :
                 +form.bodyConditionScore <= 7 ? "Excess weight increases joint stress — aquatic therapy preferred" :
                 "Obesity significantly impairs recovery — concurrent weight management essential"}
              </div>
            </div>
          </div>
        </div>

        </CollapsibleSection>

        {/* ── Objective Measurements (Collapsible) ── */}
        <CollapsibleSection
          title="Objective Measurements"
          icon={FiThermometer}
          badge={(() => {
            let filled = 0;
            if (form.circumferenceAffected) filled++;
            if (form.circumferenceContralateral) filled++;
            if (form.romJoint) filled++;
            if (form.romFlexion) filled++;
            if (form.romExtension) filled++;
            if (form.muscleCondition && form.muscleCondition !== "Normal") filled++;
            if (+form.jointEffusion > 0) filled++;
            if (form.mmtGrade) filled++;
            return filled > 0 ? `${filled} recorded` : "optional";
          })()}
          badgeColor={(() => {
            let filled = 0;
            if (form.circumferenceAffected) filled++;
            if (form.mmtGrade) filled++;
            return filled > 0 ? C.green : C.textLight;
          })()}
        >
        <div>
          {/* Limb Circumference */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.text, marginBottom: 8 }}>Limb Circumference (cm) — Measure bilaterally at consistent landmark</div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Measurement Site</label>
                <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.circumferenceSite} onChange={e => setField("circumferenceSite", e.target.value)}>
                  <option value="">--- Select ---</option>
                  <option value="15cm proximal to patella">15cm proximal to patella (standard)</option>
                  <option value="10cm proximal to patella">10cm proximal to patella</option>
                  <option value="Mid-thigh">Mid-thigh</option>
                  <option value="Mid-antebrachium">Mid-antebrachium (forearm)</option>
                  <option value="Mid-crus">Mid-crus (below stifle)</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Affected Limb (cm)</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="number" step="0.1" min="0" value={form.circumferenceAffected}
                  onChange={e => setField("circumferenceAffected", e.target.value)} placeholder="e.g. 32.5" />
              </div>
              <div>
                <label style={S.label}>Contralateral Limb (cm)</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="number" step="0.1" min="0" value={form.circumferenceContralateral}
                  onChange={e => setField("circumferenceContralateral", e.target.value)} placeholder="e.g. 36.0" />
              </div>
            </div>
            {form.circumferenceAffected && form.circumferenceContralateral && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 6,
                background: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? "rgba(220,38,38,0.15)" : "rgba(16,185,129,0.15)",
                color: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? C.red : C.green,
                border: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? "1px solid rgba(220,38,38,0.3)" : "1px solid rgba(16,185,129,0.3)",
              }}>
                Difference: {Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)).toFixed(1)} cm
                ({((Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) / parseFloat(form.circumferenceContralateral)) * 100).toFixed(1)}% asymmetry)
                {Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 && " — Significant muscle atrophy detected"}
              </div>
            )}
          </div>
          {/* Joint Range of Motion */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.text, marginBottom: 8 }}>Joint Range of Motion (Goniometry — degrees)</div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Joint Measured</label>
                <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.romJoint} onChange={e => setField("romJoint", e.target.value)}>
                  <option value="">--- Select ---</option>
                  <option value="Stifle">Stifle (Knee)</option>
                  <option value="Hip">Hip</option>
                  <option value="Elbow">Elbow</option>
                  <option value="Shoulder">Shoulder</option>
                  <option value="Hock/Tarsus">Hock / Tarsus</option>
                  <option value="Carpus">Carpus (Wrist)</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Flexion (degrees)</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="number" min="0" max="180" value={form.romFlexion}
                  onChange={e => setField("romFlexion", e.target.value)} placeholder="e.g. 42" />
              </div>
              <div>
                <label style={S.label}>Extension (degrees)</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="number" min="0" max="180" value={form.romExtension}
                  onChange={e => setField("romExtension", e.target.value)} placeholder="e.g. 162" />
              </div>
            </div>

            {/* Contralateral ROM + asymmetry delta */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                Contralateral Limb ROM — for asymmetry calculation (Millis &amp; Levine standard)
              </div>
              <div style={S.grid(3)}>
                <div>
                  <label style={S.label}>Normal Reference (auto)</label>
                  <div style={{ ...S.input, border: `1.5px solid ${C.border}`, background: C.bg, color: C.textLight, fontSize: 11, padding: "6px 10px" }}>
                    {form.romJoint === "Stifle" ? "Flex 42° / Ext 162°" :
                     form.romJoint === "Hip"    ? "Flex 50° / Ext 162°" :
                     form.romJoint === "Elbow"  ? "Flex 36° / Ext 165°" :
                     form.romJoint === "Shoulder" ? "Flex 57° / Ext 165°" :
                     form.romJoint === "Hock/Tarsus" ? "Flex 39° / Ext 164°" :
                     form.romJoint === "Carpus" ? "Flex 32° / Ext 196°" :
                     "Select joint →"}
                  </div>
                </div>
                <div>
                  <label style={S.label}>Contralateral Flexion (°)</label>
                  <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="number" min="0" max="180"
                    value={form.romFlexionContralateral}
                    onChange={e => setField("romFlexionContralateral", e.target.value)}
                    placeholder="e.g. 60" />
                </div>
                <div>
                  <label style={S.label}>Contralateral Extension (°)</label>
                  <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="number" min="0" max="180"
                    value={form.romExtensionContralateral}
                    onChange={e => setField("romExtensionContralateral", e.target.value)}
                    placeholder="e.g. 165" />
                </div>
              </div>

              {/* Live asymmetry calculation */}
              {form.romFlexion && form.romFlexionContralateral && (
                (() => {
                  const flexDiff  = Math.abs(parseFloat(form.romFlexionContralateral)  - parseFloat(form.romFlexion));
                  const extDiff   = form.romExtension && form.romExtensionContralateral
                    ? Math.abs(parseFloat(form.romExtensionContralateral) - parseFloat(form.romExtension))
                    : null;
                  const flexSev   = flexDiff > 20 ? "severe" : flexDiff > 10 ? "moderate" : "minimal";
                  const extSev    = extDiff != null ? (extDiff > 20 ? "severe" : extDiff > 10 ? "moderate" : "minimal") : null;
                  const color     = flexSev === "severe" || extSev === "severe" ? C.red
                                  : flexSev === "moderate" || extSev === "moderate" ? C.amber : C.green;
                  const bg        = flexSev === "severe" || extSev === "severe" ? "rgba(220,38,38,0.12)"
                                  : flexSev === "moderate" || extSev === "moderate" ? "rgba(217,119,6,0.12)" : "rgba(16,185,129,0.12)";
                  const border    = flexSev === "severe" || extSev === "severe" ? "1px solid rgba(220,38,38,0.3)"
                                  : flexSev === "moderate" || extSev === "moderate" ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(16,185,129,0.3)";
                  return (
                    <div style={{ marginTop: 8, padding: "8px 14px", borderRadius: 6, background: bg, border, fontSize: 11, fontWeight: 600, color }}>
                      <span>Flexion deficit: {flexDiff.toFixed(1)}° ({flexSev})</span>
                      {extDiff != null && <span style={{ marginLeft: 16 }}>Extension deficit: {extDiff.toFixed(1)}° ({extSev})</span>}
                      {(flexSev === "severe" || extSev === "severe") && (
                        <div style={{ marginTop: 4, fontWeight: 500, fontSize: 10 }}>
                          &gt;20° deficit — significant ROM restriction. Manual therapy and B.E.A.U. protocol adjustment required.
                        </div>
                      )}
                      {flexSev === "moderate" && extSev !== "severe" && (
                        <div style={{ marginTop: 4, fontWeight: 500, fontSize: 10 }}>
                          10–20° deficit — monitor closely. Phase progression criteria not met until &lt;10°.
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
          {/* Muscle Condition & Effusion */}
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Muscle Condition (Affected Limb)</label>
              <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.muscleCondition} onChange={e => setField("muscleCondition", e.target.value)}>
                <option value="">--- Select ---</option>
                <option value="Normal">Normal — Symmetric muscle mass</option>
                <option value="Mild Atrophy">Mild Atrophy — Slight decrease, palpable</option>
                <option value="Moderate Atrophy">Moderate Atrophy — Visible asymmetry</option>
                <option value="Severe Atrophy">Severe Atrophy — Marked wasting, bony prominences</option>
                <option value="Fibrosis">Fibrosis — Firm, non-contractile tissue</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Joint Effusion (0-3 Scale)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input style={{ ...S.input, flex: 1, border: `1.5px solid ${C.border}` }} type="range" min="0" max="3" value={form.jointEffusion}
                  onChange={e => setField("jointEffusion", e.target.value)} />
                <span style={{
                  fontSize: 14, fontWeight: 700, minWidth: 40, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                  background: +form.jointEffusion === 0 ? "rgba(16,185,129,0.15)" : +form.jointEffusion <= 1 ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)",
                  color: +form.jointEffusion === 0 ? C.green : +form.jointEffusion <= 1 ? C.amber : C.red,
                }}>{form.jointEffusion}/3</span>
              </div>
              <div style={{ fontSize: 9, color: C.text, marginTop: 4 }}>
                {+form.jointEffusion === 0 ? "None" : +form.jointEffusion === 1 ? "Mild — palpable fluid wave" : +form.jointEffusion === 2 ? "Moderate — visible swelling" : "Severe — tense, distended"}
              </div>
            </div>
          </div>
          {/* Manual Muscle Testing — Universal clinical assessment */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>Manual Muscle Testing (MMT — Oxford Scale)</div>
            <div style={S.grid(2)}>
              <div>
                <label style={S.label}>MMT Grade (0-5) — Affected Limb</label>
                <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.mmtGrade} onChange={e => setField("mmtGrade", e.target.value)}>
                  <option value="">--- Select ---</option>
                  <option value="0">0 — No palpable contraction (Paralysis)</option>
                  <option value="1">1 — Flicker/trace contraction, no movement</option>
                  <option value="2">2 — Movement with gravity eliminated only</option>
                  <option value="3">3 — Movement against gravity, not resistance</option>
                  <option value="4">4 — Movement against moderate resistance</option>
                  <option value="5">5 — Normal strength against full resistance</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {form.mmtGrade && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 8, width: "100%",
                    background: +form.mmtGrade >= 4 ? "rgba(16,185,129,0.12)" : +form.mmtGrade >= 2 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                    border: +form.mmtGrade >= 4 ? "1px solid rgba(16,185,129,0.3)" : +form.mmtGrade >= 2 ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: +form.mmtGrade >= 4 ? C.green : +form.mmtGrade >= 2 ? C.amber : C.red }}>
                      {+form.mmtGrade >= 4 ? "Functional Strength" : +form.mmtGrade >= 2 ? "Significant Weakness — Active-assisted exercises recommended" : "Severe Deficit — Passive exercises and NMES indicated"}
                    </div>
                    <div style={{ fontSize: 9, color: C.text, marginTop: 4 }}>
                      {+form.mmtGrade <= 2 ? "Protocol will emphasize NMES, passive ROM, and assisted standing" :
                       +form.mmtGrade === 3 ? "Patient can perform gravity-dependent exercises; avoid resistance training" :
                       "Patient cleared for progressive resistance exercises"}
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OA Staging — Shown for OA / degenerative joint conditions */}
          {(form.diagnosis === "Hip Dysplasia" || form.diagnosis === "Elbow Dysplasia" || form.diagnosis === "Osteoarthritis" || (form.diagnosis || "").toLowerCase().includes("arthrit") || (form.diagnosis || "").toLowerCase().includes("dysplasia") || (form.diagnosis || "").toLowerCase().includes(" oa")) && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>OA Staging — Kellgren-Lawrence Classification</div>
              <div style={S.grid(2)}>
                <div>
                  <label style={S.label}>Kellgren-Lawrence Grade (0-4)</label>
                  <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.oaStage} onChange={e => setField("oaStage", e.target.value)}>
                    <option value="">--- Select ---</option>
                    <option value="0">Grade 0 — No radiographic features of OA</option>
                    <option value="1">Grade 1 — Doubtful: minute osteophytes, questionable significance</option>
                    <option value="2">Grade 2 — Minimal: definite osteophytes, possible joint space narrowing</option>
                    <option value="3">Grade 3 — Moderate: multiple osteophytes, definite JSN, some sclerosis</option>
                    <option value="4">Grade 4 — Severe: large osteophytes, marked JSN, severe sclerosis, deformity</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {form.oaStage && (
                    <div style={{
                      padding: "10px 14px", borderRadius: 8, width: "100%",
                      background: +form.oaStage <= 1 ? "rgba(16,185,129,0.12)" : +form.oaStage <= 2 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                      border: +form.oaStage <= 1 ? "1px solid rgba(16,185,129,0.3)" : +form.oaStage <= 2 ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: +form.oaStage <= 1 ? C.green : +form.oaStage <= 2 ? C.amber : C.red }}>
                        {+form.oaStage <= 1 ? "Early OA — Full exercise progression appropriate" :
                         +form.oaStage === 2 ? "Mild-Moderate OA — Low-impact strengthening focus" :
                         +form.oaStage === 3 ? "Moderate OA — Avoid high-impact; aquatic therapy recommended" :
                         "Severe OA — Comfort-focused protocol; avoid impact loading"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Neurological (conditional — shown for neuro diagnoses) */}
          {NEURO_DIAGNOSES.includes(form.diagnosis) && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>Neurological Assessment</div>
              <div style={S.grid(4)}>
                <div>
                  <label style={S.label}>Proprioception</label>
                  <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.neuroProprioception} onChange={e => setField("neuroProprioception", e.target.value)}>
                    <option value="">--- Select ---</option>
                    <option value="Normal">Normal (Immediate correction)</option>
                    <option value="Delayed">Delayed (Slow correction)</option>
                    <option value="Absent">Absent (No correction)</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Withdrawal Reflex</label>
                  <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.neuroWithdrawal} onChange={e => setField("neuroWithdrawal", e.target.value)}>
                    <option value="">--- Select ---</option>
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Absent">Absent</option>
                    <option value="Exaggerated">Exaggerated (UMN)</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Deep Pain Sensation</label>
                  <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.neuroDeepPain} onChange={e => setField("neuroDeepPain", e.target.value)}>
                    <option value="">--- Select ---</option>
                    <option value="Present">Present (Intact)</option>
                    <option value="Diminished">Diminished</option>
                    <option value="Absent">Absent — Guarded prognosis</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Motor Function Grade (0-5)</label>
                  <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.neuroMotorGrade} onChange={e => setField("neuroMotorGrade", e.target.value)}>
                    <option value="">--- Select ---</option>
                    <option value="0">0 — No voluntary movement</option>
                    <option value="1">1 — Minimal movement, non-ambulatory</option>
                    <option value="2">2 — Ambulatory with significant deficits</option>
                    <option value="3">3 — Ambulatory with mild ataxia</option>
                    <option value="4">4 — Ambulatory, occasional knuckling</option>
                    <option value="5">5 — Normal motor function</option>
                  </select>
                </div>
              </div>
              {form.neuroDeepPain === "Absent" && (
                <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(220,38,38,0.15)", border: "1.5px solid rgba(220,38,38,0.4)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <FiAlertTriangle size={16} style={{ color: C.red, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.red }}>
                    Absent deep pain sensation carries a guarded to poor prognosis for return to ambulation. Document discussion with owner regarding expectations and timeline.
                  </span>
                </div>
              )}

              {/* IVDD Hansen Classification — shown specifically for IVDD diagnosis */}
              {form.diagnosis === "IVDD" && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>IVDD Classification — Hansen Type & Grade</div>
                  <div style={S.grid(2)}>
                    <div>
                      <label style={S.label}>IVDD Grade (I-V)</label>
                      <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.ivddGrade} onChange={e => setField("ivddGrade", e.target.value)}>
                        <option value="">--- Select ---</option>
                        <option value="I">Grade I — Pain only, no neurological deficits</option>
                        <option value="II">Grade II — Ambulatory paraparesis, ataxia, reduced proprioception</option>
                        <option value="III">Grade III — Non-ambulatory paraparesis, voluntary motor present</option>
                        <option value="IV">Grade IV — Non-ambulatory paraplegia, deep pain intact</option>
                        <option value="V">Grade V — Paraplegia with absent deep pain sensation</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {form.ivddGrade && (
                        <div style={{
                          padding: "10px 14px", borderRadius: 8, width: "100%",
                          background: form.ivddGrade === "I" || form.ivddGrade === "II" ? "rgba(16,185,129,0.12)" : form.ivddGrade === "III" ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                          border: form.ivddGrade === "I" || form.ivddGrade === "II" ? "1px solid rgba(16,185,129,0.3)" : form.ivddGrade === "III" ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: form.ivddGrade === "I" || form.ivddGrade === "II" ? C.green : form.ivddGrade === "III" ? C.amber : C.red }}>
                            {form.ivddGrade === "I" ? "Conservative management viable — Pain control + strict rest + Phase 1 rehab" :
                             form.ivddGrade === "II" ? "Conservative or surgical — Active rehab appropriate with neuro monitoring" :
                             form.ivddGrade === "III" ? "Surgical consultation recommended — Begin neuromotor re-education" :
                             form.ivddGrade === "IV" ? "Surgical emergency — Decompression within 24-48h recommended" :
                             "Surgical emergency — Guarded prognosis. < 50% recovery rate without surgery within 12-24h"}
                          </div>
                          {(form.ivddGrade === "IV" || form.ivddGrade === "V") && (
                            <div style={{ fontSize: 9, color: C.red, marginTop: 4, fontWeight: 600 }}>
                              Protocol will restrict to Phase 1 passive exercises until neurological improvement confirmed
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </CollapsibleSection>

        {/* ── Validated Outcome Measures (HCPI · CBPI · LOAD) ── */}
        <CollapsibleSection
          title="Validated Outcome Measures"
          icon={FiBarChart2}
          badge={(() => {
            const filled = [form.hcpiScore, form.cbpiPSS, form.cbpiPIS, form.loadScore].filter(Boolean).length;
            return filled > 0 ? `${filled}/4 recorded` : "HCPI · CBPI · LOAD";
          })()}
          badgeColor={[form.hcpiScore, form.cbpiPSS, form.cbpiPIS, form.loadScore].filter(Boolean).length > 0 ? C.green : C.textLight}
        >
          <div style={{ fontSize: 10, color: C.text, marginBottom: 14, lineHeight: 1.6, padding: "8px 12px", background: "rgba(14,165,233,0.06)", borderRadius: 6, border: "1px solid rgba(14,165,233,0.15)" }}>
            Complete the validated questionnaire with the owner (paper or digital), then enter the total score below. These scores feed directly into B.E.A.U. for baseline tracking and protocol calibration.
          </div>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Helsinki Chronic Pain Index (HCPI) <span style={{ color: C.textLight, fontWeight: 400 }}>(0–44)</span></label>
              <input style={{ ...S.input, border: `1.5px solid ${C.border}`, width: "100%" }} type="number" min="0" max="44" step="1"
                value={form.hcpiScore} onChange={e => setField("hcpiScore", e.target.value)} placeholder="Enter total (0–44)" />
              <div style={{ fontSize: 9, color: C.text, marginTop: 3 }}>11 items × 0–4. Threshold: ≥12 = clinically relevant chronic pain (Hielm-Björkman et al.)</div>
              {form.hcpiScore !== "" && (
                <div style={{ marginTop: 5, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: +form.hcpiScore < 12 ? "rgba(16,185,129,0.12)" : +form.hcpiScore < 24 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                  border: +form.hcpiScore < 12 ? "1px solid rgba(16,185,129,0.3)" : +form.hcpiScore < 24 ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                  color: +form.hcpiScore < 12 ? C.green : +form.hcpiScore < 24 ? C.amber : C.red,
                }}>
                  HCPI {form.hcpiScore}/44 — {+form.hcpiScore < 12 ? "Below chronic pain threshold" : +form.hcpiScore < 24 ? "Mild–Moderate chronic pain" : "Significant chronic pain — pain management review recommended"}
                </div>
              )}
            </div>
            <div>
              <label style={S.label}>LOAD — Liverpool OA in Dogs <span style={{ color: C.textLight, fontWeight: 400 }}>(0–52)</span></label>
              <input style={{ ...S.input, border: `1.5px solid ${C.border}`, width: "100%" }} type="number" min="0" max="52" step="1"
                value={form.loadScore} onChange={e => setField("loadScore", e.target.value)} placeholder="Enter total (0–52)" />
              <div style={{ fontSize: 9, color: C.text, marginTop: 3 }}>13 items × 0–4. Threshold: 0–5 mild · 6–20 moderate · 21–52 severe (Walton et al. 2013)</div>
              {form.loadScore !== "" && (
                <div style={{ marginTop: 5, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: +form.loadScore <= 5 ? "rgba(16,185,129,0.12)" : +form.loadScore <= 20 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                  border: +form.loadScore <= 5 ? "1px solid rgba(16,185,129,0.3)" : +form.loadScore <= 20 ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                  color: +form.loadScore <= 5 ? C.green : +form.loadScore <= 20 ? C.amber : C.red,
                }}>
                  LOAD {form.loadScore}/52 — {+form.loadScore <= 5 ? "Mild OA functional impact" : +form.loadScore <= 20 ? "Moderate OA — aquatic priority, NSAID compliance" : "Severe OA — comfort-focused protocol, no impact loading"}
                </div>
              )}
            </div>
          </div>
          <div style={{ ...S.grid(2), marginTop: 12 }}>
            <div>
              <label style={S.label}>CBPI Pain Severity Score (PSS) <span style={{ color: C.textLight, fontWeight: 400 }}>(0–10 mean)</span></label>
              <input style={{ ...S.input, border: `1.5px solid ${C.border}`, width: "100%" }} type="number" min="0" max="10" step="0.1"
                value={form.cbpiPSS} onChange={e => setField("cbpiPSS", e.target.value)} placeholder="0.0 – 10.0" />
              <div style={{ fontSize: 9, color: C.text, marginTop: 3 }}>Mean of 4 items (worst/least/average/current pain). &gt;2.0 = moderate pain (Brown et al. 2007)</div>
              {form.cbpiPSS !== "" && (
                <div style={{ marginTop: 5, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: +form.cbpiPSS <= 2 ? "rgba(16,185,129,0.12)" : +form.cbpiPSS <= 5 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                  border: +form.cbpiPSS <= 2 ? "1px solid rgba(16,185,129,0.3)" : +form.cbpiPSS <= 5 ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                  color: +form.cbpiPSS <= 2 ? C.green : +form.cbpiPSS <= 5 ? C.amber : C.red,
                }}>
                  PSS {parseFloat(form.cbpiPSS).toFixed(1)} — {+form.cbpiPSS <= 2 ? "Mild / well-controlled pain" : +form.cbpiPSS <= 5 ? "Moderate pain — pain management review" : "Severe pain — pain control before progressive exercise"}
                </div>
              )}
            </div>
            <div>
              <label style={S.label}>CBPI Pain Interference Score (PIS) <span style={{ color: C.textLight, fontWeight: 400 }}>(0–10 mean)</span></label>
              <input style={{ ...S.input, border: `1.5px solid ${C.border}`, width: "100%" }} type="number" min="0" max="10" step="0.1"
                value={form.cbpiPIS} onChange={e => setField("cbpiPIS", e.target.value)} placeholder="0.0 – 10.0" />
              <div style={{ fontSize: 9, color: C.text, marginTop: 3 }}>Mean of 6 items (activity, enjoyment, rising, walking, running, stairs). &gt;1.5 = functional interference</div>
              {form.cbpiPIS !== "" && (
                <div style={{ marginTop: 5, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: +form.cbpiPIS <= 1.5 ? "rgba(16,185,129,0.12)" : +form.cbpiPIS <= 4 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                  border: +form.cbpiPIS <= 1.5 ? "1px solid rgba(16,185,129,0.3)" : +form.cbpiPIS <= 4 ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                  color: +form.cbpiPIS <= 1.5 ? C.green : +form.cbpiPIS <= 4 ? C.amber : C.red,
                }}>
                  PIS {parseFloat(form.cbpiPIS).toFixed(1)} — {+form.cbpiPIS <= 1.5 ? "Minimal functional interference" : +form.cbpiPIS <= 4 ? "Moderate — home program simplification recommended" : "Severe — exercise compliance risk high, owner education critical"}
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <div style={{ marginTop: 12 }}>
          <label style={S.label}>Medical History / Notes</label>
          <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} value={form.medicalHistory} onChange={e => setField("medicalHistory", e.target.value)}
            placeholder="Prior surgeries, chronic conditions, behavioral notes, relevant medical history" />
        </div>
      </div>

      {/* ═══════════ DIAGNOSTIC WORKUP (Collapsible Card) ═══════════ */}
      <div id="diagnostics-workup" style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" }}>
        <CollapsibleSection
          title="Diagnostic Workup"
          icon={FiClipboard}
          defaultOpen={false}
          badge={(() => {
            const allDiags = ["diagRadiographs","diagCT","diagMRI","diagUltrasound","diagCBC","diagChemPanel","diagUrinalysis","diagThyroid","diagCRP","diagSynovial","diagEMG","diagArthroscopy","diagGaitAnalysis","diagForcePlate","diagROM","diagOtherDiag"];
            const performed = allDiags.filter(k => form[k] === true).length;
            const notIndicated = allDiags.filter(k => form[k] === "not_indicated").length;
            const documented = performed + notIndicated;
            return documented > 0 ? `${documented}/16 documented` : "16 items";
          })()}
          badgeColor={(() => {
            const allDiags = ["diagRadiographs","diagCT","diagMRI","diagUltrasound","diagCBC","diagChemPanel","diagUrinalysis","diagThyroid","diagCRP","diagSynovial","diagEMG","diagArthroscopy","diagGaitAnalysis","diagForcePlate","diagROM","diagOtherDiag"];
            const documented = allDiags.filter(k => form[k] === true || form[k] === "not_indicated").length;
            return documented > 0 ? C.green : C.textLight;
          })()}
        >
        <div style={{ fontSize: 10, color: C.text, marginBottom: 16, lineHeight: 1.5 }}>
          Document all diagnostics obtained or reviewed for this patient. Mark each study as <strong style={{ color: C.green }}>Reviewed &amp; Obtained</strong> with findings,
          or <strong style={{ color: C.text }}>Not Clinically Indicated</strong> to confirm the diagnostic was evaluated and deemed unnecessary at this time.
          Undocumented items remain as pending review.
        </div>

        {/* Reusable diagnostic item renderer */}
        {DIAGNOSTIC_SECTIONS.map(section => (
          <div key={section.heading} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
              {section.heading}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {section.items.map(d => {
                const notesKey = d.key === "diagOtherDiag" ? "diagOtherNotes" : d.key + "Notes";
                const isPerformed = form[d.key] === true;
                const isNotIndicated = form[d.key] === "not_indicated";

                return (
                  <div key={d.key} style={{
                    padding: "10px 14px", borderRadius: 8, transition: "all 0.2s",
                    background: isPerformed ? "rgba(16,185,129,0.1)" : isNotIndicated ? "rgba(148,163,184,0.06)" : C.bg,
                    border: isPerformed ? "1.5px solid rgba(16,185,129,0.3)" : isNotIndicated ? "1.5px solid rgba(148,163,184,0.15)" : `1.5px solid ${C.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        {/* Status indicator */}
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: isPerformed ? C.green : isNotIndicated ? C.textMid : C.border,
                          boxShadow: isPerformed ? "0 0 6px rgba(16,185,129,0.4)" : "none",
                        }} />
                        <div>
                          <div style={{
                            fontSize: 12, fontWeight: 600,
                            color: isPerformed ? C.green : isNotIndicated ? C.textMid : C.text,
                            textDecoration: isNotIndicated ? "line-through" : "none",
                          }}>{d.label}</div>
                          {isNotIndicated && (
                            <div style={{ fontSize: 10, color: C.textMid, fontStyle: "italic", marginTop: 2 }}>
                              Reviewed — not clinically indicated at this time
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button type="button" onClick={() => {
                          if (isPerformed) { setField(d.key, false); }
                          else { setField(d.key, true); }
                        }} style={{
                          padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.3px",
                          background: isPerformed ? C.green : "rgba(16,185,129,0.12)",
                          color: isPerformed ? "#fff" : C.green,
                          border: isPerformed ? `1px solid ${C.green}` : "1px solid rgba(16,185,129,0.25)",
                        }}>
                          {isPerformed ? <><FiCheckCircle size={10} style={{ marginRight: 3 }} />OBTAINED</> : "Obtained"}
                        </button>
                        <button type="button" onClick={() => {
                          if (isNotIndicated) { setField(d.key, false); }
                          else { setField(d.key, "not_indicated"); setField(notesKey, ""); }
                        }} style={{
                          padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.3px",
                          background: isNotIndicated ? C.textMid : "rgba(148,163,184,0.08)",
                          color: isNotIndicated ? "#fff" : C.textMid,
                          border: isNotIndicated ? `1px solid ${C.textMid}` : "1px solid rgba(148,163,184,0.15)",
                        }}>
                          {isNotIndicated ? "NOT INDICATED" : "Not Indicated"}
                        </button>
                      </div>
                    </div>

                    {/* Findings field — only when performed */}
                    {isPerformed && (
                      <div style={{ marginTop: 8, marginLeft: 18 }}>
                        <input style={{
                          ...S.input, border: "1px solid rgba(16,185,129,0.2)",
                          background: "rgba(16,185,129,0.05)", fontSize: 11, padding: "7px 10px",
                          color: C.text,
                        }}
                          value={form[notesKey] || ""} onChange={e => setField(notesKey, e.target.value)}
                          placeholder={d.hint} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Diagnostic Summary Bar */}
        {(() => {
          const allDiags = ["diagRadiographs","diagCT","diagMRI","diagUltrasound","diagCBC","diagChemPanel","diagUrinalysis","diagThyroid","diagCRP","diagSynovial","diagEMG","diagArthroscopy","diagGaitAnalysis","diagForcePlate","diagROM","diagOtherDiag"];
          const performed = allDiags.filter(k => form[k] === true).length;
          const notIndicated = allDiags.filter(k => form[k] === "not_indicated").length;
          const pending = allDiags.length - performed - notIndicated;
          return (
            <div style={{ marginTop: 8, padding: "10px 16px", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 8, display: "flex", gap: 20, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.5px" }}>Workup Status</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>{performed} Obtained</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{notIndicated} Not Indicated</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{pending} Pending Review</span>
            </div>
          );
        })()}
        </CollapsibleSection>
      </div>

      {/* Step 2 navigation */}
      <StepNavButtons
        onBack={() => goToStep(1)}
        backLabel={<>&#8592; Back to Patient Info</>}
        onNext={() => goToStep(3)}
        nextLabel="Next: Treatment Plan"
      />
    </>
  );
}
