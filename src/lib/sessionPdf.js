/** Genera PDF imprimible de una sesión (jugador o club) */

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function downloadSessionPdf({ title, subtitle, blocks, meta = {}, brandColor = "#0A36F7" }) {
  const blockHtml = (blocks || [])
    .map(
      (b) => `
      <section style="margin-bottom:20px;">
        <h3 style="color:${brandColor};font-size:14px;margin:0 0 8px;text-transform:uppercase;">${esc(b.label || b.type)}</h3>
        <ul style="margin:0;padding-left:18px;">
          ${(b.exercises || []).map((ex) => `<li style="margin-bottom:6px;"><strong>${esc(ex.name || ex.nombre)}</strong>${ex.sets ? ` · ${ex.sets}×${ex.reps || ""}` : ""}${ex.duration ? ` · ${esc(ex.duration)}` : ""}</li>`).join("")}
        </ul>
      </section>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
    <style>@media print{body{margin:0}} body{font-family:system-ui,sans-serif;padding:32px;color:#111;max-width:720px;margin:0 auto}
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
      </div>
      ${blockHtml}
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
