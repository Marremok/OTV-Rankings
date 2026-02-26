"use server"

import prisma, { withRetry } from "../prisma"
import { revalidatePath } from "next/cache"
import type { Season, Episode, Series } from "@/generated/prisma/client"

export type SeasonWithEpisodes = Season & { episodes: Episode[] }
export type SeasonDetail = Season & { series: Series; episodes: Episode[] }

export interface CreateSeasonInput {
  seriesId: string
  seasonNumber: number
  name?: string | null
  slug?: string | null
  description?: string | null
  posterUrl?: string | null
  heroImageUrl?: string | null
}

export interface EditSeasonInput {
  id: string
  seriesId: string
  seasonNumber: number
  name?: string | null
  slug?: string | null
  description?: string | null
  posterUrl?: string | null
  heroImageUrl?: string | null
}

/**
 * Creates a new season
 */
export async function createSeason(input: CreateSeasonInput) {
  try {
    if (!input.seriesId) {
      throw new Error("Series is required")
    }

    if (!input.seasonNumber || input.seasonNumber < 1) {
      throw new Error("Season number must be a positive integer")
    }

    const series = await withRetry(() => prisma.series.findUnique({
      where: { id: input.seriesId },
      select: { slug: true },
    }))

    if (!series) {
      throw new Error("Series not found")
    }

    if (input.posterUrl) {
      try { new URL(input.posterUrl) } catch { throw new Error("Please enter a valid poster URL") }
    }

    if (input.heroImageUrl) {
      try { new URL(input.heroImageUrl) } catch { throw new Error("Please enter a valid hero image URL") }
    }

    const baseName = input.name?.trim() || `Season ${input.seasonNumber}`
    const slug = input.slug?.trim() || baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const season = await withRetry(() => prisma.season.create({
      data: {
        id: crypto.randomUUID(),
        seriesId: input.seriesId,
        seasonNumber: input.seasonNumber,
        name: input.name?.trim() || null,
        slug,
        description: input.description?.trim() || null,
        posterUrl: input.posterUrl || null,
        heroImageUrl: input.heroImageUrl || null,
        ranking: 0,
        score: 0,
        updatedAt: new Date(),
      },
    }))

    revalidatePath("/admin")
    if (series.slug) {
      revalidatePath(`/series/${series.slug}`)
    }

    return season
  } catch (error: any) {
    console.error("Error creating season:", error)

    if (error?.code === "P2002") {
      throw new Error("A season with this slug already exists")
    }

    if (
      error.message?.includes("required") ||
      error.message?.includes("valid") ||
      error.message?.includes("not found") ||
      error.message?.includes("already exists") ||
      error.message?.includes("positive")
    ) {
      throw error
    }

    throw new Error("Failed to create season")
  }
}

/**
 * Get all seasons with their series info
 */
export async function getSeasons() {
  try {
    const seasons = await withRetry(() => prisma.season.findMany({
      include: {
        series: { select: { id: true, title: true, slug: true } },
        episodes: true,
      },
      orderBy: { createdAt: "desc" },
      cacheStrategy: { swr: 60, ttl: 30 },
    }))

    return seasons
  } catch (error) {
    console.error("Error fetching seasons:", error)
    throw new Error("Failed to fetch seasons")
  }
}

/**
 * Get seasons by series ID (ordered by season number)
 */
export async function getSeasonsBySeriesId(seriesId: string) {
  try {
    if (!seriesId) {
      throw new Error("Series ID is required")
    }

    const seasons = await withRetry(() => prisma.season.findMany({
      where: { seriesId },
      include: {
        episodes: { orderBy: { episodeNumber: "asc" } },
      },
      orderBy: { seasonNumber: "asc" },
      cacheStrategy: { swr: 120, ttl: 60 },
    }))

    return seasons
  } catch (error: any) {
    console.error("Error fetching seasons by series:", error)

    if (error.message?.includes("required")) throw error

    throw new Error("Failed to fetch seasons")
  }
}

/**
 * Get a single season by ID
 */
