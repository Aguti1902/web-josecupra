import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { loadClubs, saveClub, deleteClub, createClubUser } from "../../lib/adminStorage";

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const PLANS = ["Básico", "Premium"];
const STATUS_STYLES = {
  activo: "bg-green-50 text-green-700 border-green-200",
  pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
  inactivo: "bg-gray-100 text-gray-500 border-gray-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.inactivo}`}>
      {status === "activo" ? <CheckCircle size={10} /> : <Clock size={10} />}
      {status}
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

function NewClubModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "", abbreviation: "", city: "", country: "España",
    coordinatorName: "", coordinatorEmail: "", coordinatorPhone: "",
    coordinatorPassword: generatePassword(),
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
      status: "activo",
      plan: "Personalizado",
      createdAt: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
      coordinator: {
        name: form.coordinatorName,
        email: form.coordinatorEmail,
        phone: form.coordinatorPhone,
        password: form.coordinatorPassword,
        userCreated,
      },
      loginCode: generatedCode,
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
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg my-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Crear nuevo club</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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

          {generatedCode && (
            <div className="flex items-center gap-3 bg-depro-blue/5 border border-depro-blue/20 rounded-xl p-3">
              <Shield size={16} className="text-depro-blue shrink-0" />
              <div>
                <p className="text-xs text-depro-gray">Código de acceso del club</p>
                <p className="font-bold text-depro-blue font-mono">{generatedCode}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                className="ml-auto p-1.5 rounded-lg hover:bg-depro-blue/10 text-depro-blue"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-depro-border">
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

export default function AdminClubsManagerPage() {
  const navigate = useNavigate();
  const [clubs, setClubs]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showModal, setShowModal]   = useState(false);
  const [copied, setCopied]         = useState(null);

  useEffect(() => {
    loadClubs().then((data) => {
      // Enriquecer cada club con logo y conteo real de usuarios desde clubDetail
      const enriched = data.map((c) => {
        try {
          const detail = JSON.parse(localStorage.getItem(`depro_club_${c.id}`) || "null");
          if (!detail) return c;
          let userCount = (c.users || []).length;
          if (detail.coordinator?.email) userCount++;
          (detail.teams || []).forEach((t) => { if (t.coach?.email) userCount++; });
          return { ...c, logo: detail.logo || c.logo, _userCount: userCount };
        } catch { return c; }
      });
      setClubs(enriched);
      setLoading(false);
    });
  }, []);

  const filtered = clubs.filter((c) => {
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreate = async (clubData) => {
    // Usamos el mismo ID con el que se creó el usuario Supabase
    // para que user_metadata.clubId coincida con el ID en depro_clubs
    const saved = await saveClub(clubData);
    setClubs((prev) => [saved, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este club?")) return;
    await deleteClub(id);
    setClubs((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-depro-dark">Clubs y equipos</h1>
          <p className="text-depro-gray text-sm mt-0.5">
            Gestiona clubs, equipos internos y accesos de usuarios
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-depro-blue text-white font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors text-sm"
        >
          <Plus size={16} />
          Nuevo club
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total clubs", value: clubs.length, color: "text-depro-dark" },
          { label: "Activos", value: clubs.filter((c) => c.status === "activo").length, color: "text-green-600" },
          { label: "Pendientes", value: clubs.filter((c) => c.status === "pendiente").length, color: "text-yellow-600" },
          { label: "Equipos totales", value: clubs.reduce((a, c) => a + c.teams.length, 0), color: "text-depro-blue" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-depro-border rounded-xl p-4">
            <p className="text-xs text-depro-gray mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
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
          {["todos", "activo", "pendiente"].map((s) => (
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

      {/* Clubs list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-depro-gray">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No se encontraron clubs</p>
          </div>
        ) : (
          filtered.map((club) => (
            <div
              key={club.id}
              className="bg-white border border-depro-border rounded-xl p-5 hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-depro-gray-light flex items-center justify-center font-bold text-depro-dark text-sm shrink-0 overflow-hidden border border-depro-border">
                  {club.logo
                    ? <img src={club.logo} alt={club.name} className="w-full h-full object-contain p-0.5" />
                    : club.abbreviation
                  }
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-depro-dark">{club.name}</h3>
                    <StatusBadge status={club.status} />
                    <PlanBadge plan={club.plan} />
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
                      {club.teams.length} equipo{club.teams.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={10} />
                      {club._userCount ?? club.users?.length ?? 0} usuario{(club._userCount ?? club.users?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <span>Alta: {club.createdAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/admin/clubs/${club.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors text-sm font-medium"
                  >
                    Gestionar
                    <ChevronRight size={15} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(club.id); }}
                    className="p-2 rounded-xl border border-depro-border text-depro-gray hover:border-red-400 hover:text-red-500 transition-colors"
                    title="Eliminar club"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <NewClubModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
