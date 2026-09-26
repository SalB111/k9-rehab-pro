/**
 * Block state — tests
 *
 * WHAT THIS PROTECTS
 *
 * The dashboard draws a dot on every block card, and it computed that dot by
 * counting keys in `patients.dashboard_data`. Six blocks have their own
 * tables now and the dot never followed.
 *
 * Measured on Haley, 2026-09-26, before this existed: her Home and Goals
 * cards showed NO DOT AT ALL — reading as untouched — while
 * `patient_home_environment` held her home and `patient_goal_items` held
 * "able to hike in the mountains within the next 6 months".
 *
 * A clinician looking at that dashboard cannot answer "what still needs
 * doing", which is the only question the dots exist to answer. Worse, it is
 * the failure mode that makes a clinician distrust every dot on the page.
 *
 *   node v2/patient-block-state.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const bs = require('./patient-block-state');
const clinicStore = require('./clinic-store');

const REAL_DB = path.join(__dirname, '..', 'k9rehab.db');
const DASHBOARD = path.join(
  __dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx'
);

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve().then(fn)
    .then(() => { passed += 1; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

function open() {
  const raw = new DatabaseSync(REAL_DB, { readOnly: true });
  return {
    raw,
    db: {
      get: async (sql, p = []) => raw.prepare(sql).get(...p),
      all: async (sql, p = []) => raw.prepare(sql).all(...p),
      run: async () => { throw new Error('read-only'); },
    },
  };
}

(async () => {
  console.log('\npatient-block-state\n');

  await test('a block whose store holds a record is not reported empty', async () => {
    // The original defect, asserted against live data rather than a fixture:
    // find any patient with rows in a V3 table and check the block is not
    // reported as empty. No patient is named, so this survives Sal working.
    const { raw, db } = open();
    const pairs = [
      ['home', 'patient_home_environment'],
      ['goals', 'patient_goal_items'],
      ['treatment', 'patient_treatment_status'],
      ['diagnostics', 'patient_diagnostic_studies'],
    ];
    const wrong = [];
    let checked = 0;
    for (const [block, table] of pairs) {
      const row = raw.prepare(
        `SELECT patient_id FROM ${table} GROUP BY patient_id LIMIT 1`
      ).get();
      if (!row) continue;
      checked += 1;
      const patient = await db.get('SELECT * FROM patients WHERE id = ?', [row.patient_id]);
      const caps = await clinicStore.getCapabilities(db, 1);
      const state = await bs.getBlockState(db, row.patient_id, patient, caps);
      if (!state[block] || state[block].status === 'empty') {
        wrong.push(`${block}: has rows in ${table} but reports ${state[block] && state[block].status}`);
      }
    }
    raw.close();
    assert.ok(checked > 0, 'no V3 table had any rows — the check proved nothing');
    assert.deepStrictEqual(wrong, [], wrong.join('\n      '));
  });

  await test('a store block is read from the store, never from the blob', async () => {
    const { raw, db } = open();
    const patient = await db.get('SELECT * FROM patients ORDER BY id LIMIT 1');
    const caps = await clinicStore.getCapabilities(db, 1);
    const state = await bs.getBlockState(db, patient.id, patient, caps);
    raw.close();
    for (const [block, source] of Object.entries(bs.BLOCK_SOURCE)) {
      if (source === 'none') { assert.ok(!state[block], `${block} should not be reported`); continue; }
      assert.ok(state[block], `${block} is missing from the report`);
      assert.strictEqual(state[block].source, source,
        `${block} answered from ${state[block].source}, expected ${source}`);
    }
  });

  await test('a block with no store of its own still counts blob keys', async () => {
    // Assessment has no table. Counting its keys was never wrong — it was
    // only wrong for the blocks that had moved. The fix must not overshoot.
    const { raw, db } = open();
    const patient = await db.get(
      "SELECT * FROM patients WHERE dashboard_data LIKE '%assessment::%' LIMIT 1"
    );
    if (!patient) { raw.close(); return; }
    const caps = await clinicStore.getCapabilities(db, 1);
    const state = await bs.getBlockState(db, patient.id, patient, caps);
    raw.close();
    assert.strictEqual(state.assessment.source, 'blob');
    assert.ok(state.assessment.count > 0, 'assessment keys were not counted');
  });

  await test('an unreadable store is reported unknown, not empty', async () => {
    // "Empty" is a claim about the record. If a store throws, the claim we
    // can honestly make is about the code, so it must not be dressed up as a
    // finding about the patient.
    const { raw, db } = open();
    const patient = await db.get('SELECT * FROM patients ORDER BY id LIMIT 1');
    const broken = { ...db, all: async () => { throw new Error('boom'); },
      get: async (sql, p) => (/patient_home_environment|patient_goals|patient_treatment/.test(sql)
        ? (() => { throw new Error('boom'); })() : db.get(sql, p)) };
    const state = await bs.getBlockState(broken, patient.id, patient, { configured: true });
    raw.close();
    const statuses = Object.values(state).map((s) => s.status);
    assert.ok(statuses.includes('unknown'), 'a throwing store was not reported as unknown');
    assert.ok(!statuses.includes(undefined), 'a block came back with no status at all');
  });

  // ── the stage ────────────────────────────────────────────────────────────

  await test('a patient with no visit is NONE, not INTAKE', async () => {
    const { raw, db } = open();
    const none = raw.prepare(
      'SELECT id FROM patients WHERE id NOT IN (SELECT patient_id FROM visits) LIMIT 1'
    ).get();
    if (!none) { raw.close(); console.log('      (every patient has a visit — skipped)'); return; }
    const s = await bs.stageOf(db, none.id);
    raw.close();
    assert.strictEqual(s.stage, bs.STAGE.NONE,
      'a patient nobody has opened a visit for is not "at intake" — the '
      + 'dashboard simply never opened one');
  });

  await test('a reassessment is NOT reported as intake', async () => {
    // The first version returned INTAKE for anyone without an ADMISSION row,
    // which labelled four patients mid-programme as if they had just walked
    // in. IN_PROGRAMME says the true thing: past intake, no admission
    // recorded, because the concept did not exist when they were registered.
    const { raw, db } = open();
    const r = raw.prepare(
      "SELECT patient_id FROM visits WHERE UPPER(visit_type) IN ('RECHECK','REASSESSMENT','DISCHARGE') LIMIT 1"
    ).get();
    if (!r) { raw.close(); return; }
    const s = await bs.stageOf(db, r.patient_id);
    raw.close();
    assert.notStrictEqual(s.stage, bs.STAGE.INTAKE,
      `a patient with a post-intake visit was reported as ${s.stage}`);
    assert.ok([bs.STAGE.IN_PROGRAMME, bs.STAGE.ADMISSION].includes(s.stage),
      `unexpected stage ${s.stage}`);
  });

  await test('the stage requirements are empty until a clinician writes them', () => {
    // Deliberate. Which blocks an intake must capture before admission is a
    // clinical judgement. While this is empty nothing is wrongly flagged;
    // when Sal fills it, this test tells whoever reads it that it was HIS
    // list and not one I invented.
    for (const stage of ['INTAKE', 'ADMISSION']) {
      const r = bs.STAGE_REQUIREMENTS[stage];
      assert.ok(r, `${stage} has no entry`);
      assert.ok(Array.isArray(r.required), `${stage}.required must be a list`);
    }
  });

  // ── the screen must actually use it ──────────────────────────────────────

  await test('the dashboard no longer decides the dot by counting blob keys', () => {
    const src = fs.readFileSync(DASHBOARD, 'utf8');
    const live = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    // NOT "the blob count is gone" — it is still the fallback for a failed
    // fetch, and removing it would blank every dot on a network blip. What
    // must hold is the PREFERENCE: the server's answer first, the blob count
    // only when there is no server answer. The first version of this
    // assertion could not tell those apart and failed against the fix.
    assert.ok(
      /served\s*\?\s*served\.status/.test(live),
      'the dot does not prefer the served block state, so a block that has '
      + 'moved to its own table is still judged by its leftover blob keys'
    );
    const order = /const dataStatus = ([\s\S]{0,240}?);/.exec(live);
    assert.ok(order, 'the dot computation could not be found');
    assert.ok(
      order[1].indexOf('served') >= 0
        && order[1].indexOf('served') < order[1].indexOf('blockKeys.length'),
      'the blob count is consulted before the served state'
    );
    // `live`, not `src`. The comment explaining this fix says "block-state"
    // several times, so checking the raw source passed against a mutation
    // that pointed the fetch at a different endpoint entirely. A test for
    // what the code DOES must not be satisfiable by what the code SAYS —
    // the second time that has bitten today.
    assert.ok(
      /\/block-state`/.test(live),
      'the dashboard does not fetch the block-state endpoint, so the dots '
      + 'cannot know what the stores hold'
    );
  });

  if (failures.length) {
    console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
    process.exit(1);
  }
  console.log(`\npatient-block-state: ${passed} passed\n`);
})();
