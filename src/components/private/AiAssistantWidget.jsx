import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Bot, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { QUICK_QUESTIONS, getAssistantRole, resolveLocalAnswer } from "../../lib/panelKnowledge";

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

export default function AiAssistantWidget() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy el asistente DEPRO. Pregúntame sobre planificación, plantilla, tests, cargas o cualquier sección del panel.",
    },
  ]);
  const listRef = useRef(null);
  const role = getAssistantRole(user);
  const quickQs = QUICK_QUESTIONS[role] || QUICK_QUESTIONS.player;

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
      const res = await fetch("/api/panel-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          role,
          pathname,
          userName: user?.name,
        }),
      });
      const data = await res.json();
      const reply = data.reply || resolveLocalAnswer(msg, role, pathname);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      const reply = resolveLocalAnswer(msg, role, pathname);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 md:right-6 z-[150] w-[min(400px,calc(100vw-32px))] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-depro-border bg-white animate-fade-in-up"
          style={{ maxHeight: "min(560px, calc(100vh - 120px))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Asistente DEPRO</p>
              <p className="text-[11px] text-indigo-200/80 truncate">IA · Panel y funcionalidades</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px] bg-slate-50/80">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-depro-blue text-white" : "bg-white border border-depro-border text-depro-blue"
                  }`}
                >
                  {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
                </div>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%] ${
                    m.role === "user"
                      ? "bg-depro-blue text-white rounded-tr-sm"
                      : "bg-white border border-depro-border text-depro-dark rounded-tl-sm shadow-sm"
                  }`}
                >
                  {renderMarkdownLight(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 items-center text-depro-gray text-sm pl-9">
                <Loader2 size={14} className="animate-spin" /> Pensando…
              </div>
            )}
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-depro-border bg-white shrink-0">
              {quickQs.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-depro-border bg-white shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre el panel…"
                className="flex-1 admin-input rounded-xl py-2.5 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-depro-blue text-white flex items-center justify-center hover:bg-depro-blue-dark disabled:opacity-50 shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        data-tour="ai-assistant"
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-20 sm:bottom-5 right-4 md:right-6 z-[140] flex items-center gap-2 pl-3 sm:pl-4 pr-4 sm:pr-5 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
          open ? "bg-depro-dark" : "bg-gradient-to-r from-depro-blue via-indigo-600 to-violet-600 animate-glow"
        }`}
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
        {open ? "Cerrar" : "Asistente IA"}
      </button>
    </>
  );
}
