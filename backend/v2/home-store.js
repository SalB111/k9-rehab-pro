/**
 * K9 Clinical Workflow V2 — home execution and the client feedback loop
 *
 *   owner opens the app -> performs the approved HEP -> answers a few short
 *   questions -> optionally submits a requested video -> it lands on the chart
 *   -> a clinician reads it -> the clinical record advances
 *
 * INVARIANTS ENFORCED HERE
 * ------------------------
 * H1. A home session may only be logged against the ACTIVE handoff. An owner
 *     cannot report against a prescription that has been superseded.
 * H2. Owner-reported data is owner-reported. It is stored apart from
 *     `visit_measurements` and is never written into the clinical trend. An
 *     owner's pain estimate and a clinician's pain score measure different
 *     things; blending them makes the trend that drives the next protocol
 *     quietly unreliable.
 * H3. A reported red flag ESCALATES. It raises a recheck request so it lands in
 *     the same queue a CCRT's concern does, rather than waiting for somebody to
 *     open the chart.
 * H4. B.E.A.U. reports; it does not prescribe. Nothing here can change an
 *     approved protocol, a dosage, or a restriction.
 * H5. Clinician review is what advances the clinical record. Home data does not
 *     update it on its own.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');
const sessionStore = require('./session-store');
const authority = require('./authority');

const HOME_STATUS = { STARTED: 'STARTED', COMPLETED: 'COMPLETED', ABANDONED: 'ABANDONED' };
const DIFFICULTY = ['EASY', 'JUST_RIGHT', 'HARD', 'TOO_HARD'];
const OBSERVATION_TYPE = ['FEEDBACK', 'RED_FLAG', 'QUESTION'];
const SEVERITY = ['MILD', 'MODERATE', 'SEVERE'];
const ENGAGEMENT_EVENTS = ['APP_OPENED', 'HEP_VIEWED', 'EXERCISE_VIEWED', 'SESSION_STARTED'];

const HOME_AUDIT = {
  SESSION_STARTED: 'HOME_SESSION_STARTED',
  SESSION_COMPLETED: 'HOME_SESSION_COMPLETED',
  SESSION_REVIEWED: 'HOME_SESSION_REVIEWED',
  OBSERVATION_RECEIVED: 'OWNER_OBSERVATION_RECEIVED',
  RED_FLAG_ESCALATED: 'HOME_RED_FLAG_ESCALATED',
  VIDEO_REQUESTED: 'VIDEO_REQUESTED',
  VIDEO_SUBMITTED: 'VIDEO_SUBMITTED',
};

/**
 * Home reporting arrives from B.E.A.U. on behalf of an owner, not from a
 * clinician. Audit rows are stamped BEAU so the record shows where a statement
 * came from.
 */
async function audit(db, { patientId, versionId, action, actor, detail }) {
  await db.run(
    `INSERT INTO protocol_audit_events
       (patient_id, version_id, action, actor_id, actor_username, actor_role, source_system, detail_json)
     VALUES (?, ?, ?, ?, ?, ?, 'BEAU', ?)`,
    [
      patientId ?? null, versionId ?? null, action,
      (actor && !actor.external ? actor.id : null) ?? null, actor?.username ?? 'owner', actor?.role ?? 'owner',
      detail ? JSON.stringify(detail) : null,
    ]
  );
}

// ---------------------------------------------------------------------------
// Engagement
// ---------------------------------------------------------------------------

/**
 * Record that the client interacted with the app.
 *
 * Deliberately separate from adherence. An owner who opens the program and
 * never starts it has a different problem from one who never opens it at all:
 * the first is usually difficulty or confusion, the second is usually that
 * nobody explained why it matters. Those call for different conversations.
 */
async function recordEngagement(db, { patientId, handoffId, event, detail }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!ENGAGEMENT_EVENTS.includes(event)) {
    throw new ProtocolStoreError(`event must be one of ${ENGAGEMENT_EVENTS.join(', ')}`, ERR.INVALID);
  }
  await db.run(
    `INSERT INTO home_engagement (patient_id, handoff_id, event, detail) VALUES (?, ?, ?, ?)`,
    [patientId, handoffId ?? null, event, detail ?? null]
  );
  return true;
}

async function getEngagementSummary(db, patientId, { sinceDays = 30 } = {}) {
  const rows = await db.all(
    `SELECT event, COUNT(*) n, MAX(occurred_at) last_at
       FROM home_engagement WHERE patient_id = ? GROUP BY event`,
    [patientId]
  );
  const byEvent = Object.fromEntries(rows.map((r) => [r.event, { count: r.n, last_at: r.last_at }]));
  const lastOpen = byEvent.APP_OPENED ? byEvent.APP_OPENED.last_at : null;
  return { by_event: byEvent, last_app_open: lastOpen, ever_opened: Boolean(lastOpen), window_days: sinceDays };
}

