/**
 * Protocol Summary reads the stores — tests
 *
 * WHAT THIS PROTECTS
 *
 * The Protocol Summary is the page a clinician reads BEFORE SIGN-OFF. Until
 * 2026-09-26 it read 8 `dashboard_data` keys belonging to two blocks that had
 * already been migrated to their own tables — 2 goals and 6 treatment — and
 * the readers were never repointed.
 *
 * Nothing caught it, because MERGED was defined as three tests:
 *
 *   1. the block has its own table
 *   2. the ENGINE does not read the blob
 *   3. the PANEL does not write the blob
 *
 * None of them asks whether some OTHER SCREEN still reads it. ProtocolPanel is
 * exactly that fourth thing, and goals and treatment passed all three tests
 * while being wrong on this page.
 *
 * What it cost, on the live database:
 *
 *   Haley    blank for all 8, while her record held FWB, her activity
 *            restrictions, a goal item and her owner's priority
 *   Winston  the summary showed "Partial weight bearing (PWB)" while his
 *            record said "Full weight bearing (FWB)" — the blob had kept a
 *            value his store superseded eight hours earlier
 *
 * The second is the one that matters: not a blank field, a STALE CLINICAL
 * VALUE presented as current, on the sign-off page.
 *
 * These tests read the REAL DashboardView.jsx and run the REAL stores against
 * the REAL database. The panel's own expressions are extracted and evaluated
 * rather than reimplemented — a test that recomputes the mapping would agree
 * with itself no matter what the panel does.
 *
 *   node v2/protocol-summary.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { DatabaseSync } = require('node:sqlite');

const goalsStore = require('./patient-goals-store');
const treatmentStore = require('./patient-treatment-store');

const DASHBOARD = path.join(
  __dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx'
);
const REAL_DB = path.join(__dirname, '..', 'k9rehab.db');

const src = fs.readFileSync(DASHBOARD, 'utf8');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve().then(fn)
    .then(() => { passed += 1; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

/**
 * The production db contract, not node:sqlite's raw shape.
 * Same wrapper as patient-goals-store.test.js — sqlite-provider resolves
 * { lastID, changes }; a test wrapper that differs proves something
 * production never does.
 */
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

/** ProtocolPanel's source, comments stripped so prose cannot satisfy a test. */
const PANEL = (() => {
  const i = src.indexOf('function ProtocolPanel(');
  assert.ok(i > 0, 'ProtocolPanel could not be found — has it been renamed?');
  const j = src.indexOf('\nfunction ', i + 10);
  assert.ok(j > i, 'ProtocolPanel could not be delimited');
  return src.slice(i, j)
    .split('\n')
    .filter((l) => {
      const t = l.trim();
      return !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
    })
    .join('\n');
})();

/** The 8 keys that must never come back. */
const RETIRED = [
  'goals::Primary Rehabilitation Goals',
  'goals::Short-Term Clinical Goals',
  'treatment::Weight Bearing Status',
  'treatment::Incision Status',
  'treatment::Approach',
  'treatment::Affected Limb(s)',
  'treatment::Surgery Type',
  'treatment::Surgery Date',
];

/**
 * Run the panel's OWN derivation lines against a supplied store payload.
 * Extracted from the file, never retyped here.
 */
function derive({ treatment = null, goals = null, data = {} }) {
  const block = /\/\/ ── Treatment, from[\s\S]*?\.join\("; "\);/.exec(src)
    || /const tx = stores\.treatment;[\s\S]*?\.join\("; "\);/.exec(src);
  assert.ok(block, 'the store-derivation block could not be found in ProtocolPanel');

  const ctx = { stores: { loading: false, treatment, goals }, data, module: { exports: {} } };
  vm.createContext(ctx);
  vm.runInContext(
    block[0]
    + '\nmodule.exports = { liveApproach, liveSurgeryType, liveSurgeryDate,'
    + ' liveWBStatus, liveRegion, liveGoalsList, liveShortTerm, txStatus };',
    ctx
  );
  return ctx.module.exports;
}

