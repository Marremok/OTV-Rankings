"use server"

import prisma from "../prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@/generated/prisma/client"

// ============================================
// TYPES
// ============================================

// Shape of pillar scores stored in Series.pillarScores JSON field
export interface PillarScoreData {
  avgScore: number
  raterCount: number
  pillarId: string
  pillarType: string
  pillarWeight: number
}

export interface SeriesPillarScores {
  [pillarType: string]: PillarScoreData
}

// ============================================
// AGGREGATION FUNCTIONS
// ============================================

/**
 * Aggregates all RatingPillars for a single series into pillar scores.
 * Groups by pillarId and calculates average score and rater count.
 *
 * @param seriesId - The series to aggregate scores for
 * @returns Object with pillar type as key and score data as value
 */
async function aggregatePillarScoresForSeries(seriesId: string): Promise<SeriesPillarScores> {
  // Get all rating pillars for this series with pillar template info
  const ratingPillars = await prisma.ratingPillar.findMany({
    where: { seriesId },
    include: {
      pillar: {
        select: {
          id: true,
          type: true,
          weight: true,
        },
      },
    },
  })

  // Group ratings by pillar type
  const pillarGroups: Record<string, {
    scores: number[]
    pillarId: string
    pillarType: string
    pillarWeight: number
  }> = {}

  for (const rating of ratingPillars) {
    const { type, id, weight } = rating.pillar

    if (!pillarGroups[type]) {
      pillarGroups[type] = {
        scores: [],
        pillarId: id,
        pillarType: type,
        pillarWeight: weight,
      }
    }

    pillarGroups[type].scores.push(rating.score)
  }

  // Calculate average for each pillar
  const pillarScores: SeriesPillarScores = {}

  for (const [type, group] of Object.entries(pillarGroups)) {
    const sum = group.scores.reduce((acc, score) => acc + score, 0)
    const avgScore = Math.round((sum / group.scores.length) * 100) / 100 // Round to 2 decimals

    pillarScores[type] = {
      avgScore,
      raterCount: group.scores.length,
      pillarId: group.pillarId,
      pillarType: type,
      pillarWeight: group.pillarWeight,
    }
  }

  return pillarScores
}

/**
 * Calculates overall series score from pillar scores.
 * Uses weighted average based on pillar weights.
 *
 * Formula: Σ(avgScore × pillarWeight) / Σ(pillarWeight)
 *
 * @param pillarScores - Aggregated pillar scores
 * @returns Weighted average score rounded to 2 decimals
 */
function calculateOverallScore(pillarScores: SeriesPillarScores): number {
  const entries = Object.values(pillarScores)

  if (entries.length === 0) {
    return 0
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const pillar of entries) {
    weightedSum += pillar.avgScore * pillar.pillarWeight
    totalWeight += pillar.pillarWeight
  }

  if (totalWeight === 0) {
    return 0
  }

  return Math.round((weightedSum / totalWeight) * 100) / 100
}

/**
 * Updates pillar scores for a single series.
 * Aggregates all user ratings and stores the result in Series.pillarScores.
 *
 * @param seriesId - The series to update
 */
export async function updateSeriesPillarScores(seriesId: string) {
  try {
    const pillarScores = await aggregatePillarScoresForSeries(seriesId)

    await prisma.series.update({
      where: { id: seriesId },
      data: {
        pillarScores: pillarScores as object,
        updatedAt: new Date(),
      },
    })

    return pillarScores
  } catch (error) {
    console.error(`Error updating pillar scores for series ${seriesId}:`, error)
    throw new Error("Failed to update pillar scores")
  }
}

/**
 * Updates overall score for a single series based on its pillar scores.
 * Must be called after updateSeriesPillarScores.
 *
 * @param seriesId - The series to update
 */
export async function updateSeriesOverallScore(seriesId: string) {
  try {
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      select: { pillarScores: true },
    })

    if (!series) {
      throw new Error("Series not found")
    }

    const pillarScores = (series.pillarScores as unknown as SeriesPillarScores) || {}
    const overallScore = calculateOverallScore(pillarScores)

    await prisma.series.update({
      where: { id: seriesId },
      data: {
        score: overallScore,
        updatedAt: new Date(),
      },
    })

    return overallScore
  } catch (error) {
    console.error(`Error updating overall score for series ${seriesId}:`, error)
    throw new Error("Failed to update overall score")
  }
}

