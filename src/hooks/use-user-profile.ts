"use client"

import {
  getUserProfileData,
  getUserStats,
  getUserRecentRatings,
  getUserPillarBreakdown,
  getUserHighestRating,
  getUserImages,
  getUserCurrentlyWatching,
  getUserSeriesStatusCounts,
  updateUserProfileImage,
  updateUserHeroImage,
  getPublicUserProfile,
  getUserSeriesByStatus,
  type UserProfileData,
  type UserProfileStats,
  type RecentRating,
  type PillarBreakdown,
  type HighestRating,
  type CurrentlyWatchingSeries,
  type PublicUserProfile,
  type SeriesListItem,
  type SeriesListStatus,
} from "@/lib/actions/user"
export type { UserProfileStats, RecentRating } from "@/lib/actions/user"
export type { SeriesListStatus } from "@/lib/actions/user"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// ============================================
// USER PROFILE HOOKS
// ============================================

/**
 * Hook for fetching comprehensive user profile data.
 * Includes stats, recent ratings, and pillar breakdown.
 */
export function useUserProfileData(userId: string | undefined) {
  return useQuery<UserProfileData | null>({
    queryKey: ["userProfileData", userId],
    queryFn: () => getUserProfileData(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  })
}

/**
 * Hook for fetching user stats only (lighter query).
 */
export function useUserStats(userId: string | undefined) {
  return useQuery<UserProfileStats | null>({
    queryKey: ["userStats", userId],
    queryFn: () => getUserStats(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook for fetching user's recent ratings.
 */
export function useUserRecentRatings(userId: string | undefined, limit: number = 10) {
  return useQuery<RecentRating[]>({
    queryKey: ["userRecentRatings", userId, limit],
    queryFn: () => getUserRecentRatings(userId!, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook for fetching user's pillar breakdown.
 */
export function useUserPillarBreakdown(userId: string | undefined) {
  return useQuery<PillarBreakdown[]>({
    queryKey: ["userPillarBreakdown", userId],
    queryFn: () => getUserPillarBreakdown(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================
// HIGHEST RATING HOOK
// ============================================

/**
 * Hook for fetching user's highest rated pillar across all series.
 */
export function useUserHighestRating(userId: string | undefined) {
  return useQuery<HighestRating | null>({
    queryKey: ["userHighestRating", userId],
    queryFn: () => getUserHighestRating(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================
// PROFILE IMAGE HOOKS
// ============================================

/**
 * Hook for fetching user's profile and hero images.
 */
export function useUserImages(userId: string | undefined) {
  return useQuery<{ profileImage: string | null; heroImage: string | null } | null>({
    queryKey: ["userImages", userId],
    queryFn: () => getUserImages(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook for updating user's profile image.
 */
export function useUpdateProfileImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, imageUrl }: { userId: string; imageUrl: string }) =>
      updateUserProfileImage(userId, imageUrl),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userImages", userId] })
      queryClient.invalidateQueries({ queryKey: ["userProfileData", userId] })
    },
  })
}

/**
 * Hook for updating user's hero/banner image.
 */
export function useUpdateHeroImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, imageUrl }: { userId: string; imageUrl: string }) =>
      updateUserHeroImage(userId, imageUrl),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userImages", userId] })
      queryClient.invalidateQueries({ queryKey: ["userProfileData", userId] })
    },
  })
}

// ============================================
// SERIES STATUS HOOKS
// ============================================

/**
 * Hook for fetching user's currently watching series.
 */
export function useUserCurrentlyWatching(userId: string | undefined) {
  return useQuery<CurrentlyWatchingSeries[]>({
    queryKey: ["userCurrentlyWatching", userId],
    queryFn: () => getUserCurrentlyWatching(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook for fetching user's series status counts (watchlist, seen, watching, favorites).
 */
export function useUserSeriesStatusCounts(userId: string | undefined) {
  return useQuery<{ watchlist: number; seen: number; watching: number; favorites: number }>({
    queryKey: ["userSeriesStatusCounts", userId],
    queryFn: () => getUserSeriesStatusCounts(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================
// SERIES STATUS MUTATION HOOKS
// ============================================

import { updateUserSeriesStatus, getSeriesStatusForUser } from "@/lib/actions/user"

/**
 * Hook for fetching a user's status for a specific series.
 */
export function useSeriesStatus(userId: string | undefined, seriesId: string | undefined) {
  return useQuery({
    queryKey: ["seriesStatus", userId, seriesId],
    queryFn: () => getSeriesStatusForUser(userId!, seriesId!),
    enabled: !!userId && !!seriesId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook for updating a user's series status (watchlist, seen, watching, favorite).
 * Automatically invalidates related queries on success.
 */
export function useUpdateSeriesStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      seriesId,
      status,
    }: {
      userId: string
      seriesId: string
      status: {
        isWatchlist?: boolean
        isSeen?: boolean
        isWatching?: boolean
        isFavorite?: boolean
      }
    }) => updateUserSeriesStatus(userId, seriesId, status),
    onSuccess: (_, { userId, seriesId }) => {
      // Invalidate related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["seriesStatus", userId, seriesId] })
      queryClient.invalidateQueries({ queryKey: ["userSeriesStatusCounts", userId] })
      queryClient.invalidateQueries({ queryKey: ["userCurrentlyWatching", userId] })
      queryClient.invalidateQueries({ queryKey: ["userProfileData", userId] })
      queryClient.invalidateQueries({ queryKey: ["userSeriesList"] })
    },
  })
}

// ============================================
// PUBLIC PROFILE HOOKS
// ============================================

/**
 * Hook for fetching a user's public profile (no sensitive info).
 */
export function usePublicUserProfile(userId: string | undefined) {
  return useQuery<PublicUserProfile | null>({
    queryKey: ["publicUserProfile", userId],
    queryFn: () => getPublicUserProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================
// SERIES LIST HOOKS
// ============================================

/**
 * Hook for fetching user's series by status (watchlist, seen, or favorites).
 */
export function useUserSeriesList(userId: string | undefined, status: SeriesListStatus) {
  return useQuery<SeriesListItem[]>({
    queryKey: ["userSeriesList", userId, status],
    queryFn: () => getUserSeriesByStatus(userId!, status),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
