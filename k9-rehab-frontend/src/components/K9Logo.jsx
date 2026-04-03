import React from "react";

/**
 * K9 Rehab Pro — Custom Rod of Asclepius with Wings
 * Single snake, winged rod, futuristic sci-fi medical aesthetic
 * Designed for Salvatore Bonanno / K9 Rehab Pro
 */
export default function K9Logo({ size = 120, glow = true, className = "" }) {
  const s = size;
  const glowId = `k9-glow-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: glow ? `drop-shadow(0 0 12px rgba(29,158,117,0.4))` : "none" }}
    >
      <defs>
        {/* Neon glow gradient */}
        <linearGradient id={`${glowId}-rod`} x1="100" y1="30" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="50%" stopColor="#1D9E75" />
          <stop offset="100%" stopColor="#0F4C81" />
        </linearGradient>
        <linearGradient id={`${glowId}-snake`} x1="70" y1="50" x2="130" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D9E75" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
        <linearGradient id={`${glowId}-wing`} x1="30" y1="50" x2="170" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E940" />
          <stop offset="50%" stopColor="#1D9E7580" />
          <stop offset="100%" stopColor="#0EA5E940" />
        </linearGradient>
        {/* Outer glow filter */}
        <filter id={`${glowId}-filter`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>

      {/* Background circle (subtle) */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="#1D9E7512" strokeWidth="1" />
      <circle cx="100" cy="100" r="85" fill="none" stroke="#0EA5E908" strokeWidth="0.5" />

      {/* Wings — stylized, angular, sci-fi */}
      {/* Left wing */}
      <path
        d="M98 52 C85 42, 55 28, 22 38 C35 42, 50 46, 65 52 C50 44, 30 36, 12 46 C30 48, 52 50, 72 56 C55 52, 38 46, 18 54 C40 54, 60 55, 78 58"
        stroke={`url(#${glowId}-wing)`}
        strokeWidth="1.5"
        fill={`url(#${glowId}-wing)`}
        opacity="0.6"
      />
      {/* Right wing */}
      <path
        d="M102 52 C115 42, 145 28, 178 38 C165 42, 150 46, 135 52 C150 44, 170 36, 188 46 C170 48, 148 50, 128 56 C145 52, 162 46, 182 54 C160 54, 140 55, 122 58"
        stroke={`url(#${glowId}-wing)`}
        strokeWidth="1.5"
        fill={`url(#${glowId}-wing)`}
        opacity="0.6"
      />

      {/* Rod — central vertical staff */}
      <line
        x1="100" y1="42" x2="100" y2="172"
        stroke={`url(#${glowId}-rod)`}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Rod top ornament — diamond */}
      <path
        d="M100 32 L106 42 L100 48 L94 42 Z"
        fill="#1D9E75"
        stroke="#0EA5E9"
        strokeWidth="0.8"
      />
      {/* Rod base */}
      <line x1="90" y1="172" x2="110" y2="172" stroke="#0F4C81" strokeWidth="3" strokeLinecap="round" />

      {/* Snake — single serpent coiling up the rod */}
      <path
        d="M100 165
           C115 160, 128 148, 122 138
           C116 128, 100 130, 100 130
           C100 130, 84 128, 78 118
           C72 108, 85 100, 100 100
           C115 100, 128 92, 122 82
           C116 72, 100 74, 100 74
           C100 74, 84 72, 80 65
           C76 58, 88 52, 100 55"
        stroke={`url(#${glowId}-snake)`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* Snake head */}
      <circle cx="100" cy="54" r="4" fill="#1D9E75" />
      <circle cx="98" cy="52" r="1" fill="#fff" opacity="0.8" />
      {/* Snake tongue */}
      <path d="M104 54 L110 50 M104 54 L110 57" stroke="#0EA5E9" strokeWidth="0.8" strokeLinecap="round" />

      {/* Glow accents on coil crossings */}
      <circle cx="122" cy="138" r="2" fill="#1D9E75" opacity="0.5" />
      <circle cx="78" cy="118" r="2" fill="#0EA5E9" opacity="0.5" />
      <circle cx="122" cy="82" r="2" fill="#1D9E75" opacity="0.5" />
      <circle cx="80" cy="65" r="2" fill="#0EA5E9" opacity="0.5" />

      {/* Tech ring accents */}
      <circle cx="100" cy="100" r="78" fill="none" stroke="#1D9E7515" strokeWidth="0.5" strokeDasharray="4 8" />
    </svg>
  );
}
