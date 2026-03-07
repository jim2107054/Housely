import { Router } from 'express';
import * as notificationController from './notification.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import {
  notificationIdSchema,
  listNotificationsSchema,
  registerDeviceSchema,
  removeDeviceSchema,
} from './notification.validation.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Notifications
router.get('/', validate(listNotificationsSchema), notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/clear-all', notificationController.clearAll);

// Device tokens for push notifications (must be before /:id routes)
router.post('/device-token', validate(registerDeviceSchema), notificationController.registerDevice);
router.delete('/device-token', validate(removeDeviceSchema), notificationController.removeDevice);

router.get('/:id', validate(notificationIdSchema), notificationController.getNotification);
router.patch('/:id/read', validate(notificationIdSchema), notificationController.markAsRead);
router.delete('/:id', validate(notificationIdSchema), notificationController.deleteNotification);

export default router;
