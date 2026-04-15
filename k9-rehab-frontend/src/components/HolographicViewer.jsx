// ============================================================================
// HolographicViewer — B.E.A.U. 3D Clinical Anatomy
// ============================================================================
// Interactive holographic skeleton viewer with muscle-region highlighting.
// HTML5 Canvas overlay on top of a CSS-blended PNG. No Three.js required.
//
// - Auto-switches between dog and cat skeletons based on `species` prop.
// - Highlights muscle regions when `selectedExercise` is provided.
// - Uses KEYWORD MATCHING against exercise name/code/category so it works
//   with the real 260-exercise library codes (TPLO_POSTOP_SIT_TO_STAND etc.)
//   not just the slug-style IDs from the spec.
// - Hover any region for label tooltip.
// - Pulse animation + scanline overlay for holographic feel.
// ============================================================================

import { useState, useRef, useEffect, useCallback } from "react";

// ─── CANINE muscle regions (% of image w/h) ──────────────────────────────────
const CANINE_REGIONS = {
  cervical_spine: { label: "Cervical Spine",    x: 72, y: 18, w: 12, h: 20, color: "#00e5ff", keywords: ["cervical", "neck"] },
  thoracic_spine: { label: "Thoracic Spine",    x: 45, y: 15, w: 20, h: 22, color: "#00e5ff", keywords: ["thoracic", "spine", "back"] },
  lumbar_spine:   { label: "Lumbar Spine",      x: 28, y: 18, w: 15, h: 20, color: "#00e5ff", keywords: ["lumbar", "lumbosacral"] },
  left_shoulder:  { label: "Left Shoulder",     x: 68, y: 25, w: 12, h: 18, color: "#a78bfa", keywords: ["shoulder", "scapula", "forelimb"] },
  right_hip:      { label: "Right Hip",         x: 22, y: 25, w: 14, h: 18, color: "#a78bfa", keywords: ["hip", "coxofemoral", "pelvic"] },
  left_elbow:     { label: "Left Elbow",        x: 72, y: 48, w: 10, h: 14, color: "#00e5ff", keywords: ["elbow", "humeroradial"] },
  right_stifle:   { label: "Right Stifle",      x: 28, y: 50, w: 12, h: 16, color: "#ff4455", keywords: ["stifle", "knee", "tplo", "ccl", "cranial cruciate", "patell"] },
  left_carpus:    { label: "Left Carpus",       x: 74, y: 68, w: 8,  h: 12, color: "#00e5ff", keywords: ["carpus", "carpal", "wrist"] },
  right_hock:     { label: "Right Hock",        x: 30, y: 68, w: 8,  h: 12, color: "#00e5ff", keywords: ["hock", "tarsus", "tarsal", "achilles"] },
  quadriceps:     { label: "Quadriceps",        x: 24, y: 38, w: 14, h: 20, color: "#00ff88", keywords: ["quad", "sit-to-stand", "sit to stand", "stand", "stair", "cavaletti", "step up"] },
  hamstrings:     { label: "Hamstrings",        x: 20, y: 35, w: 10, h: 22, color: "#00ff88", keywords: ["hamstring", "biceps femoris", "hip extension", "hill"] },
  core:           { label: "Core / Abdomen",    x: 38, y: 30, w: 22, h: 18, color: "#ffb700", keywords: ["core", "abdomen", "balance", "physioball", "wobble", "rocker", "trunk", "stability"] },
};

