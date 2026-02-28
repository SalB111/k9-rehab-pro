import React from "react";
import { FiAward, FiCheckCircle } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { sty, CREDENTIAL_OPTIONS, BOARD_CERT_OPTIONS } from "./constants";
import { SettingsSection } from "./SettingsShared";

export function TabClinician({ clinician, setClinician, flashSave, isOpen, toggleSection }) {
  return (
    <div>
      <SettingsSection id="clin_id" open={isOpen("clin_id")} onToggle={toggleSection} icon={FiAward} title="Clinician Identity">
        <div style={S.grid(2)}>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Full Name</label>
            <input style={S.input} value={clinician.name}
              onChange={e => setClinician({ ...clinician, name: e.target.value })}
              placeholder="Dr. Jane Smith" />
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Professional Title</label>
            <select style={{ ...S.select, width: "100%" }} value={clinician.title}
              onChange={e => setClinician({ ...clinician, title: e.target.value })}>
              <option value="DVM">DVM — Doctor of Veterinary Medicine</option>
              <option value="VMD">VMD — Veterinariae Medicinae Doctoris</option>
              <option value="PT">PT — Physical Therapist</option>
              <option value="DPT">DPT — Doctor of Physical Therapy</option>
              <option value="CVT">CVT — Certified Veterinary Technician</option>
              <option value="RVT">RVT — Registered Veterinary Technician</option>
            </select>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>State License Number</label>
            <input style={S.input} value={clinician.license_number}
              onChange={e => setClinician({ ...clinician, license_number: e.target.value })} />
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>License State</label>
            <input style={S.input} value={clinician.license_state}
              onChange={e => setClinician({ ...clinician, license_state: e.target.value })}
              placeholder="e.g. CA, TX, NY" />
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>National Provider Identifier (NPI)</label>
            <input style={S.input} value={clinician.npi}
              onChange={e => setClinician({ ...clinician, npi: e.target.value })}
              placeholder="10-digit NPI (optional)" />
            <div style={sty.fieldHint}>Required for insurance billing and referral coordination</div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="clin_certs" open={isOpen("clin_certs")} onToggle={toggleSection} icon={FiCheckCircle} title="Certifications & Board Diplomate Status">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Rehabilitation Certifications</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            {CREDENTIAL_OPTIONS.map(cred => {
              const active = clinician.credentials.includes(cred);
              return (
                <div key={cred} onClick={() => {
                  setClinician(prev => ({
                    ...prev,
                    credentials: active
                      ? prev.credentials.filter(c => c !== cred)
                      : [...prev.credentials, cred],
                  }));
                }} style={{
                  padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.3px",
                  background: active ? C.teal : "rgba(255,255,255,0.08)",
                  color: "#fff",
                  border: active ? `1px solid ${C.teal}` : `1px solid rgba(255,255,255,0.2)`,
                  transition: "all 0.15s",
                }}>
                  {cred}
                </div>
              );
            })}
          </div>
          <div style={sty.fieldHint}>Select all certifications held by the primary clinician</div>
        </div>

        <div style={{ ...sty.fieldRow, marginTop: 20 }}>
          <label style={sty.fieldLabel}>Board Diplomate Status</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {BOARD_CERT_OPTIONS.map(cert => {
              const active = clinician.board_certs.includes(cert);
              return (
                <div key={cert} onClick={() => {
                  setClinician(prev => ({
                    ...prev,
                    board_certs: active
                      ? prev.board_certs.filter(c => c !== cert)
                      : [...prev.board_certs, cert],
                  }));
                }} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                  background: active ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                  border: active ? `2px solid ${C.teal}` : `1px solid rgba(255,255,255,0.15)`,
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: active ? C.teal : "rgba(255,255,255,0.1)",
                    border: active ? "none" : `2px solid rgba(255,255,255,0.3)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11,
                  }}>
                    {active && "\u2713"}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: "#fff" }}>{cert}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Clinician Profile</button>
      </div>
    </div>
  );
}
