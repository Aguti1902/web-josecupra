/**
 * Vista visual de sesión club_auto — idéntica a la planificación manual (§4.3):
 * Resumen | Calentamiento | Parte principal (hasta 6 huecos) | Diseñador de tareas
 */
import { useState, useEffect } from "react";
import { Dumbbell, Clock, Sparkles, StickyNote, Activity, BarChart2, Flame, ListChecks, PencilRuler, ExternalLink, Layers } from "lucide-react";
import { sessionTextsFor } from "../../data/sessionTypeTexts";
import { sessionTypeForProtocol } from "../../lib/clubAuto/clubAutoTaskSelector";
import { CLUB_SIN_BALON_INTRO } from "../../data/clubAutoCatalog";
import { prefetchCatalogMedia, resolveExerciseVideo, youtubeEmbedUrl } from "../../lib/catalogMedia";
import DisenarTareas, { SESSION_FRAMEWORK_UI, FRAMEWORK_TO_SESSION_TEXT } from "../shared/DisenarTareas";
import { createDefaultTaskDesigner } from "../../lib/taskDesigner";

function youtubeEmbed(url) {
  return youtubeEmbedUrl(url);
}

function ProtocolSlots({ exercises, accent }) {
  const visible = (exercises || []).filter((ex) => !ex.missing && (ex.nombre || ex.name));
  if (!visible.length) {
    return <p className="text-xs text-depro-gray italic py-4 text-center border border-dashed border-depro-border rounded-xl">Sin huecos etiquetados para este protocolo.</p>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {visible.map((ex, i) => {
        const embed = youtubeEmbed(resolveExerciseVideo(ex) || ex.videoUrl);
        return (
          <div key={`${ex.slot}-${i}`} className="rounded-xl border border-depro-border p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-depro-dark leading-tight">{ex.nombre || ex.name}</p>
                <p className="text-[11px] text-depro-gray mt-0.5">{ex.label || ex.slot}</p>
                {(ex.descripcion || ex.description) && (
                  <p className="text-[11px] text-depro-gray mt-1 leading-relaxed">{ex.descripcion || ex.description}</p>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-depro-gray">
                  {ex.sets && <span className="inline-flex items-center gap-1"><Dumbbell size={11} /> {ex.sets}</span>}
                  {ex.rest && <span>Descanso {ex.rest}</span>}
                </div>
              </div>
            </div>
            {embed && (
              <iframe
                src={embed}
                title={ex.nombre || ex.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video rounded-lg border border-depro-border"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ContentCard({ title, item, icon: Icon, accent, emptyText, onRefresh, canRefresh, refreshLocked }) {
  if (!item) {
    return (
      <div className="rounded-xl border border-dashed border-depro-border p-4">
        <p className="text-[11px] font-black uppercase tracking-wide text-depro-gray flex items-center gap-1.5">
          {Icon && <Icon size={12} style={{ color: accent }} />} {title}
        </p>
        <p className="text-xs text-depro-gray mt-2 italic">{emptyText || "Aún no hay contenido en esta carpeta."}</p>
      </div>
    );
  }
  const embed = youtubeEmbed(item.videoUrl || item.video);
  return (
    <div className="rounded-xl border border-depro-border p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-wide text-depro-gray flex items-center gap-1.5">
          {Icon && <Icon size={12} style={{ color: accent }} />} {title}
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={canRefresh ? onRefresh : undefined}
            disabled={!canRefresh}
            title={refreshLocked || ""}
            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-depro-border text-depro-blue disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cambiar
          </button>
        )}
      </div>
      <p className="font-bold text-sm text-depro-dark">{item.nombre || item.name}</p>
      {(item.descripcion || item.duracion) && (
        <p className="text-xs text-depro-gray leading-relaxed">{item.descripcion || item.duracion}</p>
      )}
      {(item.videoUrl || item.video) && !embed && (
        <a href={item.videoUrl || item.video} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-depro-blue">
          <ExternalLink size={11} /> Ver vídeo
        </a>
      )}
      {embed && (
        <iframe
          src={embed}
          title={item.nombre || item.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video rounded-lg border border-depro-border"
        />
      )}
    </div>
  );
}

/**
 * @param {{ session: object, accent?: string }} props
 */
export default function ClubAutoSessionView({
  session,
  accent = "#0A36F7",
  onRefreshBall,
  canRefreshBall = false,
  refreshBallLocked = "",
  taskStorageKey = "",
}) {
  const [tab, setTab] = useState("resumen");
  const [, setMediaReady] = useState(0);
  useEffect(() => {
    prefetchCatalogMedia().then(() => setMediaReady((n) => n + 1)).catch(() => {});
  }, []);
  const structure = session?.structure || [];
  const byType = Object.fromEntries(structure.map((b) => [b.type, b]));
  const warm = byType.calentamiento_general;
  const ball = byType.calentamiento_balon;
  const proto = byType.protocolo;
  const obs = byType.observaciones;

  const framework = session?.framework || session?.protocol || "A";
  const st = SESSION_FRAMEWORK_UI[framework] || SESSION_FRAMEWORK_UI.A;
  const StIcon = st.Icon;
  const sessionType = sessionTypeForProtocol(session?.protocol || framework);
  const texts = sessionTextsFor(FRAMEWORK_TO_SESSION_TEXT[framework] || sessionType || "extensiva");
  const duration = session.duration || session.duracionEstimada || "75 min";
  const intensity = session.intensity || st.label;
  const exerciseCount = (proto?.exercises || []).filter((ex) => !ex.missing && (ex.nombre || ex.name)).length;

  const TABS = [
    { id: "resumen", label: "Resumen", Icon: BarChart2 },
    { id: "calentamiento", label: "Calentamiento", Icon: Flame },
    { id: "principal", label: "Parte principal", Icon: ListChecks },
    { id: "tareas", label: "Diseñar tareas", Icon: PencilRuler },
  ];

  return (
    <div className="space-y-4">
      <div className="flex border-b border-depro-border overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-bold transition-colors border-b-2 ${
              tab === id
                ? "border-depro-blue text-depro-blue bg-depro-blue-light/30"
                : "border-transparent text-depro-gray hover:text-depro-dark bg-white"
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 flex items-center gap-5 border"
            style={{ background: `linear-gradient(135deg,${st.bg} 0%,white 80%)`, borderColor: st.color + "25" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border"
              style={{ backgroundColor: st.color + "18", borderColor: st.color + "30" }}>
              <StIcon size={28} style={{ color: st.color }} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray mb-0.5">Sesión del día</div>
              <div className="font-black text-depro-dark text-2xl leading-none">{session.templateKey || framework}</div>
              <div className="text-sm font-semibold mt-1" style={{ color: st.color }}>{st.label}</div>
              {session.assignedDay && (
                <div className="text-xs text-depro-gray mt-1">{session.assignedDay}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Duración", value: duration, Icon: Clock },
              { label: "Intensidad", value: intensity, Icon: Activity },
              { label: "Dinámica", value: st.label, Icon: StIcon },
              { label: "Ejercicios", value: `${exerciseCount} tareas`, Icon: Layers },
            ].map(({ label, value, Icon: MIcon }) => (
              <div key={label} className="bg-depro-gray-light rounded-xl p-4 border border-depro-border">
                <MIcon size={16} className="mb-2" style={{ color: accent }} />
                <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
                <div className="text-sm font-black text-depro-dark mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-depro-border p-4">
              <p className="text-[11px] font-black uppercase text-depro-gray mb-2">{texts.warmup.title}</p>
              <ul className="space-y-1">
                {texts.warmup.bullets.slice(0, 3).map((b) => (
                  <li key={b} className="text-xs text-depro-dark">· {b}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-depro-border p-4">
              <p className="text-[11px] font-black uppercase text-depro-gray mb-2">{texts.main.title}</p>
              <ul className="space-y-1">
                {texts.main.bullets.map((b) => (
                  <li key={b} className="text-xs text-depro-dark">· {b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === "calentamiento" && (
        <section className="space-y-3">
          <h4 className="text-sm font-black text-depro-dark flex items-center gap-2">
            <Sparkles size={14} style={{ color: accent }} /> Calentamiento
          </h4>
          <div className="rounded-xl border border-depro-border bg-depro-blue-light/20 p-4">
            <p className="text-sm font-bold text-depro-dark">{CLUB_SIN_BALON_INTRO.titulo}</p>
            <p className="text-xs text-depro-gray mt-1 leading-relaxed">{CLUB_SIN_BALON_INTRO.descripcion}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <ContentCard
              title={warm?.item?.nombre || "Vídeo · sin balón"}
              item={warm?.item?.placeholder ? null : warm?.item}
              icon={Sparkles}
              accent={accent}
              emptyText="Cuando el admin suba vídeos, aquí saldrá Calentamiento 1, 2, 3…"
            />
            <ContentCard
              title="Con balón"
              item={ball?.item}
              icon={Activity}
              accent={accent}
              emptyText="Cuando el admin añada tareas en las carpetas, aparecerán aquí."
              onRefresh={onRefreshBall}
              canRefresh={canRefreshBall}
              refreshLocked={refreshBallLocked}
            />
          </div>
        </section>
      )}

      {tab === "principal" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-black text-depro-dark flex items-center gap-2">
              <Dumbbell size={14} style={{ color: accent }} /> Parte principal (protocolo)
            </h4>
            {proto?.template?.format && (
              <span className="text-[11px] font-semibold text-depro-gray">{proto.template.format}</span>
            )}
          </div>
          <p className="text-sm font-bold text-depro-dark">{proto?.template?.title || proto?.label}</p>
          <ProtocolSlots exercises={proto?.exercises} accent={accent} />
        </section>
      )}

      {tab === "tareas" && (
        <section className="space-y-4">
          <DisenarTareas
            accentColor={accent}
            sessionType={framework}
            storageKey={taskStorageKey}
            taskDesigner={session.taskDesigner || createDefaultTaskDesigner()}
          />
          {(obs?.item?.observaciones || session.observaciones) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-depro-dark space-y-2">
              <p className="text-[11px] font-black uppercase text-amber-800 flex items-center gap-1.5">
                <StickyNote size={12} /> Observaciones / adaptaciones
              </p>
              <p>{obs?.item?.observaciones || session.observaciones}</p>
              {obs?.item?.adaptaciones_jugadores && (
                <p className="text-xs text-depro-gray"><strong>Jugadores:</strong> {obs.item.adaptaciones_jugadores}</p>
              )}
              {obs?.item?.adaptaciones_espacio && (
                <p className="text-xs text-depro-gray"><strong>Espacio:</strong> {obs.item.adaptaciones_espacio}</p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
