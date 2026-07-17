import { useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { useHistoryStore } from '../store/historyStore';
import { useRoomStore } from '../store/roomStore';
import { useUserStore } from '../store/userStore';
import { drawElement, drawGrid, screenToCanvas } from '../utils/canvasUtils';
import { hitTest, getBoundingBox } from '../utils/hitTest';
import { generateId } from '../utils/idGenerator';
import { socketService } from '../services/socketService';
import type { CanvasElement, Point, PencilElement, RectangleElement, CircleElement, LineElement, ArrowElement } from '../types';

const CURSOR_THROTTLE = 40;

function drawSelectionHandles(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  const bb = getBoundingBox(el);
  ctx.save();
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);
  const pad = 6;
  ctx.strokeRect(bb.x - pad, bb.y - pad, bb.width + pad * 2, bb.height + pad * 2);
  ctx.setLineDash([]);
  const handles = [
    { x: bb.x - pad, y: bb.y - pad },
    { x: bb.x + bb.width / 2, y: bb.y - pad },
    { x: bb.x + bb.width + pad, y: bb.y - pad },
    { x: bb.x + bb.width + pad, y: bb.y + bb.height / 2 },
    { x: bb.x + bb.width + pad, y: bb.y + bb.height + pad },
    { x: bb.x + bb.width / 2, y: bb.y + bb.height + pad },
    { x: bb.x - pad, y: bb.y + bb.height + pad },
    { x: bb.x - pad, y: bb.y + bb.height / 2 },
  ];
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1.5;
  for (const h of handles) {
    ctx.beginPath();
    ctx.arc(h.x, h.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const currentElementRef = useRef<CanvasElement | null>(null);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const lastCursorEmit = useRef(0);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });

  const storeRef = useRef(useCanvasStore.getState());
  useEffect(() => useCanvasStore.subscribe((s) => { storeRef.current = s; }), []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = storeRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, w, h);

    if (s.showGrid) drawGrid(ctx, w, h, s.transform);

    ctx.save();
    ctx.translate(s.transform.offsetX, s.transform.offsetY);
    ctx.scale(s.transform.scale, s.transform.scale);

    for (const el of s.elements) {
      drawElement(ctx, el);
    }

    if (currentElementRef.current) {
      drawElement(ctx, currentElementRef.current);
    }

    if (s.selectedId) {
      const selected = s.elements.find((el) => el.id === s.selectedId);
      if (selected) drawSelectionHandles(ctx, selected);
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    const loop = () => {
      render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const getPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const s = storeRef.current;
    return screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, s.transform);
  }, []);

  const emitCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastCursorEmit.current < CURSOR_THROTTLE) return;
    lastCursorEmit.current = now;
    const { roomId } = useRoomStore.getState();
    const { userId, userName, userColor } = useUserStore.getState();
    const socket = socketService.get();
    if (socket && roomId) {
      socket.emit('cursor:move', { roomId, cursor: { userId, userName, x, y, color: userColor } });
    }
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanningRef.current = true;
      const s = storeRef.current;
      panStartRef.current = { x: e.clientX - s.transform.offsetX, y: e.clientY - s.transform.offsetY };
      return;
    }
    if (e.button !== 0) return;

    const pt = getPoint(e);
    const s = storeRef.current;
    const { activeTool, strokeColor, fillColor, strokeWidth } = s;

    if (activeTool === 'select') {
      const hit = [...s.elements].reverse().find((el) => hitTest(el, pt));
      s.setSelectedId(hit?.id ?? null);
      if (hit) {
        dragStartRef.current = pt;
        isDrawingRef.current = true;
      }
      return;
    }

    isDrawingRef.current = true;
    const { userId } = useUserStore.getState();
    const base = { id: generateId(), strokeColor, strokeWidth, opacity: 1, createdBy: userId };

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      currentElementRef.current = { ...base, type: activeTool, points: [pt] } as PencilElement;
    } else if (activeTool === 'rectangle') {
      currentElementRef.current = { ...base, type: 'rectangle', x: pt.x, y: pt.y, width: 0, height: 0, fillColor } as RectangleElement;
    } else if (activeTool === 'circle') {
      currentElementRef.current = { ...base, type: 'circle', cx: pt.x, cy: pt.y, rx: 0, ry: 0, fillColor } as CircleElement;
    } else if (activeTool === 'line') {
      currentElementRef.current = { ...base, type: 'line', x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y } as LineElement;
    } else if (activeTool === 'arrow') {
      currentElementRef.current = { ...base, type: 'arrow', x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y } as ArrowElement;
    }
  }, [getPoint]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const s = storeRef.current;

    if (isPanningRef.current) {
      s.setTransform({
        scale: s.transform.scale,
        offsetX: e.clientX - panStartRef.current.x,
        offsetY: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const pt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, s.transform);
    emitCursor(pt.x, pt.y);

    if (s.activeTool === 'select' && isDrawingRef.current && s.selectedId) {
      const dx = pt.x - dragStartRef.current.x;
      const dy = pt.y - dragStartRef.current.y;
      dragStartRef.current = pt;
      const el = s.elements.find((el) => el.id === s.selectedId);
      if (!el) return;
      if (el.type === 'pencil' || el.type === 'eraser') {
        s.updateElement(s.selectedId, { points: (el as PencilElement).points.map((p) => ({ x: p.x + dx, y: p.y + dy })) } as Partial<CanvasElement>);
      } else if (el.type === 'rectangle') {
        const r = el as RectangleElement;
        s.updateElement(s.selectedId, { x: r.x + dx, y: r.y + dy } as Partial<CanvasElement>);
      } else if (el.type === 'circle') {
        const c = el as CircleElement;
        s.updateElement(s.selectedId, { cx: c.cx + dx, cy: c.cy + dy } as Partial<CanvasElement>);
      } else if (el.type === 'line' || el.type === 'arrow') {
        const l = el as LineElement;
        s.updateElement(s.selectedId, { x1: l.x1 + dx, y1: l.y1 + dy, x2: l.x2 + dx, y2: l.y2 + dy } as Partial<CanvasElement>);
      }
      return;
    }

    if (!isDrawingRef.current || !currentElementRef.current) return;
    const el = currentElementRef.current;

    if (el.type === 'pencil' || el.type === 'eraser') {
      (el as PencilElement).points = [...(el as PencilElement).points, pt];
    } else if (el.type === 'rectangle') {
      const r = el as RectangleElement;
      r.width = pt.x - r.x;
      r.height = pt.y - r.y;
    } else if (el.type === 'circle') {
      const c = el as CircleElement;
      c.rx = pt.x - c.cx;
      c.ry = pt.y - c.cy;
    } else if (el.type === 'line' || el.type === 'arrow') {
      (el as LineElement).x2 = pt.x;
      (el as LineElement).y2 = pt.y;
    }
  }, [emitCursor]);

  const onMouseUp = useCallback(() => {
    isPanningRef.current = false;

    const s = storeRef.current;
    if (s.activeTool === 'select') {
      isDrawingRef.current = false;
      return;
    }

    if (!isDrawingRef.current || !currentElementRef.current) return;
    const el = currentElementRef.current;

    useHistoryStore.getState().pushSnapshot(s.elements);
    s.addElement(el);

    const { roomId } = useRoomStore.getState();
    const socket = socketService.get();
    if (socket && roomId) {
      socket.emit('element:add', { roomId, element: el });
    }

    currentElementRef.current = null;
    isDrawingRef.current = false;
  }, []);

  const onMouseLeave = useCallback(() => {
    const { roomId } = useRoomStore.getState();
    const { userId, userName, userColor } = useUserStore.getState();
    const socket = socketService.get();
    if (socket && roomId) {
      socket.emit('cursor:move', { roomId, cursor: { userId, userName, x: -9999, y: -9999, color: userColor } });
    }
  }, []);

  return { canvasRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}
