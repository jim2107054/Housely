import { Router } from 'express';
import * as filterController from './filter.controller.js';

const router = Router();

// GET /api/filter/search?listingType=RENT&city=Dhaka&minPrice=10000&sortBy=price_asc&page=1
router.get('/search', filterController.filterHouses);

export default router;
