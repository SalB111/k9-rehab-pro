'use strict';

/**
 * "NOT NEEDED TODAY" — a block the clinician chose to proceed without.
 *
 * Sal, 2026-09-26: "a check box in each block that the clinician can check to
 * bypass that block if it is not needed at that time, because when a vet is
 * busy they cant or dont need that info right away, but it should be able to
 * generate an exercise protocol with the criteria they want to use".
 *
 * NOT THE SAME FACT AS THE STAGE. `patient-block-state.js` answers "does this
 * stage ask for it yet" — a workflow default, true of every patient at that
 * point. A bypass is one named person deciding, on one day, to go without
 * something the stage DOES ask for. That is a clinical decision, so it is
 * stored with who and when rather than merely hidden from the screen.
 *
 * PER VISIT, which is Sal's choice and the reason `visit_id` is the key. A
 * skip made on a busy Tuesday clears itself at the next visit instead of
 * quietly becoming this patient's permanent shape.
 *
 * IT CHANGES NO SAFETY GATE. Nothing here touches intake-proposal. The gates
 * behind a skipped block stay unproposed, fall to their cautious defaults, and
 * approval still refuses until a clinician confirms them — see
 * protocol-persistence.sqlite.sql: "Approval refuses until every one carries a
 * clinician's confirmation". A bypass lets a protocol be GENERATED with gaps.
 * It does not let one be SIGNED with them.
 */

const visitStore = require('./visit-store');
const { BLOCK_SOURCE } = require('./patient-block-state');
const { ProtocolStoreError, ERR } = require('./protocol-store');

const TABLE = 'visit_block_bypasses';

/** Only a real block may be bypassed — a typo must not become a stored fact. */
function assertBlock(blockId) {
  if (!blockId || !Object.prototype.hasOwnProperty.call(BLOCK_SOURCE, blockId)) {
    throw new ProtocolStoreError(
      `Unknown block "${blockId}". The block list is patient-block-state.BLOCK_SOURCE.`,
      ERR.INVALID
    );
  }
}

function assertActor(actor) {
  if (!actor || !actor.id) {
    throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);
  }
}

/**
 * The patient's current OPEN visit, opening one if there is none.
 *
 * WHY THIS EXISTS AT ALL: the dashboard has never opened a visit. Haley and
 * Louie both have zero rows in `visits` despite complete workups, so a
 * per-visit fact had nothing to hang on.
 *
 * WHY ONLY HERE: a visit is a clinical and billable event. Opening one every
 * time somebody looked at the dashboard would manufacture records nobody
 * asked for. Ticking a bypass is an explicit clinical act, so it is a
 * defensible moment to start a visit — and it is the ONLY place this module
 * creates one.
 *
 * The type rule is the one ClinicalWorkflowView already uses: INITIAL when the
 * patient has never been seen, RECHECK otherwise.
 */
async function ensureOpenVisit(db, { patientId, actor }) {
  assertActor(actor);
  const open = await db.get(
    "SELECT * FROM visits WHERE patient_id = ? AND status = 'OPEN'"
    + ' ORDER BY visit_date DESC, id DESC LIMIT 1',
    [patientId]
  );
  if (open) return open;

  const prior = await db.get('SELECT COUNT(*) c FROM visits WHERE patient_id = ?', [patientId]);
  const created = await visitStore.createVisit(db, {
    patientId,
    visitDate: new Date().toISOString().slice(0, 10),
    visitType: (prior && prior.c) ? 'RECHECK' : 'INITIAL',
    actor,
  });
  return created;
}

/** Refuse to change a closed visit, the way visit_assessments does. */
async function assertVisitEditable(db, visitId) {
  const visit = await db.get('SELECT id, status FROM visits WHERE id = ?', [visitId]);
  if (!visit) throw new ProtocolStoreError(`Visit ${visitId} not found`, ERR.NOT_FOUND);
  if (String(visit.status).toUpperCase() === 'COMPLETED') {
    throw new ProtocolStoreError(
      `Visit ${visitId} is COMPLETED. A finished visit is not edited in place — `
      + 'a correction becomes an amended visit, so the clinical record is not '
      + 'silently rewritten.',
      ERR.INVALID
    );
  }
  return visit;
}

/** Mark a block as not needed at this visit. Idempotent. */
async function setBypass(db, { patientId, blockId, actor }) {
  assertBlock(blockId);
  assertActor(actor);
  const visit = await ensureOpenVisit(db, { patientId, actor });
  await assertVisitEditable(db, visit.id);

  const existing = await db.get(
    `SELECT id FROM ${TABLE} WHERE visit_id = ? AND block_id = ?`, [visit.id, blockId]
  );
  if (!existing) {
    await db.run(
      `INSERT INTO ${TABLE} (visit_id, patient_id, block_id, bypassed_by) VALUES (?,?,?,?)`,
      [visit.id, patientId, blockId, actor.id]
    );
  }
  return listForVisit(db, visit.id);
}

/** Unmark it. Silent when it was never set — unticking a box is not an error. */
async function clearBypass(db, { patientId, blockId, actor }) {
  assertBlock(blockId);
  assertActor(actor);
  const visit = await db.get(
    "SELECT * FROM visits WHERE patient_id = ? AND status = 'OPEN'"
    + ' ORDER BY visit_date DESC, id DESC LIMIT 1',
    [patientId]
  );
  // No open visit means nothing can be bypassed, so there is nothing to clear.
  // Creating a visit just to delete a row that does not exist would be a
  // clinical record produced by an accident.
  if (!visit) return { visit_id: null, blocks: [] };
  await assertVisitEditable(db, visit.id);
  await db.run(`DELETE FROM ${TABLE} WHERE visit_id = ? AND block_id = ?`, [visit.id, blockId]);
  return listForVisit(db, visit.id);
}

async function listForVisit(db, visitId) {
  const rows = await db.all(
    `SELECT block_id, bypassed_by, bypassed_at FROM ${TABLE} WHERE visit_id = ?`
    + ' ORDER BY bypassed_at', [visitId]
  );
  return { visit_id: visitId, blocks: rows || [] };
}

/**
 * What is bypassed for this patient RIGHT NOW.
 *
 * Reads only the OPEN visit. A bypass on a closed visit is history, not a
 * current instruction — which is the whole of "per visit" in one function.
 */
async function currentFor(db, patientId) {
  let visit = null;
  try {
    visit = await db.get(
      "SELECT id FROM visits WHERE patient_id = ? AND status = 'OPEN'"
      + ' ORDER BY visit_date DESC, id DESC LIMIT 1',
      [patientId]
    );
  } catch { return { visit_id: null, blocks: [] }; }
  if (!visit) return { visit_id: null, blocks: [] };
  try { return await listForVisit(db, visit.id); }
  catch { return { visit_id: visit.id, blocks: [] }; }
}

module.exports = {
  TABLE,
  ensureOpenVisit,
  setBypass,
  clearBypass,
  listForVisit,
  currentFor,
};
