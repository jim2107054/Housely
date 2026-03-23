import { z } from 'zod';

export const uploadVideoSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    houseId: z.string().optional(),
    tags: z
      .array(z.string().max(30))
      .max(10)
      .optional(),
  }),
});

export const updateVideoSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['PROCESSING', 'PUBLISHED', 'ARCHIVED']).optional(),
    tags: z
      .array(z.string().max(30))
      .max(10)
      .optional(),
  }),
});

export const videoIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listVideosSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(['PROCESSING', 'PUBLISHED', 'ARCHIVED']).optional(),
    uploaderId: z.string().optional(),
    houseId: z.string().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
  }),
});
