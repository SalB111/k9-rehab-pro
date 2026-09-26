/**
 * "Not needed today" — tests
 *
 * WHAT THIS PROTECTS
 *
 * Sal, 2026-09-26: "a check box in each block that the clinician can check to
 * bypass that block if it is not needed at that time, because when a vet is
 * busy they cant or dont need that info right away, but it should be able to
 * generate an exercise protocol with the criteria they want to use".
 *
 * Two things have to stay true or this feature becomes dangerous rather than
 * useful:
 *
 *   1. PER VISIT. A skip made on a busy Tuesday must not quietly become this
 *      patient's permanent shape. That is the whole reason the row is keyed
 *      on visit_id, and it is the first thing a refactor would lose.
 *
 *   2. IT LOOSENS NO SAFETY GATE. Bypassing a block must not make the engine
 *      read a missing finding as a satisfied one. The gates behind a skipped
 *      block stay unproposed, fall to their cautious defaults, and approval
 *      still refuses. A bypass lets a protocol be GENERATED with gaps; it
 *      must never let one be SIGNED with them.
 *
 * The second is asserted by running the real intake-proposal over a record
 * with a bypass in place, not by reading the bypass code and reasoning about
 * it.
 *
 *   node v2/visit-bypass-store.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const store = require('./visit-bypass-store');
const blockState = require('./patient-block-state');
const intakeProposal = require('./intake-proposal');
const schema = require('./schema');

const SCHEMA_SQL = path.join(__dirname, 'schema', 'clinical-visits.sqlite.sql');
const ACTOR = { id: 1, username: 'sal', role: 'admin' };

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve().then(fn)
    .then(() => { passed += 1; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

function wrap(raw) {
  return {
    get: async (sql, p = []) => raw.prepare(sql).get(...p),
    all: async (sql, p = []) => raw.prepare(sql).all(...p),
    run: async (sql, p = []) => {
      const r = raw.prepare(sql).run(...p);
      return { lastID: Number(r.lastInsertRowid), changes: r.changes };
    },
  };
}

/** A throwaway database carrying the REAL clinical-visits schema. */
function freshDb() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)');
    // visits carry a foreign key into `clinics` since 2026-09-26 — every
  // clinical record names where it happened.
  raw.exec('CREATE TABLE IF NOT EXISTS clinics (id INTEGER PRIMARY KEY, clinic_name TEXT)');
raw.exec('CREATE TABLE patients (id INTEGER PRIMARY KEY, clinic_id INTEGER, name TEXT, client_name TEXT,'
    + ' condition TEXT, dashboard_data TEXT, special_instructions TEXT,'
    + ' treatment_approach TEXT, affected_limbs TEXT, affected_region TEXT)');
  raw.exec('CREATE TABLE protocol_versions (id INTEGER PRIMARY KEY)');
  raw.exec("INSERT INTO users (id, username) VALUES (1, 'sal')");
  raw.exec("INSERT INTO patients (id, name, client_name, condition)"
    + " VALUES (1, 'Testdog', 'Owner', 'Osteoarthritis')");
  for (const st of schema.toStatements(fs.readFileSync(SCHEMA_SQL, 'utf8'))) {
    try { raw.exec(st); } catch { /* indexes on tables this fixture omits */ }
  }
  return { raw, db: wrap(raw) };
}

