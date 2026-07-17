import { describe, it, expect } from 'vitest';
import { hitTest, getBoundingBox } from '../utils/hitTest';
import type { RectangleElement, CircleElement, LineElement, PencilElement } from '../types';

const base = { id: 'test', strokeColor: '#fff', strokeWidth: 2, opacity: 1 };

describe('hitTest - rectangle', () => {
  const rect: RectangleElement = { ...base, type: 'rectangle', x: 10, y: 10, width: 100, height: 80, fillColor: 'transparent' };

  it('detects hit on top edge', () => {
    expect(hitTest(rect, { x: 60, y: 10 })).toBe(true);
  });

  it('detects hit on left edge', () => {
    expect(hitTest(rect, { x: 10, y: 50 })).toBe(true);
  });

  it('misses interior fill area', () => {
    expect(hitTest(rect, { x: 60, y: 60 })).toBe(false);
  });

  it('misses outside', () => {
    expect(hitTest(rect, { x: 200, y: 200 })).toBe(false);
  });
});

describe('hitTest - circle', () => {
  const circle: CircleElement = { ...base, type: 'circle', cx: 100, cy: 100, rx: 50, ry: 50, fillColor: 'transparent' };

  it('hits circumference', () => {
    expect(hitTest(circle, { x: 150, y: 100 })).toBe(true);
  });

  it('misses center', () => {
    expect(hitTest(circle, { x: 100, y: 100 })).toBe(false);
  });

  it('misses outside', () => {
    expect(hitTest(circle, { x: 200, y: 200 })).toBe(false);
  });
});

describe('hitTest - line', () => {
  const line: LineElement = { ...base, type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 };

  it('hits on line', () => {
    expect(hitTest(line, { x: 50, y: 0 })).toBe(true);
  });

  it('misses far from line', () => {
    expect(hitTest(line, { x: 50, y: 50 })).toBe(false);
  });
});

describe('getBoundingBox - pencil', () => {
  const pencil: PencilElement = {
    ...base,
    type: 'pencil',
    points: [{ x: 10, y: 20 }, { x: 50, y: 80 }, { x: 30, y: 5 }],
  };

  it('returns correct bounding box', () => {
    const bb = getBoundingBox(pencil);
    expect(bb.x).toBe(10);
    expect(bb.y).toBe(5);
    expect(bb.width).toBe(40);
    expect(bb.height).toBe(75);
  });
});
