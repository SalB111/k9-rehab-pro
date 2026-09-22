import React from "react";
import { FiAlertTriangle, FiCheck, FiShield } from "react-icons/fi";
import C from "../../constants/colors";

// ─────────────────────────────────────────────
// SAFETY GATES — the values this protocol rests on
//
// The engine's restriction fields fail UNSAFE: omit one and the restriction
// never fires. So the intake proposal fills each at its most cautious value
// and the server refuses approval until a clinician has confirmed every one
// that applies to this case.
//
// This panel is where that confirming happens. It is NOT the control — the
// control is in protocol-store, and approval is refused there whatever this
// screen does. What this does is make the refusal predictable: a clinician
// should never meet it by surprise at the moment they try to sign.
//
// Only the gates relevant to this patient appear. A TPLO four days post-op
// sees weight-bearing and incision status; it does not see an IVDD grade.
// Showing all twelve regardless is how a verification step turns back into
// the form it replaced.
// ─────────────────────────────────────────────

/** Plain-language names. These are read by a clinician, not by the engine. */
const GATE_LABEL = {
  weightBearingStatus: "Weight-bearing status",
  incisionStatus: "Incision status",
  complicationsNoted: "Post-operative complications",
  crateRestRequired: "Crate rest required",
  eCollarRequired: "E-collar required",
  mmtGrade: "Muscle strength (MMT)",
  ivddGrade: "IVDD grade",
  oaStage: "Osteoarthritis stage",
  neuroProprioception: "Proprioception",
  neuroWithdrawal: "Withdrawal reflex",
  neuroDeepPain: "Deep pain sensation",
  neuroMotorGrade: "Motor function",
};

/** What each gate governs, so a clinician knows what they are signing for. */
const GATE_EFFECT = {
  weightBearingStatus: "Gates every loading exercise.",
  incisionStatus: "A dehisced incision blocks generation outright.",
  complicationsNoted: "Routes to a conservative protocol.",
  crateRestRequired: "Excludes free movement and independent ambulation.",
  eCollarRequired: "Excludes exercises needing head and neck freedom.",
  mmtGrade: "≤1/5 restricts to passive ROM, NMES and assisted standing.",
  ivddGrade: "Grade IV/V locks the protocol to Phase 1 neurological support.",
  oaStage: "Kellgren-Lawrence 4 excludes impact loading.",
  neuroProprioception: "Drives proprioceptive retraining selection.",
  neuroWithdrawal: "Contributes to the neurological phase lock.",
  neuroDeepPain: "Absent deep pain restricts to passive supportive care.",
  neuroMotorGrade: "Non-ambulatory excludes independent gait work.",
};

function display(value) {
  if (value === null || value === undefined || value === "") return "Not assessed";
  if (value === true) return "Yes";
  if (value === false) return "No";
  return String(value);
}

export default function SafetyGates({ gates = [], values = {}, confirmed = {}, onConfirm, readOnly }) {
  if (!gates.length) return null;

  const outstanding = gates.filter((f) => confirmed[f] !== true);
  const done = gates.length - outstanding.length;

  return (
    <section
      style={{
        border: `1px solid ${outstanding.length ? C.amber : C.green}`,
        background: outstanding.length ? C.amberBg : C.greenBg,
        borderRadius: 10, padding: 16, marginTop: 16,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <FiShield size={15} style={{ color: outstanding.length ? C.amber : C.green }} />
        <h3 style={{
          fontSize: 13, fontWeight: 700, margin: 0, color: C.navy,
          textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          Safety gates
        </h3>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
          background: outstanding.length ? C.amber : C.green, color: "#fff",
        }}>
          {done} of {gates.length} confirmed
        </span>
      </header>

      <p style={{ fontSize: 12.5, color: C.textMid, margin: "8px 0 0", lineHeight: 1.6, maxWidth: "66ch" }}>
        These are the values this protocol was built on, proposed at their most
        cautious setting. Each one restricts what the engine will prescribe, so
        each needs your confirmation before you can approve. Anything wrong here
        goes back to <strong>Today&rsquo;s update</strong> — correcting it there
        regenerates the protocol.
      </p>

      <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
        {gates.map((f) => {
          const isOn = confirmed[f] === true;
          return (
            <div
              key={f}
              style={{
                display: "flex", alignItems: "flex-start", gap: 11,
                padding: "11px 12px", borderRadius: 8,
                background: C.surface,
                border: `1px solid ${isOn ? C.green : C.border}`,
              }}
            >
              <button
                type="button"
                disabled={readOnly}
                aria-pressed={isOn}
                aria-label={`Confirm ${GATE_LABEL[f] || f}`}
                onClick={() => onConfirm && onConfirm(f, !isOn)}
                style={{
                  flexShrink: 0, width: 22, height: 22, marginTop: 1,
                  borderRadius: 5, cursor: readOnly ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isOn ? C.green : C.surface,
                  border: `1.5px solid ${isOn ? C.green : C.border}`,
                }}
              >
                {isOn && <FiCheck size={14} color="#fff" />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>
                    {GATE_LABEL[f] || f}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: C.navy,
                    padding: "1px 7px", borderRadius: 4, background: C.borderLight,
                  }}>
                    {display(values[f])}
                  </span>
                </div>
                {GATE_EFFECT[f] && (
                  <div style={{ fontSize: 11.5, color: C.textLight, marginTop: 3, lineHeight: 1.5 }}>
                    {GATE_EFFECT[f]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {outstanding.length > 0 && (
        <div style={{
          display: "flex", gap: 8, alignItems: "flex-start",
          marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.amber}`,
        }}>
          <FiAlertTriangle size={14} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.55 }}>
            Approval is blocked until {outstanding.length === 1
              ? "this gate is"
              : `all ${outstanding.length} remaining gates are`} confirmed.
          </span>
        </div>
      )}
    </section>
  );
}