(async () => {
  console.log('\nprotocol-summary\n');

  // ── 1. shape: the panel must not go back to the blob ─────────────────────

  await test('the Protocol Summary reads none of the 8 retired blob keys', () => {
    const back = RETIRED.filter((k) => PANEL.includes(k));
    assert.deepStrictEqual(
      back, [],
      `the Protocol Summary is reading dashboard_data again for: ${back.join(', ')}. `
      + 'Those blocks own their own tables; the blob copy is stale by construction.'
    );
  });

  await test('it fetches both stores it reports on', () => {
    assert.ok(
      /v2\/patients\/\$\{patientId\}\/goals/.test(PANEL),
      'the goals store is never fetched, so the goals shown are whatever was left behind'
    );
    assert.ok(
      /v2\/patients\/\$\{patientId\}\/treatment/.test(PANEL),
      'the treatment store is never fetched'
    );
  });

  await test('the blocks with no store of their own still read the blob', () => {
    // The fix must not overshoot. Assessment, client, conditioning and
    // protocol are untouched or PARTIAL — the blob IS their correct source,
    // and cutting them over would blank the summary rather than fix it.
    for (const k of ['assessment::Chief Complaint', 'client::Patient Name',
      'conditioning::Conditioning Phase']) {
      assert.ok(PANEL.includes(k), `${k} should still be read from the record`);
    }
  });

  // ── 2. behaviour: the panel's own expressions, on real payloads ──────────

  await test('a store payload is what the summary reports', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const tx = await treatmentStore.getTreatment(wrap(raw), 33); // Haley
    raw.close();

    const out = derive({ treatment: tx });
    assert.strictEqual(
      out.liveWBStatus, (tx.status && tx.status.weight_bearing_status) || '',
      'the weight-bearing status shown must be the store\'s current row'
    );
    assert.ok(
      out.liveWBStatus,
      'Haley has a recorded weight-bearing status; a blank here is the original bug'
    );
  });

  await test('THE WINSTON CASE — the store wins over a stale blob', async () => {
    // Winston held two status rows for 2026-09-25: PWB at 04:30, then FWB at
    // 12:56. The blob kept PWB. This drives the panel's own expression with
    // BOTH records present and asserts which one comes out.
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = wrap(raw);
    const tx = await treatmentStore.getTreatment(db, 12);
    const row = await db.get('SELECT dashboard_data FROM patients WHERE id = 12');
    raw.close();

    const blob = JSON.parse(row.dashboard_data || '{}');
    const blobWB = blob['treatment::Weight Bearing Status'] || '';
    const storeWB = (tx.status && tx.status.weight_bearing_status) || '';

    // Not asserted as fixed strings: the point holds however his record reads
    // today, and pinning the values would break the moment Sal reassesses him.
    if (!blobWB || !storeWB || blobWB === storeWB) {
      console.log('      (no live disagreement on Winston right now — shape still checked)');
    }

    const out = derive({ treatment: tx, data: blob });
    assert.strictEqual(
      out.liveWBStatus, storeWB,
      'the summary must show the store value'
    );
    if (blobWB && blobWB !== storeWB) {
      assert.notStrictEqual(
        out.liveWBStatus, blobWB,
        `the summary is still showing the superseded blob value ${JSON.stringify(blobWB)} `
        + `instead of ${JSON.stringify(storeWB)} — this is the sign-off page`
      );
    }
  });

  await test('goals recorded only in the store reach the summary', async () => {
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const gl = await goalsStore.getGoals(wrap(raw), 33); // Haley
    raw.close();

    const out = derive({ goals: gl });
    const expected = (gl.primary_goals || []).map((g) => g.stated).filter(Boolean);
    // Array.from: the value crosses a vm context boundary, so its prototype
    // is not the host Array and deepStrictEqual compares prototypes.
    assert.deepStrictEqual(
      Array.from(out.liveGoalsList), expected,
      'the primary goals shown must come from patient_goals'
    );
    assert.ok(
      (gl.items || []).length > 0,
      'Haley has a goal item — if this fails the fixture patient changed, not the code'
    );
  });

  await test('an unloaded store is not reported as an empty record', async () => {
    // liveApproach is half of hasRequiredFields, which gates the generate
    // button. While the fetch is in flight every store value is "", so the
    // panel must not read that as "this record is incomplete".
    const out = derive({ treatment: null, goals: null });
    assert.strictEqual(out.liveWBStatus, '', 'a null store must not throw');
    assert.strictEqual(out.liveApproach, '');
    assert.deepStrictEqual(Array.from(out.liveGoalsList), []);
    assert.ok(
      /!stores\.loading/.test(PANEL),
      'canGenerate must wait for the stores — otherwise the button flashes '
      + '"missing required fields" over a complete record'
    );
  });

  await test('the incision flag reads the store, and keeps the assessment term', async () => {
    const m = /const incision = ([^;]+);/.exec(PANEL);
    assert.ok(m, 'the incision derivation could not be found');
    assert.ok(
      m[1].includes('assessment::Incision Status'),
      'the assessment term must stay — that block is untouched and still owns the blob'
    );
    assert.ok(
      /txStatus\s*&&\s*txStatus\.incision_status/.test(m[1]),
      'the treatment term must come from patient_treatment_status. It fed the red '
      + 'dehiscence/infection flag, which silently stopped firing for the treatment path'
    );
  });

  // ── 3. the rule that would have caught this class ────────────────────────

  await test('no OTHER panel reads a merged block\'s blob keys', () => {
    // The fourth test that MERGED was missing. A panel may read its OWN
    // block's keys; reading another block's migrated keys is the defect.
    const OWNER = { goals: 'GoalsPanel', treatment: 'TreatmentPanel' };
    const offenders = [];
    for (const [fn, body] of panels()) {
      for (const key of RETIRED) {
        const block = key.split('::')[0];
        if (fn === OWNER[block]) continue;
        if (body.includes(key)) offenders.push(`${fn} reads ${key}`);
      }
    }
    assert.deepStrictEqual(
      offenders, [],
      `a screen is reading a migrated block's blob keys:\n      ${offenders.join('\n      ')}`
    );
  });

  function panels() {
    const out = [];
    const re = /\nfunction ([A-Z][A-Za-z0-9_]*)\s*\(/g;
    let m;
    const marks = [];
    while ((m = re.exec(src))) marks.push({ name: m[1], at: m.index });
    for (let i = 0; i < marks.length; i += 1) {
      const end = i + 1 < marks.length ? marks[i + 1].at : src.length;
      const body = src.slice(marks[i].at, end)
        .split('\n')
        .filter((l) => { const t = l.trim(); return !t.startsWith('//') && !t.startsWith('*'); })
        .join('\n');
      out.push([marks[i].name, body]);
    }
    return out;
  }

  if (failures.length) {
    console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
    process.exit(1);
  }
  console.log(`\nprotocol-summary: ${passed} passed\n`);
})();
