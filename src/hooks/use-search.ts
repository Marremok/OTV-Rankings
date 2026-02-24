"use client";

import { useQuery } from "@tanstack/react-query";
import {
  globalSearch,
  quickSearchSeries,
  quickSearchUsers,
} from "@/lib/actions/search";
import type {
  SearchQueryInput,
  SearchResponse,
  SeriesSearchResult,
  UserSearchResult,
} from "@/lib/validations/search";

// ============================================
// SEARCH HOOKS
// ============================================

/**
 * Hook for global search across series and users
 * @param query - Search query string
 * @param options - Optional search options (limit, types)
 */
export function useGlobalSearch(
  query: string,
  options?: { limit?: number; types?: ("series" | "user")[] }
) {
  return useQuery<SearchResponse>({
    queryKey: ["globalSearch", query, options?.limit, options?.types],
    queryFn: () =>
      globalSearch({
        query,
        ...(options?.limit !== undefined && { limit: options.limit }),
        ...(options?.types !== undefined && { types: options.types }),
      } as SearchQueryInput),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
  });
}

/**
 * Hook for quick series search (autocomplete)
 * @param query - Search query string
 */
export function useQuickSearchSeries(query: string) {
  return useQuery<SeriesSearchResult[]>({
    queryKey: ["quickSearchSeries", query],
    queryFn: () => quickSearchSeries(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

/**
 * Hook for quick user search (autocomplete)
 * @param query - Search query string
 */
export function useQuickSearchUsers(query: string) {
  return useQuery<UserSearchResult[]>({
    queryKey: ["quickSearchUsers", query],
    queryFn: () => quickSearchUsers(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}
