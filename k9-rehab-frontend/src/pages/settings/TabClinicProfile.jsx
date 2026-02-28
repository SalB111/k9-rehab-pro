import React from "react";
import { FiHome, FiSliders } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { sty } from "./constants";
import { SettingsSection } from "./SettingsShared";

export function TabClinicProfile({ form, setForm, saving, saveClinic, isOpen, toggleSection }) {
  return (
    <div>
      <SettingsSection id="clinic_info" open={isOpen("clinic_info")} onToggle={toggleSection} icon={FiHome} title="Practice Information">
        <div style={S.grid(2)}>
          {[
            ["clinic_name", "Practice Name", "Full legal name of your veterinary practice"],
            ["contact_email", "Contact Email", "Primary clinic email address"],
            ["phone", "Phone Number", "Main phone line"],
            ["address", "Address", "Street address, city, state, ZIP"],
            ["website", "Website", "Practice website URL"],
            ["license_number", "Veterinary Facility License", "State facility license number"],
            ["dea_number", "DEA Registration", "DEA registration number (if applicable)"],
          ].map(([key, label, hint]) => (
            <div key={key} style={sty.fieldRow}>
              <label style={sty.fieldLabel}>{label}</label>
              <input style={S.input} value={form[key] || ""}
                onChange={e => setForm({ ...form, [key]: e.target.value })} />
              <div style={sty.fieldHint}>{hint}</div>
            </div>
          ))}
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Facility Type</label>
            <select style={{ ...S.select, width: "100%" }} value={form.clinic_type}
              onChange={e => setForm({ ...form, clinic_type: e.target.value })}>
              <option value="specialty_referral">Specialty Referral Hospital</option>
              <option value="general_practice">General Practice</option>
              <option value="university">University Teaching Hospital</option>
              <option value="rehabilitation_center">Dedicated Rehabilitation Center</option>
              <option value="mobile">Mobile Rehabilitation Service</option>
              <option value="multi_location">Multi-Location Corporate</option>
            </select>
            <div style={sty.fieldHint}>Determines default workflow and report formatting</div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="clinic_brand" open={isOpen("clinic_brand")} onToggle={toggleSection} icon={FiSliders} title="Branding & Colors">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Logo URL</label>
          <input style={S.input} value={form.logo_url || ""}
            onChange={e => setForm({ ...form, logo_url: e.target.value })} />
          <div style={sty.fieldHint}>URL to your clinic logo (displayed on reports and dashboard)</div>
        </div>

        <div style={{ display: "flex", gap: 40, marginTop: 16 }}>
          <div>
            <label style={sty.fieldLabel}>Primary Color</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              {["#0F4C81", "#0EA5E9", "#10B981", "#7C3AED", "#DC2626"].map(color => (
                <div key={color} onClick={() => setForm({ ...form, primary_color: color })}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: color, cursor: "pointer",
                    border: form.primary_color === color ? `3px solid ${C.text}` : "3px solid transparent",
                    transition: "border 0.15s",
                  }} />
              ))}
              <input type="color" value={form.primary_color}
                onChange={e => setForm({ ...form, primary_color: e.target.value })}
                style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                  padding: 0, cursor: "pointer" }} />
            </div>
          </div>
          <div>
            <label style={sty.fieldLabel}>Secondary Color</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              {["#0EA5E9", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"].map(color => (
                <div key={color} onClick={() => setForm({ ...form, secondary_color: color })}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: color, cursor: "pointer",
                    border: form.secondary_color === color ? `3px solid ${C.text}` : "3px solid transparent",
                    transition: "border 0.15s",
                  }} />
              ))}
              <input type="color" value={form.secondary_color}
                onChange={e => setForm({ ...form, secondary_color: e.target.value })}
                style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                  padding: 0, cursor: "pointer" }} />
            </div>
          </div>
        </div>
      </SettingsSection>

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={saveClinic} disabled={saving}>
          {saving ? "Saving..." : "Save Clinic Profile"}
        </button>
      </div>
    </div>
  );
}
