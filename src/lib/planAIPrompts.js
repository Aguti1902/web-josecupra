/**
 * Prompts IA para generación de planes — PDF §11
 */

function formatExerciseList(exercises) {
  return (exercises || [])
    .map((e) => {
      const poolStr = e.pool ? ` pool:${e.pool}` : "";
      return `- ${e.nombre} [${(e.etiquetas || []).join(", ")}] material:${e.material}${poolStr}`;
    })
    .join("\n");
}

function formatPlantilla(plantilla) {
  if (!plantilla?.blocks) return "";
  return plantilla.blocks
    .map((b) => {
      if (Array.isArray(b.slots)) {
        const slotDesc = b.slots.map((s) => s.pool || s.poolPattern || s.poolFamily || "?").join(", ");
        return `${b.label} (${b.duration}): pools [${slotDesc}]`;
      }
      return `${b.label} (${b.duration}): ${b.slots} ejercicios [${(b.tags || []).join(", ")}]`;
    })
    .join("\n");
}

/** §11.1 Prompt principal de generación de sesión */
export function buildSessionPrompt({
  user,
  sessionType,
  diaSemana,
  distanciaPartido,
  intensidadPermitida,
  plantilla,
  ejercicios,
}) {
  const lesionTipo = (user?.lesion || []).filter((l) => l !== "Ninguna").join(", ") || "ninguna";
  const lesionSub = (user?.lesionSubtipo || []).join(", ") || "—";
  const material = Array.isArray(user?.material) ? user.material.join(", ") : user?.material || "ninguno";

  const system = `Eres el motor de generación de planes individuales DEPRO. Tu función es generar sesiones de entrenamiento siguiendo EXACTAMENTE las reglas del sistema. No inventas estructuras, no cambias plantillas, no creas ejercicios nuevos. Solo rellenas la plantilla con ejercicios del catálogo proporcionado.

REGLAS ABSOLUTAS:
1. Solo usas ejercicios del catálogo proporcionado
2. Respetas la plantilla base sin modificar su estructura
3. Aplicas filtros de lesión correctamente
4. Adaptas series y repeticiones a la experiencia del usuario
5. Respetas el material disponible
6. Respetas la intensidad permitida para el día asignado`;

  const userPrompt = `DATOS DEL JUGADOR:
- Edad: ${user?.edad || "—"}
- Objetivo: ${user?.objetivo || "—"}
- Deporte: ${user?.deporte || "—"}
- Experiencia: ${user?.experiencia || "—"}
- Material disponible: ${material}
- Lesión: ${lesionTipo} / ${lesionSub}
- Día de competición: ${user?.diaCompeticion || user?.dia_competicion || "—"}

DATOS DE LA SESIÓN:
- Día asignado: ${diaSemana}
- Distancia al partido: ${distanciaPartido ?? "—"} días
- Intensidad permitida: ${intensidadPermitida}
- Tipo de sesión: ${sessionType}

PLANTILLA A USAR:
${formatPlantilla(plantilla)}

EJERCICIOS DISPONIBLES (filtrados por material, lesión, experiencia, intensidad):
${formatExerciseList(ejercicios)}

GENERA LA SESIÓN CON ESTA ESTRUCTURA:
- Calentamiento: duración y ejercicios
- Bloque principal: ejercicios con series, repeticiones, descanso
- Bloque complementario: ejercicios con series, repeticiones, descanso
- Core: si aplica según plantilla
- Vuelta a la calma: ejercicios y duración

ADAPTACIONES POR EXPERIENCIA:
- Novato: series 2-3, repeticiones 10-15, cargas ligeras
- Intermedio: series 3, repeticiones según objetivo
- Avanzado: series 3-4, repeticiones según objetivo

FORMATO DE SALIDA: JSON con la estructura completa de la sesión.
No añadas explicaciones. No modifiques la plantilla. No inventes ejercicios. Solo genera el JSON.`;

  return { system, user: userPrompt };
}

