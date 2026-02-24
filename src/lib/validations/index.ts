// Pillar validations
export {
  mediaTypeSchema,
  createPillarSchema,
  editPillarSchema,
  createRatingPillarSchema,
  getUserRatingPillarsSchema,
  pillarIdSchema,
  createCharacterRatingPillarSchema,
  type CreatePillarInput,
  type EditPillarInput,
  type CreateRatingPillarInput,
  type CreateCharacterRatingPillarInput,
} from "./pillar";

// Series validations
export {
  createSeriesSchema,
  editSeriesSchema,
  seriesIdSchema,
  seriesSlugSchema,
  type CreateSeriesInput,
  type EditSeriesInput,
} from "./series";

// Donation validations
export {
  donationAmountSchema,
  createCheckoutSchema,
  webhookEventSchema,
  type CreateCheckoutInput,
} from "./donation";

// Helper for parsing and handling validation errors
import { z } from "zod";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Safely parses input with a Zod schema and returns a typed result.
 * Extracts the first error message for user-friendly display.
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Get the first error message (Zod 4 uses 'issues' not 'errors')
  const firstError = result.error.issues[0];
  const errorMessage = firstError?.message || "Validation failed";

  return { success: false, error: errorMessage };
}
