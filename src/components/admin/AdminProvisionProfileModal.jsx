import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Copy, RefreshCw, X } from "lucide-react";
import { createClubUser, saveClub } from "../../lib/adminStorage";
import PlanSelectField, { SubscriptionStatusSelect } from "./PlanSelectField";

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const PLAYER_POSITIONS = ["Portero", "Defensa", "Centrocampista", "Delantero", "Extremo"];
const COACH_CATEGORIES = ["Sub-12", "Sub-14", "Sub-16", "Juvenil", "Amateur"];

/**
 * Modal admin para provisionar DEPRO Coach (solo) o Jugador con plan personalizado.
 * audience: "coach" | "player"
 */
export default function AdminProvisionProfileModal({ audience, onClose, onCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: generatePassword(),
    planId: audience === "coach" ? "coach-pro" : "player-essential",
    subscriptionStatus: "active",
    teamName: "Mi equipo",
    category: "Sub-16",
    posicion: "Centrocampista",
  });
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState(null);

  const goNext = (userId) => {
    onCreated?.();
    onClose?.();
    if (audience === "player" && userId) {
      navigate(`/admin/plan-builder?clientId=${encodeURIComponent(userId)}`);
    } else if (audience === "coach") {
      navigate("/admin/club-auto");
    }
  };

  const mirrorPlayerLocal = (userId) => {
    if (!userId || audience !== "player") return;
    try {
      const raw = localStorage.getItem("depro_admin_clients");
      const list = raw ? JSON.parse(raw) : [];
      const entry = {
        id: userId,
        name: form.name,
        email: form.email,
        role: "player",
        plan: form.planId,
        subscriptionStatus: form.subscriptionStatus,
        billingSource: "manual",
        posicion: form.posicion,
      };
      const next = [entry, ...(list || []).filter((c) => c.id !== userId && c.email !== form.email)];
      localStorage.setItem("depro_admin_clients", JSON.stringify(next.slice(0, 500)));
    } catch { /* ignore */ }
  };

  const handleSubmit = async () => {
    if (!form.email || form.password.length < 6) return;
    setLoading(true);

    try {
      if (audience === "coach") {
        const clubId = `coach_${Date.now()}`;
        const teamId = `team_${Date.now()}`;
        const club = {
          id: clubId,
          name: form.teamName || `DEPRO Coach · ${form.name}`,
          abbreviation: (form.teamName || "COA").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "COA",
          city: "",
          country: "España",
          status: "activo",
          plan: form.planId,
          isSoloCoach: true,
          createdAt: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
          teams: [{
            id: teamId,
            name: form.teamName || "Mi equipo",
            category: form.category,
            season: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
            trainingDays: ["Lunes", "Miércoles", "Viernes"],
            coach: { name: form.name, email: form.email },
            squad: [],
          }],
          users: [],
          coordinator: null,
        };

        await saveClub(club);

        const res = await createClubUser({
          email: form.email,
          password: form.password,
          name: form.name,
          role: "club",
          clubId,
          teamId,
          teamRole: "entrenador",
          plan: form.planId,
          subscriptionStatus: form.subscriptionStatus,
          billingSource: "manual",
        });

        setCreds({
          ok: res.ok,
          email: form.email,
          password: form.password,
          name: form.name,
          error: res.error,
          label: "DEPRO Coach",
          updated: !!res.updated,
          status: form.subscriptionStatus,
          nextPath: "/admin/club-auto",
        });
        if (res.ok) onCreated?.();
      } else {
        const res = await createClubUser({
          email: form.email,
          password: form.password,
          name: form.name,
          role: "player",
          plan: form.planId,
          subscriptionStatus: form.subscriptionStatus,
          billingSource: "manual",
          posicion: form.posicion,
          deporte: "Fútbol",
        });

        if (res.ok) mirrorPlayerLocal(res.userId);

        setCreds({
          ok: res.ok,
          email: form.email,
          password: form.password,
          name: form.name,
          error: res.error,
          label: "Jugador",
          updated: !!res.updated,
          status: form.subscriptionStatus,
          userId: res.userId,
          nextPath: res.userId ? `/admin/plan-builder?clientId=${encodeURIComponent(res.userId)}` : null,
        });
        if (res.ok) onCreated?.();
      }
    } finally {
      setLoading(false);
    }
  };

  if (creds) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-depro w-full max-w-md p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${creds.ok ? "bg-green-50" : "bg-yellow-50"}`}>
            {creds.ok ? <CheckCircle size={28} className="text-green-500" /> : <ClockIcon />}
          </div>
          <h2 className="font-bold text-depro-dark text-lg mb-1">
            {creds.ok ? `${creds.label} ${creds.updated ? "actualizado" : "creado"}` : "No se pudo guardar el perfil"}
          </h2>
          {creds.ok ? (
            <p className="text-sm text-depro-gray mb-4">
              Perfil guardado en estado <strong>{creds.status || "active"}</strong>.
              A continuación puedes asignar rutina/planificación de inmediato.
            </p>
          ) : (
            <p className="text-sm text-red-600 mb-4">{creds.error || "No se pudo crear la cuenta"}</p>
          )}
          <div className="bg-depro-gray-light rounded-xl p-4 text-left space-y-2 mb-4 text-sm">
            <div><span className="text-depro-gray">Email</span><p className="font-mono font-bold">{creds.email}</p></div>
            {creds.ok && (
              <div><span className="text-depro-gray">Contraseña (opcional, para acceso posterior)</span><p className="font-mono font-bold">{creds.password}</p></div>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(`${creds.email}\n${creds.password}`)}
            className="text-xs font-bold text-depro-blue mb-4 inline-flex items-center gap-1"
          >
            <Copy size={12} /> Copiar credenciales
          </button>
          {creds.ok && creds.nextPath ? (
            <button
              type="button"
              onClick={() => goNext(creds.userId)}
              className="w-full py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm mb-2"
            >
              {audience === "player" ? "Asignar plan ahora" : "Abrir motor club auto"}
            </button>
          ) : null}
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-depro-border text-depro-dark font-semibold text-sm">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg my-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">
            Crear {audience === "coach" ? "DEPRO Coach" : "jugador"}
          </h2>
          <button type="button" onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <input
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
            placeholder="Nombre completo *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            type="email"
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
            placeholder="Email de acceso *"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <div className="flex gap-2">
            <input
              className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-mono"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}
              className="px-3 py-2 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <PlanSelectField audience={audience} value={form.planId} onChange={(v) => setForm((f) => ({ ...f, planId: v }))} />
          <SubscriptionStatusSelect
            value={form.subscriptionStatus}
            onChange={(v) => setForm((f) => ({ ...f, subscriptionStatus: v }))}
          />
          {audience === "coach" && (
            <>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
                placeholder="Nombre del equipo"
                value={form.teamName}
                onChange={(e) => setForm((f) => ({ ...f, teamName: e.target.value }))}
              />
              <select
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {COACH_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}
          {audience === "player" && (
            <select
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
              value={form.posicion}
              onChange={(e) => setForm((f) => ({ ...f, posicion: e.target.value }))}
            >
              {PLAYER_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray text-sm font-medium">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.email || form.password.length < 6 || loading}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm disabled:opacity-40"
          >
            {loading ? "Creando…" : "Crear perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}
