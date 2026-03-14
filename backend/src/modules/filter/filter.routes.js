import { Router } from 'express';
import * as filterController from './filter.controller.js';

const router = Router();

// GET /api/filter/search?listingType=RENT&city=Dhaka&minPrice=10000&sortBy=price_asc&page=1
router.get('/search', filterController.filterHouses);

// Also support GET /api/filter directly (frontend calls this)
router.get('/', filterController.filterHouses);

export default router;
