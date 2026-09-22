import React, { useEffect, useState } from "react";
import { FiAlertTriangle, FiCheck, FiInfo, FiX } from "react-icons/fi";
import C from "../../constants/colors";
import { field } from "./PatientForm";
import * as v2 from "./v2api";

// ─────────────────────────────────────────────
// FIX THE RECORD
//
// The generator does not refuse an incomplete record. It reasons from whatever
// it is given, and absence is not neutral:
//
//   no condition          -> a general conditioning protocol, and the safety
//                            gates for the real presentation never fire
//   no surgery date       -> no recovery phase, so nothing can be staged
//   no medical history    -> the contraindication scan runs over an empty
//   no medications           string and finds nothing, which is exactly what
//   no instructions          "no contraindications" looks like
//   unstated equipment    -> that therapy is withheld from every protocol in
//                            the practice, for every patient
//
// None of it errors. The protocol generates, looks finished, and is thinner
// than the case called for.
//
// So this exists to be opened BEFORE generating, by whoever notices — vet,
// CCRP or admin — and it does three things: says what is missing, says what
// the generator will do about it, and offers the answer where the practice's
// own V1 clinical record already holds one.
//
// A suggestion is never applied on its own. It arrives with the field it came
// from and the words that were written there, and somebody accepts it.
// ─────────────────────────────────────────────

const SEVERITY = {
  BLOCKS: {
    label: "Stops generation",
    bg: C.redBg || "#FEF2F2", fg: C.red, border: C.red,
    lead: "The engine refuses to build a protocol without this.",
  },
  DEGRADES: {
    label: "Weakens the protocol",
    bg: C.amberBg, fg: C.amber, border: C.amber,
    lead: "A protocol will generate. It will reason from less than it should.",
  },
  WITHHOLDS: {
    label: "Removes therapy",
    bg: C.tealLight, fg: C.tealDark, border: C.teal,
    lead: "Equipment nobody has answered for. The engine treats unanswered as unavailable.",
  },
};

const box = {
  border: `1px solid ${C.border}`, borderRadius: 9, padding: 14,
  background: C.surface, display: "grid", gap: 10,
};

