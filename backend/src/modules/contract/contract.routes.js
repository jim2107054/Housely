import { Router } from 'express';
import { protect, requireRole } from '../../middlewares/auth.js';
import { getContractByBooking, getAllContracts } from './contract.controller.js';

const router = Router();

// Renter or owner: get contract for a specific booking
router.get('/booking/:bookingId', protect, getContractByBooking);

// Admin: list all contracts
router.get('/', protect, requireRole('ADMIN'), getAllContracts);

export default router;
