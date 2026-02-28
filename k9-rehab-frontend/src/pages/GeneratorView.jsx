import React, { useEffect, useState } from "react";
import axios from "axios";
import C from "../constants/colors";
import { API } from "../api/axios";
import { useToast } from "../components/Toast";

// ── Decomposed sub-components ──
import useIntakeForm from "./generator/useIntakeForm";
import WizardProgress from "./generator/WizardProgress";
import Step1ClientPatient from "./generator/Step1ClientPatient";
import Step2ClinicalAssessment from "./generator/Step2ClinicalAssessment";
import Step3TreatmentPlan from "./generator/Step3TreatmentPlan";
import Step4RehabGoals from "./generator/Step4RehabGoals";
import Step5ProtocolParams from "./generator/Step5ProtocolParams";
import ProtocolResults from "./generator/ProtocolResults";
import AddExerciseModal from "./generator/AddExerciseModal";

export default function GeneratorView({ initialStep }) {
  const toast = useToast();

  // ── Orchestration state ──
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
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

  // ── Generate protocol ──
  const generate = async () => {
    if (!form.patientName.trim()) { setError("Patient name is required"); return; }
    if (!form.diagnosis) { setError("Please select a diagnosis"); return; }
    if (!form.affectedRegion) { setError("Please select an affected region"); return; }
    if (!form.treatmentApproach) { setError("Please select a treatment approach (Surgical, Conservative, or Palliative)"); return; }
    if (!complianceAgreed) { setError("Please acknowledge the Compliance & Data Protection Notice"); return; }

    setLoading(true); setShowVideo(true); setError(null); setProtocol(null);

    const minDelay = new Promise(resolve => setTimeout(resolve, 11000));

    try {
      const [{ data: resp }] = await Promise.all([
        axios.post(`${API}/generate-protocol`, {
          ...form,
          age: +form.age || 0,
          weight: +form.weightLbs || +form.weightKg * 2.20462 || 0,
          protocolLength: +form.protocolLength || 8
        }),
        minDelay
      ]);
      setProtocol(resp?.data || resp);
      clearSavedForm();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate protocol");
    } finally { setLoading(false); setShowVideo(false); }
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

  // Full-screen video while generating
  if (showVideo) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <video
          src="/loading-animation.mp4"
          autoPlay muted playsInline
          style={{ width: "100vw", height: "100vh", objectFit: "contain" }}
        />
        <button
          onClick={() => setShowVideo(false)}
          style={{
            position: "fixed", bottom: 32, right: 40, zIndex: 10000,
            padding: "10px 28px", borderRadius: 8,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
        >
          Skip →
        </button>
      </div>
    );
  }

  // Compact spinner after video skipped
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: `4px solid ${C.border}`, borderTopColor: C.green,
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>Generating Protocol...</div>
        <div style={{ fontSize: 11, color: "#fff" }}>Building your evidence-based exercise program</div>
      </div>
    );
  }

  // ═══════════ MAIN RENDER ═══════════
  return (
    <div>
      {/* Wizard progress bar — visible during intake steps */}
      {!protocol && <WizardProgress wizardStep={wizardStep} goToStep={goToStep} />}

      {/* ═══════════ STEP 1: CLIENT & PATIENT INFO ═══════════ */}
      {!protocol && wizardStep === 1 && (
        <Step1ClientPatient
          form={form} setField={setField} goToStep={goToStep}
          handleWeightKg={handleWeightKg} handleWeightLbs={handleWeightLbs}
          handleDob={handleDob} handleAge={handleAge}
          handleZip={handleZip} weightWarning={weightWarning}
        />
      )}

      {/* ═══════════ STEP 2: CLINICAL ASSESSMENT ═══════════ */}
      {!protocol && wizardStep === 2 && (
        <Step2ClinicalAssessment
          form={form} setField={setField} goToStep={goToStep}
        />
      )}

      {/* ═══════════ STEP 3: TREATMENT PLAN ═══════════ */}
      {!protocol && wizardStep === 3 && (
        <Step3TreatmentPlan
          form={form} setField={setField} goToStep={goToStep}
          handleSurgeryDate={handleSurgeryDate} handlePostOpDay={handlePostOpDay}
        />
      )}

      {/* ═══════════ STEP 4: REHAB GOALS ═══════════ */}
      {!protocol && wizardStep === 4 && (
        <Step4RehabGoals
          form={form} setField={setField} goToStep={goToStep}
        />
      )}

      {/* ═══════════ STEP 5: PROTOCOL PARAMETERS ═══════════ */}
      {!protocol && wizardStep === 5 && (
        <Step5ProtocolParams
          form={form} setField={setField} generate={generate}
          allExercises={allExercises} loading={loading}
          complianceAgreed={complianceAgreed} setComplianceAgreed={setComplianceAgreed}
          complianceOpen={complianceOpen} setComplianceOpen={setComplianceOpen}
          error={error} goToStep={goToStep}
        />
      )}

      {/* ═══════════ GENERATED PROTOCOL RESULTS ═══════════ */}
      {protocol && (
        <ProtocolResults
          protocol={protocol} setProtocol={setProtocol}
          setWizardStep={setWizardStep}
          removeExercise={removeExercise}
          setAddingToWeek={setAddingToWeek} setShowAddModal={setShowAddModal}
          showStoryboard={showStoryboard} setShowStoryboard={setShowStoryboard}
        />
      )}

      {/* ═══════════ ADD EXERCISE MODAL ═══════════ */}
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
