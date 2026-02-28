import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FiSearch, FiChevronDown, FiBook, FiMonitor, FiArrowUp, FiPlay, FiGrid, FiList
} from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";
import { getK9Icon } from "../K9Icons";
import StoryboardPlayer from "../components/StoryboardPlayer";
import { useToast } from "../components/Toast";

// ─────────────────────────────────────────────
// EVIDENCE SECTION — Evidence-based reference display
// ─────────────────────────────────────────────
function EvidenceSection({ grade, refs }) {
  if (!grade && (!refs || refs.length === 0)) return null;

  const gradeColor = grade === "A" ? C.green : grade === "B" ? C.teal : C.amber;
  const gradeBg    = grade === "A" ? C.greenBg : grade === "B" ? C.tealLight : C.amberBg;

  // Determine link label based on reference type
  const linkLabel = (ref) => {
    if (!ref.url) return null;
    if (ref.type === "Textbook") return "📖 View Book";
    if (ref.type === "Conference") return "🔎 Search";
    if (ref.url.includes("doi.org")) return "🔗 DOI";
    return "🔬 PubMed";
  };

  return (
    <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: "12px 16px", background: C.surface }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <FiBook size={13} style={{ color: C.teal }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.teal,
          textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Evidence-Based References
        </span>
        {grade && (
          <span style={{
            background: gradeBg, color: gradeColor, border: `1px solid ${gradeColor}44`,
            borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 800
          }}>
            Grade {grade}
          </span>
        )}
        <span style={{ fontSize: 10, color: C.textLight, marginLeft: "auto" }}>
          {(refs || []).length} source{(refs || []).length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(refs || []).map((ref, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "10px 12px", borderLeft: `3px solid ${C.teal}`
          }}>
            {/* Badges row */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              {ref.type && (
                <span style={{ background: C.tealLight, color: C.teal, padding: "1px 7px",
                  borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                  {ref.type}
                </span>
              )}
              {ref.evidence_grade && (
                <span style={{ background: C.greenBg, color: C.green, padding: "1px 7px",
                  borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                  Grade {ref.evidence_grade}
                </span>
              )}
              {(ref.topics || []).map((t, j) => (
                <span key={j} style={{ background: C.bg, color: C.textLight,
                  padding: "1px 7px", borderRadius: 4, fontSize: 10 }}>{t}</span>
              ))}
              {/* Clickable verification link */}
              {ref.url && (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: "auto", background: C.navy, color: "#fff",
                    padding: "2px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3,
                    whiteSpace: "nowrap"
                  }}
                >
                  {linkLabel(ref)}
                </a>
              )}
            </div>
            {/* Citation text */}
            <p style={{ fontSize: 11, color: C.textMid, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
              {ref.citation}
            </p>
            {/* Key findings */}
            {ref.key_findings && (
              <p style={{ fontSize: 11, color: C.teal, margin: "6px 0 0", lineHeight: 1.5,
                background: C.tealLight, padding: "5px 8px", borderRadius: 4 }}>
                <strong>Key finding:</strong> {ref.key_findings}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EXERCISE CARD (expandable)
// ─────────────────────────────────────────────
function ExerciseCard({ e, onOpenStoryboard, onUseInProtocol }) {
  const [open, setOpen] = useState(false);
  const cardTopRef = useRef(null);
  const diffColor = e.difficulty_level === "Easy" ? "green" : e.difficulty_level === "Advanced" ? "orange" : "blue";

  const closeCard = () => {
    setOpen(false);
    setTimeout(() => {
      cardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  return (
    <div ref={cardTopRef} style={{
      background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      transition: "box-shadow 0.15s", gridColumn: open ? "1 / -1" : undefined
    }}>
      {/* Header — always visible */}
      <div style={{ padding: 20, cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, flex: 1, paddingRight: 12 }}>
            {e.name}
          </div>
          <span style={{ fontSize: 18, color: C.textLight, lineHeight: 1 }}>{open ? "▲" : "▼"}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          <span style={S.badge("blue")}>{e.category}</span>
          <span style={S.badge(diffColor)}>{e.difficulty_level}</span>
        </div>
        {!open && e.description && (
          <p style={{ fontSize: 12, color: C.textLight, margin: "8px 0 0", lineHeight: 1.5,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {e.description}
          </p>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: "0 20px 20px" }}>
          {/* Description */}
          {e.description && (
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: "16px 0" }}>
              {e.description}
            </p>
          )}

          {/* Equipment */}
          {e.equipment?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: C.navy, marginBottom: 6 }}>Equipment</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {e.equipment.map((item, i) => (
                  <span key={i} style={{ background: C.tealLight, color: C.teal, padding: "3px 10px",
                    borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Setup */}
          {e.setup && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: C.navy, marginBottom: 4 }}>Setup</div>
              <p style={{ fontSize: 13, color: C.textMid, margin: 0, lineHeight: 1.5 }}>{e.setup}</p>
            </div>
          )}

          {/* Steps */}
          {e.steps?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: C.navy, marginBottom: 8 }}>Step-by-Step Instructions</div>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {e.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: 13, color: C.textMid, marginBottom: 6, lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div style={S.grid(2)}>
            {/* Good Form */}
            {e.good_form?.length > 0 && (
              <div style={{ background: C.greenBg, borderRadius: 8, padding: 14 }}>
                <div style={{ ...S.label, color: C.green, marginBottom: 8 }}>Good Form</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {e.good_form.map((item, i) => (
                    <li key={i} style={{ fontSize: 12, color: C.green, marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Mistakes */}
            {e.common_mistakes?.length > 0 && (
              <div style={{ background: C.amberBg, borderRadius: 8, padding: 14 }}>
                <div style={{ ...S.label, color: C.amber, marginBottom: 8 }}>Common Mistakes</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {e.common_mistakes.map((item, i) => (
                    <li key={i} style={{ fontSize: 12, color: C.amber, marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Red Flags */}
          {e.red_flags?.length > 0 && (
            <div style={{ background: C.redBg, borderRadius: 8, padding: 14, marginTop: 12 }}>
              <div style={{ ...S.label, color: C.red, marginBottom: 8 }}>🚩 Red Flags — Stop Immediately</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {e.red_flags.map((flag, i) => (
                  <li key={i} style={{ fontSize: 12, color: C.red, marginBottom: 4, fontWeight: 500 }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications + Progression */}
          <div style={{ ...S.grid(2), marginTop: 12 }}>
            {e.contraindications && (
              <div style={{ background: C.redBg, borderRadius: 8, padding: 14 }}>
                <div style={{ ...S.label, color: C.red, marginBottom: 8 }}>Contraindications</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {(Array.isArray(e.contraindications) ? e.contraindications : [e.contraindications]).map((c, i) => (
                    <li key={i} style={{ fontSize: 12, color: C.red, marginBottom: 4 }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {e.progression && (
              <div style={{ background: C.tealLight, borderRadius: 8, padding: 14 }}>
                <div style={{ ...S.label, color: C.teal, marginBottom: 6 }}>Progression</div>
                <p style={{ fontSize: 12, color: C.teal, margin: 0, lineHeight: 1.5 }}>{e.progression}</p>
              </div>
            )}
          </div>

          {/* Clinical Parameters — Dosage, Timing, Classification */}
          {(e.clinical_parameters || e.clinical_classification) && (
            <div style={{ marginTop: 12 }}>
              <div style={{ ...S.label, color: C.navy, marginBottom: 8 }}>Clinical Parameters</div>
              <div style={S.grid(3)}>
                {/* Dosage */}
                {e.clinical_parameters?.dosage && (
                  <div style={{ background: C.greenBg, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Dosage</div>
                    {Object.entries(e.clinical_parameters.dosage).map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11, color: C.green, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>{k.replace(/_/g, " ")}:</span> {v}
                      </div>
                    ))}
                  </div>
                )}
                {/* Post-Surgical Timing */}
                {e.clinical_parameters?.post_surgical_timing && (
                  <div style={{ background: C.tealLight, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Post-Surgical Timing</div>
                    {Object.entries(e.clinical_parameters.post_surgical_timing).map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11, color: C.teal, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>{k.replace(/_/g, " ")}:</span> {v}
                      </div>
                    ))}
                  </div>
                )}
                {/* Classification */}
                {e.clinical_classification && (
                  <div style={{ background: "#FAF5FF", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6B46C1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Classification</div>
                    <div style={{ fontSize: 11, color: "#553C9A", marginBottom: 3 }}>
                      <span style={{ fontWeight: 600 }}>Type:</span> {e.clinical_classification.intervention_type}
                    </div>
                    {e.clinical_classification.rehab_phases?.length > 0 && (
                      <div style={{ fontSize: 11, color: "#553C9A", marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>Phases:</span> {e.clinical_classification.rehab_phases.join(", ")}
                      </div>
                    )}
                    {e.clinical_classification.primary_indications?.length > 0 && (
                      <div style={{ fontSize: 11, color: "#553C9A", marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>Indications:</span> {e.clinical_classification.primary_indications.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Safety */}
          {e.safety && (
            <div style={{ background: C.amberBg, borderRadius: 8, padding: 14, marginTop: 12 }}>
              <div style={{ ...S.label, color: C.amber, marginBottom: 6 }}>Safety & Supervision</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: C.amber }}>
                {e.safety.risk_level && <span><strong>Risk:</strong> {e.safety.risk_level}</span>}
                {e.safety.supervision_required && <span><strong>Supervision:</strong> {e.safety.supervision_required}</span>}
              </div>
            </div>
          )}

          {/* Evidence-Based References — FULL WIDTH */}
          <div style={{ marginTop: 12 }}>
            <EvidenceSection grade={e.evidence_base?.grade} refs={e.evidence_base?.references} />
          </div>

          {/* Storyboard Button — only when storyboard exists */}
          {e.client_education?.storyboard_available && onOpenStoryboard && (
            <button onClick={(ev) => { ev.stopPropagation(); onOpenStoryboard(e.code); }}
              style={{
                marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 8,
                background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
                color: "#fff", border: "1px solid rgba(57,255,126,0.2)", cursor: "pointer",
                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <FiMonitor size={14} /> View Exercise Storyboard
            </button>
          )}

          {/* Use in Protocol Button */}
          {onUseInProtocol && (
            <button onClick={(ev) => { ev.stopPropagation(); onUseInProtocol(); }}
              style={{
                marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 8,
                background: C.greenBg, border: `1.5px solid ${C.green}`, cursor: "pointer",
                color: C.green, fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.15s",
              }}
              onMouseEnter={ev => { ev.currentTarget.style.background = C.green; ev.currentTarget.style.color = "#fff"; }}
              onMouseLeave={ev => { ev.currentTarget.style.background = C.greenBg; ev.currentTarget.style.color = C.green; }}>
              <FiPlay size={13} /> Use in Protocol
            </button>
          )}

          {/* Close Card Button */}
          <button onClick={(ev) => { ev.stopPropagation(); closeCard(); }}
            style={{
              marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 8,
              background: C.navy, border: `1.5px solid ${C.navy}`, cursor: "pointer",
              color: "#fff", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
            }}
            onMouseEnter={ev => { ev.currentTarget.style.background = C.navyMid; ev.currentTarget.style.borderColor = C.teal; }}
            onMouseLeave={ev => { ev.currentTarget.style.background = C.navy; ev.currentTarget.style.borderColor = C.navy; }}>
            <FiChevronDown size={14} style={{ transform: "rotate(180deg)" }} /> Close
          </button>
        </div>
      )}
    </div>
  );
}

// Category icon/color map — SVG icons from K9Icons.js, emoji fallback
const CAT_META = {
  "Passive Therapy":          { color: "#EBF8FF", text: "#2B6CB0", icon: "🤲", SvgIcon: getK9Icon("Passive Therapy") },
  "Active Assisted":          { color: "#E6FFFA", text: "#2C7A7B", icon: "🦮", SvgIcon: getK9Icon("Active Assisted") },
  "Strengthening":            { color: "#F0FFF4", text: "#276749", icon: "💪", SvgIcon: getK9Icon("Strengthening") },
  "Balance & Proprioception": { color: "#FAF5FF", text: "#6B46C1", icon: "⚖️", SvgIcon: getK9Icon("Balance & Proprioception") },
  "Aquatic Therapy":          { color: "#EBF8FF", text: "#2C5282", icon: "🌊", SvgIcon: getK9Icon("Aquatic Therapy") },
  "Hydrotherapy":             { color: "#E0F2FE", text: "#075985", icon: "🏊", SvgIcon: getK9Icon("Hydrotherapy") },
  "Therapeutic Modalities":   { color: "#FFF7ED", text: "#C05621", icon: "⚡", SvgIcon: getK9Icon("Therapeutic Modalities") },
  "Manual Therapy":           { color: "#FFF5F5", text: "#C53030", icon: "👐", SvgIcon: getK9Icon("Manual Therapy") },
  "Functional Training":      { color: "#FFFAF0", text: "#975A16", icon: "🏃", SvgIcon: getK9Icon("Functional Training") },
  "Geriatric Care":           { color: C.bg, text: C.textMid, icon: "🐾", SvgIcon: getK9Icon("Geriatric Care") },
  "Post-Surgical":            { color: "#FFF5F5", text: "#C53030", icon: "🩺", SvgIcon: getK9Icon("Post-Surgical") },
  "Neurological Rehab":       { color: "#FAF5FF", text: "#553C9A", icon: "🧠", SvgIcon: getK9Icon("Neurological Rehab") },
  "Sport Conditioning":       { color: "#F0FFF4", text: "#22543D", icon: "🏅", SvgIcon: getK9Icon("Sport Conditioning") },
  "Complementary Therapy":    { color: "#FFFFF0", text: "#744210", icon: "🌿", SvgIcon: getK9Icon("Complementary Therapy") },
  "Pediatric Rehabilitation": { color: "#FFF5F5", text: "#702459", icon: "🐶", SvgIcon: getK9Icon("Pediatric Rehabilitation") },
  "Palliative Care":          { color: C.bg, text: C.text, icon: "❤️", SvgIcon: getK9Icon("Palliative Care") },
  "Breed-Specific":           { color: "#FFFAF0", text: "#7B341E", icon: "🦴", SvgIcon: getK9Icon("Breed-Specific") },
  "Athletic Foundations":      { color: "#E0F7FA", text: "#0E7490", icon: "🏋️", SvgIcon: getK9Icon("Athletic Foundations") },
};

// ─────────────────────────────────────────────
// EXERCISES VIEW — Full Exercise Library Browser
// ─────────────────────────────────────────────
function ExercisesView({ setView, setGenKey, setGenInitialStep }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterDiff, setFilterDiff] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});
  const [showStoryboard, setShowStoryboard] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const catRefs = useRef({});
  const toast = useToast();

  const goToGenerator = () => {
    if (!setView) return;
    setGenKey(k => k + 1);
    setGenInitialStep(1);
    setView("generator");
  };

  useEffect(() => {
    axios.get(`${API}/exercises`).then(r => setExercises(r.data?.data || r.data || [])).catch(() => toast("Failed to load exercises")).finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(exercises.map(e => e.category))].sort();
  const filtered = exercises.filter(e =>
    (!search || e.name.toLowerCase().includes(search.toLowerCase()) ||
                e.description?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat  || e.category  === filterCat) &&
    (!filterDiff || e.difficulty_level === filterDiff)
  );

  // Group by category
  const grouped = {};
  filtered.forEach(e => {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category].push(e);
  });

  const toggleCat = (cat) =>
    setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  const scrollToCat = (cat) => {
    setCollapsedCats(prev => ({ ...prev, [cat]: false }));
    setTimeout(() => {
      catRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const easyCount = exercises.filter(e => e.difficulty_level === "Easy").length;
  const modCount = exercises.filter(e => e.difficulty_level === "Moderate").length;
  const advCount = exercises.filter(e => e.difficulty_level === "Advanced").length;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Loading exercises...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Storyboard Player Modal */}
      {showStoryboard && <StoryboardPlayer exerciseCode={showStoryboard} onClose={() => setShowStoryboard(null)} />}
      {/* Search Toolbar */}
      <div style={{ ...S.card, background: C.navy, border: `2px solid ${C.navy}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <FiSearch size={14} style={{ position: "absolute", left: 12, top: 11, color: "rgba(255,255,255,0.4)" }} />
            <input style={{ ...S.input, paddingLeft: 34, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff", height: 38 }} placeholder="Search exercises by name or description…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", fontWeight: 600 }}>
            {filtered.length} / {exercises.length}
          </span>
          {setView && (
            <button onClick={goToGenerator} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 18px", borderRadius: 8, cursor: "pointer",
              background: C.green, border: "none", color: "#fff",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
              transition: "all 0.15s", boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.green; e.currentTarget.style.boxShadow = "0 2px 8px rgba(16,185,129,0.3)"; }}>
              <FiPlay size={13} /> Build Protocol
            </button>
          )}
          {/* View mode toggle */}
          <div style={{ display: "flex", gap: 2, marginLeft: 4 }}>
            {[
              { mode: "grid", icon: FiGrid, title: "Card View" },
              { mode: "list", icon: FiList, title: "List View" },
            ].map(({ mode, icon: ModeIcon, title }) => (
              <button key={mode} onClick={() => setViewMode(mode)} title={title} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34, borderRadius: 6, cursor: "pointer",
                background: viewMode === mode ? "rgba(57,255,126,0.2)" : "rgba(255,255,255,0.06)",
                border: `1.5px solid ${viewMode === mode ? "rgba(57,255,126,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: viewMode === mode ? "#39FF7E" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s",
              }}>
                <ModeIcon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Categories + Difficulty Counts */}
      <div style={{ ...S.card, background: C.navy, border: `2px solid ${C.navy}`, padding: 20 }}>
        {/* Header row: title + difficulty counts */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>
            Exercise Categories
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {[
              { label: "Easy", count: easyCount, color: C.green },
              { label: "Moderate", count: modCount, color: C.teal },
              { label: "Advanced", count: advCount, color: C.amber },
            ].map(d => (
              <div key={d.label} onClick={() => setFilterDiff(prev => prev === d.label ? "" : d.label)}
                style={{ display: "flex", alignItems: "baseline", gap: 5, cursor: "pointer", transition: "opacity 0.15s", opacity: filterDiff && filterDiff !== d.label ? 0.4 : 1 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: d.color, lineHeight: 1 }}>{d.count}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 3, width: "100%", overflow: "hidden", marginBottom: 14, borderRadius: 2 }}>
          <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {categories.map(cat => {
            const meta = CAT_META[cat] || { icon: "📋" };
            const count = grouped[cat]?.length || 0;
            return (
              <button key={cat} onClick={() => scrollToCat(cat)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: 12, fontWeight: 600,
                transition: "all 0.15s",
                opacity: count > 0 ? 1 : 0.4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,0.25)"; e.currentTarget.style.borderColor = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
                {meta.SvgIcon ? (
                  <span style={{ display: "inline-flex", background: "#0A0A0A", borderRadius: 4, padding: 2 }}>
                    <meta.SvgIcon size={20} />
                  </span>
                ) : (
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                )}
                {cat}
                {count > 0 && <span style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════ LIST VIEW ═══════════ */}
      {viewMode === "list" && (
        filtered.length === 0 ? (
          <div style={{ ...S.card, border: `2px solid ${C.navy}`, textAlign: "center", color: C.textLight, padding: 48 }}>
            No exercises match your search
          </div>
        ) : (
          <div style={{ ...S.card, padding: 0, overflow: "hidden", background: C.navy, border: `2px solid ${C.navy}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Code", "Category", "Difficulty", "Evidence"].map(h => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                      color: C.teal, textTransform: "uppercase", letterSpacing: "0.6px",
                      borderBottom: `1px solid ${C.border}`, background: "rgba(0,0,0,0.2)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...filtered].sort((a, b) => a.name.localeCompare(b.name)).map(e => {
                  const diffColor = e.difficulty_level === "Easy" ? C.green : e.difficulty_level === "Advanced" ? C.amber : C.teal;
                  const gradeColor = e.evidence_base?.grade === "A" ? C.green : e.evidence_base?.grade === "B" ? C.teal : C.amber;
                  return (
                    <tr key={e.code}
                      onClick={() => { setViewMode("grid"); setFilterCat(e.category); setCollapsedCats(prev => ({ ...prev, [e.category]: false })); setTimeout(() => { const el = document.getElementById(`card-${e.code}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }}
                      style={{ cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                      onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "#fff", borderBottom: `1px solid ${C.border}` }}>{e.name}</td>
                      <td style={{ padding: "8px 14px", fontSize: 10, fontWeight: 600, color: C.textLight, fontFamily: "monospace", borderBottom: `1px solid ${C.border}` }}>{e.code}</td>
                      <td style={{ padding: "8px 14px", fontSize: 11, color: "rgba(255,255,255,0.7)", borderBottom: `1px solid ${C.border}` }}>{e.category}</td>
                      <td style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: diffColor, background: `${diffColor}18`, padding: "2px 8px", borderRadius: 6 }}>{e.difficulty_level}</span>
                      </td>
                      <td style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                        {e.evidence_base?.grade && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: gradeColor, background: `${gradeColor}18`, padding: "2px 8px", borderRadius: 6 }}>Grade {e.evidence_base.grade}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ═══════════ GRID VIEW — Category sections ═══════════ */}
      {viewMode === "grid" && Object.entries(grouped).length === 0 && (
        <div style={{ ...S.card, border: `2px solid ${C.navy}`, textAlign: "center", color: C.textLight, padding: 48 }}>
          No exercises match your search
        </div>
      )}

      {viewMode === "grid" && Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, exList]) => {
        const meta = CAT_META[cat] || { color: C.bg, text: C.textMid, icon: "📋" };
        const isCollapsed = collapsedCats[cat];

        return (
          <div key={cat} ref={el => catRefs.current[cat] = el} style={{ ...S.card, background: C.navy, border: `2px solid ${C.navy}`, padding: 0, overflow: "hidden", marginBottom: 12 }}>
            {/* Category header */}
            <div
              onClick={() => toggleCat(cat)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", background: C.navy, cursor: "pointer",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {meta.SvgIcon ? (
                  <span style={{ display: "inline-flex", background: "#0A0A0A", borderRadius: 6, padding: 3 }}>
                    <meta.SvgIcon size={28} />
                  </span>
                ) : (
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                )}
                <div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>{cat}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    {exList.length} exercise{exList.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {["Easy","Moderate","Advanced"].map(d => {
                    const n = exList.filter(e => e.difficulty_level === d).length;
                    if (!n) return null;
                    return <span key={d} style={{ ...S.badge(d === "Easy" ? "green" : d === "Advanced" ? "orange" : "blue"),
                      fontSize: 10 }}>{n} {d}</span>;
                  })}
                </div>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                  {isCollapsed ? "▼" : "▲"}
                </span>
              </div>
            </div>
            {/* Neon flatline under header */}
            <div style={{ height: 3, width: "100%", overflow: "hidden" }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
            </div>

            {/* Exercise grid */}
            {!isCollapsed && (
              <div style={{ padding: 16 }}>
                <div style={S.grid(3)}>
                  {exList.map(e => <ExerciseCard key={e.code} e={e} onOpenStoryboard={setShowStoryboard}
                    onUseInProtocol={setView ? goToGenerator : undefined} />)}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button onClick={() => { const el = document.querySelector('[data-content-scroll]'); if (el) el.scrollTo({ top: 0, behavior: "smooth" }); else window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 16px", borderRadius: 8, cursor: "pointer",
                    background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
                    color: "#fff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,0.25)"; e.currentTarget.style.borderColor = C.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                    <FiArrowUp size={13} /> Back to Top
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ExercisesView;
