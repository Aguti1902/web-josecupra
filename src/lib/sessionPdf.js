/** Genera PDF imprimible de una sesión (jugador o club) */

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderExercise(ex) {
  const tips = ex.tips?.length
    ? `<ul style="margin:4px 0 0;padding-left:16px;font-size:11px;color:#555">${ex.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
    : "";
  const desc = ex.description ? `<div style="font-size:11px;color:#666;margin-top:2px">${esc(ex.description)}</div>` : "";
  const meta = [
    ex.sets ? `${ex.sets}×${ex.reps || ""}` : "",
    ex.duration ? esc(ex.duration) : "",
  ].filter(Boolean).join(" · ");
  return `<li style="margin-bottom:10px;">
    <strong>${esc(ex.name || ex.nombre)}</strong>${meta ? ` · ${meta}` : ""}
    ${desc}${tips}
  </li>`;
}

function renderBlock(block) {
  const subs = block.subSessions?.length
    ? block.subSessions.map((sub) => `
        <div style="margin:8px 0 8px 12px;padding-left:10px;border-left:2px solid #ddd">
          <div style="font-size:12px;font-weight:600;margin-bottom:4px">${esc(sub.label || sub.name || "Sub-sesión")}</div>
          <ul style="margin:0;padding-left:18px">${(sub.exercises || []).map(renderExercise).join("")}</ul>
        </div>`).join("")
    : "";
  const exercises = (block.exercises || []).map(renderExercise).join("");
  return `
      <section style="margin-bottom:20px;">
        <h3 style="color:var(--brand);font-size:14px;margin:0 0 8px;text-transform:uppercase;">${esc(block.label || block.type)}</h3>
        ${block.duration ? `<p style="font-size:11px;color:#666;margin:0 0 8px">⏱ ${esc(block.duration)}</p>` : ""}
        ${subs || `<ul style="margin:0;padding-left:18px;">${exercises}</ul>`}
      </section>`;
}

export function downloadSessionPdf({ title, subtitle, blocks, meta = {}, brandColor = "#0A36F7", tasks = [] }) {
  const blockHtml = (blocks || []).map(renderBlock).join("");
  const tasksHtml = tasks?.length
    ? `<section style="margin-bottom:20px;"><h3 style="color:${brandColor};font-size:14px;margin:0 0 8px;text-transform:uppercase;">Tareas seleccionadas</h3><ul style="margin:0;padding-left:18px;">${tasks.map((t) => `<li style="margin-bottom:6px;">${esc(typeof t === "string" ? t : t.name || t.label)}</li>`).join("")}</ul></section>`
    : "";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
    <style>@media print{body{margin:0}} body{font-family:system-ui,sans-serif;padding:32px;color:#111;max-width:720px;margin:0 auto;--brand:${brandColor}}
    h1{font-size:22px;margin:0 0 4px} .sub{color:#666;font-size:13px;margin-bottom:24px}
    .meta{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;font-size:12px;color:#444}
    footer{margin-top:32px;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:12px}</style></head>
    <body>
      <h1>${esc(title)}</h1>
      <p class="sub">${esc(subtitle || "")}</p>
      <div class="meta">
        ${meta.duration ? `<span>⏱ ${esc(meta.duration)}</span>` : ""}
        ${meta.type ? `<span>🏃 ${esc(meta.type)}</span>` : ""}
        ${meta.intensity ? `<span>🔋 ${esc(meta.intensity)}</span>` : ""}
        ${meta.variant ? `<span>📋 ${esc(meta.variant)}</span>` : ""}
      </div>
      ${blockHtml}
      ${tasksHtml}
      <footer>DEPRO · Plan generado ${new Date().toLocaleDateString("es-ES")}</footer>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("Permite ventanas emergentes para descargar el PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
