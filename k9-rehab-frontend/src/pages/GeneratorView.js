import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers, FiActivity, FiClipboard,
  FiSearch, FiChevronRight,
  FiX, FiAlertTriangle, FiCheckCircle,
  FiCalendar, FiFileText, FiHeart,
  FiPlus,
  FiShield,
  FiPrinter, FiAward
} from "react-icons/fi";
import { TbDog } from "react-icons/tb";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";
import ProtocolExCard from "../components/ProtocolExCard";
import StoryboardPlayer from "../components/StoryboardPlayer";

export default function GeneratorView({ initialStep }) {
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

  // Print CSS injection
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

  // Scroll to diagnostics section when opened via nav button
  useEffect(() => {
    if (initialStep === 2) {
      setTimeout(() => {
        const el = document.getElementById("diagnostics-workup");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [initialStep]);

  // Patient intake form
  const [form, setForm] = useState({
    patientName: "", breed: "", age: "", dob: "",
    weightKg: "", weightLbs: "", sex: "Male Intact",
    diagnosis: "", affectedRegion: "",
    lamenessGrade: "", bodyConditionScore: "5",
    painLevel: "", mobilityLevel: "",
    currentMedications: "", medsLastGiven: "", medicalHistory: "",
    specialInstructions: "", protocolLength: "8",
    clientName: "", clientEmail: "", clientPhone: "", clientPhone2: "",
    referringVet: "", referringClinicPhone: "", referringClinicEmail: "",
    mailingAddress: "", city: "", state: "", zipCode: "",
    nearbyHospital: "",
    // Insurance / Billing
    insuranceProvider: "", insurancePolicyNumber: "", paymentMethod: "",
    // Treating Clinician
    treatingClinician: "", clinicianCredentials: "",
    // Client Consent
    clientConsentObtained: false, clientConsentDate: "",
    // Treatment Plan & Surgical Status
    treatmentApproach: "",  // "surgical", "conservative", "palliative"
    surgeryType: "",
    surgeryDate: "",
    surgeonName: "",
    surgicalFacility: "",
    anesthesiaRisk: "ASA II",
    postOpDay: "",
    vetRecommendation: "",  // what the vet recommended
    ownerElection: "",      // what the owner elected
    ownerDeclineReason: "", // if owner declines surgery
    priorSurgeries: "",
    complicationsNoted: "",
    weightBearingStatus: "Toe-touching",
    activityRestrictions: "",
    eCollarRequired: false,
    crateRestRequired: false,
    slingAssistRequired: false,
    incisionStatus: "Clean/Dry/Intact",
    sutureRemovalDate: "",
    // Patient Extras (Section 1)
    allergies: "",
    temperament: "Cooperative",
    // Objective Measurements (Section 2 — Millis & Levine)
    circumferenceAffected: "", circumferenceContralateral: "", circumferenceSite: "15cm proximal to patella",
    romFlexion: "", romExtension: "", romJoint: "",
    jointEffusion: "0", muscleCondition: "Normal",
    // Gait & Posture Assessment (ACVSMR standard)
    gaitDescriptors: [],   // Multi-select: circumducting, bunny-hopping, etc.
    postureFindings: [],   // Multi-select: kyphosis, lordosis, base-wide, etc.
    mmtGrade: "",          // Manual Muscle Testing 0-5 (Oxford Scale)
    ivddGrade: "",         // IVDD Hansen Classification I-V
    oaStage: "",           // OA Kellgren-Lawrence 0-4
    neuroProprioception: "", neuroWithdrawal: "", neuroDeepPain: "", neuroMotorGrade: "",
    // Treatment Goals (Section 3)
    rehabGoals: [], implantDetails: "",
    // Protocol Parameters (Section 4)
    sessionFrequency: "2", homeExerciseProgram: true, ownerCompliance: "Motivated",
    aquaticAccess: false,
    modalityUWTM: false, modalityLaser: false, modalityTENS: false, modalityNMES: false,
    modalityTherapeuticUS: false, modalityShockwave: false, modalityCryotherapy: false,
    modalityHeatTherapy: false, modalityPulsedEMF: false,
    // Diagnostics
    diagRadiographs: false, diagRadiographsNotes: "",
    diagCT: false, diagCTNotes: "",
    diagMRI: false, diagMRINotes: "",
    diagUltrasound: false, diagUltrasoundNotes: "",
    diagCBC: false, diagCBCNotes: "",
    diagChemPanel: false, diagChemPanelNotes: "",
    diagUrinalysis: false, diagUrinalysisNotes: "",
    diagThyroid: false, diagThyroidNotes: "",
    diagCRP: false, diagCRPNotes: "",
    diagSynovial: false, diagSynovialNotes: "",
    diagEMG: false, diagEMGNotes: "",
    diagArthroscopy: false, diagArthroscopyNotes: "",
    diagGaitAnalysis: false, diagGaitAnalysisNotes: "",
    diagForcePlate: false, diagForcePlateNotes: "",
    diagROM: false, diagROMNotes: "",
    diagOtherDiag: false, diagOtherNotes: ""
  });
  const [weightWarning, setWeightWarning] = useState("");

  // ── Auto-save form to localStorage ──
  const FORM_STORAGE_KEY = "k9rehab_intake_draft";
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) { /* ignore parse errors */ }
  }, []);
  useEffect(() => {
    // Only persist if the form has meaningful data (at least a patient name)
    if (form.patientName || form.clientName || form.diagnosis) {
      try { localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form)); } catch (e) { /* quota exceeded */ }
    }
  }, [form]);
  const clearSavedForm = () => { try { localStorage.removeItem(FORM_STORAGE_KEY); } catch (e) { /* */ } };

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Navigate wizard steps and scroll to top
  const goToStep = (step) => {
    setWizardStep(step);
    // Scroll the content area to top
    setTimeout(() => {
      const el = document.querySelector('[data-content-scroll]');
      if (el) el.scrollTop = 0;
    }, 50);
  };

  // ── Weight conversion (KG ↔ LBS) with dosing safety warnings ──
  const validateWeight = (kg) => {
    const lbs = kg * 2.20462;
    const warnings = [];
    // Extreme outlier — likely entered LBS in KG field
    if (kg > 90) {
      warnings.push(`CRITICAL: ${kg} kg = ${lbs.toFixed(0)} lbs. Did you enter LBS in the KG field? This exceeds the weight of any known dog breed. Incorrect weight will cause medication dosing errors.`);
    }
    // Very heavy but possible (Great Dane, Mastiff, Saint Bernard)
    else if (kg > 70) {
      warnings.push(`Caution: ${kg} kg (${lbs.toFixed(0)} lbs) is very heavy. Confirm this is correct — only giant breeds (Mastiff, Great Dane, Saint Bernard) typically exceed 70 kg. Accurate weight is critical for safe drug dosing.`);
    }
    // Suspiciously low — possibly entered KG in LBS field
    else if (kg > 0 && kg < 1) {
      warnings.push(`Warning: ${kg} kg = ${lbs.toFixed(1)} lbs — extremely low. Did you enter KG correctly? Neonates only. Verify before calculating drug doses.`);
    }
    // Common error: LBS entered in KG field for medium dogs
    else if (kg > 45 && kg <= 70) {
      warnings.push(`Note: ${kg} kg = ${lbs.toFixed(0)} lbs. This is in the large/giant breed range. If this is a medium breed, you may have entered LBS in the KG field.`);
    }
    return warnings.length > 0 ? warnings.join(" ") : "";
  };

  const handleWeightKg = (val) => {
    setField("weightKg", val);
    const kg = parseFloat(val);
    if (!isNaN(kg) && kg > 0) {
      setField("weightLbs", (kg * 2.20462).toFixed(1));
      setWeightWarning(validateWeight(kg));
    } else {
      setField("weightLbs", "");
      setWeightWarning("");
    }
  };

  const handleWeightLbs = (val) => {
    setField("weightLbs", val);
    const lbs = parseFloat(val);
    if (!isNaN(lbs) && lbs > 0) {
      const kg = lbs / 2.20462;
      setField("weightKg", kg.toFixed(1));
      // Check if LBS value seems wrong (entered KG in LBS field)
      if (lbs < 2) {
        setWeightWarning(`Warning: ${lbs} lbs = ${kg.toFixed(2)} kg — extremely low. Did you enter KG in the LBS field? Verify before calculating drug doses.`);
      } else if (lbs > 200) {
        setWeightWarning(`CRITICAL: ${lbs} lbs = ${kg.toFixed(1)} kg. No known dog breed exceeds 200 lbs. Please verify. Incorrect weight will cause medication dosing errors.`);
      } else {
        setWeightWarning(validateWeight(kg));
      }
    } else {
      setField("weightKg", "");
      setWeightWarning("");
    }
  };

  // ── DOB ↔ Age bidirectional ──
  const handleDob = (val) => {
    setField("dob", val);
    if (val) {
      const birth = new Date(val + "T00:00:00");
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years--;
      if (years < 0) years = 0;
      setField("age", String(years));
    } else {
      setField("age", "");
    }
  };
  const handleAge = (val) => {
    setField("age", val);
    const years = parseInt(val);
    if (!isNaN(years) && years >= 0 && years <= 30) {
      const now = new Date();
      const birthYear = now.getFullYear() - years;
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      setField("dob", `${birthYear}-${month}-${day}`);
    } else if (val === "") {
      setField("dob", "");
    }
  };

  // ── Surgery Date ↔ POD bidirectional + auto suture removal ──
  const handleSurgeryDate = (val) => {
    setField("surgeryDate", val);
    if (val) {
      const surgDate = new Date(val + "T00:00:00");
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffMs = now.getTime() - surgDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      setField("postOpDay", String(Math.max(0, diffDays)));
      // Auto-generate suture removal date: 10-14 days post-op (standard = 14 days for dogs)
      const sutureDate = new Date(surgDate);
      sutureDate.setDate(sutureDate.getDate() + 14);
      const yr = sutureDate.getFullYear();
      const mo = String(sutureDate.getMonth() + 1).padStart(2, "0");
      const dy = String(sutureDate.getDate()).padStart(2, "0");
      setField("sutureRemovalDate", `${yr}-${mo}-${dy}`);
    } else {
      setField("postOpDay", "");
      setField("sutureRemovalDate", "");
    }
  };
  const handlePostOpDay = (val) => {
    setField("postOpDay", val);
    const days = parseInt(val);
    if (!isNaN(days) && days >= 0) {
      const surgDate = new Date();
      surgDate.setDate(surgDate.getDate() - days);
      const yr = surgDate.getFullYear();
      const mo = String(surgDate.getMonth() + 1).padStart(2, "0");
      const dy = String(surgDate.getDate()).padStart(2, "0");
      setField("surgeryDate", `${yr}-${mo}-${dy}`);
      // Auto-generate suture removal date: 14 days from surgery
      const sutureDate = new Date(surgDate);
      sutureDate.setDate(sutureDate.getDate() + 14);
      const syr = sutureDate.getFullYear();
      const smo = String(sutureDate.getMonth() + 1).padStart(2, "0");
      const sdy = String(sutureDate.getDate()).padStart(2, "0");
      setField("sutureRemovalDate", `${syr}-${smo}-${sdy}`);
    } else if (val === "") {
      setField("surgeryDate", "");
      setField("sutureRemovalDate", "");
    }
  };

  // ── ZIP code → City/State auto-fill ──
  const handleZip = async (val) => {
    setField("zipCode", val);
    if (val.length === 5 && /^\d{5}$/.test(val)) {
      try {
        const r = await fetch(`https://api.zippopotam.us/us/${val}`);
        if (r.ok) {
          const data = await r.json();
          const place = data.places?.[0];
          if (place) {
            setField("city", place["place name"]);
            setField("state", place["state abbreviation"]);
          }
        }
      } catch {}
    }
  };

  // ── Breed list (top 50+ most common) ──
  const BREEDS = [
    "Akita","Australian Cattle Dog","Australian Shepherd",
    "Basset Hound","Beagle","Belgian Malinois","Bernese Mountain Dog","Bichon Frise","Bloodhound",
    "Border Collie","Boston Terrier","Boxer","Brittany","Bulldog",
    "Cane Corso","Cavalier King Charles Spaniel","Chesapeake Bay Retriever","Chihuahua","Cocker Spaniel","Collie",
    "Dachshund","Doberman Pinscher",
    "English Springer Spaniel",
    "French Bulldog",
    "German Shepherd","German Shorthaired Pointer","Golden Retriever","Great Dane","Greyhound",
    "Havanese",
    "Irish Setter",
    "Jack Russell Terrier",
    "Labrador Retriever",
    "Maltese","Mastiff","Miniature American Shepherd","Miniature Schnauzer",
    "Newfoundland",
    "Pembroke Welsh Corgi","Pit Bull Terrier","Pomeranian","Poodle (Miniature)","Poodle (Standard)",
    "Rhodesian Ridgeback","Rottweiler",
    "Saint Bernard","Shetland Sheepdog","Shih Tzu","Siberian Husky","Staffordshire Bull Terrier",
    "Vizsla",
    "Weimaraner","West Highland White Terrier",
    "Yorkshire Terrier",
    "Mixed Breed / Other"
  ];

  // ── Nearby hospitals (populated after ZIP) ──
  const HOSPITALS = [
    "BluePearl Pet Hospital","VCA Animal Hospital","Banfield Pet Hospital",
    "MedVet Medical & Cancer Center","Animal Emergency Center","ASPCA Animal Hospital",
    "Red Bank Veterinary Hospital","Angell Animal Medical Center","Gulf Coast Veterinary Specialists",
    "University of Pennsylvania — Ryan Veterinary Hospital","Colorado State University VTH",
    "Cornell University Hospital for Animals","UC Davis VMTH","Ohio State University VMC",
    "University of Florida Small Animal Hospital","Tufts Cummings School — Foster Hospital",
    "North Carolina State University VH","University of Tennessee VTH",
    "Texas A&M Small Animal Hospital","Purdue University VTH"
  ];

  const CONDITIONS = {
    "Stifle (Knee)": [
      { value: "TPLO",              label: "TPLO — Tibial Plateau Leveling Osteotomy" },
      { value: "TTA",               label: "TTA — Tibial Tuberosity Advancement" },
      { value: "CCL Conservative",  label: "CCL — Conservative Management" },
      { value: "Lateral Suture",    label: "Lateral Suture Stabilization" },
      { value: "Meniscal Injury",   label: "Meniscal Tear / Injury" },
      { value: "Patellar Luxation", label: "Patellar Luxation (Medial/Lateral)" },
      { value: "Stifle OA",        label: "Stifle Osteoarthritis" },
    ],
    "Hip": [
      { value: "FHO",              label: "FHO — Femoral Head Ostectomy" },
      { value: "Hip Dysplasia",    label: "Hip Dysplasia" },
      { value: "THR",              label: "THR — Total Hip Replacement" },
      { value: "Hip Luxation",     label: "Hip Luxation (Traumatic)" },
      { value: "Legg-Calve-Perthes", label: "Legg-Calvé-Perthes Disease" },
      { value: "Hip OA",           label: "Hip Osteoarthritis" },
    ],
    "Elbow & Shoulder": [
      { value: "Elbow Dysplasia",    label: "Elbow Dysplasia" },
      { value: "FCP",                label: "FCP — Fragmented Coronoid Process" },
      { value: "UAP",                label: "UAP — Ununited Anconeal Process" },
      { value: "Shoulder OCD",       label: "Shoulder OCD — Osteochondritis Dissecans" },
      { value: "Biceps Tenosynovitis", label: "Biceps Tenosynovitis" },
      { value: "Medial Shoulder Instability", label: "Medial Shoulder Instability" },
      { value: "Elbow OA",          label: "Elbow Osteoarthritis" },
      { value: "Shoulder Luxation",  label: "Shoulder Luxation" },
    ],
    "Spine & Neurological": [
      { value: "IVDD",                label: "IVDD — Intervertebral Disc Disease" },
      { value: "FCE",                 label: "FCE — Fibrocartilaginous Embolism" },
      { value: "Degenerative Myelopathy", label: "Degenerative Myelopathy (DM)" },
      { value: "Lumbosacral Stenosis", label: "Lumbosacral Stenosis / Cauda Equina" },
      { value: "Cervical Spondylomyelopathy", label: "Wobbler Syndrome (CSM)" },
      { value: "Spinal Fracture",     label: "Spinal Fracture / Luxation" },
      { value: "Vestibular Disease",   label: "Vestibular Disease" },
      { value: "Peripheral Neuropathy", label: "Peripheral Neuropathy" },
    ],
    "Fractures & Trauma": [
      { value: "Femoral Fracture",     label: "Femoral Fracture" },
      { value: "Tibial Fracture",      label: "Tibial Fracture" },
      { value: "Humeral Fracture",     label: "Humeral Fracture" },
      { value: "Radial Fracture",      label: "Radius / Ulna Fracture" },
      { value: "Pelvic Fracture",      label: "Pelvic Fracture" },
      { value: "Carpal/Tarsal Injury", label: "Carpal / Tarsal Injury" },
      { value: "Polytrauma",           label: "Polytrauma — Multiple Injuries" },
    ],
    "Soft Tissue & Tendon": [
      { value: "Achilles Rupture",     label: "Achilles Tendon Rupture" },
      { value: "Iliopsoas Strain",     label: "Iliopsoas Muscle Strain" },
      { value: "Gracilis Contracture", label: "Gracilis / Semitendinosus Contracture" },
      { value: "Infraspinatus Contracture", label: "Infraspinatus Contracture" },
      { value: "Muscle Strain",        label: "Muscle Strain / Tear (General)" },
      { value: "Ligament Sprain",      label: "Ligament Sprain (Non-CCL)" },
    ],
    "Multi-Joint / Geriatric / Other": [
      { value: "Osteoarthritis",       label: "Multi-Joint Osteoarthritis" },
      { value: "Geriatric Mobility",   label: "Geriatric Mobility Program" },
      { value: "Obesity Rehab",        label: "Obesity / Weight Management Program" },
      { value: "Post-Amputation",      label: "Post-Amputation Rehab" },
      { value: "Immune-Mediated Polyarthritis", label: "Immune-Mediated Polyarthritis" },
      { value: "Fibrotic Myopathy",    label: "Fibrotic Myopathy" },
      { value: "Conditioning",         label: "Fitness / Conditioning Program" },
      { value: "Palliative",           label: "Palliative / Comfort Care" },
    ],
  };

  const REGIONS = [
    "Left Stifle", "Right Stifle", "Bilateral Stifle",
    "Left Hip", "Right Hip", "Bilateral Hip",
    "Left Elbow", "Right Elbow", "Left Shoulder", "Right Shoulder",
    "Left Carpus", "Right Carpus", "Left Tarsus/Hock", "Right Tarsus/Hock",
    "Cervical Spine", "Thoracolumbar Spine", "Lumbosacral Spine",
    "Multiple Joints", "Generalized"
  ];

  useEffect(() => {
    axios.get(`${API}/exercises`).then(r => setAllExercises(r.data?.data || r.data || [])).catch(() => {});
  }, []);

  const generate = async () => {
    if (!form.patientName.trim()) { setError("Patient name is required"); return; }
    if (!form.diagnosis) { setError("Please select a diagnosis"); return; }
    if (!form.affectedRegion) { setError("Please select an affected region"); return; }
    if (!form.treatmentApproach) { setError("Please select a treatment approach (Surgical, Conservative, or Palliative)"); return; }
    if (!complianceAgreed) { setError("Please acknowledge the Compliance & Data Protection Notice"); return; }

    setLoading(true); setShowVideo(true); setError(null); setProtocol(null);

    // Video plays full duration (8s) + 3s pause on last frame = 11s minimum
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
      clearSavedForm(); // Clear draft after successful generation
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate protocol");
    } finally { setLoading(false); setShowVideo(false); }
  };

  const removeExercise = (weekIdx, exIdx) => {
    setProtocol(prev => {
      const updated = { ...prev, weeks: prev.weeks.map((w, i) =>
        i === weekIdx ? { ...w, exercises: w.exercises.filter((_, j) => j !== exIdx) } : w
      )};
      return updated;
    });
  };

  const addExercise = (weekIdx, ex) => {
    setProtocol(prev => {
      const updated = { ...prev, weeks: prev.weeks.map((w, i) =>
        i === weekIdx ? { ...w, exercises: [...w.exercises, {
          exercise: ex, code: ex.code, name: ex.name, category: ex.category,
          sets: 3, reps: 10, frequency: "2x daily", duration_minutes: 10,
          equipment: ex.equipment, setup: ex.setup, steps: ex.steps,
          good_form: ex.good_form, common_mistakes: ex.common_mistakes,
          red_flags: ex.red_flags, progression: ex.progression,
          contraindications: ex.contraindications,
          notes: "Added manually by clinician"
        }] } : w
      )};
      return updated;
    });
    setShowAddModal(false);
    setExSearch("");
  };

  const filteredEx = allExercises.filter(e =>
    e.name.toLowerCase().includes(exSearch.toLowerCase()) ||
    e.category?.toLowerCase().includes(exSearch.toLowerCase())
  );

  // Section header component for the intake form
  const SectionHead = ({ icon: Icon, title }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={S.sectionHeader()}>
        <Icon size={12} style={{ color: "#39FF7E" }} /> {title}
      </div>
      <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1, marginTop: 2 }}>
        <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
      </div>
    </div>
  );

  // Wizard progress bar
  const WizardProgress = () => {
    const steps = [
      { num: 1, label: "Client & Patient" },
      { num: 2, label: "Clinical Assessment" },
      { num: 3, label: "Treatment Plan" },
      { num: 4, label: "Protocol Parameters" },
    ];
    return (
      <>
        <style>{`
          @keyframes wizardPulse {
            0%, 100% { box-shadow: 0 0 8px rgba(57,255,126,0.5), 0 0 18px rgba(57,255,126,0.2); }
            50% { box-shadow: 0 0 14px rgba(57,255,126,0.7), 0 0 28px rgba(57,255,126,0.35), 0 0 40px rgba(57,255,126,0.1); }
          }
          @keyframes neonFlatline {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div style={S.wizardProgress}>
          {steps.map((s, i) => {
            const state = wizardStep > s.num ? "done" : wizardStep === s.num ? "active" : "pending";
            return (
              <React.Fragment key={s.num}>
                {i > 0 && <div style={S.wizardLine(wizardStep > s.num)} />}
                <div style={S.wizardStep(state)}
                  onClick={() => goToStep(s.num)}>
                  <div style={S.wizardDot(state)}>
                    {state === "done" ? <FiCheckCircle size={16} /> : s.num}
                  </div>
                  <span>{s.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </>
    );
  };

  // ── Full-screen video while generating ──
  if (showVideo) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <video
          src="/loading-animation.mp4"
          autoPlay
          muted
          playsInline
          style={{
            width: "100vw", height: "100vh",
            objectFit: "contain",
          }}
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

  // ── API still working after video skipped — compact spinner ──
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "4px solid #E2E8F0", borderTopColor: "#10B981",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F4C81" }}>Generating Protocol...</div>
        <div style={{ fontSize: 11, color: "#fff" }}>Building your evidence-based exercise program</div>
      </div>
    );
  }

  return (
    <div>
      {/* Wizard progress bar — visible during intake steps */}
      {!protocol && <WizardProgress />}

      {/* ═══════════ STEP 1: CLIENT & PATIENT INFO ═══════════ */}
      {!protocol && wizardStep === 1 && (<>

      {/* ═══════════ SECTION 1: CLIENT INFORMATION ═══════════ */}
      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiUsers} title="Section 1 — Client Information" />
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>Client / Owner Name</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.clientName} onChange={e => setField("clientName", e.target.value)} placeholder="Last, First" />
          </div>
          <div>
            <label style={S.label}>Email Address</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="email" value={form.clientEmail} onChange={e => setField("clientEmail", e.target.value)} placeholder="client@email.com" />
          </div>
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Phone Number</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.clientPhone} onChange={e => setField("clientPhone", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label style={S.label}>Secondary Phone (Optional)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.clientPhone2} onChange={e => setField("clientPhone2", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label style={S.label}>Referring Veterinarian</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.referringVet} onChange={e => setField("referringVet", e.target.value)} placeholder="DVM Name, Practice" />
          </div>
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Referring Clinic Phone</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.referringClinicPhone} onChange={e => setField("referringClinicPhone", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label style={S.label}>Referring Clinic Email</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="email" value={form.referringClinicEmail} onChange={e => setField("referringClinicEmail", e.target.value)} placeholder="clinic@email.com" />
          </div>
          <div />
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Treating Clinician / Therapist <span style={{color:"#F87171"}}>*</span></label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.treatingClinician} onChange={e => setField("treatingClinician", e.target.value)} placeholder="Dr. Jane Smith" />
          </div>
          <div>
            <label style={S.label}>Credentials</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.clinicianCredentials} onChange={e => setField("clinicianCredentials", e.target.value)}>
              <option value="">— Select —</option>
              <option value="DVM, CCRP">DVM, CCRP</option>
              <option value="DVM, CCRT">DVM, CCRT</option>
              <option value="DVM, DACVSMR">DVM, DACVSMR</option>
              <option value="DVM">DVM</option>
              <option value="PT, CCRT">PT, CCRT</option>
              <option value="VTS (Physical Rehabilitation)">VTS (Physical Rehabilitation)</option>
              <option value="CVT, CCRP">CVT, CCRP</option>
              <option value="RVT, CCRT">RVT, CCRT</option>
            </select>
          </div>
          <div />
        </div>
        <div style={{ ...S.grid(4), marginTop: 12 }}>
          <div style={{ gridColumn: "1 / 3" }}>
            <label style={S.label}>Mailing Address</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.mailingAddress} onChange={e => setField("mailingAddress", e.target.value)} placeholder="Street Address" />
          </div>
          <div>
            <label style={S.label}>ZIP Code</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 120 }} value={form.zipCode} onChange={e => handleZip(e.target.value)} placeholder="00000" maxLength={5} />
          </div>
          <div />
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>City</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", background: form.city ? "#F0FFF4" : C.surface }} value={form.city} onChange={e => setField("city", e.target.value)} placeholder="Auto-filled from ZIP" />
          </div>
          <div>
            <label style={S.label}>State</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 80, background: form.state ? "#F0FFF4" : C.surface }} value={form.state} onChange={e => setField("state", e.target.value)} placeholder="ST" />
          </div>
          <div>
            <label style={S.label}>Nearby Veterinary Hospital</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.nearbyHospital} onChange={e => setField("nearbyHospital", e.target.value)}>
              <option value="">— Select Hospital —</option>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {/* ── Insurance / Billing ── */}
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Insurance Provider (Optional)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.insuranceProvider} onChange={e => setField("insuranceProvider", e.target.value)} placeholder="e.g. Trupanion, Nationwide, ASPCA" />
          </div>
          <div>
            <label style={S.label}>Policy Number</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.insurancePolicyNumber} onChange={e => setField("insurancePolicyNumber", e.target.value)} placeholder="Policy #" />
          </div>
          <div>
            <label style={S.label}>Payment Method</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.paymentMethod} onChange={e => setField("paymentMethod", e.target.value)}>
              <option value="">— Select —</option>
              <option value="Insurance">Insurance</option>
              <option value="Self-Pay">Self-Pay</option>
              <option value="Payment Plan">Payment Plan</option>
              <option value="University/Teaching Hospital">University / Teaching Hospital</option>
              <option value="Corporate Account">Corporate Account</option>
            </select>
          </div>
        </div>

        {/* ── Client Consent / Authorization ── */}
        <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(14,165,233,0.06)", border: "1.5px solid rgba(14,165,233,0.25)", borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Client Consent & Authorization
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              padding: "8px 14px", background: form.clientConsentObtained ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
              border: form.clientConsentObtained ? "1.5px solid #10B981" : "1.5px solid #3A4A5C", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
              transition: "all 0.2s", flex: 1 }}>
              <input type="checkbox" checked={form.clientConsentObtained} onChange={e => setField("clientConsentObtained", e.target.checked)}
                style={{ accentColor: "#10B981", width: 16, height: 16, cursor: "pointer" }} />
              Client informed of rehabilitation plan, risks, alternatives, and estimated costs. Verbal/written consent obtained.
            </label>
            <div style={{ minWidth: 160 }}>
              <label style={S.label}>Consent Date</label>
              <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="date" value={form.clientConsentDate} onChange={e => setField("clientConsentDate", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 2: PATIENT SIGNALMENT ═══════════ */}
      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={TbDog} title="Section 2 — Patient Signalment" />
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Patient Name <span style={{color:"#F87171"}}>*</span></label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.patientName}
              onChange={e => setField("patientName", e.target.value)} placeholder="Patient Name" />
          </div>
          <div>
            <label style={S.label}>Sex</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.sex} onChange={e => setField("sex", e.target.value)}>
              <option value="Male Intact">♂ Male Intact</option>
              <option value="Male Neutered">♂ Male Neutered</option>
              <option value="Female Intact">♀ Female Intact</option>
              <option value="Female Spayed">♀ Female Spayed</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Breed</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.breed} onChange={e => setField("breed", e.target.value)}>
              <option value="">— Select Breed —</option>
              {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ ...S.grid(4), marginTop: 12 }}>
          <div>
            <label style={S.label}>Date of Birth</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="date" value={form.dob} onChange={e => handleDob(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Age (Years)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 80 }} type="number" min="0" max="25" step="1" value={form.age}
              onChange={e => handleAge(e.target.value)} onInput={e => handleAge(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={S.label}>Weight (KG)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 100 }} type="number" min="0" step="0.5" value={form.weightKg}
              onChange={e => handleWeightKg(e.target.value)} onInput={e => handleWeightKg(e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <label style={S.label}>Weight (LBS)</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C", maxWidth: 100 }} type="number" min="0" step="1" value={form.weightLbs}
              onChange={e => handleWeightLbs(e.target.value)} onInput={e => handleWeightLbs(e.target.value)} placeholder="0.0" />
          </div>
        </div>
        {weightWarning && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10, marginTop: 10, padding: "12px 16px",
            background: weightWarning.includes("CRITICAL") ? "#FEE2E2" : "#FEF3C7",
            border: weightWarning.includes("CRITICAL") ? "2px solid #DC2626" : "1.5px solid #D97706",
            borderRadius: 8,
          }}>
            <FiAlertTriangle size={18} style={{
              color: weightWarning.includes("CRITICAL") ? "#DC2626" : "#D97706",
              flexShrink: 0, marginTop: 2
            }} />
            <div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: weightWarning.includes("CRITICAL") ? "#991B1B" : "#92400E",
                marginBottom: 2,
              }}>
                {weightWarning.includes("CRITICAL") ? "DOSING SAFETY ALERT" : "Weight Verification Needed"}
              </div>
              <span style={{
                fontSize: 11, lineHeight: 1.5,
                color: weightWarning.includes("CRITICAL") ? "#991B1B" : "#92400E",
                fontWeight: 500,
              }}>{weightWarning}</span>
            </div>
          </div>
        )}
        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Current Medications</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.currentMedications} onChange={e => setField("currentMedications", e.target.value)}
              placeholder="e.g. Carprofen 75mg BID, Gabapentin 100mg TID" />
          </div>
          <div>
            <label style={S.label}>Medications Last Given</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.medsLastGiven} onChange={e => setField("medsLastGiven", e.target.value)}
              placeholder="e.g. Today 8:00 AM, Yesterday PM" />
          </div>
        </div>
        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Allergies / Sensitivities</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.allergies} onChange={e => setField("allergies", e.target.value)}
              placeholder="e.g. NSAID sensitivity, latex, adhesive tape, bee stings" />
          </div>
          <div>
            <label style={S.label}>Patient Temperament</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.temperament} onChange={e => setField("temperament", e.target.value)}>
              <option value="Cooperative">Cooperative — Tolerates handling well</option>
              <option value="Anxious">Anxious — Nervous, needs slow approach</option>
              <option value="Fearful">Fearful — May require desensitization</option>
              <option value="Reactive">Reactive — May snap/bite under stress</option>
              <option value="Aggressive">Aggressive — Muzzle required for handling</option>
              <option value="Sedation Required">Sedation Required — Cannot safely handle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Next button with neon glow */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 0" }}>
        <button
          style={{
            background: "#1E5A8A", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,0.5), 0 0 40px rgba(14,165,233,0.2)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)"}
          onClick={() => goToStep(2)}
        >
          Next: Clinical Assessment <FiChevronRight size={16} />
        </button>
      </div>

      </>)}

      {/* ═══════════ STEP 2: CLINICAL ASSESSMENT ═══════════ */}
      {!protocol && wizardStep === 2 && (<>

      {/* ═══════════ SECTION 2: CLINICAL ASSESSMENT ═══════════ */}
      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiActivity} title="Section 2 — Clinical Assessment" />
        <div style={S.grid(2)}>
          <div>
            <label style={S.label}>Primary Diagnosis *</label>
            <select style={{ ...S.select, width: "100%", fontWeight: 600, border: "1.5px solid #3A4A5C" }} value={form.diagnosis} onChange={e => setField("diagnosis", e.target.value)}>
              <option value="">— Select Diagnosis —</option>
              {Object.entries(CONDITIONS).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Affected Region <span style={{color:"#F87171"}}>*</span></label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.affectedRegion} onChange={e => setField("affectedRegion", e.target.value)}>
              <option value="">— Select Region —</option>
              <optgroup label="Hind Limb">{REGIONS.filter(r => r.includes("Stifle") || r.includes("Hip") || r.includes("Tarsus")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Forelimb">{REGIONS.filter(r => r.includes("Elbow") || r.includes("Shoulder") || r.includes("Carpus")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Spine">{REGIONS.filter(r => r.includes("Spine")).map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Other">{REGIONS.filter(r => r === "Multiple Joints" || r === "Generalized").map(r => <option key={r}>{r}</option>)}</optgroup>
            </select>
          </div>
        </div>

        {/* Scoring row — visual scales */}
        <div style={{ ...S.grid(3), marginTop: 16 }}>
          <div>
            <label style={S.label}>Pain Level (0–10 VAS) <span style={{color:"#F87171"}}>*</span></label>
            {form.painLevel === "" ? (
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C", color: "#94A3B8" }} value="" onChange={e => setField("painLevel", e.target.value)}>
                <option value="" disabled>— Assess Pain Level —</option>
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={String(n)}>{n} — {n === 0 ? "No pain" : n <= 3 ? "Mild" : n <= 6 ? "Moderate" : n <= 8 ? "Severe" : "Extreme"}</option>)}
              </select>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input style={{ ...S.input, flex: 1, border: "1.5px solid #3A4A5C" }} type="range" min="0" max="10" value={form.painLevel}
                  onChange={e => setField("painLevel", e.target.value)} />
                <span style={{
                  fontSize: 14, fontWeight: 700, minWidth: 38, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                  background: +form.painLevel <= 3 ? C.greenBg : +form.painLevel <= 6 ? C.amberBg : C.redBg,
                  color: +form.painLevel <= 3 ? C.green : +form.painLevel <= 6 ? C.amber : C.red,
                }}>
                  {form.painLevel}/10
                </span>
              </div>
            )}
          </div>
          <div>
            <label style={S.label}>Lameness Grade (0–5 LOAD) <span style={{color:"#F87171"}}>*</span></label>
            {form.lamenessGrade === "" ? (
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C", color: "#94A3B8" }} value="" onChange={e => setField("lamenessGrade", e.target.value)}>
                <option value="" disabled>— Assess Lameness —</option>
                {[0,1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n} — {n === 0 ? "Sound" : n === 1 ? "Subtle" : n === 2 ? "Mild" : n === 3 ? "Moderate" : n === 4 ? "Severe" : "Non-weight-bearing"}</option>)}
              </select>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input style={{ ...S.input, flex: 1, border: "1.5px solid #3A4A5C" }} type="range" min="0" max="5" value={form.lamenessGrade}
                  onChange={e => setField("lamenessGrade", e.target.value)} />
                <span style={{
                  fontSize: 14, fontWeight: 700, minWidth: 32, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                  background: +form.lamenessGrade <= 1 ? C.greenBg : +form.lamenessGrade <= 3 ? C.amberBg : C.redBg,
                  color: +form.lamenessGrade <= 1 ? C.green : +form.lamenessGrade <= 3 ? C.amber : C.red,
                }}>
                  {form.lamenessGrade}/5
                </span>
              </div>
            )}
          </div>
          <div>
            <label style={S.label}>Mobility Status <span style={{color:"#F87171"}}>*</span></label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.mobilityLevel} onChange={e => setField("mobilityLevel", e.target.value)}>
              <option value="">— Assess Mobility —</option>
              <option value="Non-ambulatory">Non-ambulatory (0 — no voluntary movement)</option>
              <option value="Limited">Limited (1 — assisted standing/stepping)</option>
              <option value="Moderate">Moderate (2 — ambulatory with deficits)</option>
              <option value="Good">Good (3 — ambulatory, mild impairment)</option>
              <option value="Full">Full (4 — normal gait, conditioning focus)</option>
            </select>
          </div>
        </div>

        {/* ── Gait Assessment Descriptors (ACVSMR standard) ── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Gait & Posture Assessment
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Gait Pattern Descriptors (select all that apply)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Circumducting", "Bunny-hopping", "Knuckling", "Toe-dragging", "Crossing over", "Short-striding", "Weight-shifting", "Ataxic", "Spastic", "Hypermetric", "Scuffing", "Head bob"].map(desc => (
                <label key={desc} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#fff",
                  background: (form.gaitDescriptors || []).includes(desc) ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                  border: (form.gaitDescriptors || []).includes(desc) ? "1.5px solid #0EA5E9" : "1.5px solid #3A4A5C",
                  transition: "all 0.2s",
                }}>
                  <input type="checkbox" checked={(form.gaitDescriptors || []).includes(desc)}
                    onChange={e => {
                      const arr = [...(form.gaitDescriptors || [])];
                      if (e.target.checked) arr.push(desc); else arr.splice(arr.indexOf(desc), 1);
                      setField("gaitDescriptors", arr);
                    }}
                    style={{ accentColor: "#0EA5E9", width: 13, height: 13, cursor: "pointer" }} />
                  {desc}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={S.label}>Postural Assessment (select all that apply)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Kyphosis", "Lordosis", "Head-down stance", "Base-wide stance", "Base-narrow stance", "Weight shifted cranially", "Weight shifted caudally", "Trunk lean", "Pelvic tilt", "Normal posture"].map(desc => (
                <label key={desc} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#fff",
                  background: (form.postureFindings || []).includes(desc) ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                  border: (form.postureFindings || []).includes(desc) ? "1.5px solid #0EA5E9" : "1.5px solid #3A4A5C",
                  transition: "all 0.2s",
                }}>
                  <input type="checkbox" checked={(form.postureFindings || []).includes(desc)}
                    onChange={e => {
                      const arr = [...(form.postureFindings || [])];
                      if (e.target.checked) arr.push(desc); else arr.splice(arr.indexOf(desc), 1);
                      setField("postureFindings", arr);
                    }}
                    style={{ accentColor: "#0EA5E9", width: 13, height: 13, cursor: "pointer" }} />
                  {desc}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body Condition Score (moved from Signalment — clinical assessment) ── */}
        <div style={{ ...S.grid(2), marginTop: 16 }}>
          <div>
            <label style={S.label}>Body Condition Score (1–9 WSAVA Scale)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input style={{ ...S.input, flex: 1, border: "1.5px solid #3A4A5C" }} type="range" min="1" max="9" value={form.bodyConditionScore}
                onChange={e => setField("bodyConditionScore", e.target.value)} />
              <span style={{
                fontSize: 14, fontWeight: 700, minWidth: 40, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                background: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? "rgba(16,185,129,0.15)" : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)",
                color: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? "#6EE7B7" : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? "#FCD34D" : "#FCA5A5",
              }}>{form.bodyConditionScore}/9</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              padding: "10px 14px", borderRadius: 8, width: "100%",
              background: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? "rgba(16,185,129,0.12)" : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
              border: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? "1px solid rgba(16,185,129,0.3)" : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: (+form.bodyConditionScore >= 4 && +form.bodyConditionScore <= 5) ? "#6EE7B7" : (+form.bodyConditionScore === 3 || (+form.bodyConditionScore >= 6 && +form.bodyConditionScore <= 7)) ? "#FCD34D" : "#FCA5A5" }}>
                {+form.bodyConditionScore <= 2 ? "Emaciated — Rule out chronic disease, caloric supplementation required" :
                 +form.bodyConditionScore === 3 ? "Underweight — Nutritional assessment recommended, adjust caloric intake" :
                 +form.bodyConditionScore <= 5 ? "Ideal Body Condition — Maintain current nutrition plan" :
                 +form.bodyConditionScore <= 7 ? "Overweight — Weight management recommended, joint protection priority" :
                 "Obese — Formal weight loss protocol required, avoid impact loading"}
              </div>
              <div style={{ fontSize: 9, color: "#fff", marginTop: 4 }}>
                {+form.bodyConditionScore <= 3 ? "Consider metabolic workup if weight loss is unexplained" :
                 +form.bodyConditionScore <= 5 ? "Optimal for rehabilitation progression" :
                 +form.bodyConditionScore <= 7 ? "Excess weight increases joint stress — aquatic therapy preferred" :
                 "Obesity significantly impairs recovery — concurrent weight management essential"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Objective Measurements (Millis & Levine) ── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Objective Measurements
          </div>
          {/* Limb Circumference */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Limb Circumference (cm) — Measure bilaterally at consistent landmark</div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Measurement Site</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.circumferenceSite} onChange={e => setField("circumferenceSite", e.target.value)}>
                  <option value="15cm proximal to patella">15cm proximal to patella (standard)</option>
                  <option value="10cm proximal to patella">10cm proximal to patella</option>
                  <option value="Mid-thigh">Mid-thigh</option>
                  <option value="Mid-antebrachium">Mid-antebrachium (forearm)</option>
                  <option value="Mid-crus">Mid-crus (below stifle)</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Affected Limb (cm)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="number" step="0.1" min="0" value={form.circumferenceAffected}
                  onChange={e => setField("circumferenceAffected", e.target.value)} placeholder="e.g. 32.5" />
              </div>
              <div>
                <label style={S.label}>Contralateral Limb (cm)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="number" step="0.1" min="0" value={form.circumferenceContralateral}
                  onChange={e => setField("circumferenceContralateral", e.target.value)} placeholder="e.g. 36.0" />
              </div>
            </div>
            {form.circumferenceAffected && form.circumferenceContralateral && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 6,
                background: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? "rgba(220,38,38,0.15)" : "rgba(16,185,129,0.15)",
                color: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? "#FCA5A5" : "#6EE7B7",
                border: Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 ? "1px solid rgba(220,38,38,0.3)" : "1px solid rgba(16,185,129,0.3)",
              }}>
                Difference: {Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)).toFixed(1)} cm
                ({((Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) / parseFloat(form.circumferenceContralateral)) * 100).toFixed(1)}% asymmetry)
                {Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)) > 2 && " — Significant muscle atrophy detected"}
              </div>
            )}
          </div>
          {/* Joint Range of Motion */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Joint Range of Motion (Goniometry — degrees)</div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Joint Measured</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.romJoint} onChange={e => setField("romJoint", e.target.value)}>
                  <option value="">— Select Joint —</option>
                  <option value="Stifle">Stifle (Knee)</option>
                  <option value="Hip">Hip</option>
                  <option value="Elbow">Elbow</option>
                  <option value="Shoulder">Shoulder</option>
                  <option value="Hock/Tarsus">Hock / Tarsus</option>
                  <option value="Carpus">Carpus (Wrist)</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Flexion (°)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="number" min="0" max="180" value={form.romFlexion}
                  onChange={e => setField("romFlexion", e.target.value)} placeholder="e.g. 42" />
              </div>
              <div>
                <label style={S.label}>Extension (°)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} type="number" min="0" max="180" value={form.romExtension}
                  onChange={e => setField("romExtension", e.target.value)} placeholder="e.g. 162" />
              </div>
            </div>
          </div>
          {/* Muscle Condition & Effusion */}
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Muscle Condition (Affected Limb)</label>
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.muscleCondition} onChange={e => setField("muscleCondition", e.target.value)}>
                <option value="Normal">Normal — Symmetric muscle mass</option>
                <option value="Mild Atrophy">Mild Atrophy — Slight decrease, palpable</option>
                <option value="Moderate Atrophy">Moderate Atrophy — Visible asymmetry</option>
                <option value="Severe Atrophy">Severe Atrophy — Marked wasting, bony prominences</option>
                <option value="Fibrosis">Fibrosis — Firm, non-contractile tissue</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Joint Effusion (0–3 Scale)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input style={{ ...S.input, flex: 1, border: "1.5px solid #3A4A5C" }} type="range" min="0" max="3" value={form.jointEffusion}
                  onChange={e => setField("jointEffusion", e.target.value)} />
                <span style={{
                  fontSize: 14, fontWeight: 700, minWidth: 40, textAlign: "center", padding: "2px 8px", borderRadius: 6,
                  background: +form.jointEffusion === 0 ? "rgba(16,185,129,0.15)" : +form.jointEffusion <= 1 ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)",
                  color: +form.jointEffusion === 0 ? "#6EE7B7" : +form.jointEffusion <= 1 ? "#FCD34D" : "#FCA5A5",
                }}>{form.jointEffusion}/3</span>
              </div>
              <div style={{ fontSize: 9, color: "#fff", marginTop: 4 }}>
                {+form.jointEffusion === 0 ? "None" : +form.jointEffusion === 1 ? "Mild — palpable fluid wave" : +form.jointEffusion === 2 ? "Moderate — visible swelling" : "Severe — tense, distended"}
              </div>
            </div>
          </div>
          {/* Manual Muscle Testing — Universal clinical assessment */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>Manual Muscle Testing (MMT — Oxford Scale)</div>
            <div style={S.grid(2)}>
              <div>
                <label style={S.label}>MMT Grade (0–5) — Affected Limb</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.mmtGrade} onChange={e => setField("mmtGrade", e.target.value)}>
                  <option value="">— Select Grade —</option>
                  <option value="0">0 — No palpable contraction (Paralysis)</option>
                  <option value="1">1 — Flicker/trace contraction, no movement</option>
                  <option value="2">2 — Movement with gravity eliminated only</option>
                  <option value="3">3 — Movement against gravity, not resistance</option>
                  <option value="4">4 — Movement against moderate resistance</option>
                  <option value="5">5 — Normal strength against full resistance</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {form.mmtGrade && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 8, width: "100%",
                    background: +form.mmtGrade >= 4 ? "rgba(16,185,129,0.12)" : +form.mmtGrade >= 2 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                    border: +form.mmtGrade >= 4 ? "1px solid rgba(16,185,129,0.3)" : +form.mmtGrade >= 2 ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: +form.mmtGrade >= 4 ? "#6EE7B7" : +form.mmtGrade >= 2 ? "#FCD34D" : "#FCA5A5" }}>
                      {+form.mmtGrade >= 4 ? "Functional Strength" : +form.mmtGrade >= 2 ? "Significant Weakness — Active-assisted exercises recommended" : "Severe Deficit — Passive exercises and NMES indicated"}
                    </div>
                    <div style={{ fontSize: 9, color: "#fff", marginTop: 4 }}>
                      {+form.mmtGrade <= 2 ? "Protocol will emphasize NMES, passive ROM, and assisted standing" :
                       +form.mmtGrade === 3 ? "Patient can perform gravity-dependent exercises; avoid resistance training" :
                       "Patient cleared for progressive resistance exercises"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OA Staging — Shown for OA / degenerative joint conditions */}
          {(form.diagnosis === "Hip Dysplasia" || form.diagnosis === "Elbow Dysplasia" || form.diagnosis === "Osteoarthritis" || (form.diagnosis || "").toLowerCase().includes("arthrit") || (form.diagnosis || "").toLowerCase().includes("dysplasia") || (form.diagnosis || "").toLowerCase().includes(" oa")) && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>OA Staging — Kellgren-Lawrence Classification</div>
              <div style={S.grid(2)}>
                <div>
                  <label style={S.label}>Kellgren-Lawrence Grade (0–4)</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.oaStage} onChange={e => setField("oaStage", e.target.value)}>
                    <option value="">— Select Grade —</option>
                    <option value="0">Grade 0 — No radiographic features of OA</option>
                    <option value="1">Grade 1 — Doubtful: minute osteophytes, questionable significance</option>
                    <option value="2">Grade 2 — Minimal: definite osteophytes, possible joint space narrowing</option>
                    <option value="3">Grade 3 — Moderate: multiple osteophytes, definite JSN, some sclerosis</option>
                    <option value="4">Grade 4 — Severe: large osteophytes, marked JSN, severe sclerosis, deformity</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {form.oaStage && (
                    <div style={{
                      padding: "10px 14px", borderRadius: 8, width: "100%",
                      background: +form.oaStage <= 1 ? "rgba(16,185,129,0.12)" : +form.oaStage <= 2 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                      border: +form.oaStage <= 1 ? "1px solid rgba(16,185,129,0.3)" : +form.oaStage <= 2 ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: +form.oaStage <= 1 ? "#6EE7B7" : +form.oaStage <= 2 ? "#FCD34D" : "#FCA5A5" }}>
                        {+form.oaStage <= 1 ? "Early OA — Full exercise progression appropriate" :
                         +form.oaStage === 2 ? "Mild-Moderate OA — Low-impact strengthening focus" :
                         +form.oaStage === 3 ? "Moderate OA — Avoid high-impact; aquatic therapy recommended" :
                         "Severe OA — Comfort-focused protocol; avoid impact loading"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Neurological (conditional — shown for neuro diagnoses) */}
          {(form.diagnosis === "IVDD" || form.diagnosis === "FCE" || form.diagnosis === "Degenerative Myelopathy" || form.diagnosis === "Lumbosacral Stenosis" || form.diagnosis === "Cervical Spondylomyelopathy" || form.diagnosis === "Spinal Fracture" || form.diagnosis === "Vestibular Disease" || form.diagnosis === "Peripheral Neuropathy") && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>Neurological Assessment</div>
              <div style={S.grid(4)}>
                <div>
                  <label style={S.label}>Proprioception</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.neuroProprioception} onChange={e => setField("neuroProprioception", e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="Normal">Normal (Immediate correction)</option>
                    <option value="Delayed">Delayed (Slow correction)</option>
                    <option value="Absent">Absent (No correction)</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Withdrawal Reflex</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.neuroWithdrawal} onChange={e => setField("neuroWithdrawal", e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Absent">Absent</option>
                    <option value="Exaggerated">Exaggerated (UMN)</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Deep Pain Sensation</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.neuroDeepPain} onChange={e => setField("neuroDeepPain", e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="Present">Present (Intact)</option>
                    <option value="Diminished">Diminished</option>
                    <option value="Absent">Absent — Guarded prognosis</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Motor Function Grade (0–5)</label>
                  <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.neuroMotorGrade} onChange={e => setField("neuroMotorGrade", e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="0">0 — No voluntary movement</option>
                    <option value="1">1 — Minimal movement, non-ambulatory</option>
                    <option value="2">2 — Ambulatory with significant deficits</option>
                    <option value="3">3 — Ambulatory with mild ataxia</option>
                    <option value="4">4 — Ambulatory, occasional knuckling</option>
                    <option value="5">5 — Normal motor function</option>
                  </select>
                </div>
              </div>
              {form.neuroDeepPain === "Absent" && (
                <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(220,38,38,0.15)", border: "1.5px solid rgba(220,38,38,0.4)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <FiAlertTriangle size={16} style={{ color: "#FCA5A5", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#FCA5A5" }}>
                    Absent deep pain sensation carries a guarded to poor prognosis for return to ambulation. Document discussion with owner regarding expectations and timeline.
                  </span>
                </div>
              )}

              {/* IVDD Hansen Classification — shown specifically for IVDD diagnosis */}
              {form.diagnosis === "IVDD" && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>IVDD Classification — Hansen Type & Grade</div>
                  <div style={S.grid(2)}>
                    <div>
                      <label style={S.label}>IVDD Grade (I–V)</label>
                      <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.ivddGrade} onChange={e => setField("ivddGrade", e.target.value)}>
                        <option value="">— Select Grade —</option>
                        <option value="I">Grade I — Pain only, no neurological deficits</option>
                        <option value="II">Grade II — Ambulatory paraparesis, ataxia, reduced proprioception</option>
                        <option value="III">Grade III — Non-ambulatory paraparesis, voluntary motor present</option>
                        <option value="IV">Grade IV — Non-ambulatory paraplegia, deep pain intact</option>
                        <option value="V">Grade V — Paraplegia with absent deep pain sensation</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {form.ivddGrade && (
                        <div style={{
                          padding: "10px 14px", borderRadius: 8, width: "100%",
                          background: form.ivddGrade === "I" || form.ivddGrade === "II" ? "rgba(16,185,129,0.12)" : form.ivddGrade === "III" ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                          border: form.ivddGrade === "I" || form.ivddGrade === "II" ? "1px solid rgba(16,185,129,0.3)" : form.ivddGrade === "III" ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(220,38,38,0.3)",
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: form.ivddGrade === "I" || form.ivddGrade === "II" ? "#6EE7B7" : form.ivddGrade === "III" ? "#FCD34D" : "#FCA5A5" }}>
                            {form.ivddGrade === "I" ? "Conservative management viable — Pain control + strict rest + Phase 1 rehab" :
                             form.ivddGrade === "II" ? "Conservative or surgical — Active rehab appropriate with neuro monitoring" :
                             form.ivddGrade === "III" ? "Surgical consultation recommended — Begin neuromotor re-education" :
                             form.ivddGrade === "IV" ? "Surgical emergency — Decompression within 24-48h recommended" :
                             "Surgical emergency — Guarded prognosis. < 50% recovery rate without surgery within 12-24h"}
                          </div>
                          {(form.ivddGrade === "IV" || form.ivddGrade === "V") && (
                            <div style={{ fontSize: 9, color: "#FCA5A5", marginTop: 4, fontWeight: 600 }}>
                              Protocol will restrict to Phase 1 passive exercises until neurological improvement confirmed
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={S.label}>Medical History / Notes</label>
          <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 60, resize: "vertical", fontFamily: "inherit" }} value={form.medicalHistory} onChange={e => setField("medicalHistory", e.target.value)}
            placeholder="Prior surgeries, chronic conditions, behavioral notes, relevant medical history" />
        </div>
      </div>

      {/* ═══════════ DIAGNOSTIC WORKUP ═══════════ */}
      <div id="diagnostics-workup" style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiClipboard} title="Diagnostic Workup" />
        <div style={{ fontSize: 10, color: "#fff", marginBottom: 16, lineHeight: 1.5 }}>
          Document all diagnostics obtained or reviewed for this patient. Mark each study as <strong style={{ color: "#6EE7B7" }}>Reviewed &amp; Obtained</strong> with findings,
          or <strong style={{ color: "#fff" }}>Not Clinically Indicated</strong> to confirm the diagnostic was evaluated and deemed unnecessary at this time.
          Undocumented items remain as pending review.
        </div>

        {/* Reusable diagnostic item renderer */}
        {[
          {
            heading: "Imaging Studies",
            items: [
              { key: "diagRadiographs", label: "Radiographs (X-Rays)", hint: "Views obtained, findings, date" },
              { key: "diagCT", label: "CT Scan (Computed Tomography)", hint: "Region scanned, contrast Y/N, findings" },
              { key: "diagMRI", label: "MRI (Magnetic Resonance Imaging)", hint: "Sequences, region, findings" },
              { key: "diagUltrasound", label: "Musculoskeletal Ultrasound", hint: "Structure evaluated, findings" },
            ],
          },
          {
            heading: "Laboratory Studies",
            items: [
              { key: "diagCBC", label: "CBC (Complete Blood Count)", hint: "WBC, RBC, HCT, PLT — flag abnormalities" },
              { key: "diagChemPanel", label: "Chemistry Panel / Metabolic", hint: "BUN, CREA, ALT, ALP, GLU — flag abnormalities" },
              { key: "diagUrinalysis", label: "Urinalysis", hint: "USG, protein, sediment findings" },
              { key: "diagThyroid", label: "Thyroid Panel (T4 / TSH)", hint: "Total T4, free T4, TSH values" },
              { key: "diagCRP", label: "C-Reactive Protein (CRP)", hint: "Value and reference range" },
              { key: "diagSynovial", label: "Synovial Fluid Analysis", hint: "Cell count, cytology, culture results" },
            ],
          },
          {
            heading: "Functional & Procedural Diagnostics",
            items: [
              { key: "diagEMG", label: "EMG / Nerve Conduction Study", hint: "Muscles tested, latency, amplitude findings" },
              { key: "diagArthroscopy", label: "Arthroscopy", hint: "Joint, findings, interventions performed" },
              { key: "diagGaitAnalysis", label: "Instrumented Gait Analysis", hint: "Kinematic/kinetic findings, symmetry index" },
              { key: "diagForcePlate", label: "Force Plate Analysis", hint: "Peak vertical force, impulse, symmetry ratio" },
              { key: "diagROM", label: "Goniometric Assessment", hint: "Joints measured, flexion/extension values" },
              { key: "diagOtherDiag", label: "Additional Diagnostic", hint: "Specify study and findings" },
            ],
          },
        ].map(section => (
          <div key={section.heading} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
              {section.heading}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {section.items.map(d => {
                const notesKey = d.key === "diagOtherDiag" ? "diagOtherNotes" : d.key + "Notes";
                const isPerformed = form[d.key] === true;
                const isNotIndicated = form[d.key] === "not_indicated";


                return (
                  <div key={d.key} style={{
                    padding: "10px 14px", borderRadius: 8, transition: "all 0.2s",
                    background: isPerformed ? "rgba(16,185,129,0.1)" : isNotIndicated ? "rgba(148,163,184,0.06)" : "rgba(255,255,255,0.03)",
                    border: isPerformed ? "1.5px solid rgba(16,185,129,0.3)" : isNotIndicated ? "1.5px solid rgba(148,163,184,0.15)" : "1.5px solid #2E3D4F",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        {/* Status indicator */}
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: isPerformed ? C.green : isNotIndicated ? "#64748B" : "#334155",
                          boxShadow: isPerformed ? "0 0 6px rgba(16,185,129,0.4)" : "none",
                        }} />
                        <div>
                          <div style={{
                            fontSize: 12, fontWeight: 600,
                            color: isPerformed ? "#6EE7B7" : isNotIndicated ? "#64748B" : "#fff",
                            textDecoration: isNotIndicated ? "line-through" : "none",
                          }}>{d.label}</div>
                          {isNotIndicated && (
                            <div style={{ fontSize: 10, color: "#fff", fontStyle: "italic", marginTop: 2 }}>
                              Reviewed — not clinically indicated at this time
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button type="button" onClick={() => {
                          if (isPerformed) { setField(d.key, false); }
                          else { setField(d.key, true); }
                        }} style={{
                          padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.3px",
                          background: isPerformed ? C.green : "rgba(16,185,129,0.12)",
                          color: isPerformed ? "#fff" : "#6EE7B7",
                          border: isPerformed ? `1px solid ${C.green}` : "1px solid rgba(16,185,129,0.25)",
                        }}>
                          {isPerformed ? <><FiCheckCircle size={10} style={{ marginRight: 3 }} />OBTAINED</> : "Obtained"}
                        </button>
                        <button type="button" onClick={() => {
                          if (isNotIndicated) { setField(d.key, false); }
                          else { setField(d.key, "not_indicated"); setField(notesKey, ""); }
                        }} style={{
                          padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.3px",
                          background: isNotIndicated ? "#475569" : "rgba(148,163,184,0.08)",
                          color: isNotIndicated ? "#fff" : "#64748B",
                          border: isNotIndicated ? "1px solid #475569" : "1px solid rgba(148,163,184,0.15)",
                        }}>
                          {isNotIndicated ? "NOT INDICATED" : "Not Indicated"}
                        </button>
                      </div>
                    </div>

                    {/* Findings field — only when performed */}
                    {isPerformed && (
                      <div style={{ marginTop: 8, marginLeft: 18 }}>
                        <input style={{
                          ...S.input, border: "1px solid rgba(16,185,129,0.2)",
                          background: "rgba(16,185,129,0.05)", fontSize: 11, padding: "7px 10px",
                          color: "#fff",
                        }}
                          value={form[notesKey] || ""} onChange={e => setField(notesKey, e.target.value)}
                          placeholder={d.hint} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Diagnostic Summary Bar */}
        {(() => {
          const allDiags = ["diagRadiographs","diagCT","diagMRI","diagUltrasound","diagCBC","diagChemPanel","diagUrinalysis","diagThyroid","diagCRP","diagSynovial","diagEMG","diagArthroscopy","diagGaitAnalysis","diagForcePlate","diagROM","diagOtherDiag"];
          const performed = allDiags.filter(k => form[k] === true).length;
          const notIndicated = allDiags.filter(k => form[k] === "not_indicated").length;
          const pending = allDiags.length - performed - notIndicated;
          return (
            <div style={{ marginTop: 8, padding: "10px 16px", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 8, display: "flex", gap: 20, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "0.5px" }}>Workup Status</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#6EE7B7" }}>{performed} Obtained</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{notIndicated} Not Indicated</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{pending} Pending Review</span>
            </div>
          );
        })()}
      </div>

      {/* Step 2 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button
          style={{
            ...S.btn("ghost"), boxShadow: "0 0 8px rgba(14,165,233,0.15)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 8px rgba(14,165,233,0.15)"}
          onClick={() => goToStep(1)}
        >
          ← Back to Patient Info
        </button>
        <button
          style={{
            background: "#1E5A8A", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,0.5), 0 0 40px rgba(14,165,233,0.2)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)"}
          onClick={() => goToStep(3)}
        >
          Next: Treatment Plan <FiChevronRight size={16} />
        </button>
      </div>

      </>)}

      {/* ═══════════ STEP 3: TREATMENT PLAN & SURGICAL STATUS ═══════════ */}
      {!protocol && wizardStep === 3 && (<>

      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiFileText} title="Section 3 — Treatment Plan & Surgical Status" />

        {/* ── Treatment Approach ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Treatment Approach <span style={{color:"#F87171"}}>*</span>
          </div>
          <div style={S.grid(3)}>
            {[
              { value: "surgical", label: "Surgical", icon: "🔪", desc: "Post-operative rehabilitation" },
              { value: "conservative", label: "Conservative", icon: "🩺", desc: "Non-surgical management" },
              { value: "palliative", label: "Palliative / Comfort", icon: "💙", desc: "Quality of life focused" },
            ].map(opt => (
              <div key={opt.value}
                onClick={() => setField("treatmentApproach", opt.value)}
                style={{
                  padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                  background: form.treatmentApproach === opt.value ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                  border: form.treatmentApproach === opt.value ? "2px solid #0EA5E9" : "1.5px solid #3A4A5C",
                  boxShadow: form.treatmentApproach === opt.value ? "0 0 12px rgba(14,165,233,0.2)" : "none",
                  transition: "all 0.2s",
                }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: "#fff", marginTop: 2, fontWeight: 400 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Veterinary Recommendation vs Owner Election ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Clinical Recommendation & Owner Decision
          </div>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Veterinary Recommendation</label>
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.vetRecommendation} onChange={e => setField("vetRecommendation", e.target.value)}>
                <option value="">— Select —</option>
                <option value="Surgery - Strongly Recommended">Surgery — Strongly Recommended</option>
                <option value="Surgery - Recommended">Surgery — Recommended</option>
                <option value="Surgery - Optional">Surgery — Optional (Either approach viable)</option>
                <option value="Conservative - Recommended">Conservative Management — Recommended</option>
                <option value="Conservative - Only Option">Conservative — Only Viable Option</option>
                <option value="Palliative">Palliative / Comfort Care</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Owner Election / Decision</label>
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.ownerElection} onChange={e => setField("ownerElection", e.target.value)}>
                <option value="">— Select —</option>
                <option value="Elected Surgery">Elected Surgery (per recommendation)</option>
                <option value="Elected Conservative">Elected Conservative Management</option>
                <option value="Declined Surgery - Conservative">Declined Surgery — Elected Conservative</option>
                <option value="Declined Surgery - Financial">Declined Surgery — Financial Constraints</option>
                <option value="Declined Surgery - Age/Risk">Declined Surgery — Patient Age/Risk Concern</option>
                <option value="Seeking Second Opinion">Seeking Second Opinion</option>
                <option value="Elected Palliative">Elected Palliative / Comfort Care</option>
              </select>
            </div>
          </div>
          {/* Warning banner when owner declines recommended surgery */}
          {form.vetRecommendation && form.vetRecommendation.startsWith("Surgery") && form.ownerElection && form.ownerElection.startsWith("Declined") && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 12, padding: "12px 16px", background: "#FEF3C7", border: "1.5px solid #D97706", borderRadius: 8 }}>
              <FiAlertTriangle size={18} style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>Owner Declines Recommended Surgery</div>
                <div style={{ fontSize: 11, color: "#92400E", marginTop: 4 }}>Protocol will be generated for conservative / non-surgical management. Document informed consent and owner's understanding of prognosis differences.</div>
                <div style={{ marginTop: 8 }}>
                  <label style={{ ...S.label, fontSize: 10 }}>Reason / Notes for Declining (Document for Medical Record)</label>
                  <input style={{ ...S.input, border: "1.5px solid #D97706", background: "#FFFBEB", fontSize: 11 }}
                    value={form.ownerDeclineReason} onChange={e => setField("ownerDeclineReason", e.target.value)}
                    placeholder="Owner's stated reason, informed consent discussion documented" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Surgical Details (shown when surgical approach selected) ── */}
        {form.treatmentApproach === "surgical" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
              Surgical Details
            </div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Surgery Type / Procedure</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.surgeryType} onChange={e => setField("surgeryType", e.target.value)}>
                  <option value="">— Select Procedure —</option>
                  <optgroup label="Stifle / Knee Procedures">
                    <option value="TPLO">TPLO — Tibial Plateau Leveling Osteotomy</option>
                    <option value="TTA">TTA — Tibial Tuberosity Advancement</option>
                    <option value="Lateral Suture">Lateral Suture Stabilization (LSS)</option>
                    <option value="TightRope CCL">TightRope CCL Repair</option>
                    <option value="Meniscectomy">Meniscectomy (Partial/Total)</option>
                    <option value="Patellar Luxation Repair">Patellar Luxation Repair (Trochleoplasty)</option>
                    <option value="Stifle Arthroscopy">Stifle Arthroscopy (Diagnostic/Therapeutic)</option>
                  </optgroup>
                  <optgroup label="Hip Procedures">
                    <option value="FHO">FHO — Femoral Head Ostectomy</option>
                    <option value="THR">THR — Total Hip Replacement</option>
                    <option value="JPS">JPS — Juvenile Pubic Symphysiodesis</option>
                    <option value="DPO/TPO">DPO/TPO — Double/Triple Pelvic Osteotomy</option>
                    <option value="Toggle Pin Hip Reduction">Toggle Pin — Hip Luxation Reduction</option>
                  </optgroup>
                  <optgroup label="Elbow & Shoulder Procedures">
                    <option value="FCP Removal">FCP Removal — Fragmented Coronoid</option>
                    <option value="UAP Fixation">UAP Fixation — Ununited Anconeal Process</option>
                    <option value="Elbow Arthroscopy">Elbow Arthroscopy</option>
                    <option value="Shoulder OCD Fragment Removal">Shoulder OCD Fragment Removal</option>
                    <option value="Shoulder Stabilization">Shoulder Stabilization (Medial/Lateral)</option>
                    <option value="Biceps Tenodesis">Biceps Tenodesis / Tenotomy</option>
                  </optgroup>
                  <optgroup label="Spinal / Neurological Procedures">
                    <option value="Hemilaminectomy">Hemilaminectomy (IVDD Decompression)</option>
                    <option value="Ventral Slot">Ventral Slot (Cervical IVDD)</option>
                    <option value="Dorsal Laminectomy">Dorsal Laminectomy</option>
                    <option value="Lumbosacral Decompression">Lumbosacral Decompression</option>
                    <option value="Disc Fenestration">Disc Fenestration (Prophylactic)</option>
                    <option value="Spinal Stabilization">Spinal Stabilization (Pins/PMMA/Plates)</option>
                    <option value="Cervical Distraction-Fusion">Cervical Distraction-Fusion (Wobbler)</option>
                  </optgroup>
                  <optgroup label="Fracture Repair">
                    <option value="Plate Fixation">Plate & Screw Fixation (ORIF)</option>
                    <option value="External Fixation">External Skeletal Fixation (ESF)</option>
                    <option value="IM Pin">Intramedullary Pin (IM Pin)</option>
                    <option value="Interlocking Nail">Interlocking Nail</option>
                    <option value="Cerclage Wire">Cerclage Wire Fixation</option>
                    <option value="Pelvic Fracture Repair">Pelvic Fracture ORIF</option>
                    <option value="Mandibular Fracture Repair">Mandibular Fracture Repair</option>
                  </optgroup>
                  <optgroup label="Soft Tissue / Tendon Procedures">
                    <option value="Achilles Repair">Achilles Tendon Repair</option>
                    <option value="Iliopsoas Tenotomy">Iliopsoas Tenotomy</option>
                    <option value="Muscle Repair">Muscle Repair / Myorrhaphy</option>
                    <option value="Tendon Transfer">Tendon Transfer Procedure</option>
                    <option value="Contracture Release">Contracture Release</option>
                  </optgroup>
                  <optgroup label="Amputation / Other Orthopedic">
                    <option value="Forelimb Amputation">Forelimb Amputation</option>
                    <option value="Hindlimb Amputation">Hindlimb Amputation</option>
                    <option value="Arthrodesis">Arthrodesis (Joint Fusion)</option>
                    <option value="Limb Salvage">Limb Salvage Procedure</option>
                    <option value="Hardware Removal">Hardware Removal (Implant)</option>
                    <option value="Other Procedure">Other — Specify in Notes</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label style={S.label}>Surgery Date</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C", background: form.surgeryDate && form.postOpDay ? "#F0FFF4" : C.surface }} type="date" value={form.surgeryDate} onChange={e => handleSurgeryDate(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Post-Op Day (POD)</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C", background: form.postOpDay && form.surgeryDate ? "#F0FFF4" : C.surface }} type="number" min="0" value={form.postOpDay}
                  onChange={e => handlePostOpDay(e.target.value)} onInput={e => handlePostOpDay(e.target.value)}
                  placeholder="Days since surgery" />
                {form.postOpDay && form.surgeryDate && (
                  <div style={{ fontSize: 10, color: "#059669", fontWeight: 500, marginTop: 4 }}>
                    Auto-calculated from surgery date
                  </div>
                )}
              </div>
            </div>
            <div style={{ ...S.grid(3), marginTop: 12 }}>
              <div>
                <label style={S.label}>Surgeon Name</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.surgeonName} onChange={e => setField("surgeonName", e.target.value)}
                  placeholder="DVM / DACVS name" />
              </div>
              <div>
                <label style={S.label}>Surgical Facility</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.surgicalFacility} onChange={e => setField("surgicalFacility", e.target.value)}
                  placeholder="Hospital / Clinic name" />
              </div>
              <div>
                <label style={S.label}>ASA Physical Status</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.anesthesiaRisk} onChange={e => setField("anesthesiaRisk", e.target.value)}>
                  <option value="ASA I">ASA I — Normal healthy patient</option>
                  <option value="ASA II">ASA II — Mild systemic disease</option>
                  <option value="ASA III">ASA III — Severe systemic disease</option>
                  <option value="ASA IV">ASA IV — Life-threatening disease</option>
                  <option value="ASA V">ASA V — Moribund, not expected to survive</option>
                </select>
              </div>
            </div>
            <div style={{ ...S.grid(2), marginTop: 12 }}>
              <div>
                <label style={S.label}>Incision Status</label>
                <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.incisionStatus} onChange={e => setField("incisionStatus", e.target.value)}>
                  <option value="Clean/Dry/Intact">Clean / Dry / Intact (CDI)</option>
                  <option value="Mild Swelling">Mild Swelling — Monitoring</option>
                  <option value="Seroma Present">Seroma Present</option>
                  <option value="Dehiscence Concern">Dehiscence Concern</option>
                  <option value="Infection Signs">Signs of Infection (SSI)</option>
                  <option value="Healed">Fully Healed / Sutures Removed</option>
                  <option value="N/A">N/A — No Incision</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Suture / Staple Removal Date</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C", background: form.sutureRemovalDate && form.surgeryDate ? "#F0FFF4" : C.surface }} type="date" value={form.sutureRemovalDate} onChange={e => setField("sutureRemovalDate", e.target.value)} />
                {form.sutureRemovalDate && form.surgeryDate && (
                  <div style={{ fontSize: 10, color: "#059669", fontWeight: 500, marginTop: 4 }}>
                    Auto-set to 14 days post-op (editable)
                  </div>
                )}
              </div>
            </div>
            <div style={{ ...S.grid(2), marginTop: 12 }}>
              <div>
                <label style={S.label}>Implant / Hardware Details</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.implantDetails} onChange={e => setField("implantDetails", e.target.value)}
                  placeholder="e.g. Synthes 3.5mm TPLO plate, 2.4mm locking screws" />
              </div>
              <div>
                <label style={S.label}>Surgical Complications / Notes</label>
                <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.complicationsNoted} onChange={e => setField("complicationsNoted", e.target.value)}
                  placeholder="Any intraoperative or postoperative complications" />
              </div>
            </div>
          </div>
        )}

        {/* ── Post-Op / Recovery Restrictions ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Current Recovery Status & Restrictions
          </div>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Weight-Bearing Status</label>
              <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.weightBearingStatus} onChange={e => setField("weightBearingStatus", e.target.value)}>
                <option value="Non-weight bearing">Non-weight bearing (NWB)</option>
                <option value="Toe-touching">Toe-touching weight bearing (TTWB)</option>
                <option value="Partial">Partial weight bearing (PWB)</option>
                <option value="Weight bearing as tolerated">Weight bearing as tolerated (WBAT)</option>
                <option value="Full weight bearing">Full weight bearing (FWB)</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Activity Restrictions</label>
              <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 42, resize: "vertical", fontFamily: "inherit" }} value={form.activityRestrictions} onChange={e => setField("activityRestrictions", e.target.value)}
                placeholder="e.g. No stairs, no jumping, leash walks only, no off-leash activity" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { key: "eCollarRequired", label: "E-Collar Required" },
              { key: "crateRestRequired", label: "Strict Crate Rest" },
              { key: "slingAssistRequired", label: "Sling Assist Required" },
            ].map(item => (
              <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                padding: "8px 14px", background: form[item.key] ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                border: "1.5px solid #3A4A5C", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
                transition: "all 0.2s" }}>
                <input type="checkbox" checked={form[item.key]} onChange={e => setField(item.key, e.target.checked)}
                  style={{ accentColor: "#1E3A5F", width: 16, height: 16, cursor: "pointer" }} />
                {item.label}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={S.label}>Prior Surgeries / Relevant Surgical History</label>
            <input style={{ ...S.input, border: "1.5px solid #3A4A5C" }} value={form.priorSurgeries} onChange={e => setField("priorSurgeries", e.target.value)}
              placeholder="e.g. Contralateral TPLO 2024, splenectomy 2023" />
          </div>
        </div>

        {/* ── Rehabilitation Goals ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Rehabilitation Goals
          </div>
          <div style={{ fontSize: 10, color: "#fff", marginBottom: 10 }}>Select all primary goals for this patient (guides protocol intensity and exercise selection)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { value: "pain_management", label: "Pain Management", icon: "🎯" },
              { value: "restore_rom", label: "Restore ROM", icon: "📐" },
              { value: "rebuild_muscle", label: "Rebuild Muscle Mass", icon: "💪" },
              { value: "improve_ambulation", label: "Improve Ambulation", icon: "🚶" },
              { value: "return_function", label: "Return to Full Function", icon: "🏃" },
              { value: "return_sport", label: "Return to Sport/Work", icon: "🏅" },
              { value: "weight_management", label: "Weight Management", icon: "⚖️" },
              { value: "comfort_care", label: "Comfort / Quality of Life", icon: "❤️" },
              { value: "prevent_contralateral", label: "Prevent Contralateral Injury", icon: "🛡️" },
              { value: "owner_education", label: "Owner Education & HEP", icon: "📋" },
            ].map(goal => (
              <label key={goal.value} style={{
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                color: "#fff",
                background: (form.rehabGoals || []).includes(goal.value) ? "rgba(14,165,233,0.18)" : "rgba(255,255,255,0.05)",
                border: (form.rehabGoals || []).includes(goal.value) ? "1.5px solid #0EA5E9" : "1.5px solid #3A4A5C",
                transition: "all 0.2s",
              }}>
                <input type="checkbox"
                  checked={(form.rehabGoals || []).includes(goal.value)}
                  onChange={e => {
                    const current = form.rehabGoals || [];
                    if (e.target.checked) {
                      setField("rehabGoals", [...current, goal.value]);
                    } else {
                      setField("rehabGoals", current.filter(g => g !== goal.value));
                    }
                  }}
                  style={{ accentColor: "#0EA5E9", width: 15, height: 15, cursor: "pointer" }} />
                <span>{goal.icon}</span> {goal.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button
          style={{
            ...S.btn("ghost"), boxShadow: "0 0 8px rgba(14,165,233,0.15)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 8px rgba(14,165,233,0.15)"}
          onClick={() => goToStep(2)}
        >
          ← Back to Assessment
        </button>
        <button
          style={{
            background: "#1E5A8A", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6,
            borderRadius: 8, border: "none", cursor: "pointer", padding: "14px 32px", fontSize: 14, fontWeight: 700,
            boxShadow: "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,0.5), 0 0 40px rgba(14,165,233,0.2)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(14,165,233,0.12)"}
          onClick={() => goToStep(4)}
        >
          Next: Protocol Parameters <FiChevronRight size={16} />
        </button>
      </div>

      </>)}

      {/* ═══════════ STEP 4: PROTOCOL PARAMETERS ═══════════ */}
      {!protocol && wizardStep === 4 && (<>

      {/* ═══════════ SECTION 4: PROTOCOL PARAMETERS ═══════════ */}
      <div style={{ background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
        <SectionHead icon={FiCalendar} title="Section 4 — Protocol Parameters" />
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Protocol Duration</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.protocolLength} onChange={e => setField("protocolLength", e.target.value)}>
              <option value="6">6 weeks — Accelerated (mild)</option>
              <option value="8">8 weeks — Standard post-surgical</option>
              <option value="10">10 weeks — Extended recovery</option>
              <option value="12">12 weeks — Complex / multi-joint</option>
              <option value="16">16 weeks — Conservative / neuro</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Session Frequency (per week)</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.sessionFrequency} onChange={e => setField("sessionFrequency", e.target.value)}>
              <option value="1">1× per week</option>
              <option value="2">2× per week (Recommended)</option>
              <option value="3">3× per week (Intensive)</option>
              <option value="5">5× per week (Inpatient / Acute)</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Expected Owner Compliance</label>
            <select style={{ ...S.select, width: "100%", border: "1.5px solid #3A4A5C" }} value={form.ownerCompliance} onChange={e => setField("ownerCompliance", e.target.value)}>
              <option value="Highly Motivated">Highly Motivated — Will follow HEP diligently</option>
              <option value="Motivated">Motivated — Reliable with reminders</option>
              <option value="Average">Average — Moderate adherence expected</option>
              <option value="Limited">Limited — Minimal home exercise expected</option>
            </select>
          </div>
        </div>

        {/* Home Exercise Program & Aquatic */}
        <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "8px 14px", background: form.homeExerciseProgram ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
            border: form.homeExerciseProgram ? "1.5px solid #10B981" : "1.5px solid #3A4A5C", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
            transition: "all 0.2s" }}>
            <input type="checkbox" checked={form.homeExerciseProgram} onChange={e => setField("homeExerciseProgram", e.target.checked)}
              style={{ accentColor: "#10B981", width: 16, height: 16, cursor: "pointer" }} />
            Include Home Exercise Program (HEP)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "8px 14px", background: form.aquaticAccess ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
            border: form.aquaticAccess ? "1.5px solid #0EA5E9" : "1.5px solid #3A4A5C", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
            transition: "all 0.2s" }}>
            <input type="checkbox" checked={form.aquaticAccess} onChange={e => setField("aquaticAccess", e.target.checked)}
              style={{ accentColor: "#0EA5E9", width: 16, height: 16, cursor: "pointer" }} />
            Aquatic Therapy Available (UWTM / Pool)
          </label>
        </div>

        {/* Available Therapeutic Modalities */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Available Therapeutic Modalities
          </div>
          <div style={{ fontSize: 10, color: "#fff", marginBottom: 10 }}>Select all modalities available at your facility (determines which interventions can be prescribed)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { key: "modalityUWTM", label: "Underwater Treadmill", icon: "🌊" },
              { key: "modalityLaser", label: "Therapeutic Laser (PBM)", icon: "🔴" },
              { key: "modalityTENS", label: "TENS", icon: "⚡" },
              { key: "modalityNMES", label: "NMES / E-Stim", icon: "⚡" },
              { key: "modalityTherapeuticUS", label: "Therapeutic Ultrasound", icon: "📡" },
              { key: "modalityShockwave", label: "Shockwave (ESWT)", icon: "💥" },
              { key: "modalityCryotherapy", label: "Cryotherapy", icon: "❄️" },
              { key: "modalityHeatTherapy", label: "Heat Therapy", icon: "🔥" },
              { key: "modalityPulsedEMF", label: "Pulsed EMF (PEMF)", icon: "🧲" },
            ].map(mod => (
              <label key={mod.key} style={{
                display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                color: "#fff",
                background: form[mod.key] ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                border: form[mod.key] ? "1.5px solid #0EA5E9" : "1.5px solid #3A4A5C",
                transition: "all 0.2s",
              }}>
                <input type="checkbox" checked={form[mod.key]} onChange={e => setField(mod.key, e.target.checked)}
                  style={{ accentColor: "#0EA5E9", width: 14, height: 14, cursor: "pointer" }} />
                <span>{mod.icon}</span> {mod.label}
              </label>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div style={{ marginTop: 14 }}>
          <label style={S.label}>Special Instructions / Clinical Notes</label>
          <textarea style={{ ...S.input, border: "1.5px solid #3A4A5C", minHeight: 56, resize: "vertical", fontFamily: "inherit" }} value={form.specialInstructions} onChange={e => setField("specialInstructions", e.target.value)}
            placeholder="e.g. Fearful of water — avoid aquatic initially, aggressive with handling — needs muzzle for manual therapy, owner has pool at home" />
        </div>
      </div>

      {/* ═══════════ PRE-PROTOCOL SUMMARY OVERVIEW ═══════════ */}
      {(() => {
        // Find the diagnosis label from the CONDITIONS object
        const diagLabel = (() => {
          for (const [, items] of Object.entries(CONDITIONS)) {
            const found = items.find(c => c.value === form.diagnosis);
            if (found) return found.label;
          }
          return form.diagnosis || "Not selected";
        })();
        // Find category the diagnosis belongs to
        const diagCategory = (() => {
          for (const [cat, items] of Object.entries(CONDITIONS)) {
            if (items.find(c => c.value === form.diagnosis)) return cat;
          }
          return "";
        })();
        // Count exercises relevant to the condition
        const relevantExercises = allExercises.filter(ex => {
          const name = (ex.name || "").toLowerCase();
          const cat = (ex.category || "").toLowerCase();
          const diag = (form.diagnosis || "").toLowerCase();
          const region = (form.affectedRegion || "").toLowerCase();
          return name.includes(diag) || cat.includes(diag) || name.includes(region.split(" ").pop()) || cat.includes(region.split(" ").pop());
        });
        const totalExercises = allExercises.length;
        // Treatment summary
        const txLabel = form.treatmentApproach === "surgical" ? "Surgical — Post-Operative Rehabilitation"
          : form.treatmentApproach === "conservative" ? "Conservative — Non-Surgical Management"
          : form.treatmentApproach === "palliative" ? "Palliative — Comfort Care"
          : "Not specified";
        const ownerDeclined = form.vetRecommendation && form.vetRecommendation.startsWith("Surgery") && form.ownerElection && form.ownerElection.startsWith("Declined");

        return (
          <div style={{
            background: `linear-gradient(135deg, #1D2B3A 0%, #22323F 50%, #1D2B3A 100%)`,
            border: "2px solid #2E3D4F", borderRadius: 10, padding: "16px 20px", marginBottom: 12,
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative top accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #0F4C81, #0EA5E9, #10B981)" }} />

            <div style={{ ...S.sectionHeader(), marginTop: 4, marginBottom: 0 }}>
              <FiCheckCircle size={14} style={{ color: "#0EA5E9" }} /> PRE-PROTOCOL SUMMARY
            </div>
            {/* Neon flatline under header */}
            <div style={{ height: 3, width: "100%", overflow: "hidden", marginTop: 8, marginBottom: 16, borderRadius: 2 }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite", boxShadow: "0 0 8px rgba(57,255,126,0.5), 0 0 16px rgba(57,255,126,0.2)" }} />
            </div>

            {/* Patient & Diagnosis Row */}
            <div style={{ ...S.grid(3), gap: 16 }}>
              {/* Patient Info Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Patient</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                  {form.patientName || "—"} <span style={{ fontSize: 12, fontWeight: 400 }}>({form.sex || "—"})</span>
                </div>
                <div style={{ fontSize: 12, color: "#fff", marginBottom: 2 }}>{form.breed || "Breed not selected"}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>Age: <strong>{form.age ? form.age + " yr" : "—"}</strong></span>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>Wt: <strong>{form.weightKg ? form.weightKg + " kg" : "—"}{form.weightLbs ? " (" + form.weightLbs + " lbs)" : ""}</strong></span>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>BCS: <strong>{form.bodyConditionScore}/9</strong></span>
                </div>
              </div>

              {/* Diagnosis Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Diagnosis & Region</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{diagLabel}</div>
                {diagCategory && <div style={{ fontSize: 11, color: "#fff", fontWeight: 400, marginBottom: 4 }}>Category: {diagCategory}</div>}
                <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>Region: <strong>{form.affectedRegion || "—"}</strong></div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: +form.painLevel <= 3 ? "#ECFDF5" : +form.painLevel <= 6 ? "#FFFBEB" : "#FEF2F2",
                    color: +form.painLevel <= 3 ? "#059669" : +form.painLevel <= 6 ? "#D97706" : "#DC2626",
                  }}>Pain: {form.painLevel}/10</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: +form.lamenessGrade <= 1 ? "#ECFDF5" : +form.lamenessGrade <= 3 ? "#FFFBEB" : "#FEF2F2",
                    color: +form.lamenessGrade <= 1 ? "#059669" : +form.lamenessGrade <= 3 ? "#D97706" : "#DC2626",
                  }}>Lameness: {form.lamenessGrade}/5</span>
                  {form.mmtGrade && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: +form.mmtGrade >= 4 ? "#ECFDF5" : +form.mmtGrade >= 2 ? "#FFFBEB" : "#FEF2F2",
                      color: +form.mmtGrade >= 4 ? "#059669" : +form.mmtGrade >= 2 ? "#D97706" : "#DC2626",
                    }}>MMT: {form.mmtGrade}/5</span>
                  )}
                  {form.ivddGrade && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "#F3E8FF", color: "#7C3AED" }}>
                      IVDD: Grade {form.ivddGrade}
                    </span>
                  )}
                  {form.oaStage && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: +form.oaStage <= 2 ? "#FFFBEB" : "#FEF2F2",
                      color: +form.oaStage <= 2 ? "#D97706" : "#DC2626",
                    }}>KL: Grade {form.oaStage}</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "#E0F2FE", color: "#0284C7" }}>
                    {form.mobilityLevel}
                  </span>
                </div>
              </div>

              {/* Treatment Plan Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Treatment Plan</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{txLabel}</div>
                {form.treatmentApproach === "surgical" && form.surgeryType && (
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500, marginBottom: 2 }}>Procedure: <strong>{form.surgeryType}</strong></div>
                )}
                {form.treatmentApproach === "surgical" && form.postOpDay && (
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500, marginBottom: 2 }}>Post-Op Day: <strong>{form.postOpDay}</strong></div>
                )}
                {form.weightBearingStatus && (
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500, marginBottom: 2 }}>Weight Bearing: <strong>{form.weightBearingStatus}</strong></div>
                )}
                {ownerDeclined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, padding: "4px 8px", background: "#FEF3C7", border: "1px solid #D97706", borderRadius: 4 }}>
                    <FiAlertTriangle size={11} style={{ color: "#D97706" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#92400E" }}>Owner declined recommended surgery</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client & Safety Row */}
            <div style={{ ...S.grid(2), gap: 16, marginTop: 16 }}>
              {/* Client Info Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Client Information</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{form.clientName || "—"}</div>
                {form.clientEmail && <div style={{ fontSize: 11, color: "#fff", marginBottom: 2 }}>{form.clientEmail}</div>}
                {form.clientPhone && <div style={{ fontSize: 11, color: "#fff", marginBottom: 2 }}>{form.clientPhone}</div>}
                {form.referringVet && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Referring DVM: <strong style={{ color: "#fff" }}>{form.referringVet}</strong></div>}
                {form.treatingClinician && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Treating Clinician: <strong style={{ color: "#fff" }}>{form.treatingClinician}{form.clinicianCredentials ? `, ${form.clinicianCredentials}` : ""}</strong></div>}
                {form.clientConsentObtained && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, padding: "3px 8px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 4 }}>
                    <FiCheckCircle size={10} style={{ color: "#059669" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#059669" }}>Consent Obtained{form.clientConsentDate ? ` — ${form.clientConsentDate}` : ""}</span>
                  </div>
                )}
              </div>

              {/* Safety Flags Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Safety Flags</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.allergies && form.allergies.trim() && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                      ALLERGY: {form.allergies}
                    </span>
                  )}
                  {form.temperament && form.temperament !== "Cooperative" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}>
                      {form.temperament}
                    </span>
                  )}
                  {form.incisionStatus && form.incisionStatus !== "Clean/Dry/Intact" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                      Incision: {form.incisionStatus}
                    </span>
                  )}
                  {(form.activityRestrictions || []).length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}>
                      {(form.activityRestrictions || []).length} Restriction(s)
                    </span>
                  )}
                  {(!form.allergies || !form.allergies.trim()) && form.temperament === "Cooperative" && (form.activityRestrictions || []).length === 0 && (!form.incisionStatus || form.incisionStatus === "Clean/Dry/Intact") && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: "#ECFDF5", color: "#059669" }}>No active flags</span>
                  )}
                </div>
              </div>
            </div>

            {/* Exercise Availability Row */}
            <div style={{ marginTop: 16, background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Exercise Library Available</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                    Total Exercises: <strong style={{ fontSize: 14, color: "#7DD3FC" }}>{totalExercises}</strong>
                  </div>
                  {relevantExercises.length > 0 && (
                    <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                      Condition-Matched: <strong style={{ fontSize: 14, color: "#059669" }}>{relevantExercises.length}</strong>
                    </div>
                  )}
                  {form.currentMedications && (
                    <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                      Active Medications: <strong>{form.currentMedications}</strong>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 320 }}>
                {form.eCollarRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#DBEAFE", color: "#1E3A5F" }}>E-Collar</span>}
                {form.crateRestRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#DBEAFE", color: "#1E3A5F" }}>Crate Rest</span>}
                {form.slingAssistRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#DBEAFE", color: "#1E3A5F" }}>Sling Assist</span>}
                {form.specialInstructions && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#FEF3C7", color: "#92400E" }}>Special Instructions</span>}
              </div>
            </div>

            {/* Rehab Goals & Protocol Config Row */}
            <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
              {/* Rehab Goals */}
              <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Rehab Goals</div>
                {(form.rehabGoals || []).length > 0 ? (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(form.rehabGoals || []).map(g => (
                      <span key={g} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: "#7DD3FC" }}>
                        {g.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    ))}
                  </div>
                ) : <span style={{ fontSize: 11, color: "#fff" }}>No goals selected</span>}
              </div>
              {/* Protocol Config */}
              <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Protocol Configuration</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>{form.protocolLength} weeks</span>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>{form.sessionFrequency}×/week</span>
                  {form.homeExerciseProgram && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#6EE7B7" }}>HEP Included</span>}
                  {form.aquaticAccess && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: "#7DD3FC" }}>Aquatic</span>}
                </div>
                {/* Modalities count */}
                {(() => {
                  const modCount = ["modalityUWTM","modalityLaser","modalityTENS","modalityNMES","modalityTherapeuticUS","modalityShockwave","modalityCryotherapy","modalityHeatTherapy","modalityPulsedEMF"].filter(k => form[k]).length;
                  return modCount > 0 ? <div style={{ fontSize: 10, color: "#fff", marginTop: 4 }}>{modCount} modalities available</div> : null;
                })()}
              </div>
            </div>

            {/* Objective Measurements Summary */}
            {(form.circumferenceAffected || form.romFlexion || form.muscleCondition !== "Normal" || +form.jointEffusion > 0) && (
              <div style={{ marginTop: 20, background: "rgba(255,255,255,0.05)", border: "1.5px solid #3A4A5C", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Baseline Measurements</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {form.circumferenceAffected && form.circumferenceContralateral && (
                    <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                      Circumference: {form.circumferenceAffected}cm / {form.circumferenceContralateral}cm
                      ({Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)).toFixed(1)}cm diff)
                    </span>
                  )}
                  {form.romFlexion && <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>ROM: {form.romFlexion}°–{form.romExtension || "—"}°</span>}
                  {form.muscleCondition !== "Normal" && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(220,38,38,0.15)", color: "#FCA5A5" }}>{form.muscleCondition}</span>}
                  {+form.jointEffusion > 0 && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(217,119,6,0.15)", color: "#FCD34D" }}>Effusion: {form.jointEffusion}/3</span>}
                </div>
              </div>
            )}

            {/* Missing Info Warnings */}
            {(!form.patientName || !form.diagnosis || !form.treatmentApproach || (form.rehabGoals || []).length === 0) && (
              <div style={{ marginTop: 20, padding: "10px 16px", background: "#FEF3C7", border: "1.5px solid #D97706", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <FiAlertTriangle size={14} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#92400E" }}>
                  Missing recommended fields:
                  {!form.patientName && " Patient Name,"}
                  {!form.diagnosis && " Diagnosis,"}
                  {!form.treatmentApproach && " Treatment Approach,"}
                  {(form.rehabGoals || []).length === 0 && " Rehab Goals"}
                  {" — go back and complete for optimal protocol generation."}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════ K9 REHAB PRO — COMPLIANCE & DATA PROTECTION ═══════════ */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={complianceAgreed} onChange={e => setComplianceAgreed(e.target.checked)}
            style={{ accentColor: "#39FF7E", width: 16, height: 16, cursor: "pointer" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>
            I acknowledge the{" "}
            <span
              onClick={e => { e.preventDefault(); setComplianceOpen(o => !o); }}
              style={{ color: "#0EA5E9", textDecoration: "underline", cursor: "pointer" }}
            >K9 Rehab Pro — Compliance & Data Protection Notice</span>
          </span>
        </label>
        {complianceOpen && (
          <div style={{
            background: "#1D2B3A", border: "2px solid #2E3D4F", borderRadius: 10,
            padding: "20px 24px", marginTop: 8, maxHeight: 420, overflowY: "auto",
          }}>
            {/* Section 1 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              1. Regulatory Framework & Governing Standards
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro operates under the regulatory authority of state veterinary medical boards in the United States. All clinical decision-support features, rehabilitation protocol generation, and professional-facing tools are designed to comply with:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 12px 16px", padding: 0 }}>
              <li>State veterinary practice acts</li>
              <li>State veterinary medical board rules for teleadvice, teleconsulting, and client communication</li>
              <li>State-specific definitions of the veterinarian–client–patient relationship (VCPR)</li>
              <li>Professional conduct, recordkeeping, and data-handling requirements</li>
              <li>Restrictions on diagnosis, prescription, and medical decision-making by non-veterinarians</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              The platform functions as a clinical decision-support system (CDSS) and educational tool, not a substitute for licensed veterinary judgment.
            </div>

            {/* Section 2 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              2. Scope of Use & Professional Boundaries
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro is designed for:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Licensed veterinarians</li>
              <li>Certified canine rehabilitation practitioners (CCRP/CCRT)</li>
              <li>Veterinary physical therapists</li>
              <li>Veterinary technicians under supervision</li>
              <li>Veterinary students and rehabilitation trainees</li>
            </ul>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              The system does not:
            </div>
            <ul style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Establish a VCPR</li>
              <li>Provide medical diagnosis</li>
              <li>Replace in-person examinations</li>
              <li>Prescribe medications</li>
              <li>Override state veterinary medical board rules</li>
            </ul>
            <div style={{ fontSize: 10, color: "#6EE7B7", lineHeight: 1.7, marginBottom: 16, fontWeight: 600 }}>
              All generated content must be reviewed and approved by a licensed veterinarian before being applied to a patient.
            </div>

            {/* Section 3 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              3. Data Privacy & Confidentiality Standards
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro is committed to data privacy standards that align with or exceed veterinary medical board recordkeeping requirements. HIPAA does not govern veterinary medicine; however, the platform is designed with the following protections in place or on the implementation roadmap:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 4px 16px", padding: 0 }}>
              <li>All patient and client data stored locally on the host device — no external transmission</li>
              <li>No third-party data sharing, advertising use, or AI training on user-submitted data</li>
              <li>Session-based access with configurable timeout</li>
            </ul>
            <div style={{ fontSize: 10, color: "#FBBF24", lineHeight: 1.7, marginBottom: 4, fontWeight: 600 }}>
              Planned for production deployment:
            </div>
            <ul style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>AES-256 encryption at rest</li>
              <li>TLS 1.3 encryption in transit</li>
              <li>Zero-knowledge architecture for sensitive fields</li>
              <li>Role-based access control (RBAC)</li>
              <li>Multi-factor authentication</li>
              <li>Encrypted backups and disaster-recovery protocols</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              No client or patient data is sold, shared, or used for advertising. Security features will be fully implemented prior to multi-user or cloud deployment.
            </div>

            {/* Section 4 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              4. State Veterinary Medical Board Compliance
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>VCPR-dependent features clearly labeled</li>
              <li>Protocols requiring veterinary oversight flagged for review</li>
              <li>Restrictions on remote diagnosis enforced</li>
              <li>Documentation standards aligned with state recordkeeping rules</li>
              <li>Clear separation between education, decision support, and clinical judgment</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              All workflows are designed to align with state-level practice restrictions. Final clinical decisions remain the responsibility of the supervising veterinarian.
            </div>

            {/* Section 5 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              5. Clinical Accuracy, Evidence Standards & Protocol Validation
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              All rehabilitation protocols follow:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Millis & Levine <em>Canine Rehabilitation and Physical Therapy</em></li>
              <li><em>Canine Sports Medicine & Rehabilitation</em> (Zink & Van Dyke)</li>
              <li>ACVSMR-aligned best practices</li>
              <li>Peer-reviewed veterinary rehabilitation literature</li>
              <li>State veterinary medical board expectations for evidence-based care</li>
            </ul>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              Every exercise in the library is:
            </div>
            <ul style={{ fontSize: 10, color: "#6EE7B7", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0, fontWeight: 600 }}>
              <li>Clinically validated</li>
              <li>Evidence-based</li>
              <li>Stage-appropriate</li>
              <li>Safety-screened</li>
              <li>Free of hallucinated or non-standard techniques</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              Protocols are generated using deterministic logic to ensure reproducibility and clinical reliability.
            </div>

            {/* Section 6 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              6. Security Infrastructure & Technical Safeguards
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro currently operates as a locally-hosted application. Active and planned security measures include:
            </div>
            <ul style={{ fontSize: 10, color: "#6EE7B7", lineHeight: 1.8, margin: "0 0 4px 16px", padding: 0, fontWeight: 600 }}>
              <li>Local-only data storage — no external servers or cloud transmission</li>
              <li>Deterministic protocol logic — no AI/ML in clinical output</li>
              <li>Configurable session timeout and auto-lock</li>
              <li>Strict API access controls (CORS-restricted)</li>
            </ul>
            <div style={{ fontSize: 10, color: "#FBBF24", lineHeight: 1.7, marginBottom: 4, fontWeight: 600 }}>
              Planned for production deployment:
            </div>
            <ul style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Encrypted databases (AES-256)</li>
              <li>Audit logs for all clinical-related actions</li>
              <li>Multi-factor authentication</li>
              <li>Continuous monitoring and intrusion detection</li>
              <li>Automated patching and vulnerability scanning</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              Enterprise-grade security features will be fully implemented prior to multi-user, cloud, or production deployment.
            </div>

            {/* Section 7 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              7. Data Retention, Ownership & Client Rights
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              Clients and clinicians retain full ownership of their data. K9 Rehab Pro acts only as a secure processor.
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Data retained only as long as required for clinical or legal purposes</li>
              <li>Permanent deletion available upon request</li>
              <li>Exportable records for veterinary medical board audits</li>
              <li>No third-party data sharing</li>
              <li>No AI training on user-submitted patient data</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              All retention timelines align with state veterinary medical board recordkeeping requirements.
            </div>

            {/* Section 8 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              8. Ethical Use, Transparency & Professional Responsibility
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro adheres to the ethical standards of:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>AVMA</li>
              <li>State veterinary medical boards</li>
              <li>ACVSMR</li>
              <li>APTA (for PT-licensed users)</li>
            </ul>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              Ethical commitments include:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Transparency about system limitations</li>
              <li>Clear labeling of AI-generated content</li>
              <li>Mandatory veterinary oversight for clinical decisions</li>
              <li>No replacement of licensed professional judgment</li>
              <li>No misleading claims about outcomes or guarantees</li>
            </ul>
            <div style={{ fontSize: 10, color: "#6EE7B7", lineHeight: 1.7, fontWeight: 700, marginBottom: 16 }}>
              The platform supports clinicians — never replaces them.
            </div>

            {/* Section 9 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              9. Intellectual Property & Ownership
            </div>
            <div style={{ fontSize: 10, color: "#fff", lineHeight: 1.7, marginBottom: 6 }}>
              All intellectual property rights are defined as follows:
            </div>
            <ul style={{ fontSize: 10, color: "#fff", lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li><strong>Platform IP:</strong> The K9 Rehab Pro platform, including its protocol generation engine, exercise library, clinical algorithms, user interface, and source code, is the proprietary intellectual property of the platform owner.</li>
              <li><strong>Exercise Library:</strong> The curated exercise library is a proprietary compilation. Individual exercises reference published veterinary rehabilitation literature (Millis & Levine, Zink & Van Dyke, peer-reviewed journals) under fair use for clinical decision support.</li>
              <li><strong>Generated Protocols:</strong> Rehabilitation protocols generated by the platform become the clinical property of the generating clinic or clinician. The platform retains no ownership of patient-specific output.</li>
              <li><strong>Patient Data:</strong> All patient and client data entered into the system is owned exclusively by the clinic or clinician. K9 Rehab Pro acts solely as a local data processor.</li>
              <li><strong>Branding & Trademarks:</strong> "K9 Rehab Pro," the K9 Rehab Pro logo, and all associated branding elements are proprietary marks of the platform owner.</li>
            </ul>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontStyle: "italic" }}>
              Unauthorized reproduction, distribution, or reverse engineering of the platform, its algorithms, or exercise library is prohibited.
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ GENERATE BUTTON — standalone with heavy neon green glow ═══════════ */}
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
        <button
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "18px 56px", borderRadius: 12, border: "2px solid #10B981",
            fontSize: 16, fontWeight: 800, letterSpacing: "0.5px", cursor: "pointer",
            background: "linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)",
            color: "#fff",
            boxShadow: "0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(16,185,129,0.7), 0 0 60px rgba(16,185,129,0.4), 0 0 90px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.3)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = "0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={generate} disabled={loading}
        >
          <FiActivity size={18} />
          {loading ? "Generating Protocol..." : "Generate Exercise Protocol"}
        </button>
      </div>

      {/* Step 4 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button
          style={{
            ...S.btn("ghost"), boxShadow: "0 0 8px rgba(14,165,233,0.15)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 8px rgba(14,165,233,0.15)"}
          onClick={() => goToStep(3)}
        >
          ← Back to Treatment Plan
        </button>
        <div />
      </div>

      </>)}

      {/* ═══════════ ERROR ═══════════ */}
      {error && (
        <div style={{ ...S.card, background: C.redBg, border: `1px solid ${C.red}33`, color: C.red, display: "flex", alignItems: "center", gap: 8 }}>
          <FiAlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ═══════════ GENERATED PROTOCOL RESULTS ═══════════ */}
      {protocol && (() => {
        // Group weeks by phase using _phaseInfo from protocol generator
        const phaseGroups = [];
        let currentPhase = null;
        (protocol.weeks || []).forEach(week => {
          const info = week.exercises?.[0]?._phaseInfo;
          if (info && (!currentPhase || currentPhase.number !== info.number)) {
            currentPhase = { ...info, weeks: [week], startWeek: week.week_number, endWeek: week.week_number };
            phaseGroups.push(currentPhase);
          } else if (currentPhase) {
            currentPhase.weeks.push(week);
            currentPhase.endWeek = week.week_number;
          } else {
            // Fallback if no _phaseInfo
            currentPhase = { number: 1, name: "Recovery", goal: "", weeks: [week], startWeek: week.week_number, endWeek: week.week_number };
            phaseGroups.push(currentPhase);
          }
        });
        const phaseColors = ["#DC2626", "#D97706", "#0EA5E9", "#059669"];
        const totalWeeks = protocol.protocol_length_weeks || protocol.weeks?.length || 8;

        return (
        <div className="print-protocol">
          {/* Storyboard Player Modal */}
          {showStoryboard && <StoryboardPlayer exerciseCode={showStoryboard} onClose={() => setShowStoryboard(null)} />}
          {/* ── CDSS / Veterinary Oversight Disclaimer Banner ── */}
          <div style={{
            padding: "12px 20px", marginBottom: 10, borderRadius: 8,
            background: "linear-gradient(135deg, #1E3A5F 0%, #0A2540 100%)",
            border: "1px solid #2E4A6F",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <FiShield size={18} style={{ color: "#FBBF24", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>
                Clinical Decision-Support Output — Veterinary Review Required
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                This protocol is generated by a clinical decision-support system (CDSS). It does not constitute a diagnosis, prescription, or veterinary-client-patient relationship (VCPR). All content must be reviewed and approved by a licensed veterinarian before being applied to a patient.
              </div>
            </div>
          </div>

          {/* ── Print / Export Action Bar ── */}
          <div className="no-print" style={{
            display: "flex", gap: 8, marginBottom: 10, justifyContent: "flex-end",
          }}>
            <button onClick={() => window.print()} style={{
              ...S.btn("outline"), fontSize: 11, padding: "6px 14px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <FiPrinter size={12} /> Print Protocol
            </button>
            <button onClick={() => {
              setProtocol(null);
              setWizardStep(1);
            }} style={{
              ...S.btn("outline"), fontSize: 11, padding: "6px 14px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <FiPlus size={12} /> New Protocol
            </button>
          </div>

          {/* ── Red-Flag Warnings (if any) ── */}
          {protocol.red_flag_warnings && protocol.red_flag_warnings.length > 0 && (
            <div style={{
              padding: "14px 20px", marginBottom: 10, borderRadius: 8,
              background: "linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)",
              border: "1px solid #DC2626",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <FiAlertTriangle size={16} style={{ color: "#FCA5A5", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: "#FCA5A5", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Clinical Red Flags Detected
                </span>
              </div>
              {protocol.red_flag_warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 11, color: "#FECACA", lineHeight: 1.6, marginBottom: 4, paddingLeft: 24 }}>
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* ── Protocol Summary Header ── */}
          <div style={{
            ...S.card, borderTop: `4px solid ${C.teal}`,
            background: `linear-gradient(135deg, ${C.surface} 0%, ${C.tealLight}15 100%)`,
            padding: "24px 28px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>
                  {protocol.protocol_name || "Rehabilitation Protocol"} — {(protocol.protocol_type || "").toUpperCase()}
                </div>
                <h2 style={{ margin: "0 0 8px", color: C.navy, fontSize: 24, fontWeight: 800 }}>
                  {protocol.patient_name}
                </h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={S.badge("blue")}>{protocol.condition}</span>
                  <span style={S.badge("green")}>{protocol.affected_region}</span>
                  <span style={S.badge("blue")}>{totalWeeks} Weeks</span>
                  <span style={{ ...S.badge("green"), background: "#EDE9FE", color: "#6B21A8" }}>{phaseGroups.length} Phases</span>
                </div>
                <p style={{ margin: 0, color: C.textLight, fontSize: 11 }}>
                  Protocol ID: {protocol.patient_id} · Generated {new Date(protocol.generated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {protocol.total_exercises} exercises in library
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.navy }}>{totalWeeks}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>Week Program</div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button style={{ ...S.btn("primary"), fontSize: 11, padding: "6px 16px" }}
                    onClick={() => { setProtocol(null); setWizardStep(1); setError(null); }}>
                    <FiFileText size={12} /> New Protocol
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Phase Timeline Bar ── */}
          {phaseGroups.length > 1 && (
            <div style={{ ...S.card, padding: "20px 24px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                Phase Timeline — Gated Progression
              </div>
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 38, background: C.bg, border: `1px solid ${C.border}` }}>
                {phaseGroups.map((phase, i) => {
                  const widthPct = (phase.weeks.length / totalWeeks) * 100;
                  return (
                    <div key={i} style={{
                      width: `${widthPct}%`, background: `linear-gradient(135deg, ${phaseColors[i] || C.teal}, ${phaseColors[i] || C.teal}CC)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.3px",
                      minWidth: 80, borderRight: i < phaseGroups.length - 1 ? "2px solid rgba(255,255,255,0.5)" : "none",
                    }}>
                      P{phase.number}: {phase.name}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", marginTop: 6 }}>
                {phaseGroups.map((phase, i) => (
                  <div key={i} style={{
                    flex: phase.weeks.length / totalWeeks,
                    textAlign: "center", fontSize: 10, color: C.textLight, fontWeight: 500,
                  }}>
                    Wk {phase.startWeek}–{phase.endWeek}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Phase Sections with Exercises ── */}
          {phaseGroups.map((phase, phaseIdx) => (
            <div key={phaseIdx} style={{ marginBottom: 24 }}>

              {/* Phase Header Card */}
              <div style={{
                ...S.card, borderLeft: `5px solid ${phaseColors[phaseIdx] || C.teal}`,
                background: `linear-gradient(135deg, ${C.surface} 0%, ${phaseColors[phaseIdx] || C.teal}08 100%)`,
                marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{
                      fontSize: 10, fontWeight: 800, color: phaseColors[phaseIdx] || C.teal,
                      textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4,
                    }}>
                      Phase {phase.number} | Weeks {phase.startWeek}–{phase.endWeek}
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: C.navy }}>
                      {phase.name}
                    </h3>
                    {phase.goal && (
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>
                        {phase.goal}
                      </p>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: phaseColors[phaseIdx] || C.teal,
                    background: (phaseColors[phaseIdx] || C.teal) + "14",
                    padding: "4px 12px", borderRadius: 6,
                  }}>
                    {phase.weeks.length} wk{phase.weeks.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Contraindications */}
                {phase.contraindications && (
                  <div style={{
                    marginTop: 12, padding: "10px 14px", background: C.redBg,
                    border: `1px solid ${C.red}22`, borderRadius: 6,
                    display: "flex", gap: 8, alignItems: "flex-start",
                  }}>
                    <FiAlertTriangle size={13} style={{ color: C.red, flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 11, color: C.red, lineHeight: 1.5 }}>
                      <strong>Contraindications:</strong> {phase.contraindications}
                    </div>
                  </div>
                )}
              </div>

              {/* Weekly Cards within this phase */}
              {phase.weeks.map((week) => {
                const globalWeekIdx = (protocol.weeks || []).indexOf(week);
                return (
                  <div key={week.week_number} style={{
                    ...S.card, borderLeft: `3px solid ${(phaseColors[phaseIdx] || C.teal)}44`,
                    marginLeft: 16, marginBottom: 8,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.navy }}>
                        Week {week.week_number}
                      </h4>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: C.textLight }}>
                          {week.exercises.length} exercise{week.exercises.length !== 1 ? "s" : ""}
                        </span>
                        <button
                          onClick={() => { setAddingToWeek(globalWeekIdx); setShowAddModal(true); }}
                          style={{ ...S.btn("primary"), padding: "4px 12px", fontSize: 10 }}>
                          <FiPlus size={11} /> Add
                        </button>
                      </div>
                    </div>
                    <div style={S.grid(3)}>
                      {week.exercises.map((ex, exIdx) => (
                        <ProtocolExCard
                          key={exIdx}
                          entry={{ exercise: ex, sets: ex.sets, reps: ex.reps, frequency_per_day: ex.frequency, duration_seconds: ex.duration_minutes ? ex.duration_minutes * 60 : null, notes: ex.notes }}
                          onRemove={() => removeExercise(globalWeekIdx, exIdx)}
                          onOpenStoryboard={setShowStoryboard}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Progression Gate — between phases */}
              {phaseIdx < phaseGroups.length - 1 && phase.progressionCriteria && (
                <div style={{
                  ...S.card, background: C.greenBg, border: `1px solid ${C.green}33`,
                  borderLeft: `4px solid ${C.green}`, marginTop: 4,
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 800, color: C.green,
                    textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <FiCheckCircle size={12} />
                    Progression Gate — Advance to Phase {phaseGroups[phaseIdx + 1].number}: {phaseGroups[phaseIdx + 1].name}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#065F46", lineHeight: 1.6 }}>
                    <strong>Patient must demonstrate:</strong> {phase.progressionCriteria}
                  </p>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <FiCalendar size={11} style={{ color: C.green }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>
                      Schedule re-evaluation at Week {phase.endWeek}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ── Home Exercise Program (HEP) — Client Take-Home ── */}
          {(() => {
            const CLINIC_ONLY = new Set(["LASER_IV","TENS_THERAPY","NMES_QUAD","US_PULSED",
              "PEMF_THERAPY","SHOCKWAVE","UNDERWATER_TREAD","POOL_SWIM","WATER_WALKING","WATER_RETRIEVE"]);
            const hepByPhase = {};
            (protocol.weeks || []).forEach(week => {
              const phaseInfo = week.exercises?.[0]?._phaseInfo;
              const phaseName = phaseInfo?.name || "Phase 1";
              const phaseNum = phaseInfo?.number || 1;
              if (!hepByPhase[phaseNum]) hepByPhase[phaseNum] = { name: phaseName, exercises: new Map() };
              (week.exercises || []).forEach(ex => {
                if (!CLINIC_ONLY.has(ex.code)) {
                  hepByPhase[phaseNum].exercises.set(ex.code, ex);
                }
              });
            });
            return (
              <div style={{
                ...S.card, borderTop: `3px solid ${C.green}`,
                background: `linear-gradient(135deg, ${C.surface} 0%, ${C.greenBg} 100%)`,
              }} className="hep-section">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FiHeart size={14} style={{ color: C.green }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Home Exercise Program (HEP)
                    </span>
                  </div>
                  <span style={{ ...S.badge("green"), fontSize: 10 }}>Client Take-Home</span>
                </div>
                <p style={{ fontSize: 11, color: C.textMid, marginBottom: 14, lineHeight: 1.6, background: "#F0FFF4", padding: "10px 14px", borderRadius: 6 }}>
                  These exercises are safe to perform at home under the guidance provided. Clinic-only interventions (laser, electrical stimulation, ultrasound, aquatic therapy) are excluded. Always follow your veterinarian's specific instructions and stop any exercise that causes pain or distress.
                </p>
                {Object.entries(hepByPhase).map(([phaseNum, phase]) => (
                  <div key={phaseNum} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 8,
                      padding: "4px 10px", background: "#EBF8FF", borderRadius: 4, display: "inline-block" }}>
                      Phase {phaseNum}: {phase.name}
                    </div>
                    <div style={S.grid(2)}>
                      {[...phase.exercises.values()].slice(0, 10).map((ex, i) => (
                        <div key={i} style={{
                          padding: "10px 14px", background: "#fff",
                          border: `1px solid ${C.border}`, borderRadius: 8,
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: C.navy }}>{ex.name || ex.exercise?.name}</div>
                          <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>
                            {ex.sets && `${ex.sets}`}{ex.reps && ` × ${ex.reps}`}
                            {ex.duration_seconds && ` · ${ex.duration_seconds >= 60 ? `${ex.duration_seconds / 60} min` : `${ex.duration_seconds}s`}`}
                            {ex.frequency_per_day && ` · ${ex.frequency_per_day}×/day`}
                          </div>
                          {ex.notes && <div style={{ fontSize: 10, color: C.textLight, marginTop: 3, fontStyle: "italic" }}>{ex.notes}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ padding: "8px 12px", background: C.amberBg, border: `1px solid ${C.amber}33`,
                  borderRadius: 6, fontSize: 10, color: C.amber, fontWeight: 600, marginTop: 8 }}>
                  If your pet shows signs of pain, limping, swelling, or reluctance during any exercise, stop immediately and contact your veterinarian.
                </div>
              </div>
            );
          })()}

          {/* ── Veterinary Sign-Off Section ── */}
          <div style={{
            ...S.card, borderTop: `3px solid ${C.navy}`,
            background: `linear-gradient(135deg, ${C.surface} 0%, #F0F4F8 100%)`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FiAward size={14} style={{ color: C.navy }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Veterinary Review & Approval
              </span>
            </div>
            <div style={S.grid(2)}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" }}>
                  Reviewed By (Licensed Veterinarian)
                </label>
                <input style={{ ...S.input, borderColor: C.navy + "44" }} placeholder="DVM name, credentials, license #" />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" }}>
                  Date Reviewed
                </label>
                <input style={{ ...S.input, borderColor: C.navy + "44" }} type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" }}>
                Clinical Notes / Modifications
              </label>
              <textarea style={{ ...S.input, minHeight: 48, resize: "vertical" }} placeholder="Document any protocol modifications, patient-specific adjustments, or clinical rationale..." />
            </div>
            <div style={{
              marginTop: 12, padding: "8px 14px", background: C.amberBg,
              border: `1px solid ${C.amber}33`, borderRadius: 6,
              fontSize: 10, color: C.amber, fontWeight: 600,
            }}>
              This protocol must be reviewed and approved by a licensed veterinarian before being applied to a patient. Unsigned protocols are for reference only.
            </div>
          </div>

          {/* ── Legal Disclaimer & ACVSMR Standards Footer ── */}
          <div style={{
            ...S.card, background: "#0A2540", border: "1px solid #1E3A5F",
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>DISCLAIMER:</strong> This document is generated by K9 Rehab Pro, a clinical decision-support system (CDSS). It does not establish a veterinarian-client-patient relationship (VCPR), provide a medical diagnosis, or replace in-person veterinary examination. All rehabilitation protocols must be reviewed, modified as clinically appropriate, and approved by a licensed veterinarian before implementation. The platform owner assumes no liability for clinical outcomes resulting from protocol application without proper veterinary oversight.
            </div>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                Practice-Type Applicability
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                <div><strong style={{ color: "rgba(255,255,255,0.6)" }}>General Practice:</strong> Protocols require oversight by attending DVM. Refer complex cases to CCRP/CCRT-certified clinicians.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.6)" }}>Rehabilitation Centers:</strong> Intended for use by CCRP, CCRT, or ACVSMR-certified professionals with direct patient access.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.6)" }}>Specialty Hospitals:</strong> Integrate with existing treatment plans. Coordinate with surgical, neurology, and oncology teams as indicated.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.6)" }}>Universities:</strong> Suitable for clinical teaching under faculty supervision. Not for unsupervised student application.</div>
              </div>
            </div>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>
                Protocol generated per ACVSMR standards · Millis & Levine methodology · Evidence-based exercise selection
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                K9 Rehab Pro™ · Clinical Decision-Support System
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 24, width: 560,
            maxHeight: "80vh", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#0F4C81", fontSize: 16 }}>
                Add Exercise to Week {typeof addingToWeek === "number" ? addingToWeek + 1 : addingToWeek}
              </h3>
              <button onClick={() => { setShowAddModal(false); setExSearch(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#718096" }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <FiSearch size={14} style={{ position: "absolute", left: 10, top: 10, color: "#A0AEC0" }} />
              <input style={{ ...S.input, paddingLeft: 32 }}
                placeholder="Search exercises by name or category…"
                value={exSearch} onChange={e => setExSearch(e.target.value)}
                autoFocus />
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {filteredEx.slice(0, 40).map(ex => (
                <div key={ex.code}
                  onClick={() => addExercise(addingToWeek, ex)}
                  style={{
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                    marginBottom: 4, border: "1px solid #F0F4F8",
                    transition: "background 0.1s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F0F4F8"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1A202C" }}>{ex.name}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                    <span style={S.badge("blue")}>{ex.category}</span>
                    <span style={S.badge(ex.difficulty_level === "Easy" ? "green" : ex.difficulty_level === "Advanced" ? "orange" : "blue")}>
                      {ex.difficulty_level}
                    </span>
                  </div>
                </div>
              ))}
              {filteredEx.length === 0 && (
                <div style={{ textAlign: "center", color: "#A0AEC0", padding: 24 }}>No exercises found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
