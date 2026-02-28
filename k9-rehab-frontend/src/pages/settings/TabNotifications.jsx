import React from "react";
import { FiBell, FiClock } from "react-icons/fi";
import S from "../../constants/styles";
import { sty } from "./constants";
import { SettingsToggle, SettingsSection } from "./SettingsShared";

export function TabNotifications({ notifications, setNotifications, flashSave, isOpen, toggleSection }) {
  return (
    <div>
      <SettingsSection id="notif_clinical" open={isOpen("notif_clinical")} onToggle={toggleSection} icon={FiBell} title="Clinical Alerts">
        <SettingsToggle value={notifications.phase_progression_reminders}
          onChange={v => setNotifications({ ...notifications, phase_progression_reminders: v })}
          label="Phase Progression Review Reminders"
          desc="Alert when a patient is approaching a phase gate and needs reassessment" />
        <SettingsToggle value={notifications.recheck_reminders}
          onChange={v => setNotifications({ ...notifications, recheck_reminders: v })}
          label="Recheck Appointment Reminders"
          desc="Notify when a scheduled recheck evaluation is approaching" />
        <SettingsToggle value={notifications.pain_threshold_alerts}
          onChange={v => setNotifications({ ...notifications, pain_threshold_alerts: v })}
          label="Pain Threshold Exceeded Alerts"
          desc="Immediate alert when patient pain score exceeds the configured threshold" />
        <SettingsToggle value={notifications.protocol_expiration_alerts}
          onChange={v => setNotifications({ ...notifications, protocol_expiration_alerts: v })}
          label="Protocol Expiration Alerts"
          desc="Notify when an active protocol is nearing its end date without renewal" />
        <SettingsToggle value={notifications.session_completion_tracking}
          onChange={v => setNotifications({ ...notifications, session_completion_tracking: v })}
          label="Session Completion Tracking"
          desc="Track whether scheduled rehab sessions were completed or missed" />
      </SettingsSection>

      <SettingsSection id="notif_timing" open={isOpen("notif_timing")} onToggle={toggleSection} icon={FiClock} title="Reminder Timing">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Reminder Lead Time</label>
          <select style={{ ...S.select, width: "100%" }} value={notifications.reminder_lead_days}
            onChange={e => setNotifications({ ...notifications, reminder_lead_days: +e.target.value })}>
            <option value={1}>1 day before</option>
            <option value={2}>2 days before</option>
            <option value={3}>3 days before (Recommended)</option>
            <option value={5}>5 days before</option>
            <option value={7}>7 days before</option>
          </select>
          <div style={sty.fieldHint}>How far in advance clinical reminders are triggered</div>
        </div>
      </SettingsSection>

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Notification Settings</button>
      </div>
    </div>
  );
}
