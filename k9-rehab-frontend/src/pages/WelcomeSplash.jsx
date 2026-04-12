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
    for (let i = 0; i < 140; i++) {
      sparksRef.current.push({
        x: w / 2 + (Math.random() - 0.5) * 400,
        y: h / 2 + (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 4 + 1.5,
        life: Math.random() * 60 + 30,
        maxLife: 90,
        color: Math.random() > 0.5 ? "#4D7FFF" : "#FFFFFF",
      });
    }

    // Electricity bolt generator
    function drawBolt(ctx, x1, y1, x2, y2, color, width) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const segments = 6 + Math.floor(Math.random() * 4);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 30;
        const my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 30;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function animate() {
      // Fade trail instead of clear — keeps electricity visible
      ctx.fillStyle = "rgba(4,6,8,0.15)";
      ctx.fillRect(0, 0, w, h);

      // Draw electricity bolts continuously
      const cx = w / 2, cy = h / 2;
      const boltCount = 2 + Math.floor(Math.random() * 3);
      for (let b = 0; b < boltCount; b++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 300;
        const x2 = cx + Math.cos(angle) * dist;
        const y2 = cy + Math.sin(angle) * dist;
        const color = Math.random() > 0.5 ? "rgba(77,127,255,0.8)" : "rgba(140,170,255,0.7)";
        drawBolt(ctx, cx + (Math.random() - 0.5) * 120, cy + (Math.random() - 0.5) * 120, x2, y2, color, 0.8 + Math.random() * 0.8);
        // Branch bolt
        if (Math.random() > 0.4) {
          const bx = x2 + (Math.random() - 0.5) * 150;
          const by = y2 + (Math.random() - 0.5) * 150;
          drawBolt(ctx, x2, y2, bx, by, color, 0.4);
        }
      }

      // Sparks
      sparksRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          p.x = w / 2 + (Math.random() - 0.5) * 100;
          p.y = h / 2 + (Math.random() - 0.5) * 100;
          p.vx = (Math.random() - 0.5) * 6;
          p.vy = (Math.random() - 0.5) * 6;
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
  const tw1 = useTypewriter("WELCOME", 0, 120, textActive);
  const tw3 = useTypewriter("ENTER", 1200, 150, textActive);

  // Phase timing — faster but still dramatic
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 3000);   // cinematic approach
    const t2 = setTimeout(() => setPhase("text"), 3800);    // brief pause then text
    const t3 = setTimeout(() => setPhase("ready"), 6000);   // ready to enter
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
              ? "transform 3s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.5s ease"
              : "transform 0.3s ease-out",
            filter: phase !== "zoom"
              ? "drop-shadow(0 0 30px rgba(14,165,233,0.5)) drop-shadow(0 0 60px rgba(77,127,255,0.3))"
              : "none",
            transformStyle: "preserve-3d",
            textAlign: "center",
          }}
        >
          {/* Rod + title composed together */}
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* Rod of Asclepius image — centered above REHAB */}
            <img
              src="/rod-logo.png"
              alt="Rod of Asclepius"
              style={{
                width: 180,
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
                filter: "brightness(1.2) contrast(1.1) drop-shadow(0 0 20px rgba(14,165,233,0.6)) drop-shadow(0 0 40px rgba(77,127,255,0.3))",
              }}
            />
          </div>

          {/* K9-REHAB-PRO text — rod sits centered above */}
          <div style={{
            fontSize: 36, fontWeight: 900, letterSpacing: 4,
            color: "#fff",
            fontFamily: "'Exo 2', 'Orbitron', system-ui, sans-serif",
            marginTop: -4,
            textShadow: "0 0 20px rgba(77,127,255,0.8), 0 0 40px rgba(0,0,160,0.5), 0 2px 4px rgba(0,0,0,0.8)",
            opacity: textActive ? 1 : 0,
            transform: textActive ? "translateY(0)" : "translateY(15px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}>
            K9-REHAB-PRO
          </div>

          {/* Glowing divider line */}
          <div style={{
            width: 200, height: 2, margin: "12px auto",
            background: "linear-gradient(90deg, transparent, #4D7FFF, #FFFFFF, #4D7FFF, transparent)",
            opacity: textActive ? 0.8 : 0,
            transition: "opacity 0.8s ease 0.3s",
            boxShadow: "0 0 12px rgba(77,127,255,0.6)",
          }} />

          {/* B.E.A.U. text */}
          <div style={{
            fontSize: 28, fontWeight: 900, letterSpacing: 6,
            color: "#6B8FFF",
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
              color: "#4D7FFF",
              fontFamily: "'Courier New', monospace",
              marginTop: 28,
              cursor: phase === "ready" ? "pointer" : "default",
              textShadow: phase === "ready" ? "0 0 20px rgba(57,255,126,0.8), 0 0 40px rgba(57,255,126,0.4)" : "none",
              padding: "12px 44px",
              border: phase === "ready" ? "2px solid rgba(57,255,126,0.7)" : "1px solid transparent",
              borderRadius: 6,
              background: phase === "ready" ? "rgba(57,255,126,0.06)" : "transparent",
              transition: "all 0.4s ease",
              opacity: phase === "ready" ? 1 : 0,
              display: "inline-block",
            }}
            onMouseEnter={e => {
              if (phase === "ready") {
                e.target.style.background = "rgba(57,255,126,0.15)";
                e.target.style.borderColor = "rgba(57,255,126,1)";
                e.target.style.textShadow = "0 0 30px rgba(57,255,126,1), 0 0 60px rgba(57,255,126,0.5)";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={e => {
              if (phase === "ready") {
                e.target.style.background = "rgba(77,127,255,0.08)";
                e.target.style.borderColor = "rgba(77,127,255,0.4)";
                e.target.style.textShadow = "0 0 15px rgba(77,127,255,0.6)";
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
        @keyframes holoFloat {
          0%, 100% { transform: translateY(-50%) translateX(0px); opacity: 0.7; }
          50% { transform: translateY(-50%) translateX(3px); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
