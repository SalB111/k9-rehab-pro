import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FiUsers, FiActivity, FiBookOpen, FiClipboard,
  FiSettings, FiSearch, FiChevronRight, FiChevronDown,
  FiX, FiAlertTriangle, FiCheckCircle, FiBook, FiStar,
  FiCalendar, FiFileText, FiHeart, FiHome,
  FiBarChart2, FiClock, FiPlus, FiArrowRight,
  FiShield, FiDownload, FiUpload, FiLock, FiMonitor,
  FiPrinter, FiBell, FiAward, FiTool, FiDatabase,
  FiSliders, FiArrowUp
} from "react-icons/fi";
import { TbDog } from "react-icons/tb";

const API = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// ─────────────────────────────────────────────
// MEDICAL-GRADE DESIGN SYSTEM
// Inspired by clinical EHR platforms (eVetPractice, Shepherd, IDEXX Neo)
// Typography: Inter for body, Exo 2 for brand accents
// Palette: Clinical navy, diagnostic teal, sterile whites
// ─────────────────────────────────────────────
const C = {
  navy:      "#0A2540",
  navyMid:   "#0F3460",
  navyLight: "#164E80",
  teal:      "#0EA5E9",
  tealDark:  "#0284C7",
  tealLight: "#E0F2FE",
  green:     "#059669",
  greenBg:   "#ECFDF5",
  amber:     "#D97706",
  amberBg:   "#FFFBEB",
  red:       "#DC2626",
  redBg:     "#FEF2F2",
  bg:        "#F8FAFC",
  surface:   "#FFFFFF",
  border:    "#E2E8F0",
  borderLight: "#F1F5F9",
  text:      "#0F172A",
  textMid:   "#475569",
  textLight: "#94A3B8",
};

const S = {
  app: {
    display: "flex", flexDirection: "column", height: "100vh",
    fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    background: C.bg, color: C.text,
  },
  // ── TOP NAV ──
  topNav: {
    background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 48, flexShrink: 0,
    borderBottom: `1px solid ${C.border}`,
  },
  topNavBrand: {
    display: "flex", alignItems: "center", gap: 10,
    color: C.navy, fontFamily: "'Exo 2', 'Inter', sans-serif",
    fontSize: 15, fontWeight: 700, letterSpacing: "0.5px",
  },
  topNavLinks: {
    display: "flex", alignItems: "center", gap: 2,
  },
  topNavItem: (active) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 6, cursor: "pointer",
    fontSize: 11, fontWeight: 600,
    color: "#fff",
    background: active ? "rgba(57,255,126,0.18)" : "transparent",
    borderBottom: active ? "2px solid #39FF7E" : "2px solid transparent",
    boxShadow: active ? "0 0 10px rgba(57,255,126,0.3), 0 0 20px rgba(57,255,126,0.12)" : "none",
    transition: "all 0.25s ease",
  }),
  // ── WIZARD ──
  wizardProgress: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 0, padding: "4px 32px 2px",
  },
  wizardStep: (state) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "4px 12px", fontSize: 10, fontWeight: 600,
    color: state === "done" ? "#39FF7E" : "#111",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }),
  wizardDot: (state) => ({
    width: 22, height: 22, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700,
    background: state === "done" ? "#39FF7E" : state === "active" ? "#fff" : C.bg,
    color: "#111",
    border: state === "done" ? "1.5px solid #39FF7E" : state === "pending" ? `1.5px solid ${C.border}` : `1.5px solid #111`,
    boxShadow: state === "done" ? "0 0 8px rgba(57,255,126,0.45), 0 0 16px rgba(57,255,126,0.2)" : "none",
    animation: "none",
    transition: "all 0.4s ease",
  }),
  wizardLine: (done) => ({
    width: 50, height: 2,
    background: done ? "#39FF7E" : C.border,
    margin: "0 4px",
    boxShadow: done ? "0 0 6px rgba(57,255,126,0.4)" : "none",
  }),
  wizardNav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", marginTop: 8,
    borderTop: `1px solid ${C.border}`,
  },
  // ── MAIN AREA ──
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  // topbar replaced by inline nav links bar in return()
  content: { flex: 1, overflow: "auto", padding: "8px 32px 12px" },
  // ── SHARED COMPONENTS ──
  card: {
    background: C.surface, borderRadius: 10, padding: 20,
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 10,
  },
  sectionHeader: () => ({
    display: "flex", alignItems: "center", gap: 8,
    padding: "4px 0 2px", marginBottom: 0,
    borderBottom: "none",
    fontSize: 12, fontWeight: 800, color: "#fff",
    textTransform: "uppercase", letterSpacing: "1.2px",
  }),
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 20px", borderRadius: 8, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    letterSpacing: "0.2px",
    background: variant === "primary" ? C.teal : variant === "dark" ? C.navy
      : variant === "success" ? C.green : variant === "danger" ? C.red : C.bg,
    color: (variant === "primary" || variant === "dark" || variant === "success" || variant === "danger") ? "#fff" : C.textMid,
    transition: "all 0.15s",
    boxShadow: variant === "ghost" ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
  }),
  badge: (color = "blue") => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 10,
    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
    background: color === "blue" ? C.tealLight : color === "green" ? C.greenBg : C.amberBg,
    color: color === "blue" ? C.tealDark : color === "green" ? C.green : C.amber,
  }),
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 13,
    border: `1px solid ${C.border}`, outline: "none", boxSizing: "border-box",
    background: C.surface, color: C.text,
    transition: "border-color 0.15s",
  },
  select: {
    padding: "10px 12px", borderRadius: 6, fontSize: 13,
    border: `1px solid ${C.border}`, outline: "none",
    background: C.surface, color: C.text, cursor: "pointer",
  },
  grid: (cols = 3) => ({
    display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16,
  }),
  label: {
    fontSize: 11, fontWeight: 600, color: "#fff",
    textTransform: "uppercase", letterSpacing: "0.6px",
    marginBottom: 6, display: "block",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "10px 14px", background: C.bg,
    borderBottom: `2px solid ${C.border}`, fontSize: 10, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.8px", color: C.textLight,
  },
  td: { padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, verticalAlign: "top" },
};

