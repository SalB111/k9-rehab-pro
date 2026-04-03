import React from "react";

export default function ComparisonTable({ diagram }) {
  const { title, columns, rows } = diagram;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--k9-text)", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {(columns || []).map((col, i) => (
                <th key={i} style={{
                  padding: "8px 12px", textAlign: "left", fontWeight: 600,
                  background: "var(--k9-bg)", borderBottom: "2px solid var(--k9-teal)",
                  color: "var(--k9-text)", whiteSpace: "nowrap",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((row, ri) => (
              <tr key={ri}>
                {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "7px 12px",
                    borderBottom: "1px solid var(--k9-border)",
                    color: "var(--k9-text)",
                    background: ri % 2 === 1 ? "var(--k9-bg)" : "transparent",
                    fontWeight: ci === 0 ? 600 : 400,
                  }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
