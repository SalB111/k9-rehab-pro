#!/usr/bin/env node
/**
 * FOLD THE PER-PATIENT EQUIPMENT COPIES INTO THE CLINIC RECORD
 *
 *   node scripts/migrate-clinic-equipment.js          # dry run
 *   node scripts/migrate-clinic-equipment.js --apply  # writes
 *
 * WHY
 * The V1 equipment panel writes through the patient form context, so it lands
 * in `patients.dashboard_data`. Every patient therefore carries a private,
 * partial copy of the CLINIC's equipment list — in this database: 9, 19, 14,
 * 13 and 12 of 43 items answered, five recordings of one practice.
 *
 * They do not contradict each other. Nobody ticked an item another patient
 * unticked; they were simply filled to different depths on different days. So
 * the union is the practice's actual inventory, and folding them together
 * loses nothing.
 *
 * WHERE THE TEN COME FROM
 * V1 where the checklist answered, the existing V2 column where it did not.
 * Neither record is discarded: the checklist is fuller, and the V2 row holds
 * answers the checklist never asked for. A capability nobody has stated stays
 * null — that is "not answered", which the engine treats differently from "we
 * do not have this", and collapsing the two is the bug that started all of it.
 *
 * WHAT IT WILL NOT DO
 *   - Touch `dashboard_data`. The per-patient copies stay exactly where they
 *     are. This copies; the V1 panel is repointed separately.
 *   - Run twice. A clinic whose row already holds a checklist is skipped.
 *   - Guess at an unrecognised key. A renamed label is reported.
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const equipment = require(path.join(__dirname, '..', 'backend', 'v2', 'clinic-equipment'));

const DB = path.join(__dirname, '..', 'backend', 'k9rehab.db');
const APPLY = process.argv.includes('--apply');

const db = new DatabaseSync(DB, { readOnly: !APPLY });

const CAPABILITY_COLUMNS = Object.values(equipment.TO_CAPABILITY);

/** Which clinic a patient's record belongs to. One clinic here; keyed anyway. */
function clinicForPatients(database) {
  const row = database.prepare('SELECT id FROM clinics ORDER BY id LIMIT 1').get();
  return row ? row.id : null;
}

const clinicId = clinicForPatients(db);
if (!clinicId) {
  console.error('  no clinic in the database — nothing to migrate into');
  process.exit(1);
}

const patients = db.prepare('SELECT id, name, dashboard_data FROM patients ORDER BY id').all();

const union = {};
const unknownKeys = [];
const perPatient = [];

for (const p of patients) {
  let blob = {};
  try { blob = JSON.parse(p.dashboard_data || '{}'); } catch { blob = {}; }
  const { checked, unknown } = equipment.readLegacy(blob);
  const answered = Object.values(checked).filter((v) => v !== null).length;
  if (answered) perPatient.push({ name: p.name, answered, ticked: Object.values(checked).filter(Boolean).length });
  for (const u of unknown) unknownKeys.push({ patient: p.name, ...u });

  for (const [item, value] of Object.entries(checked)) {
    if (value === null || value === undefined) continue;
    // Union: any patient's copy saying "we have it" settles it, because nobody
    // contradicts anybody and a blank is silence rather than a denial.
    if (union[item] === true) continue;
    union[item] = value === true ? true : (union[item] === undefined ? false : union[item]);
  }
}

const existing = db.prepare('SELECT * FROM clinic_capabilities WHERE clinic_id = ?').get(clinicId);
const alreadyMigrated = Boolean(existing && existing.equipment_json
  && Object.keys(JSON.parse(existing.equipment_json || '{}')).length);

// The ten: checklist first, then the stored column where the checklist is silent.
const derived = equipment.deriveCapabilities(union);
const finalCaps = {};
const provenance = {};
for (const col of CAPABILITY_COLUMNS) {
  if (derived[col] !== null) { finalCaps[col] = derived[col]; provenance[col] = 'V1 checklist'; continue; }
  const stored = existing ? existing[col] : null;
  if (stored === 1) { finalCaps[col] = true; provenance[col] = 'kept from the V2 profile'; continue; }
  if (stored === 0) { finalCaps[col] = false; provenance[col] = 'kept from the V2 profile'; continue; }
  finalCaps[col] = null; provenance[col] = 'nobody has answered';
}

// A capability settled from the V2 column has to land in the checklist too, or
// the next read projects the old checklist back over it.
const merged = { ...union };
for (const [col, value] of Object.entries(finalCaps)) {
  if (provenance[col] !== 'kept from the V2 profile') continue;
  merged[equipment.FROM_CAPABILITY[col]] = value;
}

// ---------------------------------------------------------------------------

console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN — nothing will be written'}\n${'='.repeat(74)}`);
console.log(`\n  clinic #${clinicId}\n`);
console.log('  the five copies being folded in:');
for (const p of perPatient) {
  console.log(`      ${p.name.padEnd(10)}${String(p.answered).padStart(3)} of 43 answered, ${p.ticked} ticked`);
}

console.log('\n  the ten that gate therapy, after folding:\n');
for (const col of CAPABILITY_COLUMNS) {
  const v = finalCaps[col];
  const s = v === true ? 'available' : v === false ? 'not available' : 'unanswered';
  console.log(`      ${col.padEnd(26)}${s.padEnd(16)}${provenance[col]}`);
}

const held = equipment.INVENTORY_ONLY.filter((i) => merged[i] === true);
console.log(`\n  inventory recorded alongside (gates nothing): ${held.length} items`);
for (const g of equipment.CHECKLIST) {
  const mine = g.items.filter((i) => held.includes(i));
  if (mine.length) console.log(`      ${g.category}: ${mine.join(', ')}`);
}

const unanswered = equipment.ALL_ITEMS.filter((i) => merged[i] === undefined || merged[i] === null);
console.log(`\n  still unanswered after folding: ${unanswered.length} of 43`);

if (unknownKeys.length) {
  console.log('\n  KEYS THE CHECKLIST NO LONGER RECOGNISES — renamed labels, reported not guessed:');
  for (const u of unknownKeys) console.log(`      ${u.patient}: ${u.key}`);
}

if (alreadyMigrated) {
  console.log('\n  This clinic already holds a checklist — nothing to do.\n');
  process.exit(0);
}

console.log(`\n${'='.repeat(74)}`);
if (!APPLY) {
  console.log('\n  Nothing written. Re-run with --apply to write.\n');
  process.exit(0);
}

const values = CAPABILITY_COLUMNS.map((c) => (finalCaps[c] === true ? 1 : finalCaps[c] === false ? 0 : null));
db.exec('BEGIN');
try {
  if (existing) {
    db.prepare(
      `UPDATE clinic_capabilities
          SET ${CAPABILITY_COLUMNS.map((c) => `${c} = ?`).join(', ')},
              equipment_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE clinic_id = ?`
    ).run(...values, JSON.stringify(merged), clinicId);
  } else {
    db.prepare(
      `INSERT INTO clinic_capabilities (clinic_id, ${CAPABILITY_COLUMNS.join(', ')}, equipment_json)
       VALUES (?, ${CAPABILITY_COLUMNS.map(() => '?').join(', ')}, ?)`
    ).run(clinicId, ...values, JSON.stringify(merged));
  }
  db.exec('COMMIT');
} catch (e) {
  db.exec('ROLLBACK');
  console.error(`\n  ROLLED BACK — nothing written: ${e.message}\n`);
  process.exit(1);
}

console.log('\n  written. The clinic now has one equipment record.\n');
