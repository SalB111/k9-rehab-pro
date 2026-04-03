import React from "react";

const NODE_COLORS = {
  decision: { bg: "#0EA5E920", border: "#0EA5E9", text: "#0EA5E9" },
  action: { bg: "#1D9E7520", border: "#1D9E75", text: "#1D9E75" },
  alert: { bg: "#A32D2D20", border: "#A32D2D", text: "#A32D2D" },
  default: { bg: "var(--k9-bg)", border: "var(--k9-border)", text: "var(--k9-text)" },
};

/**
 * Simple CSS-based flowchart renderer.
 * Uses a tree layout — no React Flow dependency needed for basic decision trees.
 * React Flow is available for complex interactive diagrams in future.
 */
export default function FlowchartView({ diagram }) {
  const { title, nodes = [], edges = [] } = diagram;

  // Build adjacency from edges
  const children = {};
  const edgeLabels = {};
  const parentSet = new Set();
  const childSet = new Set();

  for (const edge of edges) {
    if (!children[edge.from]) children[edge.from] = [];
    children[edge.from].push(edge.to);
    edgeLabels[`${edge.from}-${edge.to}`] = edge.label || "";
    parentSet.add(edge.from);
    childSet.add(edge.to);
  }

  // Find root nodes (nodes that are parents but not children)
  const roots = nodes.filter(n => parentSet.has(n.id) && !childSet.has(n.id));
  if (roots.length === 0 && nodes.length > 0) roots.push(nodes[0]);

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--k9-text)", marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {roots.map(root => (
          <FlowNode
            key={root.id}
            node={root}
            nodeMap={nodeMap}
            children={children}
            edgeLabels={edgeLabels}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}

function FlowNode({ node, nodeMap, children: childrenMap, edgeLabels, depth }) {
  const colors = NODE_COLORS[node.type] || NODE_COLORS.default;
  const kids = childrenMap[node.id] || [];
  const isDecision = node.type === "decision";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Node box */}
      <div style={{
        padding: "8px 16px",
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: isDecision ? "8px 8px 8px 8px" : 8,
        color: colors.text,
        fontSize: 12,
        fontWeight: 600,
        textAlign: "center",
        maxWidth: 220,
        transform: isDecision ? "rotate(0deg)" : "none",
        position: "relative",
      }}>
        {isDecision && <span style={{ fontSize: 10, opacity: 0.6, display: "block", marginBottom: 2 }}>?</span>}
        {node.label}
      </div>

      {/* Children */}
      {kids.length > 0 && (
        <>
          {/* Connector line down */}
          <div style={{ width: 2, height: 16, background: "var(--k9-border)" }} />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {kids.map(childId => {
              const childNode = nodeMap[childId];
              if (!childNode) return null;
              const edgeLabel = edgeLabels[`${node.id}-${childId}`];

              return (
                <div key={childId} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Edge label */}
                  {edgeLabel && (
                    <div style={{
                      fontSize: 10, color: "var(--k9-text-light)", fontWeight: 500,
                      marginBottom: 4, padding: "1px 6px",
                      background: "var(--k9-bg)", borderRadius: 4,
                      border: "1px solid var(--k9-border)",
                    }}>
                      {edgeLabel}
                    </div>
                  )}
                  {/* Connector */}
                  <div style={{ width: 2, height: 10, background: "var(--k9-border)" }} />
                  {/* Recurse (max depth 3 to prevent infinite loops) */}
                  {depth < 3 ? (
                    <FlowNode
                      node={childNode}
                      nodeMap={nodeMap}
                      children={childrenMap}
                      edgeLabels={edgeLabels}
                      depth={depth + 1}
                    />
                  ) : (
                    <div style={{
                      padding: "6px 12px", background: "var(--k9-bg)",
                      border: "1px solid var(--k9-border)", borderRadius: 6,
                      fontSize: 11, color: "var(--k9-text-light)",
                    }}>
                      {childNode.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
