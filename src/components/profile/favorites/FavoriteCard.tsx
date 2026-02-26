"use client"

import Link from "next/link"
import { X, Plus, Tv, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FavoriteItem } from "@/lib/actions/favorites"
import { getScoreColor } from "@/components/seriespage/pillar-utils"

// ============================================
// HELPERS
// ============================================

/** * Refined version: Handles whitespace, empty strings, 
 * and follows the s/x/z rule. 
 */
function getPossessive(name: string): string {
  const firstName = name.trim().split(/\s+/)[0];

  if (!firstName) return "";

  // Check if the last character is s, x, or z
  const endsWithSibilant = /[sxz]$/i.test(firstName);

  return endsWithSibilant ? `${firstName}'` : `${firstName}'s`;
}

// ============================================
// RANK BADGE
// ============================================

function RankBadge({ rank }: { rank: number }) {
  const colors = [
    "bg-amber-400 text-black shadow-amber-500/40",
    "bg-zinc-300 text-black shadow-zinc-400/30",
    "bg-amber-700 text-white shadow-amber-800/40",
    "bg-zinc-600 text-white shadow-zinc-700/30",
  ]
  return (
    <div
      className={cn(
        "absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md",
        colors[rank - 1] ?? "bg-zinc-700 text-white"
      )}
    >
      {rank}
    </div>
  )
}

// ============================================
// SCORE BAR (below poster)
// ============================================

function ScoreBar({
  userScore,
  globalScore,
  ownerLabel,
}: {
  userScore: number | null
  globalScore: number
  ownerLabel: string
}) {
  const userColors = userScore !== null ? getScoreColor(userScore) : null
  const globalColors = getScoreColor(globalScore)

  return (
    <div className="flex items-center bg-zinc-900 border-t border-zinc-800 px-1.5 py-2">
      {userScore !== null && userColors ? (
        <>
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[7px] font-semibold text-zinc-500 uppercase tracking-widest leading-none">
              {ownerLabel} rating
            </span>
            <span className={cn("text-sm font-black tabular-nums leading-none", userColors.text)}>
              {userScore.toFixed(2)}
            </span>
          </div>
          <div className="w-px h-5 bg-zinc-700/60 shrink-0" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[7px] font-semibold text-zinc-500 uppercase tracking-widest leading-none">
              Global rating
            </span>
            <span className={cn("text-sm font-black tabular-nums leading-none", globalColors.text)}>
              {globalScore.toFixed(2)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[7px] font-semibold text-zinc-500 uppercase tracking-widest leading-none">
            Global
          </span>
          <span className={cn("text-sm font-black tabular-nums leading-none", globalColors.text)}>
            {globalScore.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================
// EMPTY SLOT SCORE BAR (placeholder)
// ============================================

function EmptyScoreBar() {
  return (
    <div className="flex items-center bg-zinc-900 border-t border-zinc-800 px-1.5 py-2">
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="h-1.5 w-5 rounded bg-zinc-800/80" />
        <div className="h-3.5 w-8 rounded bg-zinc-800/80" />
      </div>
      <div className="w-px h-5 bg-zinc-800 shrink-0" />
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="h-1.5 w-5 rounded bg-zinc-800/80" />
        <div className="h-3.5 w-8 rounded bg-zinc-800/80" />
      </div>
    </div>
  )
}

// ============================================
// FAVORITE CARD PROPS
// ============================================

export interface FavoriteCardProps {
  item: FavoriteItem | null
  rank: number
  isOwner: boolean
  isEditMode: boolean
  mediaType: "SERIES" | "CHARACTER"
  ownerName?: string
  onRemove?: (mediaId: string) => void
  onAddClick?: () => void
}

// ============================================
// FAVORITE CARD
// ============================================

export function FavoriteCard({
  item,
  rank,
  isOwner,
  isEditMode,
  mediaType,
  ownerName,
  onRemove,
  onAddClick,
}: FavoriteCardProps) {
  const href =
    item
      ? mediaType === "CHARACTER"
        ? item.slug ? `/characters/${item.slug}` : "#"
        : item.slug ? `/series/${item.slug}` : "#"
      : "#"

  const ownerLabel = isOwner
    ? "Your"
    : ownerName
    ? getPossessive(ownerName)
    : "Theirs"

  // Empty slot
  if (!item) {
    if (!isOwner || !isEditMode) return null

    return (
      <div
        className={cn(
          "rounded-xl overflow-hidden border-2 border-dashed border-zinc-700/60 bg-zinc-900/30",
          isOwner && isEditMode && "cursor-pointer hover:border-primary/60 hover:bg-zinc-800/40 transition-all duration-200"
        )}
        onClick={isOwner && isEditMode ? onAddClick : undefined}
      >
        <div className="relative aspect-2/3 flex flex-col items-center justify-center gap-2">
          <RankBadge rank={rank} />
          {isOwner && isEditMode ? (
            <>
              <Plus className="w-8 h-8 text-zinc-500" />
              <span className="text-xs text-zinc-500">Add</span>
            </>
          ) : (
            mediaType === "CHARACTER" ? (
              <User className="w-8 h-8 text-zinc-700" />
            ) : (
              <Tv className="w-8 h-8 text-zinc-700" />
            )
          )}
        </div>
        <EmptyScoreBar />
      </div>
    )
  }

  // Poster + score bar
  const cardInner = (
    <div className="flex flex-col">
      {/* Poster */}
      <div className="relative aspect-2/3 overflow-hidden group">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              !isEditMode && "group-hover:scale-105"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            {mediaType === "CHARACTER" ? (
              <User className="w-10 h-10 text-zinc-600" />
            ) : (
              <Tv className="w-10 h-10 text-zinc-600" />
            )}
          </div>
        )}

        {/* Rank badge */}
        <RankBadge rank={rank} />

        {/* Remove button (edit mode only) */}
        {isEditMode && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove?.(item.mediaId)
            }}
            className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {/* Score bar below poster */}
      <ScoreBar
        userScore={item.userScore}
        globalScore={item.globalScore}
        ownerLabel={ownerLabel}
      />
    </div>
  )

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/40 shadow-lg",
        isEditMode && "cursor-grab active:cursor-grabbing"
      )}
    >
      {isEditMode ? (
        <div className="w-full">{cardInner}</div>
      ) : (
        <Link href={href} className="block w-full">
          {cardInner}
        </Link>
      )}
    </div>
  )
}
