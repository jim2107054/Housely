import { Router } from 'express';
import * as paymentController from './payment.controller.js';
import { protect } from '../../middlewares/auth.js';

const router = Router();

// Initiation requires auth
router.post('/initiate', protect, paymentController.initiate);

// Callback from gateway (public)
router.get('/callback', paymentController.callback);
router.post('/callback', paymentController.callback);

// Mock gateway page (public)
router.get('/mock-gateway', paymentController.mockGateway);

// Payment history (auth)
router.get('/my', protect, paymentController.getHistory);

export default router;
