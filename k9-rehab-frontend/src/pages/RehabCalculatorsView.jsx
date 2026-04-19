// Weight Calculator — companion rehab calculator suite deployed at
// rehab-calculators.vercel.app. Opens in a new tab because the Vercel
// default X-Frame-Options: DENY blocks iframe embedding. Once that
// header is overridden on the rehab-calculators side, this can be
// swapped back to an inline iframe.

import { FiExternalLink, FiPercent } from "react-icons/fi";
import C from "../constants/colors";

const CALCULATOR_URL = "https://rehab-calculators.vercel.app/";

export default function RehabCalculatorsView() {
  const openCalculator = () => {
    window.open(CALCULATOR_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "calc(100vh - 120px)", padding: 32,
    }}>
      <div style={{
        maxWidth: 640, width: "100%",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderTop: `4px solid ${C.teal}`,
        borderRadius: 12,
        padding: "40px 48px",
        textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: `${C.teal}15`,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <FiPercent size={28} style={{ color: C.teal }} />
        </div>

        <div style={{
          fontSize: 11, fontWeight: 800, color: C.teal,
          textTransform: "uppercase", letterSpacing: "1.5px",
          marginBottom: 8,
        }}>
          Clinical Decision Support
        </div>

        <h2 style={{
          margin: "0 0 12px", fontSize: 26, fontWeight: 800, color: C.text,
        }}>
          Weight Calculator
        </h2>

        <p style={{
          margin: "0 0 8px", fontSize: 14, color: C.textLight, lineHeight: 1.6,
        }}>
          Evidence-based canine &amp; feline clinical calculators — BCS &amp; ideal
          weight, caloric needs (RER / MER), goniometric ROM, UWTM buoyancy,
          CBPI, FMPI, and Feline Grimace Scale.
        </p>

        <p style={{
          margin: "0 0 28px", fontSize: 12, color: C.textMid, lineHeight: 1.5,
        }}>
          Sourced from Millis &amp; Levine, WSAVA, NRC 2006, AAHA, Brown et al.,
          Benito et al., and Evangelista et al.
        </p>

        <button
          onClick={openCalculator}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "12px 28px", borderRadius: 8,
            background: `linear-gradient(135deg, ${C.teal}, ${C.navy})`,
            color: "#fff", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 700, letterSpacing: ".3px",
            boxShadow: `0 4px 12px ${C.teal}33`,
          }}
        >
          Open Weight Calculator
          <FiExternalLink size={14} />
        </button>

        <div style={{
          marginTop: 20, fontSize: 11, color: C.textLight,
        }}>
          Opens in a new tab
        </div>
      </div>
    </div>
  );
}
