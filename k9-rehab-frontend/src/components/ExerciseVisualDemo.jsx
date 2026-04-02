import React, { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// OPTION 1: Step-by-Step Illustrated Frames
// Clean clinical frames with dog silhouette + handler + arrows
// ═══════════════════════════════════════════════════════════════

function DogSilhouette({ pose = "stand", color = "#0C2340", size = 120 }) {
  // Simple but recognizable dog silhouettes for each pose
  const poses = {
    sit: (
      <g transform={`scale(${size/120})`}>
        {/* Body sitting */}
        <ellipse cx="60" cy="65" rx="25" ry="20" fill={color} opacity="0.9" />
        {/* Head */}
        <circle cx="75" cy="40" r="14" fill={color} />
        {/* Ear */}
        <ellipse cx="82" cy="30" rx="6" ry="10" fill={color} transform="rotate(15,82,30)" />
        {/* Snout */}
        <ellipse cx="88" cy="43" rx="8" ry="5" fill={color} />
        {/* Eye */}
        <circle cx="80" cy="37" r="2" fill="white" />
        {/* Front legs */}
        <rect x="65" y="75" width="6" height="22" rx="3" fill={color} />
        <rect x="55" y="75" width="6" height="22" rx="3" fill={color} />
        {/* Back leg tucked */}
        <ellipse cx="42" cy="80" rx="12" ry="8" fill={color} opacity="0.8" />
        {/* Tail */}
        <path d="M35,60 Q20,45 25,35" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    stand: (
      <g transform={`scale(${size/120})`}>
        {/* Body standing */}
        <ellipse cx="55" cy="55" rx="30" ry="16" fill={color} opacity="0.9" />
        {/* Head */}
        <circle cx="82" cy="40" r="14" fill={color} />
        {/* Ear */}
        <ellipse cx="88" cy="30" rx="6" ry="10" fill={color} transform="rotate(15,88,30)" />
        {/* Snout */}
        <ellipse cx="95" cy="43" rx="8" ry="5" fill={color} />
        {/* Eye */}
        <circle cx="87" cy="37" r="2" fill="white" />
        {/* Front legs */}
        <rect x="70" y="68" width="6" height="28" rx="3" fill={color} />
        <rect x="62" y="68" width="6" height="28" rx="3" fill={color} />
        {/* Back legs */}
        <rect x="38" y="68" width="6" height="28" rx="3" fill={color} />
        <rect x="30" y="68" width="6" height="28" rx="3" fill={color} />
        {/* Tail */}
        <path d="M25,50 Q15,35 20,25" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    transition: (
      <g transform={`scale(${size/120})`}>
        {/* Body mid-rise — angled */}
        <ellipse cx="55" cy="58" rx="28" ry="16" fill={color} opacity="0.9" transform="rotate(-10,55,58)" />
        {/* Head */}
        <circle cx="80" cy="38" r="14" fill={color} />
        {/* Ear */}
        <ellipse cx="86" cy="28" rx="6" ry="10" fill={color} transform="rotate(15,86,28)" />
        {/* Snout */}
        <ellipse cx="93" cy="41" rx="8" ry="5" fill={color} />
        {/* Eye */}
        <circle cx="85" cy="35" r="2" fill="white" />
        {/* Front legs — straight */}
        <rect x="68" y="68" width="6" height="26" rx="3" fill={color} />
        <rect x="60" y="70" width="6" height="24" rx="3" fill={color} />
        {/* Back legs — partially extended */}
        <rect x="36" y="66" width="6" height="28" rx="3" fill={color} transform="rotate(12,39,66)" />
        <rect x="28" y="68" width="6" height="26" rx="3" fill={color} transform="rotate(8,31,68)" />
        {/* Tail */}
        <path d="M27,48 Q17,33 22,23" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
  };
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{poses[pose] || poses.stand}</svg>;
}

function FramePlayer({ frames }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % frames.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [playing, frames.length]);

  const frame = frames[current];

  return (
    <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#B5D4F4" }}>
      {/* Frame display */}
      <div className="relative bg-gradient-to-b from-[#F4F8FD] to-white p-6 flex items-center justify-center" style={{ minHeight: 220 }}>
        {/* Step indicator */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0C2340] text-white text-[10px] font-bold">
          Step {current + 1} of {frames.length}
        </div>

        {/* Dog visual */}
        <div className="relative">
          <DogSilhouette pose={frame.pose} color="#0C2340" size={140} />
          {/* Movement arrow */}
          {frame.arrow && (
            <svg className="absolute" style={frame.arrow.style} width="60" height="60" viewBox="0 0 60 60">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#1D9E75" />
                </marker>
              </defs>
              <path d={frame.arrow.path} stroke="#1D9E75" strokeWidth="2.5" fill="none" markerEnd="url(#arrowhead)" strokeDasharray="6,3" />
            </svg>
          )}
        </div>

        {/* Clinical cue badge */}
        {frame.cue && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#1D9E75]/10 text-[#1D9E75] text-[10px] font-bold border border-[#1D9E75]/20">
            {frame.cue}
          </div>
        )}
      </div>

      {/* Description bar */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "#E6F1FB" }}>
        <div className="text-sm font-semibold text-[#0C2340] mb-1">{frame.title}</div>
        <div className="text-xs text-[#7AAACF] leading-relaxed">{frame.instruction}</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F4F8FD] border-t" style={{ borderColor: "#E6F1FB" }}>
        <div className="flex gap-1.5">
          {frames.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setPlaying(false); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-[#1D9E75] w-5" : "bg-[#B5D4F4]"}`}
            />
          ))}
        </div>
        <button
          onClick={() => setPlaying(!playing)}
          className="text-[10px] font-bold text-[#2E5F8A] hover:text-[#1D9E75] transition-colors"
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// OPTION 2: AI-Generated Placeholder (simulated with gradient cards)
// In production this would call HF SDXL
// ═══════════════════════════════════════════════════════════════

function AIImagePlayer({ frames }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % frames.length), 3000);
    return () => clearInterval(timer);
  }, [playing, frames.length]);

  const frame = frames[current];
  // Gradient backgrounds that simulate different "photo" compositions
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ];

  return (
    <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#B5D4F4" }}>
      <div className="relative" style={{ minHeight: 220, background: gradients[current % gradients.length] }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <div className="text-4xl mb-3">🐕</div>
            <div className="text-sm font-bold mb-1 drop-shadow-lg">{frame.title}</div>
            <div className="text-xs opacity-80 drop-shadow">{frame.breed} — {frame.pose}</div>
          </div>
        </div>
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[10px] font-bold">
          AI Generated • Frame {current + 1}/{frames.length}
        </div>
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[10px]">
          HF SDXL • Breed-Specific
        </div>
      </div>
      <div className="px-4 py-3 border-t" style={{ borderColor: "#E6F1FB" }}>
        <div className="text-sm font-semibold text-[#0C2340]">{frame.title}</div>
        <div className="text-xs text-[#7AAACF] mt-1">{frame.instruction}</div>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F4F8FD] border-t" style={{ borderColor: "#E6F1FB" }}>
        <div className="flex gap-1.5">
          {frames.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setPlaying(false); }} className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-[#1D9E75] w-5" : "bg-[#B5D4F4]"}`} />
          ))}
        </div>
        <button onClick={() => setPlaying(!playing)} className="text-[10px] font-bold text-[#2E5F8A]">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// OPTION 3: Animated SVG Diagram (smooth looping)
