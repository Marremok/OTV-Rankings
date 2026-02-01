"use server"

import prisma from "../prisma"

// ============================================
// USER PROFILE DATA TYPES
// ============================================

export interface HighestRating {
  seriesId: string
  seriesName: string
  seriesSlug: string | null
  seriesImageUrl: string | null
  pillarType: string
  pillarId: string
  score: number
  date: Date
}

export interface FavoriteRating {
  seriesName: string
  seriesSlug: string | null
  pillarType: string
  score: number
}

export interface UserProfileStats {
  totalRatings: number
  seriesRated: number
  avgScore: number
  favoriteRating: FavoriteRating | null
}

export interface RecentRating {
  id: string
  seriesName: string
  seriesSlug: string | null
  seriesImageUrl: string | null
  pillarType: string
  score: number
  date: Date
}

export interface PillarBreakdown {
  pillarType: string
  pillarId: string
  count: number
  avgScore: number
  weight: number
}

export interface UserProfileData {
  stats: UserProfileStats
  recentRatings: RecentRating[]
  pillarBreakdown: PillarBreakdown[]
  joinDate: Date | null
}

// ============================================
// USER PROFILE ACTIONS
// ============================================

/**
 * Fetches comprehensive profile data for a user.
 * Calculates stats dynamically from RatingPillar records.
 *
 * Design decision: We calculate stats dynamically rather than storing them
 * on the User model because:
 * 1. User ratings change frequently, keeping fields in sync would be complex
 * 2. The data volume per user is manageable for dynamic calculation
 * 3. This ensures stats are always accurate and up-to-date
 */
