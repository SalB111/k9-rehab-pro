import React, { useEffect, useState } from "react";
// Auth-aware axios instance — attaches JWT on every request. Previously this
// file imported raw `axios` which bypassed the interceptor, causing the
// Measures-save flow and the B.E.A.U.-sessions-by-patient fetch to 401.
import api from "../api/axios";
import { FiArrowLeft, FiUser, FiMessageSquare, FiActivity, FiSave, FiChevronDown } from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";
import { useToast } from "../components/Toast";
import { useTr } from "../i18n/useTr";

// ─────────────────────────────────────────────
// PATIENT DETAIL VIEW — Overview + B.E.A.U. Sessions
// ─────────────────────────────────────────────
function PatientDetailView({ patient, setView }) {
  const tr = useTr();
  const [activeTab, setActiveTab] = useState("overview");
  const [beauSessions, setBeauSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [measures, setMeasures] = useState({
    rom_joint: patient?.rom_joint || "",
    rom_flexion: patient?.rom_flexion || "",
    rom_extension: patient?.rom_extension || "",
    rom_flexion_contralateral: patient?.rom_flexion_contralateral || "",
    rom_extension_contralateral: patient?.rom_extension_contralateral || "",
    hcpi_score: patient?.hcpi_score || "",
    cbpi_pss: patient?.cbpi_pss || "",
    cbpi_pis: patient?.cbpi_pis || "",
    load_score: patient?.load_score || "",
  });
  const [measuresSaving, setMeasuresSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (activeTab === "beau" && patient?.id) {
      setSessionsLoading(true);
      api.get(`/beau/sessions/patient/${patient.id}`)
        .then(r => setBeauSessions(r.data?.data || []))
        .catch(() => toast(tr("Failed to load B.E.A.U. sessions")))
        .finally(() => setSessionsLoading(false));
    }
  }, [activeTab, patient?.id]);

  if (!patient) return null;

  const saveMeasures = async () => {
    setMeasuresSaving(true);
    try {
      await api.patch(`/patients/${patient.id}/measures`, measures);
      toast(tr("Clinical measures saved — B.E.A.U. will use these on next session"));
    } catch (e) {
      toast(tr("Save failed") + ": " + (e.response?.data?.error || e.message));
    } finally {
      setMeasuresSaving(false);
    }
  };

  const TABS = [
    { id: "overview",  label: tr("Overview"),          icon: <FiUser size={12} /> },
    { id: "measures",  label: tr("Clinical Measures"),  icon: <FiActivity size={12} /> },
    { id: "beau",      label: tr("B.E.A.U. Sessions"),  icon: <FiMessageSquare size={12} /> },
  ];

  return (
    <div>
      {/* Back navigation */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setView("clients")} style={{
          background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center",
          gap: 6, fontSize: 12, color: C.textLight,
        }}>
          <FiArrowLeft size={12} /> {tr("Back to Patients")}
        </button>
      </div>

      {/* Patient header card */}
      <div style={{ ...S.card, marginBottom: 0, padding: "16px 24px", borderRadius: "10px 10px 0 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{patient.name}</div>
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
              {patient.breed || tr("Unknown breed")} &bull; {patient.age ? `${patient.age}${tr("yr")}` : tr("Age unknown")} &bull; {patient.weight ? `${patient.weight}${tr("lbs")}` : tr("Weight unknown")}
              {patient.sex ? ` \u2022 ${tr(patient.sex)}` : ""}
            </div>
            {patient.condition && (
              <span style={{ ...S.badge("blue"), marginTop: 8, display: "inline-block" }}>{patient.condition}</span>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.textLight }}>{tr("Owner")}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{patient.client_name || "\u2014"}</div>
            {patient.client_email && <div style={{ fontSize: 11, color: C.textLight }}>{patient.client_email}</div>}
            {patient.client_phone && <div style={{ fontSize: 11, color: C.textLight }}>{patient.client_phone}</div>}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 16px", borderRadius: 8, cursor: "pointer",
              fontSize: 11, fontWeight: 600, border: "none",
              background: activeTab === tab.id ? C.navy : "transparent",
              color: activeTab === tab.id ? "#fff" : C.textLight,
              transition: "all 0.15s",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ ...S.card, borderRadius: "0 0 10px 10px", borderTop: "none", marginTop: 0 }}>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{tr("Clinical Details")}</div>
              <DetailRow label={tr("Condition")} value={patient.condition} />
              <DetailRow label={tr("Affected Region")} value={patient.affected_region} />
              <DetailRow label={tr("Referring Vet")} value={patient.referring_vet} />
              <DetailRow label={tr("Lameness Grade")} value={patient.lameness_grade != null ? `${patient.lameness_grade}/5` : null} />
              <DetailRow label={tr("Pain Level")} value={patient.pain_level != null ? `${patient.pain_level}/10` : null} />
              <DetailRow label={tr("Mobility Level")} value={patient.mobility_level} />
              <DetailRow label={tr("Body Condition")} value={patient.body_condition_score != null ? `${patient.body_condition_score}/9` : null} />
              <DetailRow label={tr("Surgery Date")} value={patient.surgery_date ? new Date(patient.surgery_date).toLocaleDateString() : null} />
              <DetailRow label={tr("Medications")} value={patient.current_medications} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{tr("Notes & History")}</div>
              {patient.medical_history && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, marginBottom: 4 }}>{tr("Medical History")}</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, background: C.bg, borderRadius: 8, padding: "10px 14px" }}>
                    {patient.medical_history}
                  </div>
                </div>
              )}
              {patient.special_instructions && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, marginBottom: 4 }}>{tr("Special Instructions")}</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, background: C.bg, borderRadius: 8, padding: "10px 14px" }}>
                    {patient.special_instructions}
                  </div>
                </div>
              )}
              {!patient.medical_history && !patient.special_instructions && (
                <div style={{ fontSize: 12, color: C.textLight }}>{tr("No notes or history recorded.")}</div>
              )}
            </div>
          </div>
        )}

        {/* Clinical Measures Tab — ROM + Outcome Scores → feeds directly into B.E.A.U. */}
        {activeTab === "measures" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{tr("Clinical Measures")}</div>
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{tr("These values are injected into every B.E.A.U. session for this patient.")}</div>
              </div>
              <button onClick={saveMeasures} disabled={measuresSaving} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: C.teal, color: "#fff", border: "none",
                padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                fontSize: 12, fontWeight: 700, opacity: measuresSaving ? 0.6 : 1,
              }}>
                <FiSave size={12} /> {measuresSaving ? tr("Saving…") : tr("Save to B.E.A.U.")}
              </button>
            </div>

            {/* ROM Section */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: `1px solid rgba(14,165,233,0.2)` }}>{tr("Goniometry — Range of Motion")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textLight, display: "block", marginBottom: 4 }}>{tr("Joint Measured")}</label>
                <select style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}
                  value={measures.rom_joint} onChange={e => setMeasures(p => ({ ...p, rom_joint: e.target.value }))}>
                  <option value="">{tr("— Select —")}</option>
                  {["Stifle","Hip","Elbow","Shoulder","Hock/Tarsus","Carpus"].map(j => <option key={j} value={j}>{tr(j)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textLight, display: "block", marginBottom: 4 }}>{tr("Affected Flexion (°)")}</label>
                <input type="number" min="0" max="180" placeholder={tr("e.g. 95")} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}
                  value={measures.rom_flexion} onChange={e => setMeasures(p => ({ ...p, rom_flexion: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textLight, display: "block", marginBottom: 4 }}>{tr("Affected Extension (°)")}</label>
                <input type="number" min="0" max="180" placeholder={tr("e.g. 130")} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}
                  value={measures.rom_extension} onChange={e => setMeasures(p => ({ ...p, rom_extension: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textLight, display: "block", marginBottom: 4 }}>
                  {tr("Normal Ref")} ({measures.rom_joint === "Stifle" ? "Flex 42° / Ext 162°" : measures.rom_joint === "Hip" ? "Flex 50° / Ext 162°" : measures.rom_joint === "Elbow" ? "Flex 36° / Ext 165°" : measures.rom_joint === "Shoulder" ? "Flex 57° / Ext 165°" : measures.rom_joint === "Hock/Tarsus" ? "Flex 39° / Ext 164°" : measures.rom_joint === "Carpus" ? "Flex 32° / Ext 196°" : tr("select joint")})
                </label>
                <div style={{ padding: "7px 10px", borderRadius: 6, background: "rgba(14,165,233,0.06)", border: `1px solid rgba(14,165,233,0.15)`, fontSize: 11, color: C.textLight }}>{tr("Millis & Levine standard values")}</div>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textLight, display: "block", marginBottom: 4 }}>{tr("Contralateral Flexion (°)")}</label>
                <input type="number" min="0" max="180" placeholder={tr("e.g. 42")} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}
                  value={measures.rom_flexion_contralateral} onChange={e => setMeasures(p => ({ ...p, rom_flexion_contralateral: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textLight, display: "block", marginBottom: 4 }}>{tr("Contralateral Extension (°)")}</label>
                <input type="number" min="0" max="180" placeholder={tr("e.g. 162")} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}
                  value={measures.rom_extension_contralateral} onChange={e => setMeasures(p => ({ ...p, rom_extension_contralateral: e.target.value }))} />
              </div>
            </div>
            {measures.rom_flexion && measures.rom_flexion_contralateral && (() => {
              const fd = Math.abs(parseFloat(measures.rom_flexion_contralateral) - parseFloat(measures.rom_flexion));
              const ed = measures.rom_extension && measures.rom_extension_contralateral ? Math.abs(parseFloat(measures.rom_extension_contralateral) - parseFloat(measures.rom_extension)) : null;
              const sev = fd > 20 ? "severe" : fd > 10 ? "moderate" : "minimal";
              const col = sev === "severe" ? C.red : sev === "moderate" ? C.amber : C.green;
              const bg  = sev === "severe" ? "rgba(220,38,38,0.1)" : sev === "moderate" ? "rgba(217,119,6,0.1)" : "rgba(16,185,129,0.1)";
              return (
                <div style={{ marginBottom: 16, padding: "8px 14px", borderRadius: 6, background: bg, border: `1px solid ${col}30`, fontSize: 11, fontWeight: 600, color: col }}>
                  {tr("Flexion deficit")}: {fd.toFixed(1)}° ({tr(sev)}){ed != null ? `  |  ${tr("Extension deficit")}: ${ed.toFixed(1)}°` : ""}
                  {sev === "severe" && <div style={{ marginTop: 3, fontWeight: 500, fontSize: 10 }}>{tr("Phase III criteria not met — >20° deficit requires manual therapy focus before progression.")}</div>}
                </div>
              );
            })()}

            {/* Outcome Scores Section */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: `1px solid rgba(14,165,233,0.2)` }}>{tr("Validated Outcome Measures")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { key: "hcpi_score", label: "HCPI Total Score (0–44)", ph: "0–44", ref: "≥12 = chronic pain threshold", max: 44, thresholds: [[12,"Below threshold","green"],[24,"Mild–Moderate","amber"],[44,"Significant pain","red"]] },
                { key: "load_score", label: "LOAD Score (0–52)", ph: "0–52", ref: "0–5 mild · 6–20 moderate · 21–52 severe", max: 52, thresholds: [[5,"Mild OA impact","green"],[20,"Moderate OA","amber"],[52,"Severe OA","red"]] },
                { key: "cbpi_pss", label: "CBPI Pain Severity Score (0–10)", ph: "0.0–10.0", ref: ">2.0 = moderate pain", max: 10, step: 0.1, thresholds: [[2,"Mild/controlled","green"],[5,"Moderate pain","amber"],[10,"Severe pain","red"]] },
                { key: "cbpi_pis", label: "CBPI Pain Interference Score (0–10)", ph: "0.0–10.0", ref: ">1.5 = functional interference", max: 10, step: 0.1, thresholds: [[1.5,"Minimal interference","green"],[4,"Moderate interference","amber"],[10,"Severe interference","red"]] },
              ].map(({ key, label, ph, ref, max, step, thresholds }) => {
                const val = parseFloat(measures[key]);
                const tier = !isNaN(val) ? (val <= thresholds[0][0] ? thresholds[0] : val <= thresholds[1][0] ? thresholds[1] : thresholds[2]) : null;
                const colMap = { green: C.green, amber: C.amber, red: C.red };
                const bgMap  = { green: "rgba(16,185,129,0.1)", amber: "rgba(217,119,6,0.1)", red: "rgba(220,38,38,0.1)" };
                return (
                  <div key={key}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.textLight, display: "block", marginBottom: 4 }}>{tr(label)}</label>
                    <input type="number" min="0" max={max} step={step || 1} placeholder={ph}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}
                      value={measures[key]} onChange={e => setMeasures(p => ({ ...p, [key]: e.target.value }))} />
                    <div style={{ fontSize: 9, color: C.textLight, marginTop: 2 }}>{tr(ref)}</div>
                    {tier && (
                      <div style={{ marginTop: 5, padding: "5px 10px", borderRadius: 5, background: bgMap[tier[2]], border: `1px solid ${colMap[tier[2]]}30`, fontSize: 10, fontWeight: 600, color: colMap[tier[2]] }}>
                        {measures[key]}/{max} — {tr(tier[1])}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* B.E.A.U. Sessions Tab */}
        {activeTab === "beau" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>
              {tr("B.E.A.U. Consultation History for")} {patient.name}
            </div>
            {sessionsLoading && (
              <div style={{ padding: 24, textAlign: "center", color: C.textLight, fontSize: 12 }}>{tr("Loading sessions...")}</div>
            )}
            {!sessionsLoading && beauSessions.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: C.textLight, fontSize: 12 }}>
                {tr("No B.E.A.U. sessions recorded for this patient yet.")}
              </div>
            )}
            {!sessionsLoading && beauSessions.map(session => {
              const isOpen = expandedSession === session.id;
              return (
                <div key={session.id} style={{ marginBottom: 10, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                  <div
                    onClick={() => setExpandedSession(isOpen ? null : session.id)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 16px", cursor: "pointer",
                      background: isOpen ? `${C.teal}08` : C.bg,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{session.title || tr("Untitled Session")}</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>
                        {session.messages?.length || 0} {tr("messages")} &bull; {session.updated_at ? new Date(session.updated_at).toLocaleDateString() + " " + new Date(session.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </div>
                    <FiChevronDown size={14} style={{
                      color: C.teal, flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }} />
                  </div>
                  {isOpen && (
                    <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, maxHeight: 400, overflowY: "auto" }}>
                      {(session.messages || []).map((msg, i) => (
                        <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                          <div style={{
                            maxWidth: "80%", padding: "8px 14px", borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                            background: msg.role === "user" ? C.navy : C.surface,
                            color: msg.role === "user" ? "#fff" : C.text,
                            border: msg.role === "user" ? "none" : `1px solid ${C.border}`,
                          }}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: C.textLight, minWidth: 110 }}>{label}</span>
      <span style={{ fontSize: 12, color: C.text }}>{value}</span>
    </div>
  );
}

export default PatientDetailView;
