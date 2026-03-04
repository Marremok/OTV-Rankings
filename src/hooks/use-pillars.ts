"use client"

import {
  createPillar,
  getAllPillars,
  getPillars,
  createRatingPillar,
  getUserRatingPillars,
  getUserRatingsForMultipleSeries,
  getUserRatingsForMultipleCharacters,
  getUserRatingsForMultipleSeasons,
  getUserRatingsForMultipleEpisodes,
  getPillarCount,
  editPillar,
  deletePillar,
  createCharacterRatingPillar,
  getUserCharacterRatingPillars,
  createSeasonRatingPillar,
  getUserSeasonRatingPillars,
  createEpisodeRatingPillar,
  getUserEpisodeRatingPillars,
  CreatePillarInput,
  CreateRatingPillarInput,
  EditPillarInput,
  CreateCharacterRatingPillarInput,
  CreateSeasonRatingPillarInput,
  CreateEpisodeRatingPillarInput,
} from "@/lib/actions/pillars"
import {
  createQuestion,
  getQuestionsByPillar,
  deleteQuestion,
  CreateQuestionInput,
} from "@/lib/actions/questions"
import {
  getSeriesPillarScoresBySlug,
  getCharacterPillarScoresBySlug,
  getSeasonPillarScoresBySlug,
  getEpisodePillarScoresBySlug,
} from "@/lib/actions/scoring"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { mediaType } from "@/generated/prisma/enums"
import posthog from "posthog-js"

// ============================================
// PILLAR TEMPLATE HOOKS (Admin)
// ============================================

/**
 * Hook for creating a new pillar template
 * Invalidates pillar queries on success
 */
export function useCreatePillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePillarInput) => createPillar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPillars"] })
      queryClient.invalidateQueries({ queryKey: ["getAllPillars"] })
    },
    onError: (error) => console.error("Error while creating pillar:", error),
  })
}

/**
 * Hook for editing an existing pillar template
 * Invalidates pillar queries on success
 */
export function useEditPillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EditPillarInput) => editPillar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPillars"] })
      queryClient.invalidateQueries({ queryKey: ["getAllPillars"] })
    },
    onError: (error) => console.error("Error while updating pillar:", error),
  })
}

/**
 * Hook for deleting a pillar template
 * Invalidates pillar queries on success
 */
export function useDeletePillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePillar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPillars"] })
      queryClient.invalidateQueries({ queryKey: ["getAllPillars"] })
    },
    onError: (error) => console.error("Error while deleting pillar:", error),
  })
}

/**
 * Hook for fetching all pillar templates (admin view)
 */
export function useGetAllPillars() {
  return useQuery({
    queryKey: ["getAllPillars"],
    queryFn: getAllPillars,
  })
}

/**
 * Hook for fetching pillars by media type
 * Returns pillars with their associated questions for the quiz flow
 */
export function useGetPillarsByType(type: mediaType) {
  return useQuery({
    queryKey: ["getPillars", type],
    queryFn: () => getPillars(type),
    enabled: !!type,
  })
}

// ============================================
// QUESTION HOOKS
// ============================================

/**
 * Hook for creating a new question
 * Invalidates pillar queries on success (since questions are nested in pillars)
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateQuestionInput) => createQuestion(input),
    onSuccess: () => {
      // Invalidate pillar queries since questions are included in pillar data
      queryClient.invalidateQueries({ queryKey: ["getAllPillars"] })
      queryClient.invalidateQueries({ queryKey: ["getPillars"] })
    },
    onError: (error) => console.error("Error while creating question:", error),
  })
}

/**
 * Hook for deleting a question
 * Invalidates pillar queries on success
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllPillars"] })
      queryClient.invalidateQueries({ queryKey: ["getPillars"] })
    },
    onError: (error) => console.error("Error while deleting question:", error),
  })
}

/**
 * Hook for fetching questions by pillar ID
 */
export function useGetQuestionsByPillar(pillarId: string) {
  return useQuery({
    queryKey: ["questions", pillarId],
    queryFn: () => getQuestionsByPillar(pillarId),
    enabled: !!pillarId,
  })
}

// ============================================
// USER RATING PILLAR HOOKS
// ============================================

/**
 * Hook for creating/updating a user's rating pillar
 * Called when user completes a quiz for a pillar
 *
 * NOTE: Only invalidates user-specific queries, NOT series queries.
 * Series scores (pillarScores, overall score) are updated periodically via cron,
 * not on every rating submission. This avoids O(n) aggregation per submit.
 */
