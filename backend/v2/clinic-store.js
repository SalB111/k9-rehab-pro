/**
 * K9 Clinical Workflow V2 — Clinic Capabilities
 *
 * What equipment the facility owns. The engine gates ten exercise groups on
 * this, and every one is an ENABLEMENT gate: an unset capability withholds the
 * therapy rather than restricting it.
 *
 * Today these flags are re-entered per protocol in the wizard and default to
 * false, so forgetting to tick "Therapeutic Laser" silently removes laser work
 * from the prescription with no warning. Persisting them on the clinic makes
 * the answer stated once and correctable in one place.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');
// The 43-item checklist both apps read, and the map from item to capability.
// Required lazily inside assertCoversEngineGates there to avoid a cycle; here
// it is a plain dependency.
const equipment = require('./clinic-equipment');

/**
 * Capability column -> the engine input it feeds.
 *
 * Kept as an explicit map so the set cannot silently drift from the engine
 * contract: `assertCoversEngineGates` checks it against the contract at runtime.
 */
const CAPABILITY_TO_ENGINE_INPUT = {
  aquatic_access: 'aquaticAccess',
  modality_uwtm: 'modalityUWTM',
  modality_laser: 'modalityLaser',
  modality_tens: 'modalityTENS',
  modality_nmes: 'modalityNMES',
  modality_therapeutic_us: 'modalityTherapeuticUS',
  modality_pulsed_emf: 'modalityPulsedEMF',
  modality_shockwave: 'modalityShockwave',
  modality_cryotherapy: 'modalityCryotherapy',
  modality_heat_therapy: 'modalityHeatTherapy',
};

const CAPABILITY_KEYS = Object.keys(CAPABILITY_TO_ENGINE_INPUT);

/** 1 / 0 / null — never coerce "unstated" into "unavailable". */
function toTriState(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value === true || value === 'true' || value === 1 || value === '1') return 1;
  if (value === false || value === 'false' || value === 0 || value === '0') return 0;
  return null;
}

function fromTriState(value) {
  if (value === 1) return true;
  if (value === 0) return false;
  return null;
}

/**
 * Capabilities for a clinic. Returns a row with every key present — null where
 * nothing has been stated — so a caller can always tell "not available" from
 * "never answered".
 */
async function getCapabilities(db, clinicId) {
  const row = await db.get(`SELECT * FROM clinic_capabilities WHERE clinic_id = ?`, [clinicId]);
  const capabilities = {};
  for (const key of CAPABILITY_KEYS) {
    capabilities[key] = row ? fromTriState(row[key]) : null;
  }
  // The full 43-item checklist, which both apps now read. A clinic whose row
  // predates the checklist has its ten stored booleans projected back into
  // checklist form, so the V1 screen shows what is actually known rather than
  // an empty list that reads as "we own nothing".
  let checklist = {};
  if (row && row.equipment_json) {
    try {
      const parsed = JSON.parse(row.equipment_json);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) checklist = parsed;
    } catch { checklist = {}; }
  }
  if (!Object.keys(checklist).length) {
    checklist = equipment.capabilitiesToChecklist(capabilities);
  }

  return {
    clinic_id: clinicId,
    capabilities,
    equipment: checklist,
    // The categories and their items, served rather than duplicated. Both
    // screens render from this, so there is no second copy of the list to
    // drift from the one the derivation map is written against.
    checklistShape: equipment.CHECKLIST,
    gatingItems: Object.keys(equipment.TO_CAPABILITY),
    unstated: CAPABILITY_KEYS.filter((k) => capabilities[k] === null),
    // Inventory nobody has answered either way. Not the same as `unstated`:
    // that is the ten the engine gates on, this is the whole checklist.
    unansweredItems: equipment.ALL_ITEMS.filter(
      (i) => checklist[i] === undefined || checklist[i] === null
    ),
    configured: Boolean(row),
    updated_at: row ? row.updated_at : null,
    updated_by: row ? row.updated_by : null,
  };
}

/**
 * Upsert the clinic's equipment. Only what is mentioned is changed.
 *
 * TWO WAYS IN, ONE RECORD OUT.
 *
 *   `equipment` — the 43-item checklist, which is what the V1 dashboard sends.
 *   `capabilities` — the ten engine booleans, which is what the V2 admin
 *     screen toggles.
 *
 * Whichever arrives, BOTH are written: the checklist is stored, and the ten
 * columns are DERIVED from it. That derivation is the whole point. The two
 * records used to be filled independently — V1 into each patient's form blob,
 * V2 into this row — and they drifted, because nothing made them agree. Now
 * one cannot move without the other.
 *
 * A capability toggled directly is folded back into the checklist first, so
 * the checklist is always the fuller statement and the columns are always its
 * projection.
 */
