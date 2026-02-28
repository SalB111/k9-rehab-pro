import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import S from "../../constants/styles";
import { WIZARD_STEPS } from "./constants";

export default function WizardProgress({ wizardStep, goToStep }) {
  return (
    <>
      <style>{`
        @keyframes wizardPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(57,255,126,0.5), 0 0 18px rgba(57,255,126,0.2); }
          50% { box-shadow: 0 0 14px rgba(57,255,126,0.7), 0 0 28px rgba(57,255,126,0.35), 0 0 40px rgba(57,255,126,0.1); }
        }
        @keyframes neonFlatline {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div style={S.wizardProgress}>
        {WIZARD_STEPS.map((s, i) => {
          const state = wizardStep > s.num ? "done" : wizardStep === s.num ? "active" : "pending";
          return (
            <React.Fragment key={s.num}>
              {i > 0 && <div style={S.wizardLine(wizardStep > s.num)} />}
              <div style={S.wizardStep(state)}
                onClick={() => goToStep(s.num)}>
                <div style={S.wizardDot(state)}>
                  {state === "done" ? <FiCheckCircle size={16} /> : s.num}
                </div>
                <span>{s.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
