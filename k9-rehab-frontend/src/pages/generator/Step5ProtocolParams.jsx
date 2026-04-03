import React from "react";
import { FiCalendar, FiAlertTriangle, FiCheckCircle, FiActivity, FiHome, FiSettings, FiShield } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import { CONDITIONS, FELINE_DIAGNOSES } from "./constants";

// ── Reusable Section wrapper ──
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

// ── Reusable checkbox group ──
function CheckGroup({ items, form, setField, columns = 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
      {items.map(mod => {
        const checked = !!form[mod.key];
        return (
          <label key={mod.key} style={{
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.text,
            background: checked ? `${C.teal}12` : C.surface, border: checked ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
          }}>
            <input type="checkbox" checked={checked} onChange={e => setField(mod.key, e.target.checked)}
              style={{ accentColor: C.teal, width: 15, height: 15, cursor: "pointer", flexShrink: 0 }} />
            {mod.icon && <span>{mod.icon}</span>} {mod.label}
          </label>
        );
      })}
    </div>
  );
}

export default function Step5ProtocolParams({ form, setField, generate, allExercises, complianceAgreed, setComplianceAgreed, complianceOpen, setComplianceOpen, error, goToStep, loading }) {

  // Count exercises matching condition
  const totalExercises = allExercises.length;
  const diagLabel = (() => {
    for (const [, items] of Object.entries(CONDITIONS)) {
      const found = items.find(c => c.value === form.diagnosis);
      if (found) return found.label;
    }
    for (const [, items] of Object.entries(FELINE_DIAGNOSES)) {
      const found = items.find(c => c.value === form.diagnosis);
      if (found) return found.label;
    }
    return form.diagnosis || "Not selected";
  })();

  // Missing fields check
  const missing = [];
  if (!form.patientName?.trim()) missing.push("Patient Name");
  if (!form.diagnosis) missing.push("Diagnosis");
  if (!form.affectedRegion) missing.push("Affected Region");
  if (!form.treatmentApproach) missing.push("Treatment Approach");

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <SectionHead icon={FiCalendar} title="Protocol Configuration & Generate" />
      </div>

      {/* ═══ 1. PROTOCOL PARAMETERS ═══ */}
      <Section title="Protocol Parameters" subtitle="Duration, frequency, and compliance expectations" icon={FiSettings} color="#0EA5E9">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Protocol Duration</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.protocolLength} onChange={e => setField("protocolLength", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="6">6 weeks — Mild / accelerated</option>
              <option value="8">8 weeks — Standard post-surgical</option>
              <option value="10">10 weeks — Extended recovery</option>
              <option value="12">12 weeks — Complex / multi-joint</option>
              <option value="16">16 weeks — Conservative / neuro</option>
            </select>
          </div>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Session Frequency</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.sessionFrequency} onChange={e => setField("sessionFrequency", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="1">1× per week</option>
              <option value="2">2× per week (Recommended)</option>
              <option value="3">3× per week (Intensive)</option>
              <option value="5">5× per week (Inpatient)</option>
            </select>
          </div>
          <div>
            <label style={{ ...S.label, fontSize: 12, fontWeight: 700 }}>Owner Compliance</label>
            <select style={{ ...S.select, width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: `2px solid ${C.border}` }}
              value={form.ownerCompliance} onChange={e => setField("ownerCompliance", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="Highly Motivated">Highly Motivated</option>
              <option value="Motivated">Motivated — Reliable</option>
              <option value="Average">Average — Moderate adherence</option>
              <option value="Limited">Limited — Minimal HEP</option>
            </select>
          </div>
        </div>
        {/* HEP + Aquatic checkboxes */}
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.text,
            background: form.homeExerciseProgram ? `${C.green}12` : C.surface, border: form.homeExerciseProgram ? `2px solid ${C.green}` : `1px solid ${C.border}` }}>
            <input type="checkbox" checked={form.homeExerciseProgram || false} onChange={e => setField("homeExerciseProgram", e.target.checked)}
              style={{ accentColor: C.green, width: 15, height: 15 }} />
            Include Home Exercise Program (HEP)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.text,
            background: form.aquaticAccess ? `${C.teal}12` : C.surface, border: form.aquaticAccess ? `2px solid ${C.teal}` : `1px solid ${C.border}` }}>
            <input type="checkbox" checked={form.aquaticAccess || false} onChange={e => setField("aquaticAccess", e.target.checked)}
              style={{ accentColor: C.teal, width: 15, height: 15 }} />
            Aquatic Therapy Available
          </label>
        </div>
      </Section>

      {/* ═══ 2. THERAPEUTIC MODALITIES ═══ */}
      <Section title="Available Therapeutic Modalities" subtitle="Select all modalities available at your facility" icon={FiActivity} color="#8B5CF6"
        badge={`${[form.modalityUWTM, form.modalityLaser, form.modalityTENS, form.modalityNMES, form.modalityTherapeuticUS, form.modalityShockwave, form.modalityCryotherapy, form.modalityHeatTherapy, form.modalityPulsedEMF].filter(Boolean).length} selected`}>
        <CheckGroup columns={3} form={form} setField={setField} items={[
          { key: "modalityUWTM", label: "Underwater Treadmill", icon: "🌊" },
          { key: "modalityLaser", label: "Therapeutic Laser (PBM)", icon: "🔴" },
          { key: "modalityTENS", label: "TENS", icon: "⚡" },
          { key: "modalityNMES", label: "NMES / E-Stim", icon: "⚡" },
          { key: "modalityTherapeuticUS", label: "Therapeutic Ultrasound", icon: "📡" },
          { key: "modalityShockwave", label: "Shockwave (ESWT)", icon: "💥" },
          { key: "modalityCryotherapy", label: "Cryotherapy", icon: "❄️" },
          { key: "modalityHeatTherapy", label: "Heat Therapy", icon: "🔥" },
          { key: "modalityPulsedEMF", label: "Pulsed EMF (PEMF)", icon: "🧲" },
        ]} />
      </Section>

      {/* ═══ 3. HOME ENVIRONMENT & EQUIPMENT ═══ */}
      {form.homeExerciseProgram && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Section title="Home Equipment" subtitle="What equipment does the client have?" icon={FiHome} color="#1D9E75">
            <CheckGroup columns={1} form={form} setField={setField} items={[
              { key: "homeEquip_nonSlipMats", label: "Non-slip mats / rugs" },
              { key: "homeEquip_ramp", label: "Ramp (car / furniture)" },
              { key: "homeEquip_harness", label: "Support harness / sling" },
              { key: "homeEquip_cavaletti", label: "Cavaletti poles / broomsticks" },
              { key: "homeEquip_balanceDisc", label: "Balance disc / wobble board" },
              { key: "homeEquip_physioball", label: "Physio ball / peanut ball" },
              { key: "homeEquip_stairs", label: "Stairs available" },
              { key: "homeEquip_pool", label: "Pool / water access" },
            ]} />
          </Section>
          <Section title="Home Environment" subtitle="Describe the living situation" icon={FiHome} color="#BA7517">
            <CheckGroup columns={1} form={form} setField={setField} items={[
              { key: "homeEnv_singleLevel", label: "Single level / no stairs" },
              { key: "homeEnv_stairs", label: "Stairs in home" },
              { key: "homeEnv_hardFloors", label: "Hardwood / tile floors" },
              { key: "homeEnv_carpeted", label: "Carpeted floors" },
              { key: "homeEnv_fencedYard", label: "Fenced yard" },
              { key: "homeEnv_otherPets", label: "Other pets in home" },
              { key: "homeEnv_smallChildren", label: "Small children in home" },
              { key: "homeEnv_crate", label: "Crate / pen available" },
            ]} />
          </Section>
        </div>
      )}

      {/* ═══ 4. SPECIAL INSTRUCTIONS ═══ */}
      <Section title="Special Instructions" subtitle="Additional clinical notes for protocol generation" icon={FiCalendar} color="#0EA5E9">
        <textarea style={{ ...S.input, padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.border}`, minHeight: 60, resize: "vertical", fontFamily: "inherit", fontSize: 13, width: "100%" }}
          value={form.specialInstructions} onChange={e => setField("specialInstructions", e.target.value)}
          placeholder="e.g. Fearful of water — avoid aquatic initially. Aggressive with handling — needs muzzle for manual therapy." />
      </Section>

      {/* ═══ 5. PRE-PROTOCOL SUMMARY (compact) ═══ */}
      <Section title="Pre-Protocol Summary" subtitle="Review before generating" icon={FiCheckCircle} color="#1D9E75">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600, textTransform: "uppercase" }}>Patient</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 2 }}>{form.patientName || "—"}</div>
            <div style={{ fontSize: 11, color: C.textLight }}>{form.species || "Canine"} · {form.breed || "—"} · {form.age ? `${form.age} yr` : "—"}</div>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600, textTransform: "uppercase" }}>Diagnosis</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }}>{diagLabel}</div>
            <div style={{ fontSize: 11, color: C.textLight }}>{form.affectedRegion || "—"}</div>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600, textTransform: "uppercase" }}>Protocol</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 2 }}>{form.protocolLength || "8"} weeks · {form.sessionFrequency || "2"}x/week</div>
            <div style={{ fontSize: 11, color: C.textLight }}>{form.treatmentApproach ? form.treatmentApproach.charAt(0).toUpperCase() + form.treatmentApproach.slice(1) : "—"} · {form.homeExerciseProgram ? "HEP Included" : "No HEP"}</div>
          </div>
        </div>

        {/* Exercise count */}
        <div style={{ fontSize: 12, color: C.textLight, marginBottom: 10 }}>
          Exercise Library: <strong style={{ color: C.teal }}>{totalExercises}</strong> exercises available
        </div>

        {/* Missing fields warning */}
        {missing.length > 0 && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: `${C.amber}08`, border: `1px solid ${C.amber}30`, display: "flex", alignItems: "center", gap: 8 }}>
            <FiAlertTriangle size={14} style={{ color: C.amber, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>Missing: {missing.join(", ")}</span>
          </div>
        )}
      </Section>

      {/* ═══ 6. COMPLIANCE NOTICE ═══ */}
      <div style={{ background: C.surface, borderRadius: 12, padding: "16px 24px", marginBottom: 16, border: `1px solid ${C.border}` }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={complianceAgreed} onChange={e => setComplianceAgreed(e.target.checked)}
            style={{ accentColor: C.teal, width: 18, height: 18, cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
              I acknowledge the{" "}
              <span onClick={e => { e.preventDefault(); setComplianceOpen(o => !o); }}
                style={{ color: C.teal, textDecoration: "underline", cursor: "pointer" }}>
                K9 Rehab Pro — Compliance & Data Protection Notice
              </span>
            </span>
            <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>
              Clinical Decision-Support System (CDSS). Does not establish VCPR. All protocols require licensed veterinarian review.
            </div>
          </div>
        </label>
        {complianceOpen && (
          <div style={{ marginTop: 12, padding: "14px 16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11, color: C.text, lineHeight: 1.7, maxHeight: 200, overflowY: "auto" }}>
            <p><strong>1. CDSS Classification:</strong> K9 Rehab Pro is a Clinical Decision-Support System. It does not diagnose, prescribe, or replace veterinary judgment.</p>
            <p><strong>2. Veterinary Oversight:</strong> All generated protocols must be reviewed and approved by a licensed veterinarian before clinical application.</p>
            <p><strong>3. Data Privacy:</strong> Patient data is stored within your deployment. B.E.A.U. AI queries are processed via Anthropic API — no patient-identifying data is shared. No data is sold or used for advertising.</p>
            <p><strong>4. Evidence Standards:</strong> Protocols follow Millis & Levine, ACVSMR, and peer-reviewed veterinary literature. Every exercise is evidence-based and safety-screened.</p>
            <p style={{ marginTop: 8, fontStyle: "italic", color: C.textLight }}>&copy; 2025-2026 Salvatore Bonanno. All rights reserved.</p>
          </div>
        )}
      </div>

      {/* ═══ 7. GENERATE BUTTON ═══ */}
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
        <button
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "18px 56px", borderRadius: 12, border: `2px solid ${C.green}`,
            fontSize: 16, fontWeight: 800, letterSpacing: "0.5px", cursor: complianceAgreed && missing.length === 0 ? "pointer" : "not-allowed",
            background: complianceAgreed && missing.length === 0
              ? `linear-gradient(135deg, ${C.green} 0%, #34D399 100%)`
              : C.border,
            color: complianceAgreed && missing.length === 0 ? "#fff" : C.textLight,
            boxShadow: complianceAgreed && missing.length === 0
              ? "0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.15)"
              : "none",
            transition: "all 0.3s ease",
            opacity: complianceAgreed && missing.length === 0 ? 1 : 0.5,
          }}
          onMouseEnter={e => {
            if (complianceAgreed && missing.length === 0) {
              e.currentTarget.style.boxShadow = "0 0 30px rgba(16,185,129,0.7), 0 0 60px rgba(16,185,129,0.4), 0 0 90px rgba(16,185,129,0.2)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={e => {
            if (complianceAgreed && missing.length === 0) {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
          onClick={generate}
          disabled={loading || !complianceAgreed || missing.length > 0}
        >
          <FiActivity size={18} />
          {loading ? "Generating Protocol..." : "Generate Exercise Protocol"}
        </button>
      </div>

      {/* Back button */}
      <div style={{ display: "flex", justifyContent: "flex-start", padding: "8px 0" }}>
        <button style={S.btn("ghost")} onClick={() => goToStep(4)}>
          ← Back to Rehab Goals
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: `${C.red}08`, border: `2px solid ${C.red}40`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <FiAlertTriangle size={16} style={{ color: C.red }} /> <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{error}</span>
        </div>
      )}
    </>
  );
}
