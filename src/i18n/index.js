import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import es from "./locales/es.json";
import en from "./locales/en.json";
import ca from "./locales/ca.json";
import usPitchEn from "./locales/usPitch.en.json";
import usPitchEs from "./locales/usPitch.es.json";
import usPitchDemosEn from "./locales/usPitch.demos.en.json";
import usPitchDemosEs from "./locales/usPitch.demos.es.json";
import usPitchExplorerEn from "./locales/usPitch.explorer.en.json";
import usPitchExplorerEs from "./locales/usPitch.explorer.es.json";
import nexgentPitchEn from "./locales/nexgentPitch.en.json";
import nexgentPitchEs from "./locales/nexgentPitch.es.json";

const mergeUsPitch = (base, demos, explorer) => ({ ...base, ...demos, ...explorer });

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es, usPitch: mergeUsPitch(usPitchEs, usPitchDemosEs, usPitchExplorerEs), nexgentPitch: nexgentPitchEs },
      en: { translation: en, usPitch: mergeUsPitch(usPitchEn, usPitchDemosEn, usPitchExplorerEn), nexgentPitch: nexgentPitchEn },
      ca: { translation: ca, usPitch: mergeUsPitch(usPitchEn, usPitchDemosEn, usPitchExplorerEn), nexgentPitch: nexgentPitchEn },
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
