import { create } from 'zustand';
import type { CanvasElement } from '../types';

const MAX_HISTORY = 100;

interface HistoryStore {
  past: CanvasElement[][];
  future: CanvasElement[][];
  canUndo: boolean;
  canRedo: boolean;

  pushSnapshot: (elements: CanvasElement[]) => void;
  undo: (currentElements: CanvasElement[]) => CanvasElement[] | null;
  redo: (currentElements: CanvasElement[]) => CanvasElement[] | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushSnapshot: (elements) =>
    set((s) => {
      const past = [...s.past, elements].slice(-MAX_HISTORY);
      return { past, future: [], canUndo: past.length > 0, canRedo: false };
    }),

  undo: (currentElements) => {
    const { past } = get();
    if (!past.length) return null;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    set({ past: newPast, future: [currentElements, ...get().future], canUndo: newPast.length > 0, canRedo: true });
    return previous;
  },

  redo: (currentElements) => {
    const { future } = get();
    if (!future.length) return null;
    const next = future[0];
    const newFuture = future.slice(1);
    set((s) => ({ past: [...s.past, currentElements], future: newFuture, canUndo: true, canRedo: newFuture.length > 0 }));
    return next;
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));
