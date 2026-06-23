// ============================================================================
// BEAU'S BRAIN — Voice layer
// © 2026 Salvatore Bonanno. All rights reserved.
//
// ONE grounded plan → TWO strictly-separated presentations:
//   renderClinical(plan) → K9 Rehab Pro (B2B): clinical, peer-to-peer, full
//     terminology, phase dosing, evidence citations, contraindications.
//   renderConsumer(plan) → B.E.A.U. at Home (B2C): warm, plain-English,
//     encouraging, "supports your vet," no jargon, no medical-advice claims.
//
// HARD BOUNDARY: neither renderer adds clinical content. Both read ONLY the
// grounded plan. The consumer renderer softens terminology for owners; it never
// diagnoses, prescribes, or promises outcomes.
// ============================================================================

const { CONSUMER_BOUNDARY, CLINICAL_BOUNDARY, DOCTRINE_TEXT } = require("./doctrine");

// ── helpers ────────────────────────────────────────────────────────────────

function asList(v) {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v];
}

// Translate a clinical frequency string into plain English (owner voice).
const WORDS = { "1": "once", "2": "twice", "3": "three times", "4": "four times", "5": "five times" };
function timesPhrase(n) { return WORDS[n] || `${n} times`; }

function friendlyFrequency(freq) {
  if (!freq) return "as directed";
  const f = String(freq).toLowerCase().trim();
  const map = {
    "before exercise": "before each exercise session",
    "as needed": "as needed",
    "per protocol": "as your veterinarian directs",
  };
  if (map[f]) return map[f];
  // "N-Mx/day", "Nx/day", "N-Mx/week", "Nx/week" → plain English
  const m = f.match(/^(\d+)(?:-(\d+))?\s*x\s*\/\s*(day|week)$/);
  if (m) {
    const period = m[3] === "day" ? "a day" : "a week";
    if (m[2]) return `${m[1]} to ${m[2]} times ${period}`;
    return `${timesPhrase(m[1])} ${period}`;
  }
  return f;
}

// Owner-friendly term softening — presentation-only, deterministic. Replaces the
// most common clinical terms with plain equivalents. Never changes the meaning.
const JARGON_SOFTEN = [
  [/\bquadriceps( femoris)?\b/gi, "thigh muscles"],
  [/\bgluteal( muscles)?\b/gi, "rear/hip muscles"],
  [/\bhamstrings?\b/gi, "back-of-thigh muscles"],
  [/\biliopsoas\b/gi, "hip flexor"],
  [/\bpropriocept(ive|ion)\b/gi, "balance and coordination"],
  [/\bstifle\b/gi, "knee"],
  [/\btarsus\b/gi, "ankle"],
  [/\bcarpus\b/gi, "wrist"],
  [/\beccentric\b/gi, "controlled lowering"],
  [/\bconcentric\b/gi, "lifting"],
  [/\bpassive range of motion\b/gi, "gentle joint movement"],
  [/\bPROM\b/g, "gentle joint movement"],
  [/\bactive[- ]assisted\b/gi, "gently assisted"],
  [/\bweight[- ]bearing\b/gi, "standing and putting weight on the leg"],
  [/\bROM\b/g, "range of movement"],
  [/\bcontracture\b/gi, "tightening/stiffening"],
  [/\beffusion\b/gi, "swelling"],
  [/\bcrepitus\b/gi, "grinding or clicking"],
  [/\bambulat(e|ion|ory)\b/gi, "walk"],
];

function soften(text) {
  if (!text) return "";
  let t = String(text);
  for (const [re, plain] of JARGON_SOFTEN) t = t.replace(re, plain);
  return t.trim();
}

