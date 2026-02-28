import React from "react";
import { FiBookOpen, FiShield, FiActivity, FiLock } from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import ClinicalFooter from "../components/ClinicalFooter";

// ─────────────────────────────────────────────
// ABOUT VIEW — Brand Story & Platform Info
// ─────────────────────────────────────────────
function AboutView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ ...S.card, border: `2px solid ${C.navy}`, borderTop: `4px solid ${C.teal}`, padding: "32px 36px", textAlign: "center" }}>
        <img src="/caduceus.png" alt="Rod of Asclepius" style={{ width: 64, height: 64, marginBottom: 12, objectFit: "contain" }} />
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.navy, margin: "0 0 8px",
          fontFamily: "'Exo 2', 'Orbitron', sans-serif", letterSpacing: "2px" }}>
          K9 REHAB PRO
        </h1>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 16, textShadow: `0 0 8px ${C.tealLight}` }}>
          Clinical Decision-Support System for Evidence-Based Canine Exercise Protocols
        </div>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, maxWidth: 650, margin: "0 auto" }}>
          K9 Rehab Pro is a veterinary rehabilitation platform built for the clinicians who dedicate their careers to helping dogs recover, move, and live better. Designed from the ground up using evidence-based methodology, it transforms clinical expertise into structured, repeatable rehabilitation protocols.
        </p>
      </div>

      <div style={S.grid(2)}>
        <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiBookOpen size={16} style={{ color: C.teal }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text }}>Evidence-Based Foundation</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
            Every protocol, exercise, and progression rule is sourced from peer-reviewed veterinary rehabilitation literature. Primary references include Millis & Levine's <em>Canine Rehabilitation and Physical Therapy</em> (2nd ed., Elsevier 2014), Zink & Van Dyke's <em>Canine Sports Medicine and Rehabilitation</em> (2nd ed., Wiley 2018), and ACVSMR position statements.
          </p>
        </div>

        <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiShield size={16} style={{ color: C.navy }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text }}>CDSS Classification</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
            K9 Rehab Pro is classified as a Clinical Decision-Support System (CDSS). It assists licensed veterinary professionals in generating rehabilitation protocols but does not replace clinical judgment, establish a VCPR, or provide diagnoses. All output requires veterinary review and approval.
          </p>
        </div>

        <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiActivity size={16} style={{ color: C.green }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text }}>Protocol Engine</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
            4 ACVSMR-aligned protocols (TPLO, IVDD, OA, Geriatric) with 4 gated phases each. 223 exercises classified by intervention type, phase appropriateness, and evidence grade. Automated contraindication enforcement prevents unsafe exercise selection.
          </p>
        </div>

        <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiLock size={16} style={{ color: C.amber }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text }}>Data Privacy</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
            All patient and client data remains local to your installation. No data is transmitted to external servers, sold to third parties, or used for AI training. The platform is designed with HIPAA-aligned principles and supports state veterinary medical board recordkeeping requirements.
          </p>
        </div>
      </div>

      <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 12 }}>Target Environments</h3>
        <div style={S.grid(4)}>
          {[
            ["General Practice", "DVM-supervised rehabilitation for primary care clinics"],
            ["Rehabilitation Centers", "CCRP/CCRT-certified facilities with full modality access"],
            ["Specialty Hospitals", "Integration with surgical, neurology, and oncology teams"],
            ["Universities", "Clinical teaching and research under faculty supervision"],
          ].map(([title, desc]) => (
            <div key={title} style={{ padding: "12px 14px", background: C.surface, borderRadius: 8, border: `2px solid ${C.navy}` }}>
              <div style={{ fontWeight: 900, fontSize: 12, color: C.text, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <ClinicalFooter variant="card" />
    </div>
  );
}

export default AboutView;
