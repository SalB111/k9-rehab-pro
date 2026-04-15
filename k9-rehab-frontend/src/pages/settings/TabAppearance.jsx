import React, { useState, useRef } from "react";
import { FiMonitor, FiSliders, FiVolume2, FiPlay, FiSquare } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { sty } from "./constants";
import { SettingsSection } from "./SettingsShared";
import { BEAU_VOICES } from "../../hooks/useBeauVoice";

export function TabAppearance({ appearance, setAppearance, theme, setTheme, flashSave, isOpen, toggleSection }) {
  // ── B.E.A.U. Voice preference ──
  // Stored in localStorage under "beau_voice_preference" — read by useBeauVoice
  // hook everywhere voice is used. Preview button hits /api/tts directly with
  // a short sample sentence in the selected voice.
  const [voicePref, setVoicePref] = useState(() => {
    try { return localStorage.getItem("beau_voice_preference") || "onyx"; }
    catch { return "onyx"; }
  });
  const [previewing, setPreviewing] = useState(null);
  const previewAudioRef = useRef(null);

  const onPickVoice = (id) => {
    setVoicePref(id);
    try { localStorage.setItem("beau_voice_preference", id); } catch {}
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      try { previewAudioRef.current.pause(); previewAudioRef.current.currentTime = 0; } catch {}
      previewAudioRef.current = null;
    }
    setPreviewing(null);
  };

  const previewVoice = async (voiceId) => {
    if (previewing) { stopPreview(); return; }
    setPreviewing(voiceId);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBase}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: "Hello, I am B.E.A.U., the clinical AI of K9 Rehab Pro.",
          voice: voiceId,
          language: "en",
        }),
      });
      if (!res.ok) throw new Error("TTS API " + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); setPreviewing(null); previewAudioRef.current = null; };
      audio.onerror = () => { URL.revokeObjectURL(url); setPreviewing(null); previewAudioRef.current = null; };
      await audio.play();
    } catch (err) {
      console.warn("[Voice preview] failed:", err.message);
      setPreviewing(null);
    }
  };

  return (
    <div>
      <SettingsSection id="app_theme" open={isOpen("app_theme")} onToggle={toggleSection} icon={FiMonitor} title="Theme & Display">
        <div style={sty.fieldRow}>
          <label style={sty.fieldLabel}>Interface Theme</label>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            {[
              ["clinical_light", "Clinical Light", "Clean white backgrounds, medical-grade readability"],
              ["clinical_dark", "Clinical Dark", "Dark navy backgrounds, reduced eye strain"],
              ["high_contrast", "High Contrast", "Maximum contrast for accessibility compliance"],
            ].map(([val, label, desc]) => (
              <div key={val} onClick={() => setTheme(val)}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                  background: theme === val ? C.teal : C.bg,
                  color: theme === val ? "#fff" : C.text,
                  border: theme === val ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                  transition: "all 0.15s",
                }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="app_layout" open={isOpen("app_layout")} onToggle={toggleSection} icon={FiSliders} title="Layout Preferences">
        <div style={S.grid(2)}>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Font Size</label>
            <select style={{ ...S.select, width: "100%" }} value={appearance.font_size}
              onChange={e => setAppearance({ ...appearance, font_size: e.target.value })}>
              <option value="compact">Compact — More content per screen</option>
              <option value="standard">Standard (Recommended)</option>
              <option value="large">Large — Enhanced readability</option>
            </select>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Exercise Card Display</label>
            <select style={{ ...S.select, width: "100%" }} value={appearance.exercise_card_display}
              onChange={e => setAppearance({ ...appearance, exercise_card_display: e.target.value })}>
              <option value="compact">Compact — Name, code, category only</option>
              <option value="detailed">Detailed (Recommended) — Full descriptions and evidence</option>
              <option value="clinical">Clinical — Phase mapping, contraindications, progression</option>
            </select>
          </div>
          <div style={sty.fieldRow}>
            <label style={sty.fieldLabel}>Dashboard Layout</label>
            <select style={{ ...S.select, width: "100%" }} value={appearance.dashboard_layout}
              onChange={e => setAppearance({ ...appearance, dashboard_layout: e.target.value })}>
              <option value="standard">Standard — KPIs + recent patients + actions</option>
              <option value="clinical">Clinical Focus — Patient queue + outcome trends</option>
              <option value="administrative">Administrative — Utilization + billing + compliance</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="app_voice" open={isOpen("app_voice")} onToggle={toggleSection} icon={FiVolume2} title="B.E.A.U. Voice">
        <div style={{ ...sty.fieldRow, marginBottom: 12 }}>
          <label style={sty.fieldLabel}>Voice Selection</label>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4, marginBottom: 10 }}>
            Choose the voice B.E.A.U. uses when reading clinical content aloud. The selection is saved locally and applies across all pages.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {BEAU_VOICES.map(v => {
              const selected = voicePref === v.id;
              const isPreviewing = previewing === v.id;
              return (
                <div key={v.id}
                  style={{
                    padding: "12px 14px", borderRadius: 8,
                    background: selected ? C.teal : C.bg,
                    color: selected ? "#fff" : C.text,
                    border: selected ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                  <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onPickVoice(v.id)}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{v.name}</div>
                    <div style={{ fontSize: 11, marginTop: 2, opacity: selected ? 0.85 : 0.65 }}>{v.desc}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); previewVoice(v.id); }}
                    title={isPreviewing ? "Stop preview" : "Preview voice"}
                    style={{
                      padding: "6px 10px", border: "none", borderRadius: 5,
                      background: isPreviewing ? C.red : (selected ? "#fff" : C.teal),
                      color: isPreviewing ? "#fff" : (selected ? C.teal : "#fff"),
                      cursor: "pointer", fontSize: 11, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                    }}>
                    {isPreviewing ? <><FiSquare size={10}/>STOP</> : <><FiPlay size={10}/>PREVIEW</>}
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 10, fontStyle: "italic" }}>
            Voice preference is stored in your browser. Selection takes effect immediately across all B.E.A.U. voice features.
          </div>
        </div>
      </SettingsSection>

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Appearance Settings</button>
      </div>
    </div>
  );
}
