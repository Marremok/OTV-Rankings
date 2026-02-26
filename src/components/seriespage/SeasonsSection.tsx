"use client"

import { ChevronDown, Layers, Star, Tv } from "lucide-react"
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
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Seasons</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </section>
    )
  }

  if (!seasons || seasons.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Seasons</h2>
        <span className="text-sm text-muted-foreground">({seasons.length})</span>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {seasons.map((season) => (
          <AccordionItem
            key={season.id}
            value={season.id}
            className="border rounded-lg overflow-hidden bg-card px-0"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-4 w-full pr-2">
                {/* Season poster */}
                {season.posterUrl ? (
                  <img
                    src={season.posterUrl}
                    alt={`Season ${season.seasonNumber}`}
                    className="h-14 w-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-14 w-10 items-center justify-center rounded bg-muted shrink-0">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 text-left min-w-0">
                  <Link
                    href={season.slug ? `/seasons/${season.slug}` : "#"}
                    className="font-semibold hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Season {season.seasonNumber}
                    {season.name ? `: ${season.name}` : ""}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {season.episodes.length} episode{season.episodes.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {season.score > 0 && (
                  <div className="flex items-center gap-1 text-sm shrink-0 mr-2">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    <span>{season.score.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-0 pt-0 pb-0">
              {season.episodes.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">No episodes added yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {season.episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={episode.slug ? `/episodes/${episode.slug}` : "#"}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      {/* Episode hero thumb */}
                      {episode.heroImageUrl ? (
                        <img
                          src={episode.heroImageUrl}
                          alt={episode.title}
                          className="h-10 w-16 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded bg-muted shrink-0">
                          <Tv className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{episode.title}</p>
                        <p className="text-xs text-muted-foreground">
                          S{season.seasonNumber}E{episode.episodeNumber}
                        </p>
                      </div>

                      {episode.score > 0 && (
                        <div className="flex items-center gap-1 text-xs shrink-0 text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span>{episode.score.toFixed(1)}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
