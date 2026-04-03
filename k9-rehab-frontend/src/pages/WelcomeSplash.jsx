import React, { useState, useEffect, useRef } from "react";
// Logo image at /beau-logo.jpg

/**
 * Cinematic welcome splash — Rod of Asclepius zooms in with sparks,
 * halts at full size, then text reveals. Click ENTER to proceed.
 */
// Typewriter hook — reveals text character by character
function useTypewriter(text, startDelay = 0, speed = 60, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(""); setDone(false); return; }
    setDisplayed("");
    setDone(false);
    const startTimer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(startTimer);
  }, [active, text, startDelay, speed]);
  return { displayed, done };
}

export default function WelcomeSplash({ onEnter }) {
  const [phase, setPhase] = useState("zoom"); // zoom → hold → text → ready
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const rafRef = useRef(null);

  // Spark particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;

    // Generate sparks
    for (let i = 0; i < 60; i++) {
      sparksRef.current.push({
        x: w / 2 + (Math.random() - 0.5) * 100,
        y: h / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3 + 1,
        life: Math.random() * 60 + 30,
        maxLife: 90,
        color: Math.random() > 0.5 ? "#1D9E75" : "#0EA5E9",
      });
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      sparksRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          p.x = w / 2 + (Math.random() - 0.5) * 80;
          p.y = h / 2 + (Math.random() - 0.5) * 80;
          p.vx = (Math.random() - 0.5) * 5;
          p.vy = (Math.random() - 0.5) * 5;
          p.life = p.maxLife;
        }
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
        // Spark trail
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.strokeStyle = p.color + Math.floor(alpha * 100).toString(16).padStart(2, "0");
        ctx.lineWidth = p.size * 0.5 * alpha;
        ctx.stroke();
      });
      rafRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Typewriter text
  const textActive = phase === "text" || phase === "ready";
  const tw1 = useTypewriter("WELCOME", 0, 180, textActive);
  const tw3 = useTypewriter("ENTER", 2000, 200, textActive);

  // Phase timing
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 3500);   // slow cinematic approach
    const t2 = setTimeout(() => setPhase("text"), 4500);    // pause to absorb the logo, then text
    const t3 = setTimeout(() => setPhase("ready"), 8000);   // all text typed out
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "#040608",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden", cursor: phase === "ready" ? "pointer" : "default",
      }}
      onClick={phase === "ready" ? onEnter : undefined}
    >
      {/* Spark canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          opacity: phase === "zoom" ? 1 : phase === "hold" ? 0.6 : 0.3,
          transition: "opacity 1s ease",
        }}
      />

      {/* Background radial glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at center, #0A1628 0%, #060B14 50%, #030508 100%)",
      }} />

      {/* Composite logo — Rod image + layered text + effects */}
      <div style={{
        zIndex: 2,
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}>
        <div
          onMouseMove={e => {
            if (phase !== "ready" && phase !== "text") return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            e.currentTarget.style.transform = `scale(1) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(20px)`;
          }}
          onMouseLeave={e => {
            if (phase === "ready" || phase === "text") {
              e.currentTarget.style.transform = "scale(1) rotateY(0deg) rotateX(0deg) translateZ(0px)";
            }
          }}
          style={{
            transform: phase === "zoom"
              ? "scale(0.05) rotateX(15deg) translateZ(-200px)"
              : "scale(1) rotateX(0deg) translateZ(0px)",
            opacity: phase === "zoom" ? 0.2 : 1,
            transition: phase === "zoom"
              ? "transform 3.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 3s ease"
              : "transform 0.3s ease-out",
            filter: phase !== "zoom"
              ? "drop-shadow(0 0 30px rgba(14,165,233,0.5)) drop-shadow(0 0 60px rgba(29,158,117,0.3))"
              : "none",
            transformStyle: "preserve-3d",
            textAlign: "center",
          }}
        >
          {/* Rod of Asclepius image */}
          <img
            src="/rod-logo.png"
            alt="Rod of Asclepius"
            style={{
              width: 200,
              height: "auto",
              objectFit: "contain",
              filter: "brightness(1.2) contrast(1.1) drop-shadow(0 0 20px rgba(14,165,233,0.6)) drop-shadow(0 0 40px rgba(29,158,117,0.3))",
            }}
          />

          {/* K9-REHAB-PRO text */}
          <div style={{
            fontSize: 36, fontWeight: 900, letterSpacing: 4,
            color: "#fff",
            fontFamily: "'Exo 2', 'Orbitron', system-ui, sans-serif",
            marginTop: 16,
            textShadow: "0 0 20px rgba(14,165,233,0.6), 0 0 40px rgba(29,158,117,0.3), 0 2px 4px rgba(0,0,0,0.8)",
            opacity: textActive ? 1 : 0,
            transform: textActive ? "translateY(0)" : "translateY(15px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}>
            K9-REHAB-PRO
          </div>

          {/* Glowing divider line */}
          <div style={{
            width: 200, height: 2, margin: "12px auto",
            background: "linear-gradient(90deg, transparent, #0EA5E9, #1D9E75, #0EA5E9, transparent)",
            opacity: textActive ? 0.8 : 0,
            transition: "opacity 0.8s ease 0.3s",
            boxShadow: "0 0 10px rgba(14,165,233,0.5)",
          }} />

          {/* B.E.A.U. text */}
          <div style={{
            fontSize: 28, fontWeight: 900, letterSpacing: 6,
            color: "#0EA5E9",
            fontFamily: "'Exo 2', 'Orbitron', system-ui, sans-serif",
            textShadow: "0 0 20px rgba(14,165,233,0.8), 0 0 40px rgba(14,165,233,0.4)",
            opacity: textActive ? 1 : 0,
            transform: textActive ? "translateY(0)" : "translateY(15px)",
            transition: "opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s",
          }}>
            B.E.A.U.
          </div>

          {/* Acronym subtitle */}
          <div style={{
            fontSize: 9, letterSpacing: 3, color: "#7AAACF",
            fontFamily: "'Courier New', monospace",
            textTransform: "uppercase",
            marginTop: 6,
            textShadow: "0 0 10px rgba(122,170,207,0.3)",
            opacity: textActive ? 0.7 : 0,
            transition: "opacity 0.8s ease 0.6s",
          }}>
            AI Biomedical Evidence-Based Analytical Unit
          </div>

          {/* ENTER button */}
          <div
            onClick={phase === "ready" ? onEnter : undefined}
            style={{
              fontSize: 16, fontWeight: 700, letterSpacing: 10,
              color: "#1D9E75",
              fontFamily: "'Courier New', monospace",
              marginTop: 28,
              cursor: phase === "ready" ? "pointer" : "default",
              textShadow: phase === "ready" ? "0 0 15px rgba(29,158,117,0.6)" : "none",
              padding: "12px 44px",
              border: phase === "ready" ? "1px solid rgba(29,158,117,0.4)" : "1px solid transparent",
              borderRadius: 6,
              background: phase === "ready" ? "rgba(29,158,117,0.08)" : "transparent",
              transition: "all 0.4s ease",
              opacity: phase === "ready" ? 1 : 0,
              display: "inline-block",
            }}
            onMouseEnter={e => {
              if (phase === "ready") {
                e.target.style.background = "rgba(29,158,117,0.15)";
                e.target.style.borderColor = "rgba(29,158,117,0.7)";
                e.target.style.textShadow = "0 0 25px rgba(29,158,117,0.8)";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={e => {
              if (phase === "ready") {
                e.target.style.background = "rgba(29,158,117,0.08)";
                e.target.style.borderColor = "rgba(29,158,117,0.4)";
                e.target.style.textShadow = "0 0 15px rgba(29,158,117,0.6)";
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            {phase === "ready" ? "ENTER" : ""}
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div style={{
        position: "absolute", bottom: 20, zIndex: 2,
        fontSize: 9, color: "#7AAACF30", letterSpacing: 1,
        opacity: phase === "ready" ? 1 : 0,
        transition: "opacity 0.6s ease 0.8s",
      }}>
        &copy; 2025-2026 Salvatore Bonanno &middot; All Rights Reserved
      </div>

      <style>{`
        @keyframes sparkPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
