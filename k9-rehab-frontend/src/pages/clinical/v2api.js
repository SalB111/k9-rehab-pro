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

/**
 * Approve a version.
 *
 * `gateConfirmations` is a map of engine field -> true for every safety gate
 * this version was built on. The server refuses the approval if any is
 * missing, so this is not optional decoration - see protocol-store.
 */
export const approveVersion = (versionId, note, gateConfirmations) =>
  api.post(`/v2/versions/${versionId}/approve`, {
    note,
    gate_confirmations: gateConfirmations || {},
  }).then(unwrap);

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

/**
 * What the system already knows about this patient, shaped as engine inputs.
 *
 * Returns every value pre-filled from the record, the clinic's equipment
 * profile and stated rules, plus `gates` - the safety gates that apply to this
 * case and must be confirmed by a person before approval.
 */
export const getIntakeProposal = (patientId) =>
  api.get(`/v2/patients/${patientId}/intake-proposal`).then((r) => r.data.data);

/**
 * Register a patient.
 *
 * Deliberately small. Everything the engine needs beyond this is proposed
 * from the record rather than typed - see the intake proposal.
 */
export const createPatient = (body) =>
  api.post("/patients", body).then((r) => r.data.data || r.data);

/**
 * Correct a patient record.
 *
 * Deliberately the V1 route, the same one createPatient posts to. Patient CRUD
 * has always lived there; the V2 router owns visits, protocols and gates.
 *
 * Until 22 Sep 2026 this route existed with NO caller anywhere in the app — so
 * a record could be created and never corrected. A wrong weight, a missing
 * surgery date, a blank affected region and newly started medications were all
 * permanent. That is why the only real post-operative patient in the database
 * has `surgery_date: null` and no way to express how far post-op she is.
 *
 * Only the fields supplied are written; the route builds its UPDATE from what
 * it is given, so omitting a key leaves that column alone.
 */
export const updatePatient = (id, body) =>
  api.put(`/patients/${id}`, body).then((r) => r.data.data || r.data);

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

// ─────────────────────────────────────────────
// Controlled clinical vocabularies
//
// These four lists were free-text inputs until 22 Sep 2026. That mattered
// because the engine does not interpret them — it MATCHES them, literally:
//
//   protocol-generator.js:596
//     if (formData.neuroDeepPain.toLowerCase().includes('absent'))
//       formData._gradeVSupport = true;
//
// A clinician typing "Negative", "No DPP", "0", "abs." or "not present" —
// every one of which means absent deep pain to a person — produced NO Grade V
// lock. The safety gate confirmed that the clinician had STATED the value; it
// could not confirm that the engine had PARSED it.
//
// So every `value` below is chosen to satisfy the engine's own matcher, and
// every `label` is chosen to read correctly to a clinician. Where those two
// requirements pull apart, the value wins and the label carries the meaning.
//
// DO NOT edit a `value` without checking it against the matcher it feeds.
// The labels are free.
// ─────────────────────────────────────────────

/**
 * Proprioception and withdrawal.
 *
 * The engine joins all four neuro fields and scans the result for
 * 'absent' | 'none' | '0/5' | 'grade 0' to raise its red flag
 * (protocol-generator.js:591-595). "Delayed" and "Decreased" deliberately
 * match none of those: a delayed response is a finding, not an absence, and
 * must not raise a flag that says function is gone.
 */
export const NEURO_RESPONSE = [
  { value: "", label: "Not assessed" },
  { value: "Present", label: "Present" },
  { value: "Delayed", label: "Delayed" },
  { value: "Decreased", label: "Decreased" },
  { value: "Absent", label: "Absent" },
];

/**
 * Deep pain perception. Its own list, deliberately shorter.
 *
 * DPP is clinically binary — it is present or it is not, and a Grade V
 * diagnosis turns on exactly that. Offering "Decreased" here would invite a
 * clinician to record a middle state the engine cannot act on and the
 * literature does not describe.
 *
 * "Absent" is the only value that sets _gradeVSupport.
 */
export const DEEP_PAIN = [
  { value: "", label: "Not assessed" },
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent — no deep pain perception" },
];

/**
 * Voluntary motor function.
 *
 * "0/5" in the value is load-bearing: it is one of the four tokens the
 * engine's neuro scan matches. The ambulatory/non-ambulatory distinction
 * carries no engine meaning today and is recorded because it is what a
 * clinician actually assesses.
 */
export const NEURO_MOTOR = [
  { value: "", label: "Not assessed" },
  { value: "Voluntary motor present — ambulatory", label: "Present — ambulatory" },
  { value: "Voluntary motor present — non-ambulatory", label: "Present — non-ambulatory" },
  { value: "0/5 — no voluntary motor", label: "0/5 — no voluntary motor" },
];

/**
 * Body condition score, WSAVA 1–9.
 *
 * These are the labels the V1 dashboard has always used
 * (DashboardView.jsx:1336) — reused verbatim rather than reworded, because a
 * clinician reading "6 — Overweight" on one screen and something else on
 * another has to work out whether they mean the same thing.
 *
 * The column has existed on `patients` since the beginning, defaulting to 5,
 * with no UI anywhere in the V2 workflow and nothing reading it. It is
 * recorded and trended here; it does NOT feed the engine, and no exercise is
 * selected or withheld on it. Making it generative would need published
 * thresholds, not a rule invented to fill the gap.
 */
