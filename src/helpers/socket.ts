import { Server, Socket } from 'socket.io';
import colors from 'colors';
import { logger } from '../shared/logger';

declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}

export let onlineUsers = new Set();

const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(colors.blue(`🔌🟢 A user connected: ${socket.id}`));

    // Handle user connecting and joining their room
    socket.on('user-connected', ({ userId, fcmToken }: { userId: string; fcmToken: string }) => {
      socket.userId = userId;
      socket.join(userId); // Join the room for the specific user
      onlineUsers.add(userId); // Add user to the online users set
      logger.info(colors.green(`User ${userId} joined their notification room`));
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
      if (socket.userId) onlineUsers.delete(socket.userId); // Remove user from the online users map
      logger.info(colors.red('🔌🔴 A user disconnected'));
    });

  });
};

export const socketHelper = { socket };
