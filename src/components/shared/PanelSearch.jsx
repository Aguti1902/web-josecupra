import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Building2, User, BookOpen, LayoutDashboard, Dumbbell, Users, Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  flattenAdminNav,
  runAdminSearch,
  runClientSearch,
  getSearchTypeLabel,
} from "../../lib/panelSearch";

const TYPE_ICONS = {
  page: LayoutDashboard,
  club: Building2,
  user: User,
  exercise: Dumbbell,
  player: Users,
  team: Users,
};

function ResultIcon({ type }) {
  const Icon = TYPE_ICONS[type] || BookOpen;
  return <Icon size={14} className="shrink-0" />;
}

/**
 * Búsqueda global del panel con sugerencias al escribir.
 * mode: "admin" | "client"
 */
export default function PanelSearch({ mode = "admin", navGroups, navItems, user, className = "" }) {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [highlight, setHighlight] = useState(0);

  const adminPages = useMemo(
    () => (mode === "admin" && navGroups ? flattenAdminNav(navGroups) : []),
    [mode, navGroups]
  );

  const runSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (mode === "admin") {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        const items = await runAdminSearch(trimmed, adminPages, token);
        setResults(items);
      } else {
        setResults(runClientSearch(trimmed, { navItems, user }));
      }
      setHighlight(0);
    } finally {
      setLoading(false);
    }
  }, [mode, adminPages, navItems, user]);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => runSearch(query), 180);
    return () => clearTimeout(t);
  }, [query, open, runSearch]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (item) => {
    setOpen(false);
    setQuery("");
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (!open || results.length === 0) {
      if (e.key === "ArrowDown" && query.trim()) setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const placeholder = mode === "admin"
    ? "Buscar página, club, usuario, ejercicio…"
    : "Buscar sección, jugador, ejercicio…";

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all w-full ${
          open
            ? "bg-white border-depro-blue/40 ring-2 ring-depro-blue/20 shadow-sm"
            : "bg-slate-100/80 border-depro-border/50"
        }`}
      >
        {loading ? (
          <Loader2 size={15} className="text-depro-gray shrink-0 animate-spin" />
        ) : (
          <Search size={15} className="text-depro-gray shrink-0" />
        )}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-depro-dark placeholder:text-depro-gray outline-none"
          aria-label={placeholder}
          aria-expanded={open}
          aria-autocomplete="list"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute top-full left-0 right-0 w-full mt-2 bg-white border border-depro-border rounded-xl shadow-2xl overflow-hidden z-[100] max-h-[min(360px,50vh)] overflow-y-auto box-border">
          {loading && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-depro-gray">Buscando…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-depro-gray">Sin resultados para «{query}»</p>
          ) : (
            <ul role="listbox" className="py-1">
              {results.map((item, i) => (
                <li key={item.id} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => pick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      i === highlight ? "bg-depro-blue/8" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === "club" ? "bg-blue-50 text-depro-blue"
                        : item.type === "user" || item.type === "player" ? "bg-violet-50 text-violet-600"
                        : item.type === "exercise" ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-depro-gray"
                    }`}>
                      <ResultIcon type={item.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-depro-dark truncate">{item.label}</p>
                      <p className="text-[11px] text-depro-gray truncate">{item.sub}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-depro-gray/70 shrink-0">
                      {getSearchTypeLabel(item.type)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