export function useCreateRatingPillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRatingPillarInput) => createRatingPillar(input),
    onSuccess: (_, variables) => {
      // Invalidate user's ratings for this specific series
      queryClient.invalidateQueries({
        queryKey: ["userRatingPillars", variables.userId, variables.seriesId],
      })
      // Invalidate user's ratings across all series (for TV series page cards)
      queryClient.invalidateQueries({
        queryKey: ["userRatingsMultipleSeries", variables.userId],
      })
      // NOTE: We intentionally do NOT invalidate ["series"] queries here.
      // Community scores update via cron job, not per-rating.
      posthog.capture("pillar_rated", {
        media_type: "series",
        series_id: variables.seriesId,
        pillar_id: variables.pillarId,
        score: variables.finalScore,
      })
    },
    onError: (error) => console.error("Error while saving rating:", error),
  })
}

/**
 * Hook for fetching a user's existing rating pillars for a series
 * Used to display previously submitted ratings in the UI
 */
export function useGetUserRatingPillars(userId: string | undefined, seriesId: string | undefined) {
  return useQuery({
    queryKey: ["userRatingPillars", userId, seriesId],
    queryFn: () => getUserRatingPillars(userId!, seriesId!),
    enabled: !!userId && !!seriesId,
  })
}

/**
 * Hook for fetching a user's ratings across multiple series
 * Used for the TV series ranking page to show rating status
 */
export function useGetUserRatingsForMultipleSeries(userId: string | undefined, seriesIds: string[]) {
  return useQuery({
    queryKey: ["userRatingsMultipleSeries", userId, seriesIds],
    queryFn: () => getUserRatingsForMultipleSeries(userId!, seriesIds),
    enabled: !!userId && seriesIds.length > 0,
  })
}

/**
 * Hook for fetching the total pillar count for a media type
 */
export function useGetPillarCount(type: mediaType) {
  return useQuery({
    queryKey: ["pillarCount", type],
    queryFn: () => getPillarCount(type),
    enabled: !!type,
  })
}

// ============================================
// AGGREGATED PILLAR SCORES HOOKS
// ============================================

/**
 * Hook for fetching aggregated pillar scores for a series by slug
 * Used by RadarChartSection to display rating breakdown
 */
export function useGetSeriesPillarScores(slug: string | undefined) {
  return useQuery({
    queryKey: ["seriesPillarScores", slug],
    queryFn: () => getSeriesPillarScoresBySlug(slug!),
    enabled: !!slug,
  })
}

// ============================================
// CHARACTER RATING PILLAR HOOKS
// ============================================

/**
 * Hook for creating/updating a user's CHARACTER rating pillar.
 * Mirrors useCreateRatingPillar but for characters.
 */
export function useCreateCharacterRatingPillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCharacterRatingPillarInput) => createCharacterRatingPillar(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userCharacterRatingPillars", variables.userId, variables.characterId],
      })
      posthog.capture("pillar_rated", {
        media_type: "character",
        character_id: variables.characterId,
        pillar_id: variables.pillarId,
        score: variables.finalScore,
      })
    },
    onError: (error) => console.error("Error while saving character rating:", error),
  })
}

/**
 * Hook for fetching a user's existing character rating pillars.
 * Enabled only when both userId and characterId are present.
 */
export function useGetUserCharacterRatingPillars(
  userId: string | undefined,
  characterId: string | undefined
) {
  return useQuery({
    queryKey: ["userCharacterRatingPillars", userId, characterId],
    queryFn: () => getUserCharacterRatingPillars(userId!, characterId!),
    enabled: !!userId && !!characterId,
  })
}

/**
 * Hook for fetching a user's ratings across multiple characters.
 * Used for the character ranking page to show rating status per card.
 * Mirrors useGetUserRatingsForMultipleSeries.
 */
export function useGetUserRatingsForMultipleCharacters(userId: string | undefined, characterIds: string[]) {
  return useQuery({
    queryKey: ["userRatingsMultipleCharacters", userId, characterIds],
    queryFn: () => getUserRatingsForMultipleCharacters(userId!, characterIds),
    enabled: !!userId && characterIds.length > 0,
  })
}

/**
 * Hook for fetching aggregated pillar scores for a character by slug.
 * Used by CharacterRatingSummary to display community scores.
 */
