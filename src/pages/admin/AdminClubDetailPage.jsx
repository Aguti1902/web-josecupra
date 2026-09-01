import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  Shield,
  Plus,
  Trash2,
  Edit3,
  Pencil,
  Copy,
  CheckCircle,
  X,
  Crown,
  UserCheck,
  Dumbbell,
  Mail,
  Phone,
  Calendar,
  Lock,
  RefreshCw,
  Video,
  FileText,
  ChevronRight,
  ClipboardList,
  Flame,
  Clock,
  Maximize2,
  Target,
  ChevronDown,
  ChevronUp,
  Save,
  Play,
  Palette,
  ImagePlus,
  MapPin,
  PlayCircle,
  BarChart2,
  BookOpen,
  Sparkles,
  Layers,
  Wallet,
} from "lucide-react";
import AdminClubCalentamientosPage from "./AdminClubCalentamientosPage";
import AdminClubTareasPage from "./AdminClubTareasPage";
import AdminClubPlantillasPage from "./AdminClubPlantillasPage";
import AdminClubAutoMotorPage from "./AdminClubAutoMotorPage";
import AdminClubExercisesPage from "./AdminClubExercisesPage";
import AdminTestsPage from "./AdminTestsPage";
import { loadClubs, saveClub, saveClubDetail, loadClubDetail, createClubUser, updateUserByEmail } from "../../lib/adminStorage";
import PlanSelectField, { SubscriptionStatusSelect, ManualPriceField } from "../../components/admin/PlanSelectField";
import ClubEconomyFields from "../../components/admin/ClubEconomyFields";
import AdminClubCommissionPanel from "../../components/admin/AdminClubCommissionPanel";
import { PLANS as CHECKOUT_PLANS } from "../../lib/checkoutPlans";
import {
  ADMIN_STATUS_STYLES,
  adminStatusLabel,
  normalizeAdminStatus,
  parseManualPrice,
  canUserLogin,
  formatManualPrice,
} from "../../lib/adminAccountStatus";
import {
  clubDiscountCode,
  clubCommissionPct,
  withSyncedDiscountCode,
} from "../../lib/clubEconomy";
import { isWideClubRole } from "../../lib/clubRoles";
import { isManualPlanningClub } from "../../lib/clubAuto/clubAutoCoachBridge";
import { normalizeBlock, adminDefaultBlocks, adminSessionBlocks, flattenBlocksToExercises, ADMIN_BLOCK_TYPES } from "../../lib/sessionBlocks";
import BlockExerciseEditor from "../../components/admin/BlockExerciseEditor";
import CoachAutoQuestionnaire, {
  questionnaireToCoachConfig,
} from "../../components/shared/CoachAutoQuestionnaire";
import {
  coachConfigToQuestionnaire,
  categoryForNivel,
} from "../../lib/clubAuto/clubAutoCoachBridge";
import { clearCoachGeneratedPlans } from "../../lib/coachSessionsStorage";


const Youtube = PlayCircle;

const ROLES = [
  { id: "administrador", label: "Administrador", icon: Wallet, color: "text-amber-700 bg-amber-50" },
  { id: "coordinador", label: "Coordinador", icon: Crown, color: "text-depro-blue bg-depro-blue/10" },
  { id: "entrenador", label: "Entrenador", icon: UserCheck, color: "text-green-600 bg-green-50" },
  { id: "ayudante", label: "Ayudante técnico", icon: Dumbbell, color: "text-orange-500 bg-orange-50" },
  { id: "jugador", label: "Jugador", icon: Users, color: "text-depro-gray bg-depro-gray-light" },
];
const AGE_BLOCKS = [
  { id: "Bloque 1", label: "Bloque 1 · Fútbol Base",      ages: ["Sub-9","Sub-10","Sub-11","Sub-12"], color: "#3B82F6" },
  { id: "Bloque 2", label: "Bloque 2 · Fútbol Formativo", ages: ["Sub-13","Sub-14","Sub-15"],          color: "#8B5CF6" },
  { id: "Bloque 3", label: "Bloque 3 · Fútbol Juvenil",   ages: ["Sub-16","Juvenil"],                  color: "#EF4444" },
];
const CATEGORIES = AGE_BLOCKS.flatMap((b) => b.ages);

/** Devuelve el id de bloque ("Bloque 1" / "Bloque 2" / "Bloque 3") para una categoría */
function getAgeBlock(category) {
  const found = AGE_BLOCKS.find((b) => b.ages.includes(category));
  return found ? found.id : null;
}

function RoleBadge({ role }) {
  const found = ROLES.find((r) => r.id === role);
  if (!found) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{role}</span>;
  const { label, icon: Icon, color } = found;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

/** Cuestionario corto del motor club auto (§4) en ficha admin. */
function AdminClubAutoQuestionnaireEditor({ club, onSave }) {
  const [autoQ, setAutoQ] = useState(() => coachConfigToQuestionnaire(club?.coachConfig || {}));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setAutoQ(coachConfigToQuestionnaire(club?.coachConfig || {}));
  }, [club?.id, club?.coachConfig]);

  const handleSave = async () => {
    const packed = questionnaireToCoachConfig(autoQ);
    if (!packed.ok) {
      setMsg(packed.errors.join(" "));
      return;
    }
    setSaving(true);
    setMsg("");
    const teams = Array.isArray(club.teams)
      ? club.teams.map((t, i) => (
        i === 0
          ? {
              ...t,
              trainingDays: packed.config.dias_exactos_entrenamiento,
              category: categoryForNivel(packed.config.nivel),
            }
          : t
      ))
      : club.teams;
    await onSave({
      ...club,
      planningMode: "auto",
      mode: "depro",
      coachConfig: { ...(club.coachConfig || {}), ...packed.config },
      teams,
    });
    setSaving(false);
    setMsg("Cuestionario guardado. Microciclos regenerados.");
  };

  return (
    <div className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-depro-dark">Cuestionario motor automático</p>
        <p className="text-[11px] text-depro-gray">Nivel, días, partido y gimnasio (punto 4 del documento).</p>
      </div>
      <CoachAutoQuestionnaire value={autoQ} onChange={setAutoQ} />
      {msg && <p className="text-xs text-depro-blue font-medium">{msg}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-blue text-white text-xs font-bold disabled:opacity-50"
      >
        <Save size={12} /> {saving ? "Guardando…" : "Guardar cuestionario"}
      </button>
    </div>
  );
}

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

