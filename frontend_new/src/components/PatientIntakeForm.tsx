import React, { useEffect, useMemo, useState } from "react";
import { apiService, PatientData } from "../services/api";
import "./PatientIntakeForm.css";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const REFERRAL_HOSPITALS = [
  "BluePearl Pet Hospital",
  "VCA Animal Specialty Group",
  "MedVet",
  "Veterinary Emergency Group (VEG)",
  "Ethos Veterinary Health",
  "NVA Compassion-First",
  "Animal Emergency and Referral Center",
  "Veterinary Specialty Hospital",
  "University Veterinary Teaching Hospital",
  "Local Specialty Referral Center",
];

const SPECIES_OPTIONS = ["Canine", "Feline", "Equine", "Other"];

const DIAGNOSIS_GROUPS: Array<{ label: string; options: Array<{ value: string; label: string }> }> = [
  {
    label: "Surgical / Post-Operative",
    options: [
      { value: "TPLO", label: "TPLO - Post-Op" },
      { value: "TTA", label: "TTA - Post-Op" },
      { value: "POST_FHO", label: "Femoral Head Ostectomy - Post-Op" },
      { value: "POST_THR", label: "Total Hip Replacement - Post-Op" },
      { value: "POST_PATELLA", label: "Patellar Repair - Post-Op" },
      { value: "IVDD_POSTOP", label: "IVDD Hemilaminectomy - Post-Op" },
    ],
  },
  {
    label: "Non-Surgical Orthopedic",
    options: [
      { value: "CCL_CONSERV", label: "CCL Rupture - Conservative" },
      { value: "HIP_DYSPLASIA", label: "Hip Dysplasia" },
      { value: "OA_MULTI", label: "Osteoarthritis - Multi Joint" },
      { value: "ELBOW_DYSPLASIA", label: "Elbow Dysplasia" },
      { value: "SHOULDER_INSTAB", label: "Shoulder Instability" },
      { value: "PATELLA_LUX", label: "Patellar Luxation" },
    ],
  },
  {
    label: "Neurologic / Spinal",
    options: [
      { value: "IVDD_CONSERV", label: "IVDD - Conservative" },
      { value: "FCE", label: "Fibrocartilaginous Embolism (FCE)" },
      { value: "DM", label: "Degenerative Myelopathy" },
      { value: "WOBBLER", label: "Wobbler Syndrome" },
    ],
  },
  {
    label: "Chronic Mobility and Geriatric",
    options: [
      { value: "GERIATRIC", label: "Geriatric Mobility Dysfunction" },
      { value: "CHRONIC_PAIN", label: "Chronic Pain Management" },
      { value: "HIP_OA", label: "Hip Osteoarthritis" },
    ],
  },
];

const BREEDS = [
  "Airedale Terrier","Akita","Alaskan Malamute","American Bulldog","American Eskimo Dog","American Pit Bull Terrier",
  "American Staffordshire Terrier","Australian Cattle Dog","Australian Shepherd","Basenji","Basset Hound","Beagle",
  "Bearded Collie","Beauceron","Belgian Malinois","Belgian Sheepdog","Bernese Mountain Dog","Bichon Frise",
  "Black and Tan Coonhound","Bloodhound","Border Collie","Border Terrier","Borzoi","Boston Terrier","Bouvier des Flandres",
  "Boxer","Brittany","Brussels Griffon","Bull Terrier","Bulldog","Bullmastiff","Cairn Terrier","Cane Corso",
  "Cavalier King Charles Spaniel","Chesapeake Bay Retriever","Chihuahua","Chinese Crested","Chow Chow","Cocker Spaniel",
  "Collie","Corgi (Cardigan)","Corgi (Pembroke)","Dachshund","Dalmatian","Doberman Pinscher","Dogo Argentino",
  "English Cocker Spaniel","English Setter","English Springer Spaniel","English Toy Spaniel","Field Spaniel",
  "Finnish Spitz","Flat-Coated Retriever","French Bulldog","German Pinscher","German Shepherd Dog","German Shorthaired Pointer",
  "German Wirehaired Pointer","Giant Schnauzer","Glen of Imaal Terrier","Golden Retriever","Gordon Setter","Great Dane",
  "Great Pyrenees","Greyhound","Havanese","Irish Setter","Irish Terrier","Irish Wolfhound","Italian Greyhound",
  "Jack Russell Terrier","Japanese Chin","Keeshond","Kerry Blue Terrier","Komondor","Kuvasz","Labrador Retriever",
  "Lagotto Romagnolo","Leonberger","Lhasa Apso","Maltese","Mastiff","Miniature Pinscher","Miniature Schnauzer",
  "Newfoundland","Norfolk Terrier","Norwegian Elkhound","Nova Scotia Duck Tolling Retriever","Old English Sheepdog",
  "Papillon","Pekingese","Pomeranian","Poodle","Portuguese Water Dog","Pug","Rhodesian Ridgeback","Rottweiler",
  "Saint Bernard","Samoyed","Schipperke","Scottish Terrier","Shetland Sheepdog","Shiba Inu","Shih Tzu","Siberian Husky",
  "Soft Coated Wheaten Terrier","Staffordshire Bull Terrier","Standard Schnauzer","Vizsla","Weimaraner","Welsh Corgi",
  "West Highland White Terrier","Whippet","Wire Fox Terrier","Yorkshire Terrier",
].sort((a, b) => a.localeCompare(b));

