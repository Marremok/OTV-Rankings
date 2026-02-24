import { z } from "zod";

// URL validation helper
const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .or(z.literal(""))
  .nullable()
  .optional()
  .transform((val) => (val === "" ? null : val));

// Current year for validation
const currentYear = new Date().getFullYear();

// Schema for creating a series
export const createSeriesSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .transform((val) => val.trim()),
  description: z.string().max(2000, "Description must be 2000 characters or less").nullable().optional(),
  releaseYear: z
    .number()
    .int("Year must be a whole number")
    .min(1900, "Year must be 1900 or later")
    .max(currentYear + 1, `Year must be ${currentYear + 1} or earlier`)
    .nullable()
    .optional(),
  imageUrl: urlSchema,
  wideImageUrl: urlSchema,
  slug: z
    .string()
    .max(200, "Slug must be 200 characters or less")
    .regex(/^[a-z0-9-]*$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val?.trim())),
  genre: z.array(z.string()).optional().default([]),
  seasons: z
    .number()
    .int("Seasons must be a whole number")
    .min(1, "Seasons must be at least 1")
    .nullable()
    .optional(),
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;

// Schema for editing a series
export const editSeriesSchema = createSeriesSchema.extend({
  id: z.string().min(1, "Series ID is required"),
});

export type EditSeriesInput = z.infer<typeof editSeriesSchema>;

// Schema for series ID operations (delete, get by id)
export const seriesIdSchema = z.string().min(1, "Series ID is required");

// Schema for slug lookup
export const seriesSlugSchema = z.string().min(1, "Series slug is required");
