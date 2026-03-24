import React, { useEffect, useState, Suspense, lazy } from "react";
import axios from "axios";

// ── Constants & Config ──
import C from "./constants/colors";
import S from "./constants/styles";
import { API, setupAxiosAuth, clearAxiosAuth } from "./api/axios";

// ── Components ──
import TopNav from "./components/TopNav";
import { ToastProvider } from "./components/Toast";

// ── Eager-loaded pages (first screens) ──
import LoginView from "./pages/LoginView";
// WelcomeView removed — app goes straight to login

// ── Lazy-loaded pages (code-split) ──
const GeneratorView = lazy(() => import("./pages/GeneratorView"));
const DashboardView = lazy(() => import("./pages/DashboardView"));
const ExercisesView = lazy(() => import("./pages/ExercisesView"));
const SessionsView  = lazy(() => import("./pages/SessionsView"));
const VetAIView     = lazy(() => import("./pages/VetAIView"));
const SettingsView  = lazy(() => import("./pages/SettingsView"));
const AboutView     = lazy(() => import("./pages/AboutView"));
const ClientsView   = lazy(() => import("./pages/ClientsView"));
const PatientDetailView = lazy(() => import("./pages/PatientDetailView"));

// ─────────────────────────────────────────────
// APP — Slim Orchestrator
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home");
  const [genKey, setGenKey] = useState(0);
  const [genInitialStep, setGenInitialStep] = useState(1);
  const [brand, setBrand] = useState({ clinicName: "K9 Rehab Pro\u2122", accent: "#0F4C81" });
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ── Authentication State ──
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Configure axios interceptor when token changes
  useEffect(() => {
    if (authToken) {
      setupAxiosAuth(authToken, () => {
        // On 401: force logout
        setAuthToken(null);
        setCurrentUser(null);
      });
    } else {
      clearAxiosAuth();
    }
  }, [authToken]);

  const handleLogin = async (username, password) => {
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password });
      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Login failed" };
    }
  };

  const handleRegister = async (username, password, displayName, credentials = {}) => {
    try {
      const res = await axios.post(`${API}/auth/register`, {
        username, password, display_name: displayName,
        ...credentials,
      });
      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Registration failed" };
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setView("home");
  };

  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Auth Gate ──
  if (!authToken) {
    return <ToastProvider><LoginView onLogin={handleLogin} onRegister={handleRegister} /></ToastProvider>;
  }

  // ── Terms of Service Gate (CLAUDE.md Tier 1: sign-off on first login, 90-day refresh) ──
  const TOS_VERSION = 1;
  const tosAccepted = localStorage.getItem("k9_tos_accepted");
  const tosVersion = parseInt(localStorage.getItem("k9_tos_version") || "0", 10);
  const tosDate = parseInt(localStorage.getItem("k9_tos_date") || "0", 10);
  const tosExpired = Date.now() - tosDate > 90 * 24 * 60 * 60 * 1000;
  const needsTos = !tosAccepted || tosVersion < TOS_VERSION || tosExpired;

  if (needsTos) {
    return (
      <ToastProvider>
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 12, maxWidth: 640, width: "90%", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "2px solid #0F4C81" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0F4C81" }}>Terms of Service & Clinical Use Agreement</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>K9 Rehab Pro Clinical Decision-Support System (CDSS) v{TOS_VERSION}</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", fontSize: 12, color: "#334155", lineHeight: 1.7 }}>
            <p style={{ fontWeight: 700, color: "#0F4C81", marginBottom: 8 }}>1. Classification & Scope</p>
            <p>K9 Rehab Pro is classified as a <strong>Clinical Decision-Support System (CDSS)</strong> for post-diagnostic rehabilitation planning only. It is NOT a medical device, does not diagnose conditions, prescribe medications, or replace the Veterinarian-Client-Patient Relationship (VCPR).</p>

            <p style={{ fontWeight: 700, color: "#0F4C81", marginBottom: 8, marginTop: 16 }}>2. Professional Responsibility</p>
            <p>All protocol output requires review and approval by a licensed veterinary professional (DVM, CCRP, CCRT). No protocol is valid for clinical use without licensed veterinarian sign-off. The platform retains no liability for clinical outcomes — the licensee assumes full professional responsibility.</p>

            <p style={{ fontWeight: 700, color: "#0F4C81", marginBottom: 8, marginTop: 16 }}>3. Evidence-Based Framework</p>
            <p>Protocol generation follows ACVSMR diplomate methodology with exercises graded A (strong RCT), B (moderate evidence), C (limited evidence), or EO (expert opinion). Evidence grades are displayed on every exercise. Low-evidence exercises carry inline notation.</p>

            <p style={{ fontWeight: 700, color: "#0F4C81", marginBottom: 8, marginTop: 16 }}>4. Safety Gating</p>
            <p>The platform includes automated red-flag detection (pain thresholds, neurological status, incision complications, weight-bearing restrictions). Red-flag triggers are logged in the audit trail. Clinicians must not override safety gates without documented clinical justification.</p>

            <p style={{ fontWeight: 700, color: "#0F4C81", marginBottom: 8, marginTop: 16 }}>5. Data & Audit</p>
            <p>All protocol generation, modifications, and clinical interactions are logged in an immutable audit trail retained for a minimum of 7 years. Patient data is stored locally. Adverse events linked to protocol recommendations should be reported via the platform&apos;s reporting mechanism.</p>

            <p style={{ fontWeight: 700, color: "#0F4C81", marginBottom: 8, marginTop: 16 }}>6. AI Assistant (VetAI)</p>
            <p>The AI clinical assistant provides evidence-based decision support only. AI-generated recommendations are cross-checked against the validated exercise library. Clinicians must verify AI output before clinical application. AI synthesis is distinguished from sourced clinical data.</p>

            <p style={{ fontWeight: 700, color: "#0F4C81", marginBottom: 8, marginTop: 16 }}>7. Regulatory Alignment</p>
            <p>This platform aligns with AVMA Model Veterinary Practice Act principles, ACVSMR certification standards, and AAHA practice standards. State-specific veterinary practice act compliance is the responsibility of the licensee.</p>

            <p style={{ fontWeight: 700, color: "#0F4C81", marginBottom: 8, marginTop: 16 }}>8. Acceptance & Renewal</p>
            <p>By accepting these terms, you attest that you are a licensed veterinary professional or supervised trainee, and that you understand the limitations of CDSS-assisted rehabilitation planning. This agreement must be renewed every 90 days.</p>
          </div>
          <div style={{ padding: "16px 24px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={handleLogout} style={{ background: "none", border: "1px solid #CBD5E1", borderRadius: 6, padding: "8px 16px", fontSize: 12, color: "#64748B", cursor: "pointer" }}>
              Decline & Logout
            </button>
            <button onClick={() => {
              localStorage.setItem("k9_tos_accepted", "true");
              localStorage.setItem("k9_tos_version", String(TOS_VERSION));
              localStorage.setItem("k9_tos_date", String(Date.now()));
              setGenKey(k => k + 1); // Force re-render
            }} style={{ background: "#0F4C81", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
              I Accept These Terms
            </button>
          </div>
        </div>
      </div>
      </ToastProvider>
    );
  }

  // ── Loading spinner for lazy chunks ──
  const ChunkSpinner = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `4px solid ${C.border}`, borderTopColor: C.green,
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Loading Module...</div>
    </div>
  );

  // ── Render active view (only the active one mounts → triggers lazy import) ──
  const renderView = () => {
    switch (view) {
      case "home":      return <GeneratorView key={genKey} initialStep={1} />;
      case "generator": return <GeneratorView key={genKey} initialStep={genInitialStep} />;
      case "dashboard": return <DashboardView setView={setView} />;
      case "exercises": return <ExercisesView setView={setView} setGenKey={setGenKey} setGenInitialStep={setGenInitialStep} />;
      case "sessions":  return <SessionsView />;
      case "vetai":     return <VetAIView authToken={authToken} />;
      case "settings":  return <SettingsView brand={brand} setBrand={setBrand} />;
      case "about":     return <AboutView />;
      case "clients":   return <ClientsView setView={setView} setSelectedPatient={setSelectedPatient} />;
      case "patient-detail": return <PatientDetailView patient={selectedPatient} setView={setView} />;
      default:          return <GeneratorView key={genKey} initialStep={1} />;
    }
  };


  const dateStr = liveTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <ToastProvider>
    <div className="k9-app-content" style={S.app}>
      <TopNav
        view={view}
        setView={setView}
        brand={brand}
        dateStr={dateStr}
        timeStr={timeStr}
        currentUser={currentUser}
        onLogout={handleLogout}
        genKey={genKey}
        setGenKey={setGenKey}
        setGenInitialStep={setGenInitialStep}
      />

      <div style={S.main}>
        <div style={S.content} data-content-scroll>
          <Suspense fallback={<ChunkSpinner />}>
            {renderView()}
          </Suspense>
        </div>
      </div>
    </div>
    </ToastProvider>
  );
}
