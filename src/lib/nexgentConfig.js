export const DEPRO_ACCENT = "#0A36F7";
export const DEPRO_LOGO = "/logo.png";
export const NEXGENT_LOGO = "/LOGO NEXGENT.png";

export const LAKERS = {
  name: "Los Angeles Lakers",
  shortName: "Lakers",
  abbrev: "LAL",
  city: "Los Angeles, USA",
  logo: "/lakers.png",
  accent: "#552583",
  secondary: "#FDB927",
  team: "Plantilla NBA",
  category: "NBA · G League – Profesional",
  teams: 3,
  players: 18,
  coaches: 12,
  trainingDays: "Lun · Mié · Vie",
};

/** @deprecated Usar LAKERS */
export const PALMEIRAS = LAKERS;

export const LOCAL_SLIDES_PATH = "/nexgent/presentacion";
export const LOCAL_DEMO_PATH = "/nexgent/demo";
/** @deprecated Usar LOCAL_DEMO_PATH */
export const LOCAL_DEMO_FALLBACK = LOCAL_DEMO_PATH;

export const NEXGENT_APP = (import.meta.env.VITE_NEXGENT_URL || "").replace(/\/$/, "");

export function isExternalHref(href) {
  return typeof href === "string" && /^https?:\/\//i.test(href);
}

function isSameOriginNexGentApp() {
  if (!NEXGENT_APP || typeof window === "undefined") return false;
  try {
    return new URL(NEXGENT_APP).origin === window.location.origin;
  } catch {
    return false;
  }
}

/** Demo interactiva Lakers — dashboard local en el sitio DEPRO */
export function nexgentDemoUrl() {
  return LOCAL_DEMO_PATH;
}

/** Presentación diapositivas — siempre en el sitio DEPRO */
export function nexgentSlidesUrl() {
  return LOCAL_SLIDES_PATH;
}

/** @deprecated Usar nexgentDemoUrl() */
export function nexgentUrl(path) {
  if (!NEXGENT_APP || isSameOriginNexGentApp()) return null;
  return `${NEXGENT_APP}${path}`;
}
