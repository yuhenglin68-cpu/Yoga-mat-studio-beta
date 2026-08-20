/**
 * AI background removal via remove.bg. The API key is supplied by the user at
 * runtime (Settings panel) — never hard-coded.
 *
 * Docs: https://www.remove.bg/api
 */
export async function removeBackground(file: Blob, apiKey: string): Promise<Blob> {
  if (!apiKey) throw new Error('未配置 Remove.bg API Key');
  const form = new FormData();
  form.append('image_file', file);
  form.append('size', 'auto');
  // 'auto' works for logos on white; caller decides when to invoke.
  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: form,
  });
  if (!res.ok) {
    let msg = `Remove.bg 请求失败 (${res.status})`;
    try {
      const j = await res.json();
      msg = j?.errors?.[0]?.title ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.blob();
}

/**
 * Heuristic: does the image have a predominantly white/near-white border?
 * Used to auto-trigger background removal only when it makes sense.
 */
export async function hasWhiteBackground(imageUrl: string, threshold = 240): Promise<boolean> {
  const img = await loadImage(imageUrl);
  const c = document.createElement('canvas');
  const s = 64;
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, s, s);
  const { data } = ctx.getImageData(0, 0, s, s);
  let whiteEdge = 0;
  let total = 0;
  const isEdge = (i: number) => {
    const px = (i / 4) % s;
    const py = Math.floor(i / 4 / s);
    return px < 3 || py < 3 || px > s - 4 || py > s - 4;
  };
  for (let i = 0; i < data.length; i += 4) {
    if (!isEdge(i)) continue;
    total++;
    if (data[i] > threshold && data[i + 1] > threshold && data[i + 2] > threshold) whiteEdge++;
  }
  return total > 0 && whiteEdge / total > 0.7;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
