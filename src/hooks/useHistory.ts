import { useCallback, useEffect } from 'react';
import { useHistoryStore } from '../store/historyStore';
import { useCanvasStore } from '../store/canvasStore';

export function useHistory() {
  const { undo, redo, canUndo, canRedo, pushSnapshot } = useHistoryStore();
  const { elements, setElements } = useCanvasStore();

  const handleUndo = useCallback(() => {
    const prev = undo(elements);
    if (prev !== null) setElements(prev);
  }, [undo, elements, setElements]);

  const handleRedo = useCallback(() => {
    const next = redo(elements);
    if (next !== null) setElements(next);
  }, [redo, elements, setElements]);

  const snapshot = useCallback(() => {
    pushSnapshot(elements);
  }, [pushSnapshot, elements]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

  return { undo: handleUndo, redo: handleRedo, snapshot, canUndo, canRedo };
}
