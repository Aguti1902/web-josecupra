/** Demo data for interactive club dashboard explorer */

export const TEAMS = [
  { id: "u13", name: "Sub-13 A", players: 20 },
  { id: "u15", name: "Sub-15 A", players: 22 },
  { id: "u17", name: "Juvenil A", players: 24 },
];

export const SQUAD = [
  { id: "p01", name: "Pol García", num: 1, pos: "GK", posGroup: "gk", plan: "Premium", tests: "done", age: 14, foot: "Right", load: "Medium" },
  { id: "p02", name: "Sergi Costa", num: 13, pos: "GK", posGroup: "gk", plan: "Basic", tests: "done", age: 14, foot: "Left", load: "Low" },
  { id: "p03", name: "Marc Vidal", num: 2, pos: "CB", posGroup: "def", plan: "Premium", tests: "done", age: 15, foot: "Right", load: "Medium" },
  { id: "p04", name: "Joel Martí", num: 3, pos: "CB", posGroup: "def", plan: "Basic", tests: "done", age: 15, foot: "Right", load: "High" },
  { id: "p05", name: "Arnau Soler", num: 4, pos: "LB", posGroup: "def", plan: "Premium", tests: "pending", age: 14, foot: "Left", load: "Medium" },
  { id: "p06", name: "Iván Torres", num: 5, pos: "RB", posGroup: "def", plan: "Basic", tests: "done", age: 15, foot: "Right", load: "Low" },
  { id: "p07", name: "Nil Puig", num: 6, pos: "CDM", posGroup: "mid", plan: "Premium", tests: "done", age: 15, foot: "Right", load: "Medium" },
  { id: "p08", name: "Alex Ruiz", num: 8, pos: "CM", posGroup: "mid", plan: "Premium", tests: "done", age: 15, foot: "Both", load: "Medium" },
  { id: "p09", name: "Oriol Camps", num: 10, pos: "CAM", posGroup: "mid", plan: "Premium", tests: "done", age: 15, foot: "Left", load: "High" },
  { id: "p10", name: "Pau Domènech", num: 14, pos: "LM", posGroup: "mid", plan: "Basic", tests: "pending", age: 14, foot: "Left", load: "Low" },
  { id: "p11", name: "Gerard Font", num: 16, pos: "RM", posGroup: "mid", plan: "Basic", tests: "done", age: 15, foot: "Right", load: "Medium" },
  { id: "p12", name: "Jan Roca", num: 18, pos: "CM", posGroup: "mid", plan: "Premium", tests: "done", age: 14, foot: "Right", load: "Medium" },
  { id: "p13", name: "Hugo Sánchez", num: 20, pos: "LW", posGroup: "fwd", plan: "Basic", tests: "done", age: 15, foot: "Right", load: "High" },
  { id: "p14", name: "Mateu Gil", num: 7, pos: "RW", posGroup: "fwd", plan: "Premium", tests: "done", age: 15, foot: "Left", load: "Medium" },
  { id: "p15", name: "Bruno Navarro", num: 9, pos: "ST", posGroup: "fwd", plan: "Premium", tests: "done", age: 15, foot: "Right", load: "Peak" },
  { id: "p16", name: "Eric Mas", num: 11, pos: "ST", posGroup: "fwd", plan: "Basic", tests: "pending", age: 14, foot: "Right", load: "Medium" },
  { id: "p17", name: "Roger Planas", num: 15, pos: "CB", posGroup: "def", plan: "Basic", tests: "done", age: 14, foot: "Right", load: "Low" },
  { id: "p18", name: "Martí Boix", num: 17, pos: "CM", posGroup: "mid", plan: "Basic", tests: "done", age: 14, foot: "Right", load: "Medium" },
  { id: "p19", name: "Lucas Pérez", num: 19, pos: "RW", posGroup: "fwd", plan: "Premium", tests: "done", age: 14, foot: "Right", load: "Low" },
  { id: "p20", name: "Adrià Morales", num: 21, pos: "LB", posGroup: "def", plan: "Basic", tests: "pending", age: 14, foot: "Left", load: "Medium" },
  { id: "p21", name: "Unai Ferrer", num: 22, pos: "CDM", posGroup: "mid", plan: "Basic", tests: "done", age: 14, foot: "Right", load: "Low" },
  { id: "p22", name: "Dani Climent", num: 23, pos: "ST", posGroup: "fwd", plan: "Premium", tests: "done", age: 15, foot: "Left", load: "Medium" },
];