export default function FixRecord({ patient, onSave, onClose, busy }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [values, setValues] = useState({});

  useEffect(() => {
    let live = true;
    v2.getPatientGaps(patient.id)
      .then((data) => {
        if (!live) return;
        setState({ loading: false, data, error: null });
        // Pre-fill from the V1 record where it has an answer. Pre-filled is
        // not accepted: nothing is written until Save, and every suggestion
        // shows what it was read from so it can be judged rather than trusted.
        const seed = {};
        for (const g of data.gaps) {
          if (g.suggestion && g.column) seed[g.column] = String(g.suggestion.value);
        }
        setValues(seed);
      })
      .catch((e) => live && setState({ loading: false, data: null, error: v2.describeError(e) }));
    return () => { live = false; };
  }, [patient.id]);

  const set = (k) => (e) => setValues((p) => ({ ...p, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    const out = {};
    for (const [k, v] of Object.entries(values)) {
      const t = String(v ?? "").trim();
      if (!t) continue;
      out[k] = (k === "age" || k === "weight" || k === "body_condition_score") ? Number(t) : t;
    }
    if (Object.keys(out).length) onSave(out);
  }

  const data = state.data;
  const recordGaps = (data?.gaps || []).filter((g) => g.column);
  const clinicGaps = (data?.gaps || []).filter((g) => g.clinic);
  const filledCount = Object.values(values).filter((v) => String(v ?? "").trim()).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`What the generator does not know about ${patient.name}`}
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "rgba(15,23,42,0.55)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "36px 18px", overflowY: "auto",
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "min(760px, 100%)", background: C.bg, borderRadius: 12,
          boxShadow: "0 18px 50px rgba(15,23,42,0.28)", overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          padding: "16px 18px", borderBottom: `1px solid ${C.border}`, background: C.surface,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>
              What the generator doesn&rsquo;t know about {patient.name}
            </div>
            <div style={{ fontSize: 12.5, color: C.textMid, marginTop: 3, maxWidth: "62ch" }}>
              An incomplete record does not produce an error. It produces a
              thinner protocol.
            </div>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textMid, padding: 4 }}
          >
            <FiX size={18} />
          </button>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 16 }}>
          {state.loading && (
            <div style={{ fontSize: 13, color: C.textMid }}>Checking the record…</div>
          )}
          {state.error && (
            <div style={{ fontSize: 13, color: C.red }}>{state.error}</div>
          )}

          {data && recordGaps.length === 0 && clinicGaps.length === 0 && (
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "12px 14px", borderRadius: 8,
              background: C.greenBg || C.tealLight, border: `1px solid ${C.green || C.teal}`,
            }}>
              <FiCheck size={16} style={{ color: C.green || C.tealDark, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.55 }}>
                Everything the generator reads from the record is filled in.
                Today&rsquo;s clinical findings are still confirmed at the assessment.
              </span>
            </div>
          )}

          {/* Two records of the same animal saying different things. Shown,
              never resolved here — which one is right is a clinical question. */}
          {data?.conflicts?.length > 0 && (
            <div style={{ ...box, borderColor: C.amber, background: C.amberBg }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <FiAlertTriangle size={14} style={{ color: C.amber }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, letterSpacing: 0.3 }}>
                  THE TWO RECORDS DISAGREE
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.55 }}>
                This patient&rsquo;s chart and the clinical record hold different
                values. Nothing here is changed automatically — correct whichever
                is wrong.
              </div>
              {data.conflicts.map((c) => (
                <div key={c.field} style={{ fontSize: 12.5, color: C.text }}>
                  <strong>{c.field}</strong> — chart says{" "}
                  <code style={code}>{c.column}</code>, clinical record says{" "}
                  <code style={code}>{c.v1Record}</code>
                </div>
              ))}
            </div>
          )}

          {recordGaps.length > 0 && (
            <div style={{ display: "grid", gap: 12 }}>
              {recordGaps.map((g) => {
                const s = SEVERITY[g.severity] || SEVERITY.DEGRADES;
                const isLong = /history|instruction|medication/i.test(g.label);
                return (
                  <div key={g.column} style={{ ...box, borderLeft: `3px solid ${s.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: C.navy }}>{g.label}</span>
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
                        padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.fg,
                      }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.55 }}>{g.why}</div>

                    {isLong ? (
                      <textarea
                        style={{ ...field, resize: "vertical", fontFamily: "inherit" }}
                        rows={g.label === "Medical history" ? 3 : 2}
                        value={values[g.column] ?? ""}
                        onChange={set(g.column)}
                        placeholder="Leave blank if there is genuinely nothing to record"
                      />
                    ) : (
                      <input
                        style={field}
                        type={g.column === "age" || g.column === "weight" ? "number" : "text"}
                        step={g.column === "age" || g.column === "weight" ? "0.1" : undefined}
                        value={values[g.column] ?? ""}
                        onChange={set(g.column)}
                      />
                    )}

                    {g.suggestion && (
                      <div style={{
                        fontSize: 11.5, color: C.tealDark, background: C.tealLight,
                        padding: "7px 10px", borderRadius: 6, lineHeight: 1.5,
                      }}>
                        Filled in from this practice&rsquo;s clinical record —{" "}
                        <span style={{ opacity: 0.85 }}>{g.suggestion.source}</span>. Check it
                        before saving.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Equipment is clinic-wide, not per patient, so it is reported here
              and fixed in Access & equipment. Saying it silently would leave a
              whole practice wondering where its laser went. */}
          {clinicGaps.length > 0 && (
            <div style={{ ...box, borderColor: C.teal }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <FiInfo size={14} style={{ color: C.tealDark }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, letterSpacing: 0.3 }}>
                  EQUIPMENT NOBODY HAS ANSWERED FOR
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.55 }}>
                The engine treats an unanswered capability as unavailable, so
                these are withheld from every protocol in the practice — not just
                this patient&rsquo;s. Set them in <strong>Access &amp; equipment</strong>.
              </div>
              <div style={{ fontSize: 12.5, color: C.text }}>
                {clinicGaps.map((g) => g.label).join(" · ")}
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 18px", borderTop: `1px solid ${C.border}`, background: C.surface,
        }}>
          <button
            type="submit"
            disabled={busy || filledCount === 0}
            style={{
              padding: "10px 18px", fontSize: 13.5, fontWeight: 700, borderRadius: 8,
              border: "none",
              cursor: busy || filledCount === 0 ? "not-allowed" : "pointer",
              background: filledCount === 0 ? C.borderLight : C.teal,
              color: filledCount === 0 ? C.textLight : "#fff",
            }}
          >
            {busy ? "Saving…" : "Save to the record"}
          </button>
          <button
            type="button" onClick={onClose}
            style={{
              padding: "10px 16px", fontSize: 13.5, fontWeight: 600, borderRadius: 8,
              border: `1px solid ${C.border}`, background: "transparent",
              color: C.textMid, cursor: "pointer",
            }}
          >
            Close
          </button>
          <span style={{ fontSize: 12, color: C.textLight }}>
            {filledCount === 0
              ? "Nothing filled in yet."
              : `${filledCount} field${filledCount === 1 ? "" : "s"} will be written.`}
          </span>
        </div>
      </form>
    </div>
  );
}

const code = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 11.5, padding: "1px 5px", borderRadius: 4,
  background: C.surface, border: `1px solid ${C.border}`,
};
