/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * Herramienta interna comercial — NO enlazada desde navegación pública.
 */

"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { demoGet, demoSet } from "@/lib/demo-store";

interface Commission {
  id: string;
  commercial: string;
  client: string;
  amount: number;
  commission: number;
  created_at: string;
}

export default function ComisionesPage() {
  const [amount, setAmount] = useState("");
  const [client, setClient] = useState("");
  const [commercial, setCommercial] = useState("Comercial Demo");
  const [history, setHistory] = useState<Commission[]>([]);

  const load = async () => {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      const { data } = await supabase.from("commissions").select("*").order("created_at", { ascending: false });
      if (data) setHistory(data as Commission[]);
      return;
    }
    setHistory(demoGet("commissions", []));
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const num = parseFloat(amount);
    if (!num || !client.trim()) return;
    const commission = Math.round(num * 0.06 * 100) / 100;
    const row: Commission = {
      id: crypto.randomUUID(),
      commercial,
      client: client.trim(),
      amount: num,
      commission,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.from("commissions").insert({
        commercial: row.commercial,
        client: row.client,
        amount: row.amount,
        commission: row.commission,
      });
    } else {
      const updated = [row, ...history];
      demoSet("commissions", updated);
      setHistory(updated);
    }

    setAmount("");
    setClient("");
    load();
  };

  const parsed = parseFloat(amount) || 0;
  const preview = Math.round(parsed * 0.06 * 100) / 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 max-w-3xl mx-auto">
      <p className="text-xs text-red-400 font-bold uppercase mb-2">Uso interno · no compartir con clientes</p>
      <h1 className="text-2xl font-black mb-8">Calculadora de comisiones</h1>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 space-y-4 mb-8">
        <input
          value={commercial}
          onChange={(e) => setCommercial(e.target.value)}
          placeholder="Comercial"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2"
        />
        <input
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Cliente / Club"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Importe contrato (€)"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2"
        />
        <p className="text-amber-400 font-bold">Comisión 6%: {preview.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
        <button onClick={add} className="px-6 py-2.5 rounded-lg bg-amber-400 text-slate-900 font-bold">
          Registrar operación
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="text-slate-400 text-xs uppercase border-b border-slate-700">
          <tr>
            <th className="py-2 text-left">Fecha</th>
            <th className="py-2 text-left">Comercial</th>
            <th className="py-2 text-left">Cliente</th>
            <th className="py-2 text-right">Importe</th>
            <th className="py-2 text-right">Comisión</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b border-slate-800">
              <td className="py-3 text-slate-500">{new Date(h.created_at).toLocaleDateString("es-ES")}</td>
              <td className="py-3">{h.commercial}</td>
              <td className="py-3">{h.client}</td>
              <td className="py-3 text-right">{Number(h.amount).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
              <td className="py-3 text-right text-amber-400 font-bold">{Number(h.commission).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
