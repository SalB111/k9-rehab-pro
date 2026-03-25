import React from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HandoutTrackingSheet({ exercises, clinicName, patientName }) {
  return (
    <div className="handout-tracking-sheet" style={{ background: "#fff", padding: 20 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0F4C81" }}>
          Weekly Exercise Tracking Sheet
        </div>
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
          {clinicName || "Veterinary Rehabilitation Clinic"}
          {patientName && ` — Patient: ${patientName}`}
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
          Week of: ________________
        </div>
      </div>

      {/* Tracking table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr>
            <th style={{ ...th, width: "28%", textAlign: "left" }}>Exercise</th>
            <th style={{ ...th, width: "10%", textAlign: "left" }}>Dosage</th>
            {DAYS.map(d => <th key={d} style={th}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {exercises.map((e, i) => {
            const dosage = e.clinical_parameters?.dosage;
            const dosageStr = [
              dosage?.repetitions,
              dosage?.sets && `x${dosage.sets}`,
              dosage?.frequency,
            ].filter(Boolean).join(" ") || "Per clinician";

            return (
              <tr key={e.code || i}>
                <td style={{ ...td, fontWeight: 600 }}>
                  <div style={{ fontSize: 10, color: "#1E293B" }}>{e.name}</div>
                  <div style={{ fontSize: 8, color: "#94A3B8", fontFamily: "monospace" }}>{e.code}</div>
                </td>
                <td style={{ ...td, fontSize: 8, color: "#64748B" }}>{dosageStr}</td>
                {DAYS.map(d => (
                  <td key={d} style={{ ...td, textAlign: "center" }}>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid #94A3B8", borderRadius: 2 }} />
                  </td>
                ))}
              </tr>
            );
          })}
          {/* Pain score row */}
          <tr>
            <td style={{ ...td, fontWeight: 700, color: "#991B1B" }} colSpan={2}>Pain Score (0-10)</td>
            {DAYS.map(d => <td key={d} style={{ ...td, textAlign: "center", minHeight: 24 }}>&nbsp;</td>)}
          </tr>
        </tbody>
      </table>

      {/* Notes area */}
      <div style={{ marginTop: 16, borderTop: "1px solid #E2E8F0", paddingTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>Clinician Notes:</div>
        <div style={{ borderBottom: "1px solid #CBD5E1", height: 18, marginBottom: 4 }} />
        <div style={{ borderBottom: "1px solid #CBD5E1", height: 18, marginBottom: 4 }} />
        <div style={{ borderBottom: "1px solid #CBD5E1", height: 18 }} />
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 16, fontSize: 8, color: "#CBD5E1" }}>
        K9 Rehab Pro™ — Clinical Decision-Support System — Not a substitute for veterinary judgment
      </div>
    </div>
  );
}

const th = {
  padding: "6px 4px", borderBottom: "2px solid #0F4C81",
  fontWeight: 700, color: "#0F4C81", textAlign: "center", fontSize: 9,
};
const td = {
  padding: "8px 4px", borderBottom: "1px solid #E2E8F0", color: "#475569",
};
