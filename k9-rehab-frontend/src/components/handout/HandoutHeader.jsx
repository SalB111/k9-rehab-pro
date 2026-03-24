import React from "react";

export default function HandoutHeader({ clinicName, clinicLogo, patientName, protocolName, date }) {
  return (
    <div className="handout-page-header" style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderBottom: "2px solid #0F4C81", paddingBottom: 8, marginBottom: 12,
    }}>
      {/* Left: clinic branding */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {clinicLogo ? (
          <img src={clinicLogo} alt="Clinic Logo" style={{ height: 36, width: "auto", objectFit: "contain" }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: 6, background: "#0F4C81",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, fontWeight: 800,
          }}>K9</div>
        )}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F4C81" }}>
            {clinicName || "Veterinary Rehabilitation Clinic"}
          </div>
          <div style={{ fontSize: 9, color: "#64748B" }}>Exercise Handout</div>
        </div>
      </div>

      {/* Center: protocol name */}
      {protocolName && (
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0F4C81" }}>{protocolName}</div>
        </div>
      )}

      {/* Right: patient + date */}
      <div style={{ textAlign: "right" }}>
        {patientName && (
          <div style={{ fontSize: 11, fontWeight: 600, color: "#1E293B" }}>Patient: {patientName}</div>
        )}
        <div style={{ fontSize: 10, color: "#64748B" }}>{date || new Date().toLocaleDateString()}</div>
        <div style={{ fontSize: 7, color: "#CBD5E1", fontWeight: 600 }}>K9 Rehab Pro</div>
      </div>
    </div>
  );
}
