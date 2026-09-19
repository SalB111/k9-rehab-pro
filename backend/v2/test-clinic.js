#!/usr/bin/env node
/**
 * K9 Clinical Workflow V2 — TEST-CLINIC
 *
 *   node v2/test-clinic.js setup      Build the test environment
 *   node v2/test-clinic.js status     What exists right now
 *   node v2/test-clinic.js reset      Remove everything setup created
 *
 * WHY A SEPARATE CLINIC
 * Integration work needs realistic patients without touching real clinical
 * records. Test patients here are COPIES of real ones — same conditions, same
 * shape of data — created as new rows. Real records are read, never written.
 *
 * WHY FIXTURES ARE TRACKED IN A TABLE
 * Reset deletes by recorded id, not by matching a name prefix. A real patient
 * named "TEST — something" must never be deleted by a teardown.
 *
 * THE PATIENT SET
 * Five conditions chosen to exercise five different paths through the engine's
 * safety gates, because a test clinic where every case is a routine TPLO proves
 * very little:
 *
 *   IVDD neurological       — neuro exam, phase lock, deep-pain gate
 *   TPLO post-operative     — incision status, weight-bearing progression
 *   Bilateral hip OA        — OA staging, impact-loading exclusion
 *   Conservative CCL        — non-surgical path, different protocol routing
 *   Feline lumbosacral      — species handling, geriatric/comfort routing
 */

'use strict';

require('dotenv').config({ override: true });

const path = require('path');
const db = require(path.join(__dirname, '..', 'db-provider'));
const authority = require('./authority');
const clinicStore = require('./clinic-store');
const schema = require('./schema');

const CLINIC_NAME = 'TEST-CLINIC';
const PREFIX = 'TEST — ';

/**
 * Real patients to copy, by name. Each exercises a different gate path.
 * Missing ones are skipped rather than failing the run — this has to work
 * against whatever database it finds.
 */
const SOURCE_PATIENTS = ['Winston', 'Bella', 'Charlie', 'Luna', 'Misty'];

/**
 * Equipment a mid-sized rehab clinic plausibly has. Deliberately NOT everything:
 * shockwave and PEMF are left explicitly unavailable so the enablement gates are
 * genuinely exercised. A test clinic that owns every machine never proves the
 * withholding logic works.
 */
const TEST_EQUIPMENT = {
  aquatic_access: true,
  modality_uwtm: true,
  modality_laser: true,
  modality_tens: true,
  modality_nmes: true,
  modality_therapeutic_us: true,
  modality_cryotherapy: true,
  modality_heat_therapy: true,
  modality_shockwave: false,
  modality_pulsed_emf: false,
};

/**
 * Test staff, mirroring a real rehab team. The CCRP account exists to prove the
 * credential path: it can approve only because a current certificate is on file,
 * and stops being able to the moment that lapses.
 */
const TEST_USERS = [
  { username: 'test.vet', role: 'veterinarian', label: 'Rehab veterinarian (approves by licensure)' },
  { username: 'test.ccrt', role: 'rehab_practitioner', label: 'CCRP (approves on a current credential)',
    credential: { credential: 'CCRP', license_number: 'TEST-CCRP-001', issuing_body: 'TEST', valid_until: '2030-01-01' } },
  { username: 'test.tech', role: 'technician', label: 'Technician (records, cannot approve)' },
];

// A placeholder hash. These accounts are for workflow testing; a password must
// be set deliberately with `node v2/access.js password <username>` before any
// of them can actually sign in.
const UNUSABLE_HASH = '$2b$10$' + 'x'.repeat(53);

async function track(kind, refId, label) {
  await db.run(`INSERT INTO test_fixtures (kind, ref_id, label) VALUES (?, ?, ?)`, [kind, refId, label ?? null]);
}

async function fixtures(kind) {
  return db.all(`SELECT * FROM test_fixtures WHERE kind = ? ORDER BY id`, [kind]);
}

// ---------------------------------------------------------------------------

