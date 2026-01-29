"use client";

import { ArrowLeft, Calendar, Tv } from "lucide-react";
import Link from "next/link";

interface Series {
  title: string;
  ranking: number;
  releaseYear?: number | null;
  seasons?: number | null;
  genre?: string[];
  imageUrl?: string | null;
  wideImageUrl?: string | null;
}

interface HeroSectionProps {
  series: Series;
}

/**
 * HeroSection - Full-screen cinematic hero with series info
 * Features gradient overlays, subtle animations, and centered content
 */
export function HeroSection({ series }: HeroSectionProps) {
  const heroImage = series.wideImageUrl || series.imageUrl;

  return (
    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax-like depth */}
      <div className="absolute inset-0">
        {heroImage ? (
          <img
            src={heroImage}
            alt={series.title}
            className="h-full w-full object-cover object-center scale-105 transition-transform duration-[20s] hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-950 to-black" />
        )}

        {/* Multi-layer linear overlays for depth */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-zinc-950/40 via-transparent to-zinc-950/40" />
        <div className="absolute inset-0 bg-[radial-linear(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        {/* Subtle vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />
      </div>

      {/* Floating particles effect (subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back Button */}
      <Link
        href="/rankings/tv-series"
        className="absolute top-6 left-6 z-30 group flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 transition-all duration-300 hover:bg-black/50 hover:border-white/20 hover:scale-105"
      >
        <ArrowLeft className="h-4 w-4 text-white/70 group-hover:text-white transition-all duration-300 group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Back</span>
      </Link>

      {/* Centered Hero Content */}
      <div className="relative z-20 text-center px-6 max-w-6xl mx-auto">
        {/* Rank Badge */}
        {series.ranking > 0 && (
          <div className="inline-block mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <span className="relative z-10 bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold tracking-wide shadow-lg shadow-primary/25">
                #{series.ranking} Ranked
              </span>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl" />
            </div>
          </div>
        )}

        {/* Title with text shadow for depth */}
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          {series.title}
        </h1>

        {/* Meta Info Pills */}
        <div className="flex items-center justify-center gap-4 text-zinc-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {series.releaseYear && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{series.releaseYear}</span>
            </div>
          )}
          {series.seasons && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
              <Tv className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {series.seasons} {series.seasons === 1 ? "Season" : "Seasons"}
              </span>
            </div>
          )}
        </div>

        {/* Genres */}
        {series.genre && series.genre.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            {series.genre.map((g) => (
              <span
                key={g}
                className="px-4 py-1.5 bg-white/5 backdrop-blur-sm rounded-full text-sm text-zinc-300 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-zinc-950 to-transparent" />
    </section>
  );
}