/** §11.2 Prompt para refrescar ejercicio */
export function buildRefreshExercisePrompt({
  ejercicioActual,
  funcion,
  grupoMuscular,
  intensidad,
  lesion,
  material,
  experiencia,
  ejerciciosSesion,
  ejerciciosCompatibles,
}) {
  const system = `Devuelve únicamente el JSON del nuevo ejercicio alternativo.`;

  const userPrompt = `Se necesita un ejercicio alternativo para reemplazar uno existente.

EJERCICIO A REEMPLAZAR:
- Nombre: ${ejercicioActual}
- Función en la plantilla: ${funcion}
- Grupo muscular: ${grupoMuscular}
- Intensidad: ${intensidad}

RESTRICCIONES DEL JUGADOR:
- Lesión: ${lesion || "ninguna"}
- Material disponible: ${material}
- Experiencia: ${experiencia}

EJERCICIOS YA UTILIZADOS EN ESTA SESIÓN (no repetir):
${(ejerciciosSesion || []).map((e) => `- ${e}`).join("\n")}

EJERCICIOS COMPATIBLES DISPONIBLES:
${formatExerciseList(ejerciciosCompatibles)}

REGLAS:
1. El nuevo ejercicio debe tener la misma función en la plantilla
2. El nuevo ejercicio debe trabajar el mismo grupo muscular o similar
3. El nuevo ejercicio debe tener la misma intensidad o menor
4. El nuevo ejercicio no puede estar contraindicado para la lesión del jugador
5. El nuevo ejercicio debe ser realizable con el material disponible

FORMATO DE SALIDA:
{ "nombre": "", "series": "", "repeticiones": "", "descanso": "", "notas": "" }`;

  return { system, user: userPrompt };
}

/** §11.3 Prompt para plan completo de 4 semanas */
export function buildFullPlanPrompt({ user, sessionTypes, plantillas, ejercicios }) {
  const lesionTipo = (user?.lesion || []).filter((l) => l !== "Ninguna").join(", ") || "ninguna";
  const lesionSub = (user?.lesionSubtipo || []).join(", ") || "—";
  const material = Array.isArray(user?.material) ? user.material.join(", ") : user?.material || "ninguno";
  const dias = (user?.disponibles || []).join(", ");

  const plantillasText = (plantillas || [])
    .map((p, i) => `${sessionTypes[i]}:\n${formatPlantilla(p)}`)
    .join("\n\n");

  const system = `Genera el plan completo de 4 semanas. Devuelve únicamente el JSON del plan completo.`;

  const userPrompt = `Genera el plan completo de 4 semanas para este jugador.

DATOS DEL JUGADOR:
- Edad: ${user?.edad}
- Objetivo principal: ${user?.objetivo}
- Objetivo secundario: ${user?.objetivoSecundario || "—"}
- Deporte: ${user?.deporte}
- Experiencia: ${user?.experiencia}
- Material disponible: ${material}
- Lesión: ${lesionTipo} / ${lesionSub}
- Día de competición habitual: ${user?.diaCompeticion || user?.dia_competicion || "—"}
- Días disponibles: ${dias}
- Frecuencia semanal: ${user?.frecuencia}

PLANTILLAS DISPONIBLES:
${plantillasText}

CATÁLOGO DE EJERCICIOS:
${formatExerciseList(ejercicios)}

PROCESO DE GENERACIÓN (prioridad: seguridad > disponibilidad > matriz fija > competición > separación de cargas):
1. Las sesiones semanales ya están fijadas por la matriz de objetivos (PDF 2.0): ${(sessionTypes || []).join(" → ") || "—"}
2. Usar exactamente esas sesiones en ese orden; no sustituir, reordenar tipos ni añadir sesiones aleatorias
3. Con frecuencia N, usar las primeras N sesiones de la secuencia fija de 5
4. Con 1 día/semana no hay objetivo secundario; la matriz usa solo el objetivo principal
5. El día de competición solo sirve para ordenar sesiones en los días disponibles, no para cambiar tipos
6. Separar cargas altas cuando sea posible, sin bloquear la generación
7. Para cada día disponible, calcular distancia al partido e intensidad permitida
8. No reorganizar días que el usuario no haya seleccionado
9. Selección de ejercicios determinista: misma entrada → mismos ejercicios
10. Repetir estructura para S1–S4 con variación controlada de ejercicios

FORMATO DE SALIDA:
{ "plan": { "semana_1": { "sesion_1": { "dia": "", "tipo": "", "contenido": {} }, ... }, "semana_2": {}, "semana_3": {}, "semana_4": {} } }`;

  return { system, user: userPrompt };
}

/** Compatibilidad con buildAIPrompt legacy en exercises.js */
export function buildAIPromptLegacy(params) {
  return buildSessionPrompt({
    user: params,
    sessionType: params.plantilla?.split(";")[0] || "Fuerza A",
    diaSemana: "—",
    distanciaPartido: null,
    intensidadPermitida: "alta",
    plantilla: { blocks: [] },
    ejercicios: params.exercises || [],
  });
}
