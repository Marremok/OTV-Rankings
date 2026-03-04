"use client";

import Link from "next/link";
import { ArrowLeft, ImageIcon, Star } from "lucide-react";

interface SeasonHeroProps {
  order: number;
  title?: string | null;
  description?: string | null;
  heroImageUrl?: string | null;
  score: number;
  series: {
    title: string;
    slug?: string | null;
  } | null;
}

export function SeasonHero({ order, title, description, heroImageUrl, score, series }: SeasonHeroProps) {
  const displayTitle = title ? `Season ${order}: ${title}` : `Season ${order}`;

  return (
    <div className="relative">
      {/* Hero image */}
      {heroImageUrl ? (
        <div className="relative w-full aspect-[21/9] overflow-hidden max-h-[520px]">
          <img
            src={heroImageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Overlaid content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10">
            <div className="max-w-5xl mx-auto">
              {/* Back link */}
              {series?.slug && (
                <Link
                  href={`/series/${series.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="size-4" />
                  {series.title}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 drop-shadow-lg">
                {displayTitle}
              </h1>

              {/* Score */}
              {score > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold text-white">{score.toFixed(2)}</span>
                  <span className="text-zinc-400 text-sm">OTV Score</span>
                </div>
              )}

              {/* Description */}
              {description && (
                <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-2xl line-clamp-3">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-[21/9] max-h-[300px] bg-zinc-900 flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-zinc-700" />
        </div>
      )}

      {/* Fallback header (no hero image) */}
      {!heroImageUrl && (
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
          {series?.slug && (
            <Link
              href={`/series/${series.slug}`}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="size-4" />
              {series.title}
            </Link>
          )}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            {displayTitle}
          </h1>
          {score > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-bold text-white">{score.toFixed(2)}</span>
              <span className="text-zinc-400 text-sm">OTV Score</span>
            </div>
          )}
          {description && (
            <p className="text-zinc-300 leading-relaxed max-w-2xl">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
