import { Router } from 'express';
import * as bookingController from './booking.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect, requireRole } from '../../middlewares/auth.js';
import {
  createBookingSchema,
  bookingIdSchema,
  listBookingsSchema,
} from './booking.validation.js';

const router = Router();

// User routes
router.post('/', protect, validate(createBookingSchema), bookingController.createBooking);
router.get('/my', protect, validate(listBookingsSchema), bookingController.getMyBookings);

// Agent routes (MUST be before /:id)
router.get('/agent/all', protect, requireRole('AGENT', 'ADMIN'), validate(listBookingsSchema), bookingController.getAgentBookings);
router.patch('/agent/:id/status', protect, requireRole('AGENT', 'ADMIN'), bookingController.updateBookingStatus);

// Parameterized routes last
router.get('/:id', protect, validate(bookingIdSchema), bookingController.getBookingById);
router.patch('/:id/cancel', protect, validate(bookingIdSchema), bookingController.cancelBooking);

export default router;
