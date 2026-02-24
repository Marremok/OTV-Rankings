"use client"

import {
  createCharacter,
  getCharacters,
  getCharactersBySeriesId,
  getCharacterById,
  getCharacterBySlug,
  editCharacter,
  deleteCharacter,
  CreateCharacterInput,
  EditCharacterInput,
} from "@/lib/actions/characters"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ============================================
// CHARACTER HOOKS
// ============================================

// Query key constants for consistency
export const characterKeys = {
  all: ["characters"] as const,
  byId: (id: string) => ["characters", id] as const,
  bySlug: (slug: string) => ["characters", "slug", slug] as const,
  bySeries: (seriesId: string) => ["characters", "series", seriesId] as const,
}

/**
 * Hook for fetching all characters with their series info
 */
export function useGetAllCharacters() {
  return useQuery({
    queryKey: characterKeys.all,
    queryFn: getCharacters,
  })
}

/**
 * Hook for fetching characters by series ID
 */
export function useGetCharactersBySeries(seriesId: string) {
  return useQuery({
    queryKey: characterKeys.bySeries(seriesId),
    queryFn: () => getCharactersBySeriesId(seriesId),
    enabled: !!seriesId,
  })
}

/**
 * Hook for fetching a single character by ID
 */
export function useGetCharacterById(id: string) {
  return useQuery({
    queryKey: characterKeys.byId(id),
    queryFn: () => getCharacterById(id),
    enabled: !!id,
  })
}

/**
 * Hook for fetching a single character by slug
 */
export function useGetCharacterBySlug(slug: string) {
  return useQuery({
    queryKey: characterKeys.bySlug(slug),
    queryFn: () => getCharacterBySlug(slug),
    enabled: !!slug,
  })
}

/**
 * Hook for creating a new character
 * Invalidates character queries on success
 */
export function useCreateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCharacterInput) => createCharacter(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: characterKeys.all })
      if (data.seriesId) {
        queryClient.invalidateQueries({
          queryKey: characterKeys.bySeries(data.seriesId),
        })
      }
    },
    onError: (error) => console.error("Error while creating character:", error),
  })
}

/**
 * Hook for editing an existing character
 * Invalidates character queries on success
 */
export function useEditCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EditCharacterInput) => editCharacter(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: characterKeys.all })
      queryClient.invalidateQueries({ queryKey: characterKeys.byId(data.id) })
      if (data.seriesId) {
        queryClient.invalidateQueries({
          queryKey: characterKeys.bySeries(data.seriesId),
        })
      }
    },
    onError: (error) => console.error("Error while updating character:", error),
  })
}

/**
 * Hook for deleting a character
 * Invalidates character queries on success
 */
export function useDeleteCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCharacter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: characterKeys.all })
    },
    onError: (error) => console.error("Error while deleting character:", error),
  })
}
