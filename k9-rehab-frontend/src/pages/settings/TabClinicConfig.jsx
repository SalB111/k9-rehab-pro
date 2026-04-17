import React, { useState, useEffect } from "react";
import { FiGlobe, FiLock, FiUnlock, FiUsers, FiPlus, FiTrash2 } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { sty, settingsStyles as ss } from "./constants";
import { SettingsSection } from "./SettingsShared";
import { SUPPORTED_LOCALES } from "../../i18n";

const STORAGE_KEY_LANG = "k9_hospital_language";
const STORAGE_KEY_LOCK = "k9_hospital_language_locked";
const STORAGE_KEY_CLINICIANS = "k9_clinician_roster";
const STORAGE_KEY_STAFF = "k9_staff_roster";

export function TabClinicConfig({ isOpen, toggleSection, flashSave }) {
  // ── Hospital Language ──
  const [hospitalLang, setHospitalLang] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_LANG) || "en"; } catch { return "en"; }
  });
  const [langLocked, setLangLocked] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_LOCK) === "true"; } catch { return false; }
  });
  const [adminPw, setAdminPw] = useState("");
  const [showUnlock, setShowUnlock] = useState(false);

  const saveLang = () => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, hospitalLang);
      localStorage.setItem(STORAGE_KEY_LOCK, langLocked ? "true" : "false");
    } catch {}
    flashSave?.();
  };

  const toggleLock = () => {
    if (langLocked) {
      // Unlock requires admin password
      setShowUnlock(true);
    } else {
      setLangLocked(true);
    }
  };

  const confirmUnlock = () => {
    // Simple admin check (matches login password in real impl)
    if (adminPw.trim().length >= 4) {
      setLangLocked(false);
      setShowUnlock(false);
      setAdminPw("");
    }
  };

  // ── Clinician Roster ──
  const [clinicians, setClinicians] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CLINICIANS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [newClinician, setNewClinician] = useState({ name: "", title: "", license: "", specialty: "" });

  const addClinician = () => {
    if (!newClinician.name.trim()) return;
    const updated = [...clinicians, { ...newClinician, id: Date.now() }];
    setClinicians(updated);
    try { localStorage.setItem(STORAGE_KEY_CLINICIANS, JSON.stringify(updated)); } catch {}
    setNewClinician({ name: "", title: "", license: "", specialty: "" });
    flashSave?.();
  };

  const removeClinician = (id) => {
    const updated = clinicians.filter(c => c.id !== id);
    setClinicians(updated);
    try { localStorage.setItem(STORAGE_KEY_CLINICIANS, JSON.stringify(updated)); } catch {}
  };

  // ── Staff Roster ──
  const [staff, setStaff] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STAFF);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [newStaff, setNewStaff] = useState({ name: "", role: "", certification: "" });

  const addStaff = () => {
    if (!newStaff.name.trim()) return;
    const updated = [...staff, { ...newStaff, id: Date.now() }];
    setStaff(updated);
    try { localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(updated)); } catch {}
    setNewStaff({ name: "", role: "", certification: "" });
    flashSave?.();
  };

  const removeStaff = (id) => {
    const updated = staff.filter(s => s.id !== id);
    setStaff(updated);
    try { localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(updated)); } catch {}
  };

  const currentLocale = SUPPORTED_LOCALES.find(l => l.code === hospitalLang) || SUPPORTED_LOCALES[0];

  return (
    <div>
      {/* ── Hospital Language ── */}
      <SettingsSection id="hospital_language" open={isOpen("hospital_language")} onToggle={toggleSection} icon={FiGlobe} title="Hospital Language">
        <div style={{ marginBottom: 16 }}>
          <label style={sty.fieldLabel}>Default Language</label>
          <select
            style={{ ...S.input, fontSize: 14, fontWeight: 600, padding: "10px 12px" }}
            value={hospitalLang}
            onChange={e => setHospitalLang(e.target.value)}
          >
            {SUPPORTED_LOCALES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>
          <div style={sty.fieldHint}>
            Sets the default platform language for this clinic. Currently: {currentLocale.flag} {currentLocale.name}
          </div>
        </div>

        <div style={ss.toggleRow}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {langLocked ? <FiLock size={12} style={{ display: "inline", marginRight: 6 }} /> : <FiUnlock size={12} style={{ display: "inline", marginRight: 6 }} />}
              Lock language for all users at this clinic
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              {langLocked
                ? "Language is LOCKED. Sidebar language selector is hidden for all users."
                : "When locked, clinicians cannot override the hospital language."}
            </div>
          </div>
          <div style={ss.toggleTrack(langLocked)} onClick={toggleLock}>
            <div style={ss.toggleDot} />
          </div>
        </div>

        {showUnlock && (
          <div style={{ marginTop: 12, padding: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>Admin password required to unlock</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="password"
                style={{ ...S.input, flex: 1 }}
                placeholder="Enter admin password"
                value={adminPw}
                onChange={e => setAdminPw(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") confirmUnlock(); }}
              />
              <button
                onClick={confirmUnlock}
                style={{
                  padding: "8px 16px", background: "#ef4444", border: "none", color: "#fff",
                  borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700,
                }}>
                UNLOCK
              </button>
              <button
                onClick={() => { setShowUnlock(false); setAdminPw(""); }}
                style={{
                  padding: "8px 12px", background: "transparent", border: `1px solid ${C.border}`,
                  color: C.textMid, borderRadius: 6, cursor: "pointer", fontSize: 11,
                }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button onClick={saveLang} style={{
            padding: "10px 24px", background: C.green, border: "none", color: "#fff",
            borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: ".06em",
          }}>
            SAVE HOSPITAL LANGUAGE
          </button>
        </div>
      </SettingsSection>

      {/* ── Clinician Roster ── */}
      <SettingsSection id="clinician_roster" open={isOpen("clinician_roster")} onToggle={toggleSection} icon={FiUsers} title="Clinician Roster">
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>
          Add clinicians to populate the Attending Clinician dropdown across all blocks.
        </div>

        {clinicians.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            {clinicians.map(c => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", marginBottom: 4, borderRadius: 6,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                    {[c.title, c.license, c.specialty].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <button onClick={() => removeClinician(c.id)} style={{
                  background: "transparent", border: "none", color: "#ef4444",
                  cursor: "pointer", padding: 4,
                }}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["name", "Name", "Dr. Jane Smith"],
            ["title", "Title", "DVM, CCRP"],
            ["license", "License #", "VET-12345"],
            ["specialty", "Specialty", "Orthopedic Surgery"],
          ].map(([key, label, ph]) => (
            <div key={key}>
              <label style={{ ...sty.fieldLabel, fontSize: 10 }}>{label}</label>
              <input style={S.input} placeholder={ph} value={newClinician[key]}
                onChange={e => setNewClinician({ ...newClinician, [key]: e.target.value })} />
            </div>
          ))}
        </div>
        <button onClick={addClinician} disabled={!newClinician.name.trim()} style={{
          marginTop: 10, padding: "8px 18px",
          background: newClinician.name.trim() ? C.teal : C.border,
          border: "none", color: "#fff", borderRadius: 6, cursor: newClinician.name.trim() ? "pointer" : "not-allowed",
          fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
        }}>
          <FiPlus size={12} /> ADD CLINICIAN
        </button>
      </SettingsSection>

      {/* ── Staff Roster ── */}
      <SettingsSection id="staff_roster" open={isOpen("staff_roster")} onToggle={toggleSection} icon={FiUsers} title="Staff Roster">
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>
          Add rehabilitation nurses and assistants to populate the Nurse/Assistant dropdown.
        </div>

        {staff.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            {staff.map(s => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", marginBottom: 4, borderRadius: 6,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                    {[s.role, s.certification].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <button onClick={() => removeStaff(s.id)} style={{
                  background: "transparent", border: "none", color: "#ef4444",
                  cursor: "pointer", padding: 4,
                }}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            ["name", "Name", "Sarah Johnson"],
            ["role", "Role", "CVN, Rehab Nurse"],
            ["certification", "Certification", "CCRN"],
          ].map(([key, label, ph]) => (
            <div key={key}>
              <label style={{ ...sty.fieldLabel, fontSize: 10 }}>{label}</label>
              <input style={S.input} placeholder={ph} value={newStaff[key]}
                onChange={e => setNewStaff({ ...newStaff, [key]: e.target.value })} />
            </div>
          ))}
        </div>
        <button onClick={addStaff} disabled={!newStaff.name.trim()} style={{
          marginTop: 10, padding: "8px 18px",
          background: newStaff.name.trim() ? C.teal : C.border,
          border: "none", color: "#fff", borderRadius: 6, cursor: newStaff.name.trim() ? "pointer" : "not-allowed",
          fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
        }}>
          <FiPlus size={12} /> ADD STAFF MEMBER
        </button>
      </SettingsSection>
    </div>
  );
}
