import { Link } from "react-router-dom";
import {
  Users, ArrowRight, TrendingUp, Euro, Building2, Percent, UserCircle,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { PLANS } from "../../lib/checkoutPlans";
import { canUserLogin, monthlyBilledAmount, adminStatusLabel, formatManualPrice } from "../../lib/adminAccountStatus";

function planPrice(planId) {
  return PLANS[planId]?.price ?? 0;
}

function euro(n) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
}

export default function AdminOverviewPage() {
  const { clients, allUsers = [] } = useAdmin();

  const users = allUsers.length
    ? allUsers
    : clients.map((c) => ({ ...c, type: "player", role: "player" }));

  const players = users.filter((u) => u.type === "player" || u.role === "player");
  const coaches = users.filter((u) =>
    u.role === "coach"
    || u.type === "coach"
    || (u.role === "club" && (u.teamRole === "entrenador" || u.isSoloCoach))
  );
  const clubs = users.filter((u) =>
    u.role === "club"
    && (u.teamRole === "administrador" || u.teamRole === "coordinador")
    && !u.isSoloCoach
  );

  const withAccess = (u) => canUserLogin(u.subscriptionStatus || "activo");
  const activePlayers = players.filter(withAccess);
  const accessClubs = clubs.filter(withAccess);

  const incomePlayers = activePlayers.reduce((s, u) => s + monthlyBilledAmount(u, planPrice(u.plan)), 0);
  const incomeClubs = accessClubs.reduce((s, u) => s + monthlyBilledAmount(u, planPrice(u.plan)), 0);
  const incomeTotal = incomePlayers + incomeClubs;
  const discountUsers = users.filter((u) => u.clubCode || u.discountCode).length;

  const stats = [
    { label: "Jugadores", value: players.length, icon: Users, color: "#0A36F7", bg: "#EEF1FF" },
    { label: "Entrenadores", value: coaches.length, icon: UserCircle, color: "#3BC21D", bg: "#EAF9E6" },
    { label: "Clubs con acceso", value: accessClubs.length, icon: Building2, color: "#F6CC12", bg: "#FEFAE7" },
    { label: "Ingresos / mes (est.)", value: euro(incomeTotal), icon: Euro, color: "#FB2C39", bg: "#FEE8EA" },
  ];

  const directory = [...players, ...coaches].slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Panel DEPRO</h1>
          <p className="text-depro-gray text-sm mt-0.5">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <img src="/logo.png" alt="DEPRO" className="h-7 w-auto opacity-20" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <TrendingUp size={13} className="text-depro-green mt-1" />
            </div>
            <div className="text-2xl font-black text-depro-dark">{s.value}</div>
            <div className="text-sm text-depro-gray">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Panel económico */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Euro size={18} className="text-depro-blue" />
          <h2 className="font-bold text-depro-dark">Panel económico</h2>
        </div>
        <p className="text-sm text-depro-gray">
          Registro financiero interno (estimación mensual según planes activos). No es un dashboard de uso.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-depro-border p-4">
            <p className="text-[11px] font-bold uppercase text-depro-gray">Ingresos totales</p>
            <p className="text-xl font-black text-depro-dark mt-1">{euro(incomeTotal)}/mes</p>
          </div>
          <div className="rounded-xl border border-depro-border p-4">
            <p className="text-[11px] font-bold uppercase text-depro-gray">Planes individuales</p>
            <p className="text-xl font-black text-depro-dark mt-1">{euro(incomePlayers)}/mes</p>
            <p className="text-xs text-depro-gray mt-0.5">{activePlayers.length} activos</p>
          </div>
          <div className="rounded-xl border border-depro-border p-4">
            <p className="text-[11px] font-bold uppercase text-depro-gray">Aportación clubs</p>
            <p className="text-xl font-black text-depro-dark mt-1">{euro(incomeClubs)}/mes</p>
            <p className="text-xs text-depro-gray mt-0.5">{accessClubs.length} clubs con acceso</p>
          </div>
          <div className="rounded-xl border border-depro-border p-4">
            <p className="text-[11px] font-bold uppercase text-depro-gray flex items-center gap-1">
              <Percent size={12} /> Códigos descuento
            </p>
            <p className="text-xl font-black text-depro-dark mt-1">{discountUsers}</p>
            <p className="text-xs text-depro-gray mt-0.5">usuarios con código / club</p>
          </div>
        </div>
        {accessClubs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-depro-gray border-b border-depro-border">
                  <th className="py-2 font-bold">Club</th>
                  <th className="py-2 font-bold">Plan</th>
                  <th className="py-2 font-bold">Aportación</th>
                  <th className="py-2 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {accessClubs.slice(0, 8).map((c) => (
                  <tr key={c.id} className="border-b border-depro-border/60">
                    <td className="py-2 font-semibold text-depro-dark">{c.name || c.email}</td>
                    <td className="py-2 text-depro-gray">{c.plan || "—"}</td>
                    <td className="py-2 font-bold text-depro-dark">{euro(monthlyBilledAmount(c, planPrice(c.plan)))}/mes</td>
                    <td className="py-2 text-depro-gray">{adminStatusLabel(c.subscriptionStatus)}{formatManualPrice(c.manualPrice) ? ` · ${formatManualPrice(c.manualPrice)}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-depro-dark">Jugadores y entrenadores</h2>
          <Link to="/admin/users" className="text-sm text-depro-blue hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {directory.map((user) => {
            const isPlayer = user.type === "player" || user.role === "player";
            return (
              <Link
                key={user.id}
                to={isPlayer ? `/admin/clients/${user.id}` : "/admin/users"}
                className="card hover:shadow-card-hover group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 bg-depro-blue/10 text-depro-blue">
                    {(user.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-depro-dark truncate">{user.name || user.email}</div>
                    <div className="text-xs text-depro-gray truncate">{user.email}</div>
                    <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-depro-gray-light text-depro-dark">
                      {isPlayer ? "Jugador" : "Entrenador"}{user.plan ? ` · ${user.plan}` : ""}
                    </span>
                  </div>
                  <ArrowRight size={15} className="text-depro-border group-hover:text-depro-blue transition-colors mt-1 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
          {directory.length === 0 && (
            <p className="text-sm text-depro-gray col-span-full">Aún no hay usuarios listados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
