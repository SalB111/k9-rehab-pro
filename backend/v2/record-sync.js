'use strict';

/**
 * ONE PATIENT, ONE SET OF FACTS
 *
 * K9 Rehab Pro has two screens that record the same animal. The V1 dashboard
 * writes a rich clinical record into `patients.dashboard_data`, keyed
 * BLOCK::LABEL. The V2 clinical workflow writes flat columns, which is what the
 * protocol engine reads.
 *
 * Nothing kept them in step, so they drifted: one record said Bella was six
 * years old and 68 lbs while the other said two and 64, with a date of birth
 * that agreed with the two. Another said a ten-year-old Australian Shepherd was
 * aged 0. Both screens were "right" — they were just answering from different
 * places.
 *
 * Both of them save through ONE route, `PUT /api/patients/:id`. So that is
 * where they are reconciled, and this module is the rule it applies.
 *
 * THE DIRECTION RULE
 * ------------------
 * Sync is not symmetrical, and pretending it is would break the V1 screens.
 *
 *   PLAIN FACTS — age, weight, body condition, sex, breed, name, surgery date.
 *   The two records store these in the SAME form: a number is a number, a date
 *   is an ISO date, a name is a name. These are the fields that actually
 *   conflicted, and they sync BOTH WAYS. Correct an age in either screen and
 *   the other agrees.
 *
 *   CLINICAL VOCABULARY — weight-bearing status, incision status, affected
 *   limb. The two records store these in DIFFERENT vocabularies, on purpose.
 *   The V1 control offers "Partial weight bearing (PWB)"; the engine wants the
 *   key "PWB". The column holds the joint ("Right stifle") and V1 holds the
 *   limb ("Right hindlimb (RH)"), which are different facts at different
 *   granularity, both true.
 *
 *   These sync ONE WAY, V1 into the columns, through the bridge's normalisers.
 *   Writing a column value back into the blob would put a string that is not
 *   one of the control's options into a V1 dropdown — and a select whose value
 *   matches no option renders BLANK. That is not theoretical: it is exactly
 *   what four spellings of "Female — Spayed" did to every patient's sex field
 *   until 22 Sep 2026.
 *
 * WHAT THIS MODULE NEVER DOES
 * It does not resolve a disagreement between two values that are both filled
 * in. It fills gaps and it propagates the edit in front of it. Deciding that a
 * dog is two rather than six is a clinical judgement, and it belongs to the
 * person who can look at the animal.
 */

const bridge = require('./dashboard-bridge');

/**
 * Plain facts: same meaning, same form, both directions.
 *
 * `column` is the patients table; `key` is the BLOCK::LABEL in the blob;
 * `out` renders a column value into the form the V1 screen stores.
 */
const TWO_WAY = [
  { column: 'age', key: 'client::Age (years)', numeric: true, out: (v) => String(v) },
  { column: 'weight', key: 'client::Weight (lbs)', numeric: true, out: (v) => String(v) },
  { column: 'body_condition_score', key: 'metrics::BCS (1–9)', numeric: true, out: (v) => String(v) },
  { column: 'breed', key: 'client::Breed', out: (v) => String(v) },
  { column: 'name', key: 'client::Patient Name', out: (v) => String(v) },
  { column: 'surgery_date', key: 'treatment::Surgery Date', out: (v) => String(v) },
  // Contact details. Plain facts by the same test as the rest: one spelling,
  // one meaning, and a column that is simply empty on a patient whose V1
  // record has the answer. One patient's referring surgeon was recorded in V1
  // and nowhere else, so nothing downstream could reach the person who
  // operated on the dog.
  //
  // This only ever FILLS AN EMPTY COLUMN — it does not correct a column that
  // already holds something, including a placeholder. A column holding
  // sarah@example.com against a V1 record holding a real address is a
  // disagreement, and disagreements are reported by dashboard-bridge for a
  // person to resolve, never overwritten here.
  { column: 'client_email', key: 'client::Email', out: (v) => String(v) },
  { column: 'client_phone', key: 'client::Phone', out: (v) => String(v) },
  { column: 'referring_vet', key: 'client::Referred By', out: (v) => String(v) },
  // The date of birth, which unlike the age it implies does not go stale.
  { column: 'date_of_birth', key: 'client::Date of Birth', out: (v) => String(v) },
];

/**
 * Weight in kilograms is stored alongside the pounds in the V1 record, and the
 * two must not disagree either. Pounds are canonical everywhere; see
 * k9-rehab-frontend/src/constants/weight.js.
 */
