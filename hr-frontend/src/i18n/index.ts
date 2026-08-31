import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/i18n/locales/en.json";
import ar from "@/i18n/locales/ar.json";

export const LANGUAGE_STORAGE_KEY = "app-language";
export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return stored === "ar" ? "ar" : "en";
}

function applyDocumentDirection(language: string) {
  if (typeof document === "undefined") return;

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
}

const initialLanguage = readStoredLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

applyDocumentDirection(initialLanguage);

i18n.on("languageChanged", (language) => {
  applyDocumentDirection(language);
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
});

export default i18n;