export async function getSeasonById(id: string): Promise<SeasonDetail | null> {
  try {
    if (!id) {
      throw new Error("Season ID is required")
    }

    const season = await withRetry(() => prisma.season.findUnique({
      where: { id },
      include: {
        series: true,
        episodes: { orderBy: { episodeNumber: "asc" } },
      },
      cacheStrategy: { swr: 120, ttl: 60 },
    }))

    return season as SeasonDetail | null
  } catch (error: any) {
    console.error("Error fetching season:", error)

    if (error.message?.includes("required")) throw error

    throw new Error("Failed to fetch season")
  }
}

/**
 * Get a single season by slug
 */
export async function getSeasonBySlug(slug: string): Promise<SeasonDetail | null> {
  try {
    if (!slug) {
      throw new Error("Slug is required")
    }

    const season = await withRetry(() => prisma.season.findUnique({
      where: { slug },
      include: {
        series: true,
        episodes: { orderBy: { episodeNumber: "asc" } },
      },
      cacheStrategy: { swr: 120, ttl: 60 },
    }))

    return season as SeasonDetail | null
  } catch (error: any) {
    console.error("Error fetching season by slug:", error)

    if (error.message?.includes("required")) throw error

    throw new Error("Failed to fetch season")
  }
}

/**
 * Updates an existing season
 */
export async function editSeason(input: EditSeasonInput) {
  try {
    if (!input.id) throw new Error("Season ID is required")
    if (!input.seriesId) throw new Error("Series is required")
    if (!input.seasonNumber || input.seasonNumber < 1) {
      throw new Error("Season number must be a positive integer")
    }

    if (input.posterUrl) {
      try { new URL(input.posterUrl) } catch { throw new Error("Please enter a valid poster URL") }
    }

    if (input.heroImageUrl) {
      try { new URL(input.heroImageUrl) } catch { throw new Error("Please enter a valid hero image URL") }
    }

    const series = await withRetry(() => prisma.series.findUnique({
      where: { id: input.seriesId },
      select: { slug: true },
    }))

    if (!series) throw new Error("Series not found")

    const baseName = input.name?.trim() || `Season ${input.seasonNumber}`
    const slug = input.slug?.trim() || baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const season = await withRetry(() => prisma.season.update({
      where: { id: input.id },
      data: {
        seriesId: input.seriesId,
        seasonNumber: input.seasonNumber,
        name: input.name?.trim() || null,
        slug,
        description: input.description?.trim() || null,
        posterUrl: input.posterUrl || null,
        heroImageUrl: input.heroImageUrl || null,
        updatedAt: new Date(),
      },
    }))

    revalidatePath("/admin")
    if (series.slug) {
      revalidatePath(`/series/${series.slug}`)
    }

    return season
  } catch (error: any) {
    console.error("Error updating season:", error)

    if (error?.code === "P2025") throw new Error("Season not found")
    if (error?.code === "P2002") throw new Error("A season with this slug already exists")

    if (
      error.message?.includes("required") ||
      error.message?.includes("valid") ||
      error.message?.includes("not found") ||
      error.message?.includes("already exists") ||
      error.message?.includes("positive")
    ) {
      throw error
    }

    throw new Error("Failed to update season")
  }
}

/**
 * Deletes a season (cascades to episodes)
 */
export async function deleteSeason(id: string) {
  try {
    if (!id) throw new Error("Season ID is required")

    const season = await withRetry(() => prisma.season.findUnique({
      where: { id },
      include: { series: { select: { slug: true } } },
    }))

    if (!season) throw new Error("Season not found")

    await withRetry(() => prisma.season.delete({ where: { id } }))

    revalidatePath("/admin")
    if (season.series?.slug) {
      revalidatePath(`/series/${season.series.slug}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting season:", error)

    if (error?.code === "P2025") throw new Error("Season not found")
    if (error.message?.includes("not found")) throw error

    throw new Error("Failed to delete season")
  }
}

/**
 * Get top seasons ordered by ranking
 */
export async function getTopSeasons(limit: number = 10) {
  try {
    const seasons = await withRetry(() => prisma.season.findMany({
      include: {
        series: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { ranking: "desc" },
      take: limit,
      cacheStrategy: { swr: 60, ttl: 30 },
    }))

    return seasons
  } catch (error) {
    console.error("Error fetching top seasons:", error)
    throw new Error("Failed to fetch top seasons")
  }
}
