/**
 * K9 Clinical Workflow V2 — run every test suite.
 *
 * Run:  node tests/run-all.js
 *       K9_BACKEND=/path/to/k9-rehab-pro/backend node tests/run-all.js
 *
 * Exits non-zero if any suite fails, so it can gate a build.
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const SUITES = [
  'engine-adapter.test.js',
  'protocol-store.test.js',
  'hep-contract.test.js',
  'visit-store.test.js',
  'schema-parity.test.js',
  'session-store.test.js',
  'home-store.test.js',
  'owner-auth.test.js',
  'api.test.js',
];

let failed = 0;
const summary = [];

for (const suite of SUITES) {
  const result = spawnSync(process.execPath, [path.join(__dirname, suite)], {
    encoding: 'utf8',
    env: process.env,
  });

  const output = `${result.stdout || ''}${result.stderr || ''}`;
  const line = (output.match(/PASSED: \d+\s+FAILED: \d+/) || ['no result'])[0];
  const ok = result.status === 0;
  if (!ok) failed++;

  summary.push(`  ${ok ? 'OK  ' : 'FAIL'}  ${suite.padEnd(28)} ${line}`);

  if (!ok) {
    console.log(`\n----- ${suite} output -----`);
    console.log(output.split('\n').filter((l) => /FAIL|Error|at /.test(l)).join('\n'));
  }
}

console.log('\nK9 CLINICAL WORKFLOW V2 — TEST SUMMARY');
console.log('='.repeat(60));
console.log(summary.join('\n'));
console.log('='.repeat(60));
console.log(failed ? `${failed} suite(s) FAILED` : 'All suites passed');

process.exit(failed ? 1 : 0);
