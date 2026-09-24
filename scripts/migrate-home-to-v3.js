#!/usr/bin/env node
/**
 * V3 — fold the home block out of `dashboard_data` and into its own table.
 *
 * This is the "fold the old copies in" step of the clinic-equipment template
 * (commit 9e8f407). After it, `patient_home_environment` is the source of truth
 * for the home block and nothing reads `home::` keys from the blob.
 *
 * WHAT IT DOES NOT DO
 *
 * It does not delete anything from `dashboard_data`. The blob keys are left
 * exactly where they are — inert, unread, and available if this ever has to be
 * checked or reversed. Deleting them would make the migration irreversible for
 * no benefit, and the blob is not the thing that was costing anything: reading
 * it as truth was.
 *
 * It refuses to overwrite a home record that already exists, so re-running it
 * cannot clobber answers a clinician has given through the new screen since.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 *
 *   node scripts/migrate-home-to-v3.js
 *   node scripts/migrate-home-to-v3.js --apply
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const APPLY = process.argv.includes('--apply');
const DB_PATH = process.env.K9_DB || path.join(__dirname, '..', 'backend', 'k9rehab.db');
const V2 = path.join(__dirname, '..', 'backend', 'v2');

const homeEnvironment = require(path.join(V2, 'home-environment'));
const store = require(path.join(V2, 'patient-home-store'));

const raw = new DatabaseSync(DB_PATH, { readOnly: !APPLY });
const db = {
  get: async (sql, p = []) => raw.prepare(sql).get(...p),
  all: async (sql, p = []) => raw.prepare(sql).all(...p),
  run: async (sql, p = []) => raw.prepare(sql).run(...p),
};

/**
 * The migration writes as the account that owns the practice, so
 * `updated_by` points at a real user rather than a placeholder.
 *
 * NOT id 0: every store in V2 guards with `!actor.id`, which rejects zero
 * because zero is falsy. SQLite AUTOINCREMENT starts at 1 so no real user has
 * id 0 and the guard is harmless — but a migration relying on it would fail at
 * the first write, which is exactly what happened when this said `id: 0`.
 */
const ACTOR_ID = Number(process.env.MIGRATION_ACTOR_ID || 1);
const ACTOR = { id: ACTOR_ID, username: 'migrate-home-to-v3', role: 'admin' };

(async () => {
  console.log(`\n  ${APPLY ? 'APPLYING' : 'DRY RUN'} — ${DB_PATH}\n`);

  await store.assertColumnsMatchFields(db);

  const patients = await db.all('SELECT id, name, dashboard_data FROM patients ORDER BY id');
  let migrated = 0;
  let skipped = 0;
  let empty = 0;
  let fields = 0;

  for (const p of patients) {
    const stated = homeEnvironment.readFromDashboard(p.dashboard_data);
    const keys = Object.keys(stated);

    if (!keys.length) { empty += 1; console.log(`  ${p.name}: no home recorded in the blob`); continue; }

    const existing = await db.get(
      `SELECT patient_id FROM ${store.TABLE} WHERE patient_id = ?`, [p.id]
    );
    if (existing) {
      skipped += 1;
      console.log(`  ${p.name}: already has a home record — REFUSING to overwrite`);
      continue;
    }

    console.log(`  ${p.name} (id ${p.id}) — ${keys.length} fields`);
    for (const k of keys) {
      const v = String(stated[k]).replace(/\s+/g, ' ');
      console.log(`      ${k.padEnd(22)} ${JSON.stringify(v.slice(0, 52))}`);
    }
    fields += keys.length;
    migrated += 1;

    if (APPLY) {
      await store.setHome(db, { patientId: p.id, stated, actor: ACTOR });
      // Read it straight back. A migration that reports success without
      // checking is how "228 tests pass" got claimed while three were failing.
      const back = await store.getHome(db, p.id);
      const lost = keys.filter((k) => back.stated[k] !== stated[k]);
      if (lost.length) {
        console.error(`      MISMATCH after write: ${lost.join(', ')}`);
        process.exit(1);
      }
      console.log('      written and read back identical');
    }
    console.log('');
  }

  console.log(`  ${migrated} patients, ${fields} fields`
    + `${skipped ? `, ${skipped} skipped (already had a record)` : ''}`
    + `${empty ? `, ${empty} with nothing to migrate` : ''}`);
  console.log(APPLY
    ? '  Written. `dashboard_data` was NOT modified — the old keys remain, unread.\n'
    : '  Nothing written. Re-run with --apply to write.\n');
})().catch((err) => { console.error('\n  FAILED:', err.message, '\n'); process.exit(1); });
