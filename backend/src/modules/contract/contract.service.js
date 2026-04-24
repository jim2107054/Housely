import prisma from '../../config/prisma.js';

// ─── Generate contract content from a confirmed booking ───

const STANDARD_TERMS = [
  'The renter agrees to pay the full amount as specified in this agreement before or on the check-in date.',
  'The property shall be used for residential purposes only and not for any illegal activity.',
  'The renter is responsible for maintaining the property in good condition during the tenancy period.',
  'Any damage to the property beyond normal wear and tear shall be repaired at the renter\'s expense.',
  'The owner guarantees peaceful possession of the property for the duration of the agreement.',
  'Either party may terminate this agreement upon material breach by the other party, subject to applicable law.',
  'Disputes arising from this agreement shall be resolved through mutual negotiation, failing which by arbitration under applicable Bangladeshi law.',
  'This agreement is governed by the laws of Bangladesh.',
];

const generateContent = (booking, renter, owner, house) => {
  const year = new Date(booking.createdAt).getFullYear();
  const shortId = booking.id.slice(-6).toUpperCase();

  return {
    contractNumber: `HOU-${year}-${shortId}`,
    generatedAt: new Date().toISOString(),
    parties: {
      renter: {
        id: renter.id,
        name: renter.name || renter.username,
        email: renter.email,
        phone: renter.phoneNumber || null,
      },
      owner: {
        id: owner.id,
        name: owner.name || owner.username,
        email: owner.email,
        phone: owner.phoneNumber || null,
      },
    },
    property: {
      id: house.id,
      name: house.name,
      address: house.address,
      city: house.city,
      listingType: house.listingType,
      rentPerMonth: house.rentPerMonth,
      salePrice: house.salePrice,
    },
    booking: {
      id: booking.id,
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      totalAmount: booking.totalAmount,
      currency: 'BDT',
      notes: booking.notes || null,
    },
    terms: STANDARD_TERMS,
    legalNotice:
      'This digital agreement constitutes a legally binding contract between the parties named above. ' +
      'It is automatically generated upon booking confirmation and is immutable from this point forward. ' +
      'Both parties accept these terms by proceeding with the booking.',
  };
};

// ─── Create contract (called internally on booking confirmation) ───

export const createContract = async (bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { id: true, name: true, username: true, email: true, phoneNumber: true } },
      agent: { select: { id: true, name: true, username: true, email: true, phoneNumber: true } },
      house: { select: { id: true, name: true, address: true, city: true, listingType: true, rentPerMonth: true, salePrice: true } },
    },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  // Idempotent — don't create a second contract if one already exists
  const existing = await prisma.contract.findUnique({ where: { bookingId } });
  if (existing) return existing;

  const content = generateContent(booking, booking.user, booking.agent, booking.house);

  return prisma.contract.create({
    data: {
      bookingId,
      renterId: booking.userId,
      ownerId: booking.agentId,
      houseId: booking.houseId,
      content,
    },
  });
};

// ─── Get contract by booking ID (renter or owner only) ───

export const getContractByBooking = async (userId, bookingId) => {
  const contract = await prisma.contract.findUnique({
    where: { bookingId },
    include: {
      booking: {
        select: { id: true, checkIn: true, checkOut: true, totalAmount: true, status: true },
      },
    },
  });

  if (!contract) {
    throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
  }

  if (contract.renterId !== userId && contract.ownerId !== userId) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }

  return contract;
};

// ─── Admin: list all contracts ───

export const getAllContracts = async ({ page = 1, limit = 20 }) => {
  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: { select: { id: true, checkIn: true, checkOut: true, totalAmount: true } },
        renter: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.contract.count(),
  ]);

  return { contracts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
