/**
 * K9 Clinical Workflow V2 — one-call integration.
 *
 * Wires the whole V2 workflow into an existing Express app. Designed so the
 * production diff is two lines, because a large hand-edit to server.js is a
 * large opportunity to break a running clinical system.
 *
 *   // backend/server.js
 *   const { mountV2 } = require('../path/to/V2/backend/mount-v2');
 *   await mountV2(app, { db, engine, allExercises, requireAuth });
 *
 * WHAT IT DOES
 *   0. Verifies the database provider actually persists (see
 *      assertProviderWritable — the Supabase provider's run/get/all are no-op
 *      stubs, and a clinical workflow must not run on top of those).
 *   1. Applies the V2 schema (idempotent — safe on every boot).
 *   2. Verifies the clinic capability map still covers every engine
 *      enablement gate, and refuses to boot if it does not.
 *   3. Mounts /api/v2.
 *   4. Installs the V2 error handler, scoped to /api/v2 so existing routes keep
 *      whatever error handling they already have.
 *
 * WHAT IT DOES NOT DO
 *   Touch any existing route, table, or middleware. Every V2 table is new, and
 *   the legacy `protocols`, `protocol_exercises`, `exercise_logs` and
 *   `progress_assessments` tables are left exactly as they are.
 */

'use strict';

const schema = require('./schema');
const clinicStore = require('./clinic-store');
const { createV2Router } = require('./routes/v2-router');
const { errorHandler } = require('./http-errors');


/**
 * Prove the database handle actually reads and writes before mounting.
 *
 * WHY THIS IS NOT PARANOIA
 * ------------------------
 * `db-providers/supabase-provider.js` exports run/get/all as SILENT NO-OP STUBS:
 *
 *     async function run(sql, params = []) {
 *       console.warn("[Supabase] run() called with raw SQL ...");
 *       return { lastID: 0, changes: 0 };          // writes nothing
 *     }
 *     async function get(...) { ...; return null; }  // reads nothing
 *     async function all(...) { ...; return []; }
 *
 * With DB_PROVIDER=supabase every raw-SQL write in the application succeeds and
 * stores nothing. A clinician would record an assessment, approve a protocol,
 * and see a success response, while the clinical record silently stayed empty.
 *
 * A console.warn is not adequate protection against that in a clinical system.
 * This does a real INSERT/SELECT round trip and refuses to mount if the value
 * does not come back.
 */
async function assertProviderWritable(db) {
  const probe = `v2-probe-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

  try {
    await db.run(`CREATE TABLE IF NOT EXISTS v2_provider_check (id INTEGER PRIMARY KEY AUTOINCREMENT, probe TEXT)`);
    const inserted = await db.run(`INSERT INTO v2_provider_check (probe) VALUES (?)`, [probe]);
    const readBack = await db.get(`SELECT probe FROM v2_provider_check WHERE probe = ?`, [probe]);

    if (!readBack || readBack.probe !== probe) {
      throw new Error(
        'the configured database provider accepted a write but did not return it. ' +
          'db-providers/supabase-provider.js exports run/get/all as no-op stubs, so with ' +
          'DB_PROVIDER=supabase every clinical write is silently discarded. ' +
          'Use DB_PROVIDER=sqlite, or give the Supabase provider real SQL execution, ' +
          'before running a clinical workflow against it.'
      );
    }

    // Clean up the probe row. Failure here is harmless — the row is inert.
    if (inserted && inserted.lastID) {
      await db.run(`DELETE FROM v2_provider_check WHERE probe = ?`, [probe]).catch(() => {});
    }
  } catch (err) {
    throw new Error(`[v2] database provider check failed: ${err.message}`);
  }

  return true;
}

/**
 * @param {object} app  the Express app
 * @param {object} deps
 * @param {object} deps.db            promise-returning run/get/all
 * @param {object} deps.engine        backend/protocol-generator.js
 * @param {Array}  deps.allExercises  ALL_EXERCISES
 * @param {Function} deps.requireAuth K9's auth middleware
 * @param {string} [deps.basePath]    default '/api/v2'
 * @param {object} [deps.logger]      default console
 * @param {boolean} [deps.applySchema] default true
 */
async function mountV2(app, deps) {
  const {
    db,
    engine,
    allExercises,
    requireAuth,
    basePath = '/api/v2',
    logger = console,
    applySchema = true,
    ...routerDeps
  } = deps;

  if (!app) throw new Error('mountV2 requires the Express app');
  if (!db) throw new Error('mountV2 requires db');

  // 1. Prove the provider genuinely persists. Must run BEFORE the schema, so a
  //    non-functional provider fails before any table is created and long
  //    before a clinician is shown a false success.
  await assertProviderWritable(db);

  // 2. Schema. Every statement is CREATE ... IF NOT EXISTS.
  if (applySchema) {
    const applied = await schema.applyAll(db);
    logger.log(
      `[v2] schema applied: ${applied.map((a) => `${a.file} (${a.statements})`).join(', ')}`
    );
  }

  // 3. Fail fast if the engine has enablement gates the clinic capability model
  //    does not cover. Such a gap has no runtime symptom — the therapy simply
  //    never appears in any protocol — so it must be caught at boot, loudly,
  //    rather than discovered from a clinician wondering where laser went.
  const contract = require('./contracts/k9-engine-input-contract.json');
  clinicStore.assertCoversEngineGates(contract);

  // 4. Routes.
  app.use(basePath, createV2Router({ db, engine, allExercises, requireAuth, ...routerDeps }));

  // 5. Error handling, scoped to V2 so existing routes are unaffected.
  app.use(basePath, errorHandler(logger));

  logger.log(`[v2] clinical workflow mounted at ${basePath}`);

  return { basePath };
}

module.exports = { mountV2, assertProviderWritable };
