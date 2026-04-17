import React from "react";
import { FiHome, FiCalendar, FiAlertTriangle, FiShield, FiCheckCircle, FiActivity } from "react-icons/fi";
import { TbPaw } from "react-icons/tb";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";
import { CONDITIONS, FELINE_DIAGNOSES } from "./constants";
import { useTr } from "../../i18n/useTr";

const navyCard = { background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" };

/* Reusable multi-checkbox */
function CheckboxGroup({ items, formKey, form, setField, accentColor }) {
  const tr = useTr();
  const accent = accentColor || C.teal;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map(item => (
        <label key={item} style={{
          display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.text,
          background: (form[formKey] || []).includes(item) ? "rgba(14,165,233,0.15)" : C.bg,
          border: (form[formKey] || []).includes(item) ? `1.5px solid ${accent}` : `1.5px solid ${C.border}`,
          transition: "all 0.2s",
        }}>
          <input type="checkbox" checked={(form[formKey] || []).includes(item)}
            onChange={e => {
              const arr = [...(form[formKey] || [])];
              if (e.target.checked) arr.push(item); else arr.splice(arr.indexOf(item), 1);
              setField(formKey, arr);
            }}
            style={{ accentColor: accent, width: 13, height: 13, cursor: "pointer" }} />
          {tr(item)}
        </label>
      ))}
    </div>
  );
}

