import React from "react";
import { FiFileText, FiAlertTriangle } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";

export default function Step3TreatmentPlan({ form, setField, goToStep, handleSurgeryDate, handlePostOpDay }) {
  return (
    <>
      <div style={{ background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" }}>
        <SectionHead icon={FiFileText} title="Treatment Plan & Surgical Status" />

        {/* -- Treatment Approach -- */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Treatment Approach <span style={{color:C.red}}>*</span>
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
                  background: form.treatmentApproach === opt.value ? "rgba(14,165,233,0.15)" : C.bg,
                  border: form.treatmentApproach === opt.value ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
                  boxShadow: form.treatmentApproach === opt.value ? "0 0 12px rgba(14,165,233,0.2)" : "none",
                  transition: "all 0.2s",
                }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: C.text, marginTop: 2, fontWeight: 400 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* -- Veterinary Recommendation vs Owner Election -- */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Clinical Recommendation & Owner Decision
          </div>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Veterinary Recommendation</label>
              <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.vetRecommendation} onChange={e => setField("vetRecommendation", e.target.value)}>
                <option value="">--- Select ---</option>
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
              <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.ownerElection} onChange={e => setField("ownerElection", e.target.value)}>
                <option value="">--- Select ---</option>
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
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 12, padding: "12px 16px", background: C.amberBg, border: `1.5px solid ${C.amber}`, borderRadius: 8 }}>
              <FiAlertTriangle size={18} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>Owner Declines Recommended Surgery</div>
                <div style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>Protocol will be generated for conservative management. Document informed consent including the owner's understanding of outcomes without surgical intervention.</div>
                <div style={{ marginTop: 8 }}>
                  <label style={{ ...S.label, fontSize: 10 }}>Reason / Notes for Declining (Document for Medical Record)</label>
                  <input style={{ ...S.input, border: `1.5px solid ${C.amber}`, background: C.amberBg, fontSize: 11 }}
                    value={form.ownerDeclineReason} onChange={e => setField("ownerDeclineReason", e.target.value)}
                    placeholder="Owner's stated reason, informed consent discussion documented" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* -- Surgical Details (shown when surgical approach selected) -- */}
        {form.treatmentApproach === "surgical" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
              Surgical Details
            </div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Surgery Type / Procedure</label>
                <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.surgeryType} onChange={e => setField("surgeryType", e.target.value)}>
                  <option value="">--- Select ---</option>
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
                <input style={{ ...S.input, border: `1.5px solid ${C.border}`, background: form.surgeryDate && form.postOpDay ? C.greenBg : C.surface }} type="date" value={form.surgeryDate} onChange={e => handleSurgeryDate(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Post-Op Day (POD)</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}`, background: form.postOpDay && form.surgeryDate ? C.greenBg : C.surface }} type="number" min="0" value={form.postOpDay}
                  onChange={e => handlePostOpDay(e.target.value)} onInput={e => handlePostOpDay(e.target.value)}
                  placeholder="Days since surgery" />
                {form.postOpDay && form.surgeryDate && (
                  <div style={{ fontSize: 10, color: C.green, fontWeight: 500, marginTop: 4 }}>
                    Auto-calculated from surgery date
                  </div>
                )}
              </div>
            </div>
            <div style={{ ...S.grid(3), marginTop: 12 }}>
              <div>
                <label style={S.label}>Surgeon Name</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.surgeonName} onChange={e => setField("surgeonName", e.target.value)}
                  placeholder="DVM / DACVS name" />
              </div>
              <div>
                <label style={S.label}>Surgical Facility</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.surgicalFacility} onChange={e => setField("surgicalFacility", e.target.value)}
                  placeholder="Hospital / Clinic name" />
              </div>
              <div>
                <label style={S.label}>ASA Physical Status</label>
                <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.anesthesiaRisk} onChange={e => setField("anesthesiaRisk", e.target.value)}>
                  <option value="">--- Select ---</option>
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
                <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.incisionStatus} onChange={e => setField("incisionStatus", e.target.value)}>
                  <option value="">--- Select ---</option>
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
                <input style={{ ...S.input, border: `1.5px solid ${C.border}`, background: form.sutureRemovalDate && form.surgeryDate ? C.greenBg : C.surface }} type="date" value={form.sutureRemovalDate} onChange={e => setField("sutureRemovalDate", e.target.value)} />
                {form.sutureRemovalDate && form.surgeryDate && (
                  <div style={{ fontSize: 10, color: C.green, fontWeight: 500, marginTop: 4 }}>
                    Auto-set to 14 days post-op (editable)
                  </div>
                )}
              </div>
            </div>
            <div style={{ ...S.grid(2), marginTop: 12 }}>
              <div>
                <label style={S.label}>Implant / Hardware Details</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.implantDetails} onChange={e => setField("implantDetails", e.target.value)}
                  placeholder="e.g. Synthes 3.5mm TPLO plate, 2.4mm locking screws" />
              </div>
              <div>
                <label style={S.label}>Surgical Complications / Notes</label>
                <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.complicationsNoted} onChange={e => setField("complicationsNoted", e.target.value)}
                  placeholder="Any intraoperative or postoperative complications" />
              </div>
            </div>
          </div>
        )}

        {/* -- Post-Op / Recovery Restrictions -- */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
            Current Recovery Status & Restrictions
          </div>
          <div style={S.grid(2)}>
            <div>
              <label style={S.label}>Weight-Bearing Status</label>
              <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }} value={form.weightBearingStatus} onChange={e => setField("weightBearingStatus", e.target.value)}>
                <option value="">--- Select ---</option>
                <option value="Non-weight bearing">Non-weight bearing (NWB)</option>
                <option value="Toe-touching">Toe-touching weight bearing (TTWB)</option>
                <option value="Partial">Partial weight bearing (PWB)</option>
                <option value="Weight bearing as tolerated">Weight bearing as tolerated (WBAT)</option>
                <option value="Full weight bearing">Full weight bearing (FWB)</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Activity Restrictions</label>
              <textarea style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 42, resize: "vertical", fontFamily: "inherit" }} value={form.activityRestrictions} onChange={e => setField("activityRestrictions", e.target.value)}
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
                padding: "8px 14px", background: form[item.key] ? "rgba(14,165,233,0.15)" : C.bg,
                border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.text,
                transition: "all 0.2s" }}>
                <input type="checkbox" checked={form[item.key]} onChange={e => setField(item.key, e.target.checked)}
                  style={{ accentColor: C.teal, width: 16, height: 16, cursor: "pointer" }} />
                {item.label}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={S.label}>Prior Surgeries / Relevant Surgical History</label>
            <input style={{ ...S.input, border: `1.5px solid ${C.border}` }} value={form.priorSurgeries} onChange={e => setField("priorSurgeries", e.target.value)}
              placeholder="e.g. Contralateral TPLO 2024, splenectomy 2023" />
          </div>
        </div>

      </div>

      <StepNavButtons onBack={() => goToStep(2)} backLabel={"← Back to Assessment"} onNext={() => goToStep(4)} nextLabel="Next: Rehab Goals" />
    </>
  );
}
