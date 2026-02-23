import "./App.css";
import { useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import ExerciseLibrary from "./pages/exerciselibrary";
import ExerciseDetail from "./pages/exercisedetail";
import PatientIntakeForm from "./components/PatientIntakeForm";
import AIPage from "./pages/ai";
import AISidePanel from "./components/ai/AISidePanel";
import AIToggleButton from "./components/ai/AIToggleButton";

function NotFound() {
  return (
    <main className="App" style={{ padding: "1rem" }}>
      <h1>Page not found</h1>
      <p>
        <Link to="/">Go back home</Link>
      </p>
    </main>
  );
}

export default function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intake" element={<PatientIntakeForm />} />
        <Route path="/exercises" element={<ExerciseLibrary />} />
        <Route path="/exercises/:code" element={<ExerciseDetail />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global AI side panel + toggle button (available on all pages) */}
      <AIToggleButton onClick={() => setAiPanelOpen(true)} isOpen={aiPanelOpen} />
      <AISidePanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
    </BrowserRouter>
  );
}
