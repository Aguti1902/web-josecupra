import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, ChevronRight, Clock, Users } from "lucide-react";
import { getClubCodePlayers, getPlayerTrainingSummary, isPlayerInActiveSquad } from "../../lib/clubPlayerRegistry";

export default function ClubPlayersMonitor({ clubId, teamId, accent = "#0A36F7", compact = false }) {
  const players = useMemo(() => {
    if (!clubId) return [];
    const squad = getClubCodePlayers(clubId, teamId || null);
    const codeOnly = getClubCodePlayers(clubId, null, { includeCodeOnly: true })
      .filter((p) => p.linkKind === "code" || !p.teamId);
    const byId = new Map();
    for (const p of [...squad, ...codeOnly]) byId.set(p.userId, p);
    return [...byId.values()]
      .map((p) => ({
        ...p,
        summary: getPlayerTrainingSummary(p.userId),
        active: p.status === "active" || isPlayerInActiveSquad(p.userId),
        trial: p.status === "trialing" || p.status === "pending",
      }))
      .sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));
  }, [clubId, teamId]);

  if (!clubId || players.length === 0) {
    if (compact) return null;
    return (
      <div className="dash-card-premium p-5 text-center text-sm text-depro-gray">
        <Users size={28} className="mx-auto mb-2 opacity-40" />
        Aún no hay jugadores registrados con el código del club.
      </div>
    );
  }

  const activeCount = players.filter((p) => p.active).length;

  return (
    <div className="dash-card-premium overflow-hidden">
      <div className="px-5 py-4 border-b border-depro-border flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-depro-dark flex items-center gap-2">
            <Activity size={16} style={{ color: accent }} />
            Seguimiento individual
          </h3>
          <p className="text-xs text-depro-gray mt-0.5">
            {activeCount} activos · {players.filter((p) => p.trial).length} en prueba / pendientes · {players.length} con código del club
          </p>
        </div>
        {!compact && (
          <Link to="/dashboard/squad" className="text-xs font-bold flex items-center gap-1" style={{ color: accent }}>
            Ver plantilla <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <div className="divide-y divide-depro-border">
        {players.slice(0, compact ? 4 : 12).map((p) => (
          <div key={p.userId} className="px-5 py-3 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
              style={{ backgroundColor: accent + "15", color: accent }}
            >
              {(p.name || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-depro-dark truncate">{p.name || "Jugador"}</div>
              <div className="text-xs text-depro-gray flex items-center gap-2 mt-0.5">
                {!p.active ? (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                    {p.status === "trialing" ? "Prueba gratuita" : p.linkKind === "code" ? "Código club" : "Pendiente pago"}
                  </span>
                ) : (
                  <>
                    <span>{p.summary.completed}/{p.summary.total || "—"} sesiones</span>
                    <span>·</span>
                    <span>{p.summary.adherence}% adherencia</span>
                  </>
                )}
              </div>
            </div>
            {p.active && (
              <div className="text-right shrink-0">
                <div className="text-sm font-black" style={{ color: accent }}>{p.summary.adherence}%</div>
                <div className="text-[10px] text-depro-gray flex items-center gap-0.5 justify-end">
                  <Clock size={10} /> semana
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
