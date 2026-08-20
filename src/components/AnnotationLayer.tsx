import { useEffect, useRef, useState } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { smoothStroke } from '@/utils/smoothing';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

/**
 * Transparent overlay canvas for production annotations. Freehand strokes are
 * smoothed with a Catmull-Rom -> Bezier pass so hand-drawn lines auto-straighten.
 * Text is placed by clicking while the text tool is active.
 */
export function AnnotationLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const drawingRef = useRef<Stroke | null>(null);
  const { tool, brushColor, brushWidth, annotations, addAnnotation } = useStudioStore();

  const active = tool === 'draw' || tool === 'text';

  // Keep the latest strokes/annotations reachable from the resize handler below.
  // That effect mounts once with an empty dep list, so a plain closure would see
  // the initial (empty) arrays and wipe annotations on window resize.
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const annotationsRef = useRef(annotations);
  annotationsRef.current = annotations;

  // Keep canvas sized to its container (scaled by devicePixelRatio so exported
  // composites line up 1:1 with the WebGL buffer).
  useEffect(() => {
    const c = canvasRef.current!;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(redraw, [strokes, annotations]);

  function redraw() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const s of strokesRef.current) drawSmooth(ctx, s);
    if (drawingRef.current) drawSmooth(ctx, drawingRef.current);

    for (const a of annotationsRef.current) {
      ctx.fillStyle = a.color;
      ctx.font = `${a.size}px Inter, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(a.text, a.x, a.y);
    }
  }

  function drawSmooth(ctx: CanvasRenderingContext2D, s: Stroke) {
    const pts = smoothStroke(s.points);
    if (pts.length < 2) return;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    if (tool === 'text') {
      const p = pos(e);
      const text = window.prompt('输入标注文本 / 参数：');
      if (text) addAnnotation({ text, x: p.x, y: p.y, color: brushColor, size: 18 });
      return;
    }
    if (tool !== 'draw') return;
    canvasRef.current!.setPointerCapture(e.pointerId);
    drawingRef.current = { points: [pos(e)], color: brushColor, width: brushWidth };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    drawingRef.current.points.push(pos(e));
    redraw();
  };

  const onUp = () => {
    if (!drawingRef.current) return;
    setStrokes((s) => [...s, drawingRef.current!]);
    drawingRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`annotation-layer ${active ? 'drawing' : ''}`}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
    />
  );
}
