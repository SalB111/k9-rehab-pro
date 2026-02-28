import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import C from "../constants/colors";
import ClinicalFooter from "../components/ClinicalFooter";
import { useToast } from "../components/Toast";
import { useTheme } from "../components/ThemeProvider";
import { TABS, TAB_GROUPS, sty } from "./settings/constants";
import { useSettingsState } from "./settings/useSettingsState";
import { TabClinicProfile } from "./settings/TabClinicProfile";
import { TabClinician } from "./settings/TabClinician";
import { TabEquipment } from "./settings/TabEquipment";
import { TabProtocols } from "./settings/TabProtocols";
import { TabDocumentation } from "./settings/TabDocumentation";
import { TabNotifications } from "./settings/TabNotifications";
import { TabSecurity } from "./settings/TabSecurity";
import { TabAppearance } from "./settings/TabAppearance";
import { TabDataManagement } from "./settings/TabDataManagement";

function SettingsView({ setBrand }) {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const state = useSettingsState(setBrand, toast);

  // Shared props for all tabs
  const shared = { isOpen: state.isOpen, toggleSection: state.toggleSection, flashSave: state.flashSave };

  return (
    <div>
      {/* ── Tab bar (grouped) ── */}
      <div style={sty.tabBar}>
        {TAB_GROUPS.map(g => (
          <React.Fragment key={g.key}>
            <span style={{
              fontSize: 9, fontWeight: 700, color: C.textLight,
              textTransform: "uppercase", letterSpacing: "1px",
              padding: "8px 6px 8px 2px", whiteSpace: "nowrap",
            }}>
              {g.label}
            </span>
            {TABS.filter(t => t.group === g.key).map(t => (
              <div key={t.id} style={sty.tab(state.activeTab === t.id)} onClick={() => {
                state.setActiveTab(t.id);
                const el = document.querySelector("[data-content-scroll]");
                if (el) el.scrollTop = 0;
              }}>
                <t.icon size={13} />
                {t.label}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* ── Save confirmation ── */}
      {state.saved && (
        <div style={{
          padding: "10px 20px", marginBottom: 12, borderRadius: 8,
          background: C.greenBg, border: `1px solid ${C.green}`,
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, fontWeight: 600, color: C.green,
        }}>
          <FiCheckCircle size={16} /> Settings saved successfully
        </div>
      )}

      {/* ── Tab content ── */}
      {state.activeTab === "clinic" && (
        <TabClinicProfile form={state.form} setForm={state.setForm}
          saving={state.saving} saveClinic={state.saveClinic} {...shared} />
      )}
      {state.activeTab === "clinician" && (
        <TabClinician clinician={state.clinician} setClinician={state.setClinician} {...shared} />
      )}
      {state.activeTab === "equipment" && (
        <TabEquipment equipment={state.equipment} setEquipment={state.setEquipment} {...shared} />
      )}
      {state.activeTab === "protocols" && (
        <TabProtocols protocolDefaults={state.protocolDefaults} setProtocolDefaults={state.setProtocolDefaults} {...shared} />
      )}
      {state.activeTab === "documentation" && (
        <TabDocumentation docSettings={state.docSettings} setDocSettings={state.setDocSettings} {...shared} />
      )}
      {state.activeTab === "notifications" && (
        <TabNotifications notifications={state.notifications} setNotifications={state.setNotifications} {...shared} />
      )}
      {state.activeTab === "security" && (
        <TabSecurity security={state.security} setSecurity={state.setSecurity} {...shared} />
      )}
      {state.activeTab === "appearance" && (
        <TabAppearance appearance={state.appearance} setAppearance={state.setAppearance}
          theme={theme} setTheme={setTheme} {...shared} />
      )}
      {state.activeTab === "data" && (
        <TabDataManagement {...shared} />
      )}

      {/* ── Platform version footer ── */}
      <ClinicalFooter variant="bar" />
    </div>
  );
}

export default SettingsView;
