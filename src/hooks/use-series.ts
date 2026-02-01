"use client"

import {
  createSeries,
  getSeriesBySlug,
  getSeries,
  editSeries,
  deleteSeries,
  CreateSeriesInput,
  EditSeriesInput,
} from "@/lib/actions/series"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ============================================
// SERIES HOOKS
// ============================================

/**
 * Hook for fetching a series by its slug
 */
export function useGetSeriesBySlug(slug: string) {
  return useQuery({
    queryKey: ["series", slug],
    queryFn: () => getSeriesBySlug(slug),
    enabled: !!slug,
  })
}

/**
 * Hook for creating a new series
 * Invalidates series queries on success
 */
export function useCreateSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSeriesInput) => createSeries(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSeries"] })
      queryClient.invalidateQueries({ queryKey: ["getTop10Series"] })
      queryClient.invalidateQueries({ queryKey: ["getTop100Series"] })
    },
    onError: (error) => console.error("Error while creating series:", error),
  })
}

/**
 * Hook for editing an existing series
 * Invalidates series queries on success
 */
export function useEditSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EditSeriesInput) => editSeries(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSeries"] })
      queryClient.invalidateQueries({ queryKey: ["getTop10Series"] })
      queryClient.invalidateQueries({ queryKey: ["getTop100Series"] })
      queryClient.invalidateQueries({ queryKey: ["series"] })
    },
    onError: (error) => console.error("Error while updating series:", error),
  })
}

/**
 * Hook for deleting a series
 * Invalidates series queries on success
 */
export function useDeleteSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSeries(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSeries"] })
      queryClient.invalidateQueries({ queryKey: ["getTop10Series"] })
      queryClient.invalidateQueries({ queryKey: ["getTop100Series"] })
    },
    onError: (error) => console.error("Error while deleting series:", error),
  })
}

/**
 * Hook for fetching all series
 */
export function useGetAllSeries() {
  return useQuery({
    queryKey: ["getSeries"],
    queryFn: getSeries,
  })
}
