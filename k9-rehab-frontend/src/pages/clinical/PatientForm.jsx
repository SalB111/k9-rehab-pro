import React from "react";
import C from "../../constants/colors";
import { lbsToKg, kgToLbs } from "../../constants/weight";

// ─────────────────────────────────────────────
// PATIENT FORM — shared pieces
//
// Registering a patient and correcting one are different jobs. Registration
// asks the least it can; correction has to reach every clinical field on the
// record, including the three the engine reads and registration never asked
// for. They are deliberately NOT one component with a mode flag.
//
// What they do share is how a field looks and how the weight pair behaves,
// and those live here so there is one of each. The lbs/kg FACTOR already has
// a single home in constants/weight.js; this is the other half — the
// coordination between the two boxes, which is where a second copy would
// quietly drift.
// ─────────────────────────────────────────────

/**
 * Species.
 *
 * Both values, because an EXISTING record may say Feline and a form that
 * cannot display what is stored will silently coerce it — which is how a cat
 * would become a dog the first time somebody opened its record to fix a
 * typo. Editing uses this list.
 */
export const SPECIES = [
  { value: "Canine", label: "Dog" },
  { value: "Feline", label: "Cat" },
];

/**
 * What a NEW patient may be registered as.
 *
 * Canine only, from 22 Sep 2026. The protocol engine has no feline path —
 * `protocol-generator.js` holds zero references to species and can select none
 * of the fifteen FELINE_* exercises in the library — so a cat registered here
 * could be examined, assessed and gated, and then refused at the last step.
 *
 * The feline exercise set and `beau-feline.js` stay in the backend. Feline
 * rehabilitation is a proper addition, not a flag to flip, and offering it
 * before the engine can do it produces canine exercises with a cat's name on
 * them. Restore this to SPECIES when the engine can select feline work.
 */
export const SPECIES_FOR_NEW_PATIENT = SPECIES.filter((s) => s.value === "Canine");

/**
 * Sex, and the reader that copes with what is already stored.
 *
 * The database holds four spellings of two states — "Female - Spayed" with a
 * hyphen, "Female — Spayed" with an em dash, "Male — Neutered", and null —
 * and until 22 Sep 2026 NEITHER form offered any of them. Registration wrote
 * "Female Spayed"; the edit form offered "Female spayed"; the records held a
 * third thing. Every existing patient therefore displayed as "Not stated"
 * while their record plainly said otherwise, which in a medical record is not
 * a cosmetic problem.
 *
 * `sexOf` reads any of those spellings. It is applied to BOTH sides of the
 * edit diff, so opening a record never reports sex as changed and the stored
 * spelling is left alone; picking a different sex writes the canonical value.
 * The data converges as records are touched, never as a side effect.
 *
 * Sex is not an engine input — no protocol turns on it — so nothing here
 * changes what is prescribed. It is displayed, and it should be right.
 */
export const SEX = [
  { value: "", label: "Not stated" },
  { value: "Male", label: "Male" },
  { value: "Male neutered", label: "Male neutered" },
  { value: "Female", label: "Female" },
  { value: "Female spayed", label: "Female spayed" },
];

export function sexOf(stored) {
  const t = String(stored ?? "").toLowerCase();
  if (!t.trim()) return "";
  const altered = /spay|neuter|castrat/.test(t);
  // "female" is tested before "male" because it contains it. Plain substring
  // tests on purpose: no word boundaries to get wrong, and the separator
  // between the two halves ("-", an em dash, a space) is then irrelevant —
  // which is the entire problem being solved here.
  if (t.includes("female")) return altered ? "Female spayed" : "Female";
  if (t.includes("male")) return altered ? "Male neutered" : "Male";
  return "";
}

export const field = {
  width: "100%", padding: "9px 11px", fontSize: 14,
  border: `1px solid ${C.border}`, borderRadius: 7,
  background: C.surface, color: C.text, outline: "none",
};

// The unit under each weight box. A weight with no unit on screen is how "68"
// came to mean pounds on one page and kilograms on another.
const unitTag = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
  color: C.textLight, marginTop: 3, textAlign: "center",
};