export const PLAYER_TESTS = {
  p08: {
    endurance: { t1: 500, t2: 520, t3: 545, rating: "Excellent", pct: "+9%" },
    sprint: { t1: 2.92, t2: 2.84, t3: 2.78, rating: "Good", pct: "+4%" },
    agility: { t1: 4.35, t2: 4.22, t3: 4.12, rating: "Good", pct: "+6%" },
    jump: { t1: 38, t2: 40, t3: 42, rating: "Excellent", pct: "+8%" },
  },
};

export const DEPRO_VIDEO_LOGO = "/logo.png";

export const SESSIONS = {
  "mon-a": {
    id: "mon-a",
    day: "Monday",
    date: "2026-06-16",
    type: "A",
    framework: "Extensive",
    title: "Session A · Extensive",
    duration: 45,
    rpe: 3,
    load: 405,
    color: "#3B82F6",
    objective: "Technical possession · aerobic base · low neuromuscular load",
    blocks: [
      {
        id: "warmup",
        label: "Warm-up",
        exercises: [
          { id: "e1", name: "Dynamic activation", duration: "8 min", sets: "1", reps: "—", hasVideo: true, desc: "Joint mobility + progressive run." },
          { id: "e2", name: "Rondo 4v2", duration: "12 min", sets: "3", reps: "2 min", hasVideo: true, desc: "Positional play · 12×12 m · 2 touch max." },
        ],
      },
      {
        id: "main",
        label: "Main block",
        exercises: [
          { id: "e3", name: "Possession 8v8", duration: "25 min", sets: "4", reps: "5 min", hasVideo: true, desc: "Keep ball · width channels · build through thirds." },
        ],
      },
      {
        id: "tasks",
        label: "Task designer",
        exercises: [
          { id: "e4", name: "Positional rondo", duration: "10 min", sets: "2", reps: "5 min", hasVideo: true, desc: "A-framework task · cues synced to PDF." },
        ],
      },
    ],
  },
  "wed-b": {
    id: "wed-b",
    day: "Wednesday",
    date: "2026-06-18",
    type: "B",
    framework: "Intensive",
    title: "Session B · Intensive",
    duration: 75,
    rpe: 7,
    load: 890,
    color: "#F59E0B",
    objective: "High pressing · regain in final third · anaerobic stimulus",
    blocks: [
      {
        id: "warmup",
        label: "Warm-up",
        exercises: [
          { id: "e5", name: "Activation + sprints", duration: "10 min", sets: "1", reps: "—", hasVideo: true, desc: "4×15 m accelerations." },
          { id: "e6", name: "Rondo 5v2 high tempo", duration: "12 min", sets: "3", reps: "3 min", hasVideo: true, desc: "One-touch when possible · immediate press on loss." },
        ],
      },
      {
        id: "main",
        label: "Main block",
        exercises: [
          { id: "e7", name: "Pressing triggers 8v8", duration: "25 min", sets: "5", reps: "4 min", hasVideo: true, desc: "Trap on bad touch · counter within 6 sec." },
          { id: "e8", name: "Possession under pressure", duration: "18 min", sets: "3", reps: "6 min", hasVideo: true, desc: "Play out vs high block." },
        ],
      },
      {
        id: "tasks",
        label: "Task designer",
        exercises: [
          { id: "e9", name: "4v4 transitions", duration: "12 min", sets: "4", reps: "3 min", hasVideo: true, desc: "B-framework · win ball → attack in 8 sec." },
          { id: "e10", name: "Finishing after press", duration: "10 min", sets: "3", reps: "3 min", hasVideo: true, desc: "Shot within 2 touches after regain." },
        ],
      },
    ],
  },
  "fri-c": {
    id: "fri-c",
    day: "Friday",
    date: "2026-06-20",
    type: "C",
    framework: "Reactive",
    title: "Session C · Reactive",
    duration: 60,
    rpe: 5,
    load: 650,
    color: "#EF4444",
    objective: "Transition game · reactive speed · medium load",
    blocks: [
      {
        id: "warmup",
        label: "Warm-up",
        exercises: [
          { id: "e11", name: "Mobility + COD", duration: "10 min", sets: "1", reps: "—", hasVideo: true, desc: "Change of direction patterns." },
        ],
      },
      {
        id: "main",
        label: "Main block",
        exercises: [
          { id: "e12", name: "Transition 6v6+2", duration: "30 min", sets: "6", reps: "4 min", hasVideo: true, desc: "Score in 8 seconds or defend box." },
        ],
      },
      {
        id: "tasks",
        label: "Task designer",
        exercises: [
          { id: "e13", name: "Finishing game", duration: "15 min", sets: "3", reps: "5 min", hasVideo: true, desc: "C-framework reactive finishing." },
        ],
      },
    ],
  },
  "sat-match": {
    id: "sat-match",
    day: "Saturday",
    date: "2026-06-21",
    type: "M",
    framework: "Match",
    title: "Match vs Gimnàstic Manresa",
    duration: 90,
    rpe: 8,
    load: 720,
    color: "#6B7280",
    objective: "League fixture · load auto-tracked post-game",
    blocks: [
      {
        id: "main",
        label: "Match",
        exercises: [
          { id: "e14", name: "Competitive fixture", duration: "90 min", sets: "1", reps: "—", hasVideo: false, desc: "Official league match · GPS + sRPE post-match." },
        ],
      },
    ],
  },
};

