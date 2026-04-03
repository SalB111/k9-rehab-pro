import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  FiCheckCircle, FiXCircle,
  FiActivity, FiArrowRight
} from "react-icons/fi";
import { TbDog } from "react-icons/tb";
import C from "../constants/colors";
import ClinicalFooter from "../components/ClinicalFooter";

export default function DashboardView({ setView }) {
  const [patients, setPatients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/patients").catch(() => ({ data: { data: [] } })),
      api.get("/exercises").catch(() => ({ data: { data: [] } })),
      api.get("/health").then(() => true).catch(() => false),
    ]).then(([pRes, eRes, health]) => {
      setPatients(pRes.data?.data || pRes.data || []);
      setExercises(eRes.data?.data || eRes.data || []);
      setApiOk(health);
      setLoading(false);
    });
  }, []);

  const conditionCounts = patients.reduce((acc, p) => {
    if (p.condition) acc[p.condition] = (acc[p.condition] || 0) + 1;
    return acc;
  }, {});
  const conditionEntries = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-3">
        <div className="w-8 h-8 rounded-full border-[3px] border-[var(--k9-border)] border-t-[var(--k9-teal)] animate-spin" />
        <span className="text-sm font-semibold" style={{ color: C.teal }}>Loading dashboard...</span>
      </div>
    );
  }

  const STATS = [
    { label: "Active Patients", value: patients.length, icon: TbDog, color: "#1D9E75" },
    { label: "Exercise Library", value: exercises.length, icon: FiActivity, color: "#1A5F8A" },
    { label: "Unique Conditions", value: Object.keys(conditionCounts).length || "\u2014", icon: FiCheckCircle, color: "#BA7517" },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Clinical Overview</h1>
          <p className="text-xs mt-0.5" style={{ color: C.textLight }}>
            Real-time platform analytics and patient status
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="rounded-xl bg-white border p-4 transition-shadow hover:shadow-md"
            style={{ borderColor: C.border, borderLeft: `4px solid ${stat.color}` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textLight }}>
                  {stat.label}
                </div>
                <div className="text-2xl font-extrabold mt-1" style={{ color: C.text }}>
                  {stat.value}
                </div>
              </div>
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center border"
                style={{ borderColor: C.border, background: C.bg }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Recent Patients */}
        <div className="rounded-xl bg-white border overflow-hidden" style={{ borderColor: C.border }}>
          <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: C.text }}>
              <TbDog size={16} style={{ color: C.teal }} /> Recent Patients
            </div>
            {patients.length > 0 && (
              <button
                onClick={() => setView("clients")}
                className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: C.teal }}
              >
                View All <FiArrowRight size={12} />
              </button>
            )}
          </div>

          {patients.length === 0 ? (
            <div className="py-12 text-center" style={{ color: C.textLight }}>
              <TbDog size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm font-semibold">No patients registered yet</div>
              <div className="text-xs mt-1">Generate a protocol to register your first patient</div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: C.border }}>
                  {["Patient", "Breed", "Condition", "Registered"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: C.textLight }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 8).map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-b-0 hover:bg-[var(--k9-bg)] transition-colors cursor-pointer"
                    style={{ borderColor: C.borderLight }}
                    onClick={() => {
                      if (setView) setView("clients");
                    }}
                  >
                    <td className="px-5 py-3">
                      <div className="text-[13px] font-bold" style={{ color: C.text }}>{p.name}</div>
                      <div className="text-[10px]" style={{ color: C.textLight }}>
                        Owner: {p.client_name || "\u2014"}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: C.textMid }}>{p.breed || "\u2014"}</td>
                    <td className="px-5 py-3">
                      {p.condition ? (
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: `${C.teal}18`, color: C.teal }}
                        >
                          {p.condition}
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                    <td className="px-5 py-3 text-[11px]" style={{ color: C.textLight }}>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Condition Distribution */}
          <div className="rounded-xl bg-white border p-5" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: C.text }}>
              <FiActivity size={14} style={{ color: C.teal }} /> Condition Distribution
            </div>
            {conditionEntries.length === 0 ? (
              <div className="text-xs text-center py-4" style={{ color: C.textLight }}>
                No patient data yet
              </div>
            ) : (
              <div className="space-y-2.5">
                {conditionEntries.slice(0, 8).map(([cond, count]) => (
                  <div key={cond} className="flex justify-between items-center">
                    <span className="text-xs font-semibold" style={{ color: C.textMid }}>{cond}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: Math.max(20, (count / Math.max(...conditionEntries.map((e) => e[1]))) * 80),
                          background: C.teal,
                        }}
                      />
                      <span className="text-[11px] font-bold min-w-[18px] text-right" style={{ color: C.text }}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Status */}
          <div className="rounded-xl bg-white border p-5" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: C.text }}>
              <FiCheckCircle size={14} style={{ color: C.teal }} /> Platform Status
            </div>
            <div className="space-y-3">
              {[
                { label: "Backend API", ok: apiOk, detail: apiOk ? "Connected" : "Offline" },
                { label: "Exercise Library", ok: exercises.length > 0, detail: `${exercises.length} active` },
                { label: "Protocol Engine", ok: true, detail: "4 protocols" },
                { label: "Phase System", ok: true, detail: "4 phases each" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs font-semibold" style={{ color: C.textMid }}>{item.label}</span>
                  <span
                    className="text-[11px] font-bold flex items-center gap-1"
                    style={{ color: item.ok ? C.green : C.red }}
                  >
                    {item.ok ? <FiCheckCircle size={11} /> : <FiXCircle size={11} />} {item.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ClinicalFooter variant="subtle" />
    </div>
  );
}
