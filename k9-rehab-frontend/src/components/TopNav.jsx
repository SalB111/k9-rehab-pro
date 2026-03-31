import React from "react";
import S from "../styles/TopNavStyles"; // adjust if your style file is elsewhere

export default function TopNav({ brand, setView }) {
  return (
    <div style={S.topNavContainer}>
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
        style={{
          ...S.topNavBrand,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}
        onClick={() => setView("generator")}
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