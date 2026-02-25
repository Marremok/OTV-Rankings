"use server"

import prisma, { withRetry } from "../prisma"
import { revalidatePath } from "next/cache"
import { mediaType } from "@/generated/prisma/enums"
import type { Pillar, Question, RatingPillar, CharacterRatingPillar } from "@/generated/prisma/client"
import {
  createPillarSchema,
  editPillarSchema,
  createRatingPillarSchema,
  createCharacterRatingPillarSchema,
  safeValidate,
} from "@/lib/validations"

export type PillarWithQuestions = Pillar & { questions: Question[] }
export type RatingPillarWithPillar = RatingPillar & { pillar: Pillar }
export type CharacterRatingPillarWithPillar = CharacterRatingPillar & { pillar: Pillar }

// ============================================
// PILLAR TEMPLATE ACTIONS (Admin)
// ============================================

// Input type for creating a pillar template
export interface CreatePillarInput {
  type: string
  mediaType: mediaType
  icon?: string | null
  description?: string | null
  weight?: number
}

/**
 * Creates a new pillar template (admin only)
 * Pillar templates define what aspects can be rated for a media type
 */
export async function createPillar(input: CreatePillarInput) {
  try {
    // Validate required fields
    if (!input.type || !input.type.trim()) {
      throw new Error("Pillar type is required")
    }
    if (!input.mediaType) {
      throw new Error("Media type is required")
    }

    // Validate weight if provided
    if (input.weight !== undefined && (input.weight < 0 || input.weight > 10)) {
      throw new Error("Weight must be between 0 and 10")
    }

    const pillar = await withRetry(() => prisma.pillar.create({
      data: {
        id: crypto.randomUUID(),
        type: input.type.trim().toLowerCase(),
        mediaType: input.mediaType,
        icon: input.icon || null,
        description: input.description || null,
        weight: input.weight ?? 1.0,
        updatedAt: new Date(),
      },
    }))

    revalidatePath("/admin")

    return pillar
  } catch (error: any) {
    console.error("Error creating pillar:", error)

    // Handle unique constraint violation (duplicate type + mediaType combination)
    if (error?.code === "P2002") {
      throw new Error("A pillar with this type already exists for this media type")
    }

    // Re-throw validation errors
    if (error.message?.includes("required") || error.message?.includes("must be")) {
      throw error
    }

    throw new Error("Failed to create pillar")
  }
}

/**
 * Fetches all pillar templates, optionally filtered by mediaType
 */
export async function getPillars(mediaTypeFilter?: mediaType): Promise<PillarWithQuestions[]> {
  try {
    const pillars = await withRetry(() => prisma.pillar.findMany({
      where: mediaTypeFilter ? { mediaType: mediaTypeFilter } : undefined,
      include: { questions: true },
      orderBy: { createdAt: "asc" },
      cacheStrategy: { swr: 600, ttl: 300 },
    }))

    return pillars as PillarWithQuestions[]
  } catch (error) {
    console.error("Error fetching pillars:", error)
    throw new Error("Failed to fetch pillars")
  }
}

/**
 * Fetches all pillar templates with questions for admin view
 */
export async function getAllPillars(): Promise<PillarWithQuestions[]> {
  try {
    const pillars = await withRetry(() => prisma.pillar.findMany({
      include: {
        questions: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      cacheStrategy: { swr: 600, ttl: 300 },
    }))

    return pillars as PillarWithQuestions[]
  } catch (error) {
    console.error("Error fetching all pillars:", error)
    throw new Error("Failed to fetch pillars")
  }
}

/**
 * Fetches a single pillar by ID with its questions
 */
export async function getPillarById(id: string): Promise<PillarWithQuestions | null> {
  try {
    const pillar = await withRetry(() => prisma.pillar.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { createdAt: "asc" },
        },
      },
      cacheStrategy: { swr: 600, ttl: 300 },
    }))

    return pillar as PillarWithQuestions | null
  } catch (error) {
    console.error("Error fetching pillar:", error)
    throw new Error("Failed to fetch pillar")
  }
}

