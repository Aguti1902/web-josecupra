import { useState, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Activity, Brain, Calendar, CheckCircle2, ChevronRight, Download,
  HeartPulse, MessageSquare, Search, Shield, Sparkles, TrendingUp, Users, Video, Zap,
  GraduationCap, BarChart3,
} from "lucide-react";
import { PALMEIRAS } from "../../../lib/nexgentConfig";

const CLUB = PALMEIRAS.accent;
const GOLD = "#FFD700";

function BrowserFrame({ title, children }) {
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
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: CLUB }}>
          SEP
        </div>
      </div>
      <div className="p-4 md:p-5 bg-[#FAFBFC] min-h-[300px]">{children}</div>
    </div>
  );
}

function SidebarMini({ active, t }) {
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
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-semibold transition-all duration-300 ${on ? "text-white shadow-sm" : "text-gray-500"}`}
            style={on ? { backgroundColor: CLUB } : {}}
          >
            <Icon size={11} /> {it.label}
          </div>
        );
      })}
    </div>
  );
}

function MiniLineChart({ title, unit, values, teamAvg, step }) {
  const { t } = useTranslation("nexgentPitch");
  const w = 130;
  const chartH = 36;
  const h = chartH + 10;
  const padX = 6;
  const padY = 5;
  const visibleCount = Math.min(step + 1, values.length);
  const visible = values.slice(0, visibleCount);
  const avgArr = teamAvg;
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
        <span className="text-[8px] font-black text-green-600">{visible[visible.length - 1]}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-11">
        <polyline points={avgPts} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 3" opacity={step >= 1 ? 1 : 0.35} />
        {visible.length >= 2 && <polyline points={playerPts} fill="none" stroke={CLUB} strokeWidth="2" />}
        {visible.map((v, i) => <circle key={i} cx={toX(i)} cy={toY(v)} r="2.5" fill={CLUB} stroke="#fff" strokeWidth="1" />)}
        {["T1", "T2", "T3"].map((l, i) => (
          <text key={l} x={toX(i)} y={h - 2} textAnchor="middle" fontSize="6" fill="#9CA3AF" fontWeight="bold">{l}</text>
        ))}
      </svg>
      <div className="flex gap-2 mt-0.5">
        <span className="text-[7px] text-gray-400 flex items-center gap-0.5">
          <span className="w-2 h-0.5 rounded" style={{ backgroundColor: CLUB }} /> {t("demos.ui.playerLegend")}
        </span>
        <span className="text-[7px] text-gray-400 flex items-center gap-0.5">
          <span className="w-2 h-0.5 border-t border-dashed border-gray-400" /> {t("demos.ui.teamAvgLegend")}
        </span>
      </div>
    </div>
  );
}

export function DemoDashboard({ step }) {
  const { t } = useTranslation("nexgentPitch");
  return (
    <BrowserFrame title="dashboard">
      <div className="flex gap-3">
        <SidebarMini active="dash" t={t} />
        <div className="flex-1 space-y-3">
          <div className="rounded-lg p-3 text-white" style={{ background: `linear-gradient(135deg, ${CLUB}, #004d2a)` }}>
            <div className="text-[10px] opacity-90 font-bold uppercase">{t("demos.clubName")}</div>
            <div className="text-sm font-black">{t("demos.ui.weekTeam")}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: t("demos.ui.players"), v: step >= 1 ? "142" : "—" },
              { l: t("demos.ui.sessionsCount"), v: step >= 1 ? "4" : "—" },
              { l: t("demos.ui.testsDone"), v: step >= 2 ? "91%" : "—" },
            ].map((s) => (
              <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                <div className="text-lg font-black text-gray-900">{s.v}</div>
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
          {step >= 3 && (
            <div className="flex gap-2">
              {["Estêvão", "Endrick", "Luis Felipe"].map((n, i) => (
                <div key={n} className="flex-1 bg-white rounded-lg border border-gray-100 p-2 text-center animate-fade-slide" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: CLUB }}>
                    {n[0]}
                  </div>
                  <div className="text-[8px] font-bold text-gray-700 truncate">{n}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoSessions({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const players = step >= 1 ? Math.min(3 + step, 8) : 0;
  return (
    <BrowserFrame title="sesiones / ia-táctica">
      <div className="flex gap-3">
        <SidebarMini active="plan" t={t} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-green-700" />
            <span className="text-xs font-black text-gray-900">{t("demos.ui.aiPrompt")}</span>
          </div>
          <div className={`bg-white rounded-lg border px-2.5 py-2 text-[10px] text-gray-600 transition-all duration-500 ${step >= 1 ? "border-green-200" : "border-gray-100 opacity-50"}`}>
            {t("demos.ui.promptText")}
          </div>
          <div className="rounded-lg h-32 relative overflow-hidden border-2 border-green-800/30" style={{ background: "linear-gradient(180deg, #1a7a4a 0%, #006437 100%)" }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.3) 19px, rgba(255,255,255,0.3) 20px)" }} />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40" />
            <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full border-2 border-white/50 -translate-x-1/2 -translate-y-1/2" />
            {[...Array(players)].map((_, i) => {
              const positions = [
                { x: "20%", y: "30%" }, { x: "35%", y: "55%" }, { x: "50%", y: "40%" },
                { x: "65%", y: "55%" }, { x: "80%", y: "30%" }, { x: "40%", y: "70%" },
                { x: "60%", y: "70%" }, { x: "50%", y: "20%" },
              ];
              const p = positions[i] || positions[0];
              return (
                <span
                  key={i}
                  className="absolute w-4 h-4 rounded-full border-2 animate-fade-slide"
                  style={{ left: p.x, top: p.y, backgroundColor: i % 2 ? GOLD : "#fff", borderColor: CLUB, animationDelay: `${i * 80}ms` }}
                />
              );
            })}
            {step >= 3 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[8px] font-bold text-white bg-black/40 px-2 py-1 rounded-full">
                <Sparkles size={10} /> SVG
              </div>
            )}
          </div>
          {step >= 4 && (
            <div className="text-[9px] font-bold text-green-700 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
              <CheckCircle2 size={10} /> {t("demos.ui.diagramReady")}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoLoads({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const sessions = [
    { l: "Match", v: step >= 1 ? 720 : "—", c: "#EF4444" },
    { l: "A", v: step >= 1 ? 405 : "—", c: "#22C55E" },
    { l: "B", v: step >= 2 ? 890 : "—", c: "#F59E0B" },
    { l: "C", v: step >= 2 ? 650 : "—", c: "#F59E0B" },
  ];
  const players = [
    { n: "Estêvão", load: step >= 3 ? "2.665" : "—", status: "optimal" },
    { n: "Endrick", load: step >= 3 ? "3.120" : "—", status: "high" },
    { n: "Luis F.", load: step >= 4 ? "3.890" : "—", status: "risk" },
  ];
  const statusColor = { optimal: "#22C55E", high: "#F59E0B", risk: "#EF4444" };
  const statusLabel = { optimal: t("demos.ui.loadOptimal"), high: t("demos.ui.loadHigh"), risk: t("demos.ui.loadRisk") };

  return (
    <BrowserFrame title="cargas / gps">
      <div className="flex gap-3">
        <SidebarMini active="loads" t={t} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase">{t("demos.ui.weeklyLoad")}</span>
            {step >= 2 && (
              <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 animate-fade-slide">
                {t("demos.ui.importGps")}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {sessions.map((s) => (
              <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                <div className="text-[8px] text-gray-400 font-bold">{s.l}</div>
                <div className="text-sm font-black" style={{ color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: step >= 3 ? "68%" : `${step * 18}%` }} />
          </div>
          {step >= 3 && (
            <div className="space-y-1">
              {players.map((p, i) => (
                <div key={p.n} className={`flex items-center justify-between bg-white rounded-lg border px-2 py-1.5 transition-all duration-500 ${step > i + 2 ? "opacity-100" : "opacity-40"}`}>
                  <span className="text-[9px] font-bold text-gray-800">{p.n}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black">{p.load} AU</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: statusColor[p.status] + "20", color: statusColor[p.status] }}>
                      {statusLabel[p.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoTests({ step }) {
  const { t } = useTranslation("nexgentPitch");
  return (
    <BrowserFrame title="tests / plantilla">
      <div className="flex gap-3">
        <SidebarMini active="tests" t={t} />
        <div className="flex-1 space-y-2">
          <div className="text-[9px] text-gray-500">
            <Trans i18nKey="demos.ui.ratedVsAvg" ns="nexgentPitch" components={{ strong: <strong /> }} />
          </div>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-gray-100 text-[8px] font-bold text-gray-400 uppercase">
              <div className="bg-gray-50 p-1.5">{t("demos.ui.playerCol")}</div>
              {["T1", "T2", "T3"].map((c) => <div key={c} className="bg-gray-50 p-1.5 text-center">{c}</div>)}
            </div>
            <div className="grid grid-cols-4 gap-px bg-gray-100">
              <div className="bg-white p-1.5 text-[9px] font-bold text-gray-800">Estêvão</div>
              {["8.1", "8.3", step >= 2 ? "8.4" : "—"].map((v, i) => (
                <div key={i} className="bg-white p-1.5 text-center">
                  <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded transition-all duration-700 ${step > i ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={`grid grid-cols-2 gap-1.5 transition-all duration-500 ${step >= 1 ? "opacity-100" : "opacity-30"}`}>
            <MiniLineChart title={t("demos.ui.endurance")} unit="" values={[7.8, 8.1, 8.4]} teamAvg={[7.5, 7.7, 7.8]} step={step} />
            <MiniLineChart title={t("demos.ui.sprint")} unit="s" values={[3.98, 3.95, 3.92]} teamAvg={[4.02, 4.0, 3.98]} step={step} />
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

export function DemoChat({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const msgs = [
    { role: "coach", text: t("demos.ui.chatMsg1"), channel: t("demos.ui.channelCoach") },
    { role: "med", text: t("demos.ui.chatMsg2"), channel: t("demos.ui.channelMed") },
    { role: "scout", text: t("demos.ui.chatMsg3"), channel: t("demos.ui.channelScout") },
  ];
  return (
    <BrowserFrame title="chat / staff">
      <div className="flex gap-3">
        <div className="w-24 flex-shrink-0 border-r border-gray-200 pr-2 space-y-1">
          {[t("demos.ui.channelCoach"), t("demos.ui.channelMed"), t("demos.ui.channelScout")].map((ch, i) => (
            <div key={ch} className={`text-[8px] font-bold px-2 py-1.5 rounded-lg transition-all duration-300 ${step >= i ? "bg-green-50 text-green-800 border border-green-100" : "text-gray-400"}`}>
              <MessageSquare size={9} className="inline mr-1" />{ch}
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          {msgs.map((m, i) => (
            <div key={i} className={`transition-all duration-500 ${step > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <div className="text-[8px] font-bold text-gray-400 mb-0.5">{m.channel}</div>
              <div className="bg-white rounded-lg border border-gray-100 px-2.5 py-2 text-[10px] text-gray-700">{m.text}</div>
            </div>
          ))}
          {step >= 3 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 animate-fade-slide">
              <div className="flex items-center gap-1 text-[9px] font-bold text-amber-800 mb-1">
                <Sparkles size={11} /> {t("demos.ui.aiSummary")}
              </div>
              <p className="text-[9px] text-amber-900 leading-relaxed">{t("demos.ui.aiSummaryText")}</p>
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoScouting({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const attrs = [
    { l: t("demos.ui.attrPhysical"), v: step >= 1 ? 8 : 0 },
    { l: t("demos.ui.attrTechnical"), v: step >= 2 ? 9 : 0 },
    { l: t("demos.ui.attrTactical"), v: step >= 2 ? 8 : 0 },
    { l: t("demos.ui.attrAttitude"), v: step >= 3 ? 9 : 0 },
  ];
  return (
    <BrowserFrame title="scouting / informes">
      <div className="flex gap-3">
        <SidebarMini active="squad" t={t} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Search size={12} className="text-gray-400" />
            <span className="text-xs font-black text-gray-900">{t("demos.ui.scoutTarget")}</span>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-2.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-black">MC</div>
              <div>
                <div className="text-[10px] font-bold text-gray-900">Matheus Cunha · MC</div>
                <div className="text-[8px] text-gray-400">Sub-20 · Objetivo Q3</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {attrs.map((a) => (
                <div key={a.l} className="rounded-md bg-gray-50 p-1.5">
                  <div className="text-[8px] text-gray-400 font-bold">{a.l}</div>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${a.v * 10}%`, backgroundColor: CLUB }} />
                  </div>
                  <div className="text-[9px] font-black text-gray-800 mt-0.5">{a.v || "—"}/10</div>
                </div>
              ))}
            </div>
          </div>
          {step >= 4 && (
            <div className="text-[9px] font-bold text-green-600 flex items-center gap-1">
              <CheckCircle2 size={10} /> {t("demos.ui.scoutingReport")}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoPdf({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const lines = [t("demos.ui.pdfLine1"), t("demos.ui.pdfLine2"), t("demos.ui.pdfLine3")];
  return (
    <BrowserFrame title="sesión · export-pdf">
      <div className="flex gap-3">
        <SidebarMini active="plan" t={t} />
        <div className="flex-1 relative min-h-[220px]">
          <div className={`space-y-2 transition-all duration-500 ${step >= 3 ? "opacity-20 blur-[1px]" : "opacity-100"}`}>
            <div className="text-xs font-black text-gray-900">{t("demos.ui.sessionTitle")} · 90 min</div>
            {lines.map((line, i) => (
              <div key={line} className={`bg-white rounded-lg border px-2.5 py-2 text-[10px] text-gray-700 transition-all duration-500 ${step > i ? "border-gray-200" : "border-gray-100 opacity-40"}`}>
                {line}
              </div>
            ))}
            <div className={`mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all duration-500 ${step >= 1 ? "text-white shadow-md scale-105" : "bg-gray-100 text-gray-400"}`} style={step >= 1 ? { backgroundColor: CLUB } : {}}>
              <Download size={12} /> {t("demos.ui.exportPdf")}
            </div>
          </div>
          {step >= 2 && (
            <div className="absolute inset-x-0 top-2 flex justify-center pointer-events-none">
              <div className={`bg-white border-2 border-gray-200 shadow-2xl rounded-lg p-3 w-[88%] transition-all duration-500 ${step >= 2 ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: CLUB }}>SEP</div>
                  <div>
                    <div className="text-[10px] font-black text-gray-900">{t("demos.clubName")}</div>
                    <div className="text-[8px] text-gray-400">{t("demos.ui.weekTeam")}</div>
                  </div>
                </div>
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`h-2 rounded bg-gray-100 mb-1.5 transition-all duration-300 ${step >= n + 1 ? "w-full" : "w-2/3"}`} />
                ))}
                {step >= 4 && (
                  <div className="mt-2 text-[9px] font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={11} /> {t("demos.ui.pdfReady")}
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

export function DemoBrand({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const teams = [
    { name: "Sub-20", color: CLUB },
    { name: "Sub-17", color: "#059669" },
    { name: "Sub-15", color: "#7C3AED" },
  ];
  const teamIdx = step >= 3 ? 2 : step >= 2 ? 1 : 0;
  const active = teams[teamIdx];

  return (
    <BrowserFrame title="club · white-label">
      <div className="flex gap-3">
        <div className="w-28 flex-shrink-0 border-r border-gray-200 pr-3 space-y-0.5" style={{ backgroundColor: active.color + "06" }}>
          <div className="flex items-center gap-1.5 px-2 mb-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[8px] font-black transition-colors duration-500" style={{ backgroundColor: active.color }}>SEP</div>
            <span className="text-[8px] font-bold text-gray-700 truncate">Palmeiras</span>
          </div>
          {teams.map((tm, i) => (
            <div key={tm.name} className={`px-2 py-1.5 rounded-lg text-[9px] font-semibold transition-all duration-500 ${i === teamIdx ? "text-white shadow-sm" : "text-gray-400"}`} style={i === teamIdx ? { backgroundColor: tm.color } : {}}>
              {tm.name}
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <div className="rounded-lg p-3 text-white transition-all duration-500" style={{ background: `linear-gradient(135deg, ${active.color}, ${active.color}cc)` }}>
            <div className="text-[10px] font-bold opacity-90">{t("demos.ui.brandPreview")}</div>
            <div className="text-sm font-black">{active.name}</div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[Shield, Users, Calendar, Activity].map((Icon, i) => (
              <div key={i} className={`bg-white rounded-lg border p-2 flex items-center gap-2 transition-all duration-300 ${step > i ? "border-gray-200" : "opacity-40"}`}>
                <Icon size={14} style={{ color: active.color }} />
                <div className="h-2 flex-1 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
          {step >= 4 && (
            <div className="text-[9px] font-bold flex items-center gap-1" style={{ color: active.color }}>
              <CheckCircle2 size={10} /> {t("demos.ui.brandApplied")}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoMedical({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const players = [
    { n: "Luis Felipe", status: "readapt", phase: step >= 1 ? "Fase 2" : "—", color: "#F59E0B" },
    { n: "Murilo", status: "available", phase: step >= 2 ? "100%" : "—", color: "#22C55E" },
    { n: "Rony", status: "alert", phase: step >= 3 ? "Revisión" : "—", color: "#EF4444" },
  ];
  return (
    <BrowserFrame title="médico / readaptación">
      <div className="flex gap-3">
        <SidebarMini active="squad" t={t} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <HeartPulse size={14} className="text-red-500" />
            <span className="text-xs font-black text-gray-900">{t("demos.ui.medicalTitle")}</span>
          </div>
          {players.map((p, i) => (
            <div key={p.n} className={`flex items-center justify-between bg-white rounded-lg border px-2.5 py-2 transition-all duration-500 ${step > i ? "opacity-100" : "opacity-35"}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black">{p.n[0]}</div>
                <div>
                  <div className="text-[10px] font-bold text-gray-900">{p.n}</div>
                  <div className="text-[8px] text-gray-400">{t(`demos.ui.medStatus_${p.status}`)}</div>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: p.color + "20", color: p.color }}>{p.phase}</span>
            </div>
          ))}
          {step >= 4 && (
            <div className="text-[9px] font-bold text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 flex items-center gap-1">
              <Sparkles size={10} /> {t("demos.ui.medAlertSync")}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoAcademy({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const categories = ["Sub-20", "Sub-17", "Sub-15", "Sub-13"];
  const active = step >= 3 ? 3 : step >= 2 ? 2 : step >= 1 ? 1 : 0;
  return (
    <BrowserFrame title="cantera / categorías">
      <div className="flex gap-3">
        <div className="w-28 flex-shrink-0 border-r border-gray-200 pr-3 space-y-0.5">
          <div className="text-[8px] font-bold text-gray-400 uppercase mb-2 px-2">{t("demos.ui.academyLabel")}</div>
          {categories.map((c, i) => (
            <div key={c} className={`px-2 py-1.5 rounded-lg text-[9px] font-semibold transition-all duration-300 ${i === active ? "text-white shadow-sm" : "text-gray-500"}`} style={i === active ? { backgroundColor: CLUB } : {}}>
              {c}
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <GraduationCap size={14} style={{ color: CLUB }} />
            <span className="text-xs font-black text-gray-900">{categories[active]}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { l: t("demos.ui.players"), v: step >= 1 ? "38" : "—" },
              { l: t("demos.ui.prospect"), v: step >= 2 ? "12" : "—" },
              { l: t("demos.ui.promoted"), v: step >= 3 ? "3" : "—" },
            ].map((s) => (
              <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                <div className="text-lg font-black">{s.v}</div>
                <div className="text-[8px] text-gray-400 font-bold uppercase">{s.l}</div>
              </div>
            ))}
          </div>
          {step >= 4 && (
            <div className="text-[9px] text-green-700 font-bold bg-green-50 rounded-lg px-2 py-1.5">{t("demos.ui.academyNoGps")}</div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoVideo({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const tags = [t("demos.ui.tagPress"), t("demos.ui.tagTransition"), t("demos.ui.tagFinish")];
  return (
    <BrowserFrame title="vídeo / análisis">
      <div className="flex gap-3">
        <SidebarMini active="plan" t={t} />
        <div className="flex-1 space-y-2">
          <div className="rounded-lg bg-gray-900 h-24 relative overflow-hidden flex items-center justify-center">
            <Video size={28} className="text-white/40" />
            {step >= 1 && (
              <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${25 + step * 18}%` }} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span key={tag} className={`text-[8px] font-bold px-2 py-0.5 rounded-full border transition-all duration-500 ${step > i ? "bg-green-50 border-green-200 text-green-800" : "border-gray-200 text-gray-400"}`}>
                {tag}
              </span>
            ))}
          </div>
          {step >= 3 && (
            <div className="text-[9px] font-bold text-blue-700 flex items-center gap-1">
              <Sparkles size={10} /> {t("demos.ui.videoAiTags")}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoDirection({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const kpis = [
    { l: t("demos.ui.kpiAdherence"), v: step >= 1 ? "94%" : "—", c: "#22C55E" },
    { l: t("demos.ui.kpiLoad"), v: step >= 2 ? "Óptima" : "—", c: "#0A36F7" },
    { l: t("demos.ui.kpiInjuries"), v: step >= 3 ? "-18%" : "—", c: "#22C55E" },
    { l: t("demos.ui.kpiProspects"), v: step >= 4 ? "+6" : "—", c: CLUB },
  ];
  return (
    <BrowserFrame title="dirección / kpis">
      <div className="flex gap-3">
        <SidebarMini active="dash" t={t} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} style={{ color: CLUB }} />
            <span className="text-xs font-black text-gray-900">{t("demos.ui.directionTitle")}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {kpis.map((k, i) => (
              <div key={k.l} className={`bg-white rounded-lg border border-gray-100 p-2 transition-all duration-500 ${step > i ? "opacity-100" : "opacity-40"}`}>
                <div className="text-[8px] text-gray-400 font-bold uppercase">{k.l}</div>
                <div className="text-sm font-black" style={{ color: k.c }}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoMicrocycle({ step }) {
  const { t } = useTranslation("nexgentPitch");
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const sessions = ["A", "—", "B", "C", "—", "Match", "—"];
  return (
    <BrowserFrame title="microciclo / semana">
      <div className="flex gap-3">
        <SidebarMini active="plan" t={t} />
        <div className="flex-1">
          <div className="text-xs font-black text-gray-900 mb-2">{t("demos.ui.weekTeam")}</div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => (
              <div key={d} className={`text-center rounded-lg border p-1.5 transition-all duration-500 ${step > i ? "border-green-200 bg-green-50" : "border-gray-100 opacity-40"}`}>
                <div className="text-[8px] font-bold text-gray-400">{d}</div>
                <div className="text-[10px] font-black mt-0.5" style={{ color: sessions[i] === "Match" ? "#EF4444" : CLUB }}>{sessions[i]}</div>
              </div>
            ))}
          </div>
          {step >= 4 && (
            <div className="mt-2 text-[9px] font-bold text-green-700">{t("demos.ui.microSynced")}</div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

const DEMO_MAP = {
  dashboard: DemoDashboard,
  microcycle: DemoMicrocycle,
  sessions: DemoSessions,
  loads: DemoLoads,
  tests: DemoTests,
  medical: DemoMedical,
  academy: DemoAcademy,
  chat: DemoChat,
  scouting: DemoScouting,
  video: DemoVideo,
  direction: DemoDirection,
  pdf: DemoPdf,
  brand: DemoBrand,
};

export function FeatureDemo({ id, step }) {
  const Demo = DEMO_MAP[id];
  if (!Demo) return null;
  return <Demo step={step} />;
};

export function HeroAnimatedDemo() {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);
  const demos = ["dashboard", "sessions", "loads", "tests"];

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s >= 4 ? 0 : s + 1)), 650);
    return () => clearInterval(t);
  }, [idx]);

  useEffect(() => {
    const r = setInterval(() => setIdx((i) => (i + 1) % demos.length), 4000);
    return () => clearInterval(r);
  }, []);

  const Demo = DEMO_MAP[demos[idx]];
  return <Demo step={step} />;
}

const FEATURE_IDS = [
  "dashboard", "microcycle", "sessions", "loads", "tests",
  "medical", "academy", "chat", "scouting", "video", "direction", "pdf", "brand",
];

export default function NexGentFeatureShowcase() {
  const { t } = useTranslation("nexgentPitch");
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);
  const featureId = FEATURE_IDS[idx];
  const Demo = DEMO_MAP[featureId];

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s >= 4 ? 0 : s + 1)), 750);
    return () => clearInterval(timer);
  }, [idx]);

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      <div className="lg:sticky lg:top-28">
        <Demo step={step} />
        <p className="text-center text-xs text-gray-400 mt-4">{t("platform.demoHint")}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t("platform.capabilities")}</p>
        <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
          {FEATURE_IDS.map((id, i) => {
            const active = i === idx;
            const bullets = t(`features.${id}.bullets`, { returnObjects: true });
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setIdx(i); setStep(0); }}
                className={`w-full text-left rounded-xl border p-4 transition-all ${active ? "border-green-200 bg-green-50/60 shadow-sm ring-1 ring-green-100" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-bold text-sm ${active ? "text-gray-900" : "text-gray-700"}`}>{t(`features.${id}.title`)}</h3>
                    <p className={`text-xs mt-0.5 ${active ? "text-gray-600" : "text-gray-400"}`}>{t(`features.${id}.summary`)}</p>
                  </div>
                  {active && <ChevronRight size={16} className="text-green-700 flex-shrink-0" />}
                </div>
                {active && Array.isArray(bullets) && (
                  <ul className="mt-3 space-y-1.5">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
