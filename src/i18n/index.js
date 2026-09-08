import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import es from "./locales/es.json";
import ca from "./locales/ca.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      ca: { translation: ca },
      en: { translation: en },
    },
    fallbackLng: "es",
    supportedLngs: ["es", "ca", "en"],
    // App content has only ever been Spanish; if a returning visitor's
    // browser reports e.g. "fr" or "pt", falling back to that instead of
    // Spanish would be a worse default than the one they're already used to.
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
