// ============================================================================
// STORYBOARD PACKET — printable / emailable visual layout for a patient's
// evidence-based home-exercise storyboards (multi-exercise).
// Uses the browser print dialog ("Save as PDF") so cross-origin frame photos
// render cleanly, then opens a pre-filled email draft for the client.
// ============================================================================
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { BreedImage, SvgOverlayLayer } from "./StoryboardPlayer";

const OVERLAYS = { arrows: true, joint_angles: true, weight_shift: false, good_form: false, common_mistakes: false, safety_warnings: true };

function btn(bg, color = "#fff", border) {
  return { padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: bg, color, border: border ? `1px solid ${border}` : "none" };
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
    const subject = `Home Exercise Storyboard — ${patientName}`;
    const body =
      `Hello,\n\nAttached is the visual home-exercise storyboard for ${patientName}, prepared with ${clinicName}.\n\n` +
      `Each exercise includes step-by-step photos and plain-language instructions. Please follow the guidance and contact the clinic with any questions.\n\n` +
      `(If your email program did not attach it automatically, please attach the PDF you just saved.)`;
    window.location.href = `mailto:${encodeURIComponent(clientEmail || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const scriptText = (s) => Array.isArray(s) ? s.join(" ") : (typeof s === "string" ? s : "");

  return (
    <div className="sb-packet-overlay" style={{ position: "fixed", inset: 0, background: "rgba(8,15,30,0.6)", zIndex: 1200, overflow: "auto", padding: "24px 0" }}
      onClick={e => { if (e.target === e.currentTarget && onClose) onClose(); }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          .sb-packet, .sb-packet * { visibility: visible !important; }
          .sb-packet { position: absolute !important; left: 0; top: 0; width: 100%; box-shadow: none !important; border-radius: 0 !important; }
          .sb-no-print { display: none !important; }
          .sb-ex { page-break-inside: avoid; break-inside: avoid; }
          @page { margin: 14mm; }
        }
      `}}/>

      <div className="sb-packet" style={{ background: "#fff", maxWidth: 920, margin: "0 auto", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "26px 32px" }}>

        {/* action bar */}
        <div className="sb-no-print" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 18 }}>
          <button onClick={printPacket} style={btn("#0c4a6e")}>🖨️ Print / Save PDF</button>
          <button onClick={emailClient} style={btn("#14b8a6")}>✉️ Email to Client</button>
          <button onClick={onClose} style={btn("#fff", "#475569", "#cbd5e1")}>Close</button>
        </div>

        {/* header */}
        <div style={{ borderBottom: "2px solid #0c4a6e", paddingBottom: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0c4a6e", letterSpacing: 1, textTransform: "uppercase" }}>{clinicName}</div>
          <h1 style={{ margin: "6px 0 2px", fontSize: 22, color: "#0f172a" }}>Home Exercise Storyboard</h1>
          <div style={{ fontSize: 13, color: "#475569" }}>
            Patient: <b>{patientName || "—"}</b> &middot; {(boards?.length || 0)} exercise{(boards?.length || 0) === 1 ? "" : "s"} &middot; {new Date().toLocaleDateString()}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8, fontStyle: "italic" }}>
            Evidence-based visual guide. Review with your veterinary team before starting. Stop and contact the clinic if your pet shows pain, reluctance, or worsening signs.
          </div>
        </div>

        {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Preparing visual storyboards…</div>}
        {!loading && (!boards || boards.length === 0) && (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No visual storyboards are available for these exercises yet.</div>
        )}

        {(boards || []).map((sb, i) => (
          <div key={sb.exercise_code || i} className="sb-ex" style={{ marginBottom: 28, paddingBottom: 20, borderBottom: i < (boards.length - 1) ? "1px solid #e2e8f0" : "none" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#14b8a6" }}>{i + 1}.</span>
              <h2 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>{sb.exercise_name || sb.exercise_code}</h2>
            </div>
            {sb.clinical_purpose && <p style={{ margin: "0 0 12px", fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{sb.clinical_purpose}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(178px, 1fr))", gap: 12 }}>
              {sb.frames.map(frame => (
                <div key={frame.frame_number} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#0a2540" }}>
                    <BreedImage breedName={sb.breed_model?.breed || "Medium-sized dog"} exerciseCode={sb.exercise_code} frameNumber={frame.frame_number} accentColor={sb.branding?.neon_accent || "#39FF7E"} />
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                      <SvgOverlayLayer indicators={frame.svg_indicators || []} overlayToggles={OVERLAYS} width="100%" height="100%" />
                    </div>
                    <div style={{ position: "absolute", top: 6, left: 6, fontSize: 9, fontWeight: 700, color: "#39FF7E", background: "rgba(0,0,0,0.45)", padding: "2px 7px", borderRadius: 10 }}>
                      Step {frame.frame_number}
                    </div>
                  </div>
                  <div style={{ padding: "8px 10px", background: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{frame.frame_title}</div>
                    <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{frame.frame_description}</div>
                    {frame.handler_action && <div style={{ fontSize: 9.5, color: "#0c4a6e", marginTop: 5 }}><b>You:</b> {frame.handler_action}</div>}
                  </div>
                </div>
              ))}
            </div>

            {scriptText(sb.client_script) && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdfb", borderLeft: "3px solid #14b8a6", borderRadius: 6, fontSize: 11, color: "#0f172a", lineHeight: 1.6 }}>
                {scriptText(sb.client_script)}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: 18, paddingTop: 12, borderTop: "1px solid #e2e8f0", fontSize: 9, color: "#94a3b8", textAlign: "center" }}>
          Generated by {clinicName} &middot; B.E.A.U.&trade; Clinical Protocol Intelligence &middot; For educational use under veterinary supervision.
        </div>
      </div>
    </div>
  );
}
