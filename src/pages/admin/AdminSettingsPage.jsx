import { useState, useRef } from "react";
import { Save, Building, Bell, Shield, Eye, EyeOff, User, Camera, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex items-center shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-depro-blue" : "bg-gray-200"
      }`}
      style={{ width: 44, height: 24 }}
    >
      <span
        className="inline-block bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{
          width: 18,
          height: 18,
          transform: checked ? "translateX(22px)" : "translateX(3px)",
        }}
      />
    </button>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const fileRef = useRef();

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [biz, setBiz] = useState({ name: "DEPRO", email: "contact@depro.com", phone: "+34 600 000 000", website: "https://depro.com" });
  const [notifs, setNotifs] = useState({ newClients: true, weeklyReport: true, feedback: false });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-depro-dark mb-1">Ajustes</h1>
        <p className="text-depro-gray text-sm">Configuración de la cuenta DEPRO</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Foto de perfil */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-depro-border">
            <div className="w-9 h-9 bg-depro-blue/10 rounded-xl flex items-center justify-center">
              <User size={18} className="text-depro-blue" />
            </div>
            <h2 className="font-bold text-depro-dark">Foto de perfil</h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-depro-blue/10 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-depro-blue">{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 bg-depro-blue rounded-full flex items-center justify-center text-white shadow-depro hover:bg-depro-blue-dark transition-colors"
              >
                <Camera size={13} />
              </button>
            </div>

            <div>
              <p className="font-semibold text-depro-dark mb-1">{user?.name || "Jose (Admin)"}</p>
              <p className="text-sm text-depro-gray mb-3">{user?.email || "jose@admin.com"}</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-depro-border text-sm font-medium text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
              >
                Cambiar foto
              </button>
              {photo && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle size={11} /> {photo.name} listo para guardar
                </p>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        {/* Business */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-depro-border">
            <div className="w-9 h-9 bg-depro-blue-light rounded-xl flex items-center justify-center">
              <Building size={18} className="text-depro-blue" />
            </div>
            <h2 className="font-bold text-depro-dark">Información del negocio</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Nombre", key: "name", type: "text" },
              { label: "Email de contacto", key: "email", type: "email" },
              { label: "Teléfono", key: "phone", type: "text" },
              { label: "Sitio web", key: "website", type: "url" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-depro-dark mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={biz[f.key]}
                  onChange={(e) => setBiz({ ...biz, [f.key]: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-depro-border">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Bell size={18} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-depro-dark">Notificaciones</h2>
          </div>
          <div className="space-y-5">
            {[
              { key: "newClients", label: "Nuevos clientes", desc: "Alerta cuando se registra un cliente nuevo" },
              { key: "weeklyReport", label: "Informe semanal", desc: "Resumen de actividad cada lunes" },
              { key: "feedback", label: "Confirmación de feedback", desc: "Confirmación al enviar revisión" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-depro-dark">{n.label}</div>
                  <div className="text-xs text-depro-gray mt-0.5">{n.desc}</div>
                </div>
                <Toggle
                  checked={notifs[n.key]}
                  onChange={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-depro-border">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-green-700" />
            </div>
            <h2 className="font-bold text-depro-dark">Seguridad</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Contraseña actual", key: "current" },
              { label: "Nueva contraseña", key: "next" },
              { label: "Confirmar contraseña", key: "confirm" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-depro-dark mb-1.5">{f.label}</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw[f.key]}
                    onChange={(e) => setPw({ ...pw, [f.key]: e.target.value })}
                    className="admin-input w-full pr-10"
                    placeholder="••••••••"
                  />
                  {f.key === "current" && (
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-depro-dark"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
            saved
              ? "bg-green-500 text-white"
              : "bg-depro-blue text-white hover:bg-depro-blue-dark"
          }`}
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? "¡Guardado correctamente!" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
