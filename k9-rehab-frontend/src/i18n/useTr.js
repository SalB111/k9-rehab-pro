// ============================================================================
// useTr — shared slug-based auto-translate hook
// ----------------------------------------------------------------------------
// Any component that receives hardcoded English strings can wrap them with
// tr() to get the active-locale translation from the `fields.*` namespace,
// falling back to the original English string when no translation exists.
//
// Usage:
//   import { useTr } from "../i18n/useTr";
//   const tr = useTr();
//   return <div>{tr("Patient Name")}</div>;
//
// Storage keys (data-model strings like "client::Species") MUST NOT pass
// through tr() — they are data, not display. Only wrap display text.
// ============================================================================

import { useTranslation } from "react-i18next";

export const slugField = (s) => {
  if (s == null) return "";
  return String(s).toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
};

export const useTr = () => {
  const { t } = useTranslation();
  return (text) => {
    if (text == null || text === "") return text;
    if (typeof text !== "string") return text;
    const slug = slugField(text);
    if (!slug) return text;
    return t(`fields.${slug}`, { defaultValue: text });
  };
};
