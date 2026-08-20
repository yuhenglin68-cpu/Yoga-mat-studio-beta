import { useRef, useState } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { ViewportRecorder } from '@/services/recorder';
import { saveBlobAs, IMAGE_FILTERS, VIDEO_FILTERS } from '@/services/saveFile';
import type { MatEngine } from '@/engine/MatEngine';

/**
 * Media export: high-res screenshot + viewport recording, saved through the
 * OS-native "Save As" dialog (Electron) with no watermark.
 */
export function ExportPanel() {
  const { isRecording, setRecording } = useStudioStore();
  const recorderRef = useRef<ViewportRecorder | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const engine = () => (window as any).__engine as MatEngine | undefined;

  // Composite the annotation overlay on top of the rendered WebGL frame.
  async function composeFrame(mime: 'image/png' | 'image/jpeg'): Promise<Blob> {
    const eng = engine()!;
    const glBlob = await eng.snapshot(mime, 0.96);
    const glImg = await blobToImage(glBlob);
    const anno = document.querySelector('.annotation-layer') as HTMLCanvasElement | null;

    const out = document.createElement('canvas');
    out.width = glImg.width;
    out.height = glImg.height;
    const ctx = out.getContext('2d')!;
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#0b0c0f';
      ctx.fillRect(0, 0, out.width, out.height);
    }
    ctx.drawImage(glImg, 0, 0);
    if (anno) ctx.drawImage(anno, 0, 0, out.width, out.height);
    return new Promise((res) => out.toBlob((b) => res(b!), mime, 0.96));
  }

  const screenshot = async (mime: 'image/png' | 'image/jpeg') => {
    setBusy('生成截图…');
    try {
      const blob = await composeFrame(mime);
      const ext = mime === 'image/png' ? 'png' : 'jpg';
      await saveBlobAs(blob, `yoga-mat-${Date.now()}.${ext}`, IMAGE_FILTERS);
    } finally {
      setBusy(null);
    }
  };

  const toggleRecord = async () => {
    const eng = engine();
    if (!eng) return;
    if (!isRecording) {
      recorderRef.current = new ViewportRecorder(eng.domElement, 60);
      recorderRef.current.start();
      setRecording(true);
    } else {
      setBusy('封装视频…');
      try {
        const { blob, ext } = await recorderRef.current!.stop();
        setRecording(false);
        await saveBlobAs(blob, `yoga-mat-demo-${Date.now()}.${ext}`, VIDEO_FILTERS);
      } finally {
        setBusy(null);
      }
    }
  };

  return (
    <div className="section">
      <h3>媒体导出</h3>
      <div className="row">
        <button className="btn" style={{ flex: 1 }} onClick={() => screenshot('image/png')}>
          📷 PNG
        </button>
        <button className="btn" style={{ flex: 1 }} onClick={() => screenshot('image/jpeg')}>
          📷 JPG
        </button>
      </div>
      <button
        className={`btn full ${isRecording ? 'danger' : 'primary'}`}
        style={{ marginTop: 10 }}
        onClick={toggleRecord}
      >
        {isRecording ? '■ 停止录制并另存为' : '● 录制 3D 视窗'}
      </button>
      <p className="hint">
        截图/录屏均为纯客户端捕获，输出无水印。点击后调用系统原生「另存为」对话框，可自选路径保存
        PNG/JPG 与 WebM/MP4。
      </p>
      {busy && <div className="toast">{busy}</div>}
    </div>
  );
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}
