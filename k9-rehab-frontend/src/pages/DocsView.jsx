import React, { useState, useRef } from "react";
import { FiChevronRight, FiBook, FiArrowLeft, FiAlertTriangle, FiInfo, FiShield } from "react-icons/fi";
import { useTr } from "../i18n/useTr";

/* ── Sidebar nav data ── */
const SECTIONS = [
  {
    title: "Overview",
    items: [
      { id: "about", label: "About K9 Rehab Pro" },
      { id: "cdss", label: "CDSS Classification" },
      { id: "scope", label: "Scope of Practice" },
      { id: "credentials", label: "Credentials & Access" },
      { id: "evidence-foundation", label: "Evidence-Based Foundation" },
    ],
  },
  {
    title: "Chapter 1. Clinical Protocols",
    items: [
      { id: "protocol-overview", label: "1.1 Protocol Architecture" },
      { id: "tplo", label: "1.2 TPLO Post-Op (16 wk)" },
      { id: "ivdd", label: "1.3 IVDD Recovery (12 wk)" },
      { id: "oa", label: "1.4 Osteoarthritis (16 wk)" },
      { id: "geriatric", label: "1.5 Geriatric Mobility (16 wk)" },
      { id: "protocol-routing", label: "1.6 Protocol Routing Logic" },
    ],
  },
  {
    title: "Chapter 2. Phase Progression",
    items: [
      { id: "phase-overview", label: "2.1 Phase Model" },
      { id: "tplo-gates", label: "2.2 TPLO Progression Gates" },
      { id: "ivdd-gates", label: "2.3 IVDD Progression Gates" },
      { id: "oa-gates", label: "2.4 OA Progression Gates" },
      { id: "geriatric-gates", label: "2.5 Geriatric Progression Gates" },
    ],
  },
  {
    title: "Chapter 3. Exercise Library",
    items: [
      { id: "exercise-overview", label: "3.1 Library Overview (260)" },
      { id: "exercise-structure", label: "3.2 Exercise Data Structure" },
      { id: "intervention-types", label: "3.3 Intervention Categories" },
      { id: "exercise-examples", label: "3.4 Key Exercise Examples" },
    ],
  },
  {
    title: "Chapter 4. Evidence Grading",
    items: [
      { id: "evidence-grades", label: "4.1 Evidence Grade Definitions" },
      { id: "evidence-policy", label: "4.2 Evidence Gating Policy" },
      { id: "evidence-refs", label: "4.3 Primary References" },
    ],
  },
  {
    title: "Chapter 5. Safety & Red Flags",
    items: [
      { id: "red-flags", label: "5.1 Blocking Criteria" },
      { id: "escalation", label: "5.2 Escalation Pathways" },
      { id: "contraindications", label: "5.3 Contraindication Gates" },
      { id: "wb-gates", label: "5.4 Weight-Bearing Status Gates" },
      { id: "incision-gates", label: "5.5 Incision Status Gates" },
    ],
  },
  {
    title: "Chapter 6. B.E.A.U. AI Engine",
    items: [
      { id: "beau-overview", label: "6.1 Overview" },
      { id: "anti-hallucination", label: "6.2 Anti-Hallucination Rules" },
      { id: "beau-scope", label: "6.3 Scope Enforcement" },
    ],
  },
];

/* ── Reusable sub-components ── */
function Note({ children }) {
  const tr = useTr();
  return (
    <div className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-500 rounded p-3 mb-4 text-sm">
      <div className="flex items-center gap-1.5 font-bold text-blue-600 mb-1"><FiInfo className="w-3.5 h-3.5" /> {tr("Note")}</div>
      {children}
    </div>
  );
}

function Warning({ children }) {
  const tr = useTr();
  return (
    <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-orange-500 rounded p-3 mb-4 text-sm">
      <div className="flex items-center gap-1.5 font-bold text-orange-600 mb-1"><FiAlertTriangle className="w-3.5 h-3.5" /> {tr("Important")}</div>
      {children}
    </div>
  );
}

function RedFlag({ children }) {
  const tr = useTr();
  return (
    <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-600 rounded p-3 mb-4 text-sm">
      <div className="flex items-center gap-1.5 font-bold text-red-700 mb-1"><FiShield className="w-3.5 h-3.5" /> {tr("Safety Block")}</div>
      {children}
    </div>
  );
}

function C({ children }) {
  return <code className="font-mono text-[13px] bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded">{children}</code>;
}

function Pre({ children }) {
  return (
    <pre className="bg-slate-50 border border-slate-200 rounded p-4 overflow-x-auto mb-4 leading-relaxed">
      <code className="font-mono text-[13px] text-slate-800">{children}</code>
    </pre>
  );
}

