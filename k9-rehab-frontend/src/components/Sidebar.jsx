import React, { useState, useEffect, useRef } from "react";
import NAV from "../constants/navigation";
import { FiPlus, FiLogOut, FiChevronLeft, FiChevronRight, FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES } from "../i18n";
import { useTr } from "../i18n/useTr";

export default function Sidebar({ view, setView, currentUser, onLogout, hospitalLanguageLocked }) {
  const tr = useTr();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("k9-sidebar") === "collapsed"; } catch { return false; }
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("k9-sidebar", next ? "collapsed" : "open"); } catch {}
  };

  // Exercise Library click routes to Dashboard Block 11
  const handleNavClick = (id) => {
    if (id === "exercises") {
      try { localStorage.setItem("beau_open_block", "library"); } catch {}
      setView("dashboard");
    } else {
      setView(id);
    }
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
              {tr("CLINICAL PLATFORM")}
            </p>
          </div>
        )}
      </div>

      {/* Language Selector — FIRST item, above New Client/Patient Intake */}
      {!hospitalLanguageLocked && (
        <SidebarLanguage collapsed={collapsed} />
      )}

      {/* New Patient Intake */}
      <div className="px-3 mt-2 mb-2">
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
          {!collapsed && <span>{tr("New Client/Patient Intake")}</span>}
        </button>
      </div>

      {/* Nav Items */}
      <SidebarNav NAV={NAV} view={view} setView={handleNavClick} collapsed={collapsed} />

      {/* Bottom Section */}
      <div className="mt-auto border-t border-white/10">
        {currentUser && (
          <div className={`px-4 py-3 ${collapsed ? "text-center" : ""}`}>
            {!collapsed && (
              <>
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser.username || tr("Clinician")}
                </p>
                <p className="text-[10px] text-[#7AAACF] capitalize">
                  {tr(currentUser.role || "clinician")}
                </p>
              </>
            )}
            <button
              onClick={onLogout}
              title={tr("Save session & return to login — another clinician can sign in")}
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
              {!collapsed && <span>{tr("Save & Exit")}</span>}
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
function SidebarNav({ NAV, view, setView, collapsed }) {
  const tr = useTr();
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

        const hoverStyle = hovered ? {
          background: "rgba(0,229,255,0.08)",
          border: "1px solid rgba(0,229,255,0.25)",
          color: "#ffffff",
          boxShadow: "0 0 8px rgba(0,229,255,0.15)",
        } : {};

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
            title={collapsed ? `${tr(item.label)} — ${tr(item.desc)}` : tr(item.desc)}
            style={finalStyle}
          >
            <Icon style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              filter: active ? "drop-shadow(0 0 4px rgba(0,229,255,0.8))" : "none",
            }}/>
            {!collapsed && <span>{tr(item.label)}</span>}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Language Selector — Prominent capsule at top of sidebar ─────────────────
function SidebarLanguage({ collapsed }) {
  const { t, i18n: i18nInst } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SUPPORTED_LOCALES.find(l => l.code === i18nInst.language)
    || SUPPORTED_LOCALES.find(l => i18nInst.language?.startsWith(l.code))
    || SUPPORTED_LOCALES[0];

  // Close on outside click
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} style={{ padding: "10px 12px 4px 12px" }}>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? `${t("languageSelector.label")}: ${current.name}` : t("languageSelector.selectPlatformLanguage")}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: collapsed ? "8px 6px" : "9px 14px",
          borderRadius: 24,
          background: open ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${open ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.15)"}`,
          color: open ? "#00e5ff" : "rgba(255,255,255,0.85)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontFamily: "inherit",
          fontSize: 12,
          fontWeight: 600,
          justifyContent: collapsed ? "center" : "flex-start",
          boxShadow: open ? "0 0 10px rgba(0,229,255,0.15)" : "none",
        }}
      >
        <FiGlobe style={{ width: 16, height: 16, flexShrink: 0 }} />
        {!collapsed && (
          <>
            <span style={{ fontSize: 15, lineHeight: 1 }}>{current.flag}</span>
            <span style={{ flex: 1, textAlign: "left" }}>{current.name}</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
          </>
        )}
      </button>

      {!collapsed && (
        <div style={{
          fontSize: 9,
          color: "rgba(122,170,207,0.7)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textAlign: "center",
          marginTop: 3,
          fontWeight: 600,
        }}>
          {t("languageSelector.selectPlatformLanguage")}
        </div>
      )}

      {open && !collapsed && (
        <div style={{
          marginTop: 6,
          borderRadius: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: 240,
          overflowY: "auto",
        }}>
          {SUPPORTED_LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => { i18nInst.changeLanguage(l.code); setOpen(false); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                fontSize: 11,
                fontWeight: l.code === current.code ? 700 : 400,
                color: l.code === current.code ? "#00e5ff" : "rgba(255,255,255,0.7)",
                background: l.code === current.code ? "rgba(0,229,255,0.1)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (l.code !== current.code) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (l.code !== current.code) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14 }}>{l.flag}</span>
              <span>{l.name}</span>
              {l.code === current.code && <span style={{ marginLeft: "auto", fontSize: 10 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
