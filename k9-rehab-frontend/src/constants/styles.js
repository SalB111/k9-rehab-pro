// ─────────────────────────────────────────────
// MEDICAL-GRADE DESIGN SYSTEM
// Inspired by clinical EHR platforms (eVetPractice, Shepherd, IDEXX Neo)
// Typography: Inter for body, Exo 2 for brand accents
// ─────────────────────────────────────────────
import C from "./colors";

const S = {
  app: {
    display: "flex", flexDirection: "column", height: "100vh",
    fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    background: C.bg, color: C.text,
  },
  // ── TOP NAV ──
  topNav: {
    background: "#FFFFFF",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 48, flexShrink: 0,
    borderBottom: `1px solid ${C.border}`,
  },
  topNavBrand: {
    display: "flex", alignItems: "center", gap: 10,
    color: C.navy, fontFamily: "'Exo 2', 'Inter', sans-serif",
    fontSize: 15, fontWeight: 700, letterSpacing: "0.5px",
  },
  topNavLinks: {
    display: "flex", alignItems: "center", gap: 2,
  },
  topNavItem: (active) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 6, cursor: "pointer",
    fontSize: 11, fontWeight: 600,
    color: "#fff",
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
    borderBottom: active ? "2px solid #fff" : "2px solid transparent",
    boxShadow: "none",
    transition: "all 0.25s ease",
  }),
  // ── WIZARD ──
  wizardProgress: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 0, padding: "4px 32px 2px",
  },
  wizardStep: (state) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "4px 12px", fontSize: 10, fontWeight: 600,
    color: state === "done" ? C.green : C.text,
    cursor: "pointer",
    transition: "all 0.2s ease",
  }),
  wizardDot: (state) => ({
    width: 22, height: 22, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700,
    background: state === "done" ? C.green : state === "active" ? C.surface : C.bg,
    color: state === "done" ? "#fff" : C.text,
    border: state === "done" ? `1.5px solid ${C.green}` : state === "pending" ? `1.5px solid ${C.border}` : `1.5px solid ${C.text}`,
    boxShadow: "none",
    animation: "none",
    transition: "all 0.4s ease",
  }),
  wizardLine: (done) => ({
    width: 50, height: 2,
    background: done ? C.green : C.border,
    margin: "0 4px",
    boxShadow: "none",
  }),
  wizardNav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", marginTop: 8,
    borderTop: `1px solid ${C.border}`,
  },
  // ── MAIN AREA ──
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  content: { flex: 1, overflow: "auto", padding: "8px 32px 12px" },
  // ── SHARED COMPONENTS ──
  card: {
    background: C.navy, borderRadius: 10, padding: 20,
    border: `1px solid ${C.navy}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 10,
    color: "#fff",
  },
  sectionHeader: () => ({
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 16px", marginBottom: 0,
    borderBottom: "none", borderRadius: 6,
    fontSize: 12, fontWeight: 800, color: "#fff",
    textTransform: "uppercase", letterSpacing: "1.2px",
    background: C.navy,
  }),
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 20px", borderRadius: 8, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    letterSpacing: "0.2px",
    background: variant === "primary" ? C.teal : variant === "dark" ? C.navy
      : variant === "success" ? C.green : variant === "danger" ? C.red : C.bg,
    color: (variant === "primary" || variant === "dark" || variant === "success" || variant === "danger") ? "#fff" : C.textMid,
    transition: "all 0.15s",
    boxShadow: variant === "ghost" ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
  }),
  badge: (color = "blue") => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 10,
    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
    background: color === "green" ? "rgba(57,255,126,0.06)" : C.bg,
    border: color === "green" ? `1.5px solid #39FF7E` : `1.5px solid ${C.border}`,
    color: color === "green" ? "#ffffff" : C.text,
  }),
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 13,
    border: `1px solid ${C.border}`, outline: "none", boxSizing: "border-box",
    background: C.surface,
    transition: "border-color 0.15s",
  },
  select: {
    padding: "10px 12px", borderRadius: 6, fontSize: 13,
    border: `1px solid ${C.border}`, outline: "none",
    background: C.surface, cursor: "pointer",
  },
  grid: (cols = 3) => ({
    display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16,
  }),
  label: {
    fontSize: 11, fontWeight: 700, color: "#fff",
    textTransform: "uppercase", letterSpacing: "0.6px",
    marginBottom: 6, display: "block",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "10px 14px", background: C.bg,
    borderBottom: `2px solid ${C.border}`, fontSize: 10, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.8px", color: C.textLight,
  },
  td: { padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, verticalAlign: "top" },
};

export default S;
