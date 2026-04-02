import React from "react";
import { FiSearch, FiImage, FiDroplet, FiCrosshair } from "react-icons/fi";
import { TbMicroscope, TbStethoscope } from "react-icons/tb";
import C from "../../constants/colors";
import S from "../../constants/styles";
import SectionHead from "./SectionHead";
import StepNavButtons from "./StepNavButtons";

const navyCard = { background: C.navy, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, color: "#fff" };

/* Reusable: checkbox + conditional findings input */
function ImagingRow({ label, checkedKey, findingsKey, form, setField, placeholder }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={!!form[checkedKey]} onChange={e => setField(checkedKey, e.target.checked)}
          style={{ accentColor: C.teal, width: 14, height: 14, cursor: "pointer" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{label}</span>
      </label>
      {form[checkedKey] && (
        <textarea
          style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 44, resize: "vertical", fontFamily: "inherit", marginTop: 6 }}
          value={form[findingsKey] || ""} onChange={e => setField(findingsKey, e.target.value)}
          placeholder={placeholder || `${label} findings...`}
        />
      )}
    </div>
  );
}

/* Reusable: checkbox + conditional results summary input */
function LabRow({ label, checkedKey, resultsKey, form, setField, placeholder }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={!!form[checkedKey]} onChange={e => setField(checkedKey, e.target.checked)}
          style={{ accentColor: C.teal, width: 14, height: 14, cursor: "pointer" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{label}</span>
      </label>
      {form[checkedKey] && (
        <input
          style={{ ...S.input, border: `1.5px solid ${C.border}`, marginTop: 6 }}
          value={form[resultsKey] || ""} onChange={e => setField(resultsKey, e.target.value)}
          placeholder={placeholder || `${label} results summary...`}
        />
      )}
    </div>
  );
}

export default function Step3DiagnosticWorkup({ form, setField, goToStep }) {
  return (
    <>
      {/* ═══════════ SECTION: IMAGING STUDIES ═══════════ */}
      <div style={navyCard}>
        <SectionHead icon={FiImage} title="Diagnostic Workup" />

        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          Imaging Studies
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
          Select completed imaging and document findings (select all that apply)
        </div>
        <div style={S.grid(2)}>
          <div>
            <ImagingRow label="Radiographs (X-Ray)" checkedKey="imagingRadiographs" findingsKey="imagingRadiographsFindings" form={form} setField={setField}
              placeholder="e.g. OA changes bilateral stifles, osteophyte formation medial tibial plateau" />
            <ImagingRow label="MRI" checkedKey="imagingMRI" findingsKey="imagingMRIFindings" form={form} setField={setField}
              placeholder="e.g. Hansen Type I disc extrusion T12-T13, spinal cord compression" />
            <ImagingRow label="CT Scan" checkedKey="imagingCT" findingsKey="imagingCTFindings" form={form} setField={setField}
              placeholder="e.g. Fragmented medial coronoid process, incongruity" />
          </div>
          <div>
            <ImagingRow label="Ultrasound" checkedKey="imagingUltrasound" findingsKey="imagingUltrasoundFindings" form={form} setField={setField}
              placeholder="e.g. Biceps tendon thickening, effusion in bicipital sheath" />
            <ImagingRow label="Fluoroscopy" checkedKey="imagingFluoroscopy" findingsKey="imagingFluoroscopyFindings" form={form} setField={setField}
              placeholder="e.g. Dynamic instability C5-C6 on flexion/extension" />
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION: LABORATORY RESULTS ═══════════ */}
      <div style={navyCard}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <FiDroplet size={12} style={{ color: C.teal }} /> Laboratory Results
          </span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
          Document relevant lab work — abnormalities influence protocol selection and safety gating
        </div>
        <div style={S.grid(2)}>
          <div>
            <LabRow label="CBC (Complete Blood Count)" checkedKey="labCBC" resultsKey="labCBCSummary" form={form} setField={setField}
              placeholder="e.g. Mild anemia (HCT 32%), otherwise WNL" />
            <LabRow label="Chemistry Panel" checkedKey="labChemistry" resultsKey="labChemistrySummary" form={form} setField={setField}
              placeholder="e.g. BUN/Creatinine elevated, ALT mildly elevated" />
            <LabRow label="Urinalysis" checkedKey="labUrinalysis" resultsKey="labUrinalysisSummary" form={form} setField={setField}
              placeholder="e.g. USG 1.035, no crystals, trace protein" />
          </div>
          <div>
            <LabRow label="Thyroid Panel" checkedKey="labThyroid" resultsKey="labThyroidSummary" form={form} setField={setField}
              placeholder="e.g. T4 low (0.8 µg/dL) — hypothyroid, on supplementation" />
            <LabRow label="Cardiac Biomarkers" checkedKey="labCardiac" resultsKey="labCardiacSummary" form={form} setField={setField}
              placeholder="e.g. ProBNP elevated — cardiology clearance pending" />
          </div>
        </div>
        {form.labThyroid && form.species === "Feline" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 12px", borderRadius: 6, background: C.purpleBg, border: `1px solid ${C.purple}` }}>
            <TbMicroscope size={13} style={{ color: C.purpleLight }} />
            <span style={{ fontSize: 10, color: C.purpleLight, fontWeight: 600 }}>Feline note: Thyroid panel critical for hyperthyroidism screening — affects anesthesia risk, cardiac function, and metabolic response to exercise.</span>
          </div>
        )}
      </div>

      {/* ═══════════ SECTION: FUNCTIONAL & SPECIAL TESTS ═══════════ */}
      <div style={navyCard}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid rgba(14,165,233,0.25)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <TbStethoscope size={12} style={{ color: C.teal }} /> Functional & Special Tests
          </span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
          Orthopedic and neurological test results — influences diagnosis confirmation and protocol phase assignment
        </div>

        <div style={S.grid(3)}>
          {/* Orthopedic Tests */}
          <div>
            <label style={S.label}>Drawer Test (Cranial Cruciate)</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }}
              value={form.testDrawer || ""} onChange={e => setField("testDrawer", e.target.value)}>
              <option value="">--- Not Performed ---</option>
              <option value="Positive">Positive — Cranial tibial translation</option>
              <option value="Negative">Negative — No laxity</option>
              <option value="Equivocal">Equivocal — Subtle / inconclusive</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Tibial Thrust</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }}
              value={form.testTibialThrust || ""} onChange={e => setField("testTibialThrust", e.target.value)}>
              <option value="">--- Not Performed ---</option>
              <option value="Positive">Positive — Cranial thrust present</option>
              <option value="Negative">Negative — No thrust</option>
              <option value="Equivocal">Equivocal — Subtle / inconclusive</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Ortolani Sign (Hip Laxity)</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }}
              value={form.testOrtolani || ""} onChange={e => setField("testOrtolani", e.target.value)}>
              <option value="">--- Not Performed ---</option>
              <option value="Positive">Positive — Subluxation / reduction click</option>
              <option value="Negative">Negative — Stable hip</option>
              <option value="Equivocal">Equivocal — Subtle / inconclusive</option>
            </select>
          </div>
        </div>

        <div style={{ ...S.grid(2), marginTop: 14 }}>
          <div>
            <label style={S.label}>Spinal Palpation</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }}
              value={form.testSpinalPalpation || ""} onChange={e => setField("testSpinalPalpation", e.target.value)}>
              <option value="">--- Not Performed ---</option>
              <option value="Pain Present">Pain Present — Hyperesthesia on palpation</option>
              <option value="No Pain">No Pain — Non-painful throughout</option>
              <option value="Equivocal">Equivocal — Inconsistent response</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Neurological Grade</label>
            <select style={{ ...S.select, width: "100%", border: `1.5px solid ${C.border}` }}
              value={form.neuroGrade || ""} onChange={e => setField("neuroGrade", e.target.value)}>
              <option value="">--- Not Assessed ---</option>
              <option value="I">Grade I — Pain only, no neurological deficits</option>
              <option value="II">Grade II — Ambulatory paraparesis, ataxia</option>
              <option value="III">Grade III — Non-ambulatory paraparesis</option>
              <option value="IV">Grade IV — Paralysis with deep pain perception</option>
              <option value="V">Grade V — Paralysis WITHOUT deep pain perception</option>
            </select>
            {form.neuroGrade === "V" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, padding: "6px 10px", borderRadius: 6, background: C.redBg, border: `1px solid ${C.red}` }}>
                <FiCrosshair size={12} style={{ color: C.red }} />
                <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>RED FLAG: Absent deep pain perception — protocol generation may be blocked. Immediate veterinary neurologist consult recommended.</span>
              </div>
            )}
            {form.neuroGrade === "IV" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, padding: "6px 10px", borderRadius: 6, background: C.amberBg, border: `1px solid ${C.amber}` }}>
                <FiCrosshair size={12} style={{ color: C.amber }} />
                <span style={{ fontSize: 10, color: C.amber, fontWeight: 600 }}>CAUTION: Paralysis with intact deep pain — restricted to passive exercises. Veterinary neurologist consult recommended.</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Diagnostic Notes */}
        <div style={{ marginTop: 14 }}>
          <label style={S.label}>Additional Diagnostic Notes</label>
          <textarea
            style={{ ...S.input, border: `1.5px solid ${C.border}`, minHeight: 52, resize: "vertical", fontFamily: "inherit" }}
            value={form.diagnosticNotes || ""} onChange={e => setField("diagnosticNotes", e.target.value)}
            placeholder="e.g. Arthrocentesis pending, second opinion imaging recommended, EMG scheduled"
          />
        </div>
      </div>

      {/* Step 3 Diagnostic Workup navigation */}
      <StepNavButtons
        onBack={() => goToStep(2)}
        backLabel={"← Back to Clinical Assessment"}
        onNext={() => goToStep(4)}
        nextLabel="Next: Patient Status"
      />
    </>
  );
}
