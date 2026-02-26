import React, { useState } from "react";
import { FiX, FiCheckCircle, FiAlertTriangle, FiBook, FiMonitor } from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { getExCategoryIcon } from "../constants/exerciseCategories";

function ProtocolExCard({ entry, onRemove, onOpenStoryboard }) {
  const [open, setOpen] = useState(false);
  const ex = entry.exercise || {};
  const catIcon = getExCategoryIcon(ex);

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0",
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
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1A202C", marginBottom: 6 }}>
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
            <button onClick={() => setOpen(o => !o)} style={{
              background: "#F0F4F8", border: "none", borderRadius: 6, padding: "4px 8px",
              cursor: "pointer", fontSize: 11, color: "#4A5568", fontWeight: 600
            }}>
              {open ? "▲ Less" : "▼ Details"}
            </button>
            <button onClick={onRemove} title="Remove exercise" style={{
              background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: 6,
              padding: "4px 8px", cursor: "pointer", color: "#C53030", display: "flex",
              alignItems: "center"
            }}>
              <FiX size={13} />
            </button>
          </div>
        </div>

        {entry.notes && (
          <div style={{ marginTop: 8, fontSize: 11, color: "#718096", fontStyle: "italic",
            background: "#F7FAFC", padding: "6px 10px", borderRadius: 6 }}>
            📋 {entry.notes}
          </div>
        )}

        {entry.evidence_citation && (
          <div style={{ marginTop: 6, fontSize: 10, color: "#5B6B82", display: "flex",
            alignItems: "center", gap: 5, background: "#F0F6FF", padding: "4px 10px",
            borderRadius: 5, border: "1px solid #D6E4F0" }}>
            <FiBook size={10} style={{ flexShrink: 0, color: "#2B6CB0" }} />
            <span style={{ fontStyle: "italic" }}>{entry.evidence_citation}</span>
          </div>
        )}
      </div>

      {/* Expanded clinical detail */}
      {open && (
        <div style={{ borderTop: "1px solid #F0F4F8", padding: "0 16px 16px" }}>
          {ex.description && (
            <p style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.6, margin: "12px 0" }}>
              {ex.description}
            </p>
          )}

          {ex.equipment?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 5 }}>Equipment</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {ex.equipment.map((item, i) => (
                  <span key={i} style={{ background: "#EBF8FF", color: "#2B6CB0",
                    padding: "2px 9px", borderRadius: 20, fontSize: 11 }}>{item}</span>
                ))}
              </div>
            </div>
          )}

          {ex.setup && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 4 }}>Setup</div>
              <p style={{ fontSize: 12, color: "#4A5568", margin: 0 }}>{ex.setup}</p>
            </div>
          )}

          {ex.steps?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...S.label, color: "#0F4C81", marginBottom: 6 }}>
                Step-by-Step Instructions
              </div>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {ex.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#4A5568", marginBottom: 5, lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            {ex.good_form?.length > 0 && (
              <div style={{ background: "#F0FFF4", borderRadius: 8, padding: 12 }}>
                <div style={{ ...S.label, color: "#276749", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <FiCheckCircle size={11} /> Good Form
                </div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {ex.good_form.map((item, i) => (
                    <li key={i} style={{ fontSize: 11, color: "#276749", marginBottom: 3 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ex.common_mistakes?.length > 0 && (
              <div style={{ background: "#FFFAF0", borderRadius: 8, padding: 12 }}>
                <div style={{ ...S.label, color: "#C05621", marginBottom: 6 }}>Common Mistakes</div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {ex.common_mistakes.map((item, i) => (
                    <li key={i} style={{ fontSize: 11, color: "#C05621", marginBottom: 3 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {ex.red_flags?.length > 0 && (
            <div style={{ background: "#FFF5F5", borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: "#C53030", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <FiAlertTriangle size={11} /> Red Flags — Stop Immediately
              </div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {ex.red_flags.map((flag, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#C53030", marginBottom: 3, fontWeight: 500 }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {ex.contraindications?.length > 0 && (
            <div style={{ background: "#FFF5F5", borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: "#C53030", marginBottom: 6 }}>Contraindications</div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {(Array.isArray(ex.contraindications) ? ex.contraindications : [ex.contraindications]).map((c, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#C53030", marginBottom: 3 }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {ex.progression && (
            <div style={{ background: "#EBF8FF", borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ ...S.label, color: "#2B6CB0", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <FiBook size={11} /> Progression
              </div>
              <p style={{ fontSize: 11, color: "#2B6CB0", margin: 0, lineHeight: 1.5 }}>{ex.progression}</p>
            </div>
          )}
          {/* Storyboard button — check by exercise code via storyboard API */}
          {onOpenStoryboard && (
            <button onClick={(ev) => { ev.stopPropagation(); onOpenStoryboard(ex.code); }}
              style={{
                marginTop: 10, width: "100%", padding: "8px 14px", borderRadius: 8,
                background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
                color: "#fff", border: "1px solid rgba(57,255,126,0.2)", cursor: "pointer",
                fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
              <FiMonitor size={12} /> Exercise Storyboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProtocolExCard;
