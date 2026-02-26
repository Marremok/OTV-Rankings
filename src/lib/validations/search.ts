import { z } from "zod";

// ============================================
// SEARCH INPUT SCHEMAS
// ============================================

export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long")
    .transform((val) => val.trim()),
  limit: z.number().int().min(1).max(20).optional().default(5),
  types: z
    .array(z.enum(["series", "character", "user", "season", "episode"]))
    .optional()
    .default(["series", "character", "user", "season", "episode"]),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ============================================
// SEARCH RESULT TYPES
// ============================================

export type SearchResultType = "series" | "character" | "user" | "season" | "episode";

export interface SeriesSearchResult {
  id: string;
  type: "series";
  title: string;
  slug: string | null;
  imageUrl: string | null;
  releaseYear: number | null;
  score: number;
  genre: string[];
}

export interface CharacterSearchResult {
  id: string;
  type: "character";
  name: string;
  slug: string | null;
  posterUrl: string | null;
  score: number;
  seriesTitle: string | null;
}

export interface UserSearchResult {
  id: string;
  type: "user";
  name: string;
  image: string | null;
  profileImage: string | null;
}

export interface SeasonSearchResult {
  id: string;
  type: "season";
  name: string | null;
  slug: string | null;
  seasonNumber: number;
  posterUrl: string | null;
  score: number;
  seriesTitle: string | null;
}

export interface EpisodeSearchResult {
  id: string;
  type: "episode";
  title: string;
  slug: string | null;
  episodeNumber: number;
  score: number;
  seriesTitle: string | null;
  seasonNumber: number | null;
}

export type SearchResult = SeriesSearchResult | CharacterSearchResult | UserSearchResult | SeasonSearchResult | EpisodeSearchResult;

export interface GroupedSearchResults {
  series: SeriesSearchResult[];
  characters: CharacterSearchResult[];
  users: UserSearchResult[];
  seasons: SeasonSearchResult[];
  episodes: EpisodeSearchResult[];
}

export interface SearchResponse {
  results: GroupedSearchResults;
  query: string;
  totalCount: number;
}

// ============================================
// TYPE GUARDS
// ============================================

export function isSeriesResult(result: SearchResult): result is SeriesSearchResult {
  return result.type === "series";
}

export function isCharacterResult(result: SearchResult): result is CharacterSearchResult {
  return result.type === "character";
}

export function isUserResult(result: SearchResult): result is UserSearchResult {
  return result.type === "user";
}

export function isSeasonResult(result: SearchResult): result is SeasonSearchResult {
  return result.type === "season";
}

export function isEpisodeResult(result: SearchResult): result is EpisodeSearchResult {
  return result.type === "episode";
}
