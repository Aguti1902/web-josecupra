import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import es from "./locales/es.json";
import en from "./locales/en.json";
import ca from "./locales/ca.json";
import usPitchEn from "./locales/usPitch.en.json";
import usPitchEs from "./locales/usPitch.es.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es, usPitch: usPitchEs },
      en: { translation: en, usPitch: usPitchEn },
      ca: { translation: ca, usPitch: usPitchEn },
    },
    fallbackLng: "es",
    supportedLngs: ["es", "en", "ca"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "depro_lang",
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
