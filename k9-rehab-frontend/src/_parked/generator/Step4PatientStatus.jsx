import React from "react";
import { FiScissors, FiShield, FiActivity, FiHeart } from "react-icons/fi";
import { TbStethoscope } from "react-icons/tb";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import { useTr } from "../../i18n/useTr";

const navyCard = { background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" };

/* Status block wrapper */
function StatusBlock({ icon: Icon, title, accentColor, children }) {
  const tr = useTr();
  return (
    <div style={{
      background: C.navy, border: `1.5px solid ${accentColor}22`, borderRadius: 10,
      padding: "16px 18px", position: "relative", overflow: "hidden",
    }}>
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accentColor }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, marginTop: 2 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `${accentColor}22`, border: `1.5px solid ${accentColor}44`,
        }}>
          <Icon size={14} style={{ color: accentColor }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.8px" }}>{tr(title)}</span>
      </div>
      {children}
    </div>
  );
}

export default function Step4PatientStatus({ form, setField, goToStep }) {
  const tr = useTr();
  return (
    <>
      {/* ═══════════ SECTION: PATIENT TREATMENT STATUS ═══════════ */}
      <div style={navyCard}>
        <SectionHead icon={TbStethoscope} title="Patient Treatment Status" />
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>
          {tr("Document clinical recommendations and owner decisions for each treatment pathway. Complete the relevant block(s) for this patient.")}
        </div>
      </div>

      {/* 2x2 Grid of Status Blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

        {/* ── BLOCK 1: SURGICAL ── */}
        <StatusBlock icon={FiScissors} title="Surgical" accentColor={C.red}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>{tr("Post-operative rehabilitation pathway")}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {form.surgeryType && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.redBg, color: C.red }}>
                {form.surgeryType}
              </span>
            )}
            {form.surgeryDate && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.bg, color: C.text }}>
                {tr("Date:")} {form.surgeryDate}
              </span>
            )}
            {form.postOpDay && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.amberBg, color: C.amber }}>
                {tr("POD")} {form.postOpDay}
              </span>
            )}
            {form.surgeon && (
              <span style={{ fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 4, background: C.bg, color: C.text }}>
                {tr("Surgeon:")} {form.surgeon}
              </span>
            )}
            {form.surgicalFacility && (
              <span style={{ fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 4, background: C.bg, color: C.text }}>
                {tr("Facility:")} {form.surgicalFacility}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Clinical Recommendation")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.surgicalClinicalRec || ""} onChange={e => setField("surgicalClinicalRec", e.target.value)}
              placeholder={tr("e.g. TPLO recommended for complete CCL rupture, good surgical candidate")} />
          </div>
          <div>
            <label style={S.label}>{tr("Owner Decision")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.surgicalOwnerDecision || ""} onChange={e => setField("surgicalOwnerDecision", e.target.value)}
              placeholder={tr("e.g. Owner elected surgery, scheduled for next week")} />
          </div>
        </StatusBlock>

        {/* ── BLOCK 2: NON-SURGICAL / CONSERVATIVE ── */}
        <StatusBlock icon={FiShield} title="Non-Surgical / Conservative" accentColor={C.teal}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>{tr("Conservative management without surgical intervention")}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {form.diagnosis && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: C.teal }}>
                {tr("Dx:")} {form.diagnosis}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Conservative Approach Rationale")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.conservativeRationale || ""} onChange={e => setField("conservativeRationale", e.target.value)}
              placeholder={tr("e.g. Partial CCL tear, young patient, good muscle mass — conservative trial 8 weeks before surgical re-evaluation")} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Clinical Recommendation")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.conservativeClinicalRec || ""} onChange={e => setField("conservativeClinicalRec", e.target.value)}
              placeholder={tr("e.g. Structured rehab program with weight management, modality support, and re-evaluation at 4 weeks")} />
          </div>
          <div>
            <label style={S.label}>{tr("Owner Decision")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.conservativeOwnerDecision || ""} onChange={e => setField("conservativeOwnerDecision", e.target.value)}
              placeholder={tr("e.g. Owner prefers conservative approach, committed to rehab schedule")} />
          </div>
        </StatusBlock>

        {/* ── BLOCK 3: POST-SURGICAL RECOVERY ── */}
        <StatusBlock icon={FiActivity} title="Post-Surgical Recovery" accentColor={C.green}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>{tr("Current recovery status and milestones")}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {form.postOpDay && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: C.greenBg, color: C.green }}>
                {tr("POD")} {form.postOpDay}
              </span>
            )}
            {form.incisionStatus && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                background: form.incisionStatus === "Clean/Dry/Intact" ? C.greenBg : C.redBg,
                color: form.incisionStatus === "Clean/Dry/Intact" ? C.green : C.red }}>
                {tr("Incision:")} {tr(form.incisionStatus)}
              </span>
            )}
            {form.weightBearingStatus && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.amberBg, color: C.amber }}>
                {tr("WB:")} {tr(form.weightBearingStatus)}
              </span>
            )}
          </div>

          {/* Current Recovery Status */}
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Current Recovery Status")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.recoveryStatus || ""} onChange={e => setField("recoveryStatus", e.target.value)}
              placeholder={tr("e.g. Progressing well, toe-touching weight bearing, mild swelling resolved, starting active ROM")} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Recovery Milestones")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 44, resize: "vertical", fontFamily: "inherit" }}
              value={form.recoveryMilestones || ""} onChange={e => setField("recoveryMilestones", e.target.value)}
              placeholder={tr("e.g. Sutures removed POD 14, cleared for controlled leash walks POD 21")} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Clinical Recommendation")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.postSurgRecoveryClinicalRec || ""} onChange={e => setField("postSurgRecoveryClinicalRec", e.target.value)}
              placeholder={tr("e.g. Progress to Phase 2 exercises, begin underwater treadmill, increase walk duration")} />
          </div>
          <div>
            <label style={S.label}>{tr("Owner Decision")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 44, resize: "vertical", fontFamily: "inherit" }}
              value={form.postSurgRecoveryOwnerDecision || ""} onChange={e => setField("postSurgRecoveryOwnerDecision", e.target.value)}
              placeholder={tr("e.g. Owner agrees to increase frequency to 2x/week, reports improved comfort at home")} />
          </div>
        </StatusBlock>

        {/* ── BLOCK 4: PALLIATIVE / COMFORT CARE ── */}
        <StatusBlock icon={FiHeart} title="Palliative / Comfort Care" accentColor={C.purple}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>{tr("Quality of life focused — comfort and function preservation")}</div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Comfort Priorities")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.palliativeComfortPriorities || ""} onChange={e => setField("palliativeComfortPriorities", e.target.value)}
              placeholder={tr("e.g. Pain management, mobility preservation, appetite maintenance, owner bonding time")} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Quality of Life Assessment")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.palliativeQoL || ""} onChange={e => setField("palliativeQoL", e.target.value)}
              placeholder={tr("e.g. HHHHHMM Scale: Hurt 7, Hunger 8, Hydration 9, Hygiene 7, Happiness 6, Mobility 4, More Good Days 6 = 47/70")} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>{tr("Clinical Recommendation")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
              value={form.palliativeClinicalRec || ""} onChange={e => setField("palliativeClinicalRec", e.target.value)}
              placeholder={tr("e.g. Gentle passive ROM, heat therapy, massage, controlled short walks — focus on comfort not progression")} />
          </div>
          <div>
            <label style={S.label}>{tr("Owner Decision")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 44, resize: "vertical", fontFamily: "inherit" }}
              value={form.palliativeOwnerDecision || ""} onChange={e => setField("palliativeOwnerDecision", e.target.value)}
              placeholder={tr("e.g. Owner understands prognosis, focused on quality time, agrees to comfort-focused protocol")} />
          </div>
        </StatusBlock>
      </div>

      {/* ── Additional Clinical Notes ── */}
      <div style={navyCard}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          {tr("Additional Clinical Notes")}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
          {tr("Expanded notes for multi-pathway patients, interdisciplinary communication, or complex cases")}
        </div>
        <textarea
          style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
          value={form.patientStatusNotes || ""} onChange={e => setField("patientStatusNotes", e.target.value)}
          placeholder={tr("e.g. Patient presenting for rehab after owner initially declined surgery 6 weeks ago. Conservative management partially effective — owner now reconsidering surgical option if rehab plateau reached at 4-week re-eval.")}
        />
      </div>

      {/* Step 4 Patient Status navigation */}
      <StepNavButtons
        onBack={() => goToStep(3)}
        backLabel={"← Back to Diagnostic Workup"}
        onNext={() => goToStep(5)}
        nextLabel="Next: Rehab Goals"
      />
    </>
  );
}
