import * as pdfjs from 'pdfjs-dist';
// Vite worker import — bundles the pdf.js worker without external CDN.
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = PdfWorker;

/**
 * Rasterize the first page of a PDF to a PNG data URL so it can be used as a
 * logo/decal source just like an imported image.
 */
export async function pdfFirstPageToDataUrl(file: File, scale = 3): Promise<string> {
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}