async function setup() {
  console.log('\nTEST-CLINIC setup');
  console.log('─'.repeat(64));

  // ── Clinic ───────────────────────────────────────────────────────────────
  let clinic = await db.get(`SELECT * FROM clinics WHERE clinic_name = ?`, [CLINIC_NAME]);
  if (!clinic) {
    const created = await db.run(`INSERT INTO clinics (clinic_name) VALUES (?)`, [CLINIC_NAME]);
    clinic = { id: created.lastID, clinic_name: CLINIC_NAME };
    await track('clinic', clinic.id, CLINIC_NAME);
    console.log(`  clinic       created (id ${clinic.id})`);
  } else {
    console.log(`  clinic       exists  (id ${clinic.id})`);
  }

  // ── Equipment ────────────────────────────────────────────────────────────
  const actor = await db.get(`SELECT id, username, role FROM users WHERE lower(role) = 'admin' ORDER BY id LIMIT 1`);
  if (!actor) {
    console.log('\n  No admin user to attribute changes to. Run: node v2/access.js grant <you> admin\n');
    return;
  }
  await clinicStore.setCapabilities(db, { clinicId: clinic.id, capabilities: TEST_EQUIPMENT, actor });
  const owned = Object.entries(TEST_EQUIPMENT).filter(([, v]) => v).length;
  console.log(`  equipment    ${owned} available, ${Object.keys(TEST_EQUIPMENT).length - owned} explicitly not`);
  console.log('               (shockwave and PEMF off on purpose — exercises the withholding logic)');

  // ── Staff ────────────────────────────────────────────────────────────────
  for (const spec of TEST_USERS) {
    let user = await db.get(`SELECT * FROM users WHERE username = ?`, [spec.username]);
    if (!user) {
      const created = await db.run(
        `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
        [spec.username, UNUSABLE_HASH, spec.role]
      );
      user = { id: created.lastID, username: spec.username };
      await track('user', user.id, spec.username);
      console.log(`  user         ${spec.username.padEnd(12)} ${spec.role}`);
    } else {
      await db.run(`UPDATE users SET role = ? WHERE id = ?`, [spec.role, user.id]);
      console.log(`  user         ${spec.username.padEnd(12)} ${spec.role} (existing)`);
    }

    if (spec.credential) {
      const held = await db.get(
        `SELECT id FROM clinician_credentials WHERE user_id = ? AND credential = ? AND status = 'ACTIVE'`,
        [user.id, spec.credential.credential]
      );
      if (!held) {
        const row = await authority.addCredential(db, {
          userId: user.id,
          credential: spec.credential.credential,
          licenseNumber: spec.credential.license_number,
          issuingBody: spec.credential.issuing_body,
          validUntil: spec.credential.valid_until,
          verifiedBy: actor.id,
        });
        await track('credential', row.id, `${spec.username} ${spec.credential.credential}`);
        console.log(`               └ ${spec.credential.credential} recorded (test certificate, not a real one)`);
      }
    }
  }

  // ── Patients (copies) ────────────────────────────────────────────────────
  const columns = (await db.all(`PRAGMA table_info(patients)`)).map((c) => c.name).filter((c) => c !== 'id');

  for (const name of SOURCE_PATIENTS) {
    const source = await db.get(`SELECT * FROM patients WHERE name = ? ORDER BY id LIMIT 1`, [name]);
    if (!source) { console.log(`  patient      ${name.padEnd(12)} not found — skipped`); continue; }

    const testName = PREFIX + source.name;
    const already = await db.get(`SELECT id FROM patients WHERE name = ?`, [testName]);
    if (already) { console.log(`  patient      ${testName.padEnd(20)} exists (id ${already.id})`); continue; }

    // Copy every column the real record has, so the test patient is the same
    // SHAPE of data — including the gaps. Testing against a tidied-up copy
    // would hide exactly the field-mismatch defects worth finding.
    const values = columns.map((c) => (c === 'name' ? testName : source[c]));
    const created = await db.run(
      `INSERT INTO patients (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values
    );
    await track('patient', created.lastID, testName);
    console.log(`  patient      ${testName.padEnd(20)} id ${created.lastID} · ${source.condition || 'no condition'}`);
  }

  console.log('\n  Real patient records were read, never modified.');
  console.log('  Test accounts have no usable password — set one with:');
  console.log('    node v2/access.js password test.vet\n');
  await status();
}

async function status() {
  const clinic = await db.get(`SELECT * FROM clinics WHERE clinic_name = ?`, [CLINIC_NAME]);
  console.log('\nTEST-CLINIC status');
  console.log('─'.repeat(64));
  if (!clinic) {
    console.log('  Not set up. Run: node v2/test-clinic.js setup\n');
    return;
  }
  console.log(`  clinic       ${CLINIC_NAME} (id ${clinic.id})`);

  const caps = await clinicStore.getCapabilities(db, clinic.id);
  const on = clinicStore.CAPABILITY_KEYS.filter((k) => caps.capabilities[k] === true);
  const off = clinicStore.CAPABILITY_KEYS.filter((k) => caps.capabilities[k] === false);
  console.log(`  equipment    ${on.length} available · ${off.length} not available · ${caps.unstated.length} unstated`);

  for (const kind of ['user', 'patient', 'credential']) {
    const rows = await fixtures(kind);
    if (!rows.length) continue;
    console.log(`  ${(kind + 's').padEnd(12)} ${rows.length}`);
    for (const r of rows) console.log(`               ${r.label} (id ${r.ref_id})`);
  }

  const patientIds = (await fixtures('patient')).map((r) => r.ref_id);
  if (patientIds.length) {
    const placeholders = patientIds.map(() => '?').join(',');
    const visits = await db.get(
      `SELECT COUNT(*) n FROM visits WHERE patient_id IN (${placeholders})`, patientIds);
    const protocols = await db.get(
      `SELECT COUNT(*) n FROM protocols WHERE patient_id IN (${placeholders})`, patientIds);
    console.log(`  activity     ${visits.n} visits · ${protocols.n} protocols on test patients`);
  }
  console.log('');
}

async function reset() {
  console.log('\nTEST-CLINIC reset');
  console.log('─'.repeat(64));

  const patients = await fixtures('patient');
  const patientIds = patients.map((r) => r.ref_id);

  // Clinical records first — they reference the patients.
  if (patientIds.length) {
    const ph = patientIds.map(() => '?').join(',');
    const versions = await db.all(
      `SELECT pv.id FROM protocol_versions pv JOIN protocols p ON p.id = pv.protocol_id
        WHERE p.patient_id IN (${ph})`, patientIds);
    const versionIds = versions.map((v) => v.id);

    if (versionIds.length) {
      const vp = versionIds.map(() => '?').join(',');
      for (const table of ['protocol_version_exercises', 'protocol_version_restrictions',
                           'protocol_approvals', 'visit_protocol_versions']) {
        await db.run(`DELETE FROM ${table} WHERE version_id IN (${vp})`, versionIds);
      }
    }
    for (const table of ['beau_handoffs', 'protocol_audit_events', 'visit_measurements',
                         'visit_assessments', 'visits']) {
      await db.run(`DELETE FROM ${table} WHERE patient_id IN (${ph})`, patientIds);
    }
    await db.run(`DELETE FROM protocol_versions WHERE protocol_id IN (SELECT id FROM protocols WHERE patient_id IN (${ph}))`, patientIds);
    await db.run(`DELETE FROM protocols WHERE patient_id IN (${ph})`, patientIds);
    await db.run(`DELETE FROM patients WHERE id IN (${ph})`, patientIds);
    console.log(`  patients     ${patientIds.length} removed, with their clinical records`);
  }

  for (const row of await fixtures('credential')) {
    await db.run(`DELETE FROM clinician_credentials WHERE id = ?`, [row.ref_id]);
  }
  for (const row of await fixtures('user')) {
    // Never remove the system owner, whatever the fixtures table claims.
    if (await authority.isSystemOwner(db, row.ref_id)) {
      console.log(`  user         ${row.label} is the system owner — kept`);
      continue;
    }
    await db.run(`DELETE FROM users WHERE id = ?`, [row.ref_id]);
  }
  console.log('  staff        test accounts and credentials removed');

  for (const row of await fixtures('clinic')) {
    await db.run(`DELETE FROM clinic_capabilities WHERE clinic_id = ?`, [row.ref_id]);
    await db.run(`DELETE FROM clinics WHERE id = ?`, [row.ref_id]);
  }
  await db.run(`DELETE FROM test_fixtures`);
  console.log('  clinic       removed\n  Real patients and records untouched.\n');
}

// ---------------------------------------------------------------------------

(async () => {
  const command = process.argv[2] || 'status';
  try {
    await db.initialize();
    await schema.applyAll(db, { logger: { log() {}, warn() {} } });

    if (command === 'setup') await setup();
    else if (command === 'reset') await reset();
    else if (command === 'status') await status();
    else {
      console.log('\n  node v2/test-clinic.js [setup|status|reset]\n');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`\n  ${err.message}\n`);
    process.exitCode = 1;
  } finally {
    if (typeof db.close === 'function') await db.close().catch(() => {});
  }
})();
