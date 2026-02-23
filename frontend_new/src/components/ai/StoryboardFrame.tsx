// components/ai/StoryboardFrame.tsx — Single frame renderer with dog silhouette + overlays

import React from 'react';
import StoryboardOverlays from './StoryboardOverlays';
import type { Indicator } from './StoryboardOverlays';

interface DogPose {
  body: { x: number; y: number; rotation: number };
  head: { x: number; y: number; rotation: number };
  tail: { x: number; y: number; rotation: number };
  frontLeg: { hip: { x: number; y: number }; knee: { x: number; y: number }; paw: { x: number; y: number } };
  hindLeg: { hip: { x: number; y: number }; knee: { x: number; y: number }; paw: { x: number; y: number } };
  spine: Array<{ x: number; y: number }>;
}

interface StoryboardFrameProps {
  pose: DogPose;
  indicators: Indicator[];
  visibleGroups: Record<string, boolean>;
  width?: number;
  height?: number;
  title?: string;
  showLabels?: boolean;
}

export default function StoryboardFrame({
  pose,
  indicators,
  visibleGroups,
  width = 500,
  height = 350,
  title,
  showLabels = true
}: StoryboardFrameProps) {
  const scaleX = (v: number) => (v / 100) * width;
  const scaleY = (v: number) => (v / 100) * height;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      className="storyboard-frame"
      style={{ maxHeight: '100%' }}
    >
      {/* Background */}
      <defs>
        <linearGradient id="frame-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f5fa" />
          <stop offset="100%" stopColor="#e3ecf4" />
        </linearGradient>
        <linearGradient id="floor-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d2dfea" />
          <stop offset="100%" stopColor="#c5d4e2" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#frame-bg)" rx="8" />

      {/* Floor line */}
      <rect
        x="0"
        y={height * 0.85}
        width={width}
        height={height * 0.15}
        fill="url(#floor-gradient)"
        opacity="0.5"
      />
      <line
        x1="0"
        y1={height * 0.85}
        x2={width}
        y2={height * 0.85}
        stroke="#bdd0e0"
        strokeWidth="1"
      />

      {/* Dog silhouette */}
      <DogSilhouette pose={pose} scaleX={scaleX} scaleY={scaleY} />

      {/* Clinical overlays */}
      <StoryboardOverlays
        indicators={indicators}
        visibleGroups={visibleGroups}
        width={width}
        height={height}
      />

      {/* Frame title */}
      {showLabels && title && (
        <text
          x="12"
          y="22"
          fill="#0f2f49"
          fontSize="13"
          fontWeight="700"
          fontFamily="'IBM Plex Sans', sans-serif"
        >
          {title}
        </text>
      )}
    </svg>
  );
}

