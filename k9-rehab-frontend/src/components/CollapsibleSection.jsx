import React, { useState, useRef, useEffect } from "react";
import { FiChevronRight } from "react-icons/fi";
import C from "../constants/colors";

/**
 * CollapsibleSection — Reusable collapsible panel for progressive disclosure.
 * Props:
 *   title       — Section heading text
 *   icon        — Optional React icon component
 *   defaultOpen — Start expanded (default: false)
 *   badge       — Optional status text (e.g., "3 selected", "2/5 filled")
 *   badgeColor  — Badge text color (default: C.teal)
 *   children    — Content to show/hide
 */
export default function CollapsibleSection({ title, icon: Icon, defaultOpen = false, badge, badgeColor, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [maxH, setMaxH] = useState(defaultOpen ? "none" : "0px");

  useEffect(() => {
    if (open) {
      // Measure real height then set it for transition
      const el = contentRef.current;
      if (el) {
        setMaxH(el.scrollHeight + "px");
        // After transition, remove maxHeight so content can resize naturally
        const t = setTimeout(() => setMaxH("none"), 300);
        return () => clearTimeout(t);
      }
    } else {
      // Collapse: first set explicit height for transition start
      const el = contentRef.current;
      if (el) {
        setMaxH(el.scrollHeight + "px");
        // Force reflow, then collapse
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setMaxH("0px"));
        });
      }
    }
  }, [open]);

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header — clickable toggle */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          padding: "8px 0", userSelect: "none",
          borderBottom: open ? "none" : `1px solid ${C.border}`,
        }}
      >
        <FiChevronRight
          size={14}
          style={{
            color: C.teal, flexShrink: 0,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
        {Icon && <Icon size={13} style={{ color: C.teal, flexShrink: 0 }} />}
        <span style={{
          fontSize: 11, fontWeight: 700, color: C.teal,
          textTransform: "uppercase", letterSpacing: "1px", flex: 1,
        }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: badgeColor || C.teal,
            background: "rgba(14,165,233,0.08)", padding: "2px 10px",
            borderRadius: 10, whiteSpace: "nowrap",
          }}>
            {badge}
          </span>
        )}
        <span style={{
          fontSize: 10, fontWeight: 600, color: C.textLight,
          textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          {open ? "Collapse" : "Expand"}
        </span>
      </div>

      {/* Content — animated height */}
      <div
        ref={contentRef}
        style={{
          maxHeight: maxH,
          overflow: maxH === "none" ? "visible" : "hidden",
          transition: maxH === "none" ? "none" : "max-height 0.3s ease",
        }}
      >
        <div style={{ paddingTop: 8 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
