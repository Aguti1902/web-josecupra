import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, Clock, Dumbbell, FileText, Flame, Gauge, Info,
  Layers, Pause, Repeat2, Target, Video, Wind, Play, Trophy, TrendingUp, RefreshCw,
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

/** Calendario semanal L–D con sesiones clicables */
export function WeekCalendar({ plan, accentColor, activeSessionId, onSelectSession, weekLabel }) {
  const todayName = getTodayName();
  const sessionByDay = {};
  (plan || []).forEach((d) => {
    if (d.sessions?.length) sessionByDay[d.day] = { ...d.sessions[0], dayName: d.day };
  });

  return (
    <div className="bg-white border border-depro-border rounded-2xl p-3 sm:p-4 shadow-card">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-depro-gray">Calendario semanal</div>
          <div className="text-sm font-black text-depro-dark">
            {weekLabel ? `Semana actual · ${weekLabel}` : "Toca un día para abrir la sesión"}
          </div>
          {weekLabel && (
            <div className="text-[11px] text-depro-gray mt-0.5">Toca un día para abrir la sesión</div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[320px]">
        {WEEK_DAYS.map((day) => {
          const session = sessionByDay[day];
          const isToday = day === todayName;
          const isActive = session && activeSessionId === session.id;
          const isDone = session?.status === "completed";
          const short = day.slice(0, 3);

          return (
            <div key={day} className="relative pt-2">
              {isToday && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0A36F7] text-white shadow-sm ring-2 ring-white">
                  HOY
                </span>
              )}
            <button
              type="button"
              disabled={!session}
              onClick={() => session && onSelectSession(session)}
              className={`relative w-full flex flex-col items-center rounded-xl p-1.5 sm:p-3 min-h-[84px] sm:min-h-[104px] border transition-all text-center ${
                !session
                  ? isToday
                    ? "bg-depro-gray-light/70 border-depro-blue/40 cursor-default"
                    : "bg-depro-gray-light/60 border-depro-border opacity-60 cursor-default"
                  : isActive
                    ? "bg-depro-blue text-white border-depro-blue shadow-md scale-[1.02]"
                    : isDone
                      ? "bg-green-50 border-green-300 hover:border-green-500"
                      : isToday
                        ? "bg-blue-50 border-[#0A36F7] hover:border-depro-blue-dark"
                        : "bg-white border-depro-border hover:border-depro-blue hover:shadow-sm"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${
                isActive ? "text-white/80" : isToday ? "text-[#0A36F7]" : "text-depro-gray"
              }`}>{short}</span>
              {session ? (
                <>
                  <span className={`text-[11px] sm:text-xs font-black leading-tight line-clamp-2 ${
                    isActive ? "text-white" : "text-depro-dark"
                  }`}>{session.title}</span>
                  <span className={`text-[9px] mt-1 ${isActive ? "text-white/70" : "text-depro-gray"}`}>
                    {session.duration}
                  </span>
                  {isDone && !isActive && (
                    <CheckCircle size={12} className="text-green-600 mt-1" />
                  )}
                </>
              ) : (
                <span className={`text-[10px] mt-2 ${isToday ? "text-[#0A36F7] font-semibold" : "text-depro-gray"}`}>Descanso</span>
              )}
            </button>
            </div>
          );
        })}
        </div>
      </div>
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

/** Calendario mensual del mesociclo: 4 semanas × 7 días */
export function MesoMonthCalendar({
  mesoWeeks,
  accentColor,
  activeSessionId,
  onSelectSession,
  completedByDay,
  completedWeek = 1,
  currentWeek = 1,
  weekRangeLabels = {},
}) {
  const sessionByWeekDay = {};
  (mesoWeeks || []).forEach((week) => {
    week.sessions.forEach((s) => {
      sessionByWeekDay[`${week.week}_${s.dayName}`] = { ...s, weekNumber: week.week };
    });
  });

  const totalSessions = (mesoWeeks || []).reduce((a, w) => a + w.sessions.length, 0);
  const doneDays = completedByDay instanceof Set
    ? completedByDay
    : new Set(Array.isArray(completedByDay) ? completedByDay : []);

  return (
    <div className="bg-white border border-depro-border rounded-2xl p-3 sm:p-4 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-depro-gray">Calendario mensual</div>
          <div className="text-sm font-black text-depro-dark">4 semanas · mismas sesiones cada semana</div>
        </div>
        <div className="text-xs font-bold text-depro-gray bg-depro-gray-light px-3 py-1.5 rounded-lg self-start">
          {totalSessions} sesiones
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[560px]">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase text-depro-gray py-1">
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {(mesoWeeks || []).map((week) => {
          const isCurrent = week.week === currentWeek;
          const rangeLabel = weekRangeLabels[week.week] || week.rangeLabel;
          return (
          <div
            key={week.week}
            className={isCurrent ? "rounded-xl ring-2 ring-depro-blue/40 ring-offset-2 p-1 -m-1" : undefined}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 px-0.5 flex items-center gap-2 flex-wrap ${
              isCurrent ? "text-depro-blue" : "text-depro-gray"
            }`}>
              <span>{week.label}{rangeLabel ? ` · ${rangeLabel}` : ""}</span>
              {isCurrent && (
                <span className="normal-case tracking-normal text-[9px] font-black px-2 py-0.5 rounded-full bg-depro-blue text-white">
                  Semana actual
                </span>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEK_DAYS.map((day) => {
                const session = sessionByWeekDay[`${week.week}_${day}`];
                const isActive = session && activeSessionId === session.id;
                const isDone = session && week.week === completedWeek && doneDays.has(day);
                const shortTitle = session?.title?.split(" - ")?.[0]?.slice(0, 12) || session?.type?.slice(0, 10);

                return (
                  <button
                    key={`${week.week}_${day}`}
                    type="button"
                    disabled={!session}
                    onClick={() => session && onSelectSession(session)}
                    className={`min-h-[68px] sm:min-h-[80px] rounded-xl border p-1.5 sm:p-2 text-left transition-all ${
                      !session
                        ? "bg-depro-gray-light/50 border-depro-border/60 cursor-default opacity-50"
                        : isActive
                          ? "bg-depro-blue border-depro-blue text-white shadow-md"
                          : isDone
                            ? "bg-green-50 border-green-300 hover:border-green-500"
                            : "bg-white border-depro-border hover:border-depro-blue hover:shadow-sm"
                    }`}
                  >
                    {session ? (
                      <>
                        <div className={`text-[9px] font-bold leading-tight line-clamp-2 ${
                          isActive ? "text-white" : isDone ? "text-green-800" : "text-depro-dark"
                        }`}>
                          {shortTitle}
                        </div>
                        <div className={`text-[8px] mt-1 flex items-center gap-0.5 ${
                          isActive ? "text-white/70" : isDone ? "text-green-600" : "text-depro-gray"
                        }`}>
                          {isDone && !isActive && <CheckCircle size={9} className="shrink-0" />}
                          {session.duration}
                        </div>
                      </>
                    ) : (
                      <span className="text-[9px] text-depro-gray">—</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
        </div>
      </div>
    </div>
  );
}
