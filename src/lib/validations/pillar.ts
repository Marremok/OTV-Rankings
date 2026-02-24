import { z } from "zod";

// Media type enum matching Prisma
export const mediaTypeSchema = z.enum(["SERIES", "CHARACTER", "EPISODE", "SEASON"]);

// Schema for creating a pillar template (admin)
export const createPillarSchema = z.object({
  type: z
    .string()
    .min(1, "Pillar type is required")
    .max(50, "Pillar type must be 50 characters or less")
    .transform((val) => val.trim().toLowerCase()),
  mediaType: mediaTypeSchema,
  icon: z.string().nullable().optional(),
  description: z.string().max(500, "Description must be 500 characters or less").nullable().optional(),
  weight: z
    .number()
    .min(0, "Weight must be at least 0")
    .max(10, "Weight must be 10 or less")
    .optional()
    .default(1.0),
});

export type CreatePillarInput = z.infer<typeof createPillarSchema>;

// Schema for editing a pillar template (admin)
export const editPillarSchema = createPillarSchema.extend({
  id: z.string().min(1, "Pillar ID is required"),
});

export type EditPillarInput = z.infer<typeof editPillarSchema>;

// Schema for creating a user's rating
export const createRatingPillarSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  seriesId: z.string().min(1, "Series ID is required"),
  pillarId: z.string().min(1, "Pillar ID is required"),
  finalScore: z
    .number()
    .min(0, "Score must be at least 0")
    .max(10, "Score must be 10 or less"),
});

export type CreateRatingPillarInput = z.infer<typeof createRatingPillarSchema>;

// Schema for getting user rating pillars
export const getUserRatingPillarsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  seriesId: z.string().min(1, "Series ID is required"),
});

// Schema for pillar ID operations (delete, get by id)
export const pillarIdSchema = z.string().min(1, "Pillar ID is required");

// Schema for creating a user's CHARACTER rating
export const createCharacterRatingPillarSchema = z.object({
  userId:      z.string().min(1, "User ID is required"),
  characterId: z.string().min(1, "Character ID is required"),
  pillarId:    z.string().min(1, "Pillar ID is required"),
  finalScore:  z.number().min(0, "Score must be at least 0").max(10, "Score must be 10 or less"),
});

export type CreateCharacterRatingPillarInput = z.infer<typeof createCharacterRatingPillarSchema>;