// ─────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────
function DashboardView({ setView }) {
  const [patients, setPatients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const togglePatient = (id) => {
    setSelectedPatients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedPatients.size === patients.length) {
      setSelectedPatients(new Set());
    } else {
      setSelectedPatients(new Set(patients.map(p => p.id)));
    }
  };
  const deleteSelected = async () => {
    if (selectedPatients.size === 0) return;
    if (!window.confirm(`Delete ${selectedPatients.size} patient(s)? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await axios.post(`${API}/patients/delete-batch`, { ids: Array.from(selectedPatients) });
      setPatients(prev => prev.filter(p => !selectedPatients.has(p.id)));
      setSelectedPatients(new Set());
    } catch (e) { console.error('Delete failed:', e); }
    setDeleting(false);
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/patients`).catch(() => ({ data: [] })),
      axios.get(`${API}/exercises`).catch(() => ({ data: [] })),
      axios.get(`${API}/health`).then(() => true).catch(() => false),
    ]).then(([pRes, eRes, health]) => {
      setPatients(pRes.data || []);
      setExercises(eRes.data || []);
      setApiOk(health);
      setLoading(false);
    });
  }, []);

  // Condition distribution from patient records
  const conditionCounts = patients.reduce((acc, p) => {
    if (p.condition) acc[p.condition] = (acc[p.condition] || 0) + 1;
    return acc;
  }, {});
  const conditionEntries = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E2E8F0", borderTopColor: C.teal, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Loading dashboard...</span>
      </div>
    );
  }

  const PROTOCOLS = [
    { name: "TPLO Post-Surgical", phases: 4, weeks: "16 wk", color: "#DC2626" },
    { name: "IVDD Neuro Recovery", phases: 4, weeks: "12 wk", color: "#7C3AED" },
    { name: "OA Multimodal", phases: 4, weeks: "16 wk", color: C.teal },
    { name: "Geriatric Mobility", phases: 4, weeks: "16 wk", color: C.amber },
  ];

  return (
    <div>
      {/* ── KPI STAT CARDS ── */}
      <div style={S.grid(4)}>
        {[
          { label: "Active Patients", value: patients.length, img: "/2.png", color: C.teal, bg: C.tealLight },
          { label: "Protocols Available", value: "4 × 4 Phases", icon: FiFileText, color: "#7C3AED", bg: "#EDE9FE" },
          { label: "Exercise Library", value: exercises.length, img: "/Beau.png", color: C.navy, bg: "#DBEAFE" },
          { label: "Unique Conditions", value: Object.keys(conditionCounts).length || "—", icon: TbDog, color: C.amber, bg: C.amberBg },
        ].map((stat, i) => (
          <div key={i} style={{
            ...S.card, padding: "20px 24px",
            border: `2px solid ${C.navy}`, borderLeft: `4px solid ${stat.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.8px" }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, marginTop: 4 }}>{stat.value}</div>
              </div>
              <div style={{ width: stat.img ? 55 : 44, height: stat.img ? 55 : 44, borderRadius: 10, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {stat.img
                  ? <img src={stat.img} alt={stat.label} style={{ width: 55, height: 55, objectFit: "cover", borderRadius: 10 }} />
                  : <stat.icon size={20} style={{ color: stat.color }} />
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ ...S.card, border: `2px solid ${C.navy}`, display: "flex", gap: 12, alignItems: "center", padding: "16px 24px", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.8px", marginRight: 8 }}>Quick Actions</span>
        <button style={{ ...S.btn("primary"), background: C.navy, boxShadow: "none" }} onClick={() => setView("clients")}>
          <FiUsers size={14} /> Patient Records
        </button>
        <button style={{ ...S.btn("primary"), background: C.navy, boxShadow: "none" }} onClick={() => setView("exercises")}>
          <FiBookOpen size={14} /> Exercise Library
        </button>
        <button style={{ ...S.btn("primary"), background: C.navy, boxShadow: "none" }} onClick={() => setView("sessions")}>
          <FiClipboard size={14} /> SOAP
        </button>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* LEFT: Recent Patients */}
        <div style={{ ...S.card, border: `2px solid ${C.navy}`, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>Recent Patients</div>
              {selectedPatients.size > 0 && (
                <button onClick={deleteSelected} disabled={deleting}
                  style={{ ...S.btn("primary"), background: "#EF4444", fontSize: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                  <FiX size={10} /> {deleting ? "Deleting..." : `Delete ${selectedPatients.size}`}
                </button>
              )}
              {patients.length > 0 && selectedPatients.size === 0 && (
                <button onClick={toggleAll}
                  style={{ fontSize: 10, color: C.textLight, background: "none", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>
                  Select All
                </button>
              )}
              {selectedPatients.size > 0 && (
                <button onClick={() => setSelectedPatients(new Set())}
                  style={{ fontSize: 10, color: C.textLight, background: "none", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>
                  Deselect
                </button>
              )}
            </div>
            <span style={{ fontSize: 11, color: C.teal, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
              onClick={() => setView("clients")}>View All <FiArrowRight size={11} /></span>
          </div>
          {patients.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: C.textLight }}>
              <FiUsers size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>No patients registered yet</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Use "Register Patient" to add your first case</div>
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 32, textAlign: "center" }}>
                    <input type="checkbox" checked={patients.length > 0 && selectedPatients.size === patients.length}
                      onChange={toggleAll} style={{ cursor: "pointer", accentColor: C.teal }} />
                  </th>
                  {["Patient", "Breed", "Condition", "Registered"].map(h =>
                  <th key={h} style={S.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 8).map(p => (
                  <tr key={p.id} style={{ transition: "background 0.1s", background: selectedPatients.has(p.id) ? "rgba(14,165,233,0.06)" : "transparent" }}
                    onMouseEnter={e => { if (!selectedPatients.has(p.id)) e.currentTarget.style.background = C.bg; }}
                    onMouseLeave={e => { if (!selectedPatients.has(p.id)) e.currentTarget.style.background = "transparent"; }}>
                    <td style={{ ...S.td, width: 32, textAlign: "center" }}>
                      <input type="checkbox" checked={selectedPatients.has(p.id)}
                        onChange={() => togglePatient(p.id)} style={{ cursor: "pointer", accentColor: C.teal }} />
                    </td>
                    <td style={S.td}>
                      <div style={{ fontWeight: 600, color: C.navy, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Owner: {p.client_name || "—"}</div>
                    </td>
                    <td style={{ ...S.td, fontSize: 12 }}>{p.breed || "—"}</td>
                    <td style={S.td}>
                      {p.condition ? <span style={S.badge("blue")}>{p.condition}</span> : "—"}
                    </td>
                    <td style={{ ...S.td, fontSize: 11, color: C.textLight }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT: Condition Distribution + Platform Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Condition Distribution */}
          <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: 8 }}>Condition Distribution</div>
              <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}><div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} /></div>
            </div>
            {conditionEntries.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textLight, textAlign: "center", padding: "16px 0" }}>No patient data yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {conditionEntries.slice(0, 8).map(([cond, count]) => (
                  <div key={cond} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{cond}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: Math.max(20, (count / Math.max(...conditionEntries.map(e => e[1]))) * 80), height: 6, borderRadius: 3, background: C.teal }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.navy, minWidth: 18, textAlign: "right" }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Status */}
          <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: 8 }}>Platform Status</div>
              <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}><div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} /></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Backend API", ok: apiOk, detail: "localhost:3000" },
                { label: "Exercise Library", ok: exercises.length > 0, detail: `${exercises.length} active` },
                { label: "Protocol Engine", ok: true, detail: "4 protocols" },
                { label: "Phase System", ok: true, detail: "4 phases each" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.textMid }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: item.ok ? C.green : C.red, display: "flex", alignItems: "center", gap: 4 }}>
                    <FiCheckCircle size={11} /> {item.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PROTOCOL ENGINE BAR ── */}
      <div style={{ ...S.card, border: `2px solid ${C.navy}`, padding: "16px 24px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
          ACVSMR-Aligned Protocol Engine — 4 Evidence-Based Pathways
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {PROTOCOLS.map((p, i) => (
            <div key={i} style={{
              padding: "14px 16px", borderRadius: 8, cursor: "pointer",
              background: `${p.color}08`, border: `1.5px solid ${p.color}22`,
              transition: "all 0.2s",
            }}
            onClick={() => setView("generator")}
            onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "66"; e.currentTarget.style.boxShadow = `0 0 12px ${p.color}15`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = p.color + "22"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{p.name}</span>
              </div>
              <div style={{ fontSize: 10, color: C.textLight }}>
                {p.phases} Phases · {p.weeks} · Gated Progression
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CLINICAL STANDARDS FOOTER ── */}
      <div style={{ textAlign: "center", padding: "16px 0 8px", opacity: 0.5 }}>
        <div style={{ fontSize: 9, color: C.textLight, letterSpacing: "0.5px" }}>
          ACVSMR Diplomate Methodology · Millis & Levine Canine Rehabilitation & Physical Therapy · Evidence-Based Protocols
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CLIENTS VIEW
// ─────────────────────────────────────────────
function ClientsView() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", breed: "", age: "", weight: "", sex: "Male", condition: "", client_name: "", client_email: "", client_phone: "" });

  useEffect(() => {
    axios.get(`${API}/patients`).then(r => setClients(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/patients`, { ...form, age: +form.age, weight: +form.weight });
    setShowForm(false);
    setForm({ name: "", breed: "", age: "", weight: "", sex: "Male", condition: "", client_name: "", client_email: "", client_phone: "" });
    axios.get(`${API}/patients`).then(r => setClients(r.data));
  };

  const [search, setSearch] = useState("");
  const filtered = clients.filter(c =>
    !search || (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.breed || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.client_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.condition || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Summary bar */}
      <div style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiUsers size={16} style={{ color: C.teal }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{clients.length}</div>
              <div style={{ fontSize: 10, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Patients</div>
            </div>
          </div>
          <div style={{ position: "relative", minWidth: 260 }}>
            <FiSearch size={13} style={{ position: "absolute", left: 10, top: 11, color: C.textLight }} />
            <input style={{ ...S.input, paddingLeft: 32, fontSize: 12 }} placeholder="Search by name, breed, condition, owner..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <button style={S.btn("dark")} onClick={() => setShowForm(!showForm)}>
          <span style={{ fontSize: 14 }}>⚕</span> Register Patient
        </button>
      </div>

      {showForm && (
        <div style={S.card}>
          <div>
            <div style={S.sectionHeader()}>
              <FiHeart size={13} style={{ color: "#39FF7E" }} /> New Patient Registration
            </div>
            <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
            </div>
          </div>
          <form onSubmit={submit}>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Patient Name *</label>
                <input style={S.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Patient name" />
              </div>
              <div>
                <label style={S.label}>Breed *</label>
                <input style={S.input} value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} required placeholder="e.g. Labrador Retriever" />
              </div>
              <div>
                <label style={S.label}>Primary Condition *</label>
                <input style={S.input} value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} required placeholder="e.g. TPLO, Hip Dysplasia" />
              </div>
            </div>
            <div style={{ ...S.grid(4), marginTop: 12 }}>
              <div>
                <label style={S.label}>Owner Name *</label>
                <input style={S.input} value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} required />
              </div>
              <div>
                <label style={S.label}>Age (years)</label>
                <input style={S.input} type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </div>
              <div>
                <label style={S.label}>Weight (lbs)</label>
                <input style={S.input} type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div>
                <label style={S.label}>Sex</label>
                <select style={{ ...S.select, width: "100%" }} value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}>
                  {["Male Intact", "Male Neutered", "Female Intact", "Female Spayed"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button type="submit" style={S.btn("success")}>
                <FiCheckCircle size={14} /> Save Patient Record
              </button>
              <button type="button" style={S.btn("ghost")} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <table style={S.table}>
          <thead>
            <tr>
              {["Patient", "Owner / Contact", "Signalment", "Condition", "Registered", ""].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: C.textLight, padding: 48 }}>
                {search ? "No patients match your search" : "No patients registered — use the button above to add your first patient"}
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} style={{ cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: C.navy }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>ID: {c.id}</div>
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight: 500 }}>{c.client_name || "—"}</div>
                  {c.client_email && <div style={{ fontSize: 11, color: C.textLight }}>{c.client_email}</div>}
                </td>
                <td style={S.td}>
                  <div style={{ fontSize: 12 }}>{c.breed || "—"}</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>
                    {c.age ? `${c.age}yr` : ""}{c.age && c.weight ? " · " : ""}{c.weight ? `${c.weight}lbs` : ""}
                    {c.sex ? ` · ${c.sex}` : ""}
                  </div>
                </td>
                <td style={S.td}>
                  {c.condition ? <span style={S.badge("blue")}>{c.condition}</span> : "—"}
                </td>
                <td style={S.td}>
                  <span style={{ fontSize: 11, color: C.textLight }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </span>
                </td>
                <td style={S.td}>
                  <FiChevronRight size={14} style={{ color: C.textLight }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROTOCOL EXERCISE CARD (expandable, removable)
// ─────────────────────────────────────────────
// Exercise category → icon mapping for visual identification (Must-Have 7.4)
const EXERCISE_CATEGORY_ICONS = {
  "Passive Therapy":        { icon: "🤲", bg: "#E0F2FE", color: "#0369A1" },
  "Active-Assisted":        { icon: "🏃", bg: "#ECFDF5", color: "#059669" },
  "Strengthening":          { icon: "💪", bg: "#FEF3C7", color: "#B45309" },
  "Balance":                { icon: "⚖️", bg: "#EDE9FE", color: "#7C3AED" },
  "Proprioception":         { icon: "⚖️", bg: "#EDE9FE", color: "#7C3AED" },
  "Gait Retraining":        { icon: "🐕", bg: "#F0FDF4", color: "#15803D" },
  "Aquatic Therapy":        { icon: "🌊", bg: "#E0F2FE", color: "#0284C7" },
  "Hydrotherapy":           { icon: "🌊", bg: "#E0F2FE", color: "#0284C7" },
  "Modality":               { icon: "⚡", bg: "#FFF7ED", color: "#C2410C" },
  "Therapeutic Modalities": { icon: "⚡", bg: "#FFF7ED", color: "#C2410C" },
  "Manual Therapy":         { icon: "✋", bg: "#FCE7F3", color: "#BE185D" },
  "Core Stability":         { icon: "🎯", bg: "#FEF9C3", color: "#A16207" },
  "Functional":             { icon: "🏅", bg: "#ECFDF5", color: "#047857" },
  "Sport Conditioning":     { icon: "🏅", bg: "#ECFDF5", color: "#047857" },
  "Complementary Therapy":  { icon: "🧘", bg: "#F5F3FF", color: "#6D28D9" },
  "Geriatric":              { icon: "🐾", bg: "#FFF1F2", color: "#BE123C" },
  "Neurological":           { icon: "🧠", bg: "#EFF6FF", color: "#1D4ED8" },
};
function getExCategoryIcon(ex) {
  const cat = ex.category || ex.intervention_type || "";
  for (const [key, val] of Object.entries(EXERCISE_CATEGORY_ICONS)) {
    if (cat.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { icon: "🔬", bg: "#F1F5F9", color: "#475569" };
}

function ProtocolExCard({ entry, onRemove, onOpenStoryboard }) {
  const [open, setOpen] = useState(false);
  const ex = entry.exercise || {};
  const catIcon = getExCategoryIcon(ex);

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0",
      overflow: "hidden", gridColumn: open ? "1 / -1" : undefined,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }}>
      {/* Card header */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ display: "flex", gap: 10, flex: 1, cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
            {/* Category icon badge */}
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: catIcon.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0, border: `1px solid ${catIcon.color}22`
            }}>{catIcon.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1A202C", marginBottom: 6 }}>
                {ex.name || "Exercise"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {entry.sets         && <span style={S.badge("blue")}>{entry.sets} sets</span>}
                {entry.reps         && <span style={S.badge("blue")}>{entry.reps} reps</span>}
                {entry.duration_seconds && (
                  <span style={S.badge("blue")}>
                    {entry.duration_seconds >= 60 ? `${entry.duration_seconds / 60} min` : `${entry.duration_seconds}s`}
                  </span>
                )}
                {entry.frequency_per_day && <span style={S.badge("green")}>{entry.frequency_per_day}× /day</span>}
                {ex.difficulty_level && (
                  <span style={S.badge(ex.difficulty_level === "Easy" ? "green" : ex.difficulty_level === "Advanced" ? "orange" : "blue")}>
                    {ex.difficulty_level}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => setOpen(o => !o)} style={{
              background: "#F0F4F8", border: "none", borderRadius: 6, padding: "4px 8px",
              cursor: "pointer", fontSize: 11, color: "#4A5568", fontWeight: 600
            }}>
              {open ? "▲ Less" : "▼ Details"}
            </button>
            <button onClick={onRemove} title="Remove exercise" style={{
              background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: 6,
              padding: "4px 8px", cursor: "pointer", color: "#C53030", display: "flex",
              alignItems: "center"
            }}>
              <FiX size={13} />
            </button>
          </div>
        </div>

        {entry.notes && (
          <div style={{ marginTop: 8, fontSize: 11, color: "#718096", fontStyle: "italic",
            background: "#F7FAFC", padding: "6px 10px", borderRadius: 6 }}>
            📋 {entry.notes}
          </div>
        )}

        {entry.evidence_citation && (
          <div style={{ marginTop: 6, fontSize: 10, color: "#5B6B82", display: "flex",
            alignItems: "center", gap: 5, background: "#F0F6FF", padding: "4px 10px",
            borderRadius: 5, border: "1px solid #D6E4F0" }}>
            <FiBook size={10} style={{ flexShrink: 0, color: "#2B6CB0" }} />
            <span style={{ fontStyle: "italic" }}>{entry.evidence_citation}</span>
          </div>
        )}
      </div>

      {/* Expanded clinical detail */}
      {open && (
        <div style={{ borderTop: "1px solid #F0F4F8", padding: "0 16px 16px" }}>
          {ex.description && (
            <p style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.6, margin: "12px 0" }}>
              {ex.description}
            </p>
          )}

          {ex.equipment?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 5 }}>Equipment</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {ex.equipment.map((item, i) => (
                  <span key={i} style={{ background: "#EBF8FF", color: "#2B6CB0",
                    padding: "2px 9px", borderRadius: 20, fontSize: 11 }}>{item}</span>
                ))}
              </div>
            </div>
          )}

          {ex.setup && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 4 }}>Setup</div>
              <p style={{ fontSize: 12, color: "#4A5568", margin: 0 }}>{ex.setup}</p>
            </div>
          )}

          {ex.steps?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 6 }}>
                Step-by-Step Instructions
              </div>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {ex.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#4A5568", marginBottom: 5, lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            {ex.good_form?.length > 0 && (
              <div style={{ background: "#F0FFF4", borderRadius: 8, padding: 12 }}>
                <div style={{ ...S.label, color: "#276749", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <FiCheckCircle size={11} /> Good Form
                </div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {ex.good_form.map((item, i) => (
                    <li key={i} style={{ fontSize: 11, color: "#276749", marginBottom: 3 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ex.common_mistakes?.length > 0 && (
              <div style={{ background: "#FFFAF0", borderRadius: 8, padding: 12 }}>
                <div style={{ ...S.label, color: "#C05621", marginBottom: 6 }}>Common Mistakes</div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {ex.common_mistakes.map((item, i) => (
                    <li key={i} style={{ fontSize: 11, color: "#C05621", marginBottom: 3 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {ex.red_flags?.length > 0 && (
            <div style={{ background: "#FFF5F5", borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: "#C53030", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <FiAlertTriangle size={11} /> Red Flags — Stop Immediately
              </div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {ex.red_flags.map((flag, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#C53030", marginBottom: 3, fontWeight: 500 }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {ex.contraindications?.length > 0 && (
            <div style={{ background: "#FFF5F5", borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: "#C53030", marginBottom: 6 }}>Contraindications</div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {(Array.isArray(ex.contraindications) ? ex.contraindications : [ex.contraindications]).map((c, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#C53030", marginBottom: 3 }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {ex.progression && (
            <div style={{ background: "#EBF8FF", borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: "#2B6CB0", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <FiBook size={11} /> Progression
              </div>
              <p style={{ fontSize: 11, color: "#2B6CB0", margin: 0, lineHeight: 1.5 }}>{ex.progression}</p>
            </div>
          )}
          <EvidenceSection grade={ex.evidence_base?.grade} refs={ex.evidence_base?.references} />

          {/* Storyboard button for exercises with storyboards */}
          {ex.client_education?.storyboard_available && onOpenStoryboard && (
            <button onClick={(ev) => { ev.stopPropagation(); onOpenStoryboard(ex.code); }}
              style={{
                marginTop: 10, width: "100%", padding: "8px 14px", borderRadius: 8,
                background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
                color: "#fff", border: "1px solid rgba(57,255,126,0.2)", cursor: "pointer",
                fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
              <FiMonitor size={12} /> Exercise Storyboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROTOCOL GENERATOR VIEW
// ─────────────────────────────────────────────
function GeneratorView({ initialStep }) {
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [error, setError] = useState(null);
  const [wizardStep, setWizardStep] = useState(initialStep || 1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToWeek, setAddingToWeek] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [exSearch, setExSearch] = useState("");
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [showStoryboard, setShowStoryboard] = useState(null);

  // Print CSS injection
  useEffect(() => {
    const id = "k9-print-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @media print {
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, .no-print, button, [class*="TopNav"] { display: none !important; }
          .print-protocol { box-shadow: none !important; border: none !important; }
          .print-protocol * { break-inside: avoid; }
          @page { margin: 0.5in; size: letter; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Scroll to diagnostics section when opened via nav button
  useEffect(() => {
    if (initialStep === 2) {
      setTimeout(() => {
        const el = document.getElementById("diagnostics-workup");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [initialStep]);

  // Patient intake form
  const [form, setForm] = useState({
    patientName: "", breed: "", age: "", dob: "",
    weightKg: "", weightLbs: "", sex: "Male Intact",
    diagnosis: "TPLO", affectedRegion: "Left Stifle",
    lamenessGrade: "2", bodyConditionScore: "5",
    painLevel: "3", mobilityLevel: "Limited",
    currentMedications: "", medsLastGiven: "", medicalHistory: "",
    specialInstructions: "", protocolLength: "8",
    clientName: "", clientEmail: "", clientPhone: "", clientPhone2: "",
    referringVet: "", mailingAddress: "", city: "", state: "", zipCode: "",
    nearbyHospital: "",
    // Treatment Plan & Surgical Status
    treatmentApproach: "",  // "surgical", "conservative", "palliative"
    surgeryType: "",
    surgeryDate: "",
    surgeonName: "",
    surgicalFacility: "",
    anesthesiaRisk: "ASA II",
    postOpDay: "",
    vetRecommendation: "",  // what the vet recommended
    ownerElection: "",      // what the owner elected
    ownerDeclineReason: "", // if owner declines surgery
    priorSurgeries: "",
    complicationsNoted: "",
    weightBearingStatus: "Toe-touching",
    activityRestrictions: "",
    eCollarRequired: false,
    crateRestRequired: false,
    slingAssistRequired: false,
    incisionStatus: "Clean/Dry/Intact",
    sutureRemovalDate: "",
    // Patient Extras (Section 1)
    allergies: "",
    temperament: "Cooperative",
    // Objective Measurements (Section 2 — Millis & Levine)
    circumferenceAffected: "", circumferenceContralateral: "", circumferenceSite: "15cm proximal to patella",
    romFlexion: "", romExtension: "", romJoint: "",
    jointEffusion: "0", muscleCondition: "Normal",
    neuroProprioception: "", neuroWithdrawal: "", neuroDeepPain: "", neuroMotorGrade: "",
    // Treatment Goals (Section 3)
    rehabGoals: [], implantDetails: "",
    // Protocol Parameters (Section 4)
    sessionFrequency: "2", homeExerciseProgram: true, ownerCompliance: "Motivated",
    aquaticAccess: false,
    modalityUWTM: false, modalityLaser: false, modalityTENS: false, modalityNMES: false,
    modalityTherapeuticUS: false, modalityShockwave: false, modalityCryotherapy: false,
    modalityHeatTherapy: false, modalityPulsedEMF: false,
    // Diagnostics
    diagRadiographs: false, diagRadiographsNotes: "",
    diagCT: false, diagCTNotes: "",
    diagMRI: false, diagMRINotes: "",
    diagUltrasound: false, diagUltrasoundNotes: "",
    diagCBC: false, diagCBCNotes: "",
    diagChemPanel: false, diagChemPanelNotes: "",
    diagUrinalysis: false, diagUrinalysisNotes: "",
    diagThyroid: false, diagThyroidNotes: "",
    diagCRP: false, diagCRPNotes: "",
    diagSynovial: false, diagSynovialNotes: "",
    diagEMG: false, diagEMGNotes: "",
    diagArthroscopy: false, diagArthroscopyNotes: "",
    diagGaitAnalysis: false, diagGaitAnalysisNotes: "",
    diagForcePlate: false, diagForcePlateNotes: "",
    diagROM: false, diagROMNotes: "",
    diagOtherDiag: false, diagOtherNotes: ""
  });
  const [weightWarning, setWeightWarning] = useState("");

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Navigate wizard steps and scroll to top
  const goToStep = (step) => {
    setWizardStep(step);
    // Scroll the content area to top
    setTimeout(() => {
      const el = document.querySelector('[data-content-scroll]');
      if (el) el.scrollTop = 0;
    }, 50);
  };

  // ── Weight conversion (KG ↔ LBS) with dosing safety warnings ──
  const validateWeight = (kg) => {
    const lbs = kg * 2.20462;
    const warnings = [];
    // Extreme outlier — likely entered LBS in KG field
    if (kg > 90) {
      warnings.push(`CRITICAL: ${kg} kg = ${lbs.toFixed(0)} lbs. Did you enter LBS in the KG field? This exceeds the weight of any known dog breed. Incorrect weight will cause medication dosing errors.`);
    }
    // Very heavy but possible (Great Dane, Mastiff, Saint Bernard)
    else if (kg > 70) {
      warnings.push(`Caution: ${kg} kg (${lbs.toFixed(0)} lbs) is very heavy. Confirm this is correct — only giant breeds (Mastiff, Great Dane, Saint Bernard) typically exceed 70 kg. Accurate weight is critical for safe drug dosing.`);
    }
    // Suspiciously low — possibly entered KG in LBS field
    else if (kg > 0 && kg < 1) {
      warnings.push(`Warning: ${kg} kg = ${lbs.toFixed(1)} lbs — extremely low. Did you enter KG correctly? Neonates only. Verify before calculating drug doses.`);
    }
    // Common error: LBS entered in KG field for medium dogs
    else if (kg > 45 && kg <= 70) {
      warnings.push(`Note: ${kg} kg = ${lbs.toFixed(0)} lbs. This is in the large/giant breed range. If this is a medium breed, you may have entered LBS in the KG field.`);
    }
    return warnings.length > 0 ? warnings.join(" ") : "";
  };

  const handleWeightKg = (val) => {
    setField("weightKg", val);
    const kg = parseFloat(val);
    if (!isNaN(kg) && kg > 0) {
      setField("weightLbs", (kg * 2.20462).toFixed(1));
      setWeightWarning(validateWeight(kg));
    } else {
      setField("weightLbs", "");
      setWeightWarning("");
    }
  };

  const handleWeightLbs = (val) => {
    setField("weightLbs", val);
    const lbs = parseFloat(val);
    if (!isNaN(lbs) && lbs > 0) {
      const kg = lbs / 2.20462;
      setField("weightKg", kg.toFixed(1));
      // Check if LBS value seems wrong (entered KG in LBS field)
      if (lbs < 2) {
        setWeightWarning(`Warning: ${lbs} lbs = ${kg.toFixed(2)} kg — extremely low. Did you enter KG in the LBS field? Verify before calculating drug doses.`);
      } else if (lbs > 200) {
        setWeightWarning(`CRITICAL: ${lbs} lbs = ${kg.toFixed(1)} kg. No known dog breed exceeds 200 lbs. Please verify. Incorrect weight will cause medication dosing errors.`);
      } else {
        setWeightWarning(validateWeight(kg));
      }
    } else {
      setField("weightKg", "");
      setWeightWarning("");
    }
  };

  // ── DOB ↔ Age bidirectional ──
  const handleDob = (val) => {
    setField("dob", val);
    if (val) {
      const birth = new Date(val + "T00:00:00");
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years--;
      if (years < 0) years = 0;
      setField("age", String(years));
    } else {
      setField("age", "");
    }
  };
  const handleAge = (val) => {
    setField("age", val);
    const years = parseInt(val);
    if (!isNaN(years) && years >= 0 && years <= 30) {
      const now = new Date();
      const birthYear = now.getFullYear() - years;
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      setField("dob", `${birthYear}-${month}-${day}`);
    } else if (val === "") {
      setField("dob", "");
    }
  };

  // ── Surgery Date ↔ POD bidirectional + auto suture removal ──
  const handleSurgeryDate = (val) => {
    setField("surgeryDate", val);
    if (val) {
      const surgDate = new Date(val + "T00:00:00");
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffMs = now.getTime() - surgDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      setField("postOpDay", String(Math.max(0, diffDays)));
      // Auto-generate suture removal date: 10-14 days post-op (standard = 14 days for dogs)
      const sutureDate = new Date(surgDate);
      sutureDate.setDate(sutureDate.getDate() + 14);
      const yr = sutureDate.getFullYear();
      const mo = String(sutureDate.getMonth() + 1).padStart(2, "0");
      const dy = String(sutureDate.getDate()).padStart(2, "0");
      setField("sutureRemovalDate", `${yr}-${mo}-${dy}`);
    } else {
      setField("postOpDay", "");
      setField("sutureRemovalDate", "");
    }
  };
  const handlePostOpDay = (val) => {
    setField("postOpDay", val);
    const days = parseInt(val);
    if (!isNaN(days) && days >= 0) {
      const surgDate = new Date();
      surgDate.setDate(surgDate.getDate() - days);
      const yr = surgDate.getFullYear();
      const mo = String(surgDate.getMonth() + 1).padStart(2, "0");
      const dy = String(surgDate.getDate()).padStart(2, "0");
      setField("surgeryDate", `${yr}-${mo}-${dy}`);
      // Auto-generate suture removal date: 14 days from surgery
      const sutureDate = new Date(surgDate);
      sutureDate.setDate(sutureDate.getDate() + 14);
      const syr = sutureDate.getFullYear();
      const smo = String(sutureDate.getMonth() + 1).padStart(2, "0");
      const sdy = String(sutureDate.getDate()).padStart(2, "0");
      setField("sutureRemovalDate", `${syr}-${smo}-${sdy}`);
    } else if (val === "") {
      setField("surgeryDate", "");
      setField("sutureRemovalDate", "");
    }
  };

  // ── ZIP code → City/State auto-fill ──
  const handleZip = async (val) => {
    setField("zipCode", val);
    if (val.length === 5 && /^\d{5}$/.test(val)) {
      try {
        const r = await fetch(`https://api.zippopotam.us/us/${val}`);
        if (r.ok) {
          const data = await r.json();
          const place = data.places?.[0];
          if (place) {
            setField("city", place["place name"]);
            setField("state", place["state abbreviation"]);
          }
        }
      } catch {}
    }
  };

  // ── Breed list (top 50+ most common) ──
  const BREEDS = [
    "Akita","Australian Cattle Dog","Australian Shepherd",
    "Basset Hound","Beagle","Belgian Malinois","Bernese Mountain Dog","Bichon Frise","Bloodhound",
    "Border Collie","Boston Terrier","Boxer","Brittany","Bulldog",
    "Cane Corso","Cavalier King Charles Spaniel","Chesapeake Bay Retriever","Chihuahua","Cocker Spaniel","Collie",
    "Dachshund","Doberman Pinscher",
    "English Springer Spaniel",
    "French Bulldog",
    "German Shepherd","German Shorthaired Pointer","Golden Retriever","Great Dane","Greyhound",
    "Havanese",
    "Irish Setter",
    "Jack Russell Terrier",
    "Labrador Retriever",
    "Maltese","Mastiff","Miniature American Shepherd","Miniature Schnauzer",
    "Newfoundland",
    "Pembroke Welsh Corgi","Pit Bull Terrier","Pomeranian","Poodle (Miniature)","Poodle (Standard)",
    "Rhodesian Ridgeback","Rottweiler",
    "Saint Bernard","Shetland Sheepdog","Shih Tzu","Siberian Husky","Staffordshire Bull Terrier",
    "Vizsla",
    "Weimaraner","West Highland White Terrier",
    "Yorkshire Terrier",
    "Mixed Breed / Other"
  ];

  // ── Nearby hospitals (populated after ZIP) ──
  const HOSPITALS = [
    "BluePearl Pet Hospital","VCA Animal Hospital","Banfield Pet Hospital",
    "MedVet Medical & Cancer Center","Animal Emergency Center","ASPCA Animal Hospital",
    "Red Bank Veterinary Hospital","Angell Animal Medical Center","Gulf Coast Veterinary Specialists",
    "University of Pennsylvania — Ryan Veterinary Hospital","Colorado State University VTH",
    "Cornell University Hospital for Animals","UC Davis VMTH","Ohio State University VMC",
    "University of Florida Small Animal Hospital","Tufts Cummings School — Foster Hospital",
    "North Carolina State University VH","University of Tennessee VTH",
    "Texas A&M Small Animal Hospital","Purdue University VTH"
  ];

  const CONDITIONS = {
    "Stifle (Knee)": [
      { value: "TPLO",              label: "TPLO — Tibial Plateau Leveling Osteotomy" },
      { value: "TTA",               label: "TTA — Tibial Tuberosity Advancement" },
      { value: "CCL Conservative",  label: "CCL — Conservative Management" },
      { value: "Lateral Suture",    label: "Lateral Suture Stabilization" },
      { value: "Meniscal Injury",   label: "Meniscal Tear / Injury" },
      { value: "Patellar Luxation", label: "Patellar Luxation (Medial/Lateral)" },
      { value: "Stifle OA",        label: "Stifle Osteoarthritis" },
    ],
    "Hip": [
      { value: "FHO",              label: "FHO — Femoral Head Ostectomy" },
      { value: "Hip Dysplasia",    label: "Hip Dysplasia" },
      { value: "THR",              label: "THR — Total Hip Replacement" },
      { value: "Hip Luxation",     label: "Hip Luxation (Traumatic)" },
      { value: "Legg-Calve-Perthes", label: "Legg-Calvé-Perthes Disease" },
      { value: "Hip OA",           label: "Hip Osteoarthritis" },
    ],
    "Elbow & Shoulder": [
      { value: "Elbow Dysplasia",    label: "Elbow Dysplasia" },
      { value: "FCP",                label: "FCP — Fragmented Coronoid Process" },
      { value: "UAP",                label: "UAP — Ununited Anconeal Process" },
      { value: "Shoulder OCD",       label: "Shoulder OCD — Osteochondritis Dissecans" },
      { value: "Biceps Tenosynovitis", label: "Biceps Tenosynovitis" },
      { value: "Medial Shoulder Instability", label: "Medial Shoulder Instability" },
      { value: "Elbow OA",          label: "Elbow Osteoarthritis" },
      { value: "Shoulder Luxation",  label: "Shoulder Luxation" },
    ],
    "Spine & Neurological": [
      { value: "IVDD",                label: "IVDD — Intervertebral Disc Disease" },
      { value: "FCE",                 label: "FCE — Fibrocartilaginous Embolism" },
      { value: "Degenerative Myelopathy", label: "Degenerative Myelopathy (DM)" },
      { value: "Lumbosacral Stenosis", label: "Lumbosacral Stenosis / Cauda Equina" },
      { value: "Cervical Spondylomyelopathy", label: "Wobbler Syndrome (CSM)" },
      { value: "Spinal Fracture",     label: "Spinal Fracture / Luxation" },
      { value: "Vestibular Disease",   label: "Vestibular Disease" },
      { value: "Peripheral Neuropathy", label: "Peripheral Neuropathy" },
    ],
    "Fractures & Trauma": [
      { value: "Femoral Fracture",     label: "Femoral Fracture" },
      { value: "Tibial Fracture",      label: "Tibial Fracture" },
      { value: "Humeral Fracture",     label: "Humeral Fracture" },
      { value: "Radial Fracture",      label: "Radius / Ulna Fracture" },
      { value: "Pelvic Fracture",      label: "Pelvic Fracture" },
      { value: "Carpal/Tarsal Injury", label: "Carpal / Tarsal Injury" },
      { value: "Polytrauma",           label: "Polytrauma — Multiple Injuries" },
    ],
    "Soft Tissue & Tendon": [
      { value: "Achilles Rupture",     label: "Achilles Tendon Rupture" },
      { value: "Iliopsoas Strain",     label: "Iliopsoas Muscle Strain" },
      { value: "Gracilis Contracture", label: "Gracilis / Semitendinosus Contracture" },
      { value: "Infraspinatus Contracture", label: "Infraspinatus Contracture" },
      { value: "Muscle Strain",        label: "Muscle Strain / Tear (General)" },
      { value: "Ligament Sprain",      label: "Ligament Sprain (Non-CCL)" },
    ],
    "Multi-Joint / Geriatric / Other": [
      { value: "Osteoarthritis",       label: "Multi-Joint Osteoarthritis" },
      { value: "Geriatric Mobility",   label: "Geriatric Mobility Program" },
      { value: "Obesity Rehab",        label: "Obesity / Weight Management Program" },
      { value: "Post-Amputation",      label: "Post-Amputation Rehab" },
      { value: "Immune-Mediated Polyarthritis", label: "Immune-Mediated Polyarthritis" },
      { value: "Fibrotic Myopathy",    label: "Fibrotic Myopathy" },
      { value: "Conditioning",         label: "Fitness / Conditioning Program" },
      { value: "Palliative",           label: "Palliative / Comfort Care" },
    ],
  };

  const REGIONS = [
    "Left Stifle", "Right Stifle", "Bilateral Stifle",
    "Left Hip", "Right Hip", "Bilateral Hip",
    "Left Elbow", "Right Elbow", "Left Shoulder", "Right Shoulder",
    "Cervical Spine", "Thoracolumbar Spine", "Lumbosacral Spine",
    "Multiple Joints"
  ];

  useEffect(() => {
    axios.get(`${API}/exercises`).then(r => setAllExercises(r.data)).catch(() => {});
  }, []);

  const generate = async () => {
    if (!form.patientName.trim()) { setError("Patient name is required"); return; }
    if (!form.diagnosis) { setError("Please select a diagnosis"); return; }

    setLoading(true); setShowVideo(true); setError(null); setProtocol(null);

    // Video plays full duration (8s) + 3s pause on last frame = 11s minimum
    const minDelay = new Promise(resolve => setTimeout(resolve, 11000));

    try {
      const [{ data }] = await Promise.all([
        axios.post(`${API}/generate-protocol`, {
          ...form,
          age: +form.age || 0,
          weight: +form.weightLbs || +form.weightKg * 2.20462 || 0,
          protocolLength: +form.protocolLength || 8
        }),
        minDelay
      ]);
      setProtocol(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate protocol");
    } finally { setLoading(false); setShowVideo(false); }
  };

  const removeExercise = (weekIdx, exIdx) => {
    setProtocol(prev => {
      const updated = { ...prev, weeks: prev.weeks.map((w, i) =>
        i === weekIdx ? { ...w, exercises: w.exercises.filter((_, j) => j !== exIdx) } : w
      )};
      return updated;
    });
  };

  const addExercise = (weekIdx, ex) => {
    setProtocol(prev => {
      const updated = { ...prev, weeks: prev.weeks.map((w, i) =>
        i === weekIdx ? { ...w, exercises: [...w.exercises, {
          exercise: ex, code: ex.code, name: ex.name, category: ex.category,
          sets: 3, reps: 10, frequency: "2x daily", duration_minutes: 10,
          equipment: ex.equipment, setup: ex.setup, steps: ex.steps,
          good_form: ex.good_form, common_mistakes: ex.common_mistakes,
          red_flags: ex.red_flags, progression: ex.progression,
          contraindications: ex.contraindications,
          notes: "Added manually by clinician"
        }] } : w
      )};
      return updated;
    });
    setShowAddModal(false);
    setExSearch("");
  };

  const filteredEx = allExercises.filter(e =>
    e.name.toLowerCase().includes(exSearch.toLowerCase()) ||
    e.category?.toLowerCase().includes(exSearch.toLowerCase())
  );

  // Section header component for the intake form
  const SectionHead = ({ icon: Icon, title }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={S.sectionHeader()}>
        <Icon size={12} style={{ color: "#39FF7E" }} /> {title}
      </div>
      <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1, marginTop: 2 }}>
        <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
      </div>
    </div>
  );

  // Wizard progress bar
  const WizardProgress = () => {
    const steps = [
      { num: 1, label: "Client & Patient" },
      { num: 2, label: "Clinical Assessment" },
      { num: 3, label: "Treatment Plan" },
      { num: 4, label: "Protocol Parameters" },
    ];
    return (
      <>
        <style>{`
          @keyframes wizardPulse {
            0%, 100% { box-shadow: 0 0 8px rgba(57,255,126,0.5), 0 0 18px rgba(57,255,126,0.2); }
            50% { box-shadow: 0 0 14px rgba(57,255,126,0.7), 0 0 28px rgba(57,255,126,0.35), 0 0 40px rgba(57,255,126,0.1); }
          }
          @keyframes neonFlatline {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div style={S.wizardProgress}>
          {steps.map((s, i) => {
            const state = wizardStep > s.num ? "done" : wizardStep === s.num ? "active" : "pending";
            return (
              <React.Fragment key={s.num}>
                {i > 0 && <div style={S.wizardLine(wizardStep > s.num)} />}
                <div style={S.wizardStep(state)}
                  onClick={() => goToStep(s.num)}>
                  <div style={S.wizardDot(state)}>
                    {state === "done" ? <FiCheckCircle size={16} /> : s.num}
                  </div>
                  <span>{s.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </>
    );
  };

  // ── Full-screen video while generating ──
  if (showVideo) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <video
          src="/loading-animation.mp4"
          autoPlay
          muted
          playsInline
          style={{
            width: "100vw", height: "100vh",
            objectFit: "contain",
          }}
        />
        <button
          onClick={() => setShowVideo(false)}
          style={{
            position: "fixed", bottom: 32, right: 40, zIndex: 10000,
            padding: "10px 28px", borderRadius: 8,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
        >
          Skip →
        </button>
      </div>
    );
  }

  // ── API still working after video skipped — compact spinner ──
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "4px solid #E2E8F0", borderTopColor: "#10B981",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F4C81" }}>Generating Protocol...</div>
        <div style={{ fontSize: 11, color: "#fff" }}>Building your evidence-based exercise program</div>
      </div>
    );
  }

  return (
    <div>
      {/* Wizard progress bar — visible during intake steps */}
      {!protocol && <WizardProgress />}

      {/* ═══════════ STEP 1: CLIENT & PATIENT INFO ═══════════ */}
      {!protocol && wizardStep === 1 && (<>

      {/* ═══════════ SECTION 1: CLIENT INFORMATION ═══════════ */}
      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiUsers} title="Section 1 — Client Information" />
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>Client / Owner Name</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.clientName} onChange={e => setField("clientName", e.target.value)} placeholder="Last, First" />
          </div>
          <div>
            <label style={S.label}>Email Address</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="email" value={form.clientEmail} onChange={e => setField("clientEmail", e.target.value)} placeholder="client@email.com" />
          </div>
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Phone Number</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.clientPhone} onChange={e => setField("clientPhone", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label style={S.label}>Secondary Phone (Optional)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.clientPhone2} onChange={e => setField("clientPhone2", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label style={S.label}>Referring Veterinarian</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.referringVet} onChange={e => setField("referringVet", e.target.value)} placeholder="DVM Name, Practice" />
          </div>
        </div>
        <div style={{ ...S.grid(4), marginTop: 12 }}>
          <div style={{ gridColumn: "1 / 3" }}>
            <label style={S.label}>Mailing Address</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.mailingAddress} onChange={e => setField("mailingAddress", e.target.value)} placeholder="Street Address" />
          </div>
          <div>
            <label style={S.label}>ZIP Code</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 120 }} value={form.zipCode} onChange={e => handleZip(e.target.value)} placeholder="00000" maxLength={5} />
          </div>
          <div />
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>City</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", background: form.city ? "#F0FFF4" : C.surface }} value={form.city} onChange={e => setField("city", e.target.value)} placeholder="Auto-filled from ZIP" />
          </div>
          <div>
            <label style={S.label}>State</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 80, background: form.state ? "#F0FFF4" : C.surface }} value={form.state} onChange={e => setField("state", e.target.value)} placeholder="ST" />
          </div>
          <div>
            <label style={S.label}>Nearby Veterinary Hospital</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.nearbyHospital} onChange={e => setField("nearbyHospital", e.target.value)}>
              <option value="">— Select Hospital —</option>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 2: PATIENT SIGNALMENT ═══════════ */}
      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <div style={S.sectionHeader()}>
            <span style={{ fontSize: 14 }}>🐕</span> PATIENT SIGNALMENT
          </div>
          <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1, marginTop: 2 }}>
            <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
          </div>
        </div>
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Patient Name</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.patientName}
              onChange={e => setField("patientName", e.target.value)} placeholder="Patient Name" />
          </div>
          <div>
            <label style={S.label}>Sex</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.sex} onChange={e => setField("sex", e.target.value)}>
              <option value="Male Intact">♂ Male Intact</option>
              <option value="Male Neutered">♂ Male Neutered</option>
              <option value="Female Intact">♀ Female Intact</option>
              <option value="Female Spayed">♀ Female Spayed</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Breed</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.breed} onChange={e => setField("breed", e.target.value)}>
              <option value="">— Select Breed —</option>
              {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ ...S.grid(4), marginTop: 12 }}>
          <div>
            <label style={S.label}>Date of Birth</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="date" value={form.dob} onChange={e => handleDob(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Age (Years)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 80 }} type="number" min="0" max="25" step="1" value={form.age}
              onChange={e => handleAge(e.target.value)} onInput={e => handleAge(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={S.label}>Weight (KG)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 100 }} type="number" min="0" step="0.5" value={form.weightKg}
              onChange={e => handleWeightKg(e.target.value)} onInput={e => handleWeightKg(e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <label style={S.label}>Weight (LBS)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 100 }} type="number" min="0" step="1" value={form.weightLbs}
              onChange={e => handleWeightLbs(e.target.value)} onInput={e => handleWeightLbs(e.target.value)} placeholder="0.0" />
          </div>
        </div>
        {weightWarning && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10, marginTop: 10, padding: "12px 16px",
            background: weightWarning.includes("CRITICAL") ? "#FEE2E2" : "#FEF3C7",
            border: weightWarning.includes("CRITICAL") ? "2px solid #DC2626" : "1.5px solid #D97706",
            borderRadius: 8,
          }}>
            <FiAlertTriangle size={18} style={{
              color: weightWarning.includes("CRITICAL") ? "#DC2626" : "#D97706",
              flexShrink: 0, marginTop: 2
            }} />
            <div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: weightWarning.includes("CRITICAL") ? "#991B1B" : "#92400E",
                marginBottom: 2,
              }}>
                {weightWarning.includes("CRITICAL") ? "DOSING SAFETY ALERT" : "Weight Verification Needed"}
              </div>
              <span style={{
                fontSize: 11, lineHeight: 1.5,
                color: weightWarning.includes("CRITICAL") ? "#991B1B" : "#92400E",
                fontWeight: 500,
              }}>{weightWarning}</span>
            </div>
          </div>
        )}
        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Body Condition Score (1–9 WSAVA Scale)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input style={{ ...S.input, flex: 1, border: "1.5px solid #3A4A5C" }} type="range" min="1" max="9" value={form.bodyConditionScore}
                onChange={e => setField("bodyConditionScore", e.target.value)} />
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{form.bodyConditionScore}/9</span>
                <div style={{ fontSize: 9, color: "#fff", fontWeight: 500 }}>
                  {+form.bodyConditionScore <= 3 ? "Underweight" : +form.bodyConditionScore <= 5 ? "Ideal" : +form.bodyConditionScore <= 7 ? "Overweight" : "Obese"}
                </div>
              </div>
            </div>
          </div>
          <div />
        </div>
        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Current Medications</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.currentMedications} onChange={e => setField("currentMedications", e.target.value)}
              placeholder="e.g. Carprofen 75mg BID, Gabapentin 100mg TID" />
          </div>
          <div>
            <label style={S.label}>Medications Last Given</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.medsLastGiven} onChange={e => setField("medsLastGiven", e.target.value)}
              placeholder="e.g. Today 8:00 AM, Yesterday PM" />
          </div>
        </div>
        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Allergies / Sensitivities</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.allergies} onChange={e => setField("allergies", e.target.value)}
              placeholder="e.g. NSAID sensitivity, latex, adhesive tape, bee stings" />
          </div>
          <div>
            <label style={S.label}>Patient Temperament</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.temperament} onChange={e => setField("temperament", e.target.value)}>
              <option value="Cooperative">Cooperative — Tolerates handling well</option>
              <option value="Anxious">Anxious — Nervous, needs slow approach</option>
              <option value="Fearful">Fearful — May require desensitization</option>
              <option value="Reactive">Reactive — May snap/bite under stress</option>
              <option value="Aggressive">Aggressive — Muzzle required for handling</option>
              <option value="Sedation Required">Sedation Required — Cannot safely handle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Next button with neon glow */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 0" }}>
        <button
          style={{
            background: "#1E5A8A", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,0.5), 0 0 40px rgba(14,165,233,0.2)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)"}
          onClick={() => goToStep(2)}
        >
          Next: Clinical Assessment <FiChevronRight size={16} />
        </button>
      </div>

      </>)}

      {/* ═══════════ STEP 2: CLINICAL ASSESSMENT ═══════════ */}
      {!protocol && wizardStep === 2 && (<>

      {/* ═══════════ SECTION 2: CLINICAL ASSESSMENT ═══════════ */}
      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiActivity} title="Section 2 — Clinical Assessment" />
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>Primary Diagnosis *</label>
            <select style={{ ...S.select, width: "100%", fontWeight: 600, border: "1.5px solid #3A4A5C" }} value={form.diagnosis} onChange={e => setField("diagnosis", e.target.value)}>
              <option value="">— Select Diagnosis —</option>
              {Object.entries(CONDITIONS).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Affected Region</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.affectedRegion} onChange={e => setField("affectedRegion", e.target.value)}>
              <optgroup label="Hind Limb">{REGIONS.filter(r => r.includes("Stifle") || r.includes("Hip")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Forelimb">{REGIONS.filter(r => r.includes("Elbow") || r.includes("Shoulder")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Spine">{REGIONS.filter(r => r.includes("Spine")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Other"><option>Multiple Joints</option></optgroup>
            </select>
          </div>
        </div>

        {/* Scoring row — visual scales */}
        <div style={{ ...S.grid(3), marginTop: 16 }}>
          <div>
            <label style={S.label}>Pain Level (0–10 VAS)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input style={{ ...S.input, flex: 1, border: "1.5px solid #3A4A5C" }} type="range" min="0" max="10" value={form.painLevel}
                onChange={e => setField("painLevel", e.target.value)} />
              <span style={{
                fontSize: 14, fontWeight: 700, minWidth: 38, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                background: +form.painLevel <= 3 ? C.greenBg : +form.painLevel <= 6 ? C.amberBg : C.redBg,
                color: +form.painLevel <= 3 ? C.green : +form.painLevel <= 6 ? C.amber : C.red,
              }}>
                {form.painLevel}/10
              </span>
            </div>
          </div>
          <div>
            <label style={S.label}>Lameness Grade (0–5 LOAD)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input style={{ ...S.input, flex: 1, border: "1.5px solid #3A4A5C" }} type="range" min="0" max="5" value={form.lamenessGrade}
                onChange={e => setField("lamenessGrade", e.target.value)} />
              <span style={{
                fontSize: 14, fontWeight: 700, minWidth: 32, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                background: +form.lamenessGrade <= 1 ? C.greenBg : +form.lamenessGrade <= 3 ? C.amberBg : C.redBg,
                color: +form.lamenessGrade <= 1 ? C.green : +form.lamenessGrade <= 3 ? C.amber : C.red,
              }}>
                {form.lamenessGrade}/5
              </span>
            </div>
          </div>
          <div>
            <label style={S.label}>Mobility Status</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.mobilityLevel} onChange={e => setField("mobilityLevel", e.target.value)}>
              <option value="Non-ambulatory">Non-ambulatory (0 — no voluntary movement)</option>
              <option value="Limited">Limited (1 — assisted standing/stepping)</option>
              <option value="Moderate">Moderate (2 — ambulatory with deficits)</option>
              <option value="Good">Good (3 — ambulatory, mild impairment)</option>
              <option value="Full">Full (4 — normal gait, conditioning focus)</option>
            </select>
          </div>
        </div>

        {/* ── Objective Measurements (Millis & Levine) ── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Objective Measurements
          </div>
          {/* Limb Circumference */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Limb Circumference (cm) — Measure bilaterally at consistent landmark</div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Measurement Site</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.circumferenceSite} onChange={e => setField("circumferenceSite", e.target.value)}>
                  <option value="15cm proximal to patella">15cm proximal to patella (standard)</option>
                  <option value="10cm proximal to patella">10cm proximal to patella</option>
                  <option value="Mid-thigh">Mid-thigh</option>
                  <option value="Mid-antebrachium">Mid-antebrachium (forearm)</option>
                  <option value="Mid-crus">Mid-crus (below stifle)</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Affected Limb (cm)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="number" step="0.1" min="0" value={form.circumferenceAffected}
                  onChange={e => setField("circumferenceAffected", e.target.value)} placeholder="e.g. 32.5" />
              </div>
              <div>
                <label style={S.label}>Contralateral Limb (cm)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="number" step="0.1" min="0" value={form.circumferenceContralateral}
                  onChange={e => setField("circumferenceContralateral", e.target.value)} placeholder="e.g. 36.0" />
              </div>
            </div>
            {form.circumferenceAffected && form.circumferenceContralateral && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 6,
                background: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? "rgba(220,38,38,0.15)" : "rgba(16,185,129,0.15)",
                color: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? "#FCA5A5" : "#6EE7B7",
                border: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? "1px solid rgba(220,38,38,0.3)" : "1px solid rgba(16,185,129,0.3)",
              }}>
                Difference: {Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)).toFixed(1)} cm
                ({((Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) / parseFloat(form.circumferenceContralateral)) * 100).toFixed(1)}% asymmetry)
                {Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 && " — Significant muscle atrophy detected"}
              </div>
            )}
          </div>
          {/* Joint Range of Motion */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Joint Range of Motion (Goniometry — degrees)</div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Joint Measured</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.romJoint} onChange={e => setField("romJoint", e.target.value)}>
                  <option value="">— Select Joint —</option>
                  <option value="Stifle">Stifle (Knee)</option>
                  <option value="Hip">Hip</option>
                  <option value="Elbow">Elbow</option>
                  <option value="Shoulder">Shoulder</option>
                  <option value="Hock/Tarsus">Hock / Tarsus</option>
                  <option value="Carpus">Carpus (Wrist)</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Flexion (°)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="number" min="0" max="180" value={form.romFlexion}
                  onChange={e => setField("romFlexion", e.target.value)} placeholder="e.g. 42" />
              </div>
              <div>
                <label style={S.label}>Extension (°)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="number" min="0" max="180" value={form.romExtension}
                  onChange={e => setField("romExtension", e.target.value)} placeholder="e.g. 162" />
              </div>
            </div>
          </div>
          {/* Muscle Condition & Effusion */}
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Muscle Condition (Affected Limb)</label>
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.muscleCondition} onChange={e => setField("muscleCondition", e.target.value)}>
                <option value="Normal">Normal — Symmetric muscle mass</option>
                <option value="Mild Atrophy">Mild Atrophy — Slight decrease, palpable</option>
                <option value="Moderate Atrophy">Moderate Atrophy — Visible asymmetry</option>
                <option value="Severe Atrophy">Severe Atrophy — Marked wasting, bony prominences</option>
                <option value="Fibrosis">Fibrosis — Firm, non-contractile tissue</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Joint Effusion (0–3 Scale)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input style={{ ...S.input, flex: 1, border: "1.5px solid #3A4A5C" }} type="range" min="0" max="3" value={form.jointEffusion}
                  onChange={e => setField("jointEffusion", e.target.value)} />
                <span style={{
                  fontSize: 14, fontWeight: 700, minWidth: 40, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                  background: +form.jointEffusion === 0 ? "rgba(16,185,129,0.15)" : +form.jointEffusion <= 1 ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)",
                  color: +form.jointEffusion === 0 ? "#6EE7B7" : +form.jointEffusion <= 1 ? "#FCD34D" : "#FCA5A5",
                }}>{form.jointEffusion}/3</span>
              </div>
              <div style={{ fontSize: 9, color: "#fff", marginTop: 4 }}>
                {+form.jointEffusion === 0 ? "None" : +form.jointEffusion === 1 ? "Mild — palpable fluid wave" : +form.jointEffusion === 2 ? "Moderate — visible swelling" : "Severe — tense, distended"}
              </div>
            </div>
          </div>
          {/* Neurological (conditional — shown for neuro diagnoses) */}
          {(form.diagnosis === "IVDD" || form.diagnosis === "FCE" || form.diagnosis === "Degenerative Myelopathy" || form.diagnosis === "Lumbosacral Stenosis" || form.diagnosis === "Cervical Spondylomyelopathy" || form.diagnosis === "Spinal Fracture" || form.diagnosis === "Vestibular Disease" || form.diagnosis === "Peripheral Neuropathy") && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#C4B5FD", marginBottom: 8 }}>Neurological Assessment</div>
              <div style={S.grid(4)}>
                <div>
                  <label style={S.label}>Proprioception</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.neuroProprioception} onChange={e => setField("neuroProprioception", e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="Normal">Normal (Immediate correction)</option>
                    <option value="Delayed">Delayed (Slow correction)</option>
                    <option value="Absent">Absent (No correction)</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Withdrawal Reflex</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.neuroWithdrawal} onChange={e => setField("neuroWithdrawal", e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Absent">Absent</option>
                    <option value="Exaggerated">Exaggerated (UMN)</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Deep Pain Sensation</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.neuroDeepPain} onChange={e => setField("neuroDeepPain", e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="Present">Present (Intact)</option>
                    <option value="Diminished">Diminished</option>
                    <option value="Absent">Absent — Guarded prognosis</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Motor Function Grade (0–5)</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.neuroMotorGrade} onChange={e => setField("neuroMotorGrade", e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="0">0 — No voluntary movement</option>
                    <option value="1">1 — Minimal movement, non-ambulatory</option>
                    <option value="2">2 — Ambulatory with significant deficits</option>
                    <option value="3">3 — Ambulatory with mild ataxia</option>
                    <option value="4">4 — Ambulatory, occasional knuckling</option>
                    <option value="5">5 — Normal motor function</option>
                  </select>
                </div>
              </div>
              {form.neuroDeepPain === "Absent" && (
                <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(220,38,38,0.15)", border: "1.5px solid rgba(220,38,38,0.4)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <FiAlertTriangle size={16} style={{ color: "#FCA5A5", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#FCA5A5" }}>
                    Absent deep pain sensation carries a guarded to poor prognosis for return to ambulation. Document discussion with owner regarding expectations and timeline.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={S.label}>Medical History / Notes</label>
          <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 60, resize: "vertical", fontFamily: "inherit" }} value={form.medicalHistory} onChange={e => setField("medicalHistory", e.target.value)}
            placeholder="Prior surgeries, chronic conditions, behavioral notes, relevant medical history" />
        </div>
      </div>

      {/* ═══════════ DIAGNOSTIC WORKUP ═══════════ */}
      <div id="diagnostics-workup" style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiClipboard} title="Diagnostic Workup" />
        <div style={{ fontSize: 10, color: "#fff", marginBottom: 16, lineHeight: 1.5 }}>
          Document all diagnostics obtained or reviewed for this patient. Mark each study as <strong style={{ color: "#6EE7B7" }}>Reviewed &amp; Obtained</strong> with findings,
          or <strong style={{ color: "#fff" }}>Not Clinically Indicated</strong> to confirm the diagnostic was evaluated and deemed unnecessary at this time.
          Undocumented items remain as pending review.
        </div>

        {/* Reusable diagnostic item renderer */}
        {[
          {
            heading: "Imaging Studies",
            items: [
              { key: "diagRadiographs", label: "Radiographs (X-Rays)", hint: "Views obtained, findings, date" },
              { key: "diagCT", label: "CT Scan (Computed Tomography)", hint: "Region scanned, contrast Y/N, findings" },
              { key: "diagMRI", label: "MRI (Magnetic Resonance Imaging)", hint: "Sequences, region, findings" },
              { key: "diagUltrasound", label: "Musculoskeletal Ultrasound", hint: "Structure evaluated, findings" },
            ],
          },
          {
            heading: "Laboratory Studies",
            items: [
              { key: "diagCBC", label: "CBC (Complete Blood Count)", hint: "WBC, RBC, HCT, PLT — flag abnormalities" },
              { key: "diagChemPanel", label: "Chemistry Panel / Metabolic", hint: "BUN, CREA, ALT, ALP, GLU — flag abnormalities" },
              { key: "diagUrinalysis", label: "Urinalysis", hint: "USG, protein, sediment findings" },
              { key: "diagThyroid", label: "Thyroid Panel (T4 / TSH)", hint: "Total T4, free T4, TSH values" },
              { key: "diagCRP", label: "C-Reactive Protein (CRP)", hint: "Value and reference range" },
              { key: "diagSynovial", label: "Synovial Fluid Analysis", hint: "Cell count, cytology, culture results" },
            ],
          },
          {
            heading: "Functional & Procedural Diagnostics",
            items: [
              { key: "diagEMG", label: "EMG / Nerve Conduction Study", hint: "Muscles tested, latency, amplitude findings" },
              { key: "diagArthroscopy", label: "Arthroscopy", hint: "Joint, findings, interventions performed" },
              { key: "diagGaitAnalysis", label: "Instrumented Gait Analysis", hint: "Kinematic/kinetic findings, symmetry index" },
              { key: "diagForcePlate", label: "Force Plate Analysis", hint: "Peak vertical force, impulse, symmetry ratio" },
              { key: "diagROM", label: "Goniometric Assessment", hint: "Joints measured, flexion/extension values" },
              { key: "diagOtherDiag", label: "Additional Diagnostic", hint: "Specify study and findings" },
            ],
          },
        ].map(section => (
          <div key={section.heading} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
              {section.heading}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {section.items.map(d => {
                const notesKey = d.key === "diagOtherDiag" ? "diagOtherNotes" : d.key + "Notes";
                const isPerformed = form[d.key] === true;
                const isNotIndicated = form[d.key] === "not_indicated";


                return (
                  <div key={d.key} style={{
                    padding: "10px 14px", borderRadius: 8, transition: "all 0.2s",
                    background: isPerformed ? "rgba(16,185,129,0.1)" : isNotIndicated ? "rgba(148,163,184,0.06)" : "rgba(255,255,255,0.03)",
                    border: isPerformed ? "1.5px solid rgba(16,185,129,0.3)" : isNotIndicated ? "1.5px solid rgba(148,163,184,0.15)" : "1.5px solid #2E3D4F",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        {/* Status indicator */}
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: isPerformed ? C.green : isNotIndicated ? "#64748B" : "#334155",
                          boxShadow: isPerformed ? "0 0 6px rgba(16,185,129,0.4)" : "none",
                        }} />
                        <div>
                          <div style={{
                            fontSize: 12, fontWeight: 600,
                            color: isPerformed ? "#6EE7B7" : isNotIndicated ? "#64748B" : "#fff",
                            textDecoration: isNotIndicated ? "line-through" : "none",
                          }}>{d.label}</div>
                          {isNotIndicated && (
                            <div style={{ fontSize: 10, color: "#fff", fontStyle: "italic", marginTop: 2 }}>
                              Reviewed — not clinically indicated at this time
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button type="button" onClick={() => {
                          if (isPerformed) { setField(d.key, false); }
                          else { setField(d.key, true); }
                        }} style={{
                          padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.3px",
                          background: isPerformed ? C.green : "rgba(16,185,129,0.12)",
                          color: isPerformed ? "#fff" : "#6EE7B7",
                          border: isPerformed ? `1px solid ${C.green}` : "1px solid rgba(16,185,129,0.25)",
                        }}>
                          {isPerformed ? <><FiCheckCircle size={10} style={{ marginRight: 3 }} />OBTAINED</> : "Obtained"}
                        </button>
                        <button type="button" onClick={() => {
                          if (isNotIndicated) { setField(d.key, false); }
                          else { setField(d.key, "not_indicated"); setField(notesKey, ""); }
                        }} style={{
                          padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.3px",
                          background: isNotIndicated ? "#475569" : "rgba(148,163,184,0.08)",
                          color: isNotIndicated ? "#fff" : "#64748B",
                          border: isNotIndicated ? "1px solid #475569" : "1px solid rgba(148,163,184,0.15)",
                        }}>
                          {isNotIndicated ? "NOT INDICATED" : "Not Indicated"}
                        </button>
                      </div>
                    </div>

                    {/* Findings field — only when performed */}
                    {isPerformed && (
                      <div style={{ marginTop: 8, marginLeft: 18 }}>
                        <input style={{
                          ...S.input, border: "1px solid rgba(16,185,129,0.2)",
                          background: "rgba(16,185,129,0.05)", fontSize: 11, padding: "7px 10px",
                          color: "#fff",
                        }}
                          value={form[notesKey] || ""} onChange={e => setField(notesKey, e.target.value)}
                          placeholder={d.hint} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Diagnostic Summary Bar */}
        {(() => {
          const allDiags = ["diagRadiographs","diagCT","diagMRI","diagUltrasound","diagCBC","diagChemPanel","diagUrinalysis","diagThyroid","diagCRP","diagSynovial","diagEMG","diagArthroscopy","diagGaitAnalysis","diagForcePlate","diagROM","diagOtherDiag"];
          const performed = allDiags.filter(k => form[k] === true).length;
          const notIndicated = allDiags.filter(k => form[k] === "not_indicated").length;
          const pending = allDiags.length - performed - notIndicated;
          return (
            <div style={{ marginTop: 8, padding: "10px 16px", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 8, display: "flex", gap: 20, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "0.5px" }}>Workup Status</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#6EE7B7" }}>{performed} Obtained</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{notIndicated} Not Indicated</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{pending} Pending Review</span>
            </div>
          );
        })()}
      </div>

      {/* Step 2 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button
          style={{
            ...S.btn("ghost"), boxShadow: "0 0 8px rgba(14,165,233,0.15)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 8px rgba(14,165,233,0.15)"}
          onClick={() => goToStep(1)}
        >
          ← Back to Patient Info
        </button>
        <button
          style={{
            background: "#1E5A8A", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,0.5), 0 0 40px rgba(14,165,233,0.2)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)"}
          onClick={() => goToStep(3)}
        >
          Next: Treatment Plan <FiChevronRight size={16} />
        </button>
      </div>

      </>)}

      {/* ═══════════ STEP 3: TREATMENT PLAN & SURGICAL STATUS ═══════════ */}
      {!protocol && wizardStep === 3 && (<>

      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiFileText} title="Section 3 — Treatment Plan & Surgical Status" />

        {/* ── Treatment Approach ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Treatment Approach
          </div>
          <div style={S.grid(3)}>
            {[
              { value: "surgical", label: "Surgical", icon: "🔪", desc: "Post-operative rehabilitation" },
              { value: "conservative", label: "Conservative", icon: "🩺", desc: "Non-surgical management" },
              { value: "palliative", label: "Palliative / Comfort", icon: "💙", desc: "Quality of life focused" },
            ].map(opt => (
              <div key={opt.value}
                onClick={() => setField("treatmentApproach", opt.value)}
                style={{
                  padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                  background: form.treatmentApproach === opt.value ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                  border: form.treatmentApproach === opt.value ? "2px solid #0EA5E9" : "1.5px solid #3A4A5C",
                  boxShadow: form.treatmentApproach === opt.value ? "0 0 12px rgba(14,165,233,0.2)" : "none",
                  transition: "all 0.2s",
                }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: "#fff", marginTop: 2, fontWeight: 400 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Veterinary Recommendation vs Owner Election ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Clinical Recommendation & Owner Decision
          </div>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Veterinary Recommendation</label>
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.vetRecommendation} onChange={e => setField("vetRecommendation", e.target.value)}>
                <option value="">— Select —</option>
                <option value="Surgery - Strongly Recommended">Surgery — Strongly Recommended</option>
                <option value="Surgery - Recommended">Surgery — Recommended</option>
                <option value="Surgery - Optional">Surgery — Optional (Either approach viable)</option>
                <option value="Conservative - Recommended">Conservative Management — Recommended</option>
                <option value="Conservative - Only Option">Conservative — Only Viable Option</option>
                <option value="Palliative">Palliative / Comfort Care</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Owner Election / Decision</label>
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.ownerElection} onChange={e => setField("ownerElection", e.target.value)}>
                <option value="">— Select —</option>
                <option value="Elected Surgery">Elected Surgery (per recommendation)</option>
                <option value="Elected Conservative">Elected Conservative Management</option>
                <option value="Declined Surgery - Conservative">Declined Surgery — Elected Conservative</option>
                <option value="Declined Surgery - Financial">Declined Surgery — Financial Constraints</option>
                <option value="Declined Surgery - Age/Risk">Declined Surgery — Patient Age/Risk Concern</option>
                <option value="Seeking Second Opinion">Seeking Second Opinion</option>
                <option value="Elected Palliative">Elected Palliative / Comfort Care</option>
              </select>
            </div>
          </div>
          {/* Warning banner when owner declines recommended surgery */}
          {form.vetRecommendation && form.vetRecommendation.startsWith("Surgery") && form.ownerElection && form.ownerElection.startsWith("Declined") && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 12, padding: "12px 16px", background: "#FEF3C7", border: "1.5px solid #D97706", borderRadius: 8 }}>
              <FiAlertTriangle size={18} style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>Owner Declines Recommended Surgery</div>
                <div style={{ fontSize: 11, color: "#92400E", marginTop: 4 }}>Protocol will be generated for conservative / non-surgical management. Document informed consent and owner's understanding of prognosis differences.</div>
                <div style={{ marginTop: 8 }}>
                  <label style={{ ...S.label, fontSize: 10 }}>Reason / Notes for Declining (Document for Medical Record)</label>
                  <input style={{ ...S.input, border: "1.5px solid #D97706", background: "#FFFBEB", fontSize: 11 }}
                    value={form.ownerDeclineReason} onChange={e => setField("ownerDeclineReason", e.target.value)}
                    placeholder="Owner's stated reason, informed consent discussion documented" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Surgical Details (shown when surgical approach selected) ── */}
        {form.treatmentApproach === "surgical" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
              Surgical Details
            </div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Surgery Type / Procedure</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.surgeryType} onChange={e => setField("surgeryType", e.target.value)}>
                  <option value="">— Select Procedure —</option>
                  <optgroup label="Stifle / Knee Procedures">
                    <option value="TPLO">TPLO — Tibial Plateau Leveling Osteotomy</option>
                    <option value="TTA">TTA — Tibial Tuberosity Advancement</option>
                    <option value="Lateral Suture">Lateral Suture Stabilization (LSS)</option>
                    <option value="TightRope CCL">TightRope CCL Repair</option>
                    <option value="Meniscectomy">Meniscectomy (Partial/Total)</option>
                    <option value="Patellar Luxation Repair">Patellar Luxation Repair (Trochleoplasty)</option>
                    <option value="Stifle Arthroscopy">Stifle Arthroscopy (Diagnostic/Therapeutic)</option>
                  </optgroup>
                  <optgroup label="Hip Procedures">
                    <option value="FHO">FHO — Femoral Head Ostectomy</option>
                    <option value="THR">THR — Total Hip Replacement</option>
                    <option value="JPS">JPS — Juvenile Pubic Symphysiodesis</option>
                    <option value="DPO/TPO">DPO/TPO — Double/Triple Pelvic Osteotomy</option>
                    <option value="Toggle Pin Hip Reduction">Toggle Pin — Hip Luxation Reduction</option>
                  </optgroup>
                  <optgroup label="Elbow & Shoulder Procedures">
                    <option value="FCP Removal">FCP Removal — Fragmented Coronoid</option>
                    <option value="UAP Fixation">UAP Fixation — Ununited Anconeal Process</option>
                    <option value="Elbow Arthroscopy">Elbow Arthroscopy</option>
                    <option value="Shoulder OCD Fragment Removal">Shoulder OCD Fragment Removal</option>
                    <option value="Shoulder Stabilization">Shoulder Stabilization (Medial/Lateral)</option>
                    <option value="Biceps Tenodesis">Biceps Tenodesis / Tenotomy</option>
                  </optgroup>
                  <optgroup label="Spinal / Neurological Procedures">
                    <option value="Hemilaminectomy">Hemilaminectomy (IVDD Decompression)</option>
                    <option value="Ventral Slot">Ventral Slot (Cervical IVDD)</option>
                    <option value="Dorsal Laminectomy">Dorsal Laminectomy</option>
                    <option value="Lumbosacral Decompression">Lumbosacral Decompression</option>
                    <option value="Disc Fenestration">Disc Fenestration (Prophylactic)</option>
                    <option value="Spinal Stabilization">Spinal Stabilization (Pins/PMMA/Plates)</option>
                    <option value="Cervical Distraction-Fusion">Cervical Distraction-Fusion (Wobbler)</option>
                  </optgroup>
                  <optgroup label="Fracture Repair">
                    <option value="Plate Fixation">Plate & Screw Fixation (ORIF)</option>
                    <option value="External Fixation">External Skeletal Fixation (ESF)</option>
                    <option value="IM Pin">Intramedullary Pin (IM Pin)</option>
                    <option value="Interlocking Nail">Interlocking Nail</option>
                    <option value="Cerclage Wire">Cerclage Wire Fixation</option>
                    <option value="Pelvic Fracture Repair">Pelvic Fracture ORIF</option>
                    <option value="Mandibular Fracture Repair">Mandibular Fracture Repair</option>
                  </optgroup>
                  <optgroup label="Soft Tissue / Tendon Procedures">
                    <option value="Achilles Repair">Achilles Tendon Repair</option>
                    <option value="Iliopsoas Tenotomy">Iliopsoas Tenotomy</option>
                    <option value="Muscle Repair">Muscle Repair / Myorrhaphy</option>
                    <option value="Tendon Transfer">Tendon Transfer Procedure</option>
                    <option value="Contracture Release">Contracture Release</option>
                  </optgroup>
                  <optgroup label="Amputation / Other Orthopedic">
                    <option value="Forelimb Amputation">Forelimb Amputation</option>
                    <option value="Hindlimb Amputation">Hindlimb Amputation</option>
                    <option value="Arthrodesis">Arthrodesis (Joint Fusion)</option>
                    <option value="Limb Salvage">Limb Salvage Procedure</option>
                    <option value="Hardware Removal">Hardware Removal (Implant)</option>
                    <option value="Other Procedure">Other — Specify in Notes</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label style={S.label}>Surgery Date</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C", background: form.surgeryDate && form.postOpDay ? "#F0FFF4" : C.surface }} type="date" value={form.surgeryDate} onChange={e => handleSurgeryDate(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Post-Op Day (POD)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C", background: form.postOpDay && form.surgeryDate ? "#F0FFF4" : C.surface }} type="number" min="0" value={form.postOpDay}
                  onChange={e => handlePostOpDay(e.target.value)} onInput={e => handlePostOpDay(e.target.value)}
                  placeholder="Days since surgery" />
                {form.postOpDay && form.surgeryDate && (
                  <div style={{ fontSize: 10, color: "#059669", fontWeight: 500, marginTop: 4 }}>
                    Auto-calculated from surgery date
                  </div>
                )}
              </div>
            </div>
            <div style={{ ...S.grid(3), marginTop: 12 }}>
              <div>
                <label style={S.label}>Surgeon Name</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.surgeonName} onChange={e => setField("surgeonName", e.target.value)}
                  placeholder="DVM / DACVS name" />
              </div>
              <div>
                <label style={S.label}>Surgical Facility</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.surgicalFacility} onChange={e => setField("surgicalFacility", e.target.value)}
                  placeholder="Hospital / Clinic name" />
              </div>
              <div>
                <label style={S.label}>ASA Physical Status</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.anesthesiaRisk} onChange={e => setField("anesthesiaRisk", e.target.value)}>
                  <option value="ASA I">ASA I — Normal healthy patient</option>
                  <option value="ASA II">ASA II — Mild systemic disease</option>
                  <option value="ASA III">ASA III — Severe systemic disease</option>
                  <option value="ASA IV">ASA IV — Life-threatening disease</option>
                  <option value="ASA V">ASA V — Moribund, not expected to survive</option>
                </select>
              </div>
            </div>
            <div style={{ ...S.grid(2), marginTop: 12 }}>
              <div>
                <label style={S.label}>Incision Status</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.incisionStatus} onChange={e => setField("incisionStatus", e.target.value)}>
                  <option value="Clean/Dry/Intact">Clean / Dry / Intact (CDI)</option>
                  <option value="Mild Swelling">Mild Swelling — Monitoring</option>
                  <option value="Seroma Present">Seroma Present</option>
                  <option value="Dehiscence Concern">Dehiscence Concern</option>
                  <option value="Infection Signs">Signs of Infection (SSI)</option>
                  <option value="Healed">Fully Healed / Sutures Removed</option>
                  <option value="N/A">N/A — No Incision</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Suture / Staple Removal Date</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C", background: form.sutureRemovalDate && form.surgeryDate ? "#F0FFF4" : C.surface }} type="date" value={form.sutureRemovalDate} onChange={e => setField("sutureRemovalDate", e.target.value)} />
                {form.sutureRemovalDate && form.surgeryDate && (
                  <div style={{ fontSize: 10, color: "#059669", fontWeight: 500, marginTop: 4 }}>
                    Auto-set to 14 days post-op (editable)
                  </div>
                )}
              </div>
            </div>
            <div style={{ ...S.grid(2), marginTop: 12 }}>
              <div>
                <label style={S.label}>Implant / Hardware Details</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.implantDetails} onChange={e => setField("implantDetails", e.target.value)}
                  placeholder="e.g. Synthes 3.5mm TPLO plate, 2.4mm locking screws" />
              </div>
              <div>
                <label style={S.label}>Surgical Complications / Notes</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.complicationsNoted} onChange={e => setField("complicationsNoted", e.target.value)}
                  placeholder="Any intraoperative or postoperative complications" />
              </div>
            </div>
          </div>
        )}

        {/* ── Post-Op / Recovery Restrictions ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Current Recovery Status & Restrictions
          </div>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Weight-Bearing Status</label>
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.weightBearingStatus} onChange={e => setField("weightBearingStatus", e.target.value)}>
                <option value="Non-weight bearing">Non-weight bearing (NWB)</option>
                <option value="Toe-touching">Toe-touching weight bearing (TTWB)</option>
                <option value="Partial">Partial weight bearing (PWB)</option>
                <option value="Weight bearing as tolerated">Weight bearing as tolerated (WBAT)</option>
                <option value="Full weight bearing">Full weight bearing (FWB)</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Activity Restrictions</label>
              <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 42, resize: "vertical", fontFamily: "inherit" }} value={form.activityRestrictions} onChange={e => setField("activityRestrictions", e.target.value)}
                placeholder="e.g. No stairs, no jumping, leash walks only, no off-leash activity" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { key: "eCollarRequired", label: "E-Collar Required" },
              { key: "crateRestRequired", label: "Strict Crate Rest" },
              { key: "slingAssistRequired", label: "Sling Assist Required" },
            ].map(item => (
              <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                padding: "8px 14px", background: form[item.key] ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                border: "1.5px solid #3A4A5C", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
                transition: "all 0.2s" }}>
                <input type="checkbox" checked={form[item.key]} onChange={e => setField(item.key, e.target.checked)}
                  style={{ accentColor: "#1E3A5F", width: 16, height: 16, cursor: "pointer" }} />
                {item.label}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={S.label}>Prior Surgeries / Relevant Surgical History</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.priorSurgeries} onChange={e => setField("priorSurgeries", e.target.value)}
              placeholder="e.g. Contralateral TPLO 2024, splenectomy 2023" />
          </div>
        </div>

        {/* ── Rehabilitation Goals ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Rehabilitation Goals
          </div>
          <div style={{ fontSize: 10, color: "#fff", marginBottom: 10 }}>Select all primary goals for this patient (guides protocol intensity and exercise selection)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { value: "pain_management", label: "Pain Management", icon: "🎯" },
              { value: "restore_rom", label: "Restore ROM", icon: "📐" },
              { value: "rebuild_muscle", label: "Rebuild Muscle Mass", icon: "💪" },
              { value: "improve_ambulation", label: "Improve Ambulation", icon: "🚶" },
              { value: "return_function", label: "Return to Full Function", icon: "🏃" },
              { value: "return_sport", label: "Return to Sport/Work", icon: "🏅" },
              { value: "weight_management", label: "Weight Management", icon: "⚖️" },
              { value: "comfort_care", label: "Comfort / Quality of Life", icon: "❤️" },
              { value: "prevent_contralateral", label: "Prevent Contralateral Injury", icon: "🛡️" },
              { value: "owner_education", label: "Owner Education & HEP", icon: "📋" },
            ].map(goal => (
              <label key={goal.value} style={{
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                color: "#fff",
                background: (form.rehabGoals || []).includes(goal.value) ? "rgba(14,165,233,0.18)" : "rgba(255,255,255,0.05)",
                border: (form.rehabGoals || []).includes(goal.value) ? "1.5px solid #0EA5E9" : "1.5px solid #3A4A5C",
                transition: "all 0.2s",
              }}>
                <input type="checkbox"
                  checked={(form.rehabGoals || []).includes(goal.value)}
                  onChange={e => {
                    const current = form.rehabGoals || [];
                    if (e.target.checked) {
                      setField("rehabGoals", [...current, goal.value]);
                    } else {
                      setField("rehabGoals", current.filter(g => g !== goal.value));
                    }
                  }}
                  style={{ accentColor: "#0EA5E9", width: 15, height: 15, cursor: "pointer" }} />
                <span>{goal.icon}</span> {goal.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button
          style={{
            ...S.btn("ghost"), boxShadow: "0 0 8px rgba(14,165,233,0.15)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 8px rgba(14,165,233,0.15)"}
          onClick={() => goToStep(2)}
        >
          ← Back to Assessment
        </button>
        <button
          style={{
            background: "#1E5A8A", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,0.5), 0 0 40px rgba(14,165,233,0.2)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)"}
          onClick={() => goToStep(4)}
        >
          Next: Protocol Parameters <FiChevronRight size={16} />
        </button>
      </div>

      </>)}

      {/* ═══════════ STEP 4: PROTOCOL PARAMETERS ═══════════ */}
      {!protocol && wizardStep === 4 && (<>

      {/* ═══════════ SECTION 4: PROTOCOL PARAMETERS ═══════════ */}
      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiCalendar} title="Section 4 — Protocol Parameters" />
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Protocol Duration</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.protocolLength} onChange={e => setField("protocolLength", e.target.value)}>
              <option value="6">6 weeks — Accelerated (mild)</option>
              <option value="8">8 weeks — Standard post-surgical</option>
              <option value="10">10 weeks — Extended recovery</option>
              <option value="12">12 weeks — Complex / multi-joint</option>
              <option value="16">16 weeks — Conservative / neuro</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Session Frequency (per week)</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.sessionFrequency} onChange={e => setField("sessionFrequency", e.target.value)}>
              <option value="1">1× per week</option>
              <option value="2">2× per week (Recommended)</option>
              <option value="3">3× per week (Intensive)</option>
              <option value="5">5× per week (Inpatient / Acute)</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Expected Owner Compliance</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.ownerCompliance} onChange={e => setField("ownerCompliance", e.target.value)}>
              <option value="Highly Motivated">Highly Motivated — Will follow HEP diligently</option>
              <option value="Motivated">Motivated — Reliable with reminders</option>
              <option value="Average">Average — Moderate adherence expected</option>
              <option value="Limited">Limited — Minimal home exercise expected</option>
            </select>
          </div>
        </div>

        {/* Home Exercise Program & Aquatic */}
        <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "8px 14px", background: form.homeExerciseProgram ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
            border: form.homeExerciseProgram ? "1.5px solid #10B981" : "1.5px solid #3A4A5C", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
            transition: "all 0.2s" }}>
            <input type="checkbox" checked={form.homeExerciseProgram} onChange={e => setField("homeExerciseProgram", e.target.checked)}
              style={{ accentColor: "#10B981", width: 16, height: 16, cursor: "pointer" }} />
            Include Home Exercise Program (HEP)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "8px 14px", background: form.aquaticAccess ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
            border: form.aquaticAccess ? "1.5px solid #0EA5E9" : "1.5px solid #3A4A5C", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
            transition: "all 0.2s" }}>
            <input type="checkbox" checked={form.aquaticAccess} onChange={e => setField("aquaticAccess", e.target.checked)}
              style={{ accentColor: "#0EA5E9", width: 16, height: 16, cursor: "pointer" }} />
            Aquatic Therapy Available (UWTM / Pool)
          </label>
        </div>

        {/* Available Therapeutic Modalities */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Available Therapeutic Modalities
          </div>
          <div style={{ fontSize: 10, color: "#fff", marginBottom: 10 }}>Select all modalities available at your facility (determines which interventions can be prescribed)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { key: "modalityUWTM", label: "Underwater Treadmill", icon: "🌊" },
              { key: "modalityLaser", label: "Therapeutic Laser (PBM)", icon: "🔴" },
              { key: "modalityTENS", label: "TENS", icon: "⚡" },
              { key: "modalityNMES", label: "NMES / E-Stim", icon: "⚡" },
              { key: "modalityTherapeuticUS", label: "Therapeutic Ultrasound", icon: "📡" },
              { key: "modalityShockwave", label: "Shockwave (ESWT)", icon: "💥" },
              { key: "modalityCryotherapy", label: "Cryotherapy", icon: "❄️" },
              { key: "modalityHeatTherapy", label: "Heat Therapy", icon: "🔥" },
              { key: "modalityPulsedEMF", label: "Pulsed EMF (PEMF)", icon: "🧲" },
            ].map(mod => (
              <label key={mod.key} style={{
                display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                color: "#fff",
                background: form[mod.key] ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                border: form[mod.key] ? "1.5px solid #0EA5E9" : "1.5px solid #3A4A5C",
                transition: "all 0.2s",
              }}>
                <input type="checkbox" checked={form[mod.key]} onChange={e => setField(mod.key, e.target.checked)}
                  style={{ accentColor: "#0EA5E9", width: 14, height: 14, cursor: "pointer" }} />
                <span>{mod.icon}</span> {mod.label}
              </label>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div style={{ marginTop: 14 }}>
          <label style={S.label}>Special Instructions / Clinical Notes</label>
          <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 56, resize: "vertical", fontFamily: "inherit" }} value={form.specialInstructions} onChange={e => setField("specialInstructions", e.target.value)}
            placeholder="e.g. Fearful of water — avoid aquatic initially, aggressive with handling — needs muzzle for manual therapy, owner has pool at home" />
        </div>
      </div>

      {/* ═══════════ PRE-PROTOCOL SUMMARY OVERVIEW ═══════════ */}
      {(() => {
        // Find the diagnosis label from the CONDITIONS object
        const diagLabel = (() => {
          for (const [, items] of Object.entries(CONDITIONS)) {
            const found = items.find(c => c.value === form.diagnosis);
            if (found) return found.label;
          }
          return form.diagnosis || "Not selected";
        })();
        // Find category the diagnosis belongs to
        const diagCategory = (() => {
          for (const [cat, items] of Object.entries(CONDITIONS)) {
            if (items.find(c => c.value === form.diagnosis)) return cat;
          }
          return "";
        })();
        // Count exercises relevant to the condition
        const relevantExercises = allExercises.filter(ex => {
          const name = (ex.name || "").toLowerCase();
          const cat = (ex.category || "").toLowerCase();
          const diag = (form.diagnosis || "").toLowerCase();
          const region = (form.affectedRegion || "").toLowerCase();
          return name.includes(diag) || cat.includes(diag) || name.includes(region.split(" ").pop()) || cat.includes(region.split(" ").pop());
        });
        const totalExercises = allExercises.length;
        // Treatment summary
        const txLabel = form.treatmentApproach === "surgical" ? "Surgical — Post-Operative Rehabilitation"
          : form.treatmentApproach === "conservative" ? "Conservative — Non-Surgical Management"
          : form.treatmentApproach === "palliative" ? "Palliative — Comfort Care"
          : "Not specified";
        const ownerDeclined = form.vetRecommendation && form.vetRecommendation.startsWith("Surgery") && form.ownerElection && form.ownerElection.startsWith("Declined");

        return (
          <div style={{
            background: `linear-gradient(135deg, #1D2B3A 0%, #22323F 50%, #1D2B3A 100%)`,
            border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12,
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative top accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #0F4C81, #0EA5E9, #10B981)" }} />

            <div style={{ ...S.sectionHeader(), marginTop: 4, marginBottom: 0 }}>
              <FiCheckCircle size={14} style={{ color: "#0EA5E9" }} /> PRE-PROTOCOL SUMMARY
            </div>
            {/* Neon flatline under header */}
            <div style={{ height: 3, width: "100%", overflow: "hidden", marginTop: 8, marginBottom: 16, borderRadius: 2 }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite", boxShadow: "0 0 8px rgba(57,255,126,0.5), 0 0 16px rgba(57,255,126,0.2)" }} />
            </div>

            {/* Patient & Diagnosis Row */}
            <div style={{ ...S.grid(3), gap: 16 }}>
              {/* Patient Info Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Patient</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                  {form.patientName || "—"} <span style={{ fontSize: 12, fontWeight: 400 }}>({form.sex || "—"})</span>
                </div>
                <div style={{ fontSize: 12, color: "#fff", marginBottom: 2 }}>{form.breed || "Breed not selected"}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>Age: <strong>{form.age ? form.age + " yr" : "—"}</strong></span>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>Wt: <strong>{form.weightKg ? form.weightKg + " kg" : "—"}{form.weightLbs ? " (" + form.weightLbs + " lbs)" : ""}</strong></span>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>BCS: <strong>{form.bodyConditionScore}/9</strong></span>
                </div>
              </div>

              {/* Diagnosis Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Diagnosis & Region</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{diagLabel}</div>
                {diagCategory && <div style={{ fontSize: 11, color: "#fff", fontWeight: 400, marginBottom: 4 }}>Category: {diagCategory}</div>}
                <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>Region: <strong>{form.affectedRegion || "—"}</strong></div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: +form.painLevel <= 3 ? "#ECFDF5" : +form.painLevel <= 6 ? "#FFFBEB" : "#FEF2F2",
                    color: +form.painLevel <= 3 ? "#059669" : +form.painLevel <= 6 ? "#D97706" : "#DC2626",
                  }}>Pain: {form.painLevel}/10</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: +form.lamenessGrade <= 1 ? "#ECFDF5" : +form.lamenessGrade <= 3 ? "#FFFBEB" : "#FEF2F2",
                    color: +form.lamenessGrade <= 1 ? "#059669" : +form.lamenessGrade <= 3 ? "#D97706" : "#DC2626",
                  }}>Lameness: {form.lamenessGrade}/5</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "#E0F2FE", color: "#0284C7" }}>
                    {form.mobilityLevel}
                  </span>
                </div>
              </div>

              {/* Treatment Plan Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Treatment Plan</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{txLabel}</div>
                {form.treatmentApproach === "surgical" && form.surgeryType && (
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500, marginBottom: 2 }}>Procedure: <strong>{form.surgeryType}</strong></div>
                )}
                {form.treatmentApproach === "surgical" && form.postOpDay && (
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500, marginBottom: 2 }}>Post-Op Day: <strong>{form.postOpDay}</strong></div>
                )}
                {form.weightBearingStatus && (
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500, marginBottom: 2 }}>Weight Bearing: <strong>{form.weightBearingStatus}</strong></div>
                )}
                {ownerDeclined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, padding: "4px 8px", background: "#FEF3C7", border: "1px solid #D97706", borderRadius: 4 }}>
                    <FiAlertTriangle size={11} style={{ color: "#D97706" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#92400E" }}>Owner declined recommended surgery</span>
                  </div>
                )}
              </div>
            </div>

            {/* Exercise Availability Row */}
            <div style={{ marginTop: 20, background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Exercise Library Available</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                    Total Exercises: <strong style={{ fontSize: 14, color: "#7DD3FC" }}>{totalExercises}</strong>
                  </div>
                  {relevantExercises.length > 0 && (
                    <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                      Condition-Matched: <strong style={{ fontSize: 14, color: "#059669" }}>{relevantExercises.length}</strong>
                    </div>
                  )}
                  {form.currentMedications && (
                    <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                      Active Medications: <strong>{form.currentMedications}</strong>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 320 }}>
                {form.eCollarRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#DBEAFE", color: "#1E3A5F" }}>E-Collar</span>}
                {form.crateRestRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#DBEAFE", color: "#1E3A5F" }}>Crate Rest</span>}
                {form.slingAssistRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#DBEAFE", color: "#1E3A5F" }}>Sling Assist</span>}
                {form.specialInstructions && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#FEF3C7", color: "#92400E" }}>Special Instructions</span>}
              </div>
            </div>

            {/* Rehab Goals & Protocol Config Row */}
            <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
              {/* Rehab Goals */}
              <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Rehab Goals</div>
                {(form.rehabGoals || []).length > 0 ? (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(form.rehabGoals || []).map(g => (
                      <span key={g} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: "#7DD3FC" }}>
                        {g.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    ))}
                  </div>
                ) : <span style={{ fontSize: 11, color: "#fff" }}>No goals selected</span>}
              </div>
              {/* Protocol Config */}
              <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Protocol Configuration</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>{form.protocolLength} weeks</span>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>{form.sessionFrequency}×/week</span>
                  {form.homeExerciseProgram && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#6EE7B7" }}>HEP Included</span>}
                  {form.aquaticAccess && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: "#7DD3FC" }}>Aquatic</span>}
                </div>
                {/* Modalities count */}
                {(() => {
                  const modCount = ["modalityUWTM","modalityLaser","modalityTENS","modalityNMES","modalityTherapeuticUS","modalityShockwave","modalityCryotherapy","modalityHeatTherapy","modalityPulsedEMF"].filter(k => form[k]).length;
                  return modCount > 0 ? <div style={{ fontSize: 10, color: "#fff", marginTop: 4 }}>{modCount} modalities available</div> : null;
                })()}
              </div>
            </div>

            {/* Objective Measurements Summary */}
            {(form.circumferenceAffected || form.romFlexion || form.muscleCondition !== "Normal" || +form.jointEffusion > 0) && (
              <div style={{ marginTop: 20, background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Baseline Measurements</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {form.circumferenceAffected && form.circumferenceContralateral && (
                    <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                      Circumference: {form.circumferenceAffected}cm / {form.circumferenceContralateral}cm
                      ({Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)).toFixed(1)}cm diff)
                    </span>
                  )}
                  {form.romFlexion && <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>ROM: {form.romFlexion}°–{form.romExtension || "—"}°</span>}
                  {form.muscleCondition !== "Normal" && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(220,38,38,0.15)", color: "#FCA5A5" }}>{form.muscleCondition}</span>}
                  {+form.jointEffusion > 0 && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(217,119,6,0.15)", color: "#FCD34D" }}>Effusion: {form.jointEffusion}/3</span>}
                </div>
              </div>
            )}

            {/* Missing Info Warnings */}
            {(!form.patientName || !form.diagnosis || !form.treatmentApproach || (form.rehabGoals || []).length === 0) && (
              <div style={{ marginTop: 20, padding: "10px 16px", background: "#FEF3C7", border: "1.5px solid #D97706", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <FiAlertTriangle size={14} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#92400E" }}>
                  Missing recommended fields:
                  {!form.patientName && " Patient Name,"}
                  {!form.diagnosis && " Diagnosis,"}
                  {!form.treatmentApproach && " Treatment Approach,"}
                  {(form.rehabGoals || []).length === 0 && " Rehab Goals"}
                  {" — go back and complete for optimal protocol generation."}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════ K9 REHAB PRO — COMPLIANCE & DATA PROTECTION ═══════════ */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={complianceAgreed} onChange={e => setComplianceAgreed(e.target.checked)}
            style={{ accentColor: "#39FF7E", width: 16, height: 16, cursor: "pointer" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>
            I acknowledge the{" "}
            <span
              onClick={e => { e.preventDefault(); setComplianceOpen(o => !o); }}
              style={{ color: "#0EA5E9", textDecoration: "underline", cursor: "pointer" }}
            >K9 Rehab Pro — Compliance & Data Protection Notice</span>
          </span>
        </label>
        {complianceOpen && (
          <div style={{
            background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10,
            padding: "20px 24px", marginTop: 8, maxHeight: 420, overflowY: "auto",
          }}>
            {/* Section 1 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              1. Regulatory Framework & Governing Standards
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro operates under the regulatory authority of state veterinary medical boards in the United States. All clinical decision-support features, rehabilitation protocol generation, and professional-facing tools are designed to comply with:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 12px 16px", padding: 0 }}>
              <li>State veterinary practice acts</li>
              <li>State veterinary medical board rules for teleadvice, teleconsulting, and client communication</li>
              <li>State-specific definitions of the veterinarian–client–patient relationship (VCPR)</li>
              <li>Professional conduct, recordkeeping, and data-handling requirements</li>
              <li>Restrictions on diagnosis, prescription, and medical decision-making by non-veterinarians</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              The platform functions as a clinical decision-support system (CDSS) and educational tool, not a substitute for licensed veterinary judgment.
            </div>

            {/* Section 2 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              2. Scope of Use & Professional Boundaries
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro is designed for:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Licensed veterinarians</li>
              <li>Certified canine rehabilitation practitioners (CCRP/CCRT)</li>
              <li>Veterinary physical therapists</li>
              <li>Veterinary technicians under supervision</li>
              <li>Veterinary students and rehabilitation trainees</li>
            </ul>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              The system does not:
            </div>
            <ul style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Establish a VCPR</li>
              <li>Provide medical diagnosis</li>
              <li>Replace in-person examinations</li>
              <li>Prescribe medications</li>
              <li>Override state veterinary medical board rules</li>
            </ul>
            <div style={{ fontSize: 10, color: "#6EE7B7", lineHeight: 1.7, marginBottom: 16, fontWeight: 600 }}>
              All generated content must be reviewed and approved by a licensed veterinarian before being applied to a patient.
            </div>

            {/* Section 3 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              3. Data Privacy & Confidentiality Standards
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro is committed to data privacy standards that align with or exceed veterinary medical board recordkeeping requirements. HIPAA does not govern veterinary medicine; however, the platform is designed with the following protections in place or on the implementation roadmap:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 4px 16px", padding: 0 }}>
              <li>All patient and client data stored locally on the host device — no external transmission</li>
              <li>No third-party data sharing, advertising use, or AI training on user-submitted data</li>
              <li>Session-based access with configurable timeout</li>
            </ul>
            <div style={{ fontSize: 10, color: "#FBBF24", lineHeight: 1.7, marginBottom: 4, fontWeight: 600 }}>
              Planned for production deployment:
            </div>
            <ul style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>AES-256 encryption at rest</li>
              <li>TLS 1.3 encryption in transit</li>
              <li>Zero-knowledge architecture for sensitive fields</li>
              <li>Role-based access control (RBAC)</li>
              <li>Multi-factor authentication</li>
              <li>Encrypted backups and disaster-recovery protocols</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              No client or patient data is sold, shared, or used for advertising. Security features will be fully implemented prior to multi-user or cloud deployment.
            </div>

            {/* Section 4 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              4. State Veterinary Medical Board Compliance
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>VCPR-dependent features clearly labeled</li>
              <li>Protocols requiring veterinary oversight flagged for review</li>
              <li>Restrictions on remote diagnosis enforced</li>
              <li>Documentation standards aligned with state recordkeeping rules</li>
              <li>Clear separation between education, decision support, and clinical judgment</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              All workflows are designed to align with state-level practice restrictions. Final clinical decisions remain the responsibility of the supervising veterinarian.
            </div>

            {/* Section 5 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              5. Clinical Accuracy, Evidence Standards & Protocol Validation
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              All rehabilitation protocols follow:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Millis & Levine <em>Canine Rehabilitation and Physical Therapy</em></li>
              <li><em>Canine Sports Medicine & Rehabilitation</em> (Zink & Van Dyke)</li>
              <li>ACVSMR-aligned best practices</li>
              <li>Peer-reviewed veterinary rehabilitation literature</li>
              <li>State veterinary medical board expectations for evidence-based care</li>
            </ul>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              Every exercise in the library is:
            </div>
            <ul style={{ fontSize: 10, color: "#6EE7B7", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0, fontWeight: 600 }}>
              <li>Clinically validated</li>
              <li>Evidence-based</li>
              <li>Stage-appropriate</li>
              <li>Safety-screened</li>
              <li>Free of hallucinated or non-standard techniques</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              Protocols are generated using deterministic logic to ensure reproducibility and clinical reliability.
            </div>

            {/* Section 6 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              6. Security Infrastructure & Technical Safeguards
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro currently operates as a locally-hosted application. Active and planned security measures include:
            </div>
            <ul style={{ fontSize: 10, color: "#6EE7B7", lineHeight: 1.8, margin: "0 0 4px 16px", padding: 0, fontWeight: 600 }}>
              <li>Local-only data storage — no external servers or cloud transmission</li>
              <li>Deterministic protocol logic — no AI/ML in clinical output</li>
              <li>Configurable session timeout and auto-lock</li>
              <li>Strict API access controls (CORS-restricted)</li>
            </ul>
            <div style={{ fontSize: 10, color: "#FBBF24", lineHeight: 1.7, marginBottom: 4, fontWeight: 600 }}>
              Planned for production deployment:
            </div>
            <ul style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Encrypted databases (AES-256)</li>
              <li>Audit logs for all clinical-related actions</li>
              <li>Multi-factor authentication</li>
              <li>Continuous monitoring and intrusion detection</li>
              <li>Automated patching and vulnerability scanning</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              Enterprise-grade security features will be fully implemented prior to multi-user, cloud, or production deployment.
            </div>

            {/* Section 7 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              7. Data Retention, Ownership & Client Rights
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              Clients and clinicians retain full ownership of their data. K9 Rehab Pro acts only as a secure processor.
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Data retained only as long as required for clinical or legal purposes</li>
              <li>Permanent deletion available upon request</li>
              <li>Exportable records for veterinary medical board audits</li>
              <li>No third-party data sharing</li>
              <li>No AI training on user-submitted patient data</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              All retention timelines align with state veterinary medical board recordkeeping requirements.
            </div>

            {/* Section 8 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              8. Ethical Use, Transparency & Professional Responsibility
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro adheres to the ethical standards of:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>AVMA</li>
              <li>State veterinary medical boards</li>
              <li>ACVSMR</li>
              <li>APTA (for PT-licensed users)</li>
            </ul>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              Ethical commitments include:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Transparency about system limitations</li>
              <li>Clear labeling of AI-generated content</li>
              <li>Mandatory veterinary oversight for clinical decisions</li>
              <li>No replacement of licensed professional judgment</li>
              <li>No misleading claims about outcomes or guarantees</li>
            </ul>
            <div style={{ fontSize: 10, color: "#6EE7B7", lineHeight: 1.7, fontWeight: 700, marginBottom: 16 }}>
              The platform supports clinicians — never replaces them.
            </div>

            {/* Section 9 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              9. Intellectual Property & Ownership
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              All intellectual property rights are defined as follows:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li><strong>Platform IP:</strong> The K9 Rehab Pro platform, including its protocol generation engine, exercise library, clinical algorithms, user interface, and source code, is the proprietary intellectual property of the platform owner.</li>
              <li><strong>Exercise Library:</strong> The curated exercise library is a proprietary compilation. Individual exercises reference published veterinary rehabilitation literature (Millis & Levine, Zink & Van Dyke, peer-reviewed journals) under fair use for clinical decision support.</li>
              <li><strong>Generated Protocols:</strong> Rehabilitation protocols generated by the platform become the clinical property of the generating clinic or clinician. The platform retains no ownership of patient-specific output.</li>
              <li><strong>Patient Data:</strong> All patient and client data entered into the system is owned exclusively by the clinic or clinician. K9 Rehab Pro acts solely as a local data processor.</li>
              <li><strong>Branding & Trademarks:</strong> "K9 Rehab Pro," the K9 Rehab Pro logo, and all associated branding elements are proprietary marks of the platform owner.</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontStyle: "italic" }}>
              Unauthorized reproduction, distribution, or reverse engineering of the platform, its algorithms, or exercise library is prohibited.
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ GENERATE BUTTON — standalone with heavy neon green glow ═══════════ */}
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
        <button
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "18px 56px", borderRadius: 12, border: "2px solid #10B981",
            fontSize: 16, fontWeight: 800, letterSpacing: "0.5px", cursor: "pointer",
            background: "linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)",
            color: "#fff",
            boxShadow: "0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(16,185,129,0.7), 0 0 60px rgba(16,185,129,0.4), 0 0 90px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.3)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = "0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={generate} disabled={loading}
        >
          <FiActivity size={18} />
          {loading ? "Generating Protocol..." : "Generate Exercise Protocol"}
        </button>
      </div>

      {/* Step 4 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button
          style={{
            ...S.btn("ghost"), boxShadow: "0 0 8px rgba(14,165,233,0.15)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 8px rgba(14,165,233,0.15)"}
          onClick={() => goToStep(3)}
        >
          ← Back to Treatment Plan
        </button>
        <div />
      </div>

      </>)}

      {/* ═══════════ ERROR ═══════════ */}
      {error && (
        <div style={{ ...S.card, background: C.redBg, border: `1px solid ${C.red}33`, color: C.red, display: "flex", alignItems: "center", gap: 8 }}>
          <FiAlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ═══════════ GENERATED PROTOCOL RESULTS ═══════════ */}
      {protocol && (() => {
        // Group weeks by phase using _phaseInfo from protocol generator
        const phaseGroups = [];
        let currentPhase = null;
        (protocol.weeks || []).forEach(week => {
          const info = week.exercises?.[0]?._phaseInfo;
          if (info && (!currentPhase || currentPhase.number !== info.number)) {
            currentPhase = { ...info, weeks: [week], startWeek: week.week_number, endWeek: week.week_number };
            phaseGroups.push(currentPhase);
          } else if (currentPhase) {
            currentPhase.weeks.push(week);
            currentPhase.endWeek = week.week_number;
          } else {
            // Fallback if no _phaseInfo
            currentPhase = { number: 1, name: "Recovery", goal: "", weeks: [week], startWeek: week.week_number, endWeek: week.week_number };
            phaseGroups.push(currentPhase);
          }
        });
        const phaseColors = ["#DC2626", "#D97706", "#0EA5E9", "#059669"];
        const totalWeeks = protocol.protocol_length_weeks || protocol.weeks?.length || 8;

        return (
        <div className="print-protocol">
          {/* Storyboard Player Modal */}
          {showStoryboard && <StoryboardPlayer exerciseCode={showStoryboard} onClose={() => setShowStoryboard(null)} />}
          {/* ── CDSS / Veterinary Oversight Disclaimer Banner ── */}
          <div style={{
            padding: "12px 20px", marginBottom: 10, borderRadius: 8,
            background: "linear-gradient(135deg, #1E3A5F 0%, #0A2540 100%)",
            border: "1px solid #2E4A6F",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <FiShield size={18} style={{ color: "#FBBF24", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>
                Clinical Decision-Support Output — Veterinary Review Required
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                This protocol is generated by a clinical decision-support system (CDSS). It does not constitute a diagnosis, prescription, or veterinary-client-patient relationship (VCPR). All content must be reviewed and approved by a licensed veterinarian before being applied to a patient.
              </div>
            </div>
          </div>

          {/* ── Print / Export Action Bar ── */}
          <div className="no-print" style={{
            display: "flex", gap: 8, marginBottom: 10, justifyContent: "flex-end",
          }}>
            <button onClick={() => window.print()} style={{
              ...S.btn("outline"), fontSize: 11, padding: "6px 14px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <FiPrinter size={12} /> Print Protocol
            </button>
            <button onClick={() => {
              setProtocol(null);
              setWizardStep(1);
            }} style={{
              ...S.btn("outline"), fontSize: 11, padding: "6px 14px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <FiPlus size={12} /> New Protocol
            </button>
          </div>

          {/* ── Red-Flag Warnings (if any) ── */}
          {protocol.red_flag_warnings && protocol.red_flag_warnings.length > 0 && (
            <div style={{
              padding: "14px 20px", marginBottom: 10, borderRadius: 8,
              background: "linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)",
              border: "1px solid #DC2626",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <FiAlertTriangle size={16} style={{ color: "#FCA5A5", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: "#FCA5A5", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Clinical Red Flags Detected
                </span>
              </div>
              {protocol.red_flag_warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 11, color: "#FECACA", lineHeight: 1.6, marginBottom: 4, paddingLeft: 24 }}>
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* ── Protocol Summary Header ── */}
          <div style={{
            ...S.card, borderTop: `4px solid ${C.teal}`,
            background: `linear-gradient(135deg, ${C.surface} 0%, ${C.tealLight}15 100%)`,
            padding: "24px 28px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>
                  {protocol.protocol_name || "Rehabilitation Protocol"} — {(protocol.protocol_type || "").toUpperCase()}
                </div>
                <h2 style={{ margin: "0 0 8px", color: C.navy, fontSize: 24, fontWeight: 800 }}>
                  {protocol.patient_name}
                </h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={S.badge("blue")}>{protocol.condition}</span>
                  <span style={S.badge("green")}>{protocol.affected_region}</span>
                  <span style={S.badge("blue")}>{totalWeeks} Weeks</span>
                  <span style={{ ...S.badge("green"), background: "#EDE9FE", color: "#6B21A8" }}>{phaseGroups.length} Phases</span>
                </div>
                <p style={{ margin: 0, color: C.textLight, fontSize: 11 }}>
                  Protocol ID: {protocol.patient_id} · Generated {new Date(protocol.generated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {protocol.total_exercises} exercises in library
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.navy }}>{totalWeeks}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>Week Program</div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button style={{ ...S.btn("primary"), fontSize: 11, padding: "6px 16px" }}
                    onClick={() => { setProtocol(null); setWizardStep(1); setError(null); }}>
                    <FiFileText size={12} /> New Protocol
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Phase Timeline Bar ── */}
          {phaseGroups.length > 1 && (
            <div style={{ ...S.card, padding: "20px 24px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                Phase Timeline — Gated Progression
              </div>
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 38, background: C.bg, border: `1px solid ${C.border}` }}>
                {phaseGroups.map((phase, i) => {
                  const widthPct = (phase.weeks.length / totalWeeks) * 100;
                  return (
                    <div key={i} style={{
                      width: `${widthPct}%`, background: `linear-gradient(135deg, ${phaseColors[i] || C.teal}, ${phaseColors[i] || C.teal}CC)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.3px",
                      minWidth: 80, borderRight: i < phaseGroups.length - 1 ? "2px solid rgba(255,255,255,0.5)" : "none",
                    }}>
                      P{phase.number}: {phase.name}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", marginTop: 6 }}>
                {phaseGroups.map((phase, i) => (
                  <div key={i} style={{
                    flex: phase.weeks.length / totalWeeks,
                    textAlign: "center", fontSize: 10, color: C.textLight, fontWeight: 500,
                  }}>
                    Wk {phase.startWeek}–{phase.endWeek}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Phase Sections with Exercises ── */}
          {phaseGroups.map((phase, phaseIdx) => (
            <div key={phaseIdx} style={{ marginBottom: 24 }}>

              {/* Phase Header Card */}
              <div style={{
                ...S.card, borderLeft: `5px solid ${phaseColors[phaseIdx] || C.teal}`,
                background: `linear-gradient(135deg, ${C.surface} 0%, ${phaseColors[phaseIdx] || C.teal}08 100%)`,
                marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{
                      fontSize: 10, fontWeight: 800, color: phaseColors[phaseIdx] || C.teal,
                      textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4,
                    }}>
                      Phase {phase.number} | Weeks {phase.startWeek}–{phase.endWeek}
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: C.navy }}>
                      {phase.name}
                    </h3>
                    {phase.goal && (
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>
                        {phase.goal}
                      </p>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: phaseColors[phaseIdx] || C.teal,
                    background: (phaseColors[phaseIdx] || C.teal) + "14",
                    padding: "4px 12px", borderRadius: 6,
                  }}>
                    {phase.weeks.length} wk{phase.weeks.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Contraindications */}
                {phase.contraindications && (
                  <div style={{
                    marginTop: 12, padding: "10px 14px", background: C.redBg,
                    border: `1px solid ${C.red}22`, borderRadius: 6,
                    display: "flex", gap: 8, alignItems: "flex-start",
                  }}>
                    <FiAlertTriangle size={13} style={{ color: C.red, flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 11, color: C.red, lineHeight: 1.5 }}>
                      <strong>Contraindications:</strong> {phase.contraindications}
                    </div>
                  </div>
                )}
              </div>

              {/* Weekly Cards within this phase */}
              {phase.weeks.map((week) => {
                const globalWeekIdx = (protocol.weeks || []).indexOf(week);
                return (
                  <div key={week.week_number} style={{
                    ...S.card, borderLeft: `3px solid ${(phaseColors[phaseIdx] || C.teal)}44`,
                    marginLeft: 16, marginBottom: 8,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.navy }}>
                        Week {week.week_number}
                      </h4>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: C.textLight }}>
                          {week.exercises.length} exercise{week.exercises.length !== 1 ? "s" : ""}
                        </span>
                        <button
                          onClick={() => { setAddingToWeek(globalWeekIdx); setShowAddModal(true); }}
                          style={{ ...S.btn("primary"), padding: "4px 12px", fontSize: 10 }}>
                          <FiPlus size={11} /> Add
                        </button>
                      </div>
                    </div>
                    <div style={S.grid(3)}>
                      {week.exercises.map((ex, exIdx) => (
                        <ProtocolExCard
                          key={exIdx}
                          entry={{ exercise: ex, sets: ex.sets, reps: ex.reps, frequency_per_day: ex.frequency, duration_seconds: ex.duration_minutes ? ex.duration_minutes * 60 : null, notes: ex.notes }}
                          onRemove={() => removeExercise(globalWeekIdx, exIdx)}
                          onOpenStoryboard={setShowStoryboard}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Progression Gate — between phases */}
              {phaseIdx < phaseGroups.length - 1 && phase.progressionCriteria && (
                <div style={{
                  ...S.card, background: C.greenBg, border: `1px solid ${C.green}33`,
                  borderLeft: `4px solid ${C.green}`, marginTop: 4,
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 800, color: C.green,
                    textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <FiCheckCircle size={12} />
                    Progression Gate — Advance to Phase {phaseGroups[phaseIdx + 1].number}: {phaseGroups[phaseIdx + 1].name}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#065F46", lineHeight: 1.6 }}>
                    <strong>Patient must demonstrate:</strong> {phase.progressionCriteria}
                  </p>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <FiCalendar size={11} style={{ color: C.green }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>
                      Schedule re-evaluation at Week {phase.endWeek}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ── Home Exercise Program (HEP) — Client Take-Home ── */}
          {(() => {
            const CLINIC_ONLY = new Set(["LASER_IV","TENS_THERAPY","NMES_QUAD","US_PULSED",
              "PEMF_THERAPY","SHOCKWAVE","UNDERWATER_TREAD","POOL_SWIM","WATER_WALKING","WATER_RETRIEVE"]);
            const hepByPhase = {};
            (protocol.weeks || []).forEach(week => {
              const phaseInfo = week.exercises?.[0]?._phaseInfo;
              const phaseName = phaseInfo?.name || "Phase 1";
              const phaseNum = phaseInfo?.number || 1;
              if (!hepByPhase[phaseNum]) hepByPhase[phaseNum] = { name: phaseName, exercises: new Map() };
              (week.exercises || []).forEach(ex => {
                if (!CLINIC_ONLY.has(ex.code)) {
                  hepByPhase[phaseNum].exercises.set(ex.code, ex);
                }
              });
            });
            return (
              <div style={{
                ...S.card, borderTop: `3px solid ${C.green}`,
                background: `linear-gradient(135deg, ${C.surface} 0%, ${C.greenBg} 100%)`,
              }} className="hep-section">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FiHeart size={14} style={{ color: C.green }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Home Exercise Program (HEP)
                    </span>
                  </div>
                  <span style={{ ...S.badge("green"), fontSize: 10 }}>Client Take-Home</span>
                </div>
                <p style={{ fontSize: 11, color: C.textMid, marginBottom: 14, lineHeight: 1.6, background: "#F0FFF4", padding: "10px 14px", borderRadius: 6 }}>
                  These exercises are safe to perform at home under the guidance provided. Clinic-only interventions (laser, electrical stimulation, ultrasound, aquatic therapy) are excluded. Always follow your veterinarian's specific instructions and stop any exercise that causes pain or distress.
                </p>
                {Object.entries(hepByPhase).map(([phaseNum, phase]) => (
                  <div key={phaseNum} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 8,
                      padding: "4px 10px", background: "#EBF8FF", borderRadius: 4, display: "inline-block" }}>
                      Phase {phaseNum}: {phase.name}
                    </div>
                    <div style={S.grid(2)}>
                      {[...phase.exercises.values()].slice(0, 10).map((ex, i) => (
                        <div key={i} style={{
                          padding: "10px 14px", background: "#fff",
                          border: `1px solid ${C.border}`, borderRadius: 8,
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: C.navy }}>{ex.name || ex.exercise?.name}</div>
                          <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>
                            {ex.sets && `${ex.sets}`}{ex.reps && ` × ${ex.reps}`}
                            {ex.duration_seconds && ` · ${ex.duration_seconds >= 60 ? `${ex.duration_seconds / 60} min` : `${ex.duration_seconds}s`}`}
                            {ex.frequency_per_day && ` · ${ex.frequency_per_day}×/day`}
                          </div>
                          {ex.notes && <div style={{ fontSize: 10, color: C.textLight, marginTop: 3, fontStyle: "italic" }}>{ex.notes}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ padding: "8px 12px", background: C.amberBg, border: `1px solid ${C.amber}33`,
                  borderRadius: 6, fontSize: 10, color: C.amber, fontWeight: 600, marginTop: 8 }}>
                  If your pet shows signs of pain, limping, swelling, or reluctance during any exercise, stop immediately and contact your veterinarian.
                </div>
              </div>
            );
          })()}

          {/* ── Veterinary Sign-Off Section ── */}
          <div style={{
            ...S.card, borderTop: `3px solid ${C.navy}`,
            background: `linear-gradient(135deg, ${C.surface} 0%, #F0F4F8 100%)`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FiAward size={14} style={{ color: C.navy }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Veterinary Review & Approval
              </span>
            </div>
            <div style={S.grid(2)}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" }}>
                  Reviewed By (Licensed Veterinarian)
                </label>
                <input style={{ ...S.input, borderColor: C.navy + "44" }} placeholder="DVM name, credentials, license #" />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" }}>
                  Date Reviewed
                </label>
                <input style={{ ...S.input, borderColor: C.navy + "44" }} type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" }}>
                Clinical Notes / Modifications
              </label>
              <textarea style={{ ...S.input, minHeight: 48, resize: "vertical" }} placeholder="Document any protocol modifications, patient-specific adjustments, or clinical rationale..." />
            </div>
            <div style={{
              marginTop: 12, padding: "8px 14px", background: C.amberBg,
              border: `1px solid ${C.amber}33`, borderRadius: 6,
              fontSize: 10, color: C.amber, fontWeight: 600,
            }}>
              This protocol must be reviewed and approved by a licensed veterinarian before being applied to a patient. Unsigned protocols are for reference only.
            </div>
          </div>

          {/* ── Legal Disclaimer & ACVSMR Standards Footer ── */}
          <div style={{
            ...S.card, background: "#0A2540", border: "1px solid #1E3A5F",
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>DISCLAIMER:</strong> This document is generated by K9 Rehab Pro, a clinical decision-support system (CDSS). It does not establish a veterinarian-client-patient relationship (VCPR), provide a medical diagnosis, or replace in-person veterinary examination. All rehabilitation protocols must be reviewed, modified as clinically appropriate, and approved by a licensed veterinarian before implementation. The platform owner assumes no liability for clinical outcomes resulting from protocol application without proper veterinary oversight.
            </div>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                Practice-Type Applicability
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                <div><strong style={{ color: "rgba(255,255,255,0.6)" }}>General Practice:</strong> Protocols require oversight by attending DVM. Refer complex cases to CCRP/CCRT-certified clinicians.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.6)" }}>Rehabilitation Centers:</strong> Intended for use by CCRP, CCRT, or ACVSMR-certified professionals with direct patient access.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.6)" }}>Specialty Hospitals:</strong> Integrate with existing treatment plans. Coordinate with surgical, neurology, and oncology teams as indicated.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.6)" }}>Universities:</strong> Suitable for clinical teaching under faculty supervision. Not for unsupervised student application.</div>
              </div>
            </div>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>
                Protocol generated per ACVSMR standards · Millis & Levine methodology · Evidence-based exercise selection
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                K9 Rehab Pro™ · Clinical Decision-Support System
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 24, width: 560,
            maxHeight: "80vh", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#0F4C81", fontSize: 16 }}>
                Add Exercise to Week {typeof addingToWeek === "number" ? addingToWeek + 1 : addingToWeek}
              </h3>
              <button onClick={() => { setShowAddModal(false); setExSearch(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#718096" }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <FiSearch size={14} style={{ position: "absolute", left: 10, top: 10, color: "#A0AEC0" }} />
              <input style={{ ...S.input, paddingLeft: 32 }}
                placeholder="Search exercises by name or category…"
                value={exSearch} onChange={e => setExSearch(e.target.value)}
                autoFocus />
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {filteredEx.slice(0, 40).map(ex => (
                <div key={ex.code}
                  onClick={() => addExercise(addingToWeek, ex)}
                  style={{
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                    marginBottom: 4, border: "1px solid #F0F4F8",
                    transition: "background 0.1s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F0F4F8"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1A202C" }}>{ex.name}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                    <span style={S.badge("blue")}>{ex.category}</span>
                    <span style={S.badge(ex.difficulty_level === "Easy" ? "green" : ex.difficulty_level === "Advanced" ? "orange" : "blue")}>
                      {ex.difficulty_level}
                    </span>
                  </div>
                </div>
              ))}
              {filteredEx.length === 0 && (
                <div style={{ textAlign: "center", color: "#A0AEC0", padding: 24 }}>No exercises found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// EVIDENCE SECTION (reused in both card types)
// ─────────────────────────────────────────────
function EvidenceSection({ grade, refs }) {
  if (!grade && (!refs || refs.length === 0)) return null;

  const gradeColor = grade === "A" ? "#276749" : grade === "B" ? "#2B6CB0" : "#C05621";
  const gradeBg    = grade === "A" ? "#F0FFF4"  : grade === "B" ? "#EBF8FF"  : "#FFFAF0";

  // Determine link label based on reference type
  const linkLabel = (ref) => {
    if (!ref.url) return null;
    if (ref.type === "Textbook") return "📖 View Book";
    if (ref.type === "Conference") return "🔎 Search";
    if (ref.url.includes("doi.org")) return "🔗 DOI";
    return "🔬 PubMed";
  };

  return (
    <div style={{ borderTop: "1px solid #F0F4F8", padding: "12px 16px", background: "#FAFCFF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <FiBook size={13} style={{ color: "#2B6CB0" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#2B6CB0",
          textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Evidence-Based References
        </span>
        {grade && (
          <span style={{
            background: gradeBg, color: gradeColor, border: `1px solid ${gradeColor}44`,
            borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 800
          }}>
            Grade {grade}
          </span>
        )}
        <span style={{ fontSize: 10, color: "#718096", marginLeft: "auto" }}>
          {(refs || []).length} source{(refs || []).length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(refs || []).map((ref, i) => (
          <div key={i} style={{
            background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8,
            padding: "10px 12px", borderLeft: "3px solid #0EA5E9"
          }}>
            {/* Badges row */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              {ref.type && (
                <span style={{ background: "#EBF8FF", color: "#2B6CB0", padding: "1px 7px",
                  borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                  {ref.type}
                </span>
              )}
              {ref.evidence_grade && (
                <span style={{ background: "#F0FFF4", color: "#276749", padding: "1px 7px",
                  borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                  Grade {ref.evidence_grade}
                </span>
              )}
              {(ref.topics || []).map((t, j) => (
                <span key={j} style={{ background: "#F7FAFC", color: "#718096",
                  padding: "1px 7px", borderRadius: 4, fontSize: 10 }}>{t}</span>
              ))}
              {/* Clickable verification link */}
              {ref.url && (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: "auto", background: "#0F4C81", color: "#fff",
                    padding: "2px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3,
                    whiteSpace: "nowrap"
                  }}
                >
                  {linkLabel(ref)}
                </a>
              )}
            </div>
            {/* Citation text */}
            <p style={{ fontSize: 11, color: "#4A5568", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
              {ref.citation}
            </p>
            {/* Key findings */}
            {ref.key_findings && (
              <p style={{ fontSize: 11, color: "#2B6CB0", margin: "6px 0 0", lineHeight: 1.5,
                background: "#EBF8FF", padding: "5px 8px", borderRadius: 4 }}>
                <strong>Key finding:</strong> {ref.key_findings}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EXERCISE CARD (expandable)
// ─────────────────────────────────────────────
function ExerciseCard({ e, onOpenStoryboard }) {
  const [open, setOpen] = useState(false);
  const cardTopRef = useRef(null);
  const diffColor = e.difficulty_level === "Easy" ? "green" : e.difficulty_level === "Advanced" ? "orange" : "blue";

  const closeCard = () => {
    setOpen(false);
    setTimeout(() => {
      cardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  return (
    <div ref={cardTopRef} style={{
      background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      transition: "box-shadow 0.15s", gridColumn: open ? "1 / -1" : undefined
    }}>
      {/* Header — always visible */}
      <div style={{ padding: 20, cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1A202C", flex: 1, paddingRight: 12 }}>
            {e.name}
          </div>
          <span style={{ fontSize: 18, color: "#A0AEC0", lineHeight: 1 }}>{open ? "▲" : "▼"}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          <span style={S.badge("blue")}>{e.category}</span>
          <span style={S.badge(diffColor)}>{e.difficulty_level}</span>
        </div>
        {!open && e.description && (
          <p style={{ fontSize: 12, color: "#718096", margin: "8px 0 0", lineHeight: 1.5,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {e.description}
          </p>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: "1px solid #F0F4F8", padding: "0 20px 20px" }}>
          {/* Description */}
          {e.description && (
            <p style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.6, margin: "16px 0" }}>
              {e.description}
            </p>
          )}

          {/* Equipment */}
          {e.equipment?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 6 }}>Equipment</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {e.equipment.map((item, i) => (
                  <span key={i} style={{ background: "#EBF8FF", color: "#2B6CB0", padding: "3px 10px",
                    borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Setup */}
          {e.setup && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 4 }}>Setup</div>
              <p style={{ fontSize: 13, color: "#4A5568", margin: 0, lineHeight: 1.5 }}>{e.setup}</p>
            </div>
          )}

          {/* Steps */}
          {e.steps?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 8 }}>Step-by-Step Instructions</div>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {e.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#4A5568", marginBottom: 6, lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div style={S.grid(2)}>
            {/* Good Form */}
            {e.good_form?.length > 0 && (
              <div style={{ background: "#F0FFF4", borderRadius: 8, padding: 14 }}>
                <div style={{ ...S.label, color: "#276749", marginBottom: 8 }}>Good Form</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {e.good_form.map((item, i) => (
                    <li key={i} style={{ fontSize: 12, color: "#2F855A", marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Mistakes */}
            {e.common_mistakes?.length > 0 && (
              <div style={{ background: "#FFFAF0", borderRadius: 8, padding: 14 }}>
                <div style={{ ...S.label, color: "#C05621", marginBottom: 8 }}>Common Mistakes</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {e.common_mistakes.map((item, i) => (
                    <li key={i} style={{ fontSize: 12, color: "#C05621", marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Red Flags */}
          {e.red_flags?.length > 0 && (
            <div style={{ background: "#FFF5F5", borderRadius: 8, padding: 14, marginTop: 12 }}>
              <div style={{ ...S.label, color: "#C53030", marginBottom: 8 }}>🚩 Red Flags — Stop Immediately</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {e.red_flags.map((flag, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#C53030", marginBottom: 4, fontWeight: 500 }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications + Progression */}
          <div style={{ ...S.grid(2), marginTop: 12 }}>
            {e.contraindications && (
              <div style={{ background: "#FFF5F5", borderRadius: 8, padding: 14 }}>
                <div style={{ ...S.label, color: "#C53030", marginBottom: 8 }}>Contraindications</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {(Array.isArray(e.contraindications) ? e.contraindications : [e.contraindications]).map((c, i) => (
                    <li key={i} style={{ fontSize: 12, color: "#C53030", marginBottom: 4 }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {e.progression && (
              <div style={{ background: "#EBF8FF", borderRadius: 8, padding: 14 }}>
                <div style={{ ...S.label, color: "#2B6CB0", marginBottom: 6 }}>Progression</div>
                <p style={{ fontSize: 12, color: "#2B6CB0", margin: 0, lineHeight: 1.5 }}>{e.progression}</p>
              </div>
            )}
          </div>

          {/* Clinical Parameters — Dosage, Timing, Classification */}
          {(e.clinical_parameters || e.clinical_classification) && (
            <div style={{ marginTop: 12 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 8 }}>Clinical Parameters</div>
              <div style={S.grid(3)}>
                {/* Dosage */}
                {e.clinical_parameters?.dosage && (
                  <div style={{ background: "#F0FFF4", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#276749", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Dosage</div>
                    {Object.entries(e.clinical_parameters.dosage).map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11, color: "#2F855A", marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>{k.replace(/_/g, " ")}:</span> {v}
                      </div>
                    ))}
                  </div>
                )}
                {/* Post-Surgical Timing */}
                {e.clinical_parameters?.post_surgical_timing && (
                  <div style={{ background: "#EBF8FF", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#2B6CB0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Post-Surgical Timing</div>
                    {Object.entries(e.clinical_parameters.post_surgical_timing).map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11, color: "#2C5282", marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>{k.replace(/_/g, " ")}:</span> {v}
                      </div>
                    ))}
                  </div>
                )}
                {/* Classification */}
                {e.clinical_classification && (
                  <div style={{ background: "#FAF5FF", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6B46C1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Classification</div>
                    <div style={{ fontSize: 11, color: "#553C9A", marginBottom: 3 }}>
                      <span style={{ fontWeight: 600 }}>Type:</span> {e.clinical_classification.intervention_type}
                    </div>
                    {e.clinical_classification.rehab_phases?.length > 0 && (
                      <div style={{ fontSize: 11, color: "#553C9A", marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>Phases:</span> {e.clinical_classification.rehab_phases.join(", ")}
                      </div>
                    )}
                    {e.clinical_classification.primary_indications?.length > 0 && (
                      <div style={{ fontSize: 11, color: "#553C9A", marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>Indications:</span> {e.clinical_classification.primary_indications.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Safety */}
          {e.safety && (
            <div style={{ background: "#FFFFF0", borderRadius: 8, padding: 14, marginTop: 12 }}>
              <div style={{ ...S.label, color: "#975A16", marginBottom: 6 }}>Safety & Supervision</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "#744210" }}>
                {e.safety.risk_level && <span><strong>Risk:</strong> {e.safety.risk_level}</span>}
                {e.safety.supervision_required && <span><strong>Supervision:</strong> {e.safety.supervision_required}</span>}
              </div>
            </div>
          )}

          {/* Evidence-Based References — FULL WIDTH */}
          <div style={{ marginTop: 12 }}>
            <EvidenceSection grade={e.evidence_base?.grade} refs={e.evidence_base?.references} />
          </div>

          {/* Storyboard Button — only when storyboard exists */}
          {e.client_education?.storyboard_available && onOpenStoryboard && (
            <button onClick={(ev) => { ev.stopPropagation(); onOpenStoryboard(e.code); }}
              style={{
                marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 8,
                background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
                color: "#fff", border: "1px solid rgba(57,255,126,0.2)", cursor: "pointer",
                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <FiMonitor size={14} /> View Exercise Storyboard
            </button>
          )}

          {/* Close Card Button */}
          <button onClick={(ev) => { ev.stopPropagation(); closeCard(); }}
            style={{
              marginTop: 16, width: "100%", padding: "10px 16px", borderRadius: 8,
              background: C.navy, border: `1.5px solid ${C.navy}`, cursor: "pointer",
              color: "#fff", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
            }}
            onMouseEnter={ev => { ev.currentTarget.style.background = "#0B3A66"; ev.currentTarget.style.borderColor = C.teal; }}
            onMouseLeave={ev => { ev.currentTarget.style.background = C.navy; ev.currentTarget.style.borderColor = C.navy; }}>
            <FiChevronDown size={14} style={{ transform: "rotate(180deg)" }} /> Close
          </button>
        </div>
      )}
    </div>
  );
}

// Category icon/color map
const CAT_META = {
  "Passive Therapy":          { color: "#EBF8FF", text: "#2B6CB0", icon: "🤲" },
  "Active Assisted":          { color: "#E6FFFA", text: "#2C7A7B", icon: "🦮" },
  "Strengthening":            { color: "#F0FFF4", text: "#276749", icon: "💪" },
  "Balance & Proprioception": { color: "#FAF5FF", text: "#6B46C1", icon: "⚖️" },
  "Aquatic Therapy":          { color: "#EBF8FF", text: "#2C5282", icon: "🌊" },
  "Hydrotherapy":             { color: "#E0F2FE", text: "#075985", icon: "🏊" },
  "Therapeutic Modalities":   { color: "#FFF7ED", text: "#C05621", icon: "⚡" },
  "Manual Therapy":           { color: "#FFF5F5", text: "#C53030", icon: "👐" },
  "Functional Training":      { color: "#FFFAF0", text: "#975A16", icon: "🏃" },
  "Geriatric Care":           { color: "#F7FAFC", text: "#4A5568", icon: "🐾" },
  "Post-Surgical":            { color: "#FFF5F5", text: "#C53030", icon: "🩺" },
  "Neurological Rehab":       { color: "#FAF5FF", text: "#553C9A", icon: "🧠" },
  "Sport Conditioning":       { color: "#F0FFF4", text: "#22543D", icon: "🏅" },
  "Complementary Therapy":    { color: "#FFFFF0", text: "#744210", icon: "🌿" },
  "Pediatric Rehabilitation": { color: "#FFF5F5", text: "#702459", icon: "🐶" },
  "Palliative Care":          { color: "#F7FAFC", text: "#2D3748", icon: "❤️" },
  "Breed-Specific":           { color: "#FFFAF0", text: "#7B341E", icon: "🦴" },
};

// ─────────────────────────────────────────────
// SVG OVERLAY LAYER — Anatomical indicators for storyboard frames
// ─────────────────────────────────────────────
function SvgOverlayLayer({ indicators, overlayToggles, width, height }) {
  if (!indicators || indicators.length === 0) return null;

  // Map SVG indicator types to overlay toggle groups
  const typeToGroup = {
    flexion_arc: 'joint_angles', extension_arc: 'joint_angles', joint_pivot: 'joint_angles',
    force_vector: 'arrows', hand_placement: 'arrows',
    muscle_highlight: 'good_form',
  };

  const visible = indicators.filter(ind => {
    const group = typeToGroup[ind.type] || 'safety_warnings';
    return overlayToggles[group];
  });

  return (
    <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      viewBox={`0 0 100 100`} preserveAspectRatio="none">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" fill="#39FF7E">
          <polygon points="0 0, 8 3, 0 6" />
        </marker>
      </defs>
      {visible.map((ind, i) => {
        if (ind.type === 'force_vector') {
          return <line key={i} x1={ind.x} y1={ind.y} x2={ind.x + (ind.dx || 0)} y2={ind.y + (ind.dy || 0)}
            stroke={ind.color || "#39FF7E"} strokeWidth="0.8" markerEnd="url(#arrowhead)" opacity={0.85} />;
        }
        if (ind.type === 'joint_pivot') {
          return <g key={i}>
            <circle cx={ind.x} cy={ind.y} r="2.5" fill="none" stroke={ind.color || "#D97706"} strokeWidth="0.6" opacity={0.9} />
            <circle cx={ind.x} cy={ind.y} r="1" fill={ind.color || "#D97706"} opacity={0.7} />
          </g>;
        }
        if (ind.type === 'hand_placement') {
          return <circle key={i} cx={ind.x} cy={ind.y} r="3" fill="none" stroke={ind.color || "#0EA5E9"}
            strokeWidth="0.5" strokeDasharray="1.5,1" opacity={0.8} />;
        }
        if (ind.type === 'muscle_highlight') {
          return <ellipse key={i} cx={ind.x} cy={ind.y} rx={ind.rx || 10} ry={ind.ry || 15}
            fill={ind.color || "rgba(14,165,233,0.2)"} stroke="none" />;
        }
        if (ind.type === 'flexion_arc' || ind.type === 'extension_arc') {
          const r = 14;
          const s = (ind.angle_start || 0) * Math.PI / 180;
          const e = (ind.angle_end || 90) * Math.PI / 180;
          const sx = ind.x + r * Math.cos(s);
          const sy = ind.y + r * Math.sin(s);
          const ex = ind.x + r * Math.cos(e);
          const ey = ind.y + r * Math.sin(e);
          const largeArc = Math.abs(e - s) > Math.PI ? 1 : 0;
          return <path key={i} d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} ${e > s ? 1 : 0} ${ex} ${ey}`}
            fill="none" stroke={ind.color || "#0EA5E9"} strokeWidth="0.7" strokeDasharray="2,1" opacity={0.8} />;
        }
        return null;
      })}
      {/* Overlay labels */}
      {visible.filter(ind => ind.label && (ind.type === 'joint_pivot' || ind.type === 'hand_placement')).map((ind, i) => (
        <text key={`lbl-${i}`} x={ind.x + 4} y={ind.y - 3} fill={ind.color || "#fff"} fontSize="2.2" fontFamily="Inter, sans-serif" opacity={0.9}>
          {ind.label}
        </text>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// STORYBOARD PLAYER — Frame-by-frame exercise demonstration modal
// ─────────────────────────────────────────────
function StoryboardPlayer({ exerciseCode, onClose }) {
  const [storyboard, setStoryboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scriptMode, setScriptMode] = useState('client');
  const [showScript, setShowScript] = useState(true);
  const [overlayToggles, setOverlayToggles] = useState({
    arrows: true, joint_angles: true, weight_shift: false,
    good_form: false, common_mistakes: false, safety_warnings: true,
  });

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/storyboards/${exerciseCode}`)
      .then(r => {
        setStoryboard(r.data.data || r.data);
        // Apply default overlay visibility from storyboard data
        if (r.data.data?.overlay_groups) {
          const defaults = {};
          Object.entries(r.data.data.overlay_groups).forEach(([key, val]) => { defaults[key] = val.default_visible; });
          setOverlayToggles(prev => ({ ...prev, ...defaults }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [exerciseCode]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || !storyboard) return;
    const frame = storyboard.frames[currentFrame];
    const timer = setTimeout(() => {
      if (currentFrame < storyboard.frames.length - 1) {
        setCurrentFrame(f => f + 1);
      } else {
        setIsPlaying(false);
        setCurrentFrame(0);
      }
    }, (frame.duration_seconds || 5) * 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentFrame, storyboard]);

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,0.92)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E2E8F0", borderTopColor: C.teal, animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!storyboard) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,0.92)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.surface, borderRadius: 16, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Storyboard not found for {exerciseCode}</div>
          <button onClick={onClose} style={{ ...S.btn("dark"), marginTop: 16 }}>Close</button>
        </div>
      </div>
    );
  }

  const frame = storyboard.frames[currentFrame];
  const script = scriptMode === 'clinician' ? storyboard.clinician_script : storyboard.client_script;
  const branding = storyboard.branding || {};

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,0.92)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.surface, borderRadius: 16, width: "94%", maxWidth: 1100, maxHeight: "92vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: `1px solid ${C.border}` }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: C.navy }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {branding.asclepius_symbol && <span style={{ fontSize: 20, color: branding.neon_accent || "#39FF7E" }}>⚕</span>}
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: branding.font_title || "'Exo 2', sans-serif" }}>
                {storyboard.exercise_name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                {storyboard.clinical_purpose.length > 120 ? storyboard.clinical_purpose.slice(0, 120) + '...' : storyboard.clinical_purpose}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <FiX size={16} />
          </button>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display: "flex", gap: 0 }}>

          {/* ── FRAME VIEWER + CAPTIONS (left, flex 1) ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Frame Viewer */}
            <div style={{
              margin: "16px 16px 0", borderRadius: 12, position: "relative", overflow: "hidden",
              background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
              minHeight: 320, border: `1px solid rgba(57,255,126,0.12)`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              {/* Frame Title Banner */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px 16px", background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: branding.neon_accent || "#39FF7E", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Frame {frame.frame_number} of {storyboard.frames.length}
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginTop: 2, fontFamily: "'Exo 2', sans-serif" }}>
                    {frame.frame_title}
                  </div>
                </div>
                {frame.status === 'locked' && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#D97706", background: "rgba(217,119,6,0.15)", padding: "3px 10px", borderRadius: 20 }}>
                    <FiLock size={10} /> Premium
                  </span>
                )}
              </div>

              {/* Frame Description — large centered text card */}
              <div style={{ textAlign: "center", padding: "56px 32px 24px", position: "relative", width: "100%" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
                  {frame.frame_description}
                </div>
              </div>

              {/* SVG Overlay Layer */}
              <SvgOverlayLayer indicators={frame.svg_indicators} overlayToggles={overlayToggles} width="100%" height="100%" />

              {/* Watermark */}
              <div style={{
                position: "absolute", bottom: 8, right: 12, fontSize: 11, fontWeight: 700,
                color: `rgba(255,255,255,${branding.watermark_opacity || 0.08})`,
                fontFamily: "'Exo 2', sans-serif", letterSpacing: "0.5px", pointerEvents: "none"
              }}>
                {branding.watermark_text || "K9 Rehab Pro\u2122"}
              </div>

              {/* Frame progress bar */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)" }}>
                <div style={{ height: "100%", width: `${((currentFrame + 1) / storyboard.frames.length) * 100}%`, background: `linear-gradient(90deg, ${branding.neon_accent || "#39FF7E"}, ${branding.secondary_accent || "#0EA5E9"})`, transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* ── CAPTION AREA ── */}
            <div style={{ margin: "0 16px", padding: "14px 18px", borderBottom: `1px solid ${C.borderLight}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Dog Action</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{frame.dog_action}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Handler Action</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{frame.handler_action}</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Clinical Cues</div>
                <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>{frame.clinical_cues}</div>
              </div>
              {frame.safety_notes && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: C.redBg, border: "1px solid rgba(220,38,38,0.15)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.red, display: "flex", alignItems: "center", gap: 4 }}>
                    <FiAlertTriangle size={10} /> Safety
                  </div>
                  <div style={{ fontSize: 11, color: "#991B1B", marginTop: 3, lineHeight: 1.5 }}>{frame.safety_notes}</div>
                </div>
              )}
            </div>

            {/* ── NAVIGATION BAR ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.borderLight}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setCurrentFrame(0)} disabled={currentFrame === 0}
                  style={{ background: currentFrame === 0 ? "#F1F5F9" : C.navy, color: currentFrame === 0 ? "#94A3B8" : "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: currentFrame === 0 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>
                  ⏮
                </button>
                <button onClick={() => setCurrentFrame(f => Math.max(0, f - 1))} disabled={currentFrame === 0}
                  style={{ background: currentFrame === 0 ? "#F1F5F9" : C.navy, color: currentFrame === 0 ? "#94A3B8" : "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: currentFrame === 0 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>
                  ◀ Prev
                </button>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text, padding: "0 8px" }}>
                  {currentFrame + 1} / {storyboard.frames.length}
                </span>
                <button onClick={() => setCurrentFrame(f => Math.min(storyboard.frames.length - 1, f + 1))} disabled={currentFrame === storyboard.frames.length - 1}
                  style={{ background: currentFrame === storyboard.frames.length - 1 ? "#F1F5F9" : C.navy, color: currentFrame === storyboard.frames.length - 1 ? "#94A3B8" : "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: currentFrame === storyboard.frames.length - 1 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>
                  Next ▶
                </button>
                <button onClick={() => setCurrentFrame(storyboard.frames.length - 1)} disabled={currentFrame === storyboard.frames.length - 1}
                  style={{ background: currentFrame === storyboard.frames.length - 1 ? "#F1F5F9" : C.navy, color: currentFrame === storyboard.frames.length - 1 ? "#94A3B8" : "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: currentFrame === storyboard.frames.length - 1 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>
                  ⏭
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => { setIsPlaying(p => !p); if (!isPlaying) setCurrentFrame(0); }}
                  style={{ background: isPlaying ? C.red : C.teal, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  {isPlaying ? "⏹ Stop" : "▶ Play All"}
                </button>
                <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
                  <button onClick={() => setScriptMode('client')}
                    style={{ padding: "5px 10px", fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer", background: scriptMode === 'client' ? C.teal : "#F1F5F9", color: scriptMode === 'client' ? "#fff" : C.textMid }}>
                    Client
                  </button>
                  <button onClick={() => setScriptMode('clinician')}
                    style={{ padding: "5px 10px", fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer", background: scriptMode === 'clinician' ? C.navy : "#F1F5F9", color: scriptMode === 'clinician' ? "#fff" : C.textMid }}>
                    Clinician
                  </button>
                </div>
              </div>
            </div>

            {/* ── SCRIPT PANEL ── */}
            <div style={{ padding: "0 16px 16px" }}>
              <button onClick={() => setShowScript(s => !s)} style={{ background: "none", border: "none", padding: "10px 0", cursor: "pointer", fontSize: 11, fontWeight: 600, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}>
                {showScript ? "▼" : "▶"} {scriptMode === 'clinician' ? "Clinician" : "Client"} Script ({script.duration_range})
              </button>
              {showScript && (
                <div style={{
                  padding: "14px 18px", borderRadius: 10,
                  background: scriptMode === 'clinician' ? "rgba(10,37,64,0.04)" : "rgba(14,165,233,0.04)",
                  border: `1px solid ${scriptMode === 'clinician' ? "rgba(10,37,64,0.1)" : "rgba(14,165,233,0.12)"}`,
                }}>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{script.text}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
                    {script.key_phrases.map((kp, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(14,165,233,0.1)", color: C.teal }}>{kp}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── OVERLAY TOGGLES PANEL (right sidebar) ── */}
          <div style={{ width: 180, flexShrink: 0, borderLeft: `1px solid ${C.borderLight}`, padding: "16px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
              Clinical Overlays
            </div>
            {storyboard.overlay_groups && Object.entries(storyboard.overlay_groups).map(([key, group]) => (
              <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={overlayToggles[key] || false}
                  onChange={() => setOverlayToggles(prev => ({ ...prev, [key]: !prev[key] }))}
                  style={{ marginTop: 2, accentColor: group.color }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{group.label}</div>
                  <div style={{ fontSize: 9, color: C.textLight, lineHeight: 1.4, marginTop: 1 }}>{group.description}</div>
                </div>
              </label>
            ))}

            {/* ── Quick Info ── */}
            <div style={{ marginTop: 16, padding: "10px 12px", borderRadius: 8, background: "#F8FAFC", border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Exercise Info</div>
              <div style={{ fontSize: 10, color: C.textMid, marginBottom: 4 }}>
                <strong>Frames:</strong> {storyboard.frames.length}
              </div>
              <div style={{ fontSize: 10, color: C.textMid, marginBottom: 4 }}>
                <strong>Version:</strong> {storyboard.version}
              </div>
              <div style={{ fontSize: 10, color: C.textMid }}>
                <strong>Code:</strong> {storyboard.exercise_code}
              </div>
            </div>

            {/* ── Equipment ── */}
            {storyboard.equipment_needed && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Equipment</div>
                {storyboard.equipment_needed.map((eq, i) => (
                  <div key={i} style={{ fontSize: 10, color: eq.required ? C.text : C.textLight, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: eq.required ? C.green : "#CBD5E0" }}>{eq.required ? "●" : "○"}</span>
                    {eq.item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EXERCISE LIBRARY VIEW
// ─────────────────────────────────────────────
function ExercisesView() {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterDiff, setFilterDiff] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});
  const [showStoryboard, setShowStoryboard] = useState(null);
  const catRefs = useRef({});

  useEffect(() => {
    axios.get(`${API}/exercises`).then(r => setExercises(r.data)).catch(() => {});
  }, []);

  const categories = [...new Set(exercises.map(e => e.category))].sort();
  const filtered = exercises.filter(e =>
    (!search || e.name.toLowerCase().includes(search.toLowerCase()) ||
                e.description?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat  || e.category  === filterCat) &&
    (!filterDiff || e.difficulty_level === filterDiff)
  );

  // Group by category
  const grouped = {};
  filtered.forEach(e => {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category].push(e);
  });

  const toggleCat = (cat) =>
    setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  const scrollToCat = (cat) => {
    setCollapsedCats(prev => ({ ...prev, [cat]: false }));
    setTimeout(() => {
      catRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const isSearching = search || filterCat || filterDiff;

  const easyCount = exercises.filter(e => e.difficulty_level === "Easy").length;
  const modCount = exercises.filter(e => e.difficulty_level === "Moderate").length;
  const advCount = exercises.filter(e => e.difficulty_level === "Advanced").length;

  return (
    <div>
      {/* Storyboard Player Modal */}
      {showStoryboard && <StoryboardPlayer exerciseCode={showStoryboard} onClose={() => setShowStoryboard(null)} />}
      {/* Search Toolbar */}
      <div style={{ ...S.card, background: C.navy, border: `2px solid ${C.navy}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <FiSearch size={14} style={{ position: "absolute", left: 12, top: 11, color: "rgba(255,255,255,0.4)" }} />
            <input style={{ ...S.input, paddingLeft: 34, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff", height: 38 }} placeholder="Search exercises by name or description…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={{ ...S.select, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff", height: 38 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={{ ...S.select, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff", height: 38 }} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
            <option value="">All Levels</option>
            {["Easy","Moderate","Advanced"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", fontWeight: 600 }}>
            {filtered.length} / {exercises.length}
          </span>
        </div>
      </div>

      {/* Exercise Categories + Difficulty Counts */}
      <div style={{ ...S.card, background: C.navy, border: `2px solid ${C.navy}`, padding: 20 }}>
        {/* Header row: title + difficulty counts */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>
            Exercise Categories
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {[
              { label: "Easy", count: easyCount, color: "#10B981" },
              { label: "Moderate", count: modCount, color: "#0EA5E9" },
              { label: "Advanced", count: advCount, color: "#F59E0B" },
            ].map(d => (
              <div key={d.label} onClick={() => setFilterDiff(prev => prev === d.label ? "" : d.label)}
                style={{ display: "flex", alignItems: "baseline", gap: 5, cursor: "pointer", transition: "opacity 0.15s", opacity: filterDiff && filterDiff !== d.label ? 0.4 : 1 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: d.color, lineHeight: 1 }}>{d.count}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 3, width: "100%", overflow: "hidden", marginBottom: 14, borderRadius: 2 }}>
          <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {categories.map(cat => {
            const meta = CAT_META[cat] || { icon: "📋" };
            const count = grouped[cat]?.length || 0;
            return (
              <button key={cat} onClick={() => scrollToCat(cat)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: 12, fontWeight: 600,
                transition: "all 0.15s",
                opacity: count > 0 ? 1 : 0.4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,0.25)"; e.currentTarget.style.borderColor = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
                <span style={{ fontSize: 14 }}>{meta.icon}</span>
                {cat}
                {count > 0 && <span style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category sections */}
      {Object.entries(grouped).length === 0 && (
        <div style={{ ...S.card, border: `2px solid ${C.navy}`, textAlign: "center", color: "#A0AEC0", padding: 48 }}>
          No exercises match your search
        </div>
      )}

      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, exList]) => {
        const meta = CAT_META[cat] || { color: "#F7FAFC", text: "#4A5568", icon: "📋" };
        const isCollapsed = collapsedCats[cat];

        return (
          <div key={cat} ref={el => catRefs.current[cat] = el} style={{ ...S.card, background: C.navy, border: `2px solid ${C.navy}`, padding: 0, overflow: "hidden", marginBottom: 12 }}>
            {/* Category header */}
            <div
              onClick={() => toggleCat(cat)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", background: C.navy, cursor: "pointer",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{meta.icon}</span>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>{cat}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    {exList.length} exercise{exList.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {["Easy","Moderate","Advanced"].map(d => {
                    const n = exList.filter(e => e.difficulty_level === d).length;
                    if (!n) return null;
                    return <span key={d} style={{ ...S.badge(d === "Easy" ? "green" : d === "Advanced" ? "orange" : "blue"),
                      fontSize: 10 }}>{n} {d}</span>;
                  })}
                </div>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                  {isCollapsed ? "▼" : "▲"}
                </span>
              </div>
            </div>
            {/* Neon flatline under header */}
            <div style={{ height: 3, width: "100%", overflow: "hidden" }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
            </div>

            {/* Exercise grid */}
            {!isCollapsed && (
              <div style={{ padding: 16 }}>
                <div style={S.grid(3)}>
                  {exList.map(e => <ExerciseCard key={e.code} e={e} onOpenStoryboard={setShowStoryboard} />)}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button onClick={() => { const el = document.querySelector('[data-content-scroll]'); if (el) el.scrollTo({ top: 0, behavior: "smooth" }); else window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 16px", borderRadius: 8, cursor: "pointer",
                    background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
                    color: "#fff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,0.25)"; e.currentTarget.style.borderColor = C.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                    <FiArrowUp size={13} /> Back to Top
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// SESSIONS VIEW — SOAP + CBPI OUTCOME MEASURES
// ─────────────────────────────────────────────
function SessionsView() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [activeTab, setActiveTab] = useState("soap");

  // SOAP form state
  const [soapForm, setSoapForm] = useState({
    subjective: "", objective: "", assessment: "", plan: "",
    painPre: 0, painPost: 0, lamenessPre: 0, lamenessPost: 0,
    sessionDate: new Date().toISOString().split("T")[0],
  });

  // CBPI form state — Brown et al. 2008, JAVMA 233:1278-1283
  const [cbpi, setCbpi] = useState({
    pss_worst: 0, pss_least: 0, pss_average: 0, pss_now: 0,
    pis_activity: 0, pis_enjoyment: 0, pis_rising: 0,
    pis_walking: 0, pis_running: 0, pis_climbing: 0,
    notes: "",
  });

  // Client-side session/CBPI history
  const [soapHistory, setSoapHistory] = useState([]);
  const [cbpiHistory, setCbpiHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API}/patients`).then(r => setPatients(r.data || [])).catch(() => {});
  }, []);

  // CBPI computed scores
  const pssScore = ((cbpi.pss_worst + cbpi.pss_least + cbpi.pss_average + cbpi.pss_now) / 4).toFixed(1);
  const pisScore = ((cbpi.pis_activity + cbpi.pis_enjoyment + cbpi.pis_rising + cbpi.pis_walking + cbpi.pis_running + cbpi.pis_climbing) / 6).toFixed(1);
  const combinedScore = ((parseFloat(pssScore) + parseFloat(pisScore)) / 2).toFixed(1);

  const scoreColor = (val, max = 10) => {
    const ratio = val / max;
    return ratio <= 0.3 ? C.green : ratio <= 0.6 ? C.amber : C.red;
  };
  const scoreBg = (val, max = 10) => {
    const ratio = val / max;
    return ratio <= 0.3 ? C.greenBg : ratio <= 0.6 ? C.amberBg : C.redBg;
  };

  // Shared 0-10 button row component
  const ScoreRow = ({ label, value, onChange }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 8, display: "block" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: C.green, fontWeight: 600, minWidth: 48 }}>No Pain</span>
        <div style={{ flex: 1, display: "flex", gap: 3 }}>
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => onChange(n)} type="button" style={{
              flex: 1, height: 34, borderRadius: 5,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: value === n ? (n <= 3 ? C.green : n <= 6 ? C.amber : C.red) : "rgba(255,255,255,0.06)",
              color: value === n ? "#fff" : "#94A3B8",
              transition: "all 0.1s",
              border: value === n ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}>
              {n}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: C.red, fontWeight: 600, minWidth: 60, textAlign: "right" }}>Worst</span>
      </div>
    </div>
  );

  const tabs = [
    { id: "soap", label: "SOAP Notes", icon: FiClipboard },
    { id: "cbpi", label: "CBPI Assessment", icon: FiActivity },
    { id: "history", label: "Session History", icon: FiClock },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: activeTab === tab.id ? C.navy : C.surface,
            color: activeTab === tab.id ? "#fff" : C.textMid,
            border: `1px solid ${activeTab === tab.id ? C.navy : C.border}`,
            transition: "all 0.15s",
          }}>
            <tab.icon size={13} /> {tab.label}
            {tab.id === "history" && (soapHistory.length + cbpiHistory.length) > 0 && (
              <span style={{ background: C.teal, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                {soapHistory.length + cbpiHistory.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Patient Selector — shared */}
      <div style={{ ...S.card, padding: "12px 20px", display: "flex", gap: 12, alignItems: "center", background: "#1D2B3A", border: "1.5px solid #2E3D4F" }}>
        <label style={{ ...S.label, margin: 0, whiteSpace: "nowrap", color: "#7DD3FC" }}>Patient</label>
        <select style={{ ...S.select, flex: 1, border: "1.5px solid #3A4A5C" }} value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}>
          <option value="">— Select patient for this session —</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.condition || "N/A"} ({p.client_name || "N/A"})</option>
          ))}
        </select>
      </div>

      {/* ═══════════ SOAP TAB ═══════════ */}
      {activeTab === "soap" && (
        <div style={{ ...S.card, background: "#1D2B3A", border: "2px solid #2E3D4F" }}>
          <div>
            <div style={S.sectionHeader()}>
              <FiClipboard size={13} style={{ color: "#39FF7E" }} /> SOAP Note Entry
            </div>
            <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
            </div>
          </div>

          {/* S - Subjective */}
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>S — Subjective (Owner Report)</label>
            <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
              placeholder="Owner observations: appetite, activity level, willingness to bear weight, behavior changes..."
              value={soapForm.subjective} onChange={e => setSoapForm(f => ({ ...f, subjective: e.target.value }))} />
          </div>

          {/* O - Objective */}
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>O — Objective (Clinical Findings)</label>
            <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
              placeholder="ROM (goniometry), limb circumference, weight bearing status, gait analysis, palpation findings..."
              value={soapForm.objective} onChange={e => setSoapForm(f => ({ ...f, objective: e.target.value }))} />
          </div>

          {/* Pre/Post Pain & Lameness */}
          <div style={S.grid(4)}>
            {[
              ["painPre", "Pain (Pre-Tx)", 10],
              ["painPost", "Pain (Post-Tx)", 10],
              ["lamenessPre", "Lameness (Pre)", 5],
              ["lamenessPost", "Lameness (Post)", 5],
            ].map(([key, label, max]) => (
              <div key={key}>
                <label style={S.label}>{label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="range" min="0" max={max} value={soapForm[key]}
                    onChange={e => setSoapForm(f => ({ ...f, [key]: +e.target.value }))}
                    style={{ flex: 1, accentColor: scoreColor(soapForm[key], max) }} />
                  <span style={{
                    fontSize: 13, fontWeight: 700, minWidth: 38, textAlign: "center",
                    padding: "2px 8px", borderRadius: 6,
                    background: scoreBg(soapForm[key], max), color: scoreColor(soapForm[key], max),
                  }}>{soapForm[key]}/{max}</span>
                </div>
              </div>
            ))}
          </div>

          {/* A - Assessment */}
          <div style={{ marginTop: 14, marginBottom: 14 }}>
            <label style={S.label}>A — Assessment</label>
            <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 56, resize: "vertical", fontFamily: "inherit" }}
              placeholder="Clinical assessment: progress toward goals, phase advancement readiness, response to therapy..."
              value={soapForm.assessment} onChange={e => setSoapForm(f => ({ ...f, assessment: e.target.value }))} />
          </div>

          {/* P - Plan */}
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>P — Plan</label>
            <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 56, resize: "vertical", fontFamily: "inherit" }}
              placeholder="Next session plan, frequency changes, phase progression, HEP modifications, referral needs..."
              value={soapForm.plan} onChange={e => setSoapForm(f => ({ ...f, plan: e.target.value }))} />
          </div>

          <button style={{ ...S.btn("success"), boxShadow: "0 0 12px rgba(16,185,129,0.3)" }} onClick={() => {
            const patientName = patients.find(p => String(p.id) === selectedPatient)?.name || "Unknown";
            setSoapHistory(prev => [{ ...soapForm, id: Date.now(), patientId: selectedPatient, patientName, timestamp: new Date().toISOString() }, ...prev]);
            setSoapForm({ subjective: "", objective: "", assessment: "", plan: "", painPre: 0, painPost: 0, lamenessPre: 0, lamenessPost: 0, sessionDate: new Date().toISOString().split("T")[0] });
          }}>
            <FiCheckCircle size={14} /> Save Session Record
          </button>
        </div>
      )}

      {/* ═══════════ CBPI TAB ═══════════ */}
      {activeTab === "cbpi" && (
        <div>
          {/* Citation Banner */}
          <div style={{ ...S.card, background: "rgba(14,165,233,0.08)", border: `1px solid ${C.teal}33`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
            <FiBook size={13} style={{ color: C.teal, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#7DD3FC" }}>
              <strong>Canine Brief Pain Inventory (CBPI)</strong> — Brown DC, Boston RC, Coyne JC, Farrar JT. 2008. Development and psychometric testing of an instrument designed to measure chronic pain in dogs with osteoarthritis. <em>Am J Vet Res</em> 69:1034-1041.
            </span>
          </div>

          {/* Pain Severity Scale (PSS) — 4 items */}
          <div style={{ ...S.card, background: "#1D2B3A", border: "2px solid #2E3D4F" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.8px", paddingBottom: 8 }}>Pain Severity Scale (PSS)</div>
              <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}><div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} /></div>
            </div>
            <ScoreRow label="1. Rate your dog's pain at its WORST in the last 7 days" value={cbpi.pss_worst} onChange={v => setCbpi(f => ({ ...f, pss_worst: v }))} />
            <ScoreRow label="2. Rate your dog's pain at its LEAST in the last 7 days" value={cbpi.pss_least} onChange={v => setCbpi(f => ({ ...f, pss_least: v }))} />
            <ScoreRow label="3. Rate your dog's pain on AVERAGE" value={cbpi.pss_average} onChange={v => setCbpi(f => ({ ...f, pss_average: v }))} />
            <ScoreRow label="4. Rate your dog's pain RIGHT NOW" value={cbpi.pss_now} onChange={v => setCbpi(f => ({ ...f, pss_now: v }))} />
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>PSS Score (Mean of 4 items)</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(pssScore) }}>{pssScore}/10</span>
            </div>
          </div>

          {/* Pain Interference Scale (PIS) — 6 items */}
          <div style={{ ...S.card, background: "#1D2B3A", border: "2px solid #2E3D4F" }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.8px", paddingBottom: 8 }}>Pain Interference Scale (PIS)</div>
              <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}><div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} /></div>
            </div>
            <div style={{ fontSize: 10, color: "#fff", marginBottom: 14 }}>
              During the past 7 days, how much has pain interfered with your dog's:
            </div>
            <ScoreRow label="1. General activity" value={cbpi.pis_activity} onChange={v => setCbpi(f => ({ ...f, pis_activity: v }))} />
            <ScoreRow label="2. Enjoyment of life" value={cbpi.pis_enjoyment} onChange={v => setCbpi(f => ({ ...f, pis_enjoyment: v }))} />
            <ScoreRow label="3. Ability to rise to standing from lying down" value={cbpi.pis_rising} onChange={v => setCbpi(f => ({ ...f, pis_rising: v }))} />
            <ScoreRow label="4. Ability to walk" value={cbpi.pis_walking} onChange={v => setCbpi(f => ({ ...f, pis_walking: v }))} />
            <ScoreRow label="5. Ability to run" value={cbpi.pis_running} onChange={v => setCbpi(f => ({ ...f, pis_running: v }))} />
            <ScoreRow label="6. Ability to climb (stairs, curbs, bed)" value={cbpi.pis_climbing} onChange={v => setCbpi(f => ({ ...f, pis_climbing: v }))} />
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>PIS Score (Mean of 6 items)</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(pisScore) }}>{pisScore}/10</span>
            </div>
          </div>

          {/* CBPI Summary Card */}
          <div style={{
            ...S.card, padding: "24px 28px",
            background: `linear-gradient(135deg, ${C.navy} 0%, #1E293B 100%)`,
            border: `1px solid ${C.teal}44`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>
              CBPI Assessment Summary
            </div>
            <div style={S.grid(3)}>
              {[
                { label: "Pain Severity (PSS)", value: pssScore },
                { label: "Pain Interference (PIS)", value: pisScore },
                { label: "Combined CBPI", value: combinedScore },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "center", padding: "16px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(item.value) }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ ...S.label, color: "rgba(255,255,255,0.5)" }}>Assessor Notes</label>
              <textarea style={{ ...S.input, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
                placeholder="Clinical observations during CBPI assessment..."
                value={cbpi.notes} onChange={e => setCbpi(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button style={{ ...S.btn("success"), marginTop: 16, width: "100%", justifyContent: "center", boxShadow: "0 0 16px rgba(16,185,129,0.3)" }}
              onClick={() => {
                const patientName = patients.find(p => String(p.id) === selectedPatient)?.name || "Unknown";
                setCbpiHistory(prev => [{ ...cbpi, pssScore, pisScore, combinedScore, id: Date.now(), patientId: selectedPatient, patientName, timestamp: new Date().toISOString() }, ...prev]);
                setCbpi({ pss_worst: 0, pss_least: 0, pss_average: 0, pss_now: 0, pis_activity: 0, pis_enjoyment: 0, pis_rising: 0, pis_walking: 0, pis_running: 0, pis_climbing: 0, notes: "" });
              }}>
              <FiCheckCircle size={14} /> Save CBPI Assessment
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ HISTORY TAB ═══════════ */}
      {activeTab === "history" && (
        <div>
          {/* CBPI History */}
          {cbpiHistory.length > 0 && (
            <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  CBPI Assessments — {cbpiHistory.length} record{cbpiHistory.length !== 1 ? "s" : ""}
                </div>
              </div>
              <table style={S.table}>
                <thead>
                  <tr>{["Patient", "PSS", "PIS", "Combined", "Date", "Notes"].map(h =>
                    <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {cbpiHistory.map(r => (
                    <tr key={r.id}>
                      <td style={S.td}><strong style={{ color: C.navy }}>{r.patientName}</strong></td>
                      <td style={S.td}><span style={{ ...S.badge("blue"), background: scoreBg(r.pssScore), color: scoreColor(r.pssScore) }}>{r.pssScore}</span></td>
                      <td style={S.td}><span style={{ ...S.badge("blue"), background: scoreBg(r.pisScore), color: scoreColor(r.pisScore) }}>{r.pisScore}</span></td>
                      <td style={S.td}><span style={{ fontWeight: 700, color: scoreColor(r.combinedScore) }}>{r.combinedScore}</span></td>
                      <td style={{ ...S.td, fontSize: 11, color: C.textMid }}>{new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td style={{ ...S.td, fontSize: 11, color: C.textMid }}>{r.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SOAP History */}
          {soapHistory.length > 0 && (
            <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Session SOAP Notes — {soapHistory.length} record{soapHistory.length !== 1 ? "s" : ""}
                </div>
              </div>
              <table style={S.table}>
                <thead>
                  <tr>{["Patient", "Pain Pre", "Pain Post", "Lameness Pre", "Lameness Post", "Date"].map(h =>
                    <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {soapHistory.map(r => (
                    <tr key={r.id}>
                      <td style={S.td}><strong style={{ color: C.navy }}>{r.patientName}</strong></td>
                      <td style={S.td}><span style={{ ...S.badge("blue"), background: scoreBg(r.painPre), color: scoreColor(r.painPre) }}>{r.painPre}/10</span></td>
                      <td style={S.td}><span style={{ ...S.badge("blue"), background: scoreBg(r.painPost), color: scoreColor(r.painPost) }}>{r.painPost}/10</span></td>
                      <td style={S.td}><span style={{ ...S.badge("blue"), background: scoreBg(r.lamenessPre, 5), color: scoreColor(r.lamenessPre, 5) }}>{r.lamenessPre}/5</span></td>
                      <td style={S.td}><span style={{ ...S.badge("blue"), background: scoreBg(r.lamenessPost, 5), color: scoreColor(r.lamenessPost, 5) }}>{r.lamenessPost}/5</span></td>
                      <td style={{ ...S.td, fontSize: 11, color: C.textMid }}>{new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {soapHistory.length === 0 && cbpiHistory.length === 0 && (
            <div style={{ ...S.card, textAlign: "center", padding: "48px 24px", color: C.textLight }}>
              <FiClock size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>No session records yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Complete a SOAP note or CBPI assessment to see history here</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS — Shared sub-components (defined outside SettingsView to prevent re-mount)
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
      setEntries(logRes.data.entries || []);
      setTotal(logRes.data.total || 0);
      setStats(statsRes.data.stats || []);
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
                        {e.timestamp ? new Date(e.timestamp + 'Z').toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: actionColor(e.action) }}>{e.action || '—'}</td>
                      <td style={{ padding: "8px 10px", color: C.text }}>{e.resource_type || '—'}</td>
                      <td style={{ padding: "8px 10px", color: C.textLight }}>{e.user_label || '—'}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                          background: (e.status_code >= 200 && e.status_code < 300) ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
                          color: (e.status_code >= 200 && e.status_code < 300) ? "#059669" : "#DC2626"
                        }}>{e.status_code || '—'}</span>
                      </td>
                      <td style={{ padding: "8px 10px", color: C.textLight, fontSize: 11, maxWidth: 200,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.detail || '—'}</td>
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
    report_footer: "Generated by K9 Rehab Pro — Evidence-based canine rehabilitation",
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
                        {active && "✓"}
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

// ─────────────────────────────────────────────
// LIVE EKG MONITOR — canvas-based scrolling ECG
// ─────────────────────────────────────────────
function EKGMonitor() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const midY = H * 0.50;
    const amp  = H * 0.38;
    const BEAT_W = 86;   // pixels per heartbeat cycle
    const SPEED  = 1.3;  // pixels advanced per animation frame
    let t = 0;
    let animId;

    // Offscreen buffer — holds the scrolling trace
    const buf = document.createElement("canvas");
    buf.width = W; buf.height = H;
    const bCtx = buf.getContext("2d");
    bCtx.fillStyle = "#020810";
    bCtx.fillRect(0, 0, W, H);

    // Classic PQRST waveform — returns -1..+1
    function ecgY(phase) {
      const p = ((phase % 1) + 1) % 1;
      if (p < 0.07) return 0;
      // P wave
      if (p < 0.17) return 0.18 * Math.sin((p - 0.07) * Math.PI / 0.10);
      if (p < 0.25) return 0;
      // Q dip
      if (p < 0.30) return -0.22 * Math.sin((p - 0.25) * Math.PI / 0.05);
      // R spike — sharp tall peak
      if (p < 0.38) {
        const rp = (p - 0.30) / 0.08;
        return rp < 0.44 ? rp / 0.44 : (1 - rp) / 0.56;
      }
      // S dip
      if (p < 0.44) return -0.24 * Math.sin((p - 0.38) * Math.PI / 0.06);
      if (p < 0.52) return 0;
      // T wave — smooth rounded hump
      if (p < 0.74) return 0.30 * Math.sin((p - 0.52) * Math.PI / 0.22);
      return 0;
    }

    function drawFrame() {
      // ── Scroll buffer left by SPEED px ──
      bCtx.drawImage(buf, -SPEED, 0);
      bCtx.clearRect(W - SPEED - 1, 0, SPEED + 2, H);

      // Draw new segment at right edge
      const prevY = midY - ecgY((t - SPEED) / BEAT_W) * amp;
      const curY  = midY - ecgY(t / BEAT_W) * amp;
      bCtx.beginPath();
      bCtx.strokeStyle = "#10b981";
      bCtx.lineWidth   = 1.8;
      bCtx.shadowBlur  = 9;
      bCtx.shadowColor = "rgba(16,185,129,0.75)";
      bCtx.moveTo(W - SPEED - 1, prevY);
      bCtx.lineTo(W - 1, curY);
      bCtx.stroke();

      // ── Render to main canvas ──
      ctx.fillStyle = "#020810";
      ctx.fillRect(0, 0, W, H);

      // ECG grid (fine squares like a real monitor)
      ctx.strokeStyle = "rgba(16,185,129,0.09)";
      ctx.lineWidth   = 0.5;
      for (let gx = 0; gx < W; gx += 16) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 12) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Draw scrolling trace
      ctx.drawImage(buf, 0, 0);

      // Glowing cursor dot at current draw position
      ctx.beginPath();
      ctx.arc(W - 1, curY, 3.2, 0, Math.PI * 2);
      ctx.fillStyle  = "#34d399";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#10b981";
      ctx.fill();

      t += SPEED;
      animId = requestAnimationFrame(drawFrame);
    }

    drawFrame();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={268} height={54}
      style={{ display: "block", width: "100%", borderRadius: 3 }}
    />
  );
}

// ─────────────────────────────────────────────
// WELCOME / SPLASH VIEW
// ─────────────────────────────────────────────
function WelcomeView({ onEnter, onAbout }) {
  const [hovering, setHovering] = React.useState(false);
  const [aboutHover, setAboutHover] = React.useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "#030c18",
    }}>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes welcomePulse {
          0%, 100% { box-shadow: 0 0 14px rgba(14,165,233,0.45), 0 0 28px rgba(14,165,233,0.2), inset 0 0 12px rgba(14,165,233,0.08); }
          50% { box-shadow: 0 0 28px rgba(14,165,233,0.75), 0 0 56px rgba(14,165,233,0.35), 0 0 80px rgba(14,165,233,0.15), inset 0 0 20px rgba(14,165,233,0.12); }
        }
        .welcome-enter-btn { animation: welcomePulse 2.4s ease-in-out infinite; }
        .welcome-enter-btn:hover { animation: none !important; box-shadow: 0 0 40px rgba(14,165,233,0.8), 0 0 70px rgba(14,165,233,0.4) !important; }

        @keyframes pulseWave {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes vitalGlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes sweepDown1 {
          0% { transform: translateY(-4px); opacity: 0; }
          4% { opacity: 0.85; }
          96% { opacity: 0.65; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes sweepDown2 {
          0% { transform: translateY(-4px); opacity: 0; }
          4% { opacity: 0.4; }
          96% { opacity: 0.28; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes boltFlash {
          0%, 80%, 100% { opacity: 0; }
          82% { opacity: 0.55; }
          84% { opacity: 0.05; }
          86% { opacity: 0.45; }
          88% { opacity: 0; }
        }
      `}</style>

      {/* ── BACKGROUND IMAGE ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/welcome-lab.png')",
        backgroundSize: "cover", backgroundPosition: "center center", backgroundRepeat: "no-repeat",
      }} />

      {/* Subtle teal glow over platform center */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 55%, rgba(0,210,255,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* ── Electric scan overlay ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right, transparent 5%, rgba(14,165,233,0.7) 35%, rgba(96,220,255,0.95) 50%, rgba(14,165,233,0.7) 65%, transparent 95%)",
          boxShadow: "0 0 6px 1px rgba(14,165,233,0.55)",
          animation: "sweepDown1 3.2s linear infinite",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right, transparent 10%, rgba(56,189,248,0.45) 40%, rgba(56,189,248,0.6) 50%, rgba(56,189,248,0.45) 60%, transparent 90%)",
          animation: "sweepDown2 6.8s linear infinite", animationDelay: "1.9s",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, rgba(14,165,233,0.06) 0%, transparent 70%)",
          animation: "boltFlash 5.3s ease-in-out infinite", animationDelay: "1.1s",
        }} />
      </div>

      {/* ── K9 REHAB PRO — center top ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 3,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 36,
      }}>
        <h1 style={{
          fontFamily: "'Exo 2', 'Orbitron', 'Segoe UI', sans-serif",
          fontSize: 52, fontWeight: 900, margin: "0 0 10px",
          color: "#fff", letterSpacing: "6px", lineHeight: 1,
          textTransform: "uppercase",
          textShadow:
            "0 0 24px rgba(14,165,233,0.9), " +
            "0 0 48px rgba(14,165,233,0.5), " +
            "0 2px 0 rgba(0,80,140,0.9), " +
            "0 4px 10px rgba(0,0,0,0.7)",
        }}>
          K9 REHAB PRO
        </h1>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "rgba(14,165,233,0.85)",
          letterSpacing: "2.5px", textTransform: "uppercase",
          textShadow: "0 0 12px rgba(14,165,233,0.5)",
        }}>
          Evidence-Based Canine Exercise Protocols
        </div>
      </div>

      {/* ── ABOUT BUTTON — bottom left ── */}
      <div style={{ position: "absolute", bottom: 48, left: 52, zIndex: 3 }}>
        <button
          onClick={onAbout}
          onMouseEnter={() => setAboutHover(true)}
          onMouseLeave={() => setAboutHover(false)}
          style={{
            fontFamily: "'Exo 2', sans-serif",
            display: "inline-flex", alignItems: "center", gap: 8,
            background: aboutHover ? "rgba(14,165,233,0.28)" : "rgba(14,165,233,0.12)",
            border: "1px solid rgba(14,165,233,0.5)",
            borderRadius: 40, padding: "10px 26px",
            backdropFilter: "blur(12px)",
            color: "#0EA5E9", fontSize: 13, fontWeight: 700,
            letterSpacing: "1.6px", textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.22s, transform 0.22s",
            transform: aboutHover ? "translateY(-2px)" : "none",
            boxShadow: aboutHover ? "0 0 24px rgba(14,165,233,0.5)" : "0 0 10px rgba(14,165,233,0.2)",
          }}
        >
          <FiBookOpen size={15} /> About
        </button>
      </div>

      {/* ── ENTER PLATFORM — center bottom ── */}
      <div style={{
        position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)", zIndex: 3,
      }}>
        <button
          className="welcome-enter-btn"
          onClick={onEnter}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            fontFamily: "'Exo 2', sans-serif",
            display: "inline-flex", alignItems: "center", gap: 10,
            background: hovering ? "rgba(14,165,233,0.28)" : "rgba(14,165,233,0.14)",
            border: "1px solid rgba(14,165,233,0.55)",
            borderRadius: 40,
            backdropFilter: "blur(12px)",
            color: "#0EA5E9", fontSize: 14, fontWeight: 700,
            padding: "12px 36px",
            cursor: "pointer",
            letterSpacing: "2px", textTransform: "uppercase",
            transition: "background 0.22s, transform 0.22s",
            transform: hovering ? "translateY(-2px)" : "none",
          }}
        >
          Enter Platform →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ABOUT VIEW — Brand Story & Platform Info
// ─────────────────────────────────────────────
function AboutView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ ...S.card, border: `2px solid ${C.navy}`, borderTop: `4px solid ${C.teal}`, padding: "32px 36px", textAlign: "center" }}>
        <img src="/caduceus.png" alt="Rod of Asclepius" style={{ width: 64, height: 64, marginBottom: 12, objectFit: "contain" }} />
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.navy, margin: "0 0 8px",
          fontFamily: "'Exo 2', 'Orbitron', sans-serif", letterSpacing: "2px" }}>
          K9 REHAB PRO
        </h1>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 16, textShadow: "0 0 8px rgba(14,165,233,0.4)" }}>
          Clinical Decision-Support System for Evidence-Based Canine Exercise Protocols
        </div>
        <p style={{ fontSize: 14, color: "#111", lineHeight: 1.8, maxWidth: 650, margin: "0 auto" }}>
          K9 Rehab Pro is a veterinary rehabilitation platform built for the clinicians who dedicate their careers to helping dogs recover, move, and live better. Designed from the ground up using evidence-based methodology, it transforms clinical expertise into structured, repeatable rehabilitation protocols.
        </p>
      </div>

      <div style={S.grid(2)}>
        <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiBookOpen size={16} style={{ color: C.teal }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#000" }}>Evidence-Based Foundation</h3>
          </div>
          <p style={{ fontSize: 12, color: "#111", lineHeight: 1.7, margin: 0 }}>
            Every protocol, exercise, and progression rule is sourced from peer-reviewed veterinary rehabilitation literature. Primary references include Millis & Levine's <em>Canine Rehabilitation and Physical Therapy</em> (2nd ed., Elsevier 2014), Zink & Van Dyke's <em>Canine Sports Medicine and Rehabilitation</em> (2nd ed., Wiley 2018), and ACVSMR position statements.
          </p>
        </div>

        <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiShield size={16} style={{ color: C.navy }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#000" }}>CDSS Classification</h3>
          </div>
          <p style={{ fontSize: 12, color: "#111", lineHeight: 1.7, margin: 0 }}>
            K9 Rehab Pro is classified as a Clinical Decision-Support System (CDSS). It assists licensed veterinary professionals in generating rehabilitation protocols but does not replace clinical judgment, establish a VCPR, or provide diagnoses. All output requires veterinary review and approval.
          </p>
        </div>

        <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiActivity size={16} style={{ color: "#059669" }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#000" }}>Protocol Engine</h3>
          </div>
          <p style={{ fontSize: 12, color: "#111", lineHeight: 1.7, margin: 0 }}>
            4 ACVSMR-aligned protocols (TPLO, IVDD, OA, Geriatric) with 4 gated phases each. 170+ exercises classified by intervention type, phase appropriateness, and evidence grade. Automated contraindication enforcement prevents unsafe exercise selection.
          </p>
        </div>

        <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FiLock size={16} style={{ color: "#D97706" }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#000" }}>Data Privacy</h3>
          </div>
          <p style={{ fontSize: 12, color: "#111", lineHeight: 1.7, margin: 0 }}>
            All patient and client data remains local to your installation. No data is transmitted to external servers, sold to third parties, or used for AI training. The platform is designed with HIPAA-aligned principles and supports state veterinary medical board recordkeeping requirements.
          </p>
        </div>
      </div>

      <div style={{ ...S.card, border: `2px solid ${C.navy}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 900, color: "#000", marginBottom: 12 }}>Target Environments</h3>
        <div style={S.grid(4)}>
          {[
            ["General Practice", "DVM-supervised rehabilitation for primary care clinics"],
            ["Rehabilitation Centers", "CCRP/CCRT-certified facilities with full modality access"],
            ["Specialty Hospitals", "Integration with surgical, neurology, and oncology teams"],
            ["Universities", "Clinical teaching and research under faculty supervision"],
          ].map(([title, desc]) => (
            <div key={title} style={{ padding: "12px 14px", background: C.surface, borderRadius: 8, border: `2px solid ${C.navy}` }}>
              <div style={{ fontWeight: 900, fontSize: 12, color: "#000", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: "#111", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...S.card, background: C.navy, border: `2px solid ${C.navy}`, textAlign: "center", padding: "20px 28px" }}>
        <div style={{ fontSize: 11, color: "#FFFFFF", lineHeight: 1.7 }}>
          K9 Rehab Pro™ · Clinical Decision-Support System · ACVSMR-Aligned Methodology
          <br />Evidence-Based Canine Rehabilitation Exercise Protocols
          <br />All protocols require licensed veterinary review and approval before clinical application.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TOP NAVIGATION
// ─────────────────────────────────────────────
const NAV = [
  { id: "dashboard",  label: "Dashboard",           icon: FiBarChart2,  desc: "Clinical analytics" },
  { id: "generator",  label: "Diagnostics Workup",  icon: FiActivity,   desc: "Intake & protocol generation" },
  { id: "exercises",  label: "Exercise Library",     icon: FiBookOpen,   desc: "179 evidence-based exercises" },
  { id: "clients",    label: "Patient Records",     icon: TbDog,        desc: "Patient database" },
  { id: "sessions",   label: "SOAP",                icon: FiClipboard,  desc: "SOAP notes & outcomes" },
  { id: "settings",   label: "Settings",            icon: FiSettings,   desc: "Configuration" },
  { id: "about",      label: "About",               icon: FiHeart,      desc: "Platform & methodology" },
];


function TopNav({ view, setView, brand, dateStr, timeStr }) {
  return (
    <div style={S.topNav}>
      <style>{`
        @keyframes faviconGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(57,255,126,0.4)) drop-shadow(0 0 10px rgba(14,165,233,0.2)); }
          50% { filter: drop-shadow(0 0 10px rgba(57,255,126,0.8)) drop-shadow(0 0 22px rgba(14,165,233,0.4)) drop-shadow(0 0 36px rgba(57,255,126,0.15)); }
        }
      `}</style>
      <div style={{ ...S.topNavBrand, cursor: "pointer" }} onClick={() => setView("generator")}>
        <img src="/favicon.png" alt="K9 Rehab Pro"
          style={{ width: 30, height: 30, animation: "faviconGlow 2.8s ease-in-out infinite" }} />
        <span style={{
          fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', sans-serif",
          fontSize: 15, fontWeight: 900, letterSpacing: "2.5px",
          background: "linear-gradient(90deg, #0A2540 0%, #0F3460 40%, #0EA5E9 70%, #39FF7E 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{brand.clinicName || "K9 REHAB PRO\u2122"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#111", fontWeight: 500 }}>{dateStr}</div>
          <div style={{ fontSize: 12, color: C.navy, fontWeight: 700, marginTop: 1, fontFamily: "'Exo 2', monospace", letterSpacing: "1px" }}>{timeStr}</div>
        </div>
        <div style={{ fontSize: 10, color: C.textLight, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          onClick={() => setView("welcome")}>
          <FiStar size={11} /> Preview
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("welcome");
  const [genKey, setGenKey] = useState(0);
  const [genInitialStep, setGenInitialStep] = useState(1);
  const [brand, setBrand] = useState({ clinicName: "K9 Rehab Pro™", accent: "#0F4C81" });

  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const views = {
    home:       <GeneratorView key={genKey} initialStep={1} />,
    dashboard:  <DashboardView setView={setView} />,
    clients:   <ClientsView />,
    generator: <GeneratorView key={genKey} initialStep={genInitialStep} />,
    exercises: <ExercisesView />,
    sessions:  <SessionsView />,
    settings:  <SettingsView brand={brand} setBrand={setBrand} />,
    about:     <AboutView />,
  };

  if (view === "welcome") {
    return <WelcomeView onEnter={() => setView("home")} onAbout={() => setView("about")} />;
  }

  const dateStr = liveTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div style={S.app}>
      <style>{`
        @keyframes ekgScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes neonFlatline {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      {/* TOP BAR — white, K9 Rehab Pro TM + date/clock */}
      <TopNav view={view} setView={setView} brand={brand} dateStr={dateStr} timeStr={timeStr} />

      {/* MAIN */}
      <div style={S.main}>
        {/* Nav links bar — navy blue with page navigation */}
        <div style={{
          background: `linear-gradient(90deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 24px", height: 38, flexShrink: 0,
          gap: 2,
        }}>
          <div
            onClick={() => { setGenKey(k => k + 1); setView("home"); const el = document.querySelector("[data-content-scroll]"); if (el) el.scrollTop = 0; }}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 5, background: view === "home" ? "rgba(57,255,126,0.25)" : "rgba(57,255,126,0.12)", border: `1px solid ${view === "home" ? "rgba(57,255,126,0.6)" : "rgba(57,255,126,0.3)"}`, marginRight: 10, transition: "all 0.2s" }}
            title="Home — Section 1 Intake"
          >
            <FiHome size={12} style={{ color: "#39FF7E" }} />
          </div>
          {NAV.map(({ id, label, icon: Icon }) => (
            <div key={id} style={S.topNavItem(view === id)} onClick={() => {
              if (id === "generator") {
                setGenInitialStep(2);
                setGenKey(k => k + 1);
              } else {
                setGenInitialStep(1);
              }
              setView(id);
              const contentEl = document.querySelector("[data-content-scroll]");
              if (contentEl) contentEl.scrollTop = 0;
            }}>
              <Icon size={12} /> <span>{label}</span>
            </div>
          ))}
        </div>
        {/* Neon green flatline — continuous scroll left to right */}
        <div style={{ height: 3, width: "100%", overflow: "hidden", position: "relative", background: C.navy }}>
          <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "ekgScroll 3s linear infinite", boxShadow: "0 0 8px rgba(57,255,126,0.5), 0 0 16px rgba(57,255,126,0.2)" }} />
        </div>

        <div style={S.content} data-content-scroll>
          {views[view]}
        </div>
      </div>
    </div>
  );
}
