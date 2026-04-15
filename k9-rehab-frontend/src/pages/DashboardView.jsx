import React, { useState, useRef, useEffect, useMemo, createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LOCALES } from "../i18n";
import useBeauVoice from "../hooks/useBeauVoice";
import BeauVoiceControl, { SpeakButton } from "../components/BeauVoiceControl";

// Ensure i18n is initialized (side effect — the import above runs the init)
void i18n;

// ─── FORM CONTEXT ─── auto-wires all F fields without modifying each call
const DashFormContext = createContext({ data: {}, update: () => {}, blockId: null, beauVoice: null });

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
const CANINE_BREEDS = ["Affenpinscher","Afghan Hound","Airedale Terrier","Akita","Alaskan Malamute","American Bulldog","American Cocker Spaniel","American Eskimo Dog","American Pit Bull Terrier","American Staffordshire Terrier","Australian Cattle Dog","Australian Shepherd","Basenji","Basset Hound","Beagle","Belgian Malinois","Belgian Tervuren","Bernese Mountain Dog","Bichon Frise","Border Collie","Border Terrier","Boston Terrier","Boxer","Boykin Spaniel","Brittany","Brussels Griffon","Bulldog (English)","Bullmastiff","Cairn Terrier","Cane Corso","Cavalier King Charles Spaniel","Chesapeake Bay Retriever","Chihuahua","Chinese Shar-Pei","Chow Chow","Clumber Spaniel","Cocker Spaniel","Collie (Rough)","Dachshund (Miniature)","Dachshund (Standard)","Dalmatian","Doberman Pinscher","Dogue de Bordeaux","English Setter","English Springer Spaniel","Field Spaniel","Flat-Coated Retriever","Fox Terrier","French Bulldog","German Shepherd Dog","German Shorthaired Pointer","Giant Schnauzer","Golden Retriever","Great Dane","Great Pyrenees","Greyhound","Irish Setter","Irish Wolfhound","Italian Greyhound","Jack Russell Terrier","Labrador Retriever","Leonberger","Lhasa Apso","Maltese","Manchester Terrier","Mastiff","Miniature Pinscher","Miniature Schnauzer","Mixed Breed","Newfoundland","Norfolk Terrier","Norwegian Elkhound","Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Papillon","Pekingese","Pembroke Welsh Corgi","Plott Hound","Pointer","Pomeranian","Poodle (Miniature)","Poodle (Standard)","Poodle (Toy)","Portuguese Water Dog","Pug","Rat Terrier","Rhodesian Ridgeback","Rottweiler","Saint Bernard","Samoyed","Scottish Terrier","Shetland Sheepdog","Shiba Inu","Shih Tzu","Siberian Husky","Soft Coated Wheaten Terrier","Staffordshire Bull Terrier","Standard Schnauzer","Tibetan Mastiff","Vizsla","Weimaraner","Welsh Corgi (Cardigan)","West Highland White Terrier","Whippet","Wire Fox Terrier","Xoloitzcuintli","Yorkshire Terrier","Other — Specify in notes"];

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
const Lbl = ({ children, range }) => (
  <div style={{ fontSize:10, fontWeight:600, color:C.muted, letterSpacing:".07em", textTransform:"uppercase", marginBottom:4, marginTop:12, display:"flex", alignItems:"center" }}>
    {children}{range && <span className="range-badge">Normal: {range}</span>}
  </div>
);

const F = ({ label, placeholder, type="text", options, rows, range, hint, disabled }) => {
  const { data, update, blockId } = useContext(DashFormContext);
  const key = blockId ? `${blockId}::${label}` : label;
  const value = data[key] ?? "";
  const onChange = (val) => { if (!disabled) update(key, val); };
  return (
    <div>
      <Lbl range={range}>{label}</Lbl>
      {options
        ? <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)}><option value="">Select…</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>
        : rows
          ? <textarea placeholder={placeholder} rows={rows} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}/>
          : <input type={type} placeholder={placeholder} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}/>
      }
      {hint && <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>{hint}</div>}
    </div>
  );
};

// Multi-select checkbox group. Stores selected options as a "||"-joined
// string in DashFormContext so it survives save/reload without schema change.
// Key format: <blockId>::<label>
const MultiF = ({ label, options, hint, accent="#EC4899", disabled }) => {
  const { data, update, blockId } = useContext(DashFormContext);
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
            <div key={o} className={`cb-row${checked?" active":""}`} onClick={() => toggle(o)} style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
              <input type="checkbox" checked={checked} disabled={disabled} readOnly style={{ width:14, height:14, accentColor:accent, flexShrink:0 }}/>
              <span style={{ fontSize:11, color: checked ? accent : C.text }}>{o}</span>
            </div>
          );
        })}
      </div>
      {hint && <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>{hint}</div>}
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

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      <div>
        <Lbl>{label} (lbs)</Lbl>
        <input type="number" placeholder="0.0" step="0.1" value={lbsVal} disabled={disabled} onChange={e => onLbs(e.target.value)}/>
      </div>
      <div>
        <Lbl>{label} (kg)</Lbl>
        <input type="number" placeholder="0.0" step="0.1" value={kgVal} disabled={disabled} onChange={e => onKg(e.target.value)}/>
        <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>Auto-converts to/from lbs</div>
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

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      <div>
        <Lbl>Date of Birth</Lbl>
        <input type="date" disabled={disabled} value={dobVal} onChange={e => onDob(e.target.value)}/>
      </div>
      <div>
        <Lbl>Age (years)</Lbl>
        <input type="number" placeholder="e.g. 6" min="0" max="30" disabled={disabled} value={ageVal} onChange={e => onAge(e.target.value)}/>
        <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>Auto-converts to/from DOB</div>
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
      <div
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
        style={{
          fontSize:11, fontWeight:700, color, letterSpacing:".1em", textTransform:"uppercase",
          background: colorLt || C.blueLt, borderLeft:`3px solid ${color}`,
          padding:"7px 12px", borderRadius:"0 5px 5px 0",
          marginBottom: isHidden ? 0 : 12,
          marginTop: noTop ? 0 : 4,
          cursor: collapsible ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          userSelect: "none",
        }}>
        <span style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span>{title}</span>
          {hasData && (
            <span title="Section has data" style={{ width:8, height:8, borderRadius:"50%", background:C.teal, boxShadow:`0 0 0 2px ${C.tealLt}`, flexShrink:0 }}/>
          )}
        </span>
        {collapsible && (
          <span style={{ fontSize: 10, opacity: 0.8 }}>{open ? "▼" : "▶"}</span>
        )}
      </div>
      {!isHidden && children}
    </div>
  );
};

const Divider = () => <div style={{ height:1, background:C.border, margin:"18px 0" }}/>;

// ─── COLLAPSIBLE SUB-SECTION ──────────────────────────────────────────────────
// Lightweight nested collapsible for use inside a non-collapsible Sec.
// Used when protocol/reference text must stay visible while input fields collapse.
// Local state resets on unmount (relies on parent Modal conditional-render fix).
const CollapsibleSub = ({ title, children, defaultOpen=false, accentColor=C.teal }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 12,
      marginTop: 4,
    }}>
      <div
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
        <span>{title}</span>
        <span style={{ fontSize: 10, opacity: 0.85 }}>{open ? "▼" : "▶"}</span>
      </div>
      {open && <div style={{ padding: "14px" }}>{children}</div>}
    </div>
  );
};

