import prisma from '../../config/prisma.js';

// ─── Shared includes ───

const reviewInclude = {
  user: { select: { id: true, username: true, name: true, avatar: true } },
  media: true,
};

// ─── Create Review ───

export const createReview = async (userId, data) => {
  const { bookingId, rating, comment, media } = data;

  // Validate booking exists, is completed, and belongs to user
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    select: { id: true, houseId: true, status: true },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  if (booking.status !== 'COMPLETED') {
    throw Object.assign(new Error('Can only review completed bookings'), { statusCode: 400 });
  }

  // Check if review already exists for this booking
  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  });

  if (existingReview) {
    throw Object.assign(new Error('Review already exists for this booking'), { statusCode: 409 });
  }

  const review = await prisma.review.create({
    data: {
      userId,
      houseId: booking.houseId,
      bookingId,
      rating,
      comment,
      ...(media && media.length > 0 && { media: { create: media } }),
    },
    include: reviewInclude,
  });

  return review;
};

// ─── Get Reviews for House ───

export const getHouseReviews = async (houseId, { sortBy = 'newest', page = 1, limit = 20 }) => {
  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  // Check house exists
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    select: { id: true },
  });

  if (!house) {
    throw Object.assign(new Error('House not found'), { statusCode: 404 });
  }

  let orderBy;
  switch (sortBy) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'highest':
      orderBy = { rating: 'desc' };
      break;
    case 'lowest':
      orderBy = { rating: 'asc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const where = { houseId };

  const [reviews, total, stats] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  // Calculate rating distribution
  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { houseId },
    _count: { rating: true },
  });

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach((r) => {
    distribution[r.rating] = r._count.rating;
  });

  return {
    reviews,
    summary: {
      averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
      totalReviews: stats._count.rating,
      distribution,
    },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get Review by ID ───

export const getReviewById = async (reviewId) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: reviewInclude,
  });

  if (!review) {
    throw Object.assign(new Error('Review not found'), { statusCode: 404 });
  }

  return review;
};

// ─── Update Review ───

export const updateReview = async (userId, reviewId, data) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
  });

  if (!review) {
    throw Object.assign(new Error('Review not found or unauthorized'), { statusCode: 404 });
  }

  const { rating, comment, media } = data;
  const updateData = {};

  if (rating !== undefined) updateData.rating = rating;
  if (comment !== undefined) updateData.comment = comment;

  // Handle media update
  if (media !== undefined) {
    await prisma.reviewMedia.deleteMany({ where: { reviewId } });
    if (media.length > 0) {
      updateData.media = { create: media };
    }
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
    include: reviewInclude,
  });

  return updatedReview;
};

// ─── Delete Review ───

export const deleteReview = async (userId, reviewId) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
  });

  if (!review) {
    throw Object.assign(new Error('Review not found or unauthorized'), { statusCode: 404 });
  }

  await prisma.review.delete({ where: { id: reviewId } });

  return { message: 'Review deleted successfully' };
};

// ─── Get User Reviews ───

export const getUserReviews = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      include: {
        ...reviewInclude,
        house: {
          select: { id: true, name: true, images: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { userId } }),
  ]);

  return {
    reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
