"use client";

import { useQuery } from "@tanstack/react-query";
import {
  globalSearch,
  quickSearchSeries,
  quickSearchUsers,
  quickSearchCharacters,
  quickSearchSeasons,
  quickSearchEpisodes,
} from "@/lib/actions/search";
import type {
  SearchQueryInput,
  SearchResponse,
  SeriesSearchResult,
  CharacterSearchResult,
  UserSearchResult,
  SeasonSearchResult,
  EpisodeSearchResult,
} from "@/lib/validations/search";

// ============================================
// SEARCH HOOKS
// ============================================

export function useGlobalSearch(
  query: string,
  options?: { limit?: number; types?: ("series" | "character" | "user" | "season" | "episode")[] }
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
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export function useQuickSearchSeries(query: string) {
  return useQuery<SeriesSearchResult[]>({
    queryKey: ["quickSearchSeries", query],
    queryFn: () => quickSearchSeries(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export function useQuickSearchCharacters(query: string) {
  return useQuery<CharacterSearchResult[]>({
    queryKey: ["quickSearchCharacters", query],
    queryFn: () => quickSearchCharacters(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export function useQuickSearchUsers(query: string) {
  return useQuery<UserSearchResult[]>({
    queryKey: ["quickSearchUsers", query],
    queryFn: () => quickSearchUsers(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export function useQuickSearchSeasons(query: string) {
  return useQuery<SeasonSearchResult[]>({
    queryKey: ["quickSearchSeasons", query],
    queryFn: () => quickSearchSeasons(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export function useQuickSearchEpisodes(query: string) {
  return useQuery<EpisodeSearchResult[]>({
    queryKey: ["quickSearchEpisodes", query],
    queryFn: () => quickSearchEpisodes(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}
