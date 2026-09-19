import React, { useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiLock, FiTrash2, FiUser } from "react-icons/fi";
import C from "../../constants/colors";
import { SAFETY_GATE_LABELS, CAPABILITY_LABELS } from "./v2api";

// ─────────────────────────────────────────────
// CLINICIAN REVIEW & APPROVAL
//
// K9 generates a recommendation; the clinician decides. Approval is the point
// where a recommendation becomes a prescription, so this screen has to show:
//
//   - which safety gates fired, and what they restricted
//   - what the engine warned about
//   - which exercises the engine chose, and which a clinician added by hand
//     (those did NOT pass the safety gates)
//   - whether the signed-in user actually holds authority to approve, and on
//     what basis — licensure or a current credential
// ─────────────────────────────────────────────

const card = {
  background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 10, padding: 16,
};

export default function RecommendationReview({
  version, authority, onApprove, onHandoff, onRemoveExercise, busy,
}) {
  const [note, setNote] = useState("");
  if (!version) return null;

  const firedGates = Object.entries(version.derived_flags || {})
    .filter(([, fired]) => fired === true)
    .map(([gate]) => gate);

  const warnings = version.engine_warnings || [];
  const unstated = version.unstated_clinic_capabilities || [];

  const byWeek = (version.exercises || []).reduce((acc, ex) => {
    (acc[ex.week_number] = acc[ex.week_number] || []).push(ex);
    return acc;
  }, {});

  const isApproved = version.status === "APPROVED" || version.status === "HANDED_OFF";
  const canApprove = authority?.allowed === true;
  const editable = !isApproved && version.status !== "SUPERSEDED";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>
              Version {version.version_number} · {version.protocol_type}
            </div>
            <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
              {version.total_weeks} weeks · {version.frequency || "frequency not set"} ·{" "}
              {(version.exercises || []).length} exercises
            </div>
          </div>
          <span
            style={{
              alignSelf: "flex-start", fontSize: 11, padding: "4px 10px", borderRadius: 999,
              background: isApproved ? C.greenBg : C.tealLight,
              color: isApproved ? C.green : C.tealDark, fontWeight: 600,
            }}
          >
            {version.status}
          </span>
        </div>
      </div>

      {/* ── Safety gates that fired ──────────────────────────────────────── */}
      {firedGates.length > 0 && (
        <div style={{ ...card, borderColor: C.amber, background: C.amberBg }}>
          <Title icon={FiAlertTriangle} color={C.amber} text="Safety restrictions applied" />
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {firedGates.map((g) => (
              <div key={g} style={{ fontSize: 13, color: C.text }}>
                {SAFETY_GATE_LABELS[g] || g}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: C.textMid }}>
            These were applied by the clinical engine from today's assessment. They restrict what
            this protocol may contain.
          </div>
        </div>
      )}

      {/* ── Engine warnings ──────────────────────────────────────────────── */}
      {warnings.length > 0 && (
        <div style={card}>
          <Title icon={FiInfo} color={C.teal} text="Clinical notes from the engine" />
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
            {warnings.map((w, i) => (
              <li key={i} style={{ fontSize: 13, color: C.textMid }}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Equipment gaps: silently withheld therapy ─────────────────────── */}
      {unstated.length > 0 && (
        <div style={{ ...card, borderColor: C.amber }}>
          <Title icon={FiAlertTriangle} color={C.amber} text="Equipment not declared" />
          <div style={{ marginTop: 8, fontSize: 13, color: C.textMid }}>
            Exercises requiring {unstated.map((k) => CAPABILITY_LABELS[k] || k).join(", ")} were
            withheld from this protocol because the clinic has not recorded whether it has them.
          </div>
        </div>
      )}

      {/* ── Prescribed exercises ─────────────────────────────────────────── */}
      <div style={card}>
        <Title icon={FiCheckCircle} color={C.teal} text="Prescribed exercises" />
        <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
          {Object.keys(byWeek)
            .sort((a, b) => Number(a) - Number(b))
            .map((week) => (
              <div key={week}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Week {week}
                  {byWeek[week][0]?.phase && ` · ${byWeek[week][0].phase}`}
                </div>
                <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
                  {byWeek[week].map((ex) => (
                    <div
                      key={ex.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px", borderRadius: 6,
                        background: ex.origin === "CLINICIAN" ? C.purpleBg : C.bg,
                        border: `1px solid ${ex.origin === "CLINICIAN" ? C.purpleLight : C.borderLight}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                          {ex.exercise_name || ex.exercise_code}
                          {ex.origin === "CLINICIAN" && (
                            <span
                              title="Added by a clinician — this did not pass the engine's safety gates"
                              style={{
                                marginLeft: 8, fontSize: 10, padding: "2px 7px", borderRadius: 999,
                                background: C.purple, color: "#fff", display: "inline-flex",
                                alignItems: "center", gap: 4,
                              }}
                            >
                              <FiUser size={9} /> clinician-added
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                          {[
                            ex.dosage_override,
                            !ex.dosage_override && ex.sets,
                            !ex.dosage_override && ex.reps && `${ex.reps} reps`,
                            ex.frequency,
                            ex.duration_minutes && `${ex.duration_minutes} min`,
                          ].filter(Boolean).join(" · ") || "no dosage recorded"}
                        </div>
                        {ex.red_flags && (
                          <div style={{ fontSize: 11, color: C.amber, marginTop: 3 }}>
                            Stop if: {Array.isArray(ex.red_flags) ? ex.red_flags.join("; ") : ex.red_flags}
                          </div>
                        )}
                      </div>
                      {editable && (
                        <button
                          type="button"
                          onClick={() => onRemoveExercise(ex.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight }}
                          title="Remove from this protocol"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── Approval ─────────────────────────────────────────────────────── */}
      <div style={{ ...card, borderColor: canApprove ? C.teal : C.border }}>
        <Title icon={canApprove ? FiCheckCircle : FiLock} color={canApprove ? C.teal : C.textLight} text="Clinician approval" />

        {isApproved ? (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <div style={{ color: C.green, fontWeight: 600 }}>
              Approved by {version.approval?.approver_username}
              {version.approval?.approver_credential && `, ${version.approval.approver_credential}`}
            </div>
            <div style={{ color: C.textMid, marginTop: 3 }}>
              {version.approval?.approved_at} · basis: {version.approval?.approval_basis?.toLowerCase()}
            </div>
            {version.status === "APPROVED" && (
              <button
                type="button" disabled={busy} onClick={onHandoff}
                style={primaryBtn(busy)}
              >
                Send to B.E.A.U. Home
              </button>
            )}
            {version.status === "HANDED_OFF" && (
              <div style={{ marginTop: 10, fontSize: 13, color: C.green }}>
                Live at home. The owner's app holds this exact version.
              </div>
            )}
          </div>
        ) : !canApprove ? (
          <div style={{ marginTop: 10, fontSize: 13, color: C.textMid }}>
            {authority?.explanation ||
              "You do not hold authority to approve a clinical protocol."}
            <div style={{ marginTop: 8, fontSize: 12, color: C.textLight }}>
              You can still record assessments and prepare this protocol. An attending veterinarian
              or a credentialed rehabilitation practitioner must approve it.
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 8 }}>
              Approving creates a permanent, versioned clinical record signed in your name
              {authority.credential ? ` (${authority.credential})` : ""}. It cannot be edited
              afterwards — a change creates a new version.
            </div>
            <textarea
              rows={2} placeholder="Approval note (optional)"
              value={note} onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", fontSize: 13, resize: "vertical",
                border: `1px solid ${C.border}`, borderRadius: 6, background: C.surface, color: C.text,
              }}
            />
            <button
              type="button" disabled={busy} onClick={() => onApprove(note)}
              style={primaryBtn(busy)}
            >
              {busy ? "Approving…" : "Approve this protocol"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Title({ icon: Icon, color, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon size={15} style={{ color }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {text}
      </span>
    </div>
  );
}

const primaryBtn = (busy) => ({
  marginTop: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600,
  borderRadius: 6, border: "none", cursor: busy ? "not-allowed" : "pointer",
  background: busy ? C.textLight : C.teal, color: "#fff",
});