// ---------------------------------------------------------------------------
// Home sessions
// ---------------------------------------------------------------------------

/**
 * Begin a home session against the patient's live prescription (H1).
 *
 * The exercise list is copied from the FROZEN handoff payload, not recomputed,
 * so what the owner was asked to do is exactly what is logged against.
 */
async function startHomeSession(db, { patientId, sessionDate, weekNumber }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!sessionDate) throw new ProtocolStoreError('sessionDate is required', ERR.INVALID);

  const handoff = await db.get(
    `SELECT * FROM beau_handoffs WHERE patient_id = ? AND status = 'ACTIVE'
      ORDER BY handed_off_at DESC LIMIT 1`,
    [patientId]
  );
  if (!handoff) {
    throw new ProtocolStoreError(
      `No active home exercise program for this patient. A veterinarian must approve ` +
        `and send one before home sessions can be recorded.`,
      ERR.NOT_APPROVED
    );
  }

  const payload = JSON.parse(handoff.handoff_payload_json);

  const created = await db.run(
    `INSERT INTO home_sessions (patient_id, handoff_id, version_id, session_date, week_number, status)
     VALUES (?, ?, ?, ?, ?, 'STARTED')`,
    [patientId, handoff.id, handoff.version_id, sessionDate, weekNumber ?? null]
  );
  const sessionId = created.lastID;

  const forWeek = (payload.exercises || []).filter(
    (e) => !weekNumber || e.week_number === weekNumber
  );
  let order = 0;
  for (const ex of forWeek) {
    await db.run(
      `INSERT INTO home_exercise_logs
         (home_session_id, exercise_code, exercise_name, prescribed_sets, prescribed_reps, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, ex.exercise_code, ex.exercise_name ?? null,
       ex.dosage_override ?? ex.sets ?? null, ex.reps ?? null, order++]
    );
  }

  await recordEngagement(db, { patientId, handoffId: handoff.id, event: 'SESSION_STARTED' });
  await audit(db, {
    patientId, versionId: handoff.version_id, action: HOME_AUDIT.SESSION_STARTED,
    detail: { home_session_id: sessionId, exercises: forWeek.length, week: weekNumber ?? null },
  });

  return getHomeSession(db, sessionId);
}

async function getHomeSession(db, sessionId) {
  const session = await db.get(`SELECT * FROM home_sessions WHERE id = ?`, [sessionId]);
  if (!session) throw new ProtocolStoreError(`Home session ${sessionId} not found`, ERR.NOT_FOUND);
  const exercises = await db.all(
    `SELECT * FROM home_exercise_logs WHERE home_session_id = ? ORDER BY sort_order, id`, [sessionId]);
  const observations = await db.all(
    `SELECT * FROM home_observations WHERE home_session_id = ? ORDER BY id`, [sessionId]);
  return { ...session, exercises, observations };
}

function assertOpen(session) {
  if (session.status !== HOME_STATUS.STARTED) {
    throw new ProtocolStoreError(
      `This home session is already ${session.status.toLowerCase()} and cannot be changed.`,
      ERR.IMMUTABLE
    );
  }
}

/** Log one exercise as the owner works through the program. */
async function logExercise(db, { sessionId, exerciseRowId, log }) {
  const session = await getHomeSession(db, sessionId);
  assertOpen(session);

  const row = await db.get(
    `SELECT * FROM home_exercise_logs WHERE id = ? AND home_session_id = ?`,
    [exerciseRowId, sessionId]
  );
  if (!row) throw new ProtocolStoreError(`Exercise row ${exerciseRowId} not found`, ERR.NOT_FOUND);

  const l = log || {};
  if (l.difficulty && !DIFFICULTY.includes(l.difficulty)) {
    throw new ProtocolStoreError(`difficulty must be one of ${DIFFICULTY.join(', ')}`, ERR.INVALID);
  }

  await db.run(
    `UPDATE home_exercise_logs
        SET completed = ?, partial = ?, skipped_reason = ?, difficulty = ?,
            owner_note = ?, red_flag_observed = ?
      WHERE id = ?`,
    [
      l.completed === true || l.completed === 1 ? 1 : 0,
      l.partial === true || l.partial === 1 ? 1 : 0,
      l.skipped_reason ?? null,
      l.difficulty ?? null,
      l.owner_note ?? null,
      l.red_flag_observed ?? null,
      exerciseRowId,
    ]
  );

  // A stop condition observed during an exercise escalates immediately (H3) —
  // it is not held until the session is finished.
  if (l.red_flag_observed) {
    await reportObservation(db, {
      patientId: session.patient_id,
      homeSessionId: sessionId,
      type: 'RED_FLAG',
      severity: l.red_flag_severity || 'MODERATE',
      detail: `${row.exercise_code}: ${l.red_flag_observed}`,
    });
  }

  return getHomeSession(db, sessionId);
}

/**
 * Finish the session and answer the few short questions.
 *
 * `owner_pain_rating` is owner-observed and stored as such (H2). It never
 * reaches visit_measurements.
 */
async function completeHomeSession(db, { sessionId, summary }) {
  const session = await getHomeSession(db, sessionId);
  assertOpen(session);

  const s = summary || {};
  if (s.overall_difficulty && !DIFFICULTY.includes(s.overall_difficulty)) {
    throw new ProtocolStoreError(`overall_difficulty must be one of ${DIFFICULTY.join(', ')}`, ERR.INVALID);
  }

  const anyDone = session.exercises.some((e) => e.completed === 1 || e.partial === 1);
  const status = s.abandoned === true || !anyDone ? HOME_STATUS.ABANDONED : HOME_STATUS.COMPLETED;

  await db.run(
    `UPDATE home_sessions
        SET status = ?, overall_difficulty = ?, owner_pain_rating = ?, owner_notes = ?,
            completed_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [status, s.overall_difficulty ?? null, s.owner_pain_rating ?? null, s.owner_notes ?? null, sessionId]
  );

  if (s.owner_notes) {
    await reportObservation(db, {
      patientId: session.patient_id, homeSessionId: sessionId,
      type: 'FEEDBACK', detail: s.owner_notes,
    });
  }

  const completed = session.exercises.filter((e) => e.completed === 1).length;
  await audit(db, {
    patientId: session.patient_id, versionId: session.version_id,
    action: HOME_AUDIT.SESSION_COMPLETED,
    detail: {
      home_session_id: sessionId, status,
      completed, of: session.exercises.length,
      owner_pain_rating: s.owner_pain_rating ?? null,
      difficulty: s.overall_difficulty ?? null,
    },
  });

  return getHomeSession(db, sessionId);
}

