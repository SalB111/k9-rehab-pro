import React from "react";
import { FiHome, FiSmartphone, FiVideo } from "react-icons/fi";
import C from "../../constants/colors";
import { DIFFICULTY_LABELS } from "./v2api";

// ─────────────────────────────────────────────
// HOME PROGRAMME — what came back from the client
//
// Deliberately styled apart from the clinical sections. Everything here is
// observed by a pet owner, and an owner's pain estimate is not a clinician's
// pain score. If the two looked alike on screen a clinician would eventually
// read one as the other, and the trend that drives the next protocol would
// quietly stop meaning what it appears to mean.
//
// Every figure is labelled at the point it is shown, not once in a footnote.
// ─────────────────────────────────────────────

const panel = {
  background: C.purpleBg,
  border: `1px solid ${C.purpleLight}`,
  borderRadius: 10,
  padding: 16,
};

function Figure({ label, value, sub, tone }) {
  return (
    <div style={{ minWidth: 112 }}>
      <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: tone || C.text, marginTop: 2 }}>
        {value === null || value === undefined ? "—" : value}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.textMid, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

export default function HomeProgramme({ home, videoRequests = [], onRequestVideo }) {
  if (!home) return null;

  const { adherence, engagement } = home;
  const hasActivity = adherence && adherence.session_count > 0;

  return (
    <div style={panel}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <FiHome size={15} style={{ color: C.purple }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Home programme
        </span>
        {/* Stated up front, not buried. */}
        <span
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: "2px 8px",
            borderRadius: 999, background: C.purple, color: "#fff",
          }}
        >
          OWNER-REPORTED
        </span>
      </div>

      <div style={{ fontSize: 12, color: C.textMid, marginTop: 6 }}>
        Observed at home by the owner. Not a clinical assessment, and not part of the
        measurement trends above.
      </div>

      {!hasActivity ? (
        <div style={{ marginTop: 12, fontSize: 13, color: C.textMid }}>
          {engagement?.ever_opened ? (
            <>
              The client has opened the app but has not started a session.
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
                Usually difficulty or uncertainty about what to do — worth asking rather than
                assuming non-compliance.
              </div>
            </>
          ) : (
            <>
              The client has not opened the app yet.
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
                A different problem from starting and stopping: nobody has reached them.
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 22, marginTop: 14 }}>
            <Figure
              label="Sessions"
              value={adherence.session_count}
              sub={`${adherence.completed} completed · ${adherence.abandoned} abandoned`}
            />
            <Figure
              label="Exercises done"
              value={
                adherence.exercise_completion_rate === null
                  ? "—"
                  : `${Math.round(adherence.exercise_completion_rate * 100)}%`
              }
              tone={
                adherence.exercise_completion_rate !== null && adherence.exercise_completion_rate < 0.5
                  ? C.amber
                  : undefined
              }
            />
            <Figure
              label="Pain (owner)"
              value={adherence.owner_reported_pain.latest}
              sub={
                adherence.owner_reported_pain.readings > 1
                  ? `was ${adherence.owner_reported_pain.first} at first report`
                  : "owner's estimate"
              }
              tone={adherence.owner_reported_pain.latest >= 7 ? C.red : undefined}
            />
            <Figure label="Last session" value={adherence.last_session_date} />
          </div>

          {(adherence.sessions_rated_too_hard > 0 || adherence.red_flag_sessions > 0) && (
            <div style={{ marginTop: 14, display: "grid", gap: 6, fontSize: 13 }}>
              {adherence.sessions_rated_too_hard > 0 && (
                <div style={{ color: C.amber }}>
                  {adherence.sessions_rated_too_hard} session
                  {adherence.sessions_rated_too_hard === 1 ? "" : "s"} rated{" "}
                  <strong>{DIFFICULTY_LABELS.TOO_HARD}</strong> by the owner
                </div>
              )}
              {adherence.red_flag_sessions > 0 && (
                <div style={{ color: C.red }}>
                  {adherence.red_flag_sessions} session
                  {adherence.red_flag_sessions === 1 ? "" : "s"} where the owner saw a stop condition
                </div>
              )}
            </div>
          )}

          {/* Reported, not interpreted. The conclusion is the clinician's. */}
          {adherence.exercise_completion_rate !== null && adherence.exercise_completion_rate < 0.5 && (
            <div style={{ marginTop: 12, fontSize: 12, color: C.textMid, fontStyle: "italic" }}>
              Under half the prescribed exercises are being completed.
            </div>
          )}
        </>
      )}

      {/* ── Engagement — a separate signal from adherence ─────────────────── */}
      {engagement && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.purpleLight}`,
                      display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textMid }}>
          <FiSmartphone size={13} style={{ color: C.textLight }} />
          {engagement.ever_opened
            ? `App last opened ${engagement.last_app_open}`
            : "App never opened"}
        </div>
      )}

      {/* ── Video ────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.purpleLight}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <FiVideo size={14} style={{ color: C.textLight }} />
          {videoRequests.length === 0 ? (
            <span style={{ fontSize: 12, color: C.textMid }}>No video requested.</span>
          ) : (
            <div style={{ display: "grid", gap: 4, flex: 1 }}>
              {videoRequests.map((v) => (
                <div key={v.id} style={{ fontSize: 12, color: C.textMid }}>
                  <strong style={{ color: C.text }}>{v.exercise_code || "general"}</strong>
                  {" — "}{v.status.toLowerCase()}
                  {v.owner_note && <span style={{ fontStyle: "italic" }}> · “{v.owner_note}”</span>}
                </div>
              ))}
            </div>
          )}
          {onRequestVideo && (
            <button
              onClick={onRequestVideo}
              style={{
                marginLeft: "auto", padding: "6px 12px", fontSize: 12, fontWeight: 600,
                borderRadius: 6, cursor: "pointer",
                border: `1px solid ${C.border}`, background: C.surface, color: C.textMid,
              }}
            >
              Ask for a video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
