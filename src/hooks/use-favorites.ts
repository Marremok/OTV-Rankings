"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUserFavorites,
  setUserFavorite,
  removeUserFavorite,
  reorderUserFavorites,
  toggleFavoriteFromSeriesPage,
  type FavoriteItem,
  type GetFavoritesResult,
} from "@/lib/actions/favorites"

// ============================================
// QUERY KEYS
// ============================================

export const favoriteKeys = {
  all: (userId: string) => ["userFavorites", userId] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetches all favorites (series + characters) for a user.
 */
export function useUserFavorites(userId: string | undefined) {
  return useQuery<GetFavoritesResult>({
    queryKey: favoriteKeys.all(userId ?? ""),
    queryFn: () => getUserFavorites(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Set a specific rank slot for a favorite (insert or move).
 * Also invalidates series status so the dropdown updates its isFavorite state.
 */
export function useSetUserFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      mediaType,
      rank,
      mediaId,
    }: {
      userId: string
      mediaType: "SERIES" | "CHARACTER"
      rank: number
      mediaId: string
    }) => setUserFavorite(userId, mediaType, rank, mediaId),
    onSuccess: (_, { userId, mediaType }) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all(userId) })
      if (mediaType === "SERIES") {
        queryClient.invalidateQueries({ queryKey: ["seriesStatus", userId] })
      }
    },
  })
}

/**
 * Remove a favorite by mediaId.
 * Also invalidates series status so the dropdown updates its isFavorite state.
 */
export function useRemoveUserFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      mediaType,
      mediaId,
    }: {
      userId: string
      mediaType: "SERIES" | "CHARACTER"
      mediaId: string
    }) => removeUserFavorite(userId, mediaType, mediaId),
    onSuccess: (_, { userId, mediaType }) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all(userId) })
      if (mediaType === "SERIES") {
        queryClient.invalidateQueries({ queryKey: ["seriesStatus", userId] })
      }
    },
  })
}

/**
 * Reorder all favorites for one mediaType. Includes optimistic update.
 */
export function useReorderUserFavorites() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      mediaType,
      newOrder,
    }: {
      userId: string
      mediaType: "SERIES" | "CHARACTER"
      newOrder: Array<{ mediaId: string; rank: number }>
    }) => reorderUserFavorites(userId, mediaType, newOrder),
    onMutate: async ({ userId, mediaType, newOrder }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all(userId) })
      const previous = queryClient.getQueryData<GetFavoritesResult>(favoriteKeys.all(userId))

      // Optimistically reorder in cache
      queryClient.setQueryData<GetFavoritesResult>(favoriteKeys.all(userId), (old) => {
        if (!old) return old
        const rankMap = new Map(newOrder.map((o) => [o.mediaId, o.rank]))
        if (mediaType === "SERIES") {
          const updated = old.series
            .map((item) => ({ ...item, rank: rankMap.get(item.mediaId) ?? item.rank }))
            .sort((a, b) => a.rank - b.rank)
          return { ...old, series: updated }
        } else {
          const updated = old.characters
            .map((item) => ({ ...item, rank: rankMap.get(item.mediaId) ?? item.rank }))
            .sort((a, b) => a.rank - b.rank)
          return { ...old, characters: updated }
        }
      })

      return { previous }
    },
    onError: (_, { userId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoriteKeys.all(userId), context.previous)
      }
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all(userId) })
    },
  })
}

/**
 * Toggle a series as favorite from the series page.
 * Handles add / remove / full (4 slots occupied) cases.
 */
export function useToggleFavoriteFromSeriesPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      seriesId,
    }: {
      userId: string
      seriesId: string
    }) => toggleFavoriteFromSeriesPage(userId, seriesId),
    onSuccess: (_, { userId, seriesId }) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all(userId) })
      queryClient.invalidateQueries({ queryKey: ["seriesStatus", userId, seriesId] })
    },
  })
}

export type { FavoriteItem, GetFavoritesResult }
