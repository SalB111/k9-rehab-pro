/**
 * K9 Clinical Workflow V2 — Home Environment
 *
 * Where the dog actually lives, and what the owner can actually do.
 *
 * The HEP payload already tells B.E.A.U. at Home it `may_adapt_execution_to_
 * home_environment` and `may_substitute_household_equipment` — and then sends
 * it nothing about the home. The permission was real and the information was
 * missing, so every adaptation B.E.A.U. made was made blind. This module is
 * the information.
 *
 * TWO REPRESENTATIONS, DELIBERATELY.
 *
 *   `stated`     — verbatim, exactly what the clinician recorded in V1.
 *   `normalized` — the interpreted reading, `null` where not understood.
 *
 * Both travel. The recurring defect in this codebase is a consumer that
 * string-matches a clinical vocabulary literally: `WEIGHT_BEARING['NWB']`
 * misses "Non-weight bearing", `includes('infected')` misses "Infection".
 * Handing B.E.A.U. the raw phrase "Mixed — mostly carpet" invites exactly that
 * mistake one system further downstream. So the interpretation is done ONCE,
 * here, against the vocabulary it was written for — and the raw phrase still
 * travels, because a clinician's own words are the record and a normalizer is
 * only ever a reading of them.
 *
 * A phrase this module does not recognise normalizes to `null` and is listed
 * in `uninterpreted`. It is never guessed at and never silently dropped: an
 * unreadable value must be visible, because the alternative is a confident
 * wrong reading of somebody's home.
 *
 * NOTHING HERE GATES EXERCISE SELECTION. This is context carried to B.E.A.U.,
 * not a constraint on what the engine prescribes. Whether a small home or a
 * low-confidence owner should actually restrict the protocol is a clinical
 * decision that has not been made.
 *
 * V3 — WHAT THIS MODULE IS, AND IS NOT
 *
 * It is the DEFINITION of the home block: the fields, the option lists, the
 * labels and the normalisers. One definition, so the form and the readings can
 * never end up speaking different vocabularies.
 *
 * It is NOT the storage. `patient_home_environment` is the source of truth and
 * `patient-home-store.js` reads and writes it. `patients.dashboard_data` is no
 * longer read for this block by anything except the one-time migration.
 */

'use strict';

/**
 * Ranges resolve to their LOWER bound.
 *
 * These two fields are CAPACITY: how much time and how many sessions the owner
 * has. An owner who says "20–30 minutes" and is handed a 30-minute program
 * fails it on their short days. Read low and the program always fits.
 *
 * Note this is the opposite bound from pain scoring in dashboard-bridge, and
 * for the same reason — both pick the bound that yields the more conservative
 * program. For pain that is the higher number; for capacity it is the lower.
 */
function lowestNumber(value) {
  const found = String(value).match(/\d+(?:\.\d+)?/g);
  if (!found || !found.length) return null;
  return Math.min(...found.map(Number));
}

/** Latin dosing abbreviations, for the fields a clinician may write that way. */
const PER_DAY_WORDS = [
  // Sub-daily first. "Every other day" is a real, expressible frequency — 0.5
  // a day is 3.5 a week — and dropping it to null would lose a stated answer.
  [/every other day|alternate days?|\bq\.?o\.?d\b/i, 0.5],
  [/\bq\.?i\.?d\b|\bfour times\b/i, 4],
  [/\bt\.?i\.?d\b|\bthree times\b|\bthrice\b/i, 3],
  [/\bb\.?i\.?d\b|\btwice\b|\btwo times\b/i, 2],
  [/\bs\.?i\.?d\b|\bonce\b|\bone time\b|\bdaily\b/i, 1],
];

function sessionsPerDay(value) {
  const numeric = lowestNumber(value);
  if (numeric !== null) return numeric;
  for (const [pattern, n] of PER_DAY_WORDS) {
    if (pattern.test(String(value))) return n;
  }
  return null;
}

/**
 * Match the FIRST pattern that hits, so order encodes precedence.
 *
 * Order is not cosmetic here. "Mixed — mostly carpet" contains "carpet", and a
 * map that checked carpet first would report a uniformly non-slip house.
 */
function firstMatch(value, table) {
  const text = String(value);
  for (const [pattern, result] of table) {
    if (pattern.test(text)) return result;
  }
  return null;
}

