import React from "react";
import { FiLock, FiHome } from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import NAV from "../constants/navigation";

export default function TopNav({ view, setView, brand, dateStr, timeStr, currentUser, onLogout, genKey, setGenKey, setGenInitialStep }) {
  return (
    <>
      {/* White top bar — brand + clock + user */}
      <div style={S.topNav}>
        <style>{`
          @keyframes faviconGlow {
            0%, 100% { filter: drop-shadow(0 0 4px rgba(57,255,126,0.4)) drop-shadow(0 0 10px rgba(14,165,233,0.2)); }
            50% { filter: drop-shadow(0 0 10px rgba(57,255,126,0.8)) drop-shadow(0 0 22px rgba(14,165,233,0.4)) drop-shadow(0 0 36px rgba(57,255,126,0.15)); }
          }
        `}</style>
        <div style={{ ...S.topNavBrand, cursor: "pointer" }} onClick={() => setView("generator")}>
          <img src="/logo.svg" alt="K9 Rehab Pro"
            style={{ width: 30, height: 30, animation: "faviconGlow 2.8s ease-in-out infinite" }} />
          <span style={{
            fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', sans-serif",
            fontSize: 15, fontWeight: 900, letterSpacing: "2.5px",
            background: "linear-gradient(90deg, #0A2540 0%, #0F3460 40%, #0EA5E9 70%, #39FF7E 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{brand.clinicName || "K9 REHAB PRO\u2122"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{dateStr}</div>
            <div style={{ fontSize: 12, color: C.navy, fontWeight: 700, marginTop: 1, fontFamily: "'Exo 2', monospace", letterSpacing: "1px" }}>{timeStr}</div>
          </div>
          {currentUser && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: `1px solid ${C.border}`, paddingLeft: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{currentUser.display_name || currentUser.username}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.teal, textTransform: "uppercase", letterSpacing: 1 }}>{currentUser.role}</div>
              </div>
              <div
                onClick={onLogout}
                style={{
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                  color: C.textLight, border: `1px solid ${C.border}`,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = C.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.textLight; e.currentTarget.style.borderColor = C.border; }}
                title="Sign Out"
              >
                <FiLock size={10} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navy nav links bar */}
      <div style={{
        background: `linear-gradient(90deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 24px", height: 38, flexShrink: 0,
        gap: 2,
      }}>
        <div
          onClick={() => { setGenKey(k => k + 1); setView("home"); const el = document.querySelector("[data-content-scroll]"); if (el) el.scrollTop = 0; }}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 5, background: view === "home" ? "rgba(57,255,126,0.25)" : "rgba(57,255,126,0.12)", border: `1px solid ${view === "home" ? "rgba(57,255,126,0.6)" : "rgba(57,255,126,0.3)"}`, marginRight: 10, transition: "all 0.2s" }}
          title="Home — Section 1 Intake"
        >
          <FiHome size={12} style={{ color: "#39FF7E" }} />
        </div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <div key={id} style={S.topNavItem(id === "generator" ? (view === "generator" || view === "home") : view === id)} onClick={() => {
            if (id === "generator") {
              setGenInitialStep(2);
              setGenKey(k => k + 1);
            } else {
              setGenInitialStep(1);
            }
            setView(id);
            const contentEl = document.querySelector("[data-content-scroll]");
            if (contentEl) contentEl.scrollTop = 0;
          }}>
            <Icon size={12} /> <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Neon green flatline */}
      <div style={{ height: 3, width: "100%", overflow: "hidden", position: "relative", background: C.navy }}>
        <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "ekgScroll 3s linear infinite", boxShadow: "0 0 8px rgba(57,255,126,0.5), 0 0 16px rgba(57,255,126,0.2)" }} />
      </div>
    </>
  );
}
