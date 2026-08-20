import { loadImage } from './removeBg';

/**
 * Extract the color at a normalized (0..1) point of an image.
 * Powers the manual eyedropper over an imported reference image.
 */
export async function pickColorFromImage(
  imageUrl: string,
  nx: number,
  ny: number
): Promise<string> {
  const img = await loadImage(imageUrl);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const x = Math.floor(nx * (c.width - 1));
  const y = Math.floor(ny * (c.height - 1));
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
  return rgbToHex(r, g, b);
}

/** Use the native EyeDropper API when available (Chromium/Electron supports it). */
export async function nativeEyedropper(): Promise<string | null> {
  const anyWin = window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } };
  if (!anyWin.EyeDropper) return null;
  try {
    const ed = new anyWin.EyeDropper();
    const res = await ed.open();
    return res.sRGBHex;
  } catch {
    return null; // user aborted
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
