const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

// In-memory room state
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { elements: [], users: new Map() });
  }
  return rooms.get(roomId);
}

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', rooms: rooms.size }));

io.on('connection', (socket) => {
  let currentRoomId = null;

  socket.on('room:join', ({ roomId, user }) => {
    if (currentRoomId) {
      socket.leave(currentRoomId);
      const prevRoom = rooms.get(currentRoomId);
      if (prevRoom) {
        prevRoom.users.delete(socket.id);
        const users = Array.from(prevRoom.users.values());
        socket.to(currentRoomId).emit('user:leave', { userId: user.id, users });
      }
    }

    currentRoomId = roomId;
    socket.join(roomId);

    const room = getRoom(roomId);
    room.users.set(socket.id, user);

    const users = Array.from(room.users.values());

    socket.emit('room:joined', { roomId, elements: room.elements, users });
    socket.to(roomId).emit('user:join', { user, users });
  });

  socket.on('room:leave', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const user = room.users.get(socket.id);
    room.users.delete(socket.id);
    socket.leave(roomId);
    const users = Array.from(room.users.values());
    if (user) {
      socket.to(roomId).emit('user:leave', { userId: user.id, users });
      socket.to(roomId).emit('cursor:leave', user.id);
    }
    if (room.users.size === 0) rooms.delete(roomId);
    currentRoomId = null;
  });

  socket.on('element:add', ({ roomId, element }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    // Prevent duplicates
    if (!room.elements.find((el) => el.id === element.id)) {
      room.elements.push(element);
    }
    socket.to(roomId).emit('element:add', element);
  });

  socket.on('element:update', ({ roomId, id, updates }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const idx = room.elements.findIndex((el) => el.id === id);
    if (idx !== -1) room.elements[idx] = { ...room.elements[idx], ...updates };
    socket.to(roomId).emit('element:update', { id, updates });
  });

  socket.on('element:remove', ({ roomId, id }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.elements = room.elements.filter((el) => el.id !== id);
    socket.to(roomId).emit('element:remove', id);
  });

  socket.on('cursor:move', ({ roomId, cursor }) => {
    socket.to(roomId).emit('cursor:move', cursor);
  });

  socket.on('canvas:sync', ({ roomId, elements }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.elements = elements;
    socket.to(roomId).emit('canvas:state', { elements });
  });

  socket.on('disconnect', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const user = room.users.get(socket.id);
    room.users.delete(socket.id);
    const users = Array.from(room.users.values());
    if (user) {
      socket.to(currentRoomId).emit('user:leave', { userId: user.id, users });
      socket.to(currentRoomId).emit('cursor:leave', user.id);
    }
    if (room.users.size === 0) rooms.delete(currentRoomId);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SyncCanvas server running on port ${PORT}`);
});
