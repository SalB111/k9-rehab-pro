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
  return {
    clinic_id: clinicId,
    capabilities,
    unstated: CAPABILITY_KEYS.filter((k) => capabilities[k] === null),
    configured: Boolean(row),
    updated_at: row ? row.updated_at : null,
    updated_by: row ? row.updated_by : null,
  };
}

/** Upsert capabilities. Only keys present in `input` are changed. */
async function setCapabilities(db, { clinicId, capabilities, actor }) {
  if (!clinicId) throw new ProtocolStoreError('clinicId is required', ERR.INVALID);
  if (!actor || !actor.id) {
    throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);
  }

  const input = capabilities || {};
  const unknown = Object.keys(input).filter((k) => !CAPABILITY_KEYS.includes(k));
  if (unknown.length) {
    throw new ProtocolStoreError(`Unknown capability keys: ${unknown.join(', ')}`, ERR.INVALID);
  }

  const existing = await db.get(`SELECT * FROM clinic_capabilities WHERE clinic_id = ?`, [clinicId]);

  // Absent keys keep their stored value rather than being reset to null — a
  // partial update must not silently un-state equipment it did not mention.
  const values = CAPABILITY_KEYS.map((key) =>
    key in input ? toTriState(input[key]) : existing ? existing[key] : null
  );

  if (existing) {
    await db.run(
      `UPDATE clinic_capabilities
          SET ${CAPABILITY_KEYS.map((k) => `${k} = ?`).join(', ')},
              updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE clinic_id = ?`,
      [...values, actor.id, clinicId]
    );
  } else {
    await db.run(
      `INSERT INTO clinic_capabilities (clinic_id, ${CAPABILITY_KEYS.join(', ')}, updated_by)
       VALUES (?, ${CAPABILITY_KEYS.map(() => '?').join(', ')}, ?)`,
      [clinicId, ...values, actor.id]
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
