/**
 * K9 Clinical Workflow V2 — Protocol Store
 *
 * Persistence for the clinical decision chain:
 *
 *   Protocol -> Version -> Exercises/Restrictions -> Approval -> Supersession -> B.E.A.U. Handoff
 *
 * Closes FINDING 4 of docs/STEP-13-ENGINE-CONTRACT-RECONCILIATION.md.
 *
 * This module persists clinical decisions. It does NOT make them: no exercise
 * selection, no dosage, no phase determination, no contraindication logic. All
 * of that stays in the existing K9 engine, reached through backend/engine-adapter.js.
 *
 * INVARIANTS ENFORCED HERE
 * ------------------------
 * I1. An APPROVED version is immutable. Editing an approved protocol creates a
 *     NEW version; the approved one is never updated in place.
 * I2. Only an authorized clinician may approve. K9 today has no role
 *     enforcement anywhere (users.role defaults to 'user' and no requireRole
 *     middleware exists), so the check lives here, at the point of decision.
 * I3. Only an APPROVED version may be handed off to B.E.A.U.
 * I4. An approval is bound to specific content by SHA-256. If the stored
 *     content stops matching the hash, the approval is reported invalid rather
 *     than trusted.
 * I5. Approving a new version supersedes the previous approved version and
 *     revokes its active B.E.A.U. handoff. A patient must never hold two live
 *     prescriptions.
 * I6. Every state transition writes an append-only audit event.
 *
 * The store is database-agnostic: it takes a `db` with promise-returning
 * run/get/all, matching the shape the existing K9 providers already expose.
 */

'use strict';

const crypto = require('crypto');
const authority = require('./authority');
const hepSelection = require('./hep-selection');
const intakeProposal = require('./intake-proposal');

// ---------------------------------------------------------------------------
// States and roles
// ---------------------------------------------------------------------------

const VERSION_STATUS = {
  DRAFT: 'DRAFT',
  GENERATED: 'GENERATED',
  REVIEW: 'REVIEW',
  APPROVED: 'APPROVED',
  HANDED_OFF: 'HANDED_OFF',
  SUPERSEDED: 'SUPERSEDED',
};

/** Legal forward transitions. Anything not listed is rejected. */
const ALLOWED_TRANSITIONS = {
  DRAFT: ['GENERATED', 'REVIEW', 'SUPERSEDED'],
  GENERATED: ['REVIEW', 'DRAFT', 'SUPERSEDED'],
  REVIEW: ['APPROVED', 'DRAFT', 'GENERATED', 'SUPERSEDED'],
  APPROVED: ['HANDED_OFF', 'SUPERSEDED'],
  HANDED_OFF: ['SUPERSEDED'],
  SUPERSEDED: [],
};

/**
 * Roles permitted to approve a clinical protocol.
 *
 * A technician may record measurements and prepare a draft; they may not
 * authorize treatment. An owner may never approve. This list is the single
 * place that decision is encoded.
 */
const APPROVAL_ROLES = new Set(['clinician', 'veterinarian', 'vet', 'admin']);

const AUDIT = {
  PROTOCOL_CREATED: 'PROTOCOL_CREATED',
  VERSION_CREATED: 'VERSION_CREATED',
  VERSION_MODIFIED: 'VERSION_MODIFIED',
  EXERCISE_ADDED: 'EXERCISE_ADDED',
  EXERCISE_REMOVED: 'EXERCISE_REMOVED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  PROTOCOL_APPROVED: 'PROTOCOL_APPROVED',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  PROTOCOL_SUPERSEDED: 'PROTOCOL_SUPERSEDED',
  HEP_HANDED_OFF: 'HEP_HANDED_OFF',
  HANDOFF_REVOKED: 'HANDOFF_REVOKED',
  INTEGRITY_FAILURE: 'INTEGRITY_FAILURE',
};

// ---------------------------------------------------------------------------
// Errors — typed so callers can map them to HTTP status codes
// ---------------------------------------------------------------------------

class ProtocolStoreError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ProtocolStoreError';
    this.code = code;
  }
}

const ERR = {
  NOT_FOUND: 'NOT_FOUND',
  IMMUTABLE: 'IMMUTABLE',
  FORBIDDEN: 'FORBIDDEN',
  ILLEGAL_TRANSITION: 'ILLEGAL_TRANSITION',
  NOT_APPROVED: 'NOT_APPROVED',
  GATES_UNCONFIRMED: 'GATES_UNCONFIRMED',
  INTEGRITY: 'INTEGRITY',
  INVALID: 'INVALID',
};

// ---------------------------------------------------------------------------
// Canonical hashing
// ---------------------------------------------------------------------------

/**
 * Stable stringify — key order must not affect the hash, or an approval would
 * spuriously "fail" integrity after a harmless re-serialization.
 */
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}

