// Weight Calculator — in-app BCS / ideal weight + caloric needs (RER/MER).
// Inline styles, no Tailwind theme deps; evidence sourced from Millis & Levine,
// WSAVA, Laflamme (1997), and NRC 2006.

import React, { useMemo, useState } from "react";
import { FiPercent, FiHeart } from "react-icons/fi";
import C from "../constants/colors";
import {
  getBCSScale, getActivityFactors,
  calcRER, calcMER, kgToLb, lbToKg, roundTo,
} from "./calculators/calculatorFormulas";

const Label = ({ children }) => (
  <label style={{
    fontSize: 10, fontWeight: 700, color: C.textMid,
    textTransform: "uppercase", letterSpacing: ".08em",
    display: "block", marginBottom: 6,
  }}>{children}</label>
);

const Input = (props) => (
  <input {...props} style={{
    width: "100%", padding: "9px 12px",
    border: `1px solid ${C.border}`, borderRadius: 6,
    fontSize: 13, color: C.text, background: C.surface,
    ...props.style,
  }} />
);

const Select = (props) => (
  <select {...props} style={{
    width: "100%", padding: "9px 12px",
    border: `1px solid ${C.border}`, borderRadius: 6,
    fontSize: 13, color: C.text, background: C.surface,
    cursor: "pointer",
    ...props.style,
  }} />
);

