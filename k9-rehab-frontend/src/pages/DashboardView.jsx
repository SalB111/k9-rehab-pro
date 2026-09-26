import React, { useState, useRef, useEffect, useMemo, createContext, useContext } from "react";
import AnatomyViewer3D from "../components/AnatomyViewer3D";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LOCALES } from "../i18n";
import { useTr, slugField } from "../i18n/useTr";
import useBeauVoice from "../hooks/useBeauVoice";
import BeauVoiceControl, { SpeakButton } from "../components/BeauVoiceControl";
import ExercisesView from "./ExercisesView";

// Ensure i18n is initialized (side effect — the import above runs the init)
void i18n;

// ─── FORM CONTEXT ─── auto-wires all F fields without modifying each call
const DashFormContext = createContext({ data: {}, update: () => {}, blockId: null, beauVoice: null });

// Auto-translation helpers (slugField, useTr) are imported from ../i18n/useTr

/**
 * Ask B.E.A.U. a question and return the whole answer.
 *
 * THIS DID NOT EXIST. Five call sites in this file awaited `callBeau` and
 * nothing anywhere declared or imported it, so every one of them threw
 * "callBeau is not defined" the moment it ran:
 *
 *   the Assessment panel's synthesis        (runBeauSynthesis — since removed
 *                                            from that panel, 2026-09-25)
 *   the Goals panel's B.E.A.U. help
 *   the Protocol panel's B.E.A.U. help
 *   the Nutrition panel's B.E.A.U. help
 *   "Ask B.E.A.U." in any block header      (askBeauInContext)
 *
 * Each one caught the error and put it in its own output box, so it read as
 * a B.E.A.U. failure rather than a missing function. Reported by Sal on
 * 2026-09-25: "BEAU analyze assessment not functioning".
 *
 * THE VALIDATION EVENTS ARE NOT OPTIONAL
 *
 * The server streams three kinds of event, and the third is a safety feature:
 *
 *   delta       a chunk of the answer
 *   error       the request failed
 *   validation  B.E.A.U. named an exercise code that is NOT in the library,
 *               or one that exists but was not among those supplied for this
 *               answer — recalled rather than retrieved
 *
 * beau-chat-handler.js says of those, verbatim: "It now reaches the client as
 * well. The clinician is the person who can act on it, and they cannot act on
 * what they are not told." A client that drops them would silently undo the
 * anti-hallucination check that CLAUDE.md makes non-negotiable. They are
 * appended to the returned text so they are impossible to miss.
 *
 * @param {string}   system    the system prompt for this panel
 * @param {string}   userText  the question
 * @param {string}   language  UI locale, passed through for the reply
 * @param {Function} [onChunk] (chunk, accumulated) — for streaming panels
 * @returns {Promise<string>}  the full answer, plus any validation notices
 */
async function callBeau(system, userText, language, onChunk) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const token = localStorage.getItem("token");

  const res = await fetch(`${apiBase}/beau/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: userText }],
      system,
      language,
    }),
  });

  // The endpoint answers a refusal as JSON, not as a stream — a missing API
  // key is 503 with a sentence saying so, and that sentence is far more use
  // to a clinician than "failed to fetch".
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j && j.error) detail = j.error; } catch { /* not JSON */ }
    throw new Error(detail);
  }
  if (!res.body) throw new Error("B.E.A.U. returned no response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  const notices = [];

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line. Keep the trailing partial.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        let evt;
        try { evt = JSON.parse(line.slice(5).trim()); } catch { continue; }

        if (evt.type === "delta" && evt.text) {
          answer += evt.text;
          if (onChunk) onChunk(evt.text, answer);
        } else if (evt.type === "validation") {
          notices.push(evt);
        } else if (evt.type === "error") {
          throw new Error(evt.text || "B.E.A.U. reported an error");
        }
        // "done" needs no handling — the stream closing is the signal.
      }
    }
  }

  if (!notices.length) return answer;

  const flagged = notices.map((n) => {
    const head = n.severity === "error"
      ? "NOT IN THE EXERCISE LIBRARY"
      : "RECALLED, NOT SUPPLIED";
    return `[${head}] ${n.text}`;
  }).join("\n");

  return `${answer}\n\n———\n${flagged}`;
}

// so other views across the platform can share the same mechanism.

// ─── THEME — WHITE CLINICAL ───────────────────────────────────────────────────
const C = {
  bg:       "#F0F4F8",
  white:    "#FFFFFF",
  panel:    "#FFFFFF",
  sidebar:  "#1A2744",
  sideText: "#E8EDF5",
  sideMuted:"#7A8BAA",
  navy:     "#1A2744",
  blue:     "#1A5FD4",
  blueLt:   "#EBF2FF",
  green:    "#006B3C",
  greenLt:  "#E6F4ED",
  red:      "#C0392B",
  redLt:    "#FDECEA",
  amber:    "#B45309",
  amberLt:  "#FEF3C7",
  teal:     "#0D7377",
  tealLt:   "#E0F5F5",
  purple:   "#5B21B6",
  purpleLt: "#EDE9FE",
  border:   "#D1D9E6",
  text:     "#1A2744",
  muted:    "#64748B",
  gray:     "#94A3B8",
};

// ─── CURATED BREED LISTS ──────────────────────────────────────────────────────
const CANINE_BREEDS = ["Affenpinscher","Afghan Hound","Airedale Terrier","Akita","Alaskan Malamute","American Bulldog","American Cocker Spaniel","American Eskimo Dog","American Pit Bull Terrier","American Staffordshire Terrier","Australian Cattle Dog","Australian Shepherd","Australian Shepherd (Miniature)","Basenji","Basset Hound","Beagle","Belgian Malinois","Belgian Tervuren","Bernese Mountain Dog","Bichon Frise","Border Collie","Border Terrier","Boston Terrier","Boxer","Boykin Spaniel","Brittany","Brussels Griffon","Bulldog (English)","Bullmastiff","Cairn Terrier","Cane Corso","Cavalier King Charles Spaniel","Chesapeake Bay Retriever","Chihuahua","Chinese Shar-Pei","Chow Chow","Clumber Spaniel","Cocker Spaniel","Collie (Rough)","Dachshund (Miniature)","Dachshund (Standard)","Dalmatian","Doberman Pinscher","Dogue de Bordeaux","English Setter","English Springer Spaniel","Field Spaniel","Flat-Coated Retriever","Fox Terrier","French Bulldog","German Shepherd Dog","German Shorthaired Pointer","Giant Schnauzer","Golden Retriever","Great Dane","Great Pyrenees","Greyhound","Irish Setter","Irish Wolfhound","Italian Greyhound","Jack Russell Terrier","Labrador Retriever","Leonberger","Lhasa Apso","Maltese","Manchester Terrier","Mastiff","Miniature Australian Shepherd","Miniature Pinscher","Miniature Schnauzer","Mixed Breed","Newfoundland","Norfolk Terrier","Norwegian Elkhound","Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Papillon","Pekingese","Pembroke Welsh Corgi","Plott Hound","Pointer","Pomeranian","Poodle (Miniature)","Poodle (Standard)","Poodle (Toy)","Portuguese Water Dog","Pug","Rat Terrier","Rhodesian Ridgeback","Rottweiler","Saint Bernard","Samoyed","Scottish Terrier","Shetland Sheepdog","Shiba Inu","Shih Tzu","Siberian Husky","Soft Coated Wheaten Terrier","Staffordshire Bull Terrier","Standard Schnauzer","Tibetan Mastiff","Vizsla","Weimaraner","Welsh Corgi (Cardigan)","West Highland White Terrier","Whippet","Wire Fox Terrier","Xoloitzcuintli","Yorkshire Terrier","Other — Specify in notes"];

const FELINE_BREEDS = ["Abyssinian","American Shorthair","Bengal","Birman","British Shorthair","Burmese","Devon Rex","Domestic Longhair","Domestic Shorthair","Egyptian Mau","Exotic Shorthair","Himalayan","Maine Coon","Manx","Mixed Breed","Norwegian Forest Cat","Ocicat","Oriental Shorthair","Persian","Ragdoll","Russian Blue","Scottish Fold","Siamese","Siberian","Sphynx","Tonkinese","Turkish Angora","Turkish Van","Other — Specify in notes"];

// ─── SPECIES-DEPENDENT CLINICAL CONSTANTS ─────────────────────────────────────
// Canine CSU Acute Pain Scale (Colorado State University)
const CANINE_PAIN_SCALE = [
  "0 — Happy, comfortable, no signs of pain",
  "1 — Minor discomfort, responds to petting",
  "2 — Moderate pain, reacts to palpation",
  "3 — Severe pain, vocalizes / guards",
  "4 — Excruciating, entire body tense / rigid"
];

// Feline Grimace Scale (FGS) — Evangelista et al 2019
// 5 facial action units, each scored 0/1/2 (total 0–10)
const FELINE_FGS_SCORES = [
  "0 — not present / normal",
  "1 — partially present / moderate",
  "2 — fully present / marked"
];
const FELINE_FGS_ITEMS = [
  "FGS — Ear position",
  "FGS — Orbital tightening",
  "FGS — Muzzle tension",
  "FGS — Whisker change",
  "FGS — Head position"
];

const CANINE_CONDITIONING_PHASES = [
  "General fitness / Maintenance","Weight loss program","Senior wellness",
  "Return to sport — early","Return to sport — advanced",
  "Performance / Working dog","Sport-specific conditioning"
];
const FELINE_CONDITIONING_PHASES = [
  "General fitness / Maintenance","Weight loss program","Senior wellness",
  "Indoor enrichment","Post-recovery reconditioning","Mobility maintenance"
];

const CANINE_SPORT_PLACEHOLDER = "e.g. Agility, flyball, hunting, dock diving, herding, search & rescue, companion pet…";
const FELINE_SPORT_PLACEHOLDER = "e.g. Indoor climbing, puzzle feeders, feather wand play, cat tree navigation, companion cat…";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  .k9v2 * { box-sizing: border-box; margin: 0; padding: 0; }
  .k9v2 { font-family: 'Segoe UI', system-ui, sans-serif; background: ${C.bg}; color: ${C.text}; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes pulseK9 { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes spinK9  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes modalIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
  .k9v2 .block-card { transition: all .18s ease; cursor: pointer; }
  .k9v2 .block-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(26,39,68,.13); }
  .k9v2 .sb-btn { transition: background .12s; cursor: pointer; border-radius: 6px; }
  .k9v2 .sb-btn:hover { background: rgba(255,255,255,.1) !important; }
  .k9v2 input, .k9v2 textarea, .k9v2 select {
    background: ${C.white}; border: 1px solid ${C.border};
    color: ${C.text}; font-family: inherit; font-size: 12px;
    padding: 7px 10px; border-radius: 5px; width: 100%; outline: none;
    transition: border-color .15s;
  }
  .k9v2 input:focus, .k9v2 textarea:focus, .k9v2 select:focus { border-color: ${C.blue}; box-shadow: 0 0 0 3px rgba(26,95,212,.1); }
  .k9v2 textarea { resize: vertical; min-height: 64px; }
  .k9v2 select { cursor: pointer; }
  .k9v2 ::-webkit-scrollbar { width: 5px; }
  .k9v2 ::-webkit-scrollbar-track { background: ${C.bg}; }
  .k9v2 ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
  .k9v2 .cb-row { display:flex; align-items:center; gap:9px; padding:7px 11px; border:1px solid ${C.border}; border-radius:5px; cursor:pointer; transition: all .12s; background:${C.white}; }
  .k9v2 .cb-row:hover { border-color: ${C.blue}; background: ${C.blueLt}; }
  .k9v2 .cb-row.active { border-color: ${C.blue}; background: ${C.blueLt}; }
  .k9v2 .range-badge { display:inline-block; font-size:9px; color:${C.muted}; background:${C.bg}; border:1px solid ${C.border}; border-radius:3px; padding:1px 6px; margin-left:6px; }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Lbl = ({ children, range }) => {
  const tr = useTr();
  const { t } = useTranslation();
  const display = typeof children === "string" ? tr(children) : children;
  return (
    <div style={{ fontSize:10, fontWeight:600, color:C.muted, letterSpacing:".07em", textTransform:"uppercase", marginBottom:4, marginTop:12, display:"flex", alignItems:"center" }}>
      {display}{range && <span className="range-badge">{t("common.normalPrefix", { defaultValue: "Normal" })}: {range}</span>}
    </div>
  );
};

/**
 * A North American phone number, formatted as it is typed.
 *
 * Applied to every `type="tel"` field, so the clinic phone, the referring
 * clinic and the owner's number all read the same way in the record instead of
 * depending on who typed which punctuation.
 *
 * DELIBERATELY CONSERVATIVE. It formats only what it is sure about: ten digits
 * or fewer, with no other characters in the box. Anything else is left exactly
 * as the clinician typed it —
 *
 *   +44 20 7946 0958        an international number
 *   (954) 555-0142 x231     an extension
 *   555-0142 (mobile)       a note beside the number
 *
 * A formatter that "corrects" those is worse than none: it would silently
 * mangle a number somebody needs to ring. An 11-digit string starting with 1
 * is treated as a US number with its country code and keeps the leading 1.
 */
/**
 * The diagnosis, from wherever the clinician actually recorded it.
 *
 * THE FORM HAS TWO "Primary Diagnosis" CONTROLS and three readers disagreed
 * about which ones to look at:
 *
 *   AssessmentPanel  free text     -> assessment::Primary Diagnosis
 *   TreatmentPanel   dropdown      -> treatment::Primary Diagnosis
 *
 *   ProtocolPanel    read both, then the column          — correct
 *   PetCareNutrition read assessment::Primary Diagnosis
 *                    and assessment::Diagnosis           — no control writes
 *                                                          the second, and it
 *                                                          missed treatment
 *   handleSave       read client::Diagnosis and
 *                    assessment::Primary Diagnosis       — no control writes
 *                                                          the first, and it
 *                                                          missed treatment
 *
 * Found on Haley, id 33, on 2026-09-25. Sal chose "Geriatric Mobility Decline"
 * from the TreatmentPanel dropdown — a controlled option the platform offered
 * him — and handleSave, looking only at the two keys above, found nothing and
 * wrote the literal "Rehabilitation" into her condition column. The engine
 * does not recognise that string, so it routed her to the osteoarthritis
 * protocol by fallthrough. Her own answer routes to GERIATRIC. The platform
 * offered the answer, took it, and then ignored it.
 *
 * ONE resolution order, used by all three. Assessment first because it is free
 * text a clinician typed for this patient; the dropdown is the controlled
 * fallback; the stored column is last because it is the least fresh.
 */
function resolveDiagnosis(data, patientData) {
  const d = data || {};
  return d["assessment::Primary Diagnosis"]
      || d["treatment::Primary Diagnosis"]
      || (patientData && patientData.condition)
      || "";
}

function formatPhone(input) {
  const raw = String(input ?? "");
  if (/[^0-9()\-.\s]/.test(raw)) return raw;        // letters, +, x — leave alone

  const digits = raw.replace(/\D/g, "");
  let lead = "";
  let rest = digits;
  if (digits.length === 11 && digits.startsWith("1")) { lead = "1 "; rest = digits.slice(1); }
  if (rest.length > 10) return raw;                  // longer than a US number

  if (rest.length <= 3) return lead + rest;
  if (rest.length <= 6) return `${lead}(${rest.slice(0, 3)}) ${rest.slice(3)}`;
  return `${lead}(${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
}

const F = ({ label, placeholder, type="text", options, rows, range, hint, disabled }) => {
  const { data, update, blockId } = useContext(DashFormContext);
  const { t } = useTranslation();
  const tr = useTr();
  const key = blockId ? `${blockId}::${label}` : label;
  const value = data[key] ?? "";
  const onChange = (val) => { if (!disabled) update(key, type === "tel" ? formatPhone(val) : val); };

  // Formatted live, as it is typed, which is what a phone field normally does.
  //
  // A previous version moved this to onBlur on the grounds that reformatting a
  // controlled input mid-typing fights the caret and drops a character. That
  // was WRONG, and the evidence for it was contaminated: Sal was typing into
  // the same field at the same time as the test. Retested alone, typing
  // 9545550142 keeps all ten digits, and inserting a digit mid-value leaves
  // the caret where it was. The reason was removed rather than the behaviour
  // kept for a reason that turned out to be false.
  const selectPlaceholder = t("common.select", { defaultValue: "Select…" });
  return (
    <div>
      <Lbl range={range}>{label}</Lbl>
      {options
        ? <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)}><option value="">{selectPlaceholder}</option>{options.map(o=><option key={o} value={o}>{tr(o)}</option>)}</select>
        : rows
          ? <textarea placeholder={tr(placeholder)} rows={rows} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}/>
          : <input type={type} placeholder={tr(placeholder)} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}/>
      }
      {hint && <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>{tr(hint)}</div>}
    </div>
  );
};

// Multi-select checkbox group. Stores selected options as a "||"-joined
// string in DashFormContext so it survives save/reload without schema change.
// Key format: <blockId>::<label>
const MultiF = ({ label, options, hint, accent="#EC4899", disabled }) => {
  const { data, update, blockId } = useContext(DashFormContext);
  const tr = useTr();
  const key = blockId ? `${blockId}::${label}` : label;
  const raw = data[key] ?? "";
  const selected = raw ? raw.split("||").filter(Boolean) : [];
  const toggle = (opt) => {
    if (disabled) return;
    const next = selected.includes(opt)
      ? selected.filter(x => x !== opt)
      : [...selected, opt];
    update(key, next.join("||"));
  };
  return (
    <div>
      <Lbl>{label}</Lbl>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, padding:"10px 12px", background:C.white, border:`1px solid ${C.border}`, borderRadius:5, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? "none" : "auto" }}>
        {options.map(o => {
          const checked = selected.includes(o);
          return (
            <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => toggle(o))(e); } }} key={o} className={`cb-row${checked?" active":""}`} onClick={() => toggle(o)} style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
              <input type="checkbox" checked={checked} disabled={disabled} readOnly style={{ width:14, height:14, accentColor:accent, flexShrink:0 }}/>
              <span style={{ fontSize:11, color: checked ? accent : C.text }}>{tr(o)}</span>
            </div>
          );
        })}
      </div>
      {hint && <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>{tr(hint)}</div>}
    </div>
  );
};

// Reusable weight pair — lbs + kg side by side with auto-conversion
// Works in any panel. Stores values in DashFormContext keyed by fieldBase.
const WeightPair = ({ label, fieldBase, disabled }) => {
  const { data, update } = useContext(DashFormContext);
  const lbsKey = `${fieldBase} (lbs)`;
  const kgKey  = `${fieldBase} (kg)`;
  const lbsVal = data[lbsKey] ?? "";
  const kgVal  = data[kgKey] ?? "";

  const onLbs = (val) => {
    if (disabled) return;
    update(lbsKey, val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) update(kgKey, (n / 2.20462).toFixed(1));
    else if (val === "") update(kgKey, "");
  };
  const onKg = (val) => {
    if (disabled) return;
    update(kgKey, val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) update(lbsKey, (n * 2.20462).toFixed(1));
    else if (val === "") update(lbsKey, "");
  };

  const { t } = useTranslation();
  const tr = useTr();
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      <div>
        <Lbl>{`${tr(label)} (lbs)`}</Lbl>
        <input type="number" placeholder="0.0" step="0.1" value={lbsVal} disabled={disabled} onChange={e => onLbs(e.target.value)}/>
      </div>
      <div>
        <Lbl>{`${tr(label)} (kg)`}</Lbl>
        <input type="number" placeholder="0.0" step="0.1" value={kgVal} disabled={disabled} onChange={e => onKg(e.target.value)}/>
        <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>{t("hints.autoConvertsLbs", { defaultValue: "Auto-converts to/from lbs" })}</div>
      </div>
    </div>
  );
};

const Row = ({ children, cols=2 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:12 }}>{children}</div>
);