// ─── FELINE muscle regions ────────────────────────────────────────────────────
const FELINE_REGIONS = {
  cervical_spine: { label: "Cervical Spine",    x: 70, y: 15, w: 14, h: 22, color: "#00e5ff", keywords: ["cervical", "neck"] },
  thoracic_spine: { label: "Thoracic Spine",    x: 42, y: 8,  w: 22, h: 20, color: "#00e5ff", keywords: ["thoracic", "spine", "back"] },
  lumbar_spine:   { label: "Lumbar Spine",      x: 22, y: 10, w: 16, h: 20, color: "#00e5ff", keywords: ["lumbar", "lumbosacral"] },
  left_shoulder:  { label: "Left Shoulder",     x: 66, y: 22, w: 14, h: 20, color: "#a78bfa", keywords: ["shoulder", "scapula", "forelimb"] },
  right_hip:      { label: "Right Hip",         x: 18, y: 22, w: 16, h: 22, color: "#a78bfa", keywords: ["hip", "coxofemoral", "pelvic"] },
  right_stifle:   { label: "Right Stifle",      x: 24, y: 48, w: 14, h: 18, color: "#ff4455", keywords: ["stifle", "knee", "patell"] },
  quadriceps:     { label: "Quadriceps",        x: 20, y: 35, w: 16, h: 22, color: "#00ff88", keywords: ["quad", "sit-to-stand", "sit to stand", "stand", "step", "climb"] },
  core:           { label: "Core",              x: 35, y: 25, w: 24, h: 20, color: "#ffb700", keywords: ["core", "abdomen", "balance", "trunk", "stability"] },
};

// Highlight color palette — keyed by the region's accent color
const HIGHLIGHT_COLORS = {
  primary:    { fill: "rgba(0,229,255,0.35)",   stroke: "#00e5ff" },
  secondary:  { fill: "rgba(167,139,250,0.25)", stroke: "#a78bfa" },
  protect:    { fill: "rgba(255,68,85,0.30)",   stroke: "#ff4455" },
  strengthen: { fill: "rgba(0,255,136,0.25)",   stroke: "#00ff88" },
  neutral:    { fill: "rgba(255,183,0,0.20)",   stroke: "#ffb700" },
};

// Map a region's accent color to a HIGHLIGHT_COLORS key
const colorTypeFor = (regionColor) => {
  if (regionColor === "#ff4455") return "protect";
  if (regionColor === "#00ff88") return "strengthen";
  if (regionColor === "#a78bfa") return "secondary";
  if (regionColor === "#ffb700") return "neutral";
  return "primary";
};

// roundRect fallback — older browsers (Safari < 16, Firefox < 113) lack it
const drawRoundRect = (ctx, x, y, w, h, r) => {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  // Manual path fallback
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
};

// Build a normalized search string from an exercise object/code
const exerciseSearchString = (ex) => {
  if (!ex) return "";
  if (typeof ex === "string") return ex.toLowerCase().replace(/_/g, " ");
  const parts = [
    ex.code, ex.name, ex.category, ex.intervention_type, ex.affected_region,
  ].filter(Boolean);
  return parts.join(" ").toLowerCase().replace(/_/g, " ");
};

