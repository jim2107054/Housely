import { Router } from 'express';
import * as paymentController from './payment.controller.js';
import { protect } from '../../middlewares/auth.js';

const router = Router();

// Initiation requires auth
router.post('/initiate', protect, paymentController.initiate);

// SSLCommerz callbacks (public)
router.get('/sslcommerz/success', paymentController.sslCommerzSuccess);
router.post('/sslcommerz/success', paymentController.sslCommerzSuccess);
router.get('/sslcommerz/fail', paymentController.sslCommerzFail);
router.post('/sslcommerz/fail', paymentController.sslCommerzFail);
router.get('/sslcommerz/cancel', paymentController.sslCommerzCancel);
router.post('/sslcommerz/cancel', paymentController.sslCommerzCancel);
router.post('/sslcommerz/ipn', paymentController.sslCommerzIpn);

// Legacy callback support
router.get('/callback', paymentController.callback);
router.post('/callback', paymentController.callback);

// Payment history (auth)
router.get('/my', protect, paymentController.getHistory);

export default router;
