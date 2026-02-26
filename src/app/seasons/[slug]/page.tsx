"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Layers, Star, Tv, ChevronLeft, ImageIcon } from "lucide-react";
import { useGetSeasonBySlug } from "@/hooks/use-seasons";
import { Skeleton } from "@/components/ui/skeleton";

export default function SeasonPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: season, isLoading, error } = useGetSeasonBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          <Skeleton className="h-5 w-48 mb-8" />
          <div className="flex gap-6 mb-8">
            <Skeleton className="h-48 w-32 rounded-lg shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !season) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero image */}
      {season.heroImageUrl && (
        <div className="relative w-full aspect-[21/9] overflow-hidden">
          <img
            src={season.heroImageUrl}
            alt={`Season ${season.seasonNumber}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
          <Link href="/" className="hover:text-zinc-100 transition-colors">Home</Link>
          <span>/</span>
          {season.series?.slug ? (
            <Link href={`/series/${season.series.slug}`} className="hover:text-zinc-100 transition-colors">
              {season.series.title}
            </Link>
          ) : (
            <span>{season.series?.title}</span>
          )}
          <span>/</span>
          <span className="text-zinc-100">
            Season {season.seasonNumber}{season.name ? `: ${season.name}` : ""}
          </span>
        </nav>

        {/* Header */}
        <div className="flex gap-6 mb-10">
          {season.posterUrl ? (
            <img
              src={season.posterUrl}
              alt={`Season ${season.seasonNumber}`}
              className="h-48 w-32 rounded-lg object-cover shrink-0 shadow-lg"
            />
          ) : (
            <div className="flex h-48 w-32 items-center justify-center rounded-lg bg-zinc-800 shrink-0">
              <Layers className="h-10 w-10 text-zinc-600" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Season {season.seasonNumber}
              {season.name && (
                <span className="text-zinc-400 font-normal">: {season.name}</span>
              )}
            </h1>
            <Link
              href={season.series?.slug ? `/series/${season.series.slug}` : "#"}
              className="text-primary hover:underline text-sm mb-3 inline-block"
            >
              {season.series?.title}
            </Link>

            {season.score > 0 && (
              <div className="flex items-center gap-1.5 text-sm mb-3">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{season.score.toFixed(1)}</span>
                <span className="text-zinc-400">OTV Score</span>
              </div>
            )}

            {season.description && (
              <p className="text-zinc-300 text-sm leading-relaxed line-clamp-4">
                {season.description}
              </p>
            )}
          </div>
        </div>

        {/* Episode list */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tv className="h-5 w-5 text-primary" />
            Episodes
            <span className="text-sm font-normal text-zinc-400">({season.episodes.length})</span>
          </h2>

          {season.episodes.length === 0 ? (
            <p className="text-zinc-500 text-sm">No episodes added yet.</p>
          ) : (
            <div className="space-y-2">
              {season.episodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={episode.slug ? `/episodes/${episode.slug}` : "#"}
                  className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors"
                >
                  {episode.heroImageUrl ? (
                    <img
                      src={episode.heroImageUrl}
                      alt={episode.title}
                      className="h-12 w-20 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-20 items-center justify-center rounded bg-zinc-800 shrink-0">
                      <ImageIcon className="h-5 w-5 text-zinc-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{episode.title}</p>
                    <p className="text-xs text-zinc-400">
                      S{season.seasonNumber}E{episode.episodeNumber}
                    </p>
                  </div>

                  {episode.score > 0 && (
                    <div className="flex items-center gap-1 text-sm shrink-0">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      <span>{episode.score.toFixed(1)}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
