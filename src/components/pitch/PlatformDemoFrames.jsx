import { useState, useEffect, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Activity, Calendar, CheckCircle2, ChevronRight, ClipboardList, Download, FileText,
  Filter, Shield, TrendingUp, Users, Zap,
} from "lucide-react";

/** Browser chrome wrapper — looks like a product screenshot */
function BrowserFrame({ title, children, accent = "#0A36F7" }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 font-mono truncate text-center">
            app.depro.club · {title}
          </div>
        </div>
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: accent }}>
          RF
        </div>
      </div>
      <div className="p-4 md:p-5 bg-[#FAFBFC] min-h-[300px]">{children}</div>
    </div>
  );
}

function SidebarMini({ active, accent }) {
  const { t } = useTranslation("usPitch");
  const items = [
    { id: "dash", label: t("demos.ui.dashboard"), icon: Zap },
    { id: "plan", label: t("demos.ui.microcycle"), icon: Calendar },
    { id: "squad", label: t("demos.ui.squad"), icon: Users },
    { id: "tests", label: t("demos.ui.tests"), icon: Activity },
    { id: "loads", label: t("demos.ui.loads"), icon: TrendingUp },
  ];
  return (
    <div className="w-28 flex-shrink-0 border-r border-gray-200 pr-3 space-y-0.5">
      <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{t("demos.clubName")}</div>
      {items.map((it) => {
        const Icon = it.icon;
        const on = active === it.id;
        return (
          <div
            key={it.id}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-semibold transition-all duration-300 ${
              on ? "text-white shadow-sm" : "text-gray-500"
            }`}
            style={on ? { backgroundColor: accent } : {}}
          >
            <Icon size={11} /> {it.label}
          </div>
        );
      })}
    </div>
  );
}

function DemoDashboard({ accent, step }) {
  const { t } = useTranslation("usPitch");
  return (
    <BrowserFrame title="dashboard" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="dash" accent={accent} />
        <div className="flex-1 space-y-3">
          <div className="rounded-lg p-3 text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}>
            <div className="text-[10px] opacity-80 font-bold uppercase">{t("demos.clubName")}</div>
            <div className="text-sm font-black">{t("demos.ui.weekTeam", { team: "Sub-15 A" })}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: t("demos.ui.players"), v: step >= 1 ? "22" : "—" },
              { l: t("demos.ui.sessions"), v: step >= 1 ? "3" : "—" },
              { l: t("demos.ui.testsDone"), v: step >= 2 ? "88%" : "—" },
            ].map((s) => (
              <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                <div className="text-lg font-black text-gray-900 stat-number">{s.v}</div>
                <div className="text-[8px] text-gray-400 font-bold uppercase">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-2.5">
            <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">{t("demos.ui.nextSession")}</div>
            <div className={`text-xs font-bold text-gray-800 transition-opacity duration-500 ${step >= 2 ? "opacity-100" : "opacity-40"}`}>
              {t("demos.ui.nextSessionValue")}
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoMicrocycle({ accent, step }) {
  const { t } = useTranslation("usPitch");
  const blocks = [t("demos.ui.warmup"), t("demos.ui.mainBlock"), t("demos.ui.taskDesigner")];
  const blockLines = [t("demos.ui.microBlock1"), t("demos.ui.microBlock2"), t("demos.ui.microBlock3")];
  return (
    <BrowserFrame title="microcycle / week-12" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="plan" accent={accent} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-gray-900">{t("demos.ui.sessionB")}</div>
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{t("demos.ui.typeB")}</span>
          </div>
          {blocks.map((b, i) => (
            <div
              key={b}
              className={`bg-white rounded-lg border p-2.5 transition-all duration-500 ${
                step > i ? "border-blue-200 shadow-sm" : "border-gray-100 opacity-50"
              }`}
            >
              <div className="text-[9px] font-bold text-gray-400 uppercase">{b}</div>
              <div className="text-[10px] text-gray-700 mt-0.5">{blockLines[i]}</div>
              {step > i + 1 && i === 2 && (
                <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-blue-600 animate-pulse">
                  <Download size={10} /> {t("demos.ui.exportPdf")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoSquad({ accent, step }) {
  const { t } = useTranslation("usPitch");
  const filters = [t("demos.ui.filterAll"), t("demos.ui.filterMid"), t("demos.ui.filterTests")];
  const players = [
    { n: "J. Morrison", pos: "CM", t: "Premium" },
    { n: "E. Brooks", pos: "CB", t: "Basic" },
    { n: "L. Chen", pos: "RW", t: "Premium" },
  ];
  return (
    <BrowserFrame title="squad / u15-elite" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="squad" accent={accent} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={10} className="text-gray-400" />
            {filters.map((f, i) => (
              <span
                key={f}
                className={`text-[8px] font-bold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                  step >= i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-400"
                }`}
              >
                {f}
              </span>
            ))}
          </div>
          <div className="space-y-1">
            {players.map((p, i) => (
              <div
                key={p.n}
                className={`flex items-center justify-between bg-white rounded-lg border px-2.5 py-2 transition-all duration-500 ${
                  step > i ? "border-gray-200" : "border-transparent opacity-30"
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-gray-900">{p.n}</div>
                  <div className="text-[8px] text-gray-400">{p.pos}</div>
                </div>
                <span className="text-[8px] font-bold text-blue-600">{p.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function MiniLineChart({ title, unit, values, teamAvg, color, step }) {
  const { t } = useTranslation("usPitch");
  const w = 130;
  const chartH = 36;
  const labelH = 10;
  const h = chartH + labelH;
  const padX = 6;
  const padY = 5;
  const visibleCount = Math.min(step + 1, values.length);
  const visible = values.slice(0, visibleCount);
  const avgArr = Array.isArray(teamAvg) ? teamAvg : values.map(() => teamAvg);
  const allVals = [...values, ...avgArr];
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const range = rawMax - rawMin || 1;
  const min = rawMin - range * 0.15;
  const max = rawMax + range * 0.15;
  const plotW = w - padX * 2;
  const plotH = chartH - padY * 2;
  const toX = (i) => padX + (i / (values.length - 1)) * plotW;
  const toY = (v) => padY + plotH - ((v - min) / (max - min)) * plotH;
  const playerPts = visible.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const avgPts = avgArr.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] font-bold text-gray-500 uppercase">{title}</span>
        <span className="text-[8px] font-black" style={{ color }}>{visible[visible.length - 1]}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-11" preserveAspectRatio="xMidYMid meet">
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={padX}
            x2={w - padX}
            y1={padY + (i * plotH) / 2}
            y2={padY + (i * plotH) / 2}
            stroke="#F3F4F6"
            strokeWidth="1"
          />
        ))}
        <polyline
          points={avgPts}
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={step >= 1 ? 1 : 0.35}
        />
        {visible.length >= 2 && (
          <polyline
            points={playerPts}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {visible.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="2.5" fill={color} stroke="#fff" strokeWidth="1" />
        ))}
        {avgArr.map((v, i) => (
          <circle
            key={`avg-${i}`}
            cx={toX(i)}
            cy={toY(v)}
            r="1.5"
            fill="#9CA3AF"
            opacity={step >= 1 ? 0.9 : 0.4}
          />
        ))}
        {["T1", "T2", "T3"].map((l, i) => (
          <text key={l} x={toX(i)} y={h - 2} textAnchor="middle" fontSize="6" fill="#9CA3AF" fontWeight="bold">{l}</text>
        ))}
      </svg>
      <div className="flex gap-2 mt-0.5">
        <span className="text-[7px] text-gray-400 flex items-center gap-0.5">
          <span className="w-2 h-0.5 rounded" style={{ backgroundColor: color }} /> {t("demos.ui.playerLegend")}
        </span>
        <span className="text-[7px] text-gray-400 flex items-center gap-0.5">
          <span className="w-2 h-0.5 border-t border-dashed border-gray-400" /> {t("demos.ui.teamAvgLegend")}
        </span>
      </div>
    </div>
  );
}

function DemoTests({ accent, step }) {
  const { t } = useTranslation("usPitch");
  const cols = ["T1", "T2", "T3"];
  const row = { name: "J. Morrison", vals: ["500", "520", step >= 2 ? "545" : "—"], colors: ["#22C55E", "#22C55E", "#22C55E"] };
  return (
    <BrowserFrame title="team-tests" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="tests" accent={accent} />
        <div className="flex-1 space-y-2">
          <div className="text-[9px] text-gray-500">
            <Trans i18nKey="demos.ui.ratedVsAvg" ns="usPitch" components={{ strong: <strong /> }} />
          </div>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-gray-100 text-[8px] font-bold text-gray-400 uppercase">
              <div className="bg-gray-50 p-1.5">{t("demos.ui.playerCol")}</div>
              {cols.map((c) => <div key={c} className="bg-gray-50 p-1.5 text-center">{c}</div>)}
            </div>
            <div className="grid grid-cols-4 gap-px bg-gray-100">
              <div className="bg-white p-1.5 text-[9px] font-bold text-gray-800">{row.name}</div>
              {row.vals.map((v, i) => (
                <div key={i} className="bg-white p-1.5 text-center">
                  <span
                    className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded transition-all duration-700 ${
                      step > i ? "scale-100 opacity-100" : "scale-75 opacity-0"
                    }`}
                    style={{ backgroundColor: row.colors[i] + "20", color: row.colors[i] }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={`grid grid-cols-2 gap-1.5 transition-all duration-500 ${step >= 1 ? "opacity-100" : "opacity-30"}`}>
            <MiniLineChart
              title={t("demos.ui.endurance")}
              unit=""
              values={[500, 520, 545]}
              teamAvg={[498, 510, 518]}
              color="#22C55E"
              step={step}
            />
            <MiniLineChart
              title={t("demos.ui.sprint")}
              unit="s"
              values={[2.92, 2.84, 2.78]}
              teamAvg={[2.95, 2.88, 2.82]}
              color={accent}
              step={step}
            />
          </div>
          {step >= 3 && (
            <div className="text-[9px] font-bold text-green-600 flex items-center gap-1">
              <ChevronRight size={10} /> {t("demos.ui.excellentRating")}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoLoads({ accent, step }) {
  const { t } = useTranslation("usPitch");
  const sessions = [
    { l: t("demos.ui.match"), v: step >= 1 ? 720 : "—", c: "#EF4444" },
    { l: "A", v: step >= 1 ? 405 : "—", c: "#22C55E" },
    { l: "B", v: step >= 2 ? 890 : "—", c: "#F59E0B" },
    { l: "C", v: step >= 2 ? 650 : "—", c: "#F59E0B" },
  ];
  return (
    <BrowserFrame title="loads / week-12" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="loads" accent={accent} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase">{t("demos.ui.weeklyLoad")}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all duration-500 ${
              step >= 3 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-400"
            }`}>
              {step >= 3 ? t("demos.ui.mediumLoad") : t("demos.ui.calculating")}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {sessions.map((s) => (
              <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                <div className="text-[8px] text-gray-400 font-bold">{s.l}</div>
                <div className="text-sm font-black stat-number" style={{ color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: step >= 3 ? "68%" : `${step * 20}%` }}
            />
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoTaskDesigner({ accent, step }) {
  const { t } = useTranslation("usPitch");
  const frameworks = [
    { fw: "A", label: t("demos.ui.extensive"), color: "#3B82F6" },
    { fw: "B", label: t("demos.ui.intensive"), color: "#F59E0B" },
    { fw: "C", label: t("demos.ui.reactive"), color: "#EF4444" },
    { fw: "D", label: t("demos.ui.complementary"), color: "#10B981" },
  ];
  const fwIdx = step >= 3 ? 2 : step >= 2 ? 1 : 0;
  const activeFw = frameworks[fwIdx];
  const tasks = [t("demos.ui.positionalRondo"), t("demos.ui.transitions"), t("demos.ui.finishing")];
  const params = [
    { l: t("demos.ui.space"), v: t("demos.ui.spaceValue") },
    { l: t("demos.ui.playersCount"), v: t("demos.ui.playersValue") },
    { l: t("demos.ui.duration"), v: t("demos.ui.durationValue") },
  ];

  return (
    <BrowserFrame title="task-designer / session-b" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="plan" accent={accent} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <ClipboardList size={12} className="text-gray-400" />
            <span className="text-xs font-black text-gray-900">{t("demos.ui.taskDesigner")}</span>
          </div>

          <div className="flex gap-1 flex-wrap">
            {frameworks.map((f, i) => (
              <span
                key={f.fw}
                className={`text-[8px] font-bold px-2 py-0.5 rounded-md border transition-all duration-500 ${
                  i === fwIdx ? "text-white border-transparent shadow-sm" : "text-gray-400 border-gray-200 bg-white opacity-50"
                }`}
                style={i === fwIdx ? { backgroundColor: f.color } : {}}
              >
                {f.fw} · {f.label}
              </span>
            ))}
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-2 space-y-1">
            <div className="text-[8px] font-bold text-gray-400 uppercase mb-1">Task types · multiselect</div>
            {tasks.map((t, i) => (
              <div
                key={t}
                className={`flex items-center gap-2 text-[9px] font-semibold px-2 py-1 rounded-md transition-all duration-500 ${
                  step > i ? "bg-blue-50 text-blue-800 border border-blue-100" : "text-gray-400 border border-transparent"
                }`}
              >
                <span className={`w-3 h-3 rounded border flex items-center justify-center text-[7px] ${step > i ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"}`}>
                  {step > i ? "✓" : ""}
                </span>
                {t}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-2">
            <div className="text-[8px] font-bold text-gray-400 uppercase mb-1.5">
              {t("explorerUi.taskParams", { label: activeFw.label })}
            </div>
            {params.map((p, i) => (
              <div
                key={p.l}
                className={`flex justify-between text-[9px] py-1 border-b border-gray-50 last:border-0 transition-all duration-500 ${
                  step > i + 1 ? "opacity-100" : "opacity-35"
                }`}
              >
                <span className="text-gray-500">{p.l}</span>
                <span className="font-bold text-gray-800">{p.v}</span>
              </div>
            ))}
          </div>

          {step >= 4 && (
            <div className="text-[9px] font-bold rounded-lg px-2.5 py-1.5 flex items-center gap-1" style={{ backgroundColor: activeFw.color + "15", color: activeFw.color }}>
              <CheckCircle2 size={10} /> Cues & recommendations synced to PDF
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoPdf({ accent, step }) {
  const { t } = useTranslation("usPitch");
  const lines = [t("demos.ui.warmupLine"), t("demos.ui.mainLine"), t("demos.ui.tasksLine")];
  return (
    <BrowserFrame title="session-b · export-pdf" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="plan" accent={accent} />
        <div className="flex-1 relative min-h-[220px]">
          <div className={`space-y-2 transition-all duration-500 ${step >= 3 ? "opacity-20 blur-[1px]" : "opacity-100"}`}>
            <div className="text-xs font-black text-gray-900">{t("demos.ui.sessionB")} · 75 min</div>
            {lines.map((line, i) => (
              <div
                key={line}
                className={`bg-white rounded-lg border px-2.5 py-2 text-[10px] text-gray-700 transition-all duration-500 ${
                  step > i ? "border-gray-200" : "border-gray-100 opacity-40"
                }`}
              >
                {line}
              </div>
            ))}
            <div
              className={`mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all duration-500 ${
                step >= 1 ? "bg-blue-600 text-white shadow-md scale-105" : "bg-gray-100 text-gray-400"
              }`}
            >
              <Download size={12} /> {t("demos.ui.exportPdf")}
            </div>
          </div>
          {step >= 2 && (
            <div className="absolute inset-x-0 top-2 flex justify-center pointer-events-none">
              <div
                className={`bg-white border-2 border-gray-200 shadow-2xl rounded-lg p-3 w-[88%] transition-all duration-500 ${
                  step >= 2 ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2"
                }`}
              >
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[9px] font-black" style={{ backgroundColor: accent }}>FC</div>
                  <div>
                    <div className="text-[10px] font-black text-gray-900">{t("demos.clubName")}</div>
                    <div className="text-[8px] text-gray-400">{t("demos.ui.sessionB")} · {t("demos.ui.weekTeam", { team: "Sub-15 A" })}</div>
                  </div>
                </div>
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`h-2 rounded bg-gray-100 mb-1.5 transition-all duration-300 ${step >= n + 1 ? "w-full" : "w-2/3"}`} />
                ))}
                {step >= 4 && (
                  <div className="mt-2 text-[9px] font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={11} /> PDF ready · logo & colors applied
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoBrand({ accent, step }) {
  const { t } = useTranslation("usPitch");
  const teams = [
    { name: "Sub-15 A", color: accent },
    { name: "Juvenil A", color: "#059669" },
    { name: "Sub-13 A", color: "#7C3AED" },
  ];
  const teamIdx = step >= 3 ? 2 : step >= 2 ? 1 : 0;
  const active = teams[teamIdx];

  return (
    <BrowserFrame title="club · white-label" accent={active.color}>
      <div className="flex gap-3">
        <div className="w-28 flex-shrink-0 border-r border-gray-200 pr-3 space-y-0.5" style={{ backgroundColor: active.color + "06" }}>
          <div className="flex items-center gap-1.5 px-2 mb-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[8px] font-black transition-colors duration-500" style={{ backgroundColor: active.color }}>FC</div>
            <span className="text-[8px] font-bold text-gray-700 truncate">{t("demos.clubName")}</span>
          </div>
          {teams.map((t, i) => (
            <div
              key={t.name}
              className={`px-2 py-1.5 rounded-lg text-[9px] font-semibold transition-all duration-500 ${i === teamIdx ? "text-white shadow-sm" : "text-gray-400"}`}
              style={i === teamIdx ? { backgroundColor: t.color } : {}}
            >
              {t.name}
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <div className="rounded-lg p-3 text-white transition-all duration-500" style={{ background: `linear-gradient(135deg, ${active.color}, ${active.color}cc)` }}>
            <div className="text-[9px] opacity-80 font-bold uppercase">Your brand · not DEPRO</div>
            <div className="text-sm font-black">{active.name}</div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[t("demos.ui.primary"), t("demos.ui.secondary"), t("demos.ui.logo")].map((l, i) => (
              <div
                key={l}
                className={`rounded-lg border p-2 text-center transition-all duration-500 ${step > i ? "border-gray-200 bg-white" : "border-gray-100 opacity-40"}`}
              >
                <div className="w-full h-4 rounded mb-1 transition-colors duration-500" style={{ backgroundColor: i === 0 ? active.color : i === 1 ? active.color + "55" : "#E5E7EB" }} />
                <div className="text-[7px] font-bold text-gray-400 uppercase">{l}</div>
              </div>
            ))}
          </div>
          {step >= 4 && (
            <div className="text-[9px] font-bold text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2">
              <Trans i18nKey="demos.ui.parentsSee" ns="usPitch" values={{ club: t("demos.clubName") }} components={{ span: <span style={{ color: active.color }} /> }} />
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

const PLATFORM_FEATURE_META = [
  { id: "dashboard", icon: Zap, Component: DemoDashboard },
  { id: "microcycle", icon: Calendar, Component: DemoMicrocycle },
  { id: "task-designer", icon: ClipboardList, Component: DemoTaskDesigner },
  { id: "squad", icon: Users, Component: DemoSquad },
  { id: "tests", icon: Activity, Component: DemoTests },
  { id: "loads", icon: TrendingUp, Component: DemoLoads },
  { id: "pdf", icon: FileText, Component: DemoPdf },
  { id: "brand", icon: Shield, Component: DemoBrand },
];

function usePlatformFeatures() {
  const { t, i18n } = useTranslation("usPitch");
  return useMemo(
    () =>
      PLATFORM_FEATURE_META.map((f) => ({
        ...f,
        title: t(`demos.features.${f.id}.title`),
        summary: t(`demos.features.${f.id}.summary`),
        bullets: t(`demos.features.${f.id}.bullets`, { returnObjects: true }),
      })),
    [t, i18n.language]
  );
}

const DEMOS = [
  { id: "dashboard", labelKey: "demos.features.dashboard.title", Component: DemoDashboard },
  { id: "microcycle", labelKey: "demos.features.microcycle.title", Component: DemoMicrocycle },
  { id: "squad", labelKey: "demos.features.squad.title", Component: DemoSquad },
  { id: "tests", labelKey: "demos.features.tests.title", Component: DemoTests },
  { id: "loads", labelKey: "demos.features.loads.title", Component: DemoLoads },
];

/** @deprecated — use usePlatformFeatures() */
const PLATFORM_FEATURES = PLATFORM_FEATURE_META.map((f) => ({
  ...f,
  title: f.id,
  summary: "",
  bullets: [],
}));

/** Hero: fast autoplay tour — no tab pills, cycles all modules */
export function PlatformHeroQuickTour({ accent = "#0A36F7" }) {
  const { t } = useTranslation("usPitch");
  const platformFeatures = usePlatformFeatures();
  const [demoIdx, setDemoIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => setStep((s) => (s >= 3 ? 0 : s + 1)), 500);
    return () => clearInterval(tick);
  }, [demoIdx]);

  useEffect(() => {
    const rotate = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setDemoIdx((i) => (i + 1) % platformFeatures.length);
        setStep(0);
        setFade(true);
      }, 200);
    }, 2600);
    return () => clearInterval(rotate);
  }, []);

  const feature = platformFeatures[demoIdx];
  const DemoComponent = feature.Component;

  return (
    <div>
      <div
        className="relative transition-opacity duration-200"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <DemoComponent accent={accent} step={step} />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-[11px] font-bold bg-gray-900/90 text-white px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
            {feature.title}
          </span>
          <div className="flex gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-100 shadow-sm">
            {platformFeatures.map((f, i) => (
              <div
                key={f.id}
                className={`h-1 rounded-full transition-all duration-300 ${i === demoIdx ? "w-4 bg-blue-600" : "w-1 bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-5">{t("demos.heroFootnote")}</p>
    </div>
  );
}

/** Platform section: demo left + full feature list right */
export function PlatformFeatureShowcase({ accent = "#0A36F7" }) {
  const { t } = useTranslation("usPitch");
  const platformFeatures = usePlatformFeatures();
  const [featureIdx, setFeatureIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);

  const feature = platformFeatures[featureIdx];
  const DemoComponent = feature.Component;

  const selectFeature = (idx) => {
    if (idx === featureIdx) return;
    setFade(false);
    setTimeout(() => {
      setFeatureIdx(idx);
      setStep(0);
      setFade(true);
    }, 180);
  };

  useEffect(() => {
    const tick = setInterval(() => setStep((s) => (s >= 4 ? 0 : s + 1)), 900);
    return () => clearInterval(tick);
  }, [featureIdx]);

  return (
    <div className="grid lg:grid-cols-2 gap-10 xl:gap-14 items-start">
      {/* Left — one demo per selected feature, no top tabs */}
      <div className="lg:sticky lg:top-24">
        <div
          className="relative transition-opacity duration-200"
          style={{ opacity: fade ? 1 : 0 }}
        >
          <DemoComponent accent={accent} step={step} />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="text-[11px] font-bold bg-gray-900/90 text-white px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
              {feature.title}
            </span>
            <div className="flex gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-100 shadow-sm">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${step >= i ? "w-3 bg-blue-600" : "w-1 bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">{t("demos.showcaseFootnote")}</p>
      </div>

      {/* Right — all software characteristics */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t("demos.capabilitiesTitle")}</p>
        <div className="space-y-2">
          {platformFeatures.map((f, i) => {
            const Icon = f.icon;
            const active = i === featureIdx;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => selectFeature(i)}
                className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                  active
                    ? "border-blue-200 bg-blue-50/60 shadow-sm ring-1 ring-blue-100"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-bold text-sm ${active ? "text-gray-900" : "text-gray-700"}`}>{f.title}</h3>
                      {active && <ChevronRight size={16} className="text-blue-600 flex-shrink-0" />}
                    </div>
                    <p className={`text-xs mt-0.5 leading-relaxed ${active ? "text-gray-600" : "text-gray-400"}`}>{f.summary}</p>
                    {active && (
                      <ul className="mt-3 space-y-1.5">
                        {f.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 leading-relaxed">
          <Trans i18nKey="demos.includedNote" ns="usPitch" components={{ strong: <strong className="text-gray-900 font-bold" /> }} />
        </div>
      </div>
    </div>
  );
}

/** @deprecated use PlatformFeatureShowcase — kept for compatibility */
export function PlatformDemoCarousel({ accent = "#0A36F7" }) {
  const [demoIdx, setDemoIdx] = useState(0);
  const [step, setStep] = useState(0);

  const demo = DEMOS[demoIdx];
  const DemoComponent = demo.Component;

  useEffect(() => {
    const tick = setInterval(() => setStep((s) => (s >= 4 ? 0 : s + 1)), 900);
    return () => clearInterval(tick);
  }, [demoIdx]);

  useEffect(() => {
    const rotate = setInterval(() => {
      setDemoIdx((i) => (i + 1) % DEMOS.length);
      setStep(0);
    }, 5500);
    return () => clearInterval(rotate);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            type="button"
            onClick={() => { setDemoIdx(i); setStep(0); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
              i === demoIdx
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <DemoComponent accent={accent} step={step} />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${step >= i ? "w-4 bg-blue-600" : "w-1 bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">Live product simulation · auto-plays like a demo GIF</p>
    </div>
  );
}

export function PlatformInteractiveDemoGrid({ accent = "#0A36F7" }) {
  const cards = [
    {
      id: "brand",
      tag: "White-label",
      title: "Branded club sidebar",
      desc: "Logo, colors & team switcher on every screen.",
      Demo: MiniBrandDemo,
    },
    {
      id: "calendar",
      tag: "Planning",
      title: "Periodized calendar",
      desc: "Mesocycles aligned to your training days — sessions pre-built.",
      Demo: MiniCalendarDemo,
    },
    {
      id: "loads",
      tag: "Loads",
      title: "Match-day integration",
      desc: "Sessions A/B/C/D + match load in one weekly view.",
      Demo: MiniLoadsDemo,
    },
    {
      id: "results",
      tag: "Results",
      title: "Player vs team average",
      desc: "Test ratings parents and sponsors can understand.",
      Demo: MiniResultsDemo,
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {cards.map(({ id, tag, title, desc, Demo }) => (
        <div key={id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative h-52 bg-[#FAFBFC] border-b border-gray-100 p-3 overflow-hidden">
            <span className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-gray-800 px-2 py-1 rounded-md shadow-sm border border-gray-100">
              {tag}
            </span>
            <div className="absolute inset-3 top-10">
              <Demo accent={accent} />
            </div>
            <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-white/90 px-2 py-0.5 rounded-full border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live demo
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Compact animated UI — branding & team switcher */
function MiniBrandDemo({ accent }) {
  const [team, setTeam] = useState(0);
  const teams = [
    { name: "U15 Elite", color: accent },
    { name: "U17 Pro", color: "#059669" },
    { name: "U13 Dev", color: "#7C3AED" },
  ];
  useEffect(() => {
    const t = setInterval(() => setTeam((i) => (i + 1) % teams.length), 2200);
    return () => clearInterval(t);
  }, []);
  const active = teams[team];
  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm flex overflow-hidden text-[9px]">
      <div className="w-[38%] border-r border-gray-100 p-2 space-y-1" style={{ backgroundColor: active.color + "08" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-white font-black text-[7px]" style={{ backgroundColor: active.color }}>RF</div>
          <span className="font-bold text-gray-800 truncate">Riverside FC</span>
        </div>
        {teams.map((t, i) => (
          <div
            key={t.name}
            className={`px-2 py-1 rounded-md font-semibold transition-all duration-500 ${i === team ? "text-white shadow-sm" : "text-gray-400"}`}
            style={i === team ? { backgroundColor: t.color } : {}}
          >
            {t.name}
          </div>
        ))}
      </div>
      <div className="flex-1 p-2">
        <div className="h-6 rounded-md mb-2 transition-colors duration-500" style={{ background: `linear-gradient(90deg, ${active.color}, ${active.color}99)` }} />
        <div className="space-y-1">
          {["Dashboard", "Microcycle", "Squad"].map((l, i) => (
            <div key={l} className={`h-4 rounded bg-gray-50 border border-gray-100 transition-opacity duration-300 ${i <= team ? "opacity-100" : "opacity-40"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Compact animated UI — mesocycle weeks */
function MiniCalendarDemo({ accent }) {
  const [week, setWeek] = useState(0);
  const weeks = [
    { w: "W1", sessions: ["A", "B", "C"], load: "Low" },
    { w: "W2", sessions: ["A", "B", "C"], load: "Med" },
    { w: "W3", sessions: ["A", "B", "D"], load: "High" },
    { w: "W4", sessions: ["Match", "A", "—"], load: "Peak" },
  ];
  useEffect(() => {
    const t = setInterval(() => setWeek((w) => (w + 1) % weeks.length), 1800);
    return () => clearInterval(t);
  }, []);
  const active = weeks[week];
  const loadColor = { Low: "#22C55E", Med: "#F59E0B", High: "#F97316", Peak: "#EF4444" }[active.load];
  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm p-2.5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[8px] font-bold text-gray-400 uppercase">Mesocycle 2 · Block B</span>
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: loadColor + "20", color: loadColor }}>{active.load}</span>
      </div>
      <div className="grid grid-cols-4 gap-1 mb-2">
        {weeks.map((wk, i) => (
          <div
            key={wk.w}
            className={`text-center py-1.5 rounded-md border transition-all duration-500 ${i === week ? "border-blue-300 bg-blue-50 shadow-sm scale-105" : "border-gray-100 opacity-50"}`}
          >
            <div className="text-[8px] font-black text-gray-700">{wk.w}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {["Mon", "Wed", "Fri"].map((day, i) => (
          <div key={day} className="rounded-md border border-gray-100 p-1.5 text-center">
            <div className="text-[7px] text-gray-400 font-bold">{day}</div>
            <div className="text-[10px] font-black transition-all duration-300" style={{ color: i < active.sessions.length ? accent : "#ccc" }}>
              {active.sessions[i] || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact animated UI — weekly load bars */
function MiniLoadsDemo({ accent }) {
  const [phase, setPhase] = useState(0);
  const bars = [
    { l: "Match", v: 72, c: "#EF4444" },
    { l: "A", v: 40, c: "#22C55E" },
    { l: "B", v: 89, c: "#F59E0B" },
    { l: "C", v: 65, c: "#F59E0B" },
  ];
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p >= bars.length ? 0 : p + 1)), 700);
    return () => clearInterval(t);
  }, []);
  const total = bars.slice(0, phase).reduce((s, b) => s + b.v, 0);
  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm p-2.5 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[8px] font-bold text-gray-400 uppercase">Weekly load</span>
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full transition-all ${phase >= 3 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
          {phase >= 3 ? `${total}% · Medium` : "Building…"}
        </span>
      </div>
      <div className="flex-1 flex items-end gap-1.5">
        {bars.map((b, i) => (
          <div key={b.l} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full bg-gray-100 rounded-t-md relative h-20 overflow-hidden">
              <div
                className="absolute bottom-0 w-full rounded-t-md transition-all duration-700 ease-out"
                style={{ height: phase > i ? `${b.v}%` : "0%", backgroundColor: b.c }}
              />
            </div>
            <span className="text-[8px] font-bold text-gray-500">{b.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact animated UI — test ratings vs average */
function MiniResultsDemo({ accent }) {
  const [step, setStep] = useState(0);
  const metrics = [
    { n: "Endurance T3", v: 545, pct: "+9%", c: "#22C55E" },
    { n: "Sprint T3", v: "2.78s", pct: "+4%", c: "#3B82F6" },
    { n: "Agility T3", v: 4.12, pct: "+6%", c: "#22C55E" },
  ];
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s >= metrics.length ? 0 : s + 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm p-2.5">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50">
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-black text-gray-600">JM</div>
        <div>
          <div className="text-[9px] font-bold text-gray-900">J. Morrison · CM</div>
          <div className="text-[7px] text-gray-400">vs team average</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {metrics.map((m, i) => (
          <div
            key={m.n}
            className={`flex items-center justify-between rounded-md px-2 py-1.5 border transition-all duration-500 ${
              step > i ? "border-gray-200 bg-gray-50 opacity-100 translate-x-0" : "border-transparent opacity-30 -translate-x-1"
            }`}
          >
            <span className="text-[8px] text-gray-500 font-semibold">{m.n}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-gray-800">{m.v}</span>
              <span className="text-[8px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: m.c + "18", color: m.c }}>{m.pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
