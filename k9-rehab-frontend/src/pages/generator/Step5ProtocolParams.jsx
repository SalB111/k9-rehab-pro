import React from "react";
import { FiCalendar, FiActivity, FiHome, FiSettings } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";

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

export default function Step5ProtocolParams({ form, setField, goToStep }) {
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

      {/* Navigation */}
      <StepNavButtons
        onBack={() => goToStep(4)}
        backLabel="← Back to Rehab Goals"
        onNext={() => goToStep(6)}
        nextLabel="Next: Review & Generate →"
      />
    </>
  );
}
