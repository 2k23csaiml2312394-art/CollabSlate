import { describe, it, expect } from 'vitest';
import { generateId, generateRoomId, generateColor } from '../utils/idGenerator';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('returns unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId));
    expect(ids.size).toBe(100);
  });
});

describe('generateRoomId', () => {
  it('returns a 6-char alphanumeric string', () => {
    const id = generateRoomId();
    expect(id).toMatch(/^[a-z0-9]{6}$/);
  });
});

describe('generateColor', () => {
  it('returns a hex color string', () => {
    const color = generateColor();
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
