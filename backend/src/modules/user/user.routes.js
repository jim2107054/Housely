import { Router } from 'express';
import * as userController from './user.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/upload.js';
import { updateProfileSchema, updateNotificationSettingsSchema } from './user.validation.js';

const router = Router();

router.get('/me', protect, userController.getProfile);
router.patch('/me', protect, validate(updateProfileSchema), userController.updateProfile);
router.post('/me/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
router.get('/me/payment-history', protect, userController.getPaymentHistory);
router.get('/me/notifications', protect, userController.getNotificationSettings);
router.patch('/me/notifications', protect, validate(updateNotificationSettingsSchema), userController.updateNotificationSettings);
router.get('/me/recent-viewed', protect, userController.getRecentViewed);

export default router;
