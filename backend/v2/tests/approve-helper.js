/**
 * Approval now requires every applicable safety gate to be confirmed.
 *
 * Most suites approve a protocol as SCAFFOLDING — they are testing
 * immutability, supersession, handoff, home sessions, owner access. Approval
 * is how they get a protocol into the state the real subject needs, and those
 * tests should not each restate the gate contract.
 *
 * So this helper confirms whatever gates the version recorded and approves.
 * It deliberately reads them from the version rather than hard-coding a list:
 * if the applicability rules change, these tests keep working, and the tests
 * that actually assert the gate behaviour are the ones that pin it down.
 *
 * Do NOT use this in a test that is about gate enforcement. Call
 * store.approveVersion directly there, so the confirmation is visible in the
 * test and an accidental change to this helper cannot mask a regression.
 */

'use strict';

/**
 * @param {object} store  the protocol-store module
 * @param {object} db     the wrapped database handle
 * @param {object} args   the usual approveVersion arguments
 */
async function approveWithGates(store, db, args) {
  const row = await db.get(
    'SELECT safety_gates_json FROM protocol_versions WHERE id = ?',
    [args.versionId]
  );

  let gates = [];
  try { gates = JSON.parse((row && row.safety_gates_json) || '[]'); }
  catch { gates = []; }

  const gateConfirmations = {};
  for (const field of gates) gateConfirmations[field] = true;

  return store.approveVersion(db, { ...args, gateConfirmations });
}

module.exports = { approveWithGates };
