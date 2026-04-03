import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiAlertTriangle, FiCheckCircle, FiInfo, FiPlay } from "react-icons/fi";

export default function StoryboardCard({ card }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showScript, setShowScript] = useState(null); // "client" | "clinician" | null

  const frames = card.frames || [];
  const hasFrames = frames.length > 0;

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", background: "linear-gradient(135deg, #0C234010, #0F4C8110)", borderBottom: "1px solid var(--k9-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--k9-teal)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
              Exercise Storyboard
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--k9-text)" }}>
              {card.exerciseName}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--k9-teal)", color: "#fff", fontWeight: 600 }}>{card.code}</span>
              {card.breedModel && (
                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--k9-bg)", color: "var(--k9-text-light)" }}>
                  {card.breedModel.breed} ({card.breedModel.weight_lbs} lbs, {card.breedModel.size})
                </span>
              )}
              {hasFrames && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#8B5CF615", color: "#8B5CF6", fontWeight: 600 }}>{frames.length} frames</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Purpose */}
      {card.clinicalPurpose && (
        <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--k9-text)", lineHeight: 1.6, borderBottom: "1px solid var(--k9-border)" }}>
          <strong style={{ color: "var(--k9-teal)" }}>Clinical Purpose:</strong> {card.clinicalPurpose.slice(0, 300)}{card.clinicalPurpose.length > 300 ? "..." : ""}
        </div>
      )}

      {/* Frame Viewer */}
      {hasFrames && (
        <div style={{ borderBottom: "1px solid var(--k9-border)" }}>
          <div style={{ padding: "12px 16px", background: "var(--k9-bg)" }}>
            {/* Frame nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <button onClick={() => setCurrentFrame(i => Math.max(0, i - 1))} disabled={currentFrame === 0}
                style={{ ...navBtn, opacity: currentFrame === 0 ? 0.3 : 1 }}>
                <FiChevronLeft size={14} />
              </button>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--k9-text)" }}>
                Frame {currentFrame + 1} of {frames.length}: {frames[currentFrame]?.title}
              </div>
              <button onClick={() => setCurrentFrame(i => Math.min(frames.length - 1, i + 1))} disabled={currentFrame === frames.length - 1}
                style={{ ...navBtn, opacity: currentFrame === frames.length - 1 ? 0.3 : 1 }}>
                <FiChevronRight size={14} />
              </button>
            </div>

            {/* Frame content */}
            <div style={{ background: "var(--k9-surface)", borderRadius: 8, padding: 12, border: "1px solid var(--k9-border)" }}>
              {frames[currentFrame]?.description && (
                <div style={{ fontSize: 11, color: "var(--k9-text-light)", marginBottom: 8, fontStyle: "italic" }}>
                  {frames[currentFrame].description}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <FrameField icon={<FiPlay size={10} />} label="Dog Action" value={frames[currentFrame]?.dogAction} color="#0EA5E9" />
                <FrameField icon={<FiCheckCircle size={10} />} label="Handler Action" value={frames[currentFrame]?.handlerAction} color="#1D9E75" />
                <FrameField icon={<FiInfo size={10} />} label="Clinical Cues" value={frames[currentFrame]?.clinicalCues} color="#8B5CF6" />
                <FrameField icon={<FiAlertTriangle size={10} />} label="Safety Notes" value={frames[currentFrame]?.safetyNotes} color="#A32D2D" />
              </div>

              {/* SVG Indicators */}
              {frames[currentFrame]?.svgIndicators?.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {frames[currentFrame].svgIndicators.map((ind, i) => (
                    <span key={i} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${ind.color || "#888"}15`, color: ind.color || "#888", border: `1px solid ${ind.color || "#888"}30` }}>
                      {ind.label}
                    </span>
                  ))}
                </div>
              )}

              {frames[currentFrame]?.duration && (
                <div style={{ fontSize: 10, color: "var(--k9-text-light)", marginTop: 6 }}>
                  Duration: {frames[currentFrame].duration}s
                </div>
              )}
            </div>

            {/* Frame dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
              {frames.map((_, i) => (
                <button key={i} onClick={() => setCurrentFrame(i)} style={{
                  width: i === currentFrame ? 16 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                  background: i === currentFrame ? "var(--k9-teal)" : "var(--k9-border)", transition: "all 0.2s",
                }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Handler Setup */}
      {card.handlerSetup && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--k9-border)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", marginBottom: 4 }}>Handler Setup</div>
          <div style={{ fontSize: 11, color: "var(--k9-text)", lineHeight: 1.6 }}>{card.handlerSetup.slice(0, 400)}{card.handlerSetup.length > 400 ? "..." : ""}</div>
        </div>
      )}

      {/* Movement Breakdown */}
      {card.movementBreakdown?.length > 0 && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--k9-border)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", marginBottom: 6 }}>Movement Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {card.movementBreakdown.slice(0, 7).map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--k9-text)" }}>
                <span style={{ fontWeight: 700, color: "var(--k9-teal)", minWidth: 20 }}>{m.step}.</span>
                <span>{m.action}</span>
                {m.muscle_focus && <span style={{ color: "#8B5CF6", fontSize: 10 }}>({m.muscle_focus})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scripts */}
      {(card.clientScript || card.clinicianScript) && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--k9-border)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {card.clientScript && (
              <button onClick={() => setShowScript(showScript === "client" ? null : "client")}
                style={{ ...scriptBtn, background: showScript === "client" ? "#1D9E7515" : "transparent", color: showScript === "client" ? "#1D9E75" : "var(--k9-text-light)" }}>
                Client Script
              </button>
            )}
            {card.clinicianScript && (
              <button onClick={() => setShowScript(showScript === "clinician" ? null : "clinician")}
                style={{ ...scriptBtn, background: showScript === "clinician" ? "#0EA5E915" : "transparent", color: showScript === "clinician" ? "#0EA5E9" : "var(--k9-text-light)" }}>
                Clinician Script
              </button>
            )}
          </div>
          {showScript === "client" && card.clientScript && (
            <div style={{ marginTop: 8, padding: 10, background: "var(--k9-bg)", borderRadius: 6, fontSize: 11, color: "var(--k9-text)", lineHeight: 1.6 }}>
              {card.clientScript}
            </div>
          )}
          {showScript === "clinician" && card.clinicianScript && (
            <div style={{ marginTop: 8, padding: 10, background: "var(--k9-bg)", borderRadius: 6, fontSize: 11, color: "var(--k9-text)", lineHeight: 1.6 }}>
              {card.clinicianScript}
            </div>
          )}
        </div>
      )}

      {/* Contraindications */}
      {card.contraindications?.length > 0 && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--k9-border)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#A32D2D", textTransform: "uppercase", marginBottom: 4 }}>Contraindications</div>
          <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11, color: "#A32D2D", lineHeight: 1.5 }}>
            {card.contraindications.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "8px 16px", fontSize: 8, color: "var(--k9-text-light)", textAlign: "right" }}>
        K9 Rehab Pro Storyboard System | MANUS 14-Point Specification
      </div>
    </div>
  );
}

function FrameField({ icon, label, value, color }) {
  if (!value) return null;
  return (
    <div style={{ padding: "6px 8px", background: `${color}08`, borderRadius: 4, borderLeft: `2px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", marginBottom: 2 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 10, color: "var(--k9-text)", lineHeight: 1.5 }}>{value.slice(0, 200)}{value.length > 200 ? "..." : ""}</div>
    </div>
  );
}

const navBtn = {
  padding: "4px 8px", borderRadius: 4, border: "1px solid var(--k9-border)",
  background: "transparent", color: "var(--k9-text)", cursor: "pointer", display: "flex", alignItems: "center",
};

const scriptBtn = {
  padding: "4px 10px", borderRadius: 4, border: "1px solid var(--k9-border)",
  fontSize: 10, fontWeight: 600, cursor: "pointer",
};
