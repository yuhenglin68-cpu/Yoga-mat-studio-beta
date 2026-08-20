import type { DesktopApi } from '../../electron/preload';

declare global {
  interface Window {
    desktop?: DesktopApi;
  }
}

type Filter = { name: string; extensions: string[] };

/**
 * Save a Blob to disk. In Electron this opens the OS-native "Save As" dialog
 * (dialog.showSaveDialog) via IPC; in a plain browser it falls back to an
 * anchor download. Output is always watermark-free (raw blob bytes).
 */
export async function saveBlobAs(
  blob: Blob,
  defaultName: string,
  filters: Filter[]
): Promise<{ ok: boolean; filePath?: string }> {
  if (window.desktop?.isElectron) {
    const data = await blob.arrayBuffer();
    const res = await window.desktop.saveMediaAs({ data, defaultName, filters });
    return { ok: res.ok, filePath: res.filePath };
  }
  // Browser fallback.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = defaultName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { ok: true };
}

export const IMAGE_FILTERS: Filter[] = [
  { name: 'PNG 图片', extensions: ['png'] },
  { name: 'JPEG 图片', extensions: ['jpg', 'jpeg'] },
];

export const VIDEO_FILTERS: Filter[] = [
  { name: 'WebM 视频', extensions: ['webm'] },
  { name: 'MP4 视频', extensions: ['mp4'] },
];