const LB_PER_KG = 2.20462;
const KG_KEY = 'client::Weight (kg)';

/** Present and meaningful. Zero is not an age or a weight. */
function real(value, numeric) {
  if (value === null || value === undefined) return false;
  if (String(value).trim() === '') return false;
  if (numeric && Number(value) === 0) return false;
  return true;
}

function parseBlob(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Reconcile one write.
 *
 * @param {Object} existing  the patient row as it stands, dashboard_data included
 * @param {Object} updates   the columns this request is setting (undefined = untouched)
 * @param {*} incomingBlob   `dashboard_data` from the request, if the V1 screen sent one
 *
 * @returns {{
 *   columns: Object,        extra column updates to apply
 *   dashboardData: Object|null,  the blob to store, or null to leave it alone
 *   notes: string[]         what was reconciled and why, for the response
 * }}
 */
function reconcile({ existing = {}, updates = {}, incomingBlob } = {}) {
  const blobIsBeingWritten = incomingBlob !== undefined;
  const blob = parseBlob(blobIsBeingWritten ? incomingBlob : existing.dashboard_data);
  const columns = {};
  const blobPatch = {};
  const notes = [];

  // ── V1 -> columns ────────────────────────────────────────────────────────
  // Whatever the blob says, the columns should say too — for any column this
  // request is not itself setting. The request always wins over the blob: it
  // is the edit somebody just made.
  for (const f of TWO_WAY) {
    if (updates[f.column] !== undefined) continue;          // this write owns it
    if (real(existing[f.column], f.numeric)) continue;      // already answered
    const v = blob[f.key];
    if (!real(v, f.numeric)) continue;
    columns[f.column] = f.numeric ? Number(v) : String(v);
    notes.push(`${f.column} filled from the clinical record`);
  }

  // Clinical vocabulary, one way only, and only into empty columns. The
  // bridge's normalisers turn the V1 wording into what the engine matches.
  const mapped = bridge.readDashboard({ dashboard_data: blob });
  const ONE_WAY = [
    ['condition', 'diagnosis'],
    ['affected_region', 'affectedRegion'],
    ['medical_history', 'medicalHistory'],
    ['current_medications', 'currentMedications'],
    ['special_instructions', 'specialInstructions'],
    ['pain_level', 'painScore', true],
    ['lameness_grade', 'lamenessGrade', true],
    ['mobility_level', 'mobilityLevel'],
  ];
  for (const [column, engineKey, numeric] of ONE_WAY) {
    if (updates[column] !== undefined) continue;
    if (real(existing[column], numeric)) continue;
    const v = mapped.values[engineKey];
    if (v === undefined || v === null) continue;
    columns[column] = v;
    notes.push(`${column} filled from the clinical record`);
  }

  // ── columns -> V1 ────────────────────────────────────────────────────────
  // The other direction, plain facts only. Without this, correcting an age in
  // the V2 workflow leaves the V1 dashboard still showing the old one, and the
  // next V1 save pushes the stale value straight back.
  //
  // Only into a record that EXISTS. A patient registered through the V2
  // workflow has no V1 record, and manufacturing one from a column write would
  // conjure a clinical record nobody created — a half-filled dashboard that
  // reports itself as present. The V1 screen creates its own record the first
  // time somebody actually uses it.
  const hasV1Record = blobIsBeingWritten || Object.keys(blob).length > 0;
  for (const f of hasV1Record ? TWO_WAY : []) {
    const incoming = updates[f.column];
    if (incoming === undefined || !real(incoming, f.numeric)) continue;
    const rendered = f.out(incoming);
    if (String(blob[f.key] ?? '') === rendered) continue;
    blobPatch[f.key] = rendered;
    notes.push(`clinical record ${f.column} updated to match`);
  }

  // Keep the V1 record's kilogram field honest when pounds change. It is a
  // second rendering of one fact, and two renderings that disagree is the
  // whole problem this module exists for.
  if (blobPatch['client::Weight (lbs)'] !== undefined) {
    const lbs = Number(blobPatch['client::Weight (lbs)']);
    if (Number.isFinite(lbs) && lbs > 0) {
      blobPatch[KG_KEY] = String(Math.round((lbs / LB_PER_KG) * 10) / 10);
    }
  }

  const dashboardData = blobIsBeingWritten || Object.keys(blobPatch).length
    ? { ...blob, ...blobPatch }
    : null;

  return { columns, dashboardData, notes };
}

module.exports = { reconcile, TWO_WAY, LB_PER_KG, KG_KEY };
