#!/usr/bin/env node
/**
 * Reconcile the patient COLUMNS with the V1 clinical RECORD where they drifted.
 *
 *   node scripts/reconcile-record-drift.js            # dry run, changes nothing
 *   node scripts/reconcile-record-drift.js --apply    # writes, after a backup
 *
 * WHY THIS EXISTS
 *
 * `scripts/audit.js` section 8 reports one fact recorded in two places saying
 * two things. The engine reads the column; the dashboard shows the record; and
 * the dashboard's column fallback covers `client::` keys only, so neither
 * screen shows the other's value. Charlie's column said "Bilateral Hip
 * Osteoarthritis" while his record said "... spondylosis L7-S1", and the word
 * the column dropped was the one the neurological gate rules look for.
 *
 * WHAT IT PROPOSES, AND WHAT IT DELIBERATELY DOES NOT
 *
 *   `condition`             PROPOSED. In all five cases the record holds the
 *                           fuller clinical statement and the column holds a
 *                           short label. Adopting the record loses nothing and
 *                           recovers laterality, comorbidity and procedure.
 *
 *   `special_instructions`  REPORTED ONLY. For Winston the column is already a
 *                           superset. For Charlie and Luna the two hold
 *                           GENUINELY DIFFERENT orders — the column has the
 *                           bedding, weight-loss and reassessment plan, the
 *                           record has walk durations and surface limits.
 *                           Concatenating two sets of clinical orders is
 *                           authoring a new instruction, not migrating one, so
 *                           this script will not do it.
 *
 *   `affected_region`       REPORTED ONLY where it holds a LIMB. There is no
 *                           anatomical value anywhere in Louie's record to
 *                           migrate from, and deriving "Left Hip" from "FHO"
 *                           would be inferring an anatomical site from a
 *                           procedure name. That is a clinician's entry.
 *
 * THE SAFETY INTERLOCK
 *
 * Every proposed `condition` change is run through the REAL `getProtocolType`
 * before and after. If any change would route a patient to a different
 * protocol, --apply refuses. A wording tidy-up must not silently re-prescribe.
 * Override with --allow-protocol-change, deliberately and never by habit.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const DB_PATH = process.env.K9_DB || path.join(BACKEND, 'k9rehab.db');

const { getProtocolType, diagnosisRecognised } = require(path.join(BACKEND, 'protocol-generator'));

const APPLY = process.argv.includes('--apply');
const ALLOW_ROUTE_CHANGE = process.argv.includes('--allow-protocol-change');

const db = new DatabaseSync(DB_PATH);
const rows = db.prepare('SELECT * FROM patients ORDER BY id').all();

const blobOf = (p) => {
  try { return p.dashboard_data ? JSON.parse(p.dashboard_data) : {}; } catch { return {}; }
};
const norm = (s) => String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
const rule = (c = '-') => console.log('  ' + c.repeat(74));

console.log('');
console.log('  RECONCILE COLUMN vs CLINICAL RECORD' + (APPLY ? '   [APPLY]' : '   [dry run]'));
console.log('  ' + DB_PATH);
rule('=');

// ── 1. condition ───────────────────────────────────────────────────────────
console.log('\n  1. `condition`  — proposed changes\n');

const proposals = [];
for (const p of rows) {
  const recorded = blobOf(p)['assessment::Primary Diagnosis'];
  if (!recorded || !String(recorded).trim()) continue;
  if (norm(p.condition) === norm(recorded)) continue;

  const approach = blobOf(p)['treatment::Approach'] || '';
  const before = getProtocolType(p.condition, p.affected_region, approach);
  const after = getProtocolType(recorded, p.affected_region, approach);
  const recBefore = diagnosisRecognised(p.condition, p.affected_region, approach);
  const recAfter = diagnosisRecognised(recorded, p.affected_region, approach);

  proposals.push({ p, recorded, before, after, recBefore, recAfter });

  console.log(`  ${p.name}`);
  console.log(`      from : ${p.condition}`);
  console.log(`      to   : ${recorded}`);
  console.log(`      protocol  ${before} -> ${after}` + (before === after ? '   (unchanged)' : '   *** CHANGES ***'));
  if (recBefore !== recAfter) {
    console.log(`      routing   ${recBefore ? 'matched' : 'FELL THROUGH'} -> ${recAfter ? 'matched' : 'FELL THROUGH'}`);
  }
  console.log('');
}
if (!proposals.length) console.log('      nothing to change\n');

const routeChanges = proposals.filter((x) => x.before !== x.after);

// ── 2. special_instructions ────────────────────────────────────────────────
console.log('');
rule();
console.log('\n  2. `special_instructions`  — REPORTED ONLY, nothing proposed\n');

let drifted = 0;
for (const p of rows) {
  const recorded = blobOf(p)['treatment::Activity Restrictions'];
  if (!recorded || !p.special_instructions) continue;
  if (norm(p.special_instructions) === norm(recorded)) continue;
  drifted += 1;
  console.log(`  ${p.name}`);
  console.log(`      column : ${p.special_instructions}`);
  console.log(`      record : ${recorded}`);
  console.log('');
}
if (!drifted) console.log('      no drift\n');
else console.log('      These are clinical ORDERS. Where each holds instructions the other\n'
  + '      lacks, folding them together writes a new instruction, so this script\n'
  + '      will not. A clinician decides what the standing orders are.\n');

// ── 3. affected_region vocabulary ──────────────────────────────────────────
console.log('');
rule();
console.log('\n  3. `affected_region`  — REPORTED ONLY, nothing proposed\n');

const dashSrc = fs.readFileSync(
  path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx'), 'utf8');
const limbM = /<F\s[^>]*?label="Affected Limb\(s\)"[^>]*?options=\{\[([\s\S]*?)\]\}/.exec(dashSrc);
const LIMBS = limbM ? (limbM[1].match(/"([^"]*)"/g) || []).map((s) => s.slice(1, -1)) : [];

let wrongVocab = 0;
for (const p of rows) {
  if (!p.affected_region || !LIMBS.includes(p.affected_region)) continue;
  wrongVocab += 1;
  const area = blobOf(p)['treatment::Affected Area'];
  console.log(`  ${p.name}`);
  console.log(`      affected_region holds a LIMB : ${p.affected_region}`);
  console.log(`      treatment::Affected Area     : ${area || '(not recorded)'}`);
  console.log('');
}
if (!wrongVocab) console.log('      no limbs in the region column\n');
else console.log('      `getProtocolType` matches this column against an ANATOMICAL\n'
  + '      vocabulary. With no Affected Area recorded there is nothing to migrate\n'
  + '      from, and deriving a site from a procedure name is a clinician\'s entry.\n');

// ── apply ──────────────────────────────────────────────────────────────────
console.log('');
rule('=');

if (!proposals.length) {
  console.log('\n  Nothing to apply.\n');
  process.exit(0);
}

if (!APPLY) {
  console.log(`\n  DRY RUN — nothing was written. ${proposals.length} change(s) proposed above.`);
  if (routeChanges.length) {
    console.log(`  ${routeChanges.length} of them would CHANGE THE PROTOCOL. --apply will refuse.`);
  }
  console.log('\n  To apply:  node scripts/reconcile-record-drift.js --apply\n');
  process.exit(0);
}

if (routeChanges.length && !ALLOW_ROUTE_CHANGE) {
  console.error('\n  REFUSED. These changes would route a patient to a different protocol:');
  for (const x of routeChanges) console.error(`    ${x.p.name}: ${x.before} -> ${x.after}`);
  console.error('\n  A wording change must not silently re-prescribe. If this is intended,\n'
    + '  re-run with --allow-protocol-change.\n');
  process.exit(1);
}

// 14 chars, not 15: the 15th is the '.' before the milliseconds, which lands
// in the middle of the filename as "...155827.-pre-drift-reconcile".
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const backup = `${DB_PATH}.backup-${stamp}-pre-drift-reconcile`;
fs.copyFileSync(DB_PATH, backup);
console.log(`\n  backup: ${path.basename(backup)}`);

const stmt = db.prepare('UPDATE patients SET condition = ? WHERE id = ?');
let n = 0;
for (const x of proposals) {
  stmt.run(String(x.recorded).trim(), x.p.id);
  n += 1;
  console.log(`  updated ${x.p.name}`);
}
console.log(`\n  ${n} row(s) updated. Re-run \`node scripts/audit.js\` to confirm.\n`);
