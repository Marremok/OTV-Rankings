"use client"

import { ArrowRight, LucideIcon, Loader2, User, Layers, ImageIcon } from "lucide-react";
import { Card, CardContent, CardTitle } from "../ui/card";
import Link from "next/link";
import { useGetTop10Series, useGetTop10Characters, useGetTop10Seasons, useGetTop10Episodes } from "@/hooks/use-rankings";
import { cn } from "@/lib/utils";
import { getScoreColor } from "@/components/seriespage/pillar-utils";

export type RankingType = "series" | "characters" | "seasons" | "episodes";

type SectionHeaderProps = {
  title: string
  icon: LucideIcon
  slug: string
  rankingType: RankingType
}

const TYPE_LABELS: Record<RankingType, string> = {
  series: "series",
  characters: "characters",
  seasons: "seasons",
  episodes: "episodes",
};

// ============================================
// Shared "View All" arrow card — reused by every section
// ============================================
function ViewAllCard({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center shrink-0 w-36 sm:w-40 rounded-xl border border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group/viewall"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover/viewall:bg-primary/20 transition-colors">
        <ArrowRight className="size-7 text-primary transition-transform group-hover/viewall:translate-x-1" />
      </div>
      <span className="mt-3 text-sm font-semibold text-muted-foreground group-hover/viewall:text-primary transition-colors">
        View All
      </span>
    </Link>
  );
}

