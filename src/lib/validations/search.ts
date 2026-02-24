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
    .array(z.enum(["series", "user"]))
    .optional()
    .default(["series", "user"]),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ============================================
// SEARCH RESULT TYPES
// ============================================

export type SearchResultType = "series" | "user";

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

export interface UserSearchResult {
  id: string;
  type: "user";
  name: string;
  image: string | null;
  profileImage: string | null;
}

export type SearchResult = SeriesSearchResult | UserSearchResult;

export interface GroupedSearchResults {
  series: SeriesSearchResult[];
  users: UserSearchResult[];
}

export interface SearchResponse {
  results: GroupedSearchResults;
  query: string;
  totalCount: number;
}

// ============================================
// TYPE GUARDS
// ============================================

export function isSeriesResult(
  result: SearchResult
): result is SeriesSearchResult {
  return result.type === "series";
}

export function isUserResult(result: SearchResult): result is UserSearchResult {
  return result.type === "user";
}
