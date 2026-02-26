import React, { useEffect, useState } from "react";
import axios from "axios";

// ── Constants & Config ──
import S from "./constants/styles";
import { API, setupAxiosAuth, clearAxiosAuth } from "./api/axios";

// ── Components ──
import TopNav from "./components/TopNav";

// ── Pages ──
import DashboardView from "./pages/DashboardView";

import GeneratorView from "./pages/GeneratorView";
import ExercisesView from "./pages/ExercisesView";
import SessionsView from "./pages/SessionsView";
import VetAIView from "./pages/VetAIView";
import SettingsView from "./pages/SettingsView";
import LoginView from "./pages/LoginView";
import WelcomeView from "./pages/WelcomeView";
import AboutView from "./pages/AboutView";

// ─────────────────────────────────────────────
// APP — Slim Orchestrator
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("welcome");
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
    return <LoginView onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const views = {
    home:       <GeneratorView key={genKey} initialStep={1} />,
    dashboard:  <DashboardView setView={setView} />,
    generator:  <GeneratorView key={genKey} initialStep={genInitialStep} />,
    exercises:  <ExercisesView />,
    sessions:   <SessionsView />,
    vetai:      <VetAIView authToken={authToken} />,
    settings:   <SettingsView brand={brand} setBrand={setBrand} />,
    about:      <AboutView />,
  };

  if (view === "welcome") {
    return <WelcomeView onEnter={() => setView("home")} onAbout={() => setView("about")} />;
  }

  const dateStr = liveTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
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
          {views[view]}
        </div>
      </div>
    </div>
  );
}
