'use strict';

/**
 * ONE EQUIPMENT RECORD FOR THE PRACTICE
 *
 * Equipment is a property of the clinic. Both apps ask about it and until now
 * they asked separately:
 *
 *   V1 `EquipmentPanel` writes through DashFormContext, which means it lands in
 *   `patients.dashboard_data` — so EVERY PATIENT CARRIES A PRIVATE COPY OF THE
 *   CLINIC'S EQUIPMENT LIST. Five patients, five answers, no reason for them to
 *   agree, and they do not: the stored records claim a shockwave machine and a
 *   therapy pool on some patients and not others.
 *
 *   V2 `clinic_capabilities` holds one row per clinic with ten booleans, and
 *   that is what the protocol engine reads.
 *
 * The two were never linked, so the fuller V1 checklist has never reached the
 * engine and the engine's answer has never reached the V1 screen. This module
 * is the single definition they both use.
 *
 * WHAT GATES AND WHAT DOES NOT
 * Ten of the forty-three items map to an engine capability. The rest are real
 * inventory — cavaletti rails, slings, a goniometer — and they are recorded
 * because a practice needs to know what it owns, but they gate nothing.
 *
 * They deliberately do NOT gate. Every one of the 260 exercises declares an
 * `equipment` string, but those strings are execution guidance in free text —
 * "Non-slip surface", "Treats", "Leash", "Spotter" — not a controlled
 * vocabulary. Matching "Cavaletti Rail Set" against "Cavaletti rails" is
 * substring guesswork, and guessing at clinical equivalence is the defect
 * class this codebase has spent days removing. The engine gates on the ten
 * explicit flags and nothing else.
 */

/**
 * The checklist, exactly as the V1 dashboard presents it.
 *
 * Kept here rather than in the component so both apps read one list. If an item
 * is renamed here, the stored key changes — see `dashboard-bridge.js` on why
 * label-keyed storage rots — so renaming an item needs an alias, not an edit.
 */
const CHECKLIST = [
  {
    category: 'Hydrotherapy',
    items: [
      'Underwater Treadmill (UWTM)',
      'Therapy Pool — Full submersion',
      'Portable Aquatic Tank',
      'Cold Water Spa / Whirlpool',
    ],
  },
  {
    category: 'Land Exercise Equipment',
    items: [
      'Land Treadmill', 'Cavaletti Rail Set', 'Balance Discs — Set',
      'Balance Board / Rocker Board', 'Wobble Board', 'Foam Pads / Rolls',
      'Physioroll / Peanut Ball', 'Resistance Bands / Theraband', 'Parallel Bars',
      'Exercise Steps / Stairs (clinic)', 'Ramps', 'Cone Set', 'Agility Equipment',
    ],
  },
  {
    category: 'Electrotherapy & Modalities',
    items: [
      'NMES Unit (Neuromuscular E-Stim)', 'TENS Unit', 'Therapeutic Ultrasound',
      'Class IV Therapeutic Laser', 'Class IIIb Laser', 'Shockwave Therapy',
      'PEMF (Pulsed Electromagnetic Field)', 'Cryotherapy Unit',
      'Moist Heat / Hydrocollator', 'Infrared Therapy',
    ],
  },
  {
    category: 'Manual Therapy & Assessment',
    items: [
      'Standard Goniometer', 'Digital Goniometer', 'Pressure Algometer',
      'Measuring Tape (thigh circumference)', 'Force Platform / Pressure Walkway',
      'Video Gait Analysis System', 'Kinematic Analysis System', 'IRAP / PRP Equipment',
    ],
  },
  {
    category: 'Support & Mobility',
    items: [
      'Slings — Front end', 'Slings — Rear end', 'Full-body Harness',
      'Wheelchairs / Carts', 'Orthoses / Braces', 'Non-slip Flooring / Mats',
      'Treatment Table — Adjustable', 'Treatment Table — Hydraulic',
    ],
  },
];

/**
 * The ten items that enable a therapy, and the capability each enables.
 *
 * One item per capability, on purpose. A capability fed by two items would need
 * a rule for which wins when they disagree, and the honest rule — "the one that
 * can actually deliver the therapy" — is exactly what a 1:1 map states already.
 *
 * THREE ITEMS ARE DELIBERATELY NOT MAPPED, and each is a clinical judgement
 * rather than an oversight:
 *
 *   Class IIIb Laser — the engine's laser exercise is LASER_IV, a Class IV
 *     protocol. A IIIb device is lower power and does not deliver it. Mapping
 *     IIIb to `modality_laser` would prescribe a Class IV protocol on a machine
 *     that cannot perform it.
 *
 *   Infrared Therapy — a superficial heating modality, but the engine's
 *     HEAT_THERAPY is thermotherapy by moist heat. They are not the same
 *     delivery, and the cost of being wrong here is prescribing a modality the
 *     practice cannot give.
 *
 *   Cold Water Spa / Whirlpool — aquatic, but not a pool a dog is walked in,
 *     and not a cryotherapy unit. It enables neither gate.
 *
 * All three are still RECORDED. They are inventory, not capability, and a
 * clinician who disagrees can say so — that is a better outcome than a map
 * that quietly decided for them.
 */
