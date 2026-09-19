/**
 * K9 Clinical Workflow V2 — owner access to B.E.A.U. Home
 *
 * Pet owners do not get clinician accounts. The practice issues a code, the
 * owner enters it once, and the app holds a short-lived token scoped to that
 * one patient.
 *
 * WHY NOT OWNER ACCOUNTS
 * A password an owner sets is a password an owner forgets, and a reset flow is
 * an attack surface on a clinical system for very little benefit. A code the
 * clinic issues and can revoke matches how the relationship actually works: the
 * practice decides who is looking after this dog.
 *
 * WHAT AN OWNER TOKEN CAN DO
 * Report against ONE patient. It carries `scope: 'owner'` and a patient id.
 * The middleware establishes WHO is calling; each route decides what they may
 * touch, either by deriving the patient from the token or by checking the
 * record's owner. It cannot read another patient, cannot reach clinical routes,
 * and cannot be mistaken for a clinician token — requireAuth resolves a user id,
 * and an owner token has none.
 *
 * WHAT IT CANNOT DO
 * Change anything clinical. The owner routes only report; approving, dosing and
 * prescribing all live behind clinician authority.
 */

'use strict';

const crypto = require('crypto');

const TOKEN_TTL_SECONDS = 60 * 60 * 12;   // a working day; re-enter the code after
const OWNER_SCOPE = 'owner';

/**
 * Unambiguous alphabet: no O/0, I/1, or similar pairs.
 *
 * These codes get read aloud over the phone and copied off a printed handout.
 * A character set that produces "was that an O or a zero" wastes a client's
 * time and generates support calls.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A 12-character code, grouped for reading: XXXX-XXXX-XXXX. */
function generateCode() {
  const bytes = crypto.randomBytes(12);
  let raw = '';
  for (let i = 0; i < 12; i++) raw += ALPHABET[bytes[i] % ALPHABET.length];
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

/** Codes are compared by hash — the database never holds a usable one. */
function hashCode(code) {
  return crypto.createHash('sha256').update(normalizeCode(code)).digest('hex');
}

function normalizeCode(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// ---------------------------------------------------------------------------
// Issuing and revoking
// ---------------------------------------------------------------------------

/**
 * Issue a code for a patient, revoking any previous one.
 *
 * The plaintext is returned exactly once. It is not recoverable afterwards; a
 * client who loses it gets a new code, which also ends the old one.
 */
async function issueAccessCode(db, { patientId, actor }) {
  if (!patientId) throw new Error('patientId is required');
  if (!actor || !actor.id) throw new Error('An identified clinician is required');

  await db.run(
    `UPDATE home_access SET status = 'REVOKED', revoked_at = CURRENT_TIMESTAMP
      WHERE patient_id = ? AND status = 'ACTIVE'`,
    [patientId]
  );

  const code = generateCode();
  const created = await db.run(
    `INSERT INTO home_access (patient_id, code_hash, code_hint, status, issued_by, issued_by_username)
     VALUES (?, ?, ?, 'ACTIVE', ?, ?)`,
    [patientId, hashCode(code), code.slice(-4), actor.id, actor.username]
  );

  return { id: created.lastID, patient_id: patientId, code, hint: code.slice(-4) };
}

async function getAccessStatus(db, patientId) {
  const row = await db.get(
    `SELECT id, patient_id, code_hint, status, issued_by_username, issued_at, last_used_at
       FROM home_access WHERE patient_id = ? AND status = 'ACTIVE' ORDER BY id DESC LIMIT 1`,
    [patientId]
  );
  return row || null;
}

async function revokeAccess(db, { patientId }) {
  await db.run(
    `UPDATE home_access SET status = 'REVOKED', revoked_at = CURRENT_TIMESTAMP
      WHERE patient_id = ? AND status = 'ACTIVE'`,
    [patientId]
  );
  return { patient_id: patientId, status: 'REVOKED' };
}

// ---------------------------------------------------------------------------
// Exchanging a code for a token
// ---------------------------------------------------------------------------

/**
 * Verify a code and issue a scoped token.
 *
 * Deliberately returns the same failure for an unknown code and a revoked one:
 * telling a caller which is which turns the endpoint into an oracle for
 * probing valid codes.
 */
async function exchangeCodeForToken(db, { code, jwt, secret }) {
  const hash = hashCode(code);
  const row = await db.get(
    `SELECT * FROM home_access WHERE code_hash = ? AND status = 'ACTIVE'`, [hash]);

  if (!row) {
    const err = new Error('That code was not recognised. Ask the clinic for a current one.');
    err.code = 'INVALID_CODE';
    throw err;
  }

  await db.run(`UPDATE home_access SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?`, [row.id]);

  const patient = await db.get(`SELECT id, name FROM patients WHERE id = ?`, [row.patient_id]);

  const token = jwt.sign(
    { scope: OWNER_SCOPE, patient_id: row.patient_id, access_id: row.id },
    secret,
    { expiresIn: TOKEN_TTL_SECONDS }
  );

  return {
    token,
    expires_in: TOKEN_TTL_SECONDS,
    patient: { id: row.patient_id, name: patient ? patient.name : null },
  };
}

/**
 * Middleware: accept either a clinician (via the host's requireAuth) or an
 * owner token.
 *
 * `req.owner` is set for an owner; `req.user` for a clinician. A route can then
 * tell who it is serving, which matters because an owner must never be offered
 * a clinician's actions.
 */
function allowOwnerOrClinician({ jwt, secret, requireAuth, db }) {
  return async function ownerGuard(req, res, next) {
    const header = req.headers.authorization || '';
    const raw = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (raw) {
      try {
        const decoded = jwt.verify(raw, secret);
        if (decoded && decoded.scope === OWNER_SCOPE) {
          // NOTE: scoping is NOT done here. `:id` means different things on
          // different routes — a session id on /home-sessions/:id, a request id
          // on /video-requests/:id — so comparing it to a patient id would
          // reject legitimate access (an owner of patient 100 could only ever
          // open session 100). Each route scopes explicitly instead, either by
          // deriving the patient from the token or by checking the record's
          // owner. This middleware establishes WHO is calling; the route
          // decides what they may touch.

          // A revoked code must stop working immediately, not when the token
          // happens to expire.
          const access = await db.get(
            `SELECT status FROM home_access WHERE id = ?`, [decoded.access_id]);
          if (!access || access.status !== 'ACTIVE') {
            return res.status(401).json({
              success: false, code: 'ACCESS_REVOKED',
              error: 'This access code is no longer valid. Ask the clinic for a new one.',
            });
          }

          req.owner = { patient_id: Number(decoded.patient_id), access_id: decoded.access_id };
          return next();
        }
      } catch {
        // Not an owner token — fall through to clinician auth.
      }
    }

    if (typeof requireAuth === 'function') return requireAuth(req, res, next);
    return res.status(401).json({ success: false, error: 'Authentication required' });
  };
}

/** Resolve the patient a request is acting on, whoever is asking. */
function patientIdFor(req) {
  if (req.owner) return req.owner.patient_id;
  const fromUrl = Number(req.params.id ?? req.params.patientId);
  return Number.isFinite(fromUrl) ? fromUrl : null;
}

module.exports = {
  OWNER_SCOPE, TOKEN_TTL_SECONDS,
  generateCode, hashCode, normalizeCode,
  issueAccessCode, getAccessStatus, revokeAccess,
  exchangeCodeForToken, allowOwnerOrClinician, patientIdFor,
};
