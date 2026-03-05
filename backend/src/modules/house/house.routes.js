import { Router } from 'express';
import * as houseController from './house.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect, requireRole } from '../../middlewares/auth.js';
import { createHouseSchema, updateHouseSchema, houseIdSchema } from './house.validation.js';

const router = Router();

// Public routes
router.get('/', houseController.listHouses);
router.get('/top-locations', houseController.getTopLocations);
router.get('/popular', houseController.getPopular);

// Authenticated routes
router.get('/recommended', protect, houseController.getRecommended);
router.get('/nearby', protect, houseController.getNearby);

// House detail (public)
router.get('/:id', validate(houseIdSchema), houseController.getHouseById);
router.get('/:id/share-link', validate(houseIdSchema), houseController.getShareLink);

// Authenticated actions
router.post('/:id/view', protect, validate(houseIdSchema), houseController.trackView);

// Agent-only routes
router.post('/', protect, requireRole('AGENT', 'ADMIN'), validate(createHouseSchema), houseController.createHouse);
router.patch('/:id', protect, requireRole('AGENT', 'ADMIN'), validate(updateHouseSchema), houseController.updateHouse);
router.delete('/:id', protect, requireRole('AGENT', 'ADMIN'), validate(houseIdSchema), houseController.deleteHouse);

export default router;
