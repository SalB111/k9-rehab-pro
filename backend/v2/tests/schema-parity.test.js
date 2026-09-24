/**
 * K9 Clinical Workflow V2 — schema parity
 *
 * K9 runs dual providers (DB_PROVIDER=sqlite|supabase) and they are ALREADY not
 * equivalent in production: Supabase has an unversioned `protocols` blob table,
 * SQLite has no protocols table at all. Behaviour that depends on which database
 * is configured is a defect, not a deployment detail.
 *
 * This suite fails if the two V2 schemas drift apart.
 *
 * Run:  node tests/schema-parity.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// V2 runtime code now lives in the production repo (backend/v2). These tests
// point at it directly so there is ONE copy: a second copy in this sandbox
// would drift from what actually deploys, and the tests would stop proving
// anything about production. Override with V2_ROOT.
const V2_ROOT = process.env.V2_ROOT || path.join(__dirname, '..');


const { stripLineComment } = require(path.join(V2_ROOT, 'schema'));

const SCHEMA_DIR = path.join(V2_ROOT, 'schema');

/** SQLite file -> Postgres file. Postgres tables carry a `v2_` prefix. */
const PAIRS = [
  ['protocol-persistence.sqlite.sql', 'protocol-persistence.postgres.sql'],
  ['clinical-visits.sqlite.sql', 'clinical-visits.postgres.sql'],
  ['clinical-authority.sqlite.sql', 'clinical-authority.postgres.sql'],
  ['clinic-capabilities.sqlite.sql', 'clinic-capabilities.postgres.sql'],
  ['clinic-sessions.sqlite.sql', 'clinic-sessions.postgres.sql'],
  ['home-execution.sqlite.sql', 'home-execution.postgres.sql'],
  ['patient-home.sqlite.sql', 'patient-home.postgres.sql'],
];

const TABLE_RE = /CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\n\)/g;
const NON_COLUMN = /^(FOREIGN|CONSTRAINT|PRIMARY|UNIQUE|CHECK)$/i;

function parseTables(file, prefix) {
  const sql = fs
    .readFileSync(path.join(SCHEMA_DIR, file), 'utf8')
    .split('\n')
    .map((line) => stripLineComment(line).trim())
    .filter(Boolean)
    .join('\n');

  const tables = {};
  let match;
  TABLE_RE.lastIndex = 0;
  while ((match = TABLE_RE.exec(sql))) {
    const name = prefix ? match[1].replace(new RegExp(`^${prefix}`), '') : match[1];
    tables[name] = columnsOf(match[2]);
  }
  return tables;
}

/**
 * Extract column names from a CREATE TABLE body.
 *
 * Tracks parenthesis depth so the continuation lines of a multi-line constraint
 * — e.g. a CHECK spanning several lines — are not mistaken for columns. A
 * column definition only ever begins at depth 0.
 */
function columnsOf(body) {
  const columns = [];
  let depth = 0;

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    const startedAtTopLevel = depth === 0;

    for (const char of line) {
      if (char === '(') depth++;
      else if (char === ')') depth--;
    }

    if (!startedAtTopLevel || !line) continue;
    const token = line.replace(/,$/, '').split(/\s+/)[0];
    if (token && !NON_COLUMN.test(token)) columns.push(token);
  }
  return columns;
}

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures.push(name);
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message.split('\n')[0]}`);
  }
}

console.log('\nSchema parity — SQLite vs Postgres');
console.log('----------------------------------');

for (const [sqliteFile, postgresFile] of PAIRS) {
  const lite = parseTables(sqliteFile, '');
  const pg = parseTables(postgresFile, 'v2_');

  test(`${sqliteFile} defines at least one table`, () => {
    assert.ok(Object.keys(lite).length > 0, 'no tables parsed — check the parser or the file');
  });

  test(`${sqliteFile} <-> ${postgresFile}: same tables`, () => {
    assert.deepStrictEqual(Object.keys(lite).sort(), Object.keys(pg).sort());
  });

  for (const table of Object.keys(lite)) {
    test(`${table}: same columns in both providers`, () => {
      const onlySqlite = lite[table].filter((c) => !(pg[table] || []).includes(c));
      const onlyPostgres = (pg[table] || []).filter((c) => !lite[table].includes(c));
      assert.deepStrictEqual(
        { onlySqlite, onlyPostgres },
        { onlySqlite: [], onlyPostgres: [] }
      );
    });
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`PASSED: ${passed}    FAILED: ${failures.length}`);
console.log('='.repeat(60));
process.exit(failures.length ? 1 : 0);
