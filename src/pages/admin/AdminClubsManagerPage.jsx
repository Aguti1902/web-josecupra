import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  ChevronRight,
  Users,
  Shield,
  CheckCircle,
  Clock,
  X,
  Copy,
  MapPin,
  Crown,
  Star,
  Trash2,
  RefreshCw,
  Sparkles,
  Hand,
} from "lucide-react";
import { loadClubs, saveClub, deleteClub, createClubUser } from "../../lib/adminStorage";
import PlanSelectField, { SubscriptionStatusSelect, ManualPriceField } from "../../components/admin/PlanSelectField";
import ClubEconomyFields from "../../components/admin/ClubEconomyFields";
import { withSyncedDiscountCode, parseCommissionPct } from "../../lib/clubEconomy";
import AdminProvisionHelp from "../../components/admin/AdminProvisionHelp";
import {
  ADMIN_STATUS_STYLES,
  adminStatusLabel,
  normalizeAdminStatus,
  parseManualPrice,
  canUserLogin,
} from "../../lib/adminAccountStatus";

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const PLANS = ["Básico", "Premium"]; // legacy badge fallback

function StatusBadge({ status }) {
  const id = normalizeAdminStatus(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${ADMIN_STATUS_STYLES[id] || ADMIN_STATUS_STYLES.borrador}`}>
      {id === "activo" ? <CheckCircle size={10} /> : <Clock size={10} />}
      {adminStatusLabel(id)}
    </span>
  );
}

function PlanBadge({ plan }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-depro-blue/10 text-depro-blue">
      {plan || "Personalizado"}
    </span>
  );
}

function PlanningModeBadge({ mode }) {
  const auto = (mode || "auto") === "auto";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
      auto
        ? "bg-sky-50 text-sky-700 border-sky-200"
        : "bg-amber-50 text-amber-800 border-amber-200"
    }`}>
      {auto ? <Sparkles size={10} /> : <Hand size={10} />}
      {auto ? "Automático" : "Llevado por mí"}
    </span>
  );
}

function clubPlanningMode(club) {
  if (club?.origen === "manual") return "manual";
  if (club?.origen === "automatico") return "auto";
  return club?.planningMode === "manual" ? "manual" : "auto";
}

function NewClubModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "", abbreviation: "", city: "", country: "España",
    coordinatorName: "", coordinatorEmail: "", coordinatorPhone: "",
    coordinatorPassword: generatePassword(),
    planId: "club-inicial",
    subscriptionStatus: "activo",
    manualPrice: "",
    planningMode: "auto",
    discountCode: "",
    referralCommissionPct: "10",
    payoutIban: "",
    payoutAccountName: "",
  });
  const [loading, setLoading] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);

  const generatedCode = form.abbreviation
    ? `${form.abbreviation.toUpperCase().slice(0, 3)}${new Date().getFullYear()}`
    : "";

  const handleSubmit = async () => {
    if (!form.name || !form.coordinatorEmail) return;
    setLoading(true);

    const clubId = `club${Date.now()}`;

    // Crear usuario del coordinador en Supabase Auth
    let userCreated = false;
    let userError = null;
    if (form.coordinatorEmail && form.coordinatorPassword) {
      const result = await createClubUser({
        email: form.coordinatorEmail,
        password: form.coordinatorPassword,
        name: form.coordinatorName,
        role: "club",
        clubId,
        teamRole: "coordinador",
        plan: form.planningMode === "manual" ? null : form.planId,
        subscriptionStatus: normalizeAdminStatus(form.subscriptionStatus),
        billingSource: "manual",
        manualPrice: parseManualPrice(form.manualPrice),
      });
      userCreated = result.ok;
      userError = result.ok ? null : result.error;
    }

    onCreate({
      id: clubId,
      name: form.name,
      abbreviation: form.abbreviation.toUpperCase().slice(0, 3),
      city: form.city,
      country: form.country,
      founded: new Date().getFullYear(),
      status: normalizeAdminStatus(form.subscriptionStatus),
      plan: form.planningMode === "manual" ? null : form.planId,
      subscriptionStatus: normalizeAdminStatus(form.subscriptionStatus),
      manualPrice: parseManualPrice(form.manualPrice),
      origen: form.planningMode === "manual" ? "manual" : "automatico",
      planningMode: form.planningMode === "manual" ? "manual" : "auto",
      mode: form.planningMode === "manual" ? "personalizado" : "depro",
      coachConfig: form.planningMode === "manual"
        ? { engine: "manual", mode: "personalizado" }
        : {
            engine: "club_auto",
            mode: "depro",
            nivel: "B",
            dias_entrenamiento_semana: 3,
            dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
            dia_partido: "sabado",
            acceso_gimnasio: "no",
            gymAccess: false,
            trainingsPerWeek: 3,
            trainingDays: ["Lunes", "Miércoles", "Viernes"],
            matchDay: "sabado",
          },
      createdAt: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
      coordinator: {
        name: form.coordinatorName,
        email: form.coordinatorEmail,
        phone: form.coordinatorPhone,
        password: form.coordinatorPassword,
        userCreated,
      },
      ...withSyncedDiscountCode({}, form.discountCode.trim() || generatedCode),
      referralCommissionPct: parseCommissionPct(form.referralCommissionPct),
      payoutIban: (form.payoutIban || "").trim().toUpperCase(),
      payoutAccountName: (form.payoutAccountName || "").trim(),
      teams: [], users: [], mediaAssigned: [],
    });

    setLoading(false);
    setCreatedCreds({
      name: form.coordinatorName,
      email: form.coordinatorEmail,
      password: form.coordinatorPassword,
      userCreated,
      userError,
    });
  };

  // Pantalla de confirmación de credenciales
  if (createdCreds) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-depro w-full max-w-md">
          <div className="p-6 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${createdCreds.userCreated ? "bg-green-50" : "bg-yellow-50"}`}>
              {createdCreds.userCreated
                ? <CheckCircle size={28} className="text-green-500" />
                : <Clock size={28} className="text-yellow-500" />
              }
            </div>
            <h2 className="font-bold text-depro-dark text-lg mb-1">Club creado</h2>
            {createdCreds.userCreated ? (
              <p className="text-sm text-depro-gray mb-5">
                Cuenta creada correctamente. Guarda estas credenciales — no podrás volver a ver la contraseña.
              </p>
            ) : (
              <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                <p className="text-sm font-semibold text-yellow-700 mb-1">⚠️ La cuenta no se pudo crear automáticamente</p>
                <p className="text-xs text-yellow-600">
                  El club se ha guardado, pero el acceso del coordinador requiere configuración adicional en Vercel (<code className="bg-yellow-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>).
                  Guarda las credenciales y crea el usuario manualmente en Supabase → Authentication → Add user.
                </p>
              </div>
            )}
            <div className="bg-depro-gray-light rounded-xl p-4 text-left space-y-3 mb-5">
              {createdCreds.name && (
                <div>
                  <p className="text-xs text-depro-gray mb-0.5">Nombre</p>
                  <p className="font-semibold text-depro-dark">{createdCreds.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-depro-gray mb-0.5">Email (usuario)</p>
                <p className="font-semibold text-depro-dark font-mono">{createdCreds.email}</p>
              </div>
              <div>
                <p className="text-xs text-depro-gray mb-0.5">Contraseña</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-depro-dark font-mono text-lg tracking-wider">{createdCreds.password}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${createdCreds.email}\n${createdCreds.password}`)}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-depro-border shrink-0">
          <h2 className="font-bold text-depro-dark text-lg">Crear nuevo club</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto min-h-0 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-depro-dark mb-1">Nombre del club *</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Ej. FC Barcelona Junior"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Abreviatura (3 letras)</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="FCB" maxLength={3}
                value={form.abbreviation}
                onChange={(e) => setForm((f) => ({ ...f, abbreviation: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Ciudad</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Madrid"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">País</label>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-depro-border">
            <p className="text-sm font-semibold text-depro-dark mb-1">Coordinador principal</p>
            <p className="text-xs text-depro-gray mb-3">Se creará su cuenta de acceso automáticamente.</p>
            <div className="space-y-3">
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Nombre completo"
                value={form.coordinatorName}
                onChange={(e) => setForm((f) => ({ ...f, coordinatorName: e.target.value }))}
              />
              <input
                type="email"
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Email de acceso *"
                value={form.coordinatorEmail}
                onChange={(e) => setForm((f) => ({ ...f, coordinatorEmail: e.target.value }))}
              />
              <div>
                <label className="block text-xs text-depro-gray mb-1">Contraseña de acceso</label>
                <div className="flex gap-2">
                  <input
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                      form.coordinatorPassword.length > 0 && form.coordinatorPassword.length < 6
                        ? "border-red-400 focus:ring-red-300"
                        : "border-depro-border focus:ring-depro-blue/30"
                    }`}
                    value={form.coordinatorPassword}
                    onChange={(e) => setForm((f) => ({ ...f, coordinatorPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, coordinatorPassword: generatePassword() }))}
                    className="px-3 py-2 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
                    title="Generar nueva contraseña"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                {form.coordinatorPassword.length > 0 && form.coordinatorPassword.length < 6 && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Mínimo 6 caracteres</p>
                )}
              </div>
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Teléfono (opcional)"
                value={form.coordinatorPhone}
                onChange={(e) => setForm((f) => ({ ...f, coordinatorPhone: e.target.value }))}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-depro-border space-y-4">
            <p className="text-sm font-semibold text-depro-dark">Modo de planificación</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "auto", label: "Automático", hint: "Motor club auto", Icon: Sparkles },
                { id: "manual", label: "Llevado por mí", hint: "Sesiones manuales", Icon: Hand },
              ].map(({ id, label, hint, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, planningMode: id }))}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    form.planningMode === id
                      ? "border-depro-blue bg-depro-blue/5"
                      : "border-depro-border hover:border-depro-blue/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-depro-dark flex items-center gap-1.5">
                    <Icon size={14} className="text-depro-blue" /> {label}
                  </p>
                  <p className="text-[11px] text-depro-gray mt-0.5">{hint}</p>
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold text-depro-dark">Plan personalizado</p>
            {form.planningMode !== "manual" && (
              <PlanSelectField
                audience="club"
                value={form.planId}
                onChange={(v) => setForm((f) => ({ ...f, planId: v }))}
              />
            )}
            <SubscriptionStatusSelect
              value={form.subscriptionStatus}
              onChange={(v) => setForm((f) => ({ ...f, subscriptionStatus: v }))}
            />
            <ManualPriceField
              value={form.manualPrice}
              onChange={(v) => setForm((f) => ({ ...f, manualPrice: v }))}
            />
            {form.planningMode === "manual" && (
              <p className="text-xs text-depro-gray -mt-2">
                El administrador del club verá solo este precio. No se asigna Elite ni ninguna cuota de catálogo (699 €).
              </p>
            )}
            <div className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-4">
              <p className="text-sm font-semibold text-depro-dark mb-3">Código de descuento y transferencia</p>
              <ClubEconomyFields
                discountCode={form.discountCode || generatedCode}
                commissionPct={form.referralCommissionPct}
                payoutIban={form.payoutIban}
                payoutAccountName={form.payoutAccountName}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-depro-border shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.coordinatorEmail || form.coordinatorPassword.length < 6 || loading}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando…</>
              : "Crear club"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function ClubSection({ title, subtitle, icon: Icon, accent, clubs, emptyText, onOpen, onDelete }) {
  const accentCls = accent === "amber"
    ? "border-amber-200 bg-amber-50/40"
    : "border-sky-200 bg-sky-50/40";
  const iconCls = accent === "amber" ? "text-amber-700" : "text-sky-700";

  return (
    <section className={`rounded-2xl border ${accentCls} p-4 sm:p-5 space-y-3`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconCls}`}>
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-depro-dark">{title}</h2>
          <p className="text-xs text-depro-gray">{subtitle}</p>
        </div>
        <span className="ml-auto text-xs font-bold text-depro-gray bg-white border border-depro-border rounded-lg px-2 py-1">
          {clubs.length}
        </span>
      </div>

      {clubs.length === 0 ? (
        <p className="text-sm text-depro-gray py-6 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="bg-white border border-depro-border rounded-xl p-5 hover:shadow-card transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 rounded-xl bg-depro-gray-light flex items-center justify-center font-bold text-depro-dark text-sm shrink-0 overflow-hidden border border-depro-border">
                  {club.logo
                    ? <img src={club.logo} alt={club.name} className="w-full h-full object-contain p-0.5" />
                    : club.abbreviation
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-depro-dark">{club.name}</h3>
                    <StatusBadge status={club.subscriptionStatus || club.status} />
                    <PlanBadge plan={club.plan} />
                    <PlanningModeBadge mode={clubPlanningMode(club)} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-depro-gray flex-wrap">
                    {club.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {club.city}, {club.country}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {(club.teams || []).length} equipo{(club.teams || []).length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={10} />
                      {club._userCount ?? club.users?.length ?? 0} usuario{(club._userCount ?? club.users?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <span>Alta: {club.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => onOpen(club.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors text-sm font-medium"
                  >
                    Ver detalle
                    <ChevronRight size={15} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(club.id); }}
                    className="p-2 rounded-xl border border-depro-border text-depro-gray hover:border-red-400 hover:text-red-500 transition-colors"
                    title="Eliminar club"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminClubsManagerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clubs, setClubs]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterPlanning, setFilterPlanning] = useState("todos");
  const [copied, setCopied]         = useState(null);
  const [showNewClub, setShowNewClub] = useState(false);

  useEffect(() => {
    if (searchParams.get("alta") === "club") setShowNewClub(true);
  }, [searchParams]);

  const openNewClub = () => {
    setSearchParams({ alta: "club" }, { replace: true });
    setShowNewClub(true);
  };

  const closeNewClub = () => {
    setShowNewClub(false);
    if (searchParams.get("alta") === "club") setSearchParams({}, { replace: true });
  };

  const enrichClubs = (data) => data.map((c) => {
    const teams = c.teams || [];
    const users = c.users || [];
    let userCount = users.length;
    if (c.coordinator?.email) userCount++;
    teams.forEach((t) => { if (t.coach?.email) userCount++; });
    return { ...c, teams, users, _userCount: userCount };
  });

  const fetchClubs = async () => {
    setLoading(true);
    const data = await loadClubs();
    setClubs(enrichClubs(data));
    setLoading(false);
  };

  // Al montar: migrar clubs locales a Supabase si la API devuelve vacío
  useEffect(() => {
    const migrate = async () => {
      setLoading(true);
      const apiData = await loadClubs(); // intenta API primero
      if (apiData.length === 0) {
        // API vacía: intentar migrar desde localStorage
        const localClubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
        if (localClubs.length > 0) {
          for (const club of localClubs) {
            if (!club.id) continue;
            let merged = { ...club };
            try {
              const detail = JSON.parse(localStorage.getItem(`depro_club_${club.id}`) || "null");
              if (detail) merged = { ...merged, ...detail, id: club.id };
            } catch {}
            await saveClub(merged);
          }
          // Recargar desde API tras migración
          const migrated = await loadClubs();
          setClubs(enrichClubs(migrated));
        } else {
          setClubs([]);
        }
      } else {
        setClubs(enrichClubs(apiData));
      }
      setLoading(false);
    };
    migrate();
  }, []);

  const filtered = clubs.filter((c) => {
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase());
    const clubStatus = normalizeAdminStatus(c.subscriptionStatus || c.status);
    const matchStatus = filterStatus === "todos" || clubStatus === filterStatus;
    const mode = clubPlanningMode(c);
    const matchPlanning = filterPlanning === "todos" || mode === filterPlanning;
    return matchSearch && matchStatus && matchPlanning;
  });

  const autoClubs = filtered.filter((c) => clubPlanningMode(c) === "auto");
  const manualClubs = filtered.filter((c) => clubPlanningMode(c) === "manual");

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este club?")) return;
    await deleteClub(id);
    setClubs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateClub = async (clubData) => {
    await saveClub(clubData);
    setClubs((prev) => enrichClubs([clubData, ...prev]));
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-depro-dark">Clubs y equipos</h1>
          <p className="text-depro-gray text-sm mt-0.5">
            Crea un club con coordinador y plan, o supervisa los dados de alta por clientes
          </p>
        </div>
        <button
          type="button"
          onClick={openNewClub}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark shrink-0"
        >
          <Plus size={16} /> Nuevo club
        </button>
      </div>

      <AdminProvisionHelp current="club" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total clubs", value: clubs.length, color: "text-depro-dark" },
          { label: "Automáticos", value: clubs.filter((c) => clubPlanningMode(c) === "auto").length, color: "text-sky-700" },
          { label: "Llevados por mí", value: clubs.filter((c) => clubPlanningMode(c) === "manual").length, color: "text-amber-700" },
          { label: "Activos / demo", value: clubs.filter((c) => canUserLogin(c.subscriptionStatus || c.status)).length, color: "text-green-600" },
          { label: "Equipos totales", value: clubs.reduce((a, c) => a + (c.teams || []).length, 0), color: "text-depro-blue" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-depro-border rounded-xl p-4">
            <p className="text-xs text-depro-gray mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-depro-gray" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-depro-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Buscar club o ciudad…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["todos", "activo", "demo", "borrador"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors border ${
                  filterStatus === s
                    ? "bg-depro-blue border-depro-blue text-white"
                    : "border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue"
                }`}
              >
                {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "todos", label: "Todos los modos" },
            { id: "auto", label: "Automáticos" },
            { id: "manual", label: "Llevados por mí" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilterPlanning(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filterPlanning === id
                  ? "bg-depro-dark border-depro-dark text-white"
                  : "border-depro-border text-depro-gray hover:border-depro-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs list — separación Automáticos / Llevados por mí */}
      <div className="space-y-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-depro-gray">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No se encontraron clubs</p>
          </div>
        ) : (
          <>
            {(filterPlanning === "todos" || filterPlanning === "auto") && (
              <ClubSection
                title="Automáticos"
                subtitle="Equipos que usan el motor automático de clubs"
                icon={Sparkles}
                accent="sky"
                clubs={autoClubs}
                emptyText="Ningún club en modo automático"
                onOpen={(id) => navigate(`/admin/clubs/${id}`)}
                onDelete={handleDelete}
              />
            )}
            {(filterPlanning === "todos" || filterPlanning === "manual") && (
              <ClubSection
                title="Llevados por mí"
                subtitle="Equipos premium o gestionados manualmente por José"
                icon={Hand}
                accent="amber"
                clubs={manualClubs}
                emptyText="Ningún club llevado manualmente"
                onOpen={(id) => navigate(`/admin/clubs/${id}`)}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>

      {showNewClub && (
        <NewClubModal
          onClose={closeNewClub}
          onCreate={handleCreateClub}
        />
      )}
    </div>
  );
}
