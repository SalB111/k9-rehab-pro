import React from "react";
import { FiChevronDown } from "react-icons/fi";
import C from "../../constants/colors";
import { settingsStyles } from "./constants";

export function SettingsToggle({ value, onChange, label, desc }) {
  return (
    <div style={settingsStyles.toggleRow}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={settingsStyles.toggleTrack(value)} onClick={() => onChange(!value)}>
        <div style={settingsStyles.toggleDot} />
      </div>
    </div>
  );
}

export function SettingsSection({ id, icon: Icon, title, open, onToggle, children }) {
  return (
    <div style={settingsStyles.sectionCard}>
      <div style={settingsStyles.sectionHeader(open)} onClick={() => onToggle(id)}>
        <div style={settingsStyles.sectionTitle()}>
          <Icon size={16} />
          {title}
        </div>
        <FiChevronDown size={16} style={{
          color: "#fff",
          transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.2s ease",
        }} />
      </div>
      {open && (
        <>
          <div style={settingsStyles.neonLine}>
            <div style={settingsStyles.neonLineInner} />
          </div>
          <div style={settingsStyles.sectionBody}>{children}</div>
        </>
      )}
    </div>
  );
}
