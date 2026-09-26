import React, { useState, useEffect, useCallback } from "react";
import { FiAward, FiAlertTriangle, FiUsers } from "react-icons/fi";
import C from "../../constants/colors";
import { SettingsSection } from "./SettingsShared";

/**
 * WHO MAY APPROVE A PROTOCOL — the clinic's roster.
 *
 * This tab used to be a single free-text "clinician identity" form writing to
 * React state. It saved nothing, and it described the wrong thing: one person
 * typing, rather than the practice's clinicians and what each is permitted to
 * do.
 *
 * WHY THAT MATTERED. Approval and handoff are gated on
 * `authority.resolveApprovalAuthority`, which reads the clinician_credentials
 * TABLE. A clinician entered on the old screen reached nothing, so they could
 * never approve a protocol and nothing on the screen said so. The only way to
 * see the truth was `node v2/access.js status` in a terminal.
 *
 * Everything here already existed on the server; this is the screen for it.
 *
 * TWO THINGS THIS DELIBERATELY SHOWS RATHER THAN HIDES:
 *
 *   1. WHY someone cannot approve. The endpoint returns a written
 *      `explanation`; a roster that says only "cannot approve" sends an
 *      administrator back to the CLI.
 *   2. WHEN a credential expires. credentialUsable() checks valid_until, so a
 *      lapse silently removes a clinician's authority on a date nobody is
 *      watching. It is shown as a countdown, not buried in a date.
 */

/** Credentials that actually grant approval authority — authority.js. */
const APPROVING = ["CCRP", "CCRT", "CCRV", "DVM", "VMD", "BVSC"];
/** Recorded, but they grant nothing on their own. */
const OTHER_CREDENTIALS = ["RVT", "LVT", "CVT", "VTS", "Student"];

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "veterinarian", label: "Veterinarian" },
  { value: "rehab_practitioner", label: "Rehabilitation practitioner" },
  { value: "technician", label: "Technician" },
  { value: "user", label: "User (no clinical authority)" },
];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const then = new Date(dateStr);
  if (Number.isNaN(then.getTime())) return null;
  return Math.round((then - new Date()) / 86400000);
}