export default function HolographicViewer({
  species = "Canine",
  selectedExercise = null,    // string code OR full exercise object
  highlightRegions = [],      // optional explicit override [{key, type}]
  compact = false,
}) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [pulseFrame, setPulseFrame] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  const isFeline = species?.toLowerCase() === "feline" || species?.toLowerCase() === "cat";
  const regions = isFeline ? FELINE_REGIONS : CANINE_REGIONS;
  const imageSrc = isFeline
    ? "/assets/holographic/cat-holographic.png"
    : "/assets/holographic/dog-holographic.png";

  // ── Compute highlighted regions ──
  // Priority: explicit highlightRegions prop > keyword match against exercise
  const getHighlightedRegions = useCallback(() => {
    if (highlightRegions.length > 0) return highlightRegions;
    if (!selectedExercise) return [];
    const search = exerciseSearchString(selectedExercise);
    if (!search) return [];
    const matched = [];
    Object.entries(regions).forEach(([key, region]) => {
      if (region.keywords?.some(kw => search.includes(kw))) {
        matched.push({ key, type: colorTypeFor(region.color) });
      }
    });
    return matched;
  }, [highlightRegions, selectedExercise, regions]);

  // ── Pulse animation loop (60fps via rAF) ──
  // Drives the breathing glow on highlighted muscle regions. Logs once on
  // mount + once on first frame to confirm the loop is actually running.
  useEffect(() => {
    console.log("[HolographicViewer] mount — starting pulse loop");
    let frame = 0;
    let firstFrameLogged = false;
    const animate = () => {
      frame = (frame + 1) % 120;
      if (!firstFrameLogged) {
        console.log("[HolographicViewer] first rAF tick — pulse loop is live");
        firstFrameLogged = true;
      }
      setPulseFrame(frame);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ── Resize the canvas internal pixel buffer to match the displayed size ──
  // Critical: without this the hit-test coordinates drift and shapes draw
  // in the wrong place. Uses a ResizeObserver (more reliable than window
  // resize event — catches container layout changes from parent flex/grid
  // resizing, sidebar collapse, etc.) plus an immediate sync on mount.
  const syncCanvasSize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return false;
    const dpr = window.devicePixelRatio || 1;
    const w = containerRef.current.offsetWidth;
    const h = containerRef.current.offsetHeight;
    if (w === 0 || h === 0) return false;
    if (canvasRef.current.width !== w * dpr || canvasRef.current.height !== h * dpr) {
      canvasRef.current.width = w * dpr;
      canvasRef.current.height = h * dpr;
      canvasRef.current.style.width = `${w}px`;
      canvasRef.current.style.height = `${h}px`;
      const ctx = canvasRef.current.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      console.log(`[HolographicViewer] canvas synced to ${w}x${h} @ ${dpr}x DPR`);
    }
    return true;
  }, []);

  useEffect(() => {
    // Immediate sync attempt
    syncCanvasSize();
    // ResizeObserver — fires when the container's size changes for any
    // reason (window resize, sidebar collapse, parent grid change, etc.)
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => { syncCanvasSize(); });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [syncCanvasSize, imageLoaded]);

  // ── Draw canvas overlays ──
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !containerRef.current) return;
    syncCanvasSize();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);

    const highlighted = getHighlightedRegions();
    const pulse = Math.sin((pulseFrame / 120) * Math.PI * 2) * 0.3 + 0.7;

    Object.entries(regions).forEach(([key, region]) => {
      const highlight = highlighted.find(h => h.key === key);
      const isHovered = hoveredRegion === key;
      if (!highlight && !isHovered) return;

      const x = (region.x / 100) * width;
      const y = (region.y / 100) * height;
      const w = (region.w / 100) * width;
      const h = (region.h / 100) * height;

      const colorKey = highlight?.type || "primary";
      const colors = HIGHLIGHT_COLORS[colorKey] || HIGHLIGHT_COLORS.primary;
      const alpha = isHovered ? 0.5 : pulse * 0.35;

      // Glow
      ctx.shadowColor = colors.stroke;
      ctx.shadowBlur = isHovered ? 25 : 15 * pulse;

      // Fill
      const rgb = colors.fill.match(/rgba\(([\d,\s]+)/)?.[1] || "0,229,255";
      ctx.fillStyle = `rgba(${rgb.split(",").slice(0,3).join(",")},${alpha})`;
      ctx.beginPath();
      drawRoundRect(ctx, x, y, w, h, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.globalAlpha = isHovered ? 1 : pulse * 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Hover label
      if (isHovered) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(region.label, x + w / 2, y - 6);
      }
    });
  }, [imageLoaded, pulseFrame, hoveredRegion, selectedExercise, species, regions, getHighlightedRegions, syncCanvasSize]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    let found = null;
    Object.entries(regions).forEach(([key, region]) => {
      if (x >= region.x && x <= region.x + region.w &&
          y >= region.y && y <= region.y + region.h) {
        found = key;
      }
    });
    setHoveredRegion(found);
  };

  const viewerHeight = compact ? 240 : 380;

  return (
    <div style={{
      background: "#050810",
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid rgba(0,229,255,0.2)",
      boxShadow: "0 0 30px rgba(0,229,255,0.08)",
      position: "relative",
    }}>
      {/* Holographic float animation — gentle parallax sway on the base image */}
      <style>{`
        @keyframes holoFloat {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25%      { transform: translateX(4px) translateY(-3px); }
          50%      { transform: translateX(0px) translateY(-5px); }
          75%      { transform: translateX(-4px) translateY(-3px); }
        }
      `}</style>
      {/* Header */}
      <div style={{
        padding: "8px 14px",
        background: "rgba(0,229,255,0.05)",
        borderBottom: "1px solid rgba(0,229,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 10, color: "#00e5ff", fontFamily: "monospace", letterSpacing: 2 }}>
          B.E.A.U. 3D CLINICAL VIEWER
        </span>
        <span style={{ fontSize: 10, color: "#4a6a8a", fontFamily: "monospace" }}>
          {isFeline ? "FELINE" : "CANINE"} · SKELETAL ANATOMY
        </span>
      </div>

      {/* Image + Canvas overlay */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredRegion(null)}
        style={{
          position: "relative",
          height: viewerHeight,
          cursor: hoveredRegion ? "crosshair" : "default",
        }}
      >
        {/* Scanline overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px)",
          zIndex: 3, pointerEvents: "none",
        }}/>

        {/* Base holographic image — with floating parallax sway */}
        <img
          src={imageSrc}
          alt={isFeline ? "Feline anatomy" : "Canine anatomy"}
          onLoad={() => {
            console.log("[HolographicViewer] image loaded:", imageSrc);
            setImageLoaded(true);
            // Sync canvas immediately now that the image (and therefore the
            // container's intrinsic dimensions) is known. Without this, the
            // very first draw can race the layout and end up with a 0-sized
            // canvas, masking all highlights and the breathing pulse.
            requestAnimationFrame(() => syncCanvasSize());
          }}
          onError={(e) => {
            console.warn("[HolographicViewer] image not found:", imageSrc);
            e.currentTarget.style.display = "none";
          }}
          style={{
            width: "100%", height: viewerHeight,
            objectFit: "contain", display: "block",
            position: "absolute", top: 0, left: 0,
            filter: "brightness(0.9) contrast(1.1)",
            animation: "holoFloat 6s ease-in-out infinite",
            willChange: "transform",
          }}
        />

        {/* Placeholder when image fails */}
        {!imageLoaded && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#4a6a8a", fontSize: 11, fontFamily: "monospace", letterSpacing: 1,
            zIndex: 1,
          }}>
            HOLOGRAPHIC VIEWER LOADING…
          </div>
        )}

        {/* Canvas overlay for muscle highlights */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%", zIndex: 2,
          }}
        />

        {/* Hovered region tooltip */}
        {hoveredRegion && regions[hoveredRegion] && (
          <div style={{
            position: "absolute", bottom: 12, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(5,8,16,0.9)",
            border: "1px solid rgba(0,229,255,0.3)",
            borderRadius: 6, padding: "6px 14px",
            fontSize: 11, color: "#00e5ff",
            fontFamily: "monospace", letterSpacing: 1,
            zIndex: 4, whiteSpace: "nowrap",
          }}>
            {regions[hoveredRegion].label}
          </div>
        )}
      </div>

      {/* Legend */}
      {!compact && (
        <div style={{
          padding: "8px 14px",
          background: "rgba(0,0,0,0.3)",
          borderTop: "1px solid rgba(0,229,255,0.08)",
          display: "flex", gap: 16, flexWrap: "wrap",
        }}>
          {[
            { color: "#00e5ff", label: "Primary"    },
            { color: "#a78bfa", label: "Secondary"  },
            { color: "#00ff88", label: "Strengthen" },
            { color: "#ff4455", label: "Protect"    },
            { color: "#ffb700", label: "Core"       },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}` }}/>
              <span style={{ fontSize: 9, color: "#4a6a8a", fontFamily: "monospace" }}>{item.label}</span>
            </div>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#2a3a4a", fontFamily: "monospace" }}>
            Hover to identify regions
          </span>
        </div>
      )}
    </div>
  );
}
