import { describe, it, expect } from 'vitest';
import { screenToCanvas, canvasToScreen, getDistance, getMidpoint, clamp } from '../utils/canvasUtils';

const transform = { scale: 2, offsetX: 100, offsetY: 50 };

describe('screenToCanvas', () => {
  it('converts screen coords to canvas space', () => {
    const pt = screenToCanvas(200, 150, transform);
    expect(pt.x).toBeCloseTo(50);
    expect(pt.y).toBeCloseTo(50);
  });

  it('handles identity transform', () => {
    const id = { scale: 1, offsetX: 0, offsetY: 0 };
    const pt = screenToCanvas(300, 200, id);
    expect(pt.x).toBe(300);
    expect(pt.y).toBe(200);
  });
});

describe('canvasToScreen', () => {
  it('converts canvas coords to screen space', () => {
    const pt = canvasToScreen(50, 50, transform);
    expect(pt.x).toBe(200);
    expect(pt.y).toBe(150);
  });

  it('is inverse of screenToCanvas', () => {
    const original = { x: 123, y: 456 };
    const screen = canvasToScreen(original.x, original.y, transform);
    const back = screenToCanvas(screen.x, screen.y, transform);
    expect(back.x).toBeCloseTo(original.x);
    expect(back.y).toBeCloseTo(original.y);
  });
});

describe('getDistance', () => {
  it('computes euclidean distance', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('returns 0 for same point', () => {
    expect(getDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });
});

describe('getMidpoint', () => {
  it('returns midpoint', () => {
    const mid = getMidpoint({ x: 0, y: 0 }, { x: 10, y: 10 });
    expect(mid).toEqual({ x: 5, y: 5 });
  });
});

describe('clamp', () => {
  it('clamps to min', () => expect(clamp(-5, 0, 10)).toBe(0));
  it('clamps to max', () => expect(clamp(15, 0, 10)).toBe(10));
  it('passes through in-range values', () => expect(clamp(5, 0, 10)).toBe(5));
});
