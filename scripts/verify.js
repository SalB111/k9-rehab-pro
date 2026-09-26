#!/usr/bin/env node
/**
 * Run everything, then say plainly whether it is safe to commit.
 *
 *   node scripts/verify.js
 *
 * WHY THIS EXISTS
 * On 2026-09-21 a commit went in claiming "228 tests pass" while three were
 * failing. The claim was made from memory of an earlier run rather than from
 * a run, and renaming an API route had broken four test files that live
 * outside both repositories and were therefore invisible to the change.
 *
 * Nothing here is clever. The point is that it is ONE command covering BOTH
 * repositories, so "I checked" means the same thing every time, and a claim
 * about test results has a run behind it.
 *
 * Exits non-zero if anything fails. Run it before every commit.
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const K9 = path.resolve(__dirname, '..');
const BEAU = 'C:/Users/User/beauaihome';
// The V2 clinical suite used to live at
// D:/BEAU-K9-INTEGRATION/10-BUILD/K9-CLINICAL-WORKFLOW-V2 — outside both
// repositories, with no version control and no backup. That is exactly how it
// went unnoticed when an API rename broke it. It was brought into this repo on
// 2026-09-24 and its paths made relative, so it is now versioned, pushed, and
// runs wherever the repo is checked out.
const V2_TESTS = path.join(K9, 'backend', 'v2', 'tests');

const CHECKS = [
  // FIRST, because nothing below means anything if the tree does not parse.
  //
  // On 2026-09-26 a comment added to the patients DDL contained backticks.
  // The DDL lives inside a JS template literal, so the first backtick ended
  // the string and sqlite-provider.js stopped parsing — the backend would
  // not boot. THIS SUITE REPORTED 30/30 AND IT WAS COMMITTED, because
  // nothing here loads that module: the one test that touches it reads the
  // file as text, which works fine on a file Node cannot parse.
  //
  // A green verify is supposed to mean the thing runs. `node --check` on
  // every file is the cheapest floor under that. It parses without
  // executing, so modules that bind a port are safe to check.
  { name: 'K9 · syntax',            cwd: K9, cmd: 'node', args: ['scripts/syntax-check.js'],
    ok: (out) => /files parse/.test(out) },
  { name: 'K9 · V2 clinical suite',    cwd: V2_TESTS, cmd: 'node', args: ['run-all.js'],
    ok: (out) => /All suites passed/.test(out) && !/suite\(s\) FAILED/.test(out) },
  { name: 'K9 · intake proposal',      cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/intake-proposal.test.js'],
    ok: (out) => /^ok\s/m.test(out) && !/FAILED/.test(out) },
  // Reads the vocabularies out of the UI source and runs them through the real
  // engine. It fails when a `value` in v2api.js stops matching the engine
  // matcher it feeds — which is a silent safety regression everywhere else.
  { name: 'K9 · clinical vocabulary',  cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/clinical-vocabulary.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // Pounds are the stored unit. Guards the conversion, the "not a weight ->
  // no value" rule, and the single definition of the factor.
  { name: 'K9 · weight units',         cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/weight-units.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // The patient record became editable on 22 Sep 2026. Guards the "only what
  // changed is sent" diff, pounds as the stored unit, and the clinical ranges.
  { name: 'K9 · patient edit',         cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-edit.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // Runs the proposal's "most cautious" gate values through the real engine.
  // Fails if one of them restricts nothing — four of twelve did.
  { name: 'K9 · cautious defaults',    cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/cautious-defaults.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // Reads the V1 clinical record and maps it onto engine inputs. Tests run
  // every option DashboardView can produce through the mapper and then through
  // the real engine — the V1 record is where the clinical detail actually is.
  { name: 'K9 · dashboard bridge',     cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/dashboard-bridge.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // What the generator does not know about a patient, and what it does about
  // it. Severity is the difference between "will not generate" and "will
  // generate and be wrong", and a clinician reads it before a visit.
  { name: 'K9 · record gaps',          cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-gaps.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // The V1 clinical record and the V2 columns are two records of one animal.
  // This is the reconciler both screens write through; the direction rule in it
  // is a safety rule, not a preference.
  { name: 'K9 · record sync',          cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/record-sync.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // The protocol engine has no feline path, so generation refuses for a cat.
  // The test asserts BOTH directions, and asserts the reason still holds.
  { name: 'K9 · feline gate',          cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/feline-gate.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // One equipment record for the practice, shared by both apps. The ten engine
  // booleans are derived from the checklist so they cannot drift apart again.
  { name: 'K9 · clinic equipment',     cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/clinic-equipment.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // The home B.E.A.U. was already permitted to adapt to, and was never told
  // about. Reads the whole V1 option vocabulary out of the real dashboard JSX,
  // so a phrase the UI offers can never go uninterpreted unnoticed.
  { name: 'K9 · home environment',     cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/home-environment.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // V3: the home block's own table is the source of truth. Guards the partial
  // write that must not blank unnamed fields, the column/field agreement, and
  // that every question the dashboard panel offers has somewhere to be stored.
  { name: 'K9 · home store (V3)',      cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-home-store.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // V3: the client block splits — `patients` owns the clinical identity,
  // `patient_client_details` owns the address, contacts, cover and PII. Guards
  // that a demographic field is REFUSED here and that no PII sits on `patients`.
  { name: 'K9 · client store (V3)',    cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-client-store.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // V3: goals are a rehabilitation workflow, not four boxes of text. Guards
  // that unreviewed is never "in progress", that a target date is never
  // inferred from the goal wording, and that overdue is computed not stored.
  { name: 'K9 · goals store (V3)',     cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-goals-store.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // Imaging and labs, in both the shape the dashboard writes today and the
  // legacy one every seeded record is in. Nothing read either before.
  { name: 'K9 · diagnostics',          cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/diagnostics.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // V3: a diagnostic study is a row with a date, so a repeat MRI is a second
  // study. Guards that a findings text is never split and a date never inferred.
  { name: 'K9 · diagnostics store (V3)', cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-diagnostics-store.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // Age is the one field on a patient record that goes wrong on its own. A
  // date of birth does not, so age is derived from it rather than typed.
  { name: 'K9 · patient age',          cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-age.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // What success looks like, split by who each goal was written for. The
  // vocabulary is read out of the real dashboard JSX, so a goal the UI offers
  // can never reach B.E.A.U. uncoded.
  { name: 'K9 · goals',                cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/goals.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // V3: the treatment block, and the first V3 block that feeds the ENGINE —
  // two of the three blob-only safety gates are treatment fields. Guards that
  // a status row is INSERTED and never updated (the progression is the
  // record), that the tri-state survives (NULL is "unanswered", 0 is "no", and
  // the e-collar and crate-rest gates default to REQUIRED), and that a partial
  // write does not blank what it never named.
  { name: 'K9 · treatment store (V3)', cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-treatment-store.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // What the clinician can TYPE, as opposed to what gets stored. Both defects
  // this guards were found by Sal within minutes of driving a real intake and
  // neither was visible to any existing test: a modal backdrop that swallowed
  // every space in every field, and phone numbers stored however they arrived.
  { name: 'K9 · dashboard form',      cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/dashboard-form.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // The SIGN-OFF page must show what the record holds. ProtocolPanel read 8
  // dashboard_data keys belonging to two blocks that already owned tables, so
  // Haley was blank and Winston showed a weight-bearing status his own record
  // had superseded eight hours earlier. MERGED had three tests and none of
  // them asked whether some OTHER screen still read the blob; the last check
  // in this suite is that fourth test.
  { name: 'K9 · protocol summary',   cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/protocol-summary.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // ONE HOME for activity restrictions. They lived in patients.special_
  // instructions AND patient_treatment_status.activity_restrictions, and
  // the two drifted into half-records: Charlie kept his heated bedding and
  // HCPI reassessment in one and his walk dosing in the other, and Haley’s
  // column was empty outright, so the engine never saw her restrictions.
  //
  // The store is now the home and the column a mirror. The load-bearing
  // check is that NO FORM FIELD writes the mirror — with the engine on the
  // store, a box that still writes the column means what a clinician types
  // reaches nothing, which is worse than the drift it replaced.
  { name: 'K9 · restrictions home',  cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/activity-restrictions-home.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // A clinical finding is never fabricated. Fixed twice now: 3516874 took
  // the defaults out of the INSERT in server.js, and the patients DDL still
  // had DEFAULT 0 / 5 / 5 / 'Moderate' behind it, so any insert that merely
  // OMITTED a column got one invented. Found by scripts/drive-flow.js.
  { name: 'K9 · no fabricated findings', cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/no-fabricated-findings.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // The dots on the block cards. They counted dashboard_data keys, so a
  // block that had moved to its own table read as UNTOUCHED: Haley’s Home
  // and Goals showed no dot at all while both stores held her record, and
  // one wrong dot costs a clinician trust in every dot on the page.
  { name: 'K9 · block state',       cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/patient-block-state.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // One library, one identifier, one stated size. `all-exercises.js` is THE
  // library; the `exercises_v2` table is a different one with a disjoint id
  // scheme, and an endpoint keyed one by the other 404'd on every code the
  // list endpoint handed out. Also asserts CLAUDE.md's anti-hallucination rule
  // cites the size the library actually has — it said 223 against 260.
  { name: 'K9 · exercise library',     cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/exercise-library.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  // The handoff contract.
  { name: 'K9 · HEP payload contract', cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/hep-payload-contract.test.js'],
    ok: (out) => /passed/.test(out) && !/FAILED/.test(out) },
  { name: 'K9 · frontend build',       cwd: path.join(K9, 'k9-rehab-frontend'), cmd: 'npx', args: ['--no-install', 'vite', 'build'],
    ok: (out) => /built in/.test(out) && !/error/i.test(out) },
  { name: 'B.E.A.U. · tests',          cwd: BEAU, cmd: 'npm', args: ['test'],
    ok: (out) => /^ok\s/m.test(out) && !/FAILED/.test(out) },
  { name: 'B.E.A.U. · build',          cwd: BEAU, cmd: 'npm', args: ['run', 'build'],
    ok: (out) => /built in/.test(out) && !/error during build/i.test(out) },
];

const strip = (s) => String(s).replace(/\u001b\[[0-9;]*m/g, '');

function run(check) {
  if (!fs.existsSync(check.cwd)) {
    return { ok: false, detail: `path not found: ${check.cwd}` };
  }
  const r = spawnSync(check.cmd, check.args, {
    cwd: check.cwd, shell: true, encoding: 'utf8', timeout: 5 * 60 * 1000,
  });
  const out = strip((r.stdout || '') + '\n' + (r.stderr || ''));
  // Both signals must agree: a clean exit code AND output that says so.
  // An exit code alone has lied before — a runner can summarise failures and
  // still exit 0.
  const passed = r.status === 0 && check.ok(out);
  const detail = passed
    ? (out.match(/PASSED: \d+.*|^ok .*$|built in .*/m) || [''])[0].trim()
    : out.split('\n').filter((l) => /FAIL|error|✗|failed/i.test(l)).slice(0, 4).join('\n        ');
  return { ok: passed, detail, code: r.status };
}

console.log('\nVERIFY — everything, both repositories\n' + '='.repeat(56));

const results = [];
for (const check of CHECKS) {
  process.stdout.write(`  ${check.name.padEnd(28)} … `);
  const r = run(check);
  results.push({ ...check, ...r });
  console.log(r.ok ? 'pass' : 'FAIL');
}

const failed = results.filter((r) => !r.ok);

console.log('='.repeat(56));
for (const r of results) {
  console.log(`  ${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}`);
  if (r.detail) console.log(`        ${r.detail}`);
}

console.log('');
if (failed.length) {
  console.log(`  ${failed.length} of ${results.length} checks FAILED — do not commit.\n`);
  process.exit(1);
}
console.log(`  ${results.length}/${results.length} passed — safe to commit.\n`);
