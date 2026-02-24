"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Loader2,
  Film,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSeriesList, type SeriesListStatus } from "@/hooks/use-user-profile";
import type { SeriesListItem } from "@/lib/actions/user";

// ============================================
// TYPES
// ============================================

export interface SeriesListPageProps {
  status: SeriesListStatus;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  emptyTitle: string;
  emptyDescription: string;
}

// ============================================
// SERIES CARD COMPONENT
// ============================================

function SeriesCard({ series, index }: { series: SeriesListItem; index: number }) {
  return (
    <Link
      href={series.slug ? `/series/${series.slug}` : "#"}
      className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700/60 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Series Image */}
      {series.imageUrl ? (
        <img
          src={series.imageUrl}
          alt={series.title}
          className="w-16 h-24 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-24 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <Film className="w-6 h-6 text-zinc-600" />
        </div>
      )}

      {/* Series Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
          {series.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
          {series.releaseYear && <span>{series.releaseYear}</span>}
          {series.genre.length > 0 && (
            <>
              <span>•</span>
              <span className="truncate">{series.genre.slice(0, 2).join(", ")}</span>
            </>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60">
        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
        <span className="font-medium text-zinc-300">{series.score.toFixed(1)}</span>
      </div>
    </Link>
  );
}

// ============================================
// SERIES CARD SKELETON
// ============================================

function SeriesCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 animate-pulse"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-16 h-24 rounded-lg bg-zinc-800" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-zinc-800 rounded w-2/3" />
        <div className="h-4 bg-zinc-800 rounded w-1/2" />
      </div>
      <div className="w-16 h-8 bg-zinc-800 rounded-lg" />
    </div>
  );
}

// ============================================
// MAIN SERIES LIST PAGE COMPONENT
// ============================================

export function SeriesListPage({
  status,
  title,
  icon: Icon,
  iconColor,
  emptyTitle,
  emptyDescription,
}: SeriesListPageProps) {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const user = session?.user;

  // Fetch series list
  const { data: series, isLoading } = useUserSeriesList(user?.id, status);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isSessionPending && !user) {
      router.push("/");
    }
  }, [isSessionPending, user, router]);

  // Loading state for session
  if (isSessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-200 h-200 bg-primary/15 rounded-full blur-[140px] opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-200 h-200 bg-indigo-600/10 rounded-full blur-[160px] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {!isLoading && series && (
                  <p className="text-sm text-zinc-500">{series.length} series</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <SeriesCardSkeleton key={i} index={i} />
              ))}
            </div>
          )}

          {/* Series List */}
          {!isLoading && series && series.length > 0 && (
            <div className="space-y-3">
              {series.map((item, index) => (
                <SeriesCard key={item.id} series={item} index={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!series || series.length === 0) && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-zinc-900/60 flex items-center justify-center mx-auto mb-4">
                <Icon className={`w-8 h-8 ${iconColor} opacity-60`} />
              </div>
              <h3 className="text-lg font-semibold text-zinc-400 mb-2">{emptyTitle}</h3>
              <p className="text-sm text-zinc-600 mb-6 max-w-sm mx-auto">
                {emptyDescription}
              </p>
              <Link href="/rankings">
                <Button>Browse Rankings</Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
