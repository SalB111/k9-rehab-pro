import React, { useState, useRef } from "react";
import { FiChevronRight, FiBook, FiArrowLeft, FiAlertTriangle, FiInfo, FiShield } from "react-icons/fi";

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
      { id: "exercise-overview", label: "3.1 Library Overview (223)" },
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
  {
    title: "Chapter 7. Audit & Defensibility",
    items: [
      { id: "audit-logging", label: "7.1 Audit Log Requirements" },
      { id: "protocol-docs", label: "7.2 Protocol Documentation" },
      { id: "litigation", label: "7.3 Litigation Defensibility" },
      { id: "outcome-monitoring", label: "7.4 Outcome Monitoring" },
    ],
  },
  {
    title: "Chapter 8. Regulatory Framework",
    items: [
      { id: "classification", label: "8.1 CDSS Classification" },
      { id: "regulatory-refs", label: "8.2 Regulatory References" },
      { id: "compliance", label: "8.3 Compliance Requirements" },
      { id: "adverse-events", label: "8.4 Adverse Event Reporting" },
    ],
  },
  {
    title: "Appendix A. API Reference",
    items: [
      { id: "api-auth", label: "A.1 Authentication" },
      { id: "api-clinical", label: "A.2 Clinical Core" },
      { id: "api-exercises", label: "A.3 Exercise Library" },
      { id: "api-patients", label: "A.4 Patients" },
      { id: "api-beau", label: "A.5 B.E.A.U." },
    ],
  },
  {
    title: "Appendix B. Implementation Tiers",
    items: [
      { id: "tier1", label: "B.1 Tier 1 — Clinical Use" },
      { id: "tier2", label: "B.2 Tier 2 — Regulatory" },
      { id: "tier3", label: "B.3 Tier 3 — Enterprise" },
    ],
  },
];

/* ── Reusable sub-components ── */
function Note({ children }) {
  return (
    <div className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-500 rounded p-3 mb-4 text-sm">
      <div className="flex items-center gap-1.5 font-bold text-blue-600 mb-1"><FiInfo className="w-3.5 h-3.5" /> Note</div>
      {children}
    </div>
  );
}

function Warning({ children }) {
  return (
    <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-orange-500 rounded p-3 mb-4 text-sm">
      <div className="flex items-center gap-1.5 font-bold text-orange-600 mb-1"><FiAlertTriangle className="w-3.5 h-3.5" /> Important</div>
      {children}
    </div>
  );
}

