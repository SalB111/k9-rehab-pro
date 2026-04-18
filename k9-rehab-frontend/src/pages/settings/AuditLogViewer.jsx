import React, { useEffect, useState } from "react";
// Auth-aware axios.
import api, { API } from "../../api/axios";
import { FiFileText, FiDownload } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { SettingsSection } from "./SettingsShared";

export function AuditLogViewer() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const fetchLog = async () => {
    setLoading(true);
    try {
      const [logRes, statsRes] = await Promise.all([
        api.get(`/audit-log?limit=100`),
        api.get(`/audit-log/stats`)
      ]);
      setEntries(logRes.data.data || logRes.data.entries || []);
      setTotal(logRes.data.total || 0);
      setStats(statsRes.data.data || statsRes.data.stats || []);
    } catch (e) { console.error('Audit log fetch error:', e); }
    setLoading(false);
  };

  useEffect(() => { if (showLog) fetchLog(); }, [showLog]);

  const actionColor = (action) => {
    if (action?.includes('DELETE')) return C.red;
    if (action?.includes('PUT')) return C.amber;
    if (action?.includes('POST')) return C.green;
    return C.textLight;
  };

  return (
    <SettingsSection id="audit_log_viewer" open={showLog} onToggle={() => setShowLog(o => !o)} icon={FiFileText} title="Audit Log Viewer">
      {loading ? (
        <div style={{ padding: 20, textAlign: "center", color: C.textLight, fontSize: 13 }}>Loading audit entries...</div>
      ) : (
        <>
          {/* Stats summary */}
          {stats.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {stats.slice(0, 6).map((s, i) => (
                <div key={i} style={{
                  padding: "6px 12px", borderRadius: 6, background: "rgba(14,165,233,0.06)",
                  border: "1px solid rgba(14,165,233,0.15)", fontSize: 11
                }}>
                  <span style={{ fontWeight: 700, color: C.text }}>{s.count}</span>
                  <span style={{ color: C.textLight, marginLeft: 6 }}>{s.action}</span>
                </div>
              ))}
              <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(15,76,129,0.06)",
                border: "1px solid rgba(15,76,129,0.15)", fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: C.navy }}>{total}</span>
                <span style={{ color: C.textLight, marginLeft: 6 }}>total entries</span>
              </div>
            </div>
          )}

          {/* Log table */}
          {entries.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.textLight, fontSize: 13,
              background: C.bg, borderRadius: 8 }}>
              No audit entries yet. Entries are created when protocols are generated, patients are created, or data is modified.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Timestamp", "Action", "Resource", "User", "Status", "Detail"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10,
                        fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.id || i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ padding: "8px 10px", color: C.textLight, fontSize: 11, whiteSpace: "nowrap" }}>
                        {e.timestamp ? new Date(e.timestamp + 'Z').toLocaleString() : '\u2014'}
                      </td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: actionColor(e.action) }}>{e.action || '\u2014'}</td>
                      <td style={{ padding: "8px 10px", color: C.text }}>{e.resource_type || '\u2014'}</td>
                      <td style={{ padding: "8px 10px", color: C.textLight }}>{e.user_label || '\u2014'}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                          background: (e.status_code >= 200 && e.status_code < 300) ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
                          color: (e.status_code >= 200 && e.status_code < 300) ? C.green : C.red
                        }}>{e.status_code || '\u2014'}</span>
                      </td>
                      <td style={{ padding: "8px 10px", color: C.textLight, fontSize: 11, maxWidth: 200,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.detail || '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {entries.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.textLight }}>Showing {entries.length} of {total} entries</span>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={`${API}/audit-log/export`} download
                  style={{ ...S.btn("outline"), fontSize: 11, padding: "4px 12px", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  <FiDownload size={11} /> Export CSV
                </a>
                <button onClick={fetchLog} style={{ ...S.btn("outline"), fontSize: 11, padding: "4px 12px" }}>
                  Refresh
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </SettingsSection>
  );
}
