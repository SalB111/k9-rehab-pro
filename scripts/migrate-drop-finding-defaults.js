#!/usr/bin/env node
/**
 * DROP THE FABRICATING DEFAULTS FROM THE LIVE `patients` TABLE.
 *
 * ── NOT RUN AUTOMATICALLY. QUEUED FOR SAL. ────────────────────────────────
 *
 * Written 2026-09-26 during an unattended session and deliberately left
 * unrun. The reason is in the numbers: **19 foreign keys point INTO
 * `patients`**, and SQLite cannot ALTER a column default — the only way is to
 * rebuild the table and rename it into place. Getting that wrong with 19
 * inbound references, with nobody watching, is not a trade worth making for
 * a defect that no live code path currently triggers.
 *
 * WHAT IS WRONG
 *
 *   lameness_grade       DEFAULT 0
 *   body_condition_score DEFAULT 5
 *   pain_level           DEFAULT 5
 *   mobility_level       DEFAULT 'Moderate'
 *
 * Each is a real clinical finding. Any INSERT that omits the column gets one
 * invented. Commit 3516874 removed the same four from the INSERT in
 * server.js; this is the same fabrication one layer down, in the schema.
 *
 * WHY IT IS NOT URGENT
 *
 * Every insert path today names all four explicitly — server.js,
 * seed-demo-patients.js, and `backend/.js` is marked DEPRECATED and unused.
 * So nothing is being fabricated right now. The exposure is a FUTURE insert
 * path that omits them, which is exactly how scripts/drive-flow.js found it.
 * The DDL in sqlite-provider.js is already fixed, so fresh installs are clean.
 *
 * HOW TO RUN IT
 *
 *   1. Stop the backend. An open connection during a table swap is the one
 *      way this goes badly.
 *   2. node scripts/migrate-drop-finding-defaults.js --dry-run
 *   3. node scripts/migrate-drop-finding-defaults.js --commit
 *   4. npm run verify && node scripts/audit.js && node scripts/drive-flow.js
 *   5. Flip the [KNOWN] test in backend/v2/no-fabricated-findings.test.js to
 *      assert there are no defaults left.
 *
 * It backs up first, runs inside a transaction with foreign keys OFF (as
 * SQLite's own documented 12-step procedure requires), verifies every row is
 * byte-identical afterwards, and runs `PRAGMA foreign_key_check` before
 * committing. Any mismatch rolls the whole thing back.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DB = path.join(__dirname, '..', 'backend', 'k9rehab.db');
const COMMIT = process.argv.includes('--commit');
const FINDINGS = ['lameness_grade', 'body_condition_score', 'pain_level', 'mobility_level'];

if (!COMMIT) {
  console.log('\n  DRY RUN — nothing will be written. Pass --commit to apply.\n');
}

const raw = new DatabaseSync(DB);

// ── what is there now ──────────────────────────────────────────────────────
const cols = raw.prepare('PRAGMA table_info(patients)').all();
const offending = cols.filter((c) => FINDINGS.includes(c.name) && c.dflt_value !== null);
if (!offending.length) {
  console.log('  The live table has no fabricating defaults. Nothing to do.\n');
  raw.close();
  process.exit(0);
}
console.log('  defaults to remove:');
for (const c of offending) console.log(`    ${c.name} DEFAULT ${c.dflt_value}`);

const rowCount = raw.prepare('SELECT COUNT(*) c FROM patients').get().c;
console.log(`  rows to carry over: ${rowCount}`);

/** A stable fingerprint of every row, to compare before and after. */
function fingerprint(db) {
  const rows = db.prepare('SELECT * FROM patients ORDER BY id').all()
    .map((r) => JSON.stringify(r));
  return { hash: crypto.createHash('sha256').update(rows.join('\n')).digest('hex'), n: rows.length };
}
const before = fingerprint(raw);
console.log(`  fingerprint before: ${before.hash.slice(0, 16)} (${before.n} rows)`);

if (!COMMIT) {
  console.log('\n  Dry run complete. Re-run with --commit, and stop the backend first.\n');
  raw.close();
  process.exit(0);
}

// ── back up ────────────────────────────────────────────────────────────────
const now = new Date();
const p2 = (n) => String(n).padStart(2, '0');
const stamp = `${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}`
            + `-${p2(now.getHours())}${p2(now.getMinutes())}${p2(now.getSeconds())}`;
const backup = `${DB}.backup-${stamp}-pre-drop-defaults`;
raw.exec(`VACUUM INTO '${backup.replace(/'/g, "''")}'`);
console.log(`\n  backup: ${backup}`);

// ── the 12-step rebuild ────────────────────────────────────────────────────
// https://www.sqlite.org/lang_altertable.html#otheralter
const createSql = raw.prepare(
  "SELECT sql FROM sqlite_master WHERE type='table' AND name='patients'"
).get().sql;

// Strip the DEFAULT clause from exactly the four columns, touching nothing
// else in the statement.
let newSql = createSql;
for (const c of FINDINGS) {
  newSql = newSql.replace(
    new RegExp(`(\\b${c}\\b\\s+\\w+)\\s+DEFAULT\\s+('[^']*'|[^,\\s)]+)`, 'i'),
    (_m, keep) => keep
  );
}
newSql = newSql.replace(/CREATE TABLE\s+"?patients"?/i, 'CREATE TABLE patients_new');

if (newSql === createSql.replace(/CREATE TABLE\s+"?patients"?/i, 'CREATE TABLE patients_new')) {
  console.error('\n  the DEFAULT clauses were not matched — refusing to proceed\n');
  raw.close();
  process.exit(1);
}

const columnNames = cols.map((c) => `"${c.name}"`).join(', ');

raw.exec('PRAGMA foreign_keys=OFF');
raw.exec('BEGIN');
try {
  raw.exec(newSql);
  raw.exec(`INSERT INTO patients_new (${columnNames}) SELECT ${columnNames} FROM patients`);
  raw.exec('DROP TABLE patients');
  raw.exec('ALTER TABLE patients_new RENAME TO patients');

  const after = fingerprint(raw);
  if (after.hash !== before.hash || after.n !== before.n) {
    throw new Error(`row data changed: ${before.hash.slice(0, 16)}/${before.n} -> `
      + `${after.hash.slice(0, 16)}/${after.n}`);
  }
  const fkBroken = raw.prepare('PRAGMA foreign_key_check').all();
  if (fkBroken.length) {
    throw new Error(`${fkBroken.length} foreign key violation(s) after the swap`);
  }
  raw.exec('COMMIT');
  console.log('  committed — every row byte-identical, no FK violations');
} catch (err) {
  raw.exec('ROLLBACK');
  console.error(`\n  ROLLED BACK: ${err.message}`);
  console.error(`  the database is untouched; the backup at ${backup} is also intact\n`);
  raw.exec('PRAGMA foreign_keys=ON');
  raw.close();
  process.exit(1);
}
raw.exec('PRAGMA foreign_keys=ON');

// ── verify ─────────────────────────────────────────────────────────────────
const left = raw.prepare('PRAGMA table_info(patients)').all()
  .filter((c) => FINDINGS.includes(c.name) && c.dflt_value !== null);
console.log(`  defaults remaining: ${left.length ? left.map((c) => c.name).join(', ') : 'none'}`);
console.log(`  integrity_check: ${Object.values(raw.prepare('PRAGMA integrity_check').get())[0]}`);
raw.close();

console.log('\n  Now run: npm run verify && node scripts/audit.js && node scripts/drive-flow.js');
console.log('  Then flip the [KNOWN] test in backend/v2/no-fabricated-findings.test.js.\n');
