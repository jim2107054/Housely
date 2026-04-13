import { Router } from 'express';
import * as houseController from './house.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect, requireRole } from '../../middlewares/auth.js';
import { createHouseSchema, updateHouseSchema, houseIdSchema } from './house.validation.js';
import { upload } from '../../middlewares/upload.js';

const router = Router();

// Public routes
router.get('/', houseController.listHouses);
router.get('/top-locations', houseController.getTopLocations);
router.get('/popular', houseController.getPopular);

// Authenticated routes (MUST be before /:id to avoid being matched as an id)
router.get('/favorites', protect, houseController.getFavorites);
router.get('/recommended', protect, houseController.getRecommended);
router.get('/nearby', protect, houseController.getNearby);

// Agent-only routes (MUST be before /:id)
router.get('/my-houses', protect, requireRole('AGENT', 'ADMIN'), houseController.getMyHouses);
router.get('/agent/dashboard', protect, requireRole('AGENT', 'ADMIN'), houseController.getAgentDashboard);
router.post('/', protect, requireRole('AGENT', 'ADMIN'), validate(createHouseSchema), houseController.createHouse);

// Upload route for images/videos (Cloudinary)
router.post('/upload', protect, requireRole('AGENT', 'ADMIN'), upload.array('files', 10), houseController.uploadMedia);

// House detail (public) — MUST be AFTER all named routes
router.get('/:id', validate(houseIdSchema), houseController.getHouseById);
router.get('/:id/share-link', validate(houseIdSchema), houseController.getShareLink);

// Authenticated actions
router.post('/:id/view', protect, validate(houseIdSchema), houseController.trackView);
router.post('/:id/favorite', protect, validate(houseIdSchema), houseController.toggleFavorite);

// Agent update/delete
router.patch('/:id', protect, requireRole('AGENT', 'ADMIN'), validate(updateHouseSchema), houseController.updateHouse);
router.delete('/:id', protect, requireRole('AGENT', 'ADMIN'), validate(houseIdSchema), houseController.deleteHouse);

export default router;
