import { Link } from "react-router-dom";
import { Users, Video, FileText, MessageSquare, ArrowRight, Clock, Star, TrendingUp, Calendar, Upload, StickyNote } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function AdminOverviewPage() {
  const { clients, clientFeedback, clientContent } = useAdmin();

  const totalVideos = Object.values(clientContent).reduce((a, c) => a + (c.videos?.length || 0), 0);
  const totalPdfs = Object.values(clientContent).reduce((a, c) => a + (c.pdfs?.length || 0), 0);
  const totalFeedbacks = Object.values(clientFeedback).reduce((a, f) => a + f.length, 0);

  const stats = [
    { label: "Clientes activos", value: clients.length, icon: Users, color: "#0A36F7", bg: "#EEF1FF" },
    { label: "Vídeos subidos", value: totalVideos, icon: Video, color: "#3BC21D", bg: "#EAF9E6" },
    { label: "PDFs compartidos", value: totalPdfs, icon: FileText, color: "#F6CC12", bg: "#FEFAE7" },
    { label: "Revisiones enviadas", value: totalFeedbacks, icon: MessageSquare, color: "#FB2C39", bg: "#FEE8EA" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Panel DEPRO</h1>
          <p className="text-depro-gray text-sm mt-0.5">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <img src="/logo.png" alt="DEPRO" className="h-7 w-auto opacity-20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <TrendingUp size={13} className="text-depro-green mt-1" />
            </div>
            <div className="text-2xl font-black text-depro-dark">{s.value}</div>
            <div className="text-sm text-depro-gray">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Clients */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-depro-dark">Tus clientes</h2>
          <Link to="/admin/clients" className="text-sm text-depro-blue hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => {
            const accent = client.club?.primaryColor || "#0A36F7";
            const lastFb = clientFeedback[client.id]?.[0];
            const videos = clientContent[client.id]?.videos?.length || 0;
            const pdfs = clientContent[client.id]?.pdfs?.length || 0;

            return (
              <Link
                key={client.id}
                to={`/admin/clients/${client.id}`}
                className="card hover:shadow-card-hover group overflow-hidden"
              >
                <div className="h-1 rounded-full mb-5 -mx-6 -mt-6" style={{ backgroundColor: accent }} />
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: accent + "15", color: accent }}
                  >
                    {client.club?.logo || "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-depro-dark truncate">{client.name}</div>
                    <div className="text-xs text-depro-gray truncate">{client.club?.name}</div>
                    <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: accent + "15", color: accent }}>
                      {client.plan}
                    </span>
                  </div>
                  <ArrowRight size={15} className="text-depro-border group-hover:text-depro-blue transition-colors mt-1 flex-shrink-0" />
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Vídeos", value: videos },
                    { label: "PDFs", value: pdfs },
                    { label: "Reviews", value: clientFeedback[client.id]?.length || 0 },
                  ].map((s) => (
                    <div key={s.label} className="bg-depro-gray-light rounded-xl p-2 text-center">
                      <div className="text-base font-black text-depro-dark">{s.value}</div>
                      <div className="text-xs text-depro-gray">{s.label}</div>
                    </div>
                  ))}
                </div>

                {lastFb && (
                  <div className="border-t border-depro-border pt-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={11} className="text-depro-gray" />
                      <span className="text-xs text-depro-gray">{lastFb.date}</span>
                      <div className="ml-auto flex gap-0.5">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} size={10} className={i < Math.round(lastFb.rating / 2) ? "fill-depro-yellow text-depro-yellow" : "text-depro-border"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-depro-gray line-clamp-2">{lastFb.message}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-bold text-depro-dark mb-4">Acciones rápidas</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { Icon: Calendar,  label: "Editar plan semanal", desc: "Modifica sesiones y ejercicios de cualquier cliente", color: "#0A36F7", bg: "#EEF1FF" },
            { Icon: Upload,    label: "Subir contenido",     desc: "Añade vídeos y PDFs a la biblioteca de un cliente",  color: "#F6CC12", bg: "#FEFAE7" },
            { Icon: StickyNote,label: "Enviar feedback",     desc: "Escribe la revisión semanal de un cliente",           color: "#3BC21D", bg: "#EAF9E6" },
          ].map((a) => (
            <Link key={a.label} to="/admin/clients" className="card hover:shadow-card-hover group flex items-start gap-4 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.bg }}>
                <a.Icon size={18} style={{ color: a.color }} />
              </div>
              <div>
                <div className="font-semibold text-depro-dark text-sm mb-1 group-hover:text-depro-blue transition-colors">{a.label}</div>
                <div className="text-xs text-depro-gray leading-relaxed">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
