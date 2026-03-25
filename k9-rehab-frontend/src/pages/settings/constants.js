import {
  FiHome, FiAward, FiTool, FiActivity, FiFileText,
  FiBell, FiShield, FiMonitor, FiDatabase,
} from "react-icons/fi";
import C from "../../constants/colors";

// ─────────────────────────────────────────────
// SETTINGS STYLES (shared across all tabs)
// ─────────────────────────────────────────────
export const settingsStyles = {
  sectionCard: {
    background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`,
    marginBottom: 12, overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  sectionHeader: (open) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", cursor: "pointer",
    background: C.navy,
    borderRadius: open ? "10px 10px 0 0" : 10,
    transition: "background 0.2s ease, color 0.2s ease",
  }),
  sectionTitle: () => ({
    display: "flex", alignItems: "center", gap: 10,
    fontSize: 13, fontWeight: 800, color: "#fff",
    letterSpacing: "0.8px", textTransform: "uppercase",
  }),
  sectionBody: { padding: "20px 24px", position: "relative", zIndex: 1, overflow: "visible", background: C.surface },
  neonLine: {
    height: 3, width: "100%", overflow: "hidden", position: "relative",
  },
  neonLineInner: {
    width: "200%", height: "100%",
    background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)",
    animation: "neonFlatline 3s linear infinite",
    boxShadow: "0 0 8px rgba(57,255,126,0.5), 0 0 16px rgba(57,255,126,0.2)",
  },
  toggleRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 0", borderBottom: `1px solid ${C.border}`,
  },
  toggleTrack: (on) => ({
    display: "inline-flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start",
    width: 40, height: 22, borderRadius: 11, cursor: "pointer",
    background: on ? C.green : C.border,
    padding: 2, transition: "all 0.2s ease",
    boxShadow: on ? "0 0 6px rgba(16,185,129,0.3)" : "none",
  }),
  toggleDot: {
    width: 18, height: 18, borderRadius: "50%",
    background: C.surface, boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
  },
};

// ─────────────────────────────────────────────
// INNER COMPONENT STYLES (shared across tabs)
// ─────────────────────────────────────────────
export const sty = {
  tabBar: {
    display: "flex", gap: 2, padding: "0 0 12px", marginBottom: 12,
    borderBottom: `1px solid ${C.border}`, flexWrap: "wrap",
  },
  tab: (active) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 6, cursor: "pointer",
    fontSize: 11, fontWeight: 600, letterSpacing: "0.3px",
    background: active ? C.navy : "transparent",
    color: active ? "#fff" : C.textMid,
    border: `1px solid ${C.border}`,
    transition: "all 0.2s ease",
  }),
  fieldRow: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 11, fontWeight: 700, color: "#fff",
    textTransform: "uppercase", letterSpacing: "0.6px",
    marginBottom: 6, display: "block",
  },
  fieldHint: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  statusBadge: (ok) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700,
    background: ok ? C.greenBg : C.redBg,
    color: ok ? C.green : C.red,
    textTransform: "uppercase", letterSpacing: "0.5px",
  }),
  saveBar: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "16px 0", borderTop: `1px solid ${C.border}`, marginTop: 8,
  },
};

// ─────────────────────────────────────────────
// TAB DEFINITIONS
// ─────────────────────────────────────────────
export const TAB_GROUPS = [
  { key: "practice", label: "Practice" },
  { key: "clinical", label: "Clinical" },
  { key: "system",   label: "System" },
];

export const TABS = [
  { id: "clinic",       label: "Clinic Profile",       icon: FiHome,     group: "practice" },
  { id: "clinician",    label: "Clinician",             icon: FiAward,    group: "practice" },
  { id: "equipment",    label: "Equipment & Facility",  icon: FiTool,     group: "practice" },
  { id: "protocols",    label: "Protocol Defaults",     icon: FiActivity, group: "clinical" },
  { id: "documentation",label: "Documentation",         icon: FiFileText, group: "clinical" },
  { id: "notifications",label: "Notifications",         icon: FiBell,     group: "system" },
  { id: "security",     label: "Security & Compliance", icon: FiShield,   group: "system" },
  { id: "appearance",   label: "Appearance",            icon: FiMonitor,  group: "system" },
  { id: "data",         label: "Data Management",       icon: FiDatabase, group: "system" },
];

export const CREDENTIAL_OPTIONS = [
  "DVM", "VMD", "CCRP", "CCRT", "DACVSMR", "CVT", "RVT", "LVT",
  "PT", "DPT", "CCFT", "CSCS",
];

export const BOARD_CERT_OPTIONS = [
  "ACVSMR (Sports Medicine & Rehabilitation)",
  "ACVS (Surgery)",
  "ACVIM (Internal Medicine)",
  "ACVO (Ophthalmology)",
];
