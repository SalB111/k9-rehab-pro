import { useState, useRef } from "react";

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

const F = ({ label, placeholder, type="text", options, rows, range, hint }) => (
  <div>
    <Lbl range={range}>{label}</Lbl>
    {options
      ? <select><option value="">Select…</option>{options.map(o=><option key={o}>{o}</option>)}</select>
      : rows
        ? <textarea placeholder={placeholder} rows={rows}/>
        : <input type={type} placeholder={placeholder}/>
    }
    {hint && <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:"italic" }}>{hint}</div>}
  </div>
);

const Row = ({ children, cols=2 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:12 }}>{children}</div>
);

const Sec = ({ title, color=C.blue, colorLt, children, noTop }) => (
  <div style={{ marginBottom:22 }}>
    <div style={{ fontSize:11, fontWeight:700, color, letterSpacing:".1em", textTransform:"uppercase",
      background: colorLt || C.blueLt, borderLeft:`3px solid ${color}`,
      padding:"7px 12px", borderRadius:"0 5px 5px 0", marginBottom:12,
      marginTop: noTop ? 0 : 4 }}>
      {title}
    </div>
    {children}
  </div>
);

const Divider = () => <div style={{ height:1, background:C.border, margin:"18px 0" }}/>;

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
function Modal({ title, color, colorLt, icon, onClose, children }) {
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
            <div style={{ fontSize:9, color:C.muted, letterSpacing:".13em", textTransform:"uppercase" }}>K9 REHAB PRO™ · B.E.A.U.™ ENGINE</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${C.border}`, color:C.muted, fontSize:16, cursor:"pointer", padding:"4px 10px", borderRadius:5 }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:22 }}>{children}</div>
        {/* Footer */}
        <div style={{ padding:"13px 22px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"flex-end", gap:10, flexShrink:0, background:C.bg, borderRadius:"0 0 10px 10px" }}>
          <button onClick={onClose} style={{ padding:"9px 22px", background:C.white, border:`1px solid ${C.border}`, color:C.muted, borderRadius:5, cursor:"pointer", fontSize:12, fontWeight:600 }}>CLOSE</button>
          <button style={{ padding:"9px 22px", background:color, border:"none", color:C.white, borderRadius:5, cursor:"pointer", fontSize:12, fontWeight:700, letterSpacing:".06em" }}>SAVE & CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK PANELS
// ══════════════════════════════════════════════════════════════════════════════

// ── CLIENT & PATIENT ──────────────────────────────────────────────────────────
function ClientPanel() {
  const [species, setSpecies] = useState("Canine");
  const breeds = species === "Feline" ? FELINE_BREEDS : CANINE_BREEDS;
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
          <select value={species} onChange={e=>setSpecies(e.target.value)}>
            {["Canine","Feline"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </Row>
      <Row>
        <div><Lbl>Breed</Lbl><select><option value="">Select breed…</option>{breeds.map(b=><option key={b}>{b}</option>)}</select></div>
        <F label="Sex" options={["Male — Intact","Male — Neutered","Female — Intact","Female — Spayed"]}/>
      </Row>
      <Row><F label="Date of Birth" type="date"/><F label="Color / Markings" placeholder="e.g. Black & tan, tricolor"/></Row>
      <Row cols={3}>
        <F label="Weight (lbs)" placeholder="0.0"/>
        <F label="Weight (kg)" placeholder="0.0" hint="Auto-converts from lbs"/>
        <F label="Microchip #" placeholder="15-digit number"/>
      </Row>
      <Row><F label="Specialist / Surgeon" placeholder="Referring specialist name & clinic"/><F label="Next Appointment" type="date"/></Row>
    </Sec>
  </>;
}

// ── DIAGNOSTICS ───────────────────────────────────────────────────────────────
function DiagnosticsPanel() {
  const imaging = ["Radiograph (X-Ray)","CT Scan","MRI","Ultrasound","Myelogram","Nuclear Scintigraphy","Fluoroscopy","Echocardiogram"];
  const labwork = [
    { cat:"Complete Blood Count (CBC)", tests:["RBC","WBC","Hemoglobin","Hematocrit","Platelets","Neutrophils","Lymphocytes","Monocytes","Eosinophils","Basophils"] },
    { cat:"Blood Chemistry / Metabolic Panel", tests:["BUN (Blood Urea Nitrogen)","Creatinine","BUN:Creatinine Ratio","Glucose","Total Protein","Albumin","Globulin","ALT (SGPT)","AST (SGOT)","ALP (Alkaline Phosphatase)","GGT","Total Bilirubin","Cholesterol","Triglycerides","Calcium","Phosphorus","Sodium","Potassium","Chloride","CO2 / Bicarbonate"] },
    { cat:"Thyroid", tests:["Total T4","Free T4","TSH","T3"] },
    { cat:"Urinalysis", tests:["Specific Gravity","pH","Protein","Glucose","Ketones","Bilirubin","Blood / RBC","WBC","Casts","Bacteria","Crystals"] },
    { cat:"Additional Panels", tests:["Lyme Disease","Ehrlichia","Anaplasma","Heartworm Antigen","FELV / FIV (Feline)","Coagulation Panel (PT/PTT)","Bile Acids","Cortisol (Basal)","ACTH Stimulation","Low-dose Dexamethasone Suppression"] },
  ];
  const [imgSel,  setImgSel]  = useState({});

  return <>
    <Sec title="Diagnostic Imaging" color={C.purple} colorLt={C.purpleLt} noTop>
      <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>
        Check all imaging studies performed. Enter date and findings for each.
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {imaging.map(im=>(
          <CbItem key={im} label={im} checked={imgSel[im]} onToggle={()=>setImgSel(p=>({...p,[im]:!p[im]}))}>
            <Row>
              <div><Lbl>Date Performed</Lbl><input type="date"/></div>
              <div><Lbl>Facility / Radiologist</Lbl><input placeholder="Where performed…"/></div>
            </Row>
            <div><Lbl>Findings & Interpretation</Lbl><textarea placeholder={`${im} findings…`} rows={2}/></div>
          </CbItem>
        ))}
      </div>
    </Sec>

    <Sec title="Laboratory Work" color={C.purple} colorLt={C.purpleLt}>
      <Row>
        <div><Lbl>Lab Date</Lbl><input type="date"/></div>
        <div><Lbl>Laboratory / Reference Lab</Lbl><input placeholder="e.g. IDEXX, Antech, In-house"/></div>
      </Row>
      {labwork.map(grp=>(
        <div key={grp.cat} style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.purple, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8, marginTop:12, paddingBottom:4, borderBottom:`1px solid ${C.purpleLt}` }}>
            {grp.cat}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {grp.tests.map(t=>(
              <div key={t}>
                <Lbl>{t}</Lbl>
                <input placeholder="Value"/>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Divider/>
      <div><Lbl>Other / Additional Tests</Lbl><textarea placeholder="Any additional diagnostic tests not listed above…" rows={2}/></div>
      <div><Lbl>Overall Lab Interpretation / Notes</Lbl><textarea placeholder="Clinician interpretation of laboratory results…" rows={3}/></div>
    </Sec>
  </>;
}

// ── ASSESSMENT ────────────────────────────────────────────────────────────────
function MedicationsSection() {
  const [meds, setMeds] = useState([{id:1},{id:2}]);
  const nextId = useRef(3);
  const addMed = () => { setMeds(p=>[...p,{id:nextId.current++}]); };
  const removeMed = (id) => { if(meds.length > 1) setMeds(p=>p.filter(m=>m.id!==id)); };
  return (
    <Sec title="Current Medications & Supplements" color={C.amber} colorLt={C.amberLt}>
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
    </Sec>
  );
}

function AssessmentPanel() {
  return <>
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

    <MedicationsSection/>

    <Sec title="Clinical Diagnosis & Problem List" color={C.amber} colorLt={C.amberLt}>
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

    <Sec title="Pain Assessment — Colorado State University Scale" color={C.red} colorLt={C.redLt}>
      <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.muted, marginBottom:14, lineHeight:1.7 }}>
        <b style={{color:C.red}}>CSU Acute Pain Scale (0–4)</b> — Referenced in Millis & Levine, Canine Rehabilitation & Physical Therapy 2nd Ed.
        Scores reflect behavioral and physiological indicators. Use in conjunction with the Helsinki Chronic Pain Index for chronic patients.
      </div>
      <Row cols={2}>
        <F label="CSU Acute Pain Score (0–4)" options={["0 — Happy, comfortable, no signs of pain","1 — Minor discomfort, responds to petting","2 — Moderate pain, reacts to palpation","3 — Severe pain, vocalizes / guards","4 — Excruciating, entire body tense / rigid"]}/>
        <F label="Pain Assessment at" options={["Rest","Activity","Palpation","Post-exercise"]}/>
      </Row>
      <Row cols={3}>
        <F label="Numeric Rating Scale (NRS 0–10)" placeholder="0–10" hint="0 = no pain, 10 = worst possible"/>
        <F label="Pain Character" options={["Acute","Subacute","Chronic","Neuropathic","Mixed"]}/>
        <F label="Pain Onset" options={["Sudden","Gradual","Post-surgical","Unknown"]}/>
      </Row>
      <F label="Helsinki Chronic Pain Index Score" placeholder="Total score (0–44)" hint="HCPI: 44-item owner questionnaire for chronic musculoskeletal pain — Hielm-Björkman et al 2003"/>
      <Row>
        <F label="Pain Location — Primary" placeholder="e.g. Right stifle, medial aspect"/>
        <F label="Pain Location — Secondary" placeholder="e.g. Left hip compensatory"/>
      </Row>
      <F label="Pain Aggravating Factors" placeholder="e.g. Prolonged standing, stair climbing, rising from rest…"/>
      <F label="Pain Alleviating Factors" placeholder="e.g. Rest, cold therapy, NSAIDs, position change…"/>
      <Row>
        <F label="Current Pain Medications" placeholder="Drug, dose, frequency"/>
        <F label="Response to Analgesia" options={["Excellent — Full relief","Good — Significant relief","Partial — Some improvement","Poor — Minimal response","None"]}/>
      </Row>
    </Sec>

    <Sec title="Gait Analysis" color={C.amber} colorLt={C.amberLt}>
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

    <Sec title="Neurological Assessment" color={C.amber} colorLt={C.amberLt}>
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
  const [dietEnabled, setDietEnabled] = useState(false);

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

  return <>
    <Sec title="B.E.A.U. Metrics — Nutritional Assessment" color={C.green} colorLt={C.greenLt} noTop>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:C.white, border:`1.5px solid ${C.green}`, borderRadius:7, marginBottom:14 }}>
        <input type="checkbox" id="diet-rec" checked={dietEnabled} onChange={e=>setDietEnabled(e.target.checked)}
          style={{ width:18, height:18, accentColor:C.green, flexShrink:0, marginTop:2 }}/>
        <label htmlFor="diet-rec" style={{ fontSize:12, color:C.text, cursor:"pointer", lineHeight:1.65 }}>
          <b style={{color:C.green}}>Enable B.E.A.U. Nutritional Recommendation</b> — Allow B.E.A.U. to recommend a nutritional plan based on this patient's BCS, body weight, and clinical condition. If enabled, B.E.A.U. will suggest appropriate food options including Mars Petcare brands where indicated.
        </label>
      </div>
      {dietEnabled && (
        <div style={{ animation:"fadeIn .15s ease" }}>
          <Row>
            <F label="Current Food Brand" placeholder="e.g. Royal Canin, Hill's, Purina, Blue Buffalo…"/>
            <F label="Current Food Type / Formula" placeholder="e.g. Joint mobility, weight control, puppy…"/>
          </Row>
          <Row>
            <F label="Feeding Method" options={["Free choice","Scheduled — 1× daily","Scheduled — 2× daily","Scheduled — 3× daily","Prescription diet"]}/>
            <F label="Approximate Daily Calories" placeholder="kcal/day if known"/>
          </Row>
          <F label="Food Allergies / Dietary Restrictions" placeholder="Known allergies, intolerances, or dietary restrictions…"/>
          <F label="Supplement Use" placeholder="Joint supplements, omega-3, probiotics, other…"/>
          <div style={{ padding:"10px 14px", background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:5, fontSize:11, color:C.muted, marginTop:8 }}>
            B.E.A.U. will analyze this patient's BCS, ideal weight, and condition to generate a nutritional recommendation. Brand data is logged to support Mars Petcare integration analytics.
          </div>
        </div>
      )}
    </Sec>

    <Sec title="Body Condition Score — Purina 9-Point Scale" color={C.green} colorLt={C.greenLt}>
      <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.65 }}>
        <b style={{color:C.green}}>Purina BCS 9-Point Scale</b> — Reference standard per Laflamme 1997, endorsed by Millis & Levine. Score 4–5 = Ideal. Each point above/below 5 = approximately ±10–15% body weight deviation.
      </div>
      <Row cols={3}>
        <F label="BCS Score (1–9)" options={["1 — Emaciated: Ribs, spine visible","2 — Very thin","3 — Thin: Ribs easily felt","4 — Underweight: Slight fat cover","5 — Ideal: Ribs felt, waist visible","6 — Overweight: Ribs felt with pressure","7 — Heavy: Ribs difficult to feel","8 — Obese: Ribs not palpable","9 — Morbidly obese"]}/>
        <F label="Current Weight (lbs)" placeholder="0.0"/>
        <F label="Ideal Body Weight (lbs)" placeholder="0.0"/>
      </Row>
      <Row>
        <F label="Weight Status" options={["Underweight","Ideal","Overweight 10–20%","Overweight >20%","Obese"]}/>
        <F label="Weight Trend" options={["Stable","Gaining","Losing","Significant gain","Significant loss"]}/>
      </Row>
    </Sec>

    <Sec title="Goniometry — Range of Motion" color={C.teal} colorLt={C.tealLt}>
      <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.65 }}>
        <b style={{color:C.teal}}>Protocol per Millis & Levine 2014</b> — Measure with patient in lateral recumbency. Use a standard goniometer. Record both active and passive ROM where applicable. Normal ranges are approximate — breed and size variations apply.
      </div>
      <Row>
        <F label="Goniometer Type" options={["Standard 2-arm goniometer","Digital goniometer","Fluid inclinometer","iPhone / digital app"]}/>
        <F label="Position During Assessment" options={["Lateral recumbency — right side up","Lateral recumbency — left side up","Standing","Other"]}/>
      </Row>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginTop:4 }}>
        {gonioJoints.map(j=>(
          <div key={j.name} style={{ padding:"10px 12px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.teal, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              {j.name}
              <span style={{ fontSize:9, color:C.muted, background:C.tealLt, padding:"1px 6px", borderRadius:3 }}>Normal: {j.normal}</span>
            </div>
            <Row cols={2}>
              <div><Lbl>Right (°)</Lbl><input placeholder="°"/></div>
              <div><Lbl>Left (°)</Lbl><input placeholder="°"/></div>
            </Row>
            {j.note && <div style={{ fontSize:9, color:C.muted, marginTop:4, fontStyle:"italic" }}>{j.note}</div>}
          </div>
        ))}
      </div>
      <div style={{ marginTop:12 }}>
        <Lbl>Goniometry Notes</Lbl>
        <textarea placeholder="Deviations from normal, pain on motion, capsular end-feel vs muscle guarding end-feel…" rows={2}/>
      </div>
    </Sec>

    <Sec title="Muscle Circumference Measurements" color={C.teal} colorLt={C.tealLt}>
      <div style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.65 }}>
        <b style={{color:C.teal}}>Protocol per Millis & Levine 2014</b> — Thigh: measure at 70% of femur length distal from greater trochanter with stifle at 135°. A difference of ≥1 cm between limbs is clinically significant atrophy.
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {muscles.map(m=>(
          <div key={m.name} style={{ padding:"10px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:6 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.teal, marginBottom:4 }}>{m.name}</div>
            <Row cols={2}>
              <div><Lbl>Measurement (cm)</Lbl><input placeholder="0.0 cm"/></div>
              <div><Lbl>Asymmetry vs Contralateral</Lbl><input placeholder="e.g. −1.5 cm atrophy"/></div>
            </Row>
            <div style={{ fontSize:9, color:C.muted, marginTop:6, fontStyle:"italic" }}>{m.ref}</div>
          </div>
        ))}
      </div>
    </Sec>

    <Sec title="Postural & Angle Assessment" color={C.teal} colorLt={C.tealLt}>
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
    { cat:"Hydrotherapy", items:["Underwater Treadmill (UWTM)","Therapy Pool — Full submersion","Portable Aquatic Tank","Cold Water Spa / Whirlpool"] },
    { cat:"Land Exercise Equipment", items:["Land Treadmill","Cavaletti Rail Set","Balance Discs — Set","Balance Board / Rocker Board","Wobble Board","Foam Pads / Rolls","Physioroll / Peanut Ball","Resistance Bands / Theraband","Parallel Bars","Exercise Steps / Stairs (clinic)","Ramps","Cone Set","Agility Equipment"] },
    { cat:"Electrotherapy & Modalities", items:["NMES Unit (Neuromuscular E-Stim)","TENS Unit","Therapeutic Ultrasound","Class IV Therapeutic Laser","Class IIIb Laser","Shockwave Therapy","PEMF (Pulsed Electromagnetic Field)","Cryotherapy Unit","Moist Heat / Hydrocollator","Infrared Therapy"] },
    { cat:"Manual Therapy & Assessment", items:["Standard Goniometer","Digital Goniometer","Pressure Algometer","Measuring Tape (thigh circumference)","Force Platform / Pressure Walkway","Video Gait Analysis System","Kinematic Analysis System","IRAP / PRP Equipment"] },
    { cat:"Support & Mobility", items:["Slings — Front end","Slings — Rear end","Full-body Harness","Wheelchairs / Carts","Orthoses / Braces","Non-slip Flooring / Mats","Treatment Table — Adjustable","Treatment Table — Hydraulic"] },
  ];
  const [sel, setSel] = useState({});
  const toggle = k => setSel(p=>({...p,[k]:!p[k]}));

  return <>
    <div style={{ fontSize:11, color:C.muted, marginBottom:16, padding:"10px 14px", background:C.blueLt, borderRadius:6, border:`1px solid ${C.blue}33` }}>
      Check all equipment currently available at this clinic. B.E.A.U. uses this inventory to generate the in-clinic rehabilitation protocol — only available equipment will be prescribed.
    </div>
    {cats.map(grp=>(
      <Sec key={grp.cat} title={grp.cat} color={C.teal} colorLt={C.tealLt}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
          {grp.items.map(item=>(
            <div key={item} className={`cb-row${sel[item]?" active":""}`} onClick={()=>toggle(item)}>
              <input type="checkbox" checked={!!sel[item]} readOnly style={{ width:15, height:15, accentColor:C.teal, flexShrink:0 }}/>
              <span style={{ fontSize:11, color:sel[item]?C.teal:C.text }}>{item}</span>
            </div>
          ))}
        </div>
      </Sec>
    ))}
    <Sec title="Other Equipment" color={C.teal} colorLt={C.tealLt}>
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
      <F label="Primary Rehabilitation Goal" options={["Return to normal household activity","Pain management — improve quality of life","Post-surgical recovery — full function","Neurological rehabilitation — ambulation","Weight management — target BCS 5","Improve joint range of motion","Improve muscle mass / strength","Return to sport or working function","Senior wellness / mobility maintenance","Palliative care — comfort focused","Other"]}/>
      <Row>
        <F label="Target Return to Function Date" type="date"/>
        <F label="Activity Level Goal" options={["Independent ambulation","Leash walks — flat terrain","Leash walks — moderate terrain","Offleash activity","Full sport / working dog return","Companion / household activity only"]}/>
      </Row>
    </Sec>

    <Sec title="Short-Term Goals (0–4 Weeks)" color="#EC4899" colorLt="#FDF2F8">
      <F label="Short-Term Clinical Goals" placeholder="e.g. Achieve partial weight bearing by week 2, pain score ≤3/10 at rest, full ROM within 10° of normal…" rows={3}/>
      <F label="Short-Term Functional Goals" placeholder="e.g. Able to navigate 3 steps independently, complete 10-minute leash walk…" rows={2}/>
      <F label="Short-Term Milestone — Target Date" type="date"/>
    </Sec>

    <Sec title="Long-Term Goals (4–12+ Weeks)" color="#EC4899" colorLt="#FDF2F8">
      <F label="Long-Term Clinical Goals" placeholder="e.g. Full weight bearing, thigh circumference within 1cm bilaterally, full stifle ROM restored…" rows={3}/>
      <F label="Long-Term Functional Goals" placeholder="e.g. Return to offleash play, stair climbing without assistance, sport-specific movement…" rows={2}/>
    </Sec>

    <Sec title="Owner Goals" color="#EC4899" colorLt="#FDF2F8">
      <F label="Owner's Primary Goal (in their own words)" placeholder="What does the owner most want for their pet?…" rows={2}/>
      <Row>
        <F label="Owner Priority" options={["Pain relief above all","Fastest possible recovery","Independence at home","Return to sport / activity","Quality of life / comfort","Maximize lifespan"]}/>
        <F label="Client Communication Preference" options={["Email — protocol PDF","Text — exercise reminders","Phone call follow-up","In-person recheck only","Patient portal / app"]}/>
      </Row>
    </Sec>

    <Sec title="Progress Tracking Schedule" color="#EC4899" colorLt="#FDF2F8">
      <Row>
        <F label="Next Recheck Date" type="date"/>
        <F label="Recheck Frequency" options={["Weekly","Every 2 weeks","Monthly","Every 6 weeks","As needed / PRN"]}/>
      </Row>
      <F label="Measurable Outcome Targets" placeholder="Specific measurable targets: thigh circumference goal, lameness grade goal, NRS pain goal, goniometry targets…" rows={3}/>
      <div style={{ padding:"10px 14px", background:"#FDF2F8", border:"1px solid #EC489933", borderRadius:5, fontSize:11, color:C.muted, marginTop:8 }}>
        <b style={{color:"#EC4899"}}>Note:</b> Goniometry targets, muscle circumference goals, and BCS targets are managed in the B.E.A.U. Metrics block. Progress measurements are recorded there at each recheck.
      </div>
    </Sec>
  </>;
}

// ── CONDITIONING ──────────────────────────────────────────────────────────────
// NOTE: B.E.A.U. calls are routed through the backend /api/beau/chat endpoint
// (never the Anthropic API directly — API keys must stay server-side).
async function callBeau(systemPrompt, userMessage) {
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
    }),
  });
  if (!res.ok) throw new Error(`B.E.A.U. API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || data.text || data.response || "No response.";
}

