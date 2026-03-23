import prisma from '../../config/prisma.js';

// ─── Shared includes ───

const videoInclude = {
  uploader: {
    select: { id: true, username: true, name: true, avatar: true },
  },
  tags: {
    include: { tag: true },
  },
  _count: {
    select: { views: true },
  },
};

// ─── Create Video ───

export const createVideo = async (uploaderId, data, cloudinaryResult) => {
  const { tags, houseId, ...videoData } = data;

  const video = await prisma.video.create({
    data: {
      ...videoData,
      uploaderId,
      ...(houseId ? { houseId } : {}),
      cloudinaryId: cloudinaryResult.public_id,
      url: cloudinaryResult.secure_url,
      thumbnailUrl: cloudinaryResult.thumbnailUrl || null,
      duration: cloudinaryResult.duration || null,
      width: cloudinaryResult.width || null,
      height: cloudinaryResult.height || null,
      sizeInBytes: cloudinaryResult.bytes ? BigInt(cloudinaryResult.bytes) : null,
      status: 'PUBLISHED',
    },
    include: videoInclude,
  });

  if (tags && tags.length > 0) {
    // Upsert each tag by name
    await Promise.all(
      tags.map((name) =>
        prisma.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        }),
      ),
    );

    // Fetch tag ids
    const tagRecords = await prisma.tag.findMany({
      where: { name: { in: tags } },
      select: { id: true },
    });

    // Create VideoTag join records
    await prisma.videoTag.createMany({
      data: tagRecords.map((t) => ({ videoId: video.id, tagId: t.id })),
      skipDuplicates: true,
    });

    // Re-fetch with tags
    return prisma.video.findUnique({
      where: { id: video.id },
      include: videoInclude,
    });
  }

  return video;
};

// ─── List Videos ───

export const listVideos = async ({
  page = 1,
  limit = 20,
  status,
  uploaderId,
  houseId,
  tag,
  search,
  isAdmin = false,
} = {}) => {
  const skip = (page - 1) * limit;

  const where = {};

  // Default status filter: PUBLISHED (unless admin with no explicit filter)
  if (status) {
    where.status = status;
  } else if (!isAdmin) {
    where.status = 'PUBLISHED';
  }

  if (uploaderId) where.uploaderId = uploaderId;
  if (houseId) where.houseId = houseId;

  if (tag) {
    where.tags = {
      some: {
        tag: { name: tag },
      },
    };
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      include: videoInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.video.count({ where }),
  ]);

  return { videos, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ─── Get Video By ID ───

export const getVideoById = async (id) => {
  const video = await prisma.video.findUnique({
    where: { id },
    include: videoInclude,
  });

  if (!video) {
    throw Object.assign(new Error('Video not found'), { statusCode: 404 });
  }

  return video;
};

// ─── Update Video ───

export const updateVideo = async (id, requesterId, requesterRole, data) => {
  const video = await prisma.video.findUnique({ where: { id } });

  if (!video) {
    throw Object.assign(new Error('Video not found'), { statusCode: 404 });
  }

  if (video.uploaderId !== requesterId && requesterRole !== 'ADMIN') {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  const { tags, ...updateData } = data;

  if (tags !== undefined) {
    // Delete existing VideoTag entries
    await prisma.videoTag.deleteMany({ where: { videoId: id } });

    if (tags.length > 0) {
      // Upsert tags
      await Promise.all(
        tags.map((name) =>
          prisma.tag.upsert({
            where: { name },
            create: { name },
            update: {},
          }),
        ),
      );

      // Fetch tag ids
      const tagRecords = await prisma.tag.findMany({
        where: { name: { in: tags } },
        select: { id: true },
      });

      // Create new VideoTag records
      await prisma.videoTag.createMany({
        data: tagRecords.map((t) => ({ videoId: id, tagId: t.id })),
        skipDuplicates: true,
      });
    }
  }

  return prisma.video.update({
    where: { id },
    data: updateData,
    include: videoInclude,
  });
};

// ─── Delete Video ───

export const deleteVideo = async (id, requesterId, requesterRole) => {
  const video = await prisma.video.findUnique({ where: { id } });

  if (!video) {
    throw Object.assign(new Error('Video not found'), { statusCode: 404 });
  }

  if (video.uploaderId !== requesterId && requesterRole !== 'ADMIN') {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  const cloudinaryId = video.cloudinaryId;

  await prisma.video.delete({ where: { id } });

  return { cloudinaryId };
};

// ─── Track Video View ───

export const trackVideoView = async (userId, videoId, progress = 0) => {
  await prisma.$transaction([
    prisma.videoView.upsert({
      where: { userId_videoId: { userId, videoId } },
      create: { userId, videoId, progress, watchedAt: new Date() },
      update: { progress, watchedAt: new Date() },
    }),
    prisma.video.update({
      where: { id: videoId },
      data: { viewCount: { increment: 1 } },
    }),
  ]);
};

// ─── Get Watch History ───

export const getWatchHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    prisma.videoView.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      include: {
        video: {
          include: {
            uploader: {
              select: { id: true, username: true, name: true, avatar: true },
            },
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.videoView.count({ where: { userId } }),
  ]);

  return { history, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ─── Get Admin User List ───

export const getAdminUserList = async (page = 1, limit = 20, role) => {
  const skip = (page - 1) * limit;
  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};
