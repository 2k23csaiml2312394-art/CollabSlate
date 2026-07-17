import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import { useUserStore } from '../store/userStore';
import { useSocket } from './useSocket';
import { generateRoomId } from '../utils/idGenerator';

export function useRoom() {
  const navigate = useNavigate();
  const { roomId, isConnected, isConnecting } = useRoomStore();
  const { userId, userName, userColor } = useUserStore();
  const { joinRoom, leaveRoom } = useSocket();

  const createRoom = useCallback(() => {
    const id = generateRoomId();
    joinRoom(id, { id: userId, name: userName, color: userColor });
    navigate(`/room/${id}`);
  }, [joinRoom, navigate, userId, userName, userColor]);

  const joinExistingRoom = useCallback((id: string) => {
    joinRoom(id, { id: userId, name: userName, color: userColor });
  }, [joinRoom, userId, userName, userColor]);

  const leave = useCallback(() => {
    if (roomId) leaveRoom(roomId);
    navigate('/');
  }, [leaveRoom, navigate, roomId]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
  }, []);

  return { createRoom, joinRoom: joinExistingRoom, leave, copyLink, roomId, isConnected, isConnecting };
}
