"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import {
  Calendar,
  Star,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Trophy,
  Loader2,
  User,
} from "lucide-react";
import {
  usePublicUserProfile,
  useUserProfileData,
} from "@/hooks/use-user-profile";

import {
  StatCard,
  CurrentlyWatchingSection,
  FavoriteSection,
  MediaListPreviewSection,
} from "@/components/profile";

// ============================================
// PUBLIC USER PROFILE PAGE
// ============================================

export default function PublicUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = use(params);

  // Fetch public profile data
  const { data: profile, isLoading: isProfileLoading, error } = usePublicUserProfile(userId);

  // Fetch user stats (public data)
  const { data: profileData, isLoading: isDataLoading } = useUserProfileData(userId);

  // Loading state
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // User not found
  if (!profile || error) {
    notFound();
  }

  // Computed values
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const displayImage = profile.profileImage || profile.image;
  const heroImage = profile.heroImage;
  const stats = profileData?.stats ?? null;

  const avgDisplay = stats && stats.avgScore > 0 ? stats.avgScore.toFixed(2) : "—";
  const highDisplay = stats?.highestRating ? stats.highestRating.score.toFixed(2) : "—";
  const lowDisplay = stats?.lowestRating ? stats.lowestRating.score.toFixed(2) : "—";

  return (
    <div className="min-h-screen bg-zinc-950 relative selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-200 h-200 bg-primary/15 rounded-full blur-[140px] opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-200 h-200 bg-indigo-600/10 rounded-full blur-[160px] opacity-60" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10">
        {/* Hero Banner */}
        <section className="relative h-64 md:h-80 overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        </section>

        {/* Profile Header */}
        <section className="relative -mt-16 md:-mt-20 px-6 pb-8 border-b border-zinc-800/50">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute -inset-2 rounded-full bg-linear-to-br from-primary/20 to-primary/5 blur-xl opacity-50" />
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-background shadow-xl">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{initials || <User className="w-12 h-12" />}</span>
                  )}
                </div>
              </div>

              {/* User info */}
              <div className="flex-1 pb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {profile.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Stats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Star}
                label="Total Ratings"
                value={stats?.totalRatings ?? 0}
                subtext="across all media"
                delay={0}
                isLoading={isDataLoading}
              />
              <StatCard
                icon={TrendingUp}
                label="Average Score"
                value={avgDisplay}
                subtext="mean rating"
                color="text-emerald-400"
                delay={100}
                isLoading={isDataLoading}
              />
              <StatCard
                icon={Trophy}
                label="Highest Rating"
                value={highDisplay}
                subtext={stats?.highestRating?.title ?? "No ratings yet"}
                color="text-amber-400"
                delay={200}
                isLoading={isDataLoading}
              />
              <StatCard
                icon={TrendingDown}
                label="Lowest Rating"
                value={lowDisplay}
                subtext={stats?.lowestRating?.title ?? "No ratings yet"}
                color="text-zinc-400"
                delay={300}
                isLoading={isDataLoading}
              />
            </div>
          </div>
        </section>

        {/* Currently Watching */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <CurrentlyWatchingSection userId={userId} isOwner={false} />
          </div>
        </section>

        {/* Favorite Shows */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <FavoriteSection userId={userId} isOwner={false} mediaType="SERIES" title="Favorite Shows" ownerName={profile.name} />
          </div>
        </section>

        {/* Favorite Characters */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <FavoriteSection userId={userId} isOwner={false} mediaType="CHARACTER" title="Favorite Characters" ownerName={profile.name} />
          </div>
        </section>

        {/* Seen */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <MediaListPreviewSection userId={userId} status="seen" title="Seen" isOwner={false} />
          </div>
        </section>

        {/* Watchlist */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <MediaListPreviewSection userId={userId} status="watchlist" title="Watchlist" isOwner={false} />
          </div>
        </section>
      </div>
    </div>
  );
}
