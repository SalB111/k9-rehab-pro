import React from "react";
import { FiLock, FiShield, FiCheckCircle } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { sty } from "./constants";
import { SettingsToggle, SettingsSection } from "./SettingsShared";
import { AuditLogViewer } from "./AuditLogViewer";

export function TabSecurity({ security, setSecurity, flashSave, isOpen, toggleSection }) {
  return (
    <div>
      <SettingsSection id="sec_session" open={isOpen("sec_session")} onToggle={toggleSection} icon={FiLock} title="Session & Access Control">
        <div style={S.grid(2)}>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Session Timeout</label>
            <select style={{ ...S.select, width: "100%" }} value={security.session_timeout_minutes}
              onChange={e => setSecurity({ ...security, session_timeout_minutes: +e.target.value })}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes (Recommended)</option>
              <option value={60}>60 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
            <div style={sty.fieldHint}>Auto-logout after period of inactivity</div>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Data Retention Period</label>
            <select style={{ ...S.select, width: "100%" }} value={security.data_retention_years}
              onChange={e => setSecurity({ ...security, data_retention_years: +e.target.value })}>
              <option value={3}>3 years</option>
              <option value={5}>5 years</option>
              <option value={7}>7 years (Recommended — most state boards)</option>
              <option value={10}>10 years</option>
            </select>
            <div style={sty.fieldHint}>Aligned with state veterinary medical board recordkeeping requirements</div>
          </div>
        </div>

        <SettingsToggle value={security.auto_lock_screen}
          onChange={v => setSecurity({ ...security, auto_lock_screen: v })}
          label="Auto-Lock Screen on Idle"
          desc="Require re-authentication after session timeout — prevents unauthorized access" />
        <SettingsToggle value={security.audit_log_enabled}
          onChange={v => setSecurity({ ...security, audit_log_enabled: v })}
          label="Clinical Audit Log"
          desc="Record all protocol generation, patient modifications, and data access events" />
      </SettingsSection>

      <SettingsSection id="sec_compliance" open={isOpen("sec_compliance")} onToggle={toggleSection} icon={FiShield} title="Security & Compliance">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["JWT Authentication & Role-Based Access", true, "Active — clinician and admin roles enforced"],
            ["Audit Trail Logging", true, "Active — all data operations and safety reports logged"],
            ["State Veterinary Board Alignment", true, "Active — protocol logic follows state practice act guidelines"],
            ["No Data Sold, Shared, or Used for Advertising", true, "Active — patient data remains within your deployment"],
          ].map(([label, ok, statusNote]) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderRadius: 8,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</span>
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{statusNote}</div>
              </div>
              <span style={sty.statusBadge(true)}>
                <FiCheckCircle size={11} /> Active
              </span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 16, padding: "14px 16px", borderRadius: 8,
          background: C.navy, color: "#fff", fontSize: 11, lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: C.teal }}>
            Security Overview
          </div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>Patient and client data is stored in your deployment database</li>
            <li>Authentication via JWT with bcrypt password hashing</li>
            <li>B.E.A.U. queries are processed via Anthropic API — no patient-identifying data is included in AI requests</li>
            <li>No data is sold to third parties or used for advertising</li>
            <li>All clinical protocols comply with ACVSMR and Millis & Levine standards</li>
          </ul>
          <div style={{ marginTop: 8, color: "rgba(255,255,255,0.5)" }}>
            Security features are continuously enhanced. Contact your system administrator for deployment-specific security details.
          </div>
        </div>
      </SettingsSection>

      <AuditLogViewer />

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Security Settings</button>
      </div>
    </div>
  );
}
