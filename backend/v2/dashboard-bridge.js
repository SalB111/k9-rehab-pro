'use strict';

/**
 * THE V1 -> V2 BRIDGE
 *
 * K9 Rehab Pro keeps two records of the same patient and the engine reads the
 * emptier one.
 *
 *   V1 `DashboardView.jsx` writes a complete clinical record into
 *   `patients.dashboard_data` — a JSON blob keyed by BLOCK::LABEL. All 18
 *   patients in production carry one; 187 distinct fields are filled across
 *   the set. Diagnosis, weight-bearing status, incision status, deep pain
 *   perception, goniometry, thigh circumference, surgical history, surgeon,
 *   surgery date.
 *
 *   The V2 clinical workflow and the protocol engine read flat columns on
 *   `patients` plus `visit_assessments`. Nothing anywhere reads
 *   `dashboard_data` — I grepped `backend/v2/` and the V1 prompt builders:
 *   `data["home::` and `data["equipment::` appear ZERO times, and the backend
 *   has no reference to the column at all.
 *
 * So a clinician fills in a sourced, checked clinical record, and the protocol
 * is generated from whatever happens to be in the columns — which for the only
 * real post-operative patient meant a null surgery date and a null history.
 *
 * WHAT THIS MODULE DOES
 * Reads that blob and maps it onto engine inputs. It is a READER: it never
 * writes, never decides, and never satisfies a safety gate. Everything it
 * produces arrives at the intake proposal as a PROPOSAL carrying its
 * provenance, and every safety gate still has to be confirmed by a person.
 *
 * THREE RULES, each learned from this data rather than assumed:
 *
 *   1. MAP FROM THE OPTION LIST, NOT FROM THE STORED VALUES.
 *      No patient currently has "Absent — bilateral" deep pain. The V1 control
 *      offers it. A map fitted to what is stored today would silently fail to
 *      lock a Grade V patient the first time one is entered.
 *
 *   2. KEYS ARE LABELS, SO KEYS ROT.
 *      `key = blockId::label`. Renaming a field in the dashboard orphans every
 *      value stored under the old name — visible right now as
 *      "Neurological Grade (Frankel Modified)" (10 patients) and
 *      "Neurological Grade (Frankel / ASIA Modified)" (2). Every field below
 *      therefore lists every key it has ever been stored under.
 *
 *   3. UNRECOGNISED IS REPORTED, NEVER GUESSED.
 *      A value the map does not know comes back in `unmapped` with its key and
 *      value. It does not become a default, and it does not disappear.
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

/** A trimmed non-empty string, or null. */
function text(value) {
  const t = String(value === null || value === undefined ? '' : value).trim();
  return t ? t : null;
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
 */
const MAP = [
  // ── Identity and longitudinal record ──────────────────────────────────────
  { keys: ['assessment::Primary Diagnosis', 'treatment::Primary Diagnosis'],
    to: 'diagnosis', via: text },
  { keys: ['treatment::Affected Limb(s)', 'treatment::Affected Area'],
    to: 'affectedRegion', via: text },
  { keys: ['treatment::Approach'], to: 'treatmentApproach', via: text },
  { keys: ['treatment::Surgery Date', 'assessment::Date of Diagnosis / Surgery'],
    to: 'surgeryDate', via: text },
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
  { keys: ['treatment::Weight Bearing Status', 'assessment::Weight Bearing Status',
           'assessment::Current Mobility Level'],
    to: 'weightBearingStatus', via: weightBearing, gate: true },
  { keys: ['treatment::Incision Status'], to: 'incisionStatus', via: incisionStatus, gate: true },
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
    const hit = firstFilled(blob, entry.keys);
    if (!hit) continue;
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
 * @param {Array} fields     [{ column, label, dashboardKey }]
 */
function disagreements(patient, fields) {
  const blob = parse(patient);
  const out = [];
  for (const f of fields) {
    const stored = patient ? patient[f.column] : undefined;
    const v1 = blob[f.dashboardKey];
    if (stored === undefined || stored === null || String(stored).trim() === '') continue;
    if (v1 === undefined || v1 === null || String(v1).trim() === '') continue;
    // Compare what the two values MEAN, not how they are spelled. Without
    // this, "Female - Spayed" against "Female — Spayed" is a conflict, and a
    // report that is mostly punctuation is a report nobody reads.
    const same = f.same || ((a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase());
    if (same(stored, v1)) continue;
    out.push({ field: f.label, column: String(stored), v1Record: String(v1), key: f.dashboardKey });
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
 */
const COMPARABLE = [
  { column: 'age', label: 'Age', dashboardKey: 'client::Age (years)', same: sameNumber },
  { column: 'weight', label: 'Weight (lbs)', dashboardKey: 'client::Weight (lbs)', same: sameNumber },
  { column: 'body_condition_score', label: 'Body condition',
    dashboardKey: 'metrics::BCS (1–9)', same: sameNumber },
  { column: 'sex', label: 'Sex', dashboardKey: 'client::Sex', same: sameSex },
  { column: 'surgery_date', label: 'Surgery date', dashboardKey: 'treatment::Surgery Date' },
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