type ClinicalFlags = {
  openWound: boolean;
  uncontrolledPain: boolean;
  nonWeightBearing: boolean;
  neurologicDeficit: boolean;
  systemicIllness: boolean;
};

const defaultFlags: ClinicalFlags = {
  openWound: false,
  uncontrolledPain: false,
  nonWeightBearing: false,
  neurologicDeficit: false,
  systemicIllness: false,
};

type IntakeStep = "client_patient" | "clinical";
type CarePath = "post_op" | "non_surgical" | "conservative_first";

export default function PatientIntakeForm() {
  const [step, setStep] = useState<IntakeStep>("client_patient");
  const [formData, setFormData] = useState<PatientData>({
    clientName: "",
    patientName: "",
    species: "Canine",
    breed: "Labrador Retriever",
    age: 5,
    weight: 25,
    diagnosis: "TPLO",
    painWithActivity: 5,
    mobilityLevel: 5,
    goals: ["Restore safe ambulation"],
    protocolLength: 8,
  });

  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("CA");
  const [clientZip, setClientZip] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [referringVeterinarian, setReferringVeterinarian] = useState("");
  const [referringHospital, setReferringHospital] = useState(REFERRAL_HOSPITALS[0]);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [carePath, setCarePath] = useState<CarePath>("post_op");
  const [surgeryDate, setSurgeryDate] = useState("");
  const [weightLbs, setWeightLbs] = useState(String(formData.weight));
  const [weightKg, setWeightKg] = useState((formData.weight * 0.45359237).toFixed(2));
  const [goalInput, setGoalInput] = useState("");
  const [flags, setFlags] = useState<ClinicalFlags>(defaultFlags);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [conditions, setConditions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!dateOfBirth) return;
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return;
    const now = new Date();
    const years = Math.max(0, (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    setFormData((prev) => ({ ...prev, age: Number(years.toFixed(1)) }));
  }, [dateOfBirth]);

  useEffect(() => {
    apiService
      .getConditions()
      .then((raw) => {
        if (Array.isArray(raw)) {
          setConditions(raw.map((c) => c.code).filter(Boolean));
          return;
        }
        if (raw && typeof raw === "object" && raw.conditions && typeof raw.conditions === "object") {
          setConditions(Object.keys(raw.conditions));
        }
      })
      .catch(() => setConditions([]));
  }, []);

  const daysPostOp = useMemo(() => {
    if (!surgeryDate) return null;
    const surgery = new Date(surgeryDate);
    if (Number.isNaN(surgery.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - surgery.getTime()) / (1000 * 60 * 60 * 24)));
  }, [surgeryDate]);

  const updateField = <K extends keyof PatientData>(key: K, value: PatientData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleWeightLbsChange = (value: string) => {
    setWeightLbs(value);
    const parsed = Number(value);
    if (Number.isNaN(parsed) || value.trim() === "") {
      setWeightKg("");
      return;
    }
    const kg = parsed * 0.45359237;
    setWeightKg(kg.toFixed(2));
    updateField("weight", Number(parsed.toFixed(2)));
  };

  const handleWeightKgChange = (value: string) => {
    setWeightKg(value);
    const parsed = Number(value);
    if (Number.isNaN(parsed) || value.trim() === "") {
      setWeightLbs("");
      return;
    }
    const lbs = parsed / 0.45359237;
    setWeightLbs(lbs.toFixed(2));
    updateField("weight", Number(lbs.toFixed(2)));
  };

  const addGoal = () => {
    const trimmed = goalInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({ ...prev, goals: [...prev.goals, trimmed] }));
    setGoalInput("");
  };

  const removeGoal = (idx: number) => {
    setFormData((prev) => ({ ...prev, goals: prev.goals.filter((_, i) => i !== idx) }));
  };

  const toggleFlag = (key: keyof ClinicalFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await apiService.generateProtocol(formData);
      setSuccess("Protocol generated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Protocol generation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="intake-shell">
      <div className="intake-container">
        <header className="intake-header">
          <div className="intake-header-top">
            <div className="intake-badge">Clinical Suite</div>
            <div className="intake-meta">
              <span>Veterinary Rehab Intake</span>
              <span>Institutional Demo Build</span>
            </div>
          </div>
          <h1>K9-Rehab-Protocal</h1>
          <p>Evidence-oriented rehabilitation intake interface for clinical and academic presentation.</p>
        </header>

        <div className="stepbar">
          <button
            type="button"
            className={`stepchip ${step === "client_patient" ? "active" : ""}`}
            onClick={() => setStep("client_patient")}
          >
            1. Client + Patient
          </button>
          <button
            type="button"
            className={`stepchip ${step === "clinical" ? "active" : ""}`}
            onClick={() => setStep("clinical")}
          >
            2. Clinical Assessment
          </button>
        </div>

        <form onSubmit={handleSubmit} className="intake-card">
          {step === "client_patient" && (
            <>
              <section className="form-section">
                <div className="section-head">
                  <div className="section-index">01</div>
                  <div>
                    <h2>Client Information</h2>
                    <p>Primary owner and referral source details for intake record integrity.</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label className="field span-6">
                    <span>Client Name</span>
                    <input value={formData.clientName} onChange={(e) => updateField("clientName", e.target.value)} />
                  </label>
                  <label className="field span-6">
                    <span>Referring Veterinarian</span>
                    <input value={referringVeterinarian} onChange={(e) => setReferringVeterinarian(e.target.value)} />
                  </label>
                  <label className="field span-8">
                    <span>Address</span>
                    <input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
                  </label>
                  <label className="field span-4">
                    <span>Referring Hospital</span>
                    <select value={referringHospital} onChange={(e) => setReferringHospital(e.target.value)}>
                      {REFERRAL_HOSPITALS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field span-4">
                    <span>City</span>
                    <input value={clientCity} onChange={(e) => setClientCity(e.target.value)} />
                  </label>
                  <label className="field span-2">
                    <span>State</span>
                    <select value={clientState} onChange={(e) => setClientState(e.target.value)}>
                      {US_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field span-2">
                    <span>ZIP</span>
                    <input value={clientZip} onChange={(e) => setClientZip(e.target.value)} />
                  </label>
                  <label className="field span-4">
                    <span>Phone Number</span>
                    <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                  </label>
                  <label className="field span-4">
                    <span>Secondary Number (Optional)</span>
                    <input value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} />
                  </label>
                </div>
              </section>

              <section className="form-section">
                <div className="section-head">
                  <div className="section-index">02</div>
                  <div>
                    <h2>Patient Information</h2>
                    <p>Signalment and weight profiling for rehabilitation dosing and progression planning.</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label className="field span-4">
                    <span>Patient Name</span>
                    <input value={formData.patientName} onChange={(e) => updateField("patientName", e.target.value)} />
                  </label>
                  <label className="field span-4">
                    <span>Species</span>
                    <select value={formData.species} onChange={(e) => updateField("species", e.target.value)}>
                      {SPECIES_OPTIONS.map((sp) => (
                        <option key={sp} value={sp}>{sp}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field span-4">
                    <span>Breed</span>
                    <select value={formData.breed} onChange={(e) => updateField("breed", e.target.value)}>
                      {BREEDS.map((breed) => (
                        <option key={breed} value={breed}>{breed}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field span-3">
                    <span>D.O.B.</span>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                  </label>
                  <label className="field span-3">
                    <span>Age</span>
                    <input type="number" min={0} step="0.1" value={formData.age} onChange={(e) => updateField("age", Number(e.target.value))} />
                  </label>
                  <div className="field split span-6">
                    <span>Weight</span>
                    <div className="split-grid">
                      <label className="field">
                        <span>lbs</span>
                        <input type="number" min={0} step="0.01" value={weightLbs} onChange={(e) => handleWeightLbsChange(e.target.value)} />
                      </label>
                      <label className="field">
                        <span>kg</span>
                        <input type="number" min={0} step="0.01" value={weightKg} onChange={(e) => handleWeightKgChange(e.target.value)} />
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <div className="action-row">
                <button type="button" className="btn btn-primary" onClick={() => setStep("clinical")}>
                  Next: Clinical Assessment
                </button>
              </div>
            </>
          )}

          {step === "clinical" && (
            <>
              <section className="form-section tone">
                <div className="section-head">
                  <div className="section-index">03</div>
                  <div>
                    <h2>Clinical Assessment</h2>
                    <p>Select rehabilitation pathway and diagnosis profile before protocol generation.</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label className="field span-4">
                    <span>Care Pathway</span>
                    <select value={carePath} onChange={(e) => setCarePath(e.target.value as CarePath)}>
                      <option value="post_op">Post-Operative Rehabilitation</option>
                      <option value="non_surgical">Non-Surgical Rehabilitation</option>
                      <option value="conservative_first">Conservative Care First</option>
                    </select>
                  </label>
                  {carePath === "post_op" && (
                    <label className="field span-4">
                      <span>Surgery Date</span>
                      <input type="date" value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} />
                    </label>
                  )}
                  {carePath === "post_op" && (
                    <label className="field span-4">
                      <span>Days Post-Op</span>
                      <input readOnly value={daysPostOp ?? ""} />
                    </label>
                  )}
                </div>
                <label className="field span-12">
                  <span>Diagnosis</span>
                  <select value={formData.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)}>
                    {DIAGNOSIS_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </optgroup>
                    ))}
                    {conditions.length > 0 && (
                      <optgroup label="Backend Conditions">
                        {conditions.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </label>
              </section>

              <section className="form-section">
                <div className="section-head">
                  <div className="section-index">04</div>
                  <div>
                    <h2>Dosage and Risk Profile</h2>
                    <p>Adjust protocol duration and current clinical tolerance indicators.</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label className="field span-4">
                    <span>Protocol Length</span>
                    <select value={formData.protocolLength} onChange={(e) => updateField("protocolLength", Number(e.target.value))}>
                      <option value={4}>4 Weeks</option>
                      <option value={6}>6 Weeks</option>
                      <option value={8}>8 Weeks</option>
                      <option value={12}>12 Weeks</option>
                    </select>
                  </label>
                </div>
                <div className="range-grid">
                  <label className="field">
                    <span>Pain With Activity: {formData.painWithActivity}/10</span>
                    <input type="range" min={0} max={10} value={formData.painWithActivity} onChange={(e) => updateField("painWithActivity", Number(e.target.value))} />
                  </label>
                  <label className="field">
                    <span>Mobility Level: {formData.mobilityLevel}/10</span>
                    <input type="range" min={0} max={10} value={formData.mobilityLevel} onChange={(e) => updateField("mobilityLevel", Number(e.target.value))} />
                  </label>
                </div>
                <div className="checks-grid">
                  <label><input type="checkbox" checked={flags.openWound} onChange={() => toggleFlag("openWound")} /> Open wound or unhealed incision</label>
                  <label><input type="checkbox" checked={flags.uncontrolledPain} onChange={() => toggleFlag("uncontrolledPain")} /> Uncontrolled pain ({">= 8/10"})</label>
                  <label><input type="checkbox" checked={flags.nonWeightBearing} onChange={() => toggleFlag("nonWeightBearing")} /> Non-weight-bearing status</label>
                  <label><input type="checkbox" checked={flags.neurologicDeficit} onChange={() => toggleFlag("neurologicDeficit")} /> Progressive neurologic deficit</label>
                  <label><input type="checkbox" checked={flags.systemicIllness} onChange={() => toggleFlag("systemicIllness")} /> Systemic illness or fever</label>
                </div>
              </section>

              <section className="form-section">
                <div className="section-head">
                  <div className="section-index">05</div>
                  <div>
                    <h2>Goals</h2>
                    <p>Define measurable outcomes to guide progression criteria.</p>
                  </div>
                </div>
                <div className="goals-row">
                  <input value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="Add treatment goal" />
                  <button type="button" className="btn btn-secondary" onClick={addGoal}>Add</button>
                </div>
                <div className="goal-chips">
                  {formData.goals.map((goal, idx) => (
                    <span key={`${goal}-${idx}`} className="chip">
                      {goal}
                      <button type="button" onClick={() => removeGoal(idx)}>x</button>
                    </span>
                  ))}
                </div>
              </section>

              <label className="review-line">
                <input type="checkbox" checked={reviewConfirmed} onChange={() => setReviewConfirmed((v) => !v)} />
                Licensed veterinarian has reviewed this intake and approves protocol generation.
              </label>

              <div className="action-row">
                <button type="button" className="btn btn-outline" onClick={() => setStep("client_patient")}>Previous</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Generating..." : "Generate Protocol"}
                </button>
              </div>
            </>
          )}

          {error && <p className="status status-error">{error}</p>}
          {success && <p className="status status-success">{success}</p>}
        </form>
      </div>
    </div>
  );
}
