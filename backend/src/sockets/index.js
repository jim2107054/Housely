import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { JWT_ACCESS_SECRET } from '../config/env.js';

// Store active socket connections by user ID
const activeConnections = new Map();

// ─── Authentication Middleware ───

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, name: true, avatar: true, role: true },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

// ─── Initialize Socket.IO ───

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket] User connected: ${userId}`);

    // Store connection
    activeConnections.set(userId, socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // ─── Message Events ───

    socket.on('conversation:join', async (conversationId) => {
      try {
        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [{ userId }, { agentId: userId }],
          },
        });

        if (conversation) {
          socket.join(`conversation:${conversationId}`);
          console.log(`[Socket] User ${userId} joined conversation ${conversationId}`);
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`[Socket] User ${userId} left conversation ${conversationId}`);
    });

    socket.on('message:send', async ({ conversationId, content, type = 'text' }) => {
      try {
        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [{ userId }, { agentId: userId }],
          },
        });

        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        // Create message
        const [message] = await prisma.$transaction([
          prisma.message.create({
            data: {
              conversationId,
              senderId: userId,
              content,
              type,
            },
            include: {
              sender: { select: { id: true, username: true, name: true, avatar: true } },
            },
          }),
          prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          }),
        ]);

        // Emit to all users in conversation room
        io.to(`conversation:${conversationId}`).emit('message:received', message);

        // Emit to recipient's personal room (for notification)
        const recipientId = conversation.userId === userId ? conversation.agentId : conversation.userId;
        io.to(`user:${recipientId}`).emit('message:new', {
          conversationId,
          message,
        });
      } catch (error) {
        console.error('[Socket] Message send error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('message:read', async (conversationId) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            isRead: false,
          },
          data: { isRead: true },
        });

        // Notify sender that messages were read
        io.to(`conversation:${conversationId}`).emit('message:read_receipt', {
          conversationId,
          readBy: userId,
        });
      } catch (error) {
        console.error('[Socket] Message read error:', error);
      }
    });

    socket.on('typing:start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
        user: socket.user,
      });
    });

    socket.on('typing:stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    // ─── Call Events (WebRTC Signaling) ───

    socket.on('call:initiate', async ({ conversationId, callType }) => {
      try {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [{ userId }, { agentId: userId }],
          },
        });

        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        const recipientId = conversation.userId === userId ? conversation.agentId : conversation.userId;

        // Emit to recipient
        io.to(`user:${recipientId}`).emit('call:incoming', {
          conversationId,
          callType,
          caller: socket.user,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to initiate call' });
      }
    });

    socket.on('call:offer', ({ conversationId, offer }) => {
      socket.to(`conversation:${conversationId}`).emit('call:offer', {
        conversationId,
        offer,
        caller: socket.user,
      });
    });

    socket.on('call:answer', ({ conversationId, answer }) => {
      socket.to(`conversation:${conversationId}`).emit('call:answer', {
        conversationId,
        answer,
        responder: socket.user,
      });
    });

    socket.on('call:ice-candidate', ({ conversationId, candidate }) => {
      socket.to(`conversation:${conversationId}`).emit('call:ice-candidate', {
        conversationId,
        candidate,
      });
    });

    socket.on('call:end', ({ conversationId }) => {
      io.to(`conversation:${conversationId}`).emit('call:ended', {
        conversationId,
        endedBy: userId,
      });
    });

    socket.on('call:reject', ({ conversationId }) => {
      io.to(`conversation:${conversationId}`).emit('call:rejected', {
        conversationId,
        rejectedBy: userId,
      });
    });

    // ─── Presence ───

    socket.on('presence:online', () => {
      // Broadcast to relevant users (e.g., agents the user has conversations with)
      socket.broadcast.emit('presence:update', {
        userId,
        status: 'online',
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId}`);
      activeConnections.delete(userId);
      
      socket.broadcast.emit('presence:update', {
        userId,
        status: 'offline',
      });
    });
  });

  return io;
};

// ─── Helper to emit to specific user ───

export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// ─── Check if user is online ───

export const isUserOnline = (userId) => {
  return activeConnections.has(userId);
};

// ─── Get active connections count ───

export const getActiveConnectionsCount = () => {
  return activeConnections.size;
};
