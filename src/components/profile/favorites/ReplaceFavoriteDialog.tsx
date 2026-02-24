"use client"

import { X, Tv } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FavoriteItem } from "@/lib/actions/favorites"
import { useSetUserFavorite } from "@/hooks/use-favorites"

// ============================================
// RANK BADGE (inline — keep component self-contained)
// ============================================

function RankBadge({ rank }: { rank: number }) {
  const colors = [
    "bg-amber-500/90 text-black",
    "bg-zinc-400/90 text-black",
    "bg-amber-700/90 text-white",
    "bg-zinc-600/90 text-white",
  ]
  return (
    <div
      className={cn(
        "absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md",
        colors[rank - 1] ?? "bg-zinc-700/90 text-white"
      )}
    >
      {rank}
    </div>
  )
}

// ============================================
// PROPS
// ============================================

interface ReplaceFavoriteDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  newSeriesId: string
  newSeriesTitle: string
  currentFavorites: FavoriteItem[]
  onReplaceComplete?: () => void
}

// ============================================
// COMPONENT
// ============================================

export function ReplaceFavoriteDialog({
  isOpen,
  onClose,
  userId,
  newSeriesId,
  newSeriesTitle,
  currentFavorites,
  onReplaceComplete,
}: ReplaceFavoriteDialogProps) {
  const setFavorite = useSetUserFavorite()

  const handleReplace = async (rankToReplace: number) => {
    await setFavorite.mutateAsync({
      userId,
      mediaType: "SERIES",
      rank: rankToReplace,
      mediaId: newSeriesId,
    })
    onReplaceComplete?.()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white">Replace a Favorite</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pick one to replace with{" "}
              <span className="text-zinc-300 font-medium">{newSeriesTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current favorites grid */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {currentFavorites.map((fav) => (
              <button
                key={fav.id}
                onClick={() => handleReplace(fav.rank)}
                disabled={setFavorite.isPending}
                className={cn(
                  "group relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/40",
                  "hover:border-primary/60 hover:scale-105 transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
              >
                <RankBadge rank={fav.rank} />
                {fav.imageUrl ? (
                  <img
                    src={fav.imageUrl}
                    alt={fav.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="w-5 h-5 text-zinc-600" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-linear-to-t from-black/90 to-transparent">
                  <p className="text-[9px] font-medium text-white/90 truncate leading-tight">
                    {fav.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 text-center mt-3">
            Tap a favorite to replace it
          </p>
        </div>
      </div>
    </div>
  )
}
