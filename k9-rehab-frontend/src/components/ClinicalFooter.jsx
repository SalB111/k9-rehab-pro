import React from "react";
import C from "../constants/colors";
import S from "../constants/styles";

/**
 * ClinicalFooter — Unified branding & legal footer for K9 Rehab Pro.
 *
 * Variants:
 *   "card"   — Navy card with white text (About, Dashboard)
 *   "bar"    — Navy bar with two-column layout (Settings)
 *   "subtle" — Transparent, faded center-aligned text
 *
 * Always includes CDSS classification + veterinary review disclaimer.
 */
export default function ClinicalFooter({ variant = "card" }) {
  if (variant === "bar") {
    return (
      <div style={{
        marginTop: 16, padding: "12px 20px", borderRadius: 8,
        background: C.navy, color: "rgba(255,255,255,0.6)",
        fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>K9 Rehab Pro™ · Clinical Decision-Support System · ACVSMR-Aligned Methodology</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>
          Evidence-Based Exercise Library · ACVSMR-Aligned Protocols · Millis & Levine
        </span>
      </div>
    );
  }

  if (variant === "subtle") {
    return (
      <div style={{ textAlign: "center", padding: "16px 0 8px", opacity: 0.5 }}>
        <div style={{ fontSize: 9, color: C.textLight, letterSpacing: "0.5px" }}>
          K9 Rehab Pro™ · Clinical Decision-Support System · ACVSMR Diplomate Methodology · Millis & Levine · Evidence-Based Protocols
        </div>
      </div>
    );
  }

  // Default: "card" — navy card
  return (
    <div style={{ ...S.card, background: C.navy, border: `2px solid ${C.navy}`, textAlign: "center", padding: "20px 28px" }}>
      <div style={{ fontSize: 11, color: "#FFFFFF", lineHeight: 1.7 }}>
        K9 Rehab Pro™ · Clinical Decision-Support System · ACVSMR-Aligned Methodology
        <br />Evidence-Based Canine Rehabilitation Exercise Protocols
        <br />All protocols require licensed veterinary review and approval before clinical application.
      </div>
    </div>
  );
}
