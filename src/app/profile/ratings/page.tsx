"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Star,
  Clock,
  Loader2,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUserRecentRatings } from "@/hooks/use-user-profile";
import { RecentRatingCard, RecentRatingSkeleton } from "@/components/profile";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

export default function ProfileRatingsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Fetch all ratings (large limit to get all)
  const { data: ratings, isLoading } = useUserRecentRatings(user?.id, 100);

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

  if (!user) {
    return null;
  }

  // Sort ratings based on selected option
  const sortedRatings = ratings ? [...ratings].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "highest":
        return b.score - a.score;
      case "lowest":
        return a.score - b.score;
      default:
        return 0;
    }
  }) : [];

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest First",
    oldest: "Oldest First",
    highest: "Highest Score",
    lowest: "Lowest Score",
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative selection:bg-primary/30">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-200 h-200 bg-primary/15 rounded-full blur-[140px] opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-200 h-200 bg-indigo-600/10 rounded-full blur-[160px] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="py-8 px-6 border-b border-zinc-800/50">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Profile</span>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Clock className="w-8 h-8 text-primary" />
                  Your Ratings
                </h1>
                <p className="text-zinc-500 mt-2">
                  {ratings?.length ?? 0} ratings across all series
                </p>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                >
                  <Filter className="w-4 h-4" />
                  {sortLabels[sortBy]}
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    showSortMenu && "rotate-180"
                  )} />
                </Button>

                {showSortMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 py-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20">
                      {(Object.entries(sortLabels) as [SortOption, string][]).map(
                        ([value, label]) => (
                          <button
                            key={value}
                            onClick={() => {
                              setSortBy(value);
                              setShowSortMenu(false);
                            }}
                            className={cn(
                              "w-full px-4 py-2 text-left text-sm transition-colors",
                              sortBy === value
                                ? "bg-primary/10 text-primary"
                                : "text-zinc-300 hover:bg-zinc-800"
                            )}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Ratings list */}
        <main className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <RecentRatingSkeleton key={i} index={i} />
                ))}
              </div>
            )}

            {!isLoading && sortedRatings.length > 0 && (
              <div className="space-y-3">
                {sortedRatings.map((rating, index) => (
                  <RecentRatingCard key={rating.id} rating={rating} index={index} />
                ))}
              </div>
            )}

            {!isLoading && sortedRatings.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-16 text-center">
                <Star className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-zinc-400 mb-3">
                  No ratings yet
                </h3>
                <p className="text-zinc-600 mb-8 max-w-md mx-auto">
                  Start rating TV series to build your profile and track your
                  viewing history.
                </p>
                <Link href="/rankings">
                  <Button size="lg">Browse Rankings</Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
