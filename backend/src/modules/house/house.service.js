import prisma from '../../config/prisma.js';

// ─── Shared includes ───

const houseDetailInclude = {
  images: { orderBy: { order: 'asc' } },
  video: true,
  publicFacilities: true,
  agent: {
    select: { id: true, username: true, name: true, avatar: true, phoneNumber: true, email: true },
  },
  _count: { select: { views: true, favorites: true } },
};

const houseListInclude = {
  images: { take: 1, orderBy: { order: 'asc' } },
  agent: { select: { id: true, username: true, name: true, avatar: true } },
  _count: { select: { views: true, favorites: true } },
};

// ─── List Houses (paginated) ───

export const listHouses = async ({ page = 1, limit = 20, sortBy = 'newest' } = {}) => {
  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  let orderBy;
  switch (sortBy) {
    case 'price_asc':
      orderBy = { rentPerMonth: 'asc' };
      break;
    case 'price_desc':
      orderBy = { rentPerMonth: 'desc' };
      break;
    case 'most_popular':
      orderBy = { views: { _count: 'desc' } };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const where = { status: 'AVAILABLE' };

  const [houses, total] = await Promise.all([
    prisma.house.findMany({ where, include: houseListInclude, orderBy, skip, take: limit }),
    prisma.house.count({ where }),
  ]);

  return { houses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

// ─── Recommended Houses ───

export const getRecommended = async (userId, limit = 10) => {
  // Simple recommendation: houses in cities the user has viewed before, excluding already-viewed
  const viewedCities = await prisma.houseView.findMany({
    where: { userId },
    select: { house: { select: { city: true } } },
    distinct: ['houseId'],
    take: 50,
  });

  const cities = [...new Set(viewedCities.map((v) => v.house.city))];

  const where = {
    status: 'AVAILABLE',
    ...(cities.length > 0 ? { city: { in: cities } } : {}),
  };

  return prisma.house.findMany({
    where,
    include: houseListInclude,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

// ─── Nearby Houses ───

export const getNearby = async (lat, lng, radiusKm = 10, limit = 20) => {
  // Approximate bounding box (1 degree ≈ 111 km)
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return prisma.house.findMany({
    where: {
      status: 'AVAILABLE',
      latitude: { gte: lat - latDelta, lte: lat + latDelta },
      longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
    },
    include: houseListInclude,
    take: limit,
  });
};

// ─── Top Locations ───

export const getTopLocations = async (limit = 10) => {
  const locations = await prisma.house.groupBy({
    by: ['city'],
    where: { status: 'AVAILABLE' },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  return locations.map((l) => ({ city: l.city, count: l._count.id }));
};

// ─── Popular Houses ───

export const getPopular = async (limit = 20) => {
  return prisma.house.findMany({
    where: { status: 'AVAILABLE' },
    include: houseListInclude,
    orderBy: { views: { _count: 'desc' } },
    take: limit,
  });
};

// ─── Get House Detail ───

export const getHouseById = async (id) => {
  const house = await prisma.house.findUnique({
    where: { id },
    include: houseDetailInclude,
  });

  if (!house) {
    throw Object.assign(new Error('House not found'), { statusCode: 404 });
  }

  return house;
};

// ─── Create House (Agent) ───

export const createHouse = async (agentId, data) => {
  const { images, video, publicFacilities, ...houseData } = data;

  return prisma.house.create({
    data: {
      ...houseData,
      agentId,
      ...(images && { images: { create: images } }),
      ...(video && { video: { create: video } }),
      ...(publicFacilities && { publicFacilities: { create: publicFacilities } }),
    },
    include: houseDetailInclude,
  });
};

// ─── Update House (Agent) ───

export const updateHouse = async (agentId, houseId, data) => {
  const house = await prisma.house.findFirst({ where: { id: houseId, agentId } });
  if (!house) {
    throw Object.assign(new Error('House not found or unauthorized'), { statusCode: 404 });
  }

  const { images, video, publicFacilities, ...houseData } = data;

  // Build nested update operations
  const updateData = { ...houseData };

  if (images) {
    // Replace all images
    await prisma.houseImage.deleteMany({ where: { houseId } });
    updateData.images = { create: images };
  }

  if (video !== undefined) {
    await prisma.houseVideo.deleteMany({ where: { houseId } });
    if (video) {
      updateData.video = { create: video };
    }
  }

  if (publicFacilities) {
    updateData.publicFacilities = {
      upsert: {
        create: publicFacilities,
        update: publicFacilities,
      },
    };
  }

  return prisma.house.update({
    where: { id: houseId },
    data: updateData,
    include: houseDetailInclude,
  });
};

// ─── Delete House (Agent) ───

export const deleteHouse = async (agentId, houseId) => {
  const house = await prisma.house.findFirst({ where: { id: houseId, agentId } });
  if (!house) {
    throw Object.assign(new Error('House not found or unauthorized'), { statusCode: 404 });
  }

  await prisma.house.delete({ where: { id: houseId } });
  return { message: 'House deleted' };
};

// ─── Track View ───

export const trackView = async (userId, houseId) => {
  // Ensure house exists
  const house = await prisma.house.findUnique({ where: { id: houseId }, select: { id: true } });
  if (!house) {
    throw Object.assign(new Error('House not found'), { statusCode: 404 });
  }

  await prisma.houseView.create({
    data: { userId, houseId },
  });

  return { message: 'View tracked' };
};

// ─── Generate Share Link ───

export const getShareLink = async (houseId) => {
  const house = await prisma.house.findUnique({ where: { id: houseId }, select: { id: true, name: true } });
  if (!house) {
    throw Object.assign(new Error('House not found'), { statusCode: 404 });
  }

  const appUrl = process.env.APP_URL || 'https://housely.app';
  return {
    shareUrl: `${appUrl}/houses/${houseId}`,
    title: house.name,
  };
};
