import React from "react";
import { FiUsers, FiChevronRight, FiAlertTriangle, FiPhone, FiMail, FiShield } from "react-icons/fi";
import { TbDog, TbCat, TbStethoscope } from "react-icons/tb";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import { BREEDS, FELINE_BREEDS, FELINE_HCM_BREEDS, HOSPITALS } from "./constants";

// ── Phone auto-format: (xxx) xxx-xxxx ──
function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function Step1ClientPatient({ form, setField, goToStep, handleWeightKg, handleWeightLbs, handleDob, handleAge, handleZip, weightWarning }) {
  const phoneHandler = (field) => (e) => setField(field, formatPhone(e.target.value));

  return (
    <>
      {/* ═══════════ SECTION 1: CLIENT / OWNER INFORMATION ═══════════ */}
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" }}>
        <SectionHead icon={FiUsers} title="Client / Owner Information" />
        {/* Row 1: Last Name, First Name, Email */}
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Last Name</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.clientLastName} onChange={e => setField("clientLastName", e.target.value)} placeholder="Last Name" />
          </div>
          <div>
            <label style={S.label}>First Name</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.clientFirstName} onChange={e => setField("clientFirstName", e.target.value)} placeholder="First Name" />
          </div>
          <div>
            <label style={S.label}>Email Address</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="email" value={form.clientEmail} onChange={e => setField("clientEmail", e.target.value)} placeholder="client@email.com" />
          </div>
        </div>

        {/* Row 2: Phone, Secondary Phone */}
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Phone Number</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.clientPhone} onChange={phoneHandler("clientPhone")} placeholder="(555) 000-0000" maxLength={14} />
          </div>
          <div>
            <label style={S.label}>Secondary Phone (Optional)</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.clientPhone2} onChange={phoneHandler("clientPhone2")} placeholder="(555) 000-0000" maxLength={14} />
          </div>
          <div />
        </div>

        {/* Row 3: Address, ZIP */}
        <div style={{ ...S.grid(4), marginTop: 12 }}>
          <div style={{ gridColumn: "1 / 3" }}>
            <label style={S.label}>Mailing Address</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.mailingAddress} onChange={e => setField("mailingAddress", e.target.value)} placeholder="Street Address" />
          </div>
          <div>
            <label style={S.label}>ZIP Code</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}`, maxWidth: 120 }} value={form.zipCode} onChange={e => handleZip(e.target.value)} placeholder="00000" maxLength={5} />
          </div>
          <div />
        </div>

        {/* Row 4: City, State */}
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>City</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}`, background: form.city ? C.greenBg : C.surface }} value={form.city} onChange={e => setField("city", e.target.value)} placeholder="Auto-filled from ZIP" />
          </div>
          <div>
            <label style={S.label}>State</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}`, maxWidth: 80, background: form.state ? C.greenBg : C.surface }} value={form.state} onChange={e => setField("state", e.target.value)} placeholder="ST" />
          </div>
          <div />
        </div>

        {/* Row 5: Insurance / Billing */}
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Insurance Provider (Optional)</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.insuranceProvider} onChange={e => setField("insuranceProvider", e.target.value)} placeholder="e.g. Trupanion, Nationwide, ASPCA" />
          </div>
          <div>
            <label style={S.label}>Policy Number</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.insurancePolicyNumber} onChange={e => setField("insurancePolicyNumber", e.target.value)} placeholder="Policy #" />
          </div>
          <div>
            <label style={S.label}>Payment Method</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.paymentMethod} onChange={e => setField("paymentMethod", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="Insurance">Insurance</option>
              <option value="Self-Pay">Self-Pay</option>
              <option value="Payment Plan">Payment Plan</option>
              <option value="University/Teaching Hospital">University / Teaching Hospital</option>
              <option value="Corporate Account">Corporate Account</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 2: PATIENT SIGNALMENT ═══════════ */}
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" }}>
        <SectionHead icon={form.species === "Feline" ? TbCat : TbDog} title="Patient Signalment" />

        {/* ── SPECIES TOGGLE ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Species</span>
          <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1.5px solid ${C.border}` }}>
            {["Canine", "Feline"].map(sp => (
              <button
                key={sp}
                onClick={() => { setField("species", sp); setField("breed", ""); setField("diagnosis", ""); }}
                style={{
                  padding: "7px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", outline: "none",
                  background: form.species === sp ? (sp === "Feline" ? "#7c3aed" : C.blue) : C.surface,
                  color: form.species === sp ? "#fff" : C.muted,
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s"
                }}
              >
                {sp === "Canine" ? <TbDog size={16} /> : <TbCat size={16} />}
                {sp}
              </button>
            ))}
          </div>

          {/* HCM breed warning for feline */}
          {form.species === "Feline" && form.breed && FELINE_HCM_BREEDS.has(form.breed) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, background: "#7c3aed22", border: "1.5px solid #7c3aed" }}>
              <FiAlertTriangle size={14} style={{ color: "#a78bfa", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>HCM-risk breed — cardiac screening recommended before protocol</span>
            </div>
          )}

          {/* Geriatric OA flag for cats >10yr */}
          {form.species === "Feline" && parseFloat(form.age) >= 10 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, background: "#f5a62322", border: "1.5px solid #f5a623" }}>
              <FiAlertTriangle size={14} style={{ color: "#f5a623", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#f5a623", fontWeight: 600 }}>Geriatric cat ≥10yr — OA screening indicated (90% radiographic prevalence)</span>
            </div>
          )}
        </div>
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Patient Name <span style={{color:C.red}}>*</span></label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.patientName}
              onChange={e => setField("patientName", e.target.value)} placeholder="Patient Name" />
          </div>
          <div>
            <label style={S.label}>Sex</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.sex} onChange={e => setField("sex", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="Male Intact">♂ Male Intact</option>
              <option value="Male Neutered">♂ Male Neutered</option>
              <option value="Female Intact">♀ Female Intact</option>
              <option value="Female Spayed">♀ Female Spayed</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Breed</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.breed} onChange={e => setField("breed", e.target.value)}>
              <option value="">--- Select ---</option>
              {(form.species === "Feline" ? FELINE_BREEDS : BREEDS).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ ...S.grid(4), marginTop: 12 }}>
          <div>
            <label style={S.label}>Date of Birth</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="date" value={form.dob} onChange={e => handleDob(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Age (Years)</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}`, maxWidth: 80 }} type="number" min="0" max="25" step="1" value={form.age}
              onChange={e => handleAge(e.target.value)} onInput={e => handleAge(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={S.label}>Weight (KG)</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}`, maxWidth: 100 }} type="number" min="0" step="0.5" value={form.weightKg}
              onChange={e => handleWeightKg(e.target.value)} onInput={e => handleWeightKg(e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <label style={S.label}>Weight (LBS)</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}`, maxWidth: 100 }} type="number" min="0" step="1" value={form.weightLbs}
              onChange={e => handleWeightLbs(e.target.value)} onInput={e => handleWeightLbs(e.target.value)} placeholder="0.0" />
          </div>
        </div>
        {weightWarning && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10, marginTop: 10, padding: "12px 16px",
            background: weightWarning.includes("CRITICAL") ? C.redBg : C.amberBg,
            border: weightWarning.includes("CRITICAL") ? `2px solid ${C.red}` : `1.5px solid ${C.amber}`,
            borderRadius: 8,
          }}>
            <FiAlertTriangle size={18} style={{
              color: weightWarning.includes("CRITICAL") ? C.red : C.amber,
              flexShrink: 0, marginTop: 2
            }} />
            <div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: weightWarning.includes("CRITICAL") ? C.red : C.amber,
                marginBottom: 2,
              }}>
                {weightWarning.includes("CRITICAL") ? "DOSING SAFETY ALERT" : "Weight Verification Needed"}
              </div>
              <span style={{
                fontSize: 11, lineHeight: 1.5,
                color: weightWarning.includes("CRITICAL") ? C.red : C.amber,
                fontWeight: 500,
              }}>{weightWarning}</span>
            </div>
          </div>
        )}
        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Current Medications</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.currentMedications} onChange={e => setField("currentMedications", e.target.value)}
              placeholder="e.g. Carprofen 75mg BID, Gabapentin 100mg TID" />
          </div>
          <div>
            <label style={S.label}>Medications Last Given</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.medsLastGiven} onChange={e => setField("medsLastGiven", e.target.value)}
              placeholder="e.g. Today 8:00 AM, Yesterday PM" />
          </div>
        </div>
        <div style={{ ...S.grid(2), marginTop: 12 }}>
          <div>
            <label style={S.label}>Allergies / Sensitivities</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.allergies} onChange={e => setField("allergies", e.target.value)}
              placeholder="e.g. NSAID sensitivity, latex, adhesive tape, bee stings" />
          </div>
          <div>
            <label style={S.label}>Patient Temperament</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.temperament} onChange={e => setField("temperament", e.target.value)}>
              <option value="">--- Select ---</option>
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

      {/* ═══════════ REFERRAL & CLINICAL TEAM ═══════════ */}
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" }}>
        <SectionHead icon={TbStethoscope} title="Referral & Clinical Team" />
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Referring Veterinarian</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.referringVet} onChange={e => setField("referringVet", e.target.value)} placeholder="DVM Name, Practice" />
          </div>
          <div>
            <label style={S.label}>Referring Clinic Phone</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.referringClinicPhone} onChange={phoneHandler("referringClinicPhone")} placeholder="(555) 000-0000" maxLength={14} />
          </div>
          <div>
            <label style={S.label}>Referring Clinic Email</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="email" value={form.referringClinicEmail} onChange={e => setField("referringClinicEmail", e.target.value)} placeholder="clinic@email.com" />
          </div>
        </div>
        <div style={{ ...S.grid(3), marginTop: 12 }}>
          <div>
            <label style={S.label}>Treating Clinician / Therapist <span style={{color:C.red}}>*</span></label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.treatingClinician} onChange={e => setField("treatingClinician", e.target.value)} placeholder="Dr. Jane Smith" />
          </div>
          <div>
            <label style={S.label}>Credentials</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.clinicianCredentials} onChange={e => setField("clinicianCredentials", e.target.value)}>
              <option value="">--- Select ---</option>
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
          <div>
            <label style={S.label}>Nearby Veterinary Hospital</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.nearbyHospital} onChange={e => setField("nearbyHospital", e.target.value)}>
              <option value="">--- Select ---</option>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════ CLIENT CONSENT & AUTHORIZATION (Bottom) ═══════════ */}
      <div style={{ marginBottom: 12, padding: "12px 16px", background: "rgba(14,165,233,0.06)", border: "1.5px solid rgba(14,165,233,0.25)", borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          Client Consent &amp; Authorization
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "8px 14px", background: form.clientConsentObtained ? "rgba(16,185,129,0.15)" : C.bg,
            border: form.clientConsentObtained ? `1.5px solid ${C.green}` : `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.text,
            transition: "all 0.2s", flex: 1 }}>
            <input type="checkbox" checked={form.clientConsentObtained} onChange={e => setField("clientConsentObtained", e.target.checked)}
              style={{ accentColor: C.green, width: 16, height: 16, cursor: "pointer" }} />
            Client informed of rehabilitation plan, risks, alternatives, and estimated costs. Verbal/written consent obtained.
          </label>
          <div style={{ minWidth: 160 }}>
            <label style={S.label}>Consent Date</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} type="date" value={form.clientConsentDate} onChange={e => setField("clientConsentDate", e.target.value)} />
          </div>
        </div>
      </div>

      <StepNavButtons onNext={() => goToStep(2)} nextLabel="Next: Clinical Assessment" />
    </>
  );
}
