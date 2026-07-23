import { useMemo } from "react";
import { Gauge, Calendar, Dumbbell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FeatureGate from "../../components/private/FeatureGate";
import { getLoadLogs } from "../../lib/loadLogs";

export default function PlayerLoadHistoryPage() {
  const { user } = useAuth();
  const logs = useMemo(() => getLoadLogs(user?.id), [user?.id]);

  return (
    <FeatureGate user={user} feature="cargas">
      <div className="dash-page">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Control de cargas</h1>
        <p className="text-depro-gray text-sm mb-8">
          Histórico de registros por entrenamiento. Cada sesión es independiente y no modifica semanas anteriores.
        </p>

        {logs.length === 0 ? (
          <div className="bg-white border border-depro-border rounded-2xl p-10 text-center shadow-card">
            <Gauge size={32} className="text-depro-gray mx-auto mb-3" />
            <p className="text-depro-gray text-sm">Aún no hay registros. Guarda cargas desde tus sesiones de entrenamiento.</p>
          </div>
        ) : (
          <div className="bg-white border border-depro-border rounded-2xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-depro-gray-light text-left">
                  <tr>
                    <th className="px-4 py-3 font-bold text-depro-gray">Fecha</th>
                    <th className="px-4 py-3 font-bold text-depro-gray">Sesión</th>
                    <th className="px-4 py-3 font-bold text-depro-gray">Ejercicio</th>
                    <th className="px-4 py-3 font-bold text-depro-gray">Datos</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-depro-border">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-depro-gray">
                          <Calendar size={13} />
                          {new Date(log.recordedAt).toLocaleDateString("es-ES")}
                        </div>
                        <div className="text-[10px] text-depro-gray">{log.weekLabel}</div>
                      </td>
                      <td className="px-4 py-3">{log.sessionTitle || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-depro-dark">
                        <div className="flex items-center gap-1.5"><Dumbbell size={13} className="text-depro-blue" />{log.exerciseName}</div>
                      </td>
                      <td className="px-4 py-3 text-depro-gray text-xs">
                        {[
                          log.weight && `${log.weight} kg`,
                          log.sets && `${log.sets} series`,
                          log.reps && `${log.reps} reps`,
                          log.time && `Tiempo: ${log.time}`,
                          log.distance && `Dist: ${log.distance}`,
                          log.heartRate && `FC: ${log.heartRate}`,
                          log.rpe && `RPE ${log.rpe}`,
                          log.feelings,
                          log.notes,
                        ].filter(Boolean).join(" · ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
