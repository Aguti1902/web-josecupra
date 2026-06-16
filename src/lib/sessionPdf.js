/** Genera PDF imprimible de sesión (plantilla DEPRO + colores del club) */

import { getSessionBlocks, BLOCK_LABELS } from "./sessionBlocks";
import { resolveBlockGuideItems } from "./blockGuideItems";
import { FRAMEWORK_LABELS } from "./mesocycleTemplates";
import {
  normalizeTaskDesigner, resolveTaskParams, resolveTaskCues, resolveTaskRecommendations,
} from "./taskDesigner";

const DEPRO_BLUE = "#0A36F7";
const DEPRO_DARK = "#333333";
const DEPRO_CREAM = "#FBFBFB";
const DEPRO_CREAM_WARM = "#FFF8F0";

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function hexToRgb(hex) {
  const h = (hex || "#000000").replace("#", "");
  if (h.length < 6) return { r: 10, g: 54, b: 247 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function mixHex(a, b, t = 0.5) {
  const c1 = hexToRgb(a);
  const c2 = hexToRgb(b);
  return rgbToHex(
    c1.r + (c2.r - c1.r) * t,
    c1.g + (c2.g - c1.g) * t,
    c1.b + (c2.b - c1.b) * t
  );
}

function alphaHex(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function loadSelectedTasks(storageKey, taskDesigner) {
  const td = normalizeTaskDesigner(taskDesigner);
  const defaults = td.taskTypes.slice(0, 1);
  if (!storageKey) return defaults;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const data = JSON.parse(raw);
    if (Array.isArray(data.tasks) && data.tasks.length) return data.tasks;
    if (data.task) return [data.task];
    return defaults;
  } catch {
    return defaults;
  }
}

function normalizeTips(tips) {
  if (Array.isArray(tips)) return tips.filter(Boolean);
  if (tips) return String(tips).split("\n").map((s) => s.trim()).filter(Boolean);
  return [];
}

function safeHexColor(hex, fallback = DEPRO_BLUE) {
  if (!hex || typeof hex !== "string") return fallback;
  const h = hex.replace("#", "").trim();
  if (h.length === 3 && /^[0-9a-fA-F]{3}$/.test(h)) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  if (h.length >= 6 && /^[0-9a-fA-F]{6}/.test(h)) return `#${h.slice(0, 6)}`;
  return fallback;
}

function exerciseMeta(ex) {
  const parts = [];
  if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
  else if (ex.sets) parts.push(`${ex.sets} series`);
  if (ex.duration) parts.push(ex.duration);
  if (ex.rest) parts.push(`Desc. ${ex.rest}`);
  return parts.join(" · ");
}

function flattenExercises(block) {
  if (block?.subSessions?.length) {
    return block.subSessions.flatMap((sub) =>
      (sub.exercises || []).map((ex) => ({
        ...ex,
        subLabel: sub.label || sub.title || sub.name,
      }))
    );
  }
  return (block?.exercises || []).map((ex) => ({ ...ex, subLabel: null }));
}

function renderExerciseCard(ex, accent) {
  const meta = exerciseMeta(ex);
  const tipsList = normalizeTips(ex.tips);
  const tips = tipsList.length
    ? `<ul class="tips">${tipsList.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
    : "";
  const link = ex.videoUrl
    ? `<div class="field"><span class="field-label">Enlace</span><a class="field-link" href="${esc(ex.videoUrl)}">${esc(ex.videoUrl)}</a></div>`
    : "";
  return `
    <div class="exercise-card">
      ${ex.subLabel ? `<div class="sub-label">${esc(ex.subLabel)}</div>` : ""}
      <div class="field"><span class="field-label">Tarea</span><span class="field-value strong">${esc(ex.name || "—")}</span></div>
      ${ex.description ? `<div class="field"><span class="field-label">Explicación</span><span class="field-value">${esc(ex.description)}</span></div>` : ""}
      ${meta ? `<div class="field"><span class="field-label">Tiempo</span><span class="field-value">${esc(meta)}</span></div>` : ""}
      ${link}
      ${tips}
    </div>`;
}

function renderGuidePanel(items, accent) {
  if (!items?.length) return "";
  return `
    <div class="guide-panel" style="--panel-accent:${accent}">
      <div class="guide-title">Guía</div>
      ${items.map((item) => `
        <div class="guide-item">
          <div class="guide-label">${esc(item.label || item.title)}</div>
          <div class="guide-text">${esc(item.text || item.value)}</div>
        </div>`).join("")}
    </div>`;
}

function renderParamsGrid(params, accent) {
  const rows = [
    { label: "Espacio", value: params.space, icon: "📐" },
    { label: "Agrupación", value: params.grouping, icon: "👥" },
    { label: "Balones", value: params.balls, icon: "⚽" },
    { label: "Trabajo", value: params.work, icon: "⏱" },
    { label: "Descanso", value: params.rest, icon: "🛑" },
    { label: "Intensidad", value: params.intensity, icon: "🔋" },
  ];
  return `
    <div class="params-grid">
      ${rows.map(({ label, value, icon }) => `
        <div class="param-card" style="border-color:${alphaHex(accent, 0.2)}">
          <div class="param-icon">${icon}</div>
          <div class="param-label">${label}</div>
          <div class="param-value">${esc(value || "—")}</div>
        </div>`).join("")}
    </div>`;
}

function renderTaskSection(task, index, accent) {
  return `
    <div class="task-block">
      <div class="task-header" style="background:linear-gradient(135deg,${alphaHex(accent, 0.15)},${alphaHex(accent, 0.05)})">
        <span class="task-num">${index + 1}</span>
        <span class="task-name">${esc(task.name)}</span>
      </div>
      <div class="task-body">
        <div class="task-subtitle">Parámetros</div>
        ${renderParamsGrid(task.params, accent)}
        <div class="task-subtitle">Consignas</div>
        <ol class="cues-list">
          ${(task.cues || []).map((c) => `<li>${esc(c)}</li>`).join("")}
        </ol>
      </div>
    </div>`;
}

/** Construye payload completo para PDF de sesión club */
export function buildClubSessionPdfPayload({
  session,
  displayKey,
  sessionType,
  accentColor,
  taskStorageKey,
  clubName = "",
  teamName = "",
}) {
  const fw = sessionType || session.framework || "A";
  const blocks = getSessionBlocks(session);
  const warmBlock = blocks.find((b) => b.type === "calentamiento") || {};
  const mainBlock = blocks.find((b) => b.type === "principal") || {};
  const td = normalizeTaskDesigner(session.taskDesigner);
  const selectedTasks = loadSelectedTasks(taskStorageKey, session.taskDesigner);

  return {
    title: session.title || `Sesión ${displayKey}`,
    subtitle: session.objective || session.title || "",
    displayKey: displayKey || session.templateKey || fw,
    clubName,
    teamName,
    day: session.assignedDay || "",
    warmUp: {
      label: BLOCK_LABELS.calentamiento,
      duration: warmBlock.duration,
      exercises: flattenExercises(warmBlock),
      guideItems: resolveBlockGuideItems(warmBlock, "calentamiento", fw),
    },
    principal: {
      label: BLOCK_LABELS.principal,
      duration: mainBlock.duration,
      exercises: flattenExercises(mainBlock),
      guideItems: resolveBlockGuideItems(mainBlock, "principal", fw),
    },
    tasks: selectedTasks.map((name) => ({
      name,
      params: resolveTaskParams(td, fw),
      cues: resolveTaskCues(td, name, fw),
    })),
    recommendations: resolveTaskRecommendations(td, fw),
    meta: {
      duration: session.duration,
      type: FRAMEWORK_LABELS[fw] || fw,
      intensity: session.intensity,
      variant: session.templateKey || displayKey,
      framework: fw,
      space: session.space,
      objective: session.objective,
    },
    brandColor: accentColor || DEPRO_BLUE,
  };
}

function buildStyles(brand, clubAccent) {
  const accent = clubAccent || brand;
  const gradStart = mixHex(DEPRO_BLUE, accent, 0.35);
  const gradMid = mixHex(accent, DEPRO_CREAM_WARM, 0.55);
  const gradEnd = DEPRO_CREAM;

  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    @page{size:A4;margin:0}
    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .page{page-break-after:always;break-after:page}
      .page:last-child{page-break-after:auto;break-after:auto}
      .no-print{display:none!important}
    }
    body{
      font-family:'Inter',system-ui,sans-serif;
      color:${DEPRO_DARK};
      background:${gradEnd};
      line-height:1.45;
      font-size:11px;
    }
    .doc{max-width:794px;margin:0 auto;background:white}
    .page{
      min-height:1122px;
      padding:0;
      position:relative;
      overflow:hidden;
      background:white;
    }
    .top-bar{
      height:6px;
      background:linear-gradient(90deg,${DEPRO_BLUE} 0%,${accent} 55%,${mixHex(accent, "#F59E0B", 0.4)} 100%);
    }
    .hero{
      padding:28px 36px 24px;
      background:linear-gradient(135deg,${gradStart} 0%,${gradMid} 52%,${gradEnd} 100%);
      position:relative;
    }
    .hero::after{
      content:'';
      position:absolute;
      right:-40px;top:-40px;
      width:180px;height:180px;
      border-radius:50%;
      background:${alphaHex(accent, 0.12)};
    }
    .hero-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      margin-bottom:20px;
      position:relative;
      z-index:1;
    }
    .logo-wrap{display:flex;align-items:center;gap:12px}
    .logo{height:32px;width:auto;object-fit:contain}
    .club-meta{text-align:right}
    .club-name{font-size:13px;font-weight:800;color:${DEPRO_DARK}}
    .team-name{font-size:10px;font-weight:600;color:#6B7280;margin-top:2px}
    .session-badge{
      display:inline-flex;align-items:center;gap:6px;
      background:${alphaHex(accent, 0.18)};
      border:1px solid ${alphaHex(accent, 0.35)};
      color:${accent};
      font-size:10px;font-weight:800;
      padding:5px 12px;border-radius:999px;
      text-transform:uppercase;letter-spacing:0.06em;
      margin-bottom:10px;
    }
    .session-key{
      font-size:42px;font-weight:900;line-height:1;
      color:${DEPRO_DARK};letter-spacing:-0.03em;
    }
    .session-title{
      font-size:20px;font-weight:800;color:${DEPRO_DARK};
      margin-top:6px;max-width:520px;
    }
    .session-sub{
      font-size:12px;color:#6B7280;margin-top:4px;max-width:520px;
    }
    .content{padding:24px 36px 36px}
    .section-head{
      display:flex;align-items:center;gap:10px;
      margin-bottom:14px;padding-bottom:8px;
      border-bottom:2px solid ${alphaHex(accent, 0.25)};
    }
    .section-icon{
      width:28px;height:28px;border-radius:8px;
      display:flex;align-items:center;justify-content:center;
      background:${alphaHex(accent, 0.15)};
      font-size:14px;
    }
    .section-title{
      font-size:14px;font-weight:900;text-transform:uppercase;
      letter-spacing:0.08em;color:${DEPRO_DARK};
    }
    .section-duration{
      margin-left:auto;font-size:10px;font-weight:700;
      color:#6B7280;background:${DEPRO_CREAM};
      padding:4px 10px;border-radius:999px;
    }
    .summary-grid{
      display:grid;grid-template-columns:repeat(4,1fr);gap:10px;
      margin-bottom:28px;
    }
    .summary-card{
      background:${DEPRO_CREAM};
      border:1px solid #E5E7EB;border-radius:12px;padding:12px 14px;
    }
    .summary-label{
      font-size:9px;font-weight:800;text-transform:uppercase;
      letter-spacing:0.08em;color:#6B7280;margin-bottom:4px;
    }
    .summary-value{font-size:13px;font-weight:800;color:${DEPRO_DARK}}
    .two-col{
      display:grid;grid-template-columns:1.15fr 0.85fr;gap:16px;
      align-items:start;
    }
    .col-title{
      font-size:10px;font-weight:800;text-transform:uppercase;
      letter-spacing:0.06em;color:#6B7280;margin-bottom:10px;
    }
    .exercise-card{
      background:white;border:1px solid #E5E7EB;
      border-radius:12px;padding:12px 14px;margin-bottom:10px;
      border-left:3px solid ${accent};
    }
    .sub-label{
      font-size:9px;font-weight:800;color:${accent};
      text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;
    }
    .field{margin-bottom:6px}
    .field-label{
      display:block;font-size:9px;font-weight:800;
      text-transform:uppercase;letter-spacing:0.06em;color:#9CA3AF;
    }
    .field-value{font-size:11px;color:${DEPRO_DARK}}
    .field-value.strong{font-weight:800;font-size:12px}
    .field-link{font-size:10px;color:${DEPRO_BLUE};word-break:break-all}
    .tips{margin:6px 0 0 14px;font-size:10px;color:#6B7280}
    .tips li{margin-bottom:2px}
    .guide-panel{
      background:linear-gradient(160deg,${alphaHex(accent, 0.08)},${DEPRO_CREAM});
      border:1px solid ${alphaHex(accent, 0.2)};
      border-radius:14px;padding:14px;
    }
    .guide-title{
      font-size:10px;font-weight:900;text-transform:uppercase;
      letter-spacing:0.08em;color:var(--panel-accent);margin-bottom:10px;
    }
    .guide-item{
      background:white;border-radius:10px;padding:10px 12px;
      margin-bottom:8px;border:1px solid #E5E7EB;
    }
    .guide-item:last-child{margin-bottom:0}
    .guide-label{font-size:9px;font-weight:800;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em}
    .guide-text{font-size:11px;font-weight:600;color:${DEPRO_DARK};margin-top:3px}
    .task-block{
      border:1px solid #E5E7EB;border-radius:14px;
      overflow:hidden;margin-bottom:14px;
    }
    .task-header{
      display:flex;align-items:center;gap:10px;
      padding:12px 16px;
    }
    .task-num{
      width:26px;height:26px;border-radius:8px;
      background:${accent};color:white;
      font-size:12px;font-weight:900;
      display:flex;align-items:center;justify-content:center;
    }
    .task-name{font-size:14px;font-weight:900;color:${DEPRO_DARK}}
    .task-body{padding:14px 16px 16px;background:white}
    .task-subtitle{
      font-size:9px;font-weight:800;text-transform:uppercase;
      letter-spacing:0.08em;color:#6B7280;margin:10px 0 8px;
    }
    .task-subtitle:first-child{margin-top:0}
    .params-grid{
      display:grid;grid-template-columns:repeat(3,1fr);gap:8px;
    }
    .param-card{
      background:${DEPRO_CREAM};border:1px solid #E5E7EB;
      border-radius:10px;padding:8px 10px;
    }
    .param-icon{font-size:14px;margin-bottom:2px}
    .param-label{font-size:8px;font-weight:800;text-transform:uppercase;color:#9CA3AF;letter-spacing:0.05em}
    .param-value{font-size:11px;font-weight:800;color:${DEPRO_DARK};margin-top:2px}
    .cues-list{margin:0 0 0 18px;font-size:11px;color:${DEPRO_DARK}}
    .cues-list li{margin-bottom:4px}
    .recs-box{
      background:linear-gradient(135deg,${alphaHex(DEPRO_BLUE, 0.06)},${alphaHex(accent, 0.08)});
      border:1px solid ${alphaHex(accent, 0.2)};
      border-radius:14px;padding:16px 18px;
    }
    .recs-title{
      font-size:11px;font-weight:900;text-transform:uppercase;
      letter-spacing:0.06em;color:${accent};margin-bottom:10px;
    }
    .rec-item{
      display:flex;align-items:flex-start;gap:8px;
      margin-bottom:8px;font-size:11px;color:${DEPRO_DARK};
    }
    .rec-dot{
      width:6px;height:6px;border-radius:50%;
      background:${accent};margin-top:5px;flex-shrink:0;
    }
    .footer{
      position:absolute;bottom:0;left:0;right:0;
      padding:12px 36px;
      display:flex;align-items:center;justify-content:space-between;
      border-top:1px solid #E5E7EB;
      background:${DEPRO_CREAM};font-size:9px;color:#9CA3AF;
    }
    .footer-brand{font-weight:800;color:${DEPRO_BLUE}}
    .empty-note{
      padding:20px;text-align:center;color:#9CA3AF;
      font-size:11px;border:1px dashed #D1D5DB;border-radius:12px;
    }
    .print-btn{
      position:fixed;bottom:20px;right:20px;z-index:99;
      background:${DEPRO_BLUE};color:white;border:none;
      padding:12px 20px;border-radius:12px;font-weight:800;
      font-size:13px;cursor:pointer;box-shadow:0 4px 20px rgba(10,54,247,0.3);
    }
    .print-btn:hover{background:#0828C4}
  `;
}

function renderPageFooter(pageNum, totalPages, dateStr) {
  return `
    <div class="footer">
      <span><span class="footer-brand">DEPRO</span> · Plan de entrenamiento</span>
      <span>Pág. ${pageNum} / ${totalPages} · ${dateStr}</span>
    </div>`;
}

function buildDocumentHtml(data) {
  const brand = DEPRO_BLUE;
  const accent = safeHexColor(data.brandColor, brand);
  const logoUrl = data.logoUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/logo.png`;
  const dateStr = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  const meta = data.meta || {};
  const warmUp = data.warmUp;
  const principal = data.principal;
  const tasks = data.tasks || [];
  const recommendations = data.recommendations || [];
  const isClubLayout = Boolean(warmUp || principal);

  const summaryItems = [
    { label: "Día", value: data.day || "—" },
    { label: "Duración", value: meta.duration || "—" },
    { label: "Intensidad", value: meta.intensity || "—" },
    { label: "Dinámica", value: meta.type || meta.framework || "—" },
  ];

  const heroBlock = `
    <div class="hero">
      <div class="hero-top">
        <div class="logo-wrap">
          <img class="logo" src="${esc(logoUrl)}" alt="DEPRO" />
        </div>
        <div class="club-meta">
          ${data.clubName ? `<div class="club-name">${esc(data.clubName)}</div>` : ""}
          ${data.teamName ? `<div class="team-name">${esc(data.teamName)}</div>` : ""}
        </div>
      </div>
      <div class="session-badge">${esc(data.displayKey || meta.variant || meta.framework || "Sesión")} · ${esc(meta.type || "Entrenamiento")}</div>
      <div class="session-key">${esc(data.displayKey || data.title?.slice(0, 8) || "S")}</div>
      <div class="session-title">${esc(data.title)}</div>
      ${data.subtitle ? `<div class="session-sub">${esc(data.subtitle)}</div>` : ""}
    </div>`;

  const summaryGrid = `
    <div class="summary-grid">
      ${summaryItems.map(({ label, value }) => `
        <div class="summary-card">
          <div class="summary-label">${label}</div>
          <div class="summary-value">${esc(value)}</div>
        </div>`).join("")}
    </div>`;

  if (!isClubLayout) {
    const blockHtml = (data.blocks || []).map((block) => {
      const exercises = flattenExercises(block);
      return `
        <div class="section-head" style="margin-top:16px">
          <div class="section-icon">⚽</div>
          <div class="section-title">${esc(block.label || block.type)}</div>
          ${block.duration ? `<div class="section-duration">⏱ ${esc(block.duration)}</div>` : ""}
        </div>
        ${exercises.length
          ? exercises.map((ex) => renderExerciseCard(ex, accent)).join("")
          : `<div class="empty-note">Sin ejercicios</div>`}`;
    }).join("");

    const taskNames = tasks.map((t) => (typeof t === "string" ? t : t.name)).filter(Boolean);
    const simpleTasks = taskNames.length
      ? `<div class="section-head" style="margin-top:16px"><div class="section-icon">✏️</div><div class="section-title">Tareas</div></div>
         <ul class="cues-list">${taskNames.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
      : "";

    return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${esc(data.title)} — DEPRO</title>
      <style>${buildStyles(brand, accent)}</style></head><body><div class="doc">
        <section class="page"><div class="top-bar"></div>${heroBlock}
          <div class="content">
            <div class="section-head"><div class="section-icon">📋</div><div class="section-title">Resumen</div></div>
            ${summaryGrid}${blockHtml}${simpleTasks}
          </div>${renderPageFooter(1, 1, dateStr)}
        </section></div>
        <button class="print-btn no-print" onclick="window.print()">Descargar / Imprimir PDF</button>
        <script>window.onload=function(){setTimeout(function(){window.print()},500)}</script></body></html>`;
  }

  const warmExercises = warmUp?.exercises?.length
    ? warmUp.exercises.map((ex) => renderExerciseCard(ex, "#F59E0B")).join("")
    : `<div class="empty-note">Sin ejercicios de calentamiento configurados</div>`;

  const mainExercises = principal?.exercises?.length
    ? principal.exercises.map((ex) => renderExerciseCard(ex, accent)).join("")
    : `<div class="empty-note">Sin ejercicios del bloque principal</div>`;

  const tasksPage1 = tasks.slice(0, 2);
  const tasksPage2 = tasks.slice(2);
  const totalPages = tasksPage2.length ? 3 : 2;

  const page1 = `
    <section class="page">
      <div class="top-bar"></div>
      ${heroBlock}
      <div class="content">
        <div class="section-head"><div class="section-icon">📋</div><div class="section-title">Resumen de la sesión</div></div>
        ${summaryGrid}
        <div class="section-head" style="margin-top:8px">
          <div class="section-icon">🔥</div>
          <div class="section-title">${esc(warmUp?.label || "Calentamiento")}</div>
          ${warmUp?.duration ? `<div class="section-duration">⏱ ${esc(warmUp.duration)}</div>` : ""}
        </div>
        <div class="two-col">
          <div><div class="col-title">Propuesto</div>${warmExercises}</div>
          <div><div class="col-title">Guía calentamiento</div>${renderGuidePanel(warmUp?.guideItems, "#F59E0B")}</div>
        </div>
      </div>
      ${renderPageFooter(1, totalPages, dateStr)}
    </section>`;

  const recsHtml = recommendations.length ? `
    <div class="section-head" style="margin-top:24px">
      <div class="section-icon">💡</div><div class="section-title">Recomendaciones del día</div>
    </div>
    <div class="recs-box">
      <div class="recs-title">Sesión ${esc(meta.type || "")}</div>
      ${recommendations.map((r) => `<div class="rec-item"><span class="rec-dot"></span><span>${esc(r)}</span></div>`).join("")}
    </div>` : "";

  const page2Body = `
    <div class="section-head">
      <div class="section-icon">⚡</div>
      <div class="section-title">Protocolo · ${esc(principal?.label || "Principal")}</div>
      ${principal?.duration ? `<div class="section-duration">⏱ ${esc(principal.duration)}</div>` : ""}
    </div>
    <div class="two-col">
      <div><div class="col-title">Propuesto</div>${mainExercises}</div>
      <div><div class="col-title">Guía protocolo</div>${renderGuidePanel(principal?.guideItems, accent)}</div>
    </div>
    ${tasks.length ? `
      <div class="section-head" style="margin-top:24px">
        <div class="section-icon">🎯</div><div class="section-title">Diseñador de tareas</div>
      </div>
      ${tasksPage1.map((t, i) => renderTaskSection(t, i, accent)).join("")}` : ""}
    ${!tasksPage2.length ? recsHtml : ""}`;

  const page2 = `
    <section class="page">
      <div class="top-bar"></div>
      <div class="content" style="padding-top:28px">${page2Body}</div>
      ${renderPageFooter(2, totalPages, dateStr)}
    </section>`;

  const page3 = tasksPage2.length ? `
    <section class="page">
      <div class="top-bar"></div>
      <div class="content" style="padding-top:28px">
        <div class="section-head"><div class="section-icon">🎯</div><div class="section-title">Diseñador de tareas (cont.)</div></div>
        ${tasksPage2.map((t, i) => renderTaskSection(t, i + 2, accent)).join("")}
        ${recsHtml}
      </div>
      ${renderPageFooter(3, totalPages, dateStr)}
    </section>` : "";

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${esc(data.title)} — DEPRO</title>
    <style>${buildStyles(brand, accent)}</style></head><body><div class="doc">${page1}${page2}${page3}</div>
    <button class="print-btn no-print" onclick="window.print()">Descargar / Imprimir PDF</button>
    <script>window.onload=function(){setTimeout(function(){window.print()},600)}</script></body></html>`;
}

async function resolveLogoDataUri(logoUrl) {
  try {
    const res = await fetch(logoUrl, { cache: "force-cache" });
    if (!res.ok) return logoUrl;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return logoUrl;
  }
}

function writeToPrintWindow(targetWindow, html) {
  if (!targetWindow?.document) throw new Error("Ventana de impresión no disponible");
  const doc = targetWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
}

function openPreviewWindow(html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (w) {
    w.addEventListener("load", () => setTimeout(() => URL.revokeObjectURL(url), 60_000));
    return true;
  }
  URL.revokeObjectURL(url);
  return false;
}

function openPrintViaIframe(html) {
  const existing = document.getElementById("depro-pdf-print-frame");
  if (existing) existing.remove();

  const frame = document.createElement("iframe");
  frame.id = "depro-pdf-print-frame";
  frame.setAttribute("title", "Vista previa PDF sesión DEPRO");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";
  document.body.appendChild(frame);

  const win = frame.contentWindow;
  writeToPrintWindow(win, html);

  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      /* ignore */
    }
  };

  if (win.document.readyState === "complete") {
    setTimeout(triggerPrint, 400);
  } else {
    frame.onload = () => setTimeout(triggerPrint, 400);
  }
}

export async function downloadSessionPdf(data) {
  const popup = window.open("about:blank", "_blank");

  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const logoUrl = data.logoUrl || `${origin}/logo.png`;
    let logoDataUri = logoUrl;
    try {
      logoDataUri = await resolveLogoDataUri(logoUrl);
    } catch {
      /* usar URL directa */
    }

    const html = buildDocumentHtml({ ...data, logoUrl: logoDataUri });

    if (popup && !popup.closed) {
      try {
        writeToPrintWindow(popup, html);
        return;
      } catch {
        try { popup.close(); } catch { /* ignore */ }
      }
    }

    if (openPreviewWindow(html)) return;

    openPrintViaIframe(html);
  } catch (err) {
    console.error("[DEPRO PDF]", err);
    try { popup?.close(); } catch { /* ignore */ }
    alert("No se pudo generar el PDF. Inténtalo de nuevo.");
  }
}
