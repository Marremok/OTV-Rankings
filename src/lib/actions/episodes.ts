"use server"

import prisma, { withRetry } from "../prisma"
import { revalidatePath } from "next/cache"
import type { Episode, Season, Series } from "@/generated/prisma/client"

export type EpisodeWithSeason = Episode & { season: Season & { series: Pick<Series, "id" | "title" | "slug"> } }
export type EpisodeDetail = Episode & { season: Season & { series: Series } }

export interface CreateEpisodeInput {
  seasonId: string
  seriesId: string
  episodeNumber: number
  title: string
  slug?: string | null
  description?: string | null
  heroImageUrl?: string | null
}

export interface EditEpisodeInput {
  id: string
  seasonId: string
  seriesId: string
  episodeNumber: number
  title: string
  slug?: string | null
  description?: string | null
  heroImageUrl?: string | null
}

/**
 * Creates a new episode
 */
export async function createEpisode(input: CreateEpisodeInput) {
  try {
    if (!input.seasonId) throw new Error("Season is required")
    if (!input.seriesId) throw new Error("Series is required")
    if (!input.title || !input.title.trim()) throw new Error("Title is required")
    if (!input.episodeNumber || input.episodeNumber < 1) {
      throw new Error("Episode number must be a positive integer")
    }

    const season = await withRetry(() => prisma.season.findUnique({
      where: { id: input.seasonId },
      include: { series: { select: { slug: true } } },
    }))

    if (!season) throw new Error("Season not found")

    if (input.heroImageUrl) {
      try { new URL(input.heroImageUrl) } catch { throw new Error("Please enter a valid hero image URL") }
    }

    const slug = input.slug?.trim() || input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const episode = await withRetry(() => prisma.episode.create({
      data: {
        id: crypto.randomUUID(),
        seasonId: input.seasonId,
        seriesId: input.seriesId,
        episodeNumber: input.episodeNumber,
        title: input.title.trim(),
        slug,
        description: input.description?.trim() || null,
        heroImageUrl: input.heroImageUrl || null,
        ranking: 0,
        score: 0,
        updatedAt: new Date(),
      },
    }))

    revalidatePath("/admin")
    if (season.series?.slug) {
      revalidatePath(`/series/${season.series.slug}`)
    }

    return episode
  } catch (error: any) {
    console.error("Error creating episode:", error)

    if (error?.code === "P2002") throw new Error("An episode with this slug already exists")

    if (
      error.message?.includes("required") ||
      error.message?.includes("valid") ||
      error.message?.includes("not found") ||
      error.message?.includes("already exists") ||
      error.message?.includes("positive")
    ) {
      throw error
    }

    throw new Error("Failed to create episode")
  }
}

/**
 * Get all episodes with their season and series info
 */
