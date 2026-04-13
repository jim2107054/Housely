import { z } from 'zod';

const propertyTypes = ['APARTMENT', 'PENTHOUSE', 'HOTEL', 'VILLA', 'STUDIO', 'DUPLEX', 'TOWNHOUSE', 'CONDO'];

export const createHouseSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    listingType: z.enum(['RENT', 'SALE']),
    propertyType: z.enum(propertyTypes),
    rentPerMonth: z.number().positive().nullable().optional(),
    salePrice: z.number().positive().nullable().optional(),
    address: z.string().min(1).max(500),
    city: z.string().min(1).max(100),
    area: z.string().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    bedrooms: z.number().int().min(0).default(1),
    bathrooms: z.number().int().min(0).default(1),
    sizeInSqft: z.number().positive().optional(),
    buildYear: z.number().int().min(1800).max(2030).optional(),
    hasWifi: z.boolean().default(false),
    hasWater: z.boolean().default(true),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          order: z.number().int().min(0).default(0),
        }),
      )
      .optional(),
    video: z.object({ url: z.string().url() }).optional(),
    publicFacilities: z
      .object({
        wifi: z.boolean().optional(),
        water: z.boolean().optional(),
        electricity: z.boolean().optional(),
        parking: z.boolean().optional(),
        mosqueDistance: z.number().positive().optional(),
        hospitalDistance: z.number().positive().optional(),
        shoppingMallDistance: z.number().positive().optional(),
        marketDistance: z.number().positive().optional(),
      })
      .optional(),
  }),
});

export const updateHouseSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),
    listingType: z.enum(['RENT', 'SALE']).optional(),
    propertyType: z.enum(propertyTypes).optional(),
    rentPerMonth: z.number().positive().nullable().optional(),
    salePrice: z.number().positive().nullable().optional(),
    address: z.string().min(1).max(500).optional(),
    city: z.string().min(1).max(100).optional(),
    area: z.string().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    sizeInSqft: z.number().positive().optional(),
    buildYear: z.number().int().min(1800).max(2030).optional(),
    hasWifi: z.boolean().optional(),
    hasWater: z.boolean().optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          order: z.number().int().min(0).default(0),
        }),
      )
      .optional(),
    video: z.object({ url: z.string().url() }).nullable().optional(),
    publicFacilities: z
      .object({
        wifi: z.boolean().optional(),
        water: z.boolean().optional(),
        electricity: z.boolean().optional(),
        parking: z.boolean().optional(),
        mosqueDistance: z.number().positive().nullable().optional(),
        hospitalDistance: z.number().positive().nullable().optional(),
        shoppingMallDistance: z.number().positive().nullable().optional(),
        marketDistance: z.number().positive().nullable().optional(),
      })
      .optional(),
  }),
});

export const houseIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
