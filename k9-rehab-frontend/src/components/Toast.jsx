import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import C from "../constants/colors";

const ToastCtx = createContext(null);

let _id = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, variant = "error", duration = 5000) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, variant }]);
    timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div style={styles.container} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.variant] }}
            onClick={() => dismiss(t.id)} role="alert">
            <span style={styles.icon}>{t.variant === "error" ? "\u2718" : t.variant === "success" ? "\u2714" : "\u26A0"}</span>
            <span style={styles.msg}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}

const styles = {
  container: {
    position: "fixed", bottom: 24, right: 24, zIndex: 99999,
    display: "flex", flexDirection: "column", gap: 8, maxWidth: 380,
  },
  toast: {
    display: "flex", alignItems: "center", gap: 10, padding: "12px 18px",
    borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500,
    cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.3)",
    animation: "toastSlide .25s ease-out",
  },
  error:   { background: C.red },
  success: { background: C.green },
  warning: { background: C.amber },
  icon: { fontSize: 16, flexShrink: 0 },
  msg:  { flex: 1 },
};