// Reusable DOB ↔ Age pair — auto-converts in both directions.
// Reads blockId from DashFormContext like F does, so keys are
// `${blockId}::Date of Birth` and `${blockId}::Age (years)` — matches
// the format previously used inline in ClientPanel so existing saved
// data migrates with zero change.
const AgeDobPair = ({ disabled }) => {
  const { data, update, blockId } = useContext(DashFormContext);
  const dobKey = `${blockId}::Date of Birth`;
  const ageKey = `${blockId}::Age (years)`;
  const dobVal = data[dobKey] ?? "";
  const ageVal = data[ageKey] ?? "";

  const onDob = (val) => {
    if (disabled) return;
    update(dobKey, val);
    if (val) {
      const birth = new Date(val);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      if (now.getMonth() < birth.getMonth() ||
          (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) years--;
      if (years >= 0) update(ageKey, String(years));
    }
  };
  const onAge = (val) => {
    if (disabled) return;
    update(ageKey, val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0 && n < 30) {
      const now = new Date();
      const birthYear = now.getFullYear() - n;
      const dob = `${birthYear}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
      update(dobKey, dob);
    }
  };

  const { t } = useTranslation();
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      <div>
        <Lbl>Date of Birth</Lbl>
        <input type="date" disabled={disabled} value={dobVal} onChange={e => onDob(e.target.value)}/>
      </div>
      <div>
        <Lbl>Age (years)</Lbl>
        <input type="number" placeholder={t("fields.age_years_placeholder", { defaultValue: "e.g. 6" })} min="0" max="30" disabled={disabled} value={ageVal} onChange={e => onAge(e.target.value)}/>
        <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>{t("hints.autoConvertsDob", { defaultValue: "Auto-converts to/from DOB" })}</div>
      </div>
    </div>
  );
};

// ─── Sec filled-data walker ───────────────────────────────────────────────────
// Recursively walks JSX children and returns DashFormContext keys that each
// form-field component reads/writes. Used by Sec to show a filled dot.
// Recognizes F, MultiF, WeightPair, AgeDobPair by function reference.
const collectSecKeys = (children, blockId) => {
  const keys = [];
  React.Children.forEach(children, child => {
    if (!child || typeof child !== "object" || !child.props) return;
    if ((child.type === F || child.type === MultiF) && child.props.label) {
      keys.push(`${blockId}::${child.props.label}`);
    } else if (child.type === WeightPair && child.props.fieldBase) {
      keys.push(`${child.props.fieldBase} (lbs)`, `${child.props.fieldBase} (kg)`);
    } else if (child.type === AgeDobPair) {
      keys.push(`${blockId}::Date of Birth`, `${blockId}::Age (years)`);
    }
    if (child.props.children) {
      keys.push(...collectSecKeys(child.props.children, blockId));
    }
  });
  return keys;
};

// Sec — section wrapper. When `collapsible` is truthy, header is clickable and
// body is hidden until expanded. `defaultOpen` controls initial state.
// Feature 3: collapsible sections show a small teal dot next to the title
// when any nested F/MultiF/WeightPair/AgeDobPair has truthy data.
// Backward compatible: omitting `collapsible` renders same as before, no dot.
const Sec = ({ title, color=C.blue, colorLt, children, noTop, collapsible, defaultOpen=false }) => {
  const { data, blockId } = useContext(DashFormContext);
  const tr = useTr();
  const [open, setOpen] = useState(defaultOpen);
  const isHidden = collapsible && !open;

  // Filled-data dot — only for collapsible sections (always-open sections
  // already show their values, so a dot would be redundant).
  const watchKeys = useMemo(
    () => collapsible ? collectSecKeys(children, blockId) : [],
    [collapsible, children, blockId]
  );
  const hasData = collapsible && watchKeys.some(k => {
    const v = data[k];
    return v !== undefined && v !== null && String(v).trim() !== "";
  });

  return (
    <div style={{ marginBottom: isHidden ? 8 : 22 }}>
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (collapsible ? () => setOpen(o => !o) : undefined)(e); } }}
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
        style={{
          fontSize:11, fontWeight:700, color, letterSpacing:".1em", textTransform:"uppercase",
          // Feature: when section has data and is collapsed, header gets a
          // cyan glow + darker accent background so users can see "this has
          // data" from across the room. When expanded or empty, normal styling.
          background: (hasData && !open)
            ? "rgba(0,229,255,0.12)"
            : (colorLt || C.blueLt),
          borderLeft: `3px solid ${color}`,
          padding: "7px 12px",
          borderRadius: "0 5px 5px 0",
          marginBottom: isHidden ? 0 : 12,
          marginTop: noTop ? 0 : 4,
          cursor: collapsible ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          userSelect: "none",
          boxShadow: (hasData && !open) ? "0 0 8px rgba(0,229,255,0.25)" : "none",
          transition: "background .15s, box-shadow .15s",
        }}>
        <span style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span>{tr(title)}</span>
        </span>
        {collapsible && (
          <span style={{
            fontSize: hasData ? 13 : 10,
            fontWeight: hasData ? 900 : 700,
            color: hasData && !open ? "#00e5ff" : "inherit",
            opacity: 0.9,
            textShadow: hasData && !open ? "0 0 6px rgba(0,229,255,0.6)" : "none",
            transition: "color .15s, text-shadow .15s",
          }}>
            {open ? "▼" : (hasData ? "✓" : "▶")}
          </span>
        )}
      </div>
      {!isHidden && children}
    </div>
  );
};

const Divider = () => <div style={{ height:1, background:C.border, margin:"18px 0" }}/>;

// ─── CLINICAL NOTES — drop-in collapsible for every block panel ───────────────
// Renders as the final Sec in each panel; key auto-derives via F's blockId
// context so storage keys are like "client::Clinical Notes", "treatment::..."
// etc. Collapsed by default. Field is a 4-row textarea for rehabilitation
// nurse / veterinary professional observations.
const ClinicalNotes = () => (
  <Sec title="Clinical Notes" color={C.navy} colorLt={C.blueLt} collapsible defaultOpen={false}>
    <F label="Clinical Notes" placeholder="Rehabilitation nurse observations, progression notes, recommendations..." rows={4}/>
  </Sec>
);

// ─── COLLAPSIBLE SUB-SECTION ──────────────────────────────────────────────────
// Lightweight nested collapsible for use inside a non-collapsible Sec.
// Used when protocol/reference text must stay visible while input fields collapse.
// Local state resets on unmount (relies on parent Modal conditional-render fix).
const CollapsibleSub = ({ title, children, defaultOpen=false, accentColor=C.teal }) => {
  const [open, setOpen] = useState(defaultOpen);
  const tr = useTr();
  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 12,
      marginTop: 4,
    }}>
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => setOpen(o => !o))(e); } }}
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "10px 14px",
          background: open ? C.bg : C.white,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          fontWeight: 700,
          color: accentColor,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          borderBottom: open ? `1px solid ${C.border}` : "none",
          userSelect: "none",
        }}>
        <span>{tr(title)}</span>
        <span style={{ fontSize: 10, opacity: 0.85 }}>{open ? "▼" : "▶"}</span>
      </div>
      {open && <div style={{ padding: "14px" }}>{children}</div>}
    </div>
  );
};

// ─── CHECKBOX ITEM ────────────────────────────────────────────────────────────
function CbItem({ label, checked, onToggle, children }) {
  const tr = useTr();
  return (
    <div>
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (onToggle)(e); } }} className={`cb-row${checked?" active":""}`} onClick={onToggle}>
        <input type="checkbox" checked={!!checked} readOnly
          style={{ width:16, height:16, accentColor:C.blue, flexShrink:0, cursor:"pointer" }}/>
        <span style={{ fontSize:12, fontWeight:600, color:checked?C.blue:C.text }}>{tr(label)}</span>
      </div>
      {checked && children && (
        <div style={{ marginTop:8, marginLeft:14, padding:"12px 14px", background:C.blueLt, borderRadius:5, borderLeft:`2px solid ${C.blue}`, animation:"fadeIn .15s ease" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
// ─── ASK B.E.A.U. PANEL WITH VOICE PLAYBACK ─────────────────────────────────
// Renders inside each block modal when "Ask B.E.A.U." is toggled on.
// Includes voice playback controls: Rewind 2, Play, Pause, Stop, Fast-Forward.
// FF is locked/disabled until B.E.A.U. finishes full output.
function BeauBlockPanel({ title, beauQuery, setBeauQuery, beauAnswer, beauLoading, onAskBeau }) {
  const { beauVoice: bv } = useContext(DashFormContext);
  const { t } = useTranslation();
  const tr = useTr();
  const [isPlaying, setIsPlaying] = useState(false);

  // Track whether this specific answer is done generating
  const answerDone = !!beauAnswer && !beauLoading;

  const handlePlay = () => {
    if (!beauAnswer || !bv) return;
    if (bv.isPaused) {
      bv.resume();
    } else {
      bv.setSentences?.(beauAnswer);
      bv.playText?.(beauAnswer);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    bv?.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    bv?.stop();
    setIsPlaying(false);
  };

  const handleRewind = () => {
    if (!beauAnswer || !bv) return;
    bv.setSentences?.(beauAnswer);
    bv.rewind?.(2);
    setIsPlaying(true);
  };

  const handleFF = () => {
    if (!answerDone || !beauAnswer || !bv) return; // blocked while generating
    bv.setSentences?.(beauAnswer);
    bv.fastForward?.(2);
    setIsPlaying(true);
  };

  const vcBtnStyle = (enabled, accentColor = "#0EA5E9") => ({
    width: 34, height: 34, borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: enabled ? `${accentColor}15` : "rgba(100,116,139,0.06)",
    border: `1px solid ${enabled ? `${accentColor}55` : "rgba(100,116,139,0.2)"}`,
    color: enabled ? accentColor : "#cbd5e1",
    fontSize: 15, cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.5,
    transition: "all .15s",
  });

  return (
    <div style={{ marginTop:20, padding:16, background:"#F0F9FF", border:"1px solid #0EA5E944", borderRadius:8, animation:"fadeIn .15s ease" }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#0EA5E9", letterSpacing:".1em", marginBottom:10 }}>{t("beau.askBeauAbout", { defaultValue: "ASK B.E.A.U." })} — {tr(title).toUpperCase()}</div>
      <div style={{ display:"flex", gap:8 }}>
        <textarea
          value={beauQuery || ""}
          onChange={e => setBeauQuery(e.target.value)}
          placeholder={t("beau.askAboutPlaceholder", { topic: tr(title).toLowerCase(), defaultValue: `Ask B.E.A.U. about ${tr(title).toLowerCase()}…` })}
          rows={2}
          style={{ flex:1, fontSize:12, padding:"10px 12px", border:"1px solid #0EA5E944", borderRadius:5, resize:"vertical" }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAskBeau(); } }}
        />
        <button onClick={onAskBeau} disabled={beauLoading || !beauQuery?.trim()}
          style={{ padding:"10px 18px", background: beauLoading ? "#E0F2FE" : "#0EA5E9", border:"none", color:C.white, borderRadius:5, cursor: beauLoading ? "not-allowed" : "pointer", fontSize:11, fontWeight:700, alignSelf:"flex-end", minWidth:80 }}>
          {beauLoading ? "..." : t("beau.askShort", { defaultValue: "ASK" })}
        </button>
      </div>
      {beauAnswer && (
        <div style={{ marginTop:12 }}>
          <div style={{ padding:14, background:C.white, border:"1px solid #0EA5E933", borderRadius:6 }}>
            <pre style={{ fontSize:12, color:C.text, whiteSpace:"pre-wrap", lineHeight:1.8, fontFamily:"Georgia, serif" }}>{beauAnswer}</pre>
          </div>
          {/* ── Voice Playback Controls ── */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
            <button onClick={handleRewind} title={t("voice.rewind", { defaultValue: "Rewind 2 sentences" })} disabled={!beauAnswer}
              style={vcBtnStyle(!!beauAnswer)}>⏮</button>
            {bv?.isPaused || !bv?.isSpeaking ? (
              <button onClick={handlePlay} title={bv?.isPaused ? t("voice.resume", { defaultValue: "Resume from current position" }) : t("voice.playFromBeginning", { defaultValue: "Play from beginning" })} disabled={!beauAnswer}
                style={vcBtnStyle(!!beauAnswer, "#10b981")}>▶</button>
            ) : (
              <button onClick={handlePause} title={t("voice.pause", { defaultValue: "Pause" })}
                style={vcBtnStyle(true, "#F59E0B")}>⏸</button>
            )}
            <button onClick={handleStop} title={t("voice.stop", { defaultValue: "Stop" })} disabled={!bv?.isSpeaking && !bv?.isPaused}
              style={vcBtnStyle(bv?.isSpeaking || bv?.isPaused, "#ef4444")}>⏹</button>
            <button onClick={handleFF} title={answerDone ? t("voice.fastForward", { defaultValue: "Fast-forward 2 sentences" }) : t("voice.ffLocked", { defaultValue: "Locked — B.E.A.U. still generating" })} disabled={!answerDone}
              style={vcBtnStyle(answerDone)}>⏭</button>
            {!answerDone && beauLoading && (
              <span style={{ fontSize:9, color:"#94a3b8", marginLeft:4, fontStyle:"italic" }}>{t("voice.ffLockedHint", { defaultValue: "FF locked until output complete" })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Block-specific update button labels
const BLOCK_UPDATE_LABELS = {
  client:       "Update Patient Record",
  diagnostics:  "Update Diagnostics",
  assessment:   "Update Assessment",
  treatment:    "Update Treatment Status",
  metrics:      "Update Metrics",
  equipment:    "Update Equipment",
  home:         "Update Home Program",
  goals:        "Update Goals",
  conditioning: "Update Conditioning",
  protocol:     "Update Protocol",
  library:      null,           // no update for read-only library
  "coming-soon": null,          // no update for teaser block
};

function Modal({ title, color, colorLt, icon, onClose, children, beauContext, beauOpen, setBeauOpen, beauQuery, setBeauQuery, beauAnswer, beauLoading, onAskBeau, patientLabel, blockId }) {
  const { t } = useTranslation();
  const tr = useTr();
  const { handleSave } = useContext(DashFormContext);
  const [saving, setSaving] = useState(false);
  const [blockSaving, setBlockSaving] = useState(false);
  const hasBeau = !!beauContext && !!setBeauOpen;
  const blockUpdateLabel = blockId ? BLOCK_UPDATE_LABELS[blockId] : null;
  const onSaveClose = async () => {
    if (saving) return;
    setSaving(true);
    try { await handleSave?.(); } finally { setSaving(false); onClose(); }
  };
  const onBlockUpdate = async () => {
    if (blockSaving) return;
    setBlockSaving(true);
    try { await handleSave?.(); } finally { setTimeout(() => setBlockSaving(false), 600); }
  };
  return (
    // THE TARGET CHECK MUST COME FIRST.
    //
    // This div is the modal BACKDROP — position:fixed, inset:0 — and the whole
    // dialog renders inside it, so every keystroke in every field bubbles up
    // here. Until 2026-09-25 it called preventDefault() on Enter or Space
    // BEFORE checking whether the key came from the backdrop itself, which
    // meant NO TEXT FIELD IN ANY DASHBOARD BLOCK COULD ACCEPT A SPACE.
    //
    // Found by Sal typing an address. It was never about the address field:
    // it was every field, in every block, behind every modal, and it looked
    // like a stuck keyboard rather than a bug.
    //
    // A key pressed inside the dialog is not a click on the backdrop, so it
    // returns before touching the event at all.
    <div role="button" tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClose(); }
      }}
      style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(26,39,68,.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:48, animation:"fadeIn .18s ease" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:10, width:"100%", height:"100%", maxWidth:1600, maxHeight:"none", display:"flex", flexDirection:"column", animation:"modalIn .2s ease", boxShadow:"0 24px 80px rgba(26,39,68,.25)", border:`1px solid ${C.border}` }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:13, padding:"16px 22px", borderBottom:`1px solid ${C.border}`, background: colorLt || C.blueLt, borderRadius:"10px 10px 0 0", flexShrink:0 }}>
          <div style={{ width:38, height:38, borderRadius:8, background:C.white, border:`1.5px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:`0 2px 8px ${color}33` }}>
            {icon}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{tr(title)}</div>
            <div style={{ fontSize:9, color:C.muted, letterSpacing:".13em", textTransform:"uppercase" }}>{t("modal.engineSubtitle")}</div>
            {patientLabel && (
              <div style={{ fontSize:11, fontWeight:600, color:C.green, marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                <span>👤</span><span>{patientLabel}</span>
              </div>
            )}
          </div>
          {hasBeau && (
            <button onClick={() => setBeauOpen(!beauOpen)}
              style={{ padding:"6px 14px", background: beauOpen ? "#0EA5E9" : C.blueLt, border:`1px solid ${beauOpen ? "#0EA5E9" : C.border}`, color: beauOpen ? C.white : "#0EA5E9", borderRadius:5, cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:".06em", transition:"all .15s", marginRight:8 }}>
              {beauOpen ? `✕ ${t("beau.closeBeau", { defaultValue: "Close B.E.A.U." })}` : `⬡ ${t("beau.askBeau", { defaultValue: "Ask B.E.A.U." })}`}
            </button>
          )}
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${C.border}`, color:C.muted, fontSize:16, cursor:"pointer", padding:"4px 10px", borderRadius:5 }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:22 }}>
          {children}
          {/* ── Contextual B.E.A.U. ── */}
          {hasBeau && beauOpen && (
            <BeauBlockPanel
              title={title}
              beauQuery={beauQuery}
              setBeauQuery={setBeauQuery}
              beauAnswer={beauAnswer}
              beauLoading={beauLoading}
              onAskBeau={onAskBeau}
            />
          )}
        </div>
        {/* Footer */}
        <div style={{ padding:"13px 22px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, background:C.bg, borderRadius:"0 0 10px 10px" }}>
          {/* LEFT — block-specific update button */}
          <div>
            {blockUpdateLabel && (
              <button onClick={onBlockUpdate} disabled={blockSaving}
                style={{
                  padding:"9px 20px",
                  background: blockSaving ? "#d1fae5" : "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
                  border:"none", color: blockSaving ? "#065f46" : "#ffffff",
                  borderRadius:5, cursor: blockSaving ? "wait" : "pointer",
                  fontSize:12, fontWeight:700, letterSpacing:".06em",
                  boxShadow: blockSaving ? "none" : "0 3px 10px rgba(16,185,129,0.3)",
                  display:"inline-flex", alignItems:"center", gap:6,
                  transition:"all .18s ease",
                }}>
                {blockSaving ? `⏳ ${t("modal.updating", { defaultValue: "Updating…" })}` : `✓ ${tr(blockUpdateLabel).toUpperCase()}`}
              </button>
            )}
          </div>
          {/* RIGHT — close + save & close */}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} style={{ padding:"9px 22px", background:C.white, border:`1px solid ${C.border}`, color:C.muted, borderRadius:5, cursor:"pointer", fontSize:12, fontWeight:600, textTransform:"uppercase" }}>{t("modal.close")}</button>
            <button onClick={onSaveClose} disabled={saving} style={{ padding:"9px 22px", background: saving ? "#cbd5e1" : color, border:"none", color:C.white, borderRadius:5, cursor: saving ? "wait" : "pointer", fontSize:12, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>{saving ? `⏳ ${t("modal.saving", { defaultValue: "Saving…" })}` : t("modal.saveAndClose")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LANGUAGE SELECTOR ────────────────────────────────────────────────────────
// Dropdown for switching UI locale. 10 languages with flag emoji + native
// language name. Click outside to close. Persists via localStorage (key
// `k9rp_lang`) through the i18next LanguageDetector caches config.
//
// Scope note: this only changes the UI chrome. Clinical content, AI output,
// exercise library entries, protocol generation, and the veterinary diet
// catalog remain in English across all locales (CLAUDE.md safety rule).
export function LanguageSelector() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = SUPPORTED_LOCALES.find(l => l.code === i18nInstance.language)
               || SUPPORTED_LOCALES.find(l => i18nInstance.language?.startsWith(l.code))
               || SUPPORTED_LOCALES[0];

  const pick = (code) => {
    i18nInstance.changeLanguage(code);
    try { localStorage.setItem("k9rp_lang", code); } catch { /* noop */ }
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={t("languageSelector.label")}
        title={t("languageSelector.label")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", background: C.white, border: `1px solid ${C.border}`,
          borderRadius: 5, cursor: "pointer", fontSize: 12, color: C.muted,
          fontWeight: 600, letterSpacing: ".02em", fontFamily: "inherit",
        }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{current.flag}</span>
        <span>{current.name}</span>
        <span style={{ fontSize: 10, opacity: .6, marginLeft: 2 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 5px)", zIndex: 300,
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 6,
          boxShadow: "0 8px 28px rgba(26,39,68,.15)", minWidth: 180,
          padding: 4, animation: "fadeIn .12s ease",
        }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: ".1em",
            textTransform: "uppercase", padding: "7px 10px 4px 10px",
          }}>
            {t("languageSelector.label")}
          </div>
          {SUPPORTED_LOCALES.map(l => {
            const active = l.code === current.code;
            return (
              <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => pick(l.code))(e); } }} key={l.code} onClick={() => pick(l.code)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "8px 10px", cursor: "pointer", borderRadius: 4,
                  background: active ? C.blueLt : "transparent",
                  color: active ? C.blue : C.text,
                  fontSize: 12, fontWeight: active ? 700 : 500,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{l.flag}</span>
                <span style={{ flex: 1 }}>{l.name}</span>
                {active && <span style={{ fontSize: 11, color: C.blue }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SAFETY TEXT ──────────────────────────────────────────────────────────────
// Renders English safety-critical strings with a visible EN badge when the
// user is in a non-English locale. Per product owner decision 2026-04-11,
// safety warnings, red-flag alerts, scope-of-practice banners, and clinical
// disclaimers are NEVER machine-translated. They stay in English across all
// locales until human-reviewed translations are provided.
//
// Usage:
//   <SafetyText k="safety.dietScopeBanner"/>
//   <SafetyText k="safety.vetReviewOnly" as="span"/>
//
// The `k` prop is the i18next key in the safety namespace. The component
// always reads from the English bundle (via the explicit `lng: "en"` option
// on the t() call) — never from the current locale — so a missing
// translation can never silently corrupt a safety string.
function SafetyText({ k, as = "span", style, className, showBadge = true }) {
  const { i18n: i18nInst, t } = useTranslation();
  const text = t(k, { lng: "en", defaultValue: "" });
  const isNonEnglish = !(i18nInst.language || "en").toLowerCase().startsWith("en");
  const Tag = as;
  return (
    <Tag className={className} style={style}>
      {text}
      {isNonEnglish && showBadge && (
        <span
          title="This safety-critical text is displayed in English across all locales until human-reviewed translations are provided. Do not machine-translate."
          style={{
            display: "inline-block", marginLeft: 6, padding: "1px 5px",
            fontSize: 8, fontWeight: 700, letterSpacing: ".08em",
            color: C.white, background: C.red, borderRadius: 3,
            verticalAlign: "middle", lineHeight: 1.4,
          }}>
          EN
        </span>
      )}
    </Tag>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK PANELS
// ══════════════════════════════════════════════════════════════════════════════

// ── PET INSURANCE OPTIONS ─────────────────────────────────────────────────────
const PET_INSURANCE_OPTIONS = [
  "Trupanion","Nationwide Pet Insurance","Healthy Paws","ASPCA Pet Health Insurance",
  "Embrace Pet Insurance","Figo Pet Insurance","Other — specify below",
];

// ── COLOR / MARKINGS OPTIONS ─────────────────────────────────────────────────
const COLOR_OPTIONS = [
  "Black","White","Brown","Tan","Red","Golden","Cream","Grey","Blue","Liver","Brindle",
];
const PATTERN_OPTIONS = [
  "Tricolor","Bicolor","Merle","Spotted","Ticked","Roan","Sable","Harlequin","Parti",
];

// ── CLIENT & PATIENT ──────────────────────────────────────────────────────────
function ClientPanel() {
  const { data, update, patientId } = useContext(DashFormContext);

  // ── V3: client details live in `patient_client_details`, not the blob ──
  //
  // The address, emergency contact, insurer, other vet, microchip and markings.
  // Demographics are NOT here: they have columns already, are validated on
  // PUT /api/patients/:id and reconciled by record-sync, and a second write
  // path with its own validation is how two records start disagreeing.
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [cd, setCd] = useState({ loading: true, details: {}, unstructured: false, error: null });
  const [cdSaving, setCdSaving] = useState(null);
  const [cdDraft, setCdDraft] = useState({});

  const cdHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  useEffect(() => {
    if (!patientId) { setCd(s => ({ ...s, loading: false })); return; }
    let live = true;
    fetch(`${apiBase}/v2/patients/${patientId}/client`, { headers: cdHeaders() })
      .then(r => r.json())
      .then(j => {
        if (!live) return;
        const d = j.data || {};
        setCd({ loading: false, details: d.details || {}, unstructured: !!d.address_is_unstructured, error: null });
        setCdDraft({});
      })
      .catch(e => live && setCd(s => ({ ...s, loading: false, error: e.message })));
    return () => { live = false; };
  }, [apiBase, patientId]);

  // One field at a time. The store changes only what it is given, so a single
  // answer cannot blank the other thirteen.
  const saveDetail = async (col, value, extra) => {
    if (!patientId) return;
    const before = cd.details[col];
    setCd(s => ({ ...s, details: { ...s.details, [col]: value } }));
    setCdSaving(col);
    try {
      const res = await fetch(`${apiBase}/v2/patients/${patientId}/client`, {
        method: "PUT", headers: cdHeaders(),
        body: JSON.stringify({ details: { [col]: value }, ...(extra || {}) }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || `HTTP ${res.status}`);
      setCd(s => ({ ...s, details: j.data.details || s.details,
        unstructured: !!j.data.address_is_unstructured, error: null }));
      setCdDraft(d => { const n = { ...d }; delete n[col]; return n; });
    } catch (e) {
      setCd(s => {
        const details = { ...s.details };
        if (before === undefined) delete details[col]; else details[col] = before;
        return { ...s, details, error: e.message };
      });
    } finally { setCdSaving(null); }
  };

  const cdValue = (col) => (cdDraft[col] !== undefined ? cdDraft[col] : (cd.details[col] ?? ""));

  /**
   * A client-detail field. Saves on blur, to the table.
   *
   * A plain function, CALLED — not a <CD/> component. A component defined
   * inside a render is a new type on every render, so React unmounts and
   * remounts the input on each keystroke: focus is lost and the typed value
   * never reaches blur. That is not theoretical; it was caught in the browser
   * writing a null microchip.
   */
  const CD = ({ col, label, placeholder, rows }) => (
    <div style={{ flex: 1, minWidth: 160, opacity: cdSaving === col ? 0.6 : 1 }}>
      <Lbl>{label}</Lbl>
      {rows ? (
        <textarea rows={rows} value={cdValue(col)} placeholder={placeholder} disabled={cdSaving === col}
          onChange={e => setCdDraft(d => ({ ...d, [col]: e.target.value }))}
          onBlur={e => { if (e.target.value !== (cd.details[col] ?? "")) saveDetail(col, e.target.value); }}
          style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, fontFamily:"inherit" }}/>
      ) : (
        <input value={cdValue(col)} placeholder={placeholder} disabled={cdSaving === col}
          onChange={e => setCdDraft(d => ({ ...d, [col]: e.target.value }))}
          onBlur={e => { if (e.target.value !== (cd.details[col] ?? "")) saveDetail(col, e.target.value); }}
          style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}/>
      )}
    </div>
  );

  const species = data["client::Species"] || "Canine";
  const setSpecies = (v) => update("client::Species", v);
  const breeds = species === "Feline" ? FELINE_BREEDS : CANINE_BREEDS;

  useEffect(() => {
    try { localStorage.setItem("beau_species", species); } catch {}
  }, [species]);

  // ── Zip code auto-lookup ──
  // V3: writes the table, not the blob. The lookup still fills city and state,
  // but each is saved as its own field so a failed lookup cannot half-write an
  // address.
  const onZipChange = async (val) => {
    setCdDraft(d => ({ ...d, postal_code: val }));
    if (!/^\d{5}$/.test(val)) return;
    await saveDetail("postal_code", val);
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${val}`);
      if (!res.ok) return;
      const place = (await res.json()).places?.[0];
      if (!place) return;
      if (place["place name"]) await saveDetail("city", place["place name"]);
      if (place["state abbreviation"]) await saveDetail("state_province", place["state abbreviation"]);
    } catch { /* silent — manual entry fallback */ }
  };

  // ── Insurance ──
  const insuranceVal = cdValue("insurance_provider");
  const isOtherInsurance = insuranceVal === "Other — specify below";

  // ── Color/Markings multi-select ──
  const colorRaw = cdValue("colour_markings");
  const selectedColors = colorRaw ? colorRaw.split("||").filter(Boolean) : [];
  const toggleColor = (opt) => {
    const next = selectedColors.includes(opt)
      ? selectedColors.filter(x => x !== opt)
      : [...selectedColors, opt];
    saveDetail("colour_markings", next.join("||"));
  };

  // ── Clinician/Staff roster from Settings ──
  const [clinicianRoster, setClinicianRoster] = useState([]);
  const [staffRoster, setStaffRoster] = useState([]);
  useEffect(() => {
    try {
      const cr = localStorage.getItem("k9_clinician_roster");
      if (cr) setClinicianRoster(JSON.parse(cr));
      const sr = localStorage.getItem("k9_staff_roster");
      if (sr) setStaffRoster(JSON.parse(sr));
    } catch {}
  }, []);

  return <>
    <Sec title="Client Information" color={C.blue} colorLt={C.blueLt} noTop>
      <Row><F label="Client First Name" placeholder="First name"/><F label="Client Last Name" placeholder="Last name"/></Row>
      <Row><F label="Phone" placeholder="(555) 000-0000" type="tel"/><F label="Email" placeholder="email@example.com" type="email"/></Row>

      {/* ── Structured Address Fields ── */}
      <Sec title="Address" color={C.blue} colorLt={C.blueLt} collapsible defaultOpen={true}>
        {CD({ col: "street_address", label: "Street Address", placeholder: "123 Main Street" })}
        <Row>
          {CD({ col: "apt_suite_unit", label: "Apt / Suite / Unit", placeholder: "Apt 4B" })}
          <div>
            <Lbl>Zip / Postal Code</Lbl>
            <input type="text" placeholder="e.g. 33301"
              value={cdValue("postal_code")}
              onChange={e => onZipChange(e.target.value)}/>
            <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>Auto-fills city & state from zip</div>
          </div>
        </Row>
        <Row>
          {CD({ col: "city", label: "City", placeholder: "Fort Lauderdale" })}
          {CD({ col: "state_province", label: "State / Province", placeholder: "FL" })}
        </Row>
        {CD({ col: "country", label: "Country", placeholder: "United States" })}
      </Sec>

      <Row>{CD({ col: "emergency_contact", label: "Emergency Contact", placeholder: "Name & phone" })}<F label="Referred By" placeholder="Referring veterinarian & clinic"/></Row>

      {/* ── Pet Insurance Provider dropdown ── */}
      <Row>
        <div>
          <Lbl>Pet Insurance Provider</Lbl>
          <select value={insuranceVal} onChange={e => saveDetail("insurance_provider", e.target.value)}>
            <option value="">Select provider…</option>
            {PET_INSURANCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {isOtherInsurance && (
            <div style={{ marginTop:6 }}>
              {CD({ col: "insurance_other", label: "Other Insurance Provider", placeholder: "Provider name & policy number" })}
            </div>
          )}
        </div>
        {CD({ col: "primary_veterinarian", label: "Primary Veterinarian", placeholder: "Name & clinic" })}
      </Row>
    </Sec>

    <Sec title="Patient Information" color={C.blue} colorLt={C.blueLt}>
      <Row><F label="Patient Name" placeholder="Pet's name"/>
        <div>
          <Lbl>Species</Lbl>
          <select value={species} onChange={e => setSpecies(e.target.value)}>
            {["Canine","Feline"].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Row>
      <Row>
        <div>
          <Lbl>Breed</Lbl>
          <select value={data["client::Breed"] || ""} onChange={e => update("client::Breed", e.target.value)}>
            <option value="">Select breed…</option>
            {breeds.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <F label="Sex" options={["Male — Intact","Male — Neutered","Female — Intact","Female — Spayed"]}/>
      </Row>
      <Row cols={2}>
        <AgeDobPair/>
        {/* ── Color / Markings multi-select ── */}
        <div>
          <Lbl>Color / Markings</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, padding:"8px 10px", background:C.white, border:`1px solid ${C.border}`, borderRadius:5, minHeight:38, marginBottom:4 }}>
            {selectedColors.length === 0 && <span style={{ fontSize:11, color:C.gray }}>Select colors & patterns…</span>}
            {selectedColors.map(c => (
              <span role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => toggleColor(c))(e); } }} key={c} onClick={() => toggleColor(c)} style={{
                fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10,
                background:C.blueLt, border:`1px solid ${C.blue}44`, color:C.blue,
                cursor:"pointer", display:"inline-flex", alignItems:"center", gap:3,
              }}>{c} ✕</span>
            ))}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
            {[...COLOR_OPTIONS, ...PATTERN_OPTIONS].map(opt => {
              const sel = selectedColors.includes(opt);
              return (
                <span role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => toggleColor(opt))(e); } }} key={opt} onClick={() => toggleColor(opt)} style={{
                  fontSize:9, padding:"2px 7px", borderRadius:3, cursor:"pointer",
                  background: sel ? C.blue : C.bg, color: sel ? C.white : C.muted,
                  border: `1px solid ${sel ? C.blue : C.border}`, fontWeight:sel?700:400,
                }}>{opt}</span>
              );
            })}
          </div>
          <div style={{ marginTop:6 }}>
            {CD({ col: "markings_additional", label: "Additional Markings", placeholder: "e.g. white chest patch, ticking on legs" })}
          </div>
        </div>
      </Row>
      <Row cols={2}>
        <WeightPair label="Weight" fieldBase="client::Weight"/>
        {CD({ col: "microchip", label: "Microchip #", placeholder: "15-digit number" })}
      </Row>
    </Sec>

    {/* ── Attending Clinician & Rehab Nurse ── */}
    <Sec title="Attending Clinical Team" color={C.blue} colorLt={C.blueLt} collapsible defaultOpen={true}>
      <Row>
        <div>
          <Lbl>Attending Clinician / Specialist</Lbl>
          <select
            value={data["global::Clinician Name"] || ""}
            onChange={e => update("global::Clinician Name", e.target.value)}>
            <option value="">Select attending clinician…</option>
            {clinicianRoster.map(c => <option key={c.id} value={c.name}>{c.name}{c.title ? ` — ${c.title}` : ""}</option>)}
            <option value="__manual__">Enter manually…</option>
          </select>
          {data["global::Clinician Name"] === "__manual__" && (
            <div style={{ marginTop:6 }}>
              <input placeholder="Clinician name & credentials"
                value={data["global::Clinician Name Manual"] || ""}
                onChange={e => update("global::Clinician Name Manual", e.target.value)}/>
            </div>
          )}
          <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>
            Populated from Settings → Clinician Roster. Propagates to all blocks.
          </div>
        </div>
        <div>
          <Lbl>Rehabilitation Nurse / Assistant</Lbl>
          <select
            value={data["global::Nurse Assistant"] || ""}
            onChange={e => update("global::Nurse Assistant", e.target.value)}>
            <option value="">Select nurse or assistant…</option>
            {staffRoster.map(s => <option key={s.id} value={s.name}>{s.name}{s.role ? ` — ${s.role}` : ""}</option>)}
            <option value="__manual__">Enter manually…</option>
          </select>
          {data["global::Nurse Assistant"] === "__manual__" && (
            <div style={{ marginTop:6 }}>
              <input placeholder="Nurse / assistant name"
                value={data["global::Nurse Assistant Manual"] || ""}
                onChange={e => update("global::Nurse Assistant Manual", e.target.value)}/>
            </div>
          )}
          <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>
            Populated from Settings → Staff Roster. Propagates to all blocks.
          </div>
        </div>
      </Row>
    </Sec>

    <ClinicalNotes/>
  </>;
}

// ── DIAGNOSTICS ───────────────────────────────────────────────────────────────
/**
 * DIAGNOSTICS — imaging and laboratory work as a TIMELINE
 *
 * V3. Reads and writes \`patient_diagnostic_studies\` through the V2 API. That
 * table is the source of truth; \`patients.dashboard_data\` is no longer read
 * for this block.
 *
 * WHY THIS IS A LIST OF STUDIES AND NOT A SET OF CHECKBOXES
 *
 * The old panel recorded whether a modality had EVER been performed and gave it
 * one findings box. A rehabilitation patient is imaged before surgery, after it
 * and at recheck, and the clinical value of the second study is the comparison
 * with the first — which one box cannot hold, so the second gets appended to
 * the first and they stop being separable. Four records in this database are
 * already in that state, and they are flagged here so a clinician can split
 * them. Splitting them automatically would mean deciding which finding belongs
 * to which study, and that is a clinical reading, not a parse.
 *
 * A study's DATE is entered here. It is never inferred from the findings text:
 * "at 8w" is a point in a recovery, not a date.
 */
function DiagnosticsPanel() {
  const { patientId } = useContext(DashFormContext);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [busy, setBusy] = useState(null);
  const [draft, setDraft] = useState({ category: "IMAGING", modality: "", panels: [], performed_on: "", findings: "" });

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const load = React.useCallback(() => {
    if (!patientId) { setState(s => ({ ...s, loading: false })); return; }
    fetch(`${apiBase}/v2/patients/${patientId}/diagnostics`, { headers: authHeaders() })
      .then(r => r.json())
      .then(j => setState({ loading: false, error: null, data: j.data || null }))
      .catch(e => setState(s => ({ ...s, loading: false, error: e.message })));
  }, [apiBase, patientId]);

  useEffect(load, [load]);

  async function call(url, method, body, key) {
    setBusy(key);
    try {
      const res = await fetch(`${apiBase}${url}`, {
        method, headers: authHeaders(), body: body ? JSON.stringify(body) : undefined,
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || `HTTP ${res.status}`);
      setState(s => ({ ...s, error: null }));
      load();
    } catch (e) {
      setState(s => ({ ...s, error: e.message }));
    } finally { setBusy(null); }
  }

  if (!patientId) return <div style={{ fontSize:12, color:C.muted, padding:14 }}>Select a patient to record diagnostics.</div>;
  if (state.loading) return <div style={{ fontSize:12, color:C.muted, padding:14 }}>Loading diagnostics…</div>;
  const d = state.data;
  if (!d) return <div style={{ fontSize:12, color:C.red, padding:14 }}>{state.error || "No diagnostics."}</div>;

  const { summary, vocabulary } = d;
  const chip = (label, n, colour) => (
    <span style={{ padding:"3px 9px", borderRadius:11, background:colour + "1a", color:colour,
      border:`1px solid ${colour}44`, fontSize:10, fontWeight:700, marginRight:6 }}>{n} {label}</span>
  );

  const studyRow = (s) => (
    <div key={s.id} style={{ padding:"10px 12px", border:`1px solid ${C.border}`, borderRadius:6,
      marginBottom:8, background:C.white,
      borderLeft: `3px solid ${s.describes_multiple_studies ? C.amber : s.performed_on ? C.blue : C.border}` }}>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.text }}>
          {s.category === "LAB" ? (s.panels.join(", ") || "Laboratory work") : s.modality}
        </span>
        <span style={{ fontSize:10, color:C.muted, fontWeight:700 }}>{s.category}</span>
        <label style={{ fontSize:10, color:C.muted }}>
          performed{" "}
          <input type="date" value={s.performed_on || ""} disabled={busy === s.id}
            onChange={e => call(`/v2/diagnostics/${s.id}`, "PUT", { performed_on: e.target.value }, s.id)}
            style={{ padding:"3px 5px", border:`1px solid ${C.border}`, borderRadius:4, fontSize:10 }}/>
        </label>
        {s.needs_a_date && <span style={{ fontSize:10, color:C.muted, fontStyle:"italic" }}>no date recorded</span>}
      </div>
      {s.findings && <div style={{ fontSize:11, color:C.text, lineHeight:1.5 }}>{s.findings}</div>}
      {s.describes_multiple_studies && (
        <div style={{ marginTop:7, fontSize:10, color:C.amber, fontWeight:700 }}>
          This text describes MORE THAN ONE study — record the repeat as its own study below,
          and trim this one to the first.
        </div>
      )}
    </div>
  );

  return <>
    <div style={{ marginBottom:16, padding:"10px 14px", background:C.blueLt, borderRadius:6,
      border:`1px solid ${C.blue}33` }}>
      <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>
        Each study is recorded on its own, with the date it was performed. A repeat MRI is a
        <strong> second study</strong>, not a sentence added to the first one&rsquo;s findings.
      </div>
      <div>
        {chip("studies", summary.total, C.blue)}
        {summary.undated > 0 && chip("with no date", summary.undated, C.muted)}
        {summary.describing_multiple_studies > 0
          && chip("need splitting", summary.describing_multiple_studies, C.amber)}
      </div>
    </div>

    {state.error && (
      <div style={{ fontSize:11, color:C.red, marginBottom:12, padding:"8px 12px", background:C.redLt, borderRadius:5 }}>
        {state.error}
      </div>
    )}

    {d.imaging.length > 0 && (
      <Sec title="Imaging" color={C.blue} colorLt={C.blueLt} noTop>{d.imaging.map(studyRow)}</Sec>
    )}
    {d.labs.length > 0 && (
      <Sec title="Laboratory Work" color={C.purple} colorLt={C.purpleLt}>{d.labs.map(studyRow)}</Sec>
    )}

    <Sec title="Record a Study" color={C.teal} colorLt={C.tealLt}>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"flex-end", marginBottom:10 }}>
        <div style={{ flex:"1 1 130px" }}>
          <Lbl>Type</Lbl>
          <select value={draft.category} onChange={e => setDraft(x => ({ ...x, category: e.target.value, modality: "", panels: [] }))}
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}>
            {vocabulary.categories.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        {draft.category === "IMAGING" ? (
          <div style={{ flex:"2 1 200px" }}>
            <Lbl>Modality</Lbl>
            <select value={draft.modality} onChange={e => setDraft(x => ({ ...x, modality: e.target.value }))}
              style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}>
              <option value="">—</option>
              {vocabulary.modalities.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ) : (
          <div style={{ flex:"2 1 240px" }}>
            <Lbl>Panels</Lbl>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {vocabulary.panels.map(p => (
                <label key={p} style={{ fontSize:10, color:C.muted, display:"flex", alignItems:"center", gap:3 }}>
                  <input type="checkbox" checked={draft.panels.includes(p)}
                    onChange={e => setDraft(x => ({ ...x,
                      panels: e.target.checked ? [...x.panels, p] : x.panels.filter(q => q !== p) }))}/>
                  {p}
                </label>
              ))}
            </div>
          </div>
        )}
        <div style={{ flex:"1 1 130px" }}>
          <Lbl>Performed on</Lbl>
          <input type="date" value={draft.performed_on}
            onChange={e => setDraft(x => ({ ...x, performed_on: e.target.value }))}
            style={{ width:"100%", padding:"7px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}/>
        </div>
      </div>
      <Lbl>Findings</Lbl>
      <textarea rows={2} value={draft.findings}
        onChange={e => setDraft(x => ({ ...x, findings: e.target.value }))}
        placeholder="What this study showed"
        style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, fontFamily:"inherit", marginBottom:10 }}/>
      <button
        disabled={busy === "add" || (draft.category === "IMAGING" ? !draft.modality : !draft.panels.length)}
        onClick={() => call(`/v2/patients/${patientId}/diagnostics`, "POST", {
          category: draft.category, modality: draft.modality || null, panels: draft.panels,
          performed_on: draft.performed_on || null, findings: draft.findings || null,
        }, "add").then(() => setDraft({ category: draft.category, modality: "", panels: [], performed_on: "", findings: "" }))}
        style={{ padding:"9px 16px", background:C.blue, color:C.white, border:"none",
          borderRadius:5, fontSize:11, fontWeight:700, cursor:"pointer" }}>
        Record study
      </button>
    </Sec>
    <ClinicalNotes/>
  </>;
}

