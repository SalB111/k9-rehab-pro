// App.jsx — FINAL PRODUCTION VERSION
// ==================================

import React, { useEffect, useState, Suspense, lazy } from "react";
import { login as loginService } from "./services/authService";   // <-- USE CORRECT SERVICE
import { setupAxiosAuth, clearAxiosAuth } from "./api/axios";
import C from "./constants/colors";
import S from "./constants/styles";
import { ToastProvider } from "./components/Toast";
import LoginView from "./pages/LoginView";

// Lazy-loaded views
const GeneratorView = lazy(() => import("./pages/GeneratorView"));
const DashboardView = lazy(() => import("./pages/DashboardView"));
const ExercisesView = lazy(() => import("./pages/ExercisesView"));
const SessionsView = lazy(() => import("./pages/SessionsView"));
const BEAUView = lazy(() => import("./pages/BEAUView"));
const SettingsView = lazy(() => import("./pages/SettingsView"));
const AboutView = lazy(() => import("./pages/AboutView"));
const ClientsView = lazy(() => import("./pages/ClientsView"));
const PatientDetailView = lazy(() => import("./pages/PatientDetailView"));

export default function App() {
  // AUTH STATE
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  // LOGIN HANDLER — CORRECT VERSION
  async function handleLogin(username, password) {
    try {
      const res = await loginService(username, password); // <-- CALLS CORRECT SERVICE

      // Axios returns the full response object
      const data = res.data;

      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.error || "Login failed",
      };
    }
  }

  // LOGIN GATE
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  // APP STATE
  const [view, setView] = useState("dashboard");
  const [genKey, setGenKey] = useState(0);
  const [genInitialStep, setGenInitialStep] = useState(1);
  const [brand, setBrand] = useState({
    clinicName: "K9 Rehab Pro",
    accent: "#0F4C81",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);

  // APPLY TOKEN TO AXIOS
  useEffect(() => {
    if (authToken) {
      setupAxiosAuth(authToken);
    } else {
      clearAxiosAuth();
    }
  }, [authToken]);

  // VIEW RENDERER
  function renderView() {
    switch (view) {
      case "dashboard":
        return <DashboardView />;
      case "generator":
        return (
          <GeneratorView
            key={genKey}
            initialStep={genInitialStep}
            brand={brand}
          />
        );
      case "exercises":
        return <ExercisesView />;
      case "sessions":
        return <SessionsView />;
      case "beau":
        return <BEAUView />;
      case "settings":
        return <SettingsView brand={brand} setBrand={setBrand} />;
      case "about":
        return <AboutView />;
      case "clients":
        return <ClientsView setSelectedPatient={setSelectedPatient} />;
      case "patient":
        return <PatientDetailView patient={selectedPatient} />;
      default:
        return <DashboardView />;
    }
  }

  // MAIN RENDER
  return (
    <ToastProvider>
      <div style={S.appContainer}>
        <Suspense fallback={<div>Loading...</div>}>{renderView()}</Suspense>
      </div>
    </ToastProvider>
  );
}