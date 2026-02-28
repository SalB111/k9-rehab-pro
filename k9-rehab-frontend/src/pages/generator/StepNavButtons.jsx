import React from "react";
import { FiChevronRight } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";

export default function StepNavButtons({ onBack, backLabel, onNext, nextLabel }) {
  return (
    <div style={{ display: "flex", justifyContent: onBack ? "space-between" : "flex-end", padding: "8px 0" }}>
      {onBack && (
        <button
          style={{
            ...S.btn("ghost"), boxShadow: `0 0 8px ${C.tealLight}`,
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 14px ${C.teal}`}
          onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 8px ${C.tealLight}`}
          onClick={onBack}
        >
          {backLabel}
        </button>
      )}
      {onNext && (
        <button
          style={{
            background: C.navyMid, color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: `0 0 14px ${C.tealLight}, 0 0 28px ${C.tealLight}`,
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 20px ${C.teal}, 0 0 40px ${C.tealLight}`}
          onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 14px ${C.tealLight}, 0 0 28px ${C.tealLight}`}
          onClick={onNext}
        >
          {nextLabel} <FiChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
