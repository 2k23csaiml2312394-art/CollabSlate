import type { CanvasElement, Point, PencilElement, RectangleElement, CircleElement, LineElement, ArrowElement } from '../types';
import { getDistance } from './canvasUtils';

const HIT_TOLERANCE = 8;

export function hitTest(element: CanvasElement, point: Point): boolean {
  switch (element.type) {
    case 'pencil':
    case 'eraser':
      return hitTestPencil(element as PencilElement, point);
    case 'rectangle':
      return hitTestRectangle(element as RectangleElement, point);
    case 'circle':
      return hitTestCircle(element as CircleElement, point);
    case 'line':
      return hitTestLine(element as LineElement, point);
    case 'arrow':
      return hitTestLine(element as ArrowElement, point);
    default:
      return false;
  }
}

function hitTestPencil(el: PencilElement, point: Point): boolean {
  const { points } = el;
  for (let i = 0; i < points.length - 1; i++) {
    if (distToSegment(point, points[i], points[i + 1]) < HIT_TOLERANCE) {
      return true;
    }
  }
  return false;
}

function hitTestRectangle(el: RectangleElement, point: Point): boolean {
  const { x, y, width, height } = el;
  const minX = Math.min(x, x + width);
  const maxX = Math.max(x, x + width);
  const minY = Math.min(y, y + height);
  const maxY = Math.max(y, y + height);

  const onLeft = Math.abs(point.x - minX) < HIT_TOLERANCE && point.y >= minY && point.y <= maxY;
  const onRight = Math.abs(point.x - maxX) < HIT_TOLERANCE && point.y >= minY && point.y <= maxY;
  const onTop = Math.abs(point.y - minY) < HIT_TOLERANCE && point.x >= minX && point.x <= maxX;
  const onBottom = Math.abs(point.y - maxY) < HIT_TOLERANCE && point.x >= minX && point.x <= maxX;

  return onLeft || onRight || onTop || onBottom;
}

function hitTestCircle(el: CircleElement, point: Point): boolean {
  const dist = getDistance({ x: el.cx, y: el.cy }, point);
  const avgRadius = (Math.abs(el.rx) + Math.abs(el.ry)) / 2;
  return Math.abs(dist - avgRadius) < HIT_TOLERANCE;
}

function hitTestLine(el: LineElement | ArrowElement, point: Point): boolean {
  return distToSegment(point, { x: el.x1, y: el.y1 }, { x: el.x2, y: el.y2 }) < HIT_TOLERANCE;
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ap = { x: p.x - a.x, y: p.y - a.y };
  const lenSq = ab.x * ab.x + ab.y * ab.y;
  if (lenSq === 0) return getDistance(p, a);
  const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / lenSq));
  return getDistance(p, { x: a.x + t * ab.x, y: a.y + t * ab.y });
}

export function getBoundingBox(el: CanvasElement): { x: number; y: number; width: number; height: number } {
  switch (el.type) {
    case 'pencil':
    case 'eraser': {
      const pts = (el as PencilElement).points;
      if (!pts.length) return { x: 0, y: 0, width: 0, height: 0 };
      const xs = pts.map(p => p.x);
      const ys = pts.map(p => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
    }
    case 'rectangle': {
      const r = el as RectangleElement;
      return { x: Math.min(r.x, r.x + r.width), y: Math.min(r.y, r.y + r.height), width: Math.abs(r.width), height: Math.abs(r.height) };
    }
    case 'circle': {
      const c = el as CircleElement;
      return { x: c.cx - Math.abs(c.rx), y: c.cy - Math.abs(c.ry), width: Math.abs(c.rx) * 2, height: Math.abs(c.ry) * 2 };
    }
    case 'line':
    case 'arrow': {
      const l = el as LineElement;
      return { x: Math.min(l.x1, l.x2), y: Math.min(l.y1, l.y2), width: Math.abs(l.x2 - l.x1), height: Math.abs(l.y2 - l.y1) };
    }
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}
