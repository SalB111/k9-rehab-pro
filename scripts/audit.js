#!/usr/bin/env node
/**
 * Full audit — the state of the system, in one command.
 *
 * READ ONLY. It writes nothing.
 *
 * `verify.js` answers "do the tests pass". This answers "what is actually in
 * there": where each clinical block lives, whether the two records still
 * agree, what the engine would receive for each patient, and what is known to
 * be unfinished.
 *
 *   node scripts/audit.js
 *
 * Exits non-zero if anything is in a state that needs a person.
 */

'use strict';

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const DB_PATH = process.env.K9_DB || path.join(BACKEND, 'k9rehab.db');
const V2 = path.join(BACKEND, 'v2');

const bridge = require(path.join(V2, 'dashboard-bridge'));
const homeStore = require(path.join(V2, 'patient-home-store'));
const goalsStore = require(path.join(V2, 'patient-goals-store'));
const diagStore = require(path.join(V2, 'patient-diagnostics-store'));

const raw = new DatabaseSync(DB_PATH, { readOnly: true });
const db = {
  get: async (s, p = []) => raw.prepare(s).get(...p),
  all: async (s, p = []) => raw.prepare(s).all(...p),
};

const problems = [];
const notes = [];
const h = (t) => console.log(`\n  ${t}\n  ${'-'.repeat(t.length)}`);
const line = (k, v) => console.log(`   ${String(k).padEnd(34)}${v}`);

