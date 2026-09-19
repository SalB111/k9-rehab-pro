// ─────────────────────────────────────────────
// B.E.A.U. Home — client API
//
// Separate from the clinician axios client on purpose. This one carries an
// OWNER token, not a clinician session, and must never pick up a clinician's
// credentials from localStorage if a vet happens to use the same browser.
// ─────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TOKEN_KEY = "beau_home_token";
const PATIENT_KEY = "beau_home_patient";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getStoredPatient() {
  try {
    const raw = localStorage.getItem(PATIENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function store(token, patient) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PATIENT_KEY, JSON.stringify(patient));
  } catch { /* private browsing — the session still works, it just won't persist */ }
}

export function signOut() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PATIENT_KEY);
  } catch { /* ignore */ }
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/v2/beau${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    const err = new Error(json?.error || "Something went wrong. Please try again.");
    err.status = res.status;
    err.code = json?.code;
    // A revoked code must send the client back to the code screen rather than
    // leaving them staring at a broken page.
    if (res.status === 401) signOut();
    throw err;
  }
  return json?.data;
}

/** Exchange the code the clinic gave you for a session. */
export async function enterCode(code) {
  const res = await fetch(`${API_BASE}/v2/beau/access`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json?.error || "That code was not recognised.");
    err.status = res.status;
    throw err;
  }
  store(json.data.token, json.data.patient);
  return json.data;
}

export const getProgramme = () => request("GET", "/my-programme");
export const recordEngagement = (event, detail) =>
  request("POST", "/engagement", { event, detail }).catch(() => null);
export const startSession = (sessionDate, weekNumber) =>
  request("POST", "/home-sessions", { session_date: sessionDate, week_number: weekNumber });
export const logExercise = (sessionId, rowId, log) =>
  request("POST", `/home-sessions/${sessionId}/exercises/${rowId}`, log);
export const completeSession = (sessionId, summary) =>
  request("POST", `/home-sessions/${sessionId}/complete`, summary);
export const sendMessage = (detail, homeSessionId) =>
  request("POST", "/observations", {
    observation_type: "FEEDBACK", detail, home_session_id: homeSessionId,
  });
export const submitVideo = (requestId, mediaRef, homeSessionId, ownerNote) =>
  request("POST", `/video-requests/${requestId}/submit`, {
    media_ref: mediaRef, home_session_id: homeSessionId, owner_note: ownerNote,
  });

/** Plain words. An owner is not choosing between clinical categories. */
export const DIFFICULTY_CHOICES = [
  { value: "EASY", label: "Easy for him", emoji: "🙂" },
  { value: "JUST_RIGHT", label: "About right", emoji: "👍" },
  { value: "HARD", label: "Hard work", emoji: "😮‍💨" },
  { value: "TOO_HARD", label: "Too much", emoji: "🛑" },
];

export const SEVERITY_CHOICES = [
  { value: "MILD", label: "Mild — he carried on" },
  { value: "MODERATE", label: "Noticeable — I stopped that exercise" },
  { value: "SEVERE", label: "Severe — I stopped everything" },
];

/** Stop conditions come from the exercise itself; the clinician wrote them. */
export function stopConditions(exercise) {
  const raw = exercise?.red_flags;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw).split(/;|\n/).map((s) => s.trim()).filter(Boolean);
}

export function equipmentList(exercise) {
  const raw = exercise?.equipment;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [String(raw)];
}
