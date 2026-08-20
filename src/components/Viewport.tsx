import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MatEngine } from '@/engine/MatEngine';
import { useStudioStore } from '@/store/useStudioStore';
import { pickColorFromImage } from '@/services/colorPicker';
import { AnnotationLayer } from './AnnotationLayer';
import { useAssetImport } from '@/hooks/useAssetImport';

/**
 * Owns the WebGL canvas + MatEngine lifecycle. Bridges store state into the
 * imperative engine, and hosts the annotation overlay + drag-drop importer.
 */
export function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MatEngine | null>(null);
  const [dragging, setDragging] = useState(false);

  const { material, shape, baseColor, viewMode, decals, tool, setBaseColor } = useStudioStore();
  const { importFiles, importFromColorSource, colorSourceUrl } = useAssetImport(engineRef);

  // Init engine once.
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new MatEngine(canvasRef.current);
    engineRef.current = engine;
    (window as any).__engine = engine; // exposed for export panel

    const ro = new ResizeObserver(() => {
      const el = wrapRef.current!;
      engine.resize(el.clientWidth, el.clientHeight);
    });
    ro.observe(wrapRef.current!);
    return () => {
      ro.disconnect();
      engine.dispose();
    };
  }, []);

  // Sync material / shape / color / view / decals into the engine.
  useEffect(() => {
    engineRef.current?.setMatConfig(material, shape, baseColor);
    engineRef.current?.syncDecals(decals);
  }, [material, shape]);
  useEffect(() => engineRef.current?.setBaseColor(baseColor), [baseColor]);
  useEffect(() => engineRef.current?.setViewMode(viewMode), [viewMode]);
  useEffect(() => engineRef.current?.syncDecals(decals), [decals]);

  // Eyedropper on the 3D scene / imported reference image.
  const onCanvasClick = async (e: React.MouseEvent) => {
    if (tool !== 'eyedropper') return;
    const rect = canvasRef.current!.getBoundingClientRect();
    // If a color-source image was imported, sample it; else sample the 3D pixel.
    if (colorSourceUrl) {
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const hex = await pickColorFromImage(colorSourceUrl, nx, ny);
      setBaseColor(hex);
      return;
    }
    const gl = engineRef.current!.renderer.getContext();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvasRef.current!.width);
    const y = Math.floor((1 - (e.clientY - rect.top) / rect.height) * canvasRef.current!.height);
    const px = new Uint8Array(4);
    engineRef.current!.renderer.render(engineRef.current!.scene, engineRef.current!.camera);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const hex = '#' + [px[0], px[1], px[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    setBaseColor(hex);
  };

  // Drag & drop import.
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) importFiles(files);
  };

  return (
    <div
      ref={wrapRef}
      className={`viewport ${tool === 'eyedropper' ? 'eyedropper' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <canvas ref={canvasRef} onClick={onCanvasClick} />
      <AnnotationLayer />
      {dragging && <div className="drop-overlay">松开鼠标导入 PNG / JPG / PDF</div>}
    </div>
  );
}