(async () => {
  console.log(`\n  K9 REHAB PRO — FULL AUDIT`);
  console.log(`  ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`);
  console.log(`  ${DB_PATH}`);

  // ── 1. repository ────────────────────────────────────────────────────────
  h('1. REPOSITORY');
  try {
    const git = (c) => execSync(`git ${c}`, { cwd: ROOT, encoding: 'utf8' }).trim();
    const branch = git('branch --show-current');
    line('branch', branch);
    line('HEAD', git('log --oneline -1'));
    const unpushed = git(`rev-list --count origin/${branch}..HEAD`);
    line('unpushed commits', unpushed);
    if (Number(unpushed) > 0) problems.push(`${unpushed} commits are not pushed`);
    line('remote', git('remote get-url origin'));
  } catch (e) {
    problems.push(`git: ${e.message.split('\n')[0]}`);
  }

  // ── 2. database ──────────────────────────────────────────────────────────
  h('2. DATABASE');
  const integrity = raw.prepare('PRAGMA integrity_check').get().integrity_check;
  line('integrity_check', integrity);
  if (integrity !== 'ok') problems.push(`integrity_check: ${integrity}`);

  const tables = new Set(
    raw.prepare('SELECT name FROM sqlite_master WHERE type = ?').all('table').map((r) => r.name)
  );
  const V3_TABLES = [
    ['equipment', 'clinic_capabilities'],
    ['metrics', 'visit_measurements'],
    ['home', 'patient_home_environment'],
    ['goals', 'patient_goals'],
    ['goal items', 'patient_goal_items'],
    ['diagnostics', 'patient_diagnostic_studies'],
  ];
  for (const [block, table] of V3_TABLES) {
    if (!tables.has(table)) { problems.push(`${block}: table ${table} missing`); line(block, 'TABLE MISSING'); continue; }
    line(block, `${raw.prepare(`SELECT COUNT(*) c FROM ${table}`).get().c} rows in ${table}`);
  }

  const patients = await db.all('SELECT id, name FROM patients ORDER BY id');
  line('patients', patients.length);

  // Orphans: rows pointing at a patient that does not exist.
  for (const t of ['visit_assessments', 'visits', 'visit_measurements', 'patient_goal_items']) {
    if (!tables.has(t)) continue;
    const orphans = raw.prepare(
      `SELECT COUNT(*) c FROM ${t} WHERE patient_id NOT IN (SELECT id FROM patients)`
    ).get().c;
    if (orphans) { line(`orphaned ${t}`, `${orphans} rows`); notes.push(`${orphans} orphaned rows in ${t}`); }
  }

  // ── 3. do the two records still agree? ───────────────────────────────────
  h('3. V1 FORM vs V2 RECORD');
  let disagreements = 0;
  for (const p of patients) {
    const row = await db.get('SELECT * FROM patients WHERE id = ?', [p.id]);
    const d = bridge.disagreements(row, bridge.COMPARABLE);
    if (d.length) {
      disagreements += d.length;
      line(p.name, d.map((x) => `${x.field}: ${x.column} vs ${x.v1Record}`).join('; '));
    }
  }
  line('demographic disagreements', disagreements === 0 ? 'none' : disagreements);
  if (disagreements) problems.push(`${disagreements} demographic fields disagree`);

  // assessment is compared by its own script; summarise here
  let assessmentConflicts = 0;
  let formOnly = 0;
  for (const p of patients) {
    const row = await db.get('SELECT dashboard_data FROM patients WHERE id = ?', [p.id]);
    let blob = {};
    try { blob = JSON.parse(row.dashboard_data || '{}'); } catch { /* counted below */ }
    const fields = Object.keys(blob).filter((k) => k.startsWith('assessment::') && blob[k]);
    const a = await db.get('SELECT * FROM visit_assessments WHERE patient_id = ? ORDER BY id DESC LIMIT 1', [p.id]);
    if (fields.length && !a) { formOnly += 1; continue; }
    if (!a) continue;
    for (const [col, key, map] of [
      ['pain_score', 'assessment::Numeric Rating Scale (NRS 0–10)', bridge.painScore],
      ['lameness_grade', 'assessment::Lameness Grade', bridge.gradeNumber],
      ['neuro_deep_pain', 'assessment::Deep Pain Perception', bridge.deepPain],
    ]) {
      const v1 = blob[key];
      if (v1 === undefined || v1 === null || String(v1).trim() === '') continue;
      const stored = a[col];
      if (stored === null || stored === undefined || String(stored).trim() === '') continue;
      if (String(stored).toLowerCase() !== String(map(v1)).toLowerCase()) {
        assessmentConflicts += 1;
        line(`${p.name} ${col}`, `visit=${stored} form=${map(v1)}`);
      }
    }
  }
  line('assessment conflicts', assessmentConflicts === 0 ? 'none' : assessmentConflicts);
  if (assessmentConflicts) problems.push(`${assessmentConflicts} assessment fields disagree — they feed the engine`);
  if (formOnly) notes.push(`${formOnly} patients have a form assessment recorded at no visit`);
  line('form assessment, no visit', formOnly || 'none');

  // ── 4. what the engine would receive ─────────────────────────────────────
  h('4. ENGINE INPUTS, PER PATIENT');
  for (const p of patients) {
    const row = await db.get('SELECT * FROM patients WHERE id = ?', [p.id]);
    const v = bridge.readDashboard(row).values;
    line(p.name, `pain=${v.painScore ?? '-'} lameness=${v.lamenessGrade ?? '-'} `
      + `WB=${v.weightBearingStatus ?? '-'} deepPain=${v.neuroDeepPain ?? '-'}`);
    // A value that reads as nothing is not a gap in itself, but deep pain is.
    if (v.neuroDeepPain === undefined) notes.push(`${p.name}: no deep pain finding reaches the engine`);
  }

  // ── 5. V3 coverage ───────────────────────────────────────────────────────
  h('5. V3 BLOCK COVERAGE');
  for (const p of patients) {
    const home = await homeStore.getHome(db, p.id);
    const goals = await goalsStore.getGoals(db, p.id);
    const diag = await diagStore.getStudies(db, p.id);
    line(p.name,
      `home ${Object.keys(home.stated).length}/17  `
      + `goals ${goals.items.length} (${goals.review.unreviewed} unreviewed)  `
      + `studies ${diag.studies.length} (${diag.summary.describing_multiple_studies} need splitting)`);
  }

  // ── 6. what still reads the V1 blob ──────────────────────────────────────
  h('6. WHAT STILL READS THE V1 BLOB');
  const blobBlocks = {};
  for (const k of [...bridge.MAP.flatMap((e) => e.keys), ...bridge.CONTEXT_KEYS]) {
    const b = k.split('::')[0];
    blobBlocks[b] = (blobBlocks[b] || 0) + 1;
  }
  for (const [b, n] of Object.entries(blobBlocks).sort((a, c) => c[1] - a[1])) {
    line(`dashboard-bridge -> ${b}`, `${n} keys (feed the ENGINE)`);
  }
  line('handoff path', 'reads no blob');

  // ── 7. backups ───────────────────────────────────────────────────────────
  h('7. BACKUPS');
  const backups = fs.readdirSync(BACKEND).filter((f) => f.startsWith('k9rehab.db.backup-'));
  line('database backups', backups.length);
  if (backups.length) line('most recent', backups.sort().slice(-1)[0]);
  if (!backups.length) problems.push('no database backups on disk');

  // ── verdict ──────────────────────────────────────────────────────────────
  h('VERDICT');
  if (notes.length) {
    console.log('   Known and accepted:');
    for (const n of [...new Set(notes)]) console.log(`     - ${n}`);
  }
  if (problems.length) {
    console.log('\n   NEEDS A PERSON:');
    for (const p of problems) console.log(`     ! ${p}`);
    console.log('');
    process.exit(1);
  }
  console.log('\n   Nothing needs a person. Run `npm run verify` for the test gate.\n');
})().catch((e) => { console.error(`\n  AUDIT FAILED: ${e.message}\n`); process.exit(1); });
