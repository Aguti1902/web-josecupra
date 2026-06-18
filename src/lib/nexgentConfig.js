export const DEPRO_ACCENT = "#0A36F7";
export const DEPRO_LOGO = "/logo.png";
export const NEXGENT_LOGO = "/LOGO NEXGENT.png";

export const PALMEIRAS = {
  name: "Sociedade Esportiva Palmeiras",
  shortName: "Palmeiras",
  abbrev: "SEP",
  city: "São Paulo, Brasil",
  logo: "/Palmeiras_logo.svg.png",
  accent: "#006437",
  secondary: "#FDB913",
  team: "Sub-20",
  category: "Sub-17 – Profesional",
  teams: 8,
  players: 142,
  coaches: 14,
  trainingDays: "Seg · Qua · Sex",
};

export const NEXGENT_APP = (import.meta.env.VITE_NEXGENT_URL || "").replace(/\/$/, "");

export function nexgentUrl(path) {
  return NEXGENT_APP ? `${NEXGENT_APP}${path}` : null;
}

/** Presentación diapositivas — local en Vite o app NexGent externa */
export function nexgentSlidesUrl() {
  return NEXGENT_APP ? `${NEXGENT_APP}/presentacion` : "/nexgent/presentacion";
}
