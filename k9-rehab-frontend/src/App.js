import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers, FiActivity, FiBookOpen, FiClipboard,
  FiSettings, FiSearch, FiChevronRight,
  FiX, FiAlertTriangle, FiCheckCircle, FiBook, FiStar,
  FiCalendar, FiFileText, FiHeart
} from "react-icons/fi";

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
    background: `linear-gradient(90deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 56, flexShrink: 0,
    borderBottom: `1px solid rgba(255,255,255,0.06)`,
  },
  topNavBrand: {
    display: "flex", alignItems: "center", gap: 10,
    color: "#fff", fontFamily: "'Exo 2', 'Inter', sans-serif",
    fontSize: 15, fontWeight: 700, letterSpacing: "0.5px",
  },
  topNavLinks: {
    display: "flex", alignItems: "center", gap: 4,
  },
  topNavItem: (active) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 6, cursor: "pointer",
    fontSize: 12, fontWeight: 600,
    color: active ? "#fff" : "rgba(255,255,255,0.6)",
    background: active ? "rgba(14,165,233,0.22)" : "transparent",
    borderBottom: active ? "2px solid #0EA5E9" : "2px solid transparent",
    boxShadow: active ? "0 0 10px rgba(14,165,233,0.3)" : "none",
    transition: "all 0.2s ease",
  }),
  // ── WIZARD ──
  wizardProgress: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 0, padding: "8px 32px 8px",
  },
  wizardStep: (state) => ({
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 16px", fontSize: 12, fontWeight: 600,
    color: state === "active" ? C.teal : state === "done" ? C.green : C.textLight,
    cursor: state === "done" ? "pointer" : "default",
  }),
  wizardDot: (state) => ({
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700,
    background: state === "active" ? C.teal : state === "done" ? C.green : C.bg,
    color: state === "active" || state === "done" ? "#fff" : C.textLight,
    border: state === "pending" ? `2px solid ${C.border}` : "none",
    boxShadow: state === "active" ? `0 0 12px rgba(14,165,233,0.5), 0 0 24px rgba(14,165,233,0.25)` : state === "done" ? `0 0 8px rgba(5,150,105,0.35)` : "none",
    transition: "all 0.4s ease",
  }),
  wizardLine: (done) => ({
    width: 60, height: 2,
    background: done ? C.green : C.border,
    margin: "0 4px",
  }),
  wizardNav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 0", marginTop: 16,
    borderTop: `1px solid ${C.border}`,
  },
  // ── MAIN AREA ──
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: {
    background: C.surface, padding: "14px 32px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    minHeight: 56,
  },
  pageTitle: { fontSize: 22, fontWeight: 800, margin: 0, color: C.navy, letterSpacing: "0.3px" },
  pageSub: { fontSize: 12, color: C.text, marginTop: 2, fontWeight: 300 },
  content: { flex: 1, overflow: "auto", padding: "24px 32px" },
  // ── SHARED COMPONENTS ──
  card: {
    background: C.surface, borderRadius: 10, padding: 24,
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 16,
  },
  sectionHeader: () => ({
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 0", marginBottom: 16,
    borderBottom: "2px solid #1E3A5F",
    fontSize: 13, fontWeight: 800, color: "#000",
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
    fontSize: 11, fontWeight: 600, color: "#000",
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
          <div style={S.sectionHeader(C.teal)}>
            <FiHeart size={13} /> New Patient Registration
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
function ProtocolExCard({ entry, onRemove }) {
  const [open, setOpen] = useState(false);
  const ex = entry.exercise || {};

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0",
      overflow: "hidden", gridColumn: open ? "1 / -1" : undefined,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }}>
      {/* Card header */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
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
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROTOCOL GENERATOR VIEW
// ─────────────────────────────────────────────
function GeneratorView() {
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToWeek, setAddingToWeek] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [exSearch, setExSearch] = useState("");

  // Patient intake form
  const [form, setForm] = useState({
    patientName: "", breed: "", age: "", dob: "",
    weightKg: "", weightLbs: "", sex: "Male Intact",
    diagnosis: "TPLO", affectedRegion: "Left Stifle",
    surgeryDate: "", lamenessGrade: "2", bodyConditionScore: "5",
    painLevel: "3", mobilityLevel: "Limited",
    currentMedications: "", medsLastGiven: "", medicalHistory: "",
    specialInstructions: "", protocolLength: "8",
    clientName: "", clientEmail: "", clientPhone: "", clientPhone2: "",
    referringVet: "", mailingAddress: "", city: "", state: "", zipCode: "",
    nearbyHospital: "",
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

  // ── Weight conversion (KG ↔ LBS) ──
  const handleWeightKg = (val) => {
    setField("weightKg", val);
    const kg = parseFloat(val);
    if (!isNaN(kg) && kg > 0) {
      setField("weightLbs", (kg * 2.20462).toFixed(1));
      // Warning: if KG value seems too high for a dog (>90 kg = ~200 lbs)
      if (kg > 90) setWeightWarning("Warning: " + kg + " kg = " + (kg * 2.20462).toFixed(0) + " lbs. Please confirm this is correct.");
      else setWeightWarning("");
    } else { setField("weightLbs", ""); setWeightWarning(""); }
  };
  const handleWeightLbs = (val) => {
    setField("weightLbs", val);
    const lbs = parseFloat(val);
    if (!isNaN(lbs) && lbs > 0) {
      setField("weightKg", (lbs / 2.20462).toFixed(1));
      setWeightWarning("");
    } else { setField("weightKg", ""); setWeightWarning(""); }
  };

  // ── DOB ↔ Age bidirectional ──
  const handleDob = (val) => {
    setField("dob", val);
    if (val) {
      const birth = new Date(val);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) years--;
      setField("age", String(Math.max(0, years)));
    }
  };
  const handleAge = (val) => {
    setField("age", val);
    const years = parseInt(val);
    if (!isNaN(years) && years >= 0) {
      const d = new Date();
      d.setFullYear(d.getFullYear() - years);
      setField("dob", d.toISOString().split("T")[0]);
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
    "Labrador Retriever","German Shepherd","Golden Retriever","French Bulldog","Bulldog",
    "Poodle (Standard)","Poodle (Miniature)","Beagle","Rottweiler","German Shorthaired Pointer",
    "Dachshund","Pembroke Welsh Corgi","Australian Shepherd","Yorkshire Terrier","Boxer",
    "Cavalier King Charles Spaniel","Doberman Pinscher","Miniature Schnauzer","Great Dane","Shih Tzu",
    "Siberian Husky","Bernese Mountain Dog","Cane Corso","Pomeranian","Shetland Sheepdog",
    "Boston Terrier","Havanese","English Springer Spaniel","Brittany","Cocker Spaniel",
    "Miniature American Shepherd","Border Collie","Vizsla","Weimaraner","Belgian Malinois",
    "Chihuahua","Maltese","Collie","Basset Hound","Mastiff",
    "Rhodesian Ridgeback","Newfoundland","Bichon Frise","West Highland White Terrier","Pit Bull Terrier",
    "Akita","Bloodhound","Saint Bernard","Chesapeake Bay Retriever","Greyhound",
    "Irish Setter","Staffordshire Bull Terrier","Jack Russell Terrier","Australian Cattle Dog",
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

    setLoading(true); setError(null); setProtocol(null);
    try {
      const { data } = await axios.post(`${API}/generate-protocol`, {
        ...form,
        age: +form.age || 0,
        weight: +form.weightLbs || +form.weightKg * 2.20462 || 0,
        protocolLength: +form.protocolLength || 8
      });
      setProtocol(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate protocol");
    } finally { setLoading(false); }
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
    <div style={S.sectionHeader()}>
      <Icon size={14} style={{ color: "#1E3A5F" }} /> {title}
    </div>
  );

  // Wizard progress bar
  const WizardProgress = () => {
    const steps = [
      { num: 1, label: "Client & Patient" },
      { num: 2, label: "Clinical Assessment" },
      { num: 3, label: "Protocol Parameters" },
    ];
    return (
      <div style={S.wizardProgress}>
        {steps.map((s, i) => {
          const state = wizardStep > s.num ? "done" : wizardStep === s.num ? "active" : "pending";
          return (
            <React.Fragment key={s.num}>
              {i > 0 && <div style={S.wizardLine(wizardStep > s.num)} />}
              <div style={S.wizardStep(state)}
                onClick={() => state === "done" && goToStep(s.num)}>
                <div style={S.wizardDot(state)}>
                  {state === "done" ? <FiCheckCircle size={14} /> : s.num}
                </div>
                <span>{s.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Wizard progress bar — visible during intake steps */}
      {!protocol && <WizardProgress />}

      {/* ═══════════ STEP 1: CLIENT & PATIENT INFO ═══════════ */}
      {!protocol && wizardStep === 1 && (<>

      {/* ═══════════ SECTION 1: CLIENT INFORMATION ═══════════ */}
      <div style={{ background: "#EFF6FF", border: "2px solid #1E3A5F", borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <SectionHead icon={FiUsers} title="Section 1 — Client Information" />
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>Client / Owner Name</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.clientName} onChange={e => setField("clientName", e.target.value)} placeholder="Last, First" />
          </div>
          <div>
            <label style={S.label}>Email Address</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} type="email" value={form.clientEmail} onChange={e => setField("clientEmail", e.target.value)} placeholder="client@email.com" />
          </div>
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Phone Number</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.clientPhone} onChange={e => setField("clientPhone", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label style={S.label}>Secondary Phone (Optional)</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.clientPhone2} onChange={e => setField("clientPhone2", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label style={S.label}>Referring Veterinarian</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.referringVet} onChange={e => setField("referringVet", e.target.value)} placeholder="DVM Name, Practice" />
          </div>
        </div>
        <div style={{ ...S.grid(4), marginTop: 12 }}>
          <div style={{ gridColumn: "1 / 3" }}>
            <label style={S.label}>Mailing Address</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.mailingAddress} onChange={e => setField("mailingAddress", e.target.value)} placeholder="Street Address" />
          </div>
          <div>
            <label style={S.label}>ZIP Code</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F", maxWidth: 120 }} value={form.zipCode} onChange={e => handleZip(e.target.value)} placeholder="00000" maxLength={5} />
          </div>
          <div />
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>City</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F", background: form.city ? "#F0FFF4" : C.surface }} value={form.city} onChange={e => setField("city", e.target.value)} placeholder="Auto-filled from ZIP" />
          </div>
          <div>
            <label style={S.label}>State</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F", maxWidth: 80, background: form.state ? "#F0FFF4" : C.surface }} value={form.state} onChange={e => setField("state", e.target.value)} placeholder="ST" />
          </div>
          <div>
            <label style={S.label}>Nearby Veterinary Hospital</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #1E3A5F" }} value={form.nearbyHospital} onChange={e => setField("nearbyHospital", e.target.value)}>
              <option value="">— Select Hospital —</option>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 2: PATIENT SIGNALMENT ═══════════ */}
      <div style={{ background: "#EFF6FF", border: "2px solid #1E3A5F", borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={S.sectionHeader()}>
          <span style={{ fontSize: 16 }}>🐕</span> PATIENT SIGNALMENT
        </div>
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Patient Name</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.patientName}
              onChange={e => setField("patientName", e.target.value)} placeholder="Patient Name" />
          </div>
          <div>
            <label style={S.label}>Sex</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #1E3A5F" }} value={form.sex} onChange={e => setField("sex", e.target.value)}>
              <option value="Male Intact">♂ Male Intact</option>
              <option value="Male Neutered">♂ Male Neutered</option>
              <option value="Female Intact">♀ Female Intact</option>
              <option value="Female Spayed">♀ Female Spayed</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Breed</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #1E3A5F" }} value={form.breed} onChange={e => setField("breed", e.target.value)}>
              <option value="">— Select Breed —</option>
              {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ ...S.grid(4), marginTop: 12 }}>
          <div>
            <label style={S.label}>Date of Birth</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} type="date" value={form.dob} onChange={e => handleDob(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Age (Years)</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F", maxWidth: 80 }} type="number" min="0" max="25" value={form.age}
              onChange={e => handleAge(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={S.label}>Weight (KG)</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F", maxWidth: 100 }} type="number" min="0" step="0.1" value={form.weightKg}
              onChange={e => handleWeightKg(e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <label style={S.label}>Weight (LBS)</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F", maxWidth: 100 }} type="number" min="0" step="0.1" value={form.weightLbs}
              onChange={e => handleWeightLbs(e.target.value)} placeholder="0.0" />
          </div>
        </div>
        {weightWarning && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "8px 12px", background: "#FEF2F2", border: "1px solid #DC2626", borderRadius: 6 }}>
            <FiAlertTriangle size={14} style={{ color: "#DC2626" }} />
            <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 500 }}>{weightWarning}</span>
          </div>
        )}
        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Body Condition Score (1–9 WSAVA Scale)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input style={{ ...S.input, flex: 1, border: "1.5px solid #1E3A5F" }} type="range" min="1" max="9" value={form.bodyConditionScore}
                onChange={e => setField("bodyConditionScore", e.target.value)} />
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{form.bodyConditionScore}/9</span>
                <div style={{ fontSize: 9, color: C.textMid, fontWeight: 500 }}>
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
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.currentMedications} onChange={e => setField("currentMedications", e.target.value)}
              placeholder="e.g. Carprofen 75mg BID, Gabapentin 100mg TID" />
          </div>
          <div>
            <label style={S.label}>Medications Last Given</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.medsLastGiven} onChange={e => setField("medsLastGiven", e.target.value)}
              placeholder="e.g. Today 8:00 AM, Yesterday PM" />
          </div>
        </div>
      </div>

      {/* Next button with glow */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 0" }}>
        <button
          style={{
            background: "#1E5A8A", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: "0 0 12px rgba(30,90,138,0.3), 0 0 24px rgba(30,90,138,0.1)",
            transition: "all 0.25s",
          }}
          onClick={() => goToStep(2)}
        >
          Next: Clinical Assessment <FiChevronRight size={16} />
        </button>
      </div>

      </>)}

      {/* ═══════════ STEP 2: CLINICAL ASSESSMENT ═══════════ */}
      {!protocol && wizardStep === 2 && (<>

      {/* ═══════════ SECTION 3: CLINICAL ASSESSMENT ═══════════ */}
      <div style={{ background: "#EFF6FF", border: "2px solid #1E3A5F", borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <SectionHead icon={FiActivity} title="Section 2 — Clinical Assessment" />
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>Primary Diagnosis *</label>
            <select style={{ ...S.select, width: "100%", fontWeight: 600, border: "1.5px solid #1E3A5F" }} value={form.diagnosis} onChange={e => setField("diagnosis", e.target.value)}>
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
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #1E3A5F" }} value={form.affectedRegion} onChange={e => setField("affectedRegion", e.target.value)}>
              <optgroup label="Stifle">{REGIONS.filter(r => r.includes("Stifle")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Hip">{REGIONS.filter(r => r.includes("Hip")).map(r => <option key={r}>{r}</option>)}</optgroup>
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
              <input style={{ ...S.input, flex: 1, border: "1.5px solid #1E3A5F" }} type="range" min="0" max="10" value={form.painLevel}
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
              <input style={{ ...S.input, flex: 1, border: "1.5px solid #1E3A5F" }} type="range" min="0" max="5" value={form.lamenessGrade}
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
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #1E3A5F" }} value={form.mobilityLevel} onChange={e => setField("mobilityLevel", e.target.value)}>
              <option value="Non-ambulatory">Non-ambulatory (0 — no voluntary movement)</option>
              <option value="Limited">Limited (1 — assisted standing/stepping)</option>
              <option value="Moderate">Moderate (2 — ambulatory with deficits)</option>
              <option value="Good">Good (3 — ambulatory, mild impairment)</option>
              <option value="Full">Full (4 — normal gait, conditioning focus)</option>
            </select>
          </div>
        </div>

        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Surgery / Injury Date</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} type="date" value={form.surgeryDate} onChange={e => setField("surgeryDate", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Medical History / Notes</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.medicalHistory} onChange={e => setField("medicalHistory", e.target.value)}
              placeholder="Prior surgeries, chronic conditions, behavioral notes" />
          </div>
        </div>
      </div>

      {/* ═══════════ DIAGNOSTICS PERFORMED ═══════════ */}
      <div style={{ background: "#EFF6FF", border: "2px solid #1E3A5F", borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <SectionHead icon={FiClipboard} title="Diagnostics Performed" />

        {/* Imaging */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid #1E3A5F40" }}>
            Imaging Studies
          </div>
          <div style={S.grid(2)}>
            {[
              { key: "diagRadiographs", label: "Radiographs (X-Rays)" },
              { key: "diagCT", label: "CT Scan (Computed Tomography)" },
              { key: "diagMRI", label: "MRI (Magnetic Resonance Imaging)" },
              { key: "diagUltrasound", label: "Ultrasound / Musculoskeletal US" },
            ].map(d => (
              <div key={d.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", background: form[d.key] ? "#ECFDF5" : "#fff", border: "1.5px solid #1E3A5F", borderRadius: 8 }}>
                <input type="checkbox" checked={form[d.key]} onChange={e => setField(d.key, e.target.checked)}
                  style={{ marginTop: 3, accentColor: "#1E3A5F", width: 16, height: 16, cursor: "pointer" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>{d.label}</div>
                  {form[d.key] && (
                    <input style={{ ...S.input, border: "1px solid #1E3A5F80", marginTop: 6, fontSize: 11, padding: "6px 8px" }}
                      value={form[d.key + "Notes"]} onChange={e => setField(d.key + "Notes", e.target.value)}
                      placeholder="Findings / Results / Date performed" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Laboratory */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid #1E3A5F40" }}>
            Laboratory Work
          </div>
          <div style={S.grid(2)}>
            {[
              { key: "diagCBC", label: "CBC (Complete Blood Count)" },
              { key: "diagChemPanel", label: "Chemistry Panel / Metabolic" },
              { key: "diagUrinalysis", label: "Urinalysis" },
              { key: "diagThyroid", label: "Thyroid Panel (T4 / TSH)" },
              { key: "diagCRP", label: "C-Reactive Protein (CRP)" },
              { key: "diagSynovial", label: "Synovial Fluid Analysis" },
            ].map(d => (
              <div key={d.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", background: form[d.key] ? "#ECFDF5" : "#fff", border: "1.5px solid #1E3A5F", borderRadius: 8 }}>
                <input type="checkbox" checked={form[d.key]} onChange={e => setField(d.key, e.target.checked)}
                  style={{ marginTop: 3, accentColor: "#1E3A5F", width: 16, height: 16, cursor: "pointer" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>{d.label}</div>
                  {form[d.key] && (
                    <input style={{ ...S.input, border: "1px solid #1E3A5F80", marginTop: 6, fontSize: 11, padding: "6px 8px" }}
                      value={form[d.key + "Notes"]} onChange={e => setField(d.key + "Notes", e.target.value)}
                      placeholder="Findings / Results / Date performed" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specialized / Procedural */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid #1E3A5F40" }}>
            Specialized / Procedural Diagnostics
          </div>
          <div style={S.grid(2)}>
            {[
              { key: "diagEMG", label: "EMG / Nerve Conduction Study" },
              { key: "diagArthroscopy", label: "Arthroscopy" },
              { key: "diagGaitAnalysis", label: "Gait Analysis" },
              { key: "diagForcePlate", label: "Force Plate Analysis" },
              { key: "diagROM", label: "Range of Motion (Goniometry)" },
              { key: "diagOtherDiag", label: "Other Diagnostic" },
            ].map(d => (
              <div key={d.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", background: form[d.key] ? "#ECFDF5" : "#fff", border: "1.5px solid #1E3A5F", borderRadius: 8 }}>
                <input type="checkbox" checked={form[d.key]} onChange={e => setField(d.key, e.target.checked)}
                  style={{ marginTop: 3, accentColor: "#1E3A5F", width: 16, height: 16, cursor: "pointer" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>{d.label}</div>
                  {form[d.key] && (
                    <input style={{ ...S.input, border: "1px solid #1E3A5F80", marginTop: 6, fontSize: 11, padding: "6px 8px" }}
                      value={form[d.key === "diagOtherDiag" ? "diagOtherNotes" : d.key + "Notes"]}
                      onChange={e => setField(d.key === "diagOtherDiag" ? "diagOtherNotes" : d.key + "Notes", e.target.value)}
                      placeholder={d.key === "diagOtherDiag" ? "Specify diagnostic and findings" : "Findings / Results / Date performed"} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button style={S.btn("ghost")} onClick={() => goToStep(1)}>
          ← Back to Patient Info
        </button>
        <button
          style={{
            background: "#1E5A8A", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: "0 0 12px rgba(30,90,138,0.3), 0 0 24px rgba(30,90,138,0.1)",
          }}
          onClick={() => goToStep(3)}
        >
          Next: Protocol Parameters <FiChevronRight size={16} />
        </button>
      </div>

      </>)}

      {/* ═══════════ STEP 3: PROTOCOL PARAMETERS ═══════════ */}
      {!protocol && wizardStep === 3 && (<>

      {/* ═══════════ SECTION 4: PROTOCOL PARAMETERS ═══════════ */}
      <div style={{ background: "#EFF6FF", border: "2px solid #1E3A5F", borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <SectionHead icon={FiCalendar} title="Section 4 — Protocol Parameters" />
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Protocol Duration</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #1E3A5F" }} value={form.protocolLength} onChange={e => setField("protocolLength", e.target.value)}>
              <option value="6">6 weeks — Accelerated (mild conditions)</option>
              <option value="8">8 weeks — Standard post-surgical</option>
              <option value="10">10 weeks — Extended recovery</option>
              <option value="12">12 weeks — Complex / multi-joint</option>
              <option value="16">16 weeks — Conservative management / neuro</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Special Instructions</label>
            <input style={{ ...S.input, border: "1.5px solid #1E3A5F" }} value={form.specialInstructions} onChange={e => setField("specialInstructions", e.target.value)}
              placeholder="e.g. Fearful of water, aggressive with handling" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              style={{
                ...S.btn("primary"), padding: "14px 28px", fontSize: 14, fontWeight: 700, width: "100%", justifyContent: "center",
                boxShadow: "0 0 16px rgba(14,165,233,0.4), 0 0 32px rgba(14,165,233,0.15)",
              }}
              onClick={generate} disabled={loading}
            >
              <FiActivity size={15} />
              {loading ? "Generating Protocol..." : "Generate Exercise Protocol"}
            </button>
          </div>
        </div>
      </div>

      {/* Step 3 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button style={S.btn("ghost")} onClick={() => goToStep(2)}>
          ← Back to Assessment
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
      {protocol && (
        <div>
          {/* Protocol header — clinical document style */}
          <div style={{ ...S.card, borderTop: `3px solid ${C.teal}`, background: `linear-gradient(135deg, ${C.surface} 0%, ${C.tealLight}22 100%)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>
                  Generated Rehabilitation Protocol
                </div>
                <h2 style={{ margin: "0 0 6px", color: C.navy, fontSize: 22, fontWeight: 800 }}>
                  {protocol.patient_name}
                </h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={S.badge("blue")}>{protocol.condition}</span>
                  <span style={S.badge("green")}>{protocol.affected_region}</span>
                  <span style={S.badge("blue")}>{protocol.protocol_length_weeks} weeks</span>
                </div>
                <p style={{ margin: "8px 0 0", color: C.textLight, fontSize: 11 }}>
                  Protocol ID: {protocol.patient_id} · Generated {new Date(protocol.generated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {protocol.total_exercises} exercises in library
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.navy }}>{protocol.protocol_length_weeks}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>Week Program</div>
                <button style={{ ...S.btn("primary"), marginTop: 10, fontSize: 11, padding: "6px 16px" }}
                  onClick={() => { setProtocol(null); setWizardStep(1); setError(null); }}>
                  <FiFileText size={12} /> New Protocol
                </button>
              </div>
            </div>
          </div>

          {/* Weekly protocol cards */}
          {(protocol.weeks || []).map((week, weekIdx) => {
            const phaseProgress = week.week_number / protocol.protocol_length_weeks;
            const phaseName = phaseProgress <= 0.25 ? "Acute / Protection" : phaseProgress <= 0.40 ? "Early Mobility" : phaseProgress <= 0.625 ? "Strengthening" : phaseProgress <= 0.875 ? "Balance / Proprioception" : "Return to Function";
            const phaseColor = phaseProgress <= 0.25 ? C.red : phaseProgress <= 0.40 ? C.amber : phaseProgress <= 0.625 ? C.teal : phaseProgress <= 0.875 ? "#6B46C1" : C.green;

            return (
              <div key={week.week_number} style={{ ...S.card, borderLeft: `4px solid ${phaseColor}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.navy }}>
                      Week {week.week_number}
                    </h4>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: phaseColor, background: phaseColor + "14", padding: "2px 8px", borderRadius: 4 }}>
                        {phaseName}
                      </span>
                      <span style={{ fontSize: 10, color: C.textLight }}>
                        {week.exercises.length} exercise{week.exercises.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setAddingToWeek(weekIdx); setShowAddModal(true); }}
                    style={{ ...S.btn("primary"), padding: "6px 14px", fontSize: 11 }}>
                    <span style={{ fontSize: 14 }}>⚕</span> Add Exercise
                  </button>
                </div>

                <div style={S.grid(3)}>
                  {week.exercises.map((ex, exIdx) => (
                    <ProtocolExCard
                      key={exIdx}
                      entry={{ exercise: ex, sets: ex.sets, reps: ex.reps, frequency_per_day: ex.frequency, duration_seconds: ex.duration_minutes ? ex.duration_minutes * 60 : null, notes: ex.notes }}
                      onRemove={() => removeExercise(weekIdx, exIdx)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
function ExerciseCard({ e }) {
  const [open, setOpen] = useState(false);
  const diffColor = e.difficulty_level === "Easy" ? "green" : e.difficulty_level === "Advanced" ? "orange" : "blue";

  return (
    <div style={{
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
// EXERCISE LIBRARY VIEW
// ─────────────────────────────────────────────
function ExercisesView() {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterDiff, setFilterDiff] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});

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

  const isSearching = search || filterCat || filterDiff;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ ...S.card, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <FiSearch size={14} style={{ position: "absolute", left: 10, top: 10, color: "#A0AEC0" }} />
          <input style={{ ...S.input, paddingLeft: 32 }} placeholder="Search exercises by name or description…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={S.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={S.select} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
          <option value="">All Levels</option>
          {["Easy","Moderate","Advanced"].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span style={{ fontSize: 13, color: "#A0AEC0", whiteSpace: "nowrap" }}>
          {filtered.length} / {exercises.length}
        </span>
      </div>

      {/* Stats strip */}
      {!isSearching && exercises.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {["Easy","Moderate","Advanced"].map(d => {
            const count = exercises.filter(e => e.difficulty_level === d).length;
            const color = d === "Easy" ? "green" : d === "Advanced" ? "orange" : "blue";
            return (
              <div key={d} style={{ ...S.card, margin: 0, padding: "10px 18px", flex: 1,
                textAlign: "center", minWidth: 80, cursor: "pointer" }}
                onClick={() => setFilterDiff(prev => prev === d ? "" : d)}>
                <div style={{ fontSize: 20, fontWeight: 800, color: S.badge(color).color }}>{count}</div>
                <div style={{ fontSize: 11, color: "#A0AEC0", marginTop: 2 }}>{d}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category sections */}
      {Object.entries(grouped).length === 0 && (
        <div style={{ ...S.card, textAlign: "center", color: "#A0AEC0", padding: 48 }}>
          No exercises match your search
        </div>
      )}

      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, exList]) => {
        const meta = CAT_META[cat] || { color: "#F7FAFC", text: "#4A5568", icon: "📋" };
        const isCollapsed = collapsedCats[cat];

        return (
          <div key={cat} style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 12 }}>
            {/* Category header */}
            <div
              onClick={() => toggleCat(cat)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", background: meta.color, cursor: "pointer",
                borderBottom: isCollapsed ? "none" : `2px solid ${meta.text}22`
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{meta.icon}</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: meta.text }}>{cat}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: meta.text + "99" }}>
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
                <span style={{ color: meta.text, fontSize: 14, fontWeight: 700 }}>
                  {isCollapsed ? "▼" : "▲"}
                </span>
              </div>
            </div>

            {/* Exercise grid */}
            {!isCollapsed && (
              <div style={{ padding: 16 }}>
                <div style={S.grid(3)}>
                  {exList.map(e => <ExerciseCard key={e.code} e={e} />)}
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
// SESSION LOGS VIEW
// ─────────────────────────────────────────────
function SessionsView() {
  const [clients, setClients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState({ client_id: "", exercise_id: "", pain_score: "", notes: "", completed: true });
  const [sessions, setSessions] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`${API}/patients`).then(r => setClients(r.data)).catch(() => {});
    axios.get(`${API}/exercises`).then(r => setExercises(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.client_id) {
      axios.get(`${API}/patients/${form.client_id}/sessions`)
        .then(r => setSessions(r.data)).catch(() => {});
    }
  }, [form.client_id, saved]);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/sessions`, { ...form, pain_score: +form.pain_score });
    setSaved(s => !s);
    setForm(f => ({ ...f, exercise_id: "", pain_score: "", notes: "" }));
  };

  return (
    <div>
      {/* SOAP Note Entry */}
      <div style={S.card}>
        <div style={S.sectionHeader(C.teal)}>
          <FiClipboard size={13} /> New Session — SOAP Note Entry
        </div>
        <form onSubmit={submit}>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Patient</label>
              <select style={{ ...S.select, width: "100%" }} value={form.client_id}
                onChange={e => setForm({ ...form, client_id: e.target.value })} required>
                <option value="">Select patient...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.condition || "N/A"} ({c.client_name || "N/A"})</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Exercise Performed</label>
              <select style={{ ...S.select, width: "100%" }} value={form.exercise_id}
                onChange={e => setForm({ ...form, exercise_id: e.target.value })} required>
                <option value="">Select exercise...</option>
                {exercises.map(ex => <option key={ex.code} value={ex.code}>{ex.name} ({ex.category})</option>)}
              </select>
            </div>
          </div>
          <div style={{ ...S.grid(3), marginTop: 12 }}>
            <div>
              <label style={S.label}>Pain Score (0–10 VAS)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input style={{ ...S.input, flex: 1 }} type="range" min="0" max="10" value={form.pain_score || 0}
                  onChange={e => setForm({ ...form, pain_score: e.target.value })} />
                <span style={{
                  fontSize: 14, fontWeight: 700, minWidth: 38, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                  background: +(form.pain_score||0) <= 3 ? C.greenBg : +(form.pain_score||0) <= 6 ? C.amberBg : C.redBg,
                  color: +(form.pain_score||0) <= 3 ? C.green : +(form.pain_score||0) <= 6 ? C.amber : C.red,
                }}>
                  {form.pain_score || 0}/10
                </span>
              </div>
            </div>
            <div style={{ gridColumn: "2 / 4" }}>
              <label style={S.label}>Objective Notes (O)</label>
              <input style={S.input} value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="ROM measurements, gait observations, weight bearing status, tolerance..." />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" style={S.btn("success")}>
              <FiCheckCircle size={14} /> Save Session Record
            </button>
          </div>
        </form>
      </div>

      {/* Session History */}
      {sessions.length > 0 && (
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Treatment History — {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </div>
          </div>
          <table style={S.table}>
            <thead>
              <tr>{["Exercise", "Pain (VAS)", "Status", "Date", "Clinical Notes"].map(h =>
                <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td style={S.td}><strong style={{ color: C.navy }}>{s.exercises?.name || "—"}</strong></td>
                  <td style={S.td}>
                    {s.pain_score != null ? (
                      <span style={S.badge(s.pain_score <= 3 ? "green" : s.pain_score <= 6 ? "blue" : "orange")}>
                        {s.pain_score}/10
                      </span>
                    ) : "—"}
                  </td>
                  <td style={S.td}>
                    <span style={S.badge(s.completed ? "green" : "orange")}>
                      {s.completed ? "Completed" : "Incomplete"}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontSize: 12, color: C.textMid }}>
                      {new Date(s.performed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </td>
                  <td style={{ ...S.td, color: C.textMid, fontStyle: s.notes ? "normal" : "italic" }}>{s.notes || "No notes recorded"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS VIEW
// ─────────────────────────────────────────────
function SettingsView({ setBrand }) {
  const [form, setForm] = useState({
    clinic_name: "", logo_url: "", primary_color: "#0F4C81",
    secondary_color: "#0EA5E9", contact_email: "", phone: "", address: ""
  });
  const [clinicId, setClinicId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${API}/clinics`).then(r => {
      const clinic = r.data?.[0];
      if (clinic) {
        setClinicId(clinic.id);
        setForm(clinic);
        setBrand(b => ({ ...b, clinicName: clinic.clinic_name, accent: clinic.primary_color }));
      }
    }).catch(() => {});
  }, [setBrand]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (clinicId) {
      await axios.put(`${API}/clinics/${clinicId}`, form);
    } else {
      const { data } = await axios.post(`${API}/clinics`, form);
      setClinicId(data.id);
    }
    setBrand(b => ({ ...b, clinicName: form.clinic_name, accent: form.primary_color }));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <form onSubmit={save}>
        <div style={S.card}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#0F4C81" }}>Clinic Branding</h3>
          <div style={S.grid(2)}>
            {[
              ["clinic_name",   "Clinic Name"],
              ["contact_email", "Contact Email"],
              ["phone",         "Phone"],
              ["address",       "Address"],
              ["logo_url",      "Logo URL"],
            ].map(([key, label]) => (
              <div key={key}>
                <label style={S.label}>{label}</label>
                <input style={S.input} value={form[key] || ""}
                  onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={S.label}>Primary Color</label>
            <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
              {["#0F4C81", "#0EA5E9", "#10B981", "#7C3AED", "#DC2626"].map(color => (
                <div key={color} onClick={() => setForm({ ...form, primary_color: color })}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: color, cursor: "pointer",
                    border: form.primary_color === color ? "3px solid #1A202C" : "3px solid transparent",
                    transition: "border 0.15s"
                  }} />
              ))}
              <input type="color" value={form.primary_color}
                onChange={e => setForm({ ...form, primary_color: e.target.value })}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0",
                  padding: 0, cursor: "pointer" }} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={S.label}>Secondary Color</label>
            <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
              {["#0EA5E9", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"].map(color => (
                <div key={color} onClick={() => setForm({ ...form, secondary_color: color })}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: color, cursor: "pointer",
                    border: form.secondary_color === color ? "3px solid #1A202C" : "3px solid transparent",
                    transition: "border 0.15s"
                  }} />
              ))}
              <input type="color" value={form.secondary_color}
                onChange={e => setForm({ ...form, secondary_color: e.target.value })}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0",
                  padding: 0, cursor: "pointer" }} />
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <button type="submit" style={S.btn("dark")} disabled={saving}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
            {saved && (
              <span style={{ fontSize: 13, color: "#276749", fontWeight: 600 }}>
                ✓ Saved successfully
              </span>
            )}
          </div>
        </div>
      </form>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#0F4C81" }}>API Configuration</h3>
        <div>
          <label style={S.label}>Backend API URL</label>
          <input style={S.input} value={API} readOnly />
        </div>
        <div style={{ marginTop: 16, padding: "12px 16px", background: "#F0FFF4",
          borderRadius: 8, fontSize: 13, color: "#276749" }}>
          ✓ Connected to K9 Rehab API
        </div>
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
function WelcomeView({ onEnter }) {
  const [hovering, setHovering] = React.useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "#030c18",
    }}>
      {/* ── BACKGROUND IMAGE — isolated in its own div so filter ONLY hits the image ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/welcome-platform.png')",
        backgroundSize: "contain", backgroundPosition: "center center", backgroundRepeat: "no-repeat",
        filter: "contrast(1.55) brightness(1.28) saturate(1.9)",
      }} />

      {/* Teal screen-blend boost — amplifies the cyan laser arms and HUD panels */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 52%, rgba(0,210,255,0.10) 0%, transparent 68%)",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }} />

      {/* Subtle edge vignette — keeps corners from blowing out, center stays fully open */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.38) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── TOP HEADER ── K9 Rehab Pro + bubble centered at top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 3,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 28,
      }}>
        {/* Brand title — futuristic Exo 2 font, reduced size */}
        <h1 style={{
          fontFamily: "'Exo 2', 'Orbitron', 'Segoe UI', sans-serif",
          fontSize: 38, fontWeight: 900, margin: "0 0 12px",
          color: "#fff", letterSpacing: "4px", lineHeight: 1,
          textTransform: "uppercase",
          textShadow:
            "0 0 20px rgba(14,165,233,0.8), " +
            "0 0 40px rgba(14,165,233,0.4), " +
            "0 2px 0 rgba(0,80,140,0.9), " +
            "0 4px 8px rgba(0,0,0,0.6)",
        }}>
          K9 Rehab Pro&#8482;
        </h1>

        {/* Teal bubble with veterinary caduceus */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(14,165,233,0.14)",
          border: "1px solid rgba(14,165,233,0.45)",
          borderRadius: 40, padding: "7px 22px",
          backdropFilter: "blur(10px)",
          color: "#0EA5E9", fontSize: 12, fontWeight: 700,
          letterSpacing: "1.4px", textTransform: "uppercase",
        }}>
          {/* Rod of Asclepius — veterinary symbol, CSS 3D depth */}
          <span style={{
            fontSize: 18, lineHeight: 1, display: "inline-block",
            color: "#38BDF8",
            textShadow:
              "0 1px 0 #0c8ac0, " +
              "0 2px 0 #0a7aad, " +
              "0 3px 0 #085e8a, " +
              "0 4px 6px rgba(0,0,0,0.5), " +
              "0 0 12px rgba(56,189,248,0.8)",
            filter: "drop-shadow(0 0 6px rgba(14,165,233,0.9))",
          }}>⚕</span>
          Evidence-Based Canine Exercise Protocols
        </div>
      </div>

      {/* All welcome-screen keyframes */}
      <style>{`
        /* ── Button pulse glow ── */
        @keyframes welcomePulse {
          0%, 100% {
            box-shadow: 0 0 14px rgba(14,165,233,0.45), 0 0 28px rgba(14,165,233,0.2), inset 0 0 12px rgba(14,165,233,0.08);
          }
          50% {
            box-shadow: 0 0 28px rgba(14,165,233,0.75), 0 0 56px rgba(14,165,233,0.35), 0 0 80px rgba(14,165,233,0.15), inset 0 0 20px rgba(14,165,233,0.12);
          }
        }
        .welcome-enter-btn {
          animation: welcomePulse 2.4s ease-in-out infinite;
        }
        .welcome-enter-btn:hover {
          animation: none !important;
          box-shadow: 0 0 40px rgba(14,165,233,0.8), 0 0 70px rgba(14,165,233,0.4) !important;
        }

        /* ── Electric scan lines ── */
        @keyframes sweepDown1 {
          0%   { transform: translateY(-4px); opacity: 0; }
          4%   { opacity: 0.85; }
          96%  { opacity: 0.65; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes sweepDown2 {
          0%   { transform: translateY(-4px); opacity: 0; }
          4%   { opacity: 0.4; }
          96%  { opacity: 0.28; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes sweepDown3 {
          0%   { transform: translateY(-4px); opacity: 0; }
          4%   { opacity: 0.55; }
          96%  { opacity: 0.4; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes sweepRight1 {
          0%   { transform: translateX(-4px); opacity: 0; }
          4%   { opacity: 0.6; }
          96%  { opacity: 0.45; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        @keyframes sweepRight2 {
          0%   { transform: translateX(-4px); opacity: 0; }
          4%   { opacity: 0.3; }
          96%  { opacity: 0.2; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        @keyframes boltFlash {
          0%, 80%, 100% { opacity: 0; }
          82% { opacity: 0.55; }
          84% { opacity: 0.05; }
          86% { opacity: 0.45; }
          88% { opacity: 0; }
        }
      `}</style>

      {/* ── Electric pulse overlay — pointer-events none so it never blocks clicks ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, overflow: "hidden", pointerEvents: "none" }}>

        {/* Scan line 1 — sharp bright, fast (3.2s) */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right, transparent 0%, rgba(14,165,233,0.0) 5%, rgba(14,165,233,0.7) 35%, rgba(96,220,255,0.95) 50%, rgba(14,165,233,0.7) 65%, rgba(14,165,233,0.0) 95%, transparent 100%)",
          boxShadow: "0 0 6px 1px rgba(14,165,233,0.55)",
          animation: "sweepDown1 3.2s linear infinite",
          animationDelay: "0s",
        }} />

        {/* Scan line 2 — dimmer, slower (6.8s) */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right, transparent 0%, rgba(56,189,248,0.0) 10%, rgba(56,189,248,0.45) 40%, rgba(56,189,248,0.6) 50%, rgba(56,189,248,0.45) 60%, rgba(56,189,248,0.0) 90%, transparent 100%)",
          animation: "sweepDown2 6.8s linear infinite",
          animationDelay: "1.9s",
        }} />

        {/* Scan line 3 — medium, medium-speed (5.1s) */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(to right, transparent 0%, rgba(14,165,233,0.0) 15%, rgba(14,165,233,0.5) 45%, rgba(14,165,233,0.65) 50%, rgba(14,165,233,0.5) 55%, rgba(14,165,233,0.0) 85%, transparent 100%)",
          boxShadow: "0 0 10px 2px rgba(14,165,233,0.25)",
          animation: "sweepDown3 5.1s linear infinite",
          animationDelay: "4.3s",
        }} />

        {/* Vertical sweep 1 — left to right, slow (7.5s) */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 1,
          background: "linear-gradient(to bottom, transparent 0%, rgba(14,165,233,0.0) 8%, rgba(14,165,233,0.55) 35%, rgba(96,220,255,0.8) 50%, rgba(14,165,233,0.55) 65%, rgba(14,165,233,0.0) 92%, transparent 100%)",
          boxShadow: "0 0 6px 1px rgba(14,165,233,0.4)",
          animation: "sweepRight1 7.5s linear infinite",
          animationDelay: "2.6s",
        }} />

        {/* Vertical sweep 2 — dim, faster (4.4s) */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 1,
          background: "linear-gradient(to bottom, transparent 0%, rgba(56,189,248,0.0) 15%, rgba(56,189,248,0.35) 40%, rgba(56,189,248,0.5) 50%, rgba(56,189,248,0.35) 60%, rgba(56,189,248,0.0) 85%, transparent 100%)",
          animation: "sweepRight2 4.4s linear infinite",
          animationDelay: "0.7s",
        }} />

        {/* Edge bolt flash — brief crackle every ~5s */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 50% 55%, rgba(14,165,233,0.06) 0%, transparent 70%)",
          animation: "boltFlash 5.3s ease-in-out infinite",
          animationDelay: "1.1s",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 50% 55%, rgba(96,220,255,0.05) 0%, transparent 65%)",
          animation: "boltFlash 7.2s ease-in-out infinite",
          animationDelay: "3.5s",
        }} />
      </div>

      {/* ── BOTTOM RIGHT ── Enter Platform button — bubble style */}
      <div style={{
        position: "absolute", bottom: 48, right: 52, zIndex: 3,
      }}>
        <button
          className="welcome-enter-btn"
          onClick={onEnter}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            fontFamily: "'Exo 2', sans-serif",
            display: "inline-flex", alignItems: "center", gap: 10,
            background: hovering
              ? "rgba(14,165,233,0.28)"
              : "rgba(14,165,233,0.14)",
            border: "1px solid rgba(14,165,233,0.55)",
            borderRadius: 40,
            backdropFilter: "blur(12px)",
            color: "#0EA5E9", fontSize: 13, fontWeight: 700,
            padding: "10px 28px",
            cursor: "pointer",
            letterSpacing: "1.6px", textTransform: "uppercase",
            transition: "background 0.22s, transform 0.22s",
            transform: hovering ? "translateY(-2px)" : "none",
          }}
        >
          <span style={{
            fontSize: 16, lineHeight: 1,
            textShadow:
              "0 1px 0 #0c8ac0, 0 2px 0 #0a7aad, " +
              "0 3px 4px rgba(0,0,0,0.4), 0 0 10px rgba(56,189,248,0.8)",
            filter: "drop-shadow(0 0 4px rgba(14,165,233,0.9))",
          }}>⚕</span>
          Enter Platform →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TOP NAVIGATION
// ─────────────────────────────────────────────
const NAV = [
  { id: "generator", label: "Protocol Generator", icon: FiFileText,   desc: "Clinical intake & protocol" },
  { id: "clients",   label: "Patient Records",    icon: FiUsers,      desc: "Patient database" },
  { id: "exercises", label: "Exercise Library",    icon: FiBookOpen,   desc: "195 evidence-based exercises" },
  { id: "sessions",  label: "Session SOAP Notes",  icon: FiClipboard, desc: "Treatment documentation" },
  { id: "settings",  label: "Clinic Settings",    icon: FiSettings,   desc: "Configuration" },
];

const PAGE_TITLES = {
  generator: { title: "K9 Exercise Protocols", sub: "Evidence-Based Vet-Recommended Exercise Protocols" },
  clients:   { title: "Patient Records",                    sub: "Canine rehabilitation patient database and medical histories" },
  exercises: { title: "Exercise Library",                   sub: "195 peer-reviewed therapeutic exercises with clinical parameters" },
  sessions:  { title: "Session SOAP Notes",                 sub: "Subjective, Objective, Assessment, Plan — treatment documentation" },
  settings:  { title: "Clinic Configuration",               sub: "Practice branding, contact information, and platform settings" },
};

function TopNav({ view, setView, brand }) {
  return (
    <div style={S.topNav}>
      <div style={S.topNavBrand}>
        <img src="/favicon.png" alt="K9 Rehab Pro"
          style={{ width: 32, height: 32, filter: "drop-shadow(0 0 6px rgba(14,165,233,0.6))" }} />
        <span>{brand.clinicName || "K9 Rehab Pro\u2122"}</span>
      </div>
      <div style={S.topNavLinks}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <div key={id} style={S.topNavItem(view === id)} onClick={() => setView(id)}>
            <Icon size={13} /> <span>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
          onClick={() => setView("welcome")}>
          <FiStar size={11} style={{ marginRight: 4 }} /> Preview
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
  const [brand, setBrand] = useState({ clinicName: "K9 Rehab Pro™", accent: "#0F4C81" });

  const views = {
    clients:   <ClientsView />,
    generator: <GeneratorView />,
    exercises: <ExercisesView />,
    sessions:  <SessionsView />,
    settings:  <SettingsView brand={brand} setBrand={setBrand} />,
  };

  if (view === "welcome") {
    return <WelcomeView onEnter={() => setView("generator")} />;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={S.app}>
      {/* TOP NAV — replaces sidebar */}
      <TopNav view={view} setView={setView} brand={brand} />

      {/* MAIN */}
      <div style={S.main}>
        {/* Top bar — clinical header */}
        <div style={S.topbar}>
          <div>
            <h1 style={S.pageTitle}>{PAGE_TITLES[view]?.title}</h1>
            <p style={{ ...S.pageSub, margin: 0 }}>{PAGE_TITLES[view]?.sub}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500 }}>{dateStr}</div>
            <div style={{ fontSize: 10, color: C.teal, fontWeight: 600, marginTop: 2 }}>
              <FiHeart size={9} style={{ marginRight: 3 }} />
              Clinical Session Active
            </div>
          </div>
        </div>

        <div style={S.content} data-content-scroll>
          {views[view]}
        </div>
      </div>
    </div>
  );
}
