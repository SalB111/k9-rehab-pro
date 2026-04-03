import React, { lazy, Suspense } from "react";

const ProgressChart = lazy(() => import("./charts/ProgressChart"));
const ComparisonTable = lazy(() => import("./charts/ComparisonTable"));
const GaugeMetric = lazy(() => import("./charts/GaugeMetric"));
const TimelineView = lazy(() => import("./charts/TimelineView"));
const FlowchartView = lazy(() => import("./charts/FlowchartView"));

const CHART_LOADING = (
  <div style={{ padding: 20, textAlign: "center", color: "#6a737d", fontSize: 12 }}>
    Loading chart...
  </div>
);

/**
 * Renders a diagram based on its type.
 * Receives parsed JSON from :::diagram blocks in B.E.A.U. responses.
 */
export default function DiagramRenderer({ diagram }) {
  if (!diagram || !diagram.type) return null;

  return (
    <div style={{ margin: "12px 0", borderRadius: 10, overflow: "hidden", border: "1px solid var(--k9-border)", background: "var(--k9-surface)" }}>
      <Suspense fallback={CHART_LOADING}>
        {renderByType(diagram)}
      </Suspense>
    </div>
  );
}

function renderByType(d) {
  switch (d.type) {
    case "line_chart":
    case "bar_chart":
      return <ProgressChart diagram={d} />;
    case "comparison_table":
      return <ComparisonTable diagram={d} />;
    case "gauge":
      return <GaugeMetric diagram={d} />;
    case "timeline":
      return <TimelineView diagram={d} />;
    case "flowchart":
    case "decision_tree":
      return <FlowchartView diagram={d} />;
    default:
      return <div style={{ padding: 12, color: "#A32D2D", fontSize: 12 }}>Unknown diagram type: {d.type}</div>;
  }
}