const SourceFooter = ({ text }) => (
  <p style={{
    marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}`,
    fontSize: 11, fontStyle: "italic", color: C.textLight,
  }}>Source: {text}</p>
);

export default function RehabCalculatorsView() {
  const [species, setSpecies] = useState("canine");
  const [tab, setTab] = useState("bcs");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>
      {/* ── Page header ───────────────────────────────────────────── */}
      <div style={{
        padding: "20px 24px", marginBottom: 20, borderRadius: 12,
        background: `linear-gradient(135deg, ${C.surface}, ${C.tealLight}15)`,
        borderTop: `4px solid ${C.teal}`, border: `1px solid ${C.border}`,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: C.teal,
          textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4,
        }}>Clinical Decision Support</div>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: C.text }}>
          Weight Calculator
        </h2>
        <p style={{ margin: 0, fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>
          Body condition scoring, ideal weight projection, and caloric needs
          (resting &amp; maintenance energy requirements).
        </p>
      </div>

      {/* ── Species toggle + tab switcher ─────────────────────────── */}
      <div style={{
        display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "inline-flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3 }}>
          {["canine", "feline"].map(sp => (
            <button key={sp} onClick={() => setSpecies(sp)} style={{
              padding: "6px 16px", fontSize: 12, fontWeight: 700,
              background: species === sp ? C.navy : "transparent",
              color: species === sp ? "#fff" : C.textMid,
              border: "none", borderRadius: 6, cursor: "pointer",
              textTransform: "capitalize", transition: "all .15s",
            }}>{sp}</button>
          ))}
        </div>
        <div style={{ display: "inline-flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3 }}>
          {[
            { id: "bcs",     label: "BCS / Ideal Weight", icon: FiPercent },
            { id: "caloric", label: "Caloric Needs",      icon: FiHeart },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 700,
                background: tab === t.id ? C.teal : "transparent",
                color: tab === t.id ? "#fff" : C.textMid,
                border: "none", borderRadius: 6, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                transition: "all .15s",
              }}>
                <Icon size={12} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Calculator body ───────────────────────────────────────── */}
      <div style={{
        background: C.surface, borderRadius: 12, padding: "24px 28px",
        border: `1px solid ${C.border}`,
      }}>
        {tab === "bcs" ? <BCSCalc species={species} /> : <CaloricCalc species={species} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BCS / Ideal Weight
// ═══════════════════════════════════════════════════════════════
function BCSCalc({ species }) {
  const scale = getBCSScale(species);
  const [unit, setUnit] = useState("kg");
  const [currentWeight, setCurrentWeight] = useState("");
  const [bcs, setBcs] = useState(5);

  const currentKg = useMemo(() => {
    const n = parseFloat(currentWeight);
    if (!n || n <= 0) return 0;
    return unit === "kg" ? n : lbToKg(n);
  }, [currentWeight, unit]);

  const bcsEntry = scale.find(b => b.score === bcs);
  const idealKg = bcsEntry && currentKg ? roundTo(currentKg * (100 / bcsEntry.pctOfIdeal), 2) : null;
  const diffKg  = idealKg != null && currentKg ? roundTo(currentKg - idealKg, 2) : null;
  const pctDiff = idealKg && currentKg ? roundTo(((currentKg - idealKg) / idealKg) * 100, 1) : null;
  const direction = diffKg == null ? null : diffKg > 0 ? "over" : diffKg < 0 ? "under" : "ideal";
  const weeklyLoss = diffKg && diffKg > 0 ? roundTo(idealKg * 0.015, 2) : null;
  const weeksToGoal = weeklyLoss && diffKg > 0 ? Math.ceil(diffKg / weeklyLoss) : null;

  return (
    <>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.navy }}>
        Body Condition Score &amp; Ideal Weight
      </h3>
      <p style={{ margin: "0 0 18px", fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>
        WSAVA 9-point Body Condition Score → ideal weight + weight-loss projection.{" "}
        <span style={{ color: C.teal, fontWeight: 600 }}>{species === "feline" ? "Feline" : "Canine"} descriptors.</span>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <Label>Current Body Weight</Label>
          <div style={{ display: "flex", gap: 6 }}>
            <Input type="number" step="0.1" min="0" value={currentWeight}
              placeholder="0.0"
              onChange={e => setCurrentWeight(e.target.value)} />
            <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
              {["kg", "lb"].map(u => (
                <button key={u} onClick={() => setUnit(u)} style={{
                  padding: "0 12px", fontSize: 11, fontWeight: 700,
                  background: unit === u ? C.navyMid : C.surface,
                  color: unit === u ? "#fff" : C.textMid,
                  border: "none", cursor: "pointer",
                }}>{u}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <Label>Body Condition Score (1–9)</Label>
          <Select value={bcs} onChange={e => setBcs(parseInt(e.target.value, 10))}>
            {scale.map(b => (
              <option key={b.score} value={b.score}>
                {b.score}/9 — {b.label} ({b.pctOfIdeal}% of ideal)
              </option>
            ))}
          </Select>
        </div>
      </div>

      {bcsEntry && (
        <div style={{
          padding: "12px 16px", marginBottom: 14,
          background: `${C.teal}10`, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.teal}`,
          borderRadius: 6,
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.textMid, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>
            BCS {bcsEntry.score}/9 — {bcsEntry.label}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.55 }}>{bcsEntry.description}</p>
        </div>
      )}

      {idealKg != null && currentKg > 0 && (
        <div style={{
          padding: "18px 20px",
          background: `linear-gradient(135deg, ${C.tealLight}15, ${C.greenBg})`,
          border: `1px solid ${C.teal}33`, borderTop: `3px solid ${C.teal}`,
          borderRadius: 8,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: weeksToGoal ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 16 }}>
            <Stat label="Current" value={`${roundTo(currentKg, 2)} kg`} sub={`${kgToLb(currentKg)} lb`} />
            <Stat label="Ideal"   value={`${idealKg} kg`} sub={`${kgToLb(idealKg)} lb`} tone="teal" />
            <Stat
              label={direction === "over" ? "Over Ideal" : direction === "under" ? "Under Ideal" : "Status"}
              value={direction === "ideal" ? "At ideal" : `${Math.abs(diffKg)} kg`}
              sub={direction === "ideal" ? "✓" : `${pctDiff > 0 ? "+" : ""}${pctDiff}%`}
              tone={direction === "ideal" ? "green" : "amber"}
            />
            {weeksToGoal && (
              <Stat label="Est. to Goal" value={`~${weeksToGoal} wk`} sub={`@ ${weeklyLoss} kg/wk`} />
            )}
          </div>
          {direction === "over" && (
            <p style={{
              margin: "14px 0 0", paddingTop: 12,
              borderTop: `1px solid ${C.teal}22`,
              fontSize: 11, color: C.textMid, fontStyle: "italic", lineHeight: 1.5,
            }}>
              Safe weight loss: 1–2% of body weight per week. Projection assumes 1.5%/week of ideal weight with RER-fed weight-loss diet.
            </p>
          )}
        </div>
      )}

      <SourceFooter text="Laflamme DP. Canine Pract 1997;22:10-15. WSAVA Global Nutrition Guidelines." />
    </>
  );
}

