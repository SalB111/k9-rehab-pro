/**
 * Clinic equipment has ONE home, and it is Settings — tests
 *
 * WHAT THIS PROTECTS
 *
 * Sal, 2026-09-26: "lets remove the clinic equipment block because its in the
 * settings and which should be the very first thing that should be done when
 * starting with the program".
 *
 * He was right about where it belongs. What he did not know is that the
 * Settings tab was not saving anything: it held a client-side object with its
 * own vocabulary — `underwater_treadmill`, `therapeutic_pool`,
 * `class_iv_laser` — sharing NOT ONE KEY with the engine's `aquatic_access`,
 * `modality_uwtm`, `modality_laser`. Nothing wrote it to a server. Meanwhile
 * the screen displayed:
 *
 *   "Equipment settings gate protocol generation — exercises requiring
 *    unavailable equipment will be excluded automatically"
 *
 * which was simply untrue.
 *
 * WHAT IT COST, measured the day it was fixed: the clinic had 10 of 10
 * capabilities unstated. An unstated capability is WITHHELD from every
 * protocol for every patient, so laser, underwater treadmill and shockwave
 * were being silently excluded from everything B.E.A.U. generated — and the
 * one screen a clinician would open to fix it was connected to nothing.
 *
 * So deleting the dashboard block on its own would have removed the only
 * working path. The block's implementation moved into the tab first.
 *
 *   node v2/clinic-equipment-home.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const clinicStore = require('./clinic-store');
// The clinic the app would resolve, not a guess. There is no clinic 1.
const { resolveClinicId } = require('./resolve-clinic');
const blockState = require('./patient-block-state');

const ROOT = path.join(__dirname, '..', '..');
const TAB = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'settings', 'TabEquipment.jsx');
const SETTINGS_STATE = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'settings', 'useSettingsState.js');
const DASHBOARD = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx');
const REAL_DB = path.join(__dirname, '..', 'k9rehab.db');

/** Source with comments stripped — prose must never satisfy a test. */
const live = (p) => fs.readFileSync(p, 'utf8')
  .split('\n')
  .filter((l) => {
    const t = l.trim();
    return !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
  })
  .join('\n');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve().then(fn)
    .then(() => { passed += 1; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

(async () => {
  console.log('\nclinic-equipment-home\n');

  // ── Settings is the home, and it is really connected ─────────────────────

  await test('the Settings tab reads and writes the real capability store', () => {
    const src = live(TAB);
    assert.ok(
      /\/v2\/clinic\/capabilities/.test(src),
      'Settings > Equipment does not touch /v2/clinic/capabilities, so nothing a '
      + 'clinician ticks there reaches the protocol engine — which is exactly the '
      + 'state this tab was in before'
    );
    assert.ok(/method: "PUT"/.test(src), 'the tab never saves');
  });

  await test('the tab reads the field names the endpoint actually serves', () => {
    // WRITTEN BECAUSE I GOT THIS WRONG, minutes after moving the panel. The
    // endpoint returns `checklistShape` and `gatingItems`; I read `shape` and
    // `gating`, so the screen rendered an empty list — no error, no warning,
    // just a settings page with nothing on it and ten capabilities that could
    // never be answered.
    //
    // The build passed. It always does for this kind of mistake.
    const src = live(TAB);
    assert.ok(
      /d\.checklistShape/.test(src),
      'the tab does not read `checklistShape`, so it renders no equipment at all'
    );
    assert.ok(
      /d\.gatingItems/.test(src),
      'the tab does not read `gatingItems`, so nothing is marked as gating a therapy'
    );
    for (const wrong of ['d.shape', 'd.gating ']) {
      assert.ok(
        !src.includes(wrong),
        `the tab reads "${wrong}", which the endpoint does not return`
      );
    }
  });

  await test('the Settings tab holds no second copy of the vocabulary', () => {
    const src = live(TAB);
    // The endpoint SERVES the field shape. A list hard-coded in the screen is
    // how the old tab drifted out of the engine's reach.
    assert.ok(/state\.shape/.test(src), 'the tab does not render the served shape');
    for (const dead of ['underwater_treadmill', 'therapeutic_pool', 'class_iv_laser']) {
      assert.ok(
        !src.includes(dead),
        `"${dead}" is back in the screen. That vocabulary shares no key with the `
        + 'engine, and hard-coding a list here is what made the old tab a no-op.'
      );
    }
  });

  await test('the fake client-side equipment store is gone', () => {
    const src = live(SETTINGS_STATE);
    assert.ok(
      !/const \[equipment, setEquipment\] = useState/.test(src),
      'useSettingsState holds an equipment object again. Two stores for one fact '
      + 'is the problem this whole migration exists to remove.'
    );
    assert.ok(
      !/^\s*equipment, setEquipment,\s*$/m.test(src),
      'the hook still returns equipment/setEquipment, which are no longer '
      + 'defined — a ReferenceError that the build cannot see'
    );
  });

  // ── the dashboard no longer asks a clinic question per patient ───────────

  await test('the dashboard has no Equipment block', () => {
    const src = live(DASHBOARD);
    assert.ok(!/function EquipmentPanel\(/.test(src), 'EquipmentPanel is back in the dashboard');
    assert.ok(
      !/id:"equipment"/.test(src),
      'the equipment tile is back in BLOCKS — it is a property of the clinic, '
      + 'not of a patient, and asking per chart is asking the wrong question'
    );
    assert.ok(!/equipment:EquipmentPanel/.test(src), 'BLOCK_COMPS still maps the equipment block');
  });

  await test('block state no longer reports equipment as a patient block', () => {
    assert.ok(
      !Object.prototype.hasOwnProperty.call(blockState.BLOCK_SOURCE, 'equipment'),
      'equipment is back in BLOCK_SOURCE, so the dashboard would draw a dot for '
      + 'a block that no longer exists'
    );
  });

  // ── the check that would have caught the original drift ──────────────────

  await test('every capability the engine gates on is answerable on the screen', async () => {
    // THE DEFECT THAT MADE THE OLD TAB USELESS, as a standing check. If a
    // capability key is renamed or added and the shape the endpoint serves
    // does not follow, a clinician can never answer it — and an unanswered
    // capability is WITHHELD from every protocol, silently, forever.
    //
    // Driven through the real store: this is the shape getCapabilities()
    // actually hands the screen, not a constructed stand-in.
    if (!fs.existsSync(REAL_DB)) { console.log('      (no live database — skipped)'); return; }
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = {
      get: async (sql, p = []) => raw.prepare(sql).get(...p),
      all: async (sql, p = []) => raw.prepare(sql).all(...p),
      run: async () => { throw new Error('read-only'); },
    };
    const caps = await clinicStore.getCapabilities(db, await resolveClinicId(db));
    raw.close();

    const served = (caps.checklistShape || []).flatMap((g) => g.items || []);
    assert.ok(served.length > 0, 'the endpoint serves no field shape at all');

    const gating = caps.gatingItems || [];
    assert.ok(gating.length > 0, 'nothing is reported as gating a therapy');
    const unreachable = gating.filter((k) => !served.includes(k));
    assert.deepStrictEqual(
      unreachable, [],
      'the engine gates on equipment the Settings screen never offers, so it '
      + `can never be answered and stays withheld: ${unreachable.join(', ')}`
    );
  });

  await test('nothing asks for a clinic by a hardcoded number', async () => {
    // THE MISTAKE THIS EXISTS FOR, 2026-09-26. Scripts and tests passed a
    // literal `1` to getCapabilities. There is no clinic 1 — the table holds
    // ids 3 and 5 — and getCapabilities answers for an unknown clinic with a
    // perfectly plausible EMPTY RECORD rather than an error.
    //
    // So the audit, drive-flow and three suites spent a day reporting
    // "10 of 10 capabilities unstated, every gated therapy withheld" about a
    // clinic that had never existed, and I told Sal his equipment had not
    // saved when it had.
    const files = [
      path.join(ROOT, 'scripts', 'drive-flow.js'),
      path.join(ROOT, 'scripts', 'audit.js'),
      __filename,
      path.join(__dirname, 'patient-block-state.test.js'),
    ].filter((p) => fs.existsSync(p));

    const offenders = [];
    for (const f of files) {
      const src = live(f);
      const m = src.match(/getCapabilities\(\s*db\s*,\s*\d+\s*\)/g);
      if (m) offenders.push(`${path.basename(f)}: ${m.join(', ')}`);
    }
    assert.deepStrictEqual(
      offenders, [],
      'a clinic is being asked for by number instead of resolved the way the app '
      + `resolves it:\n      ${offenders.join('\n      ')}`
    );
  });

  await test('[KNOWN] an unknown clinic reads as "nothing configured"', async () => {
    // Documented rather than changed. The HTTP path always resolves a real
    // clinic, so this never bites the app — but it is why a hardcoded id in a
    // script produced a confident, wrong finding rather than an error.
    //
    // If this ever starts throwing, that is an improvement: delete this test.
    if (!fs.existsSync(REAL_DB)) { console.log('      (no live database — skipped)'); return; }
    const raw = new DatabaseSync(REAL_DB, { readOnly: true });
    const db = {
      get: async (sql, p = []) => raw.prepare(sql).get(...p),
      all: async (sql, p = []) => raw.prepare(sql).all(...p),
      run: async () => { throw new Error('read-only'); },
    };
    // Named, not a literal: the guard above forbids asking for a clinic by
    // number, and it is right to. This one is deliberate.
    const GHOST_CLINIC = 999999;
    const ghost = await clinicStore.getCapabilities(db, GHOST_CLINIC);
    raw.close();
    assert.strictEqual(
      ghost.configured, false,
      'an unknown clinic now reports as configured, which would be worse'
    );
    assert.strictEqual(
      (ghost.unstated || []).length, clinicStore.CAPABILITY_KEYS.length,
      'a clinic that does not exist reports every capability unstated — '
      + 'indistinguishable from a real clinic nobody has set up'
    );
  });

  await test('every gating key maps to an engine input', () => {
    for (const key of clinicStore.CAPABILITY_KEYS) {
      assert.ok(
        clinicStore.CAPABILITY_TO_ENGINE_INPUT[key],
        `${key} gates nothing — it is offered to a clinician but reaches no engine input`
      );
    }
  });

  if (failures.length) {
    console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
    process.exit(1);
  }
  console.log(`\nclinic-equipment-home: ${passed} passed\n`);
})();
