import * as paymentService from './payment.service.js';

export const initiate = async (req, res, next) => {
  try {
    const userId = req.user.id;
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

export const callback = async (req, res, next) => {
  try {
    const { transactionId, status } = req.query;
    await paymentService.handlePaymentCallback({
      transactionId,
      status,
      payload: { ...req.query, ...req.body },
    });

    // In a real app, you would redirect back to the app using a deep link
    // For now, we show a success/failure page or redirect to a success URL that the WebView can detect
    const baseUrl = process.env.FRONTEND_DEEP_LINK_BASE || 'housely://payment';
    const redirectUrl = `${baseUrl}?status=${status}&transactionId=${transactionId}`;
    
    res.send(`
      <html>
        <head><title>Payment Processing</title></head>
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <h2 style="color: ${status === 'success' ? '#10B981' : '#EF4444'}">
            Payment ${status === 'success' ? 'Successful!' : 'Failed'}
          </h2>
          <p>Redirecting back to app...</p>
          <script>
            setTimeout(() => {
              window.location.href = "${redirectUrl}";
            }, 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

export const mockGateway = async (req, res) => {
  const { transactionId, amount } = req.query;
  res.send(`
    <html>
      <head>
        <title>Mock Payment Gateway</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f3f4f6; }
          .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
          button { padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: bold; cursor: pointer; width: 100%; margin-top: 1rem; }
          .btn-success { background-color: #7F56D9; color: white; }
          .btn-cancel { background-color: #e5e7eb; color: #374151; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color: #7F56D9">Housely Checkout</h2>
          <p>Amount: <strong>${amount} BDT</strong></p>
          <p>Transaction ID: <br><small>${transactionId}</small></p>
          <button class="btn-success" onclick="window.location.href='/api/payments/callback?status=success&transactionId=${transactionId}'">
            Simulate Success
          </button>
          <button class="btn-cancel" onclick="window.location.href='/api/payments/callback?status=cancel&transactionId=${transactionId}'">
            Cancel Payment
          </button>
        </div>
      </body>
    </html>
  `);
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
