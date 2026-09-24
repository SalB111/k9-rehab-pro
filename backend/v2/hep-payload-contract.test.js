/**
 * The HEP payload against its own contract.
 *
 * The contract IS already enforced, by the hand-written validator in the V2
 * suite's hep-contract.test.js — which resolves the store and the schema
 * through V2_ROOT, defaulting to this repo. That validator is the stricter of
 * the two: it checks types, enums and patterns, and this one only checks keys.
 *
 * What it cannot do is run here. It lives in a separate tree that is not in
 * version control, is skipped whenever that tree is unavailable, and builds
 * its patients table with two columns. So it never sees a real record.
 *
 * This check is the complement: fewer rules, real data. The payload is built
 * from the actual version in the actual database, through the real
 * buildHepPayload, so drift is caught in the repo that ships the code even if
 * the V2 tree is not there. A hand-written payload would conform to the schema
 * by construction and prove nothing.
 */

'use strict';

const assert = require('assert');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const protocolStore = require('./protocol-store');
const homeEnvironment = require('./home-environment');
const goalsModule = require('./goals');
const schema = require('./contracts/approved-hep.schema.json');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

const DB_PATH = path.join(__dirname, '..', 'k9rehab.db');
const raw = new DatabaseSync(DB_PATH, { readOnly: true });
const db = {
  get: async (sql, p = []) => raw.prepare(sql).get(...p),
  all: async (sql, p = []) => raw.prepare(sql).all(...p),
};

/**
 * An approval shaped from the real `protocol_approvals` columns.
 *
 * Nothing has been approved yet, so there is no row to read — but the COLUMNS
 * are real, which is the part the payload reads. Inventing field names here
 * would let the payload reference a column that does not exist and still pass.
 */
function approvalFromSchema() {
  const columns = raw.prepare('PRAGMA table_info(protocol_approvals)').all().map((c) => c.name);
  const row = {};
  for (const c of columns) row[c] = `<${c}>`;
  return { row, columns };
}

/** Walk the payload and the schema together, one level of objects deep. */
function conformance(payloadNode, schemaNode, pathLabel, problems) {
  if (!schemaNode || !schemaNode.properties || payloadNode === null || typeof payloadNode !== 'object') return;

  for (const key of Object.keys(payloadNode)) {
    if (!(key in schemaNode.properties)) {
      problems.push(`${pathLabel}.${key} is in the payload but NOT in the contract`);
    }
  }
  for (const key of schemaNode.required || []) {
    if (!(key in payloadNode)) {
      problems.push(`${pathLabel}.${key} is required by the contract but MISSING from the payload`);
    }
  }
  for (const [key, sub] of Object.entries(schemaNode.properties)) {
    if (sub && sub.properties && payloadNode[key] && typeof payloadNode[key] === 'object'
        && !Array.isArray(payloadNode[key])) {
      conformance(payloadNode[key], sub, `${pathLabel}.${key}`, problems);
    }
  }
}

async function buildRealPayload() {
  const version = await db.get(
    `SELECT id FROM protocol_versions ORDER BY id DESC LIMIT 1`
  );
  assert.ok(version, 'no protocol_versions in the database to build a payload from');

  const full = await protocolStore.getVersion(db, version.id);
  const protocol = await db.get(`SELECT * FROM protocols WHERE id = ?`, [full.protocol_id])
    || { id: full.protocol_id, patient_id: null, patient_name: null };

  const { row: approval } = approvalFromSchema();
  const patient = protocol.patient_id
    ? await db.get(`SELECT dashboard_data FROM patients WHERE id = ?`, [protocol.patient_id])
    : null;
  const blob = patient && patient.dashboard_data;
  const home = homeEnvironment.toPayload(homeEnvironment.readFromDashboard(blob));
  const goals = goalsModule.toPayload(goalsModule.readFromDashboard(blob));

  return protocolStore.buildHepPayload(protocol, { ...full, approval }, { home, goals });
}

