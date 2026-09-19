/**
 * K9 Clinical Workflow V2 — API router
 *
 * Exposes the clinical workflow over HTTP:
 *
 *   snapshot -> visit -> assessment/measurements -> recommendation
 *            -> review -> approve -> handoff
 *
 * MOUNTING (additive — no existing route changes)
 *
 *   const { createV2Router } = require('./routes/v2-router');
 *   app.use('/api/v2', createV2Router({ db, engine, allExercises, requireAuth }));
 *   app.use(errorHandler());
 *
 * Everything is injected rather than imported from K9 paths, so this module can
 * be tested against an in-memory database and mounted into the production
 * server without either knowing about the other.
 */

'use strict';

const store = require('../protocol-store');
const visitStore = require('../visit-store');
const sessionStore = require('../session-store');
const clinicStore = require('../clinic-store');
const adapter = require('../engine-adapter');
const authority = require('../authority');
const { requireRole, requireApprovalAuthority } = require('../middleware/require-role');
const { route } = require('../http-errors');

/**
 * @param {object} deps
 * @param {object} deps.db            promise-returning run/get/all
 * @param {object} deps.engine        backend/protocol-generator.js
 * @param {Array}  deps.allExercises  ALL_EXERCISES
 * @param {Function} deps.requireAuth K9's auth middleware (sets req.user)
 * @param {Function} [deps.resolveClinicId] req -> clinic id
 * @param {Function} [deps.getPatient]      (db, id) -> patient row
 * @param {object}   [deps.express]    the express module. Injectable because the
 *                                     V2 sandbox has no node_modules of its own;
 *                                     in the host app it resolves normally.
 */
