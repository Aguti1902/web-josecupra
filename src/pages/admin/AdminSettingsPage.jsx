import { useState } from "react";
import { Save, Building, Bell, Shield, Eye, EyeOff } from "lucide-react";

export default function AdminSettingsPage() {
  const [biz, setBiz] = useState({ name: "DEPRO", email: "contact@depro.com", phone: "+34 600 000 000", website: "https://depro.com" });
  const [notifs, setNotifs] = useState({ newClients: true, weeklyReport: true, feedback: false });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-depro-dark mb-1">Ajustes</h1>
        <p className="text-depro-gray text-sm">Configuración de la cuenta DEPRO</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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
                <input type={f.type} value={biz[f.key]} onChange={(e) => setBiz({ ...biz, [f.key]: e.target.value })}
                  className="admin-input w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-depro-border">
            <div className="w-9 h-9 bg-depro-yellow-light rounded-xl flex items-center justify-center">
              <Bell size={18} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-depro-dark">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "newClients", label: "Nuevos clientes", desc: "Alerta cuando se registra un cliente nuevo" },
              { key: "weeklyReport", label: "Informe semanal", desc: "Resumen de actividad cada lunes" },
              { key: "feedback", label: "Confirmación de feedback", desc: "Confirmación al enviar revisión" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-depro-dark">{n.label}</div>
                  <div className="text-xs text-depro-gray">{n.desc}</div>
                </div>
                <button type="button" onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                  className={`relative w-10 h-5.5 rounded-full transition-all ${notifs[n.key] ? "bg-depro-blue" : "bg-gray-200"}`}
                  style={{ minWidth: "40px", height: "22px" }}
                >
                  <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${notifs[n.key] ? "translate-x-5" : "translate-x-0.5"}`}
                    style={{ width: "18px", height: "18px", transition: "transform .2s" }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-depro-border">
            <div className="w-9 h-9 bg-depro-green-light rounded-xl flex items-center justify-center">
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
                  <input type={showPw ? "text" : "password"} value={pw[f.key]}
                    onChange={(e) => setPw({ ...pw, [f.key]: e.target.value })}
                    className="admin-input w-full pr-10" placeholder="••••••••" />
                  {f.key === "current" && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-depro-dark">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit"
          className={`admin-btn-primary flex items-center gap-2 px-6 py-3 rounded-xl ${saved ? "bg-depro-green" : ""}`}>
          <Save size={16} />
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
