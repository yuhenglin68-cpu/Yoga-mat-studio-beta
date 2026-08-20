/**
 * Records the WebGL canvas directly via canvas.captureStream() + MediaRecorder.
 * This captures ONLY the 3D viewport (no OS chrome, no watermark) and works
 * both in Electron and a plain browser.
 */
export class ViewportRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private mime = '';

  constructor(private canvas: HTMLCanvasElement, private fps = 60) {}

  private pickMime(): string {
    const candidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4', // Electron/Chromium may support mp4 muxing
    ];
    return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm';
  }

  start() {
    if (this.recorder) return;
    this.chunks = [];
    this.mime = this.pickMime();
    const stream = this.canvas.captureStream(this.fps);
    this.recorder = new MediaRecorder(stream, {
      mimeType: this.mime,
      videoBitsPerSecond: 12_000_000,
    });
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(100);
  }

  stop(): Promise<{ blob: Blob; ext: string }> {
    return new Promise((resolve, reject) => {
      if (!this.recorder) return reject(new Error('未在录制'));
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mime });
        const ext = this.mime.includes('mp4') ? 'mp4' : 'webm';
        this.recorder = null;
        resolve({ blob, ext });
      };
      this.recorder.stop();
    });
  }

  get active() {
    return !!this.recorder;
  }
}