const TRACTION = [
  [/\bmixed\b|\bpartly\b|\bsome areas\b/i, 'MIXED'],
  [/non-?slip|rubber|\bmats?\b|carpet|\brugs?\b/i, 'NON_SLIP'],
  [/hardwood|laminate|\btile\b|vinyl|linoleum|concrete|polished|slipp/i, 'SLIPPERY'],
];

const INDOOR_SPACE = [
  [/dedicated|large|open floor|multiple rooms/i, 'AMPLE'],
  [/one room|single room|small|limited|cramped|apartment|hallway|\bcorridor\b/i, 'LIMITED'],
];

const STAIRS = [
  [/\bramp\b/i, 'RAMP'],
  [/\bnone\b|\bno stairs\b|single level|one level|ground floor/i, 'NONE'],
  [/full staircase|\bflight\b|full flight|\bstaircase\b/i, 'FULL'],
  [/\bsteps?\b|\bstairs\b/i, 'FEW'],
];

const STAIR_FREQUENCY = [
  // "N/A" is an ANSWER — there are no stairs, so frequency cannot apply. That
  // is a different fact from nobody having filled the field in, and collapsing
  // the two would hide a complete record behind a gap warning.
  [/\bn\/?a\b|not applicable|no stairs/i, 'NOT_APPLICABLE'],
  [/avoided|\bnever\b|not at all/i, 'AVOIDED'],
  [/when necessary|minimal|\brare/i, 'MINIMAL'],
  [/multiple|several|frequent|many times|each time/i, 'FREQUENT'],
  [/once|\bdaily\b/i, 'DAILY'],
];

/**
 * Where the programme is performed at all.
 *
 * The V1 panel gates its indoor and outdoor sections on this, and until V3 it
 * was React state initialised to "" — never loaded, never saved. So a patient
 * whose flooring and stairs were recorded showed an EMPTY panel on every
 * reload until somebody re-picked a location, and the answer itself was never
 * part of the record.
 */
const EXERCISE_LOCATION = [
  [/\bboth\b|indoor\s*(&|and|\+)\s*outdoor/i, 'BOTH'],
  [/indoor/i, 'INDOOR'],
  [/outdoor/i, 'OUTDOOR'],
];

/** Footing outdoors. Loose or uneven ground is a different risk from grass. */
const OUTDOOR_SURFACE = [
  [/\bmixed\b/i, 'MIXED'],
  [/uneven|gravel|loose|\bsand\b|\bbeach\b/i, 'UNEVEN'],
  [/slope|incline|\bhill\b/i, 'SLOPED'],
  [/pool|water/i, 'WATER'],
  [/flat grass|\bgrass\b|\blawn\b/i, 'GRASS'],
  [/concrete|pavement|paved|asphalt/i, 'HARD'],
];

const OUTDOOR_STEPS = [
  [/\bramp\b/i, 'RAMP'],
  [/flat|no steps|\bnone\b/i, 'NONE'],
  [/incline|driveway|\bslope\b/i, 'INCLINE'],
  [/railing/i, 'STEPS_WITH_RAIL'],
  [/\bsteps?\b|\bstairs\b/i, 'FEW'],
];

/**
 * Containment outdoors.
 *
 * This is the field that actually ANSWERS whether the space is enclosed.
 * Fencing was previously inferred from the free text of the space SIZE
 * ("Medium fenced yard"), which worked only because somebody happened to write
 * the word. A dedicated answer beats a word found in another field's prose, so
 * this one wins where both are present.
 */
const OUTDOOR_SAFETY = [
  [/fully fenced|secure/i, 'FENCED'],
  [/partially fenced|part fenced/i, 'PARTIALLY_FENCED'],
  [/leash/i, 'LEASH_REQUIRED'],
  [/open property|unfenced|not fenced/i, 'OPEN'],
];

