/**
 * Treatment store (V3) — tests
 *
 * WHAT THIS PROTECTS
 *
 * Treatment is the first V3 block that feeds the protocol ENGINE, and two of
 * the three engine inputs with no column anywhere are treatment fields — both
 * safety gates:
 *
 *     weightBearingStatus  <- treatment::Weight Bearing Status
 *     incisionStatus       <- treatment::Incision Status
 *
 * So the tests below care most about the three ways this store could lose or
 * invent a clinical fact:
 *
 *   1. A STATUS ROW MUST NEVER BE UPDATED IN PLACE. Weight bearing goes
 *      NWB -> TTWB -> PWB -> FWB and the progression IS the clinical record.
 *      An UPDATE leaves a chart that says where a patient is and never where
 *      they were.
 *
 *   2. TRI-STATE MUST SURVIVE. NULL is "nobody answered", 0 is "a clinician
 *      said no". The e-collar and crate-rest gates DEFAULT TO REQUIRED in the
 *      acute window, so turning silence into "no" relaxes both.
 *
 *   3. A PARTIAL WRITE MUST NOT BLANK WHAT IT DID NOT MENTION. Updating
 *      weight-bearing at a re-check does not say the incision is now unknown.
 *
 *   node v2/patient-treatment-store.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const store = require('./patient-treatment-store');

let passed = 0;
const failures = [];
function test(name, fn) {
  return fn().then(() => { passed += 1; })
    .catch((err) => { failures.push({ name, message: err.message }); });
}

function wrap(raw) {
  return {
    get: async (sql, p = []) => raw.prepare(sql).get(...p),
    all: async (sql, p = []) => raw.prepare(sql).all(...p),
    // The PRODUCTION contract: sqlite-provider resolves { lastID, changes }.
    run: async (sql, p = []) => {
      const r = raw.prepare(sql).run(...p);
      return { lastID: Number(r.lastInsertRowid), changes: r.changes };
    },
  };
}

/** The REAL schema file, so a column added there and not here cannot pass. */
const SCHEMA = fs.readFileSync(
  path.join(__dirname, 'schema', 'patient-treatment.sqlite.sql'), 'utf8'
);

function freshDb() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)');
  raw.exec(`CREATE TABLE patients (
    id INTEGER PRIMARY KEY, name TEXT, condition TEXT, affected_region TEXT,
    treatment_approach TEXT, affected_limbs TEXT
  )`);
  // Strip comments the way schema.js does, then apply.
  const sql = SCHEMA.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
  for (const stmt of sql.split(';')) {
    if (stmt.trim()) raw.exec(stmt);
  }
  raw.prepare('INSERT INTO users (id, username) VALUES (1, ?)').run('sal');
  raw.prepare('INSERT INTO patients (id, name) VALUES (7, ?)').run('Bella');
  return wrap(raw);
}

const ACTOR = { id: 1 };

