import C from "./colors";

const S = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    background: "var(--k9-bg)",
    color: "var(--k9-text)",
    overflow: "hidden",
  },
  app: {
    display: "flex", flexDirection: "column", height: "100vh",
    fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    background: "var(--k9-bg)", color: "var(--k9-text)",
  },
  topNav: {
    background: "#FFFFFF",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 48, flexShrink: 0,
    borderBottom: "1px solid var(--k9-border)",
  },
  topNavBrand: {
    display: "flex", alignItems: "center", gap: 10,
    color: "var(--k9-navy)", fontSize: 15, fontWeight: 700, letterSpacing: "0.5px",
  },
  topNavLinks: {
    display: "flex", alignItems: "center", gap: 2,
  },
  topNavItem: (active) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 6, cursor: "pointer",
    fontSize: 11, fontWeight: 600, color: "#fff",
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
    borderBottom: active ? "2px solid #fff" : "2px solid transparent",
    transition: "all 0.25s ease",
  }),
  wizardProgress: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 0, padding: "4px 32px 2px",
  },
  wizardStep: (state) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "4px 12px", fontSize: 10, fontWeight: 600,
    color: state === "done" ? "var(--k9-green)" : "var(--k9-text)",
    cursor: "pointer", transition: "all 0.2s ease",
  }),
  wizardDot: (state) => ({
    width: 22, height: 22, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700,
    background: state === "done" ? "var(--k9-green)" : state === "active" ? "var(--k9-surface)" : "var(--k9-bg)",
    color: state === "done" ? "#fff" : "var(--k9-text)",
    border: state === "done" ? "1.5px solid var(--k9-green)" : state === "pending" ? "1.5px solid var(--k9-border)" : "1.5px solid var(--k9-text)",
    transition: "all 0.4s ease",
  }),
  wizardLine: (done) => ({
    width: 50, height: 2,
    background: done ? "var(--k9-green)" : "var(--k9-border)",
    margin: "0 4px",
  }),
  wizardNav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", marginTop: 8,
    borderTop: "1px solid var(--k9-border)",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  content: { flex: 1, overflow: "auto", padding: "8px 32px 12px" },
  card: {
    background: "var(--k9-surface)", borderRadius: 10, padding: 20,
    border: "1px solid var(--k9-border)",
    marginBottom: 10,
  },
  sectionHeader: () => ({
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 16px", marginBottom: 0,
    borderRadius: 6, fontSize: 12, fontWeight: 800,
    color: "var(--k9-navy)",
    textTransform: "uppercase", letterSpacing: "1.2px",
    background: "var(--k9-bg)",
  }),
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 20px", borderRadius: 8, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    background: variant === "primary" ? "var(--k9-teal)" : variant === "dark" ? "var(--k9-navy)"
      : variant === "success" ? "var(--k9-green)" : variant === "danger" ? "var(--k9-red)" : "var(--k9-bg)",
    color: (variant === "primary" || variant === "dark" || variant === "success" || variant === "danger") ? "#fff" : "var(--k9-text-mid)",
    transition: "all 0.15s",
  }),
  badge: (color = "blue") => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 10,
    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
    background: color === "green" ? "var(--k9-green-bg)" : "var(--k9-bg)",
    border: color === "green" ? "1.5px solid var(--k9-green)" : "1.5px solid var(--k9-border)",
    color: color === "green" ? "var(--k9-green)" : "var(--k9-text)",
  }),
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 13,
    border: "1px solid var(--k9-border)", outline: "none", boxSizing: "border-box",
    background: "var(--k9-surface)", transition: "border-color 0.15s",
  },
  select: {
    padding: "10px 12px", borderRadius: 6, fontSize: 13,
    border: "1px solid var(--k9-border)", outline: "none",
    background: "var(--k9-surface)", cursor: "pointer",
  },
  grid: (cols = 3) => ({
    display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16,
  }),
  label: {
    fontSize: 11, fontWeight: 700, color: "var(--k9-text-mid)",
    textTransform: "uppercase", letterSpacing: "0.6px",
    marginBottom: 6, display: "block",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "10px 14px", background: "var(--k9-bg)",
    borderBottom: "2px solid var(--k9-border)", fontSize: 10, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--k9-text-light)",
  },
  td: { padding: "12px 14px", borderBottom: "1px solid var(--k9-border-light)", verticalAlign: "top" },
};

export default S;
