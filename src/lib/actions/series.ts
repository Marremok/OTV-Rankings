"use server"

import prisma from "../prisma"
import { revalidatePath } from "next/cache"

// Input type for creating a series
export interface CreateSeriesInput {
  title: string
  description?: string | null
  releaseYear?: number | null
  imageUrl?: string | null
  wideImageUrl?: string | null
  slug?: string | null
  genre?: string[]
  seasons?: number | null
}

/**
 * Creates a new TV series
 * Score is initialized to 0 and ranking to 0
 */
export async function createSeries(input: CreateSeriesInput) {
  try {
    // Validate required fields
    if (!input.title || !input.title.trim()) {
      throw new Error("Title is required")
    }

    // Validate releaseYear if provided
    if (input.releaseYear !== undefined && input.releaseYear !== null) {
      const currentYear = new Date().getFullYear()
      if (input.releaseYear < 1900 || input.releaseYear > currentYear + 1) {
        throw new Error(`Year must be between 1900 and ${currentYear + 1}`)
      }
    }

    // Validate seasons if provided
    if (input.seasons !== undefined && input.seasons !== null && input.seasons < 1) {
      throw new Error("Seasons must be at least 1")
    }

    // Validate URLs if provided
    if (input.imageUrl) {
      try {
        new URL(input.imageUrl)
      } catch {
        throw new Error("Please enter a valid poster image URL")
      }
    }

    if (input.wideImageUrl) {
      try {
        new URL(input.wideImageUrl)
      } catch {
        throw new Error("Please enter a valid wide image URL")
      }
    }

    // Generate slug from title if not provided
    const slug = input.slug?.trim() || input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const series = await prisma.series.create({
      data: {
        id: crypto.randomUUID(),
        title: input.title.trim(),
        description: input.description || null,
        releaseYear: input.releaseYear || null,
        imageUrl: input.imageUrl || null,
        wideImageUrl: input.wideImageUrl || null,
        slug,
        genre: input.genre || [],
        seasons: input.seasons || null,
        score: 0, // Default score
        ranking: 0, // Default ranking
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin")

    return series
  } catch (error: any) {
    console.error("Error creating series:", error)

    // Handle unique constraint violation (duplicate slug)
    if (error?.code === "P2002") {
      throw new Error("A series with this slug already exists")
    }

    // Re-throw validation errors
    if (error.message?.includes("required") ||
        error.message?.includes("valid") ||
        error.message?.includes("must be")) {
      throw error
    }

    throw new Error("Failed to create series")
  }
}

export async function getSeries() {
  try {
    const series = await prisma.series.findMany({
      include: { ratingPillars: true },
      orderBy: { createdAt: "asc" },
    })

    return series
  } catch (error) {
    console.error("Error fetching series:", error)
    throw new Error("Failed to fetch series")
  }
}

export async function getTop10Series() {
  try {
    const series = await prisma.series.findMany({
      include: { ratingPillars: true },
      orderBy: { score: "desc" },
      take: 10,
    })

    return series
  } catch (error) {
    console.error("Error fetching top 10 series:", error)
    throw new Error("Failed to fetch top 10 series")
  }
}

export async function getTop100Series() {
  try {
    const series = await prisma.series.findMany({
      include: { ratingPillars: true },
      orderBy: { score: "desc" },
      take: 100,
    })

    return series
  } catch (error) {
    console.error("Error fetching top 100 series:", error)
    throw new Error("Failed to fetch top 100 series")
  }
}

export async function getSeriesBySlug(slug: string) {
  try {
    const series = await prisma.series.findUnique({
      where: { slug },
      include: {
        ratingPillars: {
          include: {
            pillar: true, // Include the pillar template info
          },
        },
      },
    })

    return series
  } catch (error) {
    console.error("Error fetching series by slug:", error)
    throw new Error("Failed to fetch series")
  }
}
