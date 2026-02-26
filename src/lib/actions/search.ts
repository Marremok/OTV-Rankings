"use server";

import prisma from "../prisma";
import {
  searchQuerySchema,
  type SearchQueryInput,
  type GroupedSearchResults,
  type SeriesSearchResult,
  type CharacterSearchResult,
  type UserSearchResult,
  type SeasonSearchResult,
  type EpisodeSearchResult,
  type SearchResponse,
} from "../validations/search";

/**
 * Search for series by title
 */
async function searchSeries(query: string, limit: number): Promise<SeriesSearchResult[]> {
  const series = await prisma.series.findMany({
    where: { title: { contains: query, mode: "insensitive" } },
    select: { id: true, title: true, slug: true, imageUrl: true, releaseYear: true, score: true, genre: true },
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
 * Search for characters by name
 */
async function searchCharacters(query: string, limit: number): Promise<CharacterSearchResult[]> {
  const characters = await prisma.character.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    include: { series: { select: { title: true } } },
    orderBy: { score: "desc" },
    take: limit,
  });

  return characters.map((c) => ({
    id: c.id,
    type: "character" as const,
    name: c.name,
    slug: c.slug,
    posterUrl: c.posterUrl,
    score: c.score,
    seriesTitle: (c as typeof c & { series: { title: string } | null }).series?.title ?? null,
  }));
}

/**
 * Search for users by name
 */
async function searchUsers(query: string, limit: number): Promise<UserSearchResult[]> {
  const users = await prisma.user.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    select: { id: true, name: true, image: true, profileImage: true },
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
 * Search for seasons by name
 */
async function searchSeasons(query: string, limit: number): Promise<SeasonSearchResult[]> {
  const seasons = await prisma.season.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    include: { series: { select: { title: true } } },
    orderBy: { score: "desc" },
    take: limit,
  });

  return seasons.map((s) => ({
    id: s.id,
    type: "season" as const,
    name: s.name,
    slug: s.slug,
    seasonNumber: s.seasonNumber,
    posterUrl: s.posterUrl,
    score: s.score,
    seriesTitle: s.series?.title ?? null,
  }));
}

/**
 * Search for episodes by title
 */
async function searchEpisodes(query: string, limit: number): Promise<EpisodeSearchResult[]> {
  const episodes = await prisma.episode.findMany({
    where: { title: { contains: query, mode: "insensitive" } },
    include: {
      season: { include: { series: { select: { title: true } } } },
    },
    orderBy: { score: "desc" },
    take: limit,
  });

  return episodes.map((e) => ({
    id: e.id,
    type: "episode" as const,
    title: e.title,
    slug: e.slug,
    episodeNumber: e.episodeNumber,
    score: e.score,
    seriesTitle: e.season?.series?.title ?? null,
    seasonNumber: e.season?.seasonNumber ?? null,
  }));
}

/**
 * Global search across series, characters, users, seasons, and episodes
 */
export async function globalSearch(input: SearchQueryInput): Promise<SearchResponse> {
  try {
    const validation = searchQuerySchema.safeParse(input);
    if (!validation.success) {
      throw new Error(validation.error.issues[0]?.message || "Invalid search input");
    }

    const { query, limit, types } = validation.data;

    const [series, characters, users, seasons, episodes] = await Promise.all([
      types.includes("series")    ? searchSeries(query, limit)     : [],
      types.includes("character") ? searchCharacters(query, limit) : [],
      types.includes("user")      ? searchUsers(query, limit)      : [],
      types.includes("season")    ? searchSeasons(query, limit)    : [],
      types.includes("episode")   ? searchEpisodes(query, limit)   : [],
    ]);

    const results: GroupedSearchResults = { series, characters, users, seasons, episodes };

    return {
      results,
      query,
      totalCount: series.length + characters.length + users.length + seasons.length + episodes.length,
    };
  } catch (error) {
    console.error("Error in global search:", error);
    if (error instanceof Error) throw error;
    throw new Error("Search failed");
  }
}

/**
 * Quick search for series only (used for autocomplete)
 */
export async function quickSearchSeries(query: string): Promise<SeriesSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) return [];
    return searchSeries(query.trim(), 5);
  } catch (error) {
    console.error("Error in quick series search:", error);
    throw new Error("Search failed");
  }
}

/**
 * Quick search for users only (used for autocomplete)
 */
export async function quickSearchUsers(query: string): Promise<UserSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) return [];
    return searchUsers(query.trim(), 5);
  } catch (error) {
    console.error("Error in quick user search:", error);
    throw new Error("Search failed");
  }
}

/**
 * Quick search for characters — used in AddFavoriteDialog and global search
 */
export async function quickSearchCharacters(query: string): Promise<CharacterSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) return [];
    return searchCharacters(query.trim(), 10);
  } catch (error) {
    console.error("Error in quick character search:", error);
    throw new Error("Search failed");
  }
}

/**
 * Quick search for seasons
 */
export async function quickSearchSeasons(query: string): Promise<SeasonSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) return [];
    return searchSeasons(query.trim(), 5);
  } catch (error) {
    console.error("Error in quick season search:", error);
    throw new Error("Search failed");
  }
}

/**
 * Quick search for episodes
 */
export async function quickSearchEpisodes(query: string): Promise<EpisodeSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) return [];
    return searchEpisodes(query.trim(), 5);
  } catch (error) {
    console.error("Error in quick episode search:", error);
    throw new Error("Search failed");
  }
}