export function TabClinician({ isOpen, toggleSection }) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [state, setState] = useState({ loading: true, error: null, users: [], forbidden: false });
  const [busy, setBusy] = useState(null);
  const [draft, setDraft] = useState({});

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const load = useCallback(() => {
    fetch(`${apiBase}/v2/users`, { headers: authHeaders() })
      .then(async (r) => ({ status: r.status, body: await r.json() }))
      .then(({ status, body }) => {
        if (status === 403) {
          setState({ loading: false, error: null, users: [], forbidden: true });
          return;
        }
        setState({
          loading: false,
          forbidden: false,
          error: body.success === false ? (body.error || "Could not load the roster") : null,
          users: body.data || [],
        });
      })
      .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  useEffect(load, [load]);

  async function call(url, body, key) {
    setBusy(key);
    try {
      const res = await fetch(`${apiBase}${url}`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(body || {}),
      });
      const j = await res.json();
      if (!res.ok || j.success === false) throw new Error(j.error || `HTTP ${res.status}`);
      load();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message }));
    } finally {
      setBusy(null);
    }
  }

  if (state.loading) {
    return <div style={{ fontSize: 12, color: C.muted, padding: 14 }}>Loading the clinician roster…</div>;
  }

  if (state.forbidden) {
    return (
      <div style={{
        padding: "14px 18px", borderRadius: 8, fontSize: 13, color: C.amber,
        background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.4)",
        display: "flex", alignItems: "center", gap: 9,
      }}>
        <FiAlertTriangle size={16} />
        Only an administrator can view or change who may approve a protocol.
        Ask an administrator to add your credential.
      </div>
    );
  }

  return (
    <div>
      <div style={{
        padding: "12px 16px", marginBottom: 12, borderRadius: 8,
        background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.35)",
        fontSize: 12, color: C.navy,
      }}>
        Approval and handoff to B.E.A.U. at Home are gated on what is recorded here.
        A clinician with no approving credential can do clinical work but cannot sign
        off a protocol. Credentials marked <strong>◆</strong> grant that authority.
      </div>

      {state.error && (
        <div style={{
          fontSize: 11.5, color: C.red, marginBottom: 12, padding: "8px 12px",
          background: "#FEF2F2", borderRadius: 6,
        }}>
          {state.error}
        </div>
      )}

      <SettingsSection
        id="clin_roster" icon={FiUsers} title={`Clinicians (${state.users.length})`}
        open={isOpen("clin_roster")} onToggle={toggleSection}
      >
        {state.users.map((u) => {
          const d = draft[u.id] || {};
          return (
            <div key={u.id} style={{
              padding: "12px 14px", marginBottom: 10, borderRadius: 8,
              border: `1px solid ${u.can_approve ? C.green + "55" : C.border}`,
              background: u.can_approve ? "#F6FEFB" : C.white,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: C.navy }}>{u.username}</span>
                {u.is_system_owner && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: C.teal }}>SYSTEM OWNER</span>
                )}
                <span style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase",
                  color: u.can_approve ? C.green : C.muted,
                }}>
                  {u.can_approve ? `Can approve — ${u.basis}` : "Cannot approve"}
                </span>
              </div>

              {/* The REASON, not just the verdict. Without it an administrator
                  has to go to the CLI to find out what is missing. */}
              {!u.can_approve && u.explanation && (
                <div style={{ marginTop: 5, fontSize: 11.5, color: C.muted }}>{u.explanation}</div>
              )}

              {(u.credentials || []).map((c) => {
                const left = daysUntil(c.valid_until);
                const expired = left !== null && left < 0;
                const soon = left !== null && left >= 0 && left <= 60;
                return (
                  <div key={c.id} style={{
                    marginTop: 6, fontSize: 11, display: "flex", alignItems: "center",
                    gap: 8, flexWrap: "wrap", color: C.text,
                  }}>
                    <span style={{ fontWeight: 700 }}>
                      {c.credential}
                      {APPROVING.includes(String(c.credential).toUpperCase()) && (
                        <span title="Grants approval authority" style={{ color: C.teal, marginLeft: 4 }}>◆</span>
                      )}
                    </span>
                    {c.license_number && <span style={{ color: C.muted }}>#{c.license_number}</span>}
                    <span style={{ color: c.status === "ACTIVE" ? C.green : C.red }}>{c.status}</span>
                    {c.valid_until && (
                      <span style={{
                        color: expired ? C.red : soon ? C.amber : C.muted,
                        fontWeight: expired || soon ? 700 : 400,
                      }}>
                        {expired
                          ? `EXPIRED ${Math.abs(left)} day(s) ago — approval authority already lost`
                          : soon
                            ? `expires in ${left} day(s)`
                            : `expires ${c.valid_until}`}
                      </span>
                    )}
                    <button
                      disabled={busy === `rev${c.id}` || c.status !== "ACTIVE"}
                      onClick={() => call(`/v2/credentials/${c.id}/revoke`, {}, `rev${c.id}`)}
                      style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4, cursor: "pointer",
                        border: `1px solid ${C.border}`, background: C.white, color: C.muted,
                      }}
                    >revoke</button>
                  </div>
                );
              })}

              {/* Admin actions */}
              <div style={{ marginTop: 9, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <select
                  value={d.role ?? u.role}
                  onChange={(e) => setDraft({ ...draft, [u.id]: { ...d, role: e.target.value } })}
                  style={{ fontSize: 11, padding: "3px 6px", border: `1px solid ${C.border}`, borderRadius: 4 }}
                >
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {(d.role ?? u.role) !== u.role && (
                  <button
                    disabled={busy === `role${u.id}`}
                    onClick={() => call(`/v2/users/${u.id}/role`, { role: d.role }, `role${u.id}`)}
                    style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
                      border: "none", background: C.teal, color: C.white, fontWeight: 700,
                    }}
                  >set role</button>
                )}

                <select
                  value={d.credential || ""}
                  onChange={(e) => setDraft({ ...draft, [u.id]: { ...d, credential: e.target.value } })}
                  style={{ fontSize: 11, padding: "3px 6px", border: `1px solid ${C.border}`, borderRadius: 4 }}
                >
                  <option value="">add credential…</option>
                  <optgroup label="Grants approval authority">
                    {APPROVING.map((c) => <option key={c} value={c}>{c} ◆</option>)}
                  </optgroup>
                  <optgroup label="Recorded only">
                    {OTHER_CREDENTIALS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
                {d.credential && (
                  <>
                    <input
                      placeholder="licence #"
                      value={d.license_number || ""}
                      onChange={(e) => setDraft({ ...draft, [u.id]: { ...d, license_number: e.target.value } })}
                      style={{ fontSize: 11, padding: "3px 6px", border: `1px solid ${C.border}`, borderRadius: 4, width: 110 }}
                    />
                    <input
                      type="date" title="valid until"
                      value={d.valid_until || ""}
                      onChange={(e) => setDraft({ ...draft, [u.id]: { ...d, valid_until: e.target.value } })}
                      style={{ fontSize: 11, padding: "3px 6px", border: `1px solid ${C.border}`, borderRadius: 4 }}
                    />
                    <button
                      disabled={busy === `cred${u.id}`}
                      onClick={() => {
                        call("/v2/credentials", {
                          user_id: u.id,
                          credential: d.credential,
                          license_number: d.license_number,
                          issuing_body: d.issuing_body,
                          valid_until: d.valid_until,
                        }, `cred${u.id}`);
                        setDraft({ ...draft, [u.id]: {} });
                      }}
                      style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
                        border: "none", background: C.green, color: C.white, fontWeight: 700,
                      }}
                    >add</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </SettingsSection>

      <div style={{ marginTop: 10, fontSize: 10.5, color: C.muted, fontStyle: "italic" }}>
        <FiAward size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
        This screen shows the same answer as <code>node v2/access.js status</code>. If the
        two ever disagree, the gate is the one to believe.
      </div>
    </div>
  );
}