export const BODY_CONDITION_SCORE = [
  { value: "", label: "Not recorded" },
  { value: "1", label: "1 — Emaciated" },
  { value: "2", label: "2 — Very thin" },
  { value: "3", label: "3 — Thin" },
  { value: "4", label: "4 — Underweight" },
  { value: "5", label: "5 — Ideal" },
  { value: "6", label: "6 — Overweight" },
  { value: "7", label: "7 — Heavy" },
  { value: "8", label: "8 — Obese" },
  { value: "9", label: "9 — Morbidly obese" },
];

/**
 * Incision status.
 *
 * These four values are the EXACT keys of INCISION_EXCLUSIONS in
 * protocol-generator.js. The engine looks this field up as a key — not a
 * substring — so a value that is not one of these withholds no exercises at
 * all, however clearly it describes a compromised incision to a person.
 *
 * "Healing normally" is deliberately not a key: a normal incision should
 * exclude nothing, and it must not match the hard-block scan either.
 *
 * Dehiscence and Infection both stop generation outright. That took a fix on
 * 22 Sep 2026 — the scan matched 'infected' while the key was 'Infection', so
 * the two consumers of this one field disagreed about the same patient. See
 * the note at protocol-generator.js validateIntake().
 */
export const INCISION_STATUS = [
  { value: "", label: "Not assessed" },
  { value: "Healing normally", label: "Healing normally" },
  { value: "Mild Swelling", label: "Mild swelling" },
  { value: "Seroma", label: "Seroma" },
  { value: "Infection", label: "Infection — blocks generation" },
  { value: "Dehiscence", label: "Dehiscence — blocks generation" },
];

/**
 * Yes / No / Not assessed.
 *
 * Crate rest and e-collar were checkboxes, which cannot express three states.
 * An unticked box read as "no" to the clinician while null was what got
 * stored, and both are in the engine's `fails_unsafe_if_omitted` set — so the
 * restriction never fired and nothing anywhere said so. A control that cannot
 * represent "nobody has looked at this yet" will report that state as safe.
 */
export const TRISTATE = [
  { value: "", label: "Not assessed" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

/**
 * Session frequency. Free-form in the engine — it is echoed into the protocol
 * rather than parsed — so these are the common clinic cadences, not a
 * constraint.
 */
export const PROTOCOL_FREQUENCY = [
  { value: "1x/week", label: "1× / week" },
  { value: "2x/week", label: "2× / week" },
  { value: "3x/week", label: "3× / week" },
  { value: "Daily", label: "Daily" },
];

/**
 * The engine's own documented default protocol length, in weeks
 * (contracts/k9-engine-input-contract.json → route_level_inputs.protocolLength).
 *
 * The workflow hard-coded 6 here until 22 Sep 2026, so every protocol the V2
 * screen ever produced was six weeks at 2x/week regardless of the case, and no
 * clinician chose either number.
 */
export const PROTOCOL_LENGTH_DEFAULT = 8;
export const PROTOCOL_FREQUENCY_DEFAULT = "2x/week";

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

// ── Recheck requests ─────────────────────────────────────────────────────────

export const listRechecks = (patientId) =>
  api.get(`/v2/rechecks`, { params: { patient_id: patientId } }).then(unwrap);

export const respondToRecheck = (recheckId, status, response) =>
  api.post(`/v2/rechecks/${recheckId}/respond`, { status, response }).then(unwrap);

// ── In-clinic sessions ───────────────────────────────────────────────────────

export const listClinicSessions = (patientId) =>
  api.get(`/v2/patients/${patientId}/sessions`).then(unwrap);

export const getClinicSession = (sessionId) =>
  api.get(`/v2/sessions/${sessionId}`).then(unwrap);

export const reviewClinicSession = (sessionId, note) =>
  api.post(`/v2/sessions/${sessionId}/review`, { note }).then(unwrap);

// ── Home program ───────────────────────────────────────────────────────────

export const getAdherence = (patientId) =>
  api.get(`/v2/patients/${patientId}/adherence`).then(unwrap);

export const listHomeSessions = (patientId) =>
  api.get(`/v2/patients/${patientId}/home-sessions`).then(unwrap);

export const reviewHomeSession = (sessionId, note) =>
  api.post(`/v2/home-sessions/${sessionId}/review`, { note }).then(unwrap);

export const requestVideo = (patientId, body) =>
  api.post(`/v2/patients/${patientId}/video-requests`, body).then(unwrap);

export const listVideoRequests = (patientId, status) =>
  api.get(`/v2/beau/patients/${patientId}/video-requests`, { params: { status } }).then(unwrap);

// ── Labels ───────────────────────────────────────────────────────────────────

export const URGENCY_LABELS = {
  URGENT: "Urgent",
  SOON: "Soon",
  ROUTINE: "Routine",
};

export const RECHECK_RESPONSES = [
  { value: "ACKNOWLEDGED", label: "Acknowledge", hint: "Seen. Still deciding." },
  { value: "SCHEDULED", label: "Book a recheck", hint: "Stays open until the patient is seen." },
  { value: "RESOLVED", label: "Resolve", hint: "Dealt with — closes the concern." },
  { value: "DECLINED", label: "No action needed", hint: "Requires a reason." },
];

export const DIFFICULTY_LABELS = {
  EASY: "too easy",
  JUST_RIGHT: "about right",
  HARD: "hard",
  TOO_HARD: "too hard",
};

// ── B.E.A.U. Home access ─────────────────────────────────────────────────────

export const getHomeAccess = (patientId) =>
  api.get(`/v2/patients/${patientId}/home-access`).then(unwrap);

export const issueHomeAccess = (patientId) =>
  api.post(`/v2/patients/${patientId}/home-access`).then(unwrap);

export const revokeHomeAccess = (patientId) =>
  api.delete(`/v2/patients/${patientId}/home-access`).then(unwrap);