const OUTDOOR_SPACE = [
  [/\blarge\b|\bbig\b/i, 'LARGE'],
  [/\bmedium\b|\bmoderate\b/i, 'MEDIUM'],
  [/\bsmall\b|balcony|\bpatio\b|\bdeck\b/i, 'SMALL'],
  [/\bfields?\b|\bacreage\b|\bacres?\b|\bpaddock\b/i, 'LARGE'],
  // Space the dog can use but the household does not own. Tested BEFORE NONE,
  // because "No yard — park access only" states an absence and a presence, and
  // reading only the absence would report a dog with nowhere to walk.
  [/\bbeach\b|\bparks?\b|\btrails?\b|off-?site|\bgreen space\b/i, 'OFFSITE'],
  [/\bnone\b|no outdoor|no yard/i, 'NONE'],
];

/**
 * Tri-state, and the negative is tested first.
 *
 * `'unavoidable'.includes('avoidable')` is true, and `'not fenced'` contains
 * `'fenced'`. A positive-first check reads both negatives as their opposite,
 * which is the same substring bug that let "Non-weight bearing" through the
 * weight-bearing exclusions. Never assume, never guess — check the negation
 * before the term it negates.
 */
function negatableFlag(value, negative, positive) {
  const text = String(value);
  if (negative.test(text)) return false;
  if (positive.test(text)) return true;
  return null;
}

/**
 * The fields, their V1 dashboard keys, and how each is read.
 *
 * `keys` is an array because a V1 label that is renamed strands everything
 * stored under the old one — `dashboard_data` is keyed by LABEL. Newest first;
 * the first key that holds a value wins.
 */
