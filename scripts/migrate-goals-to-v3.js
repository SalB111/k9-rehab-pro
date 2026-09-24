#!/usr/bin/env node
/**
 * V3 — fold the goals block out of `dashboard_data` and into its own tables.
 *
 * The goal SET (selected rehabilitation goals, owner priority and
 * expectations) becomes one `patient_goals` row. The four prose goal fields
 * and the owner's own words become `patient_goal_items` — one item per field,
 * VERBATIM.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 * It does not SPLIT a prose field into several goals. "Achieve 4/5
 * weight-bearing at trot within 2 weeks. ROM flexion 125°, extension 160°.
 * HCPI < 12." is plainly three goals to a clinician, and cutting it into three
 * would be this script inventing clinical records. Each field migrates as one
 * item; a clinician can split them, and only a clinician should.
 *
 * It does not set a TARGET DATE. Parsing one from the text was tried against
 * these very records: "thigh circumference within 1 cm bilaterally" and "jump
 * grids (12 in)" both matched a "within N units" pattern — a tolerance and a
 * jump height read as a fortnight and twelve months. Items that mention a
 * period are REPORTED so a clinician can set the date.
 *
 * It does not delete anything from `dashboard_data`. The keys stay, inert.
 *
 * Idempotent: one item per (patient, source_field). Re-running updates the
 * text rather than duplicating the goal, and never touches a status.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const APPLY = process.argv.includes('--apply');
const DB_PATH = process.env.K9_DB || path.join(__dirname, '..', 'backend', 'k9rehab.db');
const V2 = path.join(__dirname, '..', 'backend', 'v2');

const goals = require(path.join(V2, 'goals'));
const store = require(path.join(V2, 'patient-goals-store'));

const raw = new DatabaseSync(DB_PATH, { readOnly: !APPLY });
const db = {
  get: async (sql, p = []) => raw.prepare(sql).get(...p),
  all: async (sql, p = []) => raw.prepare(sql).all(...p),
  run: async (sql, p = []) => raw.prepare(sql).run(...p),
};

const ACTOR_ID = Number(process.env.MIGRATION_ACTOR_ID || 1);
const ACTOR = { id: ACTOR_ID, username: 'migrate-goals-to-v3', role: 'admin' };

(async () => {
  console.log(`\n  ${APPLY ? 'APPLYING' : 'DRY RUN'} — ${DB_PATH}\n`);
  await store.assertSchema(db);

  const patients = await db.all('SELECT id, name, dashboard_data FROM patients ORDER BY id');
  let sets = 0;
  let items = 0;
  let skipped = 0;
  const needDates = [];

  for (const p of patients) {
    const stated = goals.readFromDashboard(p.dashboard_data);
    if (!Object.keys(stated).length) { console.log(`  ${p.name}: no goals in the blob`); continue; }

    const setInput = {};
    for (const key of store.SET_COLUMNS) if (stated[key] !== undefined) setInput[key] = stated[key];

    const itemInputs = store.ITEM_FIELDS
      .filter((f) => stated[f.key] !== undefined)
      .map((f) => ({ field: f, text: stated[f.key] }));

    console.log(`  ${p.name} (id ${p.id}) — ${Object.keys(setInput).length} set fields, ${itemInputs.length} goals`);
    for (const k of Object.keys(setInput)) {
      console.log(`      set   ${k.padEnd(24)} ${JSON.stringify(String(setInput[k]).slice(0, 48))}`);
    }
    for (const { field, text } of itemInputs) {
      const flag = goals.mentionsTimeframe(text) ? '  ← mentions a period; needs a target date' : '';
      console.log(`      goal  ${(field.item.horizon + '/' + field.item.kind).padEnd(18)} ${JSON.stringify(String(text).slice(0, 44))}${flag}`);
      if (goals.mentionsTimeframe(text)) needDates.push(`${p.name}: ${field.label}`);
    }

    if (APPLY) {
      if (Object.keys(setInput).length) {
        await store.setGoalSet(db, { patientId: p.id, set: setInput, actor: ACTOR });
        sets += 1;
      }
      for (const { field, text } of itemInputs) {
        const existing = await db.get(
          `SELECT id FROM ${store.ITEM_TABLE} WHERE patient_id = ? AND source_field = ?`,
          [p.id, field.key]
        );
        if (existing) {
          skipped += 1;
          console.log(`      (already migrated: ${field.key})`);
          continue;
        }
        await store.addGoalItem(db, {
          patientId: p.id,
          horizon: field.item.horizon,
          kind: field.item.kind,
          goalText: text,
          sourceField: field.key,
          actor: ACTOR,
        });
        items += 1;
      }

      // Read it back. A migration that reports success without checking is how
      // "228 tests pass" got claimed while three were failing.
      const back = await store.getGoals(db, p.id);
      for (const { field, text } of itemInputs) {
        const found = back.items.find((i) => i.source_field === field.key);
        if (!found || found.goal_text !== String(text).trim()) {
          console.error(`      MISMATCH after write: ${field.key}`);
          process.exit(1);
        }
      }
      console.log(`      written and read back identical (${back.items.length} goals, ${back.review.unreviewed} unreviewed)`);
    }
    console.log('');
  }

  console.log(`  ${sets} goal sets, ${items} goals${skipped ? `, ${skipped} already migrated` : ''}`);
  if (needDates.length) {
    console.log(`\n  ${needDates.length} goals mention a period but have NO target date.`);
    console.log('  A date is not inferred from the text — a clinician sets it:');
    for (const n of needDates) console.log(`      ${n}`);
  }
  console.log(APPLY
    ? '\n  Written. `dashboard_data` was NOT modified — the old keys remain, unread.\n'
    : '\n  Nothing written. Re-run with --apply to write.\n');
})().catch((err) => { console.error('\n  FAILED:', err.message, '\n'); process.exit(1); });
