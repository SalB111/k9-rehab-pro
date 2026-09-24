/**
 * K9 Clinical Workflow V2 — Diagnostics
 *
 * Imaging and laboratory work: what was done, and what it showed.
 *
 * Nothing reads this today. Not the engine — its only two mentions of the word
 * "radiograph" are a line of progression-criteria prose and THERAPEUTIC
 * ultrasound, which is a treatment modality and not a diagnostic one. Not V2,
 * which has no table and no column. Not the handoff. So a recorded pelvic
 * fracture reaches no surface a clinician opens.
 *
 * TWO FORMATS, AND THE OLDER ONE IS SEED DATA.
 *
 *   current — `Imaging Radiograph (X-Ray)` = "performed", `Lab CBC` = "true",
 *     `Lab Date`, `Clinical Notes`. This is what the dashboard writes today,
 *     one key per item, and it is the shape every REAL entry is in.
 *
 *   legacy — `Imaging` = "Radiograph (X-Ray)||CT Scan", `Laboratory Work` =
 *     "CBC||Chemistry Panel", plus `Radiograph Findings` / `MRI Findings` /
 *     `Lab Results Notes`. The current dashboard cannot read or edit these
 *     keys, and every substantive value in this shape is verbatim from
 *     backend/seed-demo-patients.js.
 *
 * Both are read anyway. The legacy shape costs about twenty lines, and a
 * demonstration record that silently shows no imaging is worse than one that
 * shows what it was seeded with — a blank diagnostics panel reads as "nothing
 * was done", which is a clinical statement nobody made.
 *
 * NOTHING HERE GATES EXERCISE SELECTION. The engine takes no diagnostic input.
 * This is documentation, surfaced for the clinician who opens the patient.
 */

'use strict';

/**
 * The modalities and panels the dashboard offers.
 *
 * Declared here and CHECKED against the real JSX by the tests, rather than
 * imported: they live inside a component function and cannot be required. If
 * the dashboard gains a modality this list does not have, the test fails
 * rather than the modality quietly never being read.
 */
const IMAGING_MODALITIES = [
  'Radiograph (X-Ray)', 'CT Scan', 'MRI', 'Ultrasound',
  'Myelogram', 'Nuclear Scintigraphy', 'Fluoroscopy', 'Echocardiogram',
];

const LAB_PANELS = ['CBC', 'Chemistry Panel', 'Urinalysis', 'Thyroid Panel', 'Urinary Culture'];

const MULTI_DELIMITER = '||';
const PREFIX = 'diagnostics::';

function blank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function splitMulti(value) {
  return String(value).split(MULTI_DELIMITER).map((s) => s.trim()).filter((s) => s !== '');
}

/** V1 stores a ticked checkbox as the string "true", not a boolean. */
function ticked(value) {
  if (blank(value)) return false;
  const t = String(value).trim().toLowerCase();
  return t === 'true' || t === 'yes' || t === '1' || t === 'performed' || t === 'done';
}

function parse(dashboardData) {
  let data = dashboardData;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = {}; }
  }
  if (!data || typeof data !== 'object') data = {};
  return data;
}

/**
 * The findings key for a modality, in the legacy shape.
 *
 * "Radiograph (X-Ray)" is recorded under "Radiograph Findings", so the
 * parenthetical is dropped and both spellings are tried.
 *
 * Matching the FIRST WORD was tried and removed. It made the parenthetical
 * rule dead code — "Radiograph (X-Ray)" is the only modality with a bracket
 * and is one word before it, so the two rules produced the same key for every
 * modality the dashboard offers — and it is the loose matching this codebase
 * keeps being bitten by: it would claim "Nuclear Findings" for "Nuclear
 * Scintigraphy", which is a different study.
 *
 * A findings field matching neither spelling is reported by
 * `unmatchedFindings` rather than silently discarded.
 */
function findingsKeysFor(modality) {
  const base = String(modality).replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  return [...new Set([`${modality} Findings`, `${base} Findings`])];
}

/**
 * Read a patient's diagnostics, in whichever shape they were recorded.
 *
 * Returns modalities that were actually performed, the panels that were run,
 * and every note — plus `format`, so a caller can tell a current record from a
 * legacy one rather than wondering why a field is missing.
 */
function read(dashboardData) {
  const data = parse(dashboardData);
  const get = (suffix) => data[PREFIX + suffix];

  const imaging = [];
  const labs = [];
  const notes = {};
  const usedFindingsKeys = new Set();
  let sawCurrent = false;
  let sawLegacy = false;

  // ── current shape: one key per item ──────────────────────────────────────
  for (const modality of IMAGING_MODALITIES) {
    const value = get(`Imaging ${modality}`);
    if (blank(value)) continue;
    sawCurrent = true;
    if (!ticked(value)) continue;
    imaging.push({ modality, status: String(value).trim(), findings: null });
  }

  for (const panel of LAB_PANELS) {
    const value = get(`Lab ${panel}`);
    if (blank(value)) continue;
    sawCurrent = true;
    if (ticked(value)) labs.push(panel);
  }
  if (!blank(get('Lab Performed'))) sawCurrent = true;

  // ── legacy shape: one delimited key for all of them ──────────────────────
  if (!blank(get('Imaging'))) {
    sawLegacy = true;
    for (const modality of splitMulti(get('Imaging'))) {
      if (imaging.some((i) => i.modality === modality)) continue;
      let findings = null;
      for (const key of findingsKeysFor(modality)) {
        if (!blank(get(key))) { findings = String(get(key)).trim(); usedFindingsKeys.add(key); break; }
      }
      imaging.push({ modality, status: 'performed', findings });
    }
  }
  if (!blank(get('Laboratory Work'))) {
    sawLegacy = true;
    for (const panel of splitMulti(get('Laboratory Work'))) {
      if (!labs.includes(panel)) labs.push(panel);
    }
  }

  // Findings attach to the modality above where one matched. Any left over is
  // a finding recorded for imaging nobody ticked — reported, never dropped,
  // because a radiologist's report with no study attached is still a finding.
  const unmatchedFindings = [];
  for (const key of Object.keys(data)) {
    if (!key.startsWith(PREFIX)) continue;
    const suffix = key.slice(PREFIX.length);
    if (!/ Findings$/.test(suffix)) continue;
    if (usedFindingsKeys.has(suffix)) continue;
    if (blank(data[key])) continue;
    unmatchedFindings.push({ field: suffix, stated: String(data[key]).trim() });
  }

  for (const [label, suffix] of [
    ['lab_results', 'Lab Results Notes'],
    ['lab_date', 'Lab Date'],
    ['lab_report_filename', 'Lab Report Filename'],
    ['clinical', 'Clinical Notes'],
    ['other_imaging', 'Other Imaging / Notes'],
  ]) {
    if (!blank(get(suffix))) notes[label] = String(get(suffix)).trim();
  }

  const anything = imaging.length || labs.length || Object.keys(notes).length
    || unmatchedFindings.length;
  if (!anything) return null;

  return {
    imaging,
    labs,
    notes,
    unmatchedFindings,
    // Which shape the record is in. `both` means a record was part-migrated,
    // which is worth seeing rather than silently merging away.
    format: sawCurrent && sawLegacy ? 'both' : sawLegacy ? 'legacy' : 'current',
  };
}

module.exports = {
  IMAGING_MODALITIES,
  LAB_PANELS,
  MULTI_DELIMITER,
  read,
  ticked,
  splitMulti,
  findingsKeysFor,
};
