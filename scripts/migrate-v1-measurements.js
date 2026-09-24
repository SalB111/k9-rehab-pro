#!/usr/bin/env node
/**
 * MIGRATE THE V1 GONIOMETRY AND GIRTH INTO `visit_measurements`
 *
 *   node scripts/migrate-v1-measurements.js          # dry run, writes nothing
 *   node scripts/migrate-v1-measurements.js --apply  # writes
 *
 * WHY
 * The V1 dashboard records bilateral goniometry and thigh circumference into
 * `patients.dashboard_data`. V2 has a purpose-built home for exactly that —
 * `visit_measurements`, append-only, with correction chains and a trend view
 * that knows which direction is improvement for each measure.
 *
 * The table has 0 rows. The measurements have been sitting in a JSON blob that
 * nothing reads, while the screen built to trend them shows nothing.
 *
 * WHAT IT DOES
 * For each patient holding V1 measurements it creates ONE visit to hang them
 * on — `visit_measurements.visit_id` is NOT NULL, and a measurement without
 * the visit it was taken at is a number with no clinical context — then writes
 * one row per reading.
 *
 * THE DATE IS NOT INVENTED. In order of preference:
 *   1. `assessment::Assessment Date` from the V1 record — the clinician said
 *      when they assessed.
 *   2. `patients.last_visit_date` — when the V1 dashboard was last saved.
 *   3. `patients.created_at` — when the record was made.
 * Which one was used is recorded in the visit notes, so nobody later mistakes
 * a record-creation date for a date of examination.
 *
 * WHAT IT WILL NOT DO
 *   - Guess. A metrics key the map does not recognise is REPORTED and skipped,
 *     never approximated into the nearest measure.
 *   - Run twice. A patient who already has migrated measurements is skipped,
 *     so this is safe to re-run.
 *   - Touch `dashboard_data`. The V1 record is left exactly as it is; this
 *     copies, it does not move.
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB = path.join(__dirname, '..', 'backend', 'k9rehab.db');
const APPLY = process.argv.includes('--apply');

/** The visit that carries migrated readings, so they can always be identified. */
const MIGRATION_TAG = 'Measurements migrated from the V1 clinical record';

/**
 * V1 metrics label -> a `visit_measurements` row.
 *
 * Patterns rather than a fixed list, because the V1 labels are generated per
 * joint and per side and a fixed list would silently drop a joint nobody
 * thought of. Anything that matches no pattern is reported, not guessed.
 */
const PATTERNS = [
  {
    // "Stifle — Flexion (R)", "Hip — Extension (L)". The separator is an em
    // dash in the stored keys; accept the other dashes too rather than depend
    // on which one a future label uses.
    re: /^([A-Za-z]+)\s*[—–-]\s*(Flexion|Extension)\s*\(([RL])\)$/,
    row: (m) => ({
      measure_key: m[2].toLowerCase() === 'flexion' ? 'ROM_FLEXION' : 'ROM_EXTENSION',
      site: m[1].toUpperCase(),
      side: m[3] === 'R' ? 'RIGHT' : 'LEFT',
      unit: 'degrees',
    }),
  },
  {
    // "Right Thigh Circumference (cm)"
    re: /^(Right|Left)\s+([A-Za-z]+)\s+Circumference\s*\(cm\)$/i,
    row: (m) => ({
      measure_key: 'GIRTH',
      site: m[2].toUpperCase(),
      side: m[1].toUpperCase(),
      unit: 'cm',
    }),
  },
];

/** Keys that are real but are not measurements. Recorded so they are not "unmapped". */
const NOT_A_MEASUREMENT = new Set([
  'BCS (1–9)',                 // a patient column, handled by record-sync
  'Goniometry Notes',          // prose — carried into the visit notes below
  'Spinal Alignment',          // qualitative findings with no numeric home
  'Limb Axis Alignment',
  'Muscle Symmetry — Overall',
  'Clinical Notes',
  'Muscle Condition Score',
]);

function parseBlob(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const p = JSON.parse(raw);
    return p && typeof p === 'object' && !Array.isArray(p) ? p : {};
  } catch { return {}; }
}

function classify(label) {
  for (const p of PATTERNS) {
    const m = p.re.exec(label);
    if (m) return p.row(m);
  }
  return null;
}

const db = new DatabaseSync(DB, { readOnly: !APPLY });
const patients = db.prepare('SELECT * FROM patients ORDER BY id').all();

let totalRows = 0;
let totalVisits = 0;
const unmapped = [];
const plan = [];