/**
 * Deletes a pillar template
 */
export async function deletePillar(id: string) {
  try {
    if (!id) {
      throw new Error("Pillar ID is required")
    }

    await withRetry(() => prisma.pillar.delete({
      where: { id },
    }))

    revalidatePath("/admin")

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting pillar:", error)

    if (error?.code === "P2025") {
      throw new Error("Pillar not found")
    }

    throw new Error("Failed to delete pillar")
  }
}

// Input type for editing a pillar template
export interface EditPillarInput {
  id: string
  type: string
  mediaType: mediaType
  icon?: string | null
  description?: string | null
  weight?: number
}

/**
 * Updates an existing pillar template (admin only)
 */
export async function editPillar(input: EditPillarInput) {
  try {
    // Validate required fields
    if (!input.id) {
      throw new Error("Pillar ID is required")
    }
    if (!input.type || !input.type.trim()) {
      throw new Error("Pillar type is required")
    }
    if (!input.mediaType) {
      throw new Error("Media type is required")
    }

    // Validate weight if provided
    if (input.weight !== undefined && (input.weight < 0 || input.weight > 10)) {
      throw new Error("Weight must be between 0 and 10")
    }

    // Check that the pillar exists
    const currentPillar = await withRetry(() => prisma.pillar.findUnique({
      where: { id: input.id },
      select: { type: true, mediaType: true },
    }))

    if (!currentPillar) {
      throw new Error("Pillar not found")
    }

    // If type or mediaType is being changed, check for duplicates within the same mediaType
    const newType = input.type.trim().toLowerCase()
    const newMediaType = input.mediaType
    if (newType !== currentPillar.type || newMediaType !== currentPillar.mediaType) {
      const existingPillar = await withRetry(() => prisma.pillar.findFirst({
        where: { type: newType, mediaType: newMediaType },
        select: { id: true },
      }))

      if (existingPillar && existingPillar.id !== input.id) {
        throw new Error("A pillar with this type already exists for this media type")
      }
    }

    const pillar = await withRetry(() => prisma.pillar.update({
      where: { id: input.id },
      data: {
        type: newType,
        mediaType: input.mediaType,
        icon: input.icon || null,
        description: input.description || null,
        weight: input.weight ?? 1.0,
        updatedAt: new Date(),
      },
    }))

    revalidatePath("/admin")

    return pillar
  } catch (error: any) {
    console.error("Error updating pillar:", error)

    // Handle unique constraint violation (duplicate type + mediaType combination)
    if (error?.code === "P2002") {
      throw new Error("A pillar with this type already exists for this media type")
    }

    if (error?.code === "P2025") {
      throw new Error("Pillar not found")
    }

    // Re-throw validation errors
    if (
      error.message?.includes("required") ||
      error.message?.includes("must be") ||
      error.message?.includes("already exists") ||
      error.message?.includes("not found")
    ) {
      throw error
    }

    throw new Error("Failed to update pillar")
  }
}


// ============================================
// RATING PILLAR ACTIONS (User ratings)
// ============================================

// Input type for creating a user's rating pillar
export interface CreateRatingPillarInput {
  userId: string
  seriesId: string
  pillarId: string
  finalScore: number // Already weighted & averaged from quiz answers
}

/**
 * Creates or updates a user's rating for a specific pillar on a series
 * Uses upsert to handle both new ratings and updates
 */
