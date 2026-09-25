#!/usr/bin/env node
/**
 * Watch a clinical run as it happens. READ ONLY.
 *
 *   node scripts/watch-run.js            # snapshot the workflow state
 *   node scripts/watch-run.js --diff     # compare against the last snapshot
 *
 * Built 2026-09-25 so a clinician can drive the app while somebody watches
 * what each step actually writes. It reads; it never fixes anything itself.
 *
 * The snapshot is kept in the scratch directory, not in the repo — it is a
 * position in a run, not a fact about the code.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = process.env.K9_DB || path.join(ROOT, 'backend', 'k9rehab.db');
const SNAP = path.join(os.tmpdir(), 'k9-watch-run.json');

const DIFF = process.argv.includes('--diff');
const db = new DatabaseSync(DB_PATH, { readOnly: true });

const q = (sql, params = []) => { try { return db.prepare(sql).all(...params); } catch { return null; } };
const count = (t, where = '') => { const r = q(`SELECT COUNT(*) c FROM ${t} ${where}`); return r ? r[0].c : null; };

/** Tables a run touches, in the order the workflow touches them. */
const TABLES = [
  'patients', 'visits', 'visit_assessments', 'visit_measurements',
  'protocols', 'protocol_versions', 'protocol_version_exercises',
  'protocol_version_restrictions', 'protocol_approvals', 'protocol_audit_events',
  'visit_protocol_versions', 'beau_handoffs',
  'home_access', 'home_sessions', 'home_exercise_logs', 'home_observations',
  'patient_procedures', 'patient_treatment_status',
  'patient_goals', 'patient_goal_items', 'patient_home_environment',
  'patient_diagnostic_studies', 'safety_events',
];

function snapshot() {
  const s = { at: new Date().toISOString(), counts: {}, detail: {} };
  for (const t of TABLES) s.counts[t] = count(t);

  s.detail.versions = q(
    `SELECT pv.id, pv.status, p.patient_id, pt.name
       FROM protocol_versions pv
       JOIN protocols p ON p.id = pv.protocol_id
       LEFT JOIN patients pt ON pt.id = p.patient_id
      ORDER BY pv.id DESC LIMIT 8`
  ) || [];
  s.detail.visits = q(
    `SELECT v.id, v.patient_id, pt.name, v.visit_date, v.status
       FROM visits v LEFT JOIN patients pt ON pt.id = v.patient_id
      ORDER BY v.id DESC LIMIT 8`
  ) || [];
  s.detail.treatmentStatus = q(
    `SELECT s.id, s.patient_id, pt.name, s.effective_date, s.weight_bearing_status,
            s.e_collar_required, s.strict_crate_rest, s.effective_date_is_unknown
       FROM patient_treatment_status s LEFT JOIN patients pt ON pt.id = s.patient_id
      ORDER BY s.id DESC LIMIT 8`
  ) || [];
  return s;
}

const now = snapshot();

if (!DIFF || !fs.existsSync(SNAP)) {
  fs.writeFileSync(SNAP, JSON.stringify(now, null, 1));
  console.log('\n  BASELINE TAKEN  ' + now.at);
  console.log('  ' + '-'.repeat(60));
  for (const [t, c] of Object.entries(now.counts)) {
    if (c === null) continue;
    console.log('    ' + t.padEnd(30) + String(c).padStart(5));
  }
  console.log('\n  Run it again with --diff after a step.\n');
  process.exit(0);
}

const before = JSON.parse(fs.readFileSync(SNAP, 'utf8'));

console.log('\n  SINCE ' + before.at);
console.log('  ' + '-'.repeat(60));

let moved = 0;
for (const t of TABLES) {
  const a = before.counts[t], b = now.counts[t];
  if (a === null || b === null || a === b) continue;
  moved += 1;
  const d = b - a;
  console.log('    ' + t.padEnd(30) + String(a).padStart(5) + ' -> ' + String(b).padStart(5)
    + '   ' + (d > 0 ? '+' + d : String(d)));
}
if (!moved) console.log('    nothing changed');

const newVersions = now.detail.versions.filter(
  (v) => !before.detail.versions.some((o) => o.id === v.id && o.status === v.status)
);
if (newVersions.length) {
  console.log('\n  PROTOCOL VERSIONS (new or status changed)');
  for (const v of newVersions) {
    console.log(`    v${v.id}  ${String(v.name || v.patient_id).padEnd(10)} ${v.status}`);
  }
}

const newVisits = now.detail.visits.filter((v) => !before.detail.visits.some((o) => o.id === v.id && o.status === v.status));
if (newVisits.length) {
  console.log('\n  VISITS (new or status changed)');
  for (const v of newVisits) console.log(`    #${v.id}  ${String(v.name || v.patient_id).padEnd(10)} ${v.visit_date}  ${v.status}`);
}

const newStatus = now.detail.treatmentStatus.filter((s) => !before.detail.treatmentStatus.some((o) => o.id === s.id));
if (newStatus.length) {
  console.log('\n  TREATMENT STATUS (new rows)');
  for (const s of newStatus) {
    const f = (v) => (v === null ? 'not asked' : String(v));
    console.log(`    #${s.id}  ${String(s.name || s.patient_id).padEnd(10)} ${s.effective_date}`
      + `  ${String(s.weight_bearing_status || '-').padEnd(26)} e-collar=${f(s.e_collar_required)}`
      + `  crate=${f(s.strict_crate_rest)}`);
  }
}

fs.writeFileSync(SNAP, JSON.stringify(now, null, 1));
console.log('\n  (baseline moved forward)\n');