function NewTeamModal({ onClose, onCreate, clubId, clubPlan, clubStatus }) {
  const [form, setForm] = useState({
    name: "", category: "Sub-16", season: "2025/26",
    coachName: "", coachEmail: "", coachPassword: generatePassword(),
    trainingDays: [],
  });
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null); // credenciales creadas para mostrar al admin

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      trainingDays: f.trainingDays.includes(day)
        ? f.trainingDays.filter((d) => d !== day)
        : [...f.trainingDays, day],
    }));
  };

  const handleCreate = async () => {
    if (!form.name) return;
    if (![2, 3, 4].includes(form.trainingDays.length)) {
      alert("Selecciona exactamente 2, 3 o 4 días de entrenamiento.");
      return;
    }
    setLoading(true);

    const teamId = `t${Date.now()}`;

    // Crear usuario en Supabase Auth si se proporcionó email
    let userCreated = false;
    let userError = null;
    if (form.coachEmail && form.coachPassword) {
      const result = await createClubUser({
        email: form.coachEmail,
        password: form.coachPassword,
        name: form.coachName,
        role: "club",
        clubId,
        teamId,
        teamRole: "entrenador",
        plan: clubPlan,
        subscriptionStatus: normalizeAdminStatus(clubStatus || "activo"),
        billingSource: "manual",
      });
      userCreated = !!(result.ok || result.alreadyExists);
      userError = userCreated ? null : result.error;
    }

    onCreate({
      id: teamId,
      name: form.name,
      category: form.category,
      season: form.season,
      players: 0,
      trainingDays: form.trainingDays,
      coach: form.coachName ? {
        name: form.coachName,
        email: form.coachEmail,
        password: form.coachPassword,
        role: "entrenador",
        userCreated,
      } : null,
      assistantCoach: null,
    });

    if (form.coachEmail) {
      setCreatedUser({ name: form.coachName, email: form.coachEmail, password: form.coachPassword, userCreated, userError });
    } else {
      onClose();
    }
    setLoading(false);
  };

  // Pantalla de confirmación con credenciales
  if (createdUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-depro w-full max-w-md">
          <div className="p-6 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${createdUser.userCreated ? "bg-green-50" : "bg-yellow-50"}`}>
              {createdUser.userCreated
                ? <CheckCircle size={28} className="text-green-500" />
                : <Clock size={28} className="text-yellow-500" />
              }
            </div>
            <h2 className="font-bold text-depro-dark text-lg mb-1">
              {createdUser.userCreated ? "Equipo y usuario creados" : "Equipo creado"}
            </h2>
            {createdUser.userCreated ? (
              <p className="text-sm text-depro-gray mb-5">
                Guarda estas credenciales y compártelas con el entrenador. No podrás volver a ver la contraseña.
              </p>
            ) : (
              <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                <p className="text-sm font-semibold text-yellow-700 mb-1">⚠️ El acceso no se pudo crear automáticamente</p>
                <p className="text-xs text-yellow-600">
                  Crea el usuario manualmente en Supabase → Authentication → Add user con estos datos:
                </p>
              </div>
            )}
            <div className="bg-depro-gray-light rounded-xl p-4 text-left space-y-3 mb-5">
              {createdUser.name && (
                <div>
                  <p className="text-xs text-depro-gray mb-0.5">Nombre</p>
                  <p className="font-semibold text-depro-dark">{createdUser.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-depro-gray mb-0.5">Email (usuario)</p>
                <p className="font-semibold text-depro-dark font-mono">{createdUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-depro-gray mb-0.5">Contraseña</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-depro-dark font-mono text-lg tracking-wider">{createdUser.password}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${createdUser.email}\n${createdUser.password}`)}
                    className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors"
                    title="Copiar email y contraseña"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors"
            >
              Entendido, cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-md my-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Añadir equipo</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Nombre del equipo *</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Ej. Sub-16 A"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Categoría</label>
              <select
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {AGE_BLOCKS.map((b) => (
                  <optgroup key={b.label} label={b.label}>
                    {b.ages.map((a) => <option key={a}>{a}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Temporada</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.season}
                onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
              />
            </div>
          </div>

          {/* Días de entrenamiento */}
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Días de entrenamiento</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold border transition-colors ${
                    form.trainingDays.includes(day)
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue"
                  }`}
                >
                  {DAY_SHORT[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Entrenador */}
          <div className="pt-2 border-t border-depro-border">
            <p className="text-sm font-medium text-depro-dark mb-1">Entrenador principal</p>
            <p className="text-xs text-depro-gray mb-3">Se creará su cuenta de acceso automáticamente.</p>
            <div className="space-y-3">
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Nombre del entrenador"
                value={form.coachName}
                onChange={(e) => setForm((f) => ({ ...f, coachName: e.target.value }))}
              />
              <input
                type="email"
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Email de acceso"
                value={form.coachEmail}
                onChange={(e) => setForm((f) => ({ ...f, coachEmail: e.target.value }))}
              />
              <div>
                <label className="block text-xs text-depro-gray mb-1">Contraseña de acceso</label>
                <div className="flex gap-2">
                  <input
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                      form.coachPassword.length > 0 && form.coachPassword.length < 6
                        ? "border-red-400 focus:ring-red-300"
                        : "border-depro-border focus:ring-depro-blue/30"
                    }`}
                    value={form.coachPassword}
                    onChange={(e) => setForm((f) => ({ ...f, coachPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, coachPassword: generatePassword() }))}
                    className="px-3 py-2 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
                    title="Generar nueva contraseña"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                {form.coachPassword.length > 0 && form.coachPassword.length < 6 && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Mínimo 6 caracteres</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!form.name || (form.coachEmail && form.coachPassword.length < 6) || loading}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando…</> : "Crear equipo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTeamModal({ team, onClose, onSave, clubId }) {
  const [form, setForm] = useState({
    name: team.name,
    category: team.category,
    season: team.season || "2025/26",
    trainingDays: [...(team.trainingDays || [])],
    coachName: team.coach?.name || "",
    coachEmail: team.coach?.email || "",
    coachPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      trainingDays: f.trainingDays.includes(day)
        ? f.trainingDays.filter((d) => d !== day)
        : [...f.trainingDays, day],
    }));
  };

  const validDays = [2, 3, 4].includes(form.trainingDays.length);

  const handleSave = async () => {
    if (!form.name || !validDays) return;
    setSaving(true);
    if (form.coachEmail && form.coachPassword.length >= 6) {
      await createClubUser({
        email: form.coachEmail,
        password: form.coachPassword,
        name: form.coachName || form.coachEmail,
        role: "club",
        clubId,
        teamId: team.id,
        teamRole: "entrenador",
      });
    }
    onSave({
      ...team,
      name: form.name,
      category: form.category,
      season: form.season,
      trainingDays: form.trainingDays,
      coach: form.coachEmail ? {
        ...team.coach,
        name: form.coachName,
        email: form.coachEmail,
        ...(form.coachPassword ? { password: form.coachPassword } : {}),
      } : team.coach,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Editar equipo</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase mb-1 block">Nombre</label>
            <input className="admin-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase mb-1 block">Categoría</label>
            <select className="admin-input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase mb-2 block">Días de entrenamiento (2, 3 o 4) *</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${form.trainingDays.includes(day) ? "bg-depro-blue text-white border-depro-blue" : "border-depro-border text-depro-gray"}`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            {!validDays && <p className="text-xs text-red-500 mt-1">Selecciona exactamente 2, 3 o 4 días.</p>}
          </div>
          {team.coach && (
            <div className="border-t border-depro-border pt-4 space-y-3">
              <p className="text-xs font-bold text-depro-gray uppercase">Entrenador</p>
              <input className="admin-input w-full" placeholder="Nombre" value={form.coachName} onChange={(e) => setForm({ ...form, coachName: e.target.value })} />
              <input className="admin-input w-full" placeholder="Email" value={form.coachEmail} onChange={(e) => setForm({ ...form, coachEmail: e.target.value })} />
              <input className="admin-input w-full" placeholder="Nueva contraseña (opcional)" type="password" value={form.coachPassword} onChange={(e) => setForm({ ...form, coachPassword: e.target.value })} />
            </div>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={!form.name || !validDays || saving}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold disabled:opacity-40">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewUserModal({ teams, clubId, clubPlan, clubStatus, onClose, onCreate, onAccessActivated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "entrenador",
    teamId: "",
    managedTeamIds: [],
    password: generatePassword(),
    subscriptionStatus: normalizeAdminStatus(clubStatus || "activo"),
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, email, password, error, formSnapshot }

  const selectedTeam = teams.find((t) => t.id === form.teamId) || null;

  const toggleManagedTeam = (teamId) => {
    setForm((f) => ({
      ...f,
      managedTeamIds: f.managedTeamIds.includes(teamId)
        ? f.managedTeamIds.filter((id) => id !== teamId)
        : [...f.managedTeamIds, teamId],
    }));
  };

  const buildUserPayload = () => ({
    id: `u${Date.now()}`,
    name: form.name || form.email,
    email: form.email,
    role: form.role,
    team: selectedTeam?.name || null,
    teamId: isWideClubRole(form.role) ? null : (form.teamId || null),
    managedTeamIds: isWideClubRole(form.role) ? form.managedTeamIds : [],
    active: true,
    lastLogin: "nunca",
    password: form.password,
    subscriptionStatus: normalizeAdminStatus(form.subscriptionStatus),
  });

  const activateAccess = async (snapshot = form) => {
    const res = await createClubUser({
      email: snapshot.email,
      password: snapshot.password,
      name: snapshot.name || snapshot.email,
      role: "club",
      clubId,
      teamId: isWideClubRole(snapshot.role) ? undefined : (snapshot.teamId || undefined),
      teamRole: snapshot.role,
      managedTeamIds: isWideClubRole(snapshot.role) ? snapshot.managedTeamIds : undefined,
      plan: clubPlan,
      subscriptionStatus: normalizeAdminStatus(snapshot.subscriptionStatus || clubStatus || "activo"),
      billingSource: "manual",
    });
    const active = !!(res.ok || res.alreadyExists);
    if (active) onAccessActivated?.(snapshot.email);
    return { ...res, active };
  };

  const handleCreate = async () => {
    if (!form.email) return;
    setLoading(true);

    const res = await activateAccess(form);

    onCreate({
      ...buildUserPayload(),
      userCreated: res.active,
    });

    setResult({
      ok: res.active,
      email: form.email,
      password: form.password,
      error: res.error,
      formSnapshot: { ...form },
      status: normalizeAdminStatus(form.subscriptionStatus),
    });
    setLoading(false);
  };

  const handleRetryActivation = async () => {
    if (!result?.formSnapshot) return;
    setLoading(true);
    const res = await activateAccess(result.formSnapshot);
    if (res.active) {
      setResult((r) => ({ ...r, ok: true, error: null }));
    } else {
      setResult((r) => ({ ...r, error: res.error || r.error }));
    }
    setLoading(false);
  };

  // Pantalla de resultado — credenciales, NO confirmación de email
  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-depro w-full max-w-md p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${result.ok ? "bg-green-50" : "bg-yellow-50"}`}>
            {result.ok
              ? <CheckCircle size={28} className="text-green-500" />
              : <Clock size={28} className="text-yellow-500" />
            }
          </div>
          <h2 className="font-bold text-depro-dark text-lg mb-1">
            {result.ok
              ? (result.status === "borrador"
                ? "Usuario en borrador — guarda las credenciales"
                : "Usuario creado — guarda las credenciales")
              : "Datos guardados, acceso no activado"}
          </h2>
          {result.ok ? (
            <>
              <p className="text-sm text-depro-gray mt-2 mb-4">
                {result.status === "borrador"
                  ? <>Estado <strong>borrador</strong>: el usuario no puede iniciar sesión hasta que lo pases a demo o activo.</>
                  : result.status === "demo"
                    ? <>Cuenta <strong>demo</strong> (colaboración). El usuario ya puede iniciar sesión.</>
                    : <>El usuario <strong>ya puede iniciar sesión</strong>. Comparte email y contraseña; no volverás a ver la contraseña aquí.</>}
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs text-depro-gray uppercase font-semibold tracking-wider">Credenciales</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-depro-gray">Email</span>
                  <span className="text-sm font-mono font-bold text-depro-dark">{result.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-depro-gray">Contraseña</span>
                  <span className="text-sm font-mono font-bold text-depro-dark">{result.password}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${result.email}\n${result.password}`)}
                className="mt-3 text-xs font-bold text-depro-blue hover:underline"
              >
                Copiar email y contraseña
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-depro-gray mt-2 mb-3">
                Los datos del usuario están en la lista, pero <strong>no se creó la cuenta en el servidor</strong>.
                No es un email de confirmación: hay que activar el acceso manualmente.
              </p>
              {result.error && (
                <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3 text-left">
                  {result.error}
                </p>
              )}
              <button
                type="button"
                onClick={handleRetryActivation}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-depro-blue text-depro-blue font-semibold text-sm hover:bg-depro-blue/5 transition-colors disabled:opacity-40"
              >
                {loading ? "Activando…" : "Reintentar activación"}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="mt-4 w-full py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-md max-h-[90vh] flex flex-col my-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border shrink-0">
          <h2 className="font-bold text-depro-dark text-lg">Añadir usuario</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto min-h-0 flex-1">
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Nombre completo</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Nombre y apellidos"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Email *</label>
            <input
              type="email"
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="usuario@club.es"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Rol</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => setForm((f) => ({ ...f, role: r.id }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      form.role === r.id
                        ? "bg-depro-blue border-depro-blue text-white"
                        : "border-depro-border text-depro-gray hover:border-depro-blue"
                    }`}
                  >
                    <Icon size={13} />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
          {form.role === "administrador" && (
            <p className="text-xs text-depro-gray -mt-2">
              Ve la cuota del club, el código de descuento y lo generado con las planificaciones individuales. Los equipos son opcionales.
            </p>
          )}
          {/* Equipo(s) asignado(s) */}
          {teams.length > 0 && form.role === "administrador" && (
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">
                Equipos <span className="text-depro-gray font-normal text-xs">(opcional)</span>
              </label>
              <p className="text-xs text-depro-gray mb-2">
                Asigna equipos si quieres. Si no marcas ninguno, el administrador no queda vinculado a un equipo concreto.
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto border border-depro-border rounded-lg p-2">
                {teams.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-depro-gray-light/50 cursor-pointer">
                    <input type="checkbox" className="accent-depro-blue"
                      checked={form.managedTeamIds.includes(t.id)}
                      onChange={() => toggleManagedTeam(t.id)} />
                    <span className="text-sm text-depro-dark">{t.name}</span>
                    <span className="text-xs text-depro-gray ml-auto">{t.category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {teams.length > 0 && form.role === "coordinador" && (
              <div>
                <label className="block text-sm font-medium text-depro-dark mb-1">
                  Equipos que coordina <span className="text-depro-gray font-normal text-xs">(opcional)</span>
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-depro-border rounded-lg p-2">
                  {teams.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-depro-gray-light/50 cursor-pointer">
                      <input type="checkbox" className="accent-depro-blue"
                        checked={form.managedTeamIds.includes(t.id)}
                        onChange={() => toggleManagedTeam(t.id)} />
                      <span className="text-sm text-depro-dark">{t.name}</span>
                      <span className="text-xs text-depro-gray ml-auto">{t.category}</span>
                    </label>
                  ))}
                </div>
                {form.managedTeamIds.length === 0 && (
                  <p className="text-xs text-depro-gray mt-1">Si no seleccionas ninguno, verá todos los equipos del club.</p>
                )}
              </div>
          )}
          {teams.length > 0 && !isWideClubRole(form.role) && (
              <div>
                <label className="block text-sm font-medium text-depro-dark mb-1">Equipo asignado <span className="text-depro-gray font-normal text-xs">(opcional)</span></label>
                <select
                  className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                  value={form.teamId}
                  onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}
                >
                  <option value="">— Sin equipo —</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
          )}
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1 flex items-center gap-1">
              <Lock size={12} />
              Contraseña temporal
            </label>
            <div className="flex gap-2">
              <input
                className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                  form.password.length > 0 && form.password.length < 6
                    ? "border-red-400 focus:ring-red-300"
                    : "border-depro-border focus:ring-depro-blue/30"
                }`}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
              <button
                onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}
                className="p-2 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors"
                title="Regenerar"
              >
                <RefreshCw size={15} />
              </button>
            </div>
            {form.password.length > 0 && form.password.length < 6
              ? <p className="text-xs text-red-500 mt-1 font-medium">Mínimo 6 caracteres</p>
              : <p className="text-xs text-depro-gray mt-1">El usuario deberá cambiarla en el primer acceso.</p>
            }
          </div>
          <SubscriptionStatusSelect
            value={form.subscriptionStatus}
            onChange={(v) => setForm((f) => ({ ...f, subscriptionStatus: v }))}
          />
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border shrink-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">Cancelar</button>
          <button
            onClick={handleCreate}
            disabled={!form.email || form.password.length < 6 || loading}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando...</> : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCoordinatorModal({ coordinator, onClose, onSave }) {
  const [form, setForm] = useState({
    name: coordinator?.name || "",
    email: coordinator?.email || "",
    phone: coordinator?.phone || "",
    password: coordinator?.password || "",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Editar coordinador</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <input className="admin-input w-full" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="admin-input w-full" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="admin-input w-full" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="admin-input w-full" type="password" placeholder="Nueva contraseña (opcional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.email} className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold disabled:opacity-40">Guardar</button>
        </div>
      </div>
    </div>
  );
}

function EditClubUserModal({ user, teams, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "entrenador",
    teamId: user?.teamId || "",
    managedTeamIds: user?.managedTeamIds || [],
    password: user?.password || "",
  });

  const toggleManagedTeam = (teamId) => {
    setForm((f) => ({
      ...f,
      managedTeamIds: f.managedTeamIds.includes(teamId)
        ? f.managedTeamIds.filter((id) => id !== teamId)
        : [...f.managedTeamIds, teamId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Editar usuario</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <input className="admin-input w-full" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="admin-input w-full" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className="admin-input w-full" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="administrador">Administrador (economía)</option>
            <option value="entrenador">Entrenador</option>
            <option value="coordinador">Coordinador</option>
            <option value="ayudante">Ayudante</option>
          </select>
          {isWideClubRole(form.role) ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-depro-gray uppercase">Equipos que gestiona</p>
              {teams.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.managedTeamIds.includes(t.id)} onChange={() => toggleManagedTeam(t.id)} />
                  {t.name}
                </label>
              ))}
            </div>
          ) : (
            <select className="admin-input w-full" value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>
              <option value="">— Sin equipo —</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
          <input className="admin-input w-full" type="password" placeholder="Nueva contraseña (opcional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm">Cancelar</button>
          <button
            onClick={() => onSave({
              ...user,
              ...form,
              teamId: isWideClubRole(form.role) ? null : form.teamId,
              managedTeamIds: isWideClubRole(form.role) ? form.managedTeamIds : [],
              team: isWideClubRole(form.role) ? null : (teams.find((t) => t.id === form.teamId)?.name || user.team),
            })}
            disabled={!form.email}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold disabled:opacity-40"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── New Microcycle Modal ────────────────────────────────────── */
const INTENSITIES = ["Baja", "Media-baja", "Media", "Media-alta", "Alta", "Máxima", "Complementaria-D"];
const SESSION_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function NewMicrocycleModal({ teams, onClose, onCreate, initialAgeBlock = "" }) {
  const [form, setForm] = useState({
    microcycle: "",
    label: "",
    ageBlock: initialAgeBlock,
    teamId: "",
    teamName: "",
    dateRange: "",
    objective: "",
    focus: "",
    status: "borrador",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Nuevo microciclo</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Código *</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="S.1, S.2…"
                value={form.microcycle}
                onChange={(e) => setForm((f) => ({ ...f, microcycle: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Estado</label>
              <select
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Nombre / descripción *</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Microciclo 1 · Bloque de adaptación"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </div>
          {/* Bloque de edad */}
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Bloque de edad</label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_BLOCKS.map((b, idx) => (
                <button key={idx} type="button"
                  onClick={() => setForm((f) => ({ ...f, ageBlock: b.label }))}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-colors text-left ${
                    form.ageBlock === b.label
                      ? "border-depro-blue bg-depro-blue text-white"
                      : "border-depro-border text-depro-dark hover:border-depro-blue/40"
                  }`}>
                  <div className="font-black text-[10px] uppercase tracking-wide mb-0.5">
                    Bloque {idx + 1}
                  </div>
                  <div className={form.ageBlock === b.label ? "text-white/80" : "text-depro-gray"} style={{ fontSize: "9px" }}>
                    {b.ages.join(" · ")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {teams.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Equipo específico <span className="text-depro-gray font-normal">(opcional)</span></label>
              <select
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.teamId}
                onChange={(e) => {
                  const t = teams.find((t) => t.id === e.target.value);
                  setForm((f) => ({ ...f, teamId: e.target.value, teamName: t?.name ?? "" }));
                }}
              >
                <option value="">— Todos los equipos del bloque —</option>
                {AGE_BLOCKS.map((b) => (
                  <optgroup key={b.label} label={b.label}>
                    {teams.filter((t) => b.ages.includes(t.category)).map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                    ))}
                  </optgroup>
                ))}
                {teams.filter((t) => !CATEGORIES.includes(t.category)).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Periodo</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="5 – 11 may 2025"
              value={form.dateRange}
              onChange={(e) => setForm((f) => ({ ...f, dateRange: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Foco del microciclo</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Posesión y presión, Transiciones…"
              value={form.focus}
              onChange={(e) => setForm((f) => ({ ...f, focus: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Objetivo general</label>
            <textarea
              rows={2}
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 resize-none"
              placeholder="Descripción del objetivo de este microciclo…"
              value={form.objective}
              onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (!form.microcycle || !form.label) return;
              onCreate({ ...form, id: `cp${Date.now()}`, sessions: [] });
              onClose();
            }}
            disabled={!form.microcycle || !form.label}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40"
          >
            Crear microciclo
          </button>
        </div>
      </div>
    </div>
  );
}

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/shorts\/))([^&?/\s]{11})/);
  return m ? m[1] : null;
}

/* ── Constantes del editor de sesiones ───────────────────── */
const SESSION_BLOCK_CONFIG = {
  calentamiento:  { label: "Calentamiento",    color: "#F59E0B", hasVideo: true },
  principal:      { label: "Bloque principal", color: "#3B82F6", hasVideo: false },
};
const SESSION_TYPE_OPTIONS = [
  { value: "Baja",       type: "A", label: "A · Extensiva",  color: "#3B82F6" },
  { value: "Media",      type: "A", label: "A · Extensiva",  color: "#3B82F6" },
  { value: "Media-alta", type: "B", label: "B · Intensiva",  color: "#F59E0B" },
  { value: "Alta",       type: "B", label: "B · Intensiva",  color: "#F59E0B" },
  { value: "Máxima",     type: "C", label: "C · Reactiva",   color: "#EF4444" },
];
const PHYSICAL_TEST_FIELDS = [
  { id: "resistencia", label: "Resistencia aeróbica", unit: "m / min" },
  { id: "sprint",      label: "Sprint 30m",           unit: "seg" },
  { id: "cod",         label: "Cambio de dirección",  unit: "seg" },
  { id: "cmj",         label: "Salto CMJ",            unit: "cm" },
];

/* ── Modal editor de sesión (diseño igual al entrenador) ─── */
function NewSessionModal({ onClose, onCreate }) {
  const [tab, setTab] = useState("resumen");
  const [form, setForm] = useState({
    title: "",
    duration: "75 min",
    intensity: "Media",
    objective: "",
    space: "",
    players: "",
    blocks: adminDefaultBlocks(),
    tests: PHYSICAL_TEST_FIELDS.map((t) => ({ ...t, description: "", reference: "" })),
    exercises: [],
  });

  const getBlock = (type) => normalizeBlock(form.blocks.find((b) => b.type === type) || { type, exercises: [] });
  const updateBlock = (type, changes) =>
    setForm((f) => ({
      ...f,
      blocks: f.blocks.map((b) => (b.type === type ? normalizeBlock({ ...b, ...changes, type }) : b)),
    }));

  const sessionTypeMeta = SESSION_TYPE_OPTIONS.find((o) => o.value === form.intensity) || SESSION_TYPE_OPTIONS[1];

  const TABS = [
    { id:"resumen",        label:"Resumen",          icon: BarChart2 },
    { id:"calentamiento",  label:"Calentamiento",    icon: Flame },
    { id:"principal",      label:"Principal",        icon: Dumbbell },
    { id:"tests",          label:"Tests",            icon: ClipboardList },
  ];

  const handleSave = () => {
    if (!form.title.trim()) return;
    const blocks = adminSessionBlocks(form.blocks).map((b) => normalizeBlock(b));
    const allExercises = flattenBlocksToExercises(blocks);
    onCreate({ ...form, id: `s${Date.now()}`, blocks, exercises: allExercises });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/50">
      <div className="relative bg-white w-full max-w-3xl mx-auto my-4 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-depro-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: sessionTypeMeta.color + "18" }}>
              <ClipboardList size={16} style={{ color: sessionTypeMeta.color }} />
            </div>
            <div>
              <div className="font-black text-depro-dark leading-none">
                {form.title || "Nueva sesión"}
              </div>
              <div className="text-[10px] text-depro-gray mt-0.5">
                <span className="font-bold" style={{ color: sessionTypeMeta.color }}>{sessionTypeMeta.label}</span>
                <span className="ml-2 opacity-60">· Día asignado automáticamente</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark p-1 rounded-lg hover:bg-depro-gray-light transition-colors"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-depro-border overflow-x-auto flex-shrink-0 bg-depro-gray-light/30">
          {TABS.map(({ id, label, icon: TIcon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-bold transition-colors border-b-2 ${
                tab === id ? "border-depro-blue text-depro-blue bg-white" : "border-transparent text-depro-gray hover:text-depro-dark"
              }`}>
              <TIcon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── RESUMEN ── */}
          {tab === "resumen" && (
            <div className="space-y-4">
              {/* Card tipo sesión visual */}
              <div className="rounded-2xl p-5 border flex items-center gap-4"
                style={{ background:`linear-gradient(135deg,${sessionTypeMeta.color}10 0%,white 80%)`, borderColor: sessionTypeMeta.color + "25" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                  style={{ backgroundColor: sessionTypeMeta.color + "18", borderColor: sessionTypeMeta.color + "30" }}>
                  <ClipboardList size={22} style={{ color: sessionTypeMeta.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray mb-0.5">Vista previa</div>
                  <div className="font-black text-depro-dark text-lg leading-none">{form.title || "Sin título"}</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: sessionTypeMeta.color }}>{sessionTypeMeta.label}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Título de la sesión *</label>
                <input
                  className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                  placeholder="Ej. Posesión · presión alta"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Duración</label>
                  <input
                    className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="75 min"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">
                    Intensidad <span className="font-semibold" style={{ color: sessionTypeMeta.color }}>({sessionTypeMeta.label})</span>
                  </label>
                  <select
                    className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    value={form.intensity}
                    onChange={(e) => setForm((f) => ({ ...f, intensity: e.target.value }))}
                  >
                    {INTENSITIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Espacio</label>
                  <input
                    className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Medio campo"
                    value={form.space}
                    onChange={(e) => setForm((f) => ({ ...f, space: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Objetivo de la sesión</label>
                <textarea rows={3}
                  className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 resize-none"
                  placeholder="Describe el objetivo principal de esta sesión…"
                  value={form.objective}
                  onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                />
              </div>

              {/* Resumen de bloques */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-depro-border">
                {form.blocks.map((b) => {
                  const cfg = SESSION_BLOCK_CONFIG[b.type] || { color: "#6B7280" };
                  return (
                    <button key={b.type} onClick={() => setTab(b.type)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-depro-border hover:border-current transition-colors text-left"
                      style={{ "--hover-color": cfg.color }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cfg.color + "15" }}>
                        <ClipboardList size={13} style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-depro-dark">{b.label}</div>
                        <div className="text-[10px] text-depro-gray">{b.exercises.length} ejercicios · {b.duration || "—"}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── BLOQUES DE EJERCICIOS ── */}
          {ADMIN_BLOCK_TYPES.map((blockType) => {
            if (tab !== blockType) return null;
            const block = getBlock(blockType);
            const cfg = SESSION_BLOCK_CONFIG[blockType];
            return (
              <div key={blockType} className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl border"
                  style={{ backgroundColor: cfg.color + "08", borderColor: cfg.color + "25" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0"
                    style={{ backgroundColor: cfg.color + "18", borderColor: cfg.color + "25" }}>
                    <ClipboardList size={18} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="font-black text-depro-dark">{cfg.label}</div>
                    <div className="text-xs text-depro-gray">Edita los ejercicios, vídeos y parámetros de este bloque</div>
                  </div>
                </div>
                <BlockExerciseEditor
                  key={blockType}
                  blockType={blockType}
                  block={block}
                  sessionFramework={sessionTypeMeta.type || "A"}
                  onUpdate={(changes) => updateBlock(blockType, changes)}
                />
              </div>
            );
          })}

          {/* ── TESTS ── */}
          {tab === "tests" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-depro-blue/20 bg-depro-blue-light/30">
                <div className="w-10 h-10 rounded-xl bg-depro-blue/10 flex items-center justify-center flex-shrink-0 border border-depro-blue/20">
                  <ClipboardList size={18} className="text-depro-blue" />
                </div>
                <div>
                  <div className="font-black text-depro-dark">Tests físicos</div>
                  <div className="text-xs text-depro-gray">Define los tests que el entrenador realizará a sus jugadores (3 veces por temporada)</div>
                </div>
              </div>
              <div className="space-y-3">
                {form.tests.map((test, i) => (
                  <div key={test.id} className="border border-depro-border rounded-xl p-4 space-y-3 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-lg bg-depro-blue/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-black text-depro-blue">{i+1}</span>
                      </div>
                      <span className="font-bold text-depro-dark text-sm">{test.label}</span>
                      <span className="text-xs text-depro-gray ml-auto">Unidad: {test.unit}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide block mb-1">Descripción / protocolo</label>
                        <textarea rows={2} className="w-full border border-depro-border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                          placeholder="Cómo se realiza este test…"
                          value={test.description}
                          onChange={(e) => setForm((f) => ({
                            ...f, tests: f.tests.map((t, ti) => ti === i ? { ...t, description: e.target.value } : t)
                          }))} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide block mb-1">Valores de referencia</label>
                        <textarea rows={2} className="w-full border border-depro-border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                          placeholder="Ej. Sub-12: ≥1200m es bueno…"
                          value={test.reference}
                          onChange={(e) => setForm((f) => ({
                            ...f, tests: f.tests.map((t, ti) => ti === i ? { ...t, reference: e.target.value } : t)
                          }))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-depro-border flex-shrink-0 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!form.title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            <Save size={14} /> Guardar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PlanificacionSection — 3 bloques de edad con auto-asignación
   ═══════════════════════════════════════════════════════════════ */
function PlanificacionSection({ plans, teams, onAddSession, onDeleteSession, onDeleteMicrocycle, onCreateMicrocycle }) {
  const [activeMcModal, setActiveMcModal] = useState(null); // bloque id para abrir modal
  const [expandedBloque, setExpandedBloque] = useState(null);

  return (
    <div className="space-y-5">
      {/* Cabecera con leyenda */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1">
          <h2 className="font-black text-depro-dark text-base">Planificación por bloques</h2>
          <p className="text-xs text-depro-gray mt-0.5">
            Crea un microciclo por bloque. Todos los equipos de ese bloque lo recibirán automáticamente.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle size={12} className="text-green-600" />
          <span className="text-xs font-bold text-green-700">Auto-asignación activa</span>
        </div>
      </div>

      {/* Grid de 3 bloques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {AGE_BLOCKS.map((bloque) => {
          const blockPlans = plans.filter((p) => p.ageBlock === bloque.id);
          const blockTeams = (teams || []).filter((t) => getAgeBlock(t.category) === bloque.id);
          const isExpanded = expandedBloque === bloque.id;

          return (
            <div key={bloque.id} className="rounded-2xl border overflow-hidden flex flex-col"
              style={{ borderColor: bloque.color + "30" }}>

              {/* Header del bloque */}
              <div className="px-4 py-4 flex items-start justify-between"
                style={{ background: `linear-gradient(135deg, ${bloque.color}10 0%, white 100%)` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: bloque.color + "18", border: `1.5px solid ${bloque.color}30` }}>
                      <Shield size={13} style={{ color: bloque.color }} />
                    </div>
                    <span className="font-black text-depro-dark text-sm">{bloque.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: bloque.color + "15", color: bloque.color }}>
                      {blockPlans.length} microciclo{blockPlans.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-[10px] text-depro-gray mt-1.5 font-medium">
                    {bloque.ages.join(" · ")}
                  </p>
                </div>
              </div>

              {/* Equipos auto-asignados */}
              <div className="px-4 py-3 border-t border-b" style={{ borderColor: bloque.color + "20", backgroundColor: bloque.color + "05" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Users size={11} style={{ color: bloque.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: bloque.color }}>
                    Equipos asignados · {blockTeams.length}
                  </span>
                </div>
                {blockTeams.length === 0 ? (
                  <p className="text-[10px] text-depro-gray italic">Sin equipos en este bloque todavía</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {blockTeams.map((t) => (
                      <span key={t.id} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-white"
                        style={{ borderColor: bloque.color + "30", color: bloque.color }}>
                        <CheckCircle size={8} />
                        {t.name} <span className="opacity-60">({t.category})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista de microciclos */}
              <div className="flex-1 p-3 space-y-2 bg-white min-h-[80px]">
                {blockPlans.length === 0 && (
                  <div className="py-6 text-center text-depro-gray">
                    <ClipboardList size={22} className="mx-auto mb-1.5 opacity-25" />
                    <p className="text-xs">Sin microciclos</p>
                    <p className="text-[10px] opacity-60 mt-0.5">Añade el primero para este bloque</p>
                  </div>
                )}
                {blockPlans.map((mc) => (
                  <MicrocycleCard
                    key={mc.id}
                    mc={mc}
                    teams={blockTeams}
                    onAddSession={onAddSession}
                    onDeleteSession={onDeleteSession}
                    onDelete={onDeleteMicrocycle}
                  />
                ))}
              </div>

              {/* Footer: añadir microciclo */}
              <div className="px-3 pb-3 bg-white">
                <button onClick={() => setActiveMcModal(bloque.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed text-xs font-bold transition-colors hover:bg-opacity-10"
                  style={{ borderColor: bloque.color + "40", color: bloque.color, backgroundColor: bloque.color + "05" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bloque.color + "12")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bloque.color + "05")}>
                  <Plus size={13} /> Añadir microciclo a {bloque.id}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de nuevo microciclo (con bloque pre-seleccionado) */}
      {activeMcModal && (
        <NewMicrocycleModal
          teams={teams || []}
          initialAgeBlock={activeMcModal}
          onClose={() => setActiveMcModal(null)}
          onCreate={(mc) => { onCreateMicrocycle(mc); setActiveMcModal(null); }}
        />
      )}
    </div>
  );
}

function MicrocycleCard({ mc, teams, onAddSession, onDeleteSession, onDelete }) {
  const [expanded, setExpanded] = useState(mc.sessions.length > 0);
  const [showNewSession, setShowNewSession] = useState(false);

  const statusStyle = {
    activo: "bg-green-50 text-green-700 border-green-200",
    borrador: "bg-yellow-50 text-yellow-700 border-yellow-200",
    completado: "bg-gray-100 text-gray-500 border-gray-200",
  }[mc.status] ?? "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <div className="bg-white border border-depro-border rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold text-depro-blue bg-depro-blue/10 px-2 py-0.5 rounded">
                {mc.microcycle}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyle}`}>
                {mc.status}
              </span>
              {mc.teamName && (
                <span className="text-xs text-depro-gray flex items-center gap-1">
                  <Shield size={10} />
                  {mc.teamName}
                </span>
              )}
              {mc.dateRange && (
                <span className="text-xs text-depro-gray flex items-center gap-1">
                  <Calendar size={10} />
                  {mc.dateRange}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-depro-dark">{mc.label}</h3>
            {mc.focus && (
              <p className="text-xs text-depro-gray mt-0.5 flex items-center gap-1">
                <Target size={10} />
                Foco: {mc.focus}
              </p>
            )}
            {mc.objective && (
              <p className="text-xs text-depro-gray/80 mt-1 leading-relaxed">{mc.objective}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowNewSession(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-depro-blue/30 text-depro-blue text-xs font-medium hover:bg-depro-blue/5 transition-colors"
            >
              <Plus size={12} /> Sesión
            </button>
            <button
              onClick={() => onDelete(mc.id)}
              className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-red hover:text-depro-red transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 flex items-center gap-1 text-xs text-depro-blue font-medium hover:underline"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {mc.sessions.length} sesión{mc.sessions.length !== 1 ? "es" : ""}
          {!expanded && mc.sessions.length > 0 ? " · Ver detalles" : ""}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-depro-border divide-y divide-depro-border">
          {mc.sessions.length === 0 ? (
            <div className="px-5 py-6 text-center text-depro-gray text-sm">
              Sin sesiones todavía. Pulsa "+ Sesión" para añadir.
            </div>
          ) : (
            mc.sessions.map((session) => {
              const videoExercises = (session.exercises || []).filter((ex) => getYouTubeId(ex.videoUrl));
              return (
                <div key={session.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-depro-dark">{session.day}</span>
                        <span className="text-xs text-depro-gray flex items-center gap-0.5">
                          <Clock size={10} />{session.duration}
                        </span>
                        <span className="text-xs text-depro-gray flex items-center gap-0.5">
                          <Flame size={10} />{session.intensity}
                        </span>
                        {session.space && (
                          <span className="text-xs text-depro-gray flex items-center gap-0.5">
                            <Maximize2 size={10} />{session.space}
                          </span>
                        )}
                        {session.players && (
                          <span className="text-xs text-depro-gray flex items-center gap-0.5">
                            <Users size={10} />{session.players} jug.
                          </span>
                        )}
                        {videoExercises.length > 0 && (
                          <span className="text-xs text-red-500 flex items-center gap-0.5 font-medium">
                            <Youtube size={10} />{videoExercises.length} vídeo{videoExercises.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-depro-dark text-sm">{session.title}</p>
                      {session.objective && (
                        <p className="text-xs text-depro-gray mt-0.5">{session.objective}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        {(session.exercises || []).slice(0, 3).map((ex, i) => {
                          const ytId = getYouTubeId(ex.videoUrl);
                          return (
                            <div key={i} className="text-xs text-depro-gray flex items-center gap-2">
                              {ytId ? (
                                <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt="" className="w-8 h-6 rounded object-cover shrink-0" />
                              ) : (
                                <span className="w-1 h-1 rounded-full bg-depro-blue/60 shrink-0" />
                              )}
                              <span className="font-medium text-depro-dark/80">{ex.name}</span>
                              <span className="text-depro-gray/70 ml-auto">
                                {ex.sets}×{ex.reps} · {ex.rest}
                              </span>
                            </div>
                          );
                        })}
                        {(session.exercises || []).length > 3 && (
                          <p className="text-xs text-depro-gray/60 pl-3">
                            +{session.exercises.length - 3} más…
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteSession(mc.id, session.id)}
                      className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-red hover:text-depro-red transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showNewSession && (
        <NewSessionModal
          onClose={() => setShowNewSession(false)}
          onCreate={(session) => onAddSession(mc.id, session)}
        />
      )}
    </div>
  );
}

/* ── Identidad Tab ───────────────────────────────────────────── */
const PRESET_COLORS = [
  "#1E3A8A","#2563EB","#0EA5E9","#0891B2","#059669","#16A34A",
  "#CA8A04","#D97706","#DC2626","#BE185D","#7C3AED","#374151",
  "#111827","#FFFFFF","#F9FAFB","#E5E7EB",
];

function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-depro-dark mb-2">{label}</label>
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl border-2 border-depro-border shadow-sm shrink-0"
          style={{ backgroundColor: value || "#CCCCCC" }}
        />
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-depro-border cursor-pointer"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            title={c}
            className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${
              value === c ? "border-depro-dark scale-110" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

// Comprime imagen a un ancho máximo dado
function compressImage(file, maxWidth = 1400, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function IdentidadTab({ club, onSave, readOnly = false }) {
  const [logo, setLogo]             = useState(club.logo || null);
  const [banner, setBanner]         = useState(club.banner || null);
  const [primaryColor, setPrimary]  = useState(club.primaryColor || "#1E3A8A");
  const [secondaryColor, setSecond] = useState(club.secondaryColor || "#FFFFFF");
  const [slogan, setSlogan]         = useState(club.slogan || "");
  const [name, setName]             = useState(club.name || "");
  const [city, setCity]             = useState(club.city || "");
  const [country, setCountry]       = useState(club.country || "");
  const [saved, setSaved]           = useState(false);   // "idle" | "saving" | "ok" | "warn"
  const [syncWarn, setSyncWarn]     = useState(null);    // mensaje de aviso si Supabase falla
  const logoRef   = useRef();
  const bannerRef = useRef();

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file, 400, 0.85);
    setLogo(compressed);
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file, 1400, 0.75);
    setBanner(compressed);
  };

  // Calcula texto contrastante para la vista previa
  const previewText = (() => {
    try {
      const h = primaryColor.replace("#", "");
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#111827" : "#fff";
    } catch { return "#fff"; }
  })();

  const handleSave = async () => {
    setSaved("saving");
    setSyncWarn(null);
    const result = await onSave({ logo, banner, primaryColor, secondaryColor, slogan, name: name.trim() || club.name, city, country });
    if (result && !result.ok) {
      setSaved("warn");
      setSyncWarn(result.hint || "Los datos se guardaron localmente pero no se sincronizaron con la nube. Ejecuta el SQL de supabase_schema.sql en Supabase → SQL Editor.");
      setTimeout(() => setSaved("idle"), 4000);
    } else {
      setSaved("ok");
      setTimeout(() => setSaved("idle"), 2000);
    }
  };

  return (
    <div className={`space-y-6 ${readOnly ? "pointer-events-none opacity-90" : ""}`}>
      {/* Vista previa con banner */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
        <div
          className="relative h-36 flex items-end"
          style={{
            background: banner
              ? `url(${banner}) center/cover no-repeat`
              : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`,
          }}
        >
          {/* Overlay sutil */}
          {banner && <div className="absolute inset-0 bg-black/30 rounded-t-2xl" />}
          <div className="relative z-10 flex items-center gap-3 p-5 w-full">
            {logo ? (
              <img src={logo} alt="logo" className="w-14 h-14 rounded-xl object-contain bg-white p-1 shadow-lg flex-shrink-0" />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <span style={{ color: banner ? "#fff" : secondaryColor }}>{club.abbreviation || "CLB"}</span>
              </div>
            )}
            <div>
              <p className="font-black text-xl leading-tight drop-shadow-sm" style={{ color: banner ? "#fff" : secondaryColor }}>
                {name || club.name}
              </p>
              {slogan && (
                <p className="text-sm opacity-80 mt-0.5 drop-shadow-sm" style={{ color: banner ? "#ffffffCC" : secondaryColor }}>
                  {slogan}
                </p>
              )}
            </div>
          </div>
          {/* Botón editar banner encima */}
          {!readOnly && (
          <button
            onClick={() => bannerRef.current?.click()}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm pointer-events-auto"
          >
            <ImagePlus size={12} /> {banner ? "Cambiar banner" : "Añadir banner"}
          </button>
          )}
          {banner && (
            <button
              onClick={() => setBanner(null)}
              className="absolute top-3 right-36 z-20 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-black/40 text-white hover:bg-red-500/80 transition-colors"
            >
              <X size={11} /> Quitar
            </button>
          )}
        </div>
        <p className="text-xs text-depro-gray text-center py-2 border-t border-depro-border">Vista previa del banner</p>
      </div>
      <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />

      {/* Datos básicos del club */}
      <div className="bg-white border border-depro-border rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-depro-dark flex items-center gap-2">
          <Pencil size={16} className="text-depro-blue" />
          Datos del club
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Nombre del club *</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Ej. FC Barcelona" value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Ciudad</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Barcelona" value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">País</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="España" value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo + Eslogan */}
        <div className="bg-white border border-depro-border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-depro-dark flex items-center gap-2">
            <ImagePlus size={16} className="text-depro-blue" />
            Logo del club
          </h3>
          <div
            onClick={() => logoRef.current?.click()}
            className="border-2 border-dashed border-depro-border rounded-xl p-6 text-center cursor-pointer hover:border-depro-blue transition-colors group"
          >
            {logo ? (
              <img src={logo} alt="logo" className="h-20 mx-auto object-contain rounded-lg" />
            ) : (
              <>
                <ImagePlus size={28} className="mx-auto text-depro-gray/50 mb-2 group-hover:text-depro-blue transition-colors" />
                <p className="text-sm text-depro-gray">Haz clic para subir el logo</p>
                <p className="text-xs text-depro-gray/60 mt-1">PNG, JPG o SVG · Máx. 2 MB</p>
              </>
            )}
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          {logo && (
            <button
              onClick={() => setLogo(null)}
              className="text-xs text-depro-gray hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Eliminar logo
            </button>
          )}

          {/* Eslogan */}
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Eslogan / descripción corta</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Ej. Formando campeones desde 1985"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
            />
          </div>
        </div>

        {/* Colores */}
        <div className="bg-white border border-depro-border rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-depro-dark flex items-center gap-2">
              <Palette size={16} className="text-depro-blue" />
              Colores corporativos
            </h3>
            <p className="text-xs text-depro-gray mt-0.5">Los dos colores del club que se usarán en su interfaz privada.</p>
          </div>
          <ColorPicker label="Color 1 — Principal" value={primaryColor} onChange={setPrimary} />
          <ColorPicker label="Color 2 — Secundario" value={secondaryColor} onChange={setSecond} />

          {/* Advertencia si los dos colores son iguales o muy similares */}
          {primaryColor.toLowerCase() === secondaryColor.toLowerCase() && (
            <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              ⚠️ Los dos colores son idénticos. El texto puede no verse bien.
            </p>
          )}
        </div>
      </div>

      {syncWarn && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <Clock size={16} className="mt-0.5 shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold mb-0.5">Guardado localmente · Sincronización pendiente</p>
            <p className="text-xs text-yellow-700">{syncWarn}</p>
          </div>
        </div>
      )}
      {!readOnly && (
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saved === "saving"}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
            saved === "ok"   ? "bg-green-500 text-white" :
            saved === "warn" ? "bg-yellow-500 text-white" :
            saved === "saving" ? "bg-depro-blue/70 text-white" :
            "bg-depro-blue text-white hover:bg-depro-blue-dark"
          }`}
        >
          {saved === "ok"     ? <><CheckCircle size={15} /> Guardado</> :
           saved === "warn"   ? <><Clock size={15} /> Solo local</> :
           saved === "saving" ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando…</> :
           <><Save size={15} /> Guardar identidad</>}
        </button>
      </div>
      )}
      {readOnly && (
        <p className="text-xs text-depro-gray text-center">Solo lectura — la identidad la gestiona el propio club desde su dashboard.</p>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function AdminClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("identidad");
  const [contenidoMode, setContenidoMode] = useState("automatico");
  const [contenidoPanel, setContenidoPanel] = useState("plantillas");
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [showNewUser, setShowNewUser] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showNewMc, setShowNewMc]   = useState(false);
  const [plans, setPlans]           = useState([]);
  const [copied, setCopied]         = useState(false);
  const [recreating, setRecreating] = useState(false);
  const [recreateMsg, setRecreateMsg] = useState(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showEditCoordinator, setShowEditCoordinator] = useState(false);
  const [editingClubUser, setEditingClubUser] = useState(null);
  const [activatingUserEmail, setActivatingUserEmail] = useState(null);
  const [planId, setPlanId] = useState("club-inicial");
  const [subscriptionStatus, setSubscriptionStatus] = useState("activo");
  const [manualPrice, setManualPrice] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [commissionPct, setCommissionPct] = useState("10");
  const [payoutIban, setPayoutIban] = useState("");
  const [payoutAccountName, setPayoutAccountName] = useState("");
  const [planSaving, setPlanSaving] = useState(false);
  const [planMsg, setPlanMsg] = useState(null);

  useEffect(() => {
    loadClubs().then((clubs) => {
      const found = clubs.find((c) => c.id === id);
      if (found) {
        const detail = loadClubDetail(id);
        const merged = {
          mediaAssigned: [],
          ...found,
          ...(detail || {}),
        };
        merged.teams = Array.isArray(merged.teams) ? merged.teams : [];
        merged.users = Array.isArray(merged.users) ? merged.users : [];
        setClub(merged);
        setPlans(detail?.plans || found.plans || []);
        setPlanId(merged.plan || "club-inicial");
        setSubscriptionStatus(normalizeAdminStatus(merged.subscriptionStatus || merged.status || "activo"));
        setManualPrice(merged.manualPrice ?? merged.precioCobrado ?? "");
        setDiscountCode(clubDiscountCode(merged));
        setCommissionPct(String(clubCommissionPct(merged)));
        setPayoutIban(merged.payoutIban || "");
        setPayoutAccountName(merged.payoutAccountName || "");
        if (isManualPlanningClub(merged)) {
          setContenidoMode("manual");
          setContenidoPanel("planificacion");
        }
      } else {
        setClub(null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Persistir cambios del club cuando cambia — devuelve promesa con { ok, error }
  const persistClub = useCallback((updatedClub) => {
    const { plans: _plans, plansSource: _src, ...rest } = updatedClub || {};
    return saveClubDetail(id, rest);
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="spinner border-depro-blue/20 border-t-depro-blue" /></div>;
  }

  if (!club) {
    return (
      <div className="text-center py-20 text-depro-gray">
        <Building2 size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">Club no encontrado</p>
        <button onClick={() => navigate("/admin/clubs")} className="mt-4 text-depro-blue text-sm hover:underline">
          Volver a clubs
        </button>
      </div>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(clubDiscountCode(club) || club.login_code || club.loginCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecreateAccess = async () => {
    if (!club?.coordinator?.email || !club?.coordinator?.password) {
      setRecreateMsg({ ok: false, msg: "No hay credenciales guardadas para este coordinador." });
      return;
    }
    setRecreating(true);
    setRecreateMsg(null);
    const result = await createClubUser({
      email: club.coordinator.email,
      password: club.coordinator.password,
      name: club.coordinator.name,
      role: "club",
      clubId: club.id,
      teamRole: "coordinador",
      plan: club.plan || planId,
      subscriptionStatus: normalizeAdminStatus(club.subscriptionStatus || subscriptionStatus),
      billingSource: "manual",
      manualPrice: parseManualPrice(club.manualPrice ?? manualPrice),
    });
    setRecreating(false);
    const alreadyExists = result.alreadyExists || result.error?.includes("already registered") || result.error?.includes("already been registered");
    if (result.ok || alreadyExists) {
      setRecreateMsg({ ok: true, msg: alreadyExists
        ? `✓ El usuario ya existe. Acceso marcado como activo para: ${club.coordinator.email}`
        : `✓ Acceso creado. El coordinador ya puede entrar con: ${club.coordinator.email}` });
      setClub((c) => ({ ...c, coordinator: { ...c.coordinator, userCreated: true } }));
      // Persistir en localStorage
      import("../../lib/adminStorage").then(({ saveClubDetail, loadClubDetail }) => {
        const detail = loadClubDetail(club.id);
        if (detail) saveClubDetail(club.id, { ...detail, coordinator: { ...detail.coordinator, userCreated: true } });
      });
    } else {
      setRecreateMsg({ ok: false, msg: `Error: ${result.error}` });
    }
  };

  const updateClub = (updater) => {
    setClub((c) => {
      const updated = typeof updater === "function" ? updater(c) : { ...c, ...updater };
      persistClub(updated, plans);
      return updated;
    });
  };

  const addTeam = (team) => updateClub((c) => ({ ...c, teams: [...(c.teams || []), team] }));
  const updateTeam = (team) => updateClub((c) => ({
    ...c,
    teams: (c.teams || []).map((t) => (t.id === team.id ? team : t)),
  }));
  const removeTeam = (tid) => updateClub((c) => ({ ...c, teams: (c.teams || []).filter((t) => t.id !== tid) }));

  const handleViewAsCoach = (team) => {
    sessionStorage.setItem("depro_view_as", JSON.stringify({ clubId: club.id, team }));
    navigate("/dashboard/plan");
  };
  const addUser = (user) => updateClub((c) => ({ ...c, users: [...(c.users || []), user] }));

  const markUserAccessActive = (email) => {
    if (!email) return;
    updateClub((c) => ({
      ...c,
      users: (c.users || []).map((u) => (u.email === email ? { ...u, userCreated: true } : u)),
      coordinator: c.coordinator?.email === email ? { ...c.coordinator, userCreated: true } : c.coordinator,
      teams: (c.teams || []).map((t) =>
        t.coach?.email === email ? { ...t, coach: { ...t.coach, userCreated: true } } : t
      ),
    }));
  };

  const handleActivateUserAccess = async (user) => {
    if (!user?.email || !user?.password) {
      setRecreateMsg({ ok: false, msg: "No hay contraseña guardada. Edita el usuario y define una contraseña." });
      return;
    }
    setActivatingUserEmail(user.email);
    setRecreateMsg(null);
    const result = await createClubUser({
      email: user.email,
      password: user.password,
      name: user.name || user.email,
      role: "club",
      clubId: club.id,
      teamId: user.teamId || undefined,
      teamRole: user.role,
      managedTeamIds: user.managedTeamIds,
      plan: club.plan || planId,
      subscriptionStatus: normalizeAdminStatus(user.subscriptionStatus || club.subscriptionStatus || subscriptionStatus),
      billingSource: "manual",
    });
    setActivatingUserEmail(null);
    if (result.ok || result.alreadyExists) {
      markUserAccessActive(user.email);
      setRecreateMsg({
        ok: true,
        msg: result.alreadyExists
          ? `✓ La cuenta ya existía. Acceso marcado como activo: ${user.email}`
          : `✓ Acceso activado. ${user.email} ya puede iniciar sesión.`,
      });
    } else {
      setRecreateMsg({ ok: false, msg: result.error || "No se pudo activar el acceso." });
    }
  };
  const updateClubUser = (user) => updateClub((c) => ({
    ...c,
    users: (c.users || []).map((u) => (u.id === user.id ? user : u)),
  }));
  const updateCoordinator = (data) => updateClub((c) => ({
    ...c,
    coordinator: { ...c.coordinator, ...data },
  }));
  const removeUser = (uid) => updateClub((c) => ({ ...c, users: (c.users || []).filter((u) => u.id !== uid) }));
  const toggleUserActive = (uid) =>
    updateClub((c) => ({ ...c, users: (c.users || []).map((u) => (u.id === uid ? { ...u, active: !u.active } : u)) }));

  const updatePlans = (updater) => {
    setPlans((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      persistClub(club, updated);
      return updated;
    });
  };

  const addMicrocycle = (mc) => updatePlans((prev) => [...prev, mc]);
  const deleteMicrocycle = (mcId) => updatePlans((prev) => prev.filter((m) => m.id !== mcId));
  const addSession = (mcId, session) =>
    updatePlans((prev) =>
      prev.map((mc) => mc.id === mcId ? { ...mc, sessions: [...(mc.sessions || []), session] } : mc)
    );
  const deleteSession = (mcId, sessionId) =>
    updatePlans((prev) =>
      prev.map((mc) =>
        mc.id === mcId
          ? { ...mc, sessions: (mc.sessions || []).filter((s) => s.id !== sessionId) }
          : mc
      )
    );

  const TABS = [
    { id: "identidad", label: "Identidad", icon: Palette },
    { id: "contenido", label: "Contenido", icon: BookOpen },
    { id: "equipos", label: "Equipos", icon: Shield, count: (club.teams || []).length },
    { id: "usuarios", label: "Usuarios", icon: Users, count: (() => {
      let n = (club.users || []).length;
      if (club.coordinator?.email) n++;
      (club.teams || []).forEach((t) => { if (t.coach?.email) n++; });
      return n;
    })() },
    { id: "comisiones", label: "Comisión", icon: Wallet },
  ];

  const planLabel = isManualPlanningClub(club)
    ? (formatManualPrice(club.manualPrice) || "Personalizado")
    : (CHECKOUT_PLANS[club.plan]?.name || club.plan || "Personalizado");
  const clubIsManual = isManualPlanningClub(club);

  const handleSavePlan = async () => {
    setPlanSaving(true);
    setPlanMsg(null);
    const status = normalizeAdminStatus(subscriptionStatus);
    const price = parseManualPrice(manualPrice);
    const updated = withSyncedDiscountCode({
      ...club,
      plan: clubIsManual ? null : planId,
      subscriptionStatus: status,
      status,
      manualPrice: price,
      referralCommissionPct: clubCommissionPct({ referralCommissionPct: commissionPct }),
      payoutIban: payoutIban.trim().toUpperCase(),
      payoutAccountName: payoutAccountName.trim(),
    }, discountCode);
    setClub(updated);
    setDiscountCode(clubDiscountCode(updated));
    await persistClub(updated, plans);
    await saveClub(updated);

    if (club.coordinator?.email) {
      const res = await updateUserByEmail({
        email: club.coordinator.email,
        plan: isManualPlanningClub(club) ? null : planId,
        subscriptionStatus: status,
        billingSource: "manual",
        manualPrice: price,
      });
      if (!res.ok) {
        setPlanMsg({ ok: false, text: res.error || "Plan guardado en club, pero no se sincronizó el coordinador." });
        setPlanSaving(false);
        return;
      }
    }

    setPlanMsg({ ok: true, text: "Comisión y economía del club guardadas." });
    setPlanSaving(false);
    setTimeout(() => setPlanMsg(null), 3000);
  };

  const handleStatusToggle = async () => {
    const next = canUserLogin(club.status || club.subscriptionStatus) ? "borrador" : "activo";
    const updated = { ...club, status: next, subscriptionStatus: next };
    setClub(updated);
    setSubscriptionStatus(next);
    setShowStatusConfirm(false);
    saveClubDetail(id, { ...updated, plans });
    const { saveClub: sc } = await import("../../lib/adminStorage");
    sc(updated);
    if (club.coordinator?.email) {
      await updateUserByEmail({
        email: club.coordinator.email,
        subscriptionStatus: next,
        billingSource: "manual",
      });
    }
  };

  return (
    <>
    {/* Modal confirmación cambio de estado */}
    {showStatusConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-depro w-full max-w-sm p-6">
          {canUserLogin(club.status || club.subscriptionStatus) ? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              </div>
              <h2 className="text-lg font-bold text-depro-dark text-center mb-2">¿Pasar el club a borrador?</h2>
              <p className="text-sm text-depro-gray text-center mb-6">
                El coordinador y el staff no podrán iniciar sesión. Solo tú lo verás en el panel admin. Puedes pasarlo a demo o activo cuando quieras.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowStatusConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm text-depro-gray hover:bg-depro-gray-light transition-colors">Cancelar</button>
                <button onClick={handleStatusToggle} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Sí, a borrador</button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-lg font-bold text-depro-dark text-center mb-2">¿Activar el club?</h2>
              <p className="text-sm text-depro-gray text-center mb-6">
                El coordinador y el staff podrán entrar al dashboard.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowStatusConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm text-depro-gray hover:bg-depro-gray-light transition-colors">Cancelar</button>
                <button onClick={handleStatusToggle} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors">Sí, activar</button>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/admin/clubs")}
          className="flex items-center gap-1.5 text-depro-gray hover:text-depro-dark text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver a clubs
        </button>

        <div className="bg-white border border-depro-border rounded-2xl p-6">
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden border border-depro-border"
              style={{ backgroundColor: club.primaryColor || undefined }}
            >
              {club.logo
                ? <img src={club.logo} alt={club.name} className="w-full h-full object-contain p-1" />
                : <span style={{ color: club.secondaryColor || undefined }} className={!club.primaryColor ? "text-depro-dark bg-depro-gray-light w-full h-full flex items-center justify-center rounded-2xl" : ""}>{club.abbreviation || "?"}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-depro-dark">{club.name}</h1>
                <button
                  title="Cambiar estado del club"
                  onClick={() => setShowStatusConfirm(true)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${
                    ADMIN_STATUS_STYLES[normalizeAdminStatus(club.subscriptionStatus || club.status)] || ADMIN_STATUS_STYLES.borrador
                  }`}
                >
                  {adminStatusLabel(club.subscriptionStatus || club.status)}
                </button>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-depro-blue/10 text-depro-blue">
                  {planLabel}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  (club.planningMode || "auto") === "manual"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-sky-50 text-sky-700 border-sky-200"
                }`}>
                  {(club.planningMode || "auto") === "manual" ? "Llevado por mí" : "Automático"}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-depro-gray">
                {club.city && <span>{club.city}, {club.country}</span>}
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {club.coordinator?.email || "—"}
                </span>
                {club.coordinator?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={12} />
                    {club.coordinator.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Alta: {club.createdAt}
                </span>
              </div>

              {/* Acceso coordinador */}
              {club.coordinator?.email && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                    club.coordinator?.userCreated
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}>
                    {club.coordinator?.userCreated ? <CheckCircle size={11} /> : <Clock size={11} />}
                    {club.coordinator?.userCreated ? "Acceso activo" : "Acceso pendiente"}
                  </div>
                  <button
                    onClick={() => setShowEditCoordinator(true)}
                    className="hidden"
                  >
                    <Edit3 size={11} /> Editar coordinador
                  </button>
                  <button
                    onClick={handleRecreateAccess}
                    disabled={recreating}
                    className="hidden"
                  >
                    {recreating ? <div className="spinner border-depro-blue/20 border-t-depro-blue w-3 h-3" /> : <RefreshCw size={11} />}
                    {recreating ? "Creando..." : "Recrear acceso"}
                  </button>
                  {!club.coordinator?.userCreated && (
                    <button
                      onClick={() => {
                        setClub((c) => ({ ...c, coordinator: { ...c.coordinator, userCreated: true } }));
                        import("../../lib/adminStorage").then(({ saveClubDetail, loadClubDetail }) => {
                          const detail = loadClubDetail(club.id);
                          if (detail) saveClubDetail(club.id, { ...detail, coordinator: { ...detail.coordinator, userCreated: true } });
                        });
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 border border-green-300 hover:border-green-500 px-3 py-1 rounded-full transition-colors"
                    >
                      <CheckCircle size={11} /> Marcar como activo
                    </button>
                  )}
                  {club.coordinator?.password && (
                    <button
                      onClick={() => navigator.clipboard.writeText(`${club.coordinator.email}\n${club.coordinator.password}`)}
                      className="flex items-center gap-1.5 text-xs text-depro-gray hover:text-depro-dark border border-depro-border px-3 py-1 rounded-full transition-colors"
                      title="Copiar credenciales"
                    >
                      <Copy size={11} /> Copiar credenciales
                    </button>
                  )}
                </div>
              )}
              {recreateMsg && (
                <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${
                  recreateMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}>
                  {recreateMsg.msg}
                </div>
              )}
            </div>

            {/* Login code */}
            <div className="flex items-center gap-2 bg-depro-gray-light rounded-xl px-4 py-3 shrink-0">
              <Lock size={14} className="text-depro-gray" />
              <div>
                <p className="text-xs text-depro-gray">Código de descuento</p>
                <p className="font-mono font-bold text-depro-dark">{clubDiscountCode(club) || club.loginCode || "—"}</p>
              </div>
              <button
                onClick={copyCode}
                className="ml-1 p-1.5 rounded-lg hover:bg-depro-blue/10 text-depro-gray hover:text-depro-blue transition-colors"
              >
                {copied ? <CheckCircle size={15} className="text-green-500" /> : <Copy size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-depro-gray-light p-1 rounded-xl w-fit">
        {TABS.map(({ id: tid, label, icon: Icon, count }) => (
          <button
            key={tid}
            onClick={() => setActiveTab(tid)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tid
                ? "bg-white text-depro-dark shadow-sm"
                : "text-depro-gray hover:text-depro-dark"
            }`}
          >
            <Icon size={14} />
            {label}
            {count != null && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tid ? "bg-depro-blue/10 text-depro-blue" : "bg-white text-depro-gray"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* IDENTIDAD */}
      {activeTab === "identidad" && (
        <>
        <div className="bg-white border border-depro-border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-depro-dark">Plan personalizado</h3>
          <div>
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Modo de planificación</p>
            {clubIsManual ? (
              <p className="text-sm text-depro-gray rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5">
                Este club está <strong className="text-amber-900">llevado por ti</strong>: la planificación es manual. No hace falta elegir automático/manual ni rellenar el cuestionario del motor.
              </p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: "auto", label: "Automático", hint: "Usa el motor club auto" },
                { id: "manual", label: "Llevado por mí", hint: "Planificación manual / premium" },
              ].map((opt) => {
                const active = (club.planningMode || "auto") === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={async () => {
                      const prevCfg = club.coachConfig || {};
                      const nextCfg = opt.id === "manual"
                        ? { ...prevCfg, mode: "personalizado", engine: "manual" }
                        : {
                            ...prevCfg,
                            mode: "depro",
                            engine: "club_auto",
                            nivel: prevCfg.nivel || "B",
                            dias_entrenamiento_semana: prevCfg.dias_entrenamiento_semana || prevCfg.trainingsPerWeek || 3,
                            dias_exactos_entrenamiento: prevCfg.dias_exactos_entrenamiento || prevCfg.trainingDays || ["Lunes", "Miércoles", "Viernes"],
                            dia_partido: prevCfg.dia_partido || prevCfg.matchDay || "sabado",
                            acceso_gimnasio: prevCfg.acceso_gimnasio || (prevCfg.gymAccess ? "si" : "no"),
                          };
                      const updated = {
                        ...club,
                        origen: opt.id === "manual" ? "manual" : "automatico",
                        planningMode: opt.id,
                        mode: opt.id === "manual" ? "personalizado" : "depro",
                        coachConfig: nextCfg,
                      };
                      setClub(updated);
                      await persistClub(updated, plans);
                      await saveClub(updated);
                      clearCoachGeneratedPlans(club.id);
                    }}
                    className={`text-left p-3 rounded-xl border transition-colors ${
                      active ? "border-depro-blue bg-depro-blue/5" : "border-depro-border hover:border-depro-blue/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-depro-dark">{opt.label}</p>
                    <p className="text-[11px] text-depro-gray mt-0.5">{opt.hint}</p>
                  </button>
                );
              })}
            </div>
            )}
          </div>
          {!clubIsManual && (club.planningMode || "auto") !== "manual" && (
            <AdminClubAutoQuestionnaireEditor
              club={club}
              onSave={async (nextClub) => {
                setClub(nextClub);
                await persistClub(nextClub, plans);
                await saveClub(nextClub);
                clearCoachGeneratedPlans(club.id);
              }}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!clubIsManual && (
              <PlanSelectField audience="club" value={planId} onChange={setPlanId} />
            )}
            <SubscriptionStatusSelect value={subscriptionStatus} onChange={setSubscriptionStatus} />
            <ManualPriceField value={manualPrice} onChange={setManualPrice} />
          </div>
          <div className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-4">
            <h4 className="text-sm font-semibold text-depro-dark mb-3">Código de descuento y transferencia</h4>
            <ClubEconomyFields
              discountCode={discountCode}
              commissionPct={commissionPct}
              payoutIban={payoutIban}
              payoutAccountName={payoutAccountName}
              onChange={(patch) => {
                if (patch.discountCode != null) setDiscountCode(patch.discountCode);
                if (patch.referralCommissionPct != null) setCommissionPct(patch.referralCommissionPct);
                if (patch.payoutIban != null) setPayoutIban(patch.payoutIban);
                if (patch.payoutAccountName != null) setPayoutAccountName(patch.payoutAccountName);
                setClub((c) => ({ ...c, ...patch }));
              }}
            />
          </div>
          {planMsg && (
            <p className={`text-sm ${planMsg.ok ? "text-green-700" : "text-red-600"}`}>{planMsg.text}</p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSavePlan}
              disabled={planSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark disabled:opacity-50"
            >
              {planSaving ? "Guardando…" : "Guardar plan y economía"}
            </button>
          </div>
        </div>
        <IdentidadTab club={club} onSave={async (patch) => {
          // Actualizar estado local
          const updated = { ...club, ...patch };
          setClub(updated);
          // Persistir y devolver resultado para que IdentidadTab muestre feedback
          return await persistClub(updated, plans);
        }} />
        </>
      )}

      {/* CONTENIDO (§3.1) */}
      {activeTab === "contenido" && (
        <div className="space-y-4">
          <div className="bg-white border border-depro-border rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-depro-dark flex items-center gap-2">
                  <Wallet size={16} className="text-depro-blue" /> Comisión
                </h3>
                <p className="text-sm text-depro-gray mt-1">
                  Porcentaje de este club sobre el <strong>precio total final</strong> de cada compra
                  (plan + extras del carrito). Cada club puede tener un % distinto.
                </p>
              </div>
            </div>
            <ClubEconomyFields
              compactCommission
              discountCode={discountCode}
              commissionPct={commissionPct}
              payoutIban={payoutIban}
              payoutAccountName={payoutAccountName}
              onChange={(patch) => {
                if (patch.discountCode != null) setDiscountCode(patch.discountCode);
                if (patch.referralCommissionPct != null) setCommissionPct(patch.referralCommissionPct);
                if (patch.payoutIban != null) setPayoutIban(patch.payoutIban);
                if (patch.payoutAccountName != null) setPayoutAccountName(patch.payoutAccountName);
                setClub((c) => ({ ...c, ...patch }));
              }}
            />
            {planMsg && (
              <p className={`text-sm ${planMsg.ok ? "text-green-700" : "text-red-600"}`}>{planMsg.text}</p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSavePlan}
                disabled={planSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark disabled:opacity-50"
              >
                {planSaving ? "Guardando…" : "Guardar comisión"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {clubIsManual ? (
              [
                { id: "planificacion", label: "Planificación", icon: ClipboardList },
                { id: "tests", label: "Tests físicos", icon: BarChart2 },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setContenidoMode("manual");
                      setContenidoPanel(p.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                      contenidoPanel === p.id
                        ? "bg-depro-blue text-white border-depro-blue"
                        : "bg-white text-depro-dark border-depro-border"
                    }`}
                  >
                    <Icon size={12} /> {p.label}
                  </button>
                );
              })
            ) : (
            [
              { id: "automatico", label: "A) Automático", hint: "Protocolos, calentamientos, tareas, ejercicios, motor" },
              { id: "manual", label: "B) Manual", hint: "Planificación del club + tests físicos" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setContenidoMode(m.id);
                  setContenidoPanel(m.id === "automatico" ? "plantillas" : "planificacion");
                }}
                className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                  contenidoMode === m.id ? "border-depro-blue bg-depro-blue/5" : "border-depro-border hover:border-depro-blue/40"
                }`}
              >
                <p className="text-sm font-bold text-depro-dark">{m.label}</p>
                <p className="text-[11px] text-depro-gray mt-0.5">{m.hint}</p>
              </button>
            ))
            )}
          </div>

          {contenidoMode === "automatico" && !clubIsManual && (
            <div className="flex flex-wrap gap-2">
              {[
                { id: "plantillas", label: "Plantillas de protocolos", icon: Layers },
                { id: "sin_balon", label: "Calentamientos sin balón", icon: Flame },
                { id: "con_balon", label: "Calentamiento con balón", icon: Sparkles },
                { id: "ejercicios", label: "Ejercicios (versión club)", icon: Dumbbell },
                { id: "motor", label: "Motor Club Auto", icon: Sparkles },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setContenidoPanel(p.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                      contenidoPanel === p.id
                        ? "bg-depro-blue text-white border-depro-blue"
                        : "bg-white text-depro-dark border-depro-border"
                    }`}
                  >
                    <Icon size={12} /> {p.label}
                  </button>
                );
              })}
            </div>
          )}

          {contenidoMode === "manual" && !clubIsManual && (
            <div className="flex flex-wrap gap-2">
              {[
                { id: "planificacion", label: "Planificación", icon: ClipboardList },
                { id: "tests", label: "Tests físicos", icon: BarChart2 },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setContenidoPanel(p.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                      contenidoPanel === p.id
                        ? "bg-depro-blue text-white border-depro-blue"
                        : "bg-white text-depro-dark border-depro-border"
                    }`}
                  >
                    <Icon size={12} /> {p.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="bg-white border border-depro-border rounded-2xl p-4 md:p-6">
            {contenidoMode === "automatico" && !clubIsManual && contenidoPanel === "plantillas" && <AdminClubPlantillasPage />}
            {contenidoMode === "automatico" && !clubIsManual && contenidoPanel === "sin_balon" && <AdminClubCalentamientosPage embedded />}
            {contenidoMode === "automatico" && !clubIsManual && contenidoPanel === "con_balon" && <AdminClubTareasPage embedded />}
            {contenidoMode === "automatico" && !clubIsManual && contenidoPanel === "ejercicios" && (
              <AdminClubExercisesPage />
            )}
            {contenidoMode === "automatico" && !clubIsManual && contenidoPanel === "motor" && <AdminClubAutoMotorPage />}
            {(contenidoMode === "manual" || clubIsManual) && contenidoPanel === "planificacion" && (
              <div className="space-y-3">
                <p className="text-sm text-depro-dark font-semibold">Planificación compartida</p>
                <p className="text-sm text-depro-gray">
                  Este club usa la misma planificación que el resto de clubs llevados por mí.
                  Las sesiones se crean en Planificación (menú admin) y el entrenador las ve filtradas por la categoría de su equipo.
                </p>
                <Link
                  to="/admin/planificacion"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold"
                >
                  <ClipboardList size={14} /> Abrir planificación global
                </Link>
              </div>
            )}
            {(contenidoMode === "manual" || clubIsManual) && contenidoPanel === "tests" && (
              <div className="space-y-3">
                <p className="text-sm text-depro-gray">Tests físicos compartidos entre modo manual y automático.</p>
                <AdminTestsPage />
              </div>
            )}
          </div>
        </div>
      )}

      {/* EQUIPOS */}
      {activeTab === "equipos" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowNewTeam(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark"
            >
              <Plus size={15} /> Añadir equipo
            </button>
          </div>

          {club.teams.length === 0 ? (
            <div className="text-center py-12 text-depro-gray border border-dashed border-depro-border rounded-2xl">
              <Shield size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Este club aún no tiene equipos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {club.teams.map((team) => (
                <div key={team.id} className="bg-white border border-depro-border rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-depro-dark">{team.name}</h3>
                      <p className="text-xs text-depro-gray mt-0.5">
                        {team.category} · {team.season} · {team.players} jugadores
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
                        title="Editar equipo"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => removeTeam(team.id)}
                        className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-red hover:text-depro-red transition-colors"
                        title="Eliminar equipo"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => handleViewAsCoach(team)}
                        className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
                        title="Ver como entrenador"
                      >
                        <Play size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Días de entrenamiento */}
                  {team.trainingDays?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {DAYS.map((day, i) => (
                        <span
                          key={day}
                          className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-semibold ${
                            team.trainingDays.includes(day)
                              ? "bg-depro-blue text-white"
                              : "bg-depro-gray-light text-depro-gray/40"
                          }`}
                        >
                          {DAY_SHORT[i]}
                        </span>
                      ))}
                    </div>
                  )}

                  {team.coach && (
                    <div className="pt-2 border-t border-depro-border space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <RoleBadge role="entrenador" />
                        <span className="text-depro-dark font-medium">{team.coach.name}</span>
                        <span className="text-depro-gray ml-auto">{team.coach.email}</span>
                      </div>
                      {team.assistantCoach && (
                        <div className="flex items-center gap-2 text-xs">
                          <RoleBadge role="ayudante" />
                          <span className="text-depro-dark font-medium">{team.assistantCoach.name}</span>
                          <span className="text-depro-gray ml-auto">{team.assistantCoach.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USUARIOS */}
      {activeTab === "usuarios" && (
        <div className="space-y-4">
          {recreateMsg && (
            <div className={`text-sm px-4 py-3 rounded-xl border ${
              recreateMsg.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
            }`}>
              {recreateMsg.msg}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowNewUser(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark"
            >
              <Plus size={15} /> Añadir usuario
            </button>
          </div>

          {(() => {
            // Construir lista completa: coordinador + entrenadores + usuarios manuales
            const allUsers = [];
            if (club.coordinator?.email) {
              allUsers.push({ id: "coord", name: club.coordinator.name, email: club.coordinator.email, role: "Coordinador", team: "—", userCreated: club.coordinator.userCreated });
            }
            (club.teams || []).forEach((t) => {
              if (t.coach?.email) {
                allUsers.push({ id: `coach_${t.id}`, name: t.coach.name, email: t.coach.email, role: "Entrenador", team: t.name, userCreated: t.coach.userCreated });
              }
            });
            (club.users || []).forEach((u) => allUsers.push({ ...u, team: "—" }));

            return allUsers.length === 0 ? (
            <div className="text-center py-12 text-depro-gray border border-dashed border-depro-border rounded-2xl">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay usuarios registrados en este club</p>
            </div>
          ) : (
            <div className="bg-white border border-depro-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-depro-gray-light">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide">Usuario</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide hidden md:table-cell">Rol</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide hidden lg:table-cell">Equipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-depro-border">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-depro-gray-light/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-depro-dark">{user.name || user.email}</p>
                        <p className="text-xs text-depro-gray">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 text-depro-gray text-xs hidden lg:table-cell">
                        {user.team ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            user.userCreated !== false
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}>
                            {user.userCreated !== false ? "Activo" : "Pendiente"}
                          </span>
                          {user.userCreated === false && user.password && (
                            <button
                              type="button"
                              onClick={() => handleActivateUserAccess(user)}
                              disabled={activatingUserEmail === user.email}
                              className="text-[10px] font-bold text-depro-blue hover:underline text-left disabled:opacity-50"
                            >
                              {activatingUserEmail === user.email ? "Activando…" : "Activar acceso"}
                            </button>
                          )}
                          {user.userCreated === false && !user.password && (
                            <span className="text-[10px] text-depro-gray">Edita y añade contraseña</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {user.id && !user.id.startsWith("coord") && !user.id.startsWith("coach_") && (
                            <>
                              <button
                                onClick={() => setEditingClubUser(user)}
                                className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
                                title="Editar usuario"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => removeUser(user.id)}
                                className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-red hover:text-depro-red transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                          {user.id === "coord" && (
                            <button
                              onClick={() => setShowEditCoordinator(true)}
                              className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
                              title="Editar coordinador"
                            >
                              <Edit3 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          })()}
        </div>
      )}

      {activeTab === "comisiones" && (
        <AdminClubCommissionPanel club={club} />
      )}

      {showNewTeam && (
        <NewTeamModal
          onClose={() => setShowNewTeam(false)}
          onCreate={addTeam}
          clubId={club.id}
          clubPlan={club.plan || planId}
          clubStatus={club.subscriptionStatus || subscriptionStatus}
        />
      )}
      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          clubId={club.id}
          onClose={() => setEditingTeam(null)}
          onSave={updateTeam}
        />
      )}
      {showNewUser && (
        <NewUserModal
          teams={club.teams}
          clubId={club.id}
          clubPlan={club.plan || planId}
          clubStatus={club.subscriptionStatus || subscriptionStatus}
          onClose={() => setShowNewUser(false)}
          onCreate={addUser}
          onAccessActivated={markUserAccessActive}
        />
      )}
      {showEditCoordinator && (
        <EditCoordinatorModal
          coordinator={club.coordinator}
          onClose={() => setShowEditCoordinator(false)}
          onSave={(data) => { updateCoordinator(data); setShowEditCoordinator(false); }}
        />
      )}
      {editingClubUser && (
        <EditClubUserModal
          user={editingClubUser}
          teams={club.teams || []}
          onClose={() => setEditingClubUser(null)}
          onSave={(data) => { updateClubUser(data); setEditingClubUser(null); }}
        />
      )}
    </div>
    </>
  );
}