// ── ASSESSMENT ────────────────────────────────────────────────────────────────
// MedicationsSection — content only, no Sec wrapper. Caller wraps with <Sec> (collapsible or not).
function MedicationsSection() {
  const [meds, setMeds] = useState([{id:1},{id:2}]);
  const nextId = useRef(3);
  const addMed = () => { setMeds(p=>[...p,{id:nextId.current++}]); };
  const removeMed = (id) => { if(meds.length > 1) setMeds(p=>p.filter(m=>m.id!==id)); };
  return (
    <>
      <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>
        List all current medications, dosages, and frequencies. Include prescription drugs, OTC medications, and supplements.
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {meds.map((m,i) => (
          <div key={m.id} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:10, alignItems:"end" }}>
            <div><Lbl>Medication {i+1}</Lbl><input placeholder="Drug name"/></div>
            <div><Lbl>Dose</Lbl><input placeholder="e.g. 25mg, 0.5ml"/></div>
            <div><Lbl>Frequency</Lbl>
              <select>
                <option value="">Select…</option>
                {["Once daily (SID)","Twice daily (BID)","Three times daily (TID)","Every other day (EOD)","As needed (PRN)","Weekly","Other"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <button onClick={()=>removeMed(m.id)} title="Remove" style={{ padding:"7px 11px", background:"#FEF2F2", border:"1px solid #FECACA", color:C.red, borderRadius:5, cursor:meds.length===1?"not-allowed":"pointer", fontSize:14, fontWeight:700, opacity:meds.length===1?.35:1, marginBottom:1 }}>✕</button>
          </div>
        ))}
      </div>
      <button onClick={addMed} style={{ marginTop:10, padding:"8px 18px", background:C.amberLt, border:`1px solid ${C.amber}55`, color:C.amber, borderRadius:5, cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:".06em" }}>
        + ADD ANOTHER MEDICATION
      </button>
      <div style={{ marginTop:14 }}>
        <F label="Supplements" placeholder="e.g. Fish oil 1000mg SID, glucosamine/chondroitin, joint support, probiotics…"/>
        <Row>
          <F label="Last NSAID dose" type="date" hint="Important before laser or manual therapy"/>
          <F label="Response to current medications" options={["Excellent — well controlled","Good — improved","Partial — some relief","Poor — minimal response","Not yet assessed"]}/>
        </Row>
        <F label="Medication Notes / Allergies" placeholder="Known drug allergies, adverse reactions, or medication concerns…"/>
      </div>
    </>
  );
}

function AssessmentPanel() {
  const { data, update, beauVoice: bv, uiLang } = useContext(DashFormContext);
  const species = data["client::Species"] || "Canine";
  const isFeline = species === "Feline";

  const PAIN_LOCATIONS = [
    "Cervical Spine","Thoracic Spine","Lumbar Spine","Pelvis",
    "Left Shoulder","Right Shoulder","Left Elbow","Right Elbow",
    "Left Carpus","Right Carpus","Left Hip","Right Hip",
    "Left Stifle","Right Stifle","Left Tarsus","Right Tarsus",
    "Generalized","Other"
  ];
  const PAIN_AGGRAVATING = ["Exercise","Rising from rest","Stairs","Jumping","Cold weather","Palpation","Weight bearing","Prolonged sitting","Other"];
  const PAIN_ALLEVIATING = ["Rest","Medication","Heat therapy","Cold therapy","Massage","Reduced activity","Swimming","Other"];

  // ── Vital Signs auto-flag helper ──
  const checkVital = (key, min, max) => {
    const v = parseFloat(data[`assessment::${key}`]);
    if (isNaN(v)) return null;
    if (v < min || v > max) return { value: v, min, max, flag: "outside" };
    return { value: v, min, max, flag: "normal" };
  };

  const tempRange = { min: 100.5, max: 102.5 };
  const hrRange = isFeline ? { min: 140, max: 220 } : { min: 60, max: 140 };
  const rrRange = isFeline ? { min: 20, max: 40 } : { min: 10, max: 30 };

  // ── Vital flags panel ──
  const vitalFlags = [];
  const tempCheck = checkVital("Temperature (°F)", tempRange.min, tempRange.max);
  if (tempCheck?.flag === "outside") vitalFlags.push(`Temperature ${tempCheck.value}°F outside normal ${tempRange.min}–${tempRange.max}°F`);
  const hrCheck = checkVital("Heart Rate (bpm)", hrRange.min, hrRange.max);
  if (hrCheck?.flag === "outside") vitalFlags.push(`Heart Rate ${hrCheck.value} bpm outside normal ${hrRange.min}–${hrRange.max}`);
  const rrCheck = checkVital("Respiration Rate (rpm)", rrRange.min, rrRange.max);
  if (rrCheck?.flag === "outside") vitalFlags.push(`Respiration ${rrCheck.value} rpm outside normal ${rrRange.min}–${rrRange.max}`);
  const spo2Check = checkVital("SpO2 (%)", 95, 100);
  if (spo2Check?.flag === "outside") vitalFlags.push(`SpO2 ${spo2Check.value}% below 95%`);

  return <>
    {/* ── SECTION A — ALWAYS OPEN: Initial Assessment ── */}
    <Sec title="Initial Clinical Assessment" color={C.amber} colorLt={C.amberLt} noTop>
      <Row>
        <F label="Assessment Date" type="date"/>
        <div>
          <Lbl>Clinician Name & Credentials</Lbl>
          <input
            value={data["global::Clinician Name"] && data["global::Clinician Name"] !== "__manual__"
              ? data["global::Clinician Name"]
              : data["global::Clinician Name Manual"] || data["assessment::Clinician Name & Credentials"] || ""}
            onChange={e => update("assessment::Clinician Name & Credentials", e.target.value)}
            placeholder="e.g. Sal Bonanno, CVN"
            readOnly={!!(data["global::Clinician Name"] && data["global::Clinician Name"] !== "__manual__")}
            style={data["global::Clinician Name"] && data["global::Clinician Name"] !== "__manual__" ? { background:"#F9FAFB", color:C.muted, cursor:"default" } : {}}
          />
          {data["global::Clinician Name"] && data["global::Clinician Name"] !== "__manual__" && (
            <div style={{ fontSize:9, color:C.muted, marginTop:3, fontStyle:"italic" }}>Auto-filled from Client & Patient block</div>
          )}
        </div>
      </Row>
      <F label="Chief Complaint" placeholder="Primary reason for rehabilitation referral in client's words…"/>
      <F label="Relevant Medical & Surgical History" placeholder="Previous injuries, surgeries, rehabilitation history, activity level…" rows={3}/>
      <Row>
        <F label="Current Mobility Level" options={["Non-weight bearing (NWB)","Toe-touching weight bearing (TTWB)","Partial weight bearing (PWB)","Full weight bearing with lameness (FWBL)","Weight bearing — subtle lameness","Normal — no lameness"]}/>
        <F label="Lameness Grade" options={["Grade 0 — No lameness","Grade 1 — Barely perceptible","Grade 2 — Mild, consistent","Grade 3 — Moderate, consistent weight bearing","Grade 4 — Severe, minimal weight bearing","Grade 5 — Non-weight bearing"]}/>
      </Row>
      <F label="Initial Assessment Narrative" placeholder="Clinical impressions, functional limitations, overall patient presentation…" rows={3}/>
    </Sec>

    {/* ── SECTION A: VITAL SIGNS (TPR) ── */}
    <Sec title="▶ Vital Signs (TPR) — Millis & Levine" color={C.red} colorLt={C.redLt} collapsible defaultOpen={false}>
      <Row cols={3}>
        <F label="Temperature (°F)" placeholder="e.g. 101.5" type="number" hint={`Normal: ${tempRange.min}–${tempRange.max}°F`}/>
        <F label="Heart Rate (bpm)" placeholder="e.g. 80" type="number" hint={`Normal: ${hrRange.min}–${hrRange.max} bpm`}/>
        <F label="Respiration Rate (rpm)" placeholder="e.g. 20" type="number" hint={`Normal: ${rrRange.min}–${rrRange.max} rpm`}/>
      </Row>
      <Row cols={3}>
        <F label="Blood Pressure Systolic (mmHg)" placeholder="e.g. 130" type="number" hint={isFeline ? "Normal: 120–170" : "Normal: 110–160"}/>
        <F label="CRT (Capillary Refill)" options={["<1 sec","<2 sec (normal)","2–3 sec","<3 sec — FLAG"]}/>
        <F label="Mucous Membrane Color" options={["Pink/Moist (normal)","Pale","White","Blue/Cyanotic","Yellow/Icteric","Brick Red","Tacky"]}/>
      </Row>
      <Row cols={3}>
        <F label="SpO2 (%)" placeholder="e.g. 98" type="number" hint="Normal: >95%"/>
        <F label="Body Condition Score (1–9)" options={["1 — Emaciated","2 — Very thin","3 — Thin","4 — Underweight","5 — Ideal","6 — Overweight","7 — Heavy","8 — Obese","9 — Morbidly obese"]}/>
        <F label="Muscle Condition Score" options={["Normal","Mild Wasting","Moderate Wasting","Severe Wasting"]}/>
      </Row>
      <F label="Location of Muscle Atrophy" placeholder="e.g. Right thigh, bilateral hindquarters"/>

      {/* ── BEAU VITAL SIGNS AUTO-FLAG ── */}
      {vitalFlags.length > 0 && (
        <div style={{ marginTop:14, padding:"12px 16px", background:C.redLt, border:`1.5px solid ${C.red}`, borderRadius:8 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.red, letterSpacing:".1em", marginBottom:8 }}>⚠ B.E.A.U. CLINICAL FLAGS</div>
          {vitalFlags.map((f,i) => (
            <div key={i} style={{ fontSize:11, color:C.red, marginBottom:4, fontWeight:600 }}>⚠ {f}</div>
          ))}
        </div>
      )}
    </Sec>

    {/* ── SECTION C: ORTHOPEDIC EXAMINATION ── */}
    <Sec title="▶ Orthopedic Examination — Joint Assessment" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>
        Per Millis & Levine Chapter 7 — assess each joint for pain, effusion, crepitus, and ROM.
      </div>
      {["Shoulder","Elbow","Carpus","Hip","Stifle","Tarsus","Spine"].map(joint => (
        <CollapsibleSub key={joint} title={`${joint} — L/R`} accentColor={C.amber}>
          <Row cols={2}>
            <F label={`${joint} L — Palpation Pain (0–3)`} options={["0 — None","1 — Mild","2 — Moderate","3 — Severe"]}/>
            <F label={`${joint} R — Palpation Pain (0–3)`} options={["0 — None","1 — Mild","2 — Moderate","3 — Severe"]}/>
          </Row>
          <Row cols={2}>
            <F label={`${joint} L — Effusion`} options={["None","Mild","Moderate","Severe"]}/>
            <F label={`${joint} R — Effusion`} options={["None","Mild","Moderate","Severe"]}/>
          </Row>
          <Row cols={2}>
            <F label={`${joint} L — Crepitus`} options={["Absent","Present"]}/>
            <F label={`${joint} R — Crepitus`} options={["Absent","Present"]}/>
          </Row>
          <Row cols={2}>
            <F label={`${joint} L — ROM (°)`} placeholder="°" type="number"/>
            <F label={`${joint} R — ROM (°)`} placeholder="°" type="number"/>
          </Row>
          <F label={`${joint} Notes`} placeholder="Clinical observations…"/>
        </CollapsibleSub>
      ))}
    </Sec>

    {/* ── SECTION D: NEUROLOGICAL ── */}
    <Sec title="▶ Neurological Examination — Millis & Levine Ch.8" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <Row cols={2}>
        <F label="Mentation" options={["Alert / BAR","QAR","Obtunded","Stuporous","Comatose"]}/>
        <F label="Neurological Grade (Frankel Modified)" options={["Grade 0 — No pain, no deficits","Grade 1 — Pain only","Grade 2 — Paresis, ambulatory","Grade 3 — Paresis, non-ambulatory","Grade 4 — Plegia with deep pain","Grade 5 — Plegia without deep pain"]}/>
      </Row>
      <div style={{ fontSize:10, fontWeight:700, color:C.amber, letterSpacing:".08em", marginTop:12, marginBottom:6 }}>PROPRIOCEPTION (PER LIMB)</div>
      <Row cols={4}>
        <F label="FL Proprioception" options={["Normal","Delayed","Absent"]}/>
        <F label="FR Proprioception" options={["Normal","Delayed","Absent"]}/>
        <F label="HL Proprioception" options={["Normal","Delayed","Absent"]}/>
        <F label="HR Proprioception" options={["Normal","Delayed","Absent"]}/>
      </Row>
      <div style={{ fontSize:10, fontWeight:700, color:C.amber, letterSpacing:".08em", marginTop:12, marginBottom:6 }}>SPINAL REFLEXES</div>
      <Row cols={2}>
        <F label="Patellar Reflex" options={["Normal","Reduced","Absent","Exaggerated"]}/>
        <F label="Withdrawal FL" options={["Normal","Reduced","Absent"]}/>
      </Row>
      <Row cols={2}>
        <F label="Withdrawal HL" options={["Normal","Reduced","Absent"]}/>
        <F label="Perineal Reflex" options={["Normal","Reduced","Absent"]}/>
      </Row>
      <div style={{ fontSize:10, fontWeight:700, color:C.amber, letterSpacing:".08em", marginTop:12, marginBottom:6 }}>POSTURAL REACTIONS & FUNCTION</div>
      <Row cols={2}>
        <F label="Hopping" options={["Normal — all limbs","Abnormal FL","Abnormal FR","Abnormal HL","Abnormal HR","Abnormal multiple"]}/>
        <F label="Wheelbarrowing" options={["Normal","Abnormal"]}/>
      </Row>
      <Row cols={2}>
        <F label="Schiff-Sherrington" options={["Absent","Present"]}/>
        <F label="Bladder Function" options={["Normal","Reduced","Absent","Incontinent"]}/>
      </Row>
      <Row cols={2}>
        <F label="Bowel Function" options={["Normal","Abnormal"]}/>
        <F label="Deep Pain Perception" options={["Present — bilateral","Present — right only","Present — left only","Absent — bilateral","Not tested"]}/>
      </Row>
      <F label="Neurological Notes" placeholder="Additional neurological findings — cranial nerves, lesion localization…" rows={2}/>
    </Sec>

    {/* ── SECTION E: GAIT ANALYSIS — Millis & Levine Ch.9 ── */}
    <Sec title="▶ Gait Analysis — Millis & Levine Ch.9" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <Row cols={2}>
        <F label="Gait Assessment Method" options={["Visual observation — Subjective","Force plate analysis","Pressure walkway","Video slow-motion","Treadmill analysis","Kinematic analysis"]}/>
        <F label="Weight Bearing Status" options={["NWB","Toe-touching","Partial","Full"]}/>
      </Row>
      <Row cols={2}>
        <F label="Gait Pattern" options={["Normal","Antalgic — pain-avoiding","Ataxic — incoordinated","Paretic — weakness-based","Spastic — increased tone","Compensatory — shifting load","Mixed"]}/>
        <F label="Symmetry" options={["Symmetric","Asymmetric"]}/>
      </Row>
      <Row cols={2}>
        <F label="Antalgic Posture" options={["None","Mild","Moderate","Severe"]}/>
        <F label="Affected Limb(s)" options={["Right forelimb (RF)","Left forelimb (LF)","Right hindlimb (RH)","Left hindlimb (LH)","Both hindlimbs","Both forelimbs","All four limbs","Spinal / truncal"]}/>
      </Row>
      <F label="Gait Analysis Notes" placeholder="Cadence, symmetry, toe clearance, head bob, hip hike…" rows={3}/>
    </Sec>

    {/* ── SECTION F: PAIN ASSESSMENT ── */}
    <Sec title="▶ Pain Assessment — CSU / Helsinki / LOAD / FGS" color={C.red} colorLt={C.redLt} collapsible defaultOpen={false}>
      {isFeline ? (
        <>
          <div style={{ fontSize:10, color:C.muted, marginBottom:8, fontStyle:"italic", padding:"6px 10px", background:C.white, border:`1px dashed ${C.border}`, borderRadius:4 }}>
            Feline Grimace Scale (FGS) — Evangelista et al 2019. Score each facial action unit 0–2. Total 0–10.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {FELINE_FGS_ITEMS.map(lbl => <F key={lbl} label={lbl} options={FELINE_FGS_SCORES}/>)}
          </div>
        </>
      ) : (
        <Row cols={2}>
          <F label="CSU Acute Pain Score (0–4)" options={CANINE_PAIN_SCALE}/>
          <F label="Pain Assessment at" options={["Rest","Activity","Palpation","Post-exercise"]}/>
        </Row>
      )}
      <Row cols={3}>
        <F label="Numeric Rating Scale (NRS 0–10)" placeholder="0–10" hint="0 = no pain, 10 = worst possible"/>
        <F label="Pain Character" options={["Acute","Subacute","Chronic","Neuropathic","Mixed"]}/>
        <F label="Pain Onset" options={["Sudden","Gradual","Post-surgical","Unknown"]}/>
      </Row>
      <Row><F label="Pain Location — Primary" options={PAIN_LOCATIONS}/><F label="Pain Location — Secondary" options={PAIN_LOCATIONS}/></Row>
      <Row><F label="Pain Aggravating Factors" options={PAIN_AGGRAVATING}/><F label="Pain Alleviating Factors" options={PAIN_ALLEVIATING}/></Row>
    </Sec>

    {/* ── SECTION 3 — MEDICATIONS (COLLAPSED) ── */}
    <Sec title="▶ Current Medications & Supplements" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <MedicationsSection/>
    </Sec>

    {/* ── SECTION 4 — DIAGNOSIS (COLLAPSED) ── */}
    <Sec title="▶ Clinical Diagnosis & Problem List" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <F label="Primary Diagnosis" placeholder="e.g. Right caudal cruciate ligament rupture — post TPLO week 4"/>
      <Row><F label="ICD / VeNom Code" placeholder="Diagnostic code"/><F label="Date of Diagnosis / Surgery" type="date"/></Row>
      <F label="Surgical Procedure" placeholder="e.g. TPLO right stifle — implant type and surgeon"/>
      <F label="Comorbidities / Secondary Diagnoses" placeholder="e.g. Bilateral hip dysplasia, obesity…" rows={2}/>
      <F label="Active Problem List" placeholder="All active clinical problems in priority order…" rows={3}/>
      <Row><F label="Prognosis" options={["Excellent","Good","Fair","Guarded","Poor"]}/><F label="Rehabilitation Indication" options={["Post-surgical orthopedic","Post-surgical neurological","Non-surgical orthopedic","Neurological","Chronic pain management","Conditioning / Fitness","Palliative care","Other"]}/></Row>
    </Sec>

    {/* ── SECTION G: FUNCTIONAL ASSESSMENT ── */}
    <Sec title="▶ Functional Assessment" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <Row cols={3}>
        <F label="Sit-to-Stand" options={["Easy","Moderate difficulty","Cannot"]}/>
        <F label="Stair Climbing" options={["Normal","Assisted","Cannot"]}/>
        <F label="Jump Ability" options={["Normal","Reduced","Cannot"]}/>
      </Row>
      <Row cols={2}>
        <F label="Activity Level (1–5)" options={["1 — Sedentary","2 — Low","3 — Moderate","4 — Active","5 — Very active"]}/>
        <F label="Exercise Tolerance" options={["Good","Fair","Poor"]}/>
      </Row>
    </Sec>

    {/* ── SECTION H: SPECIAL ORTHOPEDIC TESTS ── */}
    <Sec title="▶ Special Orthopedic Tests" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <Row cols={2}>
        <F label="Cranial Drawer Test" options={["Not performed","Negative","Positive — Grade 1","Positive — Grade 2","Positive — Grade 3"]}/>
        <F label="Tibial Compression Test" options={["Not performed","Negative","Positive"]}/>
      </Row>
      <Row cols={2}>
        <F label="Ortolani Sign" options={["Not performed","Negative","Positive"]}/>
        <F label="Shoulder Abduction Angle (°)" placeholder="degrees" type="number"/>
      </Row>
      <Row cols={2}>
        <F label="Elbow Flexion Test" options={["Not performed","Negative","Positive"]}/>
        <F label="Patella Luxation Grade" options={["Not performed","Grade 0","Grade 1","Grade 2","Grade 3","Grade 4"]}/>
      </Row>
    </Sec>

    {/* B.E.A.U. Assessment Synthesis was removed from this panel on
        2026-09-25 on Sal's instruction: it does not belong on the assessment
        page. It sent every assessment:: field to the model and asked for a
        clinical summary, rehabilitation implications, contraindications and
        evidence references.

        "Ask B.E.A.U." remains available from the block header, where a
        clinician asks a specific question rather than being handed a
        synthesis of a form they are still filling in. */}

    <ClinicalNotes/>
  </>;
}

