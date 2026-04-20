import express from 'express';
import { protect, requireRole } from '../../middlewares/auth.js';
import * as adminController from './admin.controller.js';

const router = express.Router();

// ─── All admin routes require ADMIN role ───
router.use(protect, requireRole('ADMIN'));

// ─── Statistics & Analytics ───
router.get('/stats', adminController.getPlatformStats);
router.get('/health', adminController.getSystemHealth);
router.get('/revenue', adminController.getRevenue);
router.get('/top-agents', adminController.getTopAgents);
router.get('/top-properties', adminController.getTopProperties);

// ─── User Management ───
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/verify', adminController.toggleVerification);
router.delete('/users/:id', adminController.deleteUser);

// ─── House Management ───
router.get('/houses', adminController.getHouses);
router.patch('/houses/:id/status', adminController.updateHouseStatus);
router.delete('/houses/:id', adminController.deleteHouse);

// ─── Booking Management ───
router.get('/bookings', adminController.getBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

// ─── Payment Management ───
router.get('/payments', adminController.getPayments);

// ─── Review Management ───
router.get('/reviews', adminController.getReviews);
router.delete('/reviews/:id', adminController.deleteReview);

// ─── Notifications ───
router.post('/notifications/send', adminController.sendNotifications);

export default router;
