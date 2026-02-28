import React from "react";
import { FiLock, FiShield, FiCheckCircle, FiClock } from "react-icons/fi";
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

      <SettingsSection id="sec_compliance" open={isOpen("sec_compliance")} onToggle={toggleSection} icon={FiShield} title="Compliance & Security Roadmap">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["AES-256 Encryption at Rest", false, "Planned — requires encrypted database layer"],
            ["TLS 1.3 Encryption in Transit", false, "Planned — requires SSL certificate and HTTPS configuration"],
            ["Role-Based Access Control (RBAC)", false, "Planned — requires authentication system implementation"],
            ["Zero-Knowledge Sensitive Fields", false, "Planned — requires field-level encryption architecture"],
            ["Automated Backup & Disaster Recovery", false, "Planned — requires cloud infrastructure and scheduling"],
            ["State Veterinary Board Alignment", true, "Active — protocol logic follows state practice act guidelines"],
            ["No Data Sold, Shared, or Used for Advertising", true, "Active — all data remains local to this installation"],
          ].map(([label, ok, statusNote]) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderRadius: 8,
              background: ok ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${ok ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</span>
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{statusNote}</div>
              </div>
              <span style={sty.statusBadge(ok)}>
                {ok ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                {ok ? " Active" : " Planned"}
              </span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 16, padding: "14px 16px", borderRadius: 8,
          background: C.navy, color: "#fff", fontSize: 11, lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: C.teal }}>
            Current Security Status — Transparency Notice
          </div>
          K9 Rehab Pro currently operates as a locally-hosted clinical decision-support system. All patient and client data is stored locally on this device using SQLite and is not transmitted to external servers. No data is sold, shared, or used for advertising. Enterprise-grade security features including encryption at rest, TLS in transit, role-based access control, and HIPAA-grade data protection are on the development roadmap and will be implemented prior to multi-user or cloud deployment. All clinical protocols comply with evidence-based veterinary rehabilitation standards (Millis & Levine, ACVSMR). This platform supports clinicians — it does not replace licensed veterinary judgment.
        </div>
      </SettingsSection>

      <AuditLogViewer />

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Security Settings</button>
      </div>
    </div>
  );
}
