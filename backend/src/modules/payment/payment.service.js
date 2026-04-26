import prisma from '../../config/prisma.js';
import crypto from 'crypto';
import { notifyUser } from '../notification/notification.service.js';

/**
 * Initiate a payment via SSLCommerz (Mocked for now)
 */
export const initiatePayment = async (userId, { bookingId, amount, currency = 'BDT' }) => {
  // 1. Verify booking exists and belongs to user
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { house: { select: { name: true } } },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  if (booking.userId !== userId) {
    throw Object.assign(new Error('Not authorized to pay for this booking'), { statusCode: 403 });
  }

  // 2. Create a pending payment record
  const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  
  const payment = await prisma.payment.create({
    data: {
      userId,
      bookingId,
      amount,
      currency,
      transactionId,
      status: 'PENDING',
      method: 'SSLCommerz',
      description: `Payment for booking ${booking.house.name}`,
    },
  });

  // 3. Construct SSLCommerz redirection URL (Mocked)
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  console.log('[Payment Service] Using baseUrl:', baseUrl);
  
  const successUrl = `${baseUrl}/api/payments/callback?status=success&transactionId=${transactionId}`;
  const failUrl = `${baseUrl}/api/payments/callback?status=fail&transactionId=${transactionId}`;
  const cancelUrl = `${baseUrl}/api/payments/callback?status=cancel&transactionId=${transactionId}`;

  const gatewayUrl = `${baseUrl}/api/payments/mock-gateway?transactionId=${transactionId}&amount=${amount}`;
  console.log('[Payment Service] Generated gatewayUrl:', gatewayUrl);

  return {
    paymentId: payment.id,
    transactionId,
    gatewayUrl,
  };
};

/**
 * Handle payment callback from gateway
 */
export const handlePaymentCallback = async ({ transactionId, status, payload }) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: { booking: true },
  });

  if (!payment) {
    throw new Error('Payment record not found');
  }

  if (payment.status !== 'PENDING') {
    return payment;
  }

  let finalStatus = 'FAILED';
  let bookingStatus = 'PENDING';
  let paymentStatus = 'PENDING';

  if (status === 'success') {
    finalStatus = 'COMPLETED';
    paymentStatus = 'COMPLETED';
    bookingStatus = 'CONFIRMED';
  } else if (status === 'cancel') {
    finalStatus = 'FAILED'; // or CANCELLED in model
  }

  // Update payment record
  const updatedPayment = await prisma.payment.update({
    where: { transactionId },
    data: {
      status: finalStatus,
      gatewayResponse: JSON.stringify(payload),
    },
  });

  // Update booking record if linked
  if (payment.bookingId) {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus,
        status: bookingStatus,
      },
    });
  }

  // Notify the user about payment result
  try {
    if (status === 'success') {
      await notifyUser(payment.userId, {
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        message: `Your payment of ৳${payment.amount.toLocaleString()} has been completed successfully.`,
        data: { paymentId: payment.id, bookingId: payment.bookingId, transactionId },
      });
    } else {
      await notifyUser(payment.userId, {
        type: 'GENERAL',
        title: 'Payment Failed',
        message: `Your payment of ৳${payment.amount.toLocaleString()} could not be processed. Please try again.`,
        data: { paymentId: payment.id, bookingId: payment.bookingId, transactionId },
      });
    }
  } catch (err) {
    console.error('Failed to send payment notification:', err.message);
  }

  return updatedPayment;
};

/**
 * Get user payment history
 */
export const getUserPayments = async (userId, { page = 1, limit = 20 }) => {
  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        booking: {
          include: {
            house: { select: { name: true, images: { take: 1 } } }
          }
        }
      }
    }),
    prisma.payment.count({ where: { userId } }),
  ]);

  return {
    payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
