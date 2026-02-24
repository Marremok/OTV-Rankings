"use client"

import Link from "next/link"
import { Eye, List, Tv, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserSeriesList, type SeriesListStatus } from "@/hooks/use-user-profile"

// ============================================
// PROPS
// ============================================

interface MediaListPreviewSectionProps {
  userId: string | undefined
  status: "seen" | "watchlist"
  title: string
  viewAllHref?: string
  isOwner?: boolean
}

// ============================================
// COMPONENT
// ============================================

export function MediaListPreviewSection({
  userId,
  status,
  title,
  viewAllHref,
  isOwner = true,
}: MediaListPreviewSectionProps) {
  const { data: series, isLoading } = useUserSeriesList(userId, status as SeriesListStatus)

  const TitleIcon = status === "seen" ? Eye : List
  const iconColor = status === "seen" ? "text-emerald-400" : "text-blue-400"

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TitleIcon className={cn("w-5 h-5", iconColor)} />
            {title}
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-hidden">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="shrink-0 w-20 aspect-2/3 rounded-lg bg-zinc-800/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (!series || series.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TitleIcon className={cn("w-5 h-5", iconColor)} />
            {title}
          </h2>
        </div>
        <div className="rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/40 flex items-center justify-center shrink-0">
              <Tv className="w-6 h-6 text-zinc-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Nothing here yet</p>
              <p className="text-xs text-zinc-600 mt-0.5">
                {isOwner
                  ? status === "seen"
                    ? "Mark series as seen to track what you've finished."
                    : "Add series to your watchlist for later."
                  : "Nothing added here yet."}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const preview = series.slice(0, 6)

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <TitleIcon className={cn("w-5 h-5", iconColor)} />
          {title}
          <span className="text-sm font-normal text-zinc-500">({series.length})</span>
        </h2>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Show all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Poster row */}
      <div className="flex gap-3">
        {preview.map((item) => (
          <Link
            key={item.id}
            href={item.slug ? `/series/${item.slug}` : "#"}
            className="group shrink-0 w-20"
          >
            <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-800/60 group-hover:border-zinc-600/60 transition-all duration-300">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tv className="w-5 h-5 text-zinc-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <p className="mt-1.5 text-xs font-medium text-zinc-400 truncate group-hover:text-zinc-200 transition-colors">
              {item.title}
            </p>
          </Link>
        ))}

        {/* "Show all" overflow tile if more than 6 */}
        {series.length > 6 && viewAllHref && (
          <Link
            href={viewAllHref}
            className="shrink-0 w-20 flex flex-col items-center justify-center"
          >
            <div className="relative aspect-2/3 w-full rounded-lg border border-dashed border-zinc-700/60 bg-zinc-900/30 flex items-center justify-center hover:border-zinc-600/60 hover:bg-zinc-800/40 transition-all duration-200">
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-400">+{series.length - 6}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">more</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
