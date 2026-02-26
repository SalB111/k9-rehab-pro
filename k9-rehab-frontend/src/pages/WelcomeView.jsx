import React, { useState } from "react";
import { FiBookOpen } from "react-icons/fi";

// ─────────────────────────────────────────────
// WELCOME / SPLASH VIEW
// ─────────────────────────────────────────────
function WelcomeView({ onEnter, onAbout }) {
  const [hovering, setHovering] = React.useState(false);
  const [aboutHover, setAboutHover] = React.useState(false);

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
        .welcome-enter-btn:hover { animation: none !important; box-shadow: 0 0 40px rgba(14,165,233,0.8), 0 0 70px rgba(14,165,233,0.4) !important; }

        @keyframes pulseWave {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes vitalGlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
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
      `}</style>

      {/* ── BACKGROUND IMAGE ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/welcome-lab.png')",
        backgroundSize: "cover", backgroundPosition: "center center", backgroundRepeat: "no-repeat",
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

      {/* ── K9 REHAB PRO — center top ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 3,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 36,
      }}>
        <h1 style={{
          fontFamily: "'Exo 2', 'Orbitron', 'Segoe UI', sans-serif",
          fontSize: 52, fontWeight: 900, margin: "0 0 10px",
          color: "#fff", letterSpacing: "6px", lineHeight: 1,
          textTransform: "uppercase",
          textShadow:
            "0 0 24px rgba(14,165,233,0.9), " +
            "0 0 48px rgba(14,165,233,0.5), " +
            "0 2px 0 rgba(0,80,140,0.9), " +
            "0 4px 10px rgba(0,0,0,0.7)",
        }}>
          K9 REHAB PRO
        </h1>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "rgba(14,165,233,0.85)",
          letterSpacing: "2.5px", textTransform: "uppercase",
          textShadow: "0 0 12px rgba(14,165,233,0.5)",
        }}>
          Evidence-Based Canine Exercise Protocols
        </div>
      </div>

      {/* ── ABOUT BUTTON — bottom left ── */}
      <div style={{ position: "absolute", bottom: 48, left: 52, zIndex: 3 }}>
        <button
          onClick={onAbout}
          onMouseEnter={() => setAboutHover(true)}
          onMouseLeave={() => setAboutHover(false)}
          style={{
            fontFamily: "'Exo 2', sans-serif",
            display: "inline-flex", alignItems: "center", gap: 8,
            background: aboutHover ? "rgba(14,165,233,0.28)" : "rgba(14,165,233,0.12)",
            border: "1px solid rgba(14,165,233,0.5)",
            borderRadius: 40, padding: "10px 26px",
            backdropFilter: "blur(12px)",
            color: "#0EA5E9", fontSize: 13, fontWeight: 700,
            letterSpacing: "1.6px", textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.22s, transform 0.22s",
            transform: aboutHover ? "translateY(-2px)" : "none",
            boxShadow: aboutHover ? "0 0 24px rgba(14,165,233,0.5)" : "0 0 10px rgba(14,165,233,0.2)",
          }}
        >
          <FiBookOpen size={15} /> About
        </button>
      </div>

      {/* ── ENTER PLATFORM — center bottom ── */}
      <div style={{
        position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)", zIndex: 3,
      }}>
        <button
          className="welcome-enter-btn"
          onClick={onEnter}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            fontFamily: "'Exo 2', sans-serif",
            display: "inline-flex", alignItems: "center", gap: 10,
            background: hovering ? "rgba(14,165,233,0.28)" : "rgba(14,165,233,0.14)",
            border: "1px solid rgba(14,165,233,0.55)",
            borderRadius: 40,
            backdropFilter: "blur(12px)",
            color: "#0EA5E9", fontSize: 14, fontWeight: 700,
            padding: "12px 36px",
            cursor: "pointer",
            letterSpacing: "2px", textTransform: "uppercase",
            transition: "background 0.22s, transform 0.22s",
            transform: hovering ? "translateY(-2px)" : "none",
          }}
        >
          Enter Platform →
        </button>
      </div>
    </div>
  );
}

export default WelcomeView;
