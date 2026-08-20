import * as THREE from 'three';
import { MATERIAL_PRESETS, MaterialId } from './constants';
import { makeMatteRoughnessMap, makeRubberBaseMap, makeCorkMaps } from './textures';

export interface MatMaterials {
  /** Top surface material — receives the base color + decals. */
  top: THREE.MeshPhysicalMaterial;
  /** Bottom/base material (only meaningful for dual-layer presets). */
  base: THREE.MeshPhysicalMaterial;
}

/**
 * Build PBR materials for a given preset. `baseColor` is the user-selected mat color.
 * Uses MeshPhysicalMaterial for clearcoat + sheen so PU matte and TPE sheen read correctly.
 */
export function createMaterials(id: MaterialId, baseColor: THREE.ColorRepresentation): MatMaterials {
  const preset = MATERIAL_PRESETS[id];
  const color = new THREE.Color(baseColor);

  const top = new THREE.MeshPhysicalMaterial({
    color,
    roughness: preset.roughness,
    metalness: preset.metalness,
    clearcoat: preset.clearcoat,
    clearcoatRoughness: preset.clearcoatRoughness,
    sheen: preset.sheen,
    sheenColor: color.clone().multiplyScalar(1.1),
    envMapIntensity: 0.9,
  });

  let base = top;

  if (id === 'tpe') {
    top.roughnessMap = makeMatteRoughnessMap(0.22);
  } else if (id.startsWith('pu-')) {
    // Top = PU (Matte or Glossy)
    top.roughnessMap = id === 'pu-matte' ? makeMatteRoughnessMap(0.12) : null;
    
    // Base = natural rubber with ribbed grip texture
    const rubberMap = makeRubberBaseMap();
    base = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0f0f0f'),
      roughness: 0.95,
      metalness: 0.0,
      clearcoat: 0.0,
      bumpMap: rubberMap,
      bumpScale: 0.6,
      map: rubberMap,
    });
  } else if (id === 'cork') {
    const { map, roughnessMap } = makeCorkMaps();
    top.map = map;
    top.roughnessMap = roughnessMap;
    top.bumpMap = roughnessMap;
    top.bumpScale = 0.25;
    // Cork tint blends the user color subtly over the natural cork map.
    top.color = color.clone().lerp(new THREE.Color('#c8a06a'), 0.55);
  }

  top.needsUpdate = true;
  base.needsUpdate = true;
  return { top, base };
}

/** Update just the color on an existing material set (fast path for the color picker). */
export function applyBaseColor(mats: MatMaterials, id: MaterialId, color: THREE.ColorRepresentation) {
  const c = new THREE.Color(color);
  if (id === 'cork') {
    mats.top.color = c.clone().lerp(new THREE.Color('#c8a06a'), 0.55);
  } else {
    mats.top.color = c;
    mats.top.sheenColor = c.clone().multiplyScalar(1.1);
  }
  mats.top.needsUpdate = true;
}
