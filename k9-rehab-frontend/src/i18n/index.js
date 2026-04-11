// ============================================================================
// i18n configuration for K9 Rehab Pro dashboard
// ----------------------------------------------------------------------------
// Scope: UI chrome only. Clinical content — exercise library entries, protocol
// output, B.E.A.U. AI responses, diet catalog product names, medical
// abbreviations, form dropdown options with clinical grading — stays in English
// across all locales per CLAUDE.md clinical safety rules.
//
// The non-English resource bundles are MACHINE-QUALITY drafts (see the TODO
// comment at the top of each locale file). Do not ship any non-English locale
// to paying customers without credentialed review.
// ============================================================================

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en   from "./locales/en.json";
import es   from "./locales/es.json";
import fr   from "./locales/fr.json";
import de   from "./locales/de.json";
import ptBR from "./locales/pt-BR.json";
import it   from "./locales/it.json";
import ja   from "./locales/ja.json";
import ko   from "./locales/ko.json";
import zhCN from "./locales/zh-CN.json";
import nl   from "./locales/nl.json";

// Supported locales — the language selector iterates this list. Each entry
// is { code, name, flag }. Flag emojis are visual shorthand only; the native
// `name` is the accessibility-correct label. Brazilian Portuguese and
// Simplified Chinese are explicit per product owner decision.
export const SUPPORTED_LOCALES = [
  { code: "en",    name: "English",    flag: "🇺🇸" },
  { code: "es",    name: "Español",    flag: "🇪🇸" },
  { code: "fr",    name: "Français",   flag: "🇫🇷" },
  { code: "de",    name: "Deutsch",    flag: "🇩🇪" },
  { code: "pt-BR", name: "Português",  flag: "🇧🇷" },
  { code: "it",    name: "Italiano",   flag: "🇮🇹" },
  { code: "ja",    name: "日本語",      flag: "🇯🇵" },
  { code: "ko",    name: "한국어",       flag: "🇰🇷" },
  { code: "zh-CN", name: "中文",        flag: "🇨🇳" },
  { code: "nl",    name: "Nederlands", flag: "🇳🇱" },
];

// Supported locale codes for the detector whitelist. Includes the base
// language aliases for hyphenated codes (pt, zh) so that whichever code i18next
// normalizes to during lookup is still in the whitelist.
const SUPPORTED_CODES = [
  ...SUPPORTED_LOCALES.map(l => l.code),
  "pt", "zh",
];

// Both region-specific codes AND base-language aliases are registered because
// i18next normalizes `zh-CN` → `zh` and `pt-BR` → `pt` during lookup. Without
// base aliases, lookups fall through to the English fallback. Aliasing both
// to the same bundle is safe — it's the same object reference.
const resources = {
  "en":    { translation: en },
  "es":    { translation: es },
  "fr":    { translation: fr },
  "de":    { translation: de },
  "pt-BR": { translation: ptBR },
  "pt":    { translation: ptBR },
  "it":    { translation: it },
  "ja":    { translation: ja },
  "ko":    { translation: ko },
  "zh-CN": { translation: zhCN },
  "zh":    { translation: zhCN },
  "nl":    { translation: nl },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_CODES,
    nonExplicitSupportedLngs: true,  // lets "pt" map to "pt-BR", "zh" to "zh-CN"
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "k9rp_lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
