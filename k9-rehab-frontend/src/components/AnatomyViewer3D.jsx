// ============================================================================
// ANATOMY VIEWER 3D — Three.js Rotatable Canine/Feline Anatomy
// ============================================================================
// Stylized 3D schematic using Three.js primitives.
// Anatomically proportioned — not photorealistic, but clinically readable.
// Drag to rotate | Scroll to zoom | Click muscle to inspect
// Exercise-reactive: highlights target muscles in teal/amber
// Diagnosis-reactive: surgical site in red
// Species-aware: canine vs feline proportions
// ============================================================================

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { FiEye, FiLayers, FiX, FiRotateCw, FiZoomIn } from "react-icons/fi";
import { TbDog, TbCat } from "react-icons/tb";
import C from "../constants/colors";

// ── Exercise → Muscle ID mapping ─────────────────────────────────────────
const EXERCISE_MUSCLE_MAP = {
  SIT_STAND:          { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r","hock_l","hock_r"] },
  DOWN_STAND:         { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hip_flexor_l","hip_flexor_r"] },
  HILL_CLIMB:         { primary: ["glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["quad_l","quad_r","calf_l","calf_r"] },
  BACKWARD_HILL:      { primary: ["quad_l","quad_r","calf_l","calf_r"], secondary: ["hip_flexor_l","hip_flexor_r"] },
  STAIR_CLIMB:        { primary: ["quad_l","quad_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["calf_l","calf_r"] },
  SLOW_WALK:          { primary: ["hip_flexor_l","hip_flexor_r","quad_l","quad_r"], secondary: ["hamstring_l","hamstring_r","shoulder_l","shoulder_r"] },
  SIDE_STEP:          { primary: ["glute_l","glute_r","hip_adduct_l","hip_adduct_r"], secondary: ["quad_l","quad_r"] },
  BACKING_UP:         { primary: ["hip_flexor_l","hip_flexor_r","quad_l","quad_r"], secondary: ["hamstring_l","hamstring_r"] },
  FIGURE_8:           { primary: ["hip_flexor_l","hip_flexor_r","glute_l","glute_r"], secondary: ["hip_adduct_l","hip_adduct_r"] },
  PROM_STIFLE:        { primary: ["stifle_l","stifle_r","ccl"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  PROM_HIP:           { primary: ["hip_l","hip_r"], secondary: ["glute_l","glute_r","hip_flexor_l","hip_flexor_r"] },
  WEIGHT_SHIFT:       { primary: ["quad_l","quad_r","shoulder_l","shoulder_r"], secondary: ["hip_adduct_l","hip_adduct_r"] },
  THREE_LEG_STAND:    { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r"] },
  WHEELBARROW:        { primary: ["shoulder_l","shoulder_r","tricep_l","tricep_r"], secondary: ["spine","core"] },
  WOBBLE_BOARD:       { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r"], secondary: ["spine","core"] },
  CAVALETTI:          { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r"] },
  UWT_WALK:           { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["stifle_l","stifle_r"] },
  ILIO_STRETCH:       { primary: ["hip_flexor_l","hip_flexor_r"], secondary: ["hip_l","hip_r","spine"] },
  MASSAGE_THERA:      { primary: ["paraspinal_l","paraspinal_r"], secondary: ["glute_l","glute_r","hamstring_l","hamstring_r"] },
  NMES_QUAD:          { primary: ["quad_l","quad_r"], secondary: ["stifle_l","stifle_r"] },
  FELINE_PROM:        { primary: ["stifle_l","stifle_r","hip_l","hip_r"], secondary: ["quad_l","quad_r"] },
  FELINE_WAND_AROM:   { primary: ["shoulder_l","shoulder_r","hip_flexor_l","hip_flexor_r"], secondary: ["elbow_l","elbow_r","stifle_l","stifle_r"] },
  FELINE_TREAT_SHIFT: { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hip_adduct_l","hip_adduct_r"] },
  FELINE_CAVALETTI:   { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r"] },
  FELINE_SIT_STAND:   { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r"] },
  FELINE_STAIR_WAND:  { primary: ["glute_l","glute_r","quad_l","quad_r","hamstring_l","hamstring_r"], secondary: ["calf_l","calf_r"] },
  FELINE_THREE_LEG:   { primary: ["shoulder_l","shoulder_r","quad_l","quad_r"], secondary: ["hip_adduct_l","hip_adduct_r"] },
  FELINE_WOBBLE:      { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","shoulder_l","shoulder_r"], secondary: ["spine","core"] },

  // ── ACTIVE ASSISTED ──
  STAND_TALL:         { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["paraspinal_l","paraspinal_r","core"] },
  CURB_WALK:          { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r"] },
  SLOW_TROT:          { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["shoulder_l","shoulder_r","hip_flexor_l","hip_flexor_r"] },
  STAIR_DESCEND:      { primary: ["quad_l","quad_r","calf_l","calf_r"], secondary: ["hamstring_l","hamstring_r","stifle_l","stifle_r"] },
  DIAGONAL_WALK:      { primary: ["hip_adduct_l","hip_adduct_r","shoulder_l","shoulder_r"], secondary: ["core","spine"] },
  JOG_LEASH:          { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["calf_l","calf_r","hip_flexor_l","hip_flexor_r"] },
  LAND_TREADMILL:     { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["glute_l","glute_r","calf_l","calf_r"] },
  FETCH_CONTROLLED:   { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r"] },
  WEIGHT_SHIFT_CC:    { primary: ["quad_l","quad_r","glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["hip_adduct_l","hip_adduct_r","core"] },
  ILIO_ECCENTRIC:     { primary: ["hip_flexor_l","hip_flexor_r"], secondary: ["quad_l","quad_r","calf_l","calf_r"] },
  BICEPS_ACTIVE:      { primary: ["elbow_l","elbow_r","shoulder_l","shoulder_r"], secondary: ["tricep_l","tricep_r"] },

  // ── AQUATIC / HYDROTHERAPY ──
  UNDERWATER_TREAD:   { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["glute_l","glute_r","core"] },
  POOL_SWIM:          { primary: ["glute_l","glute_r","shoulder_l","shoulder_r","spine","core"], secondary: ["hamstring_l","hamstring_r","quad_l","quad_r"] },
  WATER_WALKING:      { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["stifle_l","stifle_r","hock_l","hock_r"] },
  WATER_RETRIEVE:     { primary: ["glute_l","glute_r","shoulder_l","shoulder_r","hamstring_l","hamstring_r"], secondary: ["quad_l","quad_r"] },
  AQUA_JOG:           { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["calf_l","calf_r","hip_flexor_l","hip_flexor_r"] },
  UWTT_FORWARD:       { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["stifle_l","stifle_r","hock_l","hock_r"] },
  UWTT_BACKWARD:      { primary: ["quad_l","quad_r","hip_flexor_l","hip_flexor_r"], secondary: ["hamstring_l","hamstring_r","calf_l","calf_r"] },
  UWTT_LATERAL:       { primary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  POOL_TREADING:      { primary: ["glute_l","glute_r","shoulder_l","shoulder_r","core"], secondary: ["hamstring_l","hamstring_r","quad_l","quad_r"] },
  HYDRO_JETS:         { primary: ["paraspinal_l","paraspinal_r","core"], secondary: ["glute_l","glute_r","quad_l","quad_r"] },
  AQUA_CAVALETTI:     { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r"] },
  AQUA_WEAVE:         { primary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r"], secondary: ["core","shoulder_l","shoulder_r"] },
  AQUA_FETCH:         { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r"] },
  HYDRO_BALANCE:      { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","core"], secondary: ["shoulder_l","shoulder_r","spine"] },
  AQUA_STAND:         { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["calf_l","calf_r","core"] },
  AQUA_STEPS:         { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["stifle_l","stifle_r","hock_l","hock_r"] },
  AQUA_CIRCLES:       { primary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r"], secondary: ["core","spine"] },
  AQUA_PLANK:         { primary: ["core","paraspinal_l","paraspinal_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  UWTM_PHASE1:        { primary: ["quad_l","quad_r","hip_flexor_l","hip_flexor_r"], secondary: ["stifle_l","stifle_r"] },
  UWTM_PHASE2:        { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["glute_l","glute_r","stifle_l","stifle_r"] },
  UWTM_PHASE3:        { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["calf_l","calf_r","hip_flexor_l","hip_flexor_r"] },
  UWTM_PHASE4:        { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["calf_l","calf_r","core"] },
  UWTM_NEURO:         { primary: ["quad_l","quad_r","hamstring_l","hamstring_r"], secondary: ["spine","core","paraspinal_l","paraspinal_r"] },
  UWTM_OBESITY:       { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["glute_l","glute_r","core"] },
  UWTM_GERIATRIC:     { primary: ["quad_l","quad_r","hip_flexor_l","hip_flexor_r"], secondary: ["glute_l","glute_r","stifle_l","stifle_r"] },
  UWTM_INCLINE:       { primary: ["glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["quad_l","quad_r","calf_l","calf_r"] },
  UWTM_POST_TPLO:     { primary: ["quad_l","quad_r","stifle_l","stifle_r"], secondary: ["hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"] },
  POOL_SUPPORTED:     { primary: ["glute_l","glute_r","shoulder_l","shoulder_r","core"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  POOL_THERAPEUTIC:   { primary: ["glute_l","glute_r","shoulder_l","shoulder_r","spine","core"], secondary: ["hamstring_l","hamstring_r","quad_l","quad_r"] },
  UWTM_HIP_DJD:       { primary: ["glute_l","glute_r","hip_l","hip_r"], secondary: ["quad_l","quad_r","hip_adduct_l","hip_adduct_r"] },
  FELINE_UWTM:        { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["stifle_l","stifle_r"] },

  // ── GERIATRIC CARE ──
  SENIOR_BALANCE:     { primary: ["quad_l","quad_r","hip_adduct_l","hip_adduct_r","core"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  RAISED_FEED:        { primary: ["paraspinal_l","paraspinal_r","core"], secondary: ["shoulder_l","shoulder_r"] },
  RAMP_TRAINING:      { primary: ["quad_l","quad_r","glute_l","glute_r","calf_l","calf_r"], secondary: ["hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"] },
  BEDDING_EXERCISE:   { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  SENIOR_STAIRS:      { primary: ["quad_l","quad_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["calf_l","calf_r","shoulder_l","shoulder_r"] },
  TUMMY_TIME:         { primary: ["paraspinal_l","paraspinal_r","core","glute_l","glute_r"], secondary: ["shoulder_l","shoulder_r","quad_l","quad_r"] },
  TAIL_LIFTS:         { primary: ["paraspinal_l","paraspinal_r","glute_l","glute_r","spine"], secondary: ["hamstring_l","hamstring_r","core"] },
  COGNITIVE_ACTIVITY: { primary: [], secondary: [] },
  NIGHTLIGHT:         { primary: [], secondary: [] },

  // ── FUNCTIONAL TRAINING ──
  CAR_ENTRY:          { primary: ["quad_l","quad_r","glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["hamstring_l","hamstring_r","elbow_l","elbow_r"] },
  COUCH_ON_OFF:       { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["shoulder_l","shoulder_r","calf_l","calf_r"] },
  DOOR_THRESHOLD:     { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r"] },
  PLAY_BOW:           { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","tricep_l","tricep_r"], secondary: ["core","glute_l","glute_r"] },
  GREETING_SIT:       { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  SPORT_WEAVE:        { primary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["core","quad_l","quad_r"] },
  SPORT_JUMP_PREP:    { primary: ["quad_l","quad_r","glute_l","glute_r","calf_l","calf_r"], secondary: ["hamstring_l","hamstring_r","shoulder_l","shoulder_r"] },

  // ── PEDIATRIC ──
  PUPPY_DEV_GYM:      { primary: ["hip_adduct_l","hip_adduct_r","shoulder_l","shoulder_r","core"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  ANGULAR_LIMB:       { primary: ["elbow_l","elbow_r","stifle_l","stifle_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  NEONATAL_CARE:      { primary: [], secondary: [] },
  SWIMMER_PUPPY:      { primary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  CONGENITAL_HD:      { primary: ["glute_l","glute_r","hip_l","hip_r","hip_adduct_l","hip_adduct_r"], secondary: ["quad_l","quad_r"] },
  LUXATING_PATELLA_JUV: { primary: ["quad_l","quad_r","stifle_l","stifle_r","hip_adduct_l","hip_adduct_r"], secondary: ["glute_l","glute_r"] },
  OCD_JUVENILE:       { primary: ["shoulder_l","shoulder_r","stifle_l","stifle_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  PREMATURE_CLOSURE:  { primary: ["elbow_l","elbow_r","stifle_l","stifle_r"], secondary: ["shoulder_l","shoulder_r","quad_l","quad_r"] },
  JUVENILE_WOBBLER:   { primary: ["paraspinal_l","paraspinal_r","spine","core"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  HYPERTROPHIC_OSTEODYSTROPHY: { primary: ["elbow_l","elbow_r","stifle_l","stifle_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },

  // ── BREED SPECIFIC ──
  DACHSHUND_BACK:     { primary: ["paraspinal_l","paraspinal_r","spine","core"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  BULLDOG_RESPIRATORY:{ primary: ["core","paraspinal_l","paraspinal_r"], secondary: ["shoulder_l","shoulder_r"] },
  GIANT_BREED:        { primary: ["quad_l","quad_r","glute_l","glute_r","elbow_l","elbow_r"], secondary: ["hip_adduct_l","hip_adduct_r","shoulder_l","shoulder_r"] },
  HERDING_HIPS:       { primary: ["glute_l","glute_r","hip_l","hip_r","hip_adduct_l","hip_adduct_r"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  SPORTING_SHOULDER:  { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","tricep_l","tricep_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  TOY_BREED:          { primary: ["quad_l","quad_r","stifle_l","stifle_r","elbow_l","elbow_r"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  SIGHTHOUND_SPECIAL: { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","spine"], secondary: ["quad_l","quad_r","paraspinal_l","paraspinal_r"] },

  // ── PALLIATIVE CARE ──
  HOSPICE_MOBILITY:   { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  PALLIATIVE_OSTEOARTHRITIS: { primary: ["stifle_l","stifle_r","hip_l","hip_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  NEOPLASIA_COMFORT:  { primary: [], secondary: [] },
  ADVANCED_HEART_DISEASE: { primary: [], secondary: [] },
  CHRONIC_KIDNEY:     { primary: [], secondary: [] },
  COGNITIVE_DYSFUNCTION: { primary: [], secondary: [] },
  MEGAESOPHAGUS_PALLIATE: { primary: ["paraspinal_l","paraspinal_r","core"], secondary: ["shoulder_l","shoulder_r"] },
  VESTIBULAR_GERIATRIC: { primary: ["core","paraspinal_l","paraspinal_r","spine"], secondary: ["shoulder_l","shoulder_r","quad_l","quad_r"] },

  // ── THERAPEUTIC MODALITIES ──
  TENS_THERAPY:       { primary: ["paraspinal_l","paraspinal_r","quad_l","quad_r"], secondary: ["glute_l","glute_r","hamstring_l","hamstring_r"] },
  US_PULSED:          { primary: ["stifle_l","stifle_r","shoulder_l","shoulder_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r"] },
  US_CONTINUOUS:      { primary: ["stifle_l","stifle_r","hip_l","hip_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  LASER_IV:           { primary: ["paraspinal_l","paraspinal_r","stifle_l","stifle_r","hip_l","hip_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  PEMF_THERAPY:       { primary: ["stifle_l","stifle_r","hip_l","hip_r","spine"], secondary: ["quad_l","quad_r","paraspinal_l","paraspinal_r"] },
  HYDRO_WHIRL:        { primary: ["paraspinal_l","paraspinal_r","glute_l","glute_r","quad_l","quad_r"], secondary: ["hamstring_l","hamstring_r","core"] },
  ICE_MASSAGE:        { primary: ["stifle_l","stifle_r","quad_l","quad_r"], secondary: ["hamstring_l","hamstring_r"] },
  CONTRAST_BATH:      { primary: ["hock_l","hock_r","stifle_l","stifle_r","elbow_l","elbow_r"], secondary: ["calf_l","calf_r","quad_l","quad_r"] },
  COMPRESSION_TX:     { primary: ["stifle_l","stifle_r","hock_l","hock_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","calf_l","calf_r"] },
  FELINE_PBMT:        { primary: ["paraspinal_l","paraspinal_r","stifle_l","stifle_r","hip_l","hip_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  FELINE_TENS:        { primary: ["paraspinal_l","paraspinal_r","quad_l","quad_r"], secondary: ["glute_l","glute_r","hamstring_l","hamstring_r"] },
  FELINE_THERMAL:     { primary: ["paraspinal_l","paraspinal_r","hip_l","hip_r"], secondary: ["glute_l","glute_r","stifle_l","stifle_r"] },
  FELINE_ENVIRON_MOD: { primary: [], secondary: [] },

  // ── SPORT CONDITIONING ──
  AGILITY_PREP:       { primary: ["quad_l","quad_r","glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["hip_flexor_l","hip_flexor_r","core"] },
  JUMP_GRIDS:         { primary: ["quad_l","quad_r","glute_l","glute_r","calf_l","calf_r"], secondary: ["hamstring_l","hamstring_r","shoulder_l","shoulder_r"] },
  WEAVE_CONDITIONING: { primary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["core","quad_l","quad_r"] },
  CONTACT_STRENGTH:   { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","quad_l","quad_r"], secondary: ["glute_l","glute_r","core"] },
  HERDING_FIT:        { primary: ["quad_l","quad_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["core","hip_adduct_l","hip_adduct_r"] },
  DOCK_DIVING:        { primary: ["glute_l","glute_r","quad_l","quad_r","shoulder_l","shoulder_r"], secondary: ["hamstring_l","hamstring_r","calf_l","calf_r"] },
  FLYBALL_PREP:       { primary: ["quad_l","quad_r","shoulder_l","shoulder_r","glute_l","glute_r"], secondary: ["calf_l","calf_r","hamstring_l","hamstring_r"] },
  FIELD_TRIAL:        { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","core"] },
  TRACKING_FIT:       { primary: ["paraspinal_l","paraspinal_r","hip_flexor_l","hip_flexor_r","core"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  DISC_DOG:           { primary: ["shoulder_l","shoulder_r","glute_l","glute_r","quad_l","quad_r"], secondary: ["core","calf_l","calf_r"] },
  LURE_COURSE:        { primary: ["quad_l","quad_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["hip_flexor_l","hip_flexor_r","calf_l","calf_r"] },
  WEIGHT_PULL:        { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r"], secondary: ["paraspinal_l","paraspinal_r","core","quad_l","quad_r"] },
  BIKEJOR:            { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","paraspinal_l","paraspinal_r"] },
  DOCK_RETRIEVE:      { primary: ["glute_l","glute_r","shoulder_l","shoulder_r","hamstring_l","hamstring_r"], secondary: ["quad_l","quad_r","calf_l","calf_r"] },
  BARN_HUNT:          { primary: ["hip_flexor_l","hip_flexor_r","paraspinal_l","paraspinal_r","core"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  SKIJOR:             { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r","core"], secondary: ["quad_l","quad_r","paraspinal_l","paraspinal_r"] },
  RALLY_FIT:          { primary: ["hip_flexor_l","hip_flexor_r","glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["core","quad_l","quad_r"] },
  CONFORMATION:       { primary: ["quad_l","quad_r","glute_l","glute_r","core"], secondary: ["paraspinal_l","paraspinal_r","shoulder_l","shoulder_r"] },
  DETECTION:          { primary: ["paraspinal_l","paraspinal_r","hip_flexor_l","hip_flexor_r","shoulder_l","shoulder_r"], secondary: ["core","glute_l","glute_r"] },
  TREIBBALL:          { primary: ["shoulder_l","shoulder_r","glute_l","glute_r","hip_flexor_l","hip_flexor_r"], secondary: ["core","quad_l","quad_r"] },

  // ── NEUROLOGICAL REHAB ──
  NEURO_STIM:         { primary: ["quad_l","quad_r","paraspinal_l","paraspinal_r"], secondary: ["glute_l","glute_r","hamstring_l","hamstring_r"] },
  ASSISTED_STANDING:  { primary: ["quad_l","quad_r","glute_l","glute_r","core"], secondary: ["paraspinal_l","paraspinal_r","shoulder_l","shoulder_r"] },
  CART_WALKING:       { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","core"], secondary: ["paraspinal_l","paraspinal_r","glute_l","glute_r"] },
  STEP_OVER:          { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  DANCE_THERAPY:      { primary: ["hip_flexor_l","hip_flexor_r","shoulder_l","shoulder_r","core"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  NEURO_MASSAGE:      { primary: ["paraspinal_l","paraspinal_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r","quad_l","quad_r"] },
  LIMB_PLACEMENT:     { primary: ["quad_l","quad_r","hip_flexor_l","hip_flexor_r","shoulder_l","shoulder_r"], secondary: ["stifle_l","stifle_r","elbow_l","elbow_r"] },
  TAIL_WAGS:          { primary: ["paraspinal_l","paraspinal_r","spine","core"], secondary: ["glute_l","glute_r"] },
  NEURO_BALANCE:      { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","core"], secondary: ["paraspinal_l","paraspinal_r","shoulder_l","shoulder_r"] },
  BICYCLING:          { primary: ["quad_l","quad_r","hip_flexor_l","hip_flexor_r","hamstring_l","hamstring_r"], secondary: ["stifle_l","stifle_r","hip_l","hip_r"] },
  REFLEX_TESTING:     { primary: ["stifle_l","stifle_r","spine"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  AQUATIC_NEURO:      { primary: ["quad_l","quad_r","paraspinal_l","paraspinal_r","core"], secondary: ["glute_l","glute_r","hamstring_l","hamstring_r"] },
  POSITIONAL_ROTATION:{ primary: ["paraspinal_l","paraspinal_r","core","glute_l","glute_r"], secondary: ["shoulder_l","shoulder_r","hip_adduct_l","hip_adduct_r"] },
  CORE_CRAWL:         { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","hip_flexor_l","hip_flexor_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  FELINE_STAND_ROLL:  { primary: ["core","paraspinal_l","paraspinal_r","glute_l","glute_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },

  // ── PASSIVE THERAPY ──
  COLD_THERAPY:       { primary: ["stifle_l","stifle_r"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  HEAT_THERAPY:       { primary: ["paraspinal_l","paraspinal_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"] },
  STRETCH_QUAD:       { primary: ["quad_l","quad_r","stifle_l","stifle_r"], secondary: ["hip_flexor_l","hip_flexor_r"] },
  STRETCH_HAMS:       { primary: ["hamstring_l","hamstring_r","hip_l","hip_r"], secondary: ["glute_l","glute_r"] },
  EFFLEURAGE:         { primary: ["paraspinal_l","paraspinal_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["quad_l","quad_r","core"] },
  PROM_STIFLE_SPEC:   { primary: ["stifle_l","stifle_r","ccl"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  STRETCH_ILIO:       { primary: ["hip_flexor_l","hip_flexor_r"], secondary: ["hip_l","hip_r","spine"] },
  BICEPS_PROM:        { primary: ["elbow_l","elbow_r","shoulder_l","shoulder_r"], secondary: ["tricep_l","tricep_r"] },

  // ── MANUAL THERAPY ──
  JOINT_MOB_G1:       { primary: ["stifle_l","stifle_r","hip_l","hip_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  JOINT_MOB_G2:       { primary: ["stifle_l","stifle_r","hip_l","hip_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  JOINT_MOB_G3:       { primary: ["hip_l","hip_r","stifle_l","stifle_r","elbow_l","elbow_r"], secondary: ["glute_l","glute_r","quad_l","quad_r"] },
  MYOFASC_ILIO:       { primary: ["hip_flexor_l","hip_flexor_r"], secondary: ["paraspinal_l","paraspinal_r","glute_l","glute_r"] },
  MYOFASC_BF:         { primary: ["hamstring_l","hamstring_r"], secondary: ["glute_l","glute_r","calf_l","calf_r"] },
  GRACILIS_RELEASE:   { primary: ["hip_adduct_l","hip_adduct_r"], secondary: ["stifle_l","stifle_r","hamstring_l","hamstring_r"] },
  FELINE_MASSAGE:     { primary: ["paraspinal_l","paraspinal_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"] },

  // ── POST-SURGICAL ──
  POST_TPLO_WEEK1:    { primary: ["stifle_l","ccl","quad_l"], secondary: ["hamstring_l","hip_flexor_l"] },
  POST_TPLO_WEEK4:    { primary: ["quad_l","quad_r","stifle_l"], secondary: ["glute_l","glute_r","hamstring_l","hamstring_r"] },
  POST_TPLO_RETURN:   { primary: ["quad_l","quad_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["calf_l","calf_r","hip_flexor_l","hip_flexor_r"] },
  POST_FHO_EARLY:     { primary: ["glute_l","glute_r","hip_l"], secondary: ["hip_adduct_l","hip_adduct_r","quad_l"] },
  POST_FHO_ADVANCED:  { primary: ["glute_l","glute_r","hip_l","hip_adduct_l","hip_adduct_r"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  POST_IVDD_CONSV:    { primary: ["paraspinal_l","paraspinal_r","spine","core"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  POST_HEMI:          { primary: ["paraspinal_l","paraspinal_r","spine","core"], secondary: ["quad_l","quad_r","hip_flexor_l","hip_flexor_r"] },
  POST_FRACTURE:      { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["stifle_l","stifle_r","hip_l","hip_r"] },
  POST_PATELLA:       { primary: ["quad_l","quad_r","stifle_l","stifle_r"], secondary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r"] },
  POST_AMPUTATION:    { primary: ["shoulder_l","shoulder_r","glute_l","glute_r","core"], secondary: ["paraspinal_l","paraspinal_r","hip_adduct_l","hip_adduct_r"] },
  POST_THR:           { primary: ["glute_l","glute_r","hip_l","hip_r","quad_l","quad_r"], secondary: ["hip_adduct_l","hip_adduct_r","hamstring_l","hamstring_r"] },
  POST_SHOULDER:      { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","tricep_l","tricep_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  POST_ELBOW:         { primary: ["elbow_l","elbow_r","shoulder_l","shoulder_r"], secondary: ["tricep_l","tricep_r","core"] },
  POST_MULTI:         { primary: ["quad_l","quad_r","glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  POST_REVISION:      { primary: ["quad_l","quad_r","stifle_l","stifle_r"], secondary: ["glute_l","glute_r","hamstring_l","hamstring_r"] },
  ELBOW_LOAD_PROG:    { primary: ["elbow_l","elbow_r","shoulder_l","shoulder_r","tricep_l","tricep_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },

  // ── CANINE ATHLETIC FOUNDATIONS (Zink) ──
  AF_DIG:             { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","tricep_l","tricep_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  AF_HIGH_FIVE_WAVE:  { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r"], secondary: ["core","hip_adduct_l","hip_adduct_r"] },
  AF_SNOOPYS:         { primary: ["shoulder_l","shoulder_r","core","paraspinal_l","paraspinal_r"], secondary: ["glute_l","glute_r","hip_flexor_l","hip_flexor_r"] },
  AF_ABDOM_COOKIE:    { primary: ["core","paraspinal_l","paraspinal_r","hip_flexor_l","hip_flexor_r"], secondary: ["glute_l","glute_r","spine"] },
  AF_ROCKERBOARD:     { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","core"], secondary: ["shoulder_l","shoulder_r","paraspinal_l","paraspinal_r"] },
  AF_ROLL_OVER:       { primary: ["paraspinal_l","paraspinal_r","core","glute_l","glute_r"], secondary: ["shoulder_l","shoulder_r","hip_adduct_l","hip_adduct_r"] },
  AF_SIT_TO_STAND:    { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"] },
  AF_BEG_STAND_BEG:   { primary: ["core","paraspinal_l","paraspinal_r","hip_flexor_l","hip_flexor_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  AF_PEABODYS:        { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r"], secondary: ["core","quad_l","quad_r"] },
  AF_WALK_BACKWARD:   { primary: ["quad_l","quad_r","hip_flexor_l","hip_flexor_r"], secondary: ["hamstring_l","hamstring_r","calf_l","calf_r"] },
  AF_RETRIEVE_UPHILL: { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","calf_l","calf_r"] },
  AF_STAND_DOWN_STAND:{ primary: ["quad_l","quad_r","glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["core","hamstring_l","hamstring_r"] },
  AF_TUG:             { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","tricep_l","tricep_r"], secondary: ["core","paraspinal_l","paraspinal_r","glute_l","glute_r"] },
  AF_CRAWL:           { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","hip_flexor_l","hip_flexor_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  AF_RETRIEVE_LAND_WATER: { primary: ["glute_l","glute_r","shoulder_l","shoulder_r","hamstring_l","hamstring_r"], secondary: ["quad_l","quad_r","calf_l","calf_r"] },
  AF_STEP_OVER_POLES: { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  AF_STEP_THROUGH_LADDER: { primary: ["hip_flexor_l","hip_flexor_r","elbow_l","elbow_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  AF_RANDOM_GROUND_POLES: { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  AF_SPINS:           { primary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r","core"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  AF_COOKIE_STRETCHES:{ primary: ["paraspinal_l","paraspinal_r","core","hip_flexor_l","hip_flexor_r"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  AF_PLAY_BOW:        { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","tricep_l","tricep_r"], secondary: ["core","paraspinal_l","paraspinal_r","glute_l","glute_r"] },
  AF_CAT_STRETCH:     { primary: ["paraspinal_l","paraspinal_r","core","shoulder_l","shoulder_r"], secondary: ["glute_l","glute_r","hip_flexor_l","hip_flexor_r"] },
  AF_SPINE_STRETCH:   { primary: ["paraspinal_l","paraspinal_r","core","spine"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  AF_PASSIVE_ROM:     { primary: ["stifle_l","stifle_r","hip_l","hip_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  AF_TROT_ON_LEASH:   { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["shoulder_l","shoulder_r","hip_flexor_l","hip_flexor_r"] },
  AF_TREADMILL:       { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","hip_flexor_l","hip_flexor_r"], secondary: ["glute_l","glute_r","calf_l","calf_r"] },
  AF_PULL_SCOOTER:    { primary: ["glute_l","glute_r","hamstring_l","hamstring_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","paraspinal_l","paraspinal_r"] },
  AF_TROT_POWERED_SCOOTER: { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["shoulder_l","shoulder_r","core"] },
  AF_INLINE_SKATING_TROT: { primary: ["quad_l","quad_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["hip_adduct_l","hip_adduct_r","core"] },
  AF_SWIM_LONG_DISTANCE: { primary: ["glute_l","glute_r","shoulder_l","shoulder_r","spine","core"], secondary: ["hamstring_l","hamstring_r","quad_l","quad_r"] },

  // ── STRENGTHENING ──
  CAVALETTI_RAILS:    { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r","elbow_l","elbow_r"] },
  SIT_STAND_WALL:     { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r","core"] },
  STAIR_RUN:          { primary: ["quad_l","quad_r","glute_l","glute_r","hamstring_l","hamstring_r"], secondary: ["calf_l","calf_r","hip_flexor_l","hip_flexor_r"] },
  RESIST_WALK:        { primary: ["quad_l","quad_r","hamstring_l","hamstring_r","glute_l","glute_r"], secondary: ["hip_flexor_l","hip_flexor_r","calf_l","calf_r"] },
  JUMP_BOARD:         { primary: ["quad_l","quad_r","glute_l","glute_r","calf_l","calf_r"], secondary: ["hamstring_l","hamstring_r","shoulder_l","shoulder_r"] },
  POLE_WEAVE:         { primary: ["hip_adduct_l","hip_adduct_r","hip_flexor_l","hip_flexor_r","glute_l","glute_r"], secondary: ["shoulder_l","shoulder_r","core"] },
  TROT_CIRCLES:       { primary: ["glute_l","glute_r","hip_adduct_l","hip_adduct_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },

  // ── BALANCE & PROPRIOCEPTION ──
  BALANCE_PAD:        { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r"], secondary: ["core","spine","shoulder_l","shoulder_r"] },
  PHYSIO_BALL:        { primary: ["core","paraspinal_l","paraspinal_r","glute_l","glute_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  BLINDFOLD_WALK:     { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r"], secondary: ["core","spine"] },
  UNEVEN_TERRAIN:     { primary: ["hip_adduct_l","hip_adduct_r","hock_l","hock_r","stifle_l","stifle_r"], secondary: ["core","quad_l","quad_r"] },
  BALL_NUDGE:         { primary: ["quad_l","quad_r","glute_l","glute_r"], secondary: ["core","hip_adduct_l","hip_adduct_r"] },
  SURFACE_CHANGE:     { primary: ["hip_adduct_l","hip_adduct_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["core","quad_l","quad_r"] },
  PERTURBATION:       { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","core"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  LASER_CHASE:        { primary: ["hip_flexor_l","hip_flexor_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  SLOW_PIVOT:         { primary: ["hip_adduct_l","hip_adduct_r","glute_l","glute_r"], secondary: ["core","stifle_l","stifle_r"] },
  BOSU_STAND:         { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","core"], secondary: ["glute_l","glute_r","paraspinal_l","paraspinal_r"] },
  WOBBLE_BOARD_ADV:   { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","core"], secondary: ["shoulder_l","shoulder_r","spine"] },
  FOAM_PAD_STAND:     { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r"], secondary: ["core","shoulder_l","shoulder_r"] },
  CAVALETTI_VAR:      { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r"], secondary: ["quad_l","quad_r"] },
  THERABAND_WTS:      { primary: ["glute_l","glute_r","hip_adduct_l","hip_adduct_r"], secondary: ["quad_l","quad_r","core"] },
  FIGURE8_CONE:       { primary: ["hip_flexor_l","hip_flexor_r","glute_l","glute_r"], secondary: ["hip_adduct_l","hip_adduct_r","shoulder_l","shoulder_r"] },
  PERTURBATION_ADV:   { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","core","shoulder_l","shoulder_r"], secondary: ["glute_l","glute_r","spine"] },
  BLINDFOLD_BAL:      { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  DIAGONAL_LIFT:      { primary: ["glute_l","glute_r","shoulder_l","shoulder_r"], secondary: ["core","paraspinal_l","paraspinal_r","hip_adduct_l","hip_adduct_r"] },
  PLATFORM_TRANS:     { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","stifle_l","stifle_r"], secondary: ["core","hock_l","hock_r"] },
  ROCKER_BOARD:       { primary: ["hip_adduct_l","hip_adduct_r","quad_l","quad_r","core"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  TRAMPOLINE_STAND:   { primary: ["quad_l","quad_r","hip_adduct_l","hip_adduct_r","core"], secondary: ["glute_l","glute_r","calf_l","calf_r"] },
  LADDER_WALK:        { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  BOSU_FRONT:         { primary: ["shoulder_l","shoulder_r","elbow_l","elbow_r","tricep_l","tricep_r"], secondary: ["core","paraspinal_l","paraspinal_r"] },
  BOSU_HIND:          { primary: ["quad_l","quad_r","glute_l","glute_r","hip_adduct_l","hip_adduct_r"], secondary: ["core","hock_l","hock_r"] },
  CAVALETTI_ELEV:     { primary: ["hip_flexor_l","hip_flexor_r","stifle_l","stifle_r","hock_l","hock_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","shoulder_l","shoulder_r"] },
  CAVALETTI_WEAVE:    { primary: ["hip_adduct_l","hip_adduct_r","hip_flexor_l","hip_flexor_r","stifle_l","stifle_r"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  CORE_BRIDGE:        { primary: ["core","paraspinal_l","paraspinal_r","glute_l","glute_r"], secondary: ["hamstring_l","hamstring_r","quad_l","quad_r"] },

  // ── COMPLEMENTARY ──
  ACUPUNCTURE:        { primary: ["paraspinal_l","paraspinal_r","spine","glute_l","glute_r"], secondary: ["quad_l","quad_r","hamstring_l","hamstring_r"] },
  CHIROPRACTIC:       { primary: ["paraspinal_l","paraspinal_r","spine","core"], secondary: ["glute_l","glute_r","shoulder_l","shoulder_r"] },
  KINESIO_TAPE:       { primary: ["quad_l","quad_r","paraspinal_l","paraspinal_r","shoulder_l","shoulder_r"], secondary: ["glute_l","glute_r","stifle_l","stifle_r"] },
  PLATELET_RICH:      { primary: ["stifle_l","stifle_r","hip_l","hip_r","elbow_l","elbow_r","shoulder_l","shoulder_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  STEM_CELL:          { primary: ["stifle_l","stifle_r","hip_l","hip_r","elbow_l","elbow_r"], secondary: ["quad_l","quad_r","glute_l","glute_r"] },
  SHOCKWAVE:          { primary: ["hip_flexor_l","hip_flexor_r","paraspinal_l","paraspinal_r","stifle_l","stifle_r"], secondary: ["glute_l","glute_r","quad_l","quad_r"] },
  AROMATHERAPY:       { primary: [], secondary: [] },
  MUSIC_THERAPY:      { primary: [], secondary: [] },
};

// ── Diagnosis → affected structures ──────────────────────────────────────
const DIAGNOSIS_MAP = {
  "POST_TPLO":       ["ccl","stifle_l"],
  "TPLO":            ["ccl","stifle_l"],
  "TTA":             ["ccl","stifle_l","quad_l"],
  "FHO":             ["hip_l","glute_l"],
  "HIP_DYSPLASIA":   ["hip_l","hip_r","glute_l","glute_r"],
  "Hip Dysplasia":   ["hip_l","hip_r","glute_l","glute_r"],
  "IVDD":            ["spine","paraspinal_l","paraspinal_r"],
  "DEGENERATIVE_MYELOPATHY": ["spine","paraspinal_l","paraspinal_r","quad_l","quad_r"],
  "OA_GENERAL":      ["stifle_l","stifle_r","hip_l","hip_r"],
  "FELINE_OA":       ["stifle_l","stifle_r","hip_l","hip_r","elbow_l","elbow_r"],
  "FELINE_OA_AXIAL": ["spine","paraspinal_l","paraspinal_r"],
  "FELINE_IVDD_CAT": ["spine","paraspinal_l","paraspinal_r"],
  "FELINE_FATE_RECOVERY": ["hock_l","hock_r","calf_l","calf_r"],
};

// ── Full clinical atlas (origin / insertion / action / nerve) ─────────────
const ATLAS = {
  quad_l:       { label:"Quadriceps Femoris (L)", origin:"Ilium + femoral shaft", insertion:"Tibial tuberosity via patellar ligament", action:"Stifle extension; rectus femoris also flexes hip", plain:"Front thigh — the #1 muscle lost post-TPLO", nerve:"Femoral n. (L4-L6)" },
  quad_r:       { label:"Quadriceps Femoris (R)", origin:"Ilium + femoral shaft", insertion:"Tibial tuberosity via patellar ligament", action:"Stifle extension; rectus femoris also flexes hip", plain:"Front thigh — the #1 muscle lost post-TPLO", nerve:"Femoral n. (L4-L6)" },
  hamstring_l:  { label:"Hamstrings (L)", origin:"Ischial tuberosity", insertion:"Tibial crest, calcaneal tuber", action:"Hip extension + stifle flexion + hock extension", plain:"Back thigh — primary propulsive engine", nerve:"Sciatic n. (L6-S2)" },
  hamstring_r:  { label:"Hamstrings (R)", origin:"Ischial tuberosity", insertion:"Tibial crest, calcaneal tuber", action:"Hip extension + stifle flexion + hock extension", plain:"Back thigh — primary propulsive engine", nerve:"Sciatic n. (L6-S2)" },
  glute_l:      { label:"Gluteals (L)", origin:"Iliac crest, gluteal surface, thoracolumbar fascia", insertion:"Greater trochanter", action:"Hip abduction + extension — primary lateral stabilizer", plain:"Hip muscles — power for sitting, climbing, lateral balance", nerve:"Cranial/caudal gluteal n. (L6-S1)" },
  glute_r:      { label:"Gluteals (R)", origin:"Iliac crest, gluteal surface, thoracolumbar fascia", insertion:"Greater trochanter", action:"Hip abduction + extension — primary lateral stabilizer", plain:"Hip muscles — power for sitting, climbing, lateral balance", nerve:"Cranial/caudal gluteal n. (L6-S1)" },
  hip_flexor_l: { label:"Iliopsoas (L)", origin:"Iliac fossa + lumbar vertebrae L2-L7", insertion:"Lesser trochanter of femur", action:"Hip flexion + external rotation; psoas stabilizes lumbar spine", plain:"Hip flexor — most commonly strained muscle in canine athletes", nerve:"Femoral n. (L4-L5) + direct lumbar branches" },
  hip_flexor_r: { label:"Iliopsoas (R)", origin:"Iliac fossa + lumbar vertebrae L2-L7", insertion:"Lesser trochanter of femur", action:"Hip flexion + external rotation; psoas stabilizes lumbar spine", plain:"Hip flexor — most commonly strained muscle in canine athletes", nerve:"Femoral n. (L4-L5) + direct lumbar branches" },
  hip_adduct_l: { label:"Hip Adductors (L)", origin:"Pubis and ischium", insertion:"Medial femoral shaft", action:"Hip adduction; gracilis also flexes stifle", plain:"Inner thigh — lateral stifle stabilizers", nerve:"Obturator n. (L4-L6)" },
  hip_adduct_r: { label:"Hip Adductors (R)", origin:"Pubis and ischium", insertion:"Medial femoral shaft", action:"Hip adduction; gracilis also flexes stifle", plain:"Inner thigh — lateral stifle stabilizers", nerve:"Obturator n. (L4-L6)" },
  hip_l:        { label:"Coxofemoral Joint (L)", origin:"N/A — joint", insertion:"N/A — joint", action:"Ball-and-socket: flexion, extension, abduction, adduction, rotation", plain:"Hip joint — most mobile joint in the hindlimb", nerve:"Obturator + femoral nerve branches" },
  hip_r:        { label:"Coxofemoral Joint (R)", origin:"N/A — joint", insertion:"N/A — joint", action:"Ball-and-socket: flexion, extension, abduction, adduction, rotation", plain:"Hip joint — most mobile joint in the hindlimb", nerve:"Obturator + femoral nerve branches" },
  stifle_l:     { label:"Stifle Joint (L)", origin:"N/A — joint", insertion:"N/A — joint", action:"Hinge: flex 35-45 deg, ext 155-165 deg (dog); flex 22-28, ext 140-148 (cat)", plain:"Knee — most-injured joint in veterinary medicine", nerve:"Femoral + sciatic nerve branches" },
  stifle_r:     { label:"Stifle Joint (R)", origin:"N/A — joint", insertion:"N/A — joint", action:"Hinge: flex 35-45 deg, ext 155-165 deg (dog); flex 22-28, ext 140-148 (cat)", plain:"Knee — most-injured joint in veterinary medicine", nerve:"Femoral + sciatic nerve branches" },
  ccl:          { label:"Cranial Cruciate Lig.", origin:"Caudal lateral femoral condyle", insertion:"Cranial intercondylar area of tibia", action:"Resists cranial tibial thrust + internal tibial rotation + hyperextension", plain:"ACL equivalent — when ruptured, causes TPLO/TTA surgery", nerve:"Mechanoreceptors (proprioceptive role)" },
  calf_l:       { label:"Gastrocnemius (L)", origin:"Lateral + medial femoral fabellae", insertion:"Calcaneal tuber via common calcaneal tendon", action:"Hock extension + stifle flexion (biarticular)", plain:"Calf muscle — push-off power, hock extension", nerve:"Tibial n. (L6-S1)" },
  calf_r:       { label:"Gastrocnemius (R)", origin:"Lateral + medial femoral fabellae", insertion:"Calcaneal tuber via common calcaneal tendon", action:"Hock extension + stifle flexion (biarticular)", plain:"Calf muscle — push-off power, hock extension", nerve:"Tibial n. (L6-S1)" },
  hock_l:       { label:"Tarsocrural Joint (L)", origin:"N/A — joint", insertion:"N/A — joint", action:"Hinge: ext 160-165 deg, flex 35-40 deg (dog); ext 165-168 (cat)", plain:"Ankle joint — absorbs landing impact, push-off lever", nerve:"Tibial + peroneal nerve branches" },
  hock_r:       { label:"Tarsocrural Joint (R)", origin:"N/A — joint", insertion:"N/A — joint", action:"Hinge: ext 160-165 deg, flex 35-40 deg (dog); ext 165-168 (cat)", plain:"Ankle joint — absorbs landing impact, push-off lever", nerve:"Tibial + peroneal nerve branches" },
  shoulder_l:   { label:"Glenohumeral Joint (L)", origin:"N/A — joint", insertion:"N/A — joint", action:"Ball-and-socket: flex 30-35 deg, ext 165-170 deg. Bears 60% body weight.", plain:"Shoulder — forelimb shock absorber, 60% bodyweight in stance", nerve:"Suprascapular + musculocutaneous nerve branches" },
  shoulder_r:   { label:"Glenohumeral Joint (R)", origin:"N/A — joint", insertion:"N/A — joint", action:"Ball-and-socket: flex 30-35 deg, ext 165-170 deg. Bears 60% body weight.", plain:"Shoulder — forelimb shock absorber, 60% bodyweight in stance", nerve:"Suprascapular + musculocutaneous nerve branches" },
  elbow_l:      { label:"Cubital Joint (L)", origin:"N/A — joint", insertion:"N/A — joint", action:"Hinge: ext 165-170 deg, flex 20-25 deg (dog). Most common forelimb OA site.", plain:"Elbow — #1 forelimb OA location in dogs AND cats", nerve:"Radial + musculocutaneous nerve branches" },
  elbow_r:      { label:"Cubital Joint (R)", origin:"N/A — joint", insertion:"N/A — joint", action:"Hinge: ext 165-170 deg, flex 20-25 deg (dog). Most common forelimb OA site.", plain:"Elbow — #1 forelimb OA location in dogs AND cats", nerve:"Radial + musculocutaneous nerve branches" },
  tricep_l:     { label:"Triceps Brachii (L)", origin:"Caudal glenoid (long head); caudal humeral shaft (other heads)", insertion:"Olecranon process", action:"Elbow extension; long head also extends shoulder", plain:"Back of upper arm — prevents elbow collapse under body weight", nerve:"Radial n. (C7-T1)" },
  tricep_r:     { label:"Triceps Brachii (R)", origin:"Caudal glenoid (long head); caudal humeral shaft (other heads)", insertion:"Olecranon process", action:"Elbow extension; long head also extends shoulder", plain:"Back of upper arm — prevents elbow collapse under body weight", nerve:"Radial n. (C7-T1)" },
  spine:        { label:"Vertebral Column", origin:"C7-T13-L7-S3 (dog and cat)", insertion:"N/A — axial structure", action:"Structural support; epaxial muscles resist flexion; transmits hindquarter drive to forelimbs", plain:"Backbone — the transmission between hindquarter engine and forelimb steering", nerve:"31 pairs of spinal nerves; deep pain via spinothalamic tract" },
  core:         { label:"Core Musculature", origin:"Epaxial: iliac crest, sacrum, vertebral processes", insertion:"Multi-segmental spinous and transverse processes", action:"Spinal stability; multifidus = segmental stabilizer; resist bending and torsion", plain:"Core = the foundation every limb movement depends on", nerve:"Segmental dorsal branches of spinal nerves" },
  paraspinal_l: { label:"Epaxial Muscles (L)", origin:"Iliac crest, sacrum, transverse and spinous processes", insertion:"Cranial spinous and transverse processes, ribs", action:"Bilateral: spine extension. Unilateral: lateral bending. Multifidus: intersegmental stability", plain:"Back muscles alongside spine — guarding here signals pain", nerve:"Dorsal branches of spinal nerves at each segment" },
  paraspinal_r: { label:"Epaxial Muscles (R)", origin:"Iliac crest, sacrum, transverse and spinous processes", insertion:"Cranial spinous and transverse processes, ribs", action:"Bilateral: spine extension. Unilateral: lateral bending. Multifidus: intersegmental stability", plain:"Back muscles alongside spine — guarding here signals pain", nerve:"Dorsal branches of spinal nerves at each segment" },
};

const MUSCLE_INFO = ATLAS; // alias for backward compat with hover tooltip code

// ── Colours ──────────────────────────────────────────────────────────────
const COL = {
  body:      0x1e3a5f,   // dark navy — body silhouette
  bone:      0x334155,   // dark slate — skeleton
  default:   0x2d4a6b,   // dim blue — inactive muscle
  primary:   0x14b8a6,   // teal — primary target
  secondary: 0xf59e0b,   // amber — secondary
  surgical:  0xef4444,   // red — diagnosis site
  joint:     0x0f766e,   // dark teal — joints
  hover:     0x67e8f9,   // bright cyan — hover
  emissive:  0x000000,
};

// ── Canine body geometry builder ─────────────────────────────────────────
// Returns array of { mesh, ids[] } objects
// All geometry is built from Three.js primitives for correctness + performance
function buildCanineBody(scene, meshMap) {
  const mats = {};
  Object.entries(COL).forEach(([k, v]) => {
    mats[k] = new THREE.MeshPhongMaterial({
      color: v, transparent: true,
      opacity: k === "body" ? 0.25 : k === "bone" ? 0.5 : 0.82,
      shininess: k === "body" ? 10 : 60,
    });
  });

  const add = (geo, mat, pos, rot, ids) => {
    const m = new THREE.Mesh(geo, mat.clone());
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    m.castShadow = true;
    m.userData.ids = ids || [];
    scene.add(m);
    if (ids) ids.forEach(id => {
      if (!meshMap[id]) meshMap[id] = [];
      meshMap[id].push(m);
    });
    return m;
  };

  // ── TORSO ──
  add(new THREE.CapsuleGeometry(0.38, 1.4, 8, 16), mats.body, [0, 0.35, 0], [0, 0, Math.PI/2], ["core"]);
  // Paraspinals (long strips alongside spine)
  add(new THREE.CapsuleGeometry(0.1, 1.3, 6, 8), mats.default, [0, 0.55, 0.16], [0, 0, Math.PI/2], ["paraspinal_l"]);
  add(new THREE.CapsuleGeometry(0.1, 1.3, 6, 8), mats.default, [0, 0.55, -0.16], [0, 0, Math.PI/2], ["paraspinal_r"]);
  // Spine (vertebral column — visual rod)
  add(new THREE.CapsuleGeometry(0.045, 1.5, 4, 8), mats.bone, [0, 0.62, 0], [0, 0, Math.PI/2], ["spine"]);

  // ── HEAD & NECK ──
  add(new THREE.SphereGeometry(0.22, 16, 12), mats.body, [1.1, 0.7, 0], null, []);
  // Snout
  add(new THREE.CapsuleGeometry(0.1, 0.22, 4, 8), mats.body, [1.38, 0.6, 0], [0, 0, Math.PI/2], []);
  // Neck
  add(new THREE.CapsuleGeometry(0.14, 0.38, 6, 8), mats.body, [0.82, 0.56, 0], [0, 0, -Math.PI/5], []);

  // ── TAIL ──
  add(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), mats.body, [-1.05, 0.55, 0], [0, 0, Math.PI/4], []);

  // ── LEFT HINDLIMB (viewer's left = anatomical left, displayed right) ──
  const HZ = 0.22;   // lateral offset left
  // Gluteals
  add(new THREE.CapsuleGeometry(0.14, 0.28, 8, 10), mats.default, [-0.52, 0.42, HZ], [0.2, 0, 0], ["glute_l"]);
  // Iliopsoas / hip flexor
  add(new THREE.CapsuleGeometry(0.09, 0.28, 6, 8), mats.default, [-0.42, 0.35, HZ+0.05], [0.5, 0, 0], ["hip_flexor_l"]);
  // Hip adductors
  add(new THREE.CapsuleGeometry(0.08, 0.26, 6, 8), mats.default, [-0.52, 0.3, HZ-0.07], [0.4, 0, 0.1], ["hip_adduct_l"]);
  // Hip joint sphere
  add(new THREE.SphereGeometry(0.1, 12, 10), mats.joint, [-0.58, 0.28, HZ], null, ["hip_l"]);
  // Femur (thigh bone)
  add(new THREE.CapsuleGeometry(0.04, 0.44, 4, 8), mats.bone, [-0.6, 0.06, HZ], [0.15, 0, 0], []);
  // Hamstrings (biceps femoris — caudal thigh)
  add(new THREE.CapsuleGeometry(0.11, 0.42, 8, 10), mats.default, [-0.6, 0.08, HZ+0.09], [0.15, 0, 0], ["hamstring_l"]);
  // Quadriceps (cranial thigh)
  add(new THREE.CapsuleGeometry(0.11, 0.42, 8, 10), mats.default, [-0.6, 0.08, HZ-0.05], [0.15, 0, 0], ["quad_l"]);
  // Stifle joint
  add(new THREE.SphereGeometry(0.09, 12, 10), mats.joint, [-0.65, -0.18, HZ], null, ["stifle_l"]);
  // CCL (tiny ligament — small cylinder inside stifle)
  add(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6), mats.default, [-0.65, -0.15, HZ], null, ["ccl"]);
  // Calf / gastrocnemius
  add(new THREE.CapsuleGeometry(0.08, 0.32, 6, 8), mats.default, [-0.65, -0.36, HZ+0.04], [0.2, 0, 0], ["calf_l"]);
  // Tibia/fibula (lower leg bone)
  add(new THREE.CapsuleGeometry(0.03, 0.3, 4, 6), mats.bone, [-0.67, -0.36, HZ], [0.2, 0, 0], []);
  // Hock joint
  add(new THREE.SphereGeometry(0.065, 10, 8), mats.joint, [-0.68, -0.56, HZ], null, ["hock_l"]);
  // Paw
  add(new THREE.SphereGeometry(0.07, 10, 8), mats.body, [-0.68, -0.68, HZ], null, []);

  // ── RIGHT HINDLIMB (mirror of left) ──
  const HZR = -0.22;
  add(new THREE.CapsuleGeometry(0.14, 0.28, 8, 10), mats.default, [-0.52, 0.42, HZR], [0.2, 0, 0], ["glute_r"]);
  add(new THREE.CapsuleGeometry(0.09, 0.28, 6, 8), mats.default, [-0.42, 0.35, HZR-0.05], [0.5, 0, 0], ["hip_flexor_r"]);
  add(new THREE.CapsuleGeometry(0.08, 0.26, 6, 8), mats.default, [-0.52, 0.3, HZR+0.07], [0.4, 0, -0.1], ["hip_adduct_r"]);
  add(new THREE.SphereGeometry(0.1, 12, 10), mats.joint, [-0.58, 0.28, HZR], null, ["hip_r"]);
  add(new THREE.CapsuleGeometry(0.04, 0.44, 4, 8), mats.bone, [-0.6, 0.06, HZR], [0.15, 0, 0], []);
  add(new THREE.CapsuleGeometry(0.11, 0.42, 8, 10), mats.default, [-0.6, 0.08, HZR-0.09], [0.15, 0, 0], ["hamstring_r"]);
  add(new THREE.CapsuleGeometry(0.11, 0.42, 8, 10), mats.default, [-0.6, 0.08, HZR+0.05], [0.15, 0, 0], ["quad_r"]);
  add(new THREE.SphereGeometry(0.09, 12, 10), mats.joint, [-0.65, -0.18, HZR], null, ["stifle_r"]);
  add(new THREE.CapsuleGeometry(0.08, 0.32, 6, 8), mats.default, [-0.65, -0.36, HZR-0.04], [0.2, 0, 0], ["calf_r"]);
  add(new THREE.CapsuleGeometry(0.03, 0.3, 4, 6), mats.bone, [-0.67, -0.36, HZR], [0.2, 0, 0], []);
  add(new THREE.SphereGeometry(0.065, 10, 8), mats.joint, [-0.68, -0.56, HZR], null, ["hock_r"]);
  add(new THREE.SphereGeometry(0.07, 10, 8), mats.body, [-0.68, -0.68, HZR], null, []);

  // ── LEFT FORELIMB ──
  const FZ = 0.2;
  // Shoulder joint
  add(new THREE.SphereGeometry(0.1, 12, 10), mats.joint, [0.68, 0.28, FZ], null, ["shoulder_l"]);
  // Shoulder muscles (infraspinatus / deltoid)
  add(new THREE.CapsuleGeometry(0.1, 0.28, 8, 10), mats.default, [0.65, 0.28, FZ+0.06], [0.1, 0, 0], ["shoulder_l"]);
  // Humerus (upper arm)
  add(new THREE.CapsuleGeometry(0.035, 0.38, 4, 8), mats.bone, [0.68, 0.06, FZ], [0.1, 0, 0], []);
  // Triceps
  add(new THREE.CapsuleGeometry(0.09, 0.36, 6, 8), mats.default, [0.68, 0.06, FZ+0.08], [0.1, 0, 0], ["tricep_l"]);
  // Elbow
  add(new THREE.SphereGeometry(0.075, 10, 8), mats.joint, [0.72, -0.14, FZ], null, ["elbow_l"]);
  // Radius/ulna
  add(new THREE.CapsuleGeometry(0.025, 0.3, 4, 6), mats.bone, [0.74, -0.32, FZ], [0.05, 0, 0], []);
  // Carpus
  add(new THREE.SphereGeometry(0.055, 8, 8), mats.joint, [0.75, -0.5, FZ], null, []);
  // Paw
  add(new THREE.SphereGeometry(0.065, 10, 8), mats.body, [0.75, -0.62, FZ], null, []);

  // ── RIGHT FORELIMB (mirror) ──
  const FZR = -0.2;
  add(new THREE.SphereGeometry(0.1, 12, 10), mats.joint, [0.68, 0.28, FZR], null, ["shoulder_r"]);
  add(new THREE.CapsuleGeometry(0.1, 0.28, 8, 10), mats.default, [0.65, 0.28, FZR-0.06], [0.1, 0, 0], ["shoulder_r"]);
  add(new THREE.CapsuleGeometry(0.035, 0.38, 4, 8), mats.bone, [0.68, 0.06, FZR], [0.1, 0, 0], []);
  add(new THREE.CapsuleGeometry(0.09, 0.36, 6, 8), mats.default, [0.68, 0.06, FZR-0.08], [0.1, 0, 0], ["tricep_r"]);
  add(new THREE.SphereGeometry(0.075, 10, 8), mats.joint, [0.72, -0.14, FZR], null, ["elbow_r"]);
  add(new THREE.CapsuleGeometry(0.025, 0.3, 4, 6), mats.bone, [0.74, -0.32, FZR], [0.05, 0, 0], []);
  add(new THREE.SphereGeometry(0.055, 8, 8), mats.joint, [0.75, -0.5, FZR], null, []);
  add(new THREE.SphereGeometry(0.065, 10, 8), mats.body, [0.75, -0.62, FZR], null, []);

  return mats;
}

// ── Feline builder (smaller, longer, narrower proportions) ───────────────
function buildFelineBody(scene, meshMap) {
  const mats = {};
  Object.entries(COL).forEach(([k, v]) => {
    mats[k] = new THREE.MeshPhongMaterial({
      color: v, transparent: true,
      opacity: k === "body" ? 0.25 : k === "bone" ? 0.5 : 0.82,
      shininess: k === "body" ? 10 : 60,
    });
  });
  const add = (geo, mat, pos, rot, ids) => {
    const m = new THREE.Mesh(geo, mat.clone());
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    m.castShadow = true;
    m.userData.ids = ids || [];
    scene.add(m);
    if (ids) ids.forEach(id => {
      if (!meshMap[id]) meshMap[id] = [];
      meshMap[id].push(m);
    });
    return m;
  };

  // TORSO — longer and lower than canine
  add(new THREE.CapsuleGeometry(0.3, 1.6, 8, 16), mats.body, [0, 0.28, 0], [0, 0, Math.PI/2], ["core"]);
  add(new THREE.CapsuleGeometry(0.08, 1.5, 6, 8), mats.default, [0, 0.46, 0.14], [0, 0, Math.PI/2], ["paraspinal_l"]);
  add(new THREE.CapsuleGeometry(0.08, 1.5, 6, 8), mats.default, [0, 0.46, -0.14], [0, 0, Math.PI/2], ["paraspinal_r"]);
  add(new THREE.CapsuleGeometry(0.035, 1.6, 4, 8), mats.bone, [0, 0.52, 0], [0, 0, Math.PI/2], ["spine"]);

  // HEAD — rounder than dog
  add(new THREE.SphereGeometry(0.18, 16, 12), mats.body, [1.06, 0.56, 0], null, []);
  // Ears (triangular cones)
  add(new THREE.ConeGeometry(0.06, 0.14, 4), mats.body, [1.09, 0.79, 0.08], null, []);
  add(new THREE.ConeGeometry(0.06, 0.14, 4), mats.body, [1.09, 0.79, -0.08], null, []);
  // Short snout
  add(new THREE.CapsuleGeometry(0.07, 0.1, 4, 8), mats.body, [1.26, 0.5, 0], [0, 0, Math.PI/2], []);
  // Neck
  add(new THREE.CapsuleGeometry(0.11, 0.28, 6, 8), mats.body, [0.82, 0.44, 0], [0, 0, -Math.PI/4], []);
  // Tail — long and curved
  add(new THREE.CapsuleGeometry(0.045, 0.7, 4, 8), mats.body, [-1.15, 0.5, 0], [0, 0, -Math.PI/5], []);

  // HINDLIMBS — cats sit lower, more coiled
  const HZ = 0.19;
  add(new THREE.CapsuleGeometry(0.11, 0.24, 8, 10), mats.default, [-0.5, 0.34, HZ], [0.2, 0, 0], ["glute_l"]);
  add(new THREE.CapsuleGeometry(0.07, 0.22, 6, 8), mats.default, [-0.4, 0.28, HZ+0.04], [0.5, 0, 0], ["hip_flexor_l"]);
  add(new THREE.CapsuleGeometry(0.065, 0.2, 6, 8), mats.default, [-0.5, 0.24, HZ-0.06], [0.4, 0, 0.1], ["hip_adduct_l"]);
  add(new THREE.SphereGeometry(0.08, 12, 10), mats.joint, [-0.56, 0.22, HZ], null, ["hip_l"]);
  add(new THREE.CapsuleGeometry(0.032, 0.36, 4, 8), mats.bone, [-0.58, 0.04, HZ], [0.15, 0, 0], []);
  add(new THREE.CapsuleGeometry(0.09, 0.34, 8, 10), mats.default, [-0.58, 0.04, HZ+0.07], [0.15, 0, 0], ["hamstring_l"]);
  add(new THREE.CapsuleGeometry(0.09, 0.34, 8, 10), mats.default, [-0.58, 0.04, HZ-0.04], [0.15, 0, 0], ["quad_l"]);
  add(new THREE.SphereGeometry(0.072, 12, 10), mats.joint, [-0.62, -0.14, HZ], null, ["stifle_l"]);
  add(new THREE.CapsuleGeometry(0.065, 0.26, 6, 8), mats.default, [-0.62, -0.3, HZ+0.03], [0.2, 0, 0], ["calf_l"]);
  add(new THREE.SphereGeometry(0.052, 10, 8), mats.joint, [-0.64, -0.48, HZ], null, ["hock_l"]);
  add(new THREE.SphereGeometry(0.055, 10, 8), mats.body, [-0.64, -0.58, HZ], null, []);

  const HZR = -0.19;
  add(new THREE.CapsuleGeometry(0.11, 0.24, 8, 10), mats.default, [-0.5, 0.34, HZR], [0.2, 0, 0], ["glute_r"]);
  add(new THREE.CapsuleGeometry(0.07, 0.22, 6, 8), mats.default, [-0.4, 0.28, HZR-0.04], [0.5, 0, 0], ["hip_flexor_r"]);
  add(new THREE.CapsuleGeometry(0.065, 0.2, 6, 8), mats.default, [-0.5, 0.24, HZR+0.06], [0.4, 0, -0.1], ["hip_adduct_r"]);
  add(new THREE.SphereGeometry(0.08, 12, 10), mats.joint, [-0.56, 0.22, HZR], null, ["hip_r"]);
  add(new THREE.CapsuleGeometry(0.032, 0.36, 4, 8), mats.bone, [-0.58, 0.04, HZR], [0.15, 0, 0], []);
  add(new THREE.CapsuleGeometry(0.09, 0.34, 8, 10), mats.default, [-0.58, 0.04, HZR-0.07], [0.15, 0, 0], ["hamstring_r"]);
  add(new THREE.CapsuleGeometry(0.09, 0.34, 8, 10), mats.default, [-0.58, 0.04, HZR+0.04], [0.15, 0, 0], ["quad_r"]);
  add(new THREE.SphereGeometry(0.072, 12, 10), mats.joint, [-0.62, -0.14, HZR], null, ["stifle_r"]);
  add(new THREE.CapsuleGeometry(0.065, 0.26, 6, 8), mats.default, [-0.62, -0.3, HZR-0.03], [0.2, 0, 0], ["calf_r"]);
  add(new THREE.SphereGeometry(0.052, 10, 8), mats.joint, [-0.64, -0.48, HZR], null, ["hock_r"]);
  add(new THREE.SphereGeometry(0.055, 10, 8), mats.body, [-0.64, -0.58, HZR], null, []);

  // FORELIMBS
  const FZ = 0.17;
  add(new THREE.SphereGeometry(0.08, 12, 10), mats.joint, [0.65, 0.22, FZ], null, ["shoulder_l"]);
  add(new THREE.CapsuleGeometry(0.08, 0.24, 8, 10), mats.default, [0.62, 0.22, FZ+0.05], [0.1, 0, 0], ["shoulder_l"]);
  add(new THREE.CapsuleGeometry(0.028, 0.32, 4, 8), mats.bone, [0.65, 0.04, FZ], [0.1, 0, 0], []);
  add(new THREE.CapsuleGeometry(0.072, 0.3, 6, 8), mats.default, [0.65, 0.04, FZ+0.06], [0.1, 0, 0], ["tricep_l"]);
  add(new THREE.SphereGeometry(0.06, 10, 8), mats.joint, [0.68, -0.12, FZ], null, ["elbow_l"]);
  add(new THREE.CapsuleGeometry(0.022, 0.26, 4, 6), mats.bone, [0.7, -0.28, FZ], [0.05, 0, 0], []);
  add(new THREE.SphereGeometry(0.05, 8, 8), mats.body, [0.72, -0.52, FZ], null, []);

  const FZR = -0.17;
  add(new THREE.SphereGeometry(0.08, 12, 10), mats.joint, [0.65, 0.22, FZR], null, ["shoulder_r"]);
  add(new THREE.CapsuleGeometry(0.08, 0.24, 8, 10), mats.default, [0.62, 0.22, FZR-0.05], [0.1, 0, 0], ["shoulder_r"]);
  add(new THREE.CapsuleGeometry(0.028, 0.32, 4, 8), mats.bone, [0.65, 0.04, FZR], [0.1, 0, 0], []);
  add(new THREE.CapsuleGeometry(0.072, 0.3, 6, 8), mats.default, [0.65, 0.04, FZR-0.06], [0.1, 0, 0], ["tricep_r"]);
  add(new THREE.SphereGeometry(0.06, 10, 8), mats.joint, [0.68, -0.12, FZR], null, ["elbow_r"]);
  add(new THREE.CapsuleGeometry(0.022, 0.26, 4, 6), mats.bone, [0.7, -0.28, FZR], [0.05, 0, 0], []);
  add(new THREE.SphereGeometry(0.05, 8, 8), mats.body, [0.72, -0.52, FZR], null, []);

  return mats;
}

// ── Main component ────────────────────────────────────────────────────────
export default function AnatomyViewer3D({ exerciseCode, diagnosis, species = "Canine", compact = false }) {
  const mountRef   = useRef(null);
  const sceneRef   = useRef(null);
  const rendRef    = useRef(null);
  const camRef     = useRef(null);
  const frameRef   = useRef(null);
  const meshMapRef = useRef({});
  const isDrag     = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const rotRef     = useRef({ y: 0.3, x: -0.1 });
  const groupRef   = useRef(null);

  const [hovered, setHovered]       = useState(null);
  const [clientMode, setClientMode]   = useState(false);
  const [visible, setVisible]         = useState(true);
  const [autoRotate, setAutoRotate]   = useState(true);
  const autoRotateRef                 = useRef(true);   // readable inside animate loop
  const mouseInsideRef                = useRef(false);  // pause on hover

  const isFeline = species === "Feline";

  const exerciseData = useMemo(() => {
    const code = (exerciseCode || "").toUpperCase().replace(/[- ]/g, "_");
    return EXERCISE_MUSCLE_MAP[code] || { primary: [], secondary: [] };
  }, [exerciseCode]);

  const diagnosisStructures = useMemo(() => {
    return DIAGNOSIS_MAP[diagnosis] || DIAGNOSIS_MAP[(diagnosis || "").toUpperCase()] || [];
  }, [diagnosis]);

  // ── Apply colours to meshes based on current highlight state ──────────
  const applyColors = (meshMap) => {
    const allMeshes = Object.values(meshMap).flat();
    allMeshes.forEach(m => {
      const ids = m.userData.ids || [];
      let col = COL.default;
      let emissive = 0x000000;
      let opacity = 0.82;
      if (ids.some(id => diagnosisStructures.includes(id))) {
        col = COL.surgical; emissive = 0x330000; opacity = 0.92;
      } else if (ids.some(id => exerciseData.primary.includes(id))) {
        col = COL.primary;  emissive = 0x003322; opacity = 0.92;
      } else if (ids.some(id => exerciseData.secondary.includes(id))) {
        col = COL.secondary; emissive = 0x221100; opacity = 0.88;
      }
      m.material.color.setHex(col);
      m.material.emissive.setHex(emissive);
      m.material.opacity = opacity;
    });
  };

  // ── Raycasting for hover ───────────────────────────────────────────────
  const onMouseMove = (e) => {
    if (!rendRef.current || !sceneRef.current || !camRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camRef.current);
    const allMeshes = Object.values(meshMapRef.current).flat();
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length > 0) {
      const ids = hits[0].object.userData.ids || [];
      const activeId = ids.find(id =>
        exerciseData.primary.includes(id) ||
        exerciseData.secondary.includes(id) ||
        diagnosisStructures.includes(id)
      );
      if (activeId) {
        setHovered(activeId);
        hits[0].object.material.emissive.setHex(0x004444);
        return;
      }
    }
    setHovered(null);
  };

  // ── Drag to rotate ─────────────────────────────────────────────────────
  const onPointerDown = (e) => {
    isDrag.current = true;
    setAutoRotate(false);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e) => {
    if (!isDrag.current || !groupRef.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    rotRef.current.y += dx * 0.008;
    rotRef.current.x += dy * 0.005;
    rotRef.current.x = Math.max(-0.6, Math.min(0.6, rotRef.current.x));
    groupRef.current.rotation.y = rotRef.current.y;
    groupRef.current.rotation.x = rotRef.current.x;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onMouseMove(e);
  };
  const onPointerUp = () => { isDrag.current = false; };

  // ── Scroll to zoom ─────────────────────────────────────────────────────
  const onWheel = (e) => {
    if (!camRef.current) return;
    camRef.current.position.z = Math.max(1.2, Math.min(4.5, camRef.current.position.z + e.deltaY * 0.003));
  };

  // ── Scene setup (runs when species changes) ───────────────────────────
  useEffect(() => {
    if (!mountRef.current || !visible) return;
    const W = mountRef.current.clientWidth || 480;
    const H = 400;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce4ed);
    scene.fog = new THREE.FogExp2(0x0a1628, 0.18);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0.1, 2.8);
    camRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(2, 3, 2); key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x4488ff, 0.35);
    fill.position.set(-2, 1, -1);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x14b8a6, 0.25);
    rim.position.set(0, -2, -2);
    scene.add(rim);

    // Ground grid
    const grid = new THREE.GridHelper(4, 20, 0x1e3a5f, 0x0f2040);
    grid.position.y = -0.75;
    scene.add(grid);

    // Build model in a group for rotation
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const meshMap = {};
    meshMapRef.current = meshMap;

    // Intercept add() to add to group instead of scene
    const origAdd = scene.add.bind(scene);
    let building = true;
    scene.add = (obj) => {
      if (building && obj instanceof THREE.Mesh) {
        group.add(obj);
      } else {
        origAdd(obj);
      }
    };

    if (isFeline) buildFelineBody(scene, meshMap);
    else buildCanineBody(scene, meshMap);

    building = false;
    scene.add = origAdd;

    group.rotation.y = rotRef.current.y;
    group.rotation.x = rotRef.current.x;

    applyColors(meshMap);

    // Animate
    let angle = rotRef.current.y;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (autoRotateRef.current && !isDrag.current && !mouseInsideRef.current && groupRef.current) {
        angle += 0.005;
        groupRef.current.rotation.y = angle;
        rotRef.current.y = angle;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, [isFeline, visible]);

  // ── Re-apply colours when exercise/diagnosis changes ─────────────────
  useEffect(() => {
    applyColors(meshMapRef.current);
  }, [exerciseCode, diagnosis]);

  // ── Auto-rotate respects the ref ─────────────────────────────────────
  useEffect(() => {
    // nothing — auto-rotate is checked inside animate loop via closure over ref
  }, [autoRotate]);

  const hoveredInfo = hovered ? MUSCLE_INFO[hovered] : null;
  const hasHighlights = exerciseData.primary.length > 0 || exerciseData.secondary.length > 0 || diagnosisStructures.length > 0;

  if (!visible) return (
    <button onClick={() => setVisible(true)} style={{
      display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:8,
      background:"var(--k9-surface)", border:"1px solid var(--k9-border)", color:"var(--k9-teal)",
      fontSize:12, fontWeight:700, cursor:"pointer", marginBottom:8
    }}>
      <FiLayers size={13}/> Show 3D Anatomy Viewer
    </button>
  );

  return (
    <div style={{ background:"#edf2f7", border:"1px solid #cbd5e1", borderRadius:12,
      padding: compact ? "12px 14px" : "16px 20px", marginBottom:12, position:"relative",
      boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>

      {/* ── Header bar ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, paddingBottom:10, borderBottom:"1px solid #cbd5e1" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {isFeline ? <TbCat size={18} style={{color:"#fff"}}/> : <TbDog size={18} style={{color:"#fff"}}/>}
          <span style={{ fontSize:13, fontWeight:800, color:"#1a2744", letterSpacing:0.8, textTransform:"uppercase" }}>
            3D Anatomy Viewer
          </span>
          <span style={{ fontSize:10, padding:"4px 12px", borderRadius:20, background: isFeline ? "#7c3aed" : "#0c4a6e",
            border:"none", color:"#ffffff", fontWeight:700, letterSpacing:0.6 }}>
            {isFeline ? "FELINE" : "CANINE"}
          </span>
          {exerciseCode && (
            <span style={{ fontSize:11, padding:"3px 10px", borderRadius:4,
              background:"#dcfce7", border:"1px solid #86efac",
              color:"#166534", fontWeight:600, letterSpacing:0.3 }}>
              {exerciseCode.replace(/_/g," ")}
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => { const next = !autoRotate; setAutoRotate(next); autoRotateRef.current = next; }}
            title={autoRotate ? "Stop rotation" : "Auto-rotate"}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 12px", borderRadius:6,
              background: autoRotate ? "#0c4a6e" : "#ffffff",
              border:`1px solid ${autoRotate ? "#0c4a6e" : "#cbd5e1"}`,
              color: autoRotate ? "#ffffff" : "#475569", fontSize:11, fontWeight:600, cursor:"pointer",
              transition:"all 0.15s" }}>
            <FiRotateCw size={12}/> Rotate
          </button>
          <button onClick={() => setClientMode(m => !m)}
            title={clientMode ? "Clinical labels" : "Owner-friendly labels"}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 12px", borderRadius:6,
              background: clientMode ? "#0c4a6e" : "#ffffff",
              border:`1px solid ${clientMode ? "#0c4a6e" : "#cbd5e1"}`,
              color: clientMode ? "#ffffff" : "#475569", fontSize:11, fontWeight:600, cursor:"pointer",
              transition:"all 0.15s" }}>
            <FiEye size={12}/> {clientMode ? "Owner" : "Clinical"}
          </button>
          <button onClick={() => setVisible(false)} style={{ display:"flex", alignItems:"center", padding:"5px 10px", borderRadius:6,
            background:"#ffffff", border:"1px solid #cbd5e1",
            color:"#475569", fontSize:11, cursor:"pointer", transition:"all 0.15s" }}>
            <FiX size={12}/>
          </button>
        </div>
      </div>

      {/* ── 3D Canvas ── */}
      <div style={{ position:"relative", borderRadius:8, overflow:"hidden", cursor: isDrag.current ? "grabbing" : "grab" }}
        onMouseEnter={() => { mouseInsideRef.current = true; }}
        onMouseLeave={() => { mouseInsideRef.current = false; setHovered(null); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
      >
        <div ref={mountRef} style={{ width:"100%", height:400 }} />

        {/* Interaction hint */}
        {!hasHighlights && (
          <div style={{ position:"absolute", bottom:12, left:0, right:0, textAlign:"center",
            color:"#64748b", fontSize:11, fontWeight:500, letterSpacing:0.3, pointerEvents:"none" }}>
            Drag to rotate &nbsp;&middot;&nbsp; Scroll to zoom &nbsp;&middot;&nbsp; Select an exercise to highlight muscles
          </div>
        )}

        {/* Hover tooltip — full clinical atlas data */}
        {hoveredInfo && (
          <div style={{ position:"absolute", bottom:10, left:10, right:10, padding:"12px 16px",
            background:"rgba(5,15,30,0.97)", borderRadius:10,
            border:"1px solid var(--k9-teal)", pointerEvents:"none",
            boxShadow:"0 4px 24px rgba(0,0,0,0.7), 0 0 12px rgba(20,184,166,0.1)" }}>
            {/* Structure name */}
            <div style={{ fontSize:13, fontWeight:800, color:"var(--k9-teal)", marginBottom:6, letterSpacing:0.3 }}>
              {hoveredInfo.label}
            </div>
            {clientMode ? (
              /* Owner-friendly view */
              <div style={{ fontSize:12, color:"#e2e8f0", lineHeight:1.7 }}>{hoveredInfo.plain}</div>
            ) : (
              /* Clinical view — full atlas data */
              <div style={{ display:"grid", gridTemplateColumns:"72px 1fr", gap:"4px 10px", fontSize:11, lineHeight:1.7 }}>
                {hoveredInfo.origin && (<><span style={{color:"#64748b",fontWeight:700,textTransform:"uppercase",fontSize:9,letterSpacing:0.5}}>Origin</span><span style={{color:"#cbd5e1"}}>{hoveredInfo.origin}</span></>)}
                {hoveredInfo.insertion && (<><span style={{color:"#64748b",fontWeight:700,textTransform:"uppercase",fontSize:9,letterSpacing:0.5}}>Insertion</span><span style={{color:"#cbd5e1"}}>{hoveredInfo.insertion}</span></>)}
                {hoveredInfo.action && (<><span style={{color:"#64748b",fontWeight:700,textTransform:"uppercase",fontSize:9,letterSpacing:0.5}}>Action</span><span style={{color:"#f1f5f9",fontWeight:600}}>{hoveredInfo.action}</span></>)}
                {hoveredInfo.nerve && (<><span style={{color:"#64748b",fontWeight:700,textTransform:"uppercase",fontSize:9,letterSpacing:0.5}}>Nerve</span><span style={{color:"#a78bfa"}}>{hoveredInfo.nerve}</span></>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      {hasHighlights && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(30,58,95,0.6)" }}>
          {/* Color key row */}
          <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:8 }}>
            {exerciseData.primary.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:"#14b8a6", boxShadow:"0 0 6px rgba(20,184,166,0.4)" }}/>
                <span style={{ fontSize:11, color:"#e2e8f0", fontWeight:700 }}>Primary Target</span>
                <span style={{ fontSize:10, color:"#64748b" }}>({exerciseData.primary.length} structures)</span>
              </div>
            )}
            {exerciseData.secondary.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:"#f59e0b", boxShadow:"0 0 6px rgba(245,158,11,0.4)" }}/>
                <span style={{ fontSize:11, color:"#e2e8f0", fontWeight:700 }}>Secondary</span>
                <span style={{ fontSize:10, color:"#64748b" }}>({exerciseData.secondary.length} structures)</span>
              </div>
            )}
            {diagnosisStructures.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:"#ef4444", boxShadow:"0 0 6px rgba(239,68,68,0.4)" }}/>
                <span style={{ fontSize:11, color:"#e2e8f0", fontWeight:700 }}>Surgical Site</span>
              </div>
            )}
            <span style={{ marginLeft:"auto", fontSize:10, color:"#475569" }}>
              Drag to rotate &middot; Scroll to zoom
            </span>
          </div>
          {/* Muscle names — wrapped tags */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {[...new Set(exerciseData.primary)].map(id => (
              <span key={id} style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:4,
                background:"rgba(20,184,166,0.12)", border:"1px solid rgba(20,184,166,0.25)",
                color:"#5eead4", letterSpacing:0.2 }}>
                {MUSCLE_INFO[id]?.label || id}
              </span>
            ))}
            {[...new Set(exerciseData.secondary)].map(id => (
              <span key={id} style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:4,
                background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)",
                color:"#fbbf24", letterSpacing:0.2 }}>
                {MUSCLE_INFO[id]?.label || id}
              </span>
            ))}
          </div>
        </div>
      )}
      {!hasHighlights && (
        <div style={{ marginTop:8, textAlign:"center" }}>
          <span style={{ fontSize:10, color:"#475569" }}>Drag to rotate &middot; Scroll to zoom</span>
        </div>
      )}
    </div>
  );
}
