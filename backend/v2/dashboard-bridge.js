'use strict';

/**
 * THE V1 -> V2 BRIDGE
 *
 * K9 Rehab Pro grew two records of the same patient.
 *
 *   V1 `DashboardView.jsx` writes a clinical record into
 *   `patients.dashboard_data` — a JSON blob keyed by BLOCK::LABEL.
 *
 *   The V2 workflow and the protocol engine read flat columns on `patients`
 *   plus `visit_assessments`.
 *
 * For a while nothing read the blob at all, so a clinician filled in a checked
 * clinical record and the protocol was generated from whatever happened to be
 * in the columns. This module was written to close that gap.
 *
 * WHERE THIS MODULE STANDS IN V3 — read this before extending it
 *
 * V3 moves each block to its own table (see CLAUDE.md). Six blocks are done:
 * equipment, metrics, client, home, goals, diagnostics. For those, this module
 * is DEAD WEIGHT by design — their keys are still in the blob but nothing here
 * should be the source for them.
 *
 * What still genuinely depends on this module is narrow and worth stating
 * exactly, because it is the list of things V3 has left to do:
 *
 *   THREE engine inputs have no column anywhere, so the blob is their only
 *   source, and all three are safety gates:
 *
 *     weightBearingStatus  <- treatment::Weight Bearing Status
 *     incisionStatus       <- treatment::Incision Status
 *     neuroDeepPain        <- assessment::Deep Pain Perception
 *
 *   Everything else mapped below is COLUMN-FIRST: intake-proposal's `FILL`
 *   list reads the column and only consults this module where the column is
 *   empty. That is a fact about today's DATA, not about this code — a patient
 *   with an empty column is blob-sourced the moment they exist.
 *
 * WHAT THIS MODULE DOES
 * Reads that blob and maps it onto engine inputs. It is a READER: it never
 * writes, never decides, and never satisfies a safety gate. Everything it
 * produces arrives at the intake proposal as a PROPOSAL carrying its
 * provenance, and every safety gate still has to be confirmed by a person.
 *
 * FOUR RULES, each learned from this data rather than assumed:
 *
 *   1. MAP FROM THE OPTION LIST, NOT FROM THE STORED VALUES.
 *      No patient currently has "Absent — bilateral" deep pain. The V1 control
 *      offers it. A map fitted to what is stored today would silently fail to
 *      lock a Grade V patient the first time one is entered.
 *
 *   2. KEYS ARE LABELS, SO KEYS ROT.
 *      `key = blockId::label`. Renaming a field in the dashboard orphans every
 *      value stored under the old name — visible right now as
 *      "Neurological Grade (Frankel Modified)" and
 *      "Neurological Grade (Frankel / ASIA Modified)". Every field below
 *      therefore lists every key it has ever been stored under.
 *
 *   3. AN ALIAS LIST IS FOR A RENAME, NEVER FOR TWO LIVE FIELDS.
 *      This is rule 2's failure mode and it caused a real defect. Until
 *      2026-09-24 this file listed
 *
 *          keys: ['treatment::Affected Limb(s)', 'treatment::Affected Area']
 *
 *      as one field. They are not one field. Both controls are live in
 *      TreatmentPanel today, they hold DIFFERENT clinical facts, and they use
 *      different vocabularies:
 *
 *          Affected Limb(s) -> "Both hindlimbs", "Left hindlimb (LH)"
 *          Affected Area    -> "Thoracolumbar spine", "Stifle — right"
 *
 *      `getProtocolType` (protocol-generator.js) string-matches this input, so
 *      feeding it the limb vocabulary changes which protocol runs:
 *
 *          "Osteoarthritis" + "Left Stifle"         ->  tplo protocol
 *          "Osteoarthritis" + "Left hindlimb (LH)"  ->  oa protocol
 *
 *      Same patient, same limb, different protocol, decided by which of the
 *      two fields happened to answer first. Only the anatomical field maps to
 *      `affectedRegion` now. The limb is clinical fact worth keeping and is
 *      carried as CONTEXT, where nothing string-matches it.
 *
 *      Before adding a key to an alias list, check it is not a live control:
 *      `grep 'label="<name>"' k9-rehab-frontend/src/pages/DashboardView.jsx`.
 *      alias-lists-are-renames in dashboard-bridge.test.js enforces this
 *      against the real JSX.
 *
 *   4. UNRECOGNISED IS REPORTED, NEVER GUESSED.
 *      A value the map does not know comes back in `unmapped` with its key and
 *      value. It does not become a default, and it does not disappear.
 *
 * NUMBERS ARE NOT WRITTEN HERE ON PURPOSE. An earlier version of this header
 * stated a patient count, a field count and two key counts. Every one of them
 * was wrong within weeks, while reading as though it had been checked. To see
 * the current shape of the blob, run it:
 *
 *   node -e "const {DatabaseSync}=require('node:sqlite');  *     const db=new DatabaseSync('backend/k9rehab.db');  *     const m={}; for(const r of db.prepare('SELECT dashboard_data FROM patients').all()){  *       if(!r.dashboard_data) continue; const d=JSON.parse(r.dashboard_data);  *       for(const k of Object.keys(d)){const b=k.split('::')[0];(m[b]=m[b]||new Set()).add(k);} }  *     for(const b of Object.keys(m).sort()) console.log(b, m[b].size)"
 */

