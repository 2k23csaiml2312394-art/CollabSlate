import React, { useEffect, useCallback, useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useZoom } from '../hooks/useZoom';
import { useCanvasStore } from '../store/canvasStore';

const Canvas: React.FC = React.memo(() => {
  const { canvasRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useCanvas();
  const { handleWheel } = useZoom();
  const { activeTool } = useCanvasStore();
  const wheelRef = useRef(handleWheel);
  wheelRef.current = handleWheel;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: WheelEvent) => wheelRef.current(e);
    canvas.addEventListener('wheel', handler, { passive: false });
    return () => canvas.removeEventListener('wheel', handler);
  }, [canvasRef]);

  const cursor = activeTool === 'pencil'
    ? 'cursor-crosshair'
    : activeTool === 'eraser'
    ? 'cursor-cell'
    : activeTool === 'select'
    ? 'cursor-default'
    : 'cursor-crosshair';

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${cursor}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{ touchAction: 'none' }}
    />
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;
