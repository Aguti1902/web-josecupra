import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowLeft, Bed, Calendar, CheckCircle, ChevronDown, Clock, Dumbbell, FileText, Flame, Gauge, Info,
  Layers, Pause, Repeat2, Shield, Target, Video, Wind, Play, Trophy, TrendingUp, RefreshCw, Zap,
} from "lucide-react";
import { getSessionBlocks, getNonEmptyBlocks, getTodayName, WEEK_DAYS, blockDisplayLabel, blockNavId } from "../../lib/sessionBlocks";
import { prefetchCatalogMedia, exerciseYouTubeId } from "../../lib/catalogMedia";
import { youtubeThumbUrl } from "../../lib/youtube";
import { saveLoadLog, findLatestLoadLog } from "../../lib/loadLogs";
import {
  loadFieldsForExercise,
  blockAllowsLoadLogging,
  loadLoggingMode,
  getTipoRegistro,
  isLoadRegistrable,
  exerciseNeedsWeight,
  getExerciseProgressDetail,
  estimate1RM,
} from "../../lib/loadAnalytics";
import { canPersistInTrial, trialPersistBlockedMessage } from "../../lib/trialPersistence";
import { hasFeatureAccess } from "../../lib/subscription";

const BLOCK_CONFIG = {
  calentamiento:  { label: "Calentamiento",     Icon: Flame,    color: "#F59E0B" },
  principal:      { label: "Bloque principal",  Icon: Dumbbell, color: "#3B82F6" },
  complementario: { label: "Complementario",    Icon: Target,   color: "#8B5CF6" },
  core:           { label: "Core",              Icon: Gauge,    color: "#EC4899" },
  vuelta_calma:   { label: "Vuelta a la calma", Icon: Wind,     color: "#10B981" },
};

function ConditionPill({ Icon, label, color = "#6B7280" }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-depro-gray bg-depro-gray-light rounded-md px-2 py-1">
      <Icon size={11} style={{ color }} />
      {label}
    </span>
  );
}

function parseSetCount(exercise) {
  const n = parseInt(String(exercise?.sets ?? "").replace(/[^\d]/g, ""), 10);
  // Máximo 4 series de registro (pedido producto)
  return Number.isFinite(n) && n > 0 ? Math.min(n, 4) : 3;
}

function isBodyweightExercise(exercise) {
  const mats = exercise?.etiquetas?.material || exercise?.materiales || [exercise?.material];
  const list = (Array.isArray(mats) ? mats : [mats]).map((m) => String(m || "").toLowerCase());
  return !list.length || list.every((m) => /sin.?material|peso.?corporal|bodyweight|ninguno|campo/.test(m));
}