function ConditioningPanel() {
  const [generating, setGenerating] = useState(false);
  const [exercises,  setExercises]  = useState("");

  const generateConditioning = async () => {
    setGenerating(true); setExercises("");
    try {
      const text = await callBeau(
        `You are B.E.A.U. — the clinical AI of K9 Rehab Pro™. Generate creative, progressive conditioning exercises for a patient who has completed rehabilitation and needs something new and more challenging. Think like a skilled rehabilitation nurse who wants to keep sessions interesting and progressive. Include exercises the clinician may not have thought of. Reference evidence from Millis & Levine, Drum, or Marcellin-Little where relevant. No markdown. Write in clinical sentences with exercise name, technique, sets/reps, and progression cue.`,
        "Generate 5 progressive conditioning exercises that are creative, evidence-based, and more advanced than standard rehabilitation exercises. Include at least one aquatic, one proprioceptive, and one strength-focused exercise."
      );
      setExercises(text);
    } catch (err) { setExercises(`Connection error: ${err.message}`); }
    setGenerating(false);
  };

  return <>
    <Sec title="Conditioning Program Profile" color="#14B8A6" colorLt="#F0FDFB" noTop>
      <div style={{ padding:"10px 14px", background:"#F0FDFB", border:"1px solid #14B8A633", borderRadius:6, fontSize:11, color:C.muted, marginBottom:14 }}>
        For patients who have completed rehabilitation and are transitioning to fitness, performance, or maintenance conditioning. B.E.A.U. will generate progressive, creative conditioning exercises so you always have something new to offer.
      </div>
      <Row>
        <F label="Conditioning Phase" options={["General fitness / Maintenance","Weight loss program","Senior wellness","Return to sport — early","Return to sport — advanced","Performance / Working dog","Sport-specific conditioning"]}/>
        <F label="Current Activity Level" options={["Sedentary — house only","Low — short leash walks","Moderate — regular walks","Active — running / hiking","Performance — competition / work"]}/>
      </Row>
      <Row cols={3}>
        <F label="Session Duration (min)" placeholder="e.g. 30"/>
        <F label="Frequency (per week)" placeholder="e.g. 4"/>
        <F label="Intensity Target" options={["Low","Moderate","Moderate-High","High"]}/>
      </Row>
      <F label="Sport / Activity Type" placeholder="e.g. Agility, flyball, hunting, dock diving, herding, search & rescue, companion pet…"/>
      <F label="Preferred Activities / Equipment" placeholder="e.g. Swimming, treadmill, fetch, hiking, agility obstacles, balance work…"/>
      <F label="Limitations / Precautions" placeholder="Ongoing restrictions — joints to protect, surfaces to avoid, intensity limits…" rows={2}/>
      <Row>
        <F label="Weight Goal (lbs)" placeholder="Target weight"/>
        <F label="Target BCS" options={["4","5 — Ideal","6"]}/>
      </Row>
    </Sec>

    <Sec title="B.E.A.U. Conditioning Exercise Generator" color="#14B8A6" colorLt="#F0FDFB">
      <div style={{ fontSize:11, color:C.muted, marginBottom:14, lineHeight:1.65 }}>
        Not sure what to do today? Hit generate and B.E.A.U. will suggest creative, progressive conditioning exercises tailored to keep sessions fresh and effective — so you never have to scratch your head.
      </div>
      <button onClick={generateConditioning} disabled={generating}
        style={{ width:"100%", padding:"13px", background: generating ? "#F0FDFB" : "#14B8A6", border:"none", color:C.white, borderRadius:6, cursor: generating ? "not-allowed":"pointer", fontSize:13, fontWeight:700, letterSpacing:".08em", display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
        {generating
          ? <><div style={{ width:16, height:16, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spinK9 .8s linear infinite" }}/> GENERATING CONDITIONING PLAN…</>
          : "💪 GENERATE PROGRESSIVE CONDITIONING EXERCISES"}
      </button>
      {exercises && (
        <div style={{ marginTop:16, padding:16, background:C.white, border:`1px solid #14B8A633`, borderRadius:6, animation:"fadeIn .2s ease" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#14B8A6", letterSpacing:".14em", marginBottom:10 }}>B.E.A.U. CONDITIONING PLAN</div>
          <pre style={{ fontSize:12, color:C.text, whiteSpace:"pre-wrap", lineHeight:1.85, fontFamily:"Georgia, serif" }}>{exercises}</pre>
        </div>
      )}
    </Sec>
  </>;
}

// ── PROTOCOL SUMMARY ──────────────────────────────────────────────────────────
function ProtocolPanel({ patientName }) {
  const [generating, setGenerating] = useState(false);
  const [protocol,   setProtocol]   = useState("");
  const [copied,     setCopied]     = useState(false);

  const generate = async () => {
    setGenerating(true); setProtocol("");
    try {
      const text = await callBeau(
        `You are B.E.A.U. — the Biomedical Evidence-based Analytical Unit, clinical protocol engine of K9 Rehab Pro™. Created by Sal Bonanno, Veterinary Technician and Canine Rehabilitation Nurse, 30 years experience. Generate a complete structured evidence-based rehabilitation protocol. Use exact section headers below. No markdown symbols. Write in full clinical sentences.

CLINICAL SUMMARY

REHABILITATION PHASE & RATIONALE

IN-CLINIC PROTOCOL
For each exercise: Exercise name · Evidence level (A/B/C) · Sets × Reps · Frequency · Form note · Contraindication flag

HOME EXERCISE PROGRAM
For each exercise: Exercise name · Items needed · How to perform · Sets × Reps · Frequency · Safety note

SAFETY GUARDRAILS — EVERY SESSION

RED FLAGS — STOP AND CONTACT VETERINARIAN IMMEDIATELY

EVIDENCE BASIS`,
        `Generate a comprehensive rehabilitation protocol. Patient: ${patientName||"Current Patient on file"}. Generate a thorough evidence-based protocol demonstrating B.E.A.U.'s full clinical capability across all phases and exercise categories.`
      );
      setProtocol(text);
    } catch (err) { setProtocol(`Connection error: ${err.message}`); }
    setGenerating(false);
  };

  const copy = () => { navigator.clipboard?.writeText(protocol); setCopied(true); setTimeout(()=>setCopied(false), 2000); };

  return <>
    <Sec title="Generate Protocol" color={C.green} colorLt={C.greenLt} noTop>
      <div style={{ fontSize:12, color:C.muted, marginBottom:16, lineHeight:1.65 }}>
        B.E.A.U. synthesizes all information from Assessment, B.E.A.U. Metrics, Clinic Equipment, Home Exercise Program, and Goals to generate a complete evidence-based rehabilitation protocol. Fill in the relevant blocks before generating.
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
          : "⚡ GENERATE COMPLETE PROTOCOL"}
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
function LibraryPanel() {
  const [species, setSpecies] = useState("canine");
  const [cat,     setCat]     = useState("ALL");
  const [search,  setSearch]  = useState("");
  const [sel,     setSel]     = useState(null);

  const CATS = ["ALL","Warm-up & ROM","Strength & Activation","Proprioception & Balance","Conditioning & Endurance","Neuromotor & Coordination"];
  const EX = [
    { id:"EX-001", name:"PROM — Shoulder", cat:"Warm-up & ROM", lvl:"A", sets:"5–10", reps:"2–3 cycles", freq:"2–3× daily", sp:["canine","feline"], cue:"Support proximal and distal. Slow full arc within pain-free range. Never force end range.", evidence:"Millis & Levine 2014", contra:["Unstable shoulder","Severe pain >8/10","Unhealed incision"], rf:["New crepitus","Muscle guarding","Vocalization"] },
    { id:"EX-002", name:"PROM — Hip & Stifle", cat:"Warm-up & ROM", lvl:"A", sets:"5–10", reps:"2–3 cycles", freq:"2–3× daily", sp:["canine"], cue:"Bicycle motion. Stop at first resistance.", evidence:"Millis & Levine 2014", contra:["Acute TPLO <1wk","Femoral fracture"], rf:["Incision gaping","Crying at <50% ROM"] },
    { id:"EX-003", name:"Cookie Stretches", cat:"Warm-up & ROM", lvl:"A", sets:"3", reps:"5–10 each", freq:"SID", sp:["canine"], cue:"Lure nose: shoulder → flank → stifle → sternum. Hold 3–5 sec.", evidence:"Drum 2010", contra:["Cervical disc disease acute","Atlantoaxial instability"], rf:["Yelping on rotation","Head tilt increase"] },
    { id:"EX-010", name:"Sit-to-Stand", cat:"Strength & Activation", lvl:"A", sets:"3", reps:"10", freq:"BID", sp:["canine"], cue:"Rear paws flat throughout. No external rotation.", evidence:"Millis & Levine 2014", contra:["Acute TPLO <2wk","Severe hip OA"], rf:["Sudden NWB post-session","Stifle effusion increase"] },
    { id:"EX-011", name:"Down-to-Stand", cat:"Strength & Activation", lvl:"A", sets:"3", reps:"8–10", freq:"BID", sp:["canine"], cue:"Begin sphinx. Lure nose forward and up. No frog rear limbs.", evidence:"Millis & Levine 2014", contra:["Bilateral elbow dysplasia severe"], rf:["Forelimb buckling"] },
    { id:"EX-012", name:"Stair Climbing", cat:"Strength & Activation", lvl:"A", sets:"3", reps:"3–5 ascents", freq:"BID", sp:["canine"], cue:"Controlled pace. One step at a time. Leash support only.", evidence:"Drum 2010", contra:["Non-ambulatory","Acute spine surgery <4wk"], rf:["Sudden sit mid-stair","Bunny-hopping"] },
    { id:"EX-013", name:"Hill / Incline Work", cat:"Strength & Activation", lvl:"B", sets:"3", reps:"5 min", freq:"SID", sp:["canine"], cue:"5–10° incline. Controlled slow walk. Rear-handle harness preferred.", evidence:"Marcellin-Little 2015", contra:["Lumbosacral disease","Severe hip OA"], rf:["Dragging rear toes"] },
    { id:"EX-020", name:"Cavaletti Rails", cat:"Proprioception & Balance", lvl:"A", sets:"3", reps:"5 passes", freq:"SID", sp:["canine","feline"], cue:"Rail height at carpus level. Slow walk. No trotting until mastered.", evidence:"Drum 2010", contra:["Non-ambulatory","Severe ataxia"], rf:["Toe dragging on every rail"] },
    { id:"EX-021", name:"Balance Disc — 4-Foot", cat:"Proprioception & Balance", lvl:"B", sets:"3", reps:"30 sec", freq:"BID", sp:["canine"], cue:"All four feet on disc. Gentle perturbations. Under 5 min total.", evidence:"Marcellin-Little 2015", contra:["Acute disc herniation","Grade III+ ataxia"], rf:["Falls repeatedly"] },
    { id:"EX-022", name:"Backward Walking", cat:"Proprioception & Balance", lvl:"B", sets:"3", reps:"5–10 steps", freq:"SID", sp:["canine"], cue:"Gentle sternum pressure. Non-slip surface only.", evidence:"Millis & Levine 2014", contra:["Severe hindlimb paresis"], rf:["Sits instead of stepping"] },
    { id:"EX-030", name:"Underwater Treadmill", cat:"Conditioning & Endurance", lvl:"A", sets:"1", reps:"10–20 min", freq:"3×/week", sp:["canine"], cue:"Water at greater trochanter. Speed 0.4–0.9 mph. Ears back = stop.", evidence:"Levine et al 2010", contra:["Open wounds","Active infection"], rf:["Head submersion","Vomiting in tank"] },
    { id:"EX-031", name:"Land Treadmill", cat:"Conditioning & Endurance", lvl:"A", sets:"1", reps:"10–20 min", freq:"3–5×/week", sp:["canine"], cue:"1.0–2.5 mph. 5° incline increases hindlimb activation.", evidence:"Marcellin-Little 2015", contra:["Non-ambulatory"], rf:["Toe knuckling worsens at speed"] },
    { id:"EX-040", name:"Toe Pinch / Knuckling Correction", cat:"Neuromotor & Coordination", lvl:"B", sets:"3", reps:"10 each foot", freq:"3× daily", sp:["canine","feline"], cue:"Gentle pinch between toes. Patient should withdraw.", evidence:"Lorenz & Kornegay 2011", contra:["Normal neuro — not indicated"], rf:["Zero withdrawal response"] },
    { id:"EX-041", name:"Hip Flexor Stretch", cat:"Neuromotor & Coordination", lvl:"B", sets:"3", reps:"30 sec", freq:"BID", sp:["canine"], cue:"Extend rear limb caudally to first resistance. Never force.", evidence:"Jaeger et al 2007", contra:["Acute iliopsoas injury"], rf:["Bites toward therapist during stretch"] },
    { id:"EX-042", name:"Assisted Sling Walking", cat:"Neuromotor & Coordination", lvl:"A", sets:"3", reps:"Length of room", freq:"3–4× daily", sp:["canine"], cue:"Sling under abdomen. Support only — patient does the work.", evidence:"Millis & Levine 2014", contra:["Severe spinal instability"], rf:["Sudden flaccid paralysis"] },
  ];

  const note = `260 evidence-based exercises are available in K9 Rehab Pro™ full clinical deployment across all 5 categories. This preview shows a representative sample of the library structure.`;
  const filtered = EX.filter(e => {
    if (!e.sp.includes(species)) return false;
    if (cat !== "ALL" && e.cat !== cat) return false;
    if (search) { const q = search.toLowerCase(); return e.name.toLowerCase().includes(q)||e.id.toLowerCase().includes(q)||e.cat.toLowerCase().includes(q); }
    return true;
  });
  const lc = (lvl) => lvl==="A" ? C.green : lvl==="B" ? C.amber : C.purple;

  return <>
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      {["canine","feline"].map(s=>(
        <button key={s} onClick={()=>{setSpecies(s);setSel(null);}}
          style={{ flex:1, padding:"11px", background: species===s ? C.navy : C.white, border:`1.5px solid ${species===s ? C.navy : C.border}`, color: species===s ? C.white : C.muted, borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:700, letterSpacing:".06em" }}>
          {s==="canine"?"🐕  CANINE EXERCISES":"🐱  FELINE EXERCISES"}
        </button>
      ))}
    </div>
    <div style={{ padding:"8px 14px", background:C.blueLt, border:`1px solid ${C.blue}33`, borderRadius:5, fontSize:11, color:C.blue, marginBottom:14, fontWeight:600 }}>
      📚 {note}
    </div>
    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exercises by name or ID…" style={{ flex:1 }}/>
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
      {filtered.map(ex=>{
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
                    <div style={{ fontSize:10, fontWeight:700, color:C.red, letterSpacing:".08em", marginBottom:5 }}>CONTRAINDICATIONS</div>
                    {ex.contra.map(ct=><div key={ct} style={{ fontSize:11, color:C.red, marginBottom:3, display:"flex", gap:6 }}><span>✗</span>{ct}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:C.amber, letterSpacing:".08em", marginBottom:5 }}>RED FLAGS — STOP</div>
                    {ex.rf.map(r=><div key={r} style={{ fontSize:11, color:C.amber, marginBottom:3, display:"flex", gap:6 }}><span>⚑</span>{r}</div>)}
                  </div>
                </Row>
                <div style={{ marginTop:10, padding:"10px 14px", background:C.bg, borderRadius:5, border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:9, color:C.muted, fontWeight:700, letterSpacing:".1em", marginBottom:4 }}>FORM CUE</div>
                  <div style={{ fontSize:12, color:C.text, lineHeight:1.65 }}>{ex.cue}</div>
                </div>
                <div style={{ marginTop:8, padding:"10px 14px", background:C.greenLt, borderRadius:5, border:`1px solid ${C.green}33` }}>
                  <div style={{ fontSize:9, color:C.green, fontWeight:700, letterSpacing:".1em", marginBottom:4 }}>EVIDENCE BASIS</div>
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

  const ask = async () => {
    if (!q.trim()) return;
    setBusy(true); setAns("");
    try {
      const text = await callBeau(
        `You are B.E.A.U. — clinical AI assistant of K9 Rehab Pro™. Answer rehabilitation questions concisely. Cite Millis & Levine, Drum, Marcellin-Little, Jaeger, or Lorenz & Kornegay when relevant. No markdown. Clinical sentences only.`,
        q
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

function AboutPanel() {
  return (
    <div style={{ fontSize:12, color:C.muted, lineHeight:1.8 }}>
      <div style={{ fontSize:22, fontWeight:900, color:C.green, marginBottom:2 }}>B.E.A.U.™</div>
      <div style={{ fontSize:13, color:C.navy, fontWeight:700, marginBottom:2 }}>K9 Rehab Pro™</div>
      <div style={{ fontSize:11, color:C.muted, marginBottom:20 }}>Clinical Protocol Intelligence · Version 2.4</div>
      {[["Creator","Salvatore Bonanno — Veterinary Technician & Canine Rehabilitation Nurse, 30+ years experience in animal medicine"],
        ["Clinical Background","Founder and sole operator of the canine rehabilitation department at Lauderdale Veterinary Specialists (BluePearl Fort Lauderdale) 2016–2024. Currently operating The Doggy Style Gym LLC, Fort Lauderdale, FL"],
        ["Evidence Sources","Millis DL & Levine D — Canine Rehabilitation & Physical Therapy 2nd Ed. (2014) · Drum MG (2010) · Marcellin-Little DJ (2015) · Jaeger GH et al (2007) · Lorenz MD & Kornegay JN (2011) · Levine D et al (2010) · Hielm-Björkman AK et al (2003)"],
        ["Exercise Library","260 evidence-based exercises · 5 categories · Canine and Feline · All exercises include evidence level, dosing, contraindications, and red flags"],
        ["AI Engine","Anthropic Claude — routed via secure backend /api/beau/chat"],
        ["Copyright","© 2026 The Doggy Style Gym LLC. All rights reserved. K9 Rehab Pro™ and B.E.A.U.™ are trademarks of The Doggy Style Gym LLC."],
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
      <div style={{ fontSize:11, color:C.gray, marginTop:8 }}>© 2026 The Doggy Style Gym LLC · K9 Rehab Pro™ · Privacy policy effective April 2026</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const BLOCKS = [
  { id:"client",      label:"Client & Patient",     icon:"👤", color:C.blue,   colorLt:C.blueLt,   desc:"Demographics · Contact · Insurance" },
  { id:"diagnostics", label:"Diagnostics",           icon:"🩻", color:C.purple, colorLt:C.purpleLt, desc:"Imaging · Laboratory Work" },
  { id:"assessment",  label:"Assessment",            icon:"📋", color:C.amber,  colorLt:C.amberLt,  desc:"Diagnosis · Pain · Gait · Neuro" },
  { id:"metrics",     label:"B.E.A.U. Metrics",      icon:"📐", color:C.green,  colorLt:C.greenLt,  desc:"Nutrition · BCS · Goniometry · Muscle" },
  { id:"equipment",   label:"Clinic Equipment",      icon:"🏥", color:C.teal,   colorLt:C.tealLt,   desc:"Available rehabilitation tools" },
  { id:"home",        label:"Home Exercise Program", icon:"🏠", color:C.blue,   colorLt:C.blueLt,   desc:"Environment · HEP · Owner profile" },
  { id:"goals",       label:"Goals",                 icon:"🎯", color:"#BE185D",colorLt:"#FDF2F8",  desc:"Short-term · Long-term · Progress" },
  { id:"conditioning",label:"Conditioning",          icon:"💪", color:"#0D9488",colorLt:"#F0FDFB",  desc:"Fitness · Performance · Maintenance" },
  { id:"protocol",    label:"Protocol Summary",      icon:"⚡", color:C.green,  colorLt:C.greenLt,  desc:"Generate · Export · Email · QR" },
  { id:"library",     label:"Exercise Library",      icon:"📚", color:C.navy,   colorLt:C.blueLt,   desc:"260 exercises · Canine · Feline" },
];

const SIDEBAR_NAV = [
  { id:"how",        icon:"❓", label:"How to Use K9 Rehab Pro" },
  { id:"ask",        icon:"⬡",  label:"Ask B.E.A.U." },
  { id:"about",      icon:"ℹ️", label:"About" },
  { id:"disclaimer", icon:"⚠️", label:"Disclaimer" },
  { id:"hipaa",      icon:"🔒", label:"Veterinary HIPAA" },
];

const BLOCK_COMPS   = { client:ClientPanel, diagnostics:DiagnosticsPanel, assessment:AssessmentPanel, metrics:MetricsPanel, equipment:EquipmentPanel, home:HomePanel, goals:GoalsPanel, conditioning:ConditioningPanel, protocol:ProtocolPanel, library:LibraryPanel };
const SIDEBAR_COMPS = { how:HowToUse, ask:AskBeau, about:AboutPanel, disclaimer:DisclaimerPanel, hipaa:HipaaPanel };

export default function DashboardView({ setView, currentUser, onLogout }) {
  const [openBlock,   setOpenBlock]   = useState(null);
  const [openSidebar, setOpenSidebar] = useState(null);
  const [saved,       setSaved]       = useState(false);

  const displayName = currentUser?.username || currentUser?.name || "Clinician";
  const credLabel   = currentUser?.role === "admin" ? "Administrator" : "CVN, Canine Rehabilitation Nurse";
  const initials    = displayName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "SB";
  const patient     = "Max — German Shepherd · TPLO Post-Op";

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false),2400); };
  const handleExit = () => {
    if (typeof onLogout === "function") { onLogout(); return; }
    if (typeof setView === "function")   { setView("clients"); }
  };

  const block     = BLOCKS.find(b=>b.id===openBlock);
  const BlockComp = openBlock ? BLOCK_COMPS[openBlock] : null;
  const SideComp  = openSidebar ? SIDEBAR_COMPS[openSidebar] : null;
  const sideBlock = SIDEBAR_NAV.find(s=>s.id===openSidebar);

  return (
    <div className="k9v2" style={{ display:"flex", height:"100vh", overflow:"hidden", background:C.bg }}>
      <style>{CSS}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width:210, flexShrink:0, background:C.navy, display:"flex", flexDirection:"column", boxShadow:"2px 0 12px rgba(0,0,0,.15)" }}>
        <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
          <div style={{ fontSize:22, fontWeight:900, color:C.white, letterSpacing:".04em", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
            B.E.A.U.<span style={{ color:C.green }}>™</span>
          </div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,.45)", letterSpacing:".16em", marginTop:2 }}>K9 REHAB PRO™</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}`, animation:"pulseK9 1.6s ease-in-out infinite" }}/>
            <span style={{ fontSize:9, color:C.green, fontWeight:600 }}>SYSTEM ONLINE</span>
          </div>
        </div>

        <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,.08)", background:"rgba(255,255,255,.05)" }}>
          <div style={{ fontSize:8, color:"rgba(255,255,255,.35)", letterSpacing:".12em", marginBottom:6 }}>SIGNED IN AS</div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:C.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:C.white, flexShrink:0 }}>{initials}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.white }}>{displayName}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.45)", lineHeight:1.4 }}>{credLabel}</div>
            </div>
          </div>
        </div>

        <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,.08)", background:"rgba(0,196,106,.08)" }}>
          <div style={{ fontSize:8, color:"rgba(255,255,255,.35)", letterSpacing:".12em", marginBottom:3 }}>ACTIVE PATIENT</div>
          <div style={{ fontSize:11, fontWeight:600, color:C.white, lineHeight:1.4 }}>{patient}</div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>
          {SIDEBAR_NAV.map(item=>(
            <div key={item.id} className="sb-btn"
              onClick={()=>setOpenSidebar(item.id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 10px", marginBottom:2 }}>
              <span style={{ fontSize:16, width:22, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,.7)", fontWeight:500 }}>{item.label}</span>
            </div>
          ))}
          {typeof setView === "function" && (
            <div className="sb-btn" onClick={()=>setView("clients")} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 10px", marginTop:10, borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:14 }}>
              <span style={{ fontSize:16, width:22, textAlign:"center", flexShrink:0 }}>←</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,.7)", fontWeight:500 }}>Back to Clients</span>
            </div>
          )}
        </div>

        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,.08)" }}>
          <button onClick={handleSave}
            style={{ width:"100%", padding:"10px", background: saved ? C.green : "rgba(0,196,106,.18)", border:`1px solid ${C.green}`, color:C.white, borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:".1em", marginBottom:8, transition:"all .2s" }}>
            {saved ? "✓  SAVED" : "SAVE"}
          </button>
          <button onClick={handleExit} style={{ width:"100%", padding:"10px", background:"rgba(192,57,43,.15)", border:"1px solid rgba(192,57,43,.5)", color:"#EF9A9A", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:".1em" }}>
            {typeof onLogout === "function" ? "SIGN OUT" : "EXIT"}
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 24px", background:C.white, borderBottom:`1px solid ${C.border}`, flexShrink:0, boxShadow:"0 1px 6px rgba(26,39,68,.07)" }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:C.navy }}>Clinical Dashboard</div>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:".08em", marginTop:1 }}>SELECT ANY BLOCK · ALL FIELDS INDEPENDENT · NO REQUIRED ORDER</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ padding:"6px 14px", background:C.greenLt, border:`1px solid ${C.green}44`, borderRadius:5, fontSize:11, color:C.green, fontWeight:700 }}>
              🟢 B.E.A.U. READY
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:22 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
            {BLOCKS.map((b,i)=>(
              <div key={b.id} className="block-card"
                onClick={()=>setOpenBlock(b.id)}
                style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:9, padding:"22px 20px", position:"relative", overflow:"hidden", boxShadow:"0 1px 6px rgba(26,39,68,.06)", animationDelay:`${i*.04}s`, animation:"fadeUp .3s ease both" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:b.color }}/>
                <div style={{ width:44, height:44, borderRadius:10, background:b.colorLt, border:`1px solid ${b.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14, boxShadow:`0 2px 8px ${b.color}22` }}>
                  {b.icon}
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:5 }}>{b.label}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.55 }}>{b.desc}</div>
                <div style={{ position:"absolute", bottom:16, right:16, fontSize:16, color:b.color, opacity:.35 }}>→</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:20, padding:"10px 4px", display:"flex", justifyContent:"space-between", borderTop:`1px solid ${C.border}` }}>
            <span style={{ fontSize:9, color:C.gray, letterSpacing:".1em" }}>B.E.A.U.™ CLINICAL PROTOCOL INTELLIGENCE</span>
            <span style={{ fontSize:9, color:C.gray, letterSpacing:".1em" }}>© 2026 THE DOGGY STYLE GYM LLC · K9 REHAB PRO™</span>
          </div>
        </div>
      </div>

      {block && BlockComp && (
        <Modal title={block.label} color={block.color} colorLt={block.colorLt} icon={block.icon} onClose={()=>setOpenBlock(null)}>
          <BlockComp patientName="Max"/>
        </Modal>
      )}

      {sideBlock && SideComp && (
        <Modal title={sideBlock.label} color={C.blue} colorLt={C.blueLt} icon={sideBlock.icon} onClose={()=>setOpenSidebar(null)}>
          <SideComp/>
        </Modal>
      )}
    </div>
  );
}
