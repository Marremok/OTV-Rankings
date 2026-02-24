"use client"

import { ArrowRight, User } from "lucide-react"
import Link from "next/link"
import { useGetTop10Series, useGetTop10Characters } from "@/hooks/use-rankings"
import { getScoreColor } from "@/components/seriespage/pillar-utils"
import { cn } from "@/lib/utils"

// ── Skeleton card shown while data is loading ────────────────────────────────
function SkeletonCard() {
  return (
    <div className="w-36 sm:w-40 shrink-0">
      <div className="aspect-2/3 w-full rounded-xl bg-zinc-800/60 animate-pulse" />
      <div className="mt-3 px-1 space-y-2">
        <div className="h-4 bg-zinc-800/60 rounded animate-pulse w-full" />
        <div className="h-3 bg-zinc-800/60 rounded animate-pulse w-2/3" />
      </div>
    </div>
  )
}

// ── Section header with label + "View all" link ──────────────────────────────
function RankHeader({ label, title, href }: { label: string; title: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-1">{label}</p>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <Link
        href={href}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        View all
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function RankedPreview() {
  const { data: series = [], isLoading: seriesLoading } = useGetTop10Series()
  const { data: characters = [], isLoading: charsLoading } = useGetTop10Characters()

  return (
    <section className="py-20 px-6 border-t border-border/30">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ── Series ──────────────────────────────────────────────────────── */}
        <div>
          <RankHeader label="Series" title="Top Rated Shows" href="/rankings/tv-series" />

          {seriesLoading ? (
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : series.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No series ranked yet.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {series.slice(0, 6).map((s, index) => (
                <Link
                  key={s.id}
                  href={`/series/${s.slug}`}
                  className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-3"
                >
                  <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    <img
                      src={s.imageUrl ?? undefined}
                      alt={s.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    {/* Rank bookmark */}
                    <div className="absolute top-0 left-3">
                      <div className="flex h-8 w-6 items-center justify-center bg-primary shadow-md rounded-b-sm">
                        <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                      </div>
                    </div>
                    {/* Score badge */}
                    <div className="absolute bottom-2 right-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm ring-1 ring-black/5 dark:bg-black/90 dark:ring-white/10">
                        <span className={cn("text-xs font-bold", getScoreColor(s.score).text)}>
                          {s.score}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 px-1">
                    <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-primary/50">
                      {s.title}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {s.genre?.slice(0, 2).map((genre, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-tight bg-muted/80 text-muted-foreground border border-border/40 transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Characters ──────────────────────────────────────────────────── */}
        <div>
          <RankHeader label="Characters" title="Top Rated Characters" href="/rankings/characters" />

          {charsLoading ? (
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : characters.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No characters ranked yet.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {characters.slice(0, 6).map((c, index) => (
                <Link
                  key={c.id}
                  href={c.slug ? `/characters/${c.slug}` : "#"}
                  className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-3"
                >
                  <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    {c.posterUrl ? (
                      <img
                        src={c.posterUrl}
                        alt={c.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-zinc-900">
                        <User className="size-10 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    {/* Rank bookmark */}
                    <div className="absolute top-0 left-3">
                      <div className="flex h-8 w-6 items-center justify-center bg-primary shadow-md rounded-b-sm">
                        <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                      </div>
                    </div>
                    {/* Score badge */}
                    <div className="absolute bottom-2 right-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm ring-1 ring-black/5 dark:bg-black/90 dark:ring-white/10">
                        <span className={cn("text-xs font-bold", getScoreColor(c.score).text)}>
                          {c.score}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 px-1">
                    <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-primary/50">
                      {c.name}
                    </h3>
                    {c.series?.title && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-tight bg-muted/80 text-muted-foreground border border-border/40 transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20">
                        {c.series.title}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
