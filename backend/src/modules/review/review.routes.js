import { Router } from 'express';
import * as reviewController from './review.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import {
  createReviewSchema,
  reviewIdSchema,
  updateReviewSchema,
  listReviewsSchema,
} from './review.validation.js';

const router = Router();

// Create review (requires auth)
router.post('/', protect, validate(createReviewSchema), reviewController.createReview);

// Get user's own reviews
router.get('/my', protect, reviewController.getMyReviews);

// Get reviews for a house (public)
router.get('/house/:houseId', validate(listReviewsSchema), reviewController.getHouseReviews);

// Get single review (public)
router.get('/:id', validate(reviewIdSchema), reviewController.getReviewById);

// Update own review
router.patch('/:id', protect, validate(updateReviewSchema), reviewController.updateReview);

// Delete own review
router.delete('/:id', protect, validate(reviewIdSchema), reviewController.deleteReview);

export default router;
