/**
 * K9 Clinical Workflow V2 — Rehabilitation Goals
 *
 * What success looks like for this patient, and in whose words.
 *
 * V1 collects ten goal fields and shows four of them on a summary card,
 * truncated at 120 characters. Nothing else reads them: the engine has no
 * patient-goal input (its eighteen `goal:` lines are its own canned phase
 * text), V2 has no table and no column, and the HEP payload has no field. So
 * an owner who wrote "want him back to normal he used to run extremely fast"
 * said it to nobody.
 *
 * SPLIT BY AUDIENCE, NOT WITHHELD.
 *
 * "Navigate 3 steps independently" is written for the owner. "No progression
 * of drawer. Thigh girth within 1 cm bilaterally" is written for a clinician.
 * Both travel, each labelled, exactly as the payload already separates
 * `exercises` from `clinic_protocol` — the owner is shown what happens at
 * their appointment without it being offered as something to attempt. Deciding
 * instead to withhold a clinician's goals from an owner would be a disclosure
 * judgement, and that is not this module's to make.
 *
 * `Client Communication Preference` is collected in the same V1 section but is
 * not a goal — it is how the practice contacts the client. It is read here so
 * the block is fully accounted for, classified `admin`, and deliberately kept
 * out of the handoff.
 *
 * NOTHING HERE GATES EXERCISE SELECTION, and no conflict between goals is
 * detected. Whether "Palliative care — comfort focused" alongside "Return to
 * sport or working function" is a data-entry error or a considered decision is
 * a clinical judgement, and inventing that rule here would be inventing
 * clinical authority this file does not have.
 */

'use strict';

/**
 * The multi-select vocabulary, label -> code.
 *
 * Codes exist so nothing downstream matches on the prose. A consumer testing
 * `goal.includes('sport')` against "Return to sport or working function" works
 * until the label is reworded, and then silently stops — which is the defect
 * behind every finding in this codebase. The stated label travels too, because
 * it is what the clinician chose.
 */
const PRIMARY_GOAL_CODES = {
  'Return to normal household activity': 'HOUSEHOLD_FUNCTION',
  'Pain management — improve quality of life': 'PAIN_MANAGEMENT',
  'Post-surgical recovery — full function': 'POST_SURGICAL',
  'Neurological rehabilitation — ambulation': 'NEURO_AMBULATION',
  'Weight management — target BCS 5': 'WEIGHT_MANAGEMENT',
  'Improve joint range of motion': 'RANGE_OF_MOTION',
  'Improve muscle mass / strength': 'STRENGTH',
  'Return to sport or working function': 'SPORT_RETURN',
  'Senior wellness / mobility maintenance': 'SENIOR_WELLNESS',
  'Palliative care — comfort focused': 'PALLIATIVE',
  'Other': 'OTHER',
};

/** V1 stores a multi-select as one string joined by a double pipe. */
const MULTI_DELIMITER = '||';

const OWNER = 'owner';
const CLINICAL = 'clinical';
const ADMIN = 'admin';

/**
 * `keys` is an array because `dashboard_data` is keyed by LABEL — a label
 * renamed in the UI strands everything stored under the old one. Newest first.
 */
const FIELDS = [
  {
    key: 'primary_goals',
    label: 'Primary rehabilitation goals',
    keys: ['goals::Primary Rehabilitation Goals'],
    audience: OWNER,
    multi: true,
  },
  {
    key: 'short_term_functional',
    label: 'Short-term functional goals',
    keys: ['goals::Short-Term Functional Goals'],
    // Written in what the dog will be able to DO. The owner is the one who
    // sees it happen, so this is the goal that tells them it is working.
    audience: OWNER,
  },
  {
    key: 'long_term_functional',
    label: 'Long-term functional goals',
    keys: ['goals::Long-Term Functional Goals'],
    audience: OWNER,
  },
  {
    key: 'owner_primary_goal',
    label: "Owner's primary goal, in their own words",
    keys: ["goals::Owner's Primary Goal (in their own words)"],
    audience: OWNER,
  },
  {
    key: 'owner_expectations',
    label: 'Owner goals and expectations',
    keys: ['goals::Owner Goals & Expectations'],
    audience: OWNER,
  },
  {
    key: 'owner_priority',
    label: 'Owner priority',
    keys: ['goals::Owner Priority'],
    audience: OWNER,
  },
  {
    key: 'quality_of_life',
    label: 'Quality of life goal',
    keys: ['goals::Quality of Life Goal'],
    audience: OWNER,
  },
  {
    key: 'short_term_clinical',
    label: 'Short-term clinical goals',
    keys: ['goals::Short-Term Clinical Goals'],
    // Degrees of ROM, HCPI thresholds, thigh girth, drawer. Clinician
    // measures, carried so the record is whole — not hidden from the owner,
    // but not addressed to them either.
    audience: CLINICAL,
  },
  {
    key: 'long_term_clinical',
    label: 'Long-term clinical goals',
    keys: ['goals::Long-Term Clinical Goals'],
    audience: CLINICAL,
  },
  {
    key: 'communication_preference',
    label: 'Client communication preference',
    keys: ['goals::Client Communication Preference'],
    // Not a goal. How the practice contacts the client, collected in the same
    // V1 section. Read so the block is accounted for, kept out of the handoff.
    audience: ADMIN,
  },
];

