/**
 * Vista visual de sesión club_auto — estructura equivalente a la entrada manual:
 * Resumen → Calentamiento (movilidad + balón) → Parte principal (protocolo + tarea) → Observaciones
 */
import { Dumbbell, Clock, Target, Sparkles, StickyNote, Activity } from "lucide-react";

function ProtocolBlock({ block, accent }) {
  const exercises = block.exercises || [];
  return (
    <div className="rounded-xl border border-depro-border overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ backgroundColor: `${accent}12` }}>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: accent }}>Protocolo</p>
          <p className="text-sm font-bold text-depro-dark">{block.template?.title || block.label}</p>
        </div>
        <span className="text-[11px] font-semibold text-depro-gray shrink-0">{block.template?.format}</span>
      </div>
      <div className="divide-y divide-depro-border">
        {exercises.map((ex, i) => (
          <div key={`${ex.slot}-${i}`} className="flex items-start gap-3 px-4 py-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-depro-dark leading-tight">{ex.nombre || ex.name}</p>
              <p className="text-[11px] text-depro-gray mt-0.5">{ex.label || ex.slot}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-depro-gray">
                {ex.sets && <span className="inline-flex items-center gap-1"><Dumbbell size={11} /> {ex.sets}</span>}
                {ex.rest && <span>Descanso {ex.rest}</span>}
              </div>
            </div>
          </div>
        ))}
        {!exercises.length && (
          <p className="px-4 py-3 text-xs text-depro-gray">Sin ejercicios en este protocolo.</p>
        )}
      </div>
    </div>
  );
}

function ContentCard({ title, item, icon: Icon, accent, children }) {
  if (!item && !children) return null;
  return (
    <div className="rounded-xl border border-depro-border p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-depro-gray mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={12} style={{ color: accent }} />} {title}
      </p>
      {item && (
        <>
          <p className="font-bold text-sm text-depro-dark">{item.nombre || item.name}</p>
          {(item.descripcion || item.duracion) && (
            <p className="text-xs text-depro-gray mt-1 leading-relaxed">{item.descripcion || item.duracion}</p>
          )}
          {item.carpeta && (
            <p className="text-[10px] font-mono text-depro-gray mt-2 opacity-70">{item.carpeta}</p>
          )}
        </>
      )}
      {children}
    </div>
  );
}

/**
 * @param {{ session: object, accent?: string }} props
 */
export default function ClubAutoSessionView({ session, accent = "#0A36F7" }) {
  const structure = session?.structure || [];
  const byType = Object.fromEntries(structure.map((b) => [b.type, b]));
  const warm = byType.calentamiento_general;
  const ball = byType.calentamiento_balon;
  const proto = byType.protocolo;
  const task = byType.tarea_principal;
  const obs = byType.observaciones;

  return (
    <div className="space-y-5">
      {/* 1. Resumen */}
      <div className="rounded-xl border border-depro-border p-4 flex flex-wrap gap-3 items-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
          <Target size={12} /> {session.protocolLabel || `Protocolo ${session.protocol}`}
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

      {/* 2. Calentamiento */}
      <section className="space-y-3">
        <h4 className="text-sm font-black text-depro-dark flex items-center gap-2">
          <Sparkles size={14} style={{ color: accent }} /> Calentamiento
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <ContentCard title="Movilidad / general" item={warm?.item} icon={Sparkles} accent={accent} />
          <ContentCard title="Tarea con balón" item={ball?.item} icon={Activity} accent={accent} />
        </div>
      </section>

      {/* 3. Parte principal */}
      <section className="space-y-3">
        <h4 className="text-sm font-black text-depro-dark flex items-center gap-2">
          <Dumbbell size={14} style={{ color: accent }} /> Parte principal
        </h4>
        {proto && <ProtocolBlock block={proto} accent={accent} />}
        <ContentCard title="Diseñador de tareas / tarea principal" item={task?.item} icon={Target} accent={accent} />
      </section>

      {/* 4. Observaciones */}
      <section className="space-y-3">
        <h4 className="text-sm font-black text-depro-dark flex items-center gap-2">
          <StickyNote size={14} style={{ color: accent }} /> Observaciones / adaptaciones
        </h4>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-depro-dark space-y-2">
          <p>{obs?.item?.observaciones || session.observaciones || "Sin observaciones adicionales."}</p>
          {obs?.item?.adaptaciones_jugadores && (
            <p className="text-xs text-depro-gray"><strong>Jugadores:</strong> {obs.item.adaptaciones_jugadores}</p>
          )}
          {obs?.item?.adaptaciones_espacio && (
            <p className="text-xs text-depro-gray"><strong>Espacio:</strong> {obs.item.adaptaciones_espacio}</p>
          )}
        </div>
      </section>
    </div>
  );
}
