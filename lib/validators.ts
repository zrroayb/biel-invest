import { z } from "zod";
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "@/types/property";

const translationSchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().max(6000).default(""),
  highlights: z.array(z.string().max(160)).max(20).default([]),
});

const translationsSchema = z.object({
  tr: translationSchema,
  en: translationSchema,
  de: translationSchema,
  ru: translationSchema,
});

const specsSchema = z.object({
  areaGross: z.number().nonnegative().nullable().optional(),
  areaNet: z.number().nonnegative().nullable().optional(),
  bedrooms: z.number().int().nonnegative().nullable().optional(),
  livingRooms: z.number().int().nonnegative().nullable().optional(),
  bathrooms: z.number().int().nonnegative().nullable().optional(),
  yearBuilt: z.number().int().min(1800).max(2100).nullable().optional(),
  plotSize: z.number().nonnegative().nullable().optional(),
});

const mediaSchema = z.object({
  cover: z
    .union([z.string().url(), z.null(), z.literal("")])
    .transform((s) => (s === "" ? null : s)),
  gallery: z.array(z.string().url()).max(60),
  videoUrl: z.string().url().nullable().optional(),
  virtualTourUrl: z.string().url().nullable().optional(),
});

/**
 * @param allowedIds — from {@link getMergedPropertyTaxonomy} (regions + feature ids in CMS).
 */
export function buildPropertyInputSchema(allowedIds: {
  regionIds: string[];
  featureIds: string[];
}) {
  const rSet = new Set(allowedIds.regionIds);
  const fSet = new Set(allowedIds.featureIds);
  if (rSet.size === 0) {
    throw new Error("property taxonomy has no regions");
  }
  if (fSet.size === 0) {
    throw new Error("property taxonomy has no features");
  }
  return z.object({
    slug: z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9-]+$/, "Only lowercase, digits, hyphens"),
    type: z.enum(PROPERTY_TYPES),
    status: z.enum(PROPERTY_STATUSES),
    region: z
      .string()
      .min(1)
      .refine((s) => rSet.has(s), "Unknown or disabled region id"),
    price: z.number().nonnegative(),
    currency: z.enum(["EUR", "USD", "TRY", "GBP"]).default("EUR"),
    specs: specsSchema,
    features: z
      .array(z.string().min(1))
      .refine(
        (arr) => arr.every((x) => fSet.has(x)),
        "Unknown or disabled feature id",
      ),
    translations: translationsSchema,
    media: mediaSchema,
    coordinates: z
      .object({ lat: z.number(), lng: z.number() })
      .nullable()
      .optional(),
    featured: z.boolean().default(false),
  });
}

export type PropertyInputValidated = z.infer<
  ReturnType<typeof buildPropertyInputSchema>
>;

export const inquirySchema = z.object({
  propertyId: z.string().max(120).nullable().optional(),
  propertySlug: z.string().max(120).nullable().optional(),
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  message: z.string().min(2).max(3000),
  locale: z.enum(["tr", "en", "de", "ru"]),
  honeypot: z.string().max(0).optional(),
});

export type InquiryValidated = z.infer<typeof inquirySchema>;