const FIELD_KEYS = FIELDS.map((f) => f.key);
const BY_KEY = Object.fromEntries(FIELDS.map((f) => [f.key, f]));
/** Every V1 dashboard key this module claims, for the stranded-key audit. */
const V1_KEYS = FIELDS.flatMap((f) => f.keys);

function blank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Split a V1 multi-select.
 *
 * Empty segments are dropped — "A||B||" is two goals, not three — but a value
 * with no delimiter is one goal, not zero.
 */
function splitMulti(value) {
  return String(value)
    .split(MULTI_DELIMITER)
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

/** Pull the stated values out of a V1 `dashboard_data` blob. */
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
 * Read the multi-select into {stated, code} pairs.
 *
 * A label not in the vocabulary keeps its text and gets a null code rather
 * than being dropped: "Other" is itself an option, so free text is expected
 * here, and a goal the clinician typed is still a goal.
 */
function interpretPrimaryGoals(value) {
  if (blank(value)) return [];
  return splitMulti(value).map((label) => ({
    stated: label,
    code: Object.prototype.hasOwnProperty.call(PRIMARY_GOAL_CODES, label)
      ? PRIMARY_GOAL_CODES[label]
      : null,
  }));
}

/**
 * Group the stated goals by who they are written for, and report any primary
 * goal whose label this module does not recognise.
 *
 * An unrecognised label is NOT an error — "Other" invites free text — but it
 * is something a consumer cannot act on programmatically, so it is surfaced
 * rather than left to look like a coded goal that simply matched nothing.
 */
function interpret(stated = {}) {
  const byAudience = { [OWNER]: {}, [CLINICAL]: {}, [ADMIN]: {} };
  const primaryGoals = interpretPrimaryGoals(stated.primary_goals);
  const uninterpreted = [];

  for (const field of FIELDS) {
    const value = stated[field.key];
    if (blank(value)) continue;
    if (field.multi) continue; // carried as primaryGoals, not as raw text
    byAudience[field.audience][field.key] = value;
  }

  for (const goal of primaryGoals) {
    if (goal.code === null) {
      uninterpreted.push({
        field: 'primary_goals',
        label: BY_KEY.primary_goals.label,
        stated: goal.stated,
      });
    }
  }

  return { byAudience, primaryGoals, uninterpreted };
}

/**
 * The record, in the shape the HEP payload carries.
 *
 * `null` only when nothing at all is recorded, so a consumer can tell "no
 * goals set" from "goals set, some fields blank" — the same distinction the
 * clinic capabilities preserve between unstated and unavailable.
 *
 * `communication_preference` is read and classified but not emitted: it is
 * practice admin, and a handoff is not where it belongs.
 */
function toPayload(stated, meta = {}) {
  if (!stated || !Object.keys(stated).length) return null;
  const { byAudience, primaryGoals, uninterpreted } = interpret(stated);
  return {
    primary_goals: primaryGoals,
    owner_facing: byAudience[OWNER],
    clinical: byAudience[CLINICAL],
    uninterpreted,
    recorded_at: meta.updated_at || null,
    recorded_by: meta.updated_by || null,
  };
}

module.exports = {
  FIELDS,
  FIELD_KEYS,
  BY_KEY,
  V1_KEYS,
  PRIMARY_GOAL_CODES,
  MULTI_DELIMITER,
  OWNER,
  CLINICAL,
  ADMIN,
  readFromDashboard,
  interpret,
  interpretPrimaryGoals,
  splitMulti,
  toPayload,
};
