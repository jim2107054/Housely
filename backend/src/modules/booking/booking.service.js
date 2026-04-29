import prisma from '../../config/prisma.js';
import { notifyUser } from '../notification/notification.service.js';

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

  // Rental bookings are month-based: users can only book in full month intervals.
  if (house.listingType === 'RENT') {
    const checkInUtc = new Date(Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate()));
    const checkOutUtc = new Date(Date.UTC(checkOutDate.getUTCFullYear(), checkOutDate.getUTCMonth(), checkOutDate.getUTCDate()));

    const isFirstDayCheckIn = checkInUtc.getUTCDate() === 1;
    const isFirstDayCheckOut = checkOutUtc.getUTCDate() === 1;
    if (!isFirstDayCheckIn || !isFirstDayCheckOut) {
      throw Object.assign(
        new Error('For monthly rentals, check-in and check-out must be the 1st day of a month.'),
        { statusCode: 400 }
      );
    }

    const monthDiff =
      (checkOutUtc.getUTCFullYear() - checkInUtc.getUTCFullYear()) * 12 +
      (checkOutUtc.getUTCMonth() - checkInUtc.getUTCMonth());

    if (monthDiff < 1) {
      throw Object.assign(new Error('Rental duration must be at least 1 full month.'), { statusCode: 400 });
    }
  }

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      houseId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        {
          AND: [
            { checkIn: { lt: checkOutDate } },
            { checkOut: { gt: checkInDate } },
          ],
        },
      ],
    },
  });

  if (conflictingBooking) {
    throw Object.assign(new Error('House is already booked for the selected dates'), { statusCode: 409 });
  }

  // Calculate total amount based on listing type
  let totalAmount = 0;
  if (house.listingType === 'RENT' && house.rentPerMonth) {
    const months =
      (checkOutDate.getUTCFullYear() - checkInDate.getUTCFullYear()) * 12 +
      (checkOutDate.getUTCMonth() - checkInDate.getUTCMonth());
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

  // Notify the agent about the new booking
  try {
    await notifyUser(house.agentId, {
      type: 'BOOKING_CONFIRMED',
      title: 'New Booking Request',
      message: `You have a new booking request for your property.`,
      data: { bookingId: booking.id, houseId },
    });
  } catch (err) {
    console.error('Failed to send booking notification:', err.message);
  }

  // Notify the user about their booking
  try {
    await notifyUser(userId, {
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Submitted',
      message: `Your booking request has been submitted successfully. Total: ৳${totalAmount.toLocaleString()}.`,
      data: { bookingId: booking.id, houseId },
    });
  } catch (err) {
    console.error('Failed to send booking notification:', err.message);
  }

  return booking;
};

// ─── Get User Bookings ───

export const getUserBookings = async (userId, { status = 'all', page = 1, limit = 20 }) => {
  page = Number(page);
  limit = Number(limit);
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

  // 24-hour cancellation policy only applies to CONFIRMED bookings.
  // PENDING (unpaid) bookings can always be cancelled freely.
  if (booking.status === 'CONFIRMED') {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      throw Object.assign(new Error('Cannot cancel a confirmed booking less than 24 hours before check-in'), { statusCode: 400 });
    }
  }

  const cancelledBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
    include: bookingDetailInclude,
  });

  // Notify the agent about cancellation
  try {
    await notifyUser(cancelledBooking.agentId, {
      type: 'BOOKING_CANCELLED',
      title: 'Booking Cancelled',
      message: `A booking for your property has been cancelled by the tenant.`,
      data: { bookingId },
    });
  } catch (err) {
    console.error('Failed to send cancellation notification:', err.message);
  }

  return cancelledBooking;
};

// ─── Get Agent Bookings ───

export const getAgentBookings = async (agentId, { status = 'all', page = 1, limit = 20 }) => {
  page = Number(page);
  limit = Number(limit);
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

  // Notify the user about status change
  const statusMessages = {
    CONFIRMED: 'Your booking has been confirmed by the property agent!',
    COMPLETED: 'Your booking has been marked as completed. Please leave a review!',
    CANCELLED: 'Your booking has been cancelled by the property agent.',
  };

  const notifType = status === 'CANCELLED' ? 'BOOKING_CANCELLED' : 'BOOKING_CONFIRMED';

  try {
    await notifyUser(updatedBooking.userId, {
      type: notifType,
      title: `Booking ${status.charAt(0) + status.slice(1).toLowerCase()}`,
      message: statusMessages[status] || `Your booking status has been updated to ${status}.`,
      data: { bookingId },
    });
  } catch (err) {
    console.error('Failed to send status update notification:', err.message);
  }

  return updatedBooking;
};
