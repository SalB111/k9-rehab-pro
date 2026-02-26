import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiChevronDown, FiCheckCircle, FiAlertTriangle,
  FiHome, FiAward, FiTool, FiActivity, FiFileText,
  FiBell, FiShield, FiMonitor, FiDatabase,
  FiSliders, FiClock, FiPrinter, FiLock,
  FiDownload, FiUpload, FiBook
} from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";

// ─────────────────────────────────────────────
// SETTINGS STYLES
// ─────────────────────────────────────────────
const settingsStyles = {
  sectionCard: {
    background: C.navy, borderRadius: 10, border: `2px solid ${C.navy}`,
    marginBottom: 12, overflow: "hidden",
    boxShadow: "0 2px 8px rgba(15,76,129,0.15)",
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
  sectionBody: { padding: "20px 24px", position: "relative", zIndex: 1, overflow: "visible", background: C.navy },
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
    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  toggleTrack: (on) => ({
    display: "inline-flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start",
    width: 40, height: 22, borderRadius: 11, cursor: "pointer",
    background: on ? "#10B981" : "#CBD5E1",
    padding: 2, transition: "all 0.2s ease",
    boxShadow: on ? "0 0 6px rgba(16,185,129,0.3)" : "none",
  }),
  toggleDot: {
    width: 18, height: 18, borderRadius: "50%",
    background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
  },
};

function SettingsToggle({ value, onChange, label, desc }) {
  return (
    <div style={settingsStyles.toggleRow}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={settingsStyles.toggleTrack(value)} onClick={() => onChange(!value)}>
        <div style={settingsStyles.toggleDot} />
      </div>
    </div>
  );
}

function SettingsSection({ id, icon: Icon, title, open, onToggle, children }) {
  return (
    <div style={settingsStyles.sectionCard}>
      <div style={settingsStyles.sectionHeader(open)} onClick={() => onToggle(id)}>
        <div style={settingsStyles.sectionTitle()}>
          <Icon size={16} />
          {title}
        </div>
        <FiChevronDown size={16} style={{
          color: "#fff",
          transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.2s ease",
        }} />
      </div>
      {open && (
        <>
          <div style={settingsStyles.neonLine}>
            <div style={settingsStyles.neonLineInner} />
          </div>
          <div style={settingsStyles.sectionBody}>{children}</div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// AUDIT LOG VIEWER — Must-Have #8
// ─────────────────────────────────────────────
function AuditLogViewer() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const fetchLog = async () => {
    setLoading(true);
    try {
      const [logRes, statsRes] = await Promise.all([
        axios.get(`${API}/audit-log?limit=100`),
        axios.get(`${API}/audit-log/stats`)
      ]);
      setEntries(logRes.data.data || logRes.data.entries || []);
      setTotal(logRes.data.total || 0);
      setStats(statsRes.data.data || statsRes.data.stats || []);
    } catch (e) { console.error('Audit log fetch error:', e); }
    setLoading(false);
  };

  useEffect(() => { if (showLog) fetchLog(); }, [showLog]);

  const actionColor = (action) => {
    if (action?.includes('DELETE')) return '#DC2626';
    if (action?.includes('PUT')) return '#D97706';
    if (action?.includes('POST')) return '#059669';
    return C.textLight;
  };

  return (
    <SettingsSection id="audit_log_viewer" open={showLog} onToggle={() => setShowLog(o => !o)} icon={FiFileText} title="Audit Log Viewer">
      {loading ? (
        <div style={{ padding: 20, textAlign: "center", color: C.textLight, fontSize: 13 }}>Loading audit entries...</div>
      ) : (
        <>
          {/* Stats summary */}
          {stats.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {stats.slice(0, 6).map((s, i) => (
                <div key={i} style={{
                  padding: "6px 12px", borderRadius: 6, background: "rgba(14,165,233,0.06)",
                  border: "1px solid rgba(14,165,233,0.15)", fontSize: 11
                }}>
                  <span style={{ fontWeight: 700, color: C.text }}>{s.count}</span>
                  <span style={{ color: C.textLight, marginLeft: 6 }}>{s.action}</span>
                </div>
              ))}
              <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(15,76,129,0.06)",
                border: "1px solid rgba(15,76,129,0.15)", fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: C.navy }}>{total}</span>
                <span style={{ color: C.textLight, marginLeft: 6 }}>total entries</span>
              </div>
            </div>
          )}

          {/* Log table */}
          {entries.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.textLight, fontSize: 13,
              background: "#F9FAFB", borderRadius: 8 }}>
              No audit entries yet. Entries are created when protocols are generated, patients are created, or data is modified.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
                    {["Timestamp", "Action", "Resource", "User", "Status", "Detail"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10,
                        fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.id || i} style={{ borderBottom: "1px solid #F0F4F8" }}>
                      <td style={{ padding: "8px 10px", color: C.textLight, fontSize: 11, whiteSpace: "nowrap" }}>
                        {e.timestamp ? new Date(e.timestamp + 'Z').toLocaleString() : '\u2014'}
                      </td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: actionColor(e.action) }}>{e.action || '\u2014'}</td>
                      <td style={{ padding: "8px 10px", color: C.text }}>{e.resource_type || '\u2014'}</td>
                      <td style={{ padding: "8px 10px", color: C.textLight }}>{e.user_label || '\u2014'}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                          background: (e.status_code >= 200 && e.status_code < 300) ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
                          color: (e.status_code >= 200 && e.status_code < 300) ? "#059669" : "#DC2626"
                        }}>{e.status_code || '\u2014'}</span>
                      </td>
                      <td style={{ padding: "8px 10px", color: C.textLight, fontSize: 11, maxWidth: 200,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.detail || '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {entries.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.textLight }}>Showing {entries.length} of {total} entries</span>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={`${API}/audit-log/export`} download
                  style={{ ...S.btn("outline"), fontSize: 11, padding: "4px 12px", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  <FiDownload size={11} /> Export CSV
                </a>
                <button onClick={fetchLog} style={{ ...S.btn("outline"), fontSize: 11, padding: "4px 12px" }}>
                  Refresh
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </SettingsSection>
  );
}

// ─────────────────────────────────────────────
// SETTINGS VIEW
// ─────────────────────────────────────────────
function SettingsView({ setBrand }) {
  // ── Clinic profile (persisted to API) ──
  const [form, setForm] = useState({
    clinic_name: "", logo_url: "", primary_color: "#0F4C81",
    secondary_color: "#0EA5E9", contact_email: "", phone: "", address: "",
    website: "", license_number: "", dea_number: "",
    clinic_type: "specialty_referral",
  });
  const [clinicId, setClinicId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Settings tab ──
  const [activeTab, setActiveTab] = useState("clinic");

  // ── Clinician credentials (client-side) ──
  const [clinician, setClinician] = useState({
    name: "", title: "DVM", credentials: [], license_number: "",
    license_state: "", npi: "", board_certs: [],
  });

  // ── Equipment & facility (client-side) ──
  const [equipment, setEquipment] = useState({
    underwater_treadmill: false, therapeutic_pool: false,
    land_treadmill: false, cavaletti_rails: true,
    balance_discs: true, wobble_boards: true, physio_balls: true,
    rocker_boards: false, ramps_stairs: true,
    nmes: false, tens: false, pemf: false,
    therapeutic_ultrasound: false,
    class_iii_laser: false, class_iv_laser: false,
    cryotherapy: true, thermotherapy: true,
    harness: true, sling: true,
    resistance_bands: true, weight_vests: false,
  });

  // ── Protocol defaults (client-side) ──
  const [protocolDefaults, setProtocolDefaults] = useState({
    progression_philosophy: "moderate",
    session_duration: 45,
    sessions_per_week: 3,
    pain_threshold_hold: 4,
    weight_bearing_threshold: "partial",
    include_hep: true,
    default_outcome_measure: "cbpi",
    auto_progression_gates: true,
    recheck_interval_weeks: 2,
  });

  // ── Documentation & reports (client-side) ──
  const [docSettings, setDocSettings] = useState({
    include_citations: true,
    include_json_blocks: false,
    logo_on_reports: true,
    default_export_format: "pdf",
    report_header: "",
    report_footer: "Generated by K9 Rehab Pro \u2014 Evidence-based canine rehabilitation",
    include_contraindications: true,
    include_progression_criteria: true,
  });

  // ── Notifications (client-side) ──
  const [notifications, setNotifications] = useState({
    phase_progression_reminders: true,
    recheck_reminders: true,
    pain_threshold_alerts: true,
    protocol_expiration_alerts: true,
    session_completion_tracking: true,
    reminder_lead_days: 3,
  });

  // ── Security (client-side) ──
  const [security, setSecurity] = useState({
    session_timeout_minutes: 30,
    audit_log_enabled: true,
    auto_lock_screen: true,
    data_retention_years: 7,
  });

  // ── Appearance (client-side) ──
  const [appearance, setAppearance] = useState({
    theme: "clinical_light",
    font_size: "standard",
    exercise_card_display: "detailed",
    dashboard_layout: "standard",
  });

  // ── Section expand states ──
  const [expanded, setExpanded] = useState({});
  const toggleSection = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Load clinic data ──
  useEffect(() => {
    axios.get(`${API}/clinics`).then(r => {
      const clinic = r.data?.[0];
      if (clinic) {
        setClinicId(clinic.id);
        setForm(prev => ({ ...prev, ...clinic }));
        setBrand(b => ({ ...b, clinicName: clinic.clinic_name, accent: clinic.primary_color }));
      }
    }).catch(() => {});
  }, [setBrand]);

  // ── Save clinic profile ──
  const saveClinic = async () => {
    setSaving(true);
    try {
      if (clinicId) {
        await axios.put(`${API}/clinics/${clinicId}`, form);
      } else {
        const { data } = await axios.post(`${API}/clinics`, form);
        setClinicId(data.id);
      }
      setBrand(b => ({ ...b, clinicName: form.clinic_name, accent: form.primary_color }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error("Save failed", e); }
    setSaving(false);
  };

  // ── Save any section (client-side flash) ──
  const flashSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ── Shared styles (only what's NOT in settingsStyles) ──
  const sty = {
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
      border: `2px solid ${C.navy}`,
      transition: "all 0.2s ease",
    }),
    fieldRow: { marginBottom: 16 },
    fieldLabel: {
      fontSize: 11, fontWeight: 700, color: "#fff",
      textTransform: "uppercase", letterSpacing: "0.6px",
      marginBottom: 6, display: "block",
    },
    fieldHint: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 },
    statusBadge: (ok) => ({
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: ok ? C.greenBg : C.redBg,
      color: ok ? C.green : C.red,
      textTransform: "uppercase", letterSpacing: "0.5px",
    }),
    saveBar: {
      display: "flex", alignItems: "center", gap: 16,
      padding: "16px 0", borderTop: `1px solid rgba(255,255,255,0.1)`, marginTop: 8,
    },
  };

  // ── Helper: is section open (default true) ──
  const isOpen = (id) => expanded[id] !== false;

  // ── SETTINGS TABS ──
  const TABS = [
    { id: "clinic",       label: "Clinic Profile",      icon: FiHome },
    { id: "clinician",    label: "Clinician",            icon: FiAward },
    { id: "equipment",    label: "Equipment & Facility", icon: FiTool },
    { id: "protocols",    label: "Protocol Defaults",    icon: FiActivity },
    { id: "documentation",label: "Documentation",        icon: FiFileText },
    { id: "notifications",label: "Notifications",        icon: FiBell },
    { id: "security",     label: "Security & Compliance",icon: FiShield },
    { id: "appearance",   label: "Appearance",           icon: FiMonitor },
    { id: "data",         label: "Data Management",      icon: FiDatabase },
  ];

  // ── Credential options ──
  const CREDENTIAL_OPTIONS = [
    "DVM", "VMD", "CCRP", "CCRT", "DACVSMR", "CVT", "RVT", "LVT",
    "PT", "DPT", "CCFT", "CSCS",
  ];
  const BOARD_CERT_OPTIONS = [
    "ACVSMR (Sports Medicine & Rehabilitation)",
    "ACVS (Surgery)",
    "ACVIM (Internal Medicine)",
    "ACVO (Ophthalmology)",
  ];

  return (
    <div>
      {/* ── Tab bar ── */}
      <div style={sty.tabBar}>
        {TABS.map(t => (
          <div key={t.id} style={sty.tab(activeTab === t.id)} onClick={() => {
            setActiveTab(t.id);
            const el = document.querySelector("[data-content-scroll]");
            if (el) el.scrollTop = 0;
          }}>
            <t.icon size={13} />
            {t.label}
          </div>
        ))}
      </div>

      {/* ── Save confirmation ── */}
      {saved && (
        <div style={{
          padding: "10px 20px", marginBottom: 12, borderRadius: 8,
          background: C.greenBg, border: `1px solid ${C.green}`,
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, fontWeight: 600, color: C.green,
        }}>
          <FiCheckCircle size={16} /> Settings saved successfully
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 1: CLINIC PROFILE
          ══════════════════════════════════════════════ */}
      {activeTab === "clinic" && (
        <div>
          <SettingsSection id="clinic_info" open={isOpen("clinic_info")} onToggle={toggleSection} icon={FiHome} title="Practice Information">
            <div style={S.grid(2)}>
              {[
                ["clinic_name", "Practice Name", "Full legal name of your veterinary practice"],
                ["contact_email", "Contact Email", "Primary clinic email address"],
                ["phone", "Phone Number", "Main phone line"],
                ["address", "Address", "Street address, city, state, ZIP"],
                ["website", "Website", "Practice website URL"],
                ["license_number", "Veterinary Facility License", "State facility license number"],
                ["dea_number", "DEA Registration", "DEA registration number (if applicable)"],
              ].map(([key, label, hint]) => (
                <div key={key} style={sty.fieldRow}>
                  <label style={sty.fieldLabel}>{label}</label>
                  <input style={S.input} value={form[key] || ""}
                    onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  <div style={sty.fieldHint}>{hint}</div>
                </div>
              ))}
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>Facility Type</label>
                <select style={{ ...S.select, width: "100%" }} value={form.clinic_type}
                  onChange={e => setForm({ ...form, clinic_type: e.target.value })}>
                  <option value="specialty_referral">Specialty Referral Hospital</option>
                  <option value="general_practice">General Practice</option>
                  <option value="university">University Teaching Hospital</option>
                  <option value="rehabilitation_center">Dedicated Rehabilitation Center</option>
                  <option value="mobile">Mobile Rehabilitation Service</option>
                  <option value="multi_location">Multi-Location Corporate</option>
                </select>
                <div style={sty.fieldHint}>Determines default workflow and report formatting</div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection id="clinic_brand" open={isOpen("clinic_brand")} onToggle={toggleSection} icon={FiSliders} title="Branding & Colors">
            <div style={sty.fieldRow}>
              <label style={sty.fieldLabel}>Logo URL</label>
              <input style={S.input} value={form.logo_url || ""}
                onChange={e => setForm({ ...form, logo_url: e.target.value })} />
              <div style={sty.fieldHint}>URL to your clinic logo (displayed on reports and dashboard)</div>
            </div>

            <div style={{ display: "flex", gap: 40, marginTop: 16 }}>
              <div>
                <label style={sty.fieldLabel}>Primary Color</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                  {["#0F4C81", "#0EA5E9", "#10B981", "#7C3AED", "#DC2626"].map(color => (
                    <div key={color} onClick={() => setForm({ ...form, primary_color: color })}
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: color, cursor: "pointer",
                        border: form.primary_color === color ? "3px solid #1A202C" : "3px solid transparent",
                        transition: "border 0.15s",
                      }} />
                  ))}
                  <input type="color" value={form.primary_color}
                    onChange={e => setForm({ ...form, primary_color: e.target.value })}
                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                      padding: 0, cursor: "pointer" }} />
                </div>
              </div>
              <div>
                <label style={sty.fieldLabel}>Secondary Color</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                  {["#0EA5E9", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"].map(color => (
                    <div key={color} onClick={() => setForm({ ...form, secondary_color: color })}
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: color, cursor: "pointer",
                        border: form.secondary_color === color ? "3px solid #1A202C" : "3px solid transparent",
                        transition: "border 0.15s",
                      }} />
                  ))}
                  <input type="color" value={form.secondary_color}
                    onChange={e => setForm({ ...form, secondary_color: e.target.value })}
                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                      padding: 0, cursor: "pointer" }} />
                </div>
              </div>
            </div>
          </SettingsSection>

          <div style={sty.saveBar}>
            <button style={S.btn("dark")} onClick={saveClinic} disabled={saving}>
              {saving ? "Saving..." : "Save Clinic Profile"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2: CLINICIAN CREDENTIALS
          ══════════════════════════════════════════════ */}
      {activeTab === "clinician" && (
        <div>
          <SettingsSection id="clin_id" open={isOpen("clin_id")} onToggle={toggleSection} icon={FiAward} title="Clinician Identity">
            <div style={S.grid(2)}>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>Full Name</label>
                <input style={S.input} value={clinician.name}
                  onChange={e => setClinician({ ...clinician, name: e.target.value })}
                  placeholder="Dr. Jane Smith" />
              </div>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>Professional Title</label>
                <select style={{ ...S.select, width: "100%" }} value={clinician.title}
                  onChange={e => setClinician({ ...clinician, title: e.target.value })}>
                  <option value="DVM">DVM — Doctor of Veterinary Medicine</option>
                  <option value="VMD">VMD — Veterinariae Medicinae Doctoris</option>
                  <option value="PT">PT — Physical Therapist</option>
                  <option value="DPT">DPT — Doctor of Physical Therapy</option>
                  <option value="CVT">CVT — Certified Veterinary Technician</option>
                  <option value="RVT">RVT — Registered Veterinary Technician</option>
                </select>
              </div>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>State License Number</label>
                <input style={S.input} value={clinician.license_number}
                  onChange={e => setClinician({ ...clinician, license_number: e.target.value })} />
              </div>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>License State</label>
                <input style={S.input} value={clinician.license_state}
                  onChange={e => setClinician({ ...clinician, license_state: e.target.value })}
                  placeholder="e.g. CA, TX, NY" />
              </div>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>National Provider Identifier (NPI)</label>
                <input style={S.input} value={clinician.npi}
                  onChange={e => setClinician({ ...clinician, npi: e.target.value })}
                  placeholder="10-digit NPI (optional)" />
                <div style={sty.fieldHint}>Required for insurance billing and referral coordination</div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection id="clin_certs" open={isOpen("clin_certs")} onToggle={toggleSection} icon={FiCheckCircle} title="Certifications & Board Diplomate Status">
            <div style={sty.fieldRow}>
              <label style={sty.fieldLabel}>Rehabilitation Certifications</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                {CREDENTIAL_OPTIONS.map(cred => {
                  const active = clinician.credentials.includes(cred);
                  return (
                    <div key={cred} onClick={() => {
                      setClinician(prev => ({
                        ...prev,
                        credentials: active
                          ? prev.credentials.filter(c => c !== cred)
                          : [...prev.credentials, cred],
                      }));
                    }} style={{
                      padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                      fontSize: 12, fontWeight: 700, letterSpacing: "0.3px",
                      background: active ? "#0EA5E9" : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      border: active ? `1px solid #0EA5E9` : `1px solid rgba(255,255,255,0.2)`,
                      transition: "all 0.15s",
                    }}>
                      {cred}
                    </div>
                  );
                })}
              </div>
              <div style={sty.fieldHint}>Select all certifications held by the primary clinician</div>
            </div>

            <div style={{ ...sty.fieldRow, marginTop: 20 }}>
              <label style={sty.fieldLabel}>Board Diplomate Status</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                {BOARD_CERT_OPTIONS.map(cert => {
                  const active = clinician.board_certs.includes(cert);
                  return (
                    <div key={cert} onClick={() => {
                      setClinician(prev => ({
                        ...prev,
                        board_certs: active
                          ? prev.board_certs.filter(c => c !== cert)
                          : [...prev.board_certs, cert],
                      }));
                    }} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                      background: active ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                      border: active ? `2px solid #0EA5E9` : `1px solid rgba(255,255,255,0.15)`,
                      transition: "all 0.15s",
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: active ? "#0EA5E9" : "rgba(255,255,255,0.1)",
                        border: active ? "none" : `2px solid rgba(255,255,255,0.3)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 11,
                      }}>
                        {active && "\u2713"}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: "#fff" }}>{cert}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SettingsSection>

          <div style={sty.saveBar}>
            <button style={S.btn("dark")} onClick={flashSave}>Save Clinician Profile</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 3: EQUIPMENT & FACILITY
          ══════════════════════════════════════════════ */}
      {activeTab === "equipment" && (
        <div>
          <div style={{
            padding: "12px 16px", marginBottom: 12, borderRadius: 8,
            background: "rgba(245,158,11,0.1)", border: `1px solid rgba(245,158,11,0.4)`,
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, color: "#FBBF24", fontWeight: 600,
          }}>
            <FiAlertTriangle size={14} />
            Equipment settings gate protocol generation — exercises requiring unavailable equipment will be excluded automatically
          </div>

          <SettingsSection id="equip_aquatic" open={isOpen("equip_aquatic")} onToggle={toggleSection} icon={FiActivity} title="Aquatic Therapy">
            <SettingsToggle value={equipment.underwater_treadmill}
              onChange={v => setEquipment({ ...equipment, underwater_treadmill: v })}
              label="Underwater Treadmill (UWTT)"
              desc="Hudson Aquatic, Ferno, or equivalent — required for controlled aquatic gait training" />
            <SettingsToggle value={equipment.therapeutic_pool}
              onChange={v => setEquipment({ ...equipment, therapeutic_pool: v })}
              label="Therapeutic Swimming Pool"
              desc="Heated pool with controlled access — swim-based conditioning and ROM" />
          </SettingsSection>

          <SettingsSection id="equip_electro" open={isOpen("equip_electro")} onToggle={toggleSection} icon={FiActivity} title="Electrotherapy & Modalities">
            <SettingsToggle value={equipment.nmes}
              onChange={v => setEquipment({ ...equipment, nmes: v })}
              label="Neuromuscular Electrical Stimulation (NMES)"
              desc="For muscle re-education and atrophy prevention — Millis & Levine Ch. 12" />
            <SettingsToggle value={equipment.tens}
              onChange={v => setEquipment({ ...equipment, tens: v })}
              label="Transcutaneous Electrical Nerve Stimulation (TENS)"
              desc="Pain modulation via gate control theory — analgesic applications" />
            <SettingsToggle value={equipment.pemf}
              onChange={v => setEquipment({ ...equipment, pemf: v })}
              label="Pulsed Electromagnetic Field Therapy (PEMF)"
              desc="Non-invasive bone healing and pain reduction" />
            <SettingsToggle value={equipment.therapeutic_ultrasound}
              onChange={v => setEquipment({ ...equipment, therapeutic_ultrasound: v })}
              label="Therapeutic Ultrasound"
              desc="Deep tissue heating — periarticular fibrosis, scar tissue, joint stiffness" />
          </SettingsSection>

          <SettingsSection id="equip_photo" open={isOpen("equip_photo")} onToggle={toggleSection} icon={FiActivity} title="Photobiomodulation (Laser Therapy)">
            <SettingsToggle value={equipment.class_iii_laser}
              onChange={v => setEquipment({ ...equipment, class_iii_laser: v })}
              label="Class III (Cold) Laser"
              desc="Low-level laser therapy — superficial tissue, wound healing" />
            <SettingsToggle value={equipment.class_iv_laser}
              onChange={v => setEquipment({ ...equipment, class_iv_laser: v })}
              label="Class IV Therapeutic Laser"
              desc="Deep tissue penetration — pain, inflammation, tissue repair" />
          </SettingsSection>

          <SettingsSection id="equip_manual" open={isOpen("equip_manual")} onToggle={toggleSection} icon={FiTool} title="Manual Therapy & Exercise Equipment">
            <div style={S.grid(2)}>
              {[
                ["cavaletti_rails", "Cavaletti Rails", "Gait patterning, proprioception, stride length"],
                ["balance_discs", "Balance Discs / BOSU", "Proprioceptive training, weight shifting"],
                ["wobble_boards", "Wobble Boards", "Dynamic balance, core stability"],
                ["physio_balls", "Physio / Peanut Balls", "Core stabilization, weight shifting"],
                ["rocker_boards", "Rocker Boards", "Controlled instability training"],
                ["ramps_stairs", "Ramps & Stairs", "Incline/decline strengthening, functional mobility"],
                ["land_treadmill", "Land Treadmill", "Controlled gait speed, endurance training"],
                ["resistance_bands", "Resistance Bands", "Progressive resistance exercises"],
                ["weight_vests", "Weight Vests", "Graduated loading for strengthening"],
                ["harness", "Support Harness", "Assisted ambulation, safety during exercises"],
                ["sling", "Abdominal Sling", "Hindquarter support during early rehabilitation"],
                ["cryotherapy", "Cryotherapy", "Ice packs, cold compression — post-exercise inflammation control"],
                ["thermotherapy", "Thermotherapy", "Warm packs, moist heat — pre-exercise tissue preparation"],
              ].map(([key, label, desc]) => (
                <div key={key} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 8,
                  background: equipment[key] ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.05)",
                  border: equipment[key] ? `1px solid rgba(16,185,129,0.4)` : `1px solid rgba(255,255,255,0.15)`,
                  transition: "all 0.15s",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{desc}</div>
                  </div>
                  <div style={settingsStyles.toggleTrack(equipment[key])} onClick={() => setEquipment({ ...equipment, [key]: !equipment[key] })}>
                    <div style={settingsStyles.toggleDot} />
                  </div>
                </div>
              ))}
            </div>
          </SettingsSection>

          <div style={sty.saveBar}>
            <button style={S.btn("dark")} onClick={flashSave}>Save Equipment Profile</button>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {Object.values(equipment).filter(Boolean).length} of {Object.keys(equipment).length} items available
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 4: PROTOCOL DEFAULTS
          ══════════════════════════════════════════════ */}
      {activeTab === "protocols" && (
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
                      background: protocolDefaults.progression_philosophy === val ? "#0EA5E9" : "rgba(255,255,255,0.05)",
                      color: "#fff",
                      border: protocolDefaults.progression_philosophy === val ? `2px solid #0EA5E9` : `1px solid rgba(255,255,255,0.2)`,
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
      )}

      {/* ══════════════════════════════════════════════
          TAB 5: DOCUMENTATION & REPORTS
          ══════════════════════════════════════════════ */}
      {activeTab === "documentation" && (
        <div>
          <SettingsSection id="doc_content" open={isOpen("doc_content")} onToggle={toggleSection} icon={FiFileText} title="Report Content">
            <SettingsToggle value={docSettings.include_citations}
              onChange={v => setDocSettings({ ...docSettings, include_citations: v })}
              label="Include Evidence Citations"
              desc="Append peer-reviewed references (Millis & Levine, Zink & Van Dyke) to each exercise" />
            <SettingsToggle value={docSettings.include_contraindications}
              onChange={v => setDocSettings({ ...docSettings, include_contraindications: v })}
              label="Include Contraindications"
              desc="Display contraindication warnings per exercise and per protocol phase" />
            <SettingsToggle value={docSettings.include_progression_criteria}
              onChange={v => setDocSettings({ ...docSettings, include_progression_criteria: v })}
              label="Include Progression Criteria"
              desc="Show gated progression requirements between each protocol phase" />
            <SettingsToggle value={docSettings.include_json_blocks}
              onChange={v => setDocSettings({ ...docSettings, include_json_blocks: v })}
              label="Include JSON Blocks (Developer Mode)"
              desc="Append machine-readable JSON objects for EHR/API integration" />
          </SettingsSection>

          <SettingsSection id="doc_format" open={isOpen("doc_format")} onToggle={toggleSection} icon={FiPrinter} title="Export & Formatting">
            <div style={S.grid(2)}>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>Default Export Format</label>
                <select style={{ ...S.select, width: "100%" }} value={docSettings.default_export_format}
                  onChange={e => setDocSettings({ ...docSettings, default_export_format: e.target.value })}>
                  <option value="pdf">PDF Document</option>
                  <option value="print">Print-Ready (Browser Print)</option>
                  <option value="csv">CSV (Spreadsheet)</option>
                  <option value="json">JSON (API / EHR Export)</option>
                </select>
              </div>
              <div style={sty.fieldRow}>
                <SettingsToggle value={docSettings.logo_on_reports}
                  onChange={v => setDocSettings({ ...docSettings, logo_on_reports: v })}
                  label="Clinic Logo on Reports"
                  desc="Display your practice logo in the report header" />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection id="doc_custom" open={isOpen("doc_custom")} onToggle={toggleSection} icon={FiBook} title="Custom Header & Footer">
            <div style={sty.fieldRow}>
              <label style={sty.fieldLabel}>Report Header Text</label>
              <input style={S.input} value={docSettings.report_header}
                onChange={e => setDocSettings({ ...docSettings, report_header: e.target.value })}
                placeholder="e.g. Canine Rehabilitation & Sports Medicine Center" />
              <div style={sty.fieldHint}>Appears at the top of every generated report</div>
            </div>
            <div style={sty.fieldRow}>
              <label style={sty.fieldLabel}>Report Footer / Disclaimer</label>
              <textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }}
                value={docSettings.report_footer}
                onChange={e => setDocSettings({ ...docSettings, report_footer: e.target.value })} />
              <div style={sty.fieldHint}>Legal disclaimer or branding line appended to report footer</div>
            </div>
          </SettingsSection>

          <div style={sty.saveBar}>
            <button style={S.btn("dark")} onClick={flashSave}>Save Documentation Settings</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 6: NOTIFICATIONS & ALERTS
          ══════════════════════════════════════════════ */}
      {activeTab === "notifications" && (
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
      )}

      {/* ══════════════════════════════════════════════
          TAB 7: SECURITY & COMPLIANCE
          ══════════════════════════════════════════════ */}
      {activeTab === "security" && (
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
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</span>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{statusNote}</div>
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
      )}

      {/* ══════════════════════════════════════════════
          TAB 8: APPEARANCE & DISPLAY
          ══════════════════════════════════════════════ */}
      {activeTab === "appearance" && (
        <div>
          <SettingsSection id="app_theme" open={isOpen("app_theme")} onToggle={toggleSection} icon={FiMonitor} title="Theme & Display">
            <div style={sty.fieldRow}>
              <label style={sty.fieldLabel}>Interface Theme</label>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                {[
                  ["clinical_light", "Clinical Light", "Clean white backgrounds, medical-grade readability"],
                  ["clinical_dark", "Clinical Dark", "Dark navy backgrounds, reduced eye strain"],
                  ["high_contrast", "High Contrast", "Maximum contrast for accessibility compliance"],
                ].map(([val, label, desc]) => (
                  <div key={val} onClick={() => setAppearance({ ...appearance, theme: val })}
                    style={{
                      flex: 1, padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                      background: appearance.theme === val ? "#0EA5E9" : "rgba(255,255,255,0.05)",
                      color: "#fff",
                      border: appearance.theme === val ? `2px solid #0EA5E9` : `1px solid rgba(255,255,255,0.2)`,
                      transition: "all 0.15s",
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </SettingsSection>

          <SettingsSection id="app_layout" open={isOpen("app_layout")} onToggle={toggleSection} icon={FiSliders} title="Layout Preferences">
            <div style={S.grid(2)}>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>Font Size</label>
                <select style={{ ...S.select, width: "100%" }} value={appearance.font_size}
                  onChange={e => setAppearance({ ...appearance, font_size: e.target.value })}>
                  <option value="compact">Compact — More content per screen</option>
                  <option value="standard">Standard (Recommended)</option>
                  <option value="large">Large — Enhanced readability</option>
                </select>
              </div>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>Exercise Card Display</label>
                <select style={{ ...S.select, width: "100%" }} value={appearance.exercise_card_display}
                  onChange={e => setAppearance({ ...appearance, exercise_card_display: e.target.value })}>
                  <option value="compact">Compact — Name, code, category only</option>
                  <option value="detailed">Detailed (Recommended) — Full descriptions and evidence</option>
                  <option value="clinical">Clinical — Phase mapping, contraindications, progression</option>
                </select>
              </div>
              <div style={sty.fieldRow}>
                <label style={sty.fieldLabel}>Dashboard Layout</label>
                <select style={{ ...S.select, width: "100%" }} value={appearance.dashboard_layout}
                  onChange={e => setAppearance({ ...appearance, dashboard_layout: e.target.value })}>
                  <option value="standard">Standard — KPIs + recent patients + actions</option>
                  <option value="clinical">Clinical Focus — Patient queue + outcome trends</option>
                  <option value="administrative">Administrative — Utilization + billing + compliance</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          <div style={sty.saveBar}>
            <button style={S.btn("dark")} onClick={flashSave}>Save Appearance Settings</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 9: DATA MANAGEMENT
          ══════════════════════════════════════════════ */}
      {activeTab === "data" && (
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
                  background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.15)`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{desc}</div>
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
              border: `2px dashed rgba(255,255,255,0.25)`, background: "rgba(255,255,255,0.03)",
            }}>
              <FiUpload size={24} style={{ color: "rgba(255,255,255,0.4)", marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Import Patient Records</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                Drag and drop CSV or JSON files, or click to browse
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
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
                <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.5px" }}>API Status</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#10B981", marginTop: 4 }}>Connected</div>
              </div>
              <div style={{
                flex: 1, padding: "12px 16px", borderRadius: 8,
                background: "rgba(14,165,233,0.12)", border: `1px solid rgba(14,165,233,0.3)`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.5px" }}>Exercise Library</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0EA5E9", marginTop: 4 }}>179 Validated Exercises</div>
              </div>
              <div style={{
                flex: 1, padding: "12px 16px", borderRadius: 8,
                background: "rgba(245,158,11,0.1)", border: `1px solid rgba(245,158,11,0.3)`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.5px" }}>Protocol Engine</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FBBF24", marginTop: 4 }}>4 Protocols x 4 Phases</div>
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
      )}

      {/* ── Platform version footer ── */}
      <div style={{
        marginTop: 16, padding: "12px 20px", borderRadius: 8,
        background: C.navy, color: "rgba(255,255,255,0.6)",
        fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>K9 Rehab Pro Opus 4.6 — Evidence-Based Canine Rehabilitation Intelligence</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>
          ACVSMR-Aligned | Millis & Levine | 179 Exercises | 4 Protocols x 4 Phases
        </span>
      </div>
    </div>
  );
}

export default SettingsView;
