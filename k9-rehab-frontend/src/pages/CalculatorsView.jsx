import React, { useState } from "react";
import BuoyancyCalc from "../components/BuoyancyCalc";
import DailyMonitorTracker from "../components/DailyMonitorTracker";

const TABS = [
  { id: "buoyancy", label: "UWTM Buoyancy" },
  { id: "monitor", label: "Daily Monitor" },
];

export default function CalculatorsView({ setView }) {
  const [tab, setTab] = useState("buoyancy");

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--k9-text,#0F172A)]">Calculators</h1>
        <p className="text-sm text-[var(--k9-text-muted,#475569)] mt-1">
          Clinical decision tools — underwater treadmill buoyancy and daily patient monitoring.
        </p>
      </header>

      <nav className="flex gap-2 border-b border-[var(--k9-border,#E2E8F0)] mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "text-[#0EA5E9] border-b-2 border-[#0EA5E9] -mb-px"
                : "text-[var(--k9-text-muted,#475569)] hover:text-[var(--k9-text,#0F172A)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "buoyancy" && <BuoyancyCalc />}
      {tab === "monitor" && <DailyMonitorTracker />}
    </div>
  );
}