/**
 * Value normalisers.
 *
 * Each returns the ENGINE's token, or null for "this value says nothing I can
 * act on". Null is a real answer here and always safe: the field simply stays
 * unproposed and the clinician states it.
 */

/** "Grade 3 — Moderate, consistent weight bearing" -> 3 */
function gradeNumber(value) {
  const m = /grade\s*(\d)/i.exec(String(value || ''));
  return m ? Number(m[1]) : null;
}

/**
 * Weight-bearing, from any of the three controls that record it.
 *
 * The V1 dashboard has THREE fields for this, with three different option
 * lists, written at different times:
 *   assessment::Current Mobility Level    "Partial weight bearing (PWB)" …
 *   assessment::Weight Bearing Status     "NWB" | "Toe-touching" | "Partial" | "Full"
 *   treatment::Weight Bearing Status      "Non-weight bearing (NWB)" …
 * and stored data contains values from a fourth, older list
 * ("Full weight bearing — intermittent lameness"). Matching on the abbreviation
 * where present and the prose where not covers all four.
 *
 * Order matters: NWB is tested before "weight bearing", because
 * "Non-weight bearing" contains it.
 */
function weightBearing(value) {
  const t = String(value || '').toLowerCase();
  if (!t.trim()) return null;
  if (/\bnwb\b/.test(t) || t.includes('non-weight')) return 'NWB';
  if (/\bttwb\b/.test(t) || t.includes('toe-touch') || t.includes('toe touch')) return 'TTWB';
  if (/\bpwb\b/.test(t) || t.startsWith('partial')) return 'PWB';
  // "Full weight bearing with lameness (FWBL)" is still full weight bearing:
  // the engine gates LOADING, and the lameness is carried by lamenessGrade.
  if (/\bfwbl?\b/.test(t) || t.startsWith('full') || t.startsWith('normal')
      || t.startsWith('weight bearing')) return 'FWB';
  return null;
}

/**
 * Incision status -> the engine's exclusion keys.
 *
 * Safety-critical and the reason this module tests against the option list.
 * "Dehiscence — clinician review" and "Infection suspected — URGENT" must both
 * reach the engine as values that HARD-BLOCK generation. "Serosanguinous
 * discharge" is deliberately NOT mapped to a blocking value — serosanguinous
 * discharge is expected in early healing and is not dehiscence — but it is not
 * mapped to "healing" either. It comes back null and the clinician states it.
 */
function incisionStatus(value) {
  const t = String(value || '').toLowerCase();
  if (!t.trim()) return null;
  if (t.includes('dehisc')) return 'Dehiscence';
  if (t.includes('infect')) return 'Infection';
  if (t.includes('healed') || t.includes('healing well')) return 'Healing normally';
  if (t.includes('swelling')) return 'Mild Swelling';
  if (t.includes('seroma')) return 'Seroma';
  // "Mild erythema", "Serosanguinous discharge", "Not yet evaluated":
  // real findings with no engine equivalent. Reported, not guessed.
  return null;
}

