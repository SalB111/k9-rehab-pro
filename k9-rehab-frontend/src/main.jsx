import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.jsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";

/**
 * The client app moved to B.E.A.U. at Home (beauaihome, /programme).
 *
 * /home is kept as a redirect rather than a second copy: two implementations of
 * a clinical screen drift, and the one a client is actually using would stop
 * being the one under test. Anyone with an old link lands in the right place.
 */
if (window.location.pathname.replace(/\/+$/, "") === "/home") {
  window.location.replace(
    import.meta.env.VITE_BEAU_HOME_URL || "https://beauaihome.vercel.app/programme"
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
