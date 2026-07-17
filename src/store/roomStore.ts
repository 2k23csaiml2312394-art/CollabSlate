import { create } from 'zustand';
import type { RoomUser, RemoteCursor } from '../types';

interface RoomStore {
  roomId: string | null;
  users: RoomUser[];
  cursors: Record<string, RemoteCursor>;
  isConnected: boolean;
  isConnecting: boolean;

  setRoomId: (id: string | null) => void;
  setUsers: (users: RoomUser[]) => void;
  addUser: (user: RoomUser) => void;
  removeUser: (userId: string) => void;
  setCursor: (cursor: RemoteCursor) => void;
  removeCursor: (userId: string) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  users: [],
  cursors: {},
  isConnected: false,
  isConnecting: false,

  setRoomId: (roomId) => set({ roomId }),
  setUsers: (users) => set({ users }),
  addUser: (user) =>
    set((s) => ({ users: s.users.find((u) => u.id === user.id) ? s.users : [...s.users, user] })),
  removeUser: (userId) =>
    set((s) => ({ users: s.users.filter((u) => u.id !== userId) })),
  setCursor: (cursor) =>
    set((s) => ({ cursors: { ...s.cursors, [cursor.userId]: cursor } })),
  removeCursor: (userId) =>
    set((s) => {
      const cursors = { ...s.cursors };
      delete cursors[userId];
      return { cursors };
    }),
  setConnected: (isConnected) => set({ isConnected, isConnecting: false }),
  setConnecting: (isConnecting) => set({ isConnecting }),
}));
