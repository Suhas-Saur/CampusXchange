import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

let io: Server;
const userSockets = new Map<string, string>(); // userId -> socketId

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded: any = jwt.verify(
        Array.isArray(token) ? token[0] : token,
        process.env.JWT_SECRET || 'campusconnect_secure_jwt_token_secret_2026'
      );
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error: Token invalid'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    if (userId) {
      userSockets.set(userId, socket.id);
      console.log(`User connected via socket: ${userId} (${socket.id})`);
    }

    socket.on('disconnect', () => {
      if (userId) {
        userSockets.delete(userId);
        console.log(`User disconnected from socket: ${userId}`);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const sendToUser = (userId: string, event: string, data: any) => {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

export const isUserOnline = (userId: string) => {
  return userSockets.has(userId);
};