// ═══════════════════════════════════════════════════════════════

function AnimatedDiagram({ exercise }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    let animId;

    function drawDog(x, y, bodyAngle, legAngle, headY, tailAngle) {
      ctx.save();
      ctx.translate(x, y);

      // Body
      ctx.save();
      ctx.rotate(bodyAngle);
      ctx.fillStyle = "#0C2340";
      ctx.beginPath();
      ctx.ellipse(0, 0, 40, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Head
      ctx.fillStyle = "#0C2340";
      ctx.beginPath();
      ctx.arc(35, -15 + headY, 16, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = "#1D9E75";
      ctx.beginPath();
      ctx.arc(40, -18 + headY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ear
      ctx.fillStyle = "#0C2340";
      ctx.beginPath();
      ctx.ellipse(42, -28 + headY, 5, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Front legs
      ctx.strokeStyle = "#0C2340";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(20, 15);
      ctx.lineTo(20 + Math.sin(legAngle) * 5, 15 + 28 + Math.cos(legAngle) * 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, 15);
      ctx.lineTo(12 - Math.sin(legAngle) * 3, 15 + 28 - Math.cos(legAngle) * 2);
      ctx.stroke();

      // Back legs
      ctx.beginPath();
      ctx.moveTo(-25, 12);
      ctx.lineTo(-25 - Math.sin(legAngle) * 8, 12 + 28 + Math.cos(legAngle) * 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-32, 12);
      ctx.lineTo(-32 + Math.sin(legAngle) * 5, 12 + 28 - Math.cos(legAngle) * 3);
      ctx.stroke();

      // Tail
      ctx.strokeStyle = "#0C2340";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-38, -5);
      ctx.quadraticCurveTo(-55, -25 + Math.sin(tailAngle) * 10, -48, -35 + Math.sin(tailAngle) * 8);
      ctx.stroke();

      // Ground shadow
      ctx.fillStyle = "rgba(12,35,64,0.08)";
      ctx.beginPath();
      ctx.ellipse(0, 48, 45, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawFloor() {
      ctx.fillStyle = "#F4F8FD";
      ctx.fillRect(0, H - 30, W, 30);
      ctx.strokeStyle = "#E6F1FB";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H - 30);
      ctx.lineTo(W, H - 30);
      ctx.stroke();
    }

    function drawLabel(text, phase) {
      ctx.fillStyle = "#0C2340";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text, W / 2, 22);

      ctx.fillStyle = "#1D9E75";
      ctx.font = "600 10px Inter, sans-serif";
      ctx.fillText(phase, W / 2, 38);
    }

    function animate() {
      frameRef.current += 0.02;
      const t = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      drawFloor();

      // Sit-to-stand animation cycle
      const cycle = (Math.sin(t) + 1) / 2; // 0 to 1
      const bodyAngle = -0.15 * cycle; // tilts forward as standing
      const legAngle = (1 - cycle) * 0.6; // legs extend
      const headY = -cycle * 8; // head rises
      const tailAngle = t * 2; // tail wags

      drawDog(W / 2 - 10, H / 2 + 15 - cycle * 12, bodyAngle, legAngle, headY, tailAngle);

      // Movement arrow
      ctx.strokeStyle = "#1D9E75";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      const arrowY = H / 2 - 25;
      ctx.beginPath();
      ctx.moveTo(W / 2 + 50, arrowY + 20);
      ctx.lineTo(W / 2 + 50, arrowY - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      ctx.fillStyle = "#1D9E75";
      ctx.beginPath();
      ctx.moveTo(W / 2 + 45, arrowY - 8);
      ctx.lineTo(W / 2 + 55, arrowY - 8);
      ctx.lineTo(W / 2 + 50, arrowY - 16);
      ctx.closePath();
      ctx.fill();

      const phase = cycle > 0.5 ? "Standing Phase" : "Sitting Phase";
      drawLabel("Sit-to-Stand Transitions", phase);

      animId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#B5D4F4" }}>
      <canvas ref={canvasRef} width={360} height={240} className="w-full" style={{ maxHeight: 220 }} />
      <div className="px-4 py-3 border-t" style={{ borderColor: "#E6F1FB" }}>
        <div className="text-sm font-semibold text-[#0C2340]">Animated Clinical Diagram</div>
        <div className="text-xs text-[#7AAACF] mt-1">Smooth looping animation showing movement pattern, weight shift, and proper form</div>
      </div>
      <div className="px-4 py-2.5 bg-[#F4F8FD] border-t text-[10px] font-bold text-[#2E5F8A]" style={{ borderColor: "#E6F1FB" }}>
        ∞ Continuous Loop • Canvas Rendered • No External Assets
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// DEMO PAGE — Shows all 3 options side by side
// ═══════════════════════════════════════════════════════════════

const SIT_STAND_FRAMES = [
  {
    title: "Starting Position — Sit",
    pose: "sit",
    instruction: "Position dog in a square sit on non-slip surface. Handler stands in front with treat at nose level. Ensure hind legs are tucked evenly.",
    cue: "Square Sit Check",
    breed: "Labrador Retriever",
    arrow: { style: { top: 20, right: 10 }, path: "M30,50 Q30,30 30,10" },
  },
  {
    title: "Initiate Rise — Weight Forward",
    pose: "transition",
    instruction: "Slowly raise treat upward and slightly forward. Dog shifts weight to front limbs and begins extending rear joints. Watch for even push from both hind legs.",
    cue: "Even Weight Shift",
    breed: "Labrador Retriever",
    arrow: { style: { top: 0, right: 20 }, path: "M30,50 Q35,25 30,5" },
  },
  {
    title: "Mid-Rise — Active Extension",
    pose: "transition",
    instruction: "Rear limbs actively extending. Stifle and hock driving upward. If post-TPLO, watch for reluctance on surgical side — this is the critical loading phase.",
    cue: "Hind Limb Loading",
    breed: "Labrador Retriever",
    arrow: null,
  },
  {
    title: "Full Stand — Hold",
    pose: "stand",
    instruction: "Dog reaches full standing position. Hold for 3-5 seconds before rewarding. Observe for weight shifting off surgical limb — correct with treat placement.",
    cue: "3-5 sec Hold",
    breed: "Labrador Retriever",
    arrow: null,
  },
  {
    title: "Controlled Return to Sit",
    pose: "sit",
    instruction: "Guide treat backward and slightly down to lure dog back into sit. Controlled descent strengthens eccentric contraction. Reward at completion.",
    cue: "Eccentric Control",
    breed: "Labrador Retriever",
    arrow: { style: { top: 10, right: 5 }, path: "M30,10 Q35,30 30,50" },
  },
];

export default function ExerciseVisualDemo() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0C2340]">Exercise Visual Prototypes</h1>
        <p className="text-sm text-[#7AAACF] mt-1">
          Sit-to-Stand Transitions — 3 visual styles for comparison
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Option 1 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-sm font-bold text-[#0C2340]">Step-by-Step Illustrated Frames</span>
          </div>
          <FramePlayer frames={SIT_STAND_FRAMES} />
          <div className="mt-2 px-3 py-2 rounded-lg bg-[#E1F5EE] text-[10px] text-[#0F6E56] font-medium">
            Pros: Clean, consistent, fast to build, no API cost, works offline<br />
            Cons: Simplified silhouettes, not photorealistic
          </div>
        </div>

        {/* Option 2 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-bold text-[#0C2340]">AI-Generated Images</span>
          </div>
          <AIImagePlayer frames={SIT_STAND_FRAMES} />
          <div className="mt-2 px-3 py-2 rounded-lg bg-[#EEEDFE] text-[10px] text-[#534AB7] font-medium">
            Pros: Photorealistic, breed-specific, impressive visually<br />
            Cons: Requires HF API key, generation time, quality varies
          </div>
        </div>

        {/* Option 3 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#0EA5E9] text-white text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-sm font-bold text-[#0C2340]">Animated SVG Diagram</span>
          </div>
          <AnimatedDiagram exercise="sit_stand" />
          <div className="mt-2 px-3 py-2 rounded-lg bg-[#E0F2FE] text-[10px] text-[#0284C7] font-medium">
            Pros: Smooth motion, medical-textbook feel, no assets needed, mesmerizing<br />
            Cons: More complex to build per exercise, canvas-based
          </div>
        </div>
      </div>
    </div>
  );
}