export default function Step7HomeProtocol({ form, setField, generate, allExercises, complianceAgreed, setComplianceAgreed, complianceOpen, setComplianceOpen, error, goToStep, loading }) {
  const tr = useTr();
  return (
    <>
      {/* ═══════════ SECTION: HOME EQUIPMENT & ENVIRONMENT ═══════════ */}
      <div style={navyCard}>
        <SectionHead icon={FiHome} title="Home Exercise Protocols" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {/* Available Home Equipment */}
        <div style={navyCard}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            {tr("Available Home Equipment")}
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
            {tr("For clients following a HEP — what equipment do they have?")}
          </div>
          <CheckboxGroup
            items={[
              "Yoga / exercise mat", "Balance disc / wobble cushion", "Cavaletti poles / PVC rails",
              "Resistance band", "Ramp (car or furniture)", "Stairs (indoor)",
              "Underwater treadmill access", "Pool / swim access", "Therapy ball / peanut ball",
              "Harness / sling", "Cones / weave markers", "Elevated food/water bowls",
              "Orthopedic bed", "Ice packs / cold compress", "Heat pack / warm compress",
              "Treat-dispensing toy (enrichment)",
            ]}
            formKey="homeEquipment"
            form={form}
            setField={setField}
          />
        </div>

        {/* Home Environment */}
        <div style={navyCard}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            {tr("Home Environment")}
          </div>
          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 10 }}>
            {tr("Living situation and accessibility considerations")}
          </div>
          <CheckboxGroup
            items={[
              "House \u2014 single story", "House \u2014 multi-story", "Apartment / condo",
              "Tile / hardwood floors", "Carpet / rugs throughout", "Fenced yard",
              "No yard / urban setting", "Rural / acreage", "Stairs to enter home",
              "Ramp to enter home", "Dog door available", "Crate / confined space available",
              "Other pets in home", "Small children in home",
            ]}
            formKey="homeEnvironment"
            form={form}
            setField={setField}
          />
        </div>
      </div>

      {/* ═══════════ PRE-PROTOCOL SUMMARY OVERVIEW ═══════════ */}
      {(() => {
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
        const diagCategory = (() => {
          for (const [cat, items] of Object.entries(CONDITIONS)) {
            if (items.find(c => c.value === form.diagnosis)) return cat;
          }
          return "";
        })();
        const relevantExercises = (allExercises || []).filter(ex => {
          const name = (ex.name || "").toLowerCase();
          const cat = (ex.category || "").toLowerCase();
          const diag = (form.diagnosis || "").toLowerCase();
          const region = (form.affectedRegion || "").toLowerCase();
          return name.includes(diag) || cat.includes(diag) || name.includes(region.split(" ").pop()) || cat.includes(region.split(" ").pop());
        });
        const totalExercises = (allExercises || []).length;
        const txLabel = form.treatmentApproach === "surgical" ? "Surgical \u2014 Post-Operative Rehabilitation"
          : form.treatmentApproach === "conservative" ? "Conservative \u2014 Non-Surgical Management"
          : form.treatmentApproach === "palliative" ? "Palliative \u2014 Comfort Care"
          : "Not specified";
        const ownerDeclined = form.vetRecommendation && form.vetRecommendation.startsWith("Surgery") && form.ownerElection && form.ownerElection.startsWith("Declined");

        return (
          <div style={{
            background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12,
            position: "relative", overflow: "hidden", color: "#fff",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.navy}, ${C.teal}, ${C.green})` }} />
            <div style={{ ...S.sectionHeader(), marginTop: 4, marginBottom: 0 }}>
              <FiCheckCircle size={14} style={{ color: C.teal }} /> {tr("PRE-PROTOCOL SUMMARY")}
            </div>
            <div style={{ height: 3, width: "100%", overflow: "hidden", marginTop: 8, marginBottom: 16, borderRadius: 2 }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite", boxShadow: "0 0 8px rgba(57,255,126,0.5), 0 0 16px rgba(57,255,126,0.2)" }} />
            </div>

            {/* Patient & Diagnosis & Treatment Row */}
            <div style={{ ...S.grid(3), gap: 16 }}>
              {/* Patient */}
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{tr("Patient")}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                  {form.patientName || "\u2014"} <span style={{ fontSize: 12, fontWeight: 400 }}>({form.sex || "\u2014"})</span>
                </div>
                <div style={{ fontSize: 12, color: C.text, marginBottom: 2 }}>{form.breed || tr("Breed not selected")}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{tr("Age:")} <strong>{form.age ? form.age + " yr" : "\u2014"}</strong></span>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{tr("Wt:")} <strong>{form.weightKg ? form.weightKg + " kg" : "\u2014"}{form.weightLbs ? " (" + form.weightLbs + " lbs)" : ""}</strong></span>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{tr("BCS:")} <strong>{form.bodyConditionScore}/9</strong></span>
                </div>
              </div>

              {/* Diagnosis */}
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{tr("Diagnosis & Region")}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{diagLabel}</div>
                {diagCategory && <div style={{ fontSize: 11, color: C.text, fontWeight: 400, marginBottom: 4 }}>{tr("Category:")} {tr(diagCategory)}</div>}
                <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{tr("Region:")} <strong>{form.affectedRegion || "\u2014"}</strong></div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: +form.painLevel <= 3 ? C.greenBg : +form.painLevel <= 6 ? C.amberBg : C.redBg,
                    color: +form.painLevel <= 3 ? C.green : +form.painLevel <= 6 ? C.amber : C.red,
                  }}>{tr("Pain:")} {form.painLevel}/10</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: +form.lamenessGrade <= 1 ? C.greenBg : +form.lamenessGrade <= 3 ? C.amberBg : C.redBg,
                    color: +form.lamenessGrade <= 1 ? C.green : +form.lamenessGrade <= 3 ? C.amber : C.red,
                  }}>{tr("Lameness:")} {form.lamenessGrade}/5</span>
                  {form.mobilityLevel && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: C.tealLight, color: C.tealDark }}>
                      {tr(form.mobilityLevel)}
                    </span>
                  )}
                </div>
              </div>

              {/* Treatment Plan */}
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{tr("Treatment Plan")}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{tr(txLabel)}</div>
                {form.treatmentApproach === "surgical" && form.surgeryType && (
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500, marginBottom: 2 }}>{tr("Procedure:")} <strong>{form.surgeryType}</strong></div>
                )}
                {form.treatmentApproach === "surgical" && form.postOpDay && (
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500, marginBottom: 2 }}>{tr("Post-Op Day:")} <strong>{form.postOpDay}</strong></div>
                )}
                {form.weightBearingStatus && (
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500, marginBottom: 2 }}>{tr("Weight Bearing:")} <strong>{tr(form.weightBearingStatus)}</strong></div>
                )}
                {ownerDeclined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, padding: "4px 8px", background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 4 }}>
                    <FiAlertTriangle size={11} style={{ color: C.amber }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: C.amber }}>{tr("Owner declined recommended surgery")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Flags & Exercise Count */}
            <div style={{ ...S.grid(2), gap: 16, marginTop: 16 }}>
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{tr("Safety Flags")}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.allergies && form.allergies.trim() && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.redBg, color: C.red, border: "1px solid rgba(220,38,38,0.3)" }}>
                      {tr("ALLERGY:")} {form.allergies}
                    </span>
                  )}
                  {form.temperament && form.temperament !== "Cooperative" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.amberBg, color: C.amber, border: "1px solid rgba(217,119,6,0.3)" }}>
                      {tr(form.temperament)}
                    </span>
                  )}
                  {form.incisionStatus && form.incisionStatus !== "Clean/Dry/Intact" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.redBg, color: C.red, border: "1px solid rgba(220,38,38,0.3)" }}>
                      {tr("Incision:")} {tr(form.incisionStatus)}
                    </span>
                  )}
                  {(!form.allergies || !form.allergies.trim()) && (!form.temperament || form.temperament === "Cooperative") && (!form.incisionStatus || form.incisionStatus === "Clean/Dry/Intact") && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: C.greenBg, color: C.green }}>{tr("No active flags")}</span>
                  )}
                </div>
              </div>
              <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{tr("Exercise Library Available")}</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>
                    {tr("Total Exercises:")} <strong style={{ fontSize: 14, color: C.teal }}>{totalExercises}</strong>
                  </div>
                  {relevantExercises.length > 0 && (
                    <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>
                      {tr("Condition-Matched:")} <strong style={{ fontSize: 14, color: C.green }}>{relevantExercises.length}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rehab Goals & Protocol Config Row */}
            <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
              <div style={{ flex: 1, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{tr("Rehab Goals")}</div>
                {([...(form.stGoals || []), ...(form.ltGoals || [])]).length > 0 ? (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {[...(form.stGoals || []), ...(form.ltGoals || [])].map(g => (
                      <span key={g} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: C.teal }}>
                        {tr(g)}
                      </span>
                    ))}
                  </div>
                ) : <span style={{ fontSize: 11, color: C.text }}>{tr("No goals selected")}</span>}
              </div>
              <div style={{ flex: 1, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{tr("Protocol Configuration")}</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{form.protocolLength || "\u2014"} {tr("weeks")}</span>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{form.sessionFrequency || "\u2014"}x/{tr("week")}</span>
                  {form.homeExerciseProgram && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: C.green }}>{tr("HEP Included")}</span>}
                  {form.aquaticAccess && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(14,165,233,0.15)", color: C.teal }}>{tr("Aquatic")}</span>}
                </div>
                {(() => {
                  const modCount = ["modalityUWTM","modalityLaser","modalityTENS","modalityNMES","modalityTherapeuticUS","modalityShockwave","modalityCryotherapy","modalityHeatTherapy","modalityPulsedEMF"].filter(k => form[k]).length;
                  return modCount > 0 ? <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>{modCount} {tr("modalities available")}</div> : null;
                })()}
              </div>
            </div>

            {/* Missing Info Warnings */}
            {(!form.patientName || !form.diagnosis || !form.treatmentApproach || ((form.problems || []).length === 0 && (form.stGoals || []).length === 0 && (form.ltGoals || []).length === 0)) && (
              <div style={{ marginTop: 20, padding: "10px 16px", background: C.amberBg, border: `1.5px solid ${C.amber}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <FiAlertTriangle size={14} style={{ color: C.amber }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.amber }}>
                  {tr("Missing recommended fields:")}
                  {!form.patientName && ` ${tr("Patient Name")},`}
                  {!form.diagnosis && ` ${tr("Diagnosis")},`}
                  {!form.treatmentApproach && ` ${tr("Treatment Approach")},`}
                  {((form.problems || []).length === 0 && (form.stGoals || []).length === 0 && (form.ltGoals || []).length === 0) && ` ${tr("Rehab Goals")}`}
                  {` \u2014 ${tr("go back and complete for optimal protocol generation.")}`}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════ PROTOCOL DURATION & FREQUENCY ═══════════ */}
      <div style={navyCard}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <FiCalendar size={12} style={{ color: C.teal }} /> {tr("Protocol Duration & Frequency")}
          </span>
        </div>
        <div style={S.grid(3)}>
          <div>
            <label style={S.label}>{tr("Protocol Duration")}</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.protocolLength} onChange={e => setField("protocolLength", e.target.value)}>
              <option value="">{tr("--- Select ---")}</option>
              <option value="6">{tr("6 weeks — Mild cases / accelerated recovery")}</option>
              <option value="8">{tr("8 weeks — Standard post-surgical")}</option>
              <option value="10">{tr("10 weeks — Extended recovery")}</option>
              <option value="12">{tr("12 weeks — Complex / multi-joint")}</option>
              <option value="16">{tr("16 weeks — Conservative / neuro")}</option>
            </select>
          </div>
          <div>
            <label style={S.label}>{tr("Session Frequency (per week)")}</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.sessionFrequency} onChange={e => setField("sessionFrequency", e.target.value)}>
              <option value="">{tr("--- Select ---")}</option>
              <option value="1">{tr("1x per week")}</option>
              <option value="2">{tr("2x per week (Recommended)")}</option>
              <option value="3">{tr("3x per week (Intensive)")}</option>
              <option value="5">{tr("5x per week (Inpatient / Acute)")}</option>
            </select>
          </div>
          <div>
            <label style={S.label}>{tr("Expected Owner Compliance")}</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.ownerCompliance} onChange={e => setField("ownerCompliance", e.target.value)}>
              <option value="">{tr("--- Select ---")}</option>
              <option value="Highly Motivated">{tr("Highly Motivated — Will follow HEP diligently")}</option>
              <option value="Motivated">{tr("Motivated — Reliable with reminders")}</option>
              <option value="Average">{tr("Average — Moderate adherence expected")}</option>
              <option value="Limited">{tr("Limited — Minimal home exercise expected")}</option>
            </select>
          </div>
        </div>

        {/* HEP & Aquatic checkboxes */}
        <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "8px 14px", background: form.homeExerciseProgram ? "rgba(16,185,129,0.12)" : C.bg,
            border: form.homeExerciseProgram ? `1.5px solid ${C.green}` : `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.text,
            transition: "all 0.2s" }}>
            <input type="checkbox" checked={form.homeExerciseProgram} onChange={e => setField("homeExerciseProgram", e.target.checked)}
              style={{ accentColor: C.green, width: 16, height: 16, cursor: "pointer" }} />
            {tr("Include Home Exercise Program (HEP)")}
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "8px 14px", background: form.aquaticAccess ? "rgba(14,165,233,0.12)" : C.bg,
            border: form.aquaticAccess ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.text,
            transition: "all 0.2s" }}>
            <input type="checkbox" checked={form.aquaticAccess} onChange={e => setField("aquaticAccess", e.target.checked)}
              style={{ accentColor: C.teal, width: 16, height: 16, cursor: "pointer" }} />
            {tr("Aquatic Therapy Available (UWTM / Pool)")}
          </label>
        </div>
      </div>

      {/* ═══════════ COMPLIANCE & DATA PROTECTION ═══════════ */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={complianceAgreed} onChange={e => setComplianceAgreed(e.target.checked)}
            style={{ accentColor: C.green, width: 16, height: 16, cursor: "pointer" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>
            {tr("I acknowledge the")}{" "}
            <span
              onClick={e => { e.preventDefault(); setComplianceOpen(o => !o); }}
              style={{ color: C.teal, textDecoration: "underline", cursor: "pointer" }}
            >{tr("K9 Rehab Pro — Compliance & Data Protection Notice")}</span>
          </span>
        </label>
        {complianceOpen && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "20px 24px", marginTop: 8, maxHeight: 300, overflowY: "auto",
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              {tr("Compliance & Data Protection Notice")}
            </div>
            <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
              {tr("K9 Rehab Pro operates as a Clinical Decision-Support System (CDSS). All generated protocols must be reviewed and approved by a licensed veterinarian before clinical use. The platform does not establish a VCPR, diagnose conditions, or prescribe medications.")}
            </div>
            <ul style={{ fontSize: 10, color: C.text, lineHeight: 1.8, margin: "0 0 8px 16px", padding: 0 }}>
              <li>{tr("All patient data stored locally — no external transmission")}</li>
              <li>{tr("No third-party data sharing or AI training on user data")}</li>
              <li>{tr("Evidence-based exercise library validated against source-of-truth documents")}</li>
              <li>{tr("Protocols follow ACVSMR-aligned best practices")}</li>
              <li>{tr("Final clinical decisions remain the responsibility of the supervising veterinarian")}</li>
            </ul>
            <div style={{ fontSize: 10, color: C.green, lineHeight: 1.7, fontWeight: 600 }}>
              {tr("The platform supports clinicians — never replaces them.")}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ GENERATE PROTOCOL BUTTON ═══════════ */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "20px 0 12px",
      }}>
        <button
          style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "22px 64px", borderRadius: 14, border: `2px solid ${C.green}`,
            fontSize: 17, fontWeight: 900, letterSpacing: "0.6px", cursor: loading ? "wait" : "pointer",
            background: `linear-gradient(135deg, ${C.green} 0%, ${C.teal} 100%)`,
            color: "#fff",
            opacity: (!complianceAgreed || loading) ? 0.5 : 1,
            boxShadow: "0 0 24px rgba(16,185,129,0.5), 0 0 48px rgba(16,185,129,0.3), 0 0 72px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => {
            if (!loading && complianceAgreed) {
              e.currentTarget.style.boxShadow = "0 0 36px rgba(16,185,129,0.7), 0 0 72px rgba(16,185,129,0.4), 0 0 108px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = "0 0 24px rgba(16,185,129,0.5), 0 0 48px rgba(16,185,129,0.3), 0 0 72px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={generate}
          disabled={!complianceAgreed || loading}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TbPaw size={20} />
            {loading ? tr("GENERATING PROTOCOL...") : tr("GENERATE EVIDENCE-BASED PROTOCOL")}
          </span>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.3px", opacity: 0.85 }}>
            {tr("Species-matched")} &middot; {tr("Vet-approved")} &middot; {tr("Contraindication-checked")}
          </span>
        </button>
      </div>

      {/* ═══════════ ERROR ═══════════ */}
      {error && (
        <div style={{ ...S.card, background: C.redBg, border: `1px solid ${C.red}33`, color: C.red, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <FiAlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Step 7 navigation — Back only, Generate is the action */}
      <div style={{ display: "flex", justifyContent: "flex-start", padding: "8px 0" }}>
        <button
          style={{
            ...S.btn("ghost"), boxShadow: `0 0 8px ${C.tealLight}`,
            transition: "all 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 14px ${C.teal}`}
          onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 8px ${C.tealLight}`}
          onClick={() => goToStep(6)}
        >
          &larr; {tr("Back to Equipment & Modalities")}
        </button>
      </div>
    </>
  );
}