async function listHomeSessions(db, patientId) {
  return db.all(
    `SELECT * FROM home_sessions WHERE patient_id = ? ORDER BY session_date DESC, id DESC`,
    [patientId]
  );
}

async function listUnreviewedHomeSessions(db, patientId) {
  const params = [];
  let sql = `SELECT * FROM home_sessions WHERE status IN ('COMPLETED','ABANDONED') AND reviewed_at IS NULL`;
  if (patientId) { sql += ` AND patient_id = ?`; params.push(patientId); }
  sql += ` ORDER BY session_date DESC, id DESC`;
  return db.all(sql, params);
}

/** A clinician reading what came back (H5). */
async function reviewHomeSession(db, { sessionId, actor, note }) {
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified clinician is required', ERR.INVALID);
  const session = await getHomeSession(db, sessionId);

  const check = await authority.resolveApprovalAuthority(db, { actor });
  if (!check.allowed) {
    throw new ProtocolStoreError(
      `${actor.username} cannot sign off home-reported data. ` +
        authority.explainDenial(check.reason, actor),
      ERR.FORBIDDEN
    );
  }

  await db.run(
    `UPDATE home_sessions
        SET reviewed_by = ?, reviewed_by_username = ?, reviewed_at = CURRENT_TIMESTAMP, review_note = ?
      WHERE id = ?`,
    [actor.id, actor.username, note ?? null, sessionId]
  );
  await db.run(
    `UPDATE home_observations SET status = 'SEEN', seen_by = ?, seen_by_username = ?, seen_at = CURRENT_TIMESTAMP
      WHERE home_session_id = ? AND status = 'NEW'`,
    [actor.id, actor.username, sessionId]
  );

  await db.run(
    `INSERT INTO protocol_audit_events
       (patient_id, version_id, action, actor_id, actor_username, actor_role, source_system, detail_json)
     VALUES (?, ?, ?, ?, ?, ?, 'K9', ?)`,
    [session.patient_id, session.version_id, HOME_AUDIT.SESSION_REVIEWED,
     actor.id, actor.username, actor.role ?? null, JSON.stringify({ home_session_id: sessionId })]
  );

  return getHomeSession(db, sessionId);
}

// ---------------------------------------------------------------------------
// Observations
// ---------------------------------------------------------------------------

