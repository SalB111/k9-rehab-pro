/**
 * K9 Clinical Workflow V2 — store errors to HTTP.
 *
 * The clinical stores raise typed errors; this is the single place they become
 * status codes. Centralized so a new error type cannot quietly become a 500 in
 * one route and a 400 in another.
 */

'use strict';

const { ERR } = require('./protocol-store');

/**
 * 409 for IMMUTABLE / ILLEGAL_TRANSITION / NOT_APPROVED / INTEGRITY: the request
 * is well-formed and the caller is permitted, but it conflicts with the current
 * clinical state. That is a conflict, not a bad request — and the distinction
 * matters to a UI deciding whether to show "fix your input" or "this protocol
 * has moved on, reload it".
 */
const STATUS_BY_CODE = {
  [ERR.NOT_FOUND]: 404,
  [ERR.FORBIDDEN]: 403,
  [ERR.INVALID]: 400,
  [ERR.IMMUTABLE]: 409,
  [ERR.ILLEGAL_TRANSITION]: 409,
  [ERR.NOT_APPROVED]: 409,
  [ERR.INTEGRITY]: 409,
  // 409 as well: the protocol is fine and the clinician is permitted, but a
  // safety gate this version was built on has not been confirmed. The UI's
  // response is to show which gates are outstanding, not to reject the form.
  [ERR.GATES_UNCONFIRMED]: 409,
};

function statusFor(err) {
  return (err && STATUS_BY_CODE[err.code]) || 500;
}

/** Wrap an async route so a thrown store error becomes the right status. */
function route(handler) {
  return async function wrapped(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

/** Express error handler. Mount after the V2 router. */
function errorHandler(logger = console) {
  return function v2ErrorHandler(err, req, res, _next) {
    const status = statusFor(err);

    // A 500 is ours, not the caller's — log it with context. Expected clinical
    // refusals (403/409) are normal operation and are not logged as failures.
    if (status === 500) {
      logger.error('[v2] unhandled error', {
        path: req.originalUrl,
        method: req.method,
        actor: req.user && req.user.username,
        message: err && err.message,
        stack: err && err.stack,
      });
    }

    const body = {
      success: false,
      error: status === 500 ? 'Internal error' : err.message,
      code: err.code || 'INTERNAL',
    };
    if (err.reason) body.reason = err.reason;

    res.status(status).json(body);
  };
}

module.exports = { STATUS_BY_CODE, statusFor, route, errorHandler };
