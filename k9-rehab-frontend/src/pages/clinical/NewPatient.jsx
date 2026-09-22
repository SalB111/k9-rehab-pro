import React, { useState } from "react";
import { FiArrowLeft, FiInfo } from "react-icons/fi";
import C from "../../constants/colors";

// ─────────────────────────────────────────────
// REGISTER A PATIENT
//
// Eight fields. The seven-step wizard this replaces asked 186 before a
// protocol appeared, and the engine read about 36 of them.
//
// Everything else the engine needs is proposed from these and the clinic's
// equipment profile, then confirmed by a clinician — see the intake proposal.
// So the question here is only ever "what does the system have no way of
// knowing", and the answer is: who the animal is, and what is wrong.
//
// The five marked fields are required because the record cannot exist without
// them. `condition` is required for a different reason: it is what the whole
// proposal reasons from. A patient with no stated condition gets the fallback
// gates and little else, which is safe but close to useless.
// ─────────────────────────────────────────────

const SPECIES = [
  { value: "Canine", label: "Dog" },
  { value: "Feline", label: "Cat" },
];

const field = {
  width: "100%", padding: "9px 11px", fontSize: 14,
  border: `1px solid ${C.border}`, borderRadius: 7,
  background: C.surface, color: C.text, outline: "none",
};

function Field({ label, hint, required, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
        textTransform: "uppercase", color: C.textMid, marginBottom: 5,
      }}>
        {label}
        {required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
      </span>
      {children}
      {hint && (
        <span style={{ display: "block", fontSize: 11, color: C.textLight, marginTop: 4 }}>
          {hint}
        </span>
      )}
    </label>
  );
}

export default function NewPatient({ onCreate, onCancel, busy }) {
  const [f, setF] = useState({
    name: "", species: "Canine", breed: "", age: "", weight: "",
    sex: "", condition: "", affected_region: "", surgery_date: "",
    client_name: "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const missing = ["name", "breed", "age", "weight", "condition"].filter((k) => !String(f[k]).trim());
  const canSubmit = missing.length === 0 && !busy;

  function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onCreate({
      ...f,
      age: Number(f.age),
      weight: Number(f.weight),
      // An empty date must not reach the record as "" — the proposal reads a
      // missing surgery date as "no surgery", and "" is neither.
      surgery_date: f.surgery_date || null,
      affected_region: f.affected_region.trim() || null,
      sex: f.sex || null,
      client_name: f.client_name.trim() || null,
    });
  }

  return (
    <form onSubmit={submit}>
      <button
        type="button"
        onClick={onCancel}
        style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 14,
          background: "none", border: "none", cursor: "pointer",
          color: C.textMid, fontSize: 13, padding: 0,
        }}
      >
        <FiArrowLeft size={14} /> Back to patients
      </button>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: "0 0 4px" }}>
        Register a patient
      </h2>
      <p style={{ fontSize: 13, color: C.textMid, margin: "0 0 18px", maxWidth: "58ch" }}>
        Just enough to know who this animal is and what is wrong. The rest of the
        clinical picture is proposed from the record and confirmed by you at the
        next step.
      </p>

      <div style={{
        display: "grid", gap: 14,
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        marginBottom: 16,
      }}>
        <Field label="Patient name" required>
          <input style={field} value={f.name} onChange={set("name")} autoFocus />
        </Field>

        <Field label="Species" required>
          <select style={field} value={f.species} onChange={set("species")}>
            {SPECIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>

        <Field label="Breed" required>
          <input style={field} value={f.breed} onChange={set("breed")} />
        </Field>

        <Field label="Age" hint="Years. Decimals are fine — 0.5 for six months." required>
          <input style={field} type="number" step="0.1" min="0" value={f.age} onChange={set("age")} />
        </Field>

        <Field label="Weight" hint="Kilograms." required>
          <input style={field} type="number" step="0.1" min="0" value={f.weight} onChange={set("weight")} />
        </Field>

        <Field label="Sex">
          <select style={field} value={f.sex} onChange={set("sex")}>
            <option value="">Not stated</option>
            <option value="Male">Male</option>
            <option value="Male Neutered">Male neutered</option>
            <option value="Female">Female</option>
            <option value="Female Spayed">Female spayed</option>
          </select>
        </Field>
      </div>

      <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
        <Field
          label="Condition"
          required
          hint="Write it as you would in the record — “TPLO post-op, left stifle”, “IVDD Hansen Type I T12-13”. This is what the clinical proposal reasons from, so name the diagnosis rather than the sign."
        >
          <input style={field} value={f.condition} onChange={set("condition")} />
        </Field>

        <div style={{
          display: "grid", gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        }}>
          <Field label="Affected region" hint="e.g. Left stifle, T12-L1, Bilateral hip.">
            <input style={field} value={f.affected_region} onChange={set("affected_region")} />
          </Field>

          <Field label="Surgery date" hint="Leave blank if this is not a surgical case.">
            <input style={field} type="date" value={f.surgery_date} onChange={set("surgery_date")} />
          </Field>

          <Field label="Client name" hint="The owner.">
            <input style={field} value={f.client_name} onChange={set("client_name")} />
          </Field>
        </div>
      </div>

      {/* Said here rather than discovered later: a surgical case with no date
          cannot be phase-calculated, and the proposal will treat every
          post-operative restriction as active until told otherwise. */}
      {!f.surgery_date && /post.?op|tplo|tta|repair|ectomy|otomy/i.test(f.condition) && (
        <div style={{
          display: "flex", gap: 9, alignItems: "flex-start",
          padding: "10px 12px", marginBottom: 16, borderRadius: 8,
          background: C.amberBg,
          border: `1px solid ${C.amber}`,
        }}>
          <FiInfo size={15} style={{ color: C.amber, flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.55 }}>
            This reads as a surgical case but has no surgery date. Without one the
            recovery phase cannot be calculated, and every post-operative
            restriction will be proposed as still active. Add the date if you have it.
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: "11px 20px", fontSize: 14, fontWeight: 700,
            borderRadius: 8, border: "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            background: canSubmit ? C.teal : C.borderLight,
            color: canSubmit ? "#fff" : C.textLight,
          }}
        >
          {busy ? "Registering…" : "Register and continue"}
        </button>
        {missing.length > 0 && (
          <span style={{ fontSize: 12, color: C.textLight }}>
            Still needed: {missing.join(", ")}
          </span>
        )}
      </div>
    </form>
  );
}
