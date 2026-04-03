import React from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#1D9E75", "#0EA5E9", "#BA7517", "#A32D2D", "#8B5CF6", "#1A5F8A"];

export default function ProgressChart({ diagram }) {
  const { type, title, xAxis, categories, series } = diagram;

  // Build data array for Recharts
  const labels = xAxis || categories || [];
  const data = labels.map((label, i) => {
    const point = { name: label };
    (series || []).forEach(s => {
      point[s.name] = s.data?.[i] ?? null;
    });
    return point;
  });

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--k9-text)", marginBottom: 12 }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        {type === "bar_chart" ? (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--k9-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--k9-text-light)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--k9-text-light)" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--k9-border)" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {(series || []).map((s, i) => (
              <Bar key={s.name} dataKey={s.name} fill={s.color || COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--k9-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--k9-text-light)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--k9-text-light)" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--k9-border)" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {(series || []).map((s, i) => (
              <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color || COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
