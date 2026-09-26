#!/usr/bin/env node
/**
 * DRIVE THE WHOLE FLOW ON A TEST PATIENT — intake to B.E.A.U. handoff.
 *
 * WHY THIS EXISTS
 *
 * Every test in this repo checks one store, one reader or one rule. Nothing
 * walked a patient from registration to handoff in one go, so a step that
 * works in isolation could still fail to hand its output to the next one —
 * and that is exactly the class of defect this migration keeps producing:
 * the Protocol Summary read a blob two blocks had already moved out of, and
 * activity restrictions lived in two places that drifted into half-records.
 * Both were invisible to every passing unit test.
 *
 * WHAT IT DOES NOT DO
 *
 *   - It NEVER touches a real patient. It creates its own, deletes it at the
 *     end, and refuses to run against any patient it did not create.
 *   - It invents no clinical value for a real animal. The test patient's
 *     findings are FABRICATED and labelled as such in the record itself.
 *   - It does not speak HTTP. `access.js password` prompts interactively by
 *     design, so there is no non-interactive way to get a session without
 *     working around that, and working around it is not worth a test. The
 *     routes are thin; this drives the same stores they call, and checks the
 *     approval gate by asking `authority.resolveApprovalAuthority` directly.
 *
 * USAGE
 *
 *   node scripts/drive-flow.js            run, then clean up
 *   node scripts/drive-flow.js --keep     leave the test patient behind
 *
 * Exit code is 0 only if every step passed.
 */

'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const BACKEND = path.join(__dirname, '..', 'backend');
const DB_PATH = path.join(BACKEND, 'k9rehab.db');
const V2 = (m) => require(path.join(BACKEND, 'v2', m));

const protocolStore = V2('protocol-store');
const visitStore = V2('visit-store');
const treatmentStore = V2('patient-treatment-store');
const goalsStore = V2('patient-goals-store');
const homeStore = V2('patient-home-store');
const diagnosticsStore = V2('patient-diagnostics-store');
const clientStore = V2('patient-client-store');
const clinicStore = V2('clinic-store');
const authority = V2('authority');
const intakeProposal = V2('intake-proposal');
const patientGaps = V2('patient-gaps');
const adapter = V2('engine-adapter');
const generator = require(path.join(BACKEND, 'protocol-generator'));

// ── the test patient ───────────────────────────────────────────────────────
// Named so nobody mistakes it for a real animal, in the list or in a chart.
const TEST_NAME = 'ZZ-TEST Scout (automated flow check)';
const TEST_CLIENT = 'ZZ-TEST Owner';
const KEEP = process.argv.includes('--keep');
const TODAY = new Date().toISOString().slice(0, 10);

// ── output ─────────────────────────────────────────────────────────────────
let step = 0;
const results = [];
const QUEUE = [];   // things only a clinician can answer
function ok(name, detail) {
  step += 1; results.push({ name, pass: true });
  console.log(`  ${String(step).padStart(2)}. ok    ${name}${detail ? '  — ' + detail : ''}`);
}
function bad(name, err) {
  step += 1; results.push({ name, pass: false, err: String(err && err.message || err) });
  console.log(`  ${String(step).padStart(2)}. FAIL  ${name}\n            ${err && err.message || err}`);
}
function queue(what, why) {
  QUEUE.push({ what, why });
  console.log(`      ? for Sal: ${what}`);
}
async function attempt(name, fn, detail) {
  try { const r = await fn(); ok(name, typeof detail === 'function' ? detail(r) : detail); return r; }
  catch (err) { bad(name, err); return null; }
}

/** Production db contract: { lastID, changes }. */
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

