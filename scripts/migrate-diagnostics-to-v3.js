#!/usr/bin/env node
/**
 * V3 — fold diagnostics out of `dashboard_data` and into their own table.
 *
 * Each imaging modality on record becomes one study. All the laboratory panels
 * from a record become ONE lab study, because one draw is one study — that is
 * how the results are reported and read.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 * It does not SPLIT a findings text into several studies, even where the text
 * plainly describes several. "T13-L1 ... No myelomalacia. Post-op MRI at 8w
 * showed appropriate decompression" is two studies to a clinician — and
 * deciding which finding belongs to which is a clinical reading, not a parse.
 * Those records are migrated whole and REPORTED, so a clinician can split them.
 *
 * It does not INFER `performed_on`. "at 8w" is a point in a recovery, not a
 * date: it depends on a surgery date this table does not own. The one date V1
 * actually recorded — `Lab Date` — is carried across, because that is a stated
 * date and not a reading of prose.
 *
 * It does not delete anything from `dashboard_data`.
 *
 * Idempotent on (patient, source_field).
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const APPLY = process.argv.includes('--apply');
const DB_PATH = process.env.K9_DB || path.join(__dirname, '..', 'backend', 'k9rehab.db');
const V2 = path.join(__dirname, '..', 'backend', 'v2');

const diagnostics = require(path.join(V2, 'diagnostics'));
const store = require(path.join(V2, 'patient-diagnostics-store'));

const raw = new DatabaseSync(DB_PATH, { readOnly: !APPLY });
const db = {
  get: async (sql, p = []) => raw.prepare(sql).get(...p),
  all: async (sql, p = []) => raw.prepare(sql).all(...p),
  run: async (sql, p = []) => {
    const r = raw.prepare(sql).run(...p);
    return { lastID: Number(r.lastInsertRowid), changes: r.changes };
  },
};

const ACTOR = {
  id: Number(process.env.MIGRATION_ACTOR_ID || 1),
  username: 'migrate-diagnostics-to-v3',
  role: 'admin',
};

(async () => {
  console.log(`\n  ${APPLY ? 'APPLYING' : 'DRY RUN'} — ${DB_PATH}\n`);
  await store.assertSchema(db);

  const patients = await db.all('SELECT id, name, dashboard_data FROM patients ORDER BY id');
  let studies = 0;
  let skipped = 0;
  const toSplit = [];

  for (const p of patients) {
    const record = diagnostics.read(p.dashboard_data);
    if (!record) { console.log(`  ${p.name}: no diagnostics in the blob`); continue; }

    const planned = [];

    for (const img of record.imaging) {
      planned.push({
        category: diagnostics.CATEGORY.IMAGING,
        modality: img.modality,
        findings: img.findings,
        // No date is recorded per modality in either V1 shape.
        performedOn: null,
        sourceField: `imaging:${img.modality}`,
      });
    }

    if (record.labs.length || record.notes.lab_results) {
      planned.push({
        category: diagnostics.CATEGORY.LAB,
        panels: record.labs,
        // The one stated date V1 holds. Carried because it was recorded, not read.
        performedOn: record.notes.lab_date || null,
        findings: record.notes.lab_results || record.notes.clinical || null,
        sourceField: 'lab:draw',
      });
    }

    if (!planned.length) { console.log(`  ${p.name}: nothing to migrate`); continue; }

    console.log(`  ${p.name} (id ${p.id}) — ${planned.length} studies`);
    for (const s of planned) {
      const label = s.category === 'IMAGING' ? s.modality : `Lab (${(s.panels || []).join(', ') || 'no panels'})`;
      const multi = diagnostics.describesMultipleStudies(s.findings);
      console.log(`      ${label.padEnd(30)} ${s.performedOn || 'no date'}`
        + `${multi ? '   ← describes MORE THAN ONE study; split it' : ''}`);
      if (multi) toSplit.push(`${p.name}: ${label}`);
    }

    if (APPLY) {
      for (const s of planned) {
        const existing = await db.get(
          `SELECT id FROM ${store.TABLE} WHERE patient_id = ? AND source_field = ?`,
          [p.id, s.sourceField]
        );
        if (existing) { skipped += 1; continue; }
        await store.addStudy(db, { patientId: p.id, actor: ACTOR, ...s });
        studies += 1;
      }
      const back = await store.getStudies(db, p.id);
      if (back.studies.length < planned.length) {
        console.error(`      MISMATCH: expected at least ${planned.length}, read ${back.studies.length}`);
        process.exit(1);
      }
      console.log(`      written and read back (${back.studies.length} studies, ${back.summary.undated} undated)`);
    }
    console.log('');
  }

  console.log(`  ${studies} studies${skipped ? `, ${skipped} already migrated` : ''}`);
  if (toSplit.length) {
    console.log(`\n  ${toSplit.length} records describe MORE THAN ONE study in one findings text.`);
    console.log('  They are migrated whole — splitting them is a clinical reading, not a parse:');
    for (const t of toSplit) console.log(`      ${t}`);
  }
  console.log(APPLY
    ? '\n  Written. `dashboard_data` was NOT modified — the old keys remain, unread.\n'
    : '\n  Nothing written. Re-run with --apply to write.\n');
})().catch((err) => { console.error('\n  FAILED:', err.message, '\n'); process.exit(1); });
