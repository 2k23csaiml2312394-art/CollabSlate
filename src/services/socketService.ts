import { io, Socket } from 'socket.io-client';
import type { CanvasElement, RemoteCursor, RoomUser } from '../types';

export type ServerToClientEvents = {
  'canvas:state': (data: { elements: CanvasElement[] }) => void;
  'element:add': (element: CanvasElement) => void;
  'element:update': (data: { id: string; updates: Partial<CanvasElement> }) => void;
  'element:remove': (id: string) => void;
  'cursor:move': (cursor: RemoteCursor) => void;
  'cursor:leave': (userId: string) => void;
  'user:join': (data: { user: RoomUser; users: RoomUser[] }) => void;
  'user:leave': (data: { userId: string; users: RoomUser[] }) => void;
  'room:joined': (data: { roomId: string; elements: CanvasElement[]; users: RoomUser[] }) => void;
};

export type ClientToServerEvents = {
  'room:join': (data: { roomId: string; user: RoomUser }) => void;
  'room:leave': (roomId: string) => void;
  'element:add': (data: { roomId: string; element: CanvasElement }) => void;
  'element:update': (data: { roomId: string; id: string; updates: Partial<CanvasElement> }) => void;
  'element:remove': (data: { roomId: string; id: string }) => void;
  'cursor:move': (data: { roomId: string; cursor: RemoteCursor }) => void;
  'canvas:sync': (data: { roomId: string; elements: CanvasElement[] }) => void;
};

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

  connect(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) return this.socket;

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  get(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
