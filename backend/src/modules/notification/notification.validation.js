import { z } from 'zod';

export const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required'),
  }),
});

export const listNotificationsSchema = z.object({
  query: z.object({
    type: z.enum(['BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'NEW_MESSAGE', 'REVIEW_POSTED', 'GENERAL']).optional(),
    isRead: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const registerDeviceSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Device token is required'),
    platform: z.enum(['android', 'ios']).optional().default('android'),
  }),
});

export const removeDeviceSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Device token is required'),
  }),
});
