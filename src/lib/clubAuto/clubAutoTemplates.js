/**
 * Plantillas de protocolo club automático (Campo/Gym × A/B/C).
 * Capa separada — no afecta al motor individual ni a coachEngine.
 */

/** @typedef {{ slot: string, label: string, work?: string, format?: string }} ProtocolSlot */

export const PROTOCOL_DAY_META = {
  A: { label: "Regenerativo / control", intensidadDia: "regenerativo", grupoMicrociclo: "regenerativo" },
  B: { label: "Fuerza / potencia / carga alta", intensidadDia: "carga_alta", grupoMicrociclo: "carga_alta" },
  C: { label: "Coordinación / prepartido", intensidadDia: "prepartido", grupoMicrociclo: "prepartido" },
};

export const CLUB_AUTO_PROTOCOL_TEMPLATES = {
  campo_A: {
    id: "campo_A",
    entorno: "campo",
    protocolo: "A",
    title: "Campo A — regenerativo / control",
    format: "6 ejercicios × 45\" trabajo / 15\" cambio",
    slots: [
      { slot: "movilidad_cadera", label: "Movilidad de cadera" },
      { slot: "movilidad_tobillo", label: "Movilidad de tobillo o bisagra" },
      { slot: "cadena_posterior", label: "Activación cadena posterior" },
      { slot: "core_control", label: "Core control" },
      { slot: "equilibrio", label: "Equilibrio / propiocepción" },
      { slot: "desplazamiento_controlado", label: "Desplazamiento controlado" },
    ],
  },
  campo_B: {
    id: "campo_B",
    entorno: "campo",
    protocolo: "B",
    title: "Campo B — fuerza, pliometría y aceleración",
    format: "6 ejercicios × 45\" trabajo / 15\" cambio",
    slots: [
      { slot: "fuerza_bilateral_anterior", label: "Fuerza bilateral anterior" },
      { slot: "fuerza_unilateral", label: "Fuerza unilateral" },
      { slot: "cadena_posterior", label: "Cadena posterior" },
      { slot: "core_estabilidad", label: "Core / estabilidad" },
      { slot: "pliometria", label: "Pliometría" },
      { slot: "aceleracion", label: "Aceleración / sprint corto" },
    ],
  },
  campo_C: {
    id: "campo_C",
    entorno: "campo",
    protocolo: "C",
    title: "Campo C — coordinación, velocidad corta y reacción",
    format: "6 ejercicios × 45\" trabajo / 15\" cambio",
    slots: [
      { slot: "coordinacion_pies", label: "Coordinación de pies" },
      { slot: "pliometria", label: "Ritmo / rebote" },
      { slot: "desplazamiento_controlado", label: "Desplazamiento técnico" },
      { slot: "aceleracion", label: "Aceleración corta" },
      { slot: "reaccion", label: "Reacción" },
      { slot: "COD", label: "COD / sprint corto + frenada" },
    ],
  },
  gym_A: {
    id: "gym_A",
    entorno: "gym",
    protocolo: "A",
    title: "Gym A — movilidad, estabilidad y fuerza básica",
    format: "Mixto: movilidad/core por tiempo · fuerza por reps",
    slots: [
      { slot: "movilidad_cadera", label: "Movilidad cadera/tobillo/torácica", alt: ["movilidad_tobillo", "movilidad_toracica"] },
      { slot: "core_estabilidad", label: "Core o estabilidad", alt: ["core_control"] },
      { slot: "fuerza_principal_anterior", label: "Fuerza básica dominante de rodilla" },
      { slot: "fuerza_principal_posterior", label: "Fuerza básica dominante de cadera" },
      { slot: "fuerza_unilateral", label: "Unilateral / compensatorio" },
      { slot: "locomocion_tecnica", label: "Locomoción / aceleración suave", alt: ["aceleracion"] },
    ],
  },
  gym_B: {
    id: "gym_B",
    entorno: "gym",
    protocolo: "B",
    title: "Gym B — fuerza principal, potencia y aceleración",
    format: "Fuerza por reps · pliometría por contactos · velocidad por distancia",
    slots: [
      { slot: "fuerza_principal_anterior", label: "Fuerza principal anterior" },
      { slot: "fuerza_principal_posterior", label: "Fuerza principal posterior" },
      { slot: "fuerza_unilateral", label: "Unilateral / complementario" },
      { slot: "core_estabilidad", label: "Core bajo carga" },
      { slot: "pliometria", label: "Pliometría / potencia" },
      { slot: "aceleracion", label: "Aceleración / sprint" },
    ],
  },
  gym_C: {
    id: "gym_C",
    entorno: "gym",
    protocolo: "C",
    title: "Gym C — fuerza rápida, coordinación y velocidad",
    format: "Mixto: coordinación · fuerza rápida · COD",
    slots: [
      { slot: "movilidad_tobillo", label: "Movilidad dinámica", alt: ["movilidad_cadera"] },
      { slot: "coordinacion_pies", label: "Coordinación técnica" },
      { slot: "fuerza_rapida", label: "Fuerza rápida / técnica" },
      { slot: "pliometria", label: "Pliometría reactiva" },
      { slot: "aceleracion", label: "Aceleración corta" },
      { slot: "COD", label: "Reacción / COD / sprint corto", alt: ["reaccion"] },
    ],
  },
};

export function resolveProtocolTemplateKey(protocolo, gymAccess) {
  const entorno = gymAccess ? "gym" : "campo";
  return `${entorno}_${protocolo}`;
}

export function getProtocolTemplate(protocolo, gymAccess) {
  const key = resolveProtocolTemplateKey(protocolo, gymAccess);
  return CLUB_AUTO_PROTOCOL_TEMPLATES[key] || CLUB_AUTO_PROTOCOL_TEMPLATES.campo_A;
}
