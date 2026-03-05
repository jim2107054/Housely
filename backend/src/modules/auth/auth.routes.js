import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import { rateLimiter } from '../../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordEmailSchema,
  forgotPasswordPhoneSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from './auth.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', rateLimiter(5, 60), validate(loginSchema), authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password/email', rateLimiter(3, 60), validate(forgotPasswordEmailSchema), authController.forgotPasswordEmail);
router.post('/forgot-password/phone', rateLimiter(3, 60), validate(forgotPasswordPhoneSchema), authController.forgotPasswordPhone);
router.post('/verify-otp', rateLimiter(5, 60), validate(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
