/**
 * K9 Clinical Workflow V2 — Client Details store
 *
 * V3. `patient_client_details` is the source of truth for the client block's
 * address, contacts, cover and identification. `patients.dashboard_data` is no
 * longer read for them.
 *
 * WHAT THIS DOES AND DOES NOT OWN
 *
 * The client block splits in two and this owns the second half only:
 *
 *   `patients` columns — name, species, breed, age, weight, sex, date of
 *     birth, client_name, client_email, client_phone, referring_vet. Already
 *     the source of truth, already validated on `PUT /api/patients/:id`, and
 *     already reconciled by record-sync. Not duplicated here: a second write
 *     path with its own validation is how two records of one animal start
 *     disagreeing, which is the whole thing V3 exists to end.
 *
 *   THIS TABLE — the 13 fields that had no home anywhere.
 *
 * `getClient` reads both so a screen can render one form, but only the details
 * are writable here. Demographics go through the patient endpoint.
 *
 * PII, DELIBERATELY SEGREGATED
 *
 * Everything writable here is client PII with no clinical consumer and no
 * engine use. It is off the patient row on purpose: the HEP contract test
 * asserts none of it reaches B.E.A.U., and a payload built from a patient row
 * cannot leak a microchip number that row never held.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');

const TABLE = 'patient_client_details';

/** Writable here. One column each, no derivation. */
const DETAIL_COLUMNS = [
  'street_address', 'apt_suite_unit', 'city', 'state_province', 'postal_code', 'country',
  'emergency_contact', 'insurance_provider', 'primary_veterinarian', 'specialist_surgeon',
  'insurance_other', 'markings_additional',
  'microchip', 'colour_markings',
];

/** Read-only here — owned by `patients` and its own endpoint. */
const DEMOGRAPHIC_COLUMNS = [
  'name', 'species', 'breed', 'age', 'weight', 'sex', 'date_of_birth',
  'client_name', 'client_email', 'client_phone', 'referring_vet',
];

const ADDRESS_FLAG = 'address_is_unstructured';

function blank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

async function assertSchema(db) {
  const rows = await db.all(`PRAGMA table_info(${TABLE})`);
  if (!rows || !rows.length) {
    throw new Error(
      `[patient-client-store] ${TABLE} does not exist. Apply `
      + `v2/schema/patient-client-details.sqlite.sql (it is in schema.js SQLITE_SCHEMAS).`
    );
  }
  const present = new Set(rows.map((r) => r.name));
  const missing = [...DETAIL_COLUMNS, ADDRESS_FLAG].filter((c) => !present.has(c));
  if (missing.length) {
    throw new Error(
      `[patient-client-store] ${TABLE} is missing columns: ${missing.join(', ')}. `
      + `A clinician's answer to those would be accepted and silently discarded.`
    );
  }
  return true;
}

/**
 * The whole client record — demographics for display, details for editing.
 *
 * Every field is present, `null` where unanswered, so a caller can tell
 * "nobody has said" from "there is no record".
 */
async function getClient(db, patientId) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);

  const patient = await db.get('SELECT * FROM patients WHERE id = ?', [patientId]);
  if (!patient) throw new ProtocolStoreError(`Patient ${patientId} not found`, ERR.NOT_FOUND);

  const row = await db.get(`SELECT * FROM ${TABLE} WHERE patient_id = ?`, [patientId]);

  const details = {};
  for (const c of DETAIL_COLUMNS) {
    if (row && !blank(row[c])) details[c] = String(row[c]).trim();
  }

  const demographics = {};
  for (const c of DEMOGRAPHIC_COLUMNS) {
    if (!blank(patient[c])) demographics[c] = patient[c];
  }

  return {
    patient_id: patientId,
    // Read-only here. Edited through PUT /api/patients/:id, which validates
    // clinical ranges and reconciles the V1 record.
    demographics,
    details,
    address_is_unstructured: Boolean(row && row[ADDRESS_FLAG]),
    unanswered: DETAIL_COLUMNS.filter((c) => details[c] === undefined),
    // Served so the screen holds no copy of the field list.
    detailFields: DETAIL_COLUMNS,
    demographicFields: DEMOGRAPHIC_COLUMNS,
    configured: Boolean(row),
    updated_at: row ? row.updated_at : null,
    updated_by: row ? row.updated_by : null,
  };
}

/**
 * Upsert the client details. Only what is mentioned changes.
 *
 * A partial write never blanks a field it did not name — the form saves one
 * answer at a time. An explicit empty string DOES clear a field, because that
 * is somebody deliberately removing an answer.
 *
 * A demographic column passed here is REFUSED rather than quietly ignored: it
 * has its own endpoint with its own validation, and silently dropping it would
 * let a clinician change an age that never changed.
 */
async function setClient(db, { patientId, details, addressIsUnstructured, actor }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const input = details || {};
  const demographic = Object.keys(input).filter((k) => DEMOGRAPHIC_COLUMNS.includes(k));
  if (demographic.length) {
    throw new ProtocolStoreError(
      `${demographic.join(', ')} belong to the patient record, not client details. `
      + `Use PUT /api/patients/:id — it validates clinical ranges and reconciles the V1 record.`,
      ERR.INVALID
    );
  }
  const unknown = Object.keys(input).filter((k) => !DETAIL_COLUMNS.includes(k));
  if (unknown.length) {
    throw new ProtocolStoreError(`Unknown client detail fields: ${unknown.join(', ')}`, ERR.INVALID);
  }

  const existing = await db.get(`SELECT * FROM ${TABLE} WHERE patient_id = ?`, [patientId]);

  const merged = {};
  for (const c of DETAIL_COLUMNS) {
    merged[c] = c in input
      ? (blank(input[c]) ? null : String(input[c]).trim())
      : (existing ? existing[c] : null);
  }
  const flag = addressIsUnstructured === undefined
    ? (existing ? existing[ADDRESS_FLAG] : 0)
    : (addressIsUnstructured ? 1 : 0);

  const values = DETAIL_COLUMNS.map((c) => merged[c]);

  if (existing) {
    await db.run(
      `UPDATE ${TABLE}
          SET ${DETAIL_COLUMNS.map((c) => `${c} = ?`).join(', ')}, ${ADDRESS_FLAG} = ?,
              updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?`,
      [...values, flag, actor.id, patientId]
    );
  } else {
    await db.run(
      `INSERT INTO ${TABLE} (patient_id, ${DETAIL_COLUMNS.join(', ')}, ${ADDRESS_FLAG}, updated_by)
       VALUES (?, ${DETAIL_COLUMNS.map(() => '?').join(', ')}, ?, ?)`,
      [patientId, ...values, flag, actor.id]
    );
  }

  return getClient(db, patientId);
}

module.exports = {
  TABLE,
  DETAIL_COLUMNS,
  DEMOGRAPHIC_COLUMNS,
  ADDRESS_FLAG,
  assertSchema,
  getClient,
  setClient,
};
