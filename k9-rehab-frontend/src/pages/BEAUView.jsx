import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import axios from "axios";
import {
  FiActivity, FiAlertTriangle, FiBarChart2, FiBookOpen,
  FiCheckCircle, FiClipboard, FiClock, FiDatabase, FiHeart, FiHome,
  FiSearch, FiSend, FiShield
} from "react-icons/fi";
import C from "../constants/colors";
import { API } from "../api/axios";
import { useToast } from "../components/Toast";
import useBeauVoice from "../hooks/useBeauVoice";
import BeauVoiceControl, { SpeakButton } from "../components/BeauVoiceControl";
import { useTranslation } from "react-i18next";

const DiagramRenderer = lazy(() => import("../components/beau/DiagramRenderer"));
const NarrativePanel = lazy(() => import("../components/beau/NarrativePanel"));
const PresentationView = lazy(() => import("../components/beau/presentation/PresentationView"));
const VisualCardRenderer = lazy(() => import("../components/beau/visual/VisualCardRenderer"));

// ─────────────────────────────────────────────
// BEAU AI VIEW — B.E.A.U. - Biomedical Evidence-based Analytical Unit
// ─────────────────────────────────────────────
function BEAUView({ authToken, setView }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState("");
  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [presentationDeck, setPresentationDeck] = useState(null);
  const [showPatientPanel, setShowPatientPanel] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const { i18n: i18nInst } = useTranslation();
  const beauVoice = useBeauVoice(i18nInst.language || "en");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [intelligence, setIntelligence] = useState(null);
  const endRef = useRef(null);
  const taRef = useRef(null);
  const toast = useToast();

// Load patients + AI status ONLY if authenticated
useEffect(() => {
  if (!authToken) return; // ⛔ Prevents all 4 API calls before login

  axios
    .get(`${API}/patients`)
    .then(r => setPatients(r.data?.data || r.data || []))
    .catch(() => toast("Failed to load patients"));

  axios
    .get(`${API}/beau/status`)
    .then(r => setAiStatus(r.data))
    .catch(() => setAiStatus({ configured: false }));

  axios
    .get(`${API}/beau/sessions`)
    .then(r => setSessionHistory(r.data?.data || []))
    .catch(() => {});

  axios
    .get(`${API}/beau/intelligence`)
    .then(r => setIntelligence(r.data?.data || null))
    .catch(() => {});
}, [authToken]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, stream]);

  const QUICK = [
    { icon: <FiClipboard size={11} />, label: "Protocol", prompt: "Generate a rehabilitation protocol for this patient's current stage." },
    { icon: <FiAlertTriangle size={11} />, label: "Contraindications", prompt: "What exercises are contraindicated for this patient?" },
    { icon: <FiCheckCircle size={11} />, label: "Progress Check", prompt: "Is this patient ready to progress? What gate criteria should I evaluate?" },
    { icon: <FiHome size={11} />, label: "Home Program", prompt: "Design a safe owner-friendly home exercise program for this patient." },
    { icon: <FiBarChart2 size={11} />, label: "Outcomes", prompt: "What outcome measures should I track and what values indicate readiness to progress?" },
    { icon: <FiSearch size={11} />, label: "Alternatives", prompt: "Suggest alternative exercises that work around this patient's limitations." },
  ];

  const STARTERS = [
    { icon: <FiActivity size={11} />, q: "What exercises are safe for early TPLO recovery?" },
    { icon: <FiBookOpen size={11} />, q: "How should I approach IVDD Grade III rehabilitation?" },
    { icon: <FiHeart size={11} />, q: "Design a geriatric mobility program for a 13-year-old Golden with bilateral hip OA." },
    { icon: <FiBarChart2 size={11} />, q: "What outcome measures track CCL conservative management progress?" },
  ];

  // Escape raw HTML to prevent XSS from AI responses
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Markdown renderer (escapes HTML first, then applies formatting)
  const renderMd = (t) => {
    if (!t) return "";
    let h = "", code = false;
    for (const raw of t.split("\n")) {
      if (raw.startsWith("```")) { h += code ? "</pre>" : `<pre style="background:${C.bg};border:1px solid ${C.border};border-radius:8px;padding:12px;margin:8px 0;font-size:12px;overflow-x:auto;color:${C.teal}">`; code = !code; continue; }
      if (code) { h += esc(raw) + "\n"; continue; }
      const ln = esc(raw);
      if (ln.startsWith("### ")) { h += `<h4 style="color:${C.teal};margin:14px 0 4px;font-size:13px;font-weight:700">${ln.slice(4)}</h4>`; continue; }
      if (ln.startsWith("## ")) { h += `<h3 style="color:${C.green};margin:16px 0 6px;font-size:14px;font-weight:700">${ln.slice(3)}</h3>`; continue; }
      if (ln.startsWith("# ")) { h += `<h2 style="color:${C.teal};margin:18px 0 8px;font-size:16px;font-weight:700">${ln.slice(2)}</h2>`; continue; }
      let l = ln.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.text}">$1</strong>`);
      l = l.replace(/\*(.*?)\*/g, `<em style="color:${C.textLight}">$1</em>`);
      l = l.replace(/`([^`]+)`/g, `<code style="background:${C.bg};padding:1px 5px;border-radius:3px;font-size:12px;color:${C.teal}">$1</code>`);
      if (l.match(/^[-\u2022]\s/)) { h += `<div style="margin:3px 0 3px 16px;line-height:1.6">\u2022 ${l.replace(/^[-\u2022]\s/, "")}</div>`; continue; }
      if (l.match(/^\d+\.\s/)) { h += `<div style="margin:3px 0 3px 16px;line-height:1.6">${l}</div>`; continue; }
      if (l.trim()) h += `<p style="margin:5px 0;line-height:1.65">${l}</p>`;
    }
    if (code) h += "</pre>";
    return h;
  };

  const send = async (txt) => {
    const t = txt || input.trim();
    if (!t || loading) return;
    const um = { role: "user", content: t };
    const newMsgs = [...msgs, um];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    setStream("");
    if (taRef.current) taRef.current.style.height = "auto";

    try {
      const res = await fetch(`${API}/beau/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ messages: newMsgs, patient, language: i18nInst.language || "en" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.type === "delta" && d.text) {
                full += d.text;
                setStream(full);
              } else if (d.type === "error") {
                full += `\n\n**Error:** ${d.text}`;
                setStream(full);
              }
            } catch {}
          }
        }
      }
      setStream("");
      const finalMsgs = [...newMsgs, { role: "assistant", content: full }];
      setMsgs(finalMsgs);
      saveSession(finalMsgs);
      // B.E.A.U. voice — auto-speak the response
      if (beauVoice.autoSpeak && full) beauVoice.speak(full);
    } catch (err) {
      setStream("");
      setMsgs(p => [...p, { role: "assistant", content: `**B.E.A.U. is temporarily unavailable.**\n\nPlease check that the server is running. If the issue persists, contact your system administrator.` }]);
      console.error('BEAU connection error:', err);
    }
    setLoading(false);
  };

  const saveSession = async (allMessages) => {
    if (allMessages.length === 0) return;
    try {
      const body = { messages: allMessages, patient_id: patient?.id || null, language: i18nInst.language || "en" };
      if (sessionId) body.session_id = sessionId;
      const r = await fetch(`${API}/beau/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (data?.data?.id && !sessionId) setSessionId(data.data.id);
      axios.get(`${API}/beau/sessions`).then(r => setSessionHistory(r.data?.data || [])).catch(() => {});
    } catch (_) {}
  };

  const loadSession = (session) => {
    setMsgs(session.messages || []);
    setSessionId(session.id);
    setPatient(session.patient_id ? patients.find(p => p.id === session.patient_id) || null : null);
    setSidebarOpen(false);
  };

  const pickPatient = (pt) => {
    setPatient(pt);
    setShowPatientPanel(false);
    setMsgs(p => [...p, { role: "assistant", content: `**Patient Loaded: ${pt.name}**\n\n**Breed:** ${pt.breed || "Unknown"} \u2022 **Age:** ${pt.age || "?"} \u2022 **Weight:** ${pt.weight || "?"}lbs\n**Diagnosis:** ${pt.diagnosis || pt.condition || "Not specified"}\n**Notes:** ${pt.notes || "None"}\n\n---\nAll recommendations now tailored to ${pt.name}. What would you like to evaluate?` }]);
  };

  const welcome = msgs.length === 0;

  // Styles matching the app's design system
  const aiC = {
    bg: C.bg,
    chatBg: C.surface,
    userBubble: `linear-gradient(135deg, ${C.navy}, ${C.navyMid || "#1a3a5c"})`,
    aiBubble: C.bg,
    aiBorder: C.border,
    accent: C.teal,
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "calc(100vh - 90px)", background: aiC.bg, position: "relative" }}>

      {/* Session History Sidebar */}
      <div style={{
        width: sidebarOpen ? 260 : 0, overflow: "hidden", transition: "width 0.25s ease",
        flexShrink: 0, borderRight: sidebarOpen ? `1px solid ${C.border}` : "none",
        background: C.surface, display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, minWidth: 260 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Session History
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", minWidth: 260 }}>
          {sessionHistory.length === 0 && (
            <div style={{ padding: 14, fontSize: 11, color: C.textLight }}>No saved sessions yet.</div>
          )}
          {sessionHistory.map(s => (
            <div key={s.id} onClick={() => loadSession(s)} style={{
              padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}`,
              background: sessionId === s.id ? `${C.teal}10` : "transparent", transition: "background 0.1s",
            }}
              onMouseEnter={e => { if (sessionId !== s.id) e.currentTarget.style.background = C.bg; }}
              onMouseLeave={e => { if (sessionId !== s.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.title || "Untitled"}
              </div>
              <div style={{ fontSize: 10, color: C.teal, marginTop: 2 }}>
                {s.patient_name || "Standalone"}
              </div>
              <div style={{ fontSize: 10, color: C.textLight, marginTop: 1 }}>
                {s.updated_at ? new Date(s.updated_at).toLocaleDateString() + " " + new Date(s.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/rod-logo.png" alt="B.E.A.U." style={{ width: 38, height: 38, borderRadius: 10, objectFit: "contain", filter: "brightness(1.2) drop-shadow(0 0 8px rgba(14,165,233,0.4))" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: 0.5 }}>
              B.E.A.U. <span style={{ color: C.teal, fontSize: 10, fontWeight: 600, background: `${C.teal}15`, padding: "2px 7px", borderRadius: 4, marginLeft: 6 }}>Biomedical Evidence-Based Analytical Unit</span>
            </div>
            <div style={{ fontSize: 10, color: C.textLight, marginTop: 1 }}>Evidence-Based Decision Support • ACVSMR</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {patient && (
            <div onClick={() => setShowPatientPanel(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.teal}10`, border: `1px solid ${C.teal}30`, borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>
              <FiCheckCircle size={11} style={{ color: C.teal }} />
              <span style={{ fontSize: 12, color: C.teal, fontWeight: 600 }}>{patient.name}</span>
            </div>
          )}
          <button onClick={() => setShowPatientPanel(!showPatientPanel)} style={{ background: `${C.navy}08`, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
            {patient ? "Switch Patient" : "Load Patient"}
          </button>
          {intelligence && intelligence.total_cases > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: `${C.green}12`, border: `1px solid ${C.green}30`, borderRadius: 8, padding: "5px 10px" }} title={`Aggregate intelligence from ${intelligence.total_cases} prior sessions`}>
              <FiDatabase size={10} style={{ color: C.green }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: C.green }}>{intelligence.total_cases} Cases</span>
            </div>
          )}
          <button onClick={() => setView?.("about")} style={{ display: "flex", alignItems: "center", gap: 5, background: `${C.teal}10`, border: `1px solid ${C.teal}30`, borderRadius: 8, color: C.teal, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }} title="K9 Rehab Pro Platform">
            <FiBookOpen size={11} /> Platform
          </button>
          <button onClick={() => setView?.("docs")} style={{ display: "flex", alignItems: "center", gap: 5, background: `${C.teal}10`, border: `1px solid ${C.teal}30`, borderRadius: 8, color: C.teal, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }} title="B.E.A.U. Documentation">
            <FiActivity size={11} /> Documentation
          </button>
          <button onClick={() => setView?.("about")} style={{ display: "flex", alignItems: "center", gap: 5, background: `${C.teal}12`, border: `1px solid ${C.teal}40`, borderRadius: 8, color: C.teal, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }} title="About B.E.A.U.">
            <FiShield size={11} /> About B.E.A.U.
          </button>
          <BeauVoiceControl
            isSpeaking={beauVoice.isSpeaking}
            autoSpeak={beauVoice.autoSpeak}
            setAutoSpeak={beauVoice.setAutoSpeak}
            onStop={beauVoice.stop}
            voiceName={beauVoice.voiceName}
            compact
          />
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: sidebarOpen ? `${C.teal}15` : `${C.navy}08`, border: `1px solid ${C.border}`, borderRadius: 8, color: sidebarOpen ? C.teal : C.text, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <FiClock size={11} /> {sidebarOpen ? "Hide" : "History"}
          </button>
          {msgs.length > 0 && (
            <button onClick={() => { setMsgs([]); setStream(""); setPatient(null); setSessionId(null); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textLight, padding: "6px 10px", cursor: "pointer", fontSize: 11 }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Patient Selection Panel */}
      {showPatientPanel && (
        <div style={{ position: "absolute", top: 58, right: 12, zIndex: 100, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, width: 320, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: 0.5 }}>Select Patient</div>
          {patients.length === 0 && <div style={{ fontSize: 12, color: C.textLight, padding: 12 }}>No patients found. Add patients in Patient Records first.</div>}
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {patients.map(pt => (
              <div key={pt.id} onClick={() => pickPatient(pt)} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 4, background: patient?.id === pt.id ? `${C.teal}10` : C.bg, border: patient?.id === pt.id ? `1px solid ${C.teal}40` : "1px solid transparent", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{pt.name}</span>
                  <span style={{ fontSize: 10, color: C.textLight }}>{pt.breed || ""}</span>
                </div>
                <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{pt.species || "Canine"} • {pt.age || "?"} • {pt.weight || "?"}lbs</div>
                {(pt.diagnosis || pt.condition) && <div style={{ fontSize: 10, color: C.teal, marginTop: 2, fontWeight: 500 }}>{pt.diagnosis || pt.condition}</div>}
              </div>
            ))}
          </div>
          <div onClick={() => setShowPatientPanel(false)} style={{ fontSize: 10, color: C.textLight, marginTop: 8, textAlign: "center", cursor: "pointer" }}>Close</div>
        </div>
      )}

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {/* API Key Warning */}
        {aiStatus && !aiStatus.configured && (
          <div style={{ background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <FiAlertTriangle size={16} style={{ color: C.amber, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: C.text }}>
              <strong>B.E.A.U. is not configured.</strong> Contact your system administrator to complete the AI setup.
            </div>
          </div>
        )}

        {/* Welcome Screen */}
        {welcome && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
            <img src="/rod-logo.png" alt="B.E.A.U." style={{ width: 200, height: 200, borderRadius: 30, objectFit: "contain", marginBottom: 24, filter: "brightness(1.2) drop-shadow(0 0 20px rgba(14,165,233,0.5))" }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>B.E.A.U.</h1>
            <p style={{ fontSize: 13, color: C.textLight, maxWidth: 460, lineHeight: 1.6, margin: "0 0 28px" }}>
              Evidence-based canine rehabilitation intelligence. Load a patient for personalized protocols, or ask general clinical questions.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 500, width: "100%" }}>
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => send(s.q)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 6, transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <span style={{ color: C.teal }}>{s.icon}</span>
                  <span style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{s.q}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 24, fontSize: 10, color: C.textLight, display: "flex", alignItems: "center", gap: 4 }}>
              <FiShield size={10} /> CDSS — Does not replace licensed veterinary judgment
            </div>
          </div>
        )}

        {/* Messages */}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
            <div style={{
              maxWidth: m.role === "user" ? "72%" : "88%",
              padding: m.role === "user" ? "10px 16px" : "14px 18px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? aiC.userBubble : aiC.aiBubble,
              border: m.role === "user" ? "none" : `1px solid ${aiC.aiBorder}`,
              color: m.role === "user" ? "#fff" : C.text,
              fontSize: 13, lineHeight: 1.65,
              boxShadow: m.role === "user" ? `0 3px 12px ${C.navy}20` : "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              {m.role === "assistant"
                ? <>
                    <MessageContent content={m.content} renderMd={renderMd} onPresentation={setPresentationDeck} />
                    <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
                      <SpeakButton onClick={() => beauVoice.speak(m.content)} isSpeaking={beauVoice.isSpeaking} />
                    </div>
                  </>
                : <span style={{ fontWeight: 500 }}>{m.content}</span>
              }
            </div>
          </div>
        ))}

        {/* Streaming */}
        {stream && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
            <div style={{ maxWidth: "88%", padding: "14px 18px", borderRadius: "16px 16px 16px 4px", background: aiC.aiBubble, border: `1px solid ${aiC.aiBorder}`, fontSize: 13, lineHeight: 1.65 }}>
              <MessageContent content={stream} renderMd={renderMd} />
              <span style={{ display: "inline-block", width: 5, height: 15, background: C.teal, marginLeft: 1, animation: "blink 1s step-end infinite", verticalAlign: "text-bottom", borderRadius: 1 }} />
            </div>
          </div>
        )}

        {/* Loading dots */}
        {loading && !stream && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
            <div style={{ padding: "12px 18px", borderRadius: "16px 16px 16px 4px", background: aiC.aiBubble, border: `1px solid ${aiC.aiBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
              <span style={{ fontSize: 11, color: C.textLight }}>Analyzing clinical data...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompts */}
      {patient && msgs.length > 0 && !loading && (
        <div style={{ padding: "0 20px 6px", display: "flex", gap: 5, overflowX: "auto", flexShrink: 0 }}>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => send(q.prompt)} style={{ background: `${C.teal}08`, border: `1px solid ${C.teal}20`, borderRadius: 16, padding: "5px 12px", cursor: "pointer", fontSize: 10, color: C.teal, fontWeight: 500, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {q.icon} {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div style={{ padding: "10px 20px 16px", borderTop: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "4px 4px 4px 16px" }}>
          <textarea
            ref={taRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
            placeholder={patient ? `Ask about ${patient.name}'s rehab...` : "Ask a clinical rehabilitation question..."}
            rows={1}
            style={{ flex: 1, background: "transparent", border: "none", color: C.text, fontSize: 13, lineHeight: 1.5, resize: "none", outline: "none", padding: "7px 0", fontFamily: "inherit", maxHeight: 100 }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            width: 36, height: 36, borderRadius: 10,
            background: input.trim() && !loading ? `linear-gradient(135deg, ${C.teal}, ${C.green})` : C.border,
            border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: input.trim() && !loading ? "#fff" : C.textLight,
            transition: "all 0.2s", flexShrink: 0
          }}>
            <FiSend size={16} />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 2px" }}>
          <span style={{ fontSize: 10, color: C.textLight }}>K9 Rehab Pro™ CDSS • Evidence-based rehabilitation support</span>
          <span style={{ fontSize: 10, color: C.textLight }}>B.E.A.U.™ • Millis & Levine • ACVSMR</span>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes blink { 50%{opacity:0} }
      `}</style>
      </div>{/* /Main Chat Column */}
      {/* Presentation modal */}
      {presentationDeck && (
        <Suspense fallback={null}>
          <PresentationView deck={presentationDeck} onClose={() => setPresentationDeck(null)} />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Renders message content, splitting text and engine blocks (:::diagram, :::document).
 * Text parts render as HTML via renderMd, engine blocks render as React components.
 */
function MessageContent({ content, renderMd, onPresentation }) {
  if (!content) return null;

  const parts = [];
  const engineRegex = /:::(diagram|document|presentation|visual)\s*([\s\S]*?):::/g;
  let match;
  let lastIndex = 0;

  while ((match = engineRegex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore.trim()) parts.push({ type: "text", content: textBefore });

    const engineType = match[1];
    const jsonStr = match[2].trim();
    try {
      parts.push({ type: engineType, content: JSON.parse(jsonStr) });
    } catch {
      parts.push({ type: "text", content: "```\n" + jsonStr + "\n```" });
    }
    lastIndex = match.index + match[0].length;
  }

  const textAfter = content.slice(lastIndex);
  if (textAfter.trim()) parts.push({ type: "text", content: textAfter });

  if (parts.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: renderMd(content) }} />;
  }

  return (
    <div>
      {parts.map((part, i) => {
        if (part.type === "diagram") {
          return (
            <Suspense key={i} fallback={<div style={{ padding: 12, fontSize: 12, color: "#6a737d" }}>Loading diagram...</div>}>
              <DiagramRenderer diagram={part.content} />
            </Suspense>
          );
        }
        if (part.type === "document") {
          return (
            <Suspense key={i} fallback={<div style={{ padding: 12, fontSize: 12, color: "#6a737d" }}>Loading document...</div>}>
              <NarrativePanel document={part.content} />
            </Suspense>
          );
        }
        if (part.type === "presentation") {
          const deck = part.content;
          return (
            <div key={i} style={{
              margin: "12px 0", padding: "12px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, #0F4C8115, #1D9E7515)",
              border: "1px solid var(--k9-teal)", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--k9-text)" }}>{deck.title || "Presentation"}</div>
                <div style={{ fontSize: 11, color: "var(--k9-text-light)" }}>{deck.slides?.length || 0} slides</div>
              </div>
              <button onClick={() => onPresentation?.(deck)} style={{
                padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                background: "var(--k9-teal)", color: "#fff", fontSize: 12, fontWeight: 600,
              }}>
                View Presentation
              </button>
            </div>
          );
        }
        if (part.type === "visual") {
          return (
            <Suspense key={i} fallback={<div style={{ padding: 12, fontSize: 12, color: "#6a737d" }}>Loading visual...</div>}>
              <VisualCardRenderer card={part.content} />
            </Suspense>
          );
        }
        return <div key={i} dangerouslySetInnerHTML={{ __html: renderMd(part.content) }} />;
      })}
    </div>
  );
}

export default BEAUView;