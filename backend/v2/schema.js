/**
 * K9 Clinical Workflow V2 — schema application.
 *
 * Applies every V2 schema file in dependency order. Idempotent: every statement
 * is CREATE ... IF NOT EXISTS, so this is safe to run on each boot.
 *
 * Order matters — `visit_protocol_versions` references `protocol_versions`.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SCHEMA_DIR = path.join(__dirname, 'schema');

/** In dependency order. */
const SQLITE_SCHEMAS = [
  'protocol-persistence.sqlite.sql',
  'clinical-visits.sqlite.sql',
  'clinical-authority.sqlite.sql',
  'clinic-capabilities.sqlite.sql',
  'clinic-sessions.sqlite.sql',
  'home-execution.sqlite.sql',
  // V3: the home block's one real home. Before this, the home environment
  // lived only in `patients.dashboard_data`, keyed by UI label.
  'patient-home.sqlite.sql',
  'patient-goals.sqlite.sql',
  'patient-diagnostics.sqlite.sql',
];

/** Postgres/Supabase equivalents, same order. Kept in parity by tests/schema-parity.test.js. */
const POSTGRES_SCHEMAS = [
  'protocol-persistence.postgres.sql',
  'clinical-visits.postgres.sql',
  'clinical-authority.postgres.sql',
  'clinic-capabilities.postgres.sql',
  'clinic-sessions.postgres.sql',
  'home-execution.postgres.sql',
  'patient-home.postgres.sql',
  'patient-goals.postgres.sql',
  'patient-diagnostics.postgres.sql',
];

/**
 * Remove a SQL line comment from one line, respecting single-quoted strings.
 *
 * Both full-line (`-- note`) and trailing (`col TEXT, -- note`) comments must go
 * before the file is split on ';', because the schema's comments contain
 * semicolons — `-- 0-5;  <=1 restricts to passive` would otherwise split a
 * CREATE TABLE in half and raise "incomplete input".
 *
 * Quote-awareness matters: a default value such as '--' must not be mistaken
 * for the start of a comment.
 */
function stripLineComment(line) {
  let inString = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "'") {
      // '' is an escaped quote inside a string, not a close-then-open.
      if (inString && line[i + 1] === "'") { i++; continue; }
      inString = !inString;
    } else if (!inString && char === '-' && line[i + 1] === '-') {
      return line.slice(0, i);
    }
  }
  return line;
}

/**
 * Split a schema file into executable statements.
 *
 * Comments are stripped BEFORE splitting on ';' — see stripLineComment.
 */
function toStatements(sql) {
  return sql
    .split('\n')
    .map((line) => stripLineComment(line).trim())
    .filter(Boolean)
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}


/**
 * Column names and declared types from a CREATE TABLE statement.
 * Constraint lines (FOREIGN KEY, CONSTRAINT, UNIQUE, ...) are not columns.
 */
function columnsFromCreate(statement) {
  const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*)\)\s*$/i);
  if (!match) return null;

  const columns = [];
  let depth = 0;

  for (const rawLine of match[2].split('\n')) {
    const line = rawLine.trim();
    const topLevel = depth === 0;
    for (const char of line) {
      if (char === '(') depth++;
      else if (char === ')') depth--;
    }
    if (!topLevel || !line) continue;

    const cleaned = line.replace(/,$/, '');
    const [name, ...rest] = cleaned.split(/\s+/);
    if (!name || /^(FOREIGN|CONSTRAINT|PRIMARY|UNIQUE|CHECK)$/i.test(name)) continue;
    columns.push({ name, type: rest.join(' ') });
  }
  return { table: match[1], columns };
}

/**
 * Add columns that a table is missing.
 *
 * CREATE TABLE IF NOT EXISTS silently does nothing when the table already
 * exists, so a column added to the schema after first boot would never appear
 * and every INSERT naming it would fail. A clinical schema will keep gaining
 * fields, so this reconciles them on each boot.
 *
 * Only plain nullable columns are added. SQLite cannot ADD COLUMN with NOT NULL
 * (no default), PRIMARY KEY or UNIQUE, so those are reported rather than
 * attempted — a silent partial migration is worse than a loud refusal.
 */
async function ensureColumns(db, statements, { logger = console } = {}) {
  const added = [];
  const needsManualMigration = [];

  for (const statement of statements) {
    const parsed = columnsFromCreate(statement);
    if (!parsed) continue;

    let existing;
    try {
      existing = await db.all(`PRAGMA table_info(${parsed.table})`);
    } catch {
      continue; // table not present yet; the CREATE above will have made it
    }
    if (!existing || !existing.length) continue;

    const present = new Set(existing.map((c) => c.name));
    for (const column of parsed.columns) {
      if (present.has(column.name)) continue;

      const unsafe = /NOT NULL|PRIMARY KEY|UNIQUE/i.test(column.type)
        && !/DEFAULT/i.test(column.type);
      if (unsafe) {
        needsManualMigration.push(`${parsed.table}.${column.name} (${column.type})`);
        continue;
      }

      await db.run(`ALTER TABLE ${parsed.table} ADD COLUMN ${column.name} ${column.type}`);
      added.push(`${parsed.table}.${column.name}`);
    }
  }

  if (added.length) logger.log(`[v2] columns added: ${added.join(', ')}`);
  if (needsManualMigration.length) {
    logger.warn(
      `[v2] these columns cannot be added in place and need a manual migration: ${needsManualMigration.join(', ')}`
    );
  }
  return { added, needsManualMigration };
}

/** Apply every V2 schema file. Returns the statement count per file. */
async function applyAll(db, { files = SQLITE_SCHEMAS, logger = console } = {}) {
  const applied = [];
  for (const file of files) {
    const sql = fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8');
    const statements = toStatements(sql);
    for (const statement of statements) {
      await db.run(statement);
    }
    // CREATE TABLE IF NOT EXISTS is a no-op on an existing table, so a newly
    // added column would otherwise never appear on an already-migrated database.
    const reconciled = await ensureColumns(db, statements, { logger });
    applied.push({ file, statements: statements.length, columnsAdded: reconciled.added.length });
  }
  return applied;
}

module.exports = { applyAll, ensureColumns, columnsFromCreate, toStatements, stripLineComment, SQLITE_SCHEMAS, POSTGRES_SCHEMAS, SCHEMA_DIR };
