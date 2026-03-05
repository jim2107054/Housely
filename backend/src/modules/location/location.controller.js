import * as locationService from './location.service.js';
import { success } from '../../utils/response.js';

export const reverseGeocode = async (req, res, next) => {
  try {
    const result = await locationService.reverseGeocode(req.body.latitude, req.body.longitude);
    return success(res, { location: result });
  } catch (err) {
    next(err);
  }
};

export const getSavedLocations = async (req, res, next) => {
  try {
    const locations = await locationService.getSavedLocations(req.user.id);
    return success(res, { locations });
  } catch (err) {
    next(err);
  }
};

export const saveLocation = async (req, res, next) => {
  try {
    const location = await locationService.saveLocation(req.user.id, req.body);
    return success(res, { location }, 'Location saved', 201);
  } catch (err) {
    next(err);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const result = await locationService.deleteLocation(req.user.id, req.params.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};
