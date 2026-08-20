import { create } from 'zustand';
import { MaterialId, ViewMode, MatShape } from '@/core/constants';

export interface DecalState {
  id: string;
  name: string;
  imageUrl: string; // object URL or data URL of the (processed) logo
  /** UV-space position on the mat top surface, range 0..1. */
  x: number;
  y: number;
  /** Scale as a fraction of mat width. */
  scale: number;
  rotation: number; // radians
  opacity: number; // 0..1
  colorOverlay: string | null; // hex or null (no overlay)
  overlayStrength: number; // 0..1
}

export interface AnnotationText {
  id: string;
  text: string;
  x: number; // px in the 2D annotation canvas
  y: number;
  color: string;
  size: number;
}

export type Tool = 'orbit' | 'eyedropper' | 'draw' | 'text';

interface StudioState {
  viewMode: ViewMode;
  material: MaterialId;
  shape: MatShape;
  baseColor: string;
  selectedDecalId: string | null;
  decals: DecalState[];
  annotations: AnnotationText[];
  tool: Tool;
  removeBgApiKey: string;
  brushColor: string;
  brushWidth: number;
  isRecording: boolean;

  setViewMode: (m: ViewMode) => void;
  setMaterial: (m: MaterialId) => void;
  setShape: (s: MatShape) => void;
  setBaseColor: (c: string) => void;
  setTool: (t: Tool) => void;
  setRemoveBgApiKey: (k: string) => void;
  setBrush: (p: Partial<{ color: string; width: number }>) => void;
  setRecording: (v: boolean) => void;

  addDecal: (d: Omit<DecalState, 'id'>) => string;
  updateDecal: (id: string, patch: Partial<DecalState>) => void;
  removeDecal: (id: string) => void;
  selectDecal: (id: string | null) => void;

  addAnnotation: (a: Omit<AnnotationText, 'id'>) => void;
  clearAnnotations: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStudioStore = create<StudioState>((set) => ({
  viewMode: '3d',
  material: 'pu-matte',
  shape: 'regular',
  baseColor: '#585e65',
  selectedDecalId: null,
  decals: [],
  annotations: [],
  tool: 'orbit',
  removeBgApiKey: localStorage.getItem('removebg_key') ?? '',
  brushColor: '#ff5d5d',
  brushWidth: 4,
  isRecording: false,

  setViewMode: (viewMode) => set({ viewMode }),
  setMaterial: (material) => set({ material }),
  setShape: (shape) => set({ shape }),
  setBaseColor: (baseColor) => set({ baseColor }),
  setTool: (tool) => set({ tool }),
  setRemoveBgApiKey: (removeBgApiKey) => {
    localStorage.setItem('removebg_key', removeBgApiKey);
    set({ removeBgApiKey });
  },
  setBrush: (p) => set((s) => ({ brushColor: p.color ?? s.brushColor, brushWidth: p.width ?? s.brushWidth })),
  setRecording: (isRecording) => set({ isRecording }),

  addDecal: (d) => {
    const id = uid();
    set((s) => ({ decals: [...s.decals, { ...d, id }], selectedDecalId: id }));
    return id;
  },
  updateDecal: (id, patch) =>
    set((s) => ({ decals: s.decals.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
  removeDecal: (id) =>
    set((s) => ({
      decals: s.decals.filter((d) => d.id !== id),
      selectedDecalId: s.selectedDecalId === id ? null : s.selectedDecalId,
    })),
  selectDecal: (selectedDecalId) => set({ selectedDecalId }),

  addAnnotation: (a) => set((s) => ({ annotations: [...s.annotations, { ...a, id: uid() }] })),
  clearAnnotations: () => set({ annotations: [] }),
}));
