"use server";

import prisma from "../prisma";
import {
  searchQuerySchema,
  type SearchQueryInput,
  type GroupedSearchResults,
  type SeriesSearchResult,
  type UserSearchResult,
  type SearchResponse,
} from "../validations/search";

// ============================================
// CHARACTER SEARCH TYPE
// ============================================

export interface CharacterSearchResult {
  id: string
  name: string
  slug: string | null
  posterUrl: string | null
  score: number
  seriesTitle: string
}

/**
 * Search for series by title
 */
async function searchSeries(
  query: string,
  limit: number
): Promise<SeriesSearchResult[]> {
  const series = await prisma.series.findMany({
    where: {
      title: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      imageUrl: true,
      releaseYear: true,
      score: true,
      genre: true,
    },
    orderBy: { score: "desc" },
    take: limit,
  });

  return series.map((s) => ({
    id: s.id,
    type: "series" as const,
    title: s.title,
    slug: s.slug,
    imageUrl: s.imageUrl,
    releaseYear: s.releaseYear,
    score: s.score,
    genre: s.genre,
  }));
}

/**
 * Search for users by name
 */
async function searchUsers(
  query: string,
  limit: number
): Promise<UserSearchResult[]> {
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      profileImage: true,
    },
    take: limit,
  });

  return users.map((u) => ({
    id: u.id,
    type: "user" as const,
    name: u.name,
    image: u.image,
    profileImage: u.profileImage,
  }));
}

/**
 * Global search across series and users
 * Returns grouped results by type
 */
export async function globalSearch(
  input: SearchQueryInput
): Promise<SearchResponse> {
  try {
    // Validate input
    const validation = searchQuerySchema.safeParse(input);
    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || "Invalid search input";
      throw new Error(errorMessage);
    }

    const { query, limit, types } = validation.data;

    // Run searches in parallel based on requested types
    const [series, users] = await Promise.all([
      types.includes("series") ? searchSeries(query, limit) : [],
      types.includes("user") ? searchUsers(query, limit) : [],
    ]);

    const results: GroupedSearchResults = {
      series,
      users,
    };

    return {
      results,
      query,
      totalCount: series.length + users.length,
    };
  } catch (error) {
    console.error("Error in global search:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Search failed");
  }
}

/**
 * Quick search for series only (used for autocomplete)
 */
export async function quickSearchSeries(
  query: string
): Promise<SeriesSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return searchSeries(query.trim(), 5);
  } catch (error) {
    console.error("Error in quick series search:", error);
    throw new Error("Search failed");
  }
}

/**
 * Quick search for users only (used for autocomplete)
 */
export async function quickSearchUsers(
  query: string
): Promise<UserSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return searchUsers(query.trim(), 5);
  } catch (error) {
    console.error("Error in quick user search:", error);
    throw new Error("Search failed");
  }
}

/**
 * Quick search for characters (used in AddFavoriteDialog)
 */
export async function quickSearchCharacters(
  query: string
): Promise<CharacterSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const characters = await prisma.character.findMany({
      where: {
        name: {
          contains: query.trim(),
          mode: "insensitive",
        },
      },
      include: {
        series: { select: { title: true } },
      },
      orderBy: { score: "desc" },
      take: 10,
    });

    return characters.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      posterUrl: c.posterUrl,
      score: c.score,
      seriesTitle: c.series.title,
    }));
  } catch (error) {
    console.error("Error in quick character search:", error);
    throw new Error("Search failed");
  }
}
