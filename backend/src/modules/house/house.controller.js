import * as houseService from './house.service.js';
import { success } from '../../utils/response.js';

export const listHouses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const sortBy = req.query.sortBy || 'newest';
    const result = await houseService.listHouses({ page, limit, sortBy });
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

export const getRecommended = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const houses = await houseService.getRecommended(req.user.id, limit);
    return success(res, { houses });
  } catch (err) {
    next(err);
  }
};

export const getNearby = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10;
    const limit = parseInt(req.query.limit, 10) || 20;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    const houses = await houseService.getNearby(lat, lng, radius, limit);
    return success(res, { houses });
  } catch (err) {
    next(err);
  }
};

export const getTopLocations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const locations = await houseService.getTopLocations(limit);
    return success(res, { locations });
  } catch (err) {
    next(err);
  }
};

export const getPopular = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const houses = await houseService.getPopular(limit);
    return success(res, { houses });
  } catch (err) {
    next(err);
  }
};

export const getHouseById = async (req, res, next) => {
  try {
    const house = await houseService.getHouseById(req.params.id);
    return success(res, { house });
  } catch (err) {
    next(err);
  }
};

export const createHouse = async (req, res, next) => {
  try {
    const house = await houseService.createHouse(req.user.id, req.body);
    return success(res, { house }, 'House created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateHouse = async (req, res, next) => {
  try {
    const house = await houseService.updateHouse(req.user.id, req.params.id, req.body);
    return success(res, { house }, 'House updated');
  } catch (err) {
    next(err);
  }
};

export const deleteHouse = async (req, res, next) => {
  try {
    const result = await houseService.deleteHouse(req.user.id, req.params.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

export const trackView = async (req, res, next) => {
  try {
    const result = await houseService.trackView(req.user.id, req.params.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

export const getShareLink = async (req, res, next) => {
  try {
    const result = await houseService.getShareLink(req.params.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};
