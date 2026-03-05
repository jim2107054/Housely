import { Router } from 'express';
import * as locationController from './location.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import {
  reverseGeocodeSchema,
  saveLocationSchema,
  deleteLocationSchema,
} from './location.validation.js';

const router = Router();

router.post('/reverse-geocode', protect, validate(reverseGeocodeSchema), locationController.reverseGeocode);
router.get('/saved', protect, locationController.getSavedLocations);
router.post('/save', protect, validate(saveLocationSchema), locationController.saveLocation);
router.delete('/saved/:id', protect, validate(deleteLocationSchema), locationController.deleteLocation);

export default router;
