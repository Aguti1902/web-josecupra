import { Link } from "react-router-dom";
import { ArrowRight, Video, FileText, MessageSquare, Calendar, Users } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function AdminClientsPage() {
  const { clients, clientFeedback, clientContent } = useAdmin();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-depro-dark mb-0.5">Clientes</h1>
          <p className="text-depro-gray text-sm">{clients.length} clientes activos en el programa</p>
        </div>
        <div className="flex items-center gap-2 text-depro-gray text-sm">
          <Users size={16} /> {clients.length} total
        </div>
      </div>

      <div className="space-y-3">
        {clients.map((client) => {
          const accent = client.club?.primaryColor || "#0A36F7";
          const videos = clientContent[client.id]?.videos?.length || 0;
          const pdfs = clientContent[client.id]?.pdfs?.length || 0;
          const feedbacks = clientFeedback[client.id]?.length || 0;

          return (
            <Link key={client.id} to={`/admin/clients/${client.id}`}
              className="flex bg-white border border-depro-border hover:border-depro-blue rounded-2xl overflow-hidden shadow-card hover:shadow-depro transition-all group"
            >
              <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: accent }} />
              <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: accent + "15", color: accent }}>
                    {client.club?.logo || "—"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-depro-dark truncate">{client.name}</div>
                    <div className="text-sm text-depro-gray truncate">{client.club?.name}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: accent + "15", color: accent }}>
                        {client.plan}
                      </span>
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
                  <ArrowRight size={17} className="text-depro-border group-hover:text-depro-blue group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
