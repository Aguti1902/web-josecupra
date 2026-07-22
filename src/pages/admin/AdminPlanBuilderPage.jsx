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
  PlayCircle,
} from "lucide-react";
import { loadPlanBlocks, savePlanBlock, deletePlanBlock, togglePlanBlock, loadMedia } from "../../lib/adminStorage";
import { EXERCISES, TAGS } from "../../data/exercises";
import { Search, List, BookOpen } from "lucide-react";
import { buildPlayerPlan, buildFourWeekPlan, refreshExercise, normalizeLesions } from "../../lib/playerPlanEngine";
import { DAY_ORDER } from "../../lib/planLoadRules";
import { getYouTubeId } from "../../lib/youtube";

const Youtube = PlayCircle;

const CATEGORIES = [
  { id: "físico", label: "Físico", icon: Flame, color: "text-orange-500 bg-orange-50" },
  { id: "técnica", label: "Técnica", icon: Target, color: "text-depro-blue bg-depro-blue/10" },
  { id: "táctica", label: "Táctica", icon: Shield, color: "text-purple-600 bg-purple-50" },
  { id: "prevención", label: "Prevención", icon: Zap, color: "text-green-600 bg-green-50" },
];
const OBJECTIVES = ["Fuerza", "Velocidad", "Resistencia", "Hipertrofia", "Prevención", "Movilidad"];
const MATERIALS = ["Sin material", "Gomas", "Mancuernas", "Barra / Gimnasio", "Campo"];
const SPORTS = ["Fútbol", "Baloncesto", "Balonmano", "Atletismo", "Natación", "Otro"];
const COMPETITION_DAYS = ["Sábado", "Domingo", "Entre semana", "No compito regularmente"];
const WEEK_DAYS = DAY_ORDER;
const INJURIES = ["Ninguna", "Rodilla", "Tobillo", "Hombro", "Espalda", "Pubalgia"];
const INJURY_SUBTYPES = {
  Rodilla: ["ACL", "Menisco", "Rotuliana", "Otra"],
  Tobillo: ["Esguince", "Inestabilidad", "Otra"],
  Hombro: ["Manguito rotador", "Inestabilidad", "Otra"],
  Espalda: ["Lumbar", "Dorsal", "Cervical", "Otra"],
  Pubalgia: ["Aductores", "Recto abdominal", "Mixta"],
};
const EXPERIENCE_LEVELS = ["Nunca he entrenado", "Menos de 6 meses", "6–12 meses", "1–3 años", "Más de 3 años"];
/** Solo para bloques legacy del admin (el motor real ya no usa posición) */
const POSITIONS = [
  "Portero", "Defensa Central", "Lateral", "Centrocampista",
  "Mediapunta", "Extremo", "Delantero",
];
const LEVELS = ["principiante", "intermedio", "avanzado"];

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