/**
 * Deep pain perception.
 *
 * "Absent" is the single string that sets _gradeVSupport in the engine, so
 * "Absent — bilateral" must survive the trip as exactly "Absent".
 * "Not tested" is NOT absence and must never become one.
 */
function deepPain(value) {
  const t = String(value || '').toLowerCase();
  if (!t.trim()) return null;
  // "Not tested" is not a finding. It must never become one in either
  // direction: read as present it hides a Grade V, read as absent it locks a
  // walking dog into passive care.
  if (t.includes('not tested') || t.includes('unable')) return null;

  // UNILATERAL FINDINGS ARE NOT MAPPED, and this is the important one.
  //
  // The dashboard offers "Present — right only" and "Present — left only".
  // Both mean deep pain is ABSENT ON THE OTHER SIDE, which in a spinal patient
  // is a serious deficit. The engine has a single neuroDeepPain input, so the
  // only two things this function could say are "Present" — which reports the
  // better side and hides the deficit — or "Absent", which over-restricts a
  // patient who has sensation on one side.
  //
  // Neither is true, so neither is said. The gate comes back unproposed and
  // the clinician states what they found. A field that cannot hold the finding
  // is not a reason to record a different finding.
  if (t.includes('right only') || t.includes('left only') || t.includes('unilateral')) return null;

  if (t.includes('absent')) return 'Absent';
  if (t.includes('present')) return 'Present';
  return null;
}

/**
 * Pain, from the Numeric Rating Scale.
 *
 * Free text in V1, and the stored values include a RANGE — "4-5". The upper
 * bound is taken, because pain drives restriction in this engine (>= 8 forces
 * palliative and a phase lock), so the higher number is the cautious read.
 */
function painScore(value) {
  const t = String(value || '').trim();
  if (!t) return null;
  const nums = t.match(/\d+(?:\.\d+)?/g);
  if (!nums || !nums.length) return null;
  const n = Math.max(...nums.map(Number));
  return n >= 0 && n <= 10 ? n : null;
}

/**
 * A checkbox read as a tri-state used to live here, feeding the e-collar and
 * crate-rest gates from `treatment::E-Collar Required` and
 * `treatment::Strict Crate Rest`.
 *
 * Both moved to `patient_treatment_status` on 2026-09-25 and the rule moved
 * with them — see `flag()` in patient-treatment-store.js, which keeps the same
 * distinction: only a TICK is read, "" and "false" are unanswered, and the
 * gates keep their cautious defaults rather than being relaxed by silence.
 *
 * Deleted rather than left behind, because a normaliser nothing calls is one
 * somebody wires back up beside the store and gets a second source from.
 */

/** A trimmed non-empty string, or null. *//** A trimmed non-empty string, or null. */
function text(value) {
  const t = String(value === null || value === undefined ? '' : value).trim();
  return t ? t : null;
}

/**
 * Does this record describe a patient who had an OPERATION?
 *
 * Needed because `assessment::Date of Diagnosis / Surgery` is one control
 * answering two different questions. For a surgical patient it is the surgery
 * date. For a conservatively managed patient it is the date the diagnosis was
 * made, and those are not the same fact.
 *
 * Reading a diagnosis date as a surgery date is not cosmetic. `surgery_date`
 * drives the post-operative window, which raises the acute gates (incision,
 * e-collar, crate rest), and it used to force treatmentApproach to Surgical —
 * so a dog on conservative management for a partial cruciate tear would have
 * been proposed a post-operative protocol.
 *
 * Deliberately NOT inferred from the diagnosis text. "TPLO Post-Op" in the
 * condition field already routes through `surgicalPresentation` in
 * intake-proposal, and adding a second text heuristic here would mean two
 * places guessing at the same thing from the same words.
 */
function hasSurgery(blob) {
  const stated = String(blob['treatment::Approach'] || '').trim().toLowerCase();
  if (stated === 'surgical') return true;
  if (stated === 'conservative' || stated === 'palliative') return false;
  // No approach recorded: accept the date only if the record names an actual
  // procedure. A surgeon or a procedure type is a statement that one happened.
  return Boolean(text(blob['treatment::Surgery Type']) || text(blob['treatment::Surgeon Name']));
}