export async function createRatingPillar(input: CreateRatingPillarInput) {
  try {
    // Validate input using Zod schema
    const validation = safeValidate(createRatingPillarSchema, input)
    if (!validation.success) {
      throw new Error(validation.error)
    }
    const validatedInput = validation.data

    // Verify pillar exists
    const pillar = await withRetry(() => prisma.pillar.findUnique({
      where: { id: validatedInput.pillarId },
    }))
    if (!pillar) {
      throw new Error("Pillar not found")
    }

    // Verify series exists
    const series = await withRetry(() => prisma.series.findUnique({
      where: { id: validatedInput.seriesId },
    }))
    if (!series) {
      throw new Error("Series not found")
    }

    // Round score to 2 decimal places
    const roundedScore = Math.round(validatedInput.finalScore * 100) / 100

    // Upsert the rating pillar (create or update if exists)
    const ratingPillar = await withRetry(() => prisma.ratingPillar.upsert({
      where: {
        userId_seriesId_pillarId: {
          userId: validatedInput.userId,
          seriesId: validatedInput.seriesId,
          pillarId: validatedInput.pillarId,
        },
      },
      create: {
        id: crypto.randomUUID(),
        userId: validatedInput.userId,
        seriesId: validatedInput.seriesId,
        pillarId: validatedInput.pillarId,
        score: roundedScore,
        updatedAt: new Date(),
      },
      update: {
        score: roundedScore,
        updatedAt: new Date(),
      },
    }))

    // NOTE: Series scores are NOT updated immediately.
    // They are recalculated periodically via:
    //   - Development: npx tsx scripts/update-scores.ts
    //   - Production: Cron job calling /api/cron/update-scores
    // This avoids O(n) aggregation on every rating submission.

    // Auto-mark series as seen when any pillar is rated
    await withRetry(() => prisma.userSeriesStatus.upsert({
      where: {
        userId_seriesId: {
          userId: validatedInput.userId,
          seriesId: validatedInput.seriesId,
        },
      },
      create: {
        userId: validatedInput.userId,
        seriesId: validatedInput.seriesId,
        isSeen: true,
        isWatchlist: false,
        isWatching: false,
        isFavorite: false,
      },
      update: {
        isSeen: true,
        isWatchlist: false,
        isWatching: false,
      },
    }))

    return ratingPillar
  } catch (error: any) {
    console.error("Error creating rating pillar:", error)

    // Re-throw validation errors
    if (
      error.message?.includes("required") ||
      error.message?.includes("must be") ||
      error.message?.includes("not found")
    ) {
      throw error
    }

    throw new Error("Failed to save rating")
  }
}

/**
 * Fetches all rating pillars for a user on a specific series
 * Returns the user's existing ratings to display in the UI
 */
export async function getUserRatingPillars(userId: string, seriesId: string): Promise<RatingPillarWithPillar[]> {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }
    if (!seriesId) {
      throw new Error("Series ID is required")
    }

    const ratingPillars = await withRetry(() => prisma.ratingPillar.findMany({
      where: {
        userId,
        seriesId,
      },
      include: {
        pillar: true, // Include pillar template info
      },
      orderBy: {
        createdAt: "asc",
      },
    }))

    return ratingPillars as RatingPillarWithPillar[]
  } catch (error) {
    console.error("Error fetching user rating pillars:", error)
    throw new Error("Failed to fetch user ratings")
  }
}

/**
 * Fetches all rating pillars for a user across multiple series
 * Returns a map of seriesId -> user ratings for efficient lookup
 */
export async function getUserRatingsForMultipleSeries(userId: string, seriesIds: string[]): Promise<Record<string, RatingPillarWithPillar[]>> {
  try {
    if (!userId) {
      return {}
    }
    if (!seriesIds.length) {
      return {}
    }

    const ratingPillars = await withRetry(() => prisma.ratingPillar.findMany({
      where: {
        userId,
        seriesId: { in: seriesIds },
      },
      include: {
        pillar: true,
      },
    }))

    // Group by seriesId
    const ratingsMap: Record<string, typeof ratingPillars> = {}
    for (const rating of ratingPillars) {
      if (!ratingsMap[rating.seriesId]) {
        ratingsMap[rating.seriesId] = []
      }
      ratingsMap[rating.seriesId].push(rating)
    }

    return ratingsMap as Record<string, RatingPillarWithPillar[]>
  } catch (error) {
    console.error("Error fetching user ratings for multiple series:", error)
    return {}
  }
}

// ============================================
// CHARACTER RATING PILLAR ACTIONS (User ratings for characters)
// ============================================

