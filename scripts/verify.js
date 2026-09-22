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
// The V2 clinical suite lives outside both repositories. That is exactly how
// it went unnoticed, so it is named explicitly here.
const V2_TESTS = 'D:/BEAU-K9-INTEGRATION/10-BUILD/K9-CLINICAL-WORKFLOW-V2';

const CHECKS = [
  { name: 'K9 · V2 clinical suite',    cwd: V2_TESTS, cmd: 'node', args: ['tests/run-all.js'],
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