export function useGetCharacterPillarScores(slug: string | undefined) {
  return useQuery({
    queryKey: ["characterPillarScores", slug],
    queryFn: () => getCharacterPillarScoresBySlug(slug!),
    enabled: !!slug,
  })
}

// ============================================
// SEASON RATING PILLAR HOOKS
// ============================================

/**
 * Hook for creating/updating a user's SEASON rating pillar.
 * Mirrors useCreateCharacterRatingPillar but for seasons.
 */
export function useCreateSeasonRatingPillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSeasonRatingPillarInput) => createSeasonRatingPillar(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userSeasonRatingPillars", variables.userId, variables.seasonId],
      })
      queryClient.invalidateQueries({
        queryKey: ["userRatingsMultipleSeasons", variables.userId],
      })
      posthog.capture("pillar_rated", {
        media_type: "season",
        season_id:  variables.seasonId,
        pillar_id:  variables.pillarId,
        score:      variables.finalScore,
      })
    },
    onError: (error) => console.error("Error while saving season rating:", error),
  })
}

/**
 * Hook for fetching a user's existing season rating pillars.
 */
export function useGetUserSeasonRatingPillars(
  userId: string | undefined,
  seasonId: string | undefined
) {
  return useQuery({
    queryKey: ["userSeasonRatingPillars", userId, seasonId],
    queryFn: () => getUserSeasonRatingPillars(userId!, seasonId!),
    enabled: !!userId && !!seasonId,
  })
}

/**
 * Hook for fetching a user's ratings across multiple seasons.
 * Used for the season ranking page to show rating status per card.
 */
export function useGetUserRatingsForMultipleSeasons(userId: string | undefined, seasonIds: string[]) {
  return useQuery({
    queryKey: ["userRatingsMultipleSeasons", userId, seasonIds],
    queryFn: () => getUserRatingsForMultipleSeasons(userId!, seasonIds),
    enabled: !!userId && seasonIds.length > 0,
  })
}

/**
 * Hook for fetching aggregated pillar scores for a season by slug.
 * Used by SeasonRatingSummary to display community scores.
 */
export function useGetSeasonPillarScores(slug: string | undefined) {
  return useQuery({
    queryKey: ["seasonPillarScores", slug],
    queryFn: () => getSeasonPillarScoresBySlug(slug!),
    enabled: !!slug,
  })
}

// ============================================
// EPISODE RATING PILLAR HOOKS
// ============================================

/**
 * Hook for creating/updating a user's EPISODE rating pillar.
 * Mirrors useCreateSeasonRatingPillar but for episodes.
 */
export function useCreateEpisodeRatingPillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEpisodeRatingPillarInput) => createEpisodeRatingPillar(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userEpisodeRatingPillars", variables.userId, variables.episodeId],
      })
      queryClient.invalidateQueries({
        queryKey: ["userRatingsMultipleEpisodes", variables.userId],
      })
      posthog.capture("pillar_rated", {
        media_type: "episode",
        episode_id: variables.episodeId,
        pillar_id:  variables.pillarId,
        score:      variables.finalScore,
      })
    },
    onError: (error) => console.error("Error while saving episode rating:", error),
  })
}

/**
 * Hook for fetching a user's existing episode rating pillars.
 */
export function useGetUserEpisodeRatingPillars(
  userId: string | undefined,
  episodeId: string | undefined
) {
  return useQuery({
    queryKey: ["userEpisodeRatingPillars", userId, episodeId],
    queryFn: () => getUserEpisodeRatingPillars(userId!, episodeId!),
    enabled: !!userId && !!episodeId,
  })
}

/**
 * Hook for fetching a user's ratings across multiple episodes.
 * Used for the episode ranking page to show rating status per card.
 */
export function useGetUserRatingsForMultipleEpisodes(userId: string | undefined, episodeIds: string[]) {
  return useQuery({
    queryKey: ["userRatingsMultipleEpisodes", userId, episodeIds],
    queryFn: () => getUserRatingsForMultipleEpisodes(userId!, episodeIds),
    enabled: !!userId && episodeIds.length > 0,
  })
}

/**
 * Hook for fetching aggregated pillar scores for an episode by slug.
 * Used by EpisodeRatingSummary to display community scores.
 */
export function useGetEpisodePillarScores(slug: string | undefined) {
  return useQuery({
    queryKey: ["episodePillarScores", slug],
    queryFn: () => getEpisodePillarScoresBySlug(slug!),
    enabled: !!slug,
  })
}
