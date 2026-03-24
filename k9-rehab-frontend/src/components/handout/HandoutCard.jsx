import React from "react";
import { TIER_COLORS, DIFF_COLORS } from "./constants";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HandoutCard({ exercise: e, density, toggles, index }) {
  const pp = density.perPage;
  const isFull = pp === 1;
  const isCompact = pp >= 3;
  const isSummary = pp >= 5;
  const isQuickRef = pp === 6;
  const hasTrackCol = density.trackingCol;
  const fs = density.fontSize;

  const tierStyle = TIER_COLORS[e.evidence_tier] || TIER_COLORS["Consensus-Only"];
  const diffColor = DIFF_COLORS[e.difficulty_level] || "#1E293B";

  const dosage = e.clinical_parameters?.dosage;
  const steps = e.steps || [];
  const truncSteps = steps.slice(0, density.maxSteps);
  const goodForm = (e.good_form || []).slice(0, isFull ? 6 : 3);
  const redFlags = (e.red_flags || []).slice(0, isFull ? 4 : 2);

  const trackDays = isFull ? DAYS : pp <= 2 ? DAYS.slice(0, 5) : DAYS.slice(0, 3);

  // Shared dosage string builder
  const dosageStr = dosage ? [
    dosage.repetitions,
    dosage.sets && `x${dosage.sets}`,
    dosage.frequency,
    dosage.duration,
    dosage.hold_time && `hold ${dosage.hold_time}`,
  ].filter(Boolean).join(" | ") : "";

  // ── 6 per page: ultra-compact single row ──
  if (isQuickRef) {
    return (
      <div className="handout-card" data-density={pp} style={{
        display: "flex", alignItems: "center", gap: 8,
        borderBottom: "1px solid #E2E8F0", padding: "7px 8px",
        background: "#fff", fontSize: 8,
      }}>
        <span style={numBadge(18, 8)}>{index + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#0F4C81", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {e.name}
          </div>
          {dosageStr && (
            <div style={{ fontSize: 7, color: "#64748B" }}>{dosageStr}</div>
          )}
        </div>
        <div style={{
          fontFamily: "monospace", fontSize: 7, fontWeight: 700,
          color: "#94A3B8", whiteSpace: "nowrap", flexShrink: 0,
        }}>{e.code}</div>
      </div>
    );
  }

  // ── 5 per page: compact summary card ──
  if (isSummary) {
    return (
      <div className="handout-card" data-density={pp} style={{
        border: "1px solid #E2E8F0", borderRadius: 4, padding: "8px 10px",
        marginBottom: 4, background: "#fff", display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <span style={numBadge(20, 9)}>{index + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0F4C81" }}>{e.name}</div>
            <div style={{
              fontFamily: "monospace", fontSize: 8, fontWeight: 700,
              color: "#0F4C81", border: "1px solid #0F4C81", borderRadius: 3,
              padding: "1px 5px", whiteSpace: "nowrap", flexShrink: 0, marginLeft: 6,
            }}>{e.code}</div>
          </div>
          {toggles.dosage && dosageStr && (
            <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>
              <strong>Dosage:</strong> {dosageStr}
            </div>
          )}
          {toggles.steps && truncSteps.length > 0 && (
            <div style={{ fontSize: 8, color: "#64748B", marginTop: 2 }}>
              {truncSteps.map((s, i) => `${i + 1}. ${s}`).join(" ")}
              {steps.length > density.maxSteps && " ..."}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 3 per page with tracking column ──
  if (hasTrackCol) {
    return (
      <div className="handout-card" data-density={pp} style={{
        border: "1px solid #CBD5E1", borderRadius: 4, padding: 8,
        marginBottom: 6, background: "#fff", display: "flex", gap: 0,
      }}>
        {/* Left: exercise info */}
        <div style={{ flex: 1, paddingRight: 8, borderRight: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
            <span style={numBadge(18, 8)}>{index + 1}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0F4C81", lineHeight: 1.2 }}>{e.name}</div>
              <div style={{ fontSize: 7, color: "#64748B", marginTop: 1 }}>{e.category}</div>
            </div>
          </div>
          {toggles.steps && truncSteps.length > 0 && (
            <div style={{ fontSize: 8, color: "#475569", lineHeight: 1.4, marginBottom: 3 }}>
              {truncSteps.map((s, i) => `${i + 1}. ${s}`).join(" ")}
              {steps.length > density.maxSteps && " ..."}
            </div>
          )}
          {toggles.dosage && dosageStr && (
            <div style={{ fontSize: 8, color: "#475569" }}><strong>Dosage:</strong> {dosageStr}</div>
          )}
        </div>
        {/* Right: tracking grid */}
        <div style={{ width: 140, flexShrink: 0, paddingLeft: 6 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 7 }}>
            <thead>
              <tr>
                {DAYS.map(d => <th key={d} style={{ padding: "2px 1px", fontWeight: 700, color: "#64748B", textAlign: "center", borderBottom: "1px solid #CBD5E1" }}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                {DAYS.map(d => <td key={d} style={{ padding: "3px 1px", textAlign: "center", borderBottom: "1px solid #E2E8F0" }}>
                  <span style={{ display: "inline-block", width: 11, height: 11, border: "1.5px solid #94A3B8", borderRadius: 2 }} />
                </td>)}
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 6, color: "#94A3B8", textAlign: "center", marginTop: 3 }}>
            Pain: ___ / 10
          </div>
        </div>
      </div>
    );
  }

  // ── Standard layouts: 1, 2, 3 per page ──
  return (
    <div className="handout-card" data-density={pp} style={{
      border: "1px solid #CBD5E1", borderRadius: 6, padding: isFull ? 20 : isCompact ? 10 : 14,
      marginBottom: 8, background: "#fff", position: "relative",
    }}>
      {/* ── Header row: number + name + code box ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isFull ? 10 : 6 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1 }}>
          <span style={numBadge(isFull ? 26 : 20, isFull ? 12 : 9)}>{index + 1}</span>
          <div>
            <div style={{ fontSize: isFull ? 18 : isCompact ? 12 : 14, fontWeight: 700, color: "#0F4C81", lineHeight: 1.3 }}>
              {e.name}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: fs - 3, color: "#64748B", fontWeight: 500 }}>{e.category}</span>
              {toggles.evidenceBadge && e.evidence_tier && (
                <span style={{
                  fontSize: fs - 4, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                  background: tierStyle.bg, color: tierStyle.text, border: `1px solid ${tierStyle.border}`,
                }}>{e.evidence_tier}</span>
              )}
              <span style={{ fontSize: fs - 3, fontWeight: 600, color: diffColor }}>{e.difficulty_level}</span>
            </div>
          </div>
        </div>
        {/* Code box */}
        <div style={{
          border: "2px solid #0F4C81", borderRadius: 4, padding: isFull ? "4px 10px" : "2px 6px",
          fontFamily: "monospace", fontSize: isFull ? 14 : 10, fontWeight: 800, color: "#0F4C81",
          whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.3, flexShrink: 0,
        }}>
          <div style={{ fontSize: 7, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>Code</div>
          {e.code}
        </div>
      </div>

      {/* ── Equipment ── */}
      {toggles.equipment && !isCompact && e.equipment?.length > 0 && (
        <div style={{ fontSize: fs - 1, color: "#475569", marginBottom: 8 }}>
          <strong>Equipment:</strong> {e.equipment.join(", ")}
        </div>
      )}

      {/* ── Steps ── */}
      {toggles.steps && truncSteps.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: fs - 1, fontWeight: 700, color: "#1E293B", marginBottom: 3 }}>Steps:</div>
          {isCompact ? (
            <div style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.4 }}>
              {truncSteps.map((s, i) => (i > 0 ? ` ${i + 1}. ` : `1. `) + s).join("")}
              {steps.length > density.maxSteps && " ..."}
            </div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: fs - 1, color: "#475569", lineHeight: 1.5 }}>
              {truncSteps.map((s, i) => <li key={i} style={{ marginBottom: 2 }}>{s}</li>)}
              {steps.length > density.maxSteps && <li style={{ color: "#94A3B8", fontStyle: "italic" }}>...and {steps.length - density.maxSteps} more</li>}
            </ol>
          )}
        </div>
      )}

      {/* ── Dosage ── */}
      {toggles.dosage && dosage && (
        <div style={{ fontSize: fs - 1, color: "#475569", marginBottom: 8 }}>
          <strong>Dosage:</strong> {dosageStr}
        </div>
      )}

      {/* ── Good Form + Red Flags (side by side on full, inline on others) ── */}
      {(toggles.goodForm || toggles.redFlags) && !isCompact && (
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          {toggles.goodForm && goodForm.length > 0 && (
            <div style={{ flex: 1, fontSize: fs - 2, color: "#166534", background: "#F0FDF4", borderRadius: 4, padding: isFull ? 8 : 5 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Good Form</div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {goodForm.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}
          {toggles.redFlags && redFlags.length > 0 && (
            <div style={{ flex: 1, fontSize: fs - 2, color: "#991B1B", background: "#FEF2F2", borderRadius: 4, padding: isFull ? 8 : 5 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Stop If</div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {redFlags.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Tracking Grid ── */}
      {toggles.tracking && (
        <div style={{ marginTop: isFull ? 12 : 6 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: fs - 2 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 60, textAlign: "left" }}>Tracking</th>
                {trackDays.map(d => <th key={d} style={thStyle}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600, fontSize: fs - 3 }}>Done?</td>
                {trackDays.map(d => <td key={d} style={{ ...tdStyle, textAlign: "center" }}>
                  <span style={{ display: "inline-block", width: 12, height: 12, border: "1.5px solid #94A3B8", borderRadius: 2 }} />
                </td>)}
              </tr>
              {isFull && (
                <tr>
                  <td style={{ ...tdStyle, fontWeight: 600, fontSize: fs - 3 }}>Pain (0-10)</td>
                  {trackDays.map(d => <td key={d} style={tdStyle}>&nbsp;</td>)}
                </tr>
              )}
            </tbody>
          </table>
          {isFull && (
            <div style={{ fontSize: fs - 3, color: "#94A3B8", marginTop: 4 }}>
              Notes: ________________________________________
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function numBadge(size, fontSize) {
  return {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: "#0F4C81", color: "#fff", fontSize, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}

const thStyle = {
  padding: "3px 4px", borderBottom: "1.5px solid #CBD5E1",
  fontWeight: 700, color: "#64748B", textAlign: "center",
};
const tdStyle = {
  padding: "6px 4px", borderBottom: "1px solid #E2E8F0",
  color: "#475569",
};
