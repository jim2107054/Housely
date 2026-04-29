import * as paymentService from './payment.service.js';

const getTransactionId = (payload) => payload.tran_id || payload.transactionId;
const getValidationId = (payload) => payload.val_id || payload.validationId;

const renderRedirectPage = (res, { status, transactionId }) => {
  const deepLinkBase = process.env.FRONTEND_DEEP_LINK_BASE || 'housely://payment';
  const redirectUrl = `${deepLinkBase}?status=${encodeURIComponent(status)}&transactionId=${encodeURIComponent(transactionId || '')}`;
  const isSuccess = status === 'success';

  return res.send(`
    <html>
      <head>
        <title>Payment Processing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;padding:16px;text-align:center;">
        <h2 style="color:${isSuccess ? '#10B981' : '#EF4444'};margin-bottom:8px;">
          Payment ${isSuccess ? 'Successful' : 'Failed'}
        </h2>
        <p style="margin-top:0;color:#4B5563;">Redirecting back to app...</p>
        <a href="${redirectUrl}" style="margin-top:12px;color:#2563EB;text-decoration:none;">Tap here if not redirected</a>
        <script>
          setTimeout(function () {
            window.location.href = "${redirectUrl}";
          }, 1500);
        </script>
      </body>
    </html>
  `);
};

export const initiate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await paymentService.initiatePayment(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Payment initiated',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const sslCommerzSuccess = async (req, res, next) => {
  try {
    const payload = { ...req.query, ...req.body };
    console.log('[SSLCommerz] Success callback received:', JSON.stringify(payload, null, 2));
    const transactionId = getTransactionId(payload);
    const validationId = getValidationId(payload);

    const payment = await paymentService.handleSuccessCallback({
      transactionId,
      validationId,
      payload,
    });

    const status = payment.status === 'COMPLETED' ? 'success' : 'fail';
    return renderRedirectPage(res, { status, transactionId });
  } catch (error) {
    next(error);
  }
};

export const sslCommerzFail = async (req, res, next) => {
  try {
    const payload = { ...req.query, ...req.body };
    console.log('[SSLCommerz] Failure callback received:', JSON.stringify(payload, null, 2));
    const transactionId = getTransactionId(payload);

    await paymentService.handleFailureCallback({
      transactionId,
      status: 'fail',
      payload,
    });

    return renderRedirectPage(res, { status: 'fail', transactionId });
  } catch (error) {
    next(error);
  }
};

export const sslCommerzCancel = async (req, res, next) => {
  try {
    const payload = { ...req.query, ...req.body };
    console.log('[SSLCommerz] Cancel callback received:', JSON.stringify(payload, null, 2));
    const transactionId = getTransactionId(payload);

    await paymentService.handleFailureCallback({
      transactionId,
      status: 'cancel',
      payload,
    });

    return renderRedirectPage(res, { status: 'cancel', transactionId });
  } catch (error) {
    next(error);
  }
};

export const sslCommerzIpn = async (req, res, next) => {
  try {
    const payload = { ...req.body, ...req.query };
    const transactionId = getTransactionId(payload);
    const validationId = getValidationId(payload);
    const gatewayStatus = String(payload.status || '').toUpperCase();

    if (gatewayStatus === 'VALID' || gatewayStatus === 'VALIDATED' || gatewayStatus === 'SUCCESS') {
      await paymentService.handleSuccessCallback({
        transactionId,
        validationId,
        payload,
      });
    } else {
      await paymentService.handleFailureCallback({
        transactionId,
        status: payload.status,
        payload,
      });
    }

    return res.status(200).json({ success: true, message: 'IPN received' });
  } catch (error) {
    next(error);
  }
};

export const callback = async (req, res, next) => {
  try {
    const payload = { ...req.query, ...req.body };
    const transactionId = payload.transactionId || payload.tran_id;
    const status = String(payload.status || '').toLowerCase();

    const payment = await paymentService.handlePaymentCallback({
      transactionId,
      status,
      payload,
    });

    const resolvedStatus = payment.status === 'COMPLETED' ? 'success' : status || 'fail';
    return renderRedirectPage(res, { status: resolvedStatus, transactionId });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.auth?.userId || req.user?.id;
    const result = await paymentService.getUserPayments(userId, req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
