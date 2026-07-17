import { useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';

const AUTOSAVE_KEY = 'wb_canvas_elements';
const AUTOSAVE_INTERVAL = 5000;

export function useAutosave() {
  const { elements, setElements } = useCanvasStore();

  // Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        setElements(JSON.parse(saved));
      }
    } catch {
      // corrupted storage — ignore
    }
  }, [setElements]);

  // Save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(elements));
      } catch {
        // storage quota exceeded — ignore
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [elements]);
}
