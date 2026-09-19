import React, { useCallback, useEffect, useState } from "react";
import { FiAlertCircle, FiArrowLeft, FiCheck, FiPlus, FiShield, FiTool, FiX } from "react-icons/fi";
import C from "../../constants/colors";
import api from "../../api/axios";
import { CAPABILITY_LABELS, describeError } from "./v2api";

// ─────────────────────────────────────────────
// ACCESS & EQUIPMENT
//
// Approval authority is deliberately restricted, so there has to be a supported
// way to grant and inspect it in the app. Without this the owner of the system
// can be locked out of their own project with no route back except raw SQL.
//
// Everything here is admin-only and enforced server-side; this screen is the
// interface, not the guard.
// ─────────────────────────────────────────────

const ROLES = [
  { value: "admin", label: "Administrator", note: "Full access. Approvals recorded as ADMINISTRATIVE — distinct from a clinical signature." },
  { value: "veterinarian", label: "Veterinarian", note: "Approves by licensure." },
  { value: "rehab_practitioner", label: "Rehab practitioner", note: "Approves only while holding a current CCRP/CCRT." },
  { value: "technician", label: "Technician", note: "Records assessments and measurements. Cannot approve." },
  { value: "user", label: "No clinical role", note: "No clinical authority." },
  { value: "owner", label: "Pet owner", note: "No clinical authority." },
];

const CREDENTIALS = ["CCRP", "CCRT", "CCRV", "DVM", "VMD", "BVSC"];

const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 };
const input = {
  padding: "8px 10px", fontSize: 13, border: `1px solid ${C.border}`,
  borderRadius: 6, background: C.surface, color: C.text,
};

