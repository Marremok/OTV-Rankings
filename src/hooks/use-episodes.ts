"use client"

import {
  createEpisode,
  getEpisodes,
  getEpisodesBySeasonId,
  getEpisodesBySeriesId,
  getEpisodeById,
  getEpisodeBySlug,
  editEpisode,
  deleteEpisode,
  CreateEpisodeInput,
  EditEpisodeInput,
} from "@/lib/actions/episodes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ============================================
// EPISODE HOOKS
// ============================================

export const episodeKeys = {
  all: ["episodes"] as const,
  byId: (id: string) => ["episodes", id] as const,
  bySlug: (slug: string) => ["episodes", "slug", slug] as const,
  bySeason: (seasonId: string) => ["episodes", "season", seasonId] as const,
  bySeries: (seriesId: string) => ["episodes", "series", seriesId] as const,
}

/**
 * Hook for fetching all episodes
 */
export function useGetAllEpisodes() {
  return useQuery({
    queryKey: episodeKeys.all,
    queryFn: getEpisodes,
  })
}

/**
 * Hook for fetching episodes by season ID
 */
export function useGetEpisodesBySeason(seasonId: string) {
  return useQuery({
    queryKey: episodeKeys.bySeason(seasonId),
    queryFn: () => getEpisodesBySeasonId(seasonId),
    enabled: !!seasonId,
  })
}

/**
 * Hook for fetching episodes by series ID
 */
export function useGetEpisodesBySeries(seriesId: string) {
  return useQuery({
    queryKey: episodeKeys.bySeries(seriesId),
    queryFn: () => getEpisodesBySeriesId(seriesId),
    enabled: !!seriesId,
  })
}

/**
 * Hook for fetching a single episode by ID
 */
export function useGetEpisodeById(id: string) {
  return useQuery({
    queryKey: episodeKeys.byId(id),
    queryFn: () => getEpisodeById(id),
    enabled: !!id,
  })
}

/**
 * Hook for fetching a single episode by slug
 */
export function useGetEpisodeBySlug(slug: string) {
  return useQuery({
    queryKey: episodeKeys.bySlug(slug),
    queryFn: () => getEpisodeBySlug(slug),
    enabled: !!slug,
  })
}

/**
 * Hook for creating a new episode
 */
export function useCreateEpisode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEpisodeInput) => createEpisode(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.all })
      queryClient.invalidateQueries({ queryKey: episodeKeys.bySeason(data.seasonId) })
      if (data.seriesId) {
        queryClient.invalidateQueries({ queryKey: episodeKeys.bySeries(data.seriesId) })
      }
    },
    onError: (error) => console.error("Error while creating episode:", error),
  })
}

/**
 * Hook for editing an existing episode
 */
export function useEditEpisode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EditEpisodeInput) => editEpisode(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.all })
      queryClient.invalidateQueries({ queryKey: episodeKeys.byId(data.id) })
      queryClient.invalidateQueries({ queryKey: episodeKeys.bySeason(data.seasonId) })
      if (data.seriesId) {
        queryClient.invalidateQueries({ queryKey: episodeKeys.bySeries(data.seriesId) })
      }
    },
    onError: (error) => console.error("Error while updating episode:", error),
  })
}

/**
 * Hook for deleting an episode
 */
export function useDeleteEpisode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEpisode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.all })
    },
    onError: (error) => console.error("Error while deleting episode:", error),
  })
}
