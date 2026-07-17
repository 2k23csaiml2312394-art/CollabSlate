import type { Point, ViewTransform, CanvasElement, PencilElement, RectangleElement, CircleElement, LineElement, ArrowElement } from '../types';

export function screenToCanvas(sx: number, sy: number, t: ViewTransform): Point {
  return {
    x: (sx - t.offsetX) / t.scale,
    y: (sy - t.offsetY) / t.scale,
  };
}

export function canvasToScreen(cx: number, cy: number, t: ViewTransform): Point {
  return {
    x: cx * t.scale + t.offsetX,
    y: cy * t.scale + t.offsetY,
  };
}

export function getDistance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function getMidpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  transform: ViewTransform
): void {
  const gridSize = 40;
  const scaledGrid = gridSize * transform.scale;

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;

  const startX = transform.offsetX % scaledGrid;
  const startY = transform.offsetY % scaledGrid;

  for (let x = startX; x < width; x += scaledGrid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = startY; y < height; y += scaledGrid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawElement(ctx: CanvasRenderingContext2D, el: CanvasElement): void {
  ctx.save();
  ctx.globalAlpha = el.opacity;
  ctx.strokeStyle = el.strokeColor;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (el.type) {
    case 'pencil':
      drawPencil(ctx, el as PencilElement);
      break;
    case 'eraser':
      drawEraser(ctx, el as PencilElement);
      break;
    case 'rectangle':
      drawRectangle(ctx, el as RectangleElement);
      break;
    case 'circle':
      drawCircle(ctx, el as CircleElement);
      break;
    case 'line':
      drawLine(ctx, el as LineElement);
      break;
    case 'arrow':
      drawArrow(ctx, el as ArrowElement);
      break;
  }

  ctx.restore();
}

function drawPencil(ctx: CanvasRenderingContext2D, el: PencilElement): void {
  const { points } = el;
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const mid = getMidpoint(points[i], points[i + 1]);
    ctx.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y);
  }

  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

function drawEraser(ctx: CanvasRenderingContext2D, el: PencilElement): void {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.strokeStyle = 'rgba(0,0,0,1)';
  ctx.lineWidth = el.strokeWidth * 3;
  drawPencil(ctx, el);
  ctx.globalCompositeOperation = 'source-over';
}

function drawRectangle(ctx: CanvasRenderingContext2D, el: RectangleElement): void {
  if (el.fillColor && el.fillColor !== 'transparent') {
    ctx.fillStyle = el.fillColor;
    ctx.fillRect(el.x, el.y, el.width, el.height);
  }
  ctx.strokeRect(el.x, el.y, el.width, el.height);
}

function drawCircle(ctx: CanvasRenderingContext2D, el: CircleElement): void {
  ctx.beginPath();
  ctx.ellipse(el.cx, el.cy, Math.abs(el.rx), Math.abs(el.ry), 0, 0, Math.PI * 2);
  if (el.fillColor && el.fillColor !== 'transparent') {
    ctx.fillStyle = el.fillColor;
    ctx.fill();
  }
  ctx.stroke();
}

function drawLine(ctx: CanvasRenderingContext2D, el: LineElement): void {
  ctx.beginPath();
  ctx.moveTo(el.x1, el.y1);
  ctx.lineTo(el.x2, el.y2);
  ctx.stroke();
}

function drawArrow(ctx: CanvasRenderingContext2D, el: ArrowElement): void {
  const { x1, y1, x2, y2 } = el;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = Math.min(20, getDistance({ x: x1, y: y1 }, { x: x2, y: y2 }) * 0.3) + 10;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}
