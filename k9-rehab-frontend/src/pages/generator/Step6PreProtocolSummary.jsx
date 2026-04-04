import React from "react";
import { FiCheckCircle, FiAlertTriangle, FiActivity, FiUser, FiTarget, FiHeart, FiShield, FiSettings } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import { CONDITIONS, FELINE_DIAGNOSES } from "./constants";

// ── Summary card ──
function SummaryCard({ title, icon: Icon, color, children }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 12, padding: "16px 20px",
      border: `1px solid ${C.border}`, borderTop: `3px solid ${color}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={15} style={{ color }} />
        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

// ── Data row ──
function DataRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${C.border}20` }}>
      <span style={{ fontSize: 11, color: C.textLight, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: color || C.text }}>{value || "—"}</span>
    </div>
  );
}

export default function Step6PreProtocolSummary({ form, allExercises, complianceAgreed, setComplianceAgreed, complianceOpen, setComplianceOpen, generate, error, goToStep, loading }) {

  // Resolve diagnosis label
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

  // Missing fields
  const missing = [];
  if (!form.patientName?.trim()) missing.push("Patient Name");
  if (!form.diagnosis) missing.push("Diagnosis");
  if (!form.affectedRegion) missing.push("Affected Region");
  if (!form.treatmentApproach) missing.push("Treatment Approach");

  // Safety flags
  const flags = [];
  if (form.allergies) flags.push({ label: `Allergy: ${form.allergies}`, color: C.red });
  if (form.temperament && form.temperament !== "Cooperative") flags.push({ label: `Temperament: ${form.temperament}`, color: C.amber });
  if (form.incisionStatus && form.incisionStatus !== "Clean/Dry/Intact" && form.incisionStatus !== "Healed" && form.incisionStatus !== "N/A") flags.push({ label: `Incision: ${form.incisionStatus}`, color: C.red });
  if (+form.painLevel >= 7) flags.push({ label: `Pain ${form.painLevel}/10 — Severe`, color: C.red });
  if (+form.lamenessGrade >= 4) flags.push({ label: `Lameness Grade ${form.lamenessGrade}/5`, color: C.red });
  if (form.neuroDeepPain === "Absent") flags.push({ label: "Absent Deep Pain — Guarded Prognosis", color: C.red });

  // Modality count
  const modalities = ["modalityUWTM", "modalityLaser", "modalityTENS", "modalityNMES", "modalityTherapeuticUS", "modalityShockwave", "modalityCryotherapy", "modalityHeatTherapy", "modalityPulsedEMF"].filter(k => form[k]);

  // Goals count
  const goalCount = (form.problems || []).length + (form.stGoals || []).length + (form.ltGoals || []).length;

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <SectionHead icon={FiCheckCircle} title="Pre-Protocol Summary — Review & Generate" />
        <p style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>Review all selections before generating the exercise protocol. Verify accuracy — this information drives the protocol engine.</p>
      </div>

      {/* Missing fields warning */}
      {missing.length > 0 && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: `${C.red}08`, border: `2px solid ${C.red}40`, display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <FiAlertTriangle size={18} style={{ color: C.red, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>Required Fields Missing</div>
            <div style={{ fontSize: 12, color: C.red }}>{missing.join(" · ")}</div>
          </div>
        </div>
      )}

      {/* ═══ Summary Cards Grid ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Patient */}
        <SummaryCard title="Patient" icon={FiUser} color="#0EA5E9">
          <DataRow label="Name" value={form.patientName} />
          <DataRow label="Species" value={form.species || "Canine"} />
          <DataRow label="Breed" value={form.breed} />
          <DataRow label="Age" value={form.age ? `${form.age} years` : null} />
          <DataRow label="Weight" value={form.weightLbs ? `${form.weightLbs} lbs` : form.weightKg ? `${form.weightKg} kg` : null} />
          <DataRow label="Sex" value={form.sex} />
          <DataRow label="Temperament" value={form.temperament} color={form.temperament === "Aggressive" || form.temperament === "Reactive" ? C.red : undefined} />
        </SummaryCard>

        {/* Diagnosis & Assessment */}
        <SummaryCard title="Diagnosis & Assessment" icon={FiTarget} color="#1D9E75">
          <DataRow label="Diagnosis" value={diagLabel} />
          <DataRow label="Region" value={form.affectedRegion} />
          <DataRow label="Pain" value={form.painLevel !== "" ? `${form.painLevel}/10` : null} color={+form.painLevel >= 7 ? C.red : +form.painLevel >= 4 ? C.amber : C.green} />
          <DataRow label="Lameness" value={form.lamenessGrade !== "" ? `${form.lamenessGrade}/5` : null} color={+form.lamenessGrade >= 4 ? C.red : +form.lamenessGrade >= 2 ? C.amber : C.green} />
          <DataRow label="Mobility" value={form.mobilityLevel} />
          <DataRow label="BCS" value={`${form.bodyConditionScore}/9`} />
          {form.mmtGrade && <DataRow label="MMT Grade" value={`${form.mmtGrade}/5`} />}
        </SummaryCard>

        {/* Treatment Plan */}
        <SummaryCard title="Treatment Plan" icon={FiHeart} color="#8B5CF6">
          <DataRow label="Approach" value={form.treatmentApproach ? form.treatmentApproach.charAt(0).toUpperCase() + form.treatmentApproach.slice(1) : null} />
          <DataRow label="Vet Recommendation" value={form.vetRecommendation} />
          <DataRow label="Owner Decision" value={form.ownerElection} />
          {form.treatmentApproach === "surgical" && (
            <>
              <DataRow label="Surgery Type" value={form.surgeryType} />
              <DataRow label="Surgery Date" value={form.surgeryDate} />
              <DataRow label="POD" value={form.postOpDay ? `Day ${form.postOpDay}` : null} />
              <DataRow label="Incision" value={form.incisionStatus} color={form.incisionStatus?.includes("Infection") || form.incisionStatus?.includes("Dehiscence") ? C.red : undefined} />
            </>
          )}
          <DataRow label="Weight Bearing" value={form.weightBearingStatus} />
        </SummaryCard>
      </div>

      {/* Second row: Protocol Config + Goals + Safety */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Protocol Config */}
        <SummaryCard title="Protocol Configuration" icon={FiSettings} color="#BA7517">
          <DataRow label="Duration" value={form.protocolLength ? `${form.protocolLength} weeks` : null} />
          <DataRow label="Frequency" value={form.sessionFrequency ? `${form.sessionFrequency}x/week` : null} />
          <DataRow label="Compliance" value={form.ownerCompliance} />
          <DataRow label="HEP" value={form.homeExerciseProgram ? "Included" : "Not included"} color={form.homeExerciseProgram ? C.green : C.textLight} />
          <DataRow label="Aquatic" value={form.aquaticAccess ? "Available" : "Not available"} color={form.aquaticAccess ? C.teal : C.textLight} />
          <DataRow label="Modalities" value={`${modalities.length} selected`} />
        </SummaryCard>

        {/* Rehab Goals */}
        <SummaryCard title="Rehabilitation Goals" icon={FiTarget} color="#0EA5E9">
          <DataRow label="Problems" value={`${(form.problems || []).length} identified`} />
          <DataRow label="Short-Term Goals" value={`${(form.stGoals || []).length} set`} />
          <DataRow label="Long-Term Goals" value={`${(form.ltGoals || []).length} set`} />
          <DataRow label="Outcome Measures" value={`${(form.outcomeMeasures || []).length} selected`} />
          <DataRow label="Prognosis" value={form.prognosisRating} color={form.prognosisRating === "Poor" ? C.red : form.prognosisRating === "Guarded" ? C.amber : C.green} />
          <DataRow label="Discharge Criteria" value={`${(form.dischargeCriteria || []).length} defined`} />
        </SummaryCard>

        {/* Safety Flags */}
        <SummaryCard title="Safety Flags" icon={FiShield} color={flags.length > 0 ? "#A32D2D" : "#1D9E75"}>
          {flags.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
              <FiCheckCircle size={16} style={{ color: C.green }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>No active safety flags</span>
            </div>
          ) : (
            flags.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: `1px solid ${C.border}20` }}>
                <FiAlertTriangle size={12} style={{ color: f.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: f.color }}>{f.label}</span>
              </div>
            ))
          )}
        </SummaryCard>
      </div>

      {/* Exercise Library count */}
      <div style={{ background: C.surface, borderRadius: 10, padding: "12px 20px", marginBottom: 16, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: C.textLight }}>Exercise Library Available</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.teal }}>{allExercises.length} exercises</span>
      </div>

      {/* ═══ Compliance & Generate ═══ */}
      <div style={{ background: C.surface, borderRadius: 12, padding: "20px 24px", marginBottom: 16, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.teal}` }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={complianceAgreed} onChange={e => setComplianceAgreed(e.target.checked)}
            style={{ accentColor: C.teal, width: 20, height: 20, cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
              I acknowledge the{" "}
              <span onClick={e => { e.preventDefault(); setComplianceOpen(o => !o); }}
                style={{ color: C.teal, textDecoration: "underline", cursor: "pointer" }}>
                K9 Rehab Pro — Compliance & Data Protection Notice
              </span>
            </span>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 6, lineHeight: 1.6 }}>
              This is a Clinical Decision-Support System (CDSS). All generated protocols must be reviewed and approved by a licensed veterinarian before clinical application. The platform does not diagnose, prescribe, or replace veterinary judgment.
            </div>
          </div>
        </label>
        {complianceOpen && (
          <div style={{ marginTop: 14, padding: "16px 18px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.text, lineHeight: 1.7, maxHeight: 200, overflowY: "auto" }}>
            <p><strong>1. CDSS Classification:</strong> K9 Rehab Pro is a Clinical Decision-Support System for post-diagnostic rehabilitation planning only.</p>
            <p><strong>2. Veterinary Oversight:</strong> All protocols require licensed veterinarian review and approval.</p>
            <p><strong>3. Data Privacy:</strong> Patient data stored within your deployment. B.E.A.U. AI queries processed via Anthropic API — no PII shared.</p>
            <p><strong>4. Evidence Standards:</strong> Millis & Levine, ACVSMR, peer-reviewed veterinary literature.</p>
            <p style={{ marginTop: 8, fontStyle: "italic", color: C.textLight }}>&copy; 2025-2026 Salvatore Bonanno. All rights reserved.</p>
          </div>
        )}
      </div>

      {/* ═══ GENERATE BUTTON ═══ */}
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
        <button
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
            padding: "20px 64px", borderRadius: 14, border: `2px solid ${C.green}`,
            fontSize: 18, fontWeight: 900, letterSpacing: "0.5px",
            cursor: complianceAgreed && missing.length === 0 ? "pointer" : "not-allowed",
            background: complianceAgreed && missing.length === 0
              ? `linear-gradient(135deg, ${C.green} 0%, #34D399 100%)`
              : C.border,
            color: complianceAgreed && missing.length === 0 ? "#fff" : C.textLight,
            boxShadow: complianceAgreed && missing.length === 0
              ? "0 0 24px rgba(16,185,129,0.5), 0 0 48px rgba(16,185,129,0.3), 0 0 72px rgba(16,185,129,0.15)"
              : "none",
            transition: "all 0.3s ease",
            opacity: complianceAgreed && missing.length === 0 ? 1 : 0.5,
          }}
          onMouseEnter={e => {
            if (complianceAgreed && missing.length === 0) {
              e.currentTarget.style.boxShadow = "0 0 36px rgba(16,185,129,0.7), 0 0 72px rgba(16,185,129,0.4), 0 0 108px rgba(16,185,129,0.2)";
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
            }
          }}
          onMouseLeave={e => {
            if (complianceAgreed && missing.length === 0) {
              e.currentTarget.style.boxShadow = "0 0 24px rgba(16,185,129,0.5), 0 0 48px rgba(16,185,129,0.3), 0 0 72px rgba(16,185,129,0.15)";
              e.currentTarget.style.transform = "translateY(0) scale(1)";
            }
          }}
          onClick={generate}
          disabled={loading || !complianceAgreed || missing.length > 0}
        >
          <FiActivity size={20} />
          {loading ? "GENERATING PROTOCOL..." : "GENERATE EXERCISE PROTOCOL"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: `${C.red}08`, border: `2px solid ${C.red}40`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <FiAlertTriangle size={18} style={{ color: C.red }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{error}</span>
        </div>
      )}

      {/* Back */}
      <div style={{ display: "flex", justifyContent: "flex-start", padding: "10px 0" }}>
        <button style={S.btn("ghost")} onClick={() => goToStep(5)}>← Back to Protocol Parameters</button>
      </div>
    </>
  );
}
