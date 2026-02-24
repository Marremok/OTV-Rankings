"use server"

import prisma from "../prisma"

// ============================================
// FAVORITES TYPES
// ============================================

export interface FavoriteItem {
  id: string              // UserFavorite.id
  mediaId: string
  mediaType: "SERIES" | "CHARACTER"
  rank: number            // 1–4
  title: string           // Series.title or Character.name
  imageUrl: string | null
  slug: string | null
  globalScore: number     // Series.score or Character.score
  userScore: number | null // avg of user's own pillar ratings for this item
}

export interface GetFavoritesResult {
  series: FavoriteItem[]     // sorted by rank asc
  characters: FavoriteItem[] // sorted by rank asc
}

// ============================================
// FETCH FAVORITES
// ============================================

/**
 * Fetches all favorites for a user, joining media data and computing per-item user scores.
 */
export async function getUserFavorites(userId: string): Promise<GetFavoritesResult> {
  try {
    if (!userId) return { series: [], characters: [] }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      orderBy: [{ mediaType: "asc" }, { rank: "asc" }],
    })

    const seriesFavs = favorites.filter((f) => f.mediaType === "SERIES")
    const characterFavs = favorites.filter((f) => f.mediaType === "CHARACTER")

    const seriesIds = seriesFavs.map((f) => f.mediaId)
    const characterIds = characterFavs.map((f) => f.mediaId)

    // Batch fetch media data + user scores in parallel
    const [seriesData, characterData, seriesUserScores, characterUserScores] =
      await Promise.all([
        seriesIds.length > 0
          ? prisma.series.findMany({
              where: { id: { in: seriesIds } },
              select: { id: true, title: true, slug: true, imageUrl: true, score: true },
            })
          : [],
        characterIds.length > 0
          ? prisma.character.findMany({
              where: { id: { in: characterIds } },
              select: { id: true, name: true, slug: true, posterUrl: true, score: true },
            })
          : [],
        seriesIds.length > 0
          ? prisma.ratingPillar.groupBy({
              by: ["seriesId"],
              where: { userId, seriesId: { in: seriesIds } },
              _avg: { score: true },
            })
          : [],
        characterIds.length > 0
          ? prisma.characterRatingPillar.groupBy({
              by: ["characterId"],
              where: { userId, characterId: { in: characterIds } },
              _avg: { score: true },
            })
          : [],
      ])

    // Build lookup maps
    const seriesMap = new Map(seriesData.map((s) => [s.id, s]))
    const characterMap = new Map(characterData.map((c) => [c.id, c]))
    const seriesScoreMap = new Map(
      seriesUserScores.map((r) => [r.seriesId, r._avg.score])
    )
    const characterScoreMap = new Map(
      characterUserScores.map((r) => [r.characterId, r._avg.score])
    )

    const mapToItem = (fav: (typeof favorites)[0]): FavoriteItem | null => {
      if (fav.mediaType === "SERIES") {
        const s = seriesMap.get(fav.mediaId)
        if (!s) return null
        const rawUserScore = seriesScoreMap.get(fav.mediaId) ?? null
        return {
          id: fav.id,
          mediaId: fav.mediaId,
          mediaType: "SERIES",
          rank: fav.rank,
          title: s.title,
          imageUrl: s.imageUrl,
          slug: s.slug,
          globalScore: s.score,
          userScore: rawUserScore !== null ? Math.round(rawUserScore * 100) / 100 : null,
        }
      } else {
        const c = characterMap.get(fav.mediaId)
        if (!c) return null
        const rawUserScore = characterScoreMap.get(fav.mediaId) ?? null
        return {
          id: fav.id,
          mediaId: fav.mediaId,
          mediaType: "CHARACTER",
          rank: fav.rank,
          title: c.name,
          imageUrl: c.posterUrl,
          slug: c.slug,
          globalScore: c.score,
          userScore: rawUserScore !== null ? Math.round(rawUserScore * 100) / 100 : null,
        }
      }
    }

    const series = seriesFavs.map(mapToItem).filter(Boolean) as FavoriteItem[]
    const characters = characterFavs.map(mapToItem).filter(Boolean) as FavoriteItem[]

    return { series, characters }
  } catch (error) {
    console.error("Error fetching user favorites:", error)
    return { series: [], characters: [] }
  }
}

