import React from "react";
import { FiFileText, FiAlertTriangle, FiShield, FiHeart, FiScissors, FiActivity } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import { useTr } from "../../i18n/useTr";

// ── Reusable Section wrapper ──
function Section({ title, subtitle, icon: Icon, color, children }) {
  const tr = useTr();
  return (
    <div style={{
      background: C.surface, borderRadius: 12, padding: "20px 24px", marginBottom: 16,
      border: `1px solid ${C.border}`, borderLeft: `4px solid ${color}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: subtitle ? 4 : 10 }}>
        <Icon size={18} style={{ color, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{tr(title)}</div>
      </div>
      {subtitle && <div style={{ fontSize: 11, color: C.textLight, marginBottom: 14, paddingLeft: 28 }}>{tr(subtitle)}</div>}
      {children}
    </div>
  );
}

export default function Step3TreatmentPlan({ form, setField, goToStep, handleSurgeryDate, handlePostOpDay }) {
  const tr = useTr();
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <SectionHead icon={FiFileText} title="Treatment Plan & Surgical Status" />
      </div>

      {/* ═══ 1. TREATMENT APPROACH ═══ */}
      <Section title="Treatment Approach" subtitle="Select the rehabilitation pathway — determines protocol structure" icon={FiActivity} color="#0EA5E9">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { value: "surgical", label: "Surgical", icon: "🔪", desc: "Post-operative rehabilitation", color: "#A32D2D" },
            { value: "conservative", label: "Conservative", icon: "🩺", desc: "Non-surgical management", color: "#1D9E75" },
            { value: "palliative", label: "Palliative / Comfort", icon: "💙", desc: "Quality of life focused", color: "#8B5CF6" },
          ].map(opt => (
            <div key={opt.value}
              onClick={() => setField("treatmentApproach", opt.value)}
              style={{
                padding: "16px 18px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                background: form.treatmentApproach === opt.value ? `${opt.color}10` : C.bg,
                border: form.treatmentApproach === opt.value ? `2px solid ${opt.color}` : `1px solid ${C.border}`,
                boxShadow: form.treatmentApproach === opt.value ? `0 0 12px ${opt.color}20` : "none",
                transition: "all 0.2s",
              }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{tr(opt.label)}</div>
              <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{tr(opt.desc)}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 2. CLINICAL RECOMMENDATION & OWNER DECISION ═══ */}
      <Section title="Clinical Recommendation & Owner Decision" subtitle="Document informed consent and treatment election" icon={FiShield} color="#BA7517">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>{tr("Veterinary Recommendation")}</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.vetRecommendation} onChange={e => setField("vetRecommendation", e.target.value)}>
              <option value="">{tr("--- Select ---")}</option>
              <option value="Surgery - Strongly Recommended">{tr("Surgery — Strongly Recommended")}</option>
              <option value="Surgery - Recommended">{tr("Surgery — Recommended")}</option>
              <option value="Surgery - Optional">{tr("Surgery — Optional (Either approach viable)")}</option>
              <option value="Conservative - Recommended">{tr("Conservative — Recommended")}</option>
              <option value="Conservative - Only Option">{tr("Conservative — Only Viable Option")}</option>
              <option value="Palliative">{tr("Palliative / Comfort Care")}</option>
            </select>
          </div>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>{tr("Owner Election / Decision")}</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.ownerElection} onChange={e => setField("ownerElection", e.target.value)}>
              <option value="">{tr("--- Select ---")}</option>
              <option value="Elected Surgery">{tr("Elected Surgery (per recommendation)")}</option>
              <option value="Elected Conservative">{tr("Elected Conservative Management")}</option>
              <option value="Declined Surgery - Conservative">{tr("Declined Surgery — Elected Conservative")}</option>
              <option value="Declined Surgery - Financial">{tr("Declined Surgery — Financial Constraints")}</option>
              <option value="Declined Surgery - Age/Risk">{tr("Declined Surgery — Patient Age/Risk")}</option>
              <option value="Seeking Second Opinion">{tr("Seeking Second Opinion")}</option>
              <option value="Elected Palliative">{tr("Elected Palliative / Comfort Care")}</option>
            </select>
          </div>
        </div>
        {/* Warning: owner declines recommended surgery */}
        {form.vetRecommendation?.startsWith("Surgery") && form.ownerElection?.startsWith("Declined") && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14, padding: "12px 16px", background: `${C.amber}08`, border: `2px solid ${C.amber}40`, borderRadius: 8 }}>
            <FiAlertTriangle size={18} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{tr("Owner Declines Recommended Surgery")}</div>
              <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>{tr("Protocol generated for conservative management. Document informed consent.")}</div>
              <div style={{ marginTop: 8 }}>
                <label style={{ ...S.label, fontSize: 11 }}>{tr("Reason / Notes for Declining")}</label>
                <input style={{ ...S.input, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.amber}40`, fontSize: 12 }}
                  value={form.ownerDeclineReason} onChange={e => setField("ownerDeclineReason", e.target.value)}
                  placeholder={tr("Owner's stated reason, informed consent documented")} />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ═══ 3. SURGICAL DETAILS (conditional) ═══ */}
      {form.treatmentApproach === "surgical" && (
        <Section title="Surgical Details" subtitle="Document procedure, timing, and post-operative status" icon={FiScissors} color="#A32D2D">
          {/* Procedure + Date + POD */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>{tr("Surgery Type / Procedure")}</label>
              <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
                value={form.surgeryType} onChange={e => setField("surgeryType", e.target.value)}>
                <option value="">{tr("--- Select Procedure ---")}</option>
                <optgroup label={tr("Stifle / Knee")}>
                  {["TPLO", "TTA", "Lateral Suture", "TightRope CCL", "Meniscectomy", "Patellar Luxation Repair", "Stifle Arthroscopy"].map(p => <option key={p} value={p}>{tr(p)}</option>)}
                </optgroup>
                <optgroup label={tr("Hip")}>
                  {["FHO", "THR", "JPS", "DPO/TPO", "Toggle Pin Hip Reduction"].map(p => <option key={p} value={p}>{tr(p)}</option>)}
                </optgroup>
                <optgroup label={tr("Elbow & Shoulder")}>
                  {["FCP Removal", "UAP Fixation", "Elbow Arthroscopy", "Shoulder OCD Removal", "Shoulder Stabilization", "Biceps Tenodesis"].map(p => <option key={p} value={p}>{tr(p)}</option>)}
                </optgroup>
                <optgroup label={tr("Spine / Neuro")}>
                  {["Hemilaminectomy", "Ventral Slot", "Dorsal Laminectomy", "Lumbosacral Decompression", "Disc Fenestration", "Spinal Stabilization"].map(p => <option key={p} value={p}>{tr(p)}</option>)}
                </optgroup>
                <optgroup label={tr("Fracture Repair")}>
                  {["Plate Fixation (ORIF)", "External Fixation (ESF)", "IM Pin", "Interlocking Nail", "Pelvic Fracture ORIF"].map(p => <option key={p} value={p}>{tr(p)}</option>)}
                </optgroup>
                <optgroup label={tr("Soft Tissue / Other")}>
                  {["Achilles Repair", "Muscle Repair", "Forelimb Amputation", "Hindlimb Amputation", "Arthrodesis", "Hardware Removal", "Other"].map(p => <option key={p} value={p}>{tr(p)}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>{tr("Surgery Date")}</label>
              <input style={{ ...S.input, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                type="date" value={form.surgeryDate} onChange={e => handleSurgeryDate(e.target.value)} />
            </div>
            <div>
              <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>{tr("Post-Op Day")}</label>
              <input style={{ ...S.input, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                type="number" min="0" value={form.postOpDay} onChange={e => handlePostOpDay(e.target.value)} placeholder={tr("POD")} />
              {form.postOpDay && form.surgeryDate && (
                <div style={{ fontSize: 10, color: C.green, fontWeight: 500, marginTop: 4 }}>{tr("Auto-calculated")}</div>
              )}
            </div>
          </div>

          {/* Surgeon + Facility + ASA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={S.label}>{tr("Surgeon Name")}</label>
              <input style={{ ...S.input, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                value={form.surgeonName} onChange={e => setField("surgeonName", e.target.value)} placeholder={tr("DVM / DACVS")} />
            </div>
            <div>
              <label style={S.label}>{tr("Surgical Facility")}</label>
              <input style={{ ...S.input, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                value={form.surgicalFacility} onChange={e => setField("surgicalFacility", e.target.value)} placeholder={tr("Hospital name")} />
            </div>
            <div>
              <label style={S.label}>{tr("ASA Physical Status")}</label>
              <select style={{ ...S.select, width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                value={form.anesthesiaRisk} onChange={e => setField("anesthesiaRisk", e.target.value)}>
                <option value="">---</option>
                {["ASA I — Normal healthy", "ASA II — Mild systemic", "ASA III — Severe systemic", "ASA IV — Life-threatening", "ASA V — Moribund"].map(a => <option key={a} value={a.split(" —")[0]}>{tr(a)}</option>)}
              </select>
            </div>
          </div>

          {/* Incision + Sutures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={S.label}>{tr("Incision Status")}</label>
              <select style={{ ...S.select, width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                value={form.incisionStatus} onChange={e => setField("incisionStatus", e.target.value)}>
                <option value="">---</option>
                {["Clean/Dry/Intact", "Mild Swelling", "Seroma Present", "Dehiscence Concern", "Infection Signs", "Healed", "N/A"].map(s => <option key={s} value={s}>{tr(s)}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>{tr("Suture Removal Date")}</label>
              <input style={{ ...S.input, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                type="date" value={form.sutureRemovalDate} onChange={e => setField("sutureRemovalDate", e.target.value)} />
            </div>
          </div>

          {/* Implant + Complications */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={S.label}>{tr("Implant / Hardware Details")}</label>
              <input style={{ ...S.input, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                value={form.implantDetails} onChange={e => setField("implantDetails", e.target.value)} placeholder={tr("e.g. 3.5mm TPLO plate")} />
            </div>
            <div>
              <label style={S.label}>{tr("Surgical Complications / Notes")}</label>
              <input style={{ ...S.input, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
                value={form.complicationsNoted} onChange={e => setField("complicationsNoted", e.target.value)} placeholder={tr("Any complications noted")} />
            </div>
          </div>
        </Section>
      )}

      {/* ═══ 4. RECOVERY STATUS & RESTRICTIONS ═══ */}
      <Section title="Recovery Status & Restrictions" subtitle="Current weight-bearing status and activity limitations" icon={FiHeart} color="#1D9E75">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>{tr("Weight-Bearing Status")}</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.weightBearingStatus} onChange={e => setField("weightBearingStatus", e.target.value)}>
              <option value="">{tr("--- Select ---")}</option>
              <option value="Non-weight bearing">{tr("Non-weight bearing (NWB)")}</option>
              <option value="Toe-touching">{tr("Toe-touching (TTWB)")}</option>
              <option value="Partial">{tr("Partial weight bearing (PWB)")}</option>
              <option value="Weight bearing as tolerated">{tr("Weight bearing as tolerated (WBAT)")}</option>
              <option value="Full weight bearing">{tr("Full weight bearing (FWB)")}</option>
            </select>
          </div>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>{tr("Activity Restrictions")}</label>
            <textarea style={{ ...S.input, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, minHeight: 42, resize: "vertical", fontFamily: "inherit", fontSize: 13 }}
              value={form.activityRestrictions} onChange={e => setField("activityRestrictions", e.target.value)}
              placeholder={tr("e.g. No stairs, no jumping, leash walks only")} />
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { key: "eCollarRequired", label: "E-Collar Required" },
            { key: "crateRestRequired", label: "Strict Crate Rest" },
            { key: "slingAssistRequired", label: "Sling Assist Required" },
          ].map(item => (
            <label key={item.key} style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.text,
              background: form[item.key] ? `${C.teal}12` : C.surface,
              border: form[item.key] ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
            }}>
              <input type="checkbox" checked={form[item.key] || false} onChange={e => setField(item.key, e.target.checked)}
                style={{ accentColor: C.teal, width: 15, height: 15, cursor: "pointer" }} />
              {tr(item.label)}
            </label>
          ))}
        </div>

        <div>
          <label style={S.label}>{tr("Prior Surgeries / Relevant History")}</label>
          <input style={{ ...S.input, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
            value={form.priorSurgeries} onChange={e => setField("priorSurgeries", e.target.value)}
            placeholder={tr("e.g. Contralateral TPLO 2024, splenectomy 2023")} />
        </div>
      </Section>

      <StepNavButtons onBack={() => goToStep(2)} backLabel="← Back to Assessment" onNext={() => goToStep(4)} nextLabel="Next: Rehab Goals →" />
    </>
  );
}
