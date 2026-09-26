import React, { useState } from "react";
import { FiArrowLeft, FiInfo } from "react-icons/fi";
import C from "../../constants/colors";
import { SPECIES, SEX, sexOf, field, Field, WeightPair, ClinicalBackground } from "./PatientForm";
import { lbsToKg } from "../../constants/weight";
import { BODY_CONDITION_SCORE } from "./v2api";

// ─────────────────────────────────────────────
// CORRECT A PATIENT RECORD
//
// Until 22 Sep 2026 there was no way to do this. `PUT /api/patients/:id` had
// existed since V1 and NOTHING in the app called it — so a record was written
// once at registration and then frozen. A wrong weight stayed wrong. A missing
// surgery date stayed missing, which meant a post-operative patient could
// never have a recovery phase calculated. Newly started medications never
// reached the contraindication scan.
//
// That is why Bella — the only real post-operative record in the database —
// carries `surgery_date: null` and "TPLO Post-Op", and why nobody could say
// how far post-op she was.
//
// WHAT IS EDITABLE
// Everything clinical. Nothing administrative: no insurance, no billing, no
// contact details, no dashboard blob. Those belong to the V1 client screens
// and have no bearing on what a protocol does.
//
// WHAT THIS DOES NOT DO
// It does not touch any protocol. An approved version stores the inputs it was
// built from (`engine_input_json`) and its content is hashed at approval, so
// correcting the record here cannot rewrite what a clinician signed. That is
// the right behaviour and it is also why the notice below exists: a correction
// that matters clinically needs a new version, and the record changing quietly
// underneath an approved protocol should not look like one.
// ─────────────────────────────────────────────


/** A stored value into a form value. null and undefined both become "". */
const str = (v) => (v === null || v === undefined ? "" : String(v));

/**
 * The stored species as one of the two values the control offers.
 *
 * The database holds "canine" lower-case; the select offers "Canine". Without
 * normalising BOTH sides, every record reported species as changed the moment
 * the form opened — "3 fields changed" when the clinician had touched two —
 * and saving would have rewritten the casing on every patient as a side
 * effect of correcting something else. Caught in the browser, not by a test.
 */
const speciesOf = (v) => (v && /fel|cat/i.test(String(v)) ? "Feline" : "Canine");

