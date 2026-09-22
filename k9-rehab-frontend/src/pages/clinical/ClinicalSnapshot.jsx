import React from "react";
import {
  FiActivity, FiAlertTriangle, FiArrowDown, FiArrowUp, FiClipboard, FiMinus,
} from "react-icons/fi";
import C from "../../constants/colors";
import { SAFETY_GATE_LABELS, CAPABILITY_LABELS } from "./v2api";
import { formatWeight } from "../../constants/weight";
import ClinicalAlerts from "./ClinicalAlerts";
import HomeProgram from "./HomeProgram";

// ─────────────────────────────────────────────
// CLINICAL SNAPSHOT
//
// What the clinician sees on opening a patient: current state, what changed
// since last time, measurement trends, and the prescription currently in force.
//
// The point is that they should NOT have to reconstruct the history. Everything
// here is read from the longitudinal record rather than re-entered.
// ─────────────────────────────────────────────

const card = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: 16,
};

/**
 * Direction arrow for a change.
 *
 * The server states the direction, because whether a rise is good depends on
 * the measure — more ROM is improvement, more pain is not. The UI must not
 * re-derive that from the sign of the number.
 */
function DirectionMark({ direction }) {
  if (!direction || direction === "unchanged") {
    return <FiMinus size={13} style={{ color: C.textLight }} title="unchanged" />;
  }
  const improving = direction.includes("improving");
  const Icon = improving ? FiArrowUp : FiArrowDown;
  return (
    <Icon
      size={13}
      style={{ color: improving ? C.green : C.amber }}
      title={direction}
    />
  );
}

