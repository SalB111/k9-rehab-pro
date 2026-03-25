import React from "react";
import { FiCalendar, FiChevronRight, FiAlertTriangle, FiShield, FiCheckCircle, FiActivity } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import { CONDITIONS, FELINE_DIAGNOSES } from "./constants";

export default function Step5ProtocolParams({ form, setField, generate, allExercises, complianceAgreed, setComplianceAgreed, complianceOpen, setComplianceOpen, error, goToStep, loading }) {
  return (
    <>
      {/* ═══════════ SECTION 5: PROTOCOL PARAMETERS ═══════════ */}
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" }}>
        <SectionHead icon={FiCalendar} title="Protocol Parameters" />
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>Protocol Duration</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.protocolLength} onChange={e => setField("protocolLength", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="6">6 weeks — Accelerated (mild)</option>
              <option value="8">8 weeks — Standard post-surgical</option>
              <option value="10">10 weeks — Extended recovery</option>
              <option value="12">12 weeks — Complex / multi-joint</option>
              <option value="16">16 weeks — Conservative / neuro</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Session Frequency (per week)</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.sessionFrequency} onChange={e => setField("sessionFrequency", e.target.value)}>
              <option value="">--- Select ---</option>
              <option value="1">1× per week</option>
              <option value="2">2× per week (Recommended)</option>
              <option value="3">3× per week (Intensive)</option>
              <option value="5">5× per week (Inpatient / Acute)</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Expected Owner Compliance</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.ownerCompliance} onChange={e => setField("ownerCompliance", e.target.value)}>
              <option value="">--- Select ---</option>
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
            padding: "8px 14px", background: C.bg,
            border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.text,
            transition: "all 0.2s" }}>
            <input type="checkbox" checked={form.homeExerciseProgram} onChange={e => setField("homeExerciseProgram", e.target.checked)}
              style={{ accentColor: C.green, width: 16, height: 16, cursor: "pointer" }} />
            Include Home Exercise Program (HEP)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "8px 14px", background: C.bg,
            border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.text,
            transition: "all 0.2s" }}>
            <input type="checkbox" checked={form.aquaticAccess} onChange={e => setField("aquaticAccess", e.target.checked)}
              style={{ accentColor: C.teal, width: 16, height: 16, cursor: "pointer" }} />
            Aquatic Therapy Available (UWTM / Pool)
          </label>
        </div>

        {/* Available Therapeutic Modalities */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Available Therapeutic Modalities
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>Select all modalities available at your facility (determines which interventions can be prescribed)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { key: "modalityUWTM", label: "Underwater Treadmill", icon: "\uD83C\uDF0A" },
              { key: "modalityLaser", label: "Therapeutic Laser (PBM)", icon: "\uD83D\uDD34" },
              { key: "modalityTENS", label: "TENS", icon: "\u26A1" },
              { key: "modalityNMES", label: "NMES / E-Stim", icon: "\u26A1" },
              { key: "modalityTherapeuticUS", label: "Therapeutic Ultrasound", icon: "\uD83D\uDCE1" },
              { key: "modalityShockwave", label: "Shockwave (ESWT)", icon: "\uD83D\uDCA5" },
              { key: "modalityCryotherapy", label: "Cryotherapy", icon: "\u2744\uFE0F" },
              { key: "modalityHeatTherapy", label: "Heat Therapy", icon: "\uD83D\uDD25" },
              { key: "modalityPulsedEMF", label: "Pulsed EMF (PEMF)", icon: "\uD83E\uDDF2" },
            ].map(mod => (
              <label key={mod.key} style={{
                display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                color: C.text,
                background: C.bg,
                border: `1.5px solid ${C.border}`,
                transition: "all 0.2s",
              }}>
                <input type="checkbox" checked={form[mod.key]} onChange={e => setField(mod.key, e.target.checked)}
                  style={{ accentColor: C.teal, width: 14, height: 14, cursor: "pointer" }} />
                <span>{mod.icon}</span> {mod.label}
              </label>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div style={{ marginTop: 14 }}>
          <label style={S.label}>Special Instructions / Clinical Notes</label>
          <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 56, resize: "vertical", fontFamily: "inherit" }} value={form.specialInstructions} onChange={e => setField("specialInstructions", e.target.value)}
            placeholder="e.g. Fearful of water — avoid aquatic initially, aggressive with handling — needs muzzle for manual therapy, owner has pool at home" />
        </div>
      </div>

      {/* ── Home Environment & HEP Equipment — side by side ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Available Home Equipment
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
            For clients following a HEP — what equipment do they have?
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Yoga / exercise mat", "Balance disc / wobble cushion", "Cavaletti poles / PVC rails",
              "Resistance band", "Ramp (car or furniture)", "Stairs (indoor)",
              "Underwater treadmill access", "Pool / swim access", "Therapy ball / peanut ball",
              "Harness / sling", "Cones / weave markers", "Elevated food/water bowls",
              "Orthopedic bed", "Ice packs / cold compress", "Heat pack / warm compress",
              "Treat-dispensing toy (enrichment)"].map(item => (
              <label key={item} style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
                background: C.bg,
                border: `1.5px solid ${C.border}`,
                transition: "all 0.2s",
              }}>
                <input type="checkbox" checked={(form.homeEquipment || []).includes(item)}
                  onChange={e => {
                    const arr = [...(form.homeEquipment || [])];
                    if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                    setField("homeEquipment", arr);
                  }}
                  style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
                {item}
              </label>
            ))}
          </div>
        </div>
        <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Home Environment
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
            Living situation and accessibility considerations
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["House \u2014 single story", "House \u2014 multi-story", "Apartment / condo",
              "Tile / hardwood floors", "Carpet / rugs throughout", "Fenced yard",
              "No yard / urban setting", "Rural / acreage", "Stairs to enter home",
              "Ramp to enter home", "Dog door available", "Crate / confined space available",
              "Other pets in home", "Small children in home"].map(item => (
              <label key={item} style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
                background: C.bg,
                border: `1.5px solid ${C.border}`,
                transition: "all 0.2s",
              }}>
                <input type="checkbox" checked={(form.homeEnvironment || []).includes(item)}
                  onChange={e => {
                    const arr = [...(form.homeEnvironment || [])];
                    if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
                    setField("homeEnvironment", arr);
                  }}
                  style={{ accentColor: C.teal, width: 13, height: 13, cursor: "pointer" }} />
                {item}
              </label>
            ))}
          </div>
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
          for (const [, items] of Object.entries(FELINE_DIAGNOSES)) {
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
            background: C.navy,
            border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12,
            position: "relative", overflow: "hidden", color: "#fff",
          }}>
            {/* Decorative top accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #0F4C81, #0EA5E9, #10B981)" }} />

            <div style={{ ...S.sectionHeader(), marginTop: 4, marginBottom: 0 }}>
              <FiCheckCircle size={14} style={{ color: C.teal }} /> PRE-PROTOCOL SUMMARY
            </div>
            {/* Neon flatline under header */}
            <div style={{ height: 3, width: "100%", overflow: "hidden", marginTop: 8, marginBottom: 16, borderRadius: 2 }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite", boxShadow: "0 0 8px rgba(57,255,126,0.5), 0 0 16px rgba(57,255,126,0.2)" }} />
            </div>

            {/* Patient & Diagnosis Row */}
            <div style={{ ...S.grid(3), gap: 16 }}>
              {/* Patient Info Card */}
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Patient</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                  {form.patientName || "\u2014"} <span style={{ fontSize: 12, fontWeight: 400 }}>({form.sex || "\u2014"})</span>
                </div>
                <div style={{ fontSize: 12, color: C.text, marginBottom: 2 }}>{form.breed || "Breed not selected"}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>Age: <strong>{form.age ? form.age + " yr" : "\u2014"}</strong></span>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>Wt: <strong>{form.weightKg ? form.weightKg + " kg" : "\u2014"}{form.weightLbs ? " (" + form.weightLbs + " lbs)" : ""}</strong></span>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>BCS: <strong>{form.bodyConditionScore}/9</strong></span>
                </div>
              </div>

              {/* Diagnosis Card */}
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Diagnosis & Region</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{diagLabel}</div>
                {diagCategory && <div style={{ fontSize: 11, color: C.text, fontWeight: 400, marginBottom: 4 }}>Category: {diagCategory}</div>}
                <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>Region: <strong>{form.affectedRegion || "\u2014"}</strong></div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: +form.painLevel <= 3 ? C.greenBg : +form.painLevel <= 6 ? C.amberBg : C.redBg,
                    color: +form.painLevel <= 3 ? C.green : +form.painLevel <= 6 ? C.amber : C.red,
                  }}>Pain: {form.painLevel}/10</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: +form.lamenessGrade <= 1 ? C.greenBg : +form.lamenessGrade <= 3 ? C.amberBg : C.redBg,
                    color: +form.lamenessGrade <= 1 ? C.green : +form.lamenessGrade <= 3 ? C.amber : C.red,
                  }}>Lameness: {form.lamenessGrade}/5</span>
                  {form.mmtGrade && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: +form.mmtGrade >= 4 ? C.greenBg : +form.mmtGrade >= 2 ? C.amberBg : C.redBg,
                      color: +form.mmtGrade >= 4 ? C.green : +form.mmtGrade >= 2 ? C.amber : C.red,
                    }}>MMT: {form.mmtGrade}/5</span>
                  )}
                  {form.ivddGrade && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(124,58,237,0.15)", color: "#7C3AED" }}>
                      IVDD: Grade {form.ivddGrade}
                    </span>
                  )}
                  {form.oaStage && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: +form.oaStage <= 2 ? C.amberBg : C.redBg,
                      color: +form.oaStage <= 2 ? C.amber : C.red,
                    }}>KL: Grade {form.oaStage}</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: C.tealLight, color: C.tealDark }}>
                    {form.mobilityLevel}
                  </span>
                </div>
              </div>

              {/* Treatment Plan Card */}
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Treatment Plan</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{txLabel}</div>
                {form.treatmentApproach === "surgical" && form.surgeryType && (
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500, marginBottom: 2 }}>Procedure: <strong>{form.surgeryType}</strong></div>
                )}
                {form.treatmentApproach === "surgical" && form.postOpDay && (
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500, marginBottom: 2 }}>Post-Op Day: <strong>{form.postOpDay}</strong></div>
                )}
                {form.weightBearingStatus && (
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500, marginBottom: 2 }}>Weight Bearing: <strong>{form.weightBearingStatus}</strong></div>
                )}
                {ownerDeclined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, padding: "4px 8px", background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 4 }}>
                    <FiAlertTriangle size={11} style={{ color: C.amber }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: C.amber }}>Owner declined recommended surgery</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client & Safety Row */}
            <div style={{ ...S.grid(2), gap: 16, marginTop: 16 }}>
              {/* Client Info Card */}
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Client Information</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>{[form.clientLastName, form.clientFirstName].filter(Boolean).join(", ") || "\u2014"}</div>
                {form.clientEmail && <div style={{ fontSize: 11, color: C.text, marginBottom: 2 }}>{form.clientEmail}</div>}
                {form.clientPhone && <div style={{ fontSize: 11, color: C.text, marginBottom: 2 }}>{form.clientPhone}</div>}
                {form.referringVet && <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Referring DVM: <strong style={{ color: C.text }}>{form.referringVet}</strong></div>}
                {form.treatingClinician && <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Treating Clinician: <strong style={{ color: C.text }}>{form.treatingClinician}{form.clinicianCredentials ? `, ${form.clinicianCredentials}` : ""}</strong></div>}
                {form.clientConsentObtained && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, padding: "3px 8px", background: C.greenBg, border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 4 }}>
                    <FiCheckCircle size={10} style={{ color: C.green }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: C.green }}>Consent Obtained{form.clientConsentDate ? ` \u2014 ${form.clientConsentDate}` : ""}</span>
                  </div>
                )}
              </div>

              {/* Safety Flags Card */}
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Safety Flags</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.allergies && form.allergies.trim() && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.redBg, color: C.red, border: "1px solid rgba(220,38,38,0.3)" }}>
                      ALLERGY: {form.allergies}
                    </span>
                  )}
                  {form.temperament && form.temperament !== "Cooperative" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.amberBg, color: C.amber, border: "1px solid rgba(217,119,6,0.3)" }}>
                      {form.temperament}
                    </span>
                  )}
                  {form.incisionStatus && form.incisionStatus !== "Clean/Dry/Intact" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.redBg, color: C.red, border: "1px solid rgba(220,38,38,0.3)" }}>
                      Incision: {form.incisionStatus}
                    </span>
                  )}
                  {form.activityRestrictions && form.activityRestrictions.trim() && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.amberBg, color: C.amber, border: "1px solid rgba(217,119,6,0.3)" }}>
                      Activity Restrictions
                    </span>
                  )}
                  {(!form.allergies || !form.allergies.trim()) && form.temperament === "Cooperative" && (!form.activityRestrictions || !form.activityRestrictions.trim()) && (!form.incisionStatus || form.incisionStatus === "Clean/Dry/Intact") && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.greenBg, color: C.green }}>No active flags</span>
                  )}
                </div>
              </div>
            </div>

            {/* Exercise Availability Row */}
            <div style={{ marginTop: 16, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Exercise Library Available</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>
                    Total Exercises: <strong style={{ fontSize: 14, color: C.teal }}>{totalExercises}</strong>
                  </div>
                  {relevantExercises.length > 0 && (
                    <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>
                      Condition-Matched: <strong style={{ fontSize: 14, color: C.green }}>{relevantExercises.length}</strong>
                    </div>
                  )}
                  {form.currentMedications && (
                    <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>
                      Active Medications: <strong>{form.currentMedications}</strong>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 320 }}>
                {form.eCollarRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.tealLight, color: C.tealDark }}>E-Collar</span>}
                {form.crateRestRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.tealLight, color: C.tealDark }}>Crate Rest</span>}
                {form.slingAssistRequired && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.tealLight, color: C.tealDark }}>Sling Assist</span>}
                {form.specialInstructions && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.amberBg, color: C.amber }}>Special Instructions</span>}
              </div>
            </div>

            {/* Rehab Goals & Protocol Config Row */}
            <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
              {/* Rehab Goals */}
              <div style={{ flex: 1, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Rehab Goals</div>
                {([...(form.stGoals || []), ...(form.ltGoals || [])]).length > 0 ? (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {[...(form.stGoals || []), ...(form.ltGoals || [])].map(g => (
                      <span key={g} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: C.teal }}>
                        {g.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    ))}
                  </div>
                ) : <span style={{ fontSize: 11, color: C.text }}>No goals selected</span>}
              </div>
              {/* Protocol Config */}
              <div style={{ flex: 1, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Protocol Configuration</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{form.protocolLength} weeks</span>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{form.sessionFrequency}x/week</span>
                  {form.homeExerciseProgram && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: C.green }}>HEP Included</span>}
                  {form.aquaticAccess && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: C.teal }}>Aquatic</span>}
                </div>
                {/* Modalities count */}
                {(() => {
                  const modCount = ["modalityUWTM","modalityLaser","modalityTENS","modalityNMES","modalityTherapeuticUS","modalityShockwave","modalityCryotherapy","modalityHeatTherapy","modalityPulsedEMF"].filter(k => form[k]).length;
                  return modCount > 0 ? <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>{modCount} modalities available</div> : null;
                })()}
              </div>
            </div>

            {/* Objective Measurements Summary */}
            {(form.circumferenceAffected || form.romFlexion || form.muscleCondition !== "Normal" || +form.jointEffusion > 0) && (
              <div style={{ marginTop: 20, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Baseline Measurements</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {form.circumferenceAffected && form.circumferenceContralateral && (
                    <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>
                      Circumference: {form.circumferenceAffected}cm / {form.circumferenceContralateral}cm
                      ({Math.abs(parseFloat(form.circumferenceAffected) - parseFloat(form.circumferenceContralateral)).toFixed(1)}cm diff)
                    </span>
                  )}
                  {form.romFlexion && <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>ROM: {form.romFlexion}\u00B0\u2013{form.romExtension || "\u2014"}\u00B0</span>}
                  {form.muscleCondition !== "Normal" && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(220,38,38,0.15)", color: C.red }}>{form.muscleCondition}</span>}
                  {+form.jointEffusion > 0 && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(217,119,6,0.15)", color: C.amber }}>Effusion: {form.jointEffusion}/3</span>}
                </div>
              </div>
            )}

            {/* Missing Info Warnings */}
            {(!form.patientName || !form.diagnosis || !form.treatmentApproach || ((form.problems || []).length === 0 && (form.stGoals || []).length === 0 && (form.ltGoals || []).length === 0)) && (
              <div style={{ marginTop: 20, padding: "10px 16px", background: C.amberBg, border: `1.5px solid ${C.amber}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <FiAlertTriangle size={14} style={{ color: C.amber }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.amber }}>
                  Missing recommended fields:
                  {!form.patientName && " Patient Name,"}
                  {!form.diagnosis && " Diagnosis,"}
                  {!form.treatmentApproach && " Treatment Approach,"}
                  {((form.problems || []).length === 0 && (form.stGoals || []).length === 0 && (form.ltGoals || []).length === 0) && " Rehab Goals"}
                  {" \u2014 go back and complete for optimal protocol generation."}
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
            style={{ accentColor: C.green, width: 16, height: 16, cursor: "pointer" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>
            I acknowledge the{" "}
            <span
              onClick={e => { e.preventDefault(); setComplianceOpen(o => !o); }}
              style={{ color: C.teal, textDecoration: "underline", cursor: "pointer" }}
            >K9 Rehab Pro — Compliance & Data Protection Notice</span>
          </span>
        </label>
        {complianceOpen && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "20px 24px", marginTop: 8, maxHeight: 420, overflowY: "auto",
          }}>
            {/* Section 1 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              1. Regulatory Framework & Governing Standards
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro operates under the regulatory authority of state veterinary medical boards in the United States. All clinical decision-support features, rehabilitation protocol generation, and professional-facing tools are designed to comply with:
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 12px 16px", padding: 0 }}>
              <li>State veterinary practice acts</li>
              <li>State veterinary medical board rules for teleadvice, teleconsulting, and client communication</li>
              <li>State-specific definitions of the veterinarian\u2013client\u2013patient relationship (VCPR)</li>
              <li>Professional conduct, recordkeeping, and data-handling requirements</li>
              <li>Restrictions on diagnosis, prescription, and medical decision-making by non-veterinarians</li>
            </ul>
            <div style={{ fontSize: 10, color: C.textMid, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              The platform functions as a clinical decision-support system (CDSS) and educational tool, not a substitute for licensed veterinary judgment.
            </div>

            {/* Section 2 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              2. Scope of Use & Professional Boundaries
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro is designed for:
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Licensed veterinarians</li>
              <li>Certified canine rehabilitation practitioners (CCRP/CCRT)</li>
              <li>Veterinary physical therapists</li>
              <li>Veterinary technicians under supervision</li>
              <li>Veterinary students and rehabilitation trainees</li>
            </ul>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              The system does not:
            </div>
            <ul style={{ fontSize: 10, color: C.textMid, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Establish a VCPR</li>
              <li>Provide medical diagnosis</li>
              <li>Replace in-person examinations</li>
              <li>Prescribe medications</li>
              <li>Override state veterinary medical board rules</li>
            </ul>
            <div style={{ fontSize: 10, color: C.green, lineHeight: 1.7, marginBottom: 16, fontWeight: 600 }}>
              All generated content must be reviewed and approved by a licensed veterinarian before being applied to a patient.
            </div>

            {/* Section 3 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              3. Data Privacy & Confidentiality Standards
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro is committed to data privacy standards that align with or exceed veterinary medical board recordkeeping requirements. HIPAA does not govern veterinary medicine; however, the platform is designed with the following protections in place or on the implementation roadmap:
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 4px 16px", padding: 0 }}>
              <li>All patient and client data stored locally on the host device \u2014 no external transmission</li>
              <li>No third-party data sharing, advertising use, or AI training on user-submitted data</li>
              <li>Session-based access with configurable timeout</li>
            </ul>
            <div style={{ fontSize: 10, color: C.amber, lineHeight: 1.7, marginBottom: 4, fontWeight: 600 }}>
              Planned for production deployment:
            </div>
            <ul style={{ fontSize: 10, color: C.textLight, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>AES-256 encryption at rest</li>
              <li>TLS 1.3 encryption in transit</li>
              <li>Zero-knowledge architecture for sensitive fields</li>
              <li>Role-based access control (RBAC)</li>
              <li>Multi-factor authentication</li>
              <li>Encrypted backups and disaster-recovery protocols</li>
            </ul>
            <div style={{ fontSize: 10, color: C.textMid, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              No client or patient data is sold, shared, or used for advertising. Security features will be fully implemented prior to multi-user or cloud deployment.
            </div>

            {/* Section 4 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              4. State Veterinary Medical Board Compliance
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>VCPR-dependent features clearly labeled</li>
              <li>Protocols requiring veterinary oversight flagged for review</li>
              <li>Restrictions on remote diagnosis enforced</li>
              <li>Documentation standards aligned with state recordkeeping rules</li>
              <li>Clear separation between education, decision support, and clinical judgment</li>
            </ul>
            <div style={{ fontSize: 10, color: C.textMid, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              All workflows are designed to align with state-level practice restrictions. Final clinical decisions remain the responsibility of the supervising veterinarian.
            </div>

            {/* Section 5 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              5. Clinical Accuracy, Evidence Standards & Protocol Validation
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              All rehabilitation protocols follow:
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Millis & Levine <em>Canine Rehabilitation and Physical Therapy</em></li>
              <li><em>Canine Sports Medicine & Rehabilitation</em> (Zink & Van Dyke)</li>
              <li>ACVSMR-aligned best practices</li>
              <li>Peer-reviewed veterinary rehabilitation literature</li>
              <li>State veterinary medical board expectations for evidence-based care</li>
            </ul>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              Every exercise in the library is:
            </div>
            <ul style={{ fontSize: 10, color: C.green, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0, fontWeight: 600 }}>
              <li>Clinically validated</li>
              <li>Evidence-based</li>
              <li>Stage-appropriate</li>
              <li>Safety-screened</li>
              <li>Free of hallucinated or non-standard techniques</li>
            </ul>
            <div style={{ fontSize: 10, color: C.textMid, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              Protocols are generated using deterministic logic to ensure reproducibility and clinical reliability.
            </div>

            {/* Section 6 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              6. Security Infrastructure & Technical Safeguards
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro currently operates as a locally-hosted application. Active and planned security measures include:
            </div>
            <ul style={{ fontSize: 10, color: C.green, lineHeight: 1.8, margin: "0 0 4px 16px", padding: 0, fontWeight: 600 }}>
              <li>Local-only data storage \u2014 no external servers or cloud transmission</li>
              <li>Deterministic protocol logic \u2014 no AI/ML in clinical output</li>
              <li>Configurable session timeout and auto-lock</li>
              <li>Strict API access controls (CORS-restricted)</li>
            </ul>
            <div style={{ fontSize: 10, color: C.amber, lineHeight: 1.7, marginBottom: 4, fontWeight: 600 }}>
              Planned for production deployment:
            </div>
            <ul style={{ fontSize: 10, color: C.textLight, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Encrypted databases (AES-256)</li>
              <li>Audit logs for all clinical-related actions</li>
              <li>Multi-factor authentication</li>
              <li>Continuous monitoring and intrusion detection</li>
              <li>Automated patching and vulnerability scanning</li>
            </ul>
            <div style={{ fontSize: 10, color: C.textMid, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              Enterprise-grade security features will be fully implemented prior to multi-user, cloud, or production deployment.
            </div>

            {/* Section 7 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              7. Data Retention, Ownership & Client Rights
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              Clients and clinicians retain full ownership of their data. K9 Rehab Pro acts only as a secure processor.
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Data retained only as long as required for clinical or legal purposes</li>
              <li>Permanent deletion available upon request</li>
              <li>Exportable records for veterinary medical board audits</li>
              <li>No third-party data sharing</li>
              <li>No AI training on user-submitted patient data</li>
            </ul>
            <div style={{ fontSize: 10, color: C.textMid, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              All retention timelines align with state veterinary medical board recordkeeping requirements.
            </div>

            {/* Section 8 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              8. Ethical Use, Transparency & Professional Responsibility
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              K9 Rehab Pro adheres to the ethical standards of:
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>AVMA</li>
              <li>State veterinary medical boards</li>
              <li>ACVSMR</li>
              <li>APTA (for PT-licensed users)</li>
            </ul>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              Ethical commitments include:
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>Transparency about system limitations</li>
              <li>Clear labeling of AI-generated content</li>
              <li>Mandatory veterinary oversight for clinical decisions</li>
              <li>No replacement of licensed professional judgment</li>
              <li>No misleading claims about outcomes or guarantees</li>
            </ul>
            <div style={{ fontSize: 10, color: C.green, lineHeight: 1.7, fontWeight: 700, marginBottom: 16 }}>
              The platform supports clinicians — never replaces them.
            </div>

            {/* Section 9 */}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              9. Intellectual Property & Ownership
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              All intellectual property rights are defined as follows:
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li><strong>Platform IP:</strong> The K9 Rehab Pro platform, including its protocol generation engine, exercise library, clinical algorithms, user interface, and source code, is the proprietary intellectual property of the platform owner.</li>
              <li><strong>Exercise Library:</strong> The curated exercise library is a proprietary compilation. Individual exercises reference published veterinary rehabilitation literature (Millis & Levine, Zink & Van Dyke, peer-reviewed journals) under fair use for clinical decision support.</li>
              <li><strong>Generated Protocols:</strong> Rehabilitation protocols generated by the platform become the clinical property of the generating clinic or clinician. The platform retains no ownership of patient-specific output.</li>
              <li><strong>Patient Data:</strong> All patient and client data entered into the system is owned exclusively by the clinic or clinician. K9 Rehab Pro acts solely as a local data processor.</li>
              <li><strong>Branding & Trademarks:</strong> "K9 Rehab Pro," the K9 Rehab Pro logo, and all associated branding elements are proprietary marks of the platform owner.</li>
            </ul>
            <div style={{ fontSize: 10, color: C.textMid, lineHeight: 1.7, fontStyle: "italic" }}>
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
            padding: "18px 56px", borderRadius: 12, border: `2px solid ${C.green}`,
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
          onClick={generate} disabled={loading || ((form.problems || []).length === 0 && (form.stGoals || []).length === 0 && (form.ltGoals || []).length === 0)}
        >
          <FiActivity size={18} />
          {loading ? "Generating Protocol..." : "Generate Exercise Protocol"}
        </button>
      </div>

      {/* Step 5 navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <button
          style={{
            ...S.btn("ghost"), boxShadow: "0 0 8px rgba(14,165,233,0.15)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(14,165,233,0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 8px rgba(14,165,233,0.15)"}
          onClick={() => goToStep(4)}
        >
          &larr; Back to Rehab Goals
        </button>
        <div />
      </div>

      {/* ═══════════ ERROR ═══════════ */}
      {error && (
        <div style={{ ...S.card, background: C.redBg, border: `1px solid ${C.red}33`, color: C.red, display: "flex", alignItems: "center", gap: 8 }}>
          <FiAlertTriangle size={16} /> {error}
        </div>
      )}
    </>
  );
}