export async function getUserProfileData(userId: string): Promise<UserProfileData | null> {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    // Fetch user to get join date
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    })

    if (!user) {
      return null
    }

    // Fetch all user's rating pillars with related data
    const ratingPillars = await prisma.ratingPillar.findMany({
      where: { userId },
      include: {
        pillar: {
          select: {
            id: true,
            type: true,
            weight: true,
          },
        },
        series: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    // Calculate stats
    const totalRatings = ratingPillars.length
    const uniqueSeriesIds = new Set(ratingPillars.map((rp) => rp.seriesId))
    const seriesRated = uniqueSeriesIds.size

    // Calculate average score
    const avgScore =
      totalRatings > 0
        ? Math.round(
            (ratingPillars.reduce((sum, rp) => sum + rp.score, 0) / totalRatings) * 100
          ) / 100
        : 0

    // Calculate pillar breakdown and find top pillar
    const pillarMap: Record<
      string,
      { pillarId: string; scores: number[]; weight: number }
    > = {}

    for (const rp of ratingPillars) {
      const type = rp.pillar.type
      if (!pillarMap[type]) {
        pillarMap[type] = {
          pillarId: rp.pillar.id,
          scores: [],
          weight: rp.pillar.weight,
        }
      }
      pillarMap[type].scores.push(rp.score)
    }

    // Build pillar breakdown array
    const pillarBreakdown: PillarBreakdown[] = Object.entries(pillarMap)
      .map(([pillarType, data]) => ({
        pillarType,
        pillarId: data.pillarId,
        count: data.scores.length,
        avgScore:
          Math.round(
            (data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length) * 100
          ) / 100,
        weight: data.weight,
      }))
      .sort((a, b) => b.count - a.count) // Sort by most rated

    // Find favorite rating (highest scored)
    let favoriteRating: FavoriteRating | null = null
    if (ratingPillars.length > 0) {
      const highest = ratingPillars.reduce((max, rp) =>
        rp.score > max.score ? rp : max
      )
      favoriteRating = {
        seriesName: highest.series.title,
        seriesSlug: highest.series.slug,
        pillarType: highest.pillar.type,
        score: Math.round(highest.score * 100) / 100,
      }
    }

    // Build recent ratings (limit to 4)
    const recentRatings: RecentRating[] = ratingPillars.slice(0, 4).map((rp) => ({
      id: rp.id,
      seriesName: rp.series.title,
      seriesSlug: rp.series.slug,
      seriesImageUrl: rp.series.imageUrl,
      pillarType: rp.pillar.type,
      score: Math.round(rp.score * 100) / 100,
      date: rp.updatedAt,
    }))

    return {
      stats: {
        totalRatings,
        seriesRated,
        avgScore,
        favoriteRating,
      },
      recentRatings,
      pillarBreakdown,
      joinDate: user.createdAt,
    }
  } catch (error) {
    console.error("Error fetching user profile data:", error)
    throw new Error("Failed to fetch profile data")
  }
}

/**
 * Fetches user stats only (lighter query for stats display)
 */
export async function getUserStats(userId: string): Promise<UserProfileStats | null> {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    // Aggregate query for stats
    const [totalRatings, uniqueSeries, highestRating] = await Promise.all([
      // Total rating count
      prisma.ratingPillar.count({
        where: { userId },
      }),
      // Unique series count
      prisma.ratingPillar.groupBy({
        by: ["seriesId"],
        where: { userId },
      }),
      // Highest scored rating for favorite
      prisma.ratingPillar.findFirst({
        where: { userId },
        orderBy: { score: "desc" },
        include: {
          series: { select: { title: true, slug: true } },
          pillar: { select: { type: true } },
        },
      }),
    ])

    // Get average score
    const avgResult = await prisma.ratingPillar.aggregate({
      where: { userId },
      _avg: { score: true },
    })

    // Build favorite rating
    let favoriteRating: FavoriteRating | null = null
    if (highestRating) {
      favoriteRating = {
        seriesName: highestRating.series.title,
        seriesSlug: highestRating.series.slug,
        pillarType: highestRating.pillar.type,
        score: Math.round(highestRating.score * 100) / 100,
      }
    }

    return {
      totalRatings,
      seriesRated: uniqueSeries.length,
      avgScore: Math.round((avgResult._avg.score || 0) * 100) / 100,
      favoriteRating,
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return null
  }
}

/**
 * Fetches recent ratings for a user
 */
export async function getUserRecentRatings(
  userId: string,
  limit: number = 4
): Promise<RecentRating[]> {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    const ratingPillars = await prisma.ratingPillar.findMany({
      where: { userId },
      include: {
        pillar: {
          select: { type: true },
        },
        series: {
          select: {
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    })

    return ratingPillars.map((rp) => ({
      id: rp.id,
      seriesName: rp.series.title,
      seriesSlug: rp.series.slug,
      seriesImageUrl: rp.series.imageUrl,
      pillarType: rp.pillar.type,
      score: Math.round(rp.score * 100) / 100,
      date: rp.updatedAt,
    }))
  } catch (error) {
    console.error("Error fetching recent ratings:", error)
    return []
  }
}

/**
 * Fetches pillar breakdown for a user
 */
export async function getUserPillarBreakdown(userId: string): Promise<PillarBreakdown[]> {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    const ratingPillars = await prisma.ratingPillar.findMany({
      where: { userId },
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

    // Group by pillar type
    const pillarMap: Record<
      string,
      { pillarId: string; scores: number[]; weight: number }
    > = {}

    for (const rp of ratingPillars) {
      const type = rp.pillar.type
      if (!pillarMap[type]) {
        pillarMap[type] = {
          pillarId: rp.pillar.id,
          scores: [],
          weight: rp.pillar.weight,
        }
      }
      pillarMap[type].scores.push(rp.score)
    }

    // Build and sort breakdown
    return Object.entries(pillarMap)
      .map(([pillarType, data]) => ({
        pillarType,
        pillarId: data.pillarId,
        count: data.scores.length,
        avgScore:
          Math.round(
            (data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length) * 100
          ) / 100,
        weight: data.weight,
      }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error("Error fetching pillar breakdown:", error)
    return []
  }
}

// ============================================
// HIGHEST RATING ACTION
// ============================================

/**
 * Fetches the user's highest rated pillar across all series
 */
export async function getUserHighestRating(userId: string): Promise<HighestRating | null> {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    const highestRating = await prisma.ratingPillar.findFirst({
      where: { userId },
      orderBy: { score: "desc" },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
        pillar: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    })

    if (!highestRating) {
      return null
    }

    return {
      seriesId: highestRating.series.id,
      seriesName: highestRating.series.title,
      seriesSlug: highestRating.series.slug,
      seriesImageUrl: highestRating.series.imageUrl,
      pillarType: highestRating.pillar.type,
      pillarId: highestRating.pillar.id,
      score: Math.round(highestRating.score * 100) / 100,
      date: highestRating.updatedAt,
    }
  } catch (error) {
    console.error("Error fetching highest rating:", error)
    return null
  }
}

// ============================================
// PROFILE IMAGE ACTIONS
// ============================================

/**
 * Updates user's profile image URL
 */
export async function updateUserProfileImage(
  userId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: imageUrl,
        updatedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating profile image:", error)
    return { success: false, error: "Failed to update profile image" }
  }
}

/**
 * Updates user's hero/banner image URL
 */
export async function updateUserHeroImage(
  userId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        heroImage: imageUrl,
        updatedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating hero image:", error)
    return { success: false, error: "Failed to update hero image" }
  }
}

/**
 * Gets user's profile images (profile and hero)
 */
export async function getUserImages(
  userId: string
): Promise<{ profileImage: string | null; heroImage: string | null } | null> {
  try {
    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileImage: true,
        heroImage: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error fetching user images:", error)
    return null
  }
}

// ============================================
// USER SERIES STATUS TYPES
// ============================================

export interface SeriesStatus {
  seriesId: string
  seriesName: string
  seriesSlug: string | null
  seriesImageUrl: string | null
  wideImageUrl: string | null
  isWatchlist: boolean
  isSeen: boolean
  isWatching: boolean
  isFavorite: boolean
}

export interface CurrentlyWatchingSeries {
  id: string
  seriesId: string
  seriesName: string
  seriesSlug: string | null
  seriesImageUrl: string | null
  wideImageUrl: string | null
  addedAt: Date
}

// ============================================
// USER SERIES STATUS ACTIONS
// ============================================

/**
 * Gets all series the user is currently watching
 */
export async function getUserCurrentlyWatching(
  userId: string
): Promise<CurrentlyWatchingSeries[]> {
  try {
    if (!userId) {
      return []
    }

    const statuses = await prisma.userSeriesStatus.findMany({
      where: {
        userId,
        isWatching: true,
      },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            wideImageUrl: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return statuses.map((status) => ({
      id: status.id,
      seriesId: status.series.id,
      seriesName: status.series.title,
      seriesSlug: status.series.slug,
      seriesImageUrl: status.series.imageUrl,
      wideImageUrl: status.series.wideImageUrl,
      addedAt: status.updatedAt,
    }))
  } catch (error) {
    console.error("Error fetching currently watching:", error)
    return []
  }
}

/**
 * Gets count of series in each status category for a user
 */
export async function getUserSeriesStatusCounts(
  userId: string
): Promise<{
  watchlist: number
  seen: number
  watching: number
  favorites: number
}> {
  try {
    if (!userId) {
      return { watchlist: 0, seen: 0, watching: 0, favorites: 0 }
    }

    const [watchlist, seen, watching, favorites] = await Promise.all([
      prisma.userSeriesStatus.count({ where: { userId, isWatchlist: true } }),
      prisma.userSeriesStatus.count({ where: { userId, isSeen: true } }),
      prisma.userSeriesStatus.count({ where: { userId, isWatching: true } }),
      prisma.userSeriesStatus.count({ where: { userId, isFavorite: true } }),
    ])

    return { watchlist, seen, watching, favorites }
  } catch (error) {
    console.error("Error fetching series status counts:", error)
    return { watchlist: 0, seen: 0, watching: 0, favorites: 0 }
  }
}

/**
 * Updates a user's series status (watchlist, seen, watching, favorite)
 */
export async function updateUserSeriesStatus(
  userId: string,
  seriesId: string,
  status: {
    isWatchlist?: boolean
    isSeen?: boolean
    isWatching?: boolean
    isFavorite?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || !seriesId) {
      return { success: false, error: "User ID and Series ID are required" }
    }

    await prisma.userSeriesStatus.upsert({
      where: {
        userId_seriesId: { userId, seriesId },
      },
      update: {
        ...status,
        updatedAt: new Date(),
      },
      create: {
        userId,
        seriesId,
        isWatchlist: status.isWatchlist ?? false,
        isSeen: status.isSeen ?? false,
        isWatching: status.isWatching ?? false,
        isFavorite: status.isFavorite ?? false,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating series status:", error)
    return { success: false, error: "Failed to update series status" }
  }
}

/**
 * Gets a user's status for a specific series
 */
export async function getSeriesStatusForUser(
  userId: string,
  seriesId: string
): Promise<{
  isWatchlist: boolean
  isSeen: boolean
  isWatching: boolean
  isFavorite: boolean
} | null> {
  try {
    if (!userId || !seriesId) {
      return null
    }

    const status = await prisma.userSeriesStatus.findUnique({
      where: {
        userId_seriesId: { userId, seriesId },
      },
      select: {
        isWatchlist: true,
        isSeen: true,
        isWatching: true,
        isFavorite: true,
      },
    })

    return status ?? { isWatchlist: false, isSeen: false, isWatching: false, isFavorite: false }
  } catch (error) {
    console.error("Error fetching series status:", error)
    return null
  }
}
