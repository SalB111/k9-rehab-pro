import React, { useEffect, useState, Suspense, lazy } from "react";
import axios from "axios";

// ── Constants & Config ──
import C from "./constants/colors";
import S from "./constants/styles";
import { API, setupAxiosAuth, clearAxiosAuth } from "./api/axios";

// ── Components ──
import TopNav from "./components/TopNav";
import { ToastProvider } from "./components/Toast";

// ── Eager-loaded pages ──
import LoginView from "./pages/LoginView";

// ── Lazy-loaded pages ──
const GeneratorView = lazy(() => import("./pages/GeneratorView"));
const DashboardView = lazy(() => import("./pages/DashboardView"));
const ExercisesView = lazy(() => import("./pages/ExercisesView"));
const SessionsView  = lazy(() => import("./pages/SessionsView"));
const BEAUView      = lazy(() => import("./pages/BEAUView"));   // ← UPDATED
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
  const [brand, setBrand] = useState({ clinicName: "K9 Rehab Pro™", accent: "#0F4C81" });
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ── Authentication State ──
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Configure axios interceptor when token changes
  useEffect(() => {
    if (authToken) {
      setupAxiosAuth(authToken, () => {
        setAuthToken(null);
        setCurrentUser(null);
      });
    } else {
      clearAxiosAuth();
    }
  }, [authToken]);

  // ── LOGIN ──
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

  // ── REGISTER ──
  const handleRegister = async (username, password, displayName, credentials = {}) => {
    try {
      const res = await axios.post(`${API}/auth/register`, {
        username,
        password,
        display_name: displayName,
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

  // ── Live Clock ──
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Auth Gate ──
  if (!authToken) {
    return (
      <ToastProvider>
        <LoginView onLogin={handleLogin} onRegister={handleRegister} />
      </ToastProvider>
    );
  }

  // ── Terms of Service Gate ──
  const TOS_VERSION = 1;
  const tosAccepted = localStorage.getItem("k9_tos_accepted");
  const tosVersion = parseInt(localStorage.getItem("k9_tos_version") || "0", 10);
  const tosDate = parseInt(localStorage.getItem("k9_tos_date") || "0", 10);
  const tosExpired = Date.now() - tosDate > 90 * 24 * 60 * 60 * 1000;
  const needsTos = !tosAccepted || tosVersion < TOS_VERSION || tosExpired;

  if (needsTos) {
    return (
      <ToastProvider>
        {/* TOS modal unchanged */}
        {/* (Your TOS block stays exactly as-is) */}
      </ToastProvider>
    );
  }

  // ── Loading Spinner for Lazy Chunks ──
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

  // ── ACTIVE VIEW RENDERER ──
  const renderView = () => {
    switch (view) {
      case "home":      return <GeneratorView key={genKey} initialStep={1} />;
      case "generator": return <GeneratorView key={genKey} initialStep={genInitialStep} />;
      case "dashboard": return <DashboardView setView={setView} />;
      case "exercises": return <ExercisesView setView={setView} setGenKey={setGenKey} setGenInitialStep={setGenInitialStep} />;
      case "sessions":  return <SessionsView />;
      case "beau":      return <BEAUView authToken={authToken} />;   // ← UPDATED
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