// ============================================
// SET FAVORITE (insert or move to rank)
// ============================================

/**
 * Sets a favorite at a specific rank slot for a user.
 * Uses delete-then-recreate to avoid unique constraint conflicts.
 */
export async function setUserFavorite(
  userId: string,
  mediaType: "SERIES" | "CHARACTER",
  rank: number,
  mediaId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || !mediaId) {
      return { success: false, error: "Missing required fields" }
    }
    if (rank < 1 || rank > 4) {
      return { success: false, error: "Rank must be between 1 and 4" }
    }

    // Fetch all current favorites for this user + mediaType
    const current = await prisma.userFavorite.findMany({
      where: { userId, mediaType },
      orderBy: { rank: "asc" },
    })

    // Remove any existing entry for this mediaId (it may be at a different rank)
    const withoutThis = current.filter((f) => f.mediaId !== mediaId)

    // Remove any existing entry at the target rank
    const withoutTargetRank = withoutThis.filter((f) => f.rank !== rank)

    // Recompact remaining items, assigning sequential ranks, leaving gap for target
    const others = withoutTargetRank.slice(0, 3) // at most 3 others

    // Build new order: insert the chosen item at `rank`, re-fill others
    const newEntries: Array<{ mediaId: string; rank: number }> = [
      { mediaId, rank },
      ...others.map((f, i) => {
        // Assign sequential ranks avoiding the target rank
        const availableRanks = [1, 2, 3, 4].filter((r) => r !== rank)
        return { mediaId: f.mediaId, rank: availableRanks[i] }
      }),
    ]

    // Atomically replace all favorites for this mediaType
    await prisma.$transaction([
      prisma.userFavorite.deleteMany({ where: { userId, mediaType } }),
      prisma.userFavorite.createMany({
        data: newEntries.map((e) => ({
          id: crypto.randomUUID(),
          userId,
          mediaType,
          mediaId: e.mediaId,
          rank: e.rank,
          updatedAt: new Date(),
        })),
      }),
    ])

    // Sync UserSeriesStatus.isFavorite for SERIES type
    if (mediaType === "SERIES") {
      // Set isFavorite=true for the newly added series
      await prisma.userSeriesStatus.upsert({
        where: { userId_seriesId: { userId, seriesId: mediaId } },
        create: { userId, seriesId: mediaId, isFavorite: true },
        update: { isFavorite: true },
      })
      // Set isFavorite=false for the series that was displaced from the target rank (if any)
      const ejectedSeries = withoutThis.find((f) => f.rank === rank)
      if (ejectedSeries) {
        await prisma.userSeriesStatus.updateMany({
          where: { userId, seriesId: ejectedSeries.mediaId },
          data: { isFavorite: false },
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error setting user favorite:", error)
    return { success: false, error: "Failed to set favorite" }
  }
}

// ============================================
// REMOVE FAVORITE
// ============================================

/**
 * Removes a favorite by mediaId. Recompacts remaining ranks (1, 2, 3, 4 without gaps).
 */
export async function removeUserFavorite(
  userId: string,
  mediaType: "SERIES" | "CHARACTER",
  mediaId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || !mediaId) {
      return { success: false, error: "Missing required fields" }
    }

    // Fetch all remaining after removal, sorted by current rank
    const remaining = await prisma.userFavorite.findMany({
      where: { userId, mediaType, NOT: { mediaId } },
      orderBy: { rank: "asc" },
    })

    // Recompact: assign sequential ranks 1, 2, 3...
    const recompacted = remaining.map((f, i) => ({ mediaId: f.mediaId, rank: i + 1 }))

    await prisma.$transaction([
      prisma.userFavorite.deleteMany({ where: { userId, mediaType } }),
      ...(recompacted.length > 0
        ? [
            prisma.userFavorite.createMany({
              data: recompacted.map((e) => ({
                id: crypto.randomUUID(),
                userId,
                mediaType,
                mediaId: e.mediaId,
                rank: e.rank,
                updatedAt: new Date(),
              })),
            }),
          ]
        : []),
    ])

    // Sync UserSeriesStatus.isFavorite for SERIES type
    if (mediaType === "SERIES") {
      await prisma.userSeriesStatus.updateMany({
        where: { userId, seriesId: mediaId },
        data: { isFavorite: false },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error removing user favorite:", error)
    return { success: false, error: "Failed to remove favorite" }
  }
}

// ============================================
// REORDER FAVORITES
// ============================================

/**
 * Atomically replaces all favorites for one mediaType with a new rank order.
 * newOrder must contain exactly the current mediaIds with new rank assignments.
 */
export async function reorderUserFavorites(
  userId: string,
  mediaType: "SERIES" | "CHARACTER",
  newOrder: Array<{ mediaId: string; rank: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: "Missing required fields" }
    }
    if (newOrder.some((o) => o.rank < 1 || o.rank > 4)) {
      return { success: false, error: "Ranks must be between 1 and 4" }
    }

    await prisma.$transaction([
      prisma.userFavorite.deleteMany({ where: { userId, mediaType } }),
      prisma.userFavorite.createMany({
        data: newOrder.map((o) => ({
          id: crypto.randomUUID(),
          userId,
          mediaType,
          mediaId: o.mediaId,
          rank: o.rank,
          updatedAt: new Date(),
        })),
      }),
    ])

    return { success: true }
  } catch (error) {
    console.error("Error reordering user favorites:", error)
    return { success: false, error: "Failed to reorder favorites" }
  }
}

// ============================================
// TOGGLE FAVORITE FROM SERIES PAGE
// ============================================

/**
 * Toggles a series in/out of the user's ranked favorites (from the series page).
 * - If the series is already a favorite → removes it.
 * - If there's a free slot (< 4) → adds it at the next available rank.
 * - If all 4 slots are taken → returns { action: "full", currentFavorites } so the
 *   UI can open the ReplaceFavoriteDialog.
 */
export async function toggleFavoriteFromSeriesPage(
  userId: string,
  seriesId: string
): Promise<
  | { action: "removed" }
  | { action: "added" }
  | { action: "full"; currentFavorites: FavoriteItem[] }
> {
  try {
    if (!userId || !seriesId) {
      throw new Error("Missing required fields")
    }

    // Check if already a favorite
    const existing = await prisma.userFavorite.findFirst({
      where: { userId, mediaType: "SERIES", mediaId: seriesId },
    })

    if (existing) {
      await removeUserFavorite(userId, "SERIES", seriesId)
      return { action: "removed" }
    }

    // Count current SERIES favorites
    const currentFavs = await prisma.userFavorite.findMany({
      where: { userId, mediaType: "SERIES" },
      orderBy: { rank: "asc" },
    })

    if (currentFavs.length >= 4) {
      // Return current favorites so UI can show replace dialog
      const favoritesResult = await getUserFavorites(userId)
      return { action: "full", currentFavorites: favoritesResult.series }
    }

    // Find the next available rank
    const usedRanks = new Set(currentFavs.map((f) => f.rank))
    const nextRank = [1, 2, 3, 4].find((r) => !usedRanks.has(r)) ?? (currentFavs.length + 1)

    await setUserFavorite(userId, "SERIES", nextRank, seriesId)
    return { action: "added" }
  } catch (error) {
    console.error("Error toggling favorite from series page:", error)
    throw error
  }
}
