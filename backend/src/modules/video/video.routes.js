import { Router } from 'express';
import * as videoController from './video.controller.js';
import { protect, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { videoUpload } from '../../middlewares/cloudinary.middleware.js';
import {
  uploadVideoSchema,
  updateVideoSchema,
  videoIdSchema,
  listVideosSchema,
} from './video.validation.js';

const router = Router();

// Public
router.get('/', validate(listVideosSchema), videoController.listVideos);

// Authenticated — /me/watch-history MUST come before /:id to avoid "me" matching as an id
router.get('/me/watch-history', protect, videoController.getWatchHistory);

// Admin
router.get('/admin/users', protect, requireRole('ADMIN'), videoController.listAllUsers);

// Public (parameterised)
router.get('/:id', validate(videoIdSchema), videoController.getVideoById);
router.get('/:id/stream', validate(videoIdSchema), videoController.streamVideo);

// Authenticated
router.post('/upload', protect, videoUpload.single('video'), validate(uploadVideoSchema), videoController.uploadVideo);
router.post('/:id/view', protect, validate(videoIdSchema), videoController.trackView);

// Owner or ADMIN
router.patch('/:id', protect, validate(updateVideoSchema), videoController.updateVideo);
router.delete('/:id', protect, validate(videoIdSchema), videoController.deleteVideo);

export default router;
