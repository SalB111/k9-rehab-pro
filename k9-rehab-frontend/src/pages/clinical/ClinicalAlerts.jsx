import React, { useState } from "react";
import { FiAlertTriangle, FiCheck, FiClock, FiFileText, FiHome, FiUser } from "react-icons/fi";
import C from "../../constants/colors";
import { RECHECK_RESPONSES, URGENCY_LABELS } from "./v2api";

// ─────────────────────────────────────────────
// CLINICAL ALERTS
//
// Concerns that need a clinician, shown at the top of the patient — above the
// clinical detail, not below it.
//
// A concern raised by a CCRT after a session and one reported by an owner at
// home arrive in the same queue on purpose: both are somebody who saw the dog
// saying something is wrong, and both need the same answer. Who raised it is
// stated, because an owner's report is not a clinical assessment and the
// veterinarian should weigh it accordingly.
//
// The clinician can answer from here. A queue you can only read is a queue that
// grows.
// ─────────────────────────────────────────────

const URGENCY_STYLE = {
  URGENT: { bg: C.redBg, border: C.red, fg: C.red },
  SOON: { bg: C.amberBg, border: C.amber, fg: C.amber },
  ROUTINE: { bg: C.surface, border: C.border, fg: C.textMid },
};

export default function ClinicalAlerts({
  rechecks = [],
  unreviewedClinicSessions = 0,
  unreviewedHomeSessions = 0,
  ownerObservations = [],
  canRespond,
  onRespond,
  onOpenHome,
  busy,
}) {
  const feedback = ownerObservations.filter((o) => o.type !== "RED_FLAG");
  const nothingPending =
    rechecks.length === 0 &&
    unreviewedClinicSessions === 0 &&
    unreviewedHomeSessions === 0 &&
    feedback.length === 0;

  if (nothingPending) return null;

  return (
    <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
      {rechecks.map((r) => (
        <RecheckCard
          key={r.id}
          recheck={r}
          canRespond={canRespond}
          onRespond={onRespond}
          busy={busy}
        />
      ))}

      {(unreviewedClinicSessions > 0 || unreviewedHomeSessions > 0 || feedback.length > 0) && (
        <div
          style={{
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16,
            padding: "10px 14px", borderRadius: 8, fontSize: 13,
            background: C.surface, border: `1px solid ${C.border}`,
          }}
        >
          {unreviewedClinicSessions > 0 && (
            <Pending icon={FiFileText} count={unreviewedClinicSessions} noun="in-clinic session" />
          )}
          {unreviewedHomeSessions > 0 && (
            <Pending icon={FiHome} count={unreviewedHomeSessions} noun="home report" onClick={onOpenHome} />
          )}
          {feedback.map((o) => (
            <span key={o.id} style={{ display: "flex", alignItems: "center", gap: 7, color: C.textMid }}>
              <FiUser size={13} style={{ color: C.teal }} />
              <span style={{ fontStyle: "italic" }}>“{o.detail}”</span>
              <span style={{ fontSize: 11, color: C.textLight }}>— owner</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Pending({ icon: Icon, count, noun, onClick }) {
  const label = `${count} unread ${noun}${count === 1 ? "" : "s"}`;
  return (
    <span
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        color: C.textMid, cursor: onClick ? "pointer" : "default",
      }}
    >
      <Icon size={13} style={{ color: C.textLight }} />
      {label}
    </span>
  );
}

function RecheckCard({ recheck, canRespond, onRespond, busy }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("ACKNOWLEDGED");
  const [response, setResponse] = useState("");

  const palette = URGENCY_STYLE[recheck.urgency] || URGENCY_STYLE.ROUTINE;
  // An owner reporting from home is not a clinical assessment. Say so, so the
  // veterinarian weighs it as what it is.
  const fromOwner = String(recheck.raised_by || "").toLowerCase().includes("owner");
  const chosen = RECHECK_RESPONSES.find((r) => r.value === status);
  const needsReason = status === "DECLINED" && !response.trim();

  return (
    <div
      style={{
        padding: 14, borderRadius: 8,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderLeft: `4px solid ${palette.border}`,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <FiAlertTriangle size={16} style={{ color: palette.fg, flexShrink: 0, marginTop: 2 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
                padding: "2px 8px", borderRadius: 999, color: "#fff", background: palette.fg,
              }}
            >
              {URGENCY_LABELS[recheck.urgency] || recheck.urgency}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
              Recheck requested
            </span>
            {recheck.status !== "OPEN" && (
              <span style={{ fontSize: 11, color: C.textMid }}>· {recheck.status.toLowerCase()}</span>
            )}
          </div>

          <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>{recheck.reason}</div>

          <div style={{ fontSize: 12, color: C.textMid, marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
            {fromOwner ? <FiHome size={12} /> : <FiUser size={12} />}
            <span>
              {fromOwner ? "Reported by the owner at home" : `Raised by ${recheck.raised_by}`}
              {" · "}{recheck.raised_at}
            </span>
          </div>

          {fromOwner && (
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
              Owner-reported — not yet clinically assessed.
            </div>
          )}

          {canRespond ? (
            !open ? (
              <button style={respondBtn(palette)} onClick={() => setOpen(true)}>
                Respond
              </button>
            ) : (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {RECHECK_RESPONSES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setStatus(r.value)}
                      style={{
                        padding: "6px 11px", fontSize: 12, fontWeight: 600, borderRadius: 6,
                        cursor: "pointer",
                        border: `1px solid ${status === r.value ? C.teal : C.border}`,
                        background: status === r.value ? C.teal : C.surface,
                        color: status === r.value ? "#fff" : C.textMid,
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 6 }}>{chosen?.hint}</div>
                <textarea
                  rows={2}
                  placeholder={status === "DECLINED"
                    ? "Why no action is needed (required)"
                    : "Response to the person who raised this (optional)"}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 10px", fontSize: 13, resize: "vertical",
                    border: `1px solid ${needsReason ? C.red : C.border}`,
                    borderRadius: 6, background: C.surface, color: C.text,
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    disabled={busy || needsReason}
                    onClick={() => onRespond(recheck.id, status, response)}
                    style={{
                      padding: "8px 16px", fontSize: 13, fontWeight: 600, borderRadius: 6,
                      border: "none", cursor: busy || needsReason ? "not-allowed" : "pointer",
                      background: busy || needsReason ? C.textLight : C.teal, color: "#fff",
                    }}
                  >
                    <FiCheck size={12} style={{ marginRight: 5 }} />
                    Send
                  </button>
                  <button
                    onClick={() => { setOpen(false); setResponse(""); }}
                    style={{
                      padding: "8px 14px", fontSize: 13, borderRadius: 6, cursor: "pointer",
                      border: `1px solid ${C.border}`, background: C.surface, color: C.textMid,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          ) : (
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <FiClock size={12} />
              Awaiting a veterinarian or credentialed practitioner.
            </div>
          )}

          {recheck.vet_response && (
            <div
              style={{
                fontSize: 12, color: C.textMid, marginTop: 10, padding: "8px 10px",
                borderLeft: `3px solid ${C.teal}`, background: C.surface, borderRadius: 4,
              }}
            >
              <div style={{ color: C.text }}>{recheck.vet_response}</div>
              {recheck.answered_by && (
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>
                  — {recheck.answered_by}
                  {recheck.answered_at ? ` · ${recheck.answered_at}` : ""}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const respondBtn = (palette) => ({
  marginTop: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600,
  borderRadius: 6, cursor: "pointer", border: "none",
  background: palette.fg, color: "#fff",
});
