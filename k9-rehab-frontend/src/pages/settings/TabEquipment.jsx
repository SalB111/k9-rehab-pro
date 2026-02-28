import React from "react";
import { FiAlertTriangle, FiActivity, FiTool } from "react-icons/fi";
import C from "../../constants/colors";
import S from "../../constants/styles";
import { settingsStyles, sty } from "./constants";
import { SettingsToggle, SettingsSection } from "./SettingsShared";

export function TabEquipment({ equipment, setEquipment, flashSave, isOpen, toggleSection }) {
  return (
    <div>
      <div style={{
        padding: "12px 16px", marginBottom: 12, borderRadius: 8,
        background: "rgba(245,158,11,0.1)", border: `1px solid rgba(245,158,11,0.4)`,
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 12, color: C.amber, fontWeight: 600,
      }}>
        <FiAlertTriangle size={14} />
        Equipment settings gate protocol generation — exercises requiring unavailable equipment will be excluded automatically
      </div>

      <SettingsSection id="equip_aquatic" open={isOpen("equip_aquatic")} onToggle={toggleSection} icon={FiActivity} title="Aquatic Therapy">
        <SettingsToggle value={equipment.underwater_treadmill}
          onChange={v => setEquipment({ ...equipment, underwater_treadmill: v })}
          label="Underwater Treadmill (UWTT)"
          desc="Hudson Aquatic, Ferno, or equivalent — required for controlled aquatic gait training" />
        <SettingsToggle value={equipment.therapeutic_pool}
          onChange={v => setEquipment({ ...equipment, therapeutic_pool: v })}
          label="Therapeutic Swimming Pool"
          desc="Heated pool with controlled access — swim-based conditioning and ROM" />
      </SettingsSection>

      <SettingsSection id="equip_electro" open={isOpen("equip_electro")} onToggle={toggleSection} icon={FiActivity} title="Electrotherapy & Modalities">
        <SettingsToggle value={equipment.nmes}
          onChange={v => setEquipment({ ...equipment, nmes: v })}
          label="Neuromuscular Electrical Stimulation (NMES)"
          desc="For muscle re-education and atrophy prevention — Millis & Levine Ch. 12" />
        <SettingsToggle value={equipment.tens}
          onChange={v => setEquipment({ ...equipment, tens: v })}
          label="Transcutaneous Electrical Nerve Stimulation (TENS)"
          desc="Pain modulation via gate control theory — analgesic applications" />
        <SettingsToggle value={equipment.pemf}
          onChange={v => setEquipment({ ...equipment, pemf: v })}
          label="Pulsed Electromagnetic Field Therapy (PEMF)"
          desc="Non-invasive bone healing and pain reduction" />
        <SettingsToggle value={equipment.therapeutic_ultrasound}
          onChange={v => setEquipment({ ...equipment, therapeutic_ultrasound: v })}
          label="Therapeutic Ultrasound"
          desc="Deep tissue heating — periarticular fibrosis, scar tissue, joint stiffness" />
      </SettingsSection>

      <SettingsSection id="equip_photo" open={isOpen("equip_photo")} onToggle={toggleSection} icon={FiActivity} title="Photobiomodulation (Laser Therapy)">
        <SettingsToggle value={equipment.class_iii_laser}
          onChange={v => setEquipment({ ...equipment, class_iii_laser: v })}
          label="Class III (Cold) Laser"
          desc="Low-level laser therapy — superficial tissue, wound healing" />
        <SettingsToggle value={equipment.class_iv_laser}
          onChange={v => setEquipment({ ...equipment, class_iv_laser: v })}
          label="Class IV Therapeutic Laser"
          desc="Deep tissue penetration — pain, inflammation, tissue repair" />
      </SettingsSection>

      <SettingsSection id="equip_manual" open={isOpen("equip_manual")} onToggle={toggleSection} icon={FiTool} title="Manual Therapy & Exercise Equipment">
        <div style={S.grid(2)}>
          {[
            ["cavaletti_rails", "Cavaletti Rails", "Gait patterning, proprioception, stride length"],
            ["balance_discs", "Balance Discs / BOSU", "Proprioceptive training, weight shifting"],
            ["wobble_boards", "Wobble Boards", "Dynamic balance, core stability"],
            ["physio_balls", "Physio / Peanut Balls", "Core stabilization, weight shifting"],
            ["rocker_boards", "Rocker Boards", "Controlled instability training"],
            ["ramps_stairs", "Ramps & Stairs", "Incline/decline strengthening, functional mobility"],
            ["land_treadmill", "Land Treadmill", "Controlled gait speed, endurance training"],
            ["resistance_bands", "Resistance Bands", "Progressive resistance exercises"],
            ["weight_vests", "Weight Vests", "Graduated loading for strengthening"],
            ["harness", "Support Harness", "Assisted ambulation, safety during exercises"],
            ["sling", "Abdominal Sling", "Hindquarter support during early rehabilitation"],
            ["cryotherapy", "Cryotherapy", "Ice packs, cold compression — post-exercise inflammation control"],
            ["thermotherapy", "Thermotherapy", "Warm packs, moist heat — pre-exercise tissue preparation"],
          ].map(([key, label, desc]) => (
            <div key={key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 8,
              background: equipment[key] ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.05)",
              border: equipment[key] ? `1px solid rgba(16,185,129,0.4)` : `1px solid rgba(255,255,255,0.15)`,
              transition: "all 0.15s",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{desc}</div>
              </div>
              <div style={settingsStyles.toggleTrack(equipment[key])} onClick={() => setEquipment({ ...equipment, [key]: !equipment[key] })}>
                <div style={settingsStyles.toggleDot} />
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <div style={sty.saveBar}>
        <button style={S.btn("dark")} onClick={flashSave}>Save Equipment Profile</button>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          {Object.values(equipment).filter(Boolean).length} of {Object.keys(equipment).length} items available
        </span>
      </div>
    </div>
  );
}
