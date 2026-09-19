/**
 * K9 Clinical Workflow V2 — In-clinic treatment sessions
 *
 *   Vet approves protocol -> CCRT delivers it in practice -> records how the
 *   patient did -> vet reviews -> recheck if needed
 *
 * INVARIANTS ENFORCED HERE
 * ------------------------
 * C1. A session may only deliver an APPROVED (or handed-off) protocol version.
 *     Treatment is delivered from an authorisation, never from a draft.
 * C2. The practitioner records what was DELIVERED. They cannot change the
 *     prescription. A reduction is stored as a deviation with its reason, and
 *     the prescribed values stay intact beside it.
 * C3. A COMPLETED session is immutable. It is a clinical record of what
 *     happened, not a working document.
 * C4. A recheck request is a state, not a note. Only a clinician may respond to
 *     one; the practitioner who raised it may withdraw it but not resolve it,
 *     because a concern must not be closed by the person who is not deciding.
 * C5. Every action is audited, with the actor and their role.
 */

'use strict';

const { ProtocolStoreError, ERR, AUDIT } = require('./protocol-store');
const authority = require('./authority');

const SESSION_STATUS = { IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED' };
const TOLERANCE = ['WELL', 'FAIR', 'POORLY'];
const URGENCY = ['ROUTINE', 'SOON', 'URGENT'];
const ASSISTANCE = ['INDEPENDENT', 'MINIMAL', 'MODERATE', 'MAXIMAL'];

const RECHECK_STATUS = {
  OPEN: 'OPEN',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  SCHEDULED: 'SCHEDULED',
  RESOLVED: 'RESOLVED',
  DECLINED: 'DECLINED',
  WITHDRAWN: 'WITHDRAWN',
};

/** Statuses that still need a clinician's attention. */
const OPEN_RECHECK_STATUSES = [RECHECK_STATUS.OPEN, RECHECK_STATUS.ACKNOWLEDGED, RECHECK_STATUS.SCHEDULED];

const SESSION_AUDIT = {
  SESSION_STARTED: 'CLINIC_SESSION_STARTED',
  SESSION_COMPLETED: 'CLINIC_SESSION_COMPLETED',
  SESSION_REVIEWED: 'CLINIC_SESSION_REVIEWED',
  EXERCISE_DELIVERED: 'CLINIC_EXERCISE_DELIVERED',
  RECHECK_REQUESTED: 'RECHECK_REQUESTED',
  RECHECK_ANSWERED: 'RECHECK_ANSWERED',
};

function requireActor(actor) {
  if (!actor || actor.id === undefined || actor.id === null || !actor.username) {
    throw new ProtocolStoreError('An identified actor is required for every clinical write', ERR.INVALID);
  }
}

async function audit(db, { patientId, versionId, action, actor, detail }) {
  await db.run(
    `INSERT INTO protocol_audit_events
       (patient_id, version_id, action, actor_id, actor_username, actor_role, source_system, detail_json)
     VALUES (?, ?, ?, ?, ?, ?, 'K9', ?)`,
    [
      patientId ?? null, versionId ?? null, action,
      actor?.id ?? null, actor?.username ?? null, actor?.role ?? null,
      detail ? JSON.stringify(detail) : null,
    ]
  );
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

/**
 * Start a session against an approved protocol version.
 *
 * The version's clinic-venue exercises are copied in as a checklist, with their
 * prescribed dosage frozen at this moment (C2): a later protocol revision must
 * not rewrite what this session was authorised to deliver.
 */
async function startSession(db, { patientId, versionId, sessionDate, actor }) {
  requireActor(actor);
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!versionId) throw new ProtocolStoreError('versionId is required', ERR.INVALID);
  if (!sessionDate) throw new ProtocolStoreError('sessionDate is required', ERR.INVALID);

  const version = await db.get(`SELECT * FROM protocol_versions WHERE id = ?`, [versionId]);
  if (!version) throw new ProtocolStoreError(`Version ${versionId} not found`, ERR.NOT_FOUND);

  // C1 — treatment is delivered from an authorisation.
  if (!['APPROVED', 'HANDED_OFF'].includes(version.status)) {
    throw new ProtocolStoreError(
      `Version ${versionId} is ${version.status}. A treatment session may only deliver an ` +
        `approved protocol — a veterinarian has not authorised this one.`,
      ERR.NOT_APPROVED
    );
  }

  const priorCount = await db.get(
    `SELECT COUNT(*) n FROM clinic_sessions WHERE patient_id = ?`, [patientId]);

  const created = await db.run(
    `INSERT INTO clinic_sessions
       (patient_id, version_id, session_date, session_number,
        therapist_id, therapist_username, therapist_role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS')`,
    [patientId, versionId, sessionDate, priorCount.n + 1,
     actor.id, actor.username, actor.role ?? null]
  );
  const sessionId = created.lastID;

  // The in-clinic checklist: exercises the venue classifier marked CLINIC.
  const prescribed = await db.all(
    `SELECT * FROM protocol_version_exercises
      WHERE version_id = ? AND venue = 'CLINIC'
      ORDER BY week_number, sort_order`,
    [versionId]
  );

  let order = 0;
  const seen = new Set();
  for (const ex of prescribed) {
    if (seen.has(ex.exercise_code)) continue; // one row per exercise, not per week
    seen.add(ex.exercise_code);
    await db.run(
      `INSERT INTO clinic_session_exercises
         (session_id, exercise_code, exercise_name,
          prescribed_sets, prescribed_reps, prescribed_duration, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, ex.exercise_code, ex.exercise_name, ex.sets, ex.reps, ex.duration_minutes, order++]
    );
  }

  await audit(db, {
    patientId, versionId, action: SESSION_AUDIT.SESSION_STARTED, actor,
    detail: { session_id: sessionId, prescribed_exercises: seen.size },
  });

  return getSession(db, sessionId);
}

async function getSession(db, sessionId) {
  const session = await db.get(`SELECT * FROM clinic_sessions WHERE id = ?`, [sessionId]);
  if (!session) throw new ProtocolStoreError(`Session ${sessionId} not found`, ERR.NOT_FOUND);

  const exercises = await db.all(
    `SELECT * FROM clinic_session_exercises WHERE session_id = ? ORDER BY sort_order, id`,
    [sessionId]
  );
  const rechecks = await db.all(
    `SELECT * FROM recheck_requests WHERE session_id = ? ORDER BY id`, [sessionId]);

  return { ...session, exercises, recheck_requests: rechecks };
}

async function listSessions(db, patientId) {
  return db.all(
    `SELECT * FROM clinic_sessions WHERE patient_id = ? ORDER BY session_date DESC, id DESC`,
    [patientId]
  );
}

function assertInProgress(session) {
  if (session.status === SESSION_STATUS.COMPLETED) {
    throw new ProtocolStoreError(
      `Session ${session.id} is completed and cannot be changed. It records what happened; ` +
        `record a new session rather than rewriting one.`,
      ERR.IMMUTABLE
    );
  }
}

/**
 * Record delivery of one exercise (C2).
 *
 * Prescribed values are never touched. A shortfall is a deviation, and a
 * deviation without a reason is refused — "why not" is the clinically
 * interesting part, and a pattern of them is the signal that a protocol needs
 * revising.
 */
async function recordDelivery(db, { sessionId, exerciseRowId, delivery, actor }) {
  requireActor(actor);
  const session = await getSession(db, sessionId);
  assertInProgress(session);

  const row = await db.get(
    `SELECT * FROM clinic_session_exercises WHERE id = ? AND session_id = ?`,
    [exerciseRowId, sessionId]
  );
  if (!row) throw new ProtocolStoreError(`Exercise row ${exerciseRowId} not found`, ERR.NOT_FOUND);

  const d = delivery || {};
  const completed = d.completed === true || d.completed === 1 ? 1 : 0;

  if (!completed && !d.deviation_reason) {
    throw new ProtocolStoreError(
      `${row.exercise_code} was not delivered as prescribed. Record why — a deviation ` +
        `without a reason cannot be interpreted at review.`,
      ERR.INVALID
    );
  }
  if (d.assistance_level && !ASSISTANCE.includes(d.assistance_level)) {
    throw new ProtocolStoreError(
      `assistance_level must be one of ${ASSISTANCE.join(', ')}`, ERR.INVALID);
  }

  await db.run(
    `UPDATE clinic_session_exercises
        SET performed_sets = ?, performed_reps = ?, performed_duration = ?,
            completed = ?, deviation_reason = ?, assistance_level = ?,
            surface_type = ?, observed_compensations = ?, performance_notes = ?
      WHERE id = ?`,
    [
      d.performed_sets ?? null, d.performed_reps ?? null, d.performed_duration ?? null,
      completed, d.deviation_reason ?? null, d.assistance_level ?? null,
      d.surface_type ?? null, d.observed_compensations ?? null, d.performance_notes ?? null,
      exerciseRowId,
    ]
  );

  await audit(db, {
    patientId: session.patient_id, versionId: session.version_id,
    action: SESSION_AUDIT.EXERCISE_DELIVERED, actor,
    detail: {
      session_id: sessionId, exercise_code: row.exercise_code,
      completed: Boolean(completed), deviation_reason: d.deviation_reason ?? null,
    },
  });

  return getSession(db, sessionId);
}

/** Record the session-level measures a practitioner takes. */
async function recordSessionMeasures(db, { sessionId, measures, actor }) {
  requireActor(actor);
  const session = await getSession(db, sessionId);
  assertInProgress(session);

  const m = measures || {};
  if (m.tolerance && !TOLERANCE.includes(m.tolerance)) {
    throw new ProtocolStoreError(`tolerance must be one of ${TOLERANCE.join(', ')}`, ERR.INVALID);
  }

  await db.run(
    `UPDATE clinic_sessions
        SET pre_session_pain = ?, post_session_pain = ?,
            pre_session_lameness = ?, post_session_lameness = ?,
            tolerance = ?, session_notes = ?
      WHERE id = ?`,
    [
      m.pre_session_pain ?? session.pre_session_pain ?? null,
      m.post_session_pain ?? session.post_session_pain ?? null,
      m.pre_session_lameness ?? session.pre_session_lameness ?? null,
      m.post_session_lameness ?? session.post_session_lameness ?? null,
      m.tolerance ?? session.tolerance ?? null,
      m.session_notes ?? session.session_notes ?? null,
      sessionId,
    ]
  );
  return getSession(db, sessionId);
}

/** Close the session (C3 — it becomes immutable). */
async function completeSession(db, { sessionId, actor }) {
  requireActor(actor);
  const session = await getSession(db, sessionId);
  assertInProgress(session);

  await db.run(
    `UPDATE clinic_sessions SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [sessionId]
  );

  const delivered = session.exercises.filter((e) => e.completed === 1).length;
  const deviations = session.exercises.filter((e) => e.completed !== 1).length;
  const painChange =
    session.post_session_pain !== null && session.pre_session_pain !== null
      ? session.post_session_pain - session.pre_session_pain
      : null;

  await audit(db, {
    patientId: session.patient_id, versionId: session.version_id,
    action: SESSION_AUDIT.SESSION_COMPLETED, actor,
    detail: { session_id: sessionId, delivered, deviations, pain_change: painChange },
  });

  return getSession(db, sessionId);
}

/** The veterinarian reading the record — "see how the patient did". */
async function reviewSession(db, { sessionId, actor, note }) {
  requireActor(actor);
  const session = await getSession(db, sessionId);

  const check = await authority.resolveApprovalAuthority(db, { actor });
  if (!check.allowed) {
    throw new ProtocolStoreError(
      `${actor.username} cannot sign off a treatment session. ` +
        authority.explainDenial(check.reason, actor),
      ERR.FORBIDDEN
    );
  }

  await db.run(
    `UPDATE clinic_sessions
        SET reviewed_by = ?, reviewed_by_username = ?, reviewed_at = CURRENT_TIMESTAMP, review_note = ?
      WHERE id = ?`,
    [actor.id, actor.username, note ?? null, sessionId]
  );

  await audit(db, {
    patientId: session.patient_id, versionId: session.version_id,
    action: SESSION_AUDIT.SESSION_REVIEWED, actor,
    detail: { session_id: sessionId, note: note ?? null },
  });

  return getSession(db, sessionId);
}

/** Sessions the veterinarian has not yet looked at. */
async function listUnreviewedSessions(db, patientId) {
  const params = [];
  let sql = `SELECT * FROM clinic_sessions WHERE status = 'COMPLETED' AND reviewed_at IS NULL`;
  if (patientId) { sql += ` AND patient_id = ?`; params.push(patientId); }
  sql += ` ORDER BY session_date DESC, id DESC`;
  return db.all(sql, params);
}

// ---------------------------------------------------------------------------
// Recheck requests
// ---------------------------------------------------------------------------

/**
 * The practitioner raising a concern (C4).
 *
 * Deliberately a row with a status rather than a line in session_notes:
 * "increased pain, recommend recheck" buried in free text is a concern nobody
 * is accountable for. As a state it can be surfaced on the patient snapshot and
 * must be answered.
 */
async function requestRecheck(db, { patientId, sessionId, versionId, urgency, reason, findings, actor }) {
  requireActor(actor);
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!reason) throw new ProtocolStoreError('A reason is required to request a recheck', ERR.INVALID);

  const level = urgency || 'ROUTINE';
  if (!URGENCY.includes(level)) {
    throw new ProtocolStoreError(`urgency must be one of ${URGENCY.join(', ')}`, ERR.INVALID);
  }

  const created = await db.run(
    `INSERT INTO recheck_requests
       (patient_id, session_id, version_id, raised_by, raised_by_username, raised_by_role,
        urgency, reason, clinical_findings, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
    [patientId, sessionId ?? null, versionId ?? null,
     actor.id, actor.username, actor.role ?? null, level, reason, findings ?? null]
  );

  await audit(db, {
    patientId, versionId, action: SESSION_AUDIT.RECHECK_REQUESTED, actor,
    detail: { recheck_id: created.lastID, urgency: level, reason },
  });

  return getRecheck(db, created.lastID);
}

async function getRecheck(db, id) {
  const row = await db.get(`SELECT * FROM recheck_requests WHERE id = ?`, [id]);
  if (!row) throw new ProtocolStoreError(`Recheck request ${id} not found`, ERR.NOT_FOUND);
  return row;
}

/** Open concerns — what makes the veterinarian "aware" without opening a chart. */
async function listOpenRechecks(db, patientId) {
  const placeholders = OPEN_RECHECK_STATUSES.map(() => '?').join(',');
  const params = [...OPEN_RECHECK_STATUSES];
  let sql = `SELECT * FROM recheck_requests WHERE status IN (${placeholders})`;
  if (patientId) { sql += ` AND patient_id = ?`; params.push(patientId); }
  // URGENT first, then oldest — a concern should not age quietly.
  sql += ` ORDER BY CASE urgency WHEN 'URGENT' THEN 0 WHEN 'SOON' THEN 1 ELSE 2 END, raised_at`;
  return db.all(sql, params);
}

/**
 * The veterinarian answering (C4).
 *
 * Only a clinician may respond. The practitioner who raised it may withdraw it
 * — see withdrawRecheck — but not resolve it.
 */
async function respondToRecheck(db, { recheckId, status, response, actor }) {
  requireActor(actor);
  const recheck = await getRecheck(db, recheckId);

  const check = await authority.resolveApprovalAuthority(db, { actor });
  if (!check.allowed) {
    throw new ProtocolStoreError(
      `${actor.username} cannot answer a recheck request. ` +
        authority.explainDenial(check.reason, actor),
      ERR.FORBIDDEN
    );
  }

  const allowed = [RECHECK_STATUS.ACKNOWLEDGED, RECHECK_STATUS.SCHEDULED,
                   RECHECK_STATUS.RESOLVED, RECHECK_STATUS.DECLINED];
  if (!allowed.includes(status)) {
    throw new ProtocolStoreError(`status must be one of ${allowed.join(', ')}`, ERR.INVALID);
  }
  if (recheck.status === RECHECK_STATUS.WITHDRAWN) {
    throw new ProtocolStoreError('This request was withdrawn by the practitioner who raised it', ERR.IMMUTABLE);
  }
  // Declining a concern without saying why leaves the practitioner who raised
  // it with no answer, and the record with no reasoning.
  if (status === RECHECK_STATUS.DECLINED && !response) {
    throw new ProtocolStoreError('Declining a recheck request requires a response', ERR.INVALID);
  }

  const resolving = [RECHECK_STATUS.RESOLVED, RECHECK_STATUS.DECLINED].includes(status);
  await db.run(
    `UPDATE recheck_requests
        SET status = ?, acknowledged_by = ?, acknowledged_by_username = ?,
            acknowledged_at = COALESCE(acknowledged_at, CURRENT_TIMESTAMP),
            vet_response = ?, resolved_at = ${resolving ? 'CURRENT_TIMESTAMP' : 'NULL'}
      WHERE id = ?`,
    [status, actor.id, actor.username, response ?? recheck.vet_response ?? null, recheckId]
  );

  await audit(db, {
    patientId: recheck.patient_id, versionId: recheck.version_id,
    action: SESSION_AUDIT.RECHECK_ANSWERED, actor,
    detail: { recheck_id: recheckId, status, response: response ?? null },
  });

  return getRecheck(db, recheckId);
}

/** The practitioner who raised a concern standing it down. */
async function withdrawRecheck(db, { recheckId, actor, reason }) {
  requireActor(actor);
  const recheck = await getRecheck(db, recheckId);

  if (Number(recheck.raised_by) !== Number(actor.id)) {
    throw new ProtocolStoreError(
      `Only ${recheck.raised_by_username}, who raised this concern, can withdraw it.`,
      ERR.FORBIDDEN
    );
  }
  if (recheck.status !== RECHECK_STATUS.OPEN) {
    throw new ProtocolStoreError(
      `This request has already been answered by a clinician and cannot be withdrawn.`,
      ERR.IMMUTABLE
    );
  }

  await db.run(
    `UPDATE recheck_requests SET status = 'WITHDRAWN', vet_response = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [reason ?? null, recheckId]
  );
  await audit(db, {
    patientId: recheck.patient_id, action: SESSION_AUDIT.RECHECK_ANSWERED, actor,
    detail: { recheck_id: recheckId, status: 'WITHDRAWN', reason: reason ?? null },
  });
  return getRecheck(db, recheckId);
}

module.exports = {
  SESSION_STATUS, TOLERANCE, URGENCY, ASSISTANCE, RECHECK_STATUS,
  OPEN_RECHECK_STATUSES, SESSION_AUDIT,

  startSession, getSession, listSessions,
  recordDelivery, recordSessionMeasures, completeSession,
  reviewSession, listUnreviewedSessions,

  requestRecheck, getRecheck, listOpenRechecks, respondToRecheck, withdrawRecheck,
};
