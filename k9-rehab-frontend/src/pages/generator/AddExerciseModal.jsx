import React from "react";
import { FiX, FiSearch } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { useTr } from "../../i18n/useTr";

export default function AddExerciseModal({ addingToWeek, filteredEx, addExercise, exSearch, setExSearch, setShowAddModal }) {
  const tr = useTr();
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: C.surface, borderRadius: 16, padding: 24, width: 560,
        maxHeight: "80vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: C.text, fontSize: 16 }}>
            {tr("Add Exercise to Week")} {typeof addingToWeek === "number" ? addingToWeek + 1 : addingToWeek}
          </h3>
          <button onClick={() => { setShowAddModal(false); setExSearch(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: 12 }}>
          <FiSearch size={14} style={{ position: "absolute", left: 10, top: 10, color: C.textLight }} />
          <input style={{ ...S.input, paddingLeft: 32 }}
            placeholder={tr("Search exercises by name or category…")}
            value={exSearch} onChange={e => setExSearch(e.target.value)}
            autoFocus />
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {filteredEx.slice(0, 40).map(ex => (
            <div key={ex.code}
              onClick={() => addExercise(addingToWeek, ex)}
              style={{
                padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                marginBottom: 4, border: `1px solid ${C.borderLight}`,
                transition: "background 0.1s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.borderLight}
              onMouseLeave={e => e.currentTarget.style.background = C.surface}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{ex.name}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                <span style={S.badge("blue")}>{tr(ex.category)}</span>
                <span style={S.badge(ex.difficulty_level === "Easy" ? "green" : ex.difficulty_level === "Advanced" ? "orange" : "blue")}>
                  {tr(ex.difficulty_level)}
                </span>
              </div>
            </div>
          ))}
          {filteredEx.length === 0 && (
            <div style={{ textAlign: "center", color: C.textLight, padding: 24 }}>{tr("No exercises found")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