/**
 * Updates both pillar scores and overall score for a single series in one pass.
 * More efficient than calling the two functions separately.
 *
 * @param seriesId - The series to update
 */
export async function updateSeriesScores(seriesId: string) {
  try {
    const pillarScores = await aggregatePillarScoresForSeries(seriesId)
    const overallScore = calculateOverallScore(pillarScores)

    await prisma.series.update({
      where: { id: seriesId },
      data: {
        pillarScores: pillarScores as object,
        score: overallScore,
        updatedAt: new Date(),
      },
    })

    // Revalidate the series page cache
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      select: { slug: true },
    })

    if (series?.slug) {
      revalidatePath(`/series/${series.slug}`)
    }

    return { pillarScores: pillarScores as object, overallScore }
  } catch (error) {
    console.error(`Error updating scores for series ${seriesId}:`, error)
    throw new Error("Failed to update series scores")
  }
}

// ============================================
// BATCH OPERATIONS (for cron jobs)
// ============================================

/**
 * Updates scores for ALL series in the database.
 * Optimized to minimize database queries using batch operations.
 *
 * This is the main function to be called by cron jobs.
 * It performs both pillar score aggregation and overall score calculation
 * in a single pass per series.
 *
 * @returns Summary of updated series
 */
export async function updateAllSeriesScores() {
  console.log("[Scoring] Starting batch score update for all series...")
  const startTime = Date.now()

  try {
    // Get all series IDs
    const allSeries = await prisma.series.findMany({
      select: { id: true, slug: true },
    })

    console.log(`[Scoring] Found ${allSeries.length} series to update`)

    // Get all rating pillars with pillar info in one query (avoiding N+1)
    const allRatingPillars = await prisma.ratingPillar.findMany({
      include: {
        pillar: {
          select: {
            id: true,
            type: true,
            weight: true,
          },
        },
      },
    })

    console.log(`[Scoring] Found ${allRatingPillars.length} total rating pillars`)

    // Group rating pillars by seriesId
    const ratingsBySeriesId: Record<string, typeof allRatingPillars> = {}
    for (const rating of allRatingPillars) {
      if (!ratingsBySeriesId[rating.seriesId]) {
        ratingsBySeriesId[rating.seriesId] = []
      }
      ratingsBySeriesId[rating.seriesId].push(rating)
    }

    // Process each series
    const results: { seriesId: string; slug: string | null; score: number; pillarCount: number }[] = []

    for (const series of allSeries) {
      const seriesRatings = ratingsBySeriesId[series.id] || []

      // Aggregate pillar scores for this series
      const pillarGroups: Record<string, {
        scores: number[]
        pillarId: string
        pillarType: string
        pillarWeight: number
      }> = {}

      for (const rating of seriesRatings) {
        const { type, id, weight } = rating.pillar

        if (!pillarGroups[type]) {
          pillarGroups[type] = {
            scores: [],
            pillarId: id,
            pillarType: type,
            pillarWeight: weight,
          }
        }

        pillarGroups[type].scores.push(rating.score)
      }

      // Calculate averages
      const pillarScores: SeriesPillarScores = {}
      for (const [type, group] of Object.entries(pillarGroups)) {
        const sum = group.scores.reduce((acc, score) => acc + score, 0)
        const avgScore = Math.round((sum / group.scores.length) * 100) / 100

        pillarScores[type] = {
          avgScore,
          raterCount: group.scores.length,
          pillarId: group.pillarId,
          pillarType: type,
          pillarWeight: group.pillarWeight,
        }
      }

      // Calculate overall score
      const overallScore = calculateOverallScore(pillarScores)

      // Update series in database
      await prisma.series.update({
        where: { id: series.id },
        data: {
          pillarScores: Object.keys(pillarScores).length > 0 ? (pillarScores as object) : Prisma.JsonNull,
          score: overallScore,
          updatedAt: new Date(),
        },
      })

      results.push({
        seriesId: series.id,
        slug: series.slug,
        score: overallScore,
        pillarCount: Object.keys(pillarScores).length,
      })
    }

    const duration = Date.now() - startTime
    console.log(`[Scoring] Batch update complete in ${duration}ms. Updated ${results.length} series.`)

    // Revalidate rankings page
    revalidatePath("/rankings")
    revalidatePath("/rankings/tv-series")

    return {
      success: true,
      updatedCount: results.length,
      durationMs: duration,
      results,
    }
  } catch (error) {
    console.error("[Scoring] Batch update failed:", error)
    throw new Error("Failed to update all series scores")
  }
}

