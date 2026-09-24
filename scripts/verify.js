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
  // Imaging and labs, in both the shape the dashboard writes today and the
  // legacy one every seeded record is in. Nothing read either before.
  { name: 'K9 · diagnostics',          cwd: path.join(K9, 'backend'), cmd: 'node', args: ['v2/diagnostics.test.js'],
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
