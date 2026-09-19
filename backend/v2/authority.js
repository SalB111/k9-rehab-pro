/**
 * K9 Clinical Workflow V2 — Clinical Authority
 *
 * Answers one question: may this actor approve a clinical protocol, and on what
 * basis?
 *
 * Approval authority in the founding clinics has two distinct sources:
 *
 *   1. LICENSURE      — a veterinarian approves because they are a veterinarian.
 *   2. CREDENTIAL     — a rehabilitation practitioner approves because they hold
 *                       a CURRENT CCRP/CCRT.
 *
 * These are not interchangeable, and the clinical record must state which was
 * used. An approval that says only "role = clinician" does not survive audit;
 * one that says "Jane Doe, CCRP #12345, valid at time of approval" does.
 *
 * WHY EXPIRY IS ENFORCED HERE
 * ---------------------------
 * A lapsed credential is not an authorization. The check evaluates validity at
 * the moment of approval. It does NOT retroactively invalidate past approvals —
 * the approval record stores the credential it relied on, so an approval that
 * was legitimate when made stays legitimate when the certificate later lapses.
 */

'use strict';

/**
 * Roles that approve by licensure alone, needing no separate credential record.
 * A veterinarian's authority to prescribe is the licence itself.
 */
const LICENSURE_ROLES = new Set(['veterinarian', 'vet', 'dvm']);

/**
 * Roles that may approve ONLY while holding a current approving credential.
 * Without one they are a technician with a job title.
 */
const CREDENTIALED_ROLES = new Set(['rehab_practitioner', 'rehab', 'ccrp', 'ccrt']);

/**
 * Administrative override. Retained for system operation and break-glass, and
 * deliberately recorded as its own basis so an audit can separate clinical
 * approvals from administrative ones.
 */
const ADMIN_ROLES = new Set(['admin']);

/** Credentials that confer approval authority on a non-veterinarian. */
const APPROVING_CREDENTIALS = new Set(['CCRP', 'CCRT', 'CCRV', 'DVM', 'VMD', 'BVSC']);

const BASIS = {
  LICENSURE: 'LICENSURE',
  CREDENTIAL: 'CREDENTIAL',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
};

const DENIAL = {
  NO_ROLE: 'NO_ROLE',
  ROLE_NOT_PERMITTED: 'ROLE_NOT_PERMITTED',
  NO_CREDENTIAL: 'NO_CREDENTIAL',
  CREDENTIAL_EXPIRED: 'CREDENTIAL_EXPIRED',
  CREDENTIAL_NOT_ACTIVE: 'CREDENTIAL_NOT_ACTIVE',
};

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * Is this credential row usable as approval authority on `asOf`?
 *
 * Dates are compared as ISO day strings. A credential with no stated expiry is
 * treated as open-ended — some issuing bodies do not expire certification — but
 * a REVOKED or SUSPENDED status always disqualifies regardless of dates.
 */
function credentialUsable(row, asOf) {
  if (!row) return { usable: false, reason: DENIAL.NO_CREDENTIAL };

  if (normalize(row.status) !== 'active') {
    return {
      usable: false,
      reason: normalize(row.status) === 'expired' ? DENIAL.CREDENTIAL_EXPIRED : DENIAL.CREDENTIAL_NOT_ACTIVE,
    };
  }
  if (!APPROVING_CREDENTIALS.has(String(row.credential || '').toUpperCase())) {
    return { usable: false, reason: DENIAL.NO_CREDENTIAL };
  }

  const day = String(asOf).slice(0, 10);
  if (row.valid_from && String(row.valid_from).slice(0, 10) > day) {
    return { usable: false, reason: DENIAL.CREDENTIAL_NOT_ACTIVE };
  }
  if (row.valid_until && String(row.valid_until).slice(0, 10) < day) {
    return { usable: false, reason: DENIAL.CREDENTIAL_EXPIRED };
  }
  return { usable: true, reason: null };
}

/** Credentials on file for a user, newest first. */
async function listCredentials(db, userId) {
  return db.all(
    `SELECT * FROM clinician_credentials WHERE user_id = ? ORDER BY id DESC`,
    [userId]
  );
}

/**
 * Resolve whether `actor` may approve, and on what basis.
 *
 * @returns {Promise<{allowed: boolean, basis: string|null, credential: object|null, reason: string|null}>}
 *
 * On success the returned `credential` is what gets written onto the approval
 * record. For a veterinarian approving by licensure it may be null — the basis
 * is LICENSURE and the role itself is the authority.
 */