function ExerciseModal({ exercise, onClose, accent, user, sessionMeta, objective, blockType, onSwap, canSwap, swapTooltip, onLogged }) {
  const ytId = exerciseYouTubeId(exercise);
  const typedExercise = {
    ...exercise,
    blockType,
    carpeta: exercise.carpeta,
    etiquetas: exercise.etiquetas || {
      objetivo: objective ? [String(objective).toLowerCase()] : [],
      rol: exercise.slotConstraints?.rol,
    },
  };
  const tipoRegistro = getTipoRegistro(typedExercise);
  const blockKind = String(blockType || "").toLowerCase();
  const isSupportBlock = /calent|core|vuelta/.test(blockKind);
  // El registro depende del ejercicio/bloque. Si hay series/reps o es un básico, se puede anotar.
  const showLogging = blockAllowsLoadLogging(blockType)
    && !isSupportBlock
    && (
      isLoadRegistrable(typedExercise)
      || exerciseNeedsWeight(typedExercise)
      || blockKind === "principal"
      || blockKind === "complementario"
      || Boolean(exercise.sets || exercise.reps || exercise.load || exercise.weight || exercise.peso)
    );
  const mode = loadLoggingMode(objective, typedExercise);
  const fields = loadFieldsForExercise(typedExercise, objective).filter((f) => f !== "completed");
  const bodyweight = isBodyweightExercise(exercise);
  const setCount = parseSetCount(exercise);
  const [series, setSeries] = useState(() =>
    Array.from({ length: setCount }, () => ({ weight: "", reps: "" })),
  );
  const [loadDraft, setLoadDraft] = useState({});
  const [loadSaved, setLoadSaved] = useState(false);
  const [loadNotice, setLoadNotice] = useState("");
  const [panelTab, setPanelTab] = useState("registro");
  const [playing, setPlaying] = useState(false);
  const progression = useMemo(
    () => getExerciseProgressDetail(user?.id, exercise.name || exercise.nombre),
    [user?.id, exercise.name, exercise.nombre],
  );

  useEffect(() => {
    const prev = findLatestLoadLog(user?.id, {
      exerciseId: exercise.id,
      catalogId: exercise.catalogId,
      exerciseName: exercise.name || exercise.nombre,
      sessionId: sessionMeta?.sessionId,
      weekNumber: sessionMeta?.weekNumber,
    });
    if (!prev) return;
    if (Array.isArray(prev.series) && prev.series.length) {
      setSeries(Array.from({ length: setCount }, (_, i) => ({
        weight: prev.series[i]?.weight || "",
        reps: prev.series[i]?.reps || "",
      })));
    }
    setLoadDraft({
      time: prev.time || "",
      heartRate: prev.heartRate || "",
      distance: prev.distance || "",
      rpe: prev.rpe || "",
      notes: prev.notes || "",
      intensity: prev.intensity || "",
    });
  }, [exercise.id, user?.id, sessionMeta?.sessionId, sessionMeta?.weekNumber, setCount]);

  const handleSaveLoad = () => {
    if (!canPersistInTrial(user, "save_loads")) {
      setLoadNotice(trialPersistBlockedMessage());
      return;
    }
    if (!hasFeatureAccess(user, "cargas") && !canPersistInTrial(user, "save_loads")) {
      setLoadNotice("Activa el extra «Registro de cargas» en Suscripción para guardar todos los datos.");
      return;
    }
    const payload = {
      exerciseId: exercise.id,
      catalogId: exercise.catalogId ?? null,
      exerciseName: exercise.name || exercise.nombre,
      sessionId: sessionMeta?.sessionId,
      sessionTitle: sessionMeta?.sessionTitle,
      sessionNumber: sessionMeta?.sessionNumber ?? null,
      weekLabel: sessionMeta?.weekLabel || new Date().toISOString().slice(0, 10),
      weekNumber: sessionMeta?.weekNumber || null,
      planStartDate: sessionMeta?.planStartDate || null,
      objective,
      blockType,
      tipoRegistro,
      carpeta: exercise.carpeta || null,
      rol: exercise.slotConstraints?.rol || exercise.etiquetas?.rol || null,
      ...loadDraft,
    };
    if (mode === "fuerza_series") {
      payload.sets = String(setCount);
      payload.series = series;
      const filled = series.filter((s) => s.weight || s.reps);
      if (filled.length) {
        payload.weight = filled.map((s) => s.weight || (bodyweight ? "PC" : "")).filter(Boolean).join(" / ");
        payload.reps = filled.map((s) => s.reps).filter(Boolean).join(" / ");
      }
    }
    if (mode === "velocidad") {
      payload.time = loadDraft.time || "";
      payload.heartRate = loadDraft.heartRate || "";
    }
    saveLoadLog(user?.id, payload);
    setLoadSaved(true);
    setLoadNotice("");
    onLogged?.(exercise.id);
  };

  const fieldLabels = {
    weight: bodyweight ? "Peso (kg o PC)" : "Peso (kg)",
    sets: "Series",
    reps: "Repeticiones",
    rest: "Descanso",
    rpe: "RPE / RP",
    time: "Tiempo",
    distance: "Metros / distancia",
    heartRate: "FC media (ppm)",
    intensity: "Zona / intensidad",
    feelings: "Sensaciones",
    notes: "Observaciones",
  };
  const loadPrescription = exercise.load || exercise.weight || exercise.peso || null;
  const filledSeries = series.filter((s) => s.weight || s.reps);
  const liveMax = filledSeries.reduce((best, s) => {
    const w = parseFloat(String(s.weight).replace(",", "."));
    return Number.isFinite(w) && (best == null || w > best) ? w : best;
  }, null);
  const live1rm = (() => {
    const best = filledSeries
      .map((s) => estimate1RM(parseFloat(String(s.weight).replace(",", ".")), parseFloat(String(s.reps).replace(",", "."))))
      .filter((n) => n != null);
    return best.length ? Math.max(...best) : progression?.epley;
  })();
  const sameSession = Boolean(
    progression?.last?.log?.sessionId
    && sessionMeta?.sessionId
    && String(progression.last.log.sessionId) === String(sessionMeta.sessionId),
  );
  const previousSession = sameSession ? progression?.prev : progression?.last;
  const liveDelta = liveMax != null && previousSession?.maxWeight != null
    ? Math.round((liveMax - previousSession.maxWeight) * 10) / 10
    : (sameSession ? progression?.deltaWeight : null);
  const muscle = exercise.etiquetas?.grupo_principal || exercise.grupo || "";
  const segmento = exercise.etiquetas?.segmento || "";

  const handleClose = () => {
    if (!showLogging) onLogged?.(exercise.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      <header className="flex-shrink-0 border-b border-depro-border px-3 py-2.5 flex items-center gap-2">
        <button type="button" onClick={handleClose} className="w-9 h-9 rounded-xl border border-depro-border flex items-center justify-center text-depro-gray">
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-depro-dark truncate text-base">{exercise.name || exercise.nombre}</h3>
          <p className="text-[11px] text-depro-gray truncate">
            {[muscle, segmento?.replace("_", " ")].filter(Boolean).join(" · ") || "Ejercicio"}
          </p>
        </div>
        {exercise.slotConstraints?.rol === "basico" || /b[aá]sico/i.test(exercise.rol || "") ? (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-depro-red-light text-depro-red">Básico</span>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="relative bg-black">
          {playing && ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
              title={exercise.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video"
            />
          ) : (
            <button type="button" onClick={() => ytId && setPlaying(true)} className="w-full aspect-video relative block">
              {ytId ? (
                <img src={youtubeThumbUrl(ytId, "hqdefault")} alt="" className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <Video size={28} className="text-white/50" />
                </div>
              )}
              {ytId && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={22} className="text-depro-red ml-0.5" fill="currentColor" />
                  </span>
                </span>
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 border-b border-depro-border">
          {[
            { id: "registro", label: "Registro", Icon: FileText },
            { id: "tecnica", label: "Técnica", Icon: Target },
            { id: "info", label: "Información", Icon: Info },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPanelTab(t.id)}
              className={`py-3 text-xs font-bold inline-flex items-center justify-center gap-1 border-b-2 ${
                panelTab === t.id ? "border-depro-red text-depro-red" : "border-transparent text-depro-gray"
              }`}
            >
              <t.Icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {panelTab === "tecnica" && (
            <div className="space-y-3">
              {exercise.description && <p className="text-sm text-depro-gray leading-relaxed">{String(exercise.description).replace(/sin_material/g, "sin material")}</p>}
              {exercise.tips && (
                <div className="rounded-xl p-4 border" style={{ backgroundColor: accent + "08", borderColor: accent + "20" }}>
                  <div className="font-bold text-depro-dark mb-3 flex items-center gap-1.5 text-sm">
                    <Target size={14} style={{ color: accent }} /> Consejos técnicos
                  </div>
                  {Array.isArray(exercise.tips) ? (
                    <ul className="space-y-1.5">
                      {exercise.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-depro-gray">
                          <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: accent + "20", color: accent }}>{i + 1}</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-depro-gray leading-relaxed">{exercise.tips}</p>
                  )}
                </div>
              )}
              {!exercise.description && !exercise.tips && <p className="text-sm text-depro-gray">Sin consejos técnicos para este ejercicio.</p>}
            </div>
          )}

          {panelTab === "info" && (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                {exercise.sets && <ConditionPill Icon={Gauge} label={`${exercise.sets} series`} />}
                {exercise.reps && <ConditionPill Icon={Repeat2} label={exercise.reps} />}
                {loadPrescription && <ConditionPill Icon={Dumbbell} label={`Carga: ${loadPrescription}`} color={accent} />}
                {exercise.rest && <ConditionPill Icon={Pause} label={`Descanso: ${exercise.rest}`} />}
                {exercise.duration && <ConditionPill Icon={Clock} label={exercise.duration} color={accent} />}
              </div>
              {exercise.description && <p className="text-depro-gray leading-relaxed">{String(exercise.description).replace(/sin_material/g, "sin material")}</p>}
            </div>
          )}

          {panelTab === "registro" && showLogging && (
            <div className="space-y-4">
              {mode === "fuerza_series" ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-depro-dark">Registro de series</h4>
                    {progression?.sessions?.length > 0 && (
                      <Link to="/dashboard/mis-cargas" className="text-[11px] font-bold text-depro-red inline-flex items-center gap-1">
                        <TrendingUp size={12} /> Ver progresión
                      </Link>
                    )}
                  </div>
                  <div className="rounded-xl border border-depro-border overflow-hidden">
                    <div className="grid grid-cols-[48px_1fr_1fr_36px] bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-depro-gray px-3 py-2">
                      <span>Serie</span>
                      <span>Peso (kg)</span>
                      <span>Repeticiones</span>
                      <span />
                    </div>
                    {series.map((row, idx) => {
                      const done = Boolean(row.weight || row.reps);
                      return (
                        <div key={idx} className="grid grid-cols-[48px_1fr_1fr_36px] items-center gap-2 px-3 py-2 border-t border-depro-border">
                          <span className="text-sm font-black text-depro-dark">{idx + 1}</span>
                          <input
                            className="h-10 rounded-lg border border-depro-border text-center text-sm font-semibold"
                            inputMode="decimal"
                            placeholder={bodyweight ? "PC" : "80"}
                            value={row.weight}
                            onChange={(e) => setSeries((prev) => prev.map((s, i) => (i === idx ? { ...s, weight: e.target.value } : s)))}
                          />
                          <input
                            className="h-10 rounded-lg border border-depro-border text-center text-sm font-semibold"
                            inputMode="numeric"
                            placeholder="6"
                            value={row.reps}
                            onChange={(e) => setSeries((prev) => prev.map((s, i) => (i === idx ? { ...s, reps: e.target.value } : s)))}
                          />
                          <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent"}`}>
                            <CheckCircle size={14} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2">
                      <p className="text-[10px] text-depro-gray inline-flex items-center justify-center gap-1"><TrendingUp size={10} /> Última sesión</p>
                      <p className="text-sm font-black text-depro-dark">
                        {previousSession?.maxWeight != null ? `${previousSession.maxWeight} kg × ${previousSession.repsAtMax || ""}` : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <p className="text-[10px] text-depro-gray">Progresión</p>
                      <p className={`text-sm font-black ${liveDelta > 0 ? "text-emerald-600" : "text-depro-dark"}`}>
                        {liveDelta != null ? `${liveDelta > 0 ? "+" : ""}${liveDelta} kg` : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <p className="text-[10px] text-depro-gray inline-flex items-center justify-center gap-1"><Trophy size={10} /> RM estimado</p>
                      <p className="text-sm font-black text-depro-dark">{live1rm != null ? `≈ ${live1rm} kg` : "—"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-black text-depro-dark">
                    {mode === "velocidad" ? "Registro de velocidad" : "Registro de resistencia"}
                  </h4>
                  {mode === "velocidad" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-depro-gray uppercase">Tiempo</label>
                        <input className="admin-input w-full text-xs mt-1" placeholder="1.85 s" value={loadDraft.time || ""} onChange={(e) => setLoadDraft({ ...loadDraft, time: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-depro-gray uppercase">Repeticiones</label>
                        <input className="admin-input w-full text-xs mt-1" inputMode="numeric" placeholder="6" value={loadDraft.reps || ""} onChange={(e) => setLoadDraft({ ...loadDraft, reps: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-depro-gray uppercase">Descanso</label>
                        <input className="admin-input w-full text-xs mt-1" placeholder="90 s" value={loadDraft.rest || ""} onChange={(e) => setLoadDraft({ ...loadDraft, rest: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-depro-gray uppercase">FC media</label>
                        <input className="admin-input w-full text-xs mt-1" inputMode="numeric" placeholder="165" value={loadDraft.heartRate || ""} onChange={(e) => setLoadDraft({ ...loadDraft, heartRate: e.target.value })} />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {fields.map((field) => (
                        <div key={field} className={field === "notes" ? "col-span-2" : ""}>
                          <label className="text-[10px] font-bold text-depro-gray uppercase">{fieldLabels[field]}</label>
                          {field === "notes" ? (
                            <textarea className="admin-input w-full text-xs mt-1" rows={2} value={loadDraft[field] || ""} onChange={(e) => setLoadDraft({ ...loadDraft, [field]: e.target.value })} />
                          ) : (
                            <input className="admin-input w-full text-xs mt-1" value={loadDraft[field] || ""} onChange={(e) => setLoadDraft({ ...loadDraft, [field]: e.target.value })} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {loadNotice && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">{loadNotice}</p>}
              {loadSaved && <p className="text-xs text-green-700">Registro guardado para este entrenamiento.</p>}
            </div>
          )}

          {panelTab === "registro" && !showLogging && (
            <p className="text-sm text-depro-gray">Este bloque no registra carga. Revisa la técnica y continúa.</p>
          )}
        </div>
      </div>

      <footer className="flex-shrink-0 border-t border-depro-border bg-white p-3 space-y-2 safe-bottom">
        {showLogging && (
          <button
            type="button"
            onClick={handleSaveLoad}
            className="w-full py-3 rounded-xl text-sm font-black text-white bg-depro-red inline-flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Guardar series
          </button>
        )}
        {onSwap && (
          <button
            type="button"
            disabled={!canSwap}
            title={swapTooltip || (canSwap
              ? "Refresca solo si no puedes hacer este ejercicio. El cambio se aplica a las 4 semanas."
              : "El refresco de ejercicios está incluido en Premium o en el extra correspondiente.")}
            onClick={() => { onSwap(exercise.id); onClose(); }}
            className="w-full py-2.5 rounded-xl text-sm font-bold border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Refrescar ejercicio
          </button>
        )}
      </footer>
    </div>
  );
}

function BlockExerciseList({ exercises, accentColor, onSelect, doneIds }) {
  if (!exercises?.length) return null;
  return (
    <div className="space-y-1.5">
      {exercises.map((ex, i) => {
        const ytId = exerciseYouTubeId(ex);
        const done = doneIds?.has(ex.id);
        const load = ex.load || ex.weight || ex.peso;
        return (
          <button key={ex.id || i} type="button" onClick={() => onSelect(ex)}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white border text-left ${done ? "border-emerald-200 bg-emerald-50/40" : "border-depro-border"}`}>
            <div className="relative shrink-0">
              {ytId ? (
                <img src={youtubeThumbUrl(ytId)} alt="" className="w-14 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-14 h-10 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ backgroundColor: accentColor + "18", color: accentColor }}>{i + 1}</div>
              )}
              {ytId && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full bg-black/55 text-white flex items-center justify-center">
                    <Play size={9} fill="currentColor" />
                  </span>
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-depro-dark truncate">{ex.name || ex.nombre}</div>
              <div className="text-[11px] text-depro-gray truncate">
                {[
                  ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ex.sets && `${ex.sets} series`,
                  load,
                  ex.rest && `Descanso: ${ex.rest}`,
                ].filter(Boolean).join(" · ")}
              </div>
            </div>
            {done
              ? <CheckCircle size={16} className="text-emerald-500 shrink-0" />
              : <span className="text-depro-gray shrink-0">›</span>}
          </button>
        );
      })}
    </div>
  );
}

function monthShort(date) {
  return date.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
}

function parseIsoDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Siete días seguidos desde weekStart, en orden de fecha. Si el plan empieza en lunes, sale lun–dom. */
function weekDaySequence(weekStart) {
  const start = parseIsoDate(weekStart);
  if (!start) return WEEK_DAYS.map((day) => ({ day, dateLabel: "" }));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      day: WEEK_DAYS[(date.getDay() + 6) % 7],
      dateLabel: `${date.getDate()} ${monthShort(date)}`,
    };
  });
}

export function formatPlanDateRange(start, end) {
  const from = parseIsoDate(start);
  const to = parseIsoDate(end);
  if (!from || !to) return "";
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    return `${from.getDate()} – ${to.getDate()} ${monthShort(to)}`;
  }
  return `${from.getDate()} ${monthShort(from)} – ${to.getDate()} ${monthShort(to)}`;
}

function sessionGlyph(session) {
  const text = `${session?.title || ""} ${session?.type || ""}`.toLowerCase();
  if (/prevenc|movil/.test(text)) return Shield;
  if (/veloc/.test(text)) return Zap;
  if (/resist/.test(text)) return Activity;
  return Dumbbell;
}

function sessionLabel(session) {
  return session?.title || session?.type || "Sesión";
}

/** Calendario semanal: tarjetas que se adaptan al ancho, sin meter los 7 días en una fila estrecha. */
export function WeekCalendar({ plan, activeSessionId, onSelectSession, weekStart }) {
  const todayName = getTodayName();
  const days = weekDaySequence(weekStart);
  const sessionByDay = {};
  (plan || []).forEach((d) => {
    if (d.sessions?.length) sessionByDay[d.day] = { ...d.sessions[0], dayName: d.day };
  });

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3">
      {days.map(({ day, dateLabel }) => {
        const session = sessionByDay[day];
        const isToday = day === todayName;
        const isActive = session && activeSessionId === session.id;
        const isDone = session?.status === "completed";
        const highlighted = isToday || isActive;
        const Glyph = session ? sessionGlyph(session) : Bed;
        const short = day.slice(0, 3);

        return (
          <button
            key={day}
            type="button"
            disabled={!session}
            onClick={() => session && onSelectSession(session)}
            className={`w-full min-w-0 text-left rounded-2xl border bg-white p-3 min-h-[124px] flex flex-col transition-colors ${
              highlighted
                ? "border-[#FB2C39] border-2 bg-[#FFF5F5] shadow-sm"
                : "border-neutral-200 hover:border-neutral-800"
            } ${session ? "" : "cursor-default"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[11px] font-black uppercase tracking-wide ${highlighted ? "text-[#FB2C39]" : "text-neutral-500"}`}>
                  {short}{isToday ? " · Hoy" : ""}
                </p>
                {dateLabel && <p className="text-[11px] text-neutral-400">{dateLabel}</p>}
              </div>
              {isDone && <CheckCircle size={16} className="text-[#FB2C39] shrink-0" />}
            </div>
            <Glyph size={18} className={`mt-3 ${session ? "text-[#FB2C39]" : "text-neutral-300"}`} />
            <p className={`mt-2 text-sm font-black leading-snug break-words ${session ? "text-neutral-900" : "text-neutral-400"}`}>
              {session ? sessionLabel(session) : "Descanso"}
            </p>
            {session?.duration && (
              <p className="mt-1 text-xs text-neutral-500 break-words">{session.duration}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Vista de sesión a pantalla completa — todos los bloques visibles sin acordeones */
export function PlayerSessionFullscreen({
  session,
  sessionNumber,
  dayLabel,
  accentColor,
  onClose,
  onComplete,
  onUncomplete,
  onDownloadPdf,
  user,
  objective,
  onSwapExercise,
  canSwap = true,
  swapMessage,
  swapTooltip,
}) {
  const blocks = getNonEmptyBlocks(session);
  const totalEx = blocks.reduce((a, b) => a + (b.exercises?.length || 0), 0);
  const [selectedEx, setSelectedEx] = useState(null);
  const isDone = session.status === "completed" || session.completion === 100;
  const [completion, setCompletion] = useState(isDone ? 100 : 0);
  const [doneIds, setDoneIds] = useState(() => new Set());
  const [sessionRpe, setSessionRpe] = useState("");
  const [sessionRpeSaved, setSessionRpeSaved] = useState(false);
  const [sessionRpeNotice, setSessionRpeNotice] = useState("");
  const [, setMediaTick] = useState(0);

  useEffect(() => {
    prefetchCatalogMedia().then(() => setMediaTick((n) => n + 1)).catch(() => {});
  }, []);

  useEffect(() => {
    setCompletion(isDone ? 100 : 0);
    setDoneIds(new Set());
    setSessionRpe("");
    setSessionRpeSaved(false);
    setSessionRpeNotice("");
  }, [session.id, isDone]);

  const bumpRpe = (delta) => {
    const n = Number(sessionRpe) || 0;
    const next = Math.min(10, Math.max(1, n + delta));
    setSessionRpe(String(next));
    setSessionRpeSaved(false);
  };

  const handleSaveSessionRpe = () => {
    if (!sessionRpe) {
      setSessionRpeNotice("Indica el RPE general de la sesión (1–10).");
      return;
    }
    if (!canPersistInTrial(user, "save_loads")) {
      setSessionRpeNotice(trialPersistBlockedMessage());
      return;
    }
    saveLoadLog(user?.id, {
      exerciseId: `session_rpe_${session.id}`,
      exerciseName: "RPE sesión",
      sessionId: session.id,
      sessionTitle: session.title,
      sessionNumber: sessionNumber ?? session.sessionNumber ?? null,
      weekLabel: dayLabel || new Date().toISOString().slice(0, 10),
      objective: objective || session.type,
      tipoRegistro: "session_rpe",
      rpe: sessionRpe,
      duration: session.duration || "",
      time: session.duration || "",
      blockType: "session",
    });
    setSessionRpeSaved(true);
    setSessionRpeNotice("");
  };

  const handleComplete = () => {
    if (sessionRpe && !sessionRpeSaved) handleSaveSessionRpe();
    setCompletion(100);
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="flex-shrink-0 border-b border-depro-border bg-white/95 backdrop-blur-sm safe-top">
        <div className="flex items-center gap-3 px-3 py-2.5 max-w-3xl mx-auto w-full">
          <button type="button" onClick={onClose}
            className="w-9 h-9 rounded-xl border border-depro-border flex items-center justify-center text-depro-gray">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-depro-dark text-base truncate">{session.title}</h1>
            <p className="text-[11px] text-depro-gray truncate">
              {[dayLabel, "Sesión personalizada"].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-depro-gray mb-2">
            <span className="inline-flex items-center gap-1"><Clock size={12} className="text-depro-red" /> {session.duration || "—"}</span>
            {session.intensity && <span className="inline-flex items-center gap-1"><Flame size={12} className="text-depro-red" /> {session.intensity}</span>}
            <span className="inline-flex items-center gap-1"><Dumbbell size={12} className="text-depro-red" /> {totalEx} ejercicios</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-depro-gray mb-1">
            <span>Progreso de la sesión</span>
            <span>{doneIds.size} de {totalEx}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-depro-red rounded-full transition-all" style={{ width: `${totalEx ? (doneIds.size / totalEx) * 100 : 0}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-3 py-3 space-y-3">
          {swapMessage && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
              {swapMessage}
            </p>
          )}

          {blocks.map((block, bi) => {
            const cfg = BLOCK_CONFIG[block.type] || { label: block.label, Icon: Layers, color: accentColor };
            const BIcon = cfg.Icon;
            const title = blockDisplayLabel(block) || cfg.label;
            const navId = blockNavId(block, bi);
            return (
              <section key={navId} id={`block-${navId}`} className="rounded-2xl border border-rose-100 bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-rose-100 bg-rose-50">
                  <BIcon size={14} className="text-depro-red" />
                  <h2 className="font-black text-depro-dark text-sm flex-1">{title}</h2>
                  <span className="text-[11px] text-depro-gray">{block.exercises.length} ejercicio{block.exercises.length === 1 ? "" : "s"}</span>
                </div>
                <div className="p-2">
                  <BlockExerciseList
                    exercises={block.exercises}
                    accentColor={cfg.color}
                    doneIds={doneIds}
                    onSelect={(ex) => setSelectedEx({ ...ex, _blockType: block.type })}
                  />
                </div>
              </section>
            );
          })}

          {blocks.length === 0 && (
            <div className="text-center py-12 text-depro-gray text-sm">
              Esta sesión no tiene ejercicios asignados.
            </div>
          )}
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-depro-border bg-white px-3 py-2.5 safe-bottom">
        <div className="max-w-3xl mx-auto w-full space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-depro-dark shrink-0">RPE sesión</span>
            <button type="button" onClick={() => bumpRpe(-1)} className="w-8 h-8 rounded-lg border border-depro-border font-black text-depro-gray">−</button>
            <input
              className="w-12 h-8 rounded-lg border border-depro-border bg-white text-center text-sm font-black text-depro-dark"
              inputMode="numeric"
              min={1}
              max={10}
              placeholder="—"
              value={sessionRpe}
              onChange={(e) => { setSessionRpe(e.target.value); setSessionRpeSaved(false); }}
              aria-label="RPE general de la sesión (1-10)"
            />
            <button type="button" onClick={() => bumpRpe(1)} className="w-8 h-8 rounded-lg border border-depro-border font-black text-depro-gray">+</button>
            <button
              type="button"
              onClick={handleComplete}
              className="ml-auto flex-1 max-w-xs py-2.5 rounded-xl text-sm font-black text-white bg-depro-red inline-flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={15} /> {completion === 100 ? "Completada" : "Finalizar entrenamiento"}
            </button>
          </div>
          {sessionRpeNotice && <p className="text-[11px] text-amber-700 px-0.5">{sessionRpeNotice}</p>}
          {completion === 100 && (
            <button type="button" onClick={() => { setCompletion(0); onUncomplete?.(); }} className="w-full text-[11px] font-bold text-depro-gray">
              Desmarcar sesión
            </button>
          )}
          {onDownloadPdf && (
            <button type="button" onClick={onDownloadPdf}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-depro-border text-xs font-bold text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors">
              <FileText size={13} /> Descargar PDF
            </button>
          )}
        </div>
      </footer>

      {selectedEx && (
        <ExerciseModal
          exercise={selectedEx}
          blockType={selectedEx._blockType || "principal"}
          onClose={() => setSelectedEx(null)}
          onLogged={(id) => setDoneIds((prev) => new Set([...prev, id]))}
          accent={accentColor}
          user={user}
          objective={objective}
          sessionMeta={{
            sessionId: session.id,
            sessionTitle: session.title,
            sessionNumber: sessionNumber ?? session.sessionNumber ?? null,
            weekLabel: dayLabel,
            weekNumber: session.weekNumber || session.week || null,
            planStartDate: session.planStartDate || null,
          }}
          onSwap={onSwapExercise}
          canSwap={canSwap}
          swapTooltip={swapTooltip}
        />
      )}
    </div>
  );
}

export { getNonEmptyBlocks, getSessionBlocks };

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Semana de lunes a domingo. La semana 0 es la del lunes que contiene anchor. */
export function planWeekRange(anchor, weekIndex = 0) {
  const start = parseIsoDate(anchor);
  if (!start) return { start: "", end: "", label: "", days: weekDaySequence(null) };
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset + weekIndex * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startIso = toIsoDate(start);
  const endIso = toIsoDate(end);
  return {
    start: startIso,
    end: endIso,
    label: formatPlanDateRange(startIso, endIso),
    days: weekDaySequence(startIso),
  };
}

function weekRangeFromStart(planStartDate, weekNumber, fallback) {
  const range = planWeekRange(planStartDate, weekNumber - 1);
  if (!range.label && fallback) return { ...range, label: fallback };
  return range;
}

function MesoDayButton({ session, day, dateLabel, isDone, isActive, onSelectSession, compact = false }) {
  const short = day.slice(0, 3);
  const title = session ? sessionLabel(session) : "Descanso";
  return (
    <button
      type="button"
      disabled={!session}
      onClick={() => session && onSelectSession(session)}
      className={`w-full min-w-0 text-left rounded-xl border transition-colors ${
        compact ? "px-1.5 py-2" : "px-3 py-2.5"
      } ${
        isActive
          ? "border-[#FB2C39] bg-[#FFF5F5]"
          : session
            ? "border-transparent bg-[#FFF1F2] hover:border-[#FB2C39]"
            : "border-transparent bg-transparent cursor-default"
      }`}
    >
      {!compact && (
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[11px] font-black uppercase text-neutral-500">{short}{dateLabel ? ` · ${dateLabel}` : ""}</p>
          {isDone && <CheckCircle size={14} className="text-[#FB2C39] shrink-0" />}
        </div>
      )}
      <p className={`font-black leading-snug break-words ${compact ? "text-[11px]" : "text-sm"} ${session ? "text-neutral-900" : "text-neutral-400"}`}>
        {session ? title : (compact ? "—" : "Descanso")}
      </p>
      {session?.duration && (
        <p className={`text-neutral-500 break-words ${compact ? "text-[10px] mt-0.5" : "text-xs mt-0.5"}`}>{session.duration}</p>
      )}
      {compact && isDone && <CheckCircle size={12} className="text-[#FB2C39] mt-1" />}
    </button>
  );
}

/** Mesociclo: tabla en pantalla ancha y resumen desplegable por semana en el resto. */
export function MesoMonthCalendar({
  mesoWeeks,
  planStartDate,
  activeSessionId,
  onSelectSession,
  completedByDay,
  completedWeek = 1,
  currentWeek = 1,
  weekRangeLabels = {},
  sessionsPerWeek,
}) {
  const [openWeeks, setOpenWeeks] = useState(() => new Set([currentWeek]));
  const [focused, setFocused] = useState(currentWeek);
  const weeks = mesoWeeks || [];
  const weekCount = weeks.length || 4;
  const sessionByWeekDay = {};
  weeks.forEach((week) => {
    (week.sessions || []).forEach((s) => {
      sessionByWeekDay[`${week.week}_${s.dayName}`] = { ...s, weekNumber: week.week };
    });
  });
  const totalSessions = weeks.reduce((sum, week) => sum + (week.sessions?.length || 0), 0);
  const perWeek = sessionsPerWeek || (weeks[0]?.sessions?.length || 0);
  const doneDays = completedByDay instanceof Set
    ? completedByDay
    : new Set(Array.isArray(completedByDay) ? completedByDay : []);
  const firstWeek = planWeekRange(planStartDate, 0);
  const lastWeek = planWeekRange(planStartDate, Math.max(0, weekCount - 1));
  const cycleLabel = formatPlanDateRange(firstWeek.start, lastWeek.end) || weekRangeLabels[1] || "";

  const selectWeek = (weekNumber) => {
    setFocused(weekNumber);
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      next.add(weekNumber);
      return next;
    });
  };

  const toggleWeek = (weekNumber) => {
    setFocused(weekNumber);
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) next.delete(weekNumber);
      else next.add(weekNumber);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#FB2C39] inline-flex items-center justify-center shrink-0"><Layers size={18} /></span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Mesociclo</p>
              <p className="text-lg font-black text-neutral-900">{weekCount} semanas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#FB2C39] inline-flex items-center justify-center shrink-0"><Calendar size={18} /></span>
            <div className="min-w-0">
              <p className="text-sm font-black text-neutral-900 break-words">{cycleLabel || "4 semanas"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#FB2C39] inline-flex items-center justify-center shrink-0"><Dumbbell size={18} /></span>
            <div className="min-w-0">
              <p className="text-sm font-black text-neutral-900">{totalSessions} sesiones</p>
              {perWeek > 0 && <p className="text-[11px] text-neutral-500">{perWeek} por semana</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex rounded-full bg-neutral-100 p-1 self-start">
          {weeks.map((week) => (
            <button
              key={week.week}
              type="button"
              onClick={() => selectWeek(week.week)}
              className={`w-9 h-9 rounded-full text-sm font-black ${
                focused === week.week ? "bg-[#FB2C39] text-white" : "text-neutral-600"
              }`}
            >
              {week.week}
            </button>
          ))}
        </div>
        <p className="text-xs font-bold text-neutral-500">Semana {focused} de {weekCount}</p>
      </div>

      <div className="xl:hidden space-y-3">
        {weeks.map((week) => {
          const open = openWeeks.has(week.week);
          const range = weekRangeFromStart(planStartDate, week.week, weekRangeLabels[week.week] || week.rangeLabel);
          const isCurrent = week.week === currentWeek;
          return (
            <div key={week.week} id={`meso-week-${week.week}`} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-card">
              <button
                type="button"
                onClick={() => toggleWeek(week.week)}
                aria-expanded={open}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className={`w-1.5 self-stretch rounded-full ${isCurrent || focused === week.week ? "bg-[#FB2C39]" : "bg-neutral-200"}`} />
                <span className="flex-1 min-w-0">
                  <span className="block font-black text-neutral-900">{week.label || `Semana ${week.week}`}</span>
                  <span className="block text-xs text-neutral-500 break-words">
                    {range.label} · {week.sessions?.length || 0} sesiones
                    {isCurrent ? " · semana actual" : ""}
                  </span>
                </span>
                <ChevronDown size={18} className={`text-neutral-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="px-3 pb-3 space-y-2">
                  {(range.days || []).map(({ day, dateLabel }) => {
                    const session = sessionByWeekDay[`${week.week}_${day}`];
                    return (
                      <MesoDayButton
                        key={`${week.week}_${day}`}
                        session={session}
                        day={day}
                        dateLabel={dateLabel}
                        isDone={Boolean(session) && week.week === completedWeek && doneDays.has(day)}
                        isActive={Boolean(session) && activeSessionId === session.id}
                        onSelectSession={onSelectSession}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden xl:block rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-neutral-400">
              <th className="w-[16%] px-3 py-3 text-left font-bold">Semana</th>
              {(firstWeek.days || []).map(({ day }) => (
                <th key={day} className="px-1.5 py-3 text-center font-bold">{day.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => {
              const range = weekRangeFromStart(planStartDate, week.week, weekRangeLabels[week.week] || week.rangeLabel);
              const marked = week.week === focused || week.week === currentWeek;
              return (
                <tr key={week.week} className="border-t border-neutral-100 align-top">
                  <td className="p-2">
                    <div className={`rounded-xl px-3 py-3 h-full ${marked ? "bg-[#FB2C39] text-white" : "bg-neutral-50 text-neutral-900"}`}>
                      <p className="text-sm font-black leading-tight break-words">{week.label || `Semana ${week.week}`}</p>
                      <p className={`text-[11px] mt-1 break-words ${marked ? "text-white/80" : "text-neutral-500"}`}>{range.label}</p>
                    </div>
                  </td>
                  {(range.days || []).map(({ day, dateLabel }) => {
                    const session = sessionByWeekDay[`${week.week}_${day}`];
                    return (
                      <td key={`${week.week}_${day}`} className="p-1.5">
                        <MesoDayButton
                          session={session}
                          day={day}
                          dateLabel={dateLabel}
                          isDone={Boolean(session) && week.week === completedWeek && doneDays.has(day)}
                          isActive={Boolean(session) && activeSessionId === session.id}
                          onSelectSession={onSelectSession}
                          compact
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
