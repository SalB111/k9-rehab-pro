// ============================================================================
// K9 REHAB PRO™ — UNIVERSAL ICON SYSTEM v2.0
// 18 Category Icons | Continuous-Flow Geometric | Neon Clinical
// ============================================================================
// STYLE: Continuous-flow outlines — one smooth, unbroken line per dog body.
//        Quadratic bezier curves (Q), subtle neon glow, pure black background.
// GREEN = movement | RED = medical/passive | DUAL = complex/blended
// ============================================================================
import React from "react";

const NEON_GREEN = "#39FF14";
const NEON_RED   = "#FF1744";

// Reusable glow filter — subtle neon halo
const Glow = ({ id, color, spread = 2.5 }) => (
  <filter id={id} x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation={spread} result="b" />
    <feFlood floodColor={color} floodOpacity="0.35" result="c" />
    <feComposite in="c" in2="b" operator="in" result="g" />
    <feMerge>
      <feMergeNode in="g" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

// Shared SVG constants
const sw = 1.6; // stroke-width
const base = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };

// ============================================================================
// 1. ACTIVE ASSISTED — Neon Green
//    Dog standing square with supportive weight arrows pressing down
// ============================================================================
export function IconActiveAssisted({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-aa" color={NEON_GREEN} /></defs>
      <g filter="url(#g-aa)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Dog standing — continuous: tail → back → head → jaw */}
        <path d="M8,22 Q6,18 10,20 L16,18 Q22,16 28,16 L34,16 Q38,15 42,14 Q46,12 48,14 Q46,16 42,18 L38,20 Q36,22 36,30 L36,38 M36,30 Q34,30 32,30 L32,38 M16,18 Q16,20 16,30 L16,38 M20,17 Q20,20 20,30 L20,38"/>
        {/* Ground plane */}
        <line x1="12" y1="38" x2="40" y2="38"/>
        {/* Weight arrows — pressing down (assisted support) */}
        <path d="M18,8 L18,14 M17,12 L18,14 L19,12"/>
        <path d="M34,8 L34,14 M33,12 L34,14 L35,12"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 2. AQUATIC THERAPY — Neon Green
//    Water surface sine wave + dog head above, body submerged
// ============================================================================
export function IconAquaticTherapy({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-aq" color={NEON_GREEN} /></defs>
      <g filter="url(#g-aq)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Water surface — continuous sine wave */}
        <path d="M4,34 Q10,30 16,34 Q22,38 28,34 Q34,30 40,34 Q46,38 52,34 Q58,30 60,34"/>
        {/* Second wave */}
        <path d="M4,40 Q10,36 16,40 Q22,44 28,40 Q34,36 40,40 Q46,44 52,40 Q58,36 60,40" opacity="0.4"/>
        {/* Dog swimming — head + neck above water — continuous */}
        <path d="M34,26 Q38,24 42,22 Q46,20 48,22 Q46,24 42,26 L38,28"/>
        {/* Submerged body hint */}
        <path d="M14,32 Q20,30 26,28 L34,26" strokeDasharray="3,3" opacity="0.5"/>
        {/* Paddling legs */}
        <path d="M20,32 L18,36 M28,30 L26,36 M34,28 L36,34" strokeDasharray="2,2" opacity="0.5"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 3. ATHLETIC FOUNDATIONS — Neon Green
//    Dog in play bow — athletic ready stance + strength star
// ============================================================================
export function IconAthleticFoundations({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-af" color={NEON_GREEN} /></defs>
      <g filter="url(#g-af)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Dog in play bow — continuous: tail → rump → back → head */}
        <path d="M8,18 Q6,14 10,16 L16,20 Q20,22 24,22 L30,20 Q34,18 38,14 Q42,12 44,14 Q42,16 38,18 M36,16 Q36,22 36,30 M32,18 L32,30 M16,20 Q14,24 14,30 M20,22 Q20,26 20,30"/>
        {/* Ground */}
        <line x1="10" y1="30" x2="40" y2="30"/>
        {/* Strength star */}
        <path d="M50,10 L51,14 L55,14 L52,17 L53,21 L50,18 L47,21 L48,17 L45,14 L49,14 Z" strokeWidth="1.2"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 4. BALANCE & PROPRIOCEPTION — Neon Green
//    Dog standing on wobble disc with tilt indicators
// ============================================================================
export function IconBalanceProprioception({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-bp" color={NEON_GREEN} /></defs>
      <g filter="url(#g-bp)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Wobble disc — continuous arc */}
        <path d="M12,42 Q24,48 38,48 Q52,48 52,42 Q52,38 38,36 Q24,36 12,38 Q12,40 12,42Z"/>
        {/* Dog standing on disc — continuous: tail → back → head */}
        <path d="M16,28 Q14,24 18,26 L24,24 Q28,22 32,22 L36,22 Q40,21 42,20 Q44,18 46,20 Q44,22 40,24 L38,26 Q38,28 38,36 M34,24 L34,36 M20,25 L20,36 M24,24 L24,36"/>
        {/* Tilt indicators */}
        <path d="M8,36 Q6,32 8,30" opacity="0.5"/>
        <path d="M56,36 Q58,32 56,30" opacity="0.5"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 5. BREED-SPECIFIC — Neon Red
//    Dachshund — elongated continuous-flow outline with spine line
// ============================================================================
export function IconBreedSpecific({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-bs" color={NEON_RED} /></defs>
      <g filter="url(#g-bs)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        {/* Dachshund — continuous elongated flow: tail → long back → small head → jaw */}
        <path d="M6,24 Q4,20 8,22 L14,20 Q22,18 30,18 Q38,18 44,20 Q48,22 50,20 Q52,18 50,16 Q48,14 50,16"/>
        {/* Short legs — dachshund proportions */}
        <path d="M12,22 Q12,26 12,30 M18,20 Q18,24 18,30 M38,20 Q38,24 38,30 M44,22 Q44,26 44,30"/>
        {/* Ear — floppy */}
        <path d="M50,20 Q52,22 50,24" opacity="0.7"/>
        {/* Diagnostic spine line */}
        <path d="M10,18 Q24,15 44,18" strokeDasharray="4,2" opacity="0.6"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 6. COMPLEMENTARY THERAPY — Dual-Tone
//    Dog head (red) paired with flowing geometric leaf (green)
// ============================================================================
export function IconComplementaryTherapy({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs>
        <Glow id="g-ct-r" color={NEON_RED} />
        <Glow id="g-ct-g" color={NEON_GREEN} />
      </defs>
      {/* Dog head — continuous curve — neon red */}
      <g filter="url(#g-ct-r)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        <path d="M10,32 Q12,28 16,24 Q20,20 24,18 Q28,18 30,22 Q32,26 32,30"/>
        {/* Ear */}
        <path d="M24,18 Q22,12 20,14"/>
        {/* Eye */}
        <circle cx="27" cy="23" r="1.5"/>
        {/* Muzzle */}
        <path d="M32,30 Q34,32 32,34"/>
      </g>
      {/* Geometric leaf — continuous flow — neon green */}
      <g filter="url(#g-ct-g)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        <path d="M40,10 Q50,18 46,30 Q42,20 40,10Z"/>
        {/* Leaf vein */}
        <path d="M43,16 L43,26"/>
        {/* Stem */}
        <path d="M43,26 Q40,30 38,34"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 7. FUNCTIONAL TRAINING — Neon Green
//    Dog stepping over cavaletti rails — high-stepping flow
// ============================================================================
export function IconFunctionalTraining({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-ft" color={NEON_GREEN} /></defs>
      <g filter="url(#g-ft)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Three cavaletti rails — connected stands */}
        <path d="M8,44 L8,38 L18,38 L18,44 M24,44 L24,38 L34,38 L34,44 M40,44 L40,38 L50,38 L50,44"/>
        {/* Dog stepping over — continuous high-stepping flow */}
        <path d="M12,26 Q10,22 14,24 L20,22 Q24,20 28,18 L34,18 Q38,17 42,16 Q44,14 46,16 Q44,18 40,20 M38,18 Q40,24 42,32 M34,18 Q32,24 30,30 M18,23 Q16,28 14,34 M22,21 Q22,26 22,34"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 8. GERIATRIC CARE — Neon Red
//    Aged dog — curved spine, wide stance + small heart
// ============================================================================
export function IconGeriatricCare({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-gc" color={NEON_RED} /></defs>
      <g filter="url(#g-gc)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        {/* Aged dog — slightly curved spine, wider stance — continuous */}
        <path d="M8,24 Q6,20 10,22 L16,20 Q22,18 28,18 Q34,18 38,20 Q42,22 44,20 Q48,18 50,20 Q48,22 44,24"/>
        {/* Wide-stance legs */}
        <path d="M14,21 Q12,26 10,34 M20,19 Q20,26 20,34 M32,19 Q34,26 36,34 M38,20 Q40,26 42,34"/>
        {/* Support harness arc */}
        <path d="M18,14 Q28,8 38,14" strokeDasharray="3,3" opacity="0.6"/>
        {/* Heart — care */}
        <path d="M4,12 Q4,8 8,10 Q12,8 12,12 L8,18 L4,12"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 9. HYDROTHERAPY — Neon Green
//    Swimming dog — full horizontal posture with paddle strokes
// ============================================================================
export function IconHydrotherapy({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-hy" color={NEON_GREEN} /></defs>
      <g filter="url(#g-hy)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Swimming dog — continuous horizontal flow: tail → back → head */}
        <path d="M8,22 Q6,18 10,20 L16,18 Q22,16 28,16 Q34,16 38,18 Q42,16 44,14 Q48,12 50,14 Q48,16 44,18"/>
        {/* Paddling legs — flowing strokes */}
        <path d="M14,20 Q12,24 10,30 M20,18 Q18,24 16,30 M32,18 Q34,24 36,30 M38,20 Q40,24 42,30"/>
        {/* Two paddle splash lines */}
        <path d="M10,30 Q14,32 18,30" opacity="0.6"/>
        <path d="M36,30 Q40,32 44,30" opacity="0.6"/>
        {/* Water line — continuous wave */}
        <path d="M2,26 Q8,22 14,26 Q20,30 26,26 Q32,22 38,26 Q44,30 50,26 Q56,22 60,26" strokeDasharray="4,3" opacity="0.4"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 10. MANUAL THERAPY — Neon Red
//     Dog lying on side + therapist hand touching — continuous flow
// ============================================================================
export function IconManualTherapy({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-mt" color={NEON_RED} /></defs>
      <g filter="url(#g-mt)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        {/* Dog lying on side — continuous flow: tail → back → head → chest → belly */}
        <path d="M10,36 Q8,32 12,30 L20,28 Q28,26 34,26 L40,27 Q44,28 46,26 Q48,24 50,26 Q48,28 44,30 L34,32 Q28,34 20,34 L14,35 Q10,36 10,36"/>
        {/* Tucked legs as continuation */}
        <path d="M18,34 L16,38 M26,34 L26,38 M36,30 L38,34"/>
        {/* Therapist hand — continuous curved fingers */}
        <path d="M28,16 Q26,12 28,10 Q30,8 32,10 Q34,8 36,10 Q38,12 36,16 Q34,18 32,20 Q30,18 28,16Z"/>
        {/* Touch line to dog */}
        <path d="M32,20 L32,26" strokeDasharray="2,3"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 11. NEUROLOGICAL REHAB — Dual-Tone
//     Dog body (green) with spine nerve signals (red)
// ============================================================================
export function IconNeurologicalRehab({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs>
        <Glow id="g-nr-g" color={NEON_GREEN} />
        <Glow id="g-nr-r" color={NEON_RED} />
      </defs>
      {/* Dog body — continuous flow */}
      <g filter="url(#g-nr-g)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        <path d="M10,26 Q8,22 12,24 L18,22 Q24,20 30,20 L36,20 Q40,19 44,18 Q48,16 50,18 Q48,20 44,22 L40,24 Q40,28 42,36 M36,22 L38,36 M14,23 Q12,28 10,36 M18,22 Q20,28 22,36"/>
      </g>
      {/* Spine nerve signals — neon red */}
      <g filter="url(#g-nr-r)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        <path d="M16,20 Q20,18 24,18 Q28,18 32,18 Q36,18 40,20"/>
        {/* Neural pulses along spine */}
        <circle cx="20" cy="18" r="2" strokeDasharray="1.5,1.5"/>
        <circle cx="28" cy="18" r="2" strokeDasharray="1.5,1.5"/>
        <circle cx="36" cy="19" r="2" strokeDasharray="1.5,1.5"/>
        {/* Lightning — neural signal */}
        <path d="M28,6 L26,10 L30,10 L28,14" strokeWidth="1.4"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 12. PALLIATIVE CARE — Neon Red
//     Curled/resting dog + shield (protection from pain)
// ============================================================================
export function IconPalliativeCare({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-pc" color={NEON_RED} /></defs>
      <g filter="url(#g-pc)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        {/* Dog curled/resting — continuous loop shape */}
        <path d="M14,34 Q10,30 14,28 L20,26 Q26,24 32,24 L38,26 Q42,28 44,26 Q46,24 48,26 Q46,28 42,30 L36,32 Q30,34 22,36 Q16,36 14,34Z"/>
        {/* Tucked legs */}
        <path d="M22,36 L20,40 M30,34 L30,40"/>
        {/* Shield — protection from pain */}
        <path d="M24,10 L30,8 L36,10 L36,18 Q30,22 24,18 Z"/>
        {/* Minus — pain reduction */}
        <line x1="28" y1="14" x2="32" y2="14" strokeWidth="1.8"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 13. PASSIVE THERAPY — Neon Red
//     Hand gently lifting dog limb — continuous-flow curves
// ============================================================================
export function IconPassiveTherapy({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-pt" color={NEON_RED} /></defs>
      <g filter="url(#g-pt)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        {/* Dog limb — continuous flowing curve */}
        <path d="M38,8 Q36,14 34,20 Q32,26 30,32"/>
        {/* Joint markers */}
        <circle cx="36" cy="14" r="2.5"/>
        <circle cx="34" cy="20" r="2.5"/>
        {/* Paw */}
        <path d="M30,32 Q28,34 30,36"/>
        {/* Hand underneath — continuous curved fingers lifting */}
        <path d="M16,30 Q14,26 16,22 Q18,18 20,20 Q22,18 24,20 Q26,22 24,28 Q22,30 20,32 Q18,32 16,30Z"/>
        {/* Touch/lift connection */}
        <path d="M24,24 L30,20" strokeDasharray="2,3"/>
        {/* Lift arrow */}
        <path d="M44,26 L44,14 M42,18 L44,14 L46,18"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 14. PEDIATRIC REHABILITATION — Neon Green
//     Small playful puppy with growth arcs
// ============================================================================
export function IconPediatricRehab({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-pr" color={NEON_GREEN} /></defs>
      <g filter="url(#g-pr)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Puppy — continuous: proportionally bigger head, shorter body */}
        <path d="M20,28 Q18,24 22,26 L28,24 Q32,22 34,20 Q38,16 42,14 Q46,12 48,14 Q46,16 42,18 Q40,20 38,22"/>
        {/* Floppy ear */}
        <path d="M42,14 Q44,18 42,20" opacity="0.7"/>
        {/* Tail — up, playful */}
        <path d="M20,28 Q18,22 16,18"/>
        {/* Short puppy legs */}
        <path d="M24,26 Q24,30 24,34 M28,24 Q28,28 28,34 M34,22 Q34,28 34,34 M38,22 Q38,28 38,34"/>
        {/* Ground */}
        <line x1="16" y1="34" x2="42" y2="34"/>
        {/* Growth arcs — upward */}
        <path d="M8,34 Q10,28 14,24" opacity="0.6"/>
        <path d="M6,38 Q10,30 16,24" opacity="0.4"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 15. POST-SURGICAL — Neon Red
//     Standing dog + bandage wraps + medical cross
// ============================================================================
export function IconPostSurgical({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-ps" color={NEON_RED} /></defs>
      <g filter="url(#g-ps)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        {/* Dog standing — continuous flow with surgical limb indicated */}
        <path d="M10,22 Q8,18 12,20 L18,18 Q24,16 30,16 L36,16 Q40,15 44,14 Q48,12 50,14 Q48,16 44,18 L40,20 Q40,22 40,32 L40,38 M36,18 L36,38 M14,19 L14,38 M18,18 Q18,22 18,32 L18,38"/>
        {/* Bandage wraps on rear leg */}
        <path d="M16,24 L20,24 M16,27 L20,27 M16,30 L20,30" strokeWidth="1.4"/>
        {/* Medical cross */}
        <path d="M6,8 L6,16 M2,12 L10,12" strokeWidth="1.8"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 16. SPORT CONDITIONING — Neon Green
//     Dog in full gallop — explosive flow + speed streaks
// ============================================================================
export function IconSportConditioning({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-sc" color={NEON_GREEN} /></defs>
      <g filter="url(#g-sc)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Dog in full gallop — continuous explosive flow */}
        <path d="M4,26 Q2,22 6,20 L12,16 Q18,12 24,12 L30,12 Q34,10 38,8 Q42,6 44,8 Q42,10 38,12 L34,14 Q36,18 42,26 M30,12 Q28,18 26,26 M10,18 Q8,24 6,32 M16,14 Q16,22 16,30"/>
        {/* Speed streaks */}
        <path d="M46,10 L54,10 M48,12 L56,12 M46,14 L54,14 M48,16 L52,16" opacity="0.5"/>
        {/* Upward trajectory arrow */}
        <path d="M50,28 L52,20 M51,22 L52,20 L53,22" opacity="0.7"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 17. STRENGTHENING — Neon Green
//     Dog in athletic stance + upward progress arrow + trend line
// ============================================================================
export function IconStrengthening({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-st" color={NEON_GREEN} /></defs>
      <g filter="url(#g-st)" stroke={NEON_GREEN} strokeWidth={sw} {...base}>
        {/* Dog in athletic stance — continuous flow */}
        <path d="M8,24 Q6,20 10,22 L16,20 Q22,18 28,18 L34,18 Q38,17 42,16 Q46,14 48,16 Q46,18 42,20 L38,22 Q38,26 38,34 M34,20 L34,34 M14,21 L14,34 M18,20 L18,34"/>
        {/* Ground */}
        <line x1="10" y1="34" x2="42" y2="34"/>
        {/* Upward progress arrow */}
        <path d="M50,28 L50,12 M48,16 L50,12 L52,16"/>
        {/* Trend line — ascending */}
        <path d="M46,42 L50,36 L54,38 L58,30" strokeWidth="1.2"/>
      </g>
    </svg>
  );
}

// ============================================================================
// 18. THERAPEUTIC MODALITIES — Neon Red
//     Medical probe with emission rays over dog body
// ============================================================================
export function IconTherapeuticModalities({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs><Glow id="g-tm" color={NEON_RED} /></defs>
      <g filter="url(#g-tm)" stroke={NEON_RED} strokeWidth={sw} {...base}>
        {/* Dog body — continuous flow */}
        <path d="M10,38 Q8,34 12,32 L18,30 Q24,28 30,28 L36,28 Q40,28 44,30 Q46,32 44,34 L38,36 Q32,38 24,38 L16,38 Q12,38 10,38"/>
        <path d="M20,38 L20,44 M28,38 L28,44 M36,34 L38,40"/>
        {/* Medical probe — continuous flow */}
        <path d="M28,8 Q26,8 26,12 L26,16 Q26,18 28,18 L32,18 Q34,18 34,16 L34,12 Q34,8 32,8 L28,8"/>
        <path d="M30,18 L30,22"/>
        {/* Emission rays */}
        <path d="M26,22 L24,26 M30,22 L30,26 M34,22 L36,26" opacity="0.7"/>
        {/* Target on dog */}
        <circle cx="30" cy="30" r="3" strokeDasharray="2,2" opacity="0.6"/>
      </g>
    </svg>
  );
}

// ============================================================================
// MASTER ICON MAP — keyed by exact category name from exercise database
// ============================================================================
const K9_ICONS = {
  "Active Assisted":          IconActiveAssisted,
  "Aquatic Therapy":          IconAquaticTherapy,
  "Athletic Foundations":     IconAthleticFoundations,
  "Balance & Proprioception": IconBalanceProprioception,
  "Breed-Specific":           IconBreedSpecific,
  "Complementary Therapy":    IconComplementaryTherapy,
  "Functional Training":      IconFunctionalTraining,
  "Geriatric Care":           IconGeriatricCare,
  "Hydrotherapy":             IconHydrotherapy,
  "Manual Therapy":           IconManualTherapy,
  "Neurological Rehab":       IconNeurologicalRehab,
  "Palliative Care":          IconPalliativeCare,
  "Passive Therapy":          IconPassiveTherapy,
  "Pediatric Rehabilitation": IconPediatricRehab,
  "Post-Surgical":            IconPostSurgical,
  "Sport Conditioning":       IconSportConditioning,
  "Strengthening":            IconStrengthening,
  "Therapeutic Modalities":   IconTherapeuticModalities,
};

// Helper to get icon component by category name
export function getK9Icon(categoryName) {
  return K9_ICONS[categoryName] || null;
}

// Color map for external styling
export const K9_ICON_COLORS = {
  "Active Assisted":          { color: NEON_GREEN, type: "green" },
  "Aquatic Therapy":          { color: NEON_GREEN, type: "green" },
  "Athletic Foundations":     { color: NEON_GREEN, type: "green" },
  "Balance & Proprioception": { color: NEON_GREEN, type: "green" },
  "Breed-Specific":           { color: NEON_RED,   type: "red" },
  "Complementary Therapy":    { color: NEON_GREEN, type: "dual" },
  "Functional Training":      { color: NEON_GREEN, type: "green" },
  "Geriatric Care":           { color: NEON_RED,   type: "red" },
  "Hydrotherapy":             { color: NEON_GREEN, type: "green" },
  "Manual Therapy":           { color: NEON_RED,   type: "red" },
  "Neurological Rehab":       { color: NEON_GREEN, type: "dual" },
  "Palliative Care":          { color: NEON_RED,   type: "red" },
  "Passive Therapy":          { color: NEON_RED,   type: "red" },
  "Pediatric Rehabilitation": { color: NEON_GREEN, type: "green" },
  "Post-Surgical":            { color: NEON_RED,   type: "red" },
  "Sport Conditioning":       { color: NEON_GREEN, type: "green" },
  "Strengthening":            { color: NEON_GREEN, type: "green" },
  "Therapeutic Modalities":   { color: NEON_RED,   type: "red" },
};

export default K9_ICONS;
