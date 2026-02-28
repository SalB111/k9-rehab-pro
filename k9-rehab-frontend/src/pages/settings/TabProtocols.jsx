import React from "react";
import { FiActivity, FiClock, FiAlertTriangle, FiFileText } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { sty } from "./constants";
import { SettingsToggle, SettingsSection } from "./SettingsShared";

export function TabProtocols({ protocolDefaults, setProtocolDefaults, flashSave, isOpen, toggleSection }) {
  return (
    <div>
      <SettingsSection id="proto_philosophy" open={isOpen("proto_philosophy")} onToggle={toggleSection} icon={FiActivity} title="Clinical Progression Philosophy">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Progression Philosophy</label>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            {[
              ["conservative", "Conservative", "Slower advancement, extended phase durations, prioritize safety"],
              ["moderate", "Moderate (Recommended)", "Balanced approach per Millis & Levine guidelines"],
              ["progressive", "Progressive", "Accelerated timelines for athletic or high-demand patients"],
            ].map(([val, label, desc]) => (
              <div key={val} onClick={() => setProtocolDefaults({ ...protocolDefaults, progression_philosophy: val })}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                  background: protocolDefaults.progression_philosophy === val ? C.teal : "rgba(255,255,255,0.05)",
                  color: "#fff",
                  border: protocolDefaults.progression_philosophy === val ? `2px solid ${C.teal}` : `1px solid rgba(255,255,255,0.2)`,
                  transition: "all 0.15s",
                }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="proto_session" open={isOpen("proto_session")} onToggle={toggleSection} icon={FiClock} title="Session Configuration">
        <div style={S.grid(3)}>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Default Session Duration</label>
            <select style={{ ...S.select, width: "100%" }} value={protocolDefaults.session_duration}
              onChange={e => setProtocolDefaults({ ...protocolDefaults, session_duration: +e.target.value })}>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes (Recommended)</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes (Extended)</option>
            </select>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Sessions Per Week</label>
            <select style={{ ...S.select, width: "100%" }} value={protocolDefaults.sessions_per_week}
              onChange={e => setProtocolDefaults({ ...protocolDefaults, sessions_per_week: +e.target.value })}>
              <option value={1}>1x weekly</option>
              <option value={2}>2x weekly</option>
              <option value={3}>3x weekly (Recommended)</option>
              <option value={5}>5x weekly (Intensive)</option>
            </select>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Recheck Interval</label>
            <select style={{ ...S.select, width: "100%" }} value={protocolDefaults.recheck_interval_weeks}
              onChange={e => setProtocolDefaults({ ...protocolDefaults, recheck_interval_weeks: +e.target.value })}>
              <option value={1}>Every 1 week</option>
              <option value={2}>Every 2 weeks (Recommended)</option>
              <option value={4}>Every 4 weeks</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="proto_thresholds" open={isOpen("proto_thresholds")} onToggle={toggleSection} icon={FiAlertTriangle} title="Safety Thresholds & Gating">
        <div style={S.grid(2)}>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Pain Score Threshold for Progression Hold</label>
            <select style={{ ...S.select, width: "100%" }} value={protocolDefaults.pain_threshold_hold}
              onChange={e => setProtocolDefaults({ ...protocolDefaults, pain_threshold_hold: +e.target.value })}>
              {[2,3,4,5,6].map(n => (
                <option key={n} value={n}>VAS {n}/10 {n === 4 ? "(Recommended)" : ""}</option>
              ))}
            </select>
            <div style={sty.fieldHint}>Protocol progression halts if patient pain exceeds this threshold</div>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Weight-Bearing Requirement</label>
            <select style={{ ...S.select, width: "100%" }} value={protocolDefaults.weight_bearing_threshold}
              onChange={e => setProtocolDefaults({ ...protocolDefaults, weight_bearing_threshold: e.target.value })}>
              <option value="non_weight_bearing">Non-Weight-Bearing (NWB)</option>
              <option value="toe_touch">Toe-Touch Weight Bearing (TTWB)</option>
              <option value="partial">Partial Weight Bearing (PWB) — Default</option>
              <option value="full">Full Weight Bearing (FWB)</option>
            </select>
            <div style={sty.fieldHint}>Minimum weight-bearing status before advancing to next phase</div>
          </div>
        </div>

        <SettingsToggle value={protocolDefaults.auto_progression_gates}
          onChange={v => setProtocolDefaults({ ...protocolDefaults, auto_progression_gates: v })}
          label="Automatic Progression Gates"
          desc="Require explicit clinician approval before advancing between protocol phases" />
      </SettingsSection>

      <SettingsSection id="proto_output" open={isOpen("proto_output")} onToggle={toggleSection} icon={FiFileText} title="Protocol Output Preferences">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Default Outcome Measure</label>
          <select style={{ ...S.select, width: "100%" }} value={protocolDefaults.default_outcome_measure}
            onChange={e => setProtocolDefaults({ ...protocolDefaults, default_outcome_measure: e.target.value })}>
            <option value="cbpi">CBPI — Canine Brief Pain Inventory (Brown et al. 2008)</option>
            <option value="load">LOAD — Liverpool Osteoarthritis in Dogs</option>
            <option value="csu">CSU — Colorado State University Pain Scale</option>
            <option value="hcpi">HCPI — Helsinki Chronic Pain Index</option>
          </select>
          <div style={sty.fieldHint}>Validated instrument used for longitudinal outcome tracking</div>
        </div>

        <SettingsToggle value={protocolDefaults.include_hep}
          onChange={v => setProtocolDefaults({ ...protocolDefaults, include_hep: v })}
          label="Include Home Exercise Program (HEP)"
          desc="Auto-generate a client-safe take-home exercise sheet with each protocol" />
      </SettingsSection>

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Protocol Defaults</button>
      </div>
    </div>
  );
}
