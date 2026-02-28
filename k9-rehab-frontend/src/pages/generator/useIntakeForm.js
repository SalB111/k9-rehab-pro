import { useState, useEffect } from "react";
import { INITIAL_FORM } from "./constants";

const FORM_STORAGE_KEY = "k9rehab_intake_draft";

export default function useIntakeForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [weightWarning, setWeightWarning] = useState("");

  // Auto-load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) { /* ignore parse errors */ }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (form.patientName || form.clientName || form.diagnosis) {
      try { localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form)); } catch (e) { /* quota exceeded */ }
    }
  }, [form]);

  const clearSavedForm = () => {
    try { localStorage.removeItem(FORM_STORAGE_KEY); } catch (e) { /* */ }
  };

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // ── Weight conversion (KG ↔ LBS) with dosing safety warnings ──
  const validateWeight = (kg) => {
    const lbs = kg * 2.20462;
    const warnings = [];
    if (kg > 90) {
      warnings.push(`CRITICAL: ${kg} kg = ${lbs.toFixed(0)} lbs. Did you enter LBS in the KG field? This exceeds the weight of any known dog breed. Incorrect weight will cause medication dosing errors.`);
    } else if (kg > 70) {
      warnings.push(`Caution: ${kg} kg (${lbs.toFixed(0)} lbs) is very heavy. Confirm this is correct — only giant breeds (Mastiff, Great Dane, Saint Bernard) typically exceed 70 kg. Accurate weight is critical for safe drug dosing.`);
    } else if (kg > 0 && kg < 1) {
      warnings.push(`Warning: ${kg} kg = ${lbs.toFixed(1)} lbs — extremely low. Did you enter KG correctly? Neonates only. Verify before calculating drug doses.`);
    } else if (kg > 45 && kg <= 70) {
      warnings.push(`Note: ${kg} kg = ${lbs.toFixed(0)} lbs. This is in the large/giant breed range. If this is a medium breed, you may have entered LBS in the KG field.`);
    }
    return warnings.length > 0 ? warnings.join(" ") : "";
  };

  const handleWeightKg = (val) => {
    setField("weightKg", val);
    const kg = parseFloat(val);
    if (!isNaN(kg) && kg > 0) {
      setField("weightLbs", (kg * 2.20462).toFixed(1));
      setWeightWarning(validateWeight(kg));
    } else {
      setField("weightLbs", "");
      setWeightWarning("");
    }
  };

  const handleWeightLbs = (val) => {
    setField("weightLbs", val);
    const lbs = parseFloat(val);
    if (!isNaN(lbs) && lbs > 0) {
      const kg = lbs / 2.20462;
      setField("weightKg", kg.toFixed(1));
      if (lbs < 2) {
        setWeightWarning(`Warning: ${lbs} lbs = ${kg.toFixed(2)} kg — extremely low. Did you enter KG in the LBS field? Verify before calculating drug doses.`);
      } else if (lbs > 200) {
        setWeightWarning(`CRITICAL: ${lbs} lbs = ${kg.toFixed(1)} kg. No known dog breed exceeds 200 lbs. Please verify. Incorrect weight will cause medication dosing errors.`);
      } else {
        setWeightWarning(validateWeight(kg));
      }
    } else {
      setField("weightKg", "");
      setWeightWarning("");
    }
  };

  // ── DOB ↔ Age bidirectional ──
  const handleDob = (val) => {
    setField("dob", val);
    if (val) {
      const birth = new Date(val + "T00:00:00");
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years--;
      if (years < 0) years = 0;
      setField("age", String(years));
    } else {
      setField("age", "");
    }
  };

  const handleAge = (val) => {
    setField("age", val);
    const years = parseInt(val);
    if (!isNaN(years) && years >= 0 && years <= 30) {
      const now = new Date();
      const birthYear = now.getFullYear() - years;
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      setField("dob", `${birthYear}-${month}-${day}`);
    } else if (val === "") {
      setField("dob", "");
    }
  };

  // ── Surgery Date ↔ POD bidirectional + auto suture removal ──
  const handleSurgeryDate = (val) => {
    setField("surgeryDate", val);
    if (val) {
      const surgDate = new Date(val + "T00:00:00");
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffMs = now.getTime() - surgDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      setField("postOpDay", String(Math.max(0, diffDays)));
      const sutureDate = new Date(surgDate);
      sutureDate.setDate(sutureDate.getDate() + 14);
      const yr = sutureDate.getFullYear();
      const mo = String(sutureDate.getMonth() + 1).padStart(2, "0");
      const dy = String(sutureDate.getDate()).padStart(2, "0");
      setField("sutureRemovalDate", `${yr}-${mo}-${dy}`);
    } else {
      setField("postOpDay", "");
      setField("sutureRemovalDate", "");
    }
  };

  const handlePostOpDay = (val) => {
    setField("postOpDay", val);
    const days = parseInt(val);
    if (!isNaN(days) && days >= 0) {
      const surgDate = new Date();
      surgDate.setDate(surgDate.getDate() - days);
      const yr = surgDate.getFullYear();
      const mo = String(surgDate.getMonth() + 1).padStart(2, "0");
      const dy = String(surgDate.getDate()).padStart(2, "0");
      setField("surgeryDate", `${yr}-${mo}-${dy}`);
      const sutureDate = new Date(surgDate);
      sutureDate.setDate(sutureDate.getDate() + 14);
      const syr = sutureDate.getFullYear();
      const smo = String(sutureDate.getMonth() + 1).padStart(2, "0");
      const sdy = String(sutureDate.getDate()).padStart(2, "0");
      setField("sutureRemovalDate", `${syr}-${smo}-${sdy}`);
    } else if (val === "") {
      setField("surgeryDate", "");
      setField("sutureRemovalDate", "");
    }
  };

  // ── ZIP code → City/State auto-fill ──
  const handleZip = async (val) => {
    setField("zipCode", val);
    if (val.length === 5 && /^\d{5}$/.test(val)) {
      try {
        const r = await fetch(`https://api.zippopotam.us/us/${val}`);
        if (r.ok) {
          const data = await r.json();
          const place = data.places?.[0];
          if (place) {
            setField("city", place["place name"]);
            setField("state", place["state abbreviation"]);
          }
        }
      } catch {}
    }
  };

  return {
    form, setField, weightWarning,
    handleWeightKg, handleWeightLbs,
    handleDob, handleAge,
    handleSurgeryDate, handlePostOpDay,
    handleZip,
    clearSavedForm,
  };
}