(async () => {
  console.log('\nHEP payload contract\n');

  await test('the real payload carries no field the contract does not declare', async () => {
    const payload = await buildRealPayload();
    const problems = [];
    conformance(payload, schema, 'payload', problems);
    assert.deepStrictEqual(problems, [], `\n      ${problems.join('\n      ')}`);
  });

  await test('the approval block references only real protocol_approvals columns', async () => {
    const payload = await buildRealPayload();
    const { columns } = approvalFromSchema();
    const strays = Object.entries(payload.approval)
      .filter(([, v]) => v === undefined)
      .map(([k]) => k);
    assert.deepStrictEqual(strays, [],
      `payload.approval reads ${strays.join(', ')}, which protocol_approvals does not have `
      + `(columns: ${columns.join(', ')})`);
  });

  await test('home_environment reaches the payload for a patient whose home is recorded', async () => {
    const patient = raw.prepare(
      `SELECT id, name, dashboard_data FROM patients
        WHERE dashboard_data LIKE '%home::%' ORDER BY id LIMIT 1`
    ).get();
    assert.ok(patient, 'no patient with a recorded home to test against');

    const home = homeEnvironment.toPayload(homeEnvironment.readFromDashboard(patient.dashboard_data));
    assert.ok(home, `${patient.name}: home recorded in V1 but toPayload returned null`);
    assert.ok(Object.keys(home.stated).length >= 7, `${patient.name}: only ${Object.keys(home.stated).length} fields reached the payload`);
    assert.ok(home.normalized.session_minutes > 0, 'session capacity did not reach the payload');
  });

  await test('a patient with no home recorded yields null, not an empty shell', async () => {
    const home = homeEnvironment.toPayload(homeEnvironment.readFromDashboard('{}'));
    assert.strictEqual(home, null);
  });

  await test('goals reach the payload for a patient whose goals are recorded', async () => {
    const patient = raw.prepare(
      `SELECT id, name, dashboard_data FROM patients
        WHERE dashboard_data LIKE '%goals::Primary Rehabilitation Goals%' ORDER BY id LIMIT 1`
    ).get();
    assert.ok(patient, 'no patient with recorded goals to test against');

    const payload = goalsModule.toPayload(goalsModule.readFromDashboard(patient.dashboard_data));
    assert.ok(payload, `${patient.name}: goals recorded in V1 but toPayload returned null`);
    assert.ok(payload.primary_goals.length > 0, `${patient.name}: no primary goal reached the payload`);
    assert.ok(payload.primary_goals.every((g) => g.code),
      `${patient.name}: a real goal reached the payload without a code`);
  });

  await test('a context block omitted by the caller is null, never undefined', async () => {
    // An omitted block must still appear as an explicit null. `undefined`
    // disappears through JSON.stringify, so the key would vanish from the
    // stored payload and a consumer could not tell it from a contract change.
    const version = await db.get(`SELECT id FROM protocol_versions ORDER BY id DESC LIMIT 1`);
    const full = await protocolStore.getVersion(db, version.id);
    const { row: approval } = approvalFromSchema();
    const payload = protocolStore.buildHepPayload({ id: full.protocol_id }, { ...full, approval });
    assert.strictEqual(payload.home_environment, null);
    assert.strictEqual(payload.goals, null);
    assert.ok('goals' in JSON.parse(JSON.stringify(payload)), 'goals vanished through serialization');
  });

  await test('no client PII reaches B.E.A.U.', async () => {
    // The payload gains a context block with every V1 dataset migrated, and
    // the client block is the one that must NOT travel: an address, a phone
    // number, a microchip and an emergency contact have no bearing on how an
    // owner performs an exercise at home.
    //
    // Checked by searching the SERIALIZED payload for the patient's actual
    // recorded values rather than for field names, because the risk is a value
    // riding along inside prose — a clinical note that happens to quote a
    // phone number — not a tidily named field somebody would notice.
    const patient = raw.prepare(
      `SELECT id, name, dashboard_data FROM patients
        WHERE dashboard_data LIKE '%client::Phone%' ORDER BY id LIMIT 1`
    ).get();
    assert.ok(patient, 'no patient with client contact details to test against');

    let blob = {};
    try { blob = JSON.parse(patient.dashboard_data || '{}'); } catch { /* asserted below */ }

    const PRIVATE = [
      'client::Phone', 'client::Email', 'client::Street Address', 'client::Address',
      'client::Zip / Postal Code', 'client::Microchip #', 'client::Emergency Contact',
      'client::Apt / Suite / Unit', 'client::Pet Insurance Provider',
    ];
    const secrets = PRIVATE
      .map((k) => blob[k])
      .filter((v) => v != null && String(v).trim().length >= 5)
      .map(String);
    assert.ok(secrets.length >= 3,
      `expected several private values on ${patient.name} to test against, found ${secrets.length}`);

    const serialized = JSON.stringify(await buildRealPayload());
    const leaked = secrets.filter((v) => serialized.includes(v));
    assert.deepStrictEqual(leaked, [],
      `the handoff payload carries private client data: ${leaked.join(', ')}`);
  });

  await test('the contract still forbids undeclared fields (the check has teeth)', () => {
    assert.strictEqual(schema.additionalProperties, false,
      'the top-level contract stopped forbidding extra fields, so drift would go unnoticed');
    const problems = [];
    conformance({ made_up_field: 1, contract_version: '1.0' }, schema, 'payload', problems);
    assert.ok(problems.some((p) => p.includes('made_up_field')),
      'the conformance walk failed to notice an undeclared field');
  });

  console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
  if (failures.length) { console.log('FAILED'); process.exit(1); }
})();
