const Room = require('../models/Room');

const ROOM_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;     // Check every 5 minutes

const socketService = (io) => {
  const rooms = {}; // { roomId: { socketId: userData } } — in-memory presence map

  // ── Background cleanup job ─────────────────────────────────────────────────
  // Even though MongoDB TTL handles DB deletion, we also need to:
  // 1. Kick all users from the socket room
  // 2. Emit 'room-expired' so frontend can react immediately
  const runCleanup = async () => {
    try {
      const now = new Date();
      const expiredRooms = await Room.find({ expiresAt: { $lte: now } });

      for (const room of expiredRooms) {
        const roomId = room._id.toString();

        // Notify everyone currently in the room
        io.to(roomId).emit('room-expired', {
          roomId,
          message: `"${room.name}" has been automatically closed after 24 hours.`,
        });

        // Force-disconnect from socket room
        const socketsInRoom = await io.in(roomId).fetchSockets();
        for (const s of socketsInRoom) {
          s.leave(roomId);
        }

        // Clean up in-memory presence
        if (rooms[roomId]) delete rooms[roomId];

        // Delete from DB
        await Room.findByIdAndDelete(roomId);
        console.log(`🕐 Room "${room.name}" (${roomId}) expired and was removed.`);
      }

      // Broadcast updated room counts to everyone
      if (expiredRooms.length > 0) {
        const counts = {};
        Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
        io.emit('room-counts', counts);
        // Also tell all clients to refresh their room list
        io.emit('rooms-updated');
      }
    } catch (err) {
      console.error('Room cleanup error:', err.message);
    }
  };

  // Run immediately on startup, then every 5 minutes
  runCleanup();
  setInterval(runCleanup, CLEANUP_INTERVAL_MS);

  // ── Socket event handlers ──────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log('⚡ User connected:', socket.id);

    socket.on('get-room-counts', () => {
      const counts = {};
      Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
      socket.emit('room-counts', counts);
    });

    socket.on('join-room', ({ roomId, user }) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = {};
      rooms[roomId][socket.id] = { socketId: socket.id, ...user };

      // Broadcast updated counts & user list
      const counts = {};
      Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
      io.emit('room-counts', counts);

      const roomUsers = Object.values(rooms[roomId]);
      io.to(roomId).emit('user-joined', { socketId: socket.id, ...user, roomUsers });
      console.log(`👤 ${user.name} joined room: ${roomId}`);
    });

    socket.on('leave-room', ({ roomId, user }) => {
      socket.leave(roomId);
      if (rooms[roomId] && rooms[roomId][socket.id]) {
        const userData = rooms[roomId][socket.id];
        delete rooms[roomId][socket.id];

        const counts = {};
        Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
        io.emit('room-counts', counts);

        const roomUsers = Object.values(rooms[roomId] || {});
        io.to(roomId).emit('user-left', { name: userData.name, roomUsers });
      }
    });

    socket.on('send-message', ({ roomId, message, user, msgId }) => {
      io.to(roomId).emit('new-message', { user, message, timestamp: new Date(), msgId: msgId || Date.now().toString() });
    });

    // ── Typing indicators ─────────────────────────────────────────────────
    socket.on('typing-start', ({ roomId, user }) => {
      socket.to(roomId).emit('user-typing', { name: user.name, socketId: socket.id });
    });
    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('user-stopped-typing', { socketId: socket.id });
    });

    // ── Message reactions ─────────────────────────────────────────────────
    socket.on('reaction-add', ({ roomId, msgId, emoji, userName }) => {
      io.to(roomId).emit('reaction-update', { msgId, emoji, userName });
    });

    // ── User status change ────────────────────────────────────────────────
    socket.on('status-change', ({ roomId, status, user }) => {
      if (rooms[roomId] && rooms[roomId][socket.id]) {
        rooms[roomId][socket.id].status = status;
      }
      io.to(roomId).emit('user-status-changed', { socketId: socket.id, name: user.name, status });
    });

    socket.on('disconnect', () => {
      Object.keys(rooms).forEach(roomId => {
        if (rooms[roomId][socket.id]) {
          const userData = rooms[roomId][socket.id];
          delete rooms[roomId][socket.id];

          const counts = {};
          Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
          io.emit('room-counts', counts);

          const roomUsers = Object.values(rooms[roomId]);
          io.to(roomId).emit('user-left', { name: userData.name, roomUsers });
        }
      });
      console.log('🔌 User disconnected');
    });
  });
};

module.exports = socketService;
