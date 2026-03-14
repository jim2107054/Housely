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

export const listHouses = async ({ page = 1, limit = 20, sortBy = 'newest', search = '' } = {}) => {
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

  const where = { 
    status: 'AVAILABLE',
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    })
  };

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

  // Sync house-level flags with publicFacilities if provided
  if (publicFacilities) {
    if (publicFacilities.wifi !== undefined) houseData.hasWifi = publicFacilities.wifi;
    if (publicFacilities.water !== undefined) houseData.hasWater = publicFacilities.water;
  }

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

  // Sync house-level flags with publicFacilities if provided
  if (publicFacilities) {
    if (publicFacilities.wifi !== undefined) updateData.hasWifi = publicFacilities.wifi;
    if (publicFacilities.water !== undefined) updateData.hasWater = publicFacilities.water;
  }

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

// ─── Get User Favorites ───

export const getFavorites = async (userId) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      house: {
        include: houseListInclude,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => f.house);
};

// ─── Toggle Favorite ───

export const toggleFavorite = async (userId, houseId) => {
  const house = await prisma.house.findUnique({ where: { id: houseId } });
  if (!house) {
    throw Object.assign(new Error('House not found'), { statusCode: 404 });
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_houseId: { userId, houseId },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: {
        userId_houseId: { userId, houseId },
      },
    });
    return { isFavorite: false, message: 'Removed from favorites' };
  } else {
    await prisma.favorite.create({
      data: { userId, houseId },
    });
    return { isFavorite: true, message: 'Added to favorites' };
  }
};

export const getMyHouses = async (agentId) => {
  return prisma.house.findMany({
    where: { agentId },
    include: houseListInclude,
    orderBy: { createdAt: 'desc' },
  });
};

export const getAgentDashboard = async (agentId) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [housesCount, bookings, reviews] = await Promise.all([
    prisma.house.count({ where: { agentId } }),
    prisma.booking.findMany({
      where: { agentId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        house: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { house: { agentId } },
      select: { rating: true },
    }),
  ]);

  const totalEarnings = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const thisMonthEarnings = bookings
    .filter((b) => b.status === 'COMPLETED' && new Date(b.createdAt) >= firstDayOfMonth)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const lastMonthEarnings = bookings
    .filter((b) => b.status === 'COMPLETED' && new Date(b.createdAt) >= firstDayOfLastMonth && new Date(b.createdAt) < firstDayOfThisMonth)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingPayouts = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const transactions = bookings.map(b => ({
    id: b.id,
    description: `Booking for ${b.house.name}`,
    amount: b.totalAmount,
    status: b.status,
    createdAt: b.createdAt
  }));

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    stats: {
      housesCount,
      bookingsCount: bookings.length,
      reviewsCount: reviews.length,
      avgRating,
      totalEarnings,
      thisMonthEarnings,
      lastMonthEarnings,
      pendingPayouts,
    },
    recentBookings: bookings.slice(0, 5),
    transactions: transactions.slice(0, 20),
  };
};

