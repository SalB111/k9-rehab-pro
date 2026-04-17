import React, { useState } from "react";
import NAV from "../constants/navigation";
import { FiPlus, FiLogOut, FiChevronLeft, FiChevronRight, FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES } from "../i18n";

export default function Sidebar({ view, setView, currentUser, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("k9-sidebar") === "collapsed"; } catch { return false; }
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("k9-sidebar", next ? "collapsed" : "open"); } catch {}
  };

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0 z-40
        bg-[#0C2340] text-white transition-all duration-300 ease-in-out
        ${collapsed ? "w-[68px]" : "w-[240px]"}
      `}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 cursor-pointer border-b border-white/10"
        onClick={() => setView("dashboard")}
      >
        <img src="/rod-logo.png" alt="K9" className="flex-shrink-0 w-10 h-10 object-contain" style={{ filter: "brightness(1.2) drop-shadow(0 0 6px rgba(14,165,233,0.4))" }} />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-logo text-[13px] font-black tracking-[2px] leading-none text-white whitespace-nowrap">
              K9 REHAB PRO
            </h1>
            <p className="text-[9px] tracking-[1.5px] text-[#7AAACF] mt-0.5 font-medium">
              CLINICAL PLATFORM
            </p>
          </div>
        )}
      </div>

      {/* New Patient Intake — routes to Dashboard Client & Patient block.
          Per Sal 2026-04-15: the old generator wizard is disabled (files
          remain on disk but navigation is rerouted). DashboardView reads
          "beau_open_block" from localStorage on mount and auto-opens the
          named block. */}
      <div className="px-3 mt-4 mb-2">
        <button
          onClick={() => {
            try { localStorage.setItem("beau_open_block", "client"); } catch {}
            setView("dashboard");
          }}
          className={`
            w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
            bg-gradient-to-r from-[#1D9E75] to-[#0EA5E9]
            text-white text-xs font-bold tracking-wide
            hover:shadow-lg hover:shadow-[#1D9E75]/25 transition-all duration-200
            ${collapsed ? "px-2" : "px-4"}
          `}
        >
          <FiPlus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>New Client/Patient Intake</span>}
        </button>
      </div>

      {/* Nav Items — capsule/pill clickable buttons
          Per Sal 2026-04-15: uses INLINE STYLES (not Tailwind) + useState
          hover tracking to guarantee the styling applies regardless of any
          Tailwind JIT/purge issues. Three states: inactive, hover, active. */}
      <SidebarNav NAV={NAV} view={view} setView={setView} collapsed={collapsed} />

      {/* Language Selector */}
      <SidebarLanguage collapsed={collapsed} />

      {/* Bottom Section */}
      <div className="mt-auto border-t border-white/10">
        {currentUser && (
          <div className={`px-4 py-3 ${collapsed ? "text-center" : ""}`}>
            {!collapsed && (
              <>
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser.username || "Clinician"}
                </p>
                <p className="text-[10px] text-[#7AAACF] capitalize">
                  {currentUser.role || "clinician"}
                </p>
              </>
            )}
            <button
              onClick={onLogout}
              title="Save session & return to login — another clinician can sign in"
              className={`
                flex items-center gap-2 text-[11px] font-semibold
                px-3 py-2 rounded-lg w-full
                bg-gradient-to-r from-[#0EA5E9]/10 to-[#1D9E75]/10
                border border-[#0EA5E9]/20
                text-[#0EA5E9] hover:text-white hover:from-[#0EA5E9]/20 hover:to-[#1D9E75]/20
                transition-all duration-200 mt-2
                ${collapsed ? "justify-center px-2" : ""}
              `}
            >
              <FiLogOut className="w-3.5 h-3.5" />
              {!collapsed && <span>Save & Exit</span>}
            </button>
          </div>
        )}

        <button
          onClick={toggle}
          className="w-full flex items-center justify-center py-2.5 text-[#7AAACF] hover:text-white transition-colors border-t border-white/5"
        >
          {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}

// ─── Nav item list with inline-style capsule buttons ────────────────────────
// Uses inline styles + useState hover tracking (not Tailwind) so the styling
// is guaranteed to apply regardless of build-tool purge behavior.
function SidebarNav({ NAV, view, setView, collapsed }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <nav
      style={{
        flex: 1,
        padding: "8px 12px 0 12px",
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflowY: "auto",
      }}
    >
      {NAV.map((item) => {
        const active = view === item.id;
        const hovered = hoveredId === item.id && !active;
        const Icon = item.icon;

        // Base capsule — INACTIVE state
        const baseStyle = {
          borderRadius: 24,
          padding: collapsed ? "8px 8px" : "8px 14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "rgba(255,255,255,0.78)",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          justifyContent: collapsed ? "center" : "flex-start",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          textAlign: "left",
          fontFamily: "inherit",
          boxShadow: "none",
        };

        // HOVER overrides
        const hoverStyle = hovered ? {
          background: "rgba(0,229,255,0.08)",
          border: "1px solid rgba(0,229,255,0.25)",
          color: "#ffffff",
          boxShadow: "0 0 8px rgba(0,229,255,0.15)",
        } : {};

        // ACTIVE overrides (takes priority over hover)
        const activeStyle = active ? {
          background: "rgba(0,229,255,0.15)",
          border: "1px solid rgba(0,229,255,0.5)",
          color: "#00e5ff",
          boxShadow: "0 0 12px rgba(0,229,255,0.2)",
          fontWeight: 700,
        } : {};

        const finalStyle = { ...baseStyle, ...hoverStyle, ...activeStyle };

        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            title={collapsed ? `${item.label} — ${item.desc}` : item.desc}
            style={finalStyle}
          >
            <Icon style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              filter: active ? "drop-shadow(0 0 4px rgba(0,229,255,0.8))" : "none",
            }}/>
            {!collapsed && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarLanguage({ collapsed }) {
  const { i18n: i18nInst } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LOCALES.find(l => l.code === i18nInst.language)
    || SUPPORTED_LOCALES.find(l => i18nInst.language?.startsWith(l.code))
    || SUPPORTED_LOCALES[0];

  return (
    <div className="px-2 mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg
          text-[12px] font-medium transition-all duration-150
          text-[#7AAACF] hover:bg-white/5 hover:text-white
          ${collapsed ? "justify-center px-0" : ""}
        `}
      >
        <FiGlobe className="w-[16px] h-[16px] flex-shrink-0" />
        {!collapsed && <span>{current.flag} {current.name}</span>}
      </button>
      {open && !collapsed && (
        <div className="mt-1 mx-1 rounded-lg bg-white/5 border border-white/10 max-h-[200px] overflow-y-auto">
          {SUPPORTED_LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => { i18nInst.changeLanguage(l.code); setOpen(false); }}
              className={`
                w-full flex items-center gap-2 px-3 py-1.5 text-[11px]
                transition-colors duration-100
                ${l.code === current.code ? "text-white bg-white/10 font-semibold" : "text-[#7AAACF] hover:text-white hover:bg-white/5"}
              `}
            >
              <span>{l.flag}</span> <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