export async function getEpisodes(): Promise<EpisodeWithSeason[]> {
  try {
    const episodes = await withRetry(() => prisma.episode.findMany({
      include: {
        season: {
          include: { series: { select: { id: true, title: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      cacheStrategy: { swr: 60, ttl: 30 },
    }))

    return episodes as EpisodeWithSeason[]
  } catch (error) {
    console.error("Error fetching episodes:", error)
    throw new Error("Failed to fetch episodes")
  }
}

/**
 * Get episodes by season ID
 */
export async function getEpisodesBySeasonId(seasonId: string) {
  try {
    if (!seasonId) throw new Error("Season ID is required")

    const episodes = await withRetry(() => prisma.episode.findMany({
      where: { seasonId },
      orderBy: { episodeNumber: "asc" },
      cacheStrategy: { swr: 120, ttl: 60 },
    }))

    return episodes
  } catch (error: any) {
    console.error("Error fetching episodes by season:", error)

    if (error.message?.includes("required")) throw error

    throw new Error("Failed to fetch episodes")
  }
}

/**
 * Get episodes by series ID
 */
export async function getEpisodesBySeriesId(seriesId: string) {
  try {
    if (!seriesId) throw new Error("Series ID is required")

    const episodes = await withRetry(() => prisma.episode.findMany({
      where: { seriesId },
      include: { season: { select: { id: true, seasonNumber: true, name: true } } },
      orderBy: [{ season: { seasonNumber: "asc" } }, { episodeNumber: "asc" }],
      cacheStrategy: { swr: 120, ttl: 60 },
    }))

    return episodes
  } catch (error: any) {
    console.error("Error fetching episodes by series:", error)

    if (error.message?.includes("required")) throw error

    throw new Error("Failed to fetch episodes")
  }
}

/**
 * Get a single episode by ID
 */
export async function getEpisodeById(id: string): Promise<EpisodeDetail | null> {
  try {
    if (!id) throw new Error("Episode ID is required")

    const episode = await withRetry(() => prisma.episode.findUnique({
      where: { id },
      include: {
        season: { include: { series: true } },
      },
      cacheStrategy: { swr: 120, ttl: 60 },
    }))

    return episode as EpisodeDetail | null
  } catch (error: any) {
    console.error("Error fetching episode:", error)

    if (error.message?.includes("required")) throw error

    throw new Error("Failed to fetch episode")
  }
}

/**
 * Get a single episode by slug
 */
export async function getEpisodeBySlug(slug: string): Promise<EpisodeDetail | null> {
  try {
    if (!slug) throw new Error("Slug is required")

    const episode = await withRetry(() => prisma.episode.findUnique({
      where: { slug },
      include: {
        season: { include: { series: true } },
      },
      cacheStrategy: { swr: 120, ttl: 60 },
    }))

    return episode as EpisodeDetail | null
  } catch (error: any) {
    console.error("Error fetching episode by slug:", error)

    if (error.message?.includes("required")) throw error

    throw new Error("Failed to fetch episode")
  }
}

/**
 * Updates an existing episode
 */
export async function editEpisode(input: EditEpisodeInput) {
  try {
    if (!input.id) throw new Error("Episode ID is required")
    if (!input.seasonId) throw new Error("Season is required")
    if (!input.title || !input.title.trim()) throw new Error("Title is required")
    if (!input.episodeNumber || input.episodeNumber < 1) {
      throw new Error("Episode number must be a positive integer")
    }

    if (input.heroImageUrl) {
      try { new URL(input.heroImageUrl) } catch { throw new Error("Please enter a valid hero image URL") }
    }

    const season = await withRetry(() => prisma.season.findUnique({
      where: { id: input.seasonId },
      include: { series: { select: { slug: true } } },
    }))

    if (!season) throw new Error("Season not found")

    const slug = input.slug?.trim() || input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const episode = await withRetry(() => prisma.episode.update({
      where: { id: input.id },
      data: {
        seasonId: input.seasonId,
        seriesId: input.seriesId,
        episodeNumber: input.episodeNumber,
        title: input.title.trim(),
        slug,
        description: input.description?.trim() || null,
        heroImageUrl: input.heroImageUrl || null,
        updatedAt: new Date(),
      },
    }))

    revalidatePath("/admin")
    if (season.series?.slug) {
      revalidatePath(`/series/${season.series.slug}`)
    }

    return episode
  } catch (error: any) {
    console.error("Error updating episode:", error)

    if (error?.code === "P2025") throw new Error("Episode not found")
    if (error?.code === "P2002") throw new Error("An episode with this slug already exists")

    if (
      error.message?.includes("required") ||
      error.message?.includes("valid") ||
      error.message?.includes("not found") ||
      error.message?.includes("already exists") ||
      error.message?.includes("positive")
    ) {
      throw error
    }

    throw new Error("Failed to update episode")
  }
}

/**
 * Deletes an episode
 */
export async function deleteEpisode(id: string) {
  try {
    if (!id) throw new Error("Episode ID is required")

    const episode = await withRetry(() => prisma.episode.findUnique({
      where: { id },
      include: {
        season: { include: { series: { select: { slug: true } } } },
      },
    }))

    if (!episode) throw new Error("Episode not found")

    await withRetry(() => prisma.episode.delete({ where: { id } }))

    revalidatePath("/admin")
    if (episode.season?.series?.slug) {
      revalidatePath(`/series/${episode.season.series.slug}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting episode:", error)

    if (error?.code === "P2025") throw new Error("Episode not found")
    if (error.message?.includes("not found")) throw error

    throw new Error("Failed to delete episode")
  }
}

/**
 * Get top episodes ordered by ranking
 */
export async function getTopEpisodes(limit: number = 10): Promise<EpisodeWithSeason[]> {
  try {
    const episodes = await withRetry(() => prisma.episode.findMany({
      include: {
        season: {
          include: { series: { select: { id: true, title: true, slug: true } } },
        },
      },
      orderBy: { ranking: "desc" },
      take: limit,
      cacheStrategy: { swr: 60, ttl: 30 },
    }))

    return episodes as EpisodeWithSeason[]
  } catch (error) {
    console.error("Error fetching top episodes:", error)
    throw new Error("Failed to fetch top episodes")
  }
}
