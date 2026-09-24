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
 * The items that enable a therapy, and the capability each enables.
 *
 * A capability may have MORE THAN ONE enabler, and it means OR: a practice that
 * owns any machine capable of delivering the therapy can deliver it. Heat is
 * the case — a hydrocollator and a handheld infrared unit are different
 * machines that both produce therapeutic heat, and requiring the hydrocollator
 * specifically would withhold heat from a practice that can plainly give it.
 *
 * TWO ITEMS ARE DELIBERATELY NOT MAPPED, and both are clinical judgements:
 *
 *   Class IIIb Laser — the engine's laser exercise is LASER_IV, a Class IV
 *     protocol. A IIIb device is lower power and does not deliver it. Mapping
 *     IIIb to `modality_laser` would prescribe a Class IV protocol on a machine
 *     that cannot perform it. (Confirmed 24 Sep 2026: the practice's unit is a
 *     Class IV, so the Class IV item is the one that answers for it.)
 *
 *   Cold Water Spa / Whirlpool — aquatic, but not a pool a dog is walked in,
 *     and not a cryotherapy unit. It enables neither gate.
 *
 * Both are still RECORDED. They are inventory, not capability.
 *
 * A THIRD WAS UNMAPPED AND SHOULD NOT HAVE BEEN. I left Infrared Therapy out on
 * the reasoning that the engine's HEAT_THERAPY is moist heat and infrared is a
 * different delivery. That was my judgement and it was wrong: the unit is a
 * handheld heat-penetrating device and it delivers the therapy. A clinician
 * corrected it, which is the point of writing the reasoning down rather than
 * only the decision.
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
  // A SECOND WAY TO DELIVER HEAT.
  //
  // Unmapped until 24 Sep 2026, on the reasoning that the engine's
  // HEAT_THERAPY is moist-heat thermotherapy and infrared is a different
  // delivery. Sal corrected that: the unit in question is a handheld
  // heat-penetrating device, and a practice that owns one can give heat
  // therapy whether or not it also owns a hydrocollator.
  //
  // I had the clinical judgement wrong, and it is the reason a capability may
  // now have more than one enabler.
  'Infrared Therapy': 'modality_heat_therapy',
};

/**
 * Capability -> every item that enables it.
 *
 * More than one is allowed, and it means OR: a practice that owns any device
 * capable of delivering the therapy can deliver it. Heat is the case that
 * forced this — a hydrocollator and a handheld infrared unit are different
 * machines that both produce therapeutic heat.
 *
 * Insertion order matters. The FIRST item listed is the canonical one, used
 * when the V2 screen toggles a capability directly and something has to be
 * ticked: with two ways to deliver heat and no other information, the answer
 * has to be the ordinary one rather than a guess between them.
 */
const FROM_CAPABILITY = {};
for (const [item, cap] of Object.entries(TO_CAPABILITY)) {
  (FROM_CAPABILITY[cap] = FROM_CAPABILITY[cap] || []).push(item);
}

/** The canonical item for a capability — the one a direct toggle ticks. */
const PRIMARY_ITEM = Object.fromEntries(
  Object.entries(FROM_CAPABILITY).map(([cap, items]) => [cap, items[0]])
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
  for (const [cap, items] of Object.entries(FROM_CAPABILITY)) {
    const values = items.map((i) => checked[i]);
    // OR across the enablers, tri-state. One machine that can deliver the
    // therapy is enough; only when EVERY way of delivering it has been
    // answered "no" is the therapy genuinely unavailable; and if nobody has
    // answered any of them it stays unstated rather than becoming a "no".
    if (values.some((v) => v === true)) out[cap] = true;
    else if (values.length && values.every((v) => v === false)) out[cap] = false;
    else out[cap] = null;
  }
  return out;
}

/**
 * The reverse: the ten booleans expressed as checklist ticks.
 *
 * Used when the V2 admin screen toggles a capability directly — the checklist
 * is the record both screens read, so a toggle has to land in it.
 */
function capabilitiesToChecklist(capabilities = {}, currentChecklist = {}) {
  const out = {};
  for (const [cap, items] of Object.entries(FROM_CAPABILITY)) {
    if (!(cap in capabilities)) continue;
    const v = capabilities[cap];

    if (v === false || v === null) {
      // "We cannot deliver this" has to mean every way of delivering it, or a
      // derive straight afterwards would OR one of them back to true.
      for (const item of items) out[item] = v === false ? false : null;
      continue;
    }

    // Turning a capability ON: if the practice already says it owns one of the
    // machines, leave the record alone — it is more specific than the toggle.
    // Only when none is ticked does the canonical item get it, because a
    // switch that says "we can do heat" cannot say which device does it.
    if (items.some((i) => currentChecklist[i] === true)) continue;
    out[PRIMARY_ITEM[cap]] = true;
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
  PRIMARY_ITEM,
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
