import { useCallback } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { clamp } from '../utils/canvasUtils';

const MIN_SCALE = 0.1;
const MAX_SCALE = 20;

export function useZoom() {
  const { transform, setTransform } = useCanvasStore();

  const zoomTo = useCallback((newScale: number, originX: number, originY: number) => {
    const clamped = clamp(newScale, MIN_SCALE, MAX_SCALE);
    const ratio = clamped / transform.scale;
    setTransform({
      scale: clamped,
      offsetX: originX - ratio * (originX - transform.offsetX),
      offsetY: originY - ratio * (originY - transform.offsetY),
    });
  }, [transform, setTransform]);

  const zoomIn = useCallback(() => {
    zoomTo(transform.scale * 1.2, window.innerWidth / 2, window.innerHeight / 2);
  }, [transform.scale, zoomTo]);

  const zoomOut = useCallback(() => {
    zoomTo(transform.scale / 1.2, window.innerWidth / 2, window.innerHeight / 2);
  }, [transform.scale, zoomTo]);

  const resetZoom = useCallback(() => {
    setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
  }, [setTransform]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = -e.deltaY * 0.005;
      zoomTo(transform.scale * (1 + delta), e.clientX, e.clientY);
    } else {
      setTransform({
        scale: transform.scale,
        offsetX: transform.offsetX - e.deltaX,
        offsetY: transform.offsetY - e.deltaY,
      });
    }
  }, [transform, zoomTo, setTransform]);

  return { zoomIn, zoomOut, resetZoom, handleWheel, scale: transform.scale };
}
