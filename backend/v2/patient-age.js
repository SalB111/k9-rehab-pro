/**
 * K9 Clinical Workflow V2 — Age from date of birth
 *
 * Age is the only fact on a patient record that becomes wrong by itself.
 *
 * Every stored age in this database is correct today and will not be correct
 * next year. Nobody revisits a record to increment it, so the column drifts
 * silently — which is how one patient came to be recorded as six years old
 * with a date of birth, in the same record, that said two.
 *
 * A date of birth does not drift. Derived from it, age is right whenever it is
 * asked for.
 *
 * WHAT THIS DOES NOT DO
 *
 * It does not correct the stored age. Two records of the same animal saying
 * different things is a clinical question, and dashboard-bridge already
 * refuses to resolve one in a mapper — the same reasoning applies here. This
 * module derives, compares, and reports.
 *
 * It is also NOT a safety fix, and should not be sold as one: `age` is not an
 * engine input. The contract's thirty-five inputs do not include it, and the
 * engine's only mention of the word is a substring test for the phrase
 * "age-related" inside a diagnosis. A stale age misleads the clinician reading
 * the record; it does not change which exercises are selected.
 */

'use strict';

/** Strictly YYYY-MM-DD, which is what `<input type="date">` stores. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * The oldest reliably documented dog was 29. Beyond 30 the value is a typo —
 * a mistyped year, usually — and treating it as a real birth date would put a
 * nonsense age on a medical record.
 */
const MAX_PLAUSIBLE_YEARS = 30;

const PROBLEM = {
  NOT_ISO: 'NOT_ISO',
  INVALID_DATE: 'INVALID_DATE',
  FUTURE: 'FUTURE',
  IMPLAUSIBLE: 'IMPLAUSIBLE',
};

/**
 * Parse a stored date of birth.
 *
 * Only ISO is accepted. "03/04/2024" is the third of April or the fourth of
 * March depending on who typed it, and there is no way to tell from the value
 * — so it is refused rather than guessed at. A guess here produces an age that
 * is wrong by up to a year and looks exactly as authoritative as a right one.
 */
function parseDob(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { iso: null, problem: null };
  }
  const text = String(value).trim();
  const m = ISO_DATE.exec(text);
  if (!m) return { iso: null, problem: PROBLEM.NOT_ISO, stated: text };

  const [, y, mo, d] = m.map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d));
  // Round-trip check: Date.UTC rolls 2025-02-30 forward into March rather than
  // rejecting it, so a date that does not come back unchanged never existed.
  if (
    date.getUTCFullYear() !== y
    || date.getUTCMonth() !== mo - 1
    || date.getUTCDate() !== d
  ) {
    return { iso: null, problem: PROBLEM.INVALID_DATE, stated: text };
  }
  return { iso: text, problem: null, y, mo, d };
}

/** Today, as UTC year/month/day. Injectable so a test is not time-dependent. */
function asOfParts(asOf) {
  const now = asOf ? new Date(asOf) : new Date();
  if (Number.isNaN(now.getTime())) throw new TypeError('asOf is not a date');
  return { y: now.getUTCFullYear(), mo: now.getUTCMonth() + 1, d: now.getUTCDate() };
}

/**
 * Completed years and months since birth.
 *
 * Calendar arithmetic, not milliseconds divided by 365.25. The approximation
 * drifts by a day every four years and puts a dog's age over the line on the
 * wrong side of its birthday — and on 29 February it is wrong immediately.
 *
 * Completed years is the conventional age: a dog 2 years and 8 months old is
 * "2". That is already the floor, so a stored age should equal this exactly
 * rather than needing to be rounded to meet it.
 */
function ageFrom(dobValue, asOf) {
  const parsed = parseDob(dobValue);
  if (!parsed.iso) return { years: null, months: null, totalMonths: null, problem: parsed.problem };

  const today = asOfParts(asOf);
  let months = (today.y - parsed.y) * 12 + (today.mo - parsed.mo);
  if (today.d < parsed.d) months -= 1;

  if (months < 0) {
    return { years: null, months: null, totalMonths: null, problem: PROBLEM.FUTURE, iso: parsed.iso };
  }

  const years = Math.floor(months / 12);
  if (years > MAX_PLAUSIBLE_YEARS) {
    // Reported, not discarded: the value is still what somebody typed, and a
    // record showing an impossible age needs a person to look at it.
    return {
      years, months: months % 12, totalMonths: months,
      problem: PROBLEM.IMPLAUSIBLE, iso: parsed.iso,
    };
  }
  return { years, months: months % 12, totalMonths: months, problem: null, iso: parsed.iso };
}

/**
 * Does the stored age match the date of birth?
 *
 * `null` when either side cannot be read — which is not agreement and not
 * disagreement, and a caller that treats a null as "fine" is making the same
 * mistake as one that treats an unstated capability as absent.
 */
function agreesWithStated(dobValue, statedAge, asOf) {
  const derived = ageFrom(dobValue, asOf);
  if (derived.years === null) return null;
  // Tested BEFORE Number(), which turns null, undefined and "" all into 0 —
  // and 0 is a finite number, so an unstated age would sail through and be
  // reported as disagreeing with the date of birth rather than as unknown.
  if (statedAge === null || statedAge === undefined || String(statedAge).trim() === '') return null;
  const stated = Number(statedAge);
  if (!Number.isFinite(stated)) return null;
  return Math.floor(stated) === derived.years;
}

module.exports = {
  PROBLEM,
  MAX_PLAUSIBLE_YEARS,
  parseDob,
  ageFrom,
  agreesWithStated,
};
