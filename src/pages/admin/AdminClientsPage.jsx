import { Link } from "react-router-dom";
import { ArrowRight, Users, Video, FileText, MessageSquare, Calendar } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function AdminClientsPage() {
  const { clients, clientFeedback, clientContent } = useAdmin();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Clients</h1>
        <p className="text-gray-400 text-sm">{clients.length} active clients on the program</p>
      </div>

      <div className="space-y-4">
        {clients.map((client) => {
          const accent = client.club?.primaryColor || "#a855f7";
          const videos = clientContent[client.id]?.videos?.length || 0;
          const pdfs = clientContent[client.id]?.pdfs?.length || 0;
          const feedbacks = clientFeedback[client.id]?.length || 0;

          return (
            <Link
              key={client.id}
              to={`/admin/clients/${client.id}`}
              className="block rounded-2xl border border-white/10 hover:border-purple-500/30 bg-gray-900/50 hover:bg-gray-900 transition-all group overflow-hidden"
            >
              <div className="flex items-center gap-0">
                {/* Color stripe */}
                <div
                  className="w-1.5 self-stretch flex-shrink-0"
                  style={{ backgroundColor: accent }}
                />

                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                      style={{ backgroundColor: accent + "20" }}
                    >
                      {client.club?.logo || "⚽"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-lg">{client.name}</div>
                      <div className="text-sm text-gray-400">{client.club?.name}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: accent + "20", color: accent }}
                        >
                          {client.plan}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{client.role}</span>
                        {client.level && (
                          <span className="text-xs text-gray-500">{client.level}</span>
                        )}
                        {client.objective && (
                          <span className="text-xs text-gray-600 truncate max-w-[200px]">
                            Goal: {client.objective}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {[
                      { icon: Video, value: videos, label: "Videos" },
                      { icon: FileText, value: pdfs, label: "PDFs" },
                      { icon: MessageSquare, value: feedbacks, label: "Reviews" },
                      { icon: Calendar, value: client.trainingDays || client.players || "—", label: client.role === "club" ? "Players" : "Days/wk" },
                    ].map((s) => (
                      <div key={s.label} className="text-center hidden md:block">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                          <s.icon size={11} />
                          {s.label}
                        </div>
                        <div className="text-white font-bold">{s.value}</div>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-gray-500 font-medium hidden sm:block">Manage</span>
                      <ArrowRight
                        size={18}
                        className="text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
