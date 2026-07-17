import { create } from 'zustand';
import type { CanvasElement, Tool, ViewTransform } from '../types';

interface CanvasStore {
  elements: CanvasElement[];
  activeTool: Tool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  selectedId: string | null;
  showGrid: boolean;
  transform: ViewTransform;

  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setActiveTool: (tool: Tool) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setSelectedId: (id: string | null) => void;
  toggleGrid: () => void;
  setTransform: (transform: ViewTransform) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  elements: [],
  activeTool: 'pencil',
  strokeColor: '#ffffff',
  fillColor: 'transparent',
  strokeWidth: 3,
  selectedId: null,
  showGrid: true,
  transform: { scale: 1, offsetX: 0, offsetY: 0 },

  setElements: (elements) => set({ elements }),
  addElement: (element) => set((s) => ({ elements: [...s.elements, element] })),
  updateElement: (id, updates) =>
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),
  removeElement: (id) =>
    set((s) => ({ elements: s.elements.filter((el) => el.id !== id), selectedId: null })),
  setActiveTool: (tool) => set({ activeTool: tool, selectedId: null }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setFillColor: (fillColor) => set({ fillColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setSelectedId: (selectedId) => set({ selectedId }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setTransform: (transform) => set({ transform }),
}));
