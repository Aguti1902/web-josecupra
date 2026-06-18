import { ExternalLink } from "lucide-react";

const NEXGENT_URL = import.meta.env.VITE_NEXGENT_URL || "http://localhost:3001";

export default function NexGentLauncherPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-blue-700 flex items-center justify-center text-lg font-black mb-6">
        NG
      </div>
      <h1 className="text-3xl font-black mb-3">NexGent · Demo comercial</h1>
      <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
        Plataforma IA para clubes de élite. Pitch + dashboard funcional en app Next.js independiente.
      </p>
      <a
        href={NEXGENT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-400 text-slate-900 font-black text-lg hover:bg-amber-300 transition-colors"
      >
        Abrir demo NexGent <ExternalLink size={20} />
      </a>
      <p className="text-xs text-slate-600 mt-6">
        Desarrollo local: <code className="text-slate-500">cd nexgent && npm run dev</code>
      </p>
    </div>
  );
}
