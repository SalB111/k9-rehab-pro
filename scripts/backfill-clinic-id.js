#!/usr/bin/env node
/**
 * Give every existing clinical record the clinic it happened in.
 *
 *   node scripts/backfill-clinic-id.js            # dry run, writes nothing
 *   node scripts/backfill-clinic-id.js --apply    # writes, after a backup
 *
 * WHY
 *
 * Sal, 2026-09-26: "WE SHOULD ALSO IDENTIFY WHICH CLINIC WE ARE IN SO IF WE
 * DRIFT WE DONT HAVE TO HUNT LOCATION".
 *
 * Measured the same day: `visits`, `protocols`, `beau_handoffs` and `patients`
 * carried NO clinic column at all. Only `clinic_capabilities` did. Every other
 * answer to "which clinic is this" was computed at READ time by
 * `defaultResolveClinicId` — `req.user.clinic_id` if present, otherwise the
 * FIRST CLINIC BY ID.
 *
 * That is fine with one clinic and wrong with two. Earlier on 2026-09-26 there
 * were several, a script asked about clinic 1 — which has never existed — and
 * got a plausible empty record back, so Sal was told his equipment had not
 * saved. It had. It was on clinic 3.
 *
 * WHY 3 IS NOT A GUESS
 *
 * `users` has no `clinic_id` column, so the resolver has ALWAYS fallen through
 * to "first clinic by id". Clinic 3 is the lowest id that has ever existed in
 * this database — the others were 5, and 6/7/8 created and deleted the same
 * day — so 3 is the clinic every one of these records was created under and
 * read back from. Writing 3 records what was true; it does not decide it.
 *
 * Confirmed by Sal, 2026-09-26: "YES BACKFILL TO 3".
 *
 * The script refuses rather than guesses if that stops being the case: if more
 * than one clinic exists it will not run without --clinic being named
 * explicitly, because at that point "the first one" is a coin toss and a wrong
 * clinic on a clinical record is worse than a null.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const DB_PATH = process.env.K9_DB || path.join(BACKEND, 'k9rehab.db');

const APPLY = process.argv.includes('--apply');
const clinicArg = process.argv.indexOf('--clinic');
const CLINIC_OVERRIDE = clinicArg !== -1 ? Number(process.argv[clinicArg + 1]) : null;

/** Every table that should name its clinic, and why it is in this list. */
const TABLES = [
  ['patients', 'a patient belongs to the practice that admitted them'],
  ['visits', 'an encounter happened somewhere'],
  ['protocols', 'a protocol was generated under a clinic\'s capabilities and defaults'],
  ['beau_handoffs', 'a handoff was issued by a clinic to an owner'],
];

const raw = new DatabaseSync(DB_PATH);
const rule = (c = '-') => console.log('  ' + c.repeat(74));

function hasColumn(table, column) {
  try {
    return raw.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
  } catch {
    return false;
  }
}

(function main() {
  console.log('');
  console.log('  BACKFILL clinic_id' + (APPLY ? '   [APPLY]' : '   [dry run]'));
  console.log('  ' + DB_PATH);
  rule('=');

  const clinics = raw.prepare('SELECT id, clinic_name FROM clinics ORDER BY id').all();
  if (!clinics.length) {
    console.error('\n  No clinic exists. Nothing to attribute these records to.\n');
    process.exit(1);
  }

  console.log('\n  Clinics in this database:');
  for (const c of clinics) console.log(`    ${String(c.id).padStart(3)}  ${c.clinic_name}`);

  let clinicId;
  if (CLINIC_OVERRIDE) {
    if (!clinics.some((c) => c.id === CLINIC_OVERRIDE)) {
      console.error(`\n  Clinic ${CLINIC_OVERRIDE} does not exist.\n`);
      process.exit(1);
    }
    clinicId = CLINIC_OVERRIDE;
  } else if (clinics.length > 1) {
    console.error(
      '\n  MORE THAN ONE CLINIC EXISTS, so "the first one" is no longer the answer'
      + '\n  the app has always given — it is a coin toss. Name the clinic:'
      + '\n\n      node scripts/backfill-clinic-id.js --clinic <id> --apply\n'
    );
    process.exit(1);
  } else {
    clinicId = clinics[0].id;
  }

  const chosen = clinics.find((c) => c.id === clinicId);
  console.log(`\n  Attributing existing records to: ${clinicId} — ${chosen.clinic_name}`);
  rule();

  const plan = [];
  for (const [table, why] of TABLES) {
    if (!hasColumn(table, 'clinic_id')) {
      console.log(`  SKIP   ${table.padEnd(16)} has no clinic_id column yet — start the backend once`);
      continue;
    }
    const total = raw.prepare(`SELECT COUNT(*) n FROM ${table}`).get().n;
    const unset = raw.prepare(`SELECT COUNT(*) n FROM ${table} WHERE clinic_id IS NULL`).get().n;
    const other = raw
      .prepare(`SELECT COUNT(*) n FROM ${table} WHERE clinic_id IS NOT NULL AND clinic_id <> ?`)
      .get(clinicId).n;

    console.log(`  ${table.padEnd(16)} ${String(unset).padStart(4)} of ${String(total).padEnd(4)} unattributed   ${why}`);
    if (other) {
      console.log(`  ${''.padEnd(16)} ${other} row(s) already name a DIFFERENT clinic and are left alone`);
    }
    if (unset) plan.push({ table, unset });
  }

  const rows = plan.reduce((n, p) => n + p.unset, 0);
  rule('=');
  if (!rows) {
    console.log('\n  Nothing to backfill — every record already names its clinic.\n');
    return;
  }

  if (!APPLY) {
    console.log(`\n  ${rows} row(s) would be attributed to clinic ${clinicId}.`);
    console.log('  Dry run — nothing written. Re-run with --apply.\n');
    return;
  }

  // Back up BEFORE the first write. VACUUM INTO rather than a file copy: the
  // backend may hold this database open and a naive copy of an open SQLite
  // file can be torn.
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const backup = path.join(BACKEND, `k9rehab.db.backup-${stamp}-pre-clinic-id`);
  if (fs.existsSync(backup)) fs.unlinkSync(backup);
  raw.prepare(`VACUUM INTO '${backup.replace(/\\/g, '/')}'`).run();
  console.log(`\n  Backup: ${path.basename(backup)}`);

  let written = 0;
  for (const { table } of plan) {
    const r = raw.prepare(`UPDATE ${table} SET clinic_id = ? WHERE clinic_id IS NULL`).run(clinicId);
    console.log(`  ${table.padEnd(16)} ${String(r.changes).padStart(4)} row(s) attributed`);
    written += r.changes;
  }

  rule();
  console.log(`\n  ${written} row(s) now name clinic ${clinicId} — ${chosen.clinic_name}.\n`);
})();
