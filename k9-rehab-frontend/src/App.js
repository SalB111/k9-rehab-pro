import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers, FiActivity, FiBookOpen, FiClipboard,
  FiSettings, FiLogOut, FiPlus, FiSearch, FiChevronRight,
  FiX, FiAlertTriangle, FiCheckCircle, FiBook
} from "react-icons/fi";

const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const S = {
  app: {
    display: "flex", height: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#F0F4F8", color: "#1A202C"
  },
  sidebar: {
    width: 240, background: "#0F4C81", display: "flex",
    flexDirection: "column", flexShrink: 0
  },
  brand: {
    padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)"
  },
  brandTitle: {
    color: "#fff", fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.3px"
  },
  brandSub: {
    color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 4, textTransform: "uppercase",
    letterSpacing: "1px"
  },
  nav: { flex: 1, padding: "16px 12px" },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    borderRadius: 8, cursor: "pointer", marginBottom: 2, fontSize: 14, fontWeight: 500,
    color: active ? "#fff" : "rgba(255,255,255,0.6)",
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
    transition: "all 0.15s"
  }),
  navBottom: { padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: {
    background: "#fff", padding: "16px 32px", borderBottom: "1px solid #E2E8F0",
    display: "flex", alignItems: "center", justifyContent: "space-between"
  },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: 0, color: "#0F4C81" },
  pageSub: { fontSize: 13, color: "#718096", marginTop: 2 },
  content: { flex: 1, overflow: "auto", padding: 32 },
  card: {
    background: "#fff", borderRadius: 12, padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: 16
  },
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 18px", borderRadius: 8, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    background: variant === "primary" ? "#0EA5E9" : variant === "dark" ? "#0F4C81" : "#F7FAFC",
    color: variant === "primary" || variant === "dark" ? "#fff" : "#4A5568",
    transition: "opacity 0.15s"
  }),
  badge: (color = "blue") => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11,
    fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px",
    background: color === "blue" ? "#EBF8FF" : color === "green" ? "#F0FFF4" : "#FFFAF0",
    color: color === "blue" ? "#2B6CB0" : color === "green" ? "#276749" : "#C05621"
  }),
  input: {
    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
    border: "1px solid #E2E8F0", outline: "none", boxSizing: "border-box",
    background: "#F7FAFC"
  },
  select: {
    padding: "9px 12px", borderRadius: 8, fontSize: 13,
    border: "1px solid #E2E8F0", outline: "none", background: "#F7FAFC",
    cursor: "pointer"
  },
  grid: (cols = 3) => ({
    display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16
  }),
  label: { fontSize: 12, fontWeight: 600, color: "#718096", textTransform: "uppercase",
    letterSpacing: "0.6px", marginBottom: 6, display: "block" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "10px 14px", background: "#F7FAFC",
    borderBottom: "2px solid #E2E8F0", fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.6px", color: "#718096"
  },
  td: { padding: "12px 14px", borderBottom: "1px solid #F0F4F8", verticalAlign: "top" },
};

