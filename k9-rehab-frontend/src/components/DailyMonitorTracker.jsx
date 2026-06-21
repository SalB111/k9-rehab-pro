import React, { useState, useEffect, useMemo } from "react";
import {
  DAILY_MONITOR_FIELDS, DAILY_MONITOR_GROUPS, MONITOR_RED_FLAGS, trendDirection
} from "../data/calculatorFormulas";
import "./rehab-calculators.css";

const STORAGE_KEY = "rehab-calc-daily-monitor";

function loadLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLog(log) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); } catch {}
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyMonitorTracker() {
  const [log, setLog] = useState(loadLog);
  const [patient, setPatient] = useState("");
  const [entryDate, setEntryDate] = useState(todayISO());
  const [form, setForm] = useState({});

  useEffect(() => { saveLog(log); }, [log]);

  const patients = Object.keys(log).sort();
  const activePatient = patient.trim();
  const patientEntries = activePatient && log[activePatient] ? log[activePatient] : {};
  const sortedDates = Object.keys(patientEntries).sort().reverse();

  useEffect(() => {
    if (activePatient && patientEntries[entryDate]) {
      setForm(patientEntries[entryDate]);
    } else {
      setForm({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePatient, entryDate]);

  const setField = (id, v) => setForm((p) => ({ ...p, [id]: v }));

  const saveEntry = () => {
    if (!activePatient) { alert("Enter a patient name."); return; }
    setLog((prev) => ({
      ...prev,
      [activePatient]: {
        ...(prev[activePatient] || {}),
        [entryDate]: { ...form, savedAt: new Date().toISOString() },
      },
    }));
  };

  const deleteEntry = () => {
    if (!activePatient || !patientEntries[entryDate]) return;
    if (!confirm(`Delete ${activePatient} — ${entryDate}?`)) return;
    setLog((prev) => {
      const next = { ...prev };
      const pdata = { ...(next[activePatient] || {}) };
      delete pdata[entryDate];
      if (Object.keys(pdata).length === 0) delete next[activePatient];
      else next[activePatient] = pdata;
      return next;
    });
    setForm({});
  };

  const flags = useMemo(() => {
    return MONITOR_RED_FLAGS
      .map((rf) => (form[rf.field] != null && rf.condition(form[rf.field])) ? rf : null)
      .filter(Boolean);
  }, [form]);

  const trends = useMemo(() => {
    if (sortedDates.length < 2) return null;
    const [latest, prev] = sortedDates;
    const L = patientEntries[latest]; const P = patientEntries[prev];
    return {
      latest, prev,
      pain: trendDirection(P.pain_score, L.pain_score, true),
      lameness: trendDirection(P.lameness_grade, L.lameness_grade, true),
      activity: trendDirection(P.activity_minutes, L.activity_minutes, false),
    };
  }, [sortedDates, patientEntries]);

  return (
    <div className="rehab-calc">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-navy">Daily Monitor Tracking</h2>
          <p className="text-sm text-slate-600 mt-1">Daily clinical log for pain, lameness, activity tolerance, and recovery markers. Stored locally in your browser.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Patient</label>
            <input
              type="text"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              className="input"
              placeholder="e.g., Bella — Smith"
              list="patient-list-k9"
            />
            <datalist id="patient-list-k9">
              {patients.map((p) => <option key={p} value={p} />)}
            </datalist>
          </div>
          <div>
            <label className="label">Entry Date</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="button" onClick={saveEntry} className="btn-primary flex-1">
              {patientEntries[entryDate] ? "Update Entry" : "Save Entry"}
            </button>
            {patientEntries[entryDate] && (
              <button type="button" onClick={deleteEntry} className="btn-secondary text-red">
                Delete
              </button>
            )}
          </div>
        </div>

        {flags.length > 0 && (
          <div className="bg-redBg border border-red/40 rounded-lg p-3">
            <div className="text-xs font-bold uppercase tracking-wide text-red mb-2">⚠ Red Flags Triggered</div>
            <ul className="space-y-1 text-sm text-slate-800">
              {flags.map((f) => <li key={f.field}>• {f.message}</li>)}
            </ul>
          </div>
        )}

        {DAILY_MONITOR_GROUPS.map((group) => {
          const fields = DAILY_MONITOR_FIELDS.filter((f) => f.group === group.key);
          if (fields.length === 0) return null;
          return (
            <div key={group.key} className="card !p-4">
              <h3 className="text-sm font-bold text-navy mb-3">{group.label}</h3>
              <div className={`grid gap-4 ${group.key === "notes" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                {fields.map((f) => (
                  <FieldInput key={f.id} field={f} value={form[f.id]} onChange={(v) => setField(f.id, v)} />
                ))}
              </div>
            </div>
          );
        })}

        {trends && activePatient && (
          <div className="result-primary">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Trend: {trends.prev} → {trends.latest}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <TrendBox label="Pain" direction={trends.pain} />
              <TrendBox label="Lameness" direction={trends.lameness} />
              <TrendBox label="Activity" direction={trends.activity} />
            </div>
          </div>
        )}

        {sortedDates.length > 0 && activePatient && (
          <div className="card !p-4">
            <h3 className="text-sm font-bold text-navy mb-3">History — {activePatient} ({sortedDates.length} entries)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-borderClr">
                    <th className="text-left py-2 font-semibold text-slate-600">Date</th>
                    <th className="text-right py-2 font-semibold text-slate-600">Pain</th>
                    <th className="text-right py-2 font-semibold text-slate-600">Lameness</th>
                    <th className="text-right py-2 font-semibold text-slate-600">Weight (kg)</th>
                    <th className="text-right py-2 font-semibold text-slate-600">Activity (min)</th>
                    <th className="text-left py-2 pl-3 font-semibold text-slate-600">Tolerance</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDates.map((d) => {
                    const e = patientEntries[d];
                    return (
                      <tr
                        key={d}
                        onClick={() => setEntryDate(d)}
                        className={`border-b border-borderClr/50 cursor-pointer hover:bg-slate-50 ${d === entryDate ? "bg-teal/5" : ""}`}
                      >
                        <td className="py-1.5 font-mono text-slate-800">{d}</td>
                        <td className="py-1.5 text-right">{e.pain_score ?? "—"}</td>
                        <td className="py-1.5 text-right">{e.lameness_grade ?? "—"}</td>
                        <td className="py-1.5 text-right">{e.weight_kg ?? "—"}</td>
                        <td className="py-1.5 text-right">{e.activity_minutes ?? "—"}</td>
                        <td className="py-1.5 pl-3 text-slate-600">{e.exercise_tolerance ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(patientEntries, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${activePatient.replace(/[^a-z0-9]/gi, "_")}_monitor_log.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-secondary text-xs mt-3"
            >
              Export JSON
            </button>
          </div>
        )}

        <p className="text-[11px] text-slate-500 italic border-t border-borderClr pt-3">
          Data stored locally in this browser only. Not transmitted. Clear browser storage removes all entries.
        </p>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "number") {
    return (
      <div>
        <label className="label">{field.label}{field.unit && ` (${field.unit})`}</label>
        <input
          type="number"
          min={field.min} max={field.max} step="0.1"
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? undefined : parseFloat(v));
          }}
          className="input"
        />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        <label className="label">{field.label}</label>
        <select
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") onChange(undefined);
            else {
              const n = Number(v);
              onChange(isNaN(n) || v === "" ? v : (field.options.some((o) => o.value === n) ? n : v));
            }
          }}
          className="select"
        >
          <option value="">— Select —</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label className="label">{field.label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="input min-h-[80px]"
        placeholder="Observations, exercises performed, owner concerns..."
      />
    </div>
  );
}

function TrendBox({ label, direction }) {
  const map = {
    better:  { icon: "↓", color: "text-green", text: "Improving" },
    worse:   { icon: "↑", color: "text-red",   text: "Regression" },
    flat:    { icon: "→", color: "text-slate-500", text: "Unchanged" },
    none:    { icon: "—", color: "text-slate-400", text: "No data" },
  };
  const m = map[direction] || map.none;
  const actualText = label === "Activity"
    ? (direction === "better" ? "Improving" : direction === "worse" ? "Decreasing" : m.text)
    : m.text;
  return (
    <div className="text-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-3xl font-bold ${m.color}`}>{m.icon}</div>
      <div className="text-xs font-semibold text-slate-700">{actualText}</div>
    </div>
  );
}
