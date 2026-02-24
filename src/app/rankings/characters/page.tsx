"use client"

import { useGetTop100Characters } from "@/hooks/use-rankings"
import { useGetUserRatingsForMultipleCharacters, useGetPillarCount } from "@/hooks/use-pillars"
import { useSession } from "@/lib/auth-client"
import { Card } from "@/components/ui/card"
import { ChevronRight, Loader2, User, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { mediaType } from "@/generated/prisma/enums"
import { useMemo } from "react"
import { getScoreColor } from "@/components/seriespage/pillar-utils"

function calculateWeightedSum(ratings: { score: number; pillar: { weight: number } }[]) {
  if (!ratings.length) return 0
  let weightedSum = 0
  let totalWeight = 0
  for (const rating of ratings) {
    weightedSum += rating.score * rating.pillar.weight
    totalWeight += rating.pillar.weight
  }
  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 100) / 100
}

export default function CharactersRankingPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const { data: characters = [], isLoading, isError } = useGetTop100Characters()
  const { data: totalPillarCount = 0 } = useGetPillarCount(mediaType.CHARACTER)

  const characterIds = useMemo(() => characters.map(c => c.id), [characters])
  const { data: userRatingsMap = {} } = useGetUserRatingsForMultipleCharacters(userId, characterIds)

  return (
    <div className="relative min-h-screen bg-background text-foreground py-16 px-4 md:px-8 overflow-hidden">
      {/* Background effects — same as TV Series page */}
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
          Top Characters
        </h1>
        <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
          The highest-ranked characters across all TV series as rated by our community.
        </p>
        <div className="mt-8 h-px w-full bg-linear-to-r from-primary/50 via-primary/20 to-transparent" />
      </div>

      {/* Character list */}
      <div className="relative max-w-5xl mx-auto">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin size-6" />
          </div>
        )}

        {isError && (
          <p className="text-destructive py-16 text-center">Failed to load characters.</p>
        )}

        {!isLoading && !isError && characters.length === 0 && (
          <p className="text-muted-foreground py-16 text-center">No characters ranked yet.</p>
        )}

        {characters.length > 0 && (
          <div className="flex flex-col gap-6">
            {characters.map((c, index) => (
              <Card
                key={c.id}
                className="group relative flex w-full flex-row overflow-hidden border-none bg-linear-to-br from-primary/7 via-primary/4
                  to-background transition-all duration-700 hover:shadow-[0_0_80px_-20px_rgba(var(--primary-rgb),0.3)] h-44 sm:h-56 md:h-auto md:min-h-55"
              >
                {/* Neon edge — color-coded by score */}
                <div className={cn(
                  "absolute left-0 top-0 h-full w-0.75 scale-y-0 transition-transform duration-500 group-hover:scale-y-100 shadow-[0_0_15px_currentcolor]",
                  getScoreColor(c.score).neon
                )} />

                {/* LEFT: Poster */}
                <Link href={c.slug ? `/characters/${c.slug}` : "#"} className="relative w-24 sm:w-36 md:w-44 shrink-0 overflow-hidden">
                  {c.posterUrl ? (
                    <img
                      src={c.posterUrl}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-[2s] cubic-bezier(0.2, 1, 0.2, 1) group-hover:scale-110 group-hover:rotate-1"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                      <User className="size-14 text-zinc-700" />
                    </div>
                  )}

                  {/* Rank badge */}
                  <div className="absolute left-0 top-0 z-30">
                    <div className="relative flex h-12 w-16 items-center justify-center overflow-hidden border-b border-r border-white/20 bg-black/60 backdrop-blur-xl">
                      <span className="relative z-10 font-mono text-xl font-black italic tracking-tighter text-white">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="absolute inset-0 bg-linear-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse" />
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
                </Link>

                {/* RIGHT: Content */}
                <div className="relative flex flex-1 flex-col justify-between p-4 md:p-8 lg:p-10">
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-[0.03] pointer-events-none bg-[grid-white_20px]" />

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Link href={c.slug ? `/characters/${c.slug}` : "#"} className="block">
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extralight tracking-tighter text-zinc-100 transition-all duration-700 group-hover:text-white group-hover:translate-x-1 hover:underline decoration-primary/50 underline-offset-4">
                          {c.name}
                        </h3>
                      </Link>

                      {/* Series tag */}
                      {c.series?.title && (
                        <div className="hidden sm:flex flex-wrap gap-4">
                          <Link href={c.series.slug ? `/series/${c.series.slug}` : "#"} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 transition-colors group-hover:text-primary hover:text-primary">
                            // {c.series.title}
                          </Link>
                        </div>
                      )}
                    </div>

                    <p className="hidden sm:block max-w-2xl line-clamp-2 text-sm font-light leading-relaxed text-zinc-500 transition-colors duration-500 group-hover:text-zinc-400">
                      {c.description || "Character details coming soon."}
                    </p>
                  </div>

                  {/* Bottom bar: score + CTA */}
                  <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-4 md:pt-8">
                    <div className="flex flex-wrap gap-4 md:gap-8 lg:gap-16">
                      {/* OTV-Score */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 animate-pulse">OTV-Score</span>
                        <div className="flex items-baseline gap-2">
                          <span className={cn(
                            "text-3xl md:text-5xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                            getScoreColor(c.score).text
                          )}>
                            {c.score.toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-zinc-800 tracking-tighter italic">/ 10.00</span>
                        </div>
                      </div>

                      {/* USER RATING STATUS */}
                      {(() => {
                        const userRatings = userRatingsMap[c.id] || []
                        const ratedCount = userRatings.length
                        const hasRatedAll = ratedCount >= totalPillarCount && totalPillarCount > 0
                        const hasRatedSome = ratedCount > 0 && !hasRatedAll
                        const userScore = calculateWeightedSum(userRatings)

                        if (ratedCount === 0) {
                          return (
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Rate Yourself</span>
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-zinc-900/50 text-zinc-500 transition-all duration-500 group-hover:border-primary/40 group-hover:text-primary group-hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                                <Star className="h-6 w-6" />
                              </div>
                            </div>
                          )
                        }

                        if (hasRatedSome) {
                          return (
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/70">Current rating</span>
                              <div className="flex items-center gap-3">
                                <span className={cn("text-3xl md:text-5xl font-black tracking-tighter tabular-nums", getScoreColor(userScore).text)}>
                                  {userScore.toFixed(2)}
                                </span>
                                <Link href={c.slug ? `/characters/${c.slug}` : "#"}>
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-900/20 text-amber-500 transition-all duration-500 group-hover:border-amber-500/40 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                    <Star className="h-5 w-5" />
                                  </div>
                                </Link>
                              </div>
                              <span className="text-[10px] font-medium text-amber-500/60">Finish your rating</span>
                            </div>
                          )
                        }

                        return (
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/70">Your rating</span>
                            <div className="flex items-center gap-3">
                              <span className={cn("text-3xl md:text-5xl font-black tracking-tighter tabular-nums", getScoreColor(userScore).text)}>
                                {userScore.toFixed(2)}
                              </span>
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-900/20 text-emerald-500">
                                <Star className="h-5 w-5 fill-emerald-500" />
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* CTA */}
                    <Link
                      href={c.slug ? `/characters/${c.slug}` : "#"}
                      className="hidden sm:flex group/btn relative items-center gap-2 md:gap-4 overflow-hidden rounded-full bg-white px-4 md:px-8 py-2 md:py-3 transition-all duration-500 hover:bg-primary hover:text-white"
                    >
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black group-hover/btn:text-white">
                        More Info
                      </span>
                      <div className="hidden md:block h-px w-8 bg-black/20 group-hover/btn:bg-white/40" />
                      <ChevronRight className="h-5 w-5 text-black group-hover/btn:text-white transition-transform group-hover/btn:translate-x-1" />
                      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
