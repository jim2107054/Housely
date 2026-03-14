import * as reviewService from './review.service.js';
import { success } from '../../utils/response.js';

export const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    return success(res, review, 'Review created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getHouseReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getHouseReviews(req.params.houseId, req.query);
    return success(res, result, 'Reviews retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    return success(res, review, 'Review retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(req.user.id, req.params.id, req.body);
    return success(res, review, 'Review updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(req.user.id, req.params.id);
    return success(res, result, 'Review deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getUserReviews(req.user.id, req.query);
    return success(res, result, 'Reviews retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getAgentReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getAgentReviews(req.user.id, req.query);
    return success(res, result, 'Reviews retrieved successfully');
  } catch (err) {
    next(err);
  }
};
