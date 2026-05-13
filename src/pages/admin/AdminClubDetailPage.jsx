import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  Shield,
  Plus,
  Trash2,
  Edit3,
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
} from "lucide-react";
import { loadClubs, saveClubDetail, loadClubDetail, loadMedia, createClubUser } from "../../lib/adminStorage";

const ROLES = [
  { id: "coordinador", label: "Coordinador", icon: Crown, color: "text-depro-blue bg-depro-blue/10" },
  { id: "entrenador", label: "Entrenador", icon: UserCheck, color: "text-green-600 bg-green-50" },
  { id: "ayudante", label: "Ayudante técnico", icon: Dumbbell, color: "text-orange-500 bg-orange-50" },
  { id: "jugador", label: "Jugador", icon: Users, color: "text-depro-gray bg-depro-gray-light" },
];
const CATEGORIES = ["Benjamín", "Alevín", "Infantil", "Cadete", "Juvenil", "Amateur", "Semiprofesional"];

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

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

function NewTeamModal({ onClose, onCreate, clubId }) {
  const [form, setForm] = useState({
    name: "", category: "Juvenil", season: "2024/25",
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
      });
      userCreated = result.ok;
      userError = result.ok ? null : result.error;
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
              placeholder="Ej. Juvenil A"
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
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
                    className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
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
            disabled={!form.name || loading}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando…</> : "Crear equipo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewUserModal({ teams, onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", email: "", role: "entrenador", team: "", password: generatePassword() });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Añadir usuario</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
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
          {form.role !== "coordinador" && teams.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Equipo asignado</label>
              <select
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.team}
                onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
              >
                <option value="">— Sin equipo —</option>
                {teams.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
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
                className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
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
            <p className="text-xs text-depro-gray mt-1">El usuario deberá cambiarla en el primer acceso.</p>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (!form.email) return;
              onCreate({
                id: `u${Date.now()}`,
                name: form.name || form.email,
                email: form.email,
                role: form.role,
                team: form.team || null,
                active: true,
                lastLogin: "nunca",
                password: form.password,
              });
              onClose();
            }}
            disabled={!form.email}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40"
          >
            Crear usuario
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── New Microcycle Modal ────────────────────────────────────── */
const INTENSITIES = ["Baja", "Media-baja", "Media", "Media-alta", "Alta", "Máxima"];
const SESSION_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function NewMicrocycleModal({ teams, onClose, onCreate }) {
  const [form, setForm] = useState({
    microcycle: "",
    label: "",
    teamId: teams[0]?.id ?? "",
    teamName: teams[0]?.name ?? "",
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
          {teams.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Equipo</label>
              <select
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.teamId}
                onChange={(e) => {
                  const t = teams.find((t) => t.id === e.target.value);
                  setForm((f) => ({ ...f, teamId: e.target.value, teamName: t?.name ?? "" }));
                }}
              >
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
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

function NewSessionModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    day: "Lunes",
    title: "",
    duration: "75 min",
    intensity: "Media",
    space: "",
    players: "",
    objective: "",
    exercises: [{ name: "", sets: 3, reps: "10", rest: "60s" }],
    mediaIds: [],
  });

  const updateExercise = (i, field, val) =>
    setForm((f) => {
      const ex = [...f.exercises];
      ex[i] = { ...ex[i], [field]: val };
      return { ...f, exercises: ex };
    });

  const addExercise = () =>
    setForm((f) => ({ ...f, exercises: [...f.exercises, { name: "", sets: 3, reps: "10", rest: "60s" }] }));

  const removeExercise = (i) =>
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));

  const toggleMedia = (mid) =>
    setForm((f) => ({
      ...f,
      mediaIds: f.mediaIds.includes(mid)
        ? f.mediaIds.filter((x) => x !== mid)
        : [...f.mediaIds, mid],
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Nueva sesión</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Día</label>
              <select
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.day}
                onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
              >
                {SESSION_DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Título *</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Ej. Bloque táctico · presión alta"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-depro-gray mb-1">Duración</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="75 min"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-depro-gray mb-1">Intensidad</label>
              <select
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.intensity}
                onChange={(e) => setForm((f) => ({ ...f, intensity: e.target.value }))}
              >
                {INTENSITIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-depro-gray mb-1">Espacio</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Medio campo"
                value={form.space}
                onChange={(e) => setForm((f) => ({ ...f, space: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-depro-gray mb-1">Jugadores</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                type="number"
                placeholder="18"
                value={form.players}
                onChange={(e) => setForm((f) => ({ ...f, players: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Objetivo de la sesión</label>
            <textarea
              rows={2}
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 resize-none"
              placeholder="Objetivo principal de esta sesión…"
              value={form.objective}
              onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-depro-dark">Ejercicios / tareas</label>
              <button onClick={addExercise} className="flex items-center gap-1 text-xs text-depro-blue font-medium hover:underline">
                <Plus size={12} /> Añadir
              </button>
            </div>
            <div className="space-y-2">
              {form.exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="col-span-5 border border-depro-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Nombre del ejercicio"
                    value={ex.name}
                    onChange={(e) => updateExercise(i, "name", e.target.value)}
                  />
                  <input
                    className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Series"
                    value={ex.sets}
                    onChange={(e) => updateExercise(i, "sets", e.target.value)}
                  />
                  <input
                    className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Reps/T."
                    value={ex.reps}
                    onChange={(e) => updateExercise(i, "reps", e.target.value)}
                  />
                  <input
                    className="col-span-2 border border-depro-border rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Desc."
                    value={ex.rest}
                    onChange={(e) => updateExercise(i, "rest", e.target.value)}
                  />
                  <button onClick={() => removeExercise(i)} className="col-span-1 flex items-center justify-center text-depro-gray hover:text-depro-red">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-depro-gray mt-1">Nombre · Series · Reps/Tiempo · Descanso</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Adjuntar vídeos de la biblioteca</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {mediaLibrary.filter((m) => m.type === "video").map((v) => (
                <label key={v.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="accent-depro-blue"
                    checked={form.mediaIds.includes(v.id)}
                    onChange={() => toggleMedia(v.id)}
                  />
                  <span className="text-sm text-depro-dark group-hover:text-depro-blue">{v.title}</span>
                  <span className="text-xs text-depro-gray ml-auto">{v.duration}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (!form.title) return;
              onCreate({ ...form, id: `s${Date.now()}` });
              onClose();
            }}
            disabled={!form.title}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Save size={15} /> Guardar sesión
          </button>
        </div>
      </div>
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
              const videos = mediaLibrary.filter((m) => session.mediaIds?.includes(m.id));
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
                      </div>
                      <p className="font-medium text-depro-dark text-sm">{session.title}</p>
                      {session.objective && (
                        <p className="text-xs text-depro-gray mt-0.5">{session.objective}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        {session.exercises.slice(0, 3).map((ex, i) => (
                          <div key={i} className="text-xs text-depro-gray flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-depro-blue/60 shrink-0" />
                            <span className="font-medium text-depro-dark/80">{ex.name}</span>
                            <span className="text-depro-gray/70 ml-auto">
                              {ex.sets}×{ex.reps} · {ex.rest}
                            </span>
                          </div>
                        ))}
                        {session.exercises.length > 3 && (
                          <p className="text-xs text-depro-gray/60 pl-3">
                            +{session.exercises.length - 3} más…
                          </p>
                        )}
                      </div>
                      {videos.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {videos.map((v) => (
                            <span key={v.id} className="flex items-center gap-1 text-xs text-depro-blue bg-depro-blue/8 px-2 py-0.5 rounded-full">
                              <Play size={9} /> {v.title.slice(0, 20)}…
                            </span>
                          ))}
                        </div>
                      )}
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

function IdentidadTab({ club, onSave }) {
  const [logo, setLogo]             = useState(club.logo || null);
  const [primaryColor, setPrimary]  = useState(club.primaryColor || "#1E3A8A");
  const [secondaryColor, setSecond] = useState(club.secondaryColor || "#FFFFFF");
  const [slogan, setSlogan]         = useState(club.slogan || "");
  const [saved, setSaved]           = useState(false);
  const logoRef = useRef();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({ logo, primaryColor, secondaryColor, slogan });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Vista previa */}
      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h3 className="font-semibold text-depro-dark mb-4 flex items-center gap-2">
          <Palette size={16} className="text-depro-blue" />
          Vista previa de la interfaz del club
        </h3>
        <div
          className="rounded-xl p-5 flex items-center gap-4"
          style={{ backgroundColor: primaryColor }}
        >
          {logo ? (
            <img src={logo} alt="logo" className="w-14 h-14 rounded-xl object-contain bg-white p-1 shadow" />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}>
              {club.abbreviation || "CLB"}
            </div>
          )}
          <div>
            <p className="font-bold text-lg leading-tight" style={{ color: secondaryColor }}>{club.name}</p>
            {slogan && <p className="text-sm opacity-80 mt-0.5" style={{ color: secondaryColor }}>{slogan}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
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
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-depro-blue text-white hover:bg-depro-blue-dark"
          }`}
        >
          {saved ? <><CheckCircle size={15} /> Guardado</> : <><Save size={15} /> Guardar identidad</>}
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function AdminClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub]             = useState(null);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("planificacion");
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [showNewUser, setShowNewUser] = useState(false);
  const [showNewMc, setShowNewMc]   = useState(false);
  const [plans, setPlans]           = useState([]);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    Promise.all([loadClubs(), loadMedia()]).then(([clubs, meds]) => {
      const found = clubs.find((c) => c.id === id);
      if (found) {
        // Intentar cargar detalles guardados
        const detail = loadClubDetail(id);
        setClub({ teams: [], users: [], mediaAssigned: [], ...found, ...(detail || {}) });
        setPlans(detail?.plans || []);
      } else {
        setClub(null);
      }
      setMediaLibrary(meds);
      setLoading(false);
    });
  }, [id]);

  // Persistir cambios del club cuando cambia
  const persistClub = useCallback((updatedClub, updatedPlans) => {
    saveClubDetail(id, { ...updatedClub, plans: updatedPlans });
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
    navigator.clipboard.writeText(club.login_code || club.loginCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateClub = (updater) => {
    setClub((c) => {
      const updated = typeof updater === "function" ? updater(c) : { ...c, ...updater };
      persistClub(updated, plans);
      return updated;
    });
  };

  const addTeam = (team) => updateClub((c) => ({ ...c, teams: [...(c.teams || []), team] }));
  const removeTeam = (tid) => updateClub((c) => ({ ...c, teams: (c.teams || []).filter((t) => t.id !== tid) }));
  const addUser = (user) => updateClub((c) => ({ ...c, users: [...(c.users || []), user] }));
  const removeUser = (uid) => updateClub((c) => ({ ...c, users: (c.users || []).filter((u) => u.id !== uid) }));
  const toggleUserActive = (uid) =>
    updateClub((c) => ({ ...c, users: (c.users || []).map((u) => (u.id === uid ? { ...u, active: !u.active } : u)) }));

  const assignedMedia = mediaLibrary.filter((m) => (club.mediaAssigned || []).includes(m.id));

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
    { id: "equipos", label: "Equipos", icon: Shield, count: (club.teams || []).length },
    { id: "planificacion", label: "Planificación", icon: ClipboardList, count: plans.length },
    { id: "usuarios", label: "Usuarios", icon: Users, count: (club.users || []).length },
    { id: "medios", label: "Medios asignados", icon: Video, count: assignedMedia.length },
  ];

  return (
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
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                  club.status === "activo"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>
                  {club.status}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  club.plan === "Premium" ? "bg-depro-blue/10 text-depro-blue" : "bg-depro-gray-light text-depro-gray"
                }`}>
                  {club.plan}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-depro-gray">
                {club.city && <span>{club.city}, {club.country}</span>}
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {club.coordinator.email}
                </span>
                {club.coordinator.phone && (
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
            </div>

            {/* Login code */}
            <div className="flex items-center gap-2 bg-depro-gray-light rounded-xl px-4 py-3 shrink-0">
              <Lock size={14} className="text-depro-gray" />
              <div>
                <p className="text-xs text-depro-gray">Código de acceso</p>
                <p className="font-mono font-bold text-depro-dark">{club.loginCode}</p>
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
      <div className="flex gap-1 bg-depro-gray-light p-1 rounded-xl w-fit">
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
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tid ? "bg-depro-blue/10 text-depro-blue" : "bg-white text-depro-gray"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* IDENTIDAD */}
      {activeTab === "identidad" && (
        <IdentidadTab club={club} onSave={(patch) => { updateClub((c) => ({ ...c, ...patch })); }} />
      )}

      {/* PLANIFICACIÓN */}
      {activeTab === "planificacion" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-depro-gray">
              Crea y gestiona los microciclos del plan para este club. Cada microciclo tiene sus sesiones con ejercicios y vídeos adjuntos.
            </p>
            <button
              onClick={() => setShowNewMc(true)}
              className="flex items-center gap-2 px-4 py-2 bg-depro-blue text-white font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors text-sm shrink-0 ml-4"
            >
              <Plus size={15} />
              Nuevo microciclo
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-16 text-depro-gray border border-dashed border-depro-border rounded-2xl">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">Sin planificación todavía</p>
              <p className="text-sm">Crea el primer microciclo para este club y añade sus sesiones de entrenamiento.</p>
              <button
                onClick={() => setShowNewMc(true)}
                className="mt-4 px-4 py-2 bg-depro-blue text-white text-sm font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors"
              >
                Crear primer microciclo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((mc) => (
                <MicrocycleCard
                  key={mc.id}
                  mc={mc}
                  teams={club.teams}
                  onAddSession={addSession}
                  onDeleteSession={deleteSession}
                  onDelete={deleteMicrocycle}
                />
              ))}
            </div>
          )}

          {showNewMc && (
            <NewMicrocycleModal
              teams={club.teams}
              onClose={() => setShowNewMc(false)}
              onCreate={addMicrocycle}
            />
          )}
        </div>
      )}

      {/* EQUIPOS */}
      {activeTab === "equipos" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewTeam(true)}
              className="flex items-center gap-2 px-4 py-2 bg-depro-blue text-white font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors text-sm"
            >
              <Plus size={15} />
              Añadir equipo
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
                    <button
                      onClick={() => removeTeam(team.id)}
                      className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-red-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
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
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-depro-blue text-white font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors text-sm"
            >
              <Plus size={15} />
              Añadir usuario
            </button>
          </div>

          {club.users.length === 0 ? (
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide hidden md:table-cell">Último acceso</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-depro-gray uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-depro-border">
                  {club.users.map((user) => (
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
                      <td className="px-4 py-3 text-depro-gray text-xs hidden md:table-cell">
                        {user.lastLogin}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleUserActive(user.id)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                            user.active
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {user.active ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeUser(user.id)}
                          className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-red hover:text-depro-red transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MEDIOS */}
      {activeTab === "medios" && (
        <div className="space-y-4">
          <p className="text-sm text-depro-gray">
            Archivos de la biblioteca global asignados a este club. Para añadir más, ve a{" "}
            <button
              onClick={() => navigate("/admin/media")}
              className="text-depro-blue hover:underline font-medium"
            >
              Biblioteca de medios
            </button>.
          </p>

          {assignedMedia.length === 0 ? (
            <div className="text-center py-12 text-depro-gray border border-dashed border-depro-border rounded-2xl">
              <Video size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin medios asignados a este club</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedMedia.map((item) => (
                <div key={item.id} className="bg-white border border-depro-border rounded-xl p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === "video" ? "bg-depro-blue/10" : "bg-depro-red/10"
                  }`}>
                    {item.type === "video"
                      ? <Video size={16} className="text-depro-blue" />
                      : <FileText size={16} className="text-depro-red" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-depro-dark text-sm leading-tight line-clamp-1">{item.title}</p>
                    <p className="text-xs text-depro-gray mt-0.5">{item.size} · {item.uploadedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showNewTeam && <NewTeamModal onClose={() => setShowNewTeam(false)} onCreate={addTeam} clubId={club.id} />}
      {showNewUser && <NewUserModal teams={club.teams} onClose={() => setShowNewUser(false)} onCreate={addUser} />}
    </div>
  );
}
