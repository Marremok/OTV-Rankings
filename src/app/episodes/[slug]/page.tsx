"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Star, Tv, ImageIcon } from "lucide-react";
import { useGetEpisodeBySlug } from "@/hooks/use-episodes";
import { Skeleton } from "@/components/ui/skeleton";

export default function EpisodePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: episode, isLoading, error } = useGetEpisodeBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Skeleton className="w-full aspect-video" />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-4">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !episode) {
    notFound();
  }

  const series = episode.season?.series;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero image */}
      {episode.heroImageUrl ? (
        <div className="relative w-full aspect-video overflow-hidden max-h-[520px]">
          <img
            src={episode.heroImageUrl}
            alt={episode.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent" />
        </div>
      ) : (
        <div className="w-full aspect-video max-h-[400px] bg-zinc-900 flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-zinc-700" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 mb-6">
          <Link href="/" className="hover:text-zinc-100 transition-colors">Home</Link>
          <span>/</span>
          {series?.slug ? (
            <Link href={`/series/${series.slug}`} className="hover:text-zinc-100 transition-colors">
              {series.title}
            </Link>
          ) : (
            <span>{series?.title}</span>
          )}
          <span>/</span>
          {episode.season?.slug ? (
            <Link href={`/seasons/${episode.season.slug}`} className="hover:text-zinc-100 transition-colors">
              Season {episode.season.seasonNumber}
              {episode.season.name ? `: ${episode.season.name}` : ""}
            </Link>
          ) : (
            <span>Season {episode.season?.seasonNumber}</span>
          )}
          <span>/</span>
          <span className="text-zinc-100">{episode.title}</span>
        </nav>

        {/* Episode number badge */}
        <p className="text-sm text-primary font-medium mb-2">
          S{episode.season?.seasonNumber}E{episode.episodeNumber}
        </p>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold mb-4">{episode.title}</h1>

        {/* Score */}
        {episode.score > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <span className="text-xl font-bold">{episode.score.toFixed(1)}</span>
            <span className="text-zinc-400 text-sm">OTV Score</span>
          </div>
        )}

        {/* Description */}
        {episode.description && (
          <div className="border-t border-zinc-800 pt-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Synopsis</h2>
            <p className="text-zinc-300 leading-relaxed">{episode.description}</p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-zinc-800">
          {episode.season?.slug ? (
            <Link
              href={`/seasons/${episode.season.slug}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              ← Back to Season {episode.season.seasonNumber}
              {episode.season.name ? `: ${episode.season.name}` : ""}
            </Link>
          ) : series?.slug ? (
            <Link
              href={`/series/${series.slug}`}
              className="text-sm text-primary hover:underline"
            >
              ← Back to {series.title}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
