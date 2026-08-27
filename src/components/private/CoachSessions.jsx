import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, RefreshCw, ChevronUp, ChevronDown,
  Clock, Dumbbell, StickyNote, Target, Calendar, Info, Star,
  Copy, Plus, X, Trash2, Sparkles, SlidersHorizontal, CheckCircle,
} from "lucide-react";
import { substituteExercise, toSessionExercise, getProtocolStructure } from "../../lib/coachEngine";
import { loadCoachLibrary, getCachedCoachLibrary, submitCustomExercise } from "../../lib/coachLibraryStorage";
import {
  loadOrGenerateWeek, updateSessionInWeek, addSessionToWeek, removeSessionFromWeek,
} from "../../lib/coachSessionsStorage";
import { loadFavorites, toggleFavorite } from "../../lib/coachFavorites";
import { PROTOCOLOS, CATEGORY_PROTOCOLS } from "../../data/coachExerciseLibrary";
import { usesClubAutoEngine, isoWeekStartsInMonthFrom, startOfIsoWeek, monthBounds } from "../../lib/clubAuto/clubAutoCoachBridge";
import { selectBallWarmup } from "../../lib/clubAuto/clubAutoTaskSelector";
import { hasFeatureAccess } from "../../lib/subscription";
import { formatWeekRangeLabel, formatDate } from "../../lib/periodization";
import { prefetchCatalogMedia, resolveExerciseVideo, youtubeEmbedUrl } from "../../lib/catalogMedia";
import ClubAutoSessionView from "./ClubAutoSessionView";

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
  } catch { return 0; }
}
function safeAccent(hex) { return lum(hex) > 0.75 ? "#0A36F7" : (hex || "#0A36F7"); }
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function todayLabel() {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Modo Personalizado: builder de sesión propia ─────────── */
function SessionBuilderModal({ accent, clubId, onClose, onCreate }) {
  const [label, setLabel] = useState("Sesión propia");
  const [protocol, setProtocol] = useState("B");
  const structure = getProtocolStructure(protocol);
  const library = getCachedCoachLibrary();
  const [picks, setPicks] = useState({});

  function candidatesFor(categoria) {
    return library.filter((e) => e.categoria === categoria && (e.estado === "aprobado" || e.creadoPor === clubId));
  }

  function handleCreate() {
    const exercises = structure.slots.map((categoria, i) => {
      const exId = picks[i];
      const libEx = exId ? library.find((e) => e.id === exId) : candidatesFor(categoria)[0];
      return libEx ? toSessionExercise(libEx, i) : null;
    }).filter(Boolean);
    if (!exercises.length) return;
    const totalMin = exercises.reduce((acc, e) => acc + (parseInt(e.duration, 10) || 0), 0);
    onCreate({
      id: genId("coach_custom_sess"),
      title: label || "Sesión propia",
      protocol,
      protocolLabel: structure.label,
      objetivos: structure.objetivos,
      date: null,
      assignedDay: label || "Sesión propia",
      exercises,
      duracionEstimada: `${totalMin} min`,
      observaciones: "",
      custom: true,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-depro-dark">Nueva sesión propia</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-depro-gray-light"><X size={18} className="text-depro-gray" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-depro-dark mb-1 block">Nombre</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:border-depro-blue" />
          </div>
          <div>
            <label className="text-sm font-semibold text-depro-dark mb-1.5 block">Protocolo base</label>
            <div className="flex gap-2">
              {PROTOCOLOS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setProtocol(p); setPicks({}); }}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-bold border"
                  style={protocol === p ? { backgroundColor: accent, color: contrastText(accent), borderColor: accent } : { borderColor: "#E5E7EB", color: "#374151" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {structure.slots.map((categoria, i) => {
              const candidates = candidatesFor(categoria);
              return (
                <div key={i}>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1 block">{categoria}</label>
                  <select
                    value={picks[i] || candidates[0]?.id || ""}
                    onChange={(e) => setPicks((prev) => ({ ...prev, [i]: e.target.value }))}
                    className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm outline-none focus:border-depro-blue"
                  >
                    {candidates.length === 0 && <option value="">Sin ejercicios disponibles</option>}
                    {candidates.map((ex) => <option key={ex.id} value={ex.id}>{ex.nombre}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
          <button onClick={handleCreate} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: accent, color: contrastText(accent) }}>
            Crear sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modo Personalizado: crear ejercicio propio (pendiente de aprobación) ── */
function CustomExerciseModal({ accent, clubId, onClose, onCreated }) {
  const categorias = Object.keys(CATEGORY_PROTOCOLS);
  const [form, setForm] = useState({ nombre: "", categoria: categorias[0], descripcion: "" });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.nombre.trim()) return;
    setSaving(true);
    await submitCustomExercise({
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      descripcion: form.descripcion.trim(),
      protocolosPermitidos: CATEGORY_PROTOCOLS[form.categoria] || PROTOCOLOS,
    }, { clubId });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-depro-dark">Ejercicio propio</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-depro-gray-light"><X size={18} className="text-depro-gray" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-depro-dark mb-1 block">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:border-depro-blue" placeholder="Ej. Zancada lateral con banda" />
          </div>
          <div>
            <label className="text-sm font-semibold text-depro-dark mb-1 block">Categoría</label>
            <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:border-depro-blue">
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-depro-dark mb-1 block">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} rows={3} className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:border-depro-blue resize-none" placeholder="Ejecución, series recomendadas…" />
          </div>
          <p className="text-xs text-depro-gray flex items-start gap-1.5">
            <Info size={12} className="flex-shrink-0 mt-0.5" /> Quedará pendiente de aprobación por el equipo DEPRO antes de entrar al motor automático. Ya puedes usarlo ahora mismo en tus sesiones propias.
          </p>
          <button onClick={handleSave} disabled={saving || !form.nombre.trim()} className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50" style={{ backgroundColor: accent, color: contrastText(accent) }}>
            {saving ? "Guardando…" : "Guardar ejercicio"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoachSessions({ club, team, user }) {
  const accent = safeAccent(club?.primaryColor || "#0A36F7");
  const config = useMemo(() => {
    const base = club?.coachConfig || {};
    if (team?.trainingDays?.length) {
      return { ...base, dias_exactos_entrenamiento: team.trainingDays };
    }
    return base;
  }, [club?.coachConfig, team?.trainingDays]);
  const clubId = club?.id;
  const teamId = team?.id;
  const isPersonalizado = club?.mode === "personalizado";
  const isClubAuto = usesClubAutoEngine({ ...club, coachConfig: config });
  const [searchParams, setSearchParams] = useSearchParams();

  const todayMonday = startOfIsoWeek(isoToday());
  const bounds = monthBounds(isoToday());
  const weekStarts = useMemo(
    () => isoWeekStartsInMonthFrom(bounds.startDate, todayMonday),
    [bounds.startDate, todayMonday],
  );
  const currentIdx = Math.max(0, weekStarts.indexOf(todayMonday));
  const parsedWeek = searchParams.get("week");
  const parsedIdx = parsedWeek != null ? parseInt(parsedWeek, 10) : NaN;
  const weekIdx = Number.isFinite(parsedIdx)
    ? Math.min(Math.max(parsedIdx, 0), Math.max(weekStarts.length - 1, 0))
    : currentIdx;
  const weekStart = weekStarts[weekIdx] || todayMonday;

  const [libraryReady, setLibraryReady] = useState(false);
  const [week, setWeek] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [attempts, setAttempts] = useState({});
  const [savedFlash, setSavedFlash] = useState(false);
  const [favorites, setFavorites] = useState(() => loadFavorites(clubId));
  const [showBuilder, setShowBuilder] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [genError, setGenError] = useState(null);

  useEffect(() => { loadCoachLibrary().then(() => setLibraryReady(true)); }, []);
  useEffect(() => { prefetchCatalogMedia().catch(() => {}); }, []);

  const changeWeek = (nextIdx) => {
    const clamped = Math.min(Math.max(nextIdx, 0), Math.max(weekStarts.length - 1, 0));
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (clamped === currentIdx) next.delete("week");
      else next.set("week", String(clamped));
      return next;
    }, { replace: true });
  };

  const targetSessionId = searchParams.get("session");

  useEffect(() => {
    if (!clubId || !teamId) return;
    try {
      const library = getCachedCoachLibrary();
      const w = loadOrGenerateWeek({ clubId, teamId, weekStart, config, library });
      setWeek(w);
      setGenError(null);
      setActiveSessionId((prev) => {
        if (targetSessionId && (w.sessions || []).some((s) => s.id === targetSessionId)) return targetSessionId;
        if (prev && (w.sessions || []).some((s) => s.id === prev)) return prev;
        return w.sessions?.[0]?.id || null;
      });
    } catch (err) {
      console.warn("[DEPRO] no se pudo generar el microciclo", err);
      setWeek({ sessions: [] });
      setGenError(err?.message || "No se pudo generar el microciclo.");
    }
  }, [clubId, teamId, weekStart, config, libraryReady, targetSessionId]);

  const flashSaved = useCallback(() => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  }, []);

  const applyUpdate = useCallback((sessionId, updater) => {
    if (!clubId || !teamId) return;
    const updated = updateSessionInWeek({ clubId, teamId, weekStart, sessionId, updater });
    setWeek(updated);
    flashSaved();
  }, [clubId, teamId, weekStart, flashSaved]);

  const activeSession = week?.sessions?.find((s) => s.id === activeSessionId) || null;

  function handleTitleBlur(e) {
    const value = e.target.value.trim();
    if (!activeSession || value === activeSession.title) return;
    applyUpdate(activeSession.id, (s) => ({ ...s, title: value || s.title }));
  }
  function handleObservacionesBlur(e) {
    const value = e.target.value;
    if (!activeSession || value === activeSession.observaciones) return;
    applyUpdate(activeSession.id, (s) => ({ ...s, observaciones: value }));
  }
  function handleNotesBlur(exId, value) {
    if (!activeSession) return;
    applyUpdate(activeSession.id, (s) => ({
      ...s,
      exercises: s.exercises.map((e) => (e.id === exId ? { ...e, coachNotes: value } : e)),
    }));
  }
  function moveExercise(idx, dir) {
    if (!activeSession) return;
    const target = idx + dir;
    if (target < 0 || target >= activeSession.exercises.length) return;
    applyUpdate(activeSession.id, (s) => {
      const next = [...s.exercises];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...s, exercises: next };
    });
  }
  function handleSubstitute(ex, idx) {
    if (!activeSession) return;
    const library = getCachedCoachLibrary();
    const libEx = library.find((e) => e.id === ex.exerciseId);
    if (!libEx) return;
    const usedIds = activeSession.exercises.map((e) => e.exerciseId);
    const attemptKey = `${activeSession.id}_${ex.id}`;
    const attempt = (attempts[attemptKey] || 0) + 1;
    setAttempts((prev) => ({ ...prev, [attemptKey]: attempt }));

    const newLibEx = substituteExercise(libEx, { library, config, excludeIds: usedIds, attempt });
    if (!newLibEx || newLibEx.id === libEx.id) return;
    const rebuilt = { ...toSessionExercise(newLibEx, ex.slotIndex), coachNotes: ex.coachNotes || "" };
    applyUpdate(activeSession.id, (s) => ({
      ...s,
      exercises: s.exercises.map((e, i) => (i === idx ? rebuilt : e)),
    }));
  }
  function handleToggleFavorite(exerciseId) {
    setFavorites(toggleFavorite(clubId, exerciseId));
  }
  function handleDuplicateSession() {
    if (!activeSession) return;
    const copy = {
      ...activeSession,
      id: genId(`${activeSession.id}_copy`),
      title: `${activeSession.title} (copia)`,
      assignedDay: `${activeSession.assignedDay} (copia)`,
      custom: true,
      exercises: activeSession.exercises.map((e) => ({ ...e, id: genId(`${e.id}_copy`) })),
    };
    const updated = addSessionToWeek({ clubId, teamId, weekStart, session: copy });
    setWeek(updated);
    setActiveSessionId(copy.id);
    flashSaved();
  }
  function handleDeleteSession(sessionId) {
    if (!window.confirm("¿Eliminar esta sesión propia?")) return;
    const updated = removeSessionFromWeek({ clubId, teamId, weekStart, sessionId });
    setWeek(updated);
    setActiveSessionId(updated.sessions[0]?.id || null);
  }
  function handleSessionCreated(session) {
    const updated = addSessionToWeek({ clubId, teamId, weekStart, session });
    setWeek(updated);
    setActiveSessionId(session.id);
    setShowBuilder(false);
    flashSaved();
  }

  if (!clubId || !teamId) {
    return (
      <div className="bg-white border border-depro-border rounded-2xl p-8 text-center space-y-3">
        <Calendar size={28} className="mx-auto text-depro-gray/40" />
        <h1 className="text-xl font-black text-depro-dark">Microciclo</h1>
        <p className="text-sm text-depro-gray">
          {!clubId
            ? "Guarda el cuestionario en Mi perfil para crear tu club y generar el microciclo."
            : "Elige un equipo desde el dashboard para ver su microciclo."}
        </p>
        <Link
          to={!clubId ? "/dashboard/club-profile" : "/dashboard"}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-depro-blue text-white text-sm font-bold"
        >
          {!clubId ? "Ir a Mi perfil" : "Ver equipos"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Microciclo</h1>
          <p className="text-sm text-depro-gray capitalize">{todayLabel()}</p>
          <div className="mt-2 inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-depro-blue-light/40 border border-depro-blue/20 text-xs">
            <Calendar size={11} className="text-depro-blue" />
            <span className="text-depro-dark font-bold">{formatWeekRangeLabel(weekStart, 0)}</span>
            <span className="text-depro-gray">· Semana {weekIdx + 1} de {weekStarts.length}</span>
            <span
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: accent + "12", color: accent }}
            >
              {isPersonalizado ? <SlidersHorizontal size={10} /> : <Sparkles size={10} />}
              {isPersonalizado ? "Personalizado" : isClubAuto ? "Automático" : "Modo DEPRO"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-2xl border border-depro-border bg-white">
        <button
          type="button"
          disabled={weekIdx <= 0}
          onClick={() => changeWeek(weekIdx - 1)}
          className="p-2 rounded-xl border border-depro-border bg-depro-gray-light/50 text-depro-dark hover:bg-depro-gray-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center min-w-0">
          <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">
            Semana {weekIdx + 1} de {weekStarts.length}
          </div>
          <div className="font-black text-depro-dark">{formatWeekRangeLabel(weekStart, 0)}</div>
          {weekIdx === currentIdx && (
            <div className="text-[10px] text-green-700 font-bold mt-1 flex items-center justify-center gap-1">
              <CheckCircle size={10} /> Semana en curso
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={weekIdx >= weekStarts.length - 1}
          onClick={() => changeWeek(weekIdx + 1)}
          className="p-2 rounded-xl border border-depro-border bg-depro-gray-light/50 text-depro-dark hover:bg-depro-gray-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Semana siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: `linear-gradient(135deg, ${accent}14 0%, ${accent}04 100%)`, border: `1px solid ${accent}25` }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-black flex-shrink-0" style={{ backgroundColor: accent + "20", color: accent }}>
          S{weekIdx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-depro-gray uppercase tracking-wide">Semana {weekIdx + 1}</div>
          <div className="font-black text-depro-dark">{formatWeekRangeLabel(weekStart, 0)}</div>
          <div className="text-xs text-depro-gray">
            {formatDate(bounds.startDate)} → {formatDate(bounds.endDate)}
            {isClubAuto ? " · Microciclo según tu cuestionario" : ""}
          </div>
        </div>
      </div>

      {!week?.sessions?.length ? (
        <div className="bg-white border border-depro-border rounded-2xl p-10 text-center">
          <Calendar size={28} className="mx-auto mb-2 text-depro-gray/40" />
          <p className="text-depro-gray text-sm">
            {genError
              ? `No se pudo generar el microciclo. ${genError}`
              : "No hay sesiones configuradas todavía. Revisa tu frecuencia de entrenamiento en tu perfil."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {week.sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={s.id === activeSessionId
                  ? { backgroundColor: accent, color: contrastText(accent) }
                  : { backgroundColor: "white", color: "#374151", border: "1px solid #E5E7EB" }}
              >
                {s.assignedDay} · Protocolo {s.protocol}
              </button>
            ))}
            {isPersonalizado && (
              <>
                <button
                  onClick={() => setShowBuilder(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border"
                  style={{ borderColor: accent + "40", color: accent, borderStyle: "dashed" }}
                >
                  <Plus size={14} /> Sesión propia
                </button>
                <button
                  onClick={() => setShowExerciseModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border"
                  style={{ borderColor: "#E5E7EB", color: "#374151" }}
                >
                  <Plus size={14} /> Ejercicio propio
                </button>
              </>
            )}
            {savedFlash && (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1 self-center ml-1">
                Guardado ✓
              </span>
            )}
          </div>

          {activeSession && (
            <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
              <div className="p-5" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)` }}>
                <div className="flex items-start gap-2">
                  <input
                    key={activeSession.id + "_title"}
                    defaultValue={activeSession.title}
                    onBlur={handleTitleBlur}
                    className="flex-1 bg-transparent text-xl font-black outline-none placeholder-white/60"
                    style={{ color: contrastText(accent) }}
                    placeholder="Título de la sesión"
                  />
                  {isPersonalizado && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={handleDuplicateSession}
                        title="Duplicar sesión"
                        className="p-2 rounded-lg transition-colors hover:opacity-80"
                        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                      >
                        <Copy size={14} style={{ color: contrastText(accent) }} />
                      </button>
                      {activeSession.custom && (
                        <button
                          onClick={() => handleDeleteSession(activeSession.id)}
                          title="Eliminar sesión"
                          className="p-2 rounded-lg transition-colors hover:opacity-80"
                          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                        >
                          <Trash2 size={14} style={{ color: contrastText(accent) }} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: contrastText(accent) }}>
                    <Target size={12} /> {activeSession.protocolLabel}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: contrastText(accent) }}>
                    <Clock size={12} /> {activeSession.duracionEstimada}
                  </span>
                  {activeSession.objetivos?.map((o) => (
                    <span key={o} className="text-xs opacity-90" style={{ color: contrastText(accent) }}>· {o}</span>
                  ))}
                </div>
              </div>

              <div className="p-5 space-y-3">
                {(isClubAuto || activeSession.engine === "club_auto" || activeSession.structure?.length) && activeSession.structure?.length ? (
                  <ClubAutoSessionView
                    session={activeSession}
                    accent={accent}
                    taskStorageKey={clubId && teamId ? `depro_coach_tasks_${clubId}_${teamId}_${activeSession.id}` : ""}
                    canRefreshBall={hasFeatureAccess(user, "unlimited_ball_warmups")}
                    refreshBallLocked="Incluido en Premium o con el extra de refresco ilimitado con balón."
                    onRefreshBall={() => {
                      if (!hasFeatureAccess(user, "unlimited_ball_warmups")) return;
                      const next = selectBallWarmup({
                        nivel: config.nivel || "B",
                        protocolo: activeSession.protocol || "A",
                        seed: `${Date.now()}|refresh`,
                        avoidId: activeSession.structure?.find((b) => b.type === "calentamiento_balon")?.item?.id,
                      });
                      applyUpdate(activeSession.id, (s) => ({
                        ...s,
                        structure: (s.structure || []).map((b) => (
                          b.type === "calentamiento_balon" ? { ...b, item: next } : b
                        )),
                      }));
                    }}
                  />
                ) : (
                <div className="space-y-3">
                  {(activeSession.exercises || []).map((ex, idx) => (
                    <div key={ex.id} className="border border-depro-border rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 flex-shrink-0 pt-0.5">
                          <button onClick={() => moveExercise(idx, -1)} disabled={idx === 0} className="p-0.5 rounded disabled:opacity-30 hover:bg-depro-gray-light" aria-label="Subir">
                            <ChevronUp size={14} className="text-depro-gray" />
                          </button>
                          <button onClick={() => moveExercise(idx, 1)} disabled={idx === activeSession.exercises.length - 1} className="p-0.5 rounded disabled:opacity-30 hover:bg-depro-gray-light" aria-label="Bajar">
                            <ChevronDown size={14} className="text-depro-gray" />
                          </button>
                        </div>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: accent + "15", color: accent }}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-depro-dark leading-tight">{ex.name}</h4>
                              <p className="text-xs text-depro-gray mt-0.5">{ex.categoria}</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {isPersonalizado && (
                                <button
                                  onClick={() => handleToggleFavorite(ex.exerciseId)}
                                  title="Favorito"
                                  className="p-1.5 rounded-lg border transition-colors hover:opacity-80"
                                  style={{ borderColor: "#E5E7EB" }}
                                >
                                  <Star
                                    size={13}
                                    className={favorites.includes(ex.exerciseId) ? "" : "text-depro-gray"}
                                    style={favorites.includes(ex.exerciseId) ? { fill: "#F59E0B", color: "#F59E0B" } : {}}
                                  />
                                </button>
                              )}
                              <button
                                onClick={() => handleSubstitute(ex, idx)}
                                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors hover:opacity-80"
                                style={{ borderColor: accent + "40", color: accent }}
                              >
                                <RefreshCw size={12} /> Sustituir
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-depro-gray">
                            <span className="flex items-center gap-1"><Dumbbell size={11} /> {ex.sets} series</span>
                            <span>{ex.reps}</span>
                            <span>Descanso {ex.rest}</span>
                            <span className="flex items-center gap-1"><Clock size={11} /> {ex.duration}</span>
                          </div>

                          {ex.description && (
                            <p className="text-xs text-depro-gray mt-2 flex items-start gap-1.5">
                              <Info size={12} className="flex-shrink-0 mt-0.5" /> {ex.description}
                            </p>
                          )}

                          {youtubeEmbedUrl(resolveExerciseVideo(ex)) && (
                            <iframe
                              src={youtubeEmbedUrl(resolveExerciseVideo(ex))}
                              title={ex.name}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="mt-3 w-full aspect-video rounded-lg border border-depro-border"
                            />
                          )}

                          <div className="mt-2">
                            <label className="flex items-center gap-1 text-[11px] font-semibold text-depro-gray mb-1">
                              <StickyNote size={11} /> Notas del entrenador
                            </label>
                            <textarea
                              key={ex.id + "_notes"}
                              defaultValue={ex.coachNotes || ""}
                              onBlur={(e) => handleNotesBlur(ex.id, e.target.value)}
                              placeholder="Añade una observación para esta tarjeta…"
                              rows={1}
                              className="w-full text-sm border border-depro-border rounded-lg px-3 py-1.5 outline-none focus:border-depro-blue resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}

                {!isClubAuto && (
                <div>
                  <label className="text-sm font-bold text-depro-dark mb-1.5 block">Observaciones de la sesión</label>
                  <textarea
                    key={activeSession.id + "_obs"}
                    defaultValue={activeSession.observaciones || ""}
                    onBlur={handleObservacionesBlur}
                    placeholder="Comentarios generales, comentarios del entrenador, contexto del entrenamiento…"
                    rows={2}
                    className="w-full text-sm border border-depro-border rounded-xl px-3 py-2 outline-none focus:border-depro-blue resize-none"
                  />
                </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showBuilder && (
        <SessionBuilderModal
          accent={accent}
          clubId={clubId}
          onClose={() => setShowBuilder(false)}
          onCreate={handleSessionCreated}
        />
      )}
      {showExerciseModal && (
        <CustomExerciseModal
          accent={accent}
          clubId={clubId}
          onClose={() => setShowExerciseModal(false)}
          onCreated={() => setShowExerciseModal(false)}
        />
      )}
    </div>
  );
}
