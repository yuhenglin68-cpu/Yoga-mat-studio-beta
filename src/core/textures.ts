import * as THREE from 'three';

/**
 * Procedural texture generators. Ships zero binary assets — every PBR map is
 * synthesized on a 2D canvas so the app runs fully offline.
 */

function makeCanvas(size = 512): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

function toTexture(canvas: HTMLCanvasElement, repeat = 1): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Fine matte micro-noise, used as a roughness map for PU / TPE surfaces. */
export function makeMatteRoughnessMap(intensity = 0.15): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512);
  const img = ctx.createImageData(512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 255 - Math.random() * intensity * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c, 4);
}

/** Natural rubber ribbed base texture (used on the underside of composite mat). */
export function makeRubberBaseMap(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 512; i += 14) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
  }
  // stipple grip dots
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 1600; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(c, 6);
}

/** Cork granular texture — warm speckled surface + matching normal-ish bump. */
export function makeCorkMaps(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const [c, ctx] = makeCanvas(512);
  ctx.fillStyle = '#c8a06a';
  ctx.fillRect(0, 0, 512, 512);
  const rough = makeCanvas(512);
  rough[1].fillStyle = '#bbbbbb';
  rough[1].fillRect(0, 0, 512, 512);

  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 3.5;
    const shade = 140 + Math.random() * 80;
    ctx.fillStyle = `rgba(${shade}, ${shade - 40}, ${shade - 90}, ${0.25 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    const rv = 120 + Math.random() * 120;
    rough[1].fillStyle = `rgba(${rv},${rv},${rv},0.5)`;
    rough[1].beginPath();
    rough[1].arc(x, y, r, 0, Math.PI * 2);
    rough[1].fill();
  }
  return { map: toTexture(c, 3), roughnessMap: toTexture(rough[0], 3) };
}

/** Radial studio gradient used as scene environment / background. */
export function makeStudioBackground(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(1024);
  const g = ctx.createRadialGradient(512, 380, 80, 512, 512, 760);
  g.addColorStop(0, '#20242c');
  g.addColorStop(0.6, '#14161b');
  g.addColorStop(1, '#0b0c0f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);
  return toTexture(c, 1);
}
