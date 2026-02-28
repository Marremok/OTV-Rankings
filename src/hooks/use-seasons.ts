"use client"

import {
  createSeason,
  getSeasons,
  getSeasonsBySeriesId,
  getSeasonById,
  getSeasonBySlug,
  editSeason,
  deleteSeason,
  CreateSeasonInput,
  EditSeasonInput,
} from "@/lib/actions/seasons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ============================================
// SEASON HOOKS
// ============================================

export const seasonKeys = {
  all: ["seasons"] as const,
  byId: (id: string) => ["seasons", id] as const,
  bySlug: (slug: string) => ["seasons", "slug", slug] as const,
  bySeries: (seriesId: string) => ["seasons", "series", seriesId] as const,
}

/**
 * Hook for fetching all seasons
 */
export function useGetAllSeasons() {
  return useQuery({
    queryKey: seasonKeys.all,
    queryFn: getSeasons,
  })
}

/**
 * Hook for fetching seasons by series ID
 */
export function useGetSeasonsBySeries(seriesId: string) {
  return useQuery({
    queryKey: seasonKeys.bySeries(seriesId),
    queryFn: () => getSeasonsBySeriesId(seriesId),
    enabled: !!seriesId,
  })
}

/**
 * Hook for fetching a single season by ID
 */
export function useGetSeasonById(id: string) {
  return useQuery({
    queryKey: seasonKeys.byId(id),
    queryFn: () => getSeasonById(id),
    enabled: !!id,
  })
}

/**
 * Hook for fetching a single season by slug
 */
export function useGetSeasonBySlug(slug: string) {
  return useQuery({
    queryKey: seasonKeys.bySlug(slug),
    queryFn: () => getSeasonBySlug(slug),
    enabled: !!slug,
  })
}

/**
 * Hook for creating a new season
 */
export function useCreateSeason() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSeasonInput) => createSeason(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.all })
      queryClient.invalidateQueries({ queryKey: seasonKeys.bySeries(data.seriesId) })
    },
    onError: (error) => console.error("Error while creating season:", error),
  })
}

/**
 * Hook for editing an existing season
 */
export function useEditSeason() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EditSeasonInput) => editSeason(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.all })
      queryClient.invalidateQueries({ queryKey: seasonKeys.byId(data.id) })
      queryClient.invalidateQueries({ queryKey: seasonKeys.bySeries(data.seriesId) })
    },
    onError: (error) => console.error("Error while updating season:", error),
  })
}

/**
 * Hook for deleting a season
 */
export function useDeleteSeason() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSeason(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.all })
      queryClient.invalidateQueries({ queryKey: seasonKeys.bySeries(data.seriesId) })
    },
    onError: (error) => console.error("Error while deleting season:", error),
  })
}
