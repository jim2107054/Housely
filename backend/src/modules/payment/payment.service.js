import prisma from '../../config/prisma.js';
import crypto from 'crypto';
import { notifyUser } from '../notification/notification.service.js';

/**
 * Parse common truthy env values.
 */
const toBoolean = (value) => {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
};

const getSslCommerzConfig = () => {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

  if (!storeId || !storePassword) {
    throw Object.assign(
      new Error('SSLCommerz is not configured. Please set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD.'),
      { statusCode: 500 }
    );
  }

  const isLive = toBoolean(process.env.SSLCOMMERZ_IS_LIVE);
  const gatewayHost = isLive ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';

  return {
    storeId,
    storePassword,
    sessionUrl: `${gatewayHost}/gwprocess/v4/api.php`,
    validatorUrl: `${gatewayHost}/validator/api/validationserverAPI.php`,
  };
};

const postForm = async (url, payload) => {
  const formBody = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formBody.append(key, String(value));
    }
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data) {
    throw new Error('Unable to reach SSLCommerz API.');
  }

  return data;
};

const validateGatewayPayment = async (validationId) => {
  const { storeId, storePassword, validatorUrl } = getSslCommerzConfig();
  const query = new URLSearchParams({
    val_id: validationId,
    store_id: storeId,
    store_passwd: storePassword,
    format: 'json',
  });

  const response = await fetch(`${validatorUrl}?${query.toString()}`);

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data) {
    throw new Error('Unable to validate SSLCommerz transaction.');
  }

  return data;
};

const persistOutcome = async (payment, { finalStatus, bookingPaymentStatus, bookingStatus, payload }) => {
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: finalStatus,
      gatewayResponse: JSON.stringify(payload || {}),
    },
  });

  if (payment.bookingId && (bookingPaymentStatus || bookingStatus)) {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        ...(bookingPaymentStatus ? { paymentStatus: bookingPaymentStatus } : {}),
        ...(bookingStatus ? { status: bookingStatus } : {}),
      },
    });
  }

  return updatedPayment;
};

const notifyPaymentResult = async (payment, isSuccess) => {
  try {
    if (isSuccess) {
      await notifyUser(payment.userId, {
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        message: `Your payment of BDT ${payment.amount.toLocaleString()} has been completed successfully.`,
        data: { paymentId: payment.id, bookingId: payment.bookingId, transactionId: payment.transactionId },
      });
      return;
    }

    await notifyUser(payment.userId, {
      type: 'GENERAL',
      title: 'Payment Failed',
      message: `Your payment of BDT ${payment.amount.toLocaleString()} could not be processed. Please try again.`,
      data: { paymentId: payment.id, bookingId: payment.bookingId, transactionId: payment.transactionId },
    });
  } catch (err) {
    console.error('Failed to send payment notification:', err.message);
  }
};

const findPaymentByTransaction = async (transactionId) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: { booking: true },
  });

  if (!payment) {
    throw Object.assign(new Error('Payment record not found'), { statusCode: 404 });
  }

  return payment;
};

/**
 * Initiate a payment via SSLCommerz hosted checkout.
 */
export const initiatePayment = async (userId, { bookingId, amount, currency = 'BDT' }) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      house: { select: { name: true, city: true, address: true } },
      user: { select: { name: true, username: true, email: true, phoneNumber: true } },
    },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  if (booking.userId !== userId) {
    throw Object.assign(new Error('Not authorized to pay for this booking'), { statusCode: 403 });
  }

  if (booking.paymentStatus === 'COMPLETED') {
    throw Object.assign(new Error('Booking payment is already completed.'), { statusCode: 400 });
  }

  const requestedAmount = Number(amount);
  const bookingAmount = Number(booking.totalAmount);
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    throw Object.assign(new Error('Invalid payment amount.'), { statusCode: 400 });
  }

  if (Math.abs(requestedAmount - bookingAmount) > 0.01) {
    throw Object.assign(new Error('Payment amount does not match booking total.'), { statusCode: 400 });
  }

  const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const payment = await prisma.payment.create({
    data: {
      userId,
      bookingId,
      amount: bookingAmount,
      currency,
      transactionId,
      status: 'PENDING',
      method: 'SSLCommerz',
      description: `Payment for booking ${booking.house.name}`,
    },
  });

  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const callbackBase = `${baseUrl}/api/payments/sslcommerz`;
  const { storeId, storePassword, sessionUrl } = getSslCommerzConfig();

  const payload = {
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: bookingAmount.toFixed(2),
    currency,
    tran_id: transactionId,
    success_url: `${callbackBase}/success`,
    fail_url: `${callbackBase}/fail`,
    cancel_url: `${callbackBase}/cancel`,
    ipn_url: `${callbackBase}/ipn`,
    shipping_method: 'NO',
    product_name: booking.house?.name || 'House Booking',
    product_category: 'Booking',
    product_profile: 'general',
    cus_name: booking.user?.name || booking.user?.username || 'Housely User',
    cus_email: booking.user?.email || 'customer@housely.app',
    cus_add1: booking.house?.address || 'N/A',
    cus_city: booking.house?.city || 'Khulna',
    cus_postcode: '1207',
    cus_country: 'Bangladesh',
    cus_phone: booking.user?.phoneNumber || '01700000000',
    ship_name: booking.user?.name || booking.user?.username || 'Housely User',
    ship_add1: booking.house?.address || 'N/A',
    ship_city: booking.house?.city || 'Khulna',
    ship_postcode: '1207',
    ship_country: 'Bangladesh',
    value_a: payment.id,
    value_b: bookingId,
    value_c: userId,
    value_d: 'Housely',
  };

  try {
    console.log('[SSLCommerz] Initiating session with payload:', JSON.stringify({ ...payload, store_passwd: '***' }, null, 2));
    const session = await postForm(sessionUrl, payload);
    console.log('[SSLCommerz] Session response:', JSON.stringify(session, null, 2));

    if (session.status !== 'SUCCESS' || !session.GatewayPageURL) {
      await persistOutcome(payment, {
        finalStatus: 'FAILED',
        bookingPaymentStatus: 'FAILED',
        payload: { phase: 'session_init', response: session },
      });
      throw Object.assign(new Error('Unable to initiate SSLCommerz payment session.'), { statusCode: 502 });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayResponse: JSON.stringify({ phase: 'session_init', response: session }),
      },
    });

    return {
      paymentId: payment.id,
      transactionId,
      gatewayUrl: session.GatewayPageURL,
    };
  } catch (error) {
    const latestPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      select: { status: true },
    });

    if (latestPayment?.status === 'PENDING') {
      await persistOutcome(payment, {
        finalStatus: 'FAILED',
        bookingPaymentStatus: 'FAILED',
        payload: { phase: 'session_init_error', message: error.message },
      });
    }

    if (error.statusCode) {
      throw error;
    }

    throw Object.assign(new Error('Failed to start SSLCommerz payment session.'), { statusCode: 502 });
  }
};