function T({ headers, rows }) {
  return (
    <div className="overflow-x-auto mb-5">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>{headers.map((h, i) => <th key={i} className="bg-slate-50 border border-slate-300 px-3 py-2 text-left font-semibold text-slate-800">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-slate-50/50" : ""}>
              {row.map((cell, ci) => <td key={ci} className="border border-slate-300 px-3 py-2 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function H2({ id, num, children }) {
  return <h2 id={id} className="text-[20px] font-semibold text-slate-800 mt-10 mb-3 pb-2 border-b border-slate-200">{num && <span className="text-slate-400 font-normal mr-1">{num}</span>}{children}</h2>;
}

function H3({ id, num, children }) {
  return <h3 id={id} className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">{num && <span className="text-slate-400 font-normal mr-1">{num}</span>}{children}</h3>;
}

function H4({ id, children }) {
  return <h4 id={id} className="text-[15px] font-semibold text-slate-800 mt-5 mb-2">{children}</h4>;
}

function P({ children }) {
  return <p className="mb-3 leading-relaxed text-[15px] text-slate-700">{children}</p>;
}

function UL({ children }) {
  return <ul className="list-disc pl-7 mb-4 text-[15px] text-slate-700 space-y-1">{children}</ul>;
}

function OL({ children }) {
  return <ol className="list-decimal pl-7 mb-4 text-[15px] text-slate-700 space-y-1">{children}</ol>;
}

function HR() {
  return <hr className="my-8 border-slate-200" />;
}

/* ── Phase Card ── */
function PhaseCard({ phase, name, weeks, goals, color }) {
  const tr = useTr();
  const colors = { blue: "border-blue-400 bg-blue-50", green: "border-green-400 bg-green-50", amber: "border-amber-400 bg-amber-50", purple: "border-purple-400 bg-purple-50" };
  return (
    <div className={`border-l-4 rounded p-3 mb-3 text-sm ${colors[color] || colors.blue}`}>
      <div className="font-bold text-slate-800">{tr("Phase")} {phase}: {tr(name)} <span className="font-normal text-slate-500">({tr(weeks)})</span></div>
      <div className="text-slate-600 mt-1">{tr(goals)}</div>
    </div>
  );
}

/* ── Nav Section ── */
function NavSection({ section, activeId, onSelect, defaultOpen }) {
  const tr = useTr();
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="mb-0.5">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 w-full px-5 py-1.5 text-left font-semibold text-slate-800 hover:bg-slate-200/60 text-[13.5px]">
        <FiChevronRight className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
        <span className="truncate">{tr(section.title)}</span>
      </button>
      {open && (
        <div className="pl-4">
          {section.items.map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)} className={`block w-full text-left px-5 py-1 text-[13px] leading-snug transition-colors ${activeId === item.id ? "text-blue-600 font-semibold bg-blue-50 border-r-[3px] border-blue-600" : "text-slate-500 hover:text-blue-600 hover:bg-slate-100"}`}>
              {tr(item.label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN DOCS VIEW
   ══════════════════════════════════════════════════════════════════ */
export default function DocsView({ setView }) {
  const tr = useTr();
  const [activeId, setActiveId] = useState("about");

  function scrollTo(id) {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* ── Doc sidebar ── */}
      <aside className="w-[260px] min-w-[260px] bg-slate-50 border-r border-slate-200 overflow-y-auto">
        <div className="px-5 py-3 border-b border-slate-200">
          <button onClick={() => setView("dashboard")} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mb-2">
            <FiArrowLeft className="w-3.5 h-3.5" /> {tr("Back to Dashboard")}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0F4C81] flex items-center justify-center">
              <FiBook className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-[#0F4C81]">K9 Rehab Pro {tr("Reference")}</span>
          </div>
        </div>
        <div className="py-2">
          {SECTIONS.map((s, i) => (
            <NavSection key={i} section={s} activeId={activeId} onSelect={scrollTo} defaultOpen={i === 0} />
          ))}
        </div>
      </aside>

      {/* ── Doc content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[820px] px-6 py-8 pb-20">
          <div className="text-[13px] text-slate-400 mb-5">
            <button onClick={() => setView("dashboard")} className="text-blue-600 hover:underline">{tr("Home")}</button>
            {" > "}
            <span className="text-slate-500">{tr("Documentation")}</span>
            {" > "}
            <span className="text-slate-500">K9 Rehab Pro {tr("Clinical Reference")}</span>
          </div>

          <h1 className="text-[26px] font-bold text-[#0F4C81] mb-2 pb-3 border-b-2 border-slate-200">
            K9 Rehab Pro&trade; {tr("Clinical Reference")}
          </h1>
          <div className="text-[13px] text-slate-400 mb-6 flex flex-wrap gap-4">
            <span>4 {tr("Conditions")}</span>
            <span>16 {tr("Phases")}</span>
            <span>52 {tr("Protocol Exercises")}</span>
            <span>260 {tr("Validated Exercises")}</span>
            <span>{tr("Full Modality Integration")}</span>
          </div>

          {/* ═══════════════════ OVERVIEW ═══════════════════ */}
          <H2 id="about">{tr("About K9 Rehab Pro")}</H2>
          <P>{tr("K9 Rehab Pro is a veterinary rehabilitation intelligence platform and")} <strong>{tr("Clinical Decision-Support System (CDSS)")}</strong> {tr("for post-diagnostic rehabilitation planning.")} {tr("Built from 30 years of veterinary nursing experience, every protocol, phase gate, and clinical rule originates from real clinical work with real patients.")}</P>
          <P>{tr("The platform implements ACVSMR diplomate methodology aligned with Millis & Levine textbook standards, providing evidence-based canine rehabilitation protocols across four primary conditions with phase-gated progression.")}</P>

          <H3 id="cdss">{tr("CDSS Classification")}</H3>
          <P>{tr("K9 Rehab Pro is classified as a Clinical Decision-Support System,")} <strong>{tr("not")}</strong> {tr("a medical device.")} {tr("It does not claim FDA/USDA device classification or AVMA endorsement.")} {tr("The platform aligns with AVMA Model Veterinary Practice Act principles and ACVSMR certification standards.")}</P>
          <Warning>{tr("No protocol output is valid without licensed veterinarian review and approval.")} {tr("The platform retains no liability for clinical outcomes — the licensee assumes full professional responsibility.")}</Warning>

          <H3 id="scope">{tr("Scope of Practice")}</H3>
          <H4>{tr("In Scope")}</H4>
          <UL>
            <li>{tr("Rehabilitation protocol generation for")} <strong>{tr("diagnosed conditions")}</strong></li>
            <li>{tr("Exercise selection, dosing, and progression from the validated 260-exercise library")}</li>
            <li>{tr("Phase-gated progression based on clinical assessment criteria")}</li>
            <li>{tr("Clinical education and evidence reference")}</li>
          </UL>
          <H4>{tr("Out of Scope — The Platform NEVER:")}</H4>
          <UL>
            <li>{tr("Diagnoses conditions or diseases")}</li>
            <li>{tr("Prescribes medication or pharmaceutical interventions")}</li>
            <li>{tr("Establishes or replaces the Veterinarian-Client-Patient Relationship (VCPR)")}</li>
            <li>{tr("Overrides licensed veterinary judgment")}</li>
            <li>{tr("Provides emergency or urgent care guidance")}</li>
            <li>{tr("Makes prognosis determinations")}</li>
          </UL>
          <RedFlag>{tr("Any feature, AI output, or code path that crosses scope boundaries is")} <strong>{tr("blocked")}</strong>, {tr("not just disclaimed.")}</RedFlag>

          <H3 id="credentials">{tr("Credentials & Access")}</H3>
          <T headers={[tr("Role"), tr("Access Level"), tr("Clinical Sign-Off")]}
            rows={[
              [tr("DVM (Doctor of Veterinary Medicine)"), tr("Full access, protocol approval"), tr("Can approve protocols")],
              [tr("CCRP / CCRT (Certified Rehab Practitioner/Therapist)"), tr("Full access, protocol generation"), tr("Can approve under DVM supervision")],
              [tr("Veterinary Technician (supervised)"), tr("Protocol execution, exercise logging"), tr("Cannot approve protocols")],
              [tr("Student"), tr("View only, flagged for audit oversight"), tr("No clinical authority")],
            ]}
          />

          <H3 id="evidence-foundation">{tr("Evidence-Based Foundation")}</H3>
          <UL>
            <li><strong>ACVSMR</strong> &mdash; {tr("American College of Veterinary Sports Medicine and Rehabilitation diplomate methodology")}</li>
            <li><strong>Millis &amp; Levine (2014)</strong> &mdash; Canine Rehabilitation and Physical Therapy, 2nd ed.</li>
            <li><strong>Zink &amp; Van Dyke (2013)</strong> &mdash; Canine Sports Medicine and Rehabilitation</li>
            <li><strong>McGonagle et al. (2018)</strong> &mdash; Physical Rehabilitation in Veterinary Medicine</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 1: PROTOCOLS ═══════════════════ */}
          <H2 id="protocol-overview" num={tr("Chapter 1.")}>{tr("Clinical Protocols")}</H2>
          <H3 id="protocol-overview" num="1.1">{tr("Protocol Architecture")}</H3>
          <P>{tr("K9 Rehab Pro implements a")} <strong>{tr("4-condition × 4-phase")}</strong> {tr("system with gated progression (16 total phases).")} {tr("Each protocol is mapped to specific diagnoses with evidence-based exercise selection per phase.")}</P>
          <T headers={[tr("Protocol"), tr("Duration"), tr("Phases"), tr("Primary Indications")]}
            rows={[
              [tr("TPLO Post-Op"), tr("16 weeks"), "4", tr("TPLO, TTA, CCL repair, meniscal, patellar luxation")],
              [tr("IVDD Recovery"), tr("12 weeks"), "4", tr("IVDD, FCE, myelopathy, lumbosacral, cauda equina, wobbler syndrome")],
              [tr("Osteoarthritis (OA)"), tr("16 weeks"), "4", tr("Hip/elbow dysplasia, OA, fractures, FHO, THR, soft tissue injury")],
              [tr("Geriatric Mobility"), tr("16 weeks"), "4", tr("Age-related decline, sarcopenia, cognitive decline, palliative, amputation")],
            ]}
          />

          <H3 id="tplo" num="1.2">{tr("TPLO Post-Op Rehabilitation (16 weeks)")}</H3>
          <PhaseCard phase={1} name="Acute Protection" weeks="Weeks 0-2" goals="Pain control, inflammation management, passive ROM, incision monitoring" color="blue" />
          <PhaseCard phase={2} name="Early Mobilization" weeks="Weeks 2-6" goals="Restore weight bearing, begin active ROM, controlled leash walks, early strengthening" color="green" />
          <PhaseCard phase={3} name="Controlled Strengthening" weeks="Weeks 6-12" goals="Rebuild muscle mass, dynamic stability, advanced proprioception, aquatic therapy" color="amber" />
          <PhaseCard phase={4} name="Return to Function" weeks="Weeks 12-16+" goals="Full restoration, sport-specific conditioning, symmetrical gait, off-leash progression" color="purple" />

          <H3 id="ivdd" num="1.3">{tr("IVDD Recovery (12 weeks)")}</H3>
          <PhaseCard phase={1} name="Strict Rest & Pain Control" weeks="Weeks 0-2" goals="Reduce inflammation, manage neuropathic pain, strict confinement" color="blue" />
          <PhaseCard phase={2} name="Neuromotor Re-Education" weeks="Weeks 2-6" goals="Restore proprioceptive awareness, voluntary motor control, assisted standing" color="green" />
          <PhaseCard phase={3} name="Functional Strengthening" weeks="Weeks 6-9" goals="Improve gait quality, strengthen core and limbs, balance work" color="amber" />
          <PhaseCard phase={4} name="Maintenance & Prevention" weeks="Weeks 10-12+" goals="Spinal health, weight management, activity modification, owner education" color="purple" />

          <H3 id="oa" num="1.4">{tr("Osteoarthritis Management (16 weeks)")}</H3>
          <PhaseCard phase={1} name="Pain Control & Baseline" weeks="Weeks 0-4" goals="Establish baseline, reduce flare, gentle controlled movement" color="blue" />
          <PhaseCard phase={2} name="Progressive Mobility" weeks="Weeks 4-8" goals="Improve ROM, build endurance, strengthen stabilizers" color="green" />
          <PhaseCard phase={3} name="Functional Optimization" weeks="Weeks 8-12" goals="Maximize joint function, build endurance, optimize body composition" color="amber" />
          <PhaseCard phase={4} name="Lifelong Maintenance" weeks="Weeks 12-16+" goals="Sustain gains, prevent deconditioning, manage flares" color="purple" />

          <H3 id="geriatric" num="1.5">{tr("Geriatric Mobility Decline (16 weeks)")}</H3>
          <PhaseCard phase={1} name="Assessment & Gentle Activation" weeks="Weeks 0-4" goals="Baseline assessment, pain management, gentle controlled movement" color="blue" />
          <PhaseCard phase={2} name="Functional Strengthening" weeks="Weeks 4-10" goals="Combat sarcopenia, improve balance, increase endurance" color="green" />
          <PhaseCard phase={3} name="Balance & Independence" weeks="Weeks 10-12" goals="Maximize functional independence, fall prevention" color="amber" />
          <PhaseCard phase={4} name="Lifelong Quality of Life" weeks="Weeks 12-16+" goals="Sustain capacity, adapt to decline, support end-of-life decisions" color="purple" />

          <H3 id="protocol-routing" num="1.6">{tr("Protocol Routing Logic")}</H3>
          <P>{tr("Diagnoses are automatically routed to the appropriate protocol:")}</P>
          <T headers={[tr("Diagnosis Category"), tr("Routed Protocol")]}
            rows={[
              [tr("Palliative approach (any diagnosis)"), tr("Geriatric")],
              [tr("Amputation (any location)"), tr("Geriatric (compensatory strength)")],
              [tr("TPLO, TTA, CCL, meniscal, patellar luxation"), "TPLO"],
              [tr("FHO, THR, hip luxation, Legg-Perthes"), "OA"],
              [tr("Vestibular disease"), tr("OA (inner ear, not spine)")],
              [tr("IVDD, FCE, myelopathy, lumbosacral, wobbler, neuropathy"), "IVDD"],
              [tr("Geriatric decline, sarcopenia, cognitive decline"), tr("Geriatric")],
              [tr("Hip/elbow dysplasia, OA, fractures, soft tissue (default)"), "OA"],
            ]}
          />

          <HR />

          {/* ═══════════════════ CH 2: PHASE PROGRESSION ═══════════════════ */}
          <H2 id="phase-overview" num={tr("Chapter 2.")}>{tr("Phase Progression")}</H2>
          <H3 id="phase-overview" num="2.1">{tr("Phase Model")}</H3>
          <P>{tr("Phase progression is")} <strong>{tr("gated")}</strong> &mdash; {tr("a patient cannot advance to the next phase until all gate criteria are met.")} {tr("Each gate requires clinical assessment by the supervising clinician.")}</P>
          <T headers={[tr("Phase"), tr("Timeframe"), tr("Primary Goals")]}
            rows={[
              [tr("Acute"), tr("0-72 hours post-injury/surgery"), tr("Pain control, inflammation management, tissue protection")],
              [tr("Subacute"), tr("3 days - 6 weeks"), tr("Restore ROM, begin strengthening, neuromuscular re-education")],
              [tr("Recovery"), tr("6-12 weeks"), tr("Restore strength, functional training, return to activity")],
              [tr("Maintenance"), tr("12+ weeks"), tr("Maintain gains, prevent deconditioning, quality of life")],
            ]}
          />

          <H3 id="tplo-gates" num="2.2">{tr("TPLO Progression Gates")}</H3>
          <H4>{tr("Phase 1 → Phase 2")}</H4>
          <UL>
            <li>{tr("Willingness to bear weight on the affected limb")}</li>
            <li>{tr("Incision healing without complications")}</li>
            <li>{tr("Pain score <3/10")}</li>
            <li>{tr("No increase in joint effusion")}</li>
          </UL>
          <H4>{tr("Phase 2 → Phase 3")}</H4>
          <UL>
            <li>{tr("Consistent weight bearing at walk")}</li>
            <li>{tr("Thigh circumference loss <1 cm vs. contralateral")}</li>
            <li>{tr("Passive ROM within 10° of opposite limb")}</li>
          </UL>
          <H4>{tr("Phase 3 → Phase 4")}</H4>
          <UL>
            <li>{tr("Thigh circumference within 0.5 cm of contralateral")}</li>
            <li>{tr("Full passive ROM restored")}</li>
            <li>{tr("No lameness at walk or trot")}</li>
            <li>{tr("Radiographic confirmation of healing")}</li>
          </UL>

          <H3 id="ivdd-gates" num="2.3">{tr("IVDD Progression Gates")}</H3>
          <H4>{tr("Phase 1 → Phase 2")}</H4>
          <UL>
            <li>{tr("Pain <2/10 at rest")}</li>
            <li>{tr("Voluntary movement present")}</li>
            <li>{tr("Proprioceptive placing present")}</li>
            <li>{tr("Veterinary clearance obtained")}</li>
          </UL>
          <H4>{tr("Phase 2 → Phase 3")}</H4>
          <UL>
            <li>{tr("Voluntary weight bearing without sling assistance")}</li>
            <li>{tr("Conscious proprioceptive placing in all 4 limbs")}</li>
            <li>{tr("Ambulatory status achieved")}</li>
          </UL>
          <H4>{tr("Phase 3 → Phase 4")}</H4>
          <UL>
            <li>{tr("Non-ataxic gait at walk")}</li>
            <li>{tr("Core stability >30 seconds on unstable surface")}</li>
            <li>{tr("No pain on spinal palpation")}</li>
          </UL>

          <H3 id="oa-gates" num="2.4">{tr("OA Progression Gates")}</H3>
          <UL>
            <li><strong>{tr("Phase 1→2:")}</strong> {tr("Pain <3/10, baseline ROM established, weight management plan initiated")}</li>
            <li><strong>{tr("Phase 2→3:")}</strong> {tr("Improved ROM, consistent exercise tolerance, reduced lameness grade")}</li>
            <li><strong>{tr("Phase 3→4:")}</strong> {tr("Functional goals met, owner independent with home program")}</li>
          </UL>

          <H3 id="geriatric-gates" num="2.5">{tr("Geriatric Progression Gates")}</H3>
          <UL>
            <li><strong>{tr("Phase 1→2:")}</strong> {tr("Baseline established, pain managed, tolerance for gentle activity")}</li>
            <li><strong>{tr("Phase 2→3:")}</strong> {tr("Improved strength measures, reduced fall risk, endurance gains")}</li>
            <li><strong>{tr("Phase 3→4:")}</strong> {tr("Home program established, owner educated, 3-6 month recheck scheduled")}</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 3: EXERCISE LIBRARY ═══════════════════ */}
          <H2 id="exercise-overview" num={tr("Chapter 3.")}>{tr("Exercise Library")}</H2>
          <H3 id="exercise-overview" num="3.1">{tr("Library Overview")}</H3>
          <P>{tr("The exercise library contains")} <strong>{tr("260 evidence-based exercises")}</strong> {tr("with 52 mapped directly to protocol phases.")} {tr("Every exercise includes standardized metadata for clinical decision support.")}</P>

          <H3 id="exercise-structure" num="3.2">{tr("Exercise Data Structure")}</H3>
          <P>{tr("Each exercise entry contains the following fields:")}</P>
          <Pre>{`{
  code:               "PROM_STIFLE",          // UPPER_SNAKE_CASE identifier
  name:               "Passive Range of Motion - Stifle",
  category:           "Passive Therapy",
  description:        "Gentle manual manipulation of stifle joint...",
  equipment:          ["Cushioned surface", "Treat rewards"],
  steps:              [/* step-by-step instructions */],
  good_form:          [/* form cues */],
  common_mistakes:    [/* error patterns */],
  red_flags:          [/* safety red flags */],
  progression:        "Increase reps to 20-25...",
  contraindications:  "Acute fracture, unstable joint...",
  difficulty_level:   "Easy | Moderate | Advanced",
  evidence_grade:     "A | B | C | EO"
}`}</Pre>

          <H3 id="intervention-types" num="3.3">{tr("Intervention Categories")}</H3>
          <T headers={[tr("Category"), tr("CPT Code"), tr("Description")]}
            rows={[
              [tr("Passive Modality"), "97140", tr("Therapist-applied: PROM, stretching, cryo, thermo")],
              [tr("Active Therapeutic"), "97110", tr("Patient performs: active-assisted, active, active-resisted")],
              [tr("Strengthening & Resistance"), "97110", tr("Progressive resistance: isometric, isotonic, plyometric")],
              [tr("Neuromuscular Retraining"), "97112", tr("Balance, proprioception, coordination, gait training")],
              [tr("Aquatic Hydrotherapy"), "97530", tr("UWTM, swimming, whirlpool, contrast therapy")],
              [tr("Manual Therapy"), "97140", tr("Massage, mobilization, myofascial release, trigger point")],
              [tr("Therapeutic Modalities"), "97032-97039", tr("Laser, TENS, NMES, ultrasound, e-stim")],
              [tr("Functional Rehabilitation"), "97530", tr("ADL training, sport-specific, return to function")],
            ]}
          />

          <H3 id="exercise-examples" num="3.4">{tr("Key Exercise Examples")}</H3>
          <H4>PROM_STIFLE &mdash; {tr("Passive Range of Motion (Stifle)")}</H4>
          <UL>
            <li><strong>{tr("Category")}:</strong> {tr("Passive Therapy")} | <strong>{tr("Difficulty")}:</strong> {tr("Easy")}</li>
            <li><strong>{tr("Equipment")}:</strong> {tr("Cushioned surface, treat rewards")}</li>
            <li><strong>{tr("Contraindications")}:</strong> {tr("Acute fracture, unstable joint, severe inflammation, <48hr post-surgery")}</li>
            <li><strong>{tr("Red Flags")}:</strong> {tr("Vocalization, muscle spasm, swelling increase, ROM loss, joint instability")}</li>
          </UL>
          <H4>SIT_STAND &mdash; {tr("Sit-to-Stand Exercise")}</H4>
          <UL>
            <li><strong>{tr("Dosing")}:</strong> {tr("5-10 reps × 2-3 sets, 2x/day")}</li>
            <li><strong>{tr("Progression")}:</strong> {tr("Slow tempo, incline surface")}</li>
            <li><strong>{tr("Protocols")}:</strong> TPLO {tr("Phase")} 2+, IVDD {tr("Phase")} 2+, OA {tr("Phase")} 2+, {tr("Geriatric")} {tr("Phase")} 2+</li>
          </UL>
          <H4>UNDERWATER_TREAD &mdash; {tr("Underwater Treadmill")}</H4>
          <UL>
            <li><strong>{tr("Dosing")}:</strong> {tr("5-20 min, 2-3x/week")}</li>
            <li><strong>{tr("Equipment gating")}:</strong> {tr("Requires UWTM access flag")}</li>
            <li><strong>{tr("Note")}:</strong> {tr("NOT excluded for NWB patients — provides 62% weight reduction at hip depth")}</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 4: EVIDENCE ═══════════════════ */}
          <H2 id="evidence-grades" num={tr("Chapter 4.")}>{tr("Evidence Grading")}</H2>
          <H3 id="evidence-grades" num="4.1">{tr("Evidence Grade Definitions")}</H3>
          <T headers={[tr("Grade"), tr("Definition"), tr("Confidence"), tr("Recommendation")]}
            rows={[
              [<strong>A</strong>, tr("Multiple high-quality RCTs"), tr("High"), tr("Strongly recommended")],
              [<strong>B</strong>, tr("Some RCTs or multiple cohort studies"), tr("Moderate"), tr("Recommended")],
              [<C>C</C>, tr("Case series, observational, extrapolated from human research"), tr("Low"), tr("May be considered")],
              [<C>EO</C>, tr("Consensus from experienced practitioners"), tr("Expert consensus"), tr("Clinical experience")],
            ]}
          />

          <H3 id="evidence-policy" num="4.2">{tr("Evidence Gating Policy")}</H3>
          <UL>
            <li>{tr("Protocols default to")} <strong>{tr("Grade A")}</strong> {tr("and")} <strong>{tr("Grade B")}</strong> {tr("exercises")}</li>
            <li>{tr("Grade C and EO exercises included")} <strong>{tr("only")}</strong> {tr("when no Grade A/B alternative exists")}</li>
            <li>{tr("Every exercise in protocol output")} <strong>{tr("must")}</strong> {tr("display its evidence grade")}</li>
            <li>{tr("Low-evidence exercises carry inline notation:")} <C>[{tr("Evidence: C — limited studies")}]</C></li>
          </UL>

          <H3 id="evidence-refs" num="4.3">{tr("Primary References")}</H3>
          <UL>
            <li>Millis DL, Levine D. (2014). <em>Canine Rehabilitation and Physical Therapy</em>, 2nd ed. Elsevier Saunders.</li>
            <li>Zink MC, Van Dyke JB. (2013). <em>Canine Sports Medicine and Rehabilitation</em>. Wiley-Blackwell.</li>
            <li>Monk et al. (2006). {tr("Early intensive post-TPLO physiotherapy outcomes")}</li>
            <li>Marsolais et al. (2003). {tr("Hind limb kinematics during swimming vs. walking in CCL rupture")}</li>
            <li>Drygas et al. (2011). {tr("Cold compression therapy post-TPLO")}</li>
            <li>Bockstahler et al. (2012). {tr("Sit-to-stand kinematics in hip OA; Cavaletti rail walking ROM increases")}</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 5: SAFETY ═══════════════════ */}
          <H2 id="red-flags" num={tr("Chapter 5.")}>{tr("Safety & Red Flags")}</H2>
          <H3 id="red-flags" num="5.1">{tr("Blocking Criteria")}</H3>
          <P>{tr("The following findings")} <strong>{tr("block protocol generation")}</strong> {tr("entirely:")}</P>
          <RedFlag>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{tr("Pain score ≥ 8/10")} &rarr; <strong>{tr("BLOCKS")}</strong> {tr("protocol generation")}</li>
              <li>{tr("Absent deep pain perception")} &rarr; <strong>{tr("BLOCKS")}</strong> {tr("protocol generation")}</li>
              <li>{tr("Incision complications (dehiscence, infection)")} &rarr; <strong>{tr("BLOCKS")}</strong> {tr("generation")}</li>
              <li>{tr("Lameness grade 5 (non-weight-bearing) → Restricted to passive exercises only")}</li>
            </ul>
          </RedFlag>

          <H3 id="escalation" num="5.2">{tr("Escalation Pathways")}</H3>
          <T headers={[tr("Trigger"), tr("Escalation Action")]}
            rows={[
              [tr("High pain (≥7/10)"), tr("Recommend pain management specialist consult")],
              [tr("Neurological grade IV-V"), tr("Recommend veterinary neurologist consult")],
              [tr("Post-op complications"), tr("Flag for surgeon re-evaluation")],
              [tr("Cardiac history + aquatic exercise"), tr("Recommend cardiology clearance")],
            ]}
          />
          <Note>{tr("All escalation recommendations are logged in the audit trail with patient ID, clinician ID, and timestamp.")}</Note>

          <H3 id="contraindications" num="5.3">{tr("Contraindication Gates")}</H3>
          <T headers={[tr("Condition"), tr("Excluded Exercise Types")]}
            rows={[
              [tr("Cardiac / heart disease"), tr("Aquatic, trot, jog, fetch, stairs, hills")],
              [tr("Respiratory / seizure / epilepsy"), tr("Aquatic therapy")],
              [tr("Open wound / infection"), tr("Aquatic, ultrasound")],
              [tr("Neoplasia / cancer / tumor"), tr("Ultrasound, laser")],
              [tr("Pregnant"), tr("Ultrasound, NMES, TENS, PEMF, shockwave")],
              [tr("Pacemaker / implant"), tr("NMES, TENS, PEMF, shockwave")],
              [tr("Wobbler / cervical / CSM"), tr("Fetch, water retrieve, pool swim")],
            ]}
          />

          <H3 id="wb-gates" num="5.4">{tr("Weight-Bearing Status Gates")}</H3>
          <T headers={[tr("Status"), tr("Excluded Exercises"), tr("Note")]}
            rows={[
              [<strong>NWB</strong>, tr("All dynamic exercises"), tr("UNDERWATER_TREAD retained (62% weight reduction)")],
              [<strong>TTWB</strong>, tr("High-load: sits, trots, jumping, stairs"), ""],
              [<strong>PWB</strong>, tr("High-impact/plyometric: trot, jog, fetch, stairs"), ""],
              [<strong>WBAT / FWB</strong>, tr("No exclusions"), tr("Full exercise library available")],
            ]}
          />

          <H3 id="incision-gates" num="5.5">{tr("Incision Status Gates")}</H3>
          <T headers={[tr("Incision Status"), tr("Action")]}
            rows={[
              [tr("Mild swelling"), tr("Monitor, allow most exercises")],
              [tr("Seroma"), tr("Exclude aquatic therapy")],
              [tr("Dehiscence"), tr("Exclude aquatic, sits, stairs")],
              [tr("Infection"), tr("Exclude aquatic; flag for vet review")],
            ]}
          />

          <HR />

          {/* ═══════════════════ CH 6: B.E.A.U. ═══════════════════ */}
          <H2 id="beau-overview" num={tr("Chapter 6.")}>B.E.A.U. {tr("AI Engine")}</H2>
          <H3 id="beau-overview" num="6.1">{tr("Overview")}</H3>
          <P><strong>B.E.A.U.</strong> ({tr("Biomedical Evidence-Based Analytical Unit")}) {tr("is the AI clinical assistant powered by Anthropic Claude.")} {tr("It provides streaming conversational support with patient context injection for real-time clinical guidance.")}</P>

          <H3 id="anti-hallucination" num="6.2">{tr("Anti-Hallucination Rules")}</H3>
          <P>{tr("These rules are")} <strong>{tr("non-negotiable")}</strong> {tr("and apply to all AI output:")}</P>
          <OL>
            <li><strong>{tr("Exercise Library Lock:")}</strong> {tr("Every exercise referenced must match an exercise code in the 260-exercise library.")} {tr("Unmatched exercise name = blocked output + clinician alert.")}</li>
            <li><strong>{tr("Dosing from Source Only:")}</strong> {tr("Sets, reps, duration, frequency, and intensity must be extracted from the source-of-truth document.")} B.E.A.U. {tr("must NOT generate novel dosing.")} {tr("If source doesn't specify: \"Dosing: Per clinician assessment\".")}</li>
            <li><strong>{tr("No Invented Clinical Data:")}</strong> {tr("Descriptions, contraindications, indications, evidence grades, and phase assignments must trace to source documents.")} {tr("Unknown values flagged as")} <C>[{tr("UNVERIFIED")}]</C>.</li>
            <li><strong>{tr("Post-Generation Verification:")}</strong> {tr("Every AI response referencing exercises is cross-checked against the exercise database before delivery.")} {tr("Novel exercise names trigger a block.")}</li>
            <li><strong>{tr("Confidence Transparency:")}</strong> {tr("When B.E.A.U. synthesizes recommendations (vs. quoting source), the output must indicate this distinction.")}</li>
            <li><strong>{tr("No Speculative Prognosis:")}</strong> {tr("Never predicts outcomes, timelines, or success rates unless directly quoting published literature with citation.")}</li>
          </OL>

          <H3 id="beau-scope" num="6.3">{tr("Scope Enforcement")}</H3>
          <P>B.E.A.U. {tr("enforces scope-of-practice boundaries at the AI layer.")} {tr("Out-of-scope queries (diagnosis requests, medication advice, prognosis predictions) are blocked with an explanation of why the query falls outside platform scope.")}</P>

          {/* Footer with Copyright */}
          <HR />
          <div className="border border-slate-200 rounded-lg p-5 mt-4 bg-slate-50/50">
            <div className="text-[13px] font-semibold text-[#0F4C81] mb-2">{tr("Proprietary & Confidential")}</div>
            <div className="text-[11px] text-slate-500 leading-relaxed mb-3">
              {tr("This platform, all clinical logic, exercise data, protocol rules, B.E.A.U. AI engine, and associated intellectual property are the proprietary property of Salvatore Bonanno.")}{" "}
              {tr("Unauthorized use, reproduction, distribution, reverse engineering, or modification is strictly prohibited.")}
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed mb-3">
              {tr("K9 Rehab Pro is classified as a Clinical Decision-Support System (CDSS) for post-diagnostic rehabilitation planning.")}{" "}
              {tr("It does not diagnose, prescribe, or replace licensed veterinary judgment.")}{" "}
              {tr("All protocols require licensed veterinarian review and approval before clinical application.")}
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-slate-200">
              <div>
                <div className="text-[12px] font-bold text-[#0F4C81]">&copy; 2025-2026 Salvatore Bonanno</div>
                <div className="text-[10px] text-slate-400">{tr("Canine Rehabilitation Nurse (CCRN) | Software Developer | Founder")}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">K9 Rehab Pro&trade;</div>
                <div className="text-[10px] text-slate-400">{tr("Powered by")} B.E.A.U. ({tr("Biomedical Evidence-Based Analytical Unit")})</div>
                <div className="text-[10px] text-slate-300">{tr("All Rights Reserved")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