export default function ClinicalAdminView({ setView }) {
  const [users, setUsers] = useState([]);
  const [caps, setCaps] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [credFor, setCredFor] = useState(null);

  const load = useCallback(async () => {
    setBusy(true); setError(null);
    try {
      const [u, c] = await Promise.all([
        api.get("/v2/users").then((r) => r.data.data),
        api.get("/v2/clinic/capabilities").then((r) => r.data.data),
      ]);
      setUsers(u);
      setCaps(c);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setRole = async (userId, role) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const r = await api.post(`/v2/users/${userId}/role`, { role });
      setNotice(`${r.data.data.username} is now ${role}.`);
      await load();
    } catch (e) {
      setError(describeError(e));
    } finally { setBusy(false); }
  };

  const addCredential = async (form) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      await api.post("/v2/credentials", form);
      setNotice("Credential recorded.");
      setCredFor(null);
      await load();
    } catch (e) {
      setError(describeError(e));
    } finally { setBusy(false); }
  };

  const revokeCredential = async (id) => {
    setBusy(true); setError(null);
    try {
      await api.post(`/v2/credentials/${id}/revoke`);
      setNotice("Credential revoked. Approvals that relied on it remain valid.");
      await load();
    } catch (e) {
      setError(describeError(e));
    } finally { setBusy(false); }
  };

  const setCapability = async (key, value) => {
    setBusy(true); setError(null);
    try {
      const r = await api.put("/v2/clinic/capabilities", { [key]: value });
      setCaps(r.data.data);
    } catch (e) {
      setError(describeError(e));
    } finally { setBusy(false); }
  };

  const setAllCapabilities = async (value) => {
    setBusy(true); setError(null);
    try {
      const body = Object.fromEntries(Object.keys(CAPABILITY_LABELS).map((k) => [k, value]));
      const r = await api.put("/v2/clinic/capabilities", body);
      setCaps(r.data.data);
      setNotice(value ? "All equipment marked available." : "All equipment marked unavailable.");
    } catch (e) {
      setError(describeError(e));
    } finally { setBusy(false); }
  };

  return (
    <div style={{ padding: 24, maxWidth: 940, margin: "0 auto", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <button style={ghost} onClick={() => setView("clinical")}>
          <FiArrowLeft size={13} /> Clinical Workflow
        </button>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Access & Equipment</div>
      </div>

      {error && (
        <Banner tone="error" icon={FiAlertCircle} onDismiss={() => setError(null)}>
          <strong>{error.status === 403 ? "Administrator access required" : "Could not complete"}</strong>
          <div style={{ marginTop: 3 }}>{error.message}</div>
        </Banner>
      )}
      {notice && (
        <Banner tone="ok" icon={FiCheck} onDismiss={() => setNotice(null)}>{notice}</Banner>
      )}

      {/* ── Who can approve ───────────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 14 }}>
        <Title icon={FiShield} text="Who can approve a protocol" />
        <div style={{ fontSize: 12, color: C.textMid, marginTop: 6, marginBottom: 12 }}>
          A veterinarian approves by licensure. A rehab practitioner approves only while holding a
          current CCRP/CCRT. Recording a credential here asserts that someone checked a certificate —
          it does not verify one.
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: 12,
                background: u.can_approve ? C.greenBg : C.bg,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text, minWidth: 140 }}>
                  {u.username}
                </span>

                <select
                  style={{ ...input, minWidth: 170 }}
                  value={ROLES.some((r) => r.value === u.role) ? u.role : "user"}
                  disabled={busy}
                  onChange={(e) => setRole(u.id, e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>

                <span style={{ fontSize: 12, color: u.can_approve ? C.green : C.textMid }}>
                  {u.can_approve
                    ? `can approve · ${String(u.basis).toLowerCase()}`
                    : "cannot approve"}
                </span>

                <button
                  style={{ ...ghost, marginLeft: "auto" }}
                  onClick={() => setCredFor(credFor === u.id ? null : u.id)}
                >
                  <FiPlus size={12} /> Credential
                </button>
              </div>

              {!u.can_approve && u.explanation && (
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>{u.explanation}</div>
              )}

              {u.credentials?.length > 0 && (
                <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                  {u.credentials.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <span style={{ color: c.status === "ACTIVE" ? C.text : C.textLight }}>
                        {c.credential}
                        {c.license_number && ` #${c.license_number}`}
                        {" · "}{c.status}
                        {c.valid_until ? ` · expires ${String(c.valid_until).slice(0, 10)}` : " · no expiry recorded"}
                      </span>
                      {c.status === "ACTIVE" && (
                        <button
                          onClick={() => revokeCredential(c.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight }}
                          title="Revoke"
                        >
                          <FiX size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {credFor === u.id && (
                <CredentialForm
                  userId={u.id}
                  busy={busy}
                  onCancel={() => setCredFor(null)}
                  onSubmit={addCredential}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Clinic equipment ─────────────────────────────────────────────── */}
      <div style={card}>
        <Title icon={FiTool} text="Clinic equipment" />
        <div style={{ fontSize: 12, color: C.textMid, marginTop: 6, marginBottom: 12 }}>
          These are enablement gates. An item left <strong>not stated</strong> silently withholds
          every exercise that needs it, with no warning on the protocol. State each one, even to say
          the clinic does not have it.
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button style={ghost} disabled={busy} onClick={() => setAllCapabilities(true)}>
            Mark all available
          </button>
          <button style={ghost} disabled={busy} onClick={() => setAllCapabilities(false)}>
            Mark all unavailable
          </button>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          {Object.entries(CAPABILITY_LABELS).map(([key, label]) => {
            const value = caps?.capabilities?.[key];
            return (
              <div
                key={key}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 10px", borderRadius: 6,
                  background: value === null || value === undefined ? C.amberBg : C.bg,
                  border: `1px solid ${value === null || value === undefined ? C.amber : C.borderLight}`,
                }}
              >
                <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{label}</span>
                {(value === null || value === undefined) && (
                  <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>
                    not stated — withheld
                  </span>
                )}
                <div style={{ display: "flex", gap: 4 }}>
                  <Toggle active={value === true} disabled={busy} onClick={() => setCapability(key, true)}>
                    Have it
                  </Toggle>
                  <Toggle active={value === false} disabled={busy} onClick={() => setCapability(key, false)}>
                    Don't
                  </Toggle>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CredentialForm({ userId, busy, onCancel, onSubmit }) {
  const [credential, setCredential] = useState("CCRP");
  const [license, setLicense] = useState("");
  const [body, setBody] = useState("");
  const [until, setUntil] = useState("");

  return (
    <div style={{ marginTop: 10, padding: 12, borderRadius: 6, background: C.surface, border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select style={input} value={credential} onChange={(e) => setCredential(e.target.value)}>
          {CREDENTIALS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input style={{ ...input, width: 130 }} placeholder="licence number" value={license} onChange={(e) => setLicense(e.target.value)} />
        <input style={{ ...input, width: 150 }} placeholder="issuing body" value={body} onChange={(e) => setBody(e.target.value)} />
        <label style={{ fontSize: 12, color: C.textMid }}>
          expires{" "}
          <input style={{ ...input, width: 145 }} type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
        </label>
      </div>
      <div style={{ fontSize: 11, color: C.textLight, marginTop: 8 }}>
        A certificate with no expiry recorded never lapses in this system. Set the real expiry date.
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          style={{ ...ghost, background: C.teal, color: "#fff", border: "none" }}
          disabled={busy}
          onClick={() => onSubmit({
            user_id: userId, credential,
            license_number: license || null, issuing_body: body || null,
            valid_until: until || null,
          })}
        >
          Record credential
        </button>
        <button style={ghost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function Toggle({ active, disabled, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "5px 11px", fontSize: 12, fontWeight: 600, borderRadius: 6,
        cursor: disabled ? "default" : "pointer",
        border: `1px solid ${active ? C.teal : C.border}`,
        background: active ? C.teal : C.surface,
        color: active ? "#fff" : C.textMid,
      }}
    >
      {children}
    </button>
  );
}

function Title({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon size={15} style={{ color: C.teal }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {text}
      </span>
    </div>
  );
}

function Banner({ tone, icon: Icon, children, onDismiss }) {
  const palette = {
    ok: { bg: C.greenBg, border: C.green, fg: C.green },
    error: { bg: C.redBg, border: C.red, fg: C.red },
  }[tone];
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14,
      padding: "12px 14px", borderRadius: 8, fontSize: 13,
      background: palette.bg, border: `1px solid ${palette.border}`, color: C.text,
    }}>
      <Icon size={16} style={{ color: palette.fg, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>{children}</div>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
}

const ghost = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 13px", fontSize: 12, fontWeight: 600, borderRadius: 6,
  border: `1px solid ${C.border}`, cursor: "pointer",
  background: C.surface, color: C.textMid,
};