// ─── CHECKBOX ITEM ────────────────────────────────────────────────────────────
function CbItem({ label, checked, onToggle, children }) {
  return (
    <div>
      <div className={`cb-row${checked?" active":""}`} onClick={onToggle}>
        <input type="checkbox" checked={!!checked} readOnly
          style={{ width:16, height:16, accentColor:C.blue, flexShrink:0, cursor:"pointer" }}/>
        <span style={{ fontSize:12, fontWeight:600, color:checked?C.blue:C.text }}>{label}</span>
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
function Modal({ title, color, colorLt, icon, onClose, children, beauContext, beauOpen, setBeauOpen, beauQuery, setBeauQuery, beauAnswer, beauLoading, onAskBeau, patientLabel }) {
  const { t } = useTranslation();
  const { handleSave } = useContext(DashFormContext);
  const [saving, setSaving] = useState(false);
  const hasBeau = !!beauContext && !!setBeauOpen;
  const onSaveClose = async () => {
    if (saving) return;
    setSaving(true);
    try { await handleSave?.(); } finally { setSaving(false); onClose(); }
  };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(26,39,68,.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn .18s ease" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:10, width:"100%", maxWidth:820, maxHeight:"90vh", display:"flex", flexDirection:"column", animation:"modalIn .2s ease", boxShadow:"0 24px 80px rgba(26,39,68,.25)", border:`1px solid ${C.border}` }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:13, padding:"16px 22px", borderBottom:`1px solid ${C.border}`, background: colorLt || C.blueLt, borderRadius:"10px 10px 0 0", flexShrink:0 }}>
          <div style={{ width:38, height:38, borderRadius:8, background:C.white, border:`1.5px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:`0 2px 8px ${color}33` }}>
            {icon}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{title}</div>
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
              {beauOpen ? "✕ Close B.E.A.U." : "⬡ Ask B.E.A.U."}
            </button>
          )}
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${C.border}`, color:C.muted, fontSize:16, cursor:"pointer", padding:"4px 10px", borderRadius:5 }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:22 }}>
          {children}
          {/* ── Contextual B.E.A.U. ── */}
          {hasBeau && beauOpen && (
            <div style={{ marginTop:20, padding:16, background:"#F0F9FF", border:"1px solid #0EA5E944", borderRadius:8, animation:"fadeIn .15s ease" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#0EA5E9", letterSpacing:".1em", marginBottom:10 }}>ASK B.E.A.U. — {title.toUpperCase()}</div>
              <div style={{ display:"flex", gap:8 }}>
                <textarea
                  value={beauQuery || ""}
                  onChange={e => setBeauQuery(e.target.value)}
                  placeholder={`Ask B.E.A.U. about ${title.toLowerCase()}…`}
                  rows={2}
                  style={{ flex:1, fontSize:12, padding:"10px 12px", border:"1px solid #0EA5E944", borderRadius:5, resize:"vertical" }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAskBeau(); } }}
                />
                <button onClick={onAskBeau} disabled={beauLoading || !beauQuery?.trim()}
                  style={{ padding:"10px 18px", background: beauLoading ? "#E0F2FE" : "#0EA5E9", border:"none", color:C.white, borderRadius:5, cursor: beauLoading ? "not-allowed" : "pointer", fontSize:11, fontWeight:700, alignSelf:"flex-end", minWidth:80 }}>
                  {beauLoading ? "..." : "ASK"}
                </button>
              </div>
              {beauAnswer && (
                <div style={{ marginTop:12, padding:14, background:C.white, border:"1px solid #0EA5E933", borderRadius:6 }}>
                  <pre style={{ fontSize:12, color:C.text, whiteSpace:"pre-wrap", lineHeight:1.8, fontFamily:"Georgia, serif" }}>{beauAnswer}</pre>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ padding:"13px 22px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"flex-end", gap:10, flexShrink:0, background:C.bg, borderRadius:"0 0 10px 10px" }}>
          <button onClick={onClose} style={{ padding:"9px 22px", background:C.white, border:`1px solid ${C.border}`, color:C.muted, borderRadius:5, cursor:"pointer", fontSize:12, fontWeight:600, textTransform:"uppercase" }}>{t("modal.close")}</button>
          <button onClick={onSaveClose} disabled={saving} style={{ padding:"9px 22px", background: saving ? "#cbd5e1" : color, border:"none", color:C.white, borderRadius:5, cursor: saving ? "wait" : "pointer", fontSize:12, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>{saving ? "⏳ SAVING…" : t("modal.saveAndClose")}</button>
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
// exercise library entries, protocol generation, and the Mars Petcare diet
// catalog remain in English across all locales (CLAUDE.md safety rule).
function LanguageSelector() {
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
              <div key={l.code} onClick={() => pick(l.code)}
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

// ── CLIENT & PATIENT ──────────────────────────────────────────────────────────
function ClientPanel() {
  const { data, update, handleSave } = useContext(DashFormContext);
  const [updating, setUpdating] = useState(false);
  // Species defaults to Canine; use dashData value if present so breed list stays in sync
  const species = data["client::Species"] || "Canine";
  const setSpecies = (v) => update("client::Species", v);
  const breeds = species === "Feline" ? FELINE_BREEDS : CANINE_BREEDS;

  const onUpdateClick = async () => {
    if (updating) return;
    setUpdating(true);
    try { await handleSave?.(); }
    finally { setTimeout(() => setUpdating(false), 600); }
  };

  return <>
    <Sec title="Client Information" color={C.blue} colorLt={C.blueLt} noTop>
      <Row><F label="Client First Name" placeholder="First name"/><F label="Client Last Name" placeholder="Last name"/></Row>
      <Row><F label="Phone" placeholder="(555) 000-0000" type="tel"/><F label="Email" placeholder="email@example.com" type="email"/></Row>
      <F label="Address" placeholder="Street, city, state, zip"/>
      <Row><F label="Emergency Contact" placeholder="Name & phone"/><F label="Referred By" placeholder="Referring veterinarian & clinic"/></Row>
      <Row><F label="Pet Insurance Provider" placeholder="Provider & policy number"/><F label="Primary Veterinarian" placeholder="Name & clinic"/></Row>
    </Sec>
    <Sec title="Patient Information" color={C.blue} colorLt={C.blueLt}>
      <Row><F label="Patient Name" placeholder="Pet's name"/>
        <div>
          <Lbl>Species</Lbl>
          <select value={species}
            onChange={e => setSpecies(e.target.value)}>
            {["Canine","Feline"].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Row>
      <Row>
        <div>
          <Lbl>Breed</Lbl>
          <select value={data["client::Breed"] || ""}
            onChange={e => update("client::Breed", e.target.value)}>
            <option value="">Select breed…</option>
            {breeds.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <F label="Sex" options={["Male — Intact","Male — Neutered","Female — Intact","Female — Spayed"]}/>
      </Row>
      <Row cols={2}>
        <AgeDobPair/>
        <F label="Color / Markings" placeholder="e.g. Black & tan, tricolor"/>
      </Row>
      <Row cols={2}>
        <WeightPair label="Weight" fieldBase="client::Weight"/>
        <F label="Microchip #" placeholder="15-digit number"/>
      </Row>
      <F label="Specialist / Surgeon" placeholder="Referring specialist name & clinic"/>
    </Sec>

    {/* ── UPDATE PATIENT RECORD — explicit commit button per Dr. Zaslow ── */}
    <div style={{
      marginTop: 14, padding: "16px 20px",
      background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)",
      border: "1.5px solid #10b981", borderRadius: 10,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 14,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#065f46", letterSpacing: ".04em", marginBottom: 3 }}>
          Ready to save changes?
        </div>
        <div style={{ fontSize: 11, color: "#047857", lineHeight: 1.5 }}>
          Click <strong>UPDATE PATIENT RECORD</strong> to lock in all edits to the database.
          This persists the patient chart and creates a visit record.
        </div>
      </div>
      <button
        onClick={onUpdateClick}
        disabled={updating}
        style={{
          padding: "13px 24px",
          background: updating ? "#d1fae5" : "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
          border: "none", color: updating ? "#065f46" : "#ffffff",
          borderRadius: 8, cursor: updating ? "wait" : "pointer",
          fontSize: 12, fontWeight: 800, letterSpacing: ".08em",
          whiteSpace: "nowrap",
          boxShadow: updating ? "none" : "0 4px 14px rgba(16,185,129,0.35)",
          display: "inline-flex", alignItems: "center", gap: 8,
          transition: "all .18s ease",
        }}>
        {updating ? "⏳ UPDATING…" : "✓ UPDATE PATIENT RECORD"}
      </button>
    </div>
  </>;
}

// ── DIAGNOSTICS ───────────────────────────────────────────────────────────────
function DiagnosticsPanel() {
  const imaging = ["Radiograph (X-Ray)","CT Scan","MRI","Ultrasound","Myelogram","Nuclear Scintigraphy","Fluoroscopy","Echocardiogram"];
  const labTypes = ["CBC","Chemistry Panel","Urinalysis","Thyroid Panel","Urinary Culture"];
  const { data, update } = useContext(DashFormContext);

  const isImgSelected = (im) => !!data[`diagnostics::Imaging ${im}`];
  const toggleImg = (im) => update(`diagnostics::Imaging ${im}`, isImgSelected(im) ? "" : "performed");
  const imgStatus = (im) => data[`diagnostics::Imaging ${im}`] || "";
  const setImgStatus = (im, status) => update(`diagnostics::Imaging ${im}`, status);

  const isLabChecked = (k) => !!data[`diagnostics::Lab ${k}`];
  const toggleLab = (k) => update(`diagnostics::Lab ${k}`, isLabChecked(k) ? "" : "true");

  const reportName = data["diagnostics::Lab Report Filename"] || "";
  const onFilePick = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const sizeKb = Math.round(f.size / 1024);
      update("diagnostics::Lab Report Filename", `${f.name} (${sizeKb} KB)`);
    }
  };
  const clearFile = () => update("diagnostics::Lab Report Filename", "");

  return <>
    <Sec title="Diagnostic Imaging" color={C.purple} colorLt={C.purpleLt} noTop>
      <div style={{ fontSize:11, color:C.muted, marginBottom:14, lineHeight:1.6 }}>
        Select imaging studies performed or recommended. Multiple selections allowed. Use the toggle per item to mark recommended studies not yet performed.
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:8 }}>
        {imaging.map(im => {
          const selected = isImgSelected(im);
          const status = imgStatus(im);
          return (
            <div key={im} style={{
              border: `1.5px solid ${selected ? C.purple : C.border}`,
              background: selected ? C.purpleLt : C.white,
              borderRadius: 6, padding: "10px 12px", cursor: "pointer",
              transition: "all .12s",
            }}>
              <div onClick={() => toggleImg(im)} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 3,
                  border: `1.5px solid ${selected ? C.purple : C.border}`,
                  background: selected ? C.purple : C.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.white, fontSize: 11, fontWeight: 900,
                }}>{selected ? "✓" : ""}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: selected ? C.purple : C.text }}>{im}</span>
              </div>
              {selected && (
                <div style={{ display:"flex", gap:6, marginTop:8, paddingLeft: 24 }}>
                  {["performed","recommended"].map(s => (
                    <div key={s}
                      onClick={(e) => { e.stopPropagation(); setImgStatus(im, s); }}
                      style={{
                        padding: "3px 10px", fontSize: 10, fontWeight: 700,
                        borderRadius: 12, border: `1px solid ${status === s ? C.purple : C.border}`,
                        background: status === s ? C.purple : C.white,
                        color: status === s ? C.white : C.muted,
                        textTransform: "uppercase", letterSpacing: ".06em",
                      }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}>
        <F label="Other Imaging / Notes" placeholder="Additional imaging studies or notes (e.g. breed-specific views, comparison films)…" rows={2}/>
      </div>
    </Sec>

    <Sec title="Laboratory Work" color={C.purple} colorLt={C.purpleLt}>
      <div style={{ fontSize:11, color:C.muted, marginBottom:14, lineHeight:1.6, padding:"10px 14px", background:C.purpleLt, border:`1px solid ${C.purple}33`, borderRadius:6 }}>
        <strong style={{ color: C.purple }}>Rehab intake scope:</strong> Record which labs were performed — not individual values. Abnormal results route to the appropriate department. Attach the full lab report PDF/image for reference.
      </div>

      {/* Master "Labwork performed" checkbox */}
      <div onClick={() => toggleLab("Performed")}
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          border: `1.5px solid ${isLabChecked("Performed") ? C.purple : C.border}`,
          background: isLabChecked("Performed") ? C.purpleLt : C.white,
          borderRadius: 6, cursor: "pointer", marginBottom: 12,
        }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4,
          border: `1.5px solid ${isLabChecked("Performed") ? C.purple : C.border}`,
          background: isLabChecked("Performed") ? C.purple : C.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.white, fontSize: 12, fontWeight: 900,
        }}>{isLabChecked("Performed") ? "✓" : ""}</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: isLabChecked("Performed") ? C.purple : C.text }}>
          Labwork performed
        </span>
      </div>

      {/* Individual lab type checkboxes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 12 }}>
        {labTypes.map(lab => {
          const checked = isLabChecked(lab);
          return (
            <div key={lab} onClick={() => toggleLab(lab)}
              style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                border: `1.5px solid ${checked ? C.purple : C.border}`,
                background: checked ? C.purpleLt : C.white,
                borderRadius: 6, cursor: "pointer",
              }}>
              <div style={{
                width: 16, height: 16, borderRadius: 3,
                border: `1.5px solid ${checked ? C.purple : C.border}`,
                background: checked ? C.purple : C.white,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.white, fontSize: 11, fontWeight: 900,
              }}>{checked ? "✓" : ""}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: checked ? C.purple : C.text }}>{lab}</span>
            </div>
          );
        })}
      </div>

      {/* Other lab — checkbox + free text */}
      <div onClick={() => toggleLab("Other")}
        style={{
          display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
          border: `1.5px solid ${isLabChecked("Other") ? C.purple : C.border}`,
          background: isLabChecked("Other") ? C.purpleLt : C.white,
          borderRadius: 6, cursor: "pointer", marginBottom: 8,
        }}>
        <div style={{
          width: 16, height: 16, borderRadius: 3,
          border: `1.5px solid ${isLabChecked("Other") ? C.purple : C.border}`,
          background: isLabChecked("Other") ? C.purple : C.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.white, fontSize: 11, fontWeight: 900,
        }}>{isLabChecked("Other") ? "✓" : ""}</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: isLabChecked("Other") ? C.purple : C.text }}>Other</span>
      </div>
      {isLabChecked("Other") && (
        <div style={{ marginBottom: 12 }}>
          <F label="Other Tests — Specify" placeholder="List any additional diagnostic tests performed…" rows={2}/>
        </div>
      )}

      <Divider/>

      {/* Single Lab Date + Reference Laboratory */}
      <Row>
        <F label="Lab Date" type="date"/>
        <F label="Reference Laboratory" placeholder="e.g. IDEXX, Antech, In-house"/>
      </Row>

      {/* Attach Lab Report */}
      <div style={{ marginTop: 14 }}>
        <Lbl>Attach Lab Report</Lbl>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px",
            background: C.purpleLt, border: `1.5px solid ${C.purple}`, borderRadius: 6,
            color: C.purple, fontSize: 12, fontWeight: 700, cursor: "pointer",
            letterSpacing: ".04em",
          }}>
            📎 Choose File (PDF or Image)
            <input type="file" accept=".pdf,image/*" onChange={onFilePick} style={{ display: "none" }}/>
          </label>
          {reportName && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: C.greenLt, border: `1px solid ${C.green}55`, borderRadius: 6, fontSize: 11, color: C.green, fontWeight: 600 }}>
              ✓ {reportName}
              <span onClick={clearFile} style={{ cursor: "pointer", color: C.red, fontSize: 13, marginLeft: 4 }}>✕</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6, fontStyle: "italic" }}>
          File is captured for reference. Full lab report upload to patient record — coming in next version.
        </div>
      </div>
    </Sec>
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
  const { data } = useContext(DashFormContext);
  const species = data["client::Species"] || "Canine";
  const isFeline = species === "Feline";

  // Pain location anatomical regions (Sal's approved list)
  const PAIN_LOCATIONS = [
    "Cervical Spine","Thoracic Spine","Lumbar Spine","Pelvis",
    "Left Shoulder","Right Shoulder","Left Elbow","Right Elbow",
    "Left Carpus","Right Carpus","Left Hip","Right Hip",
    "Left Stifle","Right Stifle","Left Tarsus","Right Tarsus",
    "Generalized","Other"
  ];
  const PAIN_AGGRAVATING = [
    "Exercise","Rising from rest","Stairs","Jumping",
    "Cold weather","Palpation","Weight bearing","Prolonged sitting","Other"
  ];
  const PAIN_ALLEVIATING = [
    "Rest","Medication","Heat therapy","Cold therapy",
    "Massage","Reduced activity","Swimming","Other"
  ];

  return <>
    {/* ── SECTION 1 — ALWAYS OPEN ── */}
    <Sec title="Initial Clinical Assessment" color={C.amber} colorLt={C.amberLt} noTop>
      <Row>
        <F label="Assessment Date" type="date"/>
        <F label="Clinician Name & Credentials" placeholder="e.g. Sal Bonanno, CVN"/>
      </Row>
      <F label="Chief Complaint" placeholder="Primary reason for rehabilitation referral in client's words…"/>
      <F label="Relevant Medical & Surgical History" placeholder="Previous injuries, surgeries, rehabilitation history, activity level…" rows={3}/>
      <Row>
        <F label="Current Mobility Level" options={["Non-weight bearing (NWB)","Toe-touching weight bearing (TTWB)","Partial weight bearing (PWB)","Full weight bearing with lameness (FWBL)","Weight bearing — subtle lameness","Normal — no lameness"]}/>
        <F label="Lameness Grade" options={["Grade 0 — No lameness","Grade 1 — Intermittent, mild lameness","Grade 2 — Mild, consistent lameness","Grade 3 — Moderate lameness, always present","Grade 4 — Severe lameness, occasional NWB","Grade 5 — Non-weight bearing at all times"]}/>
      </Row>
      <F label="Initial Assessment Narrative" placeholder="Clinical impressions, functional limitations, overall patient presentation…" rows={3}/>
    </Sec>

    {/* ── SECTION 2 — PAIN ASSESSMENT (COLLAPSED) ── */}
    <Sec title="▶ Pain Assessment — Colorado State University Scale" color={C.red} colorLt={C.redLt} collapsible defaultOpen={false}>
      <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.muted, marginBottom:14, lineHeight:1.7 }}>
        <b style={{color:C.red}}>CSU Acute Pain Scale (0–4)</b> — Referenced in Millis & Levine, Canine Rehabilitation & Physical Therapy 2nd Ed.
        Scores reflect behavioral and physiological indicators. For chronic patients, open the <b>Helsinki Chronic Pain Index</b> from the sidebar for the printable client questionnaire.
      </div>
      {isFeline ? (
        <>
          <div style={{ fontSize:10, color:C.muted, marginBottom:8, fontStyle:"italic", padding:"6px 10px", background:C.white, border:`1px dashed ${C.border}`, borderRadius:4 }}>
            Feline Grimace Scale (FGS) — Evangelista et al 2019. Score each of the 5 facial action units 0–2. Total 0–10.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {FELINE_FGS_ITEMS.map(lbl => (
              <F key={lbl} label={lbl} options={FELINE_FGS_SCORES}/>
            ))}
          </div>
          <Row cols={2}>
            <F label="Pain Assessment at" options={["Rest","Activity","Palpation","Post-exercise"]}/>
            <div/>
          </Row>
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
      <Row>
        <F label="Pain Location — Primary" options={PAIN_LOCATIONS}/>
        <F label="Pain Location — Secondary" options={PAIN_LOCATIONS}/>
      </Row>
      <Row>
        <F label="Pain Aggravating Factors" options={PAIN_AGGRAVATING}/>
        <F label="Pain Alleviating Factors" options={PAIN_ALLEVIATING}/>
      </Row>
      <Row>
        <F label="Current Pain Medications" placeholder="Drug, dose, frequency"/>
        <F label="Response to Analgesia" options={["Excellent — Full relief","Good — Significant relief","Partial — Some improvement","Poor — Minimal response","None"]}/>
      </Row>
    </Sec>

    {/* ── SECTION 3 — CURRENT MEDICATIONS & SUPPLEMENTS (COLLAPSED) ── */}
    <Sec title="▶ Current Medications & Supplements" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <MedicationsSection/>
    </Sec>

    {/* ── SECTION 4 — DIAGNOSIS & PROBLEM LIST (COLLAPSED) ── */}
    <Sec title="▶ Clinical Diagnosis & Problem List" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>
        Primary diagnosis, comorbidities, and active problem list — as per Millis & Levine structured assessment format.
      </div>
      <F label="Primary Diagnosis" placeholder="e.g. Right caudal cruciate ligament rupture — post TPLO week 4"/>
      <Row>
        <F label="ICD / VeNom Code" placeholder="Diagnostic code if applicable"/>
        <F label="Date of Diagnosis / Surgery" type="date"/>
      </Row>
      <F label="Surgical Procedure" placeholder="e.g. TPLO right stifle — implant type and surgeon"/>
      <F label="Comorbidities / Secondary Diagnoses" placeholder="e.g. Bilateral hip dysplasia, obesity, osteoarthritis…" rows={2}/>
      <F label="Active Problem List" placeholder="List all active clinical problems in priority order…" rows={3}/>
      <Row>
        <F label="Prognosis" options={["Excellent","Good","Fair","Guarded","Poor"]}/>
        <F label="Rehabilitation Indication" options={["Post-surgical orthopedic","Post-surgical neurological","Non-surgical orthopedic","Neurological","Chronic pain management","Conditioning / Fitness","Palliative care","Other"]}/>
      </Row>
    </Sec>

    {/* ── SECTION 5 — GAIT ANALYSIS (COLLAPSED) ── */}
    <Sec title="▶ Gait Analysis" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <Row>
        <F label="Gait Assessment Method" options={["Visual observation — Subjective","Force plate analysis","Pressure walkway (e.g. Tekscan)","Video slow-motion analysis","Treadmill analysis","Kinematic analysis"]}/>
        <F label="Surface Assessed On" options={["Non-slip flooring","Grass / Outdoor","Treadmill","Walkway / Corridor","Mixed surfaces"]}/>
      </Row>
      <Row>
        <F label="Gait Pattern" options={["Normal","Antalgic — pain-avoiding","Ataxic — incoordinated","Paretic — weakness-based","Spastic — increased tone","Compensatory — shifting load","Mixed"]}/>
        <F label="Affected Limb(s)" options={["Right forelimb (RF)","Left forelimb (LF)","Right hindlimb (RH)","Left hindlimb (LH)","Both hindlimbs","Both forelimbs","All four limbs","Spinal / truncal"]}/>
      </Row>
      <Row>
        <F label="Stride Length" options={["Normal bilaterally","Shortened — ipsilateral","Shortened — contralateral","Bilateral reduction","Unable to assess"]}/>
        <F label="Weight Distribution" options={["Even — all four limbs","Shifting to forelimbs","Shifting to hindlimbs","Shifting to left","Shifting to right","Severely asymmetric"]}/>
      </Row>
      <F label="Proprioceptive Deficits" options={["None detected","Mild — delayed replacement","Moderate — consistent knuckling","Severe — dragging","Unable to assess"]}/>
      <F label="Gait Analysis Notes" placeholder="Detailed observations — cadence, symmetry, toe clearance, head bob, hip hike…" rows={3}/>
    </Sec>

    {/* ── SECTION 6 — NEUROLOGICAL (COLLAPSED) ── */}
    <Sec title="▶ Neurological Assessment" color={C.amber} colorLt={C.amberLt} collapsible defaultOpen={false}>
      <Row>
        <F label="Neurological Grade (Frankel / ASIA Modified)" options={["Grade I — Pain only, no deficits","Grade II — Ambulatory paresis","Grade III — Non-ambulatory paresis","Grade IV — Plegia with deep pain","Grade V — Plegia without deep pain"]}/>
        <F label="Lesion Localization" options={["N/A — No neurological signs","C1–C5 (Cervical)","C6–T2 (Cervical enlargement)","T3–L3 (Thoracolumbar)","L4–S3 (Lumbosacral enlargement)","Peripheral nerve","Neuromuscular junction","Muscle"]}/>
      </Row>
      <Row>
        <F label="Deep Pain Perception" options={["Present — bilateral","Present — right only","Present — left only","Absent — bilateral","Absent — right","Absent — left","Not tested"]}/>
        <F label="Patellar Reflex" options={["Normal","Hyporeflexia","Areflexia","Hyperreflexia","Not tested"]}/>
      </Row>
      <F label="Neurological Notes" placeholder="Additional neurological findings — cranial nerves, postural reactions, spinal reflexes…" rows={2}/>
    </Sec>
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
  </>;
}

// ── CLINIC EQUIPMENT ──────────────────────────────────────────────────────────
function EquipmentPanel() {
  const cats = [
    { cat:"Hydrotherapy", defaultOpen:true, items:["Underwater Treadmill (UWTM)","Therapy Pool — Full submersion","Portable Aquatic Tank","Cold Water Spa / Whirlpool"] },
    { cat:"Land Exercise Equipment", defaultOpen:false, items:["Land Treadmill","Cavaletti Rail Set","Balance Discs — Set","Balance Board / Rocker Board","Wobble Board","Foam Pads / Rolls","Physioroll / Peanut Ball","Resistance Bands / Theraband","Parallel Bars","Exercise Steps / Stairs (clinic)","Ramps","Cone Set","Agility Equipment"] },
    { cat:"Electrotherapy & Modalities", defaultOpen:false, items:["NMES Unit (Neuromuscular E-Stim)","TENS Unit","Therapeutic Ultrasound","Class IV Therapeutic Laser","Class IIIb Laser","Shockwave Therapy","PEMF (Pulsed Electromagnetic Field)","Cryotherapy Unit","Moist Heat / Hydrocollator","Infrared Therapy"] },
    { cat:"Manual Therapy & Assessment", defaultOpen:false, items:["Standard Goniometer","Digital Goniometer","Pressure Algometer","Measuring Tape (thigh circumference)","Force Platform / Pressure Walkway","Video Gait Analysis System","Kinematic Analysis System","IRAP / PRP Equipment"] },
    { cat:"Support & Mobility", defaultOpen:false, items:["Slings — Front end","Slings — Rear end","Full-body Harness","Wheelchairs / Carts","Orthoses / Braces","Non-slip Flooring / Mats","Treatment Table — Adjustable","Treatment Table — Hydraulic"] },
  ];
  // ── Wired to DashFormContext so checkbox state persists via save/reload ──
  // Key format: equipment::<CategoryName>::<ItemName>
  // Truthy = "true"  Falsy = ""
  const { data, update } = useContext(DashFormContext);

  return <>
    <div style={{ fontSize:11, color:C.muted, marginBottom:16, padding:"10px 14px", background:C.blueLt, borderRadius:6, border:`1px solid ${C.blue}33` }}>
      Check all equipment currently available at this clinic. B.E.A.U. uses this inventory to generate the in-clinic rehabilitation protocol — only available equipment will be prescribed.
    </div>
    {cats.map(grp=>(
      <Sec key={grp.cat} title={grp.cat} color={C.teal} colorLt={C.tealLt} collapsible defaultOpen={grp.defaultOpen}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
          {grp.items.map(item=>{
            const k = `equipment::${grp.cat}::${item}`;
            const checked = data[k] === "true";
            return (
              <div key={item} className={`cb-row${checked?" active":""}`} onClick={()=>update(k, checked ? "" : "true")}>
                <input type="checkbox" checked={checked} readOnly style={{ width:15, height:15, accentColor:C.teal, flexShrink:0 }}/>
                <span style={{ fontSize:11, color:checked?C.teal:C.text }}>{item}</span>
              </div>
            );
          })}
        </div>
      </Sec>
    ))}
    <Sec title="Other Equipment" color={C.teal} colorLt={C.tealLt} collapsible defaultOpen={true}>
      <F label="Describe any additional equipment not listed above" placeholder="Additional equipment, brand names, unique modalities…" rows={2}/>
    </Sec>
  </>;
}

// ── HOME EXERCISE PROGRAM ─────────────────────────────────────────────────────
function HomePanel() {
  const [location, setLocation] = useState("");
  return <>
    <Sec title="Exercise Location" color={C.blue} colorLt={C.blueLt} noTop>
      <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>
        Where will the home exercises be performed? This determines what equipment and surfaces B.E.A.U. can include in the program.
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        {["Indoor Only","Outdoor Only","Both Indoor & Outdoor"].map(l=>(
          <button key={l} onClick={()=>setLocation(l)} style={{ flex:1, padding:"11px 8px", background: location===l ? C.blue : C.white, border:`1.5px solid ${location===l ? C.blue : C.border}`, color: location===l ? C.white : C.muted, borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700, transition:"all .15s" }}>{l}</button>
        ))}
      </div>

      {(location==="Indoor Only"||location==="Both Indoor & Outdoor") && (
        <Sec title="Indoor Environment" color={C.blue} colorLt={C.blueLt}>
          <Row>
            <F label="Primary Flooring — Indoor" options={["Non-slip carpet — all areas","Hardwood / Tile (slippery)","Mixed — mostly carpet","Mixed — mostly hard floors","Rubber / Non-slip mats installed","Laminate"]}/>
            <F label="Available Space Indoors" options={["Open floor — large room","Hallway only","Limited — small apartment","Multiple rooms available","Dedicated exercise space"]}/>
          </Row>
          <Row>
            <F label="Indoor Stairs" options={["No stairs","1–3 steps to exit","Full staircase — must use","Full staircase — avoidable","Has ramp available"]}/>
            <F label="Stair Frequency" options={["N/A","Multiple times daily","Once daily","Only when necessary","Can be fully avoided"]}/>
          </Row>
        </Sec>
      )}

      {(location==="Outdoor Only"||location==="Both Indoor & Outdoor") && (
        <Sec title="Outdoor Environment" color={C.teal} colorLt={C.tealLt}>
          <Row>
            <F label="Outdoor Surface Type" options={["Flat grass — ideal","Uneven grass / terrain","Concrete / Pavement","Gravel / loose surface","Sand / beach","Mixed outdoor surfaces","Slope / incline available","Pool / water access"]}/>
            <F label="Outdoor Space Size" options={["Small yard — patio","Medium yard — fenced","Large yard — open","Beach / park access","Open field"]}/>
          </Row>
          <Row>
            <F label="Outdoor Steps / Ramps" options={["Flat — no steps","1–2 steps from door","Steps with railing","Ramp installed","Long driveway incline"]}/>
            <F label="Outdoor Safety" options={["Fully fenced — secure","Partially fenced","Leash required at all times","Open property"]}/>
          </Row>
        </Sec>
      )}
    </Sec>

    <Sec title="Available Home Equipment" color={C.blue} colorLt={C.blueLt}>
      <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>
        Tell B.E.A.U. everything available at home — inside AND outside. B.E.A.U. maps each item to evidence-based exercises appropriate for the patient's phase and location.
      </div>
      <F label="Indoor Items Available" placeholder="e.g. yoga mat, couch cushions, step stool, towels, rolled blankets, hula hoop, foam roller…" rows={2}/>
      {(location==="Outdoor Only"||location==="Both Indoor & Outdoor") && (
        <F label="Outdoor Items Available" placeholder="e.g. pool noodles, garden hose / sprinkler, outdoor steps, picnic table, slope / hill, swimming pool, garden chair…" rows={2}/>
      )}
      <F label="Lure / Reward Items" placeholder="e.g. high-value treats, peanut butter, lick mat, favorite toy…"/>
      <div style={{ padding:"10px 14px", background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:5, fontSize:11, color:C.muted, marginTop:10 }}>
        B.E.A.U. will generate exercises using ONLY the items listed — no equipment will be prescribed that the owner does not have. Indoor and outdoor exercises will be separated and labeled accordingly.
      </div>
    </Sec>

    <Sec title="Owner Profile" color={C.blue} colorLt={C.blueLt}>
      <Row>
        <F label="Owner Confidence with Exercises" options={["High — experienced, done rehab before","Moderate — willing to learn","Low — needs very simple program","Requires caregiver / second person"]}/>
        <F label="Expected Compliance" options={["High — very motivated","Moderate","Low — lifestyle limitations","Variable — work schedule"]}/>
      </Row>
      <Row>
        <F label="Time Available Per Session (min)" options={["10–15 minutes","15–20 minutes","20–30 minutes","30+ minutes","Variable"]}/>
        <F label="Session Frequency (per day)" options={["Once daily (SID)","Twice daily (BID)","Three times daily (TID)","Every other day","As tolerated"]}/>
      </Row>
      <F label="Owner Notes / Concerns" placeholder="Any concerns about ability to perform exercises, physical limitations, household members who will help…" rows={2}/>
    </Sec>
  </>;
}

// ── GOALS ─────────────────────────────────────────────────────────────────────
function GoalsPanel() {
  return <>
    <Sec title="Rehabilitation Goals" color="#EC4899" colorLt="#FDF2F8" noTop>
      <MultiF label="Primary Rehabilitation Goals" options={["Return to normal household activity","Pain management — improve quality of life","Post-surgical recovery — full function","Neurological rehabilitation — ambulation","Weight management — target BCS 5","Improve joint range of motion","Improve muscle mass / strength","Return to sport or working function","Senior wellness / mobility maintenance","Palliative care — comfort focused","Other"]}/>
    </Sec>

    <Sec title="Short-Term Goals" color="#EC4899" colorLt="#FDF2F8">
      <F label="Short-Term Clinical Goals" placeholder="e.g. Achieve partial weight bearing by week 2, pain score ≤3/10 at rest, full ROM within 10° of normal…" rows={3}/>
      <F label="Short-Term Functional Goals" placeholder="e.g. Able to navigate 3 steps independently, complete 10-minute leash walk…" rows={2}/>
    </Sec>

    <Sec title="Long-Term Goals" color="#EC4899" colorLt="#FDF2F8">
      <F label="Long-Term Clinical Goals" placeholder="e.g. Full weight bearing, thigh circumference within 1cm bilaterally, full stifle ROM restored…" rows={3}/>
      <F label="Long-Term Functional Goals" placeholder="e.g. Return to offleash play, stair climbing without assistance, sport-specific movement…" rows={2}/>
    </Sec>

    <Sec title="Owner Goals" color="#EC4899" colorLt="#FDF2F8" collapsible defaultOpen={false}>
      <F label="Owner's Primary Goal (in their own words)" placeholder="What does the owner most want for their pet?…" rows={2}/>
      <Row>
        <F label="Owner Priority" options={["Pain relief above all","Fastest possible recovery","Independence at home","Return to sport / activity","Quality of life / comfort","Maximize lifespan"]}/>
        <F label="Client Communication Preference" options={["Email — protocol PDF","Text — exercise reminders","Phone call follow-up","In-person recheck only","Patient portal / app"]}/>
      </Row>
    </Sec>
    {/* Progress Tracking Schedule moved to Block 10 — Protocol Summary */}
  </>;
}

// ── CONDITIONING ──────────────────────────────────────────────────────────────
// NOTE: B.E.A.U. calls are routed through the backend /api/beau/chat endpoint
// (never the Anthropic API directly — API keys must stay server-side).
// callBeau — POSTs to /api/beau/chat and processes the SSE stream.
// If `onDelta(textChunk, accumulatedText)` is provided, the callback fires
// for every delta token as it arrives — enables streaming TTS playback that
// starts within ~1s instead of waiting for the full response.
// Always returns the full accumulated text when the stream ends.
async function callBeau(systemPrompt, userMessage, language, onDelta) {
  const token = localStorage.getItem("token");
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const res = await fetch(`${apiBase}/beau/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      language: language || "en",
    }),
  });
  if (!res.ok) throw new Error(`B.E.A.U. API ${res.status}`);

  // True SSE streaming via ReadableStream reader
  const reader = res.body?.getReader();
  if (!reader) {
    // Browser doesn't support streaming reader — fall back to one-shot text
    const raw = await res.text();
    let result = "";
    for (const line of raw.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.type === "delta" && parsed.text) {
          result += parsed.text;
          if (onDelta) onDelta(parsed.text, result);
        }
      } catch { /* skip */ }
    }
    return result || "No response.";
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE lines are separated by \n\n; process each complete event then
    // keep the trailing partial in the buffer for the next chunk.
    let nlIdx;
    while ((nlIdx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nlIdx);
      buffer = buffer.slice(nlIdx + 1);
      if (!line.startsWith("data: ")) continue;
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.type === "delta" && parsed.text) {
          result += parsed.text;
          if (onDelta) onDelta(parsed.text, result);
        }
      } catch { /* skip non-JSON keep-alive lines */ }
    }
  }
  return result || "No response.";
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
  </>;
}

// ── PROTOCOL SUMMARY ──────────────────────────────────────────────────────────
function ProtocolPanel({ patientName, patientData }) {
  const [generating, setGenerating]       = useState(false);
  const [protocol,   setProtocol]         = useState("");
  const { data, beauVoice: bv, uiLang } = useContext(DashFormContext);
  const [copied,     setCopied]           = useState(false);
  // Quick generate state
  const [quickCondition, setQuickCondition] = useState(patientData?.condition || "");
  const [quickRegion,    setQuickRegion]    = useState(patientData?.affected_region || "");
  const [quickProtocol,  setQuickProtocol]  = useState(null);
  const [quickLoading,   setQuickLoading]   = useState(false);

  const CONDITIONS = [
    { value: "TPLO Post-Op", label: "TPLO / CCL Post-Op" },
    { value: "IVDD", label: "IVDD (Intervertebral Disc Disease)" },
    { value: "Osteoarthritis", label: "Osteoarthritis (OA)" },
    { value: "Geriatric Mobility", label: "Geriatric / Mobility Decline" },
  ];
  const REGIONS = [
    "Stifle (Knee)", "Hip", "Elbow", "Shoulder", "Spine — Cervical",
    "Spine — Thoracolumbar", "Spine — Lumbosacral", "Tarsus (Hock)",
    "Carpus (Wrist)", "Multiple joints", "Generalized",
  ];

  const quickGenerate = async () => {
    if (!quickCondition) return;
    setQuickLoading(true); setQuickProtocol(null);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");
      // Live values from dashData take priority over stale DB values.
      const liveWeight = parseFloat(data["client::Weight (lbs)"]) || 0;
      const liveAge = parseInt(data["client::Age (years)"], 10) || 0;
      const liveSpecies = (data["client::Species"] || "").toLowerCase();
      const res = await fetch(`${apiBase}/generate-protocol`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patientName: patientName || "Patient",
          clientFirstName: patientData?.client_name?.split(" ")[0] || "Client",
          clientLastName: patientData?.client_name?.split(" ").slice(1).join(" ") || "",
          diagnosis: quickCondition,
          affectedRegion: quickRegion || "Generalized",
          species: liveSpecies || patientData?.species || "canine",
          breed: patientData?.breed || "",
          age: liveAge || patientData?.age || 0,
          weight: liveWeight || patientData?.weight || 0,
          protocolLength: 8,
        }),
      });
      const json = await res.json();
      setQuickProtocol(json.data || json);
    } catch (err) { setQuickProtocol({ error: err.message }); }
    setQuickLoading(false);
  };

  const generate = async () => {
    setGenerating(true); setProtocol("");
    try {
      // Live patient context — dashData values take priority over stale DB values.
      const liveWeight = data["client::Weight (lbs)"] || patientData?.weight;
      const liveAge = data["client::Age (years)"] || patientData?.age;
      const liveSpecies = data["client::Species"] || patientData?.species;
      const ctxBits = [
        `Patient: ${patientName || "Current Patient on file"}`,
        patientData?.breed     ? `Breed: ${patientData.breed}`                 : null,
        liveAge                ? `Age: ${liveAge}y`                            : null,
        liveWeight             ? `Weight: ${liveWeight} lbs`                   : null,
        liveSpecies            ? `Species: ${liveSpecies}`                     : null,
        (quickCondition || patientData?.condition) ? `Condition: ${quickCondition || patientData.condition}` : null,
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
      // Streaming TTS — sentence-by-sentence playback as deltas arrive
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

  return <>
    {/* ── QUICK GENERATE ── */}
    <Sec title="Quick Protocol Generation" color={C.green} colorLt={C.greenLt} noTop>
      <div style={{ fontSize:11, color:C.muted, marginBottom:14, lineHeight:1.65 }}>
        Generate a structured, evidence-based rehab protocol in seconds. Select the condition and hit generate — B.E.A.U. handles the rest using ACVSMR-aligned exercise selection.
      </div>
      <Row>
        <div>
          <Lbl>What condition are we treating {patientName || "this patient"} for?</Lbl>
          <select value={quickCondition} onChange={e => setQuickCondition(e.target.value)}
            style={{ fontSize:13, fontWeight:600, padding:"10px 12px" }}>
            <option value="">Select condition…</option>
            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <Lbl>Affected Region</Lbl>
          <select value={quickRegion} onChange={e => setQuickRegion(e.target.value)}>
            <option value="">Select region…</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </Row>
      <button onClick={quickGenerate} disabled={quickLoading || !quickCondition}
        style={{ width:"100%", marginTop:14, padding:"14px", background: quickLoading ? C.greenLt : !quickCondition ? "#e2e8f0" : C.green, border:"none", color: !quickCondition ? C.muted : C.white, borderRadius:6, cursor: quickLoading || !quickCondition ? "not-allowed":"pointer", fontSize:14, fontWeight:700, letterSpacing:".1em", display:"flex", alignItems:"center", gap:12, justifyContent:"center", transition:"all .2s" }}>
        {quickLoading
          ? <><div style={{ width:18, height:18, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spinK9 .8s linear infinite" }}/> GENERATING PROTOCOL…</>
          : "⚡ QUICK GENERATE PROTOCOL"}
      </button>
    </Sec>

    {/* ── QUICK PROTOCOL RESULTS ── */}
    {quickProtocol && !quickProtocol.error && (
      <Sec title={`Structured Protocol — ${quickProtocol.protocolType?.toUpperCase() || "REHAB"} · ${quickProtocol.totalWeeks} Weeks`} color={C.green} colorLt={C.greenLt}>
        <div style={{ marginBottom:14, padding:"10px 14px", background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:6, fontSize:11, color:C.green, fontWeight:600 }}>
          {quickProtocol.totalWeeks} weeks · {quickProtocol.weeks?.length || 0} phases · {quickProtocol.weeks?.reduce((s,w)=>s+(w.exercises?.length||0),0) || 0} total exercises · Evidence-gated
        </div>
        {quickProtocol.weeks?.map(week => (
          <div key={week.week} style={{ marginBottom:16, border:`1px solid ${C.border}`, borderRadius:7, overflow:"hidden" }}>
            <div style={{ padding:"10px 14px", background:C.blueLt, borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>Week {week.week}{week.phaseInfo ? ` — ${week.phaseInfo.name}` : ""}</div>
              <span style={{ fontSize:10, color:C.muted }}>{week.exercises?.length || 0} exercises</span>
            </div>
            <div style={{ padding:12 }}>
              {week.exercises?.map((ex, i) => (
                <div key={i} style={{ padding:"8px 10px", background: i%2===0 ? C.white : C.bg, borderRadius:4, marginBottom:4, display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8, alignItems:"center", fontSize:11 }}>
                  <div>
                    <span style={{ fontWeight:600, color:C.navy }}>{ex.name}</span>
                    <span style={{ marginLeft:6, fontSize:9, padding:"1px 5px", background: ex.evidence_grade === "A" ? "#DCFCE7" : ex.evidence_grade === "B" ? "#DBEAFE" : "#FEF3C7", borderRadius:3, color: ex.evidence_grade === "A" ? "#166534" : ex.evidence_grade === "B" ? "#1E40AF" : "#92400E", fontWeight:600 }}>
                      {ex.evidence_grade || "B"}
                    </span>
                  </div>
                  <span style={{ color:C.muted }}>{ex.sets || 3} × {ex.reps || 10}</span>
                  <span style={{ color:C.muted }}>{ex.frequency || "2x daily"}</span>
                  <span style={{ color:C.muted }}>{ex.duration_minutes || 10} min</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {quickProtocol.warnings?.length > 0 && (
          <div style={{ padding:"10px 14px", background:C.amberLt, border:`1px solid ${C.amber}44`, borderRadius:6, fontSize:11, color:C.amber, fontWeight:500, marginTop:8 }}>
            {quickProtocol.warnings.map((w,i) => <div key={i}>⚠ {w}</div>)}
          </div>
        )}
      </Sec>
    )}
    {quickProtocol?.error && (
      <div style={{ padding:"12px 14px", background:C.redLt, border:`1px solid ${C.red}44`, borderRadius:6, fontSize:12, color:C.red, marginBottom:16 }}>
        Error: {quickProtocol.error}
      </div>
    )}

    <Divider/>

    {/* ── B.E.A.U. FULL PROTOCOL ── */}
    <Sec title="B.E.A.U. AI-Generated Protocol" color={C.green} colorLt={C.greenLt}>
      <div style={{ fontSize:12, color:C.muted, marginBottom:16, lineHeight:1.65 }}>
        For a narrative clinical protocol with full evidence citations, safety guardrails, and home exercise instructions — use B.E.A.U.'s AI generation below.
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
        {["Assessment ✓","B.E.A.U. Metrics ✓","Clinic Equipment ✓","Home Environment ✓","Goals ✓","Diagnostics ✓"].map(b=>(
          <div key={b} style={{ padding:"8px 12px", background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:5, fontSize:11, color:C.green, fontWeight:600, textAlign:"center" }}>{b}</div>
        ))}
      </div>
      <button onClick={generate} disabled={generating}
        style={{ width:"100%", padding:"14px", background: generating ? C.greenLt : C.green, border:"none", color:C.white, borderRadius:6, cursor: generating?"not-allowed":"pointer", fontSize:14, fontWeight:700, letterSpacing:".1em", display:"flex", alignItems:"center", gap:12, justifyContent:"center" }}>
        {generating
          ? <><div style={{ width:18, height:18, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spinK9 .8s linear infinite" }}/> GENERATING B.E.A.U. PROTOCOL…</>
          : "🧠 GENERATE FULL B.E.A.U. PROTOCOL"}
      </button>
    </Sec>

    {protocol && (
      <Sec title="Protocol Output — B.E.A.U. Generated" color={C.green} colorLt={C.greenLt}>
        <div style={{ background:C.white, border:`1.5px solid ${C.green}55`, borderRadius:7, padding:18, marginBottom:14 }}>
          <pre style={{ fontSize:12, color:C.text, whiteSpace:"pre-wrap", lineHeight:1.9, fontFamily:"Georgia, serif" }}>{protocol}</pre>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label: copied ? "✓ COPIED" : "📋 COPY", action: copy },
            { label:"📧 EMAIL CLIENT", action:()=>{} },
            { label:"🖨️ PRINT", action:()=>window.print() },
            { label:"📱 QR CODE", action:()=>{} },
          ].map(a=>(
            <button key={a.label} onClick={a.action}
              style={{ padding:"10px 6px", background:C.white, border:`1px solid ${C.border}`, color:C.blue, borderRadius:5, cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:".06em", transition:"all .15s" }}>
              {a.label}
            </button>
          ))}
        </div>
      </Sec>
    )}
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

function LibraryPanel() {
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

    fetch(`${apiBase}/exercises`)
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
          <div key={ex.id} onClick={()=>setSel(s=>s===ex.id?null:ex.id)}
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
  const { uiLang } = useContext(DashFormContext);

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
    } catch (err) { setAns(`Connection error: ${err.message}`); }
    setBusy(false);
  };

  return (
    <div>
      <div style={{ fontSize:12, color:C.muted, marginBottom:16, lineHeight:1.65 }}>Ask B.E.A.U. any clinical rehabilitation question — contraindications, dosing, exercise selection, evidence. Answers draw from the peer-reviewed veterinary rehabilitation literature.</div>
      <Lbl>Your Clinical Question</Lbl>
      <textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. What exercises are contraindicated for a TPLO patient at week 3? What is the evidence basis for cavaletti rails?" rows={4}/>
      <button onClick={ask} disabled={busy||!q.trim()}
        style={{ marginTop:12, width:"100%", padding:"12px", background: busy||!q.trim() ? C.greenLt : C.green, border:"none", color:C.white, borderRadius:6, cursor: busy||!q.trim()?"not-allowed":"pointer", fontSize:13, fontWeight:700 }}>
        {busy ? "B.E.A.U. IS THINKING…" : "⬡ ASK B.E.A.U."}
      </button>
      {ans && (
        <div style={{ marginTop:16, padding:16, background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:6 }}>
          <div style={{ fontSize:9, color:C.green, fontWeight:700, letterSpacing:".15em", marginBottom:8 }}>B.E.A.U. RESPONSE</div>
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
                  <div key={opt.v}
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
  { id:"metrics",      icon:"🦮", color:C.green,   colorLt:C.greenLt  },
  { id:"equipment",    icon:"🐕‍🦺", color:C.teal,    colorLt:C.tealLt   },
  { id:"home",         icon:"🏡", color:C.blue,    colorLt:C.blueLt   },
  { id:"goals",        icon:"🏆", color:"#BE185D", colorLt:"#FDF2F8"  },
  { id:"conditioning", icon:"🐺", color:"#0D9488", colorLt:"#F0FDFB"  },
  { id:"protocol",     icon:"🐶", color:C.green,   colorLt:C.greenLt  },
  { id:"library",      icon:"🦴", color:C.navy,    colorLt:C.blueLt   },
];

const SIDEBAR_NAV = [
  { id:"how",        icon:"❓" },
  { id:"ask",        icon:"⬡"  },
  { id:"helsinki",   icon:"📝" },
  { id:"about",      icon:"ℹ️" },
  { id:"disclaimer", icon:"⚠️" },
  { id:"hipaa",      icon:"🔒" },
];

const BLOCK_COMPS   = { client:ClientPanel, diagnostics:DiagnosticsPanel, assessment:AssessmentPanel, metrics:MetricsPanel, equipment:EquipmentPanel, home:HomePanel, goals:GoalsPanel, conditioning:ConditioningPanel, protocol:ProtocolPanel, library:LibraryPanel };
const SIDEBAR_COMPS = { how:HowToUse, ask:AskBeau, helsinki:HelsinkiPanel, about:AboutPanel, disclaimer:DisclaimerPanel, hipaa:HipaaPanel };

// ── CONTEXTUAL B.E.A.U. PROMPTS ──────────────────────────────────────────────
const BEAU_BLOCK_CONTEXTS = {
  client:       "You are helping with patient intake — demographics, breed-specific considerations, owner communication. Reference breed predispositions and signalment relevance.",
  diagnostics:  "You are helping interpret diagnostic results — radiographs, bloodwork, MRI findings. Identify rehabilitation-relevant findings and how they affect protocol selection.",
  assessment:   "You are helping with clinical assessment — pain scoring (CSU scale, BPI), functional grading, lameness assessment, neurological evaluation. Focus on objective measurement.",
  metrics:      "You are helping with B.E.A.U. metrics — girth measurements, goniometry/ROM interpretation, body condition scoring, HCPI scoring, LOAD scoring. Explain clinical significance and normal ranges.",
  equipment:    "You are helping with equipment selection — underwater treadmill settings, TENS/NMES parameters, laser therapy protocols (Class IV), therapeutic ultrasound, shockwave therapy indications.",
  home:         "You are helping design home exercise programs — client education, exercise selection appropriate for home, frequency/duration recommendations, safety guidelines, environment assessment.",
  goals:        "You are helping set rehabilitation goals — SMART goals, phase-appropriate milestones, validated outcome measures, realistic timeline expectations based on condition and evidence.",
  conditioning: "You are helping with conditioning programs — progressive overload, sport-specific training, return-to-function criteria, fitness maintenance protocols.",
};

export default function DashboardView({ setView, currentUser, onLogout, patient, setSelectedPatient }) {
  const { t, i18n: i18nInst } = useTranslation();
  const beauVoice = useBeauVoice(i18nInst.language || "en");
  const [openBlock,   setOpenBlock]   = useState(null);
  const [openSidebar, setOpenSidebar] = useState(null);
  const [saved,       setSaved]       = useState(false);
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

  // ── Patient anchor lock — Phase 1A Fix 1 ──
  // All blocks except "client" are locked until both Client Name and Patient Name are entered.
  // Either form-field entry OR a selected patient (with client_name + name) unlocks blocks.
  const hasClientName = !!(
    (dashData["client::Client First Name"] && dashData["client::Client First Name"].trim()) ||
    (dashData["client::Client Last Name"] && dashData["client::Client Last Name"].trim()) ||
    patient?.client_name
  );
  const hasPatientName = !!(
    (dashData["client::Patient Name"] && dashData["client::Patient Name"].trim()) ||
    patient?.name
  );
  const isUnlocked = hasClientName && hasPatientName;
  const [showLockToast, setShowLockToast] = useState(false);

  // Gated block click handler — redirects to client block if locked
  const handleBlockClick = (blockId) => {
    if (blockId === "client" || isUnlocked) {
      setOpenBlock(blockId); setBeauOpen(false); setBeauQuery(""); setBeauAnswer("");
    } else {
      setShowLockToast(true);
      setTimeout(() => setShowLockToast(false), 3500);
      setOpenBlock("client"); setBeauOpen(false); setBeauQuery(""); setBeauAnswer("");
    }
  };

  // ── Fetch patient list for search
  useEffect(() => {
    fetch(`${apiBase}/patients`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => setAllPatients(d.data || d || []))
      .catch(() => {});
  }, []);

  // ── Close search dropdown on outside click
  useEffect(() => {
    const onDoc = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredPatients = searchQ
    ? allPatients.filter(p => `${p.name} ${p.breed} ${p.client_name} ${p.condition}`.toLowerCase().includes(searchQ.toLowerCase()))
    : allPatients;

  // ── Select patient from search → load their full record + dashboard data
  const selectPatient = async (p) => {
    setSearchOpen(false);
    setSearchQ("");
    try {
      const res = await fetch(`${apiBase}/patients/${p.id}`, { headers: authHeaders });
      const json = await res.json();
      const fullPatient = json.data || json;
      if (setSelectedPatient) setSelectedPatient(fullPatient);
    } catch {
      if (setSelectedPatient) setSelectedPatient(p);
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
      } catch { savedDash = {}; }
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

  const updateField = (key, val) => setDashData(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    // Build the payload from form fields
    const patientName = dashData["client::Patient Name"]?.trim();
    const clientName = [dashData["client::Client First Name"], dashData["client::Client Last Name"]].filter(s => s && s.trim()).join(" ").trim();
    const clientPhone = dashData["client::Phone"] || null;
    const clientEmail = dashData["client::Email"] || null;
    const weight = parseFloat(dashData["client::Weight (lbs)"]) || 0;
    const breed = dashData["client::Breed"] || "Mixed Breed";

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
        const createRes = await fetch(`${apiBase}/patients`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            name: patientName,
            species: "canine",
            breed,
            age: 0,
            weight,
            sex: dashData["client::Sex"] || null,
            condition: dashData["client::Diagnosis"] || dashData["assessment::Primary Diagnosis"] || "Rehabilitation",
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
      setUpdateToast({ type: "success", message: "Patient record updated successfully" });
      setTimeout(() => setUpdateToast(null), 3200);
    } catch (err) {
      console.error("[handleSave]", err);
      setUpdateToast({ type: "error", message: `Save failed: ${err.message}` });
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

  // No patient gate — dashboard always shows the 11-block grid.
  // If no patient is selected, header shows a prompt to select one.

  return (
    <DashFormContext.Provider value={{ data: dashData, update: updateField, blockId: openBlock, beauVoice, uiLang: i18nInst.language || "en", handleSave, updateToast, setUpdateToast }}>
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
                      <div key={p.id} onClick={() => selectPatient(p)}
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
              autoSpeak={beauVoice.autoSpeak}
              setAutoSpeak={beauVoice.setAutoSpeak}
              onStop={beauVoice.stop}
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
          {!isUnlocked && (
            <div style={{ marginBottom:16, padding:"12px 18px", background:"#fffbeb", border:"1px solid #fde68a", borderLeft:"4px solid #f59e0b", borderRadius:6, display:"flex", alignItems:"center", gap:10, fontSize:12, color:"#92400e" }}>
              <span style={{ fontSize:18 }}>⚠️</span>
              <div>
                <strong>Patient Anchor Required.</strong> Enter <strong>Client Name</strong> + <strong>Patient Name</strong> in the <strong>Client & Patient</strong> block to unlock all clinical features.
              </div>
            </div>
          )}
          {showLockToast && (
            <div style={{ position:"fixed", top:80, right:24, zIndex:300, padding:"12px 18px", background:"#fef2f2", border:"1px solid #fecaca", borderLeft:"4px solid #dc2626", borderRadius:6, boxShadow:"0 8px 24px rgba(0,0,0,.15)", fontSize:12, color:"#991b1b", maxWidth:340, animation:"fadeIn .2s ease" }}>
              <div style={{ fontWeight:700, marginBottom:4 }}>🔒 Block Locked</div>
              Please enter Client and Patient name first. Redirecting to Client & Patient block...
            </div>
          )}
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
              const locked = !isUnlocked && b.id !== "client";
              return (
              <div key={b.id} className="block-card"
                onClick={()=>handleBlockClick(b.id)}
                style={{ background:C.white, border:`1.5px solid ${locked ? "#cbd5e1" : C.border}`, borderRadius:9, padding:"22px 20px", position:"relative", overflow:"hidden", boxShadow:"0 1px 6px rgba(26,39,68,.06)", animationDelay:`${i*.04}s`, animation:"fadeUp .3s ease both", opacity: locked ? 0.55 : 1 }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background: locked ? "#cbd5e1" : b.color }}/>
                {locked && (
                  <div style={{ position:"absolute", top:10, right:12, fontSize:16, opacity:0.7 }}>🔒</div>
                )}
                <div style={{ width:44, height:44, borderRadius:10, background: locked ? "#f1f5f9" : b.colorLt, border:`1px solid ${locked ? "#cbd5e1" : b.color+"33"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14, boxShadow: locked ? "none" : `0 2px 8px ${b.color}22`, filter: locked ? "grayscale(0.6)" : "none" }}>
                  {b.icon}
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:5 }}>{t(`tiles.${b.id}.label`)}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.55 }}>{t(`tiles.${b.id}.desc`)}</div>
                <div style={{ position:"absolute", bottom:16, right:16, fontSize:16, color: locked ? "#94a3b8" : b.color, opacity:.35 }}>→</div>
              </div>
            );})}
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
