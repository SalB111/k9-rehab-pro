'use strict';

/**
 * WHICH CLINIC IS THIS? — for anything that is not an HTTP request.
 *
 * WHY THIS EXISTS
 *
 * Scripts and tests were passing a hardcoded `1` to
 * `clinicStore.getCapabilities`. There IS NO CLINIC 1 — the table holds ids 3
 * and 5 — and getCapabilities answers for an unknown clinic with a perfectly
 * plausible empty record rather than an error.
 *
 * So on 2026-09-26 the audit, drive-flow and three test suites all reported
 * "10 of 10 capabilities unstated, every gated therapy withheld" about a
 * clinic that had never existed, while the real clinic's record sat elsewhere
 * untouched. I told Sal his equipment had not saved. It had.
 *
 * This resolves the clinic THE WAY THE APP DOES, which is the only answer that
 * means anything: `defaultResolveClinicId` in routes/v2-router.js takes
 * `req.user.clinic_id` when present and otherwise the first clinic by id.
 * `users` has no `clinic_id` column today, so in practice it is always the
 * first clinic — but this mirrors the whole rule rather than the half of it
 * that happens to be true.
 *
 * It does NOT create a clinic. The HTTP path does, because a request has to be
 * served; a read-only script inventing a clinic row to measure would be
 * manufacturing the thing it is reporting on.
 */

/**
 * @param {object} db      the app's { get, all, run } wrapper
 * @param {object} [actor] a user row, if one is in hand
 * @returns {Promise<number|null>} the clinic id, or null when none exists
 */
async function resolveClinicId(db, actor) {
  if (actor && actor.clinic_id) return actor.clinic_id;
  const row = await db.get('SELECT id FROM clinics ORDER BY id LIMIT 1');
  return row ? row.id : null;
}

/**
 * The same answer, but refusing to silently measure a clinic that is not
 * there. Use this anywhere a wrong number would be reported as a finding.
 */
async function requireClinicId(db, actor) {
  const id = await resolveClinicId(db, actor);
  if (!id) {
    throw new Error(
      'No clinic exists. Nothing can be said about equipment or capabilities '
      + 'until one does — and reporting "nothing configured" here would be a '
      + 'claim about a clinic rather than about the absence of one.'
    );
  }
  return id;
}

module.exports = { resolveClinicId, requireClinicId };