function createV2Router(deps) {
  const {
    db,
    engine,
    allExercises,
    requireAuth,
    resolveClinicId = defaultResolveClinicId,
    getPatient = defaultGetPatient,
  } = deps;

  if (!db) throw new Error('createV2Router requires db');
  if (!engine) throw new Error('createV2Router requires engine');
  if (!allExercises) throw new Error('createV2Router requires allExercises');

  const express = deps.express || require('express');

  const router = express.Router();
  router.use(express.json({ limit: '1mb' }));
  if (requireAuth) router.use(requireAuth);

  const approvalAuthority = requireApprovalAuthority(() => db);

  // -------------------------------------------------------------------------
  // Patient snapshot — what the clinician opens a patient to
  // -------------------------------------------------------------------------

  router.get('/patients/:id/snapshot', route(async (req, res) => {
    const patientId = Number(req.params.id);
    const patient = await getPatient(db, patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found', code: 'NOT_FOUND' });
    }

    const snapshot = await visitStore.buildClinicalSnapshot(db, { patientId, patient });
    const clinicId = await resolveClinicId(req, db);
    const capabilities = await clinicStore.getCapabilities(db, clinicId);

    // Surfaced with the snapshot on purpose: unstated equipment silently
    // WITHHOLDS therapy from the recommendation, so the clinician should see
    // the gap before generating, not wonder later why laser never appears.
    res.json({
      success: true,
      data: {
        ...snapshot,
        clinic: {
          clinic_id: clinicId,
          configured: capabilities.configured,
          unstated_capabilities: capabilities.unstated,
        },
      },
    });
  }));

  // -------------------------------------------------------------------------
  // Visits
  // -------------------------------------------------------------------------

  router.post('/patients/:id/visits', route(async (req, res) => {
    const visit = await visitStore.createVisit(db, {
      patientId: Number(req.params.id),
      visitDate: req.body.visit_date,
      visitType: req.body.visit_type,
      notes: req.body.visit_notes,
      actor: req.user,
    });
    res.status(201).json({ success: true, data: visit });
  }));

  router.get('/visits/:id', route(async (req, res) => {
    res.json({ success: true, data: await visitStore.getVisit(db, Number(req.params.id)) });
  }));

  router.get('/patients/:id/visits', route(async (req, res) => {
    res.json({ success: true, data: await visitStore.listVisits(db, Number(req.params.id)) });
  }));

  router.post('/visits/:id/assessment', route(async (req, res) => {
    const visit = await visitStore.recordAssessment(db, {
      visitId: Number(req.params.id),
      assessment: req.body,
      actor: req.user,
    });
    res.json({ success: true, data: visit });
  }));

  router.post('/visits/:id/measurements', route(async (req, res) => {
    const measurement = await visitStore.recordMeasurement(db, {
      visitId: Number(req.params.id),
      measurement: req.body,
      actor: req.user,
    });
    res.status(201).json({ success: true, data: measurement });
  }));

  router.post('/visits/:id/complete', route(async (req, res) => {
    const visit = await visitStore.completeVisit(db, {
      visitId: Number(req.params.id),
      actor: req.user,
    });
    res.json({ success: true, data: visit });
  }));

  router.get('/patients/:id/measurements/:key', route(async (req, res) => {
    const history = await visitStore.getMeasurementHistory(db, {
      patientId: Number(req.params.id),
      measureKey: req.params.key,
      site: req.query.site,
      side: req.query.side,
    });
    res.json({ success: true, data: history });
  }));

  // -------------------------------------------------------------------------
  // Recommendation — visit + patient + clinic -> engine -> persisted version
  // -------------------------------------------------------------------------

  router.post('/visits/:id/recommendation', route(async (req, res) => {
    const visitId = Number(req.params.id);
    const visit = await visitStore.getVisit(db, visitId);
    const patient = await getPatient(db, visit.patient_id);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found', code: 'NOT_FOUND' });
    }

    const clinicId = await resolveClinicId(req, db);
    const capabilities = await clinicStore.getCapabilities(db, clinicId);

    const state = visitStore.toV2State(db, {
      patient,
      visit,
      clinic: clinicStore.toClinicState(capabilities),
      protocolParams: {
        length_weeks: req.body.protocol_length_weeks,
        frequency: req.body.frequency,
      },
    });

    // runEngine enforces both engine contracts: every input present, and
    // validateIntake called on the object the generator then reads.
    const engineInput = adapter.toEngineFormData(state);
    const engineResult = adapter.runEngine(engineInput, engine, allExercises);

    if (!engineResult.valid) {
      // A clinical refusal, not a malformed request — e.g. a dehisced incision
      // blocks generation outright.
      return res.status(409).json({
        success: false,
        error: engineResult.errors.join('; '),
        code: 'CLINICAL_BLOCK',
        warnings: engineResult.warnings,
      });
    }

    // Reuse the patient's open protocol so reassessment adds a VERSION rather
    // than starting a parallel course of treatment.
    let protocolId = req.body.protocol_id;
    if (!protocolId) {
      const existing = await store.listProtocolsForPatient(db, visit.patient_id);
      protocolId = existing.length
        ? existing[0].id
        : (await store.createProtocol(db, {
            patientId: visit.patient_id,
            patientName: patient.name,
            actor: req.user,
          })).id;
    }

    const version = await store.createVersion(db, {
      protocolId, engineInput, engineResult, actor: req.user,
    });
    await visitStore.linkVersionToVisit(db, { visitId, versionId: version.id });

    res.status(201).json({
      success: true,
      data: {
        ...version,
        // Which equipment answers were never stated. Any exercise depending on
        // one of these was withheld, and the clinician should know that before
        // reviewing rather than after.
        unstated_clinic_capabilities: capabilities.unstated,
      },
    });
  }));

  // -------------------------------------------------------------------------
  // In-clinic treatment sessions — the CCRT/CCRP delivering what the vet
  // prescribed, and recording how the patient did.
  // -------------------------------------------------------------------------

  router.post('/patients/:id/sessions', route(async (req, res) => {
    const session = await sessionStore.startSession(db, {
      patientId: Number(req.params.id),
      versionId: Number(req.body.version_id),
      sessionDate: req.body.session_date,
      actor: req.user,
    });
    res.status(201).json({ success: true, data: session });
  }));

  router.get('/patients/:id/sessions', route(async (req, res) => {
    res.json({ success: true, data: await sessionStore.listSessions(db, Number(req.params.id)) });
  }));

  router.get('/sessions/:id', route(async (req, res) => {
    res.json({ success: true, data: await sessionStore.getSession(db, Number(req.params.id)) });
  }));

  router.post('/sessions/:id/exercises/:rowId', route(async (req, res) => {
    const session = await sessionStore.recordDelivery(db, {
      sessionId: Number(req.params.id),
      exerciseRowId: Number(req.params.rowId),
      delivery: req.body,
      actor: req.user,
    });
    res.json({ success: true, data: session });
  }));

  router.post('/sessions/:id/measures', route(async (req, res) => {
    const session = await sessionStore.recordSessionMeasures(db, {
      sessionId: Number(req.params.id), measures: req.body, actor: req.user,
    });
    res.json({ success: true, data: session });
  }));

  router.post('/sessions/:id/complete', route(async (req, res) => {
    res.json({ success: true, data: await sessionStore.completeSession(db, {
      sessionId: Number(req.params.id), actor: req.user,
    }) });
  }));

  /** Veterinary sign-off. Requires approval authority, like an approval does. */
  router.post('/sessions/:id/review', approvalAuthority, route(async (req, res) => {
    res.json({ success: true, data: await sessionStore.reviewSession(db, {
      sessionId: Number(req.params.id), note: req.body.note, actor: req.user,
    }) });
  }));

  /** Completed sessions nobody has read yet. Omit the patient for the whole caseload. */
  router.get('/sessions-unreviewed', route(async (req, res) => {
    const patientId = req.query.patient_id ? Number(req.query.patient_id) : null;
    res.json({ success: true, data: await sessionStore.listUnreviewedSessions(db, patientId) });
  }));

  // -------------------------------------------------------------------------
  // Recheck requests — the practitioner raising a concern to the veterinarian
  // -------------------------------------------------------------------------

  router.post('/patients/:id/rechecks', route(async (req, res) => {
    const recheck = await sessionStore.requestRecheck(db, {
      patientId: Number(req.params.id),
      sessionId: req.body.session_id ?? null,
      versionId: req.body.version_id ?? null,
      urgency: req.body.urgency,
      reason: req.body.reason,
      findings: req.body.clinical_findings,
      actor: req.user,
    });
    res.status(201).json({ success: true, data: recheck });
  }));

  /** Unanswered concerns. Omit the patient for the whole caseload. */
  router.get('/rechecks', route(async (req, res) => {
    const patientId = req.query.patient_id ? Number(req.query.patient_id) : null;
    res.json({ success: true, data: await sessionStore.listOpenRechecks(db, patientId) });
  }));

  /** Only a clinician may answer a concern. */
  router.post('/rechecks/:id/respond', approvalAuthority, route(async (req, res) => {
    res.json({ success: true, data: await sessionStore.respondToRecheck(db, {
      recheckId: Number(req.params.id),
      status: req.body.status,
      response: req.body.response,
      actor: req.user,
    }) });
  }));

  router.post('/rechecks/:id/withdraw', route(async (req, res) => {
    res.json({ success: true, data: await sessionStore.withdrawRecheck(db, {
      recheckId: Number(req.params.id), reason: req.body.reason, actor: req.user,
    }) });
  }));

  // -------------------------------------------------------------------------
  // Protocol versions and review
  // -------------------------------------------------------------------------

  router.get('/protocols/:id/versions', route(async (req, res) => {
    res.json({ success: true, data: await store.listVersions(db, Number(req.params.id)) });
  }));

  router.get('/patients/:id/protocols', route(async (req, res) => {
    res.json({ success: true, data: await store.listProtocolsForPatient(db, Number(req.params.id)) });
  }));

  router.get('/versions/:id', route(async (req, res) => {
    res.json({ success: true, data: await store.getVersion(db, Number(req.params.id)) });
  }));

  router.post('/versions/:id/status', route(async (req, res) => {
    const version = await store.setStatus(db, Number(req.params.id), req.body.status, req.user);
    res.json({ success: true, data: version });
  }));

  router.post('/versions/:id/exercises', route(async (req, res) => {
    const version = await store.addExercise(db, {
      versionId: Number(req.params.id), exercise: req.body, actor: req.user,
    });
    res.status(201).json({ success: true, data: version });
  }));

  router.delete('/versions/:id/exercises/:rowId', route(async (req, res) => {
    const version = await store.removeExercise(db, {
      versionId: Number(req.params.id),
      exerciseRowId: Number(req.params.rowId),
      reason: req.query.reason,
      actor: req.user,
    });
    res.json({ success: true, data: version });
  }));

  router.post('/versions/:id/revise', route(async (req, res) => {
    const version = await store.reviseApprovedVersion(db, {
      versionId: Number(req.params.id), actor: req.user,
    });
    res.status(201).json({ success: true, data: version });
  }));

  // -------------------------------------------------------------------------
  // Approval and handoff — authority-gated
  // -------------------------------------------------------------------------

  router.post('/versions/:id/approve', approvalAuthority, route(async (req, res) => {
    const version = await store.approveVersion(db, {
      versionId: Number(req.params.id),
      note: req.body.note,
      actor: req.user,
    });
    res.json({ success: true, data: version });
  }));

  router.post('/versions/:id/handoff', approvalAuthority, route(async (req, res) => {
    const handoff = await store.handoffToBeau(db, {
      versionId: Number(req.params.id), actor: req.user,
    });
    res.status(201).json({ success: true, data: handoff });
  }));

  router.get('/versions/:id/integrity', route(async (req, res) => {
    res.json({ success: true, data: await store.verifyApprovalIntegrity(db, Number(req.params.id)) });
  }));

  router.get('/protocols/:id/audit', route(async (req, res) => {
    res.json({ success: true, data: await store.getAuditTrail(db, Number(req.params.id)) });
  }));

  // -------------------------------------------------------------------------
  // B.E.A.U.
  // -------------------------------------------------------------------------

  router.get('/beau/handoffs/:patientId', route(async (req, res) => {
    const handoff = await store.getActiveHandoff(db, Number(req.params.patientId));
    if (!handoff) {
      return res.status(404).json({
        success: false,
        error: 'No active home exercise programme for this patient',
        code: 'NOT_FOUND',
      });
    }
    res.json({ success: true, data: handoff });
  }));

  // -------------------------------------------------------------------------
  // Clinic capabilities and credentials — administrative
  // -------------------------------------------------------------------------

  router.get('/clinic/capabilities', route(async (req, res) => {
    const clinicId = await resolveClinicId(req, db);
    res.json({ success: true, data: await clinicStore.getCapabilities(db, clinicId) });
  }));

  router.put('/clinic/capabilities', requireRole('admin', 'veterinarian', 'vet'), route(async (req, res) => {
    const clinicId = await resolveClinicId(req, db);
    const result = await clinicStore.setCapabilities(db, {
      clinicId, capabilities: req.body, actor: req.user,
    });
    res.json({ success: true, data: result });
  }));

  router.get('/credentials/:userId', route(async (req, res) => {
    res.json({ success: true, data: await authority.listCredentials(db, Number(req.params.userId)) });
  }));

  // Admin only: a practitioner must not be able to grant themselves approval
  // authority by recording their own credential.
  router.post('/credentials', requireRole('admin'), route(async (req, res) => {
    const credential = await authority.addCredential(db, {
      userId: req.body.user_id,
      credential: req.body.credential,
      licenseNumber: req.body.license_number,
      issuingBody: req.body.issuing_body,
      validFrom: req.body.valid_from,
      validUntil: req.body.valid_until,
      verifiedBy: req.user.id,
    });
    res.status(201).json({ success: true, data: credential });
  }));

  // ── User + role administration ─────────────────────────────────────────
  //
  // Approval authority is deliberately restricted, which means there must be a
  // supported way to grant and inspect it. Without this the owner of the system
  // can be locked out of their own project with no route back except SQL.

  /** Every user with whether they can approve, and why not. Admin only. */
  router.get('/users', requireRole('admin'), route(async (req, res) => {
    const users = await db.all(`SELECT id, username, role FROM users ORDER BY id`);
    const enriched = [];
    for (const user of users) {
      const check = await authority.resolveApprovalAuthority(db, { actor: user });
      enriched.push({
        ...user,
        is_system_owner: await authority.isSystemOwner(db, user.id),
        can_approve: check.allowed,
        basis: check.basis,
        reason: check.reason,
        explanation: check.allowed ? null : authority.explainDenial(check.reason, user),
        credentials: await authority.listCredentials(db, user.id),
      });
    }
    res.json({ success: true, data: enriched });
  }));

  /** Set a user's role. Admin only. */
  router.post('/users/:id/role', requireRole('admin'), route(async (req, res) => {
    const userId = Number(req.params.id);
    const role = String(req.body.role || '').trim().toLowerCase();
    if (!role) {
      return res.status(400).json({ success: false, error: 'role is required', code: 'INVALID' });
    }

    const user = await db.get(`SELECT id, username, role FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found', code: 'NOT_FOUND' });
    }

    // The system owner's role is theirs alone to change. Without this, granting
    // a hospital administrator access would let them lock the owner out of
    // their own installation.
    if (await authority.isSystemOwner(db, userId) && Number(req.user.id) !== userId) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        error: `${user.username} owns this installation; only they can change their own role. `
          + `Ownership can be transferred or released from the access screen.`,
      });
    }

    // Refuse to remove the last admin. Locking every administrator out of a
    // running clinical system leaves no supported way back in.
    if (String(user.role).toLowerCase() === 'admin' && role !== 'admin') {
      const admins = await db.all(`SELECT id FROM users WHERE lower(role) = 'admin'`);
      if (admins.length <= 1) {
        return res.status(409).json({
          success: false,
          code: 'IMMUTABLE',
          error: 'This is the only administrator. Promote another user to admin first, '
            + 'or the system would have no one able to manage access.',
        });
      }
    }

    await db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, userId]);
    const check = await authority.resolveApprovalAuthority(db, {
      actor: { ...user, role },
    });
    res.json({
      success: true,
      data: { id: userId, username: user.username, role, can_approve: check.allowed, basis: check.basis },
    });
  }));

  /** Who owns this installation. Visible to everyone — it is not a secret. */
  router.get('/system-owner', route(async (req, res) => {
    res.json({ success: true, data: await authority.getSystemOwner(db) });
  }));

  /**
   * Transfer or release ownership. Only the current owner may do this, so a
   * newly granted administrator cannot seize it.
   */
  router.post('/system-owner', requireRole('admin'), route(async (req, res) => {
    const current = await authority.getSystemOwner(db);
    if (current && Number(current.user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        error: `Only ${current.user.username} can transfer or release ownership of this installation.`,
      });
    }

    if (req.body.release === true) {
      await authority.releaseSystemOwner(db);
      return res.json({ success: true, data: null });
    }

    const userId = Number(req.body.user_id);
    if (!userId) {
      return res.status(400).json({ success: false, code: 'INVALID', error: 'user_id is required' });
    }
    res.json({ success: true, data: await authority.setSystemOwner(db, { userId, note: req.body.note }) });
  }));

  /** Revoke a credential. Past approvals that relied on it remain valid. */
  router.post('/credentials/:id/revoke', requireRole('admin'), route(async (req, res) => {
    const id = Number(req.params.id);
    const row = await db.get(`SELECT * FROM clinician_credentials WHERE id = ?`, [id]);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Credential not found', code: 'NOT_FOUND' });
    }
    await db.run(`UPDATE clinician_credentials SET status = 'REVOKED' WHERE id = ?`, [id]);
    res.json({ success: true, data: { id, status: 'REVOKED' } });
  }));

  /** Whether the current user may approve, and why not if they cannot. */
  router.get('/me/approval-authority', route(async (req, res) => {
    const check = await authority.resolveApprovalAuthority(db, { actor: req.user });
    res.json({
      success: true,
      data: {
        allowed: check.allowed,
        basis: check.basis,
        credential: check.credential ? check.credential.credential : null,
        reason: check.reason,
        explanation: check.allowed ? null : authority.explainDenial(check.reason, req.user),
      },
    });
  }));

  return router;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/**
 * Stopgap clinic resolution.
 *
 * K9 has no clinic linkage: neither `patients` nor `users` carries a clinic_id,
 * so there is nothing to resolve against. This returns the single configured
 * clinic. Correct for a single-practice deployment, and wrong the moment two
 * clinics share an instance — which is why the router accepts an override.
 *
 * If no clinic row exists, one is created rather than returning an id that does
 * not. Returning a fabricated id 1 satisfied the type but violated the
 * clinic_capabilities foreign key, so recording equipment failed with an opaque
 * SQLITE_CONSTRAINT on any installation that had never created a clinic.
 */
async function defaultResolveClinicId(req, db) {
  if (req.user && req.user.clinic_id) return req.user.clinic_id;

  const clinic = await db.get(`SELECT id FROM clinics ORDER BY id LIMIT 1`);
  if (clinic) return clinic.id;

  const created = await db.run(
    `INSERT INTO clinics (clinic_name) VALUES (?)`,
    ['Default clinic']
  );
  return created.lastID;
}

async function defaultGetPatient(db, patientId) {
  return db.get(`SELECT * FROM patients WHERE id = ?`, [patientId]);
}

module.exports = { createV2Router, defaultResolveClinicId, defaultGetPatient };
