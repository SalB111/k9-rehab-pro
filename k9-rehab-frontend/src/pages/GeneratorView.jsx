import React, { useEffect, useState } from "react";
import axios from "axios";
import C from "../constants/colors";
import { API } from "../api/axios";
import { useToast } from "../components/Toast";
import { useTr } from "../i18n/useTr";

// ── Decomposed sub-components ──
import useIntakeForm from "./generator/useIntakeForm";
import { DEMO_PATIENT } from "./generator/constants";
import WizardProgress from "./generator/WizardProgress";
import Step1ClientPatient from "./generator/Step1ClientPatient";
import Step2ClinicalAssessment from "./generator/Step2ClinicalAssessment";
import Step3TreatmentPlan from "./generator/Step3TreatmentPlan";
import Step4RehabGoals from "./generator/Step4RehabGoals";
import Step5ProtocolParams from "./generator/Step5ProtocolParams";
import Step6PreProtocolSummary from "./generator/Step6PreProtocolSummary";
import ProtocolResults from "./generator/ProtocolResults";
import AddExerciseModal from "./generator/AddExerciseModal";

export default function GeneratorView({ initialStep }) {
  const toast = useToast();
  const tr = useTr();

  // ── Orchestration state ──
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wizardStep, setWizardStep] = useState(initialStep || 1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToWeek, setAddingToWeek] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [exSearch, setExSearch] = useState("");
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [showStoryboard, setShowStoryboard] = useState(null);

  // ── Patient intake form (custom hook) ──
  const {
    form, setField, weightWarning,
    handleWeightKg, handleWeightLbs,
    handleDob, handleAge,
    handleSurgeryDate, handlePostOpDay,
    handleZip, clearSavedForm,
  } = useIntakeForm();

  // ── Print CSS injection ──
  useEffect(() => {
    const id = "k9-print-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @media print {
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, .no-print, button, [class*="TopNav"] { display: none !important; }
          .print-protocol { box-shadow: none !important; border: none !important; }
          .print-protocol * { break-inside: avoid; }
          @page { margin: 0.5in; size: letter; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ── Scroll to diagnostics when opened via nav ──
  useEffect(() => {
    if (initialStep === 2) {
      setTimeout(() => {
        const el = document.getElementById("diagnostics-workup");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [initialStep]);

  // ── Load exercise library ──
  useEffect(() => {
    axios.get(`${API}/exercises`)
      .then(r => setAllExercises(r.data?.data || r.data || []))
      .catch(() => toast("Failed to load exercises"));
  }, []);

  // ── Navigate wizard steps and scroll to top ──
  const goToStep = (step) => {
    setWizardStep(step);
    setTimeout(() => {
      const el = document.querySelector("[data-content-scroll]");
      if (el) el.scrollTop = 0;
    }, 50);
  };

  // ── Load demo patient for live demos ──
  const loadDemoPatient = () => {
    Object.entries(DEMO_PATIENT).forEach(([k, v]) => setField(k, v));
    setComplianceAgreed(true);
    setWizardStep(6);
    toast("✅ Demo patient loaded — ready to generate!", "success");
  };

  // ── Generate protocol ──
  const generate = async () => {
    if (loading) return; // Debounce — prevent double-submit

    // Only Patient Name + Client Name are required — all other blocks are optional
    const missing = [];
    if (!form.patientName.trim()) missing.push("Patient Name");
    if (!form.clientLastName?.trim() && !form.clientFirstName?.trim()) missing.push("Client Name");

    if (missing.length > 0) {
      const msg = `Missing required: ${missing.join(", ")}`;
      setError(msg);
      toast(`⚠️ ${msg}`, "error", 6000);
      return;
    }

    setLoading(true); setError(null); setProtocol(null);

    const minDelay = new Promise(resolve => setTimeout(resolve, 11000));

    try {
      // Strip empty strings from form — only send actual clinician selections
      const cleanedForm = {};
      for (const [key, value] of Object.entries(form)) {
        if (value === "" || value === null || value === undefined) continue; // Skip unselected dropdowns
        cleanedForm[key] = value;
      }
      const [{ data: resp }] = await Promise.all([
        axios.post(`${API}/generate-protocol`, {
          ...cleanedForm,
          age: +form.age || 0,
          weight: +form.weightLbs || +form.weightKg * 2.20462 || 0,
          protocolLength: +form.protocolLength || 8
        }),
        minDelay
      ]);
      setProtocol(resp?.data || resp);
      clearSavedForm();
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to generate protocol — check your connection";
      setError(msg);
      toast(`❌ ${msg}`, "error", 8000);
    } finally { setLoading(false); }
  };

  // ── Exercise management ──
  const removeExercise = (weekIdx, exIdx) => {
    setProtocol(prev => ({
      ...prev,
      weeks: prev.weeks.map((w, i) =>
        i === weekIdx ? { ...w, exercises: w.exercises.filter((_, j) => j !== exIdx) } : w
      )
    }));
  };

  const addExercise = (weekIdx, ex) => {
    setProtocol(prev => ({
      ...prev,
      weeks: prev.weeks.map((w, i) =>
        i === weekIdx ? { ...w, exercises: [...w.exercises, {
          exercise: ex, code: ex.code, name: ex.name, category: ex.category,
          sets: 3, reps: 10, frequency: "2x daily", duration_minutes: 10,
          equipment: ex.equipment, setup: ex.setup, steps: ex.steps,
          good_form: ex.good_form, common_mistakes: ex.common_mistakes,
          red_flags: ex.red_flags, progression: ex.progression,
          contraindications: ex.contraindications,
          notes: "Added manually by clinician"
        }] } : w
      )
    }));
    setShowAddModal(false);
    setExSearch("");
  };

  const filteredEx = allExercises.filter(e =>
    e.name.toLowerCase().includes(exSearch.toLowerCase()) ||
    e.category?.toLowerCase().includes(exSearch.toLowerCase())
  );

  // ═══════════ EARLY RETURNS ═══════════

  // Compact spinner while generating
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: `4px solid ${C.border}`, borderTopColor: C.green,
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{tr("Generating Protocol...")}</div>
        <div style={{ fontSize: 11, color: C.textMid }}>{tr("Building your evidence-based exercise program")}</div>
      </div>
    );
  }

  // ═══════════ MAIN RENDER — 5-STEP WIZARD ═══════════
  return (
    <div>
      {!protocol && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, padding: "0 4px" }}>
          <button
            onClick={loadDemoPatient}
            style={{
              background: "linear-gradient(135deg, #059669, #0EA5E9)",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 18px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.03em",
              boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; e.target.style.boxShadow = "0 4px 14px rgba(5,150,105,0.45)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 2px 8px rgba(5,150,105,0.3)"; }}
            title={tr("Pre-fill a complete demo patient for presentations")}
          >
            🐾 {tr("Demo Mode")}
          </button>
        </div>
      )}
      {!protocol && <WizardProgress wizardStep={wizardStep} goToStep={goToStep} />}

      {!protocol && wizardStep === 1 && (
        <Step1ClientPatient
          form={form} setField={setField} goToStep={goToStep}
          handleWeightKg={handleWeightKg} handleWeightLbs={handleWeightLbs}
          handleDob={handleDob} handleAge={handleAge}
          handleZip={handleZip} weightWarning={weightWarning}
        />
      )}

      {!protocol && wizardStep === 2 && (
        <Step2ClinicalAssessment
          form={form} setField={setField} goToStep={goToStep}
        />
      )}

      {!protocol && wizardStep === 3 && (
        <Step3TreatmentPlan
          form={form} setField={setField} goToStep={goToStep}
          handleSurgeryDate={handleSurgeryDate} handlePostOpDay={handlePostOpDay}
        />
      )}

      {!protocol && wizardStep === 4 && (
        <Step4RehabGoals
          form={form} setField={setField} goToStep={goToStep}
        />
      )}

      {!protocol && wizardStep === 5 && (
        <Step5ProtocolParams
          form={form} setField={setField} goToStep={goToStep}
        />
      )}

      {!protocol && wizardStep === 6 && (
        <Step6PreProtocolSummary
          form={form} allExercises={allExercises}
          complianceAgreed={complianceAgreed} setComplianceAgreed={setComplianceAgreed}
          complianceOpen={complianceOpen} setComplianceOpen={setComplianceOpen}
          generate={generate} error={error} goToStep={goToStep} loading={loading}
        />
      )}

      {protocol && (
        <ProtocolResults
          protocol={protocol} setProtocol={setProtocol}
          setWizardStep={setWizardStep}
          removeExercise={removeExercise}
          setAddingToWeek={setAddingToWeek} setShowAddModal={setShowAddModal}
          showStoryboard={showStoryboard} setShowStoryboard={setShowStoryboard}
        />
      )}

      {showAddModal && (
        <AddExerciseModal
          addingToWeek={addingToWeek} filteredEx={filteredEx}
          addExercise={addExercise} exSearch={exSearch}
          setExSearch={setExSearch} setShowAddModal={setShowAddModal}
        />
      )}
    </div>
  );
}
