// components/ai/StoryboardOverlays.tsx — SVG overlay components for clinical annotations

import React from 'react';

export interface Indicator {
  type: string;
  x: number;
  y: number;
  label: string;
  color: string;
  angleStart?: number;
  angleEnd?: number;
  dx?: number;
  dy?: number;
  region?: string;
  rx?: number;
  ry?: number;
}

interface OverlayProps {
  indicators: Indicator[];
  visibleGroups: Record<string, boolean>;
  width: number;
  height: number;
  opacity?: number;
}

// Map indicator types to overlay group names
const TYPE_TO_GROUP: Record<string, string> = {
  flexion_arc: 'joint_angles',
  extension_arc: 'joint_angles',
  force_vector: 'arrows',
  muscle_highlight: 'arrows',
  joint_pivot: 'joint_angles',
  hand_placement: 'good_form'
};

export default function StoryboardOverlays({
  indicators,
  visibleGroups,
  width,
  height,
  opacity = 1
}: OverlayProps) {
  if (!indicators || indicators.length === 0) return null;

  const scaleX = (v: number) => (v / 100) * width;
  const scaleY = (v: number) => (v / 100) * height;

  return (
    <g className="storyboard-overlays" opacity={opacity}>
      {indicators.map((ind, i) => {
        const group = TYPE_TO_GROUP[ind.type] || 'arrows';
        if (!visibleGroups[group]) return null;

        switch (ind.type) {
          case 'flexion_arc':
          case 'extension_arc':
            return <ArcOverlay key={i} ind={ind} scaleX={scaleX} scaleY={scaleY} />;
          case 'force_vector':
            return <ForceVectorOverlay key={i} ind={ind} scaleX={scaleX} scaleY={scaleY} />;
          case 'muscle_highlight':
            return <MuscleHighlightOverlay key={i} ind={ind} scaleX={scaleX} scaleY={scaleY} />;
          case 'joint_pivot':
            return <JointPivotOverlay key={i} ind={ind} scaleX={scaleX} scaleY={scaleY} />;
          case 'hand_placement':
            return <HandPlacementOverlay key={i} ind={ind} scaleX={scaleX} scaleY={scaleY} />;
          default:
            return null;
        }
      })}
    </g>
  );
}

// ─── Arc (Flexion/Extension) ───
function ArcOverlay({ ind, scaleX, scaleY }: {
  ind: Indicator;
  scaleX: (v: number) => number;
  scaleY: (v: number) => number;
}) {
  const cx = scaleX(ind.x);
  const cy = scaleY(ind.y);
  const r = 28;
  const startAngle = ((ind.angleStart || 0) * Math.PI) / 180;
  const endAngle = ((ind.angleEnd || 90) * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy - r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy - r * Math.sin(endAngle);

  const largeArc = Math.abs((ind.angleEnd || 90) - (ind.angleStart || 0)) > 180 ? 1 : 0;
  const sweep = (ind.angleEnd || 90) > (ind.angleStart || 0) ? 0 : 1;

  return (
    <g className="overlay-arc">
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`}
        fill="none"
        stroke={ind.color}
        strokeWidth="2.5"
        strokeDasharray="6,3"
        opacity="0.85"
      />
      {/* Center pivot */}
      <circle cx={cx} cy={cy} r="3" fill={ind.color} opacity="0.7" />
      {/* Label */}
      <text
        x={cx + r + 6}
        y={cy - 4}
        fill={ind.color}
        fontSize="10"
        fontWeight="600"
        fontFamily="'IBM Plex Sans', sans-serif"
      >
        {ind.label}
      </text>
    </g>
  );
}

// ─── Force Vector (Arrow) ───
function ForceVectorOverlay({ ind, scaleX, scaleY }: {
  ind: Indicator;
  scaleX: (v: number) => number;
  scaleY: (v: number) => number;
}) {
  const x1 = scaleX(ind.x);
  const y1 = scaleY(ind.y);
  const x2 = scaleX(ind.x + (ind.dx || 0));
  const y2 = scaleY(ind.y + (ind.dy || 0));
  const arrowId = `arrow-${ind.x}-${ind.y}-${ind.dx}-${ind.dy}`;

  return (
    <g className="overlay-vector">
      <defs>
        <marker
          id={arrowId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={ind.color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={ind.color}
        strokeWidth="2.5"
        markerEnd={`url(#${arrowId})`}
        opacity="0.85"
      />
      <text
        x={(x1 + x2) / 2 + 8}
        y={(y1 + y2) / 2 - 6}
        fill={ind.color}
        fontSize="9"
        fontWeight="600"
        fontFamily="'IBM Plex Sans', sans-serif"
      >
        {ind.label}
      </text>
    </g>
  );
}

// ─── Muscle Highlight ───
function MuscleHighlightOverlay({ ind, scaleX, scaleY }: {
  ind: Indicator;
  scaleX: (v: number) => number;
  scaleY: (v: number) => number;
}) {
  return (
    <g className="overlay-muscle">
      <ellipse
        cx={scaleX(ind.x)}
        cy={scaleY(ind.y)}
        rx={scaleX(ind.rx || 10)}
        ry={scaleY(ind.ry || 15)}
        fill={ind.color}
        opacity="0.25"
        stroke={ind.color}
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <text
        x={scaleX(ind.x)}
        y={scaleY(ind.y) + 4}
        fill={ind.color}
        fontSize="9"
        fontWeight="600"
        textAnchor="middle"
        fontFamily="'IBM Plex Sans', sans-serif"
        opacity="0.9"
      >
        {ind.label}
      </text>
    </g>
  );
}

// ─── Joint Pivot ───
function JointPivotOverlay({ ind, scaleX, scaleY }: {
  ind: Indicator;
  scaleX: (v: number) => number;
  scaleY: (v: number) => number;
}) {
  return (
    <g className="overlay-pivot">
      <circle
        cx={scaleX(ind.x)}
        cy={scaleY(ind.y)}
        r="5"
        fill="none"
        stroke={ind.color}
        strokeWidth="2"
        opacity="0.8"
      />
      <circle
        cx={scaleX(ind.x)}
        cy={scaleY(ind.y)}
        r="2"
        fill={ind.color}
        opacity="0.9"
      />
      {ind.label && (
        <text
          x={scaleX(ind.x) + 8}
          y={scaleY(ind.y) - 8}
          fill={ind.color}
          fontSize="9"
          fontWeight="600"
          fontFamily="'IBM Plex Sans', sans-serif"
        >
          {ind.label}
        </text>
      )}
    </g>
  );
}

// ─── Hand Placement ───
function HandPlacementOverlay({ ind, scaleX, scaleY }: {
  ind: Indicator;
  scaleX: (v: number) => number;
  scaleY: (v: number) => number;
}) {
  const cx = scaleX(ind.x);
  const cy = scaleY(ind.y);

  return (
    <g className="overlay-hand">
      {/* Hand icon (simplified) */}
      <circle cx={cx} cy={cy} r="8" fill={ind.color} opacity="0.2" />
      <circle cx={cx} cy={cy} r="4" fill="none" stroke={ind.color} strokeWidth="1.5" opacity="0.7" />
      {/* Crosshair */}
      <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={ind.color} strokeWidth="1" opacity="0.5" />
      <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke={ind.color} strokeWidth="1" opacity="0.5" />
      <text
        x={cx + 12}
        y={cy + 4}
        fill={ind.color}
        fontSize="9"
        fontWeight="600"
        fontFamily="'IBM Plex Sans', sans-serif"
      >
        {ind.label}
      </text>
    </g>
  );
}
