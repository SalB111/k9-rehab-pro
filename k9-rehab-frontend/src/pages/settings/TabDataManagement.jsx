import React from "react";
import { FiDownload, FiUpload, FiDatabase, FiAlertTriangle } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { API } from "../../api/axios";
import { sty } from "./constants";
import { SettingsSection } from "./SettingsShared";

export function TabDataManagement({ isOpen, toggleSection }) {
  return (
    <div>
      <SettingsSection id="data_export" open={isOpen("data_export")} onToggle={toggleSection} icon={FiDownload} title="Export Data">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["Export All Patient Records", "Download all patient demographics, diagnoses, and protocol history", "patients"],
            ["Export All Protocols", "Download all generated rehabilitation protocols with exercise details", "protocols"],
            ["Export Session & Outcome Data", "Download SOAP notes, CBPI scores, and progress assessments", "sessions"],
            ["Export Audit Log", "Download full audit trail for veterinary board compliance review", "audit"],
            ["Full Database Backup", "Complete encrypted backup of all system data", "full"],
          ].map(([label, desc, type]) => (
            <div key={type} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderRadius: 8,
              background: C.bg, border: `1px solid ${C.border}`,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</div>
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{desc}</div>
              </div>
              <button style={{ ...S.btn("ghost"), padding: "6px 14px", fontSize: 11 }}>
                <FiDownload size={12} /> Export
              </button>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection id="data_import" open={isOpen("data_import")} onToggle={toggleSection} icon={FiUpload} title="Import Data">
        <div style={{
          padding: "24px", borderRadius: 8, textAlign: "center",
          border: `2px dashed ${C.border}`, background: C.bg,
        }}>
          <FiUpload size={24} style={{ color: C.textLight, marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Import Patient Records</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
            Drag and drop CSV or JSON files, or click to browse
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginTop: 8 }}>
            Supported formats: CSV (patient demographics), JSON (protocol data), XLSX (bulk import)
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="data_api" open={isOpen("data_api")} onToggle={toggleSection} icon={FiDatabase} title="API & System Status">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Backend API URL</label>
          <input style={S.input} value={API} readOnly />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{
            flex: 1, padding: "12px 16px", borderRadius: 8,
            background: "rgba(16,185,129,0.12)", border: `1px solid rgba(16,185,129,0.3)`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.5px" }}>API Status</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 4 }}>Connected</div>
          </div>
          <div style={{
            flex: 1, padding: "12px 16px", borderRadius: 8,
            background: "rgba(14,165,233,0.12)", border: `1px solid rgba(14,165,233,0.3)`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.5px" }}>Exercise Library</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.teal, marginTop: 4 }}>260 Validated Exercises</div>
          </div>
          <div style={{
            flex: 1, padding: "12px 16px", borderRadius: 8,
            background: "rgba(245,158,11,0.1)", border: `1px solid rgba(245,158,11,0.3)`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: "0.5px" }}>Protocol Engine</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.amber, marginTop: 4 }}>ACVSMR-Aligned · Gated Progression</div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="data_danger" open={isOpen("data_danger")} onToggle={toggleSection} icon={FiAlertTriangle} title="Danger Zone">
        <div style={{
          padding: "16px 20px", borderRadius: 8,
          background: C.redBg, border: `1px solid rgba(220,38,38,0.2)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 8 }}>Permanent Data Deletion</div>
          <div style={{ fontSize: 12, color: C.text, marginBottom: 12, lineHeight: 1.5 }}>
            Permanently delete all patient records, protocols, session data, and audit logs. This action cannot be undone and may violate state veterinary medical board recordkeeping requirements.
          </div>
          <button style={{ ...S.btn("danger"), padding: "8px 16px", fontSize: 12 }}>
            Request Data Deletion
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
