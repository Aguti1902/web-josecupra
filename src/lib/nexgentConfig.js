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

export const LOCAL_SLIDES_PATH = "/nexgent/presentacion";
export const LOCAL_DEMO_FALLBACK = "/nexgent/pitch#palmeiras";

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

/** Demo interactiva NexGent — app externa o sección Palmeiras en el pitch local */
export function nexgentDemoUrl() {
  if (!NEXGENT_APP || isSameOriginNexGentApp()) return LOCAL_DEMO_FALLBACK;
  return `${NEXGENT_APP}/app/inicio`;
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