const TO_CAPABILITY = {
  'Underwater Treadmill (UWTM)': 'modality_uwtm',
  'Therapy Pool — Full submersion': 'aquatic_access',
  'NMES Unit (Neuromuscular E-Stim)': 'modality_nmes',
  'TENS Unit': 'modality_tens',
  'Therapeutic Ultrasound': 'modality_therapeutic_us',
  'Class IV Therapeutic Laser': 'modality_laser',
  'Shockwave Therapy': 'modality_shockwave',
  'PEMF (Pulsed Electromagnetic Field)': 'modality_pulsed_emf',
  'Cryotherapy Unit': 'modality_cryotherapy',
  'Moist Heat / Hydrocollator': 'modality_heat_therapy',
};

/** Capability -> the one item that enables it. The inverse, built once. */
const FROM_CAPABILITY = Object.fromEntries(
  Object.entries(TO_CAPABILITY).map(([item, cap]) => [cap, item])
);

/** Every item, flat, in checklist order. */
const ALL_ITEMS = CHECKLIST.flatMap((g) => g.items);

/** Items that record inventory without enabling anything. */
const INVENTORY_ONLY = ALL_ITEMS.filter((i) => !TO_CAPABILITY[i]);

/** The V1 storage key for an item, so old records can still be read. */
function legacyKey(category, item) {
  return `equipment::${category}::${item}`;
}

/** The category an item belongs to, or null. */
function categoryOf(item) {
  const g = CHECKLIST.find((grp) => grp.items.includes(item));
  return g ? g.category : null;
}

/**
 * The ten engine booleans, derived from a ticked checklist.
 *
 * Tri-state is preserved. An item nobody has answered is null, NOT false: the
 * engine treats "unstated" differently from "we do not have this", and one of
 * those is a data-entry gap worth chasing while the other is a fact.
 *
 * @param {Object} checked  { "<item>": true | false | null }
 */
function deriveCapabilities(checked = {}) {
  const out = {};
  for (const [cap, item] of Object.entries(FROM_CAPABILITY)) {
    const v = checked[item];
    out[cap] = v === true ? true : v === false ? false : null;
  }
  return out;
}

/**
 * The reverse: the ten booleans expressed as checklist ticks.
 *
 * Used when the V2 admin screen toggles a capability directly — the checklist
 * is the record both screens read, so a toggle has to land in it.
 */
function capabilitiesToChecklist(capabilities = {}) {
  const out = {};
  for (const [cap, item] of Object.entries(FROM_CAPABILITY)) {
    if (!(cap in capabilities)) continue;
    const v = capabilities[cap];
    out[item] = v === true ? true : v === false ? false : null;
  }
  return out;
}

/**
 * Read a V1 per-patient equipment answer set into checklist form.
 *
 * The keys are `equipment::<category>::<item>` and the values are the string
 * "true" or an empty string, because the V1 control writes a checkbox that way.
 * Anything that is not a recognised item is returned separately rather than
 * dropped, so a renamed label is visible instead of silently lost.
 */
function readLegacy(blob = {}) {
  const checked = {};
  const unknown = [];
  for (const [key, value] of Object.entries(blob)) {
    if (!key.startsWith('equipment::')) continue;
    const parts = key.split('::');
    const item = parts.slice(2).join('::');
    if (!item || !ALL_ITEMS.includes(item)) {
      if (String(value).trim() !== '') unknown.push({ key, value: String(value) });
      continue;
    }
    const yes = value === true || value === 'true';
    const blank = value === '' || value === null || value === undefined;
    checked[item] = blank ? null : yes;
  }
  return { checked, unknown };
}

/**
 * Guard against the checklist drifting from the engine's enablement gates.
 *
 * If the engine gains a modality and no checklist item enables it, that therapy
 * becomes permanently unavailable to every clinic with no error anywhere — the
 * fails-restrictive direction, which is silent by definition. Raised loudly at
 * boot instead. Mirrors clinic-store.assertCoversEngineGates.
 */
function assertCoversEngineGates(contract) {
  const expected = (contract
    && contract.omission_semantics
    && contract.omission_semantics.fails_restrictive_if_omitted) || [];

  // Engine inputs are camelCase and capability columns are snake_case, but the
  // translation is NOT mechanical: modalityUWTM is modality_uwtm, and a naive
  // camel-to-snake gives modality_u_w_t_m. The acronyms are why clinic-store
  // keeps an explicit map, and why this reuses it rather than deriving a second
  // answer. (Written the naive way first; this guard caught it.)
  const { CAPABILITY_TO_ENGINE_INPUT } = require('./clinic-store');
  const columnFor = Object.fromEntries(
    Object.entries(CAPABILITY_TO_ENGINE_INPUT).map(([col, input]) => [input, col])
  );

  const covered = new Set(Object.values(TO_CAPABILITY));
  const missing = expected.filter((input) => {
    const column = columnFor[input];
    return !column || !covered.has(column);
  });
  if (missing.length) {
    throw new Error(
      `[clinic-equipment] no checklist item enables: ${missing.join(', ')}. `
      + 'Add the item to CHECKLIST and map it in TO_CAPABILITY, or that therapy '
      + 'is silently unavailable to every clinic.'
    );
  }
  return true;
}

module.exports = {
  CHECKLIST,
  ALL_ITEMS,
  INVENTORY_ONLY,
  TO_CAPABILITY,
  FROM_CAPABILITY,
  deriveCapabilities,
  capabilitiesToChecklist,
  readLegacy,
  legacyKey,
  categoryOf,
  assertCoversEngineGates,
};
