import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Video, FileText, MessageSquare, Calendar, Users, RefreshCw,
  Sparkles, Hand,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

/** Cliente con seguimiento humano / alta manual del admin. */
function isLedByAdmin(client) {
  if (client?.billingSource === "manual") return true;
  const plan = String(client?.plan || "").toLowerCase();
  return plan === "player-pro" || plan === "premium" || plan === "pro";
}

function SourceBadge({ led }) {
  return led ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-200">
      <Hand size={10} /> Llevado por mí
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-sky-50 text-sky-700 border-sky-200">
      <Sparkles size={10} /> Automático
    </span>
  );
}

function ClientCard({ client, clientContent, clientFeedback }) {
  const accent = client.club?.primaryColor || "#0A36F7";
  const videos = clientContent[client.id]?.videos?.length || 0;
  const pdfs = clientContent[client.id]?.pdfs?.length || 0;
  const feedbacks = clientFeedback[client.id]?.length || 0;
  const led = isLedByAdmin(client);

  return (
    <Link
      to={`/admin/clients/${client.id}`}
      className="flex bg-white border border-depro-border hover:border-depro-blue rounded-2xl overflow-hidden shadow-card hover:shadow-depro transition-all group"
    >
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: accent }} />
      <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ backgroundColor: accent + "15", color: accent }}
          >
            {client.club?.logo || "—"}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-depro-dark truncate">{client.name}</div>
            <div className="text-sm text-depro-gray truncate">{client.club?.name}</div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: accent + "15", color: accent }}
              >
                {client.plan}
              </span>
              <SourceBadge led={led} />
              <span className="text-xs text-depro-gray capitalize">{client.role}</span>
              {client.level && <span className="text-xs text-depro-gray">{client.level}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 flex-shrink-0">
          {[
            { icon: Video, value: videos, label: "Vídeos" },
            { icon: FileText, value: pdfs, label: "PDFs" },
            { icon: MessageSquare, value: feedbacks, label: "Reviews" },
            { icon: Calendar, value: client.trainingDays || client.players || "—", label: client.role === "club" ? "Jugadores" : "Días/sem" },
          ].map((s) => (
            <div key={s.label} className="text-center hidden md:block">
              <div className="flex items-center gap-1 text-depro-gray text-xs mb-1">
                <s.icon size={11} /> {s.label}
              </div>
              <div className="text-depro-dark font-bold text-sm">{s.value}</div>
            </div>
          ))}
          <span className="hidden sm:inline text-xs font-bold text-depro-blue">Ver estado</span>
          <ArrowRight size={17} className="text-depro-border group-hover:text-depro-blue group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}

function ClientSection({ title, subtitle, icon: Icon, accent, clients, emptyText, clientContent, clientFeedback }) {
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
          {clients.length}
        </span>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-depro-gray py-6 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              clientContent={clientContent}
              clientFeedback={clientFeedback}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminClientsPage() {
  const { clients, clientsLoading, refreshClients, clientFeedback, clientContent } = useAdmin();

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  const { autoClients, manualClients } = useMemo(() => {
    const auto = [];
    const manual = [];
    for (const c of clients) {
      if (isLedByAdmin(c)) manual.push(c);
      else auto.push(c);
    }
    return { autoClients: auto, manualClients: manual };
  }, [clients]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-depro-dark mb-0.5">Clientes</h1>
          <p className="text-depro-gray text-sm">{clients.length} clientes activos en el programa</p>
        </div>
        <div className="flex items-center gap-3 text-depro-gray text-sm">
          <button
            type="button"
            onClick={refreshClients}
            disabled={clientsLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-depro-blue disabled:opacity-50"
          >
            <RefreshCw size={14} className={clientsLoading ? "animate-spin" : ""} /> Actualizar
          </button>
          <span className="inline-flex items-center gap-2">
            <Users size={16} /> {clients.length} total
          </span>
        </div>
      </div>

      {clientsLoading && clients.length === 0 ? (
        <div className="py-16 flex justify-center">
          <div className="spinner border-depro-blue/20 border-t-depro-blue" />
        </div>
      ) : clients.length === 0 ? (
        <div className="py-16 text-center text-depro-gray text-sm">
          No hay jugadores todavía. Créalos en{" "}
          <Link to="/admin/users?alta=player" className="text-depro-blue hover:underline">Usuarios → Nuevo jugador</Link>.
        </div>
      ) : (
        <div className="space-y-8">
          <ClientSection
            title="Automáticos"
            subtitle="Planes individuales con flujo Stripe / motor automático"
            icon={Sparkles}
            accent="sky"
            clients={autoClients}
            emptyText="Ningún cliente automático"
            clientContent={clientContent}
            clientFeedback={clientFeedback}
          />
          <ClientSection
            title="Llevados por mí"
            subtitle="Billing manual o plan Premium con seguimiento humano (player-pro)"
            icon={Hand}
            accent="amber"
            clients={manualClients}
            emptyText="Ningún cliente llevado manualmente"
            clientContent={clientContent}
            clientFeedback={clientFeedback}
          />
        </div>
      )}
    </div>
  );
}