/**
 * Updates rankings for all series based on their scores.
 * Should be called after updateAllSeriesScores.
 *
 * Assigns ranking 1 to highest score, 2 to second highest, etc.
 */
export async function updateAllSeriesRankings() {
  console.log("[Scoring] Updating series rankings...")
  const startTime = Date.now()

  try {
    // Get all series ordered by score descending
    const allSeries = await prisma.series.findMany({
      select: { id: true, score: true },
      orderBy: { score: "desc" },
    })

    // Update rankings in a single transaction
    await prisma.$transaction(
      allSeries.map((s, i) =>
        prisma.series.update({ where: { id: s.id }, data: { ranking: i + 1 } })
      )
    )

    const duration = Date.now() - startTime
    console.log(`[Scoring] Rankings updated in ${duration}ms. Ranked ${allSeries.length} series.`)

    // Revalidate rankings page
    revalidatePath("/rankings")
    revalidatePath("/rankings/tv-series")

    return {
      success: true,
      rankedCount: allSeries.length,
      durationMs: duration,
    }
  } catch (error) {
    console.error("[Scoring] Ranking update failed:", error)
    throw new Error("Failed to update series rankings")
  }
}

/**
 * Master function that updates both scores and rankings for all series.
 * This is the recommended function to call from cron jobs.
 */
export async function updateAllSeriesScoresAndRankings() {
  console.log("[Scoring] Starting full score and ranking update...")
  const startTime = Date.now()

  try {
    // Step 1: Update all pillar scores and overall scores
    const scoresResult = await updateAllSeriesScores()

    // Step 2: Update rankings based on new scores
    const rankingsResult = await updateAllSeriesRankings()

    const totalDuration = Date.now() - startTime
    console.log(`[Scoring] Full update complete in ${totalDuration}ms`)

    return {
      success: true,
      totalDurationMs: totalDuration,
      scores: scoresResult,
      rankings: rankingsResult,
    }
  } catch (error) {
    console.error("[Scoring] Full update failed:", error)
    // Re-throw with original error message for debugging
    if (error instanceof Error) {
      throw new Error(`Failed to update scores and rankings: ${error.message}`)
    }
    throw error
  }
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Gets the aggregated pillar scores for a series.
 * Returns the data needed for RadarChart rendering.
 *
 * @param seriesId - The series to get scores for
 */
export async function getSeriesPillarScores(seriesId: string) {
  try {
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      select: { pillarScores: true, score: true },
      cacheStrategy: { swr: 120, ttl: 60 },
    })

    if (!series) {
      throw new Error("Series not found")
    }

    return {
      pillarScores: (series.pillarScores as unknown as SeriesPillarScores) || {},
      overallScore: series.score,
    }
  } catch (error) {
    console.error(`Error getting pillar scores for series ${seriesId}:`, error)
    throw new Error("Failed to get pillar scores")
  }
}

/**
 * Gets pillar scores for a series by slug.
 * Convenience function for the series page.
 *
 * @param slug - The series slug
 */
export async function getSeriesPillarScoresBySlug(slug: string) {
  try {
    const series = await prisma.series.findUnique({
      where: { slug },
      select: { id: true, pillarScores: true, score: true },
      cacheStrategy: { swr: 120, ttl: 60 },
    })

    if (!series) {
      throw new Error("Series not found")
    }

    return {
      seriesId: series.id,
      pillarScores: (series.pillarScores as unknown as SeriesPillarScores) || {},
      overallScore: series.score,
    }
  } catch (error) {
    console.error(`Error getting pillar scores for slug ${slug}:`, error)
    throw new Error("Failed to get pillar scores")
  }
}

