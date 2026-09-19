import React, { useState } from "react";
import { FiChevronDown, FiChevronRight, FiPlus, FiTrash2 } from "react-icons/fi";
import C from "../../constants/colors";
import { WEIGHT_BEARING, OVERALL_CHANGE, TREATMENT_APPROACH } from "./v2api";

// ─────────────────────────────────────────────
// TODAY'S CLINICAL UPDATE
//
// The clinician records only what changed or must be measured today. Everything
// else comes from the longitudinal record.
//
// Progressive disclosure, not omission: the neurological exam, grading scales
// and post-operative status are collapsed by default because most visits do not
// need them — but they drive real engine safety gates, so they are one click
// away and clearly labelled rather than hidden.
// ─────────────────────────────────────────────

const field = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: `1px solid ${C.border}`, borderRadius: 6,
  background: C.surface, color: C.text,
};
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: C.textMid,
  textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4, display: "block",
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select style={field} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Collapsible({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", background: C.bg, border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        {open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{title}</span>
        {subtitle && (
          <span style={{ fontSize: 11, color: C.textLight, marginLeft: "auto" }}>{subtitle}</span>
        )}
      </button>
      {open && <div style={{ padding: 14, display: "grid", gap: 14 }}>{children}</div>}
    </div>
  );
}

const MEASURE_KEYS = [
  "ROM_FLEXION", "ROM_EXTENSION", "GIRTH", "HCPI", "CBPI_PSS", "CBPI_PIS", "LOAD",
];

