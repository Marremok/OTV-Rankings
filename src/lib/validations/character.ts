import { z } from "zod";

// URL validation helper
const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .or(z.literal(""))
  .nullable()
  .optional()
  .transform((val) => (val === "" ? null : val));

// Slug validation — same pattern as series
const slugSchema = z
  .string()
  .max(200, "Slug must be 200 characters or less")
  .regex(/^[a-z0-9-]*$/, "Slug can only contain lowercase letters, numbers, and hyphens")
  .optional();

// Schema for creating a character
export const createCharacterSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less")
    .transform((val) => val.trim()),
  slug: slugSchema,
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .nullable()
    .optional(),
  posterUrl: urlSchema,
  seriesId: z.string().min(1, "Series is required"),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;

// Schema for editing a character
export const editCharacterSchema = createCharacterSchema.extend({
  id: z.string().min(1, "Character ID is required"),
});

export type EditCharacterInput = z.infer<typeof editCharacterSchema>;

// Schema for character ID operations (delete, get by id)
export const characterIdSchema = z.string().min(1, "Character ID is required");

// Schema for series ID lookup
export const charactersBySeriesSchema = z.string().min(1, "Series ID is required");