// ============================================
// CHARACTER SCORING (mirrors series scoring)
// ============================================

/**
 * Gets aggregated pillar scores for a character by slug.
 * Used by CharacterRatingSummary to display community averages.
 */
export async function getCharacterPillarScoresBySlug(slug: string) {
  try {
    const character = await prisma.character.findUnique({
      where: { slug },
      select: { id: true, pillarScores: true, score: true },
      cacheStrategy: { swr: 120, ttl: 60 },
    })

    if (!character) {
      throw new Error("Character not found")
    }

    return {
      characterId:  character.id,
      pillarScores: (character.pillarScores as unknown as SeriesPillarScores) || {},
      overallScore: character.score,
    }
  } catch (error) {
    console.error(`Error getting pillar scores for character slug ${slug}:`, error)
    throw new Error("Failed to get character pillar scores")
  }
}

/**
 * Updates both pillar scores and overall score for a single character in one pass.
 * Mirrors updateSeriesScores exactly.
 */
export async function updateCharacterScores(characterId: string) {
  try {
    // Aggregate CharacterRatingPillar rows for this character
    const ratingPillars = await prisma.characterRatingPillar.findMany({
      where: { characterId },
      include: {
        pillar: { select: { id: true, type: true, weight: true } },
      },
    })

    const pillarGroups: Record<string, {
      scores: number[]
      pillarId: string
      pillarType: string
      pillarWeight: number
    }> = {}

    for (const rating of ratingPillars) {
      const { type, id, weight } = rating.pillar
      if (!pillarGroups[type]) {
        pillarGroups[type] = { scores: [], pillarId: id, pillarType: type, pillarWeight: weight }
      }
      pillarGroups[type].scores.push(rating.score)
    }

    const pillarScores: SeriesPillarScores = {}
    for (const [type, group] of Object.entries(pillarGroups)) {
      const sum = group.scores.reduce((acc, s) => acc + s, 0)
      pillarScores[type] = {
        avgScore:     Math.round((sum / group.scores.length) * 100) / 100,
        raterCount:   group.scores.length,
        pillarId:     group.pillarId,
        pillarType:   type,
        pillarWeight: group.pillarWeight,
      }
    }

    const overallScore = calculateOverallScore(pillarScores)

    await prisma.character.update({
      where: { id: characterId },
      data: {
        pillarScores: pillarScores as object,
        score:        overallScore,
        updatedAt:    new Date(),
      },
    })

    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { slug: true },
    })
    if (character?.slug) {
      revalidatePath(`/characters/${character.slug}`)
    }

    return { pillarScores: pillarScores as object, overallScore }
  } catch (error) {
    console.error(`Error updating scores for character ${characterId}:`, error)
    throw new Error("Failed to update character scores")
  }
}

/**
 * Updates scores for ALL characters in the database.
 * Batch-optimized to avoid N+1 queries. Call from cron job.
 */
export async function updateAllCharacterScores() {
  console.log("[Scoring] Starting batch score update for all characters...")
  const startTime = Date.now()

  try {
    const allCharacters = await prisma.character.findMany({
      select: { id: true, slug: true },
    })

    const allRatingPillars = await prisma.characterRatingPillar.findMany({
      include: {
        pillar: { select: { id: true, type: true, weight: true } },
      },
    })

    const ratingsByCharacterId: Record<string, typeof allRatingPillars> = {}
    for (const r of allRatingPillars) {
      if (!ratingsByCharacterId[r.characterId]) ratingsByCharacterId[r.characterId] = []
      ratingsByCharacterId[r.characterId].push(r)
    }

    const results: { characterId: string; slug: string | null; score: number; pillarCount: number }[] = []

    for (const character of allCharacters) {
      const ratings = ratingsByCharacterId[character.id] || []

      const pillarGroups: Record<string, {
        scores: number[]
        pillarId: string
        pillarType: string
        pillarWeight: number
      }> = {}

      for (const r of ratings) {
        const { type, id, weight } = r.pillar
        if (!pillarGroups[type]) {
          pillarGroups[type] = { scores: [], pillarId: id, pillarType: type, pillarWeight: weight }
        }
        pillarGroups[type].scores.push(r.score)
      }

      const pillarScores: SeriesPillarScores = {}
      for (const [type, group] of Object.entries(pillarGroups)) {
        const sum = group.scores.reduce((acc, s) => acc + s, 0)
        pillarScores[type] = {
          avgScore:     Math.round((sum / group.scores.length) * 100) / 100,
          raterCount:   group.scores.length,
          pillarId:     group.pillarId,
          pillarType:   type,
          pillarWeight: group.pillarWeight,
        }
      }

      const overallScore = calculateOverallScore(pillarScores)

      await prisma.character.update({
        where: { id: character.id },
        data: {
          pillarScores: Object.keys(pillarScores).length > 0 ? (pillarScores as object) : Prisma.JsonNull,
          score:        overallScore,
          updatedAt:    new Date(),
        },
      })

      results.push({ characterId: character.id, slug: character.slug, score: overallScore, pillarCount: Object.keys(pillarScores).length })
    }

    const duration = Date.now() - startTime
    console.log(`[Scoring] Character batch update complete in ${duration}ms. Updated ${results.length} characters.`)

    revalidatePath("/rankings/characters")

    return { success: true, updatedCount: results.length, durationMs: duration, results }
  } catch (error) {
    console.error("[Scoring] Character batch update failed:", error)
    throw new Error("Failed to update all character scores")
  }
}

