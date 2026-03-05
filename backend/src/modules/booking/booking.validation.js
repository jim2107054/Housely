import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    houseId: z.string().min(1, 'House ID is required'),
    checkIn: z.string().datetime({ message: 'Invalid check-in date format' }),
    checkOut: z.string().datetime({ message: 'Invalid check-out date format' }),
    notes: z.string().optional(),
  }),
});

export const bookingIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
  body: z.object({
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
});

export const listBookingsSchema = z.object({
  query: z.object({
    status: z.enum(['upcoming', 'completed', 'cancelled', 'all']).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});
