import { useState, useEffect } from "react";
import {
  Brain,
  Plus,
  ChevronDown,
  ChevronUp,
  Flame,
  Dumbbell,
  Shield,
  Zap,
  Target,
  Video,
  CheckCircle,
  Circle,
  Edit3,
  Trash2,
  X,
  Save,
  ListChecks,
  Play,
  Sparkles,
  User,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { loadPlanBlocks, savePlanBlock, deletePlanBlock, togglePlanBlock, loadMedia } from "../../lib/adminStorage";
import { EXERCISES, TAGS } from "../../data/exercises";
import { Search, List, BookOpen } from "lucide-react";

const CATEGORIES = [
  { id: "físico", label: "Físico", icon: Flame, color: "text-orange-500 bg-orange-50" },
  { id: "técnica", label: "Técnica", icon: Target, color: "text-depro-blue bg-depro-blue/10" },
  { id: "táctica", label: "Táctica", icon: Shield, color: "text-purple-600 bg-purple-50" },
  { id: "prevención", label: "Prevención", icon: Zap, color: "text-green-600 bg-green-50" },
];
const POSITIONS = [
  "Portero", "Defensa Central", "Lateral", "Centrocampista",
  "Mediapunta", "Extremo", "Delantero",
];
const LEVELS = ["principiante", "intermedio", "avanzado"];
const GOALS_OPTIONS = [
  "velocidad", "potencia", "técnica", "control", "gol",
  "finalización", "lesiones", "prevención", "sprint",
];

function CategoryBadge({ cat }) {
  const found = CATEGORIES.find((c) => c.id === cat);
  if (!found) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{cat}</span>;
  const { label, icon: Icon, color } = found;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

/* ── Simulador IA ────────────────────────────────────────────── */
function IASimulator({ blocks }) {
  const [profile, setProfile] = useState({
    position: "Centrocampista",
    level: "intermedio",
    frequency: 3,
    goals: ["técnica"],
  });
  const [simulated, setSimulated] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (g) =>
    setProfile((p) => ({
      ...p,
      goals: p.goals.includes(g) ? p.goals.filter((x) => x !== g) : [...p.goals, g],
    }));

  const simulate = () => {
    setLoading(true);
    setSimulated(null);
    setTimeout(() => {
      const matched = blocks.filter((b) => {
        if (!b.active) return false;
        const posOk =
          b.targetPositions.includes("todos") || b.targetPositions.includes(profile.position);
        const levelOk = b.targetLevels.includes(profile.level);
        const freqOk = b.targetFrequency.includes(profile.frequency);
        const goalOk =
          b.targetGoals?.length === 0 ||
          b.targetGoals?.some((g) => profile.goals.includes(g));
        return posOk && levelOk && freqOk && goalOk;
      });

      const weekdays = ["Lunes", "Miércoles", "Viernes", "Sábado"].slice(0, profile.frequency);
      const plan = weekdays.map((day, i) => {
        const block = matched[i % Math.max(matched.length, 1)];
        return {
          day,
          block: block || null,
          withVideo: block?.linkedVideos?.length > 0,
        };
      });
      setSimulated({ matched, plan });
      setLoading(false);
    }, 900);
  };

  return (
    <div className="bg-gradient-to-br from-depro-blue/5 to-purple-50 border border-depro-blue/20 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-depro-blue/15">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-depro-blue" />
          <h2 className="font-bold text-depro-dark">Simulador de plan IA</h2>
        </div>
        <p className="text-sm text-depro-gray">
          Configura el perfil de un jugador de ejemplo y visualiza qué plan generaría la IA automáticamente con los bloques activos.
        </p>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile config */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase tracking-wide">Posición</label>
            <div className="flex flex-wrap gap-1.5">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProfile((pr) => ({ ...pr, position: p }))}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    profile.position === p
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase tracking-wide">Nivel</label>
              <div className="flex flex-col gap-1.5">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setProfile((p) => ({ ...p, level: l }))}
                    className={`py-1.5 rounded-lg border text-xs capitalize font-medium transition-colors ${
                      profile.level === l
                        ? "bg-depro-blue border-depro-blue text-white"
                        : "border-depro-border text-depro-gray hover:border-depro-blue"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase tracking-wide">
                Días/semana: <span className="text-depro-blue">{profile.frequency}</span>
              </label>
              <div className="flex flex-col gap-1.5">
                {[2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setProfile((p) => ({ ...p, frequency: d }))}
                    className={`py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      profile.frequency === d
                        ? "bg-depro-blue border-depro-blue text-white"
                        : "border-depro-border text-depro-gray hover:border-depro-blue"
                    }`}
                  >
                    {d} días
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase tracking-wide">Objetivos</label>
            <div className="flex flex-wrap gap-1.5">
              {GOALS_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize transition-colors ${
                    profile.goals.includes(g)
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={simulate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-depro-blue text-white font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Generando plan…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generar plan con IA
              </>
            )}
          </button>
        </div>

        {/* Result */}
        <div>
          {!simulated && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-depro-gray py-8">
              <Brain size={40} className="opacity-20 mb-3" />
              <p className="text-sm text-center">Configura el perfil y pulsa<br />"Generar plan con IA"</p>
            </div>
          )}

          {simulated && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-depro-dark">
                  Plan generado · {profile.frequency} días/semana
                </p>
                <span className="text-xs text-depro-gray">
                  {simulated.matched.length} bloque{simulated.matched.length !== 1 ? "s" : ""} aplicados
                </span>
              </div>

              {simulated.matched.length === 0 && (
                <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  Ningún bloque activo coincide con este perfil. Añade bloques o amplía los criterios de targeting.
                </div>
              )}

              {simulated.plan.map((entry, i) => {
                const videos = entry.block
                  ? mediaLibrary.filter((m) => entry.block.linkedVideos?.includes(m.id))
                  : [];
                return (
                  <div
                    key={i}
                    className={`bg-white rounded-xl border p-3 ${
                      entry.block ? "border-depro-border" : "border-dashed border-depro-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-depro-dark">{entry.day}</span>
                      {entry.block && <CategoryBadge cat={entry.block.category} />}
                    </div>
                    {entry.block ? (
                      <>
                        <p className="text-sm font-medium text-depro-dark">{entry.block.name}</p>
                        <p className="text-xs text-depro-gray mt-0.5">
                          {entry.block.exercises.length} ejercicios
                          {videos.length > 0 && ` · ${videos.length} vídeo${videos.length > 1 ? "s" : ""}`}
                        </p>
                        {videos.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {videos.map((v) => (
                              <span key={v.id} className="flex items-center gap-1 text-xs text-depro-blue bg-depro-blue/8 px-2 py-0.5 rounded-full">
                                <Play size={9} />
                                {v.title.slice(0, 22)}…
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-depro-gray italic">Sin bloque asignado · Descanso</p>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                <CheckCircle size={14} className="shrink-0" />
                <span>Así quedaría el plan mensual automático que la IA enviaría al jugador al completar el pago.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Block Card ──────────────────────────────────────────────── */
function BlockCard({ block, onToggle, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const linkedVideos = mediaLibrary.filter((m) => block.linkedVideos?.includes(m.id));

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-shadow hover:shadow-card ${
      block.active ? "border-depro-border" : "border-depro-border/50 opacity-60"
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CategoryBadge cat={block.category} />
              <span className="text-xs text-depro-gray">Prioridad #{block.priority}</span>
              {!block.active && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactivo</span>
              )}
            </div>
            <h3 className="font-semibold text-depro-dark">{block.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggle(block.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                block.active
                  ? "border-green-200 text-green-600 bg-green-50 hover:bg-green-100"
                  : "border-depro-border text-depro-gray hover:border-green-200 hover:text-green-600"
              }`}
              title={block.active ? "Desactivar" : "Activar"}
            >
              {block.active ? <CheckCircle size={14} /> : <Circle size={14} />}
            </button>
            <button
              onClick={() => onEdit(block)}
              className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
              title="Editar"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(block.id)}
              className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-red hover:text-depro-red transition-colors"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-depro-gray">
          <span className="flex items-center gap-1">
            <Target size={11} />
            {block.targetPositions.join(", ")}
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell size={11} />
            {block.targetLevels.join(", ")}
          </span>
          <span className="flex items-center gap-1">
            <Flame size={11} />
            {block.targetFrequency.join(", ")} días/sem
          </span>
        </div>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 flex items-center gap-1 text-xs text-depro-blue font-medium hover:underline"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Ocultar detalles" : "Ver ejercicios y vídeos"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-depro-border px-4 pb-4 pt-3 space-y-4">
          <div>
            <p className="text-xs font-semibold text-depro-dark mb-2 flex items-center gap-1">
              <ListChecks size={13} />
              Ejercicios ({block.exercises.length})
            </p>
            <div className="space-y-1.5">
              {block.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-depro-gray-light rounded-lg text-xs"
                >
                  <span className="font-medium text-depro-dark">{ex.name}</span>
                  <span className="text-depro-gray">
                    {ex.sets} series · {ex.reps} · {ex.rest}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {linkedVideos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-depro-dark mb-2 flex items-center gap-1">
                <Video size={13} />
                Vídeos que acompañan este bloque
              </p>
              <div className="space-y-1.5">
                {linkedVideos.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-2 px-3 py-2 bg-depro-blue/5 rounded-lg text-xs text-depro-blue"
                  >
                    <Play size={11} />
                    <span className="font-medium">{v.title}</span>
                    <span className="text-depro-gray ml-auto">{v.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {linkedVideos.length === 0 && (
            <p className="text-xs text-depro-gray italic">
              Sin vídeos vinculados — la IA incluirá el bloque sin material audiovisual.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Block Modal ─────────────────────────────────────────────── */
function BlockModal({ block, onClose, onSave }) {
  const isNew = !block;
  const [form, setForm] = useState(
    block ?? {
      name: "",
      category: "físico",
      targetPositions: [],
      targetLevels: [],
      targetFrequency: [],
      targetGoals: [],
      exercises: [{ name: "", sets: 3, reps: "10", rest: "60s" }],
      linkedVideos: [],
      active: true,
      priority: 99,
    }
  );

  const toggleArr = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }));

  const updateExercise = (i, field, val) =>
    setForm((f) => {
      const ex = [...f.exercises];
      ex[i] = { ...ex[i], [field]: val };
      return { ...f, exercises: ex };
    });

  const addExercise = () =>
    setForm((f) => ({ ...f, exercises: [...f.exercises, { name: "", sets: 3, reps: "10", rest: "60s" }] }));

  const removeExercise = (i) =>
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));

  const videos = mediaLibrary.filter((m) => m.type === "video");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">
            {isNew ? "Nuevo bloque de entrenamiento" : "Editar bloque"}
          </h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Nombre *</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej. Control orientado · nivel avanzado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    form.category === c.id
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Posiciones objetivo</label>
            <div className="flex flex-wrap gap-2">
              {["todos", ...POSITIONS].map((p) => (
                <button
                  key={p}
                  onClick={() => toggleArr("targetPositions", p)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    form.targetPositions.includes(p)
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Nivel del jugador</label>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => toggleArr("targetLevels", l)}
                  className={`flex-1 px-3 py-1.5 rounded-lg border text-sm capitalize font-medium transition-colors ${
                    form.targetLevels.includes(l)
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Días/semana</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => toggleArr("targetFrequency", d)}
                  className={`w-12 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                    form.targetFrequency.includes(d)
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-depro-dark">Ejercicios</label>
              <button
                onClick={addExercise}
                className="flex items-center gap-1 text-xs text-depro-blue font-medium hover:underline"
              >
                <Plus size={12} /> Añadir
              </button>
            </div>
            <div className="space-y-2">
              {form.exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="col-span-5 border border-depro-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Nombre"
                    value={ex.name}
                    onChange={(e) => updateExercise(i, "name", e.target.value)}
                  />
                  <input
                    className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Series"
                    value={ex.sets}
                    onChange={(e) => updateExercise(i, "sets", e.target.value)}
                  />
                  <input
                    className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Reps"
                    value={ex.reps}
                    onChange={(e) => updateExercise(i, "reps", e.target.value)}
                  />
                  <input
                    className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Desc."
                    value={ex.rest}
                    onChange={(e) => updateExercise(i, "rest", e.target.value)}
                  />
                  <button onClick={() => removeExercise(i)} className="col-span-1 flex items-center justify-center text-depro-gray hover:text-depro-red">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-depro-gray mt-1">Nombre · Series · Reps · Descanso</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">
              Vídeos que acompañarán este bloque
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {videos.map((v) => (
                <label key={v.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="accent-depro-blue"
                    checked={form.linkedVideos.includes(v.id)}
                    onChange={() => toggleArr("linkedVideos", v.id)}
                  />
                  <span className="text-sm text-depro-dark group-hover:text-depro-blue">{v.title}</span>
                  <span className="text-xs text-depro-gray ml-auto">{v.duration}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            disabled={!form.name || form.exercises.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Save size={15} />
            {isNew ? "Crear bloque" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Catálogo de ejercicios (120) ────────────────────────────── */
const TAG_LABEL = {
  fuerza:"Fuerza", fuerza_maxima:"F. Máxima", fuerza_explosiva:"F. Explosiva",
  resistencia:"Resistencia", velocidad:"Velocidad", pliometria:"Pliometría",
  core:"Core", prevencion:"Prevención", movilidad:"Movilidad", estetica:"Estética",
  isometrico:"Isométrico", tren_inferior:"T. Inferior", tren_superior:"T. Superior",
  gluteo:"Glúteo", rodilla:"Rodilla", tobillo:"Tobillo", hombro:"Hombro",
  empuje:"Empuje", traccion:"Tracción", sin_material:"Sin material",
  gomas:"Gomas", mancuernas:"Mancuernas", barra:"Barra", maquina:"Máquina",
  casa:"Casa", campo:"Campo", gimnasio:"Gimnasio",
};

function CatalogTab() {
  const [q,     setQ]     = useState("");
  const [tagF,  setTagF]  = useState("");
  const [matF,  setMatF]  = useState("");

  const shown = EXERCISES.filter((ex) => {
    const matchQ  = !q   || ex.nombre.toLowerCase().includes(q.toLowerCase());
    const matchT  = !tagF || ex.etiquetas.includes(tagF);
    const matchM  = !matF || ex.material === matF;
    return matchQ && matchT && matchM;
  });

  const matOptions = [...new Set(EXERCISES.map((e) => e.material))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejercicio…" className="admin-input w-full pl-9 text-sm" />
        </div>
        <select value={tagF} onChange={(e) => setTagF(e.target.value)} className="admin-input text-sm">
          <option value="">Todas las etiquetas</option>
          {TAGS.objetivo.map((t) => <option key={t} value={t}>{TAG_LABEL[t] || t}</option>)}
        </select>
        <select value={matF} onChange={(e) => setMatF(e.target.value)} className="admin-input text-sm">
          <option value="">Todo el material</option>
          {matOptions.map((m) => <option key={m} value={m}>{TAG_LABEL[m] || m}</option>)}
        </select>
        <span className="text-xs text-depro-gray font-medium">{shown.length} ejercicios</span>
      </div>

      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-0 text-xs font-bold text-depro-gray uppercase tracking-wide border-b border-depro-border px-4 py-2.5">
          <span className="w-10">#</span>
          <span>Ejercicio</span>
          <span className="w-28 text-center">Material</span>
          <span className="w-24 text-right">Etiquetas</span>
        </div>
        <div className="divide-y divide-depro-border max-h-[600px] overflow-y-auto">
          {shown.map((ex, i) => (
            <div key={ex.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-0 items-start px-4 py-3 hover:bg-depro-gray-light/50 transition-colors">
              <span className="w-10 text-xs text-depro-gray font-mono pt-0.5">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-depro-dark leading-snug">{ex.nombre}</div>
                {ex.contraindicado.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {ex.contraindicado.map((c) => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-50 text-red-500 border border-red-100">⚠ {c}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-28 text-center">
                <span className="text-xs px-2 py-0.5 rounded-full bg-depro-gray-light text-depro-gray font-medium">
                  {TAG_LABEL[ex.material] || ex.material}
                </span>
              </div>
              <div className="w-24 flex flex-wrap gap-1 justify-end">
                {ex.etiquetas.slice(0, 2).map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-depro-blue/8 text-depro-blue border border-depro-blue/15">
                    {TAG_LABEL[t] || t}
                  </span>
                ))}
                {ex.etiquetas.length > 2 && <span className="text-[10px] text-depro-gray">+{ex.etiquetas.length - 2}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function AdminPlanBuilderPage() {
  const [activeTab, setActiveTab]   = useState("bloques");
  const [blocks, setBlocks]         = useState([]);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterCat, setFilterCat]   = useState("todos");
  const [editingBlock, setEditingBlock] = useState(undefined);
  const [showModal, setShowModal]   = useState(false);

  useEffect(() => {
    Promise.all([loadPlanBlocks(), loadMedia()]).then(([blks, meds]) => {
      setBlocks(blks);
      setMediaLibrary(meds);
      setLoading(false);
    });
  }, []);

  const filtered = blocks.filter(
    (b) => filterCat === "todos" || b.category === filterCat
  );

  const handleToggle = async (id) => {
    const block = blocks.find((b) => b.id === id);
    const updated = await togglePlanBlock(id, !block.active);
    setBlocks(updated);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este bloque?")) return;
    await deletePlanBlock(id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleEdit = (block) => { setEditingBlock(block); setShowModal(true); };
  const handleNew = () => { setEditingBlock(null); setShowModal(true); };

  const handleSave = async (data) => {
    const saved = await savePlanBlock({ ...data, priority: data.id ? data.priority : blocks.length + 1 });
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === saved.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [...prev, saved];
    });
  };

  const activeCount = blocks.filter((b) => b.active).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-depro-dark">Motor de planes</h1>
          <p className="text-depro-gray text-sm mt-0.5">
            Catálogo de ejercicios, bloques de entrenamiento y simulador para planes automáticos de jugadores
          </p>
        </div>
        {activeTab === "bloques" && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-depro-blue text-white font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors text-sm"
          >
            <Plus size={16} />
            Nuevo bloque
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-depro-gray-light rounded-xl w-fit">
        {[
          { id: "bloques",  label: "Bloques", icon: List },
          { id: "catalogo", label: `Catálogo (${EXERCISES.length})`, icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id ? "bg-white text-depro-dark shadow-sm" : "text-depro-gray hover:text-depro-dark"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {activeTab === "catalogo" && <CatalogTab />}
      {activeTab !== "catalogo" && (<>

      {/* How it works */}
      <div className="bg-depro-dark rounded-2xl p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-depro-blue/20 flex items-center justify-center shrink-0">
            <Brain size={20} className="text-depro-blue" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">¿Cómo funciona?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Cuando un jugador completa el formulario y paga, el sistema lee su perfil (posición, nivel,
              días disponibles, objetivos) y selecciona automáticamente los bloques activos que mejor
              encajan. Con ellos compone un plan mensual completo — con ejercicios y vídeos incluidos —
              que queda visible en su área privada desde el primer día.
              <strong className="text-white"> Tú no creas planes manualmente para jugadores.</strong>
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          {[
            { step: "1", label: "Jugador rellena formulario y paga" },
            { step: "2", label: "El sistema selecciona los bloques activos que encajan con su perfil" },
            { step: "3", label: "Plan mensual listo en segundos, con vídeos incluidos" },
          ].map(({ step, label }) => (
            <div key={step} className="bg-white/8 rounded-xl p-3">
              <div className="w-6 h-6 rounded-full bg-depro-blue text-white text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
                {step}
              </div>
              <p className="text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator */}
      <IASimulator blocks={blocks} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-depro-border rounded-xl p-4">
          <p className="text-xs text-depro-gray mb-1">Total bloques</p>
          <p className="text-2xl font-bold text-depro-dark">{blocks.length}</p>
        </div>
        <div className="bg-white border border-depro-border rounded-xl p-4">
          <p className="text-xs text-depro-gray mb-1">Activos</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white border border-depro-border rounded-xl p-4">
          <p className="text-xs text-depro-gray mb-1">Inactivos</p>
          <p className="text-2xl font-bold text-depro-gray">{blocks.length - activeCount}</p>
        </div>
        <div className="bg-white border border-depro-border rounded-xl p-4">
          <p className="text-xs text-depro-gray mb-1">Con vídeo</p>
          <p className="text-2xl font-bold text-depro-blue">
            {blocks.filter((b) => b.linkedVideos?.length > 0).length}
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat("todos")}
          className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
            filterCat === "todos"
              ? "bg-depro-blue border-depro-blue text-white"
              : "border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue"
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                filterCat === c.id
                  ? "bg-depro-blue border-depro-blue text-white"
                  : "border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue"
              }`}
            >
              <Icon size={13} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Blocks */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-depro-gray">
          <Brain size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay bloques en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <BlockModal
          block={editingBlock}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      </>)}
    </div>
  );
}
