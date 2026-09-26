import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import C from "../constants/colors";
import ClinicalFooter from "../components/ClinicalFooter";
import { useToast } from "../components/Toast";
import { useTheme } from "../components/ThemeProvider";
import { useTr } from "../i18n/useTr";
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
import { TabClinicConfig } from "./settings/TabClinicConfig";

function SettingsView({ setBrand }) {
  const toast = useToast();
  const tr = useTr();
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
              {tr(g.label)}
            </span>
            {TABS.filter(t => t.group === g.key).map(t => (
              <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => { state.setActiveTab(t.id); const el = document.querySelector("[data-content-scroll]"); if (el) el.scrollTop = 0; })(e); } }} key={t.id} style={sty.tab(state.activeTab === t.id)} onClick={() => {
                state.setActiveTab(t.id);
                const el = document.querySelector("[data-content-scroll]");
                if (el) el.scrollTop = 0;
              }}>
                <t.icon size={13} />
                {tr(t.label)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* ── Save confirmation ──────────────────────────────────────────────
          FIXED AND CENTRED, 2026-09-26.

          This used to render in the normal flow at the top of the page, above
          the tab content. The clinic form is longer than the viewport, so by
          the time you reached Save you had scrolled past where the message
          would appear — it fired, off-screen, every time.

          Sal: "THE REASON I CLICKED SAVE MULTIPLE TIMES WAS THAT I DIDNT SEE
          THE POP SAVE SUCCESSFUKKY". Three clicks, and a separate bug meant
          each one CREATED a clinic. That bug is fixed; this is the reason he
          pressed the button three times in the first place.

          Centred near the top rather than mid-screen: impossible to miss,
          without covering the form just filled in. pointerEvents none so it
          can never swallow a click. */}
      {state.saved && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed", top: 90, left: "50%", transform: "translateX(-50%)",
            zIndex: 600, pointerEvents: "none",
            padding: "14px 26px", borderRadius: 10,
            background: C.greenBg, border: `1.5px solid ${C.green}`,
            boxShadow: "0 8px 28px rgba(16,185,129,0.28)",
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 15, fontWeight: 700, color: C.green,
          }}
        >
          <FiCheckCircle size={19} /> {tr("Settings saved successfully")}
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
        <TabEquipment {...shared} />
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
      {state.activeTab === "clinic-config" && (
        <TabClinicConfig {...shared} />
      )}

      {/* ── Platform version footer ── */}
      <ClinicalFooter variant="bar" />
    </div>
  );
}

export default SettingsView;
