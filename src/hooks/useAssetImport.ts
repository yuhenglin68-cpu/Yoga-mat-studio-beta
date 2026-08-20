import { useCallback, useState, MutableRefObject } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { pdfFirstPageToDataUrl } from '@/services/pdfImport';
import { removeBackground, hasWhiteBackground } from '@/services/removeBg';
import type { MatEngine } from '@/engine/MatEngine';

export function useAssetImport(_engineRef: MutableRefObject<MatEngine | null>) {
  const { addDecal, removeBgApiKey, tool } = useStudioStore();
  const [colorSourceUrl, setColorSourceUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const fileToUrl = (f: Blob) => URL.createObjectURL(f);

  const importAsDecal = useCallback(
    async (blob: Blob, name: string) => {
      let url = fileToUrl(blob);
      // Auto background removal when an API key is set and the image looks white-backed.
      if (removeBgApiKey) {
        try {
          const isWhite = await hasWhiteBackground(url);
          if (isWhite) {
            flash('检测到白底，正在调用 AI 去背…');
            const cut = await removeBackground(blob, removeBgApiKey);
            URL.revokeObjectURL(url);
            url = fileToUrl(cut);
            flash('AI 去背完成');
          }
        } catch (err) {
          flash(`去背失败：${(err as Error).message}`);
        }
      }
      addDecal({
        name,
        imageUrl: url,
        x: 0.5,
        y: 0.5,
        scale: 0.35,
        rotation: 0,
        opacity: 1,
        colorOverlay: null,
        overlayStrength: 1,
      });
    },
    [addDecal, removeBgApiKey]
  );

  const importFiles = useCallback(
    async (files: File[]) => {
      for (const f of files) {
        const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        const isImg = f.type.startsWith('image/');
        if (!isPdf && !isImg) {
          flash(`不支持的文件类型：${f.name}`);
          continue;
        }
        // Eyedropper mode -> treat first image as a color-reference source.
        if (tool === 'eyedropper' && isImg) {
          setColorSourceUrl(fileToUrl(f));
          flash('已载入取色参考图，点击视窗提取颜色');
          continue;
        }
        if (isPdf) {
          const dataUrl = await pdfFirstPageToDataUrl(f);
          const res = await fetch(dataUrl);
          await importAsDecal(await res.blob(), f.name);
        } else {
          await importAsDecal(f, f.name);
        }
      }
    },
    [importAsDecal, tool]
  );

  const importFromColorSource = useCallback((file: File) => {
    setColorSourceUrl(fileToUrl(file));
  }, []);

  return { importFiles, importFromColorSource, colorSourceUrl, toast };
}
