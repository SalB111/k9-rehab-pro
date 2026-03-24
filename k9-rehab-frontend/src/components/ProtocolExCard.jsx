import React, { useState } from "react";
import { FiX, FiCheckCircle, FiAlertTriangle, FiBook, FiMonitor, FiLayers } from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { getExCategoryIcon } from "../constants/exerciseCategories";

function ProtocolExCard({ entry, onRemove, onOpenStoryboard, onAnatomyClick }) {
  const [open, setOpen] = useState(false);
  const ex = entry.exercise || {};
  const catIcon = getExCategoryIcon(ex);

  return (
    <div style={{
      background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`,
      overflow: "hidden", gridColumn: open ? "1 / -1" : undefined,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }}>
      {/* Card header */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ display: "flex", gap: 10, flex: 1, cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
            {/* Category icon badge */}
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: catIcon.SvgIcon ? "#0A0A0A" : catIcon.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0, border: `1px solid ${catIcon.SvgIcon ? "#222" : catIcon.color + "22"}`
            }}>{catIcon.SvgIcon ? <catIcon.SvgIcon size={28} /> : catIcon.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 6 }}>
                {ex.name || "Exercise"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {entry.sets         && <span style={S.badge("blue")}>{entry.sets} sets</span>}
                {entry.reps         && <span style={S.badge("blue")}>{entry.reps} reps</span>}
                {entry.duration_seconds && (
                  <span style={S.badge("blue")}>
                    {entry.duration_seconds >= 60 ? `${entry.duration_seconds / 60} min` : `${entry.duration_seconds}s`}
                  </span>
                )}
                {entry.frequency_per_day && <span style={S.badge("green")}>{entry.frequency_per_day}× /day</span>}
                {ex.difficulty_level && (
                  <span style={S.badge(ex.difficulty_level === "Easy" ? "green" : ex.difficulty_level === "Advanced" ? "orange" : "blue")}>
                    {ex.difficulty_level}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {onAnatomyClick && (
              <button onClick={() => onAnatomyClick(ex.code)} title="Show in Anatomy Viewer" style={{
                background: "rgba(20,184,166,0.12)", border: `1px solid var(--k9-teal)`,
                borderRadius: 6, padding: "4px 8px", cursor: "pointer",
                color: "var(--k9-teal)", display: "flex", alignItems: "center", gap: 4,
                fontSize: 10, fontWeight: 700
              }}>
                <FiLayers size={11} /> Anatomy
              </button>
            )}
            <button onClick={() => setOpen(o => !o)} style={{
              background: C.border, border: "none", borderRadius: 6, padding: "4px 8px",
              cursor: "pointer", fontSize: 11, color: C.textMid, fontWeight: 600
            }}>
              {open ? "▲ Less" : "▼ Details"}
            </button>
            <button onClick={onRemove} title="Remove exercise" style={{
              background: C.redBg, border: `1px solid ${C.redBg}`, borderRadius: 6,
              padding: "4px 8px", cursor: "pointer", color: C.red, display: "flex",
              alignItems: "center"
            }}>
              <FiX size={13} />
            </button>
          </div>
        </div>

        {entry.notes && (
          <div style={{ marginTop: 8, fontSize: 11, color: C.textLight, fontStyle: "italic",
            background: C.bg, padding: "6px 10px", borderRadius: 6 }}>
            📋 {entry.notes}
          </div>
        )}

        {entry.evidence_citation && (
          <div style={{ marginTop: 6, fontSize: 10, color: C.textLight, display: "flex",
            alignItems: "center", gap: 5, background: C.tealLight, padding: "4px 10px",
            borderRadius: 5, border: `1px solid ${C.border}` }}>
            <FiBook size={10} style={{ flexShrink: 0, color: C.teal }} />
            <span style={{ fontStyle: "italic" }}>{entry.evidence_citation}</span>
          </div>
        )}
      </div>

      {/* Expanded clinical detail */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "0 16px 16px" }}>
          {ex.description && (
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: "12px 0" }}>
              {ex.description}
            </p>
          )}

          {ex.equipment?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: C.navy, marginBottom: 5 }}>Equipment</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {ex.equipment.map((item, i) => (
                  <span key={i} style={{ background: C.tealLight, color: C.teal,
                    padding: "2px 9px", borderRadius: 20, fontSize: 11 }}>{item}</span>
                ))}
              </div>
            </div>
          )}

          {ex.setup && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: C.navy, marginBottom: 4 }}>Setup</div>
              <p style={{ fontSize: 12, color: C.textMid, margin: 0 }}>{ex.setup}</p>
            </div>
          )}

          {ex.steps?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: C.navy, marginBottom: 6 }}>
                Step-by-Step Instructions
              </div>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {ex.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: 12, color: C.textMid, marginBottom: 5, lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            {ex.good_form?.length > 0 && (
              <div style={{ background: C.greenBg, borderRadius: 8, padding: 12 }}>
                <div style={{ ...S.label, color: C.green, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <FiCheckCircle size={11} /> Good Form
                </div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {ex.good_form.map((item, i) => (
                    <li key={i} style={{ fontSize: 11, color: C.green, marginBottom: 3 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ex.common_mistakes?.length > 0 && (
              <div style={{ background: C.amberBg, borderRadius: 8, padding: 12 }}>
                <div style={{ ...S.label, color: C.amber, marginBottom: 6 }}>Common Mistakes</div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {ex.common_mistakes.map((item, i) => (
                    <li key={i} style={{ fontSize: 11, color: C.amber, marginBottom: 3 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {ex.red_flags?.length > 0 && (
            <div style={{ background: C.redBg, borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: C.red, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <FiAlertTriangle size={11} /> Red Flags — Stop Immediately
              </div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {ex.red_flags.map((flag, i) => (
                  <li key={i} style={{ fontSize: 11, color: C.red, marginBottom: 3, fontWeight: 500 }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {ex.contraindications?.length > 0 && (
            <div style={{ background: C.redBg, borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: C.red, marginBottom: 6 }}>Contraindications</div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {(Array.isArray(ex.contraindications) ? ex.contraindications : [ex.contraindications]).map((c, i) => (
                  <li key={i} style={{ fontSize: 11, color: C.red, marginBottom: 3 }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {ex.progression && (
            <div style={{ background: C.tealLight, borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: C.teal, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <FiBook size={11} /> Progression
              </div>
              <p style={{ fontSize: 11, color: C.teal, margin: 0, lineHeight: 1.5 }}>{ex.progression}</p>
            </div>
          )}
          {/* Storyboard button — check by exercise code via storyboard API */}
          {onOpenStoryboard && (
            <button onClick={undefined}
              style={{
                marginTop: 10, width: "100%", padding: "8px 14px", borderRadius: 8,
                background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
                color: "#fff", border: "1px solid rgba(57,255,126,0.2)",
                fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                opacity: 0.5, pointerEvents: "none",
              }}>
              <FiMonitor size={12} /> Exercise Storyboard
              <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: C.amberBg, color: C.amber, border: `1px solid ${C.amber}`, marginLeft: 4 }}>Coming Soon</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProtocolExCard;
