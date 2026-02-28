import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeCtx = createContext({ theme: "clinical_light", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem("k9-theme") || "clinical_dark"; }
    catch { return "clinical_dark"; }
  });

  const setTheme = (t) => {
    setThemeState(t);
    try { localStorage.setItem("k9-theme", t); } catch {}
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "clinical_dark") {
      root.classList.add("dark");
      root.classList.remove("high-contrast");
    } else if (theme === "high_contrast") {
      root.classList.add("dark", "high-contrast");
    } else {
      root.classList.remove("dark", "high-contrast");
    }
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
