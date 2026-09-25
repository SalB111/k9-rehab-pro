#!/usr/bin/env node
/**
 * Migrate the treatment block out of `patients.dashboard_data` into V3.
 *
 *   node scripts/migrate-treatment-to-v3.js            # dry run, writes nothing
 *   node scripts/migrate-treatment-to-v3.js --apply    # writes, after a backup
 *
 * WHERE THE TWELVE KEYS GO
 *
 *   treatment::Approach                 -> patients.treatment_approach
 *   treatment::Affected Limb(s)         -> patients.affected_limbs
 *   treatment::Affected Area            -> patients.affected_region  (already
 *                                          there; NOT touched by this script)
 *
 *   treatment::Surgery Type             -> patient_procedures.procedure_type
 *   treatment::Surgery Date             -> patient_procedures.procedure_date
 *   treatment::Surgeon Name             -> patient_procedures.surgeon
 *
 *   treatment::Weight Bearing Status    -> patient_treatment_status
 *   treatment::Incision Status             (one row, the current state)
 *   treatment::E-Collar Required
 *   treatment::Strict Crate Rest
 *   treatment::Sling Assist Required
 *   treatment::Activity Restrictions
 *   treatment::Clinical Notes
 *
 * THE DATE PROBLEM, AND WHAT IS DONE ABOUT IT
 *
 * A status row needs an effective date and the blob has none — the V1 form
 * stores a CURRENT state and never when it was observed. Three options were
 * available and two of them lie:
 *
 *   - stamp today's date silently: turns a bookkeeping artefact into a
 *     clinical finding ("weight bearing was PWB on the day we ran a script")
 *   - reuse the surgery date: that is a different fact entirely
 *   - stamp today's date AND FLAG IT
 *
 * The third is what happens. Every migrated row carries
 * `effective_date_is_unknown = 1`, and the first status a clinician records
 * afterwards is dated by them and unflagged, so the marker falls off the top
 * of the history on its own.
 *
 * THE TRI-STATE, WHICH IS THE EASY THING TO GET WRONG HERE
 *
 * The V1 form serialises an unticked checkbox as "" and a ticked one as
 * "true". "" CANNOT tell "the clinician said no" from "nobody touched it", and
 * the e-collar and crate-rest gates DEFAULT TO REQUIRED inside the acute
 * post-operative window. So "" migrates to NULL, not to 0. Migrating it as 0
 * would quietly relax both gates on every patient in the database.
 *
 * WHAT IS NOT TOUCHED
 *
 * The blob keys stay where they are, inert, exactly as the six blocks before
 * this one left theirs. Nothing is deleted from `dashboard_data`.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const DB_PATH = process.env.K9_DB || path.join(BACKEND, 'k9rehab.db');

const store = require(path.join(BACKEND, 'v2', 'patient-treatment-store'));

const APPLY = process.argv.includes('--apply');

const raw = new DatabaseSync(DB_PATH);
const db = {
  get: async (s, p = []) => raw.prepare(s).get(...p),
  all: async (s, p = []) => raw.prepare(s).all(...p),
  run: async (s, p = []) => {
    const r = raw.prepare(s).run(...p);
    return { lastID: Number(r.lastInsertRowid), changes: r.changes };
  },
};

const K = {
  approach: 'treatment::Approach',
  limbs: 'treatment::Affected Limb(s)',
  surgeryType: 'treatment::Surgery Type',
  surgeryDate: 'treatment::Surgery Date',
  surgeon: 'treatment::Surgeon Name',
  wb: 'treatment::Weight Bearing Status',
  incision: 'treatment::Incision Status',
  eCollar: 'treatment::E-Collar Required',
  crate: 'treatment::Strict Crate Rest',
  sling: 'treatment::Sling Assist Required',
  restrictions: 'treatment::Activity Restrictions',
  notes: 'treatment::Clinical Notes',
};

const blank = (v) => v === undefined || v === null || String(v).trim() === '';
const val = (b, k) => (blank(b[k]) ? null : String(b[k]).trim());

/** "" is UNANSWERED, never "no". See the header. */
function triState(v) {
  if (blank(v)) return null;
  const t = String(v).trim().toLowerCase();
  if (['true', 'yes', '1', 'required'].includes(t)) return true;
  if (['false', 'no', '0'].includes(t)) return false;
  return null;
}

const show = (v) => (v === null ? '(unanswered)' : v === true ? 'yes' : v === false ? 'no' : v);
const rule = (c = '-') => console.log('  ' + c.repeat(74));