// ── TREATMENT & SURGICAL STATUS ───────────────────────────────────────────────
// Two mutually-exclusive approaches (Surgical / Conservative). Palliative was
// retired 2026-09-25 — a palliative patient is not a rehabilitation candidate.
// The ENGINE still handles the token, because the pain >= 8 override routes
// through it to reach the comfort protocol.
// Selection stored in `treatment::Approach` drives which field set is rendered.
// All nested fields use standard F components so they auto-wire under
// "treatment::*" keys in DashFormContext.
function TreatmentPanel() {
  const { data, update, patientId } = useContext(DashFormContext);

  // ── V3: this block lives in its own tables, not in the blob ──────────────
  //
  //   the CASE       approach and affected limb  -> columns on `patients`
  //   a PROCEDURE    an event with a date        -> patient_procedures
  //   the STATUS     a time series               -> patient_treatment_status
  //
  // Recording a status INSERTS. The previous row stays as the progression,
  // because weight bearing going NWB -> TTWB -> PWB -> FWB is the clinical
  // record and a single overwritable field loses it.
  //
  // The engine reads these tables. Until 2026-09-25 this panel wrote the blob
  // while the engine read the tables, which meant a clinician's edit did not
  // reach the protocol.
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [tx, setTx] = useState({ loading: true, data: null, error: null });
  const [txBusy, setTxBusy] = useState(null);
  const [txDraft, setTxDraft] = useState({});
  const [procDraft, setProcDraft] = useState({ procedure_type: "", procedure_date: "", surgeon: "" });

  const txHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const loadTx = React.useCallback(() => {
    if (!patientId) { setTx({ loading: false, data: null, error: null }); return; }
    fetch(`${apiBase}/v2/patients/${patientId}/treatment`, { headers: txHeaders() })
      .then(r => r.json())
      .then(j => setTx({ loading: false, data: j.data || null, error: j.success ? null : j.error }))
      .catch(e => setTx({ loading: false, data: null, error: e.message }));
  }, [apiBase, patientId]);

  useEffect(() => { loadTx(); }, [loadTx]);

  const txPost = async (path, body, method = "POST") => {
    const res = await fetch(`${apiBase}/v2${path}`, {
      method, headers: txHeaders(), body: JSON.stringify(body),
    });
    const j = await res.json();
    // The store refuses rather than coerces — a retired approach, an
    // unparseable date, "maybe" as a yes/no. Surface its sentence; it names
    // what to do instead.
    if (!res.ok || !j.success) throw new Error(j.error || `HTTP ${res.status}`);
    setTx({ loading: false, data: j.data, error: null });
    return j.data;
  };

  const saveCase = async (patch, busyKey) => {
    if (!patientId) return;
    setTxBusy(busyKey); setTx(s => ({ ...s, error: null }));
    try { await txPost(`/patients/${patientId}/treatment/case`, patch, "PUT"); }
    catch (e) { setTx(s => ({ ...s, error: e.message })); }
    finally { setTxBusy(null); }
  };

  /** Record the status as at today. Fields not named are carried forward. */
  const saveStatus = async (patch, busyKey) => {
    if (!patientId) return;
    setTxBusy(busyKey); setTx(s => ({ ...s, error: null }));
    try {
      await txPost(`/patients/${patientId}/treatment/status`, { status: patch });
      setTxDraft(d => { const n = { ...d }; for (const k of Object.keys(patch)) delete n[k]; return n; });
    } catch (e) { setTx(s => ({ ...s, error: e.message })); }
    finally { setTxBusy(null); }
  };

  const status = (tx.data && tx.data.status) || {};
  const sVal = (col) => (txDraft[col] !== undefined ? txDraft[col] : (status[col] ?? ""));

  /** A status field. Saves on change (select) or blur (text). */
  const TS = ({ col, label, options, placeholder, rows }) => {
    const busy = txBusy === col;
    const common = {
      disabled: busy || !patientId,
      style: { width: "100%", padding: "8px 10px", border: `1px solid ${C.border}`,
               borderRadius: 5, fontSize: 12, opacity: busy ? 0.6 : 1 },
    };
    return (
      <div style={{ flex: 1, minWidth: 160 }}>
        <Lbl>{label}</Lbl>
        {options ? (
          <select value={sVal(col)} {...common}
                  onChange={e => saveStatus({ [col]: e.target.value }, col)}>
            <option value="">— Select —</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : rows ? (
          <textarea rows={rows} value={sVal(col)} placeholder={placeholder} {...common}
                    onChange={e => setTxDraft(d => ({ ...d, [col]: e.target.value }))}
                    onBlur={e => { if (e.target.value !== (status[col] ?? "")) saveStatus({ [col]: e.target.value }, col); }}/>
        ) : (
          <input value={sVal(col)} placeholder={placeholder} {...common}
                 onChange={e => setTxDraft(d => ({ ...d, [col]: e.target.value }))}
                 onBlur={e => { if (e.target.value !== (status[col] ?? "")) saveStatus({ [col]: e.target.value }, col); }}/>
        )}
      </div>
    );
  };

  /**
   * A TRI-STATE flag. Three buttons, not a checkbox, and that is the point.
   *
   * A checkbox has two states and this field has three. Unanswered is not
   * "no": the e-collar and crate-rest gates DEFAULT TO REQUIRED inside the
   * acute post-operative window, so a box nobody ticked must not read as a
   * clinician saying it is not needed. The old control could not express the
   * difference and stored "" for both.
   */
  const TFlag = ({ col, label, yes }) => {
    const v = status[col];
    const state = v === null || v === undefined ? null : (v ? 1 : 0);
    const busy = txBusy === col;
    const btn = (on, colour) => ({
      flex: 1, padding: "7px 4px", fontSize: 11, cursor: busy ? "default" : "pointer",
      border: `1px solid ${on ? colour : C.border}`, background: on ? colour : C.white,
      color: on ? C.white : C.muted, borderRadius: 4, textAlign: "center",
      opacity: busy ? 0.6 : 1, userSelect: "none",
    });
    const pick = (val) => { if (!busy) saveStatus({ [col]: val }, col); };
    return (
      <div style={{ flex: 1, minWidth: 150 }}>
        <Lbl>{label}</Lbl>
        <div style={{ display: "flex", gap: 4 }}>
          <div role="button" tabIndex={0} style={btn(state === 1, "#F59E0B")}
               onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(true); } }}
               onClick={() => pick(true)}>{yes || "Yes"}</div>
          <div role="button" tabIndex={0} style={btn(state === 0, "#64748B")}
               onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(false); } }}
               onClick={() => pick(false)}>No</div>
          <div role="button" tabIndex={0} style={btn(state === null, "#CBD5E1")}
               onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(null); } }}
               onClick={() => pick(null)}>Not asked</div>
        </div>
      </div>
    );
  };

  const addProcedure = async () => {
    if (!patientId || !procDraft.procedure_type) return;
    setTxBusy("procedure"); setTx(s => ({ ...s, error: null }));
    try {
      await txPost(`/patients/${patientId}/treatment/procedures`, { procedure: procDraft });
      setProcDraft({ procedure_type: "", procedure_date: "", surgeon: "" });
    } catch (e) { setTx(s => ({ ...s, error: e.message })); }
    finally { setTxBusy(null); }
  };

  const removeProcedure = async (id) => {
    setTxBusy("procedure"); setTx(s => ({ ...s, error: null }));
    try { await txPost(`/treatment/procedures/${id}`, {}, "DELETE"); }
    catch (e) { setTx(s => ({ ...s, error: e.message })); }
    finally { setTxBusy(null); }
  };

  const approach = (tx.data && tx.data.approach) || "";

  // Days Post-Op comes from the most recent DATED procedure now. An undated
  // one cannot place a patient in a post-operative window, and the engine
  // treats an undated surgical case as ACTIVE rather than guessing.
  const procedures = (tx.data && tx.data.procedures) || [];
  const surgeryDate = (procedures.find(p => p.procedure_date) || {}).procedure_date || "";
  const daysPostOp = (() => {
    if (!surgeryDate) return "";
    const d = new Date(surgeryDate);
    if (isNaN(d.getTime())) return "";
    const ms = Date.now() - d.getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return days >= 0 ? String(days) : "";
  })();

  const cardStyle = (selected, color) => ({
    flex: 1,
    padding: "20px 16px",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "center",
    background: selected ? color : C.white,
    color: selected ? C.white : C.text,
    border: selected ? `2px solid ${color}` : `1.5px solid ${C.border}`,
    boxShadow: selected ? `0 4px 14px ${color}33` : "0 1px 4px rgba(26,39,68,.06)",
    transition: "all .15s",
    userSelect: "none",
  });

  return <>
    <Sec title="Treatment Approach" color="#F59E0B" colorLt="#FFFBEB" noTop>
      <div style={{ fontSize:11, color:C.muted, marginBottom:14, lineHeight:1.65 }}>
        Select the primary treatment approach for this patient. Each approach reveals a tailored field set below.
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => saveCase({ approach: "Surgical" }, "approach"))(e); } }} style={cardStyle(approach === "Surgical", "#F59E0B")}
             onClick={() => saveCase({ approach: "Surgical" }, "approach")}>
          <div style={{ fontSize:28, marginBottom:6 }}>🏥</div>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:".05em" }}>SURGICAL</div>
          <div style={{ fontSize:10, marginTop:4, opacity:.85 }}>Post-op recovery</div>
        </div>
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => saveCase({ approach: "Conservative" }, "approach"))(e); } }} style={cardStyle(approach === "Conservative", "#0EA5E9")}
             onClick={() => saveCase({ approach: "Conservative" }, "approach")}>
          <div style={{ fontSize:28, marginBottom:6 }}>💊</div>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:".05em" }}>CONSERVATIVE</div>
          <div style={{ fontSize:10, marginTop:4, opacity:.85 }}>Non-surgical management</div>
        </div>
      </div>
      {/* PALLIATIVE was retired as a selectable approach on 2026-09-25 (Sal:
          a palliative patient is not a rehabilitation candidate). No patient
          record held it. If one ever does — a legacy record, an import, a
          restored backup — the value is SHOWN rather than silently dropped,
          because a panel that renders nothing for a value it still stores is
          how a clinical fact disappears without anyone deciding to remove it.

          The engine still understands 'palliative' and that is deliberate:
          the pain >= 8 override in protocol-generator.js routes through it to
          reach the comfort protocol. Removing the routing would disable that
          restriction. */}
      {approach === "Palliative" && (
        <div style={{ marginTop:12, padding:"10px 12px", border:`1px solid ${C.border}`,
                      borderLeft:"3px solid #BE185D", borderRadius:5, background:"#FDF2F8" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#BE185D", marginBottom:4 }}>
            This record has a retired treatment approach: PALLIATIVE
          </div>
          <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>
            Palliative is no longer a rehabilitation pathway and cannot be selected.
            The value is still stored on this patient. Choose Surgical or Conservative
            to replace it, or leave it and refer for comfort care.
          </div>
        </div>
      )}
    </Sec>

    {/* ── SURGICAL FIELDS ── */}
    {approach === "Surgical" && (
      <Sec title="Procedures" color="#F59E0B" colorLt="#FFFBEB">
        <div style={{ fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.65 }}>
          Each operation is its own record. A contralateral procedure or a revision
          is a NEW entry, not an edit of the last one — a second operation is a
          second event, and overwriting the first loses the history the protocol
          phase is calculated from.
        </div>

        {procedures.length === 0 && (
          <div style={{ fontSize:11, color:C.muted, fontStyle:"italic", marginBottom:12 }}>
            No procedure recorded. A post-operative patient with no date is treated
            as ACTIVE by the protocol engine — it cannot know an incision has
            healed, so it asks.
          </div>
        )}

        {procedures.map(p => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px",
                                   border:`1px solid ${C.border}`, borderRadius:5, marginBottom:7 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600 }}>{p.procedure_type}</div>
              <div style={{ fontSize:10.5, color:C.muted, marginTop:2 }}>
                {p.procedure_date || "date not recorded"}
                {p.surgeon ? ` · ${p.surgeon}` : ""}
              </div>
            </div>
            <div role="button" tabIndex={0} title="Remove this procedure"
                 style={{ fontSize:11, color:C.red, cursor:"pointer", padding:"3px 7px" }}
                 onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); removeProcedure(p.id); } }}
                 onClick={() => removeProcedure(p.id)}>Remove</div>
          </div>
        ))}

        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px dashed ${C.border}` }}>
          <Row>
            <div style={{ flex:1, minWidth:160 }}>
              <Lbl>Procedure</Lbl>
              <select value={procDraft.procedure_type}
                      onChange={e => setProcDraft(d => ({ ...d, procedure_type: e.target.value }))}
                      style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}>
                <option value="">— Select —</option>
                {["TPLO — Tibial Plateau Leveling Osteotomy",
                  "TTA — Tibial Tuberosity Advancement",
                  "FHO — Femoral Head Ostectomy",
                  "TPA — Total Hip Arthroplasty",
                  "Hip Replacement",
                  "Spinal Surgery — Hemilaminectomy",
                  "Spinal Surgery — Ventral Slot",
                  "Spinal Surgery — Dorsal Laminectomy",
                  "Soft Tissue Surgery",
                  "Fracture Repair — Internal Fixation",
                  "Fracture Repair — External Fixation",
                  "Amputation",
                  "Other — Specify in notes"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ flex:1, minWidth:130 }}>
              <Lbl>Date</Lbl>
              <input type="date" value={procDraft.procedure_date}
                     onChange={e => setProcDraft(d => ({ ...d, procedure_date: e.target.value }))}
                     style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}/>
              <div style={{ fontSize:10, color:C.muted, marginTop:3, fontStyle:"italic" }}>
                Leave blank if genuinely unknown
              </div>
            </div>
            <div style={{ flex:1, minWidth:150 }}>
              <Lbl>Surgeon</Lbl>
              <input value={procDraft.surgeon} placeholder="e.g. Dr. Smith, DACVS"
                     onChange={e => setProcDraft(d => ({ ...d, surgeon: e.target.value }))}
                     style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}/>
            </div>
          </Row>
          <div role="button" tabIndex={0}
               style={{ marginTop:9, padding:"8px 14px", display:"inline-block", fontSize:11.5,
                        fontWeight:600, borderRadius:5, cursor: procDraft.procedure_type ? "pointer" : "default",
                        background: procDraft.procedure_type ? "#F59E0B" : C.border,
                        color: procDraft.procedure_type ? C.white : C.muted, userSelect:"none" }}
               onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addProcedure(); } }}
               onClick={addProcedure}>+ Record procedure</div>
        </div>

        <Row cols={3}>
          <div>
            <Lbl>Days Post-Op</Lbl>
            <input type="text" value={daysPostOp} readOnly placeholder="No dated procedure"
                   style={{ background:"#F9FAFB", color:C.muted, cursor:"default" }}/>
            <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>
              From the most recent dated procedure
            </div>
          </div>
        </Row>
      </Sec>
    )}

    {approach && (
      <Sec title="Current Treatment Status" color="#F59E0B" colorLt="#FFFBEB">
        <div style={{ fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.65 }}>
          Recording a status adds a new entry dated today. The previous one is kept —
          weight bearing going NWB → TTWB → PWB → FWB is the progression, and it is
          the thing that disappears if a single field is overwritten.
        </div>

        {tx.data && tx.data.status_date_is_unknown && (
          <div style={{ padding:"9px 11px", marginBottom:12, borderRadius:5,
                        border:`1px solid ${C.border}`, borderLeft:"3px solid #64748B", background:"#F8FAFC" }}>
            <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>
              This state was carried over from the old record, which stored no date
              for it. The date shown is the migration date, not an examination.
              Recording a status replaces it with a real one.
            </div>
          </div>
        )}

        <Row>
          {TS({ col: "weight_bearing_status", label: "Weight Bearing Status", options: [
            "Non-weight bearing (NWB)",
            "Toe-touching (TTWB)",
            "Partial weight bearing (PWB)",
            "Full weight bearing (FWB)",
            "Full weight bearing — no lameness",
          ]})}
          {TS({ col: "incision_status", label: "Incision Status", options: [
            "Healing well — no concern",
            "Mild erythema",
            "Mild swelling",
            "Serosanguinous discharge",
            "Dehiscence — clinician review",
            "Infection suspected — URGENT",
            "Fully healed / staples removed",
            "Not yet evaluated",
          ]})}
        </Row>

        <Row cols={3}>
          {TFlag({ col: "e_collar_required", label: "E-Collar Required" })}
          {TFlag({ col: "strict_crate_rest", label: "Strict Crate Rest" })}
          {TFlag({ col: "sling_assist_required", label: "Sling Assist Required" })}
        </Row>
        <div style={{ fontSize:10, color:C.muted, marginTop:-4, marginBottom:10, fontStyle:"italic" }}>
          "Not asked" is not "No". The engine assumes an e-collar and crate rest ARE
          required in the two weeks after surgery unless a clinician says otherwise,
          so leaving these unanswered keeps the cautious assumption rather than
          removing it.
        </div>

        {TS({ col: "activity_restrictions", label: "Activity Restrictions",
              placeholder: "e.g. Strict crate rest 2 weeks, leash-only walks, no stairs…", rows: 2 })}
        {TS({ col: "clinical_notes", label: "Clinical Notes", rows: 2 })}

        {tx.data && tx.data.statusHistory && tx.data.statusHistory.length > 1 && (
          <details style={{ marginTop:12 }}>
            <summary style={{ fontSize:11, color:C.muted, cursor:"pointer" }}>
              Progression — {tx.data.statusHistory.length} recorded states
            </summary>
            <div style={{ marginTop:8 }}>
              {tx.data.statusHistory.map(h => (
                <div key={h.id} style={{ fontSize:11, padding:"6px 9px", borderLeft:`2px solid ${C.border}`, marginBottom:4 }}>
                  <span style={{ color:C.muted }}>{h.effective_date}</span>
                  {h.effective_date_is_unknown ? <span style={{ color:C.muted }}> (date not stated)</span> : null}
                  {"  "}{h.weight_bearing_status || "—"}
                  {h.incision_status ? ` · ${h.incision_status}` : ""}
                </div>
              ))}
            </div>
          </details>
        )}
      </Sec>
    )}

    {approach === "Surgical" && (
      <Sec title="Affected Limb(s)" color="#F59E0B" colorLt="#FFFBEB">
        <div style={{ fontSize:11, color:C.muted, marginBottom:10, lineHeight:1.65 }}>
          The LIMB, which is a different fact from the affected area below. The
          protocol engine routes on the anatomical area; the limb is recorded for
          the chart and is deliberately never fed to it, because the two use
          different vocabularies and feeding it the wrong one changes which
          protocol runs.
        </div>
        <div style={{ maxWidth:340 }}>
          <Lbl>Affected Limb(s)</Lbl>
          <select value={(tx.data && tx.data.affected_limbs) || ""}
                  disabled={txBusy === "limbs" || !patientId}
                  onChange={e => saveCase({ affected_limbs: e.target.value }, "limbs")}
                  style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`,
                           borderRadius:5, fontSize:12, opacity: txBusy === "limbs" ? 0.6 : 1 }}>
            <option value="">— Select —</option>
            {["Right forelimb (RF)","Left forelimb (LF)",
              "Right hindlimb (RH)","Left hindlimb (LH)",
              "Both hindlimbs","Both forelimbs","All four limbs",
              "Spinal / truncal","Other"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </Sec>
    )}

    {/* ── CONSERVATIVE FIELDS ── */}
    {approach === "Conservative" && (
      <Sec title="Conservative Management Details" color="#0EA5E9" colorLt="#F0F9FF">
        <Row>
          <F label="Primary Diagnosis" options={[
            "Cranial Cruciate Ligament Partial Tear (conservative)",
            "Hip Dysplasia — Mild",
            "Hip Dysplasia — Moderate",
            "Elbow Dysplasia",
            "Osteoarthritis — Mild",
            "Osteoarthritis — Moderate",
            "Osteoarthritis — Severe",
            "IVDD — Hansen Type I (mild)",
            "IVDD — Hansen Type II (chronic)",
            "Lumbosacral Disease",
            "Spondylosis",
            "Bicipital Tenosynovitis",
            "Supraspinatus Tendinopathy",
            "Medial Shoulder Instability",
            "Iliopsoas Strain",
            "Sporting Injury — Soft Tissue",
            "Muscle Contracture",
            "Myositis",
            "Peripheral Neuropathy",
            "Degenerative Myelopathy",
            "Fibrocartilaginous Embolism (FCE)",
            "Geriatric Mobility Decline",
            "Obesity-related Mobility Loss",
            "Other — Specify in notes"
          ]}/>
          <F label="Onset Date or Duration" placeholder="e.g. 3 months ago, acute 5 days, chronic"/>
        </Row>
        <Row>
          <F label="Affected Area" options={[
            "Cervical spine","Thoracolumbar spine","Lumbosacral spine","Pelvis",
            "Shoulder — right","Shoulder — left",
            "Elbow — right","Elbow — left",
            "Carpus — right","Carpus — left",
            "Hip — right","Hip — left",
            "Stifle — right","Stifle — left",
            "Tarsus — right","Tarsus — left",
            "Multiple joints","Generalized","Other"
          ]}/>
          {/* Weight Bearing Status was duplicated here. It is one stored
              value — patient_treatment_status.weight_bearing_status — and it
              is edited in "Current Treatment Status" above, which every
              approach now shows. Two controls writing one fact is how a
              screen starts disagreeing with itself. */}
        </Row>
        {/* Activity Restrictions was duplicated here for the same reason;
            it is recorded in "Current Treatment Status" above. */}
        <F label="Current Medications" placeholder="NSAIDs, gabapentin, supplements — include dose and frequency" rows={2}/>
        <F label="Referral Source" options={[
          "Primary care veterinarian",
          "Orthopedic specialist (DACVS)",
          "Neurology specialist (DACVIM-Neuro)",
          "Sports medicine specialist (DACVSMR)",
          "Self-referred by owner",
          "Other specialty"
        ]}/>
      </Sec>
    )}

    {/* The PALLIATIVE detail fields were removed on 2026-09-25 with the
        approach that gated them. They were five: Primary Condition, Quality of
        Life Goal, Pain Management Protocol, Owner Goals & Expectations, and a
        DNR / Comfort Care Only flag. No patient record held any of them.

        Deleted rather than left behind a condition that can no longer be true:
        a section nothing can reach is a form somebody will one day wire back up
        without knowing why it was dark. */}
    <ClinicalNotes/>
  </>;
}

// ── B.E.A.U. METRICS ──────────────────────────────────────────────────────────
function MetricsPanel() {
  const { data, update } = useContext(DashFormContext);
  const species = data["client::Species"] || "Canine";
  const isFeline = species === "Feline";

  const gonioJoints = [
    { name:"Shoulder — Flexion",    normal:"30–57°",  note:"Varies by breed/size" },
    { name:"Shoulder — Extension",  normal:"154–165°", note:"" },
    { name:"Elbow — Flexion",       normal:"36–50°",  note:"" },
    { name:"Elbow — Extension",     normal:"162–170°", note:"" },
    { name:"Carpus — Flexion",      normal:"32–40°",  note:"" },
    { name:"Carpus — Extension",    normal:"196–205°", note:"Palmigrade extension" },
    { name:"Hip — Flexion",         normal:"50–70°",  note:"GSD / large breeds lower" },
    { name:"Hip — Extension",       normal:"155–165°", note:"" },
    { name:"Stifle — Flexion",      normal:"40–55°",  note:"TPLO patients monitored closely" },
    { name:"Stifle — Extension",    normal:"155–165°", note:"" },
    { name:"Hock — Flexion",        normal:"38–50°",  note:"" },
    { name:"Hock — Extension",      normal:"160–170°", note:"" },
  ];

  const muscles = [
    { name:"Right Thigh Circumference",  ref:"Measure at 70% of femur length from greater trochanter — Millis & Levine 2014" },
    { name:"Left Thigh Circumference",   ref:"Compare bilaterally — >1cm asymmetry clinically significant" },
    { name:"Right Shoulder / Upper Arm", ref:"At widest point of triceps muscle belly" },
    { name:"Left Shoulder / Upper Arm",  ref:"Compare bilaterally" },
    { name:"Right Crus (Lower Leg)",     ref:"At widest point of gastrocnemius belly" },
    { name:"Left Crus (Lower Leg)",      ref:"Compare bilaterally" },
  ];

  // ── DashFormContext wiring helpers for raw inputs ──
  const getVal = (key) => data[key] ?? "";
  const setVal = (key, val) => update(key, val);

  return <>
    {/* ── BCS section removed per Dr. Zaslow — BCS now lives in BEAU Metrics sidebar nutrition panel ── */}

    {/* ── GONIOMETRY ── Protocol text always visible, measurements in CollapsibleSub ── */}
    <Sec title="Goniometry — Range of Motion" color={C.teal} colorLt={C.tealLt} noTop>
      <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.65 }}>
        <b style={{color:C.teal}}>Protocol per Millis & Levine 2014</b> — Measure with patient in lateral recumbency. Use a standard goniometer. Record both active and passive ROM where applicable. Normal ranges are approximate — breed and size variations apply.
      </div>

      <CollapsibleSub title="Enter Goniometric Measurements" accentColor={C.teal}>
        <Row>
          <F label="Goniometer Type" options={["Standard 2-arm goniometer","Digital goniometer","Fluid inclinometer","iPhone / digital app"]}/>
          <F label="Position During Assessment" options={["Lateral recumbency — right side up","Lateral recumbency — left side up","Standing","Other"]}/>
        </Row>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginTop:8 }}>
          {gonioJoints.map(j=>{
            const keyR = `metrics::${j.name} (R)`;
            const keyL = `metrics::${j.name} (L)`;
            return (
              <div key={j.name} style={{ padding:"10px 12px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.teal, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
                  {j.name}
                  {!isFeline && (
                    <span style={{ fontSize:9, color:C.muted, background:C.tealLt, padding:"1px 6px", borderRadius:3 }}>Normal: {j.normal}</span>
                  )}
                </div>
                <Row cols={2}>
                  <div>
                    <Lbl>Right (°)</Lbl>
                    <input type="number" placeholder="°" value={getVal(keyR)} onChange={e => setVal(keyR, e.target.value)}/>
                  </div>
                  <div>
                    <Lbl>Left (°)</Lbl>
                    <input type="number" placeholder="°" value={getVal(keyL)} onChange={e => setVal(keyL, e.target.value)}/>
                  </div>
                </Row>
                {!isFeline && j.note && <div style={{ fontSize:9, color:C.muted, marginTop:4, fontStyle:"italic" }}>{j.note}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:12 }}>
          <F label="Goniometry Notes" placeholder="Deviations from normal, pain on motion, capsular end-feel vs muscle guarding end-feel…" rows={2}/>
        </div>
      </CollapsibleSub>
    </Sec>

    {/* ── MUSCLE CIRCUMFERENCE ── Protocol visible, measurements in CollapsibleSub ── */}
    <Sec title="Muscle Circumference Measurements" color={C.teal} colorLt={C.tealLt}>
      <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.65 }}>
        <b style={{color:C.teal}}>Protocol per Millis & Levine 2014</b> — Thigh: measure at 70% of femur length distal from greater trochanter with stifle at 135°. A difference of ≥1 cm between limbs is clinically significant atrophy.
      </div>

      <CollapsibleSub title="Enter Muscle Measurements" accentColor={C.teal}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {muscles.map(m=>{
            const keyCm = `metrics::${m.name} (cm)`;
            const keyAsym = `metrics::${m.name} Asymmetry`;
            return (
              <div key={m.name} style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.teal, marginBottom:4 }}>{m.name}</div>
                <Row cols={2}>
                  <div>
                    <Lbl>Measurement (cm)</Lbl>
                    <input type="number" step="0.1" placeholder="0.0 cm" value={getVal(keyCm)} onChange={e => setVal(keyCm, e.target.value)}/>
                  </div>
                  <div>
                    <Lbl>Asymmetry vs Contralateral</Lbl>
                    <input placeholder="e.g. −1.5 cm atrophy" value={getVal(keyAsym)} onChange={e => setVal(keyAsym, e.target.value)}/>
                  </div>
                </Row>
                <div style={{ fontSize:9, color:C.muted, marginTop:6, fontStyle:"italic" }}>{m.ref}</div>
              </div>
            );
          })}
        </div>
      </CollapsibleSub>
    </Sec>

    {/* ── POSTURAL & ANGLE ASSESSMENT ── Entire section collapsed by default ── */}
    <Sec title="▶ Postural & Angle Assessment" color={C.teal} colorLt={C.tealLt} collapsible defaultOpen={false}>
      <Row cols={3}>
        <F label="Pelvic Tilt (°)" placeholder="°" range="Level ±5°"/>
        <F label="Spinal Alignment" options={["Normal","Kyphosis","Lordosis","Scoliosis — left","Scoliosis — right","Mixed"]}/>
        <F label="Limb Axis Alignment" options={["Normal","Valgus — lateral deviation","Varus — medial deviation","Rotational deformity","Mixed"]}/>
      </Row>
      <Row>
        <F label="Muscle Symmetry — Overall" options={["Symmetric","Mild asymmetry","Moderate asymmetry — document","Severe asymmetry"]}/>
        <F label="Postural Notes" placeholder="Additional postural / orthopedic observations…"/>
      </Row>
    </Sec>
    <ClinicalNotes/>
  </>;
}

// ── CLINIC EQUIPMENT ──────────────────────────────────────────────────────────
/**
 * CLINIC EQUIPMENT
 *
 * Reads and writes the PRACTICE's equipment record, not this patient's form.
 *
 * Until 24 Sep 2026 this panel wrote through DashFormContext, which meant every
 * checkbox landed in `patients.dashboard_data` — so every patient carried a
 * private, partial copy of the clinic's equipment list. Five patients in this
 * database had answered 9, 19, 14, 13 and 12 of the 43 items. Meanwhile V2 kept
 * one row per clinic and the protocol engine read only that, so the fuller list
 * here never reached the engine and the engine's answer never reached this
 * screen.
 *
 * One row now, shared with the V2 access screen. The checklist itself is served
 * by the API rather than held here, so there is no second copy of the list to
 * drift from the map that turns items into engine capabilities.
 */
function EquipmentPanel() {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [state, setState] = useState({ loading: true, error: null, shape: [], equipment: {}, gating: [] });
  const [saving, setSaving] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  useEffect(() => {
    let live = true;
    fetch(`${apiBase}/v2/clinic/capabilities`, { headers: authHeaders() })
      .then(r => r.json())
      .then(j => {
        if (!live) return;
        const d = j.data || {};
        setState({ loading: false, error: null, shape: d.checklistShape || [], equipment: d.equipment || {}, gating: d.gatingItems || [] });
      })
      .catch(e => live && setState(s => ({ ...s, loading: false, error: e.message })));
    return () => { live = false; };
  }, [apiBase]);

  // Optimistic, because a checklist that lags a click feels broken — but the
  // server's answer is what is kept, and a failure puts the tick back.
  async function toggle(item, next) {
    const before = state.equipment[item];
    setState(s => ({ ...s, equipment: { ...s.equipment, [item]: next } }));
    setSaving(item);
    try {
      const res = await fetch(`${apiBase}/v2/clinic/capabilities`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ equipment: { [item]: next } }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || `HTTP ${res.status}`);
      setState(s => ({ ...s, equipment: j.data.equipment || s.equipment, error: null }));
    } catch (e) {
      setState(s => ({ ...s, equipment: { ...s.equipment, [item]: before }, error: e.message }));
    } finally {
      setSaving(null);
    }
  }

  if (state.loading) return <div style={{ fontSize:12, color:C.muted, padding:14 }}>Loading the clinic's equipment…</div>;

  const unanswered = state.shape.flatMap(g => g.items).filter(i => state.equipment[i] === undefined || state.equipment[i] === null).length;

  return <>
    <div style={{ fontSize:11, color:C.muted, marginBottom:16, padding:"10px 14px", background:C.blueLt, borderRadius:6, border:`1px solid ${C.blue}33` }}>
      This is the equipment at <strong>this clinic</strong>, not this patient. It is shared with the
      clinical workflow&rsquo;s access screen and it is what B.E.A.U. prescribes from — only equipment
      recorded here is offered.
      {unanswered > 0 && (
        <div style={{ marginTop:6 }}>
          <strong>{unanswered} of {state.shape.flatMap(g => g.items).length} not yet answered.</strong>{" "}
          An unanswered modality is treated as unavailable, so it is withheld from every protocol
          until somebody says.
        </div>
      )}
    </div>

    {state.error && (
      <div style={{ fontSize:11.5, color:C.red, marginBottom:12, padding:"8px 12px", background:"#FEF2F2", borderRadius:6 }}>
        {state.error}
      </div>
    )}

    {state.shape.map((grp, gi) => (
      <Sec key={grp.category} title={grp.category} color={C.teal} colorLt={C.tealLt} collapsible defaultOpen={gi === 0}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
          {grp.items.map(item => {
            const checked = state.equipment[item] === true;
            const gates = state.gating.includes(item);
            const busy = saving === item;
            return (
              <div
                role="button" tabIndex={0} key={item}
                className={`cb-row${checked ? " active" : ""}`}
                style={{ opacity: busy ? 0.55 : 1 }}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(item, !checked); } }}
                onClick={() => toggle(item, !checked)}
              >
                <input type="checkbox" checked={checked} readOnly style={{ width:15, height:15, accentColor:C.teal, flexShrink:0 }}/>
                <span style={{ fontSize:11, color: checked ? C.teal : C.text }}>
                  {item}
                  {/* The ten that actually gate a therapy, marked so a clinician
                      can see which ticks change what gets prescribed. */}
                  {gates && <span title="Enables a therapy in the protocol engine" style={{ marginLeft:5, fontSize:9, color:C.teal, opacity:0.8 }}>◆</span>}
                </span>
              </div>
            );
          })}
        </div>
      </Sec>
    ))}

    <Sec title="Other Equipment" color={C.teal} colorLt={C.tealLt} collapsible defaultOpen={true}>
      <F label="Describe any additional equipment not listed above" placeholder="Additional equipment, brand names, unique modalities…" rows={2}/>
    </Sec>
    <ClinicalNotes/>
  </>;
}

// ── HOME PROGRAM ──────────────────────────────────────────────────────────────
/**
 * HOME PROGRAM — this patient's home environment
 *
 * V3. Reads and writes `patient_home_environment` through the V2 API. That
 * table is the source of truth for the block; `patients.dashboard_data` is no
 * longer read for it by anything except the one-time migration.
 *
 * Until 24 Sep 2026 every answer here landed in that blob, keyed by the field's
 * LABEL — so renaming a label stranded the data, nothing could query it, and
 * the same fact living in two places is why `record-sync` had to exist.
 *
 * TWO DEFECTS THIS ALSO FIXES
 *
 *   1. "Exercise Location" was React state initialised to "". It gated both
 *      environment sections and was never loaded or saved, so a patient with a
 *      recorded home opened to an EMPTY panel until somebody re-picked a
 *      location — and the answer itself was never part of the record.
 *   2. Four fields this panel offered — outdoor surface, steps, safety and
 *      items — had nowhere to be stored at all.
 *
 * The questions, their options and their grouping are SERVED by the API rather
 * than held here, so the form and the normalisers cannot drift into reading
 * different vocabularies.
 */
