import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, Users, RefreshCw, CreditCard, Building2, User, Shield, Plus, Dumbbell, Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAdmin } from "../../context/AdminContext";
import { useAuth } from "../../context/AuthContext";
import { purgePlayerClubArtifacts } from "../../lib/clubPlayerRegistry";
import AdminProvisionProfileModal from "../../components/admin/AdminProvisionProfileModal";
import AdminProvisionHelp from "../../components/admin/AdminProvisionHelp";
import {
  ADMIN_STATUS_STYLES,
  adminStatusLabel,
  isAdminManagedStatus,
  normalizeAdminStatus,
  formatManualPrice,
  canUserLogin,
} from "../../lib/adminAccountStatus";
import {
  startImpersonation,
  canImpersonateUser,
  canDeleteUser,
  compareUsersForAdminList,
  isPremiumPlayerPlan,
} from "../../lib/adminImpersonation";

const TYPE_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "player", label: "Jugadores" },
  { id: "club_coordinador", label: "Coordinadores" },
  { id: "club_administrador", label: "Administradores club" },
  { id: "club_entrenador", label: "Entrenadores" },
  { id: "coach", label: "DEPRO Coach" },
  { id: "club_pending", label: "Alta pendiente" },
  { id: "admin", label: "Admins" },
];

const STATUS_STYLES = {
  active: "bg-green-50 text-green-700 border-green-200",
  trialing: "bg-blue-50 text-blue-700 border-blue-200",
  canceled: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  past_due: "bg-yellow-50 text-yellow-700 border-yellow-200",
  none: "bg-gray-50 text-gray-500 border-gray-200",
};

function StatusBadge({ status, trialEndsAt, billingSource, manualPrice }) {
  const raw = status || "";
  if (billingSource === "manual" || isAdminManagedStatus(raw)) {
    const id = normalizeAdminStatus(raw || "activo");
    const price = formatManualPrice(manualPrice);
    return (
      <span className="inline-flex flex-col items-start gap-0.5">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${ADMIN_STATUS_STYLES[id]}`}>
          {adminStatusLabel(id)}
        </span>
        {price && <span className="text-[10px] text-depro-gray">{price}/mes</span>}
      </span>
    );
  }
  const s = raw || "none";
  const label = s === "trialing"
    ? (trialEndsAt ? `Trial · hasta ${new Date(trialEndsAt).toLocaleDateString("es-ES")}` : "Trial")
    : s === "none" ? "Sin pago" : s;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border capitalize ${STATUS_STYLES[s] || STATUS_STYLES.none}`}>
      {label}
    </span>
  );
}