/** Mesocycle 2 · June 2026 — calendar entries date → sessionId */
export const MESOCYCLE_CALENDAR = {
  "2026-06-02": { sessionId: "mon-a", week: 9, variant: "A1" },
  "2026-06-04": { sessionId: "wed-b", week: 9, variant: "B1" },
  "2026-06-06": { sessionId: "fri-c", week: 9, variant: "C1" },
  "2026-06-09": { sessionId: "mon-a", week: 10, variant: "A2" },
  "2026-06-11": { sessionId: "wed-b", week: 10, variant: "B2" },
  "2026-06-13": { sessionId: "fri-c", week: 10, variant: "C2" },
  "2026-06-14": { sessionId: "sat-match", week: 10, variant: "Match" },
  "2026-06-16": { sessionId: "mon-a", week: 11, variant: "A3" },
  "2026-06-18": { sessionId: "wed-b", week: 11, variant: "B3" },
  "2026-06-20": { sessionId: "fri-c", week: 11, variant: "C3" },
  "2026-06-21": { sessionId: "sat-match", week: 11, variant: "Match" },
  "2026-06-23": { sessionId: "mon-a", week: 12, variant: "A4" },
  "2026-06-25": { sessionId: "wed-b", week: 12, variant: "B4" },
  "2026-06-27": { sessionId: "fri-c", week: 12, variant: "C4" },
  "2026-06-28": { sessionId: "sat-match", week: 12, variant: "Match" },
};

export const MESO_START = "2026-06-01";
export const MESO_END = "2026-06-30";
export const CURRENT_WEEK = 12;

export const WEEK_LOADS = {
  "mon-a": { label: "A", au: 405, color: "#22C55E" },
  "wed-b": { label: "B", au: 890, color: "#F59E0B" },
  "fri-c": { label: "C", au: 650, color: "#F59E0B" },
  "sat-match": { label: "Match", au: 720, color: "#EF4444" },
};

export const TASK_FRAMEWORKS = [
  { fw: "A", label: "Extensive", color: "#3B82F6", tasks: ["Positional rondo", "Width possession", "Technical circuit"] },
  { fw: "B", label: "Intensive", color: "#F59E0B", tasks: ["Pressing trap", "4v4 transitions", "Finishing after press"] },
  { fw: "C", label: "Reactive", color: "#EF4444", tasks: ["Transition game", "Counter-attack", "Finishing"] },
  { fw: "D", label: "Complementary", color: "#10B981", tasks: ["Strength circuit", "Core stability", "Recovery run"] },
];

export const TASK_PARAMS = {
  A: { space: "40 × 30 m", players: "8v8", duration: "15 min × 2 sets" },
  B: { space: "30 × 20 m", players: "8v8 + 2 neutrals", duration: "12 min × 3 sets" },
  C: { space: "50 × 35 m", players: "6v6 + 2", duration: "10 min × 4 sets" },
  D: { space: "Gym / pitch", players: "Individual", duration: "20 min" },
};

export function getPlayerById(id) {
  return SQUAD.find((p) => p.id === id);
}

export function filterSquad(filter) {
  if (filter === "all") return SQUAD;
  if (filter === "premium") return SQUAD.filter((p) => p.plan === "Premium");
  if (filter === "pending") return SQUAD.filter((p) => p.tests === "pending");
  if (filter === "gk") return SQUAD.filter((p) => p.posGroup === "gk");
  if (filter === "def") return SQUAD.filter((p) => p.posGroup === "def");
  if (filter === "mid") return SQUAD.filter((p) => p.posGroup === "mid");
  if (filter === "fwd") return SQUAD.filter((p) => p.posGroup === "fwd");
  return SQUAD;
}

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  const rows = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
  return rows;
}

export function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
