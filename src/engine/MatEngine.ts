import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MAT_SIZE, MaterialId, ViewMode, MatShape } from '@/core/constants';
import { createMaterials, applyBaseColor, MatMaterials } from '@/core/materials';
import { makeStudioBackground } from '@/core/textures';
import type { DecalState } from '@/store/useStudioStore';

/**
 * Encapsulates all Three.js concerns. React components talk to this via a thin API,
 * keeping render logic out of the component tree.
 */
export class MatEngine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private matGroup = new THREE.Group();
  private topMesh!: THREE.Mesh;
  private baseMesh!: THREE.Mesh;
  private decalGroup = new THREE.Group();
  private materials!: MatMaterials;
  private materialId: MaterialId = 'pu-matte';
  private shape: MatShape = 'regular';
  private raf = 0;
  private viewMode: ViewMode = '3d';
  private transition: { t: number; from: THREE.Vector3; to: THREE.Vector3; active: boolean } | null =
    null;

  // Camera home positions for each view.
  private readonly cam3d = new THREE.Vector3(6, 12, 16);
  private readonly cam2d = new THREE.Vector3(0, 24, 0.001);

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true, // required for high-res screenshots
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = makeStudioBackground();

    // Image-based lighting for realistic PBR reflections.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.copy(this.cam3d);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 40;
    this.controls.target.set(0, 0, 0);

    this.setupLights();
    this.buildMat('pu-matte', 'regular', '#585e65');
    this.scene.add(this.matGroup);
    this.matGroup.add(this.decalGroup);

    this.animate();
  }

  private setupLights() {
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(8, 18, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 60;
    (key.shadow.camera as THREE.OrthographicCamera).left = -20;
    (key.shadow.camera as THREE.OrthographicCamera).right = 20;
    (key.shadow.camera as THREE.OrthographicCamera).top = 20;
    (key.shadow.camera as THREE.OrthographicCamera).bottom = -20;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x88aaff, 0.6);
    fill.position.set(-10, 6, -8);
    this.scene.add(fill);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    // Soft ground shadow catcher.
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -MAT_SIZE.thickness * 3;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private buildMat(id: MaterialId, shape: MatShape, color: string) {
    this.matGroup.clear();
    this.matGroup.add(this.decalGroup);
    this.materialId = id;
    this.shape = shape;
    this.materials = createMaterials(id, color);

    const { length, width, thickness } = MAT_SIZE;
    const radius = 0.4;

    let topGeo: THREE.BufferGeometry;
    let baseGeo: THREE.BufferGeometry | null = null;

    if (shape === 'regular') {
      topGeo = new RoundedBoxGeometry(length, thickness, width, 6, radius);
      if (id.startsWith('pu-')) {
        baseGeo = new RoundedBoxGeometry(length, thickness * 9, width, 6, radius);
      }
    } else {
      // For semicircle and oval, use Shape + Extrude
      const s = new THREE.Shape();
      const halfL = length / 2;
      const halfW = width / 2;
      
      if (shape === 'oval') {
        const r = halfW;
        s.moveTo(-halfL + r, -halfW);
        s.lineTo(halfL - r, -halfW);
        s.absarc(halfL - r, 0, r, -Math.PI/2, Math.PI/2, false);
        s.lineTo(-halfL + r, halfW);
        s.absarc(-halfL + r, 0, r, Math.PI/2, -Math.PI/2, false);
      } else { // semicircle
        const r = halfW;
        s.moveTo(-halfL, -halfW);
        s.lineTo(halfL - r, -halfW);
        s.absarc(halfL - r, 0, r, -Math.PI/2, Math.PI/2, false);
        s.lineTo(-halfL, halfW);
        s.lineTo(-halfL, -halfW);
      }

      const extrudeSettings = {
        steps: 1,
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 4
      };

      topGeo = new THREE.ExtrudeGeometry(s, extrudeSettings);
      topGeo.rotateX(Math.PI / 2);
      topGeo.center();

      if (id.startsWith('pu-')) {
        baseGeo = new THREE.ExtrudeGeometry(s, { ...extrudeSettings, depth: thickness * 9 });
        baseGeo.rotateX(Math.PI / 2);
        baseGeo.center();
      }
    }

    this.topMesh = new THREE.Mesh(topGeo, this.materials.top);
    this.topMesh.castShadow = true;
    this.topMesh.receiveShadow = true;
    this.matGroup.add(this.topMesh);

    if (baseGeo) {
      this.baseMesh = new THREE.Mesh(baseGeo, this.materials.base);
      this.baseMesh.position.y = -thickness * 5;
      this.baseMesh.castShadow = true;
      this.baseMesh.receiveShadow = true;
      this.matGroup.add(this.baseMesh);
    }
  }

  setMatConfig(id: MaterialId, shape: MatShape, color: string) {
    const decals = this.currentDecals;
    this.buildMat(id, shape, color);
    if (decals) this.syncDecals(decals);
  }

  setBaseColor(color: string) {
    applyBaseColor(this.materials, this.materialId, color);
  }

  setViewMode(mode: ViewMode) {
    if (mode === this.viewMode) return;
    this.viewMode = mode;
    const to = mode === '3d' ? this.cam3d : this.cam2d;
    this.transition = { t: 0, from: this.camera.position.clone(), to: to.clone(), active: true };
    this.controls.enabled = mode === '3d';
  }

  // ---- Decals -------------------------------------------------------------
  private currentDecals: DecalState[] | null = null;
  private decalTextures = new Map<string, THREE.Texture>();

  syncDecals(decals: DecalState[]) {
    this.currentDecals = decals;
    this.decalGroup.clear();
    for (const d of decals) this.addDecalMesh(d);
  }

  private addDecalMesh(d: DecalState) {
    const loader = new THREE.TextureLoader();
    const apply = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const { length, width, thickness } = MAT_SIZE;
      // Map UV (0..1) to local coordinates on the top surface.
      const px = (d.x - 0.5) * length;
      const pz = (d.y - 0.5) * width;
      const position = new THREE.Vector3(px, thickness / 2 + 0.001, pz);
      const orientation = new THREE.Euler(-Math.PI / 2, 0, d.rotation);
      const dim = d.scale * width;
      const size = new THREE.Vector3(dim, dim, 1);

      const mat = new THREE.MeshPhysicalMaterial({
        map: tex,
        transparent: true,
        opacity: d.opacity,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        roughness: 0.6,
      });
      if (d.colorOverlay) {
        mat.color = new THREE.Color(d.colorOverlay);
        // overlayStrength blends between white (no tint) and the overlay color.
        mat.color.lerp(new THREE.Color('#ffffff'), 1 - d.overlayStrength);
      }
      const geo = new DecalGeometry(this.topMesh, position, orientation, size);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = `decal-${d.id}`;
      this.decalGroup.add(mesh);
    };

    const cached = this.decalTextures.get(d.imageUrl);
    if (cached) apply(cached);
    else
      loader.load(d.imageUrl, (tex) => {
        this.decalTextures.set(d.imageUrl, tex);
        apply(tex);
      });
  }

  // ---- Raycasting for eyedropper / decal placement ------------------------
  raycastTopUV(ndc: THREE.Vector2): { u: number; v: number } | null {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = ray.intersectObject(this.topMesh, false)[0];
    if (!hit) return null;
    const { length, width } = MAT_SIZE;
    const u = hit.point.x / length + 0.5;
    const v = hit.point.z / width + 0.5;
    return { u, v };
  }

  // ---- Render loop --------------------------------------------------------
  private animate = () => {
    this.raf = requestAnimationFrame(this.animate);
    if (this.transition?.active) {
      this.transition.t = Math.min(1, this.transition.t + 0.04);
      const e = easeInOutCubic(this.transition.t);
      this.camera.position.lerpVectors(this.transition.from, this.transition.to, e);
      this.camera.lookAt(0, 0, 0);
      if (this.transition.t >= 1) this.transition.active = false;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  /** High-res PNG/JPEG snapshot of the current frame (no watermark). */
  snapshot(mime: 'image/png' | 'image/jpeg' = 'image/png', quality = 0.95): Promise<Blob> {
    this.renderer.render(this.scene, this.camera);
    return new Promise((resolve) => this.canvas.toBlob((b) => resolve(b!), mime, quality));
  }

  get domElement() {
    return this.canvas;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.controls.dispose();
    this.renderer.dispose();
  }
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
