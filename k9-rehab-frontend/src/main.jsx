import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.jsx";
import BeauHomeApp from "./pages/home/BeauHomeApp.jsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";

/**
 * /home is B.E.A.U. at Home — the client app.
 *
 * Mounted outside the clinician shell entirely: no sidebar, no clinician
 * session, no clinical vocabulary. A pet owner opening this must never land in
 * a veterinary interface, and a clinician's stored session must never grant
 * access to it — the two carry different tokens on purpose.
 */
const isClientApp = window.location.pathname.replace(/\/+$/, "") === "/home";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isClientApp ? (
        <BeauHomeApp />
      ) : (
        <ThemeProvider>
          <App />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      )}
    </ErrorBoundary>
  </React.StrictMode>
);
