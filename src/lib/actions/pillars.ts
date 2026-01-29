"use server"

import prisma from "../prisma"
import { revalidatePath } from "next/cache"
import { mediaType } from "@/generated/prisma/enums"

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

    const pillar = await prisma.pillar.create({
      data: {
        id: crypto.randomUUID(),
        type: input.type.trim().toLowerCase(),
        mediaType: input.mediaType,
        icon: input.icon || null,
        description: input.description || null,
        weight: input.weight ?? 1.0,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin")

    return pillar
  } catch (error: any) {
    console.error("Error creating pillar:", error)

    // Handle unique constraint violation (duplicate type)
    if (error?.code === "P2002") {
      throw new Error("A pillar with this type already exists")
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
export async function getPillars(mediaTypeFilter?: mediaType) {
  try {
    const pillars = await prisma.pillar.findMany({
      where: mediaTypeFilter ? { mediaType: mediaTypeFilter } : undefined,
      include: { questions: true },
      orderBy: { createdAt: "asc" },
    })

    return pillars
  } catch (error) {
    console.error("Error fetching pillars:", error)
    throw new Error("Failed to fetch pillars")
  }
}

/**
 * Fetches all pillar templates with questions for admin view
 */
export async function getAllPillars() {
  try {
    const pillars = await prisma.pillar.findMany({
      include: {
        questions: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return pillars
  } catch (error) {
    console.error("Error fetching all pillars:", error)
    throw new Error("Failed to fetch pillars")
  }
}

/**
 * Fetches a single pillar by ID with its questions
 */
export async function getPillarById(id: string) {
  try {
    const pillar = await prisma.pillar.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    return pillar
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

    await prisma.pillar.delete({
      where: { id },
    })

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
    // Validate required fields
    if (!input.userId) {
      throw new Error("User ID is required")
    }
    if (!input.seriesId) {
      throw new Error("Series ID is required")
    }
    if (!input.pillarId) {
      throw new Error("Pillar ID is required")
    }
    if (input.finalScore === undefined || input.finalScore === null) {
      throw new Error("Final score is required")
    }

    // Validate score range
    if (input.finalScore < 0 || input.finalScore > 10) {
      throw new Error("Score must be between 0 and 10")
    }

    // Verify pillar exists
    const pillar = await prisma.pillar.findUnique({
      where: { id: input.pillarId },
    })
    if (!pillar) {
      throw new Error("Pillar not found")
    }

    // Verify series exists
    const series = await prisma.series.findUnique({
      where: { id: input.seriesId },
    })
    if (!series) {
      throw new Error("Series not found")
    }

    // Upsert the rating pillar (create or update if exists)
    const ratingPillar = await prisma.ratingPillar.upsert({
      where: {
        userId_seriesId_pillarId: {
          userId: input.userId,
          seriesId: input.seriesId,
          pillarId: input.pillarId,
        },
      },
      create: {
        id: crypto.randomUUID(),
        userId: input.userId,
        seriesId: input.seriesId,
        pillarId: input.pillarId,
        score: Math.round(input.finalScore * 10) / 10, // Round to 1 decimal
        updatedAt: new Date(),
      },
      update: {
        score: Math.round(input.finalScore * 10) / 10, // Round to 1 decimal
        updatedAt: new Date(),
      },
    })

    // Revalidate relevant paths
    revalidatePath(`/series/${series.slug}`)

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
export async function getUserRatingPillars(userId: string, seriesId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }
    if (!seriesId) {
      throw new Error("Series ID is required")
    }

    const ratingPillars = await prisma.ratingPillar.findMany({
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
    })

    return ratingPillars
  } catch (error) {
    console.error("Error fetching user rating pillars:", error)
    throw new Error("Failed to fetch user ratings")
  }
}