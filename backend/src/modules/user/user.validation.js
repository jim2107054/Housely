import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    username: z.string().min(3).max(30).optional(),
    email: z.string().email().optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}/, 'Must be a valid date (YYYY-MM-DD)')
      .optional(),
    phoneNumber: z.string().min(10).max(15).optional(),
  }),
});

export const updateNotificationSettingsSchema = z.object({
  body: z.object({
    pushEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    bookingUpdates: z.boolean().optional(),
    promotions: z.boolean().optional(),
  }),
});
