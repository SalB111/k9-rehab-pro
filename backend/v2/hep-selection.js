/**
 * K9 Clinical Workflow V2 — venue classification and home selection
 *
 * The engine returns everything clinically relevant for a phase — 8 to 12
 * exercises a week. Two separate things have to happen before that becomes a
 * home programme:
 *
 *   1. VENUE. Some of what the engine prescribes is clinic-delivered. A Class IV
 *      therapeutic laser and neuromuscular e-stim require a trained operator,
 *      eye protection and intensity titration. Handing those to a pet owner is
 *      not a usability problem, it is a safety one. Those belong in the
 *      in-clinic protocol the CCRT delivers, never in the HEP.
 *
 *   2. VOLUME. Of what remains, a realistic home programme is three to five
 *      exercises. A vet-approved HEP an owner will not complete is clinically
 *      worse than a shorter one they will — adherence, not protocol richness,
 *      is the binding constraint in home rehabilitation.
 *
 * WHAT THIS MODULE IS NOT
 * It does not decide treatment. The engine has already applied every safety
 * gate; this ranks and proposes WITHIN what the engine permitted, and can only
 * ever narrow that set. It never adds an exercise, never changes a dosage, and
 * never overrides an exclusion. The clinician confirms or changes the selection,
 * and every proposal carries the reason it was made so it can be argued with.
 */

'use strict';

const VENUE = {
  CLINIC: 'CLINIC',   // requires a trained operator or clinic equipment
  HOME: 'HOME',       // an owner can perform this safely after instruction
};

/**
 * Codes that are clinic-delivered regardless of what equipment a household
 * happens to own. Explicit rather than inferred, because the failure mode of
 * getting this wrong is an owner operating a Class IV laser.
 *
 * Matched as substrings so family variants (NMES_QUAD, NMES_GLUTE) are caught.
 */
const CLINIC_ONLY_CODES = [
  'LASER',        // Class IV photobiomodulation — eye protection, trained operator
  'NMES',         // neuromuscular e-stim — electrode placement, intensity titration
  'ESTIM',
  'TENS',         // home units exist but placement and intensity are clinician-set
  'US_PULSED',    // therapeutic ultrasound
  'US_CONTINUOUS',
  'ULTRASOUND',
  'SHOCKWAVE',    // ESWT — sedation in many protocols
  'ESWT',
  'PEMF',
  'UWTM',         // underwater treadmill
  'WATER_TREADMILL',
  'DRY_NEEDLING',
  'ACUPUNCTURE',
  'SPINAL_MANIP',
];

/**
 * Equipment names that indicate clinic apparatus. A second, independent signal
 * so an exercise whose code we do not recognise is still caught by what it
 * requires.
 */
const CLINIC_EQUIPMENT_TERMS = [
  'underwater treadmill', 'treadmill', 'laser', 'ultrasound', 'shockwave',
  'electrical stim', 'e-stim', 'estim', 'nmes', 'tens unit', 'pemf',
  'hydrotherapy', 'swim', 'pool', 'therapy pool', 'sling hoist', 'goniometer',
];

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [String(value)];
}

/**
 * Where can this exercise safely be performed?
 *
 * Returns the venue and the reason, because "why is laser not in the home
 * programme" is a question a clinician is entitled to a straight answer to.
 */
