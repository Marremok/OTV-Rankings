"use server"

import prisma from "../prisma"

// ============================================
// PUBLIC USER PROFILE TYPES & ACTIONS
// ============================================

export interface PublicUserProfile {
  id: string;
  name: string;
  image: string | null;
  profileImage: string | null;
  heroImage: string | null;
  createdAt: Date;
}

/**
 * Fetches public profile data for a user (no sensitive info like email)
 */
export async function getPublicUserProfile(userId: string): Promise<PublicUserProfile | null> {
  try {
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      cacheStrategy: { swr: 120, ttl: 60, tags: [`user-profile-${userId}`] },
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        profileImage: true,
        heroImage: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching public user profile:", error);
    return null;
  }
}

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

export interface UserProfileStats {
  totalRatings: number
  avgScore: number
  highestRating: { score: number; title: string; slug: string | null } | null
  lowestRating: { score: number; title: string; slug: string | null } | null
}

export interface RecentRating {
  id: string
  mediaType: "SERIES" | "CHARACTER"
  displayName: string       // series.title or character.name
  slug: string | null
  imageUrl: string | null
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

    // Fetch user + both rating tables in parallel
    const [user, ratingPillars, characterRatingPillars] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
      prisma.ratingPillar.findMany({
        where: { userId },
        include: {
          pillar: { select: { id: true, type: true, weight: true } },
          series: { select: { id: true, title: true, slug: true, imageUrl: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.characterRatingPillar.findMany({
        where: { userId },
        include: {
          pillar: { select: { id: true, type: true, weight: true } },
          character: { select: { id: true, name: true, slug: true, posterUrl: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ])

    if (!user) {
      return null
    }

    const totalRatings = ratingPillars.length + characterRatingPillars.length

    // Combined average score
    const allScores = [
      ...ratingPillars.map((rp) => rp.score),
      ...characterRatingPillars.map((crp) => crp.score),
    ]
    const avgScore =
      allScores.length > 0
        ? Math.round((allScores.reduce((s, v) => s + v, 0) / allScores.length) * 100) / 100
        : 0

    // Highest & lowest rating across both tables
    const allRatingsForMinMax = [
      ...ratingPillars.map((rp) => ({
        score: rp.score,
        title: rp.series.title,
        slug: rp.series.slug,
      })),
      ...characterRatingPillars.map((crp) => ({
        score: crp.score,
        title: crp.character.name,
        slug: crp.character.slug,
      })),
    ]

    let highestRating: UserProfileStats["highestRating"] = null
    let lowestRating: UserProfileStats["lowestRating"] = null
    if (allRatingsForMinMax.length > 0) {
      const highest = allRatingsForMinMax.reduce((max, r) => (r.score > max.score ? r : max))
      const lowest = allRatingsForMinMax.reduce((min, r) => (r.score < min.score ? r : min))
      highestRating = {
        score: Math.round(highest.score * 100) / 100,
        title: highest.title,
        slug: highest.slug,
      }
      lowestRating = {
        score: Math.round(lowest.score * 100) / 100,
        title: lowest.title,
        slug: lowest.slug,
      }
    }

    // Pillar breakdown (series pillars only — characters use same pillar types)
    const pillarMap: Record<string, { pillarId: string; scores: number[]; weight: number }> = {}
    for (const rp of ratingPillars) {
      const type = rp.pillar.type
      if (!pillarMap[type]) {
        pillarMap[type] = { pillarId: rp.pillar.id, scores: [], weight: rp.pillar.weight }
      }
      pillarMap[type].scores.push(rp.score)
    }
    for (const crp of characterRatingPillars) {
      const type = crp.pillar.type
      if (!pillarMap[type]) {
        pillarMap[type] = { pillarId: crp.pillar.id, scores: [], weight: crp.pillar.weight }
      }
      pillarMap[type].scores.push(crp.score)
    }

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
      .sort((a, b) => b.count - a.count)

    // Merge and sort recent ratings across both tables (limit 4)
    const seriesRecent: RecentRating[] = ratingPillars.map((rp) => ({
      id: rp.id,
      mediaType: "SERIES" as const,
      displayName: rp.series.title,
      slug: rp.series.slug,
      imageUrl: rp.series.imageUrl,
      pillarType: rp.pillar.type,
      score: Math.round(rp.score * 100) / 100,
      date: rp.updatedAt,
    }))
    const characterRecent: RecentRating[] = characterRatingPillars.map((crp) => ({
      id: crp.id,
      mediaType: "CHARACTER" as const,
      displayName: crp.character.name,
      slug: crp.character.slug,
      imageUrl: crp.character.posterUrl,
      pillarType: crp.pillar.type,
      score: Math.round(crp.score * 100) / 100,
      date: crp.updatedAt,
    }))
    const recentRatings = [...seriesRecent, ...characterRecent]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 4)

    return {
      stats: { totalRatings, avgScore, highestRating, lowestRating },
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

    const [rpCount, crpCount, rpAvg, crpAvg, rpHigh, crpHigh, rpLow, crpLow] =
      await Promise.all([
        prisma.ratingPillar.count({ where: { userId } }),
        prisma.characterRatingPillar.count({ where: { userId } }),
        prisma.ratingPillar.aggregate({ where: { userId }, _avg: { score: true } }),
        prisma.characterRatingPillar.aggregate({ where: { userId }, _avg: { score: true } }),
        prisma.ratingPillar.findFirst({
          where: { userId },
          orderBy: { score: "desc" },
          include: { series: { select: { title: true, slug: true } } },
        }),
        prisma.characterRatingPillar.findFirst({
          where: { userId },
          orderBy: { score: "desc" },
          include: { character: { select: { name: true, slug: true } } },
        }),
        prisma.ratingPillar.findFirst({
          where: { userId },
          orderBy: { score: "asc" },
          include: { series: { select: { title: true, slug: true } } },
        }),
        prisma.characterRatingPillar.findFirst({
          where: { userId },
          orderBy: { score: "asc" },
          include: { character: { select: { name: true, slug: true } } },
        }),
      ])

    const totalRatings = rpCount + crpCount

    // Combined average
    const avgScore =
      totalRatings > 0
        ? Math.round(
            ((rpCount * (rpAvg._avg.score ?? 0) + crpCount * (crpAvg._avg.score ?? 0)) /
              totalRatings) *
              100
          ) / 100
        : 0

    // Highest across both tables
    const highCandidates = [
      rpHigh ? { score: rpHigh.score, title: rpHigh.series.title, slug: rpHigh.series.slug } : null,
      crpHigh ? { score: crpHigh.score, title: crpHigh.character.name, slug: crpHigh.character.slug } : null,
    ].filter(Boolean) as { score: number; title: string; slug: string | null }[]

    const highestRating =
      highCandidates.length > 0
        ? highCandidates.reduce((max, r) => (r.score > max.score ? r : max))
        : null

    // Lowest across both tables
    const lowCandidates = [
      rpLow ? { score: rpLow.score, title: rpLow.series.title, slug: rpLow.series.slug } : null,
      crpLow ? { score: crpLow.score, title: crpLow.character.name, slug: crpLow.character.slug } : null,
    ].filter(Boolean) as { score: number; title: string; slug: string | null }[]

    const lowestRating =
      lowCandidates.length > 0
        ? lowCandidates.reduce((min, r) => (r.score < min.score ? r : min))
        : null

    return {
      totalRatings,
      avgScore,
      highestRating: highestRating
        ? { ...highestRating, score: Math.round(highestRating.score * 100) / 100 }
        : null,
      lowestRating: lowestRating
        ? { ...lowestRating, score: Math.round(lowestRating.score * 100) / 100 }
        : null,
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

    const [ratingPillars, characterRatingPillars] = await Promise.all([
      prisma.ratingPillar.findMany({
        where: { userId },
        include: {
          pillar: { select: { type: true } },
          series: { select: { title: true, slug: true, imageUrl: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      }),
      prisma.characterRatingPillar.findMany({
        where: { userId },
        include: {
          pillar: { select: { type: true } },
          character: { select: { name: true, slug: true, posterUrl: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      }),
    ])

    const combined: RecentRating[] = [
      ...ratingPillars.map((rp) => ({
        id: rp.id,
        mediaType: "SERIES" as const,
        displayName: rp.series.title,
        slug: rp.series.slug,
        imageUrl: rp.series.imageUrl,
        pillarType: rp.pillar.type,
        score: Math.round(rp.score * 100) / 100,
        date: rp.updatedAt,
      })),
      ...characterRatingPillars.map((crp) => ({
        id: crp.id,
        mediaType: "CHARACTER" as const,
        displayName: crp.character.name,
        slug: crp.character.slug,
        imageUrl: crp.character.posterUrl,
        pillarType: crp.pillar.type,
        score: Math.round(crp.score * 100) / 100,
        date: crp.updatedAt,
      })),
    ]

    return combined.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit)
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

    // Apply cascade rules:
    // isSeen=true  → remove from watchlist and watching
    // isWatching=true → remove from watchlist
    const cascadeStatus = { ...status }
    if (status.isSeen === true) {
      cascadeStatus.isWatchlist = false
      cascadeStatus.isWatching = false
    } else if (status.isWatching === true) {
      cascadeStatus.isWatchlist = false
    }

    await prisma.userSeriesStatus.upsert({
      where: {
        userId_seriesId: { userId, seriesId },
      },
      update: {
        ...cascadeStatus,
        updatedAt: new Date(),
      },
      create: {
        userId,
        seriesId,
        isWatchlist: cascadeStatus.isWatchlist ?? false,
        isSeen: cascadeStatus.isSeen ?? false,
        isWatching: cascadeStatus.isWatching ?? false,
        isFavorite: cascadeStatus.isFavorite ?? false,
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

// ============================================
// USER SERIES LIST TYPES & ACTIONS
// ============================================

export type SeriesListStatus = "watchlist" | "seen" | "favorites" | "watching";

export interface SeriesListItem {
  id: string;
  seriesId: string;
  title: string;
  slug: string | null;
  imageUrl: string | null;
  score: number;
  genre: string[];
  releaseYear: number | null;
  addedAt: Date;
}

/**
 * Gets user's series by status (watchlist, seen, or favorites)
 */
export async function getUserSeriesByStatus(
  userId: string,
  status: SeriesListStatus
): Promise<SeriesListItem[]> {
  try {
    if (!userId) {
      return [];
    }

    const whereClause = {
      userId,
      ...(status === "watchlist" && { isWatchlist: true }),
      ...(status === "seen" && { isSeen: true }),
      ...(status === "favorites" && { isFavorite: true }),
      ...(status === "watching" && { isWatching: true }),
    };

    const statuses = await prisma.userSeriesStatus.findMany({
      where: whereClause,
      include: {
        series: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            score: true,
            genre: true,
            releaseYear: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return statuses.map((s) => ({
      id: s.id,
      seriesId: s.series.id,
      title: s.series.title,
      slug: s.series.slug,
      imageUrl: s.series.imageUrl,
      score: s.series.score,
      genre: s.series.genre,
      releaseYear: s.series.releaseYear,
      addedAt: s.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching user series by status:", error);
    return [];
  }
}
