import React from "react";
import { FiFileText, FiPrinter, FiBook } from "react-icons/fi";
import S from "../../constants/styles";
import { sty } from "./constants";
import { SettingsToggle, SettingsSection } from "./SettingsShared";

export function TabDocumentation({ docSettings, setDocSettings, flashSave, isOpen, toggleSection }) {
  return (
    <div>
      <SettingsSection id="doc_content" open={isOpen("doc_content")} onToggle={toggleSection} icon={FiFileText} title="Report Content">
        <SettingsToggle value={docSettings.include_citations}
          onChange={v => setDocSettings({ ...docSettings, include_citations: v })}
          label="Include Evidence Citations"
          desc="Append peer-reviewed references (Millis & Levine, Zink & Van Dyke) to each exercise" />
        <SettingsToggle value={docSettings.include_contraindications}
          onChange={v => setDocSettings({ ...docSettings, include_contraindications: v })}
          label="Include Contraindications"
          desc="Display contraindication warnings per exercise and per protocol phase" />
        <SettingsToggle value={docSettings.include_progression_criteria}
          onChange={v => setDocSettings({ ...docSettings, include_progression_criteria: v })}
          label="Include Progression Criteria"
          desc="Show gated progression requirements between each protocol phase" />
        <SettingsToggle value={docSettings.include_json_blocks}
          onChange={v => setDocSettings({ ...docSettings, include_json_blocks: v })}
          label="Include JSON Blocks (Developer Mode)"
          desc="Append machine-readable JSON objects for EHR/API integration" />
      </SettingsSection>

      <SettingsSection id="doc_format" open={isOpen("doc_format")} onToggle={toggleSection} icon={FiPrinter} title="Export & Formatting">
        <div style={S.grid(2)}>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Default Export Format</label>
            <select style={{ ...S.select, width: "100%" }} value={docSettings.default_export_format}
              onChange={e => setDocSettings({ ...docSettings, default_export_format: e.target.value })}>
              <option value="pdf">PDF Document</option>
              <option value="print">Print-Ready (Browser Print)</option>
              <option value="csv">CSV (Spreadsheet)</option>
              <option value="json">JSON (API / EHR Export)</option>
            </select>
          </div>
          <div style={sty.fieldRow}>
            <SettingsToggle value={docSettings.logo_on_reports}
              onChange={v => setDocSettings({ ...docSettings, logo_on_reports: v })}
              label="Clinic Logo on Reports"
              desc="Display your practice logo in the report header" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="doc_custom" open={isOpen("doc_custom")} onToggle={toggleSection} icon={FiBook} title="Custom Header & Footer">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Report Header Text</label>
          <input style={S.input} value={docSettings.report_header}
            onChange={e => setDocSettings({ ...docSettings, report_header: e.target.value })}
            placeholder="e.g. Canine Rehabilitation & Sports Medicine Center" />
          <div style={sty.fieldHint}>Appears at the top of every generated report</div>
        </div>
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Report Footer / Disclaimer</label>
          <textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }}
            value={docSettings.report_footer}
            onChange={e => setDocSettings({ ...docSettings, report_footer: e.target.value })} />
          <div style={sty.fieldHint}>Legal disclaimer or branding line appended to report footer</div>
        </div>
      </SettingsSection>

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Documentation Settings</button>
      </div>
    </div>
  );
}
