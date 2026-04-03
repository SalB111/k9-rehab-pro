import React from "react";
import { FiUsers, FiAlertTriangle, FiShield, FiHeart } from "react-icons/fi";
import { TbDog, TbCat, TbStethoscope } from "react-icons/tb";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import { BREEDS, FELINE_BREEDS, FELINE_HCM_BREEDS, HOSPITALS } from "./constants";

// ── Phone auto-format ──
function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ── Reusable Section ──
function Section({ title, subtitle, icon: Icon, color, children }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 12, padding: "20px 24px", marginBottom: 16,
      border: `1px solid ${C.border}`, borderLeft: `4px solid ${color}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: subtitle ? 4 : 10 }}>
        <Icon size={18} style={{ color, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</div>
      </div>
      {subtitle && <div style={{ fontSize: 11, color: C.textLight, marginBottom: 14, paddingLeft: 28 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

// ── Styled input helper ──
const inp = { padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 };

export default function Step1ClientPatient({ form, setField, goToStep, handleWeightKg, handleWeightLbs, handleDob, handleAge, handleZip, weightWarning }) {
  const phoneHandler = (field) => (e) => setField(field, formatPhone(e.target.value));
  const isFeline = form.species === "Feline";

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <SectionHead icon={FiUsers} title="Patient & Owner Information" />
      </div>

      {/* ═══ 1. CLIENT / OWNER ═══ */}
      <Section title="Client / Owner Information" subtitle="Contact details and billing information" icon={FiUsers} color="#0EA5E9">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ ...S.label, fontWeight: 700 }}>Last Name</label>
            <input style={{ ...S.input, ...inp }} value={form.clientLastName} onChange={e => setField("clientLastName", e.target.value)} placeholder="Last Name" />
          </div>
          <div>
            <label style={{ ...S.label, fontWeight: 700 }}>First Name</label>
            <input style={{ ...S.input, ...inp }} value={form.clientFirstName} onChange={e => setField("clientFirstName", e.target.value)} placeholder="First Name" />
          </div>
          <div>
            <label style={S.label}>Email Address</label>
            <input style={{ ...S.input, ...inp }} type="email" value={form.clientEmail} onChange={e => setField("clientEmail", e.target.value)} placeholder="client@email.com" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={S.label}>Phone</label>
            <input style={{ ...S.input, ...inp }} value={form.clientPhone} onChange={phoneHandler("clientPhone")} placeholder="(555) 000-0000" maxLength={14} />
          </div>
          <div>
            <label style={S.label}>Secondary Phone</label>
            <input style={{ ...S.input, ...inp }} value={form.clientPhone2} onChange={phoneHandler("clientPhone2")} placeholder="(555) 000-0000" maxLength={14} />
          </div>
          <div>
            <label style={S.label}>Mailing Address</label>
            <input style={{ ...S.input, ...inp }} value={form.mailingAddress} onChange={e => setField("mailingAddress", e.target.value)} placeholder="Street Address" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px 1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={S.label}>ZIP</label>
            <input style={{ ...S.input, ...inp }} value={form.zipCode} onChange={e => handleZip(e.target.value)} placeholder="00000" maxLength={5} />
          </div>
          <div>
            <label style={S.label}>City</label>
            <input style={{ ...S.input, ...inp, background: form.city ? `${C.green}08` : undefined }} value={form.city} onChange={e => setField("city", e.target.value)} placeholder="Auto-filled" />
          </div>
          <div>
            <label style={S.label}>State</label>
            <input style={{ ...S.input, ...inp, background: form.state ? `${C.green}08` : undefined }} value={form.state} onChange={e => setField("state", e.target.value)} placeholder="ST" />
          </div>
          <div>
            <label style={S.label}>Insurance</label>
            <input style={{ ...S.input, ...inp }} value={form.insuranceProvider} onChange={e => setField("insuranceProvider", e.target.value)} placeholder="Trupanion, etc." />
          </div>
          <div>
            <label style={S.label}>Policy #</label>
            <input style={{ ...S.input, ...inp }} value={form.insurancePolicyNumber} onChange={e => setField("insurancePolicyNumber", e.target.value)} placeholder="Policy #" />
          </div>
          <div>
            <label style={S.label}>Payment</label>
            <select style={{ ...S.select, ...inp, width: "100%" }} value={form.paymentMethod} onChange={e => setField("paymentMethod", e.target.value)}>
              <option value="">---</option>
              <option value="Insurance">Insurance</option>
              <option value="Self-Pay">Self-Pay</option>
              <option value="Payment Plan">Payment Plan</option>
              <option value="University/Teaching Hospital">University</option>
              <option value="Corporate Account">Corporate</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ═══ 2. PATIENT SIGNALMENT ═══ */}
      <Section title="Patient Signalment" subtitle="Species, breed, demographics, and medical history" icon={isFeline ? TbCat : TbDog} color={isFeline ? "#8B5CF6" : "#1D9E75"}>
        {/* Species Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `2px solid ${C.border}` }}>
            {["Canine", "Feline"].map(sp => (
              <button key={sp}
                onClick={() => { setField("species", sp); setField("breed", ""); setField("diagnosis", ""); }}
                style={{
                  padding: "8px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
                  background: form.species === sp ? (sp === "Feline" ? "#8B5CF6" : C.teal) : C.bg,
                  color: form.species === sp ? "#fff" : C.textLight,
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                }}>
                {sp === "Canine" ? <TbDog size={16} /> : <TbCat size={16} />} {sp}
              </button>
            ))}
          </div>
          {/* HCM warning */}
          {isFeline && form.breed && FELINE_HCM_BREEDS.has(form.breed) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: "#8B5CF610", border: "1px solid #8B5CF630" }}>
              <FiAlertTriangle size={13} style={{ color: "#8B5CF6" }} />
              <span style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 600 }}>HCM-risk breed — confirm cardiac clearance</span>
            </div>
          )}
          {/* Geriatric cat flag */}
          {isFeline && parseFloat(form.age) >= 10 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}30` }}>
              <FiAlertTriangle size={13} style={{ color: C.amber }} />
              <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>Geriatric cat — OA screening recommended</span>
            </div>
          )}
        </div>

        {/* Name, Sex, Breed */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ ...S.label, fontWeight: 700 }}>Patient Name *</label>
            <input style={{ ...S.input, ...inp, border: `2px solid ${C.border}` }} value={form.patientName} onChange={e => setField("patientName", e.target.value)} placeholder="Patient Name" />
          </div>
          <div>
            <label style={{ ...S.label, fontWeight: 700 }}>Sex</label>
            <select style={{ ...S.select, ...inp, width: "100%" }} value={form.sex} onChange={e => setField("sex", e.target.value)}>
              <option value="">---</option>
              <option value="Male Intact">♂ Male Intact</option>
              <option value="Male Neutered">♂ Male Neutered</option>
              <option value="Female Intact">♀ Female Intact</option>
              <option value="Female Spayed">♀ Female Spayed</option>
            </select>
          </div>
          <div>
            <label style={{ ...S.label, fontWeight: 700 }}>Breed</label>
            <select style={{ ...S.select, ...inp, width: "100%" }} value={form.breed} onChange={e => setField("breed", e.target.value)}>
              <option value="">--- Select ---</option>
              {(isFeline ? FELINE_BREEDS : BREEDS).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* DOB, Age, Weight */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={S.label}>Date of Birth</label>
            <input style={{ ...S.input, ...inp }} type="date" value={form.dob} onChange={e => handleDob(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Age (yr)</label>
            <input style={{ ...S.input, ...inp }} type="number" min="0" max="25" value={form.age} onChange={e => handleAge(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={S.label}>Weight (KG)</label>
            <input style={{ ...S.input, ...inp }} type="number" min="0" step="0.5" value={form.weightKg} onChange={e => handleWeightKg(e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <label style={S.label}>Weight (LBS)</label>
            <input style={{ ...S.input, ...inp }} type="number" min="0" step="1" value={form.weightLbs} onChange={e => handleWeightLbs(e.target.value)} placeholder="0.0" />
          </div>
        </div>

        {/* Weight warning */}
        {weightWarning && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, padding: "10px 14px",
            background: weightWarning.includes("CRITICAL") ? `${C.red}08` : `${C.amber}08`,
            border: `2px solid ${weightWarning.includes("CRITICAL") ? C.red : C.amber}40`, borderRadius: 8 }}>
            <FiAlertTriangle size={16} style={{ color: weightWarning.includes("CRITICAL") ? C.red : C.amber, flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: weightWarning.includes("CRITICAL") ? C.red : C.amber }}>
                {weightWarning.includes("CRITICAL") ? "DOSING SAFETY ALERT" : "Weight Verification"}
              </div>
              <span style={{ fontSize: 11, color: weightWarning.includes("CRITICAL") ? C.red : C.amber }}>{weightWarning}</span>
            </div>
          </div>
        )}

        {/* Medications, Allergies, Temperament */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={S.label}>Current Medications</label>
            <input style={{ ...S.input, ...inp }} value={form.currentMedications} onChange={e => setField("currentMedications", e.target.value)} placeholder="e.g. Carprofen 75mg BID, Gabapentin 100mg TID" />
          </div>
          <div>
            <label style={S.label}>Medications Last Given</label>
            <input style={{ ...S.input, ...inp }} value={form.medsLastGiven} onChange={e => setField("medsLastGiven", e.target.value)} placeholder="e.g. Today 8:00 AM" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={S.label}>Allergies / Sensitivities</label>
            <input style={{ ...S.input, ...inp }} value={form.allergies} onChange={e => setField("allergies", e.target.value)} placeholder="e.g. NSAID sensitivity, latex" />
          </div>
          <div>
            <label style={S.label}>Patient Temperament</label>
            <select style={{ ...S.select, ...inp, width: "100%" }} value={form.temperament} onChange={e => setField("temperament", e.target.value)}>
              <option value="">---</option>
              <option value="Cooperative">Cooperative — Tolerates handling</option>
              <option value="Anxious">Anxious — Needs slow approach</option>
              <option value="Fearful">Fearful — May require desensitization</option>
              <option value="Reactive">Reactive — May snap under stress</option>
              <option value="Aggressive">Aggressive — Muzzle required</option>
              <option value="Sedation Required">Sedation Required</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ═══ 3. REFERRAL & CLINICAL TEAM ═══ */}
      <Section title="Referral & Clinical Team" subtitle="Referring veterinarian and treating clinician" icon={TbStethoscope} color="#BA7517">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={S.label}>Referring Veterinarian</label>
            <input style={{ ...S.input, ...inp }} value={form.referringVet} onChange={e => setField("referringVet", e.target.value)} placeholder="DVM Name, Practice" />
          </div>
          <div>
            <label style={S.label}>Referring Clinic Phone</label>
            <input style={{ ...S.input, ...inp }} value={form.referringClinicPhone} onChange={phoneHandler("referringClinicPhone")} placeholder="(555) 000-0000" maxLength={14} />
          </div>
          <div>
            <label style={S.label}>Referring Clinic Email</label>
            <input style={{ ...S.input, ...inp }} type="email" value={form.referringClinicEmail} onChange={e => setField("referringClinicEmail", e.target.value)} placeholder="clinic@email.com" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ ...S.label, fontWeight: 700 }}>Treating Clinician *</label>
            <input style={{ ...S.input, ...inp, border: `2px solid ${C.border}` }} value={form.treatingClinician} onChange={e => setField("treatingClinician", e.target.value)} placeholder="Dr. Jane Smith" />
          </div>
          <div>
            <label style={S.label}>Credentials</label>
            <select style={{ ...S.select, ...inp, width: "100%" }} value={form.clinicianCredentials} onChange={e => setField("clinicianCredentials", e.target.value)}>
              <option value="">---</option>
              {["DVM, CCRP", "DVM, CCRT", "DVM, DACVSMR", "DVM", "PT, CCRT", "VTS (Physical Rehabilitation)", "CVT, CCRP", "RVT, CCRT"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Nearby Hospital</label>
            <select style={{ ...S.select, ...inp, width: "100%" }} value={form.nearbyHospital} onChange={e => setField("nearbyHospital", e.target.value)}>
              <option value="">---</option>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* ═══ 4. CLIENT CONSENT ═══ */}
      <Section title="Client Consent & Authorization" icon={FiShield} color="#1D9E75">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.text,
            background: form.clientConsentObtained ? `${C.green}12` : C.surface, border: form.clientConsentObtained ? `2px solid ${C.green}` : `1px solid ${C.border}`, flex: 1 }}>
            <input type="checkbox" checked={form.clientConsentObtained || false} onChange={e => setField("clientConsentObtained", e.target.checked)}
              style={{ accentColor: C.green, width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
            Client informed of rehabilitation plan, risks, alternatives, and costs. Consent obtained.
          </label>
          <div style={{ minWidth: 160 }}>
            <label style={S.label}>Consent Date</label>
            <input style={{ ...S.input, ...inp }} type="date" value={form.clientConsentDate} onChange={e => setField("clientConsentDate", e.target.value)} />
          </div>
        </div>
      </Section>

      <StepNavButtons onNext={() => goToStep(2)} nextLabel="Next: Clinical Assessment →" />
    </>
  );
}
