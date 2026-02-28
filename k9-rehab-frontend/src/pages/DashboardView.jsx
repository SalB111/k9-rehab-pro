import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiFileText, FiCheckCircle,
  FiBookOpen, FiClipboard, FiActivity
} from "react-icons/fi";
import { TbDog } from "react-icons/tb";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";
import ClinicalFooter from "../components/ClinicalFooter";

// Neon flatline divider — shared across all pages
const NeonLine = () => (
  <div style={{ height: 3, width: "100%", overflow: "hidden", borderRadius: 2 }}>
    <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
  </div>
);

// ─────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────
export default function DashboardView({ setView }) {
  const [patients, setPatients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(false);

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
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.teal }}>Loading dashboard...</span>
      </div>
    );
  }

  const PROTOCOLS = [
    { name: "TPLO Post-Surgical", phases: 4, weeks: "16 wk", color: C.red },
    { name: "IVDD Neuro Recovery", phases: 4, weeks: "12 wk", color: "#7C3AED" },
    { name: "OA Multimodal", phases: 4, weeks: "16 wk", color: C.teal },
    { name: "Geriatric Mobility", phases: 4, weeks: "16 wk", color: C.amber },
  ];

  const STATS = [
    { label: "Active Patients", value: patients.length, img: "/2.png", color: C.teal },
    { label: "Protocols Available", value: "4 \u00d7 4 Phases", icon: FiFileText, color: "#7C3AED" },
    { label: "Exercise Library", value: exercises.length, img: "/Beau.png", color: C.navy },
    { label: "Unique Conditions", value: Object.keys(conditionCounts).length || "\u2014", icon: TbDog, color: C.amber },
  ];

  return (
    <div>
      {/* ── KPI STAT CARDS — white card ── */}
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={S.sectionHeader()}>
            <FiActivity size={13} style={{ color: C.teal }} /> Clinical Overview
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 20px", borderRadius: 8, cursor: "pointer",
              background: "linear-gradient(135deg, #059669, #0EA5E9)", border: "none",
              color: "#fff", fontSize: 11, fontWeight: 700,
              boxShadow: "0 2px 8px rgba(14,165,233,0.3)",
              transition: "all 0.2s",
            }}
            onClick={() => setView("home")}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,165,233,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,165,233,0.3)"; }}>
              <FiActivity size={13} /> Generate Protocol
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 8, cursor: "pointer",
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 11, fontWeight: 700,
              transition: "all 0.15s",
            }}
            onClick={() => setView("exercises")}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
              <FiBookOpen size={13} /> Exercise Library
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 8, cursor: "pointer",
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 11, fontWeight: 700,
              transition: "all 0.15s",
            }}
            onClick={() => setView("sessions")}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
              <FiClipboard size={13} /> SOAP Notes
            </button>
          </div>
        </div>
        <NeonLine />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 14 }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 8,
              background: C.bg, border: `1px solid ${C.border}`,
              borderLeft: `4px solid ${stat.color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.8px" }}>{stat.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.text, marginTop: 4 }}>{stat.value}</div>
                </div>
                <div style={{ width: stat.img ? 50 : 40, height: stat.img ? 50 : 40, borderRadius: 8, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: `1px solid ${C.border}` }}>
                  {stat.img
                    ? <img src={stat.img} alt={stat.label} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />
                    : <stat.icon size={18} style={{ color: stat.color }} />
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>

        {/* LEFT: Recent Patients */}
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px" }}>
            <div style={S.sectionHeader()}>
              <TbDog size={14} style={{ color: C.teal }} /> Recent Patients
            </div>
          </div>
          <NeonLine />
          {patients.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: C.textLight }}>
              <TbDog size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>No patients registered yet</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Patients are created during protocol generation</div>
            </div>
          ) : (
            <div style={{ margin: 0 }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {["Patient", "Breed", "Condition", "Registered"].map(h =>
                    <th key={h} style={S.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 8).map(p => (
                    <tr key={p.id} style={{ transition: "background 0.1s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.bg; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <td style={S.td}>
                        <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>Owner: {p.client_name || "\u2014"}</div>
                      </td>
                      <td style={{ ...S.td, fontSize: 12 }}>{p.breed || "\u2014"}</td>
                      <td style={S.td}>
                        {p.condition ? <span style={S.badge("blue")}>{p.condition}</span> : "\u2014"}
                      </td>
                      <td style={{ ...S.td, fontSize: 11, color: C.textLight }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT: Condition Distribution + Platform Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Condition Distribution */}
          <div style={S.card}>
            <div style={{ marginBottom: 12 }}>
              <div style={S.sectionHeader()}>
                <FiActivity size={13} style={{ color: C.teal }} /> Condition Distribution
              <span style={{
                marginLeft: "auto", fontSize: 9, fontWeight: 700,
                color: C.amber, background: C.amberBg,
                padding: "2px 8px", borderRadius: 8,
                textTransform: "uppercase", letterSpacing: "0.5px",
              }}>Sample Data</span>
              </div>
            </div>
            <NeonLine />
            {conditionEntries.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textLight, textAlign: "center", padding: "16px 0" }}>No patient data yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {conditionEntries.slice(0, 8).map(([cond, count]) => (
                  <div key={cond} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600 }}>{cond}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: Math.max(20, (count / Math.max(...conditionEntries.map(e => e[1]))) * 80), height: 6, borderRadius: 3, background: C.teal }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.text, minWidth: 18, textAlign: "right" }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Status */}
          <div style={S.card}>
            <div style={{ marginBottom: 12 }}>
              <div style={S.sectionHeader()}>
                <FiCheckCircle size={13} style={{ color: C.teal }} /> Platform Status
              </div>
            </div>
            <NeonLine />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {[
                { label: "Backend API", ok: apiOk, detail: apiOk ? "Connected" : "Offline" },
                { label: "Exercise Library", ok: exercises.length > 0, detail: `${exercises.length} active` },
                { label: "Protocol Engine", ok: true, detail: "4 protocols" },
                { label: "Phase System", ok: true, detail: "4 phases each" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: item.ok ? C.green : C.red, display: "flex", alignItems: "center", gap: 4 }}>
                    <FiCheckCircle size={11} /> {item.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PROTOCOL ENGINE ── */}
      <div style={{ ...S.card, padding: 20 }}>
        <div style={S.sectionHeader()}>
          <FiFileText size={13} style={{ color: C.teal }} /> ACVSMR-Aligned Protocol Engine \u2014 4 Evidence-Based Pathways
        </div>
        <div style={{ marginTop: 8, marginBottom: 14 }}>
          <NeonLine />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {PROTOCOLS.map((p, i) => (
            <div key={i} style={{
              padding: "14px 16px", borderRadius: 8, cursor: "pointer",
              background: `${p.color}12`, border: `1.5px solid ${p.color}33`,
              transition: "all 0.2s",
            }}
            onClick={() => setView("generator")}
            onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "88"; e.currentTarget.style.boxShadow = `0 0 12px ${p.color}25`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = p.color + "33"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}66` }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{p.name}</span>
              </div>
              <div style={{ fontSize: 10, color: C.textLight }}>
                {p.phases} Phases \u00b7 {p.weeks} \u00b7 Gated Progression
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CLINICAL STANDARDS FOOTER ── */}
      <ClinicalFooter variant="subtle" />
    </div>
  );
}
