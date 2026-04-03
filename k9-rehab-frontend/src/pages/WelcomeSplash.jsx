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
    const t1 = setTimeout(() => setPhase("hold"), 2200);   // zoom completes — slower approach
    const t2 = setTimeout(() => setPhase("text"), 3000);    // brief hold, then typewriter starts
    const t3 = setTimeout(() => setPhase("ready"), 6000);   // all text typed out
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "#0A0F1A",
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
        background: "radial-gradient(ellipse at center, #0F4C8120 0%, #0A0F1A 70%)",
      }} />

      {/* Logo — zooms from distant to full */}
      <div style={{
        zIndex: 2,
        transform: phase === "zoom"
          ? "scale(0.05)"
          : phase === "hold"
          ? "scale(1)"
          : "scale(1)",
        opacity: phase === "zoom" ? 0.3 : 1,
        transition: phase === "zoom"
          ? "transform 2.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.2s ease"
          : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
        filter: phase === "hold" || phase === "text" || phase === "ready"
          ? "drop-shadow(0 0 40px rgba(14,165,233,0.6)) drop-shadow(0 0 80px rgba(29,158,117,0.4)) drop-shadow(0 0 120px rgba(14,165,233,0.2))"
          : "drop-shadow(0 0 20px rgba(14,165,233,0.3))",
      }}>
        <img
          src="/beau-logo.jpg"
          alt="K9 Rehab Pro — B.E.A.U."
          style={{
            width: 320,
            height: "auto",
            borderRadius: 8,
            objectFit: "contain",
          }}
        />
      </div>

      {/* Typewriter text reveals */}
      <div style={{ zIndex: 2, textAlign: "center", marginTop: 24 }}>
        {/* WELCOME */}
        <div style={{
          fontSize: 18, letterSpacing: 14, fontWeight: 300, color: "#7AAACF",
          fontFamily: "'Courier New', monospace",
          minHeight: 28,
          opacity: textActive ? 1 : 0,
          transition: "opacity 0.3s ease",
          textShadow: "0 0 20px rgba(122,170,207,0.3)",
        }}>
          {tw1.displayed}
          {textActive && !tw1.done && <span style={{ animation: "blink 0.6s step-end infinite", color: "#0EA5E9" }}>|</span>}
        </div>

        {/* ENTER */}
        <div
          onClick={tw3.done ? onEnter : undefined}
          style={{
            fontSize: 20, fontWeight: 700, letterSpacing: 10,
            color: "#0EA5E9",
            fontFamily: "'Courier New', monospace",
            marginTop: 20, minHeight: 52,
            cursor: tw3.done ? "pointer" : "default",
            textShadow: tw3.done ? "0 0 20px rgba(14,165,233,0.6), 0 0 40px rgba(29,158,117,0.3)" : "none",
            padding: "14px 48px",
            border: tw3.done ? "1px solid rgba(14,165,233,0.3)" : "1px solid transparent",
            borderRadius: 8,
            background: tw3.done ? "rgba(14,165,233,0.06)" : "transparent",
            transition: "border 0.3s, background 0.3s",
            opacity: tw1.done ? 1 : 0,
          }}
          onMouseEnter={e => {
            if (tw3.done) {
              e.target.style.background = "rgba(14,165,233,0.12)";
              e.target.style.borderColor = "rgba(14,165,233,0.6)";
              e.target.style.textShadow = "0 0 30px rgba(14,165,233,0.8), 0 0 60px rgba(29,158,117,0.4)";
            }
          }}
          onMouseLeave={e => {
            if (tw3.done) {
              e.target.style.background = "rgba(14,165,233,0.06)";
              e.target.style.borderColor = "rgba(14,165,233,0.3)";
              e.target.style.textShadow = "0 0 20px rgba(14,165,233,0.6), 0 0 40px rgba(29,158,117,0.3)";
            }
          }}
        >
          {tw3.displayed}
          {tw1.done && !tw3.done && <span style={{ animation: "blink 0.6s step-end infinite" }}>|</span>}
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
