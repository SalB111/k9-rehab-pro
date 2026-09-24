#!/usr/bin/env node
/**
 * V3 — fold the client block's address, contacts, cover and identification out
 * of `dashboard_data` and into `patient_client_details`.
 *
 * Only the 13 fields that had NO home anywhere. The demographics — name,
 * species, breed, age, weight, sex, date of birth, client name, email, phone,
 * referring vet — already have columns, are already the source of truth, and
 * are already reconciled by record-sync. They are not touched.
 *
 * WHAT IT DOES NOT DO
 *
 * It does not SPLIT a single-line address. One record stores the whole thing
 * under a different key — "1111 11th street Fort Lauderdale FL 33309" —
 * and deciding where the street ends and the city begins is a parse of
 * somebody's address that gets it wrong the first time a street is named after
 * a city. It migrates whole into `street_address` with
 * `address_is_unstructured` set, and is REPORTED so a clinician can separate it.
 *
 * It does not delete anything from `dashboard_data`.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const APPLY = process.argv.includes('--apply');
const DB_PATH = process.env.K9_DB || path.join(__dirname, '..', 'backend', 'k9rehab.db');
const store = require(path.join(__dirname, '..', 'backend', 'v2', 'patient-client-store'));

const raw = new DatabaseSync(DB_PATH, { readOnly: !APPLY });
const db = {
  get: async (s, p = []) => raw.prepare(s).get(...p),
  all: async (s, p = []) => raw.prepare(s).all(...p),
  run: async (s, p = []) => {
    const r = raw.prepare(s).run(...p);
    return { lastID: Number(r.lastInsertRowid), changes: r.changes };
  },
};

const ACTOR = {
  id: Number(process.env.MIGRATION_ACTOR_ID || 1),
  username: 'migrate-client-details-to-v3',
  role: 'admin',
};

/** V1 label -> column. The structured address keys. */
const MAP = {
  'Street Address': 'street_address',
  'Apt / Suite / Unit': 'apt_suite_unit',
  City: 'city',
  'State / Province': 'state_province',
  'Zip / Postal Code': 'postal_code',
  Country: 'country',
  'Emergency Contact': 'emergency_contact',
  'Pet Insurance Provider': 'insurance_provider',
  'Primary Veterinarian': 'primary_veterinarian',
  'Specialist / Surgeon': 'specialist_surgeon',
  'Microchip #': 'microchip',
  'Color / Markings': 'colour_markings',
};

/** The one-line form, stored under its own key by one record. */
const UNSTRUCTURED_KEY = 'Address';

(async () => {
  console.log(`\n  ${APPLY ? 'APPLYING' : 'DRY RUN'} — ${DB_PATH}\n`);
  await store.assertSchema(db);

  const patients = await db.all('SELECT id, name, dashboard_data FROM patients ORDER BY id');
  let migrated = 0;
  let fields = 0;
  const unstructured = [];

  for (const p of patients) {
    let blob = {};
    try { blob = JSON.parse(p.dashboard_data || '{}'); } catch { /* reported below */ }

    const details = {};
    for (const [label, column] of Object.entries(MAP)) {
      const v = blob[`client::${label}`];
      if (v === undefined || v === null || String(v).trim() === '') continue;
      details[column] = String(v).trim();
    }

    // The one-line address, only where no structured street is recorded.
    let flag = false;
    const oneLine = blob[`client::${UNSTRUCTURED_KEY}`];
    if (oneLine && String(oneLine).trim() && !details.street_address) {
      details.street_address = String(oneLine).trim();
      flag = true;
      unstructured.push(`${p.name}: ${String(oneLine).trim()}`);
    }

    if (!Object.keys(details).length) { console.log(`  ${p.name}: no client details in the blob`); continue; }

    console.log(`  ${p.name} (id ${p.id}) — ${Object.keys(details).length} fields`
      + `${flag ? '   ← address is ONE LINE, not separated' : ''}`);
    for (const [c, v] of Object.entries(details)) {
      console.log(`      ${c.padEnd(22)} ${JSON.stringify(v.slice(0, 46))}`);
    }
    fields += Object.keys(details).length;
    migrated += 1;

    if (APPLY) {
      const existing = await db.get(`SELECT patient_id FROM ${store.TABLE} WHERE patient_id = ?`, [p.id]);
      if (existing) { console.log('      (already migrated — refusing to overwrite)'); console.log(''); continue; }
      await store.setClient(db, {
        patientId: p.id, details, addressIsUnstructured: flag, actor: ACTOR,
      });
      const back = await store.getClient(db, p.id);
      const lost = Object.keys(details).filter((c) => back.details[c] !== details[c]);
      if (lost.length) { console.error(`      MISMATCH: ${lost.join(', ')}`); process.exit(1); }
      console.log(`      written and read back identical (${Object.keys(back.details).length} fields)`);
    }
    console.log('');
  }

  console.log(`  ${migrated} patients, ${fields} fields`);
  if (unstructured.length) {
    console.log(`\n  ${unstructured.length} address${unstructured.length === 1 ? '' : 'es'} arrived as ONE LINE and `
      + 'were not separated — splitting one is a parse of somebody\'s address:');
    for (const u of unstructured) console.log(`      ${u}`);
  }
  console.log(APPLY
    ? '\n  Written. `dashboard_data` was NOT modified — the old keys remain, unread.\n'
    : '\n  Nothing written. Re-run with --apply to write.\n');
})().catch((e) => { console.error(`\n  FAILED: ${e.message}\n`); process.exit(1); });
