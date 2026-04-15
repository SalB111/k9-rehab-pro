import React, { useState, useRef } from "react";
import { FiPrinter, FiX, FiImage } from "react-icons/fi";
import { DENSITIES, DEFAULT_TOGGLES } from "./constants";
import HandoutHeader from "./HandoutHeader";
import HandoutCard from "./HandoutCard";
import HandoutTrackingSheet from "./HandoutTrackingSheet";
import "./handout-print.css";

const DENSITY_KEYS = Object.keys(DENSITIES);

export default function PrintableHandout({ exercises, patientName, protocolName, phaseNotes, onClose }) {
  const [densityKey, setDensityKey] = useState("COMPACT3");
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const [clinicName, setClinicName] = useState(() => localStorage.getItem("k9_clinic_name") || "");
  const [clinicLogo, setClinicLogo] = useState(() => localStorage.getItem("k9_clinic_logo") || "");
  const [selectedCodes, setSelectedCodes] = useState(() => new Set(exercises.map(e => e.code)));
  const [notes, setNotes] = useState(phaseNotes || "");
  const printRef = useRef(null);

  const density = DENSITIES[densityKey];
  const selectedExercises = exercises.filter(e => selectedCodes.has(e.code));

  const handleLogoUpload = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setClinicLogo(dataUrl);
      localStorage.setItem("k9_clinic_logo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const saveClinicName = (name) => {
    setClinicName(name);
    localStorage.setItem("k9_clinic_name", name);
  };

  const toggleCode = (code) => {
    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const handlePrint = () => window.print();

  return (
    <div className="handout-print-root" style={{
      position: "fixed", inset: 0, zIndex: 9999, display: "flex",
      background: "rgba(0,0,0,0.5)",
    }}>
      {/* ── Left Sidebar (config) ── */}
      <div className="handout-config-sidebar no-print" style={{
        width: 280, background: "#fff", borderRight: "1px solid #E2E8F0",
        padding: 16, overflowY: "auto", flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F4C81" }}>Print Settings</div>
          <button onClick={onClose} className="no-print" style={{
            background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 4,
          }}><FiX size={18} /></button>
        </div>

        {/* Layout density */}
        <Section title="Layout">
          {DENSITY_KEYS.map(k => (
            <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, cursor: "pointer", marginBottom: 4 }}>
              <input type="radio" name="density" checked={densityKey === k}
                onChange={() => setDensityKey(k)} style={{ accentColor: "#0F4C81" }} />
              {DENSITIES[k].label}
            </label>
          ))}
        </Section>

        {/* Content toggles */}
        <Section title="Content">
          {Object.entries(DEFAULT_TOGGLES).map(([key]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, cursor: "pointer", marginBottom: 3 }}>
              <input type="checkbox" checked={toggles[key]}
                onChange={() => toggle(key)} style={{ accentColor: "#0F4C81" }} />
              {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
            </label>
          ))}
        </Section>

        {/* Clinic branding */}
        <Section title="Clinic Branding">
          <input type="text" value={clinicName} placeholder="Clinic name"
            onChange={e => saveClinicName(e.target.value)}
            style={{ width: "100%", padding: "5px 8px", fontSize: 11, border: "1px solid #CBD5E1", borderRadius: 4, marginBottom: 6, boxSizing: "border-box" }} />
          <label style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 10, cursor: "pointer",
            padding: "5px 8px", border: "1px dashed #CBD5E1", borderRadius: 4, color: "#64748B",
          }}>
            <FiImage size={12} />
            {clinicLogo ? "Change logo" : "Upload logo"}
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
          </label>
          {clinicLogo && (
            <button onClick={() => { setClinicLogo(""); localStorage.removeItem("k9_clinic_logo"); }}
              style={{ fontSize: 9, color: "#EF4444", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>
              Remove logo
            </button>
          )}
        </Section>

        {/* Phase notes */}
        <Section title="Phase Notes">
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g., Phase 1 focuses on pain management and passive range of motion..."
            style={{ width: "100%", padding: "5px 8px", fontSize: 10, border: "1px solid #CBD5E1", borderRadius: 4, minHeight: 48, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
        </Section>

        {/* Exercise selection */}
        <Section title={`Exercises (${selectedCodes.size}/${exercises.length})`}>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            <button onClick={() => setSelectedCodes(new Set(exercises.map(e => e.code)))}
              style={{ fontSize: 9, padding: "2px 6px", border: "1px solid #CBD5E1", borderRadius: 3, background: "#F8FAFC", cursor: "pointer", color: "#475569" }}>
              All
            </button>
            <button onClick={() => setSelectedCodes(new Set())}
              style={{ fontSize: 9, padding: "2px 6px", border: "1px solid #CBD5E1", borderRadius: 3, background: "#F8FAFC", cursor: "pointer", color: "#475569" }}>
              None
            </button>
          </div>
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            {exercises.map(e => (
              <label key={e.code} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, cursor: "pointer", marginBottom: 2 }}>
                <input type="checkbox" checked={selectedCodes.has(e.code)}
                  onChange={() => toggleCode(e.code)} style={{ accentColor: "#0F4C81" }} />
                <span style={{ fontWeight: 500 }}>{e.name}</span>
                <span style={{ color: "#94A3B8", fontFamily: "monospace", fontSize: 8 }}>{e.code}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Print button */}
        <button onClick={handlePrint} className="no-print" style={{
          width: "100%", padding: "10px 16px", borderRadius: 6, cursor: "pointer",
          background: "#0F4C81", border: "none", color: "#fff",
          fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginTop: 12,
        }}>
          <FiPrinter size={14} /> Print Handout
        </button>

        {/* Layout preview info */}
        <div style={{ marginTop: 12, padding: "8px 10px", background: "#F8FAFC", borderRadius: 4, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "#64748B" }}>
            {selectedExercises.length} exercises selected
          </div>
          <div style={{ fontSize: 9, color: "#94A3B8" }}>
            ~{Math.ceil(selectedExercises.length / density.perPage)} printed page{Math.ceil(selectedExercises.length / density.perPage) !== 1 ? "s" : ""}
            {toggles.tracking && density.perPage <= 3 && !density.trackingCol ? " + tracking sheet" : ""}
          </div>
        </div>
      </div>

      {/* ── Right Panel (preview + print area) ── */}
      <div style={{
        flex: 1, overflowY: "auto", background: "#F1F5F9", padding: 24,
        display: "flex", justifyContent: "center",
      }}>
        <div ref={printRef} className="handout-print-area" style={{
          maxWidth: 680, width: "100%", background: "#fff",
          padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.1)",
          borderRadius: 4,
        }}>
          <HandoutHeader
            clinicName={clinicName}
            clinicLogo={clinicLogo}
            patientName={patientName}
            protocolName={protocolName}
          />

          {/* Phase notes */}
          {notes.trim() && (
            <div style={{
              fontSize: 9, color: "#475569", lineHeight: 1.5,
              padding: "6px 10px", marginBottom: 10,
              background: "#F8FAFC", borderRadius: 4, border: "1px solid #E2E8F0",
              fontStyle: "italic",
            }}>
              <strong style={{ fontStyle: "normal", color: "#1E293B" }}>Notes:</strong> {notes}
            </div>
          )}

          {selectedExercises.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 13 }}>
              No exercises selected
            </div>
          )}

          {selectedExercises.map((e, i) => (
            <HandoutCard key={e.code} exercise={e} density={density} toggles={toggles} index={i} />
          ))}

          {toggles.tracking && selectedExercises.length > 0 && !density.trackingCol && density.perPage <= 3 && (
            <HandoutTrackingSheet exercises={selectedExercises} clinicName={clinicName} patientName={patientName} />
          )}

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 7, color: "#CBD5E1", borderTop: "1px solid #E2E8F0", paddingTop: 8 }}>
            Generated by K9 Rehab Pro™ · B.E.A.U. AI — Biomedical Evidence-based Analytical Unit for Canine and Feline Rehabilitation
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}