/**
 * Anything the owner wants the clinic to know.
 *
 * A RED_FLAG escalates into a recheck request (H3) so an owner-reported stop
 * condition is answered by a clinician rather than discovered later. Urgency is
 * taken from the owner's own severity: a severe report goes URGENT. This
 * triages for attention, not for treatment — the clinician still decides.
 */
async function reportObservation(db, { patientId, homeSessionId, type, severity, detail }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!OBSERVATION_TYPE.includes(type)) {
    throw new ProtocolStoreError(`observation_type must be one of ${OBSERVATION_TYPE.join(', ')}`, ERR.INVALID);
  }
  if (!detail) throw new ProtocolStoreError('detail is required', ERR.INVALID);
  if (severity && !SEVERITY.includes(severity)) {
    throw new ProtocolStoreError(`severity must be one of ${SEVERITY.join(', ')}`, ERR.INVALID);
  }

  let recheckId = null;

  if (type === 'RED_FLAG') {
    const version = homeSessionId
      ? (await db.get(`SELECT version_id FROM home_sessions WHERE id = ?`, [homeSessionId]))?.version_id
      : null;

    const recheck = await sessionStore.requestRecheck(db, {
      patientId,
      versionId: version ?? null,
      urgency: severity === 'SEVERE' ? 'URGENT' : 'SOON',
      reason: `Owner reported a stop condition at home: ${detail}`,
      findings: 'Reported by the owner through B.E.A.U. Home — not yet clinically assessed.',
      // Attributed to the owner, so the queue shows who raised it. `external`
      // because a pet owner has no row in `users` — the id is stored as NULL
      // rather than fabricated to satisfy a foreign key.
      actor: { id: null, username: 'owner (B.E.A.U. Home)', role: 'owner', external: true },
    });
    recheckId = recheck.id;

    if (homeSessionId) {
      await db.run(`UPDATE home_sessions SET red_flag_reported = 1 WHERE id = ?`, [homeSessionId]);
    }
    await audit(db, {
      patientId, versionId: version ?? null, action: HOME_AUDIT.RED_FLAG_ESCALATED,
      detail: { recheck_request_id: recheckId, severity: severity ?? null, observation: detail },
    });
  }

  const created = await db.run(
    `INSERT INTO home_observations
       (patient_id, home_session_id, observation_type, severity, detail, recheck_request_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'NEW')`,
    [patientId, homeSessionId ?? null, type, severity ?? null, detail, recheckId]
  );

  if (type !== 'RED_FLAG') {
    await audit(db, {
      patientId, action: HOME_AUDIT.OBSERVATION_RECEIVED,
      detail: { observation_id: created.lastID, type },
    });
  }

  return db.get(`SELECT * FROM home_observations WHERE id = ?`, [created.lastID]);
}

async function listNewObservations(db, patientId) {
  const params = [];
  let sql = `SELECT * FROM home_observations WHERE status = 'NEW'`;
  if (patientId) { sql += ` AND patient_id = ?`; params.push(patientId); }
  sql += ` ORDER BY CASE observation_type WHEN 'RED_FLAG' THEN 0 ELSE 1 END, reported_at DESC`;
  return db.all(sql, params);
}

// ---------------------------------------------------------------------------
// Video requests
// ---------------------------------------------------------------------------

/** A clinician asking to see one exercise performed. */
async function requestVideo(db, { patientId, versionId, exerciseCode, note, actor }) {
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified clinician is required', ERR.INVALID);
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);

  const created = await db.run(
    `INSERT INTO video_requests
       (patient_id, version_id, exercise_code, requested_by, requested_by_username, request_note, status)
     VALUES (?, ?, ?, ?, ?, ?, 'REQUESTED')`,
    [patientId, versionId ?? null, exerciseCode ?? null, actor.id, actor.username, note ?? null]
  );
  await audit(db, {
    patientId, versionId: versionId ?? null, action: HOME_AUDIT.VIDEO_REQUESTED, actor,
    detail: { video_request_id: created.lastID, exercise_code: exerciseCode ?? null },
  });
  return db.get(`SELECT * FROM video_requests WHERE id = ?`, [created.lastID]);
}

async function listVideoRequests(db, { patientId, status }) {
  const params = [];
  let sql = `SELECT * FROM video_requests WHERE 1=1`;
  if (patientId) { sql += ` AND patient_id = ?`; params.push(patientId); }
  if (status) { sql += ` AND status = ?`; params.push(status); }
  sql += ` ORDER BY requested_at DESC`;
  return db.all(sql, params);
}

