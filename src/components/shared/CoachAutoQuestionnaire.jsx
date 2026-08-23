/**
 * Cuestionario clave entrenador/club (tras «Tus datos»).
 * Campos: nivel (indispensable) · días · partido · duración · jugadores · material · gimnasio (protocolos).
 */
import { useMemo } from "react";
import { AlertCircle, Calendar, Clock, Dumbbell, Package, Trophy, Users } from "lucide-react";
import {
  validateCoachQuestionnaire,
  TRAIN_DAYS,
  CLUB_AUTO_NIVELES,
  CLUB_AUTO_MATCH_DAYS,
  CLUB_AUTO_DURATIONS,
  CLUB_AUTO_PLAYER_COUNTS,
  CLUB_AUTO_MATERIALS,
} from "../../lib/clubAuto/clubAutoCoachBridge";

function Chip({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl border text-sm font-bold transition-all ${
        active
          ? "bg-depro-blue border-depro-blue text-white"
          : "bg-white border-depro-border text-depro-gray hover:border-depro-blue/40"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

/**
 * @param {{
 *   value: object,
 *   onChange: (next: object) => void,
 *   showErrors?: boolean,
 * }} props
 */
export default function CoachAutoQuestionnaire({ value, onChange, showErrors = true }) {
  const form = {
    nivel: value?.nivel || "B",
    dias_exactos_entrenamiento: value?.dias_exactos_entrenamiento || [],
    dias_entrenamiento_semana: Number(
      value?.dias_entrenamiento_semana
      || (value?.dias_exactos_entrenamiento || []).length
      || 3
    ),
    dia_partido: value?.dia_partido || "sabado",
    duracion_sesion: value?.duracion_sesion || "75",
    num_jugadores: value?.num_jugadores || "14-18",
    material: Array.isArray(value?.material) ? value.material : [],
    acceso_gimnasio: value?.acceso_gimnasio === true || value?.acceso_gimnasio === "si" ? "si" : "no",
  };

  const validation = useMemo(() => validateCoachQuestionnaire(form), [form]);

  const patch = (partial) => {
    const next = { ...form, ...partial };
    if (partial.dias_exactos_entrenamiento) {
      next.dias_entrenamiento_semana = partial.dias_exactos_entrenamiento.length;
    }
    onChange(next);
  };

  const toggleDay = (day) => {
    const cur = form.dias_exactos_entrenamiento;
    const has = cur.includes(day);
    const next = has ? cur.filter((d) => d !== day) : [...cur, day];
    patch({ dias_exactos_entrenamiento: next, dias_entrenamiento_semana: next.length });
  };

  const toggleMaterial = (item) => {
    const cur = form.material;
    const next = cur.includes(item) ? cur.filter((m) => m !== item) : [...cur, item];
    patch({ material: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Trophy size={12} /> Nivel del equipo *
        </label>
        <p className="text-xs text-depro-gray mb-2">Necesario para elegir tareas A/B/C del motor.</p>
        <div className="flex flex-wrap gap-2">
          {CLUB_AUTO_NIVELES.map((n) => (
            <Chip key={n.id} active={form.nivel === n.id} onClick={() => patch({ nivel: n.id })}>
              {n.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Calendar size={12} /> ¿Qué días entrenáis habitualmente? *
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAIN_DAYS.map((day) => (
            <Chip
              key={day}
              active={form.dias_exactos_entrenamiento.includes(day)}
              onClick={() => toggleDay(day)}
            >
              {day}
            </Chip>
          ))}
        </div>
        <p className="text-xs text-depro-gray mt-1.5">
          {form.dias_exactos_entrenamiento.length} día{form.dias_exactos_entrenamiento.length === 1 ? "" : "s"} seleccionado{form.dias_exactos_entrenamiento.length === 1 ? "" : "s"}
        </p>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Trophy size={12} /> ¿Cuál es el día habitual de partido? *
        </label>
        <div className="flex flex-wrap gap-2">
          {CLUB_AUTO_MATCH_DAYS.map((m) => (
            <Chip key={m.id} active={form.dia_partido === m.id} onClick={() => patch({ dia_partido: m.id })}>
              {m.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Clock size={12} /> ¿Cuánto dura normalmente cada sesión? *
        </label>
        <div className="flex flex-wrap gap-2">
          {CLUB_AUTO_DURATIONS.map((d) => (
            <Chip key={d.id} active={form.duracion_sesion === d.id} onClick={() => patch({ duracion_sesion: d.id })}>
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Users size={12} /> ¿Cuántos jugadores/as suelen participar por sesión? *
        </label>
        <div className="flex flex-wrap gap-2">
          {CLUB_AUTO_PLAYER_COUNTS.map((p) => (
            <Chip key={p.id} active={form.num_jugadores === p.id} onClick={() => patch({ num_jugadores: p.id })}>
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Package size={12} /> ¿Qué material tenéis para los ejercicios? *
        </label>
        <p className="text-xs text-depro-gray mb-2">
          Igual que en las planificaciones individuales: sirve para elegir ejercicios (gimnasio, gomas, mancuernas…). No se usan conos ni vallas.
        </p>
        <div className="flex flex-wrap gap-2">
          {CLUB_AUTO_MATERIALS.map((m) => (
            <Chip key={m} active={form.material.includes(m)} onClick={() => toggleMaterial(m)}>
              {m}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Dumbbell size={12} /> Acceso a gimnasio *
        </label>
        <p className="text-xs text-depro-gray mb-2">Indispensable para elegir protocolos de campo o gym.</p>
        <div className="flex flex-wrap gap-2">
          {[{ id: "si", label: "Sí" }, { id: "no", label: "No" }].map((o) => (
            <Chip key={o.id} active={form.acceso_gimnasio === o.id} onClick={() => patch({ acceso_gimnasio: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      {showErrors && !validation.ok && (
        <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <ul className="space-y-0.5">
            {validation.errors.map((err) => <li key={err}>{err}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export { questionnaireToCoachConfig, validateCoachQuestionnaire } from "../../lib/clubAuto/clubAutoCoachBridge";
