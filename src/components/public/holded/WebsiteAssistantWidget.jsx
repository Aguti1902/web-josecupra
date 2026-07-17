import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Bot, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { WEBSITE_QUICK_QUESTIONS, resolveWebsiteAnswer } from "../../../lib/websiteKnowledge";

function renderMarkdownLight(text) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export default function WebsiteAssistantWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy el asistente de DEPRO. Pregúntame sobre precios, prueba gratis, funcionalidades o qué perfil te conviene.",
    },
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/website-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, pathname }),
      });
      const data = await res.json();
      const reply = data.reply || resolveWebsiteAnswer(msg, pathname);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: resolveWebsiteAnswer(msg, pathname) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-4 md:right-6 z-[150] w-[min(400px,calc(100vw-32px))] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white animate-fade-in-up"
          style={{ maxHeight: "min(560px, calc(100vh - 120px))" }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5 bg-holded-dark text-white shrink-0 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-holded-blue/30 flex items-center justify-center">
              <Sparkles size={18} className="text-holded-blue-light" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Asistente DEPRO</p>
              <p className="text-[11px] text-holded-muted truncate">Precios · Prueba gratis · Funcionalidades</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px] bg-slate-50/80">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-holded-blue text-white" : "bg-white border border-gray-200 text-holded-blue"
                  }`}
                >
                  {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
                </div>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%] ${
                    m.role === "user"
                      ? "bg-holded-blue text-white rounded-tr-sm"
                      : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {renderMarkdownLight(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 items-center text-gray-400 text-sm pl-9">
                <Loader2 size={14} className="animate-spin" /> Pensando…
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-gray-100 bg-white shrink-0">
              {WEBSITE_QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full bg-blue-50 text-holded-blue hover:bg-blue-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre DEPRO…"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-holded-blue"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-holded-blue text-white flex items-center justify-center hover:bg-holded-blue/90 disabled:opacity-50 shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Asistente DEPRO"
        className={`fixed bottom-6 right-6 z-[140] flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-2xl font-bold text-sm text-white shadow-[0_8px_30px_rgba(37,99,235,0.45)] transition-all duration-300 hover:scale-105 ${
          open ? "bg-holded-dark border border-white/15" : "bg-gradient-to-r from-holded-blue to-indigo-600"
        }`}
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
        <span className="hidden sm:inline">{open ? "Cerrar" : "Asistente"}</span>
      </button>
    </>
  );
}
