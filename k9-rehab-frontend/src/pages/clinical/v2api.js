// ─────────────────────────────────────────────
// K9 Clinical Workflow V2 — API calls
//
// The axios client's baseURL already ends in /api, so paths here start /v2.
// ─────────────────────────────────────────────

import api from "../../api/axios";

/** Unwrap the { success, data } envelope the V2 router returns. */
const unwrap = (res) => res.data?.data;

/**
 * Normalize an axios error into something a clinician can act on.
 *
 * The V2 API distinguishes a malformed request (400) from a clinical-state
 * conflict (409) — approving without review, editing an approved protocol, the
 * engine refusing to generate. Those are not "errors" in the usual sense, so
 * the UI needs the code to decide whether to say "fix this" or "this has moved
 * on, reload it".
 */
export function describeError(err) {
  const body = err?.response?.data;
  return {
    status: err?.response?.status ?? 0,
    code: body?.code ?? "UNKNOWN",
    reason: body?.reason ?? null,
    message: body?.error || err?.message || "Something went wrong",
    warnings: body?.warnings || [],
  };
}

// ── Patient ──────────────────────────────────────────────────────────────────

export const getSnapshot = (patientId) =>
  api.get(`/v2/patients/${patientId}/snapshot`).then(unwrap);

export const listVisits = (patientId) =>
  api.get(`/v2/patients/${patientId}/visits`).then(unwrap);

export const getMeasurementHistory = (patientId, key, { site, side } = {}) =>
  api
    .get(`/v2/patients/${patientId}/measurements/${key}`, { params: { site, side } })
    .then(unwrap);

// ── Visit ────────────────────────────────────────────────────────────────────

export const createVisit = (patientId, body) =>
  api.post(`/v2/patients/${patientId}/visits`, body).then(unwrap);

export const recordAssessment = (visitId, assessment) =>
  api.post(`/v2/visits/${visitId}/assessment`, assessment).then(unwrap);

export const recordMeasurement = (visitId, measurement) =>
  api.post(`/v2/visits/${visitId}/measurements`, measurement).then(unwrap);

export const completeVisit = (visitId) =>
  api.post(`/v2/visits/${visitId}/complete`).then(unwrap);

export const generateRecommendation = (visitId, params) =>
  api.post(`/v2/visits/${visitId}/recommendation`, params).then(unwrap);

// ── Protocol version ─────────────────────────────────────────────────────────

export const getVersion = (versionId) =>
  api.get(`/v2/versions/${versionId}`).then(unwrap);

export const setVersionStatus = (versionId, status) =>
  api.post(`/v2/versions/${versionId}/status`, { status }).then(unwrap);

export const addExercise = (versionId, exercise) =>
  api.post(`/v2/versions/${versionId}/exercises`, exercise).then(unwrap);

export const removeExercise = (versionId, rowId, reason) =>
  api.delete(`/v2/versions/${versionId}/exercises/${rowId}`, { params: { reason } }).then(unwrap);

export const approveVersion = (versionId, note) =>
  api.post(`/v2/versions/${versionId}/approve`, { note }).then(unwrap);

export const handoffVersion = (versionId) =>
  api.post(`/v2/versions/${versionId}/handoff`).then(unwrap);

export const listVersions = (protocolId) =>
  api.get(`/v2/protocols/${protocolId}/versions`).then(unwrap);

// ── Authority + clinic ───────────────────────────────────────────────────────

export const getApprovalAuthority = () =>
  api.get(`/v2/me/approval-authority`).then(unwrap);

export const getClinicCapabilities = () =>
  api.get(`/v2/clinic/capabilities`).then(unwrap);

export const setClinicCapabilities = (capabilities) =>
  api.put(`/v2/clinic/capabilities`, capabilities).then(unwrap);

// ── Reference data ───────────────────────────────────────────────────────────

/** Human labels for the engine's five severity gates. */
export const SAFETY_GATE_LABELS = {
  _highPainOverride:
    "Severe pain (≥8/10) — protocol routed to palliative/comfort care and phase-locked",
  _severeWeakness:
    "MMT ≤1/5 — restricted to passive ROM, NMES and assisted standing",
  _ivddSevere:
    "IVDD Grade IV/V — locked to Phase 1 neurological support",
  _severeOA:
    "OA Kellgren-Lawrence Grade 4 — impact loading excluded",
  _gradeVSupport:
    "Deep pain perception absent — passive supportive care only",
};

export const WEIGHT_BEARING = [
  { value: "", label: "Not assessed" },
  { value: "NWB", label: "NWB — non-weight-bearing" },
  { value: "TTWB", label: "TTWB — toe-touch" },
  { value: "PWB", label: "PWB — partial" },
  { value: "FWB", label: "FWB — full" },
];

export const OVERALL_CHANGE = [
  { value: "", label: "Not stated" },
  { value: "IMPROVED", label: "Improved" },
  { value: "STABLE", label: "Stable" },
  { value: "NO_SIGNIFICANT_CHANGE", label: "No significant change" },
  { value: "WORSE", label: "Worse" },
];

export const TREATMENT_APPROACH = [
  { value: "", label: "Not stated" },
  { value: "Surgical", label: "Surgical" },
  { value: "Conservative", label: "Conservative" },
  { value: "Palliative", label: "Palliative / comfort" },
];

export const CAPABILITY_LABELS = {
  aquatic_access: "Aquatic access",
  modality_uwtm: "Underwater treadmill",
  modality_laser: "Therapeutic laser (PBM)",
  modality_tens: "TENS",
  modality_nmes: "NMES / e-stim",
  modality_therapeutic_us: "Therapeutic ultrasound",
  modality_pulsed_emf: "Pulsed EMF",
  modality_shockwave: "Shockwave (ESWT)",
  modality_cryotherapy: "Cryotherapy",
  modality_heat_therapy: "Heat therapy",
};
