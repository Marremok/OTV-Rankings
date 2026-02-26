"use client"

import { useGetTop100Episodes } from "@/hooks/use-rankings"
import { Card } from "@/components/ui/card"
import { Loader2, Tv } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getScoreColor } from "@/components/seriespage/pillar-utils"

export default function EpisodesRankingPage() {
  const { data: episodes = [], isLoading, isError } = useGetTop100Episodes()

  return (
    <div className="relative min-h-screen bg-background text-foreground py-16 px-4 md:px-8 overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-200 h-200 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-150 h-150 rounded-full bg-primary/3 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>

      {/* Header */}
      <div className="relative max-w-5xl mx-auto mb-14">
        <div className="inline-block mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">
            Community Rankings
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-linear-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
          Top Episodes
        </h1>
        <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
          The highest-ranked episodes across all TV series as rated by our community.
        </p>
        <div className="mt-8 h-px w-full bg-linear-to-r from-primary/50 via-primary/20 to-transparent" />
      </div>

      {/* Episode list */}
      <div className="relative max-w-5xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          </div>
        )}

        {isError && (
          <p className="text-center text-destructive py-16">Failed to load episodes.</p>
        )}

        {!isLoading && !isError && episodes.length === 0 && (
          <p className="text-center text-muted-foreground py-16">No episodes have been ranked yet.</p>
        )}

        {!isLoading && !isError && episodes.length > 0 && (
          <div className="space-y-3">
            {episodes.map((episode, index) => {
              const seasonLabel = episode.season
                ? `S${String(episode.season.seasonNumber).padStart(2, "0")}E${String(episode.episodeNumber).padStart(2, "0")}`
                : `E${String(episode.episodeNumber).padStart(2, "0")}`
              const seriesTitle = (episode as any).season?.series?.title ?? null

              return (
                <Link
                  key={episode.id}
                  href={episode.slug ? `/episodes/${episode.slug}` : "#"}
                  className="group block"
                >
                  <Card className="relative flex w-full flex-row overflow-hidden border-none bg-linear-to-br from-primary/7 via-primary/4 to-background transition-all duration-700 hover:shadow-[0_0_80px_-20px_rgba(var(--primary-rgb),0.3)]">
                    {/* Rank number */}
                    <div className="flex w-8 sm:w-12 shrink-0 items-center justify-center border-r border-border/30">
                      <span className={cn(
                        "text-sm sm:text-lg font-black",
                        index === 0 && "text-yellow-400",
                        index === 1 && "text-zinc-300",
                        index === 2 && "text-amber-600",
                        index > 2 && "text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative aspect-video w-32 sm:w-40 shrink-0 overflow-hidden">
                      {episode.heroImageUrl ? (
                        <img
                          src={episode.heroImageUrl}
                          alt={episode.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                          <Tv className="h-8 w-8 text-zinc-700" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-3 min-w-0">
                      <h2 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {episode.title}
                      </h2>
                      <p className="text-sm text-muted-foreground truncate">
                        {seasonLabel}{seriesTitle ? ` · ${seriesTitle}` : ""}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 pr-4 shrink-0">
                      <div className={cn(
                        "flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 transition-colors",
                        getScoreColor(episode.score).border,
                      )}>
                        <span className={cn("text-lg font-black leading-none", getScoreColor(episode.score).text)}>
                          {episode.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
