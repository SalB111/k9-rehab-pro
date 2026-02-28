import React, { useState } from "react";
import { FiBookOpen, FiActivity, FiDatabase, FiCpu, FiAward } from "react-icons/fi";
import C from "../constants/colors";

// ─────────────────────────────────────────────
// WELCOME / SPLASH VIEW
// ─────────────────────────────────────────────
function WelcomeView({ onEnter, onAbout }) {
  const [hovering, setHovering] = useState(false);
  const [hoverNav, setHoverNav] = useState(null);

  const navItems = [
    { id: "about", label: "About", icon: FiBookOpen, action: onAbout },
    { id: "protocols", label: "4 Protocols", icon: FiActivity, action: null },
    { id: "exercises", label: "223 Exercises", icon: FiDatabase, action: null },
    { id: "vetai", label: "VetAI", icon: FiCpu, action: null },
    { id: "evidence", label: "ACVSMR", icon: FiAward, action: null },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "#030c18",
    }}>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes welcomePulse {
          0%, 100% { box-shadow: 0 0 14px rgba(14,165,233,0.45), 0 0 28px rgba(14,165,233,0.2), inset 0 0 12px rgba(14,165,233,0.08); }
          50% { box-shadow: 0 0 28px rgba(14,165,233,0.75), 0 0 56px rgba(14,165,233,0.35), 0 0 80px rgba(14,165,233,0.15), inset 0 0 20px rgba(14,165,233,0.12); }
        }
        .welcome-enter-btn { animation: welcomePulse 2.4s ease-in-out infinite; }
        .welcome-enter-btn:hover { animation: none !important; box-shadow: 0 0 40px rgba(14,165,233,0.8), 0 0 70px rgba(14,165,233,0.4) !important; border-radius: 6px !important; }

        @keyframes sweepDown1 {
          0% { transform: translateY(-4px); opacity: 0; }
          4% { opacity: 0.85; }
          96% { opacity: 0.65; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes sweepDown2 {
          0% { transform: translateY(-4px); opacity: 0; }
          4% { opacity: 0.4; }
          96% { opacity: 0.28; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes boltFlash {
          0%, 80%, 100% { opacity: 0; }
          82% { opacity: 0.55; }
          84% { opacity: 0.05; }
          86% { opacity: 0.45; }
          88% { opacity: 0; }
        }

        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.25); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); }
        }

        @keyframes ecgScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .vital-heart {
          animation: heartPulse 1.2s ease-in-out infinite;
          filter: drop-shadow(0 0 6px rgba(74,222,128,0.6));
        }

        .ecg-scroll-track {
          animation: ecgScroll 3s linear infinite;
        }
      `}</style>

      {/* ── BACKGROUND IMAGE ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/k9-hero.png')",
        backgroundSize: "contain", backgroundPosition: "center center", backgroundRepeat: "no-repeat",
      }} />

      {/* Subtle teal glow over platform center */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 55%, rgba(0,210,255,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* ── Electric scan overlay ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right, transparent 5%, rgba(14,165,233,0.7) 35%, rgba(96,220,255,0.95) 50%, rgba(14,165,233,0.7) 65%, transparent 95%)",
          boxShadow: "0 0 6px 1px rgba(14,165,233,0.55)",
          animation: "sweepDown1 3.2s linear infinite",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right, transparent 10%, rgba(56,189,248,0.45) 40%, rgba(56,189,248,0.6) 50%, rgba(56,189,248,0.45) 60%, transparent 90%)",
          animation: "sweepDown2 6.8s linear infinite", animationDelay: "1.9s",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, rgba(14,165,233,0.06) 0%, transparent 70%)",
          animation: "boltFlash 5.3s ease-in-out infinite", animationDelay: "1.1s",
        }} />
      </div>

      {/* ── TOP HEADER BAR ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 4,
        background: "linear-gradient(to bottom, rgba(3,12,24,0.88) 0%, rgba(3,12,24,0.5) 70%, transparent 100%)",
        padding: "18px 32px 28px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
      }}>
        {/* Nav buttons — centered row, top */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoverNav === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action || undefined}
                onMouseEnter={() => setHoverNav(item.id)}
                onMouseLeave={() => setHoverNav(null)}
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: isHovered ? "rgba(14,165,233,0.2)" : "transparent",
                  border: "1px solid " + (isHovered ? "rgba(14,165,233,0.5)" : "transparent"),
                  borderRadius: 6, padding: "7px 14px",
                  color: isHovered ? C.teal : "rgba(255,255,255,0.6)",
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase",
                  cursor: item.action ? "pointer" : "default",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={13} /> {item.label}
              </button>
            );
          })}
        </div>

        {/* Title — centered */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <h1 style={{
            fontFamily: "'Exo 2', 'Orbitron', 'Segoe UI', sans-serif",
            fontSize: 36, fontWeight: 900, margin: 0,
            color: "#fff", letterSpacing: "5px", lineHeight: 1,
            textTransform: "uppercase",
            textShadow:
              "0 0 20px rgba(14,165,233,0.9), " +
              "0 0 40px rgba(14,165,233,0.4), " +
              "0 2px 0 rgba(0,80,140,0.9)",
          }}>
            K9 REHAB PRO
          </h1>
          <span style={{
            fontSize: 10, fontWeight: 700, color: "rgba(14,165,233,0.7)",
            verticalAlign: "super", letterSpacing: 1,
          }}>{"\u2122"}</span>
        </div>

        {/* Subtitle badge — centered below title */}
        <div style={{
          fontSize: 11, fontWeight: 900, color: "#030c18",
          letterSpacing: "3px", textTransform: "uppercase",
          background: "rgba(14,165,233,0.85)",
          padding: "4px 16px", borderRadius: 3,
        }}>
          Evidence-Based Exercise Protocols
        </div>
      </div>

      {/* ── Bottom gradient fade ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "25%", zIndex: 2,
        background: "linear-gradient(to top, rgba(3,12,24,0.9) 0%, rgba(3,12,24,0.4) 60%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Vital Signs: Pulsing heart overlay ── */}
      <div style={{
        position: "absolute", left: "30.35%", top: "77.5%", transform: "translate(-50%, -50%)",
        zIndex: 5, pointerEvents: "none",
      }}>
        <svg className="vital-heart" width="68" height="68" viewBox="0 0 24 24" fill="#4ade80">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      {/* ── Black box to cover static EKG on monitor ── */}
      <div style={{
        position: "absolute", left: "18.2%", top: "74.2%",
        width: "9%", height: "9%",
        background: "#12283d",
        transform: "skewX(-20deg) rotate(2.5deg)",
        zIndex: 4, pointerEvents: "none",
      }} />

      {/* ── Animated EKG sine wave on monitor ── */}
      <div style={{
        position: "absolute", left: "18.2%", top: "78.6%",
        width: "9%", height: "3%",
        overflow: "hidden",
        transform: "skewX(-20deg) rotate(2.5deg)",
        zIndex: 5, pointerEvents: "none",
      }}>
        <svg className="ecg-scroll-track" width="200%" height="100%" viewBox="0 0 400 40" preserveAspectRatio="none">
          <path
            d={
              /* Cycle 1 (0-100) */
              "M0,22 L20,22" +
              " C23,22 26,19 28,19 C30,19 33,22 35,22" +
              " L40,22 L42,25" +
              " L45,1 L48,37" +
              " L50,22 L58,22" +
              " C61,22 65,16 69,16 C73,16 77,22 80,22" +
              " L100,22" +
              /* Cycle 2 (100-200) */
              " L120,22" +
              " C123,22 126,19 128,19 C130,19 133,22 135,22" +
              " L140,22 L142,25" +
              " L145,1 L148,37" +
              " L150,22 L158,22" +
              " C161,22 165,16 169,16 C173,16 177,22 180,22" +
              " L200,22" +
              /* Cycle 3 (200-300) */
              " L220,22" +
              " C223,22 226,19 228,19 C230,19 233,22 235,22" +
              " L240,22 L242,25" +
              " L245,1 L248,37" +
              " L250,22 L258,22" +
              " C261,22 265,16 269,16 C273,16 277,22 280,22" +
              " L300,22" +
              /* Cycle 4 (300-400) */
              " L320,22" +
              " C323,22 326,19 328,19 C330,19 333,22 335,22" +
              " L340,22 L342,25" +
              " L345,1 L348,37" +
              " L350,22 L358,22" +
              " C361,22 365,16 369,16 C373,16 377,22 380,22" +
              " L400,22"
            }
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
          />
        </svg>
      </div>

      {/* ── ENTER PLATFORM — on the platform front face ── */}
      <div style={{
        position: "absolute", top: "59.5%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 3,
      }}>
        <button
          className="welcome-enter-btn"
          onClick={onEnter}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            fontFamily: "'Exo 2', sans-serif",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: hovering ? "rgba(15,76,129,0.95)" : "rgba(15,76,129,0.85)",
            border: "1px solid rgba(14,165,233,0.6)",
            borderRadius: 6,
            backdropFilter: "blur(16px)",
            color: "#fff", fontSize: 20, fontWeight: 900,
            padding: "4px 22px",
            cursor: "pointer",
            letterSpacing: "4px", textTransform: "uppercase",
            transition: "background 0.22s, transform 0.22s",
            transform: hovering ? "translateY(-3px)" : "none",
          }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}

export default WelcomeView;