/**
 * Updates rankings for all characters based on their scores.
 * Assigns ranking 1 to highest score, etc. Mirrors updateAllSeriesRankings.
 */
export async function updateAllCharacterRankings() {
  console.log("[Scoring] Updating character rankings...")
  const startTime = Date.now()

  try {
    const allCharacters = await prisma.character.findMany({
      select: { id: true, score: true },
      orderBy: { score: "desc" },
    })

    await prisma.$transaction(
      allCharacters.map((c, i) =>
        prisma.character.update({ where: { id: c.id }, data: { ranking: i + 1 } })
      )
    )

    const duration = Date.now() - startTime
    console.log(`[Scoring] Character rankings updated in ${duration}ms. Ranked ${allCharacters.length} characters.`)

    revalidatePath("/rankings/characters")

    return { success: true, rankedCount: allCharacters.length, durationMs: duration }
  } catch (error) {
    console.error("[Scoring] Character ranking update failed:", error)
    throw new Error("Failed to update character rankings")
  }
}

/**
 * Master function: updates both scores and rankings for all characters.
 * Call from cron job alongside updateAllSeriesScoresAndRankings.
 */
export async function updateAllCharacterScoresAndRankings() {
  console.log("[Scoring] Starting full character score and ranking update...")
  const startTime = Date.now()

  try {
    const scoresResult  = await updateAllCharacterScores()
    const rankingsResult = await updateAllCharacterRankings()
    const totalDuration  = Date.now() - startTime

    console.log(`[Scoring] Full character update complete in ${totalDuration}ms`)

    return { success: true, totalDurationMs: totalDuration, scores: scoresResult, rankings: rankingsResult }
  } catch (error) {
    console.error("[Scoring] Full character update failed:", error)
    if (error instanceof Error) throw new Error(`Failed to update character scores and rankings: ${error.message}`)
    throw error
  }
}

// ============================================
// GLOBAL UPDATE (all media types)
// ============================================

/**
 * Master function: updates scores and rankings for ALL media types (series + characters).
 * This is the recommended function to call from cron jobs.
 * Runs series and character updates in parallel for efficiency.
 */
export async function updateAllScoresAndRankings() {
  console.log("[Scoring] Starting global score and ranking update (series + characters)...")
  const startTime = Date.now()

  try {
    const [seriesResult, characterResult] = await Promise.all([
      updateAllSeriesScoresAndRankings(),
      updateAllCharacterScoresAndRankings(),
    ])

    const totalDuration = Date.now() - startTime
    console.log(`[Scoring] Global update complete in ${totalDuration}ms`)

    return {
      success: true,
      totalDurationMs: totalDuration,
      series: seriesResult,
      characters: characterResult,
    }
  } catch (error) {
    console.error("[Scoring] Global update failed:", error)
    if (error instanceof Error) throw new Error(`Failed to update all scores and rankings: ${error.message}`)
    throw error
  }
}
