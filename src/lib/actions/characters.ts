"use server"

import prisma from "../prisma"
import { revalidatePath } from "next/cache"
import type { Character, Series } from "@/generated/prisma/client"

type CharacterWithSeries = Character & { series: Pick<Series, "id" | "title" | "slug"> }

// Input type for creating a character
export interface CreateCharacterInput {
  name: string
  slug?: string | null
  actorName?: string | null
  description?: string | null
  posterUrl?: string | null
  seriesId: string
}

/**
 * Creates a new character
 * Ranking is initialized to 0
 */
export async function createCharacter(input: CreateCharacterInput) {
  try {
    // Validate required fields
    if (!input.name || !input.name.trim()) {
      throw new Error("Name is required")
    }

    if (!input.seriesId) {
      throw new Error("Series is required")
    }

    // Verify series exists and get slug for revalidation
    const series = await prisma.series.findUnique({
      where: { id: input.seriesId },
      select: { slug: true },
    })

    if (!series) {
      throw new Error("Series not found")
    }

    // Validate URL if provided
    if (input.posterUrl) {
      try {
        new URL(input.posterUrl)
      } catch {
        throw new Error("Please enter a valid poster URL")
      }
    }

    // Auto-generate slug from name if not provided (same pattern as Series)
    const slug = input.slug?.trim() || input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const character = await prisma.character.create({
      data: {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        slug,
        actorName: input.actorName || null,
        description: input.description || null,
        posterUrl: input.posterUrl || null,
        seriesId: input.seriesId,
        ranking: 0,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin")
    revalidatePath("/rankings/characters")
    if (series.slug) {
      revalidatePath(`/series/${series.slug}`)
    }

    return character
  } catch (error: any) {
    console.error("Error creating character:", error)

    if (error?.code === "P2002") {
      throw new Error("A character with this slug already exists")
    }

    // Re-throw validation errors
    if (
      error.message?.includes("required") ||
      error.message?.includes("valid") ||
      error.message?.includes("not found") ||
      error.message?.includes("already exists")
    ) {
      throw error
    }

    throw new Error("Failed to create character")
  }
}

/**
 * Get all characters with their series info
 */
export async function getCharacters() {
  try {
    const characters = await prisma.character.findMany({
      include: {
        series: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      cacheStrategy: { swr: 60, ttl: 30 },
    })

    return characters
  } catch (error) {
    console.error("Error fetching characters:", error)
    throw new Error("Failed to fetch characters")
  }
}

/**
 * Get characters by series ID
 */
export async function getCharactersBySeriesId(seriesId: string) {
  try {
    if (!seriesId) {
      throw new Error("Series ID is required")
    }

    const characters = await prisma.character.findMany({
      where: { seriesId },
      orderBy: { ranking: "desc" },
      cacheStrategy: { swr: 120, ttl: 60 },
    })

    return characters
  } catch (error: any) {
    console.error("Error fetching characters:", error)

    if (error.message?.includes("required")) {
      throw error
    }

    throw new Error("Failed to fetch characters")
  }
}

/**
 * Get a single character by ID
 */
export async function getCharacterById(id: string) {
  try {
    if (!id) {
      throw new Error("Character ID is required")
    }

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        series: true,
      },
      cacheStrategy: { swr: 120, ttl: 60 },
    })

    return character
  } catch (error: any) {
    console.error("Error fetching character:", error)

    if (error.message?.includes("required")) {
      throw error
    }

    throw new Error("Failed to fetch character")
  }
}

// Input type for editing a character
export interface EditCharacterInput {
  id: string
  name: string
  slug?: string | null
  actorName?: string | null
  description?: string | null
  posterUrl?: string | null
  seriesId: string
}

/**
 * Updates an existing character (admin only)
 */
export async function editCharacter(input: EditCharacterInput) {
  try {
    // Validate required fields
    if (!input.id) {
      throw new Error("Character ID is required")
    }

    if (!input.name || !input.name.trim()) {
      throw new Error("Name is required")
    }

    if (!input.seriesId) {
      throw new Error("Series is required")
    }

    // Validate URL if provided
    if (input.posterUrl) {
      try {
        new URL(input.posterUrl)
      } catch {
        throw new Error("Please enter a valid poster URL")
      }
    }

    // Verify series exists
    const series = await prisma.series.findUnique({
      where: { id: input.seriesId },
      select: { slug: true },
    })

    if (!series) {
      throw new Error("Series not found")
    }

    // Resolve slug: use provided value, or auto-generate from name
    const slug = input.slug?.trim() || input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const character = await prisma.character.update({
      where: { id: input.id },
      data: {
        name: input.name.trim(),
        slug,
        actorName: input.actorName || null,
        description: input.description || null,
        posterUrl: input.posterUrl || null,
        seriesId: input.seriesId,
        updatedAt: new Date(),
      },
      include: {
        series: {
          select: { slug: true },
        },
      },
    })

    revalidatePath("/admin")
    revalidatePath("/rankings/characters")
    if (character.series?.slug) {
      revalidatePath(`/series/${character.series.slug}`)
    }

    return character
  } catch (error: any) {
    console.error("Error updating character:", error)

    if (error?.code === "P2025") {
      throw new Error("Character not found")
    }

    if (error?.code === "P2002") {
      throw new Error("A character with this slug already exists")
    }

    // Re-throw validation errors
    if (
      error.message?.includes("required") ||
      error.message?.includes("valid") ||
      error.message?.includes("not found") ||
      error.message?.includes("already exists")
    ) {
      throw error
    }

    throw new Error("Failed to update character")
  }
}

/**
 * Get top characters ordered by ranking (used for ranking pages)
 */
export async function getTopCharacters(limit: number = 10): Promise<CharacterWithSeries[]> {
  try {
    const characters = await prisma.character.findMany({
      include: {
        series: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { ranking: "desc" },
      take: limit,
      cacheStrategy: { swr: 60, ttl: 30 },
    })

    return characters as CharacterWithSeries[]
  } catch (error) {
    console.error("Error fetching top characters:", error)
    throw new Error("Failed to fetch top characters")
  }
}

/**
 * Get a single character by slug
 */
export async function getCharacterBySlug(slug: string) {
  try {
    if (!slug) {
      throw new Error("Slug is required")
    }

    const character = await prisma.character.findUnique({
      where: { slug },
      include: {
        series: true,
      },
      cacheStrategy: { swr: 120, ttl: 60 },
    })

    return character
  } catch (error: any) {
    console.error("Error fetching character by slug:", error)

    if (error.message?.includes("required")) {
      throw error
    }

    throw new Error("Failed to fetch character")
  }
}

/**
 * Deletes a character
 */
export async function deleteCharacter(id: string) {
  try {
    if (!id) {
      throw new Error("Character ID is required")
    }

    // Get character with series info before deletion for revalidation
    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        series: {
          select: { slug: true },
        },
      },
    })

    if (!character) {
      throw new Error("Character not found")
    }

    await prisma.character.delete({
      where: { id },
    })

    revalidatePath("/admin")
    if (character.series?.slug) {
      revalidatePath(`/series/${character.series.slug}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting character:", error)

    if (error?.code === "P2025") {
      throw new Error("Character not found")
    }

    if (error.message?.includes("not found")) {
      throw error
    }

    throw new Error("Failed to delete character")
  }
}