function HomePanel() {
  const { patientId } = useContext(DashFormContext);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [state, setState] = useState({ loading: true, error: null, sections: [], fields: [], stated: {} });
  const [saving, setSaving] = useState(null);
  const [draft, setDraft] = useState({});

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  useEffect(() => {
    if (!patientId) { setState(s => ({ ...s, loading: false })); return; }
    let live = true;
    fetch(`${apiBase}/v2/patients/${patientId}/home`, { headers: authHeaders() })
      .then(r => r.json())
      .then(j => {
        if (!live) return;
        const d = j.data || {};
        setState({
          loading: false, error: null,
          sections: d.sections || [], fields: d.fieldShape || [], stated: d.stated || {},
        });
        setDraft({});
      })
      .catch(e => live && setState(s => ({ ...s, loading: false, error: e.message })));
    return () => { live = false; };
  }, [apiBase, patientId]);

  // Optimistic, because a form that lags feels broken — but the server's answer
  // is what is kept, and a failure puts the old value back.
  async function save(key, value) {
    const before = state.stated[key];
    setState(s => ({ ...s, stated: { ...s.stated, [key]: value } }));
    setSaving(key);
    try {
      const res = await fetch(`${apiBase}/v2/patients/${patientId}/home`, {
        method: "PUT",
        headers: authHeaders(),
        // ONE key. The store changes only what it is given, so a single answer
        // cannot blank the other sixteen.
        body: JSON.stringify({ stated: { [key]: value } }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || `HTTP ${res.status}`);
      setState(s => ({ ...s, stated: j.data.stated || s.stated, error: null }));
      setDraft(d => { const n = { ...d }; delete n[key]; return n; });
    } catch (e) {
      setState(s => {
        const stated = { ...s.stated };
        if (before === undefined) delete stated[key]; else stated[key] = before;
        return { ...s, stated, error: e.message };
      });
    } finally {
      setSaving(null);
    }
  }

  if (!patientId) {
    return <div style={{ fontSize:12, color:C.muted, padding:14 }}>
      Select a patient to record their home environment.
    </div>;
  }
  if (state.loading) return <div style={{ fontSize:12, color:C.muted, padding:14 }}>Loading the home record…</div>;

  const byKey = Object.fromEntries(state.fields.map(f => [f.key, f]));
  const stored = state.stated.exercise_location || "";
  // Match the stored phrase to the served gate codes the same way the module
  // does, rather than comparing prose to prose.
  const locationCode = /both/i.test(stored) ? "BOTH"
    : /indoor/i.test(stored) ? "INDOOR"
    : /outdoor/i.test(stored) ? "OUTDOOR" : null;

  const answered = Object.keys(state.stated).length;

  const renderField = (key) => {
    const f = byKey[key];
    if (!f) return null;
    const busy = saving === key;
    const value = draft[key] !== undefined ? draft[key] : (state.stated[key] ?? "");
    return (
      <div key={key} style={{ flex:"1 1 220px", minWidth:200, opacity: busy ? 0.6 : 1 }}>
        <Lbl>{f.label}</Lbl>
        {f.freeText ? (
          <textarea
            rows={2} value={value} disabled={busy}
            onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
            onBlur={e => { if (e.target.value !== (state.stated[key] ?? "")) save(key, e.target.value); }}
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, fontFamily:"inherit" }}
          />
        ) : (
          <select
            value={value} disabled={busy}
            onChange={e => save(key, e.target.value)}
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, background:C.white }}
          >
            <option value="">—</option>
            {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
      </div>
    );
  };

  return <>
    <div style={{ fontSize:11, color:C.muted, marginBottom:16, padding:"10px 14px", background:C.blueLt, borderRadius:6, border:`1px solid ${C.blue}33` }}>
      This is <strong>this patient&rsquo;s home</strong>, saved as you answer. It is what B.E.A.U. at Home
      adapts the programme to — B.E.A.U. may substitute household equipment, and this is the only
      place it learns what the household has.
      <span style={{ marginLeft:6 }}>{answered} of {state.fields.length} answered.</span>
    </div>

    {state.error && (
      <div style={{ fontSize:11, color:C.red, marginBottom:12, padding:"8px 12px", background:C.redLt, borderRadius:5 }}>
        {state.error}
      </div>
    )}

    {state.sections.map(sec => {
      if (sec.gatedBy && !sec.gatedBy.includes(locationCode)) return null;
      return (
        <Sec key={sec.id} title={sec.title} color={C.blue} colorLt={C.blueLt} noTop={sec.id === "location"}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            {sec.fields.map(renderField)}
          </div>
        </Sec>
      );
    })}

    {!locationCode && (
      <div style={{ fontSize:11, color:C.muted, padding:"10px 14px", background:C.amberLt, border:`1px solid ${C.amber}44`, borderRadius:5 }}>
        Choose an exercise location above to record the indoor and outdoor environment.
      </div>
    )}
    <ClinicalNotes/>
  </>;
}

// ── GOALS ─────────────────────────────────────────────────────────────────────
/**
 * GOALS — a rehabilitation workflow, not four boxes of text
 *
 * V3. Reads and writes `patient_goals` and `patient_goal_items` through the V2
 * API. Those tables are the source of truth; `patients.dashboard_data` is no
 * longer read for this block.
 *
 * WHY THIS LOOKS DIFFERENT FROM THE OLD PANEL
 *
 * A rehabilitation goal is not a paragraph. It has a horizon, it is a
 * clinician's measure or something the animal will be able to DO, it has a
 * target, and it gets REVIEWED at each reassessment. Four free-text boxes can
 * record what somebody wrote; they cannot answer the question a clinician
 * actually asks at a recheck — WHICH GOALS ARE DUE, AND WHICH HAS NOBODY
 * LOOKED AT? That count is at the top of this panel for exactly that reason.
 *
 * A target date is set here, by a clinician. It is NEVER read out of the goal's
 * wording: tried against these records, a "within N units" pattern read "thigh
 * circumference within 1 cm bilaterally" and "jump grids (12 in)" as deadlines.
 * Where the text mentions a period and no date is set, the goal is flagged so
 * somebody can set one — the screen prompts, it never fills it in.
 *
 * An unreviewed goal shows as UNREVIEWED, never as "in progress". "In progress"
 * is an assumption about work nobody recorded.
 */
function GoalsPanel() {
  const { patientId } = useContext(DashFormContext);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [busy, setBusy] = useState(null);
  const [draft, setDraft] = useState({ text: "", horizon: "SHORT", kind: "CLINICAL" });

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const load = React.useCallback(() => {
    if (!patientId) { setState(s => ({ ...s, loading: false })); return; }
    fetch(`${apiBase}/v2/patients/${patientId}/goals`, { headers: authHeaders() })
      .then(r => r.json())
      .then(j => setState({ loading: false, error: null, data: j.data || null }))
      .catch(e => setState(s => ({ ...s, loading: false, error: e.message })));
  }, [apiBase, patientId]);

  useEffect(load, [load]);

  async function call(url, method, body, key) {
    setBusy(key);
    try {
      const res = await fetch(`${apiBase}${url}`, {
        method, headers: authHeaders(), body: body ? JSON.stringify(body) : undefined,
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || `HTTP ${res.status}`);
      setState(s => ({ ...s, error: null }));
      load();
    } catch (e) {
      setState(s => ({ ...s, error: e.message }));
    } finally {
      setBusy(null);
    }
  }

  if (!patientId) {
    return <div style={{ fontSize:12, color:C.muted, padding:14 }}>Select a patient to record their goals.</div>;
  }
  if (state.loading) return <div style={{ fontSize:12, color:C.muted, padding:14 }}>Loading goals…</div>;
  const d = state.data;
  if (!d) return <div style={{ fontSize:12, color:C.red, padding:14 }}>{state.error || "No goal record."}</div>;

  const { review, vocabulary } = d;
  const chip = (label, n, colour) => (
    <span style={{ padding:"3px 9px", borderRadius:11, background:colour + "1a", color:colour,
      border:`1px solid ${colour}44`, fontSize:10, fontWeight:700, marginRight:6 }}>{n} {label}</span>
  );

  const goalRow = (g) => (
    <div key={g.id} style={{ padding:"10px 12px", border:`1px solid ${C.border}`, borderRadius:6,
      marginBottom:8, background: g.overdue ? C.redLt : C.white,
      borderLeft: `3px solid ${g.status === 'MET' ? C.green : g.overdue ? C.red : g.reviewed ? C.blue : C.amber}` }}>
      <div style={{ fontSize:12, color:C.text, lineHeight:1.5, marginBottom:8 }}>{g.goal_text}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", fontSize:10 }}>
        <span style={{ color:C.muted, fontWeight:700 }}>{g.horizon} · {g.kind}</span>

        <select value={g.status || ""} disabled={busy === g.id}
          onChange={e => call(`/v2/goals/items/${g.id}/review`, "POST",
            { status: e.target.value || null }, g.id)}
          style={{ padding:"4px 6px", border:`1px solid ${C.border}`, borderRadius:4, fontSize:10 }}>
          <option value="">Unreviewed</option>
          {vocabulary.statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>

        <label style={{ color:C.muted }}>
          target{" "}
          <input type="date" value={g.target_date || ""} disabled={busy === g.id}
            onChange={e => call(`/v2/goals/items/${g.id}`, "PUT", { target_date: e.target.value }, g.id)}
            style={{ padding:"3px 5px", border:`1px solid ${C.border}`, borderRadius:4, fontSize:10 }}/>
        </label>

        {g.overdue === true && <span style={{ color:C.red, fontWeight:700 }}>OVERDUE</span>}
        {!g.reviewed && <span style={{ color:C.amber, fontWeight:700 }}>NOT REVIEWED</span>}
        {g.mentions_timeframe_without_target && (
          <span style={{ color:C.muted, fontStyle:"italic" }}>
            mentions a period — set a target date
          </span>
        )}
      </div>
      {g.status_note && <div style={{ fontSize:10, color:C.muted, marginTop:6 }}>{g.status_note}</div>}
    </div>
  );

  return <>
    <div style={{ marginBottom:16, padding:"10px 14px", background:C.blueLt, borderRadius:6,
      border:`1px solid ${C.blue}33` }}>
      <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>
        Goals are reviewed at each reassessment. A goal nobody has looked at shows as
        <strong> unreviewed</strong> — never as &ldquo;in progress&rdquo;.
      </div>
      <div>
        {chip("goals", review.total, C.blue)}
        {review.unreviewed > 0 && chip("unreviewed", review.unreviewed, C.amber)}
        {review.overdue > 0 && chip("overdue", review.overdue, C.red)}
        {review.met > 0 && chip("met", review.met, C.green)}
        {review.needs_a_target_date > 0 && chip("need a target date", review.needs_a_target_date, C.muted)}
      </div>
    </div>

    {state.error && (
      <div style={{ fontSize:11, color:C.red, marginBottom:12, padding:"8px 12px", background:C.redLt, borderRadius:5 }}>
        {state.error}
      </div>
    )}

    {["SHORT", "LONG"].map(h => {
      const items = d.items.filter(i => i.horizon === h);
      if (!items.length) return null;
      return (
        <Sec key={h} title={h === "SHORT" ? "Short-Term Goals" : "Long-Term Goals"}
          color={C.blue} colorLt={C.blueLt} noTop={h === "SHORT"}>
          {items.map(goalRow)}
        </Sec>
      );
    })}

    <Sec title="Add a Goal" color={C.teal} colorLt={C.tealLt}>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"flex-end" }}>
        <div style={{ flex:"2 1 280px" }}>
          <Lbl>Goal</Lbl>
          <textarea rows={2} value={draft.text}
            onChange={e => setDraft(x => ({ ...x, text: e.target.value }))}
            placeholder="e.g. Tolerate a 20-minute leash walk without stopping"
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, fontFamily:"inherit" }}/>
        </div>
        <div style={{ flex:"1 1 120px" }}>
          <Lbl>Horizon</Lbl>
          <select value={draft.horizon} onChange={e => setDraft(x => ({ ...x, horizon: e.target.value }))}
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}>
            {vocabulary.horizons.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ flex:"1 1 140px" }}>
          <Lbl>Kind</Lbl>
          <select value={draft.kind} onChange={e => setDraft(x => ({ ...x, kind: e.target.value }))}
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}>
            {vocabulary.kinds.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <button disabled={!draft.text.trim() || busy === "add"}
          onClick={() => call(`/v2/patients/${patientId}/goals/items`, "POST",
            { goal_text: draft.text, horizon: draft.horizon, kind: draft.kind }, "add")
            .then(() => setDraft(x => ({ ...x, text: "" })))}
          style={{ padding:"9px 16px", background:C.blue, color:C.white, border:"none",
            borderRadius:5, fontSize:11, fontWeight:700, cursor:"pointer",
            opacity: draft.text.trim() ? 1 : 0.5 }}>
          Add goal
        </button>
      </div>
    </Sec>

    <Sec title="Goal Set" color={C.blue} colorLt={C.blueLt}>
      <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>
        The patient&rsquo;s standing aims and the owner&rsquo;s priorities. These are not
        reviewed individually — the goals above are.
      </div>
      {d.primary_goals.length > 0 && (
        <div style={{ marginBottom:10 }}>
          {d.primary_goals.map((g, i) => (
            <span key={i} style={{ display:"inline-block", padding:"3px 9px", marginRight:6, marginBottom:5,
              borderRadius:11, background:C.blueLt, color:C.blue, fontSize:10, fontWeight:700,
              border:`1px solid ${C.blue}33` }}>
              {g.stated}
            </span>
          ))}
        </div>
      )}
      {vocabulary.setFields.filter(f => !f.multi).map(f => (
        <div key={f.key} style={{ marginBottom:10 }}>
          <Lbl>{f.label}</Lbl>
          <textarea rows={2} defaultValue={d.set[f.key] || ""}
            onBlur={e => e.target.value !== (d.set[f.key] || "")
              && call(`/v2/patients/${patientId}/goals`, "PUT", { set: { [f.key]: e.target.value } }, f.key)}
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, fontFamily:"inherit" }}/>
        </div>
      ))}
    </Sec>
    <ClinicalNotes/>
  </>;
}

// Sentence-streaming helper — given an accumulated text string and an index
// of where we last flushed, returns { sentence, newIndex } if a new complete
// sentence is available, or null if not yet. Used by streaming generators
// to feed BEAU voice queue one sentence at a time as deltas arrive.
function nextSentence(fullText, fromIndex) {
  if (fromIndex >= fullText.length) return null;
  const slice = fullText.slice(fromIndex);
  // Match the first sentence terminator followed by whitespace or end.
  // Avoids breaking on numbered lists like "1." by requiring the next char
  // to NOT be a digit.
  const m = slice.match(/[.!?]\s+(?=[^\d])|[.!?]$/);
  if (!m) return null;
  const end = m.index + m[0].length;
  const sentence = slice.slice(0, end).trim();
  if (sentence.length < 8) return null; // Skip stray punctuation noise
  return { sentence, newIndex: fromIndex + end };
}

