import prisma from '../../config/prisma.js';

// ─── Shared includes ───

const bookingDetailInclude = {
  house: {
    include: {
      images: { take: 1, orderBy: { order: 'asc' } },
      agent: { select: { id: true, username: true, name: true, avatar: true, phoneNumber: true, email: true } },
    },
  },
  user: { select: { id: true, username: true, name: true, avatar: true, email: true } },
  payments: { orderBy: { createdAt: 'desc' } },
};

const bookingListInclude = {
  house: {
    include: {
      images: { take: 1, orderBy: { order: 'asc' } },
    },
  },
};

// ─── Create Booking ───

export const createBooking = async (userId, data) => {
  const { houseId, checkIn, checkOut, notes } = data;

  // Validate house exists and is available
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    select: { id: true, agentId: true, rentPerMonth: true, salePrice: true, listingType: true, status: true },
  });

  if (!house) {
    throw Object.assign(new Error('House not found'), { statusCode: 404 });
  }

  if (house.status !== 'AVAILABLE') {
    throw Object.assign(new Error('House is not available for booking'), { statusCode: 400 });
  }

  // Check for conflicting bookings
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    throw Object.assign(new Error('Check-out date must be after check-in date'), { statusCode: 400 });
  }

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      houseId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        { checkIn: { lte: checkOutDate }, checkOut: { gte: checkInDate } },
      ],
    },
  });

  if (conflictingBooking) {
    throw Object.assign(new Error('House is already booked for the selected dates'), { statusCode: 409 });
  }

  // Calculate total amount based on listing type
  let totalAmount = 0;
  if (house.listingType === 'RENT' && house.rentPerMonth) {
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const months = days / 30;
    totalAmount = Math.ceil(house.rentPerMonth * months);
  } else if (house.listingType === 'SALE' && house.salePrice) {
    totalAmount = house.salePrice;
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      houseId,
      agentId: house.agentId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount,
      notes,
    },
    include: bookingDetailInclude,
  });

  return booking;
};

// ─── Get User Bookings ───

export const getUserBookings = async (userId, { status = 'all', page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = { userId };

  switch (status) {
    case 'upcoming':
      where.status = { in: ['PENDING', 'CONFIRMED'] };
      where.checkIn = { gte: now };
      break;
    case 'completed':
      where.status = 'COMPLETED';
      break;
    case 'cancelled':
      where.status = 'CANCELLED';
      break;
    // 'all' - no additional filters
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingListInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get Booking by ID ───

export const getBookingById = async (userId, bookingId, isAgent = false) => {
  const where = { id: bookingId };
  
  // Users can only see their own bookings, agents can see bookings for their houses
  if (!isAgent) {
    where.userId = userId;
  } else {
    where.agentId = userId;
  }

  const booking = await prisma.booking.findFirst({
    where,
    include: bookingDetailInclude,
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  return booking;
};

// ─── Cancel Booking ───

export const cancelBooking = async (userId, bookingId) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  if (booking.status === 'CANCELLED') {
    throw Object.assign(new Error('Booking is already cancelled'), { statusCode: 400 });
  }

  if (booking.status === 'COMPLETED') {
    throw Object.assign(new Error('Cannot cancel a completed booking'), { statusCode: 400 });
  }

  // Check cancellation policy (e.g., 24 hours before check-in)
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

  if (hoursUntilCheckIn < 24) {
    throw Object.assign(new Error('Cannot cancel booking less than 24 hours before check-in'), { statusCode: 400 });
  }

  const cancelledBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
    include: bookingDetailInclude,
  });

  return cancelledBooking;
};

// ─── Get Agent Bookings ───

export const getAgentBookings = async (agentId, { status = 'all', page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = { agentId };

  switch (status) {
    case 'upcoming':
      where.status = { in: ['PENDING', 'CONFIRMED'] };
      where.checkIn = { gte: now };
      break;
    case 'completed':
      where.status = 'COMPLETED';
      break;
    case 'cancelled':
      where.status = 'CANCELLED';
      break;
    case 'pending':
      where.status = 'PENDING';
      break;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        ...bookingListInclude,
        user: { select: { id: true, username: true, name: true, avatar: true, email: true, phoneNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Update Booking Status (Agent) ───

export const updateBookingStatus = async (agentId, bookingId, status) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, agentId },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw Object.assign(new Error(`Cannot transition from ${booking.status} to ${status}`), { statusCode: 400 });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: bookingDetailInclude,
  });

  return updatedBooking;
};