export default function EditPatient({ patient, activeProtocol, onSave, onCancel, busy }) {
  const [f, setF] = useState(() => ({
    name: str(patient.name),
    species: speciesOf(patient.species),
    breed: str(patient.breed),
    age: str(patient.age),
    // Pounds. `weight_kg` is the converted display field and is stripped on save.
    weight: str(patient.weight),
    weight_kg: str(lbsToKg(patient.weight) ?? ""),
    sex: sexOf(patient.sex),
    condition: str(patient.condition),
    affected_region: str(patient.affected_region),
    surgery_date: str(patient.surgery_date).slice(0, 10),
    client_name: str(patient.client_name),
    body_condition_score: str(patient.body_condition_score),
    current_medications: str(patient.current_medications),
    medical_history: str(patient.medical_history),
    // special_instructions is NOT here. It is a mirror of the treatment
    // store's activity_restrictions since 2026-09-26 — edited in the
    // Treatment block, never from this form.
  }));

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const patch = (p2) => setF((p) => ({ ...p, ...p2 }));

  const missing = ["name", "breed", "age", "weight", "condition"]
    .filter((k) => !String(f[k]).trim());

  /**
   * What actually changed.
   *
   * Only changed fields are sent. The route builds its UPDATE from the keys it
   * receives, so an untouched field is genuinely untouched rather than
   * rewritten with the same value — which keeps this from stamping over a
   * column some other screen updated while this form was open.
   */
  function changes() {
    const out = {};
    const compare = {
      name: str(patient.name),
      species: speciesOf(patient.species),
      breed: str(patient.breed),
      age: str(patient.age),
      weight: str(patient.weight),
      sex: sexOf(patient.sex),
      condition: str(patient.condition),
      affected_region: str(patient.affected_region),
      surgery_date: str(patient.surgery_date).slice(0, 10),
      client_name: str(patient.client_name),
      body_condition_score: str(patient.body_condition_score),
      current_medications: str(patient.current_medications),
      medical_history: str(patient.medical_history),
      // Deliberately absent — see the form state above. Including it here
      // would put it back in the PUT body the moment the mirror changed
      // underneath an open form, stamping a stale value over the store's.
    };
    for (const [k, was] of Object.entries(compare)) {
      const now = String(f[k] ?? "").trim();
      if (now === String(was).trim()) continue;
      if (k === "age" || k === "weight") out[k] = now === "" ? null : Number(now);
      else if (k === "body_condition_score") out[k] = now === "" ? null : Number(now);
      // An empty date must not reach the record as "" — the proposal reads a
      // missing surgery date as "no surgery", and "" is neither.
      else out[k] = now === "" ? null : now;
    }
    return out;
  }

  const pending = changes();
  const changedCount = Object.keys(pending).length;
  const canSubmit = missing.length === 0 && changedCount > 0 && !busy;

  function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSave(pending);
  }

  const label = { fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
    textTransform: "uppercase", color: C.textMid };

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
        <FiArrowLeft size={14} /> Back
      </button>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: "0 0 4px" }}>
        Correct {patient.name}&rsquo;s record
      </h2>
      <p style={{ fontSize: 13, color: C.textMid, margin: "0 0 18px", maxWidth: "62ch" }}>
        Everything clinical about this animal. Only what you change is written.
      </p>

      {/* An approved protocol was built from the values that were true when it
          was approved, and it keeps them. Saying so here stops a correction
          from looking like it silently updated the prescription. */}
      {activeProtocol && (
        <div style={{
          display: "flex", gap: 9, alignItems: "flex-start",
          padding: "10px 12px", marginBottom: 16, borderRadius: 8,
          background: C.tealLight, border: `1px solid ${C.teal}`,
        }}>
          <FiInfo size={15} style={{ color: C.tealDark, flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.55 }}>
            {patient.name} has an approved protocol (version{" "}
            {activeProtocol.version_number}). Correcting the record here does not
            change it — it was built from the values recorded at the time and
            keeps them. If the clinical picture has actually changed, record a
            visit and generate a new version.
          </span>
        </div>
      )}

      <div style={{ display: "grid", gap: 16, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
          <Field label="Patient name" required>
            <input style={field} value={f.name} onChange={set("name")} />
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

          <WeightPair lbs={f.weight} kg={f.weight_kg} onChange={patch} required />

          <Field label="Sex">
            <select style={field} value={f.sex} onChange={set("sex")}>
              {SEX.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          <Field
            label="Body condition"
            hint="WSAVA 1–9. Recorded and trended; it does not change exercise selection."
          >
            <select style={field} value={f.body_condition_score} onChange={set("body_condition_score")}>
              {BODY_CONDITION_SCORE.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </Field>
        </div>

        <Field
          label="Condition"
          hint="What is being treated today. This is what the clinical proposal reasons from — name the diagnosis, not the sign."
          required
        >
          <input style={field} value={f.condition} onChange={set("condition")} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
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

        <div>
          <div style={{ ...label, marginBottom: 10 }}>Clinical background</div>
          <ClinicalBackground values={f} onChange={patch} />
        </div>
      </div>

      {/* The same warning registration gives, because this is where a missing
          surgery date usually gets fixed. */}
      {!f.surgery_date && /post.?op|tplo|tta|repair|ectomy|otomy/i.test(f.condition) && (
        <div style={{
          display: "flex", gap: 9, alignItems: "flex-start",
          padding: "10px 12px", marginBottom: 16, borderRadius: 8,
          background: C.amberBg, border: `1px solid ${C.amber}`,
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
          {busy ? "Saving…" : "Save corrections"}
        </button>
        <span style={{ fontSize: 12.5, color: C.textLight }}>
          {missing.length > 0
            ? `Still needed: ${missing.join(", ")}`
            : changedCount === 0
              ? "Nothing changed yet."
              : `${changedCount} field${changedCount === 1 ? "" : "s"} changed.`}
        </span>
      </div>
    </form>
  );
}