// ─── Dog Silhouette SVG ───
function DogSilhouette({ pose, scaleX, scaleY }: {
  pose: DogPose;
  scaleX: (v: number) => number;
  scaleY: (v: number) => number;
}) {
  const { body, head, tail, frontLeg, hindLeg, spine } = pose;

  // Body outline path (simplified dog shape using spine + body)
  const bodyPath = buildBodyPath(spine, body, scaleX, scaleY);

  return (
    <g className="dog-silhouette" style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {/* Body */}
      <path
        d={bodyPath}
        fill="#1a3a54"
        opacity="0.12"
        stroke="#1a3a54"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Spine line */}
      <polyline
        points={spine.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
        fill="none"
        stroke="#0f4f7a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* Head */}
      <g transform={`translate(${scaleX(head.x)}, ${scaleY(head.y)}) rotate(${head.rotation})`}>
        <ellipse rx="18" ry="14" fill="#1a3a54" opacity="0.15" />
        <ellipse rx="18" ry="14" fill="none" stroke="#0f4f7a" strokeWidth="2" opacity="0.7" />
        {/* Ear */}
        <ellipse cx="-10" cy="-12" rx="6" ry="10" fill="#1a3a54" opacity="0.1"
          stroke="#0f4f7a" strokeWidth="1.5" opacity-stroke="0.5"
          transform="rotate(-20)" />
        {/* Eye */}
        <circle cx="6" cy="-2" r="2.5" fill="#0f4f7a" opacity="0.6" />
        {/* Nose */}
        <ellipse cx="16" cy="2" rx="3" ry="2.5" fill="#0f4f7a" opacity="0.5" />
      </g>

      {/* Tail */}
      <g transform={`translate(${scaleX(tail.x)}, ${scaleY(tail.y)})`}>
        <path
          d={`M 0 0 Q ${8 + tail.rotation * 0.3} ${-15 + tail.rotation * 0.2} ${5 + tail.rotation * 0.5} ${-25}`}
          fill="none"
          stroke="#0f4f7a"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* Front leg */}
      <Leg
        hip={frontLeg.hip}
        knee={frontLeg.knee}
        paw={frontLeg.paw}
        scaleX={scaleX}
        scaleY={scaleY}
        label="FL"
      />

      {/* Hind leg */}
      <Leg
        hip={hindLeg.hip}
        knee={hindLeg.knee}
        paw={hindLeg.paw}
        scaleX={scaleX}
        scaleY={scaleY}
        label="HL"
      />

      {/* Joint markers */}
      <JointMarker x={scaleX(frontLeg.hip.x)} y={scaleY(frontLeg.hip.y)} label="Shoulder" />
      <JointMarker x={scaleX(frontLeg.knee.x)} y={scaleY(frontLeg.knee.y)} label="Elbow" />
      <JointMarker x={scaleX(hindLeg.hip.x)} y={scaleY(hindLeg.hip.y)} label="Hip" />
      <JointMarker x={scaleX(hindLeg.knee.x)} y={scaleY(hindLeg.knee.y)} label="Stifle" />
    </g>
  );
}

function Leg({ hip, knee, paw, scaleX, scaleY }: {
  hip: { x: number; y: number };
  knee: { x: number; y: number };
  paw: { x: number; y: number };
  scaleX: (v: number) => number;
  scaleY: (v: number) => number;
  label: string;
}) {
  return (
    <g className="dog-leg">
      {/* Upper leg */}
      <line
        x1={scaleX(hip.x)} y1={scaleY(hip.y)}
        x2={scaleX(knee.x)} y2={scaleY(knee.y)}
        stroke="#0f4f7a"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Lower leg */}
      <line
        x1={scaleX(knee.x)} y1={scaleY(knee.y)}
        x2={scaleX(paw.x)} y2={scaleY(paw.y)}
        stroke="#0f4f7a"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Paw */}
      <ellipse
        cx={scaleX(paw.x)}
        cy={scaleY(paw.y)}
        rx="5"
        ry="3"
        fill="#0f4f7a"
        opacity="0.3"
      />
    </g>
  );
}

function JointMarker({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g className="joint-marker">
      <circle cx={x} cy={y} r="4" fill="none" stroke="#1f7aaa" strokeWidth="1.5" opacity="0.5" />
      <circle cx={x} cy={y} r="1.5" fill="#1f7aaa" opacity="0.6" />
    </g>
  );
}

function buildBodyPath(
  spine: Array<{ x: number; y: number }>,
  body: { x: number; y: number; rotation: number },
  scaleX: (v: number) => number,
  scaleY: (v: number) => number
): string {
  if (spine.length < 2) return '';

  const bodyWidth = 14;
  const topPoints = spine.map(p => `${scaleX(p.x)},${scaleY(p.y) - bodyWidth}`);
  const bottomPoints = [...spine].reverse().map(p => `${scaleX(p.x)},${scaleY(p.y) + bodyWidth}`);

  return `M ${topPoints[0]} ${topPoints.slice(1).map(p => `L ${p}`).join(' ')} ${bottomPoints.map(p => `L ${p}`).join(' ')} Z`;
}
