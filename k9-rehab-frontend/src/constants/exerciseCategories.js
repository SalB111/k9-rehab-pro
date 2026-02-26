import { getK9Icon } from "../K9Icons";

// Exercise category → icon mapping for visual identification
export const EXERCISE_CATEGORY_ICONS = {
  "Passive Therapy":        { icon: "🤲", bg: "#E0F2FE", color: "#0369A1" },
  "Active-Assisted":        { icon: "🏃", bg: "#ECFDF5", color: "#059669" },
  "Strengthening":          { icon: "💪", bg: "#FEF3C7", color: "#B45309" },
  "Balance":                { icon: "⚖️", bg: "#EDE9FE", color: "#7C3AED" },
  "Proprioception":         { icon: "⚖️", bg: "#EDE9FE", color: "#7C3AED" },
  "Gait Retraining":        { icon: "🐕", bg: "#F0FDF4", color: "#15803D" },
  "Aquatic Therapy":        { icon: "🌊", bg: "#E0F2FE", color: "#0284C7" },
  "Hydrotherapy":           { icon: "🌊", bg: "#E0F2FE", color: "#0284C7" },
  "Modality":               { icon: "⚡", bg: "#FFF7ED", color: "#C2410C" },
  "Therapeutic Modalities": { icon: "⚡", bg: "#FFF7ED", color: "#C2410C" },
  "Manual Therapy":         { icon: "✋", bg: "#FCE7F3", color: "#BE185D" },
  "Core Stability":         { icon: "🎯", bg: "#FEF9C3", color: "#A16207" },
  "Functional":             { icon: "🏅", bg: "#ECFDF5", color: "#047857" },
  "Sport Conditioning":     { icon: "🏅", bg: "#ECFDF5", color: "#047857" },
  "Complementary Therapy":  { icon: "🧘", bg: "#F5F3FF", color: "#6D28D9" },
  "Geriatric":              { icon: "🐾", bg: "#FFF1F2", color: "#BE123C" },
  "Neurological":           { icon: "🧠", bg: "#EFF6FF", color: "#1D4ED8" },
};

export function getExCategoryIcon(ex) {
  const cat = ex.category || ex.intervention_type || "";
  const SvgIcon = getK9Icon(cat);
  for (const [key, val] of Object.entries(EXERCISE_CATEGORY_ICONS)) {
    if (cat.toLowerCase().includes(key.toLowerCase())) return { ...val, SvgIcon };
  }
  return { icon: "🔬", bg: "#F1F5F9", color: "#475569", SvgIcon };
}
