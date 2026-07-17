import React from 'react';
import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: 0.5 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-blue-500/20 flex items-center justify-center"
        >
          <PenLine size={28} className="text-blue-400" />
        </motion.div>
        <div>
          <p className="text-white/30 text-lg font-medium">Start drawing</p>
          <p className="text-white/15 text-sm mt-1">Select a tool and draw anything</p>
        </div>
        <div className="flex items-center gap-4 mt-2 text-white/15 text-xs">
          <span>P — Pencil</span>
          <span>R — Rectangle</span>
          <span>C — Circle</span>
          <span>A — Arrow</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyState;
