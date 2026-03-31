import React from "react";

export default function TopNav({ brand, setView }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "12px 18px",
        justifyContent: "flex-start",
        background: "#ffffff",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        boxSizing: "border-box"
      }}
    >
      <style>{`
        @keyframes faviconGlow {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(57,255,126,0.4))
                    drop-shadow(0 0 10px rgba(14,165,233,0.2));
          }
          50% {
            filter: drop-shadow(0 0 10px rgba(57,255,126,0.8))
                    drop-shadow(0 0 22px rgba(14,165,233,0.4))
                    drop-shadow(0 0 36px rgba(57,255,126,0.15));
          }
        }
      `}</style>

      <div
        onClick={() => setView("generator")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer"
        }}
      >
        <img
          src="/logo.svg"
          alt="K9 Rehab Pro"
          style={{
            width: 30,
            height: 30,
            animation: "faviconGlow 2.8s ease-in-out infinite"
          }}
        />

        <span
          style={{
            fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', sans-serif",
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: "2.5px",
            background:
              "linear-gradient(90deg, #0A2540 0%, #0F3460 40%, #0EA5E9 70%, #39FF7E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {brand?.clinicName || "K9 REHAB PRO™"}
        </span>
      </div>
    </div>
  );
}