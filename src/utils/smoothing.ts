interface P {
  x: number;
  y: number;
}

/**
 * Smooth a freehand point list. Two-stage:
 * 1) Ramer–Douglas–Peucker simplification to remove jitter / straighten lines.
 * 2) Catmull–Rom resampling to produce a fluid curve through the kept points.
 */
export function smoothStroke(points: P[], epsilon = 2.2, samples = 16): P[] {
  if (points.length < 3) return points;
  const simplified = rdp(points, epsilon);
  return catmullRom(simplified, samples);
}

function rdp(pts: P[], eps: number): P[] {
  if (pts.length < 3) return pts;
  let maxDist = 0;
  let index = 0;
  const [start, end] = [pts[0], pts[pts.length - 1]];
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDistance(pts[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > eps) {
    const left = rdp(pts.slice(0, index + 1), eps);
    const right = rdp(pts.slice(index), eps);
    return [...left.slice(0, -1), ...right];
  }
  return [start, end];
}

function perpDistance(p: P, a: P, b: P): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len;
}

function catmullRom(pts: P[], samples: number): P[] {
  if (pts.length < 3) return pts;
  const out: P[] = [];
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    for (let t = 0; t < samples; t++) {
      const s = t / samples;
      const s2 = s * s;
      const s3 = s2 * s;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * s +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * s +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3),
      });
    }
  }
  return out;
}