async function setCapabilities(db, { clinicId, capabilities, equipment: checklistInput, actor }) {
  if (!clinicId) throw new ProtocolStoreError('clinicId is required', ERR.INVALID);
  if (!actor || !actor.id) {
    throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);
  }

  const input = capabilities || {};
  const unknown = Object.keys(input).filter((k) => !CAPABILITY_KEYS.includes(k));
  if (unknown.length) {
    throw new ProtocolStoreError(`Unknown capability keys: ${unknown.join(', ')}`, ERR.INVALID);
  }
  if (checklistInput) {
    const strays = Object.keys(checklistInput).filter((i) => !equipment.ALL_ITEMS.includes(i));
    if (strays.length) {
      throw new ProtocolStoreError(
        `Unknown equipment items: ${strays.join(', ')}. An item renamed in the `
        + `checklist needs an alias, not an edit — the stored key is the label.`,
        ERR.INVALID
      );
    }
  }

  const existing = await db.get(`SELECT * FROM clinic_capabilities WHERE clinic_id = ?`, [clinicId]);

  // Start from what is already recorded, so a partial update never un-states
  // equipment it did not mention.
  const current = await getCapabilities(db, clinicId);
  const merged = { ...current.equipment };
  if (checklistInput) Object.assign(merged, checklistInput);
  // A capability toggled directly lands in the checklist too, or the next read
  // would project the old checklist back over it.
  if (Object.keys(input).length) {
    Object.assign(merged, equipment.capabilitiesToChecklist(
      Object.fromEntries(Object.entries(input).map(([k, v]) => [k, toTriState(v) === 1 ? true
        : toTriState(v) === 0 ? false : null])),
      // The checklist as it stands, so turning a capability on does not
      // overwrite a practice that has already said WHICH machine it owns.
      merged
    ));
  }

  // The ten columns are the checklist's projection, never an independent fact.
  const derived = equipment.deriveCapabilities(merged);
  const values = CAPABILITY_KEYS.map((key) => toTriState(derived[key]));

  // Stored together, in one statement, so the checklist and its projection can
  // never be written apart.
  const checklistJson = JSON.stringify(merged);

  if (existing) {
    await db.run(
      `UPDATE clinic_capabilities
          SET ${CAPABILITY_KEYS.map((k) => `${k} = ?`).join(', ')},
              equipment_json = ?,
              updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE clinic_id = ?`,
      [...values, checklistJson, actor.id, clinicId]
    );
  } else {
    await db.run(
      `INSERT INTO clinic_capabilities (clinic_id, ${CAPABILITY_KEYS.join(', ')}, equipment_json, updated_by)
       VALUES (?, ${CAPABILITY_KEYS.map(() => '?').join(', ')}, ?, ?)`,
      [clinicId, ...values, checklistJson, actor.id]
    );
  }

  return getCapabilities(db, clinicId);
}

/**
 * Shape capabilities into the `clinic` branch of V2 state for engine-adapter.
 *
 * Emits every key explicitly. A missing key would be a dropped enablement gate,
 * which is the same defect class as Finding 1 — just in the withholding
 * direction.
 */
function toClinicState(capabilityRecord) {
  const source = (capabilityRecord && capabilityRecord.capabilities) || {};
  const state = {};
  for (const key of CAPABILITY_KEYS) {
    state[key] = key in source ? source[key] : null;
  }
  return state;
}

/**
 * The same capability state, keyed by ENGINE input name.
 *
 * toClinicState() returns capability keys (modality_laser) because that is what
 * the visit -> engine pipeline carries until the adapter maps it. Anything
 * building engine inputs directly needs them the other way round, and getting
 * it wrong is silent: the engine simply never sees the modality and withholds
 * the therapy, which is the fails-restrictive direction with no error anywhere.
 *
 * The map lives here, so this conversion does too.
 */
function toEngineInputs(capabilityRecord) {
  const state = toClinicState(capabilityRecord);
  const out = {};
  for (const [capKey, engineKey] of Object.entries(CAPABILITY_TO_ENGINE_INPUT)) {
    out[engineKey] = state[capKey];
  }
  return out;
}

/**
 * Guard against the capability set drifting from the engine's enablement gates.
 *
 * The engine contract marks these as `fails_restrictive_if_omitted`. If the
 * engine gains a modality and this map is not updated, that therapy becomes
 * permanently unavailable with no error anywhere — so the mismatch is raised
 * loudly at boot instead.
 */
function assertCoversEngineGates(contract) {
  const expected = (contract
    && contract.omission_semantics
    && contract.omission_semantics.fails_restrictive_if_omitted) || [];
  const mapped = new Set(Object.values(CAPABILITY_TO_ENGINE_INPUT));

  const missing = expected.filter((input) => !mapped.has(input));
  if (missing.length) {
    throw new Error(
      `[clinic-store] engine enablement gates not covered by clinic capabilities: ${missing.join(', ')}. ` +
        `Add them to CAPABILITY_TO_ENGINE_INPUT and the clinic_capabilities schema, ` +
        `or that therapy is silently unavailable to every clinic.`
    );
  }
  return true;
}

module.exports = {
  CAPABILITY_KEYS,
  CAPABILITY_TO_ENGINE_INPUT,
  getCapabilities,
  setCapabilities,
  toClinicState,
  toEngineInputs,
  assertCoversEngineGates,
  toTriState,
  fromTriState,
};
