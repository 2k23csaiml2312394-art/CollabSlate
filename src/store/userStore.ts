import { create } from 'zustand';
import { generateId, generateColor } from '../utils/idGenerator';

interface UserStore {
  userId: string;
  userName: string;
  userColor: string;
  setUserName: (name: string) => void;
}

const storedName = localStorage.getItem('wb_username');
const storedColor = localStorage.getItem('wb_usercolor');

export const useUserStore = create<UserStore>((set) => ({
  userId: generateId(),
  userName: storedName || 'Anonymous',
  userColor: storedColor || generateColor(),

  setUserName: (name) => {
    localStorage.setItem('wb_username', name);
    set({ userName: name });
  },
}));