async function resolveApprovalAuthority(db, { actor, asOf }) {
  const when = asOf || new Date().toISOString().slice(0, 10);
  const role = normalize(actor && actor.role);

  if (!role) return { allowed: false, basis: null, credential: null, reason: DENIAL.NO_ROLE };

  if (ADMIN_ROLES.has(role)) {
    return { allowed: true, basis: BASIS.ADMINISTRATIVE, credential: null, reason: null };
  }

  if (LICENSURE_ROLES.has(role)) {
    // A veterinarian approves by licensure. If a licence credential happens to
    // be on file we attach it for the record, but its absence is not a barrier —
    // K9 does not hold licence numbers for every vet account today.
    const credentials = await listCredentials(db, actor.id);
    const licence = credentials.find(
      (c) => ['DVM', 'VMD', 'BVSC'].includes(String(c.credential || '').toUpperCase())
             && credentialUsable(c, when).usable
    );
    return { allowed: true, basis: BASIS.LICENSURE, credential: licence || null, reason: null };
  }

  if (CREDENTIALED_ROLES.has(role)) {
    const credentials = await listCredentials(db, actor.id);
    if (!credentials.length) {
      return { allowed: false, basis: null, credential: null, reason: DENIAL.NO_CREDENTIAL };
    }

    let firstReason = DENIAL.NO_CREDENTIAL;
    for (const row of credentials) {
      const check = credentialUsable(row, when);
      if (check.usable) {
        return { allowed: true, basis: BASIS.CREDENTIAL, credential: row, reason: null };
      }
      // Surface the most informative denial: an expired certificate is a
      // different conversation from never having held one.
      if (check.reason === DENIAL.CREDENTIAL_EXPIRED) firstReason = DENIAL.CREDENTIAL_EXPIRED;
      else if (firstReason === DENIAL.NO_CREDENTIAL) firstReason = check.reason;
    }
    return { allowed: false, basis: null, credential: null, reason: firstReason };
  }

  return { allowed: false, basis: null, credential: null, reason: DENIAL.ROLE_NOT_PERMITTED };
}

/** Human-readable explanation, for API responses and the approval screen. */
function explainDenial(reason, actor) {
  switch (reason) {
    case DENIAL.NO_CREDENTIAL:
      return `${actor?.username || 'This user'} holds no current approving credential (CCRP/CCRT). ` +
             `A rehabilitation practitioner may prepare and modify a protocol but cannot approve it without one.`;
    case DENIAL.CREDENTIAL_EXPIRED:
      return `${actor?.username || 'This user'}'s rehabilitation credential has expired. ` +
             `Renew it, or have the attending veterinarian approve.`;
    case DENIAL.CREDENTIAL_NOT_ACTIVE:
      return `${actor?.username || 'This user'}'s credential is not active (revoked, suspended, or not yet in effect).`;
    case DENIAL.ROLE_NOT_PERMITTED:
      return `Role '${actor?.role}' cannot approve a clinical protocol. ` +
             `Approval requires an attending veterinarian or a credentialed rehabilitation practitioner.`;
    case DENIAL.NO_ROLE:
      return 'No role is assigned to this account, so it cannot approve a clinical protocol.';
    default:
      return 'Not authorized to approve a clinical protocol.';
  }
}


// ---------------------------------------------------------------------------
// System owner
// ---------------------------------------------------------------------------

/**
 * Who owns this installation.
 *
 * Restricted approval authority creates a real failure mode: once a second
 * administrator exists they can demote the first, and the person who owns the
 * software can be locked out of it by someone they granted access to.
 *
 * The owner's role cannot be changed by anyone else. This is deliberately NOT a
 * hidden backdoor — the owner is shown in the access screen and the CLI, holds
 * no permission an administrator lacks, and can be released or transferred
 * whenever the installation is handed over.
 */
async function getSystemOwner(db) {
  try {
    const row = await db.get(`SELECT * FROM system_owner WHERE id = 1`);
    if (!row) return null;
    const user = await db.get(`SELECT id, username, role FROM users WHERE id = ?`, [row.user_id]);
    return user ? { ...row, user } : null;
  } catch {
    return null; // table not yet applied
  }
}

async function isSystemOwner(db, userId) {
  const owner = await getSystemOwner(db);
  return Boolean(owner && Number(owner.user_id) === Number(userId));
}

/** Claim or transfer ownership. */
async function setSystemOwner(db, { userId, note }) {
  const user = await db.get(`SELECT id, username FROM users WHERE id = ?`, [userId]);
  if (!user) throw new Error(`No user with id ${userId}`);

  const existing = await db.get(`SELECT id FROM system_owner WHERE id = 1`);
  if (existing) {
    await db.run(
      `UPDATE system_owner SET user_id = ?, note = ?, set_at = CURRENT_TIMESTAMP WHERE id = 1`,
      [userId, note ?? null]
    );
  } else {
    await db.run(`INSERT INTO system_owner (id, user_id, note) VALUES (1, ?, ?)`, [userId, note ?? null]);
  }
  return getSystemOwner(db);
}

/** Give up ownership. Used when handing an installation to its operator. */
async function releaseSystemOwner(db) {
  await db.run(`DELETE FROM system_owner WHERE id = 1`);
  return null;
}

/** Record a credential. Used by seeding and by clinic administration. */
async function addCredential(db, { userId, credential, licenseNumber, issuingBody, validFrom, validUntil, verifiedBy }) {
  const result = await db.run(
    `INSERT INTO clinician_credentials
       (user_id, credential, license_number, issuing_body, valid_from, valid_until, status, verified_by, verified_at)
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
    [
      userId,
      String(credential).toUpperCase(),
      licenseNumber ?? null,
      issuingBody ?? null,
      validFrom ?? null,
      validUntil ?? null,
      verifiedBy ?? null,
      verifiedBy ? new Date().toISOString() : null,
    ]
  );
  return db.get(`SELECT * FROM clinician_credentials WHERE id = ?`, [result.lastID]);
}

module.exports = {
  LICENSURE_ROLES,
  CREDENTIALED_ROLES,
  ADMIN_ROLES,
  APPROVING_CREDENTIALS,
  BASIS,
  DENIAL,

  credentialUsable,
  listCredentials,
  resolveApprovalAuthority,
  explainDenial,
  addCredential,
  getSystemOwner,
  isSystemOwner,
  setSystemOwner,
  releaseSystemOwner,
};