for (const p of patients) {
  const blob = parseBlob(p.dashboard_data);

  const readings = [];
  let notes = null;
  for (const [key, value] of Object.entries(blob)) {
    if (!key.startsWith('metrics::') && !key.startsWith('helsinki::')) continue;
    const label = key.split('::').slice(1).join('::');
    if (value === '' || value === null || value === undefined) continue;

    if (label === 'Goniometry Notes') { notes = String(value); continue; }
    if (NOT_A_MEASUREMENT.has(label)) continue;

    if (key.startsWith('helsinki::') && /total score/i.test(label)) {
      const n = Number(value);
      // A ZERO ON A SCORED INSTRUMENT IS NOT MIGRATED.
      //
      // The Helsinki Chronic Pain Index runs 0-44, and a stored 0 is
      // indistinguishable from a form field nobody touched. The one in this
      // database belongs to a ten-year-old on gabapentin and carprofen whose
      // own record reads "left limb has mild muscle atrophy" and "mild
      // asymmetry" — a pain index of zero is not what that describes.
      //
      // Migrating it would write a baseline of "no pain" that every future
      // reading is then trended against, which is worse than having no
      // baseline at all. If the score is genuinely zero, entering it through
      // the form is a deliberate act and takes ten seconds.
      if (n === 0) {
        unmapped.push({ patient: p.name, key, value: '0 — not migrated; a zero on a 0-44 scale is indistinguishable from an untouched field' });
        continue;
      }
      if (Number.isFinite(n)) {
        readings.push({ measure_key: 'HCPI', site: null, side: 'NA', unit: 'score', value_numeric: n, from: key });
      }
      continue;
    }

    const shape = classify(label);
    if (!shape) { unmapped.push({ patient: p.name, key, value: String(value).slice(0, 40) }); continue; }

    const n = Number(value);
    if (!Number.isFinite(n)) { unmapped.push({ patient: p.name, key, value: `not numeric: ${value}` }); continue; }
    readings.push({ ...shape, value_numeric: n, from: key });
  }

  if (!readings.length) continue;

  // Already migrated? Re-running must not duplicate a clinical record.
  const already = db.prepare(
    `SELECT COUNT(*) c FROM visit_measurements m
       JOIN visits v ON v.id = m.visit_id
      WHERE m.patient_id = ? AND v.visit_notes LIKE ?`
  ).get(p.id, `%${MIGRATION_TAG}%`).c;
  if (already) {
    plan.push({ patient: p, skipped: `already migrated (${already} rows)` });
    continue;
  }

  // The date, in order of how much it actually tells us.
  const assessed = blob['assessment::Assessment Date'];
  let visitDate; let dateSource;
  if (assessed && /^\d{4}-\d{2}-\d{2}/.test(String(assessed))) {
    visitDate = String(assessed).slice(0, 10);
    dateSource = 'the assessment date recorded in the V1 clinical record';
  } else if (p.last_visit_date) {
    visitDate = String(p.last_visit_date).slice(0, 10);
    dateSource = 'when the V1 dashboard was last saved — no assessment date was recorded';
  } else {
    visitDate = String(p.created_at).slice(0, 10);
    dateSource = 'when the patient record was created — no assessment or save date was recorded';
  }

  plan.push({ patient: p, visitDate, dateSource, readings, notes });
  totalVisits += 1;
  totalRows += readings.length;
}

// ---------------------------------------------------------------------------

console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN — nothing will be written'}\n${'='.repeat(74)}`);

for (const item of plan) {
  if (item.skipped) {
    console.log(`\n  #${item.patient.id} ${item.patient.name}: ${item.skipped}`);
    continue;
  }
  console.log(`\n  #${item.patient.id} ${item.patient.name}`);
  console.log(`      visit ${item.visitDate}  (${item.dateSource})`);
  for (const r of item.readings) {
    console.log(
      `        ${r.measure_key.padEnd(14)}${String(r.site || '—').padEnd(9)}` +
      `${String(r.side || '—').padEnd(9)}${String(r.value_numeric).padStart(6)} ${r.unit}`
    );
  }
  if (item.notes) console.log(`      note: ${item.notes.slice(0, 96)}`);
}

if (unmapped.length) {
  console.log(`\n  NOT MIGRATED — no numeric home, reported rather than guessed at:`);
  for (const u of unmapped) console.log(`      ${u.patient}: ${u.key} = ${u.value}`);
}

console.log(`\n${'='.repeat(74)}`);
console.log(`  ${totalRows} measurements across ${totalVisits} visits`);

if (!APPLY) {
  console.log('\n  Nothing written. Re-run with --apply to write.\n');
  process.exit(0);
}

db.exec('BEGIN');
try {
  for (const item of plan) {
    if (item.skipped) continue;
    const notes = `${MIGRATION_TAG}. Dated from ${item.dateSource}.`
      + (item.notes ? ` Clinician note: ${item.notes}` : '');
    const visit = db.prepare(
      `INSERT INTO visits (patient_id, visit_date, visit_type, status, visit_notes, completed_at)
       VALUES (?, ?, 'REASSESSMENT', 'COMPLETED', ?, CURRENT_TIMESTAMP)`
    ).run(item.patient.id, item.visitDate, notes);
    const visitId = Number(visit.lastInsertRowid);

    const ins = db.prepare(
      `INSERT INTO visit_measurements
         (visit_id, patient_id, measure_key, site, side, value_numeric, unit, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const r of item.readings) {
      ins.run(visitId, item.patient.id, r.measure_key, r.site, r.side, r.value_numeric, r.unit,
        `${item.visitDate} 00:00:00`);
    }
  }
  db.exec('COMMIT');
} catch (e) {
  db.exec('ROLLBACK');
  console.error(`\n  ROLLED BACK — nothing written: ${e.message}\n`);
  process.exit(1);
}

const n = db.prepare('SELECT COUNT(*) c FROM visit_measurements').get().c;
console.log(`\n  written. visit_measurements now holds ${n} rows.\n`);
