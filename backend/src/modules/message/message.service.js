import prisma from '../../config/prisma.js';

// ─── Shared includes ───

const conversationInclude = {
  user: { select: { id: true, username: true, name: true, avatar: true } },
  agent: { select: { id: true, username: true, name: true, avatar: true } },
  house: { select: { id: true, name: true, images: { take: 1, orderBy: { order: 'asc' } } } },
  messages: {
    take: 1,
    orderBy: { createdAt: 'desc' },
    select: { id: true, content: true, type: true, createdAt: true, senderId: true, isRead: true },
  },
};

const messageInclude = {
  sender: { select: { id: true, username: true, name: true, avatar: true } },
};

// ─── Create or Get Conversation ───

export const getOrCreateConversation = async (userId, agentId, houseId = null) => {
  // Verify agent exists and is actually an agent
  const agent = await prisma.user.findFirst({
    where: { id: agentId, role: { in: ['AGENT', 'ADMIN'] } },
  });

  if (!agent) {
    throw Object.assign(new Error('Agent not found'), { statusCode: 404 });
  }

  // Check if conversation already exists
  let conversation = await prisma.conversation.findFirst({
    where: { userId, agentId },
    include: conversationInclude,
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId,
        agentId,
        houseId,
      },
      include: conversationInclude,
    });
  }

  return conversation;
};

// ─── Get User Conversations ───

export const getUserConversations = async (userId, role, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const where = role === 'USER' ? { userId } : { agentId: userId };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        ...conversationInclude,
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.conversation.count({ where }),
  ]);

  // Transform to include unread count
  const conversationsWithUnread = conversations.map((conv) => ({
    ...conv,
    unreadCount: conv._count?.messages || 0,
    _count: undefined,
  }));

  return {
    conversations: conversationsWithUnread,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get Conversation by ID ───

export const getConversationById = async (userId, conversationId) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userId }, { agentId: userId }],
    },
    include: conversationInclude,
  });

  if (!conversation) {
    throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
  }

  return conversation;
};

// ─── Get Messages in Conversation ───

export const getMessages = async (userId, conversationId, { page = 1, limit = 50, before }) => {
  // Verify user is part of conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userId }, { agentId: userId }],
    },
  });

  if (!conversation) {
    throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
  }

  const skip = (page - 1) * limit;
  const where = { conversationId };

  if (before) {
    where.createdAt = { lt: new Date(before) };
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: messageInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  // Mark messages from other user as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Send Message ───

export const sendMessage = async (userId, conversationId, { content, type = 'text' }) => {
  // Verify user is part of conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userId }, { agentId: userId }],
    },
  });

  if (!conversation) {
    throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        type,
      },
      include: messageInclude,
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
};

// ─── Mark Messages as Read ───

export const markAsRead = async (userId, conversationId) => {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  return { message: 'Messages marked as read' };
};

// ─── Get Unread Count ───

export const getUnreadCount = async (userId) => {
  // Get all conversations for this user
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userId }, { agentId: userId }] },
    select: { id: true },
  });

  const conversationIds = conversations.map((c) => c.id);

  const count = await prisma.message.count({
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: userId },
      isRead: false,
    },
  });

  return { unreadCount: count };
};

// ─── Delete Conversation ───

export const deleteConversation = async (userId, conversationId) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userId }, { agentId: userId }],
    },
  });

  if (!conversation) {
    throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
  }

  await prisma.conversation.delete({ where: { id: conversationId } });

  return { message: 'Conversation deleted' };
};