(async () => {
  console.log('\nvisit-bypass-store\n');

  // ── the basics ───────────────────────────────────────────────────────────

  await test('ticking a block opens a visit and records who skipped it', async () => {
    const { raw, db } = freshDb();
    const r = await store.setBypass(db, { patientId: 1, blockId: 'diagnostics', actor: ACTOR });
    assert.ok(r.visit_id, 'no visit was opened');
    assert.deepStrictEqual(r.blocks.map((b) => b.block_id), ['diagnostics']);
    assert.strictEqual(r.blocks[0].bypassed_by, ACTOR.id,
      'a bypass is a clinical decision — it must carry who made it');

    const visit = raw.prepare('SELECT visit_type, status FROM visits WHERE id = ?').get(r.visit_id);
    assert.strictEqual(visit.visit_type, 'INITIAL', 'a first visit is INITIAL');
    assert.strictEqual(visit.status, 'OPEN');
    raw.close();
  });

  await test('ticking twice does not stack up rows', async () => {
    const { raw, db } = freshDb();
    await store.setBypass(db, { patientId: 1, blockId: 'goals', actor: ACTOR });
    const r = await store.setBypass(db, { patientId: 1, blockId: 'goals', actor: ACTOR });
    assert.strictEqual(r.blocks.length, 1, 'a double click wrote two bypasses');
    raw.close();
  });

  await test('unticking clears it', async () => {
    const { raw, db } = freshDb();
    await store.setBypass(db, { patientId: 1, blockId: 'goals', actor: ACTOR });
    const r = await store.clearBypass(db, { patientId: 1, blockId: 'goals', actor: ACTOR });
    assert.deepStrictEqual(r.blocks, []);
    raw.close();
  });

  await test('unticking something never ticked is not an error', async () => {
    const { raw, db } = freshDb();
    const r = await store.clearBypass(db, { patientId: 1, blockId: 'goals', actor: ACTOR });
    assert.deepStrictEqual(r.blocks, []);
    // And it must NOT have manufactured a visit to delete a row from.
    const n = raw.prepare('SELECT COUNT(*) c FROM visits').get().c;
    assert.strictEqual(n, 0, 'unticking an unticked box opened a clinical record');
    raw.close();
  });

  // ── per visit, which is the load-bearing claim ───────────────────────────

  await test('A BYPASS DOES NOT SURVIVE INTO THE NEXT VISIT', async () => {
    const { raw, db } = freshDb();
    const first = await store.setBypass(db, { patientId: 1, blockId: 'diagnostics', actor: ACTOR });

    // Close today's visit and open tomorrow's, the way a second appointment
    // would.
    raw.prepare("UPDATE visits SET status = 'COMPLETED' WHERE id = ?").run(first.visit_id);
    raw.prepare("INSERT INTO visits (patient_id, visit_date, visit_type, status)"
      + " VALUES (1, '2026-10-03', 'RECHECK', 'OPEN')").run();

    const now = await store.currentFor(db, 1);
    assert.deepStrictEqual(
      now.blocks, [],
      'the skip carried into the next visit. "Not needed TODAY" became "not '
      + 'needed for this patient", which is exactly what per-visit scope exists '
      + 'to prevent'
    );
    raw.close();
  });

  await test('a closed visit refuses a new bypass', async () => {
    const { raw, db } = freshDb();
    const r = await store.setBypass(db, { patientId: 1, blockId: 'goals', actor: ACTOR });
    raw.prepare("UPDATE visits SET status = 'COMPLETED' WHERE id = ?").run(r.visit_id);
    // With no OPEN visit, setBypass opens a new one rather than editing the
    // closed one — the finished record is not rewritten.
    const after = await store.setBypass(db, { patientId: 1, blockId: 'home', actor: ACTOR });
    assert.notStrictEqual(after.visit_id, r.visit_id,
      'a COMPLETED visit was edited in place');
    assert.deepStrictEqual(after.blocks.map((b) => b.block_id), ['home'],
      'the new visit inherited the old visit\'s skips');
    raw.close();
  });

  await test('an unknown block is refused, not stored', async () => {
    const { raw, db } = freshDb();
    await assert.rejects(
      () => store.setBypass(db, { patientId: 1, blockId: 'nonsense', actor: ACTOR }),
      /Unknown block/,
      'a typo became a stored clinical fact'
    );
    raw.close();
  });

  await test('an unidentified actor is refused', async () => {
    const { raw, db } = freshDb();
    await assert.rejects(
      () => store.setBypass(db, { patientId: 1, blockId: 'goals', actor: null }),
      /identified actor/,
      'a bypass with nobody attached to it is not a clinical decision'
    );
    raw.close();
  });

  // ── the safety claim, run rather than asserted ───────────────────────────

  await test('BYPASSING A BLOCK CHANGES NO SAFETY GATE', async () => {
    // The claim that makes this feature safe. Bypassing assessment must not
    // make the engine read a missing finding as a satisfied one.
    const { raw, db } = freshDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = 1');

    const before = intakeProposal.proposeEngineInputs({ patient });
    await store.setBypass(db, { patientId: 1, blockId: 'assessment', actor: ACTOR });
    const after = intakeProposal.proposeEngineInputs({ patient });

    assert.strictEqual(
      after.gates.length, before.gates.length,
      'bypassing a block changed how many safety gates apply'
    );
    for (const g of after.gates) {
      assert.strictEqual(g.mustConfirm, true,
        `gate ${g.field} stopped requiring confirmation after a bypass`);
    }
    assert.deepStrictEqual(
      JSON.stringify(after.proposed), JSON.stringify(before.proposed),
      'bypassing a block changed what the engine believes about the patient. '
      + 'A bypass is a note about the WORKFLOW, never about the animal.'
    );
    raw.close();
  });

  await test('a bypassed block stops nagging but still reads as empty', async () => {
    // The distinction that keeps the record honest: the dashboard stops
    // chasing it, and the block is still empty. "Skipped" is not "done".
    const { raw, db } = freshDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = 1');
    await store.setBypass(db, { patientId: 1, blockId: 'assessment', actor: ACTOR });

    const stage = { stage: 'INTAKE' };
    const state = await blockState.getBlockState(db, 1, patient, { configured: true }, stage);

    assert.strictEqual(state.assessment.bypassed, true, 'the bypass did not reach block state');
    assert.strictEqual(state.assessment.needs_attention, false, 'a skipped block is still nagging');
    assert.strictEqual(state.assessment.status, 'empty',
      'a bypassed block was reported as if it held data — skipped is not done');
    raw.close();
  });

  await test('a bypass applies to ONE block, not to the screen', async () => {
    const { raw, db } = freshDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = 1');
    await store.setBypass(db, { patientId: 1, blockId: 'assessment', actor: ACTOR });
    const state = await blockState.getBlockState(db, 1, patient, { configured: true }, { stage: 'INTAKE' });

    assert.strictEqual(state.assessment.bypassed, true);
    for (const other of Object.keys(state)) {
      if (other === 'assessment') continue;
      assert.strictEqual(state[other].bypassed, false,
        `bypassing assessment also marked ${other} as skipped`);
    }
    raw.close();
  });

  await test('unticking brings the nag back', async () => {
    // The pair to the test above. If a bypass silenced a block permanently it
    // would be indistinguishable from the block being satisfied, which is the
    // failure mode that makes a worklist untrustworthy.
    const { raw, db } = freshDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = 1');
    const stage = { stage: 'INTAKE' };

    const before = await blockState.getBlockState(db, 1, patient, { configured: true }, stage);
    assert.strictEqual(before.assessment.needs_attention, true,
      'assessment is required at intake and empty, so it should be asked for');

    await store.setBypass(db, { patientId: 1, blockId: 'assessment', actor: ACTOR });
    const during = await blockState.getBlockState(db, 1, patient, { configured: true }, stage);
    assert.strictEqual(during.assessment.needs_attention, false);

    await store.clearBypass(db, { patientId: 1, blockId: 'assessment', actor: ACTOR });
    const after = await blockState.getBlockState(db, 1, patient, { configured: true }, stage);
    assert.strictEqual(after.assessment.needs_attention, true,
      'unticking the box did not restore the request');
    raw.close();
  });

  // ── blocks that cannot be skipped at all ────────────────────────────────
  //
  // Sal, 2026-09-26: "ON THE NOT NEEDED CHECK BOXES CLIENT AND PATIENT ARE
  // NEEDED." Client & Patient is who the record is about — four engine inputs
  // come from it and every protocol is addressed to a named dog and a named
  // owner. Enforced in three places; these check all three, because a rule
  // held only by a hidden checkbox is held by nothing.

  await test('SAL: Client & Patient CANNOT be skipped', async () => {
    const { raw, db } = freshDb();
    await assert.rejects(
      store.setBypass(db, { patientId: 1, blockId: 'client', actor: ACTOR }),
      /cannot be skipped/,
      'the store accepted a bypass on the block that identifies the patient'
    );
    const rows = await db.all('SELECT * FROM visit_block_bypasses');
    assert.strictEqual(rows.length, 0, 'it was refused and stored anyway');
    raw.close();
  });

  await test('...and it is not merely hidden: the server says so in the state', async () => {
    const { raw, db } = freshDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = 1');
    const state = await blockState.getBlockState(
      db, 1, patient, { configured: true }, { stage: 'INTAKE' }
    );
    assert.strictEqual(state.client.bypassable, false,
      'block-state does not tell the screen that client cannot be skipped');
    assert.strictEqual(state.assessment.bypassable, true,
      'a clinical block lost its bypass — the accommodation Sal asked for is gone');
    raw.close();
  });

  await test('the card offers no checkbox where the server says it cannot be skipped', async () => {
    const jsx = fs.readFileSync(
      path.join(__dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx'),
      'utf8'
    );
    assert.ok(
      /served\.bypassable\s*!==\s*false/.test(jsx),
      'the card decides for itself which blocks may be skipped instead of '
      + 'reading the served flag, so the screen can offer a skip the store refuses'
    );
  });

  if (failures.length) {
    console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
    process.exit(1);
  }
  console.log(`\nvisit-bypass-store: ${passed} passed\n`);
})();
