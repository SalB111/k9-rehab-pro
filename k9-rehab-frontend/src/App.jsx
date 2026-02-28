import React, { useEffect, useState, Suspense, lazy } from "react";
import axios from "axios";

// ── Constants & Config ──
import C from "./constants/colors";
import S from "./constants/styles";
import { API, setupAxiosAuth, clearAxiosAuth } from "./api/axios";

// ── Components ──
import TopNav from "./components/TopNav";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./components/ThemeProvider";

// ── Eager-loaded pages (first screens) ──
import LoginView from "./pages/LoginView";
import WelcomeView from "./pages/WelcomeView";

// ── Lazy-loaded pages (code-split) ──
const GeneratorView = lazy(() => import("./pages/GeneratorView"));
const DashboardView = lazy(() => import("./pages/DashboardView"));
const ExercisesView = lazy(() => import("./pages/ExercisesView"));
const SessionsView  = lazy(() => import("./pages/SessionsView"));
const VetAIView     = lazy(() => import("./pages/VetAIView"));
const SettingsView  = lazy(() => import("./pages/SettingsView"));
const AboutView     = lazy(() => import("./pages/AboutView"));

// ─────────────────────────────────────────────
// APP — Slim Orchestrator
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(
    localStorage.getItem("k9-welcome-seen") ? "home" : "welcome"
  );
  const [genKey, setGenKey] = useState(0);
  const [genInitialStep, setGenInitialStep] = useState(1);
  const [brand, setBrand] = useState({ clinicName: "K9 Rehab Pro\u2122", accent: "#0F4C81" });

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

  const handleRegister = async (username, password, displayName) => {
    try {
      const res = await axios.post(`${API}/auth/register`, {
        username, password, display_name: displayName,
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
    setView("welcome");
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

  // ── Loading spinner for lazy chunks ──
  const ChunkSpinner = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `4px solid ${C.border}`, borderTopColor: C.green,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
      default:          return <GeneratorView key={genKey} initialStep={1} />;
    }
  };

  if (view === "welcome") {
    return <ToastProvider><WelcomeView onEnter={() => { localStorage.setItem("k9-welcome-seen", "true"); setView("home"); }} onAbout={() => setView("about")} /></ToastProvider>;
  }

  const dateStr = liveTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <ToastProvider>
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
        @keyframes toastSlide {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

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
