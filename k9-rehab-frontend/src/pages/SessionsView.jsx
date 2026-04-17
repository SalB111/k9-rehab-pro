import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiClipboard, FiActivity, FiClock, FiCheckCircle, FiBook,
  FiFileText, FiChevronDown, FiChevronUp
} from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";
import { useToast } from "../components/Toast";
import { useTr } from "../i18n/useTr";

// ── Phase names and progression criteria ──
const PHASE_NAMES = [
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Phase 4",
];
const PHASE_CRITERIA = [
  "Pain controlled, incision healing, minimal edema",
  "Weight bearing improving, ROM progressing, pain < 4/10",
  "Full weight bearing, functional strength gains, pain < 2/10",
  "Return to normal activity, maintenance exercises, owner compliance",
];

// ─────────────────────────────────────────────
// SESSIONS VIEW — SOAP + CBPI OUTCOME MEASURES
// ─────────────────────────────────────────────
function SessionsView() {
  const tr = useTr();
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [activeTab, setActiveTab] = useState("soap");
  const toast = useToast();

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

  // Protocol context state
  const [protocols, setProtocols] = useState([]);
  const [protocolExpanded, setProtocolExpanded] = useState(true);

  // Client-side session/CBPI history
  const [soapHistory, setSoapHistory] = useState([]);
  const [cbpiHistory, setCbpiHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API}/patients`).then(r => setPatients(r.data?.data || r.data || [])).catch(() => toast(tr("Failed to load patients"))).finally(() => setLoadingPatients(false));
  }, []);

  // Fetch protocols when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      axios.get(`${API}/patients/${selectedPatient}/protocols`)
        .then(r => setProtocols(r.data || []))
        .catch(() => setProtocols([]));
    } else {
      setProtocols([]);
    }
  }, [selectedPatient]);

  // Calculate current phase from protocol data
  const getCurrentPhase = (protocol) => {
    const pd = protocol.protocol_data;
    if (!pd) return null;
    const totalWeeks = pd.protocol_length_weeks || 16;
    const weeksPerPhase = Math.ceil(totalWeeks / 4);
    const generatedAt = new Date(pd.generated_at || protocol.created_at);
    const daysSince = Math.max(0, (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(totalWeeks, Math.ceil(daysSince / 7) || 1);
    const currentPhase = Math.min(4, Math.ceil(currentWeek / weeksPerPhase));
    return { currentWeek, currentPhase, totalWeeks, weeksPerPhase, generatedAt };
  };

  // Get exercises for a specific week from protocol data
  const getExercisesForWeek = (protocol, weekNum) => {
    const pd = protocol.protocol_data;
    if (!pd?.weeks) return [];
    const week = pd.weeks.find(w => w.week_number === weekNum);
    return week?.exercises || [];
  };

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
      <label style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8, display: "block" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: C.green, fontWeight: 600, minWidth: 48 }}>{tr("No Pain")}</span>
        <div style={{ flex: 1, display: "flex", gap: 3 }}>
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => onChange(n)} type="button" style={{
              flex: 1, height: 34, borderRadius: 5,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: value === n ? (n <= 3 ? C.green : n <= 6 ? C.amber : C.red) : C.bg,
              color: value === n ? "#fff" : C.textLight,
              transition: "all 0.1s",
              border: value === n ? "none" : `1px solid ${C.border}`,
            }}>
              {n}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: C.red, fontWeight: 600, minWidth: 60, textAlign: "right" }}>{tr("Worst")}</span>
      </div>
    </div>
  );

  const tabs = [
    { id: "soap", label: tr("SOAP Notes"), icon: FiClipboard },
    { id: "cbpi", label: tr("CBPI Assessment"), icon: FiActivity },
    { id: "history", label: tr("Session History"), icon: FiClock },
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
            background: activeTab === tab.id ? C.teal : C.surface,
            color: activeTab === tab.id ? "#fff" : C.textMid,
            border: `1px solid ${activeTab === tab.id ? C.teal : C.border}`,
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
      <div style={{ ...S.card, padding: "12px 20px", display: "flex", gap: 12, alignItems: "center", background: C.surface, border: `1.5px solid ${C.border}` }}>
        <label style={{ ...S.label, margin: 0, whiteSpace: "nowrap", color: C.teal }}>{tr("Patient")}</label>
        <select style={{ ...S.select, flex: 1, border: `1.5px solid ${C.border}` }} value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)} disabled={loadingPatients}>
          <option value="">{loadingPatients ? tr("Loading patients...") : tr("--- Select ---")}</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.condition || tr("N/A")} ({p.client_name || tr("N/A")})</option>
          ))}
        </select>
      </div>

      {/* ═══════════ PROTOCOL CONTEXT PANEL ═══════════ */}
      {selectedPatient && protocols.length > 0 && (() => {
        const proto = protocols[0]; // Most recent protocol
        const phase = getCurrentPhase(proto);
        const pd = proto.protocol_data;
        if (!phase || !pd) return null;
        const exercises = getExercisesForWeek(proto, phase.currentWeek);
        const phaseIdx = phase.currentPhase - 1; // 0-based for array access

        return (
          <div style={{
            ...S.card, padding: 0, overflow: "hidden", marginTop: 12,
            background: C.surface,
            border: `1.5px solid ${C.teal}44`,
          }}>
            {/* Header — clickable toggle */}
            <div
              onClick={() => setProtocolExpanded(e => !e)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 20px", cursor: "pointer", userSelect: "none",
                borderBottom: protocolExpanded ? `1px solid ${C.border}` : "none",
              }}
            >
              <FiFileText size={14} style={{ color: C.teal, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {tr("Active Protocol")}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 2 }}>
                  {pd.protocol_name || pd.protocol_type || tr("Rehabilitation Protocol")} — {pd.protocol_length_weeks} {tr("weeks")}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: C.text,
                background: C.tealLight, padding: "3px 10px", borderRadius: 10,
              }}>
                {tr("Week")} {phase.currentWeek} · {tr("Phase")} {phase.currentPhase}
              </span>
              {protocolExpanded ? <FiChevronUp size={14} style={{ color: C.textLight }} /> : <FiChevronDown size={14} style={{ color: C.textLight }} />}
            </div>

            {/* Expanded content */}
            {protocolExpanded && (
              <div style={{ padding: "16px 20px" }}>
                {/* Phase indicator bar */}
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[1, 2, 3, 4].map(p => (
                    <div key={p} style={{
                      flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 6,
                      background: p === phase.currentPhase ? C.tealLight : C.bg,
                      border: p === phase.currentPhase ? `1.5px solid ${C.teal}` : `1px solid ${C.border}`,
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700,
                        color: p === phase.currentPhase ? C.teal : C.textLight,
                      }}>
                        P{p}
                      </div>
                      <div style={{
                        fontSize: 10, color: p === phase.currentPhase ? C.text : C.textLight,
                        marginTop: 2,
                      }}>
                        {tr(PHASE_NAMES[p - 1])}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current phase details */}
                <div style={{
                  padding: "12px 16px", borderRadius: 8, marginBottom: 12,
                  background: "rgba(14,165,233,0.06)", border: `1px solid ${C.teal}22`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 4 }}>
                    {tr("Phase")} {phase.currentPhase}: {tr(PHASE_NAMES[phaseIdx])}
                  </div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>
                    <strong style={{ color: C.text }}>{tr("Progression criteria")}:</strong> {tr(PHASE_CRITERIA[phaseIdx])}
                  </div>
                </div>

                {/* Current week exercises */}
                {exercises.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
                      {tr("Week")} {phase.currentWeek} {tr("Exercises")} ({exercises.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {exercises.map((ex, i) => (
                        <span key={i} style={{
                          fontSize: 10, fontWeight: 600, color: C.text,
                          background: C.bg, padding: "4px 10px",
                          borderRadius: 6, border: `1px solid ${C.border}`,
                        }}>
                          {ex.exercise_name || ex.code || ex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* SOAP integration hints */}
                <div style={{
                  marginTop: 14, padding: "10px 14px", borderRadius: 6,
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${C.green}`,
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <FiClipboard size={12} style={{ color: C.green, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 10, color: C.text, lineHeight: 1.5 }}>
                    <strong style={{ color: C.green }}>{tr("Assessment hint")}:</strong> {tr("Document progress toward Phase")} {phase.currentPhase} {tr("criteria")}.
                    {phase.currentPhase < 4 && (
                      <span> {tr("Next phase")} ({tr(PHASE_NAMES[phase.currentPhase])}) {tr("requires")}: {tr(PHASE_CRITERIA[phase.currentPhase])}.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════ SOAP TAB ═══════════ */}
      {activeTab === "soap" && (
        <div style={{ ...S.card, background: C.surface, border: `2px solid ${C.border}` }}>
          <div>
            <div style={S.sectionHeader()}>
              <FiClipboard size={13} style={{ color: C.teal }} /> {tr("SOAP Note Entry")}
            </div>
            <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
            </div>
          </div>

          {/* S - Subjective */}
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>{tr("S — Subjective (Owner Report)")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
              placeholder={tr("Owner observations: appetite, activity level, willingness to bear weight, behavior changes...")}
              value={soapForm.subjective} onChange={e => setSoapForm(f => ({ ...f, subjective: e.target.value }))} />
          </div>

          {/* O - Objective */}
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>{tr("O — Objective (Clinical Findings)")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
              placeholder={tr("ROM (goniometry), limb circumference, weight bearing status, gait analysis, palpation findings...")}
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
                <label style={S.label}>{tr(label)}</label>
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
            <label style={S.label}>{tr("A — Assessment")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 56, resize: "vertical", fontFamily: "inherit" }}
              placeholder={tr("Clinical assessment: progress toward goals, phase advancement readiness, response to therapy...")}
              value={soapForm.assessment} onChange={e => setSoapForm(f => ({ ...f, assessment: e.target.value }))} />
          </div>

          {/* P - Plan */}
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>{tr("P — Plan")}</label>
            <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 56, resize: "vertical", fontFamily: "inherit" }}
              placeholder={tr("Next session plan, frequency changes, phase progression, HEP modifications, referral needs...")}
              value={soapForm.plan} onChange={e => setSoapForm(f => ({ ...f, plan: e.target.value }))} />
          </div>

          <button style={{ ...S.btn("success"), boxShadow: "0 0 12px rgba(16,185,129,0.3)" }} onClick={() => {
            const patientName = patients.find(p => String(p.id) === selectedPatient)?.name || tr("Unknown");
            setSoapHistory(prev => [{ ...soapForm, id: Date.now(), patientId: selectedPatient, patientName, timestamp: new Date().toISOString() }, ...prev]);
            setSoapForm({ subjective: "", objective: "", assessment: "", plan: "", painPre: 0, painPost: 0, lamenessPre: 0, lamenessPost: 0, sessionDate: new Date().toISOString().split("T")[0] });
          }}>
            <FiCheckCircle size={14} /> {tr("Save Session Record")}
          </button>
        </div>
      )}

      {/* ═══════════ CBPI TAB ═══════════ */}
      {activeTab === "cbpi" && (
        <div>
          {/* Citation Banner */}
          <div style={{ ...S.card, background: "rgba(14,165,233,0.08)", border: `1px solid ${C.teal}33`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
            <FiBook size={13} style={{ color: C.teal, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: C.teal }}>
              <strong>{tr("Canine Brief Pain Inventory (CBPI)")}</strong> — Brown DC, Boston RC, Coyne JC, Farrar JT. 2008. {tr("Development and psychometric testing of an instrument designed to measure chronic pain in dogs with osteoarthritis.")} <em>Am J Vet Res</em> 69:1034-1041.
            </span>
          </div>

          {/* Pain Severity Scale (PSS) — 4 items */}
          <div style={{ ...S.card, background: C.surface, border: `2px solid ${C.border}` }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: "0.8px", paddingBottom: 8 }}>{tr("Pain Severity Scale (PSS)")}</div>
              <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}><div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} /></div>
            </div>
            <ScoreRow label={tr("1. Rate your dog's pain at its WORST in the last 7 days")} value={cbpi.pss_worst} onChange={v => setCbpi(f => ({ ...f, pss_worst: v }))} />
            <ScoreRow label={tr("2. Rate your dog's pain at its LEAST in the last 7 days")} value={cbpi.pss_least} onChange={v => setCbpi(f => ({ ...f, pss_least: v }))} />
            <ScoreRow label={tr("3. Rate your dog's pain on AVERAGE")} value={cbpi.pss_average} onChange={v => setCbpi(f => ({ ...f, pss_average: v }))} />
            <ScoreRow label={tr("4. Rate your dog's pain RIGHT NOW")} value={cbpi.pss_now} onChange={v => setCbpi(f => ({ ...f, pss_now: v }))} />
            <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{tr("PSS Score (Mean of 4 items)")}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(pssScore) }}>{pssScore}/10</span>
            </div>
          </div>

          {/* Pain Interference Scale (PIS) — 6 items */}
          <div style={{ ...S.card, background: C.surface, border: `2px solid ${C.border}` }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: "0.8px", paddingBottom: 8 }}>{tr("Pain Interference Scale (PIS)")}</div>
              <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}><div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} /></div>
            </div>
            <div style={{ fontSize: 10, color: C.text, marginBottom: 14 }}>
              {tr("During the past 7 days, how much has pain interfered with your dog's:")}
            </div>
            <ScoreRow label={tr("1. General activity")} value={cbpi.pis_activity} onChange={v => setCbpi(f => ({ ...f, pis_activity: v }))} />
            <ScoreRow label={tr("2. Enjoyment of life")} value={cbpi.pis_enjoyment} onChange={v => setCbpi(f => ({ ...f, pis_enjoyment: v }))} />
            <ScoreRow label={tr("3. Ability to rise to standing from lying down")} value={cbpi.pis_rising} onChange={v => setCbpi(f => ({ ...f, pis_rising: v }))} />
            <ScoreRow label={tr("4. Ability to walk")} value={cbpi.pis_walking} onChange={v => setCbpi(f => ({ ...f, pis_walking: v }))} />
            <ScoreRow label={tr("5. Ability to run")} value={cbpi.pis_running} onChange={v => setCbpi(f => ({ ...f, pis_running: v }))} />
            <ScoreRow label={tr("6. Ability to climb (stairs, curbs, bed)")} value={cbpi.pis_climbing} onChange={v => setCbpi(f => ({ ...f, pis_climbing: v }))} />
            <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{tr("PIS Score (Mean of 6 items)")}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(pisScore) }}>{pisScore}/10</span>
            </div>
          </div>

          {/* CBPI Summary Card */}
          <div style={{
            ...S.card, padding: "24px 28px",
            border: `1.5px solid ${C.teal}44`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>
              {tr("CBPI Assessment Summary")}
            </div>
            <div style={S.grid(3)}>
              {[
                { label: "Pain Severity (PSS)", value: pssScore },
                { label: "Pain Interference (PIS)", value: pisScore },
                { label: "Combined CBPI", value: combinedScore },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "center", padding: "16px 12px", background: C.bg, borderRadius: 8 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(item.value) }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{tr(item.label)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ ...S.label, color: C.textLight }}>{tr("Assessor Notes")}</label>
              <textarea style={{ ...S.input, border: `1px solid ${C.border}`, minHeight: 48, resize: "vertical", fontFamily: "inherit" }}
                placeholder={tr("Clinical observations during CBPI assessment...")}
                value={cbpi.notes} onChange={e => setCbpi(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button style={{ ...S.btn("success"), marginTop: 16, width: "100%", justifyContent: "center", boxShadow: "0 0 16px rgba(16,185,129,0.3)" }}
              onClick={() => {
                const patientName = patients.find(p => String(p.id) === selectedPatient)?.name || tr("Unknown");
                setCbpiHistory(prev => [{ ...cbpi, pssScore, pisScore, combinedScore, id: Date.now(), patientId: selectedPatient, patientName, timestamp: new Date().toISOString() }, ...prev]);
                setCbpi({ pss_worst: 0, pss_least: 0, pss_average: 0, pss_now: 0, pis_activity: 0, pis_enjoyment: 0, pis_rising: 0, pis_walking: 0, pis_running: 0, pis_climbing: 0, notes: "" });
              }}>
              <FiCheckCircle size={14} /> {tr("Save CBPI Assessment")}
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
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {tr("CBPI Assessments")} — {cbpiHistory.length} {cbpiHistory.length !== 1 ? tr("records") : tr("record")}
                </div>
              </div>
              <table style={S.table}>
                <thead>
                  <tr>{["Patient", "PSS", "PIS", "Combined", "Date", "Notes"].map(h =>
                    <th key={h} style={S.th}>{tr(h)}</th>)}</tr>
                </thead>
                <tbody>
                  {cbpiHistory.map(r => (
                    <tr key={r.id}>
                      <td style={S.td}><strong style={{ color: C.text }}>{r.patientName}</strong></td>
                      <td style={S.td}><span style={{ ...S.badge("blue"), background: scoreBg(r.pssScore), color: scoreColor(r.pssScore) }}>{r.pssScore}</span></td>
                      <td style={S.td}><span style={{ ...S.badge("blue"), background: scoreBg(r.pisScore), color: scoreColor(r.pisScore) }}>{r.pisScore}</span></td>
                      <td style={S.td}><span style={{ fontWeight: 700, color: scoreColor(r.combinedScore) }}>{r.combinedScore}</span></td>
                      <td style={{ ...S.td, fontSize: 11, color: C.textMid }}>{new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td style={{ ...S.td, fontSize: 11, color: C.textMid }}>{r.notes || "\u2014"}</td>
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
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {tr("Session SOAP Notes")} — {soapHistory.length} {soapHistory.length !== 1 ? tr("records") : tr("record")}
                </div>
              </div>
              <table style={S.table}>
                <thead>
                  <tr>{["Patient", "Pain Pre", "Pain Post", "Lameness Pre", "Lameness Post", "Date"].map(h =>
                    <th key={h} style={S.th}>{tr(h)}</th>)}</tr>
                </thead>
                <tbody>
                  {soapHistory.map(r => (
                    <tr key={r.id}>
                      <td style={S.td}><strong style={{ color: C.text }}>{r.patientName}</strong></td>
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
              <div style={{ fontSize: 14, fontWeight: 600 }}>{tr("No session records yet")}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{tr("Complete a SOAP note or CBPI assessment to see history here")}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SessionsView;