(async () => {
  console.log('');
  console.log('  MIGRATE TREATMENT -> V3' + (APPLY ? '   [APPLY]' : '   [dry run]'));
  console.log('  ' + DB_PATH);
  rule('=');

  // ── back up BEFORE the first write ──────────────────────────────────────
  //
  // The first version of this script took its backup after the ALTER TABLEs
  // and before the inserts, so the "pre-migration" copy already carried the
  // schema change. A backup taken after the first write is not a backup, and
  // the only reason it cost nothing that time is that the run failed two
  // statements later.
  let backup = null;
  if (APPLY) {
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    backup = `${DB_PATH}.backup-${stamp}-pre-v3-treatment`;
    fs.copyFileSync(DB_PATH, backup);
    console.log('\n  backup: ' + path.basename(backup) + '   (taken before any write)');
  }

  // ── the tables ──────────────────────────────────────────────────────────
  //
  // schema.js applies these on server boot, so a migration run against a
  // database the server has never started on finds them missing — which is
  // exactly what happened on the first attempt here. Applying the real schema
  // file makes the script self-sufficient. Every statement in it is
  // CREATE ... IF NOT EXISTS, so this is safe to repeat.
  const schemaSql = fs.readFileSync(
    path.join(BACKEND, 'v2', 'schema', 'patient-treatment.sqlite.sql'), 'utf8'
  );
  const existing = await db.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN (?, ?)",
    [store.PROCEDURES, store.STATUS]
  );
  console.log('\n  tables present: ' + (existing.length ? existing.map((r) => r.name).join(', ') : 'none'));
  if (APPLY && existing.length < 2) {
    const stripped = schemaSql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
    for (const stmt of stripped.split(';')) {
      if (stmt.trim()) await db.run(stmt);
    }
    console.log('    applied patient-treatment.sqlite.sql');
  }

  // ── the two case columns ────────────────────────────────────────────────
  const cols = new Set((await db.all('PRAGMA table_info(patients)')).map((r) => r.name));
  const needed = store.CASE_COLUMNS.filter((c) => !cols.has(c));
  console.log('  patients columns to add: ' + (needed.length ? needed.join(', ') : 'none'));

  if (needed.length && APPLY) {
    for (const c of needed) {
      await db.run(`ALTER TABLE patients ADD COLUMN ${c} TEXT`);
      console.log('    added ' + c);
    }
  }

  // ── plan ────────────────────────────────────────────────────────────────
  const patients = await db.all('SELECT * FROM patients ORDER BY id');
  const plan = [];

  for (const p of patients) {
    let b = {};
    try { b = p.dashboard_data ? JSON.parse(p.dashboard_data) : {}; } catch { b = {}; }

    const approach = val(b, K.approach);
    const limbs = val(b, K.limbs);

    const procType = val(b, K.surgeryType);
    const procDate = val(b, K.surgeryDate);
    const surgeon = val(b, K.surgeon);
    const hasProcedure = Boolean(procType || procDate || surgeon);

    const status = {
      weight_bearing_status: val(b, K.wb),
      incision_status: val(b, K.incision),
      activity_restrictions: val(b, K.restrictions),
      clinical_notes: val(b, K.notes),
      e_collar_required: triState(b[K.eCollar]),
      strict_crate_rest: triState(b[K.crate]),
      sling_assist_required: triState(b[K.sling]),
    };
    const hasStatus = Object.values(status).some((v) => v !== null);

    plan.push({ p, approach, limbs, hasProcedure, procType, procDate, surgeon, status, hasStatus });

    console.log('');
    console.log(`  ${p.name}`);
    console.log(`      approach       ${approach || '(none)'}`);
    console.log(`      affected limbs ${limbs || '(none)'}`);
    console.log(`      lesion site    ${p.affected_region || '(none)'}   [not touched]`);
    if (hasProcedure) {
      console.log(`      procedure      ${procType || '(unnamed)'}  ${procDate || '(undated)'}`
        + `${surgeon ? '  ' + surgeon : ''}`);
    } else {
      console.log('      procedure      none recorded');
    }
    if (hasStatus) {
      console.log('      status         '
        + `WB=${show(status.weight_bearing_status)}  incision=${show(status.incision_status)}`);
      console.log('                     '
        + `e-collar=${show(status.e_collar_required)}  crate=${show(status.strict_crate_rest)}`
        + `  sling=${show(status.sling_assist_required)}`);
    } else {
      console.log('      status         none recorded');
    }
  }

  // ── refusals ────────────────────────────────────────────────────────────
  const retired = plan.filter((x) => x.approach && store.RETIRED_APPROACHES.includes(x.approach));
  console.log('');
  rule();
  if (retired.length) {
    console.log('\n  RETIRED APPROACH FOUND — these will NOT be migrated as an approach:');
    for (const x of retired) console.log(`    ${x.p.name}: ${x.approach}`);
    console.log('  Palliative was retired 2026-09-25. The blob keeps the value; a');
    console.log('  clinician replaces it through the panel.');
  }

  const totals = {
    approaches: plan.filter((x) => x.approach && !store.RETIRED_APPROACHES.includes(x.approach)).length,
    limbs: plan.filter((x) => x.limbs).length,
    procedures: plan.filter((x) => x.hasProcedure).length,
    statuses: plan.filter((x) => x.hasStatus).length,
  };
  console.log('');
  console.log(`  ${totals.approaches} approach(es), ${totals.limbs} limb value(s), `
    + `${totals.procedures} procedure(s), ${totals.statuses} status row(s)`);

  if (!APPLY) {
    console.log('\n  DRY RUN — nothing was written.');
    console.log('  To apply:  node scripts/migrate-treatment-to-v3.js --apply\n');
    process.exit(0);
  }

  // ── apply ───────────────────────────────────────────────────────────────
  const actor = { id: 1 };
  const today = new Date().toISOString().slice(0, 10);

  for (const x of plan) {
    const id = x.p.id;
    if (x.approach && !store.RETIRED_APPROACHES.includes(x.approach)) {
      await store.setCase(db, { patientId: id, approach: x.approach, actor });
    }
    if (x.limbs) {
      await store.setCase(db, { patientId: id, affectedLimbs: x.limbs, actor });
    }
    // RE-RUNNABLE. `setCase` is naturally idempotent; these two are not, and
    // the first attempt at this migration died part-way through, so a second
    // run is the normal case rather than the exotic one. Without these guards
    // it would give every surgical patient a duplicate procedure.
    const already = await store.getTreatment(db, id);
    const dupProc = x.hasProcedure && already.procedures.some(
      (r) => r.procedure_type === (x.procType || 'Procedure (type not recorded)')
        && (r.procedure_date || null) === (x.procDate || null)
    );
    const dupStatus = x.hasStatus && already.statusHistory.some(
      (r) => r[store.DATE_UNKNOWN] === 1
    );

    if (x.hasProcedure && dupProc) console.log(`    ${x.p.name}: procedure already migrated, skipped`);
    if (x.hasStatus && dupStatus) console.log(`    ${x.p.name}: status already migrated, skipped`);

    if (x.hasProcedure && !dupProc) {
      await store.addProcedure(db, {
        patientId: id,
        procedure: {
          procedure_type: x.procType || 'Procedure (type not recorded)',
          procedure_date: x.procDate,
          surgeon: x.surgeon,
        },
        actor,
      });
    }
    if (x.hasStatus && !dupStatus) {
      await store.recordStatus(db, {
        patientId: id,
        effectiveDate: today,
        // The date came from this script, not from an examination.
        dateIsUnknown: true,
        status: x.status,
        actor,
      });
    }
    console.log(`    migrated ${x.p.name}`);
  }

  // ── read back what was written ──────────────────────────────────────────
  console.log('');
  rule();
  console.log('\n  READ BACK\n');
  let problems = 0;
  for (const x of plan) {
    const r = await store.getTreatment(db, x.p.id);
    const okApproach = !x.approach || store.RETIRED_APPROACHES.includes(x.approach)
      || r.approach === x.approach;
    const okLimbs = !x.limbs || r.affected_limbs === x.limbs;
    const okProc = !x.hasProcedure || r.procedures.length >= 1;
    const okStatus = !x.hasStatus || r.status !== null;
    const ok = okApproach && okLimbs && okProc && okStatus;
    if (!ok) problems += 1;
    console.log(`    ${x.p.name.padEnd(9)}${ok ? 'ok' : 'MISMATCH'}   `
      + `approach=${r.approach || '-'}  limbs=${r.affected_limbs || '-'}  `
      + `procedures=${r.procedures.length}  status=${r.status ? 'yes' : 'no'}`);

    // The tri-state is the thing worth checking value by value.
    if (r.status) {
      for (const f of store.STATUS_FLAGS) {
        const expected = x.status[f] === null ? null : (x.status[f] ? 1 : 0);
        if (r.status[f] !== expected) {
          problems += 1;
          console.log(`        ${f}: expected ${expected}, got ${r.status[f]}`);
        }
      }
    }
  }

  console.log('');
  if (problems) {
    console.error(`  ${problems} MISMATCH(ES) — the backup is ${path.basename(backup)}\n`);
    process.exit(1);
  }
  console.log('  Everything written read back as written.');
  console.log('  Run `node scripts/audit.js` and `npm run verify`.\n');
})().catch((e) => { console.error(`\n  MIGRATION FAILED: ${e.message}\n`); process.exit(1); });
