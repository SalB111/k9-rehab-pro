import React from "react";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { useTr } from "../../i18n/useTr";

export default function SectionHead({ icon: Icon, title }) {
  const tr = useTr();
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={S.sectionHeader()}>
        <Icon size={12} style={{ color: "#fff" }} /> {tr(title)}
      </div>
      <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1, marginTop: 2 }}>
        <div style={{ width: "200%", height: "100%", background: "linear-gradient(90deg, transparent, #39FF7E, #0EA5E9, #39FF7E, transparent)", animation: "neonFlatline 3s linear infinite" }} />
      </div>
    </div>
  );
}
