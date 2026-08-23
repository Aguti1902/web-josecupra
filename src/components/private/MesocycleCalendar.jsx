import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { getSessionType } from "../../lib/periodization";
import { sessionPlanUrl } from "../../lib/sessionBlocks";
import { getSessionDisplayKey } from "../../lib/mesocycleTemplates";

const WEEKDAY_NAMES = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKDAY_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const SESSION_TYPE_COLOR = { A: "#3B82F6", B: "#F59E0B", C: "#EF4444", D: "#10B981" };
const SESSION_TYPE_LABEL = { A: "Extensiva", B: "Intensiva", C: "Reactiva", D: "Complementaria" };

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
  } catch { return 0; }
}
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function isoFromParts(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function sessionTypeOf(session) {
  if (session?.framework && SESSION_TYPE_COLOR[session.framework]) return session.framework;
  if (session?.protocol && SESSION_TYPE_COLOR[session.protocol]) return session.protocol;
  return getSessionType(session?.intensity);
}

/**
 * Calendario mensual del mesociclo (club y ProCoach).
 * Si la semana trae `weekStart` (lunes ISO) se usa para anclar el día asignado.
 */
export default function MesocycleCalendar({ activePlan, weeks, accent }) {
  const navigate = useNavigate();
  if (!activePlan?.startDate) return null;

  const start = new Date(`${activePlan.startDate}T12:00:00`);
  const end = new Date(`${activePlan.endDate || activePlan.startDate}T12:00:00`);
  const today = new Date();

  const months = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= endMonth) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur.setMonth(cur.getMonth() + 1);
  }

  const sessionDateMap = {};
  (weeks || []).forEach(({ sessions: weekSessions, weekStart }, wi) => {
    (weekSessions || []).forEach((session, si) => {
      if (!session.assignedDay) return;
      const weekBase = weekStart
        ? new Date(`${weekStart}T12:00:00`)
        : new Date(start.getFullYear(), start.getMonth(), start.getDate() + wi * 7);
      const targetDayIdx = WEEKDAY_FULL.findIndex((d) => d === session.assignedDay);
      if (targetDayIdx < 0) return;
      const curDayIdx = (weekBase.getDay() + 6) % 7;
      const diff = targetDayIdx - curDayIdx;
      const sessionDate = new Date(weekBase);
      sessionDate.setDate(sessionDate.getDate() + diff);
      const key = isoFromParts(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
      const sType = sessionTypeOf(session);
      const templateKey = getSessionDisplayKey({
        ...session,
        framework: session.framework || session.protocol || sType,
        templateKey: session.templateKey || (session.protocol ? `${session.protocol}${session.sessionVariant || 1}` : undefined),
      });
      sessionDateMap[key] = { session, weekIdx: wi, sType, templateKey, sessionNumber: wi * 3 + si + 1 };
    });
  });

  return (
    <div className="bg-white border border-depro-border rounded-2xl overflow-hidden mb-5">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-depro-border/60 bg-[#F8F9FB]">
        <Calendar size={15} className="text-depro-blue" />
        <span className="font-black text-depro-dark text-sm">Calendario del mesociclo</span>
        <div className="ml-auto flex items-center gap-3 text-[10px] text-depro-gray flex-wrap justify-end">
          {Object.entries(SESSION_TYPE_COLOR).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
              {type} · {SESSION_TYPE_LABEL[type]}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {months.map(({ year, month }) => {
          const rows = buildCalendarGrid(year, month);
          return (
            <div key={`${year}-${month}`}>
              <div className="text-sm font-black text-depro-dark mb-2">
                {MONTH_NAMES[month]} {year}
              </div>
              <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-depro-border">
                {WEEKDAY_NAMES.map((d) => (
                  <div key={d} className="bg-[#F8F9FB] text-center py-1.5 text-[10px] font-black text-depro-gray uppercase">
                    {d}
                  </div>
                ))}
                {rows.flat().map((day, ci) => {
                  if (!day) return <div key={`e-${ci}`} className="bg-[#F8F9FB] h-14" />;
                  const dateStr = isoFromParts(year, month, day);
                  const sessionInfo = sessionDateMap[dateStr];
                  const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                  const isInRange = dateStr >= activePlan.startDate && dateStr <= (activePlan.endDate || activePlan.startDate);

                  return (
                    <button
                      type="button"
                      key={dateStr}
                      disabled={!sessionInfo || !isInRange}
                      onClick={() => {
                        if (!sessionInfo?.session) return;
                        navigate(sessionPlanUrl(sessionInfo.session, {
                          tab: "resumen",
                          date: dateStr,
                          week: sessionInfo.weekIdx,
                        }));
                      }}
                      className={`bg-white relative flex flex-col items-center justify-center h-14 transition-colors ${
                        !isInRange ? "opacity-30" : ""
                      } ${sessionInfo && isInRange ? "cursor-pointer hover:bg-depro-gray-light/50" : "cursor-default"}`}
                      title={sessionInfo ? `${sessionInfo.templateKey} · ${dateStr}` : undefined}
                    >
                      {sessionInfo && (
                        <div className="absolute inset-1 rounded-lg opacity-20"
                          style={{ backgroundColor: SESSION_TYPE_COLOR[sessionInfo.sType] }} />
                      )}
                      <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                        <div className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all"
                          style={isToday
                            ? { backgroundColor: accent, color: contrastText(accent) }
                            : sessionInfo
                            ? { color: SESSION_TYPE_COLOR[sessionInfo.sType], fontWeight: 800 }
                            : { color: "#333333" }}>
                          {day}
                        </div>
                        {sessionInfo && (
                          <span className="text-[9px] font-black leading-none"
                            style={{ color: SESSION_TYPE_COLOR[sessionInfo.sType] }}>
                            {sessionInfo.templateKey}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