const FIELDS = [
  {
    key: 'exercise_location',
    label: 'Exercise location',
    keys: ['home::Exercise Location'],
    options: [
      "Indoor Only",
      "Outdoor Only",
      "Both Indoor & Outdoor",
    ],
    normalize: (v) => ({ exercise_location: firstMatch(v, EXERCISE_LOCATION) }),
  },
  {
    key: 'flooring_indoor',
    label: 'Primary flooring — indoor',
    keys: ['home::Primary Flooring — Indoor'],
    options: [
      "Non-slip carpet — all areas",
      "Hardwood / Tile (slippery)",
      "Mixed — mostly carpet",
      "Mixed — mostly hard floors",
      "Rubber / Non-slip mats installed",
      "Laminate",
    ],
    // Traction is the one genuinely safety-relevant fact here: a slick floor
    // is a fall risk for a post-operative or neurologically impaired dog.
    normalize: (v) => ({ traction: firstMatch(v, TRACTION) }),
  },
  {
    key: 'space_indoors',
    label: 'Available space indoors',
    keys: ['home::Available Space Indoors'],
    options: [
      "Open floor — large room",
      "Hallway only",
      "Limited — small apartment",
      "Multiple rooms available",
      "Dedicated exercise space",
    ],
    normalize: (v) => ({ indoor_space: firstMatch(v, INDOOR_SPACE) }),
  },
  {
    key: 'stairs_indoor',
    label: 'Indoor stairs',
    keys: ['home::Indoor Stairs'],
    options: [
      "No stairs",
      "1–3 steps to exit",
      "Full staircase — must use",
      "Full staircase — avoidable",
      "Has ramp available",
    ],
    normalize: (v) => ({
      stairs: firstMatch(v, STAIRS),
      stairs_avoidable: negatableFlag(v, /unavoidable|cannot be avoided|must use/i, /avoidable|can be avoided/i),
    }),
  },
  {
    key: 'stair_frequency',
    label: 'Stair frequency',
    keys: ['home::Stair Frequency'],
    options: [
      "N/A",
      "Multiple times daily",
      "Once daily",
      "Only when necessary",
      "Can be fully avoided",
    ],
    normalize: (v) => ({ stair_frequency: firstMatch(v, STAIR_FREQUENCY) }),
  },
  {
    key: 'outdoor_space',
    label: 'Outdoor space size',
    keys: ['home::Outdoor Space Size'],
    options: [
      "Small yard — patio",
      "Medium yard — fenced",
      "Large yard — open",
      "Beach / park access",
      "Open field",
    ],
    normalize: (v) => ({
      outdoor_space: firstMatch(v, OUTDOOR_SPACE),
      outdoor_fenced: negatableFlag(v, /unfenced|not fenced|no fence/i, /fenced/i),
    }),
  },
  {
    key: 'outdoor_surface',
    label: 'Outdoor surface type',
    keys: ['home::Outdoor Surface Type'],
    options: [
      "Flat grass — ideal",
      "Uneven grass / terrain",
      "Concrete / Pavement",
      "Gravel / loose surface",
      "Sand / beach",
      "Mixed outdoor surfaces",
      "Slope / incline available",
      "Pool / water access",
    ],
    normalize: (v) => ({ outdoor_surface: firstMatch(v, OUTDOOR_SURFACE) }),
  },
  {
    key: 'outdoor_steps',
    label: 'Outdoor steps / ramps',
    keys: ['home::Outdoor Steps / Ramps'],
    options: [
      "Flat — no steps",
      "1–2 steps from door",
      "Steps with railing",
      "Ramp installed",
      "Long driveway incline",
    ],
    normalize: (v) => ({ outdoor_steps: firstMatch(v, OUTDOOR_STEPS) }),
  },
  {
    key: 'outdoor_safety',
    label: 'Outdoor safety',
    keys: ['home::Outdoor Safety'],
    options: [
      "Fully fenced — secure",
      "Partially fenced",
      "Leash required at all times",
      "Open property",
    ],
    // Emits its own key rather than `outdoor_fenced` directly. The precedence
    // against the fencing inferred from the space-size prose is resolved in
    // `interpret`, explicitly, rather than by relying on field ordering.
    normalize: (v) => ({ outdoor_containment: firstMatch(v, OUTDOOR_SAFETY) }),
  },
  {
    key: 'outdoor_items',
    label: 'Outdoor items available',
    keys: ['home::Outdoor Items Available'],
    normalize: null,
  },
  {
    key: 'session_minutes',
    label: 'Time available per session (min)',
    keys: ['home::Time Available Per Session (min)'],
    options: [
      "10–15 minutes",
      "15–20 minutes",
      "20–30 minutes",
      "30+ minutes",
      "Variable",
    ],
    normalize: (v) => ({ session_minutes: lowestNumber(v) }),
  },
  {
    key: 'sessions_per_day',
    label: 'Session frequency (per day)',
    keys: ['home::Session Frequency (per day)'],
    options: [
      "Once daily (SID)",
      "Twice daily (BID)",
      "Three times daily (TID)",
      "Every other day",
      "As tolerated",
    ],
    normalize: (v) => ({ sessions_per_day: sessionsPerDay(v) }),
  },
  {
    key: 'owner_confidence',
    label: 'Owner confidence with exercises',
    keys: ['home::Owner Confidence with Exercises'],
    options: [
      "High — experienced",
      "done rehab before",
      "Moderate — willing to learn",
      "Low — needs very simple program",
      "Requires caregiver / second person",
    ],
    // Deliberately NOT normalized. These are a clinician's own sentences about
    // a person — "Moderate — retired, highly compliant, very attentive" — and
    // an enum keeps the first word while discarding everything that made the
    // note worth writing. It travels as prose, for a human to read.
    normalize: null,
  },
  {
    key: 'expected_compliance',
    label: 'Expected compliance',
    keys: ['home::Expected Compliance'],
    options: [
      "High — very motivated",
      "Moderate",
      "Low — lifestyle limitations",
      "Variable — work schedule",
    ],
    // Prose, for the same reason as owner confidence: "High — very motivated"
    // reduced to HIGH keeps the grade and discards the observation.
    normalize: null,
  },
  {
    key: 'owner_notes',
    label: 'Owner notes / concerns',
    keys: ['home::Owner Notes / Concerns'],
    normalize: null,
  },
  {
    key: 'household_items',
    label: 'Indoor items available',
    keys: ['home::Indoor Items Available'],
    // Free text, and the substitution list B.E.A.U. is permitted to work from.
    normalize: null,
  },
  {
    key: 'reward_items',
    label: 'Lure / reward items',
    keys: ['home::Lure / Reward Items'],
    normalize: null,
  },
];

/**
 * How the questions group on screen, and in what order.
 *
 * Served with the field shape so the screen does not hold its own copy of the
 * grouping. `gatedBy` marks the sections the location answer hides: an indoor
 * programme has no outdoor questions to answer.
 */
