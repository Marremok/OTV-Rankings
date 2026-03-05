"use client";

import { BackToButton } from "@/components/navigation/BackToButton";

interface SeasonHeroProps {
  order: number;
  title?: string | null;
  heroImageUrl?: string | null;
}

export function SeasonHero({ order, title, heroImageUrl }: SeasonHeroProps) {
  const displayTitle = title ?? `Season ${order}`;

  return (
    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={displayTitle}
            className="h-full w-full object-cover object-center scale-105 transition-transform duration-[20s] hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-950 to-black" />
        )}

        {/* Multi-layer overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-zinc-950/40 via-transparent to-zinc-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Top nav */}
      <div className="absolute top-6 left-6 z-30">
        <BackToButton fallback="/rankings/seasons" fallbackLabel="Rankings" />
      </div>

      {/* Bottom-left content: title only */}
      <div className="absolute bottom-12 left-8 md:left-12 z-20 max-w-3xl">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {displayTitle}
        </h1>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-zinc-950 to-transparent" />
    </section>
  );
}
