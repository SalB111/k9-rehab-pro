import React, { useState, useMemo } from "react";
import { UWTM_DEPTH_LEVELS, getBuoyancyLoad, kgToLb, lbToKg } from "../data/calculatorFormulas";
import "./rehab-calculators.css";

export default function BuoyancyCalc() {
  const [unit, setUnit] = useState("kg");
  const [weight, setWeight] = useState("");
  const [depth, setDepth] = useState("stifle");

  const weightKg = useMemo(() => {
    const n = parseFloat(weight);
    if (!n || n <= 0) return 0;
    return unit === "kg" ? n : lbToKg(n);
  }, [weight, unit]);

  const load = weightKg > 0 ? getBuoyancyLoad(weightKg, depth) : null;

  return (
    <div className="rehab-calc">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-navy">UWTM Buoyancy / Effective Weight-Bearing</h2>
          <p className="text-sm text-slate-600 mt-1">Underwater treadmill water depth → % weight-bearing & effective load.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Body Weight</label>
            <div className="flex gap-2">
              <input
                type="number" step="0.1" min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input flex-1"
                placeholder="0.0"
              />
              <div className="flex rounded-lg border border-borderClr overflow-hidden">
                <button type="button" onClick={() => setUnit("kg")} className={`px-3 text-xs font-semibold ${unit === "kg" ? "bg-navyMid text-white" : "bg-white text-slate-600"}`}>kg</button>
                <button type="button" onClick={() => setUnit("lb")} className={`px-3 text-xs font-semibold ${unit === "lb" ? "bg-navyMid text-white" : "bg-white text-slate-600"}`}>lb</button>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Water Depth</label>
            <select value={depth} onChange={(e) => setDepth(e.target.value)} className="select">
              {UWTM_DEPTH_LEVELS.map((d) => (
                <option key={d.level} value={d.level}>
                  {d.label} — {d.pctWeightBearing}% WB
                </option>
              ))}
            </select>
          </div>
        </div>

        {load && (
          <div className="result-primary">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Weight-Bearing</div>
                <div className="text-3xl font-bold text-teal">{load.pct}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Effective Load</div>
                <div className="text-3xl font-bold text-navy">{load.effectiveKg} <span className="text-sm font-normal text-slate-500">kg</span></div>
                <div className="text-xs text-slate-500 mt-0.5">{kgToLb(load.effectiveKg)} lb</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unloaded</div>
                <div className="text-3xl font-bold text-green">{load.unloadedKg} <span className="text-sm font-normal text-slate-500">kg</span></div>
                <div className="text-xs text-slate-500 mt-0.5">{kgToLb(load.unloadedKg)} lb removed</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic mt-4 pt-3 border-t border-teal/20">
              {UWTM_DEPTH_LEVELS.find((d) => d.level === depth)?.note}
            </p>
          </div>
        )}

        <div className="card !p-4">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Reference Table</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-borderClr">
                <th className="text-left py-1.5 font-semibold text-slate-600">Depth</th>
                <th className="text-right py-1.5 font-semibold text-slate-600">% WB</th>
                <th className="text-left py-1.5 pl-4 font-semibold text-slate-600">Clinical Use</th>
              </tr>
            </thead>
            <tbody>
              {UWTM_DEPTH_LEVELS.map((d) => (
                <tr key={d.level} className={`border-b border-borderClr/50 ${d.level === depth ? "bg-teal/5" : ""}`}>
                  <td className="py-1.5 text-slate-800">{d.label}</td>
                  <td className="py-1.5 text-right font-mono font-bold text-navy">{d.pctWeightBearing}%</td>
                  <td className="py-1.5 pl-4 text-slate-600 italic">{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500 italic border-t border-borderClr pt-3">
          Source: Levine D, Millis DL. Aquatic therapy. In: Canine Rehabilitation and Physical Therapy, 2nd ed., Ch. 27.
        </p>
      </div>
    </div>
  );
}