/**
 * Handle successful callback by validating with SSLCommerz validator API.
 */
export const handleSuccessCallback = async ({ transactionId, validationId, payload }) => {
  if (!transactionId) {
    throw Object.assign(new Error('Missing transaction id in callback.'), { statusCode: 400 });
  }

  const payment = await findPaymentByTransaction(transactionId);
  if (payment.status !== 'PENDING') {
    return payment;
  }

  if (!validationId) {
    const failedPayment = await persistOutcome(payment, {
      finalStatus: 'FAILED',
      bookingPaymentStatus: 'FAILED',
      payload: { ...payload, validationError: 'Missing val_id in callback payload.' },
    });

    await notifyPaymentResult(failedPayment, false);
    return failedPayment;
  }

  try {
    const validation = await validateGatewayPayment(validationId);
    const validationStatus = String(validation.status || '').toUpperCase();
    const isValid = validationStatus === 'VALID' || validationStatus === 'VALIDATED';
    const hasMatchingTransaction = validation.tran_id === transactionId;
    const hasMatchingAmount = Math.abs(Number(validation.amount) - Number(payment.amount)) <= 0.01;
    const hasMatchingCurrency = String(validation.currency || '').toUpperCase() === String(payment.currency || '').toUpperCase();

    if (!isValid || !hasMatchingTransaction || !hasMatchingAmount || !hasMatchingCurrency) {
      const failedPayment = await persistOutcome(payment, {
        finalStatus: 'FAILED',
        bookingPaymentStatus: 'FAILED',
        payload: {
          ...payload,
          validation,
          validationChecks: {
            isValid,
            hasMatchingTransaction,
            hasMatchingAmount,
            hasMatchingCurrency,
          },
        },
      });
      await notifyPaymentResult(failedPayment, false);
      return failedPayment;
    }

    const completedPayment = await persistOutcome(payment, {
      finalStatus: 'COMPLETED',
      bookingPaymentStatus: 'COMPLETED',
      bookingStatus: 'CONFIRMED',
      payload: {
        ...payload,
        validation,
      },
    });

    await notifyPaymentResult(completedPayment, true);
    return completedPayment;
  } catch (error) {
    const failedPayment = await persistOutcome(payment, {
      finalStatus: 'FAILED',
      bookingPaymentStatus: 'FAILED',
      payload: {
        ...payload,
        validationError: error.message,
      },
    });
    await notifyPaymentResult(failedPayment, false);
    return failedPayment;
  }
};

/**
 * Handle failed/cancelled callback.
 */
export const handleFailureCallback = async ({ transactionId, status, payload }) => {
  if (!transactionId) {
    throw Object.assign(new Error('Missing transaction id in callback.'), { statusCode: 400 });
  }

  const payment = await findPaymentByTransaction(transactionId);
  if (payment.status !== 'PENDING') {
    return payment;
  }

  const failedPayment = await persistOutcome(payment, {
    finalStatus: 'FAILED',
    bookingPaymentStatus: 'FAILED',
    payload: {
      ...payload,
      gatewayStatus: status || 'FAILED',
    },
  });

  await notifyPaymentResult(failedPayment, false);
  return failedPayment;
};

/**
 * Backward-compatible unified callback handler.
 */
export const handlePaymentCallback = async ({ transactionId, status, payload }) => {
  if (String(status || '').toLowerCase() === 'success') {
    return handleSuccessCallback({
      transactionId,
      validationId: payload?.val_id || payload?.validationId,
      payload,
    });
  }

  return handleFailureCallback({ transactionId, status, payload });
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
