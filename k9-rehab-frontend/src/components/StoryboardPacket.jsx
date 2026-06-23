// ============================================================================
// EXERCISE HANDOUT — printable / emailable client handout.
// Per exercise: name on top, then one ROW per step:
//   [ left: written instructions ] │ divider │ [ right: pencil-sketch image ]
// Works on screen or printed; uses the browser print dialog ("Save as PDF").
// ============================================================================
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { BreedImage } from "./StoryboardPlayer";

function btn(bg, color = "#fff", border) {
  return { padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: bg, color, border: border ? `1px solid ${border}` : "none" };
}

// Strip baked-in breed/builds from the clinical step text for display.
function clean(text, modelBreed) {
  if (!text) return "";
  let t = String(text).replace(/\([^)]*\)/g, " ");
  if (modelBreed) t = t.split(modelBreed).join("The dog");
  return t.replace(/\s+/g, " ").trim();
}

export default function StoryboardPacket({ exercises = [], patientName = "", clientEmail = "", clinicName = "K9 Rehab Pro™", onClose }) {
  const [boards, setBoards] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const codes = [...new Set((exercises || []).map(e => e.code).filter(Boolean))];
    if (codes.length === 0) { setBoards([]); setLoading(false); return; }
    Promise.all(codes.map(code =>
      api.get(`/storyboards/${code}`).then(r => r.data?.data || r.data).catch(() => null)
    )).then(results => {
      if (cancelled) return;
      setBoards(results.filter(b => b && Array.isArray(b.frames) && b.frames.length));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [exercises]);

  const printPacket = () => window.print();
  const emailClient = () => {
    window.print();
    const subject = `Home Exercise Plan — ${patientName}`;
    const body =
      `Hello,\n\nAttached is the home-exercise plan for ${patientName}, prepared with ${clinicName}.\n\n` +
      `Each exercise shows the step-by-step instructions next to a drawing of the movement. Please follow the steps and contact the clinic with any questions.\n\n` +
      `(If your email program did not attach it automatically, please attach the PDF you just saved.)`;
    window.location.href = `mailto:${encodeURIComponent(clientEmail || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="sb-packet-overlay" style={{ position: "fixed", inset: 0, background: "rgba(8,15,30,0.6)", zIndex: 1200, overflow: "auto", padding: "24px 0" }}
      onClick={e => { if (e.target === e.currentTarget && onClose) onClose(); }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          .sb-packet, .sb-packet * { visibility: visible !important; }
          .sb-packet { position: absolute !important; left: 0; top: 0; width: 100%; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }
          .sb-no-print { display: none !important; }
          .sb-ex { page-break-before: always; }
          .sb-ex:first-of-type { page-break-before: avoid; }
          .sb-step { page-break-inside: avoid; break-inside: avoid; }
          @page { margin: 14mm; }
        }
      `}}/>

      <div className="sb-packet" style={{ background: "#fff", maxWidth: 860, margin: "0 auto", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "26px 30px" }}>

        {/* action bar */}
        <div className="sb-no-print" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 18 }}>
          <button onClick={printPacket} style={btn("#0c4a6e")}>🖨️ Print / Save PDF</button>
          <button onClick={emailClient} style={btn("#14b8a6")}>✉️ Email to Client</button>
          <button onClick={onClose} style={btn("#fff", "#475569", "#cbd5e1")}>Close</button>
        </div>

        {/* header */}
        <div style={{ borderBottom: "2px solid #0c4a6e", paddingBottom: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0c4a6e", letterSpacing: 1, textTransform: "uppercase" }}>{clinicName}</div>
          <h1 style={{ margin: "5px 0 2px", fontSize: 21, color: "#0f172a" }}>Home Exercise Plan</h1>
          <div style={{ fontSize: 13, color: "#475569" }}>
            Patient: <b>{patientName || "—"}</b> &middot; {(boards?.length || 0)} exercise{(boards?.length || 0) === 1 ? "" : "s"} &middot; {new Date().toLocaleDateString()}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6, fontStyle: "italic" }}>
            Evidence-based guide (Millis &amp; Levine). Review with your veterinary team before starting. Stop and contact the clinic if your pet shows pain, reluctance, or worsening signs.
          </div>
        </div>

        {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Preparing the exercise plan…</div>}
        {!loading && (!boards || boards.length === 0) && (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No exercises with step-by-step guides for this selection yet.</div>
        )}

        {(boards || []).map((sb, i) => {
          const bm = sb.breed_model?.breed;
          return (
            <div key={sb.exercise_code || i} className="sb-ex" style={{ marginBottom: 26 }}>
              {/* exercise name on top */}
              <h2 style={{ margin: "0 0 2px", fontSize: 18, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
                {sb.exercise_name || sb.exercise_code}
              </h2>
              {sb.clinical_purpose && <p style={{ margin: "6px 0 12px", fontSize: 11.5, color: "#475569", lineHeight: 1.6 }}>{clean(sb.clinical_purpose, bm)}</p>}

              {/* one row per step: instructions | divider | sketch */}
              {sb.frames.map(frame => (
                <div key={frame.frame_number} className="sb-step" style={{
                  display: "flex", alignItems: "stretch", gap: 0,
                  border: "1.5px solid #0f172a", borderRadius: 8, overflow: "hidden", marginBottom: 12, background: "#fff",
                }}>
                  {/* left: instructions */}
                  <div style={{ flex: "1 1 0", minWidth: 0, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0c4a6e", marginBottom: 5 }}>
                      Step {frame.frame_number}{frame.frame_title ? ` — ${frame.frame_title}` : ""}
                    </div>
                    {frame.frame_description && <p style={{ margin: "0 0 7px", fontSize: 12, color: "#0f172a", lineHeight: 1.55 }}>{clean(frame.frame_description, bm)}</p>}
                    {frame.handler_action && (
                      <p style={{ margin: "0 0 6px", fontSize: 11.5, color: "#334155", lineHeight: 1.5 }}>
                        <b style={{ color: "#0c4a6e" }}>What you do: </b>{clean(frame.handler_action, bm)}
                      </p>
                    )}
                    {frame.clinical_cues && (
                      <p style={{ margin: "0 0 6px", fontSize: 11, color: "#334155", lineHeight: 1.5 }}>
                        <b style={{ color: "#0d9488" }}>Cues: </b>{clean(frame.clinical_cues, bm)}
                      </p>
                    )}
                    {frame.safety_notes && (
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9a3412", lineHeight: 1.5, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, padding: "6px 9px" }}>
                        <b>⚠ Watch for: </b>{clean(frame.safety_notes, bm)}
                      </p>
                    )}
                  </div>

                  {/* vertical divider */}
                  <div style={{ width: 1.5, background: "#0f172a", flexShrink: 0 }} />

                  {/* right: pencil-sketch image */}
                  <div style={{ flex: "0 0 230px", padding: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                    <div style={{ position: "relative", width: 210, height: 210, background: "#fff" }}>
                      <BreedImage breedName="athletic dog" exerciseCode={sb.exercise_code} frameNumber={frame.frame_number} accentColor="#0c4a6e" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #e2e8f0", fontSize: 9, color: "#94a3b8", textAlign: "center" }}>
          Generated by {clinicName} &middot; B.E.A.U.&trade; Clinical Protocol Intelligence &middot; For educational use under veterinary supervision.
        </div>
      </div>
    </div>
  );
}
