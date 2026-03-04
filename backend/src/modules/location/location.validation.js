import { z } from 'zod';

export const reverseGeocodeSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const saveLocationSchema = z.object({
  body: z.object({
    label: z.string().max(100).optional(),
    address: z.string().min(1).max(500),
    city: z.string().max(100).optional(),
    area: z.string().max(100).optional(),
    street: z.string().max(200).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const deleteLocationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
