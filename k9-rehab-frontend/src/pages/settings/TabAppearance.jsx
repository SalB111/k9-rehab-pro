import React from "react";
import { FiMonitor, FiSliders } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { sty } from "./constants";
import { SettingsSection } from "./SettingsShared";

export function TabAppearance({ appearance, setAppearance, theme, setTheme, flashSave, isOpen, toggleSection }) {
  return (
    <div>
      <SettingsSection id="app_theme" open={isOpen("app_theme")} onToggle={toggleSection} icon={FiMonitor} title="Theme & Display">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Interface Theme</label>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            {[
              ["clinical_light", "Clinical Light", "Clean white backgrounds, medical-grade readability"],
              ["clinical_dark", "Clinical Dark", "Dark navy backgrounds, reduced eye strain"],
              ["high_contrast", "High Contrast", "Maximum contrast for accessibility compliance"],
            ].map(([val, label, desc]) => (
              <div key={val} onClick={() => setTheme(val)}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                  background: theme === val ? C.teal : C.bg,
                  color: theme === val ? "#fff" : C.text,
                  border: theme === val ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                  transition: "all 0.15s",
                }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="app_layout" open={isOpen("app_layout")} onToggle={toggleSection} icon={FiSliders} title="Layout Preferences">
        <div style={S.grid(2)}>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Font Size</label>
            <select style={{ ...S.select, width: "100%" }} value={appearance.font_size}
              onChange={e => setAppearance({ ...appearance, font_size: e.target.value })}>
              <option value="compact">Compact — More content per screen</option>
              <option value="standard">Standard (Recommended)</option>
              <option value="large">Large — Enhanced readability</option>
            </select>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Exercise Card Display</label>
            <select style={{ ...S.select, width: "100%" }} value={appearance.exercise_card_display}
              onChange={e => setAppearance({ ...appearance, exercise_card_display: e.target.value })}>
              <option value="compact">Compact — Name, code, category only</option>
              <option value="detailed">Detailed (Recommended) — Full descriptions and evidence</option>
              <option value="clinical">Clinical — Phase mapping, contraindications, progression</option>
            </select>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Dashboard Layout</label>
            <select style={{ ...S.select, width: "100%" }} value={appearance.dashboard_layout}
              onChange={e => setAppearance({ ...appearance, dashboard_layout: e.target.value })}>
              <option value="standard">Standard — KPIs + recent patients + actions</option>
              <option value="clinical">Clinical Focus — Patient queue + outcome trends</option>
              <option value="administrative">Administrative — Utilization + billing + compliance</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Appearance Settings</button>
      </div>
    </div>
  );
}
