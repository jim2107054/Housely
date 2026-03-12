import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z.string().optional(),
    media: z.array(z.object({
      url: z.string().url('Invalid media URL'),
      type: z.enum(['image', 'video']).optional().default('image'),
    })).optional(),
  }),
});

export const reviewIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required'),
  }),
});

export const houseIdSchema = z.object({
  params: z.object({
    houseId: z.string().min(1, 'House ID is required'),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().optional(),
    media: z.array(z.object({
      url: z.string().url('Invalid media URL'),
      type: z.enum(['image', 'video']).optional().default('image'),
    })).optional(),
  }),
});

export const listReviewsSchema = z.object({
  params: z.object({
    houseId: z.string().min(1, 'House ID is required'),
  }),
  query: z.object({
    sortBy: z.enum(['newest', 'oldest', 'highest', 'lowest']).optional().default('newest'),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});
