import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Copy, RefreshCw, X, Brain } from "lucide-react";
import { createClubUser, saveClub } from "../../lib/adminStorage";
import PlanSelectField, { SubscriptionStatusSelect } from "./PlanSelectField";
import { PLAYER_ADDONS } from "../../lib/playerAddons";
import { adminStatusLabel, normalizeAdminStatus } from "../../lib/adminAccountStatus";

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const COACH_CATEGORIES = ["Sub-12", "Sub-14", "Sub-16", "Juvenil", "Amateur"];

function isPremiumPlan(planId) {
  const p = String(planId || "").toLowerCase();
  return p === "player-pro" || p === "premium" || p === "pro";
}

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
    planId: audience === "coach" ? "coach-starter" : "player-essential",
    subscriptionStatus: "activo",
    teamName: "Mi equipo",
    category: "Sub-16",
    selectedAddons: [],
  });
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState(null);

  const premiumPlayer = audience === "player" && isPremiumPlan(form.planId);

  const effectiveAddons = useMemo(() => {
    if (audience !== "player") return [];
    if (premiumPlayer) return PLAYER_ADDONS.map((a) => a.id);
    return form.selectedAddons;
  }, [audience, premiumPlayer, form.selectedAddons]);

  const coachMotorPath = (userId, clubId, teamId) => {
    const params = new URLSearchParams();
    if (clubId) params.set("clubId", clubId);
    if (teamId) params.set("teamId", teamId);
    if (userId) params.set("userId", userId);
    if (form.name) params.set("name", form.name);
    params.set("assign", "1");
    return `/admin/club-auto?${params.toString()}`;
  };

  const goToPlanMotor = ({ userId, clubId, teamId } = {}) => {
    onCreated?.();
    onClose?.();
    if (audience === "player" && userId) {
      navigate(
        `/admin/plan-builder?clientId=${encodeURIComponent(userId)}&name=${encodeURIComponent(form.name || "")}`,
      );
    } else if (audience === "coach") {
      navigate(coachMotorPath(userId, clubId, teamId));
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
        subscriptionStatus: normalizeAdminStatus(form.subscriptionStatus),
        billingSource: "manual",
        purchasedAddons: effectiveAddons,
      };
      const next = [entry, ...(list || []).filter((c) => c.id !== userId && c.email !== form.email)];
      localStorage.setItem("depro_admin_clients", JSON.stringify(next.slice(0, 500)));
    } catch { /* ignore */ }
  };

  const mirrorCoachLocal = (userId, clubId, teamId) => {
    if (!userId || audience !== "coach") return;
    try {
      const raw = localStorage.getItem("depro_admin_clients");
      const list = raw ? JSON.parse(raw) : [];
      const entry = {
        id: userId,
        name: form.name,
        email: form.email,
        role: "club",
        type: "coach",
        teamRole: "entrenador",
        isSoloCoach: true,
        clubId,
        teamId,
        plan: form.planId,
        subscriptionStatus: normalizeAdminStatus(form.subscriptionStatus),
        billingSource: "manual",
      };
      const next = [entry, ...(list || []).filter((c) => c.id !== userId && c.email !== form.email)];
      localStorage.setItem("depro_admin_clients", JSON.stringify(next.slice(0, 500)));
    } catch { /* ignore */ }
  };

  const toggleAddon = (id) => {
    if (premiumPlayer) return;
    setForm((f) => ({
      ...f,
      selectedAddons: f.selectedAddons.includes(id)
        ? f.selectedAddons.filter((x) => x !== id)
        : [...f.selectedAddons, id],
    }));
  };

  /**
   * @param {{ goAssign?: boolean }} opts
   */
  const handleSubmit = async ({ goAssign = false } = {}) => {
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
          status: normalizeAdminStatus(form.subscriptionStatus),
          plan: form.planId,
          subscriptionStatus: normalizeAdminStatus(form.subscriptionStatus),
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
          subscriptionStatus: normalizeAdminStatus(form.subscriptionStatus),
          billingSource: "manual",
          isSoloCoach: true,
        });

        if (res.ok && res.userId) mirrorCoachLocal(res.userId, clubId, teamId);

        if (res.ok && goAssign) {
          goToPlanMotor({ userId: res.userId, clubId, teamId });
          return;
        }

        setCreds({
          ok: res.ok,
          email: form.email,
          password: form.password,
          name: form.name,
          error: res.error,
          label: "DEPRO Coach",
          updated: !!res.updated,
          status: normalizeAdminStatus(form.subscriptionStatus),
          userId: res.userId,
          clubId,
          teamId,
          nextPath: coachMotorPath(res.userId, clubId, teamId),
        });
        if (res.ok) onCreated?.();
      } else {
        const res = await createClubUser({
          email: form.email,
          password: form.password,
          name: form.name,
          role: "player",
          plan: form.planId,
          subscriptionStatus: normalizeAdminStatus(form.subscriptionStatus),
          billingSource: "manual",
          deporte: "Fútbol",
          purchasedAddons: effectiveAddons,
        });

        if (res.ok) mirrorPlayerLocal(res.userId);

        if (res.ok && goAssign && res.userId) {
          goToPlanMotor({ userId: res.userId });
          return;
        }

        setCreds({
          ok: res.ok,
          email: form.email,
          password: form.password,
          name: form.name,
          error: res.error,
          label: "Jugador",
          updated: !!res.updated,
          status: normalizeAdminStatus(form.subscriptionStatus),
          userId: res.userId,
          addons: effectiveAddons,
          nextPath: res.userId
            ? `/admin/plan-builder?clientId=${encodeURIComponent(res.userId)}&name=${encodeURIComponent(form.name || "")}`
            : null,
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
              Perfil guardado en estado <strong>{adminStatusLabel(creds.status)}</strong>.
              {(audience === "player" || audience === "coach") && (
                <> Puedes asignar el plan en el motor (opcional).</>
              )}
            </p>
          ) : (
            <p className="text-sm text-red-600 mb-4">{creds.error || "No se pudo crear la cuenta"}</p>
          )}
          <div className="bg-depro-gray-light rounded-xl p-4 text-left space-y-2 mb-4 text-sm">
            <div><span className="text-depro-gray">Email</span><p className="font-mono font-bold">{creds.email}</p></div>
            {creds.ok && (
              <div><span className="text-depro-gray">Contraseña (opcional, para acceso posterior)</span><p className="font-mono font-bold">{creds.password}</p></div>
            )}
            {creds.ok && audience === "player" && Array.isArray(creds.addons) && creds.addons.length > 0 && (
              <div>
                <span className="text-depro-gray">Extras</span>
                <p className="font-semibold text-depro-dark">
                  {creds.addons.map((id) => PLAYER_ADDONS.find((a) => a.id === id)?.name || id).join(" · ")}
                </p>
              </div>
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
              onClick={() => goToPlanMotor({
                userId: creds.userId,
                clubId: creds.clubId,
                teamId: creds.teamId,
              })}
              className="w-full py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm mb-2 inline-flex items-center justify-center gap-2"
            >
              <Brain size={16} />
              {audience === "player" ? "Asignar plan en el motor" : "Asignar plan en el motor club auto"}
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
          <PlanSelectField
            audience={audience}
            value={form.planId}
            onChange={(v) => setForm((f) => ({
              ...f,
              planId: v,
              selectedAddons: isPremiumPlan(v) ? [] : f.selectedAddons,
            }))}
          />
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
            <div className="rounded-xl border border-depro-border p-4 space-y-3">
              <div>
                <p className="text-sm font-bold text-depro-dark">Extras / servicios</p>
                <p className="text-xs text-depro-gray mt-0.5">
                  {premiumPlayer
                    ? "Premium incluye PDF, tests y mis cargas."
                    : "Opcional en Standard. Márcalos para activarlos en la cuenta."}
                </p>
              </div>
              <div className="space-y-2">
                {PLAYER_ADDONS.map((addon) => {
                  const checked = premiumPlayer || form.selectedAddons.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                        checked ? "border-depro-blue bg-depro-blue/[0.04]" : "border-depro-border hover:border-depro-blue/40"
                      } ${premiumPlayer ? "opacity-80 cursor-default" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        disabled={premiumPlayer}
                        onChange={() => toggleAddon(addon.id)}
                      />
                      <span className="min-w-0">
                        <span className="font-semibold text-depro-dark block">{addon.name}</span>
                        <span className="text-xs text-depro-gray">{addon.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-depro-border">
          <button type="button" onClick={onClose} className="sm:flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray text-sm font-medium">
            Cancelar
          </button>
          {(audience === "player" || audience === "coach") && (
            <button
              type="button"
              onClick={() => handleSubmit({ goAssign: true })}
              disabled={!form.email || form.password.length < 6 || loading}
              className="sm:flex-1 py-2.5 rounded-xl border-2 border-depro-blue text-depro-blue font-semibold text-sm disabled:opacity-40 inline-flex items-center justify-center gap-2"
              title={audience === "coach"
                ? "Crea el perfil y abre el motor club auto con este entrenador preseleccionado"
                : "Crea el perfil y abre el motor de planes con este jugador preseleccionado"}
            >
              <Brain size={15} />
              {loading ? "Creando…" : "Asignar plan"}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit({ goAssign: false })}
            disabled={!form.email || form.password.length < 6 || loading}
            className="sm:flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm disabled:opacity-40"
          >
            {loading ? "Creando…" : "Crear perfil"}
          </button>
        </div>
        {(audience === "player" || audience === "coach") && (
          <p className="px-6 pb-4 text-[11px] text-depro-gray -mt-2">
            <strong>Asignar plan</strong> es opcional: crea el {audience === "coach" ? "entrenador" : "jugador"} y abre el motor para completar el cuestionario, generar la rutina y asignársela.
          </p>
        )}
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