function capFirst(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// First sentence of a description, softened for owners (no trailing punctuation —
// the caller controls sentence ends).
function plainSummary(desc) {
  if (!desc) return "";
  const first = String(desc).split(/(?<=[.!?])\s/)[0];
  return soften(first.replace(/\s+/g, " ").trim()).replace(/[.!?]+$/, "");
}

// Owner-facing safety list: dedupe near-identical clinical red flags and cap the
// length so a home handout shows a calm, readable set — not a 40-item wall.
function ownerWatchList(redFlags, cap = 7) {
  const seen = new Set();
  const out = [];
  for (const raw of redFlags) {
    const plain = soften(raw).replace(/\s+/g, " ").trim();
    const key = plain.toLowerCase().replace(/[^a-z ]/g, "");
    if (!plain || seen.has(key)) continue;
    seen.add(key);
    out.push(plain.charAt(0).toLowerCase() + plain.slice(1));
    if (out.length >= cap) break;
  }
  return out;
}

// ── CLINICAL VOICE (K9 Rehab Pro / B2B) ─────────────────────────────────────

function renderClinical(plan) {
  const L = [];
  const m = plan.meta;
  const phase = plan.phase;

  L.push(`# ${m.protocolName} — ${m.species}`);
  L.push(`**Patient:** ${m.patientName} · **Indication:** ${m.condition} · **Week ${m.week} of ${m.totalWeeks}**`);
  if (phase) {
    L.push("");
    L.push(`## Phase ${phase.number} — ${phase.name}${phase.weekRange ? ` (${phase.weekRange})` : ""}`);
    if (phase.goal) L.push(`**Goal:** ${phase.goal}`);
    if (phase.progressionCriteria) L.push(`**Advancement criteria:** ${phase.progressionCriteria}`);
    if (phase.contraindications) L.push(`**Phase contraindications:** ${phase.contraindications}`);
  }

  if (plan.safety.intakeWarnings.length) {
    L.push("");
    L.push(`### Clinical flags`);
    for (const w of plan.safety.intakeWarnings) L.push(`- ${w}`);
  }

  L.push("");
  L.push(`## Prescription (${plan.exercises.length} exercises)`);
  plan.exercises.forEach((e, i) => {
    L.push("");
    L.push(`**${i + 1}. ${e.name}** \`${e.code}\` — _${e.category}_`);
    const dose = [e.sets && `Dose: ${e.sets}`, e.frequency && `Frequency: ${e.frequency}`].filter(Boolean).join(" · ");
    if (dose) L.push(dose);
    if (e.progression) L.push(`Progression: ${e.progression}`);
    const redFlags = asList(e.red_flags);
    if (redFlags.length) L.push(`Stop signs: ${redFlags.join("; ")}`);
    if (e.contraindications) L.push(`Contraindications: ${Array.isArray(e.contraindications) ? e.contraindications.join("; ") : e.contraindications}`);
    if (e.evidence_citation) L.push(`Evidence: ${e.evidence_citation}`);
  });

  L.push("");
  L.push(`---`);
  L.push(`_${CLINICAL_BOUNDARY}_`);
  L.push(`_${DOCTRINE_TEXT}_`);
  return L.join("\n");
}

// ── CONSUMER VOICE (B.E.A.U. at Home / B2C) ─────────────────────────────────

function renderConsumer(plan) {
  const L = [];
  const m = plan.meta;
  const name = m.patientName;

  L.push(`Here is ${name}'s home exercise plan for this week, made to support your veterinarian's care.`);
  if (plan.phase?.goal) {
    L.push("");
    L.push(`What we're working on right now: ${soften(plan.phase.goal)}`);
  }

  L.push("");
  L.push(`Your daily exercises`);
  plan.exercises.forEach((e, i) => {
    const summary = plainSummary(e.description) || soften(e.name);
    const howOften = friendlyFrequency(e.frequency);
    let line = `${i + 1}. ${capFirst(soften(e.name))} — ${summary}. Do this ${howOften}`;
    // Only show an amount when it's a concrete number (skip "Per protocol" etc.).
    if (e.sets && /\d/.test(e.sets)) line += ` (about ${soften(e.sets)})`;
    line += ".";
    L.push(line);
  });

  // Safety surface — calm, readable, capped; but never omitted.
  const watch = ownerWatchList(plan.safety.perExerciseRedFlags);
  if (watch.length) {
    L.push("");
    L.push(`Stop and call your veterinarian if you notice ${watch.join("; ")}; or anything else that seems painful or wrong.`);
  }

  L.push("");
  L.push(`Keep sessions short, calm, and positive — gentle, steady progress is the goal. Reward ${name} and stop if anything seems painful.`);
  L.push("");
  L.push(CONSUMER_BOUNDARY);
  return L.join("\n");
}

module.exports = { renderClinical, renderConsumer, soften, friendlyFrequency };