function classifyVenue(exercise) {
  const code = String(exercise.exercise_code || exercise.code || '').toUpperCase();

  const codeHit = CLINIC_ONLY_CODES.find((term) => code.includes(term));
  if (codeHit) {
    return {
      venue: VENUE.CLINIC,
      reason: `${codeHit} is clinic-delivered — requires a trained operator`,
    };
  }

  const equipment = asList(exercise.equipment).join(' ').toLowerCase();
  const equipmentHit = CLINIC_EQUIPMENT_TERMS.find((term) => equipment.includes(term));
  if (equipmentHit) {
    return {
      venue: VENUE.CLINIC,
      reason: `requires clinic equipment (${equipmentHit})`,
    };
  }

  return { venue: VENUE.HOME, reason: 'performable at home after instruction' };
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

const DIFFICULTY_SCORE = { easy: 3, moderate: 2, advanced: 0 };

/**
 * Score an exercise for inclusion in a home programme.
 *
 * Every factor is stated in the returned reasons. A ranking a clinician cannot
 * interrogate is one they cannot safely trust, and this proposes a prescription.
 */
function scoreForHome(exercise, context = {}) {
  const reasons = [];
  let score = 0;

  // Foundational work first. An owner attempting an advanced exercise
  // unsupervised is where home programmes go wrong.
  const difficulty = String(exercise.difficulty_level || '').toLowerCase();
  const difficultyScore = DIFFICULTY_SCORE[difficulty];
  if (difficultyScore !== undefined) {
    score += difficultyScore;
    if (difficultyScore >= 3) reasons.push('suitable for unsupervised use');
    else if (difficultyScore === 0) reasons.push('advanced — usually clinic-supervised first');
  }

  // Household burden. Every extra item is another reason a session does not
  // happen. Equipment-free exercises get done.
  const equipmentCount = asList(exercise.equipment).length;
  if (equipmentCount === 0) { score += 3; reasons.push('needs no equipment'); }
  else if (equipmentCount <= 2) { score += 2; reasons.push('minimal household equipment'); }
  else { score += 0; reasons.push(`needs ${equipmentCount} items`); }

  // Targets the affected region.
  const region = String(context.affectedRegion || '').toLowerCase();
  const haystack = `${exercise.exercise_name || ''} ${exercise.exercise_code || ''} ${exercise.category || ''}`.toLowerCase();
  if (region && region.length > 2 && haystack.includes(region.split(/\s|\//)[0])) {
    score += 2;
    reasons.push(`targets the ${region}`);
  }

  // Evidence on file.
  if (exercise.evidence_citation) { score += 1; reasons.push('evidence cited'); }

  // Explicit stop conditions the owner can act on.
  if (exercise.red_flags) { score += 1; reasons.push('has stop conditions for the owner'); }

  return { score, reasons };
}

/**
 * Propose a home programme for one week.
 *
 * @param {Array}  exercises  one week's exercises, already safety-filtered by the engine
 * @param {object} options.context      { affectedRegion }
 * @param {number} options.proposeCount how many to shortlist for the clinician (default 8)
 * @param {number} options.selectCount  how many to pre-select for home (default 4)
 *
 * @returns {{ home: Array, clinic: Array }}
 *   home   — ranked, with `home_selected` set on the pre-selected ones
 *   clinic — everything that cannot go home, with the reason
 */
function proposeHomeProgramme(exercises, options = {}) {
  const { context = {}, proposeCount = 8, selectCount = 4 } = options;

  const clinic = [];
  const candidates = [];

  for (const exercise of exercises) {
    const { venue, reason } = classifyVenue(exercise);
    if (venue === VENUE.CLINIC) {
      clinic.push({ ...exercise, venue, venue_reason: reason });
      continue;
    }
    const { score, reasons } = scoreForHome(exercise, context);
    candidates.push({ ...exercise, venue, venue_reason: reason, _score: score, _reasons: reasons });
  }

  // Deterministic order: score, then code, so the same input always produces
  // the same proposal. A ranking that shuffles between runs is impossible to
  // review or to test.
  candidates.sort((a, b) =>
    b._score - a._score || String(a.exercise_code).localeCompare(String(b.exercise_code)));

  const home = candidates.slice(0, proposeCount).map((exercise, index) => ({
    ...exercise,
    home_rank: index + 1,
    home_selected: index < selectCount,
    selection_reason: exercise._reasons.join('; '),
  }));

  // Shortlisted but not pre-selected exercises are still returned, so the
  // clinician can swap one in. Ranking narrows the choice; it does not make it.
  for (const exercise of candidates.slice(proposeCount)) {
    home.push({
      ...exercise,
      home_rank: null,
      home_selected: false,
      selection_reason: 'not shortlisted this week',
    });
  }

  return {
    home: home.map(({ _score, _reasons, ...rest }) => rest),
    clinic,
  };
}

module.exports = {
  VENUE,
  CLINIC_ONLY_CODES,
  CLINIC_EQUIPMENT_TERMS,
  classifyVenue,
  scoreForHome,
  proposeHomeProgramme,
};
