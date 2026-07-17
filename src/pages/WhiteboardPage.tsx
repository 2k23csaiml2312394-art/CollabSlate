import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Canvas from '../components/WhiteboardCanvas';
import Toolbar from '../components/DrawingToolbar';
import TopBar from '../components/WorkspaceHeader';
import LiveCursors from '../components/LiveCursors';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import { useRoom } from '../hooks/useRoom';
import { useAutosave } from '../hooks/useAutosave';
import { useCanvasStore } from '../store/canvasStore';

const WhiteboardPage: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId?: string }>();
  const { createRoom, joinRoom, leave } = useRoom();
  const { elements } = useCanvasStore();

  useAutosave();

  useEffect(() => {
    if (paramRoomId) {
      joinRoom(paramRoomId);
    }
  }, [paramRoomId, joinRoom]);

  return (
    <div className="fixed inset-0 bg-[#0f1117] overflow-hidden">
      <Canvas />
      <LiveCursors />

      <AnimatePresence>
        {elements.length === 0 && <EmptyState key="empty" />}
      </AnimatePresence>

      <TopBar
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onLeave={leave}
      />
      <Toolbar />
      <Toast />
    </div>
  );
};

export default WhiteboardPage;