/** A finite positive number, or null. */
function number(value) {
  const n = Number(String(value === null || value === undefined ? '' : value).trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * THE MAP.
 *
 * `keys` lists every BLOCK::LABEL this field has been stored under, newest
 * first — see rule 2. `to` is the ENGINE input name. `via` normalises.
 *
 * `gate: true` marks a field that fails UNSAFE if omitted. It changes nothing
 * about how the value is read; it is here so a reader can see at a glance that
 * proposing this field never excuses confirming it.
 *
 * `when(blob)` makes an entry CONDITIONAL — it answers only for a record the
 * predicate accepts. Used where one control answers two different clinical
 * questions depending on the case. `whyNot` is the sentence reported in
 * `unmapped` when it declines, because a value that stops reaching the engine
 * without explanation is the thing this module exists to stop.
 *
 * Two entries may share a `to`. The FIRST filled one wins, so an
 * unconditional entry is written above the conditional one.
 */
const MAP = [
  // ── Identity ──────────────────────────────────────────────────────────────
  // Not engine reasoning inputs — the engine echoes these — but they are
  // fields of the record, and a record with an age of 0 on a ten-year-old dog
  // is wrong on the face of it. Mapped so the gap check can offer the answer
  // the V1 record already holds.
  { keys: ['client::Age (years)'], to: 'age', via: number },
  { keys: ['client::Weight (lbs)'], to: 'weight', via: number },
  { keys: ['metrics::BCS (1–9)', 'assessment::Body Condition Score (1–9)'],
    to: 'bodyConditionScore', via: number },
  { keys: ['client::Breed'], to: 'breed', via: text },
  { keys: ['client::Sex'], to: 'sex', via: text },

  // ── Longitudinal record ───────────────────────────────────────────────────
  { keys: ['assessment::Primary Diagnosis', 'treatment::Primary Diagnosis'],
    to: 'diagnosis', via: text },
  // ANATOMICAL ONLY — see rule 3 in the header. `treatment::Affected Limb(s)`
  // is a different live field with a different vocabulary and is carried as
  // context, not mapped here. Adding it back changes which protocol runs.
  { keys: ['treatment::Affected Area'], to: 'affectedRegion', via: text },
  // treatmentApproach, incisionStatus, eCollarRequired and crateRestRequired
  // were mapped here until 2026-09-25. They are now read from the treatment
  // store by intake-proposal's `readTreatment`, and mapping them here as well
  // would put a second source behind the first — which is the thing V3 exists
  // to end. The blob keys remain in `dashboard_data`, inert.
  // `treatment::Surgery Date` was the first entry here until 2026-09-25. A
  // surgery date is now a PROCEDURE, and a patient can have several — which is
  // why patient_procedures exists and why one date column could never hold it.
  // What remains is the assessment field, which still answers for a patient
  // with no procedure recorded, and only where the record describes an
  // operation. See `hasSurgery`.
  { keys: ['assessment::Date of Diagnosis / Surgery'], to: 'surgeryDate', via: text,
    when: hasSurgery,
    whyNot: 'This record does not describe an operation, so a "Date of Diagnosis '
      + '/ Surgery" is a DIAGNOSIS date. Reading it as a surgery date would open '
      + 'a post-operative window and raise the acute gates on a patient who was '
      + 'never operated on.' },
  { keys: ['assessment::Relevant Medical & Surgical History'],
    to: 'medicalHistory', via: text },
  { keys: ['assessment::Current Pain Medications', 'treatment::Current Medications'],
    to: 'currentMedications', via: text },
  { keys: ['treatment::Activity Restrictions'], to: 'specialInstructions', via: text },

  // ── Today's clinical state ────────────────────────────────────────────────
  { keys: ['assessment::Numeric Rating Scale (NRS 0–10)'], to: 'painScore', via: painScore },
  { keys: ['assessment::Lameness Grade'], to: 'lamenessGrade', via: gradeNumber },
  { keys: ['assessment::Current Mobility Level'], to: 'mobilityLevel', via: text },

  // ── Safety gates. Proposed only; always confirmed by a person. ────────────
  // `treatment::Weight Bearing Status` was the first key here. It is now read
  // from `patient_treatment_status`. The two ASSESSMENT controls remain,
  // because the assessment block has not been migrated and they are the only
  // source for a patient with no treatment record.
  { keys: ['assessment::Weight Bearing Status', 'assessment::Current Mobility Level'],
    to: 'weightBearingStatus', via: weightBearing, gate: true },
  { keys: ['assessment::Deep Pain Perception'], to: 'neuroDeepPain', via: deepPain, gate: true },
];

/**
 * Fields read for the CHART but deliberately not mapped to an engine input,
 * recorded here so "why is this not used" has an answer in the code.
 *
 *   assessment::Neurological Grade (Frankel Modified)
 *     Grade 5 is "Plegia without deep pain", which IS absent deep pain — but
 *     inferring one safety gate from another field is precisely the kind of
 *     cross-derivation that should be a clinician's call, not a mapping
 *     table's. Surfaced as context instead; see `context()`.
 *   assessment::CSU Acute Pain Score (0–4)
 *     A second pain instrument. The engine has one pain input and the NRS maps
 *     to it directly; mapping both would mean deciding which wins.
 *   treatment::Sling Assist Required
 *     The engine records it and excludes nothing on it, by design.
 *   treatment::Affected Limb(s) / assessment::Affected Limb(s)
 *     A different fact from Affected Area, in a different vocabulary. Mapping
 *     it to `affectedRegion` changed which protocol ran; see rule 3.
 *   treatment::Approach
 *     Mapped to `treatmentApproach` below, but intake-proposal derives that
 *     field from the surgery date and presentation. The mapping is the
 *     FALLBACK, and the derivation runs when nothing is recorded — see
 *     intake-proposal.js.
 *   metrics::*  (goniometry, thigh circumference)
 *     Real measurements with no engine input to reach. They belong in
 *     visit_measurements, which is a migration, not a read.
 */
const CONTEXT_KEYS = [
  'assessment::Neurological Grade (Frankel Modified)',
  'assessment::Neurological Grade (Frankel / ASIA Modified)',
  'assessment::CSU Acute Pain Score (0–4)',
  'assessment::Chief Complaint',
  'assessment::Initial Assessment Narrative',
  'assessment::Comorbidities / Secondary Diagnoses',
  'treatment::Surgery Type',
  'treatment::Sling Assist Required',
  // The limb, kept OUT of `affectedRegion` by rule 3. It is real clinical
  // fact and a clinician should see it; it simply must not reach an input that
  // string-matches an anatomical vocabulary.
  'treatment::Affected Limb(s)',
  'assessment::Affected Limb(s)',
  // Recorded by the form and read by nothing before 2026-09-24.
  'treatment::Surgeon Name',
  'treatment::Clinical Notes',
];

/** Parse the blob off a patient row. Never throws; a bad blob reads as empty. */
function parse(patient) {
  const raw = patient && patient.dashboard_data;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** First key that carries a usable value, honouring the alias order. */
function firstFilled(blob, keys) {
  for (const key of keys) {
    const v = blob[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') return { key, value: v };
  }
  return null;
}

/**
 * Read the V1 record as engine inputs.
 *
 * @returns {{
 *   values: Object,        engine input name -> mapped value
 *   provenance: Object,    engine input name -> { key, raw, gate }
 *   unmapped: Array,       { key, value } the map could not interpret
 *   context: Object,       clinical text worth showing, not an engine input
 *   present: boolean       whether this patient has a V1 record at all
 * }}
 */
function readDashboard(patient) {
  const blob = parse(patient);
  const filled = Object.entries(blob).filter(
    ([, v]) => v !== undefined && v !== null && String(v).trim() !== ''
  );

  const values = {};
  const provenance = {};
  const unmapped = [];
  const usedKeys = new Set();

  for (const entry of MAP) {
    // FIRST ENTRY WINS for a given engine input. Two entries may target one
    // input when the second is conditional, so position in MAP is precedence
    // and the unconditional entry is written first.
    if (Object.prototype.hasOwnProperty.call(values, entry.to)) continue;

    const hit = firstFilled(blob, entry.keys);
    if (!hit) continue;

    // A conditional entry whose condition does not hold. Rule 4 still applies:
    // the value is REPORTED as unused, with the reason, rather than vanishing.
    // "Why did the engine not see this date" has to have an answer.
    if (entry.when && !entry.when(blob)) {
      unmapped.push({
        key: hit.key, value: String(hit.value), to: entry.to,
        reason: entry.whyNot || 'a condition on this mapping was not met',
      });
      continue;
    }

    usedKeys.add(hit.key);
    const mapped = entry.via(hit.value);
    if (mapped === null || mapped === undefined) {
      // A real value the map could not interpret. Reported so it can be seen
      // and the map extended — never silently dropped, never guessed at.
      unmapped.push({ key: hit.key, value: String(hit.value), to: entry.to });
      continue;
    }
    values[entry.to] = mapped;
    provenance[entry.to] = { key: hit.key, raw: String(hit.value), gate: entry.gate === true };
  }

  const context = {};
  for (const key of CONTEXT_KEYS) {
    const v = blob[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      context[key] = String(v);
      usedKeys.add(key);
    }
  }

  return {
    values,
    provenance,
    unmapped,
    context,
    present: filled.length > 0,
    fieldsPresent: filled.length,
    fieldsRead: usedKeys.size,
  };
}

/**
 * Where the V1 record and the V2 column disagree.
 *
 * NOT resolved here. Two records of the same animal saying different things is
 * a clinical question — Bella's column says 6 years old and her V1 record says
 * 2, with a date of birth that agrees with the 2 — and the answer is for the
 * clinician looking at both, not for a precedence rule buried in a mapper.
 *
 * @param {Object} patient   the row, columns and dashboard_data
 * @param {Array} fields     [{ column, label, dashboardKey | v1, same? }]
 */
function disagreements(patient, fields) {
  const blob = parse(patient);
  const out = [];
  for (const f of fields) {
    const stored = patient ? patient[f.column] : undefined;
    // `v1` for a column the V1 record splits across several keys — the owner's
    // name is one column here and a first and last name there. Without it the
    // comparison would have to pick one half and would miss a changed surname.
    const v1 = f.v1 ? f.v1(blob) : blob[f.dashboardKey];
    if (stored === undefined || stored === null || String(stored).trim() === '') continue;
    if (v1 === undefined || v1 === null || String(v1).trim() === '') continue;
    // Compare what the two values MEAN, not how they are spelled. Without
    // this, "Female - Spayed" against "Female — Spayed" is a conflict, and a
    // report that is mostly punctuation is a report nobody reads.
    const same = f.same || ((a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase());
    if (same(stored, v1)) continue;
    out.push({
      field: f.label,
      column: String(stored),
      v1Record: String(v1),
      key: f.dashboardKey || (f.keys && f.keys.join(' + ')) || null,
    });
  }
  return out;
}

/** Equal as numbers, to one decimal place. */
const sameNumber = (a, b) => {
  const x = Number(a), y = Number(b);
  return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) < 0.05;
};

/** Male/female and altered-or-not, ignoring how the two halves are joined. */
const sameSex = (a, b) => {
  const norm = (v) => {
    const t = String(v).toLowerCase();
    const altered = /spay|neuter|castrat/.test(t) ? '+' : '';
    if (t.includes('female')) return 'f' + altered;
    if (t.includes('male')) return 'm' + altered;
    return '';
  };
  return norm(a) === norm(b);
};

/**
 * The same number, however it is punctuated.
 *
 * "(954) 555-0142" and "954-555-0142" are one phone number, and a report that
 * flags the brackets is a report nobody reads. Only the digits are compared.
 *
 * A country code is NOT stripped: "+1 954 555 0142" against "954 555 0142" is
 * left as a difference, because guessing that a leading 1 is a country code
 * and not an area code is how a comparison quietly stops catching real
 * mismatches.
 */
const samePhone = (a, b) => {
  const digits = (v) => String(v).replace(/\D/g, '');
  const x = digits(a), y = digits(b);
  return x !== '' && x === y;
};

/** Case and surrounding space never make two addresses different. */
const sameEmail = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

/**
 * The same person, ignoring spacing, case and a leading title.
 *
 * A TITLE CARRIES NO SIGNAL about whether this column is wrong. An owner may
 * perfectly well be a doctor — a physician, a veterinarian in another
 * department, a rehabilitation clinician — and "Dr." in front of a client's
 * name is an ordinary thing to record, not evidence that a practitioner's name
 * has been filed in the client field.
 *
 * It is stripped because the difference is STRUCTURAL rather than occasional:
 * the V1 record stores a first name and a last name and has nowhere to put a
 * title, so an owner with one produces a mismatch on every single comparison,
 * forever. That is a false positive by construction.
 *
 * Nothing real is lost. The disagreement this comparison was added for — a
 * column reading "Dr. Sarah Martinez" against a V1 record naming the owner
 * "Sarah Thompson" — is a different SURNAME, and is caught either way.
 *
 * Only leading titles. A trailing credential ("Sarah Martinez, DVM") is left
 * alone: no record here has one, and inventing a rule for a case nobody has
 * written is how a comparison acquires behaviour nobody can justify.
 */
const LEADING_TITLE = /^(dr|doctor|prof|professor)\.?\s+/;
const sameName = (a, b) => {
  const norm = (v) => String(v).trim().toLowerCase().replace(/\s+/g, ' ').replace(LEADING_TITLE, '');
  return norm(a) === norm(b);
};

/** The owner's name, which V1 splits into two fields and the column does not. */
const clientNameFromV1 = (blob) =>
  [blob['client::Client First Name'], blob['client::Client Last Name']]
    .map((s) => (s == null ? '' : String(s).trim()))
    .filter(Boolean)
    .join(' ');

/**
 * The column/V1 pairs worth comparing.
 *
 * DELIBERATELY NOT COMPARED, having run this over all 18 production records:
 *
 *   name — the columns carry a "TEST — " prefix the V1 record does not. That
 *     is a deliberate label, not a disagreement.
 *   affected_region — the column holds the joint ("Right stifle", "Lumbosacral
 *     Spine") and V1 holds the limb ("Right hindlimb (RH)", "Spinal /
 *     truncal"). Different granularity, both true; they complement each other
 *     rather than conflict, and flagging all nine of them buried the two that
 *     mattered.
 *   breed — free text, and no production record disagrees.
 *
 * What is left is the set where a difference means one of the two records is
 * WRONG about the animal: six age disagreements, four of them a stored 0
 * against a V1 record of 10 to 14 years, and one weight.
 *
 * THE CONTACT FIELDS were added later, and are about the OWNER rather than the
 * animal — but a practice that rings the wrong number after a post-operative
 * complication reaches nobody, so a difference there is still one record being
 * wrong. Adding them surfaced three defects on a single patient whose columns
 * had never been corrected from seed data: an email of sarah@example.com, a
 * phone of (555) 123-4567, and a client_name holding a VETERINARIAN's name
 * while the V1 record named the actual owner. None of it was visible before,
 * because none of these columns was compared.
 *
 * `species` is deliberately not compared: the column is NOT NULL DEFAULT
 * 'canine' and differs from the V1 record only in capitalisation.
 */
const COMPARABLE = [
  { column: 'age', label: 'Age', dashboardKey: 'client::Age (years)', same: sameNumber },
  { column: 'weight', label: 'Weight (lbs)', dashboardKey: 'client::Weight (lbs)', same: sameNumber },
  { column: 'body_condition_score', label: 'Body condition',
    dashboardKey: 'metrics::BCS (1–9)', same: sameNumber },
  { column: 'sex', label: 'Sex', dashboardKey: 'client::Sex', same: sameSex },
  { column: 'surgery_date', label: 'Surgery date', dashboardKey: 'treatment::Surgery Date' },
  { column: 'client_email', label: 'Client email', dashboardKey: 'client::Email', same: sameEmail },
  { column: 'client_phone', label: 'Client phone', dashboardKey: 'client::Phone', same: samePhone },
  {
    column: 'client_name',
    label: 'Client name',
    keys: ['client::Client First Name', 'client::Client Last Name'],
    v1: clientNameFromV1,
    same: sameName,
  },
];

module.exports = {
  readDashboard,
  disagreements,
  COMPARABLE,
  MAP,
  CONTEXT_KEYS,
  // exported for tests — each is a documented clinical mapping in its own right
  weightBearing,
  incisionStatus,
  deepPain,
  painScore,
  gradeNumber,
};
