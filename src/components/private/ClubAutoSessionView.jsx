/**
 * Vista visual de sesión club_auto — idéntica a la planificación manual (§4.3):
 * Resumen | Calentamiento | Parte principal (hasta 6 huecos) | Diseñador de tareas
 */
import { useState } from "react";
import { Dumbbell, Clock, Target, Sparkles, StickyNote, Activity, BarChart2, Flame, ListChecks, PencilRuler, ExternalLink } from "lucide-react";
import { sessionTextsFor } from "../../data/sessionTypeTexts";
import { sessionTypeForProtocol } from "../../lib/clubAuto/clubAutoTaskSelector";

function youtubeEmbed(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function ProtocolSlots({ exercises, accent }) {
  const visible = (exercises || []).filter((ex) => !ex.missing && (ex.nombre || ex.name));
  if (!visible.length) {
    return <p className="text-xs text-depro-gray italic py-4 text-center border border-dashed border-depro-border rounded-xl">Sin huecos etiquetados para este protocolo.</p>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {visible.map((ex, i) => {
        const embed = youtubeEmbed(ex.videoUrl);
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

function ContentCard({ title, item, icon: Icon, accent }) {
  if (!item) return null;
  const embed = youtubeEmbed(item.videoUrl || item.video);
  return (
    <div className="rounded-xl border border-depro-border p-4 space-y-2">
      <p className="text-[11px] font-black uppercase tracking-wide text-depro-gray flex items-center gap-1.5">
        {Icon && <Icon size={12} style={{ color: accent }} />} {title}
      </p>
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
export default function ClubAutoSessionView({ session, accent = "#0A36F7" }) {
  const [tab, setTab] = useState("resumen");
  const structure = session?.structure || [];
  const byType = Object.fromEntries(structure.map((b) => [b.type, b]));
  const warm = byType.calentamiento_general;
  const ball = byType.calentamiento_balon;
  const proto = byType.protocolo;
  const task = byType.tarea_principal;
  const obs = byType.observaciones;

  const sessionType = sessionTypeForProtocol(session?.protocol || "A");
  const texts = sessionTextsFor(sessionType);

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
          <div className="rounded-xl border border-depro-border p-4 flex flex-wrap gap-3 items-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
              <Target size={12} /> {session.protocolLabel || `Protocolo ${session.protocol}`} · {sessionType}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-depro-gray">
              <Clock size={12} /> {session.duracionEstimada || "75–90 min"}
            </span>
            {session.intensityDay && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-depro-gray">
                <Activity size={12} /> {session.intensityDay}
              </span>
            )}
            {session.assignedDay && (
              <span className="text-xs text-depro-gray ml-auto">{session.assignedDay}</span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-depro-border p-4">
              <p className="text-[11px] font-black uppercase text-depro-gray mb-2">{texts.warmup.title}</p>
              <ul className="space-y-1.5">
                {texts.warmup.bullets.map((b) => (
                  <li key={b} className="text-xs text-depro-dark leading-relaxed">· {b}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-depro-border p-4">
              <p className="text-[11px] font-black uppercase text-depro-gray mb-2">{texts.main.title}</p>
              <ul className="space-y-1.5">
                {texts.main.bullets.map((b) => (
                  <li key={b} className="text-xs text-depro-dark leading-relaxed">· {b}</li>
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
          <div className="grid sm:grid-cols-2 gap-3">
            <ContentCard title="General · sin balón" item={warm?.item} icon={Sparkles} accent={accent} />
            <ContentCard title="Específico · con balón" item={ball?.item} icon={Activity} accent={accent} />
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
        <section className="space-y-3">
          <h4 className="text-sm font-black text-depro-dark flex items-center gap-2">
            <PencilRuler size={14} style={{ color: accent }} /> Diseñador de tareas
          </h4>
          <ContentCard title="Tarea principal del día" item={task?.item} icon={Target} accent={accent} />
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-depro-dark space-y-2">
            <p className="text-[11px] font-black uppercase text-amber-800 flex items-center gap-1.5">
              <StickyNote size={12} /> Observaciones / adaptaciones
            </p>
            <p>{obs?.item?.observaciones || session.observaciones || "Sin observaciones adicionales."}</p>
            {obs?.item?.adaptaciones_jugadores && (
              <p className="text-xs text-depro-gray"><strong>Jugadores:</strong> {obs.item.adaptaciones_jugadores}</p>
            )}
            {obs?.item?.adaptaciones_espacio && (
              <p className="text-xs text-depro-gray"><strong>Espacio:</strong> {obs.item.adaptaciones_espacio}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