function TypeBadge({ type, label }) {
  const colors = {
    admin: "bg-depro-dark text-white",
    player: "bg-depro-blue/10 text-depro-blue",
    club_coordinador: "bg-indigo-50 text-indigo-700",
    club_administrador: "bg-amber-50 text-amber-800",
    club_entrenador: "bg-sky-50 text-sky-700",
    club_ayudante: "bg-sky-50 text-sky-600",
    coach: "bg-emerald-50 text-emerald-700",
    coach_pending: "bg-yellow-50 text-yellow-700",
    club_pending: "bg-yellow-50 text-yellow-700",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${colors[type] || "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

export default function AdminUsersPage() {
  const { refreshClients } = useAdmin();
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [provisionAudience, setProvisionAudience] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const alta = searchParams.get("alta");
    if (alta === "coach" || alta === "player") setProvisionAudience(alta);
  }, [searchParams]);

  const openProvision = (audience) => {
    setSearchParams({ alta: audience }, { replace: true });
    setProvisionAudience(audience);
  };

  const closeProvision = () => {
    setProvisionAudience(null);
    if (searchParams.get("alta")) setSearchParams({}, { replace: true });
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("/api/admin-users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "No se pudo cargar");
      setUsers(json.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openUserPanel = (u) => {
    if (!canImpersonateUser(u)) return;
    startImpersonation(u);
    window.location.assign("/dashboard");
  };

  const confirmDelete = async () => {
    if (!pendingDelete?.id) return;
    setDeleting(true);
    setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: pendingDelete.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "No se pudo eliminar");
      purgePlayerClubArtifacts(pendingDelete.id, pendingDelete.email);
      setUsers((prev) => prev.filter((x) => x.id !== pendingDelete.id));
      setPendingDelete(null);
      refreshClients();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => {
        const matchType = typeFilter === "all"
          || u.type === typeFilter
          || (typeFilter === "coach" && (u.type === "coach" || u.type === "coach_pending"))
          || (typeFilter === "club_pending" && (u.type === "club_pending" || u.type === "coach_pending"));
        if (!matchType) return false;
        if (!q) return true;
        return (
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.clubName?.toLowerCase().includes(q) ||
          u.plan?.toLowerCase().includes(q)
        );
      })
      .sort(compareUsersForAdminList);
  }, [users, search, typeFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    players: users.filter((u) => u.type === "player").length,
    clubs: users.filter((u) => u.type?.startsWith("club_")).length,
    coaches: users.filter((u) => u.type === "coach" || u.type === "coach_pending").length,
    paying: users.filter((u) => {
      if (u.billingSource === "manual" || isAdminManagedStatus(u.subscriptionStatus)) {
        return canUserLogin(u.subscriptionStatus);
      }
      return u.subscriptionStatus === "active" || u.subscriptionStatus === "trialing";
    }).length,
  }), [users]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-depro-dark">Usuarios</h1>
          <p className="text-sm text-depro-gray mt-0.5">
            Pulsa una fila para ver su panel. La papelera elimina la cuenta. En jugadores, Premium sale primero.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openProvision("coach")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            <Dumbbell size={14} /> Crear DEPRO Coach
          </button>
          <button
            type="button"
            onClick={() => openProvision("player")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark"
          >
            <Plus size={14} /> Crear jugador
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-depro-border text-sm font-semibold text-depro-gray hover:text-depro-blue hover:border-depro-blue disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        </div>
      </div>

      <AdminProvisionHelp current={searchParams.get("alta") === "player" ? "player" : searchParams.get("alta") === "coach" ? "coach" : null} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Users },
          { label: "Jugadores", value: stats.players, icon: User },
          { label: "Staff club", value: stats.clubs, icon: Building2 },
          { label: "DEPRO Coach", value: stats.coaches, icon: Shield },
          { label: "Con acceso", value: stats.paying, icon: CreditCard },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-depro-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase tracking-wide mb-1">
              <Icon size={12} /> {label}
            </div>
            <p className="text-2xl font-black text-depro-dark">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-depro-gray" />
          <input
            className="w-full pl-9 pr-4 py-2.5 border border-depro-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="Buscar por nombre, email, club o plan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                typeFilter === f.id
                  ? "bg-depro-blue border-depro-blue text-white"
                  : "border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center"><div className="spinner border-depro-blue/20 border-t-depro-blue" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-depro-gray text-sm">No hay usuarios con esos filtros</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-depro-gray-light">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide hidden md:table-cell">Club</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide">Pago</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide hidden lg:table-cell">Alta</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-depro-border">
                {filtered.map((u) => {
                  const clickable = canImpersonateUser(u);
                  const premium = isPremiumPlayerPlan(u.plan) && (u.type === "player" || u.role === "player");
                  return (
                  <tr
                    key={u.id}
                    onClick={() => openUserPanel(u)}
                    className={`hover:bg-depro-gray-light/50 ${clickable ? "cursor-pointer" : ""}`}
                    title={clickable ? "Ver el panel de esta cuenta" : undefined}
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-depro-dark">{u.name}</p>
                      <p className="text-xs text-depro-gray">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <TypeBadge type={u.type} label={u.typeLabel} />
                        {premium && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Premium</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-depro-gray text-xs">
                      {u.clubName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-depro-dark">{u.plan || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={u.subscriptionStatus}
                        trialEndsAt={u.trialEndsAt}
                        billingSource={u.billingSource}
                        manualPrice={u.manualPrice}
                      />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-depro-gray">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("es-ES") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {canDeleteUser(u, adminUser?.email) && (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(u)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-depro-gray hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar usuario"
                          aria-label={`Eliminar a ${u.name || u.email}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-depro w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-depro-dark text-center mb-2">¿Eliminar esta cuenta?</h2>
            <p className="text-sm text-depro-gray text-center mb-1">
              <strong className="text-depro-dark">{pendingDelete.name}</strong>
            </p>
            <p className="text-xs text-depro-gray text-center font-mono mb-5">{pendingDelete.email}</p>
            <p className="text-sm text-depro-gray text-center mb-6">
              Dejará de poder entrar. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm text-depro-gray hover:bg-depro-gray-light"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {provisionAudience && (
        <AdminProvisionProfileModal
          audience={provisionAudience}
          onClose={closeProvision}
          onCreated={() => { closeProvision(); load(); refreshClients(); }}
        />
      )}
    </div>
  );
}
