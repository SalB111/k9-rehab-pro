import React, { useEffect, useState, Suspense, lazy } from "react";
import { login as loginService } from "./services/authService";
import { setupAxiosAuth, clearAxiosAuth } from "./api/axios";
import S from "./constants/styles";
import { ToastProvider } from "./components/Toast";
import LoginView from "./pages/LoginView";

const GeneratorView = lazy(() => import("./pages/GeneratorView"));
const DashboardView = lazy(() => import("./pages/DashboardView"));
const ExercisesView = lazy(() => import("./pages/ExercisesView"));
const SessionsView = lazy(() => import("./pages/SessionsView"));
const BEAUView = lazy(() => import("./pages/BEAUView"));
const SettingsView = lazy(() => import("./pages/SettingsView"));
const AboutView = lazy(() => import("./pages/AboutView"));
const ClientsView = lazy(() => import("./pages/ClientsView"));
const PatientDetailView = lazy(() => import("./pages/PatientDetailView"));

const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard"         },
  { key: "clients",    label: "Patients"           },
  { key: "generator",  label: "Protocol generator" },
  { key: "exercises",  label: "Exercise library"   },
  { key: "sessions",   label: "Sessions"           },
  { key: "beau",       label: "BEAU assessment"    },
  { key: "settings",   label: "Settings"           },
  { key: "about",      label: "About"              },
];

export default function App() {
  const [authToken, setAuthToken]       = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser]   = useState(null);
  const [view, setView]                 = useState("dashboard");
  const [genKey, setGenKey]             = useState(0);
  const [genInitialStep, setGenInitialStep] = useState(1);
  const [brand, setBrand]               = useState({ clinicName: "K9 Rehab Pro", accent: "#1A5F8A" });
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (authToken) setupAxiosAuth(authToken);
    else clearAxiosAuth();
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

  function handleRegister() {
    alert("Contact your administrator to create an account.");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setAuthToken(null);
    setCurrentUser(null);
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} onRegister={handleRegister} />;
  }

  function renderView() {
    switch (view) {
      case "dashboard":  return <DashboardView setView={setView} />;
      case "generator":  return <GeneratorView key={genKey} initialStep={genInitialStep} brand={brand} />;
      case "exercises":  return <ExercisesView />;
      case "sessions":   return <SessionsView />;
      case "beau":       return <BEAUView />;
      case "settings":   return <SettingsView brand={brand} setBrand={setBrand} />;
      case "about":      return <AboutView />;
      case "clients":    return <ClientsView setSelectedPatient={(p) => { setSelectedPatient(p); setView("patient"); }} />;
      case "patient":    return <PatientDetailView patient={selectedPatient} />;
      default:           return <DashboardView setView={setView} />;
    }
  }

  return (
    <ToastProvider>
      <div style={S.appContainer}>

        {/* SIDEBAR */}
        <div style={{
          display: "flex", flexDirection: "row", flex: 1, overflow: "hidden"
        }}>
          <div style={{
            width: 220, background: "#1A5F8A", display: "flex",
            flexDirection: "column", flexShrink: 0, height: "100vh"
          }}>
            {/* Logo */}
            <div style={{
              padding: "20px 16px 16px",
              borderBottom: "0.5px solid #2272A0"
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
                K9 Rehab Pro
              </div>
              <div style={{ fontSize: 11, color: "#85B7EB", marginTop: 2 }}>
                Clinical decision support
              </div>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: "12px 0" }}>
              {NAV_ITEMS.map(item => (
                <div key={item.key}
                  onClick={() => setView(item.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px", cursor: "pointer", fontSize: 13,
                    color: view === item.key ? "#fff" : "#B5D4F4",
                    background: view === item.key ? "#2272A0" : "transparent",
                    borderLeft: view === item.key ? "3px solid #5DCAA5" : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (view !== item.key) e.currentTarget.style.background = "#1E6B9B"; }}
                  onMouseLeave={e => { if (view !== item.key) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: view === item.key ? "#5DCAA5" : "currentColor",
                    opacity: view === item.key ? 1 : 0.5, flexShrink: 0
                  }} />
                  {item.label}
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div style={{
              padding: "12px 16px",
              borderTop: "0.5px solid #2272A0",
              fontSize: 12, color: "#85B7EB",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span>{currentUser?.username || "Admin"}</span>
              <span
                onClick={handleLogout}
                style={{ cursor: "pointer", color: "#F09595", fontSize: 11 }}
              >
                Logout
              </span>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            overflow: "hidden", background: "#F4F8FD"
          }}>
            {/* Top bar */}
            <div style={{
              background: "#fff", borderBottom: "0.5px solid #B5D4F4",
              padding: "12px 24px", display: "flex",
              alignItems: "center", justifyContent: "space-between",
              flexShrink: 0
            }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#0C447C" }}>
                {NAV_ITEMS.find(i => i.key === view)?.label || "Dashboard"}
              </div>
              <div style={{ fontSize: 12, color: "#7AAACF" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>

            {/* Page content */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              <Suspense fallback={
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#1A5F8A", fontSize: 14 }}>
                  Loading...
                </div>
              }>
                {renderView()}
              </Suspense>
            </div>
          </div>
        </div>

      </div>
    </ToastProvider>
  );
}