function Stat({ label, value, sub, tone }) {
  const valueColor =
    tone === "teal"  ? C.teal  :
    tone === "green" ? C.green :
    tone === "amber" ? C.amber :
                       C.navy;
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 800, color: C.textMid, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: valueColor, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Caloric Needs (RER / MER)
// ═══════════════════════════════════════════════════════════════
function CaloricCalc({ species }) {
  const factors = getActivityFactors(species);
  const defaultKey = species === "feline" ? "neutered_adult" : "weight_loss";
  const [unit, setUnit] = useState("kg");
  const [weight, setWeight] = useState("");
  const [activityKey, setActivityKey] = useState(defaultKey);

  // Reset activity default when species toggles
  React.useEffect(() => {
    setActivityKey(species === "feline" ? "neutered_adult" : "weight_loss");
  }, [species]);

  const weightKg = useMemo(() => {
    const n = parseFloat(weight);
    if (!n || n <= 0) return 0;
    return unit === "kg" ? n : lbToKg(n);
  }, [weight, unit]);

  const activity = factors.find(a => a.key === activityKey) || factors[0];
  const rer = calcRER(weightKg);
  const mer = calcMER(weightKg, activity.factor);
  const kcalPerKgDry = 350;
  const gramsPerDay = rer ? roundTo((rer / kcalPerKgDry) * 1000, 0) : 0;

  return (
    <>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.navy }}>
        Caloric Needs (RER / MER)
      </h3>
      <p style={{ margin: "0 0 18px", fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>
        Resting and maintenance energy requirement. RER = 70 × BW<sup>0.75</sup>.{" "}
        <span style={{ color: C.teal, fontWeight: 600 }}>{species === "feline" ? "Feline" : "Canine"} activity factors.</span>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <Label>Body Weight (use IDEAL weight for weight-loss calcs)</Label>
          <div style={{ display: "flex", gap: 6 }}>
            <Input type="number" step="0.1" min="0" value={weight}
              placeholder="0.0"
              onChange={e => setWeight(e.target.value)} />
            <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
              {["kg", "lb"].map(u => (
                <button key={u} onClick={() => setUnit(u)} style={{
                  padding: "0 12px", fontSize: 11, fontWeight: 700,
                  background: unit === u ? C.navyMid : C.surface,
                  color: unit === u ? "#fff" : C.textMid,
                  border: "none", cursor: "pointer",
                }}>{u}</button>
              ))}
            </div>
          </div>
          {weightKg > 0 && (
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 6 }}>
              {roundTo(weightKg, 2)} kg ({kgToLb(weightKg)} lb)
            </div>
          )}
        </div>
        <div>
          <Label>Life Stage / Activity</Label>
          <Select value={activityKey} onChange={e => setActivityKey(e.target.value)}>
            {factors.map(a => (
              <option key={a.key} value={a.key}>{a.label} (×{a.factor})</option>
            ))}
          </Select>
          {activity?.note && (
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 6, lineHeight: 1.4 }}>
              {activity.note}
            </div>
          )}
        </div>
      </div>

      {weightKg > 0 && (
        <div style={{
          padding: "18px 20px",
          background: `linear-gradient(135deg, ${C.tealLight}15, ${C.greenBg})`,
          border: `1px solid ${C.teal}33`, borderTop: `3px solid ${C.teal}`,
          borderRadius: 8,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Stat label="RER"
              value={<>{rer} <span style={{ fontSize: 12, fontWeight: 400, color: C.textLight }}>kcal/day</span></>}
              sub="Resting Energy Requirement" />
            <Stat label="MER" tone="teal"
              value={<>{mer} <span style={{ fontSize: 12, fontWeight: 400, color: C.textLight }}>kcal/day</span></>}
              sub={`Maintenance Energy (×${activity.factor})`} />
          </div>
          {activityKey === "weight_loss" && (
            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: `1px solid ${C.teal}22`,
              fontSize: 11, color: C.textMid, lineHeight: 1.55,
            }}>
              <strong style={{ color: C.text }}>Weight-loss guidance:</strong> Feed at RER ({rer} kcal/day).
              At ~350 kcal/100g typical therapeutic diet, target{" "}
              <strong>≈ {gramsPerDay} g/day</strong>. Reassess every 2 weeks — target 1–2% body weight loss/week.
            </div>
          )}
        </div>
      )}

      <SourceFooter text={species === "feline"
        ? "NRC 2006 Nutrient Requirements of Dogs and Cats; Millis & Levine feline chapter."
        : "Millis & Levine, Canine Rehabilitation and Physical Therapy 2nd ed., Ch. 14."} />
    </>
  );
}
