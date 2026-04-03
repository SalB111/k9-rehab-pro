import React, { useEffect, useState, Suspense, lazy } from "react";
import { login as loginService } from "./services/authService";
import { setupAxiosAuth, clearAxiosAuth } from "./api/axios";
import { ToastProvider } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import LoginView from "./pages/LoginView";
import WelcomeSplash from "./pages/WelcomeSplash";

const GeneratorView = lazy(() => import("./pages/GeneratorView"));
const DashboardView = lazy(() => import("./pages/DashboardView"));
const ExercisesView = lazy(() => import("./pages/ExercisesView"));
const SessionsView = lazy(() => import("./pages/SessionsView"));
const BEAUView = lazy(() => import("./pages/BEAUView"));
const SettingsView = lazy(() => import("./pages/SettingsView"));
const AboutView = lazy(() => import("./pages/AboutView"));
const ClientsView = lazy(() => import("./pages/ClientsView"));
const PatientDetailView = lazy(() => import("./pages/PatientDetailView"));
const ExerciseVisualDemo = lazy(() => import("./components/ExerciseVisualDemo"));
const DocsView = lazy(() => import("./pages/DocsView"));

export default function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState({ username: "Clinician", role: "clinician", id: 1 });
  const [view, setView] = useState("clients");
  const [showSplash, setShowSplash] = useState(!localStorage.getItem("token"));
  const [genKey, setGenKey] = useState(0);
  const [genInitialStep, setGenInitialStep] = useState(1);
  const [brand, setBrand] = useState({ clinicName: "K9 Rehab Pro", accent: "#0F4C81" });
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (authToken) {
      setupAxiosAuth(authToken);
    } else {
      clearAxiosAuth();
    }
  }, [authToken]);

  async function handleLogin(username, password) {
    try {
      const res = await loginService(username, password);
      const data = res.data;
      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Login failed" };
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setAuthToken(null);
    setCurrentUser(null);
    setView("clients");
  }

  function handleRegister() {
    alert("Contact your administrator to create an account.");
  }


  // Shared props every view may need
  const navProps = {
    setView,
    setGenKey,
    setGenInitialStep,
    setSelectedPatient,
    currentUser,
    authToken,
  };

  function renderView() {
    switch (view) {
      case "dashboard":
        return <DashboardView setView={setView} />;
      case "generator":
        return (
          <GeneratorView
            key={genKey}
            initialStep={genInitialStep}
            brand={brand}
            setView={setView}
          />
        );
      case "exercises":
        return (
          <ExercisesView
            setView={setView}
            setGenKey={setGenKey}
            setGenInitialStep={setGenInitialStep}
          />
        );
      case "sessions":
        return <SessionsView setView={setView} />;
      case "beau":
        return <BEAUView authToken={authToken} setView={setView} />;
      case "settings":
        return <SettingsView brand={brand} setBrand={setBrand} setView={setView} />;
      case "about":
        return <AboutView setView={setView} />;
      case "clients":
        return (
          <ClientsView
            setView={setView}
            setSelectedPatient={setSelectedPatient}
          />
        );
      case "patient":
        return (
          <PatientDetailView
            patient={selectedPatient}
            setView={setView}
          />
        );
      case "docs":
        return <DocsView setView={setView} />;
      case "visual-demo":
        return <ExerciseVisualDemo />;
      default:
        return <ClientsView setView={setView} setSelectedPatient={setSelectedPatient} />;
    }
  }

  // Splash screen — cinematic intro before login
  if (showSplash && !authToken) {
    return <WelcomeSplash onEnter={() => setShowSplash(false)} />;
  }

  // Auth gate — show login page when not authenticated
  if (!authToken) {
    return (
      <ToastProvider>
        <LoginView onLogin={handleLogin} onRegister={handleRegister} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[var(--k9-bg)] font-sans">
        <Sidebar
          view={view}
          setView={setView}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 min-h-screen overflow-y-auto k9-app-content">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-[var(--k9-teal)] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            {renderView()}
          </Suspense>
        </main>
      </div>
    </ToastProvider>
  );
}
