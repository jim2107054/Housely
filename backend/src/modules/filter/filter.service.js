import prisma from '../../config/prisma.js';

const houseListInclude = {
  images: { take: 1, orderBy: { order: 'asc' } },
  agent: { select: { id: true, username: true, name: true, avatar: true } },
  _count: { select: { views: true, favorites: true } },
};

export const filterHouses = async (filters) => {
  const {
    listingType,
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minSize,
    maxSize,
    buildYear,
    status,
    hasWifi,
    hasWater,
    city,
    area,
    q,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  // ─── Build WHERE clause ───
  const where = {};

  if (status) {
    where.status = status;
  } else {
    where.status = 'AVAILABLE'; // default to available
  }

  if (listingType) where.listingType = listingType;

  if (propertyType && propertyType.length > 0) {
    where.propertyType = { in: propertyType };
  }

  // Price filter (use rentPerMonth for RENT, salePrice for SALE)
  if (minPrice || maxPrice) {
    if (listingType === 'SALE') {
      where.salePrice = {};
      if (minPrice) where.salePrice.gte = minPrice;
      if (maxPrice) where.salePrice.lte = maxPrice;
    } else {
      where.rentPerMonth = {};
      if (minPrice) where.rentPerMonth.gte = minPrice;
      if (maxPrice) where.rentPerMonth.lte = maxPrice;
    }
  }

  if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms };
  if (bathrooms !== undefined) where.bathrooms = { gte: bathrooms };

  if (minSize || maxSize) {
    where.sizeInSqft = {};
    if (minSize) where.sizeInSqft.gte = minSize;
    if (maxSize) where.sizeInSqft.lte = maxSize;
  }

  if (buildYear) where.buildYear = { gte: buildYear };

  if (hasWifi !== undefined) where.hasWifi = hasWifi;
  if (hasWater !== undefined) where.hasWater = hasWater;

  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (area) where.area = { contains: area, mode: 'insensitive' };

  // Text search (name, description, address)
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { area: { contains: q, mode: 'insensitive' } },
    ];
  }

  // ─── Build ORDER BY ───
  let orderBy;
  switch (sortBy) {
    case 'price_asc':
      orderBy = listingType === 'SALE' ? { salePrice: 'asc' } : { rentPerMonth: 'asc' };
      break;
    case 'price_desc':
      orderBy = listingType === 'SALE' ? { salePrice: 'desc' } : { rentPerMonth: 'desc' };
      break;
    case 'most_popular':
      orderBy = { views: { _count: 'desc' } };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  // ─── Execute query ───
  const [houses, total] = await Promise.all([
    prisma.house.findMany({
      where,
      include: houseListInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.house.count({ where }),
  ]);

  return {
    houses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    appliedFilters: {
      listingType,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      city,
      area,
      sortBy,
    },
  };
};
