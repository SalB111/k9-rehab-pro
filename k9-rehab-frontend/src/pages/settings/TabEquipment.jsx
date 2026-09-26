import React, { useState, useEffect, useCallback } from "react";
import { FiAlertTriangle, FiActivity } from "react-icons/fi";
import C from "../../constants/colors";
import { SettingsSection } from "./SettingsShared";

/**
 * THE CLINIC'S EQUIPMENT — and, until 2026-09-26, a screen that did nothing.
 *
 * Sal: "lets remove the clinic equipment block because its in the settings and
 * which should be the very first thing that should be done when starting with
 * the program, should go through the settings tabs and select everything
 * relevant."
 *
 * He was right about where it belongs and wrong about one thing: THIS TAB WAS
 * NOT SAVING ANYTHING. It held a client-side object in useSettingsState
 * (`// Equipment & facility (client-side)`) with its own vocabulary —
 * `underwater_treadmill`, `therapeutic_pool` — that shared not one key with
 * the engine's `aquatic_access`, `modality_uwtm`, ... Meanwhile it displayed
 * "Equipment settings gate protocol generation", which was simply untrue.
 *
 * The working implementation lived in the dashboard's Equipment block, which
 * wrote `/v2/clinic/capabilities`. That block is gone and this is it, moved.
 *
 * WHY THIS MATTERS MORE THAN TIDINESS: an unstated capability is WITHHELD from
 * every protocol, for every patient, silently. When this was measured on
 * 2026-09-26 the clinic had 10 of 10 unstated — so laser, underwater
 * treadmill, shockwave and the rest were being excluded from everything
 * B.E.A.U. generated, and the one screen a clinician would look at to fix that
 * was not connected to anything.
 *
 * The field list is SERVED by the endpoint rather than held here, the same way
 * the home block does it. A second copy of the vocabulary in the screen is how
 * the old tab drifted out of the engine's reach in the first place.
 */
export function TabEquipment({ isOpen, toggleSection }) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [state, setState] = useState({
    loading: true, error: null, shape: [], equipment: {}, gating: [],
  });
  const [saving, setSaving] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const load = useCallback(() => {
    fetch(`${apiBase}/v2/clinic/capabilities`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((j) => {
        const d = j.data || {};
        setState({
          loading: false,
          error: j.success === false ? (j.error || "Could not load equipment") : null,
          shape: d.checklistShape || [],
          equipment: d.equipment || {},
          gating: d.gatingItems || [],
        });
      })
      .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  useEffect(load, [load]);

  const toggle = async (item, next) => {
    setSaving(item);
    try {
      const res = await fetch(`${apiBase}/v2/clinic/capabilities`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ equipment: { [item]: next } }),
      });
      const j = await res.json();
      if (!res.ok || j.success === false) throw new Error(j.error || `HTTP ${res.status}`);
      const d = j.data || {};
      setState((s) => ({
        ...s,
        error: null,
        equipment: d.equipment || { ...s.equipment, [item]: next },
        shape: d.checklistShape || s.shape,
        gating: d.gatingItems || s.gating,
      }));
    } catch (e) {
      setState((s) => ({ ...s, error: e.message }));
    } finally {
      setSaving(null);
    }
  };

  const allItems = state.shape.flatMap((g) => g.items);
  const unanswered = allItems.filter(
    (i) => state.equipment[i] === undefined || state.equipment[i] === null
  ).length;

  if (state.loading) {
    return <div style={{ fontSize: 12, color: C.muted, padding: 14 }}>Loading equipment…</div>;
  }

  return (
    <div>
      {/* This claim used to be false. It is true now. */}
      <div style={{
        padding: "12px 16px", marginBottom: 12, borderRadius: 8,
        background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.4)",
        display: "flex", alignItems: "flex-start", gap: 8,
        fontSize: 12, color: C.amber, fontWeight: 600,
      }}>
        <FiAlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          This is the equipment at <strong>this clinic</strong>, and it is what B.E.A.U.
          prescribes from — only equipment recorded here is offered. Items marked ◆ gate a
          therapy in the protocol engine.
          {unanswered > 0 && (
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {unanswered} of {allItems.length} not yet answered. An unanswered modality is
              treated as unavailable, so it is withheld from every protocol until somebody says.
            </div>
          )}
        </div>
      </div>

      {state.error && (
        <div style={{
          fontSize: 11.5, color: C.red, marginBottom: 12, padding: "8px 12px",
          background: "#FEF2F2", borderRadius: 6,
        }}>
          {state.error}
        </div>
      )}

      {state.shape.map((grp, gi) => (
        <SettingsSection
          key={grp.category}
          id={`equip_${gi}`}
          icon={FiActivity}
          title={grp.category}
          open={isOpen(`equip_${gi}`)}
          onToggle={toggleSection}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {grp.items.map((item) => {
              const checked = state.equipment[item] === true;
              const gates = state.gating.includes(item);
              const busy = saving === item;
              return (
                <div
                  role="button" tabIndex={0} key={item}
                  className={`cb-row${checked ? " active" : ""}`}
                  style={{ opacity: busy ? 0.55 : 1 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(item, !checked); }
                  }}
                  onClick={() => toggle(item, !checked)}
                >
                  <input type="checkbox" checked={checked} readOnly
                    style={{ width: 15, height: 15, accentColor: C.teal, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: checked ? C.teal : C.text }}>
                    {item}
                    {gates && (
                      <span title="Enables a therapy in the protocol engine"
                        style={{ marginLeft: 5, fontSize: 9, color: C.teal, opacity: 0.8 }}>◆</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </SettingsSection>
      ))}
    </div>
  );
}
