import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Link, Plus, LogIn } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useToastStore } from '../store/toastStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (id: string) => void;
}

const RoomLobby: React.FC<Props> = ({ isOpen, onClose, onCreateRoom, onJoinRoom }) => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const { userName, setUserName } = useUserStore();
  const { addToast } = useToastStore();

  const handleJoin = () => {
    const id = roomIdInput.trim();
    if (!id) return;
    if (nameInput.trim()) setUserName(nameInput.trim());
    onJoinRoom(id);
    onClose();
  };

  const handleCreate = () => {
    if (nameInput.trim()) setUserName(nameInput.trim());
    onCreateRoom();
    onClose();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Room link copied!', 'success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: 'rgba(15,17,23,0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">Collaboration</h2>
                  <p className="text-gray-400 text-sm">Create or join a room</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Your name</label>
                <input
                  type="text"
                  value={nameInput || userName}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                />
              </div>

              <button
                onClick={handleCreate}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-3 font-medium transition-colors"
              >
                <Plus size={18} />
                Create New Room
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-500 text-xs">or join existing</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="Room ID (e.g. a8d7f2)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                />
                <button
                  onClick={handleJoin}
                  disabled={!roomIdInput.trim()}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 transition-all text-sm font-medium"
                >
                  <LogIn size={16} />
                  Join
                </button>
              </div>

              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2.5 transition-all text-sm"
              >
                <Link size={15} />
                Copy Room Link
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoomLobby;
