/** Extrae el ID de vídeo de URLs comunes de YouTube (watch, youtu.be, embed, shorts, m.) */
export function getYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return null;

  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/(?:embed|v|shorts)\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/,
    /m\.youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
  ];

  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function youtubeEmbedUrl(id) {
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export function youtubeThumbUrl(id, quality = "mqdefault") {
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
}
