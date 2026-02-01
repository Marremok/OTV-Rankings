"use client";

import { Play, Tv, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUserCurrentlyWatching } from "@/hooks/use-user-profile";

// ============================================
// COMPONENT: Currently Watching Section
// ============================================

export interface CurrentlyWatchingSectionProps {
  userId: string | undefined;
}

export function CurrentlyWatchingSection({ userId }: CurrentlyWatchingSectionProps) {
  const { data: watchingList, isLoading } = useUserCurrentlyWatching(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          Currently Watching
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="shrink-0 w-32 h-48 rounded-xl bg-zinc-800/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Show placeholder if no series are being watched
  if (!watchingList || watchingList.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          Currently Watching
        </h2>
        <div className="relative rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-zinc-800/40 flex items-center justify-center">
              <Tv className="w-8 h-8 text-zinc-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-400 mb-1">
                Nothing here yet
              </h3>
              <p className="text-sm text-zinc-600">
                Series you're currently watching will appear here. Mark series as "Currently Watching" from any series page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Play className="w-5 h-5 text-primary" />
        Currently Watching
        <span className="text-sm font-normal text-zinc-500">
          ({watchingList.length})
        </span>
      </h2>

      {/* Horizontal scroll container */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700">
          {watchingList.map((series) => (
            <Link
              key={series.id}
              href={series.seriesSlug ? `/series/${series.seriesSlug}` : "#"}
              className="group shrink-0 w-32"
            >
              <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-800/60 group-hover:border-zinc-700/60 transition-all duration-300">
                {series.seriesImageUrl ? (
                  <img
                    src={series.seriesImageUrl}
                    alt={series.seriesName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Play indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground fill-current" />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-300 truncate group-hover:text-white transition-colors">
                {series.seriesName}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Placeholder Section
// ============================================

export interface PlaceholderSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  comingSoon?: boolean;
}

export function PlaceholderSection({
  icon: Icon,
  title,
  description,
  comingSoon = true,
}: PlaceholderSectionProps) {
  return (
    <div className="relative rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-8 text-center">
      <div className="absolute top-3 right-3">
        {comingSoon && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/60 text-xs text-zinc-500">
            <Lock className="w-3 h-3" />
            Coming Soon
          </span>
        )}
      </div>
      <div className="w-14 h-14 rounded-xl bg-zinc-800/40 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-400 mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 max-w-sm mx-auto">{description}</p>
    </div>
  );
}
