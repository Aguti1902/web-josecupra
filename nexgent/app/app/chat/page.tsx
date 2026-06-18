/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * REAL — chat persistido Supabase + resumen IA.
 * Producción: presencia online, adjuntos, menciones, push notifications.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, Send } from "lucide-react";
import { CHAT_CHANNELS, SEED_CHAT_MESSAGES, ChatMessage } from "@/lib/seed-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { demoGet, demoSet } from "@/lib/demo-store";

export default function ChatPage() {
  const [channel, setChannel] = useState("tecnico");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [author, setAuthor] = useState("Staff Demo");

  const loadMessages = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("channel_id", channel)
        .order("created_at", { ascending: true });
      if (data?.length) {
        setMessages(data as ChatMessage[]);
        return;
      }
    }
    const local = demoGet<ChatMessage[]>("chat", SEED_CHAT_MESSAGES);
    setMessages(local.filter((m) => m.channel_id === channel));
  }, [channel]);

  useEffect(() => {
    loadMessages();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const sub = supabase
      .channel(`chat-${channel}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel_id=eq.${channel}` }, () => loadMessages())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [channel, loadMessages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      channel_id: channel,
      author,
      role: "Staff",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.from("chat_messages").insert({
        channel_id: msg.channel_id,
        author: msg.author,
        role: msg.role,
        content: msg.content,
      });
    } else {
      const all = demoGet<ChatMessage[]>("chat", SEED_CHAT_MESSAGES);
      demoSet("chat", [...all, msg]);
    }

    setInput("");
    loadMessages();
  };

  const summarize = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/chat/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      setSummary(data.summary || "Sin resumen.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">Chat del staff</h1>
        <div className="flex gap-2 items-center">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm w-32"
            placeholder="Tu nombre"
          />
          <button
            onClick={summarize}
            disabled={loadingSummary || messages.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400/20 text-amber-400 text-sm font-bold hover:bg-amber-400/30 disabled:opacity-50"
          >
            <Sparkles size={16} /> {loadingSummary ? "Resumiendo…" : "Resumen IA"}
          </button>
        </div>
      </div>

      {summary && (
        <div className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-4 text-sm">
          <p className="text-amber-400 font-bold text-xs uppercase mb-1">Resumen IA</p>
          {summary}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {CHAT_CHANNELS.map((c) => (
          <button
            key={c.id}
            onClick={() => setChannel(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${channel === c.id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/30 flex flex-col h-[420px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-lg bg-slate-800/80 px-4 py-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-slate-300">{m.author}</span>
                <span>{new Date(m.created_at).toLocaleString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="text-sm">{m.content}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje al canal..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button onClick={sendMessage} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