(async () => {
  // ── schema ──────────────────────────────────────────────────────────────
  await test('assertSchema accepts the real schema file', async () => {
    const db = freshDb();
    assert.strictEqual(await store.assertSchema(db), true);
  });

  await test('assertSchema refuses when the patient columns are missing', async () => {
    const raw = new DatabaseSync(':memory:');
    raw.exec('CREATE TABLE users (id INTEGER PRIMARY KEY)');
    raw.exec('CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT)');
    const sql = SCHEMA.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
    for (const stmt of sql.split(';')) if (stmt.trim()) raw.exec(stmt);
    await assert.rejects(
      () => store.assertSchema(wrap(raw)),
      /missing: treatment_approach, affected_limbs/,
      'a clinician answer to a column that does not exist is accepted and discarded'
    );
  });

  // ── the case ────────────────────────────────────────────────────────────
  await test('an approach and a limb are stored', async () => {
    const db = freshDb();
    const r = await store.setCase(db, {
      patientId: 7, approach: 'Surgical', affectedLimbs: 'Right hindlimb (RH)', actor: ACTOR,
    });
    assert.strictEqual(r.approach, 'Surgical');
    assert.strictEqual(r.affected_limbs, 'Right hindlimb (RH)');
  });

  await test('PALLIATIVE is refused as a new approach, and says what to use', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.setCase(db, { patientId: 7, approach: 'Palliative', actor: ACTOR }),
      (e) => /retired/i.test(e.message) && /Surgical/.test(e.message),
      'the retired pathway got back in through the API'
    );
  });

  await test('but a stored PALLIATIVE still READS, and is flagged as retired', async () => {
    // A legacy row, an import, a restored backup. Refusing to read it would
    // make the value invisible and permanent instead of visible and fixable.
    const db = freshDb();
    await db.run('UPDATE patients SET treatment_approach = ? WHERE id = ?', ['Palliative', 7]);
    const r = await store.getTreatment(db, 7);
    assert.strictEqual(r.approach, 'Palliative');
    assert.strictEqual(r.approach_is_retired, true,
      'a screen cannot warn about a retired value it is not told about');
  });

  await test('a made-up approach is refused', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.setCase(db, { patientId: 7, approach: 'Aggressive', actor: ACTOR }),
      /not a treatment approach/i
    );
  });

  await test('setting only the limb does not blank the approach', async () => {
    const db = freshDb();
    await store.setCase(db, { patientId: 7, approach: 'Conservative', actor: ACTOR });
    const r = await store.setCase(db, { patientId: 7, affectedLimbs: 'Both hindlimbs', actor: ACTOR });
    assert.strictEqual(r.approach, 'Conservative', 'a partial write blanked a field it never named');
  });

  await test('the limb is never offered as the region', async () => {
    // These are different clinical facts in different vocabularies, and
    // getProtocolType string-matches the region. See dashboard-bridge rule 3.
    const db = freshDb();
    await db.run('UPDATE patients SET affected_region = ? WHERE id = ?', ['Right Stifle', 7]);
    const r = await store.setCase(db, { patientId: 7, affectedLimbs: 'Right hindlimb (RH)', actor: ACTOR });
    assert.strictEqual(r.affected_region, 'Right Stifle');
    assert.strictEqual(r.affected_limbs, 'Right hindlimb (RH)');
    assert.notStrictEqual(r.affected_region, r.affected_limbs,
      'the limb overwrote the lesion site, which changes which protocol runs');
  });

  // ── procedures ──────────────────────────────────────────────────────────
  await test('a second procedure is a second ROW, not an overwrite', async () => {
    // A contralateral TPLO is ordinary in cruciate disease; a revision is a
    // second operation, not a correction of the first.
    const db = freshDb();
    await store.addProcedure(db, {
      patientId: 7,
      procedure: { procedure_type: 'TPLO right stifle', procedure_date: '2026-03-21', surgeon: 'Dr Rodriguez' },
      actor: ACTOR,
    });
    const r = await store.addProcedure(db, {
      patientId: 7,
      procedure: { procedure_type: 'TPLO left stifle', procedure_date: '2026-08-14' },
      actor: ACTOR,
    });
    assert.strictEqual(r.procedures.length, 2, 'the second operation overwrote the first');
    assert.strictEqual(r.procedures[0].procedure_type, 'TPLO left stifle', 'newest first');
  });

  await test('a procedure with no name is refused', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.addProcedure(db, { patientId: 7, procedure: { procedure_date: '2026-03-21' }, actor: ACTOR }),
      /procedure_type is required/
    );
  });

  await test('an UNDATED procedure is allowed, because that happens', async () => {
    // intake-proposal treats an undated surgical case as ACTIVE — it cannot
    // know the incision has healed, so it asks. Refusing the record here, or
    // inventing a date, would silently close those gates.
    const db = freshDb();
    const r = await store.addProcedure(db, {
      patientId: 7, procedure: { procedure_type: 'TPLO, date unknown' }, actor: ACTOR,
    });
    assert.strictEqual(r.procedures[0].procedure_date, null);
  });

  await test('an unparseable date is refused rather than stored', async () => {
    const db = freshDb();
    for (const bad of ['21/03/2026', 'March 2026', '2026-3-1', 'last spring']) {
      await assert.rejects(
        () => store.addProcedure(db, {
          patientId: 7, procedure: { procedure_type: 'TPLO', procedure_date: bad }, actor: ACTOR,
        }),
        /ISO date/,
        `"${bad}" was stored as a date the engine cannot parse`
      );
    }
  });

  await test('an undated procedure sorts last, not first', async () => {
    const db = freshDb();
    await store.addProcedure(db, { patientId: 7, procedure: { procedure_type: 'Undated' }, actor: ACTOR });
    const r = await store.addProcedure(db, {
      patientId: 7, procedure: { procedure_type: 'Dated', procedure_date: '2026-01-01' }, actor: ACTOR,
    });
    assert.strictEqual(r.procedures[0].procedure_type, 'Dated',
      'an undated row cannot be placed in time and must not lead the list');
  });

  await test('a procedure can be corrected and removed', async () => {
    const db = freshDb();
    await store.addProcedure(db, {
      patientId: 7, procedure: { procedure_type: 'TPLO', procedure_date: '2026-03-21' }, actor: ACTOR,
    });
    const before = await store.getTreatment(db, 7);
    const id = before.procedures[0].id;

    const fixed = await store.updateProcedure(db, {
      procedureId: id, patch: { surgeon: 'Dr Bibevski' }, actor: ACTOR,
    });
    assert.strictEqual(fixed.procedures[0].surgeon, 'Dr Bibevski');
    assert.strictEqual(fixed.procedures[0].procedure_type, 'TPLO',
      'correcting the surgeon blanked the procedure');

    const gone = await store.deleteProcedure(db, { procedureId: id, actor: ACTOR });
    assert.strictEqual(gone.procedures.length, 0);
  });

  // ── status is a series ──────────────────────────────────────────────────
  await test('recording status INSERTS — the previous state is kept', async () => {
    const db = freshDb();
    await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-03-25',
      status: { weight_bearing_status: 'Non-weight bearing (NWB)' }, actor: ACTOR,
    });
    const r = await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-04-15',
      status: { weight_bearing_status: 'Partial weight bearing (PWB)' }, actor: ACTOR,
    });
    assert.strictEqual(r.statusHistory.length, 2,
      'the new state overwrote the old one and the progression is gone');
    assert.strictEqual(r.status.weight_bearing_status, 'Partial weight bearing (PWB)',
      'the latest effective date is the current state');
    assert.strictEqual(r.statusHistory[1].weight_bearing_status, 'Non-weight bearing (NWB)');
  });

  await test('the CURRENT row is the latest effective date, not the latest write', async () => {
    // A clinician writing up Friday's findings on Monday. The row written
    // second describes an EARLIER state and must not become current.
    const db = freshDb();
    await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-04-15',
      status: { weight_bearing_status: 'Partial weight bearing (PWB)' }, actor: ACTOR,
    });
    const r = await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-03-25',
      status: { weight_bearing_status: 'Non-weight bearing (NWB)' }, actor: ACTOR,
    });
    assert.strictEqual(r.status.weight_bearing_status, 'Partial weight bearing (PWB)',
      'a backdated entry became the current state');
  });

  await test('a field not mentioned is carried forward, not blanked', async () => {
    const db = freshDb();
    await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-03-25',
      status: { weight_bearing_status: 'Non-weight bearing (NWB)', incision_status: 'Healing well' },
      actor: ACTOR,
    });
    const r = await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-04-15',
      status: { weight_bearing_status: 'Partial weight bearing (PWB)' }, actor: ACTOR,
    });
    assert.strictEqual(r.status.incision_status, 'Healing well',
      'updating weight-bearing at a re-check said the incision is now unknown');
  });

  await test('an explicit null DOES clear a field', async () => {
    const db = freshDb();
    await store.recordStatus(db, {
      patientId: 7, status: { incision_status: 'Healing well' }, actor: ACTOR,
    });
    const r = await store.recordStatus(db, {
      patientId: 7, status: { incision_status: null }, actor: ACTOR,
    });
    assert.strictEqual(r.status.incision_status, null,
      'somebody withdrawing an answer must be able to');
  });

  // ── tri-state ───────────────────────────────────────────────────────────
  await test('an unanswered flag stays NULL, and never becomes "no"', async () => {
    const db = freshDb();
    const r = await store.recordStatus(db, {
      patientId: 7, status: { weight_bearing_status: 'PWB' }, actor: ACTOR,
    });
    for (const f of store.STATUS_FLAGS) {
      assert.strictEqual(r.status[f], null,
        `${f} became an answer nobody gave. The e-collar and crate-rest gates `
        + 'default to REQUIRED in the acute window, so this relaxes them.');
    }
  });

  await test('false and null are stored differently', async () => {
    const db = freshDb();
    const r = await store.recordStatus(db, {
      patientId: 7, status: { e_collar_required: false, strict_crate_rest: null }, actor: ACTOR,
    });
    assert.strictEqual(r.status.e_collar_required, 0, 'a clinician said no and it was lost');
    assert.strictEqual(r.status.strict_crate_rest, null, 'silence became an answer');
  });

  await test('the string "false" is not read as yes', async () => {
    // Form serialisation sends strings. "false" is truthy in JavaScript.
    const db = freshDb();
    const r = await store.recordStatus(db, {
      patientId: 7, status: { e_collar_required: 'false' }, actor: ACTOR,
    });
    assert.strictEqual(r.status.e_collar_required, 0);
  });

  await test('an empty string is unanswered, not no', async () => {
    // The V1 form serialises an unticked checkbox as "". That cannot tell
    // "the clinician says no" from "nobody touched it".
    const db = freshDb();
    const r = await store.recordStatus(db, {
      patientId: 7, status: { e_collar_required: '' }, actor: ACTOR,
    });
    assert.strictEqual(r.status.e_collar_required, null);
  });

  await test('a flag value that is neither is refused, not guessed', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.recordStatus(db, { patientId: 7, status: { e_collar_required: 'maybe' }, actor: ACTOR }),
      /not a yes\/no answer/
    );
  });

  await test('a flag carries forward when not mentioned', async () => {
    const db = freshDb();
    await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-03-25', status: { e_collar_required: true }, actor: ACTOR,
    });
    const r = await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-04-01',
      status: { weight_bearing_status: 'PWB' }, actor: ACTOR,
    });
    assert.strictEqual(r.status.e_collar_required, 1,
      'an e-collar stopped being required because somebody recorded weight bearing');
  });

  // ── a date nobody stated ────────────────────────────────────────────────
  await test('a migrated row can say its date is not a finding', async () => {
    // The V1 form stored a CURRENT state and never when it was observed, so
    // everything migrated out of it has a date that had to come from
    // somewhere. Stamping the migration date silently would turn a
    // bookkeeping artefact into "weight bearing was PWB on the day we ran a
    // script".
    const db = freshDb();
    const r = await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-09-25', dateIsUnknown: true,
      status: { weight_bearing_status: 'Partial weight bearing (PWB)' }, actor: ACTOR,
    });
    assert.strictEqual(r.status_date_is_unknown, true,
      'a screen showing "as at 2026-09-25" over this row would assert an '
      + 'observation that never happened');
  });

  await test('the uncertainty does NOT carry into a real observation', async () => {
    const db = freshDb();
    await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-09-01', dateIsUnknown: true,
      status: { weight_bearing_status: 'NWB' }, actor: ACTOR,
    });
    const r = await store.recordStatus(db, {
      patientId: 7, effectiveDate: '2026-09-20',
      status: { weight_bearing_status: 'PWB' }, actor: ACTOR,
    });
    assert.strictEqual(r.status_date_is_unknown, false,
      'a clinician who records a status has stated a date; inheriting the '
      + "migrated row's uncertainty would mark their observation as a guess");
    assert.strictEqual(r.statusHistory[1].effective_date_is_unknown, 1,
      'and the migrated row must keep its own marker');
  });

  // ── guards ──────────────────────────────────────────────────────────────
  await test('every write needs an identified actor', async () => {
    const db = freshDb();
    for (const call of [
      () => store.setCase(db, { patientId: 7, approach: 'Surgical' }),
      () => store.addProcedure(db, { patientId: 7, procedure: { procedure_type: 'X' } }),
      () => store.recordStatus(db, { patientId: 7, status: {} }),
    ]) {
      await assert.rejects(call, /identified actor/);
    }
  });

  await test('an unknown field is refused rather than dropped', async () => {
    const db = freshDb();
    await assert.rejects(
      () => store.recordStatus(db, { patientId: 7, status: { pain_level: 5 }, actor: ACTOR }),
      /Unknown status fields: pain_level/,
      'silently dropping it means a clinician answers a question nothing stores'
    );
    await assert.rejects(
      () => store.addProcedure(db, {
        patientId: 7, procedure: { procedure_type: 'X', implant: 'plate' }, actor: ACTOR,
      }),
      /Unknown procedure fields: implant/
    );
  });

  await test('a patient that does not exist is refused', async () => {
    const db = freshDb();
    await assert.rejects(() => store.getTreatment(db, 999), /not found/);
    await assert.rejects(
      () => store.recordStatus(db, { patientId: 999, status: {}, actor: ACTOR }), /not found/
    );
  });

  await test('an empty record reads as empty, not as broken', async () => {
    const db = freshDb();
    const r = await store.getTreatment(db, 7);
    assert.deepStrictEqual(r.procedures, []);
    assert.deepStrictEqual(r.statusHistory, []);
    assert.strictEqual(r.status, null);
    assert.strictEqual(r.approach, null);
    assert.strictEqual(r.configured, false);
  });

  // ── the store and the schema agree ──────────────────────────────────────
  await test('every field the store writes exists in the schema file', async () => {
    const declared = new Set(
      (SCHEMA.match(/^\s{2}([a-z_]+)\s+(TEXT|INTEGER|DATETIME)/gm) || [])
        .map((l) => l.trim().split(/\s+/)[0])
    );
    for (const c of [...store.PROCEDURE_COLUMNS, ...store.STATUS_TEXT, ...store.STATUS_FLAGS]) {
      assert.ok(declared.has(c),
        `the store writes ${c} and the schema does not declare it — the write `
        + 'would be accepted and the value discarded');
    }
  });

  if (failures.length) {
    console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
    for (const f of failures) console.error(`  ✗ ${f.name}\n    ${f.message}\n`);
    process.exit(1);
  }
  console.log(`patient-treatment-store: ${passed} passed`);
})();
