// ============================================================================
// ANATOMY VIEWER — B.E.A.U. Rehab-Context SVG Anatomy Panel
// ============================================================================
// Exercise-reactive: highlights the muscles THIS exercise targets.
// Diagnosis-reactive: highlights the structure affected by the condition.
// Client education mode: simplified labels in plain English.
// Species-aware: canine vs feline silhouette.
// ============================================================================

import React, { useState, useMemo } from "react";
import { FiEye, FiLayers, FiInfo, FiX } from "react-icons/fi";
import { TbDog, TbCat } from "react-icons/tb";
import C from "../constants/colors";

// ── Exercise → Muscle mapping ─────────────────────────────────────────────
const EXERCISE_MUSCLE_MAP = {
  SIT_STAND:         { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r","hock_l","hock_r"] },
  DOWN_STAND:        { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hip_flexor_l","hip_flexor_r"] },
  HILL_CLIMB:        { primary: ["glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["quad_l","quad_r","calf_l","calf_r"] },
  BACKWARD_HILL:     { primary: ["quad_l","quad_r","calf_l","calf_r"], secondary: ["hip_flexor_l","hip_flexor_r"] },
  STAIR_CLIMB:       { primary: ["quad_l","quad_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["calf_l","calf_r"] },
  SLOW_WALK:         { primary: ["hip_flexor_l","hip_flexor_r","quad_l","quad_r"], secondary: ["hamstring_l","hamstring_r","shoulder_l","shoulder_r"] },
  SIDE_STEP:         { primary: ["glute_l","glute_r","hip_adduct_l","hip_adduct_r"], secondary: ["quad_l","quad_r"] },
  BACKING_UP:        { primary: ["hip_flexor_l","hip_flexor_r","quad_l","quad_r"], secondary: ["hamstring_l","hamstring_r"] },
  FIGURE_8:          { primary: ["hip_flexor_l","hip_flexor_r","glute_l","glute_r"], secondary: ["hip_adduct_l","hip_adduct_r"] },
  PROM_STIFLE:       { primary: ["ccl","stifle_l","stifle_r"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  PROM_HIP:          { primary: ["hip_l","hip_r"], secondary: ["glute_l","glute_r","hip_flexor_l","hip_flexor_r"] },
  WEIGHT_SHIFT:      { primary: ["quad_l","quad_r","shoulder_l","shoulder_r"], secondary: ["hip_adduct_l","hip_adduct_r"] },
  THREE_LEG_STAND:   { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r"] },
  WHEELBARROW:       { primary: ["shoulder_l","shoulder_r","tricep_l","tricep_r"], secondary: ["spine","core"] },
  WOBBLE_BOARD:      { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r"], secondary: ["spine","core"] },
  CAVALETTI:         { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r"] },
  UWT_WALK:          { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["stifle_l","stifle_r"] },
  ILIO_STRETCH:      { primary: ["hip_flexor_l","hip_flexor_r"], secondary: ["hip_l","hip_r","spine"] },
  MASSAGE_THERA:     { primary: ["paraspinal_l","paraspinal_r"], secondary: ["glute_l","glute_r","hamstring_l","hamstring_r"] },
  NMES_QUAD:         { primary: ["quad_l","quad_r"], secondary: ["stifle_l","stifle_r"] },
  FELINE_PROM:       { primary: ["stifle_l","stifle_r","hip_l","hip_r"], secondary: ["quad_l","quad_r"] },
  FELINE_WAND_AROM:  { primary: ["shoulder_l","shoulder_r","hip_flexor_l","hip_flexor_r"], secondary: ["elbow_l","elbow_r","stifle_l","stifle_r"] },
  FELINE_TREAT_SHIFT:{ primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hip_adduct_l","hip_adduct_r"] },
  FELINE_CAVALETTI:  { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r"] },
  FELINE_SIT_STAND:  { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r"] },
  FELINE_STAIR_WAND: { primary: ["glute_l","glute_r","quad_l","quad_r","hamstring_l","hamstring_r"], secondary: ["calf_l","calf_r"] },
  FELINE_THREE_LEG:  { primary: ["shoulder_l","shoulder_r","quad_l","quad_r"], secondary: ["hip_adduct_l","hip_adduct_r"] },
  FELINE_WOBBLE:     { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","shoulder_l","shoulder_r"], secondary: ["spine","core"] },
};

// ── Diagnosis → Affected structures ──────────────────────────────────────
const DIAGNOSIS_STRUCTURE_MAP = {
  "POST_TPLO":          { structures: ["ccl","stifle_l"], label: "CCL repaired — stifle stabilized", color: "#ef4444" },
  "TPLO":               { structures: ["ccl","stifle_l"], label: "CCL repaired — stifle stabilized", color: "#ef4444" },
  "TTA":                { structures: ["ccl","stifle_l","quad_l"], label: "CCL repair via TTA — tibial tuberosity", color: "#ef4444" },
  "FHO":                { structures: ["hip_l","glute_l"], label: "Femoral head removed — pseudoarthrosis forming", color: "#f97316" },
  "HIP_DYSPLASIA":      { structures: ["hip_l","hip_r","glute_l","glute_r"], label: "Hip dysplasia — bilateral joint laxity", color: "#f97316" },
  "IVDD":               { structures: ["spine","paraspinal_l","paraspinal_r"], label: "Disc herniation — spinal cord compression", color: "#8b5cf6" },
  "DEGENERATIVE_MYELOPATHY": { structures: ["spine","paraspinal_l","paraspinal_r","quad_l","quad_r"], label: "DM — progressive upper motor neuron disease", color: "#8b5cf6" },
  "OA_GENERAL":         { structures: ["stifle_l","stifle_r","hip_l","hip_r"], label: "Multi-joint osteoarthritis", color: "#f59e0b" },
  "Hip Dysplasia":      { structures: ["hip_l","hip_r","glute_l","glute_r"], label: "Hip dysplasia — bilateral joint laxity", color: "#f97316" },
  "TPLO Post-Op":       { structures: ["ccl","stifle_l"], label: "Post-TPLO stifle", color: "#ef4444" },
  "IVDD Conservative":  { structures: ["spine","paraspinal_l","paraspinal_r"], label: "IVDD — spinal cord affected", color: "#8b5cf6" },
  "FELINE_OA":          { structures: ["stifle_l","stifle_r","hip_l","hip_r","elbow_l","elbow_r"], label: "Feline OA — typically bilateral, silent lameness", color: "#f59e0b" },
  "FELINE_OA_AXIAL":    { structures: ["spine","paraspinal_l","paraspinal_r"], label: "Feline axial OA — spine/lumbosacral", color: "#f59e0b" },
  "FELINE_IVDD_CAT":    { structures: ["spine","paraspinal_l","paraspinal_r","hamstring_l","hamstring_r"], label: "Feline IVDD — lumbar most common (59%)", color: "#8b5cf6" },
  "FELINE_FATE_RECOVERY":{ structures: ["hock_l","hock_r","calf_l","calf_r","hip_l","hip_r"], label: "FATE recovery — ischemic neuropathy, hindlimbs", color: "#ec4899" },
  "FELINE_HCM_SUBCLINICAL":{ structures: ["spine"], label: "HCM subclinical — cardiac monitoring required", color: "#ec4899" },
};

// ── Muscle metadata (label + clinical name) ───────────────────────────────
const MUSCLE_INFO = {
  quad_l:       { label: "L Quadriceps", clinical: "m. quadriceps femoris", plain: "Front thigh muscle — stifle extensor" },
  quad_r:       { label: "R Quadriceps", clinical: "m. quadriceps femoris", plain: "Front thigh muscle — stifle extensor" },
  hamstring_l:  { label: "L Hamstrings", clinical: "mm. biceps femoris / semitendinosus", plain: "Back thigh muscles — hip extensor & stifle flexor" },
  hamstring_r:  { label: "R Hamstrings", clinical: "mm. biceps femoris / semitendinosus", plain: "Back thigh muscles — hip extensor & stifle flexor" },
  glute_l:      { label: "L Gluteals", clinical: "mm. gluteus medius / superficialis", plain: "Hip muscles — power for standing & climbing" },
  glute_r:      { label: "R Gluteals", clinical: "mm. gluteus medius / superficialis", plain: "Hip muscles — power for standing & climbing" },
  hip_flexor_l: { label: "L Iliopsoas", clinical: "m. iliopsoas", plain: "Hip flexor — brings leg forward in stride" },
  hip_flexor_r: { label: "R Iliopsoas", clinical: "m. iliopsoas", plain: "Hip flexor — brings leg forward in stride" },
  hip_adduct_l: { label: "L Hip Adductors", clinical: "mm. adductores", plain: "Inner thigh muscles — lateral stability" },
  hip_adduct_r: { label: "R Hip Adductors", clinical: "mm. adductores", plain: "Inner thigh muscles — lateral stability" },
  hip_l:        { label: "L Hip Joint", clinical: "articulatio coxae", plain: "Hip ball-and-socket joint" },
  hip_r:        { label: "R Hip Joint", clinical: "articulatio coxae", plain: "Hip ball-and-socket joint" },
  stifle_l:     { label: "L Stifle", clinical: "articulatio genus", plain: "Knee joint — most commonly injured joint in dogs" },
  stifle_r:     { label: "R Stifle", clinical: "articulatio genus", plain: "Knee joint — most commonly injured joint in dogs" },
  ccl:          { label: "Cranial Cruciate Lig.", clinical: "ligamentum cruciatum craniale", plain: "ACL equivalent — stabilises the knee joint" },
  calf_l:       { label: "L Gastrocnemius", clinical: "m. gastrocnemius", plain: "Calf muscle — hock extension & push-off" },
  calf_r:       { label: "R Gastrocnemius", clinical: "m. gastrocnemius", plain: "Calf muscle — hock extension & push-off" },
  hock_l:       { label: "L Hock / Tarsus", clinical: "articulatio tarsi", plain: "Ankle joint — absorbs landing impact" },
  hock_r:       { label: "R Hock / Tarsus", clinical: "articulatio tarsi", plain: "Ankle joint — absorbs landing impact" },
  shoulder_l:   { label: "L Shoulder", clinical: "articulatio humeri", plain: "Shoulder joint — 60% of body weight in stance" },
  shoulder_r:   { label: "R Shoulder", clinical: "articulatio humeri", plain: "Shoulder joint — 60% of body weight in stance" },
  elbow_l:      { label: "L Elbow", clinical: "articulatio cubiti", plain: "Elbow joint — forelimb shock absorber" },
  elbow_r:      { label: "R Elbow", clinical: "articulatio cubiti", plain: "Elbow joint — forelimb shock absorber" },
  tricep_l:     { label: "L Triceps", clinical: "m. triceps brachii", plain: "Back of upper forelimb — elbow extension" },
  tricep_r:     { label: "R Triceps", clinical: "m. triceps brachii", plain: "Back of upper forelimb — elbow extension" },
  spine:        { label: "Spine", clinical: "columna vertebralis", plain: "Backbone — transmits power from hindquarters" },
  core:         { label: "Core", clinical: "mm. epaxiales / hypaxiales", plain: "Back & belly muscles — spinal stability" },
  paraspinal_l: { label: "L Paraspinal", clinical: "mm. epaxiales", plain: "Muscles alongside spine — posture & movement" },
  paraspinal_r: { label: "R Paraspinal", clinical: "mm. epaxiales", plain: "Muscles alongside spine — posture & movement" },
};

// ── Canine lateral SVG anatomy diagram ───────────────────────────────────
// Muscles/joints rendered as SVG paths with IDs matching EXERCISE_MUSCLE_MAP
function CanineSVG({ highlighted, diagnosisStructures, clientMode, onHover, hoveredId }) {
  const getColor = (id) => {
    if (diagnosisStructures.includes(id)) return "#ef4444";
    if (highlighted.primary.includes(id)) return "#14b8a6";      // teal — primary
    if (highlighted.secondary.includes(id)) return "#f59e0b";    // amber — secondary
    return null;
  };
  const getOpacity = (id) => {
    const c = getColor(id);
    if (!c) return 0.18;
    return hoveredId === id ? 0.92 : 0.72;
  };
  const mp = (id, d, label) => {
    const c = getColor(id) || "#64748b";
    const op = getOpacity(id);
    const isActive = getColor(id) !== null;
    return (
      <path key={id} id={id} d={d} fill={c} fillOpacity={op}
        stroke={isActive ? c : "transparent"} strokeWidth={isActive ? 1.5 : 0}
        style={{ cursor: isActive ? "pointer" : "default", transition: "fill-opacity 0.2s" }}
        onMouseEnter={() => isActive && onHover(id)}
        onMouseLeave={() => onHover(null)}>
        <title>{label}</title>
      </path>
    );
  };

  return (
    <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", maxHeight: 220 }}>
      {/* ── Body silhouette ── */}
      <ellipse cx="210" cy="110" rx="155" ry="52" fill="#1e293b" opacity={0.85} />
      {/* Head */}
      <ellipse cx="360" cy="95" rx="32" ry="24" fill="#1e293b" opacity={0.85} />
      <path d="M330 95 Q320 115 310 120 Q315 108 328 100 Z" fill="#1e293b" opacity={0.85} />
      {/* Tail */}
      <path d="M55 105 Q30 85 20 70 Q25 90 42 108 Z" fill="#1e293b" opacity={0.85} />
      {/* Neck */}
      <path d="M328 85 Q340 75 355 78 Q345 90 330 95 Z" fill="#1e293b" opacity={0.85} />

      {/* ── Spine ── */}
      {mp("spine", "M80 100 Q140 88 210 90 Q270 88 320 94", null)}
      <path d="M80 100 Q140 88 210 90 Q270 88 320 94" fill="none" stroke="#475569" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />

      {/* ── Hindlimb muscles ── */}
      {/* Gluteals */}
      {mp("glute_l",  "M95 100 Q115 90 130 95 Q125 115 108 118 Q92 112 95 100", "L Gluteals")}
      {mp("glute_r",  "M88 108 Q105 115 118 120 Q110 132 95 130 Q82 122 88 108", "R Gluteals")}
      {/* Hamstrings */}
      {mp("hamstring_l", "M125 95 Q150 90 160 98 Q155 118 138 122 Q122 118 125 95", "L Hamstrings")}
      {mp("hamstring_r", "M118 122 Q140 125 150 130 Q142 148 125 148 Q110 142 118 122", "R Hamstrings")}
      {/* Quadriceps */}
      {mp("quad_l",    "M155 95 Q178 88 188 96 Q182 118 165 122 Q150 116 155 95", "L Quadriceps")}
      {mp("quad_r",    "M148 122 Q168 128 175 136 Q165 155 150 155 Q135 148 148 122", "R Quadriceps")}
      {/* Hip flexors */}
      {mp("hip_flexor_l", "M145 85 Q162 78 172 86 Q167 98 152 100 Q140 95 145 85", "L Iliopsoas")}
      {mp("hip_flexor_r", "M138 100 Q155 105 162 112 Q152 125 138 124 Q126 118 138 100", "R Iliopsoas")}
      {/* Hip adductors */}
      {mp("hip_adduct_l", "M152 108 Q165 112 168 122 Q158 130 148 128 Q142 118 152 108", "L Hip Adductors")}
      {mp("hip_adduct_r", "M145 128 Q158 133 160 143 Q150 150 140 148 Q133 140 145 128", "R Hip Adductors")}

      {/* ── Hip joints ── */}
      {mp("hip_l",  "M102 108 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "L Hip Joint")}
      {mp("hip_r",  "M96 122 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "R Hip Joint")}

      {/* ── Stifle joints ── */}
      {mp("stifle_l", "M185 108 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0", "L Stifle (Knee)")}
      {mp("stifle_r", "M178 132 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0", "R Stifle (Knee)")}
      {/* CCL */}
      {mp("ccl", "M183 102 L183 118 Q185 115 187 118 L187 102 Z", "Cranial Cruciate Ligament")}

      {/* ── Hock / calf ── */}
      {mp("calf_l",  "M188 120 Q200 115 205 124 Q200 140 190 142 Q182 136 188 120", "L Gastrocnemius")}
      {mp("calf_r",  "M182 144 Q192 140 196 150 Q190 165 180 165 Q172 158 182 144", "R Gastrocnemius")}
      {mp("hock_l",  "M205 132 m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0", "L Hock")}
      {mp("hock_r",  "M195 162 m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0", "R Hock")}

      {/* ── Forelimb ── */}
      {mp("shoulder_l", "M298 84 m-12,0 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0", "L Shoulder")}
      {mp("shoulder_r", "M290 104 m-12,0 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0", "R Shoulder")}
      {mp("tricep_l",   "M295 96 Q310 92 318 100 Q312 118 298 120 Q285 114 295 96", "L Triceps")}
      {mp("tricep_r",   "M285 116 Q300 115 308 124 Q300 140 285 140 Q272 132 285 116", "R Triceps")}
      {mp("elbow_l",    "M320 108 m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0", "L Elbow")}
      {mp("elbow_r",    "M310 132 m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0", "R Elbow")}

      {/* ── Core / paraspinals ── */}
      {mp("core",        "M140 95 Q210 88 270 93 Q268 108 210 112 Q145 110 140 95", "Core Muscles")}
      {mp("paraspinal_l","M95 92 Q165 82 270 87 Q268 94 165 98 Q92 100 95 92", "L Paraspinal")}
      {mp("paraspinal_r","M95 118 Q165 114 270 115 Q268 122 165 126 Q92 122 95 118", "R Paraspinal")}

      {/* ── Skeletal outlines (always visible, subtle) ── */}
      <ellipse cx="210" cy="110" rx="155" ry="52" fill="none" stroke="#334155" strokeWidth={1} opacity={0.5} />
      <ellipse cx="360" cy="95" rx="32" ry="24" fill="none" stroke="#334155" strokeWidth={1} opacity={0.5} />
    </svg>
  );
}

// ── Feline SVG (simplified proportions) ──────────────────────────────────
function FelineSVG({ highlighted, diagnosisStructures, clientMode, onHover, hoveredId }) {
  const getColor = (id) => {
    if (diagnosisStructures.includes(id)) return "#ef4444";
    if (highlighted.primary.includes(id)) return "#14b8a6";
    if (highlighted.secondary.includes(id)) return "#f59e0b";
    return null;
  };
  const getOpacity = (id) => (!getColor(id) ? 0.18 : hoveredId === id ? 0.92 : 0.72);
  const mp = (id, d, label) => {
    const c = getColor(id) || "#64748b";
    const op = getOpacity(id);
    const isActive = getColor(id) !== null;
    return (
      <path key={id} id={id} d={d} fill={c} fillOpacity={op}
        stroke={isActive ? c : "transparent"} strokeWidth={isActive ? 1.5 : 0}
        style={{ cursor: isActive ? "pointer" : "default", transition: "fill-opacity 0.2s" }}
        onMouseEnter={() => isActive && onHover(id)}
        onMouseLeave={() => onHover(null)}>
        <title>{label}</title>
      </path>
    );
  };
  return (
    <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", maxHeight: 200 }}>
      {/* Body — cats are longer and lower than dogs */}
      <ellipse cx="210" cy="108" rx="148" ry="44" fill="#1e293b" opacity={0.85} />
      {/* Head — rounder */}
      <ellipse cx="358" cy="90" rx="28" ry="26" fill="#1e293b" opacity={0.85} />
      {/* Ears */}
      <polygon points="342,68 348,50 356,68" fill="#1e293b" opacity={0.85} />
      <polygon points="360,68 366,50 372,68" fill="#1e293b" opacity={0.85} />
      {/* Tail — long and curved */}
      <path d="M62 110 Q40 98 28 80 Q22 65 35 62 Q38 75 45 82 Q55 95 65 108 Z" fill="#1e293b" opacity={0.85} />
      {/* Neck */}
      <path d="M332 88 Q342 76 355 80 Q348 92 335 96 Z" fill="#1e293b" opacity={0.85} />

      {/* Spine */}
      {mp("spine", "M82 98 Q150 86 210 88 Q265 86 318 92", null)}
      <path d="M82 98 Q150 86 210 88 Q265 86 318 92" fill="none" stroke="#475569" strokeWidth={2} strokeLinecap="round" opacity={0.6} />

      {/* Hindlimbs */}
      {mp("glute_l",      "M97 96 Q116 88 128 94 Q124 112 108 115 Q94 108 97 96", "L Gluteals")}
      {mp("glute_r",      "M90 114 Q106 118 116 125 Q108 138 94 136 Q82 128 90 114", "R Gluteals")}
      {mp("hamstring_l",  "M124 94 Q144 89 153 98 Q148 115 133 118 Q119 112 124 94", "L Hamstrings")}
      {mp("hamstring_r",  "M116 118 Q135 122 143 130 Q136 146 122 144 Q110 138 116 118", "R Hamstrings")}
      {mp("quad_l",       "M150 94 Q170 88 178 97 Q172 116 157 119 Q142 112 150 94", "L Quadriceps")}
      {mp("quad_r",       "M143 118 Q162 124 168 134 Q158 150 145 148 Q133 142 143 118", "R Quadriceps")}
      {mp("hip_flexor_l", "M138 84 Q156 78 165 86 Q159 98 145 100 Q134 93 138 84", "L Iliopsoas")}
      {mp("hip_flexor_r", "M130 100 Q148 106 155 115 Q146 128 133 126 Q122 118 130 100", "R Iliopsoas")}
      {mp("hip_adduct_l", "M146 106 Q158 112 160 122 Q150 130 140 128 Q134 118 146 106", "L Hip Adductors")}
      {mp("hip_adduct_r", "M138 128 Q150 134 152 144 Q143 152 133 149 Q126 140 138 128", "R Hip Adductors")}

      {/* Joints */}
      {mp("hip_l",    "M102 106 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "L Hip")}
      {mp("hip_r",    "M95 120 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "R Hip")}
      {mp("stifle_l", "M178 108 m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0", "L Stifle")}
      {mp("stifle_r", "M172 132 m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0", "R Stifle")}
      {mp("ccl",      "M176 102 L176 118 Q178 115 180 118 L180 102 Z", "CCL")}
      {mp("calf_l",   "M180 120 Q192 115 197 124 Q191 138 182 140 Q174 133 180 120", "L Gastrocnemius")}
      {mp("calf_r",   "M174 142 Q184 138 188 148 Q182 162 173 161 Q165 154 174 142", "R Gastrocnemius")}
      {mp("hock_l",   "M196 131 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0", "L Hock")}
      {mp("hock_r",   "M188 159 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0", "R Hock")}

      {/* Forelimbs */}
      {mp("shoulder_l", "M295 82 m-11,0 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0", "L Shoulder")}
      {mp("shoulder_r", "M288 100 m-11,0 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0", "R Shoulder")}
      {mp("tricep_l",   "M292 94 Q306 90 313 99 Q306 115 294 117 Q282 110 292 94", "L Triceps")}
      {mp("tricep_r",   "M283 114 Q296 114 303 124 Q295 138 282 136 Q271 128 283 114", "R Triceps")}
      {mp("elbow_l",    "M314 106 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "L Elbow")}
      {mp("elbow_r",    "M304 130 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "R Elbow")}

      {/* Core */}
      {mp("core",         "M138 93 Q210 86 265 91 Q263 106 210 110 Q140 108 138 93", "Core")}
      {mp("paraspinal_l", "M94 90 Q165 80 265 85 Q263 92 165 96 Q92 98 94 90", "L Paraspinal")}
      {mp("paraspinal_r", "M94 116 Q165 114 265 115 Q263 122 165 124 Q92 120 94 116", "R Paraspinal")}

      <ellipse cx="210" cy="108" rx="148" ry="44" fill="none" stroke="#334155" strokeWidth={1} opacity={0.5} />
      <ellipse cx="358" cy="90" rx="28" ry="26" fill="none" stroke="#334155" strokeWidth={1} opacity={0.5} />
    </svg>
  );
}

// ── Main AnatomyViewer component ─────────────────────────────────────────
export default function AnatomyViewer({ exerciseCode, diagnosis, species = "Canine", compact = false }) {
  const [clientMode, setClientMode] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [visible, setVisible] = useState(true);

  const isFeline = species === "Feline";

  const exerciseData = useMemo(() => {
    const code = (exerciseCode || "").toUpperCase().replace(/[- ]/g, "_");
    return EXERCISE_MUSCLE_MAP[code] || { primary: [], secondary: [] };
  }, [exerciseCode]);

  const diagnosisStructures = useMemo(() => {
    const d = DIAGNOSIS_STRUCTURE_MAP[diagnosis] || DIAGNOSIS_STRUCTURE_MAP[diagnosis?.toUpperCase()] || null;
    return d ? d.structures : [];
  }, [diagnosis]);

  const diagnosisInfo = DIAGNOSIS_STRUCTURE_MAP[diagnosis] || null;
  const hoveredInfo = hoveredId ? MUSCLE_INFO[hoveredId] : null;

  const allHighlighted = [...exerciseData.primary, ...exerciseData.secondary, ...diagnosisStructures];
  const hasHighlights = allHighlighted.length > 0;

  if (!visible) return (
    <button onClick={() => setVisible(true)}
      style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8,
        background: C.surface, border:`1px solid ${C.border}`, color: C.textLight,
        fontSize:12, cursor:"pointer", marginBottom:8 }}>
      <FiLayers size={13} /> Show Anatomy Viewer
    </button>
  );

  return (
    <div style={{ background: C.navy, border:`1px solid ${C.border}`, borderRadius:12,
      padding: compact ? "12px 14px" : "16px 18px", marginBottom:12, position:"relative" }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {isFeline ? <TbCat size={16} style={{color:"#a78bfa"}} /> : <TbDog size={16} style={{color:"var(--k9-teal)"}} />}
          <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", letterSpacing:0.3 }}>
            Anatomy Viewer
          </span>
          {exerciseCode && (
            <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20,
              background:"var(--k9-teal-dark)", color:"var(--k9-teal)", fontWeight:600 }}>
              {(EXERCISE_MUSCLE_MAP[(exerciseCode||"").toUpperCase().replace(/[- ]/g,"_")]
                ? exerciseCode.replace(/_/g," ") : exerciseCode)}
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => setClientMode(m => !m)}
            title={clientMode ? "Clinical labels" : "Client-friendly labels"}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:6,
              background: clientMode ? "rgba(20,184,166,0.15)" : C.surface,
              border:`1px solid ${clientMode ? "var(--k9-teal)" : C.border}`,
              color: clientMode ? "var(--k9-teal)" : C.textLight, fontSize:11, cursor:"pointer" }}>
            <FiEye size={12} />
            {clientMode ? "Owner View" : "Clinical View"}
          </button>
          <button onClick={() => setVisible(false)} title="Hide viewer"
            style={{ padding:"4px 8px", borderRadius:6, background: C.surface,
              border:`1px solid ${C.border}`, color: C.textLight, fontSize:11, cursor:"pointer" }}>
            <FiX size={12} />
          </button>
        </div>
      </div>

      {/* ── Diagnosis banner ── */}
      {diagnosisInfo && (
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:6,
          background: diagnosisInfo.color + "20", border:`1px solid ${diagnosisInfo.color}`,
          marginBottom:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background: diagnosisInfo.color, flexShrink:0 }} />
          <span style={{ fontSize:11, color: diagnosisInfo.color, fontWeight:600 }}>{diagnosisInfo.label}</span>
        </div>
      )}

      {/* ── SVG diagram ── */}
      <div style={{ position:"relative", background:"#0f172a", borderRadius:8, padding:"8px 4px",
        border:`1px solid ${C.border}` }}>
        {isFeline
          ? <FelineSVG highlighted={exerciseData} diagnosisStructures={diagnosisStructures}
              clientMode={clientMode} onHover={setHoveredId} hoveredId={hoveredId} />
          : <CanineSVG highlighted={exerciseData} diagnosisStructures={diagnosisStructures}
              clientMode={clientMode} onHover={setHoveredId} hoveredId={hoveredId} />
        }
        {/* Hovered label */}
        {hoveredInfo && (
          <div style={{ position:"absolute", bottom:8, left:8, right:8, padding:"6px 10px",
            background:"rgba(15,23,42,0.95)", borderRadius:6, border:`1px solid var(--k9-teal)`,
            pointerEvents:"none" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--k9-teal)" }}>{hoveredInfo.label}</div>
            <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>
              {clientMode ? hoveredInfo.plain : hoveredInfo.clinical}
            </div>
          </div>
        )}
        {!hasHighlights && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", pointerEvents:"none" }}>
            <span style={{ fontSize:11, color:"#475569" }}>Select an exercise to highlight targeted muscles</span>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div style={{ display:"flex", gap:12, marginTop:8, flexWrap:"wrap" }}>
        {exerciseData.primary.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:"#14b8a6", flexShrink:0 }} />
            <span style={{ fontSize:10, color:"#94a3b8" }}>
              Primary: {exerciseData.primary.map(id => MUSCLE_INFO[id]?.label || id).join(", ")}
            </span>
          </div>
        )}
        {exerciseData.secondary.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:"#f59e0b", flexShrink:0 }} />
            <span style={{ fontSize:10, color:"#94a3b8" }}>
              Secondary: {exerciseData.secondary.map(id => MUSCLE_INFO[id]?.label || id).join(", ")}
            </span>
          </div>
        )}
        {diagnosisStructures.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:"#ef4444", flexShrink:0 }} />
            <span style={{ fontSize:10, color:"#94a3b8" }}>Affected / surgical site</span>
          </div>
        )}
      </div>
    </div>
  );
}
