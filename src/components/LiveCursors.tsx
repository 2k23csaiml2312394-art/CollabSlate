import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '../store/roomStore';
import { useUserStore } from '../store/userStore';
import { useCanvasStore } from '../store/canvasStore';

const LiveCursors: React.FC = React.memo(() => {
  const { cursors } = useRoomStore();
  const { userId } = useUserStore();
  const { transform } = useCanvasStore();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {Object.values(cursors)
          .filter((c) => c.userId !== userId && c.x > -9000)
          .map((cursor) => {
            const sx = cursor.x * transform.scale + transform.offsetX;
            const sy = cursor.y * transform.scale + transform.offsetY;
            return (
              <motion.div
                key={cursor.userId}
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: sx, y: sy }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                style={{ left: 0, top: 0, x: sx, y: sy }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 2L16 10L10 11L8 17L4 2Z"
                    fill={cursor.color}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </svg>
                <div
                  className="mt-1 px-2 py-0.5 rounded-full text-white text-xs font-medium whitespace-nowrap shadow-lg"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.userName}
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
});

LiveCursors.displayName = 'LiveCursors';
export default LiveCursors;
