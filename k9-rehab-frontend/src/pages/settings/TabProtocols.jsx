import React from "react";
import { FiClock, FiAlertTriangle } from "react-icons/fi";
import C from "../../constants/colors";
import { SettingsSection } from "./SettingsShared";

/**
 * THE ONE PROTOCOL DEFAULT THAT DOES ANYTHING.
 *
 * This tab used to offer nine: progression_philosophy, session_duration,
 * sessions_per_week, pain_threshold_hold, weight_bearing_threshold,
 * include_hep, default_outcome_measure, auto_progression_gates,
 * recheck_interval_weeks.
 *
 * NONE OF THEM WAS READ ANYWHERE IN THE BACKEND. They were controls that
 * looked like settings and changed nothing — the same state the equipment tab
 * was in. They are removed rather than hidden: anything genuinely wanted can
 * come back once something consumes it.
 *
 * What replaces them is the default that was missing while nine fakes sat
 * here. Until 2026-09-26 EVERY protocol was generated at 8 weeks, because the
 * frontend hardcoded `protocolLength: "8"` and the adapter fell back to 8 —
 * while tplo/ivdd/oa/geriatric had each declared 16/12/16/16 that nothing
 * read. A sixteen-week TPLO came out as eight, with the whole progression
 * compressed into half its time.
 *
 * Leaving this blank is the RIGHT answer for most practices: each condition
 * then gets the length its own protocol documents. A number here overrides all
 * four at once, which is why the consequence is spelled out on screen rather
 * than left to be discovered.
 */
export function TabProtocols({ form, setForm, isOpen, toggleSection }) {
  const value = form.default_protocol_weeks ?? "";

  return (
    <div>
      <div style={{
        padding: "12px 16px", marginBottom: 12, borderRadius: 8,
        background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.35)",
        fontSize: 12, color: C.navy,
      }}>
        A clinician can always set a different length for an individual patient.
        This is only what B.E.A.U. uses when nobody has.
      </div>

      <SettingsSection
        id="proto_length" icon={FiClock} title="Default protocol length"
        open={isOpen("proto_length")} onToggle={toggleSection}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select
            value={value}
            onChange={(e) => setForm((p) => ({
              ...p,
              default_protocol_weeks: e.target.value === "" ? null : Number(e.target.value),
            }))}
            style={{
              fontSize: 13, padding: "7px 10px", borderRadius: 6,
              border: `1px solid ${C.border}`, minWidth: 320,
            }}
          >
            <option value="">Use each protocol&rsquo;s own length (recommended)</option>
            {[8, 10, 12, 14, 16, 20, 24].map((w) => (
              <option key={w} value={w}>{w} weeks — for every condition</option>
            ))}
          </select>
          <span style={{ fontSize: 11, color: C.muted }}>
            saved with the clinic profile
          </span>
        </div>

        {/* What "the protocol's own length" actually means, by name. A blank
            dropdown tells a clinician nothing about what they are choosing. */}
        <div style={{ marginTop: 12, fontSize: 11.5, color: C.text }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Each protocol&rsquo;s documented length:
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", color: C.muted }}>
            <span>TPLO <strong style={{ color: C.navy }}>16</strong></span>
            <span>IVDD <strong style={{ color: C.navy }}>12</strong></span>
            <span>Osteoarthritis <strong style={{ color: C.navy }}>16</strong></span>
            <span>Geriatric <strong style={{ color: C.navy }}>16</strong></span>
          </div>
        </div>

        {value !== "" && (
          <div style={{
            marginTop: 12, padding: "9px 13px", borderRadius: 6, fontSize: 11.5,
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.4)",
            color: C.amber, display: "flex", alignItems: "flex-start", gap: 7,
          }}>
            <FiAlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>
              <strong>{value} weeks will be used for every condition</strong>, overriding all
              four documented lengths above. Leave this blank unless the practice has a
              reason to run every protocol to the same length.
            </span>
          </div>
        )}
      </SettingsSection>

      <div style={{ marginTop: 12, fontSize: 10.5, color: C.muted, fontStyle: "italic" }}>
        A length set for an individual patient always wins over this. A protocol
        length is the clinical arc of the programme, not a commitment to attend —
        an owner who stops early continues at home through B.E.A.U.
      </div>
    </div>
  );
}
