import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { useCanvasStore } from '../store/canvasStore';
import { useRoomStore } from '../store/roomStore';
import { useUserStore } from '../store/userStore';
import { useToastStore } from '../store/toastStore';
import type { RoomUser } from '../types';

export function useSocket() {
  const mounted = useRef(true);
  const { setElements, addElement, updateElement, removeElement } = useCanvasStore();
  const { setUsers, setCursor, removeCursor, setConnected, setConnecting, setRoomId } = useRoomStore();
  const { addToast } = useToastStore();

  const joinRoom = useCallback((roomId: string, user: RoomUser) => {
    const socket = socketService.connect();
    setConnecting(true);

    socket.on('connect', () => {
      if (!mounted.current) return;
      setConnected(true);
      socket.emit('room:join', { roomId, user });
    });

    socket.on('disconnect', () => {
      if (!mounted.current) return;
      setConnected(false);
      addToast('Disconnected from server. Reconnecting...', 'error');
    });

    socket.on('connect_error', () => {
      if (!mounted.current) return;
      setConnected(false);
      setConnecting(false);
    });

    socket.on('room:joined', ({ roomId: id, elements, users }) => {
      if (!mounted.current) return;
      setRoomId(id);
      setElements(elements);
      setUsers(users);
      setConnected(true);
    });

    socket.on('element:add', (element) => {
      if (!mounted.current) return;
      addElement(element);
    });

    socket.on('element:update', ({ id, updates }) => {
      if (!mounted.current) return;
      updateElement(id, updates);
    });

    socket.on('element:remove', (id) => {
      if (!mounted.current) return;
      removeElement(id);
    });

    socket.on('cursor:move', (cursor) => {
      if (!mounted.current) return;
      setCursor(cursor);
    });

    socket.on('cursor:leave', (userId) => {
      if (!mounted.current) return;
      removeCursor(userId);
    });

    socket.on('user:join', ({ user: u, users }) => {
      if (!mounted.current) return;
      setUsers(users);
      addToast(`${u.name} joined the room`, 'info');
    });

    socket.on('user:leave', ({ userId, users }) => {
      if (!mounted.current) return;
      setUsers(users);
      removeCursor(userId);
    });

    if (socket.connected) {
      setConnected(true);
      socket.emit('room:join', { roomId, user });
    }
  }, [setElements, addElement, updateElement, removeElement, setUsers, setCursor, removeCursor, setConnected, setConnecting, setRoomId, addToast]);

  const leaveRoom = useCallback((roomId: string) => {
    const socket = socketService.get();
    if (socket) {
      socket.emit('room:leave', roomId);
      socket.removeAllListeners();
    }
    socketService.disconnect();
    setConnected(false);
    setRoomId(null);
    setUsers([]);
  }, [setConnected, setRoomId, setUsers]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return { joinRoom, leaveRoom };
}
