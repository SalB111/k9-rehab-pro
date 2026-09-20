/**
 * K9 Clinical Workflow V2 — B.E.A.U. Home (owner-facing API)
 *
 * Mounted at /api/v2/beau, BEFORE the clinician auth guard, because the people
 * using it have no clinician account. Access is a code the practice issues,
 * exchanged for a token scoped to one patient.
 *
 * EVERY ROUTE HERE REPORTS. None of them prescribe. An owner can say what
 * happened and what they saw; changing treatment is a clinical decision that
 * happens in K9, by a clinician, as a new protocol version.
 *
 * Owner-facing responses are deliberately shaped for a pet owner rather than
 * mirroring the clinical record: what to do today, how to do it, when to stop.
 */

'use strict';

const ownerAuth = require('../owner-auth');
const homeStore = require('../home-store');
const { route } = require('../http-errors');

function createBeauRouter({ db, express, jwt, secret, requireAuth }) {
  const router = express.Router();
  router.use(express.json({ limit: '1mb' }));

  // ── Exchange a code for a token. The only unauthenticated route. ─────────
  router.post('/access', route(async (req, res) => {
    try {
      const result = await ownerAuth.exchangeCodeForToken(db, {
        code: req.body.code, jwt, secret,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      if (err.code === 'INVALID_CODE') {
        return res.status(401).json({ success: false, code: 'INVALID_CODE', error: err.message });
      }
      throw err;
    }
  }));

  // Everything below accepts an owner token OR a clinician.
  const guard = ownerAuth.allowOwnerOrClinician({ jwt, secret, requireAuth, db });

  /**
   * Whether this patient is under an active approved home programme.
   *
   * This exists for ONE consumer: B.E.A.U. at Home's own server, which must
   * refuse to generate exercises for a patient a veterinarian is already
   * treating. That refusal has to be a decision made against a record, not a
   * sentence in a prompt asking a language model to behave.
   *
   * Deliberately carries NO clinical content — no exercises, no dosage, no
   * restrictions, no diagnosis. It answers one question, and the answer is a
   * boolean. Anything more would be clinical record leaving the clinical system
   * to a place that has no business holding it.
   *
   * `total_weeks` and `effective_date` are included because the consumer needs
   * to know when the programme's own window closes. A protocol is not
   * indefinite, and a lock with no horizon becomes a lock nobody can lift.
   */
  router.get('/hep-status', guard, route(async (req, res) => {
    const patientId = ownerAuth.patientIdFor(req);
    if (!patientId) {
      return res.status(400).json({ success: false, code: 'INVALID', error: 'No patient in scope' });
    }

    const handoff = await db.get(
      `SELECT * FROM beau_handoffs WHERE patient_id = ? AND status = 'ACTIVE'
        ORDER BY handed_off_at DESC LIMIT 1`,
      [patientId]
    );
    const patient = await db.get(`SELECT id, name FROM patients WHERE id = ?`, [patientId]);

    let payload = null;
    if (handoff) {
      try { payload = JSON.parse(handoff.handoff_payload_json); } catch { payload = null; }
    }

    res.json({
      success: true,
      data: {
        patient_id: patientId,
        patient_name: patient ? patient.name : null,
        has_active_hep: Boolean(handoff),
        version_number: payload ? payload.protocol_version_number : null,
        effective_date: payload ? payload.effective_date : null,
        total_weeks: payload ? payload.total_weeks : null,
        // The owner is told a person authorised this. Name and credential only.
        approved_by: payload && payload.approval
          ? {
              name: payload.approval.approver_username,
              credential: payload.approval.approver_credential,
            }
          : null,
      },
    });
  }));

  /**
   * Today's programme, shaped for the person doing it.
   *
   * Restrictions and stop conditions travel with it. An owner following
   * exercises without knowing when to stop is the situation the whole red-flag
   * mechanism exists to prevent.
   */
  router.get('/my-programme', guard, route(async (req, res) => {
    const patientId = ownerAuth.patientIdFor(req);
    if (!patientId) {
      return res.status(400).json({ success: false, code: 'INVALID', error: 'No patient in scope' });
    }

    const handoff = await db.get(
      `SELECT * FROM beau_handoffs WHERE patient_id = ? AND status = 'ACTIVE'
        ORDER BY handed_off_at DESC LIMIT 1`,
      [patientId]
    );
    if (!handoff) {
      return res.status(404).json({
        success: false, code: 'NOT_FOUND',
        error: 'There is no home programme for this patient yet. Your clinic will send one.',
      });
    }

    const payload = JSON.parse(handoff.handoff_payload_json);
    const patient = await db.get(`SELECT id, name, breed FROM patients WHERE id = ?`, [patientId]);
    const videos = await homeStore.listVideoRequests(db, { patientId, status: 'REQUESTED' });

    // Which week the programme is in. An owner should be shown today's work,
    // not four weeks of exercises at once — a protocol progresses deliberately,
    // and week 4 handed to someone in week 1 is a patient doing loading work
    // they have not been cleared for.
    const started = payload.effective_date ? new Date(payload.effective_date) : null;
    const weeksElapsed = started && !Number.isNaN(started.getTime())
      ? Math.floor((Date.now() - started.getTime()) / (7 * 24 * 60 * 60 * 1000))
      : 0;
    const totalWeeks = payload.total_weeks || 1;
    const currentWeek = Math.min(Math.max(weeksElapsed + 1, 1), totalWeeks);

    const thisWeek = (payload.exercises || []).filter((e) => e.week_number === currentWeek);

    res.json({
      success: true,
      data: {
        patient,
        handoff_id: handoff.id,
        version_number: payload.protocol_version_number,
        effective_date: payload.effective_date,
        frequency: payload.frequency,
        total_weeks: payload.total_weeks,
        current_week: currentWeek,
        // What to do now. The full programme is still available below so an
        // owner can see where this is going, but `exercises` is today's work.
        exercises: thisWeek.length ? thisWeek : (payload.exercises || []),
        all_weeks: payload.exercises,
        restrictions: payload.restrictions,
        approved_by: payload.approval
          ? {
              name: payload.approval.approver_username,
              credential: payload.approval.approver_credential,
              basis: payload.approval.approval_basis,
            }
          : null,
        // Shown so an owner knows a person authorised this, not an algorithm.
        video_requests: videos,
      },
    });
  }));

  router.post('/engagement', guard, route(async (req, res) => {
    const patientId = ownerAuth.patientIdFor(req);
    await homeStore.recordEngagement(db, {
      patientId, handoffId: req.body.handoff_id, event: req.body.event, detail: req.body.detail,
    });
    res.status(201).json({ success: true });
  }));

  router.post('/home-sessions', guard, route(async (req, res) => {
    const patientId = ownerAuth.patientIdFor(req);
    const session = await homeStore.startHomeSession(db, {
      patientId, sessionDate: req.body.session_date, weekNumber: req.body.week_number,
    });
    res.status(201).json({ success: true, data: session });
  }));

  /** Scope check: a session belongs to the patient the token names. */
  async function assertOwnSession(req, res, sessionId) {
    const session = await db.get(`SELECT patient_id FROM home_sessions WHERE id = ?`, [sessionId]);
    if (!session) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'Session not found' });
      return false;
    }
    if (req.owner && Number(session.patient_id) !== Number(req.owner.patient_id)) {
      res.status(403).json({ success: false, code: 'FORBIDDEN', error: 'Not your session' });
      return false;
    }
    return true;
  }

  router.get('/home-sessions/:id', guard, route(async (req, res) => {
    const id = Number(req.params.id);
    if (!(await assertOwnSession(req, res, id))) return;
    res.json({ success: true, data: await homeStore.getHomeSession(db, id) });
  }));

  router.post('/home-sessions/:id/exercises/:rowId', guard, route(async (req, res) => {
    const id = Number(req.params.id);
    if (!(await assertOwnSession(req, res, id))) return;
    const session = await homeStore.logExercise(db, {
      sessionId: id, exerciseRowId: Number(req.params.rowId), log: req.body,
    });
    res.json({ success: true, data: session });
  }));

  router.post('/home-sessions/:id/complete', guard, route(async (req, res) => {
    const id = Number(req.params.id);
    if (!(await assertOwnSession(req, res, id))) return;
    res.json({ success: true, data: await homeStore.completeHomeSession(db, {
      sessionId: id, summary: req.body,
    }) });
  }));

  router.post('/observations', guard, route(async (req, res) => {
    const patientId = ownerAuth.patientIdFor(req);
    const observation = await homeStore.reportObservation(db, {
      patientId,
      homeSessionId: req.body.home_session_id,
      type: req.body.observation_type || 'FEEDBACK',
      severity: req.body.severity,
      detail: req.body.detail,
    });
    res.status(201).json({ success: true, data: observation });
  }));

  router.get('/video-requests', guard, route(async (req, res) => {
    const patientId = ownerAuth.patientIdFor(req);
    res.json({ success: true, data: await homeStore.listVideoRequests(db, {
      patientId, status: req.query.status,
    }) });
  }));

  router.post('/video-requests/:id/submit', guard, route(async (req, res) => {
    const request = await db.get(`SELECT patient_id FROM video_requests WHERE id = ?`, [Number(req.params.id)]);
    if (!request) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'Request not found' });
    }
    if (req.owner && Number(request.patient_id) !== Number(req.owner.patient_id)) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', error: 'Not your request' });
    }
    res.json({ success: true, data: await homeStore.submitVideo(db, {
      requestId: Number(req.params.id),
      mediaRef: req.body.media_ref,
      homeSessionId: req.body.home_session_id,
      ownerNote: req.body.owner_note,
    }) });
  }));

  return router;
}

module.exports = { createBeauRouter };
