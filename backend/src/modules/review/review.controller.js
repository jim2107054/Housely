import * as reviewService from './review.service.js';
import { success } from '../../utils/response.js';
import env from '../../config/env.js';

export const uploadReviewImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    let uploadFile;
    if (env.CLOUDINARY_CLOUD_NAME) {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
      uploadFile = (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'housely/reviews' },
            (error, result) => (error ? reject(error) : resolve(result.secure_url)),
          );
          stream.end(file.buffer);
        });
    } else {
      uploadFile = (file) =>
        Promise.resolve(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
    }

    const urls = await Promise.all(req.files.map(uploadFile));
    const media = urls.map((url) => ({ url, type: 'image' }));
    return success(res, { media }, 'Images uploaded successfully');
  } catch (err) {
    next(err);
  }
};

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
