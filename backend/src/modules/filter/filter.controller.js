import * as filterService from './filter.service.js';
import { success } from '../../utils/response.js';

export const filterHouses = async (req, res, next) => {
  try {
    const q = req.query;

    const filters = {
      listingType: q.listingType || undefined,
      propertyType: q.propertyType ? q.propertyType.split(',') : undefined,
      minPrice: q.minPrice ? Number(q.minPrice) : undefined,
      maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
      bedrooms: q.bedrooms !== undefined ? Number(q.bedrooms) : undefined,
      bathrooms: q.bathrooms !== undefined ? Number(q.bathrooms) : undefined,
      minSize: q.minSize ? Number(q.minSize) : undefined,
      maxSize: q.maxSize ? Number(q.maxSize) : undefined,
      buildYear: q.buildYear ? Number(q.buildYear) : undefined,
      status: q.status || undefined,
      hasWifi: q.hasWifi !== undefined ? q.hasWifi === 'true' || q.hasWifi === '1' : undefined,
      hasWater: q.hasWater !== undefined ? q.hasWater === 'true' || q.hasWater === '1' : undefined,
      city: q.city || undefined,
      area: q.area || undefined,
      q: q.q || undefined,
      sortBy: q.sortBy || 'newest',
      page: q.page ? parseInt(q.page, 10) : 1,
      limit: q.limit ? Math.min(parseInt(q.limit, 10), 100) : 20,
    };

    const result = await filterService.filterHouses(filters);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};
