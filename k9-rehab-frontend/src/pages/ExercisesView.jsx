import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import {
  FiSearch, FiChevronDown, FiBook, FiMonitor, FiArrowUp, FiPlay, FiGrid, FiList, FiPrinter, FiLayers
} from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";
import { getK9Icon } from "../K9Icons";
import StoryboardPlayer from "../components/StoryboardPlayer";
import AnatomyViewer3D from "../components/AnatomyViewer3D";
import { useToast } from "../components/Toast";
import { useTr } from "../i18n/useTr";

const PrintableHandout = React.lazy(() => import("../components/handout/PrintableHandout"));

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// EVIDENCE SECTION â€" Evidence-based reference display
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function EvidenceSection({ grade, refs }) {
  const tr = useTr();
  if (!grade && (!refs || refs.length === 0)) return null;

  const gradeColor = grade === "A" ? C.green : grade === "B" ? C.teal : C.amber;
  const gradeBg    = grade === "A" ? C.greenBg : grade === "B" ? C.tealLight : C.amberBg;

  // Determine link label based on reference type
  const linkLabel = (ref) => {
    if (!ref.url) return null;
    if (ref.type === "Textbook") return "\uD83D\uDCD6 " + tr("View Book");
    if (ref.type === "Conference") return "\uD83D\uDD0E " + tr("Search");
    if (ref.url.includes("doi.org")) return "\uD83D\uDD17 " + tr("DOI");
    return "\uD83D\uDD2C " + tr("PubMed");
  };

  return (
    <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: "12px 16px", background: C.surface }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <FiBook size={13} style={{ color: C.teal }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.teal,
          textTransform: "uppercase", letterSpacing: "0.6px" }}>
          {tr("Evidence-Based References")}
        </span>
        {grade && (
          <span style={{
            background: gradeBg, color: gradeColor, border: `1px solid ${gradeColor}44`,
            borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 800
          }}>
            {tr("Grade")} {grade}
          </span>
        )}
        <span style={{ fontSize: 10, color: C.textLight, marginLeft: "auto" }}>
          {(refs || []).length} {(refs || []).length !== 1 ? tr("sources") : tr("source")}
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
                  {tr("Grade")} {ref.evidence_grade}
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
                    marginLeft: "auto", background: C.teal, color: C.surface,
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
            <p style={{ fontSize: 11, color: C.text, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
              {ref.citation}
            </p>
            {/* Key findings */}
            {ref.key_findings && (
              <p style={{ fontSize: 11, color: C.teal, margin: "6px 0 0", lineHeight: 1.5,
                background: C.tealLight, padding: "5px 8px", borderRadius: 4 }}>
                <strong>{tr("Key finding")}:</strong> {ref.key_findings}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// EXERCISE CARD (expandable)
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function ExerciseCard({ e, onOpenStoryboard, onUseInProtocol, onPrintHandout }) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const [showAnatomy, setShowAnatomy] = useState(false);
  const cardTopRef = useRef(null);
  const anatomyRef = useRef(null);
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
      {/* Header â€" always visible */}
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
          {e.evidence_tier && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: e.evidence_tier === "Evidence-Based" ? `${C.green}18` :
                          e.evidence_tier === "Evidence-Adjacent" ? `${C.teal}18` : `${C.amber}18`,
              color: e.evidence_tier === "Evidence-Based" ? C.green :
                     e.evidence_tier === "Evidence-Adjacent" ? C.teal : C.amber,
              border: `1px solid ${e.evidence_tier === "Evidence-Based" ? C.green :
                       e.evidence_tier === "Evidence-Adjacent" ? C.teal : C.amber}33`,
            }}>
              {e.evidence_tier}
            </span>
          )}
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
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: "16px 0" }}>
              {e.description}
            </p>
          )}

          {/* Clinical Tags */}
          {e.clinical_tags?.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
              {e.clinical_tags.map((tag, i) => (
                <span key={i} style={{
                  background: `${C.teal}12`, color: C.teal, padding: "3px 10px",
                  borderRadius: 20, fontSize: 10, fontWeight: 600, letterSpacing: "0.3px",
                  border: `1px solid ${C.teal}22`,
                }}>
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}

          {/* Equipment */}
          {e.equipment?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: C.text, marginBottom: 6 }}>{tr("Equipment")}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {e.equipment.map((item, i) => (
                  <span key={i} style={{ background: C.bg, color: C.text, padding: "3px 10px",
                    borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${C.border}` }}>{item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Setup */}
          {e.setup && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: C.text, marginBottom: 4 }}>{tr("Setup")}</div>
              <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{e.setup}</p>
            </div>
          )}

          {/* Steps */}
          {e.steps?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...S.label, color: C.text, marginBottom: 8 }}>{tr("Step-by-Step Instructions")}</div>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {e.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: 13, color: C.text, marginBottom: 6, lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div style={S.grid(2)}>
            {/* Good Form */}
            {e.good_form?.length > 0 && (
              <div style={{ background: C.surface, borderRadius: 8, padding: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}` }}>
                <div style={{ ...S.label, color: C.green, marginBottom: 8 }}>{tr("Good Form")}</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {e.good_form.map((item, i) => (
                    <li key={i} style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Mistakes */}
            {e.common_mistakes?.length > 0 && (
              <div style={{ background: C.surface, borderRadius: 8, padding: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.amber}` }}>
                <div style={{ ...S.label, color: C.amber, marginBottom: 8 }}>{tr("Common Mistakes")}</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {e.common_mistakes.map((item, i) => (
                    <li key={i} style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Red Flags */}
          {e.red_flags?.length > 0 && (
            <div style={{ background: "#fef2f2", borderRadius: 8, padding: 14, marginTop: 12, border: "1px solid #fecaca", borderLeft: "3px solid #dc2626" }}>
              <div style={{ ...S.label, color: "#dc2626", marginBottom: 8 }}>{tr("Red Flags — Stop Immediately")}</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {e.red_flags.map((flag, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#111", marginBottom: 4, fontWeight: 500 }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications + Progression */}
          <div style={{ ...S.grid(2), marginTop: 12 }}>
            {e.contraindications && (
              <div style={{ background: "#fff7ed", borderRadius: 8, padding: 14, border: "1px solid #fed7aa", borderLeft: "3px solid #ea580c" }}>
                <div style={{ ...S.label, color: "#ea580c", marginBottom: 8 }}>{tr("Contraindications")}</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {(Array.isArray(e.contraindications) ? e.contraindications : [e.contraindications]).map((c, i) => (
                    <li key={i} style={{ fontSize: 12, color: "#111", marginBottom: 4 }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {e.progression && (
              <div style={{ background: C.surface, borderRadius: 8, padding: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.teal}` }}>
                <div style={{ ...S.label, color: C.teal, marginBottom: 6 }}>{tr("Progression")}</div>
                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.5 }}>{e.progression}</p>
              </div>
            )}
          </div>

          {/* Clinical Parameters â€" Dosage, Timing, Classification */}
          {(e.clinical_parameters || e.clinical_classification) && (
            <div style={{ marginTop: 12 }}>
              <div style={{ ...S.label, color: C.text, marginBottom: 8 }}>{tr("Clinical Parameters")}</div>
              <div style={S.grid(3)}>
                {/* Dosage */}
                {e.clinical_parameters?.dosage && (
                  <div style={{ background: C.surface, borderRadius: 8, padding: 12, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{tr("Dosage")}</div>
                    {Object.entries(e.clinical_parameters.dosage).map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11, color: C.text, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>{k.replace(/_/g, " ")}:</span> {v}
                      </div>
                    ))}
                  </div>
                )}
                {/* Post-Surgical Timing */}
                {e.clinical_parameters?.post_surgical_timing && (
                  <div style={{ background: C.surface, borderRadius: 8, padding: 12, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.teal}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{tr("Post-Surgical Timing")}</div>
                    {Object.entries(e.clinical_parameters.post_surgical_timing).map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11, color: C.text, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>{k.replace(/_/g, " ")}:</span> {v}
                      </div>
                    ))}
                  </div>
                )}
                {/* Classification */}
                {e.clinical_classification && (
                  <div style={{ background: C.surface, borderRadius: 8, padding: 12, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.teal}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{tr("Classification")}</div>
                    <div style={{ fontSize: 11, color: C.text, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600 }}>{tr("Type")}:</span> {e.clinical_classification.intervention_type}
                    </div>
                    {e.clinical_classification.rehab_phases?.length > 0 && (
                      <div style={{ fontSize: 11, color: C.text, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>{tr("Phases")}:</span> {e.clinical_classification.rehab_phases.join(", ")}
                      </div>
                    )}
                    {e.clinical_classification.primary_indications?.length > 0 && (
                      <div style={{ fontSize: 11, color: C.text, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600 }}>{tr("Indications")}:</span> {e.clinical_classification.primary_indications.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Safety */}
          {e.safety && (
            <div style={{ background: C.surface, borderRadius: 8, padding: 14, marginTop: 12, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.amber}` }}>
              <div style={{ ...S.label, color: C.amber, marginBottom: 6 }}>{tr("Safety & Supervision")}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: C.text }}>
                {e.safety.risk_level && <span><strong style={{ color: C.amber }}>{tr("Risk")}:</strong> {e.safety.risk_level}</span>}
                {e.safety.supervision_required && <span><strong style={{ color: C.amber }}>{tr("Supervision")}:</strong> {e.safety.supervision_required}</span>}
              </div>
            </div>
          )}

          {/* Evidence-Based References â€" FULL WIDTH */}
          <div style={{ marginTop: 12 }}>
            <EvidenceSection grade={e.evidence_base?.grade} refs={e.evidence_base?.references} />
          </div>

          {/* â"€â"€ Anatomy Viewer Button â"€â"€ */}
          <button
            onClick={(ev) => { ev.stopPropagation(); setShowAnatomy(a => { if (!a) setTimeout(() => anatomyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); return !a; }); }}
            style={{
              marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 8,
              background: showAnatomy ? "rgba(20,184,166,0.15)" : C.bg,
              border: `1.5px solid var(--k9-teal)`,
              cursor: "pointer", color: "var(--k9-teal)", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
            }}
            onMouseEnter={ev => { if (!showAnatomy) { ev.currentTarget.style.background = "rgba(20,184,166,0.15)"; }}}
            onMouseLeave={ev => { if (!showAnatomy) { ev.currentTarget.style.background = C.bg; }}}>
            <FiLayers size={13} />
            {showAnatomy ? tr("Hide Anatomy Viewer") : tr("View Targeted Muscles")}
          </button>

          {/* â"€â"€ Inline 3D Anatomy Viewer â"€â"€ Reverted to the original Three.js
              AnatomyViewer3D component per Sal 2026-04-15. Drag to rotate,
              scroll to zoom, muscle highlights driven by exercise code. */}
          {showAnatomy && (
            <div ref={anatomyRef} style={{ marginTop: 8 }}>
              <AnatomyViewer3D
                exerciseCode={e.code}
                diagnosis={null}
                species={e.code?.startsWith("FELINE_") ? "Feline" : "Canine"}
              />
            </div>
          )}

          {/* Storyboard Button â€" only when storyboard exists */}
          {e.client_education?.storyboard_available && onOpenStoryboard && (
            <button onClick={undefined}
              style={{
                marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 8,
                background: `linear-gradient(135deg, ${C.green}, ${C.teal})`,
                color: C.surface, border: "none",
                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 2px 8px rgba(14,165,233,0.3)",
                opacity: 0.5, pointerEvents: "none",
              }}>
              <FiMonitor size={14} /> {tr("View Exercise Storyboard")}
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: C.amberBg, color: C.amber, border: `1px solid ${C.amber}`, marginLeft: 4 }}>{tr("Coming Soon")}</span>
            </button>
          )}

          {/* Print Handout Button */}
          {onPrintHandout && (
            <button onClick={(ev) => { ev.stopPropagation(); onPrintHandout(e); }}
              style={{
                marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 8,
                background: C.bg, border: `1.5px solid ${C.teal}`, cursor: "pointer",
                color: C.teal, fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.15s",
              }}
              onMouseEnter={ev => { ev.currentTarget.style.background = C.teal; ev.currentTarget.style.color = C.surface; }}
              onMouseLeave={ev => { ev.currentTarget.style.background = C.bg; ev.currentTarget.style.color = C.teal; }}>
              <FiPrinter size={13} /> {tr("Print Exercise Handout")}
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
              onMouseEnter={ev => { ev.currentTarget.style.background = C.green; ev.currentTarget.style.color = C.surface; }}
              onMouseLeave={ev => { ev.currentTarget.style.background = C.greenBg; ev.currentTarget.style.color = C.green; }}>
              <FiPlay size={13} /> {tr("Use in Protocol")}
            </button>
          )}

          {/* Close Card Button */}
          <button onClick={(ev) => { ev.stopPropagation(); closeCard(); }}
            style={{
              marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 8,
              background: C.bg, border: `1.5px solid ${C.border}`, cursor: "pointer",
              color: C.text, fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
            }}
            onMouseEnter={ev => { ev.currentTarget.style.borderColor = C.teal; ev.currentTarget.style.color = C.teal; }}
            onMouseLeave={ev => { ev.currentTarget.style.borderColor = C.border; ev.currentTarget.style.color = C.text; }}>
            <FiChevronDown size={14} style={{ transform: "rotate(180deg)" }} /> {tr("Close")}
          </button>
        </div>
      )}
    </div>
  );
}

// Category icon/color map â€" SVG icons from K9Icons.js, emoji fallback
const CAT_META = {
  "Passive Therapy":          { color: C.bg, text: C.text, icon: "🐾", SvgIcon: getK9Icon("Passive Therapy") },
  "Active Assisted":          { color: C.bg, text: C.text, icon: "🐕", SvgIcon: getK9Icon("Active Assisted") },
  "Strengthening":            { color: C.bg, text: C.text, icon: "🐺", SvgIcon: getK9Icon("Strengthening") },
  "Balance & Proprioception": { color: C.bg, text: C.text, icon: "🦮", SvgIcon: getK9Icon("Balance & Proprioception") },
  "Aquatic Therapy":          { color: C.bg, text: C.text, icon: "🐠", SvgIcon: getK9Icon("Aquatic Therapy") },
  "Hydrotherapy":             { color: C.bg, text: C.text, icon: "💧", SvgIcon: getK9Icon("Hydrotherapy") },
  "Therapeutic Modalities":   { color: C.bg, text: C.text, icon: "⚡", SvgIcon: getK9Icon("Therapeutic Modalities") },
  "Manual Therapy":           { color: C.bg, text: C.text, icon: "🦴", SvgIcon: getK9Icon("Manual Therapy") },
  "Functional Training":      { color: C.bg, text: C.text, icon: "🏃", SvgIcon: getK9Icon("Functional Training") },
  "Geriatric Care":           { color: C.bg, text: C.text, icon: "🧓", SvgIcon: getK9Icon("Geriatric Care") },
  "Post-Surgical":            { color: C.bg, text: C.text, icon: "🩺", SvgIcon: getK9Icon("Post-Surgical") },
  "Neurological Rehab":       { color: C.bg, text: C.text, icon: "🧠", SvgIcon: getK9Icon("Neurological Rehab") },
  "Sport Conditioning":       { color: C.bg, text: C.text, icon: "🏆", SvgIcon: getK9Icon("Sport Conditioning") },
  "Complementary Therapy":    { color: C.bg, text: C.text, icon: "🌿", SvgIcon: getK9Icon("Complementary Therapy") },
  "Pediatric Rehabilitation": { color: C.bg, text: C.text, icon: "🐶", SvgIcon: getK9Icon("Pediatric Rehabilitation") },
  "Palliative Care":          { color: C.bg, text: C.text, icon: "❤️", SvgIcon: getK9Icon("Palliative Care") },
  "Breed-Specific":           { color: C.bg, text: C.text, icon: "🐩", SvgIcon: getK9Icon("Breed-Specific") },
  "Canine Strength (Zink)":   { color: C.bg, text: C.text, icon: "💪", SvgIcon: getK9Icon("Canine Strength (Zink)") },

  "Feline Rehabilitation":       { color: C.bg, text: C.text, icon: "🐱", SvgIcon: getK9Icon("Feline Rehabilitation") },
  "Neurological Rehabilitation": { color: C.bg, text: C.text, icon: "🧠", SvgIcon: getK9Icon("Neurological Rehabilitation") },
};

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// EXERCISES VIEW â€" Full Exercise Library Browser
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function ExercisesView({ setView, setGenKey, setGenInitialStep }) {
  const tr = useTr();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterDiff, setFilterDiff] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});
  const [showStoryboard, setShowStoryboard] = useState(null);
  const [handoutExercises, setHandoutExercises] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const catRefs = useRef({});
  const toast = useToast();

  // Anatomy viewer is rendered INLINE inside ExerciseCard (only when the
  // user clicks "View Targeted Muscles"). Uses the original AnatomyViewer3D
  // Three.js component restored from commit 2119071.

  const goToGenerator = () => {
    if (!setView) return;
    setGenKey(k => k + 1);
    setGenInitialStep(1);
    setView("generator");
  };

  useEffect(() => {
    api.get("/exercises").then(r => setExercises(r.data?.data || r.data || [])).catch(() => toast(tr("Failed to load exercises"))).finally(() => setLoading(false));
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
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{tr("Loading exercises...")}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Storyboard Player Modal */}
      {showStoryboard && <StoryboardPlayer exerciseCode={showStoryboard} onClose={() => setShowStoryboard(null)} />}
      {/* Printable Handout Modal */}
      {handoutExercises && (
        <React.Suspense fallback={null}>
          <PrintableHandout exercises={handoutExercises} onClose={() => setHandoutExercises(null)} />
        </React.Suspense>
      )}
      {/* Search Toolbar */}
      <div style={{ ...S.card, padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <FiSearch size={14} style={{ position: "absolute", left: 12, top: 11, color: "#333" }} />
            <input style={{ ...S.input, paddingLeft: 34, height: 38 }} placeholder={tr("Search by name, description, or category...")}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 12, color: "#333", whiteSpace: "nowrap", fontWeight: 600 }}>
            {filtered.length} {tr("of")} {exercises.length} {tr("exercises")}
          </span>
          {setView && (
            <button onClick={goToGenerator} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 18px", borderRadius: 8, cursor: "pointer",
              background: C.green, border: "none", color: C.surface,
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
              transition: "all 0.15s", boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(16,185,129,0.3)"; }}>
              <FiPlay size={13} /> {tr("Build Protocol")}
            </button>
          )}
          {/* View mode toggle */}
          <div style={{ display: "flex", gap: 2, marginLeft: 4 }}>
            {[
              { mode: "grid", icon: FiGrid, title: tr("Card View") },
              { mode: "list", icon: FiList, title: tr("List View") },
            ].map(({ mode, icon: ModeIcon, title }) => (
              <button key={mode} onClick={() => setViewMode(mode)} title={title} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34, borderRadius: 6, cursor: "pointer",
                background: viewMode === mode ? `${C.teal}18` : C.bg,
                border: `1.5px solid ${viewMode === mode ? C.teal : C.border}`,
                color: viewMode === mode ? C.teal : C.textLight,
                transition: "all 0.15s",
              }}>
                <ModeIcon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Categories + Difficulty Counts */}
      <div style={{ ...S.card, padding: 20 }}>
        {/* Header row: title + difficulty counts */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#111", textTransform: "uppercase", letterSpacing: "1px" }}>
            {tr("Exercise Categories")}
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
                <span style={{ fontSize: 11, fontWeight: 700, color: "#222", textTransform: "uppercase", letterSpacing: "0.5px" }}>{tr(d.label)}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 3, width: "100%", overflow: "hidden", marginBottom: 14, borderRadius: 2 }}>
          <div style={{ width: "200%", height: "100%", background: `linear-gradient(90deg, transparent, #39FF7E, ${C.teal}, #39FF7E, transparent)`, animation: "neonFlatline 3s linear infinite" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {categories.map(cat => {
            const meta = CAT_META[cat] || { icon: "\uD83D\uDCCB" };
            const count = grouped[cat]?.length || 0;
            return (
              <button key={cat} onClick={() => scrollToCat(cat)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                background: C.bg, border: `1.5px solid ${C.border}`,
                color: "#111", fontSize: 12, fontWeight: 600,
                transition: "all 0.15s",
                opacity: count > 0 ? 1 : 0.4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.teal}12`; e.currentTarget.style.borderColor = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.border; }}>
                {meta.SvgIcon ? (
                  <span style={{ display: "inline-flex", background: C.bg, borderRadius: 4, padding: 2 }}>
                    <meta.SvgIcon size={20} />
                  </span>
                ) : (
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                )}
                {tr(cat)}
                {count > 0 && <span style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â• LIST VIEW â•â•â•â•â•â•â•â•â•â•â• */}
      {viewMode === "list" && (
        filtered.length === 0 ? (
          <div style={{ ...S.card, textAlign: "center", color: "#333", padding: 48 }}>
            {tr("No exercises match your search")}
          </div>
        ) : (
          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Code", "Category", "Difficulty", "Evidence", "Tier"].map(h => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                      color: C.teal, textTransform: "uppercase", letterSpacing: "0.6px",
                      borderBottom: `1px solid ${C.border}`, background: C.bg,
                    }}>{tr(h)}</th>
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
                      onMouseEnter={ev => ev.currentTarget.style.background = C.bg}
                      onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "#111", borderBottom: `1px solid ${C.border}` }}>{e.name}</td>
                      <td style={{ padding: "8px 14px", fontSize: 10, fontWeight: 600, color: "#333", fontFamily: "monospace", borderBottom: `1px solid ${C.border}` }}>{e.code}</td>
                      <td style={{ padding: "8px 14px", fontSize: 11, color: "#111", borderBottom: `1px solid ${C.border}` }}>{e.category}</td>
                      <td style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: diffColor, background: `${diffColor}18`, padding: "2px 8px", borderRadius: 6 }}>{e.difficulty_level}</span>
                      </td>
                      <td style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                        {e.evidence_base?.grade && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: gradeColor, background: `${gradeColor}18`, padding: "2px 8px", borderRadius: 6 }}>{tr("Grade")} {e.evidence_base.grade}</span>
                        )}
                      </td>
                      <td style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                        {e.evidence_tier && (
                          <span style={{ fontSize: 10, fontWeight: 700,
                            color: e.evidence_tier === "Evidence-Based" ? C.green : e.evidence_tier === "Evidence-Adjacent" ? C.teal : C.amber,
                            background: `${e.evidence_tier === "Evidence-Based" ? C.green : e.evidence_tier === "Evidence-Adjacent" ? C.teal : C.amber}18`,
                            padding: "2px 8px", borderRadius: 6 }}>
                            {e.evidence_tier}
                          </span>
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

      {/* â•â•â•â•â•â•â•â•â•â•â• GRID VIEW â€" Category sections â•â•â•â•â•â•â•â•â•â•â• */}
      {viewMode === "grid" && Object.entries(grouped).length === 0 && (
        <div style={{ ...S.card, textAlign: "center", color: "#333", padding: 48 }}>
          {tr("No exercises match your search")}
        </div>
      )}

      {viewMode === "grid" && Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, exList]) => {
        const meta = CAT_META[cat] || { color: C.bg, text: C.textMid, icon: "\uD83D\uDCCB" };
        const isCollapsed = collapsedCats[cat];

        return (
          <div key={cat} ref={el => catRefs.current[cat] = el} style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 16, border: `2px solid ${C.teal}40`, borderRadius: 12 }}>
            {/* Category header — centered, bold */}
            <div
              onClick={() => toggleCat(cat)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "16px 20px", cursor: "pointer", background: `${C.navy}08`,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                {meta.SvgIcon ? (
                  <span style={{ display: "inline-flex", background: C.bg, borderRadius: 6, padding: 3 }}>
                    <meta.SvgIcon size={28} />
                  </span>
                ) : (
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                )}
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontWeight: 900, fontSize: 16, color: "#111", letterSpacing: 0.5 }}>{tr(cat)}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: "#222", fontWeight: 600 }}>
                    {exList.length} {exList.length !== 1 ? tr("exercises") : tr("exercise")}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                {["Easy","Moderate","Advanced"].map(d => {
                  const n = exList.filter(e => e.difficulty_level === d).length;
                  if (!n) return null;
                  return <span key={d} style={{ ...S.badge(d === "Easy" ? "green" : d === "Advanced" ? "orange" : "blue"),
                    fontSize: 10 }}>{n} {tr(d)}</span>;
                })}
                <span style={{ color: "#333", fontSize: 12, fontWeight: 700, marginLeft: 8 }}>
                  {isCollapsed ? "▼" : "▲"}
                </span>
              </div>
            </div>
            {/* Neon flatline under header */}
            <div style={{ height: 3, width: "100%", overflow: "hidden" }}>
              <div style={{ width: "200%", height: "100%", background: `linear-gradient(90deg, transparent, #39FF7E, ${C.teal}, #39FF7E, transparent)`, animation: "neonFlatline 3s linear infinite" }} />
            </div>

            {/* Exercise grid */}
            {!isCollapsed && (
              <div style={{ padding: 16 }}>
                <div style={S.grid(3)}>
                  {exList.map(e => <ExerciseCard key={e.code} e={e}
                    onOpenStoryboard={setShowStoryboard}
                    onUseInProtocol={setView ? goToGenerator : undefined}
                    onPrintHandout={(ex) => setHandoutExercises([ex])} />)}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button onClick={() => { const el = document.querySelector('[data-content-scroll]'); if (el) el.scrollTo({ top: 0, behavior: "smooth" }); else window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 16px", borderRadius: 8, cursor: "pointer",
                    background: C.bg, border: `1.5px solid ${C.border}`,
                    color: "#111", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
                    <FiArrowUp size={13} /> {tr("Back to Top")}
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


