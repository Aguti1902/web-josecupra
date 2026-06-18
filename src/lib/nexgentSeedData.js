export const DEMO_PLAYERS = [
  { id: "p1", name: "Caio", position: "POR", avatar: "CM", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p2", name: "Vanderlan", position: "LI", avatar: "VN", loadBand: "alta", injuryRisk: "medio" },
  { id: "p3", name: "Murilo", position: "DFC", avatar: "MU", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p4", name: "Luis Felipe", position: "DFC", avatar: "LF", loadBand: "riesgo", injuryRisk: "alto" },
  { id: "p5", name: "Mayke", position: "LD", avatar: "MY", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p6", name: "Fabinho", position: "MC", avatar: "FB", loadBand: "alta", injuryRisk: "medio" },
  { id: "p7", name: "Jailson", position: "MC", avatar: "JL", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p8", name: "Luis Guilherme", position: "MP", avatar: "LG", loadBand: "alta", injuryRisk: "medio" },
  { id: "p9", name: "Estêvão", position: "ED", avatar: "ES", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p10", name: "Kevin", position: "EI", avatar: "KV", loadBand: "riesgo", injuryRisk: "alto" },
  { id: "p11", name: "Luighi", position: "DC", avatar: "LH", loadBand: "alta", injuryRisk: "medio" },
];

export const WEEKLY_LOAD = [
  { day: "L", load: 3200 },
  { day: "M", load: 4100 },
  { day: "X", load: 5800 },
  { day: "J", load: 3900 },
  { day: "V", load: 2900 },
  { day: "S", load: 7200 },
  { day: "D", load: 800 },
];

export function loadBandColor(band) {
  return { optima: "#22C55E", alta: "#F59E0B", riesgo: "#EF4444" }[band] ?? "#9CA3AF";
}

export function riskColor(risk) {
  return { bajo: "#22C55E", medio: "#F59E0B", alto: "#EF4444" }[risk] ?? "#9CA3AF";
}
