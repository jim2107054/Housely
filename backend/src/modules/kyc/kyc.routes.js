import { Router } from 'express';
import { protect, requireRole } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/upload.js';
import { submitKYC, getKYCStatus, handleWebhook, listKYCRecords, reviewKYC } from './kyc.controller.js';

const router = Router();

// User routes
router.post(
  '/submit',
  protect,
  upload.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  submitKYC,
);

router.get('/status', protect, getKYCStatus);

// Onfido webhook (no auth — verified by Onfido signature in production)
router.post('/webhook', handleWebhook);

// Admin routes
router.get('/', protect, requireRole('ADMIN'), listKYCRecords);
router.patch('/:userId', protect, requireRole('ADMIN'), reviewKYC);

export default router;