export interface CreateCharacterRatingPillarInput {
  userId:      string
  characterId: string
  pillarId:    string
  finalScore:  number
}

/**
 * Creates or updates a user's rating for a specific pillar on a character.
 * Mirrors createRatingPillar exactly but uses characterId instead of seriesId.
 */
export async function createCharacterRatingPillar(input: CreateCharacterRatingPillarInput) {
  try {
    const validation = safeValidate(createCharacterRatingPillarSchema, input)
    if (!validation.success) throw new Error(validation.error)
    const v = validation.data

    const pillar = await withRetry(() => prisma.pillar.findUnique({ where: { id: v.pillarId } }))
    if (!pillar) throw new Error("Pillar not found")

    const character = await withRetry(() => prisma.character.findUnique({ where: { id: v.characterId } }))
    if (!character) throw new Error("Character not found")

    const roundedScore = Math.round(v.finalScore * 100) / 100

    const ratingPillar = await withRetry(() => prisma.characterRatingPillar.upsert({
      where: {
        userId_characterId_pillarId: {
          userId:      v.userId,
          characterId: v.characterId,
          pillarId:    v.pillarId,
        },
      },
      create: {
        id:          crypto.randomUUID(),
        userId:      v.userId,
        characterId: v.characterId,
        pillarId:    v.pillarId,
        score:       roundedScore,
        updatedAt:   new Date(),
      },
      update: {
        score:     roundedScore,
        updatedAt: new Date(),
      },
    }))

    return ratingPillar
  } catch (error: any) {
    console.error("Error creating character rating pillar:", error)
    if (error.message?.includes("required") || error.message?.includes("not found")) throw error
    throw new Error("Failed to save character rating")
  }
}

/**
 * Fetches all rating pillars for a user on a specific character.
 * Mirrors getUserRatingPillars.
 */
export async function getUserCharacterRatingPillars(userId: string, characterId: string): Promise<CharacterRatingPillarWithPillar[]> {
  try {
    if (!userId)      throw new Error("User ID is required")
    if (!characterId) throw new Error("Character ID is required")

    return await withRetry(() => prisma.characterRatingPillar.findMany({
      where:   { userId, characterId },
      include: { pillar: true },
      orderBy: { createdAt: "asc" },
    })) as CharacterRatingPillarWithPillar[]
  } catch (error) {
    console.error("Error fetching user character rating pillars:", error)
    throw new Error("Failed to fetch user character ratings")
  }
}

/**
 * Fetches all character rating pillars for a user across multiple characters.
 * Returns a map of characterId -> user ratings for efficient lookup.
 * Mirrors getUserRatingsForMultipleSeries.
 */
export async function getUserRatingsForMultipleCharacters(userId: string, characterIds: string[]): Promise<Record<string, CharacterRatingPillarWithPillar[]>> {
  try {
    if (!userId) return {}
    if (!characterIds.length) return {}

    const ratingPillars = await withRetry(() => prisma.characterRatingPillar.findMany({
      where: {
        userId,
        characterId: { in: characterIds },
      },
      include: {
        pillar: true,
      },
    }))

    // Group by characterId
    const ratingsMap: Record<string, typeof ratingPillars> = {}
    for (const rating of ratingPillars) {
      if (!ratingsMap[rating.characterId]) {
        ratingsMap[rating.characterId] = []
      }
      ratingsMap[rating.characterId].push(rating)
    }

    return ratingsMap as Record<string, CharacterRatingPillarWithPillar[]>
  } catch (error) {
    console.error("Error fetching user ratings for multiple characters:", error)
    return {}
  }
}

/**
 * Gets the total count of pillars for a specific media type
 */
export async function getPillarCount(mediaTypeFilter: mediaType) {
  try {
    const count = await withRetry(() => prisma.pillar.count({
      where: { mediaType: mediaTypeFilter },
      cacheStrategy: { swr: 300, ttl: 120 },
    }))
    return count
  } catch (error) {
    console.error("Error getting pillar count:", error)
    return 0
  }
}
