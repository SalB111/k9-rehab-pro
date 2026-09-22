import React from "react";
import { FiTool, FiCheckSquare, FiCalendar } from "react-icons/fi";
import { TbActivityHeartbeat } from "react-icons/tb";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import { useTr } from "../../i18n/useTr";

const navyCard = { background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" };

/* Reusable multi-checkbox list */
function CheckboxGroup({ items, formKey, form, setField, accentColor }) {
  const tr = useTr();
  const accent = accentColor || C.teal;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map(item => (
        <label key={item} style={{
          display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
          background: (form[formKey] || []).includes(item) ? "rgba(14,165,233,0.15)" : C.bg,
          border: (form[formKey] || []).includes(item) ? `1.5px solid ${accent}` : `1.5px solid ${C.border}`,
          transition: "all 0.2s",
        }}>
          <input type="checkbox" checked={(form[formKey] || []).includes(item)}
            onChange={e => {
              const arr = [...(form[formKey] || [])];
              if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
              setField(formKey, arr);
            }}
            style={{ accentColor: accent, width: 13, height: 13, cursor: "pointer" }} />
          {tr(item)}
        </label>
      ))}
    </div>
  );
}

export default function Step6Equipment({ form, setField, goToStep }) {
  const tr = useTr();
  return (
    <>
      {/* ═══════════ SECTION: AVAILABLE THERAPEUTIC MODALITIES ═══════════ */}
      <div style={navyCard}>
        <SectionHead icon={FiTool} title="In-Hospital Equipment & Modalities" />

        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          {tr("Available Therapeutic Modalities")}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
          {tr("Select all modalities available at your facility (determines which interventions can be prescribed)")}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { key: "modalityUWTM", label: "Underwater Treadmill", icon: "\uD83C\uDF0A" },
            { key: "modalityLaser", label: "Therapeutic Laser (PBM)", icon: "\uD83D\uDD34" },
            { key: "modalityTENS", label: "TENS", icon: "\u26A1" },
            { key: "modalityNMES", label: "NMES / E-Stim", icon: "\u26A1" },
            { key: "modalityTherapeuticUS", label: "Therapeutic Ultrasound", icon: "\uD83D\uDCE1" },
            { key: "modalityShockwave", label: "Shockwave (ESWT)", icon: "\uD83D\uDCA5" },
            { key: "modalityCryotherapy", label: "Cryotherapy", icon: "\u2744\uFE0F" },
            { key: "modalityHeatTherapy", label: "Heat Therapy", icon: "\uD83D\uDD25" },
            { key: "modalityPulsedEMF", label: "Pulsed EMF (PEMF)", icon: "\uD83E\uDDF2" },
          ].map(mod => (
            <label key={mod.key} style={{
              display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
              padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
              color: C.text,
              background: form[mod.key] ? "rgba(14,165,233,0.15)" : C.bg,
              border: form[mod.key] ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
              transition: "all 0.2s",
            }}>
              <input type="checkbox" checked={!!form[mod.key]} onChange={e => setField(mod.key, e.target.checked)}
                style={{ accentColor: C.teal, width: 14, height: 14, cursor: "pointer" }} />
              <span>{mod.icon}</span> {tr(mod.label)}
            </label>
          ))}
        </div>
      </div>

      {/* ═══════════ SECTION: FUNCTIONAL ASSESSMENT TOOLS ═══════════ */}
      <div style={navyCard}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <TbActivityHeartbeat size={12} style={{ color: C.teal }} /> {tr("Functional Assessment Tools")}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
          {tr("Assessment equipment available at your facility for baseline and progress evaluation")}
        </div>
        <CheckboxGroup
          items={[
            "Force plate", "Stance analyzer", "Video gait analysis",
            "Underwater treadmill", "Therapeutic laser", "Balance / proprioception equipment",
          ]}
          formKey="assessmentTools"
          form={form}
          setField={setField}
        />
      </div>

      {/* ═══════════ SECTION: DISCHARGE PLANNING ═══════════ */}
      <div style={navyCard}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <FiCheckSquare size={12} style={{ color: C.teal }} /> {tr("Discharge Planning")}
          </span>
        </div>

        {/* Discharge Criteria */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            {tr("Discharge Criteria")}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            {tr("Objective benchmarks for protocol completion (select all that apply)")}
          </div>
          <CheckboxGroup
            items={[
              "Pain-free at rest and activity", "Full ROM or within 10\u00B0 contralateral",
              "Symmetrical muscle mass", "Normal gait at walk & trot",
              "Independent stair use", "Owner competent with HEP",
              "Functional activity tolerance", "Stable on all validated measures",
              "No exercise-induced lameness", "Vet clearance obtained",
            ]}
            formKey="dischargeCriteria"
            form={form}
            setField={setField}
            accentColor={C.green}
          />
        </div>

        {/* Estimated Discharge Date */}
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <FiCalendar size={11} /> {tr("Estimated Discharge Date")}
              </span>
            </label>
            <input type="date"
              style={{ ...S.input, border: `1.5px solid ${C.border}` }}
              value={form.estimatedDischargeDate || ""} onChange={e => setField("estimatedDischargeDate", e.target.value)}
            />
          </div>
          <div>
            <label style={S.label}>{tr("Discharge Summary / Notes")}</label>
            <textarea
              style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 52, resize: "vertical", fontFamily: "inherit" }}
              value={form.dischargeNotes || ""} onChange={e => setField("dischargeNotes", e.target.value)}
              placeholder={tr("e.g. Target discharge at 12 weeks if criteria met, transition to maintenance HEP, re-eval at 6 months")}
            />
          </div>
        </div>
      </div>

      {/* Step 6 navigation */}
      <StepNavButtons
        onBack={() => goToStep(5)}
        backLabel={"← Back to Protocol Parameters"}
        onNext={() => goToStep(7)}
        nextLabel="Next: Home Protocol & Generate"
      />
    </>
  );
}