export default function TodaysUpdate({
  assessment, setAssessment, measurements, setMeasurements, hasBaseline,
}) {
  const set = (key) => (value) =>
    setAssessment((a) => ({ ...a, [key]: value === "" ? null : value }));

  const setNum = (key) => (value) =>
    setAssessment((a) => ({ ...a, [key]: value === "" ? null : Number(value) }));

  const addMeasurement = () =>
    setMeasurements((m) => [
      ...m,
      { measure_key: "ROM_FLEXION", site: "STIFLE", side: "LEFT", value_numeric: "", unit: "degrees" },
    ]);

  const updateMeasurement = (i, patch) =>
    setMeasurements((m) => m.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const removeMeasurement = (i) =>
    setMeasurements((m) => m.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* ── Core: what almost every visit needs ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
        <Field label="Pain (0–10)" hint="8 or above routes to comfort care">
          <input
            type="number" min="0" max="10" style={field}
            value={assessment.pain_score ?? ""}
            onChange={(e) => setNum("pain_score")(e.target.value)}
          />
        </Field>

        <Field label="Lameness (0–5)" hint="5 = non-weight-bearing">
          <input
            type="number" min="0" max="5" style={field}
            value={assessment.lameness_grade ?? ""}
            onChange={(e) => setNum("lameness_grade")(e.target.value)}
          />
        </Field>

        <Field label="Weight bearing">
          <Select
            value={assessment.weight_bearing_status}
            onChange={set("weight_bearing_status")}
            options={WEIGHT_BEARING}
          />
        </Field>

        <Field label="Mobility">
          <input
            style={field} placeholder="e.g. Ambulatory"
            value={assessment.mobility_level ?? ""}
            onChange={(e) => set("mobility_level")(e.target.value)}
          />
        </Field>

        <Field
          label="Treatment approach"
          hint="Drives the protocol path — surgical and conservative differ"
        >
          <Select
            value={assessment.treatment_approach}
            onChange={set("treatment_approach")}
            options={TREATMENT_APPROACH}
          />
        </Field>

        {hasBaseline && (
          <Field label="Change since last visit" hint="Your clinical judgement, not calculated">
            <Select
              value={assessment.overall_change}
              onChange={set("overall_change")}
              options={OVERALL_CHANGE}
            />
          </Field>
        )}
      </div>

      <Field label="Clinical observation">
        <textarea
          rows={2} style={{ ...field, resize: "vertical" }}
          value={assessment.clinical_observation ?? ""}
          onChange={(e) => set("clinical_observation")(e.target.value)}
        />
      </Field>

      {/* ── Measurements ──────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={labelStyle}>Measurements</span>
          <button
            type="button" onClick={addMeasurement}
            style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 12,
              padding: "5px 10px", borderRadius: 6, cursor: "pointer",
              border: `1px solid ${C.border}`, background: C.surface, color: C.teal,
            }}
          >
            <FiPlus size={13} /> Add
          </button>
        </div>

        {measurements.length === 0 ? (
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>
            None recorded today. Each reading is kept — nothing overwrites a previous one.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {measurements.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  style={{ ...field, width: 155 }} value={m.measure_key}
                  onChange={(e) => updateMeasurement(i, { measure_key: e.target.value })}
                >
                  {MEASURE_KEYS.map((k) => (
                    <option key={k} value={k}>{k.replace(/_/g, " ").toLowerCase()}</option>
                  ))}
                </select>
                <input
                  style={{ ...field, width: 100 }} placeholder="site"
                  value={m.site ?? ""}
                  onChange={(e) => updateMeasurement(i, { site: e.target.value.toUpperCase() })}
                />
                <select
                  style={{ ...field, width: 100 }} value={m.side ?? ""}
                  onChange={(e) => updateMeasurement(i, { side: e.target.value })}
                >
                  {["", "LEFT", "RIGHT", "BILATERAL", "NA"].map((s) => (
                    <option key={s} value={s}>{s ? s.toLowerCase() : "side"}</option>
                  ))}
                </select>
                <input
                  type="number" style={{ ...field, width: 90 }} placeholder="value"
                  value={m.value_numeric ?? ""}
                  onChange={(e) => updateMeasurement(i, { value_numeric: e.target.value })}
                />
                <input
                  style={{ ...field, width: 80 }} placeholder="unit"
                  value={m.unit ?? ""}
                  onChange={(e) => updateMeasurement(i, { unit: e.target.value })}
                />
                <button
                  type="button" onClick={() => removeMeasurement(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight }}
                  title="Remove"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
            <div style={{ fontSize: 11, color: C.textLight }}>
              Left and right are tracked separately so the operated and contralateral limb can be compared.
            </div>
          </div>
        )}
      </div>

      {/* ── Collapsed: drives real safety gates when present ───────────────── */}
      <Collapsible title="Clinical grading scales" subtitle="MMT · IVDD · OA">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          <Field label="MMT (0–5)" hint="≤1 restricts to passive work">
            <input
              type="number" min="0" max="5" style={field}
              value={assessment.mmt_grade ?? ""}
              onChange={(e) => setNum("mmt_grade")(e.target.value)}
            />
          </Field>
          <Field label="IVDD grade" hint="IV or V locks to Phase 1 neuro">
            <Select
              value={assessment.ivdd_grade}
              onChange={set("ivdd_grade")}
              options={["", "I", "II", "III", "IV", "V"].map((v) => ({
                value: v, label: v || "Not assessed",
              }))}
            />
          </Field>
          <Field label="OA stage (0–4)" hint="4 excludes impact loading">
            <input
              type="number" min="0" max="4" style={field}
              value={assessment.oa_stage ?? ""}
              onChange={(e) => setNum("oa_stage")(e.target.value)}
            />
          </Field>
        </div>
      </Collapsible>

      <Collapsible title="Neurological examination" subtitle="absent deep pain restricts to passive care">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          {[
            ["neuro_proprioception", "Proprioception"],
            ["neuro_withdrawal", "Withdrawal"],
            ["neuro_deep_pain", "Deep pain"],
            ["neuro_motor_grade", "Motor grade"],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                style={field} placeholder="e.g. Present / Delayed / Absent"
                value={assessment[key] ?? ""}
                onChange={(e) => set(key)(e.target.value)}
              />
            </Field>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Post-operative status & restrictions" subtitle="a compromised incision blocks generation">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          <Field label="Incision status" hint="Dehisced / infected / open / draining blocks the protocol">
            <input
              style={field} placeholder="e.g. Healing"
              value={assessment.incision_status ?? ""}
              onChange={(e) => set("incision_status")(e.target.value)}
            />
          </Field>
          <Field label="Complications noted">
            <input
              style={field}
              value={assessment.complications_noted ?? ""}
              onChange={(e) => set("complications_noted")(e.target.value)}
            />
          </Field>
          <Field label="Gait quality">
            <input
              style={field}
              value={assessment.gait_quality ?? ""}
              onChange={(e) => set("gait_quality")(e.target.value)}
            />
          </Field>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            ["crate_rest_required", "Crate rest required"],
            ["e_collar_required", "E-collar required"],
          ].map(([key, label]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={assessment[key] === true}
                onChange={(e) => set(key)(e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}
