import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers, FiFileText, FiCheckCircle, FiArrowRight,
  FiBookOpen, FiClipboard, FiX
} from "react-icons/fi";
import { TbDog } from "react-icons/tb";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";

// ─────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────
export default function DashboardView({ setView }) {
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
      axios.get(`${API}/patients`).catch(() => ({ data: { data: [] } })),
      axios.get(`${API}/exercises`).catch(() => ({ data: { data: [] } })),
      axios.get(`${API}/health`).then(() => true).catch(() => false),
    ]).then(([pRes, eRes, health]) => {
      setPatients(pRes.data?.data || pRes.data || []);
      setExercises(eRes.data?.data || eRes.data || []);
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
                { label: "Backend API", ok: apiOk, detail: apiOk ? "Connected" : "Offline" },
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
