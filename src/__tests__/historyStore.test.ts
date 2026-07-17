import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore } from '../store/historyStore';
import type { CanvasElement, RectangleElement } from '../types';

const makeRect = (id: string): RectangleElement => ({
  id,
  type: 'rectangle',
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  strokeColor: '#fff',
  fillColor: 'transparent',
  strokeWidth: 2,
  opacity: 1,
});

describe('historyStore', () => {
  beforeEach(() => {
    useHistoryStore.setState({ past: [], future: [], canUndo: false, canRedo: false });
  });

  it('starts with empty history', () => {
    const { past, future, canUndo, canRedo } = useHistoryStore.getState();
    expect(past).toHaveLength(0);
    expect(future).toHaveLength(0);
    expect(canUndo).toBe(false);
    expect(canRedo).toBe(false);
  });

  it('pushSnapshot adds to past and clears future', () => {
    const { pushSnapshot } = useHistoryStore.getState();
    const snapshot: CanvasElement[] = [makeRect('a')];
    pushSnapshot(snapshot);
    const state = useHistoryStore.getState();
    expect(state.past).toHaveLength(1);
    expect(state.canUndo).toBe(true);
    expect(state.canRedo).toBe(false);
  });

  it('undo returns previous snapshot', () => {
    const { pushSnapshot, undo } = useHistoryStore.getState();
    const s1: CanvasElement[] = [makeRect('a')];
    const s2: CanvasElement[] = [makeRect('a'), makeRect('b')];
    pushSnapshot(s1);
    const prev = undo(s2);
    expect(prev).toEqual(s1);
    expect(useHistoryStore.getState().canRedo).toBe(true);
  });

  it('redo returns next snapshot', () => {
    const { pushSnapshot, undo, redo } = useHistoryStore.getState();
    const s1: CanvasElement[] = [makeRect('a')];
    const s2: CanvasElement[] = [makeRect('a'), makeRect('b')];
    pushSnapshot(s1);
    undo(s2);
    const next = redo(s1);
    expect(next).toEqual(s2);
  });

  it('undo returns null when no history', () => {
    const result = useHistoryStore.getState().undo([]);
    expect(result).toBeNull();
  });

  it('respects MAX_HISTORY of 100', () => {
    const { pushSnapshot } = useHistoryStore.getState();
    for (let i = 0; i < 110; i++) {
      pushSnapshot([makeRect(String(i))]);
    }
    expect(useHistoryStore.getState().past.length).toBeLessThanOrEqual(100);
  });

  it('clear resets all state', () => {
    const { pushSnapshot, clear } = useHistoryStore.getState();
    pushSnapshot([makeRect('a')]);
    clear();
    const state = useHistoryStore.getState();
    expect(state.past).toHaveLength(0);
    expect(state.canUndo).toBe(false);
  });
});
