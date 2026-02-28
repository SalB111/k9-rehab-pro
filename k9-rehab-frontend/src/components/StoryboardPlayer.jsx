import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiX, FiLock, FiAlertTriangle } from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";

// ─────────────────────────────────────────────
// SVG OVERLAY LAYER — Anatomical indicators for storyboard frames
// ─────────────────────────────────────────────
function SvgOverlayLayer({ indicators, overlayToggles, width, height }) {
  if (!indicators || indicators.length === 0) return null;

  // Map SVG indicator types to overlay toggle groups
  const typeToGroup = {
    flexion_arc: 'joint_angles', extension_arc: 'joint_angles', joint_pivot: 'joint_angles',
    force_vector: 'arrows', hand_placement: 'arrows',
    muscle_highlight: 'good_form',
  };

  const visible = indicators.filter(ind => {
    const group = typeToGroup[ind.type] || 'safety_warnings';
    return overlayToggles[group];
  });

  return (
    <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      viewBox={`0 0 100 100`} preserveAspectRatio="none">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" fill="#39FF7E">
          <polygon points="0 0, 8 3, 0 6" />
        </marker>
      </defs>
      {visible.map((ind, i) => {
        if (ind.type === 'force_vector') {
          return <line key={i} x1={ind.x} y1={ind.y} x2={ind.x + (ind.dx || 0)} y2={ind.y + (ind.dy || 0)}
            stroke={ind.color || "#39FF7E"} strokeWidth="0.8" markerEnd="url(#arrowhead)" opacity={0.85} />;
        }
        if (ind.type === 'joint_pivot') {
          return <g key={i}>
            <circle cx={ind.x} cy={ind.y} r="2.5" fill="none" stroke={ind.color || C.amber} strokeWidth="0.6" opacity={0.9} />
            <circle cx={ind.x} cy={ind.y} r="1" fill={ind.color || C.amber} opacity={0.7} />
          </g>;
        }
        if (ind.type === 'hand_placement') {
          return <circle key={i} cx={ind.x} cy={ind.y} r="3" fill="none" stroke={ind.color || C.teal}
            strokeWidth="0.5" strokeDasharray="1.5,1" opacity={0.8} />;
        }
        if (ind.type === 'muscle_highlight') {
          return <ellipse key={i} cx={ind.x} cy={ind.y} rx={ind.rx || 10} ry={ind.ry || 15}
            fill={ind.color || "rgba(14,165,233,0.2)"} stroke="none" />;
        }
        if (ind.type === 'flexion_arc' || ind.type === 'extension_arc') {
          const r = 14;
          const s = (ind.angle_start || 0) * Math.PI / 180;
          const e = (ind.angle_end || 90) * Math.PI / 180;
          const sx = ind.x + r * Math.cos(s);
          const sy = ind.y + r * Math.sin(s);
          const ex = ind.x + r * Math.cos(e);
          const ey = ind.y + r * Math.sin(e);
          const largeArc = Math.abs(e - s) > Math.PI ? 1 : 0;
          return <path key={i} d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} ${e > s ? 1 : 0} ${ex} ${ey}`}
            fill="none" stroke={ind.color || C.teal} strokeWidth="0.7" strokeDasharray="2,1" opacity={0.8} />;
        }
        return null;
      })}
      {/* Overlay labels */}
      {visible.filter(ind => ind.label && (ind.type === 'joint_pivot' || ind.type === 'hand_placement')).map((ind, i) => (
        <text key={`lbl-${i}`} x={ind.x + 4} y={ind.y - 3} fill={ind.color || "#fff"} fontSize="2.2" fontFamily="Inter, sans-serif" opacity={0.9}>
          {ind.label}
        </text>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// BREED IMAGE — Real dog breed photos via Dog.CEO API for storyboard frames
// ─────────────────────────────────────────────
const BREED_API_MAP = {
  'Belgian Malinois':              'malinois',
  'Border Collie':                 'collie/border',
  'Cavalier King Charles Spaniel': 'spaniel/cocker',
  'Labrador Retriever':            'labrador',
  'Dachshund':                     'dachshund',
  'Golden Retriever':              'retriever/golden',
  'German Shepherd':               'german/shepherd',
  'Shih Tzu':                      'shihtzu',
  'Rottweiler':                    'rottweiler',
  'Boxer':                         'boxer',
  'Great Dane':                    'dane/great',
  'Pembroke Welsh Corgi':          'corgi/cardigan',
  'French Bulldog':                'bulldog/french',
  'Bernese Mountain Dog':          'mountain/bernese',
  'English Bulldog':               'bulldog/english',
  'Australian Shepherd':           'australian/shepherd',
  'Greyhound':                     'greyhound/italian',
  'Standard Poodle':               'poodle/standard',
  'Newfoundland':                  'newfoundland',
  'Medium-sized dog':              'retriever/golden',
};

// In-memory cache so the same breed doesn't re-fetch across frames
const breedImageCache = {};

function BreedImage({ breedName, exerciseCode, frameNumber, accentColor = '#39FF7E' }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);

    // Cache key includes exercise + frame for AI-generated images
    const cacheKey = exerciseCode && frameNumber ? `${exerciseCode}_f${frameNumber}` : breedName;
    if (breedImageCache[cacheKey]) {
      setImageUrl(breedImageCache[cacheKey]);
      return;
    }

    // Try AI-generated image from backend first (if exerciseCode provided)
    if (exerciseCode && frameNumber) {
      setGenerating(true);
      fetch(`${API}/storyboard-images/${exerciseCode}/${frameNumber}`)
        .then(r => {
          if (r.ok && r.headers.get('content-type')?.includes('image')) {
            return r.blob();
          }
          throw new Error('Not cached yet');
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          breedImageCache[cacheKey] = url;
          setImageUrl(url);
          setGenerating(false);
        })
        .catch(() => {
          // Fall back to Dog.CEO breed photo
          setGenerating(false);
          const apiPath = BREED_API_MAP[breedName] || BREED_API_MAP['Medium-sized dog'];
          if (apiPath) {
            fetch(`https://dog.ceo/api/breed/${apiPath}/images/random`)
              .then(r => r.json())
              .then(data => {
                if (data.status === 'success' && data.message) {
                  breedImageCache[cacheKey] = data.message;
                  setImageUrl(data.message);
                } else { setImgError(true); }
              })
              .catch(() => setImgError(true));
          } else { setImgError(true); }
        });
    } else {
      // No exercise context — use Dog.CEO directly
      const apiPath = BREED_API_MAP[breedName] || BREED_API_MAP['Medium-sized dog'];
      fetch(`https://dog.ceo/api/breed/${apiPath}/images/random`)
        .then(r => r.json())
        .then(data => {
          if (data.status === 'success' && data.message) {
            breedImageCache[cacheKey] = data.message;
            setImageUrl(data.message);
          } else { setImgError(true); }
        })
        .catch(() => setImgError(true));
    }
  }, [breedName, exerciseCode, frameNumber]);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Loading state */}
      {!imgLoaded && !imgError && (
        <div style={{ position: "absolute", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid rgba(255,255,255,0.15)`, borderTopColor: accentColor, animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            {generating ? 'Generating exercise image...' : `Loading ${breedName}...`}
          </span>
        </div>
      )}
      {/* Exercise / breed photo */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`${breedName} - exercise demonstration`}
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImageUrl(null); }}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            opacity: imgLoaded ? 0.6 : 0,
            transition: "opacity 0.5s ease",
            filter: "saturate(0.8) contrast(1.05)",
          }}
        />
      )}
      {/* Gradient overlays for text readability */}
      {imgLoaded && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,37,64,0.55) 0%, rgba(10,37,64,0.15) 40%, rgba(10,37,64,0.5) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,52,96,0.25) 0%, transparent 50%)" }} />
        </>
      )}
      {/* Error fallback */}
      {imgError && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 36, opacity: 0.15 }}>🐕</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{breedName}</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STORYBOARD PLAYER — Frame-by-frame exercise demonstration modal
// ─────────────────────────────────────────────
function StoryboardPlayer({ exerciseCode, onClose }) {
  const [storyboard, setStoryboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scriptMode, setScriptMode] = useState('client');
  const [showScript, setShowScript] = useState(true);
  const [overlayToggles, setOverlayToggles] = useState({
    arrows: true, joint_angles: true, weight_shift: false,
    good_form: false, common_mistakes: false, safety_warnings: true,
  });

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/storyboards/${exerciseCode}`)
      .then(r => {
        setStoryboard(r.data.data || r.data);
        // Apply default overlay visibility from storyboard data
        if (r.data.data?.overlay_groups) {
          const defaults = {};
          Object.entries(r.data.data.overlay_groups).forEach(([key, val]) => { defaults[key] = val.default_visible; });
          setOverlayToggles(prev => ({ ...prev, ...defaults }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [exerciseCode]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || !storyboard) return;
    const frame = storyboard.frames[currentFrame];
    const timer = setTimeout(() => {
      if (currentFrame < storyboard.frames.length - 1) {
        setCurrentFrame(f => f + 1);
      } else {
        setIsPlaying(false);
        setCurrentFrame(0);
      }
    }, (frame.duration_seconds || 5) * 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentFrame, storyboard]);

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,0.92)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!storyboard) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,0.92)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.surface, borderRadius: 16, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Storyboard not found for {exerciseCode}</div>
          <button onClick={onClose} style={{ ...S.btn("dark"), marginTop: 16 }}>Close</button>
        </div>
      </div>
    );
  }

  const frame = storyboard.frames[currentFrame];
  const script = scriptMode === 'clinician' ? storyboard.clinician_script : storyboard.client_script;
  const branding = storyboard.branding || {};

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,0.92)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.surface, borderRadius: 16, width: "94%", maxWidth: 1100, maxHeight: "92vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: `1px solid ${C.border}` }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: C.navy }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {branding.asclepius_symbol && <span style={{ fontSize: 20, color: branding.neon_accent || "#39FF7E" }}>⚕</span>}
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: branding.font_title || "'Exo 2', sans-serif" }}>
                {storyboard.exercise_name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                {storyboard.clinical_purpose.length > 120 ? storyboard.clinical_purpose.slice(0, 120) + '...' : storyboard.clinical_purpose}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <FiX size={16} />
          </button>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display: "flex", gap: 0 }}>

          {/* ── FRAME VIEWER + CAPTIONS (left, flex 1) ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Frame Viewer */}
            <div style={{
              margin: "16px auto 0", borderRadius: 12, position: "relative", overflow: "hidden",
              background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
              aspectRatio: "1 / 1", width: "50%", border: `1px solid rgba(57,255,126,0.12)`,
              display: "flex", flexDirection: "column",
            }}>
              {/* Frame Title Banner */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px 16px", background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: branding.neon_accent || "#39FF7E", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Frame {frame.frame_number} of {storyboard.frames.length}
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginTop: 2, fontFamily: "'Exo 2', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    {frame.frame_title}
                    {storyboard.breed_model && (
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                        {storyboard.breed_model.breed} ({storyboard.breed_model.weight_lbs} lbs)
                      </span>
                    )}
                  </div>
                </div>
                {frame.status === 'locked' && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: C.amber, background: "rgba(217,119,6,0.15)", padding: "3px 10px", borderRadius: 20 }}>
                    <FiLock size={10} /> Premium
                  </span>
                )}
              </div>

              {/* Breed Photo + Overlay */}
              <div style={{ position: "relative", width: "100%", flex: 1 }}>
                <BreedImage
                  breedName={storyboard.breed_model?.breed || 'Medium-sized dog'}
                  exerciseCode={storyboard.exercise_code || exerciseCode}
                  frameNumber={frame.frame_number}
                  accentColor={branding.neon_accent || '#39FF7E'}
                />
                {/* SVG Overlay Layer — renders on top of breed photo */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <SvgOverlayLayer indicators={frame.svg_indicators} overlayToggles={overlayToggles} width="100%" height="100%" />
                </div>
                {/* Frame description overlaid on photo */}
                <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", zIndex: 3, padding: "0 32px" }}>
                  <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.7, maxWidth: 520, margin: "0 auto",
                    textShadow: "0 1px 6px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.4)",
                    background: "rgba(10,37,64,0.55)", backdropFilter: "blur(4px)",
                    padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    {frame.frame_description}
                  </div>
                </div>
              </div>

              {/* Watermark */}
              <div style={{
                position: "absolute", bottom: 8, right: 12, fontSize: 11, fontWeight: 700,
                color: `rgba(255,255,255,${branding.watermark_opacity || 0.08})`,
                fontFamily: "'Exo 2', sans-serif", letterSpacing: "0.5px", pointerEvents: "none"
              }}>
                {branding.watermark_text || "K9 Rehab Pro\u2122"}
              </div>

              {/* Frame progress bar */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)" }}>
                <div style={{ height: "100%", width: `${((currentFrame + 1) / storyboard.frames.length) * 100}%`, background: `linear-gradient(90deg, ${branding.neon_accent || "#39FF7E"}, ${branding.secondary_accent || C.teal})`, transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* ── CAPTION AREA ── */}
            <div style={{ margin: "0 16px", padding: "14px 18px", borderBottom: `1px solid ${C.borderLight}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Dog Action</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{frame.dog_action}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Handler Action</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{frame.handler_action}</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Clinical Cues</div>
                <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>{frame.clinical_cues}</div>
              </div>
              {frame.safety_notes && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: C.redBg, border: "1px solid rgba(220,38,38,0.15)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.red, display: "flex", alignItems: "center", gap: 4 }}>
                    <FiAlertTriangle size={10} /> Safety
                  </div>
                  <div style={{ fontSize: 11, color: C.red, marginTop: 3, lineHeight: 1.5 }}>{frame.safety_notes}</div>
                </div>
              )}
            </div>

            {/* ── NAVIGATION BAR ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.borderLight}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setCurrentFrame(0)} disabled={currentFrame === 0}
                  style={{ background: currentFrame === 0 ? C.bg : C.navy, color: currentFrame === 0 ? C.textLight : "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: currentFrame === 0 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>
                  ⏮
                </button>
                <button onClick={() => setCurrentFrame(f => Math.max(0, f - 1))} disabled={currentFrame === 0}
                  style={{ background: currentFrame === 0 ? C.bg : C.navy, color: currentFrame === 0 ? C.textLight : "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: currentFrame === 0 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>
                  ◀ Prev
                </button>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text, padding: "0 8px" }}>
                  {currentFrame + 1} / {storyboard.frames.length}
                </span>
                <button onClick={() => setCurrentFrame(f => Math.min(storyboard.frames.length - 1, f + 1))} disabled={currentFrame === storyboard.frames.length - 1}
                  style={{ background: currentFrame === storyboard.frames.length - 1 ? C.bg : C.navy, color: currentFrame === storyboard.frames.length - 1 ? C.textLight : "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: currentFrame === storyboard.frames.length - 1 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>
                  Next ▶
                </button>
                <button onClick={() => setCurrentFrame(storyboard.frames.length - 1)} disabled={currentFrame === storyboard.frames.length - 1}
                  style={{ background: currentFrame === storyboard.frames.length - 1 ? C.bg : C.navy, color: currentFrame === storyboard.frames.length - 1 ? C.textLight : "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: currentFrame === storyboard.frames.length - 1 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>
                  ⏭
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => { setIsPlaying(p => !p); if (!isPlaying) setCurrentFrame(0); }}
                  style={{ background: isPlaying ? C.red : C.teal, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  {isPlaying ? "⏹ Stop" : "▶ Play All"}
                </button>
                <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
                  <button onClick={() => setScriptMode('client')}
                    style={{ padding: "5px 10px", fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer", background: scriptMode === 'client' ? C.teal : C.bg, color: scriptMode === 'client' ? "#fff" : C.textMid }}>
                    Client
                  </button>
                  <button onClick={() => setScriptMode('clinician')}
                    style={{ padding: "5px 10px", fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer", background: scriptMode === 'clinician' ? C.navy : C.bg, color: scriptMode === 'clinician' ? "#fff" : C.textMid }}>
                    Clinician
                  </button>
                </div>
              </div>
            </div>

            {/* ── SCRIPT PANEL ── */}
            <div style={{ padding: "0 16px 16px" }}>
              <button onClick={() => setShowScript(s => !s)} style={{ background: "none", border: "none", padding: "10px 0", cursor: "pointer", fontSize: 11, fontWeight: 600, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}>
                {showScript ? "▼" : "▶"} {scriptMode === 'clinician' ? "Clinician" : "Client"} Script ({script.duration_range})
              </button>
              {showScript && (
                <div style={{
                  padding: "14px 18px", borderRadius: 10,
                  background: scriptMode === 'clinician' ? "rgba(10,37,64,0.04)" : "rgba(14,165,233,0.04)",
                  border: `1px solid ${scriptMode === 'clinician' ? "rgba(10,37,64,0.1)" : "rgba(14,165,233,0.12)"}`,
                }}>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{script.text}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
                    {script.key_phrases.map((kp, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(14,165,233,0.1)", color: C.teal }}>{kp}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── OVERLAY TOGGLES PANEL (right sidebar) ── */}
          <div style={{ width: 180, flexShrink: 0, borderLeft: `1px solid ${C.borderLight}`, padding: "16px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
              Clinical Overlays
            </div>
            {storyboard.overlay_groups && Object.entries(storyboard.overlay_groups).map(([key, group]) => (
              <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={overlayToggles[key] || false}
                  onChange={() => setOverlayToggles(prev => ({ ...prev, [key]: !prev[key] }))}
                  style={{ marginTop: 2, accentColor: group.color }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{group.label}</div>
                  <div style={{ fontSize: 9, color: C.textLight, lineHeight: 1.4, marginTop: 1 }}>{group.description}</div>
                </div>
              </label>
            ))}

            {/* ── Quick Info ── */}
            <div style={{ marginTop: 16, padding: "10px 12px", borderRadius: 8, background: C.bg, border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Exercise Info</div>
              <div style={{ fontSize: 10, color: C.textMid, marginBottom: 4 }}>
                <strong>Frames:</strong> {storyboard.frames.length}
              </div>
              <div style={{ fontSize: 10, color: C.textMid, marginBottom: 4 }}>
                <strong>Version:</strong> {storyboard.version}
              </div>
              <div style={{ fontSize: 10, color: C.textMid }}>
                <strong>Code:</strong> {storyboard.exercise_code}
              </div>
            </div>

            {/* ── Breed Model ── */}
            {storyboard.breed_model && (
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.12)" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Breed Model</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{storyboard.breed_model.breed}</div>
                <div style={{ fontSize: 10, color: C.textMid, marginTop: 2 }}>{storyboard.breed_model.weight_lbs} lbs, {storyboard.breed_model.size}</div>
                <div style={{ fontSize: 10, color: C.textMid, marginTop: 1 }}>{storyboard.breed_model.build}</div>
                <div style={{ fontSize: 10, color: C.textLight, marginTop: 1, fontStyle: "italic" }}>{storyboard.breed_model.temperament}</div>
              </div>
            )}

            {/* ── Equipment ── */}
            {storyboard.equipment_needed && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Equipment</div>
                {storyboard.equipment_needed.map((eq, i) => (
                  <div key={i} style={{ fontSize: 10, color: eq.required ? C.text : C.textLight, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: eq.required ? C.green : C.borderLight }}>{eq.required ? "●" : "○"}</span>
                    {eq.item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryboardPlayer;
