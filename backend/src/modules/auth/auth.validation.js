import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).trim(),
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6).max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const forgotPasswordEmailSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
  }),
});

export const forgotPasswordPhoneSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    identifier: z.string().min(1),
    otp: z.string().length(6),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      identifier: z.string().min(1),
      newPassword: z.string().min(6).max(128),
      confirmPassword: z.string().min(6).max(128),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});
