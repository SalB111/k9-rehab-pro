// ─────────────────────────────────────────────
// PATIENT WEIGHT — units and conversion
//
// POUNDS ARE CANONICAL. `patients.weight` holds pounds and always has:
//
//   _parked/GeneratorView.jsx:131
//     weight: +form.weightLbs || +form.weightKg * 2.20462 || 0,
//
// Every existing record was written through that line, the V1 dashboard field
// is labelled "Weight (lbs)", and ten of the eleven places this product
// renders a weight say lbs. Nothing is stored in kilograms anywhere.
//
// That mattered because two V2 screens disagreed with it. The registration
// form hinted "Kilograms." and the snapshot rendered "68kg" for a record
// holding 68 POUNDS — so a 31 kg Labrador displayed as a 68 kg one, and
// anyone who followed the hint and typed 31 created a record meaning 31 lbs.
//
// The fix is not to migrate the database. It is to stop asking people to
// convert in their heads: weight is entered in either unit, both are shown,
// and pounds are what get saved. A receptionist types what is on the scale.
//
// Note the published veterinary rehabilitation literature is metric, and
// red-flags.js sizeClass() takes kilograms — so anything doing clinical
// arithmetic converts HERE rather than assuming.
// ─────────────────────────────────────────────

/** Pounds per kilogram. The single definition; do not inline this number. */
export const LB_PER_KG = 2.20462;

/** Weights are recorded to one decimal place in both units. */
const ROUND = (n) => Math.round(n * 10) / 10;

/**
 * Pounds to kilograms.
 * @returns {number|null} null for anything that is not a positive number, so a
 *   caller never renders a converted value for an absent or nonsense input.
 */
export function lbsToKg(lbs) {
  const n = typeof lbs === "number" ? lbs : parseFloat(lbs);
  if (!Number.isFinite(n) || n <= 0) return null;
  return ROUND(n / LB_PER_KG);
}

/** Kilograms to pounds. Same contract as lbsToKg. */
export function kgToLbs(kg) {
  const n = typeof kg === "number" ? kg : parseFloat(kg);
  if (!Number.isFinite(n) || n <= 0) return null;
  return ROUND(n * LB_PER_KG);
}

/**
 * A stored weight, rendered for a human, in both units.
 *
 * Always shows the unit. A bare number is what let "68" be read as kilograms
 * on one screen and pounds on another.
 *
 * @param {number|string} lbs — the stored value, in pounds
 * @returns {string} e.g. "68 lbs (30.8 kg)", or "" when there is nothing to show
 */
export function formatWeight(lbs) {
  const kg = lbsToKg(lbs);
  if (kg === null) return "";
  const n = typeof lbs === "number" ? lbs : parseFloat(lbs);
  return `${ROUND(n)} lbs (${kg} kg)`;
}
