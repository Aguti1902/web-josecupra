import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Building2, Users, UserPlus, Plus, Trash2, Pencil, Copy, CheckCircle,
  ImagePlus, Palette, Save, X, RefreshCw, Loader2, KeyRound, Gift,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  loadClubDetail, saveClubDetail, createClubUser,
} from "../../lib/adminStorage";
import ClubReferralPanel from "../../components/private/ClubReferralPanel";
import { canAccessClubSettings } from "../../lib/clubRoles";

const AGE_BLOCKS = [
  { label: "Bloque 1", ages: ["Sub-9", "Sub-10", "Sub-11", "Sub-12"] },
  { label: "Bloque 2", ages: ["Sub-13", "Sub-14", "Sub-15"] },
  { label: "Bloque 3", ages: ["Sub-16", "Juvenil", "Amateur"] },
];
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
const STAFF_ROLES = [
  { id: "entrenador", label: "Entrenador" },
  { id: "ayudante", label: "Ayudante" },
];

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function compressImage(file, maxWidth = 1400, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-depro-dark mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded-lg border border-depro-border cursor-pointer" />
        <input
          className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-mono uppercase"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function TeamModal({ team, clubId, onClose, onSave }) {
  const isEdit = !!team;
  const [form, setForm] = useState({
    name: team?.name || "",
    category: team?.category || "Sub-14",
    season: team?.season || "2025/2026",
    trainingDays: [...(team?.trainingDays || [])],
    coachName: team?.coach?.name || "",
    coachEmail: team?.coach?.email || "",
    coachPassword: generatePassword(),
  });
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState(null);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      trainingDays: f.trainingDays.includes(day)
        ? f.trainingDays.filter((d) => d !== day)
        : [...f.trainingDays, day],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || ![2, 3, 4].includes(form.trainingDays.length)) return;
    setLoading(true);
    const teamId = team?.id || genId("team");
    let userCreated = false;
    let userError = null;

    if (form.coachEmail && form.coachPassword) {
      const result = await createClubUser({
        email: form.coachEmail,
        password: form.coachPassword,
        name: form.coachName || form.coachEmail,
        role: "club",
        clubId,
        teamId,
        teamRole: "entrenador",
      });
      userCreated = !!(result.ok || result.alreadyExists);
      userError = userCreated ? null : result.error;
    }

    onSave({
      id: teamId,
      name: form.name.trim(),
      category: form.category,
      season: form.season,
      trainingDays: form.trainingDays,
      coach: form.coachEmail
        ? { name: form.coachName, email: form.coachEmail, role: "entrenador", userCreated }
        : (team?.coach || null),
      squad: team?.squad || [],
    });

    if (form.coachEmail && !isEdit) {
      setCreds({ email: form.coachEmail, password: form.coachPassword, userCreated, userError });
      setLoading(false);
    } else {
      onClose();
    }
  };

  if (creds) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-depro w-full max-w-md p-6 text-center">
          <CheckCircle size={28} className="mx-auto text-green-500 mb-3" />
          <h2 className="font-bold text-depro-dark text-lg mb-2">Equipo creado</h2>
          <p className="text-sm text-depro-gray mb-4">Guarda estas credenciales del entrenador; no volverás a ver la contraseña.</p>
          <div className="bg-depro-gray-light rounded-xl p-4 text-left space-y-2 mb-4">
            <p className="text-xs text-depro-gray">Email</p>
            <p className="font-mono font-bold text-depro-dark">{creds.email}</p>
            <p className="text-xs text-depro-gray">Contraseña</p>
            <p className="font-mono font-bold text-depro-dark text-lg">{creds.password}</p>
            {!creds.userCreated && (
              <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                No se pudo activar el acceso automáticamente{creds.userError ? `: ${creds.userError}` : "."}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm">Entendido</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-md my-auto">
        <div className="flex items-center justify-between p-5 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark">{isEdit ? "Editar equipo" : "Añadir equipo"}</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Nombre *</label>
            <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Categoría</label>
              <select className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {AGE_BLOCKS.map((b) => (
                  <optgroup key={b.label} label={b.label}>
                    {b.ages.map((a) => <option key={a}>{a}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Temporada</label>
              <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Días (2–4)</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day, i) => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold border ${form.trainingDays.includes(day) ? "bg-depro-blue border-depro-blue text-white" : "border-depro-border text-depro-gray"}`}>
                  {DAY_SHORT[i]}
                </button>
              ))}
            </div>
          </div>
          {!isEdit && (
            <div className="pt-2 border-t border-depro-border space-y-3">
              <p className="text-sm font-medium text-depro-dark">Entrenador (opcional)</p>
              <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" placeholder="Nombre" value={form.coachName} onChange={(e) => setForm((f) => ({ ...f, coachName: e.target.value }))} />
              <input type="email" className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" placeholder="Email de acceso" value={form.coachEmail} onChange={(e) => setForm((f) => ({ ...f, coachEmail: e.target.value }))} />
              {form.coachEmail && (
                <div className="flex gap-2">
                  <input className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-mono" value={form.coachPassword} onChange={(e) => setForm((f) => ({ ...f, coachPassword: e.target.value }))} />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, coachPassword: generatePassword() }))} className="px-3 rounded-lg border border-depro-border"><RefreshCw size={14} /></button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm font-medium">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || ![2, 3, 4].includes(form.trainingDays.length) || loading || (form.coachEmail && form.coachPassword.length < 6)}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {isEdit ? "Guardar" : "Crear equipo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffModal({ teams, clubId, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "", email: "", role: "entrenador", teamId: teams[0]?.id || "", password: generatePassword(),
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreate = async () => {
    if (!form.email || !form.teamId) return;
    setLoading(true);
    const res = await createClubUser({
      email: form.email,
      password: form.password,
      name: form.name || form.email,
      role: "club",
      clubId,
      teamId: form.teamId,
      teamRole: form.role,
    });
    const team = teams.find((t) => t.id === form.teamId);
    onCreate({
      id: genId("u"),
      name: form.name || form.email,
      email: form.email,
      role: form.role,
      team: team?.name || null,
      teamId: form.teamId,
      active: !!(res.ok || res.alreadyExists),
      lastLogin: "nunca",
    });
    setResult({ ok: !!(res.ok || res.alreadyExists), email: form.email, password: form.password, error: res.error });
    setLoading(false);
  };

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-depro w-full max-w-md p-6 text-center">
          <CheckCircle size={28} className={`mx-auto mb-3 ${result.ok ? "text-green-500" : "text-yellow-500"}`} />
          <h2 className="font-bold text-depro-dark text-lg mb-2">{result.ok ? "Acceso creado" : "Guardado sin acceso"}</h2>
          <div className="bg-depro-gray-light rounded-xl p-4 text-left space-y-2 mb-4">
            <p className="text-xs text-depro-gray">Email</p>
            <p className="font-mono font-bold">{result.email}</p>
            <p className="text-xs text-depro-gray">Contraseña</p>
            <p className="font-mono font-bold text-lg">{result.password}</p>
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark">Invitar staff</h2>
          <button onClick={onClose}><X size={18} className="text-depro-gray" /></button>
        </div>
        <div className="p-5 space-y-3">
          <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" placeholder="Nombre" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input type="email" className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" placeholder="Email *" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <select className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {STAFF_ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <select className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={form.teamId} onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-mono" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <button type="button" onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))} className="px-3 rounded-lg border border-depro-border"><RefreshCw size={14} /></button>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm">Cancelar</button>
          <button onClick={handleCreate} disabled={!form.email || !form.teamId || form.password.length < 6 || loading}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Invitar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClubSettingsPage() {
  const { user, refreshUser } = useAuth();
  const clubId = user?.clubId || user?.club?.id;
  const [club, setClub] = useState(null);
  const [tab, setTab] = useState("identidad");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(null); // null | 'new' | team
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const logoRef = useRef();
  const bannerRef = useRef();

  useEffect(() => {
    if (!clubId) return;
    const detail = loadClubDetail(clubId) || user?.club || null;
    if (detail) {
      setClub({
        ...detail,
        teams: Array.isArray(detail.teams) ? detail.teams : [],
        users: Array.isArray(detail.users) ? detail.users : [],
      });
    }
  }, [clubId, user?.club]);

  if (!canAccessClubSettings(user) || user?.club?.isSoloCoach) {
    return <Navigate to="/dashboard" replace />;
  }
  if (!club) {
    return (
      <div className="p-8 flex justify-center">
        <div className="spinner border-depro-blue/20 border-t-depro-blue" />
      </div>
    );
  }

  const persist = async (next) => {
    setClub(next);
    setSaving(true);
    const result = await saveClubDetail(clubId, next);
    setSaving(false);
    if (result?.ok === false) {
      setMsg({ ok: false, text: "Guardado localmente; sincronización pendiente." });
    } else {
      setMsg({ ok: true, text: "Cambios guardados." });
      await refreshUser();
    }
    setTimeout(() => setMsg(null), 2500);
    return result;
  };

  const loginCode = club.login_code || club.loginCode || "—";

  const handleIdentitySave = async () => {
    await persist({ ...club });
  };

  const handleAddOrUpdateTeam = async (team) => {
    const exists = (club.teams || []).some((t) => t.id === team.id);
    const teams = exists
      ? club.teams.map((t) => (t.id === team.id ? team : t))
      : [...(club.teams || []), team];
    await persist({ ...club, teams });
  };

  const handleRemoveTeam = async (tid) => {
    if (!confirm("¿Eliminar este equipo?")) return;
    await persist({ ...club, teams: (club.teams || []).filter((t) => t.id !== tid) });
  };

  const handleAddStaff = async (staffUser) => {
    await persist({ ...club, users: [...(club.users || []), staffUser] });
  };

  const handleRemoveStaff = async (uid) => {
    if (!confirm("¿Eliminar este usuario del club?")) return;
    await persist({ ...club, users: (club.users || []).filter((u) => u.id !== uid) });
  };

  const tabs = [
    { id: "identidad", label: "Identidad", icon: Building2 },
    { id: "equipos", label: "Equipos", icon: Users },
    { id: "staff", label: "Staff", icon: UserPlus },
    { id: "referidos", label: "Referidos", icon: Gift },
  ];

  return (
    <div className="dash-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Mi Club</h1>
          <p className="text-sm text-depro-gray mt-0.5">Identidad, equipos y accesos de tu staff.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-depro-border bg-white px-3 py-2">
          <KeyRound size={14} className="text-depro-blue" />
          <div>
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">Código jugadores</p>
            <p className="font-mono font-black text-depro-dark">{loginCode}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(loginCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="ml-2 p-1.5 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue"
          >
            {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${msg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-2 border-b border-depro-border overflow-x-auto dash-mobile-scroll -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-depro-blue text-depro-blue" : "border-transparent text-depro-gray hover:text-depro-dark"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "identidad" && (
        <div className="space-y-5">
          <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
            <div
              className="relative h-32 flex items-end"
              style={{
                background: club.banner
                  ? `url(${club.banner}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${club.primaryColor || "#0A36F7"} 0%, ${(club.primaryColor || "#0A36F7")}CC 100%)`,
              }}
            >
              {club.banner && <div className="absolute inset-0 bg-black/30" />}
              <div className="relative z-10 flex items-center gap-3 p-4">
                {club.logo
                  ? <img src={club.logo} alt="" className="w-12 h-12 rounded-xl object-contain bg-white p-1" />
                  : <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-white">{club.abbreviation || "CLB"}</div>}
                <p className="font-black text-white text-lg drop-shadow">{club.name}</p>
              </div>
              <button onClick={() => bannerRef.current?.click()} className="absolute top-3 right-3 z-20 text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/40 text-white">
                <ImagePlus size={12} className="inline mr-1" /> Banner
              </button>
              <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const banner = await compressImage(f, 1400, 0.75);
                setClub((c) => ({ ...c, banner }));
              }} />
            </div>
          </div>

          <div className="bg-white border border-depro-border rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-depro-gray uppercase mb-1">Nombre</label>
                <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={club.name || ""} onChange={(e) => setClub((c) => ({ ...c, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase mb-1">Ciudad</label>
                <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={club.city || ""} onChange={(e) => setClub((c) => ({ ...c, city: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase mb-1">País</label>
                <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={club.country || ""} onChange={(e) => setClub((c) => ({ ...c, country: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-depro-gray uppercase mb-1">Eslogan</label>
              <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm" value={club.slogan || ""} onChange={(e) => setClub((c) => ({ ...c, slogan: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-depro-dark mb-2 flex items-center gap-2"><ImagePlus size={14} /> Logo</p>
                <div onClick={() => logoRef.current?.click()} className="border-2 border-dashed border-depro-border rounded-xl p-4 text-center cursor-pointer hover:border-depro-blue">
                  {club.logo ? <img src={club.logo} alt="" className="h-16 mx-auto object-contain" /> : <p className="text-sm text-depro-gray">Subir logo</p>}
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const logo = await compressImage(f, 400, 0.85);
                  setClub((c) => ({ ...c, logo }));
                }} />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-depro-dark flex items-center gap-2"><Palette size={14} /> Colores</p>
                <ColorPicker label="Principal" value={club.primaryColor || "#0A36F7"} onChange={(v) => setClub((c) => ({ ...c, primaryColor: v }))} />
                <ColorPicker label="Secundario" value={club.secondaryColor || "#ffffff"} onChange={(v) => setClub((c) => ({ ...c, secondaryColor: v }))} />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleIdentitySave} disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Guardar identidad
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "equipos" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowTeamModal("new")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold">
              <Plus size={15} /> Añadir equipo
            </button>
          </div>
          {(club.teams || []).length === 0 ? (
            <div className="bg-white border border-depro-border rounded-2xl p-10 text-center text-depro-gray text-sm">
              Todavía no tienes equipos. Crea el primero.
            </div>
          ) : (
            <div className="grid gap-3">
              {club.teams.map((t) => (
                <div key={t.id} className="bg-white border border-depro-border rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-depro-dark">{t.name}</p>
                    <p className="text-xs text-depro-gray mt-0.5">{t.category} · {(t.trainingDays || []).join(", ") || "Sin días"}</p>
                    {t.coach?.email && <p className="text-xs text-depro-blue mt-1">Entrenador: {t.coach.name || t.coach.email}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowTeamModal(t)} className="p-2 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue"><Pencil size={14} /></button>
                    <button onClick={() => handleRemoveTeam(t.id)} className="p-2 rounded-lg border border-depro-border text-depro-gray hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "staff" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowStaffModal(true)} disabled={(club.teams || []).length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold disabled:opacity-40">
              <UserPlus size={15} /> Invitar staff
            </button>
          </div>
          {(club.users || []).length === 0 ? (
            <div className="bg-white border border-depro-border rounded-2xl p-10 text-center text-depro-gray text-sm">
              Invita entrenadores o ayudantes para que gestionen sus equipos.
            </div>
          ) : (
            <div className="grid gap-3">
              {club.users.map((u) => (
                <div key={u.id} className="bg-white border border-depro-border rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-depro-dark">{u.name}</p>
                    <p className="text-xs text-depro-gray">{u.email} · {u.role}{u.team ? ` · ${u.team}` : ""}</p>
                  </div>
                  <button onClick={() => handleRemoveStaff(u.id)} className="p-2 rounded-lg border border-depro-border text-depro-gray hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "referidos" && (
        <ClubReferralPanel
          clubId={clubId}
          loginCode={loginCode}
        />
      )}

      {showTeamModal && (
        <TeamModal
          team={showTeamModal === "new" ? null : showTeamModal}
          clubId={clubId}
          onClose={() => setShowTeamModal(null)}
          onSave={async (team) => { await handleAddOrUpdateTeam(team); setShowTeamModal(null); }}
        />
      )}
      {showStaffModal && (
        <StaffModal
          teams={club.teams || []}
          clubId={clubId}
          onClose={() => setShowStaffModal(false)}
          onCreate={async (u) => { await handleAddStaff(u); setShowStaffModal(false); }}
        />
      )}
    </div>
  );
}