export default function RankingSection({ title, icon: Icon, slug, rankingType }: SectionHeaderProps) {
  const {
    data: series = [],
    isLoading: seriesLoading,
    isError: seriesError,
  } = useGetTop10Series();

  const {
    data: characters = [],
    isLoading: charactersLoading,
    isError: charactersError,
  } = useGetTop10Characters();

  const {
    data: seasons = [],
    isLoading: seasonsLoading,
    isError: seasonsError,
  } = useGetTop10Seasons();

  const {
    data: episodes = [],
    isLoading: episodesLoading,
    isError: episodesError,
  } = useGetTop10Episodes();

  const isSeriesType = rankingType === "series";
  const isCharactersType = rankingType === "characters";
  const isSeasonsType = rankingType === "seasons";
  const isEpisodesType = rankingType === "episodes";

  return (
    <Card className="bg-background border-none w-full mb-3">
      <div className="inline-flex items-center justify-between bg-linear-to-br from-primary/7 via-primary/4
      to-background rounded-4xl border border-primary/10 w-fit p-3">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <Icon />
          {title}
        </CardTitle>
        <div className="pl-10 items-end">
          <Link href={`/rankings/${slug}`} className="inline-flex gap-2">
            View All
            <ArrowRight />
          </Link>
        </div>
      </div>
      <CardContent>
        {/* ─── SERIES ─── */}
        {isSeriesType && seriesLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {isSeriesType && seriesError && (
          <p className="text-destructive py-8 text-center">Failed to load series.</p>
        )}
        {isSeriesType && !seriesLoading && !seriesError && series.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">No series added yet</p>
        )}
        {isSeriesType && series.length > 0 && (
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {series.slice(0, 6).map((s, index) => (
              <Link
                key={s.id}
                href={`/series/${s.slug}`}
                className="group relative w-36 sm:w-40 shrink-0 cursor-pointer flex flex-col gap-3"
              >
                <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-250 group-hover:shadow-lg group-hover:-translate-y-0.4">
                  <img
                    src={s.imageUrl ?? undefined}
                    alt={s.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

                  {/* Ranking bookmark */}
                  <div className="absolute top-0 left-3">
                    <div className="relative flex h-8 w-6 items-center justify-center bg-primary shadow-md rounded-b-sm">
                      <span className="text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="absolute bottom-2 right-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm ring-1 ring-black/5 dark:bg-black/90 dark:ring-white/10">
                      <span className={cn("text-xs font-bold transition-colors", getScoreColor(s.score).text)}>
                        {s.score}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 px-1">
                  <h3 className="text-me font-semibold leading-tight text-foreground line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-primary/50">
                    {s.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {s.genre?.slice(0, 2).map((genre, i) => (
                      <span
                        key={i}
                        className="
                          inline-flex items-center
                          px-1.5 py-0.5
                          rounded-md
                          text-[10px] font-semibold tracking-tight
                          bg-muted/80 text-muted-foreground
                          dark:bg-secondary/40 dark:text-secondary-foreground
                          border border-border/40
                          backdrop-blur-[2px]
                          transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20
                        "
                      >
                        {genre}
                      </span>
                    ))}
                    {s.genre?.length > 2 && (
                      <span className="text-[10px] text-muted-foreground/60 self-center ml-0.5">
                        +{s.genre.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            <ViewAllCard href={`/rankings/${slug}`} />
          </div>
        )}

        {/* ─── CHARACTERS ─── */}
        {isCharactersType && charactersLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {isCharactersType && charactersError && (
          <p className="text-destructive py-8 text-center">Failed to load characters.</p>
        )}
        {isCharactersType && !charactersLoading && !charactersError && characters.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">No characters added yet</p>
        )}
        {isCharactersType && characters.length > 0 && (
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {characters.slice(0, 6).map((c, index) => (
              <Link
                key={c.id}
                href={c.slug ? `/characters/${c.slug}` : "#"}
                className="group relative w-36 sm:w-40 shrink-0 cursor-pointer flex flex-col gap-3"
              >
                {/* Image container — same structure as series */}
                <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-250 group-hover:shadow-lg group-hover:-translate-y-0.4">
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

                  {/* Ranking bookmark */}
                  <div className="absolute top-0 left-3">
                    <div className="relative flex h-8 w-6 items-center justify-center bg-primary shadow-md rounded-b-sm">
                      <span className="text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Ranking score badge */}
                  <div className="absolute bottom-2 right-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm ring-1 ring-black/5 dark:bg-black/90 dark:ring-white/10">
                      <span className={cn("text-xs font-bold transition-colors", getScoreColor(c.score).text)}>
                        {c.score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name & series label */}
                <div className="space-y-1 px-1">
                  <h3 className="text-me font-semibold leading-tight text-foreground line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-primary/50">
                    {c.name}
                  </h3>
                  {c.series?.title && (
                    <span
                      className="
                        inline-flex items-center
                        px-1.5 py-0.5
                        rounded-md
                        text-[10px] font-semibold tracking-tight
                        bg-muted/80 text-muted-foreground
                        dark:bg-secondary/40 dark:text-secondary-foreground
                        border border-border/40
                        backdrop-blur-[2px]
                        transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20
                      "
                    >
                      {c.series.title}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            <ViewAllCard href={`/rankings/${slug}`} />
          </div>
        )}

        {/* ─── SEASONS ─── */}
        {isSeasonsType && seasonsLoading && (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        )}
        {isSeasonsType && seasonsError && (
          <p className="text-destructive py-8 text-center">Failed to load seasons.</p>
        )}
        {isSeasonsType && !seasonsLoading && !seasonsError && seasons.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">No seasons added yet</p>
        )}
        {isSeasonsType && seasons.length > 0 && (
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {seasons.slice(0, 6).map((s, index) => (
              <Link
                key={s.id}
                href={s.slug ? `/seasons/${s.slug}` : "#"}
                className="group relative w-36 sm:w-40 shrink-0 cursor-pointer flex flex-col gap-3"
              >
                <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-250 group-hover:shadow-lg group-hover:-translate-y-0.4">
                  {s.posterUrl ? (
                    <img src={s.posterUrl} alt={`Season ${s.order}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-900">
                      <Layers className="size-10 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  <div className="absolute top-0 left-3">
                    <div className="relative flex h-8 w-6 items-center justify-center bg-primary shadow-md rounded-b-sm">
                      <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm ring-1 ring-black/5 dark:bg-black/90 dark:ring-white/10">
                      <span className={cn("text-xs font-bold transition-colors", getScoreColor(s.score).text)}>{s.score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 px-1">
                  <h3 className="text-me font-semibold leading-tight text-foreground line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-primary/50">
                    Season {s.order}{s.title ? `: ${s.title}` : ""}
                  </h3>
                  {(s as any).series?.title && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-tight bg-muted/80 text-muted-foreground dark:bg-secondary/40 dark:text-secondary-foreground border border-border/40 transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20">
                      {(s as any).series.title}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            <ViewAllCard href={`/rankings/${slug}`} />
          </div>
        )}

        {/* ─── EPISODES ─── */}
        {isEpisodesType && episodesLoading && (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        )}
        {isEpisodesType && episodesError && (
          <p className="text-destructive py-8 text-center">Failed to load episodes.</p>
        )}
        {isEpisodesType && !episodesLoading && !episodesError && episodes.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">No episodes added yet</p>
        )}
        {isEpisodesType && episodes.length > 0 && (
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {episodes.slice(0, 6).map((e, index) => (
              <Link
                key={e.id}
                href={e.slug ? `/episodes/${e.slug}` : "#"}
                className="group relative w-48 sm:w-56 shrink-0 cursor-pointer flex flex-col gap-3"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-250 group-hover:shadow-lg group-hover:-translate-y-0.4">
                  {e.heroImageUrl ? (
                    <img src={e.heroImageUrl} alt={e.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-900">
                      <ImageIcon className="size-8 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  <div className="absolute top-0 left-3">
                    <div className="relative flex h-8 w-6 items-center justify-center bg-primary shadow-md rounded-b-sm">
                      <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm ring-1 ring-black/5 dark:bg-black/90 dark:ring-white/10">
                      <span className={cn("text-xs font-bold transition-colors", getScoreColor(e.score).text)}>{e.score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 px-1">
                  <h3 className="text-me font-semibold leading-tight text-foreground line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-primary/50">
                    {e.title}
                  </h3>
                  {(e as any).season && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-tight bg-muted/80 text-muted-foreground dark:bg-secondary/40 dark:text-secondary-foreground border border-border/40 transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20">
                      S{(e as any).season.order}E{e.episodeNumber} · {(e as any).season.series?.title}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            <ViewAllCard href={`/rankings/${slug}`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
