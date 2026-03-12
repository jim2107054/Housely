import { z } from 'zod';

// Helper: coerce optional numeric query param
const optionalNum = z
  .string()
  .optional()
  .transform((v) => (v !== undefined && v !== '' ? Number(v) : undefined))
  .pipe(z.number().optional());

const optionalInt = z
  .string()
  .optional()
  .transform((v) => (v !== undefined && v !== '' ? parseInt(v, 10) : undefined))
  .pipe(z.number().int().optional());

const optionalBool = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined || v === '') return undefined;
    return v === 'true' || v === '1';
  });

export const filterSchema = z.object({
  query: z
    .object({
      // Listing
      listingType: z.enum(['RENT', 'SALE']).optional(),
      propertyType: z
        .string()
        .optional()
        .transform((v) => (v ? v.split(',') : undefined)),

      // Price
      minPrice: optionalNum,
      maxPrice: optionalNum,

      // Rooms & size
      bedrooms: optionalInt,
      bathrooms: optionalInt,
      minSize: optionalNum,
      maxSize: optionalNum,

      // Build
      buildYear: optionalInt,

      // Status
      status: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),

      // Amenities
      hasWifi: optionalBool,
      hasWater: optionalBool,

      // Location
      city: z.string().optional(),
      area: z.string().optional(),

      // Search text
      q: z.string().optional(),

      // Sort
      sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'most_popular']).optional(),

      // Pagination
      page: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 1))
        .pipe(z.number().int().positive()),
      limit: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 20))
        .pipe(z.number().int().positive().max(100)),
    })
    .passthrough(),
});
