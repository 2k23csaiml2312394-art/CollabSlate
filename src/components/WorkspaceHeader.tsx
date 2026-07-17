import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff, Copy, LogOut, PenLine, } from 'lucide-react';
import { useRoomStore } from '../store/roomStore';
import { useUserStore } from '../store/userStore';
import { useToastStore } from '../store/toastStore';
import RoomLobby from './Roomlobby';


interface Props {
  onCreateRoom: () => void;
  onJoinRoom: (id: string) => void;
  onLeave: () => void;
}

const TopBar: React.FC<Props> = React.memo(({ onCreateRoom, onJoinRoom, onLeave }) => {
  const [showModal, setShowModal] = useState(false);
  const { roomId, users, isConnected, isConnecting } = useRoomStore();
  const { userName, userColor } = useUserStore();
  const { addToast } = useToastStore();

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard!', 'success');
  };

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10"
        style={{ background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(20px)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <PenLine size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm">CollabSlate</span>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          {isConnecting ? (
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          ) : isConnected ? (
            <Wifi size={14} className="text-green-400" />
          ) : (
            <WifiOff size={14} className="text-gray-500" />
          )}
          {roomId ? (
            <span className="text-xs text-gray-300 font-mono">
              {isConnected ? roomId : 'Connecting...'}
            </span>
          ) : (
            <span className="text-xs text-gray-500">Solo mode</span>
          )}
        </div>

        {/* Users */}
        {roomId && isConnected && users.length > 0 && (
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            <div className="flex -space-x-1.5">
              {users.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  title={u.name}
                  className="w-6 h-6 rounded-full border border-gray-900 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: u.color }}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {users.length > 5 && (
                <div className="w-6 h-6 rounded-full border border-gray-900 bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                  +{users.length - 5}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 ml-1">{users.length}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pl-2 border-l border-white/10">
          {roomId && (
            <button
              onClick={copyLink}
              title="Copy room link"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Copy size={14} />
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-all bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
          >
            <Users size={14} />
            {roomId ? 'Room' : 'Collaborate'}
          </button>
          {roomId && (
            <button
              onClick={onLeave}
              title="Leave room"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: userColor }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-300 max-w-[80px] truncate">{userName}</span>
        </div>
      </motion.div>

      <RoomLobby
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreateRoom={onCreateRoom}
        onJoinRoom={onJoinRoom}
      />
    </>
  );
});

TopBar.displayName = 'TopBar';
export default TopBar;