function Stat({ label, value, change }) {
  return (
    <div style={{ minWidth: 118 }}>
      <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
          {value === null || value === undefined || value === "" ? "—" : value}
        </span>
        {change && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: C.textMid }}>
            <DirectionMark direction={change.direction} />
            {change.change > 0 ? `+${change.change}` : change.change}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ClinicalSnapshot({
  snapshot, patient, canRespond, onRespondToRecheck, onRequestVideo, videoRequests, busy,
  access, onIssueAccess, issuedCode,
}) {
  if (!snapshot) return null;

  const {
    last_visit: lastVisit,
    current_state: state,
    changes_since_previous_visit: changes = {},
    measurement_trends: trends = [],
    active_protocol: active,
    has_baseline: hasBaseline,
    visit_count: visitCount,
    clinic,
    open_recheck_requests: rechecks = [],
    unreviewed_session_count: unreviewedClinic = 0,
    home,
  } = snapshot;

  const unstated = clinic?.unstated_capabilities || [];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Concerns come before clinical detail. Anything needing a clinician
          today should not be reachable only by scrolling past ROM trends. */}
      <ClinicalAlerts
        rechecks={rechecks}
        unreviewedClinicSessions={unreviewedClinic}
        unreviewedHomeSessions={home?.unreviewed_session_count || 0}
        ownerObservations={home?.new_observations || []}
        canRespond={canRespond}
        onRespond={onRespondToRecheck}
        busy={busy}
      />

      {/* ── Identity + condition ─────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>
              {patient?.name || snapshot.patient?.name || "Patient"}
            </div>
            <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>
              {[patient?.breed, patient?.age && `${patient.age}y`, formatWeight(patient?.weight)]
                .filter(Boolean)
                .join(" · ")}
            </div>
            <div style={{ fontSize: 13, color: C.text, marginTop: 8, fontWeight: 600 }}>
              {patient?.condition || "No condition recorded"}
            </div>
            {patient?.affected_region && (
              <div style={{ fontSize: 12, color: C.textMid }}>{patient.affected_region}</div>
            )}
          </div>

          <div style={{ textAlign: "right", fontSize: 12, color: C.textMid }}>
            <div>{visitCount} recorded visit{visitCount === 1 ? "" : "s"}</div>
            {lastVisit && <div style={{ marginTop: 2 }}>Last: {lastVisit.visit_date}</div>}
            {lastVisit?.clinician && <div style={{ marginTop: 2 }}>by {lastVisit.clinician}</div>}
          </div>
        </div>
      </div>

      {/* ── Current clinical state ───────────────────────────────────────── */}
      <div style={card}>
        <SectionTitle icon={FiActivity} text="Current clinical state" />

        {!state ? (
          <Muted>No assessment recorded yet. Today's will be the first.</Muted>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 22, marginTop: 10 }}>
              <Stat label="Pain" value={state.pain_score} change={changes.pain_score} />
              <Stat label="Lameness" value={state.lameness_grade} change={changes.lameness_grade} />
              <Stat label="Weight bearing" value={state.weight_bearing_status} />
              <Stat label="Mobility" value={state.mobility_level} />
              {state.mmt_grade !== null && (
                <Stat label="MMT" value={state.mmt_grade} change={changes.mmt_grade} />
              )}
              {state.oa_stage !== null && (
                <Stat label="OA stage" value={state.oa_stage} change={changes.oa_stage} />
              )}
            </div>

            {/* The clinician's own verdict — never inferred from the numbers. */}
            {lastVisit?.overall_change && (
              <div style={{ marginTop: 14, fontSize: 13, color: C.textMid }}>
                Clinician's assessment last visit:{" "}
                <strong style={{ color: C.text }}>
                  {lastVisit.overall_change.replace(/_/g, " ").toLowerCase()}
                </strong>
              </div>
            )}
            {lastVisit?.clinical_observation && (
              <div style={{ marginTop: 6, fontSize: 13, color: C.textMid, fontStyle: "italic" }}>
                “{lastVisit.clinical_observation}”
              </div>
            )}

            {!hasBaseline && (
              <Muted style={{ marginTop: 12 }}>
                No previous visit to compare against — this patient has no baseline yet.
              </Muted>
            )}
          </>
        )}
      </div>

      {/* ── Measurement trends ───────────────────────────────────────────── */}
      {trends.length > 0 && (
        <div style={card}>
          <SectionTitle icon={FiActivity} text="Measurements" />
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {trends.map((t) => (
              <div
                key={`${t.measure_key}-${t.site}-${t.side}`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, fontSize: 13, paddingBottom: 8,
                  borderBottom: `1px solid ${C.borderLight}`,
                }}
              >
                <span style={{ color: C.textMid }}>
                  {t.measure_key.replace(/_/g, " ").toLowerCase()}
                  {t.site && ` · ${t.site.toLowerCase()}`}
                  {t.side && ` · ${t.side.toLowerCase()}`}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong style={{ color: C.text }}>
                    {t.latest_value}{t.unit ? ` ${t.unit}` : ""}
                  </strong>
                  {t.change !== null && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: C.textMid }}>
                      <DirectionMark direction={t.direction} />
                      {t.change > 0 ? `+${t.change}` : t.change}
                    </span>
                  )}
                  <span style={{ color: C.textLight, fontSize: 11 }}>
                    {t.reading_count} reading{t.reading_count === 1 ? "" : "s"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── What came back from home ─────────────────────────────────────── */}
      {home && (
        <HomeProgram
          home={home}
          videoRequests={videoRequests}
          onRequestVideo={onRequestVideo}
          access={access}
          onIssueAccess={onIssueAccess}
          issuedCode={issuedCode}
        />
      )}

      {/* ── Prescription currently in force ──────────────────────────────── */}
      <div style={card}>
        <SectionTitle icon={FiClipboard} text="Current prescription" />
        {!active ? (
          <Muted>No approved protocol. Nothing is prescribed for this patient.</Muted>
        ) : (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <div style={{ color: C.text }}>
              <strong>Version {active.version_number}</strong> · {active.protocol_type} ·{" "}
              {active.total_weeks} weeks · {active.frequency}
              <span
                style={{
                  marginLeft: 8, fontSize: 11, padding: "2px 8px", borderRadius: 999,
                  background: active.status === "HANDED_OFF" ? C.greenBg : C.tealLight,
                  color: active.status === "HANDED_OFF" ? C.green : C.tealDark,
                }}
              >
                {active.status === "HANDED_OFF" ? "live at home" : "approved"}
              </span>
            </div>

            {/* Gates that were in force when this was approved. At reassessment
                these are questions to re-ask, not settings to inherit. */}
            {active.active_safety_gates?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: C.textLight }}>
                  Safety gates in force
                </div>
                {active.active_safety_gates.map((g) => (
                  <div key={g} style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <FiAlertTriangle size={14} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: C.textMid }}>{SAFETY_GATE_LABELS[g] || g}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Equipment gaps ───────────────────────────────────────────────────
          Surfaced here rather than buried in settings: an unstated capability
          silently WITHHOLDS therapy from every recommendation, with no error. */}
      {unstated.length > 0 && (
        <div style={{ ...card, borderColor: C.amber, background: C.amberBg }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <FiAlertTriangle size={16} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: C.text }}>
              <strong>
                {unstated.length} piece{unstated.length === 1 ? "" : "s"} of equipment not yet declared
              </strong>
              <div style={{ marginTop: 4, color: C.textMid }}>
                Exercises needing these are withheld from every recommendation until the clinic's
                equipment is recorded — {unstated.map((k) => CAPABILITY_LABELS[k] || k).join(", ")}.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon size={15} style={{ color: C.teal }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {text}
      </span>
    </div>
  );
}

function Muted({ children, style }) {
  return (
    <div style={{ marginTop: 10, fontSize: 13, color: C.textLight, ...style }}>{children}</div>
  );
}