function RedFlag({ children }) {
  return (
    <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-600 rounded p-3 mb-4 text-sm">
      <div className="flex items-center gap-1.5 font-bold text-red-700 mb-1"><FiShield className="w-3.5 h-3.5" /> Safety Block</div>
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
  const colors = { blue: "border-blue-400 bg-blue-50", green: "border-green-400 bg-green-50", amber: "border-amber-400 bg-amber-50", purple: "border-purple-400 bg-purple-50" };
  return (
    <div className={`border-l-4 rounded p-3 mb-3 text-sm ${colors[color] || colors.blue}`}>
      <div className="font-bold text-slate-800">Phase {phase}: {name} <span className="font-normal text-slate-500">({weeks})</span></div>
      <div className="text-slate-600 mt-1">{goals}</div>
    </div>
  );
}

/* ── Nav Section ── */
function NavSection({ section, activeId, onSelect, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="mb-0.5">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 w-full px-5 py-1.5 text-left font-semibold text-slate-800 hover:bg-slate-200/60 text-[13.5px]">
        <FiChevronRight className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
        <span className="truncate">{section.title}</span>
      </button>
      {open && (
        <div className="pl-4">
          {section.items.map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)} className={`block w-full text-left px-5 py-1 text-[13px] leading-snug transition-colors ${activeId === item.id ? "text-blue-600 font-semibold bg-blue-50 border-r-[3px] border-blue-600" : "text-slate-500 hover:text-blue-600 hover:bg-slate-100"}`}>
              {item.label}
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
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0F4C81] flex items-center justify-center">
              <FiBook className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-[#0F4C81]">K9 Rehab Pro Documentation</span>
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
            <button onClick={() => setView("dashboard")} className="text-blue-600 hover:underline">Home</button>
            {" > "}
            <span className="text-slate-500">Documentation</span>
            {" > "}
            <span className="text-slate-500">K9 Rehab Pro Clinical Reference</span>
          </div>

          <h1 className="text-[26px] font-bold text-[#0F4C81] mb-2 pb-3 border-b-2 border-slate-200">
            K9 Rehab Pro&trade; Clinical Reference
          </h1>
          <div className="text-[13px] text-slate-400 mb-6 flex flex-wrap gap-4">
            <span>4 Conditions</span>
            <span>16 Phases</span>
            <span>52 Protocol Exercises</span>
            <span>223 Exercise Library</span>
            <span>Full Modality Integration</span>
          </div>

          {/* ═══════════════════ OVERVIEW ═══════════════════ */}
          <H2 id="about">About K9 Rehab Pro</H2>
          <P>K9 Rehab Pro is a veterinary rehabilitation intelligence platform and <strong>Clinical Decision-Support System (CDSS)</strong> for post-diagnostic rehabilitation planning. Built from 30 years of veterinary nursing experience, every protocol, phase gate, and clinical rule originates from real clinical work with real patients.</P>
          <P>The platform implements ACVSMR diplomate methodology aligned with Millis &amp; Levine textbook standards, providing evidence-based canine rehabilitation protocols across four primary conditions with phase-gated progression.</P>

          <H3 id="cdss">CDSS Classification</H3>
          <P>K9 Rehab Pro is classified as a Clinical Decision-Support System, <strong>not</strong> a medical device. It does not claim FDA/USDA device classification or AVMA endorsement. The platform aligns with AVMA Model Veterinary Practice Act principles and ACVSMR certification standards.</P>
          <Warning>No protocol output is valid without licensed veterinarian review and approval. The platform retains no liability for clinical outcomes &mdash; the licensee assumes full professional responsibility.</Warning>

          <H3 id="scope">Scope of Practice</H3>
          <H4>In Scope</H4>
          <UL>
            <li>Rehabilitation protocol generation for <strong>diagnosed conditions</strong></li>
            <li>Exercise selection, dosing, and progression from the validated 223-exercise library</li>
            <li>Phase-gated progression based on clinical assessment criteria</li>
            <li>Clinical education and evidence reference</li>
          </UL>
          <H4>Out of Scope &mdash; The Platform NEVER:</H4>
          <UL>
            <li>Diagnoses conditions or diseases</li>
            <li>Prescribes medication or pharmaceutical interventions</li>
            <li>Establishes or replaces the Veterinarian-Client-Patient Relationship (VCPR)</li>
            <li>Overrides licensed veterinary judgment</li>
            <li>Provides emergency or urgent care guidance</li>
            <li>Makes prognosis determinations</li>
          </UL>
          <RedFlag>Any feature, AI output, or code path that crosses scope boundaries is <strong>blocked</strong>, not just disclaimed.</RedFlag>

          <H3 id="credentials">Credentials &amp; Access</H3>
          <T headers={["Role", "Access Level", "Clinical Sign-Off"]}
            rows={[
              ["DVM (Doctor of Veterinary Medicine)", "Full access, protocol approval", "Can approve protocols"],
              ["CCRP / CCRT (Certified Rehab Practitioner/Therapist)", "Full access, protocol generation", "Can approve under DVM supervision"],
              ["Veterinary Technician (supervised)", "Protocol execution, exercise logging", "Cannot approve protocols"],
              ["Student", "View only, flagged for audit oversight", "No clinical authority"],
            ]}
          />

          <H3 id="evidence-foundation">Evidence-Based Foundation</H3>
          <UL>
            <li><strong>ACVSMR</strong> &mdash; American College of Veterinary Sports Medicine and Rehabilitation diplomate methodology</li>
            <li><strong>Millis &amp; Levine (2014)</strong> &mdash; Canine Rehabilitation and Physical Therapy, 2nd ed.</li>
            <li><strong>Zink &amp; Van Dyke (2013)</strong> &mdash; Canine Sports Medicine and Rehabilitation</li>
            <li><strong>McGonagle et al. (2018)</strong> &mdash; Physical Rehabilitation in Veterinary Medicine</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 1: PROTOCOLS ═══════════════════ */}
          <H2 id="protocol-overview" num="Chapter 1.">Clinical Protocols</H2>
          <H3 id="protocol-overview" num="1.1">Protocol Architecture</H3>
          <P>K9 Rehab Pro implements a <strong>4-condition &times; 4-phase</strong> system with gated progression (16 total phases). Each protocol is mapped to specific diagnoses with evidence-based exercise selection per phase.</P>
          <T headers={["Protocol", "Duration", "Phases", "Primary Indications"]}
            rows={[
              ["TPLO Post-Op", "16 weeks", "4", "TPLO, TTA, CCL repair, meniscal, patellar luxation"],
              ["IVDD Recovery", "12 weeks", "4", "IVDD, FCE, myelopathy, lumbosacral, cauda equina, wobbler syndrome"],
              ["Osteoarthritis (OA)", "16 weeks", "4", "Hip/elbow dysplasia, OA, fractures, FHO, THR, soft tissue injury"],
              ["Geriatric Mobility", "16 weeks", "4", "Age-related decline, sarcopenia, cognitive decline, palliative, amputation"],
            ]}
          />

          <H3 id="tplo" num="1.2">TPLO Post-Op Rehabilitation (16 weeks)</H3>
          <PhaseCard phase={1} name="Acute Protection" weeks="Weeks 0-2" goals="Pain control, inflammation management, passive ROM, incision monitoring" color="blue" />
          <PhaseCard phase={2} name="Early Mobilization" weeks="Weeks 2-6" goals="Restore weight bearing, begin active ROM, controlled leash walks, early strengthening" color="green" />
          <PhaseCard phase={3} name="Controlled Strengthening" weeks="Weeks 6-12" goals="Rebuild muscle mass, dynamic stability, advanced proprioception, aquatic therapy" color="amber" />
          <PhaseCard phase={4} name="Return to Function" weeks="Weeks 12-16+" goals="Full restoration, sport-specific conditioning, symmetrical gait, off-leash progression" color="purple" />

          <H3 id="ivdd" num="1.3">IVDD Recovery (12 weeks)</H3>
          <PhaseCard phase={1} name="Strict Rest & Pain Control" weeks="Weeks 0-2" goals="Reduce inflammation, manage neuropathic pain, strict confinement" color="blue" />
          <PhaseCard phase={2} name="Neuromotor Re-Education" weeks="Weeks 2-6" goals="Restore proprioceptive awareness, voluntary motor control, assisted standing" color="green" />
          <PhaseCard phase={3} name="Functional Strengthening" weeks="Weeks 6-9" goals="Improve gait quality, strengthen core and limbs, balance work" color="amber" />
          <PhaseCard phase={4} name="Maintenance & Prevention" weeks="Weeks 10-12+" goals="Spinal health, weight management, activity modification, owner education" color="purple" />

          <H3 id="oa" num="1.4">Osteoarthritis Management (16 weeks)</H3>
          <PhaseCard phase={1} name="Pain Control & Baseline" weeks="Weeks 0-4" goals="Establish baseline, reduce flare, gentle controlled movement" color="blue" />
          <PhaseCard phase={2} name="Progressive Mobility" weeks="Weeks 4-8" goals="Improve ROM, build endurance, strengthen stabilizers" color="green" />
          <PhaseCard phase={3} name="Functional Optimization" weeks="Weeks 8-12" goals="Maximize joint function, build endurance, optimize body composition" color="amber" />
          <PhaseCard phase={4} name="Lifelong Maintenance" weeks="Weeks 12-16+" goals="Sustain gains, prevent deconditioning, manage flares" color="purple" />

          <H3 id="geriatric" num="1.5">Geriatric Mobility Decline (16 weeks)</H3>
          <PhaseCard phase={1} name="Assessment & Gentle Activation" weeks="Weeks 0-4" goals="Baseline assessment, pain management, gentle controlled movement" color="blue" />
          <PhaseCard phase={2} name="Functional Strengthening" weeks="Weeks 4-10" goals="Combat sarcopenia, improve balance, increase endurance" color="green" />
          <PhaseCard phase={3} name="Balance & Independence" weeks="Weeks 10-12" goals="Maximize functional independence, fall prevention" color="amber" />
          <PhaseCard phase={4} name="Lifelong Quality of Life" weeks="Weeks 12-16+" goals="Sustain capacity, adapt to decline, support end-of-life decisions" color="purple" />

          <H3 id="protocol-routing" num="1.6">Protocol Routing Logic</H3>
          <P>Diagnoses are automatically routed to the appropriate protocol:</P>
          <T headers={["Diagnosis Category", "Routed Protocol"]}
            rows={[
              ["Palliative approach (any diagnosis)", "Geriatric"],
              ["Amputation (any location)", "Geriatric (compensatory strength)"],
              ["TPLO, TTA, CCL, meniscal, patellar luxation", "TPLO"],
              ["FHO, THR, hip luxation, Legg-Perthes", "OA"],
              ["Vestibular disease", "OA (inner ear, not spine)"],
              ["IVDD, FCE, myelopathy, lumbosacral, wobbler, neuropathy", "IVDD"],
              ["Geriatric decline, sarcopenia, cognitive decline", "Geriatric"],
              ["Hip/elbow dysplasia, OA, fractures, soft tissue (default)", "OA"],
            ]}
          />

          <HR />

          {/* ═══════════════════ CH 2: PHASE PROGRESSION ═══════════════════ */}
          <H2 id="phase-overview" num="Chapter 2.">Phase Progression</H2>
          <H3 id="phase-overview" num="2.1">Phase Model</H3>
          <P>Phase progression is <strong>gated</strong> &mdash; a patient cannot advance to the next phase until all gate criteria are met. Each gate requires clinical assessment by the supervising clinician.</P>
          <T headers={["Phase", "Timeframe", "Primary Goals"]}
            rows={[
              ["Acute", "0-72 hours post-injury/surgery", "Pain control, inflammation management, tissue protection"],
              ["Subacute", "3 days - 6 weeks", "Restore ROM, begin strengthening, neuromuscular re-education"],
              ["Recovery", "6-12 weeks", "Restore strength, functional training, return to activity"],
              ["Maintenance", "12+ weeks", "Maintain gains, prevent deconditioning, quality of life"],
            ]}
          />

          <H3 id="tplo-gates" num="2.2">TPLO Progression Gates</H3>
          <H4>Phase 1 &rarr; Phase 2</H4>
          <UL>
            <li>Willingness to bear weight on the affected limb</li>
            <li>Incision healing without complications</li>
            <li>Pain score &lt;3/10</li>
            <li>No increase in joint effusion</li>
          </UL>
          <H4>Phase 2 &rarr; Phase 3</H4>
          <UL>
            <li>Consistent weight bearing at walk</li>
            <li>Thigh circumference loss &lt;1 cm vs. contralateral</li>
            <li>Passive ROM within 10&deg; of opposite limb</li>
          </UL>
          <H4>Phase 3 &rarr; Phase 4</H4>
          <UL>
            <li>Thigh circumference within 0.5 cm of contralateral</li>
            <li>Full passive ROM restored</li>
            <li>No lameness at walk or trot</li>
            <li>Radiographic confirmation of healing</li>
          </UL>

          <H3 id="ivdd-gates" num="2.3">IVDD Progression Gates</H3>
          <H4>Phase 1 &rarr; Phase 2</H4>
          <UL>
            <li>Pain &lt;2/10 at rest</li>
            <li>Voluntary movement present</li>
            <li>Proprioceptive placing present</li>
            <li>Veterinary clearance obtained</li>
          </UL>
          <H4>Phase 2 &rarr; Phase 3</H4>
          <UL>
            <li>Voluntary weight bearing without sling assistance</li>
            <li>Conscious proprioceptive placing in all 4 limbs</li>
            <li>Ambulatory status achieved</li>
          </UL>
          <H4>Phase 3 &rarr; Phase 4</H4>
          <UL>
            <li>Non-ataxic gait at walk</li>
            <li>Core stability &gt;30 seconds on unstable surface</li>
            <li>No pain on spinal palpation</li>
          </UL>

          <H3 id="oa-gates" num="2.4">OA Progression Gates</H3>
          <UL>
            <li><strong>Phase 1&rarr;2:</strong> Pain &lt;3/10, baseline ROM established, weight management plan initiated</li>
            <li><strong>Phase 2&rarr;3:</strong> Improved ROM, consistent exercise tolerance, reduced lameness grade</li>
            <li><strong>Phase 3&rarr;4:</strong> Functional goals met, owner independent with home program</li>
          </UL>

          <H3 id="geriatric-gates" num="2.5">Geriatric Progression Gates</H3>
          <UL>
            <li><strong>Phase 1&rarr;2:</strong> Baseline established, pain managed, tolerance for gentle activity</li>
            <li><strong>Phase 2&rarr;3:</strong> Improved strength measures, reduced fall risk, endurance gains</li>
            <li><strong>Phase 3&rarr;4:</strong> Home program established, owner educated, 3-6 month recheck scheduled</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 3: EXERCISE LIBRARY ═══════════════════ */}
          <H2 id="exercise-overview" num="Chapter 3.">Exercise Library</H2>
          <H3 id="exercise-overview" num="3.1">Library Overview</H3>
          <P>The exercise library contains <strong>223 evidence-based exercises</strong> with 52 mapped directly to protocol phases. Every exercise includes standardized metadata for clinical decision support.</P>

          <H3 id="exercise-structure" num="3.2">Exercise Data Structure</H3>
          <P>Each exercise entry contains the following fields:</P>
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

          <H3 id="intervention-types" num="3.3">Intervention Categories</H3>
          <T headers={["Category", "CPT Code", "Description"]}
            rows={[
              ["Passive Modality", "97140", "Therapist-applied: PROM, stretching, cryo, thermo"],
              ["Active Therapeutic", "97110", "Patient performs: active-assisted, active, active-resisted"],
              ["Strengthening & Resistance", "97110", "Progressive resistance: isometric, isotonic, plyometric"],
              ["Neuromuscular Retraining", "97112", "Balance, proprioception, coordination, gait training"],
              ["Aquatic Hydrotherapy", "97530", "UWTM, swimming, whirlpool, contrast therapy"],
              ["Manual Therapy", "97140", "Massage, mobilization, myofascial release, trigger point"],
              ["Therapeutic Modalities", "97032-97039", "Laser, TENS, NMES, ultrasound, e-stim"],
              ["Functional Rehabilitation", "97530", "ADL training, sport-specific, return to function"],
            ]}
          />

          <H3 id="exercise-examples" num="3.4">Key Exercise Examples</H3>
          <H4>PROM_STIFLE &mdash; Passive Range of Motion (Stifle)</H4>
          <UL>
            <li><strong>Category:</strong> Passive Therapy | <strong>Difficulty:</strong> Easy</li>
            <li><strong>Equipment:</strong> Cushioned surface, treat rewards</li>
            <li><strong>Contraindications:</strong> Acute fracture, unstable joint, severe inflammation, &lt;48hr post-surgery</li>
            <li><strong>Red Flags:</strong> Vocalization, muscle spasm, swelling increase, ROM loss, joint instability</li>
          </UL>
          <H4>SIT_STAND &mdash; Sit-to-Stand Exercise</H4>
          <UL>
            <li><strong>Dosing:</strong> 5-10 reps &times; 2-3 sets, 2x/day</li>
            <li><strong>Progression:</strong> Slow tempo, incline surface</li>
            <li><strong>Protocols:</strong> TPLO Phase 2+, IVDD Phase 2+, OA Phase 2+, Geriatric Phase 2+</li>
          </UL>
          <H4>UNDERWATER_TREAD &mdash; Underwater Treadmill</H4>
          <UL>
            <li><strong>Dosing:</strong> 5-20 min, 2-3x/week</li>
            <li><strong>Equipment gating:</strong> Requires UWTM access flag</li>
            <li><strong>Note:</strong> NOT excluded for NWB patients &mdash; provides 62% weight reduction at hip depth</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 4: EVIDENCE ═══════════════════ */}
          <H2 id="evidence-grades" num="Chapter 4.">Evidence Grading</H2>
          <H3 id="evidence-grades" num="4.1">Evidence Grade Definitions</H3>
          <T headers={["Grade", "Definition", "Confidence", "Recommendation"]}
            rows={[
              [<strong>A</strong>, "Multiple high-quality RCTs", "High", "Strongly recommended"],
              [<strong>B</strong>, "Some RCTs or multiple cohort studies", "Moderate", "Recommended"],
              [<C>C</C>, "Case series, observational, extrapolated from human research", "Low", "May be considered"],
              [<C>EO</C>, "Consensus from experienced practitioners", "Expert consensus", "Clinical experience"],
            ]}
          />

          <H3 id="evidence-policy" num="4.2">Evidence Gating Policy</H3>
          <UL>
            <li>Protocols default to <strong>Grade A</strong> and <strong>Grade B</strong> exercises</li>
            <li>Grade C and EO exercises included <strong>only</strong> when no Grade A/B alternative exists</li>
            <li>Every exercise in protocol output <strong>must</strong> display its evidence grade</li>
            <li>Low-evidence exercises carry inline notation: <C>[Evidence: C &mdash; limited studies]</C></li>
          </UL>

          <H3 id="evidence-refs" num="4.3">Primary References</H3>
          <UL>
            <li>Millis DL, Levine D. (2014). <em>Canine Rehabilitation and Physical Therapy</em>, 2nd ed. Elsevier Saunders.</li>
            <li>Zink MC, Van Dyke JB. (2013). <em>Canine Sports Medicine and Rehabilitation</em>. Wiley-Blackwell.</li>
            <li>Monk et al. (2006). Early intensive post-TPLO physiotherapy outcomes</li>
            <li>Marsolais et al. (2003). Hind limb kinematics during swimming vs. walking in CCL rupture</li>
            <li>Drygas et al. (2011). Cold compression therapy post-TPLO</li>
            <li>Bockstahler et al. (2012). Sit-to-stand kinematics in hip OA; Cavaletti rail walking ROM increases</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 5: SAFETY ═══════════════════ */}
          <H2 id="red-flags" num="Chapter 5.">Safety &amp; Red Flags</H2>
          <H3 id="red-flags" num="5.1">Blocking Criteria</H3>
          <P>The following findings <strong>block protocol generation</strong> entirely:</P>
          <RedFlag>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Pain score &ge; 8/10 &rarr; <strong>BLOCKS</strong> protocol generation</li>
              <li>Absent deep pain perception &rarr; <strong>BLOCKS</strong> protocol generation</li>
              <li>Incision complications (dehiscence, infection) &rarr; <strong>BLOCKS</strong> generation</li>
              <li>Lameness grade 5 (non-weight-bearing) &rarr; Restricted to passive exercises only</li>
            </ul>
          </RedFlag>

          <H3 id="escalation" num="5.2">Escalation Pathways</H3>
          <T headers={["Trigger", "Escalation Action"]}
            rows={[
              ["High pain (\u22657/10)", "Recommend pain management specialist consult"],
              ["Neurological grade IV-V", "Recommend veterinary neurologist consult"],
              ["Post-op complications", "Flag for surgeon re-evaluation"],
              ["Cardiac history + aquatic exercise", "Recommend cardiology clearance"],
            ]}
          />
          <Note>All escalation recommendations are logged in the audit trail with patient ID, clinician ID, and timestamp.</Note>

          <H3 id="contraindications" num="5.3">Contraindication Gates</H3>
          <T headers={["Condition", "Excluded Exercise Types"]}
            rows={[
              ["Cardiac / heart disease", "Aquatic, trot, jog, fetch, stairs, hills"],
              ["Respiratory / seizure / epilepsy", "Aquatic therapy"],
              ["Open wound / infection", "Aquatic, ultrasound"],
              ["Neoplasia / cancer / tumor", "Ultrasound, laser"],
              ["Pregnant", "Ultrasound, NMES, TENS, PEMF, shockwave"],
              ["Pacemaker / implant", "NMES, TENS, PEMF, shockwave"],
              ["Wobbler / cervical / CSM", "Fetch, water retrieve, pool swim"],
            ]}
          />

          <H3 id="wb-gates" num="5.4">Weight-Bearing Status Gates</H3>
          <T headers={["Status", "Excluded Exercises", "Note"]}
            rows={[
              [<strong>NWB</strong>, "All dynamic exercises", "UNDERWATER_TREAD retained (62% weight reduction)"],
              [<strong>TTWB</strong>, "High-load: sits, trots, jumping, stairs", ""],
              [<strong>PWB</strong>, "High-impact/plyometric: trot, jog, fetch, stairs", ""],
              [<strong>WBAT / FWB</strong>, "No exclusions", "Full exercise library available"],
            ]}
          />

          <H3 id="incision-gates" num="5.5">Incision Status Gates</H3>
          <T headers={["Incision Status", "Action"]}
            rows={[
              ["Mild swelling", "Monitor, allow most exercises"],
              ["Seroma", "Exclude aquatic therapy"],
              ["Dehiscence", "Exclude aquatic, sits, stairs"],
              ["Infection", "Exclude aquatic; flag for vet review"],
            ]}
          />

          <HR />

          {/* ═══════════════════ CH 6: B.E.A.U. ═══════════════════ */}
          <H2 id="beau-overview" num="Chapter 6.">B.E.A.U. AI Engine</H2>
          <H3 id="beau-overview" num="6.1">Overview</H3>
          <P><strong>B.E.A.U.</strong> (Biomedical Evidence-Based Assessment Utility) is the AI clinical assistant powered by Anthropic Claude. It provides streaming conversational support with patient context injection for real-time clinical guidance.</P>

          <H3 id="anti-hallucination" num="6.2">Anti-Hallucination Rules</H3>
          <P>These rules are <strong>non-negotiable</strong> and apply to all AI output:</P>
          <OL>
            <li><strong>Exercise Library Lock:</strong> Every exercise referenced must match an exercise code in the 223-exercise library. Unmatched exercise name = blocked output + clinician alert.</li>
            <li><strong>Dosing from Source Only:</strong> Sets, reps, duration, frequency, and intensity must be extracted from the source-of-truth document. B.E.A.U. must NOT generate novel dosing. If source doesn't specify: "Dosing: Per clinician assessment".</li>
            <li><strong>No Invented Clinical Data:</strong> Descriptions, contraindications, indications, evidence grades, and phase assignments must trace to source documents. Unknown values flagged as <C>[UNVERIFIED]</C>.</li>
            <li><strong>Post-Generation Verification:</strong> Every AI response referencing exercises is cross-checked against the exercise database before delivery. Novel exercise names trigger a block.</li>
            <li><strong>Confidence Transparency:</strong> When B.E.A.U. synthesizes recommendations (vs. quoting source), the output must indicate this distinction.</li>
            <li><strong>No Speculative Prognosis:</strong> Never predicts outcomes, timelines, or success rates unless directly quoting published literature with citation.</li>
          </OL>

          <H3 id="beau-scope" num="6.3">Scope Enforcement</H3>
          <P>B.E.A.U. enforces scope-of-practice boundaries at the AI layer. Out-of-scope queries (diagnosis requests, medication advice, prognosis predictions) are blocked with an explanation of why the query falls outside platform scope.</P>

          <HR />

          {/* ═══════════════════ CH 7: AUDIT ═══════════════════ */}
          <H2 id="audit-logging" num="Chapter 7.">Audit &amp; Defensibility</H2>
          <H3 id="audit-logging" num="7.1">Audit Log Requirements</H3>
          <UL>
            <li>All POST, PUT, DELETE operations logged automatically</li>
            <li>Red-flag triggers logged per patient per protocol</li>
            <li>B.E.A.U. queries and responses logged with session ID</li>
            <li>Protocol modifications tracked as diffs (original vs. approved)</li>
            <li>Logs retained minimum <strong>7 years</strong></li>
            <li>Audit log is <strong>immutable</strong> (append-only)</li>
          </UL>

          <H3 id="protocol-docs" num="7.2">Protocol Documentation Standard</H3>
          <P>Every generated protocol retains:</P>
          <UL>
            <li>Generation metadata: timestamp, algorithm version, clinician ID, patient ID</li>
            <li>Input snapshot: all intake parameters used for generation</li>
            <li>Red flags evaluated: complete list of flags checked and their values</li>
            <li>Contraindications checked: categories evaluated and pass/fail status</li>
            <li>Evidence grades: per-exercise evidence level</li>
            <li>Version control: if modified post-generation, both Original and Approved versions retained</li>
          </UL>

          <H3 id="litigation" num="7.3">Litigation Defensibility</H3>
          <UL>
            <li>Unsigned protocols carry watermark: <C>DRAFT &mdash; NOT APPROVED FOR CLINICAL USE</C></li>
            <li>Signed protocols show: clinician name, credential type, approval timestamp</li>
            <li>Decision rationale available per exercise: "Selected because: Phase 2 + TPLO indication + Grade B evidence + no contraindications"</li>
          </UL>

          <H3 id="outcome-monitoring" num="7.4">Outcome Monitoring</H3>
          <UL>
            <li>Reassessment prompts at 2-week and 4-week intervals</li>
            <li>Validated measures: CBPI (Canine Brief Pain Inventory), lameness grading, goniometric ROM</li>
            <li>Alert if regression: increased pain, decreased ROM, increased lameness grade</li>
            <li>Stalled progress (no improvement after 4 weeks) triggers protocol review recommendation</li>
          </UL>

          <HR />

          {/* ═══════════════════ CH 8: REGULATORY ═══════════════════ */}
          <H2 id="classification" num="Chapter 8.">Regulatory Framework</H2>
          <H3 id="classification" num="8.1">CDSS Classification</H3>
          <P>K9 Rehab Pro is classified as a <strong>Clinical Decision-Support System (CDSS)</strong>. It does not claim FDA/USDA device classification or AVMA endorsement.</P>

          <H3 id="regulatory-refs" num="8.2">Regulatory References</H3>
          <UL>
            <li><strong>AVMA Model Veterinary Practice Act</strong> &mdash; scope-of-practice definitions</li>
            <li><strong>ACVSMR</strong> &mdash; certification and methodology standards</li>
            <li><strong>State Veterinary Practice Acts</strong> &mdash; jurisdiction-specific requirements</li>
            <li><strong>AAHA</strong> &mdash; practice standards reference</li>
          </UL>

          <H3 id="compliance" num="8.3">Compliance Requirements</H3>
          <UL>
            <li>All protocol output includes CDSS classification disclaimer</li>
            <li>Terms of Service accepted before first protocol generation</li>
            <li>Disclaimer refresh required every 90 days for active users</li>
            <li>No protocol output valid without licensed veterinarian review and approval</li>
          </UL>

          <H3 id="adverse-events" num="8.4">Adverse Event Reporting</H3>
          <UL>
            <li>UI includes "Report Safety Concern" mechanism</li>
            <li>Adverse events logged with: patient ID, protocol version, exercise code, event description, clinician ID, timestamp</li>
            <li>Adverse event logs retained for minimum 7 years</li>
          </UL>

          <HR />

          {/* ═══════════════════ APPENDIX A: API ═══════════════════ */}
          <H2 id="api-auth" num="Appendix A.">API Reference</H2>
          <H3 id="api-auth" num="A.1">Authentication</H3>
          <T headers={["Method", "Endpoint", "Description"]}
            rows={[
              [<C>POST</C>, <C>/api/auth/register</C>, "Register new user"],
              [<C>POST</C>, <C>/api/auth/login</C>, "Login, returns JWT"],
              [<C>GET</C>, <C>/api/auth/me</C>, "Current user info (requires auth)"],
              [<C>GET</C>, <C>/api/auth/status</C>, "Auth system status (public)"],
            ]}
          />

          <H3 id="api-clinical" num="A.2">Clinical Core</H3>
          <T headers={["Method", "Endpoint", "Description"]}
            rows={[
              [<C>GET</C>, <C>/api/health</C>, "Health check (public)"],
              [<C>GET</C>, <C>/api/conditions</C>, "All supported conditions"],
              [<C>GET</C>, <C>/api/conditions/grouped</C>, "Conditions by category"],
              [<C>POST</C>, <C>/api/generate-protocol</C>, "Generate rehabilitation protocol"],
            ]}
          />

          <H3 id="api-exercises" num="A.3">Exercise Library</H3>
          <T headers={["Method", "Endpoint", "Description"]}
            rows={[
              [<C>GET</C>, <C>/api/exercises</C>, "All exercises with full details"],
              [<C>GET</C>, <C>/api/exercises/search?q=</C>, "Search exercises by keyword"],
              [<C>GET</C>, <C>/api/exercises/:code</C>, "Single exercise by code"],
              [<C>GET</C>, <C>/api/exercises/by-phase/:phase</C>, "Filter by rehab phase"],
              [<C>GET</C>, <C>/api/exercises/by-evidence-grade/:grade</C>, "Filter by evidence grade"],
              [<C>GET</C>, <C>/api/taxonomy</C>, "Full taxonomy (interventions, phases, indications)"],
            ]}
          />

          <H3 id="api-patients" num="A.4">Patients</H3>
          <T headers={["Method", "Endpoint", "Description"]}
            rows={[
              [<C>GET</C>, <C>/api/patients</C>, "List all patients"],
              [<C>POST</C>, <C>/api/patients</C>, "Create patient"],
              [<C>DELETE</C>, <C>/api/patients/:id</C>, "Delete patient"],
            ]}
          />

          <H3 id="api-beau" num="A.5">B.E.A.U. AI Engine</H3>
          <T headers={["Method", "Endpoint", "Description"]}
            rows={[
              [<C>POST</C>, <C>/api/beau/chat</C>, "Streaming AI chat with patient context"],
              [<C>GET</C>, <C>/api/beau/status</C>, "Check if B.E.A.U. is configured"],
              [<C>GET</C>, <C>/api/beau/sessions</C>, "Load chat session history"],
              [<C>POST</C>, <C>/api/beau/sessions</C>, "Save chat session"],
              [<C>GET</C>, <C>/api/beau/intelligence</C>, "Aggregate case intelligence"],
            ]}
          />

          <HR />

          {/* ═══════════════════ APPENDIX B: TIERS ═══════════════════ */}
          <H2 id="tier1" num="Appendix B.">Implementation Tiers</H2>
          <H3 id="tier1" num="B.1">Tier 1 &mdash; Required Before Clinical Use</H3>
          <UL>
            <li>Credential verification at registration (DVM/CCRP/CCRT/student attestation)</li>
            <li>Scope-of-practice enforcement in B.E.A.U.</li>
            <li>B.E.A.U. exercise name cross-check against 223-exercise library</li>
            <li>Terms of Service sign-off on first login</li>
            <li>Evidence grade display on every exercise in protocol output</li>
            <li>Red-flag audit logging per patient per protocol</li>
          </UL>

          <H3 id="tier2" num="B.2">Tier 2 &mdash; Required for Regulatory Defensibility</H3>
          <UL>
            <li>AVMA/state board compliance reference in UI</li>
            <li>Protocol versioning (Original vs. Approved with diff tracking)</li>
            <li>B.E.A.U. dosing extraction from source doc (not AI-generated)</li>
            <li>Outcome tracking with reassessment prompts</li>
            <li>Specialist escalation pathways for high-risk flags</li>
            <li>Adverse event reporting mechanism</li>
          </UL>

          <H3 id="tier3" num="B.3">Tier 3 &mdash; Required for Enterprise/University Deployment</H3>
          <UL>
            <li>Role-based clinical access (DVM approve / technician execute / student view)</li>
            <li>Semantic hallucination detection on B.E.A.U. responses</li>
            <li>Confidence scoring per AI recommendation</li>
            <li>Decision rationale per exercise selection</li>
            <li>Multi-language support &amp; WCAG AA accessibility compliance</li>
          </UL>

          {/* Footer */}
          <HR />
          <div className="flex justify-between text-[13px] text-slate-400 pt-2">
            <span>&copy; 2025 Salvatore Bonanno. All rights reserved.</span>
            <span className="text-slate-300">K9 Rehab Pro&trade; | B.E.A.U. AI Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
