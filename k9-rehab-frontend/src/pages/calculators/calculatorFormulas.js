// ─────────────────────────────────────────────────────────────
// Weight Calculator — Clinical Formulas & Reference Data
// Sourced from: Millis & Levine 2nd ed. (2014), WSAVA Global
// Nutrition Guidelines, Laflamme DP (1997), NRC 2006 Nutrient
// Requirements of Dogs and Cats.
// Subset of the full rehab-calculators formulas module, scoped
// to BCS / ideal weight and caloric needs (RER/MER).
// ─────────────────────────────────────────────────────────────

export const BCS_SCALE = [
  { score: 1, label: "Emaciated",     pctOfIdeal: 70,  description: "Ribs, lumbar vertebrae, pelvic bones visible from distance. No discernible body fat. Obvious loss of muscle mass." },
  { score: 2, label: "Very Thin",     pctOfIdeal: 80,  description: "Ribs and bony landmarks easily visible. No palpable fat. Minimal muscle loss." },
  { score: 3, label: "Thin",          pctOfIdeal: 90,  description: "Ribs easily palpated, may be visible. Pelvic bones becoming prominent. Obvious waist." },
  { score: 4, label: "Underweight",   pctOfIdeal: 95,  description: "Ribs easily palpable with minimal fat. Waist easily noted. Abdominal tuck evident." },
  { score: 5, label: "Ideal",         pctOfIdeal: 100, description: "Ribs palpable without excess fat. Waist visible behind ribs. Abdomen tucked when viewed from side." },
  { score: 6, label: "Overweight",    pctOfIdeal: 110, description: "Ribs palpable with slight excess fat. Waist discernible but not prominent. Abdominal tuck apparent." },
  { score: 7, label: "Heavy",         pctOfIdeal: 120, description: "Ribs palpable with difficulty; heavy fat cover. Fat deposits over lumbar and base of tail. Waist absent or barely visible." },
  { score: 8, label: "Obese",         pctOfIdeal: 130, description: "Ribs not palpable under heavy fat. Heavy deposits over lumbar, base of tail. Waist absent. No abdominal tuck." },
  { score: 9, label: "Grossly Obese", pctOfIdeal: 145, description: "Massive fat deposits over thorax, spine, tail base. Waist and abdominal tuck absent. Obvious abdominal distention." },
];

export const FELINE_BCS_SCALE = [
  { score: 1, label: "Emaciated",     pctOfIdeal: 70,  description: "Ribs visible on shorthaired cats. No palpable fat. Severe abdominal tuck. Lumbar vertebrae and wings of ilia easily palpated." },
  { score: 2, label: "Very Thin",     pctOfIdeal: 80,  description: "Ribs easily palpable with minimal fat covering. Lumbar vertebrae obvious. Obvious waist behind ribs. Minimal abdominal fat." },
  { score: 3, label: "Thin",          pctOfIdeal: 90,  description: "Ribs easily palpable with minimal fat. Obvious waist behind ribs when viewed from above. Abdominal fat pad absent or minimal." },
  { score: 4, label: "Underweight",   pctOfIdeal: 95,  description: "Ribs palpable with minimal fat covering. Waist obvious. Slight abdominal tuck." },
  { score: 5, label: "Ideal",         pctOfIdeal: 100, description: "Well-proportioned. Waist observed behind ribs. Ribs palpable with slight fat covering. Abdominal fat pad minimal." },
  { score: 6, label: "Overweight",    pctOfIdeal: 110, description: "Ribs palpable with slight excess fat. Waist and abdominal fat pad distinguishable but noticeable." },
  { score: 7, label: "Heavy",         pctOfIdeal: 120, description: "Ribs not easily palpated with moderate fat. Waist poorly discernible. Obvious abdominal fat pad. Rounding of abdomen." },
  { score: 8, label: "Obese",         pctOfIdeal: 130, description: "Ribs not palpable under moderate fat. Waist absent. Obvious abdominal distention and rounding. Prominent abdominal fat pad. Fat deposits over lumbar area." },
  { score: 9, label: "Grossly Obese", pctOfIdeal: 145, description: "Ribs not palpable under thick fat cover. Heavy fat deposits over lumbar area, face, and limbs. Obvious distention of abdomen with no waist. Extensive abdominal fat deposits." },
];

export const ACTIVITY_FACTORS = [
  { key: "weight_loss",      label: "Weight Loss Program",         factor: 1.0, note: "Feed at RER to achieve ~1-2% body weight loss/week" },
  { key: "rehab_restricted", label: "Rehab — Activity Restricted", factor: 1.2, note: "Post-op crate rest / strict rehab" },
  { key: "geriatric",        label: "Geriatric (inactive)",        factor: 1.4, note: "" },
  { key: "neutered_adult",   label: "Neutered Adult (normal)",     factor: 1.6, note: "" },
  { key: "intact_adult",     label: "Intact Adult",                factor: 1.8, note: "" },
  { key: "light_activity",   label: "Light Activity",              factor: 2.0, note: "" },
  { key: "moderate_work",    label: "Moderate Work",               factor: 3.0, note: "" },
  { key: "heavy_work",       label: "Heavy Work / Performance",    factor: 4.0, note: "Up to 8.0 for sled dogs" },
];

export const FELINE_ACTIVITY_FACTORS = [
  { key: "weight_loss",      label: "Weight Loss Program",      factor: 0.8, note: "Feed at 80% RER; target 0.5-2% body weight loss/week" },
  { key: "rehab_restricted", label: "Rehab — Restricted",       factor: 1.0, note: "Post-op / strict cage rest" },
  { key: "geriatric",        label: "Geriatric (inactive)",     factor: 1.1, note: "" },
  { key: "neutered_adult",   label: "Neutered Adult (indoor)",  factor: 1.2, note: "Most common category" },
  { key: "intact_adult",     label: "Intact Adult",             factor: 1.4, note: "" },
  { key: "active_adult",     label: "Active Adult (outdoor)",   factor: 1.6, note: "" },
  { key: "growing_kitten",   label: "Growing Kitten (<1yr)",    factor: 2.5, note: "Up to 3.0 for very young kittens" },
];

export const getBCSScale = (species) =>
  species === "feline" ? FELINE_BCS_SCALE : BCS_SCALE;

export const getActivityFactors = (species) =>
  species === "feline" ? FELINE_ACTIVITY_FACTORS : ACTIVITY_FACTORS;

export const roundTo = (value, decimals = 1) => {
  const m = Math.pow(10, decimals);
  return Math.round(value * m) / m;
};

export const kgToLb = (kg) => roundTo(kg * 2.20462, 1);
export const lbToKg = (lb) => roundTo(lb / 2.20462, 2);

export const calcRER = (bwKg) => {
  if (!bwKg || bwKg <= 0) return 0;
  return roundTo(70 * Math.pow(bwKg, 0.75), 0);
};

export const calcMER = (bwKg, activityFactor) =>
  roundTo(calcRER(bwKg) * activityFactor, 0);