(async () => {
  console.log('\nDRIVE FLOW — intake to handoff, on a throwaway patient\n');

  const raw = new DatabaseSync(DB_PATH);
  const db = wrap(raw);

  // An actor with approval authority, from the project's own seeded test
  // accounts (backend/v2/test-clinic.js). Not a real clinician.
  const vet = raw.prepare("SELECT id, username, role FROM users WHERE username = 'test.vet'").get();
  const tech = raw.prepare("SELECT id, username, role FROM users WHERE username = 'test.tech'").get();
  if (!vet) {
    console.error('  test.vet is missing — run `node v2/test-clinic.js` first.\n');
    process.exit(1);
  }
  const ACTOR = { id: vet.id, username: vet.username, role: vet.role };

  let patientId = null;

  try {
    // ── 1. register ───────────────────────────────────────────────────────
    // The same column list and the same null handling server.js POST uses.
    // NOT NULL: name, species, breed, age, weight, condition.
    const reg = await db.run(
      `INSERT INTO patients (name, species, breed, age, weight, sex, condition,
         affected_region, client_name, medical_history, current_medications)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [TEST_NAME, 'canine', 'Labrador Retriever', 6, 70, 'FS',
       'Right cranial cruciate ligament rupture s/p TPLO', 'Right Stifle', TEST_CLIENT,
       'FABRICATED TEST RECORD — not a real animal. TPLO right stifle.',
       'FABRICATED TEST RECORD — carprofen.']
    );
    patientId = reg.lastID;
    ok('register the patient', `id ${patientId}`);

    // Registration must NOT invent findings (fixed in 3516874).
    const fresh = await db.get('SELECT * FROM patients WHERE id = ?', [patientId]);
    const invented = ['pain_level', 'lameness_grade', 'mobility_level', 'body_condition_score']
      .filter((c) => fresh[c] !== null && fresh[c] !== undefined);
    if (invented.length) bad('registration invents no clinical finding', new Error(`invented: ${invented.join(', ')}`));
    else ok('registration invents no clinical finding');

    // ── 2. the gap check should say the record is not ready ───────────────
    await attempt('gap check reports what is missing', async () => {
      const caps = await clinicStore.getCapabilities(db, 1);
      const g = patientGaps.findGaps(fresh, caps);
      if (!g.gaps.length) throw new Error('a brand new record reported no gaps at all');
      return g;
    }, (g) => `${g.gaps.length} gap(s), ${g.blocking} blocking`);

    // ── 3. open the intake visit ──────────────────────────────────────────
    const visit = await attempt('open a visit', () => visitStore.createVisit(db, {
      patientId, visitDate: TODAY, visitType: 'INITIAL', actor: ACTOR,
    }), (v) => `visit ${v && (v.id || v.visit_id)}, type ${v && v.visit_type}`);
    const visitId = visit && (visit.id || visit.visit_id);

    // ── 4. the treatment block ────────────────────────────────────────────
    await attempt('record the surgical case', () => treatmentStore.setCase(db, {
      patientId, approach: 'Surgical', affectedLimbs: 'Right hindlimb (RH)', actor: ACTOR,
    }));
    await attempt('record the procedure', () => treatmentStore.addProcedure(db, {
      patientId, procedure: { procedure_type: 'TPLO', procedure_date: '2026-09-01',
        surgeon: 'ZZ-TEST', facility: 'ZZ-TEST' }, actor: ACTOR,
    }));
    const tx = await attempt('record the treatment status', () => treatmentStore.recordStatus(db, {
      patientId, effectiveDate: TODAY, actor: ACTOR,
      status: {
        weight_bearing_status: 'Partial weight bearing (PWB)',
        incision_status: 'Fully healed / staples removed',
        activity_restrictions: 'Leash only. No stairs. No jumping.',
        e_collar_required: 0, strict_crate_rest: 0,
      },
    }), (t) => `wb=${t && t.status && t.status.weight_bearing_status}`);

    // The mirror invariant, end to end rather than in a fixture.
    await attempt('the restriction mirror lands on the patient row', async () => {
      const p = await db.get('SELECT special_instructions FROM patients WHERE id = ?', [patientId]);
      if (p.special_instructions !== 'Leash only. No stairs. No jumping.') {
        throw new Error(`mirror is ${JSON.stringify(p.special_instructions)}`);
      }
      return true;
    });

    // ── 5. the other blocks ───────────────────────────────────────────────
    await attempt('record the home environment', () => homeStore.setHome(db, {
      patientId, actor: ACTOR,
      // Real column names, from patient-home-store.COLUMNS. The first
      // version invented plausible ones (flooring_type, yard_access...) and
      // the store rejected them by name, which is the store behaving exactly
      // as its own test says it should.
      stated: {
        exercise_location: 'Living room',
        flooring_indoor: 'Hardwood',
        space_indoors: 'Adequate',
        stairs_indoor: 'Yes',
        stair_frequency: 'Several times daily',
        outdoor_space: 'Fenced yard',
        outdoor_surface: 'Grass',
        outdoor_steps: '2 steps to yard',
        session_minutes: '15',
        sessions_per_day: '2',
        owner_confidence: 'Confident',
        expected_compliance: 'High',
        owner_notes: 'FABRICATED TEST RECORD.',
      },
    }));
    await attempt('record a diagnostic study', () => diagnosticsStore.addStudy(db, {
      patientId, actor: ACTOR, category: 'IMAGING', modality: 'Radiograph', performedOn: '2026-09-01',
      findings: 'FABRICATED TEST RECORD — TPLO plate in situ, alignment maintained.',
    }));
    await attempt('record the goal set', () => goalsStore.setGoalSet(db, {
      patientId, actor: ACTOR,
      set: { owner_priority: 'Return to trail walking',
        owner_expectations: 'Full weight bearing without lameness' },
    }));
    await attempt('add a goal item', () => goalsStore.addGoalItem(db, {
      patientId, horizon: 'SHORT', kind: 'CLINICAL',
      goalText: 'Full weight bearing at walk by week 6', targetDate: '2026-11-07', actor: ACTOR,
    }));

    // ── 6. the assessment ─────────────────────────────────────────────────
    if (visitId) {
      await attempt('record the visit assessment', () => visitStore.recordAssessment(db, {
        visitId, actor: ACTOR,
        assessment: { pain_score: 3, lameness_grade: 2,
          weight_bearing_status: 'Partial weight bearing (PWB)',
          mobility_level: 'Moderate', incision_status: 'Fully healed / staples removed',
          clinical_observation: 'FABRICATED TEST RECORD.' },
      }));
    }

    // ── 7. what the engine now believes ───────────────────────────────────
    const proposal = await attempt('build the intake proposal', async () => {
      const p = await db.get('SELECT * FROM patients WHERE id = ?', [patientId]);
      const treatment = await treatmentStore.getTreatment(db, patientId);
      const caps = await clinicStore.getCapabilities(db, 1);
      return intakeProposal.proposeEngineInputs({
        patient: p, treatment, clinicInputs: clinicStore.toEngineInputs(caps),
      });
    }, (r) => `${Object.keys(r.proposed).length} inputs, ${r.gates.length} gate(s)`);

    if (proposal) {
      const pr = proposal.proposed;
      // The things this migration has broken before, checked by value.
      const checks = [
        ['diagnosis reaches the engine', pr.diagnosis],
        ['activity restrictions reach the engine', pr.specialInstructions],
        ['weight-bearing status reaches the engine', pr.weightBearingStatus],
        ['surgery date reaches the engine', pr.surgeryDate],
      ];
      for (const [name, v] of checks) {
        if (v === undefined || v === null || v === '') bad(name, new Error('empty'));
        else ok(name, String(v).slice(0, 40));
      }
      if (!generator.diagnosisRecognised(pr.diagnosis || '')) {
        bad('the diagnosis routes by match, not fallthrough', new Error(`"${pr.diagnosis}" matches no rule`));
      } else {
        ok('the diagnosis routes by match, not fallthrough',
          generator.getProtocolType(pr.diagnosis, pr.affectedRegion || ''));
      }
    }

    // ── 8. generate the protocol ──────────────────────────────────────────
    const formData = await attempt('build the engine form data', async () => {
      const p = await db.get('SELECT * FROM patients WHERE id = ?', [patientId]);
      const caps = await clinicStore.getCapabilities(db, 1);
      const visitRow = visitId ? await visitStore.getVisit(db, visitId) : {};
      const fd = adapter.toEngineFormData({
        patient: p, visit: visitRow || {}, protocol: {}, clinic: clinicStore.toClinicState(caps),
      });
      const guard = adapter.verifyEngineContract(fd);
      if (!guard.ok) {
        throw new Error('contract: missing ' + (guard.missing || []).join(', ')
          + (guard.unexpectedFlags && guard.unexpectedFlags.length
            ? '; preset flags ' + guard.unexpectedFlags.join(', ') : ''));
      }
      return fd;
    }, (fd) => `${Object.keys(fd).length} fields`);

    await attempt('the intake validates', () => {
      const v = generator.validateIntake(formData || {});
      if (v && v.errors && v.errors.length) throw new Error(v.errors.join('; '));
      return v;
    }, (v) => (v && v.warnings && v.warnings.length) ? `${v.warnings.length} warning(s)` : 'no errors');

    await attempt('the engine builds week 1', () => {
      const all = require(path.join(BACKEND, 'all-exercises'));
      const list = all.ALL_EXERCISES || all.allExercises || all;
      const wk = generator.selectExercisesForWeek(1, 8, list, formData || {});
      const n = Array.isArray(wk) ? wk.length : (wk && wk.exercises ? wk.exercises.length : 0);
      if (!n) throw new Error('week 1 came back with no exercises');
      return n;
    }, (n) => `${n} exercise(s)`);

    // ── 9. the approval gate — asked directly, not bypassed ───────────────
    await attempt('a technician CANNOT approve', async () => {
      if (!tech) throw new Error('test.tech missing');
      const c = await authority.resolveApprovalAuthority(db, { actor: tech });
      if (c.allowed) throw new Error('a technician was granted approval authority');
      return c;
    }, (c) => `denied: ${c.reason}`);

    await attempt('a veterinarian CAN approve', async () => {
      const c = await authority.resolveApprovalAuthority(db, { actor: ACTOR });
      if (!c.allowed) throw new Error(`denied: ${c.reason}`);
      return c;
    }, (c) => `basis: ${c.basis}`);

    // ── 10. the handoff payload ───────────────────────────────────────────
    await attempt('the handoff carries the home', async () => {
      const h = await homeStore.toHepPayload(db, patientId);
      if (!h || !Object.keys(h).length) throw new Error('empty home payload');
      return h;
    }, (h) => `${Object.keys(h).length} field(s)`);

    await attempt('the handoff carries the goals', async () => {
      const g = await goalsStore.toHepPayload(db, patientId);
      if (!g) throw new Error('null payload — the goal set reads as unconfigured');
      const owner = (g.owner_facing && g.owner_facing.goals) || [];
      const clinical = (g.clinical && g.clinical.goals) || [];
      if (!owner.length && !clinical.length) throw new Error('payload carries no goal items');
      return { owner, clinical };
    }, (g) => `${g.owner.length} owner-facing, ${g.clinical.length} clinical`);

  } finally {
    // ── clean up ──────────────────────────────────────────────────────────
    if (patientId && !KEEP) {
      // Refuse to delete anything but our own.
      const p = await db.get('SELECT name FROM patients WHERE id = ?', [patientId]);
      if (p && p.name === TEST_NAME) {
        for (const t of ['patient_goal_items', 'patient_goals', 'patient_home_environment',
          'patient_diagnostic_studies', 'patient_treatment_status', 'patient_procedures',
          'patient_client_details', 'visit_measurements', 'visit_assessments']) {
          try { raw.prepare(`DELETE FROM ${t} WHERE patient_id = ?`).run(patientId); } catch { /* table may not exist */ }
        }
        try { raw.prepare('DELETE FROM visits WHERE patient_id = ?').run(patientId); } catch { /* none */ }
        raw.prepare('DELETE FROM patients WHERE id = ?').run(patientId);
        console.log(`\n  cleaned up test patient ${patientId}`);
      } else {
        console.log(`\n  REFUSED to clean up id ${patientId} — name does not match the test patient`);
      }
    } else if (patientId) {
      console.log(`\n  --keep: test patient ${patientId} left in place`);
    }
    raw.close();
  }

  // ── report ────────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.pass);
  console.log(`\n  ${results.length - failed.length}/${results.length} steps passed`);
  if (QUEUE.length) {
    console.log('\n  NEEDS SAL:');
    for (const q of QUEUE) console.log(`    - ${q.what}\n        ${q.why}`);
  }
  if (failed.length) {
    console.log('\n  FAILED STEPS:');
    for (const f of failed) console.log(`    - ${f.name}\n        ${f.err}`);
  }
  console.log('');
  process.exit(failed.length ? 1 : 0);
})().catch((err) => { console.error('\n  driver crashed: ' + err.stack + '\n'); process.exit(1); });
