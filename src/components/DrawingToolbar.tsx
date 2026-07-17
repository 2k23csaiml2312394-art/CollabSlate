import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Pencil, Square, Circle, Minus, ArrowRight, Eraser, MousePointer2,
  Trash2, Grid3x3, ZoomIn, ZoomOut, RotateCcw, Download,
} from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { useHistoryStore } from '../store/historyStore';
import { useZoom } from '../hooks/useZoom';
import type { Tool } from '../types';

const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'V' },
  { id: 'pencil', icon: <Pencil size={18} />, label: 'Pencil', shortcut: 'P' },
  { id: 'rectangle', icon: <Square size={18} />, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: <Circle size={18} />, label: 'Circle', shortcut: 'C' },
  { id: 'line', icon: <Minus size={18} />, label: 'Line', shortcut: 'L' },
  { id: 'arrow', icon: <ArrowRight size={18} />, label: 'Arrow', shortcut: 'A' },
  { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser', shortcut: 'E' },
];

const strokeWidths = [2, 4, 8, 14];
const colors = [
  '#ffffff', '#f87171', '#fb923c', '#facc15',
  '#4ade80', '#60a5fa', '#a78bfa', '#f472b6',
  '#94a3b8', '#000000',
];

function exportCanvas() {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'whiteboard.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

const Toolbar: React.FC = React.memo(() => {
  const {
    activeTool, setActiveTool, strokeColor, setStrokeColor,
    strokeWidth, setStrokeWidth, selectedId, removeElement,
    toggleGrid, showGrid,
  } = useCanvasStore();
  const { canUndo, canRedo } = useHistoryStore();
  const { zoomIn, zoomOut, resetZoom, scale } = useZoom();
  const { undo, redo } = useHistoryStore.getState()
    ? { undo: () => {}, redo: () => {} }
    : { undo: () => {}, redo: () => {} };

  const handleUndo = useCallback(() => {
    const store = useHistoryStore.getState();
    const canvasStore = useCanvasStore.getState();
    const prev = store.undo(canvasStore.elements);
    if (prev) canvasStore.setElements(prev);
  }, []);

  const handleRedo = useCallback(() => {
    const store = useHistoryStore.getState();
    const canvasStore = useCanvasStore.getState();
    const next = store.redo(canvasStore.elements);
    if (next) canvasStore.setElements(next);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const map: Record<string, Tool> = { v: 'select', p: 'pencil', r: 'rectangle', c: 'circle', l: 'line', a: 'arrow', e: 'eraser' };
      const t = map[e.key.toLowerCase()];
      if (t) setActiveTool(t);
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const s = useCanvasStore.getState();
        if (s.selectedId) s.removeElement(s.selectedId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveTool]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-2 rounded-2xl shadow-2xl border border-white/10"
      style={{ background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(20px)' }}
    >
      {/* Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTool(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
              activeTool === tool.id
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tool.icon}
          </motion.button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Stroke widths */}
      <div className="flex items-center gap-1">
        {strokeWidths.map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            title={`Stroke width ${w}`}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              strokeWidth === w ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <div
              className="rounded-full bg-white"
              style={{ width: Math.min(w * 1.5, 14), height: Math.min(w * 1.5, 14) }}
            />
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setStrokeColor(color)}
            title={color}
            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
              strokeColor === color ? 'border-blue-400 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw size={16} className="scale-x-[-1]" />
        </button>
        <button
          onClick={() => selectedId && removeElement(selectedId)}
          disabled={!selectedId}
          title="Delete selected (Delete)"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={toggleGrid}
          title="Toggle grid"
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
            showGrid ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Grid3x3 size={16} />
        </button>
        <button onClick={zoomOut} title="Zoom out" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetZoom}
          title="Reset zoom"
          className="h-9 px-2 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs tabular-nums min-w-[3rem]"
        >
          {Math.round(scale * 100)}%
        </button>
        <button onClick={zoomIn} title="Zoom in" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <ZoomIn size={16} />
        </button>
        <button onClick={exportCanvas} title="Export as PNG" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all">
          <Download size={16} />
        </button>
      </div>
    </motion.div>
  );
});

Toolbar.displayName = 'Toolbar';
export default Toolbar;
