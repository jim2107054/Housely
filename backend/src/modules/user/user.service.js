import prisma from '../../config/prisma.js';

// ─── Get Profile ───

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phoneNumber: true,
      dateOfBirth: true,
      avatar: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  return user;
};

// ─── Update Profile ───

export const updateProfile = async (userId, data) => {
  // Check uniqueness of email/username if provided
  if (data.email || data.username) {
    const conditions = [];
    if (data.email) conditions.push({ email: data.email });
    if (data.username) conditions.push({ username: data.username });

    const existing = await prisma.user.findFirst({
      where: {
        AND: [{ NOT: { id: userId } }, { OR: conditions }],
      },
    });

    if (existing) {
      const field = existing.email === data.email ? 'email' : 'username';
      throw Object.assign(new Error(`This ${field} is already taken`), { statusCode: 409 });
    }
  }

  // Parse date string to Date object
  if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phoneNumber: true,
      dateOfBirth: true,
      avatar: true,
      role: true,
      isVerified: true,
    },
  });
};

// ─── Upload Avatar ───

export const uploadAvatar = async (userId, avatarUrl) => {
  return prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: { id: true, avatar: true },
  });
};

// ─── Payment History ───

export const getPaymentHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: { userId } }),
  ]);

  return {
    payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Notification Settings ───

export const getNotificationSettings = async (userId) => {
  let settings = await prisma.notificationSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.notificationSettings.create({ data: { userId } });
  }

  return settings;
};

export const updateNotificationSettings = async (userId, data) => {
  return prisma.notificationSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
};

// ─── Recent Viewed Houses ───

export const getRecentViewed = async (userId, limit = 20) => {
  const views = await prisma.houseView.findMany({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    take: limit,
    distinct: ['houseId'],
    include: {
      house: {
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
        },
      },
    },
  });

  return views.map((v) => v.house);
};
