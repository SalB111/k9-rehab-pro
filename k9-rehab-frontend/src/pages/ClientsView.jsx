import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers, FiSearch, FiChevronRight,
  FiAlertTriangle, FiCheckCircle, FiHeart
} from "react-icons/fi";
import C from "../constants/colors";
import S from "../constants/styles";
import { API } from "../api/axios";
import { useToast } from "../components/Toast";
import { BREEDS, FELINE_BREEDS } from "./generator/constants";

// ─────────────────────────────────────────────
// CLIENTS VIEW
// ─────────────────────────────────────────────
function ClientsView({ setView, setSelectedPatient }) {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", species: "canine", breed: "", age: "", dob: "", weight: "", weight_kg: "", sex: "Male", condition: "", client_name: "", client_email: "", client_phone: "" });

  // ── Phase 1D: Weight lbs/kg + Age/DOB auto-conversion helpers ──
  const onLbs = (val) => {
    const next = { ...form, weight: val };
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) next.weight_kg = (n / 2.20462).toFixed(1);
    else if (val === "") next.weight_kg = "";
    setForm(next);
  };
  const onKg = (val) => {
    const next = { ...form, weight_kg: val };
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) next.weight = (n * 2.20462).toFixed(1);
    else if (val === "") next.weight = "";
    setForm(next);
  };
  const onAge = (val) => {
    const next = { ...form, age: val };
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0 && n < 30) {
      const now = new Date();
      const birthYear = now.getFullYear() - n;
      next.dob = `${birthYear}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    }
    setForm(next);
  };
  const onDob = (val) => {
    const next = { ...form, dob: val };
    if (val) {
      const birth = new Date(val);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) years--;
      if (years >= 0) next.age = String(years);
    }
    setForm(next);
  };
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    axios.get(`${API}/patients`).then(r => setClients(r.data?.data || r.data || [])).catch(() => toast("Failed to load patients")).finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/patients`, { ...form, age: +form.age, weight: +form.weight });
    setShowForm(false);
    setForm({ name: "", species: "canine", breed: "", age: "", dob: "", weight: "", weight_kg: "", sex: "Male", condition: "", client_name: "", client_email: "", client_phone: "" });
    axios.get(`${API}/patients`).then(r => setClients(r.data?.data || r.data || []));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} patient${count > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await axios.post(`${API}/patients/delete-batch`, { ids: Array.from(selectedIds) });
      setSelectedIds(new Set());
      const r = await axios.get(`${API}/patients`);
      setClients(r.data?.data || r.data || []);
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
    setDeleting(false);
  };

  const [search, setSearch] = useState("");
  const filtered = clients.filter(c =>
    !search || (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.breed || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.client_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.condition || "").toLowerCase().includes(search.toLowerCase())
  );
  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.teal }}>Loading patients...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiUsers size={16} style={{ color: C.teal }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{clients.length}</div>
              <div style={{ fontSize: 10, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Patients</div>
            </div>
          </div>
          <div style={{ position: "relative", minWidth: 260 }}>
            <FiSearch size={13} style={{ position: "absolute", left: 10, top: 11, color: C.textLight }} />
            <input style={{ ...S.input, paddingLeft: 32, fontSize: 12 }} placeholder="Search by name, breed, condition, owner..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {selectedIds.size > 0 && (
            <button style={{
              ...S.btn("dark"),
              background: C.red, color: "#fff",
              opacity: deleting ? 0.6 : 1,
            }} onClick={deleteSelected} disabled={deleting}>
              <FiAlertTriangle size={13} /> {deleting ? "Deleting..." : `Delete ${selectedIds.size} Selected`}
            </button>
          )}
          <button style={S.btn("dark")} onClick={() => setShowForm(!showForm)}>
Register Patient
          </button>
        </div>
      </div>

      {showForm && (
        <div style={S.card}>
          <div>
            <div style={S.sectionHeader()}>
              <FiHeart size={13} style={{ color: "#39FF7E" }} /> New Patient Registration
            </div>
            <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1 }}>
              <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
            </div>
          </div>
          <form onSubmit={submit}>
            {/* Species Toggle */}
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ ...S.label, marginBottom: 0 }}>Species *</label>
              <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
                {["canine", "feline"].map(sp => (
                  <button key={sp} type="button" onClick={() => setForm({ ...form, species: sp, breed: "" })} style={{
                    padding: "7px 18px", border: "none", cursor: "pointer",
                    background: form.species === sp ? C.teal : "transparent",
                    color: form.species === sp ? "#fff" : C.textLight,
                    fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                    transition: "all 0.15s",
                  }}>
                    {sp === "canine" ? "🐕 Canine" : "🐈 Feline"}
                  </button>
                ))}
              </div>
            </div>
            <div style={S.grid(3)}>
              <div>
                <label style={S.label}>Patient Name *</label>
                <input style={S.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Patient name" />
              </div>
              <div>
                <label style={S.label}>Breed *</label>
                <select style={{ ...S.select, width: "100%" }} value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} required>
                  <option value="">Select breed...</option>
                  {(form.species === "feline" ? FELINE_BREEDS : BREEDS).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Primary Condition *</label>
                <input style={S.input} value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} required placeholder="e.g. TPLO, Hip Dysplasia" />
              </div>
            </div>
            <div style={{ ...S.grid(2), marginTop: 12 }}>
              <div>
                <label style={S.label}>Owner Name *</label>
                <input style={S.input} value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} required />
              </div>
              <div>
                <label style={S.label}>Sex</label>
                <select style={{ ...S.select, width: "100%" }} value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}>
                  {["Male Intact", "Male Neutered", "Female Intact", "Female Spayed"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {/* ── Phase 1D: Age/DOB pair (auto-converts both ways) ── */}
            <div style={{ ...S.grid(2), marginTop: 12 }}>
              <div>
                <label style={S.label}>Date of Birth</label>
                <input style={S.input} type="date" value={form.dob} onChange={e => onDob(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Age (years)</label>
                <input style={S.input} type="number" min="0" max="30" placeholder="e.g. 6" value={form.age} onChange={e => onAge(e.target.value)} />
                <div style={{ fontSize: 10, color: "#888", marginTop: 4, fontStyle: "italic" }}>Auto-converts to/from DOB</div>
              </div>
            </div>
            {/* ── Phase 1D: Weight lbs/kg pair (auto-converts both ways) ── */}
            <div style={{ ...S.grid(2), marginTop: 12 }}>
              <div>
                <label style={S.label}>Weight (lbs)</label>
                <input style={S.input} type="number" step="0.1" placeholder="0.0" value={form.weight} onChange={e => onLbs(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Weight (kg)</label>
                <input style={S.input} type="number" step="0.1" placeholder="0.0" value={form.weight_kg} onChange={e => onKg(e.target.value)} />
                <div style={{ fontSize: 10, color: "#888", marginTop: 4, fontStyle: "italic" }}>Auto-converts to/from lbs</div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button type="submit" style={S.btn("success")}>
                <FiCheckCircle size={14} /> Save Patient Record
              </button>
              <button type="button" style={S.btn("ghost")} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 40, textAlign: "center", padding: "10px 0" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer", width: 15, height: 15, accentColor: C.teal }}
                  title={allSelected ? "Deselect all" : "Select all"}
                />
              </th>
              {["Patient", "Owner / Contact", "Signalment", "Condition", "Registered", ""].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: C.textLight, padding: 48 }}>
                {search ? "No patients match your search" : "No patients registered — use the button above to add your first patient"}
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} style={{
                cursor: "pointer", transition: "background 0.1s",
                background: selectedIds.has(c.id) ? "rgba(14,165,233,0.06)" : "transparent",
              }}
                onClick={() => { if (setView && setSelectedPatient) { setSelectedPatient(c); setView("patient"); } }}
                onMouseEnter={e => { if (!selectedIds.has(c.id)) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { if (!selectedIds.has(c.id)) e.currentTarget.style.background = "transparent"; }}>
                <td style={{ ...S.td, textAlign: "center", padding: "10px 0" }}
                  onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() => toggleSelect(c.id)}
                    style={{ cursor: "pointer", width: 15, height: 15, accentColor: C.teal }}
                  />
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: C.text }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>ID: {c.id}</div>
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight: 500 }}>{c.client_name || "—"}</div>
                  {c.client_email && <div style={{ fontSize: 11, color: C.textLight }}>{c.client_email}</div>}
                </td>
                <td style={S.td}>
                  <div style={{ fontSize: 12 }}>{c.breed || "—"}</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>
                    {c.age ? `${c.age}yr` : ""}{c.age && c.weight ? " · " : ""}{c.weight ? `${c.weight}lbs` : ""}
                    {c.sex ? ` · ${c.sex}` : ""}
                  </div>
                </td>
                <td style={S.td}>
                  {c.condition ? <span style={S.badge("blue")}>{c.condition}</span> : "—"}
                </td>
                <td style={S.td}>
                  <span style={{ fontSize: 11, color: C.textLight }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </span>
                </td>
                <td style={S.td}>
                  <FiChevronRight size={14} style={{ color: C.textLight }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientsView;
