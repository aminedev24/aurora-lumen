// ==============================================================================
// File: /frontend/src/i18n.ts
// Description: i18next initialization with EN, JA, FR, AR, ES — full multi-language + post-processing
// ==============================================================================

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// === Base locales ===
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import es from "./locales/es.json";

// === App-specific namespaces (optional) ===
import enApp from "./locales/app.en.json";
import frApp from "./locales/app.fr.json";
import esApp from "./locales/app.es.json";
import jaApp from "./locales/app.ja.json";
import arApp from "./locales/app.ar.json";

const STORAGE_KEY = "aurora_lang"; // 'auto' | 'en' | 'fr' | 'ja' | 'ar' | 'es'

// -----------------------------------------------------------------------------
// Helpers — language mapping and typography tweaks for Arabic
// -----------------------------------------------------------------------------

function applyArabicTypography(value: string): string {
  if (!value || typeof value !== "string") return value;
  return value
    .replace(/\?/g, "؟")
    .replace(/,/g, "،")
    .replace(/;/g, "؛");
}

function mapLang(l: string | null | undefined): "en" | "fr" | "ja" | "ar" | "es" {
  const v = (l || "").toLowerCase();
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("ja") || v.startsWith("jp")) return "ja";
  if (v.startsWith("ar")) return "ar";
  if (v.startsWith("es")) return "es";
  return "en";
}

function detectSystemLanguage(): "en" | "fr" | "ja" | "ar" | "es" {
  try {
    const nav: any = (globalThis as any).navigator;
    const list: string[] = nav?.languages || (nav?.language ? [nav.language] : []);
    for (const l of list) {
      const mapped = mapLang(l);
      if (mapped) return mapped;
    }
    return mapLang(nav?.language || "en");
  } catch {
    return "en";
  }
}

// -----------------------------------------------------------------------------
// User language persistence
// -----------------------------------------------------------------------------

export function setPreferredLanguage(
  lng: "auto" | "en" | "fr" | "ja" | "ar" | "es"
) {
  try {
    if (lng === "auto") {
      localStorage.removeItem(STORAGE_KEY);
      i18n.changeLanguage(detectSystemLanguage());
    } else {
      localStorage.setItem(STORAGE_KEY, lng);
      i18n.changeLanguage(lng);
    }
  } catch {
    i18n.changeLanguage(lng === "auto" ? detectSystemLanguage() : lng);
  }
}

function initialLanguage(): "en" | "fr" | "ja" | "ar" | "es" {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as any;
    if (saved && saved !== "auto") return mapLang(saved);
  } catch {}
  return detectSystemLanguage();
}

// -----------------------------------------------------------------------------
// Arabic typography post-processor
// -----------------------------------------------------------------------------

const arabicTypographyPostProcessor = {
  name: "arabicTypography",
  type: "postProcessor",
  process(value: any, _key: string | string[], options: any, translator: any) {
    if (typeof value !== "string") return value;
    const lng = mapLang(options?.lng || translator?.language || i18n.language);
    return lng === "ar" ? applyArabicTypography(value) : value;
  },
};

// -----------------------------------------------------------------------------
// i18next initialization
// -----------------------------------------------------------------------------

i18n
  .use(arabicTypographyPostProcessor as any)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en, app: enApp },
      ja: { translation: ja, app: jaApp },
      fr: { translation: fr, app: frApp },
      ar: { translation: ar, app: arApp },
      es: { translation: es, app: esApp },
    },
    lng: initialLanguage(),
    fallbackLng: "en",
    ns: ["translation", "app"],
    defaultNS: "translation",
    fallbackNS: "translation",
    interpolation: { escapeValue: false },
    postProcess: ["arabicTypography"],
    react: { useSuspense: false },
    supportedLngs: ["en", "fr", "ja", "ar", "es"],
  });

// -----------------------------------------------------------------------------
// Set <html lang> and direction automatically
// -----------------------------------------------------------------------------

const applyLangDir = (lng: string) => {
  try {
    const html = document.documentElement;
    const normalized = lng === "jp" ? "ja" : lng || "en";
    html.lang = normalized;
    html.dir = normalized === "ar" ? "rtl" : "ltr"; // ✅ fix: Arabic should be RTL
  } catch {}
};

applyLangDir(i18n.language);
i18n.on("languageChanged", (lng) => applyLangDir(lng));

export default i18n;
