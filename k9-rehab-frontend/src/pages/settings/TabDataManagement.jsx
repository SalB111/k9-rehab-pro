import React, { useState } from "react";
import { FiDownload, FiUpload, FiDatabase, FiAlertTriangle } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { API } from "../../api/axios";
import { sty } from "./constants";
import { SettingsSection } from "./SettingsShared";

export function TabDataManagement({ isOpen, toggleSection }) {
  // ── Phase 1D: 3-step Danger Zone confirmation ──
  // Step 1: open modal (warning)
  // Step 2: type "DELETE ALL" exactly to enable final button
  // Step 3: click final button — logs to console + shows toast; no backend call yet
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteToast, setDeleteToast] = useState(null);
  const canDelete = deleteConfirmText === "DELETE ALL";

  const executeDelete = () => {
    if (!canDelete) return;
    console.warn("[Danger Zone] User requested permanent data deletion — client-side stub only. No backend DELETE executed.");
    setDeleteModalOpen(false);
    setDeleteConfirmText("");
    setDeleteToast({
      type: "info",
      message: "Deletion request logged. Contact your administrator to complete the operation. No data has been modified."
    });
    setTimeout(() => setDeleteToast(null), 6000);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteConfirmText("");
  };

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
          <button
            onClick={() => setDeleteModalOpen(true)}
            style={{ ...S.btn("danger"), padding: "8px 16px", fontSize: 12 }}>
            Request Data Deletion
          </button>
        </div>
      </SettingsSection>

      {/* ── 3-step Danger Zone modal ── */}
      {deleteModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.65)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={closeDeleteModal}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 12,
            maxWidth: 560, width: "100%",
            boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "18px 24px",
              background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
              color: "#fff",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <FiAlertTriangle size={28} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.3px" }}>PERMANENT DATA DELETION</div>
                <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>This action cannot be reversed</div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "22px 24px" }}>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, marginBottom: 14 }}>
                You are about to permanently delete:
              </div>
              <ul style={{ margin: "0 0 16px", paddingLeft: 20, fontSize: 12, color: C.text, lineHeight: 1.8 }}>
                <li>All patient demographics and medical records</li>
                <li>All generated rehabilitation protocols</li>
                <li>All SOAP notes and progress assessments</li>
                <li>All exercise logs and outcome tracking</li>
                <li>All B.E.A.U. chat sessions and AI-generated content</li>
                <li>All clinical audit log entries</li>
              </ul>
              <div style={{
                padding: "12px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderLeft: "3px solid #dc2626",
                borderRadius: 6,
                fontSize: 11,
                color: "#991b1b",
                marginBottom: 18,
                lineHeight: 1.6,
              }}>
                <strong>Regulatory warning:</strong> Deleting clinical records may violate your state veterinary medical board's recordkeeping requirements (typically 5-7 year retention).
                Ensure you have exported data for compliance records before proceeding.
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                To confirm, type <span style={{ color: "#dc2626", fontFamily: "monospace", background: "#fef2f2", padding: "2px 6px", borderRadius: 3 }}>DELETE ALL</span> below:
              </div>
              <input
                type="text"
                autoFocus
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE ALL to enable the delete button"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 13,
                  fontFamily: "monospace",
                  border: `2px solid ${canDelete ? "#dc2626" : C.border}`,
                  borderRadius: 6,
                  outline: "none",
                  background: canDelete ? "#fef2f2" : "#fff",
                  color: C.text,
                }}
              />
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "14px 24px",
              borderTop: `1px solid ${C.border}`,
              background: "#f9fafb",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}>
              <button
                onClick={closeDeleteModal}
                style={{
                  padding: "10px 22px",
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                CANCEL
              </button>
              <button
                onClick={executeDelete}
                disabled={!canDelete}
                style={{
                  padding: "10px 22px",
                  background: canDelete ? "#dc2626" : "#fca5a5",
                  border: "none",
                  color: "#fff",
                  borderRadius: 6,
                  cursor: canDelete ? "pointer" : "not-allowed",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  opacity: canDelete ? 1 : 0.7,
                }}>
                ⚠ PERMANENTLY DELETE ALL DATA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Danger Zone toast notification ── */}
      {deleteToast && (
        <div style={{
          position: "fixed", top: 80, right: 24, zIndex: 600,
          padding: "14px 20px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderLeft: "4px solid #2563eb",
          borderRadius: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          fontSize: 12,
          color: "#1e40af",
          maxWidth: 380,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Deletion Request Logged</div>
            <div style={{ fontWeight: 400, lineHeight: 1.5 }}>{deleteToast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