export function Field({ label, hint, required, children }) {
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

/**
 * Keep two weight boxes agreeing about one fact.
 *
 * The typed box keeps exactly what was typed — converting it back and forth on
 * every keystroke fights the person entering it. The OTHER box is derived.
 * Anything that is not a positive number blanks the other rather than leaving
 * a stale conversion beside a real one, because two boxes showing
 * contradictory weights is worse than one showing none.
 *
 * Returns the patch to merge into form state. Pounds are the stored unit;
 * `weight_kg` is a display field and every caller strips it before submitting.
 */
export function weightPatch(unit, raw) {
  if (unit === "lbs") {
    const kg = lbsToKg(raw);
    return { weight: raw, weight_kg: kg === null ? "" : String(kg) };
  }
  const lbs = kgToLbs(raw);
  return { weight_kg: raw, weight: lbs === null ? "" : String(lbs) };
}

/**
 * The two weight boxes.
 *
 * Nobody should be doing arithmetic at the front desk — a weight converted in
 * someone's head is a weight that can be wrong, and the people entering these
 * are not all working in metric.
 */
export function WeightPair({ lbs, kg, onChange, required }) {
  return (
    <Field
      label="Weight"
      required={required}
      hint="Enter either — the other converts. Pounds are recorded."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <input
            style={field} type="number" step="0.1" min="0" placeholder="lbs"
            aria-label="Weight in pounds"
            value={lbs ?? ""}
            onChange={(e) => onChange(weightPatch("lbs", e.target.value))}
          />
          <div style={unitTag}>lbs</div>
        </div>
        <div>
          <input
            style={field} type="number" step="0.1" min="0" placeholder="kg"
            aria-label="Weight in kilograms"
            value={kg ?? ""}
            onChange={(e) => onChange(weightPatch("kg", e.target.value))}
          />
          <div style={unitTag}>kg</div>
        </div>
      </div>
    </Field>
  );
}

/**
 * The three fields the engine reads and nothing ever collected.
 *
 * `currentMedications`, `medicalHistory` and `specialInstructions` are all
 * engine inputs — every one of them feeds the contraindication keyword scan in
 * protocol-generator.js. They map from these columns, which no screen in the
 * V2 workflow wrote to, so for every patient registered through it the scan
 * has been running over three empty strings.
 *
 * Optional, and collapsed by default on registration: the point of the short
 * registration form stands, and a receptionist taking a booking will not have
 * this. It is here so the gap stops being structural, and on the edit surface
 * so it can be filled in when the clinician does have it.
 */
export function ClinicalBackground({ values, onChange }) {
  const set = (k) => (e) => onChange({ [k]: e.target.value });
  const area = { ...field, resize: "vertical", fontFamily: "inherit" };
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Field
        label="Current medications"
        hint="Scanned for contraindications — NSAIDs, gabapentin, steroids, sedatives."
      >
        <textarea style={area} rows={2} value={values.current_medications ?? ""}
          onChange={set("current_medications")} />
      </Field>
      <Field
        label="Medical history"
        hint="Scanned for contraindications and post-operative complications. Comorbidities belong here — cardiac disease, endocrine disease, prior surgeries."
      >
        <textarea style={area} rows={3} value={values.medical_history ?? ""}
          onChange={set("medical_history")} />
      </Field>
      {/* ── "Special instructions" MOVED, 2026-09-26 ──────────────────────
          It was a second place to write the same fact. Activity orders live
          in the Treatment block, in patient_treatment_status.activity_
          restrictions, which is what the engine reads;
          patients.special_instructions is now only a MIRROR of that, written
          by the treatment store.

          Winston, Charlie and Luna each ended up holding orders on one side
          that the other was missing — Charlie's heated bedding and 4-weekly
          HCPI reassessment in one, his walk dosing in the other. Leaving this
          box here after the engine moved would not have preserved that split,
          it would have made it worse: anything typed here would no longer
          reach the protocol at all. */}
      <Field
        label="Activity restrictions"
        hint="Recorded in the Treatment block, not here — leash, stairs, crate rest, impact limits."
      >
        <div style={{ ...area, color: "#64748B", fontStyle: "italic", background: "#F8FAFC" }}>
          Open the patient's Treatment block to record or change activity restrictions.
        </div>
      </Field>
    </div>
  );
}