/**
 * Engine exercise fields are sometimes strings and sometimes arrays
 * (equipment, red_flags, contraindications). Store arrays as JSON so the
 * structure survives the round trip instead of degrading to "a,b,c".
 */
function serializeField(value) {
  if (value === undefined || value === null) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/** Inverse of serializeField. Non-JSON text is returned unchanged. */
function deserializeField(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return value;
  try { return JSON.parse(trimmed); } catch { return value; }
}

function hashContent(content) {
  return crypto.createHash('sha256').update(canonical(content)).digest('hex');
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Tables this module's own code paths require.
 *
 * `clinical-authority` is included because approveVersion resolves the
 * approver's credential — the store cannot function without it. Callers that
 * want the whole V2 schema (visits included) should use schema.applyAll.
 */
const REQUIRED_SCHEMAS = [
  'protocol-persistence.sqlite.sql',
  'clinical-authority.sqlite.sql',
];

/** Apply the schema this store needs. Idempotent — every statement is IF NOT EXISTS. */
async function createTables(db) {
  const { applyAll } = require('./schema');
  return applyAll(db, { files: REQUIRED_SCHEMAS });
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

async function audit(db, { protocolId, versionId, patientId, action, actor, sourceSystem, detail }) {
  await db.run(
    `INSERT INTO protocol_audit_events
       (protocol_id, version_id, patient_id, action, actor_id, actor_username, actor_role, source_system, detail_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      protocolId ?? null,
      versionId ?? null,
      patientId ?? null,
      action,
      actor?.id ?? null,
      actor?.username ?? null,
      actor?.role ?? null,
      sourceSystem || 'K9',
      detail ? JSON.stringify(detail) : null,
    ]
  );
}

function requireActor(actor) {
  if (!actor || actor.id === undefined || actor.id === null || !actor.username) {
    throw new ProtocolStoreError(
      'An identified actor (id, username, role) is required for every clinical write',
      ERR.INVALID
    );
  }
}

// ---------------------------------------------------------------------------
// Protocols
// ---------------------------------------------------------------------------

async function createProtocol(db, { patientId, patientName, actor }) {
  requireActor(actor);
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);

  const result = await db.run(
    `INSERT INTO protocols (patient_id, patient_name, status, created_by) VALUES (?, ?, ?, ?)`,
    [patientId, patientName ?? null, VERSION_STATUS.DRAFT, actor.id]
  );
  const protocolId = result.lastID;

  await audit(db, {
    protocolId,
    patientId,
    action: AUDIT.PROTOCOL_CREATED,
    actor,
    detail: { patientName },
  });

  return getProtocol(db, protocolId);
}

async function getProtocol(db, protocolId) {
  const row = await db.get(`SELECT * FROM protocols WHERE id = ?`, [protocolId]);
  if (!row) throw new ProtocolStoreError(`Protocol ${protocolId} not found`, ERR.NOT_FOUND);
  return row;
}

async function listProtocolsForPatient(db, patientId) {
  return db.all(`SELECT * FROM protocols WHERE patient_id = ? ORDER BY created_at DESC`, [patientId]);
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

/**
 * Persist an engine run as a new protocol version.
 *
 * @param {object} args.engineInput  The 36-field formData handed to the engine.
 * @param {object} args.engineResult Output of engine-adapter.runEngine().
 *                                   Its `derivedFlags` record WHICH SAFETY GATES
 *                                   FIRED and are stored as provenance — without
 *                                   them a past approval cannot be explained.
 */
async function createVersion(db, { protocolId, engineInput, engineResult, actor, status }) {
  requireActor(actor);
  const protocol = await getProtocol(db, protocolId);

  if (!engineInput) throw new ProtocolStoreError('engineInput is required', ERR.INVALID);
  if (!engineResult) throw new ProtocolStoreError('engineResult is required', ERR.INVALID);

  const nextRow = await db.get(
    `SELECT COALESCE(MAX(version_number), 0) + 1 AS next FROM protocol_versions WHERE protocol_id = ?`,
    [protocolId]
  );
  const versionNumber = nextRow.next;

  const initialStatus = status || VERSION_STATUS.GENERATED;

  const result = await db.run(
    `INSERT INTO protocol_versions
       (protocol_id, version_number, status, engine_input_json, safety_gates_json,
        derived_flags_json, engine_warnings_json, protocol_type, total_weeks,
        frequency, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      protocolId,
      versionNumber,
      initialStatus,
      JSON.stringify(engineInput),
      // Pinned now, not recomputed at approval. If the rules change between
      // generation and signature, the clinician still confirms the gates this
      // protocol was actually built on.
      JSON.stringify([...intakeProposal.gatesFromEngineInput(engineInput)]),
      JSON.stringify(engineResult.derivedFlags || {}),
      JSON.stringify(engineResult.warnings || []),
      engineResult.protocolType ?? null,
      engineResult.totalWeeks ?? null,
      engineInput.frequency ?? null,
      actor.id,
    ]
  );
  const versionId = result.lastID;

  // Exercises, flattened from the engine's week structure.
  //
  // Each week is classified by venue and ranked for home suitability before
  // storage. This only narrows what the engine already permitted — it never
  // adds an exercise, changes a dosage, or overrides an exclusion.
  const affectedRegion = engineInput.affectedRegion;
  let sortOrder = 0;
  for (const week of engineResult.weeks || []) {
    const rawExercises = (week.exercises || [])
      .filter((ex) => ex && ex.code)
      .map((ex) => ({ ...ex, exercise_code: ex.code, exercise_name: ex.name }));

    const proposal = hepSelection.proposeHomeProgram(rawExercises, {
      context: { affectedRegion },
    });
    const decisionByCode = new Map();
    for (const item of [...proposal.home, ...proposal.clinic]) {
      decisionByCode.set(item.exercise_code, item);
    }

    for (const ex of week.exercises || []) {
      if (!ex || !ex.code) continue;
      const decision = decisionByCode.get(ex.code) || {};
      await db.run(
        `INSERT INTO protocol_version_exercises
           (version_id, week_number, exercise_code, exercise_name, phase, sort_order, origin,
            sets, reps, frequency, duration_minutes,
            equipment, progression, contraindications, red_flags, evidence_citation,
            venue, venue_reason, home_rank, home_selected, selection_reason)
         VALUES (?, ?, ?, ?, ?, ?, 'ENGINE', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          versionId,
          week.week,
          ex.code,
          ex.name ?? null,
          (week.phaseInfo && (week.phaseInfo.name || week.phaseInfo.phase)) ?? null,
          sortOrder++,
          // Dosage, field for field as the engine states it.
          ex.sets ?? null,
          ex.reps ?? null,
          ex.frequency ?? null,
          ex.duration_minutes ?? null,
          // Home-execution payload. Arrays are stored as JSON so structure survives.
          serializeField(ex.equipment),
          serializeField(ex.progression),
          serializeField(ex.contraindications),
          serializeField(ex.red_flags),
          serializeField(ex.evidence_citation),
          decision.venue || 'HOME',
          decision.venue_reason || null,
          decision.home_rank ?? null,
          decision.home_selected ? 1 : 0,
          decision.selection_reason || null,
        ]
      );
    }
  }

  // Engine warnings are persisted as restrictions so they travel to B.E.A.U.
  // rather than living only in a transient API response.
  for (const warning of engineResult.warnings || []) {
    await db.run(
      `INSERT INTO protocol_version_restrictions (version_id, restriction_type, detail, source)
       VALUES (?, ?, ?, 'ENGINE')`,
      [versionId, 'WARNING', warning]
    );
  }

  await db.run(`UPDATE protocols SET current_version_id = ?, status = ? WHERE id = ?`, [
    versionId,
    initialStatus,
    protocolId,
  ]);

  await audit(db, {
    protocolId,
    versionId,
    patientId: protocol.patient_id,
    action: AUDIT.VERSION_CREATED,
    actor,
    detail: {
      versionNumber,
      status: initialStatus,
      protocolType: engineResult.protocolType,
      derivedFlags: engineResult.derivedFlags,
    },
  });

  return getVersion(db, versionId);
}

/** Load a version with its exercises, restrictions and approval. */
async function getVersion(db, versionId) {
  const version = await db.get(`SELECT * FROM protocol_versions WHERE id = ?`, [versionId]);
  if (!version) throw new ProtocolStoreError(`Version ${versionId} not found`, ERR.NOT_FOUND);

  const exercises = await db.all(
    `SELECT * FROM protocol_version_exercises WHERE version_id = ? ORDER BY week_number, sort_order, id`,
    [versionId]
  );
  const restrictions = await db.all(
    `SELECT * FROM protocol_version_restrictions WHERE version_id = ? ORDER BY id`,
    [versionId]
  );
  const approval = await db.get(`SELECT * FROM protocol_approvals WHERE version_id = ?`, [versionId]);

  for (const ex of exercises) {
    for (const field of ['equipment', 'progression', 'contraindications', 'red_flags', 'evidence_citation']) {
      ex[field] = deserializeField(ex[field]);
    }
  }

  return {
    ...version,
    engine_input: JSON.parse(version.engine_input_json),
    derived_flags: JSON.parse(version.derived_flags_json),
    engine_warnings: version.engine_warnings_json ? JSON.parse(version.engine_warnings_json) : [],
    // The safety gates this version was built on. A reviewer needs to see
    // which ones they are being asked to confirm, and approval refuses until
    // each carries a confirmation.
    safety_gates: version.safety_gates_json ? JSON.parse(version.safety_gates_json) : [],
    exercises,
    restrictions,
    approval: approval || null,
  };
}

async function listVersions(db, protocolId) {
  return db.all(
    `SELECT id, protocol_id, version_number, status, protocol_type, total_weeks,
            superseded_by_version_id, superseded_at, created_by, created_at
       FROM protocol_versions WHERE protocol_id = ? ORDER BY version_number`,
    [protocolId]
  );
}

/**
 * The canonical content an approval signs. Deliberately excludes mutable
 * bookkeeping (status, supersession pointers, timestamps) — those change as the
 * version moves through its lifecycle without altering the clinical decision.
 */
function versionContent(version) {
  return {
    protocol_id: version.protocol_id,
    version_number: version.version_number,
    engine_input: version.engine_input,
    derived_flags: version.derived_flags,
    protocol_type: version.protocol_type,
    total_weeks: version.total_weeks,
    frequency: version.frequency,
    exercises: version.exercises.map((e) => ({
      week_number: e.week_number,
      exercise_code: e.exercise_code,
      sets: e.sets,
      reps: e.reps,
      frequency: e.frequency,
      duration_minutes: e.duration_minutes,
      dosage_override: e.dosage_override,
      origin: e.origin,
    })),
    restrictions: version.restrictions.map((r) => ({
      restriction_type: r.restriction_type,
      detail: r.detail,
      source: r.source,
    })),
  };
}

function assertMutable(version) {
  if (version.status === VERSION_STATUS.APPROVED || version.status === VERSION_STATUS.HANDED_OFF) {
    throw new ProtocolStoreError(
      `Version ${version.id} is ${version.status} and cannot be modified. ` +
        `Create a new version instead (use reviseApprovedVersion).`,
      ERR.IMMUTABLE
    );
  }
  if (version.status === VERSION_STATUS.SUPERSEDED) {
    throw new ProtocolStoreError(
      `Version ${version.id} is SUPERSEDED and is historical record only.`,
      ERR.IMMUTABLE
    );
  }
}

async function setStatus(db, versionId, nextStatus, actor) {
  requireActor(actor);
  const version = await getVersion(db, versionId);
  const allowed = ALLOWED_TRANSITIONS[version.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw new ProtocolStoreError(
      `Illegal transition ${version.status} -> ${nextStatus} for version ${versionId}`,
      ERR.ILLEGAL_TRANSITION
    );
  }

  await db.run(`UPDATE protocol_versions SET status = ? WHERE id = ?`, [nextStatus, versionId]);
  await db.run(`UPDATE protocols SET status = ? WHERE id = ?`, [nextStatus, version.protocol_id]);
  await audit(db, {
    protocolId: version.protocol_id,
    versionId,
    action: AUDIT.STATUS_CHANGED,
    actor,
    detail: { from: version.status, to: nextStatus },
  });
  return getVersion(db, versionId);
}

// ---------------------------------------------------------------------------
// Clinician modification (pre-approval only)
// ---------------------------------------------------------------------------

async function addExercise(db, { versionId, exercise, actor }) {
  requireActor(actor);
  const version = await getVersion(db, versionId);
  assertMutable(version);

  if (!exercise || !exercise.exercise_code) {
    throw new ProtocolStoreError('exercise_code is required', ERR.INVALID);
  }

  await db.run(
    `INSERT INTO protocol_version_exercises
       (version_id, week_number, exercise_code, exercise_name, phase, sort_order, origin, clinician_note,
        sets, reps, frequency, duration_minutes, dosage_override)
     VALUES (?, ?, ?, ?, ?, ?, 'CLINICIAN', ?, ?, ?, ?, ?, ?)`,
    [
      versionId,
      exercise.week_number ?? 1,
      exercise.exercise_code,
      exercise.exercise_name ?? null,
      exercise.phase ?? null,
      exercise.sort_order ?? 9999,
      exercise.clinician_note ?? null,
      exercise.sets ?? null,
      exercise.reps ?? null,
      exercise.frequency ?? null,
      exercise.duration_minutes ?? null,
      exercise.dosage_override ?? null,
    ]
  );

  await audit(db, {
    protocolId: version.protocol_id,
    versionId,
    action: AUDIT.EXERCISE_ADDED,
    actor,
    // Recorded explicitly: a clinician-added exercise did not pass the engine's
    // safety gates. Review and B.E.A.U. must be able to see that.
    detail: { exercise_code: exercise.exercise_code, bypassed_engine_gates: true },
  });

  return getVersion(db, versionId);
}

async function removeExercise(db, { versionId, exerciseRowId, actor, reason }) {
  requireActor(actor);
  const version = await getVersion(db, versionId);
  assertMutable(version);

  const row = await db.get(
    `SELECT * FROM protocol_version_exercises WHERE id = ? AND version_id = ?`,
    [exerciseRowId, versionId]
  );
  if (!row) throw new ProtocolStoreError(`Exercise row ${exerciseRowId} not found`, ERR.NOT_FOUND);

  await db.run(`DELETE FROM protocol_version_exercises WHERE id = ?`, [exerciseRowId]);
  await audit(db, {
    protocolId: version.protocol_id,
    versionId,
    action: AUDIT.EXERCISE_REMOVED,
    actor,
    detail: { exercise_code: row.exercise_code, reason: reason ?? null },
  });

  return getVersion(db, versionId);
}

async function addRestriction(db, { versionId, restrictionType, detail, actor }) {
  requireActor(actor);
  const version = await getVersion(db, versionId);
  assertMutable(version);

  await db.run(
    `INSERT INTO protocol_version_restrictions (version_id, restriction_type, detail, source)
     VALUES (?, ?, ?, 'CLINICIAN')`,
    [versionId, restrictionType || 'SAFETY_INSTRUCTION', detail]
  );
  await audit(db, {
    protocolId: version.protocol_id,
    versionId,
    action: AUDIT.VERSION_MODIFIED,
    actor,
    detail: { added_restriction: detail },
  });
  return getVersion(db, versionId);
}

// ---------------------------------------------------------------------------
// Approval
// ---------------------------------------------------------------------------

/**
 * Legacy synchronous role check.
 *
 * Superseded by authority.resolveApprovalAuthority, which also evaluates
 * credential validity. Retained only because a role that is not even
 * potentially an approver can be rejected without a database round trip.
 */
function canApprove(actor) {
  return Boolean(actor && actor.role && APPROVAL_ROLES.has(String(actor.role).toLowerCase()));
}

/**
 * Approve a version. This is the moment a recommendation becomes a prescription.
 *
 * Enforces I2 (role), I1/I5 (supersession rather than mutation) and I4 (content
 * binding). Supersedes any previously approved version of the same protocol and
 * revokes its active B.E.A.U. handoff, so a patient never holds two live
 * prescriptions.
 */
async function approveVersion(db, { versionId, actor, note, gateConfirmations: approvalGateConfirmations }) {
  requireActor(actor);
  const version = await getVersion(db, versionId);

  // Authority has two bases: a veterinarian approves by licensure, a
  // rehabilitation practitioner by a CURRENT credential. The resolver returns
  // which one applied, and that goes onto the approval record — "role =
  // clinician" is not a sufficient clinical record of who authorized treatment.
  const authorityCheck = await authority.resolveApprovalAuthority(db, { actor });

  if (!authorityCheck.allowed) {
    await audit(db, {
      protocolId: version.protocol_id,
      versionId,
      action: AUDIT.APPROVAL_REJECTED,
      actor,
      detail: { reason: authorityCheck.reason, role: actor.role },
    });
    const err = new ProtocolStoreError(
      authority.explainDenial(authorityCheck.reason, actor),
      ERR.FORBIDDEN
    );
    err.reason = authorityCheck.reason;
    throw err;
  }

  if (version.status === VERSION_STATUS.APPROVED || version.status === VERSION_STATUS.HANDED_OFF) {
    throw new ProtocolStoreError(`Version ${versionId} is already approved`, ERR.IMMUTABLE);
  }

  const allowed = ALLOWED_TRANSITIONS[version.status] || [];
  if (!allowed.includes(VERSION_STATUS.APPROVED)) {
    throw new ProtocolStoreError(
      `Version ${versionId} cannot be approved from status ${version.status}. ` +
        `Move it to REVIEW first.`,
      ERR.ILLEGAL_TRANSITION
    );
  }

  // ── Safety gates must be confirmed by a person ──────────────────────────
  //
  // The intake proposal fills these in at their most cautious value so a
  // clinician verifies rather than types. That only means something if
  // something refuses when nobody verified. A screen that displayed a gate is
  // not the same as a clinician who confirmed it, and the difference is
  // invisible by the time a protocol reaches a pet owner.
  //
  // Enforced here rather than in the route or the UI: this is the last point
  // before a protocol acquires a signature, and every path to approval passes
  // through it.
  let requiredGates = [];
  try {
    requiredGates = JSON.parse(version.safety_gates_json || '[]');
  } catch { requiredGates = []; }

  if (requiredGates.length) {
    const confirmations = (note && typeof note === 'object' && note.gateConfirmations)
      || approvalGateConfirmations
      || {};
    const outstanding = requiredGates.filter((f) => confirmations[f] !== true);
    if (outstanding.length) {
      await audit(db, {
        protocolId: version.protocol_id,
        versionId,
        action: AUDIT.APPROVAL_REJECTED,
        actor,
        detail: { reason: 'GATES_UNCONFIRMED', outstanding },
      });
      const err = new ProtocolStoreError(
        `Cannot approve: ${outstanding.length} safety gate` +
          `${outstanding.length === 1 ? '' : 's'} not confirmed — ` +
          outstanding.join(', '),
        ERR.GATES_UNCONFIRMED
      );
      err.outstanding = outstanding;
      throw err;
    }
  }

  const contentHash = hashContent(versionContent(version));

  // Supersede the previously approved/handed-off version of this protocol.
  const prior = await db.get(
    `SELECT * FROM protocol_versions
      WHERE protocol_id = ? AND id != ? AND status IN ('APPROVED','HANDED_OFF')`,
    [version.protocol_id, versionId]
  );

  const credential = authorityCheck.credential;
  await db.run(
    `INSERT INTO protocol_approvals
       (version_id, approved_by, approver_username, approver_role, approval_note,
        approval_basis, approver_credential, credential_id, content_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      versionId, actor.id, actor.username, actor.role, note ?? null,
      authorityCheck.basis,
      credential ? credential.credential : null,
      credential ? credential.id : null,
      contentHash,
    ]
  );

  await db.run(`UPDATE protocol_versions SET status = 'APPROVED' WHERE id = ?`, [versionId]);
  await db.run(`UPDATE protocols SET status = 'APPROVED', current_version_id = ? WHERE id = ?`, [
    versionId,
    version.protocol_id,
  ]);

  await audit(db, {
    protocolId: version.protocol_id,
    versionId,
    patientId: (await getProtocol(db, version.protocol_id)).patient_id,
    action: AUDIT.PROTOCOL_APPROVED,
    actor,
    detail: {
      version_number: version.version_number,
      content_hash: contentHash,
      note: note ?? null,
      approval_basis: authorityCheck.basis,
      approver_credential: authorityCheck.credential ? authorityCheck.credential.credential : null,
    },
  });

  if (prior) {
    await db.run(
      `UPDATE protocol_versions
          SET status = 'SUPERSEDED', superseded_by_version_id = ?, superseded_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [versionId, prior.id]
    );
    await audit(db, {
      protocolId: version.protocol_id,
      versionId: prior.id,
      action: AUDIT.PROTOCOL_SUPERSEDED,
      actor,
      detail: { superseded_by_version_id: versionId },
    });

    // I5: the old home prescription must stop being live the moment a new one
    // is approved, or the owner keeps following a withdrawn plan.
    const activeHandoffs = await db.all(
      `SELECT * FROM beau_handoffs WHERE version_id = ? AND status = 'ACTIVE'`,
      [prior.id]
    );
    for (const handoff of activeHandoffs) {
      await db.run(
        `UPDATE beau_handoffs SET status = 'SUPERSEDED', superseded_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [handoff.id]
      );
      await audit(db, {
        protocolId: version.protocol_id,
        versionId: prior.id,
        action: AUDIT.HANDOFF_REVOKED,
        actor,
        detail: { handoff_id: handoff.id, reason: 'superseded_by_new_approval' },
      });
    }
  }

  return getVersion(db, versionId);
}

/**
 * Revise an approved version: clones it into a new DRAFT version rather than
 * editing it (I1). The approved version stays intact as historical record.
 */
async function reviseApprovedVersion(db, { versionId, actor }) {
  requireActor(actor);
  const source = await getVersion(db, versionId);

  const nextRow = await db.get(
    `SELECT COALESCE(MAX(version_number), 0) + 1 AS next FROM protocol_versions WHERE protocol_id = ?`,
    [source.protocol_id]
  );

  const result = await db.run(
    `INSERT INTO protocol_versions
       (protocol_id, version_number, status, engine_input_json, derived_flags_json,
        engine_warnings_json, protocol_type, total_weeks, frequency, created_by)
     VALUES (?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?, ?)`,
    [
      source.protocol_id,
      nextRow.next,
      source.engine_input_json,
      source.derived_flags_json,
      source.engine_warnings_json,
      source.protocol_type,
      source.total_weeks,
      source.frequency,
      actor.id,
    ]
  );
  const newVersionId = result.lastID;

  for (const ex of source.exercises) {
    await db.run(
      `INSERT INTO protocol_version_exercises
         (version_id, week_number, exercise_code, exercise_name, phase, sort_order, origin, clinician_note,
          sets, reps, frequency, duration_minutes, dosage_override,
          equipment, progression, contraindications, red_flags, evidence_citation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newVersionId, ex.week_number, ex.exercise_code, ex.exercise_name, ex.phase,
       ex.sort_order, ex.origin, ex.clinician_note,
       ex.sets, ex.reps, ex.frequency, ex.duration_minutes, ex.dosage_override,
       serializeField(ex.equipment), serializeField(ex.progression),
       serializeField(ex.contraindications), serializeField(ex.red_flags),
       serializeField(ex.evidence_citation)]
    );
  }
  for (const r of source.restrictions) {
    await db.run(
      `INSERT INTO protocol_version_restrictions (version_id, restriction_type, detail, source)
       VALUES (?, ?, ?, ?)`,
      [newVersionId, r.restriction_type, r.detail, r.source]
    );
  }

  await audit(db, {
    protocolId: source.protocol_id,
    versionId: newVersionId,
    action: AUDIT.VERSION_CREATED,
    actor,
    detail: { revised_from_version_id: versionId, version_number: nextRow.next },
  });

  return getVersion(db, newVersionId);
}

/**
 * Re-hash a version's stored content and compare it to what was approved (I4).
 *
 * A mismatch means the database no longer holds what the clinician signed. The
 * approval is reported invalid rather than silently trusted.
 */
async function verifyApprovalIntegrity(db, versionId) {
  const version = await getVersion(db, versionId);
  if (!version.approval) {
    return { verified: false, reason: 'NOT_APPROVED', versionId };
  }
  const currentHash = hashContent(versionContent(version));
  const intact = currentHash === version.approval.content_hash;
  return {
    verified: intact,
    reason: intact ? null : 'CONTENT_HASH_MISMATCH',
    versionId,
    approvedHash: version.approval.content_hash,
    currentHash,
  };
}

// ---------------------------------------------------------------------------
// B.E.A.U. handoff
// ---------------------------------------------------------------------------

/**
 * Build the approved HEP contract — the formal K9 -> B.E.A.U. boundary.
 * Contains the prescription and its safety envelope, and nothing that would let
 * B.E.A.U. reconstruct or alter clinical reasoning.
 */
function buildHepPayload(protocol, version) {
  return {
    contract_version: '1.0',
    patient_id: protocol.patient_id,
    patient_name: protocol.patient_name,
    protocol_id: version.protocol_id,
    protocol_version_id: version.id,
    protocol_version_number: version.version_number,
    effective_date: version.approval.approved_at,
    protocol_type: version.protocol_type,
    total_weeks: version.total_weeks,
    frequency: version.frequency,
    // ONLY what the owner is to perform. Clinic-delivered work — Class IV
    // laser, NMES, underwater treadmill — is excluded here and travels in
    // `clinic_protocol` for the CCRT instead. Sending a pet owner an exercise
    // that needs a trained operator is a safety failure, not a UX one.
    exercises: version.exercises
      .filter((e) => e.venue !== 'CLINIC' && (e.home_selected === 1 || e.origin === 'CLINICIAN'))
      .map((e) => ({
      week_number: e.week_number,
      exercise_code: e.exercise_code,
      exercise_name: e.exercise_name,
      phase: e.phase,
      origin: e.origin,
      // Dosage as prescribed. `dosage_override`, when set, is the clinician's
      // instruction and takes precedence over the engine's sets/reps.
      sets: e.sets,
      reps: e.reps,
      frequency: e.frequency,
      duration_minutes: e.duration_minutes,
      dosage_override: e.dosage_override,
      // Home-execution payload. `equipment` is what B.E.A.U. computes household
      // substitutions against; `red_flags` is what tells an owner to stop.
      equipment: e.equipment,
      progression: e.progression,
      contraindications: e.contraindications,
      red_flags: e.red_flags,
      evidence_citation: e.evidence_citation,
      selection_reason: e.selection_reason,
    })),

    // The in-clinic protocol: what the veterinarian has prescribed for the
    // CCRT/CCRP to deliver in the practice. Carried on the same approved
    // version so home and clinic work cannot drift apart, and so B.E.A.U. can
    // show the owner what happens at their appointment without offering it as
    // something to attempt themselves.
    clinic_protocol: version.exercises
      .filter((e) => e.venue === 'CLINIC')
      .map((e) => ({
        week_number: e.week_number,
        exercise_code: e.exercise_code,
        exercise_name: e.exercise_name,
        phase: e.phase,
        sets: e.sets,
        reps: e.reps,
        frequency: e.frequency,
        duration_minutes: e.duration_minutes,
        venue_reason: e.venue_reason,
      })),

    restrictions: version.restrictions.map((r) => ({
      type: r.restriction_type,
      detail: r.detail,
      source: r.source,
    })),
    // Which safety gates fired. B.E.A.U. must not re-derive these, but it needs
    // them to refuse unsafe household substitutions.
    active_safety_gates: Object.entries(version.derived_flags)
      .filter(([, fired]) => fired === true)
      .map(([flag]) => flag),
    approval: {
      approved_by: version.approval.approved_by,
      approver_username: version.approval.approver_username,
      approver_role: version.approval.approver_role,
      // The basis and credential the approval rested on. An owner is entitled
      // to know their dog's home program was authorized by a veterinarian or
      // a certified rehabilitation practitioner, and which.
      approval_basis: version.approval.approval_basis,
      approver_credential: version.approval.approver_credential,
      approved_at: version.approval.approved_at,
      content_hash: version.approval.content_hash,
    },
    beau_permissions: {
      may_adapt_execution_to_home_environment: true,
      may_substitute_household_equipment: true,
      may_record_adherence_and_observations: true,
      may_modify_prescription: false,
      may_change_dosage: false,
      may_change_frequency: false,
      may_add_or_remove_exercises: false,
      may_override_restrictions: false,
    },
  };
}

/** Hand an APPROVED version to B.E.A.U. (I3). */
async function handoffToBeau(db, { versionId, actor }) {
  requireActor(actor);
  const version = await getVersion(db, versionId);

  if (version.status !== VERSION_STATUS.APPROVED) {
    throw new ProtocolStoreError(
      `Only an APPROVED version may be handed off to B.E.A.U. Version ${versionId} is ${version.status}.`,
      ERR.NOT_APPROVED
    );
  }

  // I4: never hand off content that no longer matches what was approved.
  const integrity = await verifyApprovalIntegrity(db, versionId);
  if (!integrity.verified) {
    await audit(db, {
      protocolId: version.protocol_id,
      versionId,
      action: AUDIT.INTEGRITY_FAILURE,
      actor,
      detail: integrity,
    });
    throw new ProtocolStoreError(
      `Version ${versionId} failed approval integrity check (${integrity.reason}). Handoff refused.`,
      ERR.INTEGRITY
    );
  }

  const protocol = await getProtocol(db, version.protocol_id);
  const payload = buildHepPayload(protocol, version);
  const payloadHash = hashContent(payload);

  const result = await db.run(
    `INSERT INTO beau_handoffs
       (protocol_id, version_id, patient_id, handoff_payload_json, payload_hash, status, handed_off_by)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)`,
    [version.protocol_id, versionId, protocol.patient_id, JSON.stringify(payload), payloadHash, actor.id]
  );

  await db.run(`UPDATE protocol_versions SET status = 'HANDED_OFF' WHERE id = ?`, [versionId]);
  await db.run(`UPDATE protocols SET status = 'HANDED_OFF' WHERE id = ?`, [version.protocol_id]);

  await audit(db, {
    protocolId: version.protocol_id,
    versionId,
    patientId: protocol.patient_id,
    action: AUDIT.HEP_HANDED_OFF,
    actor,
    detail: { handoff_id: result.lastID, payload_hash: payloadHash },
  });

  return { id: result.lastID, payload, payload_hash: payloadHash, status: 'ACTIVE' };
}

async function getActiveHandoff(db, patientId) {
  const row = await db.get(
    `SELECT * FROM beau_handoffs WHERE patient_id = ? AND status = 'ACTIVE'
      ORDER BY handed_off_at DESC LIMIT 1`,
    [patientId]
  );
  if (!row) return null;
  return { ...row, payload: JSON.parse(row.handoff_payload_json) };
}

async function revokeHandoff(db, { handoffId, actor, reason }) {
  requireActor(actor);
  const row = await db.get(`SELECT * FROM beau_handoffs WHERE id = ?`, [handoffId]);
  if (!row) throw new ProtocolStoreError(`Handoff ${handoffId} not found`, ERR.NOT_FOUND);

  await db.run(
    `UPDATE beau_handoffs SET status = 'REVOKED', revoked_at = CURRENT_TIMESTAMP, revoked_reason = ? WHERE id = ?`,
    [reason ?? null, handoffId]
  );
  await audit(db, {
    protocolId: row.protocol_id,
    versionId: row.version_id,
    patientId: row.patient_id,
    action: AUDIT.HANDOFF_REVOKED,
    actor,
    detail: { handoff_id: handoffId, reason: reason ?? null },
  });
  return getActiveHandoff(db, row.patient_id);
}

// ---------------------------------------------------------------------------
// Audit read
// ---------------------------------------------------------------------------

async function getAuditTrail(db, protocolId) {
  return db.all(
    `SELECT * FROM protocol_audit_events WHERE protocol_id = ? ORDER BY id`,
    [protocolId]
  );
}

module.exports = {
  VERSION_STATUS,
  ALLOWED_TRANSITIONS,
  APPROVAL_ROLES,
  AUDIT,
  ProtocolStoreError,
  ERR,

  createTables,
  hashContent,
  canonical,
  serializeField,
  deserializeField,

  createProtocol,
  getProtocol,
  listProtocolsForPatient,

  createVersion,
  getVersion,
  listVersions,
  setStatus,
  versionContent,

  addExercise,
  removeExercise,
  addRestriction,

  canApprove,
  authority,
  approveVersion,
  reviseApprovedVersion,
  verifyApprovalIntegrity,

  buildHepPayload,
  handoffToBeau,
  getActiveHandoff,
  revokeHandoff,

  getAuditTrail,
};
