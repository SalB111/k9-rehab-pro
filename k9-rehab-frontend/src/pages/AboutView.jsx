import React from "react";
import { FiBookOpen, FiShield, FiActivity, FiLock } from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import ClinicalFooter from "../components/ClinicalFooter";
import { useTr } from "../i18n/useTr";

// ─────────────────────────────────────────────
// ABOUT VIEW — Brand Story & Platform Info
// ─────────────────────────────────────────────
function AboutView() {
  const tr = useTr();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ ...S.card, border: `1px solid ${C.border}`, borderTop: `4px solid ${C.teal}`, padding: "32px 36px", textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: "0 0 8px",
          fontFamily: "'Exo 2', 'Orbitron', sans-serif", letterSpacing: "2px" }}>
          K9 REHAB PRO
        </h1>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 16, textShadow: `0 0 8px ${C.tealLight}` }}>
          {tr("Clinical Decision-Support System for Evidence-Based Canine AND FELINE Rehabilitation Protocols")}
        </div>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, maxWidth: 650, margin: "0 auto" }}>
          {tr("K9 Rehab Pro is a veterinary rehabilitation platform built for the rehabilitation nurses and veterinary professionals who dedicate their careers to helping dogs and cats recover, move, and live better.")}{" "}
          {tr("Designed from the ground up using evidence-based methodology, it transforms clinical expertise into structured, repeatable rehabilitation protocols.")}
        </p>
      </div>

      <div style={S.grid(2)}>
        <div style={{ ...S.card, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiBookOpen size={16} style={{ color: C.teal }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text }}>{tr("Evidence-Based Foundation")}</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
            {tr("Every protocol, exercise, and progression rule is sourced from peer-reviewed veterinary rehabilitation literature.")}{" "}
            {tr("Primary references include")} Millis &amp; Levine's <em>Canine Rehabilitation and Physical Therapy</em> (2nd ed., Elsevier 2014), Zink &amp; Van Dyke's <em>Canine Sports Medicine and Rehabilitation</em> (2nd ed., Wiley 2018), {tr("and ACVSMR position statements.")}
          </p>
        </div>

        <div style={{ ...S.card, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiShield size={16} style={{ color: C.teal }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text }}>{tr("CDSS Classification")}</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
            {tr("K9 Rehab Pro is classified as a Clinical Decision-Support System (CDSS).")}{" "}
            {tr("It assists licensed veterinary professionals in generating rehabilitation protocols but does not replace clinical judgment, establish a VCPR, or provide diagnoses.")}{" "}
            {tr("All output requires veterinary review and approval.")}
          </p>
        </div>

        <div style={{ ...S.card, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiActivity size={16} style={{ color: C.green }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text }}>{tr("Clinical Intelligence")}</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
            {tr("ACVSMR-aligned rehabilitation protocols with phase-gated progression.")}{" "}
            {tr("A comprehensive exercise library classified by intervention type, phase appropriateness, and evidence grade.")}{" "}
            {tr("Automated contraindication enforcement and safety screening powered by")} B.E.A.U. — {tr("the Biomedical Evidence-Based Analytical Unit.")}
          </p>
        </div>

        <div style={{ ...S.card, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiLock size={16} style={{ color: C.amber }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text }}>{tr("Data Privacy")}</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
            {tr("Patient records are stored within your deployment.")}{" "}
            B.E.A.U. {tr("clinical queries are processed via the Anthropic API — no patient-identifying data is included in AI requests.")}{" "}
            {tr("No data is sold to third parties or used for advertising.")}{" "}
            {tr("The platform is designed with HIPAA-aligned principles and supports state veterinary medical board recordkeeping requirements.")}
          </p>
        </div>
      </div>

      <div style={{ ...S.card, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 12 }}>{tr("Target Environments")}</h3>
        <div style={S.grid(4)}>
          {[
            ["General Practice", "DVM-supervised rehabilitation for primary care clinics"],
            ["Rehabilitation Centers", "CCRP/CCRT-certified facilities with full modality access"],
            ["Specialty Hospitals", "Integration with surgical, neurology, and oncology teams"],
            ["Universities", "Clinical teaching and research under faculty supervision"],
          ].map(([title, desc]) => (
            <div key={title} style={{ padding: "12px 14px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 900, fontSize: 12, color: C.text, marginBottom: 4 }}>{tr(title)}</div>
              <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.5 }}>{tr(desc)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder & Copyright */}
      <div style={{ ...S.card, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.navy}`, padding: "24px 28px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 8 }}>{tr("About the Founder")}</h3>
        <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: "0 0 12px" }}>
          K9 Rehab Pro&trade; {tr("was built by")} <strong style={{ color: C.text }}>Salvatore Bonanno</strong>, {tr("a Canine Rehabilitation Nurse with over 30 years of experience in animal medicine and veterinary nursing.")}{" "}
          {tr("For the past decade, canine and feline rehabilitation became his passion and purpose.")}
        </p>
        <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: "0 0 12px" }}>
          {tr("Salvatore served as the lead")} &mdash; {tr("and sole")} &mdash; {tr("rehabilitation nurse at BluePearl Veterinary Partners (formerly Lauderdale Veterinary Specialists) in Fort Lauderdale, Florida from 2016 to 2024, where he built and ran the entire rehabilitation department from the ground up.")}
        </p>
        <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: "0 0 12px" }}>
          {tr("Every protocol, phase gate, clinical rule, and exercise in this platform was born from real patients, real cases, and real outcomes.")}{" "}
          K9 Rehab Pro&trade; {tr("is not theoretical")} &mdash; {tr("it is 8 years of hands-on rehabilitation nursing transformed into intelligent clinical software.")}
        </p>
        <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: "0 0 12px" }}>
          B.E.A.U. &mdash; {tr("the Biomedical Evidence-based Analytical Unit")} &mdash; {tr("is the AI engine powering every protocol recommendation, grounded in the science of Dr. Millis, Dr. Levine, and their colleagues in veterinary rehabilitation.")}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.navy }}>&copy; 2025-2026 Salvatore Bonanno</div>
            <div style={{ fontSize: 10, color: C.textLight }}>{tr("All rights reserved. Unauthorized use, reproduction, or distribution is prohibited.")}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.textLight }}>K9 Rehab Pro&trade;</div>
            <div style={{ fontSize: 10, color: C.textLight }}>{tr("Powered by")} B.E.A.U.</div>
          </div>
        </div>
      </div>

      <ClinicalFooter variant="card" />
    </div>
  );
}

export default AboutView;
