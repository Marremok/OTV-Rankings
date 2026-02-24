"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, X, Check, Tv, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { quickSearchSeries } from "@/lib/actions/search"
import { quickSearchCharacters } from "@/lib/actions/search"
import type { FavoriteItem } from "@/lib/actions/favorites"

// ============================================
// PROPS
// ============================================

interface AddFavoriteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mediaType: "SERIES" | "CHARACTER"
  currentFavorites: FavoriteItem[]
  targetRank: number
  onConfirm: (mediaId: string, rank: number) => void
}

// ============================================
// COMPONENT
// ============================================

export function AddFavoriteDialog({
  open,
  onOpenChange,
  mediaType,
  currentFavorites,
  targetRank,
  onConfirm,
}: AddFavoriteDialogProps) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 300)

  const currentIds = new Set(currentFavorites.map((f) => f.mediaId))

  const { data: seriesResults = [], isLoading: isSeriesLoading } = useQuery({
    queryKey: ["addFavSearch", "series", debouncedQuery],
    queryFn: () => quickSearchSeries(debouncedQuery),
    enabled: open && mediaType === "SERIES" && debouncedQuery.length > 0,
    staleTime: 1000 * 60,
  })

  const { data: characterResults = [], isLoading: isCharLoading } = useQuery({
    queryKey: ["addFavSearch", "character", debouncedQuery],
    queryFn: () => quickSearchCharacters(debouncedQuery),
    enabled: open && mediaType === "CHARACTER" && debouncedQuery.length > 0,
    staleTime: 1000 * 60,
  })

  const isLoading = mediaType === "SERIES" ? isSeriesLoading : isCharLoading
  const results = mediaType === "SERIES" ? seriesResults : characterResults

  const handleSelect = (id: string) => {
    if (currentIds.has(id)) return
    onConfirm(id, targetRank)
    onOpenChange(false)
    setQuery("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setQuery("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">
            Add to Slot #{targetRank} —{" "}
            {mediaType === "SERIES" ? "Favorite Show" : "Favorite Character"}
          </h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 py-3 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              autoFocus
              type="text"
              placeholder={
                mediaType === "SERIES" ? "Search TV shows..." : "Search characters..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700/60 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!debouncedQuery && (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">
              Start typing to search...
            </div>
          )}

          {debouncedQuery && isLoading && (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">
              Searching...
            </div>
          )}

          {debouncedQuery && !isLoading && results.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">
              No results found
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="py-2">
              {results.map((result) => {
                const id = result.id
                const alreadyAdded = currentIds.has(id)
                const imageUrl =
                  mediaType === "SERIES"
                    ? (result as typeof seriesResults[0]).imageUrl
                    : (result as typeof characterResults[0]).posterUrl
                const title =
                  mediaType === "SERIES"
                    ? (result as typeof seriesResults[0]).title
                    : (result as typeof characterResults[0]).name
                const subtitle =
                  mediaType === "SERIES"
                    ? `${(result as typeof seriesResults[0]).releaseYear ?? ""}`
                    : (result as typeof characterResults[0]).seriesTitle

                return (
                  <li key={id}>
                    <button
                      onClick={() => handleSelect(id)}
                      disabled={alreadyAdded}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        alreadyAdded
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-zinc-800/60 cursor-pointer"
                      )}
                    >
                      {/* Poster thumbnail */}
                      <div className="w-9 h-12 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {mediaType === "CHARACTER" ? (
                              <User className="w-4 h-4 text-zinc-600" />
                            ) : (
                              <Tv className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{title}</p>
                        {subtitle && (
                          <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
                        )}
                      </div>

                      {/* Already added indicator */}
                      {alreadyAdded && (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