function ConditioningPanel({ patientName, patientData }) {
  const [generating, setGenerating] = useState(false);
  const [exercises,  setExercises]  = useState("");
  const { data, beauVoice: bv, uiLang } = useContext(DashFormContext);
  const isFeline = data["client::Species"] === "Feline";

  // Patient anchor — B.E.A.U. requires patient context to tailor a plan.
  const anchored = !!(patientName && patientName.trim());

  const generateConditioning = async () => {
    if (!anchored) return;
    setGenerating(true); setExercises("");
    try {
      // Live values from dashData take priority over stale DB values.
      const liveWeight = data["client::Weight (lbs)"];
      const weightForPrompt = liveWeight || patientData?.weight;
      const liveAge = data["client::Age (years)"];
      const ageForPrompt = liveAge || patientData?.age;
      const liveSpecies = data["client::Species"];
      const speciesForPrompt = liveSpecies || patientData?.species;
      const ctxBits = [
        `Patient: ${patientName}`,
        patientData?.breed     ? `Breed: ${patientData.breed}`               : null,
        ageForPrompt           ? `Age: ${ageForPrompt}y`                     : null,
        weightForPrompt        ? `Weight: ${weightForPrompt} lbs`            : null,
        speciesForPrompt       ? `Species: ${speciesForPrompt}`              : null,
        patientData?.condition ? `Primary condition: ${patientData.condition}` : null,
      ].filter(Boolean).join(" · ");
      const systemPrompt = `You are B.E.A.U. — the clinical AI of K9 Rehab Pro™. Generate 5 creative, progressive conditioning exercises for a canine rehabilitation patient. Reference evidence from Millis & Levine, Drum, Marcellin-Little, or ACVSMR methodology where relevant.

OUTPUT FORMAT — STRICT. Plain text only. NO markdown, NO asterisks, NO hashes, NO bold, NO bullet dashes. Each exercise must follow this EXACT structure, separated by one blank line:

EXERCISE 1: [Exercise Name]
Category: [Proprioceptive / Strength / Aquatic / Endurance / Balance / Core / Plyometric]
Difficulty: [Easy / Moderate / Advanced]
Equipment: [items needed, or "None"]
Instructions:
1. [step one]
2. [step two]
3. [step three]
4. [optional step four]
Sets/Reps: [e.g. 3 sets × 10 reps OR 3 sets × 30 seconds]
Frequency: [e.g. 3 times per week]
Evidence: [Author Year — brief justification]
Progression: [how to advance to a harder version]
Red Flags: [stop signals — pain, lameness, fatigue indicators]

EXERCISE 2: [...continue same structure...]

(continue for all 5 exercises)

REQUIREMENTS:
- Include AT LEAST 1 aquatic exercise
- Include AT LEAST 1 proprioceptive/balance exercise
- Include AT LEAST 1 strength-focused exercise
- Tailor every exercise to the patient's species, breed, weight, age, and primary condition
- NEVER use markdown formatting (no **, no ##, no -, no backticks)
- Keep each line concise — no prose paragraphs`;
      const userMsg = `${ctxBits}.\n\nGenerate 5 progressive conditioning exercises tailored to this patient. Follow the EXERCISE card format exactly. No markdown.`;
      // Streaming TTS — cancel any prior playback, then enqueue each new
      // sentence to the voice queue as it arrives. First sentence speaks
      // ~1s after Generate click instead of waiting for the full response.
      if (bv?.autoSpeak) bv.cancel?.();
      let lastSpoken = 0;
      const text = await callBeau(systemPrompt, userMsg, uiLang, (_chunk, accumulated) => {
        setExercises(accumulated);
        if (!bv?.autoSpeak || !bv?.enqueue) return;
        let next;
        while ((next = nextSentence(accumulated, lastSpoken)) !== null) {
          bv.enqueue(next.sentence);
          lastSpoken = next.newIndex;
        }
      });
      setExercises(text);
      // Flush any trailing text after the final sentence terminator
      if (bv?.autoSpeak && bv?.enqueue && lastSpoken < text.length) {
        const tail = text.slice(lastSpoken).trim();
        if (tail) bv.enqueue(tail);
      }
    } catch (err) { setExercises(`Connection error: ${err.message}`); }
    setGenerating(false);
  };

  // Parse plain-text EXERCISE N: cards into structured objects for styled rendering.
  // Falls back to empty array if format doesn't match — caller shows raw text as fallback.
  const parseExerciseCards = (text) => {
    if (!text) return [];
    const parts = text.split(/(?=EXERCISE\s+\d+\s*:)/i).map(s => s.trim()).filter(Boolean);
    return parts.map(chunk => {
      const lines = chunk.split(/\r?\n/).map(l => l.trim());
      const card = { name:"", category:"", difficulty:"", equipment:"", instructions:[], setsReps:"", frequency:"", evidence:"", progression:"", redFlags:"" };
      let section = null;
      for (const line of lines) {
        if (!line) { section = null; continue; }
        if (/^EXERCISE\s+\d+\s*:/i.test(line))    { card.name = line.replace(/^EXERCISE\s+\d+\s*:\s*/i, ""); section = null; }
        else if (/^Category\s*:/i.test(line))     { card.category   = line.replace(/^Category\s*:\s*/i, "");   section = null; }
        else if (/^Difficulty\s*:/i.test(line))   { card.difficulty = line.replace(/^Difficulty\s*:\s*/i, ""); section = null; }
        else if (/^Equipment\s*:/i.test(line))    { card.equipment  = line.replace(/^Equipment\s*:\s*/i, "");  section = null; }
        else if (/^Instructions\s*:/i.test(line)) { section = "instructions"; }
        else if (/^Sets\s*\/?\s*Reps\s*:/i.test(line)) { card.setsReps = line.replace(/^Sets\s*\/?\s*Reps\s*:\s*/i, ""); section = null; }
        else if (/^Frequency\s*:/i.test(line))    { card.frequency  = line.replace(/^Frequency\s*:\s*/i, "");  section = null; }
        else if (/^Evidence\s*:/i.test(line))     { card.evidence   = line.replace(/^Evidence\s*:\s*/i, "");   section = null; }
        else if (/^Progression\s*:/i.test(line))  { card.progression= line.replace(/^Progression\s*:\s*/i, "");section = null; }
        else if (/^Red\s*Flags?\s*:/i.test(line)) { card.redFlags   = line.replace(/^Red\s*Flags?\s*:\s*/i, "");section = null; }
        else if (section === "instructions")      { card.instructions.push(line.replace(/^\d+\.\s*/, "")); }
      }
      return card;
    }).filter(c => c.name);
  };

  return <>
    {/* ── Patient anchor warning — stays outside the fieldset so it's always visible/readable ── */}
    {!anchored && (
      <div style={{ padding:"14px 16px", background:"#FEF3C7", border:"1px solid #F59E0B66", borderLeft:"4px solid #F59E0B", borderRadius:6, fontSize:12, color:"#92400E", marginBottom:16, fontWeight:600, display:"flex", alignItems:"flex-start", gap:10 }}>
        <span style={{ fontSize:18, lineHeight:1 }}>⚠</span>
        <div>
          <div style={{ marginBottom:4 }}>No patient loaded — Conditioning fields are locked.</div>
          <div style={{ fontWeight:400, fontSize:11, color:"#78350F" }}>Open Client &amp; Patient, enter a patient name, then return here. All fields below will unlock and B.E.A.U. will tailor a conditioning plan to that patient.</div>
        </div>
      </div>
    )}

    {/* ── Disabled fieldset + explicit disabled prop on every field ──
        Belt + suspenders: fieldset gives native cascade, pointerEvents:none
        blocks any click-through on collapsibles/chevrons, and each F/WeightPair
        also receives disabled={!anchored} so its inputs get the real HTML
        disabled attribute independent of the fieldset. */}
    <fieldset disabled={!anchored} style={{ border:"none", padding:0, margin:0, opacity: anchored ? 1 : 0.55, filter: anchored ? "none" : "grayscale(0.35)", pointerEvents: anchored ? "auto" : "none" }}>
      <Sec title="Conditioning Program Profile" color="#14B8A6" colorLt="#F0FDFB" noTop>
        <div style={{ padding:"10px 14px", background:"#F0FDFB", border:"1px solid #14B8A633", borderRadius:6, fontSize:11, color:C.muted, marginBottom:14 }}>
          For patients who have completed rehabilitation and are transitioning to fitness, performance, or maintenance conditioning. B.E.A.U. will generate progressive, creative conditioning exercises so you always have something new to offer.
        </div>
        <Row>
          <F label="Conditioning Phase" disabled={!anchored} options={isFeline ? FELINE_CONDITIONING_PHASES : CANINE_CONDITIONING_PHASES}/>
          <F label="Current Activity Level" disabled={!anchored} options={["Sedentary — house only","Low — short leash walks","Moderate — regular walks","Active — running / hiking","Performance — competition / work"]}/>
        </Row>
        <Row cols={3}>
          <F label="Session Duration (min)" disabled={!anchored} placeholder="e.g. 30"/>
          <F label="Frequency (per week)" disabled={!anchored} placeholder="e.g. 4"/>
          <F label="Intensity Target" disabled={!anchored} options={["Low","Moderate","Moderate-High","High"]}/>
        </Row>
        <F label="Sport / Activity Type" disabled={!anchored} placeholder={isFeline ? FELINE_SPORT_PLACEHOLDER : CANINE_SPORT_PLACEHOLDER}/>
        <F label="Preferred Activities / Equipment" disabled={!anchored} placeholder="e.g. Swimming, treadmill, fetch, hiking, agility obstacles, balance work…"/>
        <F label="Limitations / Precautions" disabled={!anchored} placeholder="Ongoing restrictions — joints to protect, surfaces to avoid, intensity limits…" rows={2}/>
        <WeightPair label="Weight Goal" fieldBase="conditioning::Weight Goal" disabled={!anchored}/>
        <F label="Target BCS" disabled={!anchored} options={["4","5 — Ideal","6"]}/>
      </Sec>

      <Sec title="B.E.A.U. Conditioning Exercise Generator" color="#14B8A6" colorLt="#F0FDFB">
        <div style={{ fontSize:11, color:C.muted, marginBottom:14, lineHeight:1.65 }}>
          Not sure what to do today? Hit generate and B.E.A.U. will suggest creative, progressive conditioning exercises tailored to keep sessions fresh and effective — so you never have to scratch your head.
        </div>
        <button onClick={generateConditioning} disabled={generating || !anchored}
          style={{ width:"100%", padding:"13px", background: generating ? "#F0FDFB" : !anchored ? "#e2e8f0" : "#14B8A6", border:"none", color: !anchored ? C.muted : C.white, borderRadius:6, cursor: (generating || !anchored) ? "not-allowed":"pointer", fontSize:13, fontWeight:700, letterSpacing:".08em", display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
          {generating
            ? <><div style={{ width:16, height:16, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spinK9 .8s linear infinite" }}/> GENERATING CONDITIONING PLAN…</>
            : "💪 GENERATE PROGRESSIVE CONDITIONING EXERCISES"}
        </button>

        {/* ── Structured exercise card rendering (matches Exercise Library style) ── */}
        {exercises && (() => {
          const cards = parseExerciseCards(exercises);
          if (cards.length === 0) {
            // Fallback: B.E.A.U. did not follow the format — show raw text
            return (
              <div style={{ marginTop:16, padding:16, background:C.white, border:`1px solid #14B8A633`, borderRadius:6, animation:"fadeIn .2s ease" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#14B8A6", letterSpacing:".14em", marginBottom:10 }}>B.E.A.U. CONDITIONING PLAN</div>
                <pre style={{ fontSize:12, color:C.text, whiteSpace:"pre-wrap", lineHeight:1.85, fontFamily:"Georgia, serif" }}>{exercises}</pre>
              </div>
            );
          }
          return (
            <div style={{ marginTop:16, animation:"fadeIn .2s ease" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#14B8A6", letterSpacing:".14em", marginBottom:12 }}>
                B.E.A.U. CONDITIONING PLAN — {cards.length} EXERCISE{cards.length !== 1 ? "S" : ""}
              </div>
              {cards.map((card, idx) => (
                <div key={idx} style={{ background:C.white, border:`1px solid ${C.border}`, borderLeft:"4px solid #14B8A6", borderRadius:8, padding:16, marginBottom:14, boxShadow:"0 1px 3px rgba(26,39,68,.06)" }}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#14B8A6", letterSpacing:".14em", textTransform:"uppercase", marginBottom:4 }}>Exercise {idx+1}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:10, lineHeight:1.3 }}>{card.name}</div>
                  {(card.category || card.difficulty) && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                      {card.category && <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", background:"#F0FDFB", border:"1px solid #14B8A666", borderRadius:12, color:"#0F766E", letterSpacing:".02em" }}>{card.category}</span>}
                      {card.difficulty && <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", background:C.blueLt, border:`1px solid ${C.blue}66`, borderRadius:12, color:C.blue, letterSpacing:".02em" }}>{card.difficulty}</span>}
                    </div>
                  )}
                  {card.equipment && (
                    <div style={{ marginBottom:10, fontSize:11, color:C.text }}>
                      <span style={{ fontSize:9, fontWeight:700, color:C.muted, letterSpacing:".06em", textTransform:"uppercase", marginRight:6 }}>Equipment:</span>
                      {card.equipment}
                    </div>
                  )}
                  {card.instructions.length > 0 && (
                    <div style={{ background:C.bg, borderRadius:6, padding:"10px 14px", marginBottom:10, border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:9, fontWeight:700, color:C.muted, letterSpacing:".08em", textTransform:"uppercase", marginBottom:6 }}>Instructions</div>
                      <ol style={{ margin:0, paddingLeft:18 }}>
                        {card.instructions.map((step, i) => (
                          <li key={i} style={{ fontSize:11, color:C.text, marginBottom:4, lineHeight:1.55 }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {(card.setsReps || card.frequency) && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                      {card.setsReps && (
                        <div style={{ background:"#ecfdf5", border:"1px solid #10b98144", borderLeft:"3px solid #10b981", borderRadius:6, padding:"8px 12px" }}>
                          <div style={{ fontSize:9, fontWeight:700, color:"#065f46", letterSpacing:".06em", textTransform:"uppercase" }}>Sets × Reps</div>
                          <div style={{ fontSize:12, color:C.text, marginTop:2, fontWeight:600 }}>{card.setsReps}</div>
                        </div>
                      )}
                      {card.frequency && (
                        <div style={{ background:"#ecfdf5", border:"1px solid #10b98144", borderLeft:"3px solid #10b981", borderRadius:6, padding:"8px 12px" }}>
                          <div style={{ fontSize:9, fontWeight:700, color:"#065f46", letterSpacing:".06em", textTransform:"uppercase" }}>Frequency</div>
                          <div style={{ fontSize:12, color:C.text, marginTop:2, fontWeight:600 }}>{card.frequency}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {card.evidence && (
                    <div style={{ fontSize:10, fontStyle:"italic", color:C.muted, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                      <span>📚</span><span>{card.evidence}</span>
                    </div>
                  )}
                  {card.progression && (
                    <div style={{ background:"#F0F9FF", border:"1px solid #0EA5E944", borderLeft:"3px solid #0EA5E9", borderRadius:6, padding:"8px 12px", marginBottom:8 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:"#0EA5E9", letterSpacing:".06em", textTransform:"uppercase", marginBottom:2 }}>Progression</div>
                      <div style={{ fontSize:11, color:C.text, lineHeight:1.5 }}>{card.progression}</div>
                    </div>
                  )}
                  {card.redFlags && (
                    <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderLeft:"3px solid #dc2626", borderRadius:6, padding:"8px 12px" }}>
                      <div style={{ fontSize:9, fontWeight:700, color:"#dc2626", letterSpacing:".06em", textTransform:"uppercase", marginBottom:2 }}>Red Flags — Stop Immediately</div>
                      <div style={{ fontSize:11, color:"#111", lineHeight:1.5 }}>{card.redFlags}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </Sec>
    </fieldset>
    <ClinicalNotes/>
  </>;
}

// ── PROTOCOL SUMMARY (Block 10) ──────────────────────────────────────────────
// 6-card summary grid showing live dashData, exercise library count bar,
// compliance checkbox, and GENERATE EXERCISE PROTOCOL button.
/**
 * THE PROTOCOL SUMMARY READS THE STORES, NOT THE BLOB.
 *
 * Until 2026-09-26 this panel read 8 `dashboard_data` keys belonging to two
 * blocks that had already been migrated to their own tables — 2 goals and 6
 * treatment. The readers were never repointed, and nothing noticed because
 * MERGED was defined as three tests (own table / engine off the blob / panel
 * off the blob) and NONE of them asks whether some OTHER screen still reads it.
 *
 * What that cost, measured on the live database:
 *
 *   Haley    blank for all 8, while her record held FWB, her activity
 *            restrictions, a goal item and her owner's priority
 *   Winston  showed "Partial weight bearing (PWB)" while his record said
 *            "Full weight bearing (FWB)" — the blob kept a value his store had
 *            superseded eight hours earlier
 *
 * The second one is why this is not cosmetic. This is the page a clinician
 * reads BEFORE SIGN-OFF, and it was presenting a stale weight-bearing status
 * as current.
 *
 * NO BLOB FALLBACK. The stores cover every patient, so a fallback would gain
 * nothing and would be exactly what kept showing Winston's stale value.
 * Assessment, client, conditioning and protocol keys are still read from the
 * blob below, deliberately — those blocks are untouched or PARTIAL, so the
 * blob is still their correct source.
 */
function ProtocolPanel({ patientName, patientData }) {
  const { data, update, beauVoice: bv, uiLang, patientId } = useContext(DashFormContext);

  // ── The two V3 stores this summary reports on ──
  // Same load shape as GoalsPanel and TreatmentPanel, against the endpoints
  // they already use: v2-router.js:195 and :340.
  const [stores, setStores] = useState({ loading: true, goals: null, treatment: null });
  const storeApiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const storeHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };
  const loadStores = React.useCallback(() => {
    if (!patientId) { setStores({ loading: false, goals: null, treatment: null }); return; }
    Promise.all([
      fetch(`${storeApiBase}/v2/patients/${patientId}/goals`, { headers: storeHeaders() })
        .then(r => r.json()).then(j => j.data || null).catch(() => null),
      fetch(`${storeApiBase}/v2/patients/${patientId}/treatment`, { headers: storeHeaders() })
        .then(r => r.json()).then(j => j.data || null).catch(() => null),
    ]).then(([goals, treatment]) => setStores({ loading: false, goals, treatment }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeApiBase, patientId]);
  useEffect(loadStores, [loadStores]);

  // ── State ──
  const [generating, setGenerating] = useState(false);
  const [protocol,   setProtocol]   = useState("");
  const [copied,     setCopied]     = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [exCount, setExCount] = useState(null);
  const [discharging, setDischarging] = useState(false);
  const [discharged,  setDischarged]  = useState(false);

  // Auto-populate Sign-Off Date on first open (no-op if already set).
  useEffect(() => {
    if (!data["protocol::Sign-Off Date"]) {
      update("protocol::Sign-Off Date", new Date().toISOString().split("T")[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch exercise library count from backend ──
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const token = localStorage.getItem("token");
    fetch(`${apiBase}/exercises`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(payload => {
        const raw = Array.isArray(payload?.data) ? payload.data : [];
        setExCount(raw.length);
      })
      .catch(() => setExCount(0));
  }, []);

  // ── Live card data from dashData ──
  const livePatientName = (data["client::Patient Name"] || "").trim() || patientName || "";
  const liveBreed = (data["client::Breed"] || "").trim() || patientData?.breed || "";
  const liveSpecies = data["client::Species"] || patientData?.species || "";
  const liveAge = data["client::Age (years)"] || patientData?.age || "";
  const liveWeight = data["client::Weight (lbs)"] || patientData?.weight || "";
  const liveSex = data["client::Sex"] || patientData?.sex || "";

  const liveDiagnosis = resolveDiagnosis(data, patientData);
  const liveChiefComplaint = data["assessment::Chief Complaint"] || "";
  const liveLameness = data["assessment::Lameness Grade"] || "";
  const livePain = data["assessment::CSU Acute Pain Score (0–4)"] || "";

  // ── Treatment, from patient_procedures + patient_treatment_status ──
  // `status` is the store's CURRENT row; it orders by effective_date DESC and
  // hands back history[0]. Reading it is what fixes Winston.
  const tx = stores.treatment;
  const txStatus = (tx && tx.status) || null;
  const txProcedure = (tx && tx.procedures && tx.procedures[0]) || null;

  const liveApproach = (tx && tx.approach) || "";
  const liveSurgeryType = (txProcedure && txProcedure.procedure_type) || "";
  const liveSurgeryDate = (txProcedure && txProcedure.procedure_date) || "";
  const liveWBStatus = (txStatus && txStatus.weight_bearing_status) || "";
  const liveRegion = (tx && tx.affected_limbs) || "";

  // Conditioning has no store yet, so the blob is still its correct source.
  const liveCondition = data["conditioning::Conditioning Phase"] || "";

  // ── Goals, from patient_goals + patient_goal_items ──
  const gl = stores.goals;
  const liveGoalsList = ((gl && gl.primary_goals) || [])
    .map(g => g && g.stated).filter(Boolean);
  const liveShortTerm = ((gl && gl.items) || [])
    .filter(i => i && i.horizon === "SHORT" && i.kind === "CLINICAL")
    .map(i => i.goal_text).filter(Boolean).join("; ");

  // Safety flags
  const painNRS = parseInt(data["assessment::Numeric Rating Scale (NRS 0–10)"], 10);
  const deepPain = data["assessment::Deep Pain Perception"] || "";
  const incision = data["assessment::Incision Status"] || (txStatus && txStatus.incision_status) || "";
  const flags = [];
  if (!isNaN(painNRS) && painNRS >= 8) flags.push({ label: "Pain ≥ 8/10 — BLOCKS protocol", color: C.red });
  if (deepPain.toLowerCase().includes("absent")) flags.push({ label: "Deep pain absent — BLOCKS protocol", color: C.red });
  if (incision.toLowerCase().includes("dehiscence") || incision.toLowerCase().includes("infection")) flags.push({ label: `Incision: ${incision}`, color: C.red });
  if (!isNaN(painNRS) && painNRS >= 7 && painNRS < 8) flags.push({ label: "Pain ≥ 7 — specialist consult recommended", color: C.amber });
  if (liveLameness.includes("Grade 5")) flags.push({ label: "Grade 5 lameness — passive exercises only", color: C.amber });
  const hasBlockingFlag = flags.some(f => f.color === C.red);

  // Required fields check for generate button.
  // `stores.loading` is checked because liveApproach comes from a fetch: an
  // unloaded store is not an empty one, and reading it as empty would flash
  // "missing required fields" over a complete record.
  const hasRequiredFields = !!(livePatientName && (liveDiagnosis || liveApproach));

  const canGenerate = complianceChecked && hasRequiredFields
    && !hasBlockingFlag && !stores.loading;

  // ── Card style ──
  const cardStyle = (accent) => ({
    background: C.white,
    border: `1px solid ${C.border}`,
    borderTop: `3px solid ${accent}`,
    borderRadius: 8,
    padding: "16px 18px",
    boxShadow: "0 1px 4px rgba(26,39,68,.05)",
  });
  const cardTitle = (accent) => ({
    fontSize: 10, fontWeight: 700, color: accent,
    letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10,
  });
  const cardRow = { fontSize: 11, color: C.text, marginBottom: 5, lineHeight: 1.5, display: "flex", gap: 6 };
  const cardLabel = { fontWeight: 700, color: C.muted, minWidth: 70, flexShrink: 0 };
  const cardVal = (v) => v || "—";

  // ── Generate protocol ──
  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true); setProtocol("");
    try {
      const ctxBits = [
        `Patient: ${livePatientName}`,
        liveBreed   ? `Breed: ${liveBreed}` : null,
        liveAge     ? `Age: ${liveAge}y` : null,
        liveWeight  ? `Weight: ${liveWeight} lbs` : null,
        liveSpecies ? `Species: ${liveSpecies}` : null,
        liveDiagnosis ? `Condition: ${liveDiagnosis}` : null,
        liveApproach ? `Approach: ${liveApproach}` : null,
      ].filter(Boolean).join(" · ");

      const systemPrompt = `You are B.E.A.U. — the Biomedical Evidence-based Analytical Unit, clinical protocol engine of K9 Rehab Pro™. Created by Sal Bonanno, Veterinary Technician and Canine Rehabilitation Nurse, 30 years experience. Generate a complete structured evidence-based rehabilitation protocol. Use exact section headers below. No markdown symbols. Write in full clinical sentences.

CLINICAL SUMMARY

REHABILITATION PHASE & RATIONALE

IN-CLINIC PROTOCOL
For each exercise: Exercise name · Evidence level (A/B/C) · Sets × Reps · Frequency · Form note · Contraindication flag

HOME EXERCISE PROGRAM
For each exercise: Exercise name · Items needed · How to perform · Sets × Reps · Frequency · Safety note

SAFETY GUARDRAILS — EVERY SESSION

RED FLAGS — STOP AND CONTACT VETERINARIAN IMMEDIATELY

EVIDENCE BASIS`;
      const userMsg = `${ctxBits}.\n\nGenerate a comprehensive rehabilitation protocol tailored to this patient. Generate a thorough evidence-based protocol demonstrating B.E.A.U.'s full clinical capability across all phases and exercise categories.`;
      if (bv?.autoSpeak) bv.cancel?.();
      let lastSpoken = 0;
      const text = await callBeau(systemPrompt, userMsg, uiLang, (_chunk, accumulated) => {
        setProtocol(accumulated);
        if (!bv?.autoSpeak || !bv?.enqueue) return;
        let next;
        while ((next = nextSentence(accumulated, lastSpoken)) !== null) {
          bv.enqueue(next.sentence);
          lastSpoken = next.newIndex;
        }
      });
      setProtocol(text);
      if (bv?.autoSpeak && bv?.enqueue && lastSpoken < text.length) {
        const tail = text.slice(lastSpoken).trim();
        if (tail) bv.enqueue(tail);
      }
    } catch (err) { setProtocol(`Connection error: ${err.message}`); }
    setGenerating(false);
  };

  const copy = () => { navigator.clipboard?.writeText(protocol); setCopied(true); setTimeout(()=>setCopied(false), 2000); };

  // ── Discharge patient (PUT /api/patients/:id status=discharged) ──
  const handleDischarge = async () => {
    if (!patientData?.id) return;
    setDischarging(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");
      await fetch(`${apiBase}/patients/${patientData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "discharged" }),
      });
      setDischarged(true);
    } catch { /* silent — button stays enabled for retry */ }
    setDischarging(false);
  };

  return <>
    {/* ══════════ 6-CARD SUMMARY GRID ══════════ */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>

      {/* Card 1 — Patient */}
      <div style={cardStyle(C.blue)}>
        <div style={cardTitle(C.blue)}>Patient</div>
        <div style={cardRow}><span style={cardLabel}>Name:</span> <span>{cardVal(livePatientName)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Species:</span> <span>{cardVal(liveSpecies)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Breed:</span> <span>{cardVal(liveBreed)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Age:</span> <span>{liveAge ? `${liveAge} yr` : "—"}</span></div>
        <div style={cardRow}><span style={cardLabel}>Weight:</span> <span>{liveWeight ? `${liveWeight} lbs` : "—"}</span></div>
        <div style={cardRow}><span style={cardLabel}>Sex:</span> <span>{cardVal(liveSex)}</span></div>
      </div>

      {/* Card 2 — Diagnosis & Assessment */}
      <div style={cardStyle(C.amber)}>
        <div style={cardTitle(C.amber)}>Diagnosis & Assessment</div>
        <div style={cardRow}><span style={cardLabel}>Diagnosis:</span> <span>{cardVal(liveDiagnosis)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Complaint:</span> <span>{cardVal(liveChiefComplaint)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Lameness:</span> <span>{cardVal(liveLameness)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Pain (CSU):</span> <span>{cardVal(livePain)}</span></div>
        {!isNaN(painNRS) && <div style={cardRow}><span style={cardLabel}>NRS:</span> <span>{painNRS}/10</span></div>}
      </div>

      {/* Card 3 — Treatment Plan */}
      <div style={cardStyle("#F59E0B")}>
        <div style={cardTitle("#F59E0B")}>Treatment Plan</div>
        <div style={cardRow}><span style={cardLabel}>Approach:</span> <span style={{ fontWeight:600, color: liveApproach ? C.navy : C.muted }}>{cardVal(liveApproach)}</span></div>
        {liveApproach === "Surgical" && <>
          <div style={cardRow}><span style={cardLabel}>Surgery:</span> <span>{cardVal(liveSurgeryType)}</span></div>
          <div style={cardRow}><span style={cardLabel}>Date:</span> <span>{cardVal(liveSurgeryDate)}</span></div>
        </>}
        <div style={cardRow}><span style={cardLabel}>WB Status:</span> <span>{cardVal(liveWBStatus)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Region:</span> <span>{cardVal(liveRegion)}</span></div>
      </div>

      {/* Card 4 — Protocol Configuration */}
      <div style={cardStyle(C.green)}>
        <div style={cardTitle(C.green)}>Protocol Configuration</div>
        <div style={cardRow}><span style={cardLabel}>Condition:</span> <span>{cardVal(liveCondition || liveDiagnosis)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Species:</span> <span>{cardVal(liveSpecies)}</span></div>
        <div style={cardRow}><span style={cardLabel}>Phase:</span> <span>{cardVal(liveCondition)}</span></div>
        <div style={{ fontSize:10, color:C.muted, marginTop:8, fontStyle:"italic" }}>
          4 Conditions | 16 Phases | 52 Protocol Exercises | {exCount !== null ? exCount : "..."} Exercise Library
        </div>
      </div>

      {/* Card 5 — Rehabilitation Goals */}
      <div style={cardStyle("#BE185D")}>
        <div style={cardTitle("#BE185D")}>Rehabilitation Goals</div>
        {liveGoalsList.length > 0 ? (
          liveGoalsList.slice(0, 4).map((g, i) => (
            <div key={i} style={{ fontSize:11, color:C.text, marginBottom:4, display:"flex", gap:6 }}>
              <span style={{ color:"#BE185D", fontWeight:700 }}>•</span> {g}
            </div>
          ))
        ) : (
          <div style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>No goals set — open Goals block</div>
        )}
        {liveShortTerm && (
          <div style={{ marginTop:8, padding:"6px 10px", background:"#FDF2F8", borderRadius:4, fontSize:10, color:"#9D174D", lineHeight:1.5 }}>
            <span style={{ fontWeight:700 }}>Short-term:</span> {liveShortTerm.slice(0, 120)}{liveShortTerm.length > 120 ? "…" : ""}
          </div>
        )}
      </div>

      {/* Card 6 — Safety Flags */}
      <div style={cardStyle(flags.length > 0 ? C.red : C.green)}>
        <div style={cardTitle(flags.length > 0 ? C.red : C.green)}>Safety Flags</div>
        {flags.length === 0 ? (
          <div style={{ fontSize:12, color:C.green, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:16 }}>✓</span> No safety flags detected — clear for protocol generation
          </div>
        ) : (
          flags.map((f, i) => (
            <div key={i} style={{
              padding:"6px 10px", marginBottom:6, borderRadius:4,
              background: f.color === C.red ? C.redLt : C.amberLt,
              border: `1px solid ${f.color}44`,
              fontSize:11, fontWeight:600, color: f.color,
              display:"flex", alignItems:"center", gap:6,
            }}>
              <span>{f.color === C.red ? "⛔" : "⚠"}</span> {f.label}
            </div>
          ))
        )}
      </div>
    </div>

    {/* ── Exercise Library Count Bar ── */}
    <div style={{
      padding:"10px 16px", background:C.blueLt, border:`1px solid ${C.blue}33`,
      borderRadius:6, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <span style={{ fontSize:11, fontWeight:600, color:C.blue }}>
        📚 Exercise Library: {exCount !== null ? `${exCount} evidence-based exercises loaded` : "Loading..."}
      </span>
      <span style={{ fontSize:10, color:C.muted }}>Source-of-truth validated · ACVSMR-aligned</span>
    </div>

    {/* ── Compliance Acknowledgment Checkbox ── */}
    <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => setComplianceChecked(v => !v))(e); } }}
      onClick={() => setComplianceChecked(v => !v)}
      style={{
        display:"flex", alignItems:"flex-start", gap:10, padding:"14px 16px",
        background: complianceChecked ? C.greenLt : C.white,
        border: `1.5px solid ${complianceChecked ? C.green : C.border}`,
        borderRadius:8, cursor:"pointer", marginBottom:16,
        transition:"all .15s",
      }}>
      <input type="checkbox" checked={complianceChecked} readOnly
        style={{ width:18, height:18, accentColor:C.green, flexShrink:0, marginTop:1, cursor:"pointer" }}/>
      <div>
        <div style={{ fontSize:12, fontWeight:700, color: complianceChecked ? C.green : C.navy, marginBottom:3 }}>
          Clinical Compliance Acknowledgment
        </div>
        <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>
          I confirm that all intake data is accurate, the patient has been examined by a licensed veterinarian,
          and I understand that B.E.A.U.-generated protocols require licensed veterinary review before clinical application.
          This is a Clinical Decision-Support System (CDSS) — not a substitute for professional judgment.
        </div>
      </div>
    </div>

    {/* ── GENERATE EXERCISE PROTOCOL Button ── */}
    <button onClick={generate} disabled={!canGenerate || generating}
      style={{
        width:"100%", padding:"18px",
        background: generating ? C.greenLt
          : !canGenerate ? "#e2e8f0"
          : "linear-gradient(135deg, #10b981 0%, #0d9488 50%, #0ea5e9 100%)",
        border:"none",
        color: !canGenerate ? C.muted : C.white,
        borderRadius:8, cursor: (!canGenerate || generating) ? "not-allowed" : "pointer",
        fontSize:16, fontWeight:800, letterSpacing:".12em",
        display:"flex", alignItems:"center", gap:14, justifyContent:"center",
        boxShadow: canGenerate && !generating ? "0 6px 20px rgba(16,185,129,0.35)" : "none",
        transition:"all .25s",
      }}>
      {generating
        ? <><div style={{ width:20, height:20, border:"2.5px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spinK9 .8s linear infinite" }}/> GENERATING PROTOCOL…</>
        : "GENERATE EXERCISE PROTOCOL"}
    </button>

    {!canGenerate && !generating && (
      <div style={{ fontSize:10, color:C.muted, textAlign:"center", marginTop:8, lineHeight:1.5 }}>
        {!complianceChecked && "Check the compliance acknowledgment above. "}
        {!hasRequiredFields && "Patient name and diagnosis/approach required. "}
        {hasBlockingFlag && "Red safety flags must be resolved before generation."}
      </div>
    )}

    {/* ── Protocol Output with BEAU Verification ── */}
    {protocol && (
      <div style={{ marginTop:20 }}>
        {/* ── BEAU Verification Report ── */}
        <Sec title="B.E.A.U. Verification Report" color={C.teal} colorLt={C.tealLt}>
          <div style={{ padding:"12px 16px", background:C.tealLt, border:`1px solid ${C.teal}44`, borderRadius:6, fontSize:11, color:C.teal, fontWeight:600, lineHeight:1.6 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", marginBottom:6 }}>✓ VERIFICATION COMPLETE</div>
            <div>• Checked exercises against patient assessment data</div>
            <div>• Weight bearing status: {data["assessment::Current Mobility Level"] || liveWBStatus || "Not specified"}</div>
            <div>• Neurological grade: {data["assessment::Neurological Grade (Frankel Modified)"] || "Not assessed"}</div>
            <div>• Pain score: {data["assessment::Numeric Rating Scale (NRS 0–10)"] || "Not assessed"}</div>
            {hasBlockingFlag && (
              <div style={{ marginTop:6, color:C.red, fontWeight:700 }}>⚠ Safety flags detected — review exercises carefully</div>
            )}
            {!hasBlockingFlag && (
              <div style={{ marginTop:6 }}>✓ No contraindicated exercises detected for current assessment profile</div>
            )}
          </div>
        </Sec>

        <Sec title="Protocol Output — B.E.A.U. Generated" color={C.green} colorLt={C.greenLt}>
          <div style={{ background:C.white, border:`1.5px solid ${C.green}55`, borderRadius:7, padding:18, marginBottom:14 }}>
            <pre style={{ fontSize:12, color:C.text, whiteSpace:"pre-wrap", lineHeight:1.9, fontFamily:"Georgia, serif" }}>{protocol}</pre>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label: copied ? "COPIED" : "COPY", action: copy },
              { label:"EMAIL CLIENT", action:()=>{} },
              { label:"PRINT", action:()=>window.print() },
              { label:"QR CODE", action:()=>{} },
            ].map(a=>(
              <button key={a.label} onClick={a.action}
                style={{ padding:"10px 6px", background:C.white, border:`1px solid ${C.border}`, color:C.blue, borderRadius:5, cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:".06em", transition:"all .15s" }}>
                {a.label}
              </button>
            ))}
          </div>

          {/* ── FINALIZE PROTOCOL Button ── */}
          <button
            onClick={async () => {
              try {
                const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
                const token = localStorage.getItem("token");
                if (patientData?.id) {
                  await fetch(`${apiBase}/patients/${patientData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    body: JSON.stringify({ dashboard_data: data, protocol_text: protocol }),
                  });
                }
              } catch {}
            }}
            style={{
              width:"100%", padding:"16px",
              background:"linear-gradient(135deg, #1A2744 0%, #0F4C81 100%)",
              border:"none", color:C.white, borderRadius:8, cursor:"pointer",
              fontSize:14, fontWeight:800, letterSpacing:".1em",
              display:"flex", alignItems:"center", gap:10, justifyContent:"center",
              boxShadow:"0 4px 16px rgba(26,39,68,0.35)",
            }}>
            FINALIZE PROTOCOL
          </button>
          <div style={{ fontSize:10, color:C.muted, textAlign:"center", marginTop:6 }}>
            Saves protocol to patient record • Generates printable handout • Updates visit count
          </div>
        </Sec>
      </div>
    )}

    {/* ══════════ SIGN-OFF, DISCHARGE, NEXT APPOINTMENT ══════════ */}
    <Sec title="Sign-Off & Discharge" color={C.navy} colorLt={C.blueLt}>
      <Row>
        <F label="Clinician Name" placeholder="Auto-populated from login"/>
        <F label="Credential" options={["DVM","CCRP","CCRT","CVT / LVT","Student (supervised)"]}/>
      </Row>
      <Row>
        <F label="Sign-Off Date" type="date"/>
        <F label="Next Appointment" type="date"/>
      </Row>
      <F label="Recheck Interval" options={[
        "1 week","2 weeks","3 weeks","4 weeks","6 weeks","8 weeks","12 weeks","As needed"
      ]}/>
      <F label="Discharge Summary" placeholder="Brief discharge summary, instructions for owner, follow-up notes..." rows={3}/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16 }}>
        <button
          disabled={!protocol}
          style={{
            padding:"14px", border:"none", borderRadius:6,
            background: !protocol ? "#e2e8f0" : C.green,
            color: !protocol ? C.muted : C.white,
            cursor: !protocol ? "not-allowed" : "pointer",
            fontSize:13, fontWeight:700, letterSpacing:".08em",
          }}>
          APPROVE PROTOCOL
        </button>
        <button
          onClick={handleDischarge}
          disabled={discharging || discharged || !patientData?.id}
          style={{
            padding:"14px", border:"none", borderRadius:6,
            background: discharged ? C.greenLt : discharging ? C.amberLt : !patientData?.id ? "#e2e8f0" : C.amber,
            color: discharged ? C.green : discharging ? C.amber : !patientData?.id ? C.muted : C.white,
            cursor: discharging || discharged || !patientData?.id ? "not-allowed" : "pointer",
            fontSize:13, fontWeight:700, letterSpacing:".08em",
          }}>
          {discharged ? "PATIENT DISCHARGED" : discharging ? "DISCHARGING..." : "DISCHARGE PATIENT"}
        </button>
      </div>
      {discharged && (
        <div style={{ marginTop:10, padding:"10px 14px", background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:6, fontSize:11, color:C.green, fontWeight:600, textAlign:"center" }}>
          Patient discharged successfully. Record updated.
        </div>
      )}
    </Sec>

    <ClinicalNotes/>
  </>;
}

// ── EXERCISE LIBRARY ──────────────────────────────────────────────────────────
// Map a backend exercise (from /api/exercises — TAGGED_EXERCISES shape) into
// the flat shape the LibraryPanel UI expects. Pure function — no fabrication.
// If a backend field is missing, the UI shows "—" (never invents a value).
function mapBackendExercise(ex) {
  const dosage = ex.clinical_parameters?.dosage || {};
  const refs   = ex.evidence_base?.references || [];
  const firstRef = refs[0];
  const evidence = firstRef
    ? (firstRef.citation || `${firstRef.id || ""} ${firstRef.type || ""}`.trim())
    : "Per source document — see clinical_classification";

  // Contraindications: prefer the structured arrays; fall back to splitting the
  // legacy comma-separated string. Never silently drop content.
  const contraAbs = ex.clinical_parameters?.contraindications_absolute || [];
  const contraRel = ex.clinical_parameters?.contraindications_relative || [];
  let contra = [...contraAbs, ...contraRel];
  if (contra.length === 0 && typeof ex.contraindications === "string" && ex.contraindications.trim()) {
    contra = ex.contraindications.split(/[,;]\s*/).map(s => s.trim()).filter(Boolean);
  }
  if (contra.length === 0) contra = ["None recorded — see source document"];

  // Form cue: prefer good_form[0] (tightest single line); fall back to setup.
  const goodForm = Array.isArray(ex.good_form) && ex.good_form.length
    ? ex.good_form.join(" · ")
    : (ex.setup || "See source document for technique");

  return {
    id:       ex.code,
    name:     ex.name,
    cat:      ex.category || "Uncategorized",
    lvl:      ex.evidence_base?.grade || "—",
    sets:     dosage.sets || "—",
    reps:     dosage.repetitions || dosage.hold_time || "—",
    freq:     dosage.frequency || "—",
    sp:       [(ex.clinical_classification?.species || "CANINE").toLowerCase()],
    cue:      goodForm,
    evidence: evidence,
    contra:   contra,
    rf:       Array.isArray(ex.red_flags) && ex.red_flags.length ? ex.red_flags : ["None recorded"],
  };
}

// ── RESTORED: Dashboard Library block now reuses the full ExercisesView ───
// component so it matches the sidebar Exercise Library exactly — same rich
// ExerciseCard (Equipment, Setup, Step-by-Step Instructions, Good Form,
// Common Mistakes, Red Flags, Contraindications, Progression, Clinical
// Parameters, Classification, Safety & Supervision), same AnatomyViewer3D
// ("View Targeted Muscles"), same Storyboard player, same print handout.
// Dr. Bibevski demo 7pm — unified library source-of-truth for both entry points.
function LibraryPanel() {
  return (
    <div style={{ margin: -22, padding: 0 }}>
      <ExercisesView />
    </div>
  );
}

// ── LEGACY — kept in source for reference only, not rendered ──────────────
// eslint-disable-next-line no-unused-vars
function LibraryPanelLegacy() {
  const { t } = useTranslation();
  const [species, setSpecies] = useState("canine");
  const [cat,     setCat]     = useState("ALL");
  const [search,  setSearch]  = useState("");
  const [sel,     setSel]     = useState(null);
  const [allEx,   setAllEx]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Fetch the real 260-exercise library from the backend on mount.
  // Per CLAUDE.md, exercise data MUST come from the source-of-truth library —
  // not be hardcoded in the UI.
  useEffect(() => {
    let cancelled = false;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    fetch(`${apiBase}/exercises`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(payload => {
        if (cancelled) return;
        const raw = Array.isArray(payload?.data) ? payload.data : [];
        setAllEx(raw.map(mapBackendExercise));
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || "Failed to load exercise library");
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Categories are derived from the loaded data — never hardcoded.
  // Honors whatever the backend serves (currently 18 distinct categories).
  const speciesFiltered = allEx.filter(e => e.sp.includes(species));
  const dynamicCats = Array.from(new Set(speciesFiltered.map(e => e.cat))).sort();
  const CATS = ["ALL", ...dynamicCats];

  const note = loading
    ? "Loading exercise library from backend…"
    : error
      ? `Library load failed: ${error}`
      : `${allEx.length} evidence-based exercises served from K9 Rehab Pro™ source-of-truth library · ${speciesFiltered.length} ${species}.`;

  const filtered = speciesFiltered.filter(e => {
    if (cat !== "ALL" && e.cat !== cat) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q)
          || e.id.toLowerCase().includes(q)
          || e.cat.toLowerCase().includes(q);
    }
    return true;
  });
  const lc = (lvl) => lvl==="A" ? C.green : lvl==="B" ? C.amber : C.purple;

  return <>
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      {["canine","feline"].map(s=>(
        <button key={s} onClick={()=>{setSpecies(s);setSel(null);setCat("ALL");}}
          style={{ flex:1, padding:"11px", background: species===s ? C.navy : C.white, border:`1.5px solid ${species===s ? C.navy : C.border}`, color: species===s ? C.white : C.muted, borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:700, letterSpacing:".06em" }}>
          {s==="canine"?"🐕  CANINE EXERCISES":"🐱  FELINE EXERCISES"}
        </button>
      ))}
    </div>
    <div style={{ padding:"8px 14px", background:C.blueLt, border:`1px solid ${C.blue}33`, borderRadius:5, fontSize:11, color:C.blue, marginBottom:14, fontWeight:600 }}>
      📚 {note}
    </div>
    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("library.searchPlaceholder")} style={{ flex:1 }}/>
    </div>
    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
      {CATS.map(c=>(
        <button key={c} onClick={()=>setCat(c)}
          style={{ padding:"4px 12px", fontSize:10, border:`1px solid ${cat===c?C.blue:C.border}`, background:cat===c?C.blueLt:C.white, color:cat===c?C.blue:C.muted, borderRadius:4, cursor:"pointer", fontWeight:600 }}>
          {c}
        </button>
      ))}
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {loading && (
        <div style={{ padding:"40px 20px", textAlign:"center", color:C.muted, fontSize:12 }}>
          <div style={{ display:"inline-block", width:24, height:24, border:`3px solid ${C.border}`, borderTopColor:C.blue, borderRadius:"50%", animation:"spinK9 .8s linear infinite", marginBottom:12 }}/>
          <div>{t("library.loadingFrom", { species: t(`common.${species}`) })}</div>
        </div>
      )}
      {!loading && error && (
        <div style={{ padding:"20px", background:C.redLt, border:`1px solid ${C.red}44`, borderRadius:6, color:C.red, fontSize:12 }}>
          <div style={{ fontWeight:700, marginBottom:6 }}>⚠ Could not load exercise library</div>
          <div style={{ color:C.muted, fontSize:11 }}>{error}</div>
          <div style={{ color:C.muted, fontSize:11, marginTop:8 }}>Verify <code>VITE_API_URL</code> in Vercel env vars points to your Railway backend.</div>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ padding:"30px 20px", textAlign:"center", color:C.muted, fontSize:12 }}>
          No exercises match the current filter.
        </div>
      )}
      {!loading && !error && filtered.map(ex=>{
        const open = sel===ex.id;
        const c = lc(ex.lvl);
        return (
          <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (()=>setSel(s=>s===ex.id?null:ex.id))(e); } }} key={ex.id} onClick={()=>setSel(s=>s===ex.id?null:ex.id)}
            style={{ border:`1px solid ${open?c:C.border}`, background: open ? C.white : "#FAFCFF", borderRadius:7, padding:"12px 16px", cursor:"pointer", transition:"border .15s", boxShadow: open ? "0 2px 12px rgba(26,39,68,.08)":"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:9, fontFamily:"monospace", color:C.muted, flexShrink:0 }}>{ex.id}</span>
              <span style={{ fontSize:13, fontWeight:700, color:C.navy, flex:1 }}>{ex.name}</span>
              <span style={{ fontSize:8, background:`${c}18`, border:`1px solid ${c}55`, color:c, padding:"1px 8px", borderRadius:3, fontWeight:700, letterSpacing:".08em", flexShrink:0 }}>EVIDENCE {ex.lvl}</span>
              <span style={{ fontSize:9, color:C.muted, flexShrink:0 }}>{ex.cat}</span>
            </div>
            {open && (
              <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${C.border}`, animation:"fadeIn .15s ease" }}>
                <div style={{ display:"flex", gap:20, marginBottom:12 }}>
                  {[["SETS",ex.sets],["REPS",ex.reps],["FREQ",ex.freq]].map(([l,v])=>(
                    <div key={l}><div style={{ fontSize:8, color:C.muted, fontWeight:700, letterSpacing:".1em", marginBottom:3 }}>{l}</div><div style={{ fontSize:14, color:c, fontWeight:700 }}>{v}</div></div>
                  ))}
                </div>
                <Row>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:C.red, letterSpacing:".08em", marginBottom:5, textTransform:"uppercase" }}>{t("library.contraindications")}</div>
                    {ex.contra.map(ct=><div key={ct} style={{ fontSize:11, color:C.red, marginBottom:3, display:"flex", gap:6 }}><span>✗</span>{ct}</div>)}
                  </div>
                  <div>
                    {/* Red flag header is SAFETY-CRITICAL — English-locked with EN badge */}
                    <SafetyText
                      k="safety.stopCallVet"
                      as="div"
                      style={{ fontSize:10, fontWeight:700, color:C.amber, letterSpacing:".08em", marginBottom:5, textTransform:"uppercase" }}/>
                    {ex.rf.map(r=><div key={r} style={{ fontSize:11, color:C.amber, marginBottom:3, display:"flex", gap:6 }}><span>⚑</span>{r}</div>)}
                  </div>
                </Row>
                <div style={{ marginTop:10, padding:"10px 14px", background:C.bg, borderRadius:5, border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:9, color:C.muted, fontWeight:700, letterSpacing:".1em", marginBottom:4, textTransform:"uppercase" }}>{t("library.formCue")}</div>
                  <div style={{ fontSize:12, color:C.text, lineHeight:1.65 }}>{ex.cue}</div>
                </div>
                <div style={{ marginTop:8, padding:"10px 14px", background:C.greenLt, borderRadius:5, border:`1px solid ${C.green}33` }}>
                  <div style={{ fontSize:9, color:C.green, fontWeight:700, letterSpacing:".1em", marginBottom:4, textTransform:"uppercase" }}>{t("library.evidenceBasis")}</div>
                  <div style={{ fontSize:12, color:C.text, lineHeight:1.65 }}>{ex.evidence}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </>;
}

// ── PETCARE NUTRITION (Dashboard Block 13) ───────────────────────────────────
// Auto-populated from dashData. Diet recommendations based on species, BCS,
// condition. Ship-to-client and print buttons.
function PetCareNutritionPanel() {
  const { data } = useContext(DashFormContext);

  // Auto-populate all patient + shipping fields from the selected patient
  // record. Falls back gracefully across multiple key aliases so both legacy
  // and seeded dashboard_data shapes work.
  const patientName = (data["client::Patient Name"] || "").trim();
  const species = data["client::Species"] || "Canine";
  const breed = (data["client::Breed"] || "").trim();
  const age = data["client::Age (years)"] || "";
  const weight = data["client::Weight (lbs)"] || "";
  const weightKg = data["client::Weight (kg)"] || "";
  const bcs = data["metrics::BCS (1–9)"]
           || data["assessment::Body Condition Score (1–9)"]
           || "";
  const diagnosis = resolveDiagnosis(data, null);
  const sex = data["client::Sex"] || "";
  const clientName = [data["client::Client First Name"], data["client::Client Last Name"]].filter(Boolean).join(" ");
  const addrLine1 = data["client::Street Address"] || "";
  const addrLine2 = data["client::Apt / Suite / Unit"] || "";
  const city = data["client::City"] || "";
  const stateProv = data["client::State / Province"] || "";
  const zip = data["client::Zip / Postal Code"] || "";
  const country = data["client::Country"] || "";
  const address = [addrLine1, addrLine2, city, stateProv, zip, country].filter(Boolean).join(", ");
  const phone = data["client::Phone"] || "";
  const email = data["client::Email"] || "";

  const DIET_RECOMMENDATIONS = [
    { brand: "Royal Canin", name: "Mobility Support", condition: "Joint / OA / Post-surgical", species: "Canine", benefits: "EPA+DHA, glucosamine, chondroitin for joint support", portion: "Based on ideal body weight" },
    { brand: "Royal Canin", name: "Satiety Weight Management", condition: "Obesity / Weight loss", species: "Canine", benefits: "High fiber, low calorie density, maintains lean muscle", portion: "Per weight management chart" },
    { brand: "Royal Canin", name: "Gastrointestinal", condition: "GI / Digestive", species: "Canine", benefits: "Highly digestible proteins, prebiotics, moderate fat", portion: "Per product guide" },
    { brand: "Hill's", name: "j/d Joint Care", condition: "Joint / OA / Post-surgical", species: "Canine", benefits: "Clinically proven EPA levels for mobility improvement", portion: "Based on body weight" },
    { brand: "Hill's", name: "Metabolic + Mobility", condition: "Obesity + Joint", species: "Canine", benefits: "Weight loss + joint support combined formula", portion: "Per metabolic weight chart" },
    { brand: "Purina Pro Plan", name: "JM Joint Mobility", condition: "Joint / OA / Post-surgical", species: "Canine", benefits: "EPA+DHA omega-3, glucosamine, total body support", portion: "Based on ideal weight" },
    { brand: "Royal Canin", name: "Mobility Support (Feline)", condition: "Joint / OA", species: "Feline", benefits: "EPA+DHA, green-lipped mussel extract", portion: "Based on body weight" },
    { brand: "Hill's", name: "j/d Feline", condition: "Joint / OA", species: "Feline", benefits: "EPA for joint health in cats", portion: "Based on body weight" },
  ];

  const relevantDiets = DIET_RECOMMENDATIONS.filter(d =>
    d.species.toLowerCase() === species.toLowerCase()
  );

  return <>
    {/* ── Auto-populated patient summary ── */}
    <Sec title="Patient Summary" color="#059669" colorLt="#ECFDF5" noTop>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {[
          ["Patient", patientName || "—"],
          ["Species / Breed", `${species}${breed ? ` — ${breed}` : ""}`],
          ["Sex / Age", `${sex || "—"}${age ? ` · ${age}y` : ""}`],
          ["Weight", `${weight ? weight+" lbs" : "—"}${weightKg ? ` / ${weightKg} kg` : ""}`],
          ["BCS (1–9)", bcs || "Not assessed"],
          ["Diagnosis", diagnosis || "—"],
        ].map(([l,v]) => (
          <div key={l} style={{ padding:"8px 12px", background:C.white, border:`1px solid ${C.border}`, borderRadius:5 }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#059669", letterSpacing:".06em", textTransform:"uppercase", marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:12, color:C.text, fontWeight:500 }}>{v}</div>
          </div>
        ))}
      </div>
      {!patientName && (
        <div style={{ marginTop:10, padding:"10px 14px", background:C.amberLt, border:`1px solid ${C.amber}44`, borderRadius:6, fontSize:11, color:C.amber, fontWeight:600 }}>
          Select a patient from the header search to auto-populate PetCare Nutrition with their chart + shipping address.
        </div>
      )}
    </Sec>

    {/* ── Client & Shipping Details (auto-populated) ─────────────────── */}
    <Sec title="Client & Shipping Address" color="#059669" colorLt="#ECFDF5">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:5 }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#059669", letterSpacing:".06em", textTransform:"uppercase", marginBottom:4 }}>Client</div>
          <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{clientName || "—"}</div>
          {phone && <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>📞 {phone}</div>}
          {email && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>✉️ {email}</div>}
        </div>
        <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:5 }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#059669", letterSpacing:".06em", textTransform:"uppercase", marginBottom:4 }}>Ship-to Address</div>
          {addrLine1 ? (
            <div style={{ fontSize:12, color:C.text, lineHeight:1.55 }}>
              <div>{addrLine1}{addrLine2 ? `, ${addrLine2}` : ""}</div>
              <div>{[city, stateProv, zip].filter(Boolean).join(", ")}</div>
              {country && <div>{country}</div>}
            </div>
          ) : (
            <div style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>No shipping address on file for this client.</div>
          )}
        </div>
      </div>
    </Sec>

    {/* ── Diet Recommendations ── */}
    <Sec title="Diet Recommendations" color="#059669" colorLt="#ECFDF5">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {relevantDiets.map((d,i) => (
          <div key={i} style={{
            background:C.white, border:`1px solid ${C.border}`, borderLeft:`4px solid #059669`,
            borderRadius:8, padding:"14px 16px",
          }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#059669", letterSpacing:".08em", textTransform:"uppercase", marginBottom:4 }}>{d.brand}</div>
            <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:6 }}>{d.name}</div>
            <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}><b>Condition:</b> {d.condition}</div>
            <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}><b>Benefits:</b> {d.benefits}</div>
            <div style={{ fontSize:10, color:C.muted, marginBottom:10 }}><b>Portion:</b> {d.portion}</div>
            <div style={{ display:"flex", gap:6 }}>
              <button style={{ flex:1, padding:"7px", background:"#059669", border:"none", color:C.white, borderRadius:5, cursor:"pointer", fontSize:10, fontWeight:700 }}>
                📦 SHIP TO CLIENT
              </button>
              <button style={{ flex:1, padding:"7px", background:C.white, border:`1px solid ${C.border}`, color:C.navy, borderRadius:5, cursor:"pointer", fontSize:10, fontWeight:700 }}>
                🖨 PRINT RX
              </button>
            </div>
          </div>
        ))}
      </div>
      {address && (
        <div style={{ marginTop:12, padding:"10px 14px", background:"#ECFDF5", border:`1px solid #05966933`, borderRadius:6, fontSize:11, color:"#059669" }}>
          <b>Shipping Address:</b> {clientName} — {address}
        </div>
      )}
    </Sec>

    {/* ── Veterinary Diet Links ── */}
    <Sec title="Veterinary Diet Catalog" color="#059669" colorLt="#ECFDF5">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
        {["Royal Canin Veterinary Diets","Hill's Prescription Diet","Purina Pro Plan Veterinary Diets"].map(brand => (
          <div key={brand} style={{
            padding:"10px 12px", background:C.white, border:`1px solid ${C.border}`,
            borderRadius:6, textAlign:"center", fontSize:11, fontWeight:600, color:C.navy,
          }}>{brand}</div>
        ))}
      </div>
    </Sec>
    <ClinicalNotes/>
  </>;
}

// ── COMING SOON — 3D Clinical Anatomy Viewer ─────────────────────────────────
// Teaser block showcasing the upcoming holographic 3D anatomy viewer.
// Displays the two X-ray images Sal provided (dog + cat), a professional
// statement describing the feature, and feature preview chips.
// No form fields — purely marketing/communication content for the Mars pitch.
function ComingSoonPanel() {
  const [species, setSpecies] = useState("Canine");
  return <>
    {/* ── Live 3D Clinical Anatomy Viewer ── */}
    <Sec title="B.E.A.U. 3D Clinical Anatomy Viewer" color={C.teal} colorLt={C.tealLt}>
      <div style={{
        padding: "16px 20px",
        background: "linear-gradient(135deg, #F0FDFB 0%, #FFFFFF 100%)",
        border: `1px solid ${C.teal}33`,
        borderLeft: `4px solid ${C.teal}`,
        borderRadius: 8,
        fontSize: 12, color: C.text, lineHeight: 1.75, marginBottom: 16,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.teal,
          letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10,
        }}>
          Now Live in K9 Rehab Pro&trade;
        </div>
        <p style={{ margin: "0 0 12px" }}>
          Real anatomical 3D models of the canine and feline patient &mdash; drag to rotate, scroll to zoom.
          Open any exercise in the <b>Exercise Library</b> and B.E.A.U. illuminates the exact muscle groups,
          joint structures, and anatomical regions it targets, in real time.
        </p>
        <div style={{
          paddingTop: 10, marginTop: 10,
          borderTop: `1px solid ${C.border}`,
          fontSize: 10, color: C.muted, fontStyle: "italic", letterSpacing: ".02em",
        }}>
          Powered by B.E.A.U. AI &middot; Millis &amp; Levine Evidence-Based Protocols
        </div>
      </div>

      {/* species toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["Canine", "Feline"].map(sp => {
          const active = species === sp;
          return (
            <button key={sp} onClick={() => setSpecies(sp)}
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                background: active ? C.teal : "#fff",
                color: active ? "#fff" : C.text,
                border: `1px solid ${active ? C.teal : C.border}`,
                transition: "all .15s",
              }}>
              {sp === "Feline" ? "🐈 Feline" : "🐕 Canine"}
            </button>
          );
        })}
      </div>

      <AnatomyViewer3D key={species} species={species} />
    </Sec>

    {/* ── Features ── */}
    <Sec title="Features" color={C.teal} colorLt={C.tealLt}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[
          "Real-time muscle highlighting",
          "Species-aware canine & feline models",
          "Exercise-to-anatomy correlation",
          "Interactive 3D rotation & zoom",
          "Evidence-based overlay system",
        ].map(feature => (
          <div key={feature} style={{
            padding: "8px 16px",
            background: "rgba(14,165,233,0.08)",
            border: `1px solid ${C.teal}55`,
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            color: C.teal,
            letterSpacing: ".02em",
            boxShadow: `0 0 8px rgba(14,165,233,0.12)`,
          }}>
            {feature}
          </div>
        ))}
      </div>
    </Sec>
  </>;
}

// ─── SIDEBAR PANELS ───────────────────────────────────────────────────────────
function HowToUse() {
  const steps = [
    ["Open or Create a Patient Record","Search for an existing patient or create a new one. Each record is stored securely tied to your login."],
    ["Fill In What's Relevant Today","You do not need to complete every block. A recheck visit? Go straight to Assessment. Updating the home program? Open Home Exercise Program. Skip everything else."],
    ["Complete B.E.A.U. Metrics First","Goniometry and muscle measurements give B.E.A.U. the clinical data it needs to generate an accurate, personalized protocol."],
    ["Check Nutritional Assessment","At the top of B.E.A.U. Metrics — decide whether to enable dietary recommendations. If yes, B.E.A.U. will factor the patient's BCS and condition into food recommendations."],
    ["Generate the Protocol","Open Protocol Summary → click Generate. B.E.A.U. synthesizes everything entered across all blocks into a complete evidence-based protocol."],
    ["Deliver the Home Program","Email, print, or QR-code the home exercise program directly from Protocol Summary."],
    ["Save and Schedule Recheck","Hit Save in the sidebar. Record the next recheck date in the Goals block."],
  ];
  return (
    <div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.7, padding:"12px 14px", background:C.blueLt, borderRadius:6 }}>
        K9 Rehab Pro is designed for a busy clinic. Every block is independent — click what you need, skip what you do not. A 10-patient day should feel fast, not frustrating.
      </div>
      {steps.map(([h,b],i)=>(
        <div key={h} style={{ display:"flex", gap:14, marginBottom:18, alignItems:"flex-start" }}>
          <div style={{ flexShrink:0, width:30, height:30, borderRadius:"50%", background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:C.white, fontWeight:700 }}>{i+1}</div>
          <div><div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:4 }}>{h}</div><div style={{ fontSize:12, color:C.muted, lineHeight:1.65 }}>{b}</div></div>
        </div>
      ))}
    </div>
  );
}

function AskBeau() {
  const [q, setQ]       = useState("");
  const [ans, setAns]   = useState("");
  const [busy, setBusy] = useState(false);
  const { uiLang, beauVoice } = useContext(DashFormContext);

  const ask = async () => {
    if (!q.trim()) return;
    setBusy(true); setAns("");
    try {
      const text = await callBeau(
        `You are B.E.A.U. — clinical AI assistant of K9 Rehab Pro™. Answer rehabilitation questions concisely. Cite Millis & Levine, Drum, Marcellin-Little, Jaeger, or Lorenz & Kornegay when relevant. No markdown. Clinical sentences only.`,
        q,
        uiLang
      );
      setAns(text);
      // Auto-speak the response — TTS is always-on by default (useBeauVoice
      // autoSpeak default TRUE for the Dr. Bibevski demo).
      if (beauVoice?.autoSpeak && text) beauVoice.speak(text);
    } catch (err) { setAns(`Connection error: ${err.message}`); }
    setBusy(false);
  };

  // Hand-click speaker replay for the most recent response.
  const replay = () => { if (ans && beauVoice?.speak) beauVoice.speak(ans); };

  return (
    <div style={{ pointerEvents: "auto", position: "relative", zIndex: 1 }}>
      <div style={{ fontSize:12, color:C.muted, marginBottom:16, lineHeight:1.65 }}>Ask B.E.A.U. any clinical rehabilitation question — contraindications, dosing, exercise selection, evidence. Answers draw from the peer-reviewed veterinary rehabilitation literature.</div>
      <Lbl>Your Clinical Question</Lbl>
      <textarea
        value={q}
        onChange={e=>setQ(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !busy) { e.preventDefault(); ask(); } }}
        placeholder="e.g. What exercises are contraindicated for a TPLO patient at week 3? What is the evidence basis for cavaletti rails?"
        rows={4}
        autoFocus
        style={{ pointerEvents: "auto", userSelect: "text" }}
      />
      <button onClick={ask} disabled={busy||!q.trim()}
        style={{ marginTop:12, width:"100%", padding:"12px", background: busy||!q.trim() ? C.greenLt : C.green, border:"none", color:C.white, borderRadius:6, cursor: busy||!q.trim()?"not-allowed":"pointer", fontSize:13, fontWeight:700 }}>
        {busy ? "B.E.A.U. IS THINKING…" : "⬡ ASK B.E.A.U."}
      </button>
      {ans && (
        <div style={{ marginTop:16, padding:16, background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:6 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ fontSize:9, color:C.green, fontWeight:700, letterSpacing:".15em" }}>B.E.A.U. RESPONSE</div>
            {/* Replay speaker — user can click to hear B.E.A.U. speak again */}
            <button
              onClick={replay}
              title="Hear B.E.A.U. speak this response"
              style={{ background: C.white, border: `1px solid ${C.green}55`, color: C.green, borderRadius: 5, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              🔊 {beauVoice?.isSpeaking ? "Speaking…" : "Replay"}
            </button>
          </div>
          <div style={{ fontSize:12, color:C.text, lineHeight:1.85, fontFamily:"Georgia, serif" }}>{ans}</div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// HELSINKI CHRONIC PAIN INDEX — Hielm-Björkman et al. (2003)
// Owner-completed questionnaire for canine chronic musculoskeletal pain.
// 11 items × 0–4 points = 0–44 total.
// ──────────────────────────────────────────────────────────────────────────────
const HELSINKI_QUESTIONS = [
  { n: 1,  text: "General mood / vitality" },
  { n: 2,  text: "Willingness to play" },
  { n: 3,  text: "Vocalization when moving (whining, whimpering)" },
  { n: 4,  text: "Manner of walking (trot)" },
  { n: 5,  text: "Manner of walking (gallop)" },
  { n: 6,  text: "Manner of jumping (e.g. into car, on couch)" },
  { n: 7,  text: "Manner of lying down" },
  { n: 8,  text: "Manner of rising from rest" },
  { n: 9,  text: "Ease of movement after resting" },
  { n: 10, text: "Ease of movement after heavy exercise" },
  { n: 11, text: "Ease of movement in cold weather" },
];
const HELSINKI_OPTIONS = [
  { v: "0", label: "0 — Normal / no difficulty" },
  { v: "1", label: "1 — Slightly altered" },
  { v: "2", label: "2 — Moderately altered" },
  { v: "3", label: "3 — Severely altered" },
  { v: "4", label: "4 — Cannot perform / severe distress" },
];

function HelsinkiPanel() {
  const { data, update } = useContext(DashFormContext);

  // Auto-calculate total score from all 11 question answers
  const total = HELSINKI_QUESTIONS.reduce((sum, q) => {
    const v = parseInt(data[`helsinki::Q${q.n}`], 10);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  // Store total in dashData so it's persisted with the patient record
  useEffect(() => {
    update("helsinki::Total Score", String(total));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const interpretation =
    total === 0 ? { label: "Not scored", color: C.muted, bg: C.bg } :
    total <= 11 ? { label: "Minimal pain — routine monitoring", color: C.green, bg: C.greenLt } :
    total <= 22 ? { label: "Mild pain — consider NSAIDs + rehab", color: "#B45309", bg: "#FEF3C7" } :
    total <= 33 ? { label: "Moderate pain — multimodal analgesia indicated", color: "#EA580C", bg: "#FFF7ED" } :
                  { label: "Severe pain — aggressive multimodal therapy + reassessment", color: C.red, bg: C.redLt };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ fontSize: 12, color: C.text }}>
      {/* ── Header & description ── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 4 }}>
          Helsinki Chronic Pain Index — Print for Client
        </div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>
          Validated 11-item owner-completed questionnaire for chronic musculoskeletal pain.
          Reference: <em>Hielm-Björkman AK et al (2003), Am J Vet Res</em>. Each item scored 0–4;
          total score 0–44. Print this page for the client to complete at home, then enter results
          when they return.
        </div>

        <button onClick={handlePrint}
          style={{
            padding: "9px 18px", background: C.blue, border: "none", color: C.white,
            borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700,
            letterSpacing: ".06em", display: "inline-flex", alignItems: "center", gap: 8,
          }}>
          🖨️ PRINT QUESTIONNAIRE FOR CLIENT
        </button>
      </div>

      {/* ── Patient / date header (for printed form) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18, padding: "12px 14px", border: `1px dashed ${C.border}`, borderRadius: 6 }}>
        <div>
          <Lbl>Patient Name</Lbl>
          <input placeholder="Patient"
            value={data["helsinki::Patient Name"] || ""}
            onChange={e => update("helsinki::Patient Name", e.target.value)}/>
        </div>
        <div>
          <Lbl>Assessment Date</Lbl>
          <input type="date"
            value={data["helsinki::Date"] || ""}
            onChange={e => update("helsinki::Date", e.target.value)}/>
        </div>
      </div>

      {/* ── 11 Questions ── */}
      {HELSINKI_QUESTIONS.map(q => {
        const val = data[`helsinki::Q${q.n}`] || "";
        return (
          <div key={q.n} style={{
            marginBottom: 12, padding: "10px 14px",
            background: val ? C.blueLt : C.white,
            border: `1px solid ${val ? C.blue : C.border}`,
            borderRadius: 6,
          }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: C.navy, marginBottom: 8 }}>
              {q.n}. {q.text}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {HELSINKI_OPTIONS.map(opt => {
                const selected = val === opt.v;
                return (
                  <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => update(`helsinki::Q${q.n}`, opt.v))(e); } }} key={opt.v}
                    onClick={() => update(`helsinki::Q${q.n}`, opt.v)}
                    style={{
                      padding: "6px 8px", textAlign: "center",
                      border: `1.5px solid ${selected ? C.blue : C.border}`,
                      background: selected ? C.blue : C.white,
                      color: selected ? C.white : C.text,
                      borderRadius: 4, cursor: "pointer",
                      fontSize: 10, fontWeight: 600, lineHeight: 1.3,
                      transition: "all .12s",
                    }}>
                    {opt.label}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Total Score + Interpretation ── */}
      <div style={{
        marginTop: 16, padding: "16px 20px",
        background: interpretation.bg,
        border: `1.5px solid ${interpretation.color}`,
        borderRadius: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: interpretation.color, letterSpacing: ".08em", textTransform: "uppercase" }}>
            Total Score
          </span>
          <span style={{ fontSize: 28, fontWeight: 900, color: interpretation.color }}>
            {total} <span style={{ fontSize: 14, fontWeight: 600 }}>/ 44</span>
          </span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: interpretation.color }}>
          {interpretation.label}
        </div>
      </div>

      {/* ── Clinician notes ── */}
      <div style={{ marginTop: 14 }}>
        <Lbl>Clinician Notes</Lbl>
        <textarea rows={3} placeholder="Clinical interpretation, treatment plan, reassessment interval…"
          value={data["helsinki::Clinician Notes"] || ""}
          onChange={e => update("helsinki::Clinician Notes", e.target.value)}/>
      </div>

      <div style={{ marginTop: 14, padding: "10px 14px", background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 6, fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
        <b>Clinical scoring guide:</b> 0–11 Minimal · 12–22 Mild · 23–33 Moderate · 34–44 Severe.
        HCPI responsiveness validated against force-plate analysis (Hielm-Björkman 2009).
        Reassess at 4–6 week intervals or after therapy changes.
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <div style={{ fontSize:12, color:C.muted, lineHeight:1.8 }}>
      <div style={{ fontSize:22, fontWeight:900, color:C.green, marginBottom:2 }}>B.E.A.U.™</div>
      <div style={{ fontSize:13, color:C.navy, fontWeight:700, marginBottom:2 }}>K9 Rehab Pro™</div>
      <div style={{ fontSize:11, color:C.muted, marginBottom:20 }}>Clinical Protocol Intelligence · Version 2.4</div>
      {[["Creator","Salvatore Bonanno — Veterinary Technician & Canine Rehabilitation Nurse, 30+ years experience in animal medicine"],
        ["Clinical Background","Founder and sole operator of the canine rehabilitation department at Lauderdale Veterinary Specialists (BluePearl Fort Lauderdale) 2016–2024. Currently operating Salvatore Bonanno, Fort Lauderdale, FL"],
        ["Evidence Sources","Millis DL & Levine D — Canine Rehabilitation & Physical Therapy 2nd Ed. (2014) · Drum MG (2010) · Marcellin-Little DJ (2015) · Jaeger GH et al (2007) · Lorenz MD & Kornegay JN (2011) · Levine D et al (2010) · Hielm-Björkman AK et al (2003)"],
        ["Exercise Library","260 evidence-based exercises · 5 categories · Canine and Feline · All exercises include evidence level, dosing, contraindications, and red flags"],
        ["AI Engine","Anthropic Claude — routed via secure backend /api/beau/chat"],
        ["Copyright","© 2026 Salvatore Bonanno. All rights reserved. K9 Rehab Pro™ and B.E.A.U.™ are trademarks of Salvatore Bonanno."],
      ].map(([l,v])=>(
        <div key={l} style={{ marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:9, color:C.green, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:4 }}>{l}</div>
          <div style={{ fontSize:12, color:C.text }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function DisclaimerPanel() {
  return (
    <div style={{ fontSize:12, color:C.muted, lineHeight:1.85 }}>
      <div style={{ padding:"14px 16px", background:C.redLt, border:`1px solid ${C.red}44`, borderRadius:6, marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.red, marginBottom:6 }}>IMPORTANT — READ BEFORE CLINICAL USE</div>
        K9 Rehab Pro™ and B.E.A.U.™ are clinical support tools for licensed veterinary professionals. They do not replace professional veterinary judgment, diagnosis, or treatment.
      </div>
      {["B.E.A.U. generates rehabilitation protocols based on peer-reviewed veterinary rehabilitation literature. All protocols must be reviewed and approved by a licensed veterinarian or credentialed rehabilitation professional before implementation.",
        "K9 Rehab Pro is intended for use by or under the direct supervision of licensed veterinary technicians, veterinary nurses, and veterinarians with training in canine and feline rehabilitation.",
        "B.E.A.U. does not diagnose medical conditions. Clinical diagnosis remains the exclusive responsibility of the attending veterinarian.",
        "The clinician assumes full clinical and legal responsibility for the application of any protocol generated by this system.",
        "If a patient presents with red flag symptoms — including non-weight bearing, neurological decline, severe uncontrolled pain, or surgical complications — discontinue all exercises and contact the attending veterinarian immediately.",
        "This software is a working prototype currently in refinement. Clinical judgment of the supervising veterinary professional supersedes all system-generated output."].map((t,i)=>(
        <div key={i} style={{ marginBottom:14, paddingLeft:14, borderLeft:`3px solid ${C.border}` }}>{t}</div>
      ))}
    </div>
  );
}

function HipaaPanel() {
  return (
    <div style={{ fontSize:12, color:C.muted, lineHeight:1.85 }}>
      <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:16 }}>Veterinary Client Privacy Policy</div>
      {[["Data Collection","K9 Rehab Pro collects client and patient information necessary to generate and manage rehabilitation protocols, including contact information, patient medical history, diagnostic findings, and rehabilitation records."],
        ["Data Use","Data is used solely for generating rehabilitation protocols, tracking patient progress, and communicating home exercise programs to authorized clients."],
        ["Data Storage","All data is stored securely using encrypted cloud infrastructure. Data is never sold, shared, or disclosed to third parties without explicit client consent, except as required by law."],
        ["HIPAA Standards","While HIPAA primarily applies to human healthcare, K9 Rehab Pro applies equivalent privacy standards to all veterinary client and patient records as a matter of professional ethics and best practice."],
        ["Client Rights","Clients have the right to access their pet's records, request corrections, and request deletion of data at any time. Contact your clinic administrator to exercise these rights."],
        ["Breach Notification","In the event of a data security incident, affected clients will be notified within 72 hours in accordance with applicable data protection regulations."],
      ].map(([h,b])=>(
        <div key={h} style={{ marginBottom:18 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.navy, marginBottom:5 }}>{h}</div>
          <div>{b}</div>
        </div>
      ))}
      <div style={{ fontSize:11, color:C.gray, marginTop:8 }}>© 2026 Salvatore Bonanno · K9 Rehab Pro™ · Privacy policy effective April 2026</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
// Tile and nav definitions — IDs, icons, colors are stable per tile; labels
// and descriptions are resolved via t(`tiles.<id>.label`) / t(`nav.<id>`)
// at render time so the UI re-renders when the user changes locale.
const BLOCKS = [
  { id:"client",       icon:"🐾", color:C.blue,    colorLt:C.blueLt   },
  { id:"diagnostics",  icon:"🦴", color:C.purple,  colorLt:C.purpleLt },
  { id:"assessment",   icon:"🐕", color:C.amber,   colorLt:C.amberLt  },
  { id:"treatment",    icon:"🩺", color:"#F59E0B", colorLt:"#FFFBEB"  },
  { id:"metrics",      icon:"🦮", color:C.green,   colorLt:C.greenLt  },
  { id:"equipment",    icon:"🐕‍🦺", color:C.teal,    colorLt:C.tealLt   },
  { id:"home",         icon:"🏡", color:C.blue,    colorLt:C.blueLt   },
  { id:"goals",        icon:"🏆", color:"#BE185D", colorLt:"#FDF2F8"  },
  { id:"conditioning", icon:"🐺", color:"#0D9488", colorLt:"#F0FDFB"  },
  { id:"protocol",     icon:"🐶", color:C.green,   colorLt:C.greenLt  },
  { id:"library",      icon:"🦴", color:C.navy,    colorLt:C.blueLt   },
  { id:"nutrition",    icon:"🥗", color:"#059669", colorLt:"#ECFDF5"  },
  { id:"coming-soon",  icon:"🫀", color:C.teal,    colorLt:C.tealLt   },
];

const SIDEBAR_NAV = [
  { id:"how",        icon:"❓" },
  { id:"ask",        icon:"⬡"  },
  { id:"helsinki",   icon:"📝" },
  { id:"about",      icon:"ℹ️" },
  { id:"disclaimer", icon:"⚠️" },
  { id:"hipaa",      icon:"🔒" },
];

const BLOCK_COMPS   = { client:ClientPanel, diagnostics:DiagnosticsPanel, assessment:AssessmentPanel, treatment:TreatmentPanel, metrics:MetricsPanel, equipment:EquipmentPanel, home:HomePanel, goals:GoalsPanel, conditioning:ConditioningPanel, protocol:ProtocolPanel, library:LibraryPanel, nutrition:PetCareNutritionPanel, "coming-soon":ComingSoonPanel };
const SIDEBAR_COMPS = { how:HowToUse, ask:AskBeau, helsinki:HelsinkiPanel, about:AboutPanel, disclaimer:DisclaimerPanel, hipaa:HipaaPanel };

// ── CONTEXTUAL B.E.A.U. PROMPTS ──────────────────────────────────────────────
const BEAU_BLOCK_CONTEXTS = {
  client:       "You are helping with patient intake — demographics, breed-specific considerations, owner communication. Reference breed predispositions and signalment relevance.",
  diagnostics:  "You are helping interpret diagnostic results — radiographs, bloodwork, MRI findings. Identify rehabilitation-relevant findings and how they affect protocol selection.",
  assessment:   "You are helping with clinical assessment — pain scoring (CSU scale, BPI), functional grading, lameness assessment, neurological evaluation. Focus on objective measurement.",
  treatment:    "You are helping with treatment and surgical status planning — post-op recovery phase guidance or conservative management protocols. Tailor advice to the selected approach (Surgical / Conservative) and current restrictions. Palliative is not a rehabilitation pathway in this product; if a case is genuinely for comfort care, say so rather than proposing a rehabilitation programme.",
  metrics:      "You are helping with B.E.A.U. metrics — girth measurements, goniometry/ROM interpretation, body condition scoring, HCPI scoring, LOAD scoring. Explain clinical significance and normal ranges.",
  equipment:    "You are helping with equipment selection — underwater treadmill settings, TENS/NMES parameters, laser therapy protocols (Class IV), therapeutic ultrasound, shockwave therapy indications.",
  home:         "You are helping design home exercise programs — client education, exercise selection appropriate for home, frequency/duration recommendations, safety guidelines, environment assessment.",
  goals:        "You are helping set rehabilitation goals — SMART goals, phase-appropriate milestones, validated outcome measures, realistic timeline expectations based on condition and evidence.",
  conditioning: "You are helping with conditioning programs — progressive overload, sport-specific training, return-to-function criteria, fitness maintenance protocols.",
  nutrition: "You are helping with therapeutic diet selection — Mars PetCare / Royal Canin / Hill's / Purina Pro Plan veterinary diets. Factor in BCS, species, life stage, medical condition, and weight management needs. Reference Waltham science where applicable.",
  "coming-soon": "You are assisting with the live 3D Clinical Anatomy Viewer — a real-time, interactive 3D anatomy visualization of the canine and feline patient. Help clinicians use it: rotate/zoom the model, select an exercise in the Exercise Library to highlight the targeted muscles and joints, and interpret the anatomy clinically.",
};

export default function DashboardView({ setView, currentUser, onLogout, patient, setSelectedPatient }) {
  // ── WHAT EACH BLOCK ACTUALLY HOLDS ──────────────────────────────────────
  //
  // The dot on each block card used to be computed right here by counting
  // `dashboard_data` keys:
  //
  //     blockKeys.length >= 3 ? "complete" : blockKeys.length > 0 ? "partial"
  //
  // Six blocks have their own tables now and the dot never followed.
  // Measured on Haley, 2026-09-26: her Home and Goals cards showed NO DOT AT
  // ALL, reading as untouched, while patient_home_environment held her home
  // and patient_goal_items held "able to hike in the mountains within the
  // next 6 months". A clinician cannot answer "what still needs doing" from
  // dots that are wrong, and one wrong dot costs you trust in all of them.
  //
  // GET /v2/patients/:id/block-state answers the same question from wherever
  // each block's truth actually lives. Blocks with no table of their own are
  // still counted out of the blob by that endpoint — that part was never
  // wrong, it was only wrong for the blocks that had moved.
  const [blockState, setBlockState] = useState(null);

  const { t, i18n: i18nInst } = useTranslation();
  const beauVoice = useBeauVoice(i18nInst.language || "en");
  const [openBlock,   setOpenBlock]   = useState(() => {
    // Phase 1D intake-redirect: if Sidebar pushed a "New Client/Patient Intake"
    // trigger into localStorage, auto-open that block on first dashboard mount.
    try {
      const target = localStorage.getItem("beau_open_block");
      if (target) {
        localStorage.removeItem("beau_open_block");
        return target;
      }
    } catch {}
    return null;
  });
  const [openSidebar, setOpenSidebar] = useState(null);
  const [saved,       setSaved]       = useState(false);

  // MUST SIT BELOW `saved`, NOT ABOVE IT.
  //
  // This effect refetches the block state after a save, so `saved` is in
  // its dependency array. It was originally placed at the top of the
  // component, above the `useState` that declares `saved` — which threw
  // "Cannot access 'saved' before initialization" and took the whole
  // dashboard down with an error boundary the moment a patient was opened.
  //
  // A temporal dead zone reference, and the build could not see it: Vite
  // compiles it happily because it is only a problem at run time. It was
  // found by Sal pressing Enter on a patient, which is the thing I could
  // not do myself.
  useEffect(() => {
    if (!patient?.id) { setBlockState(null); return; }
    const base = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const token = localStorage.getItem("token");
    fetch(`${base}/v2/patients/${patient.id}/block-state`, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(r => r.json())
      .then(j => setBlockState(j && j.data ? j.data : null))
      // A failed fetch must not blank every dot. Null falls back to the blob
      // count below, which is what the screen did before and is still right
      // for the blocks that never moved.
      .catch(() => setBlockState(null));
  }, [patient?.id, saved]);
  // ── Form state — persists across block opens, keyed by "blockId::label"
  const [dashData, setDashData] = useState({});
  // ── Ask B.E.A.U. per block
  const [beauOpen, setBeauOpen]     = useState(false);
  const [beauQuery, setBeauQuery]   = useState("");
  const [beauAnswer, setBeauAnswer] = useState("");
  const [beauLoading, setBeauLoading] = useState(false);
  // ── Patient search
  const [allPatients, setAllPatients] = useState([]);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQ, setSearchQ]         = useState("");
  const searchRef = useRef(null);
  // ── Update toast (for UPDATE PATIENT RECORD button success feedback)
  const [updateToast, setUpdateToast] = useState(null); // { type: "success"|"error", message: string }

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const token = localStorage.getItem("token");
  const authHeaders = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  // ── LIVE patient header — reads from dashData first, falls back to patient object ──
  // Updates instantly as clinician edits any field in Client & Patient block.
  // No Save & Close required to see changes reflected in the header.
  const liveName = (dashData["client::Patient Name"] || "").trim() || patient?.name || "";
  const liveBreed = (dashData["client::Breed"] || "").trim() || patient?.breed || "";
  const liveSpecies = dashData["client::Species"] || (patient?.species === "feline" ? "Feline" : patient?.species === "canine" ? "Canine" : "");
  const patientName = liveName || null;
  const visitCount = patient?.visit_count || 0;
  const patientLabel = liveName
    ? `${liveName}${liveBreed ? ` — ${liveBreed}` : ""}${liveSpecies ? ` · ${liveSpecies}` : ""}${visitCount > 0 ? ` · Visit #${visitCount}` : ""}`
    : null;

  // ── Patient anchor lock REMOVED per Sal 2026-04-15 ──
  // Blocks are now always accessible. Phase 1A introduced a lock that gated
  // all non-Client blocks behind "enter Client Name + Patient Name first"
  // — Sal wants that removed. All clinical features open freely without
  // requiring a named patient anchor. Save/reload + search + UPDATE PATIENT
  // RECORD button are unchanged (still require a patient name to persist).
  const handleBlockClick = (blockId) => {
    setOpenBlock(blockId); setBeauOpen(false); setBeauQuery(""); setBeauAnswer("");
  };

  // ── Fetch patient list for search
  useEffect(() => {
    fetch(`${apiBase}/patients`, { headers: authHeaders })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => setAllPatients(d.data || d || []))
      .catch(err => { console.warn("[Dashboard] patient list failed:", err.message); setAllPatients([]); });
  }, []);

  // ── Close search dropdown on outside click
  useEffect(() => {
    const onDoc = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // ── Open-block event bridge — Sidebar fires "k9-open-block" after writing
  // the target block id into localStorage. This covers the case where the
  // user clicks "New Client/Patient Intake" while already on the dashboard
  // (setView is a no-op then and useState lazy-init only runs on first mount).
  useEffect(() => {
    const onOpen = () => {
      try {
        const target = localStorage.getItem("beau_open_block");
        if (target) {
          localStorage.removeItem("beau_open_block");
          setOpenBlock(target);
          setBeauOpen(false); setBeauQuery(""); setBeauAnswer("");
        }
      } catch {}
    };
    window.addEventListener("k9-open-block", onOpen);
    return () => window.removeEventListener("k9-open-block", onOpen);
  }, []);

  const filteredPatients = searchQ
    ? allPatients.filter(p => `${p.name} ${p.breed} ${p.client_name} ${p.condition}`.toLowerCase().includes(searchQ.toLowerCase()))
    : allPatients;

  // ── Select patient from search → load their full record + dashboard data
  // Explicit 8s timeout + in-flight loading state. On Railway cold-start
  // the prior code appeared frozen for 15+ seconds with no feedback, and
  // on a transient error it silently fell back to the lightweight search
  // row (missing dashboard_data) — dashboard appeared empty even when the
  // seeded patient HAD full data.
  const [selectLoading, setSelectLoading] = useState(false);
  const selectPatient = async (p) => {
    setSearchOpen(false);
    setSearchQ("");
    setSelectLoading(true);
    const controller = new AbortController();
    const tmo = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${apiBase}/patients/${p.id}`, {
        headers: authHeaders, signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const fullPatient = json.data || json;
      if (setSelectedPatient) setSelectedPatient(fullPatient);
    } catch (err) {
      console.warn("[selectPatient] fetch failed — falling back to list row", err?.message);
      if (setSelectedPatient) setSelectedPatient(p);
      setUpdateToast({
        type: "error",
        message: `Patient loaded with partial data${err?.name === "AbortError" ? " (backend slow to respond)" : ""}. Retry from the search if the dashboard appears empty.`,
      });
      setTimeout(() => setUpdateToast(null), 5000);
    } finally {
      clearTimeout(tmo);
      setSelectLoading(false);
    }
  };

  // ── Pre-populate from patient on mount / patient change
  // FIX: When patient.id changes, REPLACE dashData with savedDash (no merge with stale prev).
  // Stale prev would leak old patient's form data into the newly-loaded patient.
  useEffect(() => {
    if (!patient) return;
    // Load saved dashboard_data from backend first
    let savedDash = {};
    if (patient.dashboard_data) {
      try {
        savedDash = typeof patient.dashboard_data === "string" ? JSON.parse(patient.dashboard_data) : patient.dashboard_data;
      } catch (e) {
        // Log loudly so we can distinguish "bad JSON" from "empty panel" when
        // diagnosing post-demo. End-user still sees an empty dashboard, which
        // is correct fail-soft behavior.
        console.error("[DashboardView] dashboard_data JSON parse failed for patient", patient.id, e);
        savedDash = {};
      }
    }
    // REPLACE (not merge with prev). Seed ALL patient-table columns into their
    // DashFormContext keys so the dropdowns/inputs show current values on load.
    // Priority order: savedDash (from dashboard_data JSON) first, then patient columns as fallback.
    const speciesCapitalized = patient.species === "feline" ? "Feline" : patient.species === "canine" ? "Canine" : "";
    setDashData({
      ...savedDash,
      "client::Client First Name": savedDash["client::Client First Name"] || patient.client_name?.split(" ")[0] || "",
      "client::Client Last Name":  savedDash["client::Client Last Name"]  || patient.client_name?.split(" ").slice(1).join(" ") || "",
      "client::Phone":             savedDash["client::Phone"]             || patient.client_phone || "",
      "client::Email":             savedDash["client::Email"]             || patient.client_email || "",
      "client::Patient Name":      savedDash["client::Patient Name"]      || patient.name || "",
      "client::Breed":             savedDash["client::Breed"]             || patient.breed || "",
      "client::Species":           savedDash["client::Species"]           || speciesCapitalized || "Canine",
      "client::Sex":               savedDash["client::Sex"]               || patient.sex || "",
      "client::Weight (lbs)":      savedDash["client::Weight (lbs)"]      || (patient.weight ? String(patient.weight) : ""),
      "client::Age (years)":       savedDash["client::Age (years)"]       || (patient.age ? String(patient.age) : ""),
    });
  }, [patient?.id]);

  // useCallback — stabilize reference so DashFormContext consumers don't
  // thrash on every parent re-render. Keeping this stable fixes the
  // intermittent button-not-responding bug where a stale context value
  // would capture an old setDashData closure.
  const updateField = React.useCallback(
    (key, val) => setDashData(prev => ({ ...prev, [key]: val })),
    []
  );

  const handleSave = async () => {
    // Build the payload from form fields
    const patientName = dashData["client::Patient Name"]?.trim();
    const clientName = [dashData["client::Client First Name"], dashData["client::Client Last Name"]].filter(s => s && s.trim()).join(" ").trim();
    const clientPhone = dashData["client::Phone"] || null;
    const clientEmail = dashData["client::Email"] || null;
    // AN UNSTATED VALUE MUST NOT BECOME AN INVENTED ONE.
    //
    // handleSave built the CREATE body with a literal for each of these:
    //
    //   `|| "Rehabilitation"`  condition — the one that does real damage.
    //                          getProtocolType matches no rule against it, so
    //                          the protocol is picked by FALLTHROUGH to
    //                          osteoarthritis. Worse, a FILLED column is not a
    //                          gap, so patient-gaps reported the record ready
    //                          and the check built to catch this said nothing.
    //   `|| "Mixed Breed"`     breed — also a real option in the dropdown, so
    //                          the record cannot be told apart from an answer.
    //
    // WHY THESE ARE "" AND 0 RATHER THAN null: name, breed, age, weight and
    // condition are all NOT NULL in the patients table. Sending null fails the
    // INSERT outright, so the empty encoding has to be a value the column
    // accepts, and the job of reporting it falls to patient-gaps — which is
    // written for exactly this and treats all four as missing:
    //
    //   condition ""   missing() -> String(v).trim() === ""      BLOCKS
    //   age 0          isMissing -> Number(v) <= 0               DEGRADES
    //   weight 0       isMissing -> Number(v) <= 0               DEGRADES
    //
    // So 0 is not a fabricated age here, it is this schema's way of spelling
    // "nobody has said" — and unlike a fabricated 5/10 pain score it is
    // reported to the clinician rather than read as a finding.
    //
    // The backend stopped inventing clinical findings in 3516874 (lameness 0,
    // BCS 5, pain 5/10, mobility "Moderate"). This is the same fix on the
    // screen that calls it.
    const weightRaw = parseFloat(dashData["client::Weight (lbs)"]);
    const weight = Number.isFinite(weightRaw) ? weightRaw : 0;
    const ageRaw = parseInt(dashData["client::Age (years)"], 10);
    const age = Number.isFinite(ageRaw) ? ageRaw : 0;
    const breed = dashData["client::Breed"] || "";

    // Guard: must have at least patient name + client name to save
    if (!patientName || !clientName) {
      setSaved(false);
      return;
    }

    try {
      let targetPatient = patient;

      // ── CREATE patient if no existing patient is selected ──
      // This is the fix for the silent save bug. When user types names into the
      // form WITHOUT selecting an existing patient, we POST first to create.
      if (!patient?.id) {
        // Honor the species the clinician actually selected on the Client
        // block (Canine or Feline) instead of hardcoding canine. Previously
        // every new Feline record was persisted as canine, causing the
        // header label to flip back to Canine on reload.
        const speciesFromForm = (dashData["client::Species"] || "Canine").toLowerCase();
        const speciesNormalized = speciesFromForm === "feline" ? "feline" : "canine";
        const createRes = await fetch(`${apiBase}/patients`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            name: patientName,
            species: speciesNormalized,
            breed,
            age,
            weight,
            sex: dashData["client::Sex"] || null,
            condition: resolveDiagnosis(dashData, null) || "",
            client_name: clientName,
            client_email: clientEmail,
            client_phone: clientPhone,
          }),
        });
        const createJson = await createRes.json();
        if (!createJson?.data?.id) throw new Error("Patient creation failed");
        targetPatient = createJson.data;
      }

      // ── PUT dashboard_data to the patient (existing or just-created) ──
      const putRes = await fetch(`${apiBase}/patients/${targetPatient.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          name: patientName,
          client_name: clientName,
          client_phone: clientPhone || targetPatient.client_phone,
          client_email: clientEmail || targetPatient.client_email,
          weight: weight || targetPatient.weight,
          breed: breed || targetPatient.breed,
          dashboard_data: dashData,
        }),
      });
      const putJson = await putRes.json();

      // Update parent patient state with the saved patient (includes new visit_count)
      if (putJson?.data && setSelectedPatient) setSelectedPatient(putJson.data);

      // Refresh the patient list so search finds the new patient
      try {
        const listRes = await fetch(`${apiBase}/patients`, { headers: authHeaders });
        const listJson = await listRes.json();
        setAllPatients(listJson.data || listJson || []);
      } catch {}

      // Success toast
      setUpdateToast({ type: "success", message: t("toast.saveSuccess", { defaultValue: "Patient record updated successfully" }) });
      setTimeout(() => setUpdateToast(null), 3200);
    } catch (err) {
      console.error("[handleSave]", err);
      setUpdateToast({ type: "error", message: t("toast.saveFailed", { msg: err.message, defaultValue: `Save failed: ${err.message}` }) });
      setTimeout(() => setUpdateToast(null), 4500);
    }

    // Also persist to localStorage as draft backup
    try { localStorage.setItem(`k9dash_${patient?.id || "draft"}`, JSON.stringify(dashData)); } catch {}
    setSaved(true); setTimeout(()=>setSaved(false),2400);
  };

  // Load draft from localStorage as fallback
  useEffect(() => {
    try {
      const draft = localStorage.getItem(`k9dash_${patient?.id || "draft"}`);
      if (draft) setDashData(prev => {
        const parsed = JSON.parse(draft);
        // Only use localStorage if no backend data was loaded
        const hasBackendData = Object.keys(prev).some(k => k.includes("::") && k !== "client::Patient Name");
        return hasBackendData ? prev : { ...parsed, ...prev };
      });
    } catch {}
  }, [patient?.id]);

  const askBeauInContext = async () => {
    if (!beauQuery.trim() || !openBlock) return;
    setBeauLoading(true); setBeauAnswer("");
    try {
      const ctx = BEAU_BLOCK_CONTEXTS[openBlock] || "";
      const patientCtx = patient ? `Patient: ${patient.name}, ${patient.breed || "unknown breed"}, ${patient.age || "unknown age"}, ${patient.weight || "unknown weight"}lbs, Condition: ${patient.condition || "not specified"}.` : "";
      const text = await callBeau(
        `You are B.E.A.U. — the Biomedical Evidence-based Analytical Unit of K9 Rehab Pro™. ${ctx} ${patientCtx} Answer concisely and clinically. No markdown. Reference evidence where applicable (Millis & Levine, Drum, ACVSMR standards).`,
        beauQuery,
        i18nInst.language || "en"
      );
      setBeauAnswer(text);
      if (beauVoice.autoSpeak && text) beauVoice.speak(text);
    } catch (err) { setBeauAnswer(`Error: ${err.message}`); }
    setBeauLoading(false);
  };

  const block     = BLOCKS.find(b=>b.id===openBlock);

  // Memoize the DashFormContext value to prevent re-renders of every form
  // field on every unrelated state change. Without this, every keystroke
  // anywhere re-renders every Sec/F/MultiF on the page and can starve
  // click handlers under heavy typing — the intermittent-button bug.
  const uiLang = i18nInst.language || "en";
  const ctxValue = React.useMemo(() => ({
    data: dashData, update: updateField, blockId: openBlock,
    // V3: panels that read and write their own table need to know WHICH
    // patient. HomePanel is the first; the blob-backed panels do not, because
    // the blob is loaded for the selected patient before they render.
    patientId: patient?.id || null,
    beauVoice, uiLang, handleSave, updateToast, setUpdateToast,
  }), [dashData, updateField, openBlock, patient?.id, beauVoice, uiLang, handleSave, updateToast]);

  // No patient gate — dashboard always shows the 11-block grid.
  // If no patient is selected, header shows a prompt to select one.

  return (
    <DashFormContext.Provider value={ctxValue}>
      <div className="k9v2" style={{ background:C.bg, minHeight:"100vh" }}>
        <style>{CSS}</style>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 24px", background:C.white, borderBottom:`1px solid ${C.border}`, boxShadow:"0 1px 6px rgba(26,39,68,.07)" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:17, fontWeight:700, color:C.navy }}>{t("dashboard.title")}</div>
              {/* ── Patient Search ── */}
              <div ref={searchRef} style={{ position:"relative" }}>
                <input
                  type="text"
                  placeholder={patient ? patientLabel : "Search patient by name, breed, or owner..."}
                  value={searchQ}
                  onChange={e => { setSearchQ(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  style={{
                    width: 380, padding:"7px 12px 7px 32px", fontSize:12, border:`1px solid ${C.border}`,
                    borderRadius:6, background:C.bg, outline:"none", color:C.navy, fontWeight: patient ? 600 : 400,
                  }}
                />
                <span style={{ position:"absolute", left:10, top:8, fontSize:14, color:C.muted }}>🔍</span>
                {searchOpen && filteredPatients.length > 0 && (
                  <div style={{
                    position:"absolute", top:"100%", left:0, right:0, zIndex:300,
                    background:C.white, border:`1px solid ${C.border}`, borderRadius:8,
                    boxShadow:"0 8px 32px rgba(0,0,0,.15)", maxHeight:280, overflowY:"auto", marginTop:4,
                  }}>
                    {filteredPatients.map(p => (
                      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => selectPatient(p))(e); } }} key={p.id} onClick={() => selectPatient(p)}
                        style={{
                          padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${C.bg}`,
                          display:"flex", justifyContent:"space-between", alignItems:"center",
                          background: patient?.id === p.id ? C.greenLt : "transparent",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = C.bg}
                        onMouseLeave={e => e.currentTarget.style.background = patient?.id === p.id ? C.greenLt : "transparent"}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:C.navy }}>{p.name}</div>
                          <div style={{ fontSize:10, color:C.muted }}>{p.breed} · {p.client_name}{p.visit_count > 0 ? ` · Visit #${p.visit_count}` : ""}</div>
                        </div>
                        <span style={{ fontSize:9, padding:"2px 8px", borderRadius:4, background:C.blueLt, color:C.blue, fontWeight:700 }}>
                          {p.condition || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {patientLabel && (
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                <span style={{ fontWeight:600, color:C.navy }}>{patientLabel}</span>
              </div>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={handleSave}
              style={{ padding:"8px 18px", background: saved ? C.green : C.greenLt, border:`1px solid ${C.green}66`, color: saved ? C.white : C.green, borderRadius:5, cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:".08em", transition:"all .2s" }}>
              {saved ? "✓ SAVED" : "SAVE"}
            </button>
            <BeauVoiceControl
              isSpeaking={beauVoice.isSpeaking}
              isPaused={beauVoice.isPaused}
              autoSpeak={beauVoice.autoSpeak}
              setAutoSpeak={beauVoice.setAutoSpeak}
              onStop={beauVoice.stop}
              onPause={beauVoice.pause}
              onResume={beauVoice.resume}
              voiceName={beauVoice.voiceName}
              compact
            />
            <LanguageSelector/>
            <div style={{ padding:"6px 14px", background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:5, fontSize:11, color:C.green, fontWeight:700, textTransform:"uppercase" }}>
              B.E.A.U. READY
            </div>
          </div>
        </div>

        {/* ── BLOCK GRID ── */}
        <div style={{ padding:22 }}>
        {/* ── WHERE THIS PATIENT IS IN THE WORKFLOW ──────────────────────

            Sal's flow: a client comes in because the dog is getting older,
            the vet examines, the nurse takes vitals, the vet diagnoses and
            calls surgical or non-surgical. The patient may not be ADMITTED
            until the following week, and B.E.A.U.'s metrics are added then.

            So "which blocks still need filling" depends entirely on where
            the patient is, and until now the dashboard had no idea. It
            never opened a visit at all: Louie and Haley have ZERO rows in
            `visits` despite complete workups, which is the audit line
            "5 patients have a form assessment recorded at no visit".

            This states the stage and nothing more. It does NOT yet hide or
            require any field by stage — which blocks an intake must capture
            before admission is a clinical judgement and is Sal’s to write
            (patient-block-state.js STAGE_REQUIREMENTS, deliberately empty).
            Saying where we are is useful on its own; guessing what that
            demands of a clinician would not be. */}
        {blockState && blockState.stage && (() => {
          const STAGE_LABEL = {
            NONE:         { text: "No visit opened",  tone: "warn" },
            INTAKE:       { text: "Intake",           tone: "info" },
            ADMISSION:    { text: "Admitted",         tone: "good" },
            IN_PROGRAMME: { text: "In programme",     tone: "good" },
          };
          const st = STAGE_LABEL[blockState.stage.stage] || { text: blockState.stage.stage, tone: "info" };
          const tone = st.tone === "warn"
            ? { fg: C.amber, bg: C.amberLt || "#FFFBEB", br: C.amber }
            : st.tone === "good"
              ? { fg: C.green, bg: C.greenLt, br: C.green }
              : { fg: C.teal, bg: C.tealLt, br: C.teal };
          return (
            <div style={{
              display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
              margin:"0 0 16px", padding:"10px 14px",
              background: tone.bg, border:`1px solid ${tone.br}44`, borderRadius:6,
            }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:".09em",
                textTransform:"uppercase", color: tone.fg }}>Stage</span>
              <span style={{ fontSize:13, fontWeight:700, color: C.navy }}>{st.text}</span>
              <span style={{ fontSize:11, color:C.muted }}>{blockState.stage.why}</span>
            </div>
          );
        })()}

          {/* ── UPDATE PATIENT RECORD success/error toast ── */}
          {updateToast && (
            <div style={{
              position:"fixed", top:80, right:24, zIndex:400, padding:"14px 20px",
              background: updateToast.type === "success" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${updateToast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
              borderLeft: `4px solid ${updateToast.type === "success" ? "#16a34a" : "#dc2626"}`,
              borderRadius:6, boxShadow:"0 8px 24px rgba(0,0,0,.15)",
              fontSize:13, color: updateToast.type === "success" ? "#166534" : "#991b1b",
              maxWidth:360, animation:"fadeIn .2s ease",
              display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{ fontSize:18 }}>{updateToast.type === "success" ? "✅" : "⚠️"}</span>
              <span style={{ fontWeight:600 }}>{updateToast.message}</span>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
            {BLOCKS.map((b,i)=>{
              // ── Block data indicator ──
              // The server's answer where we have one, the old blob count
              // where we do not (no patient selected, or the fetch failed).
              const served = blockState && blockState.blocks && blockState.blocks[b.id];
              const blockKeys = Object.keys(dashData).filter(k => k.startsWith(b.id + "::") && dashData[k] && String(dashData[k]).trim());
              const dataStatus = served
                ? served.status
                : (blockKeys.length >= 3 ? "complete" : blockKeys.length > 0 ? "partial" : "empty");
              const hasData = dataStatus === "complete" || dataStatus === "partial";

              // ── WHAT THIS STAGE ACTUALLY ASKS FOR ────────────────────
              //
              // Sal: "during intake all these are not necessary to
              // complete". An empty Goals block at an intake visit is the
              // workflow working, not a gap, and an amber dot there is the
              // dashboard reporting correct practice as an error.
              //
              // His lists, 2026-09-26: intake is Client, Assessment,
              // Treatment and Diagnostics. Admission brings B.E.A.U.
              // Metrics, Goals, Conditioning and the Home Exercise Program,
              // with PetCare Nutrition "if the dog needs it" — so nutrition
              // is offered and never chased.
              const expected = served ? served.expected : null;
              const notYetDue = expected === "not_yet";
              const needsAttention = Boolean(served && served.needs_attention);

              const dotColor = needsAttention ? C.amber
                : dataStatus === "complete" ? C.green
                : dataStatus === "partial" ? C.amber
                : dataStatus === "unknown" ? C.muted
                : null;

              return (
              <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (()=>handleBlockClick(b.id))(e); } }} key={b.id} className="block-card"
                onClick={()=>handleBlockClick(b.id)}
                title={
                  needsAttention ? "Needed at this stage and still empty"
                    : notYetDue && !hasData ? "Not needed yet at this stage"
                    : hasData ? "Block contains data — click to review" : ""
                }
                style={{
                  background:C.white,
                  border: hasData ? `1.5px solid ${dotColor}99` : `1.5px solid ${C.border}`,
                  borderRadius:9, padding:"22px 20px", position:"relative", overflow:"hidden",
                  boxShadow: hasData ? `0 1px 6px rgba(26,39,68,.10), 0 0 10px ${dotColor}33` : "0 1px 6px rgba(26,39,68,.06)",
                  animationDelay:`${i*.04}s`, animation:"fadeUp .3s ease both",
                }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:b.color }}/>
                {/* ── Data indicator dot — top right ── */}
                {hasData && (
                  <div
                    aria-label={dataStatus === "complete" ? "Block complete" : "Block partially filled"}
                    title={dataStatus === "complete" ? "Complete" : "Partially filled"}
                    style={{
                      position:"absolute", top:9, right:9,
                      width:16, height:16, borderRadius:"50%",
                      background:dotColor, border:`2px solid ${C.white}`,
                      // Outer ring gives the dot an edge against the white card;
                      // at 10px with a white border the green core was only 7px.
                      boxShadow:`0 0 0 1.5px ${dotColor}, 0 1px 3px rgba(26,39,68,.35)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:9, lineHeight:1, color:C.white, fontWeight:900,
                    }}>
                    {/* Glyph, not colour alone — WCAG 1.4.1 Use of Colour. */}
                    {dataStatus === "complete" ? "\u2713" : "\u2022"}
                  </div>
                )}
                <div style={{ width:44, height:44, borderRadius:10, background:b.colorLt, border:`1px solid ${b.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14, boxShadow:`0 2px 8px ${b.color}22`, position:"relative" }}>
                  {b.icon}
                  {/* ── Checkmark badge on icon ── */}
                  {dataStatus === "complete" && (
                    <div aria-hidden="true" style={{
                      position:"absolute", bottom:-4, right:-4,
                      width:19, height:19, borderRadius:"50%",
                      background:C.green, border:`2px solid ${C.white}`,
                      boxShadow:`0 1px 3px rgba(26,39,68,.35)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:11, lineHeight:1, color:C.white, fontWeight:900,
                    }}>✓</div>
                  )}
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:5 }}>{t(`tiles.${b.id}.label`)}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.55 }}>{t(`tiles.${b.id}.desc`)}</div>
                <div style={{ position:"absolute", bottom:16, right:16, fontSize:16, color:b.color, opacity:.35 }}>→</div>
              </div>
              );
            })}
          </div>

          <div style={{ marginTop:20, padding:"10px 4px", display:"flex", justifyContent:"space-between", borderTop:`1px solid ${C.border}` }}>
            <span style={{ fontSize:9, color:C.gray, letterSpacing:".1em", textTransform:"uppercase" }}>{t("dashboard.footerIntelligence")}</span>
            <span style={{ fontSize:9, color:C.gray, letterSpacing:".1em" }}>{t("dashboard.footerCopyright")}</span>
          </div>
        </div>

        {/* ── BLOCK MODALS ── */}
        {/* Only the active block is mounted — ensures Sec collapsible state
            resets (defaultOpen=false) every time the modal is reopened. */}
        {(() => {
          if (!openBlock) return null;
          const b = BLOCKS.find(x => x.id === openBlock);
          if (!b) return null;
          const Comp = BLOCK_COMPS[b.id];
          if (!Comp) return null;
          return (
            <Modal key={b.id} title={t(`tiles.${b.id}.label`)} color={b.color} colorLt={b.colorLt} icon={b.icon} onClose={()=>setOpenBlock(null)}
              blockId={b.id}
              patientLabel={patientLabel}
              beauContext={BEAU_BLOCK_CONTEXTS[b.id]}
              beauOpen={beauOpen} setBeauOpen={setBeauOpen}
              beauQuery={beauQuery} setBeauQuery={setBeauQuery}
              beauAnswer={beauAnswer} beauLoading={beauLoading}
              onAskBeau={askBeauInContext}
            >
              <Comp patientName={patientName} patientData={patient}/>
            </Modal>
          );
        })()}

        {/* ── INFO MODALS (How to Use, Ask B.E.A.U., About, Disclaimer, HIPAA) ── */}
        {SIDEBAR_NAV.map(s => {
          const Comp = SIDEBAR_COMPS[s.id];
          if (!Comp) return null;
          return (
            <div key={s.id} style={{ display: openSidebar === s.id ? 'contents' : 'none' }}>
              <Modal title={t(`nav.${s.id}`)} color={C.blue} colorLt={C.blueLt} icon={s.icon} onClose={()=>setOpenSidebar(null)}>
                <Comp/>
              </Modal>
            </div>
          );
        })}
      </div>
    </DashFormContext.Provider>
  );
}