// ─────────────────────────────────────────────
// CLIENTS VIEW
// ─────────────────────────────────────────────
function ClientsView() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ owner_name: "", dog_name: "", breed: "", age: "", weight: "", condition: "" });

  useEffect(() => {
    axios.get(`${API}/clients`).then(r => setClients(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/clients`, { ...form, age: +form.age, weight: +form.weight });
    setShowForm(false);
    setForm({ owner_name: "", dog_name: "", breed: "", age: "", weight: "", condition: "" });
    axios.get(`${API}/clients`).then(r => setClients(r.data));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 15, color: "#718096" }}>{clients.length} registered patients</div>
        <button style={S.btn("dark")} onClick={() => setShowForm(!showForm)}>
          <FiPlus size={14} /> New Client
        </button>
      </div>

      {showForm && (
        <div style={S.card}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#0F4C81" }}>Register New Patient</h3>
          <form onSubmit={submit}>
            <div style={S.grid(2)}>
              {[
                ["owner_name", "Owner Name"], ["dog_name", "Dog Name"],
                ["breed", "Breed"], ["condition", "Primary Condition"],
                ["age", "Age (years)"], ["weight", "Weight (lbs)"]
              ].map(([key, label]) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <input style={S.input} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })} required />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button type="submit" style={S.btn("primary")}>Save Patient</button>
              <button type="button" style={S.btn("ghost")} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {["Patient", "Owner", "Breed", "Condition", ""].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#A0AEC0", padding: 40 }}>
                No clients yet — add your first patient above
              </td></tr>
            ) : clients.map(c => (
              <tr key={c.id}>
                <td style={S.td}>
                  <div style={{ fontWeight: 600 }}>{c.dog_name}</div>
                  <div style={{ fontSize: 11, color: "#A0AEC0", marginTop: 2 }}>ID: {c.id?.slice(0, 8)}…</div>
                </td>
                <td style={S.td}>{c.owner_name}</td>
                <td style={S.td}>{c.breed || "—"}</td>
                <td style={S.td}>
                  {c.condition ? <span style={S.badge("blue")}>{c.condition}</span> : "—"}
                </td>
                <td style={S.td}>
                  <FiChevronRight size={16} style={{ color: "#CBD5E0", cursor: "pointer" }} />
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
              {ex.difficulty && (
                <span style={S.badge(ex.difficulty === "Easy" ? "green" : ex.difficulty === "Advanced" ? "orange" : "blue")}>
                  {ex.difficulty}
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
          <EvidenceSection grade={ex.evidence_grade} refs={ex.evidence_refs} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROTOCOL GENERATOR VIEW
// ─────────────────────────────────────────────
function GeneratorView() {
  const [condition, setCondition] = useState("TPLO");
  const [phase, setPhase] = useState("weeks_0_2");
  const [plan, setPlan] = useState(null);
  const [weeks, setWeeks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToWeek, setAddingToWeek] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [exSearch, setExSearch] = useState("");

  const CONDITIONS = [
    { value: "TPLO",             label: "TPLO — Tibial Plateau Leveling Osteotomy" },
    { value: "TTA",              label: "TTA — Tibial Tuberosity Advancement" },
    { value: "FHO",              label: "FHO — Femoral Head Ostectomy" },
    { value: "IVDD",             label: "IVDD — Intervertebral Disc Disease" },
    { value: "HIP_DYSPLASIA",    label: "Hip Dysplasia" },
    { value: "ELBOW_DYSPLASIA",  label: "Elbow Dysplasia" },
  ];
  const PHASES = [
    { value: "weeks_0_2",   label: "Phase 1 — Weeks 0–2  (Protection / Acute)" },
    { value: "weeks_2_6",   label: "Phase 2 — Weeks 2–6  (Early Mobility)" },
    { value: "weeks_6_10",  label: "Phase 3 — Weeks 6–10 (Strengthening)" },
    { value: "weeks_10_16", label: "Phase 4 — Weeks 10–16 (Return to Function)" },
  ];

  useEffect(() => {
    axios.get(`${API}/exercises`).then(r => setAllExercises(r.data)).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true); setError(null); setPlan(null); setWeeks({});
    try {
      const { data } = await axios.post(`${API}/generate-plan`, { condition, phase });
      setPlan(data.plan);
      setWeeks(data.weeks || {});
    } catch (e) {
      setError(e.response?.data?.error || "No protocol found for this combination");
    } finally { setLoading(false); }
  };

  const removeExercise = (weekKey, idx) => {
    setWeeks(prev => ({ ...prev, [weekKey]: prev[weekKey].filter((_, i) => i !== idx) }));
  };

  const addExercise = (weekKey, ex) => {
    setWeeks(prev => ({
      ...prev,
      [weekKey]: [...(prev[weekKey] || []), {
        exercise: ex, sets: 3, reps: 10, frequency_per_day: 2,
        notes: "Added manually by clinician"
      }]
    }));
    setShowAddModal(false);
    setExSearch("");
  };

  const filteredEx = allExercises.filter(e =>
    e.name.toLowerCase().includes(exSearch.toLowerCase()) ||
    e.category?.toLowerCase().includes(exSearch.toLowerCase())
  );

  return (
    <div>
      {/* Generator form */}
      <div style={S.card}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#0F4C81" }}>
          Generate Rehabilitation Protocol
        </h3>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={S.label}>Condition</label>
            <select style={{ ...S.select, width: "100%" }} value={condition} onChange={e => setCondition(e.target.value)}>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={S.label}>Rehabilitation Phase</label>
            <select style={{ ...S.select, width: "100%" }} value={phase} onChange={e => setPhase(e.target.value)}>
              {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <button style={S.btn("dark")} onClick={generate} disabled={loading}>
            <FiActivity size={14} />
            {loading ? "Generating…" : "Generate Plan"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ ...S.card, background: "#FFF5F5", border: "1px solid #FED7D7", color: "#C53030" }}>
          {error}
        </div>
      )}

      {plan && (
        <div>
          {/* Plan header */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", color: "#0F4C81", fontSize: 20 }}>{plan.protocol}</h2>
                <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>{plan.goal}</p>
                {plan.description && (
                  <p style={{ margin: "6px 0 0", color: "#A0AEC0", fontSize: 12 }}>{plan.description}</p>
                )}
              </div>
              <span style={S.badge("green")}>{plan.condition}</span>
            </div>
          </div>

          {/* Weeks */}
          {Object.entries(weeks).map(([weekKey, exercises]) => (
            <div key={weekKey} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F4C81",
                  textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  {weekKey.replace(/_/g, " ")}
                  <span style={{ marginLeft: 8, fontSize: 11, color: "#A0AEC0", fontWeight: 400, textTransform: "none" }}>
                    {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
                  </span>
                </h4>
                <button
                  onClick={() => { setAddingToWeek(weekKey); setShowAddModal(true); }}
                  style={{ ...S.btn("primary"), padding: "6px 12px", fontSize: 12 }}>
                  <FiPlus size={12} /> Add Exercise
                </button>
              </div>

              <div style={S.grid(3)}>
                {exercises.map((ex, i) => (
                  <ProtocolExCard
                    key={i}
                    entry={ex}
                    onRemove={() => removeExercise(weekKey, i)}
                  />
                ))}
              </div>
            </div>
          ))}
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
                Add Exercise to {addingToWeek?.replace(/_/g, " ")}
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
                <div key={ex.id}
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
                    <span style={S.badge(ex.difficulty === "Easy" ? "green" : ex.difficulty === "Advanced" ? "orange" : "blue")}>
                      {ex.difficulty}
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
  const diffColor = e.difficulty === "Easy" ? "green" : e.difficulty === "Advanced" ? "orange" : "blue";

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
          <span style={S.badge(diffColor)}>{e.difficulty}</span>
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
            {e.contraindications?.length > 0 && (
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
            <EvidenceSection grade={e.evidence_grade} refs={e.evidence_refs} />
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
    (!filterDiff || e.difficulty === filterDiff)
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
            const count = exercises.filter(e => e.difficulty === d).length;
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
                    const n = exList.filter(e => e.difficulty === d).length;
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
                  {exList.map(e => <ExerciseCard key={e.id} e={e} />)}
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
    axios.get(`${API}/clients`).then(r => setClients(r.data)).catch(() => {});
    axios.get(`${API}/exercises`).then(r => setExercises(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.client_id) {
      axios.get(`${API}/clients/${form.client_id}/sessions`)
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
      <div style={S.card}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#0F4C81" }}>Log Session</h3>
        <form onSubmit={submit}>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Client</label>
              <select style={{ ...S.select, width: "100%" }} value={form.client_id}
                onChange={e => setForm({ ...form, client_id: e.target.value })} required>
                <option value="">Select patient…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.dog_name} ({c.owner_name})</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Exercise</label>
              <select style={{ ...S.select, width: "100%" }} value={form.exercise_id}
                onChange={e => setForm({ ...form, exercise_id: e.target.value })} required>
                <option value="">Select exercise…</option>
                {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Pain Score (0–10)</label>
              <input style={S.input} type="number" min="0" max="10" value={form.pain_score}
                onChange={e => setForm({ ...form, pain_score: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label style={S.label}>Notes</label>
              <input style={S.input} value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observations…" />
            </div>
          </div>
          <button type="submit" style={{ ...S.btn("primary"), marginTop: 20 }}>
            <FiClipboard size={14} /> Log Session
          </button>
        </form>
      </div>

      {sessions.length > 0 && (
        <div style={S.card}>
          <h4 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0F4C81",
            textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Recent Sessions
          </h4>
          <table style={S.table}>
            <thead>
              <tr>{["Exercise", "Pain Score", "Completed", "Date", "Notes"].map(h =>
                <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td style={S.td}><strong>{s.exercises?.name || "—"}</strong></td>
                  <td style={S.td}>
                    {s.pain_score != null ? (
                      <span style={S.badge(s.pain_score <= 3 ? "green" : s.pain_score <= 6 ? "blue" : "orange")}>
                        {s.pain_score}/10
                      </span>
                    ) : "—"}
                  </td>
                  <td style={S.td}>
                    <span style={S.badge(s.completed ? "green" : "orange")}>
                      {s.completed ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={S.td} >{new Date(s.performed_at).toLocaleDateString()}</td>
                  <td style={{ ...S.td, color: "#718096" }}>{s.notes || "—"}</td>
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
// WELCOME / SPLASH VIEW
// ─────────────────────────────────────────────
function WelcomeView({ onEnter }) {
  const [hovering, setHovering] = React.useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      backgroundImage: "url('/welcome-platform.png')",
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Dark gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(4,18,34,0.55) 45%, rgba(0,0,0,0.82) 100%)"
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: 720 }}>

        {/* Top badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.35)",
          borderRadius: 40, padding: "6px 20px", marginBottom: 32,
          color: "#0EA5E9", fontSize: 12, fontWeight: 700, letterSpacing: "1.2px",
          textTransform: "uppercase"
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0EA5E9",
            boxShadow: "0 0 8px #0EA5E9", display: "inline-block" }} />
          Evidence-Based Canine Rehabilitation
        </div>

        {/* Main title */}
        <h1 style={{
          fontSize: 62, fontWeight: 900, margin: "0 0 8px",
          color: "#fff", letterSpacing: "-1px", lineHeight: 1.05,
          textShadow: "0 2px 40px rgba(14,165,233,0.4)"
        }}>
          K9 Rehab Pro
        </h1>
        <p style={{
          fontSize: 18, color: "#94C8E8", fontWeight: 400,
          margin: "0 0 48px", letterSpacing: "0.3px"
        }}>
          Clinical Rehabilitation Platform for Veterinary Professionals
        </p>

        {/* Stats row */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 0,
          marginBottom: 56, borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(14,165,233,0.2)",
          background: "rgba(4,18,34,0.7)", backdropFilter: "blur(12px)"
        }}>
          {[
            { val: "195", label: "Exercises" },
            { val: "30+", label: "Peer-Reviewed Citations" },
            { val: "6",   label: "Condition Protocols" },
            { val: "A",   label: "Grade Evidence" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "20px 16px", borderRight: i < 3 ? "1px solid rgba(14,165,233,0.15)" : "none",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0EA5E9",
                textShadow: "0 0 20px rgba(14,165,233,0.5)", lineHeight: 1 }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, color: "#7FB3CC", marginTop: 5,
                textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            background: hovering
              ? "linear-gradient(135deg, #0EA5E9 0%, #0F4C81 100%)"
              : "linear-gradient(135deg, #0F4C81 0%, #0c3a63 100%)",
            border: "1px solid rgba(14,165,233,0.5)",
            color: "#fff", fontSize: 16, fontWeight: 700,
            padding: "16px 52px", borderRadius: 10, cursor: "pointer",
            letterSpacing: "0.5px", transition: "all 0.2s",
            boxShadow: hovering
              ? "0 0 40px rgba(14,165,233,0.5), 0 8px 32px rgba(0,0,0,0.4)"
              : "0 0 20px rgba(14,165,233,0.2), 0 4px 16px rgba(0,0,0,0.4)",
            transform: hovering ? "translateY(-2px)" : "none",
          }}
        >
          Enter Platform  →
        </button>

        {/* Bottom line */}
        <p style={{ marginTop: 32, fontSize: 11, color: "#4a7a99", letterSpacing: "0.5px" }}>
          CCRP · CCRT · DVM  ·  Built on Millis &amp; Levine standards
        </p>
      </div>

      {/* Corner scan lines — decorative */}
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
        <div key={i} style={{
          position: "absolute", [v]: 28, [h]: 28,
          width: 40, height: 40,
          borderTop: v === "top" ? "2px solid rgba(14,165,233,0.4)" : "none",
          borderBottom: v === "bottom" ? "2px solid rgba(14,165,233,0.4)" : "none",
          borderLeft: h === "left" ? "2px solid rgba(14,165,233,0.4)" : "none",
          borderRight: h === "right" ? "2px solid rgba(14,165,233,0.4)" : "none",
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR NAV ITEM
// ─────────────────────────────────────────────
const NAV = [
  { id: "clients",   label: "Clients",            icon: FiUsers },
  { id: "generator", label: "Protocol Generator", icon: FiActivity },
  { id: "exercises", label: "Exercise Library",   icon: FiBookOpen },
  { id: "sessions",  label: "Session Logs",       icon: FiClipboard },
  { id: "settings",  label: "Settings",           icon: FiSettings },
];

const PAGE_TITLES = {
  clients:   { title: "Clients",            sub: "Manage patients and their programs" },
  generator: { title: "Protocol Generator", sub: "Generate evidence-based rehab plans" },
  exercises: { title: "Exercise Library",   sub: "Browse and filter all exercises" },
  sessions:  { title: "Session Logs",       sub: "Track and record therapy sessions" },
  settings:  { title: "Settings",           sub: "Clinic branding and configuration" },
};

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("welcome");
  const [brand, setBrand] = useState({ clinicName: "K9 Rehab Pro", accent: "#0F4C81" });

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

  return (
    <div style={S.app}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.brand}>
          <p style={S.brandTitle}>{brand.clinicName || "K9 Rehab Pro"}</p>
          <p style={S.brandSub}>Rehabilitation Platform</p>
        </div>
        <nav style={S.nav}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <div key={id} style={S.navItem(view === id)} onClick={() => setView(id)}>
              <Icon size={16} />
              {label}
            </div>
          ))}
        </nav>
        <div style={S.navBottom}>
          <div style={S.navItem(false)}>
            <FiLogOut size={16} /> Sign Out
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div>
            <h1 style={S.pageTitle}>{PAGE_TITLES[view].title}</h1>
            <p style={{ ...S.pageSub, margin: 0 }}>{PAGE_TITLES[view].sub}</p>
          </div>
        </div>
        <div style={S.content}>
          {views[view]}
        </div>
      </div>
    </div>
  );
}
