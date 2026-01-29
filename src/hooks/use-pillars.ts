"use client"

import {
  createPillar,
  getAllPillars,
  getPillars,
  createRatingPillar,
  getUserRatingPillars,
  CreatePillarInput,
  CreateRatingPillarInput,
} from "@/lib/actions/pillars"
import {
  createQuestion,
  getQuestionsByPillar,
  CreateQuestionInput,
} from "@/lib/actions/questions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { mediaType } from "@/generated/prisma/enums"

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
 * Invalidates user rating queries on success
 */
export function useCreateRatingPillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRatingPillarInput) => createRatingPillar(input),
    onSuccess: (_, variables) => {
      // Invalidate user's ratings for this series
      queryClient.invalidateQueries({
        queryKey: ["userRatingPillars", variables.userId, variables.seriesId],
      })
      // Also invalidate any series-related queries that might show ratings
      queryClient.invalidateQueries({ queryKey: ["series"] })
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
