// Default physical dimensions (centimeters) -> converted to Three.js units (1 unit = 1 cm).
export const MAT_DIMENSIONS_CM = {
  length: 183,
  width: 68,
  thickness: 0.5,
} as const;

// Scale factor for the scene. We render in decimeters to keep numbers small & camera stable.
export const CM_TO_UNIT = 0.1; // 1 cm = 0.1 unit

export const MAT_SIZE = {
  length: MAT_DIMENSIONS_CM.length * CM_TO_UNIT, // 18.3
  width: MAT_DIMENSIONS_CM.width * CM_TO_UNIT, // 6.8
  thickness: MAT_DIMENSIONS_CM.thickness * CM_TO_UNIT, // 0.05
};

export type MaterialId = 'tpe' | 'pu-matte' | 'pu-glossy' | 'cork';
export type MatShape = 'regular' | 'semicircle' | 'oval';

export interface MaterialPreset {
  id: MaterialId;
  label: string;
  description: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  /** Whether this preset renders a dual-layer (surface + base) body. */
  dualLayer: boolean;
}

export const MATERIAL_PRESETS: Record<MaterialId, MaterialPreset> = {
  tpe: {
    id: 'tpe',
    label: 'TPE 材质',
    description: '环保 TPE，轻微弹性哑光表面，色彩饱和度高。',
    roughness: 0.72,
    metalness: 0.0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.6,
    sheen: 0.2,
    dualLayer: false,
  },
  'pu-matte': {
    id: 'pu-matte',
    label: 'PU 磨砂材质',
    description: '表面 0.5mm 磨砂 PU + 底部天然橡胶，极致防滑。',
    roughness: 0.65,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
    sheen: 0.2,
    dualLayer: true,
  },
  'pu-glossy': {
    id: 'pu-glossy',
    label: 'PU 亮面材质',
    description: '表面 0.5mm 镜面 PU，高亮光泽，色彩鲜艳。',
    roughness: 0.15,
    metalness: 0.05,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    sheen: 0.0,
    dualLayer: true,
  },
  cork: {
    id: 'cork',
    label: '软木材质 (Cork)',
    description: '天然软木颗粒纹理，温润哑光，抗菌防滑。',
    roughness: 0.9,
    metalness: 0.0,
    clearcoat: 0.05,
    clearcoatRoughness: 0.8,
    sheen: 0.1,
    dualLayer: false,
  },
};

export const YOGA_COLORS = [
  { id: 'YM-213', hex: '#d67a3f', label: '活力橙' },
  { id: 'YM-211', hex: '#26949a', label: '湖水绿' },
  { id: 'YM-210', hex: '#314e7f', label: '海军蓝' },
  { id: 'YM-209', hex: '#637550', label: '橄榄绿' },
  { id: 'YM-208', hex: '#8775ad', label: '薰衣草' },
  { id: 'YM-207', hex: '#585e65', label: '炭灰色' },
  { id: 'YM-214', hex: '#1f2022', label: '深邃黑' },
  { id: 'YM-201', hex: '#633d4a', label: '勃艮第红' },
  { id: 'YM-202', hex: '#5b787a', label: '青石色' },
  { id: 'YM-203', hex: '#384d94', label: '宝蓝色' },
  { id: 'YM-204', hex: '#254a41', label: '森林绿' },
  { id: 'YM-205', hex: '#d2b4c1', label: '柔粉色' },
  { id: 'YM-206', hex: '#7d7a78', label: '灰褐色' },
];

export type ViewMode = '2d' | '3d';
