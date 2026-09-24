#!/usr/bin/env node
/**
 * Where the V1 assessment form and `visit_assessments` disagree.
 *
 * READ ONLY. It writes nothing, ever.
 *
 * WHY THIS EXISTS INSTEAD OF A MIGRATION
 *
 * Every other V3 block moved with a script. Assessment cannot, for three
 * reasons found in the real data before anything was written:
 *
 *   1. IT FEEDS THE ENGINE. Ten engine inputs come from `assessment::` keys —
 *      pain, lameness, weight bearing, deep pain, incision status. Picking a
 *      winner between two disagreeing records would change which exercises a
 *      dog is prescribed.
 *
 *   2. THE TWO RECORDS ALREADY DISAGREE. Bella's `visit_assessments` row says
 *      pain 5 and lameness grade 0; her V1 form says pain 3 and "Grade 2 —
 *      Mild, consistent". Each also holds fields the other does not. That is a
 *      clinical question, not a merge conflict.
 *
 *   3. AN ASSESSMENT BELONGS TO A VISIT, AND THE BLOB HAS NO VISIT.
 *      `visit_assessments` is keyed by visit because an assessment happens at
 *      an encounter — that is what makes a reassessment meaningful. The V1 form
 *      holds ONE undated assessment per patient. Attaching it to a visit means
 *      choosing one, and the available choices are all wrong:
 *
 *        Louie   has NO visit at all. Migrating would invent an encounter.
 *        Winston, Charlie, Luna  have one COMPLETED visit dated 2026-04-17.
 *                Attaching today's form content to it backdates a clinical
 *                finding to a visit that was already closed.
 *        Bella   has an OPEN visit that already carries a DIFFERENT assessment.
 *
 * So the assessment block moves when a clinician records an assessment at a
 * visit, and this report is what tells them what the old form still holds.
 *
 *   node scripts/assessment-conflicts.js
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.K9_DB || path.join(__dirname, '..', 'backend', 'k9rehab.db');
const bridge = require(path.join(__dirname, '..', 'backend', 'v2', 'dashboard-bridge'));

const db = new DatabaseSync(DB_PATH, { readOnly: true });

/**
 * Column in `visit_assessments` -> the V1 key, and how to compare them.
 *
 * The normalisers are dashboard-bridge's, which are already tested against
 * every option the dashboard can produce AND through the real engine. Writing
 * new ones here would be a second reading of the same vocabulary.
 */
const COMPARE = [
  { column: 'pain_score', key: 'assessment::Numeric Rating Scale (NRS 0–10)', map: bridge.painScore },
  { column: 'lameness_grade', key: 'assessment::Lameness Grade', map: bridge.gradeNumber },
  { column: 'weight_bearing_status', key: 'treatment::Weight Bearing Status', map: bridge.weightBearing },
  { column: 'incision_status', key: 'assessment::Incision Status', map: bridge.incisionStatus },
  { column: 'neuro_deep_pain', key: 'assessment::Deep Pain Perception', map: bridge.deepPain },
  { column: 'mobility_level', key: 'assessment::Current Mobility Level' },
];

const same = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

console.log(`\n  ASSESSMENT — V1 form vs visit_assessments\n  ${DB_PATH}\n`);

const patients = db.prepare('SELECT id, name, dashboard_data FROM patients ORDER BY id').all();
let conflicts = 0;
let orphanBlobs = 0;

for (const p of patients) {
  let blob = {};
  try { blob = JSON.parse(p.dashboard_data || '{}'); } catch { /* reported below */ }
  const formFields = Object.keys(blob).filter((k) => k.startsWith('assessment::') && blob[k]);

  const visits = db.prepare(
    'SELECT id, visit_date, visit_type, status FROM visits WHERE patient_id = ? ORDER BY visit_date DESC'
  ).all(p.id);
  const assessment = db.prepare(
    'SELECT * FROM visit_assessments WHERE patient_id = ? ORDER BY id DESC LIMIT 1'
  ).get(p.id);

  const open = visits.find((v) => v.status === 'OPEN');
  console.log(`  ${p.name}`);
  console.log(`      V1 form:            ${formFields.length} assessment fields`);
  console.log(`      visits:             ${visits.length ? visits.map((v) => `${v.visit_date} ${v.status}`).join(', ') : 'NONE'}`);
  console.log(`      visit_assessments:  ${assessment ? `visit ${assessment.visit_id}` : 'none'}`);

  if (!formFields.length) { console.log(''); continue; }

  if (!assessment) {
    orphanBlobs += 1;
    const why = !visits.length
      ? 'no visit exists — recording this would invent a clinical encounter'
      : !open
        ? `the only visit is COMPLETED (${visits[0].visit_date}) — attaching today's form would backdate a finding`
        : 'an OPEN visit exists; a clinician can record this assessment against it';
    console.log(`      -> NOT RECORDED AT ANY VISIT. ${why}`);
    console.log('');
    continue;
  }

  const rows = [];
  for (const f of COMPARE) {
    const stored = assessment[f.column];
    const rawV1 = blob[f.key];
    if (rawV1 === undefined || rawV1 === null || String(rawV1).trim() === '') continue;
    const mapped = f.map ? f.map(rawV1) : rawV1;
    if (stored === null || stored === undefined || String(stored).trim() === '') {
      rows.push(['only in the form', f.column, '(empty)', `${mapped}  <- ${JSON.stringify(String(rawV1).slice(0, 34))}`]);
      continue;
    }
    if (same(stored, mapped)) continue;
    rows.push(['DISAGREE', f.column, String(stored), `${mapped}  <- ${JSON.stringify(String(rawV1).slice(0, 34))}`]);
  }

  const disagree = rows.filter((r) => r[0] === 'DISAGREE');
  conflicts += disagree.length;
  for (const [kind, column, stored, form] of rows) {
    console.log(`      ${kind === 'DISAGREE' ? '!!' : '  '} ${column.padEnd(22)} visit=${stored.padEnd(22)} form=${form}`);
  }
  if (!rows.length) console.log('      the two records agree on every compared field');
  console.log('');
}

console.log(`  ${conflicts} field${conflicts === 1 ? '' : 's'} where the two records DISAGREE.`);
console.log(`  ${orphanBlobs} patient${orphanBlobs === 1 ? '' : 's'} whose form assessment is recorded at no visit.\n`);
console.log('  Nothing was written. A disagreement on a value that feeds the engine is a');
console.log('  clinical question, and resolving it belongs to the person who can look at');
console.log('  the animal.\n');
