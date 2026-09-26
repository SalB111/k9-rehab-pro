#!/usr/bin/env node
/**
 * DOES EVERY FILE STILL PARSE?
 *
 * WHY THIS EXISTS
 *
 * On 2026-09-26 a comment added to the patients DDL contained backticks. The
 * DDL lives inside a JS template literal, so the first backtick ended the
 * string and `sqlite-provider.js` stopped parsing. The backend would not
 * boot at all.
 *
 * `npm run verify` reported 30/30 — SAFE TO COMMIT — and it was committed.
 *
 * Nothing in the suite loads that module. The one test that touches it reads
 * the file as TEXT and regexes the DDL out of it, which works perfectly well
 * on a file Node cannot parse. Every other suite requires the V2 stores,
 * which do not reach the provider.
 *
 * So the commit gate could not tell a healthy backend from one that dies on
 * require. That is a bigger defect than the typo was: a green verify is
 * supposed to mean the thing runs.
 *
 * This is the cheapest possible floor under it. It does not run anything or
 * import anything — `node --check` parses each file and nothing more, so it
 * is safe on modules with side effects at import time (server.js binds a
 * port; requiring it here would be a bug).
 *
 *   node scripts/syntax-check.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

/** Directories that are not ours to police. */
const SKIP_DIR = new Set([
  'node_modules', '.git', 'build', 'dist', '.claude', 'storyboard-images',
  '_audit_backup_20260813', 'coverage', '.next', 'public',
]);

/**
 * Files known not to parse and deliberately kept.
 * `backend/.js` is marked DEPRECATED in its own header and nothing requires
 * it; it is listed here rather than deleted, because deleting somebody
 * else's file is not this script's business.
 */
const KNOWN_UNPARSEABLE = new Set([]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIR.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (/\.(js|cjs|mjs)$/.test(entry.name)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const targets = [
  ...walk(path.join(ROOT, 'backend')),
  ...walk(path.join(ROOT, 'scripts')),
];

const broken = [];
for (const file of targets) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (KNOWN_UNPARSEABLE.has(rel)) continue;
  try {
    // --check parses and exits. It does not execute, so a module that binds
    // a port or opens a database is safe to check.
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    const msg = String((err.stderr && err.stderr.toString()) || err.message)
      .split('\n').filter(Boolean).slice(0, 3).join(' | ');
    broken.push({ rel, msg });
  }
}

if (broken.length) {
  console.error(`\n  ${broken.length} file(s) do not parse:\n`);
  for (const b of broken) console.error(`    ${b.rel}\n      ${b.msg}\n`);
  process.exit(1);
}

console.log(`syntax-check: ${targets.length} files parse`);