/**
 * The owner submitting the requested clip.
 *
 * Only the reference is stored. Consent and retention are decisions for the
 * practice, and a clinical database is the wrong place to accumulate video.
 */
async function submitVideo(db, { requestId, mediaRef, homeSessionId, ownerNote }) {
  const request = await db.get(`SELECT * FROM video_requests WHERE id = ?`, [requestId]);
  if (!request) throw new ProtocolStoreError(`Video request ${requestId} not found`, ERR.NOT_FOUND);
  if (request.status !== 'REQUESTED') {
    throw new ProtocolStoreError(`This request is already ${request.status.toLowerCase()}`, ERR.IMMUTABLE);
  }
  if (!mediaRef) throw new ProtocolStoreError('mediaRef is required', ERR.INVALID);

  await db.run(
    `UPDATE video_requests
        SET status = 'SUBMITTED', media_ref = ?, home_session_id = ?, owner_note = ?,
            submitted_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [mediaRef, homeSessionId ?? null, ownerNote ?? null, requestId]
  );
  await audit(db, {
    patientId: request.patient_id, versionId: request.version_id,
    action: HOME_AUDIT.VIDEO_SUBMITTED,
    detail: { video_request_id: requestId, exercise_code: request.exercise_code },
  });
  return db.get(`SELECT * FROM video_requests WHERE id = ?`, [requestId]);
}

async function reviewVideo(db, { requestId, actor, note }) {
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified clinician is required', ERR.INVALID);
  const request = await db.get(`SELECT * FROM video_requests WHERE id = ?`, [requestId]);
  if (!request) throw new ProtocolStoreError(`Video request ${requestId} not found`, ERR.NOT_FOUND);

  await db.run(
    `UPDATE video_requests
        SET status = 'REVIEWED', reviewed_by = ?, reviewed_by_username = ?,
            reviewed_at = CURRENT_TIMESTAMP, review_note = ?
      WHERE id = ?`,
    [actor.id, actor.username, note ?? null, requestId]
  );
  return db.get(`SELECT * FROM video_requests WHERE id = ?`, [requestId]);
}

// ---------------------------------------------------------------------------
// Adherence summary
// ---------------------------------------------------------------------------

/**
 * What a clinician needs to see before deciding the next protocol.
 *
 * Reported, not interpreted. Low adherence usually means the program needs
 * simplifying rather than progressing — but that is a clinical judgement, so
 * this states the numbers and leaves the conclusion to the clinician.
 */
async function getAdherenceSummary(db, patientId) {
  const sessions = await db.all(
    `SELECT * FROM home_sessions WHERE patient_id = ? ORDER BY session_date`, [patientId]);

  const completed = sessions.filter((s) => s.status === HOME_STATUS.COMPLETED).length;
  const abandoned = sessions.filter((s) => s.status === HOME_STATUS.ABANDONED).length;

  const logs = sessions.length
    ? await db.all(
        `SELECT * FROM home_exercise_logs WHERE home_session_id IN (${sessions.map(() => '?').join(',')})`,
        sessions.map((s) => s.id))
    : [];
  const exercisesDone = logs.filter((l) => l.completed === 1).length;

  const painRatings = sessions
    .map((s) => s.owner_pain_rating)
    .filter((v) => v !== null && v !== undefined);

  const tooHard = sessions.filter((s) => s.overall_difficulty === 'TOO_HARD').length;

  return {
    session_count: sessions.length,
    completed,
    abandoned,
    exercise_completion_rate: logs.length ? Number((exercisesDone / logs.length).toFixed(2)) : null,
    last_session_date: sessions.length ? sessions[sessions.length - 1].session_date : null,
    // Labelled at every point of use. This is an owner's estimate, not a
    // clinical pain score, and must not be read as one.
    owner_reported_pain: {
      latest: painRatings.length ? painRatings[painRatings.length - 1] : null,
      first: painRatings.length ? painRatings[0] : null,
      readings: painRatings.length,
      source: 'OWNER_REPORTED',
    },
    sessions_rated_too_hard: tooHard,
    red_flag_sessions: sessions.filter((s) => s.red_flag_reported === 1).length,
  };
}

module.exports = {
  HOME_STATUS, DIFFICULTY, OBSERVATION_TYPE, SEVERITY, ENGAGEMENT_EVENTS, HOME_AUDIT,

  recordEngagement, getEngagementSummary,
  startHomeSession, getHomeSession, logExercise, completeHomeSession,
  listHomeSessions, listUnreviewedHomeSessions, reviewHomeSession,

  reportObservation, listNewObservations,
  requestVideo, listVideoRequests, submitVideo, reviewVideo,

  getAdherenceSummary,
};
