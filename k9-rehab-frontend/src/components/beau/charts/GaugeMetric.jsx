import React from "react";

export default function GaugeMetric({ diagram }) {
  const { title, value, max = 10, thresholds = [] } = diagram;
  const pct = Math.min(value / max, 1);
  const angle = pct * 180; // 0-180 degree arc

  // Determine color from thresholds
  let color = "#1D9E75";
  let label = "";
  for (const t of thresholds.sort((a, b) => a.value - b.value)) {
    if (value <= t.value) {
      color = t.color || color;
      label = t.label || "";
      break;
    }
    color = t.color || color;
    label = t.label || "";
  }

  const r = 80;
  const cx = 100;
  const cy = 95;
  const startAngle = Math.PI;
  const endAngle = startAngle - (angle * Math.PI / 180);
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy - r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy - r * Math.sin(endAngle);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--k9-text)", marginBottom: 8 }}>
        {title}
      </div>
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="var(--k9-border)" strokeWidth="12" strokeLinecap="round"
        />
        {/* Value arc */}
        {angle > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          />
        )}
        {/* Value text */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>
          {value}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="var(--k9-text-light)">
          / {max}
        </text>
      </svg>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: 4 }}>{label}</div>
      )}
    </div>
  );
}
