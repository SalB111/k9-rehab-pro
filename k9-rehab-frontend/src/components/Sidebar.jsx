import React, { useState } from "react";
import NAV from "../constants/navigation";
import { FiPlus, FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";

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

      {/* New Patient Intake — starts the clinical workflow */}
      <div className="px-3 mt-4 mb-2">
        <button
          onClick={() => setView("generator")}
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

      {/* Nav Items */}
      <nav className="flex-1 px-2 mt-2 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = view === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              title={collapsed ? `${item.label} — ${item.desc}` : item.desc}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-left text-[13px] font-medium transition-all duration-150
                ${active
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-[#7AAACF] hover:bg-white/5 hover:text-white"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `}
            >
              <div className="relative flex-shrink-0">
                <Icon className={`w-[18px] h-[18px] ${active ? "text-[#1D9E75]" : ""}`} />
                {active && (
                  <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#1D9E75]" />
                )}
              </div>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

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
              title="Sign out"
              className={`
                flex items-center gap-2 text-[11px] text-[#7AAACF]
                hover:text-red-400 transition-colors mt-1.5
                ${collapsed ? "mx-auto" : ""}
              `}
            >
              <FiLogOut className="w-3.5 h-3.5" />
              {!collapsed && <span>Sign Out</span>}
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
