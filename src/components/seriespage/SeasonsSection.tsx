"use client"

import { cn } from "@/lib/utils"
import { Layers, Star, Tv } from "lucide-react"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetSeasonsBySeries } from "@/hooks/use-seasons"

interface SeasonsSectionProps {
  seriesId: string
}

export function SeasonsSection({ seriesId }: SeasonsSectionProps) {
  const { data: seasons, isLoading } = useGetSeasonsBySeries(seriesId)

  if (isLoading) {
    return (
      <section className="px-4 md:px-8 lg:px-16 py-12 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold">Seasons</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[7.5rem] w-full rounded-xl" />
          ))}
        </div>
      </section>
    )
  }

  if (!seasons || seasons.length === 0) return null

  return (
    <section className="px-2 md:px-6 lg:px-12 py-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold">Seasons</h2>
        <span className="text-sm text-muted-foreground">({seasons.length})</span>
      </div>

      <Accordion type="multiple" className="space-y-6">
        {seasons.map((season) => (
          <AccordionItem
            key={season.id}
            value={season.id}
            className="group relative w-full border-none bg-transparent px-0"
          >
            {/* Outer glow effect on hover */}
            <div
              className={cn(
                "absolute -inset-1 rounded-3xl blur-xl transition-all duration-700 ease-out",
                "bg-primary/20",
                "opacity-0 scale-100 group-hover:opacity-40 group-hover:scale-[1.02]"
              )}
            />

            {/* Main card container */}
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl transition-all duration-500 ease-out",
                "border border-border/60 bg-card/60 backdrop-blur-md shadow-sm",
                "group-hover:scale-[1.015] group-hover:border-primary/50 group-hover:bg-card/95 group-hover:shadow-2xl"
              )}
            >
              {/* Gradient background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-10 transition-all duration-700" />

              {/* Corner accent highlights on hover */}
              <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 left-0 w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                <div className="absolute top-0 left-0 w-[2px] h-8 bg-gradient-to-b from-primary to-transparent" />
              </div>
              <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-gradient-to-l from-primary to-transparent" />
                <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-gradient-to-t from-primary to-transparent" />
              </div>

              {/* Trigger / Header */}
              <AccordionTrigger className="px-5 py-4 hover:no-underline relative z-10 w-full">
                <div className="flex flex-row items-center sm:items-start gap-4 sm:gap-6 w-full text-left">
                  
                  {/* Left section: Poster with glow & scale */}
                  <div className="relative shrink-0 transition-all duration-500 group-hover:scale-105">
                    <div className="absolute inset-0 rounded-xl blur-md bg-primary/20 opacity-0 group-hover:opacity-50 transition-all duration-500" />
                    <div className="relative h-20 w-14 sm:h-24 sm:w-16 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm z-10">
                      {season.posterUrl ? (
                        <img
                          src={season.posterUrl}
                          alt={season.title ?? `Season ${season.order}`}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle section: Title, episodes, description */}
                  <div className="flex-1 min-w-0 py-1">
                    <Link
                      href={season.slug ? `/seasons/${season.slug}` : "#"}
                      className={cn(
                        "text-lg sm:text-xl font-bold transition-colors duration-300 truncate block",
                        "text-foreground group-hover:text-primary"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {season.title ?? `Season ${season.order}`}
                    </Link>
                    
                    <div className="mt-1 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary transition-colors group-hover:bg-primary/20">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        {season.episodes.length} episode{season.episodes.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {season.description && (
                      <div className="overflow-hidden transition-all duration-500 ease-out max-h-10 group-hover:max-h-32">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-colors duration-300 group-hover:text-foreground/80 pr-4">
                          {season.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right section: Score badge */}
                  {season.score > 0 && (
                    <div className="shrink-0 flex items-center justify-center gap-2 mt-auto sm:mt-0 relative group/score">
                      <div className="absolute -inset-1.5 rounded-full blur-md bg-yellow-500/20 opacity-0 group-hover:opacity-40 transition-all duration-500" />
                      <div className="relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/80 backdrop-blur-sm ring-1 ring-border/50 group-hover:ring-yellow-500/50 group-hover:scale-110 transition-all duration-300 shadow-sm">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-500 text-yellow-500 mb-0.5" />
                        <span className="text-[13px] sm:text-sm font-black tabular-nums leading-none text-foreground group-hover:text-yellow-500 transition-colors">
                          {season.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionTrigger>

              {/* Accent lines that appear on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

              {/* Content (Episodes list) */}
              <AccordionContent className="px-0 pt-0 pb-0 relative z-10">
                <div className="border-t border-border/40 bg-background/40 backdrop-blur-sm">
                  {season.episodes.length === 0 ? (
                    <p className="px-6 py-6 text-sm text-muted-foreground text-center italic">No episodes added yet.</p>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {season.episodes.map((episode) => (
                        <Link
                          key={episode.id}
                          href={episode.slug ? `/episodes/${episode.slug}` : "#"}
                          className="flex items-center gap-4 sm:gap-5 px-5 sm:px-6 py-4 hover:bg-muted/30 transition-colors group/ep relative overflow-hidden"
                        >
                          {/* Hover highlight for episodes */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover/ep:scale-y-100 transition-transform origin-center duration-300" />

                          {/* 16:9 hero image */}
                          <div className="relative aspect-video w-28 sm:w-36 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/40 shadow-sm">
                            {episode.heroImageUrl ? (
                              <img
                                src={episode.heroImageUrl}
                                alt={episode.title}
                                className="h-full w-full object-cover group-hover/ep:scale-110 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Tv className="h-5 w-5 text-muted-foreground group-hover/ep:text-primary transition-colors" />
                              </div>
                            )}
                          </div>

                          {/* Episode info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold leading-snug truncate group-hover/ep:text-primary transition-colors">
                              {episode.title}
                            </p>
                            <p className="text-xs font-medium text-primary/80 mt-1">
                              S{season.order}E{episode.episodeNumber}
                            </p>
                            {episode.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2 group-hover/ep:text-foreground/70 transition-colors">
                                {episode.description}
                              </p>
                            )}
                          </div>

                          {/* Score */}
                          {episode.score > 0 && (
                            <div className="flex flex-col items-center gap-1 text-xs shrink-0 text-muted-foreground font-medium bg-background/60 px-2.5 py-1.5 rounded-md shadow-sm border border-border/40 group-hover/ep:border-yellow-500/30 transition-colors">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span>{episode.score.toFixed(1)}</span>
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
