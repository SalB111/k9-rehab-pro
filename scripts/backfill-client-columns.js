#!/usr/bin/env node
/**
 * Fill empty patient columns from the V1 clinical record.
 *
 * `record-sync.reconcile` already does exactly this on every patient save —
 * this script runs it now, for records nobody happens to be about to edit. A
 * date of birth sitting only in `dashboard_data` is a column that stays empty
 * indefinitely, and an empty column is not a fact anything can use.
 *
 * WHAT IT WILL NOT DO
 *
 * It only ever fills a column that is EMPTY. It never overwrites a column that
 * already holds something, including a placeholder: a column reading
 * sarah@example.com against a V1 record holding a real address is a
 * DISAGREEMENT, and disagreements are for a person to resolve, not for a
 * script to pick a winner. Run `report-disagreements` to see those.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 *
 *   node scripts/backfill-client-columns.js
 *   node scripts/backfill-client-columns.js --apply
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const APPLY = process.argv.includes('--apply');
const DB_PATH = process.env.K9_DB
  || path.join(__dirname, '..', 'backend', 'k9rehab.db');

const recordSync = require(path.join(__dirname, '..', 'backend', 'v2', 'record-sync'));

const db = new DatabaseSync(DB_PATH, { readOnly: !APPLY });
const patients = db.prepare('SELECT * FROM patients ORDER BY id').all();

console.log(`\n  ${APPLY ? 'APPLYING' : 'DRY RUN'} — ${DB_PATH}`);
console.log(`  ${patients.length} patients\n`);

let touched = 0;
let fills = 0;

for (const patient of patients) {
  // No `incomingBlob`: this is not a write of the V1 form, so reconcile should
  // read the blob already on the record. Passing null would tell it the blob
  // is being CLEARED and it would find nothing to fill.
  const { columns } = recordSync.reconcile({ existing: patient, updates: {} });
  const entries = Object.entries(columns || {});
  if (!entries.length) continue;

  touched += 1;
  console.log(`  ${patient.name} (id ${patient.id})`);
  for (const [column, value] of entries) {
    fills += 1;
    const shown = String(value).replace(/\s+/g, ' ').slice(0, 56);
    console.log(`      ${column.padEnd(22)} <- ${JSON.stringify(shown)}`);
  }

  if (APPLY) {
    const sets = entries.map(([c]) => `${c} = ?`).join(', ');
    db.prepare(`UPDATE patients SET ${sets} WHERE id = ?`)
      .run(...entries.map(([, v]) => v), patient.id);
  }
  console.log('');
}

console.log(`  ${fills} column${fills === 1 ? '' : 's'} across ${touched} patient${touched === 1 ? '' : 's'}`);
if (!APPLY) {
  console.log('  Nothing written. Re-run with --apply to write.\n');
} else {
  console.log('  Written.\n');
}