/* ── Simulador motor real (PDF §2.3) ─────────────────────────── */
function IASimulator() {
  const [profile, setProfile] = useState({
    edad: "22",
    objetivo: "Fuerza",
    deporte: "Fútbol",
    frecuencia: "3",
    material: "Sin material",
    experiencia: "6–12 meses",
    lesion: ["Ninguna"],
    lesionSubtipo: [],
    diaCompeticion: "Sábado",
    disponibles: ["Lunes", "Martes", "Jueves", "Viernes"],
  });
  const [simulated, setSimulated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedKey, setExpandedKey] = useState(null);
  const [viewWeek, setViewWeek] = useState(1);

  const buildUser = () => ({
    ...profile,
    edad: parseInt(profile.edad, 10) || 22,
    lesion: profile.lesion?.includes("Ninguna") ? [] : profile.lesion,
  });

  const simulate = () => {
    setLoading(true);
    setSimulated(null);
    setExpandedKey(null);
    setTimeout(() => {
      const weeks = buildFourWeekPlan(buildUser());
      setSimulated({ weeks });
      setViewWeek(1);
      setLoading(false);
    }, 400);
  };

  const handleRefreshExercise = (weekIdx, sessionId, exerciseId) => {
    if (!simulated) return;
    const user = buildUser();
    const filterParams = {
      material: user.material?.toLowerCase().replace(/\s|\//g, "_").replace("barra_gimnasio", "barra") || "sin_material",
      lesiones: normalizeLesions(user.lesion, user.lesionSubtipo),
      edad: user.edad,
      deporte: user.deporte,
      experiencia: user.experiencia?.includes("Nunca") || user.experiencia?.includes("Menos") ? "novato"
        : user.experiencia?.includes("Más de 3") ? "avanzado" : "intermedio",
    };
    const weeks = simulated.weeks.map((w, wi) => {
      if (wi !== weekIdx) return w;
      return {
        ...w,
        sessions: w.sessions.map((s) =>
          s.id === sessionId ? refreshExercise(s, exerciseId, filterParams) : s
        ),
      };
    });
    setSimulated({ weeks });
  };

  const currentWeek = simulated?.weeks?.[viewWeek - 1];

  return (
    <div className="bg-gradient-to-br from-depro-blue/5 to-purple-50 border border-depro-blue/20 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-depro-blue/15">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-depro-blue" />
          <h2 className="font-bold text-depro-dark">Motor de planes (PDF §2.3)</h2>
        </div>
        <p className="text-sm text-depro-gray">
          Genera un plan de 4 semanas con el motor real: objetivo, día de competición, días disponibles, lesiones y material.
        </p>
      </div>

      <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-1.5 uppercase">Edad</label>
              <input type="number" min="12" max="50" value={profile.edad}
                onChange={(e) => setProfile((p) => ({ ...p, edad: e.target.value }))}
                className="admin-input w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-1.5 uppercase">Deporte</label>
              <select value={profile.deporte} onChange={(e) => setProfile((p) => ({ ...p, deporte: e.target.value }))}
                className="admin-input w-full text-sm">
                {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase">Objetivo principal</label>
            <div className="flex flex-wrap gap-1.5">
              {OBJECTIVES.map((o) => (
                <button key={o} type="button" onClick={() => setProfile((p) => ({ ...p, objetivo: o }))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${profile.objetivo === o ? "bg-depro-blue border-depro-blue text-white" : "border-depro-border text-depro-gray hover:border-depro-blue"}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase">Frecuencia</label>
              {["1", "2", "3", "4"].map((d) => (
                <button key={d} type="button" onClick={() => setProfile((p) => ({ ...p, frecuencia: d }))}
                  className={`w-full mb-1 py-1.5 rounded-lg border text-xs font-semibold ${profile.frecuencia === d ? "bg-depro-blue border-depro-blue text-white" : "border-depro-border text-depro-gray"}`}>
                  {d} día{d !== "1" ? "s" : ""}/sem
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase">Día competición</label>
              {COMPETITION_DAYS.map((d) => (
                <button key={d} type="button" onClick={() => setProfile((p) => ({ ...p, diaCompeticion: d }))}
                  className={`w-full mb-1 py-1.5 rounded-lg border text-[11px] font-medium text-left px-2 ${profile.diaCompeticion === d ? "bg-depro-blue border-depro-blue text-white" : "border-depro-border text-depro-gray"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase">Días disponibles</label>
            <div className="flex flex-wrap gap-1.5">
              {WEEK_DAYS.map((day) => {
                const sel = profile.disponibles.includes(day);
                return (
                  <button key={day} type="button"
                    onClick={() => setProfile((p) => ({
                      ...p,
                      disponibles: sel ? p.disponibles.filter((d) => d !== day) : [...p.disponibles, day],
                    }))}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${sel ? "bg-depro-blue border-depro-blue text-white" : "border-depro-border text-depro-gray"}`}>
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase">Material</label>
            <div className="flex flex-wrap gap-1.5">
              {MATERIALS.map((m) => (
                <button key={m} type="button" onClick={() => setProfile((p) => ({ ...p, material: m }))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${profile.material === m ? "bg-depro-blue border-depro-blue text-white" : "border-depro-border text-depro-gray"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase">Experiencia</label>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE_LEVELS.map((l) => (
                <button key={l} type="button" onClick={() => setProfile((p) => ({ ...p, experiencia: l }))}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium ${profile.experiencia === l ? "bg-depro-blue border-depro-blue text-white" : "border-depro-border text-depro-gray"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-2 uppercase">Lesiones</label>
            <div className="flex flex-wrap gap-1.5">
              {INJURIES.map((inj) => {
                const sel = inj === "Ninguna" ? !profile.lesion?.length || profile.lesion.includes("Ninguna") : profile.lesion?.includes(inj);
                return (
                  <button key={inj} type="button"
                    onClick={() => {
                      if (inj === "Ninguna") setProfile((p) => ({ ...p, lesion: [], lesionSubtipo: [] }));
                      else setProfile((p) => ({
                        ...p,
                        lesion: p.lesion?.includes(inj) ? p.lesion.filter((x) => x !== inj) : [...(p.lesion || []).filter((x) => x !== "Ninguna"), inj],
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sel ? "bg-amber-500 border-amber-500 text-white" : "border-depro-border text-depro-gray"}`}>
                    {inj}
                  </button>
                );
              })}
            </div>
            {(profile.lesion || []).filter((x) => x !== "Ninguna").map((inj) => (
              <div key={inj} className="mt-2 flex flex-wrap gap-1">
                {(INJURY_SUBTYPES[inj] || []).map((sub) => (
                  <button key={sub} type="button"
                    onClick={() => setProfile((p) => ({
                      ...p,
                      lesionSubtipo: p.lesionSubtipo?.includes(sub) ? p.lesionSubtipo.filter((x) => x !== sub) : [...(p.lesionSubtipo || []), sub],
                    }))}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${profile.lesionSubtipo?.includes(sub) ? "bg-amber-500 border-amber-500 text-white" : "border-depro-border text-depro-gray"}`}>
                    {sub}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <button type="button" onClick={simulate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-depro-blue text-white font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors disabled:opacity-60 text-sm sticky bottom-0">
            {loading ? <><RefreshCw size={15} className="animate-spin" /> Generando 4 semanas…</> : <><Sparkles size={15} /> Generar plan (4 semanas)</>}
          </button>
        </div>

        <div>
          {!simulated && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-depro-gray py-8">
              <Brain size={40} className="opacity-20 mb-3" />
              <p className="text-sm text-center">Configura el perfil y pulsa<br />«Generar plan (4 semanas)»</p>
            </div>
          )}

          {simulated && currentWeek && (
            <div className="space-y-3">
              <div className="flex gap-1 p-1 bg-white rounded-xl border border-depro-border">
                {[1, 2, 3, 4].map((w) => (
                  <button key={w} type="button" onClick={() => setViewWeek(w)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${viewWeek === w ? "bg-depro-blue text-white" : "text-depro-gray hover:bg-depro-gray-light"}`}>
                    S{w}
                  </button>
                ))}
              </div>

              {currentWeek.sessions.map((session) => {
                const key = `${viewWeek}_${session.id}`;
                const open = expandedKey === key;
                return (
                  <div key={key} className="bg-white rounded-xl border border-depro-border overflow-hidden">
                    <button type="button" onClick={() => setExpandedKey(open ? null : key)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-depro-gray-light/40">
                      <div>
                        <span className="text-xs font-bold text-depro-blue">{session.dayName}</span>
                        <p className="text-sm font-medium text-depro-dark">{session.title}</p>
                        <p className="text-xs text-depro-gray">{(session.exercises || []).length} ej. · {session.intensity}</p>
                      </div>
                      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {open && (
                      <div className="border-t border-depro-border px-3 py-2 space-y-2">
                        {(session.blocks || []).map((b) => (
                          <div key={b.label}>
                            <p className="text-[10px] font-bold uppercase text-depro-gray mb-1">{b.label}</p>
                            {(b.exercises || []).map((ex) => (
                              <div key={ex.id} className="flex items-center justify-between gap-2 py-1">
                                <span className="text-xs text-depro-dark flex items-center gap-1.5 min-w-0">
                                  <Dumbbell size={11} className="text-depro-blue shrink-0" />
                                  <span className="truncate">{ex.name}</span>
                                  <span className="text-depro-gray shrink-0">{ex.sets}×{ex.reps}</span>
                                </span>
                                <button type="button" title="Refrescar ejercicio"
                                  onClick={() => handleRefreshExercise(viewWeek - 1, session.id, ex.id)}
                                  className="p-1 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue hover:border-depro-blue shrink-0">
                                  <RefreshCw size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
  const videoCount = (block.exercises || []).filter((ex) => getYouTubeId(ex.videoUrl)).length;

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
          {videoCount > 0 && (
            <span className="flex items-center gap-1 text-red-500 font-medium">
              <Youtube size={11} />
              {videoCount} vídeo{videoCount > 1 ? "s" : ""}
            </span>
          )}
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
        <div className="border-t border-depro-border px-4 pb-4 pt-3 space-y-2">
          <p className="text-xs font-semibold text-depro-dark mb-2 flex items-center gap-1">
            <ListChecks size={13} />
            Ejercicios ({block.exercises.length})
          </p>
          {block.exercises.map((ex, i) => {
            const ytId = getYouTubeId(ex.videoUrl);
            return (
              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-depro-gray-light rounded-xl text-xs">
                {ytId ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${ytId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                      alt=""
                      className="w-14 h-10 rounded-lg object-cover border border-depro-border hover:opacity-80 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="w-14 h-10 rounded-lg bg-depro-border/40 flex items-center justify-center shrink-0">
                    <Video size={14} className="text-depro-gray/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-depro-dark block truncate">{ex.name}</span>
                  <span className="text-depro-gray">{ex.sets} series · {ex.reps} · {ex.rest}</span>
                </div>
                {ytId && (
                  <span className="shrink-0 flex items-center gap-1 text-red-500 font-medium">
                    <Youtube size={11} /> YouTube
                  </span>
                )}
              </div>
            );
          })}
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
      exercises: [{ name: "", sets: 3, reps: "10", rest: "60s", videoUrl: "" }],
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
    setForm((f) => ({ ...f, exercises: [...f.exercises, { name: "", sets: 3, reps: "10", rest: "60s", videoUrl: "" }] }));

  const removeExercise = (i) =>
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));

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
            <div className="space-y-3">
              {form.exercises.map((ex, i) => {
                const ytId = getYouTubeId(ex.videoUrl);
                return (
                  <div key={i} className="border border-depro-border rounded-xl p-3 space-y-2 bg-depro-gray-light/30">
                    {/* Fila 1: nombre + series + reps + descanso + eliminar */}
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <input
                        className="col-span-5 border border-depro-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
                        placeholder="Nombre del ejercicio"
                        value={ex.name}
                        onChange={(e) => updateExercise(i, "name", e.target.value)}
                      />
                      <input
                        className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
                        placeholder="Series"
                        value={ex.sets}
                        onChange={(e) => updateExercise(i, "sets", e.target.value)}
                      />
                      <input
                        className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) => updateExercise(i, "reps", e.target.value)}
                      />
                      <input
                        className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
                        placeholder="Descanso"
                        value={ex.rest}
                        onChange={(e) => updateExercise(i, "rest", e.target.value)}
                      />
                      <button onClick={() => removeExercise(i)} className="col-span-1 flex items-center justify-center text-depro-gray hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                    {/* Fila 2: URL de YouTube */}
                    <div className="flex items-center gap-2">
                      <Youtube size={14} className={ytId ? "text-red-500" : "text-depro-gray"} />
                      <input
                        className="flex-1 border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
                        placeholder="URL de YouTube (opcional) — ej. https://youtu.be/xxxxx"
                        value={ex.videoUrl || ""}
                        onChange={(e) => updateExercise(i, "videoUrl", e.target.value)}
                      />
                      {ytId && (
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                          alt="thumb"
                          className="w-12 h-9 rounded-md object-cover border border-depro-border"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-depro-gray mt-1">Nombre · Series · Reps · Descanso · URL YouTube</p>
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
              Cuando un jugador completa el onboarding y paga, el motor lee su perfil físico
              (objetivo: Fuerza / Velocidad / Resistencia…, material, días, lesiones) y rellena
              plantillas con ejercicios del catálogo.
              <strong className="text-white"> Usa el simulador de abajo para ver qué ejercicios salen de verdad.</strong>
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          {[
            { step: "1", label: "Jugador elige objetivo físico y material" },
            { step: "2", label: "El motor filtra el catálogo y arma la semana" },
            { step: "3", label: "Plan listo en su área privada" },
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
      <IASimulator />

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
          <p className="text-2xl font-bold text-red-500">
            {blocks.reduce((acc, b) => acc + (b.exercises || []).filter((ex) => getYouTubeId(ex.videoUrl)).length, 0)}
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
