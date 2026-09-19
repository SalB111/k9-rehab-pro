/**
 * K9 Clinical Workflow V2 — role and authority middleware.
 *
 * K9 has no role enforcement anywhere today: `requireAuth` proves who you are,
 * nothing checks what you may do. These are the missing half.
 *
 * DEFENCE IN DEPTH, NOT THE ONLY DEFENCE
 * --------------------------------------
 * protocol-store already refuses an unauthorized approval, and Postgres RLS
 * refuses it again at the database. This middleware rejects it at the edge so
 * the request never reaches clinical code — but it is the outermost layer, not
 * the authoritative one. Removing it must not make an unauthorized approval
 * possible, and the store's tests prove it does not.
 */

'use strict';

const authority = require('../authority');

/**
 * Require one of `roles`.
 *
 * Use for coarse checks such as "admins only". For approval, use
 * requireApprovalAuthority — a role alone does not establish authority to
 * prescribe, because a rehabilitation practitioner also needs a current
 * credential.
 */
function requireRole(...roles) {
  const permitted = new Set(roles.flat().map((r) => String(r).toLowerCase()));

  return function roleGuard(req, res, next) {
    const actor = req.user;
    if (!actor || !actor.role) {
      return res.status(403).json({
        success: false,
        error: 'No role is assigned to this account.',
        code: 'FORBIDDEN',
      });
    }
    if (!permitted.has(String(actor.role).toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: `Role '${actor.role}' is not permitted here. Requires: ${[...permitted].join(', ')}.`,
        code: 'FORBIDDEN',
      });
    }
    return next();
  };
}

/**
 * Require authority to approve a clinical protocol.
 *
 * Resolves the same two bases the store uses — LICENSURE for a veterinarian,
 * CREDENTIAL for a rehabilitation practitioner with a current CCRP/CCRT — and
 * attaches the result as `req.approvalAuthority` so the route does not resolve
 * it twice.
 *
 * `getDb` is injected rather than imported so the middleware works against
 * whichever provider the host app configured.
 */
function requireApprovalAuthority(getDb) {
  return async function approvalGuard(req, res, next) {
    try {
      const db = typeof getDb === 'function' ? await getDb(req) : getDb;
      const check = await authority.resolveApprovalAuthority(db, { actor: req.user });

      if (!check.allowed) {
        return res.status(403).json({
          success: false,
          error: authority.explainDenial(check.reason, req.user),
          code: 'FORBIDDEN',
          reason: check.reason,
        });
      }

      req.approvalAuthority = check;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { requireRole, requireApprovalAuthority };