const SECTIONS = [
  { id: 'location', title: 'Exercise Location', fields: ['exercise_location'] },
  {
    id: 'indoor',
    title: 'Indoor Environment',
    gatedBy: ['INDOOR', 'BOTH'],
    fields: ['flooring_indoor', 'space_indoors', 'stairs_indoor', 'stair_frequency'],
  },
  {
    id: 'outdoor',
    title: 'Outdoor Environment',
    gatedBy: ['OUTDOOR', 'BOTH'],
    fields: ['outdoor_surface', 'outdoor_space', 'outdoor_steps', 'outdoor_safety'],
  },
  {
    id: 'items',
    title: 'Available Home Equipment',
    fields: ['household_items', 'outdoor_items', 'reward_items'],
  },
  {
    id: 'owner',
    title: 'Owner Profile',
    fields: ['owner_confidence', 'expected_compliance', 'session_minutes',
      'sessions_per_day', 'owner_notes'],
  },
];

const FIELD_KEYS = FIELDS.map((f) => f.key);
const BY_KEY = Object.fromEntries(FIELDS.map((f) => [f.key, f]));
/** Every V1 dashboard key this module claims, for the bridge's stranded-key audit. */
const V1_KEYS = FIELDS.flatMap((f) => f.keys);

function blank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Pull the stated values out of a V1 `dashboard_data` blob.
 *
 * MIGRATION ONLY, since V3. The home block's source of truth is the
 * `patient_home_environment` table; this exists so
 * `scripts/migrate-home-to-v3.js` can read what the blob still holds, and so a
 * record written before the migration can still be recovered if one ever has
 * to be checked by hand.
 *
 * Nothing in the serving path should call this. If a new caller appears, the
 * block has quietly acquired a second source of truth again.
 */
function readFromDashboard(dashboardData) {
  let data = dashboardData;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = {}; }
  }
  if (!data || typeof data !== 'object') data = {};

  const stated = {};
  for (const field of FIELDS) {
    for (const key of field.keys) {
      if (!blank(data[key])) { stated[field.key] = String(data[key]).trim(); break; }
    }
  }
  return stated;
}

/**
 * Interpret stated values. Returns the readings, and the fields that were
 * stated but could not be read.
 *
 * A field whose normalizer returns null for every sub-reading is uninterpreted
 * — it is reported, not dropped, because a home fact nobody can read is a gap
 * in the record and should look like one.
 */
function interpret(stated = {}) {
  const normalized = {};
  const uninterpreted = [];

  for (const field of FIELDS) {
    const value = stated[field.key];
    if (blank(value) || !field.normalize) continue;

    const readings = field.normalize(value);
    for (const [k, v] of Object.entries(readings)) normalized[k] = v;
    if (Object.values(readings).every((v) => v === null)) {
      uninterpreted.push({ field: field.key, label: field.label, stated: value });
    }
  }

  // A DEDICATED ANSWER BEATS A WORD FOUND IN ANOTHER FIELD'S PROSE.
  //
  // `outdoor_fenced` was originally inferred from the space-size text, which
  // worked only because somebody happened to write "Medium fenced yard". The
  // Outdoor Safety field actually asks the question, so where it has been
  // answered it decides — and only its two unambiguous answers set the
  // boolean. "Partially fenced" and "leash required" are neither fenced nor
  // open, and forcing them either way would state something nobody did.
  if (normalized.outdoor_containment) {
    normalized.outdoor_fenced =
      normalized.outdoor_containment === 'FENCED' ? true
        : normalized.outdoor_containment === 'OPEN' ? false
          : null;
  }

  return { normalized, uninterpreted };
}

/**
 * The whole record, in the shape the HEP payload carries.
 *
 * `null` is returned only when nothing at all has been recorded, so a consumer
 * can distinguish "no home data" from "home data with gaps" — the same
 * distinction clinic capabilities preserve between unstated and unavailable.
 */
function toPayload(stated, meta = {}) {
  if (!stated || !Object.keys(stated).length) return null;
  const { normalized, uninterpreted } = interpret(stated);
  return {
    stated,
    normalized,
    uninterpreted,
    recorded_at: meta.updated_at || null,
    recorded_by: meta.updated_by || null,
  };
}

module.exports = {
  FIELDS,
  SECTIONS,
  FIELD_KEYS,
  BY_KEY,
  V1_KEYS,
  readFromDashboard,
  interpret,
  toPayload,
  // exported for tests
  lowestNumber,
  sessionsPerDay,
  firstMatch,
  negatableFlag,
};
