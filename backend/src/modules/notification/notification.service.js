import prisma from '../../config/prisma.js';

// ─── Get Notifications ───

export const getNotifications = async (userId, { type, isRead, page = 1, limit = 20 }) => {
  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  const where = { userId };
  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get Single Notification ───

export const getNotificationById = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  }

  return notification;
};

// ─── Mark as Read ───

export const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
};

// ─── Mark All as Read ───

export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { message: 'All notifications marked as read' };
};

// ─── Get Unread Count ───

export const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return { unreadCount: count };
};

// ─── Delete Notification ───

export const deleteNotification = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  }

  await prisma.notification.delete({ where: { id: notificationId } });

  return { message: 'Notification deleted' };
};

// ─── Clear All Notifications ───

export const clearAllNotifications = async (userId) => {
  await prisma.notification.deleteMany({ where: { userId } });

  return { message: 'All notifications cleared' };
};

// ─── Create Notification (internal use) ───

export const createNotification = async (userId, { type, title, message, data = null }) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data,
    },
  });

  return notification;
};

// ─── Register Device Token ───

export const registerDeviceToken = async (userId, { token, platform = 'android' }) => {
  // Upsert device token
  const deviceToken = await prisma.deviceToken.upsert({
    where: { token },
    create: { userId, token, platform },
    update: { userId, platform },
  });

  return deviceToken;
};

// ─── Remove Device Token ───

export const removeDeviceToken = async (userId, token) => {
  const deviceToken = await prisma.deviceToken.findFirst({
    where: { token, userId },
  });

  if (!deviceToken) {
    throw Object.assign(new Error('Device token not found'), { statusCode: 404 });
  }

  await prisma.deviceToken.delete({ where: { id: deviceToken.id } });

  return { message: 'Device token removed' };
};

// ─── Get Device Tokens for User (internal use) ───

export const getDeviceTokens = async (userId) => {
  return prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true, platform: true },
  });
};

// ─── Send Push Notification (placeholder for FCM integration) ───

export const sendPushNotification = async (userId, { title, body, data = {} }) => {
  // Get user's device tokens
  const tokens = await getDeviceTokens(userId);
  
  if (tokens.length === 0) {
    return { sent: false, reason: 'No device tokens registered' };
  }

  // TODO: Integrate with Firebase Cloud Messaging (FCM)
  // const admin = require('firebase-admin');
  // const message = {
  //   notification: { title, body },
  //   data,
  //   tokens: tokens.map(t => t.token),
  // };
  // await admin.messaging().sendMulticast(message);

  console.log('[FCM] Would send push notification:', { userId, title, body, tokens: tokens.length });

  return { sent: true, tokenCount: tokens.length };
};

// ─── Notify User (creates DB notification + optional push) ───

export const notifyUser = async (userId, { type, title, message, data = null, sendPush = true }) => {
  // Create in-app notification
  const notification = await createNotification(userId, { type, title, message, data });

  // Check user's notification settings
  const settings = await prisma.notificationSettings.findUnique({
    where: { userId },
  });

  // Send push if enabled
  if (sendPush && settings?.pushEnabled !== false) {
    await sendPushNotification(userId, { title, body: message, data: { notificationId: notification.id, ...data } });
  }

  return notification;
};
