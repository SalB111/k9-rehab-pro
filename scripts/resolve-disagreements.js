#!/usr/bin/env node
/**
 * Resolve a patient's V1/V2 disagreements in favour of one record.
 *
 * This OVERWRITES columns that already hold values. That is the whole point —
 * a disagreement is two records contradicting each other, and somebody has to
 * say which is right. `backfill-client-columns` deliberately cannot do this;
 * this script deliberately can, which is why it is separate, why it names the
 * patient explicitly, and why it refuses to run across everybody at once.
 *
 * IT CAN ONLY TOUCH WHAT THE DETECTOR REPORTS.
 *
 * The fields come from `dashboard-bridge.disagreements`, not from a list here.
 * So it cannot wander into a column nobody compared, and a field where the two
 * records agree is never written — there is nothing to resolve.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 *
 *   node scripts/resolve-disagreements.js --patient Bella --source v1
 *   node scripts/resolve-disagreements.js --patient Bella --source v1 --apply
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1];
};
const APPLY = argv.includes('--apply');
const WHO = flag('patient');
const SOURCE = (flag('source') || '').toLowerCase();

if (!WHO || SOURCE !== 'v1') {
  console.error(
    '\n  usage: node scripts/resolve-disagreements.js --patient <id|name> --source v1 [--apply]\n\n'
    + '  --source v1 is the only direction implemented. Resolving the other way\n'
    + '  would mean writing a column value back over the clinical record, and\n'
    + '  nobody has asked for that — so it does not silently exist.\n'
  );
  process.exit(1);
}

const DB_PATH = process.env.K9_DB || path.join(__dirname, '..', 'backend', 'k9rehab.db');
const bridge = require(path.join(__dirname, '..', 'backend', 'v2', 'dashboard-bridge'));

const db = new DatabaseSync(DB_PATH, { readOnly: !APPLY });

const patient = /^\d+$/.test(WHO)
  ? db.prepare('SELECT * FROM patients WHERE id = ?').get(Number(WHO))
  : db.prepare('SELECT * FROM patients WHERE name = ?').get(WHO);

if (!patient) {
  console.error(`\n  No patient matching ${JSON.stringify(WHO)}.\n`);
  process.exit(1);
}

const found = bridge.disagreements(patient, bridge.COMPARABLE);
// `disagreements` reports a human LABEL; the column name lives in COMPARABLE.
const columnFor = new Map(bridge.COMPARABLE.map((f) => [f.label, f.column]));

console.log(`\n  ${APPLY ? 'APPLYING' : 'DRY RUN'} — ${DB_PATH}`);
console.log(`  ${patient.name} (id ${patient.id}) — the V1 clinical record wins\n`);

if (!found.length) {
  console.log('  Nothing disagrees. Nothing to do.\n');
  process.exit(0);
}

const writes = [];
for (const d of found) {
  const column = columnFor.get(d.field);
  if (!column) {
    // Cannot happen with COMPARABLE as the source, and if it ever does the
    // right answer is to stop rather than guess which column was meant.
    console.error(`  REFUSING: no column known for reported field ${JSON.stringify(d.field)}`);
    process.exit(1);
  }
  writes.push([column, d.v1Record]);
  console.log(`      ${column.padEnd(14)} ${JSON.stringify(d.column)}`);
  console.log(`      ${''.padEnd(14)}   -> ${JSON.stringify(d.v1Record)}`);
  console.log('');
}

if (APPLY) {
  const sets = writes.map(([c]) => `${c} = ?`).join(', ');
  db.prepare(`UPDATE patients SET ${sets} WHERE id = ?`).run(...writes.map(([, v]) => v), patient.id);

  const after = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient.id);
  const remaining = bridge.disagreements(after, bridge.COMPARABLE);
  console.log(`  ${writes.length} column${writes.length === 1 ? '' : 's'} written.`);
  console.log(`  ${remaining.length} disagreement${remaining.length === 1 ? '' : 's'} remaining.\n`);
  if (remaining.length) {
    for (const r of remaining) console.log(`      still differs: ${r.field}`);
    console.log('');
  }
} else {
  console.log(`  ${writes.length} column${writes.length === 1 ? '' : 's'} would be overwritten.`);
  console.log('  Nothing written. Re-run with --apply to write.\n');
